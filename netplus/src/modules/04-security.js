/* ================= Module 4: Network Security (N10-009 Domain 4.0, 14%) ================= */
(function(){
const LESSONS=[
{id:"basics",num:"4.1",title:"Security fundamentals, encryption and PKI",html:`
<h3>The CIA triad</h3>
<ul><li><b>Confidentiality</b>: only authorized people can read the data (encryption, access control).</li><li><b>Integrity</b>: data isn't changed without detection (hashing, digital signatures).</li><li><b>Availability</b>: systems are up when needed (redundancy, DDoS protection, backups).</li></ul>
<h3>Risk vocabulary</h3>
<ul><li><b>Vulnerability</b>: a weakness, such as unpatched firmware.</li><li><b>Threat</b>: something that could exploit it, such as a ransomware gang.</li><li><b>Exploit</b>: the actual method or code that takes advantage of the vulnerability.</li><li><b>Risk</b>: the likelihood and impact of a threat exploiting a vulnerability.</li></ul>
<h3>Encryption</h3>
<p><b>Data in transit</b> is protected with TLS, IPsec, SSH and WPA3. <b>Data at rest</b> is protected with disk or database encryption. Both are expected.</p>
<h3>PKI and certificates</h3>
<p>A <b>public key infrastructure</b> lets you trust a server's public key. A <b>certificate authority (CA)</b> signs certificates. Your device trusts a handful of root CAs, and they vouch for intermediate CAs, which sign server certificates. A <b>self-signed</b> certificate is signed by its own key, so no one vouches for it and browsers show a warning. That's fine in a lab, but a bad idea on production systems.</p>
<div class="viz" id="viz-pki"></div>`},
{id:"iam",num:"4.2",title:"Identity and access management",html:`
<h3>Authentication</h3>
<p><b>Multifactor authentication (MFA)</b> combines factors from different categories. Two passwords are still one factor.</p>
<div class="viz" id="viz-mfa"></div>
<ul>
<li><b>SSO (single sign-on)</b>: sign in once and reach many applications.</li>
<li><b>SAML</b>: an XML standard for passing sign-in assertions from an identity provider to web apps, the basis of much web SSO.</li>
<li><b>LDAP</b>: queries the directory (such as Active Directory) for users and groups. LDAPS secures it with TLS.</li>
<li><b>RADIUS</b>: AAA for network access, such as Wi-Fi and VPN logins. Uses UDP 1812/1813 and encrypts only the password.</li>
<li><b>TACACS+</b>: Cisco AAA for device administration. Uses TCP 49, encrypts the whole payload, and separates authentication, authorization and accounting so each command can be authorized.</li>
<li><b>Time-based authentication</b>: access allowed only during set hours, or one-time codes that expire after 30 seconds (TOTP).</li></ul>
<h3>Authorization</h3>
<p><b>Least privilege</b>: give each account only the access it needs. <b>Role-based access control (RBAC)</b>: permissions attach to roles such as "Help desk" or "Network admin", and users get roles. <b>Geofencing</b> allows or blocks access based on location.</p>`},
{id:"segment",num:"4.3",title:"Compliance, physical security, deception and segmentation",html:`
<h3>Audits and compliance</h3>
<ul><li><b>PCI DSS</b>: rules for anyone who stores, processes or transmits payment card data, including segmenting the cardholder network.</li>
<li><b>GDPR</b>: EU regulation protecting personal data of people in the EU.</li>
<li><b>Data locality</b>: laws that require certain data to stay within a country or region, which affects where cloud data can live.</li></ul>
<h3>Physical security</h3>
<p><b>Cameras</b> deter and record. <b>Locks</b> on doors, racks and cages keep people away from equipment. Badge readers log who entered and when.</p>
<h3>Deception</h3>
<p>A <b>honeypot</b> is a decoy system that looks valuable but holds nothing real. Any connection to it is suspicious. A <b>honeynet</b> is a whole network of decoys. Both waste attackers' time and reveal their methods.</p>
<h3>Segmentation</h3>
<p>Split the network so a compromise in one area can't spread. Keep <b>IoT and IIoT</b> devices, <b>OT systems</b> (SCADA and ICS controlling physical processes), <b>guest</b> users and <b>BYOD</b> personal devices in their own segments, with firewall rules between them.</p>
<div class="viz" id="viz-zones"></div>`},
{id:"l2",num:"4.4",title:"Layer 2 and LAN attacks",html:`
<ul>
<li><b>MAC flooding</b>: the attacker sends thousands of fake source MACs to overflow the switch's MAC table. The switch then floods all frames out every port, like a hub, so the attacker can sniff them. <b>Defense: port security</b> (limit MACs per port).</li>
<li><b>ARP poisoning / ARP spoofing</b>: the attacker sends fake ARP replies claiming the gateway's IP maps to the attacker's MAC, so traffic flows through the attacker (an on-path attack). <b>Defense: dynamic ARP inspection</b> (DAI), which checks ARP against DHCP snooping data.</li>
<li><b>VLAN hopping</b>: reaching a VLAN you shouldn't. <b>Switch spoofing</b> tricks a port into becoming a trunk (via DTP). <b>Double tagging</b> stacks two 802.1Q tags so the outer native-VLAN tag is stripped and the inner one delivers the frame to another VLAN. <b>Defense:</b> hard-set access ports, disable auto-trunking, and use an unused native VLAN.</li>
<li><b>Rogue DHCP server</b>: hands out the attacker's IP as the gateway or DNS. <b>Defense: DHCP snooping</b>, which only allows DHCP offers from trusted ports.</li>
</ul>
<div class="viz" id="viz-l2atk"></div>`},
{id:"attacks",num:"4.5",title:"DoS, DNS, wireless and social engineering attacks",html:`
<ul>
<li><b>DoS / DDoS</b>: overwhelm a service so legitimate users can't reach it. A <b>distributed</b> attack uses thousands of compromised devices (a botnet). Defenses include rate limiting, upstream scrubbing services, CDNs and anycast.</li>
<li><b>DNS poisoning</b>: corrupting a resolver's cache with a false record, so everyone using it is sent to the wrong address. <b>DNS spoofing</b>: answering a victim's query with a forged reply. <b>Defense: DNSSEC</b> and patched resolvers.</li>
<li><b>Rogue access point</b>: an unauthorized AP plugged into the network, often by an employee, that bypasses security. <b>Evil twin</b>: an attacker's AP that copies a legitimate SSID to lure users and capture their traffic or credentials. Defenses include wireless intrusion prevention (WIPS), 802.1X with certificate validation, and port security.</li>
<li><b>On-path attack</b> (formerly man-in-the-middle): the attacker sits between two parties, reading or changing traffic. ARP poisoning and evil twins are common ways in.</li>
<li><b>Social engineering</b>: <b>phishing</b> (fraudulent messages), <b>dumpster diving</b> (searching trash for information), <b>shoulder surfing</b> (watching someone type) and <b>tailgating</b> (following someone through a secure door).</li>
<li><b>Malware</b>: viruses, worms, ransomware, trojans and other malicious software. Worms spread across the network on their own.</li>
</ul>
<div class="viz" id="viz-ddos"></div>`},
{id:"harden",num:"4.6",title:"Device hardening and network access control",html:`
<h3>Device hardening</h3>
<ul><li>Disable <b>unused switch ports</b> and put them in an unused VLAN.</li><li>Disable <b>unused services</b> such as Telnet, HTTP management and CDP/LLDP on edge ports.</li><li><b>Change default passwords</b> and use unique admin accounts.</li><li>Keep firmware patched and send logs to a central server.</li></ul>
<h3>Network access control (NAC)</h3>
<ul><li><b>Port security</b>: limit the number of MAC addresses on a port, or lock it to known MACs ("sticky"). A violation can shut the port.</li>
<li><b>802.1X</b>: port-based authentication. The <b>supplicant</b> (the device) proves its identity to the <b>authenticator</b> (switch or AP), which checks with the <b>authentication server</b> (RADIUS). The port stays closed until it succeeds.</li>
<li><b>MAC filtering</b>: allow only listed MAC addresses. Easy to bypass, because MAC addresses can be spoofed.</li></ul>
<div class="viz" id="viz-dot1x"></div>
<h3>Key management</h3>
<p>Encryption keys need a life cycle: generate them securely, store them protected (for example in a hardware security module), rotate them regularly and revoke them when compromised.</p>`},
{id:"rules",num:"4.7",title:"Firewall rules, filtering and security zones",html:`
<h3>Access control lists</h3>
<p>An <b>ACL</b> is an ordered list of permit and deny rules matching on source, destination, protocol and port. The device checks rules <b>top-down</b> and stops at the <b>first match</b>. Anything that matches no rule hits the <b>implicit deny</b> at the end. So put specific rules above general ones.</p>
<div class="viz" id="viz-acl"></div>
<h3>Filtering</h3>
<p><b>URL filtering</b> blocks websites by address or category. <b>Content filtering</b> inspects what's being transferred, such as file types or keywords.</p>
<h3>Security zones</h3>
<p>Firewalls group interfaces into zones by trust. The internal LAN is <b>trusted</b> and the internet is <b>untrusted</b>. A <b>screened subnet</b> (formerly called a DMZ) sits between them for public-facing servers like web and mail. Internet users can reach it, but it can't freely reach the internal network.</p>`}
];

const C=[
 ["Confidentiality","Only authorized people can read data"],["Integrity","Data isn't altered without detection"],["Availability","Systems are up when needed"],["Vulnerability","A weakness that could be exploited"],["Threat","Anything that could exploit a vulnerability"],["Exploit","The method or code that takes advantage of a vulnerability"],["Risk","Likelihood × impact of a threat exploiting a vulnerability"],["Data in transit protection","TLS, IPsec, SSH, WPA3"],["Data at rest protection","Disk or database encryption"],["Certificate authority","Signs certificates to vouch for public keys"],["Self-signed certificate","Signed by its own key; not trusted by default"],
 ["MFA","Factors from two or more categories"],["Something you have","Phone, smart card, hardware token"],["Something you are","Fingerprint, face, retina"],["Somewhere you are","Location, such as GPS or IP geolocation"],["SSO","One sign-in gives access to many apps"],["SAML","XML standard for web SSO assertions"],["RADIUS ports","UDP 1812 (auth) and 1813 (accounting)"],["TACACS+ port","TCP 49"],["RADIUS vs TACACS+","RADIUS: network access, encrypts password only. TACACS+: device admin, encrypts everything, per-command authorization."],["Least privilege","Only the access needed for the job"],["RBAC","Permissions assigned to roles, users assigned to roles"],["Geofencing","Allow or block based on location"],
 ["PCI DSS","Security standard for payment card data"],["GDPR","EU personal data protection regulation"],["Data locality","Requirement to keep data in a specific country or region"],["Honeypot","Decoy system to attract and study attackers"],["Honeynet","A network of decoy systems"],["OT / ICS / SCADA","Systems that control physical processes; isolate them"],["BYOD","Personal devices used for work; segment them"],
 ["MAC flooding","Overflows the MAC table so the switch floods frames"],["Defense against MAC flooding","Port security"],["ARP poisoning","Fake ARP replies redirect traffic through the attacker"],["Defense against ARP poisoning","Dynamic ARP inspection"],["Switch spoofing","Attacker negotiates a trunk to reach all VLANs"],["Double tagging","Two 802.1Q tags to hop from the native VLAN"],["VLAN hopping defenses","Disable auto-trunking, hard-set access ports, unused native VLAN"],["Rogue DHCP defense","DHCP snooping"],
 ["DDoS","Flood from many sources (a botnet)"],["DNS poisoning","False record inserted into a resolver's cache"],["Defense against DNS poisoning","DNSSEC"],["Rogue AP","Unauthorized AP connected to the network"],["Evil twin","Attacker AP copying a legitimate SSID"],["On-path attack","Attacker sits between two parties and intercepts traffic"],["Tailgating","Following someone through a secure door"],["Shoulder surfing","Watching someone enter a password"],["Dumpster diving","Searching discarded material for information"],["Worm","Malware that spreads across the network by itself"],
 ["802.1X roles","Supplicant, authenticator, authentication server"],["802.1X authentication server","Usually RADIUS"],["Port security sticky MAC","Learns and locks the first MACs seen"],["MAC filtering weakness","MACs can be spoofed"],["Hardening: unused ports","Shut down and assign to an unused VLAN"],["Key management life cycle","Generate, store, rotate, revoke"],
 ["ACL processing","Top-down, first match wins"],["Implicit deny","Traffic matching no rule is dropped"],["Screened subnet","Zone for public-facing servers between internet and LAN (DMZ)"],["URL filtering","Blocks sites by address or category"],["Content filtering","Blocks by what's inside: file types, keywords"],["Trusted vs untrusted zone","Internal LAN vs internet"]
];
const CARDS=C.map((c,i)=>({deck:i<30?"concepts":i<48?"attacks":"defense",id:"c"+i,q:c[0],a:c[1]}));

const QUIZ=[
 {q:"A ransomware attack encrypts a company's file servers so no one can work. Which part of the CIA triad is most affected?",o:["Confidentiality","Integrity","Availability","Non-repudiation"],a:2,e:"The data can't be used, so availability is lost."},
 {q:"Which control mainly protects integrity?",o:["Encryption","Hashing","Load balancing","UPS"],a:1,e:"Hashes detect any change to data."},
 {q:"An unpatched firmware bug on a firewall is an example of what?",o:["Threat","Exploit","Vulnerability","Risk"],a:2,e:"A vulnerability is a weakness. A threat could use an exploit against it."},
 {q:"Which protects data at rest?",o:["TLS","Full disk encryption","IPsec","SSH"],a:1,e:"Disk and database encryption protect stored data. TLS, IPsec and SSH protect data in transit."},
 {q:"Users get a browser warning when opening an internal management site. The certificate was generated on the device itself. What is the cause?",o:["Expired DNS record","Self-signed certificate","Wrong port","Missing VLAN"],a:1,e:"A self-signed certificate isn't vouched for by a trusted CA, so browsers warn."},
 {q:"What does a certificate authority do?",o:["Encrypts all traffic","Signs certificates to vouch for public keys","Assigns IP addresses","Stores passwords"],a:1,e:"CAs sign certificates, building a chain of trust up to a root CA."},
 {q:"A user signs in with a password and a code from an authenticator app. Which factors are used?",o:["Something you know and something you are","Something you know and something you have","Two things you know","Something you have and somewhere you are"],a:1,e:"Password = know. The phone app = have."},
 {q:"Which is NOT multifactor authentication?",o:["Password + fingerprint","PIN + smart card","Password + security question","Password + hardware token"],a:2,e:"A password and a security question are both something you know."},
 {q:"Employees sign in once in the morning and reach email, HR and CRM apps without signing in again. What is this?",o:["MFA","SSO","RBAC","Geofencing"],a:1,e:"Single sign-on reuses one authentication across applications."},
 {q:"Which XML-based standard is commonly used for web SSO between an identity provider and cloud apps?",o:["LDAP","SAML","RADIUS","Kerberos"],a:1,e:"SAML passes authentication assertions between identity and service providers."},
 {q:"Network admins need each command they type on switches authorized and logged. Which AAA protocol is best?",o:["RADIUS","TACACS+","LDAP","SAML"],a:1,e:"TACACS+ separates authorization, enabling per-command control, and encrypts the full payload."},
 {q:"Which port does TACACS+ use?",o:["UDP 1812","TCP 49","TCP 389","UDP 500"],a:1,e:"TACACS+ uses TCP 49. RADIUS uses UDP 1812/1813."},
 {q:"A help desk technician has domain admin rights but only needs to reset passwords. Which principle is violated?",o:["Least privilege","Separation of duties","Defense in depth","Implicit deny"],a:0,e:"Least privilege grants only what's needed for the job."},
 {q:"Permissions are assigned to groups such as \"Network Admins\" and \"Help Desk,\" and users are added to them. What model is this?",o:["Discretionary","RBAC","Geofencing","Mandatory"],a:1,e:"Role-based access control ties permissions to roles."},
 {q:"A company blocks logins to its VPN from outside its home country. What is this?",o:["Geofencing","Tailgating","PAT","Port security"],a:0,e:"Geofencing allows or denies access based on location."},
 {q:"A retailer processes credit cards. Which standard governs how it protects that data?",o:["GDPR","PCI DSS","HIPAA","ISO 9001"],a:1,e:"PCI DSS applies to anyone handling payment card data."},
 {q:"A regulation requires citizens' health data to remain on servers inside the country. What is this concept?",o:["Data locality","Multitenancy","Elasticity","Geofencing"],a:0,e:"Data locality (residency) requires data to stay within a region."},
 {q:"The security team sets up a fake database server to detect and study intruders. What is it?",o:["Honeypot","Jump box","Proxy","Bastion"],a:0,e:"A honeypot is a decoy. Any access to it is suspicious."},
 {q:"Smart thermostats and cameras should be isolated from corporate laptops. What is the best approach?",o:["Put them on their own segment/VLAN with firewall rules","Give them static IPs","Use a stronger Wi-Fi password","Enable jumbo frames"],a:0,e:"Segmentation stops a compromised IoT device from reaching sensitive systems."},
 {q:"SCADA systems controlling a water plant are an example of what?",o:["BYOD","OT/ICS","SaaS","Guest network"],a:1,e:"Operational technology and industrial control systems manage physical processes and need strict isolation."},
 {q:"A switch suddenly behaves like a hub and floods all traffic out every port after one port sends thousands of random source MACs. What attack is this?",o:["ARP poisoning","MAC flooding","VLAN hopping","DNS poisoning"],a:1,e:"MAC flooding overflows the CAM table so the switch floods unknown unicast frames."},
 {q:"Which feature best prevents MAC flooding?",o:["DHCP snooping","Port security","DNSSEC","STP"],a:1,e:"Port security limits the number of MAC addresses a port can learn."},
 {q:"Users' traffic is being routed through an attacker's laptop after it sent unsolicited ARP replies claiming to be the gateway. What attack is this?",o:["MAC flooding","ARP poisoning","Evil twin","DDoS"],a:1,e:"ARP poisoning maps the gateway's IP to the attacker's MAC, creating an on-path position."},
 {q:"Which switch feature validates ARP packets against trusted bindings?",o:["Dynamic ARP inspection","BPDU guard","Port mirroring","LACP"],a:0,e:"DAI checks ARP against the DHCP snooping binding table and drops forged replies."},
 {q:"An attacker's laptop negotiates a trunk with a switch port and gains access to every VLAN. What attack is this?",o:["Double tagging","Switch spoofing","MAC flooding","Rogue DHCP"],a:1,e:"Switch spoofing abuses auto-trunk negotiation (DTP)."},
 {q:"Which configuration helps prevent double-tagging VLAN hopping?",o:["Use VLAN 1 as the native VLAN","Set the native VLAN to an unused VLAN","Enable DTP on all ports","Disable STP"],a:1,e:"Double tagging relies on the attacker being in the native VLAN. An unused native VLAN defeats it."},
 {q:"Clients receive the wrong default gateway from a DHCP server someone plugged in under a desk. Which feature prevents this?",o:["Port mirroring","DHCP snooping","802.1Q","NAT"],a:1,e:"DHCP snooping only allows server messages on trusted ports."},
 {q:"A website goes offline as traffic from 40,000 compromised home routers floods it. What attack is this?",o:["DoS from one host","DDoS","Evil twin","Phishing"],a:1,e:"Many distributed sources (a botnet) make it a DDoS."},
 {q:"Users of a company's DNS resolver are sent to a fake banking site, but their own hosts files are clean. What attack likely happened?",o:["ARP spoofing","DNS cache poisoning","MAC flooding","VLAN hopping"],a:1,e:"A poisoned resolver cache gives every user the forged record."},
 {q:"Which technology helps prevent DNS cache poisoning?",o:["DNSSEC","DoH","SNMPv3","LACP"],a:0,e:"DNSSEC signatures let resolvers detect forged records."},
 {q:"An attacker sets up an AP named \"CoffeeShop_WiFi\" next to the real one to capture logins. What is this?",o:["Rogue AP","Evil twin","War driving","Bluejacking"],a:1,e:"An evil twin impersonates a legitimate SSID."},
 {q:"An employee plugs a consumer wireless router into an office jack to get better signal. What is this?",o:["Evil twin","Rogue access point","Honeypot","Jump box"],a:1,e:"An unauthorized AP on the network is a rogue AP. It bypasses security controls."},
 {q:"What is an on-path attack?",o:["Flooding a server","Intercepting traffic between two parties","Guessing passwords","Sending spam"],a:1,e:"The attacker sits between the victims, reading or changing traffic."},
 {q:"Someone follows an employee through a badge-controlled door without swiping. What is this?",o:["Shoulder surfing","Tailgating","Phishing","Dumpster diving"],a:1,e:"Tailgating (piggybacking) bypasses physical access control."},
 {q:"An attacker finds printed network diagrams in the recycling bin. What technique is this?",o:["Dumpster diving","Shoulder surfing","Vishing","Smishing"],a:0,e:"Dumpster diving searches discarded material. Shred sensitive documents."},
 {q:"Which malware spreads across the network without user action?",o:["Trojan","Worm","Spyware","Adware"],a:1,e:"Worms self-propagate through vulnerabilities."},
 {q:"In 802.1X, what is the switch's role?",o:["Supplicant","Authenticator","Authentication server","Certificate authority"],a:1,e:"The switch or AP is the authenticator. It relays credentials to the RADIUS server."},
 {q:"Which server usually performs the authentication in 802.1X?",o:["DHCP","RADIUS","DNS","NTP"],a:1,e:"RADIUS checks the supplicant's credentials."},
 {q:"Why is MAC filtering considered weak?",o:["It's slow","MAC addresses can be spoofed","It requires 802.1X","It blocks DHCP"],a:1,e:"Attackers can copy an allowed MAC address."},
 {q:"Which hardening step applies to switch ports that aren't in use?",o:["Leave them enabled in VLAN 1","Shut them down and assign them to an unused VLAN","Configure them as trunks","Enable PoE"],a:1,e:"Disabled ports in a dead-end VLAN can't be used by an intruder."},
 {q:"A new firewall still uses admin/admin. What should be done first?",o:["Enable logging","Change the default credentials","Add a VLAN","Update DNS"],a:1,e:"Default credentials are published online and are the first thing attackers try."},
 {q:"Which configuration locks a switch port to the first MAC address it learns?",o:["Sticky MAC port security","BPDU guard","Trunking","DAI"],a:0,e:"Sticky learning saves the learned MAC as allowed."},
 {q:"An ACL has \"deny any any\" as the first line, followed by permit rules. What happens?",o:["Permits work normally","All traffic is denied","Only TCP is denied","The ACL is ignored"],a:1,e:"First match wins, so the deny matches everything before the permits are checked."},
 {q:"What happens to traffic that matches no rule in an ACL?",o:["It's permitted","It's dropped by the implicit deny","It's logged and permitted","It's sent to the default gateway"],a:1,e:"Every ACL ends with an implicit deny."},
 {q:"Where should a public web server be placed?",o:["Trusted LAN","Screened subnet","Guest VLAN","Management VLAN"],a:1,e:"A screened subnet (DMZ) exposes public services while protecting the internal network."},
 {q:"Staff must be blocked from gambling websites. What should be used?",o:["URL filtering","Port security","DHCP snooping","NAT"],a:0,e:"URL filtering blocks sites by address or category."},
 {q:"A firewall should block any download of .exe files regardless of website. What does this?",o:["URL filtering","Content filtering","Geofencing","802.1X"],a:1,e:"Content filtering inspects what is transferred."},
 {q:"Which key management practice limits damage if a key is stolen?",o:["Never changing keys","Rotating keys regularly","Sharing keys by email","Storing keys in the config file"],a:1,e:"Regular rotation shortens the window a stolen key is useful."},
 {q:"Which RADIUS limitation does TACACS+ address?",o:["RADIUS uses TCP","RADIUS encrypts only the password","RADIUS can't do Wi-Fi","RADIUS is Cisco-only"],a:1,e:"TACACS+ encrypts the entire payload."},
 {q:"Which is a physical security control?",o:["ACL","Locked rack","VLAN","802.1X"],a:1,e:"Locks, cameras and badge readers are physical controls."}
];

registerModule({
  id:"sec",slug:"security",title:"Network Security",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:[["concepts","Concepts"],["attacks","Attacks"],["defense","Defenses"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["pki","mfa","zones","l2atk","ddos","viz-dot1x","acl"],
  viz(){

/* ---- PKI chain ---- */
(function(){
  const el=$("#viz-pki");let mode="good";const seen=new Set();
  const CH={good:[["Root CA","Trusted Root R1","Pre-installed in your OS and browser trust store. Self-signed, but trusted because the OS vendor vetted it."],["Intermediate CA","Issuing CA G2","Signed by the root. Roots stay offline, so intermediates do the day-to-day signing."],["Server certificate","portal.example.com","Signed by the intermediate. The name matches the URL, it hasn't expired, and the chain leads to a trusted root."]],
    self:[["Server certificate","192.168.1.1 (self-signed)","Issued by itself. Nothing in your trust store vouches for it, so the browser can't tell it apart from an impostor's certificate and shows a warning."]]};
  el.innerHTML=`<div class="viz-title">Inspect a certificate chain</div><div class="chips"><button class="chip" data-m="good">portal.example.com</button><button class="chip" data-m="self">Router admin page</button></div><div class="pki"></div><div class="caption" aria-live="polite"></div>`;
  function draw(i){const c=CH[mode];el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
    $(".pki",el).innerHTML=c.map((x,j)=>`${j?'<div class="pki-arrow">↓ signs</div>':""}<button class="pki-c ${mode==="self"?"bad":"ok"}${j===i?" sel":""}" data-i="${j}"><span class="s-small">${x[0]}</span><b>${x[1]}</b></button>`).join("")+`<div class="pki-lock ${mode}">${mode==="good"?"🔒 Connection is secure":"⚠ Your connection is not private"}</div>`;
    $(".caption",el).innerHTML=i>=0?c[i][2]:"Tap each certificate in the chain."}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),c=e.target.closest("[data-i]");if(m){mode=m.dataset.m;draw(-1)}if(c){seen.add(mode+c.dataset.i);draw(+c.dataset.i);if(seen.size===4)award("viz:pki",20,"Inspected a certificate chain")}});draw(-1);
})();

/* ---- MFA factor sorter ---- */
(function(){
  const el=$("#viz-mfa");
  const F=[["Password","know"],["Fingerprint","are"],["Smart card","have"],["PIN","know"],["Authenticator app code","have"],["Face scan","are"],["GPS location","where"],["Hardware security key","have"],["Security question","know"],["Corporate IP range","where"]];
  const K={know:"Something you know",have:"Something you have",are:"Something you are",where:"Somewhere you are"};
  let pick=null;const placed={};
  el.innerHTML=`<div class="viz-title">Sort each factor into its category</div><div class="chips mfa-pool"></div><div class="mfa-bins">${Object.entries(K).map(([k,l])=>`<button class="mfa-bin" data-k="${k}"><b>${l}</b><span></span></button>`).join("")}</div><div class="caption" aria-live="polite">Tap a factor, then tap its category.</div>`;
  function draw(msg){$(".mfa-pool",el).innerHTML=F.map((f,i)=>placed[i]?"":`<button class="chip" data-f="${i}" aria-pressed="${pick===i}">${f[0]}</button>`).join("")||'<span class="status-good">All sorted.</span>';
    el.querySelectorAll("[data-k]").forEach(b=>$("span",b).innerHTML=F.map((f,i)=>placed[i]===b.dataset.k?`<em>${f[0]}</em>`:"").join(""));if(msg)$(".caption",el).innerHTML=msg}
  el.addEventListener("click",e=>{const f=e.target.closest("[data-f]"),b=e.target.closest("[data-k]");
    if(f){pick=+f.dataset.f;draw();return}
    if(b&&pick!==null){const ok=F[pick][1]===b.dataset.k;if(ok){placed[pick]=b.dataset.k;draw(`<span class="status-good">Right.</span> ${F[pick][0]} is ${K[b.dataset.k].toLowerCase()}.`);pick=null;draw();if(Object.keys(placed).length===F.length)award("viz:mfa",20,"Sorted every MFA factor")}else draw(`<span class="status-bad">Not quite.</span> ${F[pick][0]} isn't ${K[b.dataset.k].toLowerCase()}.`)}});
  draw();
})();

/* ---- Segmentation zones ---- */
(function(){
  const el=$("#viz-zones");
  const Z={inet:[20,20,600,50,"Internet · untrusted"],dmz:[20,95,180,170,"Screened subnet"],lan:[220,95,190,170,"Corporate LAN · trusted"],seg:[430,95,190,170,"Isolated segments"]};
  const D=[["Web server","dmz",110,150,"Public-facing, so it lives in the screened subnet. If it's hacked, the firewall still stops it from reaching the LAN."],["Mail relay","dmz",110,210,"Accepts mail from the internet, so it sits in the screened subnet too."],["HR database","lan",315,150,"Sensitive internal data. Only reachable from inside, never directly from the internet."],["Staff laptops","lan",315,210,"Trusted, managed devices on the corporate VLAN."],["IP cameras (IoT)","seg",525,135,"IoT devices are hard to patch. Their own VLAN only talks to the video recorder."],["HVAC controller (OT)","seg",525,185,"Operational technology runs physical systems, so it's tightly isolated and often has no internet access at all."],["Guest Wi-Fi","seg",525,235,"Guests get internet access only, with no route to any internal network."]];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Tap each system to see where it belongs and why</div><div class="viz-scroll"><svg viewBox="0 0 640 280" style="min-width:480px" role="group" aria-label="Security zones"></svg></div><div class="caption" aria-live="polite">Firewall rules control what may cross between zones.</div>`;
  const svg=$("svg",el);let s="";
  for(const[k,[x,y,w,h,n]]of Object.entries(Z))s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="m-zone z-${k}"/><text x="${x+12}" y="${y+18}" class="s-small">${n.toUpperCase()}</text>`;
  D.forEach((d,i)=>s+=`<g class="m-node" data-d="${i}" tabindex="0" role="button" aria-label="${d[0]}"><rect x="${d[2]-80}" y="${d[3]-18}" width="160" height="36" rx="9"/><text x="${d[2]}" y="${d[3]+5}" text-anchor="middle" class="s-b" style="font-size:12px">${d[0]}</text></g>`);
  s+=`<text x="320" y="52" text-anchor="middle" class="s-b" style="font-size:12px">🧱 Firewall between every zone</text>`;
  svg.innerHTML=s;
  const pickD=g=>{svg.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));g.classList.add("sel");const d=D[+g.dataset.d];seen.add(+g.dataset.d);$(".caption",el).innerHTML=`<b>${d[0]}.</b> ${d[4]}`;if(seen.size===D.length)award("viz:zones",20,"Mapped every security zone")};
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-d]");if(g)pickD(g)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-d]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pickD(g)}});
})();

/* ---- Layer 2 attack lab ---- */
(function(){
  const el=$("#viz-l2atk");
  const A={
   arp:{n:"ARP poisoning",fix:"Enable dynamic ARP inspection",
     before:[["10.0.0.1 (gateway)","aa:aa:aa:00:00:01"],["10.0.0.50 (server)","bb:bb:bb:00:00:50"]],
     after:[["10.0.0.1 (gateway)","ee:ee:ee:66:66:66 ⚠"],["10.0.0.50 (server)","bb:bb:bb:00:00:50"]],
     label:"Victim's ARP cache",at:"The attacker sends a flood of gratuitous ARP replies: \"10.0.0.1 is at ee:ee:ee:66:66:66.\" The victim believes it, so all traffic for the gateway now goes to the attacker first: an on-path attack.",
     df:"DAI compares every ARP reply with the DHCP snooping bindings. The forged reply doesn't match, so the switch drops it and the cache stays correct."},
   mac:{n:"MAC flooding",fix:"Enable port security (max 2 MACs)",
     before:[["Gi0/1","aa:aa:aa:00:00:01"],["Gi0/2","bb:bb:bb:00:00:50"],["Gi0/3","cc:cc:cc:00:00:12"]],
     after:[["Gi0/9","1e:4f:22:… (8,190 entries)"],["TABLE FULL","switch floods every frame ⚠"]],
     label:"Switch MAC address table",at:"The attacker's tool sends thousands of frames per second with random source MACs. The table fills, the switch can't learn real devices, and it floods every frame out every port, where the attacker captures them.",
     df:"Port security allows only 2 MACs on Gi0/9. The third new MAC triggers a violation and the port shuts down."},
   dhcp:{n:"Rogue DHCP",fix:"Enable DHCP snooping",
     before:[["Gateway","10.0.0.1"],["DNS","10.0.0.53"]],
     after:[["Gateway","10.0.0.66 ⚠ (attacker)"],["DNS","10.0.0.66 ⚠ (attacker)"]],
     label:"New client's DHCP lease",at:"A rogue server answers DHCP Discovers faster than the real one, handing clients the attacker's address as gateway and DNS.",
     df:"DHCP snooping marks only the uplink to the real server as trusted. DHCP Offers arriving on any access port are dropped."},
   vlan:{n:"VLAN hopping",fix:"Disable auto-trunking, set an unused native VLAN",
     before:[["Attacker port","access · VLAN 30 (guest)"],["Reachable","VLAN 30 only"]],
     after:[["Attacker port","TRUNK ⚠ (negotiated via DTP)"],["Reachable","VLANs 10, 20, 30, 99 ⚠"]],
     label:"Attacker's switch port",at:"The attacker's laptop pretends to be a switch and negotiates a trunk (switch spoofing). Now it can tag frames for any VLAN, including the server and management VLANs.",
     df:"With the port hard-set to access mode and DTP disabled, it can never become a trunk. An unused native VLAN also blocks the double-tagging variant."}};
  let k="arp",st="before";const def=new Set();
  el.innerHTML=`<div class="viz-title">Run an attack, then deploy the defense</div><div class="chips">${Object.entries(A).map(([key,a])=>`<button class="chip" data-k="${key}">${a.n}</button>`).join("")}</div>
  <div class="atk"><div class="atk-t"></div></div><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn bad" data-a="atk">Launch attack</button><button class="btn good" data-a="def"></button><button class="btn" data-a="rst">Reset</button></div>`;
  function draw(){const a=A[k];el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    const rows=st==="after"?a.after:a.before;
    $(".atk-t",el).innerHTML=`<div class="s-small">${a.label.toUpperCase()}${st==="def"?' · <span class="status-good">PROTECTED</span>':""}</div>${rows.map(r=>`<div class="atk-r${r[1].includes("⚠")?" bad":""}"><span class="mono">${r[0]}</span><b class="mono">${r[1]}</b></div>`).join("")}`;
    $(".caption",el).innerHTML=st==="before"?"Normal operation. Press <b>Launch attack</b>.":st==="after"?`<span class="status-bad">Compromised.</span> ${a.at}`:`<span class="status-good">Blocked.</span> ${a.df}`;
    $('[data-a="def"]',el).textContent=a.fix}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(b){k=b.dataset.k;st="before"}if(a==="atk")st="after";if(a==="def"){st="def";def.add(k)}if(a==="rst")st="before";
    if(b||a)draw();if(def.size===4)award("viz:l2atk",30,"Blocked four Layer 2 attacks")});
  draw();
})();

