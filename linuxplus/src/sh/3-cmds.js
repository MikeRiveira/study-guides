/* ================= Linux shell simulator: file and text commands ================= */
(function(){
const C=LX.C;
const W=x=>x.sh.w,U=x=>x.sh.user,HOME=x=>W(x).users[U(x)].home,P=(x,p)=>LX.abs(x.sh.cwd,p,HOME(x));
const o=(x,s)=>x.out.push([1,s]),e=(x,s)=>x.out.push([2,s]);
const stdin=x=>{const s=x.in?x.in.s:"";if(x.in)x.in.s="";return s};
const isRoot=x=>W(x).users[U(x)].uid===0;
LX.u={W,U,HOME,P,o,e,stdin,isRoot};
function opts(a,val="",lval=[]){const f={},p=[];for(let k=0;k<a.length;k++){const s=a[k];
    if(s==="--"){p.push(...a.slice(k+1));break}
    if(s.startsWith("--")&&s.length>2){const m=s.match(/^--([^=]+)(?:=(.*))?$/s);if(m[2]===undefined&&lval.includes(m[1]))f[m[1]]=a[++k];else f[m[1]]=m[2]!==undefined?m[2]:true;continue}
    if(s.startsWith("-")&&s.length>1&&!/^-\d/.test(s)){for(let j=1;j<s.length;j++){const c=s[j];if(val.includes(c)){f[c]=s.slice(j+1)||a[++k];break}f[c]=true}continue}
    p.push(s)}return {f,p}}
LX.opts=opts;
const human=(b,si)=>{const u=["","K","M","G","T"];let i=0;b=+b;while(b>=1024&&i<4){b/=1024;i++}return i===0?String(Math.round(b)):(b<10?b.toFixed(1):Math.round(b))+u[i]};
LX.human=human;
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const lsDate=t=>{const d=new Date(t);return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${d.toTimeString().slice(0,5)}`};
const readAll=(x,files,cmd)=>{/* returns [{name,c}] or prints errors */const out=[];let rc=0;
  if(!files.length||files.length===1&&files[0]==="-"){out.push({name:"-",c:stdin(x)});return {out,rc}}
  files.forEach(f=>{if(f==="-"){out.push({name:"-",c:stdin(x)});return}const r=LX.readFile(x.sh,P(x,f));if(r.err){e(x,`${cmd}: ${f}: ${r.err}\n`);rc=1}else out.push({name:f,c:r.c,n:r.n})});return {out,rc}};
const lines=s=>{const L=s.split("\n");if(L[L.length-1]==="")L.pop();return L};
const flag=k=>{if(LX.flagHook)LX.flagHook(k)};

/* ---------- /usr/bin markers so ls, which, file and find see real programs ---------- */
const SUID={passwd:0o4755,sudo:0o4111,su:0o4755,chage:0o4755,newgrp:0o4755,gpasswd:0o4755,mount:0o4755,umount:0o4755,crontab:0o4755,pkexec:0o4755,chsh:0o4755};
LX.syncBins=w=>{const ub=LX.lookup(w,"/usr/bin"),us=LX.lookup(w,"/usr/sbin");
  Object.keys(C).forEach(n=>{const pk=LX.binPkg(n);const ok=!pk||w.installed.has(pk);const dir=LX.SBIN.has(n)?us:ub;
    if(!ok){delete dir.k[n];return}if(!dir.k[n]){const f=LX.F("",SUID[n]||0o755,0,0);f.sz=40000+((n.length*7919)%90000);f.bin=(sh,args,x)=>LX.runExternal(sh,n,args,x,true);f.elf=true;dir.k[n]=f}});
  [ub,us].forEach(dir=>Object.keys(dir.k).forEach(n=>{const f=dir.k[n];if(f.stub&&!w.installed.has(f.stub))delete dir.k[n]}));
  w.installed.forEach(k=>{const p=LX.PKG[k];(p&&p.bins||[]).forEach(n=>{if(C[n]||ub.k[n]||us.k[n])return;const f=LX.F("",0o755,0,0);f.sz=60000+((n.length*7919)%90000);f.elf=true;f.stub=k;f.bin=(sh,args,x)=>{x.out.push([1,`(Simulator: ${n} is installed, but its own interface isn't simulated in this lab.)\n`]);return 0};ub.k[n]=f})})};
LX.afterWorld=w=>LX.syncBins(w);
LX.which=(sh,n)=>{const w=sh.w;if(!C[n]){const sb=LX.lookup(w,"/usr/bin/"+n);return sb&&sb.stub?"/usr/bin/"+n:null}const pk=LX.binPkg(n);if(pk&&!w.installed.has(pk))return null;return (LX.SBIN.has(n)?"/usr/sbin/":"/usr/bin/")+n};
/* ---------- dispatch ---------- */
const DEBONLY=new Set(["apt","apt-get","apt-cache","dpkg","ufw","aa-status","apparmor_status","aa-enforce","aa-complain","netplan","update-grub","a2ensite","a2enmod","needrestart"]);
const RHONLY=new Set(["dnf","yum","rpm","firewall-cmd","grubby","grub2-mkconfig","subscription-manager","nmtui","dracut","authselect","semanage","restorecon","chcon","getsebool","setsebool","sealert","sestatus","getenforce","setenforce","ausearch","audit2why","audit2allow","update-crypto-policies"]);
LX.runExternal=(sh,name,args,x,fromPath)=>{const w=sh.w;
  const missing=()=>{if(w.distro==="debian"){const pk=LX.binPkg(name);x.out.push([2,pk?`Command '${name}' not found, but can be installed with:\nsudo apt install ${LX.pkgDisp(w,pk)}\n`:`${name}: command not found\n`])}else x.out.push([2,`bash: ${name}: command not found...\n`]);return 127};
  if(!C[name]){const sb=LX.lookup(w,"/usr/bin/"+name);if(sb&&sb.stub)return sb.bin(sh,args,x);return missing()}
  if(w.distro==="debian"&&RHONLY.has(name)&&!["getenforce","sestatus"].includes(name))return missing();
  if(w.distro!=="debian"&&DEBONLY.has(name))return missing();
  const pk=LX.binPkg(name);if(pk&&!w.installed.has(pk))return missing();
  let r;try{r=C[name](x,args,name)}catch(err){if(err instanceof LX.Ctl)throw err;x.out.push([2,`${name}: ${err.message}\n`]);if(typeof console!=="undefined"&&!/simulator|syntax/.test(err.message))console.error(err);return 1}
  return typeof r==="number"?r:0};

/* ---------- listing ---------- */
function lsLong(x,n,name,f,path){const w=W(x);const own=f.n?String(n.uid):LX.uidName(w,n.uid),grp=f.n?String(n.gid):LX.gidName(w,n.gid);
  const sz=f.h?human(LX.size(n)):String(LX.size(n));const extra=n.acl?"+":(w.selinux.mode!=="disabled"?".":"");
  return {mode:LX.modeStr(n)+extra,nl:String(n.t==="d"?2+Object.values(n.k).filter(c=>c.t==="d").length:n.nl||1),own,grp,sz,date:lsDate(n.m),name:name+(n.t==="l"?" -> "+n.to:""),ino:String(n.ino),ctx:`unconfined_u:object_r:${LX.ctxOf(w,path,n)}:s0`}}
function fmtLong(rows,f){if(!rows.length)return "";const wd=k=>Math.max(...rows.map(r=>r[k].length));const W1=wd("nl"),W2=wd("own"),W3=wd("grp"),W4=wd("sz"),W5=wd("ino");
  return rows.map(r=>(f.i?r.ino.padStart(W5)+" ":"")+`${r.mode} ${r.nl.padStart(W1)} ${r.own.padEnd(W2)} ${r.grp.padEnd(W3)} ${f.Z?r.ctx+" ":""}${r.sz.padStart(W4)} ${r.date} ${r.name}`).join("\n")+"\n"}
C.ls=(x,a)=>{const {f,p}=opts(a,"",["color","sort"]);const w=W(x);let rc=0;if(f.all)f.a=true;if(f["almost-all"])f.A=true;if(f.directory)f.d=true;if(f["human-readable"])f.h=true;if(f.recursive)f.R=true;if(f.context)f.Z=true;
  const long=f.l||f.n||f.g||f.o;const targets=p.length?p:["."];const files=[],dirs=[];
  targets.forEach(t=>{const path=P(x,t);const ln=LX.lookup(w,path,false);const n=ln&&ln.t==="l"&&!long?LX.lookup(w,path):ln&&ln.t==="l"&&long&&!t.endsWith("/")?ln:LX.lookup(w,path);
    if(!LX.traverse(x.sh,path)){e(x,`ls: cannot access '${t}': Permission denied\n`);rc=2;return}
    if(!n){e(x,`ls: cannot access '${t}': No such file or directory\n`);rc=2;return}
    if(n.t==="d"&&!f.d)dirs.push([t,path,n]);else files.push([t,path,n])});
  const sortE=list=>{let L=list;if(f.t)L.sort((a,b)=>b[2].m-a[2].m);else if(f.S)L.sort((a,b)=>LX.size(b[2])-LX.size(a[2]));else L.sort((a,b)=>a[0].replace(/^\./,"").localeCompare(b[0].replace(/^\./,"")));if(f.r)L.reverse();return L};
  const show=list=>{if(!list.length)return "";if(long)return fmtLong(list.map(([nm,pth,n])=>lsLong(x,n,nm,f,pth)),f);
    const names=list.map(([nm,pth,n])=>(f.i?n.ino+" ":"")+(f.Z?`unconfined_u:object_r:${LX.ctxOf(w,pth,n)}:s0 `:"")+nm+(f.F?(n.t==="d"?"/":n.t==="l"?"@":(n.mode&0o111?"*":"")):""));
    return f[1]||x.piped?names.join("\n")+"\n":names.join("  ")+"\n"};
  let out=show(sortE(files));
  const listDir=(t,path,n,hdr)=>{if(!LX.can(w,U(x),n,"r")){e(x,`ls: cannot open directory '${t}': Permission denied\n`);rc=2;return}
    let ents=Object.entries(n.k).filter(([k])=>f.a||f.A||!k.startsWith(".")).map(([k,c])=>[k,(path==="/"?"":path)+"/"+k,c]);
    if(f.a&&!f.A)ents=[[".",path,n],["..",LX.dirname(path),LX.lookup(w,LX.dirname(path))],...ents];
    let s=(hdr?`${t}:\n`:"")+(long?`total ${ents.reduce((a2,z)=>a2+Math.ceil(LX.size(z[2])/1024),0)}\n`:"")+show(sortE(ents));out+=s;
    if(f.R)ents.filter(z=>z[2].t==="d"&&z[0]!=="."&&z[0]!=="..").forEach(z=>{out+="\n";listDir((t==="."?".":t)+"/"+z[0],z[1],z[2],true)})};
  dirs.forEach(([t,path,n],k)=>{if(k||files.length)out+="\n";listDir(t,path,n,targets.length>1||f.R)});
  o(x,out);return rc};
C.dir=C.ls;C.vdir=(x,a)=>C.ls(x,["-l",...a]);

/* ---------- reading ---------- */
C.cat=(x,a)=>{const {f,p}=opts(a);const r=readAll(x,p,"cat");let s=r.out.map(z=>z.c).join("");if(f.n){let k=0;s=lines(s).map(l=>`${String(++k).padStart(6)}\t${l}`).join("\n")+"\n"}if(f.A)s=s.replace(/\t/g,"^I").replace(/\r/g,"^M").replace(/\n/g,"$\n");o(x,s);return r.rc};
C.tac=(x,a)=>{const r=readAll(x,a,"tac");o(x,r.out.map(z=>lines(z.c).reverse().join("\n")+"\n").join(""));return r.rc};
C.less=C.more=C.view=(x,a)=>{const {p}=opts(a);if(!p.length&&!x.in.s){e(x,"Missing filename (\"less --help\" for help)\n");return 1}const r=readAll(x,p,"less");o(x,r.out.map(z=>z.c).join(""));return r.rc};
C.head=C.tail=(x,a,name)=>{const A=a.map(s=>/^-\d+$/.test(s)?"-n"+s.slice(1):s);const {f,p}=opts(A,"nc");let n=f.n!=null?String(f.n):"10";const fromStart=n.startsWith("+");n=Math.abs(parseInt(n));
  const r=readAll(x,p,name);r.out.forEach((z,k)=>{if(r.out.length>1)o(x,(k?"\n":"")+`==> ${z.name} <==\n`);let L=lines(z.c);
    if(f.c!=null){const c=parseInt(f.c);o(x,name==="head"?z.c.slice(0,c):z.c.slice(-c));return}
    L=name==="head"?L.slice(0,n):(fromStart?L.slice(n-1):L.slice(-n));if(L.length)o(x,L.join("\n")+"\n")});
  if(name==="tail"&&f.f)e(x,"(tail -f would keep printing new lines here as they're written. Press Ctrl+C to stop on a real system.)\n");return r.rc};
C.nl=(x,a)=>{const r=readAll(x,a,"nl");let k=0;o(x,r.out.map(z=>lines(z.c).map(l=>l.trim()?`${String(++k).padStart(6)}\t${l}`:"").join("\n")+"\n").join(""));return r.rc};
C.rev=(x,a)=>{const r=readAll(x,a,"rev");o(x,r.out.map(z=>lines(z.c).map(l=>[...l].reverse().join("")).join("\n")+"\n").join(""));return r.rc};
C.wc=(x,a)=>{const {f,p}=opts(a);const r=readAll(x,p,"wc");const all=!f.l&&!f.w&&!f.c&&!f.m;let T=[0,0,0];
  const row=(z)=>{const c=[lines(z.c).length&&z.c.endsWith("\n")?lines(z.c).length:z.c.split("\n").length-1,(z.c.match(/\S+/g)||[]).length,new Blob([z.c]).size];T=T.map((v,i)=>v+c[i]);
    const parts=[];if(all||f.l)parts.push(c[0]);if(all||f.w)parts.push(c[1]);if(all||f.c||f.m)parts.push(c[2]);return parts.map(v=>p.length||all?String(v).padStart(all?String(T[2]).length+1:0):String(v)).join(" ").trim()+(z.name!=="-"?" "+z.name:"")};
  r.out.forEach(z=>o(x,row(z)+"\n"));if(r.out.length>1){const parts=[];if(all||f.l)parts.push(T[0]);if(all||f.w)parts.push(T[1]);if(all||f.c)parts.push(T[2]);o(x,parts.join(" ")+" total\n")}return r.rc};
C.sort=(x,a)=>{const {f,p}=opts(a,"ktTo");const r=readAll(x,p,"sort");let L=r.out.flatMap(z=>lines(z.c));const sep=f.t;
  const key=l=>{if(!f.k)return l;const [s]=String(f.k).split(",");const k=parseInt(s);const parts=sep?l.split(sep):l.trim().split(/\s+/);return parts[k-1]??""};
  const num=v=>parseFloat(v)||0;const hnum=v=>{const m=String(v).match(/^([\d.]+)([KMGT]?)/i);return m?parseFloat(m[1])*Math.pow(1024,"KMGT".indexOf((m[2]||"").toUpperCase())+1):0};
  L.sort((A,B2)=>{const a1=key(A),b1=key(B2);const c=f.n?num(a1)-num(b1):f.h?hnum(a1)-hnum(b1):f.f?a1.toLowerCase().localeCompare(b1.toLowerCase()):(a1<b1?-1:a1>b1?1:0);return c||(A<B2?-1:A>B2?1:0)});
  if(f.r)L.reverse();if(f.u)L=L.filter((l,i)=>i===0||key(l)!==key(L[i-1]));const out=L.length?L.join("\n")+"\n":"";if(f.o){LX.writeFile(x.sh,P(x,f.o),out)}else o(x,out);return r.rc};
C.uniq=(x,a)=>{const {f,p}=opts(a);const r=readAll(x,p.slice(0,1),"uniq");const L=lines(r.out.map(z=>z.c).join(""));const g=[];L.forEach(l=>{const k=f.i?l.toLowerCase():l;if(g.length&&g[g.length-1][2]===k)g[g.length-1][1]++;else g.push([l,1,k])});
  let res=g;if(f.d)res=g.filter(z=>z[1]>1);if(f.u)res=g.filter(z=>z[1]===1);o(x,res.map(([l,n])=>f.c?`${String(n).padStart(7)} ${l}`:l).join("\n")+(res.length?"\n":""));return r.rc};
C.cut=(x,a)=>{const {f,p}=opts(a,"dfc");const r=readAll(x,p,"cut");const d=f.d!=null?f.d:"\t";const spec=String(f.f||f.c||"");if(!spec){e(x,"cut: you must specify a list of bytes, characters, or fields\n");return 1}
  const want=n=>spec.split(",").some(s=>{const m=s.match(/^(\d*)-?(\d*)$/);if(!s.includes("-"))return n===+s;const lo=m[1]?+m[1]:1,hi=m[2]?+m[2]:1e9;return n>=lo&&n<=hi});
  o(x,r.out.flatMap(z=>lines(z.c)).map(l=>{if(f.c)return [...l].filter((_,i)=>want(i+1)).join("");if(!l.includes(d))return l;return l.split(d).filter((_,i)=>want(i+1)).join(d)}).join("\n")+"\n");return r.rc};
C.paste=(x,a)=>{const {f,p}=opts(a,"d");const r=readAll(x,p,"paste");const cols=r.out.map(z=>lines(z.c));const n=Math.max(...cols.map(c=>c.length));const d=f.d||"\t";const out=[];for(let i=0;i<n;i++)out.push(cols.map(c=>c[i]||"").join(d));o(x,out.join("\n")+"\n");return 0};
C.tr=(x,a)=>{const {f,p}=opts(a);const s=stdin(x);const exp=set=>{set=set.replace(/\[:upper:\]/g,"A-Z").replace(/\[:lower:\]/g,"a-z").replace(/\[:digit:\]/g,"0-9").replace(/\[:space:\]/g," \t\n").replace(/\[:alpha:\]/g,"a-zA-Z").replace(/\\n/g,"\n").replace(/\\t/g,"\t");let out="";for(let i=0;i<set.length;i++){if(set[i+1]==="-"&&set[i+2]){for(let c=set.charCodeAt(i);c<=set.charCodeAt(i+2);c++)out+=String.fromCharCode(c);i+=2}else out+=set[i]}return out};
  const A=exp(p[0]||"");const cmp=f.c||f.C;if(f.d){o(x,[...s].filter(c=>cmp?A.includes(c):!A.includes(c)).join(""));return 0}if(f.s&&!p[1]){o(x,s.replace(new RegExp("(["+A.replace(/[\]\\^-]/g,"\\$&")+"])\\1+","g"),"$1"));return 0}
  const Bs=exp(p[1]||"");o(x,[...s].map(c=>{const i=A.indexOf(c);return i<0?c:(Bs[Math.min(i,Bs.length-1)]??c)}).join(""));return 0};
C.tee=(x,a)=>{const {f,p}=opts(a);const s=stdin(x);let rc=0;p.forEach(t=>{const err=LX.writeFile(x.sh,P(x,t),s,!!f.a);if(err){e(x,`tee: ${t}: ${err}\n`);rc=1}});o(x,s);return rc};
C.column=(x,a)=>{const {f,p}=opts(a,"s");const r=readAll(x,p,"column");const rows=lines(r.out.map(z=>z.c).join("")).map(l=>f.s?l.split(f.s):l.trim().split(/\s+/));const wd=[];rows.forEach(rw=>rw.forEach((c,i)=>wd[i]=Math.max(wd[i]||0,c.length)));o(x,rows.map(rw=>rw.map((c,i)=>i<rw.length-1?c.padEnd(wd[i]+2):c).join("")).join("\n")+"\n");return 0};
C.seq=(x,a)=>{const n=a.map(Number);let [s,st,en]=n.length===1?[1,1,n[0]]:n.length===2?[n[0],1,n[1]]:n;const out=[];for(let i=s;st>0?i<=en:i>=en;i+=st){out.push(i);if(out.length>10000)break}o(x,out.join("\n")+(out.length?"\n":""));return 0};
C.yes=(x,a)=>{o(x,Array(20).fill(a.join(" ")||"y").join("\n")+"\n");return 0};
C.basename=(x,a)=>{let b=LX.basename(a[0]||"");if(a[1]&&b.endsWith(a[1]))b=b.slice(0,-a[1].length);o(x,b+"\n");return 0};
C.dirname=(x,a)=>{const d=(a[0]||".").includes("/")?LX.dirname(a[0]):".";o(x,(a[0]&&!a[0].startsWith("/")&&d!=="."?d.slice(1):d)+"\n");return 0};
C.realpath=C.readlink=(x,a,name)=>{const {f,p}=opts(a);const w=W(x);let rc=0;p.forEach(t=>{const path=P(x,t);if(name==="readlink"&&!f.f&&!f.e){const n=LX.lookup(w,path,false);if(n&&n.t==="l")o(x,n.to+"\n");else rc=1;return}
  let cur=path;for(let k=0;k<10;k++){const n=LX.lookup(w,cur,false);if(n&&n.t==="l")cur=LX.abs(LX.dirname(cur),n.to);else break}o(x,cur+"\n")});return rc};
C.sleep=()=>0;C.sync=()=>0;
C.clear=(x)=>{x.out.push([9,"clear"]);return 0};C.reset=C.clear;
C.date=(x,a)=>{const d=new Date();const f=a.find(s=>s.startsWith("+"));if(f){const z=n=>String(n).padStart(2,"0");o(x,f.slice(1).replace(/%Y/g,d.getFullYear()).replace(/%m/g,z(d.getMonth()+1)).replace(/%d/g,z(d.getDate())).replace(/%H/g,z(d.getHours())).replace(/%M/g,z(d.getMinutes())).replace(/%S/g,z(d.getSeconds())).replace(/%F/g,`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`).replace(/%T/g,d.toTimeString().slice(0,8)).replace(/%s/g,Math.floor(d/1000)).replace(/%A/g,d.toLocaleDateString("en-US",{weekday:"long"})).replace(/%j/g,z(Math.ceil((d-new Date(d.getFullYear(),0,1))/864e5)))+"\n");return 0}
  o(x,d.toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZoneName:"short",year:"numeric"}).replace(/,/g,"")+"\n");return 0};
C.cal=(x)=>{const d=new Date();const first=new Date(d.getFullYear(),d.getMonth(),1).getDay(),days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();let s=`    ${d.toLocaleString("en-US",{month:"long"})} ${d.getFullYear()}\nSu Mo Tu We Th Fr Sa\n`+"   ".repeat(first);for(let i=1;i<=days;i++){s+=String(i).padStart(2)+((first+i)%7?" ":"\n")}o(x,s+"\n");return 0};
C.env=C.printenv=(x,a,name)=>{const sh=x.sh;if(name==="env"&&a.length&&a[0].includes("=")){const k=a.findIndex(s=>!s.includes("="));const saved={...sh.v};a.slice(0,k<0?a.length:k).forEach(s=>{const i=s.indexOf("=");sh.v[s.slice(0,i)]=s.slice(i+1)});try{return k<0?0:LX.runArgv(sh,a.slice(k),x)}finally{sh.v=saved}}
  if(a.length&&name==="printenv"){const v=sh.v[a[0]];if(v==null)return 1;o(x,v+"\n");return 0}o(x,[...sh.exp].filter(k=>sh.v[k]!=null).sort().map(k=>`${k}=${sh.v[k]}`).join("\n")+"\n");return 0};
C.which=(x,a)=>{let rc=0;a.filter(s=>!s.startsWith("-")).forEach(n=>{if(x.sh.aliases[n]){o(x,`alias ${n}='${x.sh.aliases[n]}'\n\t${LX.which(x.sh,x.sh.aliases[n].split(" ")[0])||""}\n`);return}const p=LX.which(x.sh,n);if(p)o(x,p+"\n");else{e(x,`/usr/bin/which: no ${n} in (${x.sh.v.PATH})\n`);rc=1}});return rc};
C.whereis=(x,a)=>{a.forEach(n=>{const p=LX.which(x.sh,n);o(x,`${n}:${p?" "+p:""}${p?` /usr/share/man/man1/${n}.1.gz`:""}\n`)});return 0};
C.whatis=(x,a)=>{let rc=0;a.forEach(n=>{const m=LX.MAN[n];if(m)o(x,`${n} (${m[0]})${" ".repeat(Math.max(1,16-n.length-4))}- ${m[1]}\n`);else{e(x,`${n}: nothing appropriate.\n`);rc=16}});return rc};
C.apropos=(x,a)=>{const q=(a.find(s=>!s.startsWith("-"))||"").toLowerCase();const hits=Object.entries(LX.MAN).filter(([n,m])=>n.includes(q)||m[1].toLowerCase().includes(q));if(!hits.length){e(x,`${q}: nothing appropriate.\n`);return 16}o(x,hits.map(([n,m])=>`${n} (${m[0]})`.padEnd(22)+`- ${m[1]}`).join("\n")+"\n");return 0};
C.man=(x,a)=>{const n=a.filter(s=>!/^-|^\d$/.test(s))[0];if(a[0]==="-k")return C.apropos(x,a.slice(1));if(!n){e(x,"What manual page do you want?\nFor example, try 'man man'.\n");return 1}const m=LX.MAN[n];if(!m){e(x,`No manual entry for ${n}\n`);return 16}
  o(x,`${n.toUpperCase()}(${m[0]})${" ".repeat(20)}User Commands\n\nNAME\n       ${n} - ${m[1]}\n\nSYNOPSIS\n       ${m[2]||n+" [OPTION]..."}\n\nDESCRIPTION\n       ${m[3]||m[1]+"."}\n\n(Simulator: this is a one-screen summary. Real man pages open in a pager: / searches, n jumps to the next match, q quits.)\n`);return 0};
C.info=C.man;
C.tldr=(x,a)=>C.man(x,a);

/* ---------- creating and removing ---------- */
const flagPerm=(x,dir,path)=>LX.can(W(x),U(x),dir,"w")&&LX.can(W(x),U(x),dir,"x")&&LX.traverse(x.sh,path);
C.touch=(x,a)=>{const {p}=opts(a,"dtr");let rc=0;p.forEach(t=>{const path=P(x,t);const n=LX.lookup(W(x),path);if(n){if(!LX.can(W(x),U(x),n,"w")&&W(x).users[U(x)].uid!==n.uid&&!isRoot(x)){e(x,`touch: cannot touch '${t}': Permission denied\n`);rc=1;return}if(n.attr&&n.attr.includes("i")){e(x,`touch: setting times of '${t}': Operation not permitted\n`);rc=1;return}n.m=Date.now();return}
  const err=LX.writeFile(x.sh,path,"");if(err){e(x,`touch: cannot touch '${t}': ${err}\n`);rc=1}});return rc};
C.mkdir=(x,a)=>{const {f,p}=opts(a,"m");const w=W(x);let rc=0;const Us=w.users[U(x)];
  p.forEach(t=>{const path=P(x,t);const mk=(pp)=>{if(LX.lookup(w,pp)){if(pp===path&&!f.p){e(x,`mkdir: cannot create directory '${t}': File exists\n`);rc=1}return true}
      const par=LX.lookup(w,LX.dirname(pp));if(!par){if(f.p){if(!mk(LX.dirname(pp)))return false;return mk(pp)}e(x,`mkdir: cannot create directory '${t}': No such file or directory\n`);rc=1;return false}
      if(!flagPerm(x,par,pp)){e(x,`mkdir: cannot create directory '${t}': Permission denied\n`);rc=1;return false}
      const d=LX.D(f.m?parseInt(f.m,8):(0o777&~x.sh.umask),Us.uid,(par.mode&0o2000)?par.gid:Us.gid);if(par.mode&0o2000)d.mode|=0o2000;if(par.dacl){d.dacl=JSON.parse(JSON.stringify(par.dacl));d.acl=JSON.parse(JSON.stringify(par.dacl))}par.k[LX.basename(pp)]=d;if(f.v)o(x,`mkdir: created directory '${pp}'\n`);return true};mk(path)});return rc};
C.rmdir=(x,a)=>{const {p}=opts(a);let rc=0;p.forEach(t=>{const path=P(x,t);const n=LX.lookup(W(x),path);if(!n){e(x,`rmdir: failed to remove '${t}': No such file or directory\n`);rc=1;return}if(n.t!=="d"){e(x,`rmdir: failed to remove '${t}': Not a directory\n`);rc=1;return}
  if(Object.keys(n.k).length){e(x,`rmdir: failed to remove '${t}': Directory not empty\n`);rc=1;return}const par=LX.parentOf(W(x),path);if(!flagPerm(x,par,path)){e(x,`rmdir: failed to remove '${t}': Permission denied\n`);rc=1;return}delete par.k[LX.basename(path)]});return rc};
function canDelete(x,par,n){const w=W(x);if(!LX.can(w,U(x),par,"w")||!LX.can(w,U(x),par,"x"))return "Permission denied";
  if((par.mode&0o1000)&&!isRoot(x)){const uid=w.users[U(x)].uid;if(n.uid!==uid&&par.uid!==uid)return "Operation not permitted"}
  if(n.attr&&(n.attr.includes("i")||n.attr.includes("a")))return "Operation not permitted";if(par.attr&&par.attr.includes("i"))return "Operation not permitted";return null}
C.rm=(x,a)=>{const {f,p}=opts(a);const w=W(x);let rc=0;const rec=f.r||f.R||f.recursive;
  if(rec&&p.some(t=>P(x,t)==="/"||t==="/*")){flag("rmrf");if(!f["no-preserve-root"]||p.includes("/*")){e(x,"rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe\n");return 1}e(x,"(The simulator refused. Never run this. It deletes every file the account can reach.)\n");return 1}
  if(!p.length){if(!f.f){e(x,"rm: missing operand\nTry 'rm --help' for more information.\n");return 1}return 0}
  p.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path,false);if(!n||!LX.traverse(x.sh,path)){if(!f.f){e(x,`rm: cannot remove '${t}': ${n?"Permission denied":"No such file or directory"}\n`);rc=1}return}
    if(n.t==="d"&&!rec){e(x,`rm: cannot remove '${t}': Is a directory\n`);rc=1;return}
    const par=LX.parentOf(w,path);const err=canDelete(x,par,n);if(err){e(x,`rm: cannot remove '${t}': ${err}\n`);rc=1;return}
    if(n.t==="d"){let bad=null;LX.walk(n,path,(c,pp)=>{if(c.t==="d"&&!isRoot(x)&&(!LX.can(w,U(x),c,"w")||!LX.can(w,U(x),c,"x"))&&Object.keys(c.k).length)bad=bad||pp;if(c.attr&&c.attr.includes("i"))bad=bad||pp});if(bad){e(x,`rm: cannot remove '${bad}': ${isRoot(x)?"Operation not permitted":"Permission denied"}\n`);rc=1;return}}
    if(n.held){const mnt=LX.mountOf(w,path);if(mnt&&w.fs[mnt.src]){w.fs[mnt.src].held=(w.fs[mnt.src].held||0)+n.sz/1073741824;w.deletedOpen=(w.deletedOpen||[]).concat([{path,sz:n.sz,pid:n.held,mnt:mnt.src}])}}
    delete par.k[LX.basename(path)];if(n.nl>1)n.nl--;if(f.v)o(x,`removed '${t}'\n`)});return rc};
