/* ================= A+ Study Guide engine =================
   One page, hash-routed: #home, #ranks, and one route per module slug.
   Progress lives in this browser only. XP is shared across every module. */
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)").matches;
const $=(sel,root=document)=>root.querySelector(sel);
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const fmt=n=>n.toLocaleString("en-US");

/* ---------- module registry (modules call registerModule) ---------- */
const MODULES=[];
const OUTLINE=[
  {core:1,domain:1,slug:"mobile-devices",title:"Mobile Devices",weight:13},
  {core:1,domain:2,slug:"networking",title:"Networking",weight:23},
  {core:1,domain:3,slug:"hardware",title:"Hardware",weight:25},
  {core:1,domain:4,slug:"virtualization-cloud",title:"Virtualization and Cloud Computing",weight:11},
  {core:1,domain:5,slug:"hw-net-troubleshooting",title:"Hardware and Network Troubleshooting",weight:28},
  {core:2,domain:1,slug:"operating-systems",title:"Operating Systems",weight:28},
  {core:2,domain:2,slug:"security",title:"Security",weight:28},
  {core:2,domain:3,slug:"software-troubleshooting",title:"Software Troubleshooting",weight:23},
  {core:2,domain:4,slug:"operational-procedures",title:"Operational Procedures",weight:21}
];
const modNum=o=>o.core===1?o.domain:o.domain+5;
function registerModule(m){MODULES.push(m)}
const modBySlug=s=>MODULES.find(m=>m.slug===s);

/* ---------- storage ---------- */
const KEY="aplus-guide-v2";
let S={earned:{},streak:{n:0,last:null},badges:{},mods:{},tabs:{},last:null};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&typeof s==="object")S=Object.assign(S,s)}catch(e){}
/* Repair any field that isn't the shape we expect (old, edited or damaged saves), so the page always loads. */
(function(){const D={earned:{},streak:{n:0,last:null},badges:{},mods:{},tabs:{}};
  for(const k in D)if(!S[k]||typeof S[k]!=="object"||Array.isArray(S[k]))S[k]=D[k];
  if(typeof S.streak.n!=="number")S.streak={n:0,last:null};
  for(const k in S.earned)if(typeof S.earned[k]!=="number")delete S.earned[k];
  for(const id in S.mods){const m=S.mods[id];if(!m||typeof m!=="object"){delete S.mods[id];continue}["studied","box","due","sims"].forEach(f=>{if(!m[f]||typeof m[f]!=="object")m[f]={}});if(typeof m.best!=="number")m.best=null}
  if(S.exams&&typeof S.exams!=="object")delete S.exams;
  for(const c in S.exams||{}){const e=S.exams[c];if(!e||typeof e!=="object"){delete S.exams[c];continue}
    e.attempts=Array.isArray(e.attempts)?e.attempts.filter(a=>a&&typeof a.score==="number"):[];if(typeof e.best!=="number")e.best=null}})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
/* One-time import of progress from the single-module prototype. */
try{
  const old=JSON.parse(localStorage.getItem("aplus-net-v1")||"null");
  if(old&&!S.mods.net){
    S.mods.net={studied:old.studied||{},box:old.box||{},due:old.due||{},best:old.best??null,sims:old.sims||{}};
    for(const k in old.earned||{})S.earned["net:"+k]=old.earned[k];
    if(old.streak)S.streak=old.streak;
    for(const k in old.badges||{})S.badges[(["first","streak3","streak7","master"].includes(k)?"":"net:")+k]=old.badges[k];
    save();
  }
}catch(e){}
const MS=id=>S.mods[id]||(S.mods[id]={studied:{},box:{},due:{},best:null,sims:{}});

/* ---------- XP, ranks, streak ---------- */
const RANKS=[[0,"Help Desk Trainee"],[150,"Help Desk Tech I"],[400,"Help Desk Tech II"],[800,"Desktop Support Tech"],[1400,"Field Technician"],[2200,"Network Technician"],[3400,"Systems Specialist"],[5000,"Senior Technician"],[7500,"IT Lead"],[11000,"A+ Master"]];
const xpTotal=()=>Object.values(S.earned).reduce((a,b)=>a+b,0);
const xpFor=id=>Object.entries(S.earned).filter(([k])=>k.startsWith(id+":")).reduce((a,[,v])=>a+v,0);
const levelOf=xp=>{let i=0;while(i<RANKS.length-1&&xp>=RANKS[i+1][0])i++;return i};
let gameReady=false,CUR=null;
/* Each reward has a key and pays once, so XP reflects real progress and can't be farmed. */
function awardRaw(key,xp,label){
  if(S.earned[key]!==undefined)return;
  const before=levelOf(xpTotal());S.earned[key]=xp;
  if(!gameReady)return;
  const today=new Date().toDateString();
  if(S.streak.last!==today){const y=new Date(Date.now()-864e5).toDateString();S.streak.n=S.streak.last===y?S.streak.n+1:1;S.streak.last=today}
  save();toast(`+${xp} XP`,label);
  const after=levelOf(xpTotal());if(after>before)setTimeout(()=>levelUp(after),450);
  checkBadges();renderHUD();if(CUR)updateStats(CUR);
}
/* Modules call award() with short keys; it is scoped to the open module. */
function award(key,xp,label){if(CUR)awardRaw(CUR.id+":"+key,xp,label)}

/* ---------- badges ---------- */
const GLOBAL_BADGES=[
  ["first","FB","First Boot","Earn your first XP",()=>xpTotal()>0],
  ["streak3","OR","On a Roll","Study 3 days in a row",()=>S.streak.n>=3],
  ["streak7","UP","Uptime: 7 Days","Study 7 days in a row",()=>S.streak.n>=7],
  ["core1","C1","Core 1 Ready","Reach 80% completion on every Core 1 module",()=>coreReady(1)],
  ["core2","C2","Core 2 Ready","Reach 80% completion on every Core 2 module",()=>coreReady(2)],
  ["exam1","E1","Core 1 Exam Ready","Score 675+ on a Core 1 practice exam",()=>(S.exams?.c1?.best??0)>=675],
  ["exam2","E2","Core 2 Exam Ready","Score 700+ on a Core 2 practice exam",()=>(S.exams?.c2?.best??0)>=700],
  ["master","A+","A+ Master","Reach the top rank",()=>levelOf(xpTotal())===RANKS.length-1]
];
function coreReady(c){const os=OUTLINE.filter(o=>o.core===c);return os.every(o=>{const m=modBySlug(o.slug);return m&&completion(m)>=80})}
function allBadges(){
  const out=GLOBAL_BADGES.map(b=>({id:b[0],mono:b[1],name:b[2],desc:b[3],test:b[4],mod:null}));
  MODULES.forEach(m=>(m.badges||[]).forEach(b=>out.push({id:m.id+":"+b[0],mono:b[1],name:b[2],desc:b[3],test:()=>b[4](ctxFor(m)),mod:m})));
  return out;
}
function checkBadges(silent){
  allBadges().forEach(b=>{if(!S.badges[b.id]&&b.test()){S.badges[b.id]=Date.now();if(!silent)setTimeout(()=>toast("Badge unlocked",b.name,"badge"),300)}});
  save();
}

