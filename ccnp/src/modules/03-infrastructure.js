/* ================= Module 3: Infrastructure (350-401 v1.2 Domain 3.0, 30%) ================= */
(function(){
const LESSONS=[
{id:"trunk",num:"3.1",title:"802.1Q trunking and DTP troubleshooting",html:`
<p>A trunk carries many VLANs over one link by adding a 4-byte <b>802.1Q tag</b> (with a 12-bit VLAN ID and the 3-bit CoS) to each frame. Frames in the <b>native VLAN</b> cross untagged. ENCOR expects you to fix trunks that don't form or don't carry what they should.</p>
<h3>Dynamic Trunking Protocol</h3>
<p>DTP is Cisco's protocol for negotiating whether a link becomes a trunk. Each side's administrative mode decides the result:</p>
<table><tr><th></th><th>access</th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th><th>trunk + nonegotiate</th></tr>
<tr><td><b>access</b></td><td>Access</td><td>Access</td><td>Access</td><td>Mismatch</td><td>Mismatch</td></tr>
<tr><td><b>dynamic auto</b></td><td>Access</td><td>Access</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td><b>dynamic desirable</b></td><td>Access</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td><b>trunk</b></td><td>Mismatch</td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Trunk</td></tr></table>
<ul><li><b>dynamic auto</b> (the Catalyst 9000 default) only answers DTP; it never asks. Two auto ports stay access.</li>
<li><b>dynamic desirable</b> actively asks to trunk.</li>
<li><b>switchport nonegotiate</b> stops DTP frames. A nonegotiate trunk facing a dynamic port leaves the other side as access, because it never hears an offer.</li>
<li>Best practice: hard-code <code>switchport mode trunk</code> with <code>switchport nonegotiate</code> on trunks, and <code>switchport mode access</code> on user ports. DTP on user ports lets an attacker negotiate a trunk (switch spoofing).</li></ul>
<div class="viz" id="viz-dtp"></div>
<h3>Common trunk problems</h3>
<ul><li><b>Native VLAN mismatch</b>: CDP logs <code>%CDP-4-NATIVE_VLAN_MISMATCH</code>, and untagged traffic leaks between the two VLANs. Set the same native VLAN on both ends (and use an unused one).</li>
<li><b>Allowed VLAN list</b>: <code>switchport trunk allowed vlan 10,20</code> replaces the list. Use <code>allowed vlan add 30</code> to add one. A VLAN missing from the list on either side doesn't cross.</li>
<li><b>VLAN not created</b>: a trunk only forwards VLANs that exist (and are active) on the switch. <code>show interfaces trunk</code> lists "allowed and active in management domain".</li>
<li><b>VTP</b> can delete VLANs if a switch with a higher revision number joins. Many networks run VTP transparent or VTPv3.</li></ul>
<p>Verification: <code>show interfaces trunk</code>, <code>show interfaces g1/0/1 switchport</code> (administrative vs operational mode), <code>show vlan brief</code>.</p>
<div class="tip"><b>Exam tip.</b> auto + auto = access. Desirable + auto = trunk. Nonegotiate stops DTP, so the far end must be hard-coded too.</div>`},
{id:"ec",num:"3.2",title:"EtherChannel: LACP, PAgP and static",html:`
<p>EtherChannel bundles 2 to 8 physical links into one logical <b>port-channel</b>. STP sees one link, so nothing blocks, and traffic is load-balanced across the members by a hash.</p>
<table><tr><th>Mode</th><th>Protocol</th><th>Behavior</th></tr>
<tr><td><code>active</code></td><td>LACP (IEEE 802.3ad / 802.1AX)</td><td>Sends LACP packets to form a bundle</td></tr>
<tr><td><code>passive</code></td><td>LACP</td><td>Only responds to LACP</td></tr>
<tr><td><code>desirable</code></td><td>PAgP (Cisco)</td><td>Sends PAgP packets</td></tr>
<tr><td><code>auto</code></td><td>PAgP</td><td>Only responds to PAgP</td></tr>
<tr><td><code>on</code></td><td>None</td><td>Forces the bundle with no negotiation</td></tr></table>
<p>A bundle forms with <b>active/active</b>, <b>active/passive</b>, <b>desirable/desirable</b>, <b>desirable/auto</b> or <b>on/on</b>. It doesn't form with passive/passive, auto/auto, or any mix of protocols, and <code>on</code> never talks to LACP or PAgP.</p>
<h3>Member requirements</h3>
<p>All members must match: <b>speed and duplex</b>, <b>switchport mode</b> (all access in the same VLAN, or all trunk with the same native and allowed VLANs), and STP settings. A mismatched port is <b>suspended</b> (<code>(s)</code>) or left <b>stand-alone</b> (<code>(I)</code>).</p>
<h3>Load balancing</h3>
<ul><li>The switch hashes fields of each frame (source/destination MAC, IP, or ports) to pick a member. A single flow always uses one link, so one big transfer can't go faster than one member.</li>
<li><code>port-channel load-balance src-dst-ip</code> (or src-dst-mixed-ip-port on newer platforms) spreads traffic best when there are many hosts. src-mac between two routers would put everything on one link.</li></ul>
<h3>Verification</h3>
<p><code>show etherchannel summary</code>: <code>SU</code> = Layer 2 in use, <code>RU</code> = Layer 3 in use, <code>SD</code> = down. Member flags: <code>P</code> bundled, <code>I</code> stand-alone, <code>s</code> suspended, <code>D</code> down. <code>show lacp neighbor</code> and <code>show pagp neighbor</code> show the other side.</p>
<p>LACP extras: <b>system priority</b> and <b>port priority</b> decide which ports are active when more than the maximum are configured (up to 16 with LACP: 8 active, 8 hot-standby). <code>lacp rate fast</code> sends LACPDUs every second instead of 30.</p>
<div class="viz" id="viz-ecneg"></div>
<div class="viz" id="viz-ecflags"></div>
<div class="tip"><b>Exam tip.</b> Configure the physical ports the same, then put the channel-group on all of them. Changes to trunking go on the <code>interface port-channel</code> after the bundle exists.</div>`},
{id:"stp",num:"3.3",title:"RSTP, MST and STP protection",html:`
<p>Spanning tree prevents Layer 2 loops by electing a <b>root bridge</b> (lowest bridge ID: priority + system ID extension + MAC) and blocking redundant paths.</p>
<h3>Rapid PVST+ (802.1w per VLAN)</h3>
<ul><li>Port roles: <b>root</b> (best path to the root), <b>designated</b> (forwarding onto a segment), <b>alternate</b> (backup path to the root, discarding), <b>backup</b> (a second port to the same segment).</li>
<li>States: <b>discarding, learning, forwarding</b>.</li>
<li>Convergence in about a second, using a proposal/agreement handshake on point-to-point links instead of 30 to 50 seconds of timers. Edge ports (PortFast) go straight to forwarding.</li>
<li>One instance per VLAN, so each VLAN can have a different root to load-balance uplinks, but every instance costs CPU and memory.</li></ul>
<h3>MST (802.1s)</h3>
<p>MST maps many VLANs into a few <b>instances</b>. Two instances (one root on each distribution switch) give the same load balancing as 100 Rapid PVST+ instances, at a fraction of the cost.</p>
<ul><li>Switches are in the same <b>MST region</b> only if <b>name, revision number and the VLAN-to-instance map</b> all match exactly. Otherwise each is its own region and they interact through the CIST at the boundary.</li>
<li><b>Instance 0</b> (the IST) always exists and carries every VLAN not mapped elsewhere. It's the only instance that sends BPDUs; other instances' information rides in MSTI records inside them.</li>
<li>Priority is per instance: <code>spanning-tree mst 1 priority 24576</code> or <code>spanning-tree mst 1 root primary</code>.</li></ul>
<pre class="term">spanning-tree mode mst
spanning-tree mst configuration
 name CAMPUS
 revision 2
 instance 1 vlan 10,20
 instance 2 vlan 30,40
spanning-tree mst 1 priority 24576
spanning-tree mst 2 priority 28672</pre>
<div class="viz" id="viz-mstmap"></div>
<h3>Protection features</h3>
<table><tr><th>Feature</th><th>Where</th><th>What it does</th></tr>
<tr><td><b>BPDU Guard</b></td><td>Access (PortFast) ports</td><td>Err-disables the port if any BPDU arrives: someone plugged in a switch.</td></tr>
<tr><td><b>BPDU Filter</b></td><td>Edge ports (rarely)</td><td>Stops sending and ignores BPDUs. Dangerous: can create loops.</td></tr>
<tr><td><b>Root Guard</b></td><td>Distribution ports facing access</td><td>If a superior BPDU arrives (a switch trying to become root), the port goes <b>root-inconsistent</b> (blocked) until the superior BPDUs stop. No err-disable.</td></tr>
<tr><td><b>Loop Guard</b></td><td>Root and alternate ports</td><td>If BPDUs stop arriving on a blocking port (unidirectional link), the port goes loop-inconsistent instead of forwarding.</td></tr>
<tr><td><b>UDLD</b></td><td>Fiber links</td><td>Detects one-way links at Layer 1/2.</td></tr></table>
<div class="viz" id="viz-guards"></div>
<div class="tip"><b>Exam tip.</b> Root Guard: stop another switch becoming root (port blocks, recovers on its own). BPDU Guard: stop any switch on an access port (err-disabled, needs recovery). MST region = same name + revision + map.</div>`},
{id:"eigrp",num:"3.4",title:"EIGRP and OSPF compared",html:`
<p>ENCOR asks you to <b>compare</b> EIGRP and OSPF concepts: how they learn, how they choose paths and how they load-balance. This guide's simulator runs OSPF; EIGRP is covered here as theory.</p>
<table><tr><th></th><th>EIGRP</th><th>OSPF</th></tr>
<tr><td>Type</td><td>Advanced distance vector</td><td>Link state</td></tr>
<tr><td>Algorithm</td><td>DUAL</td><td>Dijkstra SPF</td></tr>
<tr><td>Knowledge</td><td>Neighbors' distances to each destination</td><td>A full map (LSDB) of the area</td></tr>
<tr><td>Metric</td><td>Composite: bandwidth and delay by default (K1 = K3 = 1)</td><td>Cost = reference bandwidth / interface bandwidth</td></tr>
<tr><td>Load balancing</td><td>Equal and <b>unequal</b> cost (<code>variance</code>)</td><td>Equal cost only</td></tr>
<tr><td>AD</td><td>90 internal, 170 external, 5 summary</td><td>110</td></tr>
<tr><td>Transport</td><td>IP protocol 88, multicast 224.0.0.10, RTP for reliability</td><td>IP protocol 89, 224.0.0.5 (all) and 224.0.0.6 (DR/BDR)</td></tr>
<tr><td>Hierarchy</td><td>Flat; summarize on any interface; stub routers</td><td>Areas around a backbone (area 0); summarize at ABRs and ASBRs</td></tr>
<tr><td>Standard</td><td>Cisco, published as informational RFC 7868</td><td>Open (RFC 2328, OSPFv3 RFC 5340)</td></tr></table>
<h3>EIGRP path terms</h3>
<ul><li><b>Feasible distance (FD)</b>: this router's best total metric to the destination.</li>
<li><b>Reported (advertised) distance (RD)</b>: the neighbor's own metric to the destination.</li>
<li><b>Successor</b>: the neighbor with the lowest FD. It goes in the routing table.</li>
<li><b>Feasible successor</b>: a backup neighbor that meets the <b>feasibility condition: its RD is less than the current FD</b>. That proves it's loop-free, so EIGRP can switch to it instantly without a query.</li>
<li>No feasible successor means the route goes <b>active</b> and EIGRP sends queries to neighbors. Stub routers and summarization limit how far queries spread (avoiding stuck-in-active).</li>
<li><b>Unequal-cost load balancing</b>: with <code>variance 2</code>, any feasible successor whose metric is less than 2 × FD is also installed, with traffic shared in proportion to metric.</li></ul>
<div class="viz" id="viz-fsucc"></div>
<div class="viz" id="viz-eigospf"></div>
<div class="tip"><b>Exam tip.</b> Only EIGRP does unequal-cost load balancing. A feasible successor needs RD &lt; FD. OSPF uses areas and SPF; EIGRP uses DUAL and summarizes anywhere.</div>`},
{id:"ospf",num:"3.5",title:"OSPF: multiple areas, network types, summarization and filtering",html:`
<h3>Neighbors</h3>
<p>Two OSPF routers become neighbors only if these match on the link: <b>area ID</b>, <b>subnet and mask</b>, <b>hello and dead timers</b>, <b>authentication</b>, <b>stub area flags</b>, and they must have <b>different router IDs</b>. An <b>MTU mismatch</b> lets them see each other but stalls the adjacency in <b>EXSTART/EXCHANGE</b> (fix the MTU or use <code>ip ospf mtu-ignore</code>). <b>Passive interfaces</b> advertise their network but send no hellos.</p>
<h3>Network types</h3>
<table><tr><th>Type</th><th>DR/BDR</th><th>Hello/Dead</th><th>Default on</th></tr>
<tr><td>Broadcast</td><td>Yes</td><td>10/40</td><td>Ethernet</td></tr>
<tr><td>Point-to-point</td><td>No</td><td>10/40</td><td>Serial, GRE tunnels; set it on Ethernet links between two routers to skip the DR election</td></tr>
<tr><td>Non-broadcast (NBMA)</td><td>Yes, manual neighbors</td><td>30/120</td><td>Frame Relay (historic)</td></tr>
<tr><td>Point-to-multipoint</td><td>No</td><td>30/120</td><td>Hub and spoke</td></tr></table>
<p>On a broadcast segment, the highest interface priority (default 1; 0 means never) and then the highest router ID wins DR. The election isn't preemptive. Everyone forms FULL adjacencies with the DR and BDR and stays 2WAY with each other (DROTHERs).</p>
<div class="viz" id="viz-ospfnbr"></div>
<h3>Areas and LSAs</h3>
<ul><li>Every area must connect to <b>area 0</b>. An <b>ABR</b> sits in area 0 and another area; an <b>ASBR</b> redistributes external routes.</li>
<li>Splitting into areas keeps SPF runs and LSDBs small: a link flap in area 10 only causes SPF inside area 10. Other areas just see a changed summary.</li></ul>
<table><tr><th>LSA</th><th>Name</th><th>From</th><th>Scope</th></tr>
<tr><td>1</td><td>Router</td><td>Every router</td><td>Area</td></tr>
<tr><td>2</td><td>Network</td><td>The DR</td><td>Area</td></tr>
<tr><td>3</td><td>Summary</td><td>ABR (inter-area routes, O IA)</td><td>Area</td></tr>
<tr><td>4</td><td>ASBR summary</td><td>ABR (how to reach an ASBR)</td><td>Area</td></tr>
<tr><td>5</td><td>External</td><td>ASBR (O E1 / O E2)</td><td>Whole domain</td></tr>
<tr><td>7</td><td>NSSA external</td><td>ASBR in an NSSA (O N1 / O N2), turned into type 5 by the ABR</td><td>NSSA</td></tr></table>
<h3>Area types</h3>
<ul><li><b>Stub</b> (<code>area 10 stub</code> on every router in the area): no type 4 or 5 LSAs; the ABR injects a default route.</li>
<li><b>Totally stubby</b> (<code>area 10 stub no-summary</code> on the ABR): no type 3, 4 or 5 except a default route. Routers see only intra-area routes and 0.0.0.0/0.</li>
<li><b>NSSA</b>: like stub, but it can have its own ASBR, which uses type 7 LSAs. <b>Totally NSSA</b> also blocks type 3.</li></ul>
<div class="viz" id="viz-lsa"></div>
<div class="viz" id="viz-areatype"></div>
<h3>Summarization and filtering</h3>
<ul><li><code>area 10 range 172.20.0.0 255.255.252.0</code> on the <b>ABR</b> summarizes area 10's routes into one type 3 LSA for other areas. The ABR installs a <b>Null0 discard route</b> for the summary to prevent loops.</li>
<li><code>summary-address</code> on the <b>ASBR</b> summarizes external (type 5) routes.</li>
<li><code>area 10 range ... not-advertise</code> hides those networks from other areas. <code>area 10 filter-list prefix NAME in|out</code> filters type 3 LSAs at the ABR.</li>
<li><code>distribute-list prefix NAME in</code> under <code>router ospf</code> stops routes from entering <b>this router's routing table</b>. The LSAs are still in the LSDB and still flooded: link-state protocols can't filter what neighbors learn this way.</li></ul>
<h3>OSPFv3</h3>
<p>OSPFv3 (for IPv6, and IPv4 too with address families) uses the same areas, LSA flooding and SPF, with these differences: it's enabled per interface (<code>ipv6 ospf 1 area 0</code> or <code>ospfv3 1 ipv6 area 0</code>), neighbors use <b>link-local addresses</b>, it still needs a 32-bit router ID (set it manually if there's no IPv4 address), authentication uses IPsec, and new LSA types 8 (link) and 9 (intra-area prefix) carry addresses separately from topology.</p>
<div class="viz" id="viz-ospfmini"></div>
<div class="tip"><b>Exam tip.</b> <code>area range</code> = ABR, <code>summary-address</code> = ASBR. A distribute-list in OSPF filters the RIB only. EXSTART points at an MTU mismatch.</div>`},
{id:"bgp",num:"3.6",title:"eBGP neighbors and best path selection",html:`
<p>BGP is the routing protocol between autonomous systems. ENCOR covers <b>eBGP between directly connected neighbors</b>, the neighbor relationship, and the best path algorithm.</p>
<h3>Neighbors</h3>
<ul><li>BGP runs over <b>TCP port 179</b>. Neighbors are configured manually: <code>neighbor 192.0.2.1 remote-as 64500</code>.</li>
<li><b>eBGP</b> (different AS): TTL 1 by default, so peers must be directly connected unless you add <code>ebgp-multihop</code> (common with loopback peering plus <code>update-source</code>). AD 20.</li>
<li><b>iBGP</b> (same AS): AD 200, doesn't change the next hop, and needs a full mesh or route reflectors because iBGP routes aren't re-advertised to other iBGP peers.</li>
<li>States: <b>Idle</b> → <b>Connect</b> → <b>Active</b> (retrying TCP) → <b>OpenSent</b> → <b>OpenConfirm</b> → <b>Established</b>. Stuck in Idle or Active usually means no route to the neighbor, a wrong neighbor address, TCP 179 blocked, a remote-as mismatch, or an authentication (MD5 password) mismatch.</li>
<li><code>show ip bgp summary</code>: a number in State/PfxRcd means Established and that many prefixes received. A word (Idle, Active) means it's not up.</li></ul>
<pre class="term">router bgp 65001
 bgp router-id 1.1.1.1
 neighbor 203.0.113.1 remote-as 64500
 address-family ipv4
  network 10.50.0.0 mask 255.255.255.0
  neighbor 203.0.113.1 activate</pre>
<p>The <code>network</code> statement advertises a prefix only if an <b>exact match</b> (prefix and mask) is in the routing table. To advertise an aggregate you don't otherwise have, add a static route to Null0.</p>
<div class="viz" id="viz-bgpstate"></div>
<h3>Path attributes</h3>
<ul><li><b>Well-known mandatory</b>: AS_PATH, NEXT_HOP, ORIGIN.</li>
<li><b>Well-known discretionary</b>: LOCAL_PREF (inside one AS only).</li>
<li><b>Optional transitive</b>: COMMUNITY. <b>Optional non-transitive</b>: MED (MULTI_EXIT_DISC).</li>
<li><b>Weight</b> is Cisco-only and local to one router; it's not an attribute that's sent anywhere.</li></ul>
<h3>Best path selection</h3>
<p>When there are several paths to the same prefix, BGP compares them in this order and stops at the first difference (the next hop must be reachable first):</p>
<ol><li><b>Weight</b>, highest (Cisco, this router only; default 0, 32768 for local routes).</li>
<li><b>Local preference</b>, highest (whole AS; default 100). Controls how traffic <b>leaves</b> your AS.</li>
<li><b>Locally originated</b> (network, redistribute or aggregate) over learned.</li>
<li><b>AS path</b>, shortest. AS-path prepending makes a path look longer to influence how traffic <b>enters</b> your AS.</li>
<li><b>Origin</b>: IGP (i) &lt; EGP (e) &lt; incomplete (?).</li>
<li><b>MED</b>, lowest. Tells a neighboring AS which entry point to use; compared only between paths from the same AS by default.</li>
<li><b>eBGP over iBGP</b>.</li>
<li>Lowest IGP metric to the next hop.</li>
<li>Oldest eBGP path (stability), then lowest <b>router ID</b>, then lowest neighbor address.</li></ol>
<p>A common memory aid: "<b>W</b>e <b>L</b>ove <b>O</b>ranges <b>AS</b> <b>O</b>ranges <b>M</b>ean <b>P</b>ure <b>R</b>efreshment" (Weight, Local pref, Originate, AS path, Origin, MED, Paths eBGP over iBGP, Router ID).</p>
<div class="viz" id="viz-bestpath"></div>
<div class="viz" id="viz-bgpmini"></div>
<div class="tip"><b>Exam tip.</b> Outbound traffic: weight (one router) or local preference (whole AS). Inbound traffic: AS-path prepend or MED. A route map applied <code>in</code> affects your choices; <code>out</code> affects your neighbor's.</div>`},
{id:"pbr",num:"3.7",title:"Policy-based routing",html:`
<p>Normal routing looks only at the <b>destination</b>. <b>Policy-based routing (PBR)</b> overrides that for selected traffic, matching on source address, protocol, port or packet size, and sending it somewhere else.</p>
<ul><li>A <b>route map</b> holds the policy. <code>match ip address</code> references an ACL or prefix list; <code>set ip next-hop</code> or <code>set interface</code> says where to send it.</li>
<li>It's applied <b>inbound</b> on the interface where the traffic arrives: <code>ip policy route-map NAME</code>. It doesn't affect traffic the router itself generates (use <code>ip local policy route-map</code> for that).</li>
<li>Traffic that doesn't match a permit sequence (or matches a <code>deny</code> sequence) is routed normally. It's not dropped.</li>
<li>If the set next hop isn't reachable (not directly connected or the interface is down), the packet falls back to normal routing. <code>set ip next-hop verify-availability</code> with tracking checks reachability more carefully.</li>
<li><code>set ip default next-hop</code> is used only when the routing table has <b>no explicit route</b> (other than a default route) for the destination.</li></ul>
<pre class="term">access-list 110 permit ip 10.1.50.0 0.0.0.255 any
route-map GUEST-OUT permit 10
 match ip address 110
 set ip next-hop 198.51.100.1
interface GigabitEthernet0/0/1
 ip policy route-map GUEST-OUT</pre>
<p>Verification: <code>show ip policy</code> (which interfaces use which route map), <code>show route-map</code> (with match counters), and <code>debug ip policy</code>.</p>
<div class="viz" id="viz-pbrflow"></div>
<div class="tip"><b>Exam tip.</b> PBR goes on the <b>ingress</b> interface. No match = normal routing, not a drop.</div>`},
{id:"ntp",num:"3.8",title:"NTP and PTP",html:`
<p>Accurate time makes logs comparable, certificates valid and authentication protocols work. ENCOR covers both NTP and the much more precise PTP.</p>
<h3>NTP</h3>
<ul><li>Runs on <b>UDP 123</b>. Accuracy is typically in milliseconds over a LAN or WAN.</li>
<li><b>Stratum</b> is the distance from a reference clock: stratum 0 is the atomic clock or GPS itself, stratum 1 servers are attached to it, stratum 2 sync from stratum 1, and so on up to 15. Stratum 16 means unsynchronized.</li>
<li>Modes: <b>client/server</b> (<code>ntp server</code>), <b>peer</b> (<code>ntp peer</code>, symmetric, both can sync each other), and <b>broadcast/multicast</b>. A router can be an authoritative source with <code>ntp master [stratum]</code> (default 8) using its own clock.</li>
<li><b>Authentication</b> stops a rogue server from moving your clock. All three pieces are needed on the client: <code>ntp authenticate</code>, <code>ntp authentication-key 1 md5 KEY</code> (or a stronger hash on newer IOS), <code>ntp trusted-key 1</code>, plus <code>key 1</code> on the <code>ntp server</code> line.</li>
<li>Access control: <code>ntp access-group peer|serve|serve-only|query-only ACL</code>.</li>
<li>Verify with <code>show ntp status</code> ("Clock is synchronized, stratum 4") and <code>show ntp associations</code> (* marks the selected peer).</li></ul>
<div class="viz" id="viz-stratum"></div>
<h3>PTP (IEEE 1588)</h3>
<ul><li>Precision Time Protocol gives <b>sub-microsecond</b> accuracy using <b>hardware timestamping</b> in the NIC or switch ASIC. Used for industrial automation, financial trading, 5G radios and broadcast media (AES67, SMPTE 2110).</li>
<li>A <b>grandmaster</b> clock (often GPS-locked) is elected by the <b>Best Master Clock Algorithm (BMCA)</b>.</li>
<li><b>Ordinary clock</b>: one PTP port, either master or slave (an end device). <b>Boundary clock</b>: a switch that is a slave on one port and a master on others, re-generating time. <b>Transparent clock</b>: a switch that forwards PTP messages but adds the time they spent inside it (residence time) to a correction field.</li>
<li>Messages: <b>Sync</b> and <b>Follow_Up</b> (master to slave, with the send time), <b>Delay_Req</b> and <b>Delay_Resp</b> (to measure the path delay). The slave computes offset and delay from four timestamps.</li>
<li>Uses UDP 319 (event) and 320 (general), or Ethernet directly.</li></ul>
<div class="viz" id="viz-ptp"></div>
<div class="tip"><b>Exam tip.</b> NTP: UDP 123, milliseconds, stratum. PTP: hardware timestamps, sub-microsecond, grandmaster/boundary/transparent clocks.</div>`},
{id:"nat",num:"3.9",title:"NAT and PAT",html:`
<p>NAT rewrites IP addresses as packets cross a boundary, usually private inside addresses to public ones.</p>
<h3>The four addresses</h3>
<table><tr><th>Term</th><th>Meaning</th><th>Example</th></tr>
<tr><td><b>Inside local</b></td><td>The inside host's real (private) address</td><td>10.1.1.10</td></tr>
<tr><td><b>Inside global</b></td><td>The inside host as seen from outside</td><td>203.0.113.5</td></tr>
<tr><td><b>Outside global</b></td><td>The outside host's real address</td><td>8.8.8.8</td></tr>
<tr><td><b>Outside local</b></td><td>The outside host as seen from inside (usually the same as outside global)</td><td>8.8.8.8</td></tr></table>
<h3>Types</h3>
<ul><li><b>Static NAT</b>: one-to-one, permanent. Makes an inside server reachable from outside: <code>ip nat inside source static 10.1.1.100 203.0.113.10</code>. Static PAT (port forwarding) maps one port: <code>ip nat inside source static tcp 10.1.1.100 443 203.0.113.10 443</code>.</li>
<li><b>Dynamic NAT</b>: inside hosts borrow addresses from a pool, one-to-one while in use. When the pool runs out, new hosts fail.</li>
<li><b>PAT (overload)</b>: many inside hosts share one public address, told apart by source port: <code>ip nat inside source list 1 interface g0/0/0 overload</code>.</li></ul>
<p>Every NAT config needs <code>ip nat inside</code> and <code>ip nat outside</code> on the right interfaces. For inside-to-outside traffic, IOS <b>routes first, then translates</b>; for outside-to-inside, it <b>translates first, then routes</b>. Verify with <code>show ip nat translations</code> and <code>show ip nat statistics</code>; clear with <code>clear ip nat translation *</code>.</p>
<div class="viz" id="viz-natterms"></div>
<div class="tip"><b>Exam tip.</b> "Local" is how it looks from inside, "global" from outside. A NAT that never translates is usually missing <code>ip nat inside/outside</code>, or its ACL doesn't match the source.</div>`},
{id:"fhrpcfg",num:"3.10",title:"Configuring and verifying HSRP and VRRP",html:`
<p>Lesson 1.2 compared the FHRPs. Here's how they're configured and what to look for when they misbehave.</p>
<h3>HSRP</h3>
<pre class="term">interface Vlan10
 ip address 10.1.10.2 255.255.255.0
 standby version 2
 standby 10 ip 10.1.10.1
 standby 10 priority 110
 standby 10 preempt delay minimum 30
 standby 10 timers msec 250 msec 750
 standby 10 authentication md5 key-string Hsrp!Key
 standby 10 track 1 decrement 20</pre>
<ul><li>HSRP <b>version 2</b> supports groups 0 to 4095, IPv6, and millisecond timers; it uses a different MAC and multicast address, so <b>both peers must use the same version</b>.</li>
<li><b>States</b>: Initial → Learn → Listen → Speak → Standby → Active. Two routers both showing Active means they can't hear each other: a VLAN, ACL, version, group or authentication mismatch.</li>
<li><b>Preempt delay</b> waits after the router boots before taking over, so its routing has converged first.</li>
<li>Load sharing: group 10 active on D1 and group 20 active on D2, with half the hosts using each gateway (or align with the STP root per VLAN).</li></ul>
<h3>VRRPv3</h3>
<pre class="term">fhrp version vrrp v3
interface Vlan20
 vrrp 20 address-family ipv4
  address 10.1.20.1 primary
  priority 120
  track 1 decrement 30
  exit-vrrp</pre>
<ul><li>VRRPv3 (RFC 5798) supports IPv4 and IPv6 and centisecond timers. Classic VRRPv2 commands (<code>vrrp 20 ip 10.1.20.1</code>) are replaced once <code>fhrp version vrrp v3</code> is on.</li>
<li>VRRP preempts by default. If the virtual address equals a router's real interface address, that router is the <b>owner</b> with priority 255 and always wins.</li>
<li>Verify with <code>show vrrp brief</code>: State Master/Backup and the master's address.</li></ul>
<div class="viz" id="viz-fhrpstates"></div>
<div class="tip"><b>Exam tip.</b> Both routers Active (or Master) = they can't see each other's hellos. Check the group number, version, VLAN and authentication first.</div>`},
{id:"mcast",num:"3.11",title:"Multicast: IGMP, PIM-SM, RPF, SSM, bidir and MSDP",html:`
<p>Multicast sends one stream to many receivers without the source sending a copy to each. The network replicates packets only where the paths split.</p>
<h3>Addresses</h3>
<ul><li>IPv4 multicast is <b>224.0.0.0/4</b>. <b>224.0.0.0/24</b> is link-local (never routed: OSPF 224.0.0.5, EIGRP 224.0.0.10). <b>232.0.0.0/8</b> is reserved for SSM. <b>239.0.0.0/8</b> is administratively scoped (private).</li>
<li>Multicast MAC: <b>01:00:5e</b> followed by the low <b>23 bits</b> of the group address. Five bits are lost, so 32 groups share each MAC.</li></ul>
<h3>IGMP: hosts to their router</h3>
<ul><li><b>IGMPv2</b>: hosts send a <b>membership report</b> to join a group and a <b>leave</b> message to leave. The router (the querier) sends periodic general queries and a group-specific query after a leave.</li>
<li><b>IGMPv3</b>: reports can say <b>which sources</b> to receive from (INCLUDE) or not (EXCLUDE). Required for SSM.</li>
<li><b>IGMP snooping</b>: switches listen to IGMP and forward a group only to ports with receivers, instead of flooding it to the whole VLAN.</li></ul>
<h3>PIM: routers to routers</h3>
<ul><li><b>PIM dense mode</b> floods everywhere and prunes back where there are no receivers. Wasteful; rarely used.</li>
<li><b>PIM sparse mode</b> sends traffic only where it's been requested. Receivers' routers send <b>(*,G) joins</b> toward a <b>rendezvous point (RP)</b>, building a <b>shared tree</b>. The source's first-hop router <b>registers</b> the source with the RP (register messages are unicast), and the RP joins toward the source.</li>
<li>Once traffic flows, the last-hop router can join the source directly with an <b>(S,G) join</b>, switching to the <b>shortest-path tree (SPT)</b>. Cisco routers do this after the first packet by default.</li>
<li>The RP is set statically (<code>ip pim rp-address</code>) or learned through Auto-RP or BSR.</li></ul>
<h3>RPF</h3>
<p>The <b>Reverse Path Forwarding check</b> prevents multicast loops: a multicast packet is accepted only if it arrives on the interface the router would use to reach the <b>source</b> (or the RP, for the shared tree), according to the unicast routing table. Packets failing RPF are dropped. Mismatched unicast and multicast topologies are the classic cause of "the stream reaches R2 but not past it".</p>
<div class="viz" id="viz-rpf"></div>
<h3>SSM, bidir and MSDP</h3>
<ul><li><b>Source-Specific Multicast (SSM)</b>: receivers ask for a specific (S,G) with IGMPv3, and routers build the SPT straight to the source. <b>No RP</b>, no shared tree, and no registration. Uses 232.0.0.0/8 by default (<code>ip pim ssm default</code>). Ideal for one-to-many like IPTV.</li>
<li><b>Bidirectional PIM</b>: a shared tree only, with traffic flowing both up and down it, and no (S,G) state or registration. A <b>designated forwarder (DF)</b> is elected on each link instead of RPF toward the source. Scales for <b>many-to-many</b> apps (trading floors, collaboration) with lots of sources.</li>
<li><b>MSDP</b> (Multicast Source Discovery Protocol, TCP 639): RPs in different PIM domains (or Anycast RPs in the same domain) exchange <b>Source-Active (SA)</b> messages so receivers in one domain can find sources registered with another RP. <b>Anycast RP</b> uses the same RP address on several routers for redundancy, with MSDP keeping them in sync.</li></ul>
<div class="viz" id="viz-mcmodes"></div>
<div class="viz" id="viz-mcq"></div>
<div class="tip"><b>Exam tip.</b> SSM: no RP, IGMPv3, 232/8. Bidir: shared tree only, DF, many-to-many. MSDP: shares sources between RPs. RPF: accept only on the interface toward the source.</div>`}
];

const G={
l2:[["802.1Q tag size?","4 bytes, with a 12-bit VLAN ID and 3-bit CoS."],["What crosses a trunk untagged?","The native VLAN."],["DTP: dynamic auto + dynamic auto?","Access. Both wait for the other."],["DTP: dynamic desirable + dynamic auto?","Trunk."],["DTP: trunk + dynamic auto?","Trunk."],["What does switchport nonegotiate do?","Stops sending DTP frames."],["Nonegotiate trunk facing dynamic auto?","The auto side stays access: it never hears a DTP offer."],["Catalyst 9000 default switchport mode?","dynamic auto."],["Security risk of DTP on user ports?","Switch spoofing: an attacker negotiates a trunk."],["Native VLAN mismatch symptom?","%CDP-4-NATIVE_VLAN_MISMATCH and traffic leaking between the two VLANs."],["switchport trunk allowed vlan 30 on a trunk allowing 10,20?","Replaces the list with only 30. Use 'allowed vlan add 30'."],["Command showing administrative vs operational mode?","show interfaces X switchport."],["Command listing trunks and allowed/active VLANs?","show interfaces trunk."],["LACP modes?","active and passive."],["PAgP modes?","desirable and auto."],["Static EtherChannel mode?","on."],["Does passive + passive form an LACP bundle?","No."],["Does on + active form a bundle?","No. 'on' doesn't speak LACP."],["LACP standard?","IEEE 802.3ad (802.1AX)."],["Max active links in an EtherChannel?","8 (LACP can have 8 more in hot-standby)."],["EtherChannel flag SU?","Layer 2 port-channel in use."],["EtherChannel member flag P?","Bundled in the port-channel."],["Member flag s?","Suspended, usually a configuration mismatch."],["Member flag I?","Stand-alone: the port isn't bundled (no negotiation partner)."],["Why might one big file transfer not go faster over an EtherChannel?","A single flow hashes to one member link."],["Where do you change trunk settings on a bundle?","On interface port-channel N."],["What must match on EtherChannel members?","Speed, duplex, switchport mode, VLANs (access VLAN or native/allowed), STP settings."],["lacp rate fast?","LACPDUs every second instead of every 30 seconds."]],
stp:[["RSTP port roles?","Root, designated, alternate, backup."],["RSTP port states?","Discarding, learning, forwarding."],["What makes RSTP converge fast?","Proposal/agreement handshake on point-to-point links, plus edge ports."],["Root bridge election?","Lowest bridge ID: priority + system ID (VLAN or instance) + MAC."],["Default STP priority?","32768 (plus the VLAN or instance number)."],["Why use MST?","Map many VLANs to a few instances to save CPU and memory while still load-balancing."],["What three things define an MST region?","Name, revision number and VLAN-to-instance mapping."],["What is MST instance 0?","The IST: carries unmapped VLANs and sends the BPDUs for the region."],["Set MST instance 1 priority?","spanning-tree mst 1 priority 24576 (or root primary)."],["BPDU Guard action?","Err-disables the port when a BPDU arrives."],["Where do you put BPDU Guard?","PortFast access ports."],["Root Guard action?","Puts the port root-inconsistent (blocked) while superior BPDUs arrive; recovers automatically."],["Where do you put Root Guard?","Distribution ports facing access switches, where the root must never appear."],["What does Loop Guard protect against?","A blocking port moving to forwarding when BPDUs stop (unidirectional link)."],["BPDU Filter risk?","It can allow loops because the port ignores BPDUs."],["What detects one-way fiber links?","UDLD."],["Show ports blocked by Root Guard?","show spanning-tree inconsistentports."],["Command to recover err-disabled ports automatically?","errdisable recovery cause bpduguard (with an interval)."],["What is PortFast?","An edge port that goes straight to forwarding."],["Two switches with the same MST name and map but different revisions?","Different regions."]],
eigrp:[["EIGRP protocol type?","Advanced distance vector."],["EIGRP algorithm?","DUAL."],["EIGRP default metric components?","Bandwidth and delay (K1 and K3)."],["EIGRP AD internal and external?","90 and 170."],["EIGRP IP protocol and multicast?","88 and 224.0.0.10."],["What is feasible distance?","This router's best total metric to a destination."],["What is reported distance?","The neighbor's own metric to the destination."],["Feasibility condition?","RD of the backup neighbor < the current FD."],["What is a successor?","The best neighbor, installed in the routing table."],["What is a feasible successor?","A loop-free backup that meets the feasibility condition, used instantly."],["What happens when there is no feasible successor?","The route goes active and EIGRP queries neighbors."],["What does variance do?","Enables unequal-cost load balancing for feasible successors with metric < variance × FD."],["Which protocol supports unequal-cost load balancing?","EIGRP."],["What limits EIGRP query scope?","Stub routers and summarization."],["OSPF algorithm?","Dijkstra SPF."],["OSPF metric?","Cost = reference bandwidth / interface bandwidth (default ref 100 Mbps)."],["OSPF IP protocol and multicast addresses?","89; 224.0.0.5 all routers, 224.0.0.6 DR/BDR."],["Where can EIGRP summarize?","On any interface."],["Where can OSPF summarize?","At ABRs (area range) and ASBRs (summary-address)."],["Why raise the OSPF reference bandwidth?","So 1, 10 and 100 Gbps links get different costs (auto-cost reference-bandwidth)."]],
ospf:[["OSPF neighbor must-match parameters?","Area, subnet/mask, hello/dead, authentication, stub flags; unique RIDs."],["Adjacency stuck in EXSTART?","MTU mismatch (or duplicate RID)."],["Fix an OSPF MTU mismatch without changing MTU?","ip ospf mtu-ignore."],["Passive interface?","Advertises the network but sends no hellos, so no neighbors form."],["Broadcast network: DR?","Yes. Hello 10, dead 40."],["Point-to-point network: DR?","No. Hello 10, dead 40."],["NBMA timers?","Hello 30, dead 120."],["Point-to-multipoint: DR?","No. Hello 30, dead 120."],["DR election?","Highest interface priority, then highest RID. Not preemptive."],["Priority 0 means?","Never become DR or BDR."],["DROTHER to DROTHER state?","2WAY."],["What is an ABR?","A router in area 0 and another area."],["What is an ASBR?","A router redistributing external routes into OSPF."],["LSA type 1?","Router LSA, every router, area scope."],["LSA type 2?","Network LSA, from the DR."],["LSA type 3?","Summary LSA from the ABR: inter-area routes (O IA)."],["LSA type 4?","ASBR summary: how to reach the ASBR."],["LSA type 5?","External LSA from the ASBR, flooded domain-wide (O E1/E2)."],["LSA type 7?","NSSA external, converted to type 5 by the ABR."],["Stub area blocks?","Types 4 and 5; default route injected."],["Totally stubby blocks?","Types 3, 4 and 5 except a default route."],["Configure totally stubby?","area X stub no-summary on the ABR (area X stub on the others)."],["What is an NSSA?","A stub area that may contain an ASBR, using type 7 LSAs."],["Inter-area summarization command?","area X range on the ABR."],["External summarization command?","summary-address on the ASBR."],["What does the ABR install for an area range?","A Null0 discard route for the summary."],["What does distribute-list in do in OSPF?","Filters routes from the local RIB only; LSAs still flood."],["How do you filter type 3 LSAs at an ABR?","area X filter-list prefix NAME in|out."],["E1 vs E2?","E2 (default) keeps the external metric only; E1 adds the internal cost."],["OSPFv3 neighbor addresses?","IPv6 link-local."],["OSPFv3 interface command?","ipv6 ospf 1 area 0 (or ospfv3 1 ipv6 area 0)."],["OSPFv3 new LSA types?","8 (link) and 9 (intra-area prefix)."]],
bgp:[["BGP transport?","TCP port 179."],["eBGP AD?","20."],["iBGP AD?","200."],["eBGP default TTL?","1, so peers must be directly connected unless ebgp-multihop."],["BGP neighbor states in order?","Idle, Connect, Active, OpenSent, OpenConfirm, Established."],["Stuck in Active means?","TCP keeps failing: no route, wrong address, TCP 179 blocked, or source address mismatch."],["show ip bgp summary State/PfxRcd shows a number?","Established, with that many prefixes received."],["BGP network statement requirement?","An exact prefix and mask match in the routing table."],["How to advertise an aggregate you don't have?","Add a static route to Null0 and a network statement."],["Well-known mandatory attributes?","AS_PATH, NEXT_HOP, ORIGIN."],["Is LOCAL_PREF sent to eBGP peers?","No, it stays inside the AS."],["MED attribute type?","Optional non-transitive."],["Community attribute type?","Optional transitive."],["Weight scope?","Cisco only, local to one router."],["First best-path criterion?","Highest weight."],["Second?","Highest local preference."],["After local preference?","Locally originated, then shortest AS path."],["Origin order?","IGP < EGP < incomplete."],["MED: high or low wins?","Lowest."],["eBGP vs iBGP path?","eBGP preferred."],["Final tie-breakers?","Oldest eBGP path, lowest router ID, lowest neighbor IP."],["Default local preference?","100."],["Default weight for learned and local routes?","0 learned, 32768 locally originated."],["Influence outbound traffic for the whole AS?","Local preference."],["Influence inbound traffic?","AS-path prepending or MED."],["Why does iBGP need a full mesh?","iBGP-learned routes aren't advertised to other iBGP peers (loop prevention)."],["How does BGP prevent loops between ASes?","A router rejects routes whose AS_PATH contains its own AS."],["neighbor X route-map M in affects?","Routes received from X (your path choice)."]],
svc:[["PBR is applied where?","Inbound on the interface where the traffic arrives: ip policy route-map."],["PBR for router-generated traffic?","ip local policy route-map."],["Traffic not matching a PBR permit?","Routed normally."],["set ip default next-hop?","Used only when the RIB has no explicit (non-default) route."],["Verify PBR?","show ip policy, show route-map, debug ip policy."],["NTP port?","UDP 123."],["NTP stratum 16?","Unsynchronized."],["ntp master default stratum?","8."],["Three NTP authentication commands on the client?","ntp authenticate, ntp authentication-key N md5 KEY, ntp trusted-key N (plus key N on the server line)."],["NTP selected peer symbol?","* in show ntp associations."],["PTP standard?","IEEE 1588."],["PTP accuracy?","Sub-microsecond, with hardware timestamping."],["PTP grandmaster election?","Best Master Clock Algorithm (BMCA)."],["Boundary clock?","Slave on one port, master on others; regenerates time."],["Transparent clock?","Forwards PTP and adds its residence time to the correction field."],["PTP messages?","Sync, Follow_Up, Delay_Req, Delay_Resp."],["Inside local?","The inside host's real address."],["Inside global?","The inside host's address as seen from outside."],["PAT keyword?","overload."],["Static PAT use?","Port forwarding one port to an inside server."],["NAT order inside to outside?","Route, then translate."],["NAT order outside to inside?","Translate, then route."],["Dynamic NAT pool exhausted?","New inside hosts can't get a translation."],["Clear NAT translations?","clear ip nat translation *."],["HSRP v1 vs v2 groups?","v1 0-255, v2 0-4095."],["HSRP states?","Initial, Learn, Listen, Speak, Standby, Active."],["Both HSRP routers Active?","They can't hear each other's hellos."],["Enable VRRPv3?","fhrp version vrrp v3."],["VRRP owner priority?","255."],["Why use HSRP preempt delay?","Let routing converge before the router takes over after a reboot."]],
mcast:[["IPv4 multicast range?","224.0.0.0/4."],["Link-local multicast range?","224.0.0.0/24, never routed."],["SSM range?","232.0.0.0/8."],["Administratively scoped range?","239.0.0.0/8."],["Multicast MAC prefix?","01:00:5e plus the low 23 bits of the group."],["How many groups share a multicast MAC?","32."],["IGMPv2 join message?","Membership report."],["IGMPv3 adds?","Source filtering (INCLUDE/EXCLUDE), needed for SSM."],["IGMP snooping?","Switches forward groups only to ports with receivers."],["PIM dense mode?","Flood and prune."],["PIM sparse mode?","Explicit joins toward an RP; traffic only where requested."],["What is the RP?","Rendezvous point: root of the shared tree where sources and receivers meet."],["(*,G) means?","Shared tree state for group G from any source."],["(S,G) means?","Source tree state for source S and group G."],["How does a source reach the RP?","Its first-hop router sends unicast register messages."],["SPT switchover?","Last-hop router joins the source directly after traffic starts (Cisco default: first packet)."],["What is the RPF check?","Accept a multicast packet only on the interface used to reach its source (or RP)."],["What happens to packets failing RPF?","Dropped."],["SSM needs an RP?","No."],["Bidirectional PIM tree type?","Shared tree only, traffic both directions."],["Bidir PIM uses what instead of RPF to the source?","A designated forwarder per link."],["Bidir PIM is best for?","Many-to-many applications with many sources."],["MSDP?","Shares active sources (SA messages) between RPs; TCP 639."],["Anycast RP?","Several RPs share one address; MSDP keeps their source lists in sync."],["Static RP command?","ip pim rp-address A.B.C.D."]]
};
const DECKS=[["l2","Trunking and EtherChannel"],["stp","STP and MST"],["eigrp","EIGRP vs OSPF"],["ospf","OSPF"],["bgp","BGP"],["svc","PBR, NTP, NAT, FHRP"],["mcast","Multicast"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"Both ends of a link are dynamic auto. What is the result?",o:["Access","Trunk","Err-disabled","Mismatch"],a:0,e:"Both wait for the other to offer."},
{q:"One end is trunk with nonegotiate, the other dynamic desirable. What does the desirable side become?",o:["Access","Trunk","Err-disabled","Native"],a:0,e:"No DTP frames reach it, so it never agrees to trunk."},
{q:"Which command stops DTP on a trunk port?",o:["switchport nonegotiate","no dtp","switchport mode static","spanning-tree portfast"],a:0,e:"Nonegotiate."},
{q:"A trunk allows VLANs 10,20. An engineer runs 'switchport trunk allowed vlan 30'. Which VLANs are allowed now?",o:["Only 30","10, 20 and 30","10 and 20","All"],a:0,e:"Without 'add' the list is replaced."},
{q:"CDP logs a native VLAN mismatch. What's the impact?",o:["Untagged traffic leaks between the two native VLANs","The trunk goes down","DTP disables","Nothing"],a:0,e:"Frames land in the wrong VLAN."},
{q:"Which pair forms an LACP EtherChannel?",o:["active / passive","passive / passive","auto / active","on / active"],a:0,e:"At least one active."},
{q:"Which pair forms a PAgP EtherChannel?",o:["desirable / auto","auto / auto","active / desirable","on / desirable"],a:0,e:"At least one desirable."},
{q:"show etherchannel summary shows a member as (s). What does it mean?",o:["Suspended, usually a configuration mismatch","In use","Stand-alone","Hot standby"],a:0,e:"Lowercase s."},
{q:"Two routers connect over a 4-link EtherChannel with src-mac load balancing. Why is only one link busy?",o:["All frames have the same source MAC, so they hash to one link","LACP is broken","STP blocks three links","The links are in standby"],a:0,e:"Use an IP-based hash."},
{q:"Where should trunk configuration be changed after the EtherChannel is up?",o:["interface port-channel","Each member only","Global config","It can't be changed"],a:0,e:"The port-channel interface pushes to members."},
{q:"Which three must match for switches to be in the same MST region?",o:["Name, revision and VLAN-to-instance map","Name, priority and MAC","Revision, hello timer and VLANs","Only the name"],a:0,e:"All three."},
{q:"Which MST instance sends BPDUs?",o:["Instance 0 (IST)","Every instance","Instance 1","None"],a:0,e:"MSTI info rides inside IST BPDUs."},
{q:"A switch plugged into a PortFast access port with BPDU Guard sends a BPDU. What happens?",o:["The port is err-disabled","The port becomes root-inconsistent","Nothing","The port becomes a trunk"],a:0,e:"BPDU Guard."},
{q:"An access switch with priority 0 is connected to a distribution port with Root Guard. What happens?",o:["The distribution port goes root-inconsistent until the superior BPDUs stop","The access switch becomes root","The port is err-disabled","STP is disabled"],a:0,e:"Root Guard blocks without err-disable."},
{q:"A fiber link becomes unidirectional and a blocking port stops receiving BPDUs. What prevents it from forwarding into a loop?",o:["Loop Guard (or UDLD)","Root Guard","BPDU Filter","PortFast"],a:0,e:"Loop-inconsistent."},
{q:"Which RSTP role is a backup path to the root bridge?",o:["Alternate","Backup","Designated","Edge"],a:0,e:"Backup is for the same segment."},
{q:"Which protocol supports unequal-cost load balancing?",o:["EIGRP","OSPF","RIPv2","IS-IS"],a:0,e:"variance."},
{q:"EIGRP: FD to 10.1.0.0 via R2 is 2000. R3 reports an RD of 1800 and a total metric of 2600. Is R3 a feasible successor?",o:["Yes, RD 1800 < FD 2000","No, 2600 > 2000","No, RD must equal FD","Only with variance"],a:0,e:"Feasibility condition: RD < FD."},
{q:"An EIGRP route has no feasible successor and the successor fails. What happens?",o:["The route goes active and queries are sent","The route is removed silently","OSPF takes over","Variance is applied"],a:0,e:"DUAL recomputation."},
{q:"What is OSPF's default AD?",o:["110","90","120","20"],a:0,e:"OSPF = 110."},
{q:"Two OSPF routers see each other but stay in EXSTART. Most likely cause?",o:["MTU mismatch","Area mismatch","Hello mismatch","Wrong network type"],a:0,e:"DBD packets fail."},
{q:"Which OSPF network type elects a DR?",o:["Broadcast","Point-to-point","Point-to-multipoint","Loopback"],a:0,e:"Broadcast and NBMA."},
{q:"Which LSA type does an ABR generate for inter-area routes?",o:["Type 3","Type 1","Type 5","Type 7"],a:0,e:"Summary LSA."},
{q:"Which area type blocks types 3, 4 and 5 except a default route?",o:["Totally stubby","Stub","NSSA","Backbone"],a:0,e:"stub no-summary."},
{q:"An area must contain an ASBR redistributing from a partner but block other externals. Which area type?",o:["NSSA","Stub","Totally stubby","Backbone"],a:0,e:"Type 7 LSAs."},
{q:"Where is 'area 10 range' configured?",o:["On the ABR","On the ASBR","On every router","On the DR"],a:0,e:"Inter-area summarization."},
{q:"Where is 'summary-address' configured in OSPF?",o:["On the ASBR","On the ABR","On the DR","On area 0 routers only"],a:0,e:"Summarizes type 5."},
{q:"A distribute-list in is applied under router ospf on R3. What still happens?",o:["R3 still floods the LSAs to its neighbors","Neighbors lose the routes","The LSAs are deleted","The adjacency resets"],a:0,e:"It only filters R3's RIB."},
{q:"What does an ABR install when you configure area range?",o:["A Null0 discard route","A default route","A static route to the DR","Nothing"],a:0,e:"Loop prevention."},
{q:"Which is true of OSPFv3?",o:["Neighbors use link-local addresses","It doesn't use areas","It needs no router ID","It uses AD 90"],a:0,e:"Same areas and SPF."},
{q:"What port does BGP use?",o:["TCP 179","UDP 179","TCP 646","UDP 520"],a:0,e:"TCP 179."},
{q:"An eBGP neighbor stays in Active. Which is a likely cause?",o:["No route to the neighbor's address or TCP 179 blocked","Too many prefixes","Wrong local preference","MED mismatch"],a:0,e:"TCP never completes."},
{q:"show ip bgp summary shows 'Idle' for a neighbor configured with the wrong remote-as. Why?",o:["The OPEN is rejected with a bad peer AS","TCP 179 is blocked","Next hop unreachable","Weight mismatch"],a:0,e:"Remote-as must match."},
{q:"Why doesn't 'network 10.0.0.0 mask 255.0.0.0' advertise anything when the router has 10.1.0.0/16 and 10.2.0.0/16?",o:["The network statement needs an exact match in the RIB","BGP doesn't support /8","The mask is wrong","Needs auto-summary"],a:0,e:"Add a Null0 static for the /8."},
{q:"What is the first attribute in Cisco's BGP best path selection?",o:["Weight","Local preference","AS path","MED"],a:0,e:"Highest weight."},
{q:"Two paths have the same weight. One has LP 200 and AS path length 4; the other LP 100 and length 1. Which wins?",o:["LP 200","Shorter AS path","Neither, ECMP","The oldest"],a:0,e:"LP is checked before AS path."},
{q:"To make other ASes prefer your ISP-A link for traffic coming to you, you would:",o:["Prepend your AS on advertisements to ISP-B","Set local preference on routes from ISP-A","Set weight on ISP-A","Lower MED from ISP-A"],a:0,e:"Inbound traffic is influenced by what you advertise."},
{q:"To make your whole AS send outbound traffic through ISP-A, you would:",o:["Set higher local preference on routes learned from ISP-A","Prepend toward ISP-A","Set MED toward ISP-A","Raise weight on ISP-B"],a:0,e:"LP is AS-wide."},
{q:"Which attribute stays local to one router and isn't advertised?",o:["Weight","Local preference","MED","AS_PATH"],a:0,e:"Cisco-only."},
{q:"Which origin code is preferred?",o:["i (IGP)","e (EGP)","? (incomplete)","They're equal"],a:0,e:"IGP < EGP < incomplete."},
{q:"Where is a PBR route map applied?",o:["Inbound on the interface where the traffic arrives","Outbound on the exit interface","Globally","Under router ospf"],a:0,e:"ip policy route-map."},
{q:"A packet doesn't match any permit sequence in a PBR route map. What happens?",o:["It's routed normally","It's dropped","It's sent to Null0","It uses the set next hop"],a:0,e:"PBR only overrides matches."},
{q:"set ip default next-hop is used when:",o:["The RIB has no explicit route for the destination","Always","Only for local traffic","The interface is down"],a:0,e:"A fallback."},
{q:"An NTP client shows 'Clock is unsynchronized, stratum 16'. The server is reachable. With authentication configured, what is often missing?",o:["ntp trusted-key","ntp master","ntp peer","ntp update-calendar"],a:0,e:"The key must be trusted."},
{q:"A router with 'ntp master 3' serves time at which stratum?",o:["3","2","4","16"],a:0,e:"Its clients become stratum 4."},
{q:"Which PTP device adds its residence time to a correction field?",o:["Transparent clock","Boundary clock","Grandmaster","Ordinary clock"],a:0,e:"It doesn't regenerate time."},
{q:"What gives PTP its accuracy advantage over NTP?",o:["Hardware timestamping","TCP transport","Larger stratum range","Encryption"],a:0,e:"Timestamps in the NIC/ASIC."},
{q:"Inside host 10.1.1.10 appears on the internet as 203.0.113.5. 203.0.113.5 is the:",o:["Inside global","Inside local","Outside local","Outside global"],a:0,e:"Inside host as seen from outside."},
{q:"Many inside hosts share one public IP using ports. This is:",o:["PAT (overload)","Static NAT","Dynamic NAT","Twice NAT"],a:0,e:"Port Address Translation."},
{q:"NAT is configured but nothing translates. The ACL and pool are right. What's commonly missing?",o:["ip nat inside / ip nat outside on the interfaces","A default route","ip routing","An SVI"],a:0,e:"Interfaces must be marked."},
{q:"Two HSRP routers both show Active. What does this indicate?",o:["They can't hear each other's hellos","Normal load sharing","Preempt is on","Version 2 is enabled"],a:0,e:"Check VLAN, group, version and authentication."},
{q:"What enables VRRPv3 syntax on IOS XE?",o:["fhrp version vrrp v3","vrrp version 3","standby version 3","ip vrrp v3"],a:0,e:"Then use address-family under vrrp."},
{q:"Which multicast range needs no RP and uses IGMPv3?",o:["232.0.0.0/8 (SSM)","239.0.0.0/8","224.0.0.0/24","233.0.0.0/8"],a:0,e:"Source-specific multicast."},
{q:"A multicast packet arrives on an interface other than the one toward its source. What does the router do?",o:["Drops it (RPF failure)","Forwards it","Sends it to the RP","Floods it"],a:0,e:"RPF check."},
{q:"Which PIM mode uses only a shared tree with traffic in both directions?",o:["Bidirectional PIM","PIM-SM","PIM-DM","SSM"],a:0,e:"DF instead of RPF to sources."},
{q:"What does MSDP exchange?",o:["Active sources between RPs","IGMP reports","Unicast routes","RP addresses"],a:0,e:"SA messages."},
{q:"How does the first-hop router tell the RP about a new source in PIM-SM?",o:["Register messages","IGMP reports","MSDP","PIM hello"],a:0,e:"Unicast to the RP."},
{q:"What is the multicast MAC for 239.1.1.1?",o:["01:00:5e:01:01:01","01:00:5e:ef:01:01","ff:ff:ff:ff:ff:ff","00:00:5e:01:01:01"],a:0,e:"Low 23 bits: 1.1.1."},
{q:"Which feature stops a switch from flooding multicast to every port in the VLAN?",o:["IGMP snooping","PIM","MSDP","Storm control"],a:0,e:"Forward only to receivers."},
{q:"A many-to-many trading application with hundreds of sources needs multicast with minimal state. Best choice?",o:["Bidirectional PIM","PIM-SM with SPT switchover","Dense mode","SSM"],a:0,e:"No (S,G) state."}
];

const mkSw=()=>[];
registerModule({
  id:"infra",slug:"infrastructure",title:"Infrastructure",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["dtp","ecneg","ecflags","mstmap","guards","fsucc","eigospf","ospfnbr","lsa","areatype","ospfmini","bgpstate","bestpath","bgpmini","pbrflow","stratum","ptp","natterms","fhrpstates","rpf","mcmodes","mcq"],
  viz(){
/* ---- DTP matrix ---- */
(function(){const el=$("#viz-dtp");const M=["access","dynamic auto","dynamic desirable","trunk","trunk nonegotiate"];let a=1,b=1;const seen=new Set();
  const res=(x,y)=>{const t=[x,y].sort().join("|");const m={"access|access":"Access","access|dynamic auto":"Access","access|dynamic desirable":"Access","access|trunk":"Mismatch: one side tags, the other doesn't","access|trunk nonegotiate":"Mismatch: one side tags, the other doesn't","dynamic auto|dynamic auto":"Access: both wait for the other","dynamic auto|dynamic desirable":"Trunk","dynamic auto|trunk":"Trunk","dynamic auto|trunk nonegotiate":"Access on the auto side (no DTP heard), trunk on the other: broken","dynamic desirable|dynamic desirable":"Trunk","dynamic desirable|trunk":"Trunk","dynamic desirable|trunk nonegotiate":"Access on the desirable side, trunk on the other: broken","trunk|trunk":"Trunk","trunk nonegotiate|trunk":"Trunk","trunk nonegotiate|trunk nonegotiate":"Trunk (best practice)"};return m[t]};
  function draw(){const r=res(M[a],M[b]);seen.add([a,b].sort().join());el.innerHTML=`<div class="viz-title">DTP: pick each end's mode</div>
    <p class="s-small">SW1</p><div class="chips">${M.map((m,i)=>`<button class="chip" data-a="${i}" aria-pressed="${i===a}">${m}</button>`).join("")}</div>
    <p class="s-small">SW2</p><div class="chips">${M.map((m,i)=>`<button class="chip" data-b="${i}" aria-pressed="${i===b}">${m}</button>`).join("")}</div>
    <div class="caption" aria-live="polite"><b>${M[a]}</b> + <b>${M[b]}</b>: <span class="${/^Trunk/.test(r)?"status-good":/^Access$|^Access:/.test(r)?"":"status-bad"}">${r}</span></div><div class="rv-prog s-small">${seen.size} of 15 combinations tried</div>`;
    if(seen.size>=10)award("viz:dtp",20,"Explored the DTP matrix")}
  el.addEventListener("click",e=>{const x=e.target.closest("[data-a]"),y=e.target.closest("[data-b]");if(x)a=+x.dataset.a;else if(y)b=+y.dataset.b;else return;draw()});draw()})();

/* ---- EtherChannel negotiation ---- */
(function(){const el=$("#viz-ecneg");const M=["on","active","passive","desirable","auto"];let a=1,b=2;const seen=new Set();
  const res=(x,y)=>{if(x==="on"||y==="on")return x===y?["Bundles with no protocol. Fast, but a miscabled member can loop or blackhole traffic.",1]:["No bundle: 'on' doesn't speak "+(x==="on"?y:x).replace(/active|passive/,"LACP").replace(/desirable|auto/,"PAgP")+".",0];
    const lacp=v=>v==="active"||v==="passive";if(lacp(x)!==lacp(y))return ["No bundle: one side runs LACP, the other PAgP.",0];
    if(lacp(x))return x==="passive"&&y==="passive"?["No bundle: both passive, nobody starts LACP.",0]:["LACP bundle forms.",1];
    return x==="auto"&&y==="auto"?["No bundle: both auto, nobody starts PAgP.",0]:["PAgP bundle forms.",1]};
  function draw(){const [t,ok]=res(M[a],M[b]);seen.add([a,b].sort().join());el.innerHTML=`<div class="viz-title">Will the EtherChannel form?</div>
    <p class="s-small">SW1</p><div class="chips">${M.map((m,i)=>`<button class="chip" data-a="${i}" aria-pressed="${i===a}">${m}</button>`).join("")}</div>
    <p class="s-small">SW2</p><div class="chips">${M.map((m,i)=>`<button class="chip" data-b="${i}" aria-pressed="${i===b}">${m}</button>`).join("")}</div>
    <div class="caption" aria-live="polite"><span class="${ok?"status-good":"status-bad"}">${t}</span></div><div class="rv-prog s-small">${seen.size} of 15 combinations tried</div>`;if(seen.size>=10)award("viz:ecneg",20,"Explored EtherChannel negotiation")}
  el.addEventListener("click",e=>{const x=e.target.closest("[data-a]"),y=e.target.closest("[data-b]");if(x)a=+x.dataset.a;else if(y)b=+y.dataset.b;else return;draw()});draw()})();

quizViz($("#viz-ecflags"),{title:"Read show etherchannel summary",done:"Read every EtherChannel summary",qs:[
  ["<pre class=\"term\">1      Po1(SU)   LACP   Gi1/0/11(P)  Gi1/0/12(P)</pre>",["Healthy Layer 2 bundle, both members active","Layer 3 bundle","Down","One member suspended"],0,"SU and P."],
  ["<pre class=\"term\">1      Po1(SD)   LACP   Gi1/0/11(I)  Gi1/0/12(I)</pre>",["The far end isn't negotiating LACP, so the ports run stand-alone","Both ports are bundled","STP is blocking","Duplex mismatch"],0,"I = stand-alone: no LACP partner (passive/passive, or the other side is 'on' or PAgP)."],
  ["<pre class=\"term\">1      Po1(SU)   LACP   Gi1/0/11(P)  Gi1/0/12(s)</pre>",["Gi1/0/12 has a mismatched setting (VLAN, speed, mode) and is suspended","Gi1/0/12 is the standby link","Gi1/0/12 is shut down","Everything is fine"],0,"Compare its config with Gi1/0/11."],
  ["<pre class=\"term\">2      Po2(RU)   PAgP   Te1/1/1(P)   Te1/1/2(P)</pre>",["A healthy Layer 3 (routed) PAgP bundle","A Layer 2 LACP bundle","Down","Suspended"],0,"R = routed."]]});

/* ---- MST mapper ---- */
(function(){const el=$("#viz-mstmap");const V=[10,20,30,40,50];let m1={10:1,20:1,30:2,40:2,50:0},m2={10:1,20:1,30:2,40:2,50:0},rev2=1,name2="CAMPUS";let won=false;
  function draw(){const same=name2==="CAMPUS"&&rev2===1&&V.every(v=>m1[v]===m2[v]);
    el.innerHTML=`<div class="viz-title">MST region check: does SW2 join SW1's region?</div>
    <div class="term">SW1: name CAMPUS  revision 1\n${[0,1,2].map(k=>"  instance "+k+": vlan "+(V.filter(v=>m1[v]===k).join(",")||"-")).join("\n")}</div>
    <p class="s-small">SW2: tap a VLAN to move it to the next instance, or change the name and revision.</p>
    <div class="chips">${V.map(v=>`<button class="chip" data-v="${v}">VLAN ${v} → inst ${m2[v]}</button>`).join("")}<button class="chip" data-n="1">name ${name2}</button><button class="chip" data-r="1">revision ${rev2}</button></div>
    <div class="caption" aria-live="polite">${same?'<span class="status-good">Same region.</span> Name, revision and every VLAN mapping match, so both switches share instances 1 and 2 and you can root instance 1 on SW1 and instance 2 on SW2.':'<span class="status-bad">Different regions.</span> Something differs, so the switches treat each other as a region boundary and only the CIST (instance 0) spans both. Per-instance load balancing between them is lost.'}</div>`;
    if(!same)won=true;if(won&&same)award("viz:mstmap",20,"Broke and fixed an MST region")}
  el.addEventListener("click",e=>{const v=e.target.closest("[data-v]"),n=e.target.closest("[data-n]"),r=e.target.closest("[data-r]");if(v){const k=+v.dataset.v;m2[k]=(m2[k]+1)%3}else if(n)name2=name2==="CAMPUS"?"Campus":"CAMPUS";else if(r)rev2=rev2===1?2:1;else return;draw()});draw()})();

revealViz($("#viz-guards"),{title:"STP protection features",cols:3,done:"Explored every STP protection",items:[
  ["BPDU Guard","Access ports","Any BPDU err-disables the port. Recover with shut/no shut or errdisable recovery. Stops rogue switches."],
  ["Root Guard","Toward access","A superior BPDU puts the port root-inconsistent (blocked). It recovers on its own when the BPDUs stop. Protects the root's location."],
  ["Loop Guard","Root/alternate ports","If BPDUs stop on a non-designated port, it goes loop-inconsistent instead of forwarding. Protects against unidirectional links."],
  ["BPDU Filter","Edge ports","Stops sending and ignores BPDUs. Globally, it only applies to PortFast ports and turns off if a BPDU arrives; per interface it's dangerous."],
  ["PortFast","Edge ports","Goes straight to forwarding. Only for end hosts. Pair with BPDU Guard."],
  ["UDLD","Fiber","Layer 2 echo that detects a link working in one direction only, and err-disables it in aggressive mode."]]});

stepViz($("#viz-fsucc"),{title:"EIGRP: successor and feasible successor",done:"Worked through EIGRP DUAL",steps:[
  ["The topology","R1 reaches 10.9.0.0/16 through R2 or R3. R2 reports its own distance as 1000 and the R1-R2 link adds 1000: total 2000. R3 reports 1500 and its link adds 2000: total 3500."],
  ["Successor","The lowest total is via R2: FD = 2000. R2 is the successor and goes in the routing table."],
  ["Feasibility check","R3's reported distance is 1500. Is 1500 < FD 2000? Yes. R3 can't be routing through R1, so it's loop-free: a feasible successor, kept in the topology table."],
  ["R2 fails","R1 switches to R3 instantly, with no queries. That's EIGRP's fast convergence."],
  ["If R3's RD were 2500","2500 is not < 2000, so R3 might loop through R1. It's not a feasible successor. When R2 fails, the route goes active and R1 queries its neighbors."],
  ["Variance 2","With variance 2, any feasible successor with a total under 2 × 2000 = 4000 is also installed. R3 (3500) qualifies, and R1 load-shares unequally: more traffic to R2, less to R3."]]});

sortViz($("#viz-eigospf"),{title:"EIGRP, OSPF or both?",bins:{e:"EIGRP",o:"OSPF",b:"Both"},done:"Compared EIGRP and OSPF",items:[
  ["Uses DUAL","e","Diffusing Update Algorithm."],["Builds a full topology map of the area","o","LSDB."],["Unequal-cost load balancing","e","variance."],["Equal-cost multipath","b","Both do ECMP."],["Areas around a backbone","o","Area 0."],["Summarize on any interface","e","OSPF only at ABR/ASBR."],["Metric from bandwidth by default","b","EIGRP uses bandwidth + delay; OSPF cost from bandwidth."],["AD 110","o",""],["Multicast 224.0.0.10","e",""],["Supports IPv6","b","EIGRP for IPv6 and OSPFv3."]]});

quizViz($("#viz-ospfnbr"),{title:"Why won't these OSPF routers become neighbors?",done:"Diagnosed every OSPF neighbor problem",qs:[
  ["R1 G0/0 is area 0, R2 G0/0 is area 1, same subnet.",["Area mismatch","MTU","Network type","Nothing wrong"],0,"Area IDs must match on the link."],
  ["R1 hello 10/dead 40, R2 hello 5/dead 20.",["Timer mismatch","Area mismatch","Router ID","Priority"],0,"Hello and dead must match."],
  ["Both routers show each other in EXSTART forever.",["MTU mismatch","Authentication","Area","Passive interface"],0,"DBD exchange fails."],
  ["R2's interface is in 'passive-interface default' with no exception.",["Passive interface sends no hellos","Timer mismatch","DR election","Stub flag"],0,"Add no passive-interface G0/0."],
  ["R1 area 10 is configured as stub; R2's area 10 isn't.",["Stub flag mismatch","MTU","Router ID","Nothing"],0,"The E-bit in hellos must agree."],
  ["Both routers have router-id 1.1.1.1.",["Duplicate router ID","Area mismatch","Timers","Nothing"],0,"%OSPF-4-DUP_RTRID."]]});

revealViz($("#viz-lsa"),{title:"OSPF LSA types",cols:3,done:"Explored every LSA type",items:[
  ["Type 1","Router","Every router, in each area it belongs to. Lists its links and their costs. Never leaves the area."],
  ["Type 2","Network","The DR on a broadcast segment. Lists the routers attached to it."],
  ["Type 3","Summary","The ABR advertises one area's prefixes into another. Appears as O IA. area range summarizes these."],
  ["Type 4","ASBR summary","The ABR tells other areas how to reach an ASBR, so they can use its type 5 LSAs."],
  ["Type 5","External","The ASBR's redistributed routes, flooded everywhere except stub areas. O E2 (default) or O E1."],
  ["Type 7","NSSA external","An ASBR inside an NSSA. The ABR converts type 7 to type 5 for the rest of the domain. O N2 / O N1."]]});

sortViz($("#viz-areatype"),{title:"Which area type fits?",bins:{std:"Normal",stub:"Stub",tsa:"Totally stubby",nssa:"NSSA"},done:"Chose the right area types",items:[
  ["A branch area with one exit; you want only intra-area routes and a default","tsa","No type 3/4/5 except default."],
  ["A branch with one exit; inter-area routes are fine but no externals","stub","No 4/5."],
  ["A remote area where a partner's routes are redistributed in locally, but the rest of the domain's externals should stay out","nssa","Type 7 for its own ASBR."],
  ["The data center area that needs all routes including externals","std","Normal area."],
  ["An area with two ABRs where you want optimal inter-area paths but no externals","stub","Type 3s allow choosing the better ABR."]]});

iosViz($("#viz-ospfmini"),{title:"Mini lab: summarize an area at the ABR",scenario:"R1 is the ABR between area 0 (toward R2) and area 10 (its loopbacks 172.20.0.0/24 to 172.20.3.0/24). R2 currently sees four O IA routes. Replace them with one /22.",
  devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"]],
  boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.0","no shutdown",...[0,1,2,3].flatMap(k=>["interface loopback"+(k+1),"ip address 172.20."+k+".1 255.255.255.0","ip ospf network point-to-point"]),"router ospf 1","router-id 1.1.1.1","network 10.0.12.0 0.0.0.255 area 0","network 172.20.0.0 0.0.3.255 area 10"],R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.0","no shutdown","router ospf 1","router-id 2.2.2.2","network 10.0.12.0 0.0.0.255 area 0"]},
  consoles:["R1"],startMode:"priv",topo:{R1:[180,70],R2:[420,70]},topoH:130,
  tasks:[{t:"Summarize area 10 as 172.20.0.0/22",hint:"configure terminal\nrouter ospf 1\narea 10 range 172.20.0.0 255.255.252.0",check:(w,D)=>hasRoute(w,D,"R2","172.20.0.0",22,"O IA")&&!hasRoute(w,D,"R2","172.20.1.0",24)},
    {t:"Find the discard route R1 created",hint:"do show ip route 172.20.0.0 255.255.252.0",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ip ro\S* 172\.20\.0\.0/i)}],
  solution:"configure terminal\nrouter ospf 1\narea 10 range 172.20.0.0 255.255.252.0\ndo show ip route 172.20.0.0 255.255.252.0",
  success:"One type 3 LSA instead of four, and a Null0 route on R1 so traffic to an unused part of the /22 is dropped instead of looping."},"ospfmini",40,"OSPF summarization mini lab");

stepViz($("#viz-bgpstate"),{title:"An eBGP session comes up",done:"Walked through the BGP states",steps:[
  ["Idle","The neighbor is configured. BGP waits, then starts a TCP connection to port 179. If there's no route to the neighbor, it stays Idle."],
  ["Connect","Waiting for the TCP three-way handshake to finish."],
  ["Active","The TCP attempt failed or timed out, and BGP keeps retrying. Flapping between Connect and Active means TCP can't complete: an ACL blocking 179, a wrong neighbor address, or the peer using a different source address."],
  ["OpenSent","TCP is up. This router sent an OPEN with its AS, hold time and router ID, and waits for the peer's."],
  ["OpenConfirm","The peer's OPEN arrived and checked out (remote-as matches, MD5 password matches). Waiting for a KEEPALIVE."],
  ["Established","Keepalives exchanged. UPDATE messages carry prefixes. show ip bgp summary shows a prefix count instead of a state."]]});

/* ---- best path game ---- */
quizViz($("#viz-bestpath"),{title:"BGP best path: which path wins, and why?",done:"Won the BGP tie-breaker game",qs:[
  ["Path A: weight 0, LP 100, AS path 65010 65020.<br>Path B: weight 100, LP 100, AS path 65030 65040 65050.",["B, highest weight","A, shorter AS path","A, lower weight","Tie"],0,"Weight is first."],
  ["Both weight 0. A: LP 150, AS path 3 long. B: LP 100, AS path 1 long.",["A, higher local preference","B, shorter AS path","Tie","B, lower LP"],0,"LP before AS path."],
  ["Same weight and LP. A: AS path 64500 64510. B: AS path 64600.",["B, shorter AS path","A, lower AS numbers","Tie","A, older"],0,"Path length."],
  ["Same weight, LP and AS path length. A origin i. B origin ?.",["A, IGP beats incomplete","B","Tie","Depends on MED"],0,"i < e < ?."],
  ["Same through origin, both from AS 64500. A: MED 50. B: MED 10.",["B, lower MED","A, higher MED","Tie","MED isn't compared"],0,"Lowest MED wins."],
  ["Same through MED. A learned from an eBGP peer, B from an iBGP peer.",["A, eBGP over iBGP","B","Tie","Lowest RID"],0,"eBGP preferred."],
  ["Everything else equal. A from router ID 2.2.2.2, B from 1.1.1.1 (both eBGP, same age rule disabled).",["B, lowest router ID","A","Tie","Neither"],0,"Lowest RID."]]});

iosViz($("#viz-bgpmini"),{title:"Mini lab: bring up eBGP",scenario:"R1 (AS 65001) connects to ISP (AS 64500) at 203.0.113.1. Peer with the ISP and advertise your LAN 10.50.0.0/24 (on Loopback0).",
  devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"}],links:[["R1:g0/0/0","ISP:g0/0/0"]],
  boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.50.0.1 255.255.255.0"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255","router bgp 64500","neighbor 203.0.113.2 remote-as 65001","network 8.8.8.8 mask 255.255.255.255"]},
  consoles:["R1"],startMode:"priv",topo:{R1:[180,70],ISP:[420,70]},topoH:130,
  tasks:[{t:"Start BGP AS 65001 and peer with 203.0.113.1 in AS 64500",hint:"configure terminal\nrouter bgp 65001\nneighbor 203.0.113.1 remote-as 64500",check:(w,D)=>bgpState(w,D,"R1","203.0.113.1")==="Established"},
    {t:"Advertise 10.50.0.0/24",hint:"network 10.50.0.0 mask 255.255.255.0",check:(w,D)=>hasRoute(w,D,"ISP","10.50.0.0",24,"B")},
    {t:"Check the session and the ISP's route",hint:"do show ip bgp summary\ndo show ip bgp",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ip bgp su/i)&&hasRoute(w,D,"R1","8.8.8.8",32,"B")}],
  solution:"configure terminal\nrouter bgp 65001\nneighbor 203.0.113.1 remote-as 64500\nnetwork 10.50.0.0 mask 255.255.255.0\ndo show ip bgp summary\ndo show ip bgp",
  success:"Try 'network 10.50.0.0 mask 255.255.0.0': nothing is advertised, because there's no exact match in the routing table."},"bgpmini",40,"eBGP mini lab");

