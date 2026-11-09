/* ================= Module 2: Network Implementation (N10-009 Domain 2.0, 20%) ================= */
(function(){
const AD=[["Directly connected",0],["Static route",1],["eBGP",20],["EIGRP (internal)",90],["OSPF",110],["IS-IS",115],["RIP",120],["EIGRP (external)",170],["iBGP",200]];

const LESSONS=[
{id:"routing",num:"2.1",title:"Routing and route selection",html:`
<p>A router forwards each packet by looking up the destination IP in its <b>routing table</b>. Routes get there three ways: <b>directly connected</b> networks on its own interfaces, <b>static routes</b> typed in by an admin, and <b>dynamic routes</b> learned from routing protocols. A <b>default route</b> (0.0.0.0/0) catches everything that doesn't match anything more specific.</p>
<h3>How the router picks a route</h3>
<ol><li><b>Longest prefix match</b>: the most specific route wins. A /27 beats a /24 beats a /0, no matter where they came from.</li>
<li><b>Administrative distance</b>: if two sources offer the same prefix, the more trusted source (lower AD) wins.</li>
<li><b>Metric</b>: if one protocol offers several paths to the same prefix, the lowest metric wins (hop count for RIP, cost for OSPF).</li></ol>
<div class="viz" id="viz-lpm"></div>
<div class="scroll"><table><thead><tr><th>Route source</th><th>Default AD</th></tr></thead><tbody>${AD.map(a=>`<tr><td>${a[0]}</td><td class="port">${a[1]}</td></tr>`).join("")}</tbody></table></div>
<div class="tip"><b>Floating static route.</b> A static route configured with a higher AD than the dynamic protocol (for example 254) sits unused until the dynamic route disappears. It's a cheap backup path.</div>`},
{id:"dynamic",num:"2.2",title:"Dynamic routing, NAT and gateway redundancy",html:`
<div class="scroll"><table><thead><tr><th>Protocol</th><th>Type</th><th>Metric</th><th>Where you see it</th></tr></thead><tbody>
<tr><td class="port">RIP</td><td>Distance vector</td><td>Hop count (max 15)</td><td>Old, small networks</td></tr>
<tr><td class="port">OSPF</td><td>Link state</td><td>Cost, based on bandwidth</td><td>Enterprise networks; open standard; uses areas (area 0 is the backbone)</td></tr>
<tr><td class="port">EIGRP</td><td>Advanced distance vector (hybrid)</td><td>Bandwidth and delay</td><td>Cisco networks</td></tr>
<tr><td class="port">BGP</td><td>Path vector</td><td>Path attributes (AS path and more)</td><td>Between autonomous systems: the routing protocol of the internet</td></tr>
</tbody></table></div>
<p><b>Interior</b> gateway protocols (RIP, OSPF, EIGRP) run inside one organization. <b>BGP</b> is the exterior gateway protocol that connects organizations and ISPs.</p>
<h3>NAT and PAT</h3>
<p><b>NAT</b> rewrites private source addresses into public ones. <b>Static NAT</b> maps one private address to one public address (good for a server that must be reachable). <b>PAT</b> (port address translation, or NAT overload) lets many hosts share one public address by tracking each connection's source port.</p>
<div class="viz" id="viz-pat"></div>
<h3>First hop redundancy</h3>
<p>Hosts have just one default gateway. If that router dies, they're cut off. A <b>first hop redundancy protocol</b> (FHRP) puts two or more routers behind one <b>virtual IP (VIP)</b> and virtual MAC. One router is active and the other takes over in seconds. Examples: <b>HSRP</b> (Cisco), <b>VRRP</b> (open standard) and <b>GLBP</b> (Cisco, load-balancing).</p>
<div class="viz" id="viz-fhrp"></div>
<h3>Subinterfaces</h3>
<p>A router with one physical port can route between several VLANs using <b>subinterfaces</b> (such as g0/0.10 and g0/0.20), each tagged for one VLAN. This is called router on a stick.</p>`},
{id:"vlans",num:"2.3",title:"Switching: VLANs, trunks and interface settings",html:`
<p>A <b>VLAN</b> is a separate broadcast domain on a shared switch. Devices in different VLANs can't talk without a router or Layer 3 switch. A <b>switch virtual interface (SVI)</b> gives a Layer 3 switch an IP address in each VLAN so it can route between them.</p>
<ul><li><b>Access port</b>: belongs to one VLAN and sends untagged frames. End devices plug in here.</li>
<li><b>Trunk port</b>: carries many VLANs between switches, adding an <b>802.1Q tag</b> (4 bytes with a 12-bit VLAN ID) to each frame.</li>
<li><b>Native VLAN</b>: the one VLAN that crosses a trunk untagged. It must match on both ends, and changing it from VLAN 1 is good practice.</li>
<li><b>Voice VLAN</b>: lets an IP phone and the PC plugged into it share one port while voice traffic gets its own VLAN and QoS.</li></ul>
<div class="viz" id="viz-tag"></div>
<h3>Interface settings</h3>
<ul><li><b>Speed and duplex</b>: both ends should match. A <b>duplex mismatch</b> (one side full, one half) causes late collisions and slow transfers. Auto-negotiate both sides or hard-set both.</li>
<li><b>Link aggregation</b> (802.3ad / LACP, also called port channel or EtherChannel) bundles several links into one logical link for more bandwidth and redundancy.</li>
<li><b>MTU</b>: the largest frame payload, normally 1,500 bytes. <b>Jumbo frames</b> (up to about 9,000 bytes) cut overhead on storage networks, but every device in the path must support them.</li></ul>`},
{id:"stp",num:"2.4",title:"Spanning Tree Protocol",html:`
<p>Redundant links between switches are good for uptime, but Ethernet frames have no TTL. Without protection, a broadcast loops forever, multiplying until the network collapses: a <b>broadcast storm</b>. <b>Spanning Tree Protocol</b> (802.1D) finds loops and blocks just enough ports to break them.</p>
<ol><li>Switches elect a <b>root bridge</b>: the lowest <b>bridge ID</b> wins. The bridge ID is the priority (default 32768), then the MAC address as a tie-breaker.</li>
<li>Every other switch picks one <b>root port</b>: its lowest-cost path to the root.</li>
<li>Each link gets one <b>designated port</b> that forwards toward the segment.</li>
<li>Every remaining port is <b>blocked</b>. It listens for BPDUs and unblocks if a link fails.</li></ol>
<div class="viz" id="viz-stp"></div>
<p>Classic STP ports move through <b>blocking, listening, learning and forwarding</b>, which can take 30 to 50 seconds. <b>Rapid STP</b> (802.1w) converges in a few seconds. Set the root bridge on purpose by lowering the priority on a core switch, so an old switch with a low MAC address doesn't win by accident.</p>`},
{id:"wifi",num:"2.5",title:"Wireless: bands, channels and network types",html:`
<div class="scroll"><table><thead><tr><th>Standard</th><th>Wi-Fi name</th><th>Bands</th><th>Max channel width</th></tr></thead><tbody>
<tr><td class="port">802.11n</td><td>Wi-Fi 4</td><td>2.4 / 5 GHz</td><td>40 MHz</td></tr>
<tr><td class="port">802.11ac</td><td>Wi-Fi 5</td><td>5 GHz</td><td>160 MHz</td></tr>
<tr><td class="port">802.11ax</td><td>Wi-Fi 6 / 6E</td><td>2.4 / 5 GHz (6E adds 6 GHz)</td><td>160 MHz</td></tr>
<tr><td class="port">802.11be</td><td>Wi-Fi 7</td><td>2.4 / 5 / 6 GHz</td><td>320 MHz</td></tr>
</tbody></table></div>
<ul><li><b>2.4 GHz</b>: longer range, crowded, only 1, 6 and 11 don't overlap.</li>
<li><b>5 GHz</b>: many more channels. Some are shared with radar, so APs must use <b>DFS</b> (dynamic frequency selection) and <b>TPC</b> (transmit power control) from <b>802.11h</b>.</li>
<li><b>6 GHz</b>: wide, clean spectrum, but shortest range and only for 6E and 7 clients.</li>
<li><b>Band steering</b> nudges dual-band clients onto 5 or 6 GHz.</li></ul>
<h3>Channel width</h3>
<p><b>Channel bonding</b> joins 20 MHz channels into 40, 80 or 160 MHz for more speed per client. The catch: fewer non-overlapping channels, so neighboring APs are more likely to interfere.</p>
<div class="viz" id="viz-width"></div>
<h3>Names and network types</h3>
<ul><li><b>SSID</b>: the network name. <b>BSSID</b>: the MAC address of one AP radio. <b>ESSID</b>: one SSID shared by many APs so clients can roam.</li>
<li><b>Infrastructure</b>: clients connect through APs. <b>Ad hoc</b>: devices connect directly to each other. <b>Mesh</b>: APs link to each other wirelessly to extend coverage. <b>Point to point</b>: a directional bridge between two buildings.</li></ul>`},
{id:"wsec",num:"2.6",title:"Wireless security, antennas and AP types",html:`
<h3>Encryption and authentication</h3>
<ul><li><b>WPA2</b> uses AES (CCMP). <b>WPA3</b> replaces the pre-shared key handshake with <b>SAE</b>, which resists offline password guessing.</li>
<li><b>Personal (PSK)</b>: everyone shares one passphrase. Fine at home, poor in a business because you can't revoke one person.</li>
<li><b>Enterprise</b>: each user signs in with their own credentials through <b>802.1X</b> and a <b>RADIUS</b> server.</li>
<li><b>Guest networks</b> are isolated from the internal LAN, often with a <b>captive portal</b> that shows terms or asks for a code before granting access.</li></ul>
<h3>Antennas</h3>
<p><b>Omnidirectional</b> antennas radiate in all directions horizontally, which suits an AP in the middle of a room. <b>Directional</b> antennas (Yagi, patch, parabolic) focus the signal in one direction for long hallways, outdoor links or building-to-building bridges.</p>
<div class="viz" id="viz-ant"></div>
<h3>Autonomous vs lightweight APs</h3>
<p>An <b>autonomous</b> AP is configured on its own, one at a time. A <b>lightweight</b> AP is managed by a <b>wireless LAN controller</b> (or a cloud controller) that pushes settings, firmware and channel plans, usually over CAPWAP.</p>`},
{id:"physical",num:"2.7",title:"Physical installation: racks, power and environment",html:`
<h3>Where things go</h3>
<p>The <b>MDF</b> (main distribution frame) is the central wiring room where the provider circuits and core equipment live. Each floor or wing has an <b>IDF</b> (intermediate distribution frame) that links back to the MDF.</p>
<h3>Racks</h3>
<ul><li>Standard racks are 19 inches wide and measured in rack units: <b>1U = 1.75 inches</b>. A full rack is usually 42U.</li>
<li>Match airflow to the room: <b>port-side intake</b> or <b>port-side exhaust</b> fans must line up with the <b>hot aisle / cold aisle</b> layout, or devices recirculate their own hot air.</li>
<li><b>Patch panels</b> terminate copper runs, and <b>fiber distribution panels</b> terminate fiber. Use <b>lockable</b> racks or cages for physical security.</li>
<li>Put heavy items like UPS units at the bottom.</li></ul>
<h3>Power</h3>
<ul><li><b>UPS</b>: batteries that keep equipment running through short outages and give time for a clean shutdown or a generator start.</li>
<li><b>PDU</b>: a power strip for racks, often metered or switchable per outlet.</li>
<li>Know the <b>power load</b>: total watts must stay within the circuit and PDU rating. A common rule is to load a circuit to no more than 80%. Check the <b>voltage</b> (120 V or 208/230 V) the equipment needs.</li></ul>
<div class="viz" id="viz-rack"></div>
<h3>Environment</h3>
<ul><li><b>Temperature</b>: keep intake air cool (roughly 18 to 27 °C).</li><li><b>Humidity</b>: too low causes static discharge, too high causes condensation. Aim for about 40 to 60%.</li><li><b>Fire suppression</b>: clean-agent gas systems protect equipment better than water sprinklers.</li></ul>`}
];

const C=[
 ["Longest prefix match","The most specific matching route wins"],["Administrative distance","How trusted a route source is; lower wins"],["AD of a connected route","0"],["AD of a static route","1"],["AD of OSPF","110"],["AD of EIGRP (internal)","90"],["AD of RIP","120"],["AD of eBGP","20"],["AD of iBGP","200"],["Default route","0.0.0.0/0, used when nothing more specific matches"],["Floating static route","A static route with a high AD that acts as a backup"],
 ["RIP metric","Hop count, max 15"],["OSPF type and metric","Link state; cost based on bandwidth"],["OSPF backbone","Area 0"],["EIGRP","Cisco advanced distance vector protocol"],["BGP","Path vector protocol that routes between autonomous systems"],["IGP vs EGP","IGPs route inside one organization; BGP (EGP) between organizations"],
 ["Static NAT","One private address to one public address"],["PAT","Many hosts share one public IP, tracked by source port"],["FHRP","Several routers share a virtual gateway IP so hosts survive a router failure"],["HSRP vs VRRP","HSRP is Cisco; VRRP is the open standard"],["VIP","Virtual IP shared by redundant routers or servers"],["Router on a stick","One router port with a subinterface per VLAN"],
 ["VLAN","A separate broadcast domain on a shared switch"],["SVI","A VLAN interface with an IP on a Layer 3 switch"],["Access port","Carries one untagged VLAN to an end device"],["Trunk port","Carries many tagged VLANs between switches"],["802.1Q tag size","4 bytes; 12-bit VLAN ID"],["Native VLAN","The untagged VLAN on a trunk; must match both ends"],["Voice VLAN","Separate VLAN for an IP phone sharing a port with a PC"],["Duplex mismatch symptom","Late collisions, CRC errors, slow throughput"],["LACP / 802.3ad","Bundles multiple links into one logical link"],["Default Ethernet MTU","1,500 bytes"],["Jumbo frame","Up to about 9,000 bytes; every hop must support it"],
 ["Why STP exists","To stop Layer 2 loops and broadcast storms"],["STP root bridge election","Lowest bridge ID (priority, then MAC) wins"],["Default STP priority","32768"],["Root port","A switch's best path toward the root bridge"],["802.1D port states","Blocking, listening, learning, forwarding"],["RSTP","802.1w; converges in seconds"],
 ["2.4 GHz non-overlapping channels","1, 6 and 11"],["802.11h","DFS and TPC for 5 GHz radar avoidance"],["DFS","Dynamic frequency selection: AP leaves a channel when it detects radar"],["Band steering","Pushes dual-band clients to 5/6 GHz"],["Channel bonding trade-off","More speed per client, fewer clean channels"],["Wi-Fi 7 max channel width","320 MHz"],["BSSID","MAC address of an AP radio"],["ESSID","One SSID across many APs for roaming"],["Ad hoc wireless","Devices connect directly without an AP"],["Wireless mesh","APs link to each other wirelessly"],
 ["WPA3 Personal handshake","SAE (simultaneous authentication of equals)"],["WPA2 encryption","AES with CCMP"],["WPA2/3-Enterprise","802.1X with a RADIUS server, per-user credentials"],["Captive portal","Web page guests must accept or sign in to before access"],["Omnidirectional antenna","Radiates all around; center-of-room coverage"],["Yagi antenna","Directional; long, narrow coverage"],["Lightweight AP","Managed by a wireless LAN controller"],
 ["MDF vs IDF","MDF is the main wiring room; IDFs serve floors and link back to it"],["1U","1.75 inches"],["Hot aisle / cold aisle","Racks face alternately so intakes share cold aisles and exhausts share hot aisles"],["UPS","Battery backup for short outages and clean shutdown"],["PDU","Rack power strip, often metered"],["Circuit loading rule of thumb","Stay at or below 80%"],["Ideal humidity","About 40 to 60%"],["Data center fire suppression","Clean-agent gas, not water"]
];
const CARDS=C.map((c,i)=>({deck:i<23?"routing":i<41?"switching":i<57?"wireless":"physical",id:"c"+i,q:c[0],a:c[1]}));

const QUIZ=[
 {q:"A router has routes to 10.0.0.0/8, 10.1.0.0/16 and 10.1.2.0/24. Which route is used for a packet to 10.1.2.77?",o:["10.0.0.0/8","10.1.0.0/16","10.1.2.0/24","The default route"],a:2,e:"Longest prefix match: the /24 is the most specific route that contains the address."},
 {q:"A router learns 172.16.5.0/24 from both OSPF and RIP. Which route is installed?",o:["RIP, because it has fewer hops","OSPF, because its administrative distance is lower","Both, load-balanced","Neither"],a:1,e:"OSPF has an AD of 110 and RIP 120. Lower AD wins when the prefix is identical."},
 {q:"What is the default administrative distance of a static route?",o:["0","1","90","110"],a:1,e:"Static routes have AD 1. Directly connected networks are 0."},
 {q:"An admin wants a static route to be used only if the OSPF route fails. What should be configured?",o:["A static route with AD 1","A floating static route with AD higher than 110","A default route","Route summarization"],a:1,e:"A floating static route has a higher AD than the dynamic route, so it only appears when OSPF's route is gone."},
 {q:"Which route matches any destination not found elsewhere in the table?",o:["127.0.0.0/8","0.0.0.0/0","255.255.255.255/32","169.254.0.0/16"],a:1,e:"0.0.0.0/0 is the default route, the gateway of last resort."},
 {q:"Which routing protocol uses hop count as its metric with a maximum of 15?",o:["OSPF","RIP","EIGRP","BGP"],a:1,e:"RIP counts hops, and 16 means unreachable."},
 {q:"Which link-state protocol is an open standard and organizes routers into areas?",o:["EIGRP","RIP","OSPF","BGP"],a:2,e:"OSPF is link-state and uses areas, with area 0 as the backbone."},
 {q:"Which protocol exchanges routes between ISPs on the internet?",o:["OSPF","EIGRP","BGP","RIP"],a:2,e:"BGP is the path-vector exterior gateway protocol that connects autonomous systems."},
 {q:"Which protocol is described as an advanced distance vector or hybrid protocol?",o:["EIGRP","OSPF","RIP","IS-IS"],a:0,e:"EIGRP combines distance-vector behavior with some link-state features."},
 {q:"Which administrative distance does eBGP have?",o:["20","90","110","200"],a:0,e:"External BGP is 20. Internal BGP is 200."},
 {q:"A web server with a private address must be reachable from the internet at a fixed public address. Which translation is needed?",o:["PAT","Static NAT","APIPA","Dynamic DNS"],a:1,e:"Static NAT maps one public address to one private address permanently, so inbound connections work."},
 {q:"200 employees browse the internet through a single public IP address. What makes this possible?",o:["Static NAT","PAT","VRRP","802.1Q"],a:1,e:"PAT (NAT overload) tracks each connection by source port so many hosts share one address."},
 {q:"Hosts lose internet access whenever their gateway router reboots, even though a second router exists. What should be implemented?",o:["STP","An FHRP such as VRRP","LACP","Jumbo frames"],a:1,e:"An FHRP shares a virtual gateway IP between routers, so the standby router takes over."},
 {q:"Which FHRP is an open standard?",o:["HSRP","GLBP","VRRP","EIGRP"],a:2,e:"VRRP is the IETF standard. HSRP and GLBP are Cisco protocols."},
 {q:"What do hosts use as their default gateway when an FHRP is configured?",o:["The active router's physical IP","The virtual IP","The standby router's IP","The DNS server"],a:1,e:"Hosts point at the VIP, which moves to whichever router is active."},
 {q:"A router has one physical interface connected to a trunk and must route between VLANs 10, 20 and 30. What is configured?",o:["Three SVIs on the router","Subinterfaces, one per VLAN","Three access ports","A port channel"],a:1,e:"Router on a stick uses one subinterface per VLAN, each with an 802.1Q tag."},
 {q:"What is the purpose of a VLAN?",o:["To increase cable distance","To create separate broadcast domains on one switch","To encrypt traffic","To bundle links"],a:1,e:"Each VLAN is its own broadcast domain and IP subnet."},
 {q:"Which port type should connect a switch to another switch carrying several VLANs?",o:["Access","Trunk","Console","Mirror"],a:1,e:"Trunks carry multiple VLANs with 802.1Q tags."},
 {q:"How many bytes does an 802.1Q tag add to a frame?",o:["2","4","8","12"],a:1,e:"The tag is 4 bytes and contains a 12-bit VLAN ID."},
 {q:"Two switches log native VLAN mismatch errors on their trunk. What is the problem?",o:["The trunk carries too many VLANs","Each side uses a different untagged VLAN","STP is disabled","The duplex is wrong"],a:1,e:"The native (untagged) VLAN must match on both ends of a trunk."},
 {q:"An IP phone and a PC share one switch port. How does voice traffic stay separate?",o:["A voice VLAN","A second trunk","Port mirroring","A jumbo frame"],a:0,e:"The phone tags its own traffic into the voice VLAN while the PC uses the data VLAN."},
 {q:"On a Layer 3 switch, what provides the default gateway for each VLAN?",o:["A trunk port","An SVI","A native VLAN","A BPDU"],a:1,e:"A switch virtual interface gives the switch an IP address in each VLAN."},
 {q:"A server link shows late collisions and slow transfers. One side is set to full duplex and the other to auto, which fell back to half. What is the issue?",o:["MTU mismatch","Duplex mismatch","VLAN mismatch","STP loop"],a:1,e:"A duplex mismatch causes late collisions and poor throughput. Set both sides the same."},
 {q:"Four 10 Gbps links between two switches should act as one 40 Gbps logical link. What should be configured?",o:["STP","LACP link aggregation","Subinterfaces","VRRP"],a:1,e:"LACP (802.3ad) bundles links into one port channel."},
 {q:"A storage network is upgraded to use 9,000-byte frames, but transfers fail through one switch. What is likely wrong?",o:["The switch doesn't have jumbo frames enabled","The native VLAN is wrong","STP blocked the port","The switch needs PoE"],a:0,e:"Every device on the path must support the larger MTU, or jumbo frames are dropped or fragmented."},
 {q:"What is the default Ethernet MTU?",o:["576 bytes","1,500 bytes","9,000 bytes","65,535 bytes"],a:1,e:"Standard Ethernet payload is 1,500 bytes."},
 {q:"A technician connects two switch ports to each other with a patch cable and the network slows to a crawl with flooding broadcasts. What protects against this?",o:["Spanning Tree Protocol","Port aggregation","QoS","DHCP snooping"],a:0,e:"STP detects the loop and blocks a port, preventing a broadcast storm."},
 {q:"How is the STP root bridge chosen?",o:["Highest MAC address","Lowest bridge ID","Most ports","Fastest uplink"],a:1,e:"The lowest bridge ID wins: priority first, then MAC address."},
 {q:"An old access switch became the STP root bridge, making traffic take a poor path. What is the best fix?",o:["Remove the old switch","Lower the STP priority on the core switch","Disable STP","Raise the core switch's MAC address"],a:1,e:"Setting a lower priority on the core switch makes it the root on purpose."},
 {q:"What is the correct order of 802.1D port states as a port comes up?",o:["Listening, blocking, learning, forwarding","Blocking, listening, learning, forwarding","Learning, listening, blocking, forwarding","Blocking, learning, listening, forwarding"],a:1,e:"Blocking, then listening, then learning (building the MAC table), then forwarding."},
 {q:"Which STP version converges in a few seconds?",o:["802.1D","802.1w (RSTP)","802.1Q","802.3ad"],a:1,e:"Rapid Spanning Tree (802.1w) converges much faster than classic STP."},
 {q:"What does the STP root port on a non-root switch lead to?",o:["The fastest server","The root bridge, by the lowest-cost path","The default gateway","The internet"],a:1,e:"Each non-root switch has exactly one root port: its best path to the root bridge."},
 {q:"An AP on a 5 GHz channel suddenly switches channels near an airport. Which feature caused this?",o:["Band steering","DFS","WPA3","MU-MIMO"],a:1,e:"Dynamic frequency selection (802.11h) moves the AP off channels where radar is detected."},
 {q:"In a dense office, users report poor Wi-Fi because 80 MHz channels overlap between APs. What helps most?",o:["Increase to 160 MHz","Reduce channel width to 20 or 40 MHz","Switch to 2.4 GHz only","Disable WPA3"],a:1,e:"Narrower channels give more non-overlapping channels, reducing interference between APs."},
 {q:"Which feature encourages dual-band clients to connect on 5 GHz instead of 2.4 GHz?",o:["Band steering","DFS","TPC","Captive portal"],a:0,e:"Band steering delays or discourages 2.4 GHz associations from 5 GHz-capable clients."},
 {q:"Which identifier is the MAC address of a single AP radio?",o:["SSID","ESSID","BSSID","VLAN ID"],a:2,e:"The BSSID identifies one radio. Many radios can share an SSID (an ESSID)."},
 {q:"Several APs broadcast the same SSID so users can walk through the building without reconnecting. What is this?",o:["Ad hoc","ESSID roaming","Point to point","Mesh only"],a:1,e:"An extended service set shares one SSID across APs for roaming."},
 {q:"Two buildings 300 m apart need a wireless link. What setup fits?",o:["Ad hoc with omnidirectional antennas","Point to point with directional antennas","A captive portal","A mesh of indoor APs"],a:1,e:"Directional antennas aimed at each other create a focused point-to-point bridge."},
 {q:"Which Wi-Fi standard is the first to support 320 MHz channels?",o:["802.11ac","802.11ax","802.11be","802.11n"],a:2,e:"Wi-Fi 7 (802.11be) introduces 320 MHz channels in the 6 GHz band."},
 {q:"Which WPA3 feature protects personal networks against offline dictionary attacks?",o:["TKIP","SAE","WEP","WPS"],a:1,e:"Simultaneous authentication of equals replaces the WPA2 four-way PSK exchange."},
 {q:"A company wants to disable Wi-Fi access for one employee who left without changing everyone's password. What should it use?",o:["WPA2-Personal","WPA3-Enterprise with RADIUS","An open network","MAC filtering only"],a:1,e:"Enterprise mode uses per-user credentials through 802.1X, so one account can be disabled."},
 {q:"A coffee shop wants guests to accept terms before browsing. What should be set up?",o:["Captive portal","802.1X","DFS","A trunk port"],a:0,e:"A captive portal intercepts web traffic until the guest accepts the terms or signs in."},
 {q:"An AP mounted in the center of an open-plan office should cover the whole room. Which antenna type?",o:["Yagi","Parabolic","Omnidirectional","Patch aimed at a wall"],a:2,e:"Omnidirectional antennas radiate in all horizontal directions."},
 {q:"A long warehouse aisle needs coverage along its length. Which antenna is best?",o:["Omnidirectional","Directional (Yagi or patch)","Dipole on the ceiling center","No antenna"],a:1,e:"Directional antennas concentrate signal down a narrow, long area."},
 {q:"APs receive their configuration and firmware from a central controller. What type are they?",o:["Autonomous","Lightweight","Ad hoc","Repeaters"],a:1,e:"Lightweight APs are managed by a WLAN controller."},
 {q:"Where are the ISP demarcation and core switches typically located?",o:["IDF","MDF","Closet on each floor","Telecom pole"],a:1,e:"The main distribution frame is the central wiring point. IDFs serve floors or wings."},
 {q:"How tall is a 2U device?",o:["1.75 inches","3.5 inches","5.25 inches","19 inches"],a:1,e:"1U is 1.75 inches, so 2U is 3.5 inches."},
 {q:"New switches are installed with their fans blowing exhaust into the cold aisle. What was overlooked?",o:["Port-side intake vs exhaust airflow direction","Rack width","PoE budget","VLAN numbering"],a:0,e:"Switch airflow must match the hot aisle/cold aisle layout."},
 {q:"Which device keeps equipment powered during a short outage?",o:["PDU","UPS","Patch panel","Surge-only strip"],a:1,e:"A UPS has batteries to ride through outages."},
 {q:"A 20 A, 120 V circuit should carry a continuous load of no more than about how many watts?",o:["1,200 W","1,920 W","2,400 W","3,000 W"],a:1,e:"120 V × 20 A = 2,400 W, and 80% of that is 1,920 W."},
 {q:"Where should a heavy rack UPS be installed?",o:["At the top","At the bottom","In the middle","Outside the rack"],a:1,e:"Heavy equipment goes low to keep the rack stable."},
 {q:"A server room has frequent static shocks. What environmental factor is likely too low?",o:["Temperature","Humidity","Airflow","Voltage"],a:1,e:"Low humidity increases electrostatic discharge. Aim for roughly 40–60%."},
 {q:"Which fire suppression method is best for a data center?",o:["Water sprinklers","Clean-agent gas","Dry chemical powder","Foam"],a:1,e:"Clean agents put out fires without damaging electronics."},
 {q:"Which panel terminates fiber runs in a rack?",o:["Patch panel for copper","Fiber distribution panel","PDU","Punchdown block"],a:1,e:"A fiber distribution panel organizes and protects fiber terminations."},
 {q:"Which component is metered and distributes power to devices within a rack?",o:["PDU","UPS","ATS only","Generator"],a:0,e:"A power distribution unit is the rack's power strip, often with metering per outlet."}
];

registerModule({
  id:"imp",slug:"implementation",title:"Network Implementation",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:[["routing","Routing"],["switching","Switching"],["wireless","Wireless"],["physical","Physical"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["lpm","pat","fhrp","tag","stp","width","ant","rack"],
  viz(){

/* ---- Routing table lookup ---- */
(function(){
  const el=$("#viz-lpm");
  const RT=[["0.0.0.0/0","203.0.113.1","Static (default)",1],["10.0.0.0/8","10.255.0.1","OSPF",110],["10.20.0.0/16","10.255.0.5","OSPF",110],["10.20.30.0/24","10.255.0.9","EIGRP",90],["10.20.30.128/25","Gi0/2","Connected",0],["192.168.50.0/24","10.255.0.13","RIP",120],["192.168.50.0/24","10.255.0.17","OSPF",110]];
  const DST=["10.20.30.200","10.20.30.12","10.20.99.1","10.77.1.1","192.168.50.9","8.8.8.8"];
  const toInt=s=>s.split(".").reduce((a,o)=>(a*256)+ +o,0);
  const match=(ip,c)=>{const [n,p]=c.split("/");return Math.floor(toInt(ip)/2**(32-p))===Math.floor(toInt(n)/2**(32-p))||+p===0};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Pick a destination and watch the router choose</div><div class="chips">${DST.map(d=>`<button class="chip mono" data-d="${d}">${d}</button>`).join("")}</div>
  <div class="scroll"><table class="rt"><thead><tr><th>Prefix</th><th>Next hop</th><th>Source</th><th>AD</th></tr></thead><tbody></tbody></table></div><div class="caption" aria-live="polite">Each row is a route. Pick a destination address.</div>`;
  function draw(d){
    const hits=d?RT.map((r,i)=>match(d,r[0])?i:-1).filter(i=>i>=0):[];
    let win=-1;if(hits.length){const lp=Math.max(...hits.map(i=>+RT[i][0].split("/")[1]));const c=hits.filter(i=>+RT[i][0].split("/")[1]===lp);win=c.sort((a,b)=>RT[a][3]-RT[b][3])[0]}
    $("tbody",el).innerHTML=RT.map((r,i)=>`<tr class="${i===win?"win":hits.includes(i)?"hit":""}"><td class="port">${r[0]}</td><td class="mono">${r[1]}</td><td>${r[2]}</td><td class="mono">${r[3]}</td></tr>`).join("");
    if(!d)return;const w=RT[win],lp=+w[0].split("/")[1],tie=hits.filter(i=>+RT[i][0].split("/")[1]===lp).length>1;
    $(".caption",el).innerHTML=`<b class="mono">${d}</b> matches ${hits.length} route${hits.length>1?"s":""}. ${tie?`Two routes have the same /${lp} prefix, so <b>administrative distance</b> breaks the tie: ${w[2]} (AD ${w[3]}) beats the other.`:`The most specific is <b class="mono">${w[0]}</b> (longest prefix match), so the packet goes to <b>${w[1]}</b>.`}`;
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b)return;seen.add(b.dataset.d);el.querySelectorAll("[data-d]").forEach(x=>x.setAttribute("aria-pressed",x===b));draw(b.dataset.d);if(seen.size>=4)award("viz:lpm",30,"Routed four packets by hand")});
  draw();
})();

/* ---- PAT translation table ---- */
(function(){
  const el=$("#viz-pat");
  const H=[["Laptop","192.168.1.21",51000],["Phone","192.168.1.34",51000],["Desktop","192.168.1.40",49152],["Tablet","192.168.1.57",60500]];
  let rows=[],next=1024+Math.floor(Math.random()*20)*7;
  el.innerHTML=`<div class="viz-title">Watch PAT share one public address</div><div class="chips">${H.map((h,i)=>`<button class="chip" data-h="${i}">${h[0]} opens a website</button>`).join("")}</div>
  <div class="pat-flow"><div class="pat-box"><span class="s-small">INSIDE</span><b class="mono pat-in">—</b></div><div class="pat-arrow">→ NAT router →</div><div class="pat-box"><span class="s-small">OUTSIDE (PUBLIC)</span><b class="mono pat-out">—</b></div></div>
  <div class="scroll"><table class="rt"><thead><tr><th>Inside local</th><th>Inside global (public)</th><th>Destination</th></tr></thead><tbody><tr><td colspan="3" class="s-note">Translation table is empty.</td></tr></tbody></table></div><div class="caption" aria-live="polite"></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-h]");if(!b)return;const h=H[+b.dataset.h];const port=next++;
    rows.unshift([`${h[1]}:${h[2]}`,`198.51.100.7:${port}`,"93.184.216.34:443"]);rows=rows.slice(0,6);
    $(".pat-in",el).textContent=`${h[1]}:${h[2]}`;$(".pat-out",el).textContent=`198.51.100.7:${port}`;
    $("tbody",el).innerHTML=rows.map((r,i)=>`<tr class="${i===0?"win":""}"><td class="mono">${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td></tr>`).join("");
    $(".caption",el).innerHTML=`Every device leaves as <b class="mono">198.51.100.7</b>. ${h[2]===51000&&rows.filter(r=>r[0].endsWith(":51000")).length>1?"The laptop and phone even used the same source port, but the router gave each a different public port, so replies still reach the right one.":"The router picks a unique public source port, and uses it to send the reply back to the right inside host."}`;
    if(rows.length>=3)award("viz:pat",20,"Translated with PAT")});
})();

/* ---- FHRP failover ---- */
(function(){
  const el=$("#viz-fhrp");let down=false;
  el.innerHTML=`<div class="viz-title">Fail the active gateway</div><div class="viz-scroll"><svg viewBox="0 0 600 250" style="min-width:420px" role="img" aria-label="FHRP diagram"></svg></div>
  <div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="fail">Power off Router A</button></div>`;
  const svg=$("svg",el);
  function draw(){
    const act=down?"B":"A";
    svg.innerHTML=`<line class="m-link${!down?" on":""}" x1="300" y1="200" x2="170" y2="70"/><line class="m-link${down?" on":""}" x1="300" y1="200" x2="430" y2="70"/>
    <line class="m-link" x1="170" y1="70" x2="300" y2="20"/><line class="m-link" x1="430" y1="70" x2="300" y2="20"/>
    <rect x="240" y="0" width="120" height="34" rx="9" class="s-node"/><text x="300" y="22" text-anchor="middle" class="s-b" style="font-size:13px">Internet</text>
    <g class="m-node${!down?" on":""}${down?" tp-off":""}"><rect x="110" y="50" width="120" height="44" rx="9"/><text x="170" y="69" text-anchor="middle" class="s-b" style="font-size:13px">Router A</text><text x="170" y="86" text-anchor="middle" class="s-small">${down?"OFFLINE":"Active · .2"}</text></g>
    <g class="m-node${down?" on":""}"><rect x="370" y="50" width="120" height="44" rx="9"/><text x="430" y="69" text-anchor="middle" class="s-b" style="font-size:13px">Router B</text><text x="430" y="86" text-anchor="middle" class="s-small">${down?"Active · .3":"Standby · .3"}</text></g>
    <rect x="200" y="112" width="200" height="30" rx="15" class="fh-vip"/><text x="300" y="132" text-anchor="middle" class="s-b" style="font-size:12.5px">VIP 10.0.0.1 → Router ${act}</text>
    <g class="m-node"><rect x="240" y="180" width="120" height="40" rx="9"/><text x="300" y="198" text-anchor="middle" class="s-b" style="font-size:13px">Hosts</text><text x="300" y="213" text-anchor="middle" class="s-small">gateway 10.0.0.1</text></g>`;
    $(".caption",el).innerHTML=down?"<span class=\"status-good\">Failover.</span> Router B stopped hearing hellos from A and took over the virtual IP and virtual MAC. The hosts' gateway setting never changed, so they barely notice.":"Both routers share the virtual IP <b class=\"mono\">10.0.0.1</b>. Router A is active and sends hello messages. Router B is on standby, listening.";
    $('[data-a="fail"]',el).textContent=down?"Bring Router A back":"Power off Router A";
  }
  el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;down=!down;draw();if(down)award("viz:fhrp",20,"Watched a gateway fail over")});draw();
})();

/* ---- 802.1Q tagging ---- */
(function(){
  const el=$("#viz-tag");
  const P={pc1:[70,60,"PC · VLAN 10",10],pc2:[70,190,"Phone · VLAN 20",20],pc3:[530,60,"Server · VLAN 10",10],pc4:[530,190,"Printer · VLAN 20",20]};
  let st=0,from=null,anim=null;
  el.innerHTML=`<div class="viz-title">Send a frame across a trunk</div><div class="chips"><button class="chip" data-f="pc1">From the VLAN 10 PC</button><button class="chip" data-f="pc2">From the VLAN 20 phone</button></div>
  <div class="viz-scroll"><svg viewBox="0 0 600 250" style="min-width:440px" role="img" aria-label="VLAN trunk diagram"></svg></div><div class="caption" aria-live="polite">Pick a sender.</div>`;
  const svg=$("svg",el);
  function base(){let s=`<line class="m-link" x1="70" y1="60" x2="200" y2="125"/><line class="m-link" x1="70" y1="190" x2="200" y2="125"/><line class="m-link" x1="400" y1="125" x2="530" y2="60"/><line class="m-link" x1="400" y1="125" x2="530" y2="190"/>
    <line class="m-link tr-l" x1="200" y1="125" x2="400" y2="125"/><text x="300" y="112" text-anchor="middle" class="s-small">TRUNK · 802.1Q</text>
    <g class="m-node"><rect x="150" y="104" width="100" height="42" rx="9"/><text x="200" y="130" text-anchor="middle" class="s-b" style="font-size:13px">Switch 1</text></g>
    <g class="m-node"><rect x="350" y="104" width="100" height="42" rx="9"/><text x="400" y="130" text-anchor="middle" class="s-b" style="font-size:13px">Switch 2</text></g>`;
    for(const[k,[x,y,n,v]]of Object.entries(P))s+=`<g class="m-node v${v}"><rect x="${x-62}" y="${y-18}" width="124" height="36" rx="9"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b" style="font-size:12px">${n}</text></g>`;
    return s+`<g class="tag-f" transform="translate(-200,-200)"><rect x="-38" y="-13" width="76" height="26" rx="6"/><text y="5" text-anchor="middle" class="s-b" style="font-size:11px"></text></g>`}
  function go(k){cancelAnimationFrame(anim);svg.innerHTML=base();const v=P[k][3],dest=Object.entries(P).find(([kk,p])=>kk!==k&&p[3]===v)[0];
    const g=$(".tag-f",svg),t=$("text",g);const path=[[P[k][0],P[k][1],"untagged"],[200,125,"tag "+v],[400,125,"tag "+v],[P[dest][0],P[dest][1],"untagged"]];
    const caps=[`The ${P[k][2].split(" ·")[0].toLowerCase()} sends an ordinary <b>untagged</b> frame into its access port.`,`Switch 1 sees the frame must cross the trunk, so it inserts a 4-byte <b>802.1Q tag: VLAN ${v}</b>.`,`Switch 2 reads the tag and knows this frame belongs to VLAN ${v}. It only forwards to VLAN ${v} ports.`,`Switch 2 strips the tag and delivers an untagged frame to the ${P[dest][2].split(" ·")[0].toLowerCase()}. The VLAN ${v===10?20:10} devices never see it.`];
    g.setAttribute("class","tag-f v"+v);
    let i=0;const step=()=>{const [x,y,lab]=path[i];g.setAttribute("transform",`translate(${x},${y-30})`);t.textContent=lab;$(".caption",el).innerHTML=caps[i];i++;if(i<path.length)anim=setTimeout(step,REDUCED?0:1300);else award("viz:tag",20,"Tagged a frame across a trunk")};step()}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;clearTimeout(anim);el.querySelectorAll("[data-f]").forEach(x=>x.setAttribute("aria-pressed",x===b));go(b.dataset.f)});
  svg.innerHTML=base();
})();

