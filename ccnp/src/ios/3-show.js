/* ================= Cisco IOS simulator: show commands, ping, prompts, events ================= */
(function(){
const {ip4,ip4s,lenMask,wild,ip6s,pfx,inNet,ifShort,ifType,ifState,physUp,swMode,trunkAllows,listHas,v6Addrs,ifAddr,rib,ospfAdj,ospfIfCfg,ospfRid,ospfRoles,ecMember,ecProto,stpPorts,stp,fhrp,peersOf,hostsAt,aclEval,aceText,aceCfg,INV}=IOS;
const C=(modes,pat,fn,o)=>modes.split(" ").forEach(m=>IOS.CMDS.push({m,p:pat.split(" "),fn,o:o||{}}));
const pad=(s,n)=>String(s).padEnd(n);const rpad=(s,n)=>String(s).padStart(n);
const ifOrder=n=>{const t=ifType(n);const o={Loopback:0,"Port-channel":1,Tunnel:2,Vlan:9}[t]??5;const nums=n.slice(t.length).split(/[\/\.]/).map(x=>String(+x).padStart(4,"0")).join(".");return o+t+nums};
const sortIfs=d=>Object.values(d.ifs).sort((a,b)=>ifOrder(a.name)<ifOrder(b.name)?-1:1);
const pw=(d,s)=>d.pwEnc?"7 "+IOS.type7(s):s;
const upt="00:14:07";

/* ---------- running-config ---------- */
function ifCfg(w,d,i){const L=["interface "+i.name];
  if(i.desc)L.push(" description "+i.desc);
  if(i.vrf)L.push(d.vrfs[i.vrf]?.legacy?" ip vrf forwarding "+i.vrf:" vrf forwarding "+i.vrf);
  if(i.encap)L.push(" encapsulation dot1Q "+i.encap+(i.encapNative?" native":""));
  if(d.kind!=="router"&&!/^(Vlan|Loopback|Tunnel)/.test(i.name)){
    if(i.l3&&d.kind==="l3")L.push(" no switchport");
    else{if(i.sw.access!==1)L.push(" switchport access vlan "+i.sw.access);if(i.sw.native!==1)L.push(" switchport trunk native vlan "+i.sw.native);
      if(i.sw.allowed!==null)L.push(" switchport trunk allowed vlan "+(i.sw.allowed===""?"none":i.sw.allowed));
      if(i.sw.mode==="access")L.push(" switchport mode access");if(i.sw.mode==="trunk")L.push(" switchport mode trunk");if(i.sw.noneg)L.push(" switchport nonegotiate");
      if(i.sw.voice)L.push(" switchport voice vlan "+i.sw.voice);
      if(i.ps){if(i.ps.max!==1)L.push(" switchport port-security maximum "+i.ps.max);if(i.ps.viol!=="shutdown")L.push(" switchport port-security violation "+i.ps.viol);if(i.ps.sticky)L.push(" switchport port-security mac-address sticky");i.ps.macs.forEach(m=>L.push(" switchport port-security mac-address "+(i.ps.sticky?"sticky ":"")+m));if(!i.ps.off)L.push(" switchport port-security")}}}
  if(i.l3){if(i.ip!==null)L.push(` ip address ${ip4s(i.ip)} ${lenMask(i.len)}`);i.sec.forEach(s=>L.push(` ip address ${ip4s(s.n)} ${lenMask(s.len)} secondary`));if(i.dhcp)L.push(" ip address dhcp");
    if(i.ip===null&&!i.dhcp&&d.kind==="router"&&!i.sec.length)L.push(" no ip address");
    i.helper.forEach(h=>L.push(" ip helper-address "+ip4s(h)));if(i.acl.in)L.push(` ip access-group ${i.acl.in} in`);if(i.acl.out)L.push(` ip access-group ${i.acl.out} out`);if(i.nat)L.push(" ip nat "+i.nat);
    const o=i.ospf;if(o.net)L.push(" ip ospf network "+o.net);if(o.hello)L.push(" ip ospf hello-interval "+o.hello);if(o.dead)L.push(" ip ospf dead-interval "+o.dead);if(o.pri!=null)L.push(" ip ospf priority "+o.pri);if(o.cost)L.push(" ip ospf cost "+o.cost);if(o.area!=null)L.push(` ip ospf ${o.pid} area ${o.area}`);
    Object.entries(i.hsrp).forEach(([g,c])=>{if(c.ip!=null)L.push(` standby ${g} ip ${ip4s(c.ip)}`);if(c.pri!=null)L.push(` standby ${g} priority ${c.pri}`);if(c.preempt)L.push(` standby ${g} preempt`)});
    if(i.hsrpV===2&&Object.keys(i.hsrp).length)L.splice(L.length-Object.keys(i.hsrp).length,0," standby version 2");
    Object.entries(i.vrrp).forEach(([g,c])=>{if(c.v3)return;if(c.ip!=null)L.push(` vrrp ${g} ip ${ip4s(c.ip)}`);if(c.pri!=null)L.push(` vrrp ${g} priority ${c.pri}`)});
    if(i.v6en)L.push(" ipv6 enable");if(i.v6auto)L.push(" ipv6 address autoconfig");
    i.v6.forEach(a=>L.push(a.ll?` ipv6 address ${ip6s(a.n)} link-local`:a.eui?` ipv6 address ${ip6s(a.n)}/${a.len} eui-64`:` ipv6 address ${ip6s(a.n)}/${a.len}`));
    if(i.ospf6)L.push(` ipv6 ospf ${i.ospf6.pid} area ${i.ospf6.area}`)}
  if(i.bw)L.push(" bandwidth "+i.bw);
  if(i.speed!=="auto")L.push(" speed "+i.speed);if(i.duplex!=="auto")L.push(" duplex "+i.duplex);if(i.poe!=="auto")L.push(" power inline "+i.poe);
  if(i.cg)L.push(` channel-group ${i.cg.n} mode ${i.cg.mode}`);
  if(i.storm)L.push(` storm-control broadcast level ${i.storm.level}`);if(i.stormM)L.push(` storm-control multicast level ${i.stormM}`);if(i.stormAction)L.push(" storm-control action "+i.stormAction);
  if(i.pf)L.push(i.pfTrunk?" spanning-tree portfast trunk":" spanning-tree portfast");if(i.pfOff)L.push(" spanning-tree portfast disable");if(i.bg)L.push(" spanning-tree bpduguard enable");if(i.guard)L.push(" spanning-tree guard "+i.guard);
  if(i.stpCost)L.push(" spanning-tree cost "+i.stpCost);
  if(i.snoopTrust)L.push(" ip dhcp snooping trust");if(i.snoopRate)L.push(" ip dhcp snooping limit rate "+i.snoopRate);if(i.daiTrust)L.push(" ip arp inspection trust");
  if(i.raPolicy)L.push(" ipv6 nd raguard attach-policy "+i.raPolicy);
  if(!i.cdp)L.push(" no cdp enable");
  if(IOS.ifCfgExtra)L.push(...IOS.ifCfgExtra(w,d,i));
  if(i.shut)L.push(" shutdown");
  return L}
function runningConfig(w,d,only){
  if(only){const i=d.ifs[only];if(!i)return INV;const L=ifCfg(w,d,i);return `Building configuration...\n\nCurrent configuration : ${L.join("\n").length+2} bytes\n!\n${L.join("\n")}\nend`}
  const L=["!","version 17.9",d.logging.ts?"service timestamps log datetime msec":"service timestamps debug datetime msec\nservice timestamps log datetime msec"];
  if(d.pwEnc)L.push("service password-encryption");
  L.push("!","hostname "+d.host,"!","boot-start-marker","boot-end-marker","!");
  if(d.secret)L.push("enable secret 9 "+IOS.hashPw(d.secret));if(d.enablePw)L.push("enable password "+pw(d,d.enablePw));if(d.secret||d.enablePw)L.push("!");
  if(d.aaa){L.push("aaa new-model");if(d.aaaLogin)L.push("aaa authentication login default "+d.aaaLogin);if(d.aaaAuthz)L.push("aaa authorization exec default "+d.aaaAuthz);if(d.aaaAcct)L.push("aaa accounting exec default start-stop group "+d.aaaAcct);L.push("!")}else L.push("no aaa new-model");
  if(d.clockTz)L.push("clock timezone "+d.clockTz);
  if(IOS.cfgTop)L.push(...IOS.cfgTop(w,d));
  if(d.excl.length)d.excl.forEach(([a,b])=>L.push("ip dhcp excluded-address "+ip4s(a)+(b?" "+ip4s(b):"")));
  Object.entries(d.pools).forEach(([n,p])=>{L.push("!","ip dhcp pool "+n);if(p.net!=null)L.push(` network ${ip4s(p.net)} ${lenMask(p.len)}`);if(p.gw!=null)L.push(" default-router "+ip4s(p.gw));if(p.dns.length)L.push(" dns-server "+p.dns.map(ip4s).join(" "));if(p.domain)L.push(" domain-name "+p.domain);if(p.lease)L.push(" lease "+p.lease)});
  if(d.domain)L.push("!","ip domain name "+d.domain);
  if(d.nameServers.length)L.push("ip name-server "+d.nameServers.map(ip4s).join(" "));
  if(d.snoop.on||d.snoop.vlans.length){if(d.snoop.vlans.length)L.push("ip dhcp snooping vlan "+d.snoop.vlans.join(","));if(!d.snoop.opt82)L.push("no ip dhcp snooping information option");if(d.snoop.on)L.push("ip dhcp snooping")}
  if(d.dai.length)L.push("ip arp inspection vlan "+d.dai.join(","));
  if(d.kind!=="router"&&d.ipRouting)L.push("ip routing");if(d.kind==="router"&&!d.ipRouting)L.push("no ip routing");
  if(d.v6Routing)L.push("ipv6 unicast-routing");
  Object.entries(d.raPol).forEach(([n,p])=>{L.push("ipv6 nd raguard policy "+n);L.push(" device-role "+p.role)});
  if(d.lldp)L.push("lldp run");if(!d.cdp)L.push("no cdp run");
  L.push("!");
  Object.entries(d.users).forEach(([u,c])=>L.push(`username ${u}${c.priv!==1?" privilege "+c.priv:""} ${c.secret?"secret 9 "+IOS.hashPw(c.secret):"password "+pw(d,c.pw)}`));
  if(Object.keys(d.users).length)L.push("!");
  if(d.kind!=="router"){L.push("spanning-tree mode "+d.stp.mode);if(d.stp.pfDefault)L.push("spanning-tree portfast default");if(d.stp.bgDefault)L.push("spanning-tree portfast bpduguard default");L.push("spanning-tree extend system-id");Object.entries(d.stp.pri).forEach(([v,p])=>L.push(`spanning-tree vlan ${v} priority ${p}`));L.push("!")}
  if(d.kind!=="router"){Object.entries(d.vlans).forEach(([v,c])=>{if(+v===1)return;L.push("vlan "+v);if(c.name!=="VLAN"+String(v).padStart(4,"0"))L.push(" name "+c.name);L.push("!")})}
  if(d.sshv)L.push("ip ssh version "+d.sshv);if(d.scp)L.push("ip scp server enable");if(d.sshv||d.scp)L.push("!");
  if(IOS.cfgPreIf)L.push(...IOS.cfgPreIf(w,d));
  sortIfs(d).forEach(i=>{L.push(...ifCfg(w,d,i));L.push("!")});
  if(d.ospf){const p=d.ospf;L.push("router ospf "+p.pid);if(p.rid!=null)L.push(" router-id "+ip4s(p.rid));if(p.refBw!==100)L.push(" auto-cost reference-bandwidth "+p.refBw);if(p.passiveDefault)L.push(" passive-interface default");p.nonPassive.forEach(n=>L.push(" no passive-interface "+n));p.passive.forEach(n=>L.push(" passive-interface "+n));
    if(IOS.ospfCfgExtra)L.push(...IOS.ospfCfgExtra(d,p));
    p.nets.forEach(n=>L.push(` network ${ip4s(n.net)} ${ip4s(n.wild)} area ${n.area}`));if(p.defOrig)L.push(" default-information originate"+(p.defAlways?" always":""));if(p.dlist)L.push(" distribute-list "+(p.dlist.pl?"prefix "+p.dlist.pl:p.dlist.acl)+" in");L.push("!")}
  if(IOS.cfgRouting)L.push(...IOS.cfgRouting(w,d));
  if(d.ospf6){const p=d.ospf6;L.push("ipv6 router ospf "+p.pid);if(p.rid!=null)L.push(" router-id "+ip4s(p.rid));if(p.passiveDefault)L.push(" passive-interface default");p.passive.forEach(n=>L.push(" passive-interface "+n));if(p.defOrig)L.push(" default-information originate");L.push("!")}
  L.push("ip forward-protocol nd");if(d.kind==="router")L.push("no ip http server","no ip http secure-server");
  Object.entries(d.nat.pools).forEach(([n,p])=>L.push(`ip nat pool ${n} ${ip4s(p.start)} ${ip4s(p.end)} netmask ${lenMask(p.len)}`));
  d.nat.rules.forEach(r=>L.push(`ip nat inside source list ${r.acl} ${r.oif?"interface "+r.oif:"pool "+r.pool}${r.overload?" overload":""}`));
  d.nat.statics.forEach(s=>L.push(s.proto?`ip nat inside source static tcp ${ip4s(s.local)} ${s.lport} ${ip4s(s.global)} ${s.gport}`:`ip nat inside source static ${ip4s(s.local)} ${ip4s(s.global)}`));
  if(d.defGw!=null)L.push("ip default-gateway "+ip4s(d.defGw));
  d.routes.forEach(r=>L.push(`ip route ${r.vrf?"vrf "+r.vrf+" ":""}${ip4s(r.n)} ${lenMask(r.len)}${r.oif?" "+r.oif:""}${r.nh!=null?" "+ip4s(r.nh):""}${r.ad!==1?" "+r.ad:""}${r.name?" name "+r.name:""}${r.perm?" permanent":""}${r.track!=null?" track "+r.track:""}`));
  d.routes6.forEach(r=>L.push(`ipv6 route ${ip6s(r.n)}/${r.len}${r.oif?" "+r.oif:""}${r.nh!=null?" "+ip6s(r.nh):""}${r.ad!==1?" "+r.ad:""}`));
  L.push("!");
  Object.values(d.acls).forEach(A=>{if(A.numbered&&!A.named){A.entries.forEach(e=>L.push(`access-list ${A.name} ${aceCfg(A,e)}`))}else{L.push(`ip access-list ${A.type} ${A.name}`);A.entries.forEach(e=>L.push(` ${e.seq} ${aceCfg(A,e)}`))}});
  if(Object.keys(d.acls).length)L.push("!");
  if(d.logging.trap!=null)L.push("logging trap "+["emergencies","alerts","critical","errors","warnings","notifications","informational","debugging"][d.logging.trap]);if(d.logging.buffered)L.push("logging buffered");d.logging.hosts.forEach(h=>L.push("logging host "+ip4s(h)));
  d.snmp.comm.forEach(c=>L.push(`snmp-server community ${c.name} ${c.rw}${c.acl?" "+c.acl:""}`));(d.snmp.groups||[]).forEach(g=>L.push(`snmp-server group ${g} v3 priv`));if(d.snmp.loc)L.push("snmp-server location "+d.snmp.loc);if(d.snmp.contact)L.push("snmp-server contact "+d.snmp.contact);if(d.snmp.traps)L.push("snmp-server enable traps");d.snmp.hosts.forEach(h=>L.push(`snmp-server host ${ip4s(h.ip)} version ${h.v} ${h.c}`));
  Object.entries(d.tacacs).forEach(([n,t])=>{L.push("tacacs server "+n);if(t.addr!=null)L.push(" address ipv4 "+ip4s(t.addr));if(t.key)L.push(" key "+(d.pwEnc?"7 "+IOS.type7(t.key):t.key));L.push("!")});
  Object.entries(d.radius).forEach(([n,t])=>{L.push("radius server "+n);if(t.addr!=null)L.push(" address ipv4 "+ip4s(t.addr)+(t.ports?` auth-port ${t.ports[0]} acct-port ${t.ports[1]}`:" auth-port 1812 acct-port 1813"));if(t.key)L.push(" key "+(d.pwEnc?"7 "+IOS.type7(t.key):t.key));L.push("!")});
  if(d.banner!=null)L.push("banner motd ^C"+d.banner+"^C");
  L.push("!","line con 0");const c=d.lines.con;if(c.timeout)L.push(` exec-timeout ${c.timeout[0]} ${c.timeout[1]}`);if(c.pw)L.push(" password "+pw(d,c.pw));if(c.sync)L.push(" logging synchronous");if(c.local)L.push(" login local");else if(c.login)L.push(" login");if(d.kind==="router")L.push(" stopbits 1");
  const v=d.lines.vty;const vr=d.vtyRange||[0,4];L.push(`line vty ${vr[0]} ${vr[1]}`);if(v.acl)L.push(` access-class ${v.acl} in`);if(v.timeout)L.push(` exec-timeout ${v.timeout[0]} ${v.timeout[1]}`);if(v.pw)L.push(" password "+pw(d,v.pw));if(v.local)L.push(" login local");else if(v.login)L.push(" login");if(v.transport)L.push(" transport input "+v.transport);
  if(IOS.cfgEnd)L.push(...IOS.cfgEnd(w,d));
  else d.ntp.forEach(n=>L.push("ntp server "+ip4s(n)));
  L.push("!","end");
  const body=L.join("\n");return `Building configuration...\n\nCurrent configuration : ${body.length} bytes\n${body}`}
IOS.runningConfig=(w,d,only)=>runningConfig(w,d,only);

/* ---------- interfaces ---------- */
function ipBrief(w,d){const L=["Interface              IP-Address      OK? Method Status                Protocol"];
  sortIfs(d).forEach(i=>{const [s,p]=ifState(w,d,i);const a=ifAddr(w,d,i);L.push((i.name+" ").padEnd(23)+pad(a?ip4s(a.n):"unassigned",16)+"YES "+pad(i.dhcp?"DHCP":a?"manual":"unset",7)+pad(s,22)+p)});return L.join("\n")}
function v6Brief(w,d){const L=[];sortIfs(d).forEach(i=>{const [s,p]=ifState(w,d,i);L.push((i.name+" ").padEnd(23)+"["+s+"/"+p+"]");const A=v6Addrs(d,i);if(!A.length)L.push("    unassigned");A.forEach(a=>L.push("    "+ip6s(a.n)))});return L.join("\n")}
function ifDetail(w,d,i){const [s,p]=ifState(w,d,i);const a=ifAddr(w,d,i);const t=ifType(i.name);
  const hw=t==="Loopback"?"Loopback":t==="Tunnel"?"Tunnel":t==="Vlan"?"Ethernet SVI":t==="Port-channel"?"EtherChannel":d.kind==="router"?"ISR4331-3x1GE":"Gigabit Ethernet";
  const pk=i.counters||{};const bw=t==="Loopback"?8000000:t==="FastEthernet"?100000:1000000;
  const dup=duplexOf(w,d,i),spd=i.speed==="auto"?(t==="FastEthernet"?"100":"1000"):i.speed;
  let L=[`${i.name} is ${s==="administratively down"?"administratively down":i.err?"down":s}, line protocol is ${p}${i.err?" (err-disabled)":""}`,`  Hardware is ${hw}, address is ${i.mac} (bia ${i.mac})`];
  if(i.desc)L.push("  Description: "+i.desc);if(a)L.push(`  Internet address is ${ip4s(a.n)}/${a.len}`);
  if(t==="Tunnel"&&IOS.tunDetail){L.push(...IOS.tunDetail(w,d,i));return L.join("\n")}
  L.push(`  MTU ${t==="Loopback"?1514:1500} bytes, BW ${i.bw||bw} Kbit/sec, DLY 10 usec, `,`     reliability 255/255, txload 1/255, rxload 1/255`,`  Encapsulation ${i.encap?"802.1Q Virtual LAN, Vlan ID  "+i.encap:"ARPA"}, loopback not set`);
  if(!/^(Loopback|Vlan)/.test(i.name)&&!i.name.includes(".")){L.push(`  ${dup==="full"?"Full":"Half"} Duplex, ${spd}Mbps, link type is ${i.speed==="auto"?"auto":"force-up"}, media type is RJ45`);
    L.push(`  input flow-control is off, output flow-control is unsupported`,`  Last input 00:00:01, output 00:00:00, output hang never`,`  Input queue: 0/375/0/0 (size/max/drops/flushes); Total output drops: ${pk.drops??0}`,`  5 minute input rate ${p==="up"?2000:0} bits/sec, ${p==="up"?3:0} packets/sec`,
      `     ${pk.in??(p==="up"?184233:0)} packets input, ${pk.inb??(p==="up"?20112384:0)} bytes, 0 no buffer`,`     Received ${pk.bc??(p==="up"?1402:0)} broadcasts (0 IP multicasts)`,`     ${pk.runts??0} runts, ${pk.giants??0} giants, 0 throttles`,
      `     ${pk.inerr??(dup==="half"&&p==="up"?412:0)} input errors, ${pk.crc??(dup==="half"&&p==="up"?398:0)} CRC, 0 frame, 0 overrun, 0 ignored`,`     ${pk.out??(p==="up"?99032:0)} packets output, ${pk.outb??(p==="up"?9188822:0)} bytes, 0 underruns`,
      `     ${pk.outerr??0} output errors, ${pk.coll??(dup==="half"&&p==="up"?2210:0)} collisions, 0 interface resets`,`     ${pk.late??(dup==="half"&&p==="up"?186:0)} late collision, 0 deferred`)}
  return L.join("\n")}
function duplexOf(w,d,i){return IOS.duplexOf(w,d,i)}
function ifStatus(w,d){const L=["Port         Name               Status       Vlan       Duplex  Speed Type"];
  sortIfs(d).forEach(i=>{if(/^(Vlan|Loopback|Tunnel)/.test(i.name))return;const [s]=ifState(w,d,i);const st=i.err?"err-disabled":i.shut?"disabled":s==="up"?"connected":"notconnect";
    const vl=i.l3?"routed":i.cg&&ecMember(w,d,i)==="P"?"1":swMode(i)==="trunk"&&s==="up"?"trunk":String(i.sw.access);
    const up=s==="up";const dp=duplexOf(w,d,i);L.push(pad(ifShort(i.name),13)+pad(i.desc.slice(0,18),19)+pad(st,13)+pad(vl,11)+pad(up?(i.duplex==="auto"?"a-":"")+dp:"auto",8)+pad(up?(i.speed==="auto"?"a-"+(/^Fast/.test(i.name)?"100":"1000"):i.speed):"auto",7)+(/^Port/.test(i.name)?"":"10/100/1000BaseTX"))});return L.join("\n")}
function trunks(w,d){const T=sortIfs(d).filter(i=>!i.l3&&swMode(i)==="trunk"&&physUp(w,d,i)&&!(i.cg&&ecMember(w,d,i)==="P"));if(!T.length)return "";
  const L=["","Port        Mode             Encapsulation  Status        Native vlan"];T.forEach(i=>L.push(pad(ifShort(i.name),12)+pad(i.sw.mode==="auto"?(i.sw.dyn||"auto"):i.sw.noneg?"nonegotiate":"on",17)+pad("802.1q",15)+pad("trunking",14)+i.sw.native));
  L.push("","Port        Vlans allowed on trunk");T.forEach(i=>L.push(pad(ifShort(i.name),12)+(i.sw.allowed===null?"1-4094":i.sw.allowed===""?"none":i.sw.allowed)));
  const act=i=>Object.keys(d.vlans).map(Number).filter(v=>trunkAllows(i,v)).join(",");
  L.push("","Port        Vlans allowed and active in management domain");T.forEach(i=>L.push(pad(ifShort(i.name),12)+act(i)));
  L.push("","Port        Vlans in spanning tree forwarding state and not pruned");T.forEach(i=>L.push(pad(ifShort(i.name),12)+Object.keys(d.vlans).map(Number).filter(v=>trunkAllows(i,v)&&stpPorts(w,d,v).out.some(p=>p.i===i&&p.st==="FWD")).join(",")));return L.join("\n")}
function swDetail(w,d,i){if(i.l3)return `Name: ${ifShort(i.name)}\nSwitchport: Disabled`;
  const op=swMode(i)==="trunk"&&physUp(w,d,i)?"trunk":i.sw.mode==="access"?"static access":physUp(w,d,i)?"static access":"down";
  return [`Name: ${ifShort(i.name)}`,`Switchport: Enabled`,`Administrative Mode: ${i.sw.mode==="auto"?"dynamic "+(i.sw.dyn||"auto"):i.sw.mode==="access"?"static access":"trunk"}`,`Operational Mode: ${op}`,`Administrative Trunking Encapsulation: dot1q`,`Negotiation of Trunking: ${i.sw.noneg||i.sw.mode==="access"?"Off":"On"}`,
    `Access Mode VLAN: ${i.sw.access} (${d.vlans[i.sw.access]?.name||"Inactive"})`,`Trunking Native Mode VLAN: ${i.sw.native} (${d.vlans[i.sw.native]?.name||"Inactive"})`,`Voice VLAN: ${i.sw.voice?i.sw.voice+" ("+(d.vlans[i.sw.voice]?.name||"Inactive")+")":"none"}`,
    `Trunking VLANs Enabled: ${i.sw.allowed===null?"ALL":i.sw.allowed||"NONE"}`].join("\n")}
function vlanBrief(w,d,full){if(d.kind==="router")return INV;const L=["","VLAN Name                             Status    Ports","---- -------------------------------- --------- -------------------------------"];
  Object.entries(d.vlans).forEach(([v,c])=>{v=+v;const ports=sortIfs(d).filter(i=>!i.l3&&!/^(Vlan|Loopback|Port-channel)/.test(i.name)&&!(i.cg&&ecMember(w,d,i)==="P")&&!(swMode(i)==="trunk"&&physUp(w,d,i))&&(i.sw.access===v||i.sw.voice===v)).map(i=>ifShort(i.name));
    const po=sortIfs(d).filter(i=>/^Port-channel/.test(i.name)&&!i.l3&&swMode(i)!=="trunk"&&i.sw.access===v&&physUp(w,d,i)).map(i=>ifShort(i.name));const all=[...ports,...po];
    const chunks=[];for(let k=0;k<all.length;k+=4)chunks.push(all.slice(k,k+4).join(", "));L.push(pad(v,5)+pad(c.name,33)+pad("active",10)+(chunks[0]||""));chunks.slice(1).forEach(ch=>L.push(" ".repeat(48)+ch))});
  [1002,1003,1004,1005].forEach((v,k)=>L.push(pad(v,5)+pad(["fddi-default","token-ring-default","fddinet-default","trnet-default"][k],33)+"act/unsup "));return L.join("\n")}

/* ---------- routing ---------- */
const CODES=`Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, + - replicated route`;
function classful(n){const a=Number(n>>24n);return a<128?8:a<192?16:24}
function routeLines(w,d,r,grouped){const p=ip4s(r.n)+"/"+r.len;const code=r.len===0&&r.code!=="C"&&r.code!=="L"?(r.code.includes(" ")?r.code.replace(" ","*"):r.code+"*"):r.code;
  if(r.discard)return [(grouped?pad(code,9):pad(code,6))+p+" is a summary, "+upt+", Null0"];const c=grouped?pad(code,9):pad(code,6);
  if(r.code==="C"||r.code==="L")return [c+p+" is directly connected, "+r.via[0].oif];
  const out=[];r.via.forEach((v,k)=>{const lead=k===0?c+p+` [${r.ad}/${r.metric}] `:" ".repeat((grouped?9:6)+p.length+(`[${r.ad}/${r.metric}] `).length);
    if(v.nh==null)out.push(lead+"is directly connected, "+v.oif);else{out.push(lead+"via "+ip4s(v.nh)+(r.code.startsWith("O")?`, ${upt}, ${v.oif}`:r.code==="B"?", "+upt:v.oif?", "+v.oif:""))}});return out}
function showRoute(w,d,filter,vrf){
  if(!d.ipRouting&&d.kind!=="router"){return `Default gateway is ${d.defGw!=null?ip4s(d.defGw):"not set"}\n\nHost               Gateway           Last Use    Total Uses  Interface\nICMP redirect cache is empty`}
  let R=rib(w,d,4,vrf).slice();if(filter)R=R.filter(r=>filter==="static"?r.code==="S":filter==="ospf"?r.code.startsWith("O"):filter==="bgp"?r.code==="B":filter==="connected"?r.code==="C"||r.code==="L":true);
  const def=rib(w,d,4,vrf).find(r=>r.len===0&&r.code!=="L");
  const L=[vrf?`\nRouting Table: ${vrf}\n`+CODES:CODES,"",def?`Gateway of last resort is ${def.via[0].nh!=null?ip4s(def.via[0].nh):"0.0.0.0"} to network 0.0.0.0`:"Gateway of last resort is not set",""];
  R.sort((a,b)=>a.n<b.n?-1:a.n>b.n?1:a.len-b.len||(a.local?1:-1));
  const groups=new Map();R.forEach(r=>{const cl=classful(r.n);if(r.len>=cl){const k=ip4s(pfx(r.n,cl,4))+"/"+cl;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)}else groups.set(ip4s(r.n)+"/"+r.len+"#"+r.code,[r]);});
  [...groups.entries()].forEach(([k,G])=>{const cl=+k.split("/")[1].split("#")[0];if(G.length===1&&G[0].len<=cl){L.push(...routeLines(w,d,G[0],false));return}
    const masks=new Set(G.map(r=>r.len));const net=k.split("/")[0];
    L.push(masks.size>1?`      ${net}/${cl} is variably subnetted, ${G.length} subnets, ${masks.size} masks`:`      ${net}/${[...masks][0]} is subnetted, ${G.length} subnet${G.length>1?"s":""}`);
    G.forEach(r=>L.push(...routeLines(w,d,r,true)))});
  return L.join("\n")}
function routeEntry(w,d,n){const R=rib(w,d,4).filter(r=>!r.local&&inNet(n,r.n,r.len,4)).sort((a,b)=>b.len-a.len);if(!R.length)return "% Network not in table";const r=R[0];
  const src=r.code==="C"?"connected":r.code==="S"?"static":r.code==="B"?"bgp "+(d.bgp?.asn||""):"ospf "+(d.ospf?.pid||1);
  return [`Routing entry for ${ip4s(r.n)}/${r.len}`,`  Known via "${src}", distance ${r.ad}, metric ${r.metric}${r.code==="C"?" (connected, via interface)":""}`,r.code.startsWith("O")?`  Routing Descriptor Blocks:`:`  Routing Descriptor Blocks:`,...r.via.map((v,k)=>`  ${k===0?"* ":"  "}${v.nh!=null?ip4s(v.nh)+(v.oif?", via "+v.oif:""):"directly connected, via "+v.oif}`+`\n      Route metric is ${r.metric}, traffic share count is 1`)].join("\n")}
IOS.showRouteFn=showRoute;
function showRoute6(w,d){if(!d.v6Routing&&d.kind!=="router")return "% IPv6 routing not enabled";const R=rib(w,d,6).sort((a,b)=>a.n<b.n?-1:1);
  const L=[`IPv6 Routing Table - default - ${R.length} entries`,`Codes: C - Connected, L - Local, S - Static, U - Per-user Static route`,`       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2`,`       ND - ND Default, NDp - ND Prefix, DCE - Destination, NDr - Redirect`];
  R.forEach(r=>{const code=r.code==="O E2"?"OE2":r.code;L.push(pad(code,3)+" "+ip6s(r.n)+"/"+r.len+` [${r.ad}/${r.metric}]`);r.via.forEach(v=>L.push("     via "+(v.nh!=null?ip6s(v.nh)+(v.oif?", "+v.oif:""):v.oif+(r.code==="L"?", receive":", directly connected"))))});return L.join("\n")}

/* ---------- OSPF ---------- */
function ospfNbr(w,d,v6){const p=v6?d.ospf6:d.ospf;if(!p)return "";const A=ospfAdj(w,v6).filter(a=>a.state!=="DOWN");
  const L=v6?["","            OSPFv3 Router with ID ("+(ospfRid(w,d,true)!=null?ip4s(ospfRid(w,d,true)):"0.0.0.0")+") (Process ID "+p.pid+")","","Neighbor ID     Pri   State           Dead Time   Interface ID    Interface"]:["","Neighbor ID     Pri   State           Dead Time   Address         Interface"];
  A.forEach(a=>{let me,th;if(a.a[0]===d.name){me=a.a;th=a.b}else if(a.b[0]===d.name){me=a.b;th=a.a}else return;
    const T=w.devs[th[0]],TI=T.ifs[th[1]],c=ospfIfCfg(w,T,TI,v6);const role=c.net==="broadcast"?(a.state==="2WAY"?"DROTHER":ospfRoles(w,ospfAdj(w,v6),T,TI,v6)):"-";
    const st=(a.state+"/"+(role==="-"?"  -":role)).padEnd(16);const dead="00:00:"+String(Math.max(1,c.dead-7)).padStart(2,"0");
    L.push(pad(ip4s(ospfRid(w,T,v6)),16)+rpad(c.pri,3)+"   "+st+pad(dead,12)+(v6?pad(String(Object.keys(T.ifs).indexOf(TI.name)+3),16):pad(ip4s(TI.ip),16))+ifShort(me[1]))});
  return L.join("\n")}
function ospfIfBrief(w,d,v6){const p=v6?d.ospf6:d.ospf;if(!p)return "";const A=ospfAdj(w,v6);
  const L=["Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C"];
  sortIfs(d).forEach(i=>{const c=ospfIfCfg(w,d,i,v6);if(!c)return;const up=IOS.physUp(w,d,i);
    const nb=A.filter(a=>(a.a[0]===d.name&&a.a[1]===i.name)||(a.b[0]===d.name&&a.b[1]===i.name));const full=nb.filter(a=>a.state==="FULL").length,tot=nb.filter(a=>a.state!=="DOWN").length;
    const st=!up?"DOWN":c.net==="loopback"?"LOOP":c.net==="point-to-point"?"P2P":ospfRoles(w,A,d,i,v6)==="DROTHER"?"DROTH":ospfRoles(w,A,d,i,v6);
    L.push(pad(ifShort(i.name),13)+pad(c.pid,6)+pad(c.area,16)+pad(v6?"":ip4s(i.ip)+"/"+i.len,19)+pad(c.cost,6)+pad(st,6)+full+"/"+tot)});return L.join("\n")}
function ospfIf(w,d,i){const c=ospfIfCfg(w,d,i,false);if(!c)return `${i.name} is ${ifState(w,d,i)[0]}, line protocol is ${ifState(w,d,i)[1]}\n  OSPF not enabled on this interface`;
  const A=ospfAdj(w,false);const role=c.net==="broadcast"?ospfRoles(w,A,d,i,false):null;const dr=c.net==="broadcast"?IOS.drOf(w,A,d,i,false):null;
  const ridOf=k=>k?ip4s(ospfRid(w,w.devs[k[0]],false)):"0.0.0.0",ipOf=k=>k?ip4s(w.devs[k[0]].ifs[k[1]].ip):"0.0.0.0";
  const nb=A.filter(a=>a.state!=="DOWN"&&((a.a[0]===d.name&&a.a[1]===i.name)||(a.b[0]===d.name&&a.b[1]===i.name)));
  const L=[`${i.name} is ${ifState(w,d,i)[0]}, line protocol is ${ifState(w,d,i)[1]}`,`  Internet Address ${ip4s(i.ip)}/${i.len}, Area ${c.area}, Attached via ${i.ospf.area!=null?"Interface Enable":"Network Statement"}`,
    `  Process ID ${c.pid}, Router ID ${ip4s(ospfRid(w,d,false)||0n)}, Network Type ${c.net.toUpperCase().replace("-","_TO_")}, Cost: ${c.cost}`];
  if(c.net==="broadcast"){L.push(`  Transmit Delay is 1 sec, State ${role}, Priority ${c.pri}`);if(dr?.dr)L.push(`  Designated Router (ID) ${ridOf(dr.dr)}, Interface address ${ipOf(dr.dr)}`);if(dr?.bdr)L.push(`  Backup Designated router (ID) ${ridOf(dr.bdr)}, Interface address ${ipOf(dr.bdr)}`)}
  else if(c.net==="loopback")L.push("  Loopback interface is treated as a stub Host");
  if(c.net!=="loopback"){L.push(`  Timer intervals configured, Hello ${c.hello}, Dead ${c.dead}, Wait ${c.dead}, Retransmit 5`);if(c.passive)L.push("    No Hellos (Passive interface) ");else L.push("    Hello due in 00:00:0"+Math.min(9,c.hello-3));
    L.push(`  Neighbor Count is ${nb.length}, Adjacent neighbor count is ${nb.filter(a=>a.state==="FULL").length} `);nb.filter(a=>a.state==="FULL").forEach(a=>{const th=a.a[0]===d.name?a.b:a.a;L.push(`    Adjacent with neighbor ${ip4s(ospfRid(w,w.devs[th[0]],false))}${dr&&dr.dr&&dr.dr[0]===th[0]?"  (Designated Router)":dr&&dr.bdr&&dr.bdr[0]===th[0]?"  (Backup Designated Router)":""}`)})}
  return L.join("\n")}
function ospfProc(w,d){const p=d.ospf;if(!p)return "%OSPF: Router process not running";const rid=ospfRid(w,d,false);
  return [` Routing Process "ospf ${p.pid}" with ID ${rid!=null?ip4s(rid):"0.0.0.0"}`,` Start time: 00:00:41.112, Time elapsed: ${upt}.502`,` Supports only single TOS(TOS0) routes`,` Router is not originating router-LSAs with maximum metric`,` Reference bandwidth unit is ${p.refBw} mbps`,...[...(IOS.ospfAreas(w,d,false).size?IOS.ospfAreas(w,d,false):new Set(["0"]))].sort((a,b)=>a-b).flatMap(ar=>[`    Area ${ar==="0"?"BACKBONE(0)":ar}${p.stubs?.[ar]?`\n        It is a ${p.stubs[ar].nosum?"stub area, no summary LSA in this area":"stub area"}`:""}`,`        Number of interfaces in this area is ${Object.values(d.ifs).filter(i=>String(ospfIfCfg(w,d,i,false)?.area)===ar).length}`,...(p.areaAuth?.[ar]?["        Area has message digest authentication"]:["        Area has no authentication"]),`        SPF algorithm last executed 00:01:12.384 ago`,...((p.ranges?.[ar]||[]).length?["        Area ranges are",...p.ranges[ar].map(r=>`           ${ip4s(r.n)}/${r.len} ${r.noAdv?"Not Advertise":"Passive Advertise"}`)]:[])]),...(IOS.isAbr(w,d,false)?[" It is an area border router"]:[]),...(p.redist||p.defOrig?[" It is an autonomous system boundary router"]:[])].join("\n")}
function protocols(w,d){const p=d.ospf;if(!p)return "*** IP Routing is NSF aware ***\n"+(IOS.protoExtra?IOS.protoExtra(w,d).join("\n"):"");const rid=ospfRid(w,d,false);
  const L=[`*** IP Routing is NSF aware ***`,``,`Routing Protocol is "ospf ${p.pid}"`,`  Outgoing update filter list for all interfaces is not set`,`  Incoming update filter list for all interfaces is ${p.dlist?(p.dlist.pl?"(prefix-list) "+p.dlist.pl:p.dlist.acl):"not set"}`,`  Router ID ${rid!=null?ip4s(rid):"0.0.0.0"}`,`  Number of areas in this router is ${IOS.ospfAreas(w,d,false).size||1}. ${[...IOS.ospfAreas(w,d,false)].filter(a=>!p.stubs?.[a]).length||1} normal ${[...IOS.ospfAreas(w,d,false)].filter(a=>p.stubs?.[a]).length} stub 0 nssa`,`  Maximum path: 4`,`  Routing for Networks:`];
  p.nets.forEach(n=>L.push(`    ${ip4s(n.net)} ${ip4s(n.wild)} area ${n.area}`));const ie=Object.values(d.ifs).filter(i=>i.ospf.area!=null);if(ie.length){L.push("  Routing on Interfaces Configured Explicitly (Area 0):");ie.forEach(i=>L.push("    "+i.name))}
  const pas=Object.values(d.ifs).filter(i=>{const c=ospfIfCfg(w,d,i,false);return c&&c.passive});if(pas.length){L.push("  Passive Interface(s):");pas.forEach(i=>L.push("    "+i.name))}
  L.push(`  Routing Information Sources:`,`    Gateway         Distance      Last Update`);ospfAdj(w,false).filter(a=>a.state==="FULL"&&(a.a[0]===d.name||a.b[0]===d.name)).forEach(a=>{const th=a.a[0]===d.name?a.b:a.a;L.push("    "+pad(ip4s(ospfRid(w,w.devs[th[0]],false)),16)+pad("110",14)+"00:01:12")});
  L.push(`  Distance: (default is 110)`);if(IOS.protoExtra)L.push(...IOS.protoExtra(w,d));return L.join("\n")}

/* ---------- switching ---------- */
function stpOut(w,d,only){if(d.kind==="router")return "No spanning tree instance exists.";
  const vl=only?[only]:Object.keys(d.vlans).map(Number);const out=[];
  vl.forEach(v=>{if(!d.vlans[v])return;const {T,out:P}=stpPorts(w,d,v);if(!T||!P.length)return;const me=IOS.bid(d,v),rt=IOS.bid(T.root,v);const isRoot=T.root===d;const rp=T.rp.get(d.name);
    const L=[`VLAN${String(v).padStart(4,"0")}`,`  Spanning tree enabled protocol ${d.stp.mode==="rapid-pvst"?"rstp":d.stp.mode==="pvst"?"ieee":"mstp"}`,`  Root ID    Priority    ${rt.p}`,`             Address     ${rt.mac}`];
    if(isRoot)L.push("             This bridge is the root");else{L.push(`             Cost        ${T.cost.get(d.name)}`,`             Port        ${(Object.keys(d.ifs).indexOf(rp.i)+1)} (${rp.i})`)}
    L.push(`             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,``,`  Bridge ID  Priority    ${me.p}  (priority ${me.p-v} sys-id-ext ${v})`,`             Address     ${me.mac}`,`             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,`             Aging Time  300 sec`,``,
      `Interface           Role Sts Cost      Prio.Nbr Type`,`------------------- ---- --- --------- -------- --------------------------------`);
    P.forEach(p=>{const nbr=Object.keys(d.ifs).indexOf(p.i.name)+1;const peerSw=peersOf(w,d.name,p.i.name).some(([pd])=>w.devs[pd]&&w.devs[pd].kind!=="router");
      L.push(pad(ifShort(p.i.name),20)+pad(p.role,5)+pad(p.st,4)+pad(p.i.stpCost||p.cost,10)+pad("128."+nbr,9)+(p.edge?"P2p Edge":"P2p")+(p.rootInc?" *ROOT_Inc":"")+(p.i.guard==="loop"&&peerSw?"":""))});
    out.push(L.join("\n"))});
  return out.join("\n\n")||"No spanning tree instance exists."}
function stpSummary(w,d){if(d.kind==="router")return INV;const roots=Object.keys(d.vlans).map(Number).filter(v=>{const T=stp(w,v);return T&&T.root===d});
  return [`Switch is in ${d.stp.mode} mode`,`Root bridge for: ${roots.length?roots.map(v=>"VLAN"+String(v).padStart(4,"0")).join(", "):"none"}`,`EtherChannel misconfig guard            is enabled`,`Extended system ID                      is enabled`,`Portfast Default                        is ${d.stp.pfDefault?"enabled":"disabled"}`,`PortFast BPDU Guard Default             is ${d.stp.bgDefault?"enabled":"disabled"}`,`Loopguard Default                       is disabled`].join("\n")}
function ecSummary(w,d){if(d.kind==="router")return INV;const L=["Flags:  D - down        P - bundled in port-channel","        I - stand-alone s - suspended","        H - Hot-standby (LACP only)","        R - Layer3      S - Layer2","        U - in use      f - failed to allocate aggregator","","        M - not in use, minimum links not met","        u - unsuitable for bundling","        w - waiting to be aggregated","        d - default port","",""];
  const pos=sortIfs(d).filter(i=>/^Port-channel/.test(i.name));L.push(`Number of channel-groups in use: ${pos.length}`,`Number of aggregators:           ${pos.length}`,"","Group  Port-channel  Protocol    Ports","------+-------------+-----------+-----------------------------------------------");
  pos.forEach(po=>{const n=+po.name.slice(12);const mem=sortIfs(d).filter(i=>i.cg&&i.cg.n===n);const up=mem.some(m=>ecMember(w,d,m)==="P");
    L.push(pad(n,7)+pad(ifShort(po.name)+"("+(po.l3?"R":"S")+(up?"U":"D")+")",14)+pad(mem[0]?ecProto(mem[0].cg.mode):"-",12)+mem.map(m=>ifShort(m.name)+"("+ecMember(w,d,m)+")").join(" "))});return L.join("\n")}
function macTable(w,d){if(d.kind==="router")return INV;const L=["          Mac Address Table","-------------------------------------------","","Vlan    Mac Address       Type        Ports","----    -----------       --------    -----"];
  sortIfs(d).forEach(i=>{if(!physUp(w,d,i))return;hostsAt(w,d.name,i.name).forEach(h=>L.push(" "+pad(h.vlan||i.sw.access,7)+pad(h.mac,18)+pad(i.ps&&(i.ps.sticky||i.ps.macs.includes(h.mac))?"STATIC":"DYNAMIC",12)+ifShort(i.name)));
    peersOf(w,d.name,i.name).forEach(([pd,pi])=>{const P=w.devs[pd];const PI=P?.ifs[pi];if(PI)L.push(" "+pad(swMode(i)==="trunk"?1:i.sw.access,7)+pad(PI.mac,18)+pad("DYNAMIC",12)+ifShort(i.cg&&ecMember(w,d,i)==="P"?"Port-channel"+i.cg.n:i.name))})});
  L.push(`Total Mac Addresses for this criterion: ${L.length-5}`);return L.join("\n")}
function cdpNbr(w,d,detail){if(!d.cdp)return "% CDP is not enabled";const L=detail?[]:["Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge","                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,","                  D - Remote, C - CVTA, M - Two-port Mac Relay","","Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID"];let n=0;
  sortIfs(d).forEach(i=>{if(!physUp(w,d,i)||!i.cdp)return;peersOf(w,d.name,i.name).forEach(([pd,pi])=>{const P=w.devs[pd];if(!P||!P.cdp||!P.ifs[pi]?.cdp)return;n++;const cap=P.kind==="router"?"R I":P.kind==="l3"?"R S I":"S I";
    if(detail){const a=Object.values(P.ifs).find(x=>x.ip!==null);L.push("-------------------------",`Device ID: ${P.host}${P.domain?"."+P.domain:""}`,`Entry address(es): `,a?`  IP address: ${ip4s(a.ip)}`:"",`Platform: cisco ${P.model},  Capabilities: ${P.kind==="router"?"Router Source-Route-Bridge":P.kind==="l3"?"Router Switch IGMP":"Switch IGMP"}`,`Interface: ${i.name},  Port ID (outgoing port): ${pi}`,`Holdtime : 157 sec`,``,`Version :`,`Cisco IOS XE Software, Version 17.09.04a`,``,`Native VLAN: ${P.ifs[pi].sw?.native??1}`,`Duplex: full`)}
    else L.push(pad(P.host,17)+pad(ifShort(i.name),18)+pad("157",11)+pad(cap,12)+pad(P.model.slice(0,9),10)+ifShort(pi))})});
  hostsAt;if(!detail)L.push("","Total cdp entries displayed : "+n);return L.filter(x=>x!=="").join("\n")}
function lldpNbr(w,d){if(!d.lldp)return "% LLDP is not enabled";const L=["Capability codes:","    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device","    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other","","Device ID           Local Intf     Hold-time  Capability      Port ID"];let n=0;
  sortIfs(d).forEach(i=>{if(!physUp(w,d,i))return;peersOf(w,d.name,i.name).forEach(([pd,pi])=>{const P=w.devs[pd];if(!P||!P.lldp)return;n++;L.push(pad(P.host,20)+pad(ifShort(i.name),15)+pad("120",11)+pad(P.kind==="router"?"R":"B,R".slice(0,P.kind==="l3"?3:1),16)+ifShort(pi))});
    hostsAt(w,d.name,i.name).filter(h=>h.lldp).forEach(h=>{n++;L.push(pad(h.name,20)+pad(ifShort(i.name),15)+pad("120",11)+pad(h.lldp,16)+h.mac)})});
  L.push("","Total entries displayed: "+n);return L.join("\n")}

/* ---------- services ---------- */
function natTrans(w,d){const rows=IOS.natRows(w,d);if(!rows.length)return "";const L=["Pro  Inside global         Inside local          Outside local         Outside global"];
  rows.forEach(r=>L.push(pad(r.pro,5)+pad(r.ig,22)+pad(r.il,22)+pad(r.ol,22)+r.og));L.push(`Total number of translations: ${rows.length}`);return L.join("\n")}
IOS.natRows=(w,d)=>{if(d.natClear&&Date.now()-d.natClear<1500)return [];const rows=[];
  d.nat.statics.forEach(s=>rows.push({pro:s.proto||"---",ig:ip4s(s.global)+(s.gport?":"+s.gport:""),il:ip4s(s.local)+(s.lport?":"+s.lport:""),ol:"---",og:"---"}));
  (w.traffic||[]).forEach((t,k)=>{const h=w.hosts.find(x=>x.name===t.from);if(!h)return;const hip=IOS.hostIp(h,w);if(hip==null)return;const g=IOS.hostGwIf(w,h);if(!g||g.d!==d||g.i.nat!=="inside")return;
    const st=d.nat.statics.find(s=>s.local===hip&&!s.proto);const dst=ip4(t.to);const r=IOS.lookup(w,d,dst,4);if(!r)return;const rs=r.via[0];const oifN=rs.oif||IOS.l3Ifs(w,d,4).find(c=>inNet(rs.nh,c.n,c.len,4))?.i.name;const oif=d.ifs[oifN];if(!oif||oif.nat!=="outside")return;
    let ig=null;if(st)ig=ip4s(st.global);else{const rule=d.nat.rules.find(ru=>{const A=d.acls[ru.acl];return A&&aclEval(A,{src:hip,dst,proto:t.proto||"tcp",port:t.port||443}).act==="permit"});if(!rule)return;
      if(rule.oif){if(!rule.overload)return;const a=ifAddr(w,d,d.ifs[rule.oif]);if(!a)return;ig=ip4s(a.n)}else{const P=d.nat.pools[rule.pool];if(!P)return;ig=ip4s(P.start)}}
    const sp=t.sport||(49152+k*17);rows.push({pro:t.proto||"tcp",ig:ig+":"+(st?sp:1024+k),il:ip4s(hip)+":"+sp,ol:t.to+":"+(t.port||443),og:t.to+":"+(t.port||443),host:h.name})});return rows};
function acls(w,d,ipOnly,only){const L=[];Object.values(d.acls).filter(A=>only==null||String(A.name)===String(only)).forEach(A=>{L.push(`${A.type==="standard"?"Standard":"Extended"} IP access list ${A.name}`);A.entries.forEach(e=>{if(e.remark)return;const m=(w.hits||{})[d.name+"|"+A.name+"|"+e.seq];L.push(`    ${e.seq} ${aceText(A,e)}${m?` (${m} match${m>1?"es":""})`:""}`)})});return L.join("\n")}
function portSec(w,d,ifn){if(d.kind==="router")return INV;
  if(ifn){const i=d.ifs[ifn];if(!i)return INV;const p=i.ps;const n=hostsAt(w,d.name,i.name).length;
    return [`Port Security              : ${p&&!p.off?"Enabled":"Disabled"}`,`Port Status                : ${i.err==="psecure-violation"?"Secure-shutdown":p&&!p.off&&physUp(w,d,i)?"Secure-up":"Secure-down"}`,`Violation Mode             : ${p?p.viol[0].toUpperCase()+p.viol.slice(1):"Shutdown"}`,`Aging Time                 : 0 mins`,`Aging Type                 : Absolute`,`SecureStatic Address Aging : Disabled`,`Maximum MAC Addresses      : ${p?p.max:1}`,`Total MAC Addresses        : ${p&&!p.off?Math.min(n,p.max)+p.macs.length*0:0}`,`Configured MAC Addresses   : ${p?p.macs.filter(()=>!p.sticky).length:0}`,`Sticky MAC Addresses       : ${p&&p.sticky?Math.min(n,p.max):0}`,`Last Source Address:Vlan   : ${n?hostsAt(w,d.name,i.name).slice(-1)[0].mac+":"+i.sw.access:"0000.0000.0000:0"}`,`Security Violation Count   : ${i.psViol||0}`].join("\n")}
  const L=["Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action","                (Count)       (Count)          (Count)","---------------------------------------------------------------------------"];
  sortIfs(d).forEach(i=>{if(!i.ps||i.ps.off)return;L.push(rpad(ifShort(i.name),11)+rpad(i.ps.max,15)+rpad(Math.min(hostsAt(w,d.name,i.name).length,i.ps.max),13)+rpad(i.psViol||0,19)+"         "+i.ps.viol[0].toUpperCase()+i.ps.viol.slice(1))});
  L.push("---------------------------------------------------------------------------");return L.join("\n")}
function dhcpBind(w,d){const L=["Bindings from all pools not associated with VRF:","IP address      Client-ID/              Lease expiration        Type       State      Interface","                Hardware address/","                User name"];
  w.hosts.filter(h=>h.dhcp).forEach(h=>{const r=IOS.dhcpFor(w,h);if(r.srv!==d)return;L.push(pad(ip4s(r.ip),16)+pad("01"+h.mac.replace(/\./g,""),24)+pad("Nov 10 2026 09:14 AM",24)+pad("Automatic",11)+pad("Active",11)+ifShort(r.gi&&IOS.deviceWithIp(w,r.gi)?.i.name||""))});
  Object.values(w.devs).forEach(D=>Object.values(D.ifs).forEach(i=>{if(i.dhcp){const L2=IOS.ifAddr(w,D,i);if(L2){const pool=IOS.poolFor(d,L2.n);if(pool)L.push(pad(ip4s(L2.n),16)+pad("0063.6973.636f",24)+pad("Nov 10 2026 09:14 AM",24)+pad("Automatic",11)+pad("Active",11)+"")}}}));
  return L.join("\n")}
function dhcpPool(w,d){return Object.entries(d.pools).map(([n,p])=>{const used=w.hosts.filter(h=>h.dhcp&&IOS.dhcpFor(w,h).srv===d&&IOS.dhcpFor(w,h).pool===p).length;return `\nPool ${n} :\n Utilization mark (high/low)    : 100 / 0\n Subnet size (first/next)       : 0 / 0 \n Total addresses                : ${p.net!=null?2**(32-p.len)-2:0}\n Leased addresses               : ${used}\n Excluded addresses             : ${d.excl.length}\n Pending event                  : none\n 1 subnet is currently in the pool :\n Current index        IP address range                    Leased/Excluded/Total\n ${p.net!=null?pad(ip4s(p.net+1n),21)+pad(ip4s(p.net+1n)+"     - "+ip4s(p.net+(1n<<BigInt(32-p.len))-2n),36)+used+" / "+d.excl.length+" / "+(2**(32-p.len)-2):"(no network configured)"}`}).join("\n")}
function snoopOut(w,d){if(d.kind==="router")return INV;const L=[`Switch DHCP snooping is ${d.snoop.on?"enabled":"disabled"}`,`Switch DHCP gleaning is disabled`,`DHCP snooping is configured on following VLANs:`,d.snoop.vlans.join(",")||"none",`DHCP snooping is operational on following VLANs:`,d.snoop.on?d.snoop.vlans.join(",")||"none":"none",`Insertion of option 82 is ${d.snoop.opt82?"enabled":"disabled"}`,``,`Interface                  Trusted    Allow option    Rate limit (pps)`,`-----------------------    -------    ------------    ----------------   `];
  sortIfs(d).forEach(i=>{if(i.snoopTrust||i.snoopRate)L.push(pad(i.name,27)+pad(i.snoopTrust?"yes":"no",11)+pad(i.snoopTrust?"yes":"no",16)+(i.snoopRate||"unlimited"))});return L.join("\n")}
function snoopBind(w,d){if(d.kind==="router")return INV;const L=["MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface","------------------  ---------------  ----------  -------------  ----  --------------------"];let n=0;
  if(d.snoop.on)w.hosts.forEach(h=>{if(!h.dhcp||!h.at)return;const [sv,sp]=h.at.split(":");if(sv!==d.name)return;const I=d.ifs[IOS.ifName(sp)||sp]||d.ifs[sp];const v=h.vlan||(I&&I.sw.access)||1;if(!d.snoop.vlans.some(x=>listHas(x,v)))return;const L2=IOS.dhcpFor(w,h);if(L2.ip==null)return;n++;
    L.push(pad(h.mac.replace(/\./g,"").toUpperCase().match(/../g).join(":"),20)+pad(ip4s(L2.ip),17)+pad("86391",12)+pad("dhcp-snooping",15)+pad(String(v),6)+(I?I.name:sp))});
  L.push("Total number of bindings: "+n);return L.join("\n")}
function daiOut(w,d){if(d.kind==="router")return INV;const L=["","Source Mac Validation      : Disabled","Destination Mac Validation : Disabled","IP Address Validation      : Disabled","","Vlan     Configuration    Operation   ACL Match          Static ACL","----     -------------    ---------   ---------          ----------"];
  d.dai.forEach(v=>L.push(pad(" "+v,9)+pad("Enabled",17)+pad("Active",12)));L.push("","Interface        Trust State     Rate (pps)    Burst Interval","---------------  -----------     ----------    --------------");sortIfs(d).forEach(i=>{if(/^(Vlan|Loop)/.test(i.name)||i.l3)return;L.push(pad(ifShort(i.name),17)+pad(i.daiTrust?"Trusted":"Untrusted",16)+pad(i.daiTrust?"None":"15",14)+"1")});return L.join("\n")}
function fhrpOut(w,d,kind){const G=fhrp(w,kind);const L=kind==="hsrp"?["                     P indicates configured to preempt.","                     |","Interface   Grp  Pri P State   Active          Standby         Virtual IP"]:["Interface          Grp Fam Owner Pri Time Pre State   Master addr/Group addr"];
  Object.values(G).forEach(M=>M.filter(x=>x.d===d).forEach(x=>{if(kind==="hsrp")L.push(pad(ifShort(x.i.name),12)+pad(x.g,5)+rpad(x.pri,3)+" "+(x.c.preempt?"P":" ")+" "+pad(x.state,8)+pad(x.active?(x.active===x?"local":ip4s(x.active.i.ip)):"unknown",16)+pad(x.standby?(x.standby===x?"local":ip4s(x.standby.i.ip)):"unknown",16)+(x.vip!=null?ip4s(x.vip):"unknown"));
    else L.push(pad(ifShort(x.i.name),19)+pad(x.g,4)+pad("IPv4",5)+pad(x.i.ip===x.vip?"Y":"N",6)+pad(x.pri,4)+pad("3609",5)+pad(x.preempt?"Y":"N",4)+pad(x.state,8)+(x.active?ip4s(x.active.i.ip):"0.0.0.0")+"/"+(x.vip!=null?ip4s(x.vip):"0.0.0.0"))}));return L.join("\n")}
function arpOut(w,d){const L=["Protocol  Address          Age (min)  Hardware Addr   Type   Interface"];
  sortIfs(d).forEach(i=>{if(!i.l3||i.ip===null||!IOS.physUp(w,d,i))return;L.push(pad("Internet",10)+pad(ip4s(i.ip),17)+pad("-",11)+pad(i.mac,16)+pad("ARPA",7)+i.name);
    peersOf(w,d.name,i.name.split(".")[0]).forEach(([pd,pi])=>{const P=w.devs[pd];Object.values(P?.ifs||{}).filter(x=>(x.name===pi||x.name.startsWith(pi+"."))&&x.ip!==null&&(i.ip!==null&&inNet(x.ip,i.ip,i.len,4))).forEach(x=>L.push(pad("Internet",10)+pad(ip4s(x.ip),17)+pad("2",11)+pad(x.mac,16)+pad("ARPA",7)+i.name))});
    w.hosts.forEach(h=>{const g=IOS.hostGwIf(w,h);const hip=IOS.hostIp(h,w);if(g&&g.d===d&&g.i===i&&hip!=null)L.push(pad("Internet",10)+pad(ip4s(hip),17)+pad("4",11)+pad(h.mac,16)+pad("ARPA",7)+i.name)})});return L.join("\n")}
function versionOut(w,d){return `Cisco IOS XE Software, Version 17.09.04a\nCisco IOS Software [Cupertino], ${d.kind==="router"?"ISR":"Catalyst L3 Switch"} Software (${d.kind==="router"?"X86_64_LINUX_IOSD-UNIVERSALK9-M":"CAT9K_IOSXE"}), Version 17.9.4a, RELEASE SOFTWARE (fc3)\nTechnical Support: http://www.cisco.com/techsupport\nCopyright (c) 1986-2023 by Cisco Systems, Inc.\n\nROM: IOS-XE ROMMON\n\n${d.host} uptime is 2 weeks, 3 days, 4 hours, 11 minutes\nUptime for this control processor is 2 weeks, 3 days, 4 hours, 13 minutes\nSystem returned to ROM by Reload Command\nSystem image file is "bootflash:${d.kind==="router"?"isr4300-universalk9.17.09.04a.SPA.bin":"cat9k_iosxe.17.09.04a.SPA.bin"}"\n\ncisco ${d.model} (${d.kind==="router"?"1RU":"ARM64"}) processor with 1795979K/6147K bytes of memory.\nProcessor board ID FDO2213A0RR\n${Object.keys(d.ifs).filter(n=>/^Gig/.test(n)).length} Gigabit Ethernet interfaces\n32768K bytes of non-volatile configuration memory.\n8388608K bytes of physical memory.\n\nConfiguration register is 0x2102`}
IOS.dirOut=()=>`Directory of bootflash:/\n\n   11  drwx            16384  Oct 12 2026 08:02:11 +00:00  lost+found\n   12  -rw-        562344816  Oct 12 2026 08:14:52 +00:00  isr4300-universalk9.17.09.04a.SPA.bin\n   13  -rw-             4207  Nov 09 2026 07:41:03 +00:00  pnp-tech-time\n   14  -rw-            11983  Nov 09 2026 07:41:09 +00:00  backup-config\n\n7194652672 bytes total (6455320576 bytes free)`;
function sshOut(d){return d.rsa&&d.sshv!==1?`SSH Enabled - version ${d.sshv===2?"2.0":"1.99"}\nAuthentication methods:publickey,keyboard-interactive,password\nAuthentication timeout: 120 secs; Authentication retries: 3\nMinimum expected Diffie Hellman key size : 2048 bits\nIOS Keys in SECSH format(ssh-rsa, base64 encoded): ${d.host}.${d.domain}\nModulus Size : ${d.rsa} bits`:"SSH Disabled - version 1.99\n%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2)."}
function loggingOut(w,d){const L=[`Syslog logging: enabled (0 messages dropped, 0 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)`,``,`    Console logging: level debugging, 41 messages logged, xml disabled,`,`                     filtering disabled`,`    Monitor logging: level debugging, 0 messages logged, xml disabled,`,`    Buffer logging:  ${d.logging.buffered?"level debugging, 41 messages logged":"disabled"}, xml disabled,`,`    Trap logging: level ${["emergencies","alerts","critical","errors","warnings","notifications","informational","debugging"][d.logging.trap??6]}, 44 message lines logged`];
  d.logging.hosts.forEach(h=>L.push(`        Logging to ${ip4s(h)}  (udp port 514, audit disabled,`,`              link up),`,`              44 message lines logged, `));
  if(d.logging.buffered||w.syslog){L.push("","Log Buffer (8192 bytes):","");(w.syslog?.[d.name]||[]).forEach(m=>L.push(m))}return L.join("\n")}

/* ---------- register show commands ---------- */
const S=(pat,fn,o)=>C("exec","show "+pat,fn,o);
S("running-config",(d,a,o)=>runningConfig(o.x.w,d),{priv:1});
S("running-config interface <if>",(d,a,o)=>runningConfig(o.x.w,d,a[0]),{priv:1});
S("startup-config",(d)=>d.saved||"startup-config is not present",{priv:1});
S("ip interface brief",(d,a,o)=>ipBrief(o.x.w,d));
S("ipv6 interface brief",(d,a,o)=>v6Brief(o.x.w,d));
S("interfaces",(d,a,o)=>sortIfs(d).map(i=>ifDetail(o.x.w,d,i)).join("\n"));
S("interfaces <if>",(d,a,o)=>{const i=d.ifs[a[0]];return i?ifDetail(o.x.w,d,i):INV});
S("interfaces status",(d,a,o)=>d.kind==="router"?INV:ifStatus(o.x.w,d));
S("interfaces status err-disabled",(d,a,o)=>d.kind==="router"?INV:"\nPort         Name               Status       Reason               Err-disabled Vlans\n"+sortIfs(d).filter(i=>i.err).map(i=>pad(ifShort(i.name),13)+pad(i.desc.slice(0,18),19)+pad("err-disabled",13)+i.err).join("\n"));
S("interfaces trunk",(d,a,o)=>d.kind==="router"?INV:trunks(o.x.w,d));
S("interfaces <if> switchport",(d,a,o)=>{const i=d.ifs[a[0]];return i&&d.kind!=="router"?swDetail(o.x.w,d,i):INV});
S("interfaces switchport",(d,a,o)=>d.kind==="router"?INV:sortIfs(d).filter(i=>!/^(Vlan|Loop)/.test(i.name)).map(i=>swDetail(o.x.w,d,i)).join("\n\n"));
S("ip interface <if>",(d,a,o)=>{const i=d.ifs[a[0]];if(!i)return INV;const [s,p]=ifState(o.x.w,d,i);const ad=ifAddr(o.x.w,d,i);return `${i.name} is ${s}, line protocol is ${p}\n  ${ad?`Internet address is ${ip4s(ad.n)}/${ad.len}`:"Internet protocol processing disabled"}\n  Broadcast address is 255.255.255.255\n  Helper address ${i.helper.length?"is "+i.helper.map(ip4s).join(", "):"is not set"}\n  Outgoing Common access list is not set \n  Outgoing access list is ${i.acl.out||"not set"}\n  Inbound Common access list is not set \n  Inbound  access list is ${i.acl.in||"not set"}\n  Proxy ARP is enabled\n  IP fast switching is enabled\n  Network address translation is ${i.nat?"enabled, interface in domain "+i.nat:"disabled"}`});
S("ipv6 interface <if>",(d,a,o)=>{const i=d.ifs[a[0]];if(!i)return INV;const [s,p]=ifState(o.x.w,d,i);const A=v6Addrs(d,i);if(!A.length)return `${i.name} is ${s}, line protocol is ${p}\n  IPv6 is not enabled`;
  return [`${i.name} is ${s}, line protocol is ${p}`,`  IPv6 is enabled, link-local address is ${ip6s(A[0].n)} `,`  No Virtual link-local address(es):`,`  Global unicast address(es):`,...A.slice(1).map(x=>`    ${ip6s(x.n)}, subnet is ${ip6s(pfx(x.n,x.len,6))}/${x.len}${x.eui?" [EUI]":""}`),`  Joined group address(es):`,`    FF02::1`,...(o.x.d.v6Routing?["    FF02::2"]:[]),...A.map(x=>`    FF02::1:FF${ip6s(x.n&0xffffffn).replace(/^::/,"").slice(-7).padStart(7,"0").replace(/^(.{2})/,"$1:").replace(/^0+(?=.)/,"").toUpperCase()}`),`  MTU is 1500 bytes`,`  ND DAD is enabled, number of DAD attempts: 1`,`  ND reachable time is 30000 milliseconds (using 30000)`].join("\n")});
S("vlan",(d,a,o)=>vlanBrief(o.x.w,d,true));S("vlan brief",(d,a,o)=>vlanBrief(o.x.w,d));
S("ip route",(d,a,o)=>showRoute(o.x.w,d));S("ip route static",(d,a,o)=>showRoute(o.x.w,d,"static"));S("ip route ospf",(d,a,o)=>showRoute(o.x.w,d,"ospf"));S("ip route connected",(d,a,o)=>showRoute(o.x.w,d,"connected"));
S("ip route <ip>",(d,a,o)=>routeEntry(o.x.w,d,a[0]));
S("ipv6 route",(d,a,o)=>showRoute6(o.x.w,d));
S("ip ospf neighbor",(d,a,o)=>ospfNbr(o.x.w,d,false));S("ipv6 ospf neighbor",(d,a,o)=>ospfNbr(o.x.w,d,true));
S("ip ospf interface brief",(d,a,o)=>ospfIfBrief(o.x.w,d,false));S("ipv6 ospf interface brief",(d,a,o)=>ospfIfBrief(o.x.w,d,true));
S("ip ospf interface <if>",(d,a,o)=>{const i=d.ifs[a[0]];return i?ospfIf(o.x.w,d,i):INV});
S("ip ospf interface",(d,a,o)=>sortIfs(d).filter(i=>ospfIfCfg(o.x.w,d,i,false)).map(i=>ospfIf(o.x.w,d,i)).join("\n"));
S("ip ospf",(d,a,o)=>ospfProc(o.x.w,d));S("ip protocols",(d,a,o)=>protocols(o.x.w,d));
S("spanning-tree",(d,a,o)=>stpOut(o.x.w,d));S("spanning-tree vlan <n>",(d,a,o)=>stpOut(o.x.w,d,a[0]));S("spanning-tree summary",(d,a,o)=>stpSummary(o.x.w,d));
S("etherchannel summary",(d,a,o)=>ecSummary(o.x.w,d));
S("mac address-table",(d,a,o)=>macTable(o.x.w,d));S("mac address-table dynamic",(d,a,o)=>macTable(o.x.w,d));
S("cdp neighbors",(d,a,o)=>cdpNbr(o.x.w,d));S("cdp neighbors detail",(d,a,o)=>cdpNbr(o.x.w,d,true));S("cdp",(d)=>d.cdp?"Global CDP information:\n\tSending CDP packets every 60 seconds\n\tSending a holdtime value of 180 seconds\n\tSending CDPv2 advertisements is  enabled":"% CDP is not enabled");
S("lldp neighbors",(d,a,o)=>lldpNbr(o.x.w,d));S("lldp",(d)=>d.lldp?"Global LLDP Information:\n    Status: ACTIVE\n    LLDP advertisements are sent every 30 seconds\n    LLDP hold time advertised is 120 seconds":"% LLDP is not enabled");
S("ip nat translations",(d,a,o)=>natTrans(o.x.w,d));
S("ip nat statistics",(d,a,o)=>{const ins=Object.values(d.ifs).filter(i=>i.nat==="inside").map(i=>i.name),out=Object.values(d.ifs).filter(i=>i.nat==="outside").map(i=>i.name);return `Total active translations: ${IOS.natRows(o.x.w,d).length}\nOutside interfaces:\n  ${out.join(", ")||"none"}\nInside interfaces: \n  ${ins.join(", ")||"none"}\nDynamic mappings:\n`+d.nat.rules.map(r=>`-- Inside Source\n[Id: 1] access-list ${r.acl} ${r.oif?"interface "+r.oif:"pool "+r.pool} refcount ${IOS.natRows(o.x.w,d).length}`).join("\n")});
S("access-lists",(d,a,o)=>acls(o.x.w,d));S("ip access-lists",(d,a,o)=>acls(o.x.w,d,true));S("access-lists <w>",(d,a,o)=>acls(o.x.w,d,false,a[0]));S("ip access-lists <w>",(d,a,o)=>acls(o.x.w,d,true,a[0]));
S("port-security",(d,a,o)=>portSec(o.x.w,d));S("port-security interface <if>",(d,a,o)=>portSec(o.x.w,d,a[0]));
S("ip dhcp binding",(d,a,o)=>dhcpBind(o.x.w,d));S("ip dhcp pool",(d,a,o)=>dhcpPool(o.x.w,d));
S("ip dhcp snooping",(d,a,o)=>snoopOut(o.x.w,d));S("ip dhcp snooping binding",(d,a,o)=>snoopBind(o.x.w,d));S("ip arp inspection",(d,a,o)=>daiOut(o.x.w,d));
S("standby brief",(d,a,o)=>fhrpOut(o.x.w,d,"hsrp"));S("vrrp brief",(d,a,o)=>fhrpOut(o.x.w,d,"vrrp"));
S("ip arp",(d,a,o)=>arpOut(o.x.w,d));S("arp",(d,a,o)=>arpOut(o.x.w,d));
S("version",(d,a,o)=>versionOut(o.x.w,d));S("clock",()=>"*"+new Date().toUTCString().slice(17,25)+".512 UTC "+new Date().toUTCString().slice(0,16));
S("users",(d)=>"    Line       User       Host(s)              Idle       Location\n*  0 con 0                idle                 00:00:00   \n\n  Interface    User               Mode         Idle     Peer Address");
S("history",(d,a,o)=>o.x.hist.slice(-10).map(h=>"  "+h).join("\n"));
S("flash:",()=>IOS.dirOut());S("ip ssh",(d)=>sshOut(d));S("ssh",(d)=>d.rsa?"%No SSHv2 server connections running.":"%No SSH server connections running.");
S("logging",(d,a,o)=>loggingOut(o.x.w,d));
S("ntp associations old",(d)=>d.ntp.length?"\n  address         ref clock       st   when   poll reach  delay  offset   disp\n"+d.ntp.map(n=>`*~${pad(ip4s(n),16)}${pad(".GPS.",16)}1     41     64   377  1.012  -0.204  0.947`).join("\n")+"\n * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured":"");
S("snmp community",(d)=>d.snmp.comm.map(c=>`\nCommunity name: ${c.name}\nCommunity Index: ${c.name}\nCommunity SecurityName: ${c.name}\nstorage-type: nonvolatile        active${c.acl?" access-list: "+c.acl:""}`).join("\n"));
S("snmp user",(d)=>d.snmp.v3.map(u=>`\nUser name: ${u.u}\nEngine ID: 800000090300${d.macBase.replace(/\./g,"").toUpperCase()}\nstorage-type: nonvolatile        active\nAuthentication Protocol: SHA\nPrivacy Protocol: AES128\nGroup-name: ${u.g}`).join("\n"));
S("aaa servers",(d)=>[...Object.entries(d.tacacs).map(([n,t])=>`TACACS+ Server - public:\n  Server name: ${n}\n  Server address: ${t.addr!=null?ip4s(t.addr):"none"}\n  Server port: 49\n  Server status: Active`),...Object.entries(d.radius).map(([n,t])=>`RADIUS: id 1, priority 1, host ${t.addr!=null?ip4s(t.addr):"none"}, auth-port 1812, acct-port 1813, hostname ${n}\n     State: current UP, duration 1204s, previous duration 0s`)].join("\n\n")||"");
S("power inline",(d,a,o)=>{if(d.kind==="router")return INV;const L=["Module   Available     Used     Remaining","          (Watts)     (Watts)    (Watts) ","------   ---------   --------   ---------","1           370.0       "+String((o.x.w.hosts.filter(h=>h.poe&&h.at.startsWith(d.name+":")).reduce((s,h)=>s+h.poe,0)).toFixed(1)).padStart(5)+"       ---","Interface Admin  Oper       Power   Device              Class Max","                           (Watts)                            ","--------- ------ ---------- ------- ------------------- ----- ----"];
  sortIfs(d).forEach(i=>{if(/^(Vlan|Loop|Port)/.test(i.name))return;const h=hostsAt(o.x.w,d.name,i.name).find(x=>x.poe);const on=h&&i.poe!=="never"&&physUp(o.x.w,d,i);L.push(pad(ifShort(i.name),10)+pad(i.poe,7)+pad(on?"on":"off",11)+rpad(on?h.poe.toFixed(1):"0.0",7)+" "+pad(on?h.name:"n/a",20)+pad(on?h.poeClass||"4":"n/a",6)+"30.0")});return L.join("\n")});
S("storm-control",(d)=>d.kind==="router"?INV:"Interface  Filter State   Upper        Lower        Current\n---------  -------------  -----------  -----------  ----------\n"+sortIfs(d).filter(i=>i.storm).map(i=>pad(ifShort(i.name),11)+pad("Forwarding",15)+pad(i.storm.level+"%",13)+pad(i.storm.level+"%",13)+"0.00%").join("\n"));
S("ipv6 nd raguard policy",(d)=>Object.entries(d.raPol).map(([n,p])=>`Policy ${n} configuration: \n  device-role ${p.role}\nPolicy ${n} is applied on the following targets: \nTarget               Type  Policy               Feature        Target range\n`+Object.values(d.ifs).filter(i=>i.raPolicy===n).map(i=>pad(ifShort(i.name),21)+pad("PORT",6)+pad(n,21)+pad("RA guard",15)+"vlan all").join("\n")).join("\n\n"));

/* ---------- ping and traceroute output ---------- */
IOS.pingOut=(x,n,f,o)=>{const w=x.w,d=x.d;const cnt=o.n||5,sz=o.size||100;
  const r=IOS.ping(w,{dev:d},n,f,{src:o.src});const a=IOS.addrS(n,f);
  const head=`Type escape sequence to abort.\nSending ${cnt}, ${sz}-byte ICMP Echos to ${a}, timeout is 2 seconds:`+(o.src!=null?`\nPacket sent with a source address of ${IOS.addrS(o.src,f)} `:"");
  const key=d.name+">"+a;x.arp=x.arp||{};let marks,ok;
  if(r.ok){const first=!x.arp[key]&&r.hops&&r.hops.length;x.arp[key]=1;ok=first?cnt-1:cnt;marks=(first?".":"")+"!".repeat(ok)}
  else if(r.acl){marks=Array.from({length:cnt},(_,k)=>k%2?".":"U").join("");ok=0}
  else if(r.noroute&&r.at===d){marks=".".repeat(cnt);ok=0}else{marks=".".repeat(cnt);ok=0}
  const pct=Math.round(ok/cnt*100);let rt="";if(ok)rt=`, round-trip min/avg/max = 1/${1+(r.hops?.length||0)}/${2+(r.hops?.length||0)*2} ms`;
  marks=marks.match(/.{1,70}/g).join("\n");
  x.lastPing={n,ok:r.ok,why:r.why};
  return `${head}\n${marks}\nSuccess rate is ${pct} percent (${ok}/${cnt})${rt}`};
IOS.traceOut=(x,n,f)=>{const w=x.w,d=x.d;const a=IOS.addrS(n,f);const r=IOS.forward(w,d,n,f,{src:null});
  const L=[`Type escape sequence to abort.`,`Tracing the route to ${a}`,`VRF info: (vrf in name/id, vrf out name/id)`];
  let k=1;(r.hops||[]).forEach((h,idx)=>{const isLast=idx===r.hops.length-1&&r.ok;if(idx===r.hops.length-1&&r.ok){L.push(`  ${k++} ${a} ${1+idx} msec ${1+idx} msec ${2+idx} msec`)}else if(h.nh!==n)L.push(`  ${k++} ${IOS.addrS(h.nh,f)} ${1+idx} msec ${1+idx} msec ${1+idx} msec`)});
  if(!r.ok){for(let j=0;j<3;j++)L.push(`  ${k++}  *  *  * `);L.push("(trace stopped by the simulator after 3 silent hops)")}
  else if(!r.hops||!r.hops.length)L.push(`  1 ${a} 1 msec 0 msec 1 msec`);
  x.lastTrace={n,ok:r.ok};return L.join("\n")};
IOS.copyFile=(x,src,dst)=>{const d=x.d;const s=src.toLowerCase(),t=dst.toLowerCase();
  const m=/^(scp|sftp|tftp|ftp):(?:\/\/(?:([^@\/]+)@)?([^\/]+)\/(.+))?$/i.exec(t)||/^(scp|sftp|tftp|ftp):(?:\/\/(?:([^@\/]+)@)?([^\/]+)\/(.+))?$/i.exec(s);
  const isRun=x2=>"running-config".startsWith(x2)&&x2.length>2||x2==="system:running-config";
  if(!m)return isRun(s)&&(t==="startup-config"||t==="nvram:startup-config")?(x.pend={kind:"copyrs",prompt:"Destination filename [startup-config]? "},""):"%Error parsing filename (Invalid argument)";
  const proto=m[1].toLowerCase(),user=m[2],host=m[3],file=m[4];const up=t.startsWith(proto);
  if(!host){x.pend={kind:"copynet",proto,up,step:0,src,dst,prompt:"Address or name of remote host []? ",v:{}};return ""}
  return IOS.doCopy(x,proto,up,user,host,file,src)};
IOS.doCopy=(x,proto,up,user,host,file,src)=>{const d=x.d;const n=ip4(host);
  if(n===null)return "%Error opening "+proto+"://"+host+" (Unknown host)";
  const r=IOS.ping(x.w,{dev:d},n,4,{proto:proto==="tftp"?"udp":"tcp",port:proto==="tftp"?69:22});
  if(!r.ok)return `%Error opening ${proto}://${user?user+"@":""}${host}/${file} (Timed out)`;
  if((proto==="scp"||proto==="sftp")&&!user)return `%Error opening ${proto}://${host}/${file} (No username specified)`;
  const srv=(x.w.hosts||[]).find(h=>h.ip===n);if(srv&&srv.services&&!srv.services.includes(proto))return `%Error opening ${proto}://${user?user+"@":""}${host}/${file} (Connection refused by remote host)`;
  (x.w.transfers=x.w.transfers||[]).push({dev:d.name,proto,host,file,up,user});
  const sz=up?(IOS.runningConfig(x.w,d).length):562344816;
  return `Address or name of remote host [${host}]? \n${user?`Destination username [${user}]? \n`:""}Destination filename [${file}]? \n${proto==="scp"?"Sending file modes: C0644 "+sz+" "+file+"\n":""}${up?"Writing "+file+" !":"Accessing "+proto+"://"+host+"/"+file+"...\nLoading "+file+" !!!!!!!!!!!!!!!!!!!!"}\n${sz} bytes copied in ${up?"0.512":"94.208"} secs (${Math.round(sz/(up?0.512:94.208))} bytes/sec)`};

/* ---------- pending prompts (enable password, confirms, extended ping) ---------- */
IOS.answer=(x,ans)=>{const p=x.pend;x.pend=null;const d=x.d;
  switch(p.kind){
    case "enable":{const ok=d.secret?ans===d.secret:ans===d.enablePw;if(ok){x.mode="priv";return ""}x.tries=(x.tries||0)+1;if(x.tries<3){x.pend=p;return ""}x.tries=0;return "% Bad secrets\n"}
    case "conft":{if(!ans||"terminal".startsWith(ans.toLowerCase())){x.mode="config";return "Enter configuration commands, one per line.  End with CNTL/Z."}return "?Must be \"terminal\", \"memory\" or \"network\""}
    case "copyrs":d.saved=IOS.runningConfig(x.w,d);x.flags.saved=1;return "Building configuration...\n[OK]";
    case "erase":if(ans===""||/^y/i.test(ans)){d.saved=null;return "[OK]\nErase of nvram: complete"}return "";
    case "reload":x.flags.reload=1;if(typeof flag==="function")flag("reload");return "% Reload aborted. The simulator keeps your configuration in memory, so nothing was lost.";
    case "clearospf":if(/^y/i.test(ans)){[d.ospf,d.ospf6].forEach(q=>{if(q)q.activeRid=null});return ""}return "";
    case "yesno":return "";
    case "rsa":{const b=ans===""?2048:+ans;if(!(b>=512&&b<=4096))return "% You must specify a value between 512 and 4096.";d.rsa=b;return `% Generating ${b} bit RSA keys, keys will be non-exportable...\n[OK] (elapsed time was 1 seconds)\n\n%SSH-5-ENABLED: SSH 1.99 has been enabled`}
    case "banner":{const e=ans.indexOf(p.dl);if(e<0){p.text+=(p.text?"\n":"")+ans;p.prompt="";x.pend=p;return ""}d.banner=(p.text?p.text+"\n":"")+ans.slice(0,e);return ""}
    case "copynet":{const st=["host","user","file"];if(p.step===0){p.v.host=ans;p.step=1;if(p.proto==="tftp"){p.step=2;p.prompt=`Destination filename [${d.host.toLowerCase()}-confg]? `}else p.prompt="Destination username []? ";x.pend=p;return ""}
      if(p.step===1){p.v.user=ans;p.step=2;p.prompt=`Destination filename [${d.host.toLowerCase()}-confg]? `;x.pend=p;return ""}
      p.v.file=ans||d.host.toLowerCase()+"-confg";if(p.proto!=="tftp"){p.step=3;p.prompt="Password: ";p.hide=true;p.kind="copynetpw";x.pend=p;return ""}
      return IOS.doCopy(x,p.proto,p.up,null,p.v.host,p.v.file,p.src).split("\n").slice(2).join("\n")}
    case "copynetpw":return IOS.doCopy(x,p.proto,p.up,p.v.user,p.v.host,p.v.file,p.src).split("\n").slice(3).join("\n");
    case "xping":{const v=p.v;const steps=[["proto","Target IP address: "],["target","Repeat count [5]: "],["repeat","Datagram size [100]: "],["size","Timeout in seconds [2]: "],["timeout","Extended commands [n]: "],["ext",null]];
      const k=steps[p.step][0];v[k]=ans;
      if(k==="proto"&&ans&&!"ip".startsWith(ans.toLowerCase())&&!"ipv6".startsWith(ans.toLowerCase()))return "% Unknown protocol - \""+ans+"\", type \"ping ?\" for help";
      if(k==="target"&&ip4(ans)===null)return "% Bad IP address or host name";
      if(k==="ext"&&/^y/i.test(ans)){p.kind="xping2";p.step=0;p.prompt="Source address or interface: ";x.pend=p;return ""}
      if(k!=="ext"){p.step++;p.prompt=steps[p.step-1][1];x.pend=p;return ""}
      return IOS.pingOut(x,ip4(v.target),4,{n:+v.repeat||5,size:+v.size||100})}
    case "xping2":{const v=p.v;let src=ip4(ans);if(src===null&&ans){const n=IOS.ifName(ans);const i=n&&d.ifs[n];if(!i||i.ip===null)return "% Invalid source address- IP address not on any of our up interfaces";src=i.ip}
      if(p.step===0){v.src=src;p.step=1;p.prompt="Type of service [0]: ";x.pend=p;return ""}
      if(p.step===1){p.step=2;p.prompt="Set DF bit in IP header? [no]: ";x.pend=p;return ""}
      if(p.step===2){v.df=/^y/i.test(ans);p.step=3;p.prompt="Validate reply data? [no]: ";x.pend=p;return ""}
      if(p.step===3){p.step=4;p.prompt="Data pattern [0x0000ABCD]: ";x.pend=p;return ""}
      if(p.step===4){p.step=5;p.prompt="Loose, Strict, Record, Timestamp, Verbose[none]: ";x.pend=p;return ""}
      if(p.step===5){p.step=6;p.prompt="Sweep range of sizes [n]: ";x.pend=p;return ""}
      x.flags.xping=1;return IOS.pingOut(x,ip4(v.target),4,{n:+v.repeat||5,size:+v.size||100,src:v.src??undefined})}
  }return ""};

/* ---------- events: syslog messages after each command ---------- */
function snap(w,d){const s={ifs:{},adj:new Set(),adj6:new Set(),err:{}};Object.values(d.ifs).forEach(i=>{s.ifs[i.name]=ifState(w,d,i).join("/");s.err[i.name]=i.err});
  ospfAdj(w,false).filter(a=>a.state==="FULL"&&(a.a[0]===d.name||a.b[0]===d.name)).forEach(a=>{const th=a.a[0]===d.name?a.b:a.a,me=a.a[0]===d.name?a.a:a.b;s.adj.add(me[1]+"|"+ip4s(ospfRid(w,w.devs[th[0]],false))+"|"+th[0])});
  ospfAdj(w,true).filter(a=>a.state==="FULL"&&(a.a[0]===d.name||a.b[0]===d.name)).forEach(a=>{const th=a.a[0]===d.name?a.b:a.a,me=a.a[0]===d.name?a.a:a.b;s.adj6.add(me[1]+"|"+ip4s(ospfRid(w,w.devs[th[0]],true)))});
  s.hsrp=Object.values(fhrp(w,"hsrp")).flat().filter(x=>x.d===d).map(x=>x.i.name+"|"+x.g+"|"+x.state);
  s.vrrp=Object.values(fhrp(w,"vrrp")).flat().filter(x=>x.d===d).map(x=>x.i.name+"|"+x.g+"|"+x.state);
  s.trk=Object.keys(d.tracks).map(k=>k+"|"+(IOS.trackUp(w,d,+k)?"Up":"Down"));
  s.bgp=IOS.bgpPeers?IOS.bgpPeers(w,d).map(p=>ip4s(p.nip)+"|"+p.state):[];
  s.ntp=IOS.ntpState?String(IOS.ntpState(w,d).synced):"";return s}
/* apply automatic state changes (BPDU guard, port security) */
function settle(w){w.ver=(w.ver||0)+1;if(IOS.dtp)IOS.dtp(w);const out=[];Object.values(w.devs).forEach(d=>{if(d.kind==="router")return;Object.values(d.ifs).forEach(i=>{if(i.err||i.shut||i.l3)return;
    const pe=peersOf(w,d.name,i.name);const peerSw=pe.some(([pd])=>w.devs[pd]&&w.devs[pd].kind!=="router"&&!w.devs[pd].ifs[pd===d.name?"":pe[0][1]]?.shut);
    const bg=i.bg||(d.stp.bgDefault&&(i.pf||(d.stp.pfDefault&&swMode(i)==="access"))&&!i.bgOff);
    if(bg&&peerSw&&pe.some(([pd,pi])=>{const P=w.devs[pd];const PI=P.ifs[pi];return PI&&!PI.shut})){i.err="bpduguard";out.push([d,`%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port ${i.name} with BPDU Guard enabled. Disabling port.`,`%PM-4-ERR_DISABLE: bpduguard error detected on ${ifShort(i.name)}, putting ${ifShort(i.name)} in err-disable state`]);return}
    if(i.ps&&!i.ps.off){const H=hostsAt(w,d.name,i.name);const allowed=new Set(i.ps.macs);const learned=[];H.forEach(h=>{if(allowed.has(h.mac))return;if(allowed.size<i.ps.max){allowed.add(h.mac);learned.push(h)}else learned.push({bad:h})});
      if(i.ps.sticky)learned.filter(l=>!l.bad).forEach(l=>{if(!i.ps.macs.includes(l.mac))i.ps.macs.push(l.mac)});
      const bad=learned.filter(l=>l.bad);if(bad.length){i.psViol=(i.psViol||0)+1;const m=`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${bad[0].bad.mac} on port ${i.name}.`;
        if(i.ps.viol==="shutdown"){i.err="psecure-violation";out.push([d,`%PM-4-ERR_DISABLE: psecure-violation error detected on ${ifShort(i.name)}, putting ${ifShort(i.name)} in err-disable state`,m])}else if(!i.psLogged){i.psLogged=1;if(i.ps.viol==="restrict")out.push([d,m])}}}})});return out}
function diff(w,d,a,b){const L=[];
  Object.keys(b.ifs).forEach(n=>{const x=a.ifs[n],y=b.ifs[n];if(x===y||!x)return;const [s1,p1]=x.split("/"),[s2,p2]=y.split("/");
    if(s1!==s2)L.push(`%LINK-${s2==="up"?3:5}-UPDOWN: Interface ${n}, changed state to ${s2}`);if(p1!==p2)L.push(`%LINEPROTO-5-UPDOWN: Line protocol on Interface ${n}, changed state to ${p2}`)});
  b.adj.forEach(k=>{if(!a.adj.has(k)){const [i,r]=k.split("|");L.push(`%OSPF-5-ADJCHG: Process ${d.ospf?.pid||1}, Nbr ${r} on ${i} from LOADING to FULL, Loading Done`)}});
  a.adj.forEach(k=>{if(!b.adj.has(k)){const [i,r]=k.split("|");L.push(`%OSPF-5-ADJCHG: Process ${d.ospf?.pid||1}, Nbr ${r} on ${i} from FULL to DOWN, Neighbor Down: Interface down or detached`)}});
  b.adj6.forEach(k=>{if(!a.adj6.has(k)){const [i,r]=k.split("|");L.push(`%OSPFv3-5-ADJCHG: Process ${d.ospf6?.pid||1}, IPv6, Nbr ${r} on ${i} from LOADING to FULL, Loading Done`)}});
  b.hsrp.forEach(k=>{if(!a.hsrp.includes(k)){const [i,g,s]=k.split("|");const prev=a.hsrp.find(z=>z.startsWith(i+"|"+g+"|"));L.push(`%HSRP-5-STATECHANGE: ${i} Grp ${g} state ${prev?prev.split("|")[2]:"Speak"} -> ${s}`)}});
  (b.vrrp||[]).forEach(k=>{if(!(a.vrrp||[]).includes(k)){const [i,g,s]=k.split("|");const prev=(a.vrrp||[]).find(z=>z.startsWith(i+"|"+g+"|"));L.push(`%VRRP-6-STATE: ${ifShort(i)} IPv4 group ${g} state ${prev?prev.split("|")[2]:"Init"} -> ${s}`)}});
  (b.trk||[]).forEach(k=>{if(!(a.trk||[]).includes(k)){const [t,st]=k.split("|");const T=d.tracks[t];const what=T.type==="sla"?`ip sla ${T.sla} ${T.mode||"reachability"}`:`interface ${ifShort(T.if)} line-protocol`;L.push(`%TRACK-6-STATE: ${t} ${what} ${st==="Up"?"Down -> Up":"Up -> Down"}`)}});
  (b.bgp||[]).forEach(k=>{const [ip,st]=k.split("|");const prev=(a.bgp||[]).find(z=>z.startsWith(ip+"|"));const was=prev?prev.split("|")[1]:"Idle";if(st==="Established"&&was!=="Established")L.push(`%BGP-5-ADJCHANGE: neighbor ${ip} Up `);if(st!=="Established"&&was==="Established")L.push(`%BGP-5-ADJCHANGE: neighbor ${ip} Down ${st==="Idle (Admin)"?"Admin. shutdown":"Peer closed the session"}`)});
  if(a.ntp==="false"&&b.ntp==="true")L.push(`%NTP-5-PEERSYNC: NTP synced to peer ${IOS.ntpState(w,d).peer||""}`);
  return L}
IOS.snap=snap;IOS.diff=diff;IOS.settle=settle;
})();
