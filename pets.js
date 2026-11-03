/* Тоша — питомцы. Всё нарисовано кодом (SVG). Слои для анимаций (см. anim.js):
   p-root > p-body > [туловище, a-arm-l/r, p-face(голова: p-ears, лицо)], a-tail, a-wing-l/r, p-foot-l/r, p-prop, p-fx */
(function (root) {
  'use strict';
  let n = 0;
  const INK = '#3b2f2f';
  const E = 'stroke="var(--edge)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const g = (cls, org, inner) => `<g class="${cls}" style="transform-origin:${org}">${inner}</g>`;
  const mx = (s, x) => s.replace(/(-?\d+(?:\.\d+)?)/g, m => m);   // зарезервировано
  const none = () => '';

  /* Туловище (общая форма, ширина подстраивается коэффициентом k у вида) */
  const TORSO = 'M68 108C58 128 54 154 58 172C62 184 82 187 100 187C118 187 138 184 142 172C146 154 142 128 132 108Z';

  /* ---------- Глаза ---------- */
  const L = 80, R = 120, Y = 76;
  function eyeOpen(cx, cy, s, k, big) {
    const rx = 7.8 * k, ry = 9.4 * k;
    const pupil = s.slit
      ? `<ellipse cx="${cx}" cy="${cy}" rx="${2.3 * k}" ry="${7.8 * k}" fill="${INK}"/>`
      : `<ellipse cx="${cx}" cy="${cy + .6}" rx="${4.3 * k}" ry="${6.2 * k}" fill="${INK}"/>`;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${s.iris}" stroke="${INK}" stroke-width="2"/>${pupil}` +
      `<circle cx="${cx + 2.6 * k}" cy="${cy - 3.4 * k}" r="${2.7 * k}" fill="#fff"/><circle cx="${cx - 2.4 * k}" cy="${cy + 3.4 * k}" r="${1.3 * k}" fill="#fff" opacity=".9"/>` +
      (big ? `<circle cx="${cx - 3.4}" cy="${cy - 4.4}" r="1.7" fill="#fff"/>` : '');
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
      case 'surprised': return [L, R].map(x => `<circle cx="${x}" cy="${Y}" r="10.6" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="${x}" cy="${Y + .5}" r="6" fill="${s.iris}"/><circle cx="${x}" cy="${Y + .5}" r="3.2" fill="${INK}"/><circle cx="${x + 2.2}" cy="${Y - 2.2}" r="1.8" fill="#fff"/>`).join('');
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
  const pinkNose = '#f08aa0';

  /* ---------- Виды ---------- */
  const SPECIES = {
    hamster: {
      title: 'Хомяк', name: 'Тоша', k: 1.1, w: true, iris: '#2a1f24', my: -1,
      c: { pet: '#e8b27a', light: '#fff1dc', edge: '#b9824f', cheek: '#ff9aa2' },
      headPath: 'M100 36C140 36 160 58 160 84C160 106 138 119 100 119C62 119 40 106 40 84C40 58 60 36 100 36Z',
      ears: () => g('a-ear-l', '62px 50px', `<circle cx="60" cy="46" r="15" fill="var(--pet)" ${E}/><circle cx="60" cy="47" r="8" fill="#f6b3a8"/>`) +
        g('a-ear-r', '138px 50px', `<circle cx="140" cy="46" r="15" fill="var(--pet)" ${E}/><circle cx="140" cy="47" r="8" fill="#f6b3a8"/>`),
      headDeco: () => '<path d="M48 56C62 38 138 38 152 56C140 64 122 66 100 66C78 66 60 64 48 56Z" fill="#c98c58"/>' +
        '<path d="M100 40v22" stroke="#fff1dc" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
        '<ellipse cx="64" cy="98" rx="24" ry="17" fill="var(--pet-light)"/><ellipse cx="136" cy="98" rx="24" ry="17" fill="var(--pet-light)"/><ellipse cx="100" cy="95" rx="18" ry="13" fill="var(--pet-light)"/>',
      bodyDeco: () => '<ellipse cx="100" cy="150" rx="30" ry="34" fill="var(--pet-light)"/><path d="M62 128q6 -8 14 -6" stroke="#c98c58" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>',
      back: () => g('a-tail', '134px 176px', `<circle cx="138" cy="180" r="7" fill="var(--pet)" ${E}/>`),
      foot: 'var(--pet-light)', paw: '#f6b3a8',
      under: m => (['neutral', 'relaxed', 'chew1'].includes(m)) ? '<rect x="96" y="97" width="8" height="8" rx="2" fill="#fff" stroke="#d9c3a5" stroke-width="1.4"/>' : '',
      over: () => `<circle cx="100" cy="90" r="3.6" fill="${pinkNose}"/>` + whisk(92, 22)
    },
    cat: {
      title: 'Кот', name: 'Мурзик', k: .95, w: true, iris: '#7fbf6a', my: 0,
      c: { pet: '#ffdcb8', light: '#fff6ea', edge: '#cf9e78', cheek: '#ff9aa2' },
      headPath: 'M100 34C134 34 154 52 154 80C154 104 134 118 100 118C66 118 46 104 46 80C46 52 66 34 100 34Z',
      ears: () => g('a-ear-l', '72px 50px', `<path d="M48 72C45 52 49 32 57 18C72 24 86 34 96 44Z" fill="var(--pet)" ${E}/><path d="M58 58C57 46 59 36 62 29C70 32 78 37 84 43Z" fill="#ffb3b8"/>`) +
        g('a-ear-r', '128px 50px', `<path d="M152 72C155 52 151 32 143 18C128 24 114 34 104 44Z" fill="var(--pet)" ${E}/><path d="M142 58C143 46 141 36 138 29C130 32 122 37 116 43Z" fill="#ffb3b8"/>`),
      headDeco: () => '<path d="M40 30C70 24 96 36 108 50C100 70 82 82 64 88C46 84 36 62 40 30Z" fill="#f2a65a"/><path d="M128 36C150 38 160 54 158 72C148 70 134 62 128 36Z" fill="#b98764"/>' +
        '<ellipse cx="100" cy="96" rx="22" ry="15" fill="var(--pet-light)"/>',
      headFront: () => `<path d="M50 84l-9 3 8 4-8 5 12-1z" fill="var(--pet)" ${E}/><path d="M150 84l9 3-8 4 8 5-12-1z" fill="var(--pet)" ${E}/>`,
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="26" ry="30" fill="var(--pet-light)"/><path d="M58 150C66 140 76 146 76 160C70 172 60 172 56 164Z" fill="#f2a65a"/><path d="M142 124C150 134 148 150 140 156Z" fill="#b98764"/>',
      back: () => g('a-tail', '132px 174px',
        `<path d="M132 174C170 182 190 152 178 124C173 114 165 111 158 115" fill="none" stroke="var(--edge)" stroke-width="19" stroke-linecap="round"/>` +
        `<path d="M132 174C170 182 190 152 178 124C173 114 165 111 158 115" fill="none" stroke="#f2a65a" stroke-width="14" stroke-linecap="round"/>` +
        `<path d="M176 128C173 117 166 112 158 115" fill="none" stroke="#fff6ea" stroke-width="14" stroke-linecap="round"/>`),
      foot: 'var(--pet-light)', paw: 'var(--pet-light)',
      under: none,
      over: () => `<path d="M95 89h10l-5 6.5z" fill="${pinkNose}" stroke="#c0607a" stroke-width="1.2" stroke-linejoin="round"/>` + whisk(92, 24)
    },
    bunny: {
      title: 'Кролик', name: 'Пушок', k: .94, w: true, iris: '#5aa9e6', my: 0,
      c: { pet: '#fbe6c2', light: '#fffaf0', edge: '#d6b98d', cheek: '#ff9aa2' },
      headPath: 'M100 36C130 36 146 54 146 80C146 104 128 118 100 118C72 118 54 104 54 80C54 54 70 36 100 36Z',
      ears: () => g('a-ear-l', '78px 54px', `<g transform="rotate(-8 78 54)"><path d="M70 54C57 30 57 2 66 -16C75 -23 85 -8 88 14C91 30 90 42 88 56Z" fill="var(--pet)" ${E}/><path d="M72 46C65 28 65 8 69 -6C76 -8 82 6 84 20C85 32 84 40 83 48Z" fill="#ffc2cd"/></g>`) +
        g('a-ear-r', '122px 54px', `<g transform="rotate(10 122 54)"><path d="M130 54C143 30 143 2 134 -16C125 -23 115 -8 112 14C109 30 110 42 112 56Z" fill="var(--pet)" ${E}/><path d="M128 46C135 28 135 8 131 -6C124 -8 118 6 116 20C115 32 116 40 117 48Z" fill="#ffc2cd"/></g>`),
      headDeco: () => '<ellipse cx="76" cy="100" rx="20" ry="15" fill="var(--pet-light)"/><ellipse cx="124" cy="100" rx="20" ry="15" fill="var(--pet-light)"/><ellipse cx="100" cy="96" rx="17" ry="13" fill="var(--pet-light)"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="26" ry="30" fill="var(--pet-light)"/><path d="M68 176q32 6 64 0" stroke="#d6b98d" stroke-width="2" fill="none" opacity=".5"/>',
      back: () => g('a-tail', '140px 178px', `<circle cx="142" cy="178" r="13" fill="#fffaf0" ${E}/><path d="M136 174q6 -5 12 0" stroke="#e3d3bd" stroke-width="2" fill="none"/>`),
      foot: 'var(--pet)', paw: '#ffc2cd', footRx: 22,
      under: m => (['neutral', 'relaxed', 'chew1'].includes(m)) ? '<rect x="94" y="97" width="12" height="11" rx="3" fill="#fff" stroke="#e3d3bd" stroke-width="1.6"/><path d="M100 98v9" stroke="#e3d3bd" stroke-width="1.4"/>' : '',
      over: () => '<path d="M95 88h10q0 5.5-5 8q-5-2.5-5-8z" fill="#f08aa0"/>' + whisk(94, 20)
    },
    dragon: {
      title: 'Дракончик', name: 'Искра', k: 1, iris: '#f08a24', slit: true, my: 0,
      c: { pet: '#62c7b2', light: '#ffeaa9', edge: '#3a9a88', cheek: '#ff9f6b' },
      headPath: 'M100 34C134 34 152 54 152 80C152 104 132 118 100 118C68 118 48 104 48 80C48 54 66 34 100 34Z',
      ears: () => `<path d="M50 68L26 54L36 70L22 80L38 82L52 94Z" fill="#3da895" ${E}/><path d="M150 68L174 54L164 70L178 80L162 82L148 94Z" fill="#3da895" ${E}/>` +
        `<path d="M68 46C56 32 58 14 68 4C72 18 80 30 90 38Z" fill="#ecd1a0" ${E}/><path d="M132 46C144 32 142 14 132 4C128 18 120 30 110 38Z" fill="#ecd1a0" ${E}/>` +
        `<path d="M90 36L96 20L102 34L110 18L112 38Z" fill="#3da895" ${E}/>`,
      headDeco: () => '<ellipse cx="100" cy="98" rx="27" ry="19" fill="#86dccb"/><circle cx="72" cy="62" r="3" fill="#3da895" opacity=".5"/><circle cx="130" cy="58" r="2.4" fill="#3da895" opacity=".5"/><circle cx="84" cy="50" r="2" fill="#3da895" opacity=".5"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="27" ry="31" fill="var(--pet-light)"/><path d="M76 138q24 8 48 0M74 150q26 9 52 0M76 162q24 9 48 0M82 174q18 6 36 0" fill="none" stroke="#e2c46a" stroke-width="2.4" stroke-linecap="round"/>',
      back: () => g('a-tail', '128px 176px',
        '<path d="M128 176C160 188 186 172 184 146" fill="none" stroke="var(--edge)" stroke-width="22" stroke-linecap="round"/><path d="M128 176C160 188 186 172 184 146" fill="none" stroke="var(--pet)" stroke-width="16" stroke-linecap="round"/>' +
        `<path d="M173 150L184 124L195 150Z" fill="#3da895" ${E}/>`) +
        g('a-wing-l', '70px 124px', `<path d="M72 124C42 108 16 84 8 52C24 64 34 62 41 60C38 76 52 86 62 92C58 102 66 114 76 130Z" fill="#3da895" ${E}/><path d="M12 58C24 74 40 84 62 94" fill="none" stroke="#2b7f70" stroke-width="2"/>`) +
        g('a-wing-r', '130px 124px', `<path d="M128 124C158 108 184 84 192 52C176 64 166 62 159 60C162 76 148 86 138 92C142 102 134 114 124 130Z" fill="#3da895" ${E}/><path d="M188 58C176 74 160 84 138 94" fill="none" stroke="#2b7f70" stroke-width="2"/>`),
      foot: 'var(--pet)', paw: '#ecd1a0',
      under: none,
      over: () => '<ellipse cx="93" cy="93" rx="2.4" ry="3" fill="#2f7f70"/><ellipse cx="107" cy="93" rx="2.4" ry="3" fill="#2f7f70"/>'
    },
    fox: {
      title: 'Лисёнок', name: 'Рыжик', k: .93, w: true, iris: '#e8a317', my: 4,
      c: { pet: '#f28c3c', light: '#fff3e3', edge: '#c76a1f', cheek: '#ff8f8f' },
      headPath: 'M100 36C120 36 138 44 150 64C158 80 152 98 134 110C122 118 110 120 100 120C90 120 78 118 66 110C48 98 42 80 50 64C62 44 80 36 100 36Z',
      ears: () => g('a-ear-l', '72px 56px', `<path d="M46 72L50 8L100 46Z" fill="var(--pet)" ${E}/><path d="M60 58L60 28L86 46Z" fill="#fff0dc"/><path d="M50 8L64 18L56 34Z" fill="#5c3320"/>`) +
        g('a-ear-r', '128px 56px', `<path d="M154 72L150 8L100 46Z" fill="var(--pet)" ${E}/><path d="M140 58L140 28L114 46Z" fill="#fff0dc"/><path d="M150 8L136 18L144 34Z" fill="#5c3320"/>`),
      headDeco: () => '<path d="M40 78C58 90 78 96 100 96C122 96 142 90 160 78L160 130L40 130Z" fill="var(--pet-light)"/><ellipse cx="100" cy="102" rx="16" ry="11" fill="var(--pet-light)"/>',
      headFront: () => `<path d="M49 86l-10 5 10 3-8 7 13-1z" fill="var(--pet-light)" ${E}/><path d="M151 86l10 5-10 3 8 7-13-1z" fill="var(--pet-light)" ${E}/>`,
      bodyDeco: () => '<ellipse cx="100" cy="146" rx="22" ry="34" fill="var(--pet-light)"/>',
      back: (lvl, id) => g('a-tail', '128px 172px',
        `<clipPath id="${id}t"><path d="M128 178C166 202 206 158 190 104C184 98 177 100 173 108C167 132 150 150 126 154Z"/></clipPath>` +
        `<path d="M128 178C166 202 206 158 190 104C184 98 177 100 173 108C167 132 150 150 126 154Z" fill="var(--pet)"/>` +
        `<g clip-path="url(#${id}t)"><path d="M160 76L220 76L220 126Q192 116 164 132Z" fill="#fff6ea"/></g>` +
        `<path d="M128 178C166 202 206 158 190 104C184 98 177 100 173 108C167 132 150 150 126 154Z" fill="none" ${E}/>`),
      foot: '#5c3320', paw: '#5c3320', arm: '#f28c3c',
      under: none,
      over: () => `<path d="M93 90q7 -5 14 0q0 7 -7 9q-7 -2 -7 -9z" fill="${INK}"/><circle cx="97" cy="91" r="1.4" fill="#fff" opacity=".7"/>` +
        '<circle cx="78" cy="104" r="1.5" fill="#6b3b25" opacity=".6"/><circle cx="73" cy="100" r="1.5" fill="#6b3b25" opacity=".6"/><circle cx="122" cy="104" r="1.5" fill="#6b3b25" opacity=".6"/><circle cx="127" cy="100" r="1.5" fill="#6b3b25" opacity=".6"/>'
    },
    bear: {
      title: 'Медвежонок', name: 'Мишка', k: 1.12, iris: '#3a261b', my: 0,
      c: { pet: '#b4764f', light: '#e6c19a', edge: '#7d4b2e', cheek: '#e8957f' },
      headPath: 'M100 34C136 34 156 54 156 80C156 104 136 118 100 118C64 118 44 104 44 80C44 54 64 34 100 34Z',
      ears: () => g('a-ear-l', '62px 52px', `<circle cx="62" cy="46" r="18" fill="var(--pet)" ${E}/><circle cx="62" cy="47" r="9" fill="#e8b9a0"/>`) +
        g('a-ear-r', '138px 52px', `<circle cx="138" cy="46" r="18" fill="var(--pet)" ${E}/><circle cx="138" cy="47" r="9" fill="#e8b9a0"/>`),
      headDeco: () => '<ellipse cx="100" cy="98" rx="26" ry="20" fill="var(--pet-light)"/><path d="M72 52q28 -12 56 0" stroke="#9a5f3d" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>',
      bodyDeco: () => '<ellipse cx="100" cy="152" rx="30" ry="32" fill="var(--pet-light)"/><path d="M82 140l6 6M96 136l4 8M112 140l-4 7" stroke="#c9a47c" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
      back: () => g('a-tail', '142px 180px', `<circle cx="144" cy="182" r="9" fill="var(--pet)" ${E}/>`),
      foot: 'var(--pet)', paw: '#e6c19a', footRx: 20,
      under: none,
      over: () => `<ellipse cx="100" cy="91" rx="8.4" ry="5.8" fill="${INK}"/><ellipse cx="97" cy="89" rx="2.6" ry="1.5" fill="#fff" opacity=".55"/>`
    }
  };
  const ORDER = ['hamster', 'cat', 'bunny', 'dragon', 'fox', 'bear'];

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
    const body = `<ellipse cx="${cx + ox}" cy="186" rx="${rx}" ry="9.5" fill="${s.foot || 'var(--pet)'}" ${E}/><path d="M${cx + ox - 6} 189v3M${cx + ox} 190v3M${cx + ox + 6} 189v3" stroke="var(--edge)" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`;
    return g(side < 0 ? 'p-foot-l' : 'p-foot-r', `${cx}px 186px`, body);
  }

  const faceMarkup = (s, m) => s.under(m) + g('a-eyes', '100px 76px', eyes(s, m)) + mouth(s, m) + s.over(m);
  const face = (sp, m) => faceMarkup(SPECIES[sp] || SPECIES.hamster, m);

  function shade(hex, f) {
    const v = parseInt(hex.slice(1), 16), m = x => Math.max(0, Math.min(255, Math.round(x * (1 + f))));
    return '#' + [m((v >> 16) & 255), m((v >> 8) & 255), m(v & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function svg(sp, m, lvl, o) {
    o = o || {};
    if (!SPECIES[sp]) sp = 'hamster';
    const s = SPECIES[sp], id = 'pc' + (++n);
    const hexOk = v => /^#[0-9a-f]{6}$/i.test(v || '');
    const c = (o.colors && hexOk(o.colors.pet) && hexOk(o.colors.light)) ? Object.assign({}, s.c, { pet: o.colors.pet, light: o.colors.light, edge: shade(o.colors.pet, -0.22) }) : s.c;
    const sc = (0.9 + Math.min(lvl, 10) * 0.01).toFixed(3), k = s.k || 1;
    const kt = `translate(100 0) scale(${k} 1) translate(-100 0)`;
    const scarf = lvl >= 3 ? `<g class="p-scarf" style="transform-origin:100px 125px"><path d="M${Math.round(100 - 38 * k)} 110Q100 132 ${Math.round(100 + 38 * k)} 110L${Math.round(100 + 42 * k)} 126Q100 150 ${Math.round(100 - 42 * k)} 126Z" fill="var(--accent)"/><path d="M${Math.round(100 + 18 * k)} 128l${Math.round(14 * k)} 30l-14 4l-8 -28z" fill="var(--accent)"/><path d="M${Math.round(100 - 36 * k)} 118q${Math.round(36 * k)} 18 ${Math.round(72 * k)} 0" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/></g>` : '';
    const hat0 = lvl >= 8
      ? '<path d="M66 52L72 22L88 40L100 14L112 40L128 22L134 52Z" fill="#ffc83d" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="20" r="3" fill="#e8483f"/><circle cx="76" cy="30" r="2.4" fill="#5db9e6"/><circle cx="124" cy="30" r="2.4" fill="#5db9e6"/>'
      : lvl >= 5 ? '<path d="M62 60Q100 -4 138 60Z" fill="#1f8f82"/><rect x="56" y="54" width="88" height="12" rx="6" fill="#16766b"/><circle cx="100" cy="10" r="7" fill="#fff"/>' : '';
    const hat = hat0 ? '<g class="p-hat" style="transform-origin:100px 56px">' + hat0 + '</g>' : '';
    const shell = lvl < 2 ? '<path d="M46 66C44 6 156 6 154 66L140 56L126 70L112 52L98 70L86 52L72 70L60 56Z" fill="#fffaf0" stroke="#e5cfae" stroke-width="3" stroke-linejoin="round"/>' : '';
    const style = `--pet:${c.pet};--pet-light:${c.light};--edge:${c.edge};--cheek:${c.cheek};`;
    const head = `<path d="${s.headPath}" fill="var(--pet)" ${E}/>` +
      `<g clip-path="url(#${id}h)">${s.headDeco()}</g>` +
      (s.headFront ? s.headFront() : '') +
      `<circle cx="64" cy="90" r="8" fill="var(--cheek)" opacity=".38"/><circle cx="136" cy="90" r="8" fill="var(--cheek)" opacity=".38"/>`;
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
