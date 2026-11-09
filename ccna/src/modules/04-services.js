/* ================= Module 4: Network Services and Security (200-301 v2.0 Domain 4.0, 20%) ================= */
(function(){
const LESSONS=[
{id:"access",num:"4.1",title:"Securing device access: passwords, SSH and AAA",html:`
<p>A router or switch is only as safe as the way people log in to it. There are three ways in: the <b>console</b> port, the <b>VTY</b> lines (remote Telnet or SSH), and the <b>enable</b> password that guards privileged mode.</p>
<h3>Passwords and how IOS stores them</h3>
<div class="viz" id="viz-pwtypes"></div>
<pre class="term">R1(config)# enable secret Str0ng!Enable
R1(config)# service password-encryption
R1(config)# username admin privilege 15 secret Adm1n!Pass
R1(config)# line console 0
R1(config-line)# login local
R1(config-line)# exec-timeout 5 0
R1(config-line)# logging synchronous</pre>
<h3>SSH instead of Telnet</h3>
<p>Telnet sends everything, passwords included, in clear text on TCP 23. <b>SSH</b> (TCP 22) encrypts the session. IOS needs four things before it will accept SSH:</p>
<ol><li>A <b>hostname</b> other than the default (<code>hostname EDGE1</code>).</li>
<li>A <b>domain name</b> (<code>ip domain name corp.local</code>). Together they name the RSA key.</li>
<li><b>RSA keys</b> (<code>crypto key generate rsa modulus 2048</code>). Version 2 needs at least 768 bits; use 2048.</li>
<li>A way to log in: a <b>local user</b> plus <code>login local</code> on the VTY lines.</li></ol>
<pre class="term">R1(config)# ip ssh version 2
R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# access-class MGMT in
R1# show ip ssh</pre>
<h3>AAA: authentication, authorization and accounting</h3>
<p>Local accounts don't scale to hundreds of devices. <b>AAA</b> sends logins to a central server: <b>authentication</b> (who are you), <b>authorization</b> (what can you do), <b>accounting</b> (what did you do).</p>
<div class="viz" id="viz-aaa"></div>
<pre class="term">R1(config)# aaa new-model
R1(config)# tacacs server ISE1
R1(config-server-tacacs)# address ipv4 10.0.0.20
R1(config-server-tacacs)# key T@cacsKey
R1(config)# aaa authentication login default group tacacs+ local
R1(config)# aaa authorization exec default group tacacs+ local</pre>
<p>The <b>local</b> at the end is the fallback, used only if the server can't be reached. Without it, a dead TACACS+ server locks everyone out.</p>`},
{id:"xfer",num:"4.2",title:"Moving files securely: SFTP and SCP",html:`
<p>Network engineers copy IOS images, configurations and logs all the time. The old ways are unsafe:</p>
<ul><li><b>TFTP</b> (UDP 69): no login and no encryption at all. Only for isolated lab networks.</li>
<li><b>FTP</b> (TCP 20/21): sends the username and password in clear text.</li></ul>
<p>The secure options both run over <b>SSH on TCP 22</b>, so they authenticate the user and encrypt the file:</p>
<ul><li><b>SCP</b> (Secure Copy): a simple one-shot copy. IOS can be an SCP <b>server</b> (<code>ip scp server enable</code>, which needs SSH and AAA) or a client.</li>
<li><b>SFTP</b> (SSH File Transfer Protocol): a full file session that can list, resume and delete. IOS is an SFTP client.</li></ul>
<pre class="term">R1# copy running-config scp://admin@10.0.0.50/backups/r1.cfg
R1# copy sftp://admin@10.0.0.50/images/isr4300-17.12.bin flash:
R1# dir flash:</pre>
<div class="viz" id="viz-xfer"></div>
<div class="tip"><b>Don't confuse FTPS and SFTP.</b> FTPS is regular FTP wrapped in TLS (ports 989/990 or explicit on 21). SFTP is part of SSH. The CCNA blueprint asks for SFTP and SCP.</div>`},
{id:"nat",num:"4.3",title:"NAT and PAT",html:`
<p>Private RFC 1918 addresses can't be routed on the internet. <b>Network Address Translation</b> rewrites them at the edge router. Cisco names four addresses:</p>
<div class="viz" id="viz-natterms"></div>
<h3>Three kinds of inside source NAT</h3>
<ul><li><b>Static NAT</b>: one private address always maps to one public address. Used for servers that must be reachable from outside. <code>ip nat inside source static 192.168.1.100 203.0.113.10</code></li>
<li><b>Dynamic NAT</b>: private addresses borrow public addresses from a pool, one to one, first come first served. When the pool runs out, new hosts fail.</li>
<li><b>PAT (NAT overload)</b>: many private addresses share <b>one</b> public address, told apart by <b>source port</b>. This is what every home router does.</li></ul>
<div class="viz" id="viz-pat"></div>
<pre class="term">R1(config)# interface g0/0/1
R1(config-if)# ip nat inside
R1(config-if)# interface g0/0/0
R1(config-if)# ip nat outside
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 interface g0/0/0 overload
R1# show ip nat translations
R1# show ip nat statistics
R1# clear ip nat translation *</pre>
<div class="viz" id="viz-natmini"></div>
<div class="tip"><b>Troubleshooting NAT.</b> Inside and outside swapped on the interfaces. The ACL doesn't match the inside subnet. Forgot <code>overload</code>, so only one host at a time gets out. No route to the internet. <code>show ip nat statistics</code> shows which interfaces are inside and outside and how many hits each rule has.</div>`},
{id:"dns",num:"4.4",title:"DNS and name resolution",html:`
<p>DNS turns names into addresses. Clients send queries to their configured DNS server on <b>UDP 53</b> (TCP 53 for large answers and zone transfers).</p>
<h3>How a lookup works</h3>
<div class="viz" id="viz-dnsres"></div>
<h3>Record types</h3>
<table><tr><th>Record</th><th>Maps</th><th>Example</th></tr>
<tr><td>A</td><td>Name to IPv4 address</td><td>www → 203.0.113.80</td></tr>
<tr><td>AAAA</td><td>Name to IPv6 address</td><td>www → 2001:db8::80</td></tr>
<tr><td>CNAME</td><td>Alias to another name</td><td>shop → www.corp.com</td></tr>
<tr><td>MX</td><td>A domain's mail servers, with preference</td><td>corp.com → 10 mail1.corp.com</td></tr>
<tr><td>PTR</td><td>Address back to a name (reverse lookup)</td><td>80.113.0.203.in-addr.arpa → www</td></tr>
<tr><td>NS</td><td>Which servers are authoritative for a zone</td><td>corp.com → ns1.corp.com</td></tr>
<tr><td>SOA</td><td>Start of authority: zone serial and timers</td><td>one per zone</td></tr>
<tr><td>TXT</td><td>Free text, used for SPF, DKIM and domain verification</td><td>"v=spf1 …"</td></tr></table>
<div class="viz" id="viz-dnsrec"></div>
<h3>DNS on IOS</h3>
<pre class="term">R1(config)# ip domain lookup
R1(config)# ip name-server 10.0.0.53 8.8.8.8
R1(config)# ip domain name corp.local</pre>
<p>If you mistype a command in privileged mode with <code>ip domain lookup</code> on and no server, IOS tries to resolve it as a hostname and hangs for a while. That's why many engineers set <code>no ip domain lookup</code> in labs.</p>`},
{id:"vpn",num:"4.5",title:"IPsec VPNs",html:`
<p>A <b>VPN</b> carries private traffic across a public network, protected by encryption. Two shapes:</p>
<ul><li><b>Site-to-site</b>: two routers or firewalls build a permanent tunnel between offices. Users don't run anything; the gateways encrypt and decrypt.</li>
<li><b>Remote access</b>: a user's device runs a VPN client (such as Cisco Secure Client) and builds a tunnel to the company's VPN head-end. Usually TLS-based, or IPsec with IKEv2.</li></ul>
<div class="viz" id="viz-vpntype"></div>
<h3>IPsec building blocks</h3>
<ul><li><b>IKE</b> (Internet Key Exchange, UDP 500, or 4500 with NAT traversal) negotiates the tunnel. Phase 1 builds a secure management channel; phase 2 negotiates the <b>IPsec SAs</b> that protect data.</li>
<li><b>ESP</b> (IP protocol 50) encrypts and authenticates the payload. <b>AH</b> (protocol 51) authenticates only and breaks with NAT, so ESP is used in practice.</li>
<li><b>Tunnel mode</b> encrypts the whole original packet and adds a new IP header (site-to-site). <b>Transport mode</b> protects only the payload.</li>
<li>IPsec alone carries unicast only, so routing protocols can't run over it. <b>GRE over IPsec</b> or a <b>virtual tunnel interface</b> (VTI) fixes that. <b>DMVPN</b> builds hub-and-spoke tunnels automatically.</li></ul>
<div class="viz" id="viz-ike"></div>`},
{id:"acl",num:"4.6",title:"Access control lists",html:`
<p>An ACL is an ordered list of permit and deny statements. The router checks a packet against each line <b>top to bottom</b> and acts on the <b>first match</b>. Every ACL ends with an invisible <b>implicit deny any</b>, so an ACL with only deny lines blocks everything.</p>
<table><tr><th></th><th>Standard</th><th>Extended</th></tr>
<tr><td>Matches on</td><td>Source address only</td><td>Protocol, source, destination, ports</td></tr>
<tr><td>Numbers</td><td>1–99, 1300–1999</td><td>100–199, 2000–2699</td></tr>
<tr><td>Place it</td><td>Close to the <b>destination</b></td><td>Close to the <b>source</b></td></tr></table>
<h3>Wildcard masks</h3>
<p>A wildcard mask says which bits to ignore: <b>0 means must match, 1 means don't care</b>. For a subnet it's the inverse of the subnet mask: /24 is 0.0.0.255, /26 is 0.0.0.63. Shortcuts: <code>host 10.1.1.5</code> means 10.1.1.5 0.0.0.0, and <code>any</code> means 0.0.0.0 255.255.255.255.</p>
<div class="viz" id="viz-wild"></div>
<h3>Writing and applying them</h3>
<pre class="term">R1(config)# ip access-list extended GUEST-IN
R1(config-ext-nacl)# remark Guests can't reach the servers
R1(config-ext-nacl)# deny ip 192.168.20.0 0.0.0.255 10.1.1.0 0.0.0.255
R1(config-ext-nacl)# permit tcp 192.168.20.0 0.0.0.255 any eq 443
R1(config-ext-nacl)# permit udp 192.168.20.0 0.0.0.255 any eq 53
R1(config-ext-nacl)# interface g0/0/2
R1(config-if)# ip access-group GUEST-IN in

R1(config)# access-list 10 permit host 192.168.10.5
R1(config)# line vty 0 4
R1(config-line)# access-class 10 in
R1# show access-lists</pre>
<p>One ACL per interface, per direction, per protocol. <b>In</b> filters packets arriving on the interface, before routing. <b>Out</b> filters packets leaving. Named ACLs can be edited by sequence number (<code>15 permit …</code> inserts between 10 and 20).</p>
<div class="viz" id="viz-aclorder"></div>
<div class="viz" id="viz-aclplace"></div>`},
{id:"l2sec",num:"4.7",title:"Layer 2 security features",html:`
<p>The access layer is where untrusted devices plug in, so most attacks start there. The CCNA covers these defenses:</p>
<h3>DHCP snooping</h3>
<p>Ports are <b>untrusted</b> by default: DHCP server messages (Offer, Ack) arriving on them are dropped, which stops <b>rogue DHCP servers</b>. Only the uplink toward the real server is <b>trusted</b>. Snooping also builds a <b>binding table</b> of MAC, IP, VLAN and port for every lease, which other features use. <code>ip dhcp snooping limit rate</code> stops DHCP starvation floods.</p>
<pre class="term">SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# no ip dhcp snooping information option
SW1(config)# interface g1/0/1
SW1(config-if)# ip dhcp snooping trust</pre>
<h3>Dynamic ARP Inspection</h3>
<p>DAI checks every ARP on untrusted ports against the snooping binding table and drops lies, which stops <b>ARP spoofing</b> (man-in-the-middle). <code>ip arp inspection vlan 10</code>, with <code>ip arp inspection trust</code> on the uplink.</p>
<div class="viz" id="viz-snoop"></div>
<h3>Port security</h3>
<p>Limits how many MAC addresses a port can learn, and which ones. It stops <b>MAC flooding</b> and unauthorized devices. The port must be a static access (or trunk) port first.</p>
<pre class="term">SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation restrict</pre>
<table><tr><th>Violation mode</th><th>Drops bad frames</th><th>Logs and counts</th><th>Shuts the port</th></tr>
<tr><td>protect</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>restrict</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td>shutdown (default)</td><td>Yes</td><td>Yes</td><td>Yes: err-disabled</td></tr></table>
<h3>Storm control and RA guard</h3>
<p><b>Storm control</b> drops broadcast, multicast or unknown unicast traffic once it passes a percentage of the link (<code>storm-control broadcast level 1.00</code>), and can shut the port or send a trap. <b>IPv6 RA guard</b> drops Router Advertisements on ports facing hosts, so a rogue device can't become everyone's IPv6 gateway.</p>
<div class="viz" id="viz-l2atk"></div>`}
];

const G={
 access:[["Console, VTY and enable","The three ways into a Cisco device"],["Type 0 password","Plain text"],["Type 7 password","Weak reversible Vigenère encoding from service password-encryption"],["Type 5 secret","MD5 hash (older enable secret)"],["Type 8 and 9 secrets","PBKDF2-SHA-256 and scrypt: the strong choices"],["enable secret vs enable password","Secret is hashed and always wins if both exist"],["service password-encryption","Obscures plain-text passwords as type 7"],["Telnet port","TCP 23, clear text"],["SSH port","TCP 22, encrypted"],["SSH prerequisites on IOS","Hostname, domain name, RSA keys, a login method"],["Minimum RSA modulus for SSHv2","768 bits (use 2048)"],["transport input ssh","Allows only SSH on the VTY lines"],["login local","Authenticate against usernames in the local config"],["exec-timeout 5 0","Logs out idle sessions after 5 minutes"],["access-class 10 in","Applies ACL 10 to restrict who can reach the VTY lines"],["show ip ssh","SSH version, timeout and key status"],["AAA","Authentication, authorization and accounting"],["TACACS+","Cisco-developed, TCP 49, encrypts the whole payload, separates AAA functions"],["RADIUS","Open standard, UDP 1812/1813, encrypts only the password, combines authentication and authorization"],["Best fit for device administration","TACACS+ (per-command authorization)"],["Best fit for network access (802.1X, VPN)","RADIUS"],["aaa new-model","Turns on AAA on IOS"],["Why add local after group tacacs+","Fallback if the AAA server is unreachable"]],
 xfer:[["TFTP","UDP 69, no authentication, no encryption"],["FTP","TCP 20/21, clear-text credentials"],["SCP","Secure Copy over SSH, TCP 22"],["SFTP","SSH File Transfer Protocol, TCP 22"],["FTPS","FTP over TLS: not the same as SFTP"],["Enable the IOS SCP server","ip scp server enable"],["Copy the config to an SCP server","copy running-config scp://user@host/file"],["List files in flash","dir flash:"]],
 nat:[["Inside local","The inside host's real (private) address"],["Inside global","The public address the inside host appears as"],["Outside global","The outside host's real public address"],["Outside local","How the outside host appears to the inside (usually the same as outside global)"],["Static NAT","Fixed one-to-one mapping, for servers"],["Dynamic NAT","One-to-one from a pool of public addresses"],["PAT / NAT overload","Many inside hosts share one public address using ports"],["ip nat inside / ip nat outside","Mark which interfaces face the LAN and the internet"],["PAT command","ip nat inside source list 1 interface g0/0/0 overload"],["Static NAT command","ip nat inside source static 192.168.1.100 203.0.113.10"],["show ip nat translations","Lists the active translations"],["show ip nat statistics","Inside/outside interfaces, hits and mappings"],["clear ip nat translation *","Removes dynamic translations"],["Dynamic NAT pool exhausted","New inside hosts can't get out"]],
 dns:[["DNS port","UDP 53 (TCP 53 for large replies and zone transfers)"],["A record","Name to IPv4 address"],["AAAA record","Name to IPv6 address"],["CNAME record","Alias pointing to another name"],["MX record","Mail servers for a domain, with preference"],["PTR record","Reverse lookup: address to name"],["NS record","Authoritative name servers for a zone"],["SOA record","Zone serial number and timers"],["TXT record","Free text: SPF, DKIM, domain verification"],["Recursive resolver","Does the full lookup on the client's behalf and caches the answer"],["Root servers","Point resolvers to the TLD servers"],["TTL","How long a resolver may cache a record"],["ip name-server","Sets the DNS servers IOS uses"],["no ip domain lookup","Stops IOS treating typos as hostnames"]],
 vpn:[["Site-to-site VPN","Permanent tunnel between two gateways; users run nothing"],["Remote-access VPN","A client on the user's device tunnels to a head-end"],["IKE port","UDP 500 (4500 with NAT traversal)"],["IKE phase 1","Builds a secure channel between peers"],["IKE phase 2","Negotiates the IPsec SAs that protect data"],["ESP","IP protocol 50: encryption plus authentication"],["AH","IP protocol 51: authentication only, breaks with NAT"],["Tunnel mode","Encrypts the whole original packet, adds a new header"],["Transport mode","Protects only the payload"],["GRE over IPsec","Lets multicast and routing protocols cross an IPsec tunnel"],["DMVPN","Dynamic hub-and-spoke VPN with on-demand spoke-to-spoke tunnels"]],
 acl:[["ACL processing","Top to bottom, first match wins"],["Implicit rule at the end of every ACL","deny any"],["Standard ACL matches on","Source address only"],["Extended ACL matches on","Protocol, source, destination and ports"],["Standard ACL numbers","1–99 and 1300–1999"],["Extended ACL numbers","100–199 and 2000–2699"],["Where to place a standard ACL","Close to the destination"],["Where to place an extended ACL","Close to the source"],["Wildcard bit 0","Must match"],["Wildcard bit 1","Don't care"],["Wildcard for /26","0.0.0.63"],["host 10.1.1.5","Same as 10.1.1.5 0.0.0.0"],["any","Same as 0.0.0.0 255.255.255.255"],["ip access-group NAME in","Applies an ACL to inbound traffic on an interface"],["ACLs per interface","One per direction per protocol"],["show access-lists","Lists ACLs with match counters"],["Insert a line in a named ACL","Use a sequence number between existing ones"]],
 l2sec:[["DHCP snooping","Drops DHCP server messages on untrusted ports"],["Trusted snooping port","The uplink toward the legitimate DHCP server"],["Snooping binding table","MAC, IP, VLAN and port for each lease"],["ip dhcp snooping limit rate","Limits DHCP packets per second to stop starvation"],["Dynamic ARP Inspection","Drops ARP replies that don't match the binding table"],["Attack DAI stops","ARP spoofing / man-in-the-middle"],["Port security","Limits and pins the MAC addresses on a port"],["Attack port security stops","MAC flooding and unauthorized devices"],["Sticky MAC","Learned MACs are saved into the running config"],["Violation: protect","Drops silently"],["Violation: restrict","Drops, logs and counts"],["Violation: shutdown","Err-disables the port (default)"],["Storm control","Drops broadcast/multicast/unicast above a threshold"],["RA guard","Blocks rogue IPv6 Router Advertisements on host ports"],["VLAN hopping defenses","Disable DTP, unused native VLAN, shut unused ports"]]
};
const DECKS=[["access","Device access and AAA"],["xfer","Secure file transfer"],["nat","NAT and PAT"],["dns","DNS"],["vpn","IPsec VPNs"],["acl","ACLs"],["l2sec","Layer 2 security"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which command stores the privileged-mode password as a strong hash?",o:["enable secret","enable password","service password-encryption","password 7"],a:0,e:"enable secret is hashed; enable password is plain text."},
 {q:"What does service password-encryption do?",o:["Converts plain-text passwords to weak type 7 encoding","Hashes passwords with scrypt","Encrypts SSH sessions","Enables AAA"],a:0,e:"Type 7 is easily reversed. It just stops shoulder surfing."},
 {q:"Which password type is the strongest on modern IOS?",o:["Type 9 (scrypt)","Type 7","Type 5 (MD5)","Type 0"],a:0,e:"Types 8 and 9 are the strong options."},
 {q:"Which is NOT required before IOS accepts SSH connections?",o:["A loopback interface","A hostname other than Router","A domain name","RSA keys"],a:0,e:"Hostname, domain name and RSA keys are needed, plus a way to log in."},
 {q:"Which command allows only SSH on the VTY lines?",o:["transport input ssh","ip ssh version 2","login local","access-class ssh in"],a:0,e:"transport input controls which protocols the lines accept."},
 {q:"Why use SSH instead of Telnet?",o:["SSH encrypts the session, including the password","SSH is faster","Telnet doesn't support passwords","SSH uses UDP"],a:0,e:"Telnet is clear text."},
 {q:"What minimum RSA modulus does SSH version 2 need?",o:["768 bits","512 bits","1024 bits","4096 bits"],a:0,e:"IOS refuses SSHv2 with smaller keys. Use 2048."},
 {q:"Which command limits which source addresses can open VTY sessions?",o:["access-class 10 in under line vty","ip access-group 10 in on every interface","transport input ssh","login local"],a:0,e:"access-class filters VTY access."},
 {q:"Which protocol encrypts the entire payload and uses TCP 49?",o:["TACACS+","RADIUS","LDAP","Kerberos"],a:0,e:"TACACS+ encrypts the whole body. RADIUS encrypts only the password."},
 {q:"Which AAA protocol is an open standard often used for 802.1X?",o:["RADIUS","TACACS+","CDP","SNMP"],a:0,e:"RADIUS on UDP 1812/1813."},
 {q:"Why does 'aaa authentication login default group tacacs+ local' end with local?",o:["Local accounts are used if no TACACS+ server responds","Local accounts are checked first","It logs locally","It disables TACACS+"],a:0,e:"It's the fallback method."},
 {q:"Which AAA protocol is best for authorizing individual commands on routers?",o:["TACACS+","RADIUS","SNMPv3","Syslog"],a:0,e:"TACACS+ separates authorization and supports per-command checks."},
 {q:"Which file transfer protocol has no authentication?",o:["TFTP","SFTP","SCP","FTPS"],a:0,e:"TFTP has no login at all."},
 {q:"SCP and SFTP both run over which protocol and port?",o:["SSH, TCP 22","TLS, TCP 443","FTP, TCP 21","UDP 69"],a:0,e:"Both are part of the SSH family."},
 {q:"Which command backs up the running config securely to a server?",o:["copy running-config scp://admin@10.0.0.50/r1.cfg","copy running-config tftp://10.0.0.50/r1.cfg","copy startup-config flash:","write network"],a:0,e:"SCP authenticates and encrypts."},
 {q:"In NAT terms, what's 192.168.1.10 when that's a PC's real address on the LAN?",o:["Inside local","Inside global","Outside local","Outside global"],a:0,e:"The inside host's own address, as seen inside."},
 {q:"In NAT terms, what's the public address an inside host appears as on the internet?",o:["Inside global","Inside local","Outside global","Outside local"],a:0,e:"Global is how the world sees it."},
 {q:"Which NAT type lets 200 PCs share one public IP?",o:["PAT (overload)","Static NAT","Dynamic NAT","NAT64"],a:0,e:"Ports keep the sessions apart."},
 {q:"A web server at 192.168.1.100 must be reachable at 203.0.113.10. Which command?",o:["ip nat inside source static 192.168.1.100 203.0.113.10","ip nat inside source list 1 interface g0/0/0 overload","ip nat outside source static 203.0.113.10 192.168.1.100","ip nat pool WEB 203.0.113.10 203.0.113.10"],a:0,e:"Static inside source NAT."},
 {q:"PAT is configured but no translations appear. The ACL and NAT rule look right. What's a likely cause?",o:["ip nat inside and outside are on the wrong interfaces","The ACL is numbered","overload is present","The router has a default route"],a:0,e:"Translation only happens when traffic goes from an inside to an outside interface."},
 {q:"Dynamic NAT has a pool of 5 public addresses. What happens to the 6th host?",o:["It can't get out until a translation times out","It shares an address","It uses the interface address","It gets an APIPA address"],a:0,e:"Without overload, it's one to one."},
 {q:"Which command shows current NAT entries?",o:["show ip nat translations","show nat","show ip nat pool","debug ip nat"],a:0,e:"show ip nat translations lists inside and outside addresses."},
 {q:"What does the overload keyword do?",o:["Turns on PAT","Increases the pool","Allows static NAT","Logs translations"],a:0,e:"Overload means port translation."},
 {q:"Which DNS record maps a name to an IPv6 address?",o:["AAAA","A","PTR","CNAME"],a:0,e:"Quad-A is IPv6."},
 {q:"Which DNS record tells senders where to deliver a domain's email?",o:["MX","TXT","NS","SOA"],a:0,e:"Mail exchanger, with a preference value."},
 {q:"Which record supports reverse lookups?",o:["PTR","A","CNAME","NS"],a:0,e:"PTR maps an address to a name."},
 {q:"Which record makes shop.corp.com an alias of www.corp.com?",o:["CNAME","A","MX","PTR"],a:0,e:"Canonical name."},
 {q:"Which transport does a normal DNS query use?",o:["UDP 53","TCP 80","UDP 67","TCP 25"],a:0,e:"UDP 53, falling back to TCP for big answers."},
 {q:"Who walks from the root to the authoritative server for a client?",o:["The recursive resolver","The client","The root server","The authoritative server"],a:0,e:"The client asks one question; the resolver does the work."},
 {q:"Which command tells a router which DNS servers to use?",o:["ip name-server","ip dns server","ip domain name","ip host"],a:0,e:"ip name-server lists up to six servers."},
 {q:"A router hangs for seconds after a typo in privileged mode. What causes it?",o:["IOS is trying to resolve the typo as a hostname","CPU overload","SSH timeout","A broadcast storm"],a:0,e:"no ip domain lookup stops it in labs."},
 {q:"Two offices need a permanent encrypted link between their routers. Which VPN?",o:["Site-to-site IPsec","Remote access","SSL portal","GRE without IPsec"],a:0,e:"Gateway to gateway."},
 {q:"Which IPsec protocol encrypts the payload?",o:["ESP","AH","IKE","GRE"],a:0,e:"AH only authenticates."},
 {q:"Which port does IKE use?",o:["UDP 500","TCP 443","IP protocol 50","UDP 1701"],a:0,e:"UDP 500, and UDP 4500 for NAT traversal."},
 {q:"Why run GRE over IPsec?",o:["To carry multicast and routing protocol traffic through the tunnel","To make it faster","To avoid encryption","To replace IKE"],a:0,e:"Plain IPsec only carries unicast."},
 {q:"Which IPsec mode adds a new IP header and encrypts the entire original packet?",o:["Tunnel mode","Transport mode","Aggressive mode","Main mode"],a:0,e:"Tunnel mode is used for site-to-site."},
 {q:"How does a router process ACL lines?",o:["Top to bottom, first match wins","Best match wins","All lines, last match wins","Deny lines first"],a:0,e:"Order matters."},
 {q:"An ACL has 'deny tcp any any eq 23' and nothing else. What happens to web traffic?",o:["Denied by the implicit deny","Permitted","Logged","Only HTTPS is allowed"],a:0,e:"Every ACL ends with an implicit deny any."},
 {q:"What does a standard ACL match on?",o:["Source address only","Destination only","Source and destination ports","Protocol"],a:0,e:"Standard ACLs only look at the source."},
 {q:"Where should an extended ACL usually be applied?",o:["Close to the source","Close to the destination","On every router","On the core"],a:0,e:"It can be precise, so drop unwanted traffic early."},
 {q:"Where should a standard ACL usually be applied?",o:["Close to the destination","Close to the source","On the ISP router","On the switch"],a:0,e:"It can't see the destination, so close to the source would block too much."},
 {q:"Which wildcard mask matches 172.16.32.0/20?",o:["0.0.15.255","0.0.16.255","255.255.240.0","0.0.31.255"],a:0,e:"Invert 255.255.240.0."},
 {q:"Which addresses does 10.1.1.0 0.0.0.7 match?",o:["10.1.1.0 to 10.1.1.7","10.1.1.0 only","10.1.1.0 to 10.1.1.255","10.1.1.7 only"],a:0,e:"Three host bits are don't-care."},
 {q:"Which is equivalent to 'host 192.168.5.5'?",o:["192.168.5.5 0.0.0.0","192.168.5.5 255.255.255.255","192.168.5.0 0.0.0.255","any"],a:0,e:"A zero wildcard matches one address."},
 {q:"Which extended ACL line blocks Telnet from 10.1.1.0/24 to any destination?",o:["deny tcp 10.1.1.0 0.0.0.255 any eq 23","deny udp 10.1.1.0 0.0.0.255 any eq 23","deny tcp any 10.1.1.0 0.0.0.255 eq 23","deny ip 10.1.1.0 0.0.0.255 any eq telnet"],a:0,e:"Telnet is TCP 23, and the source comes first."},
 {q:"How many ACLs can you apply to one interface?",o:["One per direction per protocol","One total","Unlimited","Two per protocol in each direction"],a:0,e:"One inbound and one outbound for IPv4."},
 {q:"Which numbers are extended IPv4 ACLs?",o:["100–199","1–99","1300–1999","200–299"],a:0,e:"Also 2000–2699."},
 {q:"What does DHCP snooping do on an untrusted port?",o:["Drops DHCP Offers and Acks arriving there","Drops all DHCP","Allows only one MAC","Shuts the port"],a:0,e:"Clients can ask, but servers can't answer from there."},
 {q:"Which port should be trusted for DHCP snooping?",o:["The uplink toward the real DHCP server","Every access port","Ports with phones","None"],a:0,e:"Only where legitimate server replies come from."},
 {q:"Which feature stops ARP spoofing?",o:["Dynamic ARP Inspection","Port security","Storm control","BPDU Guard"],a:0,e:"DAI validates ARP against the snooping bindings."},
 {q:"What does DAI rely on to know which IP belongs to which MAC?",o:["The DHCP snooping binding table","The MAC address table","CDP","The routing table"],a:0,e:"Turn on snooping first."},
 {q:"Which port security violation mode drops and logs bad frames but keeps the port up?",o:["restrict","protect","shutdown","sticky"],a:0,e:"Protect is silent; shutdown err-disables."},
 {q:"switchport port-security fails with 'Command rejected: is a dynamic port'. What's needed?",o:["switchport mode access first","no shutdown","A voice VLAN","spanning-tree portfast"],a:0,e:"Port security needs a static mode."},
 {q:"What does sticky MAC learning do?",o:["Adds learned MACs to the running config","Makes MACs permanent in hardware","Shares MACs across switches","Disables aging"],a:0,e:"Save the config to keep them after a reload."},
 {q:"Which feature drops rogue IPv6 Router Advertisements from host ports?",o:["RA guard","DHCP snooping","DAI","Root guard"],a:0,e:"RA guard."},
 {q:"Which feature limits broadcast traffic to a percentage of a port's bandwidth?",o:["Storm control","Port security","DAI","QoS trust"],a:0,e:"storm-control broadcast level."}
];

registerModule({
  id:"svc",slug:"services",title:"Network Services and Security",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["pwtypes","aaa","xfer","natterms","pat","natmini","dnsres","dnsrec","vpntype","ike","wild","aclorder","aclplace","snoop","l2atk"],
  viz(){
revealViz($("#viz-pwtypes"),{title:"What's in the running config? Password types",cols:3,done:"Learned the password types",items:[
  ["Type 0","enable password cisco","Plain text. Anyone who sees the config or a backup sees the password."],
  ["Type 7","password 7 0822455D0A16","service password-encryption applies this weak reversible scramble. Free websites decode it instantly. It only stops someone reading over your shoulder."],
  ["Type 5","secret 5 $1$mERr$…","MD5 with a salt. Was the enable secret default for years; now considered weak against cracking."],
  ["Type 8","secret 8 $8$…","PBKDF2 with SHA-256. Strong. Ask for it with enable algorithm-type sha256 secret."],
  ["Type 9","secret 9 $9$…","scrypt. The strongest and the default on current IOS XE for enable secret and username secret."],
  ["password vs secret","username admin secret …","Always use secret. If both enable password and enable secret exist, the secret is used and the password ignored."]]});
sortViz($("#viz-aaa"),{title:"TACACS+ or RADIUS?",bins:{tac:"TACACS+",rad:"RADIUS",both:"Both"},
  items:[["Encrypts the entire packet body","tac","RADIUS hides only the password."],["Uses TCP port 49","tac","Reliable transport."],["Uses UDP 1812 and 1813","rad","Authentication and accounting."],["Open IETF standard","rad","TACACS+ came from Cisco (now RFC 8907 informational)."],["Per-command authorization for admins on routers","tac","It separates authorization from authentication."],["802.1X for wired and wireless users","rad","The usual choice for network access."],["Supported by Cisco ISE","both","ISE speaks both."],["Provides accounting records","both","Both can log what users did."]],done:"Sorted TACACS+ and RADIUS"});
sortViz($("#viz-xfer"),{title:"Secure or not?",bins:{sec:"Encrypted and authenticated",no:"Insecure"},
  items:[["SCP","sec","Over SSH."],["SFTP","sec","Over SSH."],["TFTP","no","No login, no encryption."],["FTP","no","Clear-text login."],["FTPS","sec","FTP inside TLS."],["Telnet","no","Clear text."],["SSH","sec","TCP 22, encrypted."],["HTTP","no","Clear text."],["HTTPS","sec","TLS."]],done:"Sorted secure and insecure protocols"});
revealViz($("#viz-natterms"),{title:"The four NAT addresses: PC1 (192.168.1.10) browses to 93.184.216.34",cols:2,done:"Learned the NAT terms",items:[
  ["Inside local","192.168.1.10","PC1's real address, the one configured on PC1. Inside means it's our host; local means as seen from our side."],
  ["Inside global","203.0.113.2","What PC1 looks like on the internet: the public address R1 translates it to."],
  ["Outside global","93.184.216.34","The web server's real public address, as it exists out there."],
  ["Outside local","93.184.216.34","How the web server appears to our inside hosts. Usually the same as outside global unless you also translate outside addresses."]]});

/* ---- PAT table animation ---- */
(function(){
  const el=$("#viz-pat");const H=[["PC1","192.168.1.10"],["PC2","192.168.1.11"],["PC3","192.168.1.12"]];const D=[["93.184.216.34",443,"web"],["8.8.8.8",53,"DNS"],["151.101.1.69",443,"web"]];
  const rows=[];let next=1024;
  el.innerHTML=`<div class="viz-title">PAT in action: three PCs, one public address (203.0.113.2)</div><div class="chips">${H.map((h,i)=>D.map((d,k)=>`<button class="chip" data-h="${i}" data-d="${k}">${h[0]} → ${d[2]} ${d[0]}</button>`).join("")).join("")}</div>
  <div class="viz-scroll"><table class="rt pat-t"></table></div><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn" data-a="clr">clear ip nat translation *</button><span class="grow"></span></div>`;
  function draw(msg){$(".pat-t",el).innerHTML=`<tr><th>Pro</th><th>Inside global</th><th>Inside local</th><th>Outside global</th></tr>`+(rows.map((r,i)=>`<tr class="${i===rows.length-1?"hit":""}"><td>${r.p}</td><td class="mono">203.0.113.2:${r.g}</td><td class="mono">${r.l}:${r.lp}</td><td class="mono">${r.o}:${r.op}</td></tr>`).join("")||`<tr><td colspan="4" class="s-small">No translations yet.</td></tr>`);
    $(".grow",el).textContent=`${rows.length} translations`;if(msg)$(".caption",el).innerHTML=msg}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-h]");if(e.target.closest('[data-a="clr"]')){rows.length=0;draw("Dynamic translations cleared. Existing sessions break and must reconnect.");return}if(!b)return;
    const h=H[+b.dataset.h],d=D[+b.dataset.d];const lp=49152+Math.floor(Math.random()*16000);let g=lp;const clash=rows.some(r=>r.g===g);if(clash)g=next++;
    rows.push({p:d[1]===53?"udp":"tcp",g,l:h[1],lp,o:d[0],op:d[1]});
    draw(`${h[0]} opens a session from port ${lp}. R1 rewrites the source to <b>203.0.113.2:${g}</b>${clash?` (port ${lp} was already in use, so R1 picked a free one)`:" and keeps the original port when it's free"}. Replies to that port are translated back to ${h[1]}:${lp}.`);
    if(new Set(rows.map(r=>r.l)).size===3&&rows.length>=4)award("viz:pat",20,"Watched PAT share one address")});
  draw("Open some connections. Every inside host leaves with the same public IP; the port number tells R1 where each reply belongs.");
})();
iosViz($("#viz-natmini"),{title:"Mini lab: publish a web server with static NAT",scenario:"WEB (192.168.1.100) must be reachable from the internet at 203.0.113.10. G0/0/1 faces the LAN and G0/0/0 faces the ISP.",
  devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","ISP:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"WEB",ip:"192.168.1.100",gw:"192.168.1.1",at:"SW1:g1/0/2"}],
  boot:{R1:["interface g0/0/0","ip address 203.0.113.2 255.255.255.248","no shutdown","interface g0/0/1","ip address 192.168.1.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],ISP:["interface g0/0/0","ip address 203.0.113.1 255.255.255.248","no shutdown"]},
  consoles:["R1"],startMode:"priv",topo:{WEB:[80,70],SW1:[220,70],R1:[370,70],ISP:[520,70]},topoH:140,
  tasks:[{t:"Mark G0/0/1 as NAT inside and G0/0/0 as NAT outside",hint:"configure terminal\ninterface g0/0/1\n ip nat inside\ninterface g0/0/0\n ip nat outside",check:(w,D)=>D.R1.ifs["GigabitEthernet0/0/1"].nat==="inside"&&D.R1.ifs["GigabitEthernet0/0/0"].nat==="outside"},
    {t:"Map 192.168.1.100 to 203.0.113.10 permanently",hint:"ip nat inside source static 192.168.1.100 203.0.113.10",check:(w,D)=>D.R1.nat.statics.some(s=>s.local===IOS.ip4("192.168.1.100")&&s.global===IOS.ip4("203.0.113.10"))},
    {t:"Check with show ip nat translations",hint:"do show ip nat translations",check:(w,D,S)=>S.R1.hist.some(h=>/sh\S* ip nat tr/i.test(h))}],
  solution:"configure terminal\ninterface g0/0/1\n ip nat inside\ninterface g0/0/0\n ip nat outside\nexit\nip nat inside source static 192.168.1.100 203.0.113.10\ndo show ip nat translations",
  success:"A static entry appears even before any traffic flows, which is how you tell it from a dynamic one."},"natmini",40,"Published a server with static NAT");
seqViz($("#viz-dnsres"),{title:"Resolving www.example.com",left:"Laptop + resolver",right:"DNS hierarchy",intro:"The laptop has never visited this site. Press Next step.",steps:[
  {dir:"r",label:"Query: www.example.com A?",sub:"laptop → resolver 10.0.0.53, UDP 53",text:"The laptop's stub resolver asks the configured DNS server one recursive question and waits."},
  {dir:"r",label:"Ask a root server",sub:"resolver → . (root)",text:"The resolver doesn't have it cached, so it starts at a root server."},
  {dir:"l",label:"Referral: ask .com",sub:"NS records for the .com TLD",text:"The root doesn't know the answer but knows who runs .com."},
  {dir:"r",label:"Ask the .com TLD",sub:"resolver → a.gtld-servers.net",text:"The resolver asks a .com server."},
  {dir:"l",label:"Referral: ask example.com's NS",sub:"NS records for example.com",text:"The TLD points to the domain's authoritative servers."},
  {dir:"r",label:"Ask the authoritative server",sub:"resolver → ns1.example.com",text:"Finally, the server that holds the zone."},
  {dir:"l",label:"Answer: 93.184.216.34, TTL 3600",sub:"authoritative answer",text:"The resolver caches the answer for the TTL and returns it to the laptop. The next person who asks gets it instantly from cache."}],
  end:"One recursive query from the client, several iterative queries from the resolver."});
sortViz($("#viz-dnsrec"),{title:"Which record do you need?",bins:{a:"A / AAAA",cname:"CNAME",mx:"MX",ptr:"PTR",txt:"TXT"},
  items:[["Point www.corp.com at 203.0.113.80","a","An A record."],["Point www.corp.com at 2001:db8::80","a","An AAAA record."],["Make shop.corp.com another name for www.corp.com","cname","An alias."],["Route email for corp.com to mail1 and mail2","mx","With preference values."],["Make 203.0.113.80 resolve back to www.corp.com for logging","ptr","Reverse lookup."],["Publish an SPF policy listing which servers may send corp.com mail","txt","SPF lives in TXT."],["Prove domain ownership to a cloud provider","txt","Verification tokens."]],done:"Picked every DNS record"});
sortViz($("#viz-vpntype"),{title:"Site-to-site or remote access?",bins:{s2s:"Site-to-site",ra:"Remote access"},
  items:[["Branch router to HQ firewall, always up","s2s","Gateway to gateway."],["Sales rep on hotel Wi-Fi","ra","A client on the laptop."],["Users install Cisco Secure Client","ra","Client software."],["Users don't know the VPN exists","s2s","The gateways do the work."],["A DMVPN hub with 50 spokes","s2s","Many sites, automatic tunnels."],["Clientless access through a browser portal","ra","TLS remote access."]],done:"Sorted VPN types"});
stepViz($("#viz-ike"),{title:"Building an IPsec tunnel",done:"Walked through IPsec setup",steps:[
  ["Interesting traffic","A packet from HQ's LAN to the branch LAN matches the crypto ACL, so R1 needs a tunnel."],
  ["IKE phase 1","R1 and R2 talk on UDP 500. They agree on encryption, hashing, authentication (pre-shared key or certificates) and a Diffie-Hellman group, then build a protected channel (the IKE SA)."],
  ["IKE phase 2","Inside that channel they negotiate the IPsec SAs: ESP with AES and SHA, tunnel mode, and which traffic is protected. There's one SA in each direction."],
  ["Data flows","Each packet is wrapped in ESP (IP protocol 50) with a new outer IP header, encrypted and authenticated. If NAT is in the path, ESP rides inside UDP 4500."],
  ["Rekey and teardown","SAs have lifetimes. Before they expire, new keys are negotiated so traffic never stops."]],
  end:"Phase 1 protects the negotiation, phase 2 protects the data."});

/* ---- wildcard calculator ---- */
(function(){
  const el=$("#viz-wild");const seen=new Set();
  const toN=s=>s.split(".").reduce((a,o)=>a*256+ +o,0)>>>0,toS=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
  el.innerHTML=`<div class="viz-title">Wildcard calculator</div><div class="dtp-g"><label class="rf"><span>Address</span><input class="w-a mono" value="172.16.32.0" autocomplete="off"></label><label class="rf"><span>Wildcard</span><input class="w-w mono" value="0.0.15.255" autocomplete="off"></label></div>
  <div class="chips">${[["172.16.32.0","0.0.15.255"],["10.1.1.5","0.0.0.0"],["192.168.10.0","0.0.0.255"],["192.168.10.64","0.0.0.63"],["10.0.0.0","0.255.255.255"],["192.168.1.1","0.0.0.254"]].map(([a,w])=>`<button class="chip mono" data-a="${a}" data-w="${w}">${a} ${w}</button>`).join("")}</div><div class="kv"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const a=$(".w-a",el).value.trim(),wc=$(".w-w",el).value.trim();const v=s=>/^\d{1,3}(\.\d{1,3}){3}$/.test(s)&&s.split(".").every(o=>+o<256);if(!v(a)||!v(wc)){$(".caption",el).textContent="Enter an address and a wildcard in dotted decimal.";return}
    const A=toN(a),W=toN(wc);const contig=((W+1)&W)===0;const lo=(A&~W)>>>0,hi=(lo|W)>>>0;const cnt=2**(W.toString(2).split("").filter(x=>x==="1").length);
    $(".kv",el).innerHTML=`<span>Matches</span><b class="mono">${cnt.toLocaleString("en-US")} address${cnt>1?"es":""}</b>${contig?`<span>Range</span><b class="mono">${toS(lo)} – ${toS(hi)}</b><span>Same as</span><b class="mono">${W===0?"host "+a:W===0xffffffff?"any":toS(lo)+"/"+(32-Math.log2(W+1))}</b>`:`<span>Pattern</span><b class="mono">non-contiguous</b>`}`;
    $(".caption",el).innerHTML=contig?(W===0?"A zero wildcard matches exactly one host.":`Inverting the wildcard gives the subnet mask ${toS(~W>>>0)}.`)+(lo!==A?` Note: IOS will store this as <b class="mono">${toS(lo)}</b>, because bits under the wildcard's 1s are ignored.`:""):`The 1 bits aren't contiguous, so this matches a pattern, not a subnet. ${a} ${wc} with a final octet of 254 matches every <b>odd</b> address in the range: a classic exam trick.`;
    seen.add(wc);if(seen.size>=4)award("viz:wild",20,"Calculated wildcard masks")}
  el.addEventListener("input",draw);el.addEventListener("click",e=>{const b=e.target.closest("[data-w]");if(!b)return;$(".w-a",el).value=b.dataset.a;$(".w-w",el).value=b.dataset.w;draw()});draw();
})();

/* ---- ACL top-down evaluator ---- */
(function(){
  const el=$("#viz-aclorder");
  const ACL=[[10,"permit","tcp","192.168.20.0/24","10.1.1.10/32",443],[20,"deny","ip","192.168.20.0/24","10.1.1.0/24",null],[30,"permit","udp","any","any",53],[40,"permit","tcp","192.168.20.0/24","any",443]];
  const PK=[["Guest → server 10.1.1.10, HTTPS","192.168.20.7","10.1.1.10","tcp",443],["Guest → server 10.1.1.10, SSH","192.168.20.7","10.1.1.10","tcp",22],["Guest → 8.8.8.8, DNS","192.168.20.7","8.8.8.8","udp",53],["Guest → news site, HTTPS","192.168.20.7","151.101.1.69","tcp",443],["Guest → news site, HTTP","192.168.20.7","151.101.1.69","tcp",80],["Guest → printer 10.1.1.40, IPP","192.168.20.7","10.1.1.40","tcp",631]];
  const toN=s=>s.split(".").reduce((a,o)=>a*256+ +o,0)>>>0;const inP=(ip,p)=>{if(p==="any")return true;const [n,l]=p.split("/");const m=l==="0"?0:(0xffffffff<<(32-l))>>>0;return ((toN(ip)&m)>>>0)===((toN(n)&m)>>>0)};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Run packets through GUEST-IN</div><table class="rt acl-t"></table><div class="chips">${PK.map((p,i)=>`<button class="chip" data-i="${i}">${p[0]}</button>`).join("")}</div><div class="caption" aria-live="polite">Pick a packet to see which line it hits.</div><div class="rv-prog s-small"></div>`;
  function draw(hit,pi){$(".acl-t",el).innerHTML=`<tr><th>Seq</th><th>Rule</th></tr>`+ACL.map((r,i)=>`<tr class="${hit===i?(r[1]==="permit"?"win":"hit"):""}"><td class="mono">${r[0]}</td><td class="mono">${r[1]} ${r[2]} ${r[3]==="any"?"any":r[3].replace("/24"," 0.0.0.255").replace("/32","").replace(/^/,r[3].endsWith("/32")?"host ":"")} ${r[4]==="any"?"any":(r[4].endsWith("/32")?"host "+r[4].replace("/32",""):r[4].replace("/24"," 0.0.0.255"))}${r[5]?" eq "+r[5]:""}</td></tr>`).join("")+`<tr class="${hit===-1?"hit":""}"><td class="mono">—</td><td class="mono s-small">(implicit) deny ip any any</td></tr>`;
    $(".rv-prog",el).textContent=`${seen.size} of ${PK.length} packets tested`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const p=PK[+b.dataset.i];seen.add(+b.dataset.i);
    const hit=ACL.findIndex(r=>(r[2]==="ip"||r[2]===p[3])&&inP(p[1],r[3])&&inP(p[2],r[4])&&(r[5]==null||r[5]===p[4]));draw(hit);
    $(".caption",el).innerHTML=hit<0?`<span class="status-bad">Denied by the implicit deny.</span> No line matched, so the invisible last line drops it.`:`Line ${ACL[hit][0]} matches first, so the packet is <span class="${ACL[hit][1]==="permit"?"status-good":"status-bad"}">${ACL[hit][1]==="permit"?"permitted":"denied"}</span>.${hit===0?" Line 20 would have denied it, but order matters: line 10 is checked first.":""}${hit===1&&p[4]===22?" Only HTTPS was carved out above it.":""}`;
    if(seen.size===PK.length)award("viz:aclorder",30,"Traced packets through an ACL")});draw();
})();
quizViz($("#viz-aclplace"),{title:"Where does the ACL go?",done:"Placed every ACL correctly",qs:[
  ["Block hosts in 192.168.20.0/24 (behind R2) from reaching the HR server behind R3, with a standard ACL.",["Outbound on R3's interface toward the HR server","Inbound on R2's LAN interface","Outbound on R2's WAN interface","On the core switch"],0,"A standard ACL only sees the source, so place it near the destination or you'd block 192.168.20.0 from everything."],
  ["Block Telnet from the guest LAN to anywhere with an extended ACL.",["Inbound on the router interface facing the guest LAN","Outbound on the internet interface","Inbound on the ISP router","On every VTY line"],0,"Extended ACLs go close to the source so the traffic dies early."],
  ["Only 10.0.99.0/24 may SSH to the router itself.",["access-class on line vty 0 4","ip access-group on every interface","ip access-group out on the LAN","A route map"],0,"Use access-class for traffic to the device's VTY lines."],
  ["An ACL denies 10.1.1.0/24, then permits any. You need to also allow 10.1.1.5. What do you do?",["Insert 'permit host 10.1.1.5' with a sequence number before the deny","Add it at the end","Apply a second ACL in the same direction","Use a wildcard of 255.255.255.255"],0,"First match wins, so the permit must come first. Named and numbered ACLs both accept sequence numbers."]]});
stepViz($("#viz-snoop"),{title:"DHCP snooping feeds Dynamic ARP Inspection",done:"Followed snooping and DAI",steps:[
  ["Legit lease","PC1 on Gi1/0/5 (untrusted) gets 10.1.10.21 from the real server, whose replies arrive on trusted Gi1/0/1. Snooping records: MAC 3c52.821a.774b, IP 10.1.10.21, VLAN 10, Gi1/0/5."],
  ["Rogue server","An attacker on Gi1/0/9 runs a DHCP server handing out itself as the gateway. Its Offers arrive on an untrusted port and are dropped."],
  ["ARP spoof attempt","The attacker sends gratuitous ARP saying 10.1.10.1 (the gateway) is at its own MAC, hoping to intercept traffic."],
  ["DAI checks","DAI looks up 10.1.10.1 in the binding table for Gi1/0/9. The attacker's port has no binding for that IP, so the ARP is dropped and logged (%SW_DAI-4-DHCP_SNOOPING_DENY)."],
  ["Result","Users keep the right gateway. Static-IP devices need ARP ACLs or trusted ports, or DAI drops them too."]]});
sortViz($("#viz-l2atk"),{title:"Match the attack to the defense",bins:{snoop:"DHCP snooping",dai:"DAI",ps:"Port security",storm:"Storm control",ra:"RA guard",dtp:"Disable DTP / native VLAN"},
  items:[["A user plugs in a home router that hands out 192.168.0.x addresses","snoop","Untrusted ports can't send DHCP Offers."],["An attacker poisons ARP caches to sit in the middle","dai","ARP is checked against bindings."],["A tool floods the switch with thousands of fake MACs","ps","Limit MACs per port."],["DHCP starvation: thousands of Discovers from random MACs","ps","Port security (plus snooping rate limits)."],["A looped cable floods the access layer with broadcasts","storm","Drop broadcast above a threshold."],["A laptop advertises itself as the IPv6 default router","ra","RA guard on host ports."],["An attacker negotiates a trunk and double-tags frames into another VLAN","dtp","nonegotiate and an unused native VLAN."]],done:"Matched every Layer 2 attack"});
  },
  sims:[
    {id:"sshlab",type:"ios",title:"Harden remote management",lab:{
      scenario:"EDGE1 still has factory settings: Telnet with no password, no SSH. Lock it down so admins can only reach it with SSH from the management subnet 10.0.99.0/24, then back up the config securely to the SCP server 10.0.99.50.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"BACKUP",ip:"10.0.99.50",gw:"10.0.99.1",at:"SW1:g1/0/2",services:["scp"]}],
      boot:{R1:["interface g0/0/1","ip address 10.0.99.1 255.255.255.0","no shutdown","line vty 0 4","transport input all"]},
      consoles:["R1"],topo:{R1:[180,70],SW1:[340,70],BACKUP:[500,70]},topoH:140,
      tasks:[
        {t:"Set hostname EDGE1 and domain name corp.local",hint:"hostname EDGE1\nip domain name corp.local",check:(w,D)=>D.R1.host==="EDGE1"&&/^corp\.local$/i.test(D.R1.domain||"")},
        {t:"Generate 2048-bit RSA keys and require SSH version 2",hint:"crypto key generate rsa modulus 2048\nip ssh version 2",check:(w,D)=>D.R1.rsa>=2048&&D.R1.sshv===2},
        {t:"Create user admin with privilege 15 and a secret, and set an enable secret",hint:"username admin privilege 15 secret Adm1n!Pass\nenable secret Str0ng!Enable",check:(w,D)=>D.R1.users.admin?.secret&&D.R1.users.admin.priv===15&&!!D.R1.secret},
        {t:"Standard ACL 10 permits only 10.0.99.0/24",hint:"access-list 10 permit 10.0.99.0 0.0.0.255",check:(w,D)=>{const A=D.R1.acls["10"];return A&&A.type==="standard"&&IOS.aclEval(A,{src:IOS.ip4("10.0.99.7")}).act==="permit"&&IOS.aclEval(A,{src:IOS.ip4("10.0.50.7")}).act==="deny"}},
        {t:"VTY lines 0–4: local login, SSH only, ACL 10, and a 5-minute idle timeout",hint:"line vty 0 4\n login local\n transport input ssh\n access-class 10 in\n exec-timeout 5 0",check:(w,D)=>{const v=D.R1.lines.vty;return v.local&&v.transport==="ssh"&&v.acl==="10"&&v.timeout&&v.timeout[0]===5}},
        {t:"Copy the running config to scp://admin@10.0.99.50/edge1.cfg",hint:"end\ncopy running-config scp://admin@10.0.99.50/edge1.cfg",check:w=>(w.transfers||[]).some(t=>t.proto==="scp"&&/10\.0\.99\.50/.test(t.host)&&t.up)}],
      solution:"enable\nconfigure terminal\nhostname EDGE1\nip domain name corp.local\ncrypto key generate rsa modulus 2048\nip ssh version 2\nusername admin privilege 15 secret Adm1n!Pass\nenable secret Str0ng!Enable\naccess-list 10 permit 10.0.99.0 0.0.0.255\nline vty 0 4\n login local\n transport input ssh\n access-class 10 in\n exec-timeout 5 0\nend\ncopy running-config scp://admin@10.0.99.50/edge1.cfg",
      success:"Encrypted logins with named accounts, only from the management subnet, and an encrypted backup."}},
    {id:"natlab",type:"ios",title:"Get the office online with PAT",lab:{
      scenario:"The office LAN is 192.168.1.0/24 behind R1. The ISP gave you one address, 203.0.113.2/30, on G0/0/0. Let every PC browse the internet through it, and leave the printer (192.168.1.200) off the internet entirely.",
      devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/0","ISP:g0/0/0"],["R1:g0/0/1","SW1:g1/0/1"]],
      hosts:[{name:"PC1",ip:"192.168.1.10",gw:"192.168.1.1",at:"SW1:g1/0/2"},{name:"PC2",ip:"192.168.1.11",gw:"192.168.1.1",at:"SW1:g1/0/3"},{name:"PRN",ip:"192.168.1.200",gw:"192.168.1.1",at:"SW1:g1/0/4"}],
      traffic:[{from:"PC1",to:"93.184.216.34",port:443},{from:"PC2",to:"151.101.1.69",port:443},{from:"PC1",to:"8.8.8.8",port:53,proto:"udp"},{from:"PRN",to:"52.10.10.10",port:443}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 192.168.1.1 255.255.255.0","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],ISP:["interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255"]},
      consoles:["R1"],topo:{SW1:[220,70],R1:[380,70],ISP:[530,70],PC1:[80,20],PC2:[80,90],PRN:[80,160]},topoH:200,
      tasks:[
        {t:"Mark the LAN interface inside and the ISP interface outside",hint:"interface g0/0/1\n ip nat inside\ninterface g0/0/0\n ip nat outside",check:(w,D)=>D.R1.ifs["GigabitEthernet0/0/1"].nat==="inside"&&D.R1.ifs["GigabitEthernet0/0/0"].nat==="outside"},
        {t:"Create a standard ACL (number or name your choice) that denies the printer and permits the rest of 192.168.1.0/24",hint:"access-list 1 deny host 192.168.1.200\naccess-list 1 permit 192.168.1.0 0.0.0.255",check:(w,D)=>Object.values(D.R1.acls).some(A=>A.type==="standard"&&IOS.aclEval(A,{src:IOS.ip4("192.168.1.200")}).act==="deny"&&IOS.aclEval(A,{src:IOS.ip4("192.168.1.10")}).act==="permit")},
        {t:"Overload the ACL onto G0/0/0's address",hint:"ip nat inside source list 1 interface g0/0/0 overload",check:(w,D)=>D.R1.nat.rules.some(r=>r.oif==="GigabitEthernet0/0/0"&&r.overload)},
        {t:"show ip nat translations shows PC1 and PC2 as 203.0.113.2, and no printer",hint:"show ip nat translations",check:(w,D,S)=>{const R=IOS.natRows(w,D.R1);return R.some(r=>r.host==="PC1"&&/^203\.0\.113\.2:/.test(r.ig))&&R.some(r=>r.host==="PC2")&&!R.some(r=>r.host==="PRN")&&S.R1.hist.some(h=>/sh\S* ip nat tr/i.test(h))}}],
      solution:"enable\nconfigure terminal\ninterface g0/0/1\n ip nat inside\ninterface g0/0/0\n ip nat outside\nexit\naccess-list 1 deny host 192.168.1.200\naccess-list 1 permit 192.168.1.0 0.0.0.255\nip nat inside source list 1 interface g0/0/0 overload\nend\nshow ip nat translations",
      success:"Every PC shares 203.0.113.2, told apart by port. The printer never matches the ACL, so it's never translated."}},
    {id:"acllab",type:"ios",title:"Lock down the guest network with ACLs",lab:{
      scenario:"R1 routes for staff (192.168.10.0/24 on G0/0/1), guests (192.168.20.0/24 on G0/0/2), servers (10.1.1.0/24 on G0/0/0) and the internet (G0/0/3). Guests must not reach the servers at all but can use the internet. Only the admin PC (192.168.10.5) may manage R1 remotely.",
      devices:[{name:"R1",kind:"router",ifs:"g0/0/0-3"},{name:"ISP",kind:"router"},{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"},{name:"SW3",kind:"switch"}],
      links:[["R1:g0/0/0","SW3:g1/0/1"],["R1:g0/0/1","SW1:g1/0/1"],["R1:g0/0/2","SW2:g1/0/1"],["R1:g0/0/3","ISP:g0/0/0"]],
      hosts:[{name:"SRV",ip:"10.1.1.10",gw:"10.1.1.1",at:"SW3:g1/0/2"},{name:"ADMIN",ip:"192.168.10.5",gw:"192.168.10.1",at:"SW1:g1/0/2"},{name:"STAFF",ip:"192.168.10.30",gw:"192.168.10.1",at:"SW1:g1/0/3"},{name:"GUEST",ip:"192.168.20.44",gw:"192.168.20.1",at:"SW2:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 10.1.1.1 255.255.255.0","no shutdown","interface g0/0/1","ip address 192.168.10.1 255.255.255.0","no shutdown","interface g0/0/2","ip address 192.168.20.1 255.255.255.0","no shutdown","interface g0/0/3","ip address 203.0.113.2 255.255.255.252","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],ISP:["interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown","interface loopback0","ip address 8.8.8.8 255.255.255.255","ip route 192.168.0.0 255.255.0.0 203.0.113.2","ip route 10.0.0.0 255.0.0.0 203.0.113.2"]},
      consoles:["R1"],topo:{R1:[300,110],SW3:[300,15],SW1:[110,190],SW2:[490,190],ISP:[510,60],SRV:[150,15],ADMIN:[40,250],STAFF:[180,250],GUEST:[490,260]},topoH:290,
      tasks:[
        {t:"Create extended ACL GUEST-IN: deny guests to 10.1.1.0/24, permit everything else",hint:"ip access-list extended GUEST-IN\n deny ip 192.168.20.0 0.0.0.255 10.1.1.0 0.0.0.255\n permit ip any any",check:(w,D)=>{const A=D.R1.acls["GUEST-IN"];return A&&A.type==="extended"&&IOS.aclEval(A,{src:IOS.ip4("192.168.20.44"),dst:IOS.ip4("10.1.1.10"),proto:"tcp",port:443}).act==="deny"&&IOS.aclEval(A,{src:IOS.ip4("192.168.20.44"),dst:IOS.ip4("8.8.8.8"),proto:"udp",port:53}).act==="permit"}},
        {t:"Apply it where it stops guest traffic earliest",hint:"interface g0/0/2\n ip access-group GUEST-IN in",check:(w,D)=>D.R1.ifs["GigabitEthernet0/0/2"].acl.in==="GUEST-IN"},
        {t:"Standard ACL MGMT permits only host 192.168.10.5, applied to the VTY lines",hint:"ip access-list standard MGMT\n permit host 192.168.10.5\nline vty 0 4\n access-class MGMT in",check:(w,D)=>{const A=D.R1.acls.MGMT;return A&&A.type==="standard"&&D.R1.lines.vty.acl==="MGMT"&&IOS.aclEval(A,{src:IOS.ip4("192.168.10.5")}).act==="permit"&&IOS.aclEval(A,{src:IOS.ip4("192.168.10.30")}).act==="deny"}},
        {t:"Verify: the guest can't reach SRV but can reach 8.8.8.8, and staff can still reach SRV",hint:"show access-lists",check:(w,D,S)=>{const H=Object.fromEntries(w.hosts.map(h=>[h.name,h]));return !IOS.ping(w,{host:H.GUEST},H.SRV.ip,4).ok&&IOS.ping(w,{host:H.GUEST},IOS.ip4("8.8.8.8"),4).ok&&IOS.ping(w,{host:H.STAFF},H.SRV.ip,4).ok&&S.R1.hist.some(h=>/sh\S* (ip )?acc/i.test(h))}}],
      solution:"enable\nconfigure terminal\nip access-list extended GUEST-IN\n deny ip 192.168.20.0 0.0.0.255 10.1.1.0 0.0.0.255\n permit ip any any\ninterface g0/0/2\n ip access-group GUEST-IN in\nip access-list standard MGMT\n permit host 192.168.10.5\nline vty 0 4\n access-class MGMT in\nend\nshow access-lists",
      success:"The extended ACL sits at the guest's entry point, and the standard ACL protects the router itself."}},
    {id:"l2seclab",type:"ios",title:"Defend the access switch",lab:{
      scenario:"SW1 serves VLAN 10 users and gets DHCP from R1 through Gi1/0/1. Turn on DHCP snooping and Dynamic ARP Inspection, lock Gi1/0/2 to the two devices at that desk, and limit broadcasts on user ports. Then see what happens when someone plugs in a hub with extra devices.",
      devices:[{name:"SW1",kind:"switch"},{name:"R1",kind:"router"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],
      hosts:[{name:"PC1",dhcp:true,at:"SW1:g1/0/2",mac:"3c52.821a.774b"},{name:"PHONE",dhcp:true,at:"SW1:g1/0/2",mac:"00a1.c0ff.0007"},{name:"PC3",dhcp:true,at:"SW1:g1/0/3"}],
      boot:{R1:["interface g0/0/1","ip address 10.1.10.1 255.255.255.0","no shutdown","ip dhcp excluded-address 10.1.10.1 10.1.10.20","ip dhcp pool USERS","network 10.1.10.0 255.255.255.0","default-router 10.1.10.1"],SW1:["vlan 10","name USERS","interface g1/0/1","switchport mode access","switchport access vlan 10","interface range g1/0/2 - 3","switchport mode access","switchport access vlan 10"]},
      consoles:["SW1"],topo:{R1:[120,70],SW1:[300,70],PC1:[470,20],PHONE:[500,90],PC3:[420,160]},topoH:200,
      events:[{label:"🔌 Plug a hub with two laptops into Gi1/0/2",run:(w)=>{if(w.hub)return "";w.hub=true;w.hosts.push({name:"LAPTOP1",ip:IOS.ip4("10.1.10.66"),len:24,gw:IOS.ip4("10.1.10.1"),at:"SW1:GigabitEthernet1/0/2",mac:"dead.beef.0001"},{name:"LAPTOP2",ip:IOS.ip4("10.1.10.67"),len:24,gw:IOS.ip4("10.1.10.1"),at:"SW1:GigabitEthernet1/0/2",mac:"dead.beef.0002"});return "! Two unknown laptops are now talking through Gi1/0/2."}}],
      tasks:[
        {t:"Enable DHCP snooping for VLAN 10 and trust only the uplink Gi1/0/1",hint:"ip dhcp snooping\nip dhcp snooping vlan 10\ninterface g1/0/1\n ip dhcp snooping trust",check:(w,D)=>D.SW1.snoop.on&&D.SW1.snoop.vlans.some(v=>IOS.listHas(v,10))&&D.SW1.ifs["GigabitEthernet1/0/1"].snoopTrust&&!D.SW1.ifs["GigabitEthernet1/0/2"].snoopTrust},
        {t:"Users still get leases (check show ip dhcp snooping binding)",hint:"do show ip dhcp snooping binding",check:(w,D,S)=>w.hosts.filter(h=>h.dhcp).every(h=>IOS.dhcpFor(w,h).ip!=null)&&D.SW1.snoop.on&&S.SW1.hist.some(h=>/sh\S* ip dhcp sn/i.test(h))},
        {t:"Turn on Dynamic ARP Inspection for VLAN 10 and trust the uplink",hint:"ip arp inspection vlan 10\ninterface g1/0/1\n ip arp inspection trust",check:(w,D)=>D.SW1.dai.some(v=>IOS.listHas(v,10))&&D.SW1.ifs["GigabitEthernet1/0/1"].daiTrust},
        {t:"Gi1/0/2: port security, maximum 2 MACs, sticky learning, violation restrict (a PC and a phone already share this port)",hint:"interface g1/0/2\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict\n switchport port-security\n! Set the maximum before enabling it: two devices already sit on this port.",check:(w,D)=>{const p=D.SW1.ifs["GigabitEthernet1/0/2"].ps;return p&&!p.off&&p.max===2&&p.sticky&&p.viol==="restrict"}},
        {t:"Storm control at 1% broadcast on Gi1/0/2 and Gi1/0/3",hint:"interface range g1/0/2 - 3\n storm-control broadcast level 1.00",check:(w,D)=>["GigabitEthernet1/0/2","GigabitEthernet1/0/3"].every(n=>D.SW1.ifs[n].storm&&parseFloat(D.SW1.ifs[n].storm.level)<=1)},
        {t:"Press 🔌, then confirm with show port-security that violations are counted but Gi1/0/2 stays up",hint:"do show port-security interface g1/0/2",sticky:true,check:(w,D,S)=>{const i=D.SW1.ifs["GigabitEthernet1/0/2"];return w.hub&&!i.err&&(i.psViol||0)>0&&S.SW1.hist.some(h=>/sh\S* port-s/i.test(h))}}],
      solution:"enable\nconfigure terminal\nip dhcp snooping\nip dhcp snooping vlan 10\nip arp inspection vlan 10\ninterface g1/0/1\n ip dhcp snooping trust\n ip arp inspection trust\ninterface g1/0/2\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict\n switchport port-security\ninterface range g1/0/2 - 3\n storm-control broadcast level 1.00\n do show ip dhcp snooping binding\n! Press the 🔌 button, then:\n do show port-security interface g1/0/2",
      success:"Restrict mode dropped and counted the extra laptops' frames while the phone and PC kept working."}},
    {id:"dnssim",title:"Troubleshoot name resolution",type:"choice",
      scenario:"Users at the branch report that 'the internet is down'.",
      steps:[
        ["ping 8.8.8.8 works from a user's PC, but ping www.cisco.com fails with 'could not find host'. Where's the problem?",["Name resolution","Routing","NAT","Layer 1"],0,"IP reachability is fine, so it's DNS."],
        ["ipconfig /all shows DNS server 192.168.1.53. Which tool tests that server directly?",["nslookup www.cisco.com 192.168.1.53","tracert 192.168.1.53","arp -a","netstat -an"],0,"nslookup can query a specific server."],
        ["nslookup times out against 192.168.1.53, but works against 8.8.8.8. Which is the most likely cause?",["The internal DNS server is down or UDP 53 to it is blocked","The PC's gateway is wrong","The client's MAC is blocked","The URL is wrong"],0,"The client can reach the internet, but not its own resolver."],
        ["An ACL on the branch router was changed last night. Which line would explain it?",["deny udp any host 192.168.1.53 eq 53","permit udp any any eq 53","deny tcp any any eq 23","permit icmp any any"],0,"That line blocks DNS queries to the internal server."],
        ["After the fix, intranet.corp.local resolves but files.corp.local returns 'Non-existent domain'. What's missing?",["An A record (or CNAME) for files","A PTR record","An MX record","The SOA"],0,"The server answered: the name just doesn't exist in the zone."]],
      success:"Ping by IP, then by name, then nslookup against a specific server. That isolates DNS in three steps."}
  ],
  badges:[
    ["reader","SV","Services Scholar","Mark all 7 services and security lessons studied",c=>c.allStudied()],
    ["lab","SC","Security Operator","Complete all 15 diagrams in this module",c=>c.vizAll()],
    ["ssh","22","No More Telnet","Pass the device hardening lab",c=>c.passed("sshlab")],
    ["nat","PAT","Overloaded","Pass the PAT lab",c=>c.passed("natlab")],
    ["acl","AC","Implicit Deny","Pass the ACL lab",c=>c.passed("acllab")],
    ["l2","DAI","Trust No Port","Pass the Layer 2 security lab",c=>c.passed("l2seclab")],
    ["wild","WC","Wildcard","Use the wildcard calculator and trace every packet through the ACL",c=>c.earned("viz:wild")&&c.earned("viz:aclorder")],
    ["perfect","SEC","Locked Down","Score 100% on a services quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