/* ---------- per-module helpers ---------- */
const LEVELS=["New","Learning","Familiar","Strong","Mastered"];
const INTERVAL=[0,10*60e3,864e5,3*864e5,7*864e5];
function ctxFor(m){
  const st=MS(m.id),box=id=>st.box[id]||0;
  return {st,box,
    allStudied:()=>m.lessons.every(l=>st.studied[l.id]),
    earned:k=>S.earned[m.id+":"+k]!==undefined,
    vizAll:()=>(m.vizKeys||[]).every(k=>S.earned[m.id+":viz:"+k]!==undefined),
    passed:id=>!!st.sims[id],
    deckAtLeast:(deck,lv)=>m.cards.filter(c=>!deck||c.deck===deck).every(c=>box(c.id)>=lv),
    countAtLeast:lv=>m.cards.filter(c=>box(c.id)>=lv).length};
}
function completion(m){
  const st=MS(m.id),l=m.lessons.filter(x=>st.studied[x.id]).length/m.lessons.length,
    k=m.cards.filter(c=>(st.box[c.id]||0)>=2).length/m.cards.length,
    s=(m.sims||[]).length?Object.values(st.sims).filter(Boolean).length/m.sims.length:1,b=(st.best??0)/100;
  return Math.round((l+k+s+b)/4*100);
}

/* ---------- toasts, level up, HUD ---------- */
const HEX="50,4 94,29 94,83 50,108 6,83 6,29";
const hexSVG=lv=>`<svg viewBox="0 0 100 112" aria-hidden="true"><polygon class="hex-shape" points="${HEX}"/><text x="50" y="44" text-anchor="middle" class="hex-lv">LEVEL</text><text x="50" y="74" text-anchor="middle" class="hex-num" style="font-size:34px">${lv}</text></svg>`;
const FLAME=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.4 2.2-3.2C17.5 10.6 19 13 19 15.5 19 19.1 15.9 22 12 22s-7-2.9-7-6.5C5 10.5 10.5 7.5 12 2z" fill="var(--gold)"/></svg>`;
function toast(big,label,cls=""){
  const t=document.createElement("div");t.className="toast "+cls;t.innerHTML=`<b>${big}</b><span>${label}</span>`;
  const box=$("#toasts");box.appendChild(t);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>t.remove(),2900);
}
function levelUp(lv){
  const el=$("#levelup");
  el.innerHTML=`<div class="lu-card" role="dialog" aria-modal="true" aria-labelledby="lu-rank">
    <div class="lu-kicker">Level up</div><div class="rank-hex">${hexSVG(lv+1)}</div>
    <div class="lu-rank" id="lu-rank">${RANKS[lv][1]}</div>
    <p>${lv<RANKS.length-1?`Next rank: ${RANKS[lv+1][1]} at ${fmt(RANKS[lv+1][0])} XP`:"You've reached the top rank. Exam day is yours."}</p>
    <button class="btn primary" id="lu-ok">Continue</button></div>`;
  el.hidden=false;const ok=$("#lu-ok");ok.focus();
  const close=()=>{el.hidden=true;el.innerHTML=""};ok.onclick=close;el.onclick=e=>{if(e.target===el)close()};el.onkeydown=e=>{if(e.key==="Escape")close()};
}
function streakLive(){const t=new Date().toDateString(),y=new Date(Date.now()-864e5).toDateString();return S.streak.last===t||S.streak.last===y?S.streak.n:0}
function renderHUD(){
  const xp=xpTotal(),lv=levelOf(xp),cur=RANKS[lv][0],next=RANKS[lv+1],pct=next?(xp-cur)/(next[0]-cur)*100:100,n=streakLive();
  $("#hud").innerHTML=`
    <a class="rank-hex" href="#ranks" aria-label="Level ${lv+1}. Open rank and badges">${hexSVG(lv+1)}</a>
    <div><div class="hud-top"><span class="rank-name">${RANKS[lv][1]}</span><span class="xp-num">${fmt(xp)} XP</span></div>
      <div class="xpbar" role="progressbar" aria-label="Progress to next rank" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><span style="width:${pct.toFixed(1)}%"></span></div>
      <div class="hud-sub">${next?`${fmt(next[0]-xp)} XP to ${next[1]}`:"Top rank reached"}</div></div>
    <div class="streak${n?"":" off"}" title="Days in a row you've earned XP">${FLAME}<b>${n}</b><span>day streak</span></div>`;
}

/* ---------- sequence diagram helper ---------- */
function seqViz(el,o){
  let shown=0;const W=600,H=78+o.steps.length*62;
  el.innerHTML=`<div class="viz-title">${o.title}</div>
  <div class="viz-scroll"><svg viewBox="0 0 ${W} ${H}" style="min-width:460px" role="img" aria-label="${o.title}"></svg></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button><button class="btn" data-a="reset">Start over</button><span class="grow"></span></div>`;
  const svg=$("svg",el),cap=$(".caption",el),count=$(".grow",el);
  function draw(){
    let s=`<rect x="40" y="8" width="160" height="38" rx="8" class="s-node"/><text x="120" y="32" text-anchor="middle" class="s-b">${o.left}</text>
           <rect x="400" y="8" width="160" height="38" rx="8" class="s-node"/><text x="480" y="32" text-anchor="middle" class="s-b">${o.right}</text>
           <line x1="120" y1="46" x2="120" y2="${H-4}" class="s-life"/><line x1="480" y1="46" x2="480" y2="${H-4}" class="s-life"/>`;
    o.steps.forEach((st,i)=>{
      if(i>=shown)return;
      const y=86+i*62,r=st.dir==="r",x1=r?124:476,x2=r?476:124,h=r?-13:13;
      s+=`<g class="s-arrow${i===shown-1?" cur":""}"><line x1="${x1}" y1="${y}" x2="${x2+h*0.6}" y2="${y}" ${st.dash?'stroke-dasharray="7 5"':""}/>
          <polygon points="${x2},${y} ${x2+h},${y-7} ${x2+h},${y+7}"/>
          <text x="300" y="${y-12}" text-anchor="middle" class="s-b">${i+1}. ${st.label}</text>
          ${st.sub?`<text x="300" y="${y+22}" text-anchor="middle" class="s-small">${st.sub}</text>`:""}</g>`;
    });
    svg.innerHTML=s;
    cap.innerHTML=shown===0?o.intro:o.steps[shown-1].text+(shown===o.steps.length&&o.end?`<br><br>${o.end}`:"");
    if(shown===o.steps.length)award("viz:"+el.id,20,"Diagram completed");
    $('[data-a="back"]',el).disabled=shown===0;$('[data-a="next"]',el).disabled=shown===o.steps.length;
    count.textContent=`Step ${shown} of ${o.steps.length}`;
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="next")shown=Math.min(shown+1,o.steps.length);if(a==="back")shown=Math.max(shown-1,0);if(a==="reset")shown=0;draw()});
  draw();
}