stepViz($("#viz-pbrflow"),{title:"A packet meets policy-based routing",done:"Followed a packet through PBR",steps:[
  ["Arrives on G0/0/1","A guest laptop (10.1.50.23) sends to 93.184.216.34. G0/0/1 has 'ip policy route-map GUEST-OUT'."],
  ["Sequence 10","match ip address 110: ACL 110 permits 10.1.50.0/24. It matches."],
  ["Set clause","set ip next-hop 198.51.100.1 (the cheap broadband router). Is 198.51.100.1 directly connected and up? Yes."],
  ["Forwarded by policy","The packet goes to 198.51.100.1, even though the routing table's default route points to the MPLS router."],
  ["An employee packet","10.1.10.5 arrives on the same interface. It doesn't match ACL 110, no other sequence matches, so it's routed normally via the default route."],
  ["The broadband link fails","The set next hop is no longer reachable, so guest traffic falls back to normal routing. Use tracking (verify-availability) if it should be dropped instead."]]});

/* ---- NTP stratum tree ---- */
(function(){const el=$("#viz-stratum");let k=0;const N=[["GPS / atomic clock","Stratum 0. The reference itself; not on the network."],["time1.corp (GPS receiver)","Stratum 1. Directly attached to the reference clock."],["Core switches","Stratum 2. 'ntp server time1.corp' with authentication."],["Distribution and WAN routers","Stratum 3. Sync from the core."],["Access switches and APs","Stratum 4."],["A router with 'ntp master' and no upstream","Stratum 8 by default. Its own clock is the source: fine for a lab, risky in production."],["A device that can't reach any server","Stratum 16: unsynchronized. Logs, certificates and TACACS+ may misbehave."]];
  function draw(){el.innerHTML=`<div class="viz-title">NTP stratum: tap down the hierarchy</div><div class="stp-flow">${N.map((n,i)=>`<button class="stp-n${i<=k?" on":""}${i===k?" cur":""}" data-i="${i}"><span class="mono">${i===5?"S8":i===6?"S16":"S"+i}</span><b>${n[0]}</b></button>`).join("")}</div><div class="caption" aria-live="polite">${N[k][1]}</div>`;if(k===N.length-1)award("viz:stratum",20,"Walked the NTP hierarchy")}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){k=Math.max(k,+c.dataset.i);if(+c.dataset.i<k)k=+c.dataset.i;draw()}});draw()})();

