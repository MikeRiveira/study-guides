/* ================= Cisco IOS simulator: network model =================
   A small model of routers and switches. Labs build a "world" of devices, links and hosts,
   configure some devices with IOS commands, and let the learner type into the rest.
   Everything shown by show commands is computed from the live configuration. */
const IOS={};
IOS.G={tun:0,bgp:0,trk:0};
/* per-world memo, cleared whenever the world's version changes (every command bumps it) */
IOS.memo=function(w,key,fn){if(!w._c||w._c.ver!==(w.ver||0))w._c={ver:w.ver||0};if(key in w._c)return w._c[key];const v=fn();w._c[key]=v;return v};
(function(){
/* ---------- addresses (BigInt for both families) ---------- */
const B=BigInt;
function ip4(s){if(typeof s!=="string")return null;const p=s.split(".");if(p.length!==4)return null;let n=0n;for(const x of p){if(!/^\d{1,3}$/.test(x)||+x>255)return null;n=n*256n+B(x)}return n}
const ip4s=n=>[24n,16n,8n,0n].map(s=>String((n>>s)&255n)).join(".");
function maskLen(m){const n=ip4(m);if(n===null)return null;const b=n.toString(2).padStart(32,"0");if(!/^1*0*$/.test(b))return null;const z=b.indexOf("0");return z<0?32:z}
const lenMask=l=>ip4s(l<=0?0n:(((1n<<32n)-1n)^((1n<<B(32-l))-1n)));
const wild=l=>ip4s(l>=32?0n:((1n<<B(32-l))-1n));
function ip6(s){if(typeof s!=="string"||!s.includes(":"))return null;s=s.toLowerCase();if((s.match(/::/g)||[]).length>1)return null;
  let [a,b]=s.includes("::")?s.split("::"):[s,null];const A=a?a.split(":"):[],Bb=b===null?[]:(b?b.split(":"):[]);
  const fill=b===null?0:8-A.length-Bb.length;if(fill<0||(b===null&&A.length!==8))return null;
  const g=[...A,...Array(fill).fill("0"),...Bb];if(g.length!==8||!g.every(x=>/^[0-9a-f]{1,4}$/.test(x)))return null;
  return g.reduce((n,x)=>(n<<16n)+B(parseInt(x,16)),0n)}
function ip6s(n){const g=[];for(let i=7;i>=0;i--)g.push(Number((n>>B(i*16))&0xffffn).toString(16));
  let bs=-1,bl=0;for(let s=0;s<8;s++){let l=0;while(s+l<8&&g[s+l]==="0")l++;if(l>bl&&l>1){bl=l;bs=s}}
  const r=bs<0?g.join(":"):g.slice(0,bs).join(":")+"::"+g.slice(bs+bl).join(":");return r.toUpperCase()}
const bits=f=>f===6?128:32;
const pfx=(n,len,f)=>{const w=bits(f);if(len<=0)return 0n;if(len>=w)return n;const s=B(w-len);return (n>>s)<<s};
const inNet=(n,net,len,f)=>pfx(n,len,f)===pfx(net,len,f);
const addrS=(n,f)=>f===6?ip6s(n):ip4s(n);
function eui64(mac){/* mac "aabb.ccdd.eeff" -> interface id BigInt */
  const h=mac.replace(/\./g,"");const b=h.match(/../g).map(x=>parseInt(x,16));b[0]^=2;
  const e=[b[0],b[1],b[2],0xff,0xfe,b[3],b[4],b[5]];return e.reduce((n,x)=>(n<<8n)+B(x),0n)}
Object.assign(IOS,{ip4,ip4s,maskLen,lenMask,wild,ip6,ip6s,pfx,inNet,eui64,addrS});

/* ---------- interface names ---------- */
const IFT=[["GigabitEthernet","Gi"],["FastEthernet","Fa"],["TenGigabitEthernet","Te"],["Loopback","Lo"],["Vlan","Vl"],["Port-channel","Po"],["Serial","Se"],["Tunnel","Tu"],["Null","Nu"]];
function ifName(s){if(!s)return null;const m=/^([a-z-]+)\s*(\d[\d\/\.:]*)$/i.exec(String(s).trim());if(!m)return null;
  const t=m[1].toLowerCase();const f=IFT.find(([full])=>full.toLowerCase().startsWith(t));return f?f[0]+m[2]:null}
const ifShort=n=>{const f=IFT.find(([full])=>n.startsWith(full));return f?f[1]+n.slice(f[0].length):n};
const ifType=n=>IFT.find(([full])=>n.startsWith(full))?.[0]||"";
const ifNum=n=>n.slice(ifType(n).length);
function expandIfs(spec){/* "g0/0/0-2" or ["g1/0/1-8","g1/1/1"] */
  const out=[];[].concat(spec).forEach(s=>{const m=/^(.*?)(\d+)-(\d+)$/.exec(s);if(m&&!/\//.test(m[3])){const base=ifName(m[1]+m[2]);const pre=base.slice(0,base.length-m[2].length);for(let i=+m[2];i<=+m[3];i++)out.push(pre+i)}else out.push(ifName(s))});return out}
Object.assign(IOS,{ifName,ifShort,ifType,expandIfs});

/* ---------- devices ---------- */
let macSeq=1;
function newIf(d,name){
  const isSw=d.kind!=="router",phys=/^(Gigabit|Fast|TenGig|Serial)/.test(name)&&!name.includes(".");
  const i={name,desc:"",ip:null,len:null,sec:[],dhcp:false,v6:[],v6en:false,v6auto:false,shut:phys&&!isSw,
    l3:d.kind==="router"||/^(Vlan|Loopback|Tunnel)/.test(name)||name.includes("."),sw:{mode:"auto",access:1,voice:null,native:1,allowed:null,noneg:false},cg:null,pf:false,pfTrunk:false,bg:false,guard:null,
    ps:null,helper:[],nat:null,acl:{in:null,out:null},ospf:{},ospf6:null,vrf:null,tun:null,policy:null,svc:{in:null,out:null},flowMon:{},pim:false,hsrp:{},hsrpV:1,vrrp:{},encap:null,encapNative:false,speed:"auto",duplex:"auto",
    snoopTrust:false,snoopRate:null,daiTrust:false,storm:null,stormAction:null,raPolicy:null,poe:"auto",err:null,cdp:true,mac:null,bw:null};
  i.mac=d.macBase+"."+(macSeq++).toString(16).padStart(4,"0");
  d.ifs[name]=i;return i}
function newDev(o){
  const d={name:o.name,host:o.name,kind:o.kind||"router",model:o.model||(o.kind==="router"?"ISR4331":o.kind==="l3"?"C9300-24T":"C9200L-24T"),
    macBase:o.macBase||("00"+(0xa0+(macSeq%60)).toString(16)+"."+((macSeq*2671)%65536).toString(16).padStart(4,"0")),
    ifs:{},vlans:{1:{name:"default"}},routes:[],routes6:[],acls:{},ospf:null,ospf6:null,nat:{rules:[],statics:[],pools:{}},pools:{},excl:[],
    lines:{con:{login:false,pw:null,local:false,sync:false,timeout:null},vty:{login:false,pw:null,local:false,transport:null,acl:null,timeout:null}},
    users:{},secret:null,enablePw:null,pwEnc:false,domain:null,rsa:0,sshv:null,banner:null,ipRouting:(o.kind||"router")==="router",v6Routing:false,
    defGw:null,nameServers:[],stp:{mode:"rapid-pvst",pri:{},pfDefault:false,bgDefault:false},snoop:{on:false,vlans:[],opt82:true},dai:[],
    lldp:false,cdp:true,aaa:false,aaaLogin:null,tacacs:{},radius:{},logging:{hosts:[],trap:null,buffered:false,ts:false},snmp:{comm:[],hosts:[],v3:[],loc:null},
    ntp:[],scp:false,raPol:{},vrfs:{},bgp:null,rmaps:{},plists:{},tracks:{},slas:{},eem:{},cmaps:{},pmaps:{},cpSvc:null,mon:{},fnf:{rec:{},exp:{},mon:{}},crypto:{isakmp:{},keys:{},ts:{},prof:{}},ntpx:{master:null,auth:false,keys:{},trusted:[],srvKey:{}},mst:{name:"",rev:0,inst:{}},mstPri:{},dbg:[],extra:{},saved:null,cfgChanged:false,clockTz:null,history:[]};
  (o.ifs?expandIfs(o.ifs):(d.kind==="router"?expandIfs("g0/0/0-2"):expandIfs("g1/0/1-12"))).forEach(n=>newIf(d,n));
  return d}
function getIf(d,name,create){if(d.ifs[name])return d.ifs[name];if(!create)return null;
  const t=ifType(name);if(t==="Loopback"||t==="Tunnel"||t==="Port-channel"||(t==="Vlan"&&d.kind!=="router")||(name.includes(".")&&d.ifs[name.split(".")[0]]&&d.kind==="router")){const i=newIf(d,name);if(t==="Vlan")i.shut=false;if(name.includes("."))i.shut=false;return i}
  return null}
Object.assign(IOS,{newDev,getIf});

/* ---------- world ---------- */
/* w={devs:{}, segs:[[ [dev,if],[dev,if],...], ...], hosts:[{name,ip,len,gw,mac,at:"SW1:Gi1/0/2",vlan,dhcp}]} */
function world(def){
  const w={devs:{},segs:[],hosts:[],log:[],t0:Date.now()};
  (def.devices||[]).forEach(o=>{w.devs[o.name]=newDev(o)});
  (def.links||[]).forEach(l=>w.segs.push(l.map(s=>{const [dv,i]=s.split(":");return [dv,ifName(i)]})));
  (def.hosts||[]).forEach(h=>w.hosts.push({...h,ip:typeof h.ip==="string"?ip4(h.ip):h.ip,gw:typeof h.gw==="string"?ip4(h.gw):h.gw,len:h.len||24,ip6:typeof h.ip6==="string"?ip6(h.ip6):h.ip6,at:h.at?h.at.split(":")[0]+":"+ifName(h.at.split(":")[1]):null,mac:h.mac||("0050.56"+(0xa0+w.hosts.length).toString(16)+"."+(0x1000+w.hosts.length*17).toString(16))}));
  return w}
const segOf=(w,dv,i)=>w.segs.find(s=>s.some(([a,b])=>a===dv&&b===i));
const peersOf=(w,dv,i)=>/^Tunnel/.test(i)&&IOS.tunPeers?IOS.tunPeers(w,dv,i):(segOf(w,dv,i)||[]).filter(([a,b])=>!(a===dv&&b===i));
const hostsAt=(w,dv,i)=>w.hosts.filter(h=>h.at===dv+":"+i);
Object.assign(IOS,{world,peersOf,hostsAt,segOf});

/* ---------- interface status ---------- */
function vlanActive(w,d,v){if(!d.vlans[v])return false;return Object.values(d.ifs).some(i=>!i.l3&&!ifType(i.name).match(/Vlan|Loopback/)&&physUp(w,d,i)&&(swMode(i)==="access"?i.sw.access==v||i.sw.voice==v:trunkAllows(i,v)))}
function swMode(i){if(i.sw.oper)return i.sw.oper;return i.sw.mode==="trunk"?"trunk":"access"}
function trunkAllows(i,v){if(swMode(i)!=="trunk")return false;const a=i.sw.allowed;return a===null||listHas(a,v)}
function listHas(list,v){return String(list).split(",").some(p=>{if(p==="all")return true;const [a,b]=p.split("-").map(Number);return b?v>=a&&v<=b:v===a})}
function physUp(w,d,i){if(i.shut||i.err)return false;
  if(i.name.includes(".")){const p=d.ifs[i.name.split(".")[0]];return p?physUp(w,d,p):false}
  const t=ifType(i.name);
  if(t==="Loopback")return true;
  if(t==="Tunnel")return IOS.tunLine?IOS.tunLine(w,d,i):true;
  if(t==="Null")return true;
  if(t==="Vlan")return vlanActive(w,d,+ifNum(i.name));
  if(t==="Port-channel")return Object.values(d.ifs).some(m=>m.cg&&m.cg.n==ifNum(i.name)&&ecMember(w,d,m)==="P");
  const pe=peersOf(w,d.name,i.name);
  if(pe.length)return pe.some(([pd,pi])=>{const P=w.devs[pd]?.ifs[pi];return P&&!P.shut&&!P.err&&duplexOk(i,P)});
  return hostsAt(w,d.name,i.name).length>0||!!i.forceUp}
function duplexOk(a,b){return !(a.speed!=="auto"&&b.speed!=="auto"&&a.speed!==b.speed)}
function lineUp(w,d,i){return physUp(w,d,i)}
function ifState(w,d,i){if(i.shut)return ["administratively down","down"];if(i.err)return ["down","down"];
  const t=ifType(i.name);if(t==="Vlan"&&!i.shut)return vlanActive(w,d,+ifNum(i.name))?["up","up"]:["up","down"];
  return physUp(w,d,i)?["up","up"]:["down","down"]}
function duplexOf(w,d,i){/* auto negotiates full unless the far end is hard-set, in which case it falls back to half */
  if(i.duplex!=="auto")return i.duplex;const pe=peersOf(w,d.name,i.name)[0];if(!pe)return "full";const P=w.devs[pe[0]]?.ifs[pe[1]];return P&&P.duplex!=="auto"?"half":"full"}
Object.assign(IOS,{ifState,physUp,swMode,trunkAllows,listHas,vlanActive,duplexOf});

/* ---------- EtherChannel ---------- */
function ecMember(w,d,i){/* returns P (bundled), I (stand-alone), s (suspended), D (down) */
  if(!i.cg)return null;if(i.shut||i.err)return "D";
  const pe=peersOf(w,d.name,i.name)[0];if(!pe)return hostsAt(w,d.name,i.name).length?"I":"D";
  const P=w.devs[pe[0]]?.ifs[pe[1]];if(!P||P.shut||P.err)return "D";if(!P.cg)return i.cg.mode==="on"?"P":"I";
  const a=i.cg.mode,b=P.cg.mode,ok=(a==="on"&&b==="on")||(["active","passive"].includes(a)&&["active","passive"].includes(b)&&(a==="active"||b==="active"))||(["desirable","auto"].includes(a)&&["desirable","auto"].includes(b)&&(a==="desirable"||b==="desirable"));
  if(!ok)return "I";
  /* members must match the port-channel's switchport settings */
  const po=d.ifs["Port-channel"+i.cg.n];if(po&&(swMode(po)!==swMode(i)||(swMode(i)==="access"&&po.sw.access!==i.sw.access)||String(po.sw.allowed)!==String(i.sw.allowed)))return "s";
  return "P"}
const ecProto=m=>["active","passive"].includes(m)?"LACP":["desirable","auto"].includes(m)?"PAgP":"-";
Object.assign(IOS,{ecMember,ecProto});

/* ---------- addressing helpers ---------- */
function v6Addrs(d,i){/* [{n,len,ll}] including the link-local */
  const out=[];if(!(i.v6.length||i.v6en||i.v6auto))return out;
  const ll=i.v6.find(a=>a.ll);out.push({n:ll?ll.n:(0xfe80n<<112n)|eui64(i.mac),len:64,ll:true});
  i.v6.filter(a=>!a.ll).forEach(a=>out.push({n:a.eui?(pfx(a.n,64,6)|eui64(i.mac)):a.n,len:a.len,eui:a.eui}));return out}
function l3Ifs(w,d,f,vrf){/* up interfaces with an address of family f in one VRF (null = global): [{i,n,len}] */
  vrf=vrf||null;const out=[];Object.values(d.ifs).forEach(i=>{if(!i.l3||(i.vrf||null)!==vrf||!lineUp(w,d,i))return;
    if(f===6)v6Addrs(d,i).filter(a=>!a.ll).forEach(a=>out.push({i,n:a.n,len:a.len}));
    else{const a=ifAddr(w,d,i);if(a)out.push({i,n:a.n,len:a.len});i.sec.forEach(s=>out.push({i,n:s.n,len:s.len}))}});return out}
function ifAddr(w,d,i){if(i.ip!==null)return {n:i.ip,len:i.len};if(i.dhcp){const L=dhcpLease(w,d,i);if(L)return L}return null}
Object.assign(IOS,{v6Addrs,l3Ifs,ifAddr});

/* ---------- OSPF ---------- */
function ospfIfArea(d,i,v6){
  if(i.vrf)return null;
  if(v6){if(!i.ospf6||!d.v6Routing)return null;return {pid:i.ospf6.pid,area:i.ospf6.area}}
  if(i.ip===null)return null;
  if(i.ospf.area!==undefined)return {pid:i.ospf.pid,area:i.ospf.area};
  if(!d.ospf)return null;
  for(const nt of d.ospf.nets){const wl=nt.wild;if(((i.ip|wl)===(nt.net|wl)))return {pid:d.ospf.pid,area:nt.area}}
  return null}
function ospfProc(d,v6){return v6?d.ospf6:d.ospf}
function ospfRid(w,d,v6){const p=ospfProc(d,v6);if(!p)return null;if(p.activeRid!=null)return p.activeRid;
  let r=p.rid;if(r==null){const lo=Object.values(d.ifs).filter(i=>ifType(i.name)==="Loopback"&&!i.shut&&i.ip!==null).map(i=>i.ip);
    const all=Object.values(d.ifs).filter(i=>i.ip!==null&&lineUp(w,d,i)).map(i=>i.ip);const c=lo.length?lo:all;if(c.length)r=c.reduce((a,b)=>a>b?a:b)}
  if(r!=null)p.activeRid=r;return r}
function ospfIfCfg(w,d,i,v6){
  const a=ospfIfArea(d,i,v6);if(!a)return null;const p=ospfProc(d,v6);
  const t=ifType(i.name),lo=t==="Loopback";
  const net=i.ospf.net||(lo?"loopback":t==="Serial"?"point-to-point":"broadcast");
  const hello=i.ospf.hello||(net==="non-broadcast"?30:10),dead=i.ospf.dead||hello*4;
  const ref=(p&&p.refBw)||100,bw=i.bw||(t==="GigabitEthernet"?1e6:t==="TenGigabitEthernet"?1e7:t==="FastEthernet"?1e5:t==="Serial"?1544:t==="Loopback"?8e6:1e6);
  const cost=i.ospf.cost||Math.max(1,Math.floor(ref*1000/bw));
  const passive=p?(p.passiveDefault?!p.nonPassive.includes(i.name):p.passive.includes(i.name)):false;
  return {area:a.area,pid:a.pid,net,hello,dead,cost,passive,pri:i.ospf.pri??1,stub:!!(p&&p.stubs&&p.stubs[a.area]),auth:i.ospf.auth||(p&&p.areaAuth&&p.areaAuth[a.area])||null,key:i.ospf.key||null,mtu:i.mtu||1500,mtuIgn:!!i.ospf.mtuIgn}}
/* All adjacencies in the world for one family: [{a:[dev,if],b:[dev,if],state}] */
function ospfAdj(w,v6){
  const out=[];
  w.segs.concat(IOS.tunSegs?IOS.tunSegs(w):[]).forEach(seg=>{
    const mem=seg.map(([dv,ifn])=>{const d=w.devs[dv];if(!d)return null;let i=d.ifs[ifn];if(!i)return null;
      /* sub-interfaces and SVIs ride on top: collect any L3 interface on this segment */
      return {d,i}}).filter(Boolean);
    /* expand to logical interfaces: for each member include sub-interfaces with an encapsulation */
    const L=[];mem.forEach(({d,i})=>{L.push({d,i});Object.values(d.ifs).filter(s=>s.name.startsWith(i.name+".")).forEach(s=>L.push({d,i:s,vlan:s.encap}))});
    for(let x=0;x<L.length;x++)for(let y=x+1;y<L.length;y++){const A=L[x],Bm=L[y];if(A.d===Bm.d)continue;if((A.vlan||null)!==(Bm.vlan||null))continue;
      const r=adjPair(w,A.d,A.i,Bm.d,Bm.i,v6);if(r)out.push(r)}
  });
  /* DR/BDR per segment (broadcast) */
  return out}
function sameSubnet(A,Bb,v6){if(v6)return true;if(A.ip===null||Bb.ip===null)return false;return A.len===Bb.len&&inNet(A.ip,Bb.ip,A.len,4)}
function adjPair(w,dA,iA,dB,iB,v6){
  const cA=ospfIfCfg(w,dA,iA,v6),cB=ospfIfCfg(w,dB,iB,v6);if(!cA||!cB)return null;
  if(!lineUp(w,dA,iA)||!lineUp(w,dB,iB))return null;if(cA.passive||cB.passive)return null;
  const rA=ospfRid(w,dA,v6),rB=ospfRid(w,dB,v6);
  let why=null;
  if(!sameSubnet(iA,iB,v6))why="subnet";else if(cA.area!==cB.area)why="area";else if(cA.hello!==cB.hello||cA.dead!==cB.dead)why="timers";
  else if(rA==null||rB==null)why="rid";else if(rA===rB)why="duprid";else if(cA.stub!==cB.stub)why="stub";
  else if((cA.auth||null)!==(cB.auth||null)||(cA.auth&&cA.key!==cB.key))why="auth";else if(cA.mtu!==cB.mtu&&!cA.mtuIgn&&!cB.mtuIgn)why="mtu";
  if(why)return {a:[dA.name,iA.name],b:[dB.name,iB.name],state:why==="mtu"?"EXSTART":"DOWN",why};
  const bcast=cA.net==="broadcast"&&cB.net==="broadcast";
  let state="FULL";if(bcast&&cA.pri===0&&cB.pri===0)state="2WAY";
  return {a:[dA.name,iA.name],b:[dB.name,iB.name],state,bcast,mismatch:cA.net!==cB.net,ridA:rA,ridB:rB}}
function drOf(w,adjs,d,i,v6){/* returns {dr:[dev,if]|null, bdr} for a broadcast interface */
  const c=ospfIfCfg(w,d,i,v6);if(!c||c.net!=="broadcast")return null;
  const mem=[[d.name,i.name]];adjs.filter(a=>a.state!=="DOWN"&&((a.a[0]===d.name&&a.a[1]===i.name)||(a.b[0]===d.name&&a.b[1]===i.name))).forEach(a=>mem.push(a.a[0]===d.name&&a.a[1]===i.name?a.b:a.a));
  const info=mem.map(([dv,ifn])=>{const D=w.devs[dv],I=D.ifs[ifn];return {k:[dv,ifn],pri:ospfIfCfg(w,D,I,v6).pri,rid:ospfRid(w,D,v6)||0n}}).filter(x=>x.pri>0);
  info.sort((a,b)=>b.pri-a.pri||(b.rid>a.rid?1:b.rid<a.rid?-1:0));
  return {dr:info[0]?.k||null,bdr:info[1]?.k||null}}
function ospfRoles(w,adjs,d,i,v6){const r=drOf(w,adjs,d,i,v6);if(!r)return null;const is=k=>k&&k[0]===d.name&&k[1]===i.name;return is(r.dr)?"DR":is(r.bdr)?"BDR":"DROTHER"}
/* shortest paths from one router: {dist:Map, first:Map(dev -> [{nh,oif}])} */
function spf(w,d,v6){return IOS.memo(w,"spf|"+d.name+"|"+(v6?6:4)+"|"+IOS.G.tun+IOS.G.trk,()=>{
  const adjs=ospfAdj(w,v6).filter(a=>a.state==="FULL"&&!a.mismatch);
  const dist=new Map(),first=new Map();dist.set(d.name,0);first.set(d.name,[]);
  const Q=[d.name];const done=new Set();
  while(Q.length){Q.sort((a,b)=>dist.get(a)-dist.get(b));const u=Q.shift();if(done.has(u))continue;done.add(u);const U=w.devs[u];
    adjs.forEach(a=>{let me,them;if(a.a[0]===u){me=a.a;them=a.b}else if(a.b[0]===u){me=a.b;them=a.a}else return;
      const c=ospfIfCfg(w,U,U.ifs[me[1]],v6).cost,nd=dist.get(u)+c,v=them[0];
      const T=w.devs[v],ti=T.ifs[them[1]];
      const nhAddr=v6?v6Addrs(T,ti).find(x=>x.ll)?.n:ti.ip;
      const fh=u===d.name?[{nh:nhAddr,oif:me[1]}]:first.get(u);
      if(!dist.has(v)||nd<dist.get(v)){dist.set(v,nd);first.set(v,fh.slice());Q.push(v)}
      else if(nd===dist.get(v)){const cur=first.get(v);fh.forEach(h=>{if(!cur.some(x=>x.oif===h.oif&&x.nh===h.nh))cur.push(h)})}})}
  return {dist,first}})}
/* the areas a router has live OSPF interfaces in */
function ospfAreas(w,d,v6){const A=new Set();Object.values(d.ifs).forEach(i=>{const c=ospfIfCfg(w,d,i,v6);if(c&&lineUp(w,d,i))A.add(String(c.area))});return A}
const isAbr=(w,d,v6)=>{const A=ospfAreas(w,d,v6);return A.has("0")&&A.size>1};
/* OSPF routes for device d: [{n,len,metric,via:[{nh,oif}],code}] with intra-area, inter-area, summaries, stub areas and externals */
function ospfRoutes(w,d,v6){return IOS.memo(w,"ospfr|"+d.name+"|"+(v6?6:4)+"|"+IOS.G.tun+IOS.G.trk,()=>{
  const f=v6?6:4;const P=ospfProc(d,v6);if(!P)return [];
  const {dist,first}=spf(w,d,v6);
  const myAreas=ospfAreas(w,d,v6);
  const R=Object.values(w.devs).filter(x=>ospfProc(x,v6));
  const best=new Map();
  const add=(k,o)=>{const cur=best.get(k);const rank=c=>c==="O"?0:c==="O IA"?1:2;
    if(!cur||rank(o.code)<rank(cur.code)||(rank(o.code)===rank(cur.code)&&o.metric<cur.metric))best.set(k,o);
    else if(cur.code===o.code&&o.metric===cur.metric)o.via.forEach(h=>{if(!cur.via.some(x=>x.oif===h.oif&&x.nh===h.nh))cur.via.push(h)})};
  /* summaries configured on ABRs: {abr, area, n, len, adv} */
  const ranges=[];R.forEach(T=>{const p=ospfProc(T,v6);if(!p.ranges||!isAbr(w,T,v6))return;Object.entries(p.ranges).forEach(([ar,L])=>L.forEach(r=>ranges.push({abr:T,area:String(ar),n:r.n,len:r.len,adv:!r.noAdv})))});
  const sums=new Map();
  R.forEach(T=>{if(T===d||!dist.has(T.name))return;
    Object.values(T.ifs).forEach(i=>{const c=ospfIfCfg(w,T,i,v6);if(!c||!lineUp(w,T,i))return;const ar=String(c.area);
      const addrs=v6?v6Addrs(T,i).filter(a=>!a.ll).map(a=>({n:c.net==="loopback"?a.n:pfx(a.n,a.len,6),len:c.net==="loopback"?128:a.len})):(i.ip!==null?[{n:c.net==="loopback"?i.ip:pfx(i.ip,i.len,4),len:c.net==="loopback"?32:i.len}]:[]);
      addrs.forEach(a=>{const m=dist.get(T.name)+c.cost;const intra=myAreas.has(ar);
        if(!intra){const rg=ranges.find(r=>r.area===ar&&r.abr!==d&&a.len>=r.len&&inNet(a.n,r.n,r.len,f));
          if(rg){if(!rg.adv)return;const k=rg.n+"/"+rg.len;const fromAbr=spf(w,rg.abr,v6).dist.get(T.name);const mm=(dist.get(rg.abr.name)??999)+((fromAbr??0)+c.cost);
            const s0=sums.get(k);if(!s0||mm>s0.metric)sums.set(k,{n:rg.n,len:rg.len,metric:mm,via:(first.get(rg.abr.name)||[]).slice(),code:"O IA"});return}}
        add(a.n+"/"+a.len,{n:a.n,len:a.len,metric:m,via:first.get(T.name).slice(),code:intra?"O":"O IA"})})});
    /* externals: a default route and redistributed routes from an ASBR */
    const p=ospfProc(T,v6);
    if(p.defOrig&&(p.defAlways||(v6?T.routes6:T.routes).some(r=>r.len===0&&staticOk(w,T,r,f))))add("0/0",{n:0n,len:0,metric:p.defMetric||1,e2:true,code:"O E2",via:first.get(T.name).slice()});
    if(p.redist&&!v6){if(p.redist.static)T.routes.forEach(r=>{if(r.len&&!r.vrf&&staticOk(w,T,r,4))add(pfx(r.n,r.len,4)+"/"+r.len,{n:pfx(r.n,r.len,4),len:r.len,metric:20,e2:true,code:"O E2",via:first.get(T.name).slice()})});
      if(p.redist.connected)l3Ifs(w,T,4).forEach(c=>{if(ospfIfCfg(w,T,c.i,false))return;const n=pfx(c.n,c.len,4);add(n+"/"+c.len,{n,len:c.len,metric:20,e2:true,code:"O E2",via:first.get(T.name).slice()})})}});
  sums.forEach((v,k)=>add(k,v));
  /* the ABR itself installs a discard route for each summary it advertises */
  ranges.filter(r=>r.abr===d&&r.adv).forEach(r=>{const k=r.n+"/"+r.len;if(!best.has(k))best.set(k,{n:r.n,len:r.len,metric:1,code:"O",via:[{oif:"Null0"}],discard:true})});
  /* stub areas: an internal stub router drops externals (and inter-area routes if totally stubby) and gets a default from the ABR */
  if(myAreas.size&&[...myAreas].every(a=>a!=="0"&&P.stubs&&P.stubs[a])){
    const ar=[...myAreas][0];const abrs=R.filter(T=>T!==d&&dist.has(T.name)&&isAbr(w,T,v6)&&ospfAreas(w,T,v6).has(ar)&&ospfProc(T,v6).stubs?.[ar]);
    const total=abrs.some(T=>ospfProc(T,v6).stubs[ar].nosum);
    [...best.keys()].forEach(k=>{const r=best.get(k);if(r.code==="O E2"||(total&&r.code==="O IA"))best.delete(k)});
    abrs.forEach(T=>add("0/0",{n:0n,len:0,metric:dist.get(T.name)+1,code:"O IA",via:first.get(T.name).slice()}))}
  let out=[...best.values()];
  /* inbound distribute-list: filters what this router installs, not what it floods */
  if(!v6&&P.dlist&&IOS.filterPass)out=out.filter(r=>r.discard||IOS.filterPass(d,P.dlist,r.n,r.len));
  return out})}
Object.assign(IOS,{ospfAdj,ospfIfCfg,ospfRid,ospfRoles,drOf,ospfRoutes,ospfIfArea,spf,ospfAreas,isAbr});

/* ---------- routing table ---------- */
function staticOk(w,d,r,f){if(r.track!=null&&IOS.trackUp&&!IOS.trackUp(w,d,r.track))return false;
  if(r.oif){const i=d.ifs[r.oif];if(r.oif==="Null0")return true;if(!i||!lineUp(w,d,i))return false;if(r.nh==null)return true}
  return l3Ifs(w,d,f,r.vrf).some(c=>inNet(r.nh,c.n,c.len,f))||(f===4&&!r.oif&&!r.vrf&&!IOS.G.rec&&recursiveOk(w,d,r))}
/* a static route whose next hop isn't connected is installed if the next hop itself is routable (recursive lookup) */
function recursiveOk(w,d,r){IOS.G.rec=1;try{const t=rib(w,d,4).filter(x=>x.static!==r&&!x.local&&inNet(r.nh,x.n,x.len,4));return t.length>0}finally{IOS.G.rec=0}}
function rib(w,d,f,vrf){f=f||4;vrf=vrf||null;return IOS.memo(w,["rib",d.name,f,vrf||"",IOS.G.tun,IOS.G.bgp,IOS.G.trk,IOS.G.rec||0].join("|"),()=>{
  const all=[];
  l3Ifs(w,d,f,vrf).forEach(c=>{all.push({code:"C",n:pfx(c.n,c.len,f),len:c.len,ad:0,metric:0,via:[{oif:c.i.name}]});if(c.len<bits(f))all.push({code:"L",n:c.n,len:bits(f),ad:0,metric:0,via:[{oif:c.i.name}],local:true})});
  if(f===6)Object.values(d.ifs).forEach(i=>{if(i.l3&&!i.vrf&&lineUp(w,d,i)){const ll=v6Addrs(d,i).find(a=>a.ll);if(ll)all.push({code:"L",n:ll.n,len:128,ad:0,metric:0,via:[{oif:i.name}],local:true,ll:true})}});
  const routing=f===6?d.v6Routing:d.ipRouting;
  if(routing){(f===6?d.routes6:d.routes).forEach(r=>{if((r.vrf||null)===vrf&&staticOk(w,d,r,f))all.push({code:"S",n:pfx(r.n,r.len,f),len:r.len,ad:r.ad,metric:0,via:[{nh:r.nh,oif:r.oif}],static:r})});
    if(!vrf){ospfRoutes(w,d,f===6).forEach(o=>all.push({code:o.code||(o.e2?"O E2":"O"),n:o.n,len:o.len,ad:o.discard?110:(d.ospf&&d.ospf.ad)||110,metric:o.metric,via:o.via,discard:o.discard}));
      if(f===4&&!IOS.G.bgp&&IOS.bgpRib)IOS.bgpRib(w,d).forEach(b=>all.push(b))}}
  const best=new Map();
  all.forEach(r=>{const k=r.n+"/"+r.len+(r.local?"L":"");const c=best.get(k);if(!c||r.ad<c.ad||(r.ad===c.ad&&r.metric<c.metric))best.set(k,r);else if(c&&r.ad===c.ad&&r.metric===c.metric&&r.code===c.code&&r!==c&&r.code!=="C")r.via.forEach(v=>{if(!c.via.some(x=>x.nh===v.nh&&x.oif===v.oif))c.via.push(v)})});
  return [...best.values()]})}
function lookup(w,d,n,f,vrf){const t=rib(w,d,f,vrf).filter(r=>!r.ll&&inNet(n,r.n,r.len,f));t.sort((a,b)=>b.len-a.len||a.ad-b.ad);
  if(!t.length&&f!==6&&!vrf&&!d.ipRouting&&d.defGw!==null)return {code:"gw",n:0n,len:0,via:[{nh:d.defGw}]};return t[0]||null}
function resolve(w,d,r,f,vrf,depth){/* -> {oif,nh} with the exit interface filled in (recursive for BGP and static next hops) */
  const v=r.via[0];if(v.oif&&!v.nh)return {oif:v.oif,nh:null};
  if(v.oif)return {oif:v.oif,nh:v.nh};
  const c=l3Ifs(w,d,f,vrf).find(x=>inNet(v.nh,x.n,x.len,f));if(c)return {oif:c.i.name,nh:v.nh};
  if((depth||0)<3){const r2=lookup(w,d,v.nh,f,vrf);if(r2&&r2!==r){const x=resolve(w,d,r2,f,vrf,(depth||0)+1);if(x)return {oif:x.oif,nh:x.nh??v.nh}}}
  return null}
Object.assign(IOS,{rib,lookup,staticOk,resolve,l3Ifs,lineUp});

/* ---------- ACLs ---------- */
const PORTS={bgp:179,ssh:22,https:443,www:80,http:80,telnet:23,ftp:21,"ftp-data":20,smtp:25,domain:53,pop3:110,bootps:67,bootpc:68,tftp:69,snmp:161,ntp:123,syslog:514,22:22,443:443};
function aclMatchAddr(spec,n){if(!spec||spec.any)return true;return (n|spec.wc)===(spec.n|spec.wc)}
function aclEval(acl,p){/* p={src,dst,proto,port} -> {act,seq} */
  if(!acl)return {act:"permit",seq:null,none:true};
  for(const e of acl.entries){if(e.remark)continue;
    if(acl.type==="standard"){if(aclMatchAddr(e.src,p.src))return {act:e.act,seq:e.seq,e}}
    else{const pr=e.proto;if(pr!=="ip"&&pr!==p.proto)continue;if(!aclMatchAddr(e.src,p.src)||!aclMatchAddr(e.dst,p.dst))continue;
      if(e.dport!=null&&e.dport!==p.port)continue;return {act:e.act,seq:e.seq,e}}}
  return {act:"deny",seq:null,implicit:true}}
function parseAddrSpec(tk,k,ext){/* returns [spec,consumed] */
  const t=(tk[k]||"").toLowerCase();if(t==="any")return [{any:true},1];
  if(t==="host"){const n=ip4(tk[k+1]);return n===null?[null,0]:[{n,wc:0n,host:true},2]}
  const n=ip4(tk[k]);if(n===null)return [null,0];const wc=ip4(tk[k+1]||"");
  if(wc!==null){if(!isWild(tk[k+1]))return [null,0];return wc===0n?[{n,wc:0n,host:true},2]:[{n:n&~wc,wc},2]}
  if(ext)return [null,0];return [{n,wc:0n,host:true},1]}
function isWild(s){const n=ip4(s);if(n===null)return false;const b=n.toString(2).padStart(32,"0");return /^0*1*$/.test(b)}
function parseAce(type,tk){/* tokens after permit/deny */
  if(type==="standard"){const [s,c]=parseAddrSpec(tk,0);if(!s||c!==tk.length&&tk[c]!=="log")return null;return {src:s}}
  const proto=(tk[0]||"").toLowerCase();if(!["ip","tcp","udp","icmp","ospf","gre","esp","ahp","pim","eigrp"].includes(proto))return null;
  let k=1;const [s,c1]=parseAddrSpec(tk,k,true);if(!s)return null;k+=c1;
  let sport=null;if(tk[k]==="eq"){sport=portNum(tk[k+1]);if(sport==null)return null;k+=2}
  const [dd,c2]=parseAddrSpec(tk,k,true);if(!dd)return null;k+=c2;
  let dport=null,est=false;
  while(k<tk.length){const t=tk[k].toLowerCase();if(t==="eq"&&(proto==="tcp"||proto==="udp")){dport=portNum(tk[k+1]);if(dport==null)return null;k+=2}else if(t==="established"){est=true;k++}else if(t==="log"||t==="echo"||t==="echo-reply"){k++}else return null}
  return {proto,src:s,dst:dd,sport,dport,est}}
function portNum(s){if(s==null)return null;if(/^\d+$/.test(s))return +s;return PORTS[s.toLowerCase()]??null}
function aceText(acl,e){if(e.remark)return "remark "+e.remark;
  const a=s=>s.any?"any":s.host?"host "+ip4s(s.n):ip4s(s.n)+" "+ip4s(s.wc);
  const pn=n=>{const k=Object.entries(PORTS).find(([k2,v])=>v===n&&isNaN(k2)&&k2!=="http");return k?k[0]:String(n)};
  if(acl.type==="standard")return `${e.act} ${e.src.any?"any":e.src.host?ip4s(e.src.n):ip4s(e.src.n)+", wildcard bits "+ip4s(e.src.wc)}`;
  return `${e.act} ${e.proto} ${a(e.src)}${e.sport!=null?" eq "+pn(e.sport):""} ${a(e.dst)}${e.dport!=null?" eq "+pn(e.dport):""}${e.est?" established":""}`}
function aceCfg(acl,e){if(e.remark)return "remark "+e.remark;
  const a=s=>s.any?"any":s.host?"host "+ip4s(s.n):ip4s(s.n)+" "+ip4s(s.wc);
  const pn=n=>{const k=Object.entries(PORTS).find(([k2,v])=>v===n&&isNaN(k2)&&k2!=="http");return k?k[0]:String(n)};
  if(acl.type==="standard")return `${e.act} ${e.src.any?"any":e.src.host?ip4s(e.src.n):ip4s(e.src.n)+" "+ip4s(e.src.wc)}`;
  return `${e.act} ${e.proto} ${a(e.src)}${e.sport!=null?" eq "+pn(e.sport):""} ${a(e.dst)}${e.dport!=null?" eq "+pn(e.dport):""}${e.est?" established":""}`}
Object.assign(IOS,{aclEval,parseAce,aceText,aceCfg,portNum,isWild});

/* ---------- DHCP ---------- */
function poolFor(d,n){return Object.entries(d.pools).find(([k,p])=>p.net!=null&&inNet(n,p.net,p.len,4))}
function dhcpLease(w,dv,i){/* a router interface set to "ip address dhcp" gets an address from a pool on a peer device */
  const pe=peersOf(w,dv.name,i.name);for(const [pd,pi] of pe){const P=w.devs[pd],PI=P?.ifs[pi];if(!PI||PI.ip===null||!lineUp(w,P,PI))continue;const pool=poolFor(P,PI.ip);if(pool)return {n:allocate(w,P,pool[1],PI.ip,"if:"+dv.name+i.name),len:pool[1].len,gw:pool[1].gw}}
  if(i.dhcpFixed)return i.dhcpFixed;return null}
function allocate(w,srv,pool,giaddr,key){pool.binds=pool.binds||{};if(pool.binds[key])return pool.binds[key];
  const used=new Set(Object.values(pool.binds).map(String));const ex=n=>srv.excl.some(([a,b])=>n>=a&&n<=(b??a));
  const size=1n<<B(32-pool.len);for(let k=1n;k<size-1n;k++){const n=pool.net+k;if(n===giaddr||ex(n)||used.has(String(n)))continue;
    if(Object.values(w.devs).some(d=>Object.values(d.ifs).some(x=>x.ip===n)))continue;pool.binds[key]=n;return n}return null}
/* Where does a DHCP host's request end up? Returns {srv,pool,gi,lease} or {fail:reason} */
function dhcpFor(w,h){const gwIf=hostGwIf(w,h);if(!gwIf)return {fail:"No router interface in the host's VLAN"};
  const {d,i}=gwIf;if(i.ip===null)return {fail:`${d.host} ${ifShort(i.name)} has no IP address`};if(!lineUp(w,d,i))return {fail:`${d.host} ${ifShort(i.name)} is down`};
  if(!snoopAllows(w,h))return {fail:"DHCP snooping dropped the exchange"};
  let p=poolFor(d,i.ip);if(p)return lease(w,d,p[1],i.ip,h);
  for(const hp of i.helper){const tgt=deviceWithIp(w,hp);if(!tgt)continue;const r=forward(w,d,hp,4,{src:i.ip});if(!r.ok)return {fail:`Relay to ${ip4s(hp)} failed: ${r.why}`};
    p=poolFor(tgt.d,i.ip);if(p)return lease(w,tgt.d,p[1],i.ip,h);return {fail:`${tgt.d.host} has no pool for ${ip4s(pfx(i.ip,i.len,4))}/${i.len}`}}
  return {fail:i.helper.length?"Helper address unreachable":"No DHCP server on this subnet and no ip helper-address"}}
function lease(w,srv,pool,gi,h){const n=allocate(w,srv,pool,gi,h.mac);if(n==null)return {fail:"Pool exhausted"};return {srv,pool,gi,ip:n,len:pool.len,gwa:pool.gw,dns:pool.dns}}
function deviceWithIp(w,n){for(const d of Object.values(w.devs))for(const i of Object.values(d.ifs))if(i.ip===n)return {d,i};return null}
function snoopAllows(w,h){if(!h.at)return true;const [sv,sp]=h.at.split(":");const S=w.devs[sv];if(!S||!S.snoop.on)return true;
  const v=h.vlan||S.ifs[sp]?.sw.access||1;if(!S.snoop.vlans.some(x=>listHas(x,v)))return true;
  /* the reply must come in on a trusted port: the uplink toward the router */
  const up=Object.values(S.ifs).filter(i=>peersOf(w,S.name,i.name).length&&swMode(i)==="trunk"||(peersOf(w,S.name,i.name).some(([pd])=>w.devs[pd]?.kind==="router")));
  return up.some(i=>i.snoopTrust||(i.cg&&S.ifs["Port-channel"+i.cg.n]?.snoopTrust))}
/* the L3 interface acting as a host's gateway: either the device it is cabled to, or reached through a switch by VLAN */
function hostGwIf(w,h){if(!h.at)return null;const [dv,ifn]=h.at.split(":");const D=w.devs[dv];if(!D)return null;const I=D.ifs[ifn];if(!I)return null;
  if(D.kind==="router"||I.l3)return {d:D,i:I};
  if(!physUp(w,D,I))return null;if(swMode(I)==="trunk")return null;const v=h.vlan||I.sw.access;if(!D.vlans[v])return null;
  return l2Gw(w,D,v,new Set([D.name]))}
function l2Gw(w,S,v,seen){
  const svi=S.ifs["Vlan"+v];if(svi&&S.ipRouting&&svi.ip!==null&&lineUp(w,S,svi))return {d:S,i:svi};
  for(const i of Object.values(S.ifs)){if(i.l3||!physUp(w,S,i))continue;
    const carries=swMode(i)==="trunk"?trunkAllows(i,v):i.sw.access===v;if(!carries)continue;
    for(const [pd,pi] of peersOf(w,S.name,i.name)){if(seen.has(pd))continue;const P=w.devs[pd],PI=P?.ifs[pi];if(!PI)continue;
      if(P.kind==="router"){if(swMode(i)==="trunk"){const sub=Object.values(P.ifs).find(s=>s.name.startsWith(pi+".")&&s.encap===v&&lineUp(w,P,s));if(sub)return {d:P,i:sub};if(v===i.sw.native&&PI.ip!==null)return {d:P,i:PI}}else if(PI.ip!==null)return {d:P,i:PI};continue}
      if(PI.l3)continue;const pc=swMode(PI)==="trunk"?trunkAllows(PI,v)&&swMode(i)==="trunk":PI.sw.access===v&&swMode(i)!=="trunk";if(!pc||!P.vlans[v])continue;
      seen.add(pd);const r=l2Gw(w,P,v,seen);if(r)return r}}
  return null}
Object.assign(IOS,{dhcpFor,hostGwIf,deviceWithIp,poolFor});

/* ---------- forwarding and ping ---------- */
function ownIp(w,d,n,f,vrf){return l3Ifs(w,d,f,vrf).some(c=>c.n===n)||(f===6&&!vrf&&Object.values(d.ifs).some(i=>v6Addrs(d,i).some(a=>a.n===n)&&lineUp(w,d,i)))}
function hostIp(h,w){if(h.dhcp){const L=dhcpFor(w,h);return L.ip??null}return h.ip}
/* forward a packet from device d toward n. o={src,proto,port,iif,ttl}. Returns {ok,why,hops,acl} */
function forward(w,d,n,f,o){o=o||{};const hops=[];let cur=d,iif=o.iif||null,ttl=o.ttl||16;const proto=o.proto||"icmp";
  let vrf=o.vrf||(iif&&d.ifs[iif]?d.ifs[iif].vrf:null)||null;
  while(ttl-->0){if(iif&&cur.ifs[iif])vrf=cur.ifs[iif].vrf||null;
    if(iif&&f===4){const I=cur.ifs[iif];if(I&&I.acl.in){const r=aclEval(cur.acls[I.acl.in],{src:o.src,dst:n,proto,port:o.port});if(r.act==="deny")return {ok:false,why:`denied by ACL ${I.acl.in} in on ${cur.host} ${ifShort(iif)}`,hops,acl:true,at:cur}}}
    if(ownIp(w,cur,n,f,vrf))return {ok:true,dev:cur,hops,vrf};
    let rs=null;
    /* policy-based routing on the ingress interface wins over the routing table */
    if(f===4&&iif&&cur.ifs[iif]&&cur.ifs[iif].policy&&IOS.pbrNext){rs=IOS.pbrNext(w,cur,cur.ifs[iif],{src:o.src,dst:n,proto,port:o.port});if(rs)hops.pbr=(hops.pbr||[]).concat(cur.host)}
    if(!rs){const r=lookup(w,cur,n,f,vrf);if(!r)return {ok:false,why:`${cur.host} has no route to ${addrS(n,f)}${vrf?" in VRF "+vrf:""}`,hops,noroute:true,at:cur};
      rs=resolve(w,cur,r,f,vrf);if(!rs)return {ok:false,why:`${cur.host} can't resolve the next hop`,hops,at:cur}}
    if(rs.oif==="Null0")return {ok:false,why:`${cur.host} routed the packet to Null0 (a summary discard route)`,hops,null0:true,at:cur};
    const oif=cur.ifs[rs.oif];if(!oif)return {ok:false,why:`${cur.host} has no interface ${rs.oif}`,hops,at:cur};if(f===4&&oif.acl.out){const a=aclEval(cur.acls[oif.acl.out],{src:o.src,dst:n,proto,port:o.port});if(a.act==="deny")return {ok:false,why:`denied by ACL ${oif.acl.out} out on ${cur.host} ${ifShort(rs.oif)}`,hops,acl:true,at:cur}}
    const nh=rs.nh??n;hops.push({dev:cur.host,nh,oif:rs.oif});
    /* who owns the next hop? a device on the same segment, or a host */
    const nd=neighborWith(w,cur,rs.oif,nh,f);
    if(nd){if(nd.host){if(nh===n)return {ok:true,host:nd.host,hops};return {ok:false,why:"host does not route",hops}}cur=nd.d;iif=nd.i;continue}
    return {ok:false,why:nh===n?`${addrS(n,f)} did not answer`:`next hop ${addrS(nh,f)} did not answer`,hops,at:cur,arp:true}}
  return {ok:false,why:"TTL expired (routing loop)",hops,loop:true}}
function neighborWith(w,d,oifName,nh,f){
  const oif=d.ifs[oifName];
  /* physical segment of this interface (sub-interfaces use the parent) */
  const phys=oifName.split(".")[0];const vlan=oif.encap||null;
  for(const [pd,pi] of peersOf(w,d.name,phys)){const P=w.devs[pd];if(!P)continue;
    const cands=Object.values(P.ifs).filter(x=>x.name===pi||x.name.startsWith(pi+"."));
    for(const c of cands){if((c.encap||null)!==vlan&&P.kind==="router")continue;if(!lineUp(w,P,c))continue;
      const has=f===6?v6Addrs(P,c).some(a=>a.n===nh):(c.ip===nh||ifAddr(w,P,c)?.n===nh);if(has)return {d:P,i:c.name}}
    /* through a switch: find an L3 interface in the same VLAN somewhere behind it */
    if(P.kind!=="router"){const v=vlan||(P.ifs[pi]&&swMode(P.ifs[pi])==="access"?P.ifs[pi].sw.access:1);const hit=l3InVlan(w,P,v,nh,f,new Set([d.name]));if(hit)return hit}}
  /* hosts on this interface (directly, or through a switch in the right VLAN) */
  for(const h of w.hosts){const g=hostGwIf(w,h);if(g&&g.d===d&&g.i.name===oifName&&(f===4?hostIp(h,w)===nh:h.ip6===nh))return {host:h}}
  return null}
function l3InVlan(w,S,v,nh,f,seen){seen.add(S.name);
  const svi=S.ifs["Vlan"+v];if(svi&&lineUp(w,S,svi)&&(f===4?svi.ip===nh:v6Addrs(S,svi).some(a=>a.n===nh)))return {d:S,i:svi.name};
  for(const i of Object.values(S.ifs)){if(i.l3||!physUp(w,S,i))continue;const carries=swMode(i)==="trunk"?trunkAllows(i,v):i.sw.access===v;if(!carries)continue;
    for(const [pd,pi] of peersOf(w,S.name,i.name)){if(seen.has(pd))continue;const P=w.devs[pd];if(!P)continue;
      if(P.kind==="router"){const c=Object.values(P.ifs).find(x=>(x.name===pi&&!x.encap&&swMode(i)!=="trunk"||x.name.startsWith(pi+".")&&x.encap===v)&&lineUp(w,P,x)&&(f===4?x.ip===nh:v6Addrs(P,x).some(a=>a.n===nh)));if(c)return {d:P,i:c.name};continue}
      const r=l3InVlan(w,P,v,nh,f,seen);if(r)return r}}
  return null}
/* a host whose gateway is an HSRP/VRRP virtual IP reaches the active router */
function vipOwner(w,vip,hip,hl){for(const k of ["hsrp","vrrp"]){const G=fhrp(w,k);for(const L of Object.values(G)){const a=L[0]&&L[0].active;if(a&&a.vip===vip&&a.i.ip!==null&&inNet(hip,a.i.ip,a.i.len,4))return {d:a.d,i:a.i}}}return null}
/* end-to-end ping between two addresses from a device (or host), with the return path */
function ping(w,from,n,f,o){f=f||4;o=o||{};
  let d,src;if(from.host){const h=from.host;let g=hostGwIf(w,h);const hip=hostIp(h,w);if(hip==null)return {ok:false,why:`${h.name} has no IP address`};
    const hl=h.len||24;
    if(f===4&&!inNet(n,hip,hl,4)){if(!g)return {ok:false,why:`${h.name} can't reach its default gateway`};let ga=g.i.ip;const gw=h.dhcp?dhcpFor(w,h).gwa:h.gw;
    if(gw!=null&&gw!==ga){const v=vipOwner(w,gw,hip,hl);if(v){g=v;ga=gw}}
    if(gw==null||gw!==ga)return {ok:false,why:`${h.name}'s default gateway ${gw==null?"is not set":ip4s(gw)+" is wrong"}`};d=g.d;src=hip;
      const r=forward(w,d,n,f,{src,iif:g.i.name,proto:o.proto,port:o.port});if(!r.ok)return r;const back=r.dev||d;const rb=r.host?{ok:true}:forward(w,back,hip,f,{src:n,proto:o.proto});return rb.ok?{ok:true,hops:r.hops,dst:r}:{ok:false,why:"no return path: "+rb.why,ret:true}}
    /* same subnet */
    const tgt=w.hosts.find(x=>hostIp(x,w)===n);if(tgt){const g2=hostGwIf(w,tgt);return g&&g2&&g.d===g2.d&&g.i===g2.i?{ok:true}:{ok:false,why:"different VLANs"}}
    if(g&&g.i.ip===n)return {ok:true};return {ok:false,why:"no answer"}}
  d=from.dev;const vrf=o.vrf||null;const r=lookup(w,d,n,f,vrf);if(!r&&!ownIp(w,d,n,f,vrf))return {ok:false,why:"no route",noroute:true};
  if(o.src!=null)src=o.src;else if(ownIp(w,d,n,f,vrf))src=n;else{const rs=resolve(w,d,r,f,vrf);const oif=rs&&d.ifs[rs.oif];src=f===6?(oif?v6Addrs(d,oif).find(a=>!a.ll)?.n:null):(oif?ifAddr(w,d,oif)?.n:null)}
  const fw=forward(w,d,n,f,{src,proto:o.proto,port:o.port,vrf});if(!fw.ok)return fw;if(fw.host||fw.dev===d)return {ok:true,hops:fw.hops};
  const rb=forward(w,fw.dev,src,f,{src:n,proto:o.proto,vrf:fw.vrf});return rb.ok?{ok:true,hops:fw.hops}:{ok:false,why:"no return path: "+rb.why,ret:true}}
Object.assign(IOS,{forward,ping,hostIp});

/* ---------- spanning tree ---------- */
function mstInst(d,v){for(const [k,L] of Object.entries(d.mst.inst))if(L.includes(v))return +k;return 0}
function bid(d,v){const mst=d.stp.mode==="mst";const ix=mst?mstInst(d,v):v;const p=(mst?(d.mstPri[ix]??32768):(d.stp.pri[v]??32768))+ix;return {p,mac:d.macBase+".8000",s:p.toString(16).padStart(4,"0")+d.macBase.replace(/\./g,"")}}
const portCost=i=>/^TenGig/.test(i.name)?2:/^Gigabit/.test(i.name)?4:/^Fast/.test(i.name)?19:/^Port-channel/.test(i.name)?3:4;
function stpLinks(w,v){/* switch-to-switch links that carry VLAN v: [{a:[S,i],b:[S,i]}] (port-channels collapse to Po) */
  const L=[];const seen=new Set();
  w.segs.forEach(seg=>{if(seg.length!==2)return;const [[a,ai],[b,bi]]=seg;const A=w.devs[a],Bd=w.devs[b];if(!A||!Bd||A.kind==="router"||Bd.kind==="router")return;
    let IA=A.ifs[ai],IB=Bd.ifs[bi];if(!IA||!IB||IA.l3||IB.l3||!physUp(w,A,IA))return;
    if(IA.cg&&ecMember(w,A,IA)==="P")IA=A.ifs["Port-channel"+IA.cg.n]||IA;if(IB.cg&&ecMember(w,Bd,IB)==="P")IB=Bd.ifs["Port-channel"+IB.cg.n]||IB;
    const k=[a,IA.name,b,IB.name].join("|");if(seen.has(k))return;seen.add(k);
    const carry=x=>swMode(x)==="trunk"?trunkAllows(x,v):x.sw.access===v;if(!carry(IA)||!carry(IB))return;L.push({a:[A,IA],b:[Bd,IB]})});return L}
function stp(w,v){/* -> {root, info: Map(devName -> {rootCost, rootPort, roles: {ifName: role}})} */
  const S=Object.values(w.devs).filter(d=>d.kind!=="router"&&d.vlans[v]);if(!S.length)return null;
  const links=stpLinks(w,v);const B=new Map(S.map(d=>[d.name,bid(d,v)]));
  const cmp=(x,y)=>x<y?-1:x>y?1:0;
  const root=S.slice().sort((x,y)=>cmp(B.get(x.name).s,B.get(y.name).s))[0];
  const cost=new Map([[root.name,0]]);const rp=new Map();let changed=true,guard=0;
  while(changed&&guard++<50){changed=false;links.forEach(l=>{[[l.a,l.b],[l.b,l.a]].forEach(([me,them])=>{const [M,MI]=me,[T,TI]=them;if(!cost.has(T.name)||M===root)return;
      const c=cost.get(T.name)+portCost(MI);const cur=cost.get(M.name);const cand={c,via:B.get(T.name).s,pid:TI.name,i:MI.name};
      const better=cur===undefined||c<cur||(c===cur&&(cand.via<rp.get(M.name).via||(cand.via===rp.get(M.name).via&&cand.pid<rp.get(M.name).pid)));
      if(better&&!(rp.get(M.name)&&rp.get(M.name).i===MI.name&&c===cur)){cost.set(M.name,c);rp.set(M.name,cand);changed=true}})})}
  const roles=new Map(S.map(d=>[d.name,{}]));
  links.forEach(l=>{const [A,IA]=l.a,[Bd,IB]=l.b;
    if(rp.get(A.name)?.i===IA.name){roles.get(A.name)[IA.name]="Root";roles.get(Bd.name)[IB.name]="Desg";return}
    if(rp.get(Bd.name)?.i===IB.name){roles.get(Bd.name)[IB.name]="Root";roles.get(A.name)[IA.name]="Desg";return}
    const ca=cost.get(A.name)??999,cb=cost.get(Bd.name)??999;const aWins=ca<cb||(ca===cb&&B.get(A.name).s<B.get(Bd.name).s);
    roles.get(A.name)[IA.name]=aWins?"Desg":"Altn";roles.get(Bd.name)[IB.name]=aWins?"Altn":"Desg"});
  /* root guard: a better BPDU arriving on a root-guard port puts it into root-inconsistent */
  links.forEach(l=>[[l.a,l.b]].concat([[l.b,l.a]]).forEach(([me])=>{const [M,MI]=me;if(MI.guard==="root"&&roles.get(M.name)[MI.name]==="Root")roles.get(M.name)[MI.name]="Root-Inc"}));
  return {root,B,cost,rp,roles,links}}
function stpPorts(w,d,v){/* every forwarding-capable port of d in VLAN v with role/state */
  const T=stp(w,v);const out=[];if(!T)return {T,out};
  Object.values(d.ifs).forEach(i=>{if(i.l3||/^(Vlan|Loopback)/.test(i.name))return;if(i.cg&&ecMember(w,d,i)==="P")return;
    if(/^Port-channel/.test(i.name)&&!physUp(w,d,i))return;if(!/^Port-channel/.test(i.name)&&!physUp(w,d,i))return;
    const carry=swMode(i)==="trunk"?trunkAllows(i,v):i.sw.access===v||i.sw.voice===v;if(!carry)return;
    let role=T.roles.get(d.name)[i.name]||"Desg";let st=role==="Altn"?"BLK":"FWD";if(role==="Root-Inc"){role="Desg";st="BKN*"}
    const edge=(i.pf||(d.stp.pfDefault&&swMode(i)==="access"))&&!peersOf(w,d.name,i.name).some(([pd])=>w.devs[pd]?.kind!=="router");
    out.push({i,role,st,cost:portCost(i),edge,rootInc:T.roles.get(d.name)[i.name]==="Root-Inc"})});return {T,out}}
Object.assign(IOS,{stp,stpPorts,bid,portCost,mstInst});

/* ---------- FHRP ---------- */
function fhrp(w,kind){/* groups across devices: key -> [{d,i,g,pri,preempt,state}] with active/standby; remembers the active router so preemption works */
  const G={};Object.values(w.devs).forEach(d=>Object.values(d.ifs).forEach(i=>{const T=kind==="hsrp"?i.hsrp:i.vrrp;Object.entries(T).forEach(([g,c])=>{const k=g+"|"+(i.ip!==null?ip4s(pfx(i.ip,i.len,4)):"?");(G[k]=G[k]||[]).push({d,i,g:+g,c,up:lineUp(w,d,i)&&i.ip!==null})})}));
  const last=w._fhrpLast||(w._fhrpLast={});
  Object.entries(G).forEach(([k,L])=>{const vip=L.find(x=>x.c.ip!=null)?.c.ip;L.forEach(x=>{x.vip=vip;
      const base=kind==="vrrp"&&x.i.ip===vip?255:(x.c.pri??100);const dec=(x.c.track||[]).reduce((s,t)=>s+(IOS.trackUp&&!IOS.trackUp(w,x.d,t.obj)?t.dec:0),0);
      x.cfgPri=base;x.pri=Math.max(0,base-dec);x.preempt=kind==="vrrp"?x.c.preempt!==false:!!x.c.preempt});
    /* only members whose VIP matches and who can hear each other (same segment, up) count */
    const live=L.filter(x=>x.up&&x.vip!=null);live.sort((a,b)=>b.pri-a.pri||(b.i.ip>a.i.ip?1:-1));
    const lk=kind+"|"+k;let act=live[0];const prev=live.find(x=>x.d.name+"|"+x.i.name===last[lk]);
    if(prev&&act&&act!==prev&&!(act.preempt&&act.pri>prev.pri))act=prev;
    if(act)last[lk]=act.d.name+"|"+act.i.name;
    const rest=live.filter(x=>x!==act);
    L.forEach(x=>{x.state=!x.up?"Init":x===act?(kind==="hsrp"?"Active":"Master"):kind==="hsrp"?(x===rest[0]?"Standby":"Listen"):"Backup";x.active=act;x.standby=kind==="hsrp"?rest[0]:null})});
  return G}
Object.assign(IOS,{fhrp});
})();
