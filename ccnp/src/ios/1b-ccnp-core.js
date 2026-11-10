/* ================= Cisco IOS simulator: CCNP features (model) =================
   GRE and IPsec tunnels, VRF-lite, eBGP, route maps and prefix lists, policy-based routing,
   IP SLA and object tracking, NTP, EEM applets and AAA login tests. Loaded after 1-core.js. */
(function(){
const {ip4,ip4s,pfx,inNet,lenMask,ifShort}=IOS;
const memo=IOS.memo,G=IOS.G;

/* ---------- prefix lists and route maps ---------- */
function plMatch(d,name,n,len){const L=d.plists[name];if(!L)return true;
  for(const e of L){if(!inNet(n,e.n,Math.min(e.len,len),4)||len<e.len)continue;
    const lo=e.ge??(e.le!=null?e.len:e.len),hi=e.le??(e.ge!=null?32:e.len);if(len>=lo&&len<=hi)return e.act==="permit"}
  return false}
/* a filter is {pl:name} or {acl:name}; ACLs match the network address like a standard ACL */
function filterPass(d,f,n,len){if(f.pl)return plMatch(d,f.pl,n,len);const A=d.acls[f.acl];if(!A)return true;return IOS.aclEval(A,{src:n,dst:n,proto:"ip"}).act==="permit"}
/* route-map applied to a route or packet. ctx={n,len,pkt}. Returns null (denied) or the set clauses */
function rmapEval(d,name,ctx){const L=d.rmaps[name];if(!L)return null;
  for(const e of [...L].sort((a,b)=>a.seq-b.seq)){let ok=true;
    for(const m of e.match){if(m.t==="pl")ok=ok&&plMatch(d,m.v,ctx.n,ctx.len);
      else if(m.t==="acl"){const A=d.acls[m.v];if(!A){ok=false;continue}ok=ok&&(ctx.pkt?IOS.aclEval(A,ctx.pkt).act==="permit":IOS.aclEval(A,{src:ctx.n,dst:ctx.n,proto:"ip"}).act==="permit")}}
    if(ok)return e.act==="permit"?{set:e.set,seq:e.seq}:null}
  return null}
Object.assign(IOS,{plMatch,filterPass,rmapEval});

/* ---------- policy-based routing ---------- */
IOS.pbrNext=function(w,d,iif,pkt){const L=d.rmaps[iif.policy];if(!L)return null;
  for(const e of [...L].sort((a,b)=>a.seq-b.seq)){const ok=e.match.every(m=>{if(m.t!=="acl")return true;const A=d.acls[m.v];return A&&IOS.aclEval(A,pkt).act==="permit"});
    if(!ok)continue;if(e.act==="deny")return null;
    for(const nh of e.set.nh||[]){const c=IOS.l3Ifs(w,d,4,iif.vrf).find(x=>inNet(nh,x.n,x.len,4));if(c)return {oif:c.i.name,nh}}
    if(e.set.oif&&d.ifs[e.set.oif]&&IOS.lineUp(w,d,d.ifs[e.set.oif]))return {oif:e.set.oif,nh:null};
    return null}
  return null};

/* ---------- tunnels ---------- */
function tunSrc(w,d,i){const t=i.tun;if(!t||t.src==null)return null;
  if(typeof t.src==="string"){const s=d.ifs[t.src];if(!s||s.shut||!IOS.physUp(w,d,s))return null;const a=IOS.ifAddr(w,d,s);return a?a.n:null}return t.src}
/* line protocol: up when the source is up and the router has a route to the destination that doesn't use a tunnel */
function tunLine(w,d,i){if(G.tun)return false;if(i.shut)return false;
  return memo(w,"tl|"+d.name+"|"+i.name,()=>{const t=i.tun;if(!t||t.dst==null||tunSrc(w,d,i)==null)return false;
    G.tun++;try{const r=IOS.lookup(w,d,t.dst,4,null);return !!r}finally{G.tun--}})}
function ipsecWhy(w,A,ia,B,ib){const pa=ia.tun.prot,pb=ib.tun.prot;if(!pa&&!pb)return null;if(!pa||!pb)return "only one end protects the tunnel";
  const PA=A.crypto.prof[pa],PB=B.crypto.prof[pb];if(!PA||!PB)return "an IPsec profile is missing";
  const ts=(D,P)=>D.crypto.ts[P.ts];const ta=ts(A,PA),tb=ts(B,PB);if(!ta||!tb)return "a transform set is missing";if(ta.tf!==tb.tf)return "the transform sets don't match";
  const pol=D=>Object.values(D.crypto.isakmp);const okPol=pol(A).some(p=>pol(B).some(q=>p.enc===q.enc&&p.hash===q.hash&&p.auth===q.auth&&p.group===q.group));if(!okPol)return "no matching ISAKMP policy (phase 1)";
  const sa=tunSrc(w,A,ia),sb=tunSrc(w,B,ib);const ka=A.crypto.keys[String(sb)]??A.crypto.keys["0"],kb=B.crypto.keys[String(sa)]??B.crypto.keys["0"];
  if(ka==null||kb==null)return "a pre-shared key is missing";if(ka!==kb)return "the pre-shared keys don't match";return null}
/* the tunnel at the other end of this one, if traffic can pass: [[dev, if]] */
function tunPeers(w,dv,ifn){return memo(w,"tp|"+dv+"|"+ifn,()=>{const d=w.devs[dv],i=d&&d.ifs[ifn];if(!i||!i.tun||!tunLine(w,d,i))return [];
  const src=tunSrc(w,d,i);
  for(const P of Object.values(w.devs))for(const T of Object.values(P.ifs)){if(T===i||!T.tun||T.tun.dst!==src||tunSrc(w,P,T)!==i.tun.dst)continue;
    if((T.tun.mode||"gre")!==(i.tun.mode||"gre")||!tunLine(w,P,T))continue;if(ipsecWhy(w,d,i,P,T))continue;
    G.tun++;let ok;try{ok=IOS.forward(w,d,i.tun.dst,4,{src,proto:"gre"}).ok}finally{G.tun--}
    if(ok)return [[P.name,T.name]]}
  return []})}
function tunSegs(w){if(G.tun)return [];return memo(w,"tsegs",()=>{const out=[],seen=new Set();
  Object.values(w.devs).forEach(d=>Object.values(d.ifs).forEach(i=>{if(!i.tun)return;const p=tunPeers(w,d.name,i.name)[0];if(!p)return;const k=[d.name+i.name,p[0]+p[1]].sort().join("|");if(seen.has(k))return;seen.add(k);out.push([[d.name,i.name],p])}));return out})}
Object.assign(IOS,{tunLine,tunPeers,tunSegs,tunSrc,ipsecWhy});

/* ---------- object tracking and IP SLA ---------- */
function slaOk(w,d,id){const s=d.slas[id];if(!s||!s.sched||s.dst==null)return false;
  let src;if(s.srcIf){const i=d.ifs[s.srcIf];if(!i||!IOS.lineUp(w,d,i))return false;src=IOS.ifAddr(w,d,i)?.n}
  G.trk++;try{return IOS.ping(w,{dev:d},s.dst,4,{src}).ok}finally{G.trk--}}
function trackUp(w,d,id){const t=d.tracks[id];if(!t)return true;if(G.trk)return true;
  return memo(w,"trk|"+d.name+"|"+id,()=>{let up;if(t.type==="if"){const i=d.ifs[t.if];up=!!i&&IOS.lineUp(w,d,i)&&(t.mode!=="ip routing"||i.ip!==null)}
    else if(t.type==="sla")up=slaOk(w,d,t.sla);else if(t.type==="route"){G.trk++;try{up=IOS.rib(w,d,4).some(r=>r.n===t.n&&r.len===t.len)}finally{G.trk--}}else up=true;
    return t.negate?!up:up})}
Object.assign(IOS,{trackUp,slaOk});

/* ---------- BGP ---------- */
/* sessions this router has configured: [{nip, nb, P, pip, state, why, ebgp}] */
function bgpPeers(w,d){if(!d.bgp)return [];return memo(w,"bgpp|"+d.name+"|"+G.tun+G.trk,()=>{const out=[];
  Object.entries(d.bgp.nbrs).forEach(([k,nb])=>{const nip=BigInt(k);const o={nip,nb,state:"Active",why:"no TCP connection to the neighbor",ebgp:nb.ras!==d.bgp.asn};out.push(o);
    if(nb.shut){o.state="Idle (Admin)";o.why="neighbor shutdown";return}if(nb.ras==null){o.state="Idle";o.why="no remote-as";return}
    const tgt=IOS.deviceWithIp(w,nip);
    G.bgp++;try{
      const conn=IOS.l3Ifs(w,d,4).find(c=>inNet(nip,c.n,c.len,4));
      let mine=null;if(nb.upd){const u=d.ifs[nb.upd];mine=u&&IOS.lineUp(w,d,u)?IOS.ifAddr(w,d,u)?.n:null}else if(conn)mine=conn.n;else{const r=IOS.lookup(w,d,nip,4);const rs=r&&IOS.resolve(w,d,r,4);const oi=rs&&d.ifs[rs.oif];mine=oi?IOS.ifAddr(w,d,oi)?.n:null}
      if(o.ebgp&&!conn&&!nb.multihop){o.why="neighbor is not directly connected (eBGP needs ebgp-multihop)";return}
      if(mine==null||!tgt){return}
      const P=tgt.d;o.P=P;o.pip=mine;
      if(!IOS.ping(w,{dev:d},nip,4,{src:mine,proto:"tcp",port:179}).ok){o.why="TCP port 179 is unreachable";return}
      if(!P.bgp){o.why="the neighbor isn't running BGP";return}
      const back=P.bgp.nbrs[String(mine)];if(!back){o.why=`${P.host} has no neighbor statement for ${ip4s(mine)}`;return}
      if(back.shut){o.state="Idle";o.why="the neighbor shut the session down";return}
      if(back.ras!==d.bgp.asn||nb.ras!==P.bgp.asn){o.state="Idle";o.why=`remote-as mismatch (bad peer AS): ${P.host} is AS ${P.bgp.asn} and expects AS ${back.ras}`;return}
      if((nb.pw||null)!==(back.pw||null)){o.state="Idle";o.why="TCP MD5 authentication failed (password mismatch)";return}
      if(bgpRid(w,d)===bgpRid(w,P)){o.state="Idle";o.why="duplicate BGP router ID";return}
      o.state="Established";o.why=null}finally{G.bgp--}});return out})}
function bgpRid(w,d){if(!d.bgp)return 0n;if(d.bgp.rid!=null)return d.bgp.rid;const lo=Object.values(d.ifs).filter(i=>/^Loopback/.test(i.name)&&!i.shut&&i.ip!==null).map(i=>i.ip);const all=Object.values(d.ifs).filter(i=>i.ip!==null&&IOS.lineUp(w,d,i)).map(i=>i.ip);const c=lo.length?lo:all;return c.length?c.reduce((a,b)=>a>b?a:b):0n}
const ORIG={i:0,e:1,"?":2};
function better(a,b){/* returns true if path a beats b; records why on a */
  if(a.weight!==b.weight)return a.weight>b.weight;if(a.lp!==b.lp)return a.lp>b.lp;
  if((a.src==="local")!==(b.src==="local"))return a.src==="local";
  if(a.path.length!==b.path.length)return a.path.length<b.path.length;if(ORIG[a.origin]!==ORIG[b.origin])return ORIG[a.origin]<ORIG[b.origin];
  if(a.path[0]===b.path[0]&&a.med!==b.med)return a.med<b.med;if(a.ebgp!==b.ebgp)return a.ebgp;
  if(a.rid!==b.rid)return a.rid<b.rid;return a.from<b.from}
/* every router's BGP table: Map(dev -> Map(prefixKey -> [paths])) with .best set */
function bgpTables(w){return memo(w,"bgpt|"+G.tun+G.trk,()=>{const B=Object.values(w.devs).filter(d=>d.bgp);const T=new Map();
  const local=new Map();
  G.bgp++;try{B.forEach(d=>{const L=[];d.bgp.nets.forEach(nt=>{const r=IOS.rib(w,d,4).find(x=>x.n===nt.n&&x.len===nt.len&&!x.local);if(r)L.push({n:nt.n,len:nt.len,nh:0n,path:[],origin:"i",weight:32768,lp:100,med:r.code==="C"?0:r.metric||0,src:"local",ebgp:false,rid:0n,from:0n})});
      if(d.bgp.redistConnected)IOS.l3Ifs(w,d,4).forEach(c=>{const n=pfx(c.n,c.len,4);if(!L.some(p=>p.n===n&&p.len===c.len))L.push({n,len:c.len,nh:0n,path:[],origin:"?",weight:32768,lp:100,med:0,src:"local",ebgp:false,rid:0n,from:0n})});
      local.set(d.name,L)})}finally{G.bgp--}
  const sess=[];B.forEach(d=>bgpPeers(w,d).forEach(p=>{if(p.state==="Established")sess.push({d,p})}));
  let bestOf=new Map();
  const build=()=>{const next=new Map();B.forEach(d=>{const M=new Map();local.get(d.name).forEach(p=>{const k=p.n+"/"+p.len;(M.get(k)||M.set(k,[]).get(k)).push(p)});next.set(d.name,M)});
    sess.forEach(({d,p})=>{/* d receives from P */const P=p.P;const PB=bestOf.get(P.name);if(!PB)return;const back=P.bgp.nbrs[String(p.pip)];
      PB.forEach(bp=>{if(!bp)return;if(!p.ebgp&&bp.src==="ibgp")return;
        if(back.rmOut){const r=rmapEval(P,back.rmOut,{n:bp.n,len:bp.len});if(!r)return;bp={...bp,...applySet(bp,r.set,P,true)}}
        let np={n:bp.n,len:bp.len,origin:bp.origin,src:p.ebgp?"ebgp":"ibgp",ebgp:p.ebgp,rid:bgpRid(w,P),from:p.nip,weight:0,med:bp.med||0,
          path:p.ebgp?[...(bp.prepend||[]),P.bgp.asn,...bp.path]:bp.path.slice(),lp:p.ebgp?100:bp.lp,nh:p.ebgp||bp.nh===0n?p.nip:bp.nh};
        if(p.ebgp&&np.path.includes(d.bgp.asn))return;
        if(p.nb.rmIn){const r=rmapEval(d,p.nb.rmIn,{n:np.n,len:np.len});if(!r)return;np={...np,...applySet(np,r.set,d,false)}}
        if(p.nb.weight!=null&&np.weight===0)np.weight=p.nb.weight;
        const M=next.get(d.name);const k=np.n+"/"+np.len;(M.get(k)||M.set(k,[]).get(k)).push(np)})});
    return next};
  let tables;
  for(let round=0;round<10;round++){tables=build();const nb=new Map();let changed=false;
    tables.forEach((M,dn)=>{const d=w.devs[dn];const L=[];M.forEach(paths=>{let b=null;paths.forEach(p=>{p.valid=p.nh===0n||bgpNhOk(w,d,p.nh);if(p.valid&&(!b||better(p,b)))b=p});paths.forEach(p=>p.best=p===b);if(b)L.push(b)});nb.set(dn,L)});
    const sig=m=>[...m.entries()].map(([k,L])=>k+":"+L.map(p=>p.n+"/"+p.len+">"+p.from+"|"+p.path.join(" ")+"|"+p.lp+"|"+p.weight).join(",")).join(";");
    changed=sig(nb)!==sig(bestOf);bestOf=nb;if(!changed)break}
  T.tables=tables;T.best=bestOf;return T})}
function applySet(p,set,dev,out){const o={};if(!set)return o;if(set.lp!=null)o.lp=set.lp;if(set.weight!=null)o.weight=set.weight;if(set.med!=null)o.med=set.med;
  if(set.prepend)o[out?"prepend":"path"]=out?set.prepend.map(Number):[...set.prepend.map(Number),...p.path];return o}
function bgpNhOk(w,d,nh){G.bgp++;try{return !!IOS.lookup(w,d,nh,4)}finally{G.bgp--}}
function bgpRib(w,d){if(!d.bgp)return [];const T=bgpTables(w);const L=T.best.get(d.name)||[];
  return L.filter(p=>p.src!=="local").map(p=>({code:"B",n:p.n,len:p.len,ad:p.ebgp?(d.bgp.adE||20):(d.bgp.adI||200),metric:p.med||0,via:[{nh:p.nh}],bgp:p}))}
Object.assign(IOS,{bgpPeers,bgpTables,bgpRib,bgpRid});

/* ---------- NTP ---------- */
function ntpState(w,d,depth){depth=depth||0;return memo(w,"ntp|"+d.name+"|"+depth,()=>{const X=d.ntpx;
  if(X.master!=null)return {synced:true,stratum:X.master,peer:"127.127.1.1",ref:".LOCL."};
  if(depth>4)return {synced:false};
  for(const n of d.ntp){const t=IOS.deviceWithIp(w,n);if(!t)continue;if(!IOS.ping(w,{dev:d},n,4,{proto:"udp",port:123}).ok)continue;
    if(X.auth){const kid=X.srvKey[String(n)];if(kid==null||!X.trusted.includes(kid)||X.keys[kid]==null)continue;const tk=t.d.ntpx.keys[kid];if(tk==null||tk!==X.keys[kid])continue}
    const s=ntpState(w,t.d,depth+1);if(s.synced&&s.stratum<15)return {synced:true,stratum:s.stratum+1,peer:ip4s(n),ref:ip4s(n)}}
  return {synced:false,stratum:16}})}
IOS.ntpState=ntpState;

/* ---------- AAA login test (used by lab buttons) ---------- */
/* tries a login on a line: walks the method list like IOS does. Servers live on lab hosts: {aaa:{proto,key,users:{name:pw}}} */
IOS.aaaLogin=function(w,d,line,user,pass){const L=d.lines[line];const steps=[];
  const local=()=>{const u=d.users[user];return u&&(u.secret??u.pw)===pass};
  if(!d.aaa){if(L.local)return {ok:local(),steps:["login local: checked the local user database"]};if(L.login)return {ok:pass===L.pw,steps:["line password"]};return {ok:true,steps:["no login required"]}}
  const listName=L.authList||"default";const methods=(d.aaaLists?.[listName]||(listName==="default"&&d.aaaLogin?d.aaaLogin.split(/\s+/):null));
  if(!methods)return {ok:local(),steps:[`no method list "${listName}": falling back to the local database`]};
  const toks=methods.slice();
  while(toks.length){const m=toks.shift();
    if(m==="local"){const ok=local();steps.push(`local: ${ok?"accepted":"rejected"} by the local user database`);return {ok,steps,method:"local"}}
    if(m==="none"){steps.push("none: no authentication");return {ok:true,steps,method:"none"}}
    if(m==="group"){const g=toks.shift();const proto=g==="tacacs+"?"tacacs":g==="radius"?"radius":(d.aaaGroups?.[g]?.proto);const names=g==="tacacs+"?Object.keys(d.tacacs):g==="radius"?Object.keys(d.radius):(d.aaaGroups?.[g]?.servers||[]);
      for(const nm of names){const S=(proto==="tacacs"?d.tacacs:d.radius)[nm];if(!S||S.addr==null){steps.push(`${nm}: no address configured`);continue}
        const h=w.hosts.find(x=>x.ip===S.addr&&x.aaa);const r=IOS.ping(w,{dev:d},S.addr,4,{proto:proto==="tacacs"?"tcp":"udp",port:proto==="tacacs"?49:1812,src:d.aaaSrc&&d.ifs[d.aaaSrc]?IOS.ifAddr(w,d,d.ifs[d.aaaSrc])?.n:undefined});
        if(!h||!r.ok){steps.push(`${nm} (${ip4s(S.addr)}): no response, trying the next method`);continue}
        if(h.aaa.key!==S.key){steps.push(`${nm} (${ip4s(S.addr)}): the server can't decrypt the request (shared key mismatch), trying the next method`);continue}
        const ok=h.aaa.users[user]===pass;steps.push(`${nm} (${ip4s(S.addr)}): ${ok?"accepted":"rejected"} by the ${proto==="tacacs"?"TACACS+":"RADIUS"} server`);return {ok,steps,method:nm}}
      continue}
    if(m==="enable"){const ok=pass===(d.secret||d.enablePw);steps.push("enable: checked the enable secret");return {ok,steps,method:"enable"}}}
  steps.push("no more methods: login fails");return {ok:false,steps}};

/* ---------- EEM ---------- */
/* fire applets on device d whose syslog pattern matches one of the messages; returns extra log lines */
IOS.eemFire=function(w,d,msgs,depth){depth=depth||0;const out=[];if(depth>2||!d.eem)return out;
  Object.entries(d.eem).forEach(([name,A])=>{if(!A.ev)return;let hit=false;
    if(A.ev.t==="syslog"){let re;try{re=new RegExp(A.ev.pat)}catch(e){return}hit=msgs.some(m=>re.test(m))}
    if(A.ev.t==="track"){const st=A.ev.state==="up"?"Down -> Up":"Up -> Down";hit=msgs.some(m=>m.includes(`%TRACK-6-STATE: ${A.ev.id} `)&&(A.ev.state==="any"||m.includes(st)))}
    if(A.ev.t==="interface")hit=msgs.some(m=>m.includes(`Interface ${A.ev.if}, changed state to ${A.ev.state||"down"}`));
    if(hit){if(depth>0&&A.ranDepth===depth-1)IOS.flagLoop&&IOS.flagLoop();A.ranDepth=depth;out.push(...IOS.eemRun(w,d,name,depth))}});
  return out};
IOS.eemRun=function(w,d,name,depth){const A=d.eem[name];if(!A)return [`%HA_EM-3-FMPD_UNKNOWNENV: applet ${name} not found`];const out=[];A.runs=(A.runs||0)+1;
  const x={d,w,mode:"user",ifs:[],flags:{},hist:[],eem:true};const before=IOS.snap(w,d);
  [...A.acts].sort((a,b)=>cmpLbl(a.lbl,b.lbl)).forEach(ac=>{
    if(ac.t==="syslog")out.push(`%HA_EM-6-LOG: ${name}: ${ac.msg}`);
    else if(ac.t==="cli"){let c=ac.cmd;if(/^en(a(b(le?)?)?)?$/i.test(c.trim())){x.mode="priv";return}const r=IOS.run(x,c);if(x.pend)x.pend=null;if(r&&/%\s?Invalid/.test(r))out.push(`%HA_EM-3-FMPD_CLI_ERROR: ${name}: '${c}' failed`);A.lastOut=(A.lastOut||"")+r}});
  if(x.mode!=="user"&&x.mode!=="priv")out.push("%SYS-5-CONFIG_I: Configured from console by  on vty0 (EEM:"+name+")");
  IOS.settle(w);const after=IOS.snap(w,d);const L=IOS.diff(w,d,before,after);out.push(...L);
  out.push(...IOS.eemFire(w,d,out.concat(L),(depth||0)+1));return out};
const cmpLbl=(a,b)=>{const pa=String(a).split(".").map(Number),pb=String(b).split(".").map(Number);for(let i=0;i<Math.max(pa.length,pb.length);i++){const x=pa[i]||0,y=pb[i]||0;if(x!==y)return x-y}return 0};
IOS.flagLoop=()=>{if(typeof flag==="function")flag("eemloop")};

/* ---------- DTP: operational trunk/access from both ends' admin modes ---------- */
IOS.dtp=function(w){const adm=i=>i.sw.mode==="trunk"?(i.sw.noneg?"trunk-nonegotiate":"trunk"):i.sw.mode==="access"?"access":(i.sw.dyn==="desirable"?"desirable":"auto");
  Object.values(w.devs).forEach(d=>{if(d.kind==="router")return;Object.values(d.ifs).forEach(i=>{if(i.l3||!i.sw)return;const me=adm(i);i.sw.oper=null;i.sw.dtpWhy=null;
    if(me==="trunk"||me==="trunk-nonegotiate"||me==="access")return;
    const P=IOS.peersOf(w,d.name,i.name)[0];let peer=null;if(P){const pd=w.devs[P[0]],pi=pd&&pd.ifs[P[1]];if(pd&&pi){peer=pd.kind==="router"||pi.l3?"none":adm(pi)}}
    const trunk=peer&&(peer==="trunk"||peer==="desirable"||(me==="desirable"&&peer==="auto"));
    i.sw.oper=trunk?"trunk":"access";if(!trunk&&peer==="trunk-nonegotiate")i.sw.dtpWhy="the neighbor uses nonegotiate, so it sends no DTP frames";else if(!trunk&&peer==="auto")i.sw.dtpWhy="both ends are dynamic auto: each waits for the other";else if(!trunk&&peer==="access")i.sw.dtpWhy="the neighbor is a static access port"})})};
})();
