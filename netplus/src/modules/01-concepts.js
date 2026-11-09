/* ================= Module 1: Networking Concepts (N10-009 Domain 1.0, 23%) ================= */
(function(){
const PORTS=[
 ["20/21","TCP","FTP","File transfer. 21 carries commands, 20 carries data. No encryption."],
 ["22","TCP","SSH / SFTP","Encrypted remote command line. SFTP and SCP ride on top of SSH."],
 ["23","TCP","Telnet","Unencrypted remote command line. Replace it with SSH."],
 ["25","TCP","SMTP","Relays email between mail servers."],
 ["53","TCP/UDP","DNS","Name resolution. UDP for most queries, TCP for zone transfers and large replies."],
 ["67/68","UDP","DHCP","Automatic IP settings. Server listens on 67, client on 68."],
 ["69","UDP","TFTP","Trivial file transfer with no login. Used to push firmware and configs to devices."],
 ["80","TCP","HTTP","Unencrypted web traffic."],
 ["123","UDP","NTP","Keeps clocks in sync. Logs and certificates depend on it."],
 ["161/162","UDP","SNMP","Polls network devices (161). Devices send traps to the manager on 162."],
 ["389","TCP/UDP","LDAP","Queries a directory such as Active Directory."],
 ["443","TCP","HTTPS","Web traffic encrypted with TLS."],
 ["445","TCP","SMB","Windows file and printer sharing."],
 ["514","UDP","Syslog","Sends log messages to a central log server."],
 ["587","TCP","SMTPS","Email submission secured with TLS (STARTTLS)."],
 ["636","TCP","LDAPS","LDAP over TLS."],
 ["1433","TCP","SQL Server","Microsoft SQL Server database connections."],
 ["3389","TCP","RDP","Remote Desktop to a Windows graphical session."],
 ["5060/5061","TCP/UDP","SIP","Sets up VoIP calls. 5061 is SIP over TLS."]
];
const portRows=PORTS.map(p=>`<tr><td class="port">${p[0]}</td><td><b>${p[2]}</b></td><td><span class="tag">${p[1]}</span></td><td>${p[3]}</td></tr>`).join("");

const LESSONS=[
{id:"osi",num:"1.1",title:"The OSI reference model",html:`
<p>The <b>OSI model</b> splits networking into seven layers. Each layer does one job and talks only to the layers directly above and below it. Troubleshooters use it as a shared language: "it's a Layer 1 problem" means a cable, port or signal issue.</p>
<div class="scroll"><table><thead><tr><th>#</th><th>Layer</th><th>PDU</th><th>What happens here</th><th>Examples</th></tr></thead><tbody>
<tr><td class="port">7</td><td><b>Application</b></td><td>Data</td><td>Network services the user's software talks to</td><td>HTTP, DNS, SMTP, FTP</td></tr>
<tr><td class="port">6</td><td><b>Presentation</b></td><td>Data</td><td>Formatting, character sets, compression, encryption</td><td>TLS/SSL, JPEG, ASCII</td></tr>
<tr><td class="port">5</td><td><b>Session</b></td><td>Data</td><td>Opens, manages and closes conversations between hosts</td><td>RPC, NetBIOS session, SQL sessions</td></tr>
<tr><td class="port">4</td><td><b>Transport</b></td><td>Segment (TCP) / Datagram (UDP)</td><td>End-to-end delivery, ports, reliability, flow control</td><td>TCP, UDP</td></tr>
<tr><td class="port">3</td><td><b>Network</b></td><td>Packet</td><td>Logical addressing and routing between networks</td><td>IP, ICMP, routers, OSPF</td></tr>
<tr><td class="port">2</td><td><b>Data link</b></td><td>Frame</td><td>MAC addressing and delivery on the local segment</td><td>Ethernet, switches, ARP, VLAN tags</td></tr>
<tr><td class="port">1</td><td><b>Physical</b></td><td>Bits</td><td>Signals on the wire, fiber or radio</td><td>Cables, connectors, hubs, transceivers</td></tr>
</tbody></table></div>
<p>As data goes down the stack, each layer wraps it in its own header. This is <b>encapsulation</b>. The receiver strips the headers off in reverse, which is <b>decapsulation</b>.</p>
<div class="viz" id="viz-osi"></div>
<div class="tip"><b>Memory trick.</b> From Layer 1 up: "<b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way". From Layer 7 down: "<b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing".</div>`},
{id:"appliances",num:"1.2",title:"Network appliances, applications and functions",html:`
<p>Appliances can be <b>physical</b> boxes or <b>virtual</b> appliances running as VMs. The exam wants you to know what each one does and which OSI layer it works at.</p>
<div class="viz" id="viz-dev"></div>
<ul>
<li><b>Router</b> (Layer 3): forwards packets between networks using IP addresses and a routing table.</li>
<li><b>Switch</b> (Layer 2, or Layer 3 for a multilayer switch): forwards frames inside a network using a MAC address table.</li>
<li><b>Firewall</b>: allows or blocks traffic by rules. Next-generation firewalls (NGFW) inspect up to Layer 7 and can identify applications.</li>
<li><b>IDS / IPS</b>: an intrusion detection system alerts on suspicious traffic. An intrusion prevention system sits inline and can block it.</li>
<li><b>Load balancer</b>: spreads client requests across a pool of servers, and stops sending to a server that fails its health checks.</li>
<li><b>Proxy</b>: makes requests on behalf of clients, allowing caching, filtering and hiding of internal addresses.</li>
<li><b>NAS</b> shares files over the network (SMB, NFS). A <b>SAN</b> is a dedicated network that gives servers block-level storage (Fibre Channel, iSCSI).</li>
<li><b>Wireless access point</b> and <b>wireless LAN controller</b>: APs connect Wi-Fi clients. A controller manages many APs centrally.</li>
</ul>
<h3>Applications and functions</h3>
<ul>
<li><b>CDN (content delivery network)</b>: copies content to servers close to users so pages load faster and the origin server carries less load.</li>
<li><b>VPN</b>: an encrypted tunnel across an untrusted network.</li>
<li><b>QoS (quality of service)</b>: gives priority to traffic that can't tolerate delay, such as voice and video.</li>
<li><b>TTL (time to live)</b>: a hop counter in every IP packet. Each router decrements it, and the packet is dropped at zero, which stops routing loops from circulating packets forever. DNS records also have a TTL, which is how long they may be cached.</li>
</ul>`},
{id:"cloud",num:"1.3",title:"Cloud concepts and connectivity",html:`
<h3>Service models</h3>
<p>The service model decides how much of the stack you manage and how much the provider manages.</p>
<div class="viz" id="viz-cloud"></div>
<h3>Deployment models</h3>
<ul><li><b>Public</b>: shared provider infrastructure, rented on demand.</li><li><b>Private</b>: cloud infrastructure dedicated to one organization, on site or hosted.</li><li><b>Hybrid</b>: public and private combined, with workloads moving between them.</li></ul>
<h3>Cloud networking terms</h3>
<ul>
<li><b>NFV (network functions virtualization)</b>: routers, firewalls and load balancers run as software instead of dedicated hardware.</li>
<li><b>VPC (virtual private cloud)</b>: your own isolated network inside a public cloud, with your own subnets and route tables.</li>
<li><b>Network security groups</b>: stateful allow rules attached to instances or interfaces. <b>Network security lists</b> (network ACLs) are applied to whole subnets and are often stateless.</li>
<li><b>Internet gateway</b>: lets resources with public addresses reach the internet and be reached from it. <b>NAT gateway</b>: lets private resources reach out to the internet without accepting inbound connections.</li>
<li><b>Connectivity to the cloud</b>: a site-to-site <b>VPN</b> over the internet is quick and cheap. <b>Direct Connect</b> (a private dedicated circuit) gives steadier bandwidth and latency.</li>
<li><b>Scalability</b> is the ability to add capacity. <b>Elasticity</b> is adding and removing it automatically as demand changes. <b>Multitenancy</b> means many customers share the same physical infrastructure, kept apart logically.</li>
</ul>`},
{id:"ports",num:"1.4",title:"Ports, protocols, services and traffic types",html:`
<p><b>TCP</b> is connection-oriented: a three-way handshake opens the session, every segment is numbered and acknowledged, and lost segments are resent. <b>UDP</b> is connectionless: no handshake and no acknowledgments, so it's lighter and faster. It suits DNS queries, VoIP, streaming and DHCP.</p>
<div class="viz" id="viz-tcp"></div>
<h3>Ports you must know for N10-009</h3>
<div class="scroll"><table><thead><tr><th>Port</th><th>Protocol</th><th>Transport</th><th>What it does</th></tr></thead><tbody>${portRows}</tbody></table></div>
<div class="viz" id="viz-portdrill"></div>
<h3>IP protocol types</h3>
<ul>
<li><b>ICMP</b>: error and diagnostic messages, used by ping and traceroute. It has no ports.</li>
<li><b>TCP</b> (protocol 6) and <b>UDP</b> (protocol 17): the transport protocols above.</li>
<li><b>GRE (generic routing encapsulation)</b>: wraps one packet inside another to build a tunnel. It doesn't encrypt.</li>
<li><b>IPsec</b>: secures IP traffic. <b>AH</b> (authentication header) proves integrity and origin but doesn't encrypt. <b>ESP</b> (encapsulating security payload) encrypts and authenticates. <b>IKE</b> (UDP 500) negotiates the keys.</li>
</ul>
<h3>Traffic types</h3>
<div class="viz" id="viz-traffic"></div>
<ul><li><b>Unicast</b>: one sender to one receiver.</li><li><b>Multicast</b>: one sender to a group that has asked to receive it (224.0.0.0/4 in IPv4).</li><li><b>Anycast</b>: one address shared by several servers. Routing delivers each packet to the nearest one. DNS root servers and CDNs use it.</li><li><b>Broadcast</b>: one sender to every host on the local network. IPv6 has no broadcast and uses multicast instead.</li></ul>`},
{id:"media",num:"1.5",title:"Transmission media and transceivers",html:`
<h3>Copper</h3>
<div class="scroll"><table><thead><tr><th>Cable</th><th>Typical speed</th><th>Max distance</th></tr></thead><tbody>
<tr><td class="port">Cat 5e</td><td>1 Gbps</td><td>100 m</td></tr>
<tr><td class="port">Cat 6</td><td>1 Gbps (10 Gbps up to 55 m)</td><td>100 m</td></tr>
<tr><td class="port">Cat 6a</td><td>10 Gbps</td><td>100 m</td></tr>
<tr><td class="port">Cat 7</td><td>10 Gbps, shielded</td><td>100 m</td></tr>
<tr><td class="port">Cat 8</td><td>25 or 40 Gbps</td><td>30 m</td></tr>
<tr><td class="port">Twinax DAC</td><td>10 to 100 Gbps</td><td>About 7 m (rack to rack)</td></tr>
<tr><td class="port">Coaxial (RG-6)</td><td>Cable internet and TV</td><td>Uses F-type connectors</td></tr>
</tbody></table></div>
<p><b>Plenum</b>-rated cable has a jacket that gives off little smoke when it burns, and is required in air-handling spaces such as drop ceilings. <b>Non-plenum</b> (PVC) cable is cheaper but can't go there.</p>
<h3>Fiber</h3>
<ul><li><b>Single-mode fiber (SMF)</b>: a tiny core and laser light, for kilometers. Usually a yellow jacket.</li>
<li><b>Multimode fiber (MMF)</b>: a wider core and LED or VCSEL light, for up to a few hundred meters. Usually orange or aqua.</li>
<li>Connectors: <b>LC</b> (small, push-latch, the most common on SFPs), <b>SC</b> (square, push-pull), <b>ST</b> (round, bayonet twist) and <b>MPO</b> (many fibers in one ribbon connector, for 40 and 100 Gbps).</li></ul>
<div class="viz" id="viz-media"></div>
<h3>Ethernet standards</h3>
<p>The name tells you the speed, then BASE (baseband), then the medium: <b>T</b> is twisted pair, <b>SR/SX</b> is short-range multimode, <b>LR/LX</b> is long-range single-mode. For example 10GBASE-SR is 10 Gbps over multimode fiber, and 1000BASE-T is 1 Gbps over copper.</p>
<h3>Transceivers</h3>
<p>Switches take pluggable transceivers so one port can use copper or different fiber types. <b>SFP</b> handles 1 Gbps, <b>SFP+</b> 10 Gbps, <b>SFP28</b> 25 Gbps, <b>QSFP+</b> 40 Gbps and <b>QSFP28</b> 100 Gbps. Both ends of a link must match in speed, wavelength and fiber type. Transceivers can carry Ethernet or Fibre Channel. A <b>media converter</b> joins copper to fiber.</p>
<h3>Wireless media</h3>
<p>Besides 802.11 Wi-Fi, links can use <b>cellular</b> (4G LTE, 5G) or <b>satellite</b>. Geostationary satellites add around 600 ms of round-trip delay. Low Earth orbit satellites cut that to tens of milliseconds.</p>`},
{id:"topo",num:"1.6",title:"Topologies, architectures and traffic flows",html:`
<ul>
<li><b>Star / hub and spoke</b>: every node connects to a central device. Easy to manage, but the center is a single point of failure. In WANs, branch sites (spokes) connect to headquarters (hub).</li>
<li><b>Mesh</b>: nodes connect to several others. A <b>full mesh</b> links every node to every other, which needs n(n−1)/2 links. A <b>partial mesh</b> adds redundancy only where it matters.</li>
<li><b>Point to point</b>: one direct link between two sites or devices.</li>
<li><b>Hybrid</b>: any mix of these.</li>
<li><b>Spine and leaf</b>: a data-center design. Every leaf (top-of-rack) switch connects to every spine switch, so any server is the same number of hops from any other.</li>
</ul>
<div class="viz" id="viz-topo"></div>
<h3>Three-tier hierarchical model</h3>
<ul><li><b>Core</b>: fast backbone that moves traffic between distribution blocks. No filtering, just speed.</li>
<li><b>Distribution</b>: routing between VLANs, policy, and links up to the core.</li>
<li><b>Access</b>: where end devices plug in. Port security and PoE live here.</li></ul>
<p>A <b>collapsed core</b> merges the core and distribution layers into one, which suits smaller networks.</p>
<h3>Traffic flows</h3>
<p><b>North-south</b> traffic enters or leaves the data center (clients to servers, internet traffic). <b>East-west</b> traffic moves between servers inside the data center, which is what spine and leaf is built for.</p>`},
{id:"ipv4",num:"1.7",title:"IPv4 addressing and subnetting",html:`
<h3>Address types</h3>
<div class="scroll"><table><thead><tr><th>Range</th><th>Meaning</th></tr></thead><tbody>
<tr><td class="port">10.0.0.0/8</td><td>Private (RFC 1918)</td></tr>
<tr><td class="port">172.16.0.0/12</td><td>Private: 172.16.0.0 to 172.31.255.255</td></tr>
<tr><td class="port">192.168.0.0/16</td><td>Private</td></tr>
<tr><td class="port">169.254.0.0/16</td><td>APIPA: a host assigns itself one when no DHCP server answers</td></tr>
<tr><td class="port">127.0.0.0/8</td><td>Loopback. 127.0.0.1 is localhost, the host itself</td></tr>
</tbody></table></div>
<p>Everything else that's routable on the internet is <b>public</b>. Private addresses reach the internet through NAT.</p>
<h3>Classes (historical)</h3>
<div class="scroll"><table><thead><tr><th>Class</th><th>First octet</th><th>Default mask</th></tr></thead><tbody>
<tr><td class="port">A</td><td>1 – 126</td><td>/8 · 255.0.0.0</td></tr>
<tr><td class="port">B</td><td>128 – 191</td><td>/16 · 255.255.0.0</td></tr>
<tr><td class="port">C</td><td>192 – 223</td><td>/24 · 255.255.255.0</td></tr>
<tr><td class="port">D</td><td>224 – 239</td><td>Multicast</td></tr>
<tr><td class="port">E</td><td>240 – 255</td><td>Experimental</td></tr>
</tbody></table></div>
<h3>CIDR and subnetting</h3>
<p><b>CIDR</b> notation (/24) counts the network bits. The rest are host bits. Usable hosts = 2<sup>host bits</sup> − 2, because the first address is the network ID and the last is the broadcast. <b>VLSM</b> (variable-length subnet masking) lets one block be cut into subnets of different sizes, such as a /30 for a router link and a /25 for a busy office.</p>
<div class="viz" id="viz-subnet"></div>
<div class="tip"><b>Fast subnetting.</b> The "block size" is 256 minus the mask's interesting octet. For /27 the mask is 255.255.255.224, so subnets start every 32: .0, .32, .64, .96 and so on. Each one's broadcast is one less than the next subnet.</div>`},
{id:"modern",num:"1.8",title:"Modern network environments and IPv6",html:`
<h3>SDN and SD-WAN</h3>
<p><b>Software-defined networking</b> separates the <b>control plane</b> (deciding where traffic goes) from the <b>data plane</b> (forwarding it), and moves control into a central controller. <b>SD-WAN</b> applies that to branch links. It is <b>application-aware</b> (sends voice over the best link), <b>transport agnostic</b> (MPLS, broadband or LTE), uses <b>zero-touch provisioning</b> (a new branch box configures itself from the controller) and <b>central policy management</b>.</p>
<h3>VXLAN</h3>
<p><b>VXLAN</b> wraps Layer 2 Ethernet frames inside UDP packets (port 4789), so a Layer 2 segment can stretch across a Layer 3 network, for example for a <b>data center interconnect</b>. It uses a 24-bit ID, so it supports about 16 million segments compared with 4,094 VLANs.</p>
<h3>Zero trust, SASE and SSE</h3>
<p><b>Zero trust architecture</b> drops the idea of a trusted inside network. Every request is authenticated and authorized by policy, with least privilege. <b>SASE</b> (secure access service edge) combines SD-WAN with cloud security services. <b>SSE</b> (security service edge) is the security part alone: secure web gateway, CASB, zero trust network access and firewall as a service.</p>
<h3>Infrastructure as code</h3>
<p><b>IaC</b> describes network and server configuration in files. Automation uses <b>playbooks, templates and reusable tasks</b>, prevents <b>configuration drift</b> by checking devices against the code, speeds up upgrades, and can use <b>dynamic inventories</b>. The files live in <b>source control</b>: version control, a central repository, branching, and conflict identification when two people change the same thing.</p>
<h3>IPv6</h3>
<p>IPv6 solves <b>address exhaustion</b> with 128-bit addresses written as eight groups of hex. Shorten them by dropping leading zeros in each group and replacing one run of all-zero groups with <code>::</code>.</p>
<div class="scroll"><table><thead><tr><th>Prefix</th><th>Type</th></tr></thead><tbody>
<tr><td class="port">2000::/3</td><td>Global unicast (public)</td></tr>
<tr><td class="port">fe80::/10</td><td>Link-local, created on every interface automatically</td></tr>
<tr><td class="port">fc00::/7</td><td>Unique local (private, like RFC 1918)</td></tr>
<tr><td class="port">ff00::/8</td><td>Multicast</td></tr>
<tr><td class="port">::1/128</td><td>Loopback</td></tr>
</tbody></table></div>
<p>Moving from IPv4 takes compatibility tools: <b>dual stack</b> (run both at once), <b>tunneling</b> (carry IPv6 inside IPv4, such as 6to4) and <b>NAT64</b> (translate so IPv6-only clients can reach IPv4 servers).</p>
<div class="viz" id="viz-v6"></div>`}
];

const C=[
 ["OSI Layer 1","Physical: bits, cables, connectors, hubs, transceivers"],["OSI Layer 2","Data link: frames, MAC addresses, switches, ARP"],["OSI Layer 3","Network: packets, IP addresses, routers"],["OSI Layer 4","Transport: segments/datagrams, TCP, UDP, ports"],["OSI Layer 5","Session: sets up, manages and ends sessions"],["OSI Layer 6","Presentation: formatting, encryption, compression"],["OSI Layer 7","Application: HTTP, DNS, SMTP and other services"],
 ["PDU at Layer 2","Frame"],["PDU at Layer 3","Packet"],["PDU at Layer 4 (TCP)","Segment"],["Encapsulation","Each layer adds its header as data moves down the stack"],
 ["IDS vs IPS","IDS detects and alerts. IPS sits inline and blocks."],["Load balancer","Spreads requests across servers and skips ones that fail health checks"],["Proxy server","Makes requests for clients: caching, filtering, hiding internal addresses"],["NAS vs SAN","NAS shares files (SMB/NFS). SAN gives block storage (Fibre Channel/iSCSI)."],["Wireless LAN controller","Centrally manages many access points"],["CDN","Caches content on servers close to users"],["QoS","Prioritizes delay-sensitive traffic such as voice"],["TTL in an IP packet","Hop counter decremented by each router; dropped at 0"],
 ["NFV","Network functions (router, firewall) running as software on standard servers"],["VPC","An isolated private network inside a public cloud"],["Security group vs network ACL","Security groups attach to instances and are stateful. NACLs apply to subnets and are often stateless."],["NAT gateway","Lets private cloud resources reach the internet without accepting inbound connections"],["Direct Connect","A dedicated private circuit to a cloud provider"],["Elasticity","Automatically adding and removing capacity as demand changes"],["Multitenancy","Many customers sharing the same physical cloud infrastructure"],["IaaS vs PaaS vs SaaS","IaaS: you manage OS up. PaaS: you manage apps and data. SaaS: you just use the app."],
 ["GRE","Tunneling protocol that encapsulates packets. No encryption."],["IPsec AH","Integrity and authentication only, no encryption"],["IPsec ESP","Encryption plus authentication"],["IKE port","UDP 500"],["ICMP","Diagnostic and error messages (ping, traceroute). No ports."],["Anycast","One address on several servers; packets reach the nearest"],["Multicast IPv4 range","224.0.0.0 – 239.255.255.255 (224.0.0.0/4)"],["Does IPv6 use broadcast?","No. It uses multicast instead."],
 ["Cat 6a","10 Gbps to 100 m"],["Cat 6 at 10 Gbps","Up to 55 m"],["Cat 8","25/40 Gbps up to 30 m"],["Twinax DAC","Short copper cable with fixed transceivers, for rack-to-rack links"],["Plenum cable","Low-smoke jacket required in air-handling spaces"],["Single-mode vs multimode","SMF: laser, km distances, yellow. MMF: shorter runs, orange/aqua."],["LC connector","Small push-latch fiber connector, common on SFPs"],["MPO connector","Multi-fiber ribbon connector for 40/100 Gbps"],["F-type connector","Threaded coax connector for cable internet"],["SFP+ speed","10 Gbps"],["QSFP28 speed","100 Gbps"],["10GBASE-SR","10 Gbps over multimode fiber, short range"],["10GBASE-LR","10 Gbps over single-mode fiber, about 10 km"],
 ["Spine and leaf","Every leaf connects to every spine; equal hops between any two servers"],["Full mesh links for n nodes","n(n−1)/2"],["Three-tier layers","Core, distribution, access"],["Collapsed core","Core and distribution merged into one layer"],["North-south traffic","Into and out of the data center"],["East-west traffic","Between servers inside the data center"],
 ["APIPA range","169.254.0.0/16"],["Loopback address","127.0.0.1 (127.0.0.0/8)"],["Class B first octet","128 – 191"],["Class D","224 – 239, multicast"],["Usable hosts in a /27","30"],["/28 mask","255.255.255.240"],["VLSM","Subnets of different sizes from one block"],
 ["SDN planes","Control plane decides, data plane forwards"],["SD-WAN zero-touch provisioning","New branch devices configure themselves from the controller"],["VXLAN","Layer 2 frames in UDP 4789 across a Layer 3 network; 16 million IDs"],["Zero trust","Never trust by location; verify every request, least privilege"],["SASE","SD-WAN plus cloud-delivered security"],["Configuration drift","Device settings slowly differing from the approved baseline"],["IPv6 link-local prefix","fe80::/10"],["IPv6 unique local prefix","fc00::/7"],["NAT64","Lets IPv6-only clients reach IPv4 servers"],["Dual stack","Running IPv4 and IPv6 together on the same devices"]
];
const CARDS=[
 ...PORTS.map(p=>({deck:"ports",id:"p"+p[0],q:"Port "+p[0],a:`<b>${p[2]}</b> (${p[1]})<br>${p[3]}`})),
 ...C.map((c,i)=>({deck:"concepts",id:"c"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"At which OSI layer does a switch make forwarding decisions using MAC addresses?",o:["Layer 1","Layer 2","Layer 3","Layer 4"],a:1,e:"Switches read the destination MAC address in the frame, which is Layer 2 (data link)."},
 {q:"A technician finds that a user's patch cable is damaged. Which OSI layer is the problem at?",o:["Physical","Data link","Network","Session"],a:0,e:"Cables, connectors and signals are Layer 1, the physical layer."},
 {q:"Which OSI layer handles encryption and data formatting?",o:["Application","Presentation","Session","Transport"],a:1,e:"Layer 6, presentation, covers encryption, compression and character formats."},
 {q:"What is the PDU called at the network layer?",o:["Frame","Segment","Packet","Bit"],a:2,e:"Layer 3 works with packets. Frames are Layer 2 and segments are Layer 4."},
 {q:"Which layer is responsible for port numbers and reliable delivery?",o:["Network","Transport","Session","Data link"],a:1,e:"Layer 4 (transport) uses TCP and UDP ports, and TCP adds acknowledgments and retransmission."},
 {q:"As data moves down the OSI stack on the sending host, what happens?",o:["Headers are removed","Each layer adds its own header","The data is compressed at every layer","The MAC address is replaced at each layer"],a:1,e:"Encapsulation: each layer wraps the data from the layer above with its own header (and a trailer at Layer 2)."},
 {q:"A router decrements a value in each packet and discards the packet when it reaches zero. What is the value?",o:["MTU","TTL","CRC","QoS tag"],a:1,e:"Time to live stops packets looping forever. Each router hop subtracts one."},
 {q:"Which device sits inline and can automatically block malicious traffic?",o:["IDS","IPS","Proxy","NAS"],a:1,e:"An IPS is inline and can drop traffic. An IDS only watches a copy of traffic and alerts."},
 {q:"A web application needs to stay up if one of its four servers fails. Which appliance is best?",o:["Load balancer","Proxy server","IDS","Wireless LAN controller"],a:0,e:"A load balancer health-checks the pool and stops sending traffic to a failed server."},
 {q:"Which storage solution provides block-level storage to servers over a dedicated network?",o:["NAS","SAN","CDN","File server"],a:1,e:"A SAN presents block storage over Fibre Channel or iSCSI. A NAS shares files."},
 {q:"A company has 60 access points that need consistent settings and firmware. What should it deploy?",o:["A wireless LAN controller","A proxy server","A load balancer","A NAS"],a:0,e:"A WLC manages APs centrally: configuration, firmware, channels and roaming."},
 {q:"A global retailer wants product images to load quickly for customers on every continent. What should it use?",o:["A CDN","A VPN","QoS","A NAT gateway"],a:0,e:"A content delivery network caches content on edge servers near users."},
 {q:"VoIP calls break up when large file downloads run. Which function fixes this?",o:["TTL","QoS","NAT","VXLAN"],a:1,e:"Quality of service gives voice priority over bulk traffic."},
 {q:"In which cloud service model does the customer manage the operating system but not the physical hardware?",o:["SaaS","PaaS","IaaS","On-premises"],a:2,e:"With IaaS the provider runs the hardware and virtualization, and you manage the OS and everything above it."},
 {q:"A team wants to deploy code without managing servers or operating systems. Which model fits?",o:["IaaS","PaaS","SaaS","Private cloud"],a:1,e:"PaaS gives a ready platform. You bring the application and data."},
 {q:"Which cloud feature automatically adds and removes servers as demand rises and falls?",o:["Multitenancy","Elasticity","Direct Connect","NFV"],a:1,e:"Elasticity scales capacity up and down automatically. Scalability is just the ability to grow."},
 {q:"Private cloud instances must download updates from the internet but must never accept inbound connections from it. What should be configured?",o:["Internet gateway","NAT gateway","Security list allowing all inbound","Direct Connect"],a:1,e:"A NAT gateway allows outbound connections from private subnets and blocks unsolicited inbound ones."},
 {q:"A company needs a cloud connection with consistent latency that doesn't cross the public internet. What should it choose?",o:["Site-to-site VPN","Direct Connect","Internet gateway","Anycast"],a:1,e:"A dedicated circuit (Direct Connect, ExpressRoute and similar) is private and predictable."},
 {q:"What does NFV allow?",o:["Running network functions as software on standard servers","Splitting a switch into VLANs","Encrypting Wi-Fi","Combining several links into one"],a:0,e:"Network functions virtualization replaces dedicated appliances with virtual ones."},
 {q:"Which cloud control is applied at the subnet level and is typically stateless?",o:["Security group","Network ACL / security list","Internet gateway","Load balancer"],a:1,e:"Network ACLs filter at the subnet boundary and usually need rules for both directions. Security groups are stateful and attach to instances."},
 {q:"Which port does SFTP use?",o:["21","22","69","990"],a:1,e:"SFTP runs over SSH on TCP 22."},
 {q:"A switch downloads its firmware with a simple protocol that has no authentication. Which port is it using?",o:["UDP 69","TCP 21","TCP 22","UDP 161"],a:0,e:"TFTP uses UDP 69 and has no login, which is why it's used for quick device transfers on trusted networks."},
 {q:"Logs from 200 devices must be collected on one server. Which protocol and port?",o:["SNMP 161","Syslog 514","NTP 123","LDAP 389"],a:1,e:"Syslog sends log messages, usually on UDP 514."},
 {q:"Authentication logs show odd timestamps because device clocks disagree. Which protocol should be checked?",o:["NTP on UDP 123","SNMP on UDP 162","SIP on 5060","SMB on 445"],a:0,e:"NTP synchronizes clocks. Kerberos, logs and certificates all depend on accurate time."},
 {q:"Which port should be open to allow secure directory queries with LDAPS?",o:["389","443","636","3389"],a:2,e:"LDAPS is LDAP over TLS on TCP 636. Plain LDAP is 389."},
 {q:"Which port does a VoIP phone use to set up calls with SIP over TLS?",o:["5060","5061","1433","587"],a:1,e:"SIP uses 5060, and 5061 for SIP over TLS."},
 {q:"An application server connects to a Microsoft SQL Server database. Which port must be allowed?",o:["1433","3306","1521","445"],a:0,e:"Microsoft SQL Server listens on TCP 1433."},
 {q:"Which port do email clients use to submit mail securely to their mail server?",o:["25","110","587","143"],a:2,e:"Port 587 is mail submission with STARTTLS (listed as SMTPS on the exam)."},
 {q:"A network monitoring server receives alerts sent by switches when a port goes down. Which port receives them?",o:["UDP 161","UDP 162","UDP 514","TCP 22"],a:1,e:"SNMP traps go to the manager on UDP 162. Polling uses 161."},
 {q:"Which protocol uses no port numbers?",o:["UDP","ICMP","TCP","SIP"],a:1,e:"ICMP sits directly on IP, so it has types and codes, not ports."},
 {q:"Which IPsec protocol provides encryption?",o:["AH","ESP","GRE","IKE"],a:1,e:"ESP encrypts the payload. AH only authenticates."},
 {q:"Two routers need a tunnel that carries multicast routing updates, but encryption is not required. Which protocol fits?",o:["GRE","ESP","SSH","TLS"],a:0,e:"GRE encapsulates many kinds of traffic, including multicast, but doesn't encrypt."},
 {q:"Which traffic type sends one packet to every host on a local subnet?",o:["Unicast","Multicast","Anycast","Broadcast"],a:3,e:"Broadcasts go to all hosts in the broadcast domain, for example a DHCP Discover."},
 {q:"Several DNS servers around the world share one IP address, and users reach the closest. What is this?",o:["Multicast","Anycast","Broadcast","NAT"],a:1,e:"Anycast advertises the same address from many places, and routing picks the nearest."},
 {q:"A video stream is sent once and delivered only to hosts that joined the group. What traffic type is this?",o:["Unicast","Multicast","Broadcast","Anycast"],a:1,e:"Multicast delivers to subscribed group members, saving bandwidth."},
 {q:"Which is true of TCP compared with UDP?",o:["TCP has lower overhead","TCP uses a handshake and acknowledgments","TCP is connectionless","TCP is used for DHCP"],a:1,e:"TCP is connection-oriented and reliable. UDP is lighter and connectionless."},
 {q:"A new 10 Gbps run between two switches is 85 m long. Which copper cable meets the requirement?",o:["Cat 5e","Cat 6","Cat 6a","Cat 8"],a:2,e:"Cat 6a carries 10 Gbps to 100 m. Cat 6 only manages 10 Gbps up to 55 m, and Cat 8 is limited to 30 m."},
 {q:"Cable must run through the air-handling space above a drop ceiling. What type is required?",o:["PVC","Plenum","Direct burial","Shielded only"],a:1,e:"Fire codes require plenum-rated cable in air-handling spaces because it produces less toxic smoke."},
 {q:"Two buildings are 8 km apart. Which medium is the best choice for a 10 Gbps link?",o:["Multimode fiber","Single-mode fiber","Cat 6a","Twinax"],a:1,e:"Single-mode fiber with a long-range (LR) optic reaches 10 km."},
 {q:"Which connector is small, has a push-latch, and is the usual fiber connector on SFP transceivers?",o:["ST","SC","LC","BNC"],a:2,e:"LC is the small form-factor connector used on most SFP and SFP+ optics."},
 {q:"Two switches in adjacent racks need a cheap 25 Gbps link of 3 m. What is the best option?",o:["Twinax DAC","Single-mode fiber with LR optics","Cat 5e","Coaxial RG-6"],a:0,e:"Direct attach copper is cheap, low-latency and ideal for short in-rack or rack-to-rack links."},
 {q:"A fiber link won't come up. One end has a 10GBASE-SR optic and the other has a 10GBASE-LR optic. What is the problem?",o:["Wrong cable category","Transceiver mismatch","Duplex mismatch","Wrong VLAN"],a:1,e:"SR is multimode and short wavelength, and LR is single-mode. Both ends must use matching optics."},
 {q:"Which transceiver form factor supports 40 Gbps?",o:["SFP","SFP+","QSFP+","GBIC"],a:2,e:"QSFP+ is the quad form factor for 40 Gbps. SFP+ is 10 Gbps."},
 {q:"Which connector is used for cable internet over coax?",o:["RJ11","F-type","LC","MPO"],a:1,e:"Coaxial RG-6 cable uses threaded F-type connectors."},
 {q:"A data center wants every server to be the same number of hops from every other server. Which design?",o:["Bus","Spine and leaf","Hub and spoke","Ring"],a:1,e:"In spine and leaf, every leaf connects to every spine, so any two servers are leaf-spine-leaf apart."},
 {q:"How many links does a full mesh of 6 routers need?",o:["6","12","15","30"],a:2,e:"n(n−1)/2 = 6 × 5 / 2 = 15."},
 {q:"In the three-tier model, where do end-user devices connect?",o:["Core","Distribution","Access","Spine"],a:2,e:"The access layer connects end devices. Distribution aggregates, and core is the fast backbone."},
 {q:"A small company merges its core and distribution layers into one pair of switches. What is this called?",o:["Collapsed core","Spine and leaf","Partial mesh","Point to point"],a:0,e:"A collapsed core combines the two upper layers to save cost."},
 {q:"Traffic between application servers and database servers inside the same data center is described as what?",o:["North-south","East-west","Broadcast","Anycast"],a:1,e:"East-west traffic stays inside the data center. North-south enters or leaves it."},
 {q:"Which address is a valid private IPv4 address?",o:["172.33.1.1","192.168.300.1","10.255.0.9","100.64.0.1"],a:2,e:"10.0.0.0/8 is private. 172.33 is outside 172.16–172.31, 192.168.300 isn't valid, and 100.64/10 is carrier-grade NAT space."},
 {q:"A host has 169.254.88.3. What does this indicate?",o:["A static address","An APIPA address because DHCP failed","A loopback address","A multicast address"],a:1,e:"169.254.0.0/16 is APIPA, self-assigned when no DHCP server responds."},
 {q:"How many usable hosts does a /28 provide?",o:["14","16","30","62"],a:0,e:"/28 leaves 4 host bits: 2⁴ − 2 = 14."},
 {q:"What is the broadcast address of 192.168.10.70/26?",o:["192.168.10.63","192.168.10.127","192.168.10.255","192.168.10.64"],a:1,e:"/26 blocks are 64 wide: .0, .64, .128. The host is in .64–.127, so the broadcast is .127."},
 {q:"Which mask matches /20?",o:["255.255.240.0","255.255.248.0","255.255.255.240","255.255.224.0"],a:0,e:"/20 is 8 + 8 + 4 bits: the third octet has 4 ones = 240."},
 {q:"Which subnet is best for a point-to-point link between two routers, wasting the fewest addresses?",o:["/24","/29","/30","/32"],a:2,e:"A /30 gives exactly 2 usable addresses. (/31 is also used on modern gear, but /30 is the classic answer.)"},
 {q:"A first octet of 150 belongs to which historical class?",o:["A","B","C","D"],a:1,e:"Class B covers first octets 128 to 191."},
 {q:"What does SDN separate?",o:["The control plane from the data plane","Voice from data","IPv4 from IPv6","Layer 1 from Layer 2"],a:0,e:"SDN moves the control plane (decisions) to a central controller, while devices just forward."},
 {q:"New branch routers should configure themselves automatically when plugged in. Which SD-WAN feature does this?",o:["Zero-touch provisioning","Transport agnostic","Application-aware routing","VXLAN"],a:0,e:"Zero-touch provisioning pulls configuration from the central controller."},
 {q:"Which technology extends Layer 2 segments across a Layer 3 network and supports about 16 million IDs?",o:["802.1Q","VXLAN","GRE","MPLS"],a:1,e:"VXLAN uses a 24-bit network identifier and carries frames in UDP 4789."},
 {q:"Which principle is central to zero trust architecture?",o:["Trust everything inside the firewall","Verify every request regardless of location","Use only one firewall","Allow all east-west traffic"],a:1,e:"Zero trust authenticates and authorizes every request, with least privilege."},
 {q:"Which combines SD-WAN with cloud-delivered security services?",o:["SASE","NFV","IaC","VPC"],a:0,e:"Secure access service edge = SD-WAN + SSE security services delivered from the cloud."},
 {q:"An audit finds that switch configs no longer match the approved templates. What is this called?",o:["Configuration drift","Elasticity","Multitenancy","Collision"],a:0,e:"Drift is the gap between the running config and the approved baseline. IaC tools detect and correct it."},
 {q:"Which is the correct shortened form of 2001:0db8:0000:0000:0000:ff00:0042:8329?",o:["2001:db8::ff00:42:8329","2001:db8:0:0:ff00::42:8329","2001:db8::ff:42:8329","2001::db8:ff00:42:8329"],a:0,e:"Drop leading zeros in each group and replace the run of zero groups with ::."},
 {q:"Which IPv6 prefix identifies link-local addresses?",o:["2000::/3","fc00::/7","fe80::/10","ff00::/8"],a:2,e:"fe80::/10 is link-local. fc00::/7 is unique local and ff00::/8 is multicast."},
 {q:"IPv6-only clients need to reach an IPv4-only web server. What enables this?",o:["Dual stack on the client","NAT64","APIPA","Anycast"],a:1,e:"NAT64 translates between IPv6 and IPv4."},
 {q:"Which IPv6 address is the loopback?",o:["::","::1","fe80::1","127.0.0.1"],a:1,e:"::1 is the IPv6 loopback. :: is the unspecified address."}
];

function expand6(s){
  s=s.trim().toLowerCase();if(!/^[0-9a-f:]+$/.test(s)||(s.match(/::/g)||[]).length>1)return null;
  let parts;if(s.includes("::")){const [a,b]=s.split("::");const L=a?a.split(":"):[],R=b?b.split(":"):[];const fill=8-L.length-R.length;if(fill<1)return null;parts=[...L,...Array(fill).fill("0"),...R]}else parts=s.split(":");
  if(parts.length!==8||parts.some(p=>!p||p.length>4))return null;return parts.map(p=>p.padStart(4,"0")).join(":");
}

registerModule({
  id:"con",slug:"concepts",title:"Networking Concepts",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(" ").slice(0,3).join(" ").replace(/,$/,"")})),
  decks:[["ports","Ports"],["concepts","Concepts"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["osi","dev","cloud","viz-tcp","portdrill","traffic","media","topo","subnet","v6"],
  viz(){

/* ---- OSI encapsulation ---- */
(function(){
  const el=$("#viz-osi");
  const L=[[7,"Application","Data"],[6,"Presentation","Data"],[5,"Session","Data"],[4,"Transport","Segment"],[3,"Network","Packet"],[2,"Data link","Frame"],[1,"Physical","Bits"]];
  const ST=[
   {l:7,t:"<b>Layer 7.</b> The browser asks for a page: <code>GET /index.html</code>. This is the application data."},
   {l:6,t:"<b>Layer 6.</b> The data is formatted and encrypted with TLS, so it travels as ciphertext."},
   {l:5,t:"<b>Layer 5.</b> The session between browser and server is tracked so replies return to the right conversation."},
   {l:4,t:"<b>Layer 4.</b> TCP adds a header with source port 51514 and destination port 443, plus sequence numbers. Now it's a <b>segment</b>."},
   {l:3,t:"<b>Layer 3.</b> IP adds source 10.1.1.20 and destination 93.184.216.34, plus a TTL of 64. Now it's a <b>packet</b>."},
   {l:2,t:"<b>Layer 2.</b> Ethernet adds the source and destination MAC addresses (the next hop, which is the default gateway) and an FCS trailer for error checking. Now it's a <b>frame</b>."},
   {l:1,t:"<b>Layer 1.</b> The NIC turns the frame into electrical signals, light or radio waves: <b>bits</b> on the medium."}];
  let i=-1,up=false;
  el.innerHTML=`<div class="viz-title">Watch encapsulation build a frame</div>
  <div class="osi"><div class="osi-stack"></div><div class="osi-pdu"></div></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="next">Next layer</button><button class="btn" data-a="rev">Decapsulate at the server</button><button class="btn" data-a="reset">Start over</button></div>`;
  const stack=$(".osi-stack",el),pdu=$(".osi-pdu",el),cap=$(".caption",el);
  function draw(){
    const cur=i<0?null:ST[i].l;
    stack.innerHTML=L.map(([n,name,p])=>`<div class="osi-l${n===cur?" on":""}${cur!==null&&(up?n<cur:n>cur)?" done":""}"><span class="mono">L${n}</span><b>${name}</b><em>${p}</em></div>`).join("");
    const lv=cur??8;
    const parts=[];
    if(lv<=2)parts.push('<span class="h2">ETH hdr<small>MAC src/dst</small></span>');
    if(lv<=3)parts.push('<span class="h3">IP hdr<small>10.1.1.20 → 93.184.216.34</small></span>');
    if(lv<=4)parts.push('<span class="h4">TCP hdr<small>51514 → 443</small></span>');
    if(lv<=7)parts.push(`<span class="hd">${lv<=6?"encrypted data":"GET /index.html"}</span>`);
    if(lv<=2)parts.push('<span class="h2">FCS</span>');
    pdu.innerHTML=lv===1?`<div class="osi-bits mono">${"0110100101101110 1001011100101011 0101100111010010".repeat(2)}</div><div class="osi-frame">${parts.join("")}</div>`:(lv>7?'<div class="s-note">Press <b>Next layer</b> to start at the top of the stack.</div>':`<div class="osi-frame">${parts.join("")}</div>`);
    cap.innerHTML=i<0?"Data starts at Layer 7 and gains a header at each layer on the way down.":(up?["<b>Layer 1.</b> The server's NIC receives the bits.","<b>Layer 2.</b> The server checks the FCS and its MAC address, then strips the Ethernet header.","<b>Layer 3.</b> The destination IP is the server's own, so the IP header is removed.","<b>Layer 4.</b> Port 443 tells the server to hand the data to the web service.","<b>Layer 5.</b> The session is matched.","<b>Layer 6.</b> TLS decrypts the data.","<b>Layer 7.</b> The web server reads <code>GET /index.html</code>. Decapsulation is complete."][6-i]:ST[i].t);
    $('[data-a="next"]',el).disabled=!up&&i===6||up&&i===0;
    $('[data-a="next"]',el).textContent=up?"Next layer up":"Next layer";
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="next"){i=up?i-1:i+1;if(up&&i===0)award("viz:osi",30,"Encapsulated and decapsulated a frame")}
    if(a==="rev"){up=true;i=6}
    if(a==="reset"){up=false;i=-1}
    draw()});
  draw();
})();

/* ---- Appliance explorer ---- */
(function(){
  const el=$("#viz-dev");
  const D=[
   ["Router","L3","Joins different networks and picks the best path for each packet using its routing table. Your default gateway is a router."],
   ["Switch","L2","Learns which MAC address lives on which port and forwards each frame only to the right port. A Layer 3 (multilayer) switch can route between VLANs too."],
   ["Firewall","L3–L7","Filters traffic by rules. Basic firewalls check addresses and ports (L3/L4). A next-generation firewall also identifies applications and users (L7)."],
   ["IDS","L3–L7","Receives a copy of traffic (from a SPAN port or tap) and alerts on attacks. It can't block, because it isn't inline."],
   ["IPS","L3–L7","Sits inline, so every packet passes through it. It can drop malicious traffic as it happens."],
   ["Load balancer","L4–L7","Shares requests across a pool of servers and runs health checks. Layer 7 balancers can route by URL or cookie."],
   ["Proxy","L7","Makes web requests on behalf of clients. Allows caching, URL filtering and logging. A reverse proxy sits in front of servers instead."],
   ["NAS","L7","A storage appliance that shares files over SMB or NFS to many clients."],
   ["SAN","Block","A separate high-speed network that gives servers block storage, as if it were a local disk. Uses Fibre Channel or iSCSI."],
   ["Access point","L2","Bridges Wi-Fi clients onto the wired LAN. Often powered by PoE."],
   ["WLAN controller","L2–L3","Manages dozens or hundreds of APs: settings, firmware, channel and power plans, and roaming."],
   ["VPN concentrator","L3","Terminates many VPN tunnels from remote users or branch sites."]];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Tap each appliance to see what it does</div><div class="chips dev-chips">${D.map((d,i)=>`<button class="chip" data-d="${i}">${d[0]}</button>`).join("")}</div>
  <div class="dev-card"><div class="dev-layer mono">L?</div><div><b class="dev-name">Pick an appliance</b><p class="dev-desc">There are ${D.length} to explore.</p></div></div><div class="grow hint left"></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b)return;const d=D[+b.dataset.d];seen.add(+b.dataset.d);
    el.querySelectorAll("[data-d]").forEach(x=>x.setAttribute("aria-pressed",x===b));b.classList.add("seen");
    $(".dev-layer",el).textContent=d[1];$(".dev-name",el).textContent=d[0];$(".dev-desc",el).textContent=d[2];
    $(".grow",el).textContent=`${seen.size} of ${D.length} explored`;if(seen.size===D.length)award("viz:dev",20,"Explored every appliance")});
})();

/* ---- Cloud service model responsibility ---- */
(function(){
  const el=$("#viz-cloud");
  const ROWS=["Applications","Data","Runtime","Middleware","Operating system","Virtualization","Servers","Storage","Networking"];
  const M=[["On-premises",9],["IaaS",5],["PaaS",2],["SaaS",0]];/* rows you manage, from the top */
  let cur=1;const seen=new Set([1]);
  el.innerHTML=`<div class="viz-title">Who manages what?</div><div class="chips">${M.map((m,i)=>`<button class="chip" data-m="${i}">${m[0]}</button>`).join("")}</div>
  <div class="cl-stack"></div><div class="legend"><span><i style="background:var(--accent)"></i>You manage</span><span><i style="background:var(--muted)"></i>Provider manages</span></div><div class="caption" aria-live="polite"></div>`;
  const notes=["You own everything, from the building's power to the app.","The provider runs the hardware and hypervisor. You install and patch the OS, runtime and apps. Example: a cloud VM.","You just deploy your code and data. The provider runs the OS and runtime. Example: a managed app platform or database.","You only use the software and manage your users and data settings. Example: web-based email."];
  function draw(){
    el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.m===cur));
    $(".cl-stack",el).innerHTML=ROWS.map((r,i)=>`<div class="cl-row ${i<M[cur][1]?"you":"prov"}"><span>${r}</span><em>${i<M[cur][1]?"You":"Provider"}</em></div>`).join("");
    $(".caption",el).innerHTML=`<b>${M[cur][0]}.</b> ${notes[cur]}`;
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;cur=+b.dataset.m;seen.add(cur);draw();if(seen.size===4)award("viz:cloud",20,"Compared all cloud service models")});
  draw();
})();