/* ---- DDoS mitigation ---- */
(function(){
  const el=$("#viz-ddos");
  const M=[["rate","Rate limiting at the edge",0.35],["scrub","Upstream scrubbing service",0.85],["cdn","CDN / anycast to spread the load",0.6]];
  let on=new Set(),wasUp=false,wasDown=false;const atk=48,legit=2,cap=10;
  el.innerHTML=`<div class="viz-title">Keep the site up during a 50 Gbps DDoS</div><div class="chips">${M.map(m=>`<button class="chip" data-m="${m[0]}">${m[1]}</button>`).join("")}</div>
  <div class="dd"><div class="dd-row"><span>Attack traffic reaching the server</span><div class="dd-bar"><i class="dd-a"></i><b class="dd-cap"></b></div><em class="mono dd-av"></em></div>
  <div class="dd-row"><span>Legitimate users</span><div class="dd-bar"><i class="dd-l"></i></div><em class="mono">2 Gbps</em></div></div><div class="caption" aria-live="polite"></div>`;
  function draw(){let left=atk;M.forEach(m=>{if(on.has(m[0]))left*=1-m[2]});const total=left+legit,up=total<=cap;
    el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",on.has(b.dataset.m)));
    const W=v=>Math.min(100,v/50*100);$(".dd-a",el).style.width=W(left)+"%";$(".dd-l",el).style.width=W(legit)+"%";$(".dd-cap",el).style.left=W(cap)+"%";$(".dd-av",el).textContent=left.toFixed(1)+" Gbps";
    $(".caption",el).innerHTML=`The server's link handles ${cap} Gbps (white line). ${up?`<span class="status-good">Site is up.</span> ${total.toFixed(1)} Gbps arrives, within capacity.`:`<span class="status-bad">Site is down.</span> ${total.toFixed(1)} Gbps arrives and the link is saturated, so real users time out.`} ${on.size===0?"No single firewall on your own link can fix this: the pipe is already full before traffic reaches it.":""}`;
    if(!up&&wasUp)wasDown=true;if(up&&wasDown)flag("blackout");if(up)wasUp=true;if(up)award("viz:ddos",20,"Survived a DDoS")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;const k=b.dataset.m;on.has(k)?on.delete(k):on.add(k);draw()});draw();
})();

