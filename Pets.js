/* Тоша — питомцы. Всё нарисовано кодом (SVG). Слои для анимаций (см. anim.js):
   p-root > p-body > [туловище, a-arm-l/r, p-face(голова: p-ears, лицо)], a-tail, a-wing-l/r, p-foot-l/r, p-prop, p-fx */
(function (root) {
  'use strict';
  let n = 0;
  const INK = '#3b2f2f';
  const E = 'stroke="var(--edge)" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const g = (cls, org, inner) => `<g class="${cls}" style="transform-origin:${org}">${inner}</g>`;
  const none = () => '';

  const TORSO = 'M68 108C58 128 54 154 58 172C62 184 82 187 100 187C118 187 138 184 142 172C146 154 142 128 132 108Z';

  /* ---------- Глаза ---------- */
  const L = 80, R = 120, Y = 76;
  function eyeOpen(cx, cy, s, k, big) {
    const rx = 9.2 * k, ry = 10.8 * k;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${s.iris}"/>` +
      `<circle cx="${cx + 3.3 * k}" cy="${cy - 3.9 * k}" r="${3.5 * k}" fill="#fff"/><circle cx="${cx - 3.2 * k}" cy="${cy + 4.2 * k}" r="${1.8 * k}" fill="#fff" opacity=".95"/>` +
      (big ? `<circle cx="${cx + 5 * k}" cy="${cy + 1.2 * k}" r="1.1" fill="#fff"/>` : '');
  }
  const brow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  const arcs = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/>`;
  const EYE_ALIAS = { yawn: 'sleepy', chew1: 'happy', chew2: 'happy', sip: 'neutral', pant: 'tired', relaxed: 'sleepy' };
  function eyes(s, m) {
    m = EYE_ALIAS[m] || m;
    switch (m) {
      case 'happy': return arcs(`M${L - 8} ${Y + 3}q8 -13 16 0M${R - 8} ${Y + 3}q8 -13 16 0`);
      case 'sleepy': return arcs(`M${L - 8} ${Y - 1}q8 9 16 0M${R - 8} ${Y - 1}q8 9 16 0`);
      case 'excited': return eyeOpen(L, Y - 1, s, 1.2, true) + eyeOpen(R, Y - 1, s, 1.2, true);
      case 'hungry': return eyeOpen(L, Y + 1, s, 1.05) + eyeOpen(R, Y + 1, s, 1.05) + brow(L - 10, Y - 11, L + 8, Y - 17) + brow(R - 8, Y - 17, R + 10, Y - 11);
      case 'sad': return eyeOpen(L, Y + 2, s, 1.08, true) + eyeOpen(R, Y + 2, s, 1.08, true) + brow(L - 11, Y - 9, L + 8, Y - 19) + brow(R - 8, Y - 19, R + 11, Y - 9);
      case 'surprised': return [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="10.6" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="${x}" cy="${Y + .5}" r="6.6" fill="${s.iris}"/><circle cx="${x + 2.2}" cy="${Y - 2.2}" r="1.8" fill="#fff"/>`).join('');
      case 'tired': return [L, R].map(x => `<ellipse cx="${x}" cy="${Y + 3}" rx="7.6" ry="4.6" fill="${s.iris}" stroke="${INK}" stroke-width="2"/><circle cx="${x + 2.2}" cy="${Y + 2}" r="1.6" fill="#fff"/><path d="M${x - 10} ${Y - 1}h20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`).join('');
      case 'motivated': return eyeOpen(L, Y, s, 1.02) + eyeOpen(R, Y, s, 1.02) + brow(L - 11, Y - 16, L + 8, Y - 10) + brow(R - 8, Y - 10, R + 11, Y - 16);
      default: return eyeOpen(L, Y, s, 1) + eyeOpen(R, Y, s, 1);
    }
  }

  /* ---------- Рот ---------- */
  function mouth(s, m) {
    const st = `fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;
    const dTongue = '<path d="M94 107q6 -6 12 0q-6 5 -12 0z" fill="#ff8a9a"/>';
    const philtrum = s.w ? `<path d="M100 95v3" ${st}/>` : '';
    const closed = s.w ? `<path d="M100 95v4M100 99q-5 6-11 2M100 99q5 6 11 2" ${st}/>` : `<path d="M91 100q9 7 18 0" ${st}/>`;
    const D = (w, h) => `${philtrum}<path d="M${100 - w} 98q${w} ${h} ${w * 2} 0q-${w} -4 -${w * 2} 0z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    let out;
    switch (m) {
      case 'happy': out = D(12, 18) + dTongue; break;
      case 'excited': out = D(14, 22) + '<path d="M92 109q8 -8 16 0q-8 7 -16 0z" fill="#ff8a9a"/>'; break;
      case 'sad': out = `<path d="M92 107q8 -8 16 0" ${st}/>`; break;
      case 'sleepy': out = `<ellipse cx="100" cy="104" rx="4" ry="2.6" fill="${INK}"/>`; break;
      case 'hungry': out = `${philtrum}<ellipse cx="100" cy="104" rx="6" ry="8" fill="${INK}"/>`; break;
      case 'surprised': out = `${philtrum}<ellipse cx="100" cy="104" rx="5" ry="7" fill="${INK}"/>`; break;
      case 'yawn': out = `${philtrum}<ellipse cx="100" cy="106" rx="9" ry="12" fill="${INK}"/><path d="M92 114q8 -8 16 0q-8 5 -16 0z" fill="#ff8a9a"/>`; break;
      case 'tired': out = `<path d="M93 104h14" ${st}/>`; break;
      case 'chew1': out = `<path d="M93 101q7 5 14 0" ${st}/>`; break;
      case 'chew2': out = `<ellipse cx="100" cy="103" rx="7" ry="4.5" fill="${INK}"/>`; break;
      case 'sip': out = `<ellipse cx="100" cy="102" rx="4" ry="3" fill="${INK}"/>`; break;
      case 'pant': out = `${philtrum}<ellipse cx="100" cy="104" rx="8" ry="5.5" fill="${INK}"/><path d="M95 106q5 11 10 0z" fill="#ff8a9a"/>`; break;
      case 'relaxed': out = `<path d="M90 101q10 8 20 0" ${st}/>`; break;
      case 'motivated': out = `${philtrum}<path d="M88 99q12 12 24 0" ${st}/>`; break;
      default: out = closed;
    }
    return `<g transform="translate(0 ${s.my || 0})">${out}</g>`;
  }

  const whisk = (y, spread) => [0, 1, 2].map(i => `<path d="M72 ${y + i * 4}L${72 - spread} ${y - 5 + i * 8}M128 ${y + i * 4}L${128 + spread} ${y - 5 + i * 8}" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" opacity=".42"/>`).join('');

  /* ---------- Точные персонажи под пастельные карточки ---------- */
  const SPECIES = {
    fox: {
      title: 'Лисёнок', name: 'Рыжик', k: 0.96, w: true, iris: '#4a2c1d', my: 2,
      c: { pet: '#f59b56', light: '#fff8f0', edge: '#8c4a27', cheek: '#ffb3b3' },
      headPath: 'M100 34C126 34 148 48 154 72C160 94 144 114 100 116C56 114 40 94 46 72C52 48 74 34 100 34Z',
      ears: () => g('a-ear-l', '70px 54px', `<path d="M46 72C40 42 46 14 58 8C72 14 86 30 94 44Z" fill="#f59b56" ${E}/><path d="M54 62C50 42 54 22 60 18C68 22 76 34 82 44Z" fill="#ffd1b3"/>`) +
        g('a-ear-r', '130px 54px', `<path d="M154 72C160 42 154 14 142 8C128 14 114 30 106 44Z" fill="#f59b56" ${E}/><path d="M146 62C150 42 146 22 140 18C132 22 124 34 118 44Z" fill="#ffd1b3"/>`),
      headDeco: () => '<path d="M44 76C64 90 82 94 100 94C118 94 136 90 156 76L156 126L44 126Z" fill="#fff8f0"/>',
      bodyDeco: () => '<ellipse cx="100" cy="150" rx="25" ry="33" fill="#fff8f0"/>',
      neck: () => '<path d="M72 110Q100 128 128 110L134 130Q100 148 66 130Z" fill="#7bc67d" stroke="#4a8a4c" stroke-width="2.2" stroke-linejoin="round"/><circle cx="100" cy="122" r="3" fill="#fff"/>',
      back: (lvl, id) => g('a-tail', '128px 172px',
        `<clipPath id="${id}t"><path d="M128 178C168 198 204 156 188 106C182 100 174 102 170 110C164 132 148 148 126 154Z"/></clipPath>` +
        `<path d="M128 178C168 198 204 156 188 106C182 100 174 102 170 110C164 132 148 148 126 154Z" fill="#f59b56"/>` +
        `<g clip-path="url(#${id}t)"><path d="M158 82L218 82L218 128Q190 118 162 134Z" fill="#fff8f0"/></g>` +
        `<path d="M128 178C168 198 204 156 188 106C182 100 174 102 170 110C164 132 148 148 126 154Z" fill="none" ${E}/>`),
      foot: '#6b3e26', paw: '#6b3e26', arm: '#f59b56',
      under: none,
      over: () => `<ellipse cx="100" cy="89" rx="4.5" ry="3.2" fill="#4a2c1d"/>`
    },
    bunny: {
      title: 'Кролик', name: 'Пушок', k: 0.95, w: true, iris: '#3d346b', my: 1,
      c: { pet: '#d6e7ff', light: '#ffffff', edge: '#6e8fc4', cheek: '#ffb8d1' },
      headPath: 'M100 36C132 36 150 54 150 80C150 104 132 118 100 118C68 118 50 104 50 80C50 54 68 36 100 36Z',
      ears: () => g('a-ear-l', '76px 54px', `<g transform="rotate(-12 76 54)"><path d="M68 54C54 28 56 -2 68 -16C78 -20 88 -4 90 16C92 32 90 44 87 56Z" fill="#d6e7ff" ${E}/><path d="M72 44C65 26 66 8 71 -4C77 -6 82 8 84 21C85 32 84 40 82 48Z" fill="#ffb8d1"/></g>`) +
        g('a-ear-r', '124px 54px', `<g transform="rotate(12 124 54)"><path d="M132 54C146 28 144 -2 132 -16C122 -20 112 -4 110 16C108 32 110 44 113 56Z" fill="#d6e7ff" ${E}/><path d="M128 44C135 26 134 8 129 -4C123 -6 118 8 116 21C115 32 116 40 118 48Z" fill="#ffb8d1"/></g>`),
      headDeco: () => '<path d="M74 36C86 36 94 48 94 62C94 76 86 88 74 88C62 88 54 76 54 62C54 48 62 36 74 36Z" fill="#ffffff" opacity=".85"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="26" ry="31" fill="#ffffff"/>',
      neck: () => '<path d="M76 110q24 16 48 0l6 14q-30 12-60 0z" fill="#7ea6e0" stroke="#4a73b0" stroke-width="2.2" stroke-linejoin="round"/><circle cx="100" cy="123" r="4" fill="#ffffff"/>',
      back: () => g('a-tail', '140px 178px', `<circle cx="142" cy="178" r="13" fill="#ffffff" ${E}/>`),
      foot: '#d6e7ff', paw: '#ffb8d1', footRx: 20,
      under: none,
      over: () => '<ellipse cx="100" cy="88" rx="4" ry="2.8" fill="#ff8fa3"/>'
    },
    deer: {
      title: 'Оленёнок', name: 'Бэмби', k: 0.94, w: false, iris: '#4e2e1e', my: 1,
      c: { pet: '#e8a87c', light: '#fff5ec', edge: '#8c5230', cheek: '#ffad99' },
      headPath: 'M100 38C132 38 148 56 148 82C148 104 130 118 100 118C70 118 52 104 52 82C52 56 68 38 100 38Z',
      ears: () => g('a-ear-l', '64px 56px', `<path d="M54 64C34 56 24 40 30 32C42 30 56 42 66 52Z" fill="#e8a87c" ${E}/><path d="M52 58C40 50 32 42 36 38C42 37 52 44 58 52Z" fill="#ffd6cc"/>`) +
        g('a-ear-r', '136px 56px', `<path d="M146 64C166 56 176 40 170 32C158 30 144 42 134 52Z" fill="#e8a87c" ${E}/><path d="M148 58C160 50 168 42 164 38C158 37 148 44 142 52Z" fill="#ffd6cc"/>`) +
        `<path d="M78 40L72 14M74 26L62 20M76 20L84 12M122 40L128 14M126 26L138 20M124 20L116 12" stroke="#8c5230" stroke-width="4.2" stroke-linecap="round" fill="none"/>`,
      headDeco: () => '<ellipse cx="100" cy="96" rx="28" ry="20" fill="#fff5ec"/><circle cx="100" cy="54" r="3" fill="#fff5ec"/><circle cx="88" cy="60" r="2.2" fill="#fff5ec"/><circle cx="112" cy="60" r="2.2" fill="#fff5ec"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="24" ry="30" fill="#fff5ec"/><circle cx="72" cy="138" r="3.2" fill="#fff5ec"/><circle cx="128" cy="138" r="3.2" fill="#fff5ec"/><circle cx="70" cy="150" r="2.6" fill="#fff5ec"/><circle cx="130" cy="150" r="2.6" fill="#fff5ec"/>',
      neck: () => '<path d="M74 110q26 14 52 0l4 14q-30 12-60 0z" fill="#7bc67d" stroke="#4a8a4c" stroke-width="2.2" stroke-linejoin="round"/><circle cx="100" cy="122" r="3.5" fill="#fff"/>',
      back: () => g('a-tail', '134px 174px', `<path d="M132 174q16 -8 18 6q-10 8 -18 -6z" fill="#fff5ec" ${E}/>`),
      foot: '#8c5230', paw: '#8c5230',
      under: none,
      over: () => '<ellipse cx="100" cy="88" rx="4.5" ry="3" fill="#4e2e1e"/>'
    },
    dragon: {
      title: 'Дракончик', name: 'Искра', k: 1.04, iris: '#1d4d4f', my: 1,
      c: { pet: '#8be0cd', light: '#e8fbf7', edge: '#3d8f80', cheek: '#ff9eb5' },
      headPath: 'M100 36C136 36 154 54 154 80C154 104 134 118 100 118C66 118 46 104 46 80C46 54 64 36 100 36Z',
      ears: () => `<path d="M48 72L24 60L34 74L22 84L38 86L50 96Z" fill="#a8ebd9" ${E}/><path d="M152 72L176 60L166 74L178 84L162 86L150 96Z" fill="#a8ebd9" ${E}/>` +
        `<path d="M68 44C56 32 56 14 64 4C70 16 78 28 88 36Z" fill="#fff5ba" ${E}/><path d="M132 44C144 32 144 14 136 4C130 16 122 28 112 36Z" fill="#fff5ba" ${E}/>` +
        `<path d="M92 36L96 22L101 34L106 22L109 36Z" fill="#8be0cd" ${E}/>`,
      headDeco: () => '<ellipse cx="100" cy="99" rx="28" ry="18" fill="#c7f5eb"/><circle cx="72" cy="58" r="2.8" fill="#52b5a2" opacity=".6"/><circle cx="128" cy="58" r="2.8" fill="#52b5a2" opacity=".6"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="28" ry="31" fill="#e8fbf7"/><path d="M78 136q22 7 44 0M76 148q24 8 48 0M78 160q22 8 44 0" fill="none" stroke="#9adbc9" stroke-width="2.2" stroke-linecap="round"/>',
      back: () => g('a-tail', '128px 176px',
        '<path d="M128 176C160 188 184 172 182 146" fill="none" stroke="#3d8f80" stroke-width="21" stroke-linecap="round"/><path d="M128 176C160 188 184 172 182 146" fill="none" stroke="#8be0cd" stroke-width="15" stroke-linecap="round"/>' +
        `<path d="M174 148L182 128L190 148Z" fill="#fff5ba" ${E}/>`) +
        g('a-wing-l', '70px 124px', `<path d="M72 124C42 110 16 88 8 56C24 66 34 64 42 62C39 77 52 87 62 93C58 103 66 114 76 128Z" fill="#d4f7ee" stroke="#52b5a2" stroke-width="3" stroke-linejoin="round"/>`) +
        g('a-wing-r', '130px 124px', `<path d="M128 124C158 110 184 88 192 56C176 66 166 64 158 62C161 77 148 87 138 93C142 103 134 114 124 128Z" fill="#d4f7ee" stroke="#52b5a2" stroke-width="3" stroke-linejoin="round"/>`),
      foot: '#8be0cd', paw: '#fff5ba',
      under: none,
      over: () => '<circle cx="95" cy="91" r="2" fill="#3d8f80"/><circle cx="105" cy="91" r="2" fill="#3d8f80"/>'
    }
  };
  const ORDER = ['fox', 'bunny', 'deer', 'dragon'];

  /* ---------- Части тела ---------- */
  function arm(side, s) {
    const k = s.k || 1, x = Math.round(100 + side * 34 * k), rot = side < 0 ? 8 : -8;
    const fill = s.arm || 'var(--pet)', paw = s.paw || 'var(--pet-light)';
    const body = `<g transform="rotate(${rot} ${x} 124)"><path d="M${x - 11} 124C${x - 14} 146 ${x - 13} 164 ${x - 8} 172C${x - 3} 178 ${x + 3} 178 ${x + 8} 172C${x + 13} 164 ${x + 14} 146 ${x + 11} 124Z" fill="${fill}" ${E}/>` +
      `<ellipse cx="${x}" cy="168" rx="8.4" ry="6.4" fill="${paw}"/><path d="M${x - 3.2} 166v5M${x + 3.2} 166v5" stroke="var(--edge)" stroke-width="1.5" stroke-linecap="round" opacity=".7"/></g>`;
    return g(side < 0 ? 'a-arm-l' : 'a-arm-r', `${x}px 124px`, body);
  }
  function foot(side, s) {
    const cx = 100 + side * 22, rx = s.footRx || 18, ox = side * (rx - 18) * .5;
    const fx = cx + ox;
    const toes = s.pads
      ? `<ellipse cx="${fx}" cy="189" rx="6.4" ry="4.4" fill="#ffa3b5"/><circle cx="${fx - 6.4}" cy="183.6" r="2.4" fill="#ffa3b5"/><circle cx="${fx}" cy="182" r="2.5" fill="#ffa3b5"/><circle cx="${fx + 6.4}" cy="183.6" r="2.4" fill="#ffa3b5"/>`
      : `<path d="M${fx - 6} 189v3M${fx} 190v3M${fx + 6} 189v3" stroke="var(--edge)" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
    const body = `<ellipse cx="${fx}" cy="186" rx="${rx}" ry="9.5" fill="${s.foot || 'var(--pet)'}" ${E}/>${toes}`;
    return g(side < 0 ? 'p-foot-l' : 'p-foot-r', `${cx}px 186px`, body);
  }

  const faceMarkup = (s, m) => s.under(m) + g('a-eyes', '100px 76px', eyes(s, m)) + mouth(s, m) + s.over(m);
  const face = (sp, m) => faceMarkup(SPECIES[sp] || SPECIES.fox, m);

  function shade(hex, f) {
    const v = parseInt(hex.slice(1), 16), m = x => Math.max(0, Math.min(255, Math.round(x * (1 + f))));
    return '#' + [m((v >> 16) & 255), m((v >> 8) & 255), m(v & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function svg(sp, m, lvl, o) {
    o = o || {};
    if (!SPECIES[sp]) sp = 'fox';
    const s = SPECIES[sp], id = 'pc' + (++n);
    const hexOk = v => /^#[0-9a-f]{6}$/i.test(v || '');
    const c = (o.colors && hexOk(o.colors.pet) && hexOk(o.colors.light)) ? Object.assign({}, s.c, { pet: o.colors.pet, light: o.colors.light, edge: shade(o.colors.pet, -0.22) }) : s.c;
    const sc = (0.9 + Math.min(lvl, 10) * 0.01).toFixed(3), k = s.k || 1;
    const kt = `translate(100 0) scale(${k} 1) translate(-100 0)`;
    const scarf = s.neck ? `<g class="p-scarf" style="transform-origin:100px 125px">${s.neck(k)}</g>` : lvl >= 3 ? `<g class="p-scarf" style="transform-origin:100px 125px"><path d="M${Math.round(100 - 38 * k)} 110Q100 132 ${Math.round(100 + 38 * k)} 110L${Math.round(100 + 42 * k)} 126Q100 150 ${Math.round(100 - 42 * k)} 126Z" fill="var(--accent)"/><path d="M${Math.round(100 + 18 * k)} 128l${Math.round(14 * k)} 30l-14 4l-8 -28z" fill="var(--accent)"/><path d="M${Math.round(100 - 36 * k)} 118q${Math.round(36 * k)} 18 ${Math.round(72 * k)} 0" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/></g>` : '';
    const hat0 = lvl >= 8
      ? '<path d="M66 52L72 22L88 40L100 14L112 40L128 22L134 52Z" fill="#ffc83d" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="20" r="3" fill="#e8483f"/><circle cx="76" cy="30" r="2.4" fill="#5db9e6"/><circle cx="124" cy="30" r="2.4" fill="#5db9e6"/>'
      : lvl >= 5 ? '<path d="M62 60Q100 -4 138 60Z" fill="#1f8f82"/><rect x="56" y="54" width="88" height="12" rx="6" fill="#16766b"/><circle cx="100" cy="10" r="7" fill="#fff"/>' : '';
    const hat = hat0 ? '<g class="p-hat" style="transform-origin:100px 56px">' + hat0 + '</g>' : '';
    const shell = lvl < 2 ? '<path d="M46 66C44 6 156 6 154 66L140 56L126 70L112 52L98 70L86 52L72 70L60 56Z" fill="#fffaf0" stroke="#e5cfae" stroke-width="3" stroke-linejoin="round"/>' : '';
    const style = `--pet:${c.pet};--pet-light:${c.light};--edge:${c.edge};--cheek:${c.cheek};`;
    const head = `<path d="${s.headPath}" fill="var(--pet)" ${E}/>` +
      `<g clip-path="url(#${id}h)">${s.headDeco()}</g>` +
      (s.headFront ? s.headFront() : '') +
      `<ellipse cx="62" cy="93" rx="10.5" ry="6.6" fill="var(--cheek)" opacity=".55"/><ellipse cx="138" cy="93" rx="10.5" ry="6.6" fill="var(--cheek)" opacity=".55"/>`;
    return `<svg class="pet-svg m-${m}${o.mini ? ' mini' : ''}" data-sp="${sp}" data-mood="${m}" viewBox="0 -26 200 226" role="img" aria-label="${esc(o.label || s.title)}${o.mini ? '' : ', настроение: ' + m}" style="${style}">
<defs><clipPath id="${id}h"><path d="${s.headPath}"/></clipPath><clipPath id="${id}b"><path d="${TORSO}" transform="${kt}"/></clipPath></defs>
<ellipse class="p-shadow" cx="100" cy="195" rx="54" ry="7" fill="#3b2f2f" opacity=".1" style="transform-origin:100px 195px"/>
<g class="p-root" style="transform-origin:100px 195px">
<g transform="translate(100 195) scale(${sc}) translate(-100 -195)">
${s.back(lvl, id)}
${foot(-1, s)}${foot(1, s)}
<g class="p-body" style="transform-origin:100px 190px"><g class="a-breathe" style="transform-origin:100px 190px">
<g transform="${kt}"><path d="${TORSO}" fill="var(--pet)" ${E}/><g clip-path="url(#${id}b)">${s.bodyDeco()}</g></g>
${scarf}
${arm(-1, s)}${arm(1, s)}
${g('p-face', '100px 112px', g('p-ears', '100px 60px', lvl >= 2 ? s.ears(lvl) : '') + head + `<g class="p-facedyn">${faceMarkup(s, m)}</g>` + shell + hat)}
</g></g>
<g class="p-prop" style="transform-origin:0px 0px"></g>
</g></g>
<g class="p-fx"></g></svg>`;
  }

  root.ToshaPets = { SPECIES, ORDER, svg, face };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ToshaPets;
})(typeof self !== 'undefined' ? self : this);
