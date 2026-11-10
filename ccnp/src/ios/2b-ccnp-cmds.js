/* ================= Cisco IOS simulator: CCNP configuration commands ================= */
(function(){
const {ip4,ip4s,maskLen,lenMask,ifName,ifShort,pfx,inNet,getIf,INV,PROMPT,SUB,PARENT,DESC}=IOS;
/* registering a pattern that already exists replaces the old handler */
const drop=(m,pat)=>{const i=IOS.CMDS.findIndex(c=>c.m===m&&c.p.join(" ")===pat);if(i>=0)IOS.CMDS.splice(i,1)};
const C=(modes,pat,fn,o)=>{modes.split(" ").forEach(m=>drop(m,pat));IOS.C(modes,pat,fn,o)};
const IF=(pat,fn,o)=>{drop("if",pat);IOS.IF(pat,fn,o)};
IOS.C2=C;
const vlanList=IOS.vlanList;
/* new configuration sub-modes: name -> [prompt, parent] */
const MODES={vrf:["(config-vrf)#"],vrfaf:["(config-vrf-af)#","vrf"],bgp:["(config-router)#"],bgpaf:["(config-router-af)#","bgp"],rmap:["(config-route-map)#"],track:["(config-track)#"],
  sla:["(config-ip-sla)#"],slaecho:["(config-ip-sla-echo)#","sla"],mst:["(config-mst)#"],cmap:["(config-cmap)#"],pmap:["(config-pmap)#"],pmapc:["(config-pmap-c)#","pmap"],policec:["(config-pmap-c-police)#","pmapc"],cp:["(config-cp)#"],
  frec:["(config-flow-record)#"],fexp:["(config-flow-exporter)#"],fmon:["(config-flow-monitor)#"],erspan:["(config-mon-erspan-src)#"],erspandst:["(config-mon-erspan-src-dst)#","erspan"],
  applet:["(config-applet)#"],isakmp:["(config-isakmp)#"],ts:["(cfg-crypto-trans)#"],ipsecprof:["(ipsec-profile)#"],sg:["(config-sg-tacacs+)#"],sgr:["(config-sg-radius)#"],vrrp3:["(config-if-vrrp)#","if"],plist:["(config-pl)#"]};
Object.entries(MODES).forEach(([m,[p,par]])=>{PROMPT[m]=p;if(!SUB.includes(m))SUB.push(m);if(par)PARENT[m]=par});
const NM=Object.keys(MODES).join(" ");
C(NM,"end",(d,a,o)=>{o.x.mode="priv";o.x.ifs=[];o.x.sub=null;return ""},{noNeg:1});
C(NM,"exit",(d,a,o)=>{const p=PARENT[o.x.mode];if(p){o.x.mode=p;if(p==="pmap")o.x.sub=o.x.parentSub;return ""}o.x.mode="config";o.x.ifs=[];o.x.sub=null;return ""},{noNeg:1});
Object.assign(DESC,{vrf:"VRF commands",tunnel:"protocol-over-protocol tunneling",track:"Object Tracking configuration commands","route-map":"Create route-map or enter route-map command mode",
  "class-map":"Configure CPL Class Map","policy-map":"Configure QoS Policy Map","control-plane":"Configure control plane services",flow:"Global Flow configuration subcommands",monitor:"Monitoring different system events",
  event:"Event related commands",netconf:"",restconf:"Enable RESTCONF",match:"Match values",set:"Set values in destination routing protocol",neighbor:"Specify a neighbor router",bgp:"BGP specific commands",
  area:"OSPF area parameters",redistribute:"Redistribute information from another routing protocol","distribute-list":"Filter networks in routing updates",action:"Add an action",police:"Police",priority:"Strict Scheduling Priority for this Class",
  bandwidth:"Bandwidth",class:"policy criteria","service-policy":"Configure CPL Service Policy",instance:"Map vlans to an MST instance",revision:"Set configuration revision number",frequency:"Frequency of an operation",
  "icmp-echo":"ICMP Echo Operation",record:"Specify flow record to use to define the cache",exporter:"Add an exporter to use to export records",destination:"Export destination configuration",source:"Originating interface",
  collect:"Specify a non-key field",transport:"Transport protocol",standby:"HSRP interface configuration commands"});
const ok=()=>"";
const kw=(t,L)=>L.find(k=>k===String(t).toLowerCase())||L.find(k=>k.startsWith(String(t).toLowerCase())&&String(t).length>1);

/* ================= EXEC ================= */
C("exec","debug <rest>",(d,a,o)=>{const s=a[0].toLowerCase();if(o.neg){d.dbg=[];return "All possible debugging has been turned off"}
  if(/^condition interface /.test(s)){const n=ifName(a.rest.slice(2).join(""));if(!n||!d.ifs[n])return "% Invalid interface";d.dbg.push("cond:"+n);return `Condition ${d.dbg.filter(x=>x.startsWith("cond")).length} set`}
  if(/^condition ip /.test(s)){d.dbg.push("condip:"+a.rest[2]);return `Condition ${d.dbg.filter(x=>x.startsWith("cond")).length} set`}
  const M=[[/^ip packet( \d+)?( detail)?$/,"IP packet debugging is on"],[/^ip ospf adj/,"OSPF adjacency debugging is on"],[/^ip ospf hello/,"OSPF hello debugging is on"],[/^ip bgp/,"BGP debugging is on for address family: IPv4 Unicast"],
    [/^ip icmp/,"ICMP packet debugging is on"],[/^standby/,"HSRP debugging is on"],[/^crypto isakmp/,"Crypto ISAKMP debugging is on"],[/^crypto ipsec/,"Crypto IPSEC debugging is on"],[/^track/,"track debugging is on"],[/^event manager/,"Debug EEM action cli debugging is on"],[/^ip sla/,"IP SLAs debugging is on"],[/^ntp/,"NTP events debugging is on"],[/^aaa authentication/,"AAA Authentication debugging is on"],[/^tacacs/,"TACACS access control debugging is on"],[/^ip routing/,"IP routing debugging is on"]];
  const m=M.find(([re])=>re.test(s));if(!m)return "% Invalid input detected at '^' marker.";d.dbg=d.dbg.filter(x=>x!==s);d.dbg.push(s);
  const warn=/^ip packet/.test(s)&&!d.dbg.some(x=>x.startsWith("cond"))?"\n% Warning: debug ip packet with no conditions or ACL can flood the console and overload the CPU on a busy router.":"";
  return m[1]+(/^ip packet/.test(s)&&a.rest[2]&&/^\d+$/.test(a.rest[2])?` for access list ${a.rest[2]}`:"")+warn},{priv:1});
C("exec","undebug all",(d)=>{d.dbg=[];return "All possible debugging has been turned off"},{priv:1});
C("exec","no debug all",(d)=>{d.dbg=[];return "All possible debugging has been turned off"},{priv:1,hide:1});
C("exec","undebug condition all",(d)=>{d.dbg=d.dbg.filter(x=>!x.startsWith("cond"));return "Removing all conditions may cause a flood of debugging messages"},{priv:1});
C("exec","ping vrf <w> <ip>",(d,a,o)=>{if(!d.vrfs[a[0]])return `% VRF ${a[0]} does not have a usable source address`;return IOS.pingOut(o.x,a[1],4,{vrf:a[0]})});
C("exec","ping vrf <w> <ip> source <if>",(d,a,o)=>{const i=d.ifs[a[2]];if(!i||i.ip===null)return "% Invalid source interface";return IOS.pingOut(o.x,a[1],4,{vrf:a[0],src:i.ip})});
C("exec","traceroute vrf <w> <ip>",(d,a,o)=>IOS.traceOut(o.x,a[1],4,{vrf:a[0]}));
C("exec","traceroute <ip> source <if>",(d,a,o)=>{const i=d.ifs[a[1]];return IOS.traceOut(o.x,a[0],4,{src:i?.ip})});
C("exec","event manager run <w>",(d,a,o)=>{const A=d.eem[a[0]];if(!A)return `EEM policy ${a[0]} not registered with event none Event Detector`;if(!A.ev||A.ev.t!=="none")return `EEM policy ${a[0]} not registered with event none Event Detector`;
  const L=IOS.eemRun(o.x.w,d,a[0],0);o.x.eemOut=L;return L.length?"":""},{priv:1});
C("exec","send log <rest>",(d,a,o)=>{const m=a.join(" ").replace(/^"|"$/g,"");o.x.eemOut=[`%SYS-7-USERLOG_DEBUG: Message from tty0(user id: ): ${m}`];return ""},{priv:1});
C("exec","clear ip bgp *",()=>"",{priv:1});C("exec","clear ip bgp <ip>",()=>"",{priv:1});C("exec","clear ip bgp * soft",()=>"",{priv:1});
C("exec","clear crypto session",()=>"",{priv:1});C("exec","clear ip route *",()=>"",{priv:1});C("exec","clear ip flow stats",()=>"",{priv:1});
C("exec","test aaa group <w> <w> <w> legacy",(d,a,o)=>{const w=o.x.w;const g=a[0];const save=d.lines.vty.authList;const tmp=d.aaaLists||(d.aaaLists={});tmp.__test=["group",g];d.lines.vty.authList="__test";
  const r=IOS.aaaLogin(w,d,"vty",a[1],a[2]);d.lines.vty.authList=save;delete tmp.__test;
  return `Sending password\nAttempting authentication test to server-group ${g} using ${/radius/i.test(g)?"radius":"tacacs+"}\n`+(r.ok?"User was successfully authenticated.":r.steps.some(s=>/rejected/.test(s))?"User authentication request was rejected by server.":"No authoritative response from any server.")},{priv:1});

/* ================= VRF-lite ================= */
const vrfCmd=(d,a,o)=>{if(o.neg){delete d.vrfs[a[0]];Object.values(d.ifs).forEach(i=>{if(i.vrf===a[0]){i.vrf=null;i.ip=null;i.len=null}});d.routes=d.routes.filter(r=>r.vrf!==a[0]);return ""}
  d.vrfs[a[0]]=d.vrfs[a[0]]||{rd:null,af4:false,legacy:o.toks[0].toLowerCase()==="ip"};o.x.mode="vrf";o.x.sub=a[0];return ""};
C("config","vrf definition <w>",vrfCmd);C("config","ip vrf <w>",vrfCmd);
C("vrf","rd <w>",(d,a,o)=>{if(o.neg){d.vrfs[o.x.sub].rd=null;return ""}if(!/^(\d+|\d+\.\d+\.\d+\.\d+):\d+$/.test(a[0]))return "% Invalid RD format";d.vrfs[o.x.sub].rd=a[0];return ""});
C("vrf","description <rest>",ok);
C("vrf","address-family ipv4",(d,a,o)=>{d.vrfs[o.x.sub].af4=!o.neg;if(!o.neg){o.x.mode="vrfaf";o.x.parentSub=o.x.sub}return ""});
C("vrf","address-family ipv4 unicast",(d,a,o)=>{d.vrfs[o.x.sub].af4=!o.neg;if(!o.neg){o.x.mode="vrfaf";o.x.parentSub=o.x.sub}return ""},{hide:1});
C("vrf","address-family ipv6",(d,a,o)=>{d.vrfs[o.x.sub].af6=!o.neg;if(!o.neg){o.x.mode="vrfaf";o.x.parentSub=o.x.sub}return ""});
C("vrfaf","exit-address-family",(d,a,o)=>{o.x.mode="vrf";return ""},{noNeg:1});
C("vrfaf","route-target <w> <w>",ok);
C("config","ip route vrf <w> <ip> <ip> <rest>",(d,a,o)=>{const len=maskLen(ip4s(a[2]));if(len===null)return "%Inconsistent address and mask";return IOS.addRoute(d,a[1],len,a.rest,o.neg,a[0])});
const vrfIf=(d,i,a,o)=>{if(!i.l3)return INV;if(o.neg){if(i.vrf){const had=i.ip!==null;i.vrf=null;i.ip=null;i.len=null;return had?`% Interface ${i.name} IPv4 disabled and address(es) removed due to disabling VRF ${a[0]}`:""}return}
  const V=d.vrfs[a[0]];if(!V)return `% VRF ${a[0]} not configured`;if(!V.legacy&&!V.af4)return `% VRF ${a[0]} has no address family ipv4: the interface will not forward IPv4. Add "address-family ipv4" under the VRF.`;
  if(i.vrf===a[0])return;const had=i.ip!==null;i.vrf=a[0];i.ip=null;i.len=null;i.sec=[];if(had)return `% Interface ${i.name} IPv4 disabled and address(es) removed due to enabling VRF ${a[0]}`};
IF("vrf forwarding <w>",vrfIf);IF("ip vrf forwarding <w>",vrfIf);

/* ================= tunnels and IPsec ================= */
const tun=i=>i.tun||(i.tun={src:null,dst:null,mode:"gre",prot:null});
const isTun=i=>/^Tunnel/.test(i.name);
IF("tunnel source <if>",(d,i,a,o)=>{if(!isTun(i))return INV;if(o.neg){tun(i).src=null;return}if(!d.ifs[a[0]])return INV;tun(i).src=a[0]});
IF("tunnel source <ip>",(d,i,a,o)=>{if(!isTun(i))return INV;tun(i).src=o.neg?null:a[0]});
IF("tunnel destination <ip>",(d,i,a,o)=>{if(!isTun(i))return INV;tun(i).dst=o.neg?null:a[0]});
IF("tunnel mode gre ip",(d,i,a,o)=>{if(!isTun(i))return INV;tun(i).mode="gre"});
IF("tunnel mode gre multipoint",(d,i,a,o)=>{if(!isTun(i))return INV;tun(i).mode="mgre"});
IF("tunnel mode ipsec ipv4",(d,i,a,o)=>{if(!isTun(i))return INV;tun(i).mode=o.neg?"gre":"ipsec"});
IF("tunnel protection ipsec profile <w>",(d,i,a,o)=>{if(!isTun(i))return INV;if(o.neg){tun(i).prot=null;return}if(!d.crypto.prof[a[0]])return `% IPSec profile ${a[0]} not found`;tun(i).prot=a[0];return `%CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is ON`});
IF("tunnel key <n>",(d,i,a,o)=>{tun(i).key=o.neg?null:a[0]});
IF("keepalive <n> <n>",(d,i,a,o)=>{i.keepalive=o.neg?null:[a[0],a[1]]});IF("keepalive",(d,i,a,o)=>{i.keepalive=o.neg?null:[10,3]},{hide:1});
IF("ip mtu <n>",(d,i,a,o)=>{if(!i.l3)return INV;if(!o.neg&&(a[0]<68||a[0]>9216))return INV;i.mtu=o.neg?null:a[0]});
IF("ip mtu",(d,i,a,o)=>{if(o.neg){i.mtu=null;return}return "% Incomplete command."},{hide:1});
IF("ip tcp adjust-mss <n>",(d,i,a,o)=>{i.mss=o.neg?null:a[0]});
C("config","crypto isakmp policy <n>",(d,a,o)=>{if(o.neg){delete d.crypto.isakmp[a[0]];return ""}d.crypto.isakmp[a[0]]=d.crypto.isakmp[a[0]]||{enc:"des",hash:"sha",auth:"rsa-sig",group:1,life:86400};o.x.mode="isakmp";o.x.sub=a[0];return ""});
C("isakmp","encryption <w>",(d,a,o)=>{const e=kw(a[0],["aes","3des","des"]);if(!e)return INV;d.crypto.isakmp[o.x.sub].enc=o.neg?"des":e;return ""});
C("isakmp","encryption aes <n>",(d,a,o)=>{if(![128,192,256].includes(a[0]))return INV;d.crypto.isakmp[o.x.sub].enc=o.neg?"des":"aes "+a[0];return ""});
C("isakmp","hash <w>",(d,a,o)=>{const h=kw(a[0],["sha","sha256","sha384","sha512","md5"]);if(!h)return INV;d.crypto.isakmp[o.x.sub].hash=o.neg?"sha":h;return ""});
C("isakmp","authentication <w>",(d,a,o)=>{const h=kw(a[0],["pre-share","rsa-sig","rsa-encr"]);if(!h)return INV;d.crypto.isakmp[o.x.sub].auth=o.neg?"rsa-sig":h;return ""});
C("isakmp","group <n>",(d,a,o)=>{if(![1,2,5,14,15,16,19,20,21,24].includes(a[0]))return INV;d.crypto.isakmp[o.x.sub].group=o.neg?1:a[0];return ""});
C("isakmp","lifetime <n>",(d,a,o)=>{d.crypto.isakmp[o.x.sub].life=o.neg?86400:a[0];return ""});
C("config","crypto isakmp key <w> address <ip>",(d,a,o)=>{const k=String(a[1]);if(o.neg)delete d.crypto.keys[k];else d.crypto.keys[k]=a[0];return ""});
C("config","crypto isakmp key 0 <w> address <ip>",(d,a,o)=>{const k=String(a[1]);if(o.neg)delete d.crypto.keys[k];else d.crypto.keys[k]=a[0];return ""},{hide:1});
C("config","crypto ipsec transform-set <w> <rest>",(d,a,o)=>{if(o.neg){delete d.crypto.ts[a[0]];return ""}const T=a.rest.map(t=>t.toLowerCase());const valid=["esp-aes","esp-3des","esp-des","esp-gcm","esp-sha-hmac","esp-sha256-hmac","esp-sha384-hmac","esp-md5-hmac","ah-sha-hmac","256","128","192"];
  if(!T.length||T.some(t=>!valid.includes(t)))return INV;d.crypto.ts[a[0]]={tf:T.join(" "),mode:"tunnel"};o.x.mode="ts";o.x.sub=a[0];return ""});
C("ts","mode <w>",(d,a,o)=>{const m=kw(a[0],["tunnel","transport"]);if(!m)return INV;d.crypto.ts[o.x.sub].mode=o.neg?"tunnel":m;return ""});
C("config","crypto ipsec profile <w>",(d,a,o)=>{if(o.neg){delete d.crypto.prof[a[0]];return ""}d.crypto.prof[a[0]]=d.crypto.prof[a[0]]||{ts:null};o.x.mode="ipsecprof";o.x.sub=a[0];return ""});
C("ipsecprof","set transform-set <w>",(d,a,o)=>{if(!o.neg&&!d.crypto.ts[a[0]])return `ERROR: transform set with tag "${a[0]}" does not exist.`;d.crypto.prof[o.x.sub].ts=o.neg?null:a[0];return ""});
C("ipsecprof","set pfs <w>",ok);C("ipsecprof","set security-association lifetime seconds <n>",ok);

/* ================= BGP ================= */
C("config","router bgp <n>",(d,a,o)=>{if(o.neg){d.bgp=null;return ""}if(a[0]<1||a[0]>4294967295)return INV;if(d.bgp&&d.bgp.asn!==a[0])return `BGP is already running; AS is ${d.bgp.asn}`;
  d.bgp=d.bgp||{asn:a[0],rid:null,nbrs:{},nets:[],log:true};o.x.mode="bgp";return ""});
const NB=(pat,fn,opt)=>C("bgp","neighbor <ip> "+pat,(d,a,o)=>{const k=String(a[0]);let nb=d.bgp.nbrs[k];
  if(!nb&&!/^remote-as/.test(pat)){if(o.neg)return "";return `% Specify remote-as or peer-group commands first`}return fn(d,nb,a.slice(1),o,k)},opt);
C("bgp","neighbor <ip> remote-as <n>",(d,a,o)=>{const k=String(a[0]);if(o.neg){delete d.bgp.nbrs[k];return ""}const nb=d.bgp.nbrs[k]||(d.bgp.nbrs[k]={ras:null});nb.ras=a[1];return ""});
NB("shutdown",(d,nb,a,o)=>{nb.shut=!o.neg});
NB("description <rest>",(d,nb,a,o)=>{nb.desc=o.neg?null:a[0]});
NB("password <w>",(d,nb,a,o)=>{nb.pw=o.neg?null:a[0]});
NB("route-map <w> in",(d,nb,a,o)=>{nb.rmIn=o.neg?null:a[0]});
NB("route-map <w> out",(d,nb,a,o)=>{nb.rmOut=o.neg?null:a[0]});
NB("update-source <if>",(d,nb,a,o)=>{nb.upd=o.neg?null:a[0]});
NB("ebgp-multihop <n>",(d,nb,a,o)=>{nb.multihop=o.neg?null:a[0]});NB("ebgp-multihop",(d,nb,a,o)=>{nb.multihop=o.neg?null:255});
NB("weight <n>",(d,nb,a,o)=>{nb.weight=o.neg?null:a[0]});
NB("activate",(d,nb,a,o)=>{nb.act=!o.neg});NB("next-hop-self",(d,nb,a,o)=>{nb.nhs=!o.neg});NB("timers <n> <n>",(d,nb,a,o)=>{nb.timers=o.neg?null:[a[0],a[1]]});
NB("soft-reconfiguration inbound",(d,nb,a,o)=>{nb.soft=!o.neg});
C("bgp","bgp router-id <ip>",(d,a,o)=>{d.bgp.rid=o.neg?null:a[0];return ""});
C("bgp","bgp log-neighbor-changes",(d,a,o)=>{d.bgp.log=!o.neg;return ""});
C("bgp","no bgp default ipv4-unicast",ok,{hide:1});
C("bgp","network <ip> mask <ip>",(d,a,o)=>{const len=maskLen(ip4s(a[1]));if(len===null)return INV;const n=pfx(a[0],len,4);d.bgp.nets=d.bgp.nets.filter(x=>!(x.n===n&&x.len===len));if(!o.neg)d.bgp.nets.push({n,len});return ""});
C("bgp","network <ip>",(d,a,o)=>{const f=Number(a[0]>>24n);const len=f<128?8:f<192?16:24;const n=pfx(a[0],len,4);d.bgp.nets=d.bgp.nets.filter(x=>!(x.n===n&&x.len===len));if(!o.neg)d.bgp.nets.push({n,len});return ""});
C("bgp","redistribute connected",(d,a,o)=>{d.bgp.redistConnected=!o.neg;return ""});
C("bgp","distance bgp <n> <n> <n>",(d,a,o)=>{d.bgp.adE=o.neg?null:a[0];d.bgp.adI=o.neg?null:a[1];return ""});
C("bgp","address-family ipv4",(d,a,o)=>{o.x.mode="bgpaf";return ""},{noNeg:1});C("bgp","address-family ipv4 unicast",(d,a,o)=>{o.x.mode="bgpaf";return ""},{noNeg:1,hide:1});
C("bgpaf","exit-address-family",(d,a,o)=>{o.x.mode="bgp";return ""},{noNeg:1});

/* ================= OSPF extras ================= */
const P4=d=>d.ospf;
C("router","area <n> range <ip> <ip>",(d,a,o)=>{const p=P4(d);const len=maskLen(ip4s(a[2]));if(len===null)return INV;p.ranges=p.ranges||{};const L=p.ranges[a[0]]=(p.ranges[a[0]]||[]).filter(r=>!(r.n===pfx(a[1],len,4)&&r.len===len));if(!o.neg)L.push({n:pfx(a[1],len,4),len});return ""});
C("router","area <n> range <ip> <ip> not-advertise",(d,a,o)=>{const p=P4(d);const len=maskLen(ip4s(a[2]));if(len===null)return INV;p.ranges=p.ranges||{};const L=p.ranges[a[0]]=(p.ranges[a[0]]||[]).filter(r=>!(r.n===pfx(a[1],len,4)&&r.len===len));if(!o.neg)L.push({n:pfx(a[1],len,4),len,noAdv:true});return ""});
C("router","area <n> stub",(d,a,o)=>{const p=P4(d);if(a[0]===0)return "% OSPF: Backbone can not be configured as stub area";p.stubs=p.stubs||{};if(o.neg)delete p.stubs[a[0]];else p.stubs[a[0]]=p.stubs[a[0]]||{nosum:false};return ""});
C("router","area <n> stub no-summary",(d,a,o)=>{const p=P4(d);if(a[0]===0)return "% OSPF: Backbone can not be configured as stub area";p.stubs=p.stubs||{};if(o.neg){if(p.stubs[a[0]])p.stubs[a[0]].nosum=false}else p.stubs[a[0]]={nosum:true};return ""});
C("router","area <n> authentication message-digest",(d,a,o)=>{const p=P4(d);p.areaAuth=p.areaAuth||{};if(o.neg)delete p.areaAuth[a[0]];else p.areaAuth[a[0]]="md5";return ""});
C("router","redistribute static subnets",(d,a,o)=>{const p=P4(d);p.redist=p.redist||{};p.redist.static=!o.neg;return ""});
C("router","redistribute static",(d,a,o)=>{const p=P4(d);p.redist=p.redist||{};p.redist.static=!o.neg;return ""},{hide:1});
C("router","redistribute connected subnets",(d,a,o)=>{const p=P4(d);p.redist=p.redist||{};p.redist.connected=!o.neg;return ""});
C("router","redistribute connected",(d,a,o)=>{const p=P4(d);p.redist=p.redist||{};p.redist.connected=!o.neg;return ""},{hide:1});
C("router","distribute-list prefix <w> in",(d,a,o)=>{P4(d).dlist=o.neg?null:{pl:a[0]};return ""});
C("router","distribute-list <w> in",(d,a,o)=>{P4(d).dlist=o.neg?null:{acl:a[0]};return ""});
C("router","distance <n>",(d,a,o)=>{P4(d).ad=o.neg?null:a[0];return ""});
C("router","default-information originate metric <n>",(d,a,o)=>{const p=P4(d);p.defOrig=!o.neg;p.defMetric=o.neg?null:a[0];return ""});
IF("ip ospf authentication message-digest",(d,i,a,o)=>{i.ospf.auth=o.neg?null:"md5"});
IF("ip ospf authentication",(d,i,a,o)=>{i.ospf.auth=o.neg?null:"plain"});
IF("ip ospf message-digest-key <n> md5 <w>",(d,i,a,o)=>{i.ospf.key=o.neg?null:a[0]+":"+a[1]});
IF("ip ospf authentication-key <w>",(d,i,a,o)=>{i.ospf.key=o.neg?null:"p:"+a[0]});
IF("ip ospf mtu-ignore",(d,i,a,o)=>{i.ospf.mtuIgn=!o.neg});

/* ================= prefix lists and route maps ================= */
function parsePfx(s){const m=/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/.exec(s||"");if(!m)return null;const n=ip4(m[1]),len=+m[2];if(n===null||len>32)return null;return {n,len}}
function plAdd(d,name,seq,act,rest,neg){const L=d.plists[name]||(d.plists[name]=[]);
  if(neg&&!act){delete d.plists[name];return ""}
  const p=parsePfx(rest[0]);if(!p)return INV;if(pfx(p.n,p.len,4)!==p.n)return `% ${rest[0]} is not a valid network (host bits set). Use ${ip4s(pfx(p.n,p.len,4))}/${p.len}`;
  let ge=null,le=null;for(let k=1;k<rest.length;k+=2){const t=rest[k].toLowerCase(),v=+rest[k+1];if(!(v>=0&&v<=32))return INV;if(t==="ge")ge=v;else if(t==="le")le=v;else return INV}
  if((ge!=null&&ge<=p.len)||(le!=null&&le<p.len)||(ge!=null&&le!=null&&ge>le))return "% Invalid prefix range: make sure: len < ge-value <= le-value";
  if(neg){d.plists[name]=L.filter(e=>!(e.n===p.n&&e.len===p.len&&e.act===act));return ""}
  const sq=seq??((L.length?Math.max(...L.map(e=>e.seq)):0)+5);const e={seq:sq,act,n:p.n,len:p.len,ge,le};
  d.plists[name]=L.filter(x=>x.seq!==sq).concat(e).sort((a,b)=>a.seq-b.seq);return ""}
C("config","ip prefix-list <w> seq <n> <w> <rest>",(d,a,o)=>{const act=kw(a[2],["permit","deny"]);if(!act)return INV;return plAdd(d,a[0],a[1],act,a.rest,o.neg)});
C("config","ip prefix-list <w> <w> <rest>",(d,a,o)=>{const act=kw(a[1],["permit","deny"]);if(!act)return INV;return plAdd(d,a[0],null,act,a.rest,o.neg)});
C("config","ip prefix-list <w>",(d,a,o)=>{if(o.neg){delete d.plists[a[0]];return ""}return "% Incomplete command."},{hide:1});
C("config","ip prefix-list <w> description <rest>",ok);
const rmCmd=(d,name,act,seq,o)=>{if(o.neg){if(seq==null)delete d.rmaps[name];else if(d.rmaps[name])d.rmaps[name]=d.rmaps[name].filter(e=>e.seq!==seq);return ""}
  const L=d.rmaps[name]||(d.rmaps[name]=[]);let e=L.find(x=>x.seq===seq);if(!e){e={seq,act,match:[],set:{}};L.push(e);L.sort((a,b)=>a.seq-b.seq)}else e.act=act;o.x.mode="rmap";o.x.sub={name,seq};return ""};
C("config","route-map <w>",(d,a,o)=>rmCmd(d,a[0],"permit",o.neg?null:10,o));
C("config","route-map <w> <w>",(d,a,o)=>{const act=kw(a[1],["permit","deny"]);if(!act)return INV;return rmCmd(d,a[0],act,o.neg?null:10,o)});
C("config","route-map <w> <w> <n>",(d,a,o)=>{const act=kw(a[1],["permit","deny"]);if(!act)return INV;return rmCmd(d,a[0],act,a[2],o)});
const RE=(o,d)=>d.rmaps[o.x.sub.name].find(e=>e.seq===o.x.sub.seq);
const rmMatch=(t)=>(d,a,o)=>{const e=RE(o,d);e.match=e.match.filter(m=>m.t!==t);if(!o.neg)a.rest?a.rest.forEach(v=>e.match.push({t,v})):e.match.push({t,v:a[0]});return ""};
C("rmap","match ip address prefix-list <rest>",rmMatch("pl"));
C("rmap","match ip address <rest>",rmMatch("acl"));
C("rmap","match interface <if>",ok);C("rmap","match as-path <n>",ok);
C("rmap","set local-preference <n>",(d,a,o)=>{RE(o,d).set.lp=o.neg?null:a[0];return ""});
C("rmap","set weight <n>",(d,a,o)=>{if(a[0]>65535)return INV;RE(o,d).set.weight=o.neg?null:a[0];return ""});
C("rmap","set metric <n>",(d,a,o)=>{RE(o,d).set.med=o.neg?null:a[0];return ""});
C("rmap","set as-path prepend <rest>",(d,a,o)=>{if(!o.neg&&a.rest.some(t=>!/^\d+$/.test(t)))return INV;RE(o,d).set.prepend=o.neg?null:a.rest;return ""});
C("rmap","set ip next-hop <rest>",(d,a,o)=>{const L=a.rest.map(ip4);if(!o.neg&&L.some(x=>x===null))return INV;RE(o,d).set.nh=o.neg?null:L;return ""});
C("rmap","set interface <if>",(d,a,o)=>{RE(o,d).set.oif=o.neg?null:a[0];return ""});
C("rmap","set ip precedence <rest>",ok);C("rmap","description <rest>",ok);
IF("ip policy route-map <w>",(d,i,a,o)=>{if(!i.l3)return INV;i.policy=o.neg?null:a[0]});
C("config","ip local policy route-map <w>",(d,a,o)=>{d.localPolicy=o.neg?null:a[0];return ""});

/* ================= tracking and IP SLA ================= */
C("config","track <n> interface <if> line-protocol",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}d.tracks[a[0]]={type:"if",if:a[1],mode:"line-protocol"};o.x.mode="track";o.x.sub=a[0];return ""});
C("config","track <n> interface <if> ip routing",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}d.tracks[a[0]]={type:"if",if:a[1],mode:"ip routing"};o.x.mode="track";o.x.sub=a[0];return ""});
C("config","track <n> ip sla <n> reachability",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}d.tracks[a[0]]={type:"sla",sla:a[1],mode:"reachability"};o.x.mode="track";o.x.sub=a[0];return ""});
C("config","track <n> ip sla <n> state",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}d.tracks[a[0]]={type:"sla",sla:a[1],mode:"state"};o.x.mode="track";o.x.sub=a[0];return ""});
C("config","track <n> ip sla <n>",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}d.tracks[a[0]]={type:"sla",sla:a[1],mode:"state"};o.x.mode="track";o.x.sub=a[0];return ""},{hide:1});
C("config","track <n> ip route <ip> <ip> reachability",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}const len=maskLen(ip4s(a[2]));d.tracks[a[0]]={type:"route",n:pfx(a[1],len,4),len};o.x.mode="track";o.x.sub=a[0];return ""});
C("config","track <n>",(d,a,o)=>{if(o.neg){delete d.tracks[a[0]];return ""}if(!d.tracks[a[0]])return "% Incomplete command.";o.x.mode="track";o.x.sub=a[0];return ""},{hide:1});
C("track","delay <rest>",(d,a,o)=>{d.tracks[o.x.sub].delay=o.neg?null:a[0];return ""});
C("track","description <rest>",ok);
C("config","ip sla <n>",(d,a,o)=>{if(o.neg){delete d.slas[a[0]];return ""}if(d.slas[a[0]]&&d.slas[a[0]].sched&&d.slas[a[0]].dst!=null){o.x.mode="config";return "%Entry already running and cannot be modified\n(only can delete (no) and start over)\n(check to see if the probe has finished exiting)"}
  d.slas[a[0]]=d.slas[a[0]]||{type:null,dst:null,srcIf:null,freq:60,sched:false};o.x.mode="sla";o.x.sub=a[0];return ""});
