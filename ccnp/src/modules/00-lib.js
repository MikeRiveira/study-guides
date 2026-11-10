/* ================= shared helpers for CCNP module labs ================= */
const ip=s=>IOS.ip4(s);
/* OSPF adjacency state between two devices (first matching segment) */
const adjState=(w,a,b)=>{const x=IOS.ospfAdj(w).find(r=>(r.a[0]===a&&r.b[0]===b)||(r.a[0]===b&&r.b[0]===a));return x?x.state:"NONE"};
const ranCmd=(S,dev,re)=>(S[dev]?.hist||[]).some(h=>re.test(h));
const pingOk=(w,D,dev,dst,o)=>IOS.ping(w,{dev:D[dev]},ip(dst),4,o||{}).ok;
const bgpState=(w,D,dev,peer)=>{const p=IOS.bgpPeers(w,D[dev]).find(x=>x.nip===ip(peer));return p?p.state:"None"};
const hasRoute=(w,D,dev,net,len,code,vrf)=>IOS.rib(w,D[dev],4,vrf).some(r=>r.n===ip(net)&&r.len===len&&(!code||r.code===code));
const bestVia=(w,D,dev,net,len)=>{const r=IOS.rib(w,D[dev],4).find(r=>r.n===ip(net)&&r.len===len);const nh=r?.via?.[0]?.nh;return nh!=null?IOS.ip4s(nh):null};
const fhrpState=(w,kind,dev,ifn,g)=>{const G=IOS.fhrp(w,kind);for(const M of Object.values(G))for(const x of M)if(x.d.name===dev&&x.i.name===IOS.ifName(ifn)&&String(x.g)===String(g))return x.state;return null};
const hostPing=(w,name,dst,o)=>IOS.ping(w,{host:w.hosts.find(h=>h.name===name)},ip(dst),4,o||{}).ok;
