/* Тоша — общая логика (работает и в приложении, и в service worker, и в Node для тестов) */
(function (root) {
  'use strict';

  const pad = n => String(n).padStart(2, '0');
  const dayKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const toMin = hhmm => { const p = String(hhmm).split(':').map(Number); return p[0] * 60 + (p[1] || 0); };
  const minutesOf = d => d.getHours() * 60 + d.getMinutes();

  function isQuiet(min, qs, qe) {
    const s = toMin(qs), e = toMin(qe);
    if (s === e) return false;
    return s > e ? (min >= s || min < e) : (min >= s && min < e);
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const pick = (arr, seed) => arr[hash(String(seed)) % arr.length];

  /* ---------- Задания ---------- */
  const QUESTS = [
    { id: 'stretch',   emoji: '🙆', text: 'Потянись вверх и в стороны',                          dur: '30 сек', xp: 8 },
    { id: 'squats',    emoji: '🦵', text: '10 приседаний, не спеша',                              dur: '1 мин',  xp: 10 },
    { id: 'walk5',     emoji: '🚶', text: 'Пройдись 5 минут: по комнате, коридору или двору',     dur: '5 мин',  xp: 12 },
    { id: 'water',     emoji: '💧', text: 'Выпей стакан воды',                                    dur: '1 мин',  xp: 5, water: true },
    { id: 'stairs',    emoji: '🪜', text: 'Поднимись по лестнице на пару пролётов',               dur: '2 мин',  xp: 12 },
    { id: 'jacks',     emoji: '🤸', text: '20 прыжков «звёздочка»',                               dur: '1 мин',  xp: 12 },
    { id: 'plank',     emoji: '🧱', text: 'Планка 20 секунд (можно с колен)',                     dur: '1 мин',  xp: 12 },
    { id: 'shoulders', emoji: '🔄', text: 'Покрути плечами и шеей',                               dur: '1 мин',  xp: 6 },
    { id: 'wallpush',  emoji: '🙌', text: '10 отжиманий от стены',                                dur: '1 мин',  xp: 10 },
    { id: 'calves',    emoji: '🦶', text: '15 подъёмов на носки, пока закипает чайник',           dur: '1 мин',  xp: 8 },
    { id: 'dance',     emoji: '💃', text: 'Включи любимую песню и потанцуй',                      dur: '3 мин',  xp: 15 },
    { id: 'breathe',   emoji: '🪟', text: 'Подойди к окну и сделай 5 глубоких вдохов',            dur: '1 мин',  xp: 6 },
    { id: 'lunges',    emoji: '🏃', text: '8 выпадов на каждую ногу',                             dur: '2 мин',  xp: 12 },
    { id: 'march',     emoji: '🥁', text: 'Маршируй на месте минуту',                             dur: '1 мин',  xp: 8 },
    { id: 'wrists',    emoji: '🤲', text: 'Разомни кисти и запястья',                             dur: '1 мин',  xp: 5 },
    { id: 'stand',     emoji: '🧍', text: 'Постой 5 минут вместо сидения',                        dur: '5 мин',  xp: 6 },
    { id: 'outside',   emoji: '🌳', text: 'Выйди на 10 минут на свежий воздух',                   dur: '10 мин', xp: 20 },
    { id: 'bridge',    emoji: '🌉', text: '10 ягодичных мостиков лёжа',                           dur: '2 мин',  xp: 10 }
  ];
  const questById = (id, list) => (list || QUESTS).find(q => q.id === id) || null;
  function pickQuest(key, n, excludeId, list) {
    const L = list && list.length ? list : QUESTS;
    let i = hash(key + ':' + n) % L.length;
    if (L[i].id === excludeId && L.length > 1) i = (i + 1) % L.length;
    return L[i];
  }

  /* ---------- Настройки ---------- */
  function defaultSettings() {
    return {
      petName: 'Тоша',
      notify: true, remindMeals: true, remindMove: true, remindSummary: true, silent: true,
      goal: 2000, waterGoal: 8,
      quietStart: '22:00', quietEnd: '08:00',
      moveEveryMin: 120, maxMovePerDay: 3,
      summaryTime: '20:30',
      meals: [
        { id: 'b', name: 'Завтрак', time: '09:00' },
        { id: 'l', name: 'Обед',    time: '13:30' },
        { id: 'd', name: 'Ужин',    time: '19:00' }
      ]
    };
  }

  /* ---------- Уровни и серии ---------- */
  const level = xp => Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
  const xpForLevel = l => 25 * (l - 1) * (l - 1);

  const qualifies = d => !!d && ((d.meals || []).length + (d.quests || []).length + (d.water > 0 ? 1 : 0)) >= 3;
  function prevKey(key) { const p = key.split('-').map(Number); return dayKey(new Date(p[0], p[1] - 1, p[2] - 1, 12)); }
  function streak(days, key) {
    let k = qualifies(days[key]) ? key : prevKey(key), n = 0;
    while (qualifies(days[k])) { n++; k = prevKey(k); }
    return n;
  }
  function bestStreak(days) {
    const keys = Object.keys(days).filter(k => qualifies(days[k])).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) { run = (prev && prevKey(k) === prev) ? run + 1 : 1; best = Math.max(best, run); prev = k; }
    return best;
  }

  /* ---------- Напоминания ---------- */
  const MEAL_BODIES = [
    'Запишем {m}? Это 10 секунд.',
    'Пора на {m}? Загляни — запишем вместе.',
    'Как там {m}? Отметь, когда будет минутка.'
  ];

  function buildCtx(S, now) {
    const key = dayKey(now);
    const d = S.days[key] || { meals: [], water: 0, quests: [] };
    const logged = {};
    d.meals.forEach(m => { logged[m.meal] = true; });
    return {
      dayKey: key,
      settings: JSON.parse(JSON.stringify(S.settings)),
      mealsLogged: logged,
      kcal: d.meals.reduce((a, m) => a + m.kcal, 0),
      fired: Object.assign({}, S.fired),
      notifToday: (S.notifLog[key] || []).slice(),
      lastMoveAt: S.lastMoveAt || 0,
      currentQuestId: S.current ? S.current.questId : null,
      quests: (S.custom && S.custom.quests && S.custom.quests.length) ? QUESTS.concat(S.custom.quests) : QUESTS
    };
  }

  /* Что напомнить прямо сейчас? Возвращает одно напоминание или null. */
  function computeDue(ctx, now) {
    const s = ctx.settings;
    if (!s || !s.notify) return null;
    const key = dayKey(now);
    if (ctx.dayKey !== key) return null;
    const min = minutesOf(now), nowMs = now.getTime();
    if (isQuiet(min, s.quietStart, s.quietEnd)) return null;
    const fired = ctx.fired || {};
    const notifToday = ctx.notifToday || [];
    const lastNotif = notifToday.length ? Math.max.apply(null, notifToday) : 0;
    const pet = s.petName || 'Тоша';

    // 1. Еда: в течение 90 минут после назначенного времени, если ещё ничего не записано
    if (s.remindMeals) {
      for (const m of s.meals) {
        const t = toMin(m.time), id = 'meal:' + m.id + ':' + key;
        if (min >= t && min < t + 90 && !ctx.mealsLogged[m.id] && !fired[id]) {
          return {
            id, kind: 'meal', mealId: m.id, tag: 'tosha-meal',
            title: pet + ' напоминает 🍽',
            body: pick(MEAL_BODIES, id).replace('{m}', m.name.toLowerCase())
          };
        }
      }
    }

    // 2. Итог дня
    if (s.remindSummary) {
      const t = toMin(s.summaryTime), id = 'sum:' + key;
      if (min >= t && min < t + 120 && !fired[id]) {
        const k = Math.round(ctx.kcal || 0);
        return {
          id, kind: 'summary', tag: 'tosha-summary',
          title: 'Итог дня 🌙',
          body: k > 0
            ? 'Записано ' + k + ' из ' + s.goal + ' ккал. Загляни, ' + pet + ' хочет пожелать спокойной ночи.'
            : 'Сегодня записей нет. Добавишь что-нибудь? А можно и пропустить — без обид.'
        };
      }
    }

    // 3. Мини-задание на движение
    if (s.remindMove) {
      const prefix = 'move:' + key + ':';
      const count = Object.keys(fired).filter(k => k.indexOf(prefix) === 0).length;
      if (count < s.maxMovePerDay) {
        const day0 = new Date(now); day0.setHours(0, 0, 0, 0);
        let startMs = day0.getTime();
        if (toMin(s.quietStart) > toMin(s.quietEnd)) startMs += toMin(s.quietEnd) * 60000;
        const base = Math.max(ctx.lastMoveAt || 0, startMs);
        if (nowMs - base >= s.moveEveryMin * 60000 && nowMs - lastNotif >= 45 * 60000) {
          const q = pickQuest(key, count, ctx.currentQuestId, ctx.quests);
          return {
            id: prefix + count, kind: 'move', questId: q.id, tag: 'tosha-move',
            title: 'Мини-задание от ' + pet,
            body: q.emoji + ' ' + q.text + ' · ' + q.dur
          };
        }
      }
    }
    return null;
  }

  function markFired(ctx, due, now) {
    ctx.fired[due.id] = now.getTime();
    ctx.notifToday.push(now.getTime());
    if (due.kind === 'move') { ctx.lastMoveAt = now.getTime(); ctx.currentQuestId = due.questId; }
    return ctx;
  }

  function pruneFired(fired, nowMs) {
    const out = {};
    for (const k of Object.keys(fired)) if (nowMs - fired[k] < 3 * 864e5) out[k] = fired[k];
    return out;
  }

  function notifOptions(due, settings) {
    return {
      body: due.body, tag: due.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
      silent: !!settings.silent,
      data: { kind: due.kind, mealId: due.mealId || '', questId: due.questId || '' }
    };
  }

  /* ---------- IndexedDB (снимок состояния для service worker) ---------- */
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('tosha', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function idbGet(k) {
    const db = await idb();
    return new Promise((res, rej) => {
      const q = db.transaction('kv').objectStore('kv').get(k);
      q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
    });
  }
  async function idbSet(k, v) {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction('kv', 'readwrite');
      t.objectStore('kv').put(v, k);
      t.oncomplete = () => res(); t.onerror = () => rej(t.error);
    });
  }

  const api = {
    dayKey, toMin, minutesOf, isQuiet, hash, pick, QUESTS, questById, pickQuest, defaultSettings,
    level, xpForLevel, qualifies, prevKey, streak, bestStreak,
    buildCtx, computeDue, markFired, pruneFired, notifOptions, idbGet, idbSet
  };
  root.ToshaCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
