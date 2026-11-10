/* ================= Module 3: Incident Response and Management (CS0-004 Domain 3.0, 24%) ================= */
(function(){
/* ---- canned Volatility 3 output for the memory forensics lab ---- */
const VOL={
 "windows.pslist":`PID   PPID  ImageFileName   CreateTime (UTC)
4     0     System          2026-11-09 07:58:01
388   4     smss.exe        2026-11-09 07:58:01
604   516   wininit.exe     2026-11-09 07:58:04
680   604   services.exe    2026-11-09 07:58:04
696   604   lsass.exe       2026-11-09 07:58:04
812   680   svchost.exe     2026-11-09 07:58:05
1044  680   svchost.exe     2026-11-09 07:58:06
2216  2180  explorer.exe    2026-11-09 08:02:11
3120  2216  OUTLOOK.EXE     2026-11-09 08:03:40
4388  3120  WINWORD.EXE     2026-11-09 09:12:02
4512  4388  powershell.exe  2026-11-09 09:12:05
4980  4512  scvhost.exe     2026-11-09 09:12:19
5104  2216  chrome.exe      2026-11-09 09:20:44`,
 "windows.pstree":`* 604 wininit.exe
** 680 services.exe
*** 812 svchost.exe
*** 1044 svchost.exe
** 696 lsass.exe
* 2216 explorer.exe
** 3120 OUTLOOK.EXE
*** 4388 WINWORD.EXE
**** 4512 powershell.exe
***** 4980 scvhost.exe
** 5104 chrome.exe`,
 "windows.cmdline":`PID   Process         Args
2216  explorer.exe    C:\\Windows\\Explorer.EXE
3120  OUTLOOK.EXE     "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"
4388  WINWORD.EXE     "...\\WINWORD.EXE" /n "C:\\Users\\jdoe\\AppData\\Local\\Microsoft\\Windows\\INetCache\\Content.Outlook\\Q8\\invoice_77.docm"
4512  powershell.exe  powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...
4980  scvhost.exe     C:\\Users\\Public\\scvhost.exe -k netsvc
5104  chrome.exe      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`,
 "windows.netscan":`Proto  LocalAddr        ForeignAddr          State        PID   Owner
TCPv4  10.0.4.22:51544  52.96.12.18:443      ESTABLISHED  3120  OUTLOOK.EXE
TCPv4  10.0.4.22:51602  91.215.85.4:8443     ESTABLISHED  4980  scvhost.exe
TCPv4  10.0.4.22:51633  142.250.72.4:443     ESTABLISHED  5104  chrome.exe
TCPv4  10.0.4.22:51701  10.0.4.10:445        ESTABLISHED  4980  scvhost.exe
TCPv4  0.0.0.0:135      0.0.0.0:0            LISTENING    812   svchost.exe`,
 "windows.malfind":`PID   Process       Start VPN     Protection               Hexdump / Disasm
2216  explorer.exe  0x3a20000     PAGE_EXECUTE_READWRITE   4d 5a 90 00 03 00 00 00  MZ......
      (MZ header in a private RWX region: likely injected PE)`
};
const LESSONS=[
{id:"killchain",num:"3.1",title:"Attack frameworks: Cyber Kill Chain and Diamond Model",html:`
<p>Attack methodology frameworks give analysts a shared language for what an attacker did and what they'll do next.</p>
<h3>Lockheed Martin Cyber Kill Chain</h3>
<ol><li><b>Reconnaissance</b>: research the target (LinkedIn, DNS, scanning).</li><li><b>Weaponization</b>: pair an exploit with a payload (a macro document).</li><li><b>Delivery</b>: send it (email, USB, website).</li><li><b>Exploitation</b>: the code runs.</li><li><b>Installation</b>: malware or persistence is installed.</li><li><b>Command and control (C2)</b>: the malware phones home.</li><li><b>Actions on objectives</b>: steal, encrypt or destroy.</li></ol>
<p>The earlier you break the chain, the less damage. Its weakness: it's focused on the perimeter and on malware, and says little about insiders or what happens after initial access.</p>
<div class="viz" id="viz-kc"></div>
<h3>Diamond Model of Intrusion Analysis</h3>
<p>Every event has four connected points: <b>adversary</b>, <b>capability</b> (malware, exploits), <b>infrastructure</b> (IPs, domains, servers) and <b>victim</b>. Knowing one point lets you pivot to the others. For example, a C2 domain (infrastructure) leads to other victims using the same domain.</p>
<div class="viz" id="viz-diamond"></div>`},
{id:"attack",num:"3.2",title:"MITRE ATT&CK, OSSTMM and the OWASP Testing Guide",html:`
<h3>MITRE ATT&amp;CK</h3>
<p>A knowledge base of real-world adversary behavior. <b>Tactics</b> are the why (the goal, such as Persistence), <b>techniques</b> are the how (T1053 Scheduled Task/Job), and <b>sub-techniques</b> are more specific (T1053.005 Scheduled Task). Enterprise ATT&amp;CK has 14 tactics:</p>
<p class="mono" style="font-size:13px;line-height:1.7">Reconnaissance · Resource Development · Initial Access · Execution · Persistence · Privilege Escalation · Defense Evasion · Credential Access · Discovery · Lateral Movement · Collection · Command and Control · Exfiltration · Impact</p>
<p>Use it to map detections, find gaps, describe incidents and plan adversary emulation.</p>
<div class="viz" id="viz-tactics"></div>
<h3>Testing methodologies</h3>
<ul><li><b>OSSTMM</b> (Open Source Security Testing Methodology Manual): a peer-reviewed methodology for testing operational security across people, physical, wireless, telecom and data networks, with measurable results.</li>
<li><b>OWASP Testing Guide</b> (Web Security Testing Guide): how to test web applications, from information gathering and authentication to input validation and business logic.</li></ul>
<div class="viz" id="viz-fwq"></div>`},
{id:"process",num:"3.3",title:"The incident response life cycle and preparation",html:`
<p>NIST SP 800-61 describes four phases: <b>Preparation</b>; <b>Detection and Analysis</b>; <b>Containment, Eradication and Recovery</b>; and <b>Post-Incident Activity</b>. It's a cycle: lessons learned feed back into preparation. (Revision 3, released in 2025, maps the same work onto the NIST CSF 2.0 functions, but the exam still uses these phase names.)</p>
<div class="viz" id="viz-cycle"></div>
<h3>Preparation</h3>
<ul><li><b>Incident response plan</b>: roles, severity levels, escalation paths, communication rules, and authority to act (who can take a server offline?).</li>
<li><b>Tools</b>: a jump kit with forensic laptops, write blockers, clean media, cables, and licensed software. Out-of-band communications in case email is compromised.</li>
<li><b>Playbooks</b>: step-by-step responses for common incidents: ransomware, phishing, BEC, lost laptop, DDoS.</li>
<li><b>Tabletop exercises</b>: walk through a scenario in a meeting room. Cheap, finds gaps in plans and communication.</li>
<li><b>Training</b>: for responders and for everyone who might report an incident.</li>
<li><b>Business continuity (BC) and disaster recovery (DR)</b>: keep critical functions running and restore IT. IR hands off to DR when systems must be rebuilt.</li></ul>
<div class="viz" id="viz-prep"></div>`},
{id:"detect",num:"3.4",title:"Detection, analysis and evidence handling",html:`
<p>Detection starts with an alert or report. Analysis confirms it's real, then scopes it: which hosts, accounts and data are involved, and how bad it is.</p>
<ul><li><b>IoCs</b>: hashes, IPs, domains, file names, registry keys and behaviors you can search for across the environment.</li>
<li><b>Evidence acquisition</b>: collect what you need, in a forensically sound way, before it changes.</li>
<li><b>Chain of custody</b>: a record of who handled each piece of evidence, when, and why, from collection to court.</li>
<li><b>Validating data integrity</b>: hash the evidence (SHA-256) when you collect it and again before analysis. Matching hashes prove nothing changed.</li>
<li><b>Preservation</b>: work on copies, never the original. Store originals securely.</li>
<li><b>Legal hold</b>: when litigation is expected, legal orders that relevant data must not be deleted, even by normal retention policies.</li></ul>
<div class="viz" id="viz-hash"></div>
<div class="viz" id="viz-coc"></div>
<h3>Severity and scope</h3>
<p>Severity usually weighs <b>functional impact</b> (what stopped working), <b>information impact</b> (was data exposed?), and <b>recoverability</b> (can you get it back, and how fast?).</p>
<div class="viz" id="viz-sev"></div>`},
{id:"forensics",num:"3.5",title:"Forensics basics",html:`
<h3>Order of volatility</h3>
<p>Collect the data that disappears fastest first (RFC 3227):</p>
<ol><li>CPU registers and cache</li><li>Routing tables, ARP cache, process table, kernel stats, <b>memory (RAM)</b></li><li>Temporary file systems and swap</li><li>Disk</li><li>Remote logging and monitoring data</li><li>Physical configuration and network topology</li><li>Archival media and backups</li></ol>
<p>That's why you usually <b>don't power off</b> a compromised machine: RAM holds running malware, network connections, decryption keys and injected code that never touches disk.</p>
<h3>Acquisition</h3>
<ul><li><b>Memory capture</b>: tools such as WinPmem, Magnet RAM Capture or FTK Imager; analyzed with <b>Volatility</b>.</li>
<li><b>Disk imaging</b>: a bit-for-bit copy through a <b>write blocker</b> so the original isn't modified; tools such as FTK Imager or <span class="mono">dd</span>.</li>
<li><b>Timeline analysis</b>: combine file system timestamps (MAC times: modified, accessed, created), event logs and network logs into one sequence.</li>
<li><b>Cloud and containers</b>: snapshot volumes, export audit logs, and preserve container images before they're replaced.</li></ul>
<div class="viz" id="viz-mem"></div>
<div class="viz" id="viz-timeline"></div>`},
{id:"contain",num:"3.6",title:"Containment, eradication and recovery",html:`
<h3>Containment</h3>
<p>Stop the spread, while keeping the evidence. Choose a strategy based on <b>scope</b> and <b>impact</b>:</p>
<ul><li><b>Isolation</b>: cut the host off (EDR network isolation, switch port shutdown, quarantine VLAN). Keeps it running for forensics.</li>
<li><b>Segmentation</b>: tighten ACLs between zones so the attacker can't reach more systems.</li>
<li><b>Account actions</b>: disable accounts, reset passwords, revoke sessions and tokens.</li>
<li><b>Blocking</b>: C2 domains at DNS, IPs at the firewall, hashes in EDR.</li></ul>
<p>Sometimes you watch before you contain, to learn the attacker's scope, but only with leadership approval and when the risk allows it.</p>
<h3>Eradication</h3>
<p>Remove every trace: malware, persistence (tasks, services, Run keys), backdoor accounts, and the vulnerability that let them in. <b>Re-imaging</b> from a known-good image is more reliable than cleaning.</p>
<h3>Recovery</h3>
<p>Restore systems from clean backups, rebuild and harden, apply <b>compensating controls</b> where needed, and <b>monitor closely</b> for the attacker trying to come back. Restore in priority order based on business impact.</p>
<div class="viz" id="viz-contain"></div>
<div class="viz" id="viz-ceq"></div>`},
{id:"post",num:"3.7",title:"Post-incident activity",html:`
<ul><li><b>Forensic analysis</b>: complete the deep analysis that couldn't happen during the response.</li>
<li><b>Root cause analysis</b>: find the underlying cause, not just the symptom. Techniques include the <b>5 whys</b> and fishbone diagrams.</li>
<li><b>Lessons learned</b>: a blameless meeting soon after the incident. What happened, what went well, what didn't, what we'll change. Update the plan, playbooks, detections and training.</li>
<li><b>Evidence retention</b>: keep evidence as long as legal, regulatory and policy requirements say.</li></ul>
<div class="viz" id="viz-5why"></div>
<div class="viz" id="viz-phase"></div>`}
];

const G={
 fw:[["Kill Chain step 1","Reconnaissance"],["Kill Chain step 2","Weaponization"],["Kill Chain step 3","Delivery"],["Kill Chain step 4","Exploitation"],["Kill Chain step 5","Installation"],["Kill Chain step 6","Command and control"],["Kill Chain step 7","Actions on objectives"],["Weaponization example","Pairing a macro exploit with a RAT payload"],["Kill Chain weakness","Perimeter and malware focused; weak on insiders"],["Diamond Model vertices","Adversary, capability, infrastructure, victim"],["Diamond capability","The tools and malware used"],["Diamond infrastructure","IPs, domains and servers used"],["Diamond pivoting","Use one known vertex to find the others"],["ATT&CK tactic","The adversary's goal (the why)"],["ATT&CK technique","How the goal is achieved (T-number)"],["ATT&CK sub-technique","More specific variation (e.g., T1053.005)"],["T1566","Phishing (Initial Access)"],["T1059.001","PowerShell (Execution)"],["T1053.005","Scheduled Task (Persistence/Execution)"],["T1003.001","LSASS memory dumping (Credential Access)"],["T1021.002","SMB/Windows admin shares (Lateral Movement)"],["T1486","Data encrypted for impact (ransomware)"],["T1071","Application layer protocol (C2)"],["Number of Enterprise ATT&CK tactics","14"],["First ATT&CK tactic","Reconnaissance"],["Last ATT&CK tactic","Impact"],["OSSTMM","Peer-reviewed methodology for testing operational security"],["OWASP Testing Guide","Methodology for testing web application security"]],
 proc:[["NIST 800-61 phase 1","Preparation"],["NIST 800-61 phase 2","Detection and Analysis"],["NIST 800-61 phase 3","Containment, Eradication and Recovery"],["NIST 800-61 phase 4","Post-Incident Activity"],["IR plan contents","Roles, severity, escalation, communications, authority to act"],["Jump kit","Forensic laptop, write blockers, clean media, tools"],["Out-of-band communication","A channel separate from possibly compromised systems"],["Playbook","Step-by-step response for a specific incident type"],["Tabletop exercise","Discussion-based walk-through of a scenario"],["Simulation / functional exercise","Hands-on practice with real tools"],["Business continuity","Keeping critical business functions running"],["Disaster recovery","Restoring IT systems after a disruption"],["Incident vs event","An event is any observable occurrence; an incident violates policy or threatens security"],["Functional impact","What business functions were affected"],["Information impact","Whether data was exposed or altered"],["Recoverability","How easily and quickly you can recover"],["Scope","Which hosts, accounts and data are involved"],["Escalation","Moving an incident to higher authority or expertise"]],
 ev:[["Chain of custody","Record of who handled evidence, when and why"],["Evidence integrity","Proven by matching hashes over time"],["Hash algorithm for evidence","SHA-256 (MD5/SHA-1 are legacy)"],["Preservation","Work on copies; secure the original"],["Legal hold","Order to preserve data relevant to litigation"],["Order of volatility","Collect the most short-lived data first"],["Most volatile","CPU registers and cache"],["Collect before disk","RAM"],["Least volatile","Archives and backups"],["RFC 3227","Guidelines for evidence collection and archiving"],["Why not power off?","RAM evidence (processes, keys, connections) is lost"],["Write blocker","Prevents writes to the original drive during imaging"],["Bit-for-bit image","Exact copy including unallocated space"],["dd","Unix tool for raw disk images"],["FTK Imager","Tool for disk and memory imaging"],["Volatility","Memory forensics framework"],["windows.pslist","Volatility plugin listing processes"],["windows.netscan","Volatility plugin listing network connections"],["windows.malfind","Volatility plugin finding injected code"],["MAC times","Modified, accessed, created (changed) timestamps"],["Timeline analysis","Combining time-stamped artifacts into one sequence"],["Cloud evidence","Volume snapshots and exported audit logs"],["Masquerading","Malware named like a system process (scvhost.exe)"]],
 cer:[["Containment goal","Stop the spread while preserving evidence"],["Isolation","Cut a host off the network but keep it running"],["Quarantine VLAN","Restricted network segment for suspect hosts"],["Segmentation in IR","Tighten ACLs to limit attacker reach"],["Revoke sessions","Kill stolen tokens, not just passwords"],["Sinkholing","Redirect C2 domains to a controlled server"],["Eradication","Remove malware, persistence and the root vulnerability"],["Re-imaging","Rebuild from a known-good image"],["Why re-image vs clean?","You can't be sure cleaning removed everything"],["Recovery","Restore from clean backups, harden, monitor"],["Recovery monitoring","Watch for the attacker returning"],["Restore order","By business impact and dependencies"],["Compensating control in recovery","Temporary protection when a fix isn't ready"],["Root cause analysis","Finding the underlying cause"],["5 whys","Ask why repeatedly to reach the root cause"],["Fishbone diagram","Cause-and-effect diagram (Ishikawa)"],["Lessons learned","Blameless review that updates plans and controls"],["When to hold lessons learned","Soon after the incident, while details are fresh"],["After-action report","Written record of the incident and improvements"],["Evidence retention","Keep evidence per legal and policy requirements"]]
};
const DECKS=[["fw","Frameworks"],["proc","IR process and preparation"],["ev","Evidence and forensics"],["cer","Containment to lessons learned"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"An attacker researches employees on LinkedIn. Which Kill Chain phase?",o:["Reconnaissance","Weaponization","Delivery","Installation"],a:0,e:"Gathering information about the target."},
 {q:"An attacker builds a Word document that drops a RAT when macros run. Which Kill Chain phase?",o:["Weaponization","Delivery","Exploitation","Actions on objectives"],a:0,e:"Pairing the exploit with a payload, before it's sent."},
 {q:"The malicious document is emailed to the finance team. Which phase?",o:["Delivery","Weaponization","Exploitation","C2"],a:0,e:"Transmitting the weapon."},
 {q:"Malware creates a service so it survives reboots. Which phase?",o:["Installation","Exploitation","Delivery","Reconnaissance"],a:0,e:"Establishing persistence."},
 {q:"Ransomware encrypts the file servers. Which phase?",o:["Actions on objectives","C2","Installation","Weaponization"],a:0,e:"The attacker achieves their goal."},
 {q:"Why is it best to break the Kill Chain early?",o:["Later phases mean more damage and harder recovery","Early phases are easier to log","It's required by law","Attackers stop at phase 3"],a:0,e:"Stopping delivery is far cheaper than recovering from impact."},
 {q:"What are the four vertices of the Diamond Model?",o:["Adversary, capability, infrastructure, victim","People, process, technology, data","Recon, delivery, exploit, impact","Identify, protect, detect, respond"],a:0,e:"The four core features of every intrusion event."},
 {q:"An analyst uses a C2 domain from one incident to find other compromised companies using the same domain. Which Diamond Model concept?",o:["Pivoting from infrastructure","Weaponization","Kill chain reversal","Root cause analysis"],a:0,e:"Pivoting across vertices."},
 {q:"In the Diamond Model, custom malware and an exploit kit are examples of:",o:["Capability","Infrastructure","Victim","Adversary"],a:0,e:"Capability is the tooling."},
 {q:"In MITRE ATT&CK, what is a tactic?",o:["The adversary's goal, such as Persistence","A specific tool","A CVE","A log source"],a:0,e:"Tactics are the why; techniques are the how."},
 {q:"T1053.005 is an example of:",o:["A sub-technique","A tactic","A CVE","A Diamond vertex"],a:0,e:"T1053 is the technique; .005 the sub-technique (Scheduled Task)."},
 {q:"An attacker dumps lsass.exe memory with procdump. Which ATT&CK tactic?",o:["Credential Access","Exfiltration","Initial Access","Impact"],a:0,e:"T1003.001 OS Credential Dumping: LSASS Memory."},
 {q:"An attacker uses PsExec over admin shares to reach other servers. Which tactic?",o:["Lateral Movement","Discovery","Collection","Reconnaissance"],a:0,e:"Moving between systems."},
 {q:"An attacker runs 'net group \"Domain Admins\" /domain' and 'nltest /dclist'. Which tactic?",o:["Discovery","Persistence","Impact","Exfiltration"],a:0,e:"Learning about the environment."},
 {q:"An attacker clears event logs and disables EDR. Which tactic?",o:["Defense Evasion","Credential Access","Collection","Execution"],a:0,e:"Avoiding detection."},
 {q:"Which is the FIRST tactic in the Enterprise ATT&CK matrix?",o:["Reconnaissance","Initial Access","Execution","Impact"],a:0,e:"Reconnaissance, then Resource Development, then Initial Access."},
 {q:"A SOC maps all its detection rules to ATT&CK techniques to find which ones it can't see. What is this used for?",o:["Detection gap analysis","Risk transfer","CVSS scoring","Legal hold"],a:0,e:"Coverage mapping shows blind spots."},
 {q:"Which methodology is a peer-reviewed manual for testing operational security across people, physical, wireless and networks?",o:["OSSTMM","OWASP Testing Guide","ATT&CK","Kill Chain"],a:0,e:"Open Source Security Testing Methodology Manual."},
 {q:"A tester follows a guide covering authentication, session management, input validation and business logic testing of a web app. Which?",o:["OWASP Testing Guide","OSSTMM","Diamond Model","NIST 800-61"],a:0,e:"The OWASP Web Security Testing Guide."},
 {q:"What are the four phases of the NIST 800-61 incident response life cycle?",o:["Preparation; Detection and Analysis; Containment, Eradication and Recovery; Post-Incident Activity","Identify, Protect, Detect, Respond","Plan, Do, Check, Act","Recon, Delivery, Exploit, Impact"],a:0,e:"Learn the order."},
 {q:"Which phase includes building playbooks and running tabletop exercises?",o:["Preparation","Detection and Analysis","Containment","Post-Incident Activity"],a:0,e:"Done before incidents happen."},
 {q:"Which IR plan element answers 'who can take the payment server offline at 2 a.m.?'",o:["Authority and escalation roles","Lessons learned","Chain of custody","SLA"],a:0,e:"The plan must grant authority to act."},
 {q:"Email is suspected to be compromised during an incident. How should responders communicate?",o:["An out-of-band channel","Reply-all on corporate email","Public social media","The compromised system's chat"],a:0,e:"Don't let the attacker read your response."},
 {q:"Leadership walks through a ransomware scenario in a conference room to test decisions. What is this?",o:["Tabletop exercise","Full interruption test","Penetration test","Parallel test"],a:0,e:"Discussion-based exercise."},
 {q:"What is the main purpose of a playbook?",o:["Consistent, step-by-step response to a specific incident type","Calculating CVSS","Assigning blame","Replacing the IR plan"],a:0,e:"Standardized response."},
 {q:"Ransomware destroyed the ERP servers. Which plan guides rebuilding IT systems at the alternate site?",o:["Disaster recovery plan","Acceptable use policy","Vulnerability management policy","Change management policy"],a:0,e:"DR restores IT; BC keeps the business running."},
 {q:"What's the difference between an event and an incident?",o:["An incident is an event that violates policy or threatens security","They're the same","An event is always malicious","Incidents are only physical"],a:0,e:"Not every event is an incident."},
 {q:"Which document records who collected a disk image, when, and every transfer since?",o:["Chain of custody form","Legal hold notice","SLA","MOU"],a:0,e:"Chain of custody."},
 {q:"How do you prove a forensic image hasn't changed since collection?",o:["Compare its hash with the hash taken at acquisition","Check the file size","Look at the timestamp","Open it and read it"],a:0,e:"Matching hashes prove integrity."},
 {q:"Legal counsel expects a lawsuit over a breach. What must they issue so related data isn't deleted?",o:["A legal hold","A chain of custody","A change request","An NDA"],a:0,e:"Legal hold overrides normal retention."},
 {q:"Why should analysts work on a copy of evidence rather than the original?",o:["To preserve the original's integrity","Copies are faster","Originals are encrypted","It's cheaper"],a:0,e:"Preservation."},
 {q:"Which factors are commonly used to rate incident severity?",o:["Functional impact, information impact, recoverability","CVSS, EPSS, KEV","Number of analysts on shift","Vendor and product"],a:0,e:"NIST's impact categories."},
 {q:"An incident exposed 2 million customer records but no systems are down. Which impact is HIGH?",o:["Information impact","Functional impact","Recoverability","None"],a:0,e:"Data was exposed."},
 {q:"According to the order of volatility, what should be collected FIRST?",o:["CPU registers and cache","Disk image","Backups","Remote logs"],a:0,e:"The shortest-lived data first."},
 {q:"Which should be captured BEFORE imaging the disk?",o:["RAM","Archived backups","Network diagrams","Printed logs"],a:0,e:"Memory is more volatile."},
 {q:"Why should a compromised server usually NOT be powered off immediately?",o:["Memory evidence like running processes and connections would be lost","It voids the warranty","It speeds up the attacker","Logs are stored in RAM only"],a:0,e:"RAM holds critical evidence."},
 {q:"What does a write blocker do?",o:["Prevents any writes to the source drive while imaging","Encrypts the image","Speeds up imaging","Blocks malware"],a:0,e:"Protects the original."},
 {q:"Which tool analyzes a captured memory image for processes, connections and injected code?",o:["Volatility","Nmap","Nessus","Burp Suite"],a:0,e:"The standard memory forensics framework."},
 {q:"Volatility's malfind finds a private memory region marked PAGE_EXECUTE_READWRITE beginning with 'MZ' in explorer.exe. What does it suggest?",o:["Code injection into explorer.exe","Normal DLL loading","A disk error","A legitimate update"],a:0,e:"An executable in RWX private memory is a classic injection sign."},
 {q:"A process named scvhost.exe runs from C:\\Users\\Public. What technique is this?",o:["Masquerading","Process hollowing only","Pass-the-hash","Kerberoasting"],a:0,e:"Named to look like svchost.exe."},
 {q:"What is timeline analysis?",o:["Combining timestamped artifacts into one ordered sequence of events","Measuring how long IR took","Scheduling scans","Calculating MTTR"],a:0,e:"It shows what happened when."},
 {q:"A compromised cloud VM must be preserved. What's the BEST first evidence step?",o:["Snapshot its volumes and export the relevant audit logs","Terminate the instance","Rebuild it from the image","Change its instance type"],a:0,e:"Snapshots preserve state before changes."},
 {q:"What is the PRIMARY goal of containment?",o:["Stop the incident spreading while preserving evidence","Find the attacker's identity","Restore from backup","Write the final report"],a:0,e:"Limit damage."},
 {q:"Which containment action keeps an infected laptop running for forensics but stops it talking to other hosts?",o:["EDR network isolation","Power off","Wipe the drive","Unplug the power cord"],a:0,e:"Isolation preserves memory."},
 {q:"An attacker has a stolen session token for a cloud account. Resetting the password alone isn't enough. What else?",o:["Revoke all active sessions and tokens","Change the username","Disable logging","Delete the mailbox"],a:0,e:"Tokens stay valid until revoked."},
 {q:"Redirecting a malware family's C2 domain to a server you control is called:",o:["Sinkholing","Spoofing","Pharming","Tarpitting"],a:0,e:"Sinkholes cut C2 and show who's infected."},
 {q:"Why might a team delay containment to observe an attacker?",o:["To understand the full scope before acting, with leadership approval","To let the attacker finish","To save money","It's always required"],a:0,e:"Rare and risky; needs approval."},
 {q:"Which action belongs to eradication?",o:["Removing persistence and patching the exploited vulnerability","Isolating the host","Calling law enforcement","Writing lessons learned"],a:0,e:"Remove the attacker completely."},
 {q:"Why is re-imaging preferred over cleaning malware?",o:["You can't be certain cleaning removed everything","Cleaning is illegal","Re-imaging is slower","Antivirus can't clean"],a:0,e:"A known-good rebuild removes hidden persistence."},
 {q:"After restoring from backup, what should the team do?",o:["Monitor closely for re-infection or attacker return","Delete all logs","Turn off EDR","Close the incident immediately"],a:0,e:"Attackers often try to come back."},
 {q:"Backups from the last 3 weeks may contain the attacker's persistence. What should you do?",o:["Restore from a backup before the earliest compromise and validate it","Restore the newest backup","Skip backups","Restore all backups at once"],a:0,e:"Make sure the restore point is clean."},
 {q:"In what order should systems be restored after a large incident?",o:["By business priority and dependencies (identity and network first)","Alphabetically","Smallest first","Randomly"],a:0,e:"Core dependencies like AD and DNS come before apps."},
 {q:"What is the purpose of root cause analysis?",o:["Find the underlying reason the incident happened","Identify who to fire","Calculate the ransom","Restore data"],a:0,e:"Fix the cause, not just the symptom."},
 {q:"Asking 'why?' repeatedly until the underlying cause appears is the:",o:["5 whys technique","Diamond Model","Kill chain","Delphi method"],a:0,e:"A simple root cause technique."},
 {q:"When should the lessons-learned meeting happen?",o:["Soon after the incident while details are fresh","A year later","Only if the incident was severe and public","Never; it assigns blame"],a:0,e:"Within days to a couple of weeks."},
 {q:"Which output of lessons learned improves future response the MOST?",o:["Updated playbooks, detections and training","A list of people to blame","A deleted ticket","A new logo"],a:0,e:"Feed changes back into preparation."},
 {q:"An analyst confirms ransomware is real and identifies affected hosts. Which phase?",o:["Detection and Analysis","Preparation","Post-Incident Activity","Recovery"],a:0,e:"Confirming and scoping."},
 {q:"Blocking the C2 domain at DNS during an active incident is part of:",o:["Containment","Preparation","Lessons learned","Recovery"],a:0,e:"It stops the spread and control."},
 {q:"A responder finds the phishing email in 40 other inboxes during analysis. What should happen next?",o:["Expand the scope and contain all affected mailboxes and hosts","Ignore the others","Close the ticket","Wait for more reports"],a:0,e:"Scope drives containment."},
 {q:"Which artifact links a malicious file found on disk to the user who opened it, and when?",o:["Event logs and file system timestamps combined in a timeline","CVSS score","The SBOM","The DR plan"],a:0,e:"Timeline analysis."},
 {q:"A user's laptop was stolen, encrypted with BitLocker and with no sign of access. Which phase determines whether this is a reportable breach?",o:["Detection and Analysis","Eradication","Preparation","Recovery"],a:0,e:"Analysis determines impact and obligations."},
 {q:"Which BEST describes incident declaration?",o:["Formally deciding an event is an incident, which triggers the IR plan","Calling the press","Closing a ticket","Patching a server"],a:0,e:"Declaration starts the formal process."},
 {q:"Which Kill Chain phase does a malicious email attachment arriving in an inbox represent?",o:["Delivery","Weaponization","Installation","Actions on objectives"],a:0,e:"Sending the weapon to the target."},
 {q:"Which ATT&CK tactic covers ransomware encrypting files?",o:["Impact","Collection","Exfiltration","Discovery"],a:0,e:"T1486 Data Encrypted for Impact."},
 {q:"Which ATT&CK tactic covers uploading stolen data to cloud storage?",o:["Exfiltration","Collection","Impact","Persistence"],a:0,e:"Moving data out."},
 {q:"What should an IR plan's communication section define?",o:["Who communicates with whom, when and through which channels","Firewall rules","CVSS thresholds","Backup retention only"],a:0,e:"Communication rules."},
 {q:"Which exercise involves actually failing over systems to the DR site?",o:["A full or functional test","A tabletop","A walkthrough","A checklist review"],a:0,e:"Hands-on, not discussion."},
 {q:"Which hash algorithm is preferred today for evidence integrity?",o:["SHA-256","MD5","CRC32","ROT13"],a:0,e:"MD5 and SHA-1 have known collisions."},
 {q:"What is dwell time?",o:["How long an attacker was in the environment before detection","Time to restore backups","Length of a lessons-learned meeting","Time a scan runs"],a:0,e:"First activity to detection."},
 {q:"Which phase includes resetting credentials the attacker may have stolen?",o:["Eradication","Preparation","Detection","Lessons learned"],a:0,e:"Removing the attacker's means of access."},
 {q:"Why capture network connection state early?",o:["Connections close quickly and show C2 or lateral movement","They never change","Disks hold them forever","It's required by CVSS"],a:0,e:"It's volatile."},
 {q:"Which tool captures a bit-for-bit disk image on Linux?",o:["dd","grep","netstat","whois"],a:0,e:"dd copies raw blocks."},
 {q:"A team restores systems but the same intrusion recurs a week later. What was MOST likely skipped?",o:["Eradication and root cause remediation","Preparation","Detection","Reporting"],a:0,e:"The attacker's access or entry point remained."},
 {q:"Who should attend a lessons-learned meeting?",o:["Everyone involved in the response, including IT, security, legal and business owners as needed","Only the CISO","Only the attacker","Nobody"],a:0,e:"All responders contribute."}
];

registerModule({
  id:"ir",slug:"incident",title:"Incident Response and Management",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["kc","diamond","tactics","fwq","cycle","prep","hash","coc","sev","mem","timeline","contain","ceq","5why","phase"],
  viz(){
/* ---- Kill chain mapper ---- */
(function(){
  const el=$("#viz-kc");
  const PH=["Reconnaissance","Weaponization","Delivery","Exploitation","Installation","Command and control","Actions on objectives"];
  const EV=[["Attacker scrapes the finance team from LinkedIn",0],["Builds invoice_77.docm with a macro dropper",1],["Emails it to accounts payable",2],["Macro runs when Excel... er, Word opens it",3],["Creates a scheduled task GoogleUpdateTaskX",4],["Implant calls 91.215.85.4:8443 every 60 s",5],["Zips payroll data and uploads it",6]];
  const order=shuffleArr(EV.map((_,i)=>i));let pick=null;const placed={};
  el.innerHTML=`<div class="viz-title">Map the intrusion to the Cyber Kill Chain</div><div class="chips sim-pool"></div><div class="kc">${PH.map((p,i)=>`<button class="kc-r" data-p="${i}"><span class="mono">${i+1}</span><span><b>${p}</b><br><span class="s-small" data-s="${i}">…</span></span></button>`).join("")}</div><div class="caption" aria-live="polite">Tap an event, then the phase it belongs to.</div>`;
  function draw(m){$(".sim-pool",el).innerHTML=order.map(i=>placed[i]!==undefined?"":`<button class="chip" data-e="${i}" aria-pressed="${pick===i}" style="font-family:inherit">${EV[i][0]}</button>`).join("")||'<span class="status-good">Every event placed.</span>';
    PH.forEach((_,p)=>{const e=Object.keys(placed).find(k=>placed[k]===p);$(`[data-s="${p}"]`,el).textContent=e!==undefined?EV[e][0]:"…";el.querySelector(`[data-p="${p}"]`).classList.toggle("on",e!==undefined)});if(m)$(".caption",el).innerHTML=m}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-e]"),p=e.target.closest("[data-p]");
    if(c){pick=+c.dataset.e;draw();return}
    if(p&&pick!==null){const ph=+p.dataset.p;if(EV[pick][1]===ph){placed[pick]=ph;pick=null;draw('<span class="status-good">Right.</span>');if(Object.keys(placed).length===EV.length){award("viz:kc",30,"Mapped the full kill chain");$(".caption",el).innerHTML='<span class="status-good">Full chain mapped.</span> Blocking macros from the internet would have broken it at Exploitation; DNS filtering at C2.'}}
      else draw(`<span class="status-bad">Not that phase.</span> Think about whether the attacker is preparing, sending, running, persisting, talking or acting.`)}});
  EV[3][0]="Macro runs when the user opens the document";draw();
})();

/* ---- Diamond model ---- */
(function(){
  const el=$("#viz-diamond");
  const D={adv:["Adversary","FIN-SPIDER (financially motivated crime group)","Attribution often comes last. Knowing the group tells you its usual targets and TTPs."],cap:["Capability","Macro dropper + custom RAT 'scvhost.exe'","Hashes and YARA rules from the malware let you search other hosts."],inf:["Infrastructure","invoice-portal-secure.top, 91.215.85.4","Pivot here: passive DNS shows 6 other domains on the same IP. Block them all."],vic:["Victim","Acme finance team, FIN-PC07","Other victims of the same infrastructure may share intel through the ISAC."]};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Pivot around the Diamond Model</div><div class="dia"><span></span><button data-k="adv"><b>Adversary</b><span class="s-small">who</span></button><button data-k="inf"><b>Infrastructure</b><span class="s-small">where from</span></button><button data-k="cap"><b>Capability</b><span class="s-small">with what</span></button><span></span><button data-k="vic"><b>Victim</b><span class="s-small">against whom</span></button></div><div class="caption" aria-live="polite">Tap each vertex of this intrusion.</div>`;
  const dia=$(".dia",el);dia.style.gridTemplateColumns="1fr 1fr 1fr";dia.innerHTML=`<span></span><button data-k="adv"><b>Adversary</b><span class="s-small">who</span></button><span></span><button data-k="cap"><b>Capability</b><span class="s-small">with what</span></button><span></span><button data-k="inf"><b>Infrastructure</b><span class="s-small">from where</span></button><span></span><button data-k="vic"><b>Victim</b><span class="s-small">against whom</span></button><span></span>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;const d=D[b.dataset.k];seen.add(b.dataset.k);el.querySelectorAll("[data-k]").forEach(x=>x.classList.toggle("on",seen.has(x.dataset.k)));
    $(".caption",el).innerHTML=`<b>${d[0]}:</b> ${d[1]}. ${d[2]}`;if(seen.size===4)award("viz:diamond",20,"Explored every Diamond vertex")});
})();