/* ---- STP election ---- */
(function(){
  const el=$("#viz-stp");
  const SW=[{n:"SW-A",x:300,y:40,pri:32768,mac:"00:1a:2b:00:00:0a"},{n:"SW-B",x:130,y:200,pri:32768,mac:"00:1a:2b:00:00:05"},{n:"SW-C",x:470,y:200,pri:32768,mac:"00:1a:2b:00:00:0c"}];
  const LK=[[0,1],[0,2],[1,2]];
  el.innerHTML=`<div class="viz-title">Elect a root bridge and break the loop</div><div class="viz-scroll"><svg viewBox="0 0 600 260" style="min-width:440px" role="img" aria-label="Spanning tree diagram"></svg></div>
  <div class="chips">${SW.map((s,i)=>`<button class="chip" data-p="${i}">Set ${s.n} priority to 4096</button>`).join("")}<button class="chip" data-p="r">Reset priorities</button></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el);let tries=new Set();
  function draw(){
    const bid=s=>s.pri*1e6+parseInt(s.mac.slice(-2),16);const root=SW.reduce((a,s,i)=>bid(s)<bid(SW[a])?i:a,0);
    const others=[0,1,2].filter(i=>i!==root);/* the link between the two non-roots gets blocked on the side of the higher bridge ID */
    const hi=bid(SW[others[0]])>bid(SW[others[1]])?others[0]:others[1];
    let s="";LK.forEach(([a,b])=>{const blocked=a!==root&&b!==root;const A=SW[a],B=SW[b];s+=`<line class="m-link${blocked?" stp-b":" on"}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`;
      if(blocked){const t=.78,P=SW[hi],Q=SW[hi===a?b:a];s+=`<circle cx="${P.x+(Q.x-P.x)*(1-t)}" cy="${P.y+(Q.y-P.y)*(1-t)}" r="9" class="stp-x"/><text x="${P.x+(Q.x-P.x)*(1-t)}" y="${P.y+(Q.y-P.y)*(1-t)+4}" text-anchor="middle" class="s-b" style="font-size:11px">✕</text>`}});
    SW.forEach((w,i)=>s+=`<g class="m-node${i===root?" on":""}"><rect x="${w.x-80}" y="${w.y-26}" width="160" height="52" rx="10"/><text x="${w.x}" y="${w.y-6}" text-anchor="middle" class="s-b" style="font-size:13px">${w.n}${i===root?" ★ ROOT":""}</text><text x="${w.x}" y="${w.y+12}" text-anchor="middle" class="s-small" style="font-size:10px">${w.pri} · ${w.mac}</text></g>`);
    svg.innerHTML=s;
    const changed=SW.some(w=>w.pri!==32768);
    $(".caption",el).innerHTML=`<b>${SW[root].n}</b> is root because it has the lowest bridge ID ${changed?"(its priority is lowest)":"(all priorities tie at 32768, so the lowest MAC address wins)"}. The link between the other two switches would complete a loop, so <b>${SW[hi].n}</b> blocks its port on that link (the higher bridge ID loses). If an active link fails, that port starts forwarding.`;
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;SW.forEach(w=>w.pri=32768);if(b.dataset.p!=="r"){SW[+b.dataset.p].pri=4096;tries.add(b.dataset.p)}draw();if(tries.size>=2)award("viz:stp",30,"Steered the spanning tree root")});
  draw();
})();

