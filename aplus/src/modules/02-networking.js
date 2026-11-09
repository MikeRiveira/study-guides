/* ================= Module 2: Networking (Core 1, 220-1201) ================= */
(function(){
const PORTS=[
 ["20/21","TCP","FTP","File transfer. 20 carries data, 21 carries commands. Unencrypted."],
 ["22","TCP","SSH","Encrypted remote command line. Also carries SFTP and SCP."],
 ["23","TCP","Telnet","Unencrypted remote command line. Replaced by SSH."],
 ["25","TCP","SMTP","Sends email between mail servers."],
 ["53","TCP/UDP","DNS","Resolves names to IP addresses. UDP for queries, TCP for zone transfers."],
 ["67/68","UDP","DHCP","Hands out IP settings. Server listens on 67, client on 68."],
 ["80","TCP","HTTP","Unencrypted web traffic."],
 ["110","TCP","POP3","Downloads email to one device, usually removing it from the server."],
 ["137–139","TCP/UDP","NetBIOS","Legacy Windows name and session services."],
 ["143","TCP","IMAP","Syncs email across devices, keeping it on the server."],
 ["161/162","UDP","SNMP","Monitors network devices. 162 receives traps (alerts)."],
 ["389","TCP","LDAP","Queries directories such as Active Directory."],
 ["443","TCP","HTTPS","Web traffic encrypted with TLS."],
 ["445","TCP","SMB/CIFS","Windows file and printer sharing."],
 ["3389","TCP","RDP","Remote Desktop to a Windows computer's graphical desktop."]
];
const portRows=PORTS.map(p=>`<tr><td class="port">${p[0]}</td><td><b>${p[2]}</b></td><td><span class="tag">${p[1]}</span></td><td>${p[3]}</td></tr>`).join("");

const LESSONS=[
{id:"ports",num:"2.1",title:"TCP and UDP ports and protocols",html:`
<p><b>TCP</b> is connection-oriented: it sets up a session with a three-way handshake (SYN, SYN-ACK, ACK), numbers every segment and resends anything lost. <b>UDP</b> is connectionless: it just sends, with no guarantee of delivery, which makes it faster for things like DNS lookups, streaming and VoIP.</p>
<div class="viz" id="viz-tcp"></div>
<p>A port number tells the receiving computer which service should get the traffic. Expect several exam questions that name a port and ask for the protocol, or the reverse.</p>
<div class="scroll"><table><thead><tr><th>Port</th><th>Protocol</th><th>Uses</th><th>What it does</th></tr></thead><tbody>${portRows}</tbody></table></div>
<div class="tip"><b>Memory trick.</b> Secure versions sit higher: HTTP 80 becomes HTTPS 443, Telnet 23 is replaced by SSH 22, and RDP 3389 is the only common port above 1023 you need here.</div>`},
{id:"wireless",num:"2.2",title:"Wireless networking technologies",html:`
<p>Wi-Fi standards come from IEEE 802.11. Newer generations add speed, bands and better handling of crowded networks.</p>
<div class="scroll"><table><thead><tr><th>Standard</th><th>Name</th><th>Bands</th><th>Notes</th></tr></thead><tbody>
<tr><td class="port">802.11a</td><td>—</td><td>5 GHz</td><td>Up to 54 Mbps</td></tr>
<tr><td class="port">802.11b</td><td>—</td><td>2.4 GHz</td><td>Up to 11 Mbps</td></tr>
<tr><td class="port">802.11g</td><td>—</td><td>2.4 GHz</td><td>Up to 54 Mbps</td></tr>
<tr><td class="port">802.11n</td><td>Wi-Fi 4</td><td>2.4 / 5 GHz</td><td>Introduced MIMO (multiple antennas)</td></tr>
<tr><td class="port">802.11ac</td><td>Wi-Fi 5</td><td>5 GHz</td><td>MU-MIMO for downloads, wider channels</td></tr>
<tr><td class="port">802.11ax</td><td>Wi-Fi 6 / 6E</td><td>2.4 / 5 GHz (6E adds 6 GHz)</td><td>OFDMA, better in crowded spaces</td></tr>
<tr><td class="port">802.11be</td><td>Wi-Fi 7</td><td>2.4 / 5 / 6 GHz</td><td>Multi-link operation, 320 MHz channels</td></tr>
</tbody></table></div>
<h3>Bands and channels</h3>
<ul><li><b>2.4 GHz</b> reaches farther and passes through walls better, but is crowded. Only channels <b>1, 6 and 11</b> don't overlap (in the US).</li>
<li><b>5 GHz and 6 GHz</b> are faster with many more channels, but have shorter range.</li></ul>
<div class="viz" id="viz-chan"></div>
<h3>Short-range wireless</h3>
<ul><li><b>Bluetooth</b>: personal area network for headsets, keyboards and phones. Devices pair first.</li>
<li><b>NFC</b>: a few centimeters. Tap-to-pay and quick pairing.</li>
<li><b>RFID</b>: tags read by a scanner, used for badges and inventory.</li></ul>`},
{id:"services",num:"2.3",title:"Services hosted on a network",html:`
<p>Servers and appliances provide services to clients. Know what each one is for.</p>
<ul>
<li><b>DNS server</b>: turns names like comptia.org into IP addresses.</li>
<li><b>DHCP server</b>: automatically assigns IP address, subnet mask, gateway and DNS server.</li>
<li><b>File share and print servers</b>: central storage and shared printers.</li>
<li><b>Mail server</b>: sends and stores email (SMTP, IMAP, POP3).</li>
<li><b>Syslog server</b>: collects logs from many devices in one place.</li>
<li><b>Web server</b>: hosts websites over HTTP and HTTPS.</li>
<li><b>AAA (authentication, authorization, accounting)</b>: confirms who you are, what you may do, and records what you did. RADIUS and TACACS+ are common.</li>
<li><b>Proxy server</b>: makes requests on behalf of clients, which allows caching and content filtering.</li>
<li><b>Load balancer</b>: spreads traffic across several servers.</li>
<li><b>Spam gateway</b> and <b>UTM (unified threat management)</b>: filter email, or combine firewall, antivirus and intrusion prevention in one box.</li>
<li><b>Legacy and embedded systems</b> (such as SCADA controlling industrial equipment) and <b>IoT devices</b> (cameras, thermostats) often can't be patched easily, so they are isolated on their own network segment.</li>
</ul>`},
{id:"dnsdhcp",num:"2.4",title:"DNS records and DHCP concepts",html:`
<h3>Common DNS records</h3>
<div class="scroll"><table><thead><tr><th>Record</th><th>Purpose</th></tr></thead><tbody>
<tr><td class="port">A</td><td>Name to IPv4 address</td></tr>
<tr><td class="port">AAAA</td><td>Name to IPv6 address</td></tr>
<tr><td class="port">CNAME</td><td>An alias that points one name at another name</td></tr>
<tr><td class="port">MX</td><td>Which server receives email for the domain</td></tr>
<tr><td class="port">TXT</td><td>Free text, used for email security: SPF (allowed senders), DKIM (signing key) and DMARC (what to do with failures)</td></tr>
</tbody></table></div>
<h3>How DHCP works: DORA</h3>
<ol><li><b>Discover</b>: the client broadcasts, looking for a DHCP server.</li>
<li><b>Offer</b>: a server offers an address.</li>
<li><b>Request</b>: the client asks to use that address.</li>
<li><b>Acknowledge</b>: the server confirms, and the lease begins.</li></ol>
<div class="viz" id="viz-dora"></div>
<h3>DHCP terms</h3>
<ul><li><b>Scope</b>: the range of addresses the server can hand out.</li>
<li><b>Lease</b>: how long a client may keep its address before renewing.</li>
<li><b>Reservation</b>: always give the same address to a specific MAC address (good for printers).</li>
<li><b>Exclusion</b>: addresses inside the scope that are never handed out, often kept for static devices.</li></ul>
<div class="tip"><b>Exam favorite.</b> A computer with a 169.254.x.x address could not reach a DHCP server and gave itself an APIPA address. Check the cable, the Wi-Fi connection, or the DHCP server.</div>
<h3>VLANs and VPNs</h3>
<p>A <b>VLAN</b> splits one physical switch into separate logical networks, for example keeping guest or IoT traffic apart from office PCs. A <b>VPN</b> creates an encrypted tunnel across the internet so a remote user can reach the office network safely.</p>`},
{id:"hardware",num:"2.5",title:"Networking hardware",html:`
<div class="viz" id="viz-map"></div>
<ul>
<li><b>Router</b>: connects different networks and forwards traffic between them using IP addresses. Your home router links your LAN to the internet.</li>
<li><b>Switch</b>: connects devices inside one network and forwards frames using MAC addresses. <b>Unmanaged</b> switches are plug-and-play. <b>Managed</b> switches can be configured with VLANs, port settings and monitoring.</li>
<li><b>Access point</b>: lets wireless devices join a wired network.</li>
<li><b>Patch panel</b>: a panel of ports where wall cabling terminates, so connections can be changed with short patch cables.</li>
<li><b>Firewall</b>: allows or blocks traffic based on rules.</li>
<li><b>Cable modem, DSL modem and ONT</b>: the box that connects to your provider's cable, phone line or fiber (ONT is for fiber).</li>
<li><b>NIC</b>: network interface card, the port in the computer itself.</li>
<li><b>SDN (software-defined networking)</b>: network devices controlled centrally by software instead of one at a time.</li>
</ul>
<h3>Power over Ethernet</h3>
<p>PoE sends power over the network cable to devices like phones, cameras and access points. A <b>PoE switch</b> provides it on its ports, and a <b>PoE injector</b> adds it to a single cable.</p>
<div class="scroll"><table><thead><tr><th>Standard</th><th>Name</th><th>Max power per port</th></tr></thead><tbody>
<tr><td class="port">802.3af</td><td>PoE</td><td>15.4 W</td></tr>
<tr><td class="port">802.3at</td><td>PoE+</td><td>30 W</td></tr>
<tr><td class="port">802.3bt</td><td>PoE++</td><td>60 W (Type 3) or 100 W (Type 4)</td></tr>
</tbody></table></div>`},
{id:"soho",num:"2.6",title:"Configuring a small office or home network",html:`
<p>Every device needs four settings to talk on the network and reach the internet: an <b>IP address</b>, a <b>subnet mask</b>, a <b>default gateway</b> (the router) and a <b>DNS server</b>. They can be set by hand (static) or received from DHCP (dynamic).</p>
<h3>Private IPv4 ranges</h3>
<p>These addresses are used inside networks and are not routed on the internet. The router uses NAT to share one public address.</p>
<div class="scroll"><table><thead><tr><th>Range</th><th>CIDR</th></tr></thead><tbody>
<tr><td class="port">10.0.0.0 – 10.255.255.255</td><td class="mono">10.0.0.0/8</td></tr>
<tr><td class="port">172.16.0.0 – 172.31.255.255</td><td class="mono">172.16.0.0/12</td></tr>
<tr><td class="port">192.168.0.0 – 192.168.255.255</td><td class="mono">192.168.0.0/16</td></tr>
</tbody></table></div>
<h3>IPv6 in brief</h3>
<p>IPv6 addresses are 128 bits written in hexadecimal, like <code>2001:db8::1</code>. Leading zeros can be dropped, and one run of all-zero groups can be shortened to <code>::</code>. Addresses starting with <code>fe80</code> are link-local, the IPv6 version of APIPA.</p>
<p>The subnet mask (or CIDR prefix like /24) says how many bits of the address name the network. The rest identify hosts on that network.</p>
<div class="viz" id="viz-subnet"></div>`},
{id:"internet",num:"2.7",title:"Internet connection and network types",html:`
<h3>Connection types</h3>
<ul>
<li><b>Fiber</b>: light over glass. The fastest and most reliable option.</li>
<li><b>Cable</b>: uses the coaxial TV cable. Fast, but bandwidth is shared with neighbors.</li>
<li><b>DSL</b>: uses the telephone line. Speed drops the farther you are from the provider's office.</li>
<li><b>Cellular</b>: 4G or 5G from a phone carrier, sometimes through a hotspot.</li>
<li><b>Satellite</b>: works almost anywhere. Traditional satellites have high latency, while low-orbit services have much less.</li>
<li><b>WISP</b>: wireless internet service provider, using point-to-point radio links, often in rural areas.</li>
</ul>
<h3>Network types by size</h3>
<div class="scroll"><table><thead><tr><th>Type</th><th>Covers</th></tr></thead><tbody>
<tr><td class="port">PAN</td><td>One person's devices, such as Bluetooth</td></tr>
<tr><td class="port">LAN / WLAN</td><td>One building or home, wired or wireless</td></tr>
<tr><td class="port">MAN</td><td>A city or campus</td></tr>
<tr><td class="port">WAN</td><td>Large distances, linking sites. The internet is the largest WAN.</td></tr>
<tr><td class="port">SAN</td><td>A dedicated network for shared storage</td></tr>
</tbody></table></div>`},
{id:"tools",num:"2.8",title:"Networking tools",html:`
<ul>
<li><b>Cable stripper</b>: removes the outer jacket.</li>
<li><b>Crimper</b>: attaches an RJ45 connector to the end of a cable.</li>
<li><b>Punchdown tool</b>: seats wires into a patch panel or keystone jack.</li>
<li><b>Cable tester</b>: checks that each wire connects correctly end to end.</li>
<li><b>Toner probe</b>: one end sends a tone, the probe finds which cable carries it. Used to trace an unlabeled cable.</li>
<li><b>Loopback plug</b>: sends a port's signal back to itself to test the port.</li>
<li><b>Wi-Fi analyzer</b>: shows nearby networks, signal strength and channel use.</li>
<li><b>Network tap</b>: copies traffic from a link so it can be monitored.</li>
</ul>
<h3>T568B wiring order</h3>
<p>Most new installations use T568B. Hold the RJ45 plug with the clip facing away from you and read pins 1 to 8 from left to right.</p>
<div class="viz" id="viz-rj45"></div>
<div class="tip"><b>Remember.</b> T568A swaps the orange and green pairs. A cable with T568A on one end and T568B on the other is a crossover cable.</div>`}
];

const CARDS=[
 ...PORTS.map(p=>({deck:"ports",id:"p"+p[0],q:"Port "+p[0],a:`<b>${p[2]}</b> (${p[1]})<br>${p[3]}`})),
 ...[["Which Wi-Fi standard is Wi-Fi 6?","802.11ax"],["Non-overlapping 2.4 GHz channels","1, 6 and 11"],["802.11ac band","5 GHz only"],["Wi-Fi 7 standard","802.11be"],
     ["DNS record for IPv6","AAAA"],["DNS record for mail delivery","MX"],["DNS alias record","CNAME"],["SPF, DKIM and DMARC live in which record?","TXT"],
     ["DHCP steps (DORA)","Discover, Offer, Request, Acknowledge"],["169.254.x.x means…","APIPA: the device could not reach a DHCP server"],
     ["DHCP reservation","Always gives a specific MAC address the same IP"],["Switch vs router","A switch connects devices within a network (MAC). A router connects networks (IP)."],
     ["802.3at max power","30 W (PoE+)"],["Tool to trace an unlabeled cable","Toner probe"],["Tool to attach RJ45 connectors","Crimper"],
     ["T568B pins 1 and 2","White-orange, orange"],["Private range 172.x","172.16.0.0 – 172.31.255.255 (/12)"],["/24 subnet mask","255.255.255.0"],
     ["Four IP settings a host needs","IP address, subnet mask, default gateway, DNS server"],["Network type for shared storage","SAN"]]
   .map((c,i)=>({deck:"concepts",id:"c"+i,q:c[0],a:c[1]}))
];
const QUIZ=[
 {q:"A user can browse to websites by IP address but not by name. Which service is most likely failing?",o:["DHCP","DNS","SMTP","LDAP"],a:1,e:"DNS translates names into IP addresses. If addresses work but names don't, name resolution is the problem."},
 {q:"Which port should be open on a firewall to allow Remote Desktop connections to a Windows PC?",o:["22","443","3389","445"],a:2,e:"RDP uses TCP 3389. Port 22 is SSH, 443 is HTTPS and 445 is SMB."},
 {q:"A technician needs to securely manage a Linux server from the command line. Which protocol and port should be used?",o:["Telnet on 23","SSH on 22","FTP on 21","HTTP on 80"],a:1,e:"SSH on port 22 encrypts the session. Telnet sends everything, including passwords, in clear text."},
 {q:"A laptop shows an IP address of 169.254.17.40. What does this indicate?",o:["It has a static address","It received an address from DHCP","It could not reach a DHCP server","It is using IPv6"],a:2,e:"169.254.x.x is an APIPA address, which Windows assigns itself when no DHCP server answers."},
 {q:"A user wants email to stay on the server and sync across a phone and a laptop. Which protocol fits?",o:["POP3","SMTP","IMAP","SNMP"],a:2,e:"IMAP (143) keeps mail on the server and syncs folders across devices. POP3 usually downloads mail to one device."},
 {q:"Which DNS record tells other mail servers where to deliver email for a domain?",o:["A","CNAME","MX","AAAA"],a:2,e:"MX (mail exchanger) records point to the server that accepts email for the domain."},
 {q:"In an office, the 2.4 GHz Wi-Fi is slow and a Wi-Fi analyzer shows many networks on channels 3 and 9. Which channels should the access point use?",o:["2, 7 or 12","1, 6 or 11","4, 8 or 10","Any channel, they don't overlap"],a:1,e:"In the US, only channels 1, 6 and 11 on 2.4 GHz don't overlap each other."},
 {q:"A printer should always receive the same IP address but still get its settings from DHCP. What should be configured?",o:["A DHCP reservation","A DHCP exclusion","A shorter lease","APIPA"],a:0,e:"A reservation ties an IP address to the printer's MAC address so DHCP always hands it the same one."},
 {q:"Which device forwards traffic between devices on the same LAN using MAC addresses?",o:["Router","Switch","Modem","Firewall"],a:1,e:"Switches forward frames inside a network by MAC address. Routers forward packets between networks by IP address."},
 {q:"A new security camera needs power and data over one cable, but the switch doesn't support PoE. What is the simplest fix?",o:["A PoE injector","A patch panel","A loopback plug","A managed switch with VLANs"],a:0,e:"A PoE injector adds power to a single cable run between a non-PoE switch and the device."},
 {q:"Which tool helps find which wall jack an unlabeled cable in the wiring closet connects to?",o:["Crimper","Punchdown tool","Toner probe","Loopback plug"],a:2,e:"A toner sends a signal down the cable, and the probe detects it at the other end."},
 {q:"Which address is a private IPv4 address?",o:["172.32.10.5","192.169.1.20","10.44.2.1","8.8.8.8"],a:2,e:"10.0.0.0/8 is private. 172.32.x.x is outside 172.16–172.31, and 192.169.x.x is not 192.168."},
 {q:"Which internet connection type typically has the highest latency?",o:["Fiber","Cable","Traditional geostationary satellite","DSL"],a:2,e:"Signals travel about 36,000 km to a geostationary satellite and back, adding noticeable delay."},
 {q:"Which protocol is used to monitor and collect information from routers and switches?",o:["SNMP","SMB","LDAP","NetBIOS"],a:0,e:"SNMP (UDP 161, traps on 162) lets a management system poll and receive alerts from network devices."},
 {q:"What is the correct order of the DHCP process?",o:["Request, Offer, Discover, Acknowledge","Discover, Offer, Request, Acknowledge","Discover, Request, Offer, Acknowledge","Offer, Discover, Acknowledge, Request"],a:1,e:"Remember DORA: Discover, Offer, Request, Acknowledge."},
 {q:"Users can't open a shared folder on a Windows file server, but they can ping it. Which port is most likely blocked?",o:["445","389","143","3389"],a:0,e:"Windows file sharing uses SMB on TCP 445. Ping working shows basic connectivity is fine."},
 {q:"An application looks up user accounts in Active Directory. Which protocol and port does it most likely use?",o:["LDAP on 389","SNMP on 161","SMTP on 25","RDP on 3389"],a:0,e:"LDAP (389) queries directory services such as Active Directory."},
 {q:"Which Wi-Fi version adds the 6 GHz band to 802.11ax?",o:["Wi-Fi 5","Wi-Fi 6","Wi-Fi 6E","Wi-Fi 4"],a:2,e:"Wi-Fi 6E is 802.11ax extended into the 6 GHz band. Plain Wi-Fi 6 uses 2.4 and 5 GHz."},
 {q:"A customer pays by holding a phone a few centimeters from a card reader. Which technology is used?",o:["Bluetooth","NFC","RFID","Wi-Fi Direct"],a:1,e:"NFC works at a range of a few centimeters, which suits tap-to-pay and quick pairing."},
 {q:"An administrator publishes a list of servers allowed to send email for the company domain. Which DNS record type holds it?",o:["MX","TXT","CNAME","A"],a:1,e:"SPF policies are stored in TXT records, as are DKIM keys and DMARC policies."},
 {q:"www.example.com should simply point to the same host as example.com. Which DNS record should be created?",o:["MX","AAAA","CNAME","TXT"],a:2,e:"A CNAME is an alias that points one name at another name."},
 {q:"An office wants guest Wi-Fi traffic kept apart from staff PCs on the same switch. What is needed?",o:["An unmanaged switch","A managed switch with VLANs","A hub","A PoE injector"],a:1,e:"VLANs split one physical switch into separate logical networks, and only managed switches support them."},
 {q:"Which standard supplies up to 30 W per port?",o:["802.3af","802.3at","802.3bt","802.11ac"],a:1,e:"802.3at (PoE+) provides up to 30 W. 802.3af is 15.4 W and 802.3bt goes up to 100 W."},
 {q:"In a wiring closet, where do the cables from the office wall jacks terminate?",o:["Patch panel","Firewall","Modem","Access point"],a:0,e:"Wall runs are punched down into a patch panel, and short patch cables connect the panel to the switch."},
 {q:"A website gets more traffic than one server can handle. Which device spreads requests across several servers?",o:["Proxy server","Load balancer","Spam gateway","Syslog server"],a:1,e:"A load balancer distributes incoming requests across a pool of servers."},
 {q:"A company wants employees to sign in to Wi-Fi with their own network username and password. Which service checks those credentials?",o:["RADIUS","DHCP","DNS","NTP"],a:0,e:"RADIUS is a common AAA server. With WPA2 or WPA3-Enterprise, the access point passes logins to it."},
 {q:"A technician wants to confirm a NIC port works without connecting it to a network. Which tool should be used?",o:["Toner probe","Loopback plug","Crimper","Wi-Fi analyzer"],a:1,e:"A loopback plug sends the port's own signal back to it, so the port can test itself."},
 {q:"Which tool seats individual wires into a keystone jack?",o:["Punchdown tool","Cable stripper","Crimper","Cable tester"],a:0,e:"A punchdown tool pushes each wire into the jack's contacts and trims the excess."},
 {q:"A university links buildings across a city into one network. Which network type is this?",o:["PAN","LAN","MAN","SAN"],a:2,e:"A metropolitan area network (MAN) covers a city or a large campus."},
 {q:"Which internet connection type runs over existing telephone lines?",o:["Cable","DSL","Fiber","WISP"],a:1,e:"DSL uses phone lines, and its speed drops with distance from the provider's office."},
 {q:"How many usable host addresses does a /26 subnet provide?",o:["30","62","126","254"],a:1,e:"/26 leaves 6 host bits. 2⁶ − 2 = 62 usable hosts."},
 {q:"A computer shows the IPv6 address fe80::1c2b:3aff:fe11:9d4e. What type of address is this?",o:["Global unicast","Link-local","Loopback","Multicast"],a:1,e:"Addresses starting with fe80 are link-local. Every IPv6 interface creates one automatically."},
 {q:"Why does a SOHO router use NAT?",o:["To encrypt Wi-Fi traffic","To let many private addresses share one public IP","To assign IP addresses","To resolve names"],a:1,e:"NAT translates private inside addresses to the router's public address, so a whole office can share one."},
 {q:"Which protocol transfers files without encryption using ports 20 and 21?",o:["SFTP","FTP","TFTP","HTTPS"],a:1,e:"FTP uses 21 for commands and 20 for data, and sends everything in clear text."},
 {q:"A technician needs to copy files to a server securely over port 22. Which protocol should be used?",o:["FTP","Telnet","SFTP","SMB"],a:2,e:"SFTP runs over SSH on port 22, so the transfer is encrypted."},
 {q:"What is the default gateway?",o:["The DNS server","The router address that sends traffic off the local network","The DHCP lease time","The switch's MAC address"],a:1,e:"Traffic for any address outside the local subnet goes to the default gateway, usually the router."},
 {q:"Which port does a mail server use to send email to another mail server?",o:["25","110","143","993"],a:0,e:"SMTP on port 25 relays mail between servers. POP3 (110) and IMAP (143) are for retrieving mail."},
 {q:"Why should Telnet be disabled on network devices?",o:["It is too slow","It sends credentials in clear text","It only works on IPv6","It requires a license"],a:1,e:"Telnet does not encrypt anything, so passwords can be captured. Use SSH instead."},
 {q:"Why would an administrator create a DHCP exclusion?",o:["To block a device from the network","To keep some addresses in the scope free for statically assigned devices","To shorten lease times","To enable APIPA"],a:1,e:"Exclusions stop DHCP from handing out addresses reserved for servers, printers or network gear set by hand."},
 {q:"A warehouse needs Wi-Fi that reaches through several walls, and speed matters less. Which band is the best choice?",o:["2.4 GHz","5 GHz","6 GHz","60 GHz"],a:0,e:"Lower frequencies travel farther and pass through walls better, so 2.4 GHz gives the most range."},
 {q:"A cable has T568A on one end and T568B on the other. What kind of cable is it?",o:["Straight-through","Crossover","Rollover","Coaxial"],a:1,e:"Mixing the two standards swaps the transmit and receive pairs, which makes a crossover cable."}
];
registerModule({
  id:"net",slug:"networking",title:"Networking",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(" ").slice(0,3).join(" ")})),
  decks:[["ports","Ports"],["concepts","Concepts"]],
  cards:CARDS,
  quiz:QUIZ,
  vizKeys:["viz-tcp","viz-dora","map","chan","subnet","rj45"],
  viz(){

/* ================= Interactive diagrams ================= */

seqViz($("#viz-tcp"),{title:"The TCP three-way handshake",left:"Your PC",right:"Web server",
  intro:"Press <b>Next step</b> to watch a TCP connection open before any data is sent.",
  steps:[
   {dir:"r",label:"SYN",sub:"to port 443",text:"<b>SYN.</b> The PC asks to open a connection and sends its starting sequence number."},
   {dir:"l",label:"SYN-ACK",text:"<b>SYN-ACK.</b> The server agrees, sends its own sequence number, and acknowledges the PC's."},
   {dir:"r",label:"ACK",text:"<b>ACK.</b> The PC acknowledges the server. The connection is open and data can flow."}],
  end:"<b>Compare with UDP:</b> no handshake and no acknowledgments. UDP just sends, which is why DNS queries, video calls and DHCP use it."});
seqViz($("#viz-dora"),{title:"Watch DHCP hand out an address",left:"New laptop (no IP)",right:"DHCP server",
  intro:"A laptop has just joined the network and has no IP address yet. Press <b>Next step</b>.",
  steps:[
   {dir:"r",label:"Discover",sub:"broadcast · UDP 68 → 67",dash:true,text:"<b>Discover.</b> The laptop broadcasts to everyone (255.255.255.255) because it doesn't know where the server is yet."},
   {dir:"l",label:"Offer",sub:"192.168.1.23 /24, gateway .1, DNS",text:"<b>Offer.</b> The server offers an address from its scope, along with the subnet mask, default gateway and DNS server."},
   {dir:"r",label:"Request",sub:"broadcast",dash:true,text:"<b>Request.</b> The laptop asks to use the offered address. It's still a broadcast, so any other DHCP servers know their offers were declined."},
   {dir:"l",label:"Acknowledge",sub:"lease: 24 hours",text:"<b>Acknowledge.</b> The server confirms. The lease starts, and the laptop will try to renew it halfway through."}],
  end:"<b>No server answers?</b> After the Discover goes unanswered, Windows assigns itself an APIPA address in 169.254.x.x. That's your clue to check the connection or the DHCP server."});

/* ---- 2. Network map with a web request walkthrough ---- */
(function(){
  const el=$("#viz-map");
  const N={
    pc:{x:70,y:52,name:"Desktop PC",sub:"wired client",info:"<b>Desktop PC.</b> Plugged into the switch with a Cat 6 cable and RJ45 connectors."},
    printer:{x:70,y:142,name:"Printer",sub:"192.168.1.50",info:"<b>Network printer.</b> Uses a DHCP reservation so its IP address never changes and computers can always find it."},
    laptop:{x:70,y:262,name:"Laptop",sub:"192.168.1.23",info:"<b>Laptop.</b> A wireless client. It gets its IP address, mask, gateway and DNS server from the router's DHCP service."},
    ap:{x:205,y:262,name:"Access point",sub:"Wi-Fi ↔ wired",info:"<b>Access point.</b> Bridges Wi-Fi clients onto the wired network. Often powered by PoE from the switch, so it needs only one cable."},
    sw:{x:205,y:142,name:"Switch",sub:"forwards by MAC",info:"<b>Switch.</b> Connects devices inside the LAN and forwards frames by MAC address. A managed switch adds VLANs and port settings."},
    rt:{x:345,y:142,name:"Router",sub:"gateway 192.168.1.1",info:"<b>Router and firewall.</b> The default gateway. Connects the LAN to the internet and runs DHCP, NAT and firewall rules."},
    modem:{x:470,y:142,name:"Modem / ONT",sub:"cable, DSL or fiber",info:"<b>Modem or ONT.</b> Converts the provider's signal (coax, phone line or fiber) into Ethernet for the router."},
    net:{x:590,y:142,name:"Internet",sub:"WAN",info:"<b>The internet.</b> The largest WAN: many provider networks joined by routers."},
    dns:{x:700,y:232,name:"DNS server",sub:"port 53",info:"<b>DNS server.</b> Answers questions like \"What is the IP address of comptia.org?\""},
    web:{x:700,y:52,name:"Web server",sub:"port 443",info:"<b>Web server.</b> Hosts the website and listens for HTTPS on port 443."}
  };
  const L=[["pc","sw"],["printer","sw"],["ap","sw"],["laptop","ap",1],["sw","rt"],["rt","modem"],["modem","net"],["net","web"],["net","dns"]];
  const key=(a,b)=>[a,b].sort().join("|");
  const out=["laptop","ap","sw","rt","modem","net"];
  const STEPS=[
    {p:["laptop","ap","sw","rt","sw","ap","laptop"],t:"<b>1. Get an address.</b> The laptop joins Wi-Fi and runs DHCP with the router. It receives 192.168.1.23, mask 255.255.255.0, gateway 192.168.1.1 and a DNS server."},
    {p:[...out,"dns"],t:"<b>2. Look up the name.</b> The user types comptia.org. The laptop asks the DNS server for its IP address over UDP port 53. The address is outside the LAN, so the packet goes to the default gateway (the router)."},
    {p:["dns",...out.slice().reverse()],t:"<b>3. Get the answer.</b> The DNS server replies with the web server's public IP address."},
    {p:[...out,"web"],t:"<b>4. Connect securely.</b> The laptop opens a TCP connection to port 443 (HTTPS). On the way out, the router uses NAT to swap the private 192.168.1.23 for the home's single public IP address."},
    {p:["web",...out.slice().reverse()],t:"<b>5. Load the page.</b> The page comes back. The router checks its NAT table to find which private address asked for it, and the switch delivers it to the right device by MAC address."}
  ];
  let step=-1,anim=null,sel=null;
  el.innerHTML=`<div class="viz-title">Follow a web request through a small office network</div>
  <div class="viz-scroll"><svg viewBox="0 0 770 300" style="min-width:600px" role="group" aria-label="Small office network diagram"></svg></div>
  <div class="caption" aria-live="polite">Click any device to see what it does, or press <b>Play next step</b> to follow a laptop loading a website.</div>
  <div class="viz-controls"><button class="btn primary" data-a="play">Play next step</button><button class="btn" data-a="reset">Start over</button><span class="grow">Step 0 of ${STEPS.length}</span></div>`;
  const svg=$("svg",el),cap=$(".caption",el),cnt=$(".grow",el);
  let s=`<rect x="10" y="12" width="400" height="282" rx="12" class="m-zone"/><text x="22" y="32" class="s-small">YOUR LAN · 192.168.1.0/24</text>`;
  L.forEach(([a,b,w])=>s+=`<line class="m-link${w?" wifi":""}" data-k="${key(a,b)}" x1="${N[a].x}" y1="${N[a].y}" x2="${N[b].x}" y2="${N[b].y}"/>`);
  for(const[id,n]of Object.entries(N))s+=`<g class="m-node" data-n="${id}" tabindex="0" role="button" aria-label="${n.name}"><rect x="${n.x-54}" y="${n.y-23}" width="108" height="46" rx="9"/><text x="${n.x}" y="${n.y-3}" text-anchor="middle" class="s-b" style="font-size:13px">${n.name}</text><text x="${n.x}" y="${n.y+14}" text-anchor="middle" class="s-small" style="font-size:10.5px">${n.sub}</text></g>`;
  s+=`<circle class="m-dot" r="8" cx="-20" cy="-20"/>`;
  svg.innerHTML=s;
  const dot=$(".m-dot",svg);
  function clearOn(){svg.querySelectorAll(".on").forEach(e=>e.classList.remove("on"))}
  function light(p){clearOn();p.forEach((n,i)=>{svg.querySelector(`[data-n="${n}"]`).classList.add("on");if(i)svg.querySelector(`[data-k="${key(p[i-1],n)}"]`).classList.add("on")})}
  function run(p){
    cancelAnimationFrame(anim);light(p);
    const pts=p.map(n=>N[n]);const seg=[];let total=0;
    for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);seg.push(d);total+=d}
    const end=pts[pts.length-1];
    if(REDUCED){dot.setAttribute("cx",end.x);dot.setAttribute("cy",end.y);return}
    const dur=total/0.32;let t0=null;
    const tick=ts=>{t0??=ts;let dist=Math.min((ts-t0)/dur,1)*total,i=0;
      while(i<seg.length-1&&dist>seg[i]){dist-=seg[i];i++}
      const f=seg[i]?Math.min(dist/seg[i],1):1,a=pts[i],b=pts[i+1];
      dot.setAttribute("cx",a.x+(b.x-a.x)*f);dot.setAttribute("cy",a.y+(b.y-a.y)*f);
      if(ts-t0<dur)anim=requestAnimationFrame(tick)};
    anim=requestAnimationFrame(tick);
  }
  function selNode(id){svg.querySelectorAll(".sel").forEach(e=>e.classList.remove("sel"));svg.querySelector(`[data-n="${id}"]`).classList.add("sel");cap.innerHTML=N[id].info}
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-n]");if(g)selNode(g.dataset.n)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-n]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();selNode(g.dataset.n)}});
  $('[data-a="play"]',el).onclick=()=>{step=(step+1)%STEPS.length;run(STEPS[step].p);cap.innerHTML=STEPS[step].t;cnt.textContent=`Step ${step+1} of ${STEPS.length}`;
    $('[data-a="play"]',el).textContent=step===STEPS.length-1?"Play again from step 1":"Play next step";if(step===STEPS.length-1)award("viz:map",30,"Followed a web request end to end")};
  $('[data-a="reset"]',el).onclick=()=>{step=-1;cancelAnimationFrame(anim);clearOn();dot.setAttribute("cx",-20);dot.setAttribute("cy",-20);
    cap.innerHTML="Click any device to see what it does, or press <b>Play next step</b> to follow a laptop loading a website.";cnt.textContent=`Step 0 of ${STEPS.length}`;$('[data-a="play"]',el).textContent="Play next step"};
})();

