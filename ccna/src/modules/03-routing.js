/* ================= Module 3: IP Routing (200-301 v2.0 Domain 3.0, 20%) ================= */
(function(){
const LESSONS=[
{id:"table",num:"3.1",title:"Reading the routing table",html:`
<p>Every routing decision comes from the routing table. <code>show ip route</code> lists every route the router knows, and each line has the same parts:</p>
<pre class="term">R1# show ip route
Codes: L - local, C - connected, S - static, O - OSPF, E2 - OSPF external type 2, * - candidate default
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.12.2
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0/0
L        10.0.12.1/32 is directly connected, GigabitEthernet0/0/0
O        10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:07, GigabitEthernet0/0/0
S        10.9.0.0/16 [1/0] via 10.0.12.2</pre>
<div class="viz" id="viz-rtparts"></div>
<ul><li><b>Routing protocol code</b>: how the route was learned. <b>C</b> connected and <b>L</b> local (the router's own address, as a /32) appear automatically for every up interface with an address.</li>
<li><b>Prefix and network mask</b>: the destination network, like 10.2.2.0/24.</li>
<li><b>Next hop</b>: the neighbor router's address to send packets to.</li>
<li><b>Administrative distance</b> and <b>metric</b> in brackets: <code>[110/2]</code> means AD 110 (OSPF) and an OSPF cost of 2.</li>
<li><b>Gateway of last resort</b>: the default route used when nothing more specific matches. Without one, unmatched packets are dropped.</li></ul>
<h3>Administrative distance</h3>
<p>When two sources offer a route to the <b>same prefix</b>, the router trusts the one with the lower AD:</p>
<div class="viz" id="viz-ad"></div>`},
{id:"lpm",num:"3.2",title:"How a router picks a route",html:`
<p>A router makes its forwarding decision in this order:</p>
<ol><li><b>Longest prefix match.</b> Among every route that contains the destination, the most specific (longest prefix) wins. A /32 beats a /24, which beats a /16, which beats the /0 default. This comes first, before AD or metric.</li>
<li><b>Administrative distance.</b> Only matters when two sources offer the <b>same prefix and length</b>. Only the lowest-AD route gets into the table.</li>
<li><b>Metric.</b> Within one routing protocol, the lowest metric wins. Equal metrics are installed together for <b>equal-cost multipath</b> (ECMP) load sharing.</li></ol>
<div class="viz" id="viz-lpm"></div>
<div class="tip"><b>Exam trap.</b> A question shows an OSPF /24 and a static /16 for a destination inside both. The static has the better AD, but the /24 is more specific, so the OSPF route is used. AD never beats prefix length.</div>`},
{id:"static",num:"3.3",title:"Static routes for IPv4 and IPv6",html:`
<p>A static route is typed in by hand. It's predictable and uses no bandwidth, but doesn't adapt to failures unless you plan for it.</p>
<table><tr><th>Type</th><th>IPv4 example</th><th>Use</th></tr>
<tr><td>Default</td><td><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code></td><td>Send everything unknown to the ISP</td></tr>
<tr><td>Network</td><td><code>ip route 10.20.0.0 255.255.0.0 10.0.12.2</code></td><td>Reach a specific remote network</td></tr>
<tr><td>Host</td><td><code>ip route 10.20.5.5 255.255.255.255 10.0.13.2</code></td><td>Steer one device's traffic a particular way</td></tr>
<tr><td>Floating</td><td><code>ip route 0.0.0.0 0.0.0.0 198.51.100.1 10</code></td><td>Backup with a higher AD, used only if the primary disappears</td></tr></table>
<p>You can give a <b>next-hop IP</b> (recursive lookup), an <b>exit interface</b> (only sensible on point-to-point links), or both (<b>fully specified</b>). IPv6 works the same way with <code>ipv6 route</code>, after <code>ipv6 unicast-routing</code>:</p>
<pre class="term">R1(config)# ipv6 route ::/0 2001:db8:f::2
R1(config)# ipv6 route 2001:db8:20::/64 2001:db8:12::2
R1(config)# ipv6 route ::/0 g0/0/1 fe80::2 10</pre>
<p>When the next hop is a link-local address, the exit interface is required, because every link has the same FE80::/10 range.</p>
<div class="viz" id="viz-staticmini"></div>
<h3>Floating static routes</h3>
<p>A floating static has an AD set higher than the primary route, so it "floats" out of the table. When the primary's next hop becomes unreachable (the interface goes down), the primary is removed and the floating route takes over.</p>
<div class="viz" id="viz-float"></div>
<div class="tip"><b>Watch out.</b> A static route stays in the table as long as its exit interface is up. If the ISP fails somewhere beyond the first hop, the interface stays up and the floating route never kicks in. IP SLA tracking fixes that, but it's beyond the CCNA.</div>`},
{id:"ospf",num:"3.4",title:"OSPF concepts: neighbors, LSAs and areas",html:`
<p><b>OSPF</b> (Open Shortest Path First) is a <b>link-state</b> interior gateway protocol. Every router floods descriptions of its links (<b>LSAs</b>) to the others, so all routers in an area build an identical map, the <b>LSDB</b>. Each then runs Dijkstra's <b>SPF algorithm</b> to find its own shortest path to every network.</p>
<ul><li>OSPF runs directly on IP as <b>protocol 89</b>. Hellos go to multicast <b>224.0.0.5</b> (all OSPF routers); updates to the DR go to <b>224.0.0.6</b>.</li>
<li><b>Hello</b> packets find neighbors and keep them alive: every 10 seconds by default on Ethernet, with a <b>dead interval</b> of 40.</li>
<li>Its metric is <b>cost</b>, based on bandwidth. Its AD is <b>110</b>.</li></ul>
<h3>Neighbor states</h3>
<div class="viz" id="viz-ostates"></div>
<h3>What must match to become neighbors</h3>
<p>Same <b>subnet and mask</b> on the link, same <b>area</b>, same <b>hello and dead timers</b>, same authentication, compatible <b>network type</b>, matching MTU (or they stall in ExStart), and <b>unique router IDs</b>. The interface must not be passive.</p>
<h3>Router ID</h3>
<p>Each router needs a unique 32-bit router ID, chosen in this order: the <code>router-id</code> command; else the highest IPv4 address on an up <b>loopback</b>; else the highest IPv4 address on any up interface. It's picked when the process starts, so a change needs <code>clear ip ospf process</code>.</p>
<div class="viz" id="viz-rid"></div>
<h3>Areas</h3>
<p>Big OSPF networks split into <b>areas</b> so that SPF runs and LSA floods stay local. Every area connects to the <b>backbone, area 0</b>. A router with interfaces in two areas is an <b>ABR</b>; one that brings in external routes (like a default from a static) is an <b>ASBR</b>. The CCNA focuses on <b>single-area OSPFv2</b>: everything in area 0.</p>`},
{id:"dr",num:"3.5",title:"Network types, DR/BDR election and cost",html:`
<h3>Network types</h3>
<ul><li><b>Broadcast</b> (the default on Ethernet): elects a <b>DR</b> and <b>BDR</b>. Hello 10, dead 40.</li>
<li><b>Point-to-point</b> (the default on serial links; set on Ethernet with <code>ip ospf network point-to-point</code>): no DR election, so two routers on a /30 or /31 become FULL faster.</li></ul>
<h3>DR and BDR</h3>
<p>On a shared segment, every router becoming FULL with every other would mean many adjacencies and duplicated floods. Instead, everyone becomes FULL only with the <b>designated router</b> and the <b>backup</b>. The rest stay in <b>2-WAY</b> with each other, and show as DROTHER.</p>
<ol><li>Highest <b>interface priority</b> wins (default 1, range 0–255). Priority <b>0</b> means never DR or BDR.</li>
<li>Tie: highest <b>router ID</b>.</li>
<li>The election is <b>not preemptive</b>. A better router that joins later doesn't take over until the DR fails or the process is cleared.</li></ol>
<div class="viz" id="viz-dr"></div>
<h3>Cost</h3>
<p>OSPF cost = <b>reference bandwidth ÷ interface bandwidth</b>. The default reference is 100 Mbps, so Fast Ethernet, Gigabit and 10 Gigabit all cost <b>1</b>, which makes faster links look no better. Fix it on <b>every</b> router with <code>auto-cost reference-bandwidth 100000</code> (100 Gbps), or set a cost directly with <code>ip ospf cost</code>. A path's cost is the sum of the outgoing interface costs along it.</p>
<div class="viz" id="viz-cost"></div>`},
{id:"ospfcfg",num:"3.6",title:"Configuring and verifying OSPFv2 and OSPFv3",html:`
<h3>Two ways to enable OSPFv2 on interfaces</h3>
<pre class="term">R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 10.0.12.0 0.0.0.3 area 0
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# passive-interface g0/0/2
R1(config-router)# default-information originate

! or, per interface:
R1(config)# interface g0/0/0
R1(config-if)# ip ospf 1 area 0</pre>
<ul><li>The <code>network</code> statement uses a <b>wildcard mask</b> to match interface addresses. Any interface whose address matches joins that area. <code>network 10.0.12.1 0.0.0.0 area 0</code> matches exactly one interface.</li>
<li><b>Passive interface</b>: the network is still advertised, but no hellos are sent, so no neighbor forms there. Use it on LAN ports facing users.</li>
<li><b>default-information originate</b>: if this router has a default route, it advertises it into OSPF. Other routers see it as <b>O*E2</b>.</li>
<li>The process ID is local and doesn't have to match between routers. The area does.</li></ul>
<div class="viz" id="viz-ospfmini"></div>
<h3>Verification</h3>
<table><tr><th>Command</th><th>Shows</th></tr>
<tr><td><code>show ip ospf neighbor</code></td><td>Neighbor RIDs, state (FULL/DR, 2WAY/DROTHER) and the interface</td></tr>
<tr><td><code>show ip ospf interface brief</code></td><td>Which interfaces run OSPF, area, cost, state and neighbor count</td></tr>
<tr><td><code>show ip ospf interface g0/0/0</code></td><td>Timers, network type, priority, DR and BDR</td></tr>
<tr><td><code>show ip protocols</code></td><td>Router ID, networks, passive interfaces</td></tr>
<tr><td><code>show ip route ospf</code></td><td>Routes learned from OSPF</td></tr></table>
<div class="viz" id="viz-adjfix"></div>
<h3>OSPFv3 for IPv6</h3>
<p>OSPFv3 works the same way but is enabled on interfaces, not with network statements. It still uses a 32-bit router ID, so a router with no IPv4 addresses needs <code>router-id</code> set by hand. Neighbors talk using link-local addresses, and the multicast groups are FF02::5 and FF02::6.</p>
<pre class="term">R1(config)# ipv6 unicast-routing
R1(config)# ipv6 router ospf 1
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# interface g0/0/0
R1(config-if)# ipv6 ospf 1 area 0
R1# show ipv6 ospf neighbor
R1# show ipv6 route ospf</pre>`},
{id:"fhrp",num:"3.7",title:"First hop redundancy: HSRP and VRRP",html:`
<p>Hosts have one default gateway. If that router fails, they're stranded even if a second router sits on the same LAN. A <b>first hop redundancy protocol</b> lets two or more routers share a <b>virtual IP</b> (and virtual MAC) that hosts use as their gateway. One router is <b>active</b> and answers for the virtual IP; the others watch and take over if it stops sending hellos.</p>
<table><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (RFC 5798)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / Standby</td><td>Master / Backup</td><td>AVG / AVFs</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (v1), 0000.0c9f.fXXX (v2)</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Preemption</td><td>Off by default</td><td>On by default</td><td>Off by default</td></tr>
<tr><td>Load balancing</td><td>Per group</td><td>Per group</td><td>Built in, per host</td></tr></table>
<pre class="term">R1(config)# interface g0/0/1
R1(config-if)# standby version 2
R1(config-if)# standby 10 ip 192.168.10.254
R1(config-if)# standby 10 priority 110
R1(config-if)# standby 10 preempt
R1# show standby brief</pre>
<p>Highest <b>priority</b> wins (default 100); a tie goes to the highest interface IP. Without <b>preempt</b>, a recovered higher-priority router won't take back the active role.</p>
<div class="viz" id="viz-fhrp"></div>
<div class="viz" id="viz-fhrpcmp"></div>`}
];

const G={
 table:[["Code C","Directly connected network"],["Code L","Local: the router's own interface address as a /32"],["Code S","Static route"],["Code O","OSPF intra-area route"],["Code O E2","OSPF external type 2 route (such as a redistributed default)"],["Asterisk (*) in the table","Candidate default route"],["Gateway of last resort","The default route's next hop"],["[110/2]","AD 110, metric 2"],["AD connected","0"],["AD static","1"],["AD eBGP","20"],["AD EIGRP (internal)","90"],["AD OSPF","110"],["AD RIP","120"],["AD iBGP","200"],["AD 255","Unknown source: never installed"],["show ip route","Displays the IPv4 routing table"],["show ip route 10.2.2.5","Shows which route matches that one address"]],
 lpm:[["First rule of route selection","Longest prefix match"],["Second rule","Lowest administrative distance (same prefix only)"],["Third rule","Lowest metric (within one protocol)"],["ECMP","Equal-cost routes installed together and shared"],["Does AD beat a longer prefix?","No. Prefix length always comes first"],["Most specific possible IPv4 route","/32 host route"],["Least specific route","0.0.0.0/0 default route"]],
 static:[["IPv4 default static route","ip route 0.0.0.0 0.0.0.0 next-hop"],["IPv6 default static route","ipv6 route ::/0 next-hop"],["Host route mask","255.255.255.255 (/32)"],["Floating static route","Static with a higher AD that's used only if the primary fails"],["Set AD on a static route","Add the number at the end: ip route ... 10"],["Recursive static route","Uses a next-hop IP; the router looks up how to reach it"],["Fully specified static route","Exit interface plus next-hop IP"],["When the exit interface is required for IPv6","When the next hop is a link-local address"],["When a static route leaves the table","When its exit interface or next hop becomes unreachable"],["show ip route static","Shows only static routes"]],
 ospf:[["OSPF type","Link-state interior gateway protocol"],["OSPF IP protocol number","89"],["AllSPFRouters multicast","224.0.0.5 (FF02::5 for OSPFv3)"],["AllDRouters multicast","224.0.0.6 (FF02::6)"],["Default hello and dead on Ethernet","10 and 40 seconds"],["LSA","Link-state advertisement: a router's description of its links"],["LSDB","Link-state database: identical in every router in an area"],["SPF","Dijkstra's algorithm that computes shortest paths"],["Neighbor states in order","Down, Init, 2-Way, ExStart, Exchange, Loading, Full"],["Stuck in ExStart/Exchange","Usually an MTU mismatch"],["Router ID order","router-id command, highest loopback IP, highest active interface IP"],["Apply a new router ID","clear ip ospf process"],["Backbone area","Area 0"],["ABR","Area border router: interfaces in two or more areas"],["ASBR","Router that injects external routes into OSPF"],["What must match for adjacency","Subnet, area, hello/dead, authentication, network type, MTU; unique RIDs"]],
 dr:[["Broadcast network type","Default on Ethernet: elects a DR and BDR"],["Point-to-point network type","No DR election; faster on two-router links"],["DR election first criterion","Highest interface priority"],["DR election tiebreaker","Highest router ID"],["Default OSPF priority","1"],["Priority 0","Never becomes DR or BDR"],["Is DR election preemptive?","No"],["DROTHER to DROTHER state","2-WAY"],["DROTHER to DR state","FULL"],["OSPF cost formula","Reference bandwidth / interface bandwidth"],["Default reference bandwidth","100 Mbps"],["Cost of a 1 Gbps link by default","1"],["auto-cost reference-bandwidth","Changes the reference (in Mbps); set it the same everywhere"],["ip ospf cost","Sets an interface's cost directly"]],
 ospfcfg:[["Start OSPF process 1","router ospf 1"],["network 10.0.12.0 0.0.0.3 area 0","Enables OSPF on interfaces in 10.0.12.0/30"],["Enable OSPF on one interface directly","ip ospf 1 area 0"],["passive-interface","Advertises the network but sends no hellos"],["default-information originate","Advertises this router's default route into OSPF"],["Does the process ID have to match?","No, it's locally significant"],["show ip ospf neighbor","Neighbor RID, priority, state and interface"],["show ip ospf interface brief","OSPF interfaces with area, cost and state"],["show ip protocols","Router ID, networks and passive interfaces"],["OSPFv3 interface command","ipv6 ospf 1 area 0"],["OSPFv3 router ID","Still 32 bits; set by hand if there's no IPv4 address"],["OSPFv3 neighbor addresses","Link-local"]],
 fhrp:[["FHRP purpose","Gives hosts a gateway that survives a router failure"],["HSRP roles","Active and Standby"],["VRRP roles","Master and Backup"],["GLBP feature","Load balances across routers for one virtual IP"],["HSRP default priority","100"],["HSRP tiebreaker","Highest interface IP"],["HSRP preemption default","Off"],["VRRP preemption default","On"],["HSRPv1 virtual MAC","0000.0c07.acXX"],["HSRPv2 virtual MAC","0000.0c9f.fXXX"],["VRRP virtual MAC","0000.5e00.01XX"],["Open-standard FHRP","VRRP"],["show standby brief","HSRP group, priority, state, active, standby and virtual IP"],["What hosts use as their gateway","The virtual IP"]]
};
const DECKS=[["table","Routing table"],["lpm","Route selection"],["static","Static routes"],["ospf","OSPF concepts"],["dr","DR, BDR and cost"],["ospfcfg","OSPF configuration"],["fhrp","FHRP"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"In 'O 10.2.2.0/24 [110/3] via 10.0.12.2', what is 3?",o:["The OSPF cost","The administrative distance","The hop count","The age"],a:0,e:"The bracket is [AD/metric]."},
 {q:"What does the L code mean in show ip route?",o:["The router's own interface address as a /32","A link-state route","A LAN route","A loopback interface"],a:0,e:"Local routes are created for each interface address."},
 {q:"What's the AD of OSPF?",o:["110","90","120","1"],a:0,e:"OSPF is 110."},
 {q:"What's the AD of a static route by default?",o:["1","0","5","110"],a:0,e:"Statics default to 1."},
 {q:"A router learns 10.5.0.0/16 from OSPF and from a static route. Which is installed?",o:["The static (AD 1)","The OSPF route (AD 110)","Both","Neither"],a:0,e:"Same prefix and length, so the lower AD wins."},
 {q:"Which AD makes a route never get used?",o:["255","0","200","120"],a:0,e:"255 means untrusted."},
 {q:"Which has the lowest AD?",o:["eBGP","OSPF","RIP","EIGRP"],a:0,e:"eBGP 20, EIGRP 90, OSPF 110, RIP 120."},
 {q:"What happens to a packet when there's no matching route and no gateway of last resort?",o:["It's dropped and an ICMP unreachable may be sent","It's flooded","It's sent to the first route","It's held until a route appears"],a:0,e:"Routers drop unroutable packets."},
 {q:"Routes: 10.0.0.0/8 via A (static), 10.1.0.0/16 via B (OSPF), 10.1.1.0/24 via C (OSPF). Where does traffic to 10.1.1.7 go?",o:["C","A","B","Split across all"],a:0,e:"Longest prefix match: /24."},
 {q:"Routes: 0.0.0.0/0 via A, 172.16.0.0/12 via B. Where does traffic to 172.31.5.5 go?",o:["B","A","Both","Dropped"],a:0,e:"172.31.5.5 is inside 172.16.0.0/12."},
 {q:"Routes: 192.168.0.0/16 via A (static), 192.168.4.0/22 via B (OSPF). Traffic to 192.168.8.1 goes where?",o:["A","B","Dropped","Both"],a:0,e:"192.168.4.0/22 covers .4 to .7 only."},
 {q:"OSPF learns two paths to 10.9.9.0/24, both with cost 20. What does the router do?",o:["Installs both and load-shares","Uses the newest","Uses the lowest next-hop IP","Drops both"],a:0,e:"Equal-cost multipath."},
 {q:"Which command creates an IPv4 default route through 203.0.113.1?",o:["ip route 0.0.0.0 0.0.0.0 203.0.113.1","ip default-route 203.0.113.1","ip route 0.0.0.0 255.255.255.255 203.0.113.1","route default 203.0.113.1"],a:0,e:"Network 0.0.0.0 with mask 0.0.0.0."},
 {q:"Which command makes a backup default route through 198.51.100.1 that's used only if the primary fails?",o:["ip route 0.0.0.0 0.0.0.0 198.51.100.1 10","ip route 0.0.0.0 0.0.0.0 198.51.100.1 0","ip route 0.0.0.0 0.0.0.0 198.51.100.1 backup","ip backup-route 198.51.100.1"],a:0,e:"A higher AD than the primary (1) makes it float."},
 {q:"Which is a host route?",o:["ip route 10.1.1.10 255.255.255.255 10.0.0.2","ip route 10.1.1.0 255.255.255.0 10.0.0.2","ip route 0.0.0.0 0.0.0.0 10.0.0.2","ip route 10.0.0.0 255.0.0.0 10.0.0.2"],a:0,e:"A /32 mask."},
 {q:"Which command is required before configuring IPv6 static routes that forward traffic?",o:["ipv6 unicast-routing","ipv6 enable","ip routing","ipv6 cef"],a:0,e:"IPv6 routing is off by default."},
 {q:"Which IPv6 static route needs an exit interface?",o:["One whose next hop is fe80::2","One whose next hop is 2001:db8::2","A default route","Every IPv6 route"],a:0,e:"Link-local next hops are ambiguous without the interface."},
 {q:"What's the IPv6 default route prefix?",o:["::/0","::/128","FE80::/10","FF00::/8"],a:0,e:"::/0 matches everything."},
 {q:"A primary default static route uses next hop 10.0.1.2 out G0/0/0. The ISP's router two hops away fails but G0/0/0 stays up. What happens to the floating static?",o:["Nothing: the primary stays in the table","It takes over","Both are used","The router reloads"],a:0,e:"The primary is only removed when the next hop becomes unreachable locally."},
 {q:"What type of routing protocol is OSPF?",o:["Link-state","Distance-vector","Path-vector","Hybrid"],a:0,e:"OSPF floods LSAs and runs SPF."},
 {q:"Which multicast address do OSPFv2 hellos use?",o:["224.0.0.5","224.0.0.6","224.0.0.9","224.0.0.10"],a:0,e:"All OSPF routers."},
 {q:"In which state are two OSPF routers fully synchronized?",o:["Full","2-Way","ExStart","Loading"],a:0,e:"Full means their databases match."},
 {q:"Two OSPF neighbors are stuck in ExStart. What's the most likely cause?",o:["MTU mismatch","Area mismatch","Duplicate RID","Passive interface"],a:0,e:"Database description packets fail on MTU mismatch."},
 {q:"Which mismatch prevents OSPF neighbors from forming?",o:["Different hello intervals","Different process IDs","Different router IDs","Different interface descriptions"],a:0,e:"Timers must match. Process IDs are local."},
 {q:"A router has Loopback0 10.255.0.1, G0/0/0 192.168.50.1 and no router-id command. What's its OSPF RID?",o:["10.255.0.1","192.168.50.1","0.0.0.0","1.1.1.1"],a:0,e:"A loopback is preferred over physical interfaces."},
 {q:"You change the OSPF router-id. Nothing changes. What else do you need?",o:["clear ip ospf process","Reload","no router ospf","copy run start"],a:0,e:"The RID is chosen when the process starts."},
 {q:"What's the OSPF backbone area?",o:["Area 0","Area 1","Area 255","Any area"],a:0,e:"All areas connect to area 0."},
 {q:"A router has interfaces in area 0 and area 10. What is it?",o:["ABR","ASBR","DR","Backbone router only"],a:0,e:"Area border router."},
 {q:"What's the OSPF network type on an Ethernet interface by default?",o:["Broadcast","Point-to-point","Non-broadcast","Point-to-multipoint"],a:0,e:"Broadcast, which elects a DR."},
 {q:"Four routers on a LAN all have priority 1. RIDs are 1.1.1.1, 2.2.2.2, 3.3.3.3, 4.4.4.4, and all start together. Which is DR?",o:["4.4.4.4","1.1.1.1","3.3.3.3","None"],a:0,e:"Highest RID wins on a priority tie."},
 {q:"Which priority keeps a router from ever becoming DR?",o:["0","1","255","100"],a:0,e:"Priority 0 opts out."},
 {q:"A router with priority 200 joins a LAN where the DR has priority 1. What happens?",o:["The existing DR keeps its role","The new router becomes DR immediately","A new election runs","Both become DR"],a:0,e:"DR election isn't preemptive."},
 {q:"Two DROTHER routers on the same LAN show which state with each other?",o:["2WAY","FULL","EXSTART","INIT"],a:0,e:"Only the DR and BDR go FULL with everyone."},
 {q:"Which command avoids a DR election on a two-router Ethernet link?",o:["ip ospf network point-to-point","ip ospf priority 255","passive-interface","ip ospf cost 1"],a:0,e:"Point-to-point networks don't elect a DR."},
 {q:"With the default reference bandwidth, what's the cost of a 10 Gbps interface?",o:["1","10","0","2"],a:0,e:"100 Mbps / 10,000 Mbps rounds up to 1."},
 {q:"After 'auto-cost reference-bandwidth 10000', what's the cost of a 1 Gbps link?",o:["10","1","100","4"],a:0,e:"10,000 / 1,000 = 10."},
 {q:"Why should auto-cost reference-bandwidth be the same on every router?",o:["Otherwise costs are inconsistent and paths can be suboptimal","Otherwise neighbors don't form","It's required for DR election","It changes the RID"],a:0,e:"Mismatched references distort cost but don't break adjacency."},
 {q:"Which network statement enables OSPF only on the interface with 10.0.12.1?",o:["network 10.0.12.1 0.0.0.0 area 0","network 10.0.12.0 255.255.255.252 area 0","network 10.0.12.1 255.255.255.255 area 0","network 10.0.0.0 0.255.255.255 area 0"],a:0,e:"A wildcard of 0.0.0.0 matches one address."},
 {q:"What does passive-interface g0/0/2 do in OSPF?",o:["Stops hellos on G0/0/2 but still advertises its network","Removes G0/0/2's network from OSPF","Shuts G0/0/2","Makes G0/0/2 the DR"],a:0,e:"No neighbors form there, but the subnet is still advertised."},
 {q:"How do other OSPF routers see a default route advertised with default-information originate?",o:["O*E2 0.0.0.0/0","O 0.0.0.0/0","S* 0.0.0.0/0","C 0.0.0.0/0"],a:0,e:"It's an external type 2 candidate default."},
 {q:"Which command enables OSPF directly on an interface?",o:["ip ospf 1 area 0","ospf enable area 0","network area 0","router ospf 1 area 0"],a:0,e:"Interface mode: ip ospf process area."},
 {q:"Which command shows OSPF neighbors and their state?",o:["show ip ospf neighbor","show ip protocols","show ip route","show ip ospf database"],a:0,e:"State and DR role are listed per neighbor."},
 {q:"Which command lists passive interfaces and the router ID?",o:["show ip protocols","show ip ospf neighbor","show ip interface brief","show running-config interface"],a:0,e:"show ip protocols summarizes the routing process."},
 {q:"What do OSPF process IDs on neighboring routers need to do?",o:["Nothing: they can differ","Match exactly","Be lower than 100","Equal the area number"],a:0,e:"The process ID is locally significant."},
 {q:"Why must an IPv6-only router have router-id configured for OSPFv3?",o:["The router ID is still a 32-bit value and there's no IPv4 address to take it from","OSPFv3 doesn't use router IDs","IPv6 addresses are too long","It's optional"],a:0,e:"No IPv4 address means no automatic RID."},
 {q:"Which addresses do OSPFv3 neighbors use to talk to each other?",o:["Link-local","Global unicast","Unique local","Multicast only"],a:0,e:"OSPFv3 uses FE80:: addresses as source and next hop."},
 {q:"Which command enables OSPFv3 process 1 in area 0 on an interface?",o:["ipv6 ospf 1 area 0","ospfv3 enable area 0","ipv6 router ospf 1 area 0","network ::/0 area 0"],a:0,e:"It's set per interface."},
 {q:"What problem does an FHRP solve?",o:["Hosts lose their gateway when one router fails","Routing loops","Slow OSPF convergence","VLAN hopping"],a:0,e:"It provides a shared virtual gateway."},
 {q:"Which FHRP is an open standard?",o:["VRRP","HSRP","GLBP","CARP only"],a:0,e:"VRRP is RFC 5798."},
 {q:"Two HSRP routers: R1 priority 110, R2 priority 100, neither has preempt. R2 became active while R1 rebooted. What happens when R1 is back?",o:["R2 stays active","R1 takes over immediately","Both become active","HSRP stops"],a:0,e:"Without preempt, the higher priority router doesn't take over."},
 {q:"What default gateway should hosts use with HSRP?",o:["The virtual IP","The active router's real IP","The standby router's IP","Any router's IP"],a:0,e:"The virtual IP follows whichever router is active."},
 {q:"What's the default HSRP priority?",o:["100","1","110","255"],a:0,e:"Default 100."},
 {q:"Which FHRP load balances across several routers using one virtual IP?",o:["GLBP","HSRP","VRRP","OSPF"],a:0,e:"GLBP hands out different virtual MACs."},
 {q:"Which command shows HSRP status?",o:["show standby brief","show vrrp","show hsrp","show ip ospf"],a:0,e:"show standby brief lists each group's state."},
 {q:"What's the VRRP router that forwards traffic called?",o:["Master","Active","Primary","AVG"],a:0,e:"VRRP uses master and backup."}
];

registerModule({
  id:"rt",slug:"routing",title:"IP Routing",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["rtparts","ad","lpm","staticmini","float","ostates","rid","dr","cost","ospfmini","adjfix","fhrp","fhrpcmp"],
  viz(){
revealViz($("#viz-rtparts"),{title:"Take apart one route: O 10.2.2.0/24 [110/2] via 10.0.12.2, 00:14:07, Gi0/0/0",cols:4,done:"Explored every part of a route",items:[
  ["O","code","How the route was learned: O is OSPF intra-area. Others: C connected, L local, S static, O E2 OSPF external, D EIGRP, B BGP, R RIP."],
  ["10.2.2.0/24","prefix","The destination network and mask. The router uses this for the longest prefix match."],
  ["110","AD","Administrative distance: how trusted the source is. OSPF is 110. Only used to pick between sources offering the same prefix."],
  ["2","metric","OSPF cost to reach the network: the sum of outgoing interface costs along the path. Lower is better within OSPF."],
  ["via 10.0.12.2","next hop","The neighbor to send packets to. The router must already know how to reach it, usually through a connected route."],
  ["00:14:07","age","How long ago the route was learned. A route that keeps resetting means the network is flapping."],
  ["Gi0/0/0","exit","The outgoing interface toward the next hop."],
  ["Gateway of last resort","default","Shown at the top. The default route's next hop, used when nothing else matches."]]});
revealViz($("#viz-ad"),{title:"Administrative distance: lower is more trusted",cols:4,done:"Learned the AD values",items:[
  ["Connected","0","An interface the router is plugged into. Nothing beats it."],["Static","1","Configured by hand, so trusted almost as much as connected."],["eBGP","20","Routes from another autonomous system."],["EIGRP","90","Cisco's advanced distance-vector protocol (internal routes)."],
  ["OSPF","110","The CCNA's main routing protocol."],["RIP","120","An old distance-vector protocol using hop count."],["iBGP","200","BGP routes from inside the same autonomous system."],["Unknown","255","Not trusted at all: never installed."]]});

/* ---- longest prefix match ---- */
(function(){
  const el=$("#viz-lpm");const toN=s=>s.split(".").reduce((a,o)=>a*256+ +o,0);
  const RT=[["S*","0.0.0.0",0,"1/0","203.0.113.1"],["O","10.0.0.0",8,"110/20","10.0.12.2"],["S","10.1.0.0",16,"1/0","10.0.13.2"],["O","10.1.1.0",24,"110/3","10.0.12.2"],["O","10.1.1.128",25,"110/4","10.0.14.2"],["S","10.1.1.200",32,"1/0","10.0.13.2"],["O","172.16.0.0",12,"110/12","10.0.14.2"]];
  const tried=new Set();
  el.innerHTML=`<div class="viz-title">Longest prefix match: where does the packet go?</div><label class="rf"><span>Destination IP</span><input class="lpm-in mono" value="10.1.1.77" inputmode="decimal" autocomplete="off"></label><div class="chips">${["10.1.1.77","10.1.1.200","10.1.1.150","10.1.9.9","10.200.0.1","172.20.1.1","8.8.8.8"].map(x=>`<button class="chip mono" data-ip="${x}">${x}</button>`).join("")}</div><div class="viz-scroll"><table class="rt"></table></div><div class="caption" aria-live="polite"></div><div class="rv-prog s-small"></div>`;
  function draw(){const v=$(".lpm-in",el).value.trim();const ok=/^\d{1,3}(\.\d{1,3}){3}$/.test(v)&&v.split(".").every(o=>+o<256);const n=ok?toN(v):null;
    const hit=RT.map(r=>ok&&Math.floor(n/2**(32-r[2]))===Math.floor(toN(r[1])/2**(32-r[2])));let win=-1;hit.forEach((h,i)=>{if(h&&(win<0||RT[i][2]>RT[win][2]))win=i});
    $(".rt",el).innerHTML=`<tr><th>Code</th><th>Prefix</th><th>[AD/metric]</th><th>Next hop</th></tr>`+RT.map((r,i)=>`<tr class="${i===win?"win":hit[i]?"hit":""}"><td>${r[0]}</td><td class="mono">${r[1]}/${r[2]}</td><td class="mono">[${r[3]}]</td><td class="mono">${r[4]}</td></tr>`).join("");
    if(!ok){$(".caption",el).textContent="Type a valid IPv4 address.";return}
    tried.add(win);const matches=hit.filter(Boolean).length;
    $(".caption",el).innerHTML=`${matches} route${matches>1?"s":""} contain ${v}. The longest prefix is <b>/${RT[win][2]}</b>, so the packet goes to <b class="mono">${RT[win][4]}</b>.${win===0?" Nothing more specific matched, so the default route catches it.":""}${matches>2?" AD and metric were never considered: the prefixes were all different lengths.":""}`;
    $(".rv-prog",el).textContent=`${tried.size} of ${RT.length} routes have won`;if(tried.size>=5)award("viz:lpm",30,"Mastered longest prefix match")}
  el.addEventListener("input",e=>{if(e.target.matches(".lpm-in"))draw()});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-ip]");if(!b)return;$(".lpm-in",el).value=b.dataset.ip;draw()});draw();
})();
iosViz($("#viz-staticmini"),{title:"Mini lab: static routes on a branch router",scenario:"BR1 connects to HQ over G0/0/0 (HQ is 10.0.12.1) and to the internet over G0/0/1 (ISP is 203.0.113.1). HQ's networks are in 10.10.0.0/16.",
  devices:[{name:"BR1",kind:"router"},{name:"HQ",kind:"router"},{name:"ISP",kind:"router"}],links:[["BR1:g0/0/0","HQ:g0/0/0"],["BR1:g0/0/1","ISP:g0/0/0"]],
  boot:{BR1:["interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 203.0.113.2 255.255.255.252","no shutdown"],HQ:["interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","interface loopback0","ip address 10.10.1.1 255.255.255.0","ip route 0.0.0.0 0.0.0.0 10.0.12.2"],ISP:["interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255","ip route 10.0.0.0 255.0.0.0 203.0.113.2"]},
  consoles:["BR1"],startMode:"priv",topo:{HQ:[100,70],BR1:[300,70],ISP:[500,70]},topoH:140,
  tasks:[{t:"Route 10.10.0.0/16 to HQ",hint:"configure terminal\nip route 10.10.0.0 255.255.0.0 10.0.12.1",check:(w,D)=>D.BR1.routes.some(r=>r.n===IOS.ip4("10.10.0.0")&&r.len===16&&r.nh===IOS.ip4("10.0.12.1"))},
    {t:"Send everything else to the ISP with a default route",hint:"ip route 0.0.0.0 0.0.0.0 203.0.113.1",check:(w,D)=>D.BR1.routes.some(r=>r.len===0&&r.nh===IOS.ip4("203.0.113.1"))},
    {t:"Check the table and ping 10.10.1.1 and 8.8.8.8",hint:"do show ip route\ndo ping 10.10.1.1\ndo ping 8.8.8.8",check:(w,D,S)=>{const h=S.BR1.hist.join("\n");return /sh\S* ip ro/i.test(h)&&/ping 10\.10\.1\.1/.test(h)&&/ping 8\.8\.8\.8/.test(h)&&IOS.ping(w,{dev:D.BR1},IOS.ip4("10.10.1.1"),4).ok}}],
  solution:"configure terminal\nip route 10.10.0.0 255.255.0.0 10.0.12.1\nip route 0.0.0.0 0.0.0.0 203.0.113.1\ndo show ip route\ndo ping 10.10.1.1\ndo ping 8.8.8.8",
  success:"Two static routes cover everything: a network route to HQ and a default to the internet."},"staticmini",40,"Configured static routes");

/* ---- floating static failover ---- */
(function(){
  const el=$("#viz-float");let up=true,flips=0;
  el.innerHTML=`<div class="viz-title">Floating static: fail the primary link</div><div class="viz-scroll"><svg viewBox="0 0 600 170" style="min-width:440px" role="img" aria-label="R1 with two ISP links"></svg></div><pre class="term fl-t"></pre><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="t">Cut the ISP1 link</button><span class="grow"></span></div>`;
  function draw(){$("svg",el).innerHTML=`<line x1="110" y1="85" x2="470" y2="35" class="m-link ${up?"on":""}" ${up?"":'stroke-dasharray="4 6"'}/><line x1="110" y1="85" x2="470" y2="135" class="m-link ${up?"":"on"}"/>
    <rect x="50" y="62" width="120" height="46" rx="8" class="m-node on"/><text x="110" y="90" text-anchor="middle" class="s-b">R1</text>
    <rect x="410" y="12" width="140" height="46" rx="8" class="m-node ${up?"on":""}"/><text x="480" y="40" text-anchor="middle" class="s-b">ISP1 (fiber)</text>
    <rect x="410" y="112" width="140" height="46" rx="8" class="m-node ${up?"":"on"}"/><text x="480" y="140" text-anchor="middle" class="s-b">ISP2 (LTE)</text>${up?"":'<text x="290" y="52" class="s-b" style="fill:var(--bad)">✕ G0/0/0 down</text>'}`;
    $(".fl-t",el).innerHTML=`<span class="t-c">R1# show running-config | include ip route</span>
ip route 0.0.0.0 0.0.0.0 10.0.1.2
ip route 0.0.0.0 0.0.0.0 10.0.2.2 10
<span class="t-c">R1# show ip route static</span>
${up?`S*    0.0.0.0/0 [1/0] via 10.0.1.2`:`<span class="t-ok">S*    0.0.0.0/0 [10/0] via 10.0.2.2</span>`}`;
    $(".caption",el).innerHTML=up?"Both routes are configured, but only the AD 1 route is in the table. The AD 10 route floats above it, waiting.":"G0/0/0 went down, so the route via 10.0.1.2 was removed. The floating route with AD 10 drops into the table, and traffic moves to the LTE link. Restore the link and it moves back.";
    $('[data-a="t"]',el).textContent=up?"Cut the ISP1 link":"Restore the ISP1 link";$(".grow",el).textContent=`${flips} failovers`;if(flips>=2)award("viz:float",20,"Watched a floating static route fail over")}
  el.addEventListener("click",e=>{if(!e.target.closest('[data-a="t"]'))return;up=!up;flips++;draw()});draw();
})();
seqViz($("#viz-ostates"),{title:"From strangers to FULL: OSPF neighbor states",left:"R1 (RID 1.1.1.1)",right:"R2 (RID 2.2.2.2)",intro:"R1 and R2 have just been configured. Press Next step.",steps:[
  {dir:"r",label:"Hello (seen: none)",sub:"to 224.0.0.5 · state: Down → Init",text:"R1 sends a hello. When R2 receives it, R2 puts R1 in the Init state: it has heard R1 but R1 doesn't know about R2 yet."},
  {dir:"l",label:"Hello (seen: 1.1.1.1)",sub:"state: 2-Way",text:"R2's hello lists R1's RID. R1 sees itself and moves to 2-Way. On a broadcast segment, the DR/BDR election happens here, and DROTHERs stop at 2-Way with each other."},
  {dir:"r",label:"DBD (master/slave)",sub:"state: ExStart",text:"They decide who's master by RID (higher wins) and agree on sequence numbers. MTU mismatches cause a stall here."},
  {dir:"l",label:"DBD summaries",sub:"state: Exchange",text:"Each side sends Database Description packets listing the LSA headers it has."},
  {dir:"r",label:"LSR: send me these",sub:"state: Loading",text:"Each router requests the LSAs it's missing or has older copies of."},
  {dir:"l",label:"LSU + LSAck",sub:"state: Full",text:"The updates arrive and are acknowledged. The databases are identical, so both routers run SPF and install routes."}],end:"Down, Init, 2-Way, ExStart, Exchange, Loading, Full."});
quizViz($("#viz-rid"),{title:"What's the router ID?",done:"Worked out every router ID",qs:[
  ["router-id 9.9.9.9 is configured. Loopback0 is 10.255.0.1.",["9.9.9.9","10.255.0.1","The highest physical IP","0.0.0.0"],0,"The router-id command always wins."],
  ["No router-id command. Loopback0 10.255.0.1, Loopback1 10.255.0.9, G0/0/0 192.168.1.1.",["10.255.0.9","192.168.1.1","10.255.0.1","1.1.1.1"],0,"Highest loopback wins over any physical interface."],
  ["No router-id, no loopbacks. G0/0/0 10.0.12.1 (up), G0/0/1 172.16.0.1 (up), G0/0/2 192.168.9.1 (administratively down).",["172.16.0.1","192.168.9.1","10.0.12.1","None: OSPF won't start"],0,"Highest address on an interface that's up when OSPF starts."],
  ["OSPF is running with RID 172.16.0.1. You add Loopback0 10.255.0.1 and type router-id 1.1.1.1. What does show ip protocols show right away?",["172.16.0.1, until clear ip ospf process","1.1.1.1","10.255.0.1","0.0.0.0"],0,"IOS warns that the new ID takes effect after the process is cleared or the router reloads."],
  ["An IPv6-only router with no IPv4 addresses runs ipv6 router ospf 1 with no router-id.",["OSPFv3 can't start: it needs a router ID set manually","It uses its link-local address","It uses 0.0.0.0","It picks a random ID"],0,"%OSPFv3-4-NORTRID. Set router-id by hand."]]});

/* ---- DR/BDR election ---- */
(function(){
  const el=$("#viz-dr");const R=[["R1","1.1.1.1",1],["R2","2.2.2.2",1],["R3","3.3.3.3",1],["R4","4.4.4.4",1]];const seen=new Set();
  const ip=s=>s.split(".").reduce((a,o)=>a*256+ +o,0);
  el.innerHTML=`<div class="viz-title">DR and BDR election on a shared LAN</div><div class="viz-scroll"><svg viewBox="0 0 600 200" style="min-width:440px" role="img" aria-label="Four routers on a switch"></svg></div><div class="stp-ctl">${R.map((r,i)=>`<label class="rf"><span>${r[0]} priority</span><select data-i="${i}">${[0,1,50,100,200,255].map(p=>`<option ${p===r[2]?"selected":""}>${p}</option>`).join("")}</select></label>`).join("")}</div><div class="caption" aria-live="polite"></div>`;
  function draw(){const c=R.map((r,i)=>i).filter(i=>R[i][2]>0).sort((a,b)=>R[b][2]-R[a][2]||ip(R[b][1])-ip(R[a][1]));const dr=c[0],bdr=c[1];
    let s=`<rect x="250" y="20" width="100" height="36" rx="8" class="m-node"/><text x="300" y="43" text-anchor="middle" class="s-b">SW1</text>`;
    R.forEach((r,i)=>{const x=90+i*140;const role=i===dr?"DR":i===bdr?"BDR":"DROTHER";s+=`<line x1="300" y1="56" x2="${x}" y2="130" class="m-link ${role!=="DROTHER"?"on":""}"/><rect x="${x-58}" y="130" width="116" height="56" rx="8" class="m-node ${role!=="DROTHER"?"on":""}"/><text x="${x}" y="151" text-anchor="middle" class="s-b">${r[0]} · ${role}</text><text x="${x}" y="170" text-anchor="middle" class="mono" style="font-size:10px;fill:var(--muted)">pri ${r[2]} · RID ${r[1]}</text>`});
    $("svg",el).innerHTML=s;seen.add(dr);
    $(".caption",el).innerHTML=dr===undefined?`<span class="status-bad">No DR.</span> Every router has priority 0, so nobody can be DR and no FULL adjacencies form on this LAN.`:`<b>${R[dr][0]}</b> is DR ${c.filter(i=>R[i][2]===R[dr][2]).length>1?"(priority tie, so the highest router ID wins)":"(highest priority)"}${bdr!==undefined?`, <b>${R[bdr][0]}</b> is BDR`:""}. ${R.filter(r=>r[2]===0).length?R.filter(r=>r[2]===0).map(r=>r[0]).join(", ")+" opted out with priority 0. ":""}DROTHERs become FULL with the DR and BDR and stay 2-WAY with each other. In a live network the election only happens when the segment first comes up: raising a priority later doesn't preempt.`;
    if(seen.size>=3)award("viz:dr",20,"Ran DR elections")}
  el.addEventListener("change",e=>{const i=e.target.dataset.i;if(i===undefined)return;R[+i][2]=+e.target.value;draw()});draw();
})();

/* ---- OSPF cost calculator ---- */
(function(){
  const el=$("#viz-cost");let ref=100;const L=[["FastEthernet","100 Mbps",100],["GigabitEthernet","1 Gbps",1000],["TenGigabitEthernet","10 Gbps",10000],["FortyGig","40 Gbps",40000]];const seen=new Set();
  el.innerHTML=`<div class="viz-title">OSPF cost = reference ÷ bandwidth</div><div class="chips">${[100,1000,10000,100000].map(r=>`<button class="chip mono" data-r="${r}">auto-cost reference-bandwidth ${r}</button>`).join("")}</div><table class="rt"></table><div class="caption" aria-live="polite"></div>`;
  function draw(){el.querySelectorAll("[data-r]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.r===ref));
    $(".rt",el).innerHTML=`<tr><th>Interface</th><th>Bandwidth</th><th>Cost</th></tr>`+L.map(l=>`<tr><td>${l[0]}</td><td>${l[1]}</td><td class="mono">${Math.max(1,Math.floor(ref/l[2]))}</td></tr>`).join("");
    const same=L.filter(l=>Math.max(1,Math.floor(ref/l[2]))===1).length;
    $(".caption",el).innerHTML=same>1?`<span class="status-bad">${same} link speeds all cost 1.</span> OSPF can't tell a 100 Mbps link from a ${L[same-1][1]} link, so it might send traffic the slow way.`:`<span class="status-good">Every speed has a different cost.</span> Remember to set the same reference on every OSPF router.`;
    seen.add(ref);if(seen.size>=3)award("viz:cost",20,"Tuned the OSPF reference bandwidth")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(!b)return;ref=+b.dataset.r;draw()});draw();
})();
iosViz($("#viz-ospfmini"),{title:"Mini lab: bring up OSPF on R1",scenario:"R2 already runs OSPF in area 0 on its link to R1 (10.0.12.0/30) and advertises its LAN 10.2.2.0/24. R1's interfaces are addressed.",
  devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"PC1",ip:"192.168.1.10",gw:"192.168.1.1",at:"SW1:g1/0/2"}],
  boot:{R1:["interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.168.1.1 255.255.255.0","no shutdown"],R2:["interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.2.2.1 255.255.255.0","ip ospf network point-to-point","router ospf 1","router-id 2.2.2.2","network 10.0.12.0 0.0.0.3 area 0","network 10.2.2.0 0.0.0.255 area 0"]},
  consoles:["R1"],startMode:"priv",topo:{SW1:[90,70],R1:[280,70],R2:[480,70],PC1:[90,160]},topoH:200,
  tasks:[{t:"Start OSPF process 1 with router ID 1.1.1.1",hint:"configure terminal\nrouter ospf 1\n router-id 1.1.1.1",check:(w,D)=>D.R1.ospf&&D.R1.ospf.rid===IOS.ip4("1.1.1.1")},
    {t:"Advertise the WAN link and the LAN in area 0",hint:"network 10.0.12.0 0.0.0.3 area 0\nnetwork 192.168.1.0 0.0.0.255 area 0",check:(w,D)=>["GigabitEthernet0/0/0","GigabitEthernet0/0/1"].every(n=>{const c=IOS.ospfIfCfg(w,D.R1,D.R1.ifs[n],false);return c&&c.area==0})},
    {t:"Stop hellos on the LAN with a passive interface",hint:"passive-interface g0/0/1",check:(w,D)=>IOS.ospfIfCfg(w,D.R1,D.R1.ifs["GigabitEthernet0/0/1"],false)?.passive},
    {t:"Verify: R2 is FULL and 10.2.2.0/24 is an O route",hint:"do show ip ospf neighbor\ndo show ip route ospf",check:(w,D,S)=>IOS.rib(w,D.R1,4).some(r=>r.code==="O"&&r.n===IOS.ip4("10.2.2.0")&&r.len===24)&&S.R1.hist.some(h=>/sh\S* ip os\S* ne/i.test(h))}],
  solution:"configure terminal\nrouter ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0\n network 192.168.1.0 0.0.0.255 area 0\n passive-interface g0/0/1\n do show ip ospf neighbor\n do show ip route ospf",
  success:"One adjacency, one learned route, and no hellos leaking onto the user LAN."},"ospfmini",40,"Brought up OSPF");
quizViz($("#viz-adjfix"),{title:"Why won't they become neighbors?",done:"Diagnosed every OSPF adjacency",qs:[
  ["R1 G0/0/0: 10.0.12.1/30, area 0, hello 10. R2 G0/0/0: 10.0.12.2/30, area 1, hello 10.",["Area mismatch","Timer mismatch","Subnet mismatch","Duplicate RID"],0,"Both ends of a link must be in the same area."],
  ["R1: hello 10, dead 40. R2: hello 5, dead 20. Same subnet and area.",["Hello/dead timer mismatch","MTU mismatch","Area mismatch","Passive interface"],0,"Timers are carried in the hello and must match."],
  ["R1 10.0.12.1/30 and R2 10.0.12.5/30, both area 0.",["Different subnets","Different areas","Different process IDs","Different priorities"],0,"10.0.12.1/30 and 10.0.12.5/30 are in different /30s."],
  ["show ip ospf neighbor on R1 shows R2 stuck in EXSTART. R1's MTU is 1500, R2's is 1400.",["MTU mismatch","Area mismatch","Duplicate RID","Passive interface"],0,"Database description packets fail the MTU check."],
  ["Both routers log %OSPF-4-DUP_RTRID_NBR. They copied each other's config.",["Duplicate router IDs","Timer mismatch","Different areas","Authentication"],0,"Router IDs must be unique. Change one and clear the process."],
  ["Everything matches, but R1 has passive-interface g0/0/0 under router ospf 1.",["Passive interface: no hellos are sent","Area mismatch","Network type","DR election"],0,"Passive is for user LANs, never the link to a neighbor."]]});

/* ---- HSRP failover ---- */
(function(){
  const el=$("#viz-fhrp");const st={r1:true,pre:true};let t=0;const seen=new Set();
  el.innerHTML=`<div class="viz-title">HSRP: who's answering for 192.168.10.254?</div><div class="viz-scroll"><svg viewBox="0 0 600 210" style="min-width:440px" role="img" aria-label="Two routers sharing a virtual gateway"></svg></div><label class="rf-chk"><input type="checkbox" data-a="pre" checked> standby 10 preempt on R1</label><pre class="term fh-o"></pre><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="fail">Power off R1</button></div>`;
  let active="R1";
  function draw(msg){$("svg",el).innerHTML=`<rect x="70" y="20" width="150" height="56" rx="8" class="m-node ${active==="R1"?"on":""}" ${st.r1?"":'opacity=".35"'}/><text x="145" y="44" text-anchor="middle" class="s-b">R1 · pri 110</text><text x="145" y="62" text-anchor="middle" class="mono" style="font-size:10px;fill:var(--muted)">.1 · ${st.r1?active==="R1"?"Active":"Standby":"down"}</text>
    <rect x="380" y="20" width="150" height="56" rx="8" class="m-node ${active==="R2"?"on":""}"/><text x="455" y="44" text-anchor="middle" class="s-b">R2 · pri 100</text><text x="455" y="62" text-anchor="middle" class="mono" style="font-size:10px;fill:var(--muted)">.2 · ${active==="R2"?"Active":"Standby"}</text>
    <line x1="145" y1="76" x2="300" y2="120" class="m-link ${active==="R1"?"on":""}"/><line x1="455" y1="76" x2="300" y2="120" class="m-link ${active==="R2"?"on":""}"/>
    <rect x="230" y="110" width="140" height="34" rx="17" class="fh-vip"/><text x="300" y="132" text-anchor="middle" class="mono" style="font-size:11px;fill:var(--fg)">VIP .254</text>
    <line x1="300" y1="144" x2="300" y2="168" class="m-link on"/><rect x="240" y="168" width="120" height="34" rx="8" class="m-node"/><text x="300" y="190" text-anchor="middle" class="s-b">PCs · gw .254</text>`;
    $(".fh-o",el).innerHTML=`<span class="t-c">R2# show standby brief</span>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0/1     10   100   ${active==="R2"?"Active ":"Standby"} ${active==="R2"?"local          ":"192.168.10.1   "} ${st.r1&&active==="R2"?"192.168.10.1   ":active==="R2"?"unknown        ":"local          "} 192.168.10.254`;
    $('[data-a="fail"]',el).textContent=st.r1?"Power off R1":"Power R1 back on";if(msg)$(".caption",el).innerHTML=msg}
  el.addEventListener("change",e=>{if(e.target.dataset.a==="pre"){st.pre=e.target.checked;draw(st.pre?"Preempt is on: R1 will take the active role back when it returns.":"Preempt is off: whoever is active keeps the role, even if a higher-priority router comes back.")}});
  el.addEventListener("click",e=>{if(!e.target.closest('[data-a="fail"]'))return;st.r1=!st.r1;
    if(!st.r1){active="R2";seen.add("fail");draw(`R1 stopped sending hellos. After the hold time (10 s by default, 3 s hello), R2 becomes <b>active</b> and starts answering ARP for 192.168.10.254 with the same virtual MAC. The PCs never notice.`)}
    else{if(st.pre){active="R1";seen.add("pre");draw(`R1 is back with priority 110 and <b>preempt</b>, so it takes over again. R2 returns to standby.`)}else{seen.add("nopre");draw(`R1 is back with a higher priority, but without preempt it stays <b>standby</b>. R2 keeps forwarding until it fails.`)}}
    if(seen.size>=3)award("viz:fhrp",30,"Tested HSRP failover with and without preempt")});
  draw("R1 has the higher priority, so it's active. Fail it, then bring it back with and without preempt.");
})();
sortViz($("#viz-fhrpcmp"),{title:"HSRP, VRRP or GLBP?",bins:{hsrp:"HSRP",vrrp:"VRRP",glbp:"GLBP"},
  items:[["Open standard, works with any vendor","vrrp","RFC 5798."],["Active and standby routers","hsrp","HSRP's terms."],["Master and backup routers","vrrp","VRRP's terms."],["Shares the load across routers for a single virtual IP","glbp","Different virtual MACs to different hosts."],["Preemption on by default","vrrp","HSRP and GLBP need preempt configured."],["Virtual MAC 0000.0c07.ac0a","hsrp","HSRPv1 group 10."],["Virtual MAC 0000.5e00.010a","vrrp","VRRP group 10."],["Uses an AVG and AVFs","glbp","Active virtual gateway and forwarders."]],done:"Told the FHRPs apart"});
  },
  sims:[
    {id:"staticlab",type:"ios",title:"Dual-ISP static routing with failover",lab:{
      scenario:"R1 has a fiber link to ISP1 (10.0.1.2) and an LTE backup to ISP2 (10.0.2.2). The HQ data center (172.16.0.0/16) sits behind both. Make ISP1 the primary path, ISP2 a floating backup, and pin the backup server 172.16.99.9 to ISP2. Then test the failover.",
      devices:[{name:"R1",kind:"router"},{name:"ISP1",kind:"router"},{name:"ISP2",kind:"router"},{name:"HQ",kind:"router"},{name:"SW1",kind:"switch"}],
      links:[["R1:g0/0/0","ISP1:g0/0/0"],["R1:g0/0/1","ISP2:g0/0/0"],["ISP1:g0/0/1","HQ:g0/0/0"],["ISP2:g0/0/1","HQ:g0/0/1"],["R1:g0/0/2","SW1:g1/0/1"]],hosts:[{name:"PC1",ip:"192.168.1.10",gw:"192.168.1.1",at:"SW1:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.2.1 255.255.255.252","no shutdown","interface g0/0/2","ip address 192.168.1.1 255.255.255.0","no shutdown"],
        ISP1:["interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.3.1 255.255.255.252","no shutdown","ip route 192.168.1.0 255.255.255.0 10.0.1.1","ip route 172.16.0.0 255.255.0.0 10.0.3.2"],
        ISP2:["interface g0/0/0","ip address 10.0.2.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.4.1 255.255.255.252","no shutdown","ip route 192.168.1.0 255.255.255.0 10.0.2.1","ip route 172.16.0.0 255.255.0.0 10.0.4.2"],
        HQ:["interface g0/0/0","ip address 10.0.3.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.4.2 255.255.255.252","no shutdown","interface loopback0","ip address 172.16.0.1 255.255.255.0","interface loopback99","ip address 172.16.99.9 255.255.255.255","ip route 192.168.1.0 255.255.255.0 10.0.3.1","ip route 192.168.1.0 255.255.255.0 10.0.4.1 5"]},
      consoles:["R1"],topo:{SW1:[60,110],R1:[200,110],ISP1:[360,40],ISP2:[360,180],HQ:[520,110],PC1:[60,200]},topoH:240,
      events:[{label:"✂ Cut the ISP1 link",run:(w,D,S)=>{D.ISP1.ifs["GigabitEthernet0/0/0"].shut=true;D.HQ.routes=D.HQ.routes.filter(r=>r.nh!==IOS.ip4("10.0.3.1"));w.cutAt=S.R1.hist.length;return "! The fiber to ISP1 was cut by a backhoe. The providers withdraw the broken path."}}],
      tasks:[
        {t:"Add a default route via ISP1 (10.0.1.2)",hint:"ip route 0.0.0.0 0.0.0.0 10.0.1.2",check:(w,D)=>D.R1.routes.some(r=>r.len===0&&r.nh===IOS.ip4("10.0.1.2")&&r.ad===1)},
        {t:"Add a floating default route via ISP2 (10.0.2.2) with AD 10",hint:"ip route 0.0.0.0 0.0.0.0 10.0.2.2 10",check:(w,D)=>D.R1.routes.some(r=>r.len===0&&r.nh===IOS.ip4("10.0.2.2")&&r.ad===10)},
        {t:"Send traffic for the backup server 172.16.99.9 only via ISP2, with a host route",hint:"ip route 172.16.99.9 255.255.255.255 10.0.2.2",check:(w,D)=>D.R1.routes.some(r=>r.n===IOS.ip4("172.16.99.9")&&r.len===32&&r.nh===IOS.ip4("10.0.2.2"))},
        {t:"Ping 172.16.0.1 sourced from the LAN interface",hint:"do ping 172.16.0.1 source g0/0/2",sticky:true,check:(w,D,S)=>S.R1.hist.some(h=>/ping 172\.16\.0\.1 so\S* (g\S*0\/0\/2|192\.168\.1\.1)/i.test(h))&&IOS.ping(w,{host:w.hosts[0]},IOS.ip4("172.16.0.1"),4).ok},
        {t:"Press ✂ Cut the ISP1 link, then confirm with show ip route that the floating route took over and PC1 can still reach HQ",hint:"do show ip route static",sticky:true,check:(w,D,S)=>w.cutAt!=null&&S.R1.hist.slice(w.cutAt).some(h=>/sh\S* ip ro/i.test(h))&&IOS.lookup(w,D.R1,IOS.ip4("172.16.0.1"),4)?.via[0].nh===IOS.ip4("10.0.2.2")&&IOS.ping(w,{host:w.hosts[0]},IOS.ip4("172.16.0.1"),4).ok}],
      solution:"enable\nconfigure terminal\nip route 0.0.0.0 0.0.0.0 10.0.1.2\nip route 0.0.0.0 0.0.0.0 10.0.2.2 10\nip route 172.16.99.9 255.255.255.255 10.0.2.2\ndo ping 172.16.0.1 source g0/0/2\n! Press the ✂ Cut the ISP1 link button, then:\ndo show ip route static",
      success:"When G0/0/0 lost its link, the AD 1 route left the table and the AD 10 route dropped in. That's a floating static route."}},
    {id:"ospflab",type:"ios",title:"Single-area OSPF from scratch",lab:{
      scenario:"Three routers in a chain: R1 (HQ edge, with the internet link), R2 (core) and R3 (branch). R3 is already running OSPF. Configure R1 and R2 so every LAN can reach every other and the internet, without hellos leaking onto user LANs.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"R3",kind:"router"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"},{name:"SW3",kind:"switch"}],
      links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","R3:g0/0/0"],["R1:g0/0/1","ISP:g0/0/0"],["R1:g0/0/2","SW1:g1/0/1"],["R3:g0/0/2","SW3:g1/0/1"]],
      hosts:[{name:"PC1",ip:"192.168.1.10",gw:"192.168.1.1",at:"SW1:g1/0/2"},{name:"PC3",ip:"192.168.3.10",gw:"192.168.3.1",at:"SW3:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/2","ip address 192.168.1.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.23.1 255.255.255.252","no shutdown","interface loopback0","ip address 10.255.0.2 255.255.255.255"],
        R3:["hostname R3","interface g0/0/0","ip address 10.0.23.2 255.255.255.252","no shutdown","interface g0/0/2","ip address 192.168.3.1 255.255.255.0","no shutdown","router ospf 1","router-id 3.3.3.3","network 10.0.23.0 0.0.0.3 area 0","network 192.168.3.0 0.0.0.255 area 0","passive-interface g0/0/2"],
        ISP:["interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255","ip route 192.168.0.0 255.255.0.0 203.0.113.2","ip route 10.0.0.0 255.0.0.0 203.0.113.2"]},
      consoles:["R1","R2","R3"],topo:{SW1:[60,60],R1:[190,60],R2:[350,60],R3:[510,60],ISP:[190,180],SW3:[510,180],PC1:[60,170]},topoH:240,
      tasks:[
        {t:"On R1: OSPF process 1, router ID 1.1.1.1, with G0/0/0 and the LAN in area 0",hint:"router ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0\n network 192.168.1.0 0.0.0.255 area 0",check:(w,D)=>D.R1.ospf?.rid===IOS.ip4("1.1.1.1")&&["GigabitEthernet0/0/0","GigabitEthernet0/0/2"].every(n=>IOS.ospfIfCfg(w,D.R1,D.R1.ifs[n],false)?.area==0)},
        {t:"On R2: router ID 2.2.2.2, with both links and Loopback0 in area 0",hint:"router ospf 1\n router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3 area 0\n network 10.0.23.0 0.0.0.3 area 0\n network 10.255.0.2 0.0.0.0 area 0",check:(w,D)=>D.R2.ospf?.rid===IOS.ip4("2.2.2.2")&&["GigabitEthernet0/0/0","GigabitEthernet0/0/1","Loopback0"].every(n=>IOS.ospfIfCfg(w,D.R2,D.R2.ifs[n],false)?.area==0)},
        {t:"R1's LAN interface is passive, and the ISP link isn't in OSPF at all",hint:"passive-interface g0/0/2",check:(w,D)=>IOS.ospfIfCfg(w,D.R1,D.R1.ifs["GigabitEthernet0/0/2"],false)?.passive&&!IOS.ospfIfCfg(w,D.R1,D.R1.ifs["GigabitEthernet0/0/1"],false)},
        {t:"R1 advertises its default route into OSPF, so R3 learns O*E2 0.0.0.0/0",hint:"default-information originate",check:(w,D)=>IOS.rib(w,D.R3,4).some(r=>r.len===0&&/^O/.test(r.code))},
        {t:"Both adjacencies are FULL, and PC3 can reach PC1 and 8.8.8.8",hint:"show ip ospf neighbor\nshow ip route",check:w=>{const A=IOS.ospfAdj(w,false);return A.filter(a=>a.state==="FULL").length>=2&&IOS.ping(w,{host:w.hosts[1]},w.hosts[0].ip,4).ok&&IOS.ping(w,{host:w.hosts[1]},IOS.ip4("8.8.8.8"),4).ok}}],
      solution:"! On R1\nenable\nconfigure terminal\nrouter ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0\n network 192.168.1.0 0.0.0.255 area 0\n passive-interface g0/0/2\n default-information originate\n! On R2\nenable\nconfigure terminal\nrouter ospf 1\n router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3 area 0\n network 10.0.23.0 0.0.0.3 area 0\n network 10.255.0.2 0.0.0.0 area 0",
      success:"OSPF carries every internal network, the default route reaches the branch, and no hellos go out to users or the ISP."}},
    {id:"ospffix",type:"ios",title:"Troubleshoot: OSPF neighbors are missing",lab:{
      scenario:"Three routers in a triangle should all be FULL with each other, but show ip ospf neighbor is nearly empty after a change window. Find and fix every problem without removing OSPF from any link.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"R3",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","R3:g0/0/1"],["R1:g0/0/1","R3:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.13.1 255.255.255.252","no shutdown","interface loopback0","ip address 10.255.0.1 255.255.255.255","router ospf 1","router-id 1.1.1.1","network 10.0.0.0 0.255.255.255 area 0","passive-interface g0/0/1"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","ip ospf hello-interval 5","no shutdown","interface g0/0/1","ip address 10.0.23.1 255.255.255.252","no shutdown","interface loopback0","ip address 10.255.0.2 255.255.255.255","router ospf 1","router-id 2.2.2.2","network 10.0.0.0 0.255.255.255 area 0"],
        R3:["hostname R3","interface g0/0/0","ip address 10.0.13.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.23.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.255.0.3 255.255.255.255","router ospf 1","router-id 3.3.3.3","network 10.0.13.0 0.0.0.3 area 0","network 10.0.23.0 0.0.0.3 area 1","network 10.255.0.3 0.0.0.0 area 0"]},
      consoles:["R1","R2","R3"],startMode:"priv",topo:{R1:[300,40],R2:[130,190],R3:[470,190]},topoH:250,
      tasks:[
        {t:"Investigate with show ip ospf interface and show ip protocols",hint:"show ip ospf interface brief\nshow ip ospf interface g0/0/0\nshow ip protocols",check:(w,D,S)=>Object.values(S).some(x=>x.hist.some(h=>/sh\S* ip os\S* int/i.test(h)))&&Object.values(S).some(x=>x.hist.some(h=>/sh\S* ip pro/i.test(h)))},
        {t:"R1 and R2 are FULL",hint:"! On R2\ninterface g0/0/0\n no ip ospf hello-interval",check:w=>IOS.ospfAdj(w,false).some(a=>a.state==="FULL"&&[a.a[0],a.b[0]].sort().join()==="R1,R2")},
        {t:"R2 and R3 are FULL",hint:"! On R3\nrouter ospf 1\n no network 10.0.23.0 0.0.0.3 area 1\n network 10.0.23.0 0.0.0.3 area 0",check:w=>IOS.ospfAdj(w,false).some(a=>a.state==="FULL"&&[a.a[0],a.b[0]].sort().join()==="R2,R3")},
        {t:"R1 and R3 are FULL",hint:"! On R1\nrouter ospf 1\n no passive-interface g0/0/1",check:w=>IOS.ospfAdj(w,false).some(a=>a.state==="FULL"&&[a.a[0],a.b[0]].sort().join()==="R1,R3")},
        {t:"R1 reaches R3's loopback 10.255.0.3 over a direct OSPF route",hint:"show ip route ospf",check:(w,D)=>{const r=IOS.lookup(w,D.R1,IOS.ip4("10.255.0.3"),4);return r&&r.code==="O"&&r.via.some(v=>v.nh===IOS.ip4("10.0.13.2"))}}],
      solution:"! On R1\nshow ip ospf interface brief\nshow ip protocols\nconfigure terminal\nrouter ospf 1\n no passive-interface g0/0/1\n! On R2\nconfigure terminal\ninterface g0/0/0\n no ip ospf hello-interval\n! On R3\nconfigure terminal\nrouter ospf 1\n no network 10.0.23.0 0.0.0.3 area 1\n network 10.0.23.0 0.0.0.3 area 0",
      success:"Three different faults: a hello timer mismatch, an area mismatch and a passive transit link. Each one alone is enough to stop an adjacency."}},
    {id:"v6lab",type:"ios",title:"IPv6 routing with OSPFv3",lab:{
      scenario:"The IPv6 addresses are already on every interface. R2 and the ISP already route IPv6. Turn on IPv6 routing on R1, run OSPFv3 between R1 and R2, and give the branch a path to the internet.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"ISP",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R1:g0/0/1","ISP:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ipv6 address 2001:db8:12::1/64","no shutdown","interface g0/0/1","ipv6 address 2001:db8:f::1/64","no shutdown","interface loopback0","ipv6 address 2001:db8:1::1/64"],
        R2:["hostname R2","ipv6 unicast-routing","interface g0/0/0","ipv6 address 2001:db8:12::2/64","no shutdown","interface loopback0","ipv6 address 2001:db8:2::1/64"],
        ISP:["ipv6 unicast-routing","interface g0/0/0","ipv6 address 2001:db8:f::2/64","no shutdown","interface loopback0","ipv6 address 2001:4860::8888/128","ipv6 route 2001:db8::/32 2001:db8:f::1"]},
      consoles:["R1","R2"],topo:{R2:[100,70],R1:[300,70],ISP:[500,70]},topoH:150,
      tasks:[
        {t:"Enable IPv6 routing on R1",hint:"ipv6 unicast-routing",check:(w,D)=>D.R1.v6Routing},
        {t:"Start OSPFv3 process 1 on both routers with router IDs 1.1.1.1 and 2.2.2.2 (they have no IPv4 addresses)",hint:"ipv6 router ospf 1\n router-id 1.1.1.1",check:(w,D)=>D.R1.ospf6?.rid===IOS.ip4("1.1.1.1")&&D.R2.ospf6?.rid===IOS.ip4("2.2.2.2")},
        {t:"Enable OSPFv3 area 0 on the R1–R2 link and both loopbacks",hint:"interface g0/0/0\n ipv6 ospf 1 area 0\ninterface loopback0\n ipv6 ospf 1 area 0",check:(w,D)=>IOS.ospfAdj(w,true).some(a=>a.state==="FULL")&&IOS.rib(w,D.R2,6).some(r=>r.code==="O"&&r.n===IOS.ip6("2001:db8:1::1")&&r.len===128)},
        {t:"On R1, add an IPv6 default route to the ISP (2001:db8:f::2) and advertise it into OSPFv3",hint:"ipv6 route ::/0 2001:db8:f::2\nipv6 router ospf 1\n default-information originate",check:(w,D)=>D.R1.routes6.some(r=>r.len===0)&&IOS.rib(w,D.R2,6).some(r=>r.len===0&&/^O/.test(r.code))},
        {t:"From R2, ping the ISP's server 2001:4860::8888",hint:"ping 2001:4860::8888",check:(w,D,S)=>S.R2.hist.some(h=>/ping (ipv6 )?2001:4860::8888/i.test(h))&&IOS.ping(w,{dev:D.R2},IOS.ip6("2001:4860::8888"),6).ok}],
      solution:"! On R1\nenable\nconfigure terminal\nipv6 unicast-routing\nipv6 router ospf 1\n router-id 1.1.1.1\n default-information originate\ninterface g0/0/0\n ipv6 ospf 1 area 0\ninterface loopback0\n ipv6 ospf 1 area 0\nexit\nipv6 route ::/0 2001:db8:f::2\n! On R2\nenable\nconfigure terminal\nipv6 router ospf 1\n router-id 2.2.2.2\ninterface g0/0/0\n ipv6 ospf 1 area 0\ninterface loopback0\n ipv6 ospf 1 area 0\nend\nping 2001:4860::8888",
      success:"OSPFv3 formed over link-local addresses and carried both the LANs and the default route."}},
    {id:"hsrplab",type:"ios",title:"Redundant gateways with HSRP",lab:{
      scenario:"R1 and R2 both sit on the user LAN (192.168.10.0/24) and both connect to the core. PCs use 192.168.10.254 as their gateway. Configure HSRP so R1 normally forwards and R2 takes over if R1 dies.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"CORE",kind:"router"},{name:"SW1",kind:"switch"}],
      links:[["R1:g0/0/1","SW1:g1/0/1"],["R2:g0/0/1","SW1:g1/0/2"],["R1:g0/0/0","CORE:g0/0/0"],["R2:g0/0/0","CORE:g0/0/1"]],hosts:[{name:"PC1",ip:"192.168.10.50",gw:"192.168.10.254",at:"SW1:g1/0/5"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.168.10.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 10.0.1.2"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.2.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.168.10.2 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 10.0.2.2"],
        CORE:["interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.2.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.255.255.1 255.255.255.255","ip route 192.168.10.0 255.255.255.0 10.0.1.1","ip route 192.168.10.0 255.255.255.0 10.0.2.1 5"]},
      consoles:["R1","R2"],topo:{R1:[180,60],R2:[420,60],CORE:[300,170],SW1:[300,60],PC1:[300,0]},topoH:220,
      events:[{label:"⏻ Power off R1",run:(w,D)=>{Object.values(D.R1.ifs).forEach(i=>i.shut=true);w.r1off=true;return "! R1 lost power."}}],
      tasks:[
        {t:"On R1 G0/0/1: HSRP version 2, group 10, virtual IP 192.168.10.254, priority 110, preempt",hint:"interface g0/0/1\n standby version 2\n standby 10 ip 192.168.10.254\n standby 10 priority 110\n standby 10 preempt",check:(w,D)=>{const i=D.R1.ifs["GigabitEthernet0/0/1"],g=i.hsrp[10];return g&&g.ip===IOS.ip4("192.168.10.254")&&g.pri===110&&g.preempt&&i.hsrpV===2}},
        {t:"On R2 G0/0/1: HSRP version 2, group 10, the same virtual IP",hint:"interface g0/0/1\n standby version 2\n standby 10 ip 192.168.10.254",check:(w,D)=>{const i=D.R2.ifs["GigabitEthernet0/0/1"];return i.hsrp[10]&&i.hsrpV===2&&(i.hsrp[10].ip==null||i.hsrp[10].ip===IOS.ip4("192.168.10.254"))}},
        {t:"show standby brief on R2 shows R1 active and R2 standby, and PC1 can reach the core",hint:"show standby brief",sticky:true,check:(w,D,S)=>{const G=Object.values(IOS.fhrp(w,"hsrp"))[0]||[];return G.some(x=>x.d.name==="R1"&&x.state==="Active")&&G.some(x=>x.d.name==="R2"&&x.state==="Standby")&&S.R2.hist.some(h=>/sh\S* stand/i.test(h))&&IOS.ping(w,{host:w.hosts[0]},IOS.ip4("10.255.255.1"),4).ok}},
        {t:"Press ⏻ Power off R1: R2 becomes active and PC1 still reaches the core",hint:"Use the button, then show standby brief on R2.",sticky:true,check:(w,D)=>{const G=Object.values(IOS.fhrp(w,"hsrp"))[0]||[];return w.r1off&&G.some(x=>x.d.name==="R2"&&x.state==="Active")&&IOS.ping(w,{host:w.hosts[0]},IOS.ip4("10.255.255.1"),4).ok}}],
      solution:"! On R1\nenable\nconfigure terminal\ninterface g0/0/1\n standby version 2\n standby 10 ip 192.168.10.254\n standby 10 priority 110\n standby 10 preempt\n! On R2\nenable\nconfigure terminal\ninterface g0/0/1\n standby version 2\n standby 10 ip 192.168.10.254\n do show standby brief\n! Then press ⏻ Power off R1",
      success:"PC1 never changed its gateway. The virtual IP and MAC moved to R2 within the hold time."}},
    {id:"nexthop",type:"choice",title:"Follow the packet",
      scenario:"R1's routing table:<pre class=\"term\">S*  0.0.0.0/0 [1/0] via 203.0.113.1\nO   10.0.0.0/8 [110/30] via 10.0.12.2\nS   10.20.0.0/16 [1/0] via 10.0.13.2\nO   10.20.30.0/24 [110/20] via 10.0.14.2\nO   10.20.30.0/24 [110/20] via 10.0.15.2\nS   10.20.30.64/26 [5/0] via 10.0.13.2\nC   10.0.12.0/30 is directly connected, Gi0/0/0</pre>",
      steps:[
        ["Where does R1 send a packet for 10.20.30.70?",["10.0.13.2 (the /26)","10.0.14.2 and 10.0.15.2","10.0.12.2","203.0.113.1"],0,"10.20.30.64/26 covers .64 to .127, and it's the longest match."],
        ["Where does a packet for 10.20.30.10 go?",["Shared between 10.0.14.2 and 10.0.15.2","10.0.13.2","10.0.12.2","Dropped"],0,"The /24 is the longest match, and it has two equal-cost OSPF paths."],
        ["Where does a packet for 10.20.99.1 go?",["10.0.13.2 (the static /16)","10.0.12.2 (the OSPF /8)","203.0.113.1","10.0.14.2"],0,"The /16 is more specific than the /8."],
        ["Where does a packet for 10.99.0.1 go?",["10.0.12.2","10.0.13.2","203.0.113.1","Dropped"],0,"Only the /8 and the default match. The /8 is longer."],
        ["Where does a packet for 172.16.0.1 go?",["203.0.113.1","10.0.12.2","Dropped","10.0.13.2"],0,"Only the default route matches."],
        ["Someone adds 'ip route 10.20.30.0 255.255.255.0 10.0.16.2'. What changes for 10.20.30.10?",["It now goes to 10.0.16.2: same prefix, lower AD","Nothing: OSPF has a lower metric","It's shared three ways","It still goes to the /26"],0,"Same /24, so AD decides: static 1 beats OSPF 110."]],
      success:"Longest prefix first, then AD, then metric. Every time."}
  ],
  badges:[
    ["reader","L3","Layer 3 Scholar","Mark all 7 routing lessons studied",c=>c.allStudied()],
    ["lab","RT","Route Reflector","Complete all 13 diagrams in this module",c=>c.vizAll()],
    ["float","FL","Floating Static","Pass the dual-ISP failover lab",c=>c.passed("staticlab")],
    ["ospf","OS","Full Adjacency","Pass the OSPF configuration lab",c=>c.passed("ospflab")],
    ["fix","TS","Neighbor Whisperer","Fix every broken OSPF adjacency",c=>c.passed("ospffix")],
    ["v6","V6","Dual Stack","Pass the OSPFv3 lab",c=>c.passed("v6lab")],
    ["hsrp","HA","Always Active","Pass the HSRP lab",c=>c.passed("hsrplab")],
    ["lpm","/32","Longest Match","Pass Follow the packet and score 100% on a routing quiz of 15+ questions",c=>c.passed("nexthop")&&c.earned("quiz100")]
  ]
});
})();