/* ---- TCP handshake and teardown ---- */
seqViz($("#viz-tcp"),{title:"TCP opens and closes a connection",left:"Client",right:"Server :443",
  intro:"Press <b>Next step</b> to watch TCP open a connection, send data, then close it.",
  steps:[
   {dir:"r",label:"SYN",sub:"seq=100",text:"<b>SYN.</b> The client asks to connect and picks a starting sequence number."},
   {dir:"l",label:"SYN-ACK",sub:"seq=300, ack=101",text:"<b>SYN-ACK.</b> The server agrees, picks its own sequence number and acknowledges the client's."},
   {dir:"r",label:"ACK",sub:"ack=301",text:"<b>ACK.</b> The three-way handshake is done and the connection is open."},
   {dir:"r",label:"Data",sub:"GET /",text:"<b>Data.</b> Each segment carries a sequence number. Anything not acknowledged is resent."},
   {dir:"l",label:"ACK + data",text:"<b>ACK.</b> The server acknowledges and sends the response."},
   {dir:"r",label:"FIN",dash:true,text:"<b>FIN.</b> The client is finished and starts a graceful close. (An RST would end it abruptly.)"},
   {dir:"l",label:"ACK, then FIN",dash:true,text:"<b>ACK and FIN.</b> The server acknowledges, then sends its own FIN."},
   {dir:"r",label:"ACK",dash:true,text:"<b>ACK.</b> The connection is closed."}],
  end:"<b>UDP</b> skips all of this. It sends datagrams with no setup, no acknowledgments and no teardown."});

