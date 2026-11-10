/* ================= Module 5: Security (350-401 v1.2 Domain 5.0, 20%) ================= */
(function(){
const LESSONS=[
{id:"access",num:"5.1",title:"Device access control: lines, passwords and SSH",html:`
<p>The management plane is the first thing an attacker goes after. Lock down who can log in, how, and from where.</p>
<h3>Passwords and secrets</h3>
<table><tr><th>Type</th><th>How it's stored</th><th>Use?</th></tr>
<tr><td>0</td><td>Plain text</td><td>Never</td></tr>
<tr><td>7</td><td>Vigenère-style obfuscation (<code>service password-encryption</code>)</td><td>Reversible in seconds; only hides passwords from shoulder-surfers</td></tr>
<tr><td>5</td><td>MD5 hash (old <code>enable secret</code> default)</td><td>Weak by today's standards</td></tr>
<tr><td>8</td><td>PBKDF2 with SHA-256</td><td>Good</td></tr>
<tr><td>9</td><td>scrypt</td><td>Best: the current IOS XE default for secrets</td></tr></table>
<ul><li>Use <code>enable secret</code>, never <code>enable password</code>. Use <code>username X secret</code>, never <code>username X password</code>.</li>
<li><code>security passwords min-length 10</code> enforces a minimum length for new passwords.</li>
<li><b>Privilege levels</b> 0 to 15: 1 is user EXEC, 15 is full access. Custom levels can be given specific commands, but AAA command authorization is the scalable way.</li></ul>
<h3>Lines</h3>
<ul><li><b>Console</b> (line con 0), <b>AUX</b>, and <b>VTY</b> (line vty 0 15, for Telnet and SSH).</li>
<li><code>login local</code> uses the local user database. With AAA, <code>login authentication LIST</code> picks a method list.</li>
<li><code>transport input ssh</code> disables Telnet, which sends everything including passwords in clear text.</li>
<li><code>access-class MGMT in</code> applies a standard ACL so only management subnets can open a session.</li>
<li><code>exec-timeout 10 0</code> logs idle sessions out after 10 minutes.</li></ul>
<h3>SSH</h3>
<p>SSH needs a <b>hostname</b>, a <b>domain name</b>, and <b>RSA keys</b> (2048 bits or more), then <code>ip ssh version 2</code>.</p>
<pre class="term">hostname R1
ip domain name corp.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin privilege 15 secret Adm1n!Secret
ip access-list standard MGMT
 permit 10.99.0.0 0.0.0.255
line vty 0 15
 login local
 transport input ssh
 access-class MGMT in
 exec-timeout 10 0
login block-for 120 attempts 5 within 60</pre>
<p><code>login block-for</code> stops all logins for 120 seconds after 5 failures in 60 seconds (quiet mode), slowing brute-force attacks. <code>login quiet-mode access-class</code> lets a management ACL in even during quiet mode.</p>
<div class="viz" id="viz-pwtypes"></div>
<div class="viz" id="viz-vtycheck"></div>
<div class="tip"><b>Exam tip.</b> Type 7 is reversible, type 9 (scrypt) is strongest. SSH needs hostname + domain + RSA keys. access-class on a VTY line uses a standard ACL to filter who connects.</div>`},
{id:"aaa",num:"5.2",title:"AAA with RADIUS and TACACS+",html:`
<p><b>AAA</b> is <b>Authentication</b> (who are you?), <b>Authorization</b> (what may you do?) and <b>Accounting</b> (what did you do?). Central AAA servers like <b>Cisco ISE</b> give one place to manage administrator accounts and network access.</p>
<table><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Transport</td><td>UDP 1812 (auth) and 1813 (accounting); older 1645/1646</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Only the password</td><td>The whole packet body</td></tr>
<tr><td>AAA functions</td><td>Authentication and authorization combined</td><td>Separates all three</td></tr>
<tr><td>Command authorization</td><td>No</td><td>Yes, per command</td></tr>
<tr><td>Standard</td><td>Open (RFC 2865)</td><td>Cisco origin, published as RFC 8907</td></tr>
<tr><td>Typical use</td><td><b>Network access</b>: 802.1X, VPN, Wi-Fi users</td><td><b>Device administration</b>: admins logging into routers and switches</td></tr></table>
<h3>Method lists</h3>
<p>A method list is an ordered list of ways to authenticate. IOS tries the next method <b>only if the current one gives no answer</b> (server unreachable or not configured). A server that answers "reject" ends the attempt: the user is denied.</p>
<pre class="term">aaa new-model
tacacs server ISE
 address ipv4 10.0.0.20
 key T@cacsK3y
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa authorization commands 15 default group tacacs+ local
aaa accounting commands 15 default start-stop group tacacs+
username admin privilege 15 secret Br3akGl@ss!</pre>
<ul><li>The <b>local</b> user is the break-glass account for when the AAA server is unreachable.</li>
<li>Configure a local user <b>before</b> <code>aaa new-model</code> on a remote device, or a lockout is one typo away. Keep a console session open while you test.</li>
<li><code>test aaa group tacacs+ USER PASS legacy</code> tests the server without logging out. <code>debug aaa authentication</code> and <code>debug tacacs</code> show the details.</li>
<li>A <b>shared key mismatch</b> makes the server unable to decrypt the request; it behaves as if the server failed.</li>
<li>For RADIUS: <code>radius server ISE</code>, <code>address ipv4 10.0.0.20 auth-port 1812 acct-port 1813</code>, <code>key ...</code>, and <code>group radius</code> in the lists.</li></ul>
<div class="viz" id="viz-aaacmp"></div>
<div class="viz" id="viz-aaaflow"></div>
<div class="viz" id="viz-method"></div>
<div class="tip"><b>Exam tip.</b> TACACS+: TCP 49, whole body encrypted, separate AAA, command authorization, device admin. RADIUS: UDP 1812/1813, password only encrypted, network access. A reject doesn't fall through to local; only no response does.</div>`},
{id:"acl",num:"5.3",title:"ACLs and Control Plane Policing",html:`
<h3>ACL types</h3>
<ul><li><b>Standard</b> (1 to 99, 1300 to 1999, or named): matches the <b>source address</b> only. Place it close to the destination.</li>
<li><b>Extended</b> (100 to 199, 2000 to 2699, or named): matches protocol, source, destination and ports. Place it close to the source to drop unwanted traffic early.</li>
<li>Entries are checked <b>top down</b>; the <b>first match wins</b>. Every ACL ends in an invisible <b>implicit deny any</b>.</li>
<li>Named ACLs have <b>sequence numbers</b> (10, 20, 30...) so you can insert (<code>15 permit ...</code>) and delete (<code>no 20</code>) single lines.</li>
<li>One ACL per interface, per direction, per protocol. <code>ip access-group NAME in|out</code>. Direction is from the router's point of view.</li>
<li><b>Wildcard masks</b>: 0 bits must match, 1 bits don't matter. <code>0.0.0.255</code> matches a /24; <code>host 10.1.1.1</code> = <code>10.1.1.1 0.0.0.0</code>; <code>any</code> = <code>0.0.0.0 255.255.255.255</code>.</li>
<li>Outbound ACLs don't filter traffic the router itself generates.</li></ul>
<pre class="term">ip access-list extended SRV-PROTECT
 10 permit tcp 10.1.10.0 0.0.0.255 host 10.1.20.100 eq 443
 20 permit icmp 10.1.10.0 0.0.0.255 host 10.1.20.100 echo
 30 deny   ip any any log
interface GigabitEthernet0/0/2
 ip access-group SRV-PROTECT out</pre>
<div class="viz" id="viz-wildcard"></div>
<div class="viz" id="viz-aclorder"></div>
<h3>Control Plane Policing (CoPP)</h3>
<p>The route processor's CPU handles routing protocols, management sessions and anything addressed to the router. A flood of traffic to it (a ping flood, SSH brute-force, a TTL-expiry attack) can starve OSPF and BGP and bring the network down. <b>CoPP</b> applies a QoS policy to traffic going <b>to the control plane</b>:</p>
<ol><li>ACLs and <b>class-maps</b> classify control plane traffic: routing (BGP, OSPF), management (SSH, SNMP), ICMP, and everything else.</li>
<li>A <b>policy-map</b> <b>polices</b> each class: generous for routing protocols, tight for ICMP, and a low rate for the catch-all.</li>
<li><code>control-plane</code> then <code>service-policy input COPP</code> applies it.</li></ol>
<pre class="term">ip access-list extended ICMP-ACL
 permit icmp any any
class-map match-all COPP-ICMP
 match access-group name ICMP-ACL
policy-map COPP
 class COPP-ICMP
  police cir 64000 conform-action transmit exceed-action drop
control-plane
 service-policy input COPP</pre>
<p>Catalyst 9000 switches ship with a default CoPP policy (<code>system-cpp-policy</code>). Verify with <code>show policy-map control-plane</code>.</p>
<div class="viz" id="viz-copp"></div>
<div class="tip"><b>Exam tip.</b> First match wins, implicit deny at the end. Standard near the destination, extended near the source. CoPP is a QoS policy (police) on the control-plane, always input.</div>`},
{id:"api",num:"5.4",title:"REST API security",html:`
<p>Controllers like Catalyst Center, SD-WAN Manager and Meraki are managed through REST APIs, so those APIs are as sensitive as the CLI.</p>
<ul><li><b>Transport</b>: always <b>HTTPS (TLS)</b>, with valid certificates, so credentials and data can't be read or changed in transit. Don't disable certificate checking in production scripts.</li>
<li><b>Authentication</b> methods:
 <ul><li><b>HTTP Basic</b>: username and password Base64-encoded in each request. Base64 is <i>encoding</i>, not encryption, so it's only safe inside TLS.</li>
 <li><b>Token-based</b>: log in once (often with Basic) to get a token, then send it in a header on every call. Catalyst Center: POST to <code>/dna/system/api/v1/auth/token</code>, then <code>X-Auth-Token</code>. Tokens expire (one hour there).</li>
 <li><b>API keys</b>: a long-lived secret per application (Meraki: <code>Authorization: Bearer KEY</code>). Store them in a vault or environment variable, never in code or Git.</li>
 <li><b>OAuth 2.0</b>: delegated authorization; an app gets a scoped, short-lived access token from an authorization server without seeing the user's password.</li></ul></li>
<li><b>Authorization (RBAC)</b>: give each API account the least privilege it needs, such as read-only for a monitoring script.</li>
<li><b>Rate limiting</b> protects the controller; clients get <b>429 Too Many Requests</b> and must back off.</li>
<li><b>Input validation, logging and auditing</b> of API calls, and <b>CORS</b> rules for browser-based clients.</li></ul>
<div class="viz" id="viz-apiauth"></div>
<div class="tip"><b>Exam tip.</b> Base64 isn't encryption. Tokens go in a header and expire. 401 = not authenticated, 403 = authenticated but not allowed, 429 = slow down.</div>`},
{id:"design",num:"5.5",title:"Network security design: threat defense, NGFW, TrustSec and MACsec",html:`
<p>No single box secures a network. ENCOR expects you to describe the components and where they fit.</p>
<h3>Threat defense and endpoint security</h3>
<ul><li><b>Next-generation firewall (NGFW)</b>, Cisco Secure Firewall: stateful inspection plus <b>application visibility and control</b>, <b>IPS</b>, URL filtering, malware protection and TLS decryption. Classic firewalls only see ports and addresses.</li>
<li><b>Intrusion prevention (IPS)</b>: inline, signature and behavior based; it can drop attacks. An <b>IDS</b> only watches a copy (from SPAN) and alerts.</li>
<li><b>Endpoint security</b>: Cisco <b>Secure Endpoint</b> (AMP) watches files and processes on the host and can retroactively flag a file that turns out to be malicious.</li>
<li><b>DNS-layer security</b>: Cisco <b>Umbrella</b> blocks requests to malicious domains before a connection is made.</li>
<li><b>Network visibility</b>: <b>Secure Network Analytics</b> (Stealthwatch) uses NetFlow to model behavior and spot anomalies like data hoarding.</li>
<li><b>Email and web security</b> gateways stop phishing and malicious downloads.</li></ul>
<p>Identity services such as <b>ISE</b> authenticate endpoints when they connect and return an authorization result, which can include a <b>Security Group Tag</b>.</p>
<h3>Cisco TrustSec</h3>
<ul><li>Users and devices get a <b>Security Group Tag (SGT)</b>, a 16-bit number for their role (Employees = 10, Contractors = 20, Cameras = 30), regardless of IP address or VLAN.</li>
<li>Three phases: <b>classification</b> (assign the SGT at the edge, dynamically via ISE or statically), <b>propagation</b> (carry it inline in a Cisco Meta Data header, or with <b>SXP</b> over TCP to devices that can't tag), and <b>enforcement</b> (<b>SGACLs</b> in a matrix of source group × destination group, applied at egress).</li>
<li>Policy is written in business terms ("Contractors can't reach Finance servers") and doesn't need to change when addresses do. SD-Access uses the same SGTs.</li></ul>
<h3>MACsec</h3>
<ul><li><b>IEEE 802.1AE</b>: hop-by-hop <b>Layer 2 encryption</b> with AES-GCM between two directly connected devices. Each hop decrypts, so the switch can still apply QoS and policy, then re-encrypts.</li>
<li>Keys come from <b>MKA</b> (MACsec Key Agreement, 802.1X-2010), either from 802.1X/ISE (downlink to hosts) or a <b>pre-shared key</b> (switch-to-switch uplinks).</li>
<li>Protects against taps and man-in-the-middle on cables between closets and buildings, at line rate in hardware.</li></ul>
<div class="viz" id="viz-secparts"></div>
<div class="viz" id="viz-trustsec"></div>
<div class="viz" id="viz-secpick"></div>
<div class="tip"><b>Exam tip.</b> SGT = role tag; classify, propagate (inline or SXP), enforce (SGACL). MACsec = 802.1AE, link-layer, hop by hop, keyed by MKA. MAB = 802.1X fallback for devices without a supplicant.</div>`}
];

const G={
mgmt:[["Password type 7?","Reversible obfuscation from service password-encryption."],["Password type 5?","MD5 hash."],["Password type 8?","PBKDF2 SHA-256."],["Password type 9?","scrypt, the strongest."],["enable secret vs enable password?","Secret is hashed; always use secret."],["Enforce password length?","security passwords min-length N."],["Privilege level 15?","Full access."],["Privilege level 1?","User EXEC."],["SSH prerequisites?","Hostname, domain name, RSA keys."],["Minimum RSA modulus for SSHv2?","768; use 2048 or more."],["Disable Telnet on VTYs?","transport input ssh."],["Restrict which subnets can SSH in?","access-class ACL in on the VTY lines (standard ACL)."],["Idle timeout on lines?","exec-timeout minutes seconds."],["Slow brute-force logins?","login block-for S attempts N within T."],["login block-for quiet mode exception?","login quiet-mode access-class ACL."],["Use local users on VTY without AAA?","login local."],["Why avoid Telnet?","Everything, including passwords, is sent in clear text."]],
aaa:[["AAA stands for?","Authentication, authorization, accounting."],["RADIUS ports?","UDP 1812/1813 (legacy 1645/1646)."],["TACACS+ port?","TCP 49."],["What does RADIUS encrypt?","Only the password."],["What does TACACS+ encrypt?","The entire packet body."],["Which separates authentication and authorization?","TACACS+."],["Which supports per-command authorization?","TACACS+."],["Typical RADIUS use?","Network access: 802.1X, VPN, wireless."],["Typical TACACS+ use?","Device administration."],["Enable AAA?","aaa new-model."],["Method list for TACACS+ then local?","aaa authentication login default group tacacs+ local."],["When does IOS try the next method?","Only when the current method gives no response."],["TACACS+ server rejects the password. Is local tried?","No. The login fails."],["Why keep a local user with AAA?","Break-glass access when servers are unreachable."],["Test a TACACS+ server from the CLI?","test aaa group tacacs+ USER PASS legacy."],["Effect of a shared key mismatch?","The server can't decrypt; it acts like no response."],["Command accounting?","aaa accounting commands 15 default start-stop group tacacs+."],["Cisco's AAA server?","Identity Services Engine (ISE)."]],
acl:[["Standard ACL matches?","Source address only."],["Extended ACL matches?","Protocol, source, destination, ports."],["Where to place a standard ACL?","Close to the destination."],["Where to place an extended ACL?","Close to the source."],["How are ACEs evaluated?","Top down, first match wins."],["What is at the end of every ACL?","An implicit deny any."],["Insert a line between 10 and 20?","Use a sequence number like 15 in a named ACL."],["Wildcard 0.0.0.255 matches?","A /24."],["host 10.1.1.1 equals?","10.1.1.1 0.0.0.0."],["How many ACLs per interface?","One per direction per protocol."],["Do outbound ACLs filter router-generated traffic?","No."],["Standard ACL number ranges?","1-99 and 1300-1999."],["Extended ACL number ranges?","100-199 and 2000-2699."],["What is CoPP?","A QoS policy that polices traffic to the control plane/CPU."],["Apply CoPP?","control-plane, service-policy input NAME."],["CoPP action to limit a class?","police (cir ... conform-action transmit exceed-action drop)."],["Why use CoPP?","Protect routing protocols and management from CPU floods."],["Catalyst 9000 default CoPP policy name?","system-cpp-policy."],["Verify CoPP?","show policy-map control-plane."]],
api:[["Transport for REST APIs?","HTTPS (TLS)."],["Is Base64 encryption?","No, it's encoding."],["HTTP Basic auth header?","Authorization: Basic base64(user:pass)."],["Catalyst Center token header?","X-Auth-Token."],["Catalyst Center token URL?","POST /dna/system/api/v1/auth/token."],["Where to store API keys?","A vault or environment variable, never in code or Git."],["OAuth 2.0 purpose?","Delegated, scoped, short-lived access tokens."],["HTTP 401?","Unauthorized: not authenticated."],["HTTP 403?","Forbidden: authenticated but not allowed."],["HTTP 429?","Too many requests: rate limited."],["Least privilege for APIs?","RBAC: give each API account only the roles it needs."]],
sec:[["NGFW adds what over a stateful firewall?","Application control, IPS, URL filtering, malware protection."],["IDS vs IPS?","IDS watches a copy and alerts; IPS is inline and blocks."],["Cisco endpoint security product?","Secure Endpoint (AMP)."],["Cisco DNS-layer security?","Umbrella."],["NetFlow-based threat visibility?","Secure Network Analytics (Stealthwatch)."],["What is an SGT?","Security Group Tag: a 16-bit role identifier."],["TrustSec phases?","Classification, propagation, enforcement."],["SGT propagation without inline tagging?","SXP over TCP."],["TrustSec enforcement?","SGACLs, at egress."],["Benefit of SGT policy?","Written by role, independent of IP addresses and VLANs."],["MACsec standard?","IEEE 802.1AE."],["MACsec scope?","Hop-by-hop Layer 2 encryption between directly connected devices."],["MACsec key protocol?","MKA (MACsec Key Agreement)."],["MACsec cipher?","AES-GCM."],["MACsec key source switch to switch?","Pre-shared key (or 802.1X)."]]
};
const DECKS=[["mgmt","Device access"],["aaa","AAA"],["acl","ACLs and CoPP"],["api","API security"],["sec","Security design"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"Which password type is reversible?",o:["Type 7","Type 5","Type 8","Type 9"],a:0,e:"Obfuscation only."},
{q:"Which stores the enable password with scrypt?",o:["enable secret (type 9)","enable password","service password-encryption","enable secret 5"],a:0,e:"Type 9."},
{q:"'crypto key generate rsa' fails with 'Please define a domain-name first'. Fix?",o:["ip domain name ...","hostname ...","ip ssh version 2","username ..."],a:0,e:"FQDN names the key."},
{q:"Which command on the VTY lines blocks Telnet?",o:["transport input ssh","no telnet","ip ssh version 2","access-class TELNET in"],a:0,e:"Only SSH allowed."},
{q:"Which restricts SSH to the management subnet?",o:["access-class with a standard ACL on line vty","ip access-group on every interface","login local","exec-timeout"],a:0,e:"Filters connections to the lines."},
{q:"What does 'login block-for 120 attempts 5 within 60' do?",o:["Blocks logins for 120 s after 5 failures in 60 s","Blocks 5 users for 120 seconds after 60 attempts","Times out idle users","Locks the console"],a:0,e:"Quiet mode."},
{q:"Which protocol encrypts the entire packet body?",o:["TACACS+","RADIUS","SNMPv2c","HTTP"],a:0,e:"RADIUS only hides the password."},
{q:"Which protocol is preferred for per-command authorization of administrators?",o:["TACACS+","RADIUS","LDAP","Kerberos"],a:0,e:"Separate authorization."},
{q:"Which ports does RADIUS use?",o:["UDP 1812 and 1813","TCP 49","UDP 49","TCP 1812"],a:0,e:"Legacy 1645/1646."},
{q:"'aaa authentication login default group tacacs+ local'. The TACACS+ server rejects the password. What happens?",o:["Login fails","The local database is tried","The enable secret is tried","No authentication"],a:0,e:"A reject is an answer."},
{q:"Same method list. The TACACS+ server is unreachable. What happens?",o:["The local database is used","Login fails","Login succeeds without a password","The router reloads"],a:0,e:"No response moves to the next method."},
{q:"A TACACS+ server is reachable but every login falls back to local. Likely cause?",o:["Shared key mismatch","Wrong username","TCP 49 open","Wrong privilege"],a:0,e:"The server can't decrypt."},
{q:"Which command tests TACACS+ authentication without logging out?",o:["test aaa group tacacs+ user pass legacy","debug aaa authentication with terminal monitor","show tacacs","ping tacacs"],a:0,e:"test aaa."},
{q:"What should be configured before 'aaa new-model' on a remote router?",o:["A local privilege 15 user","An ACL on the VTY lines","SNMPv3 users","NTP"],a:0,e:"Avoid lockout."},
{q:"Which is typically used for 802.1X network access?",o:["RADIUS","TACACS+","SSH","SNMP"],a:0,e:"EAP over RADIUS."},
{q:"A standard ACL should be placed:",o:["Close to the destination","Close to the source","On every interface","On the VTY only"],a:0,e:"It only knows the source."},
{q:"An ACL has 10 deny ip any any, 20 permit tcp any any eq 443. What happens to HTTPS?",o:["Denied by line 10","Permitted by line 20","Logged","Depends on direction"],a:0,e:"First match wins."},
{q:"Which wildcard matches 172.16.16.0/20?",o:["0.0.15.255","0.0.16.255","255.255.240.0","0.0.31.255"],a:0,e:"/20 = 255.255.240.0, wildcard 0.0.15.255."},
{q:"How do you remove line 20 from a named ACL?",o:["no 20 under the ACL","no access-list","Delete and recreate only","clear access-list 20"],a:0,e:"Sequence numbers."},
{q:"What's at the end of every ACL?",o:["An implicit deny any","An implicit permit any","A log entry","Nothing"],a:0,e:"Implicit deny."},
{q:"What does CoPP protect?",o:["The route processor/CPU","The data plane","The access ports","DHCP"],a:0,e:"Control plane traffic."},
{q:"Which direction is a CoPP service policy applied?",o:["Input on control-plane","Output on control-plane","Input on every interface","Output on the WAN"],a:0,e:"Traffic to the CPU."},
{q:"Which QoS action does CoPP use to limit a class?",o:["police","shape","bandwidth","priority"],a:0,e:"Drop the excess."},
{q:"A script calls Catalyst Center and receives 401. What's wrong?",o:["Missing or expired token","Too many requests","Resource not found","Server error"],a:0,e:"Not authenticated."},
{q:"A monitoring account can read but gets 403 when trying to change a device. Why?",o:["It's authenticated but not authorized (RBAC)","The token expired and must be refreshed","Wrong URL","Rate limit"],a:0,e:"Forbidden."},
{q:"Why is HTTP Basic authentication acceptable only over HTTPS?",o:["Base64 is easily decoded","It's too slow","It needs certificates","It expires"],a:0,e:"Encoding, not encryption."},
{q:"Where should an API key used by a script be stored?",o:["A secrets vault or environment variable","Hard-coded in the script","In the Git repo","In the URL"],a:0,e:"Keep it out of code."},
{q:"What does a TrustSec SGT represent?",o:["A role or group, independent of IP address","A VLAN mapped to a security zone","A VRF","A QoS class"],a:0,e:"Security group."},
{q:"How are SGTs carried to a device that can't tag packets inline?",o:["SXP","CDP","LLDP","OSPF"],a:0,e:"SGT Exchange Protocol."},
{q:"What enforces TrustSec policy?",o:["SGACLs","VLAN ACLs","Route maps","PBR"],a:0,e:"Group-based ACLs."},
{q:"Which standard defines MACsec?",o:["IEEE 802.1AE","IEEE 802.1X","IEEE 802.1Q","IEEE 802.11i"],a:0,e:"Key agreement via MKA."},
{q:"MACsec encrypts traffic:",o:["Hop by hop between directly connected devices","End to end between hosts","Only at the WAN edge","Only for wireless"],a:0,e:"Layer 2."},
{q:"Which tool blocks connections to malicious domains at the DNS layer?",o:["Umbrella","Secure Endpoint","ISE","Secure Network Analytics"],a:0,e:"DNS-layer security."},
{q:"Which adds application visibility, IPS and URL filtering to a stateful firewall?",o:["NGFW","ACL","CoPP","uRPF"],a:0,e:"Next-generation firewall."},
{q:"What's the difference between an IDS and an IPS?",o:["IPS is inline and can block; IDS only alerts","IDS is newer and replaces IPS in modern networks","IPS only logs","No difference"],a:0,e:"Inline vs passive."}
];

registerModule({
  id:"sec",slug:"security",title:"Security",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["pwtypes","vtycheck","aaacmp","aaaflow","method","wildcard","aclorder","copp","apiauth","secparts","trustsec","secpick"],
  viz(){
revealViz($("#viz-pwtypes"),{title:"How IOS stores passwords",cols:3,done:"Explored the password types",items:[
  ["Type 0","Plain text","enable password cisco with no encryption. Anyone who sees the config sees the password."],
  ["Type 7","Obfuscated","service password-encryption. Free web tools reverse it instantly."],
  ["Type 5","MD5","The old default for enable secret. Salted, but fast to brute-force with GPUs."],
  ["Type 8","PBKDF2-SHA256","enable algorithm-type sha256 secret ... Slow by design."],
  ["Type 9","scrypt","enable algorithm-type scrypt secret ... (the IOS XE default). Memory-hard, the best choice."],
  ["Best practice","Secrets + AAA","Use secrets, not passwords; keep admin accounts on TACACS+; keep one strong local break-glass user."]]});

quizViz($("#viz-vtycheck"),{title:"Audit these VTY configurations",done:"Audited every VTY configuration",qs:[
  ["<pre class=\"term\">line vty 0 15\n password cisco\n login\n transport input all</pre>",["Telnet allowed and a shared line password","Secure","Only console access","SSH only"],0,"Use login local or AAA and transport input ssh."],
  ["<pre class=\"term\">line vty 0 15\n login local\n transport input ssh</pre> but no RSA keys exist.",["SSH can't work until RSA keys are generated","It's fine","Telnet will be used","Console only"],0,"crypto key generate rsa modulus 2048 (needs a domain name)."],
  ["<pre class=\"term\">line vty 0 4\n login local\n transport input ssh\n access-class MGMT in\nline vty 5 15\n login local\n transport input ssh</pre>",["VTYs 5 to 15 aren't restricted by the ACL","Everything is secure","Line 0 is broken","Access-class needs out"],0,"Apply hardening to all of 0 15."],
  ["<pre class=\"term\">ip access-list standard MGMT\n permit 10.99.0.0 0.0.0.255\nline vty 0 15\n access-class MGMT out</pre>",["'out' filters sessions started from the router; use 'in'","Correct","Standard ACLs can't be used","The wildcard is wrong"],0,"in = who can connect to the router."]]});

sortViz($("#viz-aaacmp"),{title:"RADIUS or TACACS+?",bins:{r:"RADIUS",t:"TACACS+",b:"Both"},done:"Compared RADIUS and TACACS+",items:[
  ["TCP port 49","t",""],["UDP 1812 and 1813","r",""],["Encrypts the whole payload","t",""],["Encrypts only the password","r",""],["Per-command authorization","t",""],["802.1X for wireless users","r",""],["Supported by Cisco ISE","b",""],["Separates authentication and authorization","t",""],["Used for VPN user access","r",""],["Accounting records","b",""]]});

seqViz($("#viz-aaaflow"),{title:"An administrator logs in through TACACS+",left:"R1",right:"ISE",done:"Followed a TACACS+ login",intro:"admin opens SSH to R1. R1's list is 'group tacacs+ local'.",steps:[
  {dir:"r",label:"START",sub:"TCP 49, encrypted",text:"R1 opens a TCP session to ISE and starts authentication for user admin."},
  {dir:"l",label:"REPLY: GETPASS",sub:"",text:"ISE asks for the password; R1 prompts the user."},
  {dir:"r",label:"CONTINUE",sub:"password",text:"R1 sends the password, encrypted with the shared key."},
  {dir:"l",label:"REPLY: PASS",sub:"authenticated",text:"Credentials are valid."},
  {dir:"r",label:"Authorization REQUEST",sub:"service=shell",text:"A separate exchange: what privilege level and commands does admin get?"},
  {dir:"l",label:"Authorization PASS_ADD",sub:"priv-lvl=15",text:"ISE returns the privilege level. Each command can also be authorized one at a time."},
  {dir:"r",label:"Accounting START",sub:"",text:"R1 records the session, and later each command typed."}],end:"With RADIUS, authentication and authorization come back together in one Access-Accept."});

stepViz($("#viz-method"),{title:"Walk the method list: group tacacs+ local",done:"Walked the AAA method list",steps:[
  ["Both servers up, right password","ISE answers PASS. Logged in through TACACS+. The local database is never checked."],
  ["Both servers up, wrong password","ISE answers FAIL. That's an answer, so IOS stops here: access denied, even if the local user has that password."],
  ["ISE unreachable","No response after the timeout. IOS moves to the next method: local. The break-glass user can log in."],
  ["Wrong shared key on R1","ISE can't decrypt the request and drops it. To R1 that looks like no response, so it falls back to local. The symptom: AAA 'works' but always through local accounts."],
  ["No local user configured","ISE unreachable and the local database is empty: no one can log in remotely. Only the console (if it uses a different list) saves you."]]});

/* ---- wildcard calculator ---- */
(function(){const el=$("#viz-wildcard");const C=[[24,"10.1.10.0"],[20,"172.16.16.0"],[30,"192.168.1.4"],[26,"10.5.0.64"],[32,"10.9.9.9"],[16,"10.20.0.0"]];let k=0,pick=null;const solved=new Set();
  const wc=l=>{const m=l===0?0:(0xFFFFFFFF<<(32-l))>>>0;const w=(~m)>>>0;return [24,16,8,0].map(s=>(w>>>s)&255).join(".")};
  function opts(l){const r=new Set([wc(l)]);[l-1,l+1,l+8].forEach(x=>{if(x>=8&&x<=32)r.add(wc(x))});r.add([24,16,8,0].map(s=>(((0xFFFFFFFF<<(32-l))>>>0)>>>s)&255).join("."));return [...r].slice(0,4).sort()}
  function draw(){const [l,n]=C[k];const O=opts(l);el.innerHTML=`<div class="viz-title">Wildcard mask trainer</div><p>Match <b>${n}/${l}</b> in an ACL. Which wildcard?</p><div class="chips">${O.map(o=>`<button class="chip" data-o="${o}" ${pick?"disabled":""}>${o}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${pick?(pick===wc(l)?`<span class="status-good">Right.</span> `:`<span class="status-bad">Not quite.</span> `)+`/${l} has ${32-l} host bits, so the wildcard is ${wc(l)}${l===32?" (or use the 'host' keyword)":""}. Subtract the mask from 255.255.255.255.`:""}</div>
    <div class="viz-controls"><button class="btn" data-n ${pick?"":"disabled"}>Next</button><span class="s-small">${solved.size} of ${C.length} right</span></div>`;}
  el.addEventListener("click",e=>{const o=e.target.closest("[data-o]");if(o&&!pick){pick=o.dataset.o;if(pick===wc(C[k][0]))solved.add(k);if(solved.size>=4)award("viz:wildcard",20,"Calculated wildcard masks");draw();return}
    if(e.target.closest("[data-n]")){k=(k+1)%C.length;pick=null;draw()}});draw()})();

quizViz($("#viz-aclorder"),{title:"Which line matches first?",done:"Traced every ACL match",qs:[
  ["<pre class=\"term\">10 permit tcp 10.1.10.0 0.0.0.255 any eq 443\n20 deny   tcp any any eq 443\n30 permit ip any any</pre>Packet: 10.1.10.5 → 8.8.8.8 TCP 443",["Line 10, permitted","Line 20, denied","Line 30","Implicit deny"],0,"First match."],
  ["Same ACL. Packet: 10.1.20.5 → 8.8.8.8 TCP 443",["Line 20, denied","Line 10","Line 30, permitted","Implicit deny"],0,"Not in 10.1.10.0/24."],
  ["<pre class=\"term\">10 deny   icmp any any\n20 permit icmp 10.99.0.0 0.0.0.255 any echo</pre>Packet: ping from 10.99.0.7",["Line 10, denied: line 20 is never reached","Line 20, permitted","Implicit deny","Both"],0,"Put specific lines first."],
  ["<pre class=\"term\">10 permit tcp any host 10.1.20.100 eq 22</pre>Packet: 10.1.10.5 → 10.1.20.100 UDP 53",["Implicit deny","Line 10","Permitted, no match means permit","Logged"],0,"Every ACL ends with deny any."],
  ["<pre class=\"term\">10 permit ip 10.1.0.0 0.0.255.255 any</pre>Packet from 10.2.0.1",["Implicit deny","Line 10","Permitted","Error"],0,"10.1.0.0/16 doesn't include 10.2.x.x."]]});

stepViz($("#viz-copp"),{title:"Control Plane Policing during an attack",done:"Watched CoPP defend the CPU",steps:[
  ["Normal day","The router forwards 5 Gbps in hardware. Its CPU only sees routing protocol packets, SSH, SNMP and a few pings: a few hundred packets per second."],
  ["The attack","Someone floods 200,000 pings per second at the router's own address. Every one goes to the CPU."],
  ["Without CoPP","The CPU hits 100%. OSPF hellos are missed, the dead timer expires, adjacencies drop, and traffic for the whole site is lost. SSH times out, so you can't log in to fix it."],
  ["Classify","With CoPP, class-maps sort CPU-bound traffic: ROUTING (OSPF, BGP), MGMT (SSH, SNMP from management subnets), ICMP, and class-default."],
  ["Police","The policy allows ROUTING a generous rate, MGMT a moderate one, ICMP 64 kbps, and class-default a low rate. Excess ICMP is dropped before it reaches the CPU."],
  ["Result","Pings beyond the limit are lost, but OSPF stays up and you can still SSH in. show policy-map control-plane shows the drop counters climbing on COPP-ICMP."]]});

revealViz($("#viz-apiauth"),{title:"REST API authentication methods",cols:2,done:"Compared API authentication methods",items:[
  ["HTTP Basic","Every request","Authorization: Basic dXNlcjpwYXNz (user:pass in Base64). Simple, but the credentials travel with every call: TLS is essential."],
  ["Token","Login once","POST credentials to get a token, then send X-Auth-Token or Authorization: Bearer on each call. Tokens expire, limiting the damage if one leaks."],
  ["API key","Per application","A long random secret for one integration. Easy to revoke and rotate. Never commit it to Git."],
  ["OAuth 2.0","Delegated","An authorization server issues scoped, short-lived access tokens (and refresh tokens). The app never sees the user's password."]]});

revealViz($("#viz-secparts"),{title:"Security design components",cols:3,done:"Explored the security components",items:[
  ["Secure Firewall (NGFW)","Perimeter and segments","Stateful filtering plus app control, IPS, URL filtering and malware analysis."],
  ["ISE","Identity and policy","Endpoint authentication, TACACS+ device administration, and SGT assignment."],
  ["Secure Endpoint","Hosts","Malware protection with retrospective detection on laptops and servers."],
  ["Umbrella","DNS and cloud","Blocks malicious domains for users on and off the network."],
  ["Secure Network Analytics","Visibility","NetFlow-based behavior models detect insider threats and malware spreading."],
  ["MACsec","Links","802.1AE encryption on cables between switches and to hosts."]]});

stepViz($("#viz-trustsec"),{title:"TrustSec end to end",done:"Followed TrustSec end to end",steps:[
  ["Classification","A contractor's laptop authenticates to ISE, and ISE's policy returns SGT 20 (Contractors). The access switch tags all its traffic with 20, whatever IP address it gets."],
  ["Propagation: inline","On TrustSec-capable links, the SGT rides in a Cisco Meta Data header in each frame."],
  ["Propagation: SXP","An older switch can't tag, so it tells the next hop over SXP: '10.1.30.45 is SGT 20'."],
  ["Enforcement","At the data center switch in front of Finance servers (SGT 50), the SGACL matrix cell Contractors → Finance says deny. The packet is dropped at egress."],
  ["Why it scales","Moving the contractor to another floor, VLAN or subnet changes nothing: the policy follows the group. The same SGTs are used inside SD-Access fabrics."]]});

quizViz($("#viz-secpick"),{title:"Which security technology fits?",done:"Matched every security technology",qs:[
  ["Fiber between two buildings passes through a shared conduit. Encrypt everything on that link at line rate.",["MACsec","IPsec","TrustSec","SSL VPN"],0,"802.1AE."],
  ["IP cameras must reach only the video server, wherever they're plugged in.",["TrustSec SGTs with SGACLs","Port security","VLAN ACL per switch","CoPP"],0,"Role-based."],
  ["Block users from reaching newly registered phishing domains, even at home.",["Umbrella","CoPP","MACsec","NetFlow"],0,"DNS layer."],
  ["Detect a host quietly copying gigabytes from many servers.",["Secure Network Analytics (NetFlow)","BPDU Guard","Port security","Type 9 secrets"],0,"Behavioral analytics."]]});
  },
  sims:[
    {id:"vtylab",type:"ios",title:"Harden remote access",lab:{
      scenario:"R1 accepts Telnet from anywhere with a shared password. Fix it: SSH version 2 only with 2048-bit keys, a local admin user with a type 9 secret, VTY access only from 10.99.0.0/24 (ACL MGMT), a 10-minute idle timeout, brute-force protection, and encrypted passwords in the config.",
      devices:[{name:"R1",kind:"router"}],links:[],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.99.0.1 255.255.255.0","no shutdown","line vty 0 15","password cisco","login","transport input all"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[300,70]},topoH:120,
      tasks:[
        {t:"Domain name corp.local and 2048-bit RSA keys",hint:"ip domain name corp.local\ncrypto key generate rsa modulus 2048",check:(w,D)=>D.R1.rsa>=2048},
        {t:"SSH version 2",hint:"ip ssh version 2",check:(w,D)=>D.R1.sshv===2},
        {t:"User admin, privilege 15, secret Adm1n!Secret",hint:"username admin privilege 15 secret Adm1n!Secret",check:(w,D)=>D.R1.users.admin?.priv===15&&D.R1.users.admin.secret!=null},
        {t:"Standard ACL MGMT permits 10.99.0.0/24",hint:"ip access-list standard MGMT\npermit 10.99.0.0 0.0.0.255",check:(w,D)=>!!D.R1.acls.MGMT},
        {t:"VTY 0-15: login local, SSH only, access-class MGMT in, exec-timeout 10 0",hint:"line vty 0 15\nlogin local\ntransport input ssh\naccess-class MGMT in\nexec-timeout 10 0",check:(w,D)=>{const L=D.R1.lines.vty;return L.local&&L.transport==="ssh"&&L.acl==="MGMT"&&L.timeout&&L.timeout[0]===10}},
        {t:"Block logins for 120 s after 5 failures in 60 s",hint:"login block-for 120 attempts 5 within 60",check:(w,D)=>String(D.R1.extra.loginBlock)==="120,5,60"},
        {t:"Encrypt any remaining plain-text passwords",hint:"service password-encryption",check:(w,D)=>D.R1.pwEnc}],
      solution:"configure terminal\nip domain name corp.local\ncrypto key generate rsa modulus 2048\nip ssh version 2\nusername admin privilege 15 secret Adm1n!Secret\nip access-list standard MGMT\npermit 10.99.0.0 0.0.0.255\nexit\nline vty 0 15\nlogin local\ntransport input ssh\naccess-class MGMT in\nexec-timeout 10 0\nexit\nlogin block-for 120 attempts 5 within 60\nservice password-encryption",
      success:"The old line password is now unused (login local replaced it). Look at show running-config: the secret is type 9, and the leftover line password is only type 7."}},
    {id:"aaalab",type:"ios",title:"TACACS+ with a local fallback",lab:{
      scenario:"R1 should authenticate administrators against ISE (10.0.0.20) with TACACS+, falling back to the local admin user only if ISE is unreachable. A colleague started the config, but logins through ISE don't work. The ISE shared key is T@cacsK3y and the test account is netops / Tac!Pass.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],
      hosts:[{name:"ISE",ip:"10.0.0.20",gw:"10.0.0.1",at:"SW1:g1/0/2",aaa:{key:"T@cacsK3y",users:{netops:"Tac!Pass"}}}],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.0.0.1 255.255.255.0","no shutdown","tacacs server ISE","address ipv4 10.0.0.20","key Tacacs123"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[160,70],SW1:[340,70],ISE:[500,70]},topoH:130,
      events:[{label:"ISE goes offline",run:(w,D)=>{D.SW1.ifs[IOS.ifName("g1/0/2")].shut=true;return "SW1: G1/0/2 (ISE) down"}},{label:"ISE back online",run:(w,D)=>{D.SW1.ifs[IOS.ifName("g1/0/2")].shut=false;return "SW1: G1/0/2 (ISE) up"}}],
      tasks:[
        {t:"Create the local break-glass user admin (privilege 15, secret Br3akGl@ss!) before enabling AAA",hint:"username admin privilege 15 secret Br3akGl@ss!",check:(w,D)=>D.R1.users.admin?.priv===15,sticky:true},
        {t:"Enable AAA with login list: TACACS+ first, then local",hint:"aaa new-model\naaa authentication login default group tacacs+ local",check:(w,D)=>D.R1.aaa&&/^group tacacs\+ local$/.test(D.R1.aaaLogin||""),sticky:true},
        {t:"Fix the shared key so netops is accepted by ISE",hint:"tacacs server ISE\nkey T@cacsK3y\n(then: do test aaa group tacacs+ netops Tac!Pass legacy)",check:(w,D)=>{const r=IOS.aaaLogin(w,D.R1,"vty","netops","Tac!Pass");return r.ok&&r.method==="ISE"},sticky:true},
        {t:"Take ISE offline and prove admin can still log in locally",hint:"(press ISE goes offline)\ndo test aaa group tacacs+ netops Tac!Pass legacy",check:(w,D)=>D.SW1.ifs[IOS.ifName("g1/0/2")].shut&&IOS.aaaLogin(w,D.R1,"vty","admin","Br3akGl@ss!").method==="local"&&IOS.aaaLogin(w,D.R1,"vty","admin","Br3akGl@ss!").ok,sticky:true}],
      solution:"configure terminal\nusername admin privilege 15 secret Br3akGl@ss!\naaa new-model\naaa authentication login default group tacacs+ local\ntacacs server ISE\nkey T@cacsK3y\nend\ntest aaa group tacacs+ netops Tac!Pass legacy\n(press ISE goes offline)\ntest aaa group tacacs+ netops Tac!Pass legacy",
      success:"With the wrong key, ISE silently dropped the requests, so R1 would have fallen back to local and hidden the problem. And with ISE up, a wrong password is rejected outright: local is used only when ISE doesn't answer."}},
    {id:"aclfix",type:"ios",title:"Fix the server protection ACL",lab:{
      scenario:"Users on 10.1.10.0/24 (G0/0/1) must reach the web server 10.1.20.100 (G0/0/2) on HTTPS and be able to ping it, and nothing else: Telnet and SSH to it must be blocked. The ACL SRV-PROTECT was written but it isn't working. Test from the PC (use the ping and telnet checks in the tasks) and fix it.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"],["R1:g0/0/2","SW2:g1/0/1"]],
      hosts:[{name:"PC",ip:"10.1.10.50",gw:"10.1.10.1",at:"SW1:g1/0/2"},{name:"SRV",ip:"10.1.20.100",gw:"10.1.20.1",at:"SW2:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.1.10.1 255.255.255.0","no shutdown","interface g0/0/2","ip address 10.1.20.1 255.255.255.0","no shutdown","ip access-list extended SRV-PROTECT","10 permit tcp 10.1.10.0 0.0.0.255 host 10.1.20.100 eq www","20 deny icmp any any","30 permit icmp 10.1.10.0 0.0.0.255 host 10.1.20.100 echo","interface g0/0/2","ip access-group SRV-PROTECT in"]},
      consoles:["R1"],startMode:"priv",topo:{SW1:[80,70],R1:[300,70],SW2:[520,70],PC:[80,150],SRV:[520,150]},topoH:180,
      tasks:[
        {t:"Read the ACL with its hit counters",hint:"show access-lists SRV-PROTECT",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* (ip )?access-l/i)},
        {t:"Apply it so it filters traffic going toward the server (it's applied in the wrong direction)",hint:"interface g0/0/2\nno ip access-group SRV-PROTECT in\nip access-group SRV-PROTECT out",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/2")].acl.out==="SRV-PROTECT"&&!D.R1.ifs[IOS.ifName("g0/0/2")].acl.in},
        {t:"PC can reach SRV on HTTPS (TCP 443)",hint:"ip access-list extended SRV-PROTECT\nno 10\n10 permit tcp 10.1.10.0 0.0.0.255 host 10.1.20.100 eq 443",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/2")].acl.out==="SRV-PROTECT"&&hostPing(w,"PC","10.1.20.100",{proto:"tcp",port:443})},
        {t:"PC can ping SRV",hint:"no 20  (the deny icmp line hides the permit below it)",check:(w)=>hostPing(w,"PC","10.1.20.100")&&!!w.devs.R1.ifs[IOS.ifName("g0/0/2")].acl.out},
        {t:"Telnet (23) and SSH (22) from PC to SRV stay blocked",hint:"Check that nothing permits them; the implicit deny does the rest",check:(w,D)=>!!D.R1.ifs[IOS.ifName("g0/0/2")].acl.out&&!hostPing(w,"PC","10.1.20.100",{proto:"tcp",port:23})&&!hostPing(w,"PC","10.1.20.100",{proto:"tcp",port:22})&&hostPing(w,"PC","10.1.20.100",{proto:"tcp",port:443})}],
      solution:"show access-lists SRV-PROTECT\nconfigure terminal\ninterface g0/0/2\nno ip access-group SRV-PROTECT in\nip access-group SRV-PROTECT out\nip access-list extended SRV-PROTECT\nno 10\n10 permit tcp 10.1.10.0 0.0.0.255 host 10.1.20.100 eq 443\nno 20",
      success:"Three bugs: the wrong direction (inbound on G0/0/2 only sees the server's traffic), the wrong port (www is 80), and a deny above a permit. Sequence numbers let you fix single lines without retyping the ACL."}},
    {id:"copplab",type:"ios",title:"Protect the CPU with CoPP",lab:{
      scenario:"R1's CPU spiked during a ping flood last week and OSPF dropped. Build a CoPP policy: ICMP to the router is policed to 64 kbps (excess dropped), and apply it to the control plane.",
      devices:[{name:"R1",kind:"router"}],links:[],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.0.0.1 255.255.255.0","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[300,70]},topoH:120,
      tasks:[
        {t:"Extended ACL ICMP-ACL permits icmp any any",hint:"ip access-list extended ICMP-ACL\npermit icmp any any",check:(w,D)=>!!D.R1.acls["ICMP-ACL"]},
        {t:"Class map COPP-ICMP matches ICMP-ACL",hint:"class-map match-all COPP-ICMP\nmatch access-group name ICMP-ACL",check:(w,D)=>(D.R1.cmaps["COPP-ICMP"]?.matches||[]).some(m=>String(m.v)==="ICMP-ACL")},
        {t:"Policy map COPP polices COPP-ICMP to 64000 bps, dropping the excess",hint:"policy-map COPP\nclass COPP-ICMP\npolice cir 64000 conform-action transmit exceed-action drop",check:(w,D)=>(D.R1.pmaps.COPP?.classes||[]).some(c=>c.cls==="COPP-ICMP"&&c.act.police&&c.act.police.cir===64000&&c.act.police.exceed==="drop")},
        {t:"Apply COPP to the control plane",hint:"control-plane\nservice-policy input COPP",check:(w,D)=>D.R1.cpSvc==="COPP"},
        {t:"Verify it",hint:"do show policy-map control-plane",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* pol\S*-map con/i)}],
      solution:"configure terminal\nip access-list extended ICMP-ACL\npermit icmp any any\nexit\nclass-map match-all COPP-ICMP\nmatch access-group name ICMP-ACL\nexit\npolicy-map COPP\nclass COPP-ICMP\npolice cir 64000 conform-action transmit exceed-action drop\nexit\nexit\ncontrol-plane\nservice-policy input COPP\ndo show policy-map control-plane",
      success:"Try 'service-policy output COPP' under control-plane: CoPP protects the CPU from what comes in."}},
    {id:"aaapick",type:"choice",title:"AAA design decisions",scenario:"A network team is designing AAA for routers, switches and wireless. Choose the best option for each requirement.",success:"TACACS+ for administrators, RADIUS for network access, and always a local fallback.",steps:[
      ["The security team wants a record of every command each administrator types on core routers.",["TACACS+ command accounting","RADIUS accounting","Syslog only","SNMP traps"],0,"aaa accounting commands 15 ... group tacacs+."],
      ["Wireless employees should authenticate individually with their AD accounts.",["802.1X with RADIUS to ISE","TACACS+","A shared PSK","Local users on the WLC"],0,"Network access = RADIUS."],
      ["Junior admins may run show commands but not configure anything.",["TACACS+ command authorization","RADIUS with a VLAN","enable secret","login local"],0,"Per-command."],
      ["ISE is unreachable during a WAN outage at a branch. Admins still need in.",["A local fallback method in the list","No AAA","Telnet","Disable the VTYs"],0,"group tacacs+ local."],
      ["You're replacing a vendor-neutral AAA setup that must work with non-Cisco switches for 802.1X.",["RADIUS","TACACS+","Kerberos","SXP"],0,"Open standard, universal for 802.1X."]]},
    {id:"trustorder",type:"order",title:"Put TrustSec in order",scenario:"A contractor plugs a laptop into the network. Put the TrustSec steps in the order they happen.",success:"Classify, propagate, enforce.",steps:["The endpoint authenticates to ISE","ISE assigns an SGT in the authorization result","The access switch tags the endpoint's traffic","The SGT is carried inline or shared with SXP","The egress switch looks up source SGT × destination SGT","The SGACL permits or drops the traffic"]}
  ],
  badges:[
    ["reader","SEC","Security Scholar","Mark all 5 security lessons studied",c=>c.allStudied()],
    ["lab","SHD","Shield Wall","Complete every diagram in this module",c=>c.vizAll()],
    ["ssh","SSH","No More Telnet","Pass the remote access hardening lab",c=>c.passed("vtylab")],
    ["aaa","T+","Gatekeeper","Pass the TACACS+ lab",c=>c.passed("aaalab")],
    ["acl","ACE","First Match Wins","Fix the ACL and train wildcard masks",c=>c.passed("aclfix")&&c.earned("viz:wildcard")],
    ["copp","CPU","CPU Bodyguard","Pass the CoPP lab",c=>c.passed("copplab")],
    ["design","AAA","Policy Architect","Pass the AAA design decisions",c=>c.passed("aaapick")],
    ["sgt","SGT","Tagged","Put TrustSec in order",c=>c.passed("trustorder")],
    ["perfect","SEC","Locked Down","Score 100% on a security quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
