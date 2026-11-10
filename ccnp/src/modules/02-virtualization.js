/* ================= Module 2: Virtualization (350-401 v1.2 Domain 2.0, 10%) ================= */
(function(){
const LESSONS=[
{id:"hyper",num:"2.1",title:"Device virtualization: hypervisors, VMs and virtual switching",html:`
<p>Virtualization runs many logical things on one physical thing. ENCOR starts with servers and network devices before moving to virtualized paths and networks.</p>
<h3>Hypervisors</h3>
<ul><li><b>Type 1 (bare metal)</b> runs directly on the hardware with no host OS underneath: VMware ESXi, Microsoft Hyper-V, KVM, Xen. Better performance and isolation; the data center standard.</li>
<li><b>Type 2 (hosted)</b> runs as an application on Windows, macOS or Linux: VMware Workstation, VirtualBox, Parallels. Fine for labs and desktops.</li>
<li>The hypervisor shares out CPU, memory, storage and NICs, and keeps each <b>virtual machine</b> isolated from the others.</li></ul>
<div class="viz" id="viz-hyptype"></div>
<h3>Virtual machines and containers</h3>
<ul><li>A <b>VM</b> is a full computer in software: virtual hardware, its own guest OS and kernel, its own applications. It can be moved between hosts while running (vMotion, live migration).</li>
<li>A <b>container</b> packages an app and its libraries but shares the host's kernel. It starts in seconds and is much lighter, but all containers on a host need a compatible OS.</li>
<li>Network functions are virtualized too: <b>NFV</b> runs routers, firewalls and WLCs as software (Catalyst 8000V, Secure Firewall Threat Defense Virtual, Catalyst 9800-CL) on standard servers, often managed by an NFV infrastructure such as Cisco NFVIS on an ENCS platform.</li></ul>
<h3>Virtual switching</h3>
<ul><li>Inside each host, a <b>virtual switch</b> connects VMs' virtual NICs to each other and to the physical NICs (uplinks). VMs on the same host and VLAN talk without ever touching the physical network.</li>
<li>A <b>standard vSwitch</b> (VMware vSS) is configured per host. A <b>distributed switch</b> (VMware vDS) is configured once and spans many hosts, so port settings follow a VM when it migrates.</li>
<li>Virtual switches tag VLANs (port groups), so the physical port facing a hypervisor is an <b>802.1Q trunk</b>. Uplinks are often teamed for redundancy.</li>
<li><b>SR-IOV</b> lets a VM use a slice of the physical NIC directly, bypassing the virtual switch for near line-rate performance, at the cost of some mobility.</li></ul>
<div class="viz" id="viz-vswitch"></div>
<div class="tip"><b>Exam tip.</b> "Runs on bare metal" is Type 1. "Runs on top of an OS" is Type 2. A switch port facing a hypervisor host with VMs in several VLANs must be a trunk.</div>`},
{id:"vrf",num:"2.2",title:"VRF-lite: separate routing tables on one router",html:`
<p>A <b>VRF</b> (Virtual Routing and Forwarding instance) is a separate routing table, with its own interfaces and its own routing protocol instances, inside one router. It is to Layer 3 what a VLAN is to Layer 2.</p>
<ul><li>Interfaces belong to exactly one VRF (or the global table). Traffic arriving on a VRF interface is looked up only in that VRF's table.</li>
<li>Two VRFs can use <b>overlapping addresses</b>: customer A and customer B can both use 10.1.1.0/24 on the same router.</li>
<li><b>VRF-lite</b> means VRFs without MPLS: each VRF needs its own link (usually an 802.1Q subinterface) between routers. In an MPLS VPN, MP-BGP and labels carry many VRFs over one core instead.</li>
<li>The <b>route distinguisher (RD)</b> makes overlapping prefixes unique in MP-BGP (RD:prefix). Route targets control import and export between VRFs. With VRF-lite you often set an RD anyway, and it's required on some platforms for the IPv4 address family.</li></ul>
<h3>Configuration</h3>
<pre class="term">vrf definition RED
 rd 65000:1
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet0/0/1
 vrf forwarding RED
 ip address 10.1.1.1 255.255.255.0
!
ip route vrf RED 0.0.0.0 0.0.0.0 172.16.10.2
router ospf 10 vrf RED
 network 10.1.1.0 0.0.0.255 area 0</pre>
<p><b>Order matters</b>: <code>vrf forwarding</code> removes any IP address already on the interface ("% Interface GigabitEthernet0/0/1 IPv4 disabled and address(es) removed due to enabling VRF RED"), so configure the VRF first and the address second.</p>
<p>The older syntax <code>ip vrf RED</code> with <code>ip vrf forwarding RED</code> still works for IPv4-only VRFs. <code>vrf definition</code> is the multiprotocol form that supports IPv6 too.</p>
<h3>Verification</h3>
<ul><li><code>show vrf</code> and <code>show ip vrf interfaces</code>: which interfaces are in which VRF.</li>
<li><code>show ip route vrf RED</code>: that VRF's table. A plain <code>show ip route</code> only shows the global table.</li>
<li><code>ping vrf RED 10.9.9.9</code> and <code>traceroute vrf RED ...</code>: a plain ping uses the global table and fails.</li></ul>
<div class="viz" id="viz-vrfsplit"></div>
<div class="viz" id="viz-vrfmini"></div>
<div class="tip"><b>Exam tip.</b> "Ping works from the customer's PC but not from the router" usually means you forgot <code>vrf</code> on the ping. Overlapping IPs on one router means VRFs.</div>`},
{id:"gre",num:"2.3",title:"GRE and IPsec tunnels",html:`
<p>A tunnel wraps one packet inside another so it can cross a network that wouldn't carry it on its own: private addresses over the internet, multicast and routing protocols over an IPsec-only path, IPv6 over IPv4.</p>
<h3>GRE</h3>
<ul><li>Generic Routing Encapsulation (IP protocol <b>47</b>) adds a new outer IP header (tunnel source to tunnel destination) and a 4-byte GRE header: <b>24 bytes</b> of overhead.</li>
<li>GRE carries <b>anything</b>: unicast, multicast and broadcast, so routing protocols like OSPF run over it. It's point-to-point by default; multipoint GRE (mGRE) is the basis of DMVPN.</li>
<li>GRE has <b>no encryption and no authentication</b>. On its own it's not a VPN in the security sense.</li>
<li>A tunnel interface comes <b>up/up</b> as soon as it has a source with an IP and a route to the destination. It doesn't know whether the far end exists, unless you add <code>keepalive</code>.</li></ul>
<pre class="term">interface Tunnel0
 ip address 172.16.0.1 255.255.255.252
 ip mtu 1400
 ip tcp adjust-mss 1360
 tunnel source GigabitEthernet0/0/0
 tunnel destination 198.51.100.2</pre>
<p><b>MTU</b>: the extra headers mean a full 1500-byte packet won't fit. Lower the tunnel's IP MTU (1400 is common with IPsec) and clamp TCP MSS so hosts send smaller segments.</p>
<p><b>Recursive routing</b>: if the router learns the route to the tunnel <i>destination</i> through the tunnel itself (for example, OSPF over the tunnel advertises the public prefix), the tunnel flaps with <code>%TUN-5-RECURDOWN</code>. Never advertise the transport addresses into the tunnel's routing protocol.</p>
<div class="viz" id="viz-encap"></div>
<h3>IPsec</h3>
<ul><li><b>IKE</b> (Internet Key Exchange, UDP 500, or 4500 with NAT-T) authenticates the peers and agrees keys. <b>IKEv1</b> uses Phase 1 (main or aggressive mode, builds the ISAKMP SA) and Phase 2 (quick mode, builds the IPsec SAs). <b>IKEv2</b> is simpler, faster and more reliable: fewer messages, built-in NAT traversal and dead peer detection, and EAP support.</li>
<li><b>ESP</b> (IP protocol 50) encrypts and authenticates the payload. <b>AH</b> (protocol 51) only authenticates and breaks with NAT, so ESP is what everyone uses.</li>
<li><b>Tunnel mode</b> encrypts the whole original packet and adds a new IP header: used between gateways. <b>Transport mode</b> keeps the original IP header and protects the payload: used between two hosts, or for GRE over IPsec where GRE already adds the outer header.</li>
<li>Pieces in IOS: an <b>IKE policy</b> (ISAKMP policy or IKEv2 proposal) for encryption, hash, DH group and authentication; a <b>pre-shared key</b> or certificates; a <b>transform set</b> for ESP algorithms; and either a crypto map on the interface or an <b>IPsec profile</b> on a tunnel interface.</li></ul>
<h3>GRE over IPsec and VTI</h3>
<ul><li><b>GRE over IPsec</b>: <code>tunnel protection ipsec profile</code> on a GRE tunnel encrypts everything the tunnel sends. You keep GRE's ability to carry multicast and routing protocols and add IPsec's security.</li>
<li><b>Static VTI</b> (<code>tunnel mode ipsec ipv4</code>): a native IPsec tunnel interface without GRE. Less overhead, routing protocols still run over it (as unicast IP), but it carries IP only.</li>
<li>Both give you a <b>routable interface</b>, unlike legacy crypto maps, so you can run OSPF, apply QoS and see interface counters.</li></ul>
<pre class="term">crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key S3cr3t! address 198.51.100.2
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
 mode transport
crypto ipsec profile VPN
 set transform-set TS
interface Tunnel0
 tunnel protection ipsec profile VPN</pre>
<div class="viz" id="viz-ikestep"></div>
<div class="viz" id="viz-tunpick"></div>
<div class="tip"><b>Exam tip.</b> GRE: protocol 47, multicast yes, encryption no. ESP: protocol 50. IKE: UDP 500 and 4500. If the tunnel is up but no traffic passes, check the IPsec SAs with <code>show crypto isakmp sa</code> (QM_IDLE is good, MM_NO_STATE means Phase 1 failed) and <code>show crypto ipsec sa</code> for encaps/decaps counters.</div>`},
{id:"lisp",num:"2.4",title:"LISP: separating who you are from where you are",html:`
<p>In normal IP, an address is both the identity of a host and its location in the network. That's why a host that moves needs a new address, and why the internet routing table keeps growing. <b>LISP</b> (Locator/ID Separation Protocol) splits the two.</p>
<ul><li><b>EID</b> (Endpoint Identifier): the host's address. It never changes when the host moves.</li>
<li><b>RLOC</b> (Routing Locator): the address of the LISP router the host currently sits behind. Only RLOCs need to be routable in the core.</li></ul>
<h3>The roles</h3>
<table><tr><th>Role</th><th>Job</th></tr>
<tr><td><b>ITR</b> (Ingress Tunnel Router)</td><td>Receives traffic from local hosts, looks up the destination EID, encapsulates it toward the destination's RLOC.</td></tr>
<tr><td><b>ETR</b> (Egress Tunnel Router)</td><td>Registers its local EIDs with the map server, receives encapsulated traffic and decapsulates it.</td></tr>
<tr><td><b>xTR</b></td><td>A router that's both ITR and ETR (the usual case).</td></tr>
<tr><td><b>Map server (MS)</b></td><td>Accepts EID-prefix registrations from ETRs.</td></tr>
<tr><td><b>Map resolver (MR)</b></td><td>Accepts map-requests from ITRs and finds the answer.</td></tr>
<tr><td><b>PITR / PETR</b></td><td>Proxy routers that connect LISP sites with non-LISP sites.</td></tr></table>
<h3>How a packet finds its way</h3>
<ol><li>ETRs send <b>map-register</b> messages to the map server: "EID prefix 10.2.0.0/16 is behind RLOC 192.0.2.2."</li>
<li>A host at site 1 sends to 10.2.0.50. The ITR has no mapping, so it sends a <b>map-request</b> to the map resolver.</li>
<li>The MR/MS forwards the request to the ETR that registered the prefix, and that ETR sends a <b>map-reply</b> straight to the ITR with its RLOC (and priorities and weights for load sharing).</li>
<li>The ITR caches the mapping and encapsulates packets in LISP (UDP <b>4341</b> for data, 4342 for control) toward the RLOC.</li>
<li>The ETR decapsulates and delivers to the host. When the host moves to another site, the new ETR registers it and old mappings are updated.</li></ol>
<div class="viz" id="viz-lispseq"></div>
<p>In <b>SD-Access</b>, LISP is the control plane only: the fabric edges are xTRs, the control plane node is the MS/MR, and the data plane is VXLAN instead of LISP encapsulation.</p>
<div class="viz" id="viz-lispq"></div>
<div class="tip"><b>Exam tip.</b> ETRs register, ITRs request. The map server takes registrations; the map resolver takes requests. EID = who, RLOC = where.</div>`},
{id:"vxlan",num:"2.5",title:"VXLAN: Layer 2 over Layer 3",html:`
<p>VLANs top out at 4094 and depend on spanning tree. Data centers and campus fabrics need millions of segments stretched over a routed underlay with all links forwarding. <b>VXLAN</b> (Virtual Extensible LAN, RFC 7348) does this by carrying Ethernet frames inside UDP.</p>
<ul><li><b>VTEP</b> (VXLAN Tunnel Endpoint): the switch (or hypervisor) that encapsulates and decapsulates. Each VTEP has a loopback that's routable in the underlay.</li>
<li><b>VNI</b> (VXLAN Network Identifier): <b>24 bits</b>, so about <b>16 million</b> segments instead of 4094 VLANs. A Layer 2 VNI maps to a VLAN; a Layer 3 VNI maps to a VRF.</li>
<li>Encapsulation: original Ethernet frame + 8-byte VXLAN header + UDP (destination port <b>4789</b>) + outer IP (VTEP to VTEP) + outer Ethernet. About <b>50 bytes</b> of overhead, so the underlay needs a larger MTU (9000 or at least 1550).</li>
<li>The UDP source port is a hash of the inner flow, so the underlay's ECMP spreads different flows across different paths.</li></ul>
<h3>Learning where MACs are</h3>
<ul><li><b>Flood and learn</b>: unknown and broadcast traffic is flooded to all VTEPs in the VNI (with underlay multicast or head-end replication), and VTEPs learn remote MAC-to-VTEP mappings from the traffic. Simple, but floods.</li>
<li><b>Control plane</b>: <b>BGP EVPN</b> (common in data centers) or <b>LISP</b> (SD-Access) tells VTEPs where every MAC and IP lives, so there's no flood-and-learn and ARP can be suppressed.</li></ul>
<div class="viz" id="viz-vxlanpkt"></div>
<div class="viz" id="viz-overlays"></div>
<div class="tip"><b>Exam tip.</b> VXLAN: UDP 4789, 24-bit VNI, VTEPs, about 50 bytes overhead. LISP: UDP 4341/4342. In SD-Access, LISP is the control plane and VXLAN the data plane.</div>`}
];

const G={
hyper:[["Type 1 hypervisor?","Runs directly on the hardware (bare metal): ESXi, Hyper-V, KVM, Xen."],["Type 2 hypervisor?","Runs as an application on a host OS: VirtualBox, VMware Workstation."],["Which hypervisor type is used in data centers?","Type 1."],["What does a VM include?","Virtual hardware, its own guest OS and kernel, and applications."],["VM vs container?","A VM has its own OS kernel; containers share the host kernel and are lighter."],["What is a virtual switch?","Software inside the host connecting VMs' virtual NICs to each other and to physical uplinks."],["Standard vs distributed vSwitch?","Standard is per host; distributed is configured once across many hosts and follows VMs when they migrate."],["Physical switch port facing a hypervisor with VMs in several VLANs?","An 802.1Q trunk."],["What is NFV?","Network Functions Virtualization: routers, firewalls and other functions running as software on standard servers."],["Name a Cisco virtual router.","Catalyst 8000V."],["What is SR-IOV?","Lets a VM use a slice of the physical NIC directly, bypassing the vSwitch for performance."],["What is live migration?","Moving a running VM between hosts (vMotion)."],["Cisco NFV infrastructure software for branch?","NFVIS (Network Function Virtualization Infrastructure Software)."],["Why team uplinks on a hypervisor?","Redundancy and more bandwidth for VM traffic."],["Do two VMs on the same host and VLAN use the physical network to talk?","No, the virtual switch forwards between them inside the host."]],
vrf:[["What is a VRF?","A separate routing and forwarding table on one router, with its own interfaces."],["What does VRF-lite mean?","VRFs without MPLS: each VRF needs its own link (often a subinterface) between routers."],["Can two VRFs use the same subnet?","Yes, overlapping addresses are fine in different VRFs."],["What is a route distinguisher?","A value prepended to prefixes (RD:prefix) to make overlapping VRF routes unique in MP-BGP."],["What do route targets do?","Control which routes a VRF imports and exports."],["Multiprotocol VRF command?","vrf definition NAME, then address-family ipv4 / ipv6."],["Legacy IPv4-only VRF command?","ip vrf NAME."],["Assign an interface to a VRF?","vrf forwarding NAME (or ip vrf forwarding NAME for the legacy form)."],["What happens to the IP when you add vrf forwarding?","IOS removes it; you must re-enter the IP address."],["Static route in a VRF?","ip route vrf NAME prefix mask next-hop."],["Show a VRF's routing table?","show ip route vrf NAME."],["Ping inside a VRF?","ping vrf NAME address."],["Show interfaces per VRF?","show ip vrf interfaces (or show vrf)."],["OSPF inside a VRF?","router ospf ID vrf NAME."],["VRF is like a VLAN for which layer?","Layer 3."],["Why does a plain ping fail to a VRF destination?","It uses the global routing table, which doesn't have the VRF's routes."]],
gre:[["GRE IP protocol number?","47."],["GRE overhead?","24 bytes (20 outer IP + 4 GRE)."],["Does GRE carry multicast?","Yes, so routing protocols can run over it."],["Does GRE encrypt?","No. Add IPsec for confidentiality."],["When is a GRE tunnel up/up by default?","When the source has an IP and there's a route to the destination, even if the far end doesn't exist."],["How can a GRE tunnel detect a dead far end?","GRE keepalives."],["What is recursive routing on a tunnel?","Learning the route to the tunnel destination through the tunnel itself; the tunnel flaps."],["How do you avoid recursive routing?","Don't advertise the transport (tunnel source/destination) addresses into the tunnel's routing protocol."],["Common tunnel IP MTU with IPsec?","1400, with ip tcp adjust-mss 1360."],["ESP protocol number?","50."],["AH protocol number?","51."],["Why is AH rarely used?","It doesn't encrypt and breaks with NAT."],["IKE ports?","UDP 500, and UDP 4500 with NAT traversal."],["IKEv1 Phase 1 builds?","The ISAKMP (IKE) SA used to protect Phase 2."],["IKEv1 Phase 2 builds?","The IPsec SAs that protect data (quick mode)."],["Two IKEv2 advantages?","Fewer messages, built-in NAT-T and DPD, EAP support, better reliability."],["IPsec tunnel mode?","Encrypts the whole original packet and adds a new IP header; gateway to gateway."],["IPsec transport mode?","Protects the payload and keeps the original header; host to host or GRE over IPsec."],["What does a transform set define?","The ESP encryption and integrity algorithms (and mode)."],["What attaches IPsec to a tunnel interface?","tunnel protection ipsec profile NAME."],["What is a static VTI?","A native IPsec tunnel interface: tunnel mode ipsec ipv4. IP unicast only, no GRE."],["show crypto isakmp sa state QM_IDLE means?","Phase 1 is up and idle (good)."],["MM_NO_STATE means?","Phase 1 failed: policy, key or reachability problem."],["What does DMVPN build on?","Multipoint GRE (mGRE) with NHRP and IPsec."],["Why use GRE over IPsec instead of a crypto map?","A routable tunnel interface that carries multicast and routing protocols."]],
lisp:[["What does LISP separate?","Identity (EID) from location (RLOC)."],["In LISP, which address stays the same when a host moves?","The EID (Endpoint Identifier)."],["In LISP, which address changes when a host moves to another site?","The RLOC (Routing Locator) of the xTR it sits behind."],["What does the ITR do?","Looks up the destination EID and encapsulates traffic toward the RLOC."],["What does the ETR do?","Registers local EIDs with the map server and decapsulates incoming traffic."],["What is an xTR?","A router acting as both ITR and ETR."],["Map server's job?","Accepts EID-prefix registrations from ETRs."],["Map resolver's job?","Accepts map-requests from ITRs and resolves them."],["Who sends map-register?","ETRs, to the map server."],["Who sends map-request?","ITRs, to the map resolver."],["Who sends map-reply?","The ETR that owns the EID (or the map server on its behalf)."],["LISP data port?","UDP 4341."],["LISP control port?","UDP 4342."],["What are PITR and PETR?","Proxy routers connecting LISP sites with non-LISP sites."],["LISP's role in SD-Access?","The control plane: the control plane node is the MS/MR."],["Why does LISP help mobility?","A host keeps its EID; only its EID-to-RLOC mapping changes."]],
vxlan:[["VXLAN UDP port?","4789."],["VNI size?","24 bits, about 16 million segments."],["What is a VTEP?","VXLAN Tunnel Endpoint: encapsulates and decapsulates VXLAN."],["VXLAN overhead?","About 50 bytes."],["What does VXLAN carry inside UDP?","The original Ethernet frame."],["Why use a larger underlay MTU with VXLAN?","The extra 50 bytes would otherwise push full-size frames over 1500."],["Why is the outer UDP source port a hash?","So underlay ECMP spreads different inner flows over different paths."],["Flood and learn?","Broadcast and unknown traffic is flooded to all VTEPs in the VNI; VTEPs learn remote MACs from traffic."],["Common VXLAN control plane in data centers?","BGP EVPN."],["VXLAN control plane in SD-Access?","LISP."],["Layer 2 VNI vs Layer 3 VNI?","L2 VNI maps to a VLAN/bridge domain; L3 VNI maps to a VRF."],["Two ways to handle BUM traffic without EVPN?","Underlay multicast or head-end (ingress) replication."],["What does VXLAN-GPO add in SD-Access?","The Scalable Group Tag in the VXLAN header."],["Why is VXLAN better than stretching VLANs?","Millions of segments over a routed underlay with all links forwarding and no stretched STP."],["What address does a VTEP use as its tunnel source?","A loopback routable in the underlay."]]
};
const DECKS=[["hyper","Hypervisors and VMs"],["vrf","VRF"],["gre","GRE and IPsec"],["lisp","LISP"],["vxlan","VXLAN"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"Which hypervisor type runs directly on server hardware?",o:["Type 1","Type 2","Container runtime","Emulator"],a:0,e:"Bare metal."},
{q:"VirtualBox running on a laptop's Windows OS is a:",o:["Type 2 hypervisor","Type 1 hypervisor","Container","Virtual switch"],a:0,e:"Hosted on an OS."},
{q:"What do containers share that VMs don't?",o:["The host OS kernel","Virtual hardware","Separate guest OSes","Nothing"],a:0,e:"Containers share the kernel."},
{q:"An ESXi host runs VMs in VLANs 10, 20 and 30. How should the physical switch port be configured?",o:["802.1Q trunk allowing 10, 20 and 30","Access port in VLAN 10","Routed port","Shutdown"],a:0,e:"The vSwitch tags the VLANs."},
{q:"Which virtual switch keeps a VM's port settings when it migrates to another host?",o:["Distributed switch","Standard switch","Physical switch","None"],a:0,e:"Configured across hosts."},
{q:"What is NFV?",o:["Running network functions like routers and firewalls as software on standard servers","A new VLAN type that carries virtual machine traffic between hypervisors in the data center","A routing protocol","A cabling standard"],a:0,e:"Network Functions Virtualization."},
{q:"Two customers both use 10.1.1.0/24 and connect to the same router. What keeps them separate?",o:["VRFs","VLANs alone","ACLs","NAT on the ISP"],a:0,e:"Separate routing tables."},
{q:"An engineer types 'vrf forwarding BLUE' on an interface that already has an IP. What happens?",o:["The IP is removed and must be re-entered","The IP moves into BLUE automatically","The command is rejected","The interface shuts down"],a:0,e:"IOS removes the address."},
{q:"Which command shows the routing table of VRF RED?",o:["show ip route vrf RED","show ip route RED","show vrf RED routes","show ip vrf RED"],a:0,e:"The vrf keyword."},
{q:"A ping from the router to a host in VRF RED fails, but the host is reachable from other RED sites. Why?",o:["The ping used the global table; use ping vrf RED","The VRF is down on the router because the RD was changed","OSPF is missing","The RD is wrong"],a:0,e:"Plain ping is global."},
{q:"What is VRF-lite?",o:["VRFs without MPLS, using separate links or subinterfaces per VRF","A lightweight routing protocol","VRFs on switches only","VRFs with one route each"],a:0,e:"No MP-BGP or labels."},
{q:"What is the purpose of a route distinguisher?",o:["To make overlapping VRF prefixes unique in MP-BGP","To filter which routes each VRF imports from MP-BGP","To encrypt routes","To set the VRF's MTU"],a:0,e:"RD:prefix."},
{q:"What IP protocol number does GRE use?",o:["47","50","51","4789"],a:0,e:"GRE = 47."},
{q:"Why would you run OSPF over a GRE tunnel instead of a plain IPsec crypto map?",o:["GRE carries multicast, so OSPF hellos work","GRE encrypts","GRE is faster","Crypto maps don't support IP"],a:0,e:"Crypto maps can't carry multicast."},
{q:"A GRE tunnel interface shows up/up but the far router doesn't exist. Why?",o:["GRE tunnels come up with a source and a route to the destination, unless keepalives are on","The tunnel is broken, but the line protocol only goes down after the hold timer of the IGP expires","IPsec is negotiating","OSPF keeps it up"],a:0,e:"No end-to-end check by default."},
{q:"A tunnel flaps with %TUN-5-RECURDOWN. What is the cause?",o:["The route to the tunnel destination is learned through the tunnel","The IPsec pre-shared key is wrong on one end of the tunnel","MTU mismatch","Keepalives are off"],a:0,e:"Recursive routing."},
{q:"What is the overhead of GRE?",o:["24 bytes","8 bytes","50 bytes","4 bytes"],a:0,e:"20 + 4."},
{q:"Which IPsec protocol provides encryption?",o:["ESP","AH","IKE","GRE"],a:0,e:"ESP (50)."},
{q:"Which IPsec mode keeps the original IP header?",o:["Transport mode","Tunnel mode","Aggressive mode","Main mode"],a:0,e:"Transport protects the payload."},
{q:"Which mode is normally used for GRE over IPsec?",o:["Transport mode","Tunnel mode","Aggressive mode","None"],a:0,e:"GRE already adds the outer header."},
{q:"show crypto isakmp sa shows MM_NO_STATE. What failed?",o:["IKE Phase 1","IKE Phase 2","GRE","OSPF"],a:0,e:"Main mode didn't complete."},
{q:"Which ports must be open for IPsec with NAT traversal?",o:["UDP 500 and UDP 4500","TCP 500 and TCP 4500","UDP 4789","TCP 179"],a:0,e:"IKE and NAT-T."},
{q:"Which is an advantage of IKEv2 over IKEv1?",o:["Fewer messages and built-in NAT-T and DPD","It doesn't need keys","It uses AH","It works without UDP"],a:0,e:"Simpler and more robust."},
{q:"What attaches an IPsec profile to a GRE tunnel?",o:["tunnel protection ipsec profile","crypto map on the tunnel","ip ipsec enable","tunnel mode esp"],a:0,e:"Tunnel protection."},
{q:"What does 'tunnel mode ipsec ipv4' create?",o:["A static VTI without GRE","A GRE tunnel","A DMVPN hub","A LISP tunnel"],a:0,e:"Native IPsec tunnel interface."},
{q:"In LISP, what is an EID?",o:["The host's identity address","The router's locator","The map server","A tunnel ID"],a:0,e:"Endpoint Identifier."},
{q:"Which LISP device registers EID prefixes?",o:["ETR","ITR","Map resolver","PITR"],a:0,e:"ETRs send map-register."},
{q:"Which LISP device sends map-requests?",o:["ITR","ETR","Map server","RLOC"],a:0,e:"ITRs look up destinations."},
{q:"Which device receives map-requests from ITRs?",o:["Map resolver","Map server","ETR","PETR"],a:0,e:"MR takes requests."},
{q:"What connects a LISP site to non-LISP sites?",o:["PITR/PETR","ETR","Map server","VTEP"],a:0,e:"Proxy tunnel routers."},
{q:"What is the VXLAN destination UDP port?",o:["4789","4341","47","500"],a:0,e:"IANA 4789."},
{q:"How many segments can a VXLAN VNI identify?",o:["About 16 million","4094 (same as VLANs)","65535","1024"],a:0,e:"24 bits."},
{q:"What is a VTEP?",o:["The device that encapsulates and decapsulates VXLAN","A VLAN trunk between leaf and spine switches","A routing protocol","A VXLAN header field"],a:0,e:"Tunnel endpoint."},
{q:"Why should the underlay MTU be raised for VXLAN?",o:["VXLAN adds about 50 bytes","VXLAN removes headers","To disable fragmentation","MTU doesn't matter"],a:0,e:"Avoid fragmentation and drops."},
{q:"Which control plane replaces flood-and-learn in data center VXLAN fabrics?",o:["BGP EVPN","OSPF","STP","HSRP"],a:0,e:"EVPN distributes MAC/IP."},
{q:"Why does VXLAN put a flow hash in the outer UDP source port?",o:["So underlay ECMP load-shares flows","For encryption","To identify the VNI","For NAT"],a:0,e:"Entropy for hashing."},
{q:"In SD-Access, what are LISP and VXLAN used for?",o:["LISP control plane, VXLAN data plane","VXLAN control plane, LISP data plane","Both data plane","Both management"],a:0,e:"A classic exam pairing."},
{q:"A Layer 3 VNI maps to a:",o:["VRF","VLAN","Port","MAC"],a:0,e:"L2 VNI = VLAN, L3 VNI = VRF."},
{q:"Which statement about GRE is true?",o:["It provides no confidentiality on its own","It encrypts with AES","It only carries IPv4 unicast","It requires IKE"],a:0,e:"Pair it with IPsec."},
{q:"What does 'ip tcp adjust-mss 1360' on a tunnel do?",o:["Rewrites TCP SYNs so hosts send smaller segments that fit the tunnel","Sets the IP MTU of the tunnel interface to 1360 bytes for all IP traffic","Encrypts TCP","Disables fragmentation"],a:0,e:"Prevents fragmentation."}
];

registerModule({
  id:"virt",slug:"virtualization",title:"Virtualization",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["hyptype","vswitch","vrfsplit","vrfmini","encap","ikestep","tunpick","lispseq","lispq","vxlanpkt","overlays"],
  viz(){
sortViz($("#viz-hyptype"),{title:"Type 1, Type 2 or container?",bins:{t1:"Type 1 hypervisor",t2:"Type 2 hypervisor",ct:"Container"},done:"Sorted the virtualization types",items:[
  ["VMware ESXi on a blade server","t1","Bare metal."],["VirtualBox on a laptop","t2","Runs as an app on the OS."],["Docker running a web app","ct","Shares the host kernel."],["Microsoft Hyper-V Server","t1","Bare metal."],["VMware Workstation on Windows","t2","Hosted."],["A Kubernetes pod with two microservices","ct","Containers, orchestrated."],["KVM in the Linux kernel on a server","t1","KVM turns the kernel into a Type 1 hypervisor."]]});
stepViz($("#viz-vswitch"),{title:"Inside a virtualized host",done:"Followed traffic through a vSwitch",steps:[
  ["The host","A server runs ESXi with eight VMs. Each VM has one or more virtual NICs (vNICs)."],
  ["Port groups","The distributed switch has port groups for VLAN 10 (web), VLAN 20 (app) and VLAN 30 (database). Each vNIC sits in one."],
  ["VM to VM, same host and VLAN","Web1 talks to Web2: the vSwitch forwards it in memory. Nothing crosses a physical cable."],
  ["VM to VM, different VLAN","Web1 talks to App1: the frame goes out an uplink, tagged VLAN 10, to the physical switch, which routes it and sends it back tagged VLAN 20."],
  ["Uplinks","Two physical NICs team to two different top-of-rack switches. The switch ports are 802.1Q trunks carrying 10, 20 and 30."],
  ["vMotion","App1 moves to another host. Its port group and settings follow it because the distributed switch spans both hosts. Its IP and MAC don't change."]]});

/* ---- VRF splitter ---- */
(function(){const el=$("#viz-vrfsplit");let v="RED";const seen=new Set();
  const T={global:[["C","192.0.2.0/30","G0/0/0"],["S*","0.0.0.0/0","via 192.0.2.1"]],RED:[["C","10.1.1.0/24","G0/0/1"],["C","172.16.10.0/30","G0/0/0.10"],["S","10.9.0.0/16","via 172.16.10.2"]],BLUE:[["C","10.1.1.0/24","G0/0/2"],["C","172.16.20.0/30","G0/0/0.20"],["O","10.9.0.0/16","via 172.16.20.2"]]};
  function draw(){seen.add(v);el.innerHTML=`<div class="viz-title">One router, three routing tables</div><div class="chips">${Object.keys(T).map(k=>`<button class="chip" data-v="${k}" aria-pressed="${v===k}">${k==="global"?"Global table":"VRF "+k}</button>`).join("")}</div>
    <div class="term">${(v==="global"?"R1# show ip route":"R1# show ip route vrf "+v)+"\n"+(v==="global"?"":"Routing Table: "+v+"\n")+T[v].map(r=>r[0].padEnd(5)+r[1].padEnd(18)+r[2]).join("\n")}</div>
    <div class="caption" aria-live="polite">${v==="global"?"The global table only knows the internet uplink. It has no idea 10.1.1.0/24 exists.":v==="RED"?"RED and BLUE both have 10.1.1.0/24 and 10.9.0.0/16. No conflict: a packet arriving on G0/0/1 is only ever looked up here.":"BLUE learns its 10.9.0.0/16 from its own OSPF process (router ospf 20 vrf BLUE). RED never sees it."}</div><div class="rv-prog s-small">${seen.size} of 3 tables viewed</div>`;
    if(seen.size===3)award("viz:vrfsplit",20,"Explored all three routing tables")}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-v]");if(c){v=c.dataset.v;draw()}});draw()})();

iosViz($("#viz-vrfmini"),{title:"Mini lab: put a customer in its own VRF",scenario:"R1's G0/0/1 serves customer RED, but it's in the global table. Move it into a VRF named RED (RD 65000:1) without losing its address 10.1.1.1/24.",
  devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"RED-PC",ip:"10.1.1.10",gw:"10.1.1.1",at:"SW1:g1/0/2"}],
  boot:{R1:["hostname R1","interface g0/0/1","ip address 10.1.1.1 255.255.255.0","no shutdown"]},consoles:["R1"],startMode:"priv",topo:{R1:[150,70],SW1:[330,70],"RED-PC":[500,70]},topoH:130,
  tasks:[{t:"Create VRF RED with RD 65000:1 and the IPv4 address family",hint:"configure terminal\nvrf definition RED\nrd 65000:1\naddress-family ipv4\nexit-address-family",check:(w,D)=>D.R1.vrfs.RED&&D.R1.vrfs.RED.rd==="65000:1"},
    {t:"Put G0/0/1 in RED and re-add 10.1.1.1/24 (IOS removes it)",hint:"interface g0/0/1\nvrf forwarding RED\nip address 10.1.1.1 255.255.255.0",check:(w,D)=>{const i=D.R1.ifs[IOS.ifName("g0/0/1")];return i.vrf==="RED"&&i.ip===ip("10.1.1.1")}},
    {t:"Ping the customer PC inside the VRF",hint:"end\nping vrf RED 10.1.1.10",check:(w,D,S)=>ranCmd(S,"R1",/ping vrf RED 10\.1\.1\.10/i)&&pingOk(w,D,"R1","10.1.1.10",{vrf:"RED"})}],
  solution:"configure terminal\nvrf definition RED\nrd 65000:1\naddress-family ipv4\nexit-address-family\ninterface g0/0/1\nvrf forwarding RED\nip address 10.1.1.1 255.255.255.0\nend\nping vrf RED 10.1.1.10",
  success:"Now try 'ping 10.1.1.10' without vrf: it fails, because the global table no longer has that subnet."},"vrfmini",40,"VRF mini lab");

/* ---- encapsulation builder ---- */
(function(){const el=$("#viz-encap");let m="gre";const seen=new Set();
  const L={plain:[["IP","10.10.1.5 → 10.20.1.9"],["TCP","443"],["Data",""]],gre:[["IP","203.0.113.1 → 198.51.100.2"],["GRE","proto 47"],["IP","10.10.1.5 → 10.20.1.9"],["TCP",""],["Data",""]],
    tun:[["IP","203.0.113.1 → 198.51.100.2"],["ESP","proto 50"],["IP","10.10.1.5 → 10.20.1.9",1],["TCP","",1],["Data","",1],["ESP trailer/ICV",""]],
    tr:[["IP","203.0.113.1 → 198.51.100.2"],["ESP","proto 50"],["GRE","",1],["IP","10.10.1.5 → 10.20.1.9",1],["TCP","",1],["Data","",1],["ESP trailer/ICV",""]],
    vxlan:[["Ethernet","outer"],["IP","VTEP1 → VTEP2"],["UDP","dst 4789"],["VXLAN","VNI 5010"],["Ethernet","inner"],["IP",""],["TCP",""],["Data",""]]};
  const N={plain:"Original packet",gre:"GRE",tun:"IPsec tunnel mode",tr:"GRE over IPsec (transport)",vxlan:"VXLAN"};
  const E={plain:"The private addresses can't cross the internet as they are.",gre:"GRE adds 24 bytes: a new public IP header and the GRE header. The inner packet is readable by anyone on the path.",tun:"ESP encrypts the whole original packet (shaded) and a new outer header carries it gateway to gateway. Only IP unicast fits, so no OSPF hellos.",tr:"GRE wraps the packet first, then ESP in transport mode encrypts the GRE packet. Multicast and routing protocols work, and everything is encrypted.",vxlan:"A whole Ethernet frame inside UDP 4789. The VNI says which segment it belongs to. About 50 bytes of overhead."};
  function draw(){seen.add(m);el.innerHTML=`<div class="viz-title">Encapsulation builder</div><div class="chips">${Object.keys(N).map(k=>`<button class="chip" data-m="${k}" aria-pressed="${m===k}">${N[k]}</button>`).join("")}</div>
    <div class="viz-scroll"><div style="display:flex;gap:4px;min-width:460px;margin:10px 0">${L[m].map(h=>`<div class="rv-c${h[2]?" sel":""}" style="flex:1;padding:8px 4px;text-align:center"><b>${h[0]}</b><span class="s-small" style="display:block">${h[1]}${h[2]?" 🔒":""}</span></div>`).join("")}</div></div>
    <div class="caption" aria-live="polite">${E[m]}</div><div class="rv-prog s-small">${seen.size} of 5 viewed</div>`;if(seen.size===5)award("viz:encap",20,"Built every encapsulation")}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-m]");if(c){m=c.dataset.m;draw()}});draw()})();

seqViz($("#viz-ikestep"),{title:"IKEv1 brings up an IPsec tunnel",left:"HQ",right:"Branch",done:"Followed IKE phase 1 and 2",intro:"Interesting traffic arrives at the tunnel. No SAs exist yet.",steps:[
  {dir:"r",label:"Phase 1: propose policies",sub:"AES-256, SHA-256, pre-share, DH 14",text:"Main mode message 1: HQ offers its ISAKMP policies. The branch must have a matching one (encryption, hash, authentication, DH group). Lifetime can differ: the lower wins."},
  {dir:"l",label:"Phase 1: accept",sub:"policy 10 matches",text:"No matching policy means the SA stops here: MM_NO_STATE."},
  {dir:"r",label:"Diffie-Hellman exchange",sub:"shared secret, no key on the wire",text:"Both sides compute the same secret from public values. Nothing an eavesdropper sees reveals it."},
  {dir:"l",label:"Authenticate",sub:"pre-shared key or certificate",text:"Each side proves its identity. A wrong pre-shared key fails here. Phase 1 is now complete: QM_IDLE."},
  {dir:"r",label:"Phase 2: quick mode",sub:"transform set esp-aes 256 esp-sha256-hmac",text:"Protected by the Phase 1 SA, the peers agree the transform set and the traffic to protect (for GRE over IPsec: GRE between the two public IPs)."},
  {dir:"l",label:"IPsec SAs up",sub:"one each direction, with SPIs",text:"Two unidirectional IPsec SAs exist. show crypto ipsec sa now shows encaps and decaps counting up."}],
  end:"IKEv2 does the same job in fewer messages (IKE_SA_INIT and IKE_AUTH), with NAT-T and dead peer detection built in."});

quizViz($("#viz-tunpick"),{title:"Pick the tunnel",done:"Picked the right tunnel every time",qs:[
  ["Two sites need OSPF between them across the internet, encrypted.",["GRE over IPsec (or a VTI)","Plain GRE","A crypto map with no tunnel","VXLAN"],0,"Routing protocol + encryption."],
  ["A lab needs IPv6 between two routers across an IPv4-only path; security isn't a concern.",["GRE (or a 6in4 tunnel)","IPsec transport only","LISP","SPAN"],0,"GRE carries IPv6."],
  ["A hub needs tunnels to 400 spokes and spokes should build direct tunnels on demand.",["DMVPN (mGRE + NHRP + IPsec)","400 point-to-point GRE tunnels","VXLAN","VRF-lite"],0,"Dynamic spoke to spoke."],
  ["You need the lowest overhead encrypted routed interface and only IP unicast plus routing protocols.",["Static VTI (tunnel mode ipsec ipv4)","GRE over IPsec","Plain GRE","LISP"],0,"No GRE header."],
  ["Stretch a Layer 2 segment for VMs across a routed data center fabric.",["VXLAN","GRE","IPsec","PBR"],0,"Ethernet over UDP."]]});

seqViz($("#viz-lispseq"),{title:"LISP: finding a host that moved",left:"ITR (site 1)",right:"MS/MR",done:"Followed a LISP lookup",intro:"Host A (EID 10.1.0.10) at site 1 sends to host B (EID 10.2.0.50). B's site ETR has RLOC 192.0.2.2.",steps:[
  {dir:"l",label:"(earlier) map-register",sub:"ETR2: 10.2.0.0/16 at 192.0.2.2",dash:true,text:"Every ETR registers its EID prefixes with the map server when it comes up and refreshes them."},
  {dir:"r",label:"Map-request",sub:"Where is 10.2.0.50?",text:"The ITR has no cached mapping for 10.2.0.50, so it asks the map resolver."},
  {dir:"l",label:"Map-reply (via ETR2)",sub:"10.2.0.0/16 → RLOC 192.0.2.2",text:"The map server forwards the request to ETR2, which replies directly to the ITR with its RLOC, priority and weight."},
  {dir:"r",label:"Encapsulated data",sub:"outer 192.0.2.1 → 192.0.2.2, UDP 4341",dash:true,text:"The ITR caches the mapping and sends the packet encapsulated to the RLOC. The core only routes RLOCs."},
  {dir:"l",label:"B moves to site 3",sub:"ETR3 registers 10.2.0.50/32",text:"B keeps its EID. ETR3 registers it, the map server updates its database, and ITRs with stale cache entries are told to refresh (solicit map-request)."}],
  end:"Identity stayed the same; only the locator changed."});
quizViz($("#viz-lispq"),{title:"LISP roles",done:"Named every LISP role",qs:[
  ["Which device sends map-register messages?",["ETR","ITR","Map resolver","PITR"],0,"ETRs register their EIDs."],
  ["Which device does an ITR send map-requests to?",["Map resolver","Map server","ETR","Another ITR"],0,"MR takes requests."],
  ["What address must be routable in the core?",["RLOC","EID","Both","Neither"],0,"Only locators."],
  ["Traffic from a LISP site to a regular internet site uses a:",["PETR","Map server","ETR","VTEP"],0,"Proxy egress tunnel router."],
  ["In SD-Access, the fabric edge acts as a LISP:",["xTR","Map server","PITR","Map resolver"],0,"Edges are ITR and ETR."]]});

stepViz($("#viz-vxlanpkt"),{title:"A frame crosses a VXLAN fabric",done:"Followed a frame through VXLAN",steps:[
  ["Server sends a frame","VM1 (VLAN 10) sends an Ethernet frame to VM2's MAC. VM2 is on another leaf."],
  ["Ingress VTEP lookup","Leaf1 maps VLAN 10 to VNI 10010 and looks up VM2's MAC. Learned via BGP EVPN: it's behind VTEP 10.255.0.4."],
  ["Encapsulate","Leaf1 adds the VXLAN header (VNI 10010), a UDP header (destination 4789, source port = hash of the inner flow), an outer IP header 10.255.0.1 → 10.255.0.4 and an outer Ethernet header."],
  ["Underlay","Spines route it like any IP packet using ECMP. They don't know about VNIs or VM MACs."],
  ["Decapsulate","Leaf4 strips the outer headers, maps VNI 10010 back to its local VLAN 10 and delivers the original frame to VM2."],
  ["BUM traffic","A broadcast (like ARP) would go to every VTEP in VNI 10010 by multicast or head-end replication, unless EVPN ARP suppression answers locally."]]});
revealViz($("#viz-overlays"),{title:"Overlay technologies at a glance",cols:3,done:"Compared every overlay",items:[
  ["GRE","IP 47","Point-to-point (or mGRE). Carries any protocol including multicast. No security. 24 bytes."],
  ["IPsec","ESP 50, IKE UDP 500/4500","Encryption and integrity. Tunnel or transport mode. Unicast only unless combined with GRE or a VTI."],
  ["LISP","UDP 4341/4342","Locator/ID separation. Map server and resolver, ITRs and ETRs. Control plane in SD-Access."],
  ["VXLAN","UDP 4789","Layer 2 over Layer 3. 24-bit VNI, VTEPs, ~50 bytes. Data plane in SD-Access and EVPN fabrics."],
  ["VRF","No encapsulation","Separate routing tables on one device. VRF-lite needs one link per VRF; MPLS VPNs carry many."],
  ["SD-WAN","IPsec + OMP","IPsec mesh between WAN Edges, controlled by OMP from the Controllers."]]});
  },
  sims:[
    {id:"vrflab",type:"ios",title:"VRF-lite for two tenants with overlapping addresses",lab:{
      scenario:"R1 serves two tenants who both use 10.1.1.0/24 locally and both reach a service at 10.9.9.9 in their own environment behind R2. R2 is already done: subinterface G0/0/0.10 (172.16.10.2) is in VRF RED and G0/0/0.20 (172.16.20.2) is in VRF BLUE. Build the R1 side.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"SWR",kind:"switch"},{name:"SWB",kind:"switch"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R1:g0/0/1","SWR:g1/0/1"],["R1:g0/0/2","SWB:g1/0/1"]],hosts:[{name:"RED-PC",ip:"10.1.1.10",gw:"10.1.1.1",at:"SWR:g1/0/2"},{name:"BLUE-PC",ip:"10.1.1.10",gw:"10.1.1.1",at:"SWB:g1/0/2"}],
      boot:{R2:["hostname R2","vrf definition RED","rd 65000:1","address-family ipv4","exit-address-family","vrf definition BLUE","rd 65000:2","address-family ipv4","exit-address-family","interface g0/0/0","no shutdown","interface g0/0/0.10","encapsulation dot1q 10","vrf forwarding RED","ip address 172.16.10.2 255.255.255.252","interface g0/0/0.20","encapsulation dot1q 20","vrf forwarding BLUE","ip address 172.16.20.2 255.255.255.252","interface loopback1","vrf forwarding RED","ip address 10.9.9.9 255.255.255.255","interface loopback2","vrf forwarding BLUE","ip address 10.9.9.9 255.255.255.255","ip route vrf RED 10.1.1.0 255.255.255.0 172.16.10.1","ip route vrf BLUE 10.1.1.0 255.255.255.0 172.16.20.1"],R1:["hostname R1","interface g0/0/0","no shutdown","interface g0/0/1","no shutdown","interface g0/0/2","no shutdown"]},
      consoles:["R1","R2"],startMode:"priv",topo:{SWR:[110,50],SWB:[110,180],R1:[300,115],R2:[500,115],"RED-PC":[110,0],"BLUE-PC":[110,235]},topoH:250,
      tasks:[
        {t:"Create VRFs RED (rd 65000:1) and BLUE (rd 65000:2) with the IPv4 address family",hint:"vrf definition RED\nrd 65000:1\naddress-family ipv4\nexit-address-family\nvrf definition BLUE\nrd 65000:2\naddress-family ipv4\nexit-address-family",check:(w,D)=>D.R1.vrfs.RED?.rd==="65000:1"&&D.R1.vrfs.BLUE?.rd==="65000:2"},
        {t:"G0/0/1 in RED and G0/0/2 in BLUE, both 10.1.1.1/24",hint:"interface g0/0/1\nvrf forwarding RED\nip address 10.1.1.1 255.255.255.0",check:(w,D)=>{const a=D.R1.ifs[IOS.ifName("g0/0/1")],b=D.R1.ifs[IOS.ifName("g0/0/2")];return a.vrf==="RED"&&b.vrf==="BLUE"&&a.ip===ip("10.1.1.1")&&b.ip===ip("10.1.1.1")}},
        {t:"Subinterfaces to R2: G0/0/0.10 (VLAN 10, RED, 172.16.10.1/30) and G0/0/0.20 (VLAN 20, BLUE, 172.16.20.1/30)",hint:"interface g0/0/0.10\nencapsulation dot1q 10\nvrf forwarding RED\nip address 172.16.10.1 255.255.255.252",check:(w,D)=>{const a=D.R1.ifs[IOS.ifName("g0/0/0")+".10"],b=D.R1.ifs[IOS.ifName("g0/0/0")+".20"];return a&&b&&a.vrf==="RED"&&b.vrf==="BLUE"&&a.ip===ip("172.16.10.1")&&b.ip===ip("172.16.20.1")}},
        {t:"Static routes: 10.9.9.9/32 in each VRF via its own R2 address",hint:"ip route vrf RED 10.9.9.9 255.255.255.255 172.16.10.2\nip route vrf BLUE 10.9.9.9 255.255.255.255 172.16.20.2",check:(w,D)=>hasRoute(w,D,"R1","10.9.9.9",32,"S","RED")&&hasRoute(w,D,"R1","10.9.9.9",32,"S","BLUE")},
        {t:"Prove both tenants reach their own 10.9.9.9",hint:"end\nping vrf RED 10.9.9.9\nping vrf BLUE 10.9.9.9",check:(w,D,S)=>ranCmd(S,"R1",/ping vrf RED 10\.9\.9\.9/i)&&ranCmd(S,"R1",/ping vrf BLUE 10\.9\.9\.9/i)&&pingOk(w,D,"R1","10.9.9.9",{vrf:"RED"})&&pingOk(w,D,"R1","10.9.9.9",{vrf:"BLUE"})}],
      solution:"configure terminal\nvrf definition RED\nrd 65000:1\naddress-family ipv4\nexit-address-family\nvrf definition BLUE\nrd 65000:2\naddress-family ipv4\nexit-address-family\ninterface g0/0/1\nvrf forwarding RED\nip address 10.1.1.1 255.255.255.0\ninterface g0/0/2\nvrf forwarding BLUE\nip address 10.1.1.1 255.255.255.0\ninterface g0/0/0.10\nencapsulation dot1q 10\nvrf forwarding RED\nip address 172.16.10.1 255.255.255.252\ninterface g0/0/0.20\nencapsulation dot1q 20\nvrf forwarding BLUE\nip address 172.16.20.1 255.255.255.252\nip route vrf RED 10.9.9.9 255.255.255.255 172.16.10.2\nip route vrf BLUE 10.9.9.9 255.255.255.255 172.16.20.2\nend\nping vrf RED 10.9.9.9\nping vrf BLUE 10.9.9.9",
      success:"Same subnet twice and the same destination twice on one router, with no conflict. Run show ip route vrf RED and show ip route vrf BLUE to see the two tables."}},
    {id:"grelab",type:"ios",title:"GRE tunnel with OSPF between two sites",lab:{
      scenario:"HQ (LAN 10.10.0.0/24 on Loopback0) and BR (LAN 10.20.0.0/24 on Loopback0) connect to the internet through ISP. ISP knows only the public /30s, not the private LANs. Build a GRE tunnel (172.16.0.0/30) and run OSPF over it so the LANs reach each other. BR is already done.",
      devices:[{name:"HQ",kind:"router"},{name:"ISP",kind:"router"},{name:"BR",kind:"router"}],links:[["HQ:g0/0/0","ISP:g0/0/0"],["ISP:g0/0/1","BR:g0/0/0"]],
      boot:{ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.1 255.255.255.252","no shutdown"],
        HQ:["hostname HQ","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.10.0.1 255.255.255.0","ip ospf network point-to-point"],
        BR:["hostname BR","interface g0/0/0","ip address 198.51.100.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.20.0.1 255.255.255.0","ip ospf network point-to-point","ip route 0.0.0.0 0.0.0.0 198.51.100.1","interface tunnel0","ip address 172.16.0.2 255.255.255.252","tunnel source g0/0/0","tunnel destination 203.0.113.2","router ospf 1","router-id 2.2.2.2","network 172.16.0.0 0.0.0.3 area 0","network 10.20.0.0 0.0.0.255 area 0"]},
      consoles:["HQ"],startMode:"priv",topo:{HQ:[100,80],ISP:[300,80],BR:[500,80]},topoH:150,
      tasks:[
        {t:"Give HQ a default route to the ISP (203.0.113.1)",hint:"ip route 0.0.0.0 0.0.0.0 203.0.113.1",check:(w,D)=>D.HQ.routes.some(r=>r.len===0&&r.nh===ip("203.0.113.1"))},
        {t:"Tunnel0: 172.16.0.1/30, source G0/0/0, destination 198.51.100.2",hint:"interface tunnel0\nip address 172.16.0.1 255.255.255.252\ntunnel source g0/0/0\ntunnel destination 198.51.100.2",check:(w,D)=>{const t=D.HQ.ifs.Tunnel0;return t&&t.ip===ip("172.16.0.1")&&t.tun&&t.tun.dst===ip("198.51.100.2")&&IOS.lineUp(w,D.HQ,t)}},
        {t:"OSPF 1 (router-id 1.1.1.1) on the tunnel and the LAN only. Don't advertise the public link",hint:"router ospf 1\nrouter-id 1.1.1.1\nnetwork 172.16.0.0 0.0.0.3 area 0\nnetwork 10.10.0.0 0.0.0.255 area 0",check:(w,D)=>adjState(w,"HQ","BR")==="FULL"&&hasRoute(w,D,"HQ","10.20.0.0",24,"O")&&!IOS.ospfIfCfg(w,D.HQ,D.HQ.ifs[IOS.ifName("g0/0/0")],false)},
        {t:"Ping BR's LAN from HQ's LAN",hint:"end\nping 10.20.0.1 source loopback0",check:(w,D,S)=>ranCmd(S,"HQ",/ping 10\.20\.0\.1 so/i)&&pingOk(w,D,"HQ","10.20.0.1",{src:ip("10.10.0.1")})}],
      solution:"configure terminal\nip route 0.0.0.0 0.0.0.0 203.0.113.1\ninterface tunnel0\nip address 172.16.0.1 255.255.255.252\ntunnel source g0/0/0\ntunnel destination 198.51.100.2\nrouter ospf 1\nrouter-id 1.1.1.1\nnetwork 172.16.0.0 0.0.0.3 area 0\nnetwork 10.10.0.0 0.0.0.255 area 0\nend\nping 10.20.0.1 source loopback0",
      success:"OSPF hellos are multicast, and GRE carries them. The ISP only ever sees packets between 203.0.113.2 and 198.51.100.2. Look at show interfaces tunnel 0 and show ip ospf neighbor."}},
    {id:"ipseclab",type:"ios",title:"Encrypt the GRE tunnel with IPsec",lab:{
      scenario:"The GRE tunnel between HQ and BR works, but it's in clear text across the internet. BR already has its IPsec settings. Match them on HQ: ISAKMP policy 10 with AES-256, SHA-256, pre-shared keys and DH group 14; key Encor!Key for 198.51.100.2; transform set TS with esp-aes 256 esp-sha256-hmac in transport mode; profile VPN on Tunnel0.",
      devices:[{name:"HQ",kind:"router"},{name:"ISP",kind:"router"},{name:"BR",kind:"router"}],links:[["HQ:g0/0/0","ISP:g0/0/0"],["ISP:g0/0/1","BR:g0/0/0"]],
      boot:{ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.1 255.255.255.252","no shutdown"],
        HQ:["hostname HQ","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1","interface loopback0","ip address 10.10.0.1 255.255.255.0","interface tunnel0","ip address 172.16.0.1 255.255.255.252","tunnel source g0/0/0","tunnel destination 198.51.100.2","ip route 10.20.0.0 255.255.255.0 172.16.0.2"],
        BR:["hostname BR","interface g0/0/0","ip address 198.51.100.2 255.255.255.252","no shutdown","ip route 0.0.0.0 0.0.0.0 198.51.100.1","interface loopback0","ip address 10.20.0.1 255.255.255.0","crypto isakmp policy 10","encryption aes 256","hash sha256","authentication pre-share","group 14","crypto isakmp key Encor!Key address 203.0.113.2","crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac","mode transport","crypto ipsec profile VPN","set transform-set TS","interface tunnel0","ip address 172.16.0.2 255.255.255.252","tunnel source g0/0/0","tunnel destination 203.0.113.2","tunnel protection ipsec profile VPN","ip route 10.10.0.0 255.255.255.0 172.16.0.1"]},
      consoles:["HQ"],startMode:"priv",topo:{HQ:[100,80],ISP:[300,80],BR:[500,80]},topoH:150,
      tasks:[
        {t:"ISAKMP policy 10: aes 256, sha256, pre-share, group 14",hint:"crypto isakmp policy 10\nencryption aes 256\nhash sha256\nauthentication pre-share\ngroup 14",check:(w,D)=>{const p=D.HQ.crypto.isakmp[10];return p&&p.enc==="aes 256"&&p.hash==="sha256"&&p.auth==="pre-share"&&+p.group===14}},
        {t:"Pre-shared key Encor!Key for 198.51.100.2",hint:"crypto isakmp key Encor!Key address 198.51.100.2",check:(w,D)=>D.HQ.crypto.keys[String(ip("198.51.100.2"))]==="Encor!Key"},
        {t:"Transform set TS (esp-aes 256 esp-sha256-hmac, transport) and profile VPN using it",hint:"crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac\nmode transport\ncrypto ipsec profile VPN\nset transform-set TS",check:(w,D)=>D.HQ.crypto.ts.TS&&D.HQ.crypto.ts.TS.mode==="transport"&&D.HQ.crypto.prof.VPN?.ts==="TS"},
        {t:"Protect Tunnel0 with profile VPN",hint:"interface tunnel0\ntunnel protection ipsec profile VPN",check:(w,D)=>D.HQ.ifs.Tunnel0.tun.prot==="VPN"},
        {t:"Confirm the SA is QM_IDLE and BR's LAN answers",hint:"end\nshow crypto isakmp sa\nping 10.20.0.1 source loopback0",check:(w,D,S)=>ranCmd(S,"HQ",/sh\S* cry\S* isa\S* sa/i)&&pingOk(w,D,"HQ","10.20.0.1",{src:ip("10.10.0.1")})}],
      solution:"configure terminal\ncrypto isakmp policy 10\nencryption aes 256\nhash sha256\nauthentication pre-share\ngroup 14\ncrypto isakmp key Encor!Key address 198.51.100.2\ncrypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac\nmode transport\ncrypto ipsec profile VPN\nset transform-set TS\ninterface tunnel0\ntunnel protection ipsec profile VPN\nend\nshow crypto isakmp sa\nping 10.20.0.1 source loopback0",
      success:"Before you protected HQ's side, BR was sending ESP and HQ plain GRE, so nothing passed. Both ends must agree on every Phase 1 and Phase 2 setting."}},
    {id:"tunfix",type:"ios",title:"Troubleshoot a broken IPsec tunnel",lab:{
      scenario:"After a 'quick change' last night, the encrypted tunnel from HQ to BR is down. Use show interfaces tunnel 0, show crypto isakmp sa and show running-config on HQ to find and fix the problems. BR's settings are correct and match the lesson: policy 10 aes 256 / sha256 / pre-share / group 14, key Encor!Key, transform set esp-aes 256 esp-sha256-hmac in transport mode.",
      devices:[{name:"HQ",kind:"router"},{name:"ISP",kind:"router"},{name:"BR",kind:"router"}],links:[["HQ:g0/0/0","ISP:g0/0/0"],["ISP:g0/0/1","BR:g0/0/0"]],
      boot:{ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.1 255.255.255.252","no shutdown"],
        HQ:["hostname HQ","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface loopback0","ip address 10.10.0.1 255.255.255.0","crypto isakmp policy 10","encryption aes 256","hash sha256","authentication pre-share","group 5","crypto isakmp key Encor!key address 198.51.100.2","crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac","mode transport","crypto ipsec profile VPN","set transform-set TS","interface tunnel0","ip address 172.16.0.1 255.255.255.252","tunnel source g0/0/0","tunnel destination 198.51.100.2","tunnel protection ipsec profile VPN","ip route 10.20.0.0 255.255.255.0 172.16.0.2"],
        BR:["hostname BR","interface g0/0/0","ip address 198.51.100.2 255.255.255.252","no shutdown","ip route 0.0.0.0 0.0.0.0 198.51.100.1","interface loopback0","ip address 10.20.0.1 255.255.255.0","crypto isakmp policy 10","encryption aes 256","hash sha256","authentication pre-share","group 14","crypto isakmp key Encor!Key address 203.0.113.2","crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac","mode transport","crypto ipsec profile VPN","set transform-set TS","interface tunnel0","ip address 172.16.0.2 255.255.255.252","tunnel source g0/0/0","tunnel destination 203.0.113.2","tunnel protection ipsec profile VPN","ip route 10.10.0.0 255.255.255.0 172.16.0.1"]},
      consoles:["HQ"],startMode:"priv",topo:{HQ:[100,80],ISP:[300,80],BR:[500,80]},topoH:150,
      tasks:[
        {t:"Fix whatever stops the tunnel interface from coming up (hint: how does HQ reach 198.51.100.2?)",hint:"configure terminal\nip route 0.0.0.0 0.0.0.0 203.0.113.1",check:(w,D)=>IOS.lineUp(w,D.HQ,D.HQ.ifs.Tunnel0),sticky:true},
        {t:"Fix the Phase 1 policy mismatch",hint:"crypto isakmp policy 10\ngroup 14",check:(w,D)=>+D.HQ.crypto.isakmp[10]?.group===14},
        {t:"Fix the pre-shared key (keys are case-sensitive)",hint:"no crypto isakmp key Encor!key address 198.51.100.2\ncrypto isakmp key Encor!Key address 198.51.100.2",check:(w,D)=>D.HQ.crypto.keys[String(ip("198.51.100.2"))]==="Encor!Key"},
        {t:"Verify: QM_IDLE and BR's LAN answers",hint:"end\nshow crypto isakmp sa\nping 10.20.0.1 source loopback0",check:(w,D,S)=>ranCmd(S,"HQ",/sh\S* cry\S* isa/i)&&pingOk(w,D,"HQ","10.20.0.1",{src:ip("10.10.0.1")})}],
      solution:"configure terminal\nip route 0.0.0.0 0.0.0.0 203.0.113.1\ncrypto isakmp policy 10\ngroup 14\nno crypto isakmp key Encor!key address 198.51.100.2\ncrypto isakmp key Encor!Key address 198.51.100.2\nend\nshow crypto isakmp sa\nping 10.20.0.1 source loopback0",
      success:"Three layers: the tunnel needs a route to its destination, Phase 1 needs matching policies, and authentication needs the exact same key."}},
    {id:"lisporder",type:"order",title:"Order the LISP conversation",scenario:"Host A at site 1 sends its first packet to host B at site 2. Put the LISP steps in order.",
      steps:["Site 2's ETR sends a map-register for B's EID prefix to the map server","Host A sends a packet to B's EID; it reaches site 1's ITR","The ITR sends a map-request to the map resolver","The map server forwards the request to site 2's ETR","Site 2's ETR sends a map-reply with its RLOC to the ITR","The ITR caches the mapping and encapsulates the packet to the RLOC","Site 2's ETR decapsulates and delivers the packet to host B"],success:"Register, request, reply, encapsulate, decapsulate."},
    {id:"vxlanmatch",type:"match",title:"Overlay numbers and terms",scenario:"Match each value or term to what it is.",
      items:[["UDP 4789","vx"],["24-bit VNI","vni"],["IP protocol 47","gre"],["IP protocol 50","esp"],["UDP 500 / 4500","ike"],["UDP 4341","lisp"],["VTEP","vtep"],["BGP EVPN","evpn"]],
      slots:[["vx","VXLAN destination port",""],["vni","About 16 million segments",""],["gre","GRE",""],["esp","IPsec encryption protocol",""],["ike","Key exchange and NAT traversal",""],["lisp","LISP data packets",""],["vtep","Encapsulates and decapsulates VXLAN",""],["evpn","Control plane for data center VXLAN",""]],
      success:"Numbers like these appear directly in ENCOR questions."}
  ],
  badges:[
    ["reader","VRT","Virtually Certain","Mark all 5 virtualization lessons studied",c=>c.allStudied()],
    ["lab","OVL","Overlay Expert","Complete all 11 diagrams in this module",c=>c.vizAll()],
    ["vrf","RD","Route Distinguished","Pass the VRF-lite lab",c=>c.passed("vrflab")],
    ["gre","47","Tunnel Vision","Pass the GRE with OSPF lab",c=>c.passed("grelab")],
    ["ipsec","ESP","Encrypted Everywhere","Pass the GRE over IPsec lab",c=>c.passed("ipseclab")],
    ["tunfix","QM","QM_IDLE","Fix the broken IPsec tunnel",c=>c.passed("tunfix")],
    ["lisp","EID","Who and Where","Pass the LISP order and follow a LISP lookup",c=>c.passed("lisporder")&&c.earned("viz:lispseq")],
    ["vxlan","VNI","Sixteen Million Segments","Pass the overlay match and follow a VXLAN frame",c=>c.passed("vxlanmatch")&&c.earned("viz:vxlanpkt")],
    ["perfect","10%","Domain Two Down","Score 100% on a virtualization quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