/* ---------- generic simulations ---------- */
/* Match: tap an item, then tap the slot it belongs in. */
function matchSim(el,sim,api){
  const items=shuffleArr(sim.items.map(i=>i[0])),answer=Object.fromEntries(sim.items.map(([a,b])=>[b,a]));
  let place={},picked=null,checked=false;
  function draw(msg){
    const used=Object.values(place);
    el.innerHTML=`${simHead(sim,api)}<p class="scenario">${sim.scenario}</p>
    <div class="chips sim-pool">${items.map(s=>`<button class="chip" data-svc="${s}" aria-pressed="${picked===s}" ${used.includes(s)?"disabled":""}>${s}</button>`).join("")}</div>
    <div class="fw">${sim.slots.map(([k,label,desc])=>{const s=place[k],ok=checked&&s&&answer[k]===s;
      return `<button class="fw-row${s?" filled":""}${checked&&s?(ok?" ok":" no"):""}" data-slot="${k}"><span class="fw-port">${label}</span><span class="fw-desc">${desc||""}</span><span class="fw-svc">${s||"Tap to place"}</span></button>`}).join("")}</div>
    <div class="caption" aria-live="polite">${msg||"Tap a filled row to clear it."}</div>
    <div class="viz-controls"><button class="btn primary" data-a="check">Check answers</button><button class="btn" data-a="reset">Reset</button></div>`;
  }
  el.addEventListener("click",e=>{
    const s=e.target.closest("[data-svc]"),r=e.target.closest("[data-slot]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(s){picked=picked===s.dataset.svc?null:s.dataset.svc;draw();return}
    if(r){const k=r.dataset.slot;checked=false;if(picked){place[k]=picked;picked=null}else delete place[k];draw();return}
    if(a==="reset"){place={};picked=null;checked=false;draw()}
    if(a==="check"){checked=true;const n=sim.slots.length,right=sim.slots.filter(([k])=>place[k]===answer[k]).length;
      if(right===n)api.pass();
      draw(Object.keys(place).length<n?`Fill every row first. ${right} correct so far.`:right===n?`<span class="status-good">All ${n} correct.</span> ${sim.success||""}`:`<span class="status-bad">${n-right} wrong.</span> Fix the rows outlined in red, then check again.`)}
  });
  draw();
}
/* Order: tap steps in the order they happen. */
function orderSim(el,sim,api){
  const pool=shuffleArr(sim.steps.map((s,i)=>i));let seq=[],checked=false;
  function draw(msg){
    el.innerHTML=`${simHead(sim,api)}<p class="scenario">${sim.scenario}</p>
    <div class="ord">${sim.steps.map((_,pos)=>{const i=seq[pos];const ok=checked&&i!==undefined&&i===pos;
      return `<button class="ord-row${i!==undefined?" filled":""}${checked&&i!==undefined?(ok?" ok":" no"):""}" data-pos="${pos}"><span class="ord-n">${pos+1}</span><span>${i!==undefined?sim.steps[i]:"…"}</span></button>`}).join("")}</div>
    <div class="ord-pool">${pool.map(i=>`<button class="opt" data-step="${i}" ${seq.includes(i)?"disabled":""}>${sim.steps[i]}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${msg||"Tap the steps in order. Tap a placed step to remove it and everything after it."}</div>
    <div class="viz-controls"><button class="btn primary" data-a="check">Check order</button><button class="btn" data-a="reset">Reset</button></div>`;
  }
  el.addEventListener("click",e=>{
    const st=e.target.closest("[data-step]"),p=e.target.closest("[data-pos]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(st&&!st.disabled){seq.push(+st.dataset.step);checked=false;draw();return}
    if(p&&seq[+p.dataset.pos]!==undefined){seq=seq.slice(0,+p.dataset.pos);checked=false;draw();return}
    if(a==="reset"){seq=[];checked=false;draw()}
    if(a==="check"){checked=true;const n=sim.steps.length,right=seq.filter((i,pos)=>i===pos).length;
      if(right===n)api.pass();
      draw(seq.length<n?`Place every step first. ${right} in the right spot so far.`:right===n?`<span class="status-good">Perfect order.</span> ${sim.success||""}`:`<span class="status-bad">${n-right} out of place.</span> Steps outlined in red are in the wrong position.`)}
  });
  draw();
}
function simHead(sim,api){return `<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>`}

/* ---------- module view ---------- */
const TABS=[["lessons","Lessons"],["sims","Simulations"],["cards","Flashcards"],["quiz","Practice quiz"]];
let V={};/* view state for the open module */
function openModule(m,tab){
  CUR=m;S.last=m.slug;save();
  const o=OUTLINE.find(x=>x.slug===m.slug);
  tab=tab||S.tabs[m.id]||"lessons";
  $("#head").innerHTML=`<div class="crumbs"><a href="../">Roadmap</a><span>/</span><a href="#home">All modules</a><span>/</span>Core ${o.core} (${o.core===1?"220-1201":"220-1202"}) · Domain ${o.domain} · ${o.weight}% of the exam</div>
    <h1>Module ${modNum(o)}: ${o.title}</h1>`;
  $("#nav").innerHTML=TABS.map(([k,l])=>`<button role="tab" id="tab-${k}" data-tab="${k}" aria-selected="${k===tab}">${l}</button>`).join("");
  $("#nav").hidden=false;
  $("#view").innerHTML=TABS.map(([k])=>`<section id="${k}" role="tabpanel" aria-labelledby="tab-${k}" ${k===tab?"":"hidden"}></section>`).join("");
  V={deck:"all",dueOnly:true,order:[],pos:0,flipped:false,qi:0,answers:[],qOrder:[],qMode:"quick"};
  renderLessons(m);renderSims(m);buildOrder(m);renderCards(m);startQuiz(m);renderQuiz(m);updateStats(m);
  $("#nav").querySelectorAll("button").forEach(b=>b.onclick=()=>{showTab(m,b.dataset.tab);window.scrollTo(0,0)});
  showTab(m,tab);
}
function showTab(m,t){
  S.tabs[m.id]=t;save();
  $("#nav").querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));
  TABS.forEach(([k])=>$("#"+k).hidden=k!==t);
  if(t==="cards"){buildOrder(m);renderCards(m)}
}
function updateStats(m){
  if(!m||CUR!==m)return;
  const st=MS(m.id),s=m.lessons.filter(l=>st.studied[l.id]).length,k=m.cards.filter(c=>(st.box[c.id]||0)>=2).length,sm=Object.values(st.sims).filter(Boolean).length;
  $("#stats").innerHTML=`<span>Lessons <b>${s}/${m.lessons.length}</b></span><span>Cards known <b>${k}/${m.cards.length}</b></span><span>Simulations <b>${sm}/${(m.sims||[]).length}</b></span><span>Best quiz <b>${st.best===null?"—":st.best+"%"}</b></span><span>Module XP <b>${fmt(xpFor(m.id))}</b></span>`;
  $("#stats").hidden=false;
}
function renderLessons(m){
  const st=MS(m.id),el=$("#lessons");
  el.innerHTML=`<p class="intro">${m.lessons.length} topics that match the exam objectives for this domain. Try the interactive diagrams in each lesson, then mark it studied.</p>
  <div class="toc">${m.lessons.map(l=>`<a href="#l-${l.id}" class="${st.studied[l.id]?"done":""}">${l.num} ${l.short||l.title}</a>`).join("")}</div>`+
  m.lessons.map(l=>`<article class="lesson" id="l-${l.id}">
    <div class="lesson-head"><h2><span class="num">${l.num}</span>${l.title}</h2>
    <label class="check"><input type="checkbox" id="s-${l.id}" data-l="${l.id}" ${st.studied[l.id]?"checked":""}> Studied</label></div>
    ${typeof l.html==="function"?l.html():l.html}</article>`).join("");
  el.querySelectorAll("input[data-l]").forEach(cb=>cb.addEventListener("change",()=>{
    st.studied[cb.dataset.l]=cb.checked;save();
    if(cb.checked){const L=m.lessons.find(x=>x.id===cb.dataset.l);award("lesson:"+L.id,50,"Lesson "+L.num+" studied")}
    el.querySelector(`.toc a[href="#l-${cb.dataset.l}"]`).classList.toggle("done",cb.checked);updateStats(m);
  }));
  el.querySelectorAll(".toc a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();document.querySelector(a.getAttribute("href")).scrollIntoView({behavior:REDUCED?"auto":"smooth"})}));
  if(m.viz)m.viz();
}
function renderSims(m){
  const st=MS(m.id),el=$("#sims");
  el.innerHTML=`<p class="intro">The real exam opens with hands-on simulations. These match the style: read the scenario, do the task, then check your work.</p>`+(m.sims||[]).map(s=>`<div class="sim" id="sim-${s.id}"></div>`).join("");
  (m.sims||[]).forEach((s,i)=>{
    s.n=i+1;
    const api={passed:()=>!!st.sims[s.id],pass:()=>{const first=!st.sims[s.id];st.sims[s.id]=true;save();awardRaw(m.id+":sim:"+s.id,150,"Simulation passed");updateStats(m);
      if(first){const h=$("#sim-"+s.id+" .sim-head");if(h&&!h.querySelector(".pill-good"))h.insertAdjacentHTML("beforeend",'<span class="pill-good">Passed</span>')}}};
    const host=$("#sim-"+s.id);
    if(s.type==="match")matchSim(host,s,api);else if(s.type==="order")orderSim(host,s,api);else s.mount(host,api,s);
  });
}

/* ---------- flashcards (spaced repetition) ---------- */
const isDue=(st,id)=>(st.due[id]||0)<=Date.now();
function buildOrder(m){
  const st=MS(m.id),box=id=>st.box[id]||0;
  V.order=shuffleArr(m.cards.filter(c=>(V.deck==="all"||c.deck===V.deck)&&(!V.dueOnly||isDue(st,c.id)))).sort((a,b)=>box(a.id)-box(b.id));
  V.pos=0;V.flipped=false;
}
function fmtWait(ms){const mm=Math.ceil(ms/60e3);return mm<60?mm+" min":mm<1440?Math.round(mm/60)+" h":Math.round(mm/1440)+" days"}
function renderCards(m){
  const st=MS(m.id),box=id=>st.box[id]||0,el=$("#cards");
  const inDeck=m.cards.filter(c=>V.deck==="all"||c.deck===V.deck),due=inDeck.filter(c=>isDue(st,c.id)).length;
  const decks=[["all","All ("+m.cards.length+")"],...m.decks.map(([k,l])=>[k,`${l} (${m.cards.filter(c=>c.deck===k).length})`])];
  const lc=LEVELS.map((_,i)=>inDeck.filter(c=>box(c.id)===i).length);
  let body;
  if(!V.order.length){
    const next=Math.min(...inDeck.map(c=>st.due[c.id]||0).filter(t=>t>Date.now()));
    body=`<div class="empty"><b>All caught up.</b><br>${isFinite(next)?`The next card in this deck is due in ${fmtWait(next-Date.now())}.`:""} Switch to <b>Review all</b> to keep practicing anyway.</div>`;
  }else{const c=V.order[V.pos],b=box(c.id),dl=(m.decks.find(d=>d[0]===c.deck)||[,""])[1];
    body=`<div class="card ${V.flipped?"flipped":""}" id="card" tabindex="0" role="button" aria-label="Flashcard. Press to flip.">
      <div class="card-inner">
        <div class="face front"><span class="label">${dl} · ${LEVELS[b]}</span><span class="count">${V.pos+1} / ${V.order.length}</span><div class="q">${c.q}</div></div>
        <div class="face back"><span class="label">Answer</span><span class="count">${LEVELS[b]}</span><div class="a">${c.a}</div></div>
      </div></div>
      <div class="card-actions"><button class="btn" id="prev">Previous</button><button class="btn primary" id="flip">${V.flipped?"Show question":"Show answer"}</button>
        <button class="btn bad" id="again">Still learning</button><button class="btn good" id="knowit">I know this</button></div>
      <p class="hint">Press Space to flip and the arrow keys to move. Cards you miss come back this session. Cards you know come back later: 10 minutes, then 1, 3 and 7 days.</p>`}
  el.innerHTML=`<p class="intro">Cards you miss come back soon, and cards you know come back less often, so your time goes to what you haven't learned yet.</p>
  <div class="levels" aria-label="Cards by level">${LEVELS.map((l,i)=>`<div class="lv lv${i}" style="flex:${Math.max(lc[i],0.0001)}" title="${l}: ${lc[i]}"></div>`).join("")}</div>
  <div class="legend levels-legend">${LEVELS.map((l,i)=>`<span><i class="lv${i}"></i>${l} ${lc[i]}</span>`).join("")}</div>
  <div class="deckbar">${decks.map(d=>`<button class="chip" data-deck="${d[0]}" aria-pressed="${V.deck===d[0]}">${d[1]}</button>`).join("")}
  <span class="toggle"><button class="chip" data-mode="due" aria-pressed="${V.dueOnly}">Due now (${due})</button><button class="chip" data-mode="all" aria-pressed="${!V.dueOnly}">Review all</button></span></div>${body}`;
  el.querySelectorAll("[data-deck]").forEach(b=>b.onclick=()=>{V.deck=b.dataset.deck;buildOrder(m);renderCards(m)});
  el.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{V.dueOnly=b.dataset.mode==="due";buildOrder(m);renderCards(m)});
  if(!V.order.length)return;
  const flip=()=>{V.flipped=!V.flipped;$("#card").classList.toggle("flipped",V.flipped);$("#flip").textContent=V.flipped?"Show question":"Show answer"};
  $("#card").onclick=flip;$("#flip").onclick=flip;$("#prev").onclick=()=>move(m,-1);
  $("#again").onclick=()=>{const c=V.order[V.pos];st.box[c.id]=0;st.due[c.id]=Date.now();save();updateStats(m);
    V.order.splice(V.pos,1);V.order.push(c);if(V.pos>=V.order.length)V.pos=0;V.flipped=false;renderCards(m)};
  $("#knowit").onclick=()=>{const c=V.order[V.pos],b=Math.min(box(c.id)+1,4);st.box[c.id]=b;st.due[c.id]=Date.now()+INTERVAL[b];save();award(`card:${c.id}:${b}`,5,"Card leveled up: "+LEVELS[b]);updateStats(m);
    if(V.dueOnly){V.order.splice(V.pos,1);if(V.pos>=V.order.length)V.pos=0;V.flipped=false;renderCards(m)}else move(m,1)};
}
function move(m,d){if(!V.order.length)return;V.pos=(V.pos+d+V.order.length)%V.order.length;V.flipped=false;renderCards(m)}
document.addEventListener("keydown",e=>{
  if(!CUR||$("#cards")?.hidden!==false||e.target.matches("input,textarea,select"))return;
  if(e.key===" "&&e.target.tagName!=="BUTTON"){e.preventDefault();$("#flip")?.click()}
  if(e.key==="ArrowRight")move(CUR,1);if(e.key==="ArrowLeft")move(CUR,-1);
});

/* ---------- quiz ---------- */
const QUICK=15;
function startQuiz(m){V.qOrder=shuffleArr(m.quiz.map((_,i)=>i));if(V.qMode==="quick")V.qOrder=V.qOrder.slice(0,QUICK);V.qPerm=V.qOrder.map(qn=>shuffleArr(m.quiz[qn].o.map((_,k)=>k)));V.qi=0;V.answers=[]}
function renderQuiz(m){
  const st=MS(m.id),el=$("#quiz"),N=V.qOrder.length,Q=m.quiz;
  const intro=`<p class="intro">${Q.length} exam-style questions, each with an explanation.${st.best!==null?` Your best score so far is <b>${st.best}%</b>.`:""}</p>
  <div class="deckbar"><button class="chip" data-qm="quick" aria-pressed="${V.qMode==="quick"}">Quick quiz (${QUICK} random)</button><button class="chip" data-qm="full" aria-pressed="${V.qMode==="full"}">Full bank (${Q.length})</button></div>`;
  const bindMode=()=>el.querySelectorAll("[data-qm]").forEach(b=>b.onclick=()=>{V.qMode=b.dataset.qm;startQuiz(m);renderQuiz(m)});
  const correct=()=>V.answers.filter((a,i)=>a===Q[V.qOrder[i]].a).length;
  if(V.qi>=N){
    const score=correct(),pct=Math.round(score/N*100);
    if(st.best===null||pct>st.best){st.best=pct;save();updateStats(m)}
    if(pct>=80)award("quiz80",50,"Quiz score of 80% or better");if(pct===100&&N>=QUICK)award("quiz100",100,"Perfect quiz score");
    const missed=V.qOrder.map((qn,i)=>V.answers[i]!==Q[qn].a?Q[qn]:null).filter(Boolean);
    el.innerHTML=intro+`<div class="qcard result"><div class="eyebrow">Your score</div><div class="score">${score} / ${N}</div><div class="mono">${pct}%</div>
      <div>${pct>=80?"Strong result. You're ready to move on.":pct>=60?"Close. Review the questions below and try again.":"Go back over the lessons, then try again."}</div>
      <button class="btn primary" id="retry">Try again</button>
      ${missed.length?`<div class="review"><b>Review what you missed</b>${missed.map(q=>`<div><b>${q.q}</b><br>Answer: ${q.o[q.a]}. ${q.e}</div>`).join("")}</div>`:""}</div>`;
    bindMode();$("#retry").onclick=()=>{startQuiz(m);renderQuiz(m)};return;
  }
  const qn=V.qOrder[V.qi],q=Q[qn],ans=V.answers[V.qi],done=ans!==undefined;
  el.innerHTML=intro+`<div class="qcard">
    <div class="qmeta"><span>Question ${V.qi+1} of ${N}</span><span>${correct()} correct so far</span></div>
    <p class="qtext">${q.q}</p>
    <div class="opts">${V.qPerm[V.qi].map((i,k)=>`<button class="opt ${done&&i===q.a?"right":""} ${done&&i===ans&&ans!==q.a?"wrong":""}" data-i="${i}" ${done?"disabled":""}><span class="k">${"ABCD"[k]}</span><span>${q.o[i]}</span></button>`).join("")}</div>
    ${done?`<div class="explain"><b>${ans===q.a?"Correct.":"Not quite."}</b> ${q.e}</div>`:""}
    <div class="qnav"><button class="btn" id="restart">Start over</button>${done?`<button class="btn primary" id="next">${V.qi===N-1?"See results":"Next question"}</button>`:""}</div></div>`;
  bindMode();
  el.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{V.answers[V.qi]=+b.dataset.i;if(V.answers[V.qi]===q.a)award("q:"+(q.id||qn),10,"Correct answer");renderQuiz(m)});
  $("#restart").onclick=()=>{startQuiz(m);renderQuiz(m)};
  const nx=$("#next");if(nx)nx.onclick=()=>{V.qi++;renderQuiz(m);el.scrollIntoView({block:"start"})};
}

/* ---------- home dashboard ---------- */
function ring(p){const r=26,c=2*Math.PI*r;return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p/100)}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle">${p}%</text></svg>`}
function renderHome(){
  CUR=null;
  $("#head").innerHTML=`<div class="eyebrow"><a href="../" class="to-roadmap">IT career roadmap</a><span aria-hidden="true"> / </span>CompTIA A+ · Core 1 (220-1201) and Core 2 (220-1202)</div><h1>A+ Study Guide</h1>`;
  $("#nav").hidden=true;$("#stats").hidden=true;
  const last=modBySlug(S.last);
  const card=o=>{const m=modBySlug(o.slug),p=m?completion(m):0;
    return m?`<a class="mod-card" href="#${o.slug}"><div class="mc-top"><span class="mc-num">${String(modNum(o)).padStart(2,"0")}</span>${ring(p)}</div>
      <b>${o.title}</b><span class="mc-meta">${o.weight}% of Core ${o.core} · ${fmt(xpFor(m.id))} XP earned</span>
      <span class="mc-bar"><i style="width:${o.weight/28*100}%"></i></span></a>`
    :`<div class="mod-card locked" aria-disabled="true"><div class="mc-top"><span class="mc-num">${String(modNum(o)).padStart(2,"0")}</span><span class="soon">In production</span></div>
      <b>${o.title}</b><span class="mc-meta">${o.weight}% of Core ${o.core}</span><span class="mc-bar"><i style="width:${o.weight/28*100}%"></i></span></div>`};
  $("#view").innerHTML=`
    ${last?`<a class="resume" href="#${last.slug}"><span>Continue where you left off</span><b>Module ${modNum(OUTLINE.find(o=>o.slug===last.slug))}: ${last.title}</b><em>${completion(last)}% complete</em></a>`:""}
    <p class="intro">Nine modules, one per exam domain. Each has lessons with interactive diagrams, hands-on simulations, spaced-repetition flashcards and a practice quiz. Your XP and rank carry across all of them.</p>
    ${[1,2].map(c=>`<h2 class="sec">Core ${c} <span class="mono">${c===1?"220-1201":"220-1202"}</span></h2>
      <div class="mod-grid">${OUTLINE.filter(o=>o.core===c).map(card).join("")}</div>`).join("")}
    <h2 class="sec">Timed practice exams</h2>
    <div class="mod-grid">${[1,2].map(c=>{const ex=S.exams?.["c"+c];return `<a class="mod-card ex-card" href="#exam-${c}"><div class="mc-top"><span class="mc-num">C${c}</span><span class="mono ex-best">${ex?.run?"In progress":ex?.best?ex.best+" best":"Not taken"}</span></div><b>Core ${c} exam · ${EXAM[c].code}</b><span class="mc-meta">90 questions · 90 minutes · pass ${EXAM[c].pass}</span></a>`}).join("")}</div>
    <p class="hint left">The thin bar on each card shows how much that domain counts on its exam.</p>
    <a class="btn ranks-link" href="#ranks">View rank ladder and badges</a>`;
}
function renderRanks(){
  CUR=null;
  $("#head").innerHTML=`<div class="crumbs"><a href="../">Roadmap</a><span>/</span><a href="#home">All modules</a><span>/</span>Progress</div><h1>Rank and badges</h1>`;
  $("#nav").hidden=true;$("#stats").hidden=true;
  const xp=xpTotal(),lv=levelOf(xp),B=allBadges(),got=B.filter(b=>S.badges[b.id]).length;
  $("#view").innerHTML=`
  <p class="intro">Earn XP by making real progress. Each reward pays out once, so the only way up is to learn the material.</p>
  <h2 class="sec">How to earn XP</h2>
  <div class="xp-guide"><div><b>+50 XP</b>Study a lesson</div><div><b>+20–40 XP</b>Finish an interactive diagram</div><div><b>+150 XP</b>Pass a simulation</div><div><b>+10 XP</b>First correct answer to each quiz question</div><div><b>+5 XP</b>Each time a flashcard levels up</div><div><b>+50 / +100 XP</b>Quiz score of 80% / 100%</div><div><b>+100 / +250 XP</b>Finish / pass a practice exam (each core)</div></div>
  <h2 class="sec">Rank ladder</h2>
  <ol class="ladder">${RANKS.map(([req,name],i)=>`<li class="${i<lv?"done":i===lv?"cur":""}"><span class="lvn">L${i+1}</span><span>${name}</span><span class="xpreq">${i<=lv?(i===lv?"Current":"Reached"):fmt(req)+" XP"}</span></li>`).join("")}</ol>
  <h2 class="sec">Badges · ${got} of ${B.length}</h2>
  <div class="badges">${B.map(b=>{const on=!!S.badges[b.id];return `<div class="bdg${on?" on":""}"><svg viewBox="0 0 100 112" aria-hidden="true"><polygon class="bh" points="${HEX}"/><text x="50" y="66" text-anchor="middle" class="bt">${on?b.mono:"?"}</text></svg><b>${b.name}</b><span>${b.desc}</span>${b.mod?`<em>${b.mod.title}</em>`:""}</div>`}).join("")}</div>`;
}

/* ---------- timed practice exams ----------
   Questions come from every module's bank in the same proportions as the real exam domains.
   No feedback until you submit. The clock keeps running if you leave and come back. */
const EXAM={1:{code:"220-1201",pass:675},2:{code:"220-1202",pass:700}};
const EXAM_LEN={full:[90,90],half:[45,45]};/* [questions, minutes] */
let examTimer=null;

/* ---------- exam-only question bank and practice upgrades ----------
   src/modules/99-exam-bank.js adds questions that only appear in practice exams.
   A question ref is {mid,i} for a module quiz question or {mid,i,b:1} for a bank question. */
const EXAM_BANK={};
function registerExamBank(mid,qs){(EXAM_BANK[mid]||(EXAM_BANK[mid]=[])).push(...qs)}
function qRef(x){if(!x)return null;const m=MODULES.find(m=>m.id===x.mid);if(!m)return null;return (x.b?(EXAM_BANK[x.mid]||[]):m.quiz)[x.i]||null}
const qKey=x=>x.mid+(x.b?"b":"q")+x.i;
function poolQs(m){return m.quiz.map((q,i)=>({mid:m.id,i})).concat((EXAM_BANK[m.id]||[]).map((q,i)=>({mid:m.id,i,b:1})))}
/* Questions you haven't met in a practice exam come first (exam-only ones before quiz ones), then the ones you saw longest ago. */
function freshFirst(ex,qs){const sn=ex.seen||{};return shuffleArr(qs.slice()).map(q=>({q,k:sn[qKey(q)]||(q.b?-1:0)})).sort((a,b)=>a.k-b.k).map(o=>o.q)}
function markSeen(ex,qs){const sn=ex.seen||(ex.seen={});let n=ex.seenN||0;qs.forEach(x=>{sn[qKey(x)]=++n});ex.seenN=n}
const perQ=()=>EXAM_LEN.full[1]*60/EXAM_LEN.full[0];
function paceTxt(r){const N=r.qs.length,used=(Date.now()-r.start)/1000,done=Object.keys(r.ans).length;
  if(used<60&&!done)return `${mmss(Math.round(r.mins*60/N))} per question`;
  const d=Math.round((done*r.mins*60/N-used)/60);
  return Math.abs(d)<1?"On pace":d>0?`${d} min ahead`:`${-d} min behind`}
function paceCls(r){const N=r.qs.length,used=(Date.now()-r.start)/1000,done=Object.keys(r.ans).length;return done*r.mins*60/N-used<=-60?"bad":"ok"}
function poolInfo(c,ex){const p=examPool(c),all=p.flatMap(d=>d.qs),bank=all.filter(x=>x.b).length,sn=ex.seen||{},un=all.filter(x=>!sn[qKey(x)]).length;
  return `<p class="ex-pool"><b class="mono">${all.length}</b> questions in the pool, <b class="mono">${bank}</b> of them exam-only. <b class="mono">${un}</b> you haven't met in a practice exam yet, and those come first.</p>`}
function drillPicker(c){const p=examPool(c);
  return `<h2 class="sec">Domain drill</h2><p class="hint left">A timed 20-question check on one domain at real exam pace. Drills don't count toward your best score or badges.</p>
  <div class="ex-drills">${p.map(d=>`<button class="ex-drill" data-drill="${d.o.slug}"><span class="mono">${d.o.domain}.0</span><b>${d.o.title}</b><em class="mono">${Math.min(20,d.qs.length)} q · ${Math.round(Math.min(20,d.qs.length)*perQ()/60)} min</em></button>`).join("")}</div>`}
function startPractice(c,kind,label,qs){const ex=EXS(c);
  ex.run={qs:qs.map(q=>({mid:q.mid,i:q.i,...(q.b?{b:1}:{}),o:shuffleArr([0,1,2,3])})),ans:{},flag:{},pos:0,start:Date.now(),mins:Math.max(5,Math.round(qs.length*perQ()/60)),kind,label};save();examQuestion(c)}
function wireDrill(c,ex){$("#view").querySelectorAll("[data-drill]").forEach(b=>b.onclick=()=>{
  const d=examPool(c).find(d=>d.o.slug===b.dataset.drill);startPractice(c,"drill",`Domain drill: ${d.o.title}`,freshFirst(ex,d.qs).slice(0,20))})}
function finishPractice(c,ex,r,res,score,used,timeUp){
  ex.run=null;ex.last={res:res.map(o=>({mid:o.x.mid,i:o.x.i,b:o.x.b,pick:o.pick??null})),score,used,timeUp,n:res.length,kind:r.kind,label:r.label};save();
  const target="#exam-"+c+"-result";if(location.hash!==target)location.hash=target;else showExamResult(c)}
function wireRetry(c,L,res){const b=$("#ex-retry");if(b)b.onclick=()=>startPractice(c,"retry","Retry of missed questions",shuffleArr(res.filter(o=>!o.ok).map(o=>({mid:o.mid,i:o.i,b:o.b}))))}
const EXS=c=>{const e=(S.exams||(S.exams={}))["c"+c]||(S.exams["c"+c]={best:null,attempts:[],run:null});
  if(!Array.isArray(e.attempts))e.attempts=[];
  const okQ=x=>!!qRef(x);
  if(e.run&&!(Array.isArray(e.run.qs)&&e.run.qs.length&&e.run.qs.every(okQ)&&e.run.ans&&e.run.flag))e.run=null;
  if(e.last&&!(Array.isArray(e.last.res)&&e.last.res.every(okQ)))e.last=null;
  return e};
function examPool(c){
  return OUTLINE.filter(o=>o.core===c).map(o=>{const m=modBySlug(o.slug);return {o,m,qs:m?poolQs(m):[]}}).filter(d=>d.m);
}
function buildExam(c,n){
  const pool=examPool(c),tw=pool.reduce((a,d)=>a+d.o.weight,0);
  let take=pool.map(d=>Math.min(d.qs.length,Math.round(n*d.o.weight/tw)));
  let diff=n-take.reduce((a,b)=>a+b,0),k=0;
  while(diff!==0&&k<200){const j=k%pool.length;if(diff>0&&take[j]<pool[j].qs.length){take[j]++;diff--}else if(diff<0&&take[j]>0){take[j]--;diff++}k++}
  return shuffleArr(pool.flatMap((d,j)=>freshFirst(EXS(c),d.qs).slice(0,take[j])).map(q=>({...q,o:shuffleArr([0,1,2,3])})));
}
const examQ=x=>qRef(x);
const scaled=pct=>Math.round(100+800*pct/100);
const mmss=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
function examLeft(r){return Math.max(0,Math.round((r.start+r.mins*60000-Date.now())/1000))}

function renderExam(c){
  CUR=null;clearInterval(examTimer);
  const ex=EXS(c),r=ex.run;
  $("#nav").hidden=true;$("#stats").hidden=true;
  if(r&&examLeft(r)===0)return finishExam(c,true);
  if(r)return examQuestion(c);
  $("#head").innerHTML=`<div class="crumbs"><a href="../">Roadmap</a><span>/</span><a href="#home">All modules</a><span>/</span>Practice exam</div><h1>Core ${c} practice exam <span class="mono h-code">${EXAM[c].code}</span></h1>`;
  const last=ex.attempts.slice(-5).reverse();
  $("#view").innerHTML=`
  <p class="intro">Questions are drawn from all ${c===1?"five":"four"} Core ${c} modules, weighted like the real exam's domains. There's no feedback until you submit, and the clock keeps running if you leave the page.</p>
  <div class="ex-start">
    <button class="ex-opt" data-len="full"><b>Full exam</b><span class="mono">90 questions · 90 minutes</span><em>The real exam length.</em></button>
    <button class="ex-opt" data-len="half"><b>Half exam</b><span class="mono">45 questions · 45 minutes</span><em>A shorter timed check-in.</em></button>
  </div>
  ${poolInfo(c,ex)}<div class="ex-facts"><div><span class="s-small">PASSING SCORE</span><b class="mono">${EXAM[c].pass} / 900</b></div><div><span class="s-small">YOUR BEST</span><b class="mono">${ex.best??"—"}</b></div><div><span class="s-small">ATTEMPTS</span><b class="mono">${ex.attempts.length}</b></div></div>
  ${drillPicker(c)}
  ${last.length?`<h2 class="sec">Recent attempts</h2><div class="ex-hist">${last.map(a=>`<div class="${a.score>=EXAM[c].pass?"pass":"fail"}"><b class="mono">${a.score}</b><span>${a.n} questions · ${new Date(a.at).toLocaleDateString()}</span><em>${a.score>=EXAM[c].pass?"Pass":"Below passing"}</em></div>`).join("")}</div>`:""}
  <p class="hint left">The real exam also has performance-based questions. Practice those with the simulations in each module.</p>`;
  $("#view").querySelectorAll("[data-len]").forEach(b=>b.onclick=()=>{
    const [n,mins]=EXAM_LEN[b.dataset.len];
    ex.run={qs:buildExam(c,n),ans:{},flag:{},pos:0,start:Date.now(),mins};save();examQuestion(c)});
  wireDrill(c,ex);
}
function examQuestion(c){
  const ex=EXS(c),r=ex.run,N=r.qs.length,x=r.qs[r.pos],q=examQ(x),done=Object.keys(r.ans).length;
  $("#head").innerHTML=`<div class="ex-bar"><span class="mono">Core ${c} · Q${r.pos+1}/${N}</span><span class="ex-clockwrap"><span class="ex-clock mono" id="ex-clock">${mmss(examLeft(r))}</span><small class="ex-pace mono ${paceCls(r)}" id="ex-pace">${paceTxt(r)}</small></span><span class="mono">${done} answered</span></div>`;
  $("#view").innerHTML=`<div class="qcard ex-q">
    <div class="qmeta"><span>Question ${r.pos+1} of ${N}</span><button class="chip ex-flag" aria-pressed="${!!r.flag[r.pos]}" id="ex-flag">${r.flag[r.pos]?"⚑ Flagged":"⚐ Flag for review"}</button></div>
    <p class="qtext">${q.q}</p>
    <div class="opts">${x.o.map((oi,k)=>`<button class="opt ${r.ans[r.pos]===oi?"sel":""}" data-oi="${oi}"><span class="k">${"ABCD"[k]}</span><span>${q.o[oi]}</span></button>`).join("")}</div>
    <div class="qnav"><button class="btn" id="ex-prev" ${r.pos===0?"disabled":""}>Previous</button><button class="btn primary" id="ex-next">${r.pos===N-1?"Review and submit":"Next"}</button></div></div>
  <details class="ex-nav-wrap" ${N<=45?"open":""}><summary>Question map <span class="s-small">(${Object.values(r.flag).filter(Boolean).length} flagged)</span></summary>
  <div class="ex-map">${r.qs.map((_,i)=>`<button class="${r.ans[i]!==undefined?"a":""} ${r.flag[i]?"f":""} ${i===r.pos?"cur":""}" data-go="${i}">${i+1}</button>`).join("")}</div></details>
  <div class="viz-controls ex-end"><button class="btn" id="ex-quit">Abandon exam</button><button class="btn" id="ex-submit">Submit now</button></div>`;
  const V2=$("#view");
  V2.querySelectorAll("[data-oi]").forEach(b=>b.onclick=()=>{r.ans[r.pos]=+b.dataset.oi;save();examQuestion(c)});
  V2.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{r.pos=+b.dataset.go;save();examQuestion(c)});
  $("#ex-flag").onclick=()=>{r.flag[r.pos]=!r.flag[r.pos];save();examQuestion(c)};
  $("#ex-prev").onclick=()=>{r.pos--;save();examQuestion(c)};
  $("#ex-next").onclick=()=>{if(r.pos<N-1){r.pos++;save();examQuestion(c);window.scrollTo(0,0)}else examReview(c)};
  $("#ex-submit").onclick=()=>examReview(c);
  $("#ex-quit").onclick=()=>{if(confirm("Abandon this exam? Your answers will be discarded.")){ex.run=null;save();renderExam(c)}};
  tick(c);
}
function tick(c){
  clearInterval(examTimer);
  examTimer=setInterval(()=>{const r=EXS(c).run;if(!r||!location.hash.startsWith("#exam-")){clearInterval(examTimer);return}
    const left=examLeft(r),el=$("#ex-clock");if(el){el.textContent=mmss(left);el.classList.toggle("low",left<300)}
    const pe=$("#ex-pace");if(pe){pe.textContent=paceTxt(r);pe.className="ex-pace mono "+paceCls(r)}
    if(left===0){clearInterval(examTimer);finishExam(c,true)}},1000);
}
function examReview(c){
  const r=EXS(c).run,N=r.qs.length,un=N-Object.keys(r.ans).length,fl=Object.values(r.flag).filter(Boolean).length;
  $("#view").innerHTML=`<div class="qcard"><h2 class="sec">Ready to submit?</h2>
    <p>${un?`<b class="status-bad">${un} unanswered.</b> Unanswered questions are marked wrong. `:"Every question is answered. "}${fl?`${fl} flagged for review.`:""}</p>
    <div class="ex-map">${r.qs.map((_,i)=>`<button class="${r.ans[i]!==undefined?"a":""} ${r.flag[i]?"f":""}" data-go="${i}">${i+1}</button>`).join("")}</div>
    <div class="qnav"><button class="btn" id="ex-back">Keep working</button><button class="btn primary" id="ex-final">Submit exam</button></div></div>`;
  $("#view").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{r.pos=+b.dataset.go;save();examQuestion(c)});
  $("#ex-back").onclick=()=>examQuestion(c);$("#ex-final").onclick=()=>finishExam(c,false);
}
function finishExam(c,timeUp){
  clearInterval(examTimer);
  const ex=EXS(c),r=ex.run;if(!r)return renderExam(c);
  const N=r.qs.length,res=r.qs.map((x,i)=>({x,q:examQ(x),pick:r.ans[i]})).map(o=>({...o,ok:o.pick===o.q.a}));
  const right=res.filter(o=>o.ok).length,pct=right/N*100,score=scaled(pct),pass=score>=EXAM[c].pass;
  const used=Math.min(r.mins*60,Math.round((Date.now()-r.start)/1000));
  markSeen(ex,r.qs);if(r.kind)return finishPractice(c,ex,r,res,score,used,timeUp);
  ex.attempts.push({score,n:N,at:Date.now()});if(ex.best===null||score>ex.best)ex.best=score;ex.run=null;ex.last={res:res.map(o=>({mid:o.x.mid,i:o.x.i,b:o.x.b,pick:o.pick??null})),score,used,timeUp,n:N};save();
  awardRaw(`exam:c${c}:done`,100,`Completed a Core ${c} practice exam`);if(pass)awardRaw(`exam:c${c}:pass`,250,`Passed a Core ${c} practice exam`);
  const target="#exam-"+c+"-result";
  if(location.hash!==target)location.hash=target;else showExamResult(c);
}
function showExamResult(c){
  const ex=EXS(c),L=ex.last;if(!L)return renderExam(c);
  const res=L.res.map(o=>{const q=qRef(o);return {...o,q,ok:o.pick===q.a}});
  const pass=L.score>=EXAM[c].pass,right=res.filter(o=>o.ok).length;
  const doms=OUTLINE.filter(o=>o.core===c).map(o=>{const m=modBySlug(o.slug);const rs=res.filter(x=>m&&x.mid===m.id);return {o,n:rs.length,ok:rs.filter(x=>x.ok).length}}).filter(d=>d.n);
  $("#head").innerHTML=`<div class="crumbs"><a href="../">Roadmap</a><span>/</span><a href="#home">All modules</a><span>/</span><a href="#exam-${c}">Core ${c} practice exam</a><span>/</span>Results</div><h1>Exam results</h1>`;
  const pos=Math.max(0,Math.min(100,(L.score-100)/8));
  $("#view").innerHTML=`<div class="qcard result ex-res ${pass?"pass":"fail"}">
    <div class="eyebrow">${L.timeUp?"Time's up · ":""}${L.kind?L.label+" · ":""}Core ${c} · ${EXAM[c].code}</div>
    <div class="score">${L.score}<span class="mono"> / 900</span></div>
    <div class="ex-gauge"><i style="left:${(EXAM[c].pass-100)/8}%"></i><b style="width:${pos}%"></b></div>
    <div><b class="${pass?"status-good":"status-bad"}">${pass?"Pass":"Below the passing score of "+EXAM[c].pass}</b> · ${right} of ${L.n} correct · ${mmss(L.used)} used</div>
    <div class="qnav" style="justify-content:center"><a class="btn primary" href="#exam-${c}">Back to exam start</a>${right<L.n?`<button class="btn" id="ex-retry">Retry the ${L.n-right} missed</button>`:""}</div></div>
  <h2 class="sec">By domain</h2>
  <div class="ex-doms">${doms.map(d=>{const p=Math.round(d.ok/d.n*100);return `<a href="#${d.o.slug}" class="ex-dom"><span>${d.o.domain}.0 ${d.o.title}</span><span class="ex-dbar"><i class="${p>=80?"g":p>=65?"m":"b"}" style="width:${p}%"></i></span><b class="mono">${d.ok}/${d.n}</b></a>`}).join("")}</div>
  <p class="hint left">Weak domains are below 65%. Click one to study it. The 100–900 score is an estimate: CompTIA doesn't publish how it scales raw scores.</p>
  <h2 class="sec">Review <span class="s-small">${L.n-right} missed</span></h2>
  <div class="deckbar"><button class="chip" data-rv="miss" aria-pressed="true">Missed only</button><button class="chip" data-rv="all" aria-pressed="false">All questions</button></div>
  <div class="ex-rv"></div>`;
  const draw=all=>{$(".ex-rv").innerHTML=res.map((o,i)=>(!all&&o.ok)?"":`<div class="ex-ri ${o.ok?"ok":"no"}"><span class="mono">${i+1}</span><div><b>${o.q.q}</b><p>${o.pick===null?"<em>Not answered.</em> ":o.ok?"":`Your answer: ${o.q.o[o.pick]}. `}<span class="status-good">Answer: ${o.q.o[o.q.a]}.</span> ${o.q.e}</p></div></div>`).join("")||"<p>Nothing missed. Excellent.</p>";
    $("#view").querySelectorAll("[data-rv]").forEach(b=>b.setAttribute("aria-pressed",(b.dataset.rv==="all")===all))};
  $("#view").querySelectorAll("[data-rv]").forEach(b=>b.onclick=()=>draw(b.dataset.rv==="all"));draw(false);
  wireRetry(c,L,res);
}