/* ---- 5 GHz channel width ---- */
(function(){
  const el=$("#viz-width");const CH=[36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140,144,149,153,157,161,165];
  const DFS=c=>c>=52&&c<=144;let w=20;const seen=new Set();
  el.innerHTML=`<div class="viz-title">How many clean 5 GHz channels at each width?</div><div class="chips">${[20,40,80,160].map(x=>`<button class="chip" data-w="${x}">${x} MHz</button>`).join("")}</div>
  <div class="cw"></div><div class="legend"><span><i style="background:var(--accent)"></i>Non-DFS</span><span><i style="background:var(--gold)"></i>DFS (radar rules apply)</span></div><div class="caption" aria-live="polite"></div>`;
  function groups(){const g=w/20,out=[];const blocks=[[36,64],[100,144],[149,165]];
    blocks.forEach(([a,b])=>{const cs=CH.filter(c=>c>=a&&c<=b);for(let i=0;i+g<=cs.length;i+=g){if(w===160&&a===149)break;out.push(cs.slice(i,i+g))}});return out}
  function draw(){el.querySelectorAll("[data-w]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.w===w));
    const G=groups();const used=new Set(G.flat());
    $(".cw",el).innerHTML=CH.map(c=>{const gi=G.findIndex(g=>g.includes(c));return `<div class="cw-c${used.has(c)?"":" off"}${DFS(c)?" dfs":""}${gi>=0&&G[gi][0]===c?" start":""}" title="Channel ${c}">${c}</div>`}).join("");
    $(".caption",el).innerHTML=`At <b>${w} MHz</b> you get <b>${G.length}</b> non-overlapping channels${G.filter(g=>g.some(DFS)).length?`, and ${G.filter(g=>g.some(DFS)).length} of them include DFS channels`:""}. ${w>=80?"Wider channels are faster per client, but in a building with many APs there aren't enough to go around, so neighbors interfere.":"Narrow channels mean more APs can each have a clean channel, which matters in dense offices."}`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-w]");if(!b)return;w=+b.dataset.w;seen.add(w);draw();if(seen.size>=3)award("viz:width",20,"Compared channel widths")});draw();
})();

/* ---- Antenna patterns ---- */
(function(){
  const el=$("#viz-ant");
  const A={omni:{n:"Omnidirectional",d:"M300,40 C410,40 470,90 470,140 C470,190 410,240 300,240 C190,240 130,190 130,140 C130,90 190,40 300,40Z",t:"Even coverage all around the AP. Best for a room or open office with the AP in the middle."},
    patch:{n:"Patch (panel)",d:"M300,140 C330,60 430,50 500,90 C540,115 540,165 500,190 C430,230 330,220 300,140Z",t:"A wide-ish beam in one direction, about 60 to 90 degrees. Mount it on a wall to cover the room in front of it, not the room behind."},
    yagi:{n:"Yagi",d:"M300,140 C360,110 500,105 580,125 C595,132 595,148 580,155 C500,175 360,170 300,140Z",t:"A narrow, long beam. Good for a corridor, a warehouse aisle or a link to another building."},
    dish:{n:"Parabolic dish",d:"M300,140 C380,128 520,128 590,134 C596,137 596,143 590,146 C520,152 380,152 300,140Z",t:"The narrowest, longest beam. Used for point-to-point links over kilometers. It needs careful aiming."}};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Compare antenna coverage</div><div class="chips">${Object.entries(A).map(([k,a])=>`<button class="chip" data-k="${k}">${a.n}</button>`).join("")}</div>
  <div class="viz-scroll"><svg viewBox="0 0 600 280" style="min-width:380px" role="img" aria-label="Antenna radiation pattern"></svg></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el);
  function draw(k){svg.innerHTML=`<circle cx="300" cy="140" r="120" class="ant-ring"/><circle cx="300" cy="140" r="60" class="ant-ring"/><path class="ant-p" d="${A[k].d}"/><circle cx="300" cy="140" r="8" class="m-dot" style="opacity:1"/><text x="300" y="272" text-anchor="middle" class="s-small">Top-down view. The dot is the antenna.</text>`;
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));$(".caption",el).innerHTML=`<b>${A[k].n}.</b> ${A[k].t}`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;seen.add(b.dataset.k);draw(b.dataset.k);if(seen.size===4)award("viz:ant",20,"Compared antenna patterns")});draw("omni");
})();

