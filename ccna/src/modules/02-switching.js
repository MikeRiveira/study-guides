/* ================= Module 2: Switching and Network Access (200-301 v2.0 Domain 2.0, 25%) ================= */
(function(){
const LESSONS=[
{id:"mac",num:"2.1",title:"How switches forward frames, and Layer 2 versus Layer 3 interfaces",html:`
<p>A switch learns where each device lives by reading the <b>source MAC address</b> of every frame that arrives, and records it in the <b>MAC address table</b> (also called the CAM table) with the port and VLAN. Then it forwards using the <b>destination</b> MAC:</p>
<ul><li><b>Known unicast</b>: the destination is in the table, so the frame goes out that one port only.</li>
<li><b>Unknown unicast</b>: not in the table yet, so the switch <b>floods</b> it out every port in the VLAN except the one it came in on.</li>
<li><b>Broadcast</b> (FFFF.FFFF.FFFF) and most multicast: always flooded within the VLAN.</li>
<li>If source and destination are on the same port, the frame is <b>filtered</b> (dropped).</li></ul>
<p>Dynamic entries <b>age out</b> after 300 seconds of silence. <code>show mac address-table</code> lists them; <code>clear mac address-table dynamic</code> flushes them.</p>
<div class="viz" id="viz-maclearn"></div>
<h3>Interface types on a Catalyst switch</h3>
<table><tr><th>Type</th><th>What it is</th><th>Configured with</th></tr>
<tr><td>Access port</td><td>Layer 2, carries one data VLAN (plus an optional voice VLAN), untagged</td><td><code>switchport mode access</code></td></tr>
<tr><td>Trunk port</td><td>Layer 2, carries many VLANs, 802.1Q-tagged</td><td><code>switchport mode trunk</code></td></tr>
<tr><td>Routed port</td><td>Layer 3, behaves like a router interface with its own IP</td><td><code>no switchport</code> then <code>ip address</code></td></tr>
<tr><td>SVI</td><td>A virtual Layer 3 interface for a whole VLAN, the VLAN's gateway on a multilayer switch</td><td><code>interface vlan 10</code> plus <code>ip routing</code></td></tr>
<tr><td>Port channel</td><td>Several physical links bundled into one logical one</td><td><code>channel-group</code></td></tr></table>
<div class="viz" id="viz-l2l3"></div>
<div class="tip"><b>Exam tip.</b> A switch with only access and trunk ports is a Layer 2 device: it needs <code>ip default-gateway</code> for its own management traffic. A multilayer switch with <code>ip routing</code> routes between SVIs and routed ports.</div>`},
{id:"vlan",num:"2.2",title:"VLANs and 802.1Q trunks",html:`
<p>A <b>VLAN</b> is a separate broadcast domain on the same switch hardware. Each VLAN is usually its own IP subnet, and traffic between VLANs must be <b>routed</b>, by a router or a multilayer switch.</p>
<pre class="term">SW1(config)# vlan 10
SW1(config-vlan)# name SALES
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name ENG
SW1(config-vlan)# interface range g1/0/2 - 3
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1# show vlan brief</pre>
<p>VLAN 1 is the default: every port starts there. Normal-range VLANs are 1–1005; extended are 1006–4094. VLANs 1002–1005 are reserved for legacy Token Ring and FDDI.</p>
<div class="viz" id="viz-vlanmini"></div>
<h3>802.1Q trunks</h3>
<p>A trunk carries many VLANs on one link. The switch inserts a 4-byte <b>802.1Q tag</b> after the source MAC address so the far end knows which VLAN each frame belongs to.</p>
<div class="viz" id="viz-dot1q"></div>
<ul><li>The <b>native VLAN</b> is sent <b>untagged</b>. It defaults to VLAN 1 and must match on both ends. A mismatch leaks traffic between VLANs, and CDP logs <code>%CDP-4-NATIVE_VLAN_MISMATCH</code>. Best practice is an unused native VLAN, such as 99.</li>
<li>The <b>allowed VLAN list</b> limits what crosses: <code>switchport trunk allowed vlan 10,20,99</code>. Use <code>allowed vlan add 30</code> later, or you'll replace the whole list.</li>
<li><code>show interfaces trunk</code> shows trunking ports, the native VLAN, allowed VLANs and the ones actually forwarding.</li></ul>
<pre class="term">SW1(config)# interface g1/0/12
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99
SW1(config-if)# switchport nonegotiate</pre>
<h3>DTP</h3>
<p>Cisco's <b>Dynamic Trunking Protocol</b> can negotiate trunks. <code>dynamic desirable</code> actively asks; <code>dynamic auto</code> only answers. Two <code>auto</code> ports never form a trunk. Best practice: hard-code <code>switchport mode trunk</code> or <code>access</code> and turn DTP off with <code>switchport nonegotiate</code>, because a DTP-speaking attacker could negotiate a trunk.</p>
<div class="viz" id="viz-dtp"></div>
<h3>Inter-VLAN routing</h3>
<p><b>Router on a stick</b>: one router interface is a trunk, with a subinterface per VLAN (<code>interface g0/0/1.10</code>, <code>encapsulation dot1Q 10</code>, <code>ip address</code>). <b>SVIs on a multilayer switch</b> are faster and the usual design today.</p>`},
{id:"ec",num:"2.3",title:"EtherChannel with LACP",html:`
<p>Two links between the same switches would normally lose one to spanning tree. <b>EtherChannel</b> bundles up to eight physical links into one logical <b>port channel</b>, so STP sees one link, all members carry traffic, and losing one member just reduces bandwidth.</p>
<h3>Negotiation protocols</h3>
<table><tr><th>Protocol</th><th>Modes</th><th>Forms a channel when</th></tr>
<tr><td><b>LACP</b> (IEEE 802.3ad / 802.1AX, open standard)</td><td><code>active</code>, <code>passive</code></td><td>At least one side is active</td></tr>
<tr><td><b>PAgP</b> (Cisco proprietary)</td><td><code>desirable</code>, <code>auto</code></td><td>At least one side is desirable</td></tr>
<tr><td>Static</td><td><code>on</code></td><td>Both sides are on. No negotiation at all</td></tr></table>
<div class="viz" id="viz-lacp"></div>
<pre class="term">SW1(config)# interface range g1/0/11 - 12
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# channel-group 1 mode active
SW1(config-if-range)# interface port-channel 1
SW1(config-if)# switchport mode trunk
SW1# show etherchannel summary</pre>
<p>Members must match: same speed and duplex, same switchport mode, same access VLAN or same trunk allowed list and native VLAN. A mismatched member shows <b>(s) suspended</b>. A member whose partner isn't negotiating shows <b>(I) stand-alone</b>. A healthy bundle shows <b>Po1(SU)</b>: Layer 2 (S), in use (U), with members flagged <b>(P)</b>.</p>
<p>Traffic is spread by a <b>hash</b> of addresses (<code>port-channel load-balance src-dst-ip</code>), so one flow always uses one member. A single big transfer won't go faster than one link.</p>
<div class="viz" id="viz-ecread"></div>
<div class="tip"><b>Layer 3 EtherChannel</b>: on a multilayer switch, put <code>no switchport</code> on the members and the port channel, then give the port channel the IP address.</div>`},
{id:"edge",num:"2.4",title:"Edge ports: wireless APs, IP phones, PoE and virtual hosts",html:`
<h3>Access points and the WLAN architecture</h3>
<ul><li><b>Autonomous AP</b>: configured one by one, each AP is its own controller. Its switch port is usually a <b>trunk</b> if it serves several SSIDs on different VLANs.</li>
<li><b>Lightweight AP with a WLC</b>: APs join a <b>Wireless LAN Controller</b> using <b>CAPWAP</b> (UDP 5246 control, 5247 data). In <b>local mode</b>, client traffic is tunneled to the WLC, so the AP's switch port is an <b>access port</b>. In <b>FlexConnect</b> mode, the AP can switch traffic locally at a branch, so its port is a trunk.</li>
<li><b>Cloud-managed</b> (e.g. Meraki): the controller is in the cloud, only management goes there.</li>
<li>The WLC's own uplink is a <b>trunk</b> (often a LAG), because it carries every SSID's VLAN. A WLC maps each <b>WLAN (SSID)</b> to a dynamic interface (VLAN).</li></ul>
<div class="viz" id="viz-wlc"></div>
<h3>IP phones and the voice VLAN</h3>
<p>A desk phone has a small built-in switch: the PC plugs into the phone, and the phone plugs into the wall. The switch port stays an <b>access port</b> with two VLANs: the PC's <b>data VLAN</b> (untagged) and a <b>voice VLAN</b> that the phone learns through CDP or LLDP-MED and tags with 802.1Q so QoS can prioritize it.</p>
<pre class="term">SW1(config)# interface g1/0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 150
SW1(config-if)# spanning-tree portfast</pre>
<div class="viz" id="viz-voice"></div>
<h3>Power over Ethernet</h3>
<table><tr><th>Standard</th><th>Name</th><th>Power at the switch port</th><th>Typical device</th></tr>
<tr><td>802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>IP phone, basic camera</td></tr>
<tr><td>802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>Wi-Fi 6 AP, PTZ camera</td></tr>
<tr><td>802.3bt</td><td>PoE++ / UPOE (Type 3)</td><td>60 W</td><td>Wi-Fi 7 AP, video endpoint</td></tr>
<tr><td>802.3bt</td><td>Type 4</td><td>90–100 W</td><td>Laptop dock, digital signage, lighting</td></tr></table>
<p>The switch has a total <b>power budget</b>. When it runs out, new devices don't power on. <code>show power inline</code> shows what's used and what's left.</p>
<div class="viz" id="viz-poe"></div>
<h3>Virtualized hosts</h3>
<p>The port facing a hypervisor is an <b>802.1Q trunk</b> carrying the VMs' VLANs, often bundled into an EtherChannel for redundancy. Since the virtual switch doesn't send BPDUs, use <code>spanning-tree portfast trunk</code> on it.</p>`},
{id:"cdp",num:"2.5",title:"Validating documentation with CDP and LLDP",html:`
<p>Network diagrams drift out of date. Neighbor discovery protocols let you check what's actually plugged in where.</p>
<table><tr><th></th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>IEEE 802.1AB, multivendor</td></tr>
<tr><td>On by default on Cisco gear</td><td>Yes</td><td>No: <code>lldp run</code></td></tr>
<tr><td>Timers</td><td>60 s updates, 180 s hold</td><td>30 s updates, 120 s hold</td></tr>
<tr><td>Global on/off</td><td><code>[no] cdp run</code></td><td><code>[no] lldp run</code></td></tr>
<tr><td>Per interface</td><td><code>[no] cdp enable</code></td><td><code>[no] lldp transmit</code> / <code>receive</code></td></tr>
<tr><td>Show</td><td><code>show cdp neighbors [detail]</code></td><td><code>show lldp neighbors [detail]</code></td></tr></table>
<p>The <b>neighbors</b> output gives the neighbor's hostname (Device ID), your <b>local interface</b>, the neighbor's platform and capabilities (R router, S switch, I IGMP, T phone, B bridge), and the neighbor's <b>port ID</b>. Add <b>detail</b> to get its IP address and software version. Both run at Layer 2, so they work even when IP is misconfigured.</p>
<div class="viz" id="viz-cdp"></div>
<div class="viz" id="viz-cdpvs"></div>
<div class="tip"><b>Security.</b> CDP and LLDP advertise model and software version to anyone listening. Turn them off on ports facing the internet or untrusted users (<code>no cdp enable</code>), but leave them on toward phones, which need them to learn the voice VLAN.</div>`},
{id:"tshoot",num:"2.6",title:"Troubleshooting with extended ping and packet captures",html:`
<h3>Extended ping</h3>
<p>Typing <code>ping</code> with no address on a router starts an interactive <b>extended ping</b>. It lets you pick the <b>source interface</b>, the count, the datagram size, and set the <b>DF bit</b>. Sourcing from the LAN interface tests that remote routers have a route <b>back</b> to your LAN, which a normal ping from the WAN interface wouldn't.</p>
<pre class="term">R1# ping
Protocol [ip]:
Target IP address: 10.2.2.2
Repeat count [5]: 100
Datagram size [100]: 1500
Timeout in seconds [2]:
Extended commands [n]: y
Source address or interface: g0/0/1
Set DF bit in IP header? [no]: yes</pre>
<p>The short form is <code>ping 10.2.2.2 source g0/0/1 repeat 100 size 1500</code>. Read the result characters:</p>
<table><tr><th>Character</th><th>Meaning</th></tr>
<tr><td><code>!</code></td><td>Reply received</td></tr>
<tr><td><code>.</code></td><td>Timed out. The first ping often times out while ARP resolves</td></tr>
<tr><td><code>U</code></td><td>Destination unreachable came back: a router had no route, or an ACL blocked it</td></tr>
<tr><td><code>M</code></td><td>Fragmentation needed but DF set: an MTU problem on the path</td></tr></table>
<div class="viz" id="viz-xping"></div>
<h3>Packet captures</h3>
<p>When the counters look fine but the app doesn't work, capture the packets. On Catalyst switches, <b>Embedded Packet Capture</b> (<code>monitor capture</code>) records traffic in the switch itself. <b>SPAN</b> (<code>monitor session</code>) copies a port's traffic to another port where a laptop runs Wireshark; <b>RSPAN</b> and <b>ERSPAN</b> send that copy across the network.</p>
<pre class="term">SW1# monitor capture CAP interface g1/0/5 both match any
SW1# monitor capture CAP start
SW1# monitor capture CAP stop
SW1# show monitor capture CAP buffer brief</pre>
<p>What to look for: a TCP SYN with no SYN-ACK (something is dropping it), repeated ARP requests with no reply (wrong VLAN or the host is down), DHCP Discovers with no Offer, retransmissions and resets.</p>
<div class="viz" id="viz-capture"></div>`},
{id:"stp",num:"2.7",title:"Rapid PVST+ spanning tree",html:`
<p>Redundant switch links create loops. Ethernet has no TTL, so a looped broadcast circulates forever and multiplies: a <b>broadcast storm</b> that pins every CPU and link within seconds, along with MAC table instability. <b>Spanning Tree Protocol</b> prevents loops by blocking just enough ports to make a tree.</p>
<h3>The election</h3>
<ol><li><b>Root bridge</b>: the lowest <b>bridge ID</b>, which is priority (default 32768, plus the VLAN number with the extended system ID) followed by the MAC address. Lowest priority wins; on a tie, lowest MAC wins.</li>
<li><b>Root port</b> on every other switch: the port with the lowest <b>cost</b> to the root. Ties break on the neighbor's bridge ID, then the neighbor's port ID.</li>
<li><b>Designated port</b> on each segment: the port closest to the root. All the root bridge's ports are designated.</li>
<li>Everything else is an <b>alternate</b> port (or <b>backup</b>) and <b>discards</b>.</li></ol>
<p>Default costs: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2.</p>
<div class="viz" id="viz-stp"></div>
<h3>Rapid PVST+</h3>
<p>Cisco's default runs a separate <b>RSTP (802.1w)</b> instance for each VLAN, so different VLANs can use different roots and load-share. RSTP converges in about a second instead of 30–50 seconds.</p>
<ul><li>Port states: <b>discarding</b>, <b>learning</b>, <b>forwarding</b>.</li>
<li>Port roles: <b>root</b>, <b>designated</b>, <b>alternate</b> (a backup path to the root), <b>backup</b> (a backup to a designated port on a shared segment).</li>
<li>Choose the root on purpose: <code>spanning-tree vlan 10 root primary</code> or <code>spanning-tree vlan 10 priority 24576</code> (priorities in steps of 4096).</li></ul>
<div class="viz" id="viz-stpstate"></div>
<h3>Edge features</h3>
<ul><li><b>PortFast</b> (<code>spanning-tree portfast</code>): an access port to an end device goes straight to forwarding. Never use it on a port to another switch.</li>
<li><b>BPDU Guard</b> (<code>spanning-tree bpduguard enable</code>): if a BPDU arrives, the port goes <b>err-disabled</b>. That stops someone plugging in a rogue switch. Recover with <code>shutdown</code> / <code>no shutdown</code> or <code>errdisable recovery</code>.</li>
<li><b>Root Guard</b> (<code>spanning-tree guard root</code>): if a superior BPDU arrives, the port goes <b>root-inconsistent</b>, so no downstream switch can take over as root.</li>
<li><b>Loop Guard</b>: keeps a non-designated port from forwarding if BPDUs stop arriving (protects against one-way links).</li></ul>
<div class="viz" id="viz-guards"></div>`}
];

const G={
 mac:[["What a switch learns from each frame","The source MAC address, with the port and VLAN"],["How a switch forwards a known unicast","Out the single port in the MAC table"],["Unknown unicast","Flooded out every port in the VLAN except the one it came in on"],["Broadcast MAC","FFFF.FFFF.FFFF, always flooded within the VLAN"],["Filtering","Dropping a frame whose destination is on the port it came in on"],["Default MAC aging time","300 seconds"],["show mac address-table","Lists learned MAC addresses with VLAN and port"],["clear mac address-table dynamic","Flushes the dynamically learned entries"],["Access port","Carries one untagged data VLAN"],["Trunk port","Carries many VLANs with 802.1Q tags"],["Routed port","A switch port turned into a Layer 3 interface with no switchport"],["SVI","Switched virtual interface: interface vlan N, a VLAN's Layer 3 gateway"],["Command needed for SVIs to route","ip routing"],["Layer 2 switch management gateway","ip default-gateway"]],
 vlan:[["VLAN","A separate broadcast domain on shared switch hardware"],["Default VLAN","VLAN 1"],["Normal-range VLANs","1 to 1005"],["Extended-range VLANs","1006 to 4094"],["show vlan brief","VLANs, names, status and access ports"],["802.1Q tag size","4 bytes, inserted after the source MAC"],["802.1Q VLAN ID field","12 bits (4094 usable VLANs)"],["802.1Q TPID","0x8100"],["PCP field","3-bit priority used for QoS (CoS)"],["Native VLAN","The VLAN sent untagged on a trunk; default 1"],["Native VLAN mismatch symptom","CDP-4-NATIVE_VLAN_MISMATCH and traffic leaking between VLANs"],["Native VLAN best practice","An unused VLAN, not VLAN 1"],["switchport trunk allowed vlan add","Adds VLANs without replacing the existing list"],["show interfaces trunk","Trunk ports, native VLAN, allowed and forwarding VLANs"],["switchport nonegotiate","Turns off DTP on a port"],["DTP desirable","Actively tries to form a trunk"],["DTP auto","Forms a trunk only if the other side asks"],["auto + auto","Stays an access link"],["Router on a stick","One router trunk with a subinterface per VLAN"],["Subinterface VLAN command","encapsulation dot1Q N"],["Why VLANs need routing between them","Each VLAN is a separate subnet and broadcast domain"]],
 ec:[["EtherChannel","Bundles up to 8 links into one logical port channel"],["LACP","IEEE 802.3ad open standard with active and passive modes"],["PAgP","Cisco proprietary with desirable and auto modes"],["mode on","Static channel with no negotiation; both sides must be on"],["active + passive","Forms an LACP channel"],["passive + passive","No channel"],["desirable + auto","Forms a PAgP channel"],["Po1(SU)","Layer 2 port channel, in use"],["(P) flag","Member is bundled in the port channel"],["(I) flag","Stand-alone: the partner isn't negotiating"],["(s) flag","Suspended: settings don't match the port channel"],["Members must match","Speed, duplex, switchport mode, VLANs, native VLAN"],["EtherChannel load balancing","Hash of addresses per flow, not per packet"],["Layer 3 EtherChannel","no switchport on members and the port channel; IP on the port channel"],["show etherchannel summary","Port channels, protocol and member flags"]],
 edge:[["Autonomous AP","Configured individually; acts as its own controller"],["Lightweight AP","Managed by a WLC through CAPWAP"],["CAPWAP ports","UDP 5246 (control) and 5247 (data)"],["Local mode AP switch port","Access port: client traffic is tunneled to the WLC"],["FlexConnect AP switch port","Trunk: the AP switches traffic locally"],["WLC uplink","Trunk (often a LAG) carrying every WLAN's VLAN"],["WLAN to VLAN mapping","Each SSID maps to an interface (VLAN) on the WLC"],["Voice VLAN","Tagged VLAN for an IP phone on an access port"],["switchport voice vlan","Sets the phone's VLAN on an access port"],["How a phone learns the voice VLAN","CDP or LLDP-MED"],["802.3af","PoE: 15.4 W per port"],["802.3at","PoE+: 30 W per port"],["802.3bt Type 3","60 W per port"],["802.3bt Type 4","90 to 100 W per port"],["PoE budget","Total power the switch can supply to all ports"],["show power inline","PoE use per port and remaining budget"],["Port to a hypervisor host","802.1Q trunk, often with portfast trunk"]],
 cdp:[["CDP","Cisco Discovery Protocol: proprietary, on by default"],["LLDP","IEEE 802.1AB neighbor discovery, off by default on Cisco"],["Enable LLDP globally","lldp run"],["Disable CDP on one port","no cdp enable"],["Disable CDP everywhere","no cdp run"],["CDP timers","60 s advertisements, 180 s holdtime"],["LLDP timers","30 s advertisements, 120 s holdtime"],["show cdp neighbors","Neighbor name, local port, platform, capabilities and remote port"],["show cdp neighbors detail","Adds the neighbor's IP address and software version"],["CDP capability R / S / T","Router / Switch / Telephone"],["Why CDP works when IP is broken","It runs at Layer 2"],["Where to disable CDP/LLDP","On ports facing the internet or untrusted users"],["LLDP-MED","LLDP extension that gives phones their voice VLAN and power needs"]],
 tshoot:[["Extended ping","ping with no address; prompts for source, count, size and DF bit"],["Why source a ping from the LAN","Tests that remote routers have a route back to the LAN"],["Ping result !","Reply received"],["Ping result .","Timed out"],["Ping result U","Destination unreachable came back"],["Ping result M","Fragmentation needed with DF set: MTU problem"],["First ping is .!!!!","Normal: the first packet waits for ARP"],["Embedded Packet Capture","monitor capture: records packets on the switch itself"],["SPAN","Copies a port's traffic to another local port for analysis"],["RSPAN","Sends SPAN traffic across switches in a VLAN"],["ERSPAN","Sends SPAN traffic over a routed network in GRE"],["SYN with no SYN-ACK","Something on the path drops the connection request"],["ARP requests with no reply","Wrong VLAN, wrong subnet or host down"]],
 stp:[["Why loops are deadly at Layer 2","Ethernet has no TTL, so frames loop forever: broadcast storms"],["Root bridge","Switch with the lowest bridge ID"],["Bridge ID","Priority (+ VLAN) then MAC address"],["Default bridge priority","32768"],["Priority increment","4096"],["Root port","Each non-root switch's lowest-cost port to the root"],["Designated port","The port closest to the root on each segment"],["Alternate port","A blocked backup path to the root"],["Backup port","A blocked backup to a designated port on the same segment"],["STP cost of 1 Gbps","4"],["STP cost of 10 Gbps","2"],["STP cost of 100 Mbps","19"],["Rapid PVST+","Cisco default: one RSTP instance per VLAN"],["RSTP port states","Discarding, learning, forwarding"],["spanning-tree vlan 10 root primary","Sets priority low enough to become root"],["PortFast","Access port goes straight to forwarding"],["BPDU Guard","Err-disables a port that receives a BPDU"],["Root Guard","Root-inconsistent state if a superior BPDU arrives"],["Loop Guard","Stops a port forwarding when BPDUs stop arriving"],["Recover an err-disabled port","shutdown then no shutdown, or errdisable recovery"]]
};
const DECKS=[["mac","Switching basics"],["vlan","VLANs and trunks"],["ec","EtherChannel"],["edge","APs, phones and PoE"],["cdp","CDP and LLDP"],["tshoot","Troubleshooting tools"],["stp","Spanning tree"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A switch receives a frame for a destination MAC that isn't in its MAC table. What does it do?",o:["Floods it out every port in the VLAN except the incoming one","Drops it","Sends it to the default gateway","Sends an ARP request"],a:0,e:"Unknown unicast is flooded within the VLAN."},
 {q:"Which field does a switch use to build its MAC address table?",o:["Source MAC","Destination MAC","Source IP","VLAN tag only"],a:0,e:"It learns where senders are."},
 {q:"How long do dynamic MAC entries stay in the table by default without traffic?",o:["300 seconds","60 seconds","4 hours","Forever"],a:0,e:"The default aging time is 300 seconds."},
 {q:"Which interface on a multilayer switch acts as the default gateway for VLAN 20?",o:["interface vlan 20","interface g1/0/20","A trunk port","interface port-channel 20"],a:0,e:"An SVI is the Layer 3 interface for a VLAN."},
 {q:"Which command turns a Catalyst switch port into a routed port?",o:["no switchport","switchport mode routed","ip routing","switchport mode access"],a:0,e:"no switchport makes it a Layer 3 interface that can take an IP address."},
 {q:"A Layer 2 switch has a management IP in VLAN 99 but can't be reached from other subnets. What's missing?",o:["ip default-gateway","ip routing","A trunk","switchport nonegotiate"],a:0,e:"A Layer 2 switch needs a default gateway for its own traffic."},
 {q:"How many bits is the VLAN ID in an 802.1Q tag?",o:["12","8","16","10"],a:0,e:"12 bits gives 4096 values, with 0 and 4095 reserved."},
 {q:"Which VLAN's frames cross an 802.1Q trunk without a tag?",o:["The native VLAN","VLAN 1 always","The voice VLAN","The management VLAN"],a:0,e:"Native VLAN traffic is untagged. It defaults to VLAN 1 but can be changed."},
 {q:"SW1's trunk has native VLAN 99 and SW2's end has native VLAN 1. What happens?",o:["CDP reports a native VLAN mismatch and untagged traffic lands in the wrong VLAN","The trunk goes down","Nothing, it's fine","Spanning tree turns off"],a:0,e:"Untagged frames from VLAN 99 arrive in VLAN 1 on the other side."},
 {q:"A trunk allows VLANs 10 and 20. An engineer types 'switchport trunk allowed vlan 30'. What's the result?",o:["Only VLAN 30 is allowed","VLANs 10, 20 and 30 are allowed","The command is rejected","All VLANs are allowed"],a:0,e:"Without 'add', the list is replaced."},
 {q:"Two connected switch ports are both set to dynamic auto. What forms?",o:["An access link","A trunk","An EtherChannel","Err-disabled ports"],a:0,e:"Auto only responds, so neither side starts DTP negotiation."},
 {q:"Which port setting combination forms a trunk using DTP?",o:["dynamic desirable and dynamic auto","dynamic auto and dynamic auto","access and dynamic desirable","access and trunk"],a:0,e:"Desirable asks, and auto agrees."},
 {q:"Which command disables DTP on a trunk port?",o:["switchport nonegotiate","no dtp","switchport mode dynamic off","no cdp enable"],a:0,e:"switchport nonegotiate stops DTP frames."},
 {q:"PCs in VLAN 10 and VLAN 20 on the same switch can't ping each other. Each has the right gateway. What's needed?",o:["A router or multilayer switch to route between the VLANs","A trunk between the PCs","A larger MAC table","The same native VLAN"],a:0,e:"Different VLANs are different subnets, so traffic must be routed."},
 {q:"Which command assigns a router subinterface to VLAN 30?",o:["encapsulation dot1Q 30","switchport access vlan 30","vlan 30","ip vlan 30"],a:0,e:"Subinterfaces use encapsulation dot1Q."},
 {q:"Which VLAN does every switch port belong to by default?",o:["VLAN 1","VLAN 99","No VLAN","VLAN 1002"],a:0,e:"All ports start in VLAN 1."},
 {q:"Which command shows which VLANs are forwarding on each trunk?",o:["show interfaces trunk","show vlan brief","show ip interface brief","show cdp neighbors"],a:0,e:"show interfaces trunk lists allowed, active and forwarding VLANs."},
 {q:"Which pair of EtherChannel modes forms an LACP bundle?",o:["active and passive","passive and passive","desirable and auto","on and active"],a:0,e:"LACP needs at least one active side."},
 {q:"Which mode creates an EtherChannel with no negotiation protocol?",o:["on","active","desirable","auto"],a:0,e:"on is static, and both ends must be on."},
 {q:"show etherchannel summary shows Gi1/0/12(s). What does it mean?",o:["The member is suspended because its settings don't match","It's bundled","It's in stand-alone mode","It's shut down"],a:0,e:"Suspended members usually have a VLAN, mode or speed mismatch."},
 {q:"show etherchannel summary shows Gi1/0/11(I). What's the most likely cause?",o:["The far end isn't running a compatible negotiation protocol","The member is bundled","The port channel is Layer 3","Duplex is half"],a:0,e:"I means stand-alone: no LACP or PAgP partner."},
 {q:"Which is an open standard?",o:["LACP","PAgP","CDP","DTP"],a:0,e:"LACP is IEEE 802.3ad. The others are Cisco proprietary."},
 {q:"A 2-member EtherChannel of 1 Gbps links carries a single large file transfer. How fast can it go?",o:["About 1 Gbps","2 Gbps","500 Mbps","It depends on STP"],a:0,e:"Load balancing is per flow, so one flow uses one member."},
 {q:"What's the maximum number of active members in an EtherChannel?",o:["8","2","4","16"],a:0,e:"Eight active members (LACP can hold more as standby)."},
 {q:"Why does spanning tree treat an EtherChannel as one link?",o:["The port channel is a single logical interface, so no member is blocked","STP is disabled on bundles","Members use different VLANs","LACP blocks BPDUs"],a:0,e:"STP runs on the port channel, not its members."},
 {q:"A lightweight AP in local mode tunnels client traffic to the WLC. How should its switch port be configured?",o:["Access port in the AP management VLAN","Trunk with all VLANs","Routed port","Port channel"],a:0,e:"Client traffic is inside CAPWAP, so the AP only needs one VLAN."},
 {q:"Which protocol do lightweight APs use to talk to a WLC?",o:["CAPWAP","LWAPP only","CDP","802.1X"],a:0,e:"CAPWAP on UDP 5246 and 5247."},
 {q:"How should a WLC's uplink to the distribution switch be configured?",o:["As an 802.1Q trunk, often a LAG","As an access port","As a routed port","With PortFast and BPDU Guard"],a:0,e:"The WLC carries many VLANs, one per WLAN."},
 {q:"An autonomous AP serves three SSIDs, each on its own VLAN. How should its switch port be configured?",o:["Trunk carrying the three VLANs","Access port in VLAN 1","Voice VLAN","Routed port"],a:0,e:"The AP bridges each SSID to a VLAN, so it tags them."},
 {q:"How does a Cisco IP phone learn which VLAN to tag its voice traffic in?",o:["CDP or LLDP-MED from the switch","DHCP option 150","DNS","It's hard-coded"],a:0,e:"The switch advertises the voice VLAN in CDP or LLDP-MED."},
 {q:"Which configuration fits a port with an IP phone and a PC daisy-chained behind it?",o:["Access port with access VLAN 10 and voice VLAN 150","Trunk with native VLAN 150","Two access VLANs","A routed port"],a:0,e:"The phone tags voice and the PC's traffic stays untagged."},
 {q:"How much power does an 802.3at (PoE+) switch port supply?",o:["30 W","15.4 W","60 W","90 W"],a:0,e:"PoE+ is 30 W at the switch port."},
 {q:"New PoE cameras don't power on, but older ones work. show power inline shows 2 W remaining. Why?",o:["The switch's PoE budget is exhausted","The cameras need a trunk","CDP is off","STP is blocking"],a:0,e:"No budget left means no power for new devices."},
 {q:"Which command should go on a port connected to a VMware host carrying several VLANs?",o:["switchport mode trunk with spanning-tree portfast trunk","switchport mode access","no switchport","spanning-tree guard root"],a:0,e:"VMs are in several VLANs, and the host is an edge device."},
 {q:"Which is true about LLDP on Cisco switches?",o:["It's off by default and enabled with lldp run","It's Cisco proprietary","It needs IP to work","It's the same as CDP"],a:0,e:"LLDP is IEEE 802.1AB and must be turned on."},
 {q:"Which command shows a CDP neighbor's IP address?",o:["show cdp neighbors detail","show cdp neighbors","show cdp","show ip interface brief"],a:0,e:"The detail keyword adds addresses and software version."},
 {q:"Which command disables CDP on just the internet-facing interface?",o:["no cdp enable","no cdp run","cdp disable","no lldp run"],a:0,e:"no cdp enable is per interface; no cdp run is global."},
 {q:"The diagram says R1 connects to SW1 Gi1/0/1, but show cdp neighbors on SW1 lists R1 with Local Intrfce Gi 1/0/7. What should you trust?",o:["The CDP output: update the documentation","The diagram","Neither: CDP is unreliable","Reboot SW1"],a:0,e:"CDP reports what is physically connected right now."},
 {q:"A ping from R1 shows 'U.U.U'. What does that tell you?",o:["A router on the path is sending destination unreachable","The path is fine","The first packet waited for ARP","An MTU problem"],a:0,e:"U means an unreachable message came back: no route, or an ACL."},
 {q:"Why would you ping a remote LAN with 'source g0/0/1' from R1?",o:["To test that the remote side has a route back to R1's LAN","To make the ping faster","Because pings can't leave the WAN","To bypass ACLs"],a:0,e:"The replies go to the LAN address, which proves the return route."},
 {q:"An extended ping with size 1500 and DF set returns 'M.M.M'. What's wrong?",o:["A link on the path has a smaller MTU","DNS","The ACL","Duplex"],a:0,e:"M means it needed fragmenting but DF forbade it."},
 {q:"Which tool copies traffic from one switch port to another local port for a Wireshark laptop?",o:["SPAN","CDP","NetFlow","DTP"],a:0,e:"SPAN mirrors traffic to a monitor port."},
 {q:"A capture shows a client sending TCP SYNs to a server on port 443 and getting no reply. What does it suggest?",o:["A firewall or ACL is dropping the traffic, or the server isn't listening","DNS is broken","The client has no IP","A duplex mismatch"],a:0,e:"The request leaves but nothing answers."},
 {q:"Which switch becomes root bridge?",o:["Priority 24576, MAC 00a1.0000.0009","Priority 32768, MAC 0001.0000.0001","Priority 32768, MAC 00a1.0000.0002","Priority 28672, MAC 0001.0000.0001"],a:0,e:"Lowest priority wins before MAC is compared."},
 {q:"Two switches have priority 32768. SW1's MAC is 0019.aa00.0001 and SW2's is 0011.bb00.0001. Which is root?",o:["SW2","SW1","Both","Neither until configured"],a:0,e:"On a priority tie, the lower MAC wins: 0011 is lower than 0019."},
 {q:"What's the default STP cost of a 1 Gbps link?",o:["4","19","2","100"],a:0,e:"1 Gbps = 4 in the short cost method."},
 {q:"Which port role is blocked and provides an alternate path to the root?",o:["Alternate","Designated","Root","Edge"],a:0,e:"Alternate ports discard until the root port fails."},
 {q:"Which three port states does RSTP use?",o:["Discarding, learning, forwarding","Blocking, listening, learning, forwarding","Disabled, forwarding","Up, down, err-disabled"],a:0,e:"RSTP merges disabled, blocking and listening into discarding."},
 {q:"Which command makes SW1 the root for VLAN 10?",o:["spanning-tree vlan 10 root primary","spanning-tree vlan 10 priority 32769","spanning-tree root","spanning-tree vlan 10 cost 1"],a:0,e:"root primary picks a priority low enough to win."},
 {q:"Which priority is valid?",o:["28672","30000","32769","1000"],a:0,e:"Priorities must be multiples of 4096."},
 {q:"A user plugs a small switch into an access port with BPDU Guard. What happens?",o:["The port goes err-disabled","The small switch becomes root","Nothing","The port goes root-inconsistent"],a:0,e:"Any BPDU on a BPDU Guard port err-disables it."},
 {q:"Which feature stops a switch in a downstream closet from becoming root bridge?",o:["Root Guard","BPDU Guard","PortFast","Loop Guard"],a:0,e:"Root Guard blocks superior BPDUs on that port."},
 {q:"Which feature should go on every access port connected to a PC?",o:["PortFast and BPDU Guard","Root Guard","Loop Guard","DTP desirable"],a:0,e:"PortFast speeds up the port; BPDU Guard protects it."},
 {q:"What happens without spanning tree on a network with redundant switch links?",o:["Broadcast storms and MAC table instability","Faster convergence","Load balancing","Nothing"],a:0,e:"Looping broadcasts multiply until the network fails."},
 {q:"Which version of spanning tree is the default on Catalyst switches?",o:["Rapid PVST+","MST","802.1D","PVST+ only on VLAN 1"],a:0,e:"Modern Catalyst switches default to Rapid PVST+."},
 {q:"An err-disabled port needs to be brought back after the rogue switch is removed. What do you do?",o:["shutdown then no shutdown on the interface","no spanning-tree","reload the switch","clear mac address-table"],a:0,e:"Bounce the port, or configure errdisable recovery."}
];

registerModule({
  id:"sw",slug:"switching",title:"Switching and Network Access",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and |, /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["maclearn","l2l3","vlanmini","dot1q","dtp","lacp","ecread","wlc","voice","poe","cdp","cdpvs","xping","capture","stp","stpstate","guards"],
  viz(){
/* ---- MAC learning ---- */
(function(){
  const el=$("#viz-maclearn");
  const H={A:["PC-A","aaaa.aaaa.000a",1],B:["PC-B","bbbb.bbbb.000b",2],C:["PC-C","cccc.cccc.000c",3],D:["PC-D","dddd.dddd.000d",4]};
  const F=[["A","B","PC-A sends to PC-B. The switch learns PC-A is on port 1. PC-B is unknown, so it floods out ports 2, 3 and 4."],
    ["B","A","PC-B replies. The switch learns PC-B on port 2. PC-A is known, so the reply goes out port 1 only."],
    ["C","FFFF","PC-C sends an ARP broadcast. The switch learns PC-C on port 3 and floods the broadcast to every other port."],
    ["A","C","PC-A sends to PC-C. Both are known now, so the frame goes out port 3 only."],
    ["D","B","PC-D sends to PC-B. The switch learns PC-D on port 4 and forwards to port 2. The table now has all four hosts."]];
  let n=0;
  el.innerHTML=`<div class="viz-title">MAC learning: watch the table fill</div><div class="viz-scroll"><svg viewBox="0 0 600 220" style="min-width:440px" role="img" aria-label="Switch with four hosts"></svg></div><table class="rt ml-t"></table><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="next">Send next frame</button><button class="btn" data-a="reset">Start over</button><span class="grow"></span></div>`;
  const X={1:90,2:240,3:380,4:520};
  function draw(){const learned=new Set();for(let k=0;k<n;k++)learned.add(F[k][0]);const f=n?F[n-1]:null;
    const out=f?(f[1]==="FFFF"||!learned.has(f[1])||(()=>{const before=new Set();for(let k=0;k<n-1;k++)before.add(F[k][0]);return !before.has(f[1])})()?Object.keys(H).filter(k=>k!==f[0]):[f[1]]):[];
    let s=`<rect x="160" y="20" width="280" height="44" rx="8" class="m-node on"/><text x="300" y="48" text-anchor="middle" class="s-b">SW1</text>`;
    Object.entries(H).forEach(([k,h])=>{const x=X[h[2]],act=f&&(f[0]===k||out.includes(k));s+=`<line x1="${x}" y1="140" x2="${Math.max(170,Math.min(430,x))}" y2="64" class="m-link${act?" on":""}" ${f&&out.includes(k)?'stroke-dasharray="6 4"':""}/><rect x="${x-50}" y="140" width="100" height="46" rx="8" class="m-node${f&&f[0]===k?" on":""}"/><text x="${x}" y="160" text-anchor="middle" class="s-b">${h[0]}</text><text x="${x}" y="177" text-anchor="middle" class="mono" style="font-size:9px;fill:var(--muted)">port ${h[2]}</text>`});
    $("svg",el).innerHTML=s;
    $(".ml-t",el).innerHTML=`<tr><th>VLAN</th><th>MAC address</th><th>Type</th><th>Port</th></tr>`+([...learned].map(k=>`<tr class="${f&&f[0]===k?"hit":""}"><td>1</td><td class="mono">${H[k][1]}</td><td>DYNAMIC</td><td>Gi1/0/${H[k][2]}</td></tr>`).join("")||`<tr><td colspan="4" class="s-small">Empty: the switch hasn't heard from anyone yet.</td></tr>`);
    $(".caption",el).innerHTML=f?f[2]:"The switch just booted. Its MAC table is empty. Send the first frame.";$(".grow",el).textContent=`Frame ${n} of ${F.length}`;$('[data-a="next"]',el).disabled=n===F.length;
    if(n===F.length)award("viz:maclearn",20,"Watched a switch learn MAC addresses")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;n=a==="next"?Math.min(n+1,F.length):0;draw()});draw();
})();
sortViz($("#viz-l2l3"),{title:"Which interface type?",bins:{acc:"Access port",trk:"Trunk port",rtd:"Routed port",svi:"SVI"},
  items:[["Desk PC in VLAN 10","acc","One untagged VLAN."],["Uplink between two Layer 2 switches carrying VLANs 10–40","trk","Many VLANs need tags."],["Gateway 10.10.20.1 for every host in VLAN 20 on a multilayer switch","svi","interface vlan 20."],["Core switch link to a WAN router with a /30","rtd","A point-to-point Layer 3 link: no switchport."],["Port to an ESXi server with VMs in four VLANs","trk","The vSwitch tags VM traffic."],["Port to a printer","acc","An end device in one VLAN."],["Management address of a Layer 2 access switch","svi","interface vlan 99 with an IP."],["Link to a router doing router-on-a-stick","trk","The router's subinterfaces expect tags."]],done:"Matched every interface type"});
iosViz($("#viz-vlanmini"),{title:"Mini lab: create VLANs and assign ports",scenario:"PC1 is on Gi1/0/2 and a printer is on Gi1/0/3. Both are in VLAN 1. You're at the privileged prompt on SW1.",
  devices:[{name:"SW1",kind:"switch"}],hosts:[{name:"PC1",ip:"10.10.10.21",gw:"10.10.10.1",at:"SW1:g1/0/2"},{name:"PRN1",ip:"10.10.20.50",gw:"10.10.20.1",at:"SW1:g1/0/3"}],consoles:["SW1"],startMode:"priv",
  topo:{SW1:[300,60],PC1:[170,150],PRN1:[430,150]},topoH:200,
  tasks:[{t:"Create VLAN 10 named SALES and VLAN 20 named PRINTERS",hint:"configure terminal\nvlan 10\n name SALES\nvlan 20\n name PRINTERS",check:(w,D)=>/^sales$/i.test(D.SW1.vlans[10]?.name||"")&&/^printers$/i.test(D.SW1.vlans[20]?.name||"")},
    {t:"Make Gi1/0/2 an access port in VLAN 10",hint:"interface g1/0/2\n switchport mode access\n switchport access vlan 10",check:(w,D)=>{const i=D.SW1.ifs["GigabitEthernet1/0/2"];return i.sw.mode==="access"&&i.sw.access===10}},
    {t:"Make Gi1/0/3 an access port in VLAN 20",hint:"interface g1/0/3\n switchport mode access\n switchport access vlan 20",check:(w,D)=>{const i=D.SW1.ifs["GigabitEthernet1/0/3"];return i.sw.mode==="access"&&i.sw.access===20}},
    {t:"Check your work with show vlan brief",hint:"do show vlan brief",check:(w,D,S)=>S.SW1.hist.some(h=>/sh\S* vl\S* br/i.test(h))}],
  solution:"configure terminal\nvlan 10\n name SALES\nvlan 20\n name PRINTERS\ninterface g1/0/2\n switchport mode access\n switchport access vlan 10\ninterface g1/0/3\n switchport mode access\n switchport access vlan 20\ndo show vlan brief",
  success:"Two VLANs, two broadcast domains. PC1 and the printer now need a router to talk."},"vlanmini",40,"Created VLANs on a switch");
revealViz($("#viz-dot1q"),{title:"Inside the 802.1Q tag",cols:4,done:"Explored the 802.1Q tag",items:[
  ["TPID","16 bits","Tag Protocol Identifier, always 0x8100. It sits where the EtherType would be, so a receiver knows a tag follows."],
  ["PCP","3 bits","Priority Code Point: the Class of Service (0–7) that QoS uses. Voice is usually 5."],
  ["DEI","1 bit","Drop Eligible Indicator: marks frames that can be dropped first under congestion."],
  ["VID","12 bits","VLAN Identifier: 0–4095, with 0 and 4095 reserved, leaving 1–4094."],
  ["Where it goes","after source MAC","The 4-byte tag is inserted between the source MAC and the EtherType, so the frame grows from 1518 to 1522 bytes and the FCS is recalculated."],
  ["Native VLAN","no tag","Frames in the native VLAN are sent without a tag. Both trunk ends must agree on which VLAN that is."],
  ["Q-in-Q","two tags","Service providers can stack a second tag (802.1ad) to carry a customer's VLANs."],
  ["ISL","obsolete","Cisco's old Inter-Switch Link encapsulated the whole frame. Modern switches only do 802.1Q."]]});

/* ---- DTP matrix ---- */
(function(){
  const el=$("#viz-dtp");const M=["access","trunk","dynamic desirable","dynamic auto"];let a=3,b=3;const seen=new Set();
  const res=(x,y)=>{const s=[M[x],M[y]].sort().join("|");const T={"access|access":["Access","Both sides are access ports."],"access|trunk":["Mismatch","One side tags, the other doesn't. Limited, broken connectivity. Don't do this."],"access|dynamic desirable":["Access","The access side refuses to trunk."],"access|dynamic auto":["Access","Neither side will trunk."],"trunk|trunk":["Trunk","Both hard-coded. Best practice, ideally with nonegotiate."],"dynamic desirable|trunk":["Trunk","The trunk side sends DTP and desirable agrees."],"dynamic auto|trunk":["Trunk","The trunk side asks, and auto agrees."],"dynamic desirable|dynamic desirable":["Trunk","Both actively negotiate."],"dynamic auto|dynamic desirable":["Trunk","Desirable asks, and auto agrees."],"dynamic auto|dynamic auto":["Access","Both wait for the other to ask, so no trunk forms. This catches people out."]};return T[s]};
  el.innerHTML=`<div class="viz-title">DTP: what does the link become?</div><div class="dtp-g"><label class="rf"><span>SW1 Gi1/0/12</span><select data-s="a">${M.map((m,i)=>`<option value="${i}">switchport mode ${m}</option>`).join("")}</select></label><label class="rf"><span>SW2 Gi1/0/12</span><select data-s="b">${M.map((m,i)=>`<option value="${i}">switchport mode ${m}</option>`).join("")}</select></label></div><div class="dtp-r"></div><div class="caption" aria-live="polite"></div><div class="rv-prog s-small"></div>`;
  function draw(){const r=res(a,b);$(".dtp-r",el).innerHTML=`<span class="chip ${r[0]==="Trunk"?"ok":r[0]==="Mismatch"?"no":""}">${r[0]}</span>`;$(".caption",el).textContent=r[1];el.querySelector('[data-s="a"]').value=a;el.querySelector('[data-s="b"]').value=b;
    seen.add([a,b].sort().join());$(".rv-prog",el).textContent=`${seen.size} of 10 combinations tried`;if(seen.size>=6)award("viz:dtp",20,"Worked out DTP combinations")}
  el.addEventListener("change",e=>{const s=e.target.dataset.s;if(!s)return;if(s==="a")a=+e.target.value;else b=+e.target.value;draw()});draw();
})();

/* ---- EtherChannel mode matrix ---- */
(function(){
  const el=$("#viz-lacp");const M=["on","active","passive","desirable","auto"];const seen=new Set();
  const res=(x,y)=>{if(x==="on"||y==="on")return x===y?["Channel (static)","No negotiation. Works, but a miscabled link won't be caught."]:["No channel","on doesn't negotiate, and the other side is waiting for LACP or PAgP. Mixing them can even cause a loop."];
    const L=["active","passive"],P=["desirable","auto"];if(L.includes(x)&&L.includes(y))return x==="passive"&&y==="passive"?["No channel","Both sides wait for the other to start LACP."]:["Channel (LACP)","At least one side is active."];
    if(P.includes(x)&&P.includes(y))return x==="auto"&&y==="auto"?["No channel","Both sides wait for the other to start PAgP."]:["Channel (PAgP)","At least one side is desirable."];return ["No channel","LACP and PAgP don't talk to each other."]};
  el.innerHTML=`<div class="viz-title">Will the bundle form?</div><div class="ec-grid"><div><span class="s-small">SW1</span><div class="chips" data-side="a">${M.map(m=>`<button class="chip mono" data-m="${m}">${m}</button>`).join("")}</div></div><div><span class="s-small">SW2</span><div class="chips" data-side="b">${M.map(m=>`<button class="chip mono" data-m="${m}">${m}</button>`).join("")}</div></div></div><div class="dtp-r"></div><div class="caption" aria-live="polite"></div><div class="rv-prog s-small"></div>`;
  let a="active",b="passive";
  function draw(){const r=res(a,b);el.querySelectorAll('[data-side]').forEach(g=>g.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===(g.dataset.side==="a"?a:b))));
    $(".dtp-r",el).innerHTML=`<span class="chip ${/^Channel/.test(r[0])?"ok":"no"}">${r[0]}</span>`;$(".caption",el).textContent=r[1];$(".rv-prog",el).textContent=`${seen.size} combinations tried`}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]");if(!m)return;if(m.closest("[data-side]").dataset.side==="a")a=m.dataset.m;else b=m.dataset.m;seen.add([a,b].sort().join());draw();if(seen.size>=6)award("viz:lacp",20,"Explored EtherChannel modes")});draw();
})();
quizViz($("#viz-ecread"),{title:"Read show etherchannel summary",done:"Read every EtherChannel output",qs:[
  ["Po1(SU)  LACP  Gi1/0/11(P) Gi1/0/12(P)",["Healthy: both members bundled","One member suspended","Layer 3 channel down","PAgP channel"],0,"S is Layer 2, U is in use, and P means bundled."],
  ["Po1(SD)  LACP  Gi1/0/11(I) Gi1/0/12(I)",["The far side isn't running LACP","Members have mismatched VLANs","The bundle is working","STP blocked it"],0,"Stand-alone members mean no LACP partner. Check the other switch's channel-group mode."],
  ["Po1(SU)  LACP  Gi1/0/11(P) Gi1/0/12(s)",["Gi1/0/12's settings don't match the port channel","Gi1/0/12 is the best member","The far side is passive","Gi1/0/12 is shut down"],0,"Suspended: compare its switchport mode, VLANs and speed with Po1."],
  ["Po2(RU)  -  Te1/1/1(P) Te1/1/2(P)",["A working Layer 3 channel set to mode on","A broken PAgP channel","A Layer 2 LACP channel","Two stand-alone ports"],0,"R is Layer 3, and a dash in the protocol column means static (on)."],
  ["Po1(SD)  -  Gi1/0/11(D) Gi1/0/12(D)",["Both member links are down","LACP is misconfigured","The bundle is fine","The channel is Layer 3"],0,"D means down: check cables and shutdown."]]});
revealViz($("#viz-wlc"),{title:"Wireless architectures and AP modes",cols:3,done:"Explored wireless architectures",items:[
  ["Autonomous","standalone","Each AP has its own configuration and does everything itself. Fine for one or two APs, painful at scale. Its port is a trunk if SSIDs map to different VLANs."],
  ["Centralized WLC","split MAC","Lightweight APs handle real-time radio work and the WLC handles authentication, roaming, RF management and policy. APs find the WLC through DHCP option 43, DNS (CISCO-CAPWAP-CONTROLLER) or broadcast."],
  ["Embedded WLC","on the switch","The controller runs on a Catalyst 9000 switch. Good for a branch with a handful of APs."],
  ["Cloud managed","Meraki and others","The controller is a cloud dashboard. Only management goes to the cloud; client traffic stays local."],
  ["Local mode","default","The AP serves clients and tunnels their traffic to the WLC in CAPWAP. Its switch port is an access port."],
  ["FlexConnect","branch","The AP can switch client traffic locally onto VLANs and keep working if the WAN to the WLC fails. Its port is a trunk."],
  ["Monitor mode","sensor","The AP doesn't serve clients. It scans every channel for rogue APs and interference."],
  ["Sniffer mode","capture","The AP captures 802.11 frames on one channel and forwards them to a Wireshark machine."],
  ["Bridge / mesh","no cable","The AP links to another AP wirelessly to reach places without cabling."]]});
iosViz($("#viz-voice"),{title:"Mini lab: a desk with an IP phone and a PC",scenario:"An IP phone is plugged into SW1 Gi1/0/5 and a PC is plugged into the phone. VLANs 10 (DATA) and 150 (VOICE) already exist.",
  devices:[{name:"SW1",kind:"switch"}],hosts:[{name:"PHONE",ip:"10.1.150.20",gw:"10.1.150.1",at:"SW1:g1/0/5",poe:7}],boot:{SW1:["vlan 10","name DATA","vlan 150","name VOICE"]},consoles:["SW1"],startMode:"priv",
  topo:{SW1:[200,70],PHONE:[420,70]},topoH:140,
  tasks:[{t:"Make Gi1/0/5 an access port in data VLAN 10",hint:"configure terminal\ninterface g1/0/5\n switchport mode access\n switchport access vlan 10",check:(w,D)=>{const i=D.SW1.ifs["GigabitEthernet1/0/5"];return i.sw.mode==="access"&&i.sw.access===10}},
    {t:"Give it voice VLAN 150",hint:"switchport voice vlan 150",check:(w,D)=>D.SW1.ifs["GigabitEthernet1/0/5"].sw.voice===150},
    {t:"Enable PortFast and BPDU Guard on it",hint:"spanning-tree portfast\nspanning-tree bpduguard enable",check:(w,D)=>{const i=D.SW1.ifs["GigabitEthernet1/0/5"];return i.pf&&i.bg}},
    {t:"Check the phone's power draw with show power inline",hint:"do show power inline",check:(w,D,S)=>S.SW1.hist.some(h=>/sh\S* pow\S* in/i.test(h))}],
  solution:"configure terminal\ninterface g1/0/5\n switchport mode access\n switchport access vlan 10\n switchport voice vlan 150\n spanning-tree portfast\n spanning-tree bpduguard enable\n do show power inline",
  success:"One access port, two VLANs: the PC untagged in 10 and the phone tagged in 150."},"voice",40,"Configured a voice VLAN port");

/* ---- PoE budget ---- */
(function(){
  const el=$("#viz-poe");const BUD=370;
  const DEV=[["IP phone",6.5,"af"],["Wi-Fi 6 AP",25.5,"at"],["Fixed camera",12.9,"af"],["PTZ camera",51,"bt3"],["Wi-Fi 7 AP",45,"bt3"],["Laptop dock",71.3,"bt4"]];
  const CLS={af:15.4,at:30,bt3:60,bt4:90};const on=[];let alloc=true;
  el.innerHTML=`<div class="viz-title">PoE budget: a 24-port switch with a 370 W supply</div><div class="chips">${DEV.map((d,i)=>`<button class="chip" data-i="${i}">+ ${d[0]}</button>`).join("")}</div>
  <label class="rf-chk"><input type="checkbox" data-a="alloc" checked> Reserve each device's full class power (the switch's default)</label>
  <div class="meter"><i></i></div><div class="kv"></div><div class="poe-l s-small"></div><div class="viz-controls"><button class="btn" data-a="reset">Unplug everything</button></div><div class="caption" aria-live="polite"></div>`;
  function draw(msg){const used=on.reduce((a,i)=>a+(alloc?CLS[DEV[i][2]]:DEV[i][1]),0);$(".meter i",el).style.width=Math.min(100,used/BUD*100)+"%";$(".meter",el).className="meter "+(used>BUD*.9?"b":used>BUD*.6?"m":"g");
    $(".kv",el).innerHTML=`<span>Ports in use</span><b class="mono">${on.length} / 24</b><span>Power allocated</span><b class="mono">${used.toFixed(1)} W</b><span>Remaining</span><b class="mono">${(BUD-used).toFixed(1)} W</b>`;
    $(".poe-l",el).textContent=on.map(i=>DEV[i][0]).join(" · ")||"Nothing plugged in.";if(msg)$(".caption",el).innerHTML=msg}
  el.addEventListener("click",e=>{const d=e.target.closest("[data-i]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(a==="reset"){on.length=0;draw("Budget restored.");return}if(!d)return;const i=+d.dataset.i;const used=on.reduce((s,k)=>s+(alloc?CLS[DEV[k][2]]:DEV[k][1]),0),need=alloc?CLS[DEV[i][2]]:DEV[i][1];
    if(on.length>=24){draw('<span class="status-bad">No free ports.</span>');return}
    if(used+need>BUD){draw(`<span class="status-bad">%ILPOWER-5-ILPOWER_POWER_DENY:</span> not enough power for the ${DEV[i][0]} (needs ${need} W, ${(BUD-used).toFixed(1)} W left). It stays dark. Buy a bigger power supply, or move devices to another switch.`);award("viz:poe",20,"Ran a switch out of PoE budget");return}
    on.push(i);draw(`${DEV[i][0]} powered up: ${{af:"802.3af PoE, class up to 15.4 W",at:"802.3at PoE+, up to 30 W",bt3:"802.3bt Type 3, up to 60 W",bt4:"802.3bt Type 4, up to 90 W"}[DEV[i][2]]}. It actually draws about ${DEV[i][1]} W.`)});
  el.addEventListener("change",e=>{if(e.target.dataset.a==="alloc"){alloc=e.target.checked;draw(alloc?"The switch reserves the full class maximum for each device.":"Now the switch only counts what each device actually draws, so more fit. Many switches can be set to allocate this way.")}});
  draw("Plug devices in until the switch runs out of power.");
})();
iosViz($("#viz-cdp"),{title:"Mini lab: check the diagram against reality",scenario:"The diagram says R1 is on SW1 Gi1/0/1 and SW2 is on Gi1/0/12. Gi1/0/10 goes to the ISP's modem. Use CDP to find out what's really where, then fix the port descriptions.",
  devices:[{name:"SW1",kind:"switch"},{name:"R1",kind:"router"},{name:"SW2",kind:"switch"},{name:"ISP",kind:"router"}],links:[["SW1:g1/0/7","R1:g0/0/1"],["SW1:g1/0/11","SW2:g1/0/1"],["SW1:g1/0/10","ISP:g0/0/0"]],
  boot:{R1:["interface g0/0/1","no shutdown"],ISP:["interface g0/0/0","no shutdown"],SW1:["interface g1/0/1","description TO-R1","interface g1/0/12","description TO-SW2"]},consoles:["SW1"],startMode:"priv",
  topo:{SW1:[300,110],R1:[120,40],SW2:[480,40],ISP:[300,210]},topoH:250,
  tasks:[{t:"Find the real neighbors with show cdp neighbors",hint:"show cdp neighbors",check:(w,D,S)=>S.SW1.hist.some(h=>/sh\S* cdp ne/i.test(h))},
    {t:"Put the description TO-R1 on the port that really connects to R1",hint:"configure terminal\ninterface g1/0/7\n description TO-R1",check:(w,D)=>/r1/i.test(D.SW1.ifs["GigabitEthernet1/0/7"].desc)},
    {t:"Put the description TO-SW2 on the port that really connects to SW2",hint:"interface g1/0/11\n description TO-SW2",check:(w,D)=>/sw2/i.test(D.SW1.ifs["GigabitEthernet1/0/11"].desc)},
    {t:"Turn on LLDP globally, and stop CDP on the ISP-facing port",hint:"lldp run\ninterface g1/0/10\n no cdp enable",check:(w,D)=>D.SW1.lldp&&D.SW1.ifs["GigabitEthernet1/0/10"].cdp===false}],
  solution:"show cdp neighbors\nconfigure terminal\ninterface g1/0/7\n description TO-R1\ninterface g1/0/11\n description TO-SW2\nlldp run\ninterface g1/0/10\n no cdp enable",
  success:"The descriptions now match the cabling, and you stopped advertising your platform to the ISP."},"cdp",40,"Validated documentation with CDP");
sortViz($("#viz-cdpvs"),{title:"CDP, LLDP, or both?",bins:{cdp:"CDP",lldp:"LLDP",both:"Both"},
  items:[["Cisco proprietary","cdp","Only Cisco devices speak it natively."],["IEEE 802.1AB standard","lldp","Works across vendors."],["On by default on Cisco switches","cdp","LLDP needs lldp run."],["Shows the neighbor's hostname and port","both","That's the whole point of both."],["Advertises every 30 seconds by default","lldp","CDP uses 60 seconds."],["Works even with no IP configured","both","Both run at Layer 2."],["Tells a phone its voice VLAN","both","CDP for Cisco phones, LLDP-MED for others."],["Holdtime of 180 seconds by default","cdp","LLDP's is 120 seconds."]],done:"Sorted CDP and LLDP facts"});
quizViz($("#viz-xping"),{title:"Read the ping",done:"Interpreted every ping",qs:[
  ["R1# ping 10.2.2.2\n.!!!!\nSuccess rate is 80 percent (4/5)",["Working: the first packet waited for ARP","20% packet loss on the link","An ACL drops some packets","MTU problem"],0,"One timeout at the start is normal when the router has to ARP for the next hop."],
  ["R1# ping 10.2.2.2\nU.U.U\nSuccess rate is 0 percent (0/5)",["A router replied that the destination is unreachable","The far host is just slow","Layer 1 is down","DNS failed"],0,"U is an ICMP unreachable. Look for a missing route or an ACL on the path."],
  ["R1# ping 10.2.2.2 source g0/0/1\n.....\nR1# ping 10.2.2.2\n!!!!!",["The remote router has no route back to R1's LAN","R1's LAN interface is down","DNS","The remote host is off"],0,"From the WAN address it works; from the LAN address it fails. The return route for the LAN is missing."],
  ["R1# ping 10.2.2.2 size 1500 df-bit\nM.M.M",["An MTU smaller than 1500 on the path","An ACL","No route","Duplex mismatch"],0,"M means fragmentation needed and DF set. Look for a tunnel or link with a lower MTU."],
  ["R1# ping 10.2.2.2 repeat 1000\n!!!!!.!!!!!!!.!!!!!!!.!!!! ...\nSuccess rate is 93 percent",["Intermittent loss: check errors and congestion","Totally fine","No route","An ACL"],0,"Regular drops point at a physical problem or a congested link. Check interface counters."]]});
quizViz($("#viz-capture"),{title:"What does the capture tell you?",done:"Diagnosed every capture",qs:[
  ["10.1.10.25 → 10.2.5.80  TCP 51522 → 443 [SYN]\n10.1.10.25 → 10.2.5.80  TCP 51522 → 443 [SYN] (retransmission)\n10.1.10.25 → 10.2.5.80  TCP 51522 → 443 [SYN] (retransmission)",["The SYN gets no answer: blocked or server not listening","DNS failure","A duplex mismatch","The client has no IP"],0,"The client keeps retrying the handshake. Check ACLs and firewalls, then the server."],
  ["0.0.0.0 → 255.255.255.255  DHCP Discover\n0.0.0.0 → 255.255.255.255  DHCP Discover\n0.0.0.0 → 255.255.255.255  DHCP Discover",["No DHCP server answers: missing helper or wrong VLAN","DNS failure","The client has a static IP","TCP reset"],0,"Discovers with no Offer: check the helper address and snooping trust."],
  ["Who has 10.1.10.1? Tell 10.1.10.25\nWho has 10.1.10.1? Tell 10.1.10.25\nWho has 10.1.10.1? Tell 10.1.10.25",["The gateway isn't in this VLAN or is down","The client's DNS is wrong","An MTU issue","The server is busy"],0,"ARP for the gateway gets no reply. Check the SVI or subinterface and the VLAN assignment."],
  ["10.1.10.25 → 10.2.5.80  TCP [SYN]\n10.2.5.80 → 10.1.10.25  TCP [RST, ACK]",["The server is reachable but nothing listens on that port","The network drops the SYN","DNS is down","No route"],0,"A reset is an immediate refusal from the host, so the network path works."],
  ["10.1.10.25 → 10.0.0.53  DNS Standard query A intranet.corp.local\n10.0.0.53 → 10.1.10.25  DNS Standard query response, No such name",["The DNS record doesn't exist","The DNS server is unreachable","The firewall blocks DNS","DHCP failed"],0,"The server answered, so it's reachable. The record is missing or the name is wrong."]]});

/* ---- STP election with a storm button ---- */
(function(){
  const el=$("#viz-stp");const SW=[["SW1","00a1.0000.0011",32768],["SW2","00a1.0000.0022",32768],["SW3","00a1.0000.0033",32768]];let off=false,stormT=null;
  const P=[[300,40],[110,190],[490,190]];const L=[[0,1,"Gi1/0/1","Gi1/0/1"],[0,2,"Gi1/0/2","Gi1/0/1"],[1,2,"Gi1/0/2","Gi1/0/2"]];const roots=new Set();
  el.innerHTML=`<div class="viz-title">Spanning tree election: change the priorities</div><div class="viz-scroll"><svg viewBox="0 0 600 250" style="min-width:440px" role="img" aria-label="Three switches in a triangle"></svg></div>
  <div class="stp-ctl">${SW.map((s,i)=>`<label class="rf"><span>${s[0]} priority</span><select data-i="${i}">${[0,4096,8192,12288,16384,20480,24576,28672,32768,36864,40960,61440].map(p=>`<option ${p===s[2]?"selected":""}>${p}</option>`).join("")}</select></label>`).join("")}</div>
  <div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn" data-a="off">Disable spanning tree</button><span class="grow"></span></div>`;
  const bidS=s=>s[2].toString(16).padStart(4,"0")+s[1].replace(/\./g,"");
  function draw(){const r=SW.map((s,i)=>i).sort((a,b)=>bidS(SW[a])<bidS(SW[b])?-1:1)[0];roots.add(r);
    const others=[0,1,2].filter(i=>i!==r);const blocked=L.find(l=>l[0]!==r&&l[1]!==r);const loser=bidS(SW[blocked[0]])<bidS(SW[blocked[1]])?blocked[1]:blocked[0];
    let s="";L.forEach((l,k)=>{const blk=!off&&l===blocked;s+=`<line x1="${P[l[0]][0]}" y1="${P[l[0]][1]}" x2="${P[l[1]][0]}" y2="${P[l[1]][1]}" class="m-link${off?" storm":blk?"":" on"}" ${blk?'stroke-dasharray="6 5"':""}/>`;
      if(!off){const isRoot=i=>i===r;[[l[0],l[1],l[2]],[l[1],l[0],l[3]]].forEach(([a,b,ifn])=>{const role=isRoot(a)?"DP":(l[0]===r||l[1]===r)?"RP":a===loser?"ALT":"DP";const fx=P[a][0]+(P[b][0]-P[a][0])*.24,fy=P[a][1]+(P[b][1]-P[a][1])*.24;
        s+=`<rect x="${fx-20}" y="${fy-10}" width="40" height="19" rx="5" class="${role==="ALT"?"stp-x":"stp-b"}"/><text x="${fx}" y="${fy+4}" text-anchor="middle" class="mono" style="font-size:10px;fill:var(--fg)">${role}</text>`})}});
    SW.forEach((sw,i)=>{s+=`<rect x="${P[i][0]-56}" y="${P[i][1]-20}" width="112" height="44" rx="8" class="m-node${i===r&&!off?" on":""}"/><text x="${P[i][0]}" y="${P[i][1]-2}" text-anchor="middle" class="s-b">${sw[0]}${i===r&&!off?" ★ root":""}</text><text x="${P[i][0]}" y="${P[i][1]+15}" text-anchor="middle" class="mono" style="font-size:9px;fill:var(--muted)">${sw[2]}+1 · ${sw[1]}</text>`});
    $("svg",el).innerHTML=s;
    $(".caption",el).innerHTML=off?`<span class="status-bad">Broadcast storm.</span> With spanning tree off, one ARP broadcast circles the triangle in both directions forever, copying itself at every switch. Links hit 100%, MAC tables flap between ports, and CPUs choke. Turn it back on.`:
      `<b>${SW[r][0]}</b> wins with the lowest bridge ID (${SW[r][2]+1} with VLAN 1 added${SW.filter(x=>x[2]===SW[r][2]).length>1?", tie broken by the lowest MAC":""}). ${others.map(i=>SW[i][0]).join(" and ")} each pick the direct link to the root as their <b>root port</b> (cost 4). On the ${SW[blocked[0]][0]}–${SW[blocked[1]][0]} link, ${SW[loser===blocked[0]?blocked[1]:blocked[0]][0]} has the better bridge ID, so its port is designated and <b>${SW[loser][0]}'s port is the alternate</b> and discards.`;
    $('[data-a="off"]',el).textContent=off?"Re-enable spanning tree":"Disable spanning tree";$(".grow",el).textContent=`${roots.size} of 3 switches have been root`;if(roots.size===3)award("viz:stp",30,"Made every switch the root")}
  el.addEventListener("change",e=>{const i=e.target.dataset.i;if(i===undefined)return;SW[+i][2]=+e.target.value;draw()});
  el.addEventListener("click",e=>{if(e.target.closest('[data-a="off"]')){off=!off;if(off)flag("storm");draw()}});draw();
})();
sortViz($("#viz-stpstate"),{title:"Role or state?",bins:{role:"Port role",state:"RSTP port state",feat:"Optional feature"},
  items:[["Root","role","The best path to the root bridge."],["Designated","role","The forwarding port on a segment."],["Alternate","role","A blocked backup path to the root."],["Backup","role","A blocked backup on a shared segment."],["Discarding","state","Drops frames, doesn't learn MACs."],["Learning","state","Learns MACs, doesn't forward yet."],["Forwarding","state","Sends and receives frames."],["PortFast","feat","Edge port skips straight to forwarding."],["BPDU Guard","feat","Err-disables a port that hears a BPDU."]],done:"Sorted STP roles, states and features"});
quizViz($("#viz-guards"),{title:"Which protection fits?",done:"Picked every STP protection",qs:[
  ["Users keep plugging cheap switches into their desk ports.",["BPDU Guard on access ports","Root Guard on uplinks","Loop Guard","Disable STP"],0,"Any BPDU on that port err-disables it."],
  ["The distribution switches must stay root even if someone misconfigures an access switch with priority 0.",["Root Guard on the distribution ports facing access switches","BPDU Guard on uplinks","PortFast on uplinks","Increase cost"],0,"Root Guard rejects superior BPDUs coming up from below."],
  ["PCs take 30 seconds to get network access after booting, so DHCP times out.",["PortFast on access ports","Root Guard","Loop Guard","DTP"],0,"PortFast skips the listening and learning delay."],
  ["A fiber pair has one strand failing, so BPDUs stop arriving in one direction.",["Loop Guard (or UDLD)","PortFast","BPDU Guard","Root Guard"],0,"Loop Guard keeps the port from moving to forwarding when BPDUs vanish."],
  ["A port facing a hypervisor host carries six VLANs and should come up immediately.",["spanning-tree portfast trunk","spanning-tree guard root","BPDU filter on the whole switch","Disable STP on the VLANs"],0,"PortFast for trunks to edge devices."]]});
  },
  sims:[
    {id:"vlanlab",type:"ios",title:"Build VLANs and a trunk across two switches",lab:{
      scenario:"Sales (VLAN 10) and Engineering (VLAN 20) sit on two switches. R1 is already set up for router on a stick on SW1 Gi1/0/1 with gateways 10.1.10.1 and 10.1.20.1. Build the VLANs, ports and trunks so every PC can reach its gateway and the other PCs.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"],["SW1:g1/0/12","SW2:g1/0/12"]],
      hosts:[{name:"PC1",ip:"10.1.10.11",gw:"10.1.10.1",at:"SW1:g1/0/2"},{name:"PC2",ip:"10.1.20.12",gw:"10.1.20.1",at:"SW1:g1/0/3"},{name:"PC3",ip:"10.1.10.13",gw:"10.1.10.1",at:"SW2:g1/0/2"},{name:"PC4",ip:"10.1.20.14",gw:"10.1.20.1",at:"SW2:g1/0/3"}],
      boot:{R1:["interface g0/0/1","no shutdown","interface g0/0/1.10","encapsulation dot1q 10","ip address 10.1.10.1 255.255.255.0","interface g0/0/1.20","encapsulation dot1q 20","ip address 10.1.20.1 255.255.255.0","interface g0/0/1.99","encapsulation dot1q 99 native"]},
      consoles:["SW1","SW2"],topo:{R1:[300,40],SW1:[180,130],SW2:[420,130],PC1:[80,215],PC2:[220,215],PC3:[380,215],PC4:[520,215]},topoH:260,
      tasks:[
        {t:"On both switches, create VLAN 10 SALES, VLAN 20 ENG and VLAN 99 NATIVE",hint:"vlan 10\n name SALES\nvlan 20\n name ENG\nvlan 99\n name NATIVE",check:(w,D)=>["SW1","SW2"].every(s=>/^sales$/i.test(D[s].vlans[10]?.name||"")&&/^eng$/i.test(D[s].vlans[20]?.name||"")&&D[s].vlans[99])},
        {t:"On both switches, put Gi1/0/2 in VLAN 10 and Gi1/0/3 in VLAN 20 as access ports",hint:"interface g1/0/2\n switchport mode access\n switchport access vlan 10\ninterface g1/0/3\n switchport mode access\n switchport access vlan 20",check:(w,D)=>["SW1","SW2"].every(s=>{const a=D[s].ifs["GigabitEthernet1/0/2"],b=D[s].ifs["GigabitEthernet1/0/3"];return a.sw.mode==="access"&&a.sw.access===10&&b.sw.mode==="access"&&b.sw.access===20})},
        {t:"Make SW1 Gi1/0/1 (to R1) a trunk with native VLAN 99",hint:"interface g1/0/1\n switchport mode trunk\n switchport trunk native vlan 99",check:(w,D)=>{const i=D.SW1.ifs["GigabitEthernet1/0/1"];return i.sw.mode==="trunk"&&i.sw.native===99}},
        {t:"Make Gi1/0/12 a trunk on both switches, with native VLAN 99, only VLANs 10, 20 and 99 allowed, and DTP off",hint:"interface g1/0/12\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate",check:(w,D)=>["SW1","SW2"].every(s=>{const i=D[s].ifs["GigabitEthernet1/0/12"];return i.sw.mode==="trunk"&&i.sw.native===99&&i.sw.noneg&&[10,20,99].every(v=>IOS.listHas(i.sw.allowed??"all",v))&&!IOS.listHas(i.sw.allowed??"all",1)})},
        {t:"Everyone can reach everyone: PC1 reaches PC3 (same VLAN, across the trunk) and PC4 (routed)",hint:"show interfaces trunk\nshow vlan brief",check:w=>{const H=w.hosts;return IOS.ping(w,{host:H[0]},H[2].ip,4).ok&&IOS.ping(w,{host:H[0]},H[3].ip,4).ok&&IOS.ping(w,{host:H[3]},H[1].ip,4).ok}}],
      solution:"! On SW1\nenable\nconfigure terminal\nvlan 10\n name SALES\nvlan 20\n name ENG\nvlan 99\n name NATIVE\ninterface g1/0/2\n switchport mode access\n switchport access vlan 10\ninterface g1/0/3\n switchport mode access\n switchport access vlan 20\ninterface g1/0/1\n switchport mode trunk\n switchport trunk native vlan 99\ninterface g1/0/12\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate\n! On SW2\nenable\nconfigure terminal\nvlan 10\n name SALES\nvlan 20\n name ENG\nvlan 99\n name NATIVE\ninterface g1/0/2\n switchport mode access\n switchport access vlan 10\ninterface g1/0/3\n switchport mode access\n switchport access vlan 20\ninterface g1/0/12\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate",
      success:"VLANs are consistent on both switches, the trunks are locked down, and R1 routes between Sales and Engineering."}},
    {id:"eclab",type:"ios",title:"Bundle two uplinks with LACP",lab:{
      scenario:"SW1 and SW2 are connected by Gi1/0/11 and Gi1/0/12. SW2 is already set to LACP passive on both, but a coworker left something odd on one of its ports. Build the bundle from SW1, then find and fix the problem on SW2.",
      devices:[{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["SW1:g1/0/11","SW2:g1/0/11"],["SW1:g1/0/12","SW2:g1/0/12"]],
      boot:{SW2:["hostname SW2","interface range g1/0/11 - 12","switchport mode trunk","channel-group 1 mode passive","interface port-channel 1","switchport mode trunk","interface g1/0/12","switchport trunk allowed vlan 10,20"]},
      consoles:["SW1","SW2"],topo:{SW1:[170,90],SW2:[430,90]},offs:{"SW1SW2GigabitEthernet1/0/11":-14,"SW1SW2GigabitEthernet1/0/12":14},topoH:170,
      tasks:[
        {t:"On SW1, make Gi1/0/11 and Gi1/0/12 trunks in channel group 1 using LACP active",hint:"interface range g1/0/11 - 12\n switchport mode trunk\n channel-group 1 mode active",check:(w,D)=>["GigabitEthernet1/0/11","GigabitEthernet1/0/12"].every(n=>{const i=D.SW1.ifs[n];return i.cg&&i.cg.n==1&&i.cg.mode==="active"&&i.sw.mode==="trunk"})},
        {t:"Make SW1's Port-channel1 a trunk",hint:"interface port-channel 1\n switchport mode trunk",check:(w,D)=>D.SW1.ifs["Port-channel1"]?.sw.mode==="trunk"},
        {t:"Look at show etherchannel summary on SW2 to find the suspended member",hint:"show etherchannel summary",check:(w,D,S)=>S.SW2.hist.some(h=>/sh\S* eth\S* su/i.test(h))},
        {t:"Fix SW2 so both members are bundled (P) on both switches",hint:"interface g1/0/12\n no switchport trunk allowed vlan",check:(w,D)=>["SW1","SW2"].every(s=>["GigabitEthernet1/0/11","GigabitEthernet1/0/12"].every(n=>IOS.ecMember(w,D[s],D[s].ifs[n])==="P"))}],
      solution:"! On SW1\nenable\nconfigure terminal\ninterface range g1/0/11 - 12\n switchport mode trunk\n channel-group 1 mode active\ninterface port-channel 1\n switchport mode trunk\n! On SW2\nenable\nshow etherchannel summary\nconfigure terminal\ninterface g1/0/12\n no switchport trunk allowed vlan",
      success:"Po1 is up with both members bundled. Members must match the port channel exactly, or they're suspended."}},
    {id:"stplab",type:"ios",title:"Take control of spanning tree",lab:{
      scenario:"Three switches form a triangle. Right now the root bridge was elected by MAC address, which is random. Make SW1 the root for VLAN 10 and SW2 the backup, then protect the access port where PC1 plugs in.",
      devices:[{name:"SW1",kind:"switch",macBase:"00a1.c0de.0300"},{name:"SW2",kind:"switch",macBase:"00a1.c0de.0200"},{name:"SW3",kind:"switch",macBase:"00a1.c0de.0100"}],
      links:[["SW1:g1/0/1","SW2:g1/0/1"],["SW1:g1/0/2","SW3:g1/0/1"],["SW2:g1/0/2","SW3:g1/0/2"]],hosts:[{name:"PC1",ip:"10.1.10.50",gw:"10.1.10.1",at:"SW3:g1/0/5"}],
      boot:{SW1:["vlan 10","interface range g1/0/1 - 2","switchport mode trunk"],SW2:["vlan 10","interface range g1/0/1 - 2","switchport mode trunk"],SW3:["vlan 10","interface range g1/0/1 - 2","switchport mode trunk","interface g1/0/5","switchport mode access","switchport access vlan 10"]},
      consoles:["SW1","SW2","SW3"],start:"SW3",stpV:10,topo:{SW1:[300,40],SW2:[120,170],SW3:[480,170],PC1:[560,240]},topoH:280,
      tasks:[
        {t:"Find the current root for VLAN 10 with show spanning-tree vlan 10",hint:"show spanning-tree vlan 10",check:(w,D,S)=>Object.values(S).some(x=>x.hist.some(h=>/sh\S* span\S*/i.test(h)))},
        {t:"Make SW1 the root bridge for VLAN 10",hint:"! On SW1\nspanning-tree vlan 10 root primary",check:w=>IOS.stp(w,10)?.root.name==="SW1"},
        {t:"Make SW2 the secondary root for VLAN 10 (priority 28672)",hint:"! On SW2\nspanning-tree vlan 10 root secondary",check:(w,D)=>D.SW2.stp.pri[10]===28672},
        {t:"On SW3 Gi1/0/5, turn on PortFast and BPDU Guard",hint:"! On SW3\ninterface g1/0/5\n spanning-tree portfast\n spanning-tree bpduguard enable",check:(w,D)=>{const i=D.SW3.ifs["GigabitEthernet1/0/5"];return i.pf&&i.bg}},
        {t:"Confirm SW3's link to SW2 is now the blocked (Altn) port",hint:"show spanning-tree vlan 10",check:(w,D,S)=>{const T=IOS.stp(w,10);return T&&T.roles.get("SW3")["GigabitEthernet1/0/2"]==="Altn"&&S.SW3.hist.filter(h=>/sh\S* span/i.test(h)).length>=1&&T.root.name==="SW1"}}],
      solution:"! On SW3\nenable\nshow spanning-tree vlan 10\n! On SW1\nenable\nconfigure terminal\nspanning-tree vlan 10 root primary\n! On SW2\nenable\nconfigure terminal\nspanning-tree vlan 10 root secondary\n! On SW3\nconfigure terminal\ninterface g1/0/5\n spanning-tree portfast\n spanning-tree bpduguard enable\n do show spanning-tree vlan 10",
      success:"SW1 is root by design, SW2 takes over if it fails, and PC1's port is fast and guarded."}},
    {id:"trunkfix",type:"ios",title:"Troubleshoot: Engineering on SW2 is cut off",lab:{
      scenario:"Ticket: 'PC4 on the second floor can't reach anything since last night's change.' PC4 is in VLAN 20 on SW2. Everything on SW1 works, and PC3 (VLAN 10 on SW2) works. Find and fix every problem. R1 is the router on a stick and is fine.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"],["SW1:g1/0/12","SW2:g1/0/12"]],
      hosts:[{name:"PC1",ip:"10.1.10.11",gw:"10.1.10.1",at:"SW1:g1/0/2"},{name:"PC2",ip:"10.1.20.12",gw:"10.1.20.1",at:"SW1:g1/0/3"},{name:"PC3",ip:"10.1.10.13",gw:"10.1.10.1",at:"SW2:g1/0/2"},{name:"PC4",ip:"10.1.20.14",gw:"10.1.20.1",at:"SW2:g1/0/3"}],
      boot:{R1:["interface g0/0/1","no shutdown","interface g0/0/1.10","encapsulation dot1q 10","ip address 10.1.10.1 255.255.255.0","interface g0/0/1.20","encapsulation dot1q 20","ip address 10.1.20.1 255.255.255.0","interface g0/0/1.99","encapsulation dot1q 99 native"],
        SW1:["hostname SW1","vlan 10","name SALES","vlan 20","name ENG","vlan 99","name NATIVE","interface g1/0/1","switchport mode trunk","switchport trunk native vlan 99","interface g1/0/2","switchport mode access","switchport access vlan 10","interface g1/0/3","switchport mode access","switchport access vlan 20","interface g1/0/12","switchport mode trunk","switchport trunk native vlan 99","switchport trunk allowed vlan 10,20,99"],
        SW2:["hostname SW2","vlan 10","name SALES","vlan 99","name NATIVE","interface g1/0/2","switchport mode access","switchport access vlan 10","interface g1/0/3","switchport mode access","switchport access vlan 20","interface g1/0/12","switchport mode trunk","switchport trunk allowed vlan 10,99","no vlan 20"]},
      consoles:["SW2","SW1"],start:"SW2",startMode:"priv",topo:{R1:[300,40],SW1:[180,130],SW2:[420,130],PC1:[80,215],PC2:[220,215],PC3:[380,215],PC4:[520,215]},topoH:260,
      tasks:[
        {t:"Investigate with show vlan brief and show interfaces trunk on SW2",hint:"show vlan brief\nshow interfaces trunk",check:(w,D,S)=>S.SW2.hist.some(h=>/sh\S* vl\S* b/i.test(h))&&S.SW2.hist.some(h=>/sh\S* int\S* tr/i.test(h))},
        {t:"VLAN 20 exists on SW2",hint:"vlan 20\n name ENG",check:(w,D)=>!!D.SW2.vlans[20]},
        {t:"The trunk on SW2 carries VLAN 20",hint:"interface g1/0/12\n switchport trunk allowed vlan add 20",check:(w,D)=>IOS.trunkAllows(D.SW2.ifs["GigabitEthernet1/0/12"],20)},
        {t:"The native VLAN matches on both ends of the trunk",hint:"switchport trunk native vlan 99",check:(w,D)=>D.SW2.ifs["GigabitEthernet1/0/12"].sw.native===D.SW1.ifs["GigabitEthernet1/0/12"].sw.native},
        {t:"PC4 reaches its gateway and PC2",hint:"Check every task above is done.",check:w=>{const H=w.hosts;return IOS.ping(w,{host:H[3]},IOS.ip4("10.1.20.1"),4).ok&&IOS.ping(w,{host:H[3]},H[1].ip,4).ok&&IOS.ping(w,{host:H[2]},H[0].ip,4).ok}}],
      solution:"show vlan brief\nshow interfaces trunk\nconfigure terminal\nvlan 20\n name ENG\ninterface g1/0/12\n switchport trunk allowed vlan add 20\n switchport trunk native vlan 99",
      success:"Three faults from one change: VLAN 20 was missing on SW2, the trunk didn't allow it, and the native VLANs didn't match."}},
    {id:"portmatch",type:"match",title:"Configure the closet",
      scenario:"Match each switch port to the configuration it needs.",
      items:[["switchport mode access + access vlan 10 + voice vlan 150 + portfast","phone"],["switchport mode trunk + portfast trunk","esxi"],["switchport mode access (AP management VLAN) + portfast","lap"],["switchport mode trunk + nonegotiate + native vlan 99","uplink"],["no switchport + ip address","l3"],["channel-group 1 mode active","bundle"]],
      slots:[["phone","Gi1/0/5","IP phone with a PC behind it"],["esxi","Gi1/0/20","Hypervisor host with VMs in four VLANs"],["lap","Gi1/0/30","Lightweight AP in local mode"],["uplink","Gi1/1/1","Uplink to the distribution switch"],["l3","Gi1/1/3","Point-to-point routed link to the WAN router"],["bundle","Gi1/1/1–2","Two uplinks to the same switch, as one logical link"]],
      success:"Every edge device gets exactly what it needs and nothing more."}
  ],
  badges:[
    ["reader","L2","Layer 2 Scholar","Mark all 7 switching lessons studied",c=>c.allStudied()],
    ["lab","SW","Wiring Closet","Complete all 17 diagrams in this module",c=>c.vizAll()],
    ["vlan","VL","VLAN Architect","Pass the VLAN and trunk lab",c=>c.passed("vlanlab")],
    ["ec","PO","Bundled","Pass the EtherChannel lab",c=>c.passed("eclab")],
    ["stp","RB","Root Bridge","Pass the spanning tree lab",c=>c.passed("stplab")],
    ["fix","TK","Ticket Closed","Fix the broken trunk",c=>c.passed("trunkfix")],
    ["elect","EL","Election Night","Make every switch the root in the STP diagram",c=>c.earned("viz:stp")],
    ["perfect","SU","Po1(SU)","Score 100% on a switching quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