C.unlink=(x,a)=>C.rm(x,a.slice(0,1));
function clone(n){const c=JSON.parse(JSON.stringify(n,(k,v)=>k==="gen"||k==="bin"?undefined:v));c.ino=Math.floor(Math.random()*90000)+5000;if(n.gen)c.gen=n.gen;if(n.bin)c.bin=n.bin;return c}
C.cp=(x,a)=>{const {f,p}=opts(a,"t");const w=W(x);if(p.length<2&&!f.t){e(x,`cp: missing destination file operand after '${p[0]||""}'\n`);return 1}
  const dst=f.t||p.pop();const dpath=P(x,dst);const dn=LX.lookup(w,dpath);const toDir=dn&&dn.t==="d";let rc=0;const Us=w.users[U(x)];const pres=f.p||f.a||f.preserve||f.archive;const rec=f.r||f.R||f.a;
  if(p.length>1&&!toDir){e(x,`cp: target '${dst}' is not a directory\n`);return 1}
  p.forEach(s=>{const sp=P(x,s);const sn=LX.lookup(w,sp);if(!sn){e(x,`cp: cannot stat '${s}': No such file or directory\n`);rc=1;return}
    if(sn.t==="d"&&!rec){e(x,`cp: -r not specified; omitting directory '${s}'\n`);rc=1;return}
    if(!LX.can(w,U(x),sn,"r")||!LX.traverse(x.sh,sp)){e(x,`cp: cannot open '${s}' for reading: Permission denied\n`);rc=1;return}
    const tp=toDir?(dpath==="/"?"":dpath)+"/"+LX.basename(sp):dpath;if(tp===sp){e(x,`cp: '${s}' and '${dst}' are the same file\n`);rc=1;return}
    const par=LX.lookup(w,LX.dirname(tp));if(!par){e(x,`cp: cannot create regular file '${dst}': No such file or directory\n`);rc=1;return}
    const ex=LX.lookup(w,tp);if(ex&&ex.t==="f"&&sn.t==="f"){if(!LX.can(w,U(x),ex,"w")){e(x,`cp: cannot create regular file '${tp}': Permission denied\n`);rc=1;return}if(ex.attr&&ex.attr.includes("i")){e(x,`cp: cannot create regular file '${tp}': Operation not permitted\n`);rc=1;return}ex.c=sn.gen?sn.gen(w):sn.c;ex.sz=sn.sz;ex.m=Date.now();if(f.v)o(x,`'${s}' -> '${tp}'\n`);return}
    if(!flagPerm(x,par,tp)){e(x,`cp: cannot create ${sn.t==="d"?"directory":"regular file"} '${tp}': Permission denied\n`);rc=1;return}
    const c=clone(sn);if(sn.gen){c.c=sn.gen(w);delete c.gen}
    LX.walk(c,tp,(z)=>{delete z.ctx;if(!pres){z.uid=Us.uid;z.gid=(par.mode&0o2000)?par.gid:Us.gid;z.mode=z.mode&~x.sh.umask&0o777|(z.t==="d"?0:0);z.m=Date.now();delete z.attr}});
    if(sn.t==="d"&&ex&&ex.t==="d"&&!toDir){Object.assign(ex.k,c.k)}else par.k[LX.basename(tp)]=c;if(f.v)o(x,`'${s}' -> '${tp}'\n`)});return rc};
