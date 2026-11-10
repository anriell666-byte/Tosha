/* Тоша — service worker: офлайн-кэш, уведомления, фоновая проверка (если Android разрешит) */
importScripts('core.js');

const CACHE = 'tosha-v12';
const ASSETS = ['./', 'index.html', 'core.js', 'pets.js', 'anim.js', 'app.js', 'manifest.webmanifest',
  'icon-96.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала кэш (быстро и офлайн), в фоне обновляем
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || Response.error();
  })());
});

// Фоновая проверка: Chrome на Android вызывает её сам и не чаще раза в несколько часов
self.addEventListener('periodicsync', e => {
  if (e.tag === 'tosha-check') e.waitUntil(backgroundCheck());
});

async function backgroundCheck() {
  if (self.Notification && Notification.permission !== 'granted') return;
  const snap = await ToshaCore.idbGet('snapshot');
  if (!snap) return;
  const now = new Date(), key = ToshaCore.dayKey(now);
  if (snap.dayKey !== key) { snap.dayKey = key; snap.mealsLogged = {}; snap.kcal = 0; snap.notifToday = []; }
  const due = ToshaCore.computeDue(snap, now);
  if (!due) return;
  await self.registration.showNotification(due.title, ToshaCore.notifOptions(due, snap.settings));
  ToshaCore.markFired(snap, due, now);
  snap.fired = ToshaCore.pruneFired(snap.fired, now.getTime());
  await ToshaCore.idbSet('snapshot', snap);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const d = e.notification.data || {};
  const qs = new URLSearchParams({ from: d.kind || '', meal: d.mealId || '', quest: d.questId || '' }).toString();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) { await c.focus(); c.postMessage(Object.assign({ type: 'nav' }, d)); return; }
    }
    await self.clients.openWindow('./?' + qs);
  })());
});