seqViz($("#viz-ptp"),{title:"PTP: measuring offset and delay",left:"Master",right:"Slave",done:"Followed a PTP exchange",intro:"The slave needs four timestamps: t1 to t4.",steps:[
  {dir:"r",label:"Sync",sub:"sent at t1 (hardware timestamp)",text:"The master sends Sync. The slave timestamps its arrival as t2."},
  {dir:"r",label:"Follow_Up",sub:"carries the exact t1",text:"In two-step mode, the precise send time t1 follows in a separate message (one-step clocks put it in Sync itself)."},
  {dir:"l",label:"Delay_Req",sub:"sent at t3",text:"The slave sends Delay_Req and records t3. The master timestamps its arrival as t4."},
  {dir:"r",label:"Delay_Resp",sub:"carries t4",text:"Now the slave computes mean path delay = ((t2 − t1) + (t4 − t3)) / 2 and offset = (t2 − t1) − delay, and steers its clock."}],
  end:"Transparent clocks in between add their residence time to a correction field; boundary clocks end the exchange and start a new one downstream."});

sortViz($("#viz-natterms"),{title:"Name the NAT address",bins:{il:"Inside local",ig:"Inside global",og:"Outside global",ol:"Outside local"},done:"Named every NAT address",intro:"PC 10.1.1.10 browses to 93.184.216.34 through R1, which translates it to 203.0.113.5.",items:[
  ["10.1.1.10 as R1 sees it on the inside interface","il","The real private address."],["203.0.113.5","ig","The PC as the internet sees it."],["93.184.216.34 as the web server really is","og","The outside host's real address."],["93.184.216.34 as the PC sees it","ol","Usually equal to outside global unless outside NAT is used."]]});

