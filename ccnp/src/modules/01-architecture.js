/* ================= Module 1: Architecture (350-401 v1.2 Domain 1.0, 15%) ================= */
(function(){
const LESSONS=[
{id:"design",num:"1.1",title:"Enterprise network design: 2-tier, 3-tier, fabric and cloud",html:`
<p>ENCOR expects you to recognize a design from a description and say why someone picked it. Every design answers the same questions: how many layers, where does Layer 2 stop and Layer 3 start, and what happens when something fails.</p>
<h3>Three-tier hierarchical campus</h3>
<ul><li><b>Access layer</b>: where users, phones, APs and printers plug in. Features here are about the edge: PoE, port security, 802.1X, QoS trust and marking, VLAN assignment, BPDU Guard and PortFast.</li>
<li><b>Distribution layer</b>: aggregates access switches in a building or floor. It is the <b>policy and boundary</b> layer: inter-VLAN routing (SVIs), first-hop redundancy (HSRP/VRRP), route summarization toward the core, ACLs, and the Layer 2/Layer 3 boundary in a traditional design.</li>
<li><b>Core layer</b>: the high-speed backbone between distribution blocks, the data center and the WAN edge. It should do one thing well: <b>switch packets fast and stay up</b>. No user ports, no heavy policy, Layer 3 links only, redundant everything.</li></ul>
<h3>Two-tier (collapsed core)</h3>
<p>In a smaller campus or a single building, the distribution and core layers merge into one pair of switches. It saves money and rack space. It stops scaling when you have many buildings, because every new distribution block would need a full mesh to every other one. That is the point where a dedicated core pays off.</p>
<div class="viz" id="viz-tiers"></div>
<h3>Layer 2 access vs routed access</h3>
<ul><li><b>Layer 2 access</b> (the classic design): access-to-distribution links are 802.1Q trunks, VLANs live on the distribution pair, STP blocks one uplink and an FHRP provides the gateway. Simple, but half your uplinks sit idle and convergence depends on STP.</li>
<li><b>Routed access</b>: the access switch is the default gateway and the uplinks are routed point-to-point links running OSPF or EIGRP. No STP across uplinks, both links forward with ECMP, and convergence is sub-second. The trade-off: a VLAN can't span multiple access switches.</li>
<li><b>Virtual switching</b> (StackWise Virtual, VSS): two distribution switches act as one logical switch, and access switches connect with a multichassis EtherChannel. STP sees one link, so nothing blocks, and no FHRP is needed.</li></ul>
<div class="viz" id="viz-campus"></div>
<h3>Fabric designs</h3>
<p>A <b>fabric</b> is a set of switches that act as one system, with an underlay that just provides IP reachability and an overlay that carries the actual user traffic.</p>
<ul><li><b>Spine-leaf (Clos)</b> in the data center: every leaf connects to every spine, and leaves never connect to each other. Any server is exactly two hops from any other (leaf, spine, leaf), so latency is predictable and you scale by adding spines (bandwidth) or leaves (ports). East-west traffic between servers dominates in a data center, and spine-leaf is built for it.</li>
<li><b>SD-Access</b> in the campus: a routed underlay with a LISP control plane and a VXLAN data plane, managed from Catalyst Center. Lesson 1.4 covers it.</li></ul>
<div class="viz" id="viz-spineleaf"></div>
<h3>On-premises, cloud and hybrid</h3>
<ul><li><b>On-premises</b>: you own the hardware and control everything, with capital cost and a refresh cycle.</li>
<li><b>Public cloud</b>: IaaS, PaaS and SaaS on someone else's infrastructure, paid as you go. You still own security <i>in</i> the cloud (the shared responsibility model).</li>
<li><b>Hybrid</b>: some workloads stay on-premises and some run in the cloud, joined by IPsec VPN, a dedicated interconnect (AWS Direct Connect, Azure ExpressRoute) or SD-WAN cloud on-ramps.</li>
<li><b>Multicloud</b>: more than one public cloud provider, often to avoid lock-in or to use each provider's strengths.</li></ul>
<div class="viz" id="viz-cloudfit"></div>
<div class="tip"><b>Exam tip.</b> "Lots of server-to-server traffic, predictable latency, scale out" means spine-leaf. "Small site, cost matters" means collapsed core. "Core layer" answers never include user-facing features or complex policy.</div>`},
{id:"ha",num:"1.2",title:"High availability: redundancy, FHRP and SSO",html:`
<p>High availability means removing single points of failure and making the recovery fast enough that users don't notice. ENCOR asks about three layers of it.</p>
<h3>Redundancy</h3>
<ul><li><b>Device redundancy</b>: two distribution switches, two core switches, two WAN routers.</li>
<li><b>Link redundancy</b>: dual uplinks, ideally bundled with EtherChannel so they behave like one link.</li>
<li><b>Path redundancy</b>: equal-cost multipath (ECMP) in a routed design means a failed link just removes one path. Routing protocols reconverge; with BFD that can take under a second.</li>
<li><b>Power and supervisor redundancy</b>: dual power supplies, and in chassis switches, dual supervisor engines.</li></ul>
<h3>First-hop redundancy protocols</h3>
<p>Hosts have one default gateway. An FHRP lets two or more routers share a <b>virtual IP and virtual MAC</b> so the gateway survives the loss of one router.</p>
<table><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (RFC 5798 for v3)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / Standby</td><td>Master / Backup</td><td>AVG plus up to 4 AVFs</td></tr>
<tr><td>Load sharing</td><td>Per group (use several groups)</td><td>Per group</td><td>Built in: AVG hands out different virtual MACs</td></tr>
<tr><td>Preempt default</td><td>Off</td><td>On</td><td>Off for AVG, on for AVF</td></tr>
<tr><td>Virtual MAC</td><td>v1 0000.0c07.acXX, v2 0000.0c9f.fXXX</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Hellos to</td><td>v1 224.0.0.2, v2 224.0.0.102</td><td>224.0.0.18 (IP protocol 112)</td><td>224.0.0.102</td></tr>
<tr><td>Virtual IP</td><td>Must be unused</td><td>Can be a real interface IP (that router is the owner, priority 255)</td><td>Must be unused</td></tr></table>
<p>The highest priority wins (default 100); a tie goes to the highest IP address. <b>Object tracking</b> lowers a router's priority when something it depends on fails, such as its WAN uplink. Tracking only causes a failover if the other router has <b>preempt</b> on, so it can take over when its priority becomes the higher one.</p>
<div class="viz" id="viz-fhrp"></div>
<div class="viz" id="viz-hsrpmini"></div>
<h3>SSO, NSF and NSR</h3>
<ul><li><b>Stateful Switchover (SSO)</b>: in a chassis with two supervisors (or a StackWise stack), the standby supervisor keeps a synchronized copy of the configuration and Layer 2 state. If the active one fails, the standby takes over and keeps forwarding packets, because the hardware forwarding tables (the FIB) stay programmed.</li>
<li><b>Nonstop Forwarding (NSF)</b>: the routing protocol side. The new supervisor has to rebuild its routing protocol sessions. With NSF (graceful restart), neighbors that are <b>NSF-aware</b> keep using the old routes instead of tearing down the adjacency while the restarting router resyncs.</li>
<li><b>Nonstop Routing (NSR)</b>: the standby also keeps the routing protocol state, so the neighbors never notice the switchover at all and don't need to be NSF-aware.</li></ul>
<div class="viz" id="viz-sso"></div>
<div class="tip"><b>Exam tip.</b> SSO keeps forwarding. NSF is how routing protocols survive the switchover with help from their neighbors. "Doesn't need neighbor help" is NSR. FHRP protects the gateway for hosts, not the router itself.</div>`},
{id:"sdwan",num:"1.3",title:"Catalyst SD-WAN: control plane, data plane, benefits and limits",html:`
<p>Cisco Catalyst SD-WAN (formerly Viptela) replaces a WAN of individually configured routers with centrally managed policy over any transport: MPLS, broadband internet, LTE/5G.</p>
<h3>The components</h3>
<table><tr><th>Component</th><th>Old name</th><th>Plane</th><th>Job</th></tr>
<tr><td><b>SD-WAN Manager</b></td><td>vManage</td><td>Management</td><td>The GUI and API: templates, policies, monitoring, software upgrades. One place to configure the whole WAN.</td></tr>
<tr><td><b>SD-WAN Controller</b></td><td>vSmart</td><td>Control</td><td>The brain. Runs <b>OMP</b> (Overlay Management Protocol) with every edge, collects their routes and TLOCs, applies control policy, and reflects the results back. It never forwards user traffic.</td></tr>
<tr><td><b>SD-WAN Validator</b></td><td>vBond</td><td>Orchestration</td><td>The first contact. Authenticates new devices, tells them where the controllers and managers are, and helps devices behind NAT find each other. Needs a public IP.</td></tr>
<tr><td><b>WAN Edge</b></td><td>vEdge / cEdge</td><td>Data</td><td>The routers at each site (Catalyst 8000, ISR, or cloud virtual routers). They build <b>IPsec tunnels</b> to each other and forward user traffic.</td></tr></table>
<div class="viz" id="viz-sdwanparts"></div>
<h3>How it works</h3>
<ul><li>Each WAN Edge connects to the controllers over <b>DTLS or TLS</b> control connections, authenticated with certificates.</li>
<li><b>OMP</b> carries three kinds of routes: <b>OMP routes</b> (the site's prefixes), <b>TLOC routes</b> (Transport Locators: system IP, color such as mpls or biz-internet, and encapsulation) and <b>service routes</b> (firewalls and other services).</li>
<li>The data plane is an <b>IPsec mesh</b> between TLOCs. Edges measure each tunnel with <b>BFD</b> probes, tracking loss, latency and jitter.</li>
<li><b>Application-aware routing</b> uses those measurements: "send Webex over whichever transport currently meets 150 ms latency and 2% loss, otherwise fail over."</li>
<li><b>Zero-touch provisioning (ZTP / PnP)</b>: a new router ships to a branch, gets an address, contacts the PnP portal, learns its Validator, and downloads its configuration from Manager. No engineer on site.</li></ul>
<div class="viz" id="viz-ztp"></div>
<h3>Benefits and limitations</h3>
<ul><li><b>Benefits</b>: transport independence (cheap internet next to or instead of MPLS), central policy, app-aware path selection, encryption everywhere, faster branch rollout, direct cloud and SaaS access (Cloud OnRamp) instead of backhauling through the data center.</li>
<li><b>Limitations</b>: controllers are critical infrastructure (edges keep forwarding for a while if they lose them, but no policy changes are possible), a new skill set and license model, IPsec overhead on small links, and internet transports have no SLA, so performance depends on the path the ISP picks.</li></ul>
<div class="viz" id="viz-sdwanq"></div>
<div class="tip"><b>Exam tip.</b> Orchestration = Validator (vBond). Control plane = Controller (vSmart) with OMP. Management = Manager (vManage). Data plane = WAN Edge with IPsec and BFD.</div>`},
{id:"sda",num:"1.4",title:"SD-Access: fabric roles, LISP, VXLAN and TrustSec",html:`
<p>SD-Access is Cisco's campus fabric, configured and monitored from <b>Catalyst Center</b> (formerly DNA Center), with <b>ISE</b> providing identity and policy.</p>
<h3>The layers</h3>
<ul><li><b>Underlay</b>: the physical network. A routed design (usually IS-IS, built automatically by LAN Automation) whose only job is IP reachability between fabric devices' loopbacks.</li>
<li><b>Overlay</b>: virtual networks on top. Endpoint traffic is carried in VXLAN tunnels between fabric devices, so it doesn't matter where in the underlay a user plugs in.</li></ul>
<h3>Control plane, data plane, policy plane</h3>
<table><tr><th>Plane</th><th>Technology</th><th>What it does</th></tr>
<tr><td>Control</td><td><b>LISP</b></td><td>The control plane node is a LISP map server and resolver. It keeps the host tracking database: which endpoint (EID) is behind which fabric switch (RLOC).</td></tr>
<tr><td>Data</td><td><b>VXLAN</b></td><td>Encapsulates the original Ethernet frame in UDP (port 4789). The VXLAN header carries the VN (as a VNI) and, in Cisco's VXLAN-GPO format, the user's <b>Scalable Group Tag</b>.</td></tr>
<tr><td>Policy</td><td><b>TrustSec / SGT</b></td><td>Users and devices get a group tag at login (Employees, Contractors, Cameras). Policy is written group to group in ISE, independent of IP addresses.</td></tr></table>
<h3>Fabric roles</h3>
<ul><li><b>Control plane node</b>: the LISP map server/resolver.</li>
<li><b>Fabric edge node</b>: the access switch. It registers connected endpoints with the control plane node, is the <b>anycast default gateway</b> for every VN (the same gateway IP and MAC exists on every edge, so users roam without changing gateway), and encapsulates traffic in VXLAN.</li>
<li><b>Fabric border node</b>: the exit to outside networks. An <b>internal border</b> connects to known networks such as the data center; an <b>external border</b> is the default exit to the internet or WAN.</li>
<li><b>Fabric WLC and fabric APs</b>: wireless joins the fabric so wired and wireless users get the same policy.</li>
<li><b>Intermediate nodes</b>: plain underlay routers that just forward IP. They don't know about the overlay at all.</li></ul>
<div class="viz" id="viz-sdaroles"></div>
<h3>Segmentation: macro and micro</h3>
<ul><li><b>Virtual networks (VNs)</b> are VRFs: macro-segmentation. Traffic in different VNs can't talk unless it leaves the fabric through a border and a firewall or fusion router.</li>
<li><b>Scalable groups (SGTs)</b> inside a VN: micro-segmentation. Two cameras in the same VN and subnet can still be blocked from each other by group policy.</li></ul>
<div class="viz" id="viz-sdaflow"></div>
<h3>Traditional campus interoperating with SD-Access</h3>
<p>You rarely convert a whole campus overnight. The fabric border connects to the traditional network with normal routing (BGP or static) per VN, often through a <b>fusion router</b> that leaks routes between VNs and shared services like DHCP and DNS. <b>Layer 2 border handoff</b> lets a traditional VLAN and a fabric subnet share one IP subnet during migration, so hosts can move a few at a time.</p>
<div class="viz" id="viz-sdaq"></div>
<div class="tip"><b>Exam tip.</b> SD-Access: LISP control plane, VXLAN data plane, TrustSec policy plane, IS-IS underlay. SD-WAN: OMP control plane, IPsec data plane. Don't mix them up.</div>`},
{id:"qos",num:"1.5",title:"QoS: classification, marking, queuing, policing and shaping",html:`
<p>QoS can't create bandwidth. It decides <b>who suffers first</b> when a link is congested. The v1.2 blueprint asks you to <b>interpret QoS configurations</b>, so you need to read an MQC policy and say what it does.</p>
<h3>Why traffic needs it</h3>
<table><tr><th>Traffic</th><th>Latency (one way)</th><th>Jitter</th><th>Loss</th><th>Typical DSCP</th></tr>
<tr><td>Voice</td><td>&le; 150 ms</td><td>&le; 30 ms</td><td>&le; 1%</td><td>EF (46)</td></tr>
<tr><td>Interactive video</td><td>&le; 150 ms</td><td>&le; 30 ms</td><td>&le; 1%</td><td>AF41 (34)</td></tr>
<tr><td>Call signaling</td><td colspan="3">Small and bursty, but must not be dropped</td><td>CS3 (24)</td></tr>
<tr><td>Transactional data</td><td colspan="3">Interactive apps, sensitive to delay</td><td>AF21 (18)</td></tr>
<tr><td>Bulk data</td><td colspan="3">Backups, file transfer: tolerant</td><td>AF11 (10)</td></tr>
<tr><td>Scavenger</td><td colspan="3">Less than best effort</td><td>CS1 (8)</td></tr>
<tr><td>Best effort</td><td colspan="3">Everything else</td><td>DF / 0</td></tr></table>
<h3>Classification and marking</h3>
<ul><li><b>Layer 2</b>: 802.1p <b>CoS</b>, 3 bits in the 802.1Q tag (0 to 7). Lost when the frame is routed.</li>
<li><b>Layer 3</b>: the <b>DSCP</b>, the top 6 bits of the IP ToS byte (0 to 63). It survives routing. The old IP Precedence is the top 3 bits of the same field.</li>
<li><b>Assured Forwarding (AFxy)</b>: x is the class (1 to 4, higher is better queue), y is drop probability (1 low, 3 high). DSCP value = 8x + 2y. AF41 = 34, AF31 = 26, AF13 = 14.</li>
<li><b>Class Selector (CSx)</b> = 8x, matching old IP Precedence. CS3 = 24, CS6 = 48 (routing protocols).</li>
<li><b>Trust boundary</b>: the point where you start believing markings. Usually the access port, extended to a Cisco IP phone with <code>trust device cisco-phone</code>. Anything a PC marks itself should be re-marked.</li></ul>
<div class="viz" id="viz-dscp"></div>
<h3>Queuing and congestion avoidance</h3>
<ul><li>Queuing only matters when the egress interface is congested. Packets wait in software queues, and the scheduler decides which queue sends next.</li>
<li><b>CBWFQ</b> (Class-Based Weighted Fair Queuing): each class gets a guaranteed minimum share, set with <code>bandwidth</code> or <code>bandwidth percent</code>. Classes can use more if it's free.</li>
<li><b>LLQ</b> (Low Latency Queuing): a strict-priority queue added to CBWFQ with <code>priority</code>. It always sends first, so it's for voice and interactive video, and it is <b>implicitly policed</b> to its configured rate during congestion so it can't starve the others.</li>
<li><b>WRED</b> (<code>random-detect</code>): drops a few TCP packets early as a queue fills, so TCP flows slow down gradually instead of all at once (avoiding <b>tail drop</b> and global synchronization). With <code>dscp-based</code>, it drops AFx3 before AFx1.</li></ul>
<div class="viz" id="viz-queue"></div>
<h3>Policing vs shaping</h3>
<table><tr><th></th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Dropped or re-marked immediately</td><td>Buffered and sent later</td></tr>
<tr><td>Direction</td><td>Inbound or outbound</td><td>Outbound only</td></tr>
<tr><td>Effect</td><td>No added delay, but TCP retransmits</td><td>Adds delay, smooth output</td></tr>
<tr><td>Typical use</td><td>Provider edge enforcing a contract, CoPP, scavenger limits</td><td>Customer edge sending to a provider that polices, sub-rate Ethernet WAN</td></tr></table>
<p>Both use a token bucket: the <b>CIR</b> is the average rate, <b>Bc</b> the committed burst, and the time interval Tc = Bc / CIR.</p>
<div class="viz" id="viz-polshape"></div>
<h3>Reading MQC</h3>
<p>The Modular QoS CLI has three parts: a <code>class-map</code> says <b>what</b> traffic (match-all needs every match, match-any needs one), a <code>policy-map</code> says <b>what to do</b> to each class, and <code>service-policy</code> says <b>where</b> (an interface and a direction). Anything that matches no class lands in <code>class-default</code>. Queuing actions (priority, bandwidth, shape, fair-queue) only work <b>outbound</b>.</p>
<pre class="term">class-map match-any VOICE
 match dscp ef
policy-map WAN-EDGE
 class VOICE
  priority percent 10
 class class-default
  fair-queue
policy-map SHAPE-50M
 class class-default
  shape average 50000000
  service-policy WAN-EDGE
interface GigabitEthernet0/0/0
 service-policy output SHAPE-50M</pre>
<p>That is a <b>hierarchical</b> (parent/child) policy: the parent shapes everything to 50 Mbps to match the provider's contract, which creates congestion at 50 Mbps instead of at 1 Gbps, and the child queues inside that shaped rate so voice still goes first.</p>
<div class="viz" id="viz-mqcread"></div>
<div class="viz" id="viz-qosmini"></div>
<div class="tip"><b>Exam tip.</b> If a question shows <code>bandwidth</code> or <code>priority</code> applied <code>input</code>, it's wrong. A percentage in <code>priority percent</code> is a limit during congestion, not a guarantee of more.</div>`},
{id:"switching",num:"1.6",title:"Forwarding: process switching, CEF, RIB, FIB, CAM and TCAM",html:`
<p>A router has two jobs: work out the best paths (the control plane) and move packets (the data plane). How fast it moves packets depends on how much work each packet needs.</p>
<h3>Switching methods</h3>
<ul><li><b>Process switching</b>: the CPU looks up every packet in the routing table. Slow, used only for packets the hardware can't handle (packets to the router itself, some exceptions).</li>
<li><b>Fast switching</b> (historic): the first packet of a flow is process switched, then the result is cached for the next ones. Caches went stale and broke when routes changed a lot.</li>
<li><b>Cisco Express Forwarding (CEF)</b>: the default. Instead of a cache built from traffic, it builds two tables in advance from the routing table, so every packet is looked up directly.</li></ul>
<h3>The tables</h3>
<table><tr><th>Table</th><th>Built from</th><th>Holds</th><th>Show</th></tr>
<tr><td><b>RIB</b> (routing table)</td><td>Routing protocols, static and connected routes</td><td>Best routes by AD and metric, often with a recursive next hop</td><td><code>show ip route</code></td></tr>
<tr><td><b>FIB</b></td><td>The RIB, with every next hop already resolved</td><td>Prefix to adjacency, ready for longest-match lookup</td><td><code>show ip cef</code></td></tr>
<tr><td><b>Adjacency table</b></td><td>ARP (and other Layer 2 resolution)</td><td>The full Layer 2 rewrite header for each next hop</td><td><code>show adjacency detail</code></td></tr>
<tr><td><b>CAM</b> (MAC address table)</td><td>Source MACs a switch learns</td><td>Exact-match MAC + VLAN to port</td><td><code>show mac address-table</code></td></tr>
<tr><td><b>TCAM</b></td><td>The FIB, ACLs, QoS policies</td><td>Value + mask + result. Matches with "don't care" bits in one lookup, so it handles longest prefix match and ACLs at line rate</td><td><code>show platform hardware fed switch active fwd-asic resource tcam utilization</code></td></tr></table>
<div class="viz" id="viz-cef"></div>
<p><b>Centralized vs distributed forwarding</b>: in a big chassis, the line cards can each hold a copy of the FIB (dCEF) and forward locally, instead of sending every packet to the supervisor. <b>Punted</b> traffic is traffic the hardware hands up to the CPU, which is exactly what CoPP (Module 5) protects.</p>
<div class="viz" id="viz-tables"></div>
<div class="tip"><b>Exam tip.</b> CAM is exact match (binary: 0 or 1). TCAM adds a third state, "don't care" (X), which is why ACLs and longest-prefix lookups use it. CEF = FIB + adjacency table, both built before traffic arrives.</div>`}
];

const G={
design:[["What are the three layers of the hierarchical campus model?","Access, distribution and core."],["Which layer is the policy and Layer 2/Layer 3 boundary in a traditional campus?","Distribution: SVIs, FHRP, ACLs and summarization toward the core."],["What should the core layer focus on?","Fast, highly available Layer 3 switching between blocks. No user ports or heavy policy."],["What is a collapsed core?","A two-tier design where distribution and core are merged into one pair of switches."],["When does a dedicated core layer become worth it?","When you have several distribution blocks (buildings), so you avoid a full mesh between them."],["Routed access: where is the default gateway?","On the access switch, with routed uplinks to distribution."],["Big advantage of routed access?","No STP on uplinks, both uplinks forward (ECMP), sub-second convergence."],["Limitation of routed access?","A VLAN can't span multiple access switches."],["What does StackWise Virtual do for the access layer?","Two distribution switches act as one, so access switches use a multichassis EtherChannel with nothing blocked and no FHRP needed."],["In spine-leaf, what connects to what?","Every leaf to every spine. Leaves never connect to leaves, spines never to spines."],["How many hops between two servers on different leaves?","Leaf, spine, leaf: always the same, so latency is predictable."],["How do you add bandwidth to a spine-leaf fabric?","Add spines."],["How do you add ports to a spine-leaf fabric?","Add leaves."],["What traffic pattern is spine-leaf built for?","East-west (server to server)."],["Underlay vs overlay?","The underlay is the physical IP network for reachability. The overlay carries user traffic in tunnels on top."],["What is hybrid cloud?","Some workloads on-premises and some in a public cloud, connected by VPN, a dedicated interconnect or SD-WAN."],["What is multicloud?","Using more than one public cloud provider."],["Shared responsibility model?","The provider secures the cloud; you secure what you put in it (data, identities, configuration)."],["Name two dedicated cloud interconnects.","AWS Direct Connect and Azure ExpressRoute."],["Which layer usually does QoS trust and marking for endpoints?","Access."]],
ha:[["What does an FHRP protect?","The hosts' default gateway, by sharing a virtual IP and MAC between routers."],["HSRP roles?","Active and Standby (others are Listen)."],["VRRP roles?","Master and Backup."],["HSRP default priority?","100. Highest wins, tie goes to the highest IP."],["HSRP preemption default?","Off. You must configure standby preempt."],["VRRP preemption default?","On."],["HSRP v1 virtual MAC?","0000.0c07.acXX, where XX is the group number in hex."],["HSRP v2 virtual MAC?","0000.0c9f.fXXX (groups 0 to 4095)."],["VRRP virtual MAC?","0000.5e00.01XX."],["HSRP v2 multicast address?","224.0.0.102."],["VRRP multicast address and protocol?","224.0.0.18, IP protocol 112."],["Which FHRP can use a real interface address as the virtual IP?","VRRP. The owner of the address gets priority 255."],["What makes GLBP different?","Built-in load balancing: the AVG answers ARP with different virtual MACs for up to 4 AVFs."],["What does object tracking do in an FHRP?","Lowers the router's priority when the tracked object (like an uplink) goes down."],["Why is tracking useless without preempt?","The peer with the now-higher priority can only take over if preempt is enabled on it."],["What is SSO?","Stateful Switchover: the standby supervisor keeps synced state and takes over with forwarding continuing."],["What is NSF?","Nonstop Forwarding / graceful restart: NSF-aware neighbors keep using routes while the restarting router resyncs its protocol sessions."],["What is NSR?","Nonstop Routing: the standby supervisor also holds routing protocol state, so neighbors don't notice and don't need to be NSF-aware."],["SSO keeps which table programmed in hardware?","The FIB, so packets keep flowing."],["What protocol speeds up link failure detection for routing protocols?","BFD (Bidirectional Forwarding Detection)."],["standby 1 track 1 decrement 20 does what?","Lowers HSRP group 1 priority by 20 while track object 1 is down."],["HSRP hello and hold defaults?","3 seconds and 10 seconds."]],
sdwan:[["Old name of SD-WAN Manager?","vManage."],["Old name of SD-WAN Controller?","vSmart."],["Old name of SD-WAN Validator?","vBond."],["Which SD-WAN component is the orchestrator and first point of contact?","The Validator (vBond)."],["Which component runs OMP with the edges?","The Controller (vSmart)."],["Does the SD-WAN Controller forward user traffic?","No. It's control plane only."],["What protocol carries routes in the SD-WAN overlay?","OMP, the Overlay Management Protocol."],["What is a TLOC?","Transport Locator: system IP, color and encapsulation identifying a WAN Edge's transport attachment."],["Three OMP route types?","OMP routes (prefixes), TLOC routes and service routes."],["Data plane tunnels between WAN Edges use?","IPsec."],["What measures loss, latency and jitter on each SD-WAN tunnel?","BFD probes."],["Application-aware routing?","Picks the transport per application based on live loss, latency and jitter against an SLA class."],["Control connections from edges to controllers use?","DTLS (default) or TLS, with certificates."],["Why does the Validator need a public IP?","Edges must reach it first, and it helps them discover each other through NAT."],["Zero-touch provisioning in SD-WAN?","A new router contacts PnP, learns its Validator, and pulls its config from Manager with no engineer on site."],["What is a TLOC color?","A label for the transport, such as mpls, biz-internet or lte."],["Cloud OnRamp?","SD-WAN features for optimized direct access to SaaS and IaaS instead of backhauling through the data center."],["One limitation of SD-WAN over internet transports?","No end-to-end SLA; performance depends on ISP paths."],["Which component holds templates and the GUI?","SD-WAN Manager."],["If edges lose the controllers, what happens?","They keep forwarding on the last known state for a while, but no policy or route changes."]],
sda:[["SD-Access control plane protocol?","LISP."],["SD-Access data plane encapsulation?","VXLAN (UDP 4789)."],["SD-Access policy plane?","Cisco TrustSec with Scalable Group Tags."],["Typical SD-Access underlay routing protocol?","IS-IS, built by LAN Automation."],["What is the control plane node?","The LISP map server/resolver holding the host tracking database (EID to RLOC)."],["What is an EID?","Endpoint Identifier: the endpoint's IP or MAC address."],["What is an RLOC?","Routing Locator: the fabric node's loopback address where the endpoint sits."],["What is a fabric edge node?","The access switch: registers endpoints, is the anycast gateway, VXLAN-encapsulates traffic."],["What is the anycast gateway?","The same gateway IP and MAC on every fabric edge, so hosts roam without changing gateway."],["Internal vs external border?","Internal connects to known networks (data center); external is the default exit to unknown networks (internet/WAN)."],["What is an intermediate node?","An underlay router that just forwards IP and knows nothing about the overlay."],["What is a VN in SD-Access?","A virtual network, implemented as a VRF: macro-segmentation."],["Micro-segmentation in SD-Access uses?","Scalable Group Tags inside a VN."],["Where does the SGT travel in SD-Access?","In the VXLAN-GPO header."],["What manages SD-Access?","Catalyst Center (formerly DNA Center)."],["Which product supplies identity and group policy?","Cisco ISE."],["What is a fusion router?","A router outside the fabric that leaks routes between VNs and shared services like DHCP and DNS."],["What is Layer 2 border handoff for?","Letting a traditional VLAN and a fabric subnet share an IP subnet during migration."],["What does VXLAN VNI identify?","The virtual network segment (Layer 2 or Layer 3 VN)."],["How many bits is the VNI?","24 bits, about 16 million segments."]],
qos:[["Can QoS add bandwidth?","No. It decides which traffic suffers when there isn't enough."],["Voice one-way latency target?","150 ms or less."],["Voice jitter and loss targets?","30 ms or less, 1% or less."],["DSCP for voice?","EF, 46."],["DSCP for interactive video?","AF41, 34."],["DSCP for call signaling?","CS3, 24."],["DSCP for scavenger?","CS1, 8."],["Formula for AFxy DSCP?","8x + 2y. AF31 = 26."],["Which AF is dropped first within a class?","AFx3 (high drop probability)."],["CoS lives where and how many bits?","In the 802.1Q tag, 3 bits (0 to 7)."],["DSCP lives where and how many bits?","Top 6 bits of the IP ToS byte (0 to 63)."],["Why is DSCP preferred over CoS end to end?","CoS is lost when the frame is routed; DSCP stays in the IP header."],["What is a trust boundary?","Where the network starts believing packet markings, usually the access port or the IP phone."],["What does trust device cisco-phone do?","Trusts markings only when a Cisco phone is detected via CDP."],["CBWFQ provides?","A guaranteed minimum bandwidth per class."],["LLQ adds?","A strict-priority queue for delay-sensitive traffic."],["Why is the LLQ policed?","So it can't starve other queues during congestion."],["What does WRED do?","Drops some TCP packets early as a queue fills to avoid tail drop and global synchronization."],["Policing vs shaping on excess traffic?","Policing drops or re-marks it. Shaping buffers and delays it."],["Can you shape inbound?","No, shaping is outbound only."],["Where is policing typically used?","Provider edges, CoPP, rate-limiting classes like scavenger."],["Where is shaping typically used?","Customer edge sending to a provider that polices at a sub-rate."],["MQC: what does a class-map do?","Defines which traffic belongs to a class."],["match-all vs match-any?","match-all needs every match statement; match-any needs at least one."],["What catches traffic that matches no class?","class-default."],["What does service-policy do?","Attaches a policy-map to an interface in a direction."],["Why use a hierarchical shaping policy?","The parent shapes to the contracted rate so congestion happens where the child queuing can act."],["Which direction do queuing actions work in?","Output only."],["Token bucket: CIR, Bc, Tc?","CIR average rate, Bc committed burst, Tc = Bc / CIR."],["IP Precedence is how many bits?","3, the top bits of the same ToS byte, matching CSx values."]],
switching:[["What is process switching?","The CPU looks up each packet in the routing table. Slowest."],["Default switching method on Cisco IOS?","CEF, Cisco Express Forwarding."],["What two tables make up CEF?","The FIB and the adjacency table."],["What is the FIB built from?","The RIB, with recursive next hops already resolved."],["What does the adjacency table hold?","The prebuilt Layer 2 rewrite header for each next hop, from ARP."],["Command to view the FIB?","show ip cef."],["Command to view adjacencies?","show adjacency detail."],["What is the CAM table?","The MAC address table: exact match of MAC + VLAN to a port."],["What does TCAM add?","A third match state, don't care, so it can do longest-prefix and ACL matches in one lookup."],["Name three things stored in TCAM.","FIB entries, ACL entries and QoS classification entries."],["Why was fast switching replaced?","Its demand-built cache went stale and caused slow first packets when routes changed."],["What is dCEF?","Distributed CEF: line cards hold their own FIB and forward locally."],["What is a punted packet?","One the hardware sends up to the CPU, such as traffic to the router itself."],["RIB contains?","Best routes chosen by AD and metric, from every routing source."],["What happens if TCAM space runs out?","Entries may not be programmed, and traffic can be punted to the CPU or dropped."]]
};
const DECKS=[["design","Network design"],["ha","High availability"],["sdwan","Catalyst SD-WAN"],["sda","SD-Access"],["qos","QoS"],["switching","Forwarding and tables"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"A company has a single office building with 12 access switches. Which design is most cost-effective?",o:["Two-tier collapsed core","Three-tier with a dedicated core","Spine-leaf fabric","Full mesh of access switches"],a:0,e:"One building doesn't need a separate core layer."},
{q:"Which layer should NOT host user-facing features such as port security?",o:["Core","Access","Distribution","None, all layers should"],a:0,e:"The core is for fast, reliable transport only."},
{q:"Where is the Layer 2/Layer 3 boundary in a traditional three-tier campus?",o:["Distribution","Access","Core","WAN edge"],a:0,e:"SVIs and FHRPs live on the distribution pair."},
{q:"What is the main benefit of routed access over Layer 2 access?",o:["No STP on uplinks and both uplinks forward with ECMP","VLANs can span the whole campus","No routing protocol is needed","It removes the need for IP addressing"],a:0,e:"Routed uplinks converge fast and use both paths."},
{q:"In a spine-leaf data center, a leaf switch connects to:",o:["Every spine","Every other leaf","One spine only","The internet directly"],a:0,e:"Full mesh between the layers, never within a layer."},
{q:"A data center's traffic is mostly between servers. Which design suits it?",o:["Spine-leaf","Collapsed core","Hub and spoke","Ring"],a:0,e:"Spine-leaf is optimized for east-west traffic."},
{q:"Two distribution switches run StackWise Virtual. What is true for access switches?",o:["They connect with a multichassis EtherChannel and nothing blocks","They need HSRP on each VLAN, with one switch active and one standby","STP blocks one uplink","They must use routed access"],a:0,e:"The pair appears as one switch."},
{q:"Which statement about the shared responsibility model is correct?",o:["The customer secures their data and configuration in the cloud","The provider is responsible for everything","The customer patches the provider's hypervisors","Security is not needed in SaaS"],a:0,e:"The provider secures the cloud itself; you secure what you put in it."},
{q:"Which HSRP setting is required for a tracked failover to move the active role?",o:["Preempt on the router that should take over","A higher hello timer","HSRP version 2","Authentication"],a:0,e:"Without preempt the new higher-priority router stays standby."},
{q:"R1 is HSRP active with priority 110 and tracks its uplink with decrement 20. R2 has priority 100 and preempt. The uplink fails. What happens?",o:["R1 drops to 90 and R2 becomes active","Nothing changes","R1 drops to 90 but stays active","Both become active"],a:0,e:"90 < 100 and R2 preempts."},
{q:"What is the VRRP virtual MAC for group 10?",o:["0000.5e00.010a","0000.0c07.ac0a","0000.0c9f.f00a","0007.b400.0a01"],a:0,e:"VRRP uses 0000.5e00.01XX with the group in hex."},
{q:"Which FHRP load-balances one group across several routers by handing out different virtual MACs?",o:["GLBP","HSRP","VRRP","CARP"],a:0,e:"The AVG assigns virtual MACs from the AVFs."},
{q:"Which FHRP is an open standard?",o:["VRRP","HSRP","GLBP","HSRPv2"],a:0,e:"VRRP is IETF; HSRP and GLBP are Cisco."},
{q:"What does SSO provide on a dual-supervisor chassis?",o:["The standby takes over with synchronized state while forwarding continues","Two active supervisors sharing load","Automatic routing protocol restart on neighbors","A faster boot"],a:0,e:"Stateful Switchover keeps the hardware forwarding."},
{q:"Which feature requires NSF-aware neighbors?",o:["NSF (graceful restart)","NSR (nonstop routing)","SSO only","HSRP"],a:0,e:"Neighbors keep routes while the router restarts its sessions."},
{q:"Which feature keeps routing protocol state on the standby supervisor so neighbors never notice?",o:["NSR","NSF","GLBP","BFD"],a:0,e:"Nonstop Routing."},
{q:"Which SD-WAN component authenticates new edges and helps with NAT traversal?",o:["SD-WAN Validator","SD-WAN Controller","SD-WAN Manager","WAN Edge"],a:0,e:"The Validator (vBond) orchestrates."},
{q:"Which SD-WAN component distributes routes and policy with OMP?",o:["SD-WAN Controller","SD-WAN Validator","SD-WAN Manager","Catalyst Center"],a:0,e:"The Controller (vSmart)."},
{q:"What carries user traffic between SD-WAN sites?",o:["IPsec tunnels between WAN Edges","DTLS tunnels to the controller","OMP sessions","GRE through vManage"],a:0,e:"The data plane is an IPsec mesh between TLOCs."},
{q:"What does a TLOC identify?",o:["A WAN Edge's attachment to a transport","A user's VLAN on the service side of the edge","An OMP policy","A certificate"],a:0,e:"System IP + color + encapsulation."},
{q:"How does SD-WAN application-aware routing pick a path?",o:["From BFD measurements of loss, latency and jitter against an SLA","By lowest hop count","By the cheapest transport only","Randomly per flow"],a:0,e:"BFD runs on every tunnel."},
{q:"Which is a limitation of SD-WAN over broadband internet?",o:["No end-to-end SLA from the ISP","No encryption","Can't use certificates","Doesn't support branch sites"],a:0,e:"Internet paths are best effort."},
{q:"What is the SD-Access control plane?",o:["LISP","OMP","VXLAN","IS-IS"],a:0,e:"LISP map server/resolver."},
{q:"What is the SD-Access data plane?",o:["VXLAN","LISP","IPsec","MPLS"],a:0,e:"VXLAN encapsulation between fabric nodes."},
{q:"Which SD-Access node acts as the anycast default gateway?",o:["Fabric edge node","Control plane node","Border node","Intermediate node"],a:0,e:"Every edge hosts the same gateway IP and MAC."},
{q:"Which SD-Access node connects the fabric to the internet as the default exit?",o:["External border","Internal border","Control plane node","Fabric edge"],a:0,e:"External border handles unknown destinations."},
{q:"Two IP cameras are in the same VN and subnet. How can SD-Access stop them from talking to each other?",o:["Scalable group policy (SGTs)","Put them in a different VRF only","It can't","Static ARP"],a:0,e:"Micro-segmentation inside a VN."},
{q:"Which device holds the LISP host tracking database?",o:["Control plane node","Fabric edge","External border","Catalyst Center"],a:0,e:"EID to RLOC mappings live there."},
{q:"What does an intermediate node in SD-Access know about the overlay?",o:["Nothing, it just routes IP in the underlay","All EID-to-RLOC mappings for the fabric","SGT policy","VN membership"],a:0,e:"It forwards VXLAN packets as normal IP."},
{q:"What is the DSCP value of AF31?",o:["26","24","30","34"],a:0,e:"8x3 + 2x1 = 26."},
{q:"Which AF value has the highest drop probability in class 2?",o:["AF23","AF21","AF22","AF12"],a:0,e:"y=3 is high drop."},
{q:"Which marking survives being routed across several hops?",o:["DSCP","CoS","Both are lost","802.1p only"],a:0,e:"CoS is in the Layer 2 tag."},
{q:"What does LLQ add to CBWFQ?",o:["A strict-priority queue","Random early drop","Shaping","Marking"],a:0,e:"Priority queue for voice and video."},
{q:"A policy-map with 'bandwidth percent 30' is applied 'service-policy input'. What happens?",o:["It's rejected: queuing works outbound only","It guarantees 30% inbound","It polices to 30%","It shapes to 30%"],a:0,e:"Queuing actions need output."},
{q:"Which mechanism buffers excess traffic instead of dropping it?",o:["Shaping","Policing","WRED","Marking"],a:0,e:"Shaping delays packets."},
{q:"A provider polices your 1 Gbps handoff to 100 Mbps. What should you configure on your router?",o:["Shape outbound to 100 Mbps with queuing inside it","Police inbound to 100 Mbps","Nothing","WRED only"],a:0,e:"Shape so you choose what waits, instead of the provider dropping at random."},
{q:"What does WRED prevent?",o:["Tail drop and TCP global synchronization","Jitter in the priority queue","Re-marking","Shaping delay"],a:0,e:"It drops early and selectively."},
{q:"Traffic doesn't match any class in a policy. Where does it go?",o:["class-default","It's dropped","The priority queue","The first class"],a:0,e:"Every policy has class-default."},
{q:"class-map match-all X has 'match dscp ef' and 'match access-group 101'. What matches?",o:["Packets that are EF AND permitted by ACL 101","Packets that are EF OR in ACL 101","Only ACL 101","Nothing, it's invalid"],a:0,e:"match-all needs every statement."},
{q:"Where should the trust boundary usually be?",o:["At the access port or IP phone","At the core","At the internet edge only","On the server"],a:0,e:"Mark as close to the source as you can trust."},
{q:"Which is the slowest switching method?",o:["Process switching","CEF","dCEF","Fast switching"],a:0,e:"The CPU handles every packet."},
{q:"CEF uses which two tables?",o:["FIB and adjacency table","RIB and CAM","ARP and MAC","TCAM and NetFlow"],a:0,e:"Both built ahead of traffic."},
{q:"What does TCAM add that CAM can't do?",o:["Don't-care bits for longest-prefix and ACL matching","Larger MAC address tables for high-density access switches","Spanning tree","Routing protocols"],a:0,e:"Ternary: 0, 1 or X."},
{q:"Which command shows the FIB?",o:["show ip cef","show ip route","show mac address-table","show arp"],a:0,e:"The CEF table is the FIB."},
{q:"Where does the adjacency table get its Layer 2 information?",o:["ARP","OSPF","CDP","STP"],a:0,e:"It holds the rewrite header for each next hop."},
{q:"Which traffic is punted to the CPU?",o:["Traffic addressed to the router, such as SSH and routing protocol packets","All transit traffic, so the CPU can apply policy before the forwarding table","Only multicast","Only IPv6"],a:0,e:"CoPP protects the CPU from it."},
{q:"An FHRP's virtual IP can be a router's own interface address in which protocol?",o:["VRRP","HSRP","GLBP","None"],a:0,e:"The address owner gets priority 255."},
{q:"Which statement about OMP is true?",o:["It runs between WAN Edges and SD-WAN Controllers","It runs between WAN Edges directly","It's a data plane protocol","It replaces IPsec"],a:0,e:"Controllers reflect routes like a route reflector."},
{q:"What protocol does SD-Access LAN Automation build for the underlay?",o:["IS-IS","OSPF","EIGRP","BGP"],a:0,e:"IS-IS by default."},
{q:"Interactive video should be marked:",o:["AF41","EF","CS1","AF11"],a:0,e:"AF41 (34)."}
];

registerModule({
  id:"arch",slug:"architecture",title:"Architecture",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["tiers","campus","spineleaf","cloudfit","fhrp","hsrpmini","sso","sdwanparts","ztp","sdwanq","sdaroles","sdaflow","sdaq","dscp","queue","polshape","mqcread","qosmini","cef","tables"],
  viz(){
revealViz($("#viz-tiers"),{title:"What each campus layer does",cols:3,done:"Explored the campus layers",items:[
  ["Access","Layer 1","Where endpoints connect. PoE, port security, 802.1X, BPDU Guard, PortFast, QoS trust and marking, voice VLANs."],
  ["Distribution","Layer 2","Aggregates access switches. Inter-VLAN routing, FHRP, summarization, ACL policy, the L2/L3 boundary."],
  ["Core","Layer 3","High-speed, redundant Layer 3 transport between distribution blocks, data center and WAN. Keep it simple."],
  ["Collapsed core","2-tier","Distribution and core in one switch pair. Good for one building or a small campus."],
  ["Routed access","Design","The L3 boundary moves to the access switch. Routed uplinks, ECMP, no STP between layers."],
  ["Services block","Design","A distribution pair dedicated to shared services like WLCs, ISE and DHCP, attached to the core."]]});

/* ---- campus builder with failure toggles ---- */
(function(){const el=$("#viz-campus");let mode="l2",fail=new Set();const seen=new Set();
  const modes={l2:"Layer 2 access + HSRP",ra:"Routed access",svl:"StackWise Virtual"};
  const links=[["D1","D2","dd"],["D1","A1","u1"],["D2","A1","u2"]];
  function verdict(){const d1=!fail.has("D1"),d2=!fail.has("D2"),u1=!fail.has("u1")&&d1,u2=!fail.has("u2")&&d2;
    if(!u1&&!u2)return ["bad","Users are cut off: both uplinks or both distribution switches are gone."];
    if(mode==="l2"){if(fail.size===0)return ["ok","STP blocks the A1-D2 uplink (one uplink idles). D1 is HSRP active and STP root. Half the uplink capacity is unused."];
      if(!u1)return ["ok","STP unblocks the D2 uplink (RSTP: about a second) and HSRP moves the gateway to D2 after the hold time (10 s by default, less with tuned timers)."];
      return ["ok","The blocked uplink failed, so nothing changes for users."]}
    if(mode==="ra"){if(fail.size===0)return ["ok","A1 is the gateway. OSPF installs two equal-cost routes up, so both uplinks carry traffic. No STP and no FHRP."];
      return ["ok","OSPF removes the failed path. With BFD that takes well under a second, and the other uplink was already forwarding."]}
    if(fail.size===0)return ["ok","D1 and D2 act as one logical switch. A1's two uplinks form one multichassis EtherChannel: both forward, STP sees one link, no FHRP."];
    return ["ok","The EtherChannel loses a member and keeps forwarding on the other. If a whole switch fails, SSO across the pair keeps the gateway up."]}
  function draw(){const P={D1:[150,50],D2:[450,50],A1:[300,175]};const [cls,txt]=verdict();
    let s="";links.forEach(([a,b,k])=>{if(mode==="ra"&&k==="dd")return;const down=fail.has(k)||fail.has(a)||fail.has(b);const blk=mode==="l2"&&k==="u2"&&!fail.has("u1")&&!fail.has("D1");
      s+=`<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" class="tp-l ${down?"down":blk?"blk":"up"}"/>`;
      if(k!=="dd")s+=`<g data-f="${k}" style="cursor:pointer"><circle cx="${(P[a][0]+P[b][0])/2}" cy="${(P[a][1]+P[b][1])/2}" r="11" class="${fail.has(k)?"stp-x":"s-node"}"/><text x="${(P[a][0]+P[b][0])/2}" y="${(P[a][1]+P[b][1])/2+4}" text-anchor="middle" class="s-small" style="font-size:10px">${fail.has(k)?"✕":k}</text></g>`});
    if(mode==="svl")s+=`<rect x="100" y="20" width="400" height="60" rx="14" fill="none" stroke="currentColor" stroke-dasharray="6 5" opacity=".5"/><text x="300" y="98" text-anchor="middle" class="s-small">one logical switch</text>`;
    Object.entries(P).forEach(([k,[x,y]])=>{s+=`<g data-f="${k==="A1"?"":k}" style="cursor:${k==="A1"?"default":"pointer"}"><rect x="${x-34}" y="${y-16}" width="68" height="32" rx="7" class="${fail.has(k)?"stp-x":"s-node"}"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b">${k}${fail.has(k)?" ✕":""}</text></g>`});
    el.innerHTML=`<div class="viz-title">Campus builder: break things and watch the design react</div>
    <div class="chips">${Object.entries(modes).map(([k,v])=>`<button class="chip" data-m="${k}" aria-pressed="${mode===k}">${v}</button>`).join("")}</div>
    <div class="viz-scroll"><svg viewBox="0 0 600 210" style="min-width:420px" role="img" aria-label="Two distribution switches and one access switch">${s}</svg></div>
    <div class="caption" aria-live="polite"><span class="${cls==="ok"?"status-good":"status-bad"}">${fail.size?"After the failure:":"Normal operation:"}</span> ${txt}</div>
    <div class="viz-controls"><button class="btn" data-a="clear">Repair everything</button><span class="grow s-small">Tap a switch or uplink to fail it. Try all three designs.</span></div>`}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),f=e.target.closest("[data-f]"),a=e.target.closest("[data-a]");
    if(m){mode=m.dataset.m;fail.clear()}else if(f&&f.dataset.f){const k=f.dataset.f;fail.has(k)?fail.delete(k):fail.add(k);if(fail.size)seen.add(mode)}else if(a)fail.clear();else return;
    draw();if(seen.size===3)award("viz:campus",20,"Broke all three campus designs")});
  draw()})();

stepViz($("#viz-spineleaf"),{title:"Building a spine-leaf fabric",done:"Built a spine-leaf fabric",steps:[
  ["Two spines, four leaves","Every leaf has one uplink to each spine. Leaves never connect to each other. Servers plug into leaves."],
  ["Underlay","Each link is a routed point-to-point link (OSPF, IS-IS or eBGP). Every leaf has two equal-cost paths to every other leaf: ECMP."],
  ["Predictable latency","Server A on Leaf1 to server B on Leaf4: Leaf1, any spine, Leaf4. Always three switches, whichever spine is chosen."],
  ["Spine fails","Each leaf loses half its uplink bandwidth but nothing else. ECMP just uses the remaining spine."],
  ["Scale out","Need more bandwidth? Add a spine and an uplink from every leaf. Need more ports? Add a leaf with links to every spine."],
  ["Overlay","VXLAN with an EVPN or LISP control plane stretches tenant networks across leaves without stretching STP."]],
  end:"Spine-leaf trades a big chassis core for many identical, cheaper boxes and equal paths."});

sortViz($("#viz-cloudfit"),{title:"On-premises, public cloud or hybrid?",bins:{onp:"On-premises",cloud:"Public cloud",hyb:"Hybrid"},done:"Placed every workload",items:[
  ["A factory's machine controllers that must keep running if the internet link fails","onp","Local control with no WAN dependency."],
  ["A seasonal web shop that needs 10x capacity in December","cloud","Elastic, pay for what you use."],
  ["Email and office apps as a subscription","cloud","SaaS."],
  ["Customer database stays in the company data center, analytics run in Azure over ExpressRoute","hyb","Both, connected by a private interconnect."],
  ["Disaster recovery copies of on-premises VMs replicated to AWS","hyb","Primary on-prem, DR in the cloud."],
  ["A lab of old hardware kept for legacy protocol testing","onp","Physical gear you control."]]});

revealViz($("#viz-fhrp"),{title:"HSRP, VRRP and GLBP side by side",cols:3,done:"Compared the three FHRPs",items:[
  ["HSRP","Cisco","Active/Standby. Priority 100, highest wins. Preempt off by default. v2 MAC 0000.0c9f.fXXX, hellos to 224.0.0.102. Load share with multiple groups."],
  ["VRRP","Open standard","Master/Backup. Preempt on by default. MAC 0000.5e00.01XX, IP protocol 112 to 224.0.0.18. VRRPv3 adds IPv6 and is configured with 'vrrp X address-family ipv4'."],
  ["GLBP","Cisco","One AVG answers ARP and hands out up to four virtual MACs, one per AVF, so every router forwards: load sharing inside one group."],
  ["Priority and tie","All","Highest priority wins (0 to 255). A tie goes to the highest interface IP."],
  ["Tracking","All","Decrement priority when an uplink, route or IP SLA fails, so a healthier router takes over (if preempt allows)."],
  ["Timers","HSRP","Hello 3 s, hold 10 s. Millisecond timers or BFD speed up failover."]]});

iosViz($("#viz-hsrpmini"),{title:"Mini lab: HSRP that follows the uplink",scenario:"D1 and D2 share the gateway 10.1.10.1 for VLAN 10. D1 should be active, but only while its uplink G0/0/0 to the core is up. D2 is already configured with priority 100 and preempt.",
  devices:[{name:"D1",kind:"router"},{name:"D2",kind:"router"},{name:"CORE",kind:"router"},{name:"SW1",kind:"switch"}],links:[["D1:g0/0/1","SW1:g1/0/1"],["D2:g0/0/1","SW1:g1/0/2"],["D1:g0/0/0","CORE:g0/0/0"],["D2:g0/0/0","CORE:g0/0/1"]],hosts:[{name:"PC1",ip:"10.1.10.50",gw:"10.1.10.1",at:"SW1:g1/0/5"}],
  boot:{D1:["hostname D1","interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.10.2 255.255.255.0","standby 10 ip 10.1.10.1","no shutdown"],D2:["hostname D2","interface g0/0/0","ip address 10.0.2.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.10.3 255.255.255.0","standby 10 ip 10.1.10.1","standby 10 preempt","no shutdown"],CORE:["hostname CORE","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.2.1 255.255.255.252","no shutdown"]},
  consoles:["D1"],startMode:"priv",topo:{CORE:[300,40],D1:[160,120],D2:[440,120],SW1:[300,200],PC1:[470,210]},topoH:240,
  events:[{label:"Fail D1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=true;return "CORE: interface G0/0/0 shut down"}},{label:"Restore D1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=false;return "CORE: interface G0/0/0 back up"}}],
  tasks:[{t:"Create track 1 for the line protocol of G0/0/0",hint:"configure terminal\ntrack 1 interface g0/0/0 line-protocol",check:(w,D)=>{const t=D.D1.tracks[1];return t&&t.type==="if"&&t.if===IOS.ifName("g0/0/0")}},
    {t:"Make D1 active: priority 110 and preempt on group 10",hint:"interface g0/0/1\nstandby 10 priority 110\nstandby 10 preempt",check:(w,D)=>fhrpState(w,"hsrp","D1","g0/0/1",10)==="Active",sticky:true},
    {t:"Lower the priority by 20 when track 1 goes down",hint:"standby 10 track 1 decrement 20",check:(w,D)=>{const c=D.D1.ifs[IOS.ifName("g0/0/1")].hsrp[10];return c&&(c.track||[]).some(x=>x.obj===1&&x.dec===20)}},
    {t:"Press 'Fail D1's uplink' and confirm with show standby brief that D1 is now standby",hint:"(press the button)\ndo show standby brief",check:(w,D,S)=>fhrpState(w,"hsrp","D1","g0/0/1",10)==="Standby"&&ranCmd(S,"D1",/sh\S* stan/i),sticky:true}],
  solution:"configure terminal\ntrack 1 interface g0/0/0 line-protocol\ninterface g0/0/1\nstandby 10 priority 110\nstandby 10 preempt\nstandby 10 track 1 decrement 20\n(press Fail D1's uplink)\ndo show standby brief",
  success:"110 minus 20 is 90, below D2's 100, and D2's preempt lets it take over. Restore the uplink and D1 preempts back."},"hsrpmini",40,"HSRP tracking mini lab");

stepViz($("#viz-sso"),{title:"A supervisor fails: SSO, NSF and NSR",done:"Walked through a supervisor switchover",steps:[
  ["Normal","Supervisor A is active, B is hot standby. With SSO, the configuration, interface state and Layer 2 tables are synced continuously."],
  ["A crashes","B takes over in a second or two. The line cards' FIB entries stay programmed, so transit packets keep flowing. That's SSO."],
  ["Routing protocols","B's OSPF and BGP processes start fresh. Without help, neighbors would see the sessions drop and flush every route learned from this router."],
  ["NSF / graceful restart","With NSF, B signals a graceful restart. NSF-aware neighbors keep the old routes and forwarding while B re-forms adjacencies and resyncs its database."],
  ["NSR instead","With NSR, B already had the routing protocol state, so the sessions never drop. Neighbors don't even need to support graceful restart."],
  ["Result","Users notice nothing. Without SSO/NSF the outage would be the time to boot, form adjacencies and converge: easily a minute."]]});

revealViz($("#viz-sdwanparts"),{title:"Catalyst SD-WAN components",cols:2,done:"Explored every SD-WAN component",items:[
  ["SD-WAN Manager","vManage · management","Single pane of glass. Templates, policy, monitoring, upgrades, REST API. Engineers work here."],
  ["SD-WAN Controller","vSmart · control","Runs OMP with every edge, applies control policy and reflects routes and TLOCs. No user traffic."],
  ["SD-WAN Validator","vBond · orchestration","First contact for new devices. Authenticates them, points them at the controllers, and helps with NAT traversal. Needs a public IP."],
  ["WAN Edge","vEdge / cEdge · data","Branch, hub and cloud routers. Build IPsec tunnels to each other, run BFD on every tunnel, forward traffic."],
  ["OMP","Protocol","Overlay Management Protocol over the DTLS/TLS control connections. Carries OMP routes, TLOC routes and service routes."],
  ["TLOC and color","Concept","How an edge attaches to a transport: system IP + color (mpls, biz-internet, lte) + encapsulation (IPsec)."]]});

stepViz($("#viz-ztp"),{title:"A new branch router comes online with zero touch",done:"Followed SD-WAN zero-touch provisioning",steps:[
  ["Unbox","A Catalyst 8200 arrives at the branch. Someone plugs in power and the internet cable. That's all they do."],
  ["Get an address","It gets an IP with DHCP and finds DNS."],
  ["Find its organization","It contacts the Cisco Plug and Play portal, which knows its serial number and returns the address of the organization's SD-WAN Validator."],
  ["Authenticate","It builds a DTLS connection to the Validator. Both sides check certificates and the serial number against the allowed device list."],
  ["Meet the controllers","The Validator tells it where the SD-WAN Manager and Controllers are. It connects to them."],
  ["Download config","Manager pushes the device template: addressing, VPNs, policies."],
  ["Join the overlay","OMP with the Controllers brings routes and TLOCs. IPsec tunnels and BFD sessions come up to the other sites. The branch is live."]]});

quizViz($("#viz-sdwanq"),{title:"Which SD-WAN piece is it?",done:"Named every SD-WAN role",qs:[
  ["Which component would you open to push a new QoS template to 200 branches?",["SD-WAN Manager","SD-WAN Controller","SD-WAN Validator","A WAN Edge"],0,"Manager is the management plane."],
  ["Webex traffic moves from MPLS to internet because MPLS loss jumped to 4%. What measured that?",["BFD on the tunnels","OMP","The Validator","SNMP polling"],0,"BFD probes feed app-aware routing."],
  ["A branch is behind a home-style NAT router. Which component helps it build tunnels?",["SD-WAN Validator","SD-WAN Manager","Catalyst Center","ISE"],0,"The Validator helps with NAT traversal."],
  ["Which component decides that branches may only build tunnels to the hubs (hub and spoke)?",["SD-WAN Controller with a control policy","WAN Edge","Validator","DNS"],0,"Control policy filters TLOCs advertised through OMP."],
  ["What protects user traffic between two branches?",["IPsec","DTLS","OMP","Nothing"],0,"The data plane is IPsec."]]});

revealViz($("#viz-sdaroles"),{title:"SD-Access fabric roles",cols:3,done:"Explored every SD-Access role",items:[
  ["Control plane node","LISP MS/MR","Keeps the host tracking database: endpoint (EID) to fabric node (RLOC). Edges register and query it."],
  ["Fabric edge","Access switch","Connects endpoints, registers them, is the anycast gateway for each VN, applies SGT policy, VXLAN-encapsulates."],
  ["Border node","Exit","Connects the fabric to outside networks. Internal border: known networks. External border: the default route out."],
  ["Intermediate node","Underlay","Plain IP routing between fabric nodes. Doesn't know VNs or SGTs."],
  ["Catalyst Center","Management","Designs, provisions and monitors the fabric, and runs LAN Automation to build the IS-IS underlay."],
  ["ISE","Policy","Authenticates users and devices, assigns their SGT, and holds the group-to-group policy matrix."]]});

seqViz($("#viz-sdaflow"),{title:"A laptop on Edge1 reaches a server behind Edge2",left:"Edge1",right:"Control plane",done:"Followed an SD-Access packet",intro:"The laptop is in VN CORP with SGT Employees. The server is in the same VN on Edge2.",steps:[
  {dir:"r",label:"Register laptop EID",sub:"10.10.1.20 at RLOC Edge1",text:"When the laptop connects and authenticates, Edge1 registers its address with the control plane node."},
  {dir:"r",label:"Map-request for server",sub:"Where is 10.10.2.50?",text:"The laptop sends to its anycast gateway on Edge1. Edge1 doesn't know where the server is, so it asks the control plane node."},
  {dir:"l",label:"Map-reply",sub:"10.10.2.50 is at Edge2",text:"The control plane node answers with Edge2's RLOC. Edge1 caches the mapping."},
  {dir:"r",label:"VXLAN to Edge2",sub:"VNI = CORP, SGT = Employees",dash:true,text:"Edge1 wraps the frame in VXLAN with the VN and SGT and sends it over the underlay to Edge2's loopback. Intermediate nodes just route it."},
  {dir:"l",label:"Policy check on Edge2",sub:"Employees → Servers: permit",text:"Edge2 decapsulates, reads the SGT and checks the group policy downloaded from ISE before delivering the packet."}],
  end:"LISP found the location, VXLAN carried the packet, and TrustSec decided whether it was allowed."});

quizViz($("#viz-sdaq"),{title:"SD-Access check",done:"Passed the SD-Access check",qs:[
  ["A user roams from Edge3 to Edge7. Why doesn't their default gateway change?",["Every edge is the same anycast gateway","HSRP fails over","The DHCP server reassigns it","VXLAN doesn't use gateways"],0,"Same IP and MAC on every edge."],
  ["Guests must never reach employee subnets, even by mistake. What's the right tool?",["A separate VN (VRF)","An SGT inside the CORP VN","A VLAN ACL","A different SSID only"],0,"Macro-segmentation."],
  ["Which plane does LISP provide?",["Control","Data","Policy","Management"],0,"Location lookup."],
  ["Traffic for the internet leaves the fabric at the:",["External border","Control plane node","Fabric edge","Intermediate node"],0,"External border is the default exit."],
  ["Shared DHCP and DNS servers outside the fabric need to reach every VN. What's commonly used?",["A fusion router leaking routes","A second fabric","Static ARP","OMP"],0,"The fusion router connects VNs to shared services."]]});

/* ---- DSCP explorer ---- */
(function(){const el=$("#viz-dscp");const seen=new Set();
  const R=[["EF",46,"Voice bearer","Priority queue (LLQ)"],["AF41",34,"Interactive video","Video queue, low drop"],["AF42",36,"Interactive video","Video queue, medium drop"],["CS3",24,"Call signaling","Small guaranteed queue"],["AF31",26,"Multimedia streaming","Streaming queue"],["AF21",18,"Transactional data","Data queue, low drop"],["AF23",22,"Transactional data","Data queue, dropped first"],["AF11",10,"Bulk data","Bulk queue"],["CS6",48,"Network control (routing)","Protected control queue"],["CS1",8,"Scavenger","Below best effort"],["DF",0,"Best effort","Default queue"]];
  function draw(i){const r=R[i];const bits=r?r[1].toString(2).padStart(6,"0"):"";
    el.innerHTML=`<div class="viz-title">DSCP explorer: tap a marking</div><div class="chips">${R.map((x,k)=>`<button class="chip" data-i="${k}" aria-pressed="${k===i}">${x[0]}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${r?`<b>${r[0]}</b> = DSCP ${r[1]} = binary <code>${bits}</code> (ToS byte <code>${bits}00</code>, decimal ${r[1]*4}). IP Precedence ${r[1]>>3}.${/^AF/.test(r[0])?` Class ${r[0][2]}, drop precedence ${r[0][3]}: 8×${r[0][2]} + 2×${r[0][3]} = ${r[1]}.`:/^CS/.test(r[0])?` Class selector: 8×${r[0][2]} = ${r[1]}.`:""}<br>Used for: ${r[2]}. Typical treatment: ${r[3]}.`:"Tap a marking to see its value, its bits and how it's usually treated."}</div>
    <div class="rv-prog s-small">${seen.size} of ${R.length} explored</div>`}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(!c)return;seen.add(+c.dataset.i);draw(+c.dataset.i);if(seen.size===R.length)award("viz:dscp",20,"Explored every DSCP value")});draw(-1)})();

/* ---- queue animation ---- */
(function(){const el=$("#viz-queue");let mode="fifo",t=0,timer=null;
  const arr=["V","D","D","B","V","D","B","B","V","D","D","B","V","B","D","V"];
  function sched(){const q={V:[],D:[],B:[]};const out=[];let drop=0;let sent=0;
    for(let k=0;k<arr.length;k++){const p=arr[k];if(mode==="fifo"){const n=q.V.length+q.D.length+q.B.length;if(n>=5){drop++;if(p==="V")drop+=0}else q.D.push(p)}else{if(q[p].length>=(p==="V"?4:3))drop++;else q[p].push(p)}
      if(k%2===1){if(mode==="fifo"){const all=q.D;if(all.length)out.push(all.shift())}else{if(q.V.length)out.push(q.V.shift());else if(q.D.length&&(sent++%3!==2||!q.B.length))out.push(q.D.shift());else if(q.B.length)out.push(q.B.shift())}}}
    return {out,drop}}
  function draw(){const {out}=sched();const n=Math.min(t,out.length);const vpos=out.slice(0,n).map((p,i)=>p==="V"?i:null).filter(x=>x!==null);
    el.innerHTML=`<div class="viz-title">Congested link: FIFO vs LLQ + CBWFQ</div><div class="chips"><button class="chip" data-m="fifo" aria-pressed="${mode==="fifo"}">One FIFO queue</button><button class="chip" data-m="llq" aria-pressed="${mode==="llq"}">LLQ for voice + CBWFQ</button></div>
    <p class="s-small">Packets arrive twice as fast as the link can send: V voice, D data, B bulk. Output order so far:</p>
    <div class="term" style="min-height:2.2em;letter-spacing:.3em">${out.slice(0,n).join(" ")||"…"}</div>
    <div class="caption" aria-live="polite">${n<out.length?"Press Run to send packets.":mode==="fifo"?`FIFO sends in arrival order and tail-drops when the queue is full, voice included. Voice waited behind bulk transfers: position ${vpos.join(", ")||"-"} in the output.`:`The priority queue sends voice the moment it arrives (positions ${vpos.join(", ")}). Data gets a bigger CBWFQ share than bulk. When the link is this congested, bulk is what waits and drops.`}</div>
    <div class="viz-controls"><button class="btn primary" data-a="run">Run</button><button class="btn" data-a="reset">Reset</button></div>`}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(m){mode=m.dataset.m;t=0;clearInterval(timer);draw();return}
    if(a==="reset"){t=0;clearInterval(timer);draw()}
    if(a==="run"){clearInterval(timer);t=0;const total=sched().out.length;timer=setInterval(()=>{t++;draw();if(t>=total){clearInterval(timer);if(mode==="llq")award("viz:queue",20,"Watched LLQ protect voice")}},REDUCED?0:260)}});
  draw()})();

revealViz($("#viz-polshape"),{title:"Policing vs shaping on the same traffic",cols:2,done:"Compared policing and shaping",items:[
  ["Policer","Drop / re-mark","Traffic above the CIR is dropped (or re-marked to a worse DSCP) the instant it exceeds. Output has the same jagged shape with the peaks cut off."],
  ["Shaper","Buffer","Traffic above the CIR waits in a queue and goes out later. Output is smooth at the CIR, with added delay. Outbound only."],
  ["Token bucket","Both","Tokens refill at the CIR. A packet needs tokens to be sent (or to conform). Bc is the bucket size, Tc = Bc / CIR."],
  ["Single-rate three-color","Policer","CIR plus Bc and Be: conform, exceed and violate actions, for example transmit, set-dscp-transmit af13, drop."],
  ["Who uses which","Practice","The provider polices your access at the contracted rate; you shape just under it so your own queuing decides what waits."],
  ["CoPP","Policer","Control Plane Policing polices traffic to the CPU. You can't shape to the control plane."]]});

quizViz($("#viz-mqcread"),{title:"Interpret the QoS configuration",done:"Interpreted every QoS config",qs:[
  ["<pre class=\"term\">policy-map EDGE\n class VOICE\n  priority percent 20\n class VIDEO\n  bandwidth percent 30\n class class-default\n  fair-queue</pre>During congestion, what does VIDEO get?",["At least 30% of the bandwidth, more if it's free","Exactly 30% and never more","Strict priority","Nothing, it's best effort"],0,"CBWFQ bandwidth is a minimum."],
  ["Same policy. During congestion, VOICE tries to send 35%. What happens?",["It gets 20% in the priority queue; the excess is dropped","It gets 35%","It starves every other class","It moves to class-default"],0,"The LLQ is policed to its rate during congestion."],
  ["<pre class=\"term\">policy-map IN-MARK\n class SCAVENGER\n  police 1000000 conform-action transmit exceed-action drop\ninterface g1/0/1\n service-policy input IN-MARK</pre>Is this valid?",["Yes, policing works inbound","No, policing is outbound only","No, it needs a shaper","No, input policies can't match"],0,"Policers work in either direction."],
  ["<pre class=\"term\">class-map match-any CRITICAL\n match dscp af31\n match dscp cs3</pre>A packet marked CS3 arrives. Does it match?",["Yes, match-any needs one","No, it must match both","Only if AF31 too","Only on input"],0,"match-any."],
  ["<pre class=\"term\">policy-map PARENT\n class class-default\n  shape average 20000000\n  service-policy CHILD</pre>What is this for?",["Creating congestion at 20 Mbps so CHILD's queuing works under the provider's rate","Policing to 20 Mbps","Marking traffic","Inbound rate limiting"],0,"Hierarchical QoS."],
  ["A class has 'set dscp af41' and is applied inbound on an access port. What happens?",["Matching packets are re-marked to AF41 as they arrive","Nothing, marking needs output","They are queued","They are dropped"],0,"Marking works in either direction."]]});

iosViz($("#viz-qosmini"),{title:"Mini lab: mark and prioritize voice",scenario:"R1's WAN link G0/0/0 congests at peak hours. Voice is already marked EF by the phones. Give voice a strict-priority queue of 15% and fair-queue everything else.",
  devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"}],links:[["R1:g0/0/0","ISP:g0/0/0"]],
  boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown"]},
  consoles:["R1"],startMode:"priv",topo:{R1:[180,70],ISP:[420,70]},topoH:130,
  tasks:[{t:"Create class-map VOICE (match-any) matching DSCP EF",hint:"configure terminal\nclass-map match-any VOICE\nmatch dscp ef",check:(w,D)=>{const c=D.R1.cmaps.VOICE;return c&&c.matches.some(m=>m.t==="dscp"&&/^ef$|^46$/i.test(m.v))}},
    {t:"Policy-map WAN: VOICE gets priority percent 15, class-default gets fair-queue",hint:"policy-map WAN\nclass VOICE\npriority percent 15\nclass class-default\nfair-queue",check:(w,D)=>{const p=D.R1.pmaps.WAN;if(!p)return false;const v=p.classes.find(c=>c.cls==="VOICE"),d=p.classes.find(c=>c.cls==="class-default");return v&&v.act.priority&&v.act.priority.pct===15&&d&&d.act.fq}},
    {t:"Apply it outbound on G0/0/0 and verify",hint:"interface g0/0/0\nservice-policy output WAN\ndo show policy-map interface g0/0/0",check:(w,D,S)=>D.R1.ifs[IOS.ifName("g0/0/0")].svc.out==="WAN"&&ranCmd(S,"R1",/sh\S* pol\S* int/i)}],
  solution:"configure terminal\nclass-map match-any VOICE\nmatch dscp ef\npolicy-map WAN\nclass VOICE\npriority percent 15\nclass class-default\nfair-queue\ninterface g0/0/0\nservice-policy output WAN\ndo show policy-map interface g0/0/0",
  success:"Classify with a class-map, act with a policy-map, attach with service-policy. Try applying it 'input' to see IOS reject the queuing actions."},"qosmini",40,"QoS mini lab");

stepViz($("#viz-cef"),{title:"How CEF forwards a packet",done:"Followed a packet through CEF",steps:[
  ["Routing protocols run","OSPF learns 10.9.0.0/16 via 10.0.0.2. BGP learns 172.16.0.0/12 with next hop 192.0.2.9 (not directly connected)."],
  ["RIB","The routing table holds the best routes. The BGP route's next hop 192.0.2.9 is itself reached through OSPF via 10.0.0.2: a recursive route."],
  ["FIB","CEF copies the RIB into the FIB and resolves every recursion in advance: 172.16.0.0/12 → next hop 10.0.0.2 out G0/0/0. No recursion at forwarding time."],
  ["Adjacency table","From ARP, CEF builds the full new Ethernet header for 10.0.0.2 on G0/0/0: destination MAC, source MAC, EtherType."],
  ["Packet arrives","A packet to 172.20.1.1 comes in. One longest-match lookup in the FIB (in TCAM on a switch) points to the adjacency."],
  ["Rewrite and send","The router decrements TTL, updates the checksum, prepends the prebuilt header and sends it. The CPU never touched it."]],
  end:"CEF does the expensive work when routes change, not when packets arrive."});

sortViz($("#viz-tables"),{title:"Which table answers the question?",bins:{rib:"RIB",fib:"FIB",adj:"Adjacency",cam:"CAM",tcam:"TCAM"},done:"Matched every table",items:[
  ["Which OSPF route won over the static route with AD 200?","rib","The routing table holds the best routes by AD."],
  ["Prefix to resolved next hop, used for every packet","fib","CEF's forwarding table."],
  ["The destination MAC to put on a packet to next hop 10.0.0.2","adj","Prebuilt from ARP."],
  ["Which port is aa:bb:cc:00:11:22 on in VLAN 10?","cam","Exact-match MAC table."],
  ["Applying a 200-line ACL at line rate","tcam","Value/mask/result entries with don't-care bits."],
  ["Longest-prefix match in switch hardware","tcam","TCAM handles masks in one lookup."]]});
  },
  sims:[
    {id:"hsrplab",type:"ios",title:"Gateway redundancy with tracking and preemption",lab:{
      scenario:"VLAN 20 users use 10.1.20.1 as their gateway. D1 must be HSRP active, but if its uplink to the core fails, D2 must take over, and D1 must take the role back (after a 30-second delay, so its routing has converged) when the uplink returns. D2 currently has no HSRP at all.",
      devices:[{name:"D1",kind:"router"},{name:"D2",kind:"router"},{name:"CORE",kind:"router"},{name:"SW1",kind:"switch"}],links:[["D1:g0/0/1","SW1:g1/0/1"],["D2:g0/0/1","SW1:g1/0/2"],["D1:g0/0/0","CORE:g0/0/0"],["D2:g0/0/0","CORE:g0/0/1"]],hosts:[{name:"PC20",ip:"10.1.20.50",gw:"10.1.20.1",at:"SW1:g1/0/5"}],
      boot:{D1:["hostname D1","interface g0/0/0","ip address 10.0.1.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.20.2 255.255.255.0","no shutdown"],D2:["hostname D2","interface g0/0/0","ip address 10.0.2.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.20.3 255.255.255.0","no shutdown"],CORE:["hostname CORE","interface g0/0/0","ip address 10.0.1.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.2.1 255.255.255.252","no shutdown"]},
      consoles:["D1","D2"],topo:{CORE:[300,40],D1:[160,120],D2:[440,120],SW1:[300,200],PC20:[470,215]},topoH:245,
      events:[{label:"Fail D1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=true;return "CORE: G0/0/0 is down"}},{label:"Restore D1's uplink",run:(w,D)=>{D.CORE.ifs[IOS.ifName("g0/0/0")].shut=false;return "CORE: G0/0/0 is back"}}],
      tasks:[
        {t:"On both routers, use HSRP version 2 and group 20 with virtual IP 10.1.20.1",hint:"interface g0/0/1\nstandby version 2\nstandby 20 ip 10.1.20.1",check:(w,D)=>["D1","D2"].every(n=>{const i=D[n].ifs[IOS.ifName("g0/0/1")];return i.hsrpV===2&&i.hsrp[20]&&i.hsrp[20].ip===ip("10.1.20.1")})},
        {t:"D1: priority 120, preempt with a 30-second minimum delay",hint:"standby 20 priority 120\nstandby 20 preempt delay minimum 30",check:(w,D)=>{const c=D.D1.ifs[IOS.ifName("g0/0/1")].hsrp[20];return c&&c.pri===120&&c.preempt&&c.pdelay===30}},
        {t:"D2: preempt (so it can take over when D1's priority drops)",hint:"standby 20 preempt",check:(w,D)=>{const c=D.D2.ifs[IOS.ifName("g0/0/1")].hsrp[20];return c&&c.preempt}},
        {t:"D1: track G0/0/0's line protocol as object 10 and decrement HSRP by 30 when it fails",hint:"track 10 interface g0/0/0 line-protocol\ninterface g0/0/1\nstandby 20 track 10 decrement 30",check:(w,D)=>{const c=D.D1.ifs[IOS.ifName("g0/0/1")].hsrp[20];return D.D1.tracks[10]&&c&&(c.track||[]).some(x=>x.obj===10&&x.dec>=21)}},
        {t:"D1 is active now",hint:"do show standby brief",check:(w)=>fhrpState(w,"hsrp","D1","g0/0/1",20)==="Active",sticky:true},
        {t:"Fail D1's uplink and confirm D2 became active",hint:"(press Fail D1's uplink)\ndo show standby brief",check:(w)=>fhrpState(w,"hsrp","D2","g0/0/1",20)==="Active",sticky:true}],
      solution:"! D1\nconfigure terminal\ntrack 10 interface g0/0/0 line-protocol\ninterface g0/0/1\nstandby version 2\nstandby 20 ip 10.1.20.1\nstandby 20 priority 120\nstandby 20 preempt delay minimum 30\nstandby 20 track 10 decrement 30\n! D2\nconfigure terminal\ninterface g0/0/1\nstandby version 2\nstandby 20 ip 10.1.20.1\nstandby 20 preempt\n(press Fail D1's uplink)",
      success:"120 minus 30 is 90, below D2's default 100, and D2's preempt lets it take over. The decrement must be more than 20 for this to work: a classic exam trap."}},
    {id:"qoslab",type:"ios",title:"Build a WAN edge QoS policy",lab:{
      scenario:"The provider sells you 50 Mbps on a 1 Gbps handoff and polices anything above it. Build a hierarchical policy on R1's G0/0/0: shape everything to 50 Mbps, and inside that give voice (EF) a 10% priority queue, call signaling (CS3) at least 5%, and fair-queue the rest. Also re-mark anything arriving from the user LAN on G0/0/1 as best effort unless it's EF or CS3: the PCs can't be trusted.",
      devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","ISP:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"PC",ip:"10.1.1.20",gw:"10.1.1.1",at:"SW1:g1/0/3"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.1.1 255.255.255.0","no shutdown"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{SW1:[100,90],R1:[300,90],ISP:[500,90],PC:[100,180]},topoH:210,
      tasks:[
        {t:"class-map match-any VOICE matching dscp ef, and class-map match-any SIGNAL matching dscp cs3",hint:"class-map match-any VOICE\nmatch dscp ef\nclass-map match-any SIGNAL\nmatch dscp cs3",check:(w,D)=>{const v=D.R1.cmaps.VOICE,s=D.R1.cmaps.SIGNAL;return v&&s&&v.matches.some(m=>/ef|46/i.test(m.v))&&s.matches.some(m=>/cs3|24/i.test(m.v))}},
        {t:"Child policy WAN-CHILD: VOICE priority percent 10, SIGNAL bandwidth percent 5, class-default fair-queue",hint:"policy-map WAN-CHILD\nclass VOICE\npriority percent 10\nclass SIGNAL\nbandwidth percent 5\nclass class-default\nfair-queue",check:(w,D)=>{const p=D.R1.pmaps["WAN-CHILD"];if(!p)return false;const f=n=>p.classes.find(c=>c.cls===n);return f("VOICE")?.act.priority?.pct===10&&f("SIGNAL")?.act.bandwidth?.pct===5&&f("class-default")?.act.fq}},
        {t:"Parent policy WAN-PARENT: class-default shapes to 50000000 and nests WAN-CHILD",hint:"policy-map WAN-PARENT\nclass class-default\nshape average 50000000\nservice-policy WAN-CHILD",check:(w,D)=>{const p=D.R1.pmaps["WAN-PARENT"];const c=p&&p.classes.find(c=>c.cls==="class-default");return c&&c.act.shape&&+c.act.shape.avg===50000000&&c.act.child==="WAN-CHILD"}},
        {t:"Attach WAN-PARENT outbound on G0/0/0",hint:"interface g0/0/0\nservice-policy output WAN-PARENT",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/0")].svc.out==="WAN-PARENT"},
        {t:"Policy LAN-IN: class-default sets dscp default (0); attach it inbound on G0/0/1 with VOICE and SIGNAL classes left untouched",hint:"policy-map LAN-IN\nclass VOICE\nclass SIGNAL\nclass class-default\nset dscp default\ninterface g0/0/1\nservice-policy input LAN-IN",check:(w,D)=>{const p=D.R1.pmaps["LAN-IN"];const c=p&&p.classes.find(c=>c.cls==="class-default");return c&&c.act.set&&/^(default|0)$/.test(c.act.set.dscp)&&p.classes.some(c=>c.cls==="VOICE")&&D.R1.ifs[IOS.ifName("g0/0/1")].svc.in==="LAN-IN"}}],
      solution:"configure terminal\nclass-map match-any VOICE\nmatch dscp ef\nclass-map match-any SIGNAL\nmatch dscp cs3\npolicy-map WAN-CHILD\nclass VOICE\npriority percent 10\nclass SIGNAL\nbandwidth percent 5\nclass class-default\nfair-queue\npolicy-map WAN-PARENT\nclass class-default\nshape average 50000000\nservice-policy WAN-CHILD\npolicy-map LAN-IN\nclass VOICE\nclass SIGNAL\nclass class-default\nset dscp default\ninterface g0/0/0\nservice-policy output WAN-PARENT\ninterface g0/0/1\nservice-policy input LAN-IN",
      success:"Marking at the edge, a shaper to match the contract, and queuing inside the shaped rate. That's the standard WAN edge QoS pattern."}},
    {id:"qosfix",type:"ios",title:"Troubleshoot a broken QoS policy",lab:{
      scenario:"Users complain about choppy calls even though a colleague 'configured QoS'. Read R1's configuration with show running-config and show policy-map interface, find the three mistakes and fix them. Calls are marked EF by the phones and leave through G0/0/0.",
      devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"}],links:[["R1:g0/0/0","ISP:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.1.1.1 255.255.255.0","no shutdown","class-map match-all VOICE","match dscp ef","match dscp cs3","class-map match-any BULK","match dscp af11","policy-map WAN","class VOICE","bandwidth percent 10","class BULK","bandwidth percent 5","class class-default","fair-queue","interface g0/0/1","service-policy output WAN"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[180,70],ISP:[420,70]},topoH:130,
      tasks:[
        {t:"Fix the VOICE class so EF packets actually match (a packet can't be EF and CS3 at once)",hint:"configure terminal\nno class-map match-all VOICE\nclass-map match-any VOICE\nmatch dscp ef",check:(w,D)=>{const c=D.R1.cmaps.VOICE;return c&&(c.any||c.matches.length===1)&&c.matches.some(m=>/ef|46/i.test(m.v))}},
        {t:"Give VOICE a strict-priority queue (priority percent 10) instead of a bandwidth guarantee",hint:"policy-map WAN\nclass VOICE\nno bandwidth percent 10\npriority percent 10",check:(w,D)=>{const c=D.R1.pmaps.WAN?.classes.find(c=>c.cls==="VOICE");return c&&c.act.priority&&!c.act.bandwidth}},
        {t:"Move the policy to the WAN interface G0/0/0, where congestion happens",hint:"interface g0/0/1\nno service-policy output WAN\ninterface g0/0/0\nservice-policy output WAN",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/0")].svc.out==="WAN"&&!D.R1.ifs[IOS.ifName("g0/0/1")].svc.out},
        {t:"Verify with show policy-map interface g0/0/0",hint:"do show policy-map interface g0/0/0",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* pol\S* int\S* g/i)}],
      solution:"configure terminal\nno class-map match-all VOICE\nclass-map match-any VOICE\nmatch dscp ef\npolicy-map WAN\nclass VOICE\nno bandwidth percent 10\npriority percent 10\ninterface g0/0/1\nno service-policy output WAN\ninterface g0/0/0\nservice-policy output WAN\ndo show policy-map interface g0/0/0",
      success:"match-all with two DSCP values matched nothing, voice had a minimum but no priority, and the policy sat on the uncongested LAN side."}},
    {id:"sdwanmatch",type:"match",title:"Place the SD-WAN pieces",scenario:"Match each SD-WAN element to what it does.",
      items:[["SD-WAN Manager","mgmt"],["SD-WAN Controller","ctrl"],["SD-WAN Validator","orch"],["WAN Edge","data"],["OMP","omp"],["BFD","bfd"],["TLOC","tloc"]],
      slots:[["mgmt","Management plane","GUI, templates, API"],["ctrl","Control plane","Reflects routes and policy"],["orch","Orchestration","First contact, NAT traversal"],["data","Data plane","Forwards over IPsec"],["omp","Routing protocol","Carries OMP, TLOC and service routes"],["bfd","Path probe","Loss, latency and jitter per tunnel"],["tloc","Transport attachment","System IP + color + encapsulation"]],
      success:"Manager manages, Controller controls, Validator orchestrates, edges forward."},
    {id:"sdaorder",type:"order",title:"SD-Access: from plug-in to first packet",scenario:"A laptop plugs into a fabric edge and sends its first packet to a server on another edge. Put the steps in order.",
      steps:["The laptop authenticates with ISE (802.1X or MAB) and gets an SGT and VN","Fabric edge registers the laptop's EID with the control plane node","The laptop sends traffic to its anycast default gateway on the edge","The edge sends a LISP map-request for the server's address","The control plane node replies with the server's RLOC (its edge's loopback)","The edge encapsulates the frame in VXLAN with VNI and SGT and sends it over the underlay","The destination edge decapsulates and enforces the SGT policy"],
      success:"Identity, registration, lookup, encapsulation, enforcement."},
    {id:"designchoice",type:"choice",title:"Design review: pick the right architecture",
      scenario:"A retailer with a 6-building headquarters, a data center and 300 stores asks you to review its network plans.",
      steps:[
        ["HQ has 6 buildings, each with its own distribution pair. What should connect them?",["A dedicated core layer","Full mesh between all distribution pairs","Collapsed core in one building","Daisy-chain the buildings"],0,"Six blocks would need 15 mesh links; a core scales."],
        ["The data center is mostly VM-to-VM traffic and must scale. Which design?",["Spine-leaf","Three-tier campus","Ring","Collapsed core"],0,"East-west, predictable latency."],
        ["The stores have MPLS plus cheap broadband and want POS traffic on the best path automatically.",["Catalyst SD-WAN with application-aware routing","Static routes with floating statics","GRE over MPLS only","Policy-based routing on each store router by hand"],0,"BFD-measured SLA path selection."],
        ["Store routers will be shipped to sites with no IT staff. What makes this work?",["Zero-touch provisioning through PnP and the Validator","A console cable and phone support","Pre-staging each router at HQ","TFTP"],0,"ZTP."],
        ["HQ wants employees, contractors and cameras separated, with the same policy wired and wireless, managed from one place.",["SD-Access with VNs and SGTs, managed by Catalyst Center","VLAN ACLs on every switch","A firewall per floor","Private VLANs"],0,"Group-based policy at scale."],
        ["The HQ distribution switches use HSRP. The team wants failover only when an uplink is lost. What's needed?",["Object tracking with a large enough decrement, and preempt on the peer","Longer hello timers","GLBP","Turn off preempt everywhere"],0,"Tracking + preempt."]],
      success:"Core for many blocks, spine-leaf for the data center, SD-WAN for stores, SD-Access for the campus."}
  ],
  badges:[
    ["reader","ARC","Architect's Desk","Mark all 6 architecture lessons studied",c=>c.allStudied()],
    ["lab","BLP","Blueprint Complete","Complete all 20 diagrams in this module",c=>c.vizAll()],
    ["hsrp","HSR","Active Duty","Pass the HSRP tracking lab",c=>c.passed("hsrplab")],
    ["qos","EF","Expedited Forwarding","Pass the WAN edge QoS lab",c=>c.passed("qoslab")],
    ["qosfix","MQC","Policy Doctor","Fix the broken QoS policy",c=>c.passed("qosfix")],
    ["sdwan","OMP","Overlay Operator","Pass the SD-WAN match and the ZTP walk-through",c=>c.passed("sdwanmatch")&&c.earned("viz:ztp")],
    ["sda","SGT","Fabric Weaver","Pass the SD-Access order and follow an SD-Access packet",c=>c.passed("sdaorder")&&c.earned("viz:sdaflow")],
    ["design","CLS","Clos Encounters","Pass the design review and build a spine-leaf fabric",c=>c.passed("designchoice")&&c.earned("viz:spineleaf")],
    ["breaker","BRK","Chaos Monkey","Break all three campus designs in the builder",c=>c.earned("viz:campus")],
    ["perfect","15%","Domain One Down","Score 100% on an architecture quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
