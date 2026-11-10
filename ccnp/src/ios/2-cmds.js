/* ================= Cisco IOS simulator: command parser and configuration commands ================= */
(function(){
const {ip4,ip4s,maskLen,ip6,ifName,ifShort,ifType,getIf,listHas,pfx,inNet,parseAce,portNum,isWild}=IOS;
const INV="%INV";
const CMDS=[];
/* C(modes, pattern, handler, opts). Patterns use keywords and <placeholders>. */
function C(modes,pat,fn,o){modes.split(" ").forEach(m=>CMDS.push({m,p:pat.split(" "),fn,o:o||{}}))}
const PH={
  "<n>":t=>/^\d+$/.test(t)?+t:null,
  "<ip>":t=>ip4(t),
  "<mask>":t=>maskLen(t),
  "<wc>":t=>isWild(t)?ip4(t):null,
  "<v6p>":t=>{const m=/^(.+)\/(\d+)$/.exec(t);if(!m)return null;const n=ip6(m[1]);return n===null||+m[2]>128?null:{n,len:+m[2]}},
  "<v6>":t=>ip6(t),
  "<w>":t=>t,
  "<list>":t=>/^[\d,\-]+$/.test(t)?t:null
};
const DESC={configure:"Enter configuration mode",show:"Show running system information",ping:"Send echo messages",traceroute:"Trace route to destination",enable:"Turn on privileged commands",
  disable:"Turn off privileged commands",exit:"Exit from the EXEC",copy:"Copy from one file to another",write:"Write running configuration to memory",clear:"Reset functions",reload:"Halt and perform a cold restart",
  interface:"Select an interface to configure",hostname:"Set system's network name",ip:"Global IP configuration subcommands",ipv6:"IPv6 interface subcommands",router:"Enable a routing process",vlan:"Vlan commands",
  "spanning-tree":"Spanning Tree Subsystem",username:"Establish User Name Authentication",line:"Configure a terminal line",banner:"Define a login banner",service:"Modify use of network based services",
  crypto:"Encryption module",access:"Add an access list entry","access-list":"Add an access list entry",shutdown:"Shutdown the selected interface",no:"Negate a command or set its defaults",description:"Interface specific description",
  switchport:"Set switching mode characteristics","channel-group":"Etherchannel/port bundling configuration",standby:"HSRP interface configuration commands",vrrp:"VRRP Interface configuration commands",
  network:"Enable routing on an IP network","router-id":"router-id for this OSPF process","passive-interface":"Suppress routing updates on an interface",login:"Enable password checking",password:"Set a password",
  transport:"Define transport protocols for line",aaa:"Authentication, Authorization and Accounting.",logging:"Modify message logging facilities","snmp-server":"Modify SNMP engine parameters",ntp:"Configure NTP",
  lldp:"Global LLDP configuration subcommands",cdp:"Global CDP configuration subcommands",end:"Exit from configure mode",do:"To run exec commands in config mode",encapsulation:"Set encapsulation type for an interface",
  speed:"Configure speed operation.",duplex:"Configure duplex operation.","storm-control":"storm configuration",
  terminal:"Configure terminal line",default:"Set a command to its defaults",
  enable2:"",secret:"Specify a SECRET password",tacacs:"Modify TACACS query parameters",radius:"Configure RADIUS server",address:"Configure server address",key:"Per-server encryption key",name:"Ascii name of the VLAN"};

/* ---------- matching ---------- */
function tokenize(s){return s.trim().split(/\s+/).filter(Boolean)}
function tryMatch(p,toks,pre){
  let k=0;const args=[],kws=[];
  for(let j=0;j<p.length;j++){const pt=p[j];
    if(k>=toks.length)return {incomplete:true,j,deep:k};
    const t=toks[k];
    if(pt[0]!=="<"){const tl=t.toLowerCase(),pl=pt.toLowerCase();if(pl.startsWith(tl)){kws.push({k,kw:pt,exact:pl===tl});k++;continue}return {fail:k}}
    if(pt==="<rest>"){args.push(toks.slice(k).join(" "));args.rest=toks.slice(k);k=toks.length;continue}
    if(pt==="<if>"){let n=ifName(t),c=1;if((!n||!/\d/.test(t))&&k+1<toks.length&&/^[a-z-]+$/i.test(t)){n=ifName(t+toks[k+1]);c=2}if(!n)return {fail:k};args.push(n);k+=c;continue}
    const v=PH[pt](t);if(v===null||v===undefined)return {fail:k};args.push(v);k++}
  if(k<toks.length)return {fail:k};
  return {args,kws}}
function find(modes,toks){
  let best=null,inc=false,deep=-1;
  for(const m of modes){const L=CMDS.filter(c=>c.m===m);const hits=[];
    for(const c of L){const r=tryMatch(c.p,toks);if(r.args)hits.push({c,r,m});else if(r.incomplete)inc=true;else deep=Math.max(deep,r.fail)}
    if(hits.length){const pick=disamb(hits,toks);return pick}}
  return inc?{err:"% Incomplete command."}:{err:"invalid",at:Math.max(0,deep)}}
function disamb(hits,toks){
  if(hits.length===1)return hits[0];
  /* prefer exact keyword matches, position by position */
  let H=hits;for(let k=0;k<toks.length&&H.length>1;k++){
    const kwAt=h=>h.r.kws.find(x=>x.k===k);const kinds=new Set(H.map(h=>kwAt(h)?.kw.toLowerCase()||"<ph>"));if(kinds.size<=1)continue;
    const ex=H.filter(h=>kwAt(h)?.exact);if(ex.length){H=ex;continue}
    const kwH=H.filter(h=>kwAt(h));const names=new Set(kwH.map(h=>kwAt(h).kw.toLowerCase()));
    if(names.size>1)return {err:`% Ambiguous command:  "${toks.join(" ")}"`};
    H=kwH.length?kwH:H}
  return H[0]}
IOS.find=find;IOS.CMDS=CMDS;IOS.tokenize=tokenize;

/* ---------- modes ---------- */
const PROMPT={user:">",priv:"#",config:"(config)#",if:"(config-if)#",range:"(config-if-range)#",subif:"(config-subif)#",line:"(config-line)#",router:"(config-router)#",rtr6:"(config-rtr)#",vlan:"(config-vlan)#",
  nacl:"(config-std-nacl)#",eacl:"(config-ext-nacl)#",pool:"(dhcp-config)#",tacacs:"(config-server-tacacs)#",radius:"(config-radius-server)#",raguard:"(config-ra-guard)#"};
const SUB=["if","range","subif","line","router","rtr6","vlan","nacl","eacl","pool","tacacs","radius","raguard"];
IOS.prompt=x=>x.d.host+PROMPT[x.mode];
const ifMode=x=>x.mode==="if"||x.mode==="range"||x.mode==="subif";

/* run one line in a session x={d,w,mode,ifs,sub,pend,flags}. Returns output text. */
const modeChain=m=>{const L=[m==="range"||m==="subif"?"if":m];while(IOS.PARENT[L[L.length-1]])L.push(IOS.PARENT[L[L.length-1]]);L.push("config");return L};
IOS.PARENT={};IOS.modeChain=modeChain;
function run(x,line){x.w.ver=(x.w.ver||0)+1;try{return run1(x,line)}finally{x.w.ver++}}
function run1(x,line){
  const raw=line;line=line.replace(/\s+$/,"");
  if(!line.trim())return "";
  /* output filters */
  let filt=null;const pi=line.indexOf(" | ");if(pi>0){const f=line.slice(pi+3).trim();const m=/^(\S+)\s+(.+)$/.exec(f);line=line.slice(0,pi);
    if(m){const kw=["include","exclude","begin","section"].find(k=>k.startsWith(m[1].toLowerCase()));if(kw)filt={kw,re:m[2]}}
    if(!filt)return "% Invalid input detected at '^' marker.";}
  let toks=tokenize(line);let neg=false;
  const inCfg=x.mode!=="user"&&x.mode!=="priv";
  if(inCfg&&"do".startsWith(toks[0].toLowerCase())&&toks[0].length>=2&&toks.length>1){const save=x.mode;x.mode="priv";const o=run(x,toks.slice(1).join(" ")+(filt?" | "+filt.kw+" "+filt.re:""));if(x.mode==="priv")x.mode=save;return o}
  if(inCfg&&toks[0].toLowerCase()==="no"){neg=true;toks=toks.slice(1);if(!toks.length)return "% Incomplete command."}
  if(inCfg&&toks[0].toLowerCase()==="default"&&toks.length>1){neg=true;toks=toks.slice(1)}
  let modes;
  if(x.mode==="user")modes=["exec"];else if(x.mode==="priv")modes=["exec"];
  else if(x.mode==="config")modes=["config"];
  else modes=modeChain(x.mode);
  const r=find(modes,toks);
  if(r.err){if(r.err==="invalid")return invalidAt(x,raw,toks,r.at);return r.err}
  if(r.c.o.priv&&x.mode==="user")return invalidAt(x,raw,toks,0);
  if(neg&&r.c.o.noNeg)return invalidAt(x,raw,toks,0);
  /* a global command typed in a sub-mode drops back to global config, as IOS does */
  if(r.m==="config"&&SUB.includes(x.mode)){x.mode="config";x.ifs=[];x.sub=null}
  let out=r.c.fn(x.d,r.r.args,{...x,neg,x,toks,raw});
  if(out===INV)return invalidAt(x,raw,toks,0);
  if(out==null)out="";
  if(r.m!=="exec")x.d.cfgChanged=true;
  if(filt)out=applyFilter(out,filt);
  return out}
function invalidAt(x,raw,toks,at){
  const pr=IOS.prompt(x);let pos=0,s=raw,idx=0;for(let i=0;i<at&&i<toks.length;i++){idx=s.indexOf(toks[i],idx)+toks[i].length}
  const start=at<toks.length?s.indexOf(toks[at],idx):s.length;pos=pr.length+Math.max(0,start);
  return " ".repeat(pos)+"^\n% Invalid input detected at '^' marker."}
function applyFilter(out,f){const L=out.split("\n");let re;try{re=new RegExp(f.re,"i")}catch(e){return out}
  if(f.kw==="include")return L.filter(l=>re.test(l)).join("\n");
  if(f.kw==="exclude")return L.filter(l=>!re.test(l)).join("\n");
  if(f.kw==="begin"){const i=L.findIndex(l=>re.test(l));return i<0?"":L.slice(i).join("\n")}
  if(f.kw==="section"){const o=[];let on=false;L.forEach(l=>{if(/^\S/.test(l))on=re.test(l);if(on)o.push(l)});return o.join("\n")}
  return out}
IOS.run=run;IOS.INV=INV;IOS.PROMPT=PROMPT;

/* ---------- help (?) and tab completion ---------- */
function phLabel(pt,x){return {"<n>":"<0-4294967295>","<ip>":"A.B.C.D","<mask>":"A.B.C.D","<wc>":"A.B.C.D","<v6p>":"X:X:X:X::X/<0-128>","<v6>":"X:X:X:X::X","<w>":"WORD","<rest>":"LINE","<list>":"WORD","<if>":"Interface name"}[pt]||pt}
function helpOptions(x,line){
  let toks=tokenize(line);const trailing=/\s$/.test(line)||!line;const partial=trailing?"":toks.pop()||"";
  const inCfg=x.mode!=="user"&&x.mode!=="priv";
  if(inCfg&&toks[0]&&toks[0].toLowerCase()==="no")toks=toks.slice(1);
  let modes=x.mode==="user"||x.mode==="priv"?["exec"]:x.mode==="config"?["config"]:modeChain(x.mode);
  if(inCfg&&toks[0]&&toks[0].toLowerCase()==="do"){toks=toks.slice(1);modes=["exec"]}
  const opts=new Map();let cr=false;
  modes.forEach(m=>CMDS.filter(c=>c.m===m&&!(c.o.priv&&x.mode==="user")&&!c.o.hide).forEach(c=>{
    const r=tryMatch(c.p,toks);
    if(r.incomplete){const pt=c.p[r.j];if(pt[0]==="<"){if(!partial)opts.set(phLabel(pt),"")}else if(pt.toLowerCase().startsWith(partial.toLowerCase()))opts.set(pt,toks.length===0||m!=="exec"?(DESC[pt]||""):"")}
    else if(r.args&&!partial)cr=true}));
  return {opts:[...opts.entries()].sort((a,b)=>a[0]<b[0]?-1:1),cr,partial}}
function help(x,line){const h=helpOptions(x,line);
  if(!h.opts.length&&!h.cr)return "% Unrecognized command";
  if(h.partial)return h.opts.map(o=>o[0]).join("  ");
  const w=Math.max(12,...h.opts.map(o=>o[0].length+2));
  return h.opts.map(([k,v])=>"  "+k.padEnd(w)+v).join("\n")+(h.cr?"\n  <cr>":"")}
function complete(x,line){if(/\s$/.test(line)||!line)return null;const h=helpOptions(x,line);const kws=h.opts.map(o=>o[0]).filter(k=>!/[A-Z<]/.test(k[0])||/^[a-z]/.test(k));
  if(kws.length===1){const t=tokenize(line);t.pop();return [...t,kws[0]].join(" ")+" "}return null}
IOS.help=help;IOS.complete=complete;

/* ---------- helpers for handlers ---------- */
const eachIf=fn=>(d,a,o)=>{let out="";for(const i of o.x.ifs){const r=fn(d,i,a,o);if(r===INV)return INV;if(r)out=r}return out};
const swOnly=d=>d.kind==="router";
const IF=(pat,fn,o)=>C("if",pat,eachIf(fn),o);
Object.assign(IOS,{C,IF,eachIf,SUB,DESC,vlanList:s=>vlanList(s)});
function parseRange(d,rest){const out=[];for(const part of rest.split(",")){const p=part.trim();const m=/^(.*?)(\d+)\s*-\s*(\d+)$/.exec(p);
    if(m){const base=ifName(m[1].replace(/\s+/g,"")+m[2]);if(!base)return null;const pre=base.slice(0,base.length-m[2].length);for(let k=+m[2];k<=+m[3];k++){const n=pre+k;if(!d.ifs[n])return null;out.push(n)}}
    else{const n=ifName(p.replace(/\s+/g,""));if(!n||!d.ifs[n])return null;out.push(n)}}return out}
function vlanList(s){const out=[];for(const p of String(s).split(",")){const [a,b]=p.split("-").map(Number);if(!a&&a!==0)return null;for(let v=a;v<=(b||a);v++){if(v<1||v>4094)return null;out.push(v)}}return out}
const hashPw=s=>"$9$"+btoa(unescape(encodeURIComponent(s+"·salt"))).replace(/=/g,"").slice(0,12)+"."+(s.length*7919%99991).toString(36)+"Zq3kD1lP0dwE";
const type7=s=>{let h="";const k="dsfd;kfoA,.iyewrkldJKD";const sd=7;h=String(sd).padStart(2,"0");for(let i=0;i<s.length;i++)h+=(s.charCodeAt(i)^k.charCodeAt((sd+i)%k.length)).toString(16).toUpperCase().padStart(2,"0");return h};
IOS.hashPw=hashPw;IOS.type7=type7;

/* ================= EXEC ================= */
C("exec","enable",(d,a,o)=>{const x=o.x;if(x.mode==="priv")return "";if(d.secret||d.enablePw){x.pend={kind:"enable",prompt:"Password: ",hide:true};return ""}x.mode="priv";return ""});
C("exec","disable",(d,a,o)=>{o.x.mode="user";return ""});
["exit","logout","quit"].forEach(k=>C("exec",k,(d,a,o)=>{o.x.mode="user";return `\n${d.host} con0 is now available\n\n\n\n\n\nPress RETURN to get started.\n`}));
C("exec","configure terminal",(d,a,o)=>{o.x.mode="config";return "Enter configuration commands, one per line.  End with CNTL/Z."},{priv:1});
C("exec","configure",(d,a,o)=>{o.x.pend={kind:"conft",prompt:"Configuring from terminal, memory, or network [terminal]? "};return ""},{priv:1});
C("exec","terminal length <n>",()=>"");C("exec","terminal monitor",()=>"");C("exec","terminal no monitor",()=>"");
C("exec","write memory",(d)=>{d.saved=IOS.runningConfig(null,d);return "Building configuration...\n[OK]"},{priv:1});
C("exec","write",(d)=>{d.saved=IOS.runningConfig(null,d);return "Building configuration...\n[OK]"},{priv:1});
C("exec","copy running-config startup-config",(d,a,o)=>{o.x.pend={kind:"copyrs",prompt:"Destination filename [startup-config]? "};return ""},{priv:1});
C("exec","copy startup-config running-config",(d)=>d.saved?"Destination filename [running-config]? \n"+"1534 bytes copied in 0.083 secs (18482 bytes/sec)":"%Error opening nvram:/startup-config (No such file or directory)",{priv:1});
C("exec","copy <w> <w>",(d,a,o)=>IOS.copyFile(o.x,a[0],a[1]),{priv:1});
C("exec","erase startup-config",(d,a,o)=>{o.x.pend={kind:"erase",prompt:"Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]"};return ""},{priv:1});
C("exec","reload",(d,a,o)=>{o.x.pend={kind:"reload",prompt:(d.cfgChanged&&!d.saved?"\nSystem configuration has been modified. Save? [yes/no]: ":"Proceed with reload? [confirm]")};return ""},{priv:1});
C("exec","clear ip ospf process",(d,a,o)=>{if(!d.ospf&&!d.ospf6)return "";o.x.pend={kind:"clearospf",prompt:"Reset ALL OSPF processes? [no]: "};return ""},{priv:1});
C("exec","clear ip nat translation *",(d)=>{d.natClear=Date.now();return ""},{priv:1});
C("exec","clear mac address-table dynamic",()=>"",{priv:1});
C("exec","clear arp-cache",()=>"",{priv:1});
C("exec","clear counters",(d,a,o)=>{o.x.pend={kind:"yesno",prompt:"Clear \"show interface\" counters on all interfaces [confirm]"};return ""},{priv:1});
C("exec","clear errdisable interface <if>",(d,a)=>{const i=d.ifs[a[0]];if(i&&i.err){i.err=null;i.errCleared=1}return ""},{priv:1});
C("exec","ping",(d,a,o)=>{o.x.pend={kind:"xping",step:0,v:{},prompt:"Protocol [ip]: "};return ""},{priv:1});
C("exec","ping <ip>",(d,a,o)=>IOS.pingOut(o.x,a[0],4,{}));
C("exec","ping <v6>",(d,a,o)=>IOS.pingOut(o.x,a[0],6,{}));
C("exec","ping ipv6 <v6>",(d,a,o)=>IOS.pingOut(o.x,a[0],6,{}));
C("exec","ping <ip> source <if>",(d,a,o)=>{const i=d.ifs[a[1]];if(!i||i.ip===null)return "% Invalid source interface - "+a[1];return IOS.pingOut(o.x,a[0],4,{src:i.ip,srcIf:a[1]})});
C("exec","ping <ip> source <ip>",(d,a,o)=>IOS.pingOut(o.x,a[0],4,{src:a[1]}));
C("exec","ping <ip> repeat <n>",(d,a,o)=>IOS.pingOut(o.x,a[0],4,{n:Math.min(a[1],1000)}));
C("exec","ping <ip> size <n>",(d,a,o)=>IOS.pingOut(o.x,a[0],4,{size:a[1]}));
C("exec","traceroute <ip>",(d,a,o)=>IOS.traceOut(o.x,a[0],4));
C("exec","traceroute <v6>",(d,a,o)=>IOS.traceOut(o.x,a[0],6));
C("exec","traceroute ipv6 <v6>",(d,a,o)=>IOS.traceOut(o.x,a[0],6));
C("exec","ssh -l <w> <ip>",(d,a,o)=>{const r=IOS.ping(o.x.w,{dev:d},a[1],4,{proto:"tcp",port:22});return r.ok?"% Connection refused by remote host (this lab doesn't simulate the far end's login)":"% Destination unreachable; gateway or host down"});
C("exec","telnet <ip>",(d,a,o)=>{const r=IOS.ping(o.x.w,{dev:d},a[0],4,{proto:"tcp",port:23});return r.ok?`Trying ${ip4s(a[0])} ... \n% Connection refused by remote host`:`Trying ${ip4s(a[0])} ... \n% Destination unreachable; gateway or host down`});
C("exec","dir",()=>IOS.dirOut());C("exec","dir flash:",()=>IOS.dirOut());
C("exec","clock set <rest>",()=>"",{priv:1});

/* ================= GLOBAL CONFIG ================= */
const toConfig=(o)=>{o.x.mode="config";o.x.ifs=[];o.x.sub=null};
C("config if range line router rtr6 vlan nacl eacl pool tacacs radius raguard","end",(d,a,o)=>{o.x.mode="priv";o.x.ifs=[];return "",""},{noNeg:1});
C("config","exit",(d,a,o)=>{o.x.mode="priv";return ""},{noNeg:1});
C("if line router rtr6 vlan nacl eacl pool tacacs radius raguard","exit",(d,a,o)=>{toConfig(o);return ""},{noNeg:1});
C("config","hostname <w>",(d,a,o)=>{if(o.neg){d.host="Router";return ""}if(!/^[A-Za-z][\w-]{0,62}$/.test(a[0]))return "% Hostname contains one or more illegal characters.";d.host=a[0];return ""});
C("config","enable secret <w>",(d,a,o)=>{d.secret=o.neg?null:a[0];return ""});
C("config","enable secret 9 <w>",(d,a,o)=>{d.secret=o.neg?null:a[0];return ""},{hide:1});
C("config","enable secret",(d,a,o)=>{if(o.neg){d.secret=null;return ""}return INV},{hide:1});
C("config","enable password <w>",(d,a,o)=>{d.enablePw=o.neg?null:a[0];return d.secret&&!o.neg?"":""});
C("config","service password-encryption",(d,a,o)=>{d.pwEnc=!o.neg;return ""});
C("config","service timestamps log datetime msec",(d,a,o)=>{d.logging.ts=!o.neg;return ""});
C("config","service timestamps log datetime",(d,a,o)=>{d.logging.ts=!o.neg;return ""});
C("config","username <w> secret <w>",(d,a,o)=>{if(o.neg){delete d.users[a[0]];return ""}d.users[a[0]]={secret:a[1],priv:1};return ""});
C("config","username <w> privilege <n> secret <w>",(d,a,o)=>{if(o.neg){delete d.users[a[0]];return ""}if(a[1]>15)return INV;d.users[a[0]]={secret:a[2],priv:a[1]};return ""});
C("config","username <w> password <w>",(d,a,o)=>{if(o.neg){delete d.users[a[0]];return ""}d.users[a[0]]={pw:a[1],priv:1};return ""});
C("config","username <w> privilege <n> password <w>",(d,a,o)=>{if(o.neg){delete d.users[a[0]];return ""}d.users[a[0]]={pw:a[2],priv:a[1]};return ""});
C("config","username <w>",(d,a,o)=>{if(o.neg){delete d.users[a[0]];return ""}return "% Incomplete command."},{hide:1});
C("config","ip domain name <w>",(d,a,o)=>{d.domain=o.neg?null:a[0];return ""});
C("config","ip domain-name <w>",(d,a,o)=>{d.domain=o.neg?null:a[0];return ""});
C("config","ip domain lookup",()=>"");C("config","ip domain-lookup",()=>"");
C("config","ip name-server <rest>",(d,a,o)=>{const L=a.rest.map(ip4);if(L.some(n=>n===null))return INV;d.nameServers=o.neg?[]:L;return ""});
C("config","crypto key generate rsa",(d,a,o)=>{if(!d.domain)return "% Please define a domain-name first.";o.x.pend={kind:"rsa",prompt:`The name for the keys will be: ${d.host}.${d.domain}\nChoose the size of the key modulus in the range of 512 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n\nHow many bits in the modulus [2048]: `};return ""});
const rsaGen=(d,bits)=>{if(!d.domain)return "% Please define a domain-name first.";if(bits<512||bits>4096)return INV;d.rsa=bits;return `The name for the keys will be: ${d.host}.${d.domain}\n\n% The key modulus size is ${bits} bits\n% Generating ${bits} bit RSA keys, keys will be non-exportable...\n[OK] (elapsed time was 1 seconds)\n\n%SSH-5-ENABLED: SSH ${bits>=768?"1.99":"1.5"} has been enabled`};
C("config","crypto key generate rsa modulus <n>",(d,a)=>rsaGen(d,a[0]));
C("config","crypto key generate rsa general-keys modulus <n>",(d,a)=>rsaGen(d,a[0]));
C("config","crypto key zeroize rsa",(d)=>{d.rsa=0;return "% All keys will be removed.\n%SSH-5-DISABLED: SSH 2.0 has been disabled"});
C("config","ip ssh version <n>",(d,a,o)=>{if(o.neg){d.sshv=null;return ""}if(a[0]!==1&&a[0]!==2)return INV;if(a[0]===2&&d.rsa&&d.rsa<768)return "Please create RSA keys of at least 768 bits for SSH version 2";d.sshv=a[0];return ""});
C("config","ip ssh time-out <n>",()=>"");C("config","ip ssh authentication-retries <n>",()=>"");
C("config","ip scp server enable",(d,a,o)=>{d.scp=!o.neg;return ""});
C("config","ip http server",()=>"");C("config","ip http secure-server",()=>"");
C("config","banner motd <rest>",(d,a,o)=>{if(o.neg){d.banner=null;return ""}const s=a[0];const dl=s[0];const end=s.indexOf(dl,1);if(end<0){o.x.pend={kind:"banner",dl,text:s.slice(1),prompt:`Enter TEXT message.  End with the character '${dl}'.\n`};return ""}d.banner=s.slice(1,end);return ""});
C("config","banner login <rest>",(d,a,o)=>{const s=a[0];d.banner=o.neg?null:s.slice(1,s.indexOf(s[0],1)>0?s.indexOf(s[0],1):undefined);return ""});
C("config","interface <if>",(d,a,o)=>{let i=getIf(d,a[0],!o.neg);
  if(o.neg){const ii=d.ifs[a[0]];if(ii&&(/^(Loopback|Vlan|Tunnel|Port-channel)/.test(ii.name)||ii.name.includes("."))){delete d.ifs[a[0]];return ""}return "% Physical interfaces cannot be removed."}
  if(!i)return INV;o.x.ifs=[i];o.x.mode=a[0].includes(".")?"subif":"if";
  if(ifType(a[0])==="Vlan"&&!d.vlans[+ifNum(a[0])]){}return ""});
function ifNum(n){return n.slice(ifType(n).length)}
C("config","interface range <rest>",(d,a,o)=>{const L=parseRange(d,a[0]);if(!L||!L.length)return INV;o.x.ifs=L.map(n=>d.ifs[n]);o.x.mode="range";return ""});
C("config","line console <n>",(d,a,o)=>{if(a[0]!==0)return INV;o.x.mode="line";o.x.sub="con";return ""});
C("config","line con <n>",(d,a,o)=>{if(a[0]!==0)return INV;o.x.mode="line";o.x.sub="con";return ""},{hide:1});
C("config","line vty <n> <n>",(d,a,o)=>{if(a[0]>a[1]||a[1]>15)return INV;o.x.mode="line";o.x.sub="vty";d.vtyRange=[a[0],a[1]];return ""});
C("config","line vty <n>",(d,a,o)=>{o.x.mode="line";o.x.sub="vty";return ""},{hide:1});
C("config","vlan <list>",(d,a,o)=>{if(swOnly(d))return INV;const L=vlanList(a[0]);if(!L)return "Command rejected: Bad VLAN list - character #1 is a non-numeric\ncharacter ('"+a[0][0]+"').";
  if(o.neg){L.forEach(v=>{if(v!==1)delete d.vlans[v]});return L.includes(1)?"Default VLAN 1 may not be deleted.":""}
  L.forEach(v=>{if(!d.vlans[v])d.vlans[v]={name:"VLAN"+String(v).padStart(4,"0")}});o.x.mode="vlan";o.x.sub=L;return ""});
C("vlan","name <w>",(d,a,o)=>{o.x.sub.forEach(v=>d.vlans[v].name=o.neg?"VLAN"+String(v).padStart(4,"0"):a[0]);return ""});
C("config","ip routing",(d,a,o)=>{if(d.kind==="switch")return INV;d.ipRouting=!o.neg;return ""});
C("config","ipv6 unicast-routing",(d,a,o)=>{d.v6Routing=!o.neg;return ""});
C("config","ip default-gateway <ip>",(d,a,o)=>{d.defGw=o.neg?null:a[0];return ""});
function addRoute(d,n,len,rest,neg,vrf){
  const T=rest.slice();let nh=null,oif=null,ad=1,name=null,perm=false,track=null;vrf=vrf||null;
  const i0=ifName(T[0])&&/\d/.test(T[0])?ifName(T[0]):null;
  if(i0){if(!d.ifs[i0]&&i0!=="Null0")return INV;oif=i0;T.shift()}
  if(T.length&&ip4(T[0])!==null){nh=ip4(T.shift())}
  if(!nh&&!oif)return "% Incomplete command.";
  while(T.length){const t=T.shift();if(/^\d+$/.test(t)){ad=+t;if(ad<1||ad>255)return INV}else if(t==="name"){name=T.shift()}else if(t==="permanent")perm=true;else if(t==="track"){track=+T.shift();if(!(track>=1))return INV}else return INV}
  const N=pfx(n,len,4);if(N!==n)return "%Inconsistent address and mask";
  if(vrf&&!d.vrfs[vrf])return `% IP routing table ${vrf} does not exist. Create first`;
  const same=r=>r.n===N&&r.len===len&&r.nh===nh&&r.oif===oif&&(r.vrf||null)===vrf;
  if(neg){d.routes=d.routes.filter(r=>!(r.n===N&&r.len===len&&(r.vrf||null)===vrf&&(rest.length===0||same(r))));return ""}
  d.routes=d.routes.filter(r=>!same(r));d.routes.push({n:N,len,nh,oif,ad,name,perm,track,vrf});return ""}
IOS.addRoute=addRoute;
C("config","ip route <ip> <ip> <rest>",(d,a,o)=>{const len=maskLen(ip4s(a[1]));if(len===null)return "%Inconsistent address and mask";return addRoute(d,a[0],len,a.rest,o.neg)});
C("config","ip route <ip> <ip>",(d,a,o)=>{if(!o.neg)return "% Incomplete command.";const len=maskLen(ip4s(a[1]));d.routes=d.routes.filter(r=>!(r.n===a[0]&&r.len===len));return ""},{hide:1});
C("config","ipv6 route <v6p> <rest>",(d,a,o)=>{const T=a.rest.slice();let nh=null,oif=null,ad=1;
  const i0=ifName(T[0])&&/\d/.test(T[0])?ifName(T[0]):null;if(i0){if(!d.ifs[i0])return INV;oif=i0;T.shift()}
  if(T.length&&ip6(T[0])!==null)nh=ip6(T.shift());if(T.length&&/^\d+$/.test(T[0]))ad=+T.shift();if(T.length||(!nh&&!oif))return INV;
  const N=pfx(a[0].n,a[0].len,6);const same=r=>r.n===N&&r.len===a[0].len&&r.nh===nh&&r.oif===oif;
  d.routes6=d.routes6.filter(r=>!same(r));if(!o.neg)d.routes6.push({n:N,len:a[0].len,nh,oif,ad});return ""});
/* OSPF */
C("config","router ospf <n>",(d,a,o)=>{if(o.neg){d.ospf=null;return ""}if(a[0]<1||a[0]>65535)return INV;if(d.ospf&&d.ospf.pid!==a[0])return "% Only one OSPF process is supported in this simulator";
  d.ospf=d.ospf||{pid:a[0],rid:null,activeRid:null,nets:[],passive:[],nonPassive:[],passiveDefault:false,defOrig:false,refBw:100,maxPaths:4};o.x.mode="router";return ""});
C("config","ipv6 router ospf <n>",(d,a,o)=>{if(o.neg){d.ospf6=null;return ""}d.ospf6=d.ospf6||{pid:a[0],rid:null,activeRid:null,passive:[],nonPassive:[],passiveDefault:false,defOrig:false,refBw:100};o.x.mode="rtr6";return ""});
C("router rtr6","router-id <ip>",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;if(o.neg){p.rid=null;return ""}const had=p.activeRid;p.rid=a[0];
  if(had!=null&&had!==a[0])return "% OSPF: Reload or use \"clear ip ospf process\" command, for this to take effect";if(had==null)p.activeRid=a[0];return ""});
C("router","network <ip> <wc> area <n>",(d,a,o)=>{const p=d.ospf;const same=n=>n.net===(a[0]&~a[1])&&n.wild===a[1];
  if(o.neg){p.nets=p.nets.filter(n=>!same(n));return ""}if(p.nets.some(same)){p.nets.find(same).area=a[2];return ""}p.nets.push({net:a[0]&~a[1],wild:a[1],area:a[2],raw:[ip4s(a[0]),ip4s(a[1])]});return ""});
C("router","network <ip> <ip> area <n>",(d,a,o)=>{if(!isWild(ip4s(a[1])))return "% OSPF: Invalid address/mask combination (discontiguous mask)";return ""},{hide:1});
C("router rtr6","passive-interface <if>",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;if(!d.ifs[a[0]])return INV;
  if(o.neg){p.passive=p.passive.filter(n=>n!==a[0]);if(p.passiveDefault&&!p.nonPassive.includes(a[0]))p.nonPassive.push(a[0])}else{if(!p.passive.includes(a[0]))p.passive.push(a[0]);p.nonPassive=p.nonPassive.filter(n=>n!==a[0])}return ""});
