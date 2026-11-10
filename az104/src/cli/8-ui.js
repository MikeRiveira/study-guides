/* ================= Cloud Shell terminal and lab UI =================
   azLab(el, lab, api). lab = {title, scenario, shell:"bash"|"ps"|"both", setup(w), files:{name:{text,params,res}}, filesData:{name:json|text},
     tasks:[{t, hint, check:w=>bool, sticky}], success, solution:"multi-line", welcome}  */
(function(){
const esc=AZ.escH;const lc=s=>String(s==null?"":s).toLowerCase();
const ICON={vnet:"VNet",nsg:"NSG",asg:"ASG",pip:"PIP",nic:"NIC",vm:"VM",disk:"Disk",avset:"AvSet",vmss:"VMSS",sa:"Storage",plan:"Plan",web:"Web",acr:"ACR",aci:"ACI",cae:"CAE",ca:"App",lb:"LB",rt:"Routes",bas:"Bastion",pe:"PE",dns:"DNS",pdns:"PvtDNS",rsv:"Vault",ag:"AG",alert:"Alert",aalert:"Alert",law:"LAW",kv:"KV",as:"Scale"};
function build(lab){const w=AZ.world(lab);if(lab.setup)lab.setup(w,AZ);w.flags={};return w}
AZ.build=build;
function resView(w){const rgs=Object.values(w.rgs);
  const sub=AZ.subOf(w);const mg=AZ.mgChain(w,w.sub).map(m=>m.name).reverse();
  const head=`<div class="az-sub"><span class="s-small">${mg.length?esc(mg.join(" › "))+" › ":""}SUBSCRIPTION</span> <b>${esc(sub.name)}</b>${w.locks.filter(l=>/^\/subscriptions\/[^/]+$/i.test(l.scope)).map(l=>` <span class="az-lock" title="${l.level} lock">🔒 ${l.level}</span>`).join("")}${w.pols.length?` <span class="az-pol">${w.pols.length} polic${w.pols.length>1?"ies":"y"}</span>`:""}${w.roles.length>1?` <span class="az-pol">${w.roles.length-1} role assignment${w.roles.length>2?"s":""}</span>`:""}</div>`;
  const ids=(w.users.length>1||w.groups.length)?`<div class="az-ids s-small">ENTRA ID · ${w.users.length} user${w.users.length>1?"s":""} · ${w.groups.length} group${w.groups.length===1?"":"s"}</div>`:"";
  if(!rgs.length)return head+ids+`<div class="s-small az-empty">No resource groups yet.</div>`;
  return head+ids+rgs.map(g=>{const rs=w.res.filter(r=>lc(r.rg)===lc(g.name)&&r.t!=="nic"&&r.t!=="disk");const locks=w.locks.filter(l=>lc(l.scope)===lc(AZ.rgId(w,g.name)));const extra=w.res.filter(r=>lc(r.rg)===lc(g.name)&&(r.t==="nic"||r.t==="disk")).length;
    return `<div class="az-rg"><div class="az-rgh"><b>${esc(g.name)}</b><span class="s-small">${esc(g.loc)}</span>${locks.map(l=>`<span class="az-lock" title="${l.level} lock">🔒 ${l.level==="ReadOnly"?"ReadOnly":"Delete"}</span>`).join("")}${Object.entries(g.tags||{}).map(([k,v])=>`<span class="tag">${esc(k)}=${esc(v)}</span>`).join("")}</div>
      <div class="az-res">${rs.map(r=>`<span class="az-r az-${r.t}" title="${esc(AZ.TL[r.t]||r.t)}"><i>${ICON[r.t]||r.t}</i>${esc(r.name)}${r.t==="vm"?`<em class="${r.p.power==="VM running"?"on":"off"}">${r.p.power.replace("VM ","")}</em>`:""}${Object.keys(r.tags||{}).length?`<em class="tg">${Object.keys(r.tags).length} tag${Object.keys(r.tags).length>1?"s":""}</em>`:""}</span>`).join("")||'<span class="s-small">empty</span>'}${extra?`<span class="s-small">+${extra} NIC/disk</span>`:""}</div></div>`}).join("")}
function azLab(el,lab,api){
  let w,S,cur,done;const shells=lab.shell==="both"?["bash","ps"]:[lab.shell||"bash"];
  const prompt=sh=>sh==="ps"?"PS /home/admin> ":"admin [ ~ ]$ ";
  function init(){w=build(lab);S={};shells.forEach(sh=>S[sh]={log:`<span class="t-n">${sh==="ps"?"PowerShell":"Bash"} · Azure Cloud Shell (simulated). You're signed in as ${esc(w.me)}.\n${esc(lab.welcome||(sh==="ps"?"Type Az cmdlets. Tab completes cmdlet and parameter names, ↑ recalls history, Get-Help lists cmdlets.":"Type az commands. Tab completes, ↑ recalls history, az <group> --help shows commands, ls and cat show your files."))}</span>\n\n`,hist:[],hpos:0});cur=shells[0];done=new Set()}
  init();
  el.innerHTML=`${api&&api.head?api.head():""}${lab.scenario?`<p class="scenario">${lab.scenario}</p>`:""}
   ${shells.length>1?`<div class="chips az-tabs">${shells.map(s=>`<button class="chip" data-sh="${s}"></button>`).join("")}</div>`:""}
   <div class="ios-term az-term" tabindex="-1"><pre class="ios-out" aria-live="polite"></pre><label class="ios-line"><span class="ios-p"></span><input class="ios-in" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" aria-label="Command line"></label></div>
   <div class="ios-keys"><button class="chip mono" data-k="tab">Tab</button><button class="chip mono" data-k="up">↑</button><button class="chip mono" data-k="down">↓</button><button class="chip mono" data-k="clear">clear</button></div>
   <details class="az-view" open><summary>Resources in your subscription</summary><div class="az-tree"></div></details>
   ${lab.tasks&&lab.tasks.length?`<div class="ios-tasks"></div>`:""}
   <div class="caption ios-cap" aria-live="polite"></div>
   <div class="viz-controls"><button class="btn" data-a="hints">Show hints</button><button class="btn" data-a="reset">Reset lab</button>${lab.solution?`<button class="btn" data-a="sol">Show a solution</button>`:""}<span class="grow"></span></div>`;
  const out=el.querySelector(".ios-out"),inp=el.querySelector(".ios-in"),pr=el.querySelector(".ios-p");let hints=false;
  function draw(){const x=S[cur];out.innerHTML=x.log;out.scrollTop=out.scrollHeight;pr.textContent=prompt(cur);
    el.querySelectorAll("[data-sh]").forEach(b=>{b.textContent=b.dataset.sh==="ps"?"PowerShell":"Bash";b.setAttribute("aria-pressed",b.dataset.sh===cur)});
    el.querySelector(".az-tree").innerHTML=resView(w);
    if(lab.tasks)el.querySelector(".ios-tasks").innerHTML=`<div class="s-small">TASKS · ${done.size} of ${lab.tasks.length}</div>`+lab.tasks.map((t,i)=>`<div class="ios-t${done.has(i)?" ok":""}"><span class="ios-c">${done.has(i)?"✓":i+1}</span><span>${t.t}${hints&&t.hint?`<code class="ios-h">${esc(cur==="ps"&&t.psHint?t.psHint:t.hint)}</code>`:""}</span></div>`).join("")}
  function check(){["lockedout","denied","frozen","wipe"].forEach(f=>{if(w.flags[f]&&typeof flag==="function")flag(f)});
    if(!lab.tasks)return;const before=done.size;lab.tasks.forEach((t,i)=>{let ok=false;try{ok=!!t.check(w,AZ)}catch(e){ok=false}if(ok)done.add(i);else if(!t.sticky)done.delete(i)});
    const cap=el.querySelector(".ios-cap");if(done.size===lab.tasks.length){cap.innerHTML=`<span class="status-good">All tasks complete.</span> ${lab.success||""}`;if(api&&api.pass)api.pass()}else if(done.size>before)cap.innerHTML=`<span class="status-good">Task complete.</span> ${lab.tasks.length-done.size} to go.`}
  function write(x,s){x.log+=s;if(x.log.length>80000)x.log=x.log.slice(-60000)}
  function exec(line){const x=S[cur];write(x,`<span class="t-c">${esc(prompt(cur))}</span>${esc(line)}\n`);if(line.trim()){x.hist.push(line);x.hpos=x.hist.length}
    const r=cur==="ps"?AZ.psExec(w,line):AZ.exec(w,line);if(r.clear){x.log="";}else if(r.out)write(x,r.out+"\n");
    if(lab.onCmd)lab.onCmd(line,w,r);check();draw()}
  function complete(){const v=inp.value;const c=cur==="ps"?AZ.psComplete(v):AZ.complete(v);if(!c)return;if(typeof c==="string"){inp.value=c;return}const x=S[cur];write(x,`<span class="t-c">${esc(prompt(cur))}</span>${esc(v)}\n<span class="t-n">${esc(c.list.join("  "))}</span>\n`);draw();inp.value=v}
  inp.addEventListener("keydown",e=>{const x=S[cur];
    if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";exec(v);return}
    if(e.key==="Tab"){e.preventDefault();complete();return}
    if(e.key==="ArrowUp"){e.preventDefault();if(x.hpos>0){x.hpos--;inp.value=x.hist[x.hpos]||""}return}
    if(e.key==="ArrowDown"){e.preventDefault();if(x.hpos<x.hist.length){x.hpos++;inp.value=x.hist[x.hpos]||""}return}
    if(e.ctrlKey&&(e.key==="l"||e.key==="L")){e.preventDefault();x.log="";draw()}
    if(e.ctrlKey&&(e.key==="c"||e.key==="C")&&!window.getSelection().toString()){e.preventDefault();write(x,`<span class="t-c">${esc(prompt(cur))}</span>${esc(inp.value)}^C\n`);inp.value="";draw()}});
  el.addEventListener("click",e=>{const t=e.target;const sh=t.closest("[data-sh]");const k=t.closest("[data-k]")?.dataset.k;const a=t.closest("[data-a]")?.dataset.a;
    if(sh){cur=sh.dataset.sh;draw();inp.focus();return}
    if(k){const x=S[cur];if(k==="tab")complete();if(k==="up"&&x.hpos>0){x.hpos--;inp.value=x.hist[x.hpos]||""}if(k==="down"&&x.hpos<x.hist.length){x.hpos++;inp.value=x.hist[x.hpos]||""}if(k==="clear"){x.log="";draw()}inp.focus();return}
    if(a==="reset"){init();hints=false;const hb=el.querySelector('[data-a="hints"]');if(hb)hb.textContent="Show hints";el.querySelector(".ios-cap").innerHTML="";draw();return}
    if(a==="hints"){hints=!hints;t.textContent=hints?"Hide hints":"Show hints";draw();return}
    if(a==="sol"){const x=S[cur];const sol=cur==="ps"&&lab.psSolution?lab.psSolution:lab.solution;write(x,`<span class="t-n"># One possible solution (you can copy these lines):\n${esc(sol)}</span>\n\n`);draw();return}
    if(t.closest(".ios-term")&&!window.getSelection().toString())inp.focus({preventScroll:true})});
  check();draw();
  return {w:()=>w,run:l=>exec(l),shell:s=>{cur=s;draw()}};
}
window.azLab=azLab;
/* a lab used as a lesson diagram: awards XP like other diagrams */
window.azViz=function(el,lab,key,xp,label){return azLab(el,lab,{head:()=>`<div class="viz-title">${lab.title}</div>`,pass:()=>award("viz:"+key,xp||40,label||"Completed a Cloud Shell drill")})};
})();