/* ---- 802.1X ---- */
seqViz($("#viz-dot1x"),{title:"802.1X opens a switch port",left:"Laptop (supplicant)",right:"RADIUS server",
  intro:"The laptop plugs into a switch port that only passes EAP traffic until authentication succeeds. The switch is the <b>authenticator</b> in the middle. Press <b>Next step</b>.",
  steps:[
   {dir:"r",label:"EAPOL-Start",sub:"to the switch (authenticator)",dash:true,text:"<b>Start.</b> The supplicant announces itself. Until authentication finishes, the port blocks everything except EAP."},
   {dir:"l",label:"Identity request",sub:"switch asks who you are",text:"<b>Identity request.</b> The authenticator asks for an identity."},
   {dir:"r",label:"Credentials / certificate",sub:"switch wraps EAP in RADIUS",text:"<b>Credentials.</b> The laptop answers with its username and password or certificate inside an encrypted EAP tunnel. The switch forwards it to RADIUS."},
   {dir:"l",label:"Access-Accept",sub:"+ VLAN 10 assignment",text:"<b>Accept.</b> RADIUS approves and can even tell the switch which VLAN to put the user in."},
   {dir:"r",label:"Normal traffic",sub:"port opens",text:"<b>Port open.</b> The switch unblocks the port and the laptop gets DHCP as usual. An unknown device would get Access-Reject and stay blocked, or land in a guest VLAN."}]});