/* ---------- router and boot ---------- */
function route(){
  const h=location.hash.slice(1)||"home";
  if(h.startsWith("l-"))return;/* in-page lesson anchors */
  const m=modBySlug(h);
  clearInterval(examTimer);
  if(m)openModule(m);else if(h==="ranks")renderRanks();else if(/^exam-[12]$/.test(h))renderExam(+h[5]);else if(/^exam-[12]-result$/.test(h))showExamResult(+h[5]);else renderHome();
  window.scrollTo(0,0);
}
function boot(){
  /* Credit any progress that predates XP, quietly, then go live. */
  MODULES.forEach(m=>{const st=MS(m.id);
    m.lessons.forEach(l=>{if(st.studied[l.id])awardRaw(m.id+":lesson:"+l.id,50)});
    (m.sims||[]).forEach(s=>{if(st.sims[s.id])awardRaw(m.id+":sim:"+s.id,150)});
    m.cards.forEach(c=>{for(let b=1;b<=(st.box[c.id]||0);b++)awardRaw(`${m.id}:card:${c.id}:${b}`,5)});
    if((st.best??0)>=80)awardRaw(m.id+":quiz80",50)});
  checkBadges(true);gameReady=true;renderHUD();
  addEventListener("hashchange",route);route();
}

/* ---------- Accessibility helpers ----------
   Skip link, keyboard access to scrolling terminals, code and tables,
   and screen-reader text for blank table header cells. */