C.mv=(x,a)=>{const {f,p}=opts(a,"t");const w=W(x);if(p.length<2&&!f.t){e(x,`mv: missing destination file operand after '${p[0]||""}'\n`);return 1}
  const dst=f.t||p.pop();const dpath=P(x,dst);const dn=LX.lookup(w,dpath);const toDir=dn&&dn.t==="d";let rc=0;
  p.forEach(s=>{const sp=P(x,s);const sn=LX.lookup(w,sp,false);if(!sn){e(x,`mv: cannot stat '${s}': No such file or directory\n`);rc=1;return}
    const tp=toDir?(dpath==="/"?"":dpath)+"/"+LX.basename(sp):dpath;const spar=LX.parentOf(w,sp),tpar=LX.lookup(w,LX.dirname(tp));
    if(!tpar){e(x,`mv: cannot move '${s}' to '${dst}': No such file or directory\n`);rc=1;return}
    const err=canDelete(x,spar,sn)||(flagPerm(x,tpar,tp)?null:"Permission denied");if(err){e(x,`mv: cannot move '${s}' to '${tp}': ${err}\n`);rc=1;return}
    if(sp===tp)return;
    /* moving keeps the original SELinux label: the classic mv-vs-cp gotcha */
    LX.walk(sn,sp,(z,pp)=>{if(!z.ctx)z.ctx=LX.defCtx(w,pp)});
    delete spar.k[LX.basename(sp)];tpar.k[LX.basename(tp)]=sn;if(LX.onMove)LX.onMove(w,sp,tp);if(f.v)o(x,`renamed '${s}' -> '${tp}'\n`)});return rc};
C.ln=(x,a)=>{const {f,p}=opts(a);const w=W(x);if(!p.length){e(x,"ln: missing file operand\n");return 1}const tgt=p[0];let lp=p[1]||LX.basename(tgt);let path=P(x,lp);const dn=LX.lookup(w,path);if(dn&&dn.t==="d"&&!LX.lookup(w,path,false)?.t!=="l")path=path+"/"+LX.basename(tgt);
  const par=LX.lookup(w,LX.dirname(path));if(!par){e(x,`ln: failed to create ${f.s?"symbolic ":"hard "}link '${lp}': No such file or directory\n`);return 1}
  if(LX.lookup(w,path,false)){if(!f.f){e(x,`ln: failed to create ${f.s?"symbolic ":"hard "}link '${lp}': File exists\n`);return 1}delete par.k[LX.basename(path)]}
  if(!flagPerm(x,par,path)){e(x,`ln: failed to create symbolic link '${lp}': Permission denied\n`);return 1}
  if(f.s){const l=LX.L(tgt);l.uid=w.users[U(x)].uid;l.gid=w.users[U(x)].gid;par.k[LX.basename(path)]=l;return 0}
  const tn=LX.lookup(w,P(x,tgt));if(!tn){e(x,`ln: failed to access '${tgt}': No such file or directory\n`);return 1}if(tn.t==="d"){e(x,`ln: ${tgt}: hard link not allowed for directory\n`);return 1}
  if(LX.mountOf(w,P(x,tgt))!==LX.mountOf(w,path)){e(x,`ln: failed to create hard link '${lp}' => '${tgt}': Invalid cross-device link\n`);return 1}
  tn.nl=(tn.nl||1)+1;par.k[LX.basename(path)]=tn;return 0};
C.stat=(x,a)=>{const {f,p}=opts(a,"c");const w=W(x);let rc=0;p.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path,!f.L&&false)||LX.lookup(w,path);if(!n){e(x,`stat: cannot statx '${t}': No such file or directory\n`);rc=1;return}
  if(f.c){o(x,f.c.replace(/%a/g,(n.mode&0o7777).toString(8)).replace(/%A/g,LX.modeStr(n)).replace(/%U/g,LX.uidName(w,n.uid)).replace(/%G/g,LX.gidName(w,n.gid)).replace(/%s/g,LX.size(n)).replace(/%n/g,t).replace(/%i/g,n.ino).replace(/%h/g,n.nl||1).replace(/%u/g,n.uid).replace(/%g/g,n.gid).replace(/%F/g,{d:"directory",f:"regular file",l:"symbolic link"}[n.t])+"\n");return}
  const d=new Date(n.m).toISOString().replace("T"," ").replace("Z","");
  o(x,`  File: ${t}${n.t==="l"?" -> "+n.to:""}\n  Size: ${LX.size(n)}\t\tBlocks: ${Math.ceil(LX.size(n)/512)}\t IO Block: 4096   ${{d:"directory",f:LX.size(n)?"regular file":"regular empty file",l:"symbolic link"}[n.t]}\nDevice: fd00h/64768d\tInode: ${n.ino}\tLinks: ${n.t==="d"?2:n.nl||1}\nAccess: (${LX.octal(n.mode)}/${LX.modeStr(n)})  Uid: (${String(n.uid).padStart(5)}/${LX.uidName(w,n.uid).padStart(8)})   Gid: (${String(n.gid).padStart(5)}/${LX.gidName(w,n.gid).padStart(8)})\n${w.selinux.mode!=="disabled"?`Context: unconfined_u:object_r:${LX.ctxOf(w,path,n)}:s0\n`:""}Access: ${d} -0500\nModify: ${d} -0500\nChange: ${d} -0500\n Birth: ${d} -0500\n`)});return rc};
C.file=(x,a)=>{const w=W(x);let rc=0;a.filter(s=>!s.startsWith("-")).forEach(t=>{const path=P(x,t);const ln=LX.lookup(w,path,false);const n=LX.lookup(w,path);if(!ln){o(x,`${t}: cannot open \`${t}' (No such file or directory)\n`);return}
  let d;if(ln.t==="l")d=`symbolic link to ${ln.to}`;else if(n.t==="d")d="directory";else if(n.elf)d="ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, stripped";
  else{const c=n.gen?n.gen(w):n.c;if(/^TAR:/.test(c))d=/\.gz$|\.tgz$/.test(t)?"gzip compressed data, from Unix":/\.bz2$/.test(t)?"bzip2 compressed data, block size = 900k":/\.xz$/.test(t)?"XZ compressed data, checksum CRC64":"POSIX tar archive (GNU)";else if(/^GZ:/.test(c))d="gzip compressed data, from Unix";else if(/^\$ANSIBLE_VAULT/.test(c))d="ASCII text";else if(/^-----BEGIN OPENSSH PRIVATE KEY/.test(c))d="OpenSSH private key";else if(/^ssh-(ed25519|rsa)/.test(c))d="OpenSSH ED25519 public key";else if(/^-----BEGIN PGP/.test(c))d="PGP message";else if(/^LUKS/.test(c))d="LUKS encrypted file, ver 2";
    else if(n.sz&&!c)d=/\.log$/.test(t)?"ASCII text":/\.img$|\.iso$/.test(t)?"ISO 9660 CD-ROM filesystem data":/\.qcow2$/.test(t)?"QEMU QCOW2 Image (v3)":"data";else if(!c)d="empty";
    else{const sb=c.match(/^#!\s*(\S+)(?:\s+(\S+))?/);d=sb?`${/bash/.test(sb[0])?"Bourne-Again shell":/python/.test(sb[0])?"Python":/sh$/.test(sb[1])?"POSIX shell":"a "+sb[1]} script, ASCII text executable`:/\r\n/.test(c)?"ASCII text, with CRLF line terminators":/^[\x00-\x7f]*$/.test(c)?"ASCII text":"UTF-8 Unicode text";if(/\r\n/.test(c)&&sb)d+=", with CRLF line terminators"}}
  o(x,`${t}: ${d}\n`)});return rc};

/* ---------- permissions and ownership ---------- */
function applyMode(cur,spec,isDir){if(/^[0-7]{1,4}$/.test(spec)){let m=parseInt(spec,8);if(spec.length<=3&&isDir)m|=cur&0o6000;return m}
  let m=cur;for(const cl of spec.split(",")){const mm=cl.match(/^([ugoa]*)([-+=])([rwxXst]*|[ugo])$/);if(!mm)return null;let who=mm[1]||"a";if(who.includes("a"))who="ugo";
    let bits=0;const perms=mm[3];if(/^[ugo]$/.test(perms)){const sh={u:6,g:3,o:0}[perms];const v=(cur>>sh)&7;for(const w of who)bits|=v<<{u:6,g:3,o:0}[w]}
    else for(const w of who){const s={u:6,g:3,o:0}[w];for(const p of perms){if(p==="r")bits|=4<<s;if(p==="w")bits|=2<<s;if(p==="x"||p==="X"&&(isDir||cur&0o111))bits|=1<<s;if(p==="s"&&w==="u")bits|=0o4000;if(p==="s"&&w==="g")bits|=0o2000;if(p==="t")bits|=0o1000}}
    if(mm[2]==="+")m|=bits;else if(mm[2]==="-")m&=~bits;else{let clear=0;for(const w of who){clear|=7<<{u:6,g:3,o:0}[w];if(w==="u")clear|=0o4000;if(w==="g")clear|=0o2000;if(w==="o")clear|=0o1000}m=(m&~clear)|bits}}
  return m}
LX.applyMode=applyMode;
C.chmod=(x,a)=>{const w=W(x);const R=a.includes("-R")||a.includes("--recursive");const v=a.includes("-v");const p=a.filter(s=>!/^(-R|--recursive|-v|-c|-f)$/.test(s));const spec=p.shift();if(!spec||!p.length){e(x,"chmod: missing operand\n");return 1}
  if(/777/.test(spec)||/^a?\+rwx$/.test(spec)||/^o\+w/.test(spec))flag("c777");let rc=0;const uid=w.users[U(x)].uid;
  p.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`chmod: cannot access '${t}': No such file or directory\n`);rc=1;return}
    const doOne=(z,zp)=>{if(z.t==="l")return;if(uid!==0&&z.uid!==uid){e(x,`chmod: changing permissions of '${zp}': Operation not permitted\n`);rc=1;return}if(z.attr&&z.attr.includes("i")){e(x,`chmod: changing permissions of '${zp}': Operation not permitted\n`);rc=1;return}
      const m=applyMode(z.mode,spec,z.t==="d");if(m===null){e(x,`chmod: invalid mode: '${spec}'\n`);rc=1;return}if(v)o(x,`mode of '${zp}' changed from ${LX.octal(z.mode)} (${LX.modeStr(z).slice(1)}) to ${LX.octal(m)}\n`);z.mode=m;if(z.acl&&z.acl.mask!=null)z.acl.mask=(m>>3)&7};
    if(R)LX.walk(n,path,(z,zp)=>doOne(z,zp));else doOne(n,t)});return rc};