/* ---- ACL rule order ---- */
(function(){
  const el=$("#viz-acl");
  let R=[["deny","any","10.0.5.0/24","any","Block guest access to servers"],["permit","10.0.1.0/24","10.0.5.10","443","Staff to web app"],["permit","10.0.1.0/24","10.0.5.20","22","Staff SSH to Linux host"],["deny","any","any","23","Block Telnet everywhere"]];
  const P=[["10.0.1.15","10.0.5.10","443","permit"],["10.0.1.15","10.0.5.20","22","permit"],["10.0.9.40","10.0.5.10","443","deny"],["10.0.1.15","10.0.5.20","23","deny"],["10.0.1.15","8.8.8.8","53","deny"]];
  const inNet=(ip,c)=>{if(c==="any")return true;if(!c.includes("/"))return ip===c;const [n,p]=c.split("/");const t=s=>s.split(".").reduce((a,o)=>a*256+ +o,0);return Math.floor(t(ip)/2**(32-p))===Math.floor(t(n)/2**(32-p))};
  const ev=p=>{for(let i=0;i<R.length;i++){const r=R[i];if(inNet(p[0],r[1])&&inNet(p[1],r[2])&&(r[3]==="any"||r[3]===p[2]))return [r[0],i]}return ["deny",-1]};
  el.innerHTML=`<div class="viz-title">Reorder the rules until every test packet gets the right result</div><div class="acl-r"></div><div class="acl-p"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){
    $(".acl-r",el).innerHTML=R.map((r,i)=>`<div class="acl-row"><span class="mono acl-n">${(i+1)*10}</span><b class="${r[0]}">${r[0]}</b><span class="mono">${r[1]} → ${r[2]} : ${r[3]}</span><em>${r[4]}</em><span class="acl-mv"><button class="btn" data-u="${i}" ${i===0?"disabled":""} aria-label="Move up">↑</button><button class="btn" data-dn="${i}" ${i===R.length-1?"disabled":""} aria-label="Move down">↓</button></span></div>`).join("")+`<div class="acl-row imp"><span class="mono acl-n">—</span><b class="deny">deny</b><span class="mono">any → any : any</span><em>Implicit deny</em></div>`;
    const res=P.map(p=>{const [a,i]=ev(p);return {p,a,i,ok:a===p[3]}});
    $(".acl-p",el).innerHTML=`<div class="s-small">TEST PACKETS</div>`+res.map(r=>`<div class="acl-t ${r.ok?"ok":"no"}"><span class="mono">${r.p[0]} → ${r.p[1]}:${r.p[2]}</span><span>${r.a} (rule ${r.i<0?"implicit":(r.i+1)*10})</span><b>${r.ok?"✓":"✗ should "+r.p[3]}</b></div>`).join("");
    const all=res.every(r=>r.ok);
    $(".caption",el).innerHTML=all?'<span class="status-good">All five packets handled correctly.</span> The specific permits sit above the broad guest deny. The DNS packet falls to the implicit deny, which is fine here.':"The broad <b>deny any → 10.0.5.0/24</b> rule is catching staff traffic before the permits are reached. Move specific rules above general ones.";
    if(all)award("viz:acl",30,"Fixed an ACL's rule order")}
  el.addEventListener("click",e=>{const u=e.target.closest("[data-u]"),d=e.target.closest("[data-dn]");
    if(u){const i=+u.dataset.u;[R[i-1],R[i]]=[R[i],R[i-1]];draw()}if(d){const i=+d.dataset.dn;[R[i+1],R[i]]=[R[i],R[i+1]];draw()}});
  draw();
})();

  },
  sims:[
    {id:"attack",type:"match",title:"Name that attack",
      scenario:"The SOC received seven incident reports overnight. Match each report to the attack it describes.",
      items:[["ARP poisoning","arp"],["MAC flooding","mac"],["VLAN hopping","vlan"],["Rogue DHCP","dhcp"],["Evil twin","twin"],["DNS poisoning","dns"],["DDoS","ddos"]],
      slots:[["arp","INC-1","Many PCs show the gateway's IP mapped to a laptop's MAC address"],["mac","INC-2","An access switch began flooding all frames out every port after a burst of random source MACs"],["vlan","INC-3","A guest-port device negotiated a trunk and reached the server VLAN"],["dhcp","INC-4","New clients got 10.0.0.66 as their default gateway"],["twin","INC-5","Users connected to an SSID identical to ours, broadcast from the parking lot"],["dns","INC-6","Everyone using the internal resolver was sent to a fake payroll site"],["ddos","INC-7","The website crashed under traffic from 30,000 home routers"]],
      success:"All seven incidents classified. Each one maps to a defense: DAI, port security, disabling DTP, DHCP snooping, WIPS/802.1X, DNSSEC and upstream scrubbing."},
    {id:"harden",title:"Harden the access switch",mount(el,api,sim){
      const O=[["Shut down unused ports and move them to an unused VLAN",1],["Enable port security with a maximum of 2 MACs on access ports",1],["Enable DHCP snooping with only the uplink trusted",1],["Enable dynamic ARP inspection",1],["Disable DTP and hard-set access ports to access mode",1],["Change the native VLAN from 1 to an unused VLAN",1],["Disable Telnet and the HTTP server; allow SSH only",1],["Replace the default admin password",1],["Leave Telnet enabled as a backup management path",0],["Set the SNMP community string to \"public\"",0],["Make every port a trunk so devices can move freely",0],["Disable STP to speed up port startup",0]];
      const order=shuffleArr(O.map((_,i)=>i));let on=new Set(),g=null;
      function d(){el.innerHTML=`${simHead(sim,api)}<p class="scenario">A new access switch is going into a lobby where the public can reach the wall jacks. Select every setting that should be applied, and nothing that weakens it.</p>
        <div class="hd-list">${order.map(i=>`<label class="hd-i ${g?(O[i][1]?(on.has(i)?"ok":"miss"):(on.has(i)?"no":"")):""}"><input type="checkbox" data-i="${i}" ${on.has(i)?"checked":""}><span>${O[i][0]}</span></label>`).join("")}</div>
        <div class="caption" aria-live="polite">${g?(g.ok?'<span class="status-good">Fully hardened.</span> Every recommended control is on, and nothing risky slipped in.':`${g.miss?`<b>${g.miss}</b> recommended setting${g.miss>1?"s":""} missing (amber). `:""}${g.bad?`<span class="status-bad">${g.bad} risky setting${g.bad>1?"s":""} selected</span> (red).`:""}`):"Select the settings, then check."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Check hardening</button></div>`}
      el.addEventListener("change",e=>{const c=e.target.closest("[data-i]");if(!c)return;c.checked?on.add(+c.dataset.i):on.delete(+c.dataset.i);g=null});
      el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;const miss=O.filter((o,i)=>o[1]&&!on.has(i)).length,bad=O.filter((o,i)=>!o[1]&&on.has(i)).length;g={miss,bad,ok:!miss&&!bad};if(g.ok)api.pass();d()});
      d();
    }},
    {id:"aclsim",title:"Write the screened subnet ACL",mount(el,api,sim){
      const REQ=[["Internet users reach the web server 172.16.10.10 on 443","203.0.113.9","172.16.10.10","443","permit"],["Internet users reach the mail relay 172.16.10.25 on 25","198.51.100.4","172.16.10.25","25","permit"],["Internet users can't SSH to the web server","203.0.113.9","172.16.10.10","22","deny"],["The internet can't reach the internal LAN 10.0.0.0/8 at all","203.0.113.9","10.1.2.3","443","deny"],["Nothing else from the internet gets in","198.51.100.4","172.16.10.99","3389","deny"]];
      const SRC=["any","10.0.0.0/8","172.16.10.0/24"],DST=["any","172.16.10.10","172.16.10.25","172.16.10.0/24","10.0.0.0/8"],PT=["any","22","25","80","443","3389"];
      let R=[{a:"permit",s:"any",d:"any",p:"any"},{a:"deny",s:"any",d:"any",p:"any"},{a:"permit",s:"any",d:"any",p:"any"}],g=null;
      const inNet=(ip,c)=>{if(c==="any")return true;if(!c.includes("/"))return ip===c;const [n,p]=c.split("/");const t=s=>s.split(".").reduce((a,o)=>a*256+ +o,0);return Math.floor(t(ip)/2**(32-p))===Math.floor(t(n)/2**(32-p))};
      const ev=q=>{for(const r of R)if(inNet(q[1],r.s)&&inNet(q[2],r.d)&&(r.p==="any"||r.p===q[3]))return r.a;return "deny"};
      const sel=(i,k,opts)=>`<select data-i="${i}" data-k="${k}">${opts.map(o=>`<option ${R[i][k]===o?"selected":""}>${o}</option>`).join("")}</select>`;
      function d(){el.innerHTML=`${simHead(sim,api)}<p class="scenario">Write the inbound ACL on the firewall's internet interface. You have three rules plus the implicit deny. Rules are checked top-down and the first match wins.</p>
        <div class="scroll"><table class="edt vl"><thead><tr><th>#</th><th>Action</th><th>Source</th><th>Destination</th><th>Port</th></tr></thead><tbody>
        ${R.map((r,i)=>`<tr><td class="mono">${(i+1)*10}</td><td>${sel(i,"a",["permit","deny"])}</td><td>${sel(i,"s",SRC)}</td><td>${sel(i,"d",DST)}</td><td>${sel(i,"p",PT)}</td></tr>`).join("")}
        <tr><td class="mono">—</td><td>deny</td><td>any</td><td>any</td><td>any (implicit)</td></tr></tbody></table></div>
        ${g?`<div class="grade">${REQ.map((q,i)=>`<div class="${g[i]?"g-ok":"g-no"}"><b>${g[i]?"✓":"✗"} ${q[0]}</b>${g[i]?"":`<span>Test packet ${q[1]} → ${q[2]}:${q[3]} should be ${q[4]}ed but was ${ev(q)}ed.</span>`}</div>`).join("")}</div>`:""}
        <div class="caption" aria-live="polite">${g?(g.every(Boolean)?'<span class="status-good">All five requirements met.</span> Two specific permits, and the implicit deny handles the rest.':`<b>${g.filter(Boolean).length} of 5</b> requirements met.`):"Hint: you may not need all three rules to permit or deny things explicitly."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Test the ACL</button></div>`}
      el.addEventListener("change",e=>{const t=e.target.closest("select[data-i]");if(!t)return;R[+t.dataset.i][t.dataset.k]=t.value;g=null});
      el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;g=REQ.map(q=>ev(q)===q[4]);if(g.every(Boolean))api.pass();d()});
      d();
    }},
    {id:"zones",type:"match",title:"Place systems in the right zone",
      scenario:"A hospital is redesigning its network. Match each system to the zone it belongs in.",
      items:[["Patient portal web server","dmz"],["Electronic health records database","trusted"],["Visitor Wi-Fi","guest"],["Infusion pump controllers","ot"],["Doctors' personal phones","byod"],["Decoy file server","honey"]],
      slots:[["dmz","Screened subnet","Reachable from the internet, isolated from the LAN"],["trusted","Trusted internal LAN","Most sensitive data, no direct internet access"],["guest","Guest network","Internet only, captive portal"],["ot","Medical device / OT segment","Isolated, tightly allow-listed"],["byod","BYOD segment","Personal devices, limited internal access"],["honey","Deception","Alerts on any access"]],
      success:"The hospital's zones are set. A breach in one can't easily spread to the others."}
  ],
  badges:[
    ["reader","SC","Security Cleared","Mark all 7 security lessons studied",c=>c.allStudied()],
    ["lab","RT","Red Team Lab","Complete all 7 security diagrams",c=>c.vizAll()],
    ["l2","L2","Layer 2 Lockdown","Block all four Layer 2 attacks",c=>c.earned("viz:l2atk")],
    ["acl","FW","Rule Writer","Pass the screened subnet ACL simulation",c=>c.passed("aclsim")],
    ["harden","HD","Hardened","Pass the switch hardening simulation",c=>c.passed("harden")],
    ["attack","IR","Incident Responder","Pass the attack identification simulation",c=>c.passed("attack")],
    ["recall","TR","Total Recall","Master 15 security flashcards",c=>c.countAtLeast(4)>=15],
    ["perfect","PP","Zero Trust, Full Marks","Score 100% on a security quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