revealViz($("#viz-fhrpstates"),{title:"HSRP states and what they tell you",cols:3,done:"Explored HSRP states",items:[
  ["Initial","Starting","HSRP isn't running yet: just configured, or the interface just came up."],
  ["Learn","Waiting","The router doesn't know the virtual IP and hasn't heard an active router."],
  ["Listen","Passive","It knows the virtual IP, but it's neither active nor standby. A third router in the group sits here."],
  ["Speak","Electing","Sending hellos and taking part in the election."],
  ["Standby","Backup","Next in line. Takes over when the active router's hellos stop (hold time)."],
  ["Active","Forwarding","Owns the virtual IP and MAC and forwards for hosts. Two actives = split brain."]]});

stepViz($("#viz-rpf"),{title:"The RPF check in action",done:"Followed the RPF check",steps:[
  ["The source","A video server 10.9.9.9 sends to 239.1.1.1. R1 is its first-hop router."],
  ["R3's unicast view","R3's routing table says the best path to 10.9.9.9 is via R2 out G0/0/1. G0/0/1 is R3's RPF interface for this source."],
  ["Packet from R2","A copy of the stream arrives from R2 on G0/0/1. RPF passes: it came in the interface R3 would use to reach the source. R3 forwards it downstream."],
  ["Packet from R4","Another copy arrives from R4 on G0/0/2. R3 would not use G0/0/2 to reach 10.9.9.9, so RPF fails and R3 drops it. This is what stops multicast loops."],
  ["Broken RPF","Someone adds a static route sending 10.9.9.0/24 via R4, but PIM isn't enabled toward R4. Now the RPF interface points at a neighbor that never sends the stream: every packet from R2 fails RPF and receivers get nothing."],
  ["Fix","Make unicast and multicast topologies agree, enable PIM on the RPF path, or add a static mroute to set the RPF interface."]]});

