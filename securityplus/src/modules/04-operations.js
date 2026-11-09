/* ================= Module 4: Security Operations (SY0-701 Domain 4.0, 28%) ================= */
(function(){
const LESSONS=[
{id:"baseline",num:"4.1",title:"Secure baselines and hardening targets",html:`
<p>A <b>secure baseline</b> is the approved, hardened configuration for a type of system. You <b>establish</b> it (often from CIS Benchmarks or vendor guides), <b>deploy</b> it with tools like Group Policy or configuration management, and <b>maintain</b> it as threats and software change.</p>
<p>Every <b>hardening target</b> needs its own baseline: <b>mobile devices</b>, <b>workstations</b>, <b>switches</b>, <b>routers</b>, <b>cloud infrastructure</b>, <b>servers</b>, <b>ICS/SCADA</b>, <b>embedded systems</b>, <b>RTOS</b> and <b>IoT devices</b>.</p>
<div class="viz" id="viz-baselines"></div>`},
{id:"wireless",num:"4.2",title:"Wireless, mobile and application security",html:`
<h3>Wireless installation</h3>
<p>A <b>site survey</b> maps coverage and interference before APs go in. A <b>heat map</b> shows signal strength across the floor plan, so you avoid dead spots and signal leaking into the parking lot.</p>
<h3>Mobile deployment models</h3>
<ul><li><b>BYOD</b> (bring your own device): employee-owned. Cheap for the company, hardest to control.</li>
<li><b>COPE</b> (corporate-owned, personally enabled): company-owned, personal use allowed. Full control.</li>
<li><b>CYOD</b> (choose your own device): the employee picks from an approved list, and the company owns it.</li></ul>
<p><b>Mobile device management (MDM)</b> enforces passcodes, encryption, app rules and remote wipe. Connection methods include <b>cellular</b>, <b>Wi-Fi</b> and <b>Bluetooth</b>, each with its own risks.</p>
<div class="viz" id="viz-deploy"></div>
<h3>Wireless security settings</h3>
<ul><li><b>WPA3</b>: replaces WPA2. Uses <b>SAE</b> (Simultaneous Authentication of Equals) instead of a pre-shared key handshake, which resists offline password cracking.</li>
<li><b>WPA3-Enterprise</b> uses <b>802.1X</b> with a <b>RADIUS</b> server for per-user authentication (AAA).</li>
<li>Avoid WEP and WPA/TKIP entirely.</li></ul>
<h3>Application security</h3>
<ul><li><b>Input validation</b>: accept only what's expected, on the server.</li>
<li><b>Secure cookies</b>: the <b>Secure</b> flag (HTTPS only) and <b>HttpOnly</b> (no JavaScript access).</li>
<li><b>Static code analysis</b> (SAST): scans source code without running it. <b>Dynamic analysis</b> (DAST) tests the running app.</li>
<li><b>Code signing</b>: proves who published the code and that it wasn't altered.</li>
<li><b>Sandboxing</b>: runs untrusted code in an isolated environment.</li></ul>`},
{id:"assets",num:"4.3",title:"Asset management",html:`
<p>You can't protect what you don't know you have. Asset management tracks every device, license and data store through its life.</p>
<ul><li><b>Acquisition and procurement</b>: buy from approved vendors with security requirements in the contract.</li>
<li><b>Assignment and accounting</b>: every asset has an <b>owner</b> and a <b>classification</b>.</li>
<li><b>Monitoring and asset tracking</b>: keep an <b>inventory</b> and use <b>enumeration</b> (network discovery) to find devices nobody registered.</li>
<li><b>Disposal and decommissioning</b>: <b>sanitization</b> (secure wipe so data can't be recovered), <b>destruction</b> (shredding, degaussing, incineration), <b>certification</b> (a certificate of destruction from the vendor) and <b>data retention</b> (keep what the law requires, delete the rest).</li></ul>
<div class="viz" id="viz-assetlc"></div>`},
{id:"vuln",num:"4.4",title:"Vulnerability management",html:`
<h3>Identification</h3>
<ul><li><b>Vulnerability scans</b>: credentialed (logs in, sees more) or non-credentialed (outside view).</li>
<li><b>Application security</b>: static analysis, dynamic analysis and <b>package monitoring</b> (tracking vulnerable libraries in your software).</li>
<li><b>Threat feeds</b>: <b>OSINT</b> (open-source intelligence), <b>proprietary</b> third-party feeds, <b>ISACs</b> (information sharing and analysis centers for each industry) and the <b>dark web</b>.</li>
<li><b>Penetration testing</b>, <b>responsible disclosure programs</b>, <b>bug bounty programs</b> and <b>system and process audits</b>.</li></ul>
<h3>Analysis</h3>
<ul><li><b>Confirmation</b>: a <b>false positive</b> reports a problem that isn't there. A <b>false negative</b> misses one that is. False negatives are more dangerous.</li>
<li><b>CVE</b>: a unique ID for a public vulnerability. <b>CVSS</b>: a 0 to 10 severity score.</li>
<li><b>Prioritize</b> using CVSS plus <b>exposure factor</b>, <b>environmental variables</b> (is it internet-facing?), <b>industry and organizational impact</b> and <b>risk tolerance</b>.</li></ul>
<div class="viz" id="viz-cvss"></div>
<h3>Response, validation and reporting</h3>
<p><b>Remediate</b> by <b>patching</b>. If you can't, use <b>segmentation</b>, <b>compensating controls</b>, <b>insurance</b>, or a documented <b>exception or exemption</b>. Then <b>validate</b>: <b>rescan</b>, <b>audit</b> and <b>verify</b> the fix. Finally, <b>report</b> to stakeholders.</p>
<div class="viz" id="viz-fpfn"></div>`},
{id:"monitor",num:"4.5",title:"Security monitoring and alerting",html:`
<p>Monitor <b>systems</b>, <b>applications</b> and <b>infrastructure</b>. The activities: <b>log aggregation</b>, <b>alerting</b>, <b>scanning</b>, <b>reporting</b> and <b>archiving</b>. When an alert fires, respond: <b>quarantine</b> the threat, and use <b>alert tuning</b> to cut false positives so real alerts aren't buried.</p>
<h3>Tools</h3>
<ul><li><b>SIEM</b> (security information and event management): collects and correlates logs from everything, then alerts.</li>
<li><b>SCAP</b> (Security Content Automation Protocol): standard formats for checking configurations against <b>benchmarks</b> such as CIS.</li>
<li><b>Agents vs agentless</b>: software on each host, or remote collection.</li>
<li><b>Antivirus</b>, <b>DLP</b> (data loss prevention), <b>vulnerability scanners</b>.</li>
<li><b>SNMP traps</b>: devices push alerts to a management server.</li>
<li><b>NetFlow</b>: records who talked to whom, when and how much. Great for spotting exfiltration.</li></ul>
<div class="viz" id="viz-siem"></div>`},
{id:"enterprise",num:"4.6",title:"Firewalls, filtering and email security",html:`
<h3>Firewalls and IDS/IPS</h3>
<p>Firewall <b>rules</b> and <b>access lists</b> are checked top-down, first match wins, with an implicit deny at the end. Only open the <b>ports and protocols</b> you need, and put public servers in a <b>screened subnet</b>. IDS/IPS use <b>signatures</b> (known patterns) and <b>trends</b> (anomalies over time).</p>
<div class="viz" id="viz-fwrules"></div>
<h3>Web and DNS filtering</h3>
<p><b>Web filters</b> can be <b>agent-based</b> (follows the laptop anywhere) or a <b>centralized proxy</b>. They use <b>URL scanning</b>, <b>content categorization</b>, <b>block rules</b> and <b>reputation</b>. <b>DNS filtering</b> refuses to resolve known-bad domains.</p>
<h3>Email security</h3>
<ul><li><b>SPF</b>: a DNS record listing which servers may send mail for your domain.</li>
<li><b>DKIM</b>: the sending server signs each message. Receivers check the signature with a public key in DNS.</li>
<li><b>DMARC</b>: tells receivers what to do when SPF or DKIM fail, and that the visible From domain must align: <span class="mono">p=none</span>, <span class="mono">p=quarantine</span> or <span class="mono">p=reject</span>. It also sends reports.</li>
<li>An <b>email gateway</b> filters spam, malware and phishing before it reaches mailboxes.</li></ul>
<div class="viz" id="viz-mail"></div>
<h3>More capabilities</h3>
<ul><li><b>OS security</b>: <b>Group Policy</b> (Windows) and <b>SELinux</b> (mandatory access control on Linux).</li>
<li><b>Secure protocols</b>: choose the protocol, the port and the transport method (for example SFTP on 22, not FTP on 21).</li>
<li><b>File integrity monitoring (FIM)</b>: alerts when critical files change.</li>
<li><b>DLP</b>: blocks sensitive data from leaving.</li>
<li><b>NAC</b>: checks devices before letting them on the network.</li>
<li><b>EDR</b> (endpoint detection and response) and <b>XDR</b> (extended, across endpoints, network, cloud and email).</li>
<li><b>User behavior analytics (UBA)</b>: flags users acting unlike themselves.</li></ul>`},
{id:"iam",num:"4.7",title:"Identity and access management",html:`
<h3>Account life cycle</h3>
<p><b>Provisioning and deprovisioning</b> accounts, <b>permission assignments</b>, and <b>identity proofing</b> (verifying someone is who they claim before creating their account). <b>Attestation</b> is a periodic review where managers confirm their staff's access is still needed.</p>
<h3>Federation and SSO</h3>
<ul><li><b>Federation</b>: trust between organizations, so one identity provider vouches for users at another's apps.</li>
<li><b>SSO</b>: sign in once, reach many apps. Built on <b>SAML</b> (XML assertions for web SSO), <b>OAuth</b> (delegated authorization, letting an app act for you without your password; OpenID Connect adds authentication on top) and <b>LDAP</b> (directory lookups).</li>
<li><b>Interoperability</b>: standards let different vendors' systems work together.</li></ul>
<div class="viz" id="viz-saml"></div>
<h3>Access control models</h3>
<ul><li><b>Mandatory (MAC)</b>: labels and clearances set by the system. Users can't change them. Military style.</li>
<li><b>Discretionary (DAC)</b>: the owner decides who gets access.</li>
<li><b>Role-based (RBAC)</b>: permissions attach to job roles.</li>
<li><b>Rule-based</b>: system-wide rules, such as a firewall ACL.</li>
<li><b>Attribute-based (ABAC)</b>: decisions from many attributes (department, location, device, time).</li>
<li><b>Time-of-day restrictions</b> and <b>least privilege</b>.</li></ul>
<div class="viz" id="viz-acmodels"></div>
<h3>MFA and passwords</h3>
<p>MFA factors: <b>something you know</b>, <b>have</b>, <b>are</b> and <b>somewhere you are</b>. Implementations: <b>biometrics</b>, <b>hard tokens</b>, <b>soft tokens</b> (authenticator apps) and <b>security keys</b> (FIDO2). Password best practices: favor <b>length</b>, check against breached lists, avoid <b>reuse</b>, and use <b>password managers</b>. <b>Passwordless</b> sign-in with passkeys removes the password entirely.</p>
<h3>Privileged access management (PAM)</h3>
<p><b>Just-in-time permissions</b> grant admin rights only when needed and remove them after. <b>Password vaulting</b> stores and rotates privileged passwords. <b>Ephemeral credentials</b> exist only for one session.</p>`},
{id:"auto",num:"4.8",title:"Automation and orchestration",html:`
<p>Scripts and orchestration platforms (often called SOAR) take repetitive work off people.</p>
<ul><li><b>Use cases</b>: user and resource provisioning, <b>guardrails</b> (blocking non-compliant deployments), <b>security groups</b>, <b>ticket creation</b>, <b>escalation</b>, <b>enabling and disabling services and access</b>, <b>continuous integration and testing</b>, and <b>integrations and APIs</b>.</li>
<li><b>Benefits</b>: efficiency and time saved, enforced baselines, standard infrastructure configurations, scaling securely, employee retention (less tedious work), faster reaction time and a <b>workforce multiplier</b>.</li>
<li><b>Other considerations</b>: complexity, cost, a <b>single point of failure</b>, <b>technical debt</b> and ongoing supportability.</li></ul>
<div class="viz" id="viz-auto"></div>`},
{id:"ir",num:"4.9",title:"Incident response and digital forensics",html:`
<h3>The process</h3>
<ol><li><b>Preparation</b>: plans, tools, training, contact lists.</li><li><b>Detection</b>: alerts and reports reveal something wrong.</li><li><b>Analysis</b>: confirm it's real, find the scope.</li><li><b>Containment</b>: stop the spread (isolate hosts, block accounts).</li><li><b>Eradication</b>: remove the cause (malware, attacker accounts).</li><li><b>Recovery</b>: restore systems and watch for return.</li><li><b>Lessons learned</b>: what to improve next time.</li></ol>
<div class="viz" id="viz-ir"></div>
<h3>Supporting activities</h3>
<p><b>Training</b>, <b>testing</b> (tabletop exercises and simulations), <b>root cause analysis</b> and <b>threat hunting</b> (proactively searching for attackers who slipped past alerts).</p>
<h3>Digital forensics</h3>
<ul><li><b>Legal hold</b>: preserve all relevant data when litigation is expected. Normal deletion stops.</li>
<li><b>Chain of custody</b>: a record of who handled evidence, when and why. Without it, evidence may be thrown out.</li>
<li><b>Acquisition</b>: collect the most volatile data first (CPU cache and RAM before disk). Make forensic images and hash them.</li>
<li><b>Preservation</b>: keep originals untouched; work on verified copies.</li>
<li><b>E-discovery</b>: finding and producing electronic data for legal cases.</li>
<li><b>Reporting</b>: document findings clearly for management or court.</li></ul>`},
{id:"sources",num:"4.10",title:"Investigation data sources",html:`
<h3>Log data</h3>
<p><b>Firewall logs</b>, <b>application logs</b>, <b>endpoint logs</b>, <b>OS-specific security logs</b> (like Windows Security event IDs), <b>IPS/IDS logs</b>, <b>network logs</b> and <b>metadata</b> (email headers, file properties, timestamps).</p>
<h3>Other data sources</h3>
<p><b>Vulnerability scans</b>, <b>automated reports</b>, <b>dashboards</b> and <b>packet captures</b> (full content of network traffic).</p>
<div class="viz" id="viz-cli"></div>`}
];

const G={
 harden:[["Secure baseline","Approved hardened configuration for a system type"],["Baseline life cycle","Establish, deploy, maintain"],["CIS Benchmarks","Consensus hardening guides used to build baselines"],["Site survey","Plans AP placement by measuring coverage and interference"],["Heat map","Visual of wireless signal strength across an area"],["BYOD","Employee-owned device used for work"],["COPE","Corporate-owned, personally enabled"],["CYOD","Choose your own device from an approved list; company-owned"],["MDM","Mobile device management: policies, encryption, remote wipe"],["WPA3 SAE","Simultaneous Authentication of Equals; resists offline cracking"],["WPA3-Enterprise","802.1X + RADIUS per-user authentication"],["Secure cookie flags","Secure (HTTPS only) and HttpOnly (no script access)"],["Static analysis (SAST)","Examines source code without running it"],["Dynamic analysis (DAST)","Tests a running application"],["Code signing","Proves publisher identity and code integrity"],["Sandboxing","Running untrusted code in isolation"]],
 assets:[["Asset owner","Person accountable for an asset"],["Enumeration","Discovering devices on the network"],["Sanitization","Securely wiping data so it can't be recovered"],["Degaussing","Erasing magnetic media with a strong magnetic field"],["Certificate of destruction","Vendor proof that media was destroyed"],["Data retention","Keeping data as long as required, then disposing"],["Credentialed scan","Scanner logs in and sees more detail"],["Non-credentialed scan","Outside view without logging in"],["Package monitoring","Tracking vulnerable libraries in your software"],["OSINT","Open-source intelligence"],["ISAC","Information sharing and analysis center for an industry"],["Bug bounty","Paying outside researchers for reported flaws"],["Responsible disclosure","Researchers privately report flaws before publishing"],["False positive","Reports a problem that isn't there"],["False negative","Misses a real problem; more dangerous"],["CVE","Unique ID for a publicly known vulnerability"],["CVSS","0–10 vulnerability severity score"],["CVSS 9.0–10.0","Critical"],["Exposure factor","Percentage of an asset lost if a threat succeeds"],["Exception / exemption","Documented acceptance of an unremediated vulnerability"],["Validation of remediation","Rescan, audit, verify"]],
 monitor:[["SIEM","Collects and correlates logs and raises alerts"],["SCAP","Standards for automated configuration and vulnerability checks"],["Alert tuning","Adjusting rules to cut false positives"],["SNMP trap","Unsolicited alert pushed from a device"],["NetFlow","Records metadata of network conversations"],["DLP","Prevents sensitive data from leaving"],["Agentless monitoring","Collecting data remotely without installed software"],["SPF","DNS record listing authorized sending servers"],["DKIM","Cryptographic signature on outgoing mail, key in DNS"],["DMARC","Policy for SPF/DKIM failures plus alignment and reporting"],["DMARC p=reject","Receivers should refuse failing mail"],["File integrity monitoring","Alerts when critical files change"],["EDR","Endpoint detection and response"],["XDR","Extended detection across endpoints, network, cloud, email"],["UBA","User behavior analytics: detects unusual user activity"],["DNS filtering","Blocks resolution of malicious domains"],["SELinux","Mandatory access control for Linux"],["Group Policy","Centralized Windows configuration management"],["Implicit deny","Traffic matching no rule is blocked"]],
 iam:[["Provisioning","Creating accounts and access"],["Deprovisioning","Removing access when no longer needed"],["Identity proofing","Verifying identity before issuing credentials"],["Attestation","Periodic review confirming access is still needed"],["Federation","Trust between organizations' identity systems"],["SAML","XML-based SSO assertions for web apps"],["OAuth","Delegated authorization without sharing passwords"],["OpenID Connect","Authentication layer built on OAuth"],["LDAP","Protocol for querying directories"],["MAC","Mandatory access control: labels and clearances"],["DAC","Discretionary access control: owner decides"],["RBAC","Role-based access control"],["Rule-based access control","System-wide rules such as ACLs"],["ABAC","Attribute-based access control"],["Hard token","Physical device generating codes"],["Soft token","Authenticator app generating codes"],["Security key","FIDO2 hardware key; phishing-resistant"],["Passwordless","Sign-in with passkeys or biometrics, no password"],["Just-in-time permissions","Admin rights granted only when needed"],["Password vaulting","Storing and rotating privileged credentials"],["Ephemeral credentials","Short-lived credentials for one session"]],
 ir:[["SOAR","Security orchestration, automation and response"],["Guardrails","Automation blocking non-compliant changes"],["Workforce multiplier","Automation letting a small team do more"],["Technical debt","Future cost of shortcuts in automation"],["IR order","Preparation, detection, analysis, containment, eradication, recovery, lessons learned"],["Containment","Stop the spread: isolate, block"],["Eradication","Remove the cause: malware, accounts"],["Lessons learned","Post-incident review to improve"],["Root cause analysis","Finding the underlying reason an incident happened"],["Threat hunting","Proactively searching for hidden attackers"],["Legal hold","Preserve data relevant to expected litigation"],["Chain of custody","Record of who handled evidence and when"],["Order of volatility","Collect most volatile first: cache, RAM, then disk"],["E-discovery","Finding electronic data for legal proceedings"],["Forensic image hash","Proves the copy matches the original"],["Packet capture","Full contents of network traffic"],["Metadata","Data about data: headers, timestamps, file properties"],["Windows event 4625","Failed logon"],["Windows event 4624","Successful logon"],["Windows event 1102","Audit log cleared"]]
};
const DECKS=[["harden","Hardening and mobile"],["assets","Assets and vulnerabilities"],["monitor","Monitoring and email"],["iam","Identity and access"],["ir","Automation, IR, forensics"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A company builds a standard hardened Windows image from CIS Benchmarks and deploys it with Group Policy. What is the image?",o:["Secure baseline","Gap analysis","Honeypot","Snapshot"],a:0,e:"A secure baseline is the approved hardened configuration."},
 {q:"Which is the correct order for a secure baseline's life cycle?",o:["Deploy, establish, maintain","Establish, deploy, maintain","Maintain, deploy, establish","Establish, maintain, deploy"],a:1,e:"You define it, roll it out, then keep it current."},
 {q:"Before installing APs, an engineer measures signal and interference throughout the building. What is this?",o:["Site survey","Penetration test","Tabletop exercise","Enumeration"],a:0,e:"A site survey plans wireless placement."},
 {q:"Employees use their own phones for work email. Which deployment model is this?",o:["COPE","CYOD","BYOD","Corporate-only"],a:2,e:"Bring your own device."},
 {q:"The company buys phones, lets staff use them personally, and manages them fully. Which model?",o:["BYOD","COPE","CYOD","VDI"],a:1,e:"Corporate-owned, personally enabled."},
 {q:"Which tool lets IT remotely wipe a lost company phone and enforce a passcode?",o:["MDM","SIEM","WAF","DLP"],a:0,e:"Mobile device management enforces policy on phones."},
 {q:"Which WPA3 feature protects against offline dictionary attacks on the Wi-Fi password?",o:["TKIP","SAE","WEP","WPS"],a:1,e:"SAE replaces the WPA2 PSK handshake that could be captured and cracked offline."},
 {q:"A hospital wants each Wi-Fi user to sign in with their own credentials checked by RADIUS. Which mode?",o:["WPA3-Personal","WPA3-Enterprise","Open with captive portal","WEP"],a:1,e:"Enterprise mode uses 802.1X and RADIUS."},
 {q:"Which cookie flag stops JavaScript from reading a session cookie, limiting XSS damage?",o:["Secure","HttpOnly","SameSite=None","Expires"],a:1,e:"HttpOnly hides the cookie from scripts."},
 {q:"A tool examines source code for flaws without running the application. What is this?",o:["Dynamic analysis","Static analysis","Fuzzing","Penetration test"],a:1,e:"Static analysis (SAST) reads the code."},
 {q:"Why is software code signed?",o:["To compress it","To prove publisher identity and integrity","To encrypt it","To speed it up"],a:1,e:"Signatures show who published it and that it wasn't changed."},
 {q:"A network discovery scan finds 40 devices that aren't in the asset inventory. What activity found them?",o:["Enumeration","Attestation","Sanitization","Journaling"],a:0,e:"Enumeration discovers what's actually on the network."},
 {q:"Hard drives are being retired. The company needs proof the vendor destroyed them. What should it get?",o:["Certificate of destruction","CSR","Chain of custody form only","SLA"],a:0,e:"Certification documents the destruction."},
 {q:"Which method makes data on magnetic hard drives unrecoverable without physical destruction?",o:["Degaussing","Formatting","Deleting files","Defragmenting"],a:0,e:"Degaussing scrambles the magnetic domains. It doesn't work on SSDs."},
 {q:"Which scan gives the MOST complete view of missing patches on servers?",o:["Non-credentialed scan","Credentialed scan","Ping sweep","Port scan only"],a:1,e:"Logging in lets the scanner see installed software and patches."},
 {q:"A scanner reports a critical Apache flaw on a server that runs IIS and has no Apache installed. What is this?",o:["False negative","False positive","True positive","Zero-day"],a:1,e:"It reported a problem that doesn't exist."},
 {q:"Which is MORE dangerous: a false positive or a false negative?",o:["False positive","False negative","They're equal","Neither matters"],a:1,e:"A false negative means a real vulnerability goes unnoticed."},
 {q:"What does a CVE provide?",o:["A severity score","A unique identifier for a known vulnerability","A patch","An exploit"],a:1,e:"CVE IDs name vulnerabilities. CVSS scores them."},
 {q:"A vulnerability has a CVSS base score of 9.8. How is it rated?",o:["Low","Medium","High","Critical"],a:3,e:"9.0 to 10.0 is critical."},
 {q:"Two servers have the same CVSS 8.1 flaw. One faces the internet; the other is on an isolated lab network. Which concept says to fix the internet-facing one first?",o:["Environmental variables","False positive","Static analysis","Attestation"],a:0,e:"Environment changes real-world risk."},
 {q:"An organization receives threat intelligence shared by other banks through a sector group. What is the source?",o:["ISAC","Dark web","Bug bounty","SCAP"],a:0,e:"Information sharing and analysis centers serve industries."},
 {q:"A vulnerable legacy system can't be patched for 6 months. Management formally accepts the risk with compensating controls. What is this?",o:["Exception","Rescan","False negative","Decommissioning"],a:0,e:"A documented exception or exemption."},
 {q:"After patching, what validates the vulnerability is gone?",o:["Rescanning","Closing the ticket","Rebooting","Emailing the vendor"],a:0,e:"Rescan, audit and verify."},
 {q:"Which tool correlates logs from firewalls, servers and endpoints to raise alerts?",o:["SIEM","NetFlow collector only","UPS","HSM"],a:0,e:"A SIEM aggregates and correlates."},
 {q:"The SOC gets 5,000 alerts a day, almost all false positives from one rule. What should they do?",o:["Disable logging","Tune the alert","Ignore all alerts","Buy more monitors"],a:1,e:"Alert tuning cuts noise so real alerts stand out."},
 {q:"Which data source shows that a workstation sent 30 GB to an unknown IP at 3 a.m., without capturing packet contents?",o:["NetFlow","SNMP trap","CRL","Group Policy"],a:0,e:"NetFlow records who talked to whom and how much."},
 {q:"Which uses standard formats to automatically check systems against configuration benchmarks?",o:["SCAP","SAML","SNMP","SASE"],a:0,e:"SCAP automates compliance checks."},
 {q:"A router sends an unsolicited message to the management server when an interface goes down. What is this?",o:["SNMP trap","Syslog query","NetFlow","SCAP"],a:0,e:"Traps are pushed alerts."},
 {q:"Which email record lists the servers allowed to send mail for a domain?",o:["SPF","DKIM","DMARC","MX only"],a:0,e:"SPF is the authorized sender list."},
 {q:"Which email technology adds a cryptographic signature that receivers verify with a public key in DNS?",o:["SPF","DKIM","DMARC","S/MIME only"],a:1,e:"DKIM signs messages."},
 {q:"A domain owner wants receivers to refuse mail that fails authentication and to send reports. Which record?",o:["SPF with ~all","DMARC with p=reject","DKIM selector","A record"],a:1,e:"DMARC sets policy and reporting."},
 {q:"Which BEST stops employees from emailing spreadsheets of customer card numbers outside the company?",o:["DLP","IDS","NetFlow","SPF"],a:0,e:"Data loss prevention inspects and blocks sensitive data leaving."},
 {q:"An alert fires because /etc/passwd changed on a web server. Which tool raised it?",o:["File integrity monitoring","DNS filter","Web proxy","NAC"],a:0,e:"FIM watches critical files."},
 {q:"Which blocks malware callbacks by refusing to resolve known-malicious domain names?",o:["DNS filtering","SPF","SCAP","Load balancer"],a:0,e:"DNS filtering stops the lookup."},
 {q:"A laptop's web filtering must work at home and in hotels, not just in the office. What should be used?",o:["Agent-based web filter","Centralized proxy only","Firewall at HQ","Air gap"],a:0,e:"An agent filters wherever the laptop goes."},
 {q:"Which protocol choice is MOST secure for transferring files to a partner?",o:["FTP on 21","SFTP on 22","Telnet on 23","TFTP on 69"],a:1,e:"SFTP runs over SSH and encrypts everything."},
 {q:"Which detects a user downloading far more files than usual at odd hours, even with valid credentials?",o:["User behavior analytics","SPF","CRL","WAF"],a:0,e:"UBA baselines normal behavior and flags anomalies."},
 {q:"Which correlates detections across endpoints, network, cloud and email in one platform?",o:["XDR","EDR","Antivirus","SIEM agentless"],a:0,e:"Extended detection and response covers more than endpoints."},
 {q:"A new hire's accounts are created only after HR verifies their government ID. What is this?",o:["Identity proofing","Attestation","Federation","Deprovisioning"],a:0,e:"Identity proofing verifies who someone is."},
 {q:"Every quarter, managers confirm each employee's access is still needed. What is this?",o:["Attestation","Provisioning","Enumeration","Journaling"],a:0,e:"Access reviews are attestation."},
 {q:"An employee leaves. What should happen to their accounts promptly?",o:["Deprovisioning","Provisioning","Escalation","Federation"],a:0,e:"Deprovision access immediately."},
 {q:"Users from a partner company sign in to your portal with their own company credentials. What enables this?",o:["Federation","RBAC","Air gap","SCAP"],a:0,e:"Federation establishes trust between identity providers."},
 {q:"A photo app asks for permission to access your cloud drive without getting your password. Which protocol?",o:["OAuth","LDAP","RADIUS","Kerberos"],a:0,e:"OAuth delegates authorization with tokens."},
 {q:"Which XML-based standard is widely used for web single sign-on between an identity provider and a service provider?",o:["SAML","OAuth","LDAP","SNMP"],a:0,e:"SAML passes signed assertions."},
 {q:"Files are labeled Secret and users have clearances. Users can't change labels. Which model?",o:["DAC","MAC","RBAC","ABAC"],a:1,e:"Mandatory access control uses system-enforced labels."},
 {q:"A file's owner decides who can read it. Which model?",o:["MAC","DAC","Rule-based","ABAC"],a:1,e:"Discretionary access control lets owners choose."},
 {q:"Access is granted only if the user is in Finance, on a managed device, in the US, during business hours. Which model?",o:["RBAC","ABAC","DAC","MAC"],a:1,e:"Multiple attributes in one decision: attribute-based."},
 {q:"Nurses get one set of permissions, doctors another, based on job title. Which model?",o:["Role-based","Discretionary","Mandatory","Rule-based"],a:0,e:"Permissions attach to roles."},
 {q:"Which MFA method is MOST resistant to phishing?",o:["SMS code","Email code","FIDO2 security key","Security question"],a:2,e:"Security keys check the site's identity, so a fake site gets nothing usable."},
 {q:"An admin gets domain admin rights for 2 hours to install a patch, then they're removed automatically. What is this?",o:["Just-in-time permissions","Password vaulting","Federation","Attestation"],a:0,e:"JIT access grants privileges only when needed."},
 {q:"A tool stores privileged passwords and rotates them after every use. What is this?",o:["Password vaulting","SSO","Key escrow","DLP"],a:0,e:"Vaulting protects and rotates privileged credentials."},
 {q:"A script automatically disables accounts of terminated employees when HR updates the system. What is the main benefit?",o:["Faster reaction time and consistency","More complexity","Technical debt","Single point of failure"],a:0,e:"Automation acts immediately and the same way every time."},
 {q:"Which is a RISK of heavy automation?",o:["Single point of failure","Better baselines","Faster provisioning","Employee retention"],a:0,e:"If the automation platform fails or is compromised, everything relying on it is affected."},
 {q:"A cloud policy automatically blocks any storage bucket from being made public. What is this?",o:["Guardrail","Exception","Legal hold","False positive"],a:0,e:"Guardrails prevent non-compliant changes."},
 {q:"What is the correct order of the incident response process?",o:["Detection, preparation, containment, recovery","Preparation, detection, analysis, containment, eradication, recovery, lessons learned","Containment, detection, eradication, preparation","Analysis, recovery, detection, lessons learned"],a:1,e:"Know this order cold."},
 {q:"An analyst isolates an infected laptop from the network. Which IR phase is this?",o:["Eradication","Containment","Recovery","Preparation"],a:1,e:"Stopping the spread is containment."},
 {q:"Malware is removed and attacker accounts are deleted. Which phase?",o:["Containment","Eradication","Recovery","Lessons learned"],a:1,e:"Removing the cause is eradication."},
 {q:"Two weeks after an incident, the team meets to discuss what went well and what to change. Which phase?",o:["Preparation","Lessons learned","Analysis","Recovery"],a:1,e:"The post-incident review."},
 {q:"Analysts search logs for signs of an attacker technique even though no alert has fired. What is this?",o:["Threat hunting","Alert tuning","Tabletop","E-discovery"],a:0,e:"Threat hunting is proactive."},
 {q:"Legal expects a lawsuit and orders all email for a project preserved. What is this?",o:["Legal hold","Data retention policy","Sanitization","Chain of custody"],a:0,e:"A legal hold suspends normal deletion."},
 {q:"Which must be maintained so evidence is admissible in court?",o:["Chain of custody","Alert tuning","RBAC","SPF"],a:0,e:"It documents every handler of the evidence."},
 {q:"Which should a forensic investigator collect FIRST?",o:["Hard drive image","RAM contents","Backup tapes","Printed logs"],a:1,e:"Most volatile first. RAM is lost at power-off."},
 {q:"Why does an investigator hash a forensic disk image?",o:["To encrypt it","To prove the copy matches the original and hasn't changed","To compress it","To speed analysis"],a:1,e:"Matching hashes prove integrity."},
 {q:"Which data source would show the exact contents of a suspicious HTTP session?",o:["Packet capture","NetFlow","SNMP trap","Dashboard"],a:0,e:"Packet captures hold full payloads."},
 {q:"Which Windows event ID shows that the security log was cleared?",o:["4624","4625","1102","4740"],a:2,e:"Event 1102: the audit log was cleared."},
 {q:"Email headers showing the true sending server and route are an example of which data source?",o:["Metadata","Vulnerability scan","Dashboard","Firewall rule"],a:0,e:"Headers are message metadata."},
 {q:"Which access model does SELinux implement?",o:["Mandatory access control","Discretionary only","Role-based only","None"],a:0,e:"SELinux enforces mandatory access control policies."},
 {q:"A firewall has rules: 10 deny any any, 20 permit tcp any → web:443. Why can't anyone reach the web server?",o:["Rules are checked top-down and rule 10 matches first","Rule 20 is the implicit deny","Port 443 is UDP","The firewall is fail-open"],a:0,e:"First match wins. Specific permits must sit above broad denies."}
];

registerModule({
  id:"ops",slug:"operations",title:"Security Operations",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["baselines","deploy","assetlc","cvss","fpfn","siem","fwrules","mail","saml","acmodels","auto","ir","cli"],
  viz(){
revealViz($("#viz-baselines"),{title:"One baseline per hardening target",cols:4,done:"Reviewed every hardening target",items:[
  ["Workstations","Endpoints","Disable unneeded services, enforce screen lock, EDR, full-disk encryption, local admin removed.","def"],["Servers","Data center","Minimal roles installed, host firewall, patch schedule, logging to SIEM, no web browsing.","def"],["Mobile devices","MDM","Passcode, encryption, OS version minimum, app restrictions, remote wipe.","def"],["Switches","Network","Disable unused ports, port security, SSH only, change default VLAN, BPDU guard.","def"],
  ["Routers","Network","Secure management (SSH, no Telnet), ACLs on management, disable unused services, log to syslog.","def"],["Cloud infrastructure","Cloud","No public buckets, least-privilege IAM, MFA on root, logging enabled, guardrails.","def"],["ICS / SCADA","Industrial","Segmentation, allow-listed protocols, vendor-approved changes only.","atk"],["Embedded systems","Devices","Change defaults, disable unused interfaces, update firmware when possible.","atk"],
  ["RTOS","Real-time","Limited compute and strict timing; harden around it with segmentation.","atk"],["IoT devices","Smart devices","Own VLAN, change default passwords, block internet unless needed.","atk"],["Establish","Life cycle","Build the baseline from CIS Benchmarks or vendor guides and test it.","vio"],["Maintain","Life cycle","Review regularly. New threats and new software versions mean the baseline must change.","vio"]]});

sortViz($("#viz-deploy"),{title:"BYOD, COPE or CYOD?",bins:{byod:"BYOD",cope:"COPE",cyod:"CYOD"},
  items:[["Staff use their own iPhones; MDM manages only a work container","byod","Employee-owned device."],["Company buys every phone and allows personal apps","cope","Corporate-owned, personally enabled."],["Employee picks a Pixel or iPhone from the IT catalog; company owns it","cyod","Choose from an approved list."],["Lowest hardware cost to the company, least control","byod","The employee paid for it."],["Most control, including full-device wipe","cope","The company owns the device outright."],["Contractor uses a personal laptop to reach the VDI","byod","Personal device."]],done:"Sorted every deployment model"});

stepViz($("#viz-assetlc"),{title:"An asset from purchase to disposal",done:"Followed an asset's life cycle",steps:[
  ["Procurement","Purchasing buys 40 laptops from an approved vendor. The contract requires TPM 2.0 and firmware updates for 5 years."],
  ["Assignment","Each laptop is tagged, assigned an owner (the user's manager) and classified for the data it will hold."],
  ["Inventory","Each one is entered into the asset database with serial number, owner and location."],
  ["Monitoring","Weekly enumeration scans compare what's on the network with the inventory. Unknown devices are investigated."],
  ["Decommission","After 4 years, the laptop is retired and removed from directory services."],
  ["Sanitize or destroy","The SSD is cryptographically erased, or shredded if it held restricted data. Degaussing won't work on SSDs."],
  ["Certify","The disposal vendor provides a certificate of destruction listing serial numbers. Retention rules decide what data was kept first."]],
  end:"Lose track at any stage and you get unpatched shadow devices, or data walking out in a recycling bin."});

/* ---- CVSS calculator ---- */
(function(){
  const el=$("#viz-cvss");
  const M={AV:["Attack vector",[["N","Network",.85],["A","Adjacent",.62],["L","Local",.55],["P","Physical",.2]]],AC:["Attack complexity",[["L","Low",.77],["H","High",.44]]],PR:["Privileges required",[["N","None",.85],["L","Low",.62],["H","High",.27]]],UI:["User interaction",[["N","None",.85],["R","Required",.62]]],S:["Scope",[["U","Unchanged",0],["C","Changed",1]]],C:["Confidentiality",[["H","High",.56],["L","Low",.22],["N","None",0]]],I:["Integrity",[["H","High",.56],["L","Low",.22],["N","None",0]]],A:["Availability",[["H","High",.56],["L","Low",.22],["N","None",0]]]};
  const v={AV:"L",AC:"H",PR:"H",UI:"R",S:"U",C:"L",I:"N",A:"N"};const sevSeen=new Set();
  const ru=x=>{const i=Math.round(x*1e5);return i%1e4===0?i/1e5:(Math.floor(i/1e4)+1)/10};
  function score(){const g=(k)=>M[k][1].find(o=>o[0]===v[k])[2];const ch=v.S==="C";let pr=g("PR");if(ch&&v.PR==="L")pr=.68;if(ch&&v.PR==="H")pr=.5;
    const iss=1-(1-g("C"))*(1-g("I"))*(1-g("A")),imp=ch?7.52*(iss-.029)-3.25*Math.pow(iss-.02,15):6.42*iss,ex=8.22*g("AV")*g("AC")*pr*g("UI");
    if(imp<=0)return 0;return ch?ru(Math.min(1.08*(imp+ex),10)):ru(Math.min(imp+ex,10))}
  const sev=s=>s===0?["None","good"]:s<4?["Low","good"]:s<7?["Medium","warn"]:s<9?["High","bad"]:["Critical","bad"];
  el.innerHTML=`<div class="viz-title">CVSS 3.1 base score calculator</div><div id="cv-rows"></div><div style="display:flex;gap:16px;align-items:baseline;margin-top:8px"><div class="big-num" id="cv-s"></div><b id="cv-l"></b></div><div class="meter"><i id="cv-m"></i></div><div class="s-small mono" id="cv-v"></div><div class="caption" aria-live="polite">Set the metrics for a vulnerability. Try to build a Low, a Medium, a High and a Critical.</div>`;
  function draw(){const s=score(),[l,c]=sev(s);
    $("#cv-rows",el).innerHTML=Object.entries(M).map(([k,[n,opts]])=>`<div class="rng-row" style="grid-template-columns:150px 1fr"><span>${n}</span><span class="seg-row" style="margin:0">${opts.map(o=>`<button class="chip" data-k="${k}" data-v="${o[0]}" aria-pressed="${v[k]===o[0]}">${o[1]}</button>`).join("")}</span></div>`).join("");
    $("#cv-s",el).textContent=s.toFixed(1);$("#cv-s",el).className="big-num "+c;$("#cv-l",el).textContent=l;$("#cv-m",el).style.width=s*10+"%";
    $("#cv-v",el).textContent="CVSS:3.1/"+Object.entries(v).map(([k,x])=>k+":"+x).join("/");
    if(l!=="None")sevSeen.add(l);if(sevSeen.size>=4){award("viz:cvss",30,"Built every CVSS severity");$(".caption",el).innerHTML='<span class="status-good">All four severities built.</span> Network vector, no privileges, no user interaction and high impact push a score to critical. Remember the base score ignores your environment, so prioritize with context too.'}}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;v[b.dataset.k]=b.dataset.v;draw()});draw();
})();

quizViz($("#viz-fpfn"),{title:"True or false, positive or negative?",done:"Classified every scan result",qs:[
  ["Scanner: \"OpenSSH 7.2 vulnerable\". The server runs OpenSSH 9.6, and the scanner misread the banner.",["False positive","False negative","True positive","True negative"],0,"Reported, but not real."],
  ["Scanner: no findings. A pen tester then exploits an unpatched SMB flaw on that host.",["False negative","False positive","True negative","True positive"],0,"Real, but missed. The most dangerous result."],
  ["Scanner: \"TLS 1.0 enabled\". You confirm with openssl that it accepts TLS 1.0.",["True positive","False positive","False negative","True negative"],0,"Reported and real."],
  ["Scanner: nothing found on a fully patched, hardened server that truly has no known flaws.",["True negative","False negative","False positive","True positive"],0,"Nothing reported, nothing there."]]});

/* ---- SIEM triage ---- */
(function(){
  const el=$("#viz-siem");
  const A=[["crit","03:12","EDR: ransomware behavior on FIN-PC07, mass file renames","esc","Real and spreading. Escalate and isolate the host now."],["low","03:14","Antivirus: EICAR test file detected on QA-LAB2","close","The EICAR file is a harmless test string the QA team uses. Close it as benign."],["high","03:20","Impossible travel: cfo@ from Ohio then Lagos within 9 minutes","esc","A strong sign of stolen credentials on a high-value account. Escalate, reset and revoke sessions."],["med","03:25","Port scan from 10.0.9.15 (the vulnerability scanner) against the server VLAN","tune","An approved scanner on its normal schedule. Tune the rule to exclude it so it stops creating noise."],["high","03:31","DLP: 4,200 card numbers in an outbound email to a personal Gmail","esc","Possible data exfiltration. Escalate and block the message."],["med","03:40","One IP tried the same password once against 200 different accounts","esc","Password spraying. Escalate, block the source and check whether any login succeeded."]];
  const ACT={esc:"Escalate",close:"Close as benign",tune:"Tune the rule"};const done={};let sel=null;
  el.innerHTML=`<div class="viz-title">SIEM console: triage the night shift queue</div><div class="siem" id="si-l"></div><div class="seg-row" id="si-a"></div><div class="caption" aria-live="polite">Pick an alert, then choose an action.</div><div class="rv-prog s-small"></div>`;
  function draw(msg){$("#si-l",el).innerHTML=A.map((a,i)=>`<button class="siem-r ${sel===i?"sel":""} ${done[i]?"done":""}" data-i="${i}"><span class="sev ${a[0]}">${a[0].toUpperCase()}</span><span>${a[1]}</span><span>${done[i]?"✓ ":""}${a[2]}</span></button>`).join("");
    $("#si-a",el).innerHTML=sel===null?"":Object.entries(ACT).map(([k,l])=>`<button class="btn" data-act="${k}">${l}</button>`).join("");
    if(msg)$(".caption",el).innerHTML=msg;$(".rv-prog",el).textContent=`${Object.keys(done).length} of ${A.length} alerts handled`;
    if(Object.keys(done).length===A.length){award("viz:siem",30,"Cleared the SIEM queue");$(".caption",el).innerHTML+='<br><br><span class="status-good">Queue cleared.</span> Tuning out known noise is how analysts keep real alerts visible.'}}
  el.addEventListener("click",e=>{const r=e.target.closest("[data-i]"),a=e.target.closest("[data-act]");
    if(r){sel=+r.dataset.i;draw(done[sel]?A[sel][4]:"Choose an action for this alert.");return}
    if(a&&sel!==null){const x=A[sel];if(a.dataset.act===x[3]){done[sel]=1;const m=`<span class="status-good">${ACT[x[3]]}: correct.</span> ${x[4]}`;sel=null;draw(m)}else draw(`<span class="status-bad">Not the best call.</span> Look at the source and what's normal for it.`)}});
  draw();
})();

/* ---- firewall rule order ---- */
(function(){
  const el=$("#viz-fwrules");
  let R=[["deny","any","any","any","Block everything (cleanup)"],["permit","any","172.16.1.10","443","Web server HTTPS"],["deny","203.0.113.66","any","any","Known attacker IP"],["permit","10.0.0.0/8","172.16.1.20","22","Admins SSH to jump box"]];
  const P=[["203.0.113.66","172.16.1.10","443","deny","Attacker → web"],["198.51.100.7","172.16.1.10","443","permit","Customer → web"],["10.1.4.9","172.16.1.20","22","permit","Admin → jump box"],["198.51.100.7","172.16.1.20","22","deny","Internet → SSH"]];
  const m=(ip,r)=>{if(r==="any")return true;if(!r.includes("/"))return ip===r;return ip.split(".")[0]===r.split(".")[0]};
  const ev=p=>{for(let i=0;i<R.length;i++){const r=R[i];if(m(p[0],r[1])&&m(p[1],r[2])&&(r[3]==="any"||r[3]===p[2]))return [r[0],i]}return ["deny",-1]};
  el.innerHTML=`<div class="viz-title">Fix the rule order (first match wins)</div><div class="hd-list" id="fr-r"></div><div class="atk"><div class="atk-t"><div class="s-small">TEST PACKETS</div><div id="fr-t"></div></div></div><div class="caption" aria-live="polite"></div>`;
  function draw(){
    $("#fr-r",el).innerHTML=R.map((r,i)=>`<div class="hd-i" style="align-items:center;cursor:default"><b class="mono" style="min-width:28px">${(i+1)*10}</b><span style="flex:1"><b class="${r[0]==="permit"?"status-good":"status-bad"}">${r[0]}</b> <span class="mono">${r[1]} → ${r[2]} : ${r[3]}</span><br><span class="s-small">${r[4]}</span></span><button class="btn" data-u="${i}" ${i===0?"disabled":""} aria-label="Move up">↑</button><button class="btn" data-d="${i}" ${i===R.length-1?"disabled":""} aria-label="Move down">↓</button></div>`).join("");
    const res=P.map(p=>{const [a,i]=ev(p);return {p,a,i,ok:a===p[3]}});
    $("#fr-t",el).innerHTML=res.map(r=>`<div class="atk-r ${r.ok?"":"bad"}"><span>${r.p[4]} <span class="mono">${r.p[0]} → ${r.p[1]}:${r.p[2]}</span></span><b>${r.a} (rule ${r.i<0?"implicit":(r.i+1)*10}) ${r.ok?"✓":"✗"}</b></div>`).join("");
    const all=res.every(r=>r.ok);
    $(".caption",el).innerHTML=all?'<span class="status-good">All four packets handled correctly.</span> Specific rules first, the attacker block above the web permit, and the broad deny last. You could even delete it: the implicit deny does the same job.':"The firewall stops at the first matching rule. Move rules until every test packet gets the right result.";
    if(all)award("viz:fwrules",30,"Fixed a firewall rule order")}
  el.addEventListener("click",e=>{const u=e.target.closest("[data-u]"),d=e.target.closest("[data-d]");if(u){const i=+u.dataset.u;[R[i-1],R[i]]=[R[i],R[i-1]];draw()}if(d){const i=+d.dataset.d;[R[i+1],R[i]]=[R[i],R[i+1]];draw()}});draw();
})();

/* ---- SPF / DKIM / DMARC ---- */
(function(){
  const el=$("#viz-mail");
  const SC={legit:["Real invoice from billing@acme.com",{spf:1,dkim:1,align:1},"Sent from Acme's own mail server, signed with Acme's DKIM key."],
    spoof:["Spoofed \"From: ceo@acme.com\" sent from a random VPS",{spf:0,dkim:0,align:0},"The sending IP isn't in Acme's SPF record and there's no valid Acme signature."],
    alter:["Real message altered in transit",{spf:1,dkim:0,align:1},"The server was authorized, but the body changed after signing, so DKIM fails. DMARC passes if either SPF or DKIM passes and aligns."]};
  let sc="legit",pol="none";const seen=new Set();
  el.innerHTML=`<div class="viz-title">Email authentication at the receiving server</div><div class="chips">${Object.entries(SC).map(([k,v])=>`<button class="chip" data-s="${k}">${v[0]}</button>`).join("")}</div>
  <div class="s-small" style="margin-top:10px">ACME'S DMARC POLICY</div><div class="chips"><button class="chip mono" data-p="none">p=none</button><button class="chip mono" data-p="quarantine">p=quarantine</button><button class="chip mono" data-p="reject">p=reject</button></div>
  <div class="mailflow" id="mf"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const s=SC[sc][1],dm=(s.spf||s.dkim)&&s.align;el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===sc));el.querySelectorAll("[data-p]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.p===pol));
    const out=dm?"Delivered to inbox":pol==="none"?"Delivered (DMARC only reports)":pol==="quarantine"?"Sent to spam / quarantine":"Rejected at the gateway";
    $("#mf",el).innerHTML=`<div class="mf-r ${s.spf?"ok":"no"}"><span>SPF: is the sending IP authorized?</span><b>${s.spf?"pass":"fail"}</b></div><div class="mf-r ${s.dkim?"ok":"no"}"><span>DKIM: is the signature valid?</span><b>${s.dkim?"pass":"fail"}</b></div><div class="mf-r ${dm?"ok":"no"}"><span>DMARC: aligned pass, else apply policy</span><b>${dm?"pass":"fail → "+pol}</b></div><div class="mf-r ${dm?"ok":pol==="none"?"no":"ok"}"><span>Result</span><b>${out}</b></div>`;
    $(".caption",el).innerHTML=SC[sc][2]+(sc==="spoof"&&pol==="none"?' <span class="status-bad">With p=none, the spoofed CEO email still lands in the inbox.</span>':sc==="spoof"&&pol==="reject"?' <span class="status-good">p=reject blocks the spoof outright.</span>':"");
    seen.add(sc+pol);if(seen.has("spoofreject")&&seen.has("spoofnone")&&seen.has("alter"+pol))award("viz:mail",30,"Configured SPF, DKIM and DMARC")}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),p=e.target.closest("[data-p]");if(s)sc=s.dataset.s;if(p)pol=p.dataset.p;if(s||p)draw()});draw();
})();

seqViz($("#viz-saml"),{title:"SAML single sign-on",left:"User's browser",right:"Identity provider",intro:"A user opens the company's HR app (the service provider), which trusts the corporate identity provider.",
  steps:[{dir:"r",label:"Redirected with a SAML request",sub:"From the HR app",text:"The HR app doesn't handle passwords. It redirects the browser to the identity provider (IdP) with a SAML authentication request."},
         {dir:"r",label:"Password + MFA",sub:"Authenticates once",text:"The user signs in at the IdP. If they already did today, this step is skipped. That's SSO."},
         {dir:"l",label:"Signed SAML assertion",sub:"XML, signed with the IdP's private key",text:"The IdP returns an XML assertion stating who the user is and their attributes, digitally signed."},
         {dir:"r",label:"Assertion posted to HR app",sub:"Verified with the IdP's public key",text:"The browser hands the assertion to the HR app, which verifies the signature and logs the user in. The app never saw the password."}],
  end:"SAML handles authentication for web SSO. OAuth handles delegated authorization (an app acting on your behalf), and OpenID Connect adds identity on top of OAuth."});

sortViz($("#viz-acmodels"),{title:"Name the access control model",bins:{mac:"Mandatory (MAC)",dac:"Discretionary (DAC)",rbac:"Role-based (RBAC)",abac:"Attribute-based (ABAC)"},
  items:[["Top Secret clearance needed to open Top Secret files","mac","Labels and clearances, enforced by the system."],["Alice shares her folder with Bob","dac","The owner decides."],["All help desk staff can reset passwords","rbac","Permission tied to the job role."],["Allowed if department=Finance AND device=managed AND country=US","abac","Several attributes combined."],["SELinux policy confines the web server process","mac","System-enforced policy users can't override."],["New nurse gets the Nurse group and its permissions","rbac","Role assignment."],["Doc access only from the hospital network during a shift","abac","Location and time attributes."],["File creator sets read-only for everyone else","dac","Owner-controlled permissions."]],done:"Named every access control model"});

quizViz($("#viz-auto"),{title:"Automate it or not?",done:"Weighed every automation decision",qs:[
  ["HR marks an employee terminated. A script disables all their accounts within 60 seconds.",["Good automation: faster reaction, consistent","Bad idea: too risky"],0,"Fast, consistent deprovisioning is a classic use case."],
  ["Every phishing report automatically creates a ticket, pulls headers and checks URLs against threat feeds.",["Good automation: workforce multiplier","Bad idea: adds technical debt"],0,"It saves analysts minutes on every report."],
  ["One unreviewed script with domain admin rights runs every remediation, with no logging or owner.",["Fine as long as it works","Risk: single point of failure and poor supportability"],1,"Automation needs ownership, logging and least privilege too."],
  ["A cloud guardrail blocks any VM deployment without disk encryption.",["Good automation: enforces the baseline","Bad idea: slows developers"],0,"Guardrails stop mistakes before they happen."]]});

stepViz($("#viz-ir"),{title:"Work a ransomware incident",done:"Worked an incident from start to finish",steps:[
  ["Preparation","Before anything happens: an IR plan, a call tree, offline backups, EDR on every host, and a tabletop last quarter."],
  ["Detection","EDR alerts at 03:12: mass file renames on FIN-PC07. A user reports a ransom note at 03:15."],
  ["Analysis","Confirm it's real. Scope it: one host and one file share. Identify the strain and the entry point (a phishing attachment)."],
  ["Containment","Isolate FIN-PC07 with EDR. Disable the user's account. Block the C2 domain at DNS and the firewall. Keep it powered on for forensics."],
  ["Eradication","Reimage the host. Remove the malicious mail from every inbox. Reset the credentials the attacker touched."],
  ["Recovery","Restore the share from the immutable backup. Watch closely for signs the attacker returns."],
  ["Lessons learned","Root cause: macros allowed in Office. Action: block macros from the internet, update the playbook, retrain the finance team."]],
  end:"Preparation, Detection, Analysis, Containment, Eradication, Recovery, Lessons learned. Learn the order."});

/* ---- security CLI lab ---- */
(function(){
  const el=$("#viz-cli");
  const C={
   "nmap -sV 10.0.5.20":`Starting Nmap 7.94\nPORT     STATE SERVICE  VERSION\n<span class="t-bad">21/tcp   open  ftp      vsftpd 2.3.4</span>\n22/tcp   open  ssh      OpenSSH 9.6\n<span class="t-bad">23/tcp   open  telnet   Linux telnetd</span>\n443/tcp  open  https    nginx 1.24\n<span class="t-n"># FTP and Telnet send credentials in clear text. Disable them.</span>`,
   "openssl s_client -connect shop.example.com:443":`<span class="t-c">depth=2 CN = Trusted Root R1</span>\n<span class="t-c">depth=1 CN = Issuing CA G2</span>\ndepth=0 CN = shop.example.com\nProtocol  : TLSv1.3\nCipher    : TLS_AES_256_GCM_SHA384\n<span class="t-ok">Verify return code: 0 (ok)</span>\n<span class="t-n"># Full chain to a trusted root, modern protocol and cipher.</span>`,
   "grep 'Failed password' /var/log/auth.log | wc -l":`<span class="t-bad">4127</span>\n<span class="t-n"># 4,127 failed SSH logins. Check the sources with the next command.</span>`,
   "grep 'Failed password' /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | head -3":`   <span class="t-bad">3988 185.220.101.4</span>\n     97 45.9.20.11\n     42 10.0.8.30\n<span class="t-n"># One IP made almost every attempt: brute force. Block it and use fail2ban.</span>`,
   "sha256sum installer.exe":`<span class="t-bad">7c3e…9a10</span>  installer.exe\n<span class="t-n"># Vendor publishes 4b81…e2f7. The hashes don't match: don't run it.</span>`,
   "dig +short TXT _dmarc.example.com":`"v=DMARC1; p=reject; rua=mailto:dmarc@example.com"\n<span class="t-n"># Policy is reject, with aggregate reports sent to dmarc@.</span>`,
   "netstat -ano | findstr ESTABLISHED":`  TCP  10.0.4.22:51544  52.96.12.18:443   ESTABLISHED  4120\n  <span class="t-bad">TCP  10.0.4.22:51602  91.215.85.4:8443  ESTABLISHED  6644</span>\n<span class="t-n"># PID 6644 (svch0st.exe) talks to an unknown host on 8443. Possible C2 beacon.</span>`,
   "tcpdump -i eth0 -nn port 53 -c 3":`03:14:01 IP 10.0.4.22.53122 > 10.0.0.53.53: A? <span class="t-bad">a9f3k2.c2-update.net</span>\n03:14:31 IP 10.0.4.22.53130 > 10.0.0.53.53: A? <span class="t-bad">b1x8q7.c2-update.net</span>\n03:15:01 IP 10.0.4.22.53141 > 10.0.0.53.53: A? <span class="t-bad">c4m2z9.c2-update.net</span>\n<span class="t-n"># Random subdomains every 30 s: beaconing or DNS tunneling.</span>`,
   "curl -I https://portal.example.com":`HTTP/2 200\n<span class="t-ok">strict-transport-security: max-age=31536000</span>\n<span class="t-ok">set-cookie: sid=…; Secure; HttpOnly; SameSite=Strict</span>\n<span class="t-bad">server: Apache/2.4.29 (Ubuntu)</span>\n<span class="t-n"># Good cookie flags and HSTS, but the banner leaks an old version.</span>`};
  const run=new Set();
  el.innerHTML=`<div class="viz-title">Security CLI lab: run each command (no typing needed)</div><div class="chips cmds">${Object.keys(C).map(c=>`<button class="chip mono" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div><pre class="term cli-o" aria-live="polite"><span class="t-n">Pick a command to run it.</span></pre><div class="rv-prog s-small"></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;run.add(c);b.classList.add("seen");
    $(".cli-o",el).innerHTML=`<span class="t-c">$ ${esc(c)}</span>\n${C[c]}`;$(".rv-prog",el).textContent=`${run.size} of ${Object.keys(C).length} commands run`;
    if(run.size===Object.keys(C).length){flag("collector");award("viz:cli",30,"Ran every command in the CLI lab")}});
})();
  },
  sims:[
    {id:"vulnprio",type:"order",title:"Prioritize the scan report",
      scenario:"This week's scan found six vulnerabilities. You can fix two per day. Order them from first to last, using CVSS plus context.",
      steps:["CVSS 9.8 remote code execution on the internet-facing VPN appliance, exploited in the wild","CVSS 8.8 on the payroll database server, reachable from the user LAN","CVSS 7.5 on the public web server, no known exploit yet","CVSS 9.1 on a lab server that's air-gapped and holds no data","CVSS 5.3 information disclosure on an internal wiki","CVSS 3.1 on a printer in the isolated print VLAN"],
      success:"Exposure and active exploitation outrank raw scores. That's why the air-gapped 9.1 drops below the internet-facing 7.5."},
    {id:"irsim",type:"choice",title:"Respond to the incident",
      scenario:"03:12. EDR reports ransomware behavior on FIN-PC07 in the finance department. You're the on-call responder.",
      steps:[
        ["What do you do first?",["Power off every computer in the building","Isolate FIN-PC07 from the network but leave it powered on","Pay the ransom","Wait for business hours"],1,"Contain the spread and keep volatile evidence in memory."],
        ["The share FIN-PC07 mapped is being encrypted. Next?",["Disconnect the share and disable the user's account","Delete the share","Restore it immediately from backup while encryption continues","Email all staff"],0,"Stop the attacker's access before recovering."],
        ["Forensics needs evidence. Which do you collect first?",["Hard drive image","RAM capture","Printed screenshots","Backup tapes"],1,"Order of volatility: RAM before disk."],
        ["How do you prove the disk image wasn't altered later?",["Hash it and record the chain of custody","Store it on the CEO's laptop","Rename it","Compress it"],0,"Hashes and chain of custody keep evidence admissible."],
        ["Malware is removed and systems restored. What's left?",["Nothing","Lessons learned and root cause analysis","Buy a new firewall","Delete the logs"],1,"The review fixes the root cause so it doesn't happen again."]],
      success:"Contained, preserved, recovered and learned from. Textbook response."},
    {id:"evidence",type:"order",title:"Collect evidence in the right order",
      scenario:"A compromised server must be investigated. Put the acquisition steps in the right order, starting with the most volatile data.",
      steps:["Document the scene and start the chain of custody form","Capture CPU registers and cache where possible","Capture RAM (running processes, network connections)","Record network state and routing tables","Image the disk with a write blocker","Hash the image and verify it matches the original","Collect logs and backups stored elsewhere"],
      success:"Most volatile first, every step documented, and every copy verified by hash."},
    {id:"iamsim",type:"match",title:"Fix the access problems",
      scenario:"An access review turned up six problems. Match each one to the fix.",
      items:[["Deprovision","deprov"],["Just-in-time access","jit"],["Password vaulting","vault"],["FIDO2 security keys","fido"],["Federation","fed"],["Attestation","att"]],
      slots:[["deprov","Finding 1","Three contractors whose contracts ended in March still have active VPN accounts"],["jit","Finding 2","Eight engineers hold permanent domain admin rights they use twice a year"],["vault","Finding 3","The shared root password for core switches hasn't changed in 4 years"],["fido","Finding 4","Executives keep falling for MFA-code phishing pages"],["fed","Finding 5","Partner staff each need separate accounts in our portal"],["att","Finding 6","Nobody has reviewed group memberships in 2 years"]],
      success:"Six findings, six fixes. Least privilege is a process, not a one-time setting."}
  ],
  badges:[
    ["reader","SO","Shift Lead","Mark all 10 operations lessons studied",c=>c.allStudied()],
    ["lab","OP","Ops Center","Complete all 13 diagrams in this module",c=>c.vizAll()],
    ["siem","Q0","Queue Zero","Clear the SIEM triage queue",c=>c.earned("viz:siem")],
    ["cvss","CV","Severity Scale","Build every CVSS severity in the calculator",c=>c.earned("viz:cvss")],
    ["mail","DM","p=reject","Block the spoofed email with DMARC",c=>c.earned("viz:mail")],
    ["ir","IR","First Responder","Pass the incident response simulation",c=>c.passed("irsim")],
    ["coc","CC","Chain of Custody","Pass the evidence collection simulation",c=>c.passed("evidence")],
    ["perfect","BT","Blue Team Ace","Score 100% on an operations quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
