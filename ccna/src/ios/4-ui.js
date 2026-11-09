/* ================= Cisco IOS simulator: terminal and lab UI =================
   iosLab(el, lab, api) mounts a lab. lab = {
     title, scenario, devices:[{name,kind,ifs}], links:[["R1:g0/0/0","SW1:g1/0/1"]], hosts:[...], traffic:[...],
     boot:{R2:["interface g0/0/0", ...]},  consoles:["R1"],  topo:{R1:[x,y],...},
     tasks:[{t:"text", hint:"command", check:(w,D)=>bool}], success, events:[{label, run:(w,D)=>log}], free:true }  */
(function(){
const esc2=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function stamp(){const d=new Date();const M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];return `*${M} ${String(d.getDate()).padStart(2," ")} ${d.toTimeString().slice(0,8)}.${String(d.getMilliseconds()).padStart(3,"0")}: `}
function build(lab){const w=IOS.world(lab);w.traffic=lab.traffic||[];
  Object.entries(lab.boot||{}).forEach(([dv,cmds])=>{const d=w.devs[dv];const x={d,w,mode:"config",ifs:[],flags:{},hist:[]};
    cmds.forEach(c=>{const r=IOS.run(x,c);if(r&&/% (Invalid|Incomplete|Ambiguous)|\^/.test(r)&&typeof console!=="undefined")console.warn("boot",dv,c,r)});d.cfgChanged=false});
  (lab.setup||(()=>{}))(w);IOS.settle(w);return w}
IOS.build=build;
function session(w,name){return {d:w.devs[name],w,mode:"user",ifs:[],sub:null,pend:null,flags:{},hist:[],hpos:0,buf:""}}
function colorize(t){return esc2(t).replace(/^(\s*\^)$/m,'<span class="t-bad">$1</span>').replace(/(% ?(Invalid|Incomplete|Ambiguous|Bad|Error|Unrecognized|Please|Command rejected)[^\n]*)/g,'<span class="t-bad">$1</span>')
  .replace(/(%[A-Z0-9_]+-\d-[A-Z_]+:[^\n]*)/g,m=>`<span class="${/DOWN|ERR|VIOLATION|BLOCK|changed state to (down|administratively)/.test(m)?"t-warn":"t-log"}">${m}</span>`)
  .replace(/^(Success rate is 100 percent[^\n]*)/m,'<span class="t-ok">$1</span>').replace(/^(Success rate is 0 percent[^\n]*)/m,'<span class="t-bad">$1</span>')}
IOS.colorize=colorize;

function topoSVG(lab,w,cur){const T=lab.topo;if(!T)return "";const pos=k=>T[k];let s="";const W=lab.topoW||600,H=lab.topoH||220;
  const st=(dv,ifn)=>{const d=w.devs[dv];if(!d)return true;const i=d.ifs[ifn];return i&&IOS.physUp(w,d,i)};
  const lbl=(x1,y1,x2,y2,t)=>{const fx=x1+(x2-x1)*0.24,fy=y1+(y2-y1)*0.24;return `<text x="${fx}" y="${fy-5}" text-anchor="middle" class="tp-if">${t}</text>`};
  w.segs.forEach(seg=>{if(seg.length!==2)return;const [[a,ai],[b,bi]]=seg;const A=pos(a),Bp=pos(b);if(!A||!Bp)return;const up=st(a,ai)&&st(b,bi);const blk=lab.stpV!=null&&isBlocked(w,lab.stpV,a,ai,b,bi);
    const off=seg.off||0;const dx=Bp[1]-A[1],dy=A[0]-Bp[0],L=Math.hypot(dx,dy)||1;const ox=(lab.offs?.[a+b+ai]||0)*dx/L,oy=(lab.offs?.[a+b+ai]||0)*dy/L;
    s+=`<line x1="${A[0]+ox}" y1="${A[1]+oy}" x2="${Bp[0]+ox}" y2="${Bp[1]+oy}" class="tp-l ${up?(blk?"blk":"up"):"down"}"/>${lbl(A[0]+ox,A[1]+oy,Bp[0]+ox,Bp[1]+oy,IOS.ifShort(ai))}${lbl(Bp[0]+ox,Bp[1]+oy,A[0]+ox,A[1]+oy,IOS.ifShort(bi))}`;
    if(blk){const m=blk===a?[A,Bp]:[Bp,A];const fx=m[0][0]+(m[1][0]-m[0][0])*.36+ox,fy=m[0][1]+(m[1][1]-m[0][1])*.36+oy;s+=`<circle cx="${fx}" cy="${fy}" r="8" class="stp-x"/><text x="${fx}" y="${fy+4}" text-anchor="middle" class="s-b" style="font-size:10px">✕</text>`}});
  w.hosts.forEach(h=>{if(!h.at||!pos(h.name))return;const [dv,ifn]=h.at.split(":");const A=pos(dv),Hp=pos(h.name);if(!A)return;const up=st(dv,ifn);s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${Hp[0]}" y2="${Hp[1]}" class="tp-l ${up?"up":"down"}"/>${lbl(A[0],A[1],Hp[0],Hp[1],IOS.ifShort(ifn))}`});
  Object.entries(T).forEach(([k,[x,y]])=>{const d=w.devs[k];const h=w.hosts.find(z=>z.name===k);const con=(lab.consoles||[]).includes(k);
    if(d){const name=d.host;if(d.kind==="router")s+=`<g class="tp-n rt${k===cur?" cur":""}${con?" con":""}" data-dev="${k}"><circle cx="${x}" cy="${y}" r="22"/><path d="M${x-10} ${y-4}h20M${x-10} ${y+4}h20M${x+6} ${y-8}l4 4-4 4M${x-6} ${y}l-4 4 4 4" class="tp-g"/><text x="${x}" y="${y+38}" text-anchor="middle" class="s-b">${name}</text></g>`;
      else s+=`<g class="tp-n sw${k===cur?" cur":""}${con?" con":""}" data-dev="${k}"><rect x="${x-26}" y="${y-15}" width="52" height="30" rx="6"/><path d="M${x-14} ${y-5}h28M${x+10} ${y-9}l4 4-4 4M${x+14} ${y+5}h-28M${x-10} ${y+1}l-4 4 4 4" class="tp-g"/><text x="${x}" y="${y+32}" text-anchor="middle" class="s-b">${name}</text></g>`}
    else if(h){const ip=IOS.hostIp(h,w);s+=`<g class="tp-n hs"><rect x="${x-17}" y="${y-12}" width="34" height="22" rx="3"/><rect x="${x-7}" y="${y+10}" width="14" height="4" class="tp-g2"/><text x="${x}" y="${y+28}" text-anchor="middle" class="s-b" style="font-size:11px">${h.name}</text><text x="${x}" y="${y+40}" text-anchor="middle" class="s-small" style="font-size:10px">${ip!=null?IOS.ip4s(ip):h.dhcp?"DHCP…":""}</text></g>`}
    else if(lab.clouds&&lab.clouds[k])s+=`<g class="tp-n cl"><ellipse cx="${x}" cy="${y}" rx="40" ry="20"/><text x="${x}" y="${y+4}" text-anchor="middle" class="s-b" style="font-size:11px">${lab.clouds[k]}</text></g>`});
  return `<svg viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W,520)}px" role="img" aria-label="Lab topology">${s}</svg>`}
function isBlocked(w,v,a,ai,b,bi){const A=w.devs[a],Bd=w.devs[b];if(!A||!Bd||A.kind==="router"||Bd.kind==="router")return null;const T=IOS.stp(w,v);if(!T)return null;
  const ra=T.roles.get(a)||{},rb=T.roles.get(b)||{};const ia=A.ifs[ai],ib=Bd.ifs[bi];const ka=ia.cg&&IOS.ecMember(w,A,ia)==="P"?"Port-channel"+ia.cg.n:ai,kb=ib.cg&&IOS.ecMember(w,Bd,ib)==="P"?"Port-channel"+ib.cg.n:bi;
  if(ra[ka]==="Altn")return a;if(rb[kb]==="Altn")return b;return null}

function iosLab(el,lab,api){
  let w,S,cur,done;const persist=lab.persist;
  function init(){w=build(lab);S={};(lab.consoles||[]).forEach(n=>{S[n]=session(w,n);if(lab.startMode)S[n].mode=lab.startMode});cur=lab.start||(lab.consoles||[])[0];done=new Set();
    Object.values(S).forEach(x=>x.log=(lab.banner?lab.banner+"\n\n":"")+`<span class="t-n">${esc2(lab.welcome||"Type commands at the prompt. Press ? for help, Tab to complete, ↑ for history.")}</span>\n\n`);}
  init();
  const head=api&&api.head?api.head():"";
  el.innerHTML=`${head}${lab.scenario?`<p class="scenario">${lab.scenario}</p>`:""}
   ${lab.topo?`<div class="viz-scroll ios-topo"></div>`:""}
   <div class="ios-tabs chips"></div>
   <div class="ios-term" tabindex="-1"><pre class="ios-out" aria-live="polite"></pre><label class="ios-line"><span class="ios-p"></span><input class="ios-in" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" aria-label="Command line"></label></div>
   <div class="ios-keys"><button class="chip mono" data-k="?">?</button><button class="chip mono" data-k="tab">Tab</button><button class="chip mono" data-k="up">↑</button><button class="chip mono" data-k="down">↓</button><button class="chip mono" data-k="cz">Ctrl+Z</button>${(lab.events||[]).map((e,i)=>`<button class="chip ev" data-ev="${i}">${e.label}</button>`).join("")}</div>
   ${lab.tasks&&lab.tasks.length?`<div class="ios-tasks"></div>`:""}
   <div class="caption ios-cap" aria-live="polite"></div>
   <div class="viz-controls"><button class="btn" data-a="hints">Show hints</button><button class="btn" data-a="reset">Reset lab</button>${lab.solution?`<button class="btn" data-a="sol">Show a solution</button>`:""}<span class="grow"></span></div>`;
  const out=$(".ios-out",el),inp=$(".ios-in",el),pr=$(".ios-p",el);let hints=false;
  function draw(){const x=S[cur];
    $(".ios-tabs",el).innerHTML=(lab.consoles||[]).length>1?(lab.consoles.map(n=>`<button class="chip" data-dev="${n}" aria-pressed="${n===cur}">Console: ${w.devs[n].host}</button>`).join("")):"";
    out.innerHTML=x.log;out.scrollTop=out.scrollHeight;pr.textContent=x.pend?x.pend.prompt.split("\n").pop():IOS.prompt(x);inp.type=x.pend&&x.pend.hide?"password":"text";
    if(lab.topo)$(".ios-topo",el).innerHTML=topoSVG(lab,w,cur);
    if(lab.tasks){const D=w.devs;$(".ios-tasks",el).innerHTML=`<div class="s-small">TASKS · ${done.size} of ${lab.tasks.length}</div>`+lab.tasks.map((t,i)=>`<div class="ios-t${done.has(i)?" ok":""}"><span class="ios-c">${done.has(i)?"✓":i+1}</span><span>${t.t}${hints&&t.hint?`<code class="ios-h">${esc2(t.hint)}</code>`:""}</span></div>`).join("")}}
  function check(){if(!lab.tasks)return;const D=w.devs;const before=done.size;
    lab.tasks.forEach((t,i)=>{let ok=false;try{ok=!!t.check(w,D,S)}catch(e){ok=false}if(ok)done.add(i);else if(!t.sticky)done.delete(i)});
    if(done.size===lab.tasks.length&&lab.tasks.length){$(".ios-cap",el).innerHTML=`<span class="status-good">All tasks complete.</span> ${lab.success||""}`;if(api&&api.pass)api.pass()}
    else if(done.size>before)$(".ios-cap",el).innerHTML=`<span class="status-good">Task complete.</span> ${lab.tasks.length-done.size} to go.`}
  function write(x,s){x.log+=s;if(x.log.length>60000)x.log=x.log.slice(-50000)}
  function exec(line){const x=S[cur];const d=x.d;
    if(x.pend){const p=x.pend;write(x,esc2(p.prompt.split("\n").pop())+(p.hide?"":esc2(line))+"\n");const before=IOS.snap(w,d);const r=IOS.answer(x,line);if(r)write(x,colorize(r)+"\n");logs(x,before);check();draw();return}
    const prompt=IOS.prompt(x);write(x,esc2(prompt+line)+"\n");if(line.trim()){x.hist.push(line);x.hpos=x.hist.length}
    const before=IOS.snap(w,d);const wasCfg=x.mode!=="user"&&x.mode!=="priv";
    let r;try{r=IOS.run(x,line)}catch(e){r="% Simulator error: "+e.message;if(typeof console!=="undefined")console.error(e)}
    if(x.pend&&x.pend.prompt.includes("\n")){const pl=x.pend.prompt.split("\n");write(x,esc2(pl.slice(0,-1).join("\n"))+"\n")}
    if(r)write(x,colorize(r)+"\n");
    if(wasCfg&&x.mode==="priv")write(x,`<span class="t-log">${stamp()}%SYS-5-CONFIG_I: Configured from console by console</span>\n`);
    logs(x,before);if(lab.onCmd)lab.onCmd(line,x,w);check();draw()}
  function logs(x,before){const ev=IOS.settle(w);const after=IOS.snap(w,x.d);const L=IOS.diff(w,x.d,before,after);ev.filter(e=>e[0]===x.d).forEach(e=>L.unshift(...e.slice(1)));
    /* other consoles hear about their own changes */
    Object.values(S).forEach(y=>{if(y===x)return;const ys=y.snapLast||before;});
    if(L.length)write(x,colorize(L.map(m=>stamp()+m).join("\n"))+"\n");
    w.syslog=w.syslog||{};(w.syslog[x.d.name]=w.syslog[x.d.name]||[]).push(...L.map(m=>stamp()+m))}
  inp.addEventListener("keydown",e=>{const x=S[cur];
    if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";exec(v);return}
    if(e.key==="?"&&!x.pend){e.preventDefault();const v=inp.value;write(x,esc2(IOS.prompt(x)+v+"?")+"\n"+esc2(IOS.help(x,v))+"\n\n");draw();inp.value=v;return}
    if(e.key==="Tab"&&!x.pend){e.preventDefault();const c=IOS.complete(x,inp.value);if(c)inp.value=c;return}
    if(e.key==="ArrowUp"){e.preventDefault();if(x.hpos>0){x.hpos--;inp.value=x.hist[x.hpos]||""}return}
    if(e.key==="ArrowDown"){e.preventDefault();if(x.hpos<x.hist.length){x.hpos++;inp.value=x.hist[x.hpos]||""}return}
    if(e.ctrlKey&&(e.key==="z"||e.key==="Z")){e.preventDefault();if(x.mode!=="user"&&x.mode!=="priv"){write(x,esc2(IOS.prompt(x)+inp.value)+"^Z\n");inp.value="";const b=IOS.snap(w,x.d);x.mode="priv";x.ifs=[];write(x,`<span class="t-log">${stamp()}%SYS-5-CONFIG_I: Configured from console by console</span>\n`);logs(x,b);check();draw()}return}
    if(e.ctrlKey&&(e.key==="c"||e.key==="C")&&x.pend){e.preventDefault();x.pend=null;write(x,"\n");inp.value="";draw()}});
  el.addEventListener("click",e=>{const t=e.target;const dv=t.closest("[data-dev]");const k=t.closest("[data-k]")?.dataset.k;const a=t.closest("[data-a]")?.dataset.a;const ev=t.closest("[data-ev]");
    if(dv&&S[dv.dataset.dev]){cur=dv.dataset.dev;draw();inp.focus();return}
    if(k){const x=S[cur];if(k==="?"){const v=inp.value;write(x,esc2(IOS.prompt(x)+v+"?")+"\n"+esc2(IOS.help(x,v))+"\n\n");draw();inp.value=v}
      if(k==="tab"){const c=IOS.complete(x,inp.value);if(c)inp.value=c}if(k==="up"&&x.hpos>0){x.hpos--;inp.value=x.hist[x.hpos]||""}if(k==="down"&&x.hpos<x.hist.length){x.hpos++;inp.value=x.hist[x.hpos]||""}
      if(k==="cz"&&x.mode!=="user"&&x.mode!=="priv"){write(x,esc2(IOS.prompt(x))+"^Z\n");x.mode="priv";x.ifs=[];check();draw()}inp.focus();return}
    if(ev){const x=S[cur];const E=lab.events[+ev.dataset.ev];const b=IOS.snap(w,x.d);const r=E.run(w,w.devs,S);if(r)write(x,colorize(r)+"\n");logs(x,b);check();draw();inp.focus();return}
    if(a==="reset"){init();hints=false;$(".ios-cap",el).innerHTML="";draw();return}
    if(a==="hints"){hints=!hints;t.textContent=hints?"Hide hints":"Show hints";draw();return}
    if(a==="sol"){const x=S[cur];write(x,`<span class="t-n">! One possible solution:\n${esc2(lab.solution)}</span>\n\n`);draw();return}
    if(t.closest(".ios-term")&&!window.getSelection().toString())inp.focus({preventScroll:true})});
  check();draw();
  return {w:()=>w,run:l=>exec(l),sessions:()=>S,select:n=>{cur=n;draw()}};
}
window.iosLab=iosLab;
/* a lab used as a lesson diagram: awards XP like other diagrams */
window.iosViz=function(el,lab,key,xp,label){return iosLab(el,{...lab,scenario:lab.scenario},{head:()=>`<div class="viz-title">${lab.title}</div>`,pass:()=>award("viz:"+key,xp||40,label||"Completed a CLI lab")})};
})();