sortViz($("#viz-tactics"),{title:"Name the ATT&CK tactic",bins:{ia:"Initial Access",ex:"Execution",per:"Persistence",ca:"Credential Access",lm:"Lateral Movement",c2:"Command and Control",exf:"Exfiltration",imp:"Impact"},
  items:[["Spearphishing attachment (T1566.001)","ia","Getting in."],["PowerShell runs an encoded command (T1059.001)","ex","Running code."],["Scheduled task created to run at logon (T1053.005)","per","Surviving reboots."],["procdump -ma lsass.exe (T1003.001)","ca","Stealing credentials."],["PsExec to another server over admin shares (T1021.002)","lm","Moving between hosts."],["HTTPS beacon to 91.215.85.4 (T1071.001)","c2","Talking to the implant."],["Upload payroll.zip to cloud storage (T1567)","exf","Data out."],["Files encrypted with a ransom note (T1486)","imp","Hurting the business."],["Exploit the public VPN appliance (T1190)","ia","Exploit public-facing application."],["Registry Run key added (T1547.001)","per","Boot or logon autostart."]],done:"Named every ATT&CK tactic"});

quizViz($("#viz-fwq"),{title:"Which framework fits?",done:"Picked the right framework every time",qs:[
  ["The SOC wants to know which adversary techniques it has no detections for.",["MITRE ATT&CK","Cyber Kill Chain","OSSTMM","OWASP Testing Guide"],0,"Map detections to techniques."],
  ["An analyst pivots from a C2 IP to find other victims and tools of the same group.",["Diamond Model","OWASP Testing Guide","CVSS","OSSTMM"],0,"Pivot between vertices."],
  ["A briefing for executives explains where the attack could have been stopped earliest.",["Cyber Kill Chain","STIX","OSSTMM","SBOM"],0,"A simple linear story."],
  ["A tester needs a methodology for checking a web app's session management and business logic.",["OWASP Testing Guide","Diamond Model","ATT&CK","Kill Chain"],0,"Web app testing."],
  ["An auditor wants measurable operational security testing that covers people, physical and wireless.",["OSSTMM","ATT&CK","Diamond Model","CVSS"],0,"Broad operational security testing."]]});

