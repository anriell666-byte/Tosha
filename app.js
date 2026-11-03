/* Тоша — интерфейс и состояние. Все данные только в localStorage этого телефона. */
(() => {
  'use strict';
  const C = window.ToshaCore;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'tosha.v1';
  const todayKey = () => C.dayKey(new Date());
  const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return (a > 10 && a < 20) ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- Состояние ---------- */
  function fresh() {
    return { v: 1, pet: 'hamster', petChosen: false, petsTried: ['hamster'], flags: { taps: 0 }, ach: {}, xp: 0, days: {}, fired: {}, notifLog: {}, lastMoveAt: Date.now(), current: null, reroll: 0, custom: { quests: [], phrases: [], colors: {} }, settings: C.defaultSettings() };
  }
  function migrate(o) {
    const base = fresh(), def = C.defaultSettings();
    const s = Object.assign(def, o.settings || {});
    if (!Array.isArray(s.meals) || !s.meals.length) s.meals = C.defaultSettings().meals;
    const cu = Object.assign({ quests: [], phrases: [], colors: {} }, o.custom || {});
    const r = Object.assign(base, o, { settings: s, custom: cu });
    const SP = (window.ToshaPets && window.ToshaPets.SPECIES) || {};
    if (r.pet === 'blob') r.pet = 'hamster';          // старый «комочек» стал хомяком
    if (!SP[r.pet]) r.pet = 'hamster';
    if (cu.colors && cu.colors.blob) { cu.colors.hamster = cu.colors.blob; delete cu.colors.blob; }
    r.flags = Object.assign({ taps: 0 }, o.flags || {});
    r.ach = o.ach || {};
    r.petsTried = Array.from(new Set((o.petsTried || []).map(x => x === 'blob' ? 'hamster' : x).concat([r.pet])));
    return r;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { console.warn(e); }
    return fresh();
  }
  let S = load();
  let reg = null, mealSel = autoMeal(new Date()), deferredInstall = null, recent = [];

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); }
    mirror();
  }
  function save() { persist(); checkAch(); }
  function mirror() {
    if (!window.indexedDB) return;
    C.idbSet('snapshot', C.buildCtx(S, new Date())).catch(() => {});
  }
  const getDay = k => S.days[k || todayKey()] || { meals: [], water: 0, quests: [] };
  const day = () => { const k = todayKey(); return S.days[k] || (S.days[k] = { meals: [], water: 0, quests: [] }); };
  const kcalOf = d => d.meals.reduce((a, m) => a + m.kcal, 0);
  const allQuests = () => C.QUESTS.concat(S.custom.quests);
  const qById = id => C.questById(id, allQuests());

  /* ---------- Мелочи ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function addXp(n) {
    const before = C.level(S.xp); S.xp += n; const after = C.level(S.xp);
    if (after > before) { levelUp = (before < 2 && after >= 2) ? 'hatch' : (before < 8 && after >= 8) ? 'crown' : ((before < 3 && after >= 3) || (before < 5 && after >= 5)) ? 'evolve' : 'levelup'; react(levelUp); toast(before < 2 && after >= 2 ? S.settings.petName + ' вылупился! 🐣 Уровень 2' : 'Новый уровень: ' + after + ' 🎉'); }
    else toast('+' + n + ' XP');
  }
  function autoMeal(now) { const m = C.minutesOf(now); return m < 630 ? 'b' : m < 900 ? 'l' : m < 1260 ? 'd' : 's'; }
  const MEAL_ICON = { b: '🥣', l: '🍲', d: '🍝', s: '🍎' };
  function mealName(id) {
    if (id === 's') return 'Перекус';
    const m = S.settings.meals.find(x => x.id === id); return m ? m.name : 'Еда';
  }
  function go(tab) {
    if (tab !== 'ws' && AN) { const w = $('#wsStage .pet-svg'); if (w) AN.stop(w); }
    $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
    $$('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    window.scrollTo(0, 0);
    if (tab === 'ws') renderWorkshop();
  }

  /* ---------- Питомец ---------- */
  const PHRASES = {
    neutral: ['Привет! Я тут, никуда не спешу 🙂', 'Как день? Расскажешь, что ел(а)?', 'Можно просто посидеть вместе. А можно размяться!'],
    happy: ['Сегодня у нас хороший день!', 'Ты молодец. Правда.', 'Мне нравится, как мы сегодня идём.'],
    hungry: ['Кажется, самое время записать приём пищи.', 'Мой живот урчит. А твой?', 'Поешь, а потом запишем 🙂'],
    sleepy: ['Zzz… Тихие часы. Отдыхай и ты.', 'Спим. Увидимся утром.'],
    excited: ['Ура! Так держать!', 'Вот это да!', 'Ещё одна маленькая победа!']
  };
  function mood(now) {
    const s = S.settings, min = C.minutesOf(now);
    if (C.isQuiet(min, s.quietStart, s.quietEnd)) return 'sleepy';
    const d = getDay(), logged = {}; d.meals.forEach(m => { logged[m.meal] = true; });
    for (const m of s.meals) { const t = C.toMin(m.time); if (min >= t + 30 && min < t + 240 && !logged[m.id]) return 'hungry'; }
    return (d.meals.length + d.quests.length + (d.water > 0 ? 1 : 0)) >= 3 ? 'happy' : 'neutral';
  }
  const P = window.ToshaPets, AN = window.ToshaAnim;
  let petKey = '', pendingReact = null, levelUp = false, reactT = null, autoAnim = null, tapN = -1;
  const colorsOf = id => (S.custom.colors || {})[id];
  const petSvg = (id, m, lvl, o) => P.svg(id, m, lvl, Object.assign({ colors: colorsOf(id) }, o || {}));
  const curSvg = () => $('#petBox .pet-svg');
  const phrasesFor = m => PHRASES[m].concat(m === 'neutral' || m === 'happy' ? S.custom.phrases : []);
  const moodAnim = m => m === 'sleepy' ? 'sleep' : m === 'hungry' ? 'hungry' : null;
  function react(name) {
    pendingReact = levelUp || name;
    clearTimeout(reactT); reactT = setTimeout(flushReact, 40);
  }
  function flushReact() {
    const svg = curSvg(), name = pendingReact; pendingReact = null;
    if (name && name === levelUp) levelUp = false;
    if (!svg || !AN) return;
    if (name) AN.play(svg, name);
    else if (autoAnim) { const a = autoAnim; autoAnim = null; AN.play(svg, a, { for: 9000 }); }
  }
  function renderPet() {
    const now = new Date(), lvl = C.level(S.xp), m = mood(now);
    const cur = C.xpForLevel(lvl), nxt = C.xpForLevel(lvl + 1), pct = Math.round((S.xp - cur) / (nxt - cur) * 100);
    const st = C.streak(S.days, todayKey());
    const phrase = C.pick(phrasesFor(m), m + ':' + Math.floor(Date.now() / 1200000));
    const key = [S.pet, m, lvl, pct, st, phrase, S.settings.petName, JSON.stringify(colorsOf(S.pet) || '')].join('|');
    if (key === petKey) return;   // ничего не изменилось: не перерисовываем, чтобы анимация не прерывалась
    petKey = key; autoAnim = moodAnim(m);
    $('#petBox').innerHTML =
      `<div class="bubble">${esc(phrase)}</div>
       <div class="petwrap" data-act="petTap" aria-label="Погладить ${esc(S.settings.petName)}">${petSvg(S.pet, m, lvl, { label: S.settings.petName })}</div>
       <div class="petname">${esc(S.settings.petName)} <span class="pill">ур. ${lvl}</span>${st > 0 ? ` <span class="pill">🔥 ${st}</span>` : ''}</div>
       <div class="xpbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
       <div class="muted small">${S.xp - cur} из ${nxt - cur} XP до следующего уровня</div>
       <div style="margin-top:10px"><button class="chip" data-act="goPets">🔄 Сменить питомца</button></div>`;
    if (!pendingReact) { clearTimeout(reactT); reactT = setTimeout(flushReact, 60); }
  }
  function renderPicker() {
    const html = Object.keys(P.SPECIES).map(id => `<button type="button" class="pick ${id === S.pet ? 'on' : ''}" data-act="pickPet" data-p="${id}" aria-pressed="${id === S.pet}">${petSvg(id, 'neutral', 2, { mini: true, label: P.SPECIES[id].title })}${P.SPECIES[id].title}</button>`).join('');
    $('#pickMore').innerHTML = html;
    $('#pickHome').hidden = !!S.petChosen;
    if (!S.petChosen) $('#pickHomeGrid').innerHTML = html;
  }

  /* ---------- Задание ---------- */
  function renderQuest() {
    const q = S.current && qById(S.current.questId);
    $('#questBox').innerHTML = q
      ? `<div class="qhead">Мини-задание</div>
         <div class="qbody"><div class="qemoji">${q.emoji}</div><div><div class="qtext">${esc(q.text)}</div><div class="muted small">≈ ${q.dur} · +${q.xp} XP</div></div></div>
         <div class="row"><button class="btn" data-act="questDone">Сделал(а)!</button><button class="btn ghost" data-act="questSwap">Другое</button></div>`
      : `<div class="qhead">Мини-задание</div>
         <p class="muted">Пока заданий нет. Хочешь что-нибудь лёгкое?</p>
         <button class="btn" data-act="questNew" style="width:100%">Дай задание</button>`;
  }
  function newQuest() {
    S.reroll = (S.reroll || 0) + 1;
    const q = C.pickQuest(todayKey(), 100 + S.reroll, S.current && S.current.questId, allQuests());
    S.current = { questId: q.id, ts: Date.now() };
  }

  /* ---------- Кольца, вода, неделя ---------- */
  function ring(frac, size, stroke, color, l1, l2) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.min(1, Math.max(0, frac)), h = size / 2;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring" role="img" aria-label="${esc(l1)} ${esc(l2 || '')}">
      <circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>
      <circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${h} ${h})"/>
      <text x="50%" y="${l2 ? size * 0.5 : size * 0.54}" text-anchor="middle" class="ringtxt">${esc(l1)}</text>
      ${l2 ? `<text x="50%" y="${size * 0.67}" text-anchor="middle" class="ringsub">${esc(l2)}</text>` : ''}</svg>`;
  }
  function renderFoodMini() {
    const k = kcalOf(getDay()), g = S.settings.goal;
    $('#foodMini').innerHTML = `<div class="qhead">Еда</div>${ring(k / g, 104, 11, k > g * 1.1 ? 'var(--pet)' : 'var(--teal)', String(k), 'из ' + g)}
      <div style="margin-top:10px"><button class="btn sm" data-act="goFood" style="width:100%">Записать</button></div>`;
  }
  function renderWater() {
    const w = getDay().water, g = S.settings.waterGoal, n = Math.max(g, w);
    $('#waterBox').innerHTML = `<div class="qhead">Вода</div>
      <div class="drops" aria-hidden="true">${Array.from({ length: Math.min(n, 15) }, (_, i) => `<i class="${i < w ? 'on' : ''}">💧</i>`).join('')}</div>
      <div class="row"><button class="btn ghost round" data-act="waterMinus" aria-label="Минус стакан">−</button>
      <div class="stat"><b>${w} / ${g}</b></div>
      <button class="btn round" data-act="waterPlus" aria-label="Плюс стакан">+</button></div>`;
  }
  function renderWeek() {
    const st = C.streak(S.days, todayKey()), cells = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5), k = C.dayKey(d), ok = C.qualifies(S.days[k]);
      cells.push(`<div class="${ok ? 'ok' : ''} ${i === 0 ? 'today' : ''}"><span>${ok ? '✓' : ''}</span>${d.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>`);
    }
    $('#weekBox').innerHTML = `<div class="qhead">Серия дней</div>
      <b>${st > 0 ? '🔥 ' + st + ' ' + plural(st, ['день', 'дня', 'дней']) + ' подряд' : 'Начнём новую серию сегодня'}</b>
      <div class="muted small">День засчитывается, когда набралось 3 действия: запись еды, задание или вода.</div>
      <div class="week">${cells.join('')}</div>`;
  }

  /* ---------- Еда ---------- */
  const REFS = [['🍎 яблоко', 80], ['🍌 банан', 100], ['🥚 яйцо', 75], ['🍞 ломтик хлеба', 80], ['🥪 бутерброд', 250],
    ['🥣 порция каши', 250], ['🍝 порция пасты', 450], ['🍕 кусок пиццы', 280], ['☕ латте', 150], ['🍫 шоколадка', 130]];
  function recentList() {
    const map = new Map();
    for (const k of Object.keys(S.days).sort().reverse().slice(0, 14)) {
      for (const m of S.days[k].meals) {
        if (!m.name) continue;
        const id = m.name.toLowerCase() + '|' + m.kcal, o = map.get(id) || { name: m.name, kcal: m.kcal, n: 0 };
        o.n++; map.set(id, o);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.n - a.n).slice(0, 8);
  }
  function renderFood() {
    const d = getDay(), k = kcalOf(d), g = S.settings.goal, left = g - k;
    $('#foodRing').innerHTML = ring(k / g, 160, 14, k > g * 1.1 ? 'var(--pet)' : 'var(--teal)', String(k), 'из ' + g + ' ккал') +
      `<p class="center muted" style="margin:10px 0 0">${k === 0 ? 'Пока ничего не записано' : left >= 0 ? 'Осталось примерно ' + left + ' ккал' : 'Чуть выше цели. Это нормально, завтра новый день 🙂'}</p>`;
    const meals = S.settings.meals.concat([{ id: 's', name: 'Перекус' }]);
    $('#mealChips').innerHTML = meals.map(m => `<button type="button" class="chip ${m.id === mealSel ? 'on' : ''}" data-act="meal" data-m="${m.id}">${MEAL_ICON[m.id] || '🍽'} ${esc(m.name)}</button>`).join('');
    $('#kcalChips').innerHTML = [100, 200, 300, 400, 500, 700].map(v => `<button type="button" class="chip" data-act="kcalChip" data-v="${v}">${v}</button>`).join('');
    $('#refChips').innerHTML = REFS.map((r, i) => `<button type="button" class="chip" data-act="refChip" data-i="${i}">${r[0]} · ${r[1]}</button>`).join('');
    recent = recentList();
    $('#recent').innerHTML = recent.length ? `<div class="qhead" style="margin-top:12px">Недавнее</div><div class="chips">${recent.map((r, i) => `<button type="button" class="chip" data-act="recentChip" data-i="${i}">${esc(r.name)} · ${r.kcal}</button>`).join('')}</div>` : '';
    $('#entries').innerHTML = d.meals.length
      ? d.meals.slice().sort((a, b) => a.ts - b.ts).map(m => `<div class="entry"><span class="t">${new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          <span class="n">${MEAL_ICON[m.meal] || '🍽'} ${esc(m.name || mealName(m.meal))}</span><span class="k">${m.kcal}</span>
          <button class="x" data-act="delEntry" data-id="${m.id}" aria-label="Удалить запись">×</button></div>`).join('')
      : '<p class="muted">Здесь появятся записи за сегодня.</p>';
  }

  /* ---------- Достижения ---------- */
  let inAch = false; const achOpen = {};
  const achEx = () => ({ todayKey: todayKey(), petCount: Object.keys(P.SPECIES).length });
  function checkAch(silent) {
    if (inAch || !C.evalAch || !P) return;
    inAch = true;
    try {
      const got = C.evalAch(S, achEx()).list.filter(a => a.done && !S.ach[a.id]);
      if (got.length) {
        const now = Date.now(); got.forEach(a => { S.ach[a.id] = now; });
        persist();
        if (!silent) {
          toast(got.length === 1 ? '🏅 Достижение: ' + got[0].title : '🏅 Новые достижения: ' + got.map(a => a.title).join(', '));
          react('surprise');
          renderAch();
        }
      }
    } finally { inAch = false; }
  }
  function renderAch() {
    const ev = C.evalAch(S, achEx()), by = {};
    ev.list.forEach(a => { (by[a.group] = by[a.group] || []).push(a); });
    $('#achCount').textContent = ev.list.filter(a => a.done).length + ' из ' + ev.list.length;
    $('#achList').innerHTML = C.ACH_GROUPS.map(g => {
      const L = by[g.id] || [], n = L.filter(a => a.done).length;
      const rows = L.map(a => `<div class="ach ${a.done ? 'done' : 'lock'}"><span class="em">${a.emoji}</span>
        <div class="t"><b>${esc(a.title)}</b><span>${esc(a.desc)}</span>${!a.done && a.target > 1 ? `<div class="bar"><i style="width:${Math.round(a.value / a.target * 100)}%"></i></div>` : ''}</div>
        <span class="r">${a.done ? '✓' : a.target > 1 ? a.value + '/' + a.target : '🔒'}</span></div>`).join('');
      return `<details class="agrp" data-g="${g.id}" ${achOpen[g.id] ? 'open' : ''}><summary><b>${esc(g.title)}</b> <span class="pill">${n}/${L.length}</span></summary>${rows}</details>`;
    }).join('');
  }
  $('#achList').addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.g) achOpen[d.dataset.g] = d.open; }, true);

  /* ---------- Тема оформления ---------- */
  const MODES = [['auto', 'Как в телефоне'], ['light', 'Светлая'], ['dark', 'Тёмная']];
  const PALS = [['peach', 'Персик', '#d94f30'], ['mint', 'Мята', '#137a57'], ['lavender', 'Лаванда', '#6a4fc2'], ['ocean', 'Море', '#1b6fb5']];
  const mqDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const st = S.settings, mode = st.themeMode || 'auto';
    const dark = mode === 'dark' || (mode !== 'light' && !!(mqDark && mqDark.matches));
    const d = document.documentElement;
    d.dataset.theme = dark ? 'dark' : 'light'; d.dataset.pal = st.palette || 'peach'; d.style.colorScheme = dark ? 'dark' : 'light';
    const bg = getComputedStyle(d).getPropertyValue('--bg').trim(), m = document.querySelector('meta[name="theme-color"]');
    if (m && bg) m.setAttribute('content', bg);
  }
  if (mqDark && mqDark.addEventListener) mqDark.addEventListener('change', () => { if ((S.settings.themeMode || 'auto') === 'auto') applyTheme(); });
  function renderThemeUi() {
    const st = S.settings;
    $('#themeMode').innerHTML = MODES.map(m => `<button type="button" class="chip ${(st.themeMode || 'auto') === m[0] ? 'on' : ''}" data-act="themeMode" data-v="${m[0]}" aria-pressed="${(st.themeMode || 'auto') === m[0]}">${m[1]}</button>`).join('');
    $('#themePal').innerHTML = PALS.map(p => `<button type="button" class="swatch ${(st.palette || 'peach') === p[0] ? 'on' : ''}" data-act="themePal" data-v="${p[0]}" aria-pressed="${(st.palette || 'peach') === p[0]}"><i style="--c:${p[2]}"></i>${p[1]}</button>`).join('');
  }
  function setTheme(k, v) { S.settings[k] = v; S.flags.theme = true; applyTheme(); renderThemeUi(); save(); }

  /* ---------- Уведомления ---------- */
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function permText() {
    if (!('Notification' in window)) return 'Не поддерживаются, напоминания покажутся внутри приложения';
    const p = Notification.permission;
    return p === 'granted' ? 'Разрешены ✓' : p === 'denied' ? 'Запрещены в настройках телефона' : 'Ещё не разрешены';
  }
  function renderPerm() {
    let h = '';
    if (!standalone()) {
      h += `<div class="card tip"><b>Поставь Тошу на экран</b>
        <p class="muted small">Так он открывается как обычное приложение и надёжнее присылает напоминания.</p>
        ${deferredInstall ? '<button class="btn" data-act="install">Установить</button>' : '<p class="small">Меню браузера ⋮ → «Установить приложение» или «Добавить на главный экран».</p>'}</div>`;
    }
    if ('Notification' in window && S.settings.notify) {
      if (Notification.permission === 'default') {
        h += `<div class="card tip"><b>Тихие напоминания</b><p class="muted small">Тоша напомнит о еде и разминке без звука и не чаще нескольких раз в день. Разрешить уведомления?</p>
          <button class="btn" data-act="askPerm">Разрешить</button></div>`;
      } else if (Notification.permission === 'denied') {
        h += `<div class="card tip"><p class="small" style="margin:0">Уведомления выключены в настройках телефона. Тоша всё равно будет подсказывать, пока приложение открыто.</p></div>`;
      }
    }
    $('#permBox').innerHTML = h;
    $('#permStatus').textContent = permText();
  }
  async function askPerm() {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    if (p === 'granted') { toast('Готово! Тоша будет напоминать тихо'); registerPeriodic(); }
    renderPerm();
  }
  async function registerPeriodic() {
    try {
      if (!reg || !('periodicSync' in reg)) return;
      const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (st.state === 'granted') await reg.periodicSync.register('tosha-check', { minInterval: 60 * 60 * 1000 });
    } catch (e) { /* не страшно: напоминания придут, когда приложение открыто */ }
  }
  async function showSystem(due) {
    const opts = C.notifOptions(due, S.settings);
    try {
      if (reg && reg.showNotification) await reg.showNotification(due.title, opts);
      else new Notification(due.title, opts);
    } catch (e) { console.warn(e); }
  }
  function showNudge(due) {
    const btn = due.kind === 'meal' ? `<button class="btn sm" data-act="nudgeGo" data-tab="food" data-meal="${esc(due.mealId)}">Записать</button>`
      : due.kind === 'summary' ? '<button class="btn sm" data-act="nudgeGo" data-tab="food">Итог</button>'
      : '<button class="btn sm" data-act="nudgeGo" data-tab="home" data-glow="1">Смотреть</button>';
    const el = $('#nudge'); el.hidden = false;
    el.innerHTML = `<div><b>${esc(due.title)}</b><div>${esc(due.body)}</div></div>${btn}<button class="x" data-act="nudgeClose" aria-label="Закрыть">×</button>`;
  }
  async function fire(due, now) {
    const ctx = C.buildCtx(S, now);
    C.markFired(ctx, due, now);
    S.fired = C.pruneFired(ctx.fired, now.getTime());
    S.notifLog[ctx.dayKey] = ctx.notifToday;
    S.lastMoveAt = ctx.lastMoveAt;
    const old = C.dayKey(new Date(now.getTime() - 7 * 864e5));
    Object.keys(S.notifLog).forEach(k => { if (k < old) delete S.notifLog[k]; });
    if (due.kind === 'move') S.current = { questId: due.questId, ts: now.getTime() };
    save();
    if (document.visibilityState === 'visible') { showNudge(due); renderAll(); } else await showSystem(due);
  }
  async function tick() {
    const now = new Date(), vis = document.visibilityState === 'visible';
    const canSys = !vis && 'Notification' in window && Notification.permission === 'granted';
    if (vis || canSys) {
      const due = C.computeDue(C.buildCtx(S, now), now);
      if (due) await fire(due, now);
    }
    if (vis) renderPet();
  }
  async function syncFromIdb() {
    try {
      if (!window.indexedDB) return;
      const snap = await C.idbGet('snapshot'); if (!snap) return;
      let ch = false;
      for (const k of Object.keys(snap.fired || {})) if (!S.fired[k] || S.fired[k] < snap.fired[k]) { S.fired[k] = snap.fired[k]; ch = true; }
      const cur = S.notifLog[snap.dayKey] || [], merged = Array.from(new Set(cur.concat(snap.notifToday || []))).sort();
      if (merged.length !== cur.length) { S.notifLog[snap.dayKey] = merged; ch = true; }
      if ((snap.lastMoveAt || 0) > (S.lastMoveAt || 0)) { S.lastMoveAt = snap.lastMoveAt; ch = true; }
      if (snap.currentQuestId && (!S.current || S.current.questId !== snap.currentQuestId) && snap.lastMoveAt > (S.current ? S.current.ts : 0)) {
        S.current = { questId: snap.currentQuestId, ts: snap.lastMoveAt }; ch = true;
      }
      if (ch) save();
    } catch (e) { /* нет снимка: ничего страшного */ }
  }

  /* ---------- Действия ---------- */
  const A = {
    questDone() {
      const q = S.current && qById(S.current.questId); if (!q) return;
      day().quests.push({ id: q.id, ts: Date.now() });
      if (q.water) day().water++;
      S.current = null; S.lastMoveAt = Date.now();
      addXp(q.xp); react('cheer'); save(); renderAll();
    },
    questSwap() { newQuest(); save(); renderQuest(); },
    questNew() { newQuest(); save(); renderQuest(); },
    waterPlus() { const d = day(); d.water++; if (d.water <= S.settings.waterGoal) addXp(2); else toast('Достаточно воды 💧 Отдохни'); react('drinkOk'); save(); renderAll(); },
    waterMinus() { const d = day(); if (d.water > 0) d.water--; save(); renderAll(); },
    goFood() { go('food'); },
    goPets() { go('more'); const el = $('#pickMore'); if (el) el.scrollIntoView({ block: 'center' }); },
    pickPet(t) {
      const id = t.dataset.p; if (!P.SPECIES[id]) return;
      S.pet = id; S.petChosen = true;
      if (S.petsTried.indexOf(id) < 0) S.petsTried.push(id);
      const defaults = Object.keys(P.SPECIES).map(k => P.SPECIES[k].name);
      if (!S.settings.petName || defaults.indexOf(S.settings.petName) >= 0) S.settings.petName = P.SPECIES[id].name;
      save(); fillSettings(); renderAll(); react('greet');
      toast('Теперь с тобой ' + S.settings.petName + ' 🐾');
    },
    petTap() {
      const svg = curSvg(); if (!svg || !AN) return;
      const list = [['happy'], ['greet'], ['dance', { for: 3200 }], ['excited']]; tapN = (tapN + 1) % list.length;
      AN.play(svg, list[tapN][0], list[tapN][1] || {});
      S.flags.taps = (S.flags.taps || 0) + 1; save();
    },
    themeMode(t) { setTheme('themeMode', t.dataset.v); },
    themePal(t) { setTheme('palette', t.dataset.v); },
    wsSp(t) { WS.sp = t.dataset.p; renderWsTop(); },
    wsAnim(t) { WS.anim = t.dataset.a; renderWsTop(); },
    wsPlay() { playWs(); },
    colReset() { if (S.custom.colors[WS.sp]) { delete S.custom.colors[WS.sp]; colorsChanged(); } },
    cqDel(t) { S.custom.quests = S.custom.quests.filter(q => q.id !== t.dataset.id); if (S.current && S.current.questId === t.dataset.id) S.current = null; save(); renderCustomQuests(); renderQuest(); },
    meal(t) { mealSel = t.dataset.m; renderFood(); },
    kcalChip(t) { $('#fKcal').value = t.dataset.v; },
    refChip(t) { const r = REFS[+t.dataset.i]; $('#fName').value = r[0].replace(/^\S+\s/, ''); $('#fKcal').value = r[1]; },
    recentChip(t) { const r = recent[+t.dataset.i]; if (r) { $('#fName').value = r.name; $('#fKcal').value = r.kcal; } },
    delEntry(t) { const d = day(); d.meals = d.meals.filter(m => m.id !== t.dataset.id); save(); renderAll(); toast('Запись удалена'); },
    askPerm,
    async testNotif() {
      if (!('Notification' in window)) { toast('Этот браузер не поддерживает уведомления'); return; }
      if (Notification.permission !== 'granted') await askPerm();
      if (Notification.permission === 'granted') {
        await showSystem({ title: S.settings.petName + ' на связи 🐾', body: 'Так выглядят тихие напоминания.', tag: 'tosha-test', kind: 'test' });
        toast('Отправил, смотри в шторке');
      }
    },
    install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; renderPerm(); } },
    nudgeGo(t) {
      $('#nudge').hidden = true;
      if (t.dataset.meal) mealSel = t.dataset.meal;
      go(t.dataset.tab); renderFood();
      if (t.dataset.glow) { const q = $('#questBox'); q.classList.add('glow'); setTimeout(() => q.classList.remove('glow'), 3500); }
    },
    nudgeClose() { $('#nudge').hidden = true; },
    export() {
      S.flags.backup = true; save();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
      a.download = 'tosha-backup-' + todayKey() + '.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    import() { $('#importFile').click(); },
    reset() {
      if (!confirm('Удалить все записи и начать с нуля? Это нельзя отменить.')) return;
      S = fresh(); save(); fillSettings(); renderAll(); toast('Начинаем сначала');
    }
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act],[data-tab]'); if (!t) return;
    if (t.dataset.act) { const f = A[t.dataset.act]; if (f) f(t, e); } else go(t.dataset.tab);
  });

  $('#foodForm').addEventListener('submit', e => {
    e.preventDefault();
    const kcal = Math.round(Number($('#fKcal').value));
    if (!(kcal > 0 && kcal <= 5000)) { toast('Введи калории от 1 до 5000'); return; }
    const d = day();
    d.meals.push({ id: uid(), ts: Date.now(), name: $('#fName').value.trim(), kcal, meal: mealSel });
    if (d.meals.length <= 6) addXp(5); else toast('Записано');
    $('#fKcal').value = ''; $('#fName').value = '';
    react('happy'); save(); renderAll();
  });

  /* ---------- Настройки ---------- */
  function fillSettings() {
    $$('[data-s]').forEach(el => {
      const v = S.settings[el.dataset.s];
      if (el.dataset.t === 'bool') el.checked = !!v; else el.value = v;
    });
    $$('[data-meal]').forEach(el => { const m = S.settings.meals.find(x => x.id === el.dataset.meal); if (m) el.value = m.time; });
  }
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-s],[data-meal]'); if (!el) return;
    if (el.dataset.meal) {
      const m = S.settings.meals.find(x => x.id === el.dataset.meal);
      if (m && el.value) m.time = el.value;
    } else {
      const k = el.dataset.s, t = el.dataset.t; let v;
      if (t === 'bool') v = el.checked;
      else if (t === 'num') { v = Number(el.value); if (!Number.isFinite(v)) v = S.settings[k]; v = Math.round(Math.min(+el.dataset.max, Math.max(+el.dataset.min, v))); el.value = v; }
      else if (t === 'sel') v = Number(el.value);
      else if (k === 'petName') { v = el.value.trim().slice(0, 16) || 'Тоша'; el.value = v; if (Object.keys(P.SPECIES).map(x => P.SPECIES[x].name).concat(['Тоша']).indexOf(v) < 0) S.flags.renamed = true; }
      else v = el.value || S.settings[k];
      S.settings[k] = v;
    }
    save(); renderAll();
  });
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      if (!o || typeof o !== 'object' || !o.days || !o.settings) throw new Error('bad');
      if (!confirm('Заменить текущие данные копией из файла?')) return;
      S = migrate(o); save(); fillSettings(); renderAll(); toast('Копия загружена');
    } catch (err) { toast('Не получилось прочитать файл'); }
  });

  /* ---------- Мастерская ---------- */
  const WS = { sp: null, anim: 'happy', speed: 1, loop: false };
  function playWs() {
    const svg = $('#wsStage .pet-svg'), d = AN && AN.LIB[WS.anim]; if (!svg || !d) return;
    AN.play(svg, WS.anim, { speed: WS.speed, loop: WS.loop ? true : undefined, for: (d.loop && !WS.loop) ? 6000 : undefined });
  }
  function fillColors() {
    const sp = P.SPECIES[WS.sp], c = colorsOf(WS.sp) || {};
    $('#colPet').value = c.pet || sp.c.pet; $('#colLight').value = c.light || sp.c.light;
  }
  function renderWsTop() {
    if (!AN) return;
    WS.sp = WS.sp || S.pet;
    $('#wsSpecies').innerHTML = Object.keys(P.SPECIES).map(id => `<button type="button" class="chip ${id === WS.sp ? 'on' : ''}" data-act="wsSp" data-p="${id}">${esc(P.SPECIES[id].title)}</button>`).join('');
    $('#wsList').innerHTML = AN.GROUPS.map(g => `<div class="qhead" style="margin-top:10px">${g.title}</div><div class="chips">${AN.list().filter(a => a.group === g.id).map(a => `<button type="button" class="chip ${a.id === WS.anim ? 'on' : ''}" data-act="wsAnim" data-a="${a.id}">${a.emoji} ${esc(a.title)}</button>`).join('')}</div>`).join('');
    $('#wsStage').innerHTML = petSvg(WS.sp, 'neutral', Math.max(2, C.level(S.xp)), { label: P.SPECIES[WS.sp].title });
    const d = AN.LIB[WS.anim]; $('#wsDesc').textContent = d ? d.title + ': ' + d.desc : '';
    fillColors(); playWs();
  }
  function renderCustomQuests() {
    $('#cqList').innerHTML = S.custom.quests.length
      ? S.custom.quests.map(q => `<div class="entry"><span class="n">${esc(q.emoji)} ${esc(q.text)}</span><span class="k">+${q.xp}</span><button class="x" data-act="cqDel" data-id="${q.id}" aria-label="Удалить задание">×</button></div>`).join('')
      : '<p class="muted small">Своих заданий пока нет. Добавь первое ниже: Тоша будет предлагать его вместе со своими.</p>';
  }
  function renderWorkshop() { renderWsTop(); renderCustomQuests(); $('#cpText').value = S.custom.phrases.join('\n'); }
  function colorsChanged() { save(); petKey = ''; renderPet(); renderPicker(); renderWsTop(); }
  $('#colPet').addEventListener('change', () => { S.custom.colors[WS.sp] = { pet: $('#colPet').value, light: $('#colLight').value }; colorsChanged(); });
  $('#colLight').addEventListener('change', () => { S.custom.colors[WS.sp] = { pet: $('#colPet').value, light: $('#colLight').value }; colorsChanged(); });
  $('#wsSpeed').addEventListener('input', e => { WS.speed = parseFloat(e.target.value) || 1; $('#wsSpeedV').textContent = WS.speed.toFixed(1).replace('.', ',') + '×'; });
  $('#wsSpeed').addEventListener('change', playWs);
  $('#wsLoop').addEventListener('change', e => { WS.loop = e.target.checked; playWs(); });
  $('#cqForm').addEventListener('submit', e => {
    e.preventDefault();
    const text = $('#cqText').value.trim().slice(0, 60); if (!text) { toast('Напиши, что нужно сделать'); return; }
    if (S.custom.quests.length >= 30) { toast('Достаточно: максимум 30 своих заданий'); return; }
    const emoji = Array.from($('#cqEmoji').value.trim() || '⭐').slice(0, 2).join('');
    S.custom.quests.push({ id: 'u_' + uid(), emoji, text, dur: $('#cqDur').value, xp: Number($('#cqXp').value) || 10 });
    save(); renderCustomQuests(); $('#cqText').value = ''; $('#cqEmoji').value = ''; toast('Задание добавлено');
  });
  $('#cpText').addEventListener('change', e => {
    S.custom.phrases = e.target.value.split('\n').map(x => x.trim().slice(0, 80)).filter(Boolean).slice(0, 30);
    save(); petKey = ''; renderPet(); toast('Фразы сохранены');
  });

  /* ---------- Запуск ---------- */
  function renderAll() { renderPet(); renderPicker(); renderPerm(); renderQuest(); renderFoodMini(); renderWater(); renderWeek(); renderFood(); renderAch(); renderThemeUi(); }
  function navTo(d) {
    if (d.kind === 'meal') { if (d.mealId) mealSel = d.mealId; go('food'); renderFood(); }
    else if (d.kind === 'summary') go('food');
    else go('home');
    syncFromIdb().then(renderAll);
  }
  async function initSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('sw.js');
      reg = await navigator.serviceWorker.ready;
      navigator.serviceWorker.addEventListener('message', ev => { if (ev.data && ev.data.type === 'nav') navTo(ev.data); });
      registerPeriodic(); mirror();
    } catch (e) { console.warn('Service worker недоступен (нужен https):', e); }
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; renderPerm(); });
  window.addEventListener('appinstalled', () => { deferredInstall = null; renderPerm(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (reg && reg.getNotifications) reg.getNotifications().then(ns => ns.forEach(n => n.close())).catch(() => {});
    syncFromIdb().then(() => { renderAll(); tick(); });
  });

  (async function init() {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* ок */ }
    applyTheme();
    fillSettings();
    await syncFromIdb();
    checkAch(true);
    const p = new URLSearchParams(location.search);
    if (p.get('from')) { navTo({ kind: p.get('from'), mealId: p.get('meal') }); history.replaceState(null, '', location.pathname); }
    else if (p.get('tab') === 'ws') { go('ws'); history.replaceState(null, '', location.pathname); }
    renderAll();
    save();
    initSW();
    tick();
    setInterval(tick, 30000);
  })();
})();
