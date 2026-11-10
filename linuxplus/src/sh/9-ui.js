/* ================= Linux shell simulator: terminal and lab UI =================
   shellLab(el, lab, api) mounts a lab. lab = {
     title, scenario, distro:"rhel"|"debian", host, user:"admin", cwd,
     world:{disks:[["sdb",10]], pkgs:[...], users:[...], files:{path:"content"|{c,mode,owner}}, remotes:{...}},
     setup:(w,sh)=>{},            // tweak the world before the lab starts
     tasks:[{t:"text", hint:"command", check:(w,sh,hist)=>bool, sticky}], success, solution:"cmd\ncmd",
     events:[{label, run:(w,sh)=>"text to print"}], welcome, panel:(w)=>html, history:[...] }  */
(function(){
const esc2=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
/* answers to a prompt run as the user who was prompted (sudo has returned by then) */
const asUser=(z,sh,u)=>{z.asUser=u;const d=z.done;z.done=(ans,out,more)=>{const prev=sh.user;sh.user=u;try{return d(ans,out,more&&((q2,d2)=>more(q2,(a2,o2,m2)=>{const p2=sh.user;sh.user=u;try{return d2(a2,o2,m2)}finally{sh.user=p2}})))}finally{sh.user=prev}}};
/* remember who ran an editor, so `sudo vim /etc/x` saves as root */
Object.keys(LX.C).forEach(n=>{const f=LX.C[n];if(f._wrapped)return;const g=(x,a,name)=>{const at=x.out.length;const r=f(x,a,name);for(let i=at;i<x.out.length;i++){const z=x.out[i];if(z&&z[0]===9&&z[1]&&typeof z[1]==="object"){if(z[1].edit&&!z[1].user)z[1].user=x.sh.user;if(z[1].ask&&!z[1].asUser)asUser(z[1],x.sh,x.sh.user)}}return r};g._wrapped=true;LX.C[n]=g});
/* Type=oneshot custom services really run their ExecStart, then go inactive (or failed) */
(function(){const old=LX.startUnit;LX.startUnit=(w,u,quiet)=>{const err=old(w,u,quiet);if(err)return err;const f=LX.read(w,"/etc/systemd/system/"+u+".service")||"";
  if(!/^\s*Type\s*=\s*oneshot/m.test(f)||w._oneshot)return err;const cmd=((f.match(/^\s*ExecStart\s*=\s*-?(.+)$/m)||[])[1]||"").trim();if(!cmd)return err;const U=w.units[u];
  w._oneshot=true;let r;try{const sh=LX.session(w,(f.match(/^\s*User\s*=\s*(\S+)/m)||[])[1]||"root",{cwd:"/"});r=LX.exec(sh,cmd)}catch(e){r={code:1,out:[[2,e.message]]}}finally{w._oneshot=false}
  w.procs=w.procs.filter(p=>p.unit!==u);U.pid=null;r.out.forEach(([fd,t])=>{if(fd===1||fd===2)String(t).split("\n").filter(Boolean).forEach(l=>LX.jlog(w,u,fd===2?3:6,l))});
  if(r.code){U.active="failed";U.sub="failed";U.err=`exit status ${r.code}`;LX.jlog(w,"systemd",3,`${u}.service: Main process exited, code=exited, status=${r.code}/FAILURE`);LX.jlog(w,"systemd",3,`Failed to start ${U.d}.`);return `exit status ${r.code}`}
  U.active="inactive";U.sub="dead";U.ran=(U.ran||0)+1;LX.jlog(w,"systemd",6,`${u}.service: Deactivated successfully.`);LX.jlog(w,"systemd",6,`Finished ${U.d}.`);return null}})();
LX.flagHook=k=>{if(typeof flag==="function")flag(k)};
/* does the typed text need more lines (open quote, heredoc, if/for/while block, trailing pipe)? */
LX.needMore=src=>{let q=null;for(let i=0;i<src.length;i++){const c=src[i];if(q){if(c==="\\"&&q==='"'){i++;continue}if(c===q)q=null;continue}if(c==="\\"){i++;continue}if(c==="'"||c==='"')q=c;if(c==="#"&&(i===0||/\s/.test(src[i-1]))){while(i<src.length&&src[i]!=="\n")i++}}if(q)return true;
  if(/(\\|\||&&|\|\|)\s*$/.test(src))return true;
  const L=src.split("\n");for(let i=0;i<L.length;i++){const re=/<<(?!<)-?\s*(['"]?)([\w.-]+)\1/g;let m;while(m=re.exec(L[i])){const d=m[2];const strip=/<<-/.test(m[0]);const rest=L.slice(i+1);if(!rest.some(l=>(strip?l.replace(/^\t+/,""):l)===d))return true}}
  try{LX.parse(src)}catch(e){if(/end of file/.test(e.message))return true}return false};
/* Tab completion: commands for the first word, then paths */
function complete(sh,line){const w=sh.w;const m=line.match(/(^|[\s|;&]+)([^\s|;&]*)$/);const word=m?m[2]:"";const first=!line.slice(0,line.length-word.length).replace(/sudo\s+$/,"").trim()||/[|;&]\s*(sudo\s+)?$/.test(line.slice(0,line.length-word.length));
  let cands=[];const home=w.users[sh.user].home;
  if(first&&!word.includes("/")){cands=[...new Set([...Object.keys(LX.C).filter(n=>LX.which(sh,n)),...Object.keys(LX.B),...Object.keys(sh.aliases),...Object.keys(sh.fns)])].filter(n=>n.startsWith(word)).sort()}
  else{const dirPart=word.includes("/")?word.slice(0,word.lastIndexOf("/")+1):"";const base=word.slice(dirPart.length);const dp=LX.abs(sh.cwd,dirPart||".",home);const d=LX.lookup(w,dp);
    if(d&&d.t==="d"&&LX.can(w,sh.user,d,"r"))cands=Object.keys(d.k).filter(n=>n.startsWith(base)&&(base.startsWith(".")||!n.startsWith("."))).sort().map(n=>{const z=LX.lookup(w,dp+"/"+n);return dirPart+n+(z&&z.t==="d"?"/":"")})}
  if(!cands.length)return {line,list:null};if(cands.length===1){const c=cands[0];return {line:line.slice(0,line.length-word.length)+c+(c.endsWith("/")?"":" "),list:null}}
  let pre=cands[0];cands.forEach(c=>{while(!c.startsWith(pre))pre=pre.slice(0,-1)});const nl=line.slice(0,line.length-word.length)+pre;return {line:nl,list:nl===line?cands:null}}
LX.complete=complete;
/* run a read-only command as root and return stdout (used by lab task checks) */
LX.q=(w,cmd,user)=>{const fl={...w.flags};const j=w.journal.length;const sh=LX.session(w,user||"root");let r;try{r=LX.exec(sh,cmd)}catch(e){return ""}w.journal.length=j;w.flags=Object.assign(w.flags,fl);return r.out.filter(z=>z[0]===1).map(z=>z[1]).join("")};
LX.qc=(w,cmd,user)=>{const sh=LX.session(w,user||"root");try{return LX.exec(sh,cmd).code}catch(e){return 1}};
/* a live picture of the storage stack: disks and partitions, physical volumes, volume groups, logical volumes, mounts */
LX.panelStorage=w=>{const G=n=>(+n>=1?(+n).toFixed(+n%1?1:0)+"G":Math.round(+n*1024)+"M");const mnt=d=>{const m=w.mounts.find(z=>z.src===d||z.src===d.replace(/^\/dev\/([\w-]+)\/([\w-]+)$/,"/dev/mapper/$1-$2"));return m?m.tgt:w.swaps&&w.swaps.some(z=>z.dev===d)?"[SWAP]":""};
  const fsT=d=>{const f=w.fs[d]||w.fs[d.replace(/^\/dev\/([\w-]+)\/([\w-]+)$/,"/dev/mapper/$1-$2")];return f?f.type:""};
  const disks=Object.entries(w.disks).map(([n,d])=>{const used=d.parts.reduce((a,p)=>a+p.size,0);const pv=w.lvm.pv["/dev/"+n];
    return `<div class="sp-disk"><b>/dev/${n}</b> <span class="s-small">${G(d.size)} ${d.label?d.label.toUpperCase():""}</span><div class="sp-bar">${d.parts.map(p=>{const dev="/dev/"+n+p.n;const pv2=w.lvm.pv[dev];const ty=pv2?"PV → "+pv2.vg:fsT(dev)||(p.type||"").replace("Linux ","");return `<i style="flex:${Math.max(p.size,d.size*.06)}" class="${pv2?"pv":fsT(dev)?"fs":""}" title="${dev}"><b>${n}${p.n}</b> ${G(p.size)}<br>${ty}${mnt(dev)?" · "+mnt(dev):""}</i>`}).join("")}${pv?`<i style="flex:1" class="pv"><b>whole disk</b> PV → ${pv.vg||"(no VG)"}</i>`:fsT("/dev/"+n)?`<i style="flex:1" class="fs"><b>whole disk</b> ${fsT("/dev/"+n)}${mnt("/dev/"+n)?" · "+mnt("/dev/"+n):""}</i>`:d.size-used>.05?`<i style="flex:${d.size-used}" class="free">free ${G(d.size-used)}</i>`:""}</div></div>`}).join("");
  const vgs=Object.keys(w.lvm.vg).map(vg=>{const size=Object.values(w.lvm.pv).filter(p=>p.vg===vg).reduce((a,p)=>a+p.size,0);const lvs=Object.entries(w.lvm.lv).filter(([k])=>k.split("/")[0]===vg);const used=lvs.reduce((a,[k,l])=>a+l.size,0);
    return `<div class="sp-disk"><b>VG ${vg}</b> <span class="s-small">${G(size)} from ${Object.entries(w.lvm.pv).filter(([d,p])=>p.vg===vg).map(([d])=>d).join(", ")}</span><div class="sp-bar">${lvs.map(([k,l])=>{const dev="/dev/"+k;return `<i style="flex:${Math.max(l.size,size*.08)}" class="lv"><b>${k.split("/")[1]}</b> ${G(l.size)}<br>${fsT(dev)||"no filesystem"}${mnt(dev)?" · "+mnt(dev):""}</i>`}).join("")}${size-used>.05?`<i style="flex:${size-used}" class="free">free ${G(size-used)}</i>`:""}</div></div>`}).join("");
  const raid=Object.entries(w.raid||{}).map(([n,r])=>`<div class="sp-disk"><b>${n}</b> <span class="s-small">RAID ${r.level} · ${r.devs.join(", ")}${r.failed&&r.failed.length?" · failed: "+r.failed.join(", "):""}</span></div>`).join("");
  return `<div class="sp"><div class="sp-h">Block devices</div>${disks}${raid?`<div class="sp-h">RAID</div>${raid}`:""}${vgs?`<div class="sp-h">LVM volume groups</div>${vgs}`:""}</div>`};
LX.ran=(sh,re)=>sh.hist.some(h=>re.test(h));
function colorize(fd,t){const s=esc2(t);if(fd===2)return `<span class="t-err">${s}</span>`;return s.replace(/(\(Simulator:[^)]*\))/g,'<span class="t-n">$1</span>')}

function build(lab){const w=LX.world({...(lab.world||{}),distro:lab.distro,host:lab.host});if(LX.afterWorld)LX.afterWorld(w);
  const user=lab.user||"admin";const sh=LX.session(w,user,{cwd:lab.cwd});(lab.history||[]).forEach(h=>sh.hist.push(h));
  if(lab.setup){try{lab.setup(w,sh)}catch(e){if(typeof console!=="undefined")console.error("lab setup",e)}}
  if(LX.afterWorld&&lab.resync!==false){/* refresh /dev, mounts and binaries after setup */try{if(LX.syncDev)LX.syncDev(w);LX.syncBins(w)}catch(e){}}
  return {w,sh}}
LX.buildLab=build;

function shellLab(el,lab,api){
  let w,sh,log,done,pend,cont,off,hpos,ed;
  function init(){({w,sh}=build(lab));done=new Set();pend=null;cont=null;off=false;ed=null;hpos=sh.hist.length;
    log=(lab.banner?esc2(lab.banner)+"\n":"")+`<span class="t-n">${esc2(lab.welcome||"Tab completes, ↑ for history.")}</span>\n\n`}
  init();
  const head=api&&api.head?api.head():"";
  el.innerHTML=`${head}${lab.scenario?`<p class="scenario">${lab.scenario}</p>`:""}
   ${lab.panel?`<div class="lx-panel viz-scroll"></div>`:""}
   <div class="ios-term lx-term" tabindex="-1"><pre class="ios-out" aria-live="polite"></pre><label class="ios-line"><span class="ios-p"></span><input class="ios-in" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" aria-label="Command line"></label>
     <div class="lx-ed" hidden><div class="lx-ed-bar"><b class="lx-ed-name"></b><span class="lx-ed-mode"></span></div><textarea class="lx-ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="File contents"></textarea>
       <div class="lx-ed-msg" aria-live="polite"></div><div class="lx-ed-keys"><button class="btn primary" data-e="save">Save and exit</button><button class="btn" data-e="quit">Exit without saving</button><span class="grow"></span><span class="s-small lx-ed-tip"></span></div></div></div>
   <div class="ios-keys"><button class="chip mono" data-k="tab">Tab</button><button class="chip mono" data-k="up">↑</button><button class="chip mono" data-k="down">↓</button><button class="chip mono" data-k="cc">Ctrl+C</button><button class="chip mono" data-k="cl">clear</button>${(lab.events||[]).map((e,i)=>`<button class="chip ev" data-ev="${i}">${e.label}</button>`).join("")}</div>
   ${lab.tasks&&lab.tasks.length?`<div class="ios-tasks"></div>`:""}
   <div class="caption ios-cap" aria-live="polite"></div>
   <div class="viz-controls"><button class="btn" data-a="hints">Show hints</button><button class="btn" data-a="reset">Reset lab</button>${lab.solution?`<button class="btn" data-a="sol">Show a solution</button>`:""}<span class="grow"></span></div>`;
  const out=$(".ios-out",el),inp=$(".ios-in",el),pr=$(".ios-p",el),edEl=$(".lx-ed",el),ta=$(".lx-ed-ta",el);let hints=false;
  const prompt=()=>off?"":pend?pend.qs[pend.i].p.split("\n").pop():cont!=null?"> ":LX.prompt(sh);
  function draw(){out.innerHTML=log;out.scrollTop=out.scrollHeight;pr.textContent=prompt();inp.type=pend&&pend.qs[pend.i].hide?"password":"text";inp.disabled=off;
    $(".ios-line",el).hidden=off||!!ed;
    if(lab.panel){try{$(".lx-panel",el).innerHTML=lab.panel(w,sh)}catch(e){}}
    if(lab.tasks){$(".ios-tasks",el).innerHTML=`<div class="s-small">TASKS · ${done.size} of ${lab.tasks.length}</div>`+lab.tasks.map((t,i)=>`<div class="ios-t${done.has(i)?" ok":""}"><span class="ios-c">${done.has(i)?"✓":i+1}</span><span>${t.t}${hints&&t.hint?`<code class="ios-h">${esc2(t.hint)}</code>`:""}</span></div>`).join("")}}
  function check(){if(!lab.tasks)return;const before=done.size;
    lab.tasks.forEach((t,i)=>{let ok=false;try{ok=!!t.check(w,sh,sh.hist)}catch(e){ok=false}if(ok)done.add(i);else if(!t.sticky)done.delete(i)});
    if(done.size===lab.tasks.length&&lab.tasks.length){$(".ios-cap",el).innerHTML=`<span class="status-good">All tasks complete.</span> ${lab.success||""}`;if(api&&api.pass)api.pass()}
    else if(done.size>before)$(".ios-cap",el).innerHTML=`<span class="status-good">Task complete.</span> ${lab.tasks.length-done.size} to go.`}
  function write(s){log+=s;if(log.length>80000)log=log.slice(-60000)}
  function put(s){if(s)write(colorize(1,s))}
  /* handle fd 9 UI requests that a command made */
  function ui(z){if(z==="clear"||z&&z.clear){log="";return}
    if(z.ask){pend={qs:z.ask,i:0,ans:[],done:z.done};const p=z.ask[0].p;if(p.includes("\n"))write(esc2(p.slice(0,p.lastIndexOf("\n")+1)));return}
    if(z.edit){openEd(z);return}
    if(z.reboot){write(`<span class="t-n">Connection to ${esc2(w.host)} closed by remote host.</span>\n`);let msgs=[];try{msgs=LX.reboot(w,sh)||[]}catch(e){if(typeof console!=="undefined")console.error(e)}
      if(z.off){off=true;write(`<span class="t-n">The server is powered off. Press "Power on" to start it again.</span>\n`);el.querySelector('[data-k="pw"]')||$(".ios-keys",el).insertAdjacentHTML("afterbegin",`<button class="chip ev" data-k="pw">Power on</button>`);return}
      boot(msgs);return}}
  function boot(msgs){const user=lab.user||"admin";sh=LX.session(w,user,{cwd:lab.cwd});hpos=sh.hist.length;
    write(`<span class="t-n">\n[  OK  ] Reached target multi-user.target - Multi-User System.\n${(msgs||[]).map(m=>esc2(m)).join("\n")}${msgs&&msgs.length?"\n":""}\n${esc2(w.host)} login: ${esc2(user)}\nLast login: ${new Date().toString().slice(0,24)} from 10.0.0.5</span>\n`);
    if(w.boot.emergency){sh=LX.session(w,"root");hpos=sh.hist.length;write(`<span class="t-err">Give root password for maintenance\n(or press Control-D to continue): </span>(Simulator: logged in as root in emergency mode. Fix /etc/fstab, then run systemctl reboot.)\n`)}}
  function flush(r){for(const [fd,t] of r.out){if(fd===9)ui(t);else write(colorize(fd,t))}
    if(r.exit&&!pend&&!ed){if(LX.popUser&&LX.popUser(sh))write("logout\n");else{write(`logout\n<span class="t-n">Connection to ${esc2(w.host)} closed. Starting a new session.</span>\n\n`);sh=LX.session(w,lab.user||"admin",{cwd:lab.cwd});hpos=sh.hist.length}}}
  function exec(line){
    if(off)return;
    if(pend){const q=pend.qs[pend.i];write(esc2(q.p.split("\n").pop())+(q.hide?"":esc2(line))+"\n");pend.ans.push(line);pend.i++;
      if(pend.i<pend.qs.length){const p=pend.qs[pend.i].p;if(p.includes("\n"))write(esc2(p.slice(0,p.lastIndexOf("\n")+1)));draw();return}
      const P=pend;pend=null;let chained=null;const more=(q2,d2)=>{chained={qs:q2,i:0,ans:[],done:d2}};
      try{P.done(P.ans,put,more)}catch(e){write(`<span class="t-err">${esc2(e.message)}</span>\n`);if(typeof console!=="undefined")console.error(e)}
      if(chained){pend=chained;const p=pend.qs[0].p;if(p.includes("\n"))write(esc2(p.slice(0,p.lastIndexOf("\n")+1)))}
      after(line);return}
    write(esc2(prompt()+line)+"\n");
    const src=cont!=null?cont+"\n"+line:line;
    if(LX.needMore(src)){cont=src;draw();return}cont=null;
    if(src.trim()){sh.hist.push(src);hpos=sh.hist.length}
    if(!src.trim()){draw();return}
    let r;try{r=LX.exec(sh,src)}catch(e){r={out:[[2,"bash: simulator error: "+e.message+"\n"]],code:1};if(typeof console!=="undefined")console.error(e)}
    flush(r);if(lab.onCmd)lab.onCmd(src,w,sh);after(src)}
  function after(){check();draw();if(!ed)inp.focus({preventScroll:true})}
  /* ---------- the editor ---------- */
  function openEd(z){ed=z;const vim=/vi|visudo|crontab|git/.test(z.ed)&&!/nano/.test(z.ed);edEl.hidden=false;ta.value=z.c||"";
    $(".lx-ed-name",el).textContent=(vim?"VIM":"GNU nano 7.2")+"  ·  "+(z.name||z.edit);$(".lx-ed-mode",el).textContent=z.ro?"[readonly]":z.c?"":"[New]";
    $(".lx-ed-msg",el).innerHTML="";$(".lx-ed-tip",el).textContent=vim?"Like :wq and :q! in vim. Ctrl+S saves.":"Like Ctrl+O then Ctrl+X in nano. Ctrl+S saves.";
    out.scrollTop=out.scrollHeight;setTimeout(()=>ta.focus(),0)}
  function closeEd(msg){edEl.hidden=true;const z=ed;ed=null;if(msg)put(msg);if(z&&z.after){try{z.after()}catch(e){}}check();draw();inp.focus({preventScroll:true})}
  function saveEd(force){const z=ed;const c=ta.value.replace(/\r/g,"");const msg=$(".lx-ed-msg",el);
    if(z.save){let r;try{r=z.save(c)}catch(e){r=e.message+"\n"}if(z.check==="cron"&&r&&/errors in crontab/.test(r)){msg.innerHTML=`<span class="status-bad">${esc2(r)}</span> Fix the line and save again, or exit without saving.`;return}closeEd(r);return}
    if(z.ro){msg.innerHTML=`<span class="status-bad">${/nano/.test(z.ed)?`[ Error writing ${esc2(z.name)}: Permission denied ]`:`E45: 'readonly' option is set. You don't have write permission on ${esc2(z.name)}. Try sudo.`}</span>`;return}
    if(z.check==="sudoers"&&!force){const old=LX.read(w,z.edit);LX.put(w,z.edit,c,{mode:0o440});const errs=LX.sudoersErrors(w);if(errs.length){if(old==null){const par=LX.parentOf(w,z.edit);if(par)delete par.k[LX.basename(z.edit)]}else LX.write(w,z.edit,old);
        msg.innerHTML=`<span class="status-bad">${esc2(errs[0].split("\n")[0])}<br>&gt;&gt;&gt; ${esc2(z.edit)}: syntax error near line ${esc2((errs[0].match(/:(\d+):/)||[])[1]||"?")} &lt;&lt;&lt;</span><br>What now? visudo refuses to save a broken sudoers file. <button class="btn" data-e="again">(e)dit again</button> <button class="btn" data-e="quit">e(x)it without saving</button> <button class="btn" data-e="force">(Q)uit and save anyway</button>`;return}
      const n=LX.lookup(w,z.edit);n.uid=0;n.gid=0;closeEd("");return}
    if(z.check==="sudoers"&&force){LX.put(w,z.edit,c,{mode:0o440});w.flags.brokenSudo=true;closeEd("");return}
    const err=LX.writeFile({...sh,user:z.user||sh.user},z.edit,c,false);
    if(err){msg.innerHTML=`<span class="status-bad">${/nano/.test(z.ed)?`[ Error writing ${esc2(z.name)}: ${esc2(err)} ]`:`"${esc2(z.name)}" E212: Can't open file for writing: ${esc2(err)}`}</span>`;return}
    closeEd(/systemctl edit/.test(z.ed)?"":"")}
  edEl.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(!b)return;const k=b.dataset.e;if(k==="save")saveEd(false);if(k==="force")saveEd(true);if(k==="quit")closeEd(ed&&ed.save&&/COMMIT/.test(ed.edit)?"Aborting commit due to empty commit message.\n":"");if(k==="again"){$(".lx-ed-msg",el).innerHTML="";ta.focus()}});
  ta.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&(e.key==="s"||e.key==="S"||e.key==="o"||e.key==="O")){e.preventDefault();saveEd(false)}else if(e.ctrlKey&&(e.key==="x"||e.key==="X")){e.preventDefault();saveEd(false)}
    else if(e.key==="Tab"){e.preventDefault();const s=ta.selectionStart;ta.setRangeText(/\.ya?ml$/.test(ed&&ed.name||"")?"  ":"\t",s,ta.selectionEnd,"end")}});
  /* ---------- terminal keys ---------- */
  function tab(){if(pend)return;const r=complete(sh,inp.value);inp.value=r.line;if(r.list){write(esc2(prompt()+inp.value)+"\n"+esc2(r.list.join("  "))+"\n");draw()}}
  function hist(d){if(pend)return;if(d<0&&hpos>0){hpos--;inp.value=sh.hist[hpos]||""}if(d>0&&hpos<sh.hist.length){hpos++;inp.value=sh.hist[hpos]||""}}
  function ctrlC(){write(esc2(prompt()+inp.value)+"^C\n");inp.value="";if(pend){pend=null;write("\n")}cont=null;draw()}
  inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();const v=inp.value;inp.value="";exec(v);return}
    if(e.key==="Tab"){e.preventDefault();tab();return}
    if(e.key==="ArrowUp"){e.preventDefault();hist(-1);return}
    if(e.key==="ArrowDown"){e.preventDefault();hist(1);return}
    if(e.ctrlKey&&(e.key==="c"||e.key==="C")&&!window.getSelection().toString()){e.preventDefault();ctrlC();return}
    if(e.ctrlKey&&(e.key==="l"||e.key==="L")){e.preventDefault();log="";draw();return}
    if(e.ctrlKey&&(e.key==="d"||e.key==="D")&&!inp.value){e.preventDefault();exec("exit");return}});
  el.addEventListener("click",e=>{const t=e.target;const k=t.closest("[data-k]")?.dataset.k;const a=t.closest("[data-a]")?.dataset.a;const ev=t.closest("[data-ev]");
    if(k){if(k==="tab")tab();if(k==="up")hist(-1);if(k==="down")hist(1);if(k==="cc")ctrlC();if(k==="cl"){log="";draw()}
      if(k==="pw"){t.closest("[data-k]").remove();off=false;boot(w.bootMsgs||[]);check();draw()}if(!ed)inp.focus();return}
    if(ev){const E=lab.events[+ev.dataset.ev];let r="";try{r=E.run(w,sh)}catch(err){r=err.message}if(r)write(`<span class="t-warn">${esc2(r)}</span>\n`);check();draw();inp.focus();return}
    if(a==="reset"){init();hints=false;edEl.hidden=true;el.querySelector('[data-k="pw"]')?.remove();$(".ios-cap",el).innerHTML="";$('[data-a="hints"]',el).textContent="Show hints";check();draw();return}
    if(a==="hints"){hints=!hints;t.textContent=hints?"Hide hints":"Show hints";draw();return}
    if(a==="sol"){write(`<span class="t-n"># One possible solution:\n${esc2(lab.solution.split("\n").map(l=>l.startsWith("#")?l:"  "+l).join("\n"))}</span>\n\n`);draw();return}
    if(t.closest(".lx-term")&&!t.closest(".lx-ed")&&!window.getSelection().toString()&&!off)inp.focus({preventScroll:true})});
  check();draw();
  return {w:()=>w,sh:()=>sh,run:l=>exec(l),editor:()=>ed,type:s=>{ta.value=s},save:()=>saveEd(false),answer:l=>exec(l)};
}
if(typeof window!=="undefined")window.shellLab=shellLab;
/* a lab used as a lesson diagram: awards XP like other diagrams */
if(typeof window!=="undefined")window.shellViz=function(el,lab,key,xp,label){return shellLab(el,lab,{head:()=>`<div class="viz-title">${lab.title}</div>`,pass:()=>award("viz:"+(key||el.id.replace(/^viz-/,"")),xp||30,label||"Completed a shell exercise")})};