stepViz($("#viz-cycle"),{title:"The NIST incident response life cycle",done:"Walked the incident response cycle",steps:[
  ["Preparation","Plans, playbooks, tools, training and exercises. The work that makes every other phase faster."],
  ["Detection and Analysis","An alert fires. Validate it, declare an incident, scope it and rate its severity."],
  ["Containment","Stop the spread: isolate hosts, disable accounts, block C2. Preserve evidence as you go."],
  ["Eradication","Remove malware, persistence and backdoor accounts, and fix the vulnerability that let them in."],
  ["Recovery","Restore from clean backups, harden, and monitor closely for the attacker's return."],
  ["Post-Incident Activity","Root cause analysis and lessons learned. Updates flow back to Preparation, closing the loop."]],
  end:"Containment, Eradication and Recovery is one NIST phase, often looped: contain, eradicate, recover, and repeat if more hosts turn up."});

sortViz($("#viz-prep"),{title:"What's part of being prepared?",bins:{plan:"IR plan",kit:"Tools / jump kit",pb:"Playbooks",ex:"Exercises and training",bcdr:"BC / DR"},
  items:[["Severity levels and who can authorize taking systems offline","plan","Authority to act."],["Forensic laptop, write blockers and clean USB drives","kit","Ready before you need it."],["Step-by-step ransomware response","pb","Incident-specific steps."],["Quarterly tabletop with legal, PR and IT","ex","Practice decisions."],["Alternate site for the order system","bcdr","Business continuity."],["Out-of-band phone bridge and Signal group","kit","Communications that don't depend on email."],["Phishing response steps with SOAR actions","pb","Repeatable workflow."],["Help desk training on recognizing and reporting incidents","ex","Everyone is a sensor."],["RTO of 4 hours for the payment system","bcdr","Recovery objectives."],["Escalation contacts for legal, HR and executives","plan","Who to call."]],done:"Sorted the preparation checklist"});