C.chown=C.chgrp=(x,a,name)=>{const w=W(x);const R=a.includes("-R");const v=a.includes("-v");const p=a.filter(s=>!/^(-R|-v|-h|-c|-f|--recursive)$/.test(s));const spec=p.shift();if(!spec||!p.length){e(x,`${name}: missing operand\n`);return 1}
  let us=null,gs=null;if(name==="chgrp")gs=spec;else{const m=spec.split(/[:.]/);us=m[0]||null;gs=m.length>1?(m[1]||(us?w.users[us]&&LX.gidName(w,w.users[us].gid):null)):null}
  if(us&&!w.users[us]&&!/^\d+$/.test(us)){e(x,`chown: invalid user: '${spec}'\n`);return 1}if(gs&&!w.groups[gs]&&!/^\d+$/.test(gs)){e(x,`${name}: invalid group: '${spec}'\n`);return 1}
  const me=w.users[U(x)];let rc=0;
  p.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`${name}: cannot access '${t}': No such file or directory\n`);rc=1;return}
    const one=(z,zp)=>{if(me.uid!==0){if(us&&us!==U(x)||z.uid!==me.uid||gs&&!LX.userGids(w,U(x)).includes(w.groups[gs]?.gid)){e(x,`${name}: changing ${us?"ownership":"group"} of '${zp}': Operation not permitted\n`);rc=1;return}}
      if(us)z.uid=w.users[us]?w.users[us].uid:+us;if(gs)z.gid=w.groups[gs]?w.groups[gs].gid:+gs;if(v)o(x,`changed ownership of '${zp}' to ${spec}\n`);if(z.t==="f"&&us&&me.uid!==0)z.mode&=~0o6000};
    if(R)LX.walk(n,path,one);else one(n,t)});return rc};
C.setfacl=(x,a)=>{const w=W(x);let rc=0;const R=a.includes("-R");let mode=null,spec=null;const files=[];
  for(let k=0;k<a.length;k++){const s=a[k];if(s==="-m"||s==="-x"||s==="-M"){mode=s;spec=a[++k]}else if(s==="-b"||s==="-k")mode=s;else if(s==="-d"||s==="-R"||s==="-n")continue;else if(s.startsWith("-m")){mode="-m";spec=s.slice(2)}else files.push(s)}
  const dflt=a.includes("-d");
  files.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`setfacl: ${t}: No such file or directory\n`);rc=1;return}if(w.users[U(x)].uid!==0&&n.uid!==w.users[U(x)].uid){e(x,`setfacl: ${t}: Operation not permitted\n`);rc=1;return}
    const one=z=>{const key=dflt?"dacl":"acl";if(mode==="-b"){delete z.acl;delete z.dacl;return}if(mode==="-k"){delete z.dacl;return}
      const A=z[key]=z[key]||{u:{},g:{},mask:null};
      for(const ent of spec.split(",")){let m=ent.trim().match(/^(d(?:efault)?:)?(u|user|g|group|m|mask|o|other):([^:]*):?([rwxX-]*)$/);if(!m){e(x,`setfacl: Option ${mode}: Invalid argument near character 1\n`);rc=1;return}
        if(m[1]){const D2=z.dacl=z.dacl||{u:{},g:{},mask:null};const bits=[...m[4]].reduce((v,c)=>v|({r:4,w:2,x:1,X:1}[c]||0),0);const ty=m[2][0];if(ty==="u"&&m[3])D2.u[m[3]]=bits;if(ty==="g"&&m[3])D2.g[m[3]]=bits;continue}
        const ty=m[2][0],q=m[3];const bits=[...m[4]].reduce((v,c)=>v|({r:4,w:2,x:1,X:1}[c]||0),0);
        if(ty==="u"&&q&&!w.users[q]){e(x,`setfacl: Option ${mode}: Invalid argument near character 3\n`);rc=1;return}if(ty==="g"&&q&&!w.groups[q]){e(x,`setfacl: Option ${mode}: Invalid argument near character 3\n`);rc=1;return}
        if(mode==="-x"){if(ty==="u")delete A.u[q];if(ty==="g")delete A.g[q];continue}
        if(ty==="u"&&q)A.u[q]=bits;else if(ty==="u")z.mode=(z.mode&~0o700)|(bits<<6);else if(ty==="g"&&q)A.g[q]=bits;else if(ty==="g")z.mode=(z.mode&~0o070)|(bits<<3);else if(ty==="o")z.mode=(z.mode&~0o007)|bits;else if(ty==="m")A.mask=bits}
      if(!dflt){if(A.mask==null||!/m(ask)?:/.test(spec)){let mk=(z.mode>>3)&7;Object.values(A.u).forEach(v=>mk|=v);Object.values(A.g).forEach(v=>mk|=v);A.mask=mk}
        if(!Object.keys(A.u).length&&!Object.keys(A.g).length)delete z.acl;else z.mode=(z.mode&~0o070)|(A.mask<<3)}};
    if(R)LX.walk(n,path,one);else one(n)});return rc};
C.getfacl=(x,a)=>{const w=W(x);let rc=0;a.filter(s=>!s.startsWith("-")).forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`getfacl: ${t}: No such file or directory\n`);rc=1;return}
  const r=b=>(b&4?"r":"-")+(b&2?"w":"-")+(b&1?"x":"-");const A=n.acl;const mask=A?A.mask:null;let s=`# file: ${path.slice(1)}\n# owner: ${LX.uidName(w,n.uid)}\n# group: ${LX.gidName(w,n.gid)}\n`;if(n.mode&0o7000)s+=`# flags: ${n.mode&0o4000?"s":"-"}${n.mode&0o2000?"s":"-"}${n.mode&0o1000?"t":"-"}\n`;
  s+=`user::${r(n.mode>>6)}\n`;if(A)Object.entries(A.u).forEach(([u,b])=>s+=`user:${u}:${r(b)}${mask!=null&&(b&~mask)?`\t\t#effective:${r(b&mask)}`:""}\n`);
  s+=`group::${r(A?((n.mode>>3)&7)|0:(n.mode>>3))}\n`.replace(/group::(...)\n/,(m,g)=>m);if(A)Object.entries(A.g).forEach(([g,b])=>s+=`group:${g}:${r(b)}\n`);if(A)s+=`mask::${r(mask)}\n`;s+=`other::${r(n.mode)}\n`;
  if(n.dacl){const D2=n.dacl;s+=`default:user::${r(n.mode>>6)}\n`;Object.entries(D2.u).forEach(([u,b])=>s+=`default:user:${u}:${r(b)}\n`);s+=`default:group::${r(n.mode>>3)}\n`;Object.entries(D2.g).forEach(([g,b])=>s+=`default:group:${g}:${r(b)}\n`);s+=`default:mask::rwx\ndefault:other::${r(n.mode)}\n`}
  o(x,s+"\n")});return rc};
C.chattr=(x,a)=>{const w=W(x);if(!isRoot(x)){e(x,`chattr: Operation not permitted while setting flags on ${a[a.length-1]}\n`);return 1}const spec=a.find(s=>/^[-+=][aiAcdeSu]+$/.test(s));const files=a.filter(s=>s!==spec&&s!=="-R");if(!spec){e(x,"chattr: usage: chattr [-R] [-+=aAcCdDeijPsStTuF] files...\n");return 1}let rc=0;
  files.forEach(t=>{const n=LX.lookup(w,P(x,t));if(!n){e(x,`chattr: No such file or directory while trying to stat ${t}\n`);rc=1;return}let s=n.attr||"";const fl=spec.slice(1);if(spec[0]==="+")for(const c of fl){if(!s.includes(c))s+=c}else if(spec[0]==="-")s=[...s].filter(c=>!fl.includes(c)).join("");else s=fl;n.attr=s});return rc};
C.lsattr=(x,a)=>{const w=W(x);const p=a.filter(s=>!s.startsWith("-"));const show=(n,t)=>{const s=n.attr||"";o(x,`${["s","u","S","D","i","a","d","A","c","E","j","I","t","T","e"].map(c=>s.includes(c)?c:"-").join("").replace(/-{0}$/,"")}${s.includes("e")?"":"--"} ${t}\n`.replace("----------------","--------------e-").replace(/^(.{14})--/,"$1e-"))};
  (p.length?p:["."]).forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`lsattr: No such file or directory while trying to stat ${t}\n`);return}if(n.t==="d"&&!a.includes("-d"))Object.entries(n.k).filter(([k])=>!k.startsWith(".")).forEach(([k,c])=>show(c,(t==="."?".":t)+"/"+k));else show(n,t)});return 0};

/* ---------- searching ---------- */
const POSIX=s=>s.replace(/\[:digit:\]/g,"0-9").replace(/\[:alpha:\]/g,"a-zA-Z").replace(/\[:alnum:\]/g,"a-zA-Z0-9").replace(/\[:upper:\]/g,"A-Z").replace(/\[:lower:\]/g,"a-z").replace(/\[:space:\]/g,"\\s").replace(/\[:punct:\]/g,"!-\\/:-@\\[-`{-~").replace(/\[:xdigit:\]/g,"0-9A-Fa-f").replace(/\[:blank:\]/g," \\t");
function bre2js(p){let o2="";for(let i=0;i<p.length;i++){const c=p[i];if(c==="\\"&&i+1<p.length){const n=p[i+1];if("(){}|+?".includes(n)){o2+=n;i++;continue}o2+=c+n;i++;continue}if("(){}|+?".includes(c)){o2+="\\"+c;continue}o2+=c}return o2}
LX.mkRe=(p,ere,flags)=>{p=POSIX(p);if(!ere)p=bre2js(p);p=p.replace(/\\</g,"\\b").replace(/\\>/g,"\\b");return new RegExp(p,flags)};
C.grep=C.egrep=C.fgrep=(x,a,name)=>{const {f,p}=opts(a,"eABCm",["include","exclude","color"]);const w=W(x);const ere=f.E||name==="egrep"||f.P;const fixed=f.F||name==="fgrep";
  let pat=f.e!=null?f.e:p.shift();if(pat==null){e(x,"Usage: grep [OPTION]... PATTERNS [FILE]...\n");return 2}
  let re;try{let src=fixed?pat.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"):pat;if(f.w)src="\\b(?:"+(fixed||ere?src:bre2js(POSIX(src)))+")\\b";re=fixed||f.w?new RegExp(src,f.i?"i":""):LX.mkRe(src,ere,f.i?"i":"")}catch(err){e(x,`grep: Invalid regular expression\n`);return 2}
  const files=[];let rc=1,errs=0;const rec=f.r||f.R;
  if(!p.length){if(rec)p.push(".");else files.push({name:"(standard input)",c:stdin(x)})}
  p.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`grep: ${t}: No such file or directory\n`);errs++;return}
    if(n.t==="d"){if(!rec){e(x,`grep: ${t}: Is a directory\n`);return}LX.walk(n,path,(z,zp)=>{if(z.t!=="f")return;const rel=t.replace(/\/$/,"")+zp.slice(path.length);if(f.include&&!LX.globRe(f.include).test(LX.basename(zp)))return;
      if(!LX.can(w,U(x),z,"r")){if(!f.s)e(x,`grep: ${rel}: Permission denied\n`);errs++;return}files.push({name:rel,c:z.gen?z.gen(w):z.c})});return}
    const r=LX.readFile(x.sh,path);if(r.err){if(!f.s)e(x,`grep: ${t}: ${r.err}\n`);errs++;return}files.push({name:t,c:r.c})});
  const many=files.length>1||rec;let out="";const A=+(f.A||f.C||0),Bn=+(f.B||f.C||0);
  files.forEach(z=>{const L=lines(z.c);let hits=0;const shown=new Set();const pre=(i,sep)=>(many&&!f.h?z.name+sep:"")+(f.n?(i+1)+sep:"");
    L.forEach((l,i)=>{const m=re.test(l);if(m!==!!f.v){hits++;if(f.l||f.c||f.q||f.L)return;if(f.m&&hits>+f.m)return;
      if(f.o&&!f.v){const g=new RegExp(re.source,re.flags+"g");(l.match(g)||[]).forEach(mm=>out+=pre(i,":")+mm+"\n");return}
      for(let k=Math.max(0,i-Bn);k<i;k++)if(!shown.has(k)){shown.add(k);out+=pre(k,"-")+L[k]+"\n"}if(!shown.has(i)){shown.add(i);out+=pre(i,":")+l+"\n"}
      for(let k=i+1;k<=Math.min(L.length-1,i+A);k++)if(!shown.has(k)&&re.test(L[k])===!!f.v){shown.add(k);out+=pre(k,"-")+L[k]+"\n"}}});
    if(hits)rc=0;if(f.c)out+=(many?z.name+":":"")+hits+"\n";if(f.l&&hits)out+=z.name+"\n";if(f.L&&!hits)out+=z.name+"\n"});
  if(!f.q)o(x,out);return errs&&rc?2:rc};