C("router rtr6","passive-interface default",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;p.passiveDefault=!o.neg;p.nonPassive=[];p.passive=[];return ""});
C("router rtr6","default-information originate",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;p.defOrig=!o.neg;p.defAlways=false;return ""});
C("router rtr6","default-information originate always",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;p.defOrig=!o.neg;p.defAlways=!o.neg;return ""});
C("router rtr6","auto-cost reference-bandwidth <n>",(d,a,o)=>{const p=o.x.mode==="rtr6"?d.ospf6:d.ospf;p.refBw=o.neg?100:a[0];return "% OSPF: Reference bandwidth is changed.\n        Please ensure reference bandwidth is consistent across all routers."});
C("router rtr6","maximum-paths <n>",()=>"");
C("router","log-adjacency-changes",()=>"");
/* DHCP */
C("config","ip dhcp excluded-address <ip>",(d,a,o)=>{if(o.neg)d.excl=d.excl.filter(e=>e[0]!==a[0]);else d.excl.push([a[0],null]);return ""});
C("config","ip dhcp excluded-address <ip> <ip>",(d,a,o)=>{if(o.neg)d.excl=d.excl.filter(e=>!(e[0]===a[0]&&e[1]===a[1]));else{if(a[1]<a[0])return "% Invalid IP address range";d.excl.push([a[0],a[1]])}return ""});
C("config","ip dhcp pool <w>",(d,a,o)=>{if(o.neg){delete d.pools[a[0]];return ""}d.pools[a[0]]=d.pools[a[0]]||{net:null,len:null,gw:null,dns:[],domain:null,lease:null};o.x.mode="pool";o.x.sub=a[0];return ""});
C("pool","network <ip> <ip>",(d,a,o)=>{const p=d.pools[o.x.sub];const len=maskLen(ip4s(a[1]));if(len===null)return INV;if(o.neg){p.net=null;return ""}p.net=pfx(a[0],len,4);p.len=len;return ""});
C("pool","network <ip> /<n>",()=>INV,{hide:1});
C("pool","default-router <ip>",(d,a,o)=>{d.pools[o.x.sub].gw=o.neg?null:a[0];return ""});
C("pool","dns-server <rest>",(d,a,o)=>{const L=a.rest.map(ip4);if(L.some(n=>n===null))return INV;d.pools[o.x.sub].dns=o.neg?[]:L;return ""});
C("pool","domain-name <w>",(d,a,o)=>{d.pools[o.x.sub].domain=o.neg?null:a[0];return ""});
C("pool","lease <rest>",(d,a,o)=>{d.pools[o.x.sub].lease=o.neg?null:a[0];return ""});
/* ACLs */
function aclGet(d,name,type){let A=d.acls[name];if(!A)A=d.acls[name]={name,type,entries:[],numbered:/^\d+$/.test(name)};return A}
function aclType(num){num=+num;return (num>=1&&num<=99)||(num>=1300&&num<=1999)?"standard":(num>=100&&num<=199)||(num>=2000&&num<=2699)?"extended":null}
function addAce(A,act,tk,seq){if(act==="remark"){A.entries.push({remark:tk.join(" "),seq:seq??nextSeq(A)});return ""}
  const e=parseAce(A.type,tk);if(!e)return INV;e.act=act;e.seq=seq??nextSeq(A);
  if(A.entries.some(x=>x.seq===e.seq))return "% Duplicate sequence number";
  A.entries.push(e);A.entries.sort((p,q)=>p.seq-q.seq);return ""}