/* ---- evidence hashing ---- */
(function(){
  const el=$("#viz-hash");const orig="Evidence item 001: FIN-PC07 memory image\nCollected 2026-11-09 03:41 UTC by R. Patel\nSize: 16,777,216 KB";
  let h0=null,tampered=false;
  el.innerHTML=`<div class="viz-title">Prove the evidence hasn't changed</div><textarea class="mono" rows="4" style="width:100%;background:#05080f;color:var(--fg);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:13px" aria-label="Evidence content">${orig}</textarea>
  <div class="s-small">Hash recorded at acquisition (SHA-256)</div><div class="mono hash0" style="word-break:break-all;font-size:12.5px"></div><div class="s-small">Hash now</div><div class="mono hash1" style="word-break:break-all;font-size:12.5px"></div><div class="caption" aria-live="polite">Change a single character in the evidence and watch the hash.</div>`;
  async function sha(t){if(!(crypto&&crypto.subtle))return "(SHA-256 needs a secure page; open the guide over https)";const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
  async function draw(){const t=$("textarea",el).value,h=await sha(t);if(h0===null){h0=h;$(".hash0",el).textContent=h0}$(".hash1",el).textContent=h;
    const same=h===h0;$(".hash1",el).style.color=same?"var(--good)":"var(--bad)";
    if(!same)tampered=true;
    $(".caption",el).innerHTML=same?(tampered?'<span class="status-good">Back to the original: hashes match again.</span> That\'s how integrity is proven in court. Any change at all, and the hash is completely different.':"Hashes match. Now change one character."):'<span class="status-bad">Hash mismatch.</span> One character changed and the whole hash changed. The evidence can no longer be shown to be unaltered. Change it back.';
    if(tampered&&same)award("viz:hash",20,"Proved evidence integrity with hashing")}
  $("textarea",el).addEventListener("input",draw);draw();
})();

quizViz($("#viz-coc"),{title:"Keep the chain of custody intact",done:"Kept the chain of custody intact",qs:[
  ["You image a drive at the scene. What do you record FIRST on the custody form?",["Item description, serial number, hash, date/time and your name","Only the case number","The suspect's name","Nothing until the lab"],0,"Identify and fingerprint it immediately."],
  ["A colleague takes the drive to the lab. What must happen?",["Both sign the transfer with the date, time and purpose","Nothing; you're on the same team","Email them a note later","Hash it with MD5 only"],0,"Every hand-off is recorded."],
  ["The drive sat on an unlocked desk overnight. Why is that a problem?",["The chain is broken: you can't prove nobody tampered with it","It isn't; hashes fix everything","The drive may overheat","It voids the license"],0,"Secure storage is part of custody."],
  ["Legal expects litigation about this incident. What else should happen?",["A legal hold so related data isn't deleted","Delete the logs to save space","Post the evidence online","Restore the drive to production"],0,"Preserve everything relevant."]]});

quizViz($("#viz-sev"),{title:"Rate the incident",done:"Rated every incident correctly",qs:[
  ["Ransomware encrypted the order system. No data stolen. Restore from backup takes 2 days.",["High functional impact, low information impact, recoverable with time","Low across the board","Only information impact","Not an incident"],0,"Business stopped; data intact."],
  ["Attacker exfiltrated 400,000 patient records. All systems running normally.",["High information impact","High functional impact only","Low severity","An event, not an incident"],0,"Data breach; likely notification duties."],
  ["One kiosk shows a defaced screensaver. No network access, reimage in 10 minutes.",["Low severity","Critical","High information impact","Unrecoverable"],0,"Minimal impact, easily recoverable."],
  ["Domain controllers wiped and backups were also deleted.",["Critical: high functional impact and poor recoverability","Low","Medium","Information impact only"],0,"Recoverability drives the rating up."]]});

termViz($("#viz-mem"),{title:"Memory forensics: analyze FIN-PC07's RAM",done:"Analyzed a memory image",prompt:"dfir@lab:~/case4471$",
  intro:"The memory image <span class=\"mono\">mem.raw</span> was captured before isolation. Run Volatility 3 plugins with <span class=\"mono\">vol -f mem.raw PLUGIN</span>. Plugins: windows.pslist, windows.pstree, windows.cmdline, windows.netscan, windows.malfind.",
  files:{"mem.raw":"(binary memory image, 16 GB. Analyze it with vol.)\n","case_notes.txt":"Case 4471 · FIN-PC07 · user jdoe\nAcquired with WinPmem 03:41 UTC, SHA-256 recorded on custody form CF-118\n"},
  extra:{vol:a=>{const pl=a.find(x=>/^windows\./.test(x));if(!a.includes("-f")||!a.includes("mem.raw"))return "usage: vol -f mem.raw windows.pslist\n";if(!pl||!VOL[pl])return "Unknown plugin. Try windows.pslist, windows.pstree, windows.cmdline, windows.netscan or windows.malfind\n";return "Volatility 3 Framework 2.7.0\n"+VOL[pl]+"\n"},
         volatility:a=>"Use: vol -f mem.raw PLUGIN\n"},
  tasks:[
   {t:"List the processes.",hint:"vol -f mem.raw windows.pslist",check:l=>/windows\.pslist/.test(l)},
   {t:"One process is masquerading as a system process. What's its name?",hint:"Compare names carefully: svchost vs …",ans:"scvhost.exe"},
   {t:"What is its PID?",hint:"vol -f mem.raw windows.pslist | grep scvhost",ans:"4980"},
   {t:"Which process launched it? (name)",hint:"vol -f mem.raw windows.pstree",ans:"powershell.exe"},
   {t:"What remote IP is it connected to on port 8443?",hint:"vol -f mem.raw windows.netscan | grep 4980",ans:"91.215.85.4"},
   {t:"Which process has injected code according to malfind?",hint:"vol -f mem.raw windows.malfind",ans:"explorer.exe"}],
  end:"Outlook → Word macro → PowerShell → fake scvhost.exe with C2 on 8443 and SMB to the file server, plus code injected into explorer.exe. None of the injection would have been visible on disk."});

sortViz($("#viz-timeline"),{title:"Which artifact proves it?",bins:{mem:"Memory image",disk:"Disk image / file system",log:"Event and network logs"},
  items:[["The decryption key held by running ransomware","mem","Only exists in RAM."],["A deleted file recovered from unallocated space","disk","Bit-for-bit image includes unallocated space."],["The time a scheduled task was created (4698)","log","Windows security log."],["Code injected into explorer.exe","mem","malfind on the memory image."],["MAC times showing when upd.dll was written","disk","File system metadata."],["Firewall records of the 8443 connection","log","Network logs."],["An active network connection's owning process","mem","netscan."],["Prefetch file showing a program ran","disk","Windows execution artifact on disk."]],done:"Matched every artifact to its source"});

/* ---- containment choices ---- */
(function(){
  const el=$("#viz-contain");
  const A=[["Pull the power on FIN-PC07","bad","Stops the malware, but destroys RAM evidence: the injected code, C2 connection and keys. Isolate instead."],["EDR network isolation for FIN-PC07","good","Contained, and memory is preserved for forensics."],["Disable jdoe's account and revoke sessions","good","Cuts off the attacker's use of the stolen identity."],["Block 91.215.85.4 and invoice-portal-secure.top at the firewall and DNS","good","Breaks C2 for any other infected host."],["Re-image FIN-PC07 right away","bad","That's eradication, and doing it now wipes the evidence before it's collected."],["Email all staff about the attack from corporate email","bad","If email is compromised you've tipped off the attacker. Use out-of-band channels and coordinate comms."],["Tighten ACLs so the finance VLAN can't reach file servers over SMB","good","Segmentation limits lateral movement."]];
  const done=new Set();
  el.innerHTML=`<div class="viz-title">Contain the incident (without destroying evidence)</div><div class="hd-list">${A.map((a,i)=>`<button class="hd-i" data-i="${i}" style="text-align:left;width:100%">${a[0]}</button>`).join("")}</div><div class="caption" aria-live="polite">Tap each action to see whether it's a good containment step right now.</div><div class="rv-prog s-small"></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const i=+b.dataset.i,a=A[i];done.add(i);b.classList.add(a[1]==="good"?"ok":"no");
    if(i===4)flag("wiped");
    $(".caption",el).innerHTML=(a[1]==="good"?'<span class="status-good">Good call.</span> ':'<span class="status-bad">Not now.</span> ')+a[2];$(".rv-prog",el).textContent=`${done.size} of ${A.length} actions reviewed`;
    if(done.size===A.length)award("viz:contain",30,"Weighed every containment action")});
})();

sortViz($("#viz-ceq"),{title:"Containment, eradication or recovery?",bins:{c:"Containment",e:"Eradication",r:"Recovery"},
  items:[["Isolate infected hosts with EDR","c","Stop the spread."],["Delete the malicious scheduled task and service","e","Remove persistence."],["Restore the file share from immutable backup","r","Return to operation."],["Block the C2 domain at DNS","c","Cut control."],["Re-image the compromised laptops","e","Remove all traces."],["Patch the VPN flaw the attacker used","e","Fix the root vulnerability."],["Watch the restored servers closely for 30 days","r","Detect a return."],["Disable the backdoor admin account","e","Remove attacker access."],["Move suspect hosts to a quarantine VLAN","c","Limit reach."],["Bring the order system back online in priority order","r","Business-driven restoration."]],done:"Sorted every response action"});

stepViz($("#viz-5why"),{title:"Find the root cause with 5 whys",done:"Reached the root cause",steps:[
  ["Why were the file servers encrypted?","Because ransomware ran with domain admin rights."],
  ["Why did it have domain admin rights?","Because the attacker stole a domain admin's credentials from FIN-PC07's memory."],
  ["Why were domain admin credentials on a finance workstation?","Because an admin logged in to that PC with their domain admin account to fix a printer."],
  ["Why did they use a domain admin account for desktop support?","Because there are no separate tiered admin accounts for workstation support."],
  ["Why are there no tiered accounts?","Because privileged access was never designed: no PAM, no tiering policy. That's the root cause."]],
  end:"The fix isn't 'clean the malware'. It's tiered admin accounts and PAM, plus blocking macros, so the same chain can't happen again."});

sortViz($("#viz-phase"),{title:"Which NIST phase is it?",bins:{prep:"Preparation",da:"Detection and Analysis",cer:"Containment, Eradication, Recovery",post:"Post-Incident Activity"},
  items:[["Write the BEC playbook","prep","Before the incident."],["Validate the EDR alert and declare an incident","da","Confirm and declare."],["Disable compromised accounts","cer","Containment."],["Blameless lessons-learned meeting","post","After."],["Run a tabletop exercise","prep","Practice."],["Determine which hosts and data are affected","da","Scoping."],["Restore from clean backups","cer","Recovery."],["Update detections with new IoCs from the case","post","Feed back improvements."],["Rate severity using functional and information impact","da","Analysis."],["Root cause analysis report","post","Why it happened."]],done:"Placed every activity in its phase"});
  },
  sims:[
    {id:"ransom",type:"branch",title:"Ransomware at 3 a.m.",
      scenario:"03:12. EDR alerts on mass file renames on FIN-PC07, and the finance share \\\\files01\\finance is being encrypted. You're the on-call incident responder.",start:"a",
      nodes:{
        a:{t:"What do you do first?",log:"03:12:07 EDR  FIN-PC07  Ransomware behavior: 1,840 files renamed to *.lck in 60 s\n03:12:09 EDR  FIN-PC07  Process: C:\\Users\\Public\\scvhost.exe (PID 4980)\n03:12:30 FILES01      SMB writes from 10.0.4.22 to \\\\finance",opts:[["Isolate FIN-PC07 with EDR (keep it powered on) and declare an incident","b",""],["Power off FIN-PC07 immediately","x1","RAM evidence lost."],["Re-image FIN-PC07 right away to stop it","wipe","Eradication before containment and evidence collection."]]},
        b:{t:"The encryption on files01 stops. Your scope check finds the same scvhost.exe hash on two more hosts. Next?",opts:[["Isolate those hosts too, disable jdoe's account, revoke sessions and block the C2 domain and IP","c",""],["Focus only on FIN-PC07; the others may be false positives","x2","Ignoring scope lets it spread."],["Email all staff from corporate email that ransomware is spreading","c2","Possibly tipping off the attacker; use out-of-band comms."]]},
        c2:{t:"The email went out. Ten minutes later, the attacker deletes the shadow copies on a fourth host. You contain it too. What now?",opts:[["Switch to the out-of-band bridge, capture memory on the isolated hosts, then plan eradication","d",""],["Restore from backup now while hosts are still compromised","x3","Recovery before eradication."]]},
        c:{t:"Spread is contained. Forensics needs evidence. What do you collect first from the isolated hosts?",opts:[["Memory images, then disk images through write blockers, hashing each one and starting chain of custody","d",""],["Disk images only; memory doesn't matter","d","You lose the injected code and keys, but it's recoverable."],["Nothing; just re-image everything","wipe","Evidence destroyed."]]},
        d:{t:"Analysis shows the entry point: a macro in invoice_77.docm. Persistence: a scheduled task and a service. How do you eradicate?",opts:[["Re-image the affected hosts, remove the task/service everywhere, reset exposed credentials, block internet macros by policy","e",""],["Run an antivirus scan and put the hosts back","x3","Cleaning may leave persistence."]]},
        e:{t:"Ready to recover the finance share. Which backup?",log:"Backups: nightly to immutable storage\nEarliest attacker activity found: 2026-11-08 22:40 UTC",opts:[["Restore the immutable backup from 2026-11-08 20:00, validate it, then watch for re-infection","best",""],["Restore the newest backup (2026-11-09 02:00)","ok","It's after the attacker arrived; you may restore their foothold."]]}},
      ends:{best:{grade:"best",t:"Contained fast, evidence preserved, root cause fixed and a clean restore from before the compromise. Lessons learned: block internet macros, tier admin accounts, out-of-band comms in the playbook."},
        ok:{grade:"ok",t:"Files are back, but the restore point was after the attacker's first activity. You'll need to verify it isn't carrying their persistence."},
        x1:{grade:"bad",t:"The host is off. The C2 connection, the injected code and any encryption keys in RAM are gone, and the other infected hosts keep encrypting while you wait."},
        x2:{grade:"bad",t:"Two more hosts start encrypting the HR and engineering shares an hour later. Scope drives containment."},
        x3:{grade:"bad",t:"The restored systems are reinfected within hours by the persistence you didn't remove."},
        wipe:{grade:"bad",flag:"wiped",t:"Re-imaged before memory was captured. The evidence of how the attacker got in, and what else they touched, is gone."}},
      success:"Textbook response: contain, preserve, eradicate, recover from a clean point."},
    {id:"bec",type:"branch",title:"The CFO's mailbox",
      scenario:"Accounts payable got an email from the CFO's real mailbox asking to change a supplier's bank account before today's $480,000 payment.",start:"a",
      nodes:{
        a:{t:"Sign-in logs for the CFO show the following. What's your read?",log:"08:02 UTC  Columbus, US   Managed laptop   MFA: satisfied\n08:11 UTC  Lagos, NG      Unknown device   Token replay, no MFA prompt\n08:13 UTC  New inbox rule 'Archive': move mail containing 'invoice' or 'bank' to RSS Feeds\n08:20 UTC  Sent: 'Urgent: updated bank details' to ap@acme.com",opts:[["Account takeover via stolen session token; declare an incident","b",""],["Normal travel; the CFO is on a trip","x1","Columbus to Lagos in 9 minutes is impossible."]]},
        b:{t:"First containment step?",opts:[["Revoke all sessions and tokens, reset the password, check and re-register MFA methods","c",""],["Reset the password only","c1","The stolen token still works until it's revoked."],["Delete the CFO's mailbox","x2","Destroys evidence and the CFO's mail."]]},
        c1:{t:"Twenty minutes later the attacker is still reading mail. Why, and what now?",opts:[["The token is still valid. Revoke all sessions now and check MFA methods","c",""]]},
        c:{t:"The attacker is locked out. What else must you remove?",opts:[["The malicious inbox rule, any forwarding, and any OAuth apps they consented to","d",""],["Nothing; the password changed","x3","Rules and app grants survive a password reset."]]},
        d:{t:"The payment hasn't been released yet. What do you tell AP?",opts:[["Hold the payment and verify the bank change with the supplier by phone, using a number on file","e",""],["Pay it; the email came from the CFO's real mailbox","x4","That's exactly what BEC relies on."]]},
        e:{t:"How did the token get stolen? Evidence shows the CFO entered credentials on a fake login page that proxied the real one. What prevents a repeat?",opts:[["Phishing-resistant MFA (FIDO2 / passkeys), token protection, and conditional access requiring managed devices","best",""],["Longer passwords","ok","Helps a little, but adversary-in-the-middle phishing steals the session regardless."]]}},
      ends:{best:{grade:"best",t:"Account secured, persistence removed, payment stopped, and the root cause (phishable MFA plus token theft) fixed with phishing-resistant MFA and device-bound access."},
        ok:{grade:"ok",t:"You contained it, but the next adversary-in-the-middle phishing page will steal another session."},
        x1:{grade:"bad",t:"The attacker keeps the mailbox and the payment goes out. Impossible travel was the giveaway."},
        x2:{grade:"bad",t:"Evidence destroyed and the CFO is furious. The attacker's token still works on other apps."},
        x3:{grade:"bad",t:"The hidden rule keeps diverting supplier replies to RSS Feeds, and the attacker's OAuth app still reads mail."},
        x4:{grade:"bad",t:"$480,000 is wired to the attacker. Always verify bank changes out of band."}},
      success:"Business email compromise handled: sessions revoked, rules removed, money saved, root cause fixed."},
    {id:"memlab",type:"term",title:"Triage a second host's memory",
      scenario:"FILES01 showed SMB connections from the infected PC. Its memory image is <span class=\"mono\">mem.raw</span>. Find out if it's compromised too. Use <span class=\"mono\">vol -f mem.raw PLUGIN</span>.",
      prompt:"dfir@lab:~/case4471/files01$",
      files:{"mem.raw":"(binary memory image of FILES01)\n"},
      extra:{vol:a=>{const pl=a.find(x=>/^windows\./.test(x));const O={
        "windows.pslist":"PID   PPID  ImageFileName\n4     0     System\n680   604   services.exe\n696   604   lsass.exe\n812   680   svchost.exe\n2290  680   PSEXESVC.exe\n2304  2290  cmd.exe\n2380  2304  rundll32.exe\n3001  680   sqlwriter.exe",
        "windows.cmdline":"PID   Process        Args\n2290  PSEXESVC.exe   C:\\Windows\\PSEXESVC.exe\n2304  cmd.exe        cmd.exe /c rundll32.exe C:\\Windows\\Temp\\s.dll,Start\n2380  rundll32.exe   rundll32.exe C:\\Windows\\Temp\\s.dll,Start",
        "windows.netscan":"Proto  LocalAddr        ForeignAddr          State        PID   Owner\nTCPv4  10.0.4.10:445    10.0.4.22:51701      ESTABLISHED  4     System\nTCPv4  10.0.4.10:50110  91.215.85.4:8443     ESTABLISHED  2380  rundll32.exe",
        "windows.pstree":"* 680 services.exe\n** 2290 PSEXESVC.exe\n*** 2304 cmd.exe\n**** 2380 rundll32.exe\n** 812 svchost.exe",
        "windows.malfind":"No suspicious regions found."};
        if(!a.includes("-f")||!a.includes("mem.raw"))return "usage: vol -f mem.raw windows.pslist\n";return O[pl]?"Volatility 3 Framework 2.7.0\n"+O[pl]+"\n":"Plugins: windows.pslist, windows.pstree, windows.cmdline, windows.netscan, windows.malfind\n"}},
      tasks:[
        {t:"List the processes on FILES01.",hint:"vol -f mem.raw windows.pslist",check:l=>/windows\.pslist/.test(l)},
        {t:"Which remote-execution service is running? (process name)",hint:"Look for a service you don't expect on a file server.",ans:"PSEXESVC.exe"},
        {t:"Which DLL does rundll32 load? (file name)",hint:"vol -f mem.raw windows.cmdline",ans:["s.dll","c:\\windows\\temp\\s.dll"]},
        {t:"Which IP does that rundll32 process talk to?",hint:"vol -f mem.raw windows.netscan",ans:"91.215.85.4"},
        {t:"Which ATT&CK tactic does PsExec arriving from another host represent? (two words)",hint:"Moving from one system to another.",ans:"lateral movement"}],
      success:"FILES01 is compromised through PsExec lateral movement and beacons to the same C2. Expand the scope and contain it."},
    {id:"volorder",type:"order",title:"Collect evidence in order of volatility",
      scenario:"A compromised Linux server is still running. Put the acquisition steps in the right order.",
      steps:["Photograph the screen, note the time and start the chain of custody form","Capture RAM with a memory acquisition tool","Record network connections, routing table and ARP cache","Collect running process list and open files","Image the disk through a write blocker","Hash the images and verify them against the originals","Export remote logs from the SIEM and copy relevant backups"],
      success:"Most volatile first, every step documented, every copy hashed."},
    {id:"phases",type:"match",title:"Match the action to the phase",
      scenario:"During a malware outbreak, the team did six things. Match each to the IR phase it belongs to.",
      items:[["Preparation","prep"],["Detection and Analysis","da"],["Containment","con"],["Eradication","era"],["Recovery","rec"],["Post-Incident Activity","post"]],
      slots:[["prep","Last quarter","Ran a ransomware tabletop and stocked the jump kit"],["da","02:10","Correlated EDR and proxy alerts and declared a severity 1 incident"],["con","02:25","Isolated 4 hosts and blocked the C2 domain"],["era","Day 1","Re-imaged hosts and removed the scheduled-task persistence"],["rec","Day 2","Restored file shares from clean backups and increased monitoring"],["post","Day 9","Held a lessons-learned meeting and updated the playbook"]],
      success:"Six actions, six phases. Notice how Post-Incident feeds the next Preparation."}
  ],
  badges:[
    ["reader","IR","On Call","Mark all 7 incident response lessons studied",c=>c.allStudied()],
    ["lab","WR","War Room","Complete all 15 diagrams in this module",c=>c.vizAll()],
    ["kc","KC","Chain Breaker","Map the full Cyber Kill Chain",c=>c.earned("viz:kc")],
    ["mem","RAM","Memory Lane","Finish the memory forensics lab",c=>c.earned("viz:mem")],
    ["hash","#","Integrity Proven","Prove evidence integrity with hashing",c=>c.earned("viz:hash")],
    ["ransom","RW","Night Shift Hero","Find the best path in the ransomware playbook",c=>c.passed("ransom")],
    ["bec","BEC","Wire Stopper","Stop the fraudulent payment in the BEC playbook",c=>c.passed("bec")],
    ["coc","CC","Chain of Custody","Pass the order of volatility simulation",c=>c.passed("volorder")],
    ["sims","IC","Incident Commander","Pass all 5 incident response simulations",c=>["ransom","bec","memlab","volorder","phases"].every(c.passed)],
    ["perfect","IR+","Flawless Response","Score 100% on an incident response quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