/* audit watches: record events for paths watched with auditctl -w, searchable with ausearch -k */
LX.auditHit=(w,path,user,comm,op)=>{(w.auditRules||[]).forEach(r=>{const m=r.match(/^-w (\S+) -p (\S+)(?: -k (\S+))?/);if(!m)return;if(!(path===m[1]||path.startsWith(m[1].replace(/\/?$/,"/"))))return;if(!m[2].includes(op))return;w.auditEv=w.auditEv||[];const t=Date.now();const uid=(w.users[user]||{}).uid??0;
  w.auditEv.push({k:m[3]||null,t,raw:`----\ntime->${new Date(t).toString().slice(0,24)}\ntype=PATH msg=audit(${(t/1000).toFixed(3)}:${900+w.auditEv.length}): item=0 name="${path}" nametype=NORMAL\ntype=SYSCALL msg=audit(${(t/1000).toFixed(3)}:${900+w.auditEv.length}): arch=c000003e syscall=257 success=yes exit=3 auid=${uid} uid=0 comm="${comm}" exe="/usr/bin/${comm}" key="${m[3]||"(null)"}"`})})};
(function(){const wf=LX.writeFile;LX.writeFile=(sh,p,c,app,check)=>{const r=wf(sh,p,c,app,check);if(!r&&sh&&sh.w&&sh.w.auditRules)LX.auditHit(sh.w,p,sh.loginUser||sh.user,"bash","w");return r};
  const acct={useradd:["/etc/passwd","/etc/shadow","/etc/group"],usermod:["/etc/passwd","/etc/shadow","/etc/group"],userdel:["/etc/passwd","/etc/shadow","/etc/group"],passwd:["/etc/shadow"],chage:["/etc/shadow"],groupadd:["/etc/group"],gpasswd:["/etc/group"],chpasswd:["/etc/shadow"]};
  Object.keys(acct).forEach(n=>{const f=LX.C[n];if(!f)return;LX.C[n]=(x,a,name)=>{const r=f(x,a,name);const w=x.sh&&x.sh.w;if(!r&&w&&w.auditRules)acct[n].forEach(p=>LX.auditHit(w,p,x.sh.loginUser||x.sh.user,n,"w"));return r}});
  const as=LX.C.ausearch;LX.C.ausearch=(x,a,name)=>{const i=a.indexOf("-k")>=0?a.indexOf("-k"):a.indexOf("--key");if(i<0)return as(x,a,name);const w=x.sh.w;if(w.users[x.sh.user]?.uid!==0){x.out.push([2,"Error opening /var/log/audit/audit.log (Permission denied)\n"]);return 1}const k=a[i+1];const L=(w.auditEv||[]).filter(z=>z.k===k);if(!L.length){x.out.push([1,"<no matches>\n"]);return 1}x.out.push([1,L.map(z=>z.raw).join("\n")+"\n"]);return 0}})();