const nextSeq=A=>(A.entries.length?Math.max(...A.entries.map(e=>e.seq)):0)+10;
C("config","access-list <n> <rest>",(d,a,o)=>{const t=aclType(a[0]);if(!t)return INV;const name=String(a[0]);
  if(o.neg){delete d.acls[name];return ""}
  const T=a.rest;const act=(T[0]||"").toLowerCase();const k=["permit","deny","remark"].find(x=>x.startsWith(act)&&act.length>=1);if(!k)return INV;
  const A=aclGet(d,name,t);return addAce(A,k,T.slice(1))});
C("config","access-list <n>",(d,a,o)=>{if(o.neg){delete d.acls[String(a[0])];return ""}return "% Incomplete command."},{hide:1});
C("config","ip access-list standard <w>",(d,a,o)=>{if(o.neg){delete d.acls[a[0]];return ""}if(/^\d+$/.test(a[0])&&aclType(a[0])!=="standard")return INV;const A=aclGet(d,a[0],"standard");if(A.type!=="standard")return "% A named extended IP access list with this name already exists";o.x.mode="nacl";o.x.sub=a[0];return ""});
C("config","ip access-list extended <w>",(d,a,o)=>{if(o.neg){delete d.acls[a[0]];return ""}if(/^\d+$/.test(a[0])&&aclType(a[0])!=="extended")return INV;const A=aclGet(d,a[0],"extended");if(A.type!=="extended")return "% A named standard IP access list with this name already exists";o.x.mode="eacl";o.x.sub=a[0];return ""});
["nacl","eacl"].forEach(m=>{
  ["permit","deny","remark"].forEach(act=>{C(m,act+" <rest>",(d,a,o)=>{const A=d.acls[o.x.sub];if(o.neg){const s=a.rest.join(" ");A.entries=A.entries.filter(e=>IOS.aceCfg(A,e)!==act+" "+s);return ""}return addAce(A,act,a.rest)})});
  C(m,"<n> <rest>",(d,a,o)=>{const A=d.acls[o.x.sub];const T=a.rest;const act=["permit","deny","remark"].find(x=>x.startsWith((T[0]||"").toLowerCase())&&T[0]);if(!act)return INV;return addAce(A,act,T.slice(1),a[0])});
  C(m,"<n>",(d,a,o)=>{if(!o.neg)return "% Incomplete command.";const A=d.acls[o.x.sub];A.entries=A.entries.filter(e=>e.seq!==a[0]);return ""},{hide:1});
});
/* NAT */
C("config","ip nat inside source list <w> interface <if> overload",(d,a,o)=>{const k=r=>r.acl===a[0];d.nat.rules=d.nat.rules.filter(r=>!k(r));if(!o.neg){if(!d.ifs[a[1]])return INV;d.nat.rules.push({acl:a[0],oif:a[1],overload:true})}return ""});
C("config","ip nat inside source list <w> pool <w> overload",(d,a,o)=>{d.nat.rules=d.nat.rules.filter(r=>r.acl!==a[0]);if(!o.neg){if(!d.nat.pools[a[1]])return `%Pool ${a[1]} not found`;d.nat.rules.push({acl:a[0],pool:a[1],overload:true})}return ""});
C("config","ip nat inside source list <w> pool <w>",(d,a,o)=>{d.nat.rules=d.nat.rules.filter(r=>r.acl!==a[0]);if(!o.neg){if(!d.nat.pools[a[1]])return `%Pool ${a[1]} not found`;d.nat.rules.push({acl:a[0],pool:a[1],overload:false})}return ""});
C("config","ip nat inside source static <ip> <ip>",(d,a,o)=>{d.nat.statics=d.nat.statics.filter(s=>s.local!==a[0]);if(!o.neg)d.nat.statics.push({local:a[0],global:a[1]});return ""});
C("config","ip nat inside source static tcp <ip> <n> <ip> <n>",(d,a,o)=>{d.nat.statics=d.nat.statics.filter(s=>!(s.local===a[0]&&s.lport===a[1]));if(!o.neg)d.nat.statics.push({local:a[0],global:a[2],proto:"tcp",lport:a[1],gport:a[3]});return ""});
C("config","ip nat pool <w> <ip> <ip> netmask <ip>",(d,a,o)=>{if(o.neg){delete d.nat.pools[a[0]];return ""}const len=maskLen(ip4s(a[3]));if(len===null)return "%Pool "+a[0]+" mask "+ip4s(a[3])+" is invalid";d.nat.pools[a[0]]={start:a[1],end:a[2],len};return ""});
C("config","ip nat pool <w> <ip> <ip> prefix-length <n>",(d,a,o)=>{if(o.neg){delete d.nat.pools[a[0]];return ""}d.nat.pools[a[0]]={start:a[1],end:a[2],len:a[3]};return ""});
/* STP and L2 security */
C("config","spanning-tree mode <w>",(d,a,o)=>{if(swOnly(d))return INV;const m=["pvst","rapid-pvst","mst"].find(k=>k.startsWith(a[0].toLowerCase()));if(!m)return INV;d.stp.mode=o.neg?"rapid-pvst":m;return ""});
const PRI_ERR="% Bridge Priority must be in increments of 4096.\n% Allowed values are:\n  0     4096  8192  12288 16384 20480 24576 28672\n  32768 36864 40960 45056 49152 53248 57344 61440";
C("config","spanning-tree vlan <list> priority <n>",(d,a,o)=>{if(swOnly(d))return INV;const L=vlanList(a[0]);if(!L)return INV;if(o.neg){L.forEach(v=>delete d.stp.pri[v]);return ""}if(a[1]%4096||a[1]>61440)return PRI_ERR;L.forEach(v=>d.stp.pri[v]=a[1]);return ""});
C("config","spanning-tree vlan <list> root primary",(d,a,o)=>{if(swOnly(d))return INV;const L=vlanList(a[0]);if(!L)return INV;L.forEach(v=>{if(o.neg){delete d.stp.pri[v];return}const T=IOS.stp(o.x.w,v);const rp=T&&T.root!==d?(T.root.stp.pri[v]??32768):32768;d.stp.pri[v]=Math.max(0,Math.min(24576,rp-4096))});return ""});
C("config","spanning-tree vlan <list> root secondary",(d,a,o)=>{if(swOnly(d))return INV;const L=vlanList(a[0]);if(!L)return INV;L.forEach(v=>{if(o.neg)delete d.stp.pri[v];else d.stp.pri[v]=28672});return ""});
C("config","spanning-tree portfast default",(d,a,o)=>{if(swOnly(d))return INV;d.stp.pfDefault=!o.neg;return o.neg?"":"%Warning: this command enables portfast by default on all interfaces. You\n should now disable portfast explicitly on switched ports leading to hubs,\n switches and bridges as they may create temporary bridging loops."});
C("config","spanning-tree portfast edge default",(d,a,o)=>{if(swOnly(d))return INV;d.stp.pfDefault=!o.neg;return ""},{hide:1});
C("config","spanning-tree portfast bpduguard default",(d,a,o)=>{if(swOnly(d))return INV;d.stp.bgDefault=!o.neg;return ""});
C("config","spanning-tree portfast edge bpduguard default",(d,a,o)=>{if(swOnly(d))return INV;d.stp.bgDefault=!o.neg;return ""},{hide:1});
C("config","ip dhcp snooping",(d,a,o)=>{if(swOnly(d))return INV;d.snoop.on=!o.neg;return ""});
C("config","ip dhcp snooping vlan <list>",(d,a,o)=>{if(swOnly(d))return INV;if(!vlanList(a[0]))return INV;if(o.neg)d.snoop.vlans=d.snoop.vlans.filter(v=>v!==a[0]);else if(!d.snoop.vlans.includes(a[0]))d.snoop.vlans.push(a[0]);return ""});
C("config","ip dhcp snooping information option",(d,a,o)=>{if(swOnly(d))return INV;d.snoop.opt82=!o.neg;return ""});
C("config","ip arp inspection vlan <list>",(d,a,o)=>{if(swOnly(d))return INV;if(!vlanList(a[0]))return INV;if(o.neg)d.dai=d.dai.filter(v=>v!==a[0]);else if(!d.dai.includes(a[0]))d.dai.push(a[0]);return ""});
C("config","ipv6 nd raguard policy <w>",(d,a,o)=>{if(swOnly(d))return INV;if(o.neg){delete d.raPol[a[0]];return ""}d.raPol[a[0]]=d.raPol[a[0]]||{role:"host"};o.x.mode="raguard";o.x.sub=a[0];return ""});
C("raguard","device-role <w>",(d,a,o)=>{const r=["host","router","monitor","switch"].find(k=>k.startsWith(a[0]));if(!r)return INV;d.raPol[o.x.sub].role=o.neg?"host":r;return ""});
C("config","errdisable recovery cause <w>",()=>"");C("config","errdisable recovery interval <n>",()=>"");
C("config","lldp run",(d,a,o)=>{d.lldp=!o.neg;return ""});
C("config","cdp run",(d,a,o)=>{d.cdp=!o.neg;return ""});
C("config","mac address-table static <rest>",()=>"");
C("config","vtp mode <w>",()=>"");
/* AAA */
C("config","aaa new-model",(d,a,o)=>{d.aaa=!o.neg;if(o.neg)d.aaaLogin=null;return ""});
C("config","aaa authentication login default <rest>",(d,a,o)=>{if(!d.aaa)return INV;if(o.neg){d.aaaLogin=null;return ""}const s=a[0];if(!/^(group (tacacs\+|radius|\S+)( group \S+)*( local)?|local)$/.test(s))return INV;d.aaaLogin=s;return ""});
C("config","aaa authorization exec default <rest>",(d,a,o)=>{if(!d.aaa)return INV;d.aaaAuthz=o.neg?null:a[0];return ""});
C("config","aaa accounting exec default start-stop group <w>",(d,a,o)=>{if(!d.aaa)return INV;d.aaaAcct=o.neg?null:a[0];return ""});
C("config","tacacs server <w>",(d,a,o)=>{if(o.neg){delete d.tacacs[a[0]];return ""}d.tacacs[a[0]]=d.tacacs[a[0]]||{addr:null,key:null};o.x.mode="tacacs";o.x.sub=a[0];return ""});
C("tacacs","address ipv4 <ip>",(d,a,o)=>{d.tacacs[o.x.sub].addr=o.neg?null:a[0];return ""});
C("tacacs","key <w>",(d,a,o)=>{d.tacacs[o.x.sub].key=o.neg?null:a[0];return ""});
C("config","radius server <w>",(d,a,o)=>{if(o.neg){delete d.radius[a[0]];return ""}d.radius[a[0]]=d.radius[a[0]]||{addr:null,key:null};o.x.mode="radius";o.x.sub=a[0];return ""});
C("radius","address ipv4 <ip>",(d,a,o)=>{d.radius[o.x.sub].addr=o.neg?null:a[0];return ""});
C("radius","address ipv4 <ip> auth-port <n> acct-port <n>",(d,a,o)=>{const r=d.radius[o.x.sub];r.addr=o.neg?null:a[0];r.ports=[a[1],a[2]];return ""});
C("radius","key <w>",(d,a,o)=>{d.radius[o.x.sub].key=o.neg?null:a[0];return ""});
/* management */
C("config","logging host <ip>",(d,a,o)=>{d.logging.hosts=d.logging.hosts.filter(h=>h!==a[0]);if(!o.neg)d.logging.hosts.push(a[0]);return ""});
C("config","logging <ip>",(d,a,o)=>{d.logging.hosts=d.logging.hosts.filter(h=>h!==a[0]);if(!o.neg)d.logging.hosts.push(a[0]);return ""},{hide:1});
const LV=["emergencies","alerts","critical","errors","warnings","notifications","informational","debugging"];
C("config","logging trap <w>",(d,a,o)=>{const t=a[0].toLowerCase();let lv=/^\d$/.test(t)?+t:LV.findIndex(k=>k.startsWith(t));if(lv<0||lv>7)return INV;d.logging.trap=o.neg?null:lv;return ""});
C("config","logging buffered",(d,a,o)=>{d.logging.buffered=!o.neg;return ""});
C("config","logging buffered <rest>",(d,a,o)=>{d.logging.buffered=!o.neg;return ""});
C("config","logging console <w>",()=>"");
C("config","snmp-server community <w>",(d,a,o)=>{if(o.neg){d.snmp.comm=d.snmp.comm.filter(c=>c.name!==a[0]);return ""}d.snmp.comm=d.snmp.comm.filter(c=>c.name!==a[0]);d.snmp.comm.push({name:a[0],rw:"RO"});return ""});
C("config","snmp-server community <w> <w>",(d,a,o)=>{const rw=a[1].toUpperCase();if(rw!=="RO"&&rw!=="RW")return INV;d.snmp.comm=d.snmp.comm.filter(c=>c.name!==a[0]);if(!o.neg)d.snmp.comm.push({name:a[0],rw});return ""});
C("config","snmp-server community <w> <w> <w>",(d,a,o)=>{const rw=a[1].toUpperCase();if(rw!=="RO"&&rw!=="RW")return INV;d.snmp.comm=d.snmp.comm.filter(c=>c.name!==a[0]);if(!o.neg)d.snmp.comm.push({name:a[0],rw,acl:a[2]});return ""});
C("config","snmp-server location <rest>",(d,a,o)=>{d.snmp.loc=o.neg?null:a[0];return ""});
C("config","snmp-server contact <rest>",(d,a,o)=>{d.snmp.contact=o.neg?null:a[0];return ""});
C("config","snmp-server host <ip> version <w> <w>",(d,a,o)=>{d.snmp.hosts=d.snmp.hosts.filter(h=>h.ip!==a[0]);if(!o.neg)d.snmp.hosts.push({ip:a[0],v:a[1],c:a[2]});return ""});
C("config","snmp-server host <ip> version 3 priv <w>",(d,a,o)=>{d.snmp.hosts=d.snmp.hosts.filter(h=>h.ip!==a[0]);if(!o.neg)d.snmp.hosts.push({ip:a[0],v:"3 priv",c:a[1]});return ""});
C("config","snmp-server group <w> v3 priv",(d,a,o)=>{d.snmp.groups=(d.snmp.groups||[]).filter(g=>g!==a[0]);if(!o.neg)d.snmp.groups.push(a[0]);return ""});
C("config","snmp-server user <w> <w> v3 auth sha <w> priv aes 128 <w>",(d,a,o)=>{d.snmp.v3=d.snmp.v3.filter(u=>u.u!==a[0]);if(!o.neg){if(!(d.snmp.groups||[]).includes(a[1]))d.snmp.groups=(d.snmp.groups||[]).concat(a[1]);d.snmp.v3.push({u:a[0],g:a[1]})}return ""});
C("config","snmp-server enable traps",(d,a,o)=>{d.snmp.traps=!o.neg;return ""});
C("config","ntp server <ip>",(d,a,o)=>{d.ntp=d.ntp.filter(n=>n!==a[0]);if(!o.neg)d.ntp.push(a[0]);return ""});
C("config","clock timezone <w> <rest>",(d,a,o)=>{d.clockTz=o.neg?null:a[0]+" "+a[1];return ""});

