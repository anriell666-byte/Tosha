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
  head:'M100 28C145 28 169 55 169 91C169 127 143 145 100 145C57 145 31 127 31 91C31 55 55 28 100 28Z',
  marks:'<path d="M42 92Q58 78 75 88Q100 98 125 88Q142 78 158 92L158 133Q100 158 42 133Z" fill="#fffafa"/>',
  body:'<ellipse cx="100" cy="157" rx="36" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 177px',`<path d="M137 176q24 3 20 17q-4 12-17 5" fill="var(--pet)" ${E}/>`),
  extra:'<ellipse cx="100" cy="125" rx="24" ry="18" fill="#fffafa"/>',paw:'#f2a8b3'},
 cat:{title:'Кот',name:'Мурзик',c:{pet:'#b8bbc7',light:'#fffafa',edge:'#777b8b',cheek:'#f5a4ad'},iris:'#382c3b',k:1,
  ears:()=>g('a-ear-l','57px 58px',`<path d="M35 81L40 22Q44 9 56 24L84 61Z" fill="var(--pet)" ${E}/><path d="M47 60L49 34Q51 28 58 39L70 58Z" fill="#e6a9b6"/>`)+g('a-ear-r','143px 58px',`<path d="M165 81L160 22Q156 9 144 24L116 61Z" fill="var(--pet)" ${E}/><path d="M153 60L151 34Q149 28 142 39L130 58Z" fill="#e6a9b6"/>`),
  head:'M100 31C141 31 166 57 166 94C166 128 139 145 100 145C61 145 34 128 34 94C34 57 59 31 100 31Z',
  marks:'<path d="M100 34v21M88 38l5 17M112 38l-5 17" stroke="#858a99" stroke-width="4" stroke-linecap="round"/><ellipse cx="100" cy="123" rx="31" ry="21" fill="#fffafa"/>',
  body:'<ellipse cx="100" cy="157" rx="34" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 174px',`<path d="M139 176Q184 186 180 139Q177 119 158 126" fill="none" stroke="var(--edge)" stroke-width="20" stroke-linecap="round"/><path d="M139 176Q184 186 180 139Q177 119 158 126" fill="none" stroke="var(--pet)" stroke-width="14" stroke-linecap="round"/>`),
  extra:'<path d="M68 140l8 5M60 150l12 3M132 140l-8 5M140 150l-12 3" stroke="#858a99" stroke-width="3" stroke-linecap="round"/>',paw:'#f4a5b2'},
 bunny:{title:'Зайчик',name:'Пушок',c:{pet:'#f7d9d7',light:'#fff5f1',edge:'#bd8888',cheek:'#f5a0a8'},iris:'#38272e',k:.98,
  ears:()=>g('a-ear-l','73px 48px',`<path d="M56 72Q39 34 51 -13Q60 -25 73 -8Q91 26 86 72Z" fill="var(--pet)" ${E}/><path d="M62 57Q50 25 58 -7Q65 -11 71 3Q81 30 78 57Z" fill="#f0a6b0"/>`)+g('a-ear-r','127px 48px',`<path d="M144 72Q161 34 149 -13Q140 -25 127 -8Q109 26 114 72Z" fill="var(--pet)" ${E}/><path d="M138 57Q150 25 142 -7Q135 -11 129 3Q119 30 122 57Z" fill="#f0a6b0"/>`),
  head:'M100 35C141 35 163 59 163 96C163 129 137 146 100 146C63 146 37 129 37 96C37 59 59 35 100 35Z',
  marks:'<ellipse cx="65" cy="116" rx="19" ry="16" fill="#fff5f1"/><ellipse cx="135" cy="116" rx="19" ry="16" fill="#fff5f1"/>',
  body:'<ellipse cx="100" cy="158" rx="34" ry="35" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 176px',`<circle cx="147" cy="178" r="14" fill="#fff5f1" ${E}/>`),
  extra:'<path d="M68 145Q100 165 132 145" fill="none" stroke="#e7b6b3" stroke-width="3"/>',paw:'#f3a3b2'},
 dragon:{title:'Дракончик',name:'Искра',c:{pet:'#9bd4a5',light:'#e5f4c9',edge:'#659b70',cheek:'#f5a3a1'},iris:'#314d3b',k:1,
  ears:()=>`<path d="M49 75Q22 67 20 43Q43 47 62 63Z" fill="#8bc99a" ${E}/><path d="M151 75Q178 67 180 43Q157 47 138 63Z" fill="#8bc99a" ${E}/><path d="M76 43L83 14L98 39L108 12L122 43Z" fill="#82c48f" ${E}/>`,
  head:'M100 34C141 34 165 60 165 96C165 130 139 146 100 146C61 146 35 130 35 96C35 60 59 34 100 34Z',
  marks:'<circle cx="59" cy="75" r="4" fill="#73b983"/><circle cx="139" cy="75" r="4" fill="#73b983"/><ellipse cx="100" cy="123" rx="30" ry="20" fill="#c4e8b9"/>',
  body:'<ellipse cx="100" cy="158" rx="35" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 178px',`<path d="M135 175Q176 194 190 156L179 147Q165 165 143 158Z" fill="var(--pet)" ${E}/>`),
  wings:()=>g('a-wing-l','50px 133px',`<path d="M65 132Q28 95 12 112Q18 148 61 161Z" fill="#c7eafa" stroke="#80b6d0" stroke-width="3"/><path d="M20 118l37 28M32 116l23 24" stroke="#94c8df" stroke-width="2" fill="none"/>`)+g('a-wing-r','150px 133px',`<path d="M135 132Q172 95 188 112Q182 148 139 161Z" fill="#c7eafa" stroke="#80b6d0" stroke-width="3"/><path d="M180 118l-37 28M168 116l-23 24" stroke="#94c8df" stroke-width="2" fill="none"/>`),
  extra:'<path d="M100 143l5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1Z" fill="#ffd45b" stroke="#d4a63e" stroke-width="2"/>',paw:'#d4edbc'},
 fox:{title:'Лисёнок',name:'Рыжик',c:{pet:'#ef7952',light:'#fff3e8',edge:'#a84f36',cheek:'#f4a0a0'},iris:'#3d2926',k:1,
  ears:()=>g('a-ear-l','58px 58px',`<path d="M31 86L39 8Q43 -3 55 17L83 65Z" fill="var(--pet)" ${E}/><path d="M45 64L49 28L68 59Z" fill="#fff0df"/>`)+g('a-ear-r','142px 58px',`<path d="M169 86L161 8Q157 -3 145 17L117 65Z" fill="var(--pet)" ${E}/><path d="M155 64L151 28L132 59Z" fill="#fff0df"/>`),
  head:'M100 34C143 34 165 60 165 96Q164 132 100 148Q36 132 35 96C35 60 57 34 100 34Z',
  marks:'<path d="M38 101Q67 112 100 108Q133 112 162 101L147 136Q100 162 53 136Z" fill="#fff3e8"/>',
  body:'<ellipse cx="100" cy="158" rx="33" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 173px',`<path d="M137 177Q180 197 191 145Q198 113 173 110Q166 145 139 151Z" fill="var(--pet)" ${E}/><path d="M174 113Q194 122 185 149Q176 159 163 159Q178 140 174 113Z" fill="#fff3e8"/>`),
  extra:'<ellipse cx="100" cy="151" rx="20" ry="29" fill="#fff3e8"/>',paw:'#fff0df'},
 bear:{title:'Мишка',name:'Мишка',c:{pet:'#a87553',light:'#f5dfbd',edge:'#79543e',cheek:'#e9a09a'},iris:'#3d2924',k:1.08,
  ears:()=>g('a-ear-l','61px 58px',`<circle cx="59" cy="54" r="22" fill="var(--pet)" ${E}/><circle cx="59" cy="54" r="12" fill="#d9aa8c"/>`)+g('a-ear-r','139px 58px',`<circle cx="141" cy="54" r="22" fill="var(--pet)" ${E}/><circle cx="141" cy="54" r="12" fill="#d9aa8c"/>`),
  head:'M100 32C143 32 166 59 166 96C166 131 140 147 100 147C60 147 34 131 34 96C34 59 57 32 100 32Z',
  marks:'<ellipse cx="100" cy="120" rx="30" ry="22" fill="#f5dfbd"/>',
  body:'<ellipse cx="100" cy="158" rx="37" ry="36" fill="var(--pet-light)"/>',
  tail:()=>g('a-tail','145px 178px',`<circle cx="145" cy="180" r="10" fill="var(--pet)" ${E}/>`),
  extra:'',paw:'#e8c7a8'}
};
const ORDER=['hamster','cat','bunny','dragon','fox','bear'];
function eyes(s,m){
 const eye=(x,y=Y,scale=1)=>`<ellipse cx="${x}" cy="${y}" rx="${10.8*scale}" ry="${13*scale}" fill="${s.iris}"/><ellipse cx="${x+3.5}" cy="${y-5}" rx="4" ry="5" fill="#fff"/><circle cx="${x-3}" cy="${y+5}" r="2" fill="#fff" opacity=".9"/>`;
 if(['happy','sleepy'].includes(m)) return `<path d="M${L-10} ${Y}q10 -13 20 0M${R-10} ${Y}q10 -13 20 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
 if(m==='surprised') return `<circle cx="${L}" cy="${Y}" r="13" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${R}" cy="${Y}" r="13" fill="#fff" stroke="${INK}" stroke-width="2"/>`+eye(L,Y,1.05)+eye(R,Y,1.05);
 return eye(L,Y,m==='excited'?1.13:1)+eye(R,Y,m==='excited'?1.13:1);
}
function mouth(m){
 if(m==='sad') return `<path d="M91 116q9 -10 18 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
 if(m==='sleepy'||m==='tired') return `<path d="M94 115h12" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
 if(m==='surprised'||m==='hungry') return `<ellipse cx="100" cy="116" rx="5" ry="7" fill="${INK}"/>`;
 return `<path d="M88 109Q100 121 112 109Q107 130 100 126Q93 130 88 109Z" fill="${INK}"/><path d="M94 121q6 -5 12 0q-6 8 -12 0" fill="#f58d9d"/>`;
}
function face(sp,m){const s=S[sp]||S.hamster;return `<g class="a-eyes">${eyes(s,m)}</g>${mouth(m)}<ellipse cx="55" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/><ellipse cx="145" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/>`;}
function shade(hex,f){const v=parseInt(hex.slice(1),16),a=[v>>16&255,v>>8&255,v&255].map(x=>Math.max(0,Math.min(255,Math.round(x*(1+f)))));return '#'+a.map(x=>x.toString(16).padStart(2,'0')).join('');}
function svg(sp,m,lvl,o){
 o=o||{};sp=S[sp]?sp:'hamster';const s=S[sp],id='cute'+(++uid),c=o.colors&&/^#[\da-f]{6}$/i.test(o.colors.pet||'')&&/^#[\da-f]{6}$/i.test(o.colors.light||'')?{...s.c,pet:o.colors.pet,light:o.colors.light,edge:shade(o.colors.pet,-.22)}:s.c;
 const k=s.k||1,kt=`translate(100 0) scale(${k} 1) translate(-100 0)`;
 const head=`<path d="${s.head}" fill="var(--pet)" ${E}/><g clip-path="url(#${id}h)">${s.marks||''}</g><ellipse cx="55" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/><ellipse cx="145" cy="111" rx="12" ry="7" fill="var(--cheek)" opacity=".65"/>`;
 const scarf=lvl>=3?`<g class="p-scarf"><path d="M62 137Q100 157 138 137L132 151Q100 172 68 151Z" fill="var(--accent)" stroke="var(--edge)" stroke-width="2"/><path d="M125 151l15 5-7 27-14-9Z" fill="var(--accent)" stroke="var(--edge)" stroke-width="2"/></g>`:'';
 const hat=lvl>=8?'<path d="M66 48L72 22L88 39L100 12L112 39L128 22L134 48Z" fill="#ffd15a" stroke="#c9973a" stroke-width="3"/>':lvl>=5?'<path d="M63 57Q100 -5 137 57Z" fill="#65b6a5" stroke="#478d81" stroke-width="3"/><rect x="57" y="53" width="86" height="10" rx="5" fill="#478d81"/>':'';
 const body=`<ellipse cx="100" cy="162" rx="48" ry="34" fill="var(--pet)" ${E}/><ellipse cx="100" cy="160" rx="30" ry="28" fill="var(--pet-light)"/>${s.body||''}`;
 const arms=[-1,1].map(side=>{const x=100+side*37;return g(side<0?'a-arm-l':'a-arm-r',`${x}px 150px`,`<ellipse cx="${x}" cy="151" rx="11" ry="21" transform="rotate(${side* -22} ${x} 151)" fill="var(--pet)" ${E}/><ellipse cx="${x}" cy="166" rx="9" ry="7" fill="${s.paw}"/>`)}).join('');
 const feet=[-1,1].map(side=>g(side<0?'p-foot-l':'p-foot-r',`${100+side*25}px 185px`,`<ellipse cx="${100+side*25}" cy="185" rx="19" ry="11" fill="var(--pet)" ${E}/><ellipse cx="${100+side*25}" cy="184" rx="9" ry="6" fill="${s.paw}"/>`)).join('');
 return `<svg class="pet-svg m-${m}${o.mini?' mini':''}" data-sp="${sp}" data-mood="${m}" viewBox="0 -26 200 226" role="img" aria-label="${esc(o.label||s.title)}" style="--pet:${c.pet};--pet-light:${c.light};--edge:${c.edge};--cheek:${c.cheek}">
 <defs><clipPath id="${id}h"><path d="${s.head}"/></clipPath></defs>
 <ellipse class="p-shadow" cx="100" cy="195" rx="56" ry="7" fill="#49343a" opacity=".1"/>
 <g class="p-root" style="transform-origin:100px 195px">${s.tail(lvl)}${s.wings?s.wings():''}
 ${feet}<g class="p-body" style="transform-origin:100px 175px"><g class="a-breathe" style="transform-origin:100px 175px">${body}${scarf}${arms}
 <g class="p-face" style="transform-origin:100px 112px"><g class="p-ears">${lvl>=2?s.ears():''}</g>${head}<g class="p-facedyn">${face(sp,m)}</g>${s.extra||''}${hat?`<g class="p-hat" style="transform-origin:100px 50px">${hat}</g>`:''}</g></g></g>
 <g class="p-prop"></g></g><g class="p-fx"></g></svg>`;
}
root.ToshaPets={SPECIES:S,ORDER,svg,face};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ToshaPets;
})(typeof self!=='undefined'?self:this);