LX.SBIN.add("find");LX.SBIN.delete("find");
C.find=(x,a)=>{const w=W(x);let k=0;const starts=[];while(k<a.length&&!/^[-!(]/.test(a[k]))starts.push(a[k++]);if(!starts.length)starts.push(".");
  const ex=a.slice(k);let maxd=Infinity,mind=0;const groups=[[]];let actions=[];
  for(let i=0;i<ex.length;i++){const t=ex[i];const g=groups[groups.length-1];
    if(t==="-o"||t==="-or"){groups.push([]);continue}if(t==="-a"||t==="-and"||t==="("||t===")")continue;
    let neg=false;let tt=t;if(t==="!"||t==="-not"){neg=true;tt=ex[++i]}
    const val=()=>ex[++i];
    const add=fn=>g.push(neg?(...z)=>!fn(...z):fn);
    switch(tt){case "-maxdepth":maxd=+val();break;case "-mindepth":mind=+val();break;
      case "-name":{const re=LX.globRe(val());add((n,p)=>re.test(LX.basename(p)));break}
      case "-iname":{const v=val();const re=new RegExp(LX.globRe(v).source,"i");add((n,p)=>re.test(LX.basename(p)));break}
      case "-path":case "-wholename":{const re=LX.globRe(val());add((n,p,disp)=>re.test(disp));break}
      case "-type":{const v=val();add(n=>({f:"f",d:"d",l:"l"})[v]===n.t);break}
      case "-user":{const v=val();add(n=>LX.uidName(w,n.uid)===v||String(n.uid)===v);break}
      case "-group":{const v=val();add(n=>LX.gidName(w,n.gid)===v||String(n.gid)===v);break}
      case "-uid":{const v=+val();add(n=>n.uid===v);break}
      case "-nouser":add(n=>!Object.values(w.users).some(u=>u.uid===n.uid));break;
      case "-nogroup":add(n=>!Object.values(w.groups).some(g2=>g2.gid===n.gid));break;
      case "-perm":{let v=val();let mode="exact";if(v[0]==="-"){mode="all";v=v.slice(1)}else if(v[0]==="/"){mode="any";v=v.slice(1)}const m=/^[0-7]+$/.test(v)?parseInt(v,8):LX.applyMode(0,v,false);
        add(n=>{const nm=n.mode&0o7777;return mode==="exact"?nm===m:mode==="all"?(nm&m)===m:(nm&m)!==0});break}
      case "-size":{const v=val();const mm=v.match(/^([+-]?)(\d+)([ckMG]?)$/);const mult={c:1,k:1024,M:1048576,G:1073741824,"":512}[mm[3]];const want=+mm[2];
        add(n=>{if(n.t!=="f")return false;const s=Math.ceil(LX.size(n)/mult);return mm[1]==="+"?s>want:mm[1]==="-"?s<want:s===want});break}
      case "-mtime":case "-mmin":case "-atime":case "-ctime":{const v=val();const days=n=>(n.age||0);add(n=>v.startsWith("+")?days(n)>+v.slice(1):v.startsWith("-")?days(n)<+v.slice(1):days(n)===+v);break}
      case "-newer":{const r=LX.lookup(w,P(x,val()));add(n=>r&&n.m>r.m);break}
      case "-empty":add(n=>n.t==="d"?!Object.keys(n.k).length:LX.size(n)===0);break;
      case "-executable":add(n=>LX.can(w,U(x),n,"x"));break;
      case "-print":case "-print0":break;
      case "-ls":actions.push({ls:true});break;
      case "-delete":actions.push({del:true});break;
      case "-exec":case "-ok":{const cmd=[];i++;while(i<ex.length&&ex[i]!==";"&&ex[i]!=="\\;"&&ex[i]!=="+")cmd.push(ex[i++]);actions.push({exec:cmd,plus:ex[i]==="+"});break}
      default:e(x,`find: unknown predicate '${tt}'\n`);return 1}}
  const match=(n,p,disp)=>groups.some(g=>g.every(fn=>fn(n,p,disp)));let out="",rc=0;const hits=[];
  starts.forEach(st=>{const root=P(x,st);const rn=LX.lookup(w,root);if(!rn){e(x,`find: '${st}': No such file or directory\n`);rc=1;return}
    const visit=(n,p,disp,d)=>{if(d>=mind&&match(n,p,disp))hits.push([n,p,disp]);if(n.t==="d"&&d<maxd){if(!LX.can(w,U(x),n,"r")||!LX.can(w,U(x),n,"x")){if(d>0||true){e(x,`find: '${disp}': Permission denied\n`);rc=1}return}
      Object.keys(n.k).sort().forEach(k2=>{const c=n.k[k2];visit(c,(p==="/"?"":p)+"/"+k2,(disp==="/"?"":disp.replace(/\/$/,""))+"/"+k2,d+1)})}};
    visit(rn,root,st,0)});
  if(!actions.length){o(x,hits.map(h=>h[2]).join("\n")+(hits.length?"\n":""));return rc}
  actions.forEach(ac=>{if(ac.del)hits.slice().reverse().forEach(h=>{if(h[1]==="/")return;C.rm(x,["-rf",h[1]])});
    if(ac.ls)hits.forEach(h=>o(x,fmtLong([lsLong(x,h[0],h[2],{},h[1])],{})));
    if(ac.exec){if(ac.plus)LX.runArgv(x.sh,ac.exec.flatMap(z=>z==="{}"?hits.map(h=>h[2]):[z]),x);else hits.forEach(h=>LX.runArgv(x.sh,ac.exec.map(z=>z.replace(/\{\}/g,h[2])),x))}});return rc};
C.locate=(x,a)=>{const q=a.filter(s=>!s.startsWith("-"))[0]||"";const w=W(x);const out=[];LX.walk(w.root,"/",(n,p)=>{if(p.includes(q)&&!p.startsWith("/proc"))out.push(p)});o(x,out.slice(0,60).join("\n")+(out.length?"\n":""));return out.length?0:1};
C.xargs=(x,a)=>{const {f,p}=opts(a,"nIid");const s=stdin(x);const items=f.d?s.split(f.d):(f.I?lines(s):s.split(/\s+/).filter(Boolean));const cmd=p.length?p:["echo"];let rc=0;
  if(f.I){items.forEach(it=>{rc=LX.runArgv(x.sh,cmd.map(z=>z.split(f.I).join(it)),x)||rc});return rc}
  const n=f.n?+f.n:items.length||1;if(!items.length&&!f.r){if(f.r)return 0}for(let i=0;i<Math.max(items.length,1);i+=n){rc=LX.runArgv(x.sh,[...cmd,...items.slice(i,i+n)],x)||rc;if(!items.length)break}return rc};
C.diff=(x,a)=>{const {f,p}=opts(a);if(p.length<2){e(x,"diff: missing operand\n");return 2}const r=readAll(x,p.slice(0,2),"diff");if(r.rc)return 2;const A=lines(r.out[0].c),Bl=lines(r.out[1].c);
  if(A.join("\n")===Bl.join("\n"))return 0;if(f.q){o(x,`Files ${p[0]} and ${p[1]} differ\n`);return 1}
  /* LCS diff */const m=A.length,n=Bl.length;const T=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)T[i][j]=A[i]===Bl[j]?T[i+1][j+1]+1:Math.max(T[i+1][j],T[i][j+1]);
  const ops=[];let i=0,j=0;while(i<m||j<n){if(i<m&&j<n&&A[i]===Bl[j]){ops.push([" ",A[i],i,j]);i++;j++}else if(j<n&&(i>=m||T[i][j+1]>=T[i+1][j])){ops.push(["+",Bl[j],i,j]);j++}else{ops.push(["-",A[i],i,j]);i++}}
  if(f.u){let s=`--- ${p[0]}\n+++ ${p[1]}\n@@ -1,${m} +1,${n} @@\n`;ops.forEach(z=>s+=z[0]+z[1]+"\n");o(x,s);return 1}
  let s="";for(let k=0;k<ops.length;){if(ops[k][0]===" "){k++;continue}const st=k;while(k<ops.length&&ops[k][0]!==" ")k++;const blk=ops.slice(st,k);const dels=blk.filter(z=>z[0]==="-"),adds=blk.filter(z=>z[0]==="+");
    const rng=(lo,cnt)=>cnt>1?`${lo+1},${lo+cnt}`:`${lo+(cnt?1:0)}`;const ai=blk[0][2],bj=blk[0][3];
    s+=`${dels.length?rng(ai,dels.length):ai}${dels.length&&adds.length?"c":dels.length?"d":"a"}${adds.length?rng(bj,adds.length):bj}\n`;dels.forEach(z=>s+="< "+z[1]+"\n");if(dels.length&&adds.length)s+="---\n";adds.forEach(z=>s+="> "+z[1]+"\n")}
  o(x,s);return 1};
C.cmp=(x,a)=>{const r=readAll(x,a.slice(0,2),"cmp");if(r.rc)return 2;if(r.out[0].c===r.out[1].c)return 0;let i=0;while(r.out[0].c[i]===r.out[1].c[i])i++;o(x,`${a[0]} ${a[1]} differ: byte ${i+1}, line ${r.out[0].c.slice(0,i).split("\n").length}\n`);return 1};
C.du=(x,a)=>{const {f,p}=opts(a,"d",["max-depth"]);const w=W(x);const T=p.length?p:["."];let rc=0;const md=f.d!=null?+f.d:f["max-depth"]!=null?+f["max-depth"]:(f.s?0:Infinity);
  const sz=n=>{let s=0;LX.walk(n,"",z=>s+=z.t==="d"?4096:LX.size(z));return s};const fmtS=b=>f.h?human(b):String(Math.ceil(b/1024));const rows=[];
  T.forEach(t=>{const path=P(x,t);const n=LX.lookup(w,path);if(!n){e(x,`du: cannot access '${t}': No such file or directory\n`);rc=1;return}
    const rec=(z,disp,d)=>{if(z.t==="d"){if(!LX.can(w,U(x),z,"r")){e(x,`du: cannot read directory '${disp}': Permission denied\n`);rc=1;return}if(d<md)Object.entries(z.k).forEach(([k,c])=>{if(c.t==="d"||f.a)rec(c,disp.replace(/\/$/,"")+"/"+k,d+1)})}
      if(d<=md)rows.push([sz(z),disp])};rec(n,t,0)});
  let list=rows;if(f.s)list=rows.filter(r=>T.includes(r[1]));o(x,list.map(r=>fmtS(r[0])+"\t"+r[1]).join("\n")+"\n");if(f.c)o(x,fmtS(list.reduce((s,r)=>s+r[0],0))+"\ttotal\n");return rc};

/* ---------- sed ---------- */
C.sed=(x,a)=>{const w=W(x);const scripts=[];let inplace=null,quiet=false,ere=false;const files=[];
  for(let k=0;k<a.length;k++){const s=a[k];if(s==="-e"){scripts.push(a[++k]);continue}if(s==="-n"||s==="--quiet"){quiet=true;continue}if(s==="-E"||s==="-r"){ere=true;continue}
    if(/^-i/.test(s)){inplace=s.slice(2)||"";continue}if(/^-[nEr]+$/.test(s)){if(s.includes("n"))quiet=true;if(/[Er]/.test(s))ere=true;continue}if(/^-[nEr]*i/.test(s)){inplace="";if(s.includes("n"))quiet=true;if(/[Er]/.test(s))ere=true;continue}
    if(!scripts.length&&!s.startsWith("-")){scripts.push(s);continue}files.push(s)}
  if(!scripts.length){e(x,"Usage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...\n");return 1}
  let cmds;try{cmds=parseSed(scripts.join("\n"),ere)}catch(err){e(x,`sed: -e expression #1, char 1: ${err.message}\n`);return 1}
  const run=src=>{const L=lines(src);let out=[];const rng=cmds.map(()=>false);let quit=false;
    for(let i=0;i<L.length&&!quit;i++){let line=L[i];let del=false;const extra=[],before=[];
      for(let ci=0;ci<cmds.length;ci++){const c=cmds[ci];const at=ad=>ad.t==="n"?i+1===ad.v:ad.t==="$"?i===L.length-1:ad.re.test(line);
        let on=true;if(c.a1&&!c.a2)on=at(c.a1);else if(c.a1&&c.a2){if(rng[ci]){on=true;if(at(c.a2))rng[ci]=false}else if(at(c.a1)){on=true;rng[ci]=!(c.a2.t==="n"&&c.a2.v<=i+1)}else on=false}
        if(c.neg)on=!on;if(!on)continue;
        if(c.c==="d"){del=true;break}if(c.c==="p")extra.push(line);if(c.c==="q"){quit=true;break}if(c.c==="="){extra.push(String(i+1))}
        if(c.c==="s"){const nl=line.replace(c.re,c.rep);if(nl!==line&&c.p)extra.push(nl);line=nl}
        if(c.c==="a")after(c.text);if(c.c==="i")before.push(c.text);if(c.c==="c"){line=c.text;}
        if(c.c==="y"){line=[...line].map(ch=>{const k2=c.from.indexOf(ch);return k2<0?ch:c.to[k2]}).join("")}}
      function after(t){extra.push(t)}
      out.push(...before);if(!del&&!quiet)out.push(line);out.push(...extra)}
    return out.length?out.join("\n")+"\n":""};
  if(!files.length){o(x,run(stdin(x)));return 0}
  let rc=0;files.forEach(fl=>{const path=P(x,fl);const r=LX.readFile(x.sh,path);if(r.err){e(x,`sed: can't read ${fl}: ${r.err}\n`);rc=2;return}const res=run(r.c);
    if(inplace!==null){if(inplace)LX.writeFile(x.sh,path+inplace,r.c);const err=LX.writeFile(x.sh,path,res);if(err){e(x,`sed: couldn't open temporary file ${LX.dirname(path)}/sedXYZ: ${err}\n`);rc=4}}else o(x,res)});return rc};
function parseSed(src,ere){const cmds=[];let i=0;const s=src;
  const addr=()=>{if(s[i]==="$"){i++;return {t:"$"}}if(/\d/.test(s[i])){let n="";while(/\d/.test(s[i]))n+=s[i++];return {t:"n",v:+n}}
    if(s[i]==="/"||s[i]==="\\"){const d=s[i]==="\\"?s[++i]:"/";i++;let r="";while(i<s.length&&s[i]!==d){if(s[i]==="\\"&&s[i+1]===d){r+=d;i+=2;continue}r+=s[i++]}i++;return {t:"re",re:LX.mkRe(r,ere,"")}}return null};
  while(i<s.length){while(/[\s;]/.test(s[i]||""))i++;if(i>=s.length)break;const c={};c.a1=addr();if(c.a1&&s[i]===","){i++;c.a2=addr()}while(s[i]===" ")i++;if(s[i]==="!"){c.neg=true;i++}
    c.c=s[i++];if(!c.c)throw new Error("missing command");
    if(c.c==="s"||c.c==="y"){const d=s[i++];const part=()=>{let r="";while(i<s.length&&s[i]!==d){if(s[i]==="\\"&&s[i+1]===d){r+=d;i+=2;continue}if(s[i]==="\\"&&i+1<s.length){r+=s[i]+s[i+1];i+=2;continue}r+=s[i++]}if(s[i]!==d)throw new Error(`unterminated \`${c.c}' command`);i++;return r};
      const pat=part(),rep=part();if(c.c==="y"){c.from=pat;c.to=rep;cmds.push(c);continue}let fl="";while(i<s.length&&/[gipI0-9w]/.test(s[i]))fl+=s[i++];
      c.re=LX.mkRe(pat,ere,(fl.includes("g")?"g":"")+(/[iI]/.test(fl)?"i":""));c.p=fl.includes("p");c.rep=rep.replace(/\\(\d)/g,"$$$1").replace(/&/g,"$$&").replace(/\\&/g,"&").replace(/\\n/g,"\n").replace(/\\t/g,"\t")}
    else if("aic".includes(c.c)){while(s[i]===" "||s[i]==="\\")i++;let t="";while(i<s.length&&s[i]!=="\n")t+=s[i++];c.text=t}
    else if(!"dpq=".includes(c.c))throw new Error(`unknown command: \`${c.c}'`);
    cmds.push(c)}
  return cmds}