/* ================= LINE ================= */
C("line","password <w>",(d,a,o)=>{d.lines[o.x.sub].pw=o.neg?null:a[0];return ""});
C("line","password 7 <w>",(d,a,o)=>{d.lines[o.x.sub].pw=o.neg?null:a[0];return ""},{hide:1});
C("line","login",(d,a,o)=>{const L=d.lines[o.x.sub];if(o.neg){L.login=false;L.local=false;return ""}L.login=true;L.local=false;return L.pw?"":"% Login disabled on line "+(o.x.sub==="con"?"0":"1")+", until 'password' is set"});
C("line","login local",(d,a,o)=>{const L=d.lines[o.x.sub];L.local=!o.neg;if(!o.neg)L.login=false;return ""});
C("line","login authentication default",(d,a,o)=>{d.lines[o.x.sub].aaa=!o.neg;return ""});
C("line","transport input <rest>",(d,a,o)=>{if(o.x.sub!=="vty")return INV;const T=a.rest.map(t=>["ssh","telnet","all","none"].find(k=>k.startsWith(t.toLowerCase())));if(T.some(t=>!t))return INV;d.lines.vty.transport=o.neg?null:T.join(" ");return ""});
C("line","transport output <rest>",()=>"");
C("line","exec-timeout <n> <n>",(d,a,o)=>{d.lines[o.x.sub].timeout=o.neg?null:[a[0],a[1]];return ""});
C("line","exec-timeout <n>",(d,a,o)=>{d.lines[o.x.sub].timeout=o.neg?null:[a[0],0];return ""});
C("line","logging synchronous",(d,a,o)=>{d.lines[o.x.sub].sync=!o.neg;return ""});
C("line","access-class <w> in",(d,a,o)=>{if(o.x.sub!=="vty")return INV;d.lines.vty.acl=o.neg?null:a[0];return ""});
C("line","privilege level <n>",()=>"");
C("line","history size <n>",()=>"");

