/* Тоша — питомцы. Все нарисованы кодом (SVG), части анимируются через CSS-классы a-* (см. index.html). */
(function (root) {
  'use strict';
  let n = 0;
  const INK = '#3b2f2f';
  const BODY = 'M100 28C150 28 176 72 174 118C172 162 140 184 100 184C60 184 28 162 26 118C24 72 50 28 100 28Z';
  const E = 'stroke="var(--edge)" stroke-width="3" stroke-linejoin="round"';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const g = (cls, org, inner) => `<g class="${cls}" style="transform-origin:${org}">${inner}</g>`;
  const none = () => '';

  /* Общие глаза и рот: у всех питомцев одинаковая «мимика» по настроению */
  const hl = (x, y) => `<circle cx="${x + 2.2}" cy="${y - 2.6}" r="2.2" fill="#fff"/>`;
  const EYE_ALIAS = { yawn: 'sleepy', chew1: 'happy', chew2: 'happy', sip: 'neutral', pant: 'tired', relaxed: 'sleepy' };
  function eyes(m) {
    m = EYE_ALIAS[m] || m;
    const st = `fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"`;
    return {
      neutral: `<circle cx="78" cy="96" r="6.5" fill="${INK}"/><circle cx="122" cy="96" r="6.5" fill="${INK}"/>${hl(78, 96)}${hl(122, 96)}`,
      happy: `<path d="M68 99q10-14 20 0M112 99q10-14 20 0" ${st}/>`,
      sleepy: `<path d="M68 97q10 8 20 0M112 97q10 8 20 0" ${st}/>`,
      hungry: `<circle cx="78" cy="97" r="6.5" fill="${INK}"/><circle cx="122" cy="97" r="6.5" fill="${INK}"/>${hl(78, 97)}${hl(122, 97)}<path d="M66 83l20-5M134 83l-20-5" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
      excited: `<circle cx="78" cy="95" r="9" fill="${INK}"/><circle cx="122" cy="95" r="9" fill="${INK}"/><circle cx="81.5" cy="91.5" r="3.4" fill="#fff"/><circle cx="125.5" cy="91.5" r="3.4" fill="#fff"/>`,
      motivated: `<circle cx="78" cy="96" r="7" fill="${INK}"/><circle cx="122" cy="96" r="7" fill="${INK}"/>${hl(78, 96)}${hl(122, 96)}<path d="M66 83l20 6M134 83l-20 6" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
      sad: `<circle cx="78" cy="98" r="7.5" fill="${INK}"/><circle cx="122" cy="98" r="7.5" fill="${INK}"/><circle cx="80.8" cy="94.4" r="3" fill="#fff"/><circle cx="124.8" cy="94.4" r="3" fill="#fff"/><path d="M64 90L88 81M136 90L112 81" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
      surprised: `<circle cx="78" cy="95" r="10.5" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="122" cy="95" r="10.5" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="78" cy="96" r="4.5" fill="${INK}"/><circle cx="122" cy="96" r="4.5" fill="${INK}"/>`,
      tired: `<ellipse cx="78" cy="99" rx="6.5" ry="3.4" fill="${INK}"/><ellipse cx="122" cy="99" rx="6.5" ry="3.4" fill="${INK}"/><path d="M67 94h22M111 94h22" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
    }[m] || eyes('neutral');
  }
  function mouth(m) {
    const st = `fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"`;
    return {
      neutral: `<path d="M90 120q10 7 20 0" ${st}/>`,
      happy: `<path d="M84 115q16 18 32 0" ${st}/>`,
      sleepy: `<ellipse cx="100" cy="123" rx="5" ry="3.5" fill="${INK}"/>`,
      hungry: `<ellipse cx="100" cy="124" rx="7" ry="9" fill="${INK}"/>`,
      excited: `<path d="M84 113h32q-1 21-16 21t-16-21z" fill="${INK}"/><path d="M92 128q8-6 16 0q-8 7-16 0z" fill="#ff8a8a"/>`,
      sad: `<path d="M88 127q12-10 24 0" ${st}/>`,
      pant: `<ellipse cx="100" cy="124" rx="8" ry="6" fill="${INK}"/><path d="M95 128q5 6 10 0z" fill="#ff8a8a"/>`,
      relaxed: `<path d="M88 118q12 9 24 0" ${st}/>`,
      motivated: `<path d="M86 114q14 15 28 0" ${st}/>`,
      surprised: `<ellipse cx="100" cy="124" rx="6" ry="8" fill="${INK}"/>`,
      yawn: `<ellipse cx="100" cy="127" rx="10" ry="13" fill="${INK}"/><path d="M92 135q8-7 16 0q-8 5-16 0z" fill="#ff8a8a"/>`,
      tired: `<path d="M91 123h18" ${st}/>`,
      chew1: `<path d="M92 120q8 5 16 0" ${st}/>`,
      chew2: `<ellipse cx="100" cy="122" rx="7" ry="5" fill="${INK}"/>`,
      sip: `<ellipse cx="100" cy="122" rx="4" ry="3" fill="${INK}"/>`
    }[m] || mouth('neutral');
  }

  /* ---------- Виды ---------- */
  const SPECIES = {
    blob: {
      title: 'Комочек', name: 'Тоша',
      c: { pet: '#ffb86b', light: '#ffe6c2', edge: '#e8964a', cheek: '#ff8f8f' },
      back: none, marks: none, under: none, over: none,
      ears: lvl => lvl < 2 ? '' : g('a-sway', '100px 30px',
        '<path d="M100 32q-3-16 4-26" stroke="#3f9a5a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M104 10q18-10 24 4q-14 10-24-4z" fill="#5bbf72"/><path d="M101 16q-16-12-24 0q12 11 24 0z" fill="#5bbf72"/>')
    },
    cat: {
      title: 'Кот', name: 'Мурзик',
      c: { pet: '#ffd9b8', light: '#fff4e4', edge: '#d9a47c', cheek: '#ff9aa2' },
      back: () => g('a-tail', '148px 172px',
        '<path d="M148 172Q196 170 190 122Q187 106 174 108" fill="none" stroke="var(--edge)" stroke-width="22" stroke-linecap="round"/>' +
        '<path d="M148 172Q196 170 190 122Q187 106 174 108" fill="none" stroke="var(--pet)" stroke-width="16" stroke-linecap="round"/>'),
      ears: lvl => lvl < 2 ? '' :
        g('a-ear-l', '72px 62px', `<path d="M44 72L50 12L94 42Z" fill="var(--pet)" ${E}/><path d="M56 56L57 29L80 45Z" fill="#ffb3b8"/>`) +
        g('a-ear-r', '128px 62px', `<path d="M156 72L150 12L106 42Z" fill="var(--pet)" ${E}/><path d="M144 56L143 29L120 45Z" fill="#ffb3b8"/>`),
      marks: () => '<path d="M14 62C36 18 92 22 106 40C92 60 76 72 62 102C38 100 16 90 14 62Z" fill="#f2a65a"/><circle cx="152" cy="154" r="24" fill="#e7936b"/>',
      under: none,
      over: () => '<path d="M42 108L72 112M42 120L72 118M158 108L128 112M158 120L128 118" stroke="#7a5a4a" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><path d="M95 104h10l-5 7z" fill="#e88aa0"/>'
    },
    bunny: {
      title: 'Кролик', name: 'Пушок',
      c: { pet: '#fbe3bd', light: '#fffaf0', edge: '#d9b88c', cheek: '#ff9aa2' },
      back: () => g('a-tail', '160px 170px', `<circle cx="162" cy="170" r="14" fill="#fffaf0" ${E}/>`),
      ears: lvl => lvl < 2 ? '' :
        g('a-ear-l', '76px 46px', `<g transform="rotate(-10 76 46)"><ellipse cx="74" cy="10" rx="15" ry="37" fill="var(--pet)" ${E}/><ellipse cx="74" cy="14" rx="7" ry="25" fill="#ffc2cd"/></g>`) +
        g('a-ear-r', '124px 46px', `<g transform="rotate(16 124 46)"><ellipse cx="126" cy="10" rx="15" ry="37" fill="var(--pet)" ${E}/><ellipse cx="126" cy="14" rx="7" ry="25" fill="#ffc2cd"/></g>`),
      marks: none,
      under: m => (m === 'neutral' || m === 'happy') ? '<rect x="94" y="119" width="12" height="11" rx="3" fill="#fff" stroke="#e3d3bd" stroke-width="1.5"/>' : '',
      over: () => '<ellipse cx="100" cy="106" rx="5" ry="3.6" fill="#f08aa0"/>'
    },
    dragon: {
      title: 'Дракончик', name: 'Искра',
      c: { pet: '#62c7b2', light: '#ffeaa9', edge: '#3a9a88', cheek: '#ff9f6b' },
      back: lvl => g('a-tail', '148px 174px',
        '<path d="M146 174Q192 178 192 138" fill="none" stroke="var(--edge)" stroke-width="24" stroke-linecap="round"/>' +
        '<path d="M146 174Q192 178 192 138" fill="none" stroke="var(--pet)" stroke-width="18" stroke-linecap="round"/>' +
        `<path d="M182 126L192 106L202 126Z" fill="#3da895" ${E}/>`) +
        (lvl < 2 ? '' :
          g('a-wing-l', '54px 112px', `<path d="M54 108Q20 100 4 62Q22 72 30 70Q26 86 40 92Q38 104 56 120Z" fill="#3da895" ${E}/>`) +
          g('a-wing-r', '146px 112px', `<path d="M146 108Q180 100 196 62Q178 72 170 70Q174 86 160 92Q162 104 144 120Z" fill="#3da895" ${E}/>`)),
      ears: lvl => lvl < 2 ? '' :
        `<path d="M86 34L94 16L102 32L110 14L116 36Z" fill="#3da895" ${E}/>` +
        `<path d="M58 46Q44 16 56 4Q76 16 80 40Z" fill="#ecd1a0" ${E}/><path d="M142 46Q156 16 144 4Q124 16 120 40Z" fill="#ecd1a0" ${E}/>`,
      marks: () => '<path d="M68 138Q100 150 132 138M70 152Q100 163 130 152M76 166Q100 174 124 166" fill="none" stroke="#f0cf78" stroke-width="3" stroke-linecap="round"/>',
      under: none,
      over: () => '<circle cx="94" cy="108" r="2.2" fill="#2f7f70"/><circle cx="106" cy="108" r="2.2" fill="#2f7f70"/>'
    },
    fox: {
      title: 'Лисёнок', name: 'Рыжик',
      c: { pet: '#f28c3c', light: '#fff3e3', edge: '#c76a1f', cheek: '#ff8f8f' },
      back: (lvl, id) => g('a-tail', '146px 168px',
        `<clipPath id="${id}t"><path d="M146 176C204 196 214 120 180 92C172 118 164 130 144 138Z"/></clipPath>` +
        `<path d="M146 176C204 196 214 120 180 92C172 118 164 130 144 138Z" fill="var(--pet)" ${E}/>` +
        `<g clip-path="url(#${id}t)"><path d="M150 70L230 70L230 118Q196 108 150 122Z" fill="#fff6ea"/></g>` +
        `<path d="M146 176C204 196 214 120 180 92C172 118 164 130 144 138Z" fill="none" ${E}/>`),
      ears: lvl => lvl < 2 ? '' :
        g('a-ear-l', '72px 62px', `<path d="M44 76L50 6L98 44Z" fill="var(--pet)" ${E}/><path d="M60 54L58 26L82 42Z" fill="#fff0dc"/><path d="M50 6L64.4 16.8L48.8 26.4Z" fill="#6b3b25"/>`) +
        g('a-ear-r', '128px 62px', `<path d="M156 76L150 6L102 44Z" fill="var(--pet)" ${E}/><path d="M140 54L142 26L118 42Z" fill="#fff0dc"/><path d="M150 6L135.6 16.8L151.2 26.4Z" fill="#6b3b25"/>`),
      marks: () => '<ellipse cx="100" cy="126" rx="32" ry="22" fill="#fff4e6"/><path d="M24 118C36 100 62 108 78 128C70 140 46 142 32 136Z" fill="#fff4e6"/><path d="M176 118C164 100 138 108 122 128C130 140 154 142 168 136Z" fill="#fff4e6"/>',
      under: none,
      over: () => `<ellipse cx="100" cy="108" rx="6" ry="4.5" fill="${INK}"/>`
    },
    bear: {
      title: 'Медвежонок', name: 'Мишка',
      c: { pet: '#b4764f', light: '#e6c19a', edge: '#7d4b2e', cheek: '#e8957f' },
      back: () => g('a-tail', '152px 176px', `<circle cx="152" cy="176" r="9" fill="var(--pet)" ${E}/>`),
      ears: lvl => lvl < 2 ? '' :
        g('a-ear-l', '54px 46px', `<circle cx="54" cy="46" r="18" fill="var(--pet)" ${E}/><circle cx="54" cy="46" r="9" fill="#e8b9a0"/>`) +
        g('a-ear-r', '146px 46px', `<circle cx="146" cy="46" r="18" fill="var(--pet)" ${E}/><circle cx="146" cy="46" r="9" fill="#e8b9a0"/>`),
      marks: () => '<ellipse cx="100" cy="116" rx="27" ry="21" fill="#e6c19a"/>',
      under: none,
      over: () => `<ellipse cx="100" cy="106" rx="8" ry="5.5" fill="${INK}"/>`
    }
  };

  /* ---------- Рисование ---------- */
  function shade(hex, f) {
    const v = parseInt(hex.slice(1), 16), m = x => Math.max(0, Math.min(255, Math.round(x * (1 + f))));
    return '#' + [m((v >> 16) & 255), m((v >> 8) & 255), m(v & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const faceMarkup = (s, m) => s.under(m) + g('a-eyes', '100px 96px', eyes(m)) + mouth(m) + s.over(m);
  const face = (sp, m) => faceMarkup(SPECIES[sp] || SPECIES.blob, m);

  function svg(sp, m, lvl, o) {
    o = o || {};
    const s = SPECIES[sp] || SPECIES.blob, id = 'pc' + (++n);
    const hexOk = v => /^#[0-9a-f]{6}$/i.test(v || '');
    const c = (o.colors && hexOk(o.colors.pet) && hexOk(o.colors.light)) ? Object.assign({}, s.c, { pet: o.colors.pet, light: o.colors.light, edge: shade(o.colors.pet, -0.2) }) : s.c;
    const sc = (0.88 + Math.min(lvl, 10) * 0.012).toFixed(3);
    const arm = m === 'excited' ? 38 : m === 'happy' ? 18 : 6;
    const scarf = lvl >= 3 ? '<path d="M52 150Q100 172 148 150L152 166Q100 190 48 166Z" fill="var(--accent)"/><rect x="128" y="160" width="16" height="32" rx="6" fill="var(--accent)" transform="rotate(-8 136 160)"/>' : '';
    const hat = lvl >= 8
      ? '<path d="M64 42L72 12L88 31L100 8L112 31L128 12L136 42Z" fill="#ffc83d" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/>'
      : lvl >= 5 ? '<path d="M58 60Q100 -2 142 60Z" fill="#1f8f82"/><rect x="50" y="56" width="100" height="10" rx="5" fill="#1f8f82"/><circle cx="100" cy="14" r="7" fill="#fff"/>' : '';
    const shell = lvl < 2 ? '<path d="M40 78C40 6 160 6 160 78L144 64L128 80L114 62L100 80L86 62L72 80L56 64Z" fill="#fffaf0" stroke="#e5cfae" stroke-width="3" stroke-linejoin="round"/>' : '';
    const style = `--pet:${c.pet};--pet-light:${c.light};--edge:${c.edge};`;
    return `<svg class="pet-svg m-${m}${o.mini ? ' mini' : ''}" data-sp="${sp}" data-mood="${m}" viewBox="0 0 200 200" role="img" aria-label="${esc(o.label || s.title)}${o.mini ? '' : ', настроение: ' + m}" style="${style}">
<defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs>
<ellipse class="p-shadow" cx="100" cy="193" rx="54" ry="7" fill="#3b2f2f" opacity=".1" style="transform-origin:100px 193px"/>
<g class="p-root" style="transform-origin:100px 188px">
<g transform="translate(100 190) scale(${sc}) translate(-100 -190)">
${s.back(lvl, id)}
${g('p-foot-l', '72px 184px', `<ellipse cx="72" cy="184" rx="21" ry="11" fill="var(--pet)" ${E}/>`)}${g('p-foot-r', '128px 184px', `<ellipse cx="128" cy="184" rx="21" ry="11" fill="var(--pet)" ${E}/>`)}
<g transform="rotate(${arm} 34 108)">${g('a-arm-l', '34px 108px', `<ellipse cx="30" cy="126" rx="13" ry="22" fill="var(--pet)" ${E}/>`)}</g>
<g transform="rotate(${-arm} 166 108)">${g('a-arm-r', '166px 108px', `<ellipse cx="170" cy="126" rx="13" ry="22" fill="var(--pet)" ${E}/>`)}</g>
<g class="p-body" style="transform-origin:100px 184px"><g class="a-breathe" style="transform-origin:100px 184px">
${g('p-ears', '100px 126px', s.ears(lvl))}
<path d="${BODY}" fill="var(--pet)" ${E}/>
<ellipse cx="100" cy="146" rx="42" ry="30" fill="var(--pet-light)"/>
<g clip-path="url(#${id})">${s.marks()}</g>
${scarf}
${g('p-face', '100px 126px', `<circle cx="58" cy="112" r="10" fill="${c.cheek}" opacity=".45"/><circle cx="142" cy="112" r="10" fill="${c.cheek}" opacity=".45"/><g class="p-facedyn">${faceMarkup(s, m)}</g>${shell}${hat}`)}
</g></g>
<g class="p-prop" style="transform-origin:0px 0px"></g>
</g></g>
<g class="p-fx"></g></svg>`;
  }

  root.ToshaPets = { SPECIES, svg, face };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ToshaPets;
})(typeof self !== 'undefined' ? self : this);