/* ---------- awk (a teaching subset) ---------- */
C.awk=C.gawk=(x,a)=>{let FS=null;const vars={};let prog=null;const files=[];
  for(let k=0;k<a.length;k++){const s=a[k];if(s==="-F"){FS=a[++k];continue}if(s.startsWith("-F")){FS=s.slice(2);continue}if(s==="-v"){const [n,...v]=a[++k].split("=");vars[n]=v.join("=");continue}if(prog===null){prog=s;continue}files.push(s)}
  if(prog===null){e(x,"usage: awk [-F fs][-v var=value][prog | -f progfile][file ...]\n");return 2}
  let rules;try{rules=compileAwk(prog)}catch(err){e(x,`awk: syntax error in your program near: ${err.message}\n`);return 2}
  const V=new Proxy(Object.assign({},vars),{get:(t,k)=>k in t?t[k]:(typeof k==="string"?"":undefined)});
  let out="";const env={V,NR:0,NF:0,FS:FS==="t"?"\t":FS,OFS:" ",F:[],out:s=>out+=s};
  const r=readAll(x,files,"awk");
  try{rules.filter(z=>z.begin).forEach(z=>z.fn(env));
    r.out.forEach(z=>lines(z.c).forEach(line=>{env.NR++;env.$0=line;env.F=[line,...(env.FS?line.split(env.FS.length===1?env.FS:new RegExp(env.FS)):line.trim().split(/\s+/).filter(Boolean))];env.NF=env.F.length-1;
      rules.filter(z=>!z.begin&&!z.end).forEach(z=>{if(z.test(env))z.fn(env)})}));
    rules.filter(z=>z.end).forEach(z=>z.fn(env))}catch(err){if(err!=="exit"){e(x,`awk: ${err.message||err}\n`);o(x,out);return 2}}
  o(x,out);return r.rc};
function compileAwk(src){const rules=[];let i=0;const s=src;
  const block=()=>{let d=0,st=i;for(;i<s.length;i++){if(s[i]==='"'){i++;while(i<s.length&&s[i]!=='"'){if(s[i]==="\\")i++;i++}continue}if(s[i]==="{")d++;if(s[i]==="}"){d--;if(!d){i++;return s.slice(st+1,i-1)}}}throw new Error(s.slice(st,st+20))};
  while(i<s.length){while(/[\s;]/.test(s[i]||""))i++;if(i>=s.length)break;let pat="";
    if(s.startsWith("BEGIN",i)){i+=5;while(s[i]===" ")i++;rules.push({begin:true,fn:awkFn(block())});continue}
    if(s.startsWith("END",i)){i+=3;while(s[i]===" ")i++;rules.push({end:true,fn:awkFn(block())});continue}
    while(i<s.length&&s[i]!=="{"){if(s[i]==="/"&&(pat.trim()===""||/[~(!&|]\s*$/.test(pat))){let r="/";i++;while(i<s.length&&s[i]!=="/"){if(s[i]==="\\"){r+=s[i++]}r+=s[i++]}r+="/";i++;pat+=r;continue}pat+=s[i++]}
    const act=s[i]==="{"?block():"print";rules.push({test:pat.trim()?awkExpr(pat.trim()):()=>true,fn:awkFn(act)})}
  return rules}
const AWK_FN={length:"((s)=>String(s===undefined?E.$0:s).length)",toupper:"(s=>String(s).toUpperCase())",tolower:"(s=>String(s).toLowerCase())",substr:"((s,a,b)=>String(s).substr(a-1,b))",int:"(v=>Math.trunc(+v))",index:"((s,t)=>String(s).indexOf(t)+1)",sqrt:"Math.sqrt",split:"((s,arr,sep)=>{const p=String(s).split(sep||' ');p.forEach((v,i)=>arr[i+1]=v);return p.length})",sprintf:"E.sprintf",gsub:"E.gsub",sub:"E.sub"};
function awkTok(src){/* translate an awk expression to JS */let out="",i=0;const s=src;let prevOperand=false;
  const emitOperand=t=>{if(prevOperand)out+='+""+';out+=t;prevOperand=true};
  while(i<s.length){const c=s[i];
    if(/\s/.test(c)){i++;continue}
    if(c==='"'){let j=i+1;while(j<s.length&&s[j]!=='"'){if(s[j]==="\\")j++;j++}emitOperand(s.slice(i,j+1));i=j+1;continue}
    if(c==="$"){i++;let t;if(s[i]==="("){let d=0,j=i;for(;j<s.length;j++){if(s[j]==="(")d++;if(s[j]===")"){d--;if(!d)break}}t=awkTok(s.slice(i+1,j));i=j+1}else{const m=s.slice(i).match(/^(\d+|NF|[A-Za-z_]\w*)/);t=m[1]==="NF"?"E.NF":/^\d+$/.test(m[1])?m[1]:"V."+m[1];i+=m[1].length}emitOperand(`E.f(${t})`);continue}
    if(/\d/.test(c)||c==="."&&/\d/.test(s[i+1])){const m=s.slice(i).match(/^\d*\.?\d+(e[+-]?\d+)?/i);emitOperand(m[0]);i+=m[0].length;continue}
    if(c==="/"&&!prevOperand){let j=i+1,r="";while(j<s.length&&s[j]!=="/"){if(s[j]==="\\"){r+=s[j++]}r+=s[j++]}emitOperand(`E.m(${JSON.stringify(r)})`);i=j+1;continue}
    if(/[A-Za-z_]/.test(c)){const m=s.slice(i).match(/^[A-Za-z_]\w*/)[0];i+=m.length;
      if(["NR","NF","FS","OFS","FNR"].includes(m)){emitOperand(m==="FNR"?"E.NR":"E."+m);continue}
      if(AWK_FN[m]){if(prevOperand)out+='+""+';out+=AWK_FN[m];prevOperand=false;if(s[i]!=="("){out+="()";prevOperand=true}continue}
      if(s[i]==="["){emitOperand(`E.arr("${m}")`);continue}
      if(m==="in"){out+=" in ";prevOperand=false;continue}
      emitOperand("V."+m);continue}
    if(c==="~"||c==="!"&&s[i+1]==="~"){const neg=c==="!";i+=neg?2:1;while(s[i]===" ")i++;let rhs;if(s[i]==="/"){let j=i+1,r="";while(j<s.length&&s[j]!=="/"){if(s[j]==="\\"){r+=s[j++]}r+=s[j++]}rhs=JSON.stringify(r);i=j+1}else{const m=s.slice(i).match(/^("[^"]*"|\S+)/)[0];rhs=awkTok(m);i+=m.length}
      out=`${neg?"!":""}E.mt(${out},${rhs})`;prevOperand=true;continue}
    if(c==="("){let d=0,j=i;for(;j<s.length;j++){if(s[j]==='"'){j++;while(s[j]!=='"')j++}if(s[j]==="(")d++;if(s[j]===")"){d--;if(!d)break}}const inner=s.slice(i+1,j);
      if(!prevOperand||/\w\s*$/.test(out)&&/[a-z)]$/.test(out.trim())&&out.trim().endsWith(")")===false){const isCall=/(\)|E\.\w+|Math\.\w+)$/.test(out.trim())&&!prevOperand;out+=isCall?"("+inner.split(",").map(awkTok).join(",")+")":"("+awkTok(inner)+")";prevOperand=true}
      else{const isCall=/=>[^]*\)$|Math\.\w+$|E\.\w+$|\)\)$/.test(out.trim());if(isCall){out+="("+splitArgs(inner).map(awkTok).join(",")+")";prevOperand=true}else emitOperand("("+awkTok(inner)+")")}
      i=j+1;continue}
    if(c==="["){let d=0,j=i;for(;j<s.length;j++){if(s[j]==="[")d++;if(s[j]==="]"){d--;if(!d)break}}out+="["+awkTok(s.slice(i+1,j))+"]";i=j+1;prevOperand=true;continue}
    const op=s.slice(i).match(/^(\+\+|--|\+=|-=|\*=|\/=|%=|==|!=|<=|>=|&&|\|\||\^|[-+*/%<>=!?:,])/);if(op){let t=op[0];if(t==="^")t="**";
      if((t==="++"||t==="--")&&prevOperand){out+=t;i+=op[0].length;continue}out+=t==="=="?"==":t;prevOperand=false;i+=op[0].length;continue}
    throw new Error(s.slice(i,i+10))}
  return out}
function splitArgs(s){const o2=[];let d=0,cur="",q=false;for(const c of s){if(c==='"')q=!q;if(!q&&c==="(")d++;if(!q&&c===")")d--;if(!q&&c===","&&d===0){o2.push(cur);cur=""}else cur+=c}if(cur.trim())o2.push(cur);return o2}
function awkExpr(src){const js=awkTok(src);const fn=new Function("E","V","return ("+js+")");return E=>{const r=fn(Object.assign(E,awkHelpers(E)),E.V);return !!r&&r!=="0"}}
function awkHelpers(E){return {f:n=>{n=+n;const v=n===0?E.$0:E.F[n];if(v===undefined)return "";return /^\s*-?\d+(\.\d+)?\s*$/.test(v)?+v:v},m:r=>new RegExp(r).test(E.$0),mt:(v,r)=>new RegExp(r).test(String(v)),
  arr:n=>{if(typeof E.V[n]!=="object")E.V[n]=new Proxy({},{get:(t,k)=>k in t?t[k]:0});return E.V[n]},
  sprintf:(fm,...args)=>fm.replace(/%(-?\d*)(?:\.(\d+))?([sdif%])/g,(m,wd,pr,t)=>{if(t==="%")return "%";let v=args.shift();if(t==="d"||t==="i")v=Math.trunc(+v||0);if(t==="f")v=(+v||0).toFixed(pr!=null?+pr:6);v=String(v);const n=parseInt(wd);if(n)v=n<0?v.padEnd(-n):v.padStart(n);return v}),
  gsub:(r,rep,tgt)=>{const re=new RegExp(r,"g");const c=(E.$0.match(re)||[]).length;E.$0=E.$0.replace(re,rep);return c},sub:(r,rep)=>{const re=new RegExp(r);const had=re.test(E.$0);E.$0=E.$0.replace(re,rep);return had?1:0}}}