/* ================= INTERFACE ================= */
IF("description <rest>",(d,i,a,o)=>{i.desc=o.neg?"":a[0]});
IF("shutdown",(d,i,a,o)=>{i.shut=!o.neg;if(o.neg&&i.err){i.err=null}});
IF("ip address <ip> <ip>",(d,i,a,o)=>{if(!i.l3)return INV;const len=maskLen(ip4s(a[1]));if(len===null)return "Bad mask /"+ip4s(a[1])+" for address "+ip4s(a[0]);
  if(o.neg){i.ip=null;i.len=null;i.sec=[];return}
  if(len<31&&(pfx(a[0],len,4)===a[0]||(a[0]|((1n<<BigInt(32-len))-1n))===a[0]))return "Bad mask /"+len+" for address "+ip4s(a[0]);
  for(const j of Object.values(d.ifs)){if(j===i||j.ip===null||(j.vrf||null)!==(i.vrf||null))continue;if(inNet(a[0],j.ip,Math.min(len,j.len),4))return `% ${ip4s(pfx(a[0],len,4))} overlaps with ${ifShort(j.name)}`}
  i.ip=a[0];i.len=len;i.dhcp=false});
IF("ip address <ip> <ip> secondary",(d,i,a,o)=>{if(!i.l3)return INV;const len=maskLen(ip4s(a[1]));if(len===null)return INV;i.sec=i.sec.filter(s=>s.n!==a[0]);if(!o.neg)i.sec.push({n:a[0],len})});
IF("ip address dhcp",(d,i,a,o)=>{if(!i.l3)return INV;i.dhcp=!o.neg;if(!o.neg){i.ip=null;i.len=null}});
IF("ip address",(d,i,a,o)=>{if(!o.neg)return "% Incomplete command.";i.ip=null;i.len=null;i.dhcp=false;i.sec=[]},{hide:1});
IF("ipv6 address <v6p>",(d,i,a,o)=>{if(!i.l3)return INV;const n=a[0];i.v6=i.v6.filter(x=>!(x.n===n.n&&x.len===n.len&&!x.eui&&!x.ll));if(!o.neg)i.v6.push({n:n.n,len:n.len})});
IF("ipv6 address <v6p> eui-64",(d,i,a,o)=>{if(!i.l3)return INV;const n=a[0];i.v6=i.v6.filter(x=>!(x.eui&&x.len===n.len&&IOS.pfx(x.n,64,6)===IOS.pfx(n.n,64,6)));if(!o.neg){if(n.len>64)return "% Interface identifier would overwrite the network prefix";i.v6.push({n:pfx(n.n,64,6),len:n.len,eui:true})}});
IF("ipv6 address <v6> link-local",(d,i,a,o)=>{if(!i.l3)return INV;i.v6=i.v6.filter(x=>!x.ll);if(!o.neg){if((a[0]>>118n)!==(0xfe80n>>6n))return "% Invalid link-local address";i.v6.push({n:a[0],len:64,ll:true})}});
IF("ipv6 address autoconfig",(d,i,a,o)=>{if(!i.l3)return INV;i.v6auto=!o.neg});
IF("ipv6 enable",(d,i,a,o)=>{if(!i.l3)return INV;i.v6en=!o.neg});
IF("ipv6 address",(d,i,a,o)=>{if(!o.neg)return "% Incomplete command.";i.v6=[]},{hide:1});
IF("ipv6 ospf <n> area <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg){i.ospf6=null;return}if(!d.v6Routing)return "% IPv6 routing not enabled";i.ospf6={pid:a[0],area:a[1]};d.ospf6=d.ospf6||{pid:a[0],rid:null,activeRid:null,passive:[],nonPassive:[],passiveDefault:false,defOrig:false,refBw:100};
  if(IOS.ospfRid(o.x.w,d,true)==null)return `%OSPFv3-4-NORTRID: Process OSPFv3-${a[0]}-IPv6 could not pick a router-id,\nplease configure manually`});