/* ---- Rack power planner ---- */
(function(){
  const el=$("#viz-rack");
  const D=[["UPS 1500VA",2,0,"ups"],["Patch panel 48",1,0,"pp"],["Fiber panel",1,0,"pp"],["PoE switch 48-port",1,740,"sw"],["Core switch",1,250,"sw"],["Firewall",1,120,"fw"],["Server",2,450,"sv"],["Server",2,450,"sv"],["Storage array",3,600,"sv"]];
  const CAP=1920;let on=new Set([0,1,3,5]);
  el.innerHTML=`<div class="viz-title">Fill a 16U rack on one 20 A, 120 V circuit</div>
  <div class="rack-wrap"><div class="rack"></div><div><div class="chips rk-chips">${D.map((d,i)=>`<button class="chip" data-i="${i}">${d[0]} · ${d[1]}U${d[2]?" · "+d[2]+" W":""}</button>`).join("")}</div>
  <div class="pw"><div class="pw-bar"><i></i><b title="80% line"></b></div><div class="pw-t mono"></div></div></div></div><div class="caption" aria-live="polite"></div>`;
  function draw(){
    const items=[...on].sort((a,b)=>(D[a][3]==="ups"?-1:0)-(D[b][3]==="ups"?-1:0)||a-b);
    const U=items.reduce((a,i)=>a+D[i][1],0),W=items.reduce((a,i)=>a+D[i][2],0);
    let rk="";for(const i of items)rk=`<div class="ru ${D[i][3]}" style="flex:${D[i][1]}">${D[i][0]}<em>${D[i][1]}U</em></div>`+rk;
    $(".rack",el).innerHTML=`<div class="ru empty" style="flex:${Math.max(0,16-U)}">${16-U>0?(16-U)+"U free":""}</div>`+rk;
    el.querySelectorAll("[data-i]").forEach(b=>b.setAttribute("aria-pressed",on.has(+b.dataset.i)));
    const pct=W/CAP*100;$(".pw-bar i",el).style.width=Math.min(pct,100)+"%";$(".pw-bar i",el).className=pct>100?"over":pct>80?"warn":"";
    $(".pw-t",el).textContent=`${W} W of ${CAP} W continuous (${Math.round(pct)}%)`;
    const msgs=[];if(U>16)msgs.push(`<span class="status-bad">${U}U won't fit in 16U.</span>`);if(pct>100)msgs.push('<span class="status-bad">Over the circuit rating.</span> The breaker will trip.');else if(pct>80)msgs.push('<span class="status-bad">Over 80%.</span> Fine for a moment, but not for continuous load. Add a second circuit.');
    if(!on.has(0))msgs.push("No UPS: one blip and everything reboots.");
    $(".caption",el).innerHTML=msgs.length?msgs.join(" "):`<span class="status-good">Good plan.</span> ${U}U used, load under 80%, and the UPS sits at the bottom where its weight belongs.`;
    if(!msgs.length&&on.size>=6)award("viz:rack",30,"Planned a safe rack");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const i=+b.dataset.i;on.has(i)?on.delete(i):on.add(i);draw()});draw();
})();

  },
  sims:[
    {id:"vlan",title:"Configure the switch VLANs",mount(el,api,sim){
      const PORTS=[["Gi1/0/1","Reception PC"],["Gi1/0/2","Accounting PC"],["Gi1/0/3","IP phone + PC"],["Gi1/0/4","Guest kiosk"],["Gi1/0/5","Wireless AP (staff + guest SSIDs)"],["Gi1/0/24","Uplink to core switch"]];
      const ANS=[{m:"access",v:"10"},{m:"access",v:"10"},{m:"access",v:"10",vv:"20"},{m:"access",v:"30"},{m:"trunk",n:"99"},{m:"trunk",n:"99"}];
      let S=PORTS.map(()=>({m:"access",v:"1",vv:"none",n:"1"})),g=null;
      const sel=(i,k,opts)=>`<select data-i="${i}" data-k="${k}">${opts.map(o=>`<option ${S[i][k]===o?"selected":""}>${o}</option>`).join("")}</select>`;
      function ok(i){const a=ANS[i],s=S[i];if(s.m!==a.m)return false;if(a.m==="access")return s.v===a.v&&(a.vv?s.vv===a.vv:s.vv==="none");return s.n===a.n}
      function d(){
        el.innerHTML=`${simHead(sim,api)}<div class="scenario"><p>Configure the new access switch for a branch office:</p><ol><li>Staff devices go in <b>VLAN 10 (Data)</b>.</li><li>Phones use <b>VLAN 20 (Voice)</b> on the same port as the desk PC.</li><li>Guest devices go in <b>VLAN 30 (Guest)</b>.</li><li>Links that carry several VLANs must be trunks with native <b>VLAN 99</b>, not VLAN 1.</li></ol></div>
        <div class="scroll"><table class="edt vl"><thead><tr><th>Port</th><th>Connected to</th><th>Mode</th><th>Access VLAN</th><th>Voice VLAN</th><th>Native VLAN</th></tr></thead><tbody>
        ${PORTS.map((p,i)=>`<tr class="${g?(g[i]?"g-ok":"g-no"):""}"><td class="mono">${p[0]}</td><td>${p[1]}</td><td>${sel(i,"m",["access","trunk"])}</td><td>${S[i].m==="access"?sel(i,"v",["1","10","20","30"]):"—"}</td><td>${S[i].m==="access"?sel(i,"vv",["none","10","20","30"]):"—"}</td><td>${S[i].m==="trunk"?sel(i,"n",["1","10","99"]):"—"}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="caption" aria-live="polite">${g?(g.every(Boolean)?'<span class="status-good">All six ports are correct.</span> Staff, voice and guest traffic are separated, and both multi-VLAN links are trunks.':`<b>${g.filter(Boolean).length} of 6</b> ports correct. Rows outlined in red need another look. Hint: an AP with two SSIDs on different VLANs needs more than one VLAN on its port.`):"Set each port, then check your configuration."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Check configuration</button><button class="btn" data-a="reset">Reset</button></div>`;
      }
      el.addEventListener("change",e=>{const t=e.target.closest("select[data-i]");if(!t)return;S[+t.dataset.i][t.dataset.k]=t.value;g=null;d()});
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="check"){g=PORTS.map((_,i)=>ok(i));if(g.every(Boolean))api.pass();d()}if(a==="reset"){S=PORTS.map(()=>({m:"access",v:"1",vv:"none",n:"1"}));g=null;d()}});
      d();
    }},
    {id:"ad",type:"match",title:"Rank the route sources",
      scenario:"A router hears about the same network from many sources. Match each source to its default administrative distance so you can predict which one it trusts.",
      items:[["Directly connected","0"],["Static route","1"],["eBGP","20"],["EIGRP (internal)","90"],["OSPF","110"],["RIP","120"],["iBGP","200"]],
      slots:[["0","AD 0","Most trusted"],["1","AD 1",""],["20","AD 20",""],["90","AD 90",""],["110","AD 110",""],["120","AD 120",""],["200","AD 200","Least trusted of these"]],
      success:"You can now predict which route wins any tie."},
    {id:"chan",title:"Plan the 2.4 GHz channels",mount(el,api,sim){
      const AP=[[90,70],[250,60],[410,70],[560,80],[170,190],[330,190],[490,200]];
      const ADJ=[[0,1],[1,2],[2,3],[0,4],[1,4],[1,5],[2,5],[2,6],[3,6],[4,5],[5,6]];
      let ch=AP.map(()=>0),g=null;
      function d(){
        const bad=new Set();ADJ.forEach(([a,b])=>{if(ch[a]&&ch[a]===ch[b]){bad.add(a);bad.add(b)}});
        let s="";ADJ.forEach(([a,b])=>s+=`<line class="m-link${g&&ch[a]&&ch[a]===ch[b]?" stp-b":""}" x1="${AP[a][0]}" y1="${AP[a][1]}" x2="${AP[b][0]}" y2="${AP[b][1]}"/>`);
        AP.forEach(([x,y],i)=>s=`<circle cx="${x}" cy="${y}" r="52" class="ap-cov c${ch[i]}"/>`+s);
        AP.forEach(([x,y],i)=>s+=`<g class="m-node ap-n c${ch[i]}${g&&bad.has(i)?" tp-off":""}" data-ap="${i}" tabindex="0" role="button" aria-label="AP ${i+1}, channel ${ch[i]||"unset"}"><rect x="${x-40}" y="${y-18}" width="80" height="36" rx="9"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b" style="font-size:13px">AP${i+1} · ${ch[i]||"?"}</text></g>`);
        el.innerHTML=`${simHead(sim,api)}<p class="scenario">A warehouse has seven APs on 2.4 GHz. Lines connect APs whose coverage overlaps. Tap each AP to cycle its channel through 1, 6 and 11 so that no two connected APs share a channel.</p>
        <div class="viz-scroll"><svg viewBox="0 0 650 270" style="min-width:460px" role="group" aria-label="AP floor plan">${s}</svg></div>
        <div class="caption" aria-live="polite">${g?(g===true?'<span class="status-good">Clean plan.</span> No neighboring APs share a channel, so co-channel interference is minimized.':`<span class="status-bad">${g}</span>`):"Only 1, 6 and 11 avoid overlap on 2.4 GHz."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Check plan</button><button class="btn" data-a="reset">Reset</button></div>`;
      }
      el.addEventListener("click",e=>{const n=e.target.closest("[data-ap]"),a=e.target.closest("[data-a]")?.dataset.a;
        if(n){const i=+n.dataset.ap;ch[i]=ch[i]===0?1:ch[i]===1?6:ch[i]===6?11:1;g=null;d();return}
        if(a==="reset"){ch=AP.map(()=>0);g=null;d()}
        if(a==="check"){if(ch.some(c=>!c))g="Give every AP a channel first.";else{const clash=ADJ.filter(([x,y])=>ch[x]===ch[y]);g=clash.length?`${clash.length} neighboring pair${clash.length>1?"s share":" shares"} a channel (shown in red).`:true;if(g===true)api.pass()}d()}});
      el.addEventListener("keydown",e=>{const n=e.target.closest("[data-ap]");if(n&&(e.key==="Enter"||e.key===" ")){e.preventDefault();n.dispatchEvent(new MouseEvent("click",{bubbles:true}))}});
      d();
    }},
    {id:"stp",type:"order",title:"Bring up a classic STP port",
      scenario:"A technician plugs a new switch into the network running 802.1D. Put the states its port passes through in order, from the moment the link comes up until it carries user traffic.",
      steps:["Blocking: listens for BPDUs only","Listening: takes part in the root election, no MAC learning","Learning: builds the MAC address table, still not forwarding","Forwarding: sends and receives user frames"],
      success:"That's why classic STP can take 30 to 50 seconds before a port passes traffic."}
  ],
  badges:[
    ["reader","RT","Route Reflector","Mark all 7 implementation lessons studied",c=>c.allStudied()],
    ["lab","IL","Implementation Lab","Complete all 8 implementation diagrams",c=>c.vizAll()],
    ["vlan","VL","VLAN Architect","Pass the switch VLAN simulation",c=>c.passed("vlan")],
    ["rf","RF","RF Whisperer","Pass the channel plan simulation",c=>c.passed("chan")],
    ["ad","AD","Distance Judge","Pass the administrative distance simulation",c=>c.passed("ad")],
    ["rack","RK","Rack and Stack","Plan a safe rack in the power planner",c=>c.earned("viz:rack")],
    ["recall","TR","Total Recall","Master 15 implementation flashcards",c=>c.countAtLeast(4)>=15],
    ["perfect","PP","Perfect Convergence","Score 100% on an implementation quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