/* ---- 3. 2.4 GHz channel overlap ---- */
(function(){
  const el=$("#viz-chan");let picked=[3,5,9];
  const X=f=>30+(f-2399)*(580/76),cf=c=>2407+5*c;
  el.innerHTML=`<div class="viz-title">See why only channels 1, 6 and 11 work together</div>
  <div class="viz-scroll"><svg viewBox="0 0 640 215" style="min-width:420px" role="img" aria-label="2.4 GHz channel overlap chart"></svg></div>
  <div class="chips" role="group" aria-label="Pick up to three channels">${Array.from({length:11},(_,i)=>`<button class="chip" data-c="${i+1}">${i+1}</button>`).join("")}</div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-p="1,6,11">Use 1, 6 and 11</button><button class="btn" data-p="3,5,9">Show a crowded office</button><span class="grow">Pick up to 3 channels</span></div>`;
  const svg=$("svg",el),cap=$(".caption",el);
  function draw(){
    let s="";
    const bad=new Set();const pairs=[];
    for(let i=0;i<picked.length;i++)for(let j=i+1;j<picked.length;j++)if(Math.abs(picked[i]-picked[j])<5){bad.add(i);bad.add(j);pairs.push([picked[i],picked[j]].sort((a,b)=>a-b))}
    picked.forEach((c,i)=>{const x1=X(cf(c)-11),x2=X(cf(c)+11),w=x2-x1;
      s+=`<path class="ch-hump ch-h${i}${bad.has(i)?" ch-bad":""}" d="M${x1},170 C${x1+w*.18},28 ${x2-w*.18},28 ${x2},170 Z"/>
          <text x="${X(cf(c))}" y="62" text-anchor="middle" class="s-b">Ch ${c}</text>`});
    s+=`<line x1="20" y1="170" x2="620" y2="170" class="ch-axis"/>`;
    for(let c=1;c<=11;c++){const x=X(cf(c));s+=`<line x1="${x}" y1="170" x2="${x}" y2="176" class="ch-axis"/><text x="${x}" y="192" text-anchor="middle" style="font-size:12px">${c}</text>`}
    s+=`<text x="320" y="210" text-anchor="middle" class="s-small">Channel (each is 22 MHz wide, but centers are only 5 MHz apart)</text>`;
    svg.innerHTML=s;
    el.querySelectorAll("[data-c]").forEach(b=>b.setAttribute("aria-pressed",picked.includes(+b.dataset.c)));
    cap.innerHTML=!picked.length?"Pick a channel to see how much of the band it covers."
      :pairs.length?`<span class="status-bad">Overlap:</span> ${pairs.map(p=>`channels ${p[0]} and ${p[1]}`).join(", ")}. Overlapping access points interfere with each other, so both slow down. Channels need to be at least 5 apart.`
      :(picked.length===3&&award("viz:chan",20,"Found three clear channels"),`<span class="status-good">No overlap.</span> ${picked.length===3?"These three access points can sit side by side without interfering.":"Add another channel to compare."}`);
  }
  el.addEventListener("click",e=>{
    const c=e.target.closest("[data-c]"),p=e.target.closest("[data-p]");
    if(c){const n=+c.dataset.c;picked=picked.includes(n)?picked.filter(x=>x!==n):[...picked,n].slice(-3);draw()}
    if(p){picked=p.dataset.p.split(",").map(Number);draw()}
  });
  draw();
})();