/* ---- Port speed drill ---- */
(function(){
  const el=$("#viz-portdrill");let streak=0,best=0,q=null;
  el.innerHTML=`<div class="viz-title">Port drill: get 10 in a row</div><div class="pd-q"></div><div class="opts pd-o"></div><div class="caption" aria-live="polite"></div>`;
  function next(){
    const p=PORTS[Math.floor(Math.random()*PORTS.length)],ask=Math.random()<.5;
    const others=shuffleArr(PORTS.filter(x=>x!==p)).slice(0,3);
    q={p,ask,opts:shuffleArr([p,...others])};
    $(".pd-q",el).innerHTML=ask?`Which port does <b>${p[2]}</b> use?`:`What runs on port <b class="mono">${p[0]}</b>?`;
    $(".pd-o",el).innerHTML=q.opts.map((o,i)=>`<button class="opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span>${ask?o[0]:o[2]}</span></button>`).join("");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b||b.disabled)return;const o=q.opts[+b.dataset.i],ok=o===q.p;
    streak=ok?streak+1:0;best=Math.max(best,streak);
    $(".caption",el).innerHTML=`${ok?'<span class="status-good">Correct.</span>':`<span class="status-bad">Not quite.</span> ${q.p[2]} is port ${q.p[0]}.`} Streak <b>${streak}</b> · best <b>${best}</b>`;
    if(streak>=10)award("viz:portdrill",30,"10 ports in a row");next()});
  next();
})();

/* ---- Traffic types ---- */
(function(){
  const el=$("#viz-traffic");
  const H=[[300,40,"Sender"],[110,140,"Host A"],[240,170,"Host B"],[370,170,"Host C"],[500,140,"Host D"],[170,250,"Host E"],[430,250,"Host F"]];
  const T={uni:{to:[3],t:"<b>Unicast.</b> One sender, one receiver. Most traffic, such as loading a web page, is unicast."},
    multi:{to:[1,3,6],t:"<b>Multicast.</b> Only hosts that joined the group (A, C and F here) get the stream. The sender transmits once."},
    broad:{to:[1,2,3,4,5,6],t:"<b>Broadcast.</b> Every host in the broadcast domain receives it, whether it wants it or not. Routers don't forward broadcasts."},
    any:{to:[2],t:"<b>Anycast.</b> Hosts B, D and E all share the address 203.0.113.53. Routing delivers to the nearest one, B. If B fails, traffic shifts to the next nearest.",grp:[2,4,5]}};
  const seen=new Set();let anim=null;
  el.innerHTML=`<div class="viz-title">Send a packet four different ways</div><div class="viz-scroll"><svg viewBox="0 0 600 290" style="min-width:420px" role="img" aria-label="Traffic type diagram"></svg></div>
  <div class="chips">${[["uni","Unicast"],["multi","Multicast"],["broad","Broadcast"],["any","Anycast"]].map(([k,l])=>`<button class="chip" data-t="${k}">${l}</button>`).join("")}</div><div class="caption" aria-live="polite">Pick a traffic type to send.</div>`;
  const svg=$("svg",el);
  function base(k){let s="";H.slice(1).forEach(([x,y],i)=>s+=`<line class="m-link" x1="300" y1="40" x2="${x}" y2="${y}"/>`);
    H.forEach(([x,y,n],i)=>{const g=k&&T[k].grp&&T[k].grp.includes(i);s+=`<g class="m-node${i===0?" on":""}${g?" sel":""}"><rect x="${x-46}" y="${y-18}" width="92" height="36" rx="9"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b" style="font-size:13px">${n}</text></g>`});return s}
  svg.innerHTML=base();
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;const k=b.dataset.t;seen.add(k);
    el.querySelectorAll("[data-t]").forEach(x=>x.setAttribute("aria-pressed",x===b));
    cancelAnimationFrame(anim);svg.innerHTML=base(k)+T[k].to.map(i=>`<circle class="m-dot" r="7" cx="300" cy="40" data-to="${i}"/>`).join("");
    $(".caption",el).innerHTML=T[k].t;
    const dots=[...svg.querySelectorAll("[data-to]")];
    const finish=()=>dots.forEach(d=>{const [x,y]=H[+d.dataset.to];d.setAttribute("cx",x);d.setAttribute("cy",y-26);svg.querySelectorAll(".m-node")[+d.dataset.to].classList.add("on")});
    if(REDUCED)finish();else{let t0=null;const tick=ts=>{if(!svg.isConnected)return;t0??=ts;const f=Math.min((ts-t0)/900,1);
      dots.forEach(d=>{const [x,y]=H[+d.dataset.to];d.setAttribute("cx",300+(x-300)*f);d.setAttribute("cy",40+(y-66)*f)});if(f<1)anim=requestAnimationFrame(tick);else finish()};anim=requestAnimationFrame(tick)}
    if(seen.size===4)award("viz:traffic",20,"Sent all four traffic types")});
})();

/* ---- Media reach ---- */
(function(){
  const el=$("#viz-media");
  const M=[["Twinax DAC",7,"Copper, fixed ends"],["Cat 8",30,"25/40G copper"],["Cat 6",55,"Copper at 10G"],["Cat 6a",100,"Copper"],["Multimode OM3 (SR)",300,"Fiber"],["Multimode OM4 (SR)",400,"Fiber"],["Single-mode (LR)",10000,"Fiber"],["Single-mode (ER)",40000,"Fiber"]];
  const lg=v=>Math.log10(v);const X=v=>(lg(v)-lg(1))/(lg(60000)-lg(1))*100;
  el.innerHTML=`<div class="viz-title">Which media can carry 10 Gbps this far?</div>
  <div class="sn-top"><span class="sn-prefix md-d" aria-live="polite"></span><input type="range" min="0" max="100" value="45" aria-label="Distance"></div>
  <div class="md-bars"></div><div class="caption"></div>`;
  const r=$("input",el);const dist=()=>Math.round(10**(r.value/100*lg(50000)));
  function draw(){const d=dist();$(".md-d",el).textContent=d>=1000?(d/1000).toFixed(1)+" km":d+" m";
    $(".md-bars",el).innerHTML=M.map(([n,m,k])=>`<div class="md-row ${m>=d?"ok":"no"}"><span>${n}<em>${k}</em></span><div class="md-track"><i style="width:${X(m)}%"></i><b style="left:${X(d)}%"></b></div><span class="mono">${m>=1000?m/1000+" km":m+" m"}</span></div>`).join("");
    const ok=M.filter(x=>x[1]>=d);
    $(".caption",el).innerHTML=ok.length?`At this distance you can use: <b>${ok.map(x=>x[0]).join(", ")}</b>. The cheapest option that reaches is usually the right exam answer.`:"Nothing on this list reaches that far at 10 Gbps without amplifiers or a provider circuit.";}
  r.addEventListener("input",()=>{draw();award("viz:media",20,"Compared cable reach")});draw();
})();

/* ---- Topology link-cut explorer ---- */
(function(){
  const el=$("#viz-topo");
  const T={
   star:{name:"Star",n:[[300,130,"Switch"],[120,50,"A"],[480,50,"B"],[120,210,"C"],[480,210,"D"],[300,250,"E"]],l:[[0,1],[0,2],[0,3],[0,4],[0,5]],note:"Cut any link and only that one node drops off. But if the center fails, everything does."},
   mesh:{name:"Full mesh",n:[[300,40,"R1"],[490,120,"R2"],[420,250,"R3"],[180,250,"R4"],[110,120,"R5"]],l:[[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]],note:"Every node has a direct link to every other: 5 nodes need 10 links. You can cut several and everyone still reaches everyone."},
   spine:{name:"Spine and leaf",n:[[200,50,"Spine 1"],[400,50,"Spine 2"],[90,220,"Leaf 1"],[230,220,"Leaf 2"],[370,220,"Leaf 3"],[510,220,"Leaf 4"]],l:[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5]],note:"Each leaf has a link to every spine. Lose one and traffic just uses the other spine."},
   p2p:{name:"Hub and spoke WAN",n:[[300,130,"HQ hub"],[110,60,"Branch 1"],[490,60,"Branch 2"],[110,210,"Branch 3"],[490,210,"Branch 4"]],l:[[0,1],[0,2],[0,3],[0,4],[1,3]],note:"Branches reach each other through the hub. A backup link between Branches 1 and 3 gives those two a second path."}};
  let k="star",cut=new Set(),cuts=0;const tried=new Set();
  el.innerHTML=`<div class="viz-title">Cut links and see who loses connectivity</div><div class="chips">${Object.entries(T).map(([key,t])=>`<button class="chip" data-k="${key}">${t.name}</button>`).join("")}</div>
  <div class="viz-scroll"><svg viewBox="0 0 600 280" style="min-width:420px" role="group" aria-label="Topology diagram"></svg></div><div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn" data-a="heal">Repair all links</button><span class="grow">Tap a link to cut it</span></div>`;
  const svg=$("svg",el);
  function reach(){const t=T[k],adj=t.n.map(()=>[]);t.l.forEach(([a,b],i)=>{if(!cut.has(i)){adj[a].push(b);adj[b].push(a)}});
    const comp=t.n.map(()=>-1);let c=0;t.n.forEach((_,s)=>{if(comp[s]>=0)return;const q=[s];comp[s]=c;while(q.length){const x=q.shift();adj[x].forEach(y=>{if(comp[y]<0){comp[y]=c;q.push(y)}})}c++});return {comp,c}}
  function draw(){const t=T[k],{comp,c}=reach();
    const main=[...Array(c).keys()].map(i=>comp.filter(x=>x===i).length);const big=main.indexOf(Math.max(...main));
    let s="";t.l.forEach(([a,b],i)=>{const A=t.n[a],B=t.n[b];s+=`<line class="m-link tp-l${cut.has(i)?" cut":""}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/><line class="tp-hit" data-l="${i}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`});
    t.n.forEach(([x,y,n],i)=>s+=`<g class="m-node${comp[i]!==big?" tp-off":""}"><rect x="${x-44}" y="${y-18}" width="88" height="36" rx="9"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b" style="font-size:13px">${n}</text></g>`);
    svg.innerHTML=s;el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    const iso=t.n.filter((_,i)=>comp[i]!==big).map(x=>x[2]);
    $(".caption",el).innerHTML=`<b>${t.name}.</b> ${t.l.length} links. ${cut.size?(iso.length?`<span class="status-bad">Cut off:</span> ${iso.join(", ")}.`:`<span class="status-good">Everyone can still reach everyone</span> with ${cut.size} link${cut.size>1?"s":""} cut.`):t.note}`;
  }
  svg.addEventListener("click",e=>{const l=e.target.closest("[data-l]");if(!l)return;const i=+l.dataset.l;cut.has(i)?cut.delete(i):cut.add(i);tried.add(k);draw();if(cut.size===T[k].l.length)flag("island");if(tried.size>=3)award("viz:topo",30,"Stress-tested three topologies")});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]"),a=e.target.closest("[data-a]");if(b){k=b.dataset.k;cut.clear();draw()}if(a){cut.clear();draw()}});
  draw();
})();

/* ---- Subnet calculator ---- */
(function(){
  const el=$("#viz-subnet");let IP=[172,16,45,130];
  el.innerHTML=`<div class="viz-title">Subnet calculator: change the address or drag the prefix</div>
  <label class="rf"><span>IPv4 address</span><input class="sn-ip" value="${IP.join(".")}" inputmode="decimal" autocomplete="off" spellcheck="false"></label>
  <div class="sn-top"><span class="sn-prefix" aria-live="polite"></span><input type="range" id="sn-range" min="8" max="30" value="26" aria-label="CIDR prefix length"></div>
  <div class="bits" aria-hidden="true"></div>
  <div class="legend"><span><i style="background:var(--blue)"></i>Network bits</span><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Host bits</span></div>
  <div class="sn-grid"></div><div class="caption"></div>`;
  const r=$("#sn-range",el),ipIn=$(".sn-ip",el);
  const toInt=a=>((a[0]<<24)>>>0)+(a[1]<<16)+(a[2]<<8)+a[3],toStr=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
  function draw(){
    const n=+r.value,mask=(0xFFFFFFFF<<(32-n))>>>0,ip=toInt(IP),net=(ip&mask)>>>0,bc=(net|(~mask>>>0))>>>0,hosts=2**(32-n)-2;
    const bin=IP.map(o=>o.toString(2).padStart(8,"0")).join("");
    $(".sn-prefix",el).textContent="/"+n;
    $(".bits",el).innerHTML=[0,1,2,3].map(o=>`<div class="octet">${Array.from({length:8},(_,b)=>{const i=o*8+b;return `<span class="bit${i<n?" n":""}">${bin[i]}</span>`}).join("")}</div>`).join("");
    const oct=Math.min(3,Math.floor(n/8)),block=256-((mask>>>(24-oct*8))&255);
    $(".sn-grid",el).innerHTML=[["Subnet mask",toStr(mask)],["Usable hosts",hosts.toLocaleString("en-US")],["Network ID",toStr(net)],["Broadcast",toStr(bc)],["First usable",toStr(net+1)],["Last usable",toStr(bc-1)]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
    $(".caption",el).innerHTML=`The bits show <b class="mono">${IP.join(".")}</b> in binary. ${n%8?`The interesting octet is octet ${oct+1}, and the block size is 256 − ${256-block} = <b>${block}</b>, so subnets start every ${block} in that octet.`:"The prefix falls on an octet boundary, so the subnet is whole octets."}`;
  }
  r.addEventListener("input",()=>{draw();award("viz:subnet",20,"Explored subnetting")});
  ipIn.addEventListener("input",()=>{const p=ipIn.value.trim().split(".").map(Number);if(p.length===4&&p.every(x=>Number.isInteger(x)&&x>=0&&x<=255)){IP=p;ipIn.removeAttribute("aria-invalid");draw()}else ipIn.setAttribute("aria-invalid","true")});
  draw();
})();

/* ---- IPv6 shortening practice ---- */
(function(){
  const el=$("#viz-v6");
  const Q=["2001:0db8:0000:0000:0000:0000:0000:0001","fe80:0000:0000:0000:02a0:c9ff:fe12:3456","2001:0db8:0abc:0000:0000:0000:0000:0042","fd00:0000:0000:0012:0000:0000:0000:0bad","ff02:0000:0000:0000:0000:0000:0000:0002","2600:1f18:0000:0000:00a1:0000:0000:0010"];
  let i=0,right=0;
  el.innerHTML=`<div class="viz-title">Shorten the IPv6 address</div><p class="mono v6-full"></p>
  <label class="rf"><span>Your answer</span><input class="v6-in" autocomplete="off" spellcheck="false" placeholder="e.g. 2001:db8::1"></label>
  <div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="check">Check</button><button class="btn" data-a="skip">Next address</button><span class="grow"></span></div>`;
  const shortest=a=>{let g=a.split(":").map(x=>x.replace(/^0+(?=.)/,""));let bs=-1,bl=0;for(let s=0;s<8;s++){let l=0;while(s+l<8&&g[s+l]==="0")l++;if(l>bl&&l>1){bl=l;bs=s}}
    if(bs<0)return g.join(":");return (g.slice(0,bs).join(":")+"::"+g.slice(bs+bl).join(":"))};
  function show(){$(".v6-full",el).textContent=Q[i];$(".v6-in",el).value="";$(".caption",el).innerHTML="Drop leading zeros in each group, then replace the longest run of all-zero groups with <code>::</code> (only once).";$(".grow",el).textContent=`${right} correct`}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="skip"){i=(i+1)%Q.length;show();return}
    const v=$(".v6-in",el).value,ex=expand6(v);
    if(ex===Q[i]){const best=shortest(Q[i]),isBest=v.trim().toLowerCase()===best;right++;
      $(".caption",el).innerHTML=`<span class="status-good">Correct.</span> ${isBest?"That's the shortest form.":`Valid, but the shortest form is <code>${best}</code>.`}`;$(".grow",el).textContent=`${right} correct`;if(right>=3)award("viz:v6",20,"Shortened three IPv6 addresses")}
    else $(".caption",el).innerHTML=`<span class="status-bad">${ex===null?"That isn't a valid IPv6 address.":"That expands to a different address."}</span> Remember :: can appear only once.`});
  $(".v6-in",el).addEventListener("keydown",e=>{if(e.key==="Enter")$('[data-a="check"]',el).click()});
  show();
})();

  },
  sims:[
    {id:"osiorder",type:"order",title:"Stack the OSI layers",
      scenario:"A junior tech needs a reference poster. Put the seven OSI layers in order from Layer 7 at the top down to Layer 1.",
      steps:["Application","Presentation","Session","Transport","Network","Data link","Physical"],success:"That's the full stack, top to bottom."},
    {id:"osimatch",type:"match",title:"Place each item on its OSI layer",
      scenario:"During a troubleshooting call, the team lists things they checked. Match each one to the OSI layer it belongs to.",
      items:[["HTTP request","7"],["TLS encryption","6"],["RPC session setup","5"],["TCP port 443","4"],["IP routing","3"],["MAC address table","2"],["Fiber transceiver","1"]],
      slots:[["7","Layer 7","Application"],["6","Layer 6","Presentation"],["5","Layer 5","Session"],["4","Layer 4","Transport"],["3","Layer 3","Network"],["2","Layer 2","Data link"],["1","Layer 1","Physical"]],
      success:"Every item is on the right layer."},
    {id:"ports",type:"match",title:"Write the firewall allow list",
      scenario:"A new data center firewall denies everything by default. Match each required service to the port its allow rule must open.",
      items:[["TFTP","69"],["NTP","123"],["SNMP","161/162"],["Syslog","514"],["SMTPS","587"],["LDAPS","636"],["SQL Server","1433"],["SIP","5060/5061"]],
      slots:[["69","Port 69","Firmware pushes to switches"],["123","Port 123","Clock synchronization"],["161/162","Ports 161/162","Device polling and traps"],["514","Port 514","Central log collection"],["587","Port 587","Secure mail submission"],["636","Port 636","Secure directory lookups"],["1433","Port 1433","Database connections"],["5060/5061","Ports 5060/5061","VoIP call setup"]],
      success:"The allow list covers exactly what the data center needs."},
    {id:"subnet",title:"Subnetting under pressure",mount(el,api,sim){
      const toStr=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
      let P,done=0,graded=null;const NEED=3;
      function gen(){const n=17+Math.floor(Math.random()*14),base=[10,172,192][Math.floor(Math.random()*3)];
        const ip=((base===10?10<<24:base===172?(172<<24)+(16+Math.floor(Math.random()*16)<<16):(192<<24)+(168<<16))>>>0)+(base===192?Math.floor(Math.random()*65536):Math.floor(Math.random()*(base===10?16777216:65536)));
        const mask=(0xFFFFFFFF<<(32-n))>>>0,net=(ip&mask)>>>0,bc=(net|(~mask>>>0))>>>0;P={ip:toStr(ip>>>0),n,mask:toStr(mask),net:toStr(net),bc:toStr(bc),hosts:String(2**(32-n)-2)};graded=null}
      function d(){
        el.innerHTML=`${simHead(sim,api)}<p class="scenario">A ticket lists a host as <b class="mono">${P.ip}/${P.n}</b>. Before you can configure the firewall rule, work out its subnet. Solve ${NEED} problems to pass. Solved: <b>${done}</b>.</p>
        <div class="router"><div class="router-body">
        ${[["mask","Subnet mask"],["net","Network ID"],["bc","Broadcast address"],["hosts","Usable hosts"]].map(([k,l])=>`<label class="rf"><span>${l}</span><input data-k="${k}" autocomplete="off" spellcheck="false" inputmode="decimal" ${graded?`class="${graded[k]?"in-ok":"in-no"}"`:""} value="${graded?graded.v[k]:""}"></label>`).join("")}
        </div></div>
        <div class="caption" aria-live="polite">${graded?(Object.entries(graded).filter(([k])=>k!=="v").every(([,v])=>v)?'<span class="status-good">All correct.</span> Press <b>New problem</b> for the next one.':`<span class="status-bad">Not quite.</span> Answer: mask ${P.mask}, network ${P.net}, broadcast ${P.bc}, ${Number(P.hosts).toLocaleString("en-US")} hosts.`):"Type plain numbers for hosts (no commas)."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Check</button><button class="btn" data-a="new">New problem</button></div>`;
      }
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
        if(a==="new"){gen();d();return}
        if(a==="check"&&!graded?.done){const v={};el.querySelectorAll("[data-k]").forEach(i=>v[i.dataset.k]=i.value.trim().replace(/,/g,""));
          graded={v,mask:v.mask===P.mask,net:v.net===P.net,bc:v.bc===P.bc,hosts:v.hosts===P.hosts};
          if(graded.mask&&graded.net&&graded.bc&&graded.hosts){done++;Object.defineProperty(graded,"done",{value:true,enumerable:false});if(done>=NEED)api.pass()}d()}});
      gen();d();
    }}
  ],
  badges:[
    ["reader","LS","Layer Stacker","Mark all 8 concepts lessons studied",c=>c.allStudied()],
    ["lab","PL","Packet Lab","Complete all 10 concepts diagrams",c=>c.vizAll()],
    ["drill","PA","Port Authority","Get 10 port questions right in a row",c=>c.earned("viz:portdrill")],
    ["ports","PC","Port Collector","Get all 19 port cards to Familiar or higher",c=>c.deckAtLeast("ports",2)],
    ["sub","SN","Subnet Ninja","Pass the subnetting simulation",c=>c.passed("subnet")],
    ["osi","7L","Seven Layers Deep","Pass both OSI simulations",c=>c.passed("osiorder")&&c.passed("osimatch")],
    ["recall","TR","Total Recall","Master 15 concepts flashcards",c=>c.countAtLeast(4)>=15],
    ["perfect","PP","Perfect Packet","Score 100% on a concepts quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