/* git -q / --quiet: suppress normal output */
(function(){const g=LX.C.git;if(!g)return;LX.C.git=(x,a,name)=>{const q=a.slice(1).some(s=>s==="-q"||s==="--quiet"||/^-[a-zA-Z]*q[a-zA-Z]*m?$/.test(s)&&a[0]==="commit");if(!q||!/^(init|commit|switch|checkout|pull|push|clone|fetch|merge|stash)$/.test(a[0]))return g(x,a,name);const n0=x.out.length;const r=g(x,a.filter(s=>s!=="-q"&&s!=="--quiet").map(s=>a[0]==="commit"&&/^-[a-zA-Z]*q/.test(s)?s.replace("q",""):s).filter(s=>s!=="-"),name);x.out.splice(n0,x.out.length-n0,...x.out.slice(n0).filter(z=>z[0]!==1));return r}})();

/* files deleted while open are released once the process holding them is gone (kill, restart) */
(function(){const ex=LX.exec;LX.exec=(sh,line,...r)=>{const res=ex(sh,line,...r);try{const w=sh.w;if(w.deletedOpen&&w.deletedOpen.length){const keep=[];w.deletedOpen.forEach(d=>{if(w.procs.some(p=>p.pid===d.pid))keep.push(d);else if(w.fs[d.mnt])w.fs[d.mnt].held=Math.max(0,(w.fs[d.mnt].held||0)-d.sz/1073741824)});w.deletedOpen=keep}}catch(e){}return res}})();