/* ---- 4. Subnet mask slider ---- */
(function(){
  const el=$("#viz-subnet");const IP=[192,168,1,100];
  el.innerHTML=`<div class="viz-title">Drag the slider to change the subnet mask</div>
  <div class="sn-top"><span class="sn-prefix" aria-live="polite"></span><input type="range" id="sn-range" min="8" max="30" value="24" aria-label="CIDR prefix length"></div>
  <div class="bits" aria-hidden="true"></div>
  <div class="legend"><span><i style="background:var(--blue)"></i>Network bits (mask 1s)</span><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Host bits (mask 0s)</span></div>
  <div class="sn-grid"></div>
  <div class="caption"></div>`;
  const r=$("#sn-range",el);
  const toInt=a=>((a[0]<<24)>>>0)+(a[1]<<16)+(a[2]<<8)+a[3],toStr=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
  function draw(){
    const n=+r.value,mask=(0xFFFFFFFF<<(32-n))>>>0,ip=toInt(IP),net=(ip&mask)>>>0,bc=(net|(~mask>>>0))>>>0,hosts=2**(32-n)-2;
    $(".sn-prefix",el).textContent="/"+n;
    $(".bits",el).innerHTML=[0,1,2,3].map(o=>`<div class="octet">${Array.from({length:8},(_,b)=>{const i=o*8+b;return `<span class="bit${i<n?" n":""}">${i<n?1:0}</span>`}).join("")}</div>`).join("");
    $(".sn-grid",el).innerHTML=[["Subnet mask",toStr(mask)],["Usable hosts",hosts.toLocaleString("en-US")],["Network address",toStr(net)],["Broadcast address",toStr(bc)],["First usable",toStr(net+1)],["Last usable",toStr(bc-1)]]
      .map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
    const note={8:"/8 is the classic Class A mask, as used by the 10.0.0.0 private range.",16:"/16 is the classic Class B mask.",24:"/24 is the most common mask on home and small office networks.",30:"/30 leaves just 2 usable hosts, typical for a link between two routers."}[n]||"";
    $(".caption",el).innerHTML=`Example host <b class="mono">${IP.join(".")}/${n}</b>. Usable hosts = 2<sup>${32-n}</sup> − 2, because the network and broadcast addresses can't be assigned. ${note}`;
  }
  r.addEventListener("input",()=>{draw();award("viz:subnet",20,"Explored subnet masks")});draw();
})();