IF("ip ospf <n> area <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg){delete i.ospf.area;delete i.ospf.pid;return}i.ospf.area=a[1];i.ospf.pid=a[0];if(!d.ospf)d.ospf={pid:a[0],rid:null,activeRid:null,nets:[],passive:[],nonPassive:[],passiveDefault:false,defOrig:false,refBw:100}});
IF("ip ospf cost <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg)delete i.ospf.cost;else if(a[0]<1||a[0]>65535)return INV;else i.ospf.cost=a[0]});
IF("ip ospf priority <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg)delete i.ospf.pri;else if(a[0]>255)return INV;else i.ospf.pri=a[0]});
IF("ip ospf hello-interval <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg)delete i.ospf.hello;else i.ospf.hello=a[0]});
IF("ip ospf hello-interval",(d,i,a,o)=>{if(o.neg){delete i.ospf.hello;return}return "% Incomplete command."},{hide:1});
IF("ip ospf dead-interval",(d,i,a,o)=>{if(o.neg){delete i.ospf.dead;return}return "% Incomplete command."},{hide:1});
IF("ip ospf cost",(d,i,a,o)=>{if(o.neg){delete i.ospf.cost;return}return "% Incomplete command."},{hide:1});
IF("ip ospf priority",(d,i,a,o)=>{if(o.neg){delete i.ospf.pri;return}return "% Incomplete command."},{hide:1});
IF("ip ospf dead-interval <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg)delete i.ospf.dead;else i.ospf.dead=a[0]});
IF("ip ospf network <w>",(d,i,a,o)=>{if(!i.l3)return INV;const t=["point-to-point","broadcast","non-broadcast"].find(k=>k.startsWith(a[0].toLowerCase()));if(!t)return INV;if(o.neg)delete i.ospf.net;else i.ospf.net=t});
IF("bandwidth <n>",(d,i,a,o)=>{i.bw=o.neg?null:a[0]});
IF("ip helper-address <ip>",(d,i,a,o)=>{if(!i.l3)return INV;i.helper=i.helper.filter(h=>h!==a[0]);if(!o.neg)i.helper.push(a[0])});
IF("ip nat inside",(d,i,a,o)=>{if(!i.l3)return INV;i.nat=o.neg?null:"inside"});
IF("ip nat outside",(d,i,a,o)=>{if(!i.l3)return INV;i.nat=o.neg?null:"outside"});
IF("ip access-group <w> in",(d,i,a,o)=>{if(!i.l3)return INV;i.acl.in=o.neg?null:a[0]});
IF("ip access-group <w> out",(d,i,a,o)=>{if(!i.l3)return INV;i.acl.out=o.neg?null:a[0]});
IF("encapsulation dot1q <n>",(d,i,a,o)=>{if(!i.name.includes("."))return "% Configuring IEEE 802.1Q encapsulation is not permitted on the main interface";if(a[0]<1||a[0]>4094)return INV;i.encap=o.neg?null:a[0];i.encapNative=false});
IF("encapsulation dot1q <n> native",(d,i,a,o)=>{if(!i.name.includes("."))return "% Configuring IEEE 802.1Q encapsulation is not permitted on the main interface";i.encap=o.neg?null:a[0];i.encapNative=!o.neg});
IF("speed <w>",(d,i,a,o)=>{const s=a[0].toLowerCase();if(!["10","100","1000","auto"].includes(s))return INV;i.speed=o.neg?"auto":s});
IF("duplex <w>",(d,i,a,o)=>{const s=["full","half","auto"].find(k=>k.startsWith(a[0].toLowerCase()));if(!s)return INV;i.duplex=o.neg?"auto":s});
IF("mdix auto",()=>"");IF("negotiation auto",()=>"");
IF("cdp enable",(d,i,a,o)=>{i.cdp=!o.neg});
IF("lldp transmit",(d,i,a,o)=>{i.lldpTx=o.neg?false:true});IF("lldp receive",(d,i,a,o)=>{i.lldpRx=o.neg?false:true});
IF("standby version <n>",(d,i,a,o)=>{i.hsrpV=o.neg?1:a[0]});
const hs=(i,g)=>i.hsrp[g]||(i.hsrp[g]={ip:null,pri:null,preempt:false});
IF("standby <n> ip <ip>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg){delete i.hsrp[a[0]];return}hs(i,a[0]).ip=a[1]});
IF("standby <n> priority <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(a[1]>255)return INV;hs(i,a[0]).pri=o.neg?null:a[1]});
IF("standby <n> preempt",(d,i,a,o)=>{if(!i.l3)return INV;hs(i,a[0]).preempt=!o.neg});
const vr=(i,g)=>i.vrrp[g]||(i.vrrp[g]={ip:null,pri:null,preempt:true});
IF("vrrp <n> ip <ip>",(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg){delete i.vrrp[a[0]];return}vr(i,a[0]).ip=a[1]});
IF("vrrp <n> priority <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(a[1]>254)return INV;vr(i,a[0]).pri=o.neg?null:a[1]});
IF("vrrp <n> preempt",(d,i,a,o)=>{if(!i.l3)return INV;vr(i,a[0]).preempt=!o.neg});
/* switchport */
const L2=fn=>(d,i,a,o)=>{if(d.kind==="router")return INV;if(i.l3&&!/^Port-channel/.test(i.name))return "% Command rejected: "+i.name+" is not a switchport. Use the \"switchport\" command first.";const r=fn(d,i,a,o);const pm=/^Port-channel(\d+)$/.exec(i.name);if(pm&&!r)Object.values(d.ifs).forEach(j=>{if(j.cg&&String(j.cg.n)===pm[1])j.sw={...j.sw,mode:i.sw.mode,access:i.sw.access,native:i.sw.native,allowed:i.sw.allowed,noneg:i.sw.noneg,dyn:i.sw.dyn}});return r};
IF("switchport",(d,i,a,o)=>{if(d.kind!=="l3")return d.kind==="router"?INV:"";if(/^(Vlan|Loopback)/.test(i.name))return INV;i.l3=!!o.neg;if(o.neg){i.sw.mode="access"}else{i.ip=null}});
IF("switchport mode <w>",L2((d,i,a,o)=>{const m=["access","trunk","dynamic"].find(k=>k.startsWith(a[0].toLowerCase()));if(!m)return INV;i.sw.mode=o.neg?"auto":m==="dynamic"?"auto":m;if(i.ps&&i.sw.mode!=="access"){return "Command rejected: "+i.name+" has port security enabled."}}));
IF("switchport mode dynamic <w>",L2((d,i,a,o)=>{i.sw.mode="auto";i.sw.dyn=a[0]}),{hide:1});
IF("switchport access vlan <n>",L2((d,i,a,o)=>{if(o.neg){i.sw.access=1;return}if(a[0]<1||a[0]>4094)return INV;i.sw.access=a[0];if(!d.vlans[a[0]]){d.vlans[a[0]]={name:"VLAN"+String(a[0]).padStart(4,"0")};return "% Access VLAN does not exist. Creating vlan "+a[0]}}));
IF("switchport voice vlan <n>",L2((d,i,a,o)=>{if(o.neg){i.sw.voice=null;return}i.sw.voice=a[0];if(!d.vlans[a[0]]){d.vlans[a[0]]={name:"VLAN"+String(a[0]).padStart(4,"0")};return "% Voice VLAN does not exist. Creating vlan "+a[0]}}));
IF("switchport trunk native vlan <n>",L2((d,i,a,o)=>{i.sw.native=o.neg?1:a[0]}));
IF("switchport trunk encapsulation dot1q",L2(()=>""));
IF("switchport trunk allowed vlan <rest>",L2((d,i,a,o)=>{const T=a.rest;if(o.neg){i.sw.allowed=null;return}
  const all="1-4094";const cur=()=>i.sw.allowed===null?vlanList(all):vlanList(i.sw.allowed)||[];
  const fmtL=L=>{L=[...new Set(L)].sort((p,q)=>p-q);const r=[];for(let k=0;k<L.length;k++){let j=k;while(j+1<L.length&&L[j+1]===L[j]+1)j++;r.push(j>k?L[k]+"-"+L[j]:String(L[k]));k=j}return r.join(",")};
  const kw=(T[0]||"").toLowerCase();
  if(kw==="all"){i.sw.allowed=null;return}if(kw==="none"){i.sw.allowed="";return}
  if(kw==="add"||kw==="remove"||kw==="except"){const L=vlanList(T[1]);if(!L)return INV;
    if(kw==="add")i.sw.allowed=i.sw.allowed===null?null:fmtL([...(vlanList(i.sw.allowed)||[]),...L]);
    else if(kw==="remove")i.sw.allowed=fmtL(cur().filter(v=>!L.includes(v)));else i.sw.allowed=fmtL(vlanList(all).filter(v=>!L.includes(v)));return}
  const L=vlanList(T[0]);if(!L||T.length>1)return INV;i.sw.allowed=fmtL(L)}));
IF("switchport trunk allowed vlan",L2((d,i,a,o)=>{if(o.neg){i.sw.allowed=null;return}return INV}),{hide:1});
IF("switchport nonegotiate",L2((d,i,a,o)=>{i.sw.noneg=!o.neg}));
IF("switchport port-security",L2((d,i,a,o)=>{if(o.neg){i.ps=null;return}if(i.sw.mode!=="access")return "Command rejected: "+i.name+" is a dynamic port.";if(i.ps)delete i.ps.off;else i.ps={max:1,viol:"shutdown",sticky:false,macs:[]}}));
const PS=fn=>L2((d,i,a,o)=>{if(!i.ps){if(i.sw.mode!=="access")return "Command rejected: "+i.name+" is a dynamic port.";i.ps={max:1,viol:"shutdown",sticky:false,macs:[],off:true}}return fn(d,i,a,o)});
IF("switchport port-security maximum <n>",PS((d,i,a,o)=>{i.ps.max=o.neg?1:a[0]}));
IF("switchport port-security violation <w>",PS((d,i,a,o)=>{const v=["shutdown","restrict","protect"].find(k=>k.startsWith(a[0].toLowerCase()));if(!v)return INV;i.ps.viol=o.neg?"shutdown":v}));
IF("switchport port-security mac-address sticky",PS((d,i,a,o)=>{i.ps.sticky=!o.neg}));
IF("switchport port-security mac-address <w>",PS((d,i,a,o)=>{if(!/^[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}$/i.test(a[0]))return INV;i.ps.macs=i.ps.macs.filter(m=>m!==a[0].toLowerCase());if(!o.neg)i.ps.macs.push(a[0].toLowerCase())}));
IF("channel-group <n> mode <w>",(d,i,a,o)=>{if(d.kind==="router"||i.l3&&d.kind!=="l3")return INV;if(o.neg){i.cg=null;return}const m=["active","passive","on","desirable","auto"].find(k=>k===a[1].toLowerCase()||k.startsWith(a[1].toLowerCase())&&a[1].length>1);if(!m)return INV;
  const others=Object.values(d.ifs).filter(j=>j.cg&&j.cg.n===a[0]&&j!==i);if(others.some(j=>IOS.ecProto(j.cg.mode)!==IOS.ecProto(m)))return "Command rejected (Channel protocol mismatch for interface "+ifShort(i.name)+" in group "+a[0]+"): the interface can not be added to the channel group";
  const fresh=!d.ifs["Port-channel"+a[0]];i.cg={n:a[0],mode:m};if(fresh){const po=getIf(d,"Port-channel"+a[0],true);po.l3=false;po.sw={...i.sw};po.shut=false;return "Creating a port-channel interface Port-channel "+a[0]}});
IF("channel-group <n>",()=>"% Incomplete command.",{hide:1});
IF("channel-protocol <w>",()=>"");
IF("spanning-tree portfast",L2((d,i,a,o)=>{i.pf=!o.neg;i.pfTrunk=false;if(o.neg)return;return "%Warning: portfast should only be enabled on ports connected to a single\n host. Connecting hubs, concentrators, switches, bridges, etc... to this\n interface  when portfast is enabled, can cause temporary bridging loops.\n Use with CAUTION"+(i.sw.mode!=="access"?`\n\n%Portfast has been configured on ${i.name} but will only\n have effect when the interface is in a non-trunking mode.`:"")}));
IF("spanning-tree portfast edge",L2((d,i,a,o)=>{i.pf=!o.neg}),{hide:1});
IF("spanning-tree portfast trunk",L2((d,i,a,o)=>{i.pf=!o.neg;i.pfTrunk=!o.neg;return o.neg?"":"%Warning: portfast should only be enabled on ports connected to a single\n host. Connecting hubs, concentrators, switches, bridges, etc... to this\n interface  when portfast is enabled, can cause temporary bridging loops.\n Use with CAUTION"}));
IF("spanning-tree portfast disable",L2((d,i)=>{i.pf=false;i.pfOff=true}));
IF("spanning-tree bpduguard enable",L2((d,i,a,o)=>{i.bg=!o.neg}));
IF("spanning-tree bpduguard disable",L2((d,i)=>{i.bg=false;i.bgOff=true}));
IF("spanning-tree guard <w>",L2((d,i,a,o)=>{const g=["root","loop","none"].find(k=>k.startsWith(a[0].toLowerCase()));if(!g)return INV;i.guard=o.neg||g==="none"?null:g}));
IF("spanning-tree cost <n>",L2((d,i,a,o)=>{i.stpCost=o.neg?null:a[0]}));
IF("spanning-tree port-priority <n>",L2((d,i,a,o)=>{i.stpPri=o.neg?null:a[0]}));
IF("ip dhcp snooping trust",L2((d,i,a,o)=>{i.snoopTrust=!o.neg}));
IF("ip dhcp snooping limit rate <n>",L2((d,i,a,o)=>{i.snoopRate=o.neg?null:a[0]}));
IF("ip arp inspection trust",L2((d,i,a,o)=>{i.daiTrust=!o.neg}));
IF("ip arp inspection limit rate <n>",L2(()=>""));
IF("storm-control broadcast level <w>",L2((d,i,a,o)=>{if(o.neg){i.storm=null;return}const v=parseFloat(a[0]);if(!(v>=0&&v<=100))return INV;i.storm={type:"broadcast",level:a[0]}}));
IF("storm-control multicast level <w>",L2((d,i,a,o)=>{i.stormM=o.neg?null:a[0]}));
IF("storm-control unicast level <w>",L2((d,i,a,o)=>{i.stormU=o.neg?null:a[0]}));
IF("storm-control action <w>",L2((d,i,a,o)=>{const v=["shutdown","trap"].find(k=>k.startsWith(a[0].toLowerCase()));if(!v)return INV;i.stormAction=o.neg?null:v}));
IF("ipv6 nd raguard attach-policy <w>",L2((d,i,a,o)=>{if(!o.neg&&!d.raPol[a[0]])d.raPol[a[0]]={role:"host"};i.raPolicy=o.neg?null:a[0]}));
IF("ipv6 nd raguard",L2((d,i,a,o)=>{i.raPolicy=o.neg?null:"(default host)"}),{hide:1});
IF("power inline <w>",L2((d,i,a,o)=>{const v=["auto","never","static"].find(k=>k.startsWith(a[0].toLowerCase()));if(!v)return INV;i.poe=o.neg?"auto":v}));
})();