revealViz($("#viz-mcmodes"),{title:"Multicast models compared",cols:2,done:"Compared the multicast models",items:[
  ["PIM sparse mode (ASM)","Any-source","Receivers join (*,G) toward the RP. Sources register with the RP. Last-hop routers usually switch to the (S,G) shortest-path tree. Needs an RP."],
  ["SSM","Source-specific","Receivers ask for (S,G) with IGMPv3. Routers join straight toward the source. No RP, no registers. 232.0.0.0/8."],
  ["Bidirectional PIM","Many-to-many","One shared tree rooted at the RP, traffic up and down it. DF election per link. No (S,G) state at all."],
  ["MSDP","Inter-domain / Anycast RP","RPs tell each other about active sources with Source-Active messages over TCP 639, so receivers in one domain can join sources registered elsewhere."]]});

quizViz($("#viz-mcq"),{title:"Multicast scenarios",done:"Solved every multicast scenario",qs:[
  ["An IPTV service has a handful of known sources and millions of viewers. Simplest scalable model?",["SSM with IGMPv3","PIM dense mode","Bidir PIM","Broadcast"],0,"No RP needed."],
  ["Two RPs share the address 10.255.255.1 for redundancy. What keeps their source lists in sync?",["MSDP (Anycast RP)","IGMP","BSR","OSPF"],0,"SA messages."],
  ["Receivers join but traffic stops at R3. show ip mroute shows RPF failures. Cause?",["The unicast path to the source points out an interface without the stream","IGMP snooping","TTL too high","Wrong group"],0,"RPF interface mismatch."],
  ["A switch floods a 10 Mbps stream to all 48 ports in the VLAN. Fix?",["Enable IGMP snooping (with a querier)","Enable PIM on the switch ports","Disable STP","Use VLAN 1"],0,"Constrain flooding."],
  ["Which address would never be forwarded by a router?",["224.0.0.5","239.1.1.1","232.1.1.1","225.0.0.1"],0,"Link-local."]]});
  },
  sims:[
    {id:"trunkfix",type:"ios",title:"Fix a trunk that won't trunk",lab:{
      scenario:"SW1 and SW2 connect on G1/0/1. VLAN 20 users on SW2 can't reach their gateway on SW1. Find out why the link isn't trunking (show interfaces g1/0/1 switchport on both switches), make it a proper trunk with DTP off, and make sure VLANs 10 and 20 cross with native VLAN 99.",
      devices:[{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["SW1:g1/0/1","SW2:g1/0/1"]],
      boot:{SW1:["hostname SW1","vlan 10","vlan 20","vlan 99"],SW2:["hostname SW2","vlan 10","interface g1/0/5","switchport mode access","switchport access vlan 20"]},
      consoles:["SW1","SW2"],startMode:"priv",topo:{SW1:[180,70],SW2:[420,70]},topoH:130,
      tasks:[
        {t:"Explain the problem: check the administrative and operational modes",hint:"show interfaces g1/0/1 switchport",check:(w,D,S)=>ranCmd(S,"SW1",/sh\S* int\S* g\S*1\/0\/1 sw/i)||ranCmd(S,"SW2",/sh\S* int\S* g\S*1\/0\/1 sw/i)},
        {t:"Both ends: switchport mode trunk and switchport nonegotiate",hint:"interface g1/0/1\nswitchport mode trunk\nswitchport nonegotiate",check:(w,D)=>["SW1","SW2"].every(s=>{const i=D[s].ifs[IOS.ifName("g1/0/1")];return i.sw.mode==="trunk"&&i.sw.noneg})},
        {t:"Native VLAN 99 on both ends",hint:"switchport trunk native vlan 99",check:(w,D)=>["SW1","SW2"].every(s=>D[s].ifs[IOS.ifName("g1/0/1")].sw.native===99)},
        {t:"Allow only VLANs 10, 20 and 99",hint:"switchport trunk allowed vlan 10,20,99",check:(w,D)=>["SW1","SW2"].every(s=>{const i=D[s].ifs[IOS.ifName("g1/0/1")];return [10,20,99].every(v=>IOS.listHas(i.sw.allowed??"all",v))&&!IOS.listHas(i.sw.allowed??"all",1)})},
        {t:"Create the native VLAN 99 on SW2, which is missing there",hint:"vlan 99",check:(w,D)=>!!D.SW2.vlans[99]},
        {t:"Verify with show interfaces trunk on SW2",hint:"do show interfaces trunk",check:(w,D,S)=>ranCmd(S,"SW2",/sh\S* int\S* tr/i)&&IOS.trunkAllows(D.SW2.ifs[IOS.ifName("g1/0/1")],20)}],
      solution:"! SW1\nshow interfaces g1/0/1 switchport\nconfigure terminal\ninterface g1/0/1\nswitchport mode trunk\nswitchport nonegotiate\nswitchport trunk native vlan 99\nswitchport trunk allowed vlan 10,20,99\n! SW2\nconfigure terminal\nvlan 99\ninterface g1/0/1\nswitchport mode trunk\nswitchport nonegotiate\nswitchport trunk native vlan 99\nswitchport trunk allowed vlan 10,20,99\ndo show interfaces trunk",
      success:"Both ends were dynamic auto, so neither asked to trunk. And a VLAN, the native one included, has to exist on the switch before a trunk carries it."}},
    {id:"lacpfix",type:"ios",title:"Fix an EtherChannel that won't bundle",lab:{
      scenario:"SW1 and SW2 should bundle G1/0/11 and G1/0/12 into Port-channel 1 with LACP, as an 802.1Q trunk. Right now it's down. Find the problems with show etherchannel summary and show running-config on both switches and fix them.",
      devices:[{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["SW1:g1/0/11","SW2:g1/0/11"],["SW1:g1/0/12","SW2:g1/0/12"]],
      boot:{SW1:["hostname SW1","interface range g1/0/11 - 12","switchport mode trunk","channel-group 1 mode passive"],SW2:["hostname SW2","interface range g1/0/11 - 12","switchport mode trunk","channel-group 1 mode passive"]},
      consoles:["SW1","SW2"],startMode:"priv",topo:{SW1:[180,70],SW2:[420,70]},topoH:130,
      tasks:[
        {t:"Look at the bundle status",hint:"show etherchannel summary",check:(w,D,S)=>ranCmd(S,"SW1",/sh\S* eth\S* su/i)||ranCmd(S,"SW2",/sh\S* eth\S* su/i)},
        {t:"Make at least one side actively negotiate LACP",hint:"interface range g1/0/11 - 12\nchannel-group 1 mode active",check:(w,D)=>["SW1","SW2"].some(s=>D[s].ifs[IOS.ifName("g1/0/11")].cg?.mode==="active")},
        {t:"Both members bundled (P) on both switches",hint:"do show etherchannel summary",check:(w,D)=>["SW1","SW2"].every(s=>["g1/0/11","g1/0/12"].every(n=>IOS.ecMember(w,D[s],D[s].ifs[IOS.ifName(n)])==="P"))},
        {t:"On SW1, limit Port-channel 1 to VLANs 10 and 20",hint:"interface port-channel 1\nswitchport trunk allowed vlan 10,20",check:(w,D)=>{const P=D.SW1.ifs["Port-channel1"];return P&&P.sw.mode==="trunk"&&String(P.sw.allowed)==="10,20"}}],
      solution:"! SW1\nshow etherchannel summary\nconfigure terminal\ninterface range g1/0/11 - 12\nchannel-group 1 mode active\ninterface port-channel 1\nswitchport trunk allowed vlan 10,20\ndo show etherchannel summary",
      success:"passive + passive never forms: someone has to start LACP. One active side is enough."}},
    {id:"mstlab",type:"ios",title:"MST with two instances",lab:{
      scenario:"Replace Rapid PVST+ on SW1 and SW2 with MST. Region CAMPUS, revision 1. Instance 1 carries VLANs 10 and 20 with SW1 as root; instance 2 carries VLANs 30 and 40 with SW2 as root. The two uplinks G1/0/11 and G1/0/12 are trunks.",
      devices:[{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["SW1:g1/0/11","SW2:g1/0/11"],["SW1:g1/0/12","SW2:g1/0/12"]],
      boot:{SW1:["hostname SW1","vlan 10","vlan 20","vlan 30","vlan 40","interface range g1/0/11 - 12","switchport mode trunk"],SW2:["hostname SW2","vlan 10","vlan 20","vlan 30","vlan 40","interface range g1/0/11 - 12","switchport mode trunk"]},
      consoles:["SW1","SW2"],startMode:"priv",topo:{SW1:[180,70],SW2:[420,70]},topoH:130,
      tasks:[
        {t:"Both switches: spanning-tree mode mst",hint:"spanning-tree mode mst",check:(w,D)=>["SW1","SW2"].every(s=>D[s].stp.mode==="mst")},
        {t:"Same region on both: name CAMPUS, revision 1, instance 1 = VLANs 10,20 and instance 2 = VLANs 30,40",hint:"spanning-tree mst configuration\nname CAMPUS\nrevision 1\ninstance 1 vlan 10,20\ninstance 2 vlan 30,40",check:(w,D)=>["SW1","SW2"].every(s=>{const m=D[s].mst;return m.name==="CAMPUS"&&+m.rev===1&&String(m.inst[1])==="10,20"&&String(m.inst[2])==="30,40"})},
        {t:"SW1 is root for instance 1",hint:"spanning-tree mst 1 priority 24576",check:(w,D)=>{const T=IOS.stp(w,10);return D.SW1.mstPri[1]<32768&&T&&T.root.name==="SW1"}},
        {t:"SW2 is root for instance 2",hint:"spanning-tree mst 2 priority 24576",check:(w,D)=>{const T=IOS.stp(w,30);return D.SW2.mstPri[2]<32768&&T&&T.root.name==="SW2"}},
        {t:"Check it with show spanning-tree mst",hint:"do show spanning-tree mst",check:(w,D,S)=>ranCmd(S,"SW1",/sh\S* span\S* mst/i)||ranCmd(S,"SW2",/sh\S* span\S* mst/i)}],
      solution:"! SW1\nconfigure terminal\nspanning-tree mode mst\nspanning-tree mst configuration\nname CAMPUS\nrevision 1\ninstance 1 vlan 10,20\ninstance 2 vlan 30,40\nexit\nspanning-tree mst 1 priority 24576\n! SW2\nconfigure terminal\nspanning-tree mode mst\nspanning-tree mst configuration\nname CAMPUS\nrevision 1\ninstance 1 vlan 10,20\ninstance 2 vlan 30,40\nexit\nspanning-tree mst 2 priority 24576\ndo show spanning-tree mst",
      success:"Each switch is now root for half the VLANs, using two STP instances instead of four. Change the revision on one switch and watch them split into separate regions."}},
    {id:"guardlab",type:"ios",title:"Protect the root and the edge",lab:{
      scenario:"DIST is the root bridge for VLAN 10. ACC connects on G1/0/1. Last week someone plugged a home switch into an access port, and an access switch once took over as root after a priority change. Harden it: Root Guard on DIST's port toward ACC, and PortFast plus BPDU Guard on ACC's user ports G1/0/2 to G1/0/10. Then test what happens when ACC suddenly claims to be root.",
      devices:[{name:"DIST",kind:"switch"},{name:"ACC",kind:"switch"}],links:[["DIST:g1/0/1","ACC:g1/0/1"]],
      boot:{DIST:["hostname DIST","vlan 10","spanning-tree vlan 10 priority 4096","interface g1/0/1","switchport mode trunk"],ACC:["hostname ACC","vlan 10","interface g1/0/1","switchport mode trunk","interface range g1/0/2 - 10","switchport mode access","switchport access vlan 10"]},
      consoles:["DIST","ACC"],startMode:"priv",topo:{DIST:[180,70],ACC:[420,70]},topoH:130,
      tasks:[
        {t:"DIST: root guard on G1/0/1",hint:"interface g1/0/1\nspanning-tree guard root",check:(w,D)=>D.DIST.ifs[IOS.ifName("g1/0/1")].guard==="root"},
        {t:"ACC: PortFast and BPDU Guard on G1/0/2 to G1/0/10",hint:"interface range g1/0/2 - 10\nspanning-tree portfast\nspanning-tree bpduguard enable",check:(w,D)=>[2,3,4,5,6,7,8,9,10].every(k=>{const i=D.ACC.ifs[IOS.ifName("g1/0/"+k)];return i.pf&&i.bg})},
        {t:"Test: on ACC, set VLAN 10 priority to 0 (pretend it's a rogue root)",hint:"spanning-tree vlan 10 priority 0",check:(w,D)=>D.ACC.stp.pri[10]===0},
        {t:"On DIST, confirm the port is root-inconsistent and DIST is still root",hint:"show spanning-tree inconsistentports",check:(w,D,S)=>ranCmd(S,"DIST",/sh\S* span\S* incon/i)&&IOS.stpPorts(w,D.DIST,10).out.some(p=>p.rootInc)}],
      solution:"! DIST\nconfigure terminal\ninterface g1/0/1\nspanning-tree guard root\n! ACC\nconfigure terminal\ninterface range g1/0/2 - 10\nspanning-tree portfast\nspanning-tree bpduguard enable\nexit\nspanning-tree vlan 10 priority 0\n! DIST\nend\nshow spanning-tree inconsistentports",
      success:"Root Guard blocked the superior BPDUs instead of letting ACC take over. Remove the priority 0 and the port recovers by itself."}},
    {id:"ospfarea",type:"ios",title:"Multi-area OSPF with summarization",lab:{
      scenario:"R1 is in area 0 only. R2 is the ABR between area 0 and area 20. R3 is in area 20 with four branch LANs 10.20.0.0/24 to 10.20.3.0/24 on loopbacks. R1 and R3 are already configured. Configure R2, then summarize area 20 into a single /22 for area 0.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"R3",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","R3:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","router ospf 1","router-id 1.1.1.1","network 10.0.12.0 0.0.0.3 area 0"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.23.2 255.255.255.252","no shutdown"],
        R3:["hostname R3","interface g0/0/0","ip address 10.0.23.1 255.255.255.252","no shutdown",...[0,1,2,3].flatMap(k=>["interface loopback"+k,"ip address 10.20."+k+".1 255.255.255.0","ip ospf network point-to-point"]),"router ospf 1","router-id 3.3.3.3","network 10.0.23.0 0.0.0.3 area 20","network 10.20.0.0 0.0.3.255 area 20"]},
      consoles:["R2"],startMode:"priv",topo:{R1:[100,70],R2:[300,70],R3:[500,70]},topoH:130,
      tasks:[
        {t:"R2: OSPF 1, router ID 2.2.2.2, G0/0/0 in area 0 and G0/0/1 in area 20",hint:"router ospf 1\nrouter-id 2.2.2.2\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 20",check:(w)=>adjState(w,"R1","R2")==="FULL"&&adjState(w,"R2","R3")==="FULL"},
        {t:"R1 learns area 20's LANs as inter-area routes",hint:"do show ip route ospf",check:(w,D)=>hasRoute(w,D,"R1","10.20.0.0",24,"O IA")||hasRoute(w,D,"R1","10.20.0.0",22,"O IA"),sticky:true},
        {t:"Summarize area 20 as 10.20.0.0/22 on the ABR",hint:"area 20 range 10.20.0.0 255.255.252.0",check:(w,D)=>hasRoute(w,D,"R1","10.20.0.0",22,"O IA")&&!hasRoute(w,D,"R1","10.20.2.0",24)},
        {t:"Confirm R2 is an ABR and see the range",hint:"do show ip ospf",check:(w,D,S)=>ranCmd(S,"R2",/sh\S* ip ospf$/i)}],
      solution:"configure terminal\nrouter ospf 1\nrouter-id 2.2.2.2\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 20\narea 20 range 10.20.0.0 255.255.252.0\ndo show ip ospf",
      success:"Area 0 now carries one LSA for the whole branch range, and a flap of one branch LAN doesn't reach R1 at all."}},
    {id:"ospfstub",type:"ios",title:"Stub areas and route filtering",lab:{
      scenario:"R1 (area 0) redistributes a static route to a partner network 192.168.99.0/24, which floods everywhere as an E2 route. R3 in area 30 is a small branch with one exit through R2. Make area 30 totally stubby so R3 only needs a default route. Then, on R1 itself, stop OSPF installing the test network 10.99.0.0/24 (from R2's Loopback9) into R1's routing table, without touching R2.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"R3",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","R3:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 172.31.0.1 255.255.255.252","no shutdown","ip route 192.168.99.0 255.255.255.0 172.31.0.2","router ospf 1","router-id 1.1.1.1","network 10.0.12.0 0.0.0.3 area 0","redistribute static subnets"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.23.2 255.255.255.252","no shutdown","interface loopback9","ip address 10.99.0.1 255.255.255.0","ip ospf network point-to-point","router ospf 1","router-id 2.2.2.2","network 10.0.12.0 0.0.0.3 area 0","network 10.99.0.0 0.0.0.255 area 0","network 10.0.23.0 0.0.0.3 area 30"],
        R3:["hostname R3","interface g0/0/0","ip address 10.0.23.1 255.255.255.252","no shutdown","interface loopback0","ip address 10.30.0.1 255.255.255.0","router ospf 1","router-id 3.3.3.3","network 10.0.23.0 0.0.0.3 area 30","network 10.30.0.0 0.0.0.255 area 30"]},
      consoles:["R1","R2","R3"],startMode:"priv",topo:{R1:[100,70],R2:[300,70],R3:[500,70]},topoH:130,
      tasks:[
        {t:"Look at R3's routing table first: note the O E2 route",hint:"! R3\nshow ip route",check:(w,D,S)=>ranCmd(S,"R3",/sh\S* ip ro/i)},
        {t:"Area 30 is a stub on both R2 and R3 (the adjacency must stay FULL)",hint:"router ospf 1\narea 30 stub",check:(w,D)=>D.R2.ospf.stubs?.[30]&&D.R3.ospf.stubs?.[30]&&adjState(w,"R2","R3")==="FULL"},
        {t:"Make it totally stubby on the ABR: R3 has only intra-area routes and a default",hint:"! R2\narea 30 stub no-summary",check:(w,D)=>D.R2.ospf.stubs?.[30]?.nosum&&IOS.rib(w,D.R3,4).some(r=>r.len===0&&/O/.test(r.code))&&!IOS.rib(w,D.R3,4).some(r=>/IA|E2/.test(r.code)&&r.len>0)},
        {t:"R3 can still reach R1",hint:"! R3\nping 10.0.12.1",check:(w,D)=>!!D.R3.ospf.stubs?.[30]&&pingOk(w,D,"R3","10.0.12.1")},
        {t:"R1: prefix list BLOCK99 denies 10.99.0.0/24 and permits everything else, applied with distribute-list in",hint:"! R1\nip prefix-list BLOCK99 seq 5 deny 10.99.0.0/24\nip prefix-list BLOCK99 seq 10 permit 0.0.0.0/0 le 32\nrouter ospf 1\ndistribute-list prefix BLOCK99 in",check:(w,D)=>!hasRoute(w,D,"R1","10.99.0.0",24)&&hasRoute(w,D,"R1","10.0.23.0",30,"O IA")}],
      solution:"! R3\nshow ip route\nconfigure terminal\nrouter ospf 1\narea 30 stub\n! R2\nconfigure terminal\nrouter ospf 1\narea 30 stub no-summary\n! R3\nend\nping 10.0.12.1\n! R1\nconfigure terminal\nip prefix-list BLOCK99 seq 5 deny 10.99.0.0/24\nip prefix-list BLOCK99 seq 10 permit 0.0.0.0/0 le 32\nrouter ospf 1\ndistribute-list prefix BLOCK99 in",
      success:"The stub flag must match on both ends or the adjacency drops. And the distribute-list only cleaned R1's table: the LSA is still in R1's database (show ip ospf database)."}},
    {id:"ospffix",type:"ios",title:"Troubleshoot OSPF adjacencies",lab:{
      scenario:"R2 should have FULL adjacencies with R1 (G0/0/0) and R3 (G0/0/1), but it has neither. R1 and R3 are configured correctly and can't be changed. Use show ip ospf neighbor, show ip ospf interface and show running-config on R2 to find and fix every problem.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"R3",kind:"router"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","R3:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.0","ip ospf message-digest-key 1 md5 Ospf!","ip ospf authentication message-digest","no shutdown","router ospf 1","router-id 1.1.1.1","network 10.0.12.0 0.0.0.255 area 0"],
        R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.0","ip ospf hello-interval 5","no shutdown","interface g0/0/1","ip address 10.0.23.2 255.255.255.0","ip mtu 1400","no shutdown","router ospf 1","router-id 2.2.2.2","network 10.0.12.0 0.0.0.255 area 0","network 10.0.23.0 0.0.0.255 area 0"],
        R3:["hostname R3","interface g0/0/0","ip address 10.0.23.3 255.255.255.0","no shutdown","router ospf 1","router-id 3.3.3.3","network 10.0.23.0 0.0.0.255 area 0"]},
      consoles:["R2"],startMode:"priv",topo:{R1:[100,70],R2:[300,70],R3:[500,70]},topoH:130,
      tasks:[
        {t:"Fix the R1 link timers",hint:"interface g0/0/0\nno ip ospf hello-interval",check:(w,D)=>!D.R2.ifs[IOS.ifName("g0/0/0")].ospf.hello||D.R2.ifs[IOS.ifName("g0/0/0")].ospf.hello===10},
        {t:"Match R1's authentication (MD5 key 1, Ospf!)",hint:"ip ospf message-digest-key 1 md5 Ospf!\nip ospf authentication message-digest",check:(w)=>adjState(w,"R1","R2")==="FULL"},
        {t:"Fix the R3 link stuck in EXSTART",hint:"interface g0/0/1\nno ip mtu",check:(w)=>adjState(w,"R2","R3")==="FULL"},
        {t:"Confirm both neighbors are FULL",hint:"do show ip ospf neighbor",check:(w,D,S)=>ranCmd(S,"R2",/sh\S* ip ospf nei/i)&&adjState(w,"R1","R2")==="FULL"&&adjState(w,"R2","R3")==="FULL"}],
      solution:"configure terminal\ninterface g0/0/0\nno ip ospf hello-interval\nip ospf message-digest-key 1 md5 Ospf!\nip ospf authentication message-digest\ninterface g0/0/1\nno ip mtu\ndo show ip ospf neighbor",
      success:"Three different failure signatures: no neighbor at all (timers), no neighbor with authentication errors, and a neighbor stuck in EXSTART (MTU)."}},
    {id:"ebgplab",type:"ios",title:"Dual-homed eBGP",lab:{
      scenario:"R1 (AS 65001) has two ISPs: ISPA (AS 64500) at 203.0.113.1 and ISPB (AS 64510) at 198.51.100.1. Both ISPs advertise 8.8.8.0/24. Bring up both sessions, advertise your network 10.50.0.0/24 (Loopback0), and find out which ISP R1 prefers for 8.8.8.0/24 and why.",
      devices:[{name:"R1",kind:"router"},{name:"ISPA",kind:"router"},{name:"ISPB",kind:"router"}],links:[["R1:g0/0/0","ISPA:g0/0/0"],["R1:g0/0/1","ISPB:g0/0/0"],["ISPA:g0/0/1","ISPB:g0/0/1"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.50.0.1 255.255.255.0"],
        ISPA:["hostname ISPA","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.0.2.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.0","router bgp 64500","bgp router-id 10.0.0.1","neighbor 203.0.113.2 remote-as 65001","neighbor 192.0.2.2 remote-as 64510","network 8.8.8.0 mask 255.255.255.0"],
        ISPB:["hostname ISPB","interface g0/0/0","ip address 198.51.100.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.0.2.2 255.255.255.252","no shutdown","router bgp 64510","bgp router-id 10.0.0.2","neighbor 198.51.100.2 remote-as 65001","neighbor 192.0.2.1 remote-as 64500"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[120,110],ISPA:[420,40],ISPB:[420,180]},topoH:230,
      tasks:[
        {t:"BGP AS 65001 with router ID 1.1.1.1 and both ISP neighbors Established",hint:"router bgp 65001\nbgp router-id 1.1.1.1\nneighbor 203.0.113.1 remote-as 64500\nneighbor 198.51.100.1 remote-as 64510",check:(w,D)=>bgpState(w,D,"R1","203.0.113.1")==="Established"&&bgpState(w,D,"R1","198.51.100.1")==="Established"},
        {t:"Advertise 10.50.0.0/24 to both ISPs",hint:"network 10.50.0.0 mask 255.255.255.0",check:(w,D)=>hasRoute(w,D,"ISPA","10.50.0.0",24,"B")&&hasRoute(w,D,"ISPB","10.50.0.0",24,"B")},
        {t:"Look at the two paths to 8.8.8.0/24 and the best one",hint:"do show ip bgp",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ip bgp$/i)&&bestVia(w,D,"R1","8.8.8.0",24)==="203.0.113.1"}],
      solution:"configure terminal\nrouter bgp 65001\nbgp router-id 1.1.1.1\nneighbor 203.0.113.1 remote-as 64500\nneighbor 198.51.100.1 remote-as 64510\nnetwork 10.50.0.0 mask 255.255.255.0\ndo show ip bgp",
      success:"Via ISPA the AS path is just 64500; via ISPB it's 64510 64500. Weight and local preference are equal, nothing is locally originated, so the shorter AS path wins."}},
    {id:"bgppath",type:"ios",title:"Steer traffic with local preference and AS-path prepending",lab:{
      scenario:"Same network as the last lab, already peered. Management wants outbound traffic to 8.8.8.0/24 to use ISPB (the cheaper contract), and inbound traffic to 10.50.0.0/24 to arrive through ISPA. Use a route map with local preference for outbound and AS-path prepending for inbound.",
      devices:[{name:"R1",kind:"router"},{name:"ISPA",kind:"router"},{name:"ISPB",kind:"router"}],links:[["R1:g0/0/0","ISPA:g0/0/0"],["R1:g0/0/1","ISPB:g0/0/0"],["ISPA:g0/0/1","ISPB:g0/0/1"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.50.0.1 255.255.255.0","router bgp 65001","bgp router-id 1.1.1.1","neighbor 203.0.113.1 remote-as 64500","neighbor 198.51.100.1 remote-as 64510","network 10.50.0.0 mask 255.255.255.0"],
        ISPA:["hostname ISPA","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.0.2.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.0","router bgp 64500","bgp router-id 10.0.0.1","neighbor 203.0.113.2 remote-as 65001","neighbor 192.0.2.2 remote-as 64510","network 8.8.8.0 mask 255.255.255.0"],
        ISPB:["hostname ISPB","interface g0/0/0","ip address 198.51.100.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.0.2.2 255.255.255.252","no shutdown","router bgp 64510","bgp router-id 10.0.0.2","neighbor 198.51.100.2 remote-as 65001","neighbor 192.0.2.1 remote-as 64500"]},
      consoles:["R1","ISPB"],startMode:"priv",topo:{R1:[120,110],ISPA:[420,40],ISPB:[420,180]},topoH:230,
      tasks:[
        {t:"Route map PREFER-B sets local-preference 200, applied inbound from ISPB",hint:"route-map PREFER-B permit 10\nset local-preference 200\nrouter bgp 65001\nneighbor 198.51.100.1 route-map PREFER-B in",check:(w,D)=>D.R1.bgp.nbrs[String(ip("198.51.100.1"))]?.rmIn==="PREFER-B"&&D.R1.rmaps["PREFER-B"]?.some(e=>e.set.lp===200)},
        {t:"R1 now prefers ISPB for 8.8.8.0/24",hint:"do clear ip bgp * soft\ndo show ip bgp",check:(w,D)=>bestVia(w,D,"R1","8.8.8.0",24)==="198.51.100.1"},
        {t:"Route map PREPEND adds 65001 65001 65001, applied outbound to ISPB",hint:"route-map PREPEND permit 10\nset as-path prepend 65001 65001 65001\nrouter bgp 65001\nneighbor 198.51.100.1 route-map PREPEND out",check:(w,D)=>D.R1.bgp.nbrs[String(ip("198.51.100.1"))]?.rmOut==="PREPEND"},
        {t:"ISPB now reaches 10.50.0.0/24 through ISPA (check on ISPB)",hint:"! ISPB\nshow ip bgp",check:(w,D,S)=>ranCmd(S,"ISPB",/sh\S* ip bgp/i)&&bestVia(w,D,"ISPB","10.50.0.0",24)==="192.0.2.1"}],
      solution:"configure terminal\nroute-map PREFER-B permit 10\nset local-preference 200\nroute-map PREPEND permit 10\nset as-path prepend 65001 65001 65001\nrouter bgp 65001\nneighbor 198.51.100.1 route-map PREFER-B in\nneighbor 198.51.100.1 route-map PREPEND out\ndo clear ip bgp * soft\ndo show ip bgp\n! ISPB\nshow ip bgp",
      success:"Outbound: LP 200 beats the shorter AS path because LP is checked first. Inbound: ISPB sees 65001 65001 65001 65001 directly versus 64500 65001 via ISPA, and picks the shorter one."}},
    {id:"pbrlab",type:"ios",title:"Send guest traffic out the broadband link",lab:{
      scenario:"R1's default route goes to the MPLS router (10.0.1.2). Guest Wi-Fi (10.1.50.0/24, arriving on G0/0/1) must instead leave through the broadband router at 10.0.2.2, while staff (10.1.10.0/24, same interface) keep using MPLS.",
      devices:[{name:"R1",kind:"router"},{name:"MPLS",kind:"router"},{name:"BB",kind:"router"},{name:"NET",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","MPLS:g0/0/0"],["R1:g0/0/2","BB:g0/0/0"],["MPLS:g0/0/1","NET:g0/0/0"],["BB:g0/0/1","NET:g0/0/1"],["R1:g0/0/1","SW1:g1/0/1"]],
      hosts:[{name:"GUEST",ip:"10.1.50.20",gw:"10.1.50.1",len:24,at:"SW1:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/2","ip address 10.0.2.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.50.1 255.255.255.0","no shutdown","interface loopback10","ip address 10.1.10.1 255.255.255.0","ip route 0.0.0.0 0.0.0.0 10.0.1.2"],
        MPLS:["hostname MPLS","interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.3.1 255.255.255.252","no shutdown","ip route 10.1.0.0 255.255.0.0 10.0.1.1","ip route 0.0.0.0 0.0.0.0 10.0.3.2"],
        BB:["hostname BB","interface g0/0/0","ip address 10.0.2.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.4.1 255.255.255.252","no shutdown","ip route 10.1.0.0 255.255.0.0 10.0.2.1","ip route 0.0.0.0 0.0.0.0 10.0.4.2"],
        NET:["hostname NET","interface g0/0/0","ip address 10.0.3.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.4.2 255.255.255.252","no shutdown","interface loopback0","ip address 93.184.216.34 255.255.255.255","ip route 10.1.50.0 255.255.255.0 10.0.4.1","ip route 10.1.10.0 255.255.255.0 10.0.3.1"]},
      consoles:["R1"],startMode:"priv",topo:{SW1:[60,110],R1:[200,110],MPLS:[360,40],BB:[360,180],NET:[520,110],GUEST:[60,200]},topoH:230,
      tasks:[
        {t:"ACL 110 matches the guest subnet",hint:"access-list 110 permit ip 10.1.50.0 0.0.0.255 any",check:(w,D)=>!!(D.R1.acls?.["110"]||D.R1.acls?.[110])},
        {t:"Route map GUEST-OUT: match ACL 110, set ip next-hop 10.0.2.2",hint:"route-map GUEST-OUT permit 10\nmatch ip address 110\nset ip next-hop 10.0.2.2",check:(w,D)=>D.R1.rmaps["GUEST-OUT"]?.some(e=>e.act==="permit"&&e.set.nh&&e.set.nh[0]===ip("10.0.2.2"))},
        {t:"Apply it where guest traffic enters R1",hint:"interface g0/0/1\nip policy route-map GUEST-OUT",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/1")].policy==="GUEST-OUT"},
        {t:"Guest traffic to 93.184.216.34 now goes through BB",hint:"do show ip policy",check:(w,D,S)=>{const r=IOS.forward(w,D.R1,ip("93.184.216.34"),4,{iif:IOS.ifName("g0/0/1"),src:ip("10.1.50.20")});return ranCmd(S,"R1",/sh\S* ip pol/i)&&(r.hops||[]).some(h=>h.dev==="BB")}}],
      solution:"configure terminal\naccess-list 110 permit ip 10.1.50.0 0.0.0.255 any\nroute-map GUEST-OUT permit 10\nmatch ip address 110\nset ip next-hop 10.0.2.2\ninterface g0/0/1\nip policy route-map GUEST-OUT\ndo show ip policy",
      success:"Staff traffic doesn't match ACL 110, so it's routed normally over MPLS. PBR only touched what you matched."}},
    {id:"natlab",type:"ios",title:"PAT for users and a static NAT for a server",lab:{
      scenario:"R1 connects the inside LAN 10.1.1.0/24 (G0/0/1) to the ISP (G0/0/0, 203.0.113.2/29). Users should share the G0/0/0 address with PAT. The web server 10.1.1.100 must be reachable from the internet as 203.0.113.5.",
      devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","ISP:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"PC",ip:"10.1.1.20",gw:"10.1.1.1",at:"SW1:g1/0/2"},{name:"WEB",ip:"10.1.1.100",gw:"10.1.1.1",at:"SW1:g1/0/3"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.248","no shutdown","interface g0/0/1","ip address 10.1.1.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.248","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255"]},
      consoles:["R1"],startMode:"priv",topo:{SW1:[100,90],R1:[300,90],ISP:[500,90],PC:[60,180],WEB:[160,180]},topoH:210,
      tasks:[
        {t:"Mark G0/0/1 inside and G0/0/0 outside",hint:"interface g0/0/1\nip nat inside\ninterface g0/0/0\nip nat outside",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/1")].nat==="inside"&&D.R1.ifs[IOS.ifName("g0/0/0")].nat==="outside"},
        {t:"Static NAT: 10.1.1.100 appears as 203.0.113.5",hint:"ip nat inside source static 10.1.1.100 203.0.113.5",check:(w,D)=>D.R1.nat.statics.some(s=>s.local===ip("10.1.1.100")&&s.global===ip("203.0.113.5"))},
        {t:"PAT: ACL 1 permits 10.1.1.0/24, overloaded on G0/0/0",hint:"access-list 1 permit 10.1.1.0 0.0.0.255\nip nat inside source list 1 interface g0/0/0 overload",check:(w,D)=>D.R1.nat.rules.some(r=>r.oif===IOS.ifName("g0/0/0")&&r.overload)},
        {t:"Check the translation table",hint:"do show ip nat translations",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ip nat tr/i)}],
      solution:"configure terminal\ninterface g0/0/1\nip nat inside\ninterface g0/0/0\nip nat outside\nip nat inside source static 10.1.1.100 203.0.113.5\naccess-list 1 permit 10.1.1.0 0.0.0.255\nip nat inside source list 1 interface g0/0/0 overload\ndo show ip nat translations",
      success:"The static entry is permanent, so the server is always reachable. PAT entries appear as users open connections."}},
    {id:"vrrplab",type:"ios",title:"VRRPv3 gateway with tracking",lab:{
      scenario:"Replace the old gateway setup for VLAN 30 with VRRPv3. GW1 (10.1.30.2) should be master for virtual IP 10.1.30.1 with priority 120, and drop to below GW2's default (100) if its uplink G0/0/0 fails. GW2 (10.1.30.3) is already configured.",
      devices:[{name:"GW1",kind:"router"},{name:"GW2",kind:"router"},{name:"CORE",kind:"router"},{name:"SW1",kind:"switch"}],links:[["GW1:g0/0/1","SW1:g1/0/1"],["GW2:g0/0/1","SW1:g1/0/2"],["GW1:g0/0/0","CORE:g0/0/0"],["GW2:g0/0/0","CORE:g0/0/1"]],hosts:[{name:"PC30",ip:"10.1.30.50",gw:"10.1.30.1",at:"SW1:g1/0/5"}],
      boot:{GW1:["hostname GW1","interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.30.2 255.255.255.0","no shutdown"],GW2:["hostname GW2","fhrp version vrrp v3","interface g0/0/0","ip address 10.0.2.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.30.3 255.255.255.0","no shutdown","vrrp 30 address-family ipv4","address 10.1.30.1 primary","exit-vrrp"],CORE:["hostname CORE","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.2.1 255.255.255.252","no shutdown"]},
      consoles:["GW1"],startMode:"priv",topo:{CORE:[300,40],GW1:[160,120],GW2:[440,120],SW1:[300,200],PC30:[470,215]},topoH:245,
      events:[{label:"Fail GW1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=true;return "CORE: G0/0/0 down"}},{label:"Restore GW1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=false;return "CORE: G0/0/0 up"}}],
      tasks:[
        {t:"Enable VRRPv3 syntax",hint:"fhrp version vrrp v3",check:(w,D)=>D.GW1.vrrpV3},
        {t:"Track 1 follows G0/0/0's line protocol",hint:"track 1 interface g0/0/0 line-protocol",check:(w,D)=>D.GW1.tracks[1]?.if===IOS.ifName("g0/0/0")},
        {t:"VRRP 30 for IPv4: address 10.1.30.1, priority 120, track 1 decrement 30",hint:"interface g0/0/1\nvrrp 30 address-family ipv4\naddress 10.1.30.1 primary\npriority 120\ntrack 1 decrement 30",check:(w,D)=>{const c=D.GW1.ifs[IOS.ifName("g0/0/1")].vrrp[30];return c&&c.ip===ip("10.1.30.1")&&c.pri===120&&(c.track||[]).some(t=>t.obj===1&&t.dec>20)}},
        {t:"GW1 is master",hint:"do show vrrp brief",check:(w)=>/^master$/i.test(fhrpState(w,"vrrp","GW1","g0/0/1",30)||""),sticky:true},
        {t:"Fail the uplink and confirm GW1 becomes backup",hint:"(press Fail GW1's uplink)\ndo show vrrp brief",check:(w)=>/^backup$/i.test(fhrpState(w,"vrrp","GW1","g0/0/1",30)||""),sticky:true}],
      solution:"configure terminal\nfhrp version vrrp v3\ntrack 1 interface g0/0/0 line-protocol\ninterface g0/0/1\nvrrp 30 address-family ipv4\naddress 10.1.30.1 primary\npriority 120\ntrack 1 decrement 30\nexit-vrrp\ndo show vrrp brief\n(press Fail GW1's uplink)\ndo show vrrp brief",
      success:"VRRP preempts by default, so GW2 took over as soon as GW1 dropped to 90, and GW1 takes it back when the uplink returns."}},
    {id:"ntplab",type:"ios",title:"Authenticated NTP",lab:{
      scenario:"TIME (10.0.0.10) is the company's stratum 2 source and only serves clients that authenticate with MD5 key 7, value Tim3!Key. Make R1 an authenticated client of TIME.",
      devices:[{name:"R1",kind:"router"},{name:"TIME",kind:"router"}],links:[["R1:g0/0/0","TIME:g0/0/0"]],
      boot:{TIME:["hostname TIME","interface g0/0/0","ip address 10.0.0.10 255.255.255.0","no shutdown","ntp authentication-key 7 md5 Tim3!Key","ntp authenticate","ntp trusted-key 7","ntp master 2"],R1:["hostname R1","interface g0/0/0","ip address 10.0.0.1 255.255.255.0","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[180,70],TIME:[420,70]},topoH:130,
      tasks:[
        {t:"Define key 7 (md5 Tim3!Key) and trust it",hint:"ntp authentication-key 7 md5 Tim3!Key\nntp trusted-key 7",check:(w,D)=>D.R1.ntpx.keys[7]==="Tim3!Key"&&D.R1.ntpx.trusted.includes(7)},
        {t:"Turn on NTP authentication",hint:"ntp authenticate",check:(w,D)=>D.R1.ntpx.auth},
        {t:"Use TIME as the server with key 7",hint:"ntp server 10.0.0.10 key 7",check:(w,D)=>D.R1.ntp.includes(ip("10.0.0.10"))&&D.R1.ntpx.srvKey[String(ip("10.0.0.10"))]===7},
        {t:"R1 is synchronized at stratum 3",hint:"do show ntp status",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ntp st/i)&&IOS.ntpState(w,D.R1).synced&&IOS.ntpState(w,D.R1).stratum===3}],
      solution:"configure terminal\nntp authentication-key 7 md5 Tim3!Key\nntp trusted-key 7\nntp authenticate\nntp server 10.0.0.10 key 7\ndo show ntp status",
      success:"Leave out the trusted-key or use the wrong key value and R1 stays at stratum 16."}}
  ],
  badges:[
    ["reader","INF","Infrastructure Scholar","Mark all 11 infrastructure lessons studied",c=>c.allStudied()],
    ["lab","30%","Heavy Lifter","Complete all 22 diagrams in this module",c=>c.vizAll()],
    ["trunk","DTP","Negotiator","Fix the broken trunk",c=>c.passed("trunkfix")],
    ["lacp","LAG","Bundle of Joy","Fix the EtherChannel",c=>c.passed("lacpfix")],
    ["mst","MST","Instance Manager","Pass the MST lab",c=>c.passed("mstlab")],
    ["guard","RG","Root Guardian","Pass the STP protection lab",c=>c.passed("guardlab")],
    ["ospf","ABR","Area Border Patrol","Pass the multi-area and stub area labs",c=>c.passed("ospfarea")&&c.passed("ospfstub")],
    ["ospffix","EXS","EXSTART Escape","Fix every OSPF adjacency",c=>c.passed("ospffix")],
    ["bgp","179","Established","Pass the dual-homed eBGP lab",c=>c.passed("ebgplab")],
    ["path","LP","Path Picker","Pass the BGP traffic steering lab and the best path game",c=>c.passed("bgppath")&&c.earned("viz:bestpath")],
    ["pbr","PBR","Rule Bender","Pass the policy-based routing lab",c=>c.passed("pbrlab")],
    ["nat","PAT","Translator","Pass the NAT lab",c=>c.passed("natlab")],
    ["vrrp","V3","Master Gateway","Pass the VRRPv3 lab",c=>c.passed("vrrplab")],
    ["ntp","S3","Time Lord","Pass the authenticated NTP lab",c=>c.passed("ntplab")],
    ["mcast","RPF","Reverse Path","Follow the RPF check and pass the multicast scenarios",c=>c.earned("viz:rpf")&&c.earned("viz:mcq")],
    ["perfect","INF","Domain Three Down","Score 100% on an infrastructure quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