C("sla","icmp-echo <ip>",(d,a,o)=>{const s=d.slas[o.x.sub];s.type="icmp-echo";s.dst=a[0];s.srcIf=null;o.x.mode="slaecho";o.x.parentSub=o.x.sub;return ""});
C("sla","icmp-echo <ip> source-interface <if>",(d,a,o)=>{if(!d.ifs[a[1]])return INV;const s=d.slas[o.x.sub];s.type="icmp-echo";s.dst=a[0];s.srcIf=a[1];o.x.mode="slaecho";o.x.parentSub=o.x.sub;return ""});
C("sla","icmp-echo <ip> source-ip <ip>",(d,a,o)=>{const s=d.slas[o.x.sub];s.type="icmp-echo";s.dst=a[0];const hit=Object.values(d.ifs).find(i=>i.ip===a[1]);s.srcIf=hit?hit.name:null;o.x.mode="slaecho";o.x.parentSub=o.x.sub;return ""});
C("slaecho","frequency <n>",(d,a,o)=>{d.slas[o.x.sub].freq=o.neg?60:a[0];return ""});
C("slaecho","threshold <n>",(d,a,o)=>{d.slas[o.x.sub].thr=o.neg?null:a[0];return ""});
C("slaecho","timeout <n>",(d,a,o)=>{d.slas[o.x.sub].tmo=o.neg?null:a[0];return ""});
C("slaecho","tag <rest>",ok);C("slaecho","request-data-size <n>",ok);
C("config","ip sla schedule <n> life forever start-time now",(d,a,o)=>{const s=d.slas[a[0]];if(!s)return `%No such entry ${a[0]}`;s.sched=!o.neg;return ""});
C("config","ip sla schedule <n> start-time now life forever",(d,a,o)=>{const s=d.slas[a[0]];if(!s)return `%No such entry ${a[0]}`;s.sched=!o.neg;return ""},{hide:1});
C("config","ip sla schedule <n> <rest>",(d,a,o)=>{const s=d.slas[a[0]];if(!s)return `%No such entry ${a[0]}`;s.sched=!o.neg&&/now|after/.test(a[1]);return s.sched?"":"% The probe is scheduled but won't start until its start time. Use start-time now in this lab."});
IF("standby <n> track <n> decrement <n>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.track=(c.track||[]).filter(t=>t.obj!==a[1]);if(!o.neg)c.track.push({obj:a[1],dec:a[2]})});
IF("standby <n> track <n>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.track=(c.track||[]).filter(t=>t.obj!==a[1]);if(!o.neg)c.track.push({obj:a[1],dec:10})});
IF("standby <n> timers <n> <n>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.timers=o.neg?null:[a[1],a[2]]});
IF("standby <n> timers msec <n> msec <n>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.timers=o.neg?null:["msec "+a[1],"msec "+a[2]]});
IF("standby <n> authentication md5 key-string <w>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.auth=o.neg?null:a[1]});
IF("standby <n> preempt delay minimum <n>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.preempt=!o.neg;c.pdelay=o.neg?null:a[1]});
IF("standby <n> name <w>",(d,i,a,o)=>{const c=i.hsrp[a[0]]||(i.hsrp[a[0]]={ip:null,pri:null,preempt:false});c.name=o.neg?null:a[1]});
IF("vrrp <n> track <n> decrement <n>",(d,i,a,o)=>{const c=i.vrrp[a[0]]||(i.vrrp[a[0]]={ip:null,pri:null,preempt:true});c.track=(c.track||[]).filter(t=>t.obj!==a[1]);if(!o.neg)c.track.push({obj:a[1],dec:a[2]})});
IF("vrrp <n> description <rest>",ok);
/* VRRPv3 (IOS XE) syntax */
C("config","fhrp version vrrp v3",(d,a,o)=>{d.vrrpV3=!o.neg;return ""});
IF("vrrp <n> address-family ipv4",(d,i,a,o)=>{if(!d.vrrpV3)return "% Enable VRRPv3 first: fhrp version vrrp v3";if(o.neg){delete i.vrrp[a[0]];return}i.vrrp[a[0]]=i.vrrp[a[0]]||{ip:null,pri:null,preempt:true,v3:true};o.x.mode="vrrp3";o.x.vg=a[0]});
const V3=o=>o.x.ifs[0].vrrp[o.x.vg];
C("vrrp3","address <ip>",(d,a,o)=>{V3(o).ip=o.neg?null:a[0];return ""});C("vrrp3","address <ip> primary",(d,a,o)=>{V3(o).ip=o.neg?null:a[0];return ""});
C("vrrp3","priority <n>",(d,a,o)=>{if(a[0]<1||a[0]>254)return INV;V3(o).pri=o.neg?null:a[0];return ""});
C("vrrp3","preempt",(d,a,o)=>{V3(o).preempt=!o.neg;return ""});
C("vrrp3","track <n> decrement <n>",(d,a,o)=>{const c=V3(o);c.track=(c.track||[]).filter(t=>t.obj!==a[0]);if(!o.neg)c.track.push({obj:a[0],dec:a[1]});return ""});
C("vrrp3","exit-vrrp",(d,a,o)=>{o.x.mode="if";return ""},{noNeg:1});

/* ================= MST and spanning-tree extras ================= */
C("config","spanning-tree mst configuration",(d,a,o)=>{if(d.kind==="router")return INV;if(o.neg){d.mst={name:"",rev:0,inst:{}};return ""}o.x.mode="mst";o.x.mstPend=JSON.parse(JSON.stringify(d.mst));return ""});
C("mst","name <w>",(d,a,o)=>{d.mst.name=o.neg?"":a[0];return ""});
C("mst","revision <n>",(d,a,o)=>{if(a[0]>65535)return INV;d.mst.rev=o.neg?0:a[0];return ""});
C("mst","instance <n> vlan <list>",(d,a,o)=>{if(a[0]<1||a[0]>4094)return INV;const L=vlanList(a[1]);if(!L)return INV;
  if(o.neg){if(d.mst.inst[a[0]])d.mst.inst[a[0]]=d.mst.inst[a[0]].filter(v=>!L.includes(v));if(d.mst.inst[a[0]]&&!d.mst.inst[a[0]].length)delete d.mst.inst[a[0]];return ""}
  Object.keys(d.mst.inst).forEach(k=>{d.mst.inst[k]=d.mst.inst[k].filter(v=>!L.includes(v));if(!d.mst.inst[k].length)delete d.mst.inst[k]});d.mst.inst[a[0]]=[...new Set([...(d.mst.inst[a[0]]||[]),...L])].sort((x,y)=>x-y);return ""});
C("mst","no instance <n>",(d,a,o)=>{delete d.mst.inst[a[0]];return ""},{hide:1});
C("mst","show pending",(d)=>IOS.mstCfgOut(d,"Pending"));C("mst","show current",(d)=>IOS.mstCfgOut(d,"Current"));
C("mst","abort",(d,a,o)=>{if(o.x.mstPend)d.mst=o.x.mstPend;o.x.mode="config";return ""},{noNeg:1});
C("config","spanning-tree mst <list> priority <n>",(d,a,o)=>{if(d.kind==="router")return INV;const L=vlanList(a[0])||[0];if(!o.neg&&a[1]%4096)return "% Bridge Priority must be in increments of 4096.\n% Allowed values are: \n  0     4096  8192  12288 16384 20480 24576 28672\n  32768 36864 40960 45056 49152 53248 57344 61440";
  String(a[0]).split(",").forEach(x=>{const k=+x;if(o.neg)delete d.mstPri[k];else d.mstPri[k]=a[1]});return ""});
C("config","spanning-tree mst <list> root primary",(d,a,o)=>{String(a[0]).split(",").forEach(x=>{if(o.neg)delete d.mstPri[+x];else d.mstPri[+x]=24576});return ""});
C("config","spanning-tree mst <list> root secondary",(d,a,o)=>{String(a[0]).split(",").forEach(x=>{if(o.neg)delete d.mstPri[+x];else d.mstPri[+x]=28672});return ""});
C("config","spanning-tree loopguard default",(d,a,o)=>{d.stp.loopDefault=!o.neg;return ""});
C("config","spanning-tree extend system-id",ok);
IF("spanning-tree link-type <w>",(d,i,a,o)=>{i.stpLink=o.neg?null:a[0]});
IF("spanning-tree bpdufilter enable",(d,i,a,o)=>{i.bf=!o.neg});
IF("spanning-tree mst <n> cost <n>",(d,i,a,o)=>{i.stpCost=o.neg?null:a[1]});
IF("spanning-tree mst <n> port-priority <n>",(d,i,a,o)=>{i.stpPri=o.neg?null:a[1]});
C("vlan","remote-span",(d,a,o)=>{o.x.sub.forEach(v=>d.vlans[v].rspan=!o.neg);return ""});

/* ================= NTP extras ================= */
const NX=d=>d.ntpx;
C("config","ntp master",(d,a,o)=>{NX(d).master=o.neg?null:8;return ""});
C("config","ntp master <n>",(d,a,o)=>{if(a[0]<1||a[0]>15)return INV;NX(d).master=o.neg?null:a[0];return ""});
C("config","ntp authenticate",(d,a,o)=>{NX(d).auth=!o.neg;return ""});
C("config","ntp authentication-key <n> md5 <w>",(d,a,o)=>{if(o.neg)delete NX(d).keys[a[0]];else NX(d).keys[a[0]]=a[1];return ""});
C("config","ntp authentication-key <n> md5 <w> <n>",(d,a,o)=>{if(o.neg)delete NX(d).keys[a[0]];else NX(d).keys[a[0]]=a[1];return ""},{hide:1});
C("config","ntp trusted-key <n>",(d,a,o)=>{const T=NX(d).trusted;NX(d).trusted=T.filter(k=>k!==a[0]);if(!o.neg)NX(d).trusted.push(a[0]);return ""});
C("config","ntp server <ip> key <n>",(d,a,o)=>{d.ntp=d.ntp.filter(n=>n!==a[0]);delete NX(d).srvKey[String(a[0])];if(!o.neg){d.ntp.push(a[0]);NX(d).srvKey[String(a[0])]=a[1]}return ""});
C("config","ntp server <ip> prefer",(d,a,o)=>{d.ntp=d.ntp.filter(n=>n!==a[0]);if(!o.neg)d.ntp.push(a[0]);return ""});
C("config","ntp source <if>",(d,a,o)=>{NX(d).src=o.neg?null:a[0];return ""});
C("config","ntp update-calendar",ok);C("config","clock summer-time <rest>",ok);

/* ================= QoS and CoPP (MQC) ================= */
const cmapCmd=(d,name,any,o)=>{if(o.neg){delete d.cmaps[name];return ""}if(name==="class-default")return "% class-default can't be configured";d.cmaps[name]=d.cmaps[name]||{any,matches:[]};d.cmaps[name].any=any;o.x.mode="cmap";o.x.sub=name;return ""};
C("config","class-map <w>",(d,a,o)=>cmapCmd(d,a[0],false,o));
C("config","class-map match-all <w>",(d,a,o)=>cmapCmd(d,a[0],false,o));
C("config","class-map match-any <w>",(d,a,o)=>cmapCmd(d,a[0],true,o));
const CM=(o,d)=>d.cmaps[o.x.sub];
const cmatch=(t,val)=>(d,a,o)=>{const v=val(a);if(v===INV)return INV;const M=CM(o,d).matches;const k=t+" "+v;const i=M.findIndex(m=>m.t+" "+m.v===k);if(o.neg){if(i>=0)M.splice(i,1)}else if(i<0)M.push({t,v});return ""};
const DSCP=["ef","af11","af12","af13","af21","af22","af23","af31","af32","af33","af41","af42","af43","cs0","cs1","cs2","cs3","cs4","cs5","cs6","cs7","default"];
const dscpOk=L=>L.every(x=>DSCP.includes(x.toLowerCase())||(/^\d+$/.test(x)&&+x<64));
C("cmap","match access-group name <w>",cmatch("access-group name",a=>a[0]));
C("cmap","match access-group <n>",cmatch("access-group",a=>a[0]));
C("cmap","match dscp <rest>",cmatch("dscp",a=>dscpOk(a.rest)?a.rest.map(x=>x.toLowerCase()).join(" "):INV));
C("cmap","match ip dscp <rest>",cmatch("ip dscp",a=>dscpOk(a.rest)?a.rest.map(x=>x.toLowerCase()).join(" "):INV));
C("cmap","match cos <rest>",cmatch("cos",a=>a.rest.every(x=>/^[0-7]$/.test(x))?a.rest.join(" "):INV));
C("cmap","match protocol <w>",cmatch("protocol",a=>a[0].toLowerCase()));
C("cmap","match ip precedence <rest>",cmatch("ip precedence",a=>a.rest.join(" ")));
C("cmap","match any",cmatch("any",a=>""));
C("cmap","description <rest>",ok);
C("config","policy-map <w>",(d,a,o)=>{if(o.neg){delete d.pmaps[a[0]];return ""}d.pmaps[a[0]]=d.pmaps[a[0]]||{classes:[]};o.x.mode="pmap";o.x.sub=a[0];o.x.parentSub=a[0];return ""});
C("pmap pmapc policec","class <w>",(d,a,o)=>{const pm=o.x.mode==="pmap"?o.x.sub:o.x.parentSub;const P=d.pmaps[pm];
  if(o.neg){P.classes=P.classes.filter(c=>c.cls!==a[0]);return ""}if(a[0]!=="class-default"&&!d.cmaps[a[0]])return `% class map ${a[0]} not configured`;
  let c=P.classes.find(x=>x.cls===a[0]);if(!c){c={cls:a[0],act:{}};const di=P.classes.findIndex(x=>x.cls==="class-default");if(di>=0&&a[0]!=="class-default")P.classes.splice(di,0,c);else P.classes.push(c)}
  o.x.mode="pmapc";o.x.parentSub=pm;o.x.sub={pm,cls:a[0]};return ""});
C("pmap","description <rest>",ok);
const PC=(o,d)=>d.pmaps[o.x.sub.pm].classes.find(c=>c.cls===o.x.sub.cls);
const act=(k,fn)=>(d,a,o)=>{const c=PC(o,d);if(o.neg){delete c.act[k];return ""}const v=fn(a,c,d);if(typeof v==="string"&&(v===INV||v.startsWith("%")))return v;c.act[k]=v;return ""};
const queuing=c=>["priority","bandwidth","shape"].filter(k=>c.act[k]!=null);
C("pmapc","priority <n>",act("priority",(a,c)=>c.act.bandwidth?"% Cannot configure priority and bandwidth in the same class":{kbps:a[0]}));
C("pmapc","priority percent <n>",act("priority",(a,c)=>c.act.bandwidth?"% Cannot configure priority and bandwidth in the same class":a[0]>100?INV:{pct:a[0]}));
C("pmapc","priority",act("priority",(a,c)=>c.act.bandwidth?"% Cannot configure priority and bandwidth in the same class":{}));
C("pmapc","priority level <n>",act("priority",(a,c)=>({level:a[0]})));
C("pmapc","bandwidth <n>",act("bandwidth",(a,c)=>c.act.priority?"% Cannot configure bandwidth and priority in the same class":{kbps:a[0]}));
C("pmapc","bandwidth percent <n>",act("bandwidth",(a,c)=>c.act.priority?"% Cannot configure bandwidth and priority in the same class":a[0]>100?INV:{pct:a[0]}));
C("pmapc","bandwidth remaining percent <n>",act("bandwidth",(a,c)=>c.act.priority?"% Cannot configure bandwidth and priority in the same class":{rem:a[0]}));
C("pmapc","shape average <n>",act("shape",a=>({avg:a[0]})));
C("pmapc","shape average percent <n>",act("shape",a=>({pct:a[0]})));
C("pmapc","fair-queue",act("fq",()=>true));
C("pmapc","random-detect",act("wred",()=>"default"));C("pmapc","random-detect dscp-based",act("wred",()=>"dscp-based"));
C("pmapc","queue-limit <n> packets",act("ql",a=>a[0]));
C("pmapc","set dscp <w>",act("set",a=>dscpOk([a[0]])?{dscp:a[0].toLowerCase()}:INV));
C("pmapc","set ip dscp <w>",act("set",a=>dscpOk([a[0]])?{dscp:a[0].toLowerCase()}:INV));
C("pmapc","set cos <n>",act("setcos",a=>a[0]<8?a[0]:INV));
C("pmapc","drop",act("drop",()=>true));
C("pmapc","service-policy <w>",act("child",(a,c,d)=>d.pmaps[a[0]]?a[0]:`% policy map ${a[0]} not configured`));
const actName=t=>kw(t,["transmit","drop","set-dscp-transmit","set-prec-transmit"]);
const police=(a,c,rest)=>{const p={cir:a[0],conform:"transmit",exceed:"drop"};const T=rest||[];for(let k=0;k<T.length;k++){const t=T[k].toLowerCase();
    if(/^\d+$/.test(t)){p.bc=+t;continue}if(t==="conform-action"){p.conform=actName(T[++k]);if(p.conform&&p.conform.startsWith("set-"))p.conformV=T[++k]}else if(t==="exceed-action"){p.exceed=actName(T[++k]);if(p.exceed&&p.exceed.startsWith("set-"))p.exceedV=T[++k]}else if(t==="violate-action"){p.violate=actName(T[++k])}else if(t==="pir"){p.pir=+T[++k]}else if(t==="bc"){p.bc=+T[++k]}else if(t==="be"){p.be=+T[++k]}else return INV}
  if(!p.conform||!p.exceed)return INV;return p};
C("pmapc","police <n>",(d,a,o)=>{const c=PC(o,d);if(o.neg){delete c.act.police;return ""}c.act.police={cir:a[0],conform:"transmit",exceed:"drop"};o.x.mode="policec";return ""});
C("pmapc","police <n> <rest>",act("police",a=>police(a,null,a.rest)));
C("pmapc","police cir <n>",(d,a,o)=>{const c=PC(o,d);if(o.neg){delete c.act.police;return ""}c.act.police={cir:a[0],conform:"transmit",exceed:"drop"};o.x.mode="policec";return ""});
C("pmapc","police cir <n> <rest>",act("police",a=>police(a,null,a.rest)));
C("pmapc","police rate <n> pps",(d,a,o)=>{const c=PC(o,d);if(o.neg){delete c.act.police;return ""}c.act.police={cir:a[0],pps:true,conform:"transmit",exceed:"drop"};o.x.mode="policec";return ""});
C("pmapc","police rate <n> pps <rest>",act("police",a=>{const p=police(a,null,a.rest);if(p!==INV)p.pps=true;return p}));
C("policec","conform-action <w>",(d,a,o)=>{const p=PC(o,d).act.police;const v=actName(a[0]);if(!v)return INV;p.conform=v;return ""});
C("policec","exceed-action <w>",(d,a,o)=>{const p=PC(o,d).act.police;const v=actName(a[0]);if(!v)return INV;p.exceed=v;return ""});
C("policec","conform-action set-dscp-transmit <w>",(d,a,o)=>{const p=PC(o,d).act.police;p.conform="set-dscp-transmit";p.conformV=a[0];return ""});
C("policec","exceed-action set-dscp-transmit <w>",(d,a,o)=>{const p=PC(o,d).act.police;p.exceed="set-dscp-transmit";p.exceedV=a[0];return ""});
C("policec","violate-action <w>",(d,a,o)=>{const p=PC(o,d).act.police;p.violate=actName(a[0]);return ""});
/* attaching a policy checks the rules IOS enforces */
function svcCheck(d,name,dir,cp){const P=d.pmaps[name];if(!P)return `policy map ${name} not configured`;
  for(const c of P.classes){if(dir==="input"&&(c.act.priority||c.act.bandwidth||c.act.shape||c.act.fq))return `%Error: ${c.act.priority?"priority":c.act.bandwidth?"bandwidth":c.act.shape?"shape":"fair-queue"} command is not supported in the input direction (policy ${name}, class ${c.cls}). Queuing actions only work outbound.`;
    if(cp&&(c.act.priority||c.act.bandwidth||c.act.shape))return `%Error: only police, drop and set actions are allowed on the control plane`;
    const pr=P.classes.reduce((s,x)=>s+(x.act.priority?.pct||0)+(x.act.bandwidth?.pct||0),0);if(pr>100)return `% Sum of bandwidths/priorities is greater than 100 percent of the interface bandwidth`}
  return null}
IOS.svcCheck=svcCheck;
IF("service-policy input <w>",(d,i,a,o)=>{if(o.neg){i.svc.in=null;return}const e=svcCheck(d,a[0],"input");if(e)return e;i.svc.in=a[0]});
IF("service-policy output <w>",(d,i,a,o)=>{if(o.neg){i.svc.out=null;return}const e=svcCheck(d,a[0],"output");if(e)return e;i.svc.out=a[0]});
C("config","control-plane",(d,a,o)=>{o.x.mode="cp";return ""},{noNeg:1});
C("cp","service-policy input <w>",(d,a,o)=>{if(o.neg){d.cpSvc=null;return ""}const e=svcCheck(d,a[0],"input",true);if(e)return e;d.cpSvc=a[0];return ""});
C("cp","service-policy output <w>",(d,a,o)=>{return "% Use service-policy input for CoPP: it protects the CPU from traffic coming in"});
C("config","mls qos",(d,a,o)=>{d.mlsQos=!o.neg;return ""});
IF("mls qos trust <w>",(d,i,a,o)=>{i.trust=o.neg?null:a[0]});
IF("trust device cisco-phone",(d,i,a,o)=>{i.trustPhone=!o.neg});

/* ================= Flexible NetFlow ================= */
const FN=d=>d.fnf;
C("config","flow record <w>",(d,a,o)=>{if(o.neg){delete FN(d).rec[a[0]];return ""}FN(d).rec[a[0]]=FN(d).rec[a[0]]||{match:[],collect:[]};o.x.mode="frec";o.x.sub=a[0];return ""});
C("frec","match <rest>",(d,a,o)=>{const R=FN(d).rec[o.x.sub];const v=a[0].toLowerCase();if(!/^(ipv4|ipv6|transport|interface|flow|application|datalink) /.test(v))return INV;R.match=R.match.filter(x=>x!==v);if(!o.neg)R.match.push(v);return ""});
C("frec","collect <rest>",(d,a,o)=>{const R=FN(d).rec[o.x.sub];const v=a[0].toLowerCase();if(!/^(counter|timestamp|interface|transport|ipv4|flow|application) /.test(v))return INV;R.collect=R.collect.filter(x=>x!==v);if(!o.neg)R.collect.push(v);return ""});
C("frec fexp fmon","description <rest>",ok);
C("config","flow exporter <w>",(d,a,o)=>{if(o.neg){delete FN(d).exp[a[0]];return ""}FN(d).exp[a[0]]=FN(d).exp[a[0]]||{dst:null,src:null,port:9995,proto:"netflow-v9"};o.x.mode="fexp";o.x.sub=a[0];return ""});
C("fexp","destination <ip>",(d,a,o)=>{FN(d).exp[o.x.sub].dst=o.neg?null:a[0];return ""});
C("fexp","source <if>",(d,a,o)=>{if(!d.ifs[a[0]])return INV;FN(d).exp[o.x.sub].src=o.neg?null:a[0];return ""});
C("fexp","transport udp <n>",(d,a,o)=>{FN(d).exp[o.x.sub].port=o.neg?9995:a[0];return ""});
C("fexp","export-protocol <w>",(d,a,o)=>{const p=kw(a[0],["netflow-v9","ipfix","netflow-v5"]);if(!p)return INV;FN(d).exp[o.x.sub].proto=o.neg?"netflow-v9":p;return ""});
C("fexp","template data timeout <n>",ok);
C("config","flow monitor <w>",(d,a,o)=>{if(o.neg){delete FN(d).mon[a[0]];return ""}FN(d).mon[a[0]]=FN(d).mon[a[0]]||{rec:null,exp:[],active:1800,inactive:15};o.x.mode="fmon";o.x.sub=a[0];return ""});
C("fmon","record <w>",(d,a,o)=>{const M=FN(d).mon[o.x.sub];if(o.neg){M.rec=null;return ""}if(!["netflow ipv4 original-input","netflow-original"].includes(a[0])&&!FN(d).rec[a[0]])return `% Flow record ${a[0]} does not exist`;M.rec=a[0];return ""});
C("fmon","exporter <w>",(d,a,o)=>{const M=FN(d).mon[o.x.sub];if(!o.neg&&!FN(d).exp[a[0]])return `% Flow exporter ${a[0]} does not exist`;M.exp=M.exp.filter(x=>x!==a[0]);if(!o.neg)M.exp.push(a[0]);return ""});
C("fmon","cache timeout active <n>",(d,a,o)=>{FN(d).mon[o.x.sub].active=o.neg?1800:a[0];return ""});
C("fmon","cache timeout inactive <n>",(d,a,o)=>{FN(d).mon[o.x.sub].inactive=o.neg?15:a[0];return ""});
IF("ip flow monitor <w> input",(d,i,a,o)=>{if(!o.neg){const M=FN(d).mon[a[0]];if(!M)return `% Flow Monitor: Flow Monitor '${a[0]}' does not exist`;if(!M.rec)return `% Flow Monitor: Flow Monitor '${a[0]}' has no record configured. Add one before applying it.`}i.flowMon.in=o.neg?null:a[0]});
IF("ip flow monitor <w> output",(d,i,a,o)=>{if(!o.neg){const M=FN(d).mon[a[0]];if(!M)return `% Flow Monitor: Flow Monitor '${a[0]}' does not exist`;if(!M.rec)return `% Flow Monitor: Flow Monitor '${a[0]}' has no record configured. Add one before applying it.`}i.flowMon.out=o.neg?null:a[0]});

/* ================= SPAN, RSPAN and ERSPAN ================= */
const MON=(d,n)=>d.mon[n]||(d.mon[n]={type:"local",src:[],srcVlan:null,dst:null,dstVlan:null,srcRemote:null});
function srcList(d,rest){const out=[];let dir="both";const T=rest.slice();const last=(T[T.length-1]||"").toLowerCase();if(["rx","tx","both"].includes(last)){dir=last;T.pop()}
  for(const part of T.join(" ").split(",")){const s=part.trim();if(!s)continue;const m=/^(.*?)(\d+)\s*-\s*(\d+)$/.exec(s);
    if(m&&!/\//.test(m[3])){const base=ifName(m[1].replace(/\s+/g,"")+m[2]);if(!base)return null;const pre=base.slice(0,base.length-m[2].length);for(let k=+m[2];k<=+m[3];k++){if(!d.ifs[pre+k])return null;out.push({if:pre+k,dir})}}
    else{const n=ifName(s.replace(/\s+/g,""));if(!n||!d.ifs[n])return null;out.push({if:n,dir})}}return out}
C("config","monitor session <n> source interface <rest>",(d,a,o)=>{if(d.kind==="router")return INV;const M=MON(d,a[0]);if(o.neg){M.src=[];return ""}const L=srcList(d,a.rest);if(!L)return INV;
  if(M.dst&&L.some(s=>s.if===M.dst))return `% Interface(s) ${ifShort(M.dst)} already configured as monitor destination`;if(M.srcVlan)return "% Cannot mix source interfaces and source VLANs in one session";
  M.src=M.src.filter(s=>!L.some(x=>x.if===s.if)).concat(L);return ""});
C("config","monitor session <n> source vlan <list>",(d,a,o)=>{const M=MON(d,a[0]);if(o.neg){M.srcVlan=null;return ""}if(M.src.length)return "% Cannot mix source interfaces and source VLANs in one session";M.srcVlan=a[1];M.vdir="both";return ""});
C("config","monitor session <n> source vlan <list> <w>",(d,a,o)=>{const M=MON(d,a[0]);if(o.neg){M.srcVlan=null;return ""}if(M.src.length)return "% Cannot mix source interfaces and source VLANs in one session";M.srcVlan=a[1];M.vdir=kw(a[2],["rx","tx","both"])||"both";return ""});
C("config","monitor session <n> destination interface <if>",(d,a,o)=>{const M=MON(d,a[0]);if(o.neg){M.dst=null;return ""}if(M.src.some(s=>s.if===a[1]))return `% Interface ${ifShort(a[1])} is already a source in session ${a[0]}`;
  if(Object.entries(d.mon).some(([k,x])=>+k!==a[0]&&x.dst===a[1]))return "% Interface is already a destination in another session";M.dst=a[1];return ""});
C("config","monitor session <n> destination interface <if> encapsulation replicate",(d,a,o)=>{const M=MON(d,a[0]);M.dst=o.neg?null:a[1];M.repl=!o.neg;return ""});
C("config","monitor session <n> destination remote vlan <n>",(d,a,o)=>{const M=MON(d,a[0]);if(o.neg){M.dstVlan=null;return ""}if(!d.vlans[a[1]]||!d.vlans[a[1]].rspan)return `% VLAN ${a[1]} is not configured as a remote-span VLAN`;M.dstVlan=a[1];M.type="rspan-src";return ""});
C("config","monitor session <n> source remote vlan <n>",(d,a,o)=>{const M=MON(d,a[0]);if(o.neg){M.srcRemote=null;return ""}if(!d.vlans[a[1]]||!d.vlans[a[1]].rspan)return `% VLAN ${a[1]} is not configured as a remote-span VLAN`;M.srcRemote=a[1];M.type="rspan-dst";return ""});
C("config","monitor session <n>",(d,a,o)=>{if(o.neg){delete d.mon[a[0]];return ""}return "% Incomplete command."},{hide:1});
C("config","monitor session <n> type erspan-source",(d,a,o)=>{if(o.neg){delete d.mon[a[0]];return ""}const M=MON(d,a[0]);M.type="erspan-src";M.er=M.er||{id:null,ip:null,origin:null,shut:true};o.x.mode="erspan";o.x.sub=a[0];o.x.parentSub=a[0];return ""});
C("erspan","source interface <rest>",(d,a,o)=>{const M=d.mon[o.x.sub];if(o.neg){M.src=[];return ""}const L=srcList(d,a.rest);if(!L)return INV;M.src=M.src.filter(s=>!L.some(x=>x.if===s.if)).concat(L);return ""});
C("erspan","shutdown",(d,a,o)=>{d.mon[o.x.sub].er.shut=!o.neg;return ""});
C("erspan","description <rest>",ok);
C("erspan","destination",(d,a,o)=>{o.x.mode="erspandst";return ""},{noNeg:1});
C("erspandst","erspan-id <n>",(d,a,o)=>{if(a[0]<1||a[0]>1023)return INV;d.mon[o.x.sub].er.id=o.neg?null:a[0];return ""});
C("erspandst","ip address <ip>",(d,a,o)=>{d.mon[o.x.sub].er.ip=o.neg?null:a[0];return ""});
C("erspandst","origin ip address <ip>",(d,a,o)=>{d.mon[o.x.sub].er.origin=o.neg?null:a[0];return ""});
C("erspandst","ip ttl <n>",ok);

/* ================= EEM ================= */
C("config","event manager applet <w>",(d,a,o)=>{if(o.neg){delete d.eem[a[0]];return ""}d.eem[a[0]]=d.eem[a[0]]||{ev:null,acts:[]};o.x.mode="applet";o.x.sub=a[0];return ""});
const unq=s=>s.trim().replace(/^"(.*)"$/,"$1");
const AP=(o,d)=>d.eem[o.x.sub];
C("applet","event none",(d,a,o)=>{AP(o,d).ev=o.neg?null:{t:"none"};return ""});
C("applet","event syslog pattern <rest>",(d,a,o)=>{AP(o,d).ev=o.neg?null:{t:"syslog",pat:unq(a[0])};return ""});
C("applet","event track <n> state <w>",(d,a,o)=>{const st=kw(a[1],["up","down","any"]);if(!st)return INV;AP(o,d).ev=o.neg?null:{t:"track",id:a[0],state:st};return ""});
C("applet","event timer <rest>",(d,a,o)=>{AP(o,d).ev=o.neg?null:{t:"timer",spec:a[0]};return ""});
C("applet","event interface name <if> parameter <rest>",(d,a,o)=>{AP(o,d).ev=o.neg?null:{t:"ifcounter",if:a[0]};return ""});
C("applet","event cli pattern <rest>",(d,a,o)=>{AP(o,d).ev=o.neg?null:{t:"cli",pat:unq(a[0].replace(/\s+(sync|skip)\s+\S+.*$/,""))};return ""});
const addAct=(t,mk)=>(d,a,o)=>{const A=AP(o,d);A.acts=A.acts.filter(x=>x.lbl!==a[0]);if(!o.neg)A.acts.push({lbl:a[0],t,...mk(a)});return ""};
C("applet","action <w> cli command <rest>",addAct("cli",a=>({cmd:unq(a[1])})));
C("applet","action <w> syslog msg <rest>",addAct("syslog",a=>({msg:unq(a[1])})));
C("applet","action <w> syslog priority <w> msg <rest>",addAct("syslog",a=>({msg:unq(a[2]),pri:a[1]})));
C("applet","action <w> mail <rest>",addAct("mail",a=>({rest:a[1]})));
C("applet","action <w> wait <n>",addAct("wait",a=>({n:a[1]})));
C("applet","action <w> puts <rest>",addAct("syslog",a=>({msg:unq(a[1])})));
C("applet","description <rest>",(d,a,o)=>{AP(o,d).desc=o.neg?null:unq(a[0]);return ""});
C("config","event manager environment <w> <rest>",ok);

/* ================= AAA extras, model-driven programmability, misc ================= */
C("config","aaa authentication login <w> <rest>",(d,a,o)=>{if(!d.aaa)return INV;const L=d.aaaLists||(d.aaaLists={});if(o.neg){delete L[a[0]];return ""}
  if(!/^(group \S+ ?)*(local|none|enable)?( local| none)?$/.test(a[1].trim()))return INV;L[a[0]]=a[1].trim().split(/\s+/);if(a[0]==="default")d.aaaLogin=a[1].trim();return ""});
C("config","aaa authorization exec <w> <rest>",(d,a,o)=>{if(!d.aaa)return INV;if(a[0]==="default")d.aaaAuthz=o.neg?null:a[1];else{(d.aaaAuthzL||(d.aaaAuthzL={}))[a[0]]=o.neg?undefined:a[1]}return ""});
C("config","aaa authentication enable default <rest>",(d,a,o)=>{if(!d.aaa)return INV;d.aaaEnable=o.neg?null:a[0];return ""});
C("config","aaa accounting commands <n> default start-stop group <w>",(d,a,o)=>{if(!d.aaa)return INV;d.aaaCmdAcct=o.neg?null:[a[0],a[1]];return ""});
C("config","aaa session-id common",ok);
C("config","aaa group server tacacs+ <w>",(d,a,o)=>{if(!d.aaa)return INV;const G2=d.aaaGroups||(d.aaaGroups={});if(o.neg){delete G2[a[0]];return ""}G2[a[0]]=G2[a[0]]||{proto:"tacacs",servers:[]};o.x.mode="sg";o.x.sub=a[0];return ""});
C("config","aaa group server radius <w>",(d,a,o)=>{if(!d.aaa)return INV;const G2=d.aaaGroups||(d.aaaGroups={});if(o.neg){delete G2[a[0]];return ""}G2[a[0]]=G2[a[0]]||{proto:"radius",servers:[]};o.x.mode="sgr";o.x.sub=a[0];return ""});
C("sg sgr","server name <w>",(d,a,o)=>{const g=d.aaaGroups[o.x.sub];g.servers=g.servers.filter(s=>s!==a[0]);if(!o.neg)g.servers.push(a[0]);return ""});
C("sg sgr","ip vrf forwarding <w>",ok);
C("config","ip tacacs source-interface <if>",(d,a,o)=>{d.aaaSrc=o.neg?null:a[0];return ""});
C("config","ip radius source-interface <if>",(d,a,o)=>{d.aaaSrc=o.neg?null:a[0];return ""});
C("line","login authentication <w>",(d,a,o)=>{const L=d.lines[o.x.sub];L.authList=o.neg?null:a[0];L.aaa=!o.neg;return ""});
C("line","authorization exec <w>",(d,a,o)=>{d.lines[o.x.sub].authz=o.neg?null:a[0];return ""});
C("config","netconf-yang",(d,a,o)=>{d.extra.netconf=!o.neg;return ""});
C("config","restconf",(d,a,o)=>{d.extra.restconf=!o.neg;return ""});
C("config","ip http authentication local",(d,a,o)=>{d.extra.httpAuth=o.neg?null:"local";return ""});
C("config","ip http secure-server",(d,a,o)=>{d.extra.https=!o.neg;return ""});
C("config","ip http server",(d,a,o)=>{d.extra.http=!o.neg;return ""});
C("config","ip ssh source-interface <if>",ok);
C("config","login block-for <n> attempts <n> within <n>",(d,a,o)=>{d.extra.loginBlock=o.neg?null:[a[0],a[1],a[2]];return ""});
C("config","login on-failure log",ok);C("config","login on-success log",ok);
C("config","security passwords min-length <n>",(d,a,o)=>{d.extra.minLen=o.neg?null:a[0];return ""});
C("config","logging source-interface <if>",(d,a,o)=>{d.logging.src=o.neg?null:a[0];return ""});
C("config","logging host <ip> transport udp port <n>",(d,a,o)=>{d.logging.hosts=d.logging.hosts.filter(h=>h!==a[0]);if(!o.neg)d.logging.hosts.push(a[0]);return ""});
C("config","logging host <ip> transport tcp port <n>",(d,a,o)=>{d.logging.hosts=d.logging.hosts.filter(h=>h!==a[0]);if(!o.neg)d.logging.hosts.push(a[0]);return ""});
C("config","snmp-server group <w> v3 auth",(d,a,o)=>{d.snmp.groups=(d.snmp.groups||[]).filter(g=>g!==a[0]);if(!o.neg)d.snmp.groups.push(a[0]);return ""});
C("config","snmp-server enable traps <rest>",(d,a,o)=>{d.snmp.traps=!o.neg;return ""});
C("config","ip multicast-routing",(d,a,o)=>{d.mcast=!o.neg;return ""});
C("config","ip multicast-routing distributed",(d,a,o)=>{d.mcast=!o.neg;return ""});
C("config","ip pim rp-address <ip>",(d,a,o)=>{d.rp=o.neg?null:a[0];return ""});
C("config","ip pim ssm default",(d,a,o)=>{d.ssm=!o.neg;return ""});
IF("ip pim sparse-mode",(d,i,a,o)=>{if(!i.l3)return INV;i.pim=o.neg?false:"sparse-mode"});
IF("ip pim passive",(d,i,a,o)=>{i.pim=o.neg?false:"passive"});
IF("ip igmp version <n>",(d,i,a,o)=>{i.igmpV=o.neg?null:a[0]});
IF("ip igmp join-group <ip>",ok);
IF("macsec",(d,i,a,o)=>{i.macsec=!o.neg});IF("mka policy <w>",ok);
IF("cts manual",(d,i,a,o)=>{i.cts=!o.neg});
C("config","ip cef",ok);C("config","ipv6 cef",ok);C("config","no ip domain lookup",ok,{hide:1});
IF("channel-group",(d,i,a,o)=>{if(o.neg){i.cg=null;return}return "% Incomplete command."},{hide:1});IF("channel-group <n>",(d,i,a,o)=>{if(o.neg){i.cg=null;return}return "% Incomplete command."},{hide:1});

})();
