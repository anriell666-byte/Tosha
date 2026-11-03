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
      themeMode: 'auto', palette: 'peach',
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


  /* ---------- Достижения ---------- */
  const ACH_GROUPS = [
    { id: 'food', title: 'Еда' }, { id: 'move', title: 'Движение' }, { id: 'water', title: 'Вода' },
    { id: 'streak', title: 'Серии' }, { id: 'level', title: 'Уровни' }, { id: 'special', title: 'Особые' }
  ];
  const keyMs = k => { const p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12).getTime(); };

  function computeStats(S, ex) {
    ex = ex || {};
    const days = S.days || {}, st = S.settings || defaultSettings(), cu = S.custom || {}, fl = S.flags || {};
    const keys = Object.keys(days).sort(), mealIds = (st.meals || []).map(m => m.id);
    let meals = 0, quests = 0, waterTotal = 0, waterGoalDays = 0, maxWater = 0, fullMealDays = 0, breakfastDays = 0, perfectDays = 0;
    let morning = false, weekend = false, customDone = false;
    const qset = {}, foods = {}, active = [];
    for (const k of keys) {
      const d = days[k], ms = d.meals || [], qs = d.quests || [], w = d.water || 0;
      meals += ms.length; quests += qs.length; waterTotal += w; maxWater = Math.max(maxWater, w);
      const goalHit = w >= st.waterGoal; if (goalHit) waterGoalDays++;
      const set = {}; ms.forEach(m => { set[m.meal] = 1; if (m.name) foods[String(m.name).trim().toLowerCase()] = 1; });
      const full = mealIds.length > 0 && mealIds.every(id => set[id]);
      if (full) fullMealDays++;
      if (set.b) breakfastDays++;
      if (full && goalHit && qs.length >= 1) perfectDays++;
      qs.forEach(q => {
        qset[q.id] = 1; if (String(q.id).indexOf('u_') === 0) customDone = true;
        const dt = new Date(q.ts), h = dt.getHours(), wd = dt.getDay();
        if (h >= 5 && h < 9) morning = true; if (wd === 0 || wd === 6) weekend = true;
      });
      if (ms.length || qs.length || w > 0) active.push(k);
    }
    let comeback = false;
    for (let i = 1; i < active.length; i++) if (Math.round((keyMs(active[i]) - keyMs(active[i - 1])) / 864e5) >= 4) { comeback = true; break; }
    const today = ex.todayKey || dayKey(new Date());
    return {
      meals, quests, waterTotal, waterGoalDays, maxWater, waterGoal: st.waterGoal, fullMealDays, breakfastDays, perfectDays,
      distinctQuests: Object.keys(qset).length, distinctFoods: Object.keys(foods).length,
      morning: morning ? 1 : 0, weekend: weekend ? 1 : 0, comeback: comeback ? 1 : 0, customDone: customDone ? 1 : 0,
      level: level(S.xp || 0), xp: S.xp || 0, best: bestStreak(days), cur: streak(days, today),
      petsTried: (S.petsTried || []).length, petCount: ex.petCount || 6,
      customQuests: (cu.quests || []).length, customPhrases: (cu.phrases || []).length, colors: Object.keys(cu.colors || {}).length,
      theme: fl.theme ? 1 : 0, backup: fl.backup ? 1 : 0, taps: fl.taps || 0, renamed: fl.renamed ? 1 : 0
    };
  }

  const A = (id, emoji, title, desc, group, cur, target) => ({ id, emoji, title, desc, group, cur, target });
  const ACH = [
    A('first_meal', '🥄', 'Первая запись', 'Записать первый приём пищи', 'food', s => s.meals, 1),
    A('meals_10', '📒', '10 записей', 'Сделать 10 записей о еде', 'food', s => s.meals, 10),
    A('meals_50', '📚', '50 записей', 'Сделать 50 записей о еде', 'food', s => s.meals, 50),
    A('meals_100', '🗂️', 'Сотня записей', 'Сделать 100 записей о еде', 'food', s => s.meals, 100),
    A('full_day', '🍽️', 'Три приёма', 'Записать завтрак, обед и ужин за один день', 'food', s => s.fullMealDays, 1),
    A('breakfast_7', '🌅', 'Семь завтраков', 'Записать завтрак в 7 разных дней', 'food', s => s.breakfastDays, 7),
    A('foods_10', '🥗', 'Разнообразное меню', 'Записать 10 разных блюд по названию', 'food', s => s.distinctFoods, 10),

    A('first_quest', '🏃', 'Первая разминка', 'Выполнить первое мини-задание', 'move', s => s.quests, 1),
    A('quests_10', '👟', '10 заданий', 'Выполнить 10 заданий', 'move', s => s.quests, 10),
    A('quests_25', '💪', '25 заданий', 'Выполнить 25 заданий', 'move', s => s.quests, 25),
    A('quests_50', '🥇', '50 заданий', 'Выполнить 50 заданий', 'move', s => s.quests, 50),
    A('quests_100', '🏅', 'Сто заданий', 'Выполнить 100 заданий', 'move', s => s.quests, 100),
    A('variety_10', '🎲', 'Разнообразие', 'Выполнить 10 разных заданий', 'move', s => s.distinctQuests, 10),
    A('morning', '🌄', 'Утренняя разминка', 'Выполнить задание между 5 и 9 утра', 'move', s => s.morning, 1),
    A('weekend', '🌤️', 'Выходной в движении', 'Выполнить задание в субботу или воскресенье', 'move', s => s.weekend, 1),

    A('water_goal', '💧', 'Цель по воде', 'Выпить дневную норму воды', 'water', s => s.maxWater, s => s.waterGoal),
    A('water_100', '🌊', '100 стаканов', 'Выпить 100 стаканов воды всего', 'water', s => s.waterTotal, 100),
    A('water_week', '🫗', 'Водная неделя', 'Достичь цели по воде в 7 разных дней', 'water', s => s.waterGoalDays, 7),

    A('streak_3', '🔥', '3 дня подряд', 'Серия из 3 дней', 'streak', s => s.best, 3),
    A('streak_7', '🌟', 'Неделя подряд', 'Серия из 7 дней', 'streak', s => s.best, 7),
    A('streak_14', '✨', 'Две недели', 'Серия из 14 дней', 'streak', s => s.best, 14),
    A('streak_30', '🏆', 'Месяц подряд', 'Серия из 30 дней', 'streak', s => s.best, 30),
    A('comeback', '🤗', 'С возвращением', 'Вернуться после паузы в 3 дня и больше. Мы всегда рады', 'streak', s => s.comeback, 1),

    A('lvl_2', '🐣', 'Вылупился', 'Дойти до 2 уровня', 'level', s => s.level, 2),
    A('lvl_3', '🧣', 'Уровень 3', 'Дойти до 3 уровня и получить шарф', 'level', s => s.level, 3),
    A('lvl_5', '🧢', 'Уровень 5', 'Дойти до 5 уровня и получить шапку', 'level', s => s.level, 5),
    A('lvl_8', '👑', 'Уровень 8', 'Дойти до 8 уровня и получить корону', 'level', s => s.level, 8),
    A('lvl_10', '🌈', 'Легенда', 'Дойти до 10 уровня', 'level', s => s.level, 10),
    A('xp_500', '⭐', '500 XP', 'Набрать 500 XP', 'level', s => s.xp, 500),

    A('perfect_day', '🎯', 'Идеальный день', 'Все приёмы пищи, цель по воде и хотя бы одно задание за день', 'special', s => s.perfectDays, 1),
    A('collector', '🐾', 'Коллекционер', 'Побыть со всеми питомцами', 'special', s => s.petsTried, s => s.petCount),
    A('designer', '🎨', 'Дизайнер', 'Сменить тему или цвет питомца', 'special', s => (s.theme || s.colors > 0) ? 1 : 0, 1),
    A('author', '✍️', 'Автор', 'Добавить своё задание или свою фразу', 'special', s => (s.customQuests + s.customPhrases) > 0 ? 1 : 0, 1),
    A('own_quest', '✅', 'Своё задание', 'Выполнить задание, которое придумала сама', 'special', s => s.customDone, 1),
    A('pet_love', '🫶', 'Любимчик', 'Погладить питомца 10 раз', 'special', s => s.taps, 10),
    A('name_it', '🏷️', 'Имя', 'Дать питомцу своё имя', 'special', s => s.renamed, 1),
    A('backup', '💾', 'Надёжно', 'Сохранить резервную копию данных', 'special', s => s.backup, 1)
  ];
  const tgt = (a, st) => typeof a.target === 'function' ? a.target(st) : a.target;
  /* Состояние всех достижений: { stats, list: [{...a, value, target, done}] } */
  function evalAch(S, ex) {
    const stats = computeStats(S, ex);
    const list = ACH.map(a => { const t = Math.max(1, tgt(a, stats)), v = Math.min(t, a.cur(stats) || 0); return { id: a.id, emoji: a.emoji, title: a.title, desc: a.desc, group: a.group, value: v, target: t, done: v >= t }; });
    return { stats, list };
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
      body: due.body, tag: due.tag, icon: 'icon-192.png', badge: 'icon-96.png',
      silent: !!settings.silent,
      data: { kind: due.kind, mealId: due.mealId || '', questId: due.questId || '' }
    };
  }


  /* ---------- План напоминаний наперёд (для Android-приложения: уведомления ставятся в будильник телефона) ---------- */
  function planSchedule(ctx, now, days) {
    const s = ctx.settings, out = [];
    if (!s || !s.notify) return out;
    days = days || 3;
    const pet = s.petName || 'Тоша', nowMs = now.getTime(), todayKey = dayKey(now);
    const atMin = (d0, min) => new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), Math.floor(min / 60), min % 60, 0, 0);
    for (let off = 0; off < days; off++) {
      const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off, 12), key = dayKey(d0);
      const slots = [];
      const add = (min, o) => {
        const at = atMin(d0, min);
        if (at.getTime() <= nowMs + 20000 || isQuiet(min, s.quietStart, s.quietEnd)) return false;
        slots.push(Object.assign({ at: at.getTime(), min }, o)); return true;
      };
      if (s.remindMeals) s.meals.forEach(m => {
        if (off === 0 && ctx.mealsLogged && ctx.mealsLogged[m.id]) return;
        add(toMin(m.time), { kind: 'meal', mealId: m.id, title: pet + ' напоминает 🍽', body: pick(MEAL_BODIES, 'meal:' + m.id + ':' + key).replace('{m}', m.name.toLowerCase()) });
      });
      if (s.remindSummary) add(toMin(s.summaryTime), { kind: 'summary', title: 'Итог дня 🌙', body: 'Загляни, ' + pet + ' хочет пожелать спокойной ночи. Записей может и не быть: без обид.' });
      if (s.remindMove) {
        let start = toMin(s.quietEnd) + 60;
        if (toMin(s.quietStart) <= toMin(s.quietEnd)) start = Math.max(start, 9 * 60);
        const used = slots.map(x => x.min);
        for (let i = 0, n = 0; n < s.maxMovePerDay && i < 12; i++) {
          const min = start + i * s.moveEveryMin;
          if (min >= 1440) break;
          if (used.some(u => Math.abs(u - min) < 45)) continue;
          const q = pickQuest(key, n, null, ctx.quests);
          n++;
          if (add(min, { kind: 'move', questId: q.id, title: 'Мини-задание от ' + pet, body: q.emoji + ' ' + q.text + ' · ' + q.dur })) used.push(min);
        }
      }
      slots.forEach(x => out.push(x));
    }
    out.sort((a, b) => a.at - b.at);
    out.forEach((x, i) => { x.id = i + 1; });
    return out;
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
    level, xpForLevel, qualifies, prevKey, streak, bestStreak, ACH, ACH_GROUPS, computeStats, evalAch,
    buildCtx, computeDue, markFired, pruneFired, notifOptions, planSchedule, idbGet, idbSet
  };
  root.ToshaCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