/* ---- 5. RJ45 wiring builder ---- */
(function(){
  const el=$("#viz-rj45");
  const W={wo:["White-orange","#f4f4f4","#e0701c"],o:["Orange","#e0701c"],wg:["White-green","#f4f4f4","#2e8b3d"],bl:["Blue","#2563c9"],wbl:["White-blue","#f4f4f4","#2563c9"],g:["Green","#2e8b3d"],wbr:["White-brown","#f4f4f4","#7a4b2a"],br:["Brown","#7a4b2a"]};
  const STD={B:["wo","o","wg","bl","wbl","g","wbr","br"],A:["wg","g","wo","bl","wbl","o","wbr","br"]};
  const bg=k=>W[k].length===3?`repeating-linear-gradient(135deg,${W[k][2]} 0 6px,${W[k][1]} 6px 12px)`:W[k][1];
  const pal=["bl","wo","br","g","wbl","o","wbr","wg"];
  let std="B",slots=Array(8).fill(null),checked=false,revealed=false;
  el.innerHTML=`<div class="viz-title">Build an Ethernet cable end</div>
  <div class="viz-controls"><span>Standard:</span><button class="chip" data-s="B">T568B</button><button class="chip" data-s="A">T568A</button></div>
  <div class="rj-plug" role="group" aria-label="RJ45 pins 1 to 8"></div>
  <div class="rj-pal" role="group" aria-label="Wires"></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="check">Check my wiring</button><button class="btn" data-a="show">Show the answer</button><button class="btn" data-a="clear">Clear</button></div>`;
  const plug=$(".rj-plug",el),palEl=$(".rj-pal",el),cap=$(".caption",el);
  function draw(msg){
    const tgt=STD[std];
    plug.innerHTML=slots.map((k,i)=>`<button class="rj-slot${k?" filled":""}${checked&&k?(k===tgt[i]?" ok":" no"):""}" data-i="${i}" aria-label="Pin ${i+1}: ${k?W[k][0]+". Press to remove.":"empty"}"><i style="${k?"background:"+bg(k):""}"></i>${i+1}</button>`).join("");
    palEl.innerHTML=pal.map(k=>`<button class="rj-wire" data-w="${k}" ${slots.includes(k)?"disabled":""}><i style="background:${bg(k)}"></i>${W[k][0]}</button>`).join("");
    el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===std));
    cap.innerHTML=msg||`Tap the wires in order to fill pins 1 to 8 for <b>T568${std}</b>. Tap a pin to remove its wire. Hold the plug with the clip facing away from you: pin 1 is on the left.`;
  }
  el.addEventListener("click",e=>{
    const w=e.target.closest("[data-w]"),sl=e.target.closest("[data-i]"),s=e.target.closest("[data-s]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(w){const i=slots.indexOf(null);if(i>=0){slots[i]=w.dataset.w;checked=false;draw()}}
    if(sl){slots[+sl.dataset.i]=null;checked=false;draw()}
    if(s){std=s.dataset.s;checked=false;draw()}
    if(a==="clear"){slots.fill(null);checked=false;revealed=false;draw()}
    if(a==="show"){slots=[...STD[std]];checked=true;revealed=true;draw(`This is <b>T568${std}</b>. ${std==="B"?"Orange pair on pins 1–2, green on 3 and 6.":"Green pair on pins 1–2, orange on 3 and 6."} Blue (4–5) and brown (7–8) never move.`)}
    if(a==="check"){checked=true;const right=slots.filter((k,i)=>k===STD[std][i]).length,filled=slots.filter(Boolean).length;
      if(right===8&&!revealed)award("viz:rj45",40,"Wired a perfect RJ45 end");
      draw(filled<8?`Fill all 8 pins first. ${right} of ${filled} placed so far are correct.`:right===8?`<span class="status-good">Perfect T568${std} wiring.</span> This end would pass a cable tester.`:`<span class="status-bad">${8-right} pin${8-right>1?"s are":" is"} wrong</span> (outlined in red). A cable tester would report a miswire or split pair.`)}
  });
  draw();
})();

  },
  sims:[
    {id:"ports",type:"match",title:"Open the right firewall ports",
      scenario:"A new office firewall blocks everything by default. Staff need the services below. Match each service to the port the firewall rule must allow. Tap a service, then tap a port.",
      items:[["HTTPS","443"],["SSH","22"],["RDP","3389"],["DNS","53"],["SMB","445"],["SMTP","25"],["DHCP","67/68"],["IMAP","143"]],
      slots:[["22","TCP/UDP 22","Encrypted remote command line"],["25","TCP/UDP 25","Server-to-server email"],["53","TCP/UDP 53","Name resolution"],["67/68","TCP/UDP 67/68","Automatic IP addressing"],["143","TCP/UDP 143","Mailbox sync"],["443","TCP/UDP 443","Secure web traffic"],["445","TCP/UDP 445","Windows file sharing"],["3389","TCP/UDP 3389","Remote graphical desktop"]],
      success:"The firewall now allows exactly what staff need."},
    {id:"router",title:"Set up a dental office router",mount(el,api,sim){
  /* ---- Sim 2: configure a SOHO router ---- */
  const FACTORY={lanip:"192.168.0.1",mask:"255.255.255.0",dhcp:true,start:"192.168.0.2",end:"192.168.0.254",resmac:"",resip:"",ssid:"HomeRouter-5G-04",sec:"WPA2-Personal",wps:true,pass:"admin",remote:true,fw:"1.0.2"};
  let R={...FACTORY},tab="lan",graded=null;
  const MACS=[["","Choose a device"],["3C:2A:F4:11:8B:02","FrontDesk-Printer (3C:2A:F4:11:8B:02)"],["A4:83:E7:5D:20:9C","Dr-Lee-Laptop (A4:83:E7:5D:20:9C)"]];
  const CHECKS=[
    ["LAN address is 192.168.10.1 /24",()=>R.lanip.trim()==="192.168.10.1"&&R.mask.trim()==="255.255.255.0","The router's LAN IP becomes everyone's default gateway, so it must sit in the 192.168.10.0/24 network."],
    ["DHCP hands out 192.168.10.100 to .199",()=>R.dhcp&&R.start.trim()==="192.168.10.100"&&R.end.trim()==="192.168.10.199","The DHCP scope must match the required range so laptops get addresses automatically."],
    ["Printer reserved at 192.168.10.50",()=>R.resmac==="3C:2A:F4:11:8B:02"&&R.resip.trim()==="192.168.10.50","A reservation ties the printer's MAC address to one IP. It sits outside the DHCP range so it never clashes."],
    ["Wi-Fi uses WPA3",()=>R.sec==="WPA3-Personal","WPA3 is the strongest option here. WEP is broken and Open has no encryption at all."],
    ["WPS turned off",()=>!R.wps,"WPS PINs can be brute-forced, so best practice is to disable it."],
    ["Default admin password changed",()=>R.pass!=="admin"&&R.pass.length>=12,"Factory passwords are published online. Use a long, unique password (12 characters or more)."],
    ["Remote management off",()=>!R.remote,"Remote management exposes the admin page to the internet. Leave it off unless it's needed."],
    ["Firmware updated",()=>R.fw!=="1.0.2","Firmware updates patch security holes, so update before putting the router into service."]
  ];
  const e2=el;
  const field=(id,label,val,extra="")=>`<label class="rf"><span>${label}</span><input id="r-${id}" data-f="${id}" value="${val}" ${extra} autocomplete="off" spellcheck="false"></label>`;
  const toggle=(id,label)=>`<label class="rf rf-tog"><span>${label}</span><input type="checkbox" id="r-${id}" data-f="${id}" ${R[id]?"checked":""}></label>`;
  function panel(){
    if(tab==="lan")return field("lanip","Router IP address",R.lanip)+field("mask","Subnet mask",R.mask);
    if(tab==="dhcp")return toggle("dhcp","DHCP server enabled")+field("start","Start address",R.start)+field("end","End address",R.end)+
      `<h4>Address reservation</h4><label class="rf"><span>Device</span><select id="r-resmac" data-f="resmac">${MACS.map(([v,l])=>`<option value="${v}" ${R.resmac===v?"selected":""}>${l}</option>`).join("")}</select></label>`+field("resip","Reserved IP",R.resip,'placeholder="e.g. 192.168.10.x"');
    if(tab==="wifi")return field("ssid","Network name (SSID)",R.ssid)+`<label class="rf"><span>Security</span><select id="r-sec" data-f="sec">${["Open","WEP","WPA2-Personal","WPA3-Personal"].map(o=>`<option ${R.sec===o?"selected":""}>${o}</option>`).join("")}</select></label>`+toggle("wps","WPS (push-button / PIN)");
    return field("pass","Admin password",R.pass,'type="text"')+toggle("remote","Remote management (WAN access)")+
      `<div class="rf"><span>Firmware</span><div class="fwline"><b class="mono">v${R.fw}</b>${R.fw==="1.0.2"?'<button class="btn" data-a="fw">Install update v1.1.4</button>':'<span class="status-good">Up to date</span>'}</div></div>`;
  }
  function d2(){
    e2.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>Set up a dental office router</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
    <div class="scenario"><p>A small dental office just unboxed a new wireless router. Configure it to meet every requirement:</p>
    <ol><li>The office network is <b>192.168.10.0/24</b>, and the router is <b>.1</b>.</li><li>Staff devices get addresses automatically from <b>.100 to .199</b>.</li><li>The front-desk printer must always be at <b>192.168.10.50</b>.</li><li>Wi-Fi must use the <b>strongest security</b> available.</li><li>Fix the risky settings left over from the factory.</li></ol></div>
    <div class="router">
      <div class="router-bar"><span class="mono">http://${R.lanip}</span><span>Router admin</span></div>
      <div class="router-tabs" role="tablist">${[["lan","LAN"],["dhcp","DHCP"],["wifi","Wireless"],["admin","Administration"]].map(([k,l])=>`<button role="tab" data-t="${k}" aria-selected="${tab===k}">${l}</button>`).join("")}</div>
      <div class="router-body">${panel()}</div>
    </div>
    ${graded?`<div class="grade">${CHECKS.map((c,i)=>`<div class="${graded[i]?"g-ok":"g-no"}"><b>${graded[i]?"✓":"✗"} ${c[0]}</b>${graded[i]?"":`<span>${c[2]}</span>`}</div>`).join("")}</div>`:""}
    <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">All 8 requirements met.</span> This router is ready for the office.`:`<b>${graded.filter(Boolean).length} of 8</b> requirements met. Fix the ones marked ✗ and check again.`):"Every change saves as you type. Press <b>Check configuration</b> when you're done."}</div>
    <div class="viz-controls"><button class="btn primary" data-a="grade">Check configuration</button><button class="btn" data-a="factory">Factory reset</button></div>`;
  }
  e2.addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;R[f]=e.target.type==="checkbox"?e.target.checked:e.target.value;if(f==="lanip")e2.querySelector(".router-bar .mono").textContent="http://"+R.lanip});
  e2.addEventListener("change",e=>{const f=e.target.dataset.f;if(f&&e.target.tagName==="SELECT")R[f]=e.target.value});
  e2.addEventListener("click",e=>{
    const t=e.target.closest("[data-t]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(t){tab=t.dataset.t;d2();return}
    if(a==="fw"){R.fw="1.1.4";d2()}
    if(a==="factory"){R={...FACTORY};graded=null;d2()}
    if(a==="grade"){graded=CHECKS.map(c=>c[1]());if(graded.every(Boolean))api.pass();d2()}
  });
  d2();

    }}
  ],
  badges:[
    ["reader","FP","Fully Patched","Mark all 8 networking lessons studied",c=>c.allStudied()],
    ["lab","LR","Lab Rat","Complete all 6 networking diagrams",c=>c.vizAll()],
    ["crimp","CM","Crimp Master","Wire a perfect RJ45 end without peeking",c=>c.earned("viz:rj45")],
    ["ports","PA","Port Authority","Get all 15 port cards to Familiar or higher",c=>c.deckAtLeast("ports",2)],
    ["recall","TR","Total Recall","Master 10 networking flashcards",c=>c.countAtLeast(4)>=10],
    ["fw","FA","Firewall Architect","Pass the firewall ports simulation",c=>c.passed("ports")],
    ["router","RW","Router Whisperer","Pass the router setup simulation",c=>c.passed("router")],
    ["perfect","PP","Perfect Packet","Score 100% on a networking quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
