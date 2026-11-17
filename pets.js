/* Тоша — обновлённые милые чиби-питомцы. Совместимые слои для anim.js сохранены. */
(function(root){
'use strict';
let uid=0;
const E='stroke="var(--edge)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
const g=(cls,origin,html)=>`<g class="${cls}" style="transform-origin:${origin}">${html}</g>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const INK='#49343a', L=77,R=123,Y=83;
const S={
 hamster:{title:'Хомяк',name:'Тоша',c:{pet:'#b9bac8',light:'#fffafa',edge:'#777889',cheek:'#f5a6ad'},iris:'#382b38',k:1.08,
  ears:()=>g('a-ear-l','61px 55px',`<ellipse cx="59" cy="52" rx="18" ry="22" fill="var(--pet)" ${E}/><ellipse cx="59" cy="54" rx="10" ry="14" fill="#e9aab5"/>`)+g('a-ear-r','139px 55px',`<ellipse cx="141" cy="52" rx="18" ry="22" fill="var(--pet)" ${E}/><ellipse cx="141" cy="54" rx="10" ry="14" fill="#e9aab5"/>`),
  head:'M100 27Q132 25 153 51Q174 78 162 111Q150 145 119 147Q100 154 81 147Q50 145 38 111Q26 78 47 51Q68 25 100 27Z',
  marks:'<path d="M42 92Q58 78 75 88Q100 98 125 88Q142 78 158 92L158 133Q100 158 42 133Z" fill="#fffafa"/>',
  body:'<ellipse cx="100" cy="157" rx="36" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 177px',`<path d="M137 176q24 3 20 17q-4 12-17 5" fill="var(--pet)" ${E}/>`),
  extra:'<ellipse cx="100" cy="125" rx="24" ry="18" fill="#fffafa"/>',paw:'#f2a8b3'},
 cat:{title:'Кот',name:'Мурзик',c:{pet:'#b8bbc7',light:'#fffafa',edge:'#777b8b',cheek:'#f5a4ad'},iris:'#382c3b',k:1,
  ears:()=>g('a-ear-l','57px 58px',`<path d="M35 81L40 22Q44 9 56 24L84 61Z" fill="var(--pet)" ${E}/><path d="M47 60L49 34Q51 28 58 39L70 58Z" fill="#e6a9b6"/>`)+g('a-ear-r','143px 58px',`<path d="M165 81L160 22Q156 9 144 24L116 61Z" fill="var(--pet)" ${E}/><path d="M153 60L151 34Q149 28 142 39L130 58Z" fill="#e6a9b6"/>`),
  head:'M100 29Q126 27 145 48L165 72Q174 83 160 98L151 120Q132 148 100 146Q68 148 49 120L40 98Q26 83 35 72L55 48Q74 27 100 29Z',
  marks:'<path d="M100 34v21M88 38l5 17M112 38l-5 17" stroke="#858a99" stroke-width="4" stroke-linecap="round"/><ellipse cx="100" cy="123" rx="31" ry="21" fill="#fffafa"/>',
  body:'<ellipse cx="100" cy="157" rx="34" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 174px',`<path d="M139 176Q184 186 180 139Q177 119 158 126" fill="none" stroke="var(--edge)" stroke-width="20" stroke-linecap="round"/><path d="M139 176Q184 186 180 139Q177 119 158 126" fill="none" stroke="var(--pet)" stroke-width="14" stroke-linecap="round"/>`),
  extra:'<path d="M68 140l8 5M60 150l12 3M132 140l-8 5M140 150l-12 3" stroke="#858a99" stroke-width="3" stroke-linecap="round"/>',paw:'#f4a5b2'},
 bunny:{title:'Зайчик',name:'Пушок',c:{pet:'#f7d9d7',light:'#fff5f1',edge:'#bd8888',cheek:'#f5a0a8'},iris:'#38272e',k:.98,
  ears:()=>g('a-ear-l','73px 48px',`<path d="M56 72Q39 34 51 -13Q60 -25 73 -8Q91 26 86 72Z" fill="var(--pet)" ${E}/><path d="M62 57Q50 25 58 -7Q65 -11 71 3Q81 30 78 57Z" fill="#f0a6b0"/>`)+g('a-ear-r','127px 48px',`<path d="M144 72Q161 34 149 -13Q140 -25 127 -8Q109 26 114 72Z" fill="var(--pet)" ${E}/><path d="M138 57Q150 25 142 -7Q135 -11 129 3Q119 30 122 57Z" fill="#f0a6b0"/>`),
  head:'M100 34Q127 31 146 52Q165 71 159 105Q151 140 119 148Q100 154 81 148Q49 140 41 105Q35 71 54 52Q73 31 100 34Z',
  marks:'<ellipse cx="65" cy="116" rx="19" ry="16" fill="#fff5f1"/><ellipse cx="135" cy="116" rx="19" ry="16" fill="#fff5f1"/>',
  body:'<ellipse cx="100" cy="158" rx="34" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 176px',`<circle cx="147" cy="178" r="14" fill="#fff5f1" ${E}/>`),
  extra:'<path d="M68 145Q100 165 132 145" fill="none" stroke="#e7b6b3" stroke-width="3"/>',paw:'#f3a3b2'},
 deer:{title:'Оленёнок',name:'Бэмби',c:{pet:'#d99a6d',light:'#fff3e7',edge:'#8d5738',cheek:'#f3a0a0'},iris:'#493027',k:.96,
  ears:()=>g('a-ear-l','62px 59px',`<path d="M66 70Q39 65 27 42Q22 31 35 31Q55 34 77 56Z" fill="var(--pet)" ${E}/><path d="M61 61Q43 55 34 40Q45 39 65 57Z" fill="#f7c5b8"/>`)+g('a-ear-r','138px 59px',`<path d="M134 70Q161 65 173 42Q178 31 165 31Q145 34 123 56Z" fill="var(--pet)" ${E}/><path d="M139 61Q157 55 166 40Q155 39 135 57Z" fill="#f7c5b8"/>`)+`<path d="M82 42L77 22M78 29L67 22M78 27L87 19M118 42L123 22M122 29L133 22M122 27L113 19" stroke="#8d5738" stroke-width="4" stroke-linecap="round" fill="none"/>`,
  head:'M100 31Q128 28 147 49Q166 69 158 105Q149 139 119 147Q100 153 81 147Q51 139 42 105Q34 69 53 49Q72 28 100 31Z',
  marks:'<ellipse cx="100" cy="122" rx="29" ry="19" fill="#fff3e7"/><circle cx="100" cy="48" r="3.2" fill="#fff3e7"/><circle cx="88" cy="55" r="2.4" fill="#fff3e7"/><circle cx="112" cy="55" r="2.4" fill="#fff3e7"/>',
  body:'<ellipse cx="100" cy="160" rx="30" ry="29" fill="#fff3e7"/><circle cx="72" cy="139" r="3" fill="#fff3e7"/><circle cx="128" cy="139" r="3" fill="#fff3e7"/><circle cx="70" cy="151" r="2.5" fill="#fff3e7"/><circle cx="130" cy="151" r="2.5" fill="#fff3e7"/>',
  tail:()=>g('a-tail','145px 177px',`<path d="M137 174q17 -9 20 5q-11 11 -20 -5Z" fill="#fff3e7" stroke="var(--edge)" stroke-width="2.5"/>`),
  extra:'',paw:'#8d5738'},
 dragon:{title:'Дракончик',name:'Искра',c:{pet:'#9bd4a5',light:'#e5f4c9',edge:'#659b70',cheek:'#f5a3a1'},iris:'#314d3b',k:1,
  ears:()=>`<path d="M49 75Q22 67 20 43Q43 47 62 63Z" fill="#8bc99a" ${E}/><path d="M151 75Q178 67 180 43Q157 47 138 63Z" fill="#8bc99a" ${E}/><path d="M76 43L83 14L98 39L108 12L122 43Z" fill="#82c48f" ${E}/>`,
  head:'M100 31Q128 29 148 51Q169 73 158 108Q147 142 117 146Q100 153 83 146Q53 142 42 108Q31 73 52 51Q72 29 100 31Z',
  marks:'<circle cx="59" cy="75" r="4" fill="#73b983"/><circle cx="139" cy="75" r="4" fill="#73b983"/><ellipse cx="100" cy="123" rx="30" ry="20" fill="#c4e8b9"/>',
  body:'<ellipse cx="100" cy="158" rx="35" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 178px',`<path d="M135 175Q176 194 190 156L179 147Q165 165 143 158Z" fill="var(--pet)" ${E}/>`),
  wings:()=>g('a-wing-l','50px 133px',`<path d="M65 132Q28 95 12 112Q18 148 61 161Z" fill="#c7eafa" stroke="#80b6d0" stroke-width="3"/><path d="M20 118l37 28M32 116l23 24" stroke="#94c8df" stroke-width="2" fill="none"/>`)+g('a-wing-r','150px 133px',`<path d="M135 132Q172 95 188 112Q182 148 139 161Z" fill="#c7eafa" stroke="#80b6d0" stroke-width="3"/><path d="M180 118l-37 28M168 116l-23 24" stroke="#94c8df" stroke-width="2" fill="none"/>`),
  extra:'<path d="M100 143l5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1Z" fill="#ffd45b" stroke="#d4a63e" stroke-width="2"/>',paw:'#d4edbc'},
 fox:{title:'Лисёнок',name:'Рыжик',c:{pet:'#ef7952',light:'#fff3e8',edge:'#a84f36',cheek:'#f4a0a0'},iris:'#3d2926',k:1,
  ears:()=>g('a-ear-l','58px 58px',`<path d="M31 86L39 8Q43 -3 55 17L83 65Z" fill="var(--pet)" ${E}/><path d="M45 64L49 28L68 59Z" fill="#fff0df"/>`)+g('a-ear-r','142px 58px',`<path d="M169 86L161 8Q157 -3 145 17L117 65Z" fill="var(--pet)" ${E}/><path d="M155 64L151 28L132 59Z" fill="#fff0df"/>`),
  head:'M100 30Q130 29 149 54L166 85Q171 108 146 128Q126 148 100 152Q74 148 54 128Q29 108 34 85L51 54Q70 29 100 30Z',
  marks:'<path d="M38 101Q67 112 100 108Q133 112 162 101L147 136Q100 162 53 136Z" fill="#fff3e8"/>',
  body:'<ellipse cx="100" cy="158" rx="33" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 173px',`<path d="M137 177Q180 197 191 145Q198 113 173 110Q166 145 139 151Z" fill="var(--pet)" ${E}/><path d="M174 113Q194 122 185 149Q176 159 163 159Q178 140 174 113Z" fill="#fff3e8"/>`),
  extra:'<ellipse cx="100" cy="151" rx="20" ry="29" fill="#fff3e8"/>',paw:'#fff0df'},
 bear:{title:'Мишка',name:'Мишка',c:{pet:'#a87553',light:'#f5dfbd',edge:'#79543e',cheek:'#e9a09a'},iris:'#3d2924',k:1.08,
  ears:()=>g('a-ear-l','61px 58px',`<circle cx="59" cy="54" r="22" fill="var(--pet)" ${E}/><circle cx="59" cy="54" r="12" fill="#d9aa8c"/>`)+g('a-ear-r','139px 58px',`<circle cx="141" cy="54" r="22" fill="var(--pet)" ${E}/><circle cx="141" cy="54" r="12" fill="#d9aa8c"/>`),
  head:'M100 29Q130 27 149 49Q169 72 160 108Q151 140 120 149Q100 155 80 149Q49 140 40 108Q31 72 51 49Q70 27 100 29Z',
  marks:'<ellipse cx="100" cy="120" rx="30" ry="22" fill="#f5dfbd"/>',
  body:'<ellipse cx="100" cy="158" rx="37" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 178px',`<circle cx="145" cy="180" r="10" fill="var(--pet)" ${E}/>`),
  extra:'',paw:'#e8c7a8'}
};
const ORDER=['hamster','cat','bunny','deer','dragon','fox','bear'];
function eyes(s,m){
 const eye=(x,y=Y,scale=1)=>`<ellipse cx="${x}" cy="${y}" rx="${10.8*scale}" ry="${13*scale}" fill="${s.iris}"/><ellipse cx="${x+3.5}" cy="${y-5}" rx="4" ry="5" fill="#fff"/><circle cx="${x-3}" cy="${y+5}" r="2" fill="#fff" opacity=".9"/>`;
 if(['happy','sleepy'].includes(m)) return `<path d="M${L-10} ${Y}q10 -13 20 0M${R-10} ${Y}q10 -13 20 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
 if(m==='surprised') return `<circle cx="${L}" cy="${Y}" r="13" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${R}" cy="${Y}" r="13" fill="#fff" stroke="${INK}" stroke-width="2"/>`+eye(L,Y,1.05)+eye(R,Y,1.05);
 return eye(L,Y,m==='excited'?1.13:1)+eye(R,Y,m==='excited'?1.13:1);
}
function mouth(m){
 if(m==='sad') return `<path d="M91 126q9 -10 18 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
 if(m==='sleepy'||m==='tired') return `<path d="M94 126h12" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
 if(m==='surprised'||m==='hungry') return `<ellipse cx="100" cy="128" rx="5" ry="7" fill="${INK}"/>`;
 return `<path d="M88 119Q100 131 112 119Q107 140 100 136Q93 140 88 119Z" fill="${INK}"/><path d="M94 131q6 -5 12 0q-6 8 -12 0" fill="#f58d9d"/>`;
}
function nose(sp){
 const fill={hamster:"#d98791",cat:"#e88e9e",bunny:"#e58d9c",deer:"#493027",dragon:"#5e9870",fox:"#49302a",bear:"#684333"}[sp]||"#d98791";
 const edge=sp==="dragon"?"#477e5b":"#69434a";
 return `<path d="M94 103Q100 98 106 103Q105 110 100 111Q95 110 94 103Z" fill="${fill}" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/><path d="M97 103q2-2 4-1" fill="none" stroke="#fff4f4" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
}
function muzzle(sp){
 const shapes={
 hamster:'<ellipse cx="88" cy="119" rx="13" ry="11" fill="#fffafa"/><ellipse cx="112" cy="119" rx="13" ry="11" fill="#fffafa"/>',
 cat:'<ellipse cx="89" cy="119" rx="14" ry="10" fill="#fffafa"/><ellipse cx="111" cy="119" rx="14" ry="10" fill="#fffafa"/>',
 bunny:'<ellipse cx="100" cy="119" rx="17" ry="12" fill="#fff5f1"/>',
 deer:'<path d="M77 112Q100 103 123 112Q127 133 100 138Q73 133 77 112Z" fill="#fff3e7"/>',
 dragon:'<path d="M78 111Q100 105 122 111L119 130Q100 140 81 130Z" fill="#c4e8b9"/>',
 fox:'<path d="M76 111Q100 105 124 111Q121 130 100 139Q79 130 76 111Z" fill="#fff3e8"/>',
 bear:'<ellipse cx="100" cy="119" rx="23" ry="17" fill="#f5dfbd"/>'
 };
 return shapes[sp]||shapes.hamster;
}
function face(sp,m){const s=S[sp]||S.hamster;return `<g class="a-eyes">${eyes(s,m)}</g>${muzzle(sp)}${nose(sp)}${mouth(m)}<ellipse cx="55" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/><ellipse cx="145" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/>`}

function shade(hex,f){const v=parseInt(hex.slice(1),16),a=[v>>16&255,v>>8&255,v&255].map(x=>Math.max(0,Math.min(255,Math.round(x*(1+f)))));return '#'+a.map(x=>x.toString(16).padStart(2,'0')).join('');}
const BODY_SHAPES={
hamster:'M55 151Q61 128 83 128Q100 117 117 128Q139 128 145 151Q151 174 132 188Q117 198 100 194Q83 198 68 188Q49 174 55 151Z',
cat:'M59 145Q63 128 82 128L91 137L100 130L109 137L118 128Q137 128 141 145Q150 167 133 187Q117 197 100 192Q83 197 67 187Q50 167 59 145Z',
bunny:'M59 148Q62 130 82 130Q100 122 118 130Q138 130 141 148Q148 171 130 188Q116 197 100 192Q84 197 70 188Q52 171 59 148Z',
deer:'M62 145Q68 127 86 130Q100 124 114 130Q132 127 138 145Q145 166 129 185Q116 194 100 190Q84 194 71 185Q55 166 62 145Z',
dragon:'M57 148Q62 127 83 130L92 136L100 128L108 136L117 130Q138 127 143 148Q149 170 131 188Q116 197 100 192Q84 197 69 188Q51 170 57 148Z',
fox:'M58 146Q65 128 84 130Q100 125 116 130Q135 128 142 146Q149 169 131 188Q115 198 100 192Q85 198 69 188Q51 169 58 146Z',
bear:'M54 148Q58 126 81 126Q100 116 119 126Q142 126 146 148Q153 174 132 190Q117 200 100 194Q83 200 68 190Q47 174 54 148Z'
};

const HEAD_FUR={
 hamster:'M47 59q-8 0-10 10l8 1q-7 7-5 14l8-2q-4 8 1 14l7-5q0 10 8 13l3-8q5 9 13 9l1-8q8 8 16 5q8 3 16-5l1 8q8 0 13-9l3 8q8-3 8-13l7 5q5-6 1-14l8 2q2-7-5-14l8-1q-2-10-10-10',
 cat:'M48 59l-10 2 7 8-4 9 9-1q-1 9 7 13l4-8q4 10 13 10l1-8q8 8 15 4l2-7 0 0q7 4 15-4l1 8q9 0 13-10l4 8q8-4 7-13l9 1-4-9 7-8-10-2',
 bunny:'M48 64q-8 3-8 12l9-1q-4 9 3 15l6-6q1 10 10 12l2-8q7 8 15 5l2-7q13 5 26 0l2 7q8 3 15-5l2 8q9-2 10-12l6 6q7-6 3-15l9 1q0-9-8-12',
 deer:'M49 61q-9 3-8 12l9-1q-4 8 2 14l6-5q2 9 10 11l3-7q7 8 15 4l3-7q10 4 21 0l3 7q8 4 15-4l3 7q8-2 10-11l6 5q6-6 2-14l9 1q1-9-8-12',
 dragon:'M49 62l-9 2 7 8-3 9 9-1q-1 9 7 13l5-8q4 10 13 9l2-8q8 7 15 3q7 4 15-3l2 8q9 1 13-9l5 8q8-4 7-13l9 1-3-9 7-8-9-2',
 fox:'M49 60q-9 3-7 12l9-1q-4 9 3 15l6-6q2 10 11 12l3-8q8 8 16 4l2-7q8 5 16 0l2 7q8 4 16-4l3 8q9-2 11-12l6 6q7-6 3-15l9 1q2-9-7-12',
 bear:'M47 60q-9 2-8 12l9-1q-4 9 3 15l6-6q1 10 10 12l3-8q8 9 17 5l2-8q9 5 18 0l2 8q9 4 17-5l3 8q9-2 10-12l6 6q7-6 3-15l9 1q1-10-8-12'
};
const BODY_FUR={
 hamster:'M63 145q-8 5-7 15l7-2q-3 9 4 14l5-5q1 10 10 12l2-7q8 9 16 5q8 4 16-5l2 7q9-2 10-12l5 5q7-5 4-14l7 2q1-10-7-15',
 cat:'M63 143l-7 7 8 2-3 10 9-3q0 10 9 13l3-7q8 8 18 4q10 4 18-4l3 7q9-3 9-13l9 3-3-10 8-2-7-7',
 bunny:'M63 145q-8 5-6 14l7-2q-2 10 6 14l5-6q2 10 11 11l2-7q12 7 24 0l2 7q9-1 11-11l5 6q8-4 6-14l7 2q2-9-6-14',
 deer:'M66 143q-8 5-6 14l7-2q-2 9 6 13l5-5q3 9 11 10l2-6q9 5 18 0l2 6q8-1 11-10l5 5q8-4 6-13l7 2q2-9-6-14',
 dragon:'M61 145l-7 8 9 1-2 10 9-4q2 10 11 12l3-7q8 8 16 4q8 4 16-4l3 7q9-2 11-12l9 4-2-10 9-1-7-8',
 fox:'M62 144q-8 5-6 14l7-2q-2 10 6 14l5-6q2 10 11 11l2-7q9 6 18 0l2 7q9-1 11-11l5 6q8-4 6-14l7 2q2-9-6-14',
 bear:'M61 143q-9 6-6 16l8-2q-2 10 7 14l5-6q2 10 12 12l2-8q11 7 22 0l2 8q10-2 12-12l5 6q9-4 7-14l8 2q3-10-6-16'
};


const HEAD_SILHOUETTES={
 hamster:'M100 27Q132 25 153 51Q165 65 166 82l-7 2q10 8 7 20l-8-1q3 11-5 18l-7-5q-1 12-12 17l-4-7q-8 10-19 8q-11 2-19-8l-4 7q-11-5-12-17l-7 5q-8-7-5-18l-8 1q-3-12 7-20l-7-2Q35 65 47 51Q68 25 100 27Z',
 cat:'M100 29Q126 27 145 48L165 72Q174 83 160 98L153 108l-8-2q-1 12-12 17l-5-7q-5 14-18 18l-4-8q-6 8-13 0l-4 8q-13-4-18-18l-5 7q-11-5-12-17l-8 2-7-10Q26 83 35 72L55 48Q74 27 100 29Z',
 bunny:'M100 34Q127 31 146 52Q164 72 159 105l-8 2q2 12-7 19l-7-5q-3 13-15 18l-4-7q-8 9-18 7q-10 2-18-7l-4 7q-12-5-15-18l-7 5q-9-7-7-19l-8-2Q36 72 54 52Q73 31 100 34Z',
 deer:'M100 31Q128 28 147 49Q164 68 158 105l-8 1q2 12-7 18l-6-5q-4 13-16 17l-4-7q-7 8-17 6q-10 2-17-6l-4 7q-12-4-16-17l-6 5q-9-6-7-18l-8-1Q36 68 53 49Q72 28 100 31Z',
 dragon:'M100 31Q128 29 148 51Q167 73 158 108l-9 0q2 12-8 18l-6-6q-4 13-16 17l-4-8q-7 9-15 7q-8 2-15-7l-4 8q-12-4-16-17l-6 6q-10-6-8-18l-9 0Q33 73 52 51Q72 29 100 31Z',
 fox:'M100 30Q130 29 149 54l17 31q5 23-20 43l-8-4q-3 13-16 18l-3-8q-8 11-19 13l-4-9-4 9q-11-2-19-13l-3 8q-13-5-16-18l-8 4Q29 108 34 85l17-31Q70 29 100 30Z',
 bear:'M100 29Q130 27 149 49Q169 72 160 108l-8 2q3 12-7 19l-7-6q-3 14-16 18l-4-8q-8 10-18 8q-10 2-18-8l-4 8q-13-4-16-18l-7 6q-10-7-7-19l-8-2Q31 72 51 49Q70 27 100 29Z'
};

function legacySvg(sp,m,lvl,o){
 o=o||{};sp=S[sp]?sp:'hamster';const s=S[sp],id='cute'+(++uid),c=o.colors&&/^#[\da-f]{6}$/i.test(o.colors.pet||'')&&/^#[\da-f]{6}$/i.test(o.colors.light||'')?{...s.c,pet:o.colors.pet,light:o.colors.light,edge:shade(o.colors.pet,-.22)}:s.c;
 const k=s.k||1,kt=`translate(100 0) scale(${k} 1) translate(-100 0)`;
 const head=`<path d="${HEAD_SILHOUETTES[sp]}" fill="url(#${id}fur)" stroke="var(--edge)" stroke-width="3.4" stroke-linejoin="round"/><path d="${HEAD_FUR[sp]}" fill="none" stroke="var(--edge)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/><path d="M49 78Q56 43 88 37Q117 29 143 54" fill="none" stroke="#fff" stroke-width="5" opacity=".28" stroke-linecap="round"/><g clip-path="url(#${id}h)">${s.marks||''}</g><ellipse cx="55" cy="111" rx="13" ry="8" fill="var(--cheek)" opacity=".55"/><ellipse cx="145" cy="111" rx="13" ry="8" fill="var(--cheek)" opacity=".55"/>`;
 const scarf=lvl>=3?`<g class="p-scarf"><path d="M62 137Q100 157 138 137L132 151Q100 172 68 151Z" fill="var(--accent)" stroke="var(--edge)" stroke-width="2"/><path d="M125 151l15 5-7 27-14-9Z" fill="var(--accent)" stroke="var(--edge)" stroke-width="2"/></g>`:'';
 const hat=lvl>=8?'<path d="M66 48L72 22L88 39L100 12L112 39L128 22L134 48Z" fill="#ffd15a" stroke="#c9973a" stroke-width="3"/>':lvl>=5?'<path d="M63 57Q100 -5 137 57Z" fill="#65b6a5" stroke="#478d81" stroke-width="3"/><rect x="57" y="53" width="86" height="10" rx="5" fill="#478d81"/>':'';
 const body=`<path d="${BODY_SHAPES[sp]}" fill="url(#${id}body)" stroke="var(--edge)" stroke-width="3.2" stroke-linejoin="round"/><path d="${BODY_FUR[sp]}" fill="none" stroke="var(--edge)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/><ellipse cx="100" cy="164" rx="${sp==='bear'?27:sp==='deer'?22:25}" ry="${sp==='deer'?24:26}" fill="url(#${id}belly)"/><path d="M78 145Q86 139 92 143M108 143Q116 139 122 145" fill="none" stroke="#fff" stroke-width="3" opacity=".32" stroke-linecap="round"/>${s.body||''}<g class="p-fur-body" fill="none" stroke="var(--edge)" stroke-width="1.65" stroke-linecap="round" opacity=".48"><path d="M65 145q-5 7-2 13m7-16q-4 7-2 12m66-9q5 7 2 13m-7-16q4 7 2 12M73 178q-2 7 3 11m51-11q2 7-3 11M84 188q5 4 10 2m22-2q-5 4-10 2"/><path d="M77 151l-5 4m51-4l5 4M82 161l-4 4m44-4l4 4M91 184l-2 5m20-5l2 5"/></g>`;
 const arms=[-1,1].map(side=>{const x=100+side*25,hand=100+side*16;return g(side<0?'a-arm-l':'a-arm-r',`${x}px 145px`,`<path d="M${x} 137Q${x+side*9} 143 ${hand} 153Q${hand+side*2} 162 ${hand-side*2} 166Q${hand-side*10} 166 ${hand-side*12} 157Q${x-side*4} 150 ${x-side*7} 145Z" fill="var(--pet)" stroke="var(--edge)" stroke-width="2.7" stroke-linejoin="round"/><ellipse cx="${hand-side*2}" cy="162" rx="8" ry="7" fill="${s.paw}" stroke="var(--edge)" stroke-width="1.5"/><path d="M${hand-side*5} 161l-2 3m6-4l-1 3" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`)}).join('');
 const feet=[-1,1].map(side=>{const x=100+side*23;return g(side<0?'p-foot-l':'p-foot-r',`${x}px 181px`,`<path d="M${x-8} 160Q${x-13} 174 ${x-12} 184Q${x-11} 194 ${x} 194Q${x+11} 194 ${x+12} 184Q${x+13} 174 ${x+8} 160Z" fill="var(--pet)" stroke="var(--edge)" stroke-width="2.8"/><ellipse cx="${x}" cy="187" rx="16" ry="8.5" fill="var(--pet)" stroke="var(--edge)" stroke-width="2.4"/><path d="M${x-5} 187q-2 3 0 4m5-4q-2 3 0 4m5-4q-2 3 0 4" fill="none" stroke="${s.paw}" stroke-width="2" stroke-linecap="round"/>`)}).join('');

 return `<svg class="pet-svg m-${m}${o.mini?' mini':''}" data-sp="${sp}" data-mood="${m}" viewBox="0 -26 200 226" role="img" aria-label="${esc(o.label||s.title)}" style="--pet:${c.pet};--pet-light:${c.light};--edge:${c.edge};--cheek:${c.cheek}">
 <defs><clipPath id="${id}h"><path d="${HEAD_SILHOUETTES[sp]}"/></clipPath><linearGradient id="${id}fur" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".3" stop-color="var(--pet)"/><stop offset="1" stop-color="var(--edge)" stop-opacity=".24"/></linearGradient><linearGradient id="${id}body" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".55" stop-color="var(--pet)"/><stop offset="1" stop-color="var(--edge)" stop-opacity=".2"/></linearGradient><linearGradient id="${id}belly" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--pet-light)"/><stop offset="1" stop-color="var(--pet-light)" stop-opacity=".82"/></linearGradient><filter id="${id}softShadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
 <ellipse class="p-shadow" cx="100" cy="195" rx="56" ry="7" fill="#49343a" opacity=".12"/>
 <g class="p-root" style="transform-origin:100px 195px">
  ${s.tail(lvl)}${s.wings?s.wings():''}
  <g class="p-body" style="transform-origin:100px 175px">
   <g class="a-breathe">
    ${body}
    ${scarf}
    ${arms}
   </g>
  </g>
  ${feet}
  <g class="p-face" style="transform-origin:100px 50px">
   <g class="p-ears">${s.ears()}</g>
   ${head}
   <g class="p-fur-head" fill="none" stroke="var(--edge)" stroke-width="1.8" stroke-linecap="round" opacity=".52"><path d="M49 76q-5 4-6 10m12-20q-5 4-6 10m102-1q5 4 6 10m-12-20q5 4 6 10M64 52l-4 7m76-7l4 7M78 39l-2 7m48-7l2 7M91 33l-1 6m20-6l1 6"/></g>
   <g class="p-facedyn">${face(sp,m)}</g>
   ${s.extra||''}
   ${hat}
  </g>
  <g class="p-prop"></g>
 </g>
 <g class="p-fx"></g>
 </svg>`;
}


const ILLUSTRATION_CELLS={
 hamster:[0,0], bunny:[224,0], deer:[448,0],
 dragon:[0,224], fox:[224,224], bear:[448,224]
};
function svg(sp,m,lvl,o){ return legacySvg(sp,m,lvl,o); }

root.ToshaPets={SPECIES:S,ORDER,svg,face};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ToshaPets;
})(typeof self!=='undefined'?self:this);