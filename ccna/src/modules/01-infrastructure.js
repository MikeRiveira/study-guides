/* ================= Module 1: Network Infrastructure and Connectivity (200-301 v2.0 Domain 1.0, 25%) ================= */
(function(){
const LESSONS=[
{id:"cable",num:"1.1",title:"Cables, interfaces and interface errors",html:`
<p>Most outages start at Layer 1. The exam wants you to read interface output and say what's wrong with the cable, the optics or the settings on either end.</p>
<h3>Copper</h3>
<ul><li><b>Unshielded twisted pair (UTP)</b> with RJ45 connectors. Ethernet over copper reaches <b>100 meters</b> per run, whatever the category.</li>
<li><b>Cat 5e</b> carries 1 Gbps. <b>Cat 6</b> carries 10 Gbps up to about 55 m. <b>Cat 6a</b> carries 10 Gbps for the full 100 m.</li>
<li><b>Pinouts.</b> T568A and T568B are the two wiring standards. Same standard on both ends makes a <b>straight-through</b> cable (PC to switch). A on one end and B on the other makes a <b>crossover</b> (switch to switch on old gear). Modern ports use <b>Auto-MDIX</b>, so either cable works.</li>
<li><b>Twinax / DAC</b> (direct attach copper) is a short, cheap 10/25/40 Gbps cable with SFP+ ends fixed on, used inside a rack.</li></ul>
<h3>Fiber</h3>
<ul><li><b>Multimode fiber (MMF)</b> has a wide core and uses cheaper LED or VCSEL lasers. 10GBASE-SR reaches about 300 m on OM3 and 400 m on OM4. Good inside a building.</li>
<li><b>Single-mode fiber (SMF)</b> has a tiny core and a laser. 10GBASE-LR reaches 10 km and ER reaches 40 km. Used between buildings and by carriers.</li>
<li>Fiber ignores electrical interference (EMI) and can't be tapped as easily. Common connectors are <b>LC</b> (small, used on SFP modules) and <b>SC</b> (square, push-pull). The optic is a pluggable <b>SFP / SFP+ / QSFP</b> transceiver.</li></ul>
<div class="viz" id="viz-cablepick"></div>
<h3>Reading interface errors</h3>
<p><code>show interfaces</code> shows counters that point at the cause:</p>
<table><tr><th>Counter</th><th>What it means</th><th>Usual cause</th></tr>
<tr><td>CRC / input errors</td><td>Frames arrived corrupted</td><td>Bad or too-long cable, EMI, dirty fiber, duplex mismatch</td></tr>
<tr><td>Runts</td><td>Frames under 64 bytes</td><td>Collisions, duplex mismatch</td></tr>
<tr><td>Giants</td><td>Frames over the MTU (1518 bytes)</td><td>Jumbo frames from one side, MTU mismatch</td></tr>
<tr><td>Collisions / late collisions</td><td>Late = collision after the first 64 bytes</td><td>Duplex mismatch (the half-duplex side counts them), or a cable over 100 m</td></tr>
<tr><td>Output drops</td><td>Queue full</td><td>Congestion. Nothing is broken, the link is just busy</td></tr></table>
<p><b>Duplex mismatch</b>: one side hard-set to full, the other left on auto. Auto can't negotiate, falls back to <b>half</b>, and counts late collisions while the full side counts CRC errors and runts. <b>Speed mismatch</b> is different: the link doesn't come up at all (<code>notconnect</code> or <code>down/down</code>).</p>
<p>On fiber, <code>show interfaces transceiver</code> shows the optical <b>Rx power</b> in dBm. Healthy is roughly −1 to −10 dBm. Too low means a dirty connector, a bad splice, the wrong fiber type or too much distance. Too high (on short single-mode runs) can saturate the receiver.</p>
<div class="viz" id="viz-counters"></div>
<div class="tip"><b>Exam tip.</b> <code>administratively down</code> means someone typed <code>shutdown</code>. <code>down/down</code> is a Layer 1 problem (cable, optic, speed). <code>up/down</code> is a Layer 2 problem (encapsulation, keepalives, or an err-disabled port's partner).</div>`},
{id:"virt",num:"1.2",title:"Hypervisors, virtual machines and containers",html:`
<p>Most servers your network connects are virtual. You need to know the pieces and how they reach the physical network.</p>
<ul><li><b>Virtual machine (VM)</b>: a complete computer in software with its own guest operating system, virtual CPU, memory, disk and virtual NICs.</li>
<li><b>Hypervisor</b>: the software that creates and runs VMs and shares the hardware between them.
  <ul><li><b>Type 1 (bare metal)</b> runs directly on the hardware: VMware ESXi, Microsoft Hyper-V, KVM. Used in data centers.</li>
  <li><b>Type 2 (hosted)</b> runs as an app on a normal OS: VirtualBox, VMware Workstation. Used on laptops and labs.</li></ul></li>
<li><b>Container</b>: an application packaged with its libraries, sharing the host's operating system kernel. No guest OS, so it starts in seconds and uses far less memory. Docker builds and runs containers; Kubernetes orchestrates many of them.</li>
<li><b>Virtual switch (vSwitch)</b>: inside the host, VMs plug their virtual NICs into a vSwitch, which uplinks to the physical NICs. The vSwitch can tag VLANs, so the physical switch port facing a hypervisor host is usually an <b>802.1Q trunk</b>.</li></ul>
<div class="viz" id="viz-virt"></div>
<div class="viz" id="viz-vmcont"></div>
<div class="tip"><b>Exam tip.</b> "Shares the host kernel" means container. "Each one runs its own OS" means VM. "Runs directly on hardware" means Type 1.</div>`},
{id:"ipv4",num:"1.3",title:"IPv4 addressing and subnetting",html:`
<p>An IPv4 address is 32 bits written as four octets. The <b>prefix length</b> (the /24 in 192.168.1.10/24) says how many leading bits are the network. The rest are host bits.</p>
<h3>Address types</h3>
<ul><li><b>Private (RFC 1918)</b>: 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31), 192.168.0.0/16. Not routed on the internet, so they need NAT to get out.</li>
<li><b>Public</b>: everything else that's assignable. Globally unique.</li>
<li><b>Special</b>: 127.0.0.0/8 loopback, 169.254.0.0/16 APIPA (link-local, a sign DHCP failed), 100.64.0.0/10 carrier-grade NAT shared space, 224.0.0.0/4 multicast.</li></ul>
<div class="viz" id="viz-v4types"></div>
<h3>Subnetting fast</h3>
<ol><li>Find the <b>interesting octet</b>: the one where the mask isn't 255 or 0.</li>
<li><b>Block size</b> = 256 − the mask value in that octet. For /26 (255.255.255.192) the block is 64.</li>
<li>Subnets start at multiples of the block: .0, .64, .128, .192. The address belongs to the one at or below it.</li>
<li><b>Broadcast</b> is one less than the next subnet. Usable hosts are everything in between: 2<sup>host bits</sup> − 2.</li></ol>
<p>Point-to-point links often use <b>/30</b> (2 usable hosts) or <b>/31</b> (2 addresses, no network or broadcast, RFC 3021). Loopbacks use <b>/32</b>.</p>
<div class="viz" id="viz-subnet"></div>
<div class="viz" id="viz-subdrill"></div>
<h3>VLSM</h3>
<p>Variable-length subnet masking lets each subnet use the mask that fits it. Allocate the <b>largest</b> subnet first, then the next largest, so the blocks line up without overlapping.</p>
<div class="viz" id="viz-vlsm"></div>
<div class="tip"><b>Troubleshooting.</b> Two hosts on the same VLAN with different masks can each think the other is "remote". A gateway outside the host's subnet means the host can't reach anything off-link. An address that is the network or broadcast address is rejected by IOS: <code>Bad mask /24 for address 10.1.1.0</code>.</div>`},
{id:"ipv6",num:"1.4",title:"IPv6 addressing, prefixes and EUI-64",html:`
<p>An IPv6 address is 128 bits, written as eight groups of four hex digits. Two rules shorten it: drop <b>leading zeros</b> in any group, and replace <b>one</b> run of all-zero groups with <code>::</code>.</p>
<div class="viz" id="viz-v6short"></div>
<h3>Address types</h3>
<ul><li><b>Global unicast (GUA)</b>: 2000::/3. Internet-routable, like public IPv4.</li>
<li><b>Unique local (ULA)</b>: FC00::/7 (in practice FD00::/8). Private, like RFC 1918.</li>
<li><b>Link-local</b>: FE80::/10. Every IPv6 interface has one automatically. Never routed. Routing protocols use it as the next hop.</li>
<li><b>Multicast</b>: FF00::/8. FF02::1 is all nodes, FF02::2 is all routers. There is no broadcast in IPv6.</li>
<li><b>Anycast</b>: the same address on several devices; packets go to the nearest. <b>Loopback</b> is ::1 and <b>unspecified</b> is ::.</li></ul>
<div class="viz" id="viz-v6type"></div>
<h3>Prefix sizes</h3>
<p>A site usually gets a <b>/48</b> (or /56). Each subnet is a <b>/64</b>, which SLAAC requires. Point-to-point links can use <b>/127</b>, and loopbacks <b>/128</b>.</p>
<h3>Modified EUI-64</h3>
<p>A host or router can build the 64-bit interface ID from its 48-bit MAC: split the MAC in half, insert <code>FFFE</code> in the middle, and flip the 7th bit of the first byte (the universal/local bit).</p>
<div class="viz" id="viz-eui"></div>
<h3>IOS configuration</h3>
<pre class="term">R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0/0
R1(config-if)# ipv6 address 2001:db8:acad:1::1/64
R1(config-if)# interface g0/0/1
R1(config-if)# ipv6 address 2001:db8:acad:2::/64 eui-64
R1(config-if)# ipv6 address fe80::1 link-local
R1# show ipv6 interface brief</pre>
<p>Hosts get addresses by <b>SLAAC</b> (from the router's Router Advertisement), <b>stateless DHCPv6</b> (SLAAC plus DNS from DHCPv6) or <b>stateful DHCPv6</b>. A router interface can be a client with <code>ipv6 address autoconfig</code>.</p>`},
{id:"wireless",num:"1.5",title:"Wireless principles",html:`
<h3>Bands and channels</h3>
<ul><li><b>2.4 GHz</b>: longest range, best wall penetration, but only three non-overlapping channels in the US: <b>1, 6 and 11</b>. Crowded by Bluetooth, microwaves and neighbors.</li>
<li><b>5 GHz</b>: many more non-overlapping 20 MHz channels. Can bond channels to 40, 80 or 160 MHz for speed, at the cost of fewer channels to reuse. Some channels need <b>DFS</b> (the AP must move off if it hears radar).</li>
<li><b>6 GHz</b> (Wi-Fi 6E and 7): a huge clean band, shorter range, and <b>WPA3 is mandatory</b>.</li></ul>
<div class="viz" id="viz-chan"></div>
<h3>RF characteristics</h3>
<ul><li><b>Frequency and wavelength</b>: higher frequency means shorter wavelength, shorter range and weaker penetration.</li>
<li><b>Amplitude</b> is signal strength. Signal is measured in <b>dBm</b>: −30 is excellent, −67 is the usual target for voice, −80 is barely usable.</li>
<li><b>RSSI</b> is the received signal strength. The <b>noise floor</b> is background RF (around −95 dBm). <b>SNR</b> = signal − noise. 25 dB or more is good.</li>
<li>Walls and people <b>absorb</b> signal, metal <b>reflects</b> it (multipath), glass and water <b>refract</b> it, and rough surfaces <b>scatter</b> it. Every 3 dB is double or half the power.</li></ul>
<div class="viz" id="viz-rf"></div>
<h3>Security protocols</h3>
<ul><li><b>WEP</b> and <b>WPA (TKIP)</b> are broken. Don't use them.</li>
<li><b>WPA2</b> uses AES-CCMP. Personal mode uses a pre-shared key (PSK); Enterprise mode uses <b>802.1X/EAP</b> with a RADIUS server.</li>
<li><b>WPA3-Personal</b> replaces the PSK handshake with <b>SAE</b>, which resists offline dictionary attacks. <b>WPA3-Enterprise</b> adds an optional 192-bit mode. WPA3 requires <b>Protected Management Frames</b>. <b>OWE</b> (Enhanced Open) encrypts open guest networks.</li></ul>
<div class="viz" id="viz-wsec"></div>
<h3>Causes of interference</h3>
<p><b>Co-channel interference</b>: APs on the same channel take turns, so throughput drops. <b>Adjacent-channel interference</b>: overlapping channels (like 1 and 3) corrupt each other. <b>Non-Wi-Fi</b> sources: microwave ovens and Bluetooth (2.4 GHz), cordless phones, wireless cameras, radar (5 GHz DFS). Too much transmit power makes cells overlap and clients stick to far-away APs.</p>`},
{id:"client",num:"1.6",title:"Client connectivity on Windows, macOS and Linux",html:`
<p>When a user says "the network is down", check their device first. The questions are always the same: Does it have an address? Is the mask right? Is the gateway reachable? Does DNS work? For wireless: is it on the right SSID with the right security settings?</p>
<table><tr><th>Check</th><th>Windows</th><th>macOS</th><th>Linux</th></tr>
<tr><td>IP, mask, gateway, DNS</td><td><code>ipconfig /all</code></td><td><code>ifconfig</code>, <code>networksetup -getinfo Wi-Fi</code></td><td><code>ip addr</code>, <code>ip route</code>, <code>resolvectl status</code></td></tr>
<tr><td>Renew DHCP</td><td><code>ipconfig /release</code>, <code>/renew</code></td><td><code>sudo ipconfig set en0 DHCP</code></td><td><code>sudo dhclient -r</code> / <code>nmcli con up</code></td></tr>
<tr><td>Reachability</td><td><code>ping</code>, <code>tracert</code></td><td><code>ping</code>, <code>traceroute</code></td><td><code>ping</code>, <code>traceroute</code> / <code>tracepath</code></td></tr>
<tr><td>Name resolution</td><td><code>nslookup</code></td><td><code>nslookup</code>, <code>dig</code></td><td><code>dig</code>, <code>nslookup</code></td></tr>
<tr><td>Wi-Fi details</td><td><code>netsh wlan show interfaces</code></td><td>Option-click the Wi-Fi icon</td><td><code>iw dev wlan0 link</code>, <code>nmcli dev wifi</code></td></tr>
<tr><td>ARP / neighbors</td><td><code>arp -a</code></td><td><code>arp -a</code></td><td><code>ip neigh</code></td></tr></table>
<div class="viz" id="viz-hostcli"></div>
<div class="viz" id="viz-hostfix"></div>
<div class="tip"><b>Exam tip.</b> A 169.254.x.x address means the client never heard from a DHCP server. Ping by IP working while ping by name fails means DNS. A wireless client that associates but never gets an address may be failing 802.1X, or be on a VLAN with no DHCP.</div>`},
{id:"dhcp",num:"1.7",title:"DHCPv4 client, server and relay on IOS",html:`
<p>DHCP hands out addresses, masks, gateways and DNS servers. Clients use UDP port <b>68</b>, servers use UDP <b>67</b>. The exchange is <b>DORA</b>:</p>
<div class="viz" id="viz-dora"></div>
<h3>An IOS router as the server</h3>
<pre class="term">R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.10
R1(config)# ip dhcp pool LAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 192.168.1.53
R1(dhcp-config)# lease 7
R1# show ip dhcp binding
R1# show ip dhcp pool</pre>
<p>Exclude addresses <b>before</b> clients connect, or the router may hand out an address already used by a printer or the gateway.</p>
<h3>Relay</h3>
<p>Discover messages are broadcasts, and routers don't forward broadcasts. If the server is on another subnet, configure a <b>relay agent</b> on the router interface that faces the clients:</p>
<pre class="term">R2(config)# interface g0/0/1
R2(config-if)# ip helper-address 10.0.12.1</pre>
<p>The router turns the broadcast into a unicast to the server and fills in the <b>giaddr</b> field with its own interface address. The server picks the pool whose network contains the giaddr. The server also needs a route back to that subnet.</p>
<div class="viz" id="viz-relay"></div>
<h3>A router as the client</h3>
<p><code>ip address dhcp</code> on an interface (common on the WAN side toward an ISP). The default route is learned from DHCP too.</p>
<div class="viz" id="viz-dhcpcli"></div>
<div class="tip"><b>Troubleshooting DHCP.</b> No <code>ip helper-address</code> on the client-facing interface. The pool's <code>network</code> doesn't match the subnet. No <code>default-router</code> in the pool, so clients get an address but can't leave the subnet. The pool is exhausted. DHCP snooping is on and the uplink isn't trusted.</div>`}
];

const G={
 cable:[["Maximum length of a copper Ethernet run","100 meters"],["Cat 5e","1 Gbps up to 100 m"],["Cat 6","10 Gbps up to about 55 m (1 Gbps to 100 m)"],["Cat 6a","10 Gbps up to 100 m"],["Straight-through cable","Same pinout (T568A or B) on both ends. PC to switch"],["Crossover cable","T568A on one end, T568B on the other. Like device to like device on old gear"],["Auto-MDIX","Port detects and corrects the cable type automatically"],["Multimode fiber","Wide core, short distances (hundreds of meters), cheaper optics"],["Single-mode fiber","Narrow core, laser, long distances (10 km and more)"],["10GBASE-SR","10 Gbps short-range over multimode fiber (about 300–400 m)"],["10GBASE-LR","10 Gbps long-range over single-mode fiber (10 km)"],["LC connector","Small form-factor fiber connector used on SFP modules"],["SFP / SFP+","Hot-swappable transceiver module: SFP for 1 Gbps, SFP+ for 10 Gbps"],["DAC / twinax","Direct-attach copper cable with SFP+ ends, for short in-rack links"],["CRC errors","Corrupted frames: cabling, EMI, dirty fiber or duplex mismatch"],["Runts","Frames smaller than 64 bytes"],["Giants","Frames larger than the interface MTU"],["Late collisions","Collisions after the first 64 bytes: duplex mismatch or cable too long"],["Duplex mismatch symptom","Half-duplex side: late collisions. Full-duplex side: CRC errors and runts"],["Speed mismatch symptom","The link doesn't come up"],["Output drops","Egress queue overflow from congestion"],["administratively down","The interface was shut down with the shutdown command"],["down/down","Layer 1 problem: cable, optic, speed or no device attached"],["up/down","Layer 2 problem: encapsulation or keepalive mismatch"],["show interfaces transceiver","Shows optical Tx/Rx power, temperature and voltage"],["Healthy optical Rx power","Roughly −1 to −10 dBm (check the optic's datasheet)"],["Why fiber resists EMI","It carries light, not electrical current"]],
 virt:[["Hypervisor","Software that creates and runs virtual machines"],["Type 1 hypervisor","Runs directly on hardware (ESXi, Hyper-V, KVM)"],["Type 2 hypervisor","Runs as an application on a host OS (VirtualBox, Workstation)"],["Virtual machine","Full guest OS with virtual CPU, RAM, disk and NICs"],["Container","App and its libraries sharing the host OS kernel"],["Container advantage over a VM","Starts in seconds and uses far less memory"],["VM advantage over a container","Stronger isolation; can run a different OS than the host"],["Docker","Builds and runs containers from images"],["Kubernetes","Orchestrates containers across many hosts"],["vSwitch","Software switch inside a hypervisor that connects VMs to physical NICs"],["Switch port facing a hypervisor host","Usually an 802.1Q trunk carrying the VMs' VLANs"]],
 ipv4:[["Private range 10","10.0.0.0/8"],["Private range 172","172.16.0.0/12 (172.16.0.0 to 172.31.255.255)"],["Private range 192","192.168.0.0/16"],["APIPA","169.254.0.0/16: self-assigned when DHCP fails"],["Loopback range","127.0.0.0/8"],["Carrier-grade NAT shared space","100.64.0.0/10"],["IPv4 multicast range","224.0.0.0/4 (224 to 239)"],["/24 mask","255.255.255.0 · 254 hosts"],["/25 mask","255.255.255.128 · 126 hosts"],["/26 mask","255.255.255.192 · 62 hosts"],["/27 mask","255.255.255.224 · 30 hosts"],["/28 mask","255.255.255.240 · 14 hosts"],["/29 mask","255.255.255.248 · 6 hosts"],["/30 mask","255.255.255.252 · 2 hosts"],["/31","Point-to-point link with 2 addresses and no broadcast (RFC 3021)"],["/32","A single host route, used for loopbacks"],["Usable hosts formula","2^(host bits) − 2"],["Block size","256 minus the mask value in the interesting octet"],["Broadcast address","The last address in the subnet: one less than the next subnet"],["VLSM rule","Allocate the largest subnet first"],["Wildcard of /24","0.0.0.255"],["Wildcard of /30","0.0.0.3"]],
 ipv6:[["IPv6 address length","128 bits"],["IPv6 shortening rules","Drop leading zeros in each group; replace one run of zero groups with ::"],["Global unicast range","2000::/3"],["Unique local range","FC00::/7 (FD00::/8 in practice)"],["Link-local range","FE80::/10"],["IPv6 multicast range","FF00::/8"],["FF02::1","All IPv6 nodes on the link"],["FF02::2","All IPv6 routers on the link"],["Solicited-node multicast","FF02::1:FFxx:xxxx, used by neighbor discovery instead of ARP"],["IPv6 loopback","::1"],["Unspecified address","::"],["Anycast","One address on several devices; traffic goes to the nearest"],["Standard subnet size","/64"],["Typical site allocation","/48"],["Point-to-point link prefix","/127"],["Modified EUI-64 steps","Split the MAC, insert FFFE, flip the 7th bit"],["SLAAC","Host builds its own address from the router's RA prefix"],["Stateless DHCPv6","SLAAC for the address plus DHCPv6 for DNS"],["Stateful DHCPv6","DHCPv6 server assigns the address"],["Enable IPv6 routing on IOS","ipv6 unicast-routing"],["ipv6 address autoconfig","Interface gets an address by SLAAC"],["Neighbor Discovery","ICMPv6 RS, RA, NS, NA messages that replace ARP and router discovery"]],
 wifi:[["Non-overlapping 2.4 GHz channels (US)","1, 6 and 11"],["Advantage of 2.4 GHz","Longer range and better penetration"],["Advantage of 5 GHz","More non-overlapping channels and wider channels"],["DFS","Dynamic Frequency Selection: 5 GHz APs must leave a channel if they detect radar"],["6 GHz security requirement","WPA3 (and OWE for open networks)"],["RSSI","Received signal strength, in dBm"],["Good signal for voice","About −67 dBm or stronger"],["Noise floor","Background RF energy, often around −95 dBm"],["SNR","Signal minus noise, in dB. 25 dB or more is good"],["3 dB rule","Every 3 dB doubles or halves the power"],["Absorption","Walls, water and people soak up RF"],["Reflection","Metal bounces RF and causes multipath"],["WEP","Broken legacy encryption"],["WPA2 encryption","AES-CCMP"],["WPA2/WPA3 Personal","Shared passphrase (PSK or SAE)"],["WPA2/WPA3 Enterprise","802.1X/EAP authentication against a RADIUS server"],["SAE","WPA3-Personal handshake that resists offline dictionary attacks"],["PMF","Protected Management Frames, required by WPA3"],["OWE","Opportunistic Wireless Encryption: encrypts open networks"],["Co-channel interference","Nearby APs on the same channel must share airtime"],["Adjacent-channel interference","Overlapping channels corrupt each other's frames"],["Common 2.4 GHz non-Wi-Fi interference","Microwave ovens, Bluetooth, cordless phones"]],
 client:[["Windows: full IP config","ipconfig /all"],["Windows: renew DHCP","ipconfig /release then ipconfig /renew"],["Windows: trace a path","tracert"],["Windows: Wi-Fi details","netsh wlan show interfaces"],["macOS: IP details","ifconfig or networksetup -getinfo Wi-Fi"],["Linux: IP addresses","ip addr"],["Linux: routing table","ip route"],["Linux: neighbor (ARP) table","ip neigh"],["Linux: DNS servers","resolvectl status (or /etc/resolv.conf)"],["DNS query tools","nslookup and dig"],["Ping by IP works, by name fails","DNS problem"],["Client shows 169.254.x.x","DHCP failed"]],
 dhcp:[["DORA","Discover, Offer, Request, Acknowledge"],["DHCP ports","UDP 67 (server) and 68 (client)"],["DHCP Discover destination","255.255.255.255 broadcast, from source 0.0.0.0"],["ip helper-address","Relays DHCP broadcasts to a server on another subnet"],["Where helper-address goes","On the interface that faces the clients"],["giaddr","Relay agent's interface address; tells the server which pool to use"],["ip dhcp excluded-address","Addresses the IOS server must never hand out"],["ip dhcp pool NAME","Creates a pool and enters dhcp-config mode"],["default-router","Pool option that gives clients their gateway"],["dns-server","Pool option that gives clients DNS servers"],["show ip dhcp binding","Lists the leases the IOS server has handed out"],["show ip dhcp pool","Pool size, leased count and ranges"],["Router as DHCP client","ip address dhcp on the interface"],["Lease renewal (T1)","At 50% of the lease the client tries to renew"]]
};
const DECKS=[["cable","Cabling and interfaces"],["virt","Virtualization"],["ipv4","IPv4 and subnetting"],["ipv6","IPv6"],["wifi","Wireless"],["client","Client connectivity"],["dhcp","DHCP"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A switch port shows thousands of late collisions and the port is running half duplex. The PC on the other end is hard-set to 100/full. What's the problem?",o:["Duplex mismatch","Speed mismatch","Bad optic","MTU mismatch"],a:0,e:"The switch couldn't negotiate with a hard-set peer, so it fell back to half duplex. Late collisions on the half side are the classic sign."},
 {q:"An interface shows a rising CRC count, zero collisions and full duplex on both ends. What's the most likely cause?",o:["A damaged cable or interference","A duplex mismatch","Congestion","A VLAN mismatch"],a:0,e:"CRC errors without collisions point to corruption on the wire: bad cable, bad termination or EMI."},
 {q:"Which counter increases when frames larger than the MTU arrive?",o:["Giants","Runts","CRC","Output drops"],a:0,e:"Giants are oversized frames, often from jumbo frames on one side only."},
 {q:"show interfaces reports 'GigabitEthernet0/1 is administratively down, line protocol is down'. What fixes it?",o:["no shutdown on the interface","Replace the cable","Change the duplex","Add an IP address"],a:0,e:"Administratively down means the interface was shut down in the configuration."},
 {q:"Two switches are 800 m apart in the same campus and need a 10 Gbps link. Which option fits best?",o:["10GBASE-LR over single-mode fiber","Cat 6a UTP","10GBASE-SR over OM3 multimode","Twinax DAC"],a:0,e:"800 m is beyond copper's 100 m and SR's ~300–400 m. LR on single-mode reaches 10 km."},
 {q:"What's the maximum length of a copper Ethernet segment?",o:["100 m","55 m","185 m","300 m"],a:0,e:"Every twisted-pair Ethernet standard is limited to 100 m per run."},
 {q:"Which fiber connector is the small form factor used on most SFP modules?",o:["LC","SC","ST","RJ45"],a:0,e:"LC is the small duplex connector on SFP/SFP+ optics."},
 {q:"A fiber link is flapping and show interfaces transceiver reports Rx power of −24 dBm. What should you check first?",o:["Dirty or damaged connectors and the fiber path","The duplex setting","The VLAN on the port","The IP address"],a:0,e:"−24 dBm is far below normal. Clean and inspect connectors, check patch cords and splices, and confirm the fiber type."},
 {q:"Which output points to congestion rather than a fault?",o:["Rising output drops with txload near 255/255","Rising CRC errors","Late collisions","Runts"],a:0,e:"Output drops while the transmit load is maxed out mean the link is full."},
 {q:"Which hypervisor type runs directly on the server hardware?",o:["Type 1","Type 2","Container runtime","Guest OS"],a:0,e:"Type 1 (bare-metal) hypervisors like ESXi run without a host OS."},
 {q:"What do containers share that VMs don't?",o:["The host OS kernel","A virtual NIC","A hypervisor","A physical switch port"],a:0,e:"Containers run on the host's kernel, which makes them small and fast to start."},
 {q:"A server runs ESXi with VMs in VLANs 10, 20 and 30. How should the switch port to the server be configured?",o:["802.1Q trunk allowing VLANs 10, 20 and 30","Access port in VLAN 10","Routed port","Access port in the native VLAN"],a:0,e:"The vSwitch tags the VMs' traffic, so the physical port must be a trunk."},
 {q:"VirtualBox running on a Windows laptop is an example of what?",o:["Type 2 hypervisor","Type 1 hypervisor","Container orchestrator","Bare-metal server"],a:0,e:"A hypervisor that runs as an app on a host OS is Type 2."},
 {q:"Which address is private?",o:["172.20.14.9","172.32.0.5","100.64.1.1","11.0.0.1"],a:0,e:"172.16.0.0/12 covers 172.16 through 172.31."},
 {q:"A PC has the address 169.254.33.7. What does that tell you?",o:["It didn't get a reply from a DHCP server","It's on the internet","It has a static address","It's using IPv6"],a:0,e:"169.254.0.0/16 is APIPA, self-assigned when DHCP fails."},
 {q:"What is the network address of 172.16.45.130/26?",o:["172.16.45.128","172.16.45.64","172.16.45.0","172.16.45.192"],a:0,e:"/26 has a block size of 64. 130 falls in the 128 block."},
 {q:"What is the broadcast address of 10.10.10.70/27?",o:["10.10.10.95","10.10.10.63","10.10.10.127","10.10.10.79"],a:0,e:"Block of 32: 64 to 95. The broadcast is 95."},
 {q:"How many usable hosts does a /28 provide?",o:["14","16","30","6"],a:0,e:"4 host bits: 2^4 − 2 = 14."},
 {q:"Which mask gives at least 50 usable hosts with the least waste?",o:["255.255.255.192","255.255.255.128","255.255.255.224","255.255.255.0"],a:0,e:"/26 gives 62 hosts. /27 gives only 30."},
 {q:"Which prefix is used for a router loopback interface?",o:["/32","/30","/31","/24"],a:0,e:"A loopback is a single address, so /32."},
 {q:"Using VLSM on 192.168.50.0/24, you need subnets for 100, 50 and 20 hosts. What's the right order to allocate them?",o:["100, then 50, then 20","20, then 50, then 100","Any order","50, then 100, then 20"],a:0,e:"Largest first keeps every block aligned on its boundary."},
 {q:"Which host can't reach its default gateway because of an addressing mistake?",o:["IP 192.168.1.10/24, gateway 192.168.2.1","IP 10.1.1.20/24, gateway 10.1.1.1","IP 172.16.5.9/16, gateway 172.16.0.1","IP 192.168.7.130/25, gateway 192.168.7.129"],a:0,e:"192.168.2.1 isn't in 192.168.1.0/24, so the host can't ARP for it."},
 {q:"Which is the correct shortest form of 2001:0db8:0000:0000:0000:ff00:0042:8329?",o:["2001:db8::ff00:42:8329","2001:db8:0:0::ff00:42:8329","2001:db8::ff00::42:8329","2001:0db8::ff:42:8329"],a:0,e:"Drop leading zeros and replace the single run of zero groups with ::."},
 {q:"Which IPv6 prefix is link-local?",o:["FE80::/10","FC00::/7","2000::/3","FF00::/8"],a:0,e:"Link-local addresses start with FE80."},
 {q:"What replaces broadcast in IPv6?",o:["Multicast","Anycast","Unicast flooding","ARP"],a:0,e:"IPv6 has no broadcast; it uses multicast such as FF02::1."},
 {q:"A router interface has MAC 0050.7966.6800 and is configured with 'ipv6 address 2001:db8:1::/64 eui-64'. What's the interface ID?",o:["0250:79FF:FE66:6800","0050:79FF:FE66:6800","0250:7966:6800:FFFE","FFFE:0050:7966:6800"],a:0,e:"Insert FFFE in the middle and flip the 7th bit: 00 becomes 02."},
 {q:"Which IPv6 address type is like RFC 1918 private IPv4?",o:["Unique local (FD00::/8)","Link-local","Global unicast","Anycast"],a:0,e:"ULAs are private and not routed on the internet."},
 {q:"Which command is needed before a router will forward IPv6 packets?",o:["ipv6 unicast-routing","ipv6 enable","ip routing","ipv6 address autoconfig"],a:0,e:"IPv6 routing is off by default on IOS."},
 {q:"Which prefix length does SLAAC require?",o:["/64","/48","/56","/127"],a:0,e:"SLAAC builds a 64-bit interface ID, so the prefix must be /64."},
 {q:"Which IPv6 prefix is recommended for point-to-point router links?",o:["/127","/64 only","/30","/128"],a:0,e:"RFC 6164 recommends /127 on point-to-point links."},
 {q:"Which three 2.4 GHz channels don't overlap in the US?",o:["1, 6, 11","1, 5, 9","2, 7, 12","1, 4, 8"],a:0,e:"Channels are 5 MHz apart and 20–22 MHz wide, so 1, 6 and 11 are clear of each other."},
 {q:"Why might you choose 20 MHz channels instead of 80 MHz in a dense 5 GHz deployment?",o:["More non-overlapping channels to reuse between APs","Longer range","Required by WPA3","2.4 GHz compatibility"],a:0,e:"Narrow channels give more independent channels, which reduces co-channel interference."},
 {q:"A client sees an AP at −72 dBm with a noise floor of −92 dBm. What's the SNR?",o:["20 dB","164 dB","−20 dB","72 dB"],a:0,e:"SNR = −72 − (−92) = 20 dB. That's marginal for voice."},
 {q:"Which wireless security method uses SAE?",o:["WPA3-Personal","WPA2-Personal","WEP","WPA2-Enterprise"],a:0,e:"SAE replaces the PSK four-way handshake's weakness against offline guessing."},
 {q:"A company wants every user to log in to Wi-Fi with their own directory credentials. What should it use?",o:["WPA3-Enterprise with 802.1X and RADIUS","WPA3-Personal with one passphrase","An open SSID","WEP with a long key"],a:0,e:"Enterprise mode authenticates each user through 802.1X."},
 {q:"Users near the break room lose Wi-Fi every lunchtime on 2.4 GHz. What's the likely cause?",o:["Microwave oven interference","DFS radar events","WPA3 transition","Too many SSIDs"],a:0,e:"Microwave ovens emit around 2.45 GHz."},
 {q:"Which band requires WPA3 or OWE?",o:["6 GHz","2.4 GHz","5 GHz","900 MHz"],a:0,e:"Wi-Fi 6E's 6 GHz band doesn't allow legacy security."},
 {q:"What happens when a 5 GHz AP on a DFS channel detects radar?",o:["It must move to another channel","It increases power","It switches to 2.4 GHz permanently","It disables WPA3"],a:0,e:"DFS rules require the AP to vacate the channel."},
 {q:"Which RF behavior causes multipath when signals bounce off metal shelving?",o:["Reflection","Absorption","Refraction","Amplification"],a:0,e:"Metal reflects RF, creating multiple copies that arrive at different times."},
 {q:"Which Windows command shows the DHCP server and lease times?",o:["ipconfig /all","ipconfig","arp -a","netstat -r"],a:0,e:"Plain ipconfig shows only the basics."},
 {q:"Which Linux command shows the routing table?",o:["ip route","ip addr","ip neigh","nmcli dev wifi"],a:0,e:"ip route lists routes, including the default gateway."},
 {q:"A user can ping 8.8.8.8 but can't browse to any website by name. What should you check?",o:["DNS server settings","The default gateway","The cable","The VLAN"],a:0,e:"Reachability by IP works, so routing is fine. Name resolution is failing."},
 {q:"Which command shows a Windows laptop's current SSID, signal and channel?",o:["netsh wlan show interfaces","ipconfig /all","tracert","route print"],a:0,e:"netsh wlan show interfaces lists the SSID, BSSID, signal percentage and channel."},
 {q:"Which macOS command shows the IP settings of the Wi-Fi service?",o:["networksetup -getinfo Wi-Fi","ipconfig /all","ip addr show","netsh interface show"],a:0,e:"networksetup is the macOS command-line tool for network services."},
 {q:"In which order do DHCP messages flow?",o:["Discover, Offer, Request, Acknowledge","Request, Offer, Discover, Acknowledge","Discover, Request, Offer, Acknowledge","Offer, Discover, Acknowledge, Request"],a:0,e:"DORA."},
 {q:"Clients on 192.168.20.0/24 can't get addresses from a DHCP server at 10.0.12.1. The pool is correct. What's missing on the branch router?",o:["ip helper-address 10.0.12.1 on the LAN interface","ip dhcp pool on the branch router","ip helper-address on the WAN interface","A static ARP entry"],a:0,e:"The relay goes on the interface that receives the client broadcasts."},
 {q:"How does a DHCP server know which pool to use for a relayed request?",o:["The giaddr field set by the relay agent","The client's MAC address","The destination port","The DNS name"],a:0,e:"The relay puts its interface address in giaddr, and the server matches it to a pool network."},
 {q:"Clients get an address from an IOS DHCP pool but can't reach other subnets. What's the most likely missing pool setting?",o:["default-router","dns-server","lease","domain-name"],a:0,e:"Without a gateway, clients can only reach their own subnet."},
 {q:"Which command keeps an IOS DHCP server from handing out 192.168.10.1 to .10?",o:["ip dhcp excluded-address 192.168.10.1 192.168.10.10","ip dhcp pool exclude 1-10","no ip dhcp 192.168.10.1","dhcp reserve 192.168.10.1 10"],a:0,e:"ip dhcp excluded-address takes a start and optional end address, in global config."},
 {q:"Which command lists the addresses an IOS DHCP server has leased?",o:["show ip dhcp binding","show dhcp lease","show ip dhcp pool","show ip interface brief"],a:0,e:"show ip dhcp binding lists the IP address, MAC address and lease expiry of each client."},
 {q:"Which interface command makes a router get its address from the ISP by DHCP?",o:["ip address dhcp","ip dhcp client","ip helper-address","dhcp enable"],a:0,e:"ip address dhcp turns the interface into a DHCP client."},
 {q:"Which UDP port does a DHCP server listen on?",o:["67","68","53","69"],a:0,e:"Servers use 67 and clients use 68."},
 {q:"A small office uses one passphrase on its Wi-Fi and wants the strongest current protection. What should it choose?",o:["WPA3-Personal","WPA2-Enterprise","WEP","WPA with TKIP"],a:0,e:"WPA3-Personal with SAE is the current standard for passphrase networks."},
 {q:"Two APs next to each other are on channels 1 and 3. What's the problem?",o:["Adjacent-channel interference","Co-channel interference","DFS","Too much SNR"],a:0,e:"Channels 1 and 3 overlap, so the APs corrupt each other's frames. Use 1, 6 and 11."}
];

registerModule({
  id:"inf",slug:"infrastructure",title:"Network Infrastructure and Connectivity",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["cablepick","counters","virt","vmcont","v4types","subnet","subdrill","vlsm","v6short","v6type","eui","chan","rf","wsec","hostcli","hostfix","dora","relay","dhcpcli"],
  viz(){
sortViz($("#viz-cablepick"),{title:"Pick the media for each link",bins:{utp:"Cat 6a UTP",mmf:"Multimode fiber",smf:"Single-mode fiber",dac:"Twinax DAC"},
  items:[["Desk to closet, 80 m, 1 Gbps with PoE","utp","Within 100 m and it needs to carry power."],["Server to top-of-rack switch, 3 m, 25 Gbps","dac","Short in-rack runs are cheapest with direct-attach copper."],["Between two buildings 6 km apart","smf","Only single-mode reaches kilometers."],["Floor to floor, 250 m, 10 Gbps","mmf","Within 10GBASE-SR's reach on OM3/OM4."],["Through a factory full of large motors, 200 m","mmf","Fiber ignores EMI, and 200 m is too far for copper anyway."],["Wireless AP in the ceiling, 60 m","utp","PoE needs copper."],["Carrier handoff to a site 30 km away","smf","Long reach needs single-mode with ER optics."]],done:"Matched every link to its media"});

/* ---- interface counter detective ---- */
(function(){
  const el=$("#viz-counters");
  const SC={
   dup:["Duplex mismatch",{dup:"Half-duplex, 100Mb/s",crc:"1,842",late:"912",runts:"220",inerr:"2,062"},"Half duplex on this side while the PC is hard-set to full. Auto-negotiation failed against the hard-set peer and fell back to half. Late collisions climb whenever traffic is heavy. Set both ends to auto, or both to the same fixed speed and duplex."],
   emi:["Bad cable / EMI",{crc:"23,560",inerr:"23,611"},"CRC and input errors are high while collisions are zero, so it isn't duplex. Frames are being corrupted on the wire: re-terminate or replace the cable, and route it away from power and motors."],
   mtu:["MTU mismatch",{giants:"48,203"},"Giants are frames larger than this port's 1500-byte MTU. The server is sending 9000-byte jumbo frames. Enable jumbo frames along the whole path, or set the server back to 1500."],
   cong:["Congestion",{drops:"118,442",load:"txload 255/255"},"Output drops while the transmit load is pegged at 255/255 (100%). Nothing is broken: the link is full. Add bandwidth with an EtherChannel or a faster link, or apply QoS."],
   fiber:["Low optical power",{opt:true,crc:"4,118",inerr:"4,120"},"Rx power of −19.7 dBm is below the optic's alarm threshold. Clean both LC connectors, check the patch cords, and make sure an SR optic isn't on single-mode fiber."]};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Interface detective: read show interfaces and name the fault</div><div class="chips">${Object.entries(SC).map(([k,s])=>`<button class="chip" data-k="${k}">${s[0]}</button>`).join("")}</div><pre class="term ct"></pre><div class="caption" aria-live="polite"></div><div class="rv-prog s-small"></div>`;
  function draw(k){const v=SC[k]?SC[k][1]:{};const h=(key,def)=>v[key]?`<span class="t-bad">${v[key]}</span>`:def;
    $(".ct",el).innerHTML=`<span class="t-c">SW1# show interfaces gi1/0/7</span>
GigabitEthernet1/0/7 is up, line protocol is up (connected)
  Hardware is Gigabit Ethernet, address is 00a1.0a6f.0107 (bia 00a1.0a6f.0107)
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, ${h("load","txload 12/255")}, rxload 9/255
  ${h("dup","Full-duplex, 1000Mb/s")}, media type is ${v.opt?"1000BaseSX SFP":"10/100/1000BaseTX"}
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: ${h("drops","0")}
     4812201 packets input, 3991022104 bytes, 0 no buffer
     Received 21004 broadcasts (8121 multicasts)
     ${h("runts","0")} runts, ${h("giants","0")} giants, 0 throttles
     ${h("inerr","0")} input errors, ${h("crc","0")} CRC, 0 frame, 0 overrun, 0 ignored
     3702551 packets output, 2118930442 bytes, 0 underruns
     0 output errors, ${v.late?'<span class="t-bad">2114</span>':"0"} collisions, 0 interface resets
     ${h("late","0")} late collision, 0 deferred${v.opt?`

<span class="t-c">SW1# show interfaces gi1/0/7 transceiver</span>
                                  Optical   Optical
           Temperature  Voltage  Tx Power  Rx Power
Port       (Celsius)    (Volts)  (dBm)     (dBm)
---------  -----------  -------  --------  --------
Gi1/0/7      31.2       3.29      -5.1    <span class="t-bad">-19.7 --</span>`:""}`;
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    $(".caption",el).innerHTML=SC[k]?`<b>${SC[k][0]}.</b> ${SC[k][2]}`:"A healthy port: zero errors. Pick a fault to see which counters change.";
    $(".rv-prog",el).textContent=`${seen.size} of ${Object.keys(SC).length} faults diagnosed`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;seen.add(b.dataset.k);draw(b.dataset.k);if(seen.size===Object.keys(SC).length)award("viz:counters",30,"Diagnosed every interface fault")});draw();
})();

/* ---- virtualization stacks ---- */
(function(){
  const el=$("#viz-virt");const seen=new Set();
  const ST={t1:["Type 1 hypervisor",["App","App","App"],["Guest OS","Guest OS","Guest OS"],["Hypervisor (ESXi, Hyper-V, KVM)"],["Server hardware"],"The hypervisor is the operating system of the box. Each VM carries a full guest OS. Best performance and isolation, so data centers use it."],
    t2:["Type 2 hypervisor",["App","App"],["Guest OS","Guest OS"],["Hypervisor app (VirtualBox)"],["Host OS (Windows, macOS)","Laptop hardware"],"The hypervisor is just an application on a normal OS. Easy for labs and testing, but slower because everything goes through the host OS."],
    ct:["Containers",["App + libs","App + libs","App + libs","App + libs"],[],["Container runtime (Docker / containerd)"],["Host OS kernel (shared)","Server or VM"],"No guest OS. Containers share the host's kernel, so they start in seconds and you can pack many more onto a host. Kubernetes schedules them across hosts."]};
  el.innerHTML=`<div class="viz-title">Stack it up: VMs versus containers</div><div class="chips">${Object.entries(ST).map(([k,s])=>`<button class="chip" data-k="${k}">${s[0]}</button>`).join("")}</div><div class="vstack"></div><div class="caption" aria-live="polite">Pick a stack to see its layers.</div>`;
  function draw(k){const s=ST[k];const row=(L,c)=>L.length?`<div class="vs-row">${L.map(x=>`<span class="vs-b ${c}">${x}</span>`).join("")}</div>`:"";
    $(".vstack",el).innerHTML=row(s[1],"app")+row(s[2],"os")+row(s[3],"hv")+s[4].map(x=>row([x],"hw")).join("");$(".caption",el).innerHTML=`<b>${s[0]}.</b> ${s[5]}`;
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k))}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;seen.add(b.dataset.k);draw(b.dataset.k);if(seen.size===3)award("viz:virt",20,"Compared VMs and containers")});
})();
sortViz($("#viz-vmcont"),{title:"VM, container, or both?",bins:{vm:"Virtual machine",ct:"Container",both:"Both"},
  items:[["Runs its own full operating system","vm","Each VM boots a guest OS."],["Shares the host OS kernel","ct","That's what makes containers light."],["Starts in about a second","ct","No OS to boot."],["Can run Windows on a Linux host","vm","A container can't bring a different kernel."],["Gets a virtual network interface","both","Both connect to a virtual switch or bridge."],["Is created from an image","both","VM templates and container images both exist."],["Managed at scale by Kubernetes","ct","Kubernetes orchestrates containers."],["Runs on ESXi or Hyper-V","vm","Those are hypervisors for VMs."]],done:"Sorted every VM and container trait"});

sortViz($("#viz-v4types"),{title:"Private, public or special?",bins:{pri:"Private (RFC 1918)",pub:"Public",sp:"Special use"},
  items:[["10.44.2.9","pri","10.0.0.0/8"],["172.31.250.1","pri","172.16.0.0/12 ends at 172.31.255.255."],["172.32.0.10","pub","Just past the 172.16/12 range, so it's public."],["192.168.100.4","pri","192.168.0.0/16"],["8.8.4.4","pub","Google's public DNS."],["169.254.10.20","sp","APIPA: DHCP failed."],["127.0.0.1","sp","Loopback."],["100.64.9.1","sp","Carrier-grade NAT shared space (100.64.0.0/10)."],["224.0.0.5","sp","Multicast (OSPF uses it)."]],done:"Classified every IPv4 address"});

/* ---- subnet calculator ---- */
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
    $(".sn-grid",el).innerHTML=[["Subnet mask",toStr(mask)],["Wildcard mask",toStr(~mask>>>0)],["Usable hosts",hosts.toLocaleString("en-US")],["Network ID",toStr(net)],["Broadcast",toStr(bc)],["Usable range",toStr(net+1)+" – "+toStr(bc-1)]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
    $(".caption",el).innerHTML=`The bits show <b class="mono">${IP.join(".")}</b> in binary. ${n%8?`The interesting octet is octet ${oct+1}, and the block size is 256 − ${256-block} = <b>${block}</b>, so subnets start every ${block} in that octet.`:"The prefix falls on an octet boundary, so the subnet is whole octets."} The wildcard mask is the mask inverted, which is what OSPF network statements and ACLs use.`;
  }
  r.addEventListener("input",()=>{draw();award("viz:subnet",20,"Explored subnetting")});
  ipIn.addEventListener("input",()=>{const p=ipIn.value.trim().split(".").map(Number);if(p.length===4&&p.every(x=>Number.isInteger(x)&&x>=0&&x<=255)){IP=p;ipIn.removeAttribute("aria-invalid");draw()}else ipIn.setAttribute("aria-invalid","true")});
  draw();
})();

/* ---- subnetting speed drill ---- */
(function(){
  const el=$("#viz-subdrill");let right=0,streak=0,q=null,ans=null;const t0=()=>Date.now();let st=t0();
  const toStr=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
  function gen(){const pre=[17,19,20,21,22,23,25,26,27,28,29,30][Math.floor(Math.random()*12)];const a=[[10,Math.floor(Math.random()*256)],[172,16+Math.floor(Math.random()*16)],[192,168]][Math.floor(Math.random()*3)];
    const ip=((a[0]<<24)>>>0)+(a[1]<<16)+(Math.floor(Math.random()*256)<<8)+Math.floor(Math.random()*254)+1;const mask=(0xFFFFFFFF<<(32-pre))>>>0,net=(ip&mask)>>>0,bc=(net|(~mask>>>0))>>>0;
    const kinds=[["What is the network address?",toStr(net),[toStr(bc),toStr((net+2**(32-pre))>>>0),toStr(net+1)]],["What is the broadcast address?",toStr(bc),[toStr(net),toStr(bc-1),toStr((bc+2**(32-pre))>>>0)]],["How many usable hosts?",String(2**(32-pre)-2),[String(2**(32-pre)),String(2**(31-pre)-2),String(2**(33-pre)-2)]],["What is the last usable address?",toStr(bc-1),[toStr(bc),toStr(net+1),toStr(bc-2)]]];
    const k=kinds[Math.floor(Math.random()*4)];const opts=shuffleArr([k[1],...[...new Set(k[2])].filter(x=>x!==k[1]).slice(0,3)]);return {ip:toStr(ip)+"/"+pre,q:k[0],a:k[1],opts}}
  function draw(){q=q||gen();el.innerHTML=`<div class="viz-title">Subnetting drill <span class="s-small">${right} correct · streak ${streak}</span></div><p class="qtext"><b class="mono">${q.ip}</b> · ${q.q}</p>
    <div class="opts">${q.opts.map((o,i)=>`<button class="opt ${ans!==null&&o===q.a?"right":""} ${ans===o&&o!==q.a?"wrong":""}" data-o="${esc(o)}" ${ans!==null?"disabled":""}><span class="k">${"ABCD"[i]}</span><span class="mono">${o}</span></button>`).join("")}</div>
    <div class="caption" aria-live="polite">${ans===null?"Get five right to complete the drill. Work it out with the block size, not the calculator.":ans===q.a?`<span class="status-good">Correct.</span> ${streak>=3?"You're on a roll.":""}`:`<span class="status-bad">Not quite.</span> The answer is <b class="mono">${q.a}</b>. Find the block size in the interesting octet and count up from 0.`}</div>
    ${ans!==null?`<div class="viz-controls"><button class="btn primary" data-a="next">Next address</button></div>`:""}`}
  el.addEventListener("click",e=>{const o=e.target.closest("[data-o]"),a=e.target.closest("[data-a]");
    if(o&&ans===null){ans=o.dataset.o;if(ans===q.a){right++;streak++}else streak=0;draw();if(right>=5)award("viz:subdrill",30,"Finished the subnetting drill")}
    if(a){q=null;ans=null;draw()}});draw();
})();

/* ---- VLSM planner ---- */
(function(){
  const el=$("#viz-vlsm");
  const NEED=[["Sales LAN",100],["Engineering LAN",50],["Management LAN",20],["WAN link A",2],["WAN link B",2]];
  const pick={};let checked=false;
  const toStr=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
  const best=h=>{let p=30;while(2**(32-p)-2<h)p--;return p};
  el.innerHTML=`<div class="viz-title">VLSM planner: carve 192.168.50.0/24</div><p class="s-small">CHOOSE THE SMALLEST PREFIX THAT FITS EACH SUBNET. THE PLANNER ALLOCATES LARGEST FIRST.</p><div class="vlsm"></div><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="check">Allocate</button></div>`;
  function draw(msg){let base=((192<<24)>>>0)+(168<<16)+(50<<8);
    const order=NEED.map((n,i)=>i).sort((a,b)=>NEED[b][1]-NEED[a][1]);const alloc={};let over=false;
    order.forEach(i=>{const p=pick[i];if(!p)return;const size=2**(32-p);base=Math.ceil(base/size)*size;alloc[i]=[base,p];base+=size;if(base>((192<<24)>>>0)+(168<<16)+(51<<8))over=true});
    $(".vlsm",el).innerHTML=NEED.map(([n,h],i)=>{const a=alloc[i],ok=checked&&pick[i]===best(h);return `<div class="vl-row${checked?(ok?" ok":" no"):""}"><span><b>${n}</b><span class="s-small">${h} hosts</span></span><select data-i="${i}" aria-label="Prefix for ${n}"><option value="">Prefix…</option>${[23,24,25,26,27,28,29,30].map(p=>`<option value="${p}" ${pick[i]===p?"selected":""}>/${p} (${2**(32-p)-2} hosts)</option>`).join("")}</select><span class="mono">${a?toStr(a[0])+"/"+a[1]:"—"}</span></div>`}).join("");
    if(msg)$(".caption",el).innerHTML=msg}
  el.addEventListener("change",e=>{const s=e.target.closest("[data-i]");if(!s)return;pick[+s.dataset.i]=s.value?+s.value:undefined;checked=false;draw()});
  el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;checked=true;const wrong=NEED.filter(([n,h],i)=>pick[i]!==best(h));
    if(!wrong.length){draw(`<span class="status-good">A clean plan.</span> Sales gets a /25, Engineering a /26, Management a /27 and each WAN link a /30, with room left over at 192.168.50.232. Largest first keeps every block on its boundary.`);award("viz:vlsm",30,"Built a VLSM plan")}
    else draw(`<span class="status-bad">${wrong.length} subnet${wrong.length>1?"s are":" is"} not the best fit.</span> Pick the smallest prefix whose usable hosts (2<sup>host bits</sup> − 2) cover the need. Too big wastes space; too small doesn't fit.`)});
  draw("Pick a prefix for each subnet, then allocate.");
})();

/* ---- IPv6 shortening ---- */
(function(){
  const el=$("#viz-v6short");
  const Q=["2001:0db8:0000:0000:0000:0000:0000:0001","fe80:0000:0000:0000:02a0:c9ff:fe12:3456","2001:0db8:0abc:0000:0000:0000:0000:0042","fd00:0000:0000:0012:0000:0000:0000:0bad","ff02:0000:0000:0000:0000:0000:0000:0002","2001:0db8:acad:0001:0000:0000:0000:0001"];
  let i=0,right=0;
  const expand=s=>{s=s.trim().toLowerCase();if(!/^[0-9a-f:]+$/.test(s)||(s.match(/::/g)||[]).length>1)return null;let [a,b]=s.includes("::")?s.split("::"):[s,null];const A=a?a.split(":"):[],B=b===null?[]:(b?b.split(":"):[]);const fill=b===null?0:8-A.length-B.length;if(fill<0)return null;const g=[...A,...Array(fill).fill("0"),...B];if(g.length!==8||g.some(x=>!/^[0-9a-f]{1,4}$/.test(x)))return null;return g.map(x=>x.padStart(4,"0")).join(":")};
  const shortest=a=>{let g=a.split(":").map(x=>x.replace(/^0+(?=.)/,""));let bs=-1,bl=0;for(let s=0;s<8;s++){let l=0;while(s+l<8&&g[s+l]==="0")l++;if(l>bl&&l>1){bl=l;bs=s}}if(bs<0)return g.join(":");return g.slice(0,bs).join(":")+"::"+g.slice(bs+bl).join(":")};
  el.innerHTML=`<div class="viz-title">Shorten the IPv6 address</div><p class="mono v6-full"></p>
  <label class="rf"><span>Your answer</span><input class="v6-in" autocomplete="off" spellcheck="false" placeholder="e.g. 2001:db8::1"></label>
  <div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="check">Check</button><button class="btn" data-a="skip">Next address</button><span class="grow"></span></div>`;
  function show(){$(".v6-full",el).textContent=Q[i];$(".v6-in",el).value="";$(".caption",el).innerHTML="Drop leading zeros in each group, then replace the longest run of all-zero groups with <code>::</code> (only once).";$(".grow",el).textContent=`${right} correct`}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="skip"){i=(i+1)%Q.length;show();return}
    const v=$(".v6-in",el).value,ex=expand(v);
    if(ex===Q[i]){const best=shortest(Q[i]),isBest=v.trim().toLowerCase()===best;right++;
      $(".caption",el).innerHTML=`<span class="status-good">Correct.</span> ${isBest?"That's the shortest form.":`Valid, but the shortest form is <code>${best}</code>.`}`;$(".grow",el).textContent=`${right} correct`;if(right>=3)award("viz:v6short",20,"Shortened three IPv6 addresses")}
    else $(".caption",el).innerHTML=ex?`<span class="status-bad">That expands to a different address.</span> Check which groups you dropped.`:`<span class="status-bad">That isn't a valid IPv6 address.</span> Remember: only one <code>::</code>, and at most four hex digits per group.`});
  el.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.matches(".v6-in"))$('[data-a="check"]',el).click()});
  show();
})();
sortViz($("#viz-v6type"),{title:"Which IPv6 address type?",bins:{gua:"Global unicast",ll:"Link-local",ula:"Unique local",mc:"Multicast"},
  items:[["2001:db8:acad:1::10","gua","2000::/3 (2001:db8::/32 is the documentation prefix)."],["fe80::2a1:aff:fe6f:2","ll","FE80::/10, built with EUI-64."],["fd12:3456:789a:1::1","ula","FD00::/8: private."],["ff02::1","mc","All nodes."],["ff02::2","mc","All routers."],["2600:1f18:4a3:6c00::5","gua","A public address from a cloud provider."],["fe80::1","ll","A manually set link-local, popular on routers."],["ff02::1:ff6f:2","mc","Solicited-node multicast for neighbor discovery."]],done:"Classified every IPv6 address"});

/* ---- EUI-64 step-through ---- */
(function(){
  const el=$("#viz-eui");let mac="00:1A:2B:3C:4D:5E",n=0;
  el.innerHTML=`<div class="viz-title">Build a modified EUI-64 interface ID</div><label class="rf"><span>MAC address</span><input class="eui-in mono" value="${mac}" autocomplete="off" spellcheck="false"></label><div class="eui-out mono"></div><div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button><span class="grow"></span></div>`;
  function draw(){const h=mac.replace(/[^0-9a-f]/gi,"").toUpperCase();if(h.length!==12){$(".caption",el).innerHTML='<span class="status-bad">Enter a 48-bit MAC address.</span>';return}
    const b=h.match(/../g),f=parseInt(b[0],16),ff=(f^2).toString(16).toUpperCase().padStart(2,"0"),bin=f.toString(2).padStart(8,"0"),bin2=(f^2).toString(2).padStart(8,"0");
    const S=[[`${b.slice(0,3).join("")} | ${b.slice(3).join("")}`,"Split the 48-bit MAC into two 24-bit halves."],
      [`${b.slice(0,3).join("")} <b class="t-ok">FFFE</b> ${b.slice(3).join("")}`,"Insert FFFE in the middle to make 64 bits."],
      [`first byte ${b[0]} = ${bin.slice(0,6)}<b class="t-bad">${bin[6]}</b>${bin[7]} → ${bin2.slice(0,6)}<b class="t-ok">${bin2[6]}</b>${bin2[7]} = ${ff}`,"Flip the 7th bit (the universal/local bit) of the first byte."],
      [`${(ff+b[1]).replace(/^0+(?=.)/,"")}:${b[2]}FF:FE${b[3]}:${b[4]}${b[5]}`.toUpperCase(),"Write it as four hex groups. That's the interface ID."],
      [`2001:DB8:ACAD:1:${(ff+b[1]).replace(/^0+(?=.)/,"")}:${b[2]}FF:FE${b[3]}:${(b[4]+b[5]).replace(/^0+(?=.)/,"")}`.toUpperCase(),"Add the /64 prefix 2001:db8:acad:1::/64. The link-local is the same ID after FE80::."]];
    $(".eui-out",el).innerHTML=n===0?h.match(/..../g).join("."):S[n-1][0];$(".caption",el).innerHTML=n===0?"This is the MAC in Cisco format. Press Next step.":S[n-1][1];
    $('[data-a="back"]',el).disabled=n===0;$('[data-a="next"]',el).disabled=n===S.length;$(".grow",el).textContent=`Step ${n} of ${S.length}`;if(n===S.length)award("viz:eui",20,"Built an EUI-64 address")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;n=a==="next"?Math.min(n+1,5):Math.max(0,n-1);draw()});
  $(".eui-in",el).addEventListener("input",e=>{mac=e.target.value;n=0;draw()});draw();
})();