function awkFn(src){/* statements: print, printf, assignments, if, for-in, next, exit */const stmts=splitStmts(src);const parts=stmts.map(compileStmt);return E=>{Object.assign(E,awkHelpers(E));for(const p of parts){if(p(E)==="next")return}}}
function splitStmts(s){const o2=[];let d=0,cur="",q=false,p=0;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'&&s[i-1]!=="\\")q=!q;if(!q){if(c==="{")d++;if(c==="}")d--;if(c==="(")p++;if(c===")")p--;if((c===";"||c==="\n")&&d===0&&p===0){if(cur.trim())o2.push(cur.trim());cur="";continue}}cur+=c}if(cur.trim())o2.push(cur.trim());return o2}
function compileStmt(st){let m;
  if(st==="next")return ()=>"next";if(st==="exit"||st.startsWith("exit "))return ()=>{throw "exit"};
  if(m=st.match(/^if\s*\(/)){let d=0,j=st.indexOf("(");const s0=j;for(;j<st.length;j++){if(st[j]==="(")d++;if(st[j]===")"){d--;if(!d)break}}const cond=awkExpr(st.slice(s0+1,j));let rest=st.slice(j+1).trim();let els=null;
    let body=rest;if(rest.startsWith("{")){let dd=0,k=0;for(;k<rest.length;k++){if(rest[k]==="{")dd++;if(rest[k]==="}"){dd--;if(!dd)break}}body=rest.slice(1,k);const after=rest.slice(k+1).trim();if(after.startsWith("else"))els=after.slice(4).trim().replace(/^\{|\}$/g,"")}
    else{const ei=rest.search(/\belse\b/);if(ei>0){els=rest.slice(ei+4).trim();body=rest.slice(0,ei)}}
    const B1=awkFn(body),B2=els?awkFn(els):null;return E=>{if(cond(E))return B1(E);else if(B2)return B2(E)}}
  if(m=st.match(/^for\s*\(\s*(\w+)\s+in\s+(\w+)\s*\)\s*(.*)$/s)){const body=awkFn(m[3].replace(/^\{|\}$/g,""));return E=>{const arr=E.V[m[2]]||{};for(const k of Object.keys(arr)){E.V[m[1]]=k;body(E)}}}
  if(m=st.match(/^printf\s*\(?(.*?)\)?$/s)){const args=splitArgs(m[1]).map(a=>new Function("E","V","return ("+awkTok(a)+")"));return E=>{const v=args.map(f=>f(E,E.V));E.out(E.sprintf(...v))}}
  if(m=st.match(/^print\b\s*(.*)$/s)){let body=m[1].trim();let redir=null;if(/>\s*"[^"]*"\s*$/.test(body)){redir=body.match(/>\s*"([^"]*)"\s*$/)[1];body=body.replace(/>\s*"[^"]*"\s*$/,"")}
    if(!body)return E=>E.out(E.$0+"\n");const args=splitArgs(body.replace(/^\((.*)\)$/s,"$1")).map(a=>new Function("E","V","return ("+awkTok(a)+")"));return E=>E.out(args.map(f=>{const v=f(E,E.V);return typeof v==="number"?String(Math.round(v*1e6)/1e6):v}).join(E.OFS)+"\n")}
  if(st.startsWith("{")&&st.endsWith("}"))return awkFn(st.slice(1,-1));
  const js=awkTok(st);const fn=new Function("E","V",js+";");return E=>{fn(E,E.V)}}

/* ---------- archives and compression ---------- */
const packTree=(x,base,rel,list,excl)=>{const w=W(x);const n=LX.lookup(w,base);if(!n)return;if(excl&&excl.some(p=>LX.globRe(p).test(LX.basename(base))))return;
  if(!LX.can(w,U(x),n,"r")){list.err=list.err||[];list.err.push(rel);return}list.push({p:rel,t:n.t,c:n.t==="f"?(n.gen?n.gen(w):n.c):"",mode:n.mode,uid:n.uid,gid:n.gid,sz:n.sz,to:n.to});
  if(n.t==="d")Object.keys(n.k).sort().forEach(k=>packTree(x,base+"/"+k,rel+"/"+k,list,excl))};
C.tar=(x,a)=>{const w=W(x);let A=[...a];if(A[0]&&!A[0].startsWith("-")&&/^[cxtrvzjJfpPC]+$/.test(A[0]))A[0]="-"+A[0];
  let mode=null,file=null,verbose=false,dir=null,comp=null;const items=[],excl=[];
  for(let k=0;k<A.length;k++){const s=A[k];if(s.startsWith("--")){if(s==="--create")mode="c";else if(s==="--extract")mode="x";else if(s==="--list")mode="t";else if(s.startsWith("--exclude"))excl.push(s.split("=")[1]||A[++k]);else if(s.startsWith("--file"))file=s.split("=")[1]||A[++k];else if(s==="--gzip")comp="gz";else if(s==="--verbose")verbose=true;else if(s.startsWith("--directory"))dir=s.split("=")[1]||A[++k];continue}
    if(s.startsWith("-")&&s.length>1){for(let j=1;j<s.length;j++){const c=s[j];if("cxtr".includes(c))mode=c;else if(c==="v")verbose=true;else if(c==="z")comp="gz";else if(c==="j")comp="bz2";else if(c==="J")comp="xz";else if(c==="f"){file=s.slice(j+1)||A[++k];break}else if(c==="C"){dir=s.slice(j+1)||A[++k];break}}continue}items.push(s)}
  if(!mode){e(x,"tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' or 'tar --usage' for more information.\n");return 2}
  if(!file){e(x,"tar: Refusing to write archive contents to terminal (missing -f option?)\ntar: Error is not recoverable: exiting now\n");return 2}
  const fp=P(x,file);
  if(mode==="c"){if(!items.length){e(x,"tar: Cowardly refusing to create an empty archive\n");return 2}const list=[];items.forEach(it=>{const base=P(x,dir?LX.abs(P(x,dir),it):it);if(!LX.lookup(w,base)){e(x,`tar: ${it}: Cannot stat: No such file or directory\n`);return}packTree(x,base,it.replace(/^\/+/,"").replace(/\/$/,""),list,excl)});
    if(items.some(i=>i.startsWith("/")))e(x,"tar: Removing leading `/' from member names\n");if(list.err)list.err.forEach(p=>e(x,`tar: ${p}: Cannot open: Permission denied\n`));
    const err=LX.writeFile(x.sh,fp,"TAR:"+JSON.stringify(list));if(err){e(x,`tar: ${file}: Cannot open: ${err}\n`);return 2}const fn=LX.lookup(w,fp);fn.sz=Math.max(10240,list.reduce((s,z)=>s+(z.sz||z.c.length)+512,0)*(comp?0.3:1));if(verbose)o(x,list.map(z=>z.p+(z.t==="d"?"/":"")).join("\n")+"\n");return list.err?2:0}
  const r=LX.readFile(x.sh,fp);if(r.err){e(x,`tar: ${file}: Cannot open: ${r.err}\ntar: Error is not recoverable: exiting now\n`);return 2}
  if(!r.c.startsWith("TAR:")){e(x,"tar: This does not look like a tar archive\ntar: Exiting with failure status due to previous errors\n");return 2}const list=JSON.parse(r.c.slice(4));
  if(mode==="t"){o(x,list.map(z=>verbose?`${LX.modeStr({t:z.t,mode:z.mode})} ${LX.uidName(w,z.uid)}/${LX.gidName(w,z.gid)} ${String(z.sz||z.c.length).padStart(8)} ${new Date().toISOString().slice(0,16).replace("T"," ")} ${z.p}${z.t==="d"?"/":""}`:z.p+(z.t==="d"?"/":"")).join("\n")+"\n");return 0}
  const base=dir?P(x,dir):x.sh.cwd;if(!LX.lookup(w,base)){e(x,`tar: ${dir}: Cannot open: No such file or directory\n`);return 2}
  const keep=items.length?list.filter(z=>items.some(it=>z.p===it||z.p.startsWith(it.replace(/\/$/,"")+"/"))):list;
  for(const z of keep){const tp=LX.abs(base,z.p);if(z.t==="d"){if(!LX.lookup(w,tp)){const par=LX.lookup(w,LX.dirname(tp));if(!par||!flagPerm(x,par,tp)){e(x,`tar: ${z.p}: Cannot mkdir: Permission denied\n`);continue}const d=LX.D(z.mode,isRoot(x)?z.uid:w.users[U(x)].uid,isRoot(x)?z.gid:w.users[U(x)].gid);par.k[LX.basename(tp)]=d}}
    else{if(!LX.lookup(w,LX.dirname(tp))){const me=w.users[U(x)];LX.mkdirp(w,LX.dirname(tp),0o755,me.uid,me.gid)}const err=LX.writeFile(x.sh,tp,z.c);if(err){e(x,`tar: ${z.p}: Cannot open: ${err}\n`);continue}const n=LX.lookup(w,tp);n.mode=z.mode;if(z.sz)n.sz=z.sz;if(isRoot(x)){n.uid=z.uid;n.gid=z.gid}}
    if(verbose)o(x,z.p+(z.t==="d"?"/":"")+"\n")}return 0};
C.gzip=C.bzip2=C.xz=(x,a,name)=>{const w=W(x);const keep=a.includes("-k");const dec=a.includes("-d");const ext={gzip:".gz",bzip2:".bz2",xz:".xz"}[name];let rc=0;
  if(dec)return C.gunzip(x,a.filter(s=>s!=="-d"),name);
  a.filter(s=>!s.startsWith("-")).forEach(t=>{const p=P(x,t);const r=LX.readFile(x.sh,p);if(r.err){e(x,`${name}: ${t}: ${r.err}\n`);rc=1;return}if(LX.lookup(w,p+ext)){e(x,`${name}: ${t}${ext} already exists\n`);rc=1;return}
    LX.writeFile(x.sh,p+ext,"GZ:"+JSON.stringify({c:r.c}));const z=LX.lookup(w,p+ext);z.sz=Math.round((r.n.sz||r.c.length)*0.25)+20;z.mode=r.n.mode;if(!keep)delete LX.parentOf(w,p).k[LX.basename(p)]});return rc};
C.gunzip=C.bunzip2=C.unxz=(x,a,name)=>{const w=W(x);let rc=0;a.filter(s=>!s.startsWith("-")).forEach(t=>{const p=P(x,t);const r=LX.readFile(x.sh,p);if(r.err){e(x,`gzip: ${t}: ${r.err}\n`);rc=1;return}
  if(!/\.(gz|bz2|xz|tgz)$/.test(t)){e(x,`gzip: ${t}: unknown suffix -- ignored\n`);rc=2;return}const out=p.replace(/\.(gz|bz2|xz)$/,"").replace(/\.tgz$/,".tar");
  let c=r.c;if(c.startsWith("GZ:"))c=JSON.parse(c.slice(3)).c;LX.writeFile(x.sh,out,c);if(r.n.sz&&c.startsWith("TAR:"))LX.lookup(w,out).sz=r.n.sz*3;if(!a.includes("-k"))delete LX.parentOf(w,p).k[LX.basename(p)]});return rc};
C.zcat=(x,a)=>{a.forEach(t=>{const r=LX.readFile(x.sh,P(x,t));if(r.err){e(x,`gzip: ${t}: ${r.err}\n`);return}o(x,r.c.startsWith("GZ:")?JSON.parse(r.c.slice(3)).c:r.c)});return 0};
C.zip=(x,a)=>{const p=a.filter(s=>!s.startsWith("-"));if(p.length<2){e(x,"zip error: Nothing to do!\n");return 12}const list=[];p.slice(1).forEach(it=>packTree(x,P(x,it),it,list));LX.writeFile(x.sh,P(x,p[0].endsWith(".zip")?p[0]:p[0]+".zip"),"TAR:"+JSON.stringify(list));list.forEach(z=>o(x,`  adding: ${z.p}${z.t==="d"?"/":""} (deflated 52%)\n`));return 0};
C.unzip=(x,a)=>{const p=a.filter(s=>!s.startsWith("-"));const r=LX.readFile(x.sh,P(x,p[0]));if(r.err){e(x,`unzip:  cannot find or open ${p[0]}.\n`);return 9}if(a.includes("-l")){o(x,JSON.parse(r.c.slice(4)).map(z=>z.p).join("\n")+"\n");return 0}return C.tar(x,["-xf",p[0]])};

/* ---------- hashing and encoding ---------- */
function hashHex(s,len){let h1=0x811c9dc5,h2=0x1b873593,out="";for(let r=0;out.length<len;r++){for(let i=0;i<s.length;i++){h1=Math.imul(h1^s.charCodeAt(i),16777619)>>>0;h2=Math.imul(h2+s.charCodeAt(i)+r,2246822519)>>>0}out+=((h1^h2^(r*2654435761))>>>0).toString(16).padStart(8,"0");h1=(h1+0x9e3779b9)>>>0}return out.slice(0,len)}
LX.hashHex=hashHex;
const SUMS={md5sum:32,sha1sum:40,sha256sum:64,sha512sum:128,b2sum:128};
Object.keys(SUMS).forEach(n=>C[n]=(x,a)=>{const {f,p}=opts(a);if(f.c){const r=readAll(x,p,n);let bad=0;r.out.forEach(z=>lines(z.c).forEach(l=>{const m=l.match(/^(\w+)\s+\*?(.+)$/);if(!m)return;const rr=LX.readFile(x.sh,P(x,m[2]));const ok=!rr.err&&hashHex(n+rr.c,SUMS[n])===m[1];if(!ok)bad++;o(x,`${m[2]}: ${ok?"OK":"FAILED"}\n`)}));if(bad)e(x,`${n}: WARNING: ${bad} computed checksum did NOT match\n`);return bad?1:0}
  const r=readAll(x,p,n);r.out.forEach(z=>o(x,`${hashHex(n+z.c,SUMS[n])}  ${z.name}\n`));return r.rc});
C.base64=(x,a)=>{const {f,p}=opts(a);const r=readAll(x,p,"base64");const s=r.out.map(z=>z.c).join("");try{o(x,f.d?atob(s.trim()):btoa(unescape(encodeURIComponent(s))).replace(/(.{76})/g,"$1\n")+"\n")}catch(err){e(x,"base64: invalid input\n");return 1}return 0};
C.strings=(x,a)=>{const r=readAll(x,a.filter(s=>!s.startsWith("-")),"strings");o(x,r.out.map(z=>z.c).join("").match(/[\x20-\x7e]{4,}/g)?.join("\n")+"\n"||"");return 0};
C.od=C.xxd=C.hexdump=(x,a)=>{const r=readAll(x,a.filter(s=>!s.startsWith("-")),"od");const s=r.out.map(z=>z.c).join("").slice(0,64);let out="";for(let i=0;i<s.length;i+=16){const ch=s.slice(i,i+16);out+=i.toString(16).padStart(8,"0")+": "+[...ch].map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ").padEnd(48)+"  "+ch.replace(/[^\x20-\x7e]/g,".")+"\n"}o(x,out);return 0};
C.split=(x,a)=>{o(x,"");return 0};
C.dos2unix=(x,a)=>{a.filter(s=>!s.startsWith("-")).forEach(t=>{const p=P(x,t);const r=LX.readFile(x.sh,p);if(r.err){e(x,`dos2unix: ${t}: ${r.err}\n`);return}LX.writeFile(x.sh,p,r.c.replace(/\r\n/g,"\n"));e(x,`dos2unix: converting file ${t} to Unix format...\n`)});return 0};
C.unix2dos=(x,a)=>{a.filter(s=>!s.startsWith("-")).forEach(t=>{const p=P(x,t);const r=LX.readFile(x.sh,p);if(r.err)return;LX.writeFile(x.sh,p,r.c.replace(/\r?\n/g,"\r\n"));e(x,`unix2dos: converting file ${t} to DOS format...\n`)});return 0};

/* ---------- editors (the terminal UI opens a full-screen editor) ---------- */
C.nano=C.vi=C.vim=C.vimdiff=C.emacs=C.gedit=(x,a,name)=>{const w=W(x);const t=a.filter(s=>!s.startsWith("-")&&!s.startsWith("+"))[0];if(!t){e(x,`${name}: the simulator's editor needs a file name, for example: ${name} notes.txt\n`);return 1}
  if(name==="emacs"||name==="gedit"){e(x,`bash: ${name}: command not found...\n`);return 127}
  const path=P(x,t);const n=LX.lookup(w,path);if(n&&n.t==="d"){e(x,`${name}: ${t} is a directory\n`);return 1}
  if(n&&!LX.can(w,U(x),n,"r")){e(x,`${name}: ${t}: Permission denied\n`);return 1}
  x.out.push([9,{edit:path,name:t,ed:name,ro:n?!LX.can(w,U(x),n,"w"):false,c:n?(n.gen?n.gen(w):n.c):""}]);return 0};
LX.SBIN.add("visudo");
C.visudo=(x,a)=>{if(!isRoot(x)){e(x,"visudo: /etc/sudoers: Permission denied\n");return 1}const f=a.includes("-f")?a[a.indexOf("-f")+1]:"/etc/sudoers";if(a.includes("-c")){const bad=LX.sudoersErrors(W(x));if(bad.length){bad.forEach(b=>e(x,b+"\n"));return 1}o(x,"/etc/sudoers: parsed OK\n/etc/sudoers.d/ files: parsed OK\n");return 0}
  x.out.push([9,{edit:P(x,f),name:f,ed:"visudo",c:LX.read(W(x),P(x,f))||"",check:"sudoers"}]);return 0};

/* ---------- help text and man summaries ---------- */
LX.helpText=sh=>`This is a simulated Linux server (${sh.w.distro==="debian"?"Ubuntu":"RHEL"}-style). It understands bash syntax (pipes, redirects, variables, loops, functions)
and these commands. Use Tab to complete, ↑/↓ for history, and Ctrl+L or 'clear' to clear the screen.

Files       ls cd pwd cat less head tail touch mkdir rm cp mv ln find locate stat file du tree
Text        grep sed awk cut sort uniq wc tr tee diff xargs column nano vim
Permissions chmod chown chgrp umask setfacl getfacl chattr lsattr
Users       id whoami who w last useradd usermod userdel groupadd gpasswd passwd chage su sudo visudo getent
Processes   ps top htop kill pkill pgrep nice renice jobs bg fg nohup uptime free vmstat lsof
Services    systemctl journalctl crontab at
Packages    ${sh.w.distro==="debian"?"apt dpkg":"dnf yum rpm"}
Storage     lsblk blkid df mount umount fdisk parted mkfs.* mkswap swapon pvcreate vgcreate lvcreate lvextend xfs_growfs resize2fs mdadm
Network     ip nmcli hostnamectl ping dig host nslookup ss curl wget traceroute ssh scp ssh-keygen ssh-copy-id
Security    ${sh.w.distro==="debian"?"ufw aa-status":"firewall-cmd getenforce setenforce sestatus ls -Z restorecon semanage chcon getsebool setsebool ausearch"} iptables nft gpg openssl
Automation  git ansible ansible-playbook podman docker python3
System      uname hostname date timedatectl lscpu lspci lsusb lsmod modprobe dmesg sysctl tar gzip rsync dd
`;
LX.MAN={ls:["1","list directory contents","ls [OPTION]... [FILE]...","-l long listing, -a include hidden files, -h human-readable sizes, -d list a directory itself, -Z show SELinux contexts, -i show inode numbers, -R recurse, -t sort by time."],
  cd:["1","change the working directory"],cp:["1","copy files and directories","cp [OPTION]... SOURCE... DEST","-r copies directories recursively, -p preserves mode, ownership and timestamps, -a archives (recursive and preserve)."],mv:["1","move (rename) files"],rm:["1","remove files or directories","rm [OPTION]... FILE...","-r removes directories recursively, -f ignores missing files and never prompts, -i prompts first."],
  chmod:["1","change file mode bits","chmod [OPTION]... MODE[,MODE]... FILE...","MODE is octal (755) or symbolic (u+x, g-w, o=r, a+rx). Special bits: 4000 SUID, 2000 SGID, 1000 sticky (or u+s, g+s, +t). -R recurses."],
  chown:["1","change file owner and group","chown [OPTION]... [OWNER][:[GROUP]] FILE..."],find:["1","search for files in a directory hierarchy","find [path...] [expression]","Tests: -name, -iname, -type f|d|l, -user, -group, -perm, -size +100M, -mtime +7, -empty. Actions: -exec cmd {} \\;, -delete, -ls."],
  grep:["1","print lines that match patterns","grep [OPTION...] PATTERNS [FILE...]","-i ignore case, -v invert, -n line numbers, -c count, -r recurse, -l list files, -E extended regex, -w whole words, -o only the match."],
  sed:["1","stream editor for filtering and transforming text","sed [OPTION]... {script} [input-file]...","s/old/new/g substitutes, -i edits in place, -n with p prints selected lines, /re/d deletes matching lines, -E uses extended regex."],
  awk:["1","pattern scanning and processing language","awk [-F fs] 'pattern { action }' [file...]","$1..$NF are fields, NR is the line number, NF the field count. -F sets the separator. BEGIN and END blocks run before and after the input."],
  tar:["1","an archiving utility","tar [OPTION...] [FILE]...","-c create, -x extract, -t list, -f archive file, -z gzip, -j bzip2, -J xz, -v verbose, -C change to directory."],
  systemctl:["1","control the systemd system and service manager","systemctl [OPTIONS...] COMMAND [UNIT...]","start, stop, restart, reload, status, enable, disable, enable --now, mask, unmask, is-active, is-enabled, list-units, list-unit-files, daemon-reload, get-default, set-default, isolate."],
  journalctl:["1","print log entries from the systemd journal","journalctl [OPTIONS...] [MATCHES...]","-u unit, -p priority (err, warning), -b this boot, -f follow, -e jump to end, -x add explanations, --since and --until time ranges, -k kernel messages."],
  useradd:["8","create a new user or update default new user information","useradd [options] LOGIN","-m create home, -s shell, -G supplementary groups, -u UID, -c comment, -e expiry date, -d home directory."],
  usermod:["8","modify a user account","usermod [options] LOGIN","-aG append supplementary groups (without -a, -G replaces them), -s shell, -L lock, -U unlock, -e expiry, -d home."],
  passwd:["1","update user's authentication tokens","passwd [options] [LOGIN]","-l lock, -u unlock, -e expire (force a change at next login), -S status."],chage:["1","change user password expiry information","chage [options] LOGIN","-l list, -M max days, -m min days, -W warning days, -E account expiry date, -d 0 forces a change at next login."],
  sudo:["8","execute a command as another user","sudo [-u user] command","Rules live in /etc/sudoers and /etc/sudoers.d/. Edit them with visudo, which checks syntax before saving. -l lists what you're allowed to run, -i opens a root login shell."],
  ps:["1","report a snapshot of the current processes","ps [options]","ps aux (BSD style) or ps -ef (System V style). ps -u user, ps -p PID -o pid,ni,cmd."],top:["1","display Linux processes"],kill:["1","send a signal to a process","kill [-signal] PID...","Default is 15 (SIGTERM, ask nicely). 9 (SIGKILL) can't be caught. 1 (SIGHUP) often means reload config. kill -l lists signals."],
  nice:["1","run a program with modified scheduling priority","nice -n N command","Niceness runs from -20 (highest priority) to 19 (lowest). Only root can go below 0."],renice:["1","alter priority of running processes","renice -n N -p PID"],
  ip:["8","show / manipulate routing, network devices, interfaces","ip [OPTIONS] OBJECT {COMMAND}","ip addr (a), ip link, ip route (r), ip neigh. Changes made with ip are not persistent."],nmcli:["1","command-line tool for controlling NetworkManager","nmcli [OPTIONS] OBJECT {COMMAND}","nmcli con show, nmcli con mod NAME ipv4.addresses 10.0.0.5/24 ipv4.gateway 10.0.0.1 ipv4.method manual, nmcli con up NAME. Changes persist."],
  ss:["8","another utility to investigate sockets","ss [options]","-t TCP, -u UDP, -l listening, -n numeric, -p process. ss -tulnp is the classic."],dig:["1","DNS lookup utility","dig [@server] name [type]","+short prints only the answer."],
  "firewall-cmd":["1","firewalld command line client","firewall-cmd [OPTIONS...]","--list-all, --add-service=http, --add-port=8080/tcp, --remove-service, --permanent (survives reload), --reload, --get-default-zone, --zone=."],
  ufw:["8","program for managing a netfilter firewall","ufw [--dry-run] [command]","ufw status verbose, ufw allow 22/tcp, ufw allow http, ufw deny 23, ufw delete N, ufw enable."],
  getenforce:["8","get the current mode of SELinux"],setenforce:["8","modify the mode SELinux is running in","setenforce [Enforcing|Permissive|1|0]","Not persistent: edit /etc/selinux/config to survive a reboot."],restorecon:["8","restore file(s) default SELinux security contexts","restorecon [-R] [-v] path"],
  semanage:["8","SELinux policy management tool","semanage fcontext -a -t TYPE 'PATH(/.*)?' ; semanage port -a -t TYPE -p tcp PORT ; semanage boolean -l"],
  lvcreate:["8","create a logical volume","lvcreate -L SIZE -n NAME VG"],lvextend:["8","add space to a logical volume","lvextend -L +SIZE [-r] /dev/VG/LV","-r grows the filesystem in the same step."],pvcreate:["8","initialize physical volume(s) for use by LVM"],vgcreate:["8","create a volume group"],
  mount:["8","mount a filesystem","mount [-t type] [-o options] device dir","mount -a mounts everything in /etc/fstab that isn't mounted yet. Run it after editing fstab to catch mistakes before a reboot."],
  lsblk:["8","list block devices"],blkid:["8","locate/print block device attributes"],df:["1","report file system space usage","df [-h] [-i] [FILE]...","-h human-readable, -i inodes, -T show filesystem type."],du:["1","estimate file space usage","du [-sh] [FILE]...","-s summary only, -h human-readable, --max-depth=N."],
  crontab:["1","maintains crontab files for individual users","crontab [-u user] {-l | -e | -r | file}","Fields: minute hour day-of-month month day-of-week command. */15 means every 15."],
  git:["1","the stupid content tracker","git <command> [<args>]","init, clone, status, add, commit -m, log --oneline, branch, switch -c, checkout, merge, diff, pull, push, remote -v, restore, revert, tag, stash."],
  ansible:["1","run a single task 'playbook' against a set of hosts","ansible PATTERN -i INVENTORY -m MODULE -a ARGS"],"ansible-playbook":["1","runs Ansible playbooks","ansible-playbook -i INVENTORY playbook.yml [--check] [--syntax-check] [--limit HOST]"],
  podman:["1","simple management tool for pods, containers and images","podman [options] command","pull, images, run -d --name N -p HOST:CTR image, ps -a, logs, exec -it, stop, rm, rmi, build -t name ., volume, generate systemd."],
  docker:["1","Docker container runtime","docker [OPTIONS] COMMAND"],ssh:["1","OpenSSH remote login client","ssh [-p port] [-i key] user@host [command]"],"ssh-keygen":["1","OpenSSH authentication key utility","ssh-keygen -t ed25519 [-f file] [-C comment]"],
  dnf:["8","DNF package manager","dnf [options] COMMAND","install, remove, update, search, info, list installed, provides, history, repolist, module."],apt:["8","command-line interface for the package manager","apt [options] command","update (refresh the index), upgrade, install, remove, purge, search, show, list --installed, autoremove."],
  rpm:["8","RPM package manager","rpm -qa | -qi PKG | -ql PKG | -qf FILE | -V PKG"],dpkg:["1","package manager for Debian","dpkg -l | -L PKG | -S FILE | -i file.deb"],
  hostnamectl:["1","control the system hostname"],timedatectl:["1","control the system time and date"],sysctl:["8","configure kernel parameters at runtime","sysctl [-w] key=value ; sysctl -p [file]","Persist settings in /etc/sysctl.d/*.conf."],
  modprobe:["8","add and remove modules from the Linux kernel","modprobe [-r] module"],lsmod:["8","show the status of modules in the Linux Kernel"],dmesg:["1","print or control the kernel ring buffer"],
  chattr:["1","change file attributes on a Linux file system","chattr [+-=][aiA...] files","+i makes a file immutable, even for root. +a allows appends only."],setfacl:["1","set file access control lists","setfacl -m u:alice:rwx file ; setfacl -x u:alice file ; setfacl -b file ; setfacl -d -m g:dev:rwx dir"],getfacl:["1","get file access control lists"],
  umask:["1","set file mode creation mask","umask [-S] [mode]","New files start at 666 and directories at 777, minus the umask. umask 027 gives files 640 and directories 750."],
  rsync:["1","a fast, versatile, remote (and local) file-copying tool","rsync -av [--delete] SRC DEST"],dd:["1","convert and copy a file","dd if=INPUT of=OUTPUT bs=SIZE count=N"],
  vim:["1","Vi IMproved, a programmer's text editor","vim [file]","i inserts, Esc returns to normal mode, :w saves, :q quits, :wq saves and quits, :q! quits without saving, dd deletes a line, /text searches."],
  nano:["1","Nano's ANOther editor","nano [file]","Ctrl+O saves, Ctrl+X exits, Ctrl+W searches, Ctrl+K cuts a line."],ln:["1","make links between files","ln [-s] TARGET LINK_NAME","Without -s you get a hard link: another name for the same inode. -s makes a symbolic link: a small file holding a path."],
  stat:["1","display file or file system status"],xargs:["1","build and execute command lines from standard input"],tee:["1","read from standard input and write to standard output and files","tee [-a] FILE..."],
  sort:["1","sort lines of text files","sort [-n] [-r] [-u] [-k N] [-t SEP]"],uniq:["1","report or omit repeated lines","uniq [-c] [-d] [-u]","Only adjacent duplicates collapse, so sort first."],cut:["1","remove sections from each line of files","cut -d SEP -f FIELDS"],tr:["1","translate or delete characters"],wc:["1","print newline, word, and byte counts"],
  ping:["8","send ICMP ECHO_REQUEST to network hosts","ping [-c count] host"],traceroute:["8","print the route packets trace to network host"],curl:["1","transfer a URL","curl [-I] [-o file] URL"],
  gpg:["1","OpenPGP encryption and signing tool","gpg --gen-key ; gpg -c file ; gpg -e -r user file ; gpg -d file.gpg ; gpg --verify sig file"],openssl:["1","OpenSSL command line program","openssl req -new -x509 ... ; openssl x509 -in cert.pem -noout -text ; openssl s_client -connect host:443"],
  cryptsetup:["8","manage plain dm-crypt, LUKS, and other encrypted volumes","cryptsetup luksFormat DEVICE ; cryptsetup open DEVICE NAME"],"ssh-copy-id":["1","use locally available keys to authorise logins on a remote machine"],
  last:["1","show a listing of last logged in users"],who:["1","show who is logged on"],id:["1","print real and effective user and group IDs"],free:["1","display amount of free and used memory in the system","free [-h]"],uptime:["1","tell how long the system has been running","uptime","The three load averages cover 1, 5 and 15 minutes. Compare them to the number of CPU cores."],
  vmstat:["8","report virtual memory statistics","vmstat [delay [count]]"],iostat:["1","report CPU and I/O statistics","iostat [-x] [interval]"],lsof:["8","list open files","lsof [-i :port] [+L1] [-u user] [file]"],
  "xfs_growfs":["8","expand an XFS filesystem","xfs_growfs MOUNTPOINT","XFS can grow but never shrink."],resize2fs:["8","ext2/ext3/ext4 file system resizer","resize2fs DEVICE [size]"],mkfs:["8","build a Linux filesystem","mkfs.xfs DEVICE ; mkfs.ext4 DEVICE"],
  fdisk:["8","manipulate disk partition table"],parted:["8","a partition manipulation program","parted -s DEVICE mklabel gpt mkpart primary 1MiB 100%"],mdadm:["8","manage MD devices aka Linux Software RAID"],
  python3:["1","an interpreted, interactive, object-oriented programming language"],export:["1","set export attribute for shell variables"],alias:["1","define or display aliases"],history:["1","display the command history"],
  bash:["1","GNU Bourne-Again SHell","bash [script] [args]","Scripts start with #!/bin/bash, need the execute bit to run as ./script.sh, and get arguments as $1, $2 ... $@, with $# counting them and $? holding the last exit status."],
  test:["1","check file types and compare values","[ EXPRESSION ]","-f file exists, -d directory, -z empty string, -n non-empty, -eq -ne -lt -gt numeric compare, = != string compare."],
  at:["1","queue, examine, or delete jobs for later execution","at TIME ; atq ; atrm N"],ausearch:["8","a tool to query audit daemon logs","ausearch -m avc -ts recent"],"aa-status":["8","report the current state of AppArmor"],
  tcpdump:["8","dump traffic on a network","tcpdump -i eth0 port 80 -n"],nmap:["1","network exploration tool and security / port scanner","nmap [-sS] [-p ports] target"],"ss-keygen":["1",""],
  uname:["1","print system information","uname [-a] [-r] [-m]"],hostname:["1","show or set the system's host name"],lscpu:["1","display information about the CPU architecture"],lspci:["8","list all PCI devices"],lsusb:["8","list USB devices"],
  getent:["1","get entries from Name Service Switch libraries","getent passwd USER ; getent group GROUP ; getent hosts NAME"],nslookup:["1","query Internet name servers interactively"],host:["1","DNS lookup utility"],
  mkswap:["8","set up a Linux swap area"],swapon:["8","enable devices and files for paging and swapping"],"grub2-mkconfig":["8","generate a GRUB configuration file","grub2-mkconfig -o /boot/grub2/grub.cfg"],dracut:["8","low-level tool for generating an initramfs image"],
  logrotate:["8","rotates, compresses, and mails system logs"],gzip:["1","compress or expand files"],sha256sum:["1","compute and check SHA256 message digest","sha256sum FILE ; sha256sum -c SUMS"],
  pkill:["1","look up or signal processes based on name"],pgrep:["1","look up processes based on name"],killall:["1","kill processes by name"],
  usermod2:["8",""]};
})();