/* pam_faillock: 3 recent failures lock password logins until faillock --reset */
(function(){const f=LX.sshLogin;if(!f)return;LX.sshLogin=(w,o)=>{const L=(w.faillock||{})[o.user]||[];const deny=+((LX.read(w,"/etc/security/faillock.conf")||"").match(/^\s*deny\s*=\s*(\d+)/m)||[,3])[1];if(o.method==="password"&&Array.isArray(L)&&L.length>=deny&&w.users[o.user]?.uid!==0){LX.jlog(w,"sshd",5,`pam_faillock(sshd:auth): Consecutive login failures for user ${o.user} account temporarily locked`);LX.jlog(w,"sshd",5,`Failed password for ${o.user} from ${o.from||"10.0.0.5"} port 51544 ssh2`);return {ok:false,msg:`${o.user}@${w.host}: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password).`}}return f(w,o)}})();

/* config tests: apachectl configtest / httpd -t / nginx -t */
(function(){const C=LX.C;const syn=(w,u)=>{const U=w.units[u];if(!U)return null;const save=U.failWith;U.failWith=null;let r=null;try{r=LX.unitCheck(w,u)}finally{U.failWith=save}return (r||[]).filter(l=>/AH00526|AH00112|Invalid command|was not closed|DocumentRoot|emerg\] unexpected|test failed/.test(l))};
  const ap=(x,a,name)=>{const w=x.sh.w;if(!w.installed.has("httpd")&&!w.installed.has("apache2")){x.out.push([2,`bash: ${name}: command not found...\n`]);return 127}const t=name==="apachectl"||name==="apache2ctl"?/^(configtest|-t)$/.test(a[0]||""):a.includes("-t");if(!t){x.out.push([1,"(Simulator: use systemctl to start and stop httpd; apachectl configtest or httpd -t checks the configuration.)\n"]);return 0}const r=syn(w,w.distro==="debian"?"apache2":"httpd")||[];if(r.length){x.out.push([2,r.join("\n")+"\n"]);return 1}x.out.push([2,"Syntax OK\n"]);return 0};
  C.apachectl=C.apache2ctl=C.httpd=ap;
  const ng=C.nginx;C.nginx=(x,a,name)=>{const w=x.sh.w;if(!w.installed.has("nginx"))return ng?ng(x,a,name):127;if(a.includes("-t")||a.includes("-T")){const r=syn(w,"nginx")||[];if(r.length){x.out.push([2,r.join("\n")+(r.some(l=>/test failed/.test(l))?"":"\nnginx: configuration file /etc/nginx/nginx.conf test failed")+"\n"]);return 1}x.out.push([2,"nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful\n"]);return 0}return ng?ng(x,a,name):0}})();
})();