/* ---- 2.4 GHz channel planner ---- */
(function(){
  const el=$("#viz-chan");const ch=[1,3,6];
  el.innerHTML=`<div class="viz-title">Channel planner: three APs, one 2.4 GHz band</div><div class="viz-scroll"><svg viewBox="0 0 600 180" style="min-width:440px" role="img" aria-label="2.4 GHz spectrum"></svg></div><div class="ch-ctl"></div><div class="caption" aria-live="polite"></div>`;
  const col=["var(--accent)","var(--gold)","var(--blue)"];
  function draw(){const X=c=>40+(c-1)*48;let s=`<line x1="20" y1="150" x2="590" y2="150" class="m-link"/>`;
    for(let c=1;c<=11;c++)s+=`<text x="${X(c)}" y="170" text-anchor="middle" class="s-small">${c}</text>`;
    ch.forEach((c,i)=>{s+=`<path d="M${X(c)-48} 150 Q ${X(c)} ${40+i*12} ${X(c)+48} 150" fill="${col[i]}" fill-opacity=".18" stroke="${col[i]}" stroke-width="2"/><text x="${X(c)}" y="${60+i*12}" text-anchor="middle" class="s-b" style="font-size:12px;fill:${col[i]}">AP${i+1}</text>`});
    $("svg",el).innerHTML=s;
    $(".ch-ctl",el).innerHTML=ch.map((c,i)=>`<label class="rng-row"><span>AP${i+1} channel</span><input type="range" min="1" max="11" value="${c}" data-i="${i}" aria-label="AP${i+1} channel"><b>${c}</b></label>`).join("");
    const pairs=[[0,1],[0,2],[1,2]];const bad=pairs.filter(([a,b])=>Math.abs(ch[a]-ch[b])<5&&ch[a]!==ch[b]);const same=pairs.filter(([a,b])=>ch[a]===ch[b]);
    $(".caption",el).innerHTML=bad.length?`<span class="status-bad">Adjacent-channel interference</span> between ${bad.map(([a,b])=>`AP${a+1} and AP${b+1}`).join(", ")}. Their channels are less than 5 apart, so the signals overlap and corrupt each other.`:same.length?`<span class="status-bad">Co-channel interference</span>: ${same.map(([a,b])=>`AP${a+1} and AP${b+1}`).join(", ")} share a channel and must take turns. It works, but throughput drops.`:`<span class="status-good">Clean plan.</span> Every AP is 5 or more channels from the others, the 1/6/11 pattern.`;
    if(!bad.length&&!same.length)award("viz:chan",20,"Planned non-overlapping channels")}
  el.addEventListener("input",e=>{const i=e.target.dataset.i;if(i===undefined)return;ch[+i]=+e.target.value;draw()});draw();
})();

