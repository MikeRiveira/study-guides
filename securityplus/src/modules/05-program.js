/* ================= Module 5: Security Program Management and Oversight (SY0-801 Domain 5.0, 14%) ================= */
(function(){
const LESSONS=[
{id:"gov",num:"5.1",title:"Security governance",html:`
<h3>The document hierarchy</h3>
<ul><li><b>Policies</b>: high-level statements of intent approved by leadership. Examples: <b>acceptable use policy (AUP)</b>, information security policy, <b>business continuity</b>, <b>disaster recovery</b>, <b>incident response</b>, <b>software development life cycle (SDLC)</b> and <b>change management</b> policies.</li>
<li><b>Standards</b>: mandatory specifics that support a policy. Examples: password, access control, physical security and encryption standards ("AES-256 for data at rest").</li>
<li><b>Procedures</b>: step-by-step instructions. Examples: change management steps, <b>onboarding and offboarding</b>, and <b>playbooks</b> for incident types.</li>
<li><b>Guidelines</b>: recommendations, not mandatory.</li></ul>
<div class="viz" id="viz-docs"></div>
<h3>External considerations</h3>
<p>Governance must account for <b>regulatory</b>, <b>legal</b> and <b>industry</b> requirements at <b>local/regional</b>, <b>national</b> and <b>global</b> levels. Documents need regular <b>monitoring and revision</b>.</p>
<h3>Governance structures</h3>
<p><b>Boards</b>, <b>committees</b> and <b>government entities</b> provide oversight. Governance can be <b>centralized</b> (one group sets rules for all) or <b>decentralized</b> (business units decide).</p>
<h3>Data roles</h3>
<ul><li><b>Owner</b>: a senior person accountable for the data, who decides its classification.</li>
<li><b>Controller</b>: decides why and how personal data is processed.</li>
<li><b>Processor</b>: processes data on the controller's behalf, such as a payroll provider.</li>
<li><b>Custodian / steward</b>: handles day-to-day care: backups, access, quality.</li></ul>
<div class="viz" id="viz-roles"></div>`},
{id:"risk",num:"5.2",title:"Risk management",html:`
<h3>The process</h3>
<p><b>Identify</b> risks, <b>assess</b> them (<b>ad hoc</b>, <b>recurring</b>, <b>one-time</b> or <b>continuous</b>), <b>analyze</b> them, record them, respond and report.</p>
<h3>Analysis</h3>
<ul><li><b>Qualitative</b>: ratings like low/medium/high, often on a heat map of <b>likelihood</b> and <b>impact</b>.</li>
<li><b>Quantitative</b>: money and numbers.
<ul><li><b>SLE</b> (single loss expectancy) = asset value × <b>exposure factor</b> (the percent lost in one event).</li>
<li><b>ARO</b> (annualized rate of occurrence) = how many times a year it's expected.</li>
<li><b>ALE</b> (annualized loss expectancy) = SLE × ARO.</li></ul></li></ul>
<div class="viz" id="viz-ale"></div>
<h3>The risk register</h3>
<p>A <b>risk register</b> lists each risk with its <b>risk owner</b>, ratings, response and <b>key risk indicators (KRIs)</b>, which are metrics that warn a risk is growing. A <b>risk threshold</b> marks the level that triggers action.</p>
<h3>Tolerance and appetite</h3>
<p><b>Risk appetite</b> is how much risk the organization is willing to take on to pursue its goals: <b>expansionary</b> (willing to take more), <b>neutral</b> or <b>conservative</b>. <b>Risk tolerance</b> is the acceptable variation around that.</p>
<h3>Responses</h3>
<ul><li><b>Mitigate</b>: add controls to reduce likelihood or impact.</li>
<li><b>Transfer</b>: shift the financial impact to someone else, such as with cyber insurance.</li>
<li><b>Avoid</b>: stop the risky activity entirely.</li>
<li><b>Accept</b>: live with it, often through a documented <b>exemption</b> or <b>exception</b>.</li></ul>
<div class="viz" id="viz-heat"></div>
<h3>Business impact analysis (BIA)</h3>
<p>A <b>BIA</b> finds the critical processes and what an outage costs. Its key numbers: <b>RTO</b> (maximum downtime), <b>RPO</b> (maximum data loss), <b>MTTR</b> (mean time to repair, average time to fix) and <b>MTBF</b> (mean time between failures, average time a system runs before failing; higher is better).</p>`},
{id:"vendor",num:"5.3",title:"Third-party risk management",html:`
<h3>Assess and select vendors</h3>
<ul><li><b>Vendor assessment</b>: their <b>penetration test</b> results, a <b>right-to-audit clause</b> in the contract, <b>evidence of internal audits</b>, <b>independent assessments</b> (like SOC 2 reports) and <b>supply chain analysis</b>.</li>
<li><b>Vendor selection</b>: <b>due diligence</b> on security, finances and reputation, plus checks for <b>conflicts of interest</b>.</li>
<li><b>Questionnaires</b> collect security details. <b>Vendor monitoring</b> continues after signing.</li>
<li><b>Rules of engagement</b>: what a vendor (or pen tester) may and may not do.</li></ul>
<h3>Agreement types</h3>
<ul><li><b>SLA</b> (service-level agreement): measurable service commitments, like 99.9% uptime and 4-hour response.</li>
<li><b>MOA</b> (memorandum of agreement): a more formal, often binding, agreement on specific responsibilities.</li>
<li><b>MOU</b> (memorandum of understanding): a statement of shared intent, usually not legally binding.</li>
<li><b>MSA</b> (master service agreement): the umbrella terms for an ongoing relationship.</li>
<li><b>SOW / WO</b> (statement of work / work order): the specific project, deliverables and timeline under an MSA.</li>
<li><b>NDA</b> (non-disclosure agreement): keeps shared information confidential.</li>
<li><b>BPA</b> (business partners agreement): how partners share profits, duties and decisions.</li></ul>
<div class="viz" id="viz-agree"></div>`},
{id:"comply",num:"5.4",title:"Compliance and privacy",html:`
<h3>Compliance</h3>
<p><b>Compliance reporting</b> can be <b>internal</b> (to leadership) or <b>external</b> (to regulators). <b>Consequences of non-compliance</b>: <b>fines</b>, <b>sanctions</b>, <b>reputational damage</b>, <b>loss of license</b> and <b>contractual impacts</b>.</p>
<p><b>Compliance monitoring</b> includes <b>due diligence</b> (investigating and understanding risks) and <b>due care</b> (acting on that knowledge with reasonable controls), <b>attestation and acknowledgement</b> (people sign that they follow policy), internal and external checks, and <b>automation</b>.</p>
<h3>Privacy</h3>
<ul><li><b>Legal implications</b> at local/regional, national and global levels, such as GDPR in the EU.</li>
<li><b>Data subject</b>: the person the data is about.</li>
<li><b>Controller vs processor</b>: the controller decides purpose; the processor acts on instructions.</li>
<li><b>Ownership</b>, a <b>data inventory</b> (what personal data you hold and where) and <b>data retention</b> rules.</li>
<li><b>Right to be forgotten</b>: under GDPR, data subjects can ask for their data to be erased.</li></ul>
<div class="viz" id="viz-privacy"></div>`},
{id:"audit",num:"5.5",title:"Audits, assessments and penetration testing",html:`
<h3>Audits and assessments</h3>
<ul><li><b>Attestation</b>: a formal statement, often by an auditor, that controls are in place and working.</li>
<li><b>Internal</b>: compliance checks, an <b>audit committee</b>, and <b>self-assessments</b>.</li>
<li><b>External</b>: <b>regulatory</b> examinations, <b>assessments</b> and <b>independent third-party audits</b>.</li></ul>
<h3>Penetration testing</h3>
<ul><li>Types: <b>physical</b>, <b>offensive</b> (red team attacks), <b>defensive</b> (blue team defends), and <b>integrated</b> (purple team: both working together).</li>
<li><b>Known environment</b> (white box): testers get full details. <b>Partially known</b> (gray box): some details. <b>Unknown environment</b> (black box): no details, like a real outsider.</li>
<li><b>Reconnaissance</b>: <b>passive</b> (public sources, no contact with the target) or <b>active</b> (scanning and probing the target directly).</li></ul>
<div class="viz" id="viz-pentest"></div>
<div class="viz" id="viz-box"></div>`},
{id:"frameworks",num:"5.6",title:"Threat frameworks: ATT&CK, Kill Chain and Diamond Model",html:`
<p>SY0-801 names three frameworks that security teams use to describe attacks in a shared language. They help with threat intelligence, finding gaps in detection, planning red and purple team tests, and writing clear incident reports.</p>
<h3>Lockheed Martin Cyber Kill Chain</h3>
<p>Seven phases an intrusion moves through. Break the chain at any phase and the attack fails, and the earlier you break it, the cheaper it is.</p>
<ol><li><b>Reconnaissance</b>: research the target (staff on LinkedIn, exposed services).</li>
<li><b>Weaponization</b>: build the payload, such as a malicious document with an exploit.</li>
<li><b>Delivery</b>: send it: phishing email, USB drive, compromised website.</li>
<li><b>Exploitation</b>: the payload triggers a vulnerability or the user runs it.</li>
<li><b>Installation</b>: malware or a backdoor is installed for persistence.</li>
<li><b>Command and control (C2)</b>: the implant calls home for instructions.</li>
<li><b>Actions on objectives</b>: data theft, encryption, sabotage.</li></ol>
<div class="viz" id="viz-killchain"></div>
<h3>MITRE ATT&amp;CK</h3>
<p>A free, detailed knowledge base of real attacker behavior. It's organized as a matrix:</p>
<ul><li><b>Tactics</b>: the attacker's goal at each stage (the columns), such as Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration and Impact.</li>
<li><b>Techniques</b> and <b>sub-techniques</b>: how they reach that goal, each with an ID, such as T1566 Phishing.</li>
<li><b>Procedures</b>: the specific way a known group uses a technique. Together these are <b>TTPs</b>.</li></ul>
<p>Teams map their detections to ATT&amp;CK to see which techniques they would catch and which they'd miss.</p>
<div class="viz" id="viz-attack"></div>
<h3>Diamond Model of Intrusion Analysis</h3>
<p>Every intrusion event has four connected corners: the <b>adversary</b> (who), the <b>capability</b> (the malware or technique), the <b>infrastructure</b> (domains, IP addresses, servers used) and the <b>victim</b> (the target). Find one corner and you can pivot to the others, for example from a C2 domain to other victims using the same infrastructure.</p>
<div class="viz" id="viz-diamond"></div>
<div class="tip"><b>Exam tip.</b> Phases in order means <b>Kill Chain</b>. Tactics, techniques and IDs means <b>ATT&amp;CK</b>. Adversary, capability, infrastructure and victim means the <b>Diamond Model</b>.</div>`},
{id:"aware",num:"5.7",title:"Security awareness",html:`
<h3>Phishing</h3>
<p>Run <b>phishing campaigns</b> (simulated phishing), teach people to <b>recognize phishing attempts</b>, and have a fast way to <b>respond to reported suspicious messages</b>.</p>
<h3>Anomalous behavior recognition</h3>
<ul><li><b>Risky</b>: deliberately bypassing controls, like disabling antivirus.</li>
<li><b>Unexpected</b>: unusual for that person, like logging in at 3 a.m. from abroad.</li>
<li><b>Unintentional</b>: honest mistakes, like emailing the wrong person.</li></ul>
<div class="viz" id="viz-anom"></div>
<h3>User guidance and training</h3>
<p>Topics: <b>policy and handbooks</b>, <b>situational awareness</b>, <b>insider threat</b>, <b>password management</b>, <b>removable media and cables</b> (malicious USB cables exist), <b>social engineering</b>, <b>operational security</b> (not oversharing on social media) and <b>hybrid/remote work environments</b>.</p>
<h3>Reporting and monitoring</h3>
<p>Track <b>initial</b> and <b>recurring</b> results, such as click rates and report rates over time. Then <b>develop</b> and <b>execute</b> the program: set goals, build content, deliver it, measure it and improve.</p>
<div class="viz" id="viz-program"></div>`}
];

const G={
 gov:[["Policy","High-level statement of intent approved by leadership"],["Standard","Mandatory specific requirement supporting a policy"],["Procedure","Step-by-step instructions"],["Guideline","Recommended, not mandatory"],["Acceptable use policy","Rules for using company systems"],["Playbook","Procedure for responding to a specific incident type"],["Onboarding / offboarding","Procedures for granting and removing access with staff changes"],["Data owner","Senior person accountable for data and its classification"],["Data controller","Decides why and how personal data is processed"],["Data processor","Processes data for the controller"],["Data custodian","Day-to-day care: backups, access, storage"],["Centralized governance","One group sets rules for the whole organization"],["Decentralized governance","Business units set their own rules"]],
 risk:[["SLE","Single loss expectancy = asset value × exposure factor"],["ARO","Annualized rate of occurrence"],["ALE","Annualized loss expectancy = SLE × ARO"],["Percent of an asset's value lost in a single event (used in SLE = AV × EF)","Exposure factor (EF)"],["Qualitative risk analysis","Uses ratings such as low/medium/high"],["Quantitative risk analysis","Uses monetary values and numbers"],["Risk register","List of risks with owners, ratings and responses"],["KRI","Key risk indicator: metric warning that a risk is rising"],["Risk owner","Person accountable for managing a specific risk"],["Risk threshold","Level that triggers action"],["Risk appetite","Amount of risk the organization will pursue"],["Risk tolerance","Acceptable variation around the appetite"],["Expansionary appetite","Willing to take more risk for reward"],["Conservative appetite","Prefers minimal risk"],["Mitigate","Reduce likelihood or impact with controls"],["Transfer","Shift financial impact, e.g. insurance"],["Avoid","Stop the risky activity"],["Accept","Live with the risk; document an exception"],["BIA","Business impact analysis of critical processes"],["MTTR","Mean time to repair"],["MTBF","Mean time between failures; higher is better"],["Continuous risk assessment","Ongoing, often automated, assessment"]],
 vendor:[["Right-to-audit clause","Contract term letting you audit the vendor"],["SOC 2 report","Independent assessment of a service provider's controls"],["Due diligence (vendor)","Investigating a vendor before selecting them"],["Conflict of interest","A relationship that could bias vendor selection"],["Vendor questionnaire","Security questions sent to a vendor"],["Rules of engagement","What a tester or vendor may and may not do"],["SLA","Service-level agreement with measurable commitments"],["MOU","Memorandum of understanding; shared intent, not binding"],["MOA","Memorandum of agreement; more formal, specific duties"],["MSA","Master service agreement; umbrella terms"],["SOW","Statement of work; specific project deliverables"],["NDA","Non-disclosure agreement"],["BPA","Business partners agreement"],["Supply chain analysis","Assessing risks from a vendor's own suppliers"]],
 frame:[["Cyber Kill Chain","Lockheed Martin's 7 phases of an intrusion"],["Kill Chain order","Recon, weaponization, delivery, exploitation, installation, C2, actions on objectives"],["Weaponization","Building the payload, e.g. a document with an exploit"],["Delivery (Kill Chain)","Sending the payload: email, USB, web"],["Installation (Kill Chain)","Malware installed for persistence"],["Actions on objectives","The attacker's goal: theft, encryption, sabotage"],["MITRE ATT&CK","Knowledge base of real attacker tactics and techniques"],["ATT&CK tactic","The attacker's goal at a stage, e.g. Persistence"],["ATT&CK technique","How a tactic is achieved, with an ID such as T1566"],["TTPs","Tactics, techniques and procedures"],["Lateral Movement (tactic)","Moving between systems inside a network"],["Exfiltration (tactic)","Moving stolen data out of the network"],["Defense Evasion (tactic)","Avoiding detection, e.g. clearing logs"],["Diamond Model","Intrusion analysis: adversary, capability, infrastructure, victim"],["Diamond: infrastructure","Domains, IPs and servers the attacker uses"],["Diamond: capability","Malware and techniques the attacker uses"],["Pivoting (Diamond Model)","Using one corner to find the others"]],
 comply:[["Due diligence","Investigating and understanding risks"],["Due care","Acting reasonably on what you know"],["Attestation and acknowledgement","People formally confirm they follow policy"],["Consequences of non-compliance","Fines, sanctions, reputation, loss of license, contract impacts"],["Data subject","The person the data describes"],["Right to be forgotten","Data subject can request erasure (GDPR)"],["Data inventory","Record of what personal data is held and where"],["GDPR","EU regulation protecting personal data"],["Audit committee","Board group overseeing audits"],["Independent third-party audit","External auditor assesses controls"],["Known environment test","White box; full information given"],["Partially known environment","Gray box; some information given"],["Unknown environment test","Black box; no information given"],["Passive reconnaissance","Gathering info without touching the target"],["Active reconnaissance","Scanning and probing the target"],["Red team","Offensive testers"],["Blue team","Defenders"],["Purple team","Red and blue working together (integrated)"],["Phishing campaign","Simulated phishing to train and measure users"],["Risky behavior","Deliberately bypassing controls"],["Unexpected behavior","Unusual for that user"],["Unintentional behavior","An honest mistake"],["Operational security","Not revealing sensitive details, e.g. on social media"]]
};
const DECKS=[["gov","Governance"],["risk","Risk management"],["vendor","Third parties"],["comply","Compliance, audits, awareness"],["frame","Threat frameworks"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"\"All company data must be protected according to its classification.\" Which document type is this?",o:["Policy","Standard","Procedure","Guideline"],a:0,e:"A high-level statement of intent is a policy."},
 {q:"\"Passwords must be at least 14 characters.\" Which document type is this?",o:["Policy","Standard","Guideline","MOU"],a:1,e:"A specific, mandatory requirement is a standard."},
 {q:"A document lists, step by step, how to disable a departing employee's accounts. What is it?",o:["Policy","Guideline","Procedure","SLA"],a:2,e:"Step-by-step instructions are a procedure (offboarding)."},
 {q:"\"Consider using a password manager.\" Which document type is this?",o:["Standard","Guideline","Policy","Procedure"],a:1,e:"A recommendation is a guideline."},
 {q:"Which document defines what employees may and may not do with company computers and internet access?",o:["AUP","SLA","BIA","NDA"],a:0,e:"The acceptable use policy."},
 {q:"A step-by-step guide for responding to a ransomware infection is called a:",o:["Playbook","Guideline","MSA","Risk register"],a:0,e:"Playbooks are procedures for specific incident types."},
 {q:"Who is accountable for classifying a data set and deciding who may access it?",o:["Data owner","Data custodian","Data processor","Data subject"],a:0,e:"The owner is accountable."},
 {q:"An IT administrator runs backups and manages permissions on the HR database. Their role is:",o:["Owner","Custodian","Controller","Subject"],a:1,e:"Custodians handle day-to-day care."},
 {q:"A company uses an outside payroll firm to process employee data on its behalf. The payroll firm is the:",o:["Controller","Processor","Owner","Data subject"],a:1,e:"It processes data on the controller's instructions."},
 {q:"In GDPR terms, the company that decides why employee data is collected is the:",o:["Processor","Controller","Custodian","Auditor"],a:1,e:"The controller decides purpose and means."},
 {q:"A server worth $50,000 would lose 40% of its value in a flood. What is the SLE?",o:["$2,000","$20,000","$50,000","$200,000"],a:1,e:"SLE = $50,000 × 0.40 = $20,000."},
 {q:"The SLE is $20,000 and a flood is expected once every 10 years. What is the ALE?",o:["$200,000","$20,000","$2,000","$200"],a:2,e:"ARO = 0.1, so ALE = $20,000 × 0.1 = $2,000."},
 {q:"Which formula is correct?",o:["ALE = SLE × ARO","SLE = ALE × ARO","ARO = SLE × EF","ALE = AV + EF"],a:0,e:"ALE = SLE × ARO, and SLE = AV × EF."},
 {q:"A control costs $5,000 a year and reduces ALE from $12,000 to $4,000. Is it worth it?",o:["Yes, it saves $8,000 a year for $5,000","No, it costs more than it saves","Only if ARO is 1","Can't tell"],a:0,e:"$8,000 reduction minus $5,000 cost leaves $3,000 net benefit."},
 {q:"A risk assessment rates threats as high, medium or low on a heat map. What type of analysis is this?",o:["Quantitative","Qualitative","Continuous","Financial"],a:1,e:"Ratings without dollar values are qualitative."},
 {q:"Which document lists each risk, its owner, its rating and the planned response?",o:["Risk register","BIA","SLA","AUP"],a:0,e:"The risk register tracks risks."},
 {q:"The number of unpatched critical servers is tracked monthly because a rise warns of growing risk. What is this metric?",o:["KRI","SLA","MTBF","ARO"],a:0,e:"Key risk indicators signal rising risk."},
 {q:"A company buys cyber insurance to cover ransomware losses. Which risk response is this?",o:["Avoid","Transfer","Accept","Mitigate"],a:1,e:"Insurance transfers the financial impact."},
 {q:"A company stops offering a risky legacy product so the risk no longer exists. Which response is this?",o:["Avoid","Mitigate","Transfer","Accept"],a:0,e:"Ending the activity avoids the risk."},
 {q:"A company deploys MFA to reduce the chance of account takeover. Which response is this?",o:["Avoid","Mitigate","Transfer","Accept"],a:1,e:"Adding controls mitigates."},
 {q:"The cost of fixing a low-impact risk is higher than the potential loss, so management documents it and moves on. Which response is this?",o:["Accept","Avoid","Transfer","Mitigate"],a:0,e:"Accepting, usually with a documented exception."},
 {q:"A startup chasing fast growth is willing to take on significant risk. Its risk appetite is:",o:["Conservative","Neutral","Expansionary","Zero"],a:2,e:"Expansionary appetites accept more risk for reward."},
 {q:"Which BIA metric describes the average time to fix a failed component?",o:["MTBF","MTTR","RPO","ARO"],a:1,e:"Mean time to repair."},
 {q:"Which BIA metric should be as HIGH as possible?",o:["MTTR","MTBF","ALE","RTO"],a:1,e:"A longer mean time between failures means more reliable equipment."},
 {q:"Which identifies critical business processes and the impact of losing them?",o:["BIA","Penetration test","Vulnerability scan","SOW"],a:0,e:"A business impact analysis."},
 {q:"A contract clause lets your company inspect the vendor's security controls. What is it?",o:["Right-to-audit clause","NDA","SLA","Non-compete"],a:0,e:"A right-to-audit clause."},
 {q:"Which independent report would you request to evaluate a cloud provider's controls?",o:["SOC 2 Type II","A CSR","An MOU","A CRL"],a:0,e:"SOC 2 reports come from independent auditors."},
 {q:"A contract guarantees 99.95% uptime and a 1-hour response to critical tickets. What is it?",o:["SLA","MOU","NDA","BPA"],a:0,e:"Service-level agreements set measurable commitments."},
 {q:"Two agencies sign a non-binding document stating they intend to share threat information. What is it?",o:["MOU","MSA","SLA","SOW"],a:0,e:"A memorandum of understanding expresses intent."},
 {q:"A company signs umbrella contract terms with a consultancy, then a separate document for each project's deliverables. What are these?",o:["MSA and SOW","MOU and NDA","SLA and BPA","NDA and SLA"],a:0,e:"The MSA sets the overall terms; each SOW defines a project."},
 {q:"Before sharing product designs with a manufacturer, what should be signed?",o:["NDA","SLA","MOU","BPA"],a:0,e:"A non-disclosure agreement protects confidential information."},
 {q:"Two companies form a joint venture and define how they share profits, losses and responsibilities. Which agreement?",o:["BPA","SLA","NDA","MOU"],a:0,e:"A business partners agreement."},
 {q:"During vendor selection, a manager reveals their spouse owns one of the bidding companies. What is this?",o:["Conflict of interest","Due care","Supply chain analysis","Attestation"],a:0,e:"It could bias the decision. Disclose and recuse."},
 {q:"Which document tells a penetration tester which systems they may test, when, and which techniques are off-limits?",o:["Rules of engagement","SLA","AUP","BIA"],a:0,e:"Rules of engagement define the scope and limits."},
 {q:"A company researches a vendor's breach history and finances before signing. What is this?",o:["Due diligence","Due care","Attestation","Non-repudiation"],a:0,e:"Investigating before acting is due diligence."},
 {q:"After learning about a risk, a company applies reasonable controls to address it. What is this?",o:["Due care","Due diligence","Risk avoidance","Attestation"],a:0,e:"Due care is acting responsibly on what you know."},
 {q:"Every employee signs each year that they've read and will follow the security policy. What is this?",o:["Attestation and acknowledgement","Legal hold","Right to audit","Exposure factor"],a:0,e:"A signed acknowledgement of policy."},
 {q:"Which is a consequence of non-compliance?",o:["Fines and loss of license","Higher MTBF","Better SLAs","Lower ALE"],a:0,e:"Fines, sanctions, reputational damage, loss of license and contract impacts."},
 {q:"A customer in Germany asks a company to delete all personal data it holds about them. Which right is this?",o:["Right to be forgotten","Right to audit","Data sovereignty","Due care"],a:0,e:"GDPR gives data subjects the right to erasure."},
 {q:"In privacy law, the person the data describes is the:",o:["Data subject","Data owner","Controller","Processor"],a:0,e:"The data subject."},
 {q:"To respond to privacy requests, a company first needs to know what personal data it holds and where. What should it build?",o:["Data inventory","Risk appetite","Heat map","SOW"],a:0,e:"A data inventory maps personal data."},
 {q:"Pen testers receive network diagrams, source code and admin credentials before starting. What type of test is this?",o:["Unknown environment","Partially known environment","Known environment","Passive"],a:2,e:"Full information is a known environment (white box) test."},
 {q:"Testers are given only the company's name, like a real outside attacker. What type of test is this?",o:["Known environment","Unknown environment","Partially known","Integrated"],a:1,e:"No information is an unknown environment (black box) test."},
 {q:"A tester reads the company's job postings and DNS records without sending any traffic to its systems. What is this?",o:["Active reconnaissance","Passive reconnaissance","Exploitation","Pivoting"],a:1,e:"Passive recon doesn't touch the target."},
 {q:"A tester runs Nmap against the company's public IP range. What is this?",o:["Passive reconnaissance","Active reconnaissance","OSINT only","Attestation"],a:1,e:"Scanning the target directly is active."},
 {q:"Attackers and defenders work together during an exercise, sharing findings in real time. What is this?",o:["Red team","Blue team","Purple team (integrated)","White team"],a:2,e:"Integrated testing combines offense and defense."},
 {q:"A tester tries to get into the server room by following an employee through a door. What type of test is this?",o:["Physical penetration test","Vulnerability scan","Tabletop","Code review"],a:0,e:"Physical testing checks facility controls."},
 {q:"A regulator examines a bank's security controls. What type of assessment is this?",o:["External regulatory examination","Self-assessment","Internal audit","Bug bounty"],a:0,e:"Regulators perform external examinations."},
 {q:"A company sends fake phishing emails to staff and tracks who clicks and who reports. What is this?",o:["Phishing campaign","Spear phishing attack","Watering hole","Pretexting"],a:0,e:"Simulated phishing measures and trains users."},
 {q:"Which metric BEST shows an awareness program is working over time?",o:["Rising report rate and falling click rate","Number of policies written","Firewall rule count","MTBF"],a:0,e:"Recurring measurement shows behavior change."},
 {q:"An employee turns off their antivirus because it slows their computer. Which type of anomalous behavior is this?",o:["Risky","Unexpected","Unintentional","Normal"],a:0,e:"Deliberately bypassing a control is risky behavior."},
 {q:"An employee accidentally sends a spreadsheet of salaries to the wrong distribution list. Which type of behavior is this?",o:["Risky","Unexpected","Unintentional","Malicious"],a:2,e:"An honest mistake is unintentional."},
 {q:"Training warns staff not to post photos showing their badge or the office floor plan online. Which topic is this?",o:["Operational security","Password management","Removable media","Hybrid work"],a:0,e:"OPSEC limits what attackers can learn."},
 {q:"Why does awareness training include charging cables found or received for free?",o:["Malicious cables can contain hidden implants","Cables waste power","Cables break warranties","Cables slow networks"],a:0,e:"Some cables have hidden chips that inject keystrokes or exfiltrate data."},
 {q:"Which framework describes an intrusion as seven phases, from reconnaissance to actions on objectives?",o:["Cyber Kill Chain","Diamond Model","MITRE ATT&CK","NIST CSF"],a:0,e:"The Lockheed Martin Cyber Kill Chain has seven ordered phases."},
 {q:"An analyst records an intrusion's adversary, capability, infrastructure and victim. Which model is this?",o:["Diamond Model of Intrusion Analysis","Cyber Kill Chain","MITRE ATT&CK","OWASP Top 10"],a:0,e:"The Diamond Model's four corners are adversary, capability, infrastructure and victim."},
 {q:"A SOC wants to check which attacker techniques its detection rules cover, using technique IDs such as T1566. Which framework fits?",o:["MITRE ATT&CK","Diamond Model","Cyber Kill Chain","ISO 27001"],a:0,e:"ATT&CK catalogs tactics and techniques with IDs, so teams can map detection coverage."},
 {q:"In the Cyber Kill Chain, which phase comes right after delivery?",o:["Exploitation","Installation","Weaponization","Command and control"],a:0,e:"Delivery puts the payload in front of the victim; exploitation is when it runs."},
 {q:"Malware on a laptop starts beaconing to an attacker's server every 60 seconds. Which Kill Chain phase is this?",o:["Command and control","Reconnaissance","Weaponization","Delivery"],a:0,e:"The implant calling home for instructions is C2."},
 {q:"In MITRE ATT&CK, what is a tactic?",o:["The attacker's goal at a stage, such as Persistence","A specific malware hash","A CVSS score","A firewall rule"],a:0,e:"Tactics are the why. Techniques are the how."},
 {q:"An attacker clears event logs to hide activity. Which ATT&CK tactic does this support?",o:["Defense Evasion","Initial Access","Exfiltration","Reconnaissance"],a:0,e:"Avoiding detection is Defense Evasion."},
 {q:"Using the Diamond Model, an analyst finds other victims by searching for the same C2 domain. Which corner did they pivot from?",o:["Infrastructure","Capability","Adversary","Victim"],a:0,e:"Domains and IP addresses are infrastructure."}
];

registerModule({
  id:"prg",slug:"program",title:"Security Program Management and Oversight",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["docs","roles","ale","heat","agree","privacy","pentest","box","killchain","attack","diamond","anom","program"],
  viz(){
sortViz($("#viz-docs"),{title:"Policy, standard, procedure or guideline?",bins:{pol:"Policy",std:"Standard",proc:"Procedure",gl:"Guideline"},
  items:[["\"We protect customer data according to its classification.\"","pol","A broad statement of intent."],["\"All laptops use AES-256 full-disk encryption.\"","std","A specific, mandatory requirement."],["\"1. Open the HR ticket. 2. Disable the AD account. 3. Collect the badge.\"","proc","Steps in order: an offboarding procedure."],["\"Consider a passphrase of four or more words.\"","gl","A recommendation."],["\"Employees may not use company systems for personal business.\"","pol","Part of the acceptable use policy."],["\"Server rooms require badge plus PIN entry.\"","std","A specific physical security standard."],["Ransomware playbook: isolate, notify, preserve, restore","proc","A playbook is a procedure."],["\"Lock your screen when stepping away for coffee.\"","gl","Helpful advice. It becomes a standard if made mandatory."]],done:"Sorted the governance documents"});

revealViz($("#viz-roles"),{title:"Who does what with the customer database?",cols:4,done:"Met every data role",items:[
  ["Data owner","VP of Sales","Accountable for the customer data. Decides its classification and approves who gets access."],["Data controller","Your company","Decides why customer data is collected and how it's used. Carries the main legal duties under privacy law."],["Data processor","Cloud CRM vendor","Stores and processes the data only on your company's instructions."],["Data custodian","Database team","Runs backups, applies permissions, patches the server. Day-to-day care."],
  ["Data subject","Each customer","The person the data is about, with rights such as access and erasure."],["Audit committee","Board","Oversees whether controls around the data are audited and working."],["Centralized governance","One security office","Sets one data policy for every region. Consistent, but slower to adapt."],["Decentralized governance","Each business unit","Each unit sets its own rules. Flexible, but gaps and inconsistency appear."]]});

/* ---- ALE calculator ---- */
(function(){
  const el=$("#viz-ale");const seen=new Set();
  const V={av:200000,ef:50,aro:0.5,red:80,cost:30000};
  const R=[["av","Asset value",10000,1000000,10000,v=>"$"+fmt(v)],["ef","Exposure factor",5,100,5,v=>v+"%"],["aro","Times per year (ARO)",0.05,4,0.05,v=>v],["red","Control cuts ARO by",0,100,5,v=>v+"%"],["cost","Control cost per year",0,200000,5000,v=>"$"+fmt(v)]];
  el.innerHTML=`<div class="viz-title">ALE calculator: is the control worth it?</div><div class="s-small">SCENARIO: RANSOMWARE ON THE ORDER SYSTEM · CONTROL: EDR + IMMUTABLE BACKUPS</div>${R.map(r=>`<div class="rng-row"><span>${r[1]}</span><input type="range" data-k="${r[0]}" min="${r[2]}" max="${r[3]}" step="${r[4]}" value="${V[r[0]]}" aria-label="${r[1]}"><b data-o="${r[0]}"></b></div>`).join("")}<div class="kv" id="al-kv"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){R.forEach(r=>$(`[data-o="${r[0]}"]`,el).textContent=r[5](V[r[0]]));
    const sle=V.av*V.ef/100,ale=sle*V.aro,aro2=V.aro*(1-V.red/100),ale2=sle*aro2,net=ale-ale2-V.cost;
    $("#al-kv",el).innerHTML=`<span>SLE = AV × EF</span><b class="mono">$${fmt(Math.round(sle))}</b><span>ALE = SLE × ARO</span><b class="mono">$${fmt(Math.round(ale))} / year</b><span>ALE with control</span><b class="mono">$${fmt(Math.round(ale2))} / year</b><span>Net benefit</span><b class="mono ${net>=0?"status-good":"status-bad"}">${net>=0?"+":"−"}$${fmt(Math.abs(Math.round(net)))} / year</b>`;
    $(".caption",el).innerHTML=net>=0?`<span class="status-good">Worth it.</span> The control saves $${fmt(Math.round(ale-ale2))} a year in expected losses and costs $${fmt(V.cost)}.`:`<span class="status-bad">Not worth it on cost alone.</span> The control costs more than the losses it prevents. Consider a cheaper control, transferring the risk, or accepting it.`;
    seen.add(net>=0?"y":"n");if(seen.size===2)award("viz:ale",30,"Ran a cost-benefit analysis")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;V[k]=+e.target.value;draw()});draw();
})();

/* ---- risk heat map + response ---- */
(function(){
  const el=$("#viz-heat");
  const RK=[["Data center in a flood zone",2,5,"transfer","Rare but catastrophic. Insurance shifts the financial hit; also consider moving."],["Phishing leads to account takeover",5,4,"mitigate","Frequent and serious. Add MFA, filtering and training."],["Selling into a country with sanctions risk",3,5,"avoid","Stop the activity and the risk disappears."],["Office printer jams cause short delays",4,1,"accept","Low impact. Fixing it costs more than it's worth."],["Unpatched VPN appliance",4,5,"mitigate","Patch it now. High likelihood and impact."],["Laptop theft with encrypted disks",3,2,"accept","Encryption already limits the impact. Accept the remaining risk and document it."]];
  const RESP={mitigate:"Mitigate",transfer:"Transfer",avoid:"Avoid",accept:"Accept"};const done={};let sel=null;
  const cls=(l,i)=>{const s=l*i;return s>=15?3:s>=8?2:s>=4?1:0};
  el.innerHTML=`<div class="viz-title">Risk heat map: place, then respond</div><div class="chips" id="hm-r"></div><div class="heat" id="hm-g"></div><div class="s-small" style="text-align:center">IMPACT →</div><div class="seg-row" id="hm-a"></div><div class="caption" aria-live="polite">Pick a risk to see where it falls, then choose a response.</div><div class="rv-prog s-small"></div>`;
  function draw(msg){$("#hm-r",el).innerHTML=RK.map((r,i)=>`<button class="chip" data-r="${i}" aria-pressed="${sel===i}">${done[i]?"✓ ":""}${r[0]}</button>`).join("");
    let g="";for(let l=5;l>=1;l--){g+=`<div class="ax">${l}</div>`;for(let i=1;i<=5;i++){const here=RK.map((r,k)=>r[1]===l&&r[2]===i?k:-1).filter(k=>k>=0);const shown=here.filter(k=>done[k]||k===sel);g+=`<div class="hcell hc${cls(l,i)} ${sel!==null&&here.includes(sel)?"sel":""}" role="img" aria-label="Likelihood ${l}, impact ${i}${shown.length?": "+shown.map(k=>RK[k][0]).join(", "):""}">${here.map(k=>done[k]||k===sel?"●":"").join("")}</div>`}}
    g+=`<div></div>`+[1,2,3,4,5].map(i=>`<div class="ax">${i}</div>`).join("");$("#hm-g",el).innerHTML=g;
    $("#hm-a",el).innerHTML=sel===null?"":Object.entries(RESP).map(([k,v])=>`<button class="btn" data-x="${k}">${v}</button>`).join("");
    if(msg)$(".caption",el).innerHTML=msg;$(".rv-prog",el).textContent=`↑ likelihood · ${Object.keys(done).length} of ${RK.length} risks handled`;
    if(Object.keys(done).length===RK.length){award("viz:heat",30,"Chose a response for every risk")}}
  el.addEventListener("click",e=>{const r=e.target.closest("[data-r]"),x=e.target.closest("[data-x]");
    if(r){sel=+r.dataset.r;const k=RK[sel];draw(`<b>${k[0]}</b>: likelihood ${k[1]}, impact ${k[2]}. Which response?`)}
    if(x&&sel!==null){const k=RK[sel];if(x.dataset.x===k[3]){done[sel]=1;const m=`<span class="status-good">${RESP[k[3]]}.</span> ${k[4]}`;sel=null;draw(m)}else draw(`<span class="status-bad">Not the best fit.</span> Think about cost, likelihood and whether the activity is worth keeping.`)}});
  draw();
})();

sortViz($("#viz-agree"),{title:"Which agreement is it?",bins:{sla:"SLA",mou:"MOU / MOA",msa:"MSA / SOW",nda:"NDA / BPA"},
  items:[["99.9% uptime or service credits","sla","Measurable service levels."],["Non-binding intent to share threat data between two agencies","mou","An MOU states intent."],["Umbrella terms for all future consulting work","msa","A master service agreement."],["Deliverables and dates for the Q3 firewall migration","msa","A statement of work under the MSA."],["Keep the product roadmap confidential","nda","A non-disclosure agreement."],["Two firms split profits and duties in a joint venture","nda","A business partners agreement."],["4-hour response to severity 1 tickets","sla","A service commitment."],["Formal agreement on each agency's specific duties in a joint operation","mou","An MOA is more formal and specific than an MOU."]],done:"Matched every agreement type"});

quizViz($("#viz-privacy"),{title:"Privacy in practice",done:"Answered every privacy scenario",qs:[
  ["A retailer decides to collect shoppers' birthdays for a loyalty program. In GDPR terms, the retailer is the…",["Controller","Processor","Data subject"],0,"It decides the purpose and means."],
  ["The email marketing service sending the birthday coupons for the retailer is the…",["Processor","Controller","Owner"],0,"It acts on the retailer's instructions."],
  ["A shopper asks the retailer to delete everything it holds on her.",["Right to be forgotten","Legal hold","Data sovereignty"],0,"She's exercising the right to erasure."],
  ["The retailer can't answer the request because it doesn't know which systems store shopper data. What was missing?",["A data inventory","An SLA","A heat map"],0,"You can't delete what you can't find."],
  ["The retailer is fined 2% of global revenue after a breach it failed to disclose.",["Consequence of non-compliance","Risk transfer","Due care"],0,"Fines and reputational damage follow non-compliance."]]});

revealViz($("#viz-pentest"),{title:"Testing teams and approaches",cols:4,done:"Explored every testing approach",items:[
  ["Red team","Offensive","Attacks like a real adversary to find gaps in prevention and detection.","atk"],["Blue team","Defensive","Defends, detects and responds to the red team's activity.","def"],["Purple team","Integrated","Red and blue share findings in real time, so defenses improve during the exercise.","vio"],["White team","Referees","Set rules of engagement and judge the exercise.","vio"],
  ["Physical test","On site","Tailgating, lock picking, badge cloning, dropping USB drives.","atk"],["Passive recon","No contact","OSINT: DNS records, job posts, social media, leaked credentials.","vio"],["Active recon","Direct contact","Port scans, banner grabs, probing web apps on the target.","atk"],["Rules of engagement","Before testing","Scope, dates, allowed techniques, emergency contacts and what's off-limits.","def"]]});

sortViz($("#viz-box"),{title:"Known, partially known or unknown environment?",bins:{known:"Known (white box)",part:"Partially known (gray box)",unk:"Unknown (black box)"},
  items:[["Testers get source code, diagrams and admin access","known","Full knowledge lets them be thorough."],["Testers get only the company name","unk","Simulates an outside attacker."],["Testers get a normal user account and an IP range","part","Some details, like an insider or a breached user."],["Code review of the payment app with developers present","known","Everything is shared."],["Bug bounty hunters probe the public website","unk","They start with what any outsider sees."],["Testers get the network diagram but no credentials","part","Partial information."]],done:"Classified every test type"});

stepViz($("#viz-killchain"),{title:"Follow an intrusion through the Kill Chain",done:"Walked an intrusion through the Kill Chain",intro:"An attack group goes after a logistics company. Press Next stage to follow it, and notice where each defense could have stopped it.",steps:[
  ["Reconnaissance","They scrape LinkedIn for the accounts payable team and find the VPN portal with a scan. <b>Break it:</b> limit what's public and watch for scanning."],
  ["Weaponization","They build an Excel invoice with a malicious macro. <b>Break it:</b> nothing to block yet, but threat intel may reveal the kit."],
  ["Delivery","The invoice is emailed to three AP clerks from a look-alike domain. <b>Break it:</b> email filtering, DMARC and user reporting."],
  ["Exploitation","One clerk enables macros and the code runs. <b>Break it:</b> block macros from the internet, plus EDR."],
  ["Installation","A backdoor is installed with a scheduled task for persistence. <b>Break it:</b> application allow lists and EDR."],
  ["Command and control","The backdoor beacons over HTTPS to a new domain every 60 seconds. <b>Break it:</b> DNS filtering, proxy logs and beacon detection."],
  ["Actions on objectives","They steal shipping data and launch ransomware. <b>Break it:</b> DLP, segmentation and immutable backups."]],
  end:"Seven phases: recon, weaponize, deliver, exploit, install, C2, act. Each phase you break is a whole attack stopped."});

quizViz($("#viz-attack"),{title:"Map the behavior to its ATT&CK tactic",done:"Mapped every behavior to an ATT&CK tactic",qs:[
  ["A spear phishing email with a malicious link gets the attacker their first foothold.",["Initial Access","Exfiltration","Impact","Discovery"],0,"Phishing (T1566) is an Initial Access technique."],
  ["The attacker dumps password hashes from memory on the compromised host.",["Credential Access","Persistence","Collection","Initial Access"],0,"Stealing credentials is Credential Access."],
  ["They use stolen admin credentials to RDP from the first host to a file server.",["Lateral Movement","Execution","Reconnaissance","Impact"],0,"Moving between systems inside the network is Lateral Movement."],
  ["They create a scheduled task so the malware restarts after every reboot.",["Persistence","Exfiltration","Discovery","Defense Evasion"],0,"Keeping access across reboots is Persistence."],
  ["They upload 40 GB of files to a cloud storage account they control.",["Exfiltration","Collection","Initial Access","Privilege Escalation"],0,"Moving data out of the network is Exfiltration."],
  ["They clear the Windows event logs to hide what they did.",["Defense Evasion","Impact","Lateral Movement","Credential Access"],0,"Covering tracks to avoid detection is Defense Evasion."],
  ["Finally, they encrypt every server and leave a ransom note.",["Impact","Collection","Persistence","Discovery"],0,"Disrupting or destroying systems and data is Impact."]]});

sortViz($("#viz-diamond"),{title:"Build the Diamond: sort each finding into a corner",bins:{adv:"Adversary",cap:"Capability",inf:"Infrastructure",vic:"Victim"},
  items:[["Threat group known as \"Copper Lynx\"","adv","Who is behind the attack: the adversary."],["Russian-language comments and work hours in UTC+3","adv","Clues about the operator point to the adversary corner."],["Custom backdoor with a macro dropper","cap","The tools and malware used: capability."],["Use of a stolen code-signing certificate","cap","A technique the adversary can use: capability."],["C2 domain invoice-cdn[.]net","inf","Domains used to control the malware: infrastructure."],["VPS at 203.0.113.44 hosting the payload","inf","Servers the attacker uses: infrastructure."],["Accounts payable team at a logistics firm","vic","The people targeted: victim."],["The company's shipping database","vic","The asset that was attacked is part of the victim corner."]],
  end:"Pivot on any corner. That C2 domain's registration details may lead you to other victims of the same adversary.",done:"Built the Diamond Model"});

quizViz($("#viz-anom"),{title:"Risky, unexpected or unintentional?",done:"Recognized every anomalous behavior",qs:[
  ["A developer disables the endpoint agent to make builds faster.",["Risky","Unexpected","Unintentional"],0,"Deliberately bypassing a control."],
  ["An accountant who works 9 to 5 in Ohio logs in at 2 a.m. from Brazil.",["Unexpected","Risky","Unintentional"],0,"Out of character for this user. Investigate."],
  ["A manager replies-all with a customer list meant for one colleague.",["Unintentional","Risky","Unexpected"],0,"An honest mistake. Train and add DLP."],
  ["A user copies 30 GB of design files to a personal USB drive the week after resigning.",["Risky (possible insider threat)","Unintentional","Normal"],0,"Possible data theft. Escalate."],
  ["An employee plugs in a charging cable they got free at a conference.",["Risky","Unexpected","Unintentional"],2,"Probably not malicious intent, but malicious cables exist. Training covers this."]]});

stepViz($("#viz-program"),{title:"Build a security awareness program",done:"Built an awareness program",steps:[
  ["Assess","Baseline phishing simulation: 31% of staff click, 6% report."],
  ["Develop","Set goals: under 10% click rate and over 50% report rate in 12 months. Build short, role-specific modules (finance gets BEC training)."],
  ["Execute","Monthly 5-minute lessons, quarterly phishing campaigns, a one-click report button in email."],
  ["Respond","Every reported message gets a quick reply. Clickers get a short just-in-time lesson, not punishment."],
  ["Measure","Recurring reports: click rate falls to 8% and report rate rises to 54%."],
  ["Improve","Add topics as threats change: QR-code phishing, AI voice cloning, remote work risks."]],
  end:"Initial and recurring reporting shows whether behavior is actually changing."});
  },
  sims:[
    {id:"alesim",title:"Make the risk decision",type:"choice",
      scenario:"A warehouse management server is worth $120,000. A fire would destroy 75% of it. Fires happen about once every 20 years. A fire suppression upgrade costs $3,000 per year and would cut the ARO in half.",
      steps:[
        ["What is the SLE?",["$9,000","$90,000","$120,000","$4,500"],1,"$120,000 × 0.75 = $90,000."],
        ["What is the ARO?",["20","1","0.05","0.5"],2,"Once every 20 years = 1/20 = 0.05."],
        ["What is the ALE?",["$4,500","$90,000","$1,800","$45,000"],0,"$90,000 × 0.05 = $4,500 a year."],
        ["With the upgrade, the ALE drops to $2,250. Is the $3,000 upgrade worth it on cost alone?",["Yes","No, it costs more than the $2,250 it saves"],1,"It saves $2,250 a year but costs $3,000."],
        ["What's a better response?",["Buy the upgrade anyway","Transfer the risk with insurance, or accept it with documentation","Avoid it by shutting down the warehouse","Ignore it without documenting"],1,"Insurance or documented acceptance fits a low ALE. Life-safety requirements could still mandate suppression."]],
      success:"Quantitative analysis turned a gut feeling into a defensible decision."},
    {id:"register",type:"match",title:"Complete the risk register",
      scenario:"Six risk register entries are missing their response. Match each one to the right strategy and detail.",
      items:[["Mitigate: deploy MFA and conditional access","mit"],["Transfer: buy a cyber insurance policy","tr"],["Avoid: stop storing card numbers; use a tokenizing processor","av"],["Accept: document an exception, review in 6 months","acc"],["Mitigate: segment and monitor the device","mit2"],["Transfer: contract the vendor to carry liability","tr2"]],
      slots:[["mit","RISK-01","Credential phishing against remote staff (likely, high impact)"],["tr","RISK-02","Ransomware recovery costs that could exceed $2M"],["av","RISK-03","Storing card data in the in-house database"],["acc","RISK-04","Cosmetic flaw in the internal wiki theme"],["mit2","RISK-05","Unpatchable lab instrument on the research network"],["tr2","RISK-06","Outsourced call center handling customer data"]],
      success:"Every risk has a response and an owner can act on it."},
    {id:"vendorsim",type:"check",title:"Vet a new SaaS vendor",
      scenario:"Your company wants to move HR data to a new SaaS vendor. Select every step that belongs in a sound third-party risk process.",
      opts:[["Request their SOC 2 Type II report and recent penetration test summary",1],["Send a security questionnaire and review the answers",1],["Include a right-to-audit clause and breach notification terms in the contract",1],["Sign an NDA before sharing internal details",1],["Agree on an SLA with uptime and support response targets",1],["Check for conflicts of interest among the people choosing the vendor",1],["Monitor the vendor's security posture after signing",1],["Skip assessment because the vendor is well known",0],["Let the vendor define its own scope with no rules of engagement for testing",0],["Share admin credentials for your HR system by email to speed onboarding",0]],
      success:"Assessed, contracted, protected and monitored. That's due diligence and due care."},
    {id:"killorder",type:"order",title:"Put the Cyber Kill Chain in order",
      scenario:"You're briefing executives on a recent intrusion using the Lockheed Martin Cyber Kill Chain. Put the seven phases in order.",
      steps:["Reconnaissance","Weaponization","Delivery","Exploitation","Installation","Command and control","Actions on objectives"],
      success:"That's the chain. Point out where your controls broke it, or where they should have."},
    {id:"pensim",title:"Scope the penetration test",type:"choice",
      scenario:"The board wants to know if an outside attacker could reach customer data. You're scoping the test.",
      steps:[
        ["Which environment best simulates an outside attacker?",["Known environment","Unknown environment","Partially known with admin creds"],1,"Black box: testers start with nothing, like a real outsider."],
        ["What must be signed before any testing starts?",["Rules of engagement with scope, dates and emergency contacts","Just a purchase order","Nothing; surprise tests are best","An MOU"],0,"Without written authorization and scope, testing is just hacking."],
        ["The testers start by reading job postings and DNS records. What phase is this?",["Passive reconnaissance","Active reconnaissance","Exploitation","Reporting"],0,"No contact with the target yet."],
        ["Next, they scan the public IP range. What is this?",["Active reconnaissance","Passive reconnaissance","Lateral movement","Attestation"],0,"Scanning touches the target directly."],
        ["The SOC wants to improve detection during the test. What setup helps most?",["Purple team: testers and defenders share findings","Hide the test from everyone forever","Blue team only","Cancel the test"],0,"Integrated testing turns findings into better detections right away."]],
      success:"A legal, well-scoped test that answers the board's question and improves detection."}
  ],
  badges:[
    ["reader","GV","Governor","Mark all 7 program management lessons studied",c=>c.allStudied()],
    ["lab","PM","Program Manager","Complete all 13 diagrams in this module",c=>c.vizAll()],
    ["ale","AL","Actuary","Find both outcomes in the ALE calculator",c=>c.earned("viz:ale")],
    ["heat","RA","Risk Accepted","Respond to every risk on the heat map",c=>c.earned("viz:heat")],
    ["register","RR","Register Keeper","Pass the risk register simulation",c=>c.passed("register")],
    ["vendor","DD","Due Diligence","Pass the vendor vetting simulation",c=>c.passed("vendorsim")],
    ["chain","KC","Chain Breaker","Pass the Cyber Kill Chain simulation",c=>c.passed("killorder")],
    ["diamond","DM","Diamond Cutter","Build the Diamond Model",c=>c.earned("viz:diamond")],
    ["scope","RoE","Rules of Engagement","Pass the penetration test scoping simulation",c=>c.passed("pensim")],
    ["perfect","CI","CISO Material","Score 100% on a program management quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