(function(){
  const main=document.querySelector("main");
  if(main&&!document.querySelector(".skip-link")){
    main.id=main.id||"main";main.tabIndex=-1;
    const a=document.createElement("a");a.className="skip-link";a.href="#"+main.id;a.textContent="Skip to main content";
    a.addEventListener("click",e=>{e.preventDefault();main.focus();main.scrollIntoView()});
    document.body.prepend(a);
  }
  const FOCUSABLE="a[href],button,input,select,textarea,[tabindex]";
  const ALWAYS=".ios-out,.viz-scroll,pre,.term",IFSCROLL=".tbl-wrap,.tw";
  const label=e=>e.matches("pre")?"Code sample":e.matches(".tbl-wrap,.tw")?"Scrollable table":"Terminal output";
  const fix=()=>{
    document.querySelectorAll(ALWAYS+","+IFSCROLL).forEach(e=>{
      if(e.hasAttribute("tabindex")||e.querySelector(FOCUSABLE))return;
      if(e.matches(IFSCROLL)&&e.scrollWidth<=e.clientWidth+1)return;
      if(e.parentElement&&e.parentElement.closest(ALWAYS))return;
      e.tabIndex=0;if(!e.hasAttribute("role"))e.setAttribute("role","group");
      if(!e.hasAttribute("aria-label"))e.setAttribute("aria-label",label(e));
    });
    document.querySelectorAll("input:not([type=hidden]),select,textarea").forEach(e=>{
      if((e.labels&&e.labels.length)||e.hasAttribute("aria-label")||e.hasAttribute("aria-labelledby"))return;
      const t=e.previousElementSibling,txt=(t&&!t.matches("input,select,button,textarea")&&t.textContent.trim())||e.placeholder||e.title;
      if(txt)e.setAttribute("aria-label",txt.slice(0,80));
    });
    document.querySelectorAll("th:empty").forEach(th=>{th.innerHTML='<span class="sr-only">Item</span>'});
  };
  let queued=false;
  new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;fix()})}}).observe(document.body,{childList:true,subtree:true});
  fix();
})();