/* ---- RF calculator ---- */
(function(){
  const el=$("#viz-rf");const V={tx:17,walls:2,dist:15,noise:-92};const seen=new Set();
  const R=[["tx","AP transmit power (dBm)",5,23,1],["dist","Distance (m)",1,60,1],["walls","Walls in the way",0,6,1],["noise","Noise floor (dBm)",-100,-75,1]];
  el.innerHTML=`<div class="viz-title">RF link budget: will the call stay up?</div>${R.map(r=>`<div class="rng-row"><span>${r[1]}</span><input type="range" data-k="${r[0]}" min="${r[2]}" max="${r[3]}" step="${r[4]}" value="${V[r[0]]}" aria-label="${r[1]}"><b data-o="${r[0]}"></b></div>`).join("")}<div class="kv"></div><div class="meter"><i></i></div><div class="caption" aria-live="polite"></div>`;
  function draw(){R.forEach(r=>$(`[data-o="${r[0]}"]`,el).textContent=V[r[0]]);
    const fspl=Math.round(40+20*Math.log10(Math.max(1,V.dist)));const rssi=V.tx+4-fspl-V.walls*5;const snr=rssi-V.noise;
    $(".kv",el).innerHTML=`<span>Path loss (2.4 GHz)</span><b class="mono">−${fspl} dB</b><span>Wall loss</span><b class="mono">−${V.walls*5} dB</b><span>RSSI at the client</span><b class="mono">${rssi} dBm</b><span>SNR</span><b class="mono">${snr} dB</b>`;
    const q=rssi>=-67&&snr>=25?"g":rssi>=-75&&snr>=15?"m":"b";$(".meter i",el).style.width=Math.max(4,Math.min(100,(rssi+95)*1.6))+"%";$(".meter",el).className="meter "+q;
    $(".caption",el).innerHTML=q==="g"?`<span class="status-good">Good for voice.</span> RSSI of −67 dBm or better with 25 dB or more of SNR.`:q==="m"?`<span class="status-bad">Fine for email, choppy for calls.</span> Move closer, remove obstacles, or add an AP.`:`<span class="status-bad">Unusable.</span> Expect retries, low data rates and drops. Every wall costs a few dB, and noise eats SNR directly.`;
    seen.add(q);if(seen.has("g")&&seen.has("b"))award("viz:rf",20,"Explored a wireless link budget")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;V[k]=+e.target.value;draw()});draw();
})();
sortViz($("#viz-wsec"),{title:"Rate the wireless security",bins:{w3e:"WPA3-Enterprise",w3p:"WPA3-Personal",open:"Open / OWE",bad:"Don't use"},
  items:[["Each employee signs in with directory credentials through RADIUS","w3e","802.1X with a RADIUS server."],["A coffee shop's passphrase printed on the menu, with SAE","w3p","Shared passphrase, but SAE resists offline guessing."],["WEP with a 128-bit key","bad","WEP can be cracked in minutes."],["WPA with TKIP","bad","Deprecated and weak."],["A guest network with no password that still encrypts each client","open","OWE (Enhanced Open)."],["192-bit mode for a government agency","w3e","WPA3-Enterprise's CNSA suite option."],["Home network on a new Wi-Fi 6E router, passphrase only","w3p","6 GHz requires WPA3."]],done:"Rated every wireless security option"});

