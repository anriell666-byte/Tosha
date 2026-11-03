/* Тоша — движок анимаций. Всё считается кодом (Web Animations API), файлов анимаций нет.
   Питомец = слои: p-root (весь), p-body (корпус), p-face (голова), p-ears, a-arm-l/r, p-foot-l/r, a-tail, a-wing-l/r, p-prop, p-fx.
   Принципы: сжатие/растяжение (squash & stretch), подготовка к прыжку (anticipation), запаздывание ушей и хвоста (follow-through). */
(function (root) {
  'use strict';
  const P = root.ToshaPets;
  const NS = 'http://www.w3.org/2000/svg';
  const SOFT = 'cubic-bezier(.45,.05,.35,1)';
  const reduce = () => !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SEL = {
    root: '.p-root', body: '.p-body', fl: '.p-foot-l', fr: '.p-foot-r', al: '.a-arm-l', ar: '.a-arm-r', tail: '.a-tail',
    ears: '.p-ears', earL: '.a-ear-l', earR: '.a-ear-r', wl: '.a-wing-l', wr: '.a-wing-r', face: '.p-face',
    prop: '.p-prop', shadow: '.p-shadow', scarf: '.p-scarf', hat: '.p-hat'
  };

  /* ---------- Помощники ключевых кадров ---------- */
  const X = (x = 0, y = 0, r = 0, sx = 1, sy = sx) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${sx},${sy})`;
  const Rg = (s, e, fr) => fr.map(f => [s + (e - s) * f[0], f[1], f[2]]);
  const wag = (n, a, base = 0) => { const f = []; for (let i = 0; i <= n * 2; i++) f.push([i / (n * 2), X(0, 0, base + (i % 2 ? a : -a))]); return f; };
  const bobs = (n, h, y0 = 0) => { const f = []; for (let i = 0; i <= n * 2; i++) f.push([i / (n * 2), X(0, i % 2 ? -h : y0)]); return f; };
  function hops(n, h) {
    const r = [[0, X()]], s = [[0, X()]], k = 1 / n, sh = 1 - Math.min(.45, h / 110);
    for (let i = 0; i < n; i++) {
      const o = i * k;
      r.push([o + k * .16, X(0, 0, 0, 1.08, .9)], [o + k * .45, X(0, -h, 0, .95, 1.09)], [o + k * .75, X(0, 0, 0, 1.09, .89)], [o + k * .9, X(0, 0, 0, .99, 1.02)], [o + k, X()]);
      s.push([o + k * .16, X(0, 0, 0, 1.06)], [o + k * .45, X(0, 0, 0, sh)], [o + k * .75, X(0, 0, 0, 1.06)], [o + k * .9, X()], [o + k, X()]);
    }
    return { r, s };
  }
  function sway(n, amp, h) {   // покачивание в танце: начинается и заканчивается в покое
    const f = [[0, X()]], k = 1 / (n * 2);
    for (let i = 0; i < n * 2; i++) {
      const o = i * k, d = i % 2 ? 1 : -1;
      f.push([o + k * .5, X(d * -3, -h, d * -amp * .3, .97, 1.05)], [o + k, i === n * 2 - 1 ? X() : X(d * 3, 0, d * amp, 1.04, .96)]);
    }
    return f;
  }
  const flap = (c, n, a) => { c.T('wl', wag(n, a, -a)); c.T('wr', wag(n, -a, a)); };

  /* ---------- Реквизит ---------- */
  const apple = st => {
    const base = '<ellipse cx="100" cy="146" rx="14" ry="13" fill="#e8483f" stroke="#b92f2a" stroke-width="2"/><path d="M100 134q0-8 6-10" stroke="#6b3b25" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M103 129q8-6 13 0q-7 6-13 0z" fill="#5bbf72"/><ellipse cx="94" cy="141" rx="3" ry="4.5" fill="#fff" opacity=".35"/>';
    if (st === 0) return `<g>${base}</g>`;
    if (st === 1) return `<g>${base}<circle cx="111" cy="142" r="7" fill="var(--pet-light)"/></g>`;
    if (st === 2) return `<g>${base}<circle cx="110" cy="144" r="12" fill="var(--pet-light)"/><circle cx="96" cy="154" r="6" fill="var(--pet-light)"/></g>`;
    return '<g><path d="M95 136q5-3 10 0q3 10 0 20q-5 3-10 0q-3-10 0-20z" fill="#f6e7c1" stroke="#b92f2a" stroke-width="1.5"/><path d="M100 136v-6" stroke="#6b3b25" stroke-width="2" stroke-linecap="round"/></g>';
  };
  const bottle = (x, y, lvl) => `<g><rect x="${x - 9}" y="${y - 18}" width="18" height="36" rx="6" fill="#bfe6f7" stroke="#4aa3cf" stroke-width="2"/><rect x="${x - 5}" y="${y - 25}" width="10" height="8" rx="2" fill="#4aa3cf"/><rect x="${x - 7}" y="${y + 16 - lvl}" width="14" height="${lvl}" rx="3" fill="#5db9e6" opacity=".8"/></g>`;

  /* ---------- Библиотека ---------- */
  const LIB = {}, ORDER = [];
  const GROUPS = [
    { id: 'base', title: 'Базовые' }, { id: 'move', title: 'Движение' },
    { id: 'state', title: 'Состояния' }, { id: 'react', title: 'Реакции и награды' }, { id: 'evo', title: 'Эволюция' }
  ];
  function def(id, title, group, emoji, dur, loop, desc, build) {
    LIB[id] = { id, title, group, emoji, dur, loop, desc, build }; ORDER.push(id);
  }
  const burst = (c, cx, cy, items, delay, r) => items.forEach((e, i) => {
    const a = i / items.length * Math.PI * 2 - Math.PI / 2;
    c.fx(e, { x: cx + Math.cos(a) * 52, y: cy + Math.sin(a) * 52, dx: Math.cos(a) * 22, dy: Math.sin(a) * 22, size: 15, delay, d: 1000 });
  });

  /* — Базовые — */
  def('idle', 'Покой', 'base', '🙂', 6000, true, 'Дышит, моргает, иногда шевелит ухом и хвостом', c => {
    c.T('body', [[0, X()], [.5, X(0, 0, 1.2)], [1, X()]]);
    c.T('face', [[0, X()], [.25, X(0, 0, -3)], [.5, X()], [.75, X(0, 0, 3)], [1, X()]]);
    c.T('earL', [[0, X()], [.58, X()], [.62, X(0, 0, -9)], [.68, X(0, 0, 2)], [.74, X()], [1, X()]]);
    c.T('tail', [[0, X(0, 0, -5)], [.5, X(0, 0, 6)], [1, X(0, 0, -5)]]);
    c.mood(0, 'neutral');
  });
  def('happy', 'Радость', 'base', '😊', 1800, false, 'Подпрыгивает, улыбается, машет лапками', c => {
    const h = hops(2, 22); c.T('root', h.r); c.T('shadow', h.s);
    c.T('al', [[0, X()], [.15, X(0, 0, 12)], [.35, X(0, 0, 75)], [.5, X(0, 0, 58)], [.65, X(0, 0, 75)], [.85, X(0, 0, 15)], [1, X()]]);
    c.T('ar', [[0, X()], [.15, X(0, 0, -12)], [.35, X(0, 0, -75)], [.5, X(0, 0, -58)], [.65, X(0, 0, -75)], [.85, X(0, 0, -15)], [1, X()]]);
    c.T('face', [[0, X()], [.35, X(0, -2, -4)], [.75, X(0, -2, 4)], [1, X()]]);
    c.T('ears', [[0, X()], [.2, X(0, 2)], [.45, X(0, -3, -4)], [.7, X(0, 1, 3)], [1, X()]]);
    c.T('tail', wag(4, 14)); flap(c, 2, 10);
    c.mood(0, 'happy'); c.fx('✨', { x: 36, y: 60, dy: -16, delay: 300 }); c.fx('✨', { x: 164, y: 66, dy: -16, delay: 600 });
  });
  def('excited', 'Восторг', 'base', '🤩', 2400, false, 'Несколько прыжков, сияющие глаза, искры', c => {
    const h = hops(3, 32); c.T('root', h.r); c.T('shadow', h.s);
    c.T('al', wag(6, 14, 80)); c.T('ar', wag(6, -14, -80));
    c.T('face', [[0, X()], [.2, X(0, -3, -5)], [.5, X(0, -3, 5)], [.8, X(0, -3, -4)], [1, X()]]);
    c.T('ears', wag(6, 5)); c.T('tail', wag(8, 16)); flap(c, 4, 16);
    c.mood(0, 'excited'); c.mood(.9, 'happy'); burst(c, 100, 100, ['✨', '⭐', '✨', '⭐', '✨', '✨'], 350, 62);
  });
  def('sad', 'Грусть', 'base', '🥺', 4400, true, 'Голова чуть опущена, медленные движения. Мягко, без укора', c => {
    c.T('body', [[0, X(0, 1, 0, 1.01, .97)], [.5, X(0, 3, 0, 1.02, .94)], [1, X(0, 1, 0, 1.01, .97)]]);
    c.T('face', [[0, X(0, 3, -2)], [.5, X(0, 7, -4)], [1, X(0, 3, -2)]]);
    c.T('ears', [[0, X(0, 3)], [.5, X(0, 6, 0, 1, .97)], [1, X(0, 3)]]);
    c.T('al', [[0, X(0, 0, -6)], [.5, X(0, 0, -10)], [1, X(0, 0, -6)]]); c.T('ar', [[0, X(0, 0, 6)], [.5, X(0, 0, 10)], [1, X(0, 0, 6)]]);
    c.T('tail', [[0, X(0, 0, 28)], [.5, X(0, 0, 36)], [1, X(0, 0, 28)]]);
    c.mood(0, 'sad');
  });
  def('sleep', 'Сон', 'base', '😴', 5600, true, 'Сворачивается, закрывает глаза, спокойно дышит', c => {
    c.T('root', [[0, X(0, 7, 0, 1.1, .82)], [.5, X(0, 7, 0, 1.12, .845)], [1, X(0, 7, 0, 1.1, .82)]]);
    c.T('face', [[0, X(0, 8, 10)], [.5, X(0, 9, 10)], [1, X(0, 8, 10)]]);
    c.T('ears', [[0, X(0, 4)], [1, X(0, 4)]]);
    c.T('al', [[0, X(0, 0, -14)], [1, X(0, 0, -14)]]); c.T('ar', [[0, X(0, 0, 14)], [1, X(0, 0, 14)]]);
    c.T('tail', [[0, X(0, 0, 36)], [.5, X(0, 0, 40)], [1, X(0, 0, 36)]]);
    c.mood(0, 'sleepy');
    [0, 933, 1866].forEach((d, i) => c.fx('z', { x: 150 + i * 8, y: 62 - i * 14, size: 15 + i * 4, dx: 10, dy: -16, d: 2800, delay: d, loop: true, fill: 'var(--muted)', bold: true }));
  });
  def('wakeup', 'Пробуждение', 'base', '🥱', 4000, false, 'Просыпается, потягивается, зевает и оживает', c => {
    c.T('root', [[0, X(0, 7, 0, 1.1, .82)], [.2, X(0, 5, 0, 1.08, .88)], [.35, X(0, -2, 0, .94, 1.14)], [.55, X(0, -2, 0, .94, 1.14)], [.68, X(0, 0, 0, 1.06, .93)], [.78, X(0, 0, 0, .98, 1.02)], [1, X()]]);
    c.T('face', [[0, X(0, 8, 10)], [.3, X(0, 6, 10)], [.4, X(0, -2, -8)], [.55, X(0, -2, -8)], [.7, X()], [.8, X()], [.85, X(0, 0, 3)], [.92, X(0, 0, -3)], [1, X()]]);
    c.T('al', [[0, X(0, 0, -8)], [.3, X(0, 0, -8)], [.4, X(0, 0, 150)], [.55, X(0, 0, 150)], [.7, X(0, 0, 10)], [1, X()]]);
    c.T('ar', [[0, X(0, 0, 8)], [.3, X(0, 0, 8)], [.4, X(0, 0, -150)], [.55, X(0, 0, -150)], [.7, X(0, 0, -10)], [1, X()]]);
    c.T('tail', [[0, X(0, 0, 36)], [.6, X(0, 0, 36)], [.8, X(0, 0, -10)], [1, X()]]);
    c.T('ears', [[0, X(0, 4)], [.7, X(0, 4)], [.8, X(0, -3)], [1, X()]]);
    c.mood(0, 'sleepy'); c.mood(.3, 'yawn'); c.mood(.58, 'neutral'); c.mood(.82, 'happy');
  });

  /* — Движение — */
  def('walk', 'Ходьба', 'move', '🚶', 1400, true, 'Бодро шагает на месте', c => {
    c.T('root', bobs(2, 4)); c.T('body', [[0, X(0, 0, -2.5)], [.5, X(0, 0, 2.5)], [1, X(0, 0, -2.5)]]);
    c.T('fl', [[0, X(-5, 0)], [.2, X(0, -9)], [.5, X(5, 0)], [1, X(-5, 0)]]); c.T('fr', [[0, X(5, 0)], [.5, X(-5, 0)], [.7, X(0, -9)], [1, X(5, 0)]]);
    c.T('al', [[0, X(0, 0, 22)], [.5, X(0, 0, -8)], [1, X(0, 0, 22)]]); c.T('ar', [[0, X(0, 0, -22)], [.5, X(0, 0, 8)], [1, X(0, 0, -22)]]);
    c.T('face', [[0, X(0, 0, 2)], [.5, X(0, 0, -2)], [1, X(0, 0, 2)]]);
    c.T('ears', [[0, X()], [.25, X(0, 2, 0, 1, .98)], [.5, X()], [.75, X(0, 2, 0, 1, .98)], [1, X()]]); c.T('tail', wag(2, 8));
    c.mood(0, 'happy');
  });
  def('run', 'Бег', 'move', '🏃', 760, true, 'Быстрый бег: лапки и корпус в работе', c => {
    c.T('root', [[0, X(0, 0, 0, 1.04, .96)], [.25, X(0, -11, 0, .97, 1.05)], [.5, X(0, 0, 0, 1.04, .95)], [.75, X(0, -11, 0, .97, 1.05)], [1, X(0, 0, 0, 1.04, .96)]]);
    c.T('body', [[0, X(0, 0, 8)], [1, X(0, 0, 8)]]);
    c.T('fl', [[0, X(-11, 0)], [.25, X(2, -13)], [.5, X(11, 0)], [1, X(-11, 0)]]); c.T('fr', [[0, X(11, 0)], [.5, X(-11, 0)], [.75, X(2, -13)], [1, X(11, 0)]]);
    c.T('al', [[0, X(0, 0, 55)], [.5, X(0, 0, -25)], [1, X(0, 0, 55)]]); c.T('ar', [[0, X(0, 0, -55)], [.5, X(0, 0, 25)], [1, X(0, 0, -55)]]);
    c.T('face', [[0, X(3, 1, 6)], [1, X(3, 1, 6)]]); c.T('ears', wag(2, 6, -6)); c.T('tail', wag(2, 10, 18)); flap(c, 2, 12);
    c.mood(0, 'happy'); c.fx('💨', { x: 30, y: 176, size: 16, dx: -26, dy: -4, d: 760, loop: true });
  });
  def('jump', 'Прыжки', 'move', '🦘', 1300, true, 'Прыжки на месте с разгоном и мягким приземлением', c => {
    c.T('root', [[0, X()], [.2, X(0, 0, 0, 1.12, .84)], [.45, X(0, -42, 0, .92, 1.14)], [.6, X(0, -38, 0, .94, 1.1)], [.82, X(0, 0, 0, 1.12, .84)], [.93, X(0, 0, 0, .98, 1.03)], [1, X()]]);
    c.T('shadow', [[0, X()], [.2, X(0, 0, 0, 1.08)], [.5, X(0, 0, 0, .65)], [.82, X(0, 0, 0, 1.08)], [1, X()]]);
    c.T('al', [[0, X()], [.2, X(0, 0, -10)], [.45, X(0, 0, 105)], [.7, X(0, 0, 60)], [.82, X(0, 0, -5)], [1, X()]]);
    c.T('ar', [[0, X()], [.2, X(0, 0, 10)], [.45, X(0, 0, -105)], [.7, X(0, 0, -60)], [.82, X(0, 0, 5)], [1, X()]]);
    c.T('ears', [[0, X()], [.2, X(0, 3)], [.5, X(0, -5, 0, 1, 1.05)], [.82, X(0, 4)], [1, X()]]); c.T('tail', wag(2, 12)); flap(c, 2, 14);
    c.mood(0, 'excited');
  });
  def('squats', 'Приседания', 'move', '🏋️', 2800, true, 'Плавно приседает, руки вперёд для равновесия', c => {
    c.T('root', [[0, X()], [.4, X(0, 0, 0, 1.1, .74)], [.55, X(0, 0, 0, 1.1, .74)], [.85, X(0, -3, 0, .97, 1.04)], [1, X()]]);
    c.T('body', [[0, X()], [.4, X(0, 0, -5)], [.55, X(0, 0, -5)], [.85, X()], [1, X()]]);
    c.T('fl', [[0, X()], [.4, X(-8, 0)], [.55, X(-8, 0)], [.85, X()], [1, X()]]); c.T('fr', [[0, X()], [.4, X(8, 0)], [.55, X(8, 0)], [.85, X()], [1, X()]]);
    c.T('al', [[0, X()], [.4, X(0, 0, 85)], [.55, X(0, 0, 85)], [.85, X(0, 0, -4)], [1, X()]]); c.T('ar', [[0, X()], [.4, X(0, 0, -85)], [.55, X(0, 0, -85)], [.85, X(0, 0, 4)], [1, X()]]);
    c.T('ears', [[0, X()], [.4, X(0, 3)], [.55, X(0, 3)], [.85, X(0, -3)], [1, X()]]); c.T('tail', [[0, X()], [.4, X(0, 0, -10)], [.55, X(0, 0, -10)], [1, X()]]);
    c.mood(0, 'motivated');
  });
  def('stretch', 'Растяжка', 'move', '🙆', 4000, false, 'Тянется вверх, наклоняется в стороны', c => {
    c.T('root', [[0, X()], [.14, X(0, 0, 0, 1.06, .92)], [.28, X(0, -2, 0, .93, 1.16)], [.82, X(0, -2, 0, .93, 1.16)], [.92, X(0, 0, 0, 1.04, .95)], [1, X()]]);
    c.T('body', [[0, X()], [.3, X()], [.45, X(0, 0, -12)], [.62, X(0, 0, 12)], [.78, X()], [1, X()]]);
    c.T('face', [[0, X()], [.45, X(0, 0, -8)], [.62, X(0, 0, 8)], [.78, X()], [1, X()]]);
    c.T('al', [[0, X()], [.28, X(0, 0, 165)], [.8, X(0, 0, 165)], [.95, X(0, 0, 5)], [1, X()]]); c.T('ar', [[0, X()], [.28, X(0, 0, -165)], [.8, X(0, 0, -165)], [.95, X(0, 0, -5)], [1, X()]]);
    c.T('tail', wag(3, 8)); c.T('ears', [[0, X()], [.3, X(0, -4, 0, 1, 1.05)], [.8, X(0, -4, 0, 1, 1.05)], [1, X()]]);
    c.mood(0, 'relaxed'); c.mood(.9, 'happy');
  });
  def('dance', 'Танец', 'move', '💃', 1800, true, 'Весёлый танец с покачиванием и нотками', c => {
    c.T('root', sway(2, 6, 10)); c.T('shadow', [[0, X()], [.25, X(0, 0, 0, .94)], [.5, X()], [.75, X(0, 0, 0, .94)], [1, X()]]);
    c.T('al', [[0, X(0, 0, 120)], [.5, X(0, 0, 20)], [1, X(0, 0, 120)]]); c.T('ar', [[0, X(0, 0, -20)], [.5, X(0, 0, -120)], [1, X(0, 0, -20)]]);
    c.T('face', [[0, X(0, 0, 5)], [.5, X(0, 0, -5)], [1, X(0, 0, 5)]]);
    c.T('ears', wag(4, 5)); c.T('tail', wag(4, 16)); flap(c, 2, 12);
    c.mood(0, 'happy');
    c.fx('🎵', { x: 30, y: 54, dx: -6, dy: -26, d: 1800, loop: true }); c.fx('🎶', { x: 172, y: 60, dx: 6, dy: -26, d: 1800, delay: 900, loop: true });
  });

  /* — Состояния — */
  def('hungry', 'Проголодался', 'state', '😋', 2800, true, 'Гладит животик, смотрит большими глазами, мечтает о яблоке', c => {
    c.T('ar', [[0, X()], [.15, X(0, 0, 50)], [.3, X(0, 0, 60)], [.45, X(0, 0, 48)], [.6, X(0, 0, 60)], [.75, X(0, 0, 50)], [.9, X(0, 0, 5)], [1, X()]]);
    c.T('body', [[0, X()], [.15, X(0, 0, 2, 1, .98)], [.45, X(0, 0, 2, 1.02, .97)], [.75, X(0, 0, 2, 1, .98)], [1, X()]]);
    c.T('face', [[0, X()], [.3, X(0, -2, -5)], [.7, X(0, -2, 5)], [1, X()]]);
    c.T('ears', [[0, X()], [.5, X(0, 2)], [1, X()]]);
    c.mood(0, 'hungry');
    c.fx('💭', { x: 156, y: 40, size: 30, dy: -4, d: 2800, loop: true }); c.fx('🍎', { x: 156, y: 38, size: 14, dy: -4, d: 2800, loop: true });
  });
  def('eat', 'Кушает', 'state', '🍎', 4200, false, 'С удовольствием ест яблоко', c => {
    c.propAt(0, apple(0)); c.propAt(.32, apple(1)); c.propAt(.52, apple(2)); c.propAt(.72, apple(3)); c.propAt(.86, '');
    c.T('al', [[0, X()], [.12, X(0, 0, -50)], [.8, X(0, 0, -50)], [.92, X()], [1, X()]]); c.T('ar', [[0, X()], [.12, X(0, 0, 50)], [.8, X(0, 0, 50)], [.92, X()], [1, X()]]);
    const b = [[0, X()]]; for (let i = 0; i < 8; i++) { const t = .2 + i * .075; b.push([t, X(0, 0, 0, 1, .97)], [t + .035, X()]); } b.push([1, X()]);
    c.T('body', b); c.T('face', [[0, X()], [.2, X(0, 2, 0)], [.8, X(0, 2, 0)], [1, X()]]); c.T('tail', wag(4, 10)); c.T('ears', wag(4, 3));
    c.mood(0, 'hungry'); c.mood(.14, 'chew2'); c.mood(.24, 'chew1');
    for (let i = 0; i < 8; i++) c.mood(.3 + i * .06, i % 2 ? 'chew1' : 'chew2');
    c.mood(.8, 'happy'); c.fx('✨', { x: 60, y: 90, dy: -14, delay: 3400 }); c.fx('✨', { x: 142, y: 84, dy: -14, delay: 3600 });
  });
  def('thirsty', 'Хочет пить', 'state', '🥵', 3000, true, 'Замечает бутылку воды и тянется к ней', c => {
    c.prop(bottle(176, 150, 22));
    c.T('ar', [[0, X()], [.25, X(0, 0, -6)], [.4, X(0, 0, -26)], [.55, X(0, 0, -17)], [.7, X(0, 0, -26)], [.9, X(0, 0, -6)], [1, X()]]);
    c.T('body', [[0, X()], [.3, X(0, 0, 5)], [.7, X(0, 0, 5)], [1, X()]]);
    c.T('face', [[0, X()], [.3, X(2, 0, 7)], [.7, X(2, 0, 7)], [1, X()]]);
    c.T('tail', wag(2, 8)); c.T('ears', [[0, X()], [.3, X(0, -3)], [.7, X(0, -3)], [1, X()]]);
    c.mood(0, 'surprised'); c.mood(.3, 'hungry'); c.mood(.85, 'surprised');
    c.fx('💧', { x: 176, y: 108, size: 14, dy: -12, d: 1500, loop: true });
  });
  def('drink', 'Пьёт', 'state', '🥤', 3600, false, 'Берёт бутылку, делает глотки и довольно улыбается', c => {
    c.propOrigin(100, 132);
    c.propAt(0, bottle(100, 146, 24)); c.propAt(.42, bottle(100, 146, 17)); c.propAt(.58, bottle(100, 146, 11)); c.propAt(.72, bottle(100, 146, 6));
    c.T('prop', [[0, X(0, 18, 0)], [.14, X(0, 0, 0)], [.28, X(-3, -22, -30)], [.7, X(-3, -22, -34)], [.82, X(0, 0, 0)], [.92, X(0, 16, 0)], [1, X(0, 16, 0)]]);
    c.T('al', [[0, X()], [.14, X(0, 0, -52)], [.84, X(0, 0, -52)], [.94, X()], [1, X()]]); c.T('ar', [[0, X()], [.14, X(0, 0, 52)], [.84, X(0, 0, 52)], [.94, X()], [1, X()]]);
    c.T('body', [[0, X()], [.4, X()], [.45, X(0, 0, 0, 1.02, 1.03)], [.5, X()], [.58, X(0, 0, 0, 1.02, 1.03)], [.63, X()], [.72, X(0, 0, 0, 1.02, 1.03)], [.77, X()], [1, X()]]);
    c.T('face', [[0, X()], [.28, X(0, -3, -4)], [.7, X(0, -3, -4)], [.85, X()], [1, X()]]); c.T('tail', wag(3, 9));
    c.mood(0, 'neutral'); c.mood(.26, 'sip'); c.mood(.84, 'happy'); c.fx('💧', { x: 70, y: 100, dy: 14, delay: 2800, d: 700 }); c.fx('✨', { x: 140, y: 80, dy: -14, delay: 3000 });
  });
  def('tired', 'Устал', 'state', '😪', 3600, true, 'Замедляется, сутулится, зевает', c => {
    c.T('body', [[0, X(0, 2, -1.5, 1.03, .95)], [.5, X(0, 3, 1.5, 1.04, .93)], [1, X(0, 2, -1.5, 1.03, .95)]]);
    c.T('face', [[0, X(0, 5, -5)], [.45, X(0, 6, -5)], [.55, X(0, 0, 4)], [.7, X(0, 5, -5)], [1, X(0, 5, -5)]]);
    c.T('ears', [[0, X(0, 4)], [.5, X(0, 6)], [1, X(0, 4)]]);
    c.T('al', [[0, X(0, 0, -10)], [.5, X(0, 0, -12)], [1, X(0, 0, -10)]]); c.T('ar', [[0, X(0, 0, 10)], [.5, X(0, 0, 12)], [1, X(0, 0, 10)]]);
    c.T('tail', [[0, X(0, 0, 30)], [.5, X(0, 0, 34)], [1, X(0, 0, 30)]]);
    c.mood(0, 'tired'); c.mood(.45, 'yawn'); c.mood(.66, 'tired');
    c.fx('💤', { x: 150, y: 60, size: 17, dy: -16, d: 3600, loop: true });
  });
  def('exhausted', 'Выдохся', 'state', '😮‍💨', 5400, false, 'Садится, тяжело дышит после тренировки, потом отдыхает', c => {
    const sit = X(0, 6, 0, 1.12, .8);
    c.T('root', [[0, X()], [.1, X(0, 0, 0, 1.06, .92)], [.26, sit], [.84, sit], [.94, X(0, 0, 0, .97, 1.04)], [1, X()]]);
    c.T('fl', [[0, X()], [.26, X(-10, 2)], [.84, X(-10, 2)], [.94, X()], [1, X()]]); c.T('fr', [[0, X()], [.26, X(10, 2)], [.84, X(10, 2)], [.94, X()], [1, X()]]);
    const br = [[0, X()], [.28, X()]]; for (let i = 0; i < 4; i++) { const t = .32 + i * .08; br.push([t, X(0, 0, 0, 1.04, 1.05)], [t + .04, X()]); }
    br.push([.7, X()], [.76, X(0, 0, 0, 1.02, 1.03)], [.82, X()], [1, X()]); c.T('body', br);
    c.T('face', [[0, X()], [.26, X(0, 4, -6)], [.84, X(0, 4, -6)], [1, X()]]);
    c.T('al', [[0, X()], [.26, X(0, 0, -4)], [.84, X(0, 0, -4)], [1, X()]]); c.T('ar', [[0, X()], [.26, X(0, 0, 4)], [.84, X(0, 0, 4)], [1, X()]]);
    c.T('ears', [[0, X()], [.26, X(0, 4)], [.84, X(0, 4)], [1, X()]]); c.T('tail', [[0, X()], [.26, X(0, 0, 28)], [.84, X(0, 0, 28)], [1, X()]]);
    c.mood(0, 'happy'); c.mood(.14, 'pant'); c.mood(.3, 'tired'); c.mood(.4, 'pant'); c.mood(.5, 'tired'); c.mood(.6, 'pant'); c.mood(.7, 'relaxed');
    c.fx('💦', { x: 44, y: 70, size: 14, dy: 16, d: 1200, delay: 500 }); c.fx('💦', { x: 156, y: 76, size: 12, dy: 16, d: 1200, delay: 1400 });
  });
  def('relaxed', 'Расслабился', 'state', '😌', 6000, true, 'Спокойно сидит с закрытыми глазами', c => {
    c.T('root', [[0, X(0, 4, 0, 1.06, .93)], [.5, X(0, 4, 0, 1.07, .945)], [1, X(0, 4, 0, 1.06, .93)]]);
    c.T('face', [[0, X(0, 3, -3)], [.5, X(0, 3, 3)], [1, X(0, 3, -3)]]); c.T('ears', [[0, X(0, 2)], [1, X(0, 2)]]);
    c.T('al', [[0, X(0, 0, -5)], [1, X(0, 0, -5)]]); c.T('ar', [[0, X(0, 0, 5)], [1, X(0, 0, 5)]]);
    c.T('tail', [[0, X(0, 0, 14)], [.5, X(0, 0, 22)], [1, X(0, 0, 14)]]);
    c.mood(0, 'relaxed'); c.fx('🌸', { x: 156, y: 64, size: 14, dx: 10, dy: -16, d: 4200, loop: true });
  });
  def('motivated', 'Настрой', 'state', '💪', 2600, false, 'Уверенная поза, готов двигаться дальше', c => {
    c.T('root', [[0, X()], [.18, X(0, 0, 0, 1.06, .92)], [.4, X(0, -6, 0, .96, 1.08)], [.55, X(0, 0, 0, 1.02, .99)], [.85, X(0, 0, 0, 1.02, .99)], [1, X()]]);
    c.T('body', [[0, X()], [.5, X(0, 0, 0, 1.04, 1.05)], [.85, X(0, 0, 0, 1.04, 1.05)], [1, X()]]);
    c.T('face', [[0, X()], [.5, X(0, -2, -3)], [.85, X(0, -2, -3)], [1, X()]]);
    c.T('al', [[0, X()], [.4, X(0, 0, 100)], [.5, X(0, 0, 72)], [.6, X(0, 0, 100)], [.7, X(0, 0, 72)], [.85, X(0, 0, 100)], [1, X()]]);
    c.T('ar', [[0, X()], [.4, X(0, 0, -100)], [.5, X(0, 0, -72)], [.6, X(0, 0, -100)], [.7, X(0, 0, -72)], [.85, X(0, 0, -100)], [1, X()]]);
    c.T('tail', wag(3, 10)); c.T('ears', [[0, X()], [.5, X(0, -3, 0, 1, 1.04)], [.85, X(0, -3, 0, 1, 1.04)], [1, X()]]);
    c.mood(0, 'neutral'); c.mood(.2, 'motivated'); c.fx('✨', { x: 64, y: 70, dy: -12, delay: 900 }); c.fx('✨', { x: 138, y: 72, dy: -12, delay: 1100 });
  });

  /* — Реакции — */
  def('greet', 'Приветствие', 'react', '👋', 2600, false, 'Радуется, что вы вернулись, и машет лапкой', c => {
    c.T('root', [[0, X()], [.12, X(0, 0, 0, 1.06, .92)], [.28, X(0, -14, 0, .96, 1.07)], [.44, X(0, 0, 0, 1.07, .9)], [.55, X()], [1, X()]]);
    c.T('shadow', [[0, X()], [.28, X(0, 0, 0, .85)], [.44, X(0, 0, 0, 1.06)], [.55, X()], [1, X()]]);
    c.T('ar', [[0, X()], [.3, X(0, 0, -10)], [.45, X(0, 0, -140)], [.55, X(0, 0, -172)], [.65, X(0, 0, -136)], [.75, X(0, 0, -172)], [.85, X(0, 0, -136)], [.95, X(0, 0, -10)], [1, X()]]);
    c.T('face', [[0, X()], [.5, X(0, -2, -5)], [.9, X(0, -2, -3)], [1, X()]]); c.T('tail', wag(5, 12)); c.T('ears', [[0, X()], [.3, X(0, -4, 0, 1, 1.05)], [.9, X(0, -3)], [1, X()]]);
    c.mood(0, 'neutral'); c.mood(.22, 'happy'); c.fx('✨', { x: 160, y: 50, dy: -14, delay: 900 });
  });
  def('cheer', 'Тренировка завершена', 'react', '🎉', 2800, false, 'Прыгает от радости, вокруг звёздочки', c => {
    const h = hops(3, 36); c.T('root', h.r); c.T('shadow', h.s);
    c.T('al', wag(6, 12, 118)); c.T('ar', wag(6, -12, -118));
    c.T('face', [[0, X()], [.3, X(0, -3, -5)], [.6, X(0, -3, 5)], [1, X()]]); c.T('ears', wag(6, 5)); c.T('tail', wag(8, 16)); flap(c, 4, 16);
    c.mood(0, 'excited'); c.mood(.9, 'happy'); burst(c, 100, 90, ['⭐', '✨', '⭐', '✨', '⭐', '✨', '⭐', '✨'], 400, 68);
  });
  def('celebrate', 'Цель достигнута', 'react', '🏆', 4400, false, 'Праздничный танец и конфетти', c => {
    const h = hops(2, 32), sw = sway(3, 6, 10);
    c.T('root', Rg(0, .4, h.r).concat(Rg(.4, 1, sw))); c.T('shadow', Rg(0, .4, h.s).concat([[1, X()]]));
    c.T('al', wag(10, 22, 90)); c.T('ar', wag(10, -22, -90));
    c.T('face', wag(5, 5)); c.T('ears', wag(8, 5)); c.T('tail', wag(10, 16)); flap(c, 5, 14);
    c.mood(0, 'excited'); c.mood(.92, 'happy');
    ['🎉', '✨', '🎊', '⭐', '🎉', '✨', '🎊'].forEach((e, i) => c.fx(e, { x: 20 + i * 26, y: -6, size: 18, dy: 150 + (i % 3) * 20, dx: (i % 2 ? 10 : -10), d: 2400, delay: i * 340 }));
    c.fx('🎵', { x: 30, y: 60, dy: -26, d: 1800, delay: 1800 }); c.fx('🎶', { x: 172, y: 66, dy: -26, d: 1800, delay: 2600 });
  });
  def('surprise', 'Награда!', 'react', '🎁', 3000, false, 'Сначала удивляется, потом радуется', c => {
    c.T('root', [[0, X()], [.1, X(0, 0, 0, 1.08, .9)], [.18, X(0, -18, 0, .92, 1.14)], [.3, X(0, 0, 0, 1.1, .88)], [.4, X(0, 0, 0, .98, 1.02)], [.5, X()], [.6, X(0, 0, 0, 1.06, .92)], [.72, X(0, -28, 0, .95, 1.08)], [.84, X(0, 0, 0, 1.08, .9)], [1, X()]]);
    c.T('shadow', [[0, X()], [.18, X(0, 0, 0, .8)], [.3, X(0, 0, 0, 1.06)], [.5, X()], [.72, X(0, 0, 0, .78)], [.84, X(0, 0, 0, 1.06)], [1, X()]]);
    c.T('al', [[0, X()], [.18, X(0, 0, 48)], [.5, X(0, 0, 30)], [.72, X(0, 0, 105)], [.9, X(0, 0, 20)], [1, X()]]); c.T('ar', [[0, X()], [.18, X(0, 0, -48)], [.5, X(0, 0, -30)], [.72, X(0, 0, -105)], [.9, X(0, 0, -20)], [1, X()]]);
    c.T('face', [[0, X()], [.2, X(0, 2, 0)], [.5, X(0, 0, 0)], [.72, X(0, -3, -4)], [1, X()]]); c.T('ears', [[0, X()], [.2, X(0, -5, 0, 1, 1.07)], [.5, X()], [1, X()]]); c.T('tail', wag(5, 14)); flap(c, 3, 14);
    c.mood(0, 'surprised'); c.mood(.5, 'excited'); c.mood(.9, 'happy');
    c.fx('🎁', { x: 100, y: 30, size: 28, dy: -6, d: 1900 }); c.fx('✨', { x: 62, y: 44, dy: -12, delay: 1500 }); c.fx('⭐', { x: 140, y: 40, dy: -14, delay: 1700 });
  });
  def('levelup', 'Новый уровень', 'react', '🌟', 3800, false, 'Собирается, взлетает, вспышка света и сияние', c => {
    c.T('root', [[0, X()], [.2, X(0, 0, 0, 1.14, .8)], [.38, X(0, -54, 0, .9, 1.2)], [.55, X(0, -48, 0, .92, 1.16)], [.72, X(0, 0, 0, 1.14, .8)], [.82, X(0, 0, 0, .97, 1.04)], [.9, X(0, 0, 0, 1.08)], [1, X()]]);
    c.T('shadow', [[0, X()], [.2, X(0, 0, 0, 1.1)], [.45, X(0, 0, 0, .55)], [.72, X(0, 0, 0, 1.1)], [1, X()]]);
    c.T('al', [[0, X()], [.2, X(0, 0, -10)], [.4, X(0, 0, 150)], [.62, X(0, 0, 130)], [.8, X(0, 0, 10)], [1, X()]]); c.T('ar', [[0, X()], [.2, X(0, 0, 10)], [.4, X(0, 0, -150)], [.62, X(0, 0, -130)], [.8, X(0, 0, -10)], [1, X()]]);
    c.T('face', [[0, X()], [.38, X(0, -3, 0)], [.6, X(0, -3, 0)], [1, X()]]); c.T('ears', [[0, X()], [.2, X(0, 4)], [.45, X(0, -6, 0, 1, 1.08)], [.72, X(0, 4)], [1, X()]]); c.T('tail', wag(5, 14)); flap(c, 3, 16);
    c.mood(0, 'neutral'); c.mood(.18, 'motivated'); c.mood(.36, 'excited'); c.mood(.85, 'happy');
    c.ring(100, 96, '#ffc83d', 1100, 1200); c.ring(100, 96, '#ffffff', 1260, 1200);
    burst(c, 100, 100, ['🌟', '✨', '⭐', '✨', '🌟', '✨', '⭐', '✨'], 1300, 80);
  });
  def('drinkOk', 'Выпил воды', 'react', '💧', 2000, false, 'Улыбается и показывает «класс»', c => {
    c.T('root', [[0, X()], [.2, X(0, 0, 0, 1.04, .95)], [.4, X(0, -6, 0, .98, 1.04)], [.6, X(0, 0, 0, 1.04, .95)], [1, X()]]);
    c.T('ar', [[0, X()], [.25, X(0, 0, -112)], [.4, X(0, 0, -96)], [.55, X(0, 0, -112)], [.75, X(0, 0, -100)], [.92, X(0, 0, -8)], [1, X()]]);
    c.T('face', [[0, X()], [.3, X(0, 1, -4)], [.45, X(0, -1, 2)], [.7, X(0, 1, -3)], [1, X()]]); c.T('tail', wag(3, 10)); c.T('ears', wag(3, 4));
    c.mood(0, 'happy'); c.fx('💧', { x: 56, y: 70, dy: -14, d: 1300 }); c.fx('👍', { x: 168, y: 66, size: 18, dy: -14, delay: 500, d: 1300 });
  });


  /* — Эволюция — */
  const SHELL = 'M46 66C44 6 156 6 154 66L140 56L126 70L112 52L98 70L86 52L72 70L60 56Z';
  const shellHalf = (side) => `<defs><clipPath id="evc${side}"><rect x="${side === 'L' ? 0 : 100}" y="0" width="100" height="90"/></clipPath></defs><g clip-path="url(#evc${side})"><path d="${SHELL}" fill="#fffaf0" stroke="#e5cfae" stroke-width="3" stroke-linejoin="round"/>${side === 'L' ? '<path d="M100 14L92 30L104 40L94 56L100 66" fill="none" stroke="#c9a77a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' : ''}</g>`;
  const flash = '<defs><radialGradient id="evfl"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff6c8" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="110" r="40" fill="url(#evfl)"/>';
  const pop = (a, b, c1) => [[0, X(0, 0, 0, 0)], [a, X(0, 0, 0, 0)], [b, X(0, 0, 0, 1.3)], [c1, X()], [1, X()]];
  def('hatch', 'Вылупление', 'evo', '🐣', 4400, false, 'Скорлупа дрожит, трескается и слетает — появляются ушки', c => {
    c.shape(shellHalf('L'), [[0, X(), 1], [.08, X(0, 0, -4), 1], [.16, X(0, 0, 4), 1], [.24, X(0, 0, -5), 1], [.32, X(0, -2, 5), 1], [.4, X(0, 0, -6), 1], [.46, X(0, -3, 0), 1], [.5, X(-8, -22, -28), 1], [.75, X(-38, 20, -75), .8], [.9, X(-52, 70, -110), 0], [1, X(-52, 70, -110), 0]], { origin: '100px 66px' });
    c.shape(shellHalf('R'), [[0, X(), 1], [.08, X(0, 0, -4), 1], [.16, X(0, 0, 4), 1], [.24, X(0, 0, -5), 1], [.32, X(0, -2, 5), 1], [.4, X(0, 0, -6), 1], [.46, X(0, -3, 0), 1], [.5, X(8, -26, 24), 1], [.75, X(38, 14, 70), .8], [.9, X(54, 66, 110), 0], [1, X(54, 66, 110), 0]], { origin: '100px 66px' });
    c.T('root', [[0, X()], [.1, X(0, 0, 0, 1.03, .97)], [.46, X(0, 0, 0, 1.03, .97)], [.52, X(0, 0, 0, .94, 1.12)], [.62, X(0, -26, 0, .93, 1.12)], [.74, X(0, 0, 0, 1.12, .88)], [.84, X(0, 0, 0, .98, 1.03)], [1, X()]]);
    c.T('shadow', [[0, X()], [.62, X(0, 0, 0, .7)], [.74, X(0, 0, 0, 1.1)], [1, X()]]);
    c.T('ears', pop(.46, .66, .8)); c.T('tail', [[0, X()], [.6, X()], [.7, X(0, 0, 14)], [.8, X(0, 0, -14)], [.9, X(0, 0, 8)], [1, X()]]);
    c.T('al', [[0, X()], [.6, X()], [.7, X(0, 0, 70)], [.85, X(0, 0, 50)], [1, X()]]); c.T('ar', [[0, X()], [.6, X()], [.7, X(0, 0, -70)], [.85, X(0, 0, -50)], [1, X()]]);
    c.mood(0, 'sleepy'); c.mood(.46, 'surprised'); c.mood(.7, 'happy');
    c.fx('💥', { x: 100, y: 44, size: 22, dy: -10, delay: 2000, d: 700 }); c.fx('🐣', { x: 100, y: 10, size: 26, dy: -20, delay: 2900, d: 1300 });
    burst(c, 100, 90, ['✨', '⭐', '✨', '⭐', '✨', '✨'], 2900, 70);
  });
  def('evolve', 'Эволюция', 'evo', '🌟', 5200, false, 'Светится белым силуэтом, вспышка — и питомец стал взрослее', c => {
    c.T('root', [[0, X()], [.14, X(0, 0, 0, 1.12, .84)], [.3, X(0, -34, 0, .92, 1.14)], [.42, X(0, -38, 0, .96, 1.1)], [.5, X(0, -38, 0, 1.04, 1.04)], [.56, X(0, -38, 0, 1.1, 1.1)], [.66, X(0, -34, 0, 1, 1)], [.8, X(0, 0, 0, 1.14, .84)], [.9, X(0, 0, 0, .98, 1.04)], [1, X()]]);
    c.T('shadow', [[0, X()], [.14, X(0, 0, 0, 1.1)], [.35, X(0, 0, 0, .6)], [.66, X(0, 0, 0, .65)], [.8, X(0, 0, 0, 1.1)], [1, X()]]);
    const W = 'brightness(1) invert(0) drop-shadow(0 0 0px #ffe9a0)', Wn = 'brightness(0) invert(1) drop-shadow(0 0 12px #ffe9a0)';
    c.A('root', [{ offset: 0, filter: W }, { offset: .2, filter: W }, { offset: .3, filter: Wn }, { offset: .36, filter: W }, { offset: .4, filter: Wn }, { offset: .44, filter: W }, { offset: .47, filter: Wn }, { offset: .5, filter: Wn }, { offset: .62, filter: Wn }, { offset: .74, filter: W }, { offset: 1, filter: W }]);
    c.T('scarf', pop(.5, .72, .86)); c.T('hat', pop(.5, .72, .86));
    c.T('al', [[0, X()], [.3, X(0, 0, 40)], [.5, X(0, 0, 120)], [.7, X(0, 0, 140)], [.85, X(0, 0, 10)], [1, X()]]); c.T('ar', [[0, X()], [.3, X(0, 0, -40)], [.5, X(0, 0, -120)], [.7, X(0, 0, -140)], [.85, X(0, 0, -10)], [1, X()]]);
    c.T('ears', [[0, X()], [.14, X(0, 4)], [.36, X(0, -6, 0, 1, 1.08)], [.56, X(0, -2, 0, 1.1, 1.1)], [.8, X(0, 4)], [1, X()]]); c.T('tail', wag(6, 14));
    c.shape(flash, [[0, X(0, 0, 0, .2), 0], [.46, X(0, 0, 0, .3), 0], [.52, X(0, 0, 0, 3.2), 1], [.7, X(0, 0, 0, 5.5), 0], [1, X(0, 0, 0, 5.5), 0]], { origin: '100px 110px' });
    c.mood(0, 'motivated'); c.mood(.3, 'surprised'); c.mood(.56, 'excited'); c.mood(.85, 'happy');
    c.ring(100, 100, '#ffc83d', 2200, 1200); c.ring(100, 100, '#ffffff', 2500, 1200);
    [0, 1, 2, 3, 4, 5].forEach(i => c.fx('✨', { x: 100 + (i % 2 ? 1 : -1) * (30 + i * 9), y: 150 - i * 12, dy: -34, delay: 500 + i * 220, d: 1100 }));
    burst(c, 100, 100, ['🌟', '✨', '⭐', '✨', '🌟', '✨', '⭐', '✨'], 2700, 80);
  });
  def('crown', 'Коронация', 'evo', '👑', 4200, false, 'Корона падает с неба на голову, питомец гордо выпрямляется', c => {
    const crown = '<path d="M66 52L72 22L88 40L100 14L112 40L128 22L134 52Z" fill="#ffc83d" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="20" r="3" fill="#e8483f"/><circle cx="76" cy="30" r="2.4" fill="#5db9e6"/><circle cx="124" cy="30" r="2.4" fill="#5db9e6"/>';
    c.shape(crown, [[0, X(0, -120, -20), 0], [.1, X(0, -100, -14), 1], [.4, X(0, 4, 4), 1], [.46, X(0, -8, -2), 1], [.52, X(0, 0, 0), 1], [.54, X(0, 0, 0), 0], [1, X(0, 0, 0), 0]], { origin: '100px 40px' });
    c.T('hat', [[0, X(0, 0, 0, 0)], [.52, X(0, 0, 0, 0)], [.53, X(0, 0, 0, 1.08)], [.62, X()], [1, X()]]);
    c.T('root', [[0, X()], [.4, X()], [.46, X(0, 0, 0, 1.06, .93)], [.56, X(0, -10, 0, .97, 1.06)], [.68, X(0, 0, 0, 1.05, .95)], [.8, X(0, 0, 0, .98, 1.03)], [1, X()]]);
    c.T('face', [[0, X()], [.4, X(0, 0, 0)], [.46, X(0, 3, 0)], [.6, X(0, -3, 0)], [1, X()]]);
    c.T('al', [[0, X()], [.5, X()], [.65, X(0, 0, 22)], [.9, X(0, 0, 10)], [1, X()]]); c.T('ar', [[0, X()], [.5, X()], [.65, X(0, 0, -22)], [.9, X(0, 0, -10)], [1, X()]]);
    c.T('tail', wag(4, 10)); c.mood(0, 'surprised'); c.mood(.46, 'happy'); c.mood(.7, 'excited');
    c.ring(100, 40, '#ffc83d', 1800, 1100);
    [['✨', 60, 30], ['⭐', 140, 28], ['✨', 100, 0], ['🌟', 40, 60], ['✨', 160, 62]].forEach((e, i) => c.fx(e[0], { x: e[1], y: e[2], size: 16, dy: -14, delay: 1900 + i * 160, d: 1200 }));
  });

  /* ---------- Контекст построения ---------- */
  function setFace(svg, m) { const t = svg.querySelector('.p-facedyn'); if (t && P && P.face) t.innerHTML = P.face(svg.dataset.sp, m); }
  function setProp(svg, html) { const p = svg.querySelector('.p-prop'); if (p) p.innerHTML = html; }

  function makeCtx(svg, st) {
    const loop = st.loop, def = st.def;
    return {
      T(k, frames, opt) {
        if (st.still) return null;
        const el = svg.querySelector(SEL[k]); if (!el) return null; opt = opt || {};
        let prev = 0;
        const kf = frames.map(f => { prev = Math.max(prev, Math.min(1, Math.max(0, f[0]))); return { offset: prev, transform: f[1], easing: f[2] || SOFT }; });
        const a = el.animate(kf, { duration: opt.d || def.dur, delay: opt.delay || 0, iterations: loop ? Infinity : 1, easing: 'linear', fill: 'none' });
        a.playbackRate = st.speed; st.anims.push(a); return a;
      },
      A(k, frames, opt) {   // любые свойства (например filter): frames = [{offset, ...css}]
        if (st.still) return null;
        const el = svg.querySelector(SEL[k]); if (!el) return null; opt = opt || {};
        const an = el.animate(frames.map(f => Object.assign({ easing: SOFT }, f)), { duration: opt.d || def.dur, iterations: loop ? Infinity : 1, easing: 'linear', fill: 'none' });
        an.playbackRate = st.speed; st.anims.push(an); return an;
      },
      shape(html, frames, o) {   // своя картинка поверх питомца (скорлупа, корона, вспышка)
        if (st.still) return null;
        o = o || {}; const layer = svg.querySelector('.p-fx'); if (!layer) return null;
        const gEl = document.createElementNS(NS, 'g'); gEl.innerHTML = html; gEl.style.transformOrigin = o.origin || '100px 100px'; gEl.style.opacity = 0; layer.appendChild(gEl);
        let prev = 0;
        const kf = frames.map(f => { prev = Math.max(prev, Math.min(1, f[0])); return { offset: prev, transform: f[1], opacity: f[2] == null ? 1 : f[2], easing: SOFT }; });
        const an = gEl.animate(kf, { duration: o.d || def.dur, iterations: 1, easing: 'linear', fill: 'both' });
        an.playbackRate = st.speed; st.anims.push(an); return an;
      },
      cue(f, fn) { st.cues.push([f, fn]); },
      mood(f, m) { st.cues.push([f, () => { st.faceDirty = true; setFace(svg, m); }]); },
      prop(html) { this.propAt(0, html); },
      propAt(f, html) { st.cues.push([f, () => setProp(svg, html)]); },
      propOrigin(x, y) { const p = svg.querySelector('.p-prop'); if (p) p.style.transformOrigin = x + 'px ' + y + 'px'; },
      fx(text, o) {
        if (st.still) return;
        o = o || {}; const layer = svg.querySelector('.p-fx'); if (!layer) return;
        const x = o.x == null ? 100 : o.x, y = o.y == null ? 60 : o.y, dx = o.dx || 0, dy = o.dy == null ? -30 : o.dy, d = o.d || 1200;
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', o.size || 18); t.setAttribute('text-anchor', 'middle');
        if (o.fill) t.setAttribute('fill', o.fill); if (o.bold) t.setAttribute('font-weight', '800');
        t.style.opacity = 0; t.style.transformOrigin = x + 'px ' + y + 'px'; t.textContent = text; layer.appendChild(t);
        const a = t.animate([
          { opacity: 0, transform: 'translate(0px,0px) scale(.4)', offset: 0 },
          { opacity: 1, transform: `translate(${dx * .35}px,${dy * .35}px) scale(1.15)`, offset: .25 },
          { opacity: 1, transform: `translate(${dx * .7}px,${dy * .7}px) scale(1)`, offset: .7 },
          { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.9)`, offset: 1 }
        ], { duration: d, delay: o.delay || 0, iterations: o.loop ? Infinity : 1, easing: 'ease-out' });
        a.playbackRate = st.speed; st.anims.push(a);
      },
      ring(x, y, color, delay, d) {
        if (st.still) return;
        const layer = svg.querySelector('.p-fx'); if (!layer) return;
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 8); c.setAttribute('fill', 'none'); c.setAttribute('stroke', color); c.setAttribute('stroke-width', 5);
        c.style.opacity = 0; c.style.transformOrigin = x + 'px ' + y + 'px'; layer.appendChild(c);
        const a = c.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: .9, transform: 'scale(2.2)', offset: .25 }, { opacity: 0, transform: 'scale(9)' }], { duration: d || 1000, delay: delay || 0, easing: 'ease-out' });
        a.playbackRate = st.speed; st.anims.push(a);
      }
    };
  }

  function runCues(svg, st) {
    st.cueTimers.forEach(clearTimeout); st.cueTimers = [];
    st.cues.forEach(c => { if (c[0] <= 0) c[1](); else st.cueTimers.push(setTimeout(c[1], c[0] * st.cycle)); });
  }

  /* ---------- Управление ---------- */
  function stop(svg) {
    const st = svg && svg.__anim; if (!st) return;
    svg.__anim = null; clearInterval(st.iv);
    st.timers.concat(st.cueTimers).forEach(clearTimeout);
    st.anims.forEach(a => { try { a.cancel(); } catch (e) { /* уже остановлена */ } });
    const pr = svg.querySelector('.p-prop'), fx = svg.querySelector('.p-fx');
    if (pr) { pr.innerHTML = ''; pr.style.transformOrigin = '0px 0px'; }
    if (fx) fx.innerHTML = '';
    if (st.faceDirty) setFace(svg, svg.dataset.mood);
    if (st.res) st.res();
  }
  /* play(svg, 'happy', { speed: 1, loop: true|false, for: мс }) → Promise, когда закончилась */
  function play(svg, name, o) {
    o = o || {}; const def = LIB[name];
    if (!svg || !def) return Promise.resolve();
    stop(svg);
    const st = { def, speed: o.speed || 1, loop: o.loop != null ? !!o.loop : def.loop, anims: [], timers: [], cues: [], cueTimers: [], still: reduce() };
    st.cycle = def.dur / st.speed; svg.__anim = st;
    def.build(makeCtx(svg, st));
    const p = new Promise(res => { st.res = res; });
    runCues(svg, st);
    if (st.loop) {
      st.iv = setInterval(() => runCues(svg, st), st.cycle);
      if (o.for) st.timers.push(setTimeout(() => stop(svg), o.for));
    } else st.timers.push(setTimeout(() => stop(svg), st.cycle + 60));
    return p;
  }
  /* Для проверки кадров: замереть на доле f (0..1) анимации */
  function seek(svg, f) {
    const st = svg && svg.__anim; if (!st) return;
    clearInterval(st.iv); st.timers.concat(st.cueTimers).forEach(clearTimeout);
    st.anims.forEach(a => { a.pause(); a.currentTime = f * st.def.dur; });
    setFace(svg, svg.dataset.mood); setProp(svg, '');
    st.cues.filter(c => c[0] <= f).forEach(c => c[1]());
  }

  root.ToshaAnim = { play, stop, seek, LIB, ORDER, GROUPS, list: () => ORDER.map(id => LIB[id]) };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ToshaAnim;
})(typeof self !== 'undefined' ? self : this);