/* ---- client OS command lab ---- */
(function(){
  const el=$("#viz-hostcli");
  const OS={win:["Windows","C:\\> ",{"ipconfig /all":`Wireless LAN adapter Wi-Fi:
   Physical Address. . . . . . . . . : 3C-52-82-1A-77-4B
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 10.10.20.57(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Monday, November 9, 2026 8:02:11 AM
   Default Gateway . . . . . . . . . : 10.10.20.1
   DHCP Server . . . . . . . . . . . : 10.10.0.5
   DNS Servers . . . . . . . . . . . : 10.10.0.53`,"netsh wlan show interfaces":`    Name                   : Wi-Fi
    State                  : connected
    SSID                   : CORP
    Radio type             : 802.11ax
    Authentication         : WPA3-Enterprise
    Channel                : 44
    Signal                 : 86%
    Receive rate (Mbps)    : 573.5`,"tracert -d 8.8.8.8":`Tracing route to 8.8.8.8 over a maximum of 30 hops
  1    <1 ms    <1 ms    <1 ms  10.10.20.1
  2     2 ms     1 ms     2 ms  10.255.0.1
  3    11 ms     9 ms    10 ms  203.0.113.1
  4    14 ms    13 ms    14 ms  8.8.8.8
Trace complete.`}],
   mac:["macOS","% ",{"networksetup -getinfo Wi-Fi":`DHCP Configuration
IP address: 10.10.20.88
Subnet mask: 255.255.255.0
Router: 10.10.20.1
Client ID:
IPv6: Automatic
IPv6 IP address: 2001:db8:20::1c4f:8a2e:91b0:7d11
IPv6 Router: fe80::1`,"netstat -rn -f inet | head -4":`Routing tables

Internet:
Destination        Gateway            Flags        Netif
default            10.10.20.1         UGScg          en0`,"scutil --dns | grep nameserver":`  nameserver[0] : 10.10.0.53
  nameserver[1] : 10.10.0.54`}],
   lin:["Linux","$ ",{"ip -br addr":`lo               UNKNOWN        127.0.0.1/8 ::1/128
ens192           UP             10.10.30.15/24 fe80::250:56ff:fea2:1b3/64`,"ip route":`default via 10.10.30.1 dev ens192 proto dhcp metric 100
10.10.30.0/24 dev ens192 proto kernel scope link src 10.10.30.15`,"resolvectl status ens192 | grep 'DNS Servers'":`         DNS Servers: 10.10.0.53 10.10.0.54`,"ip neigh":`10.10.30.1 dev ens192 lladdr 00:a1:0a:6f:00:16 REACHABLE`}]};
  const run=new Set();let os="win";const total=Object.values(OS).reduce((a,o)=>a+Object.keys(o[2]).length,0);
  el.innerHTML=`<div class="viz-title">Client command lab: check a host on three operating systems</div><div class="chips os-t">${Object.entries(OS).map(([k,o])=>`<button class="chip" data-os="${k}">${o[0]}</button>`).join("")}</div><div class="chips cmds"></div><pre class="term cli-o" aria-live="polite"><span class="t-n">Pick a command to run it.</span></pre><div class="rv-prog s-small"></div>`;
  function tabs(){el.querySelectorAll("[data-os]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.os===os));$(".cmds",el).innerHTML=Object.keys(OS[os][2]).map(c=>`<button class="chip mono ${run.has(os+c)?"seen":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");$(".rv-prog",el).textContent=`${run.size} of ${total} commands run`}
  el.addEventListener("click",e=>{const o=e.target.closest("[data-os]"),b=e.target.closest("[data-c]");if(o){os=o.dataset.os;tabs();return}if(!b)return;const c=b.dataset.c;run.add(os+c);
    $(".cli-o",el).innerHTML=`<span class="t-c">${esc(OS[os][1]+c)}</span>\n${esc(OS[os][2][c])}`;tabs();if(run.size===total)award("viz:hostcli",30,"Checked a host on every OS")});tabs();
})();
quizViz($("#viz-hostfix"),{title:"What's wrong with this client?",done:"Diagnosed every client",qs:[
  ["ipconfig shows IPv4 169.254.18.40, mask 255.255.0.0, no gateway.",["The client never reached a DHCP server","DNS is down","The gateway is wrong","Duplex mismatch"],0,"APIPA means no DHCP offer arrived. Check the VLAN, the cable or Wi-Fi, and the helper address."],
  ["IP 10.10.20.57/24, gateway 10.10.21.1. The user can reach local printers but nothing else.",["The gateway is outside the host's subnet","DNS is wrong","The mask is too long","DHCP is down"],0,"The host can only ARP for addresses in 10.10.20.0/24."],
  ["ping 10.10.0.53 works, ping intranet.corp.local says 'could not find host'.",["DNS resolution","Routing","The default gateway","Layer 1"],0,"Reachability by IP is fine, so look at DNS servers and records."],
  ["A Linux server's ip route shows no 'default via' line.",["It has no default gateway","Its DNS is wrong","IPv6 is disabled","The NIC is down"],0,"Without a default route, it can only reach directly connected networks."],
  ["A laptop shows 'Authentication: WPA2-Personal' on the CORP SSID, which is supposed to be WPA3-Enterprise.",["It joined a rogue or misconfigured SSID","DHCP failed","The channel is too wide","The MTU is wrong"],0,"A legitimate CORP network would demand 802.1X. Something is impersonating it, or the profile is wrong."]]});

seqViz($("#viz-dora"),{title:"DHCP: Discover, Offer, Request, Acknowledge",left:"Client",right:"DHCP server",intro:"A new laptop has no address. Press Next step.",steps:[
  {dir:"r",label:"DHCPDISCOVER",sub:"0.0.0.0:68 → 255.255.255.255:67 · broadcast",text:"The client broadcasts a Discover. It has no address yet, so the source is 0.0.0.0."},
  {dir:"l",label:"DHCPOFFER",sub:"offers 192.168.10.11/24, gw .1, DNS, lease",text:"The server offers an address that's free and not excluded, plus options such as the default router and DNS servers."},
  {dir:"r",label:"DHCPREQUEST",sub:"broadcast: 'I'll take .11 from this server'",text:"The client requests the offered address. It's broadcast so any other servers that made offers know they weren't chosen."},
  {dir:"l",label:"DHCPACK",sub:"lease confirmed for 1 day",text:"The server confirms. The client checks the address isn't in use, then configures it. At 50% of the lease it tries to renew directly with the server."}],
  end:"Remember the order with DORA, and the ports: client 68, server 67."});
stepViz($("#viz-relay"),{title:"DHCP relay across a router",done:"Followed a relayed DHCP request",steps:[
  ["Client broadcasts","PC2 in 192.168.20.0/24 sends a Discover to 255.255.255.255. Routers don't forward broadcasts."],
  ["Relay receives","R2's G0/0/1 has ip helper-address 10.0.12.1, so R2 picks up the broadcast."],
  ["Unicast to server","R2 forwards it as a unicast to 10.0.12.1 and sets giaddr = 192.168.20.1, its own address on the client subnet."],
  ["Server picks the pool","R1 finds the pool whose network contains 192.168.20.1 and makes an offer from it."],
  ["Reply via relay","R1 sends the Offer back to 192.168.20.1. R1 needs a route to that subnet, or the reply is dropped."],
  ["Client configured","R2 relays the Offer onto the LAN, and the client finishes the DORA exchange the same way."]],
  end:"Helper address on the client-facing interface. A pool that matches the giaddr. A route back. Those three fix most relay problems."});
iosViz($("#viz-dhcpcli"),{title:"Mini lab: make R1 a DHCP server",scenario:"PC1 is plugged into SW1 and set to DHCP. R1's G0/0/1 is already 192.168.10.1/24. You're at the privileged prompt.",
  devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"PC1",dhcp:true,at:"SW1:g1/0/2"}],
  boot:{R1:["interface g0/0/1","ip address 192.168.10.1 255.255.255.0","no shutdown"]},consoles:["R1"],startMode:"priv",
  topo:{R1:[110,70],SW1:[300,70],PC1:[490,70]},topoH:130,
  tasks:[{t:"Exclude 192.168.10.1 through 192.168.10.10 from the pool",hint:"ip dhcp excluded-address 192.168.10.1 192.168.10.10",check:(w,D)=>D.R1.excl.some(([a,b])=>a===IOS.ip4("192.168.10.1")&&b===IOS.ip4("192.168.10.10"))},
    {t:"Create pool LAN10 for 192.168.10.0/24 with default router 192.168.10.1",hint:"ip dhcp pool LAN10\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1",check:(w,D)=>{const p=D.R1.pools.LAN10;return p&&p.net===IOS.ip4("192.168.10.0")&&p.len===24&&p.gw===IOS.ip4("192.168.10.1")}},
    {t:"Give clients DNS server 8.8.8.8",hint:"dns-server 8.8.8.8",check:(w,D)=>D.R1.pools.LAN10?.dns.includes(IOS.ip4("8.8.8.8"))},
    {t:"Confirm PC1's lease with show ip dhcp binding",hint:"do show ip dhcp binding",check:(w,D,S)=>IOS.dhcpFor(w,w.hosts[0]).ip===IOS.ip4("192.168.10.11")&&S.R1.hist.some(h=>/sh\S* ip dhcp b/i.test(h))}],
  solution:"configure terminal\nip dhcp excluded-address 192.168.10.1 192.168.10.10\nip dhcp pool LAN10\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 8.8.8.8\n do show ip dhcp binding",
  success:"PC1 got 192.168.10.11, the first address after the exclusions."},"dhcpcli",40,"Built an IOS DHCP server");
  },
  sims:[
    {id:"addrlab",type:"ios",title:"Address and bring up a router",lab:{
      scenario:"HQ-R1 is fresh out of the box. Address its WAN link to R2 and its LAN, add IPv6, and prove the WAN works. R2 is already configured with 10.0.12.2/30 and 2001:db8:12::2/64.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"PC1",ip:"192.168.1.10",gw:"192.168.1.1",at:"SW1:g1/0/2"}],
      boot:{R2:["hostname R2","ipv6 unicast-routing","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","ipv6 address 2001:db8:12::2/64","no shutdown"]},
      consoles:["R1"],topo:{R2:[90,70],R1:[300,70],SW1:[470,70],PC1:[470,175]},topoH:220,
      onCmd:(l,x,w)=>{const seen=new Map();for(const d of Object.values(w.devs))for(const i of Object.values(d.ifs))if(i.ip!=null){const k=String(i.ip);if(seen.has(k)&&seen.get(k)!==d.name)flag("dupip");seen.set(k,d.name)}},
      tasks:[
        {t:"Name the router HQ-R1",hint:"enable\nconfigure terminal\nhostname HQ-R1",check:(w,D)=>D.R1.host==="HQ-R1"},
        {t:"Give G0/0/0 the address 10.0.12.1/30 and bring it up",hint:"interface g0/0/0\n ip address 10.0.12.1 255.255.255.252\n no shutdown",check:(w,D)=>{const i=D.R1.ifs["GigabitEthernet0/0/0"];return i.ip===IOS.ip4("10.0.12.1")&&i.len===30&&!i.shut}},
        {t:"Give G0/0/1 the address 192.168.1.1/24, the description LAN, and bring it up",hint:"interface g0/0/1\n description LAN\n ip address 192.168.1.1 255.255.255.0\n no shutdown",check:(w,D)=>{const i=D.R1.ifs["GigabitEthernet0/0/1"];return i.ip===IOS.ip4("192.168.1.1")&&i.len===24&&!i.shut&&/^lan$/i.test(i.desc)}},
        {t:"Enable IPv6 routing, give G0/0/0 2001:db8:12::1/64, and give G0/0/1 an EUI-64 address in 2001:db8:1::/64",hint:"ipv6 unicast-routing\ninterface g0/0/0\n ipv6 address 2001:db8:12::1/64\ninterface g0/0/1\n ipv6 address 2001:db8:1::/64 eui-64",check:(w,D)=>{const a=D.R1.ifs["GigabitEthernet0/0/0"],b=D.R1.ifs["GigabitEthernet0/0/1"];return D.R1.v6Routing&&a.v6.some(x=>x.n===IOS.ip6("2001:db8:12::1")&&x.len===64)&&b.v6.some(x=>x.eui&&x.len===64&&x.n===IOS.ip6("2001:db8:1::"))}},
        {t:"Ping R2 at 10.0.12.2 and at 2001:db8:12::2",hint:"do ping 10.0.12.2\ndo ping 2001:db8:12::2",sticky:true,check:(w,D,S)=>{const h=S.R1.hist.join("\n");return IOS.ping(w,{dev:D.R1},IOS.ip4("10.0.12.2"),4).ok&&IOS.ping(w,{dev:D.R1},IOS.ip6("2001:db8:12::2"),6).ok&&/ping 10\.0\.12\.2/.test(h)&&/ping (ipv6 )?2001:db8:12::2/i.test(h)}},
        {t:"Save the configuration",hint:"end\ncopy running-config startup-config",check:(w,D)=>!!D.R1.saved&&D.R1.saved.includes("hostname HQ-R1")}],
      solution:"enable\nconfigure terminal\nhostname HQ-R1\nipv6 unicast-routing\ninterface g0/0/0\n ip address 10.0.12.1 255.255.255.252\n ipv6 address 2001:db8:12::1/64\n no shutdown\ninterface g0/0/1\n description LAN\n ip address 192.168.1.1 255.255.255.0\n ipv6 address 2001:db8:1::/64 eui-64\n no shutdown\nend\nping 10.0.12.2\nping 2001:db8:12::2\ncopy running-config startup-config",
      success:"The router is addressed, both links are up and the configuration survives a reload."}},
    {id:"dhcplab",type:"ios",title:"DHCP server and relay across the WAN",lab:{
      scenario:"R1 at HQ will hand out addresses to the branch LAN behind R2. Routing between the sites already works. Configure the pool on R1 and the relay on R2, then confirm PC2 has a lease. Switch consoles with the buttons above the terminal.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"},{name:"SW2",kind:"switch"}],links:[["R1:g0/0/0","R2:g0/0/0"],["R2:g0/0/1","SW2:g1/0/1"]],hosts:[{name:"PC2",dhcp:true,at:"SW2:g1/0/2"},{name:"PC3",dhcp:true,at:"SW2:g1/0/3"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.0.12.1 255.255.255.252","no shutdown","ip route 192.168.20.0 255.255.255.0 10.0.12.2"],R2:["hostname R2","interface g0/0/0","ip address 10.0.12.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.168.20.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 10.0.12.1"]},
      consoles:["R1","R2"],topo:{R1:[80,70],R2:[260,70],SW2:[430,70],PC2:[540,30],PC3:[540,140]},topoH:200,
      tasks:[
        {t:"On R1, exclude 192.168.20.1 to 192.168.20.20",hint:"ip dhcp excluded-address 192.168.20.1 192.168.20.20",check:(w,D)=>D.R1.excl.some(([a,b])=>a===IOS.ip4("192.168.20.1")&&b===IOS.ip4("192.168.20.20"))},
        {t:"On R1, create pool BRANCH for 192.168.20.0/24 with gateway 192.168.20.1 and DNS 10.0.0.53",hint:"ip dhcp pool BRANCH\n network 192.168.20.0 255.255.255.0\n default-router 192.168.20.1\n dns-server 10.0.0.53",check:(w,D)=>{const p=D.R1.pools.BRANCH;return p&&p.net===IOS.ip4("192.168.20.0")&&p.len===24&&p.gw===IOS.ip4("192.168.20.1")&&p.dns.includes(IOS.ip4("10.0.0.53"))}},
        {t:"On R2, relay DHCP from the LAN interface to R1",hint:"interface g0/0/1\n ip helper-address 10.0.12.1",check:(w,D)=>D.R2.ifs["GigabitEthernet0/0/1"].helper.includes(IOS.ip4("10.0.12.1"))},
        {t:"Confirm both PCs have leases (check show ip dhcp binding on R1)",hint:"show ip dhcp binding",check:(w,D,S)=>IOS.dhcpFor(w,w.hosts[0]).ip===IOS.ip4("192.168.20.21")&&IOS.dhcpFor(w,w.hosts[1]).ip!=null&&S.R1.hist.some(h=>/sh\S* ip dhcp b/i.test(h))}],
      solution:"! On R1\nenable\nconfigure terminal\nip dhcp excluded-address 192.168.20.1 192.168.20.20\nip dhcp pool BRANCH\n network 192.168.20.0 255.255.255.0\n default-router 192.168.20.1\n dns-server 10.0.0.53\n! On R2\nenable\nconfigure terminal\ninterface g0/0/1\n ip helper-address 10.0.12.1\n! On R1\nend\nshow ip dhcp binding",
      success:"PC2 got 192.168.20.21 through the relay. The giaddr 192.168.20.1 told R1 which pool to use."}},
    {id:"cabling",type:"match",title:"Cable the new branch",
      scenario:"Match each connection to the cable or optic it needs.",
      items:[["Cat 6 UTP patch cable","desk"],["1000BASE-LX SFP on single-mode fiber","bldg"],["10GBASE-SR SFP+ on OM4 multimode","riser"],["SFP+ twinax DAC, 1 m","rack"],["Cat 6a UTP to a PoE port","ap"],["Console cable (RJ45 to USB)","con"]],
      slots:[["desk","Desk","PC to wall jack to access switch, 45 m"],["bldg","Campus","Warehouse building 4 km away, 1 Gbps"],["riser","Riser","Access switch to distribution, 180 m up the riser, 10 Gbps"],["rack","Rack","Core switch to server in the same rack"],["ap","Ceiling","Wi-Fi 6E AP, 70 m, needs power"],["con","Bench","Initial setup of a new router with no IP yet"]],
      success:"Copper where it's short and needs power, multimode inside the building, single-mode across campus."},
    {id:"v6sim",title:"Plan the IPv6 rollout",type:"choice",
      scenario:"Your company received 2001:db8:acad::/48 and is rolling out IPv6.",
      steps:[
        ["What prefix length should each user VLAN get?",["/64","/56","/127","/96"],0,"Every LAN gets a /64 so SLAAC works."],
        ["How many /64 subnets does a /48 contain?",["65,536","256","4,096","1,024"],0,"64 − 48 = 16 bits of subnet ID: 2^16 = 65,536."],
        ["Which prefix is a good choice for the router-to-router link?",["2001:db8:acad:ffff::/127","fe80::/10","ff02::/16","2001:db8:acad::/48"],0,"/127 on point-to-point links prevents neighbor cache exhaustion."],
        ["Hosts get addresses from the router's RA but need DNS servers from a server. What's that called?",["Stateless DHCPv6","Stateful DHCPv6","EUI-64","APIPA"],0,"SLAAC for the address, DHCPv6 only for options."],
        ["Which command must be on each router for it to forward IPv6 and send RAs?",["ipv6 unicast-routing","ipv6 enable","ip routing","ipv6 nd ra"],0,"IPv6 routing is off by default."],
        ["A host shows only fe80::21a:2bff:fe3c:4d5e and no global address. What does that suggest?",["It isn't receiving Router Advertisements","DNS failed","The MAC is duplicated","IPv6 is fully working"],0,"Every interface has a link-local address. No global address means no RA (or no DHCPv6)."]],
      success:"A clean IPv6 plan: /48 for the site, /64 per VLAN, /127 on links."},
    {id:"wifisim",title:"Troubleshoot the warehouse Wi-Fi",type:"choice",
      scenario:"Handheld scanners in the warehouse keep dropping off Wi-Fi. They support 2.4 and 5 GHz.",
      steps:[
        ["A survey shows three nearby APs on 2.4 GHz channels 1, 3 and 6. What's the first fix?",["Move them to 1, 6 and 11","Turn power to maximum","Disable 5 GHz","Use WEP for compatibility"],0,"Channels 1 and 3 overlap, and so do 3 and 6."],
        ["Scanners in aisle 9 show RSSI −81 dBm and the noise floor is −90 dBm. What's the SNR?",["9 dB","171 dB","−9 dB","81 dB"],0,"−81 − (−90) = 9 dB. That's far too low."],
        ["The aisles are lined with metal racks. What RF behavior is hurting coverage?",["Reflection and multipath","Refraction through glass","Free space only","DFS"],0,"Metal reflects RF. Mount APs to give line of sight down each aisle."],
        ["To give each scanner its own identity and revoke stolen ones, which security should you use?",["WPA3-Enterprise with 802.1X","WPA2-Personal","Open with MAC filtering","WEP"],0,"Per-device credentials through RADIUS can be revoked individually."],
        ["Drops spike at lunch near the break room. What's likely?",["Microwave interference on 2.4 GHz","Radar on 5 GHz","A DHCP problem","A duplex mismatch"],0,"Microwave ovens leak energy around 2.45 GHz. Move the scanners to 5 GHz."]],
      success:"Clean channels, enough signal, per-device security and less interference."}
  ],
  badges:[
    ["reader","L1","Layer 1 Scholar","Mark all 7 infrastructure lessons studied",c=>c.allStudied()],
    ["lab","IC","Infrastructure Crew","Complete all 19 diagrams in this module",c=>c.vizAll()],
    ["det","ID","Interface Detective","Diagnose every fault in the interface detective",c=>c.earned("viz:counters")],
    ["drill","/S","Subnet Sprinter","Finish the subnetting drill",c=>c.earned("viz:subdrill")],
    ["vlsm","VL","Address Architect","Build a clean VLSM plan",c=>c.earned("viz:vlsm")],
    ["addr","UP","Interfaces Up","Pass the router addressing lab",c=>c.passed("addrlab")],
    ["relay","HA","Helper Address","Pass the DHCP relay lab",c=>c.passed("dhcplab")],
    ["perfect","AP","Access Point Perfect","Score 100% on an infrastructure quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
