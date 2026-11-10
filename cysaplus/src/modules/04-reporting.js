/* ================= Module 4: Reporting and Communication (CS0-004 Domain 4.0, 16%) ================= */
(function(){
const LESSONS=[
{id:"vmreport",num:"4.1",title:"Vulnerability management reporting",html:`
<p>A scan nobody reads fixes nothing. Vulnerability reports turn raw findings into decisions for the people who own the systems.</p>
<p>A good vulnerability management report includes:</p>
<ul><li><b>Vulnerabilities</b>: what was found, with CVE IDs and plain-language descriptions.</li>
<li><b>Affected hosts</b>: which systems, owners and business services.</li>
<li><b>Risk score</b>: CVSS plus context (exposure, exploitation, asset value).</li>
<li><b>Mitigation</b>: the fix, or the compensating control if there's no fix yet.</li>
<li><b>Recurrence</b>: findings that keep coming back point to a broken process, such as a golden image that was never patched.</li>
<li><b>Prioritization</b>: what to fix first, and by when.</li></ul>
<p>Write for the audience. System owners need hostnames and fix steps; executives need risk, trends and what you need from them.</p>
<div class="viz" id="viz-vmaud"></div>`},
{id:"compliance",num:"4.2",title:"Compliance reports, action plans and inhibitors",html:`
<h3>Compliance reports</h3>
<p>Show auditors and regulators that required controls exist and work: scan cadence met (for example PCI DSS quarterly scans), findings fixed within the required time, exceptions documented.</p>
<h3>Action plans</h3>
<ul><li><b>Configuration management</b>: fix the baseline or golden image so the flaw doesn't return.</li>
<li><b>Patching</b>: schedule and track remediation.</li>
<li><b>Compensating controls</b>: when patching isn't possible.</li>
<li><b>Awareness, education and training</b>: when the cause is people (weak passwords, phishing clicks).</li>
<li><b>Changing business requirements</b>: sometimes the process itself must change.</li></ul>
<h3>Inhibitors to remediation</h3>
<ul><li><b>Memorandum of understanding (MOU)</b> and <b>service-level agreement (SLA)</b>: a contract may limit who can change a system or when.</li>
<li><b>Organizational governance</b>: approvals and change boards slow emergency fixes.</li>
<li><b>Business process interruption</b>: the fix needs downtime the business won't allow.</li>
<li><b>Degrading functionality</b>: the patch breaks a feature people rely on.</li>
<li><b>Legacy systems</b>: no longer supported or patchable.</li>
<li><b>Proprietary systems</b>: only the vendor can change them, on their schedule.</li></ul>
<div class="viz" id="viz-inhib"></div>`},
{id:"metrics",num:"4.3",title:"Metrics, KPIs and stakeholders",html:`
<p><b>Metrics</b> measure something; <b>key performance indicators (KPIs)</b> are the few metrics tied to goals. Common vulnerability management KPIs:</p>
<ul><li><b>Trends</b>: open vulnerabilities over time, by severity. Is the backlog shrinking?</li>
<li><b>Top 10s</b>: most common findings, most vulnerable hosts, worst-performing teams.</li>
<li><b>Critical vulnerabilities and zero-days</b>: how many, how old, how exposed.</li>
<li><b>Service-level objectives (SLOs)</b>: percentage fixed within target, such as 95% of criticals within 15 days.</li></ul>
<h3>Stakeholder identification and communication</h3>
<p>Know who needs what: <b>executives</b> (risk, trends, decisions), <b>system and application owners</b> (their findings and deadlines), <b>IT operations</b> (patch schedules), <b>compliance and audit</b> (evidence), and <b>developers</b> (code-level fixes).</p>
<div class="viz" id="viz-kpi"></div>`},
{id:"irreport",num:"4.4",title:"Incident response reporting",html:`
<h3>Declaration and escalation</h3>
<p><b>Incident declaration</b> formally starts the incident process. <b>Escalation</b> follows the IR plan's thresholds: severity, data involved, regulatory implications, or media attention move the incident up to management, legal and executives.</p>
<h3>The incident report</h3>
<ul><li><b>Executive summary</b>: one page in plain language: what happened, impact, current status, and what you need from leadership.</li>
<li><b>Who, what, when, where and why</b>: the facts of the case.</li>
<li><b>Timeline</b>: key events in UTC, from first attacker activity to closure.</li>
<li><b>Impact</b>: business functions, data, customers, cost.</li>
<li><b>Scope</b>: systems, accounts and data affected.</li>
<li><b>Evidence</b>: what was collected and how it was preserved.</li>
<li><b>Recommendations</b>: what to change, with owners and dates.</li></ul>
<div class="tip"><b>Write for the reader.</b> An executive summary has no hashes, IP addresses or tool names. Those go in the technical sections.</div>
<div class="viz" id="viz-exec"></div>`},
{id:"comms",num:"4.5",title:"Communicating during an incident",html:`
<p>Bad communication can do more damage than the attack. The IR plan sets who speaks, to whom, and when.</p>
<ul><li><b>Legal</b>: involved early. Advises on privilege, notification duties, evidence and law enforcement.</li>
<li><b>Public relations</b>: one approved voice for <b>customer communication</b> and the <b>media</b>. Responders don't talk to reporters.</li>
<li><b>Regulatory reporting</b>: many laws set deadlines. Examples: GDPR (supervisory authority within 72 hours of becoming aware of a personal data breach), HIPAA (affected individuals without unreasonable delay and no later than 60 days), the SEC's rule for public companies (a Form 8-K within 4 business days of deciding an incident is material), and PCI DSS (notify the card brands through your acquirer).</li>
<li><b>Law enforcement</b>: for crimes such as ransomware and fraud (in the US, the FBI or Secret Service). Decide with legal, as it can affect evidence and timing.</li>
<li><b>Internal staff</b>: what to say and not say. Use <b>out-of-band</b> channels if email may be compromised.</li></ul>
<div class="viz" id="viz-who"></div>`},
{id:"irmetrics",num:"4.6",title:"Incident response metrics",html:`
<ul><li><b>Mean time to detect (MTTD)</b>: from the start of the attack to detection.</li>
<li><b>Mean time to respond (MTTR)</b>: from detection to containment (the response starting to take effect).</li>
<li><b>Mean time to remediate</b>: from detection to the fix being complete.</li>
<li><b>Alert volume</b>: how many alerts analysts handle. A rising volume with a flat true positive rate means rules need tuning.</li></ul>
<p>Lower times mean less dwell time and less damage. Track them across incidents and report the trend.</p>
<div class="viz" id="viz-mttx"></div>`},
{id:"changes",num:"4.7",title:"What changed from CS0-003",html:`
<p>If you studied for CS0-003, here's what's different in CS0-004 (launched June 23, 2026). The English CS0-003 exam retires December 22, 2026. The format didn't change: up to 85 questions, 165 minutes, 750 to pass on a 100 to 900 scale.</p>
<div class="scroll"><table><tr><th>Domain</th><th>CS0-003</th><th>CS0-004</th></tr>
<tr><td>Security Operations</td><td>33%</td><td>34%</td></tr><tr><td>Vulnerability Management</td><td>30%</td><td>26%</td></tr>
<tr><td>Incident Response and Management</td><td>20%</td><td>24%</td></tr><tr><td>Reporting and Communication</td><td>17%</td><td>16%</td></tr></table></div>
<div class="viz" id="viz-delta"></div>`}
];

const G={
 vm:[["VM report: affected hosts","Which systems, owners and services are impacted"],["VM report: recurrence","Findings that keep returning; points to a process failure"],["VM report: risk score","CVSS adjusted for exposure, exploitation and asset value"],["VM report: mitigation","The fix or compensating control"],["Audience for host-level detail","System owners and IT operations"],["Audience for trends and decisions","Executives"],["Compliance report","Evidence that required controls exist and work"],["Action plan: configuration management","Fix the baseline/golden image so flaws don't return"],["Action plan: awareness","Training when the cause is human behavior"],["Action plan: business requirements","Changing a process that creates risk"],["MOU","Memorandum of understanding; may limit changes"],["SLA","Service-level agreement; may limit downtime"],["Organizational governance inhibitor","Approvals slow emergency fixes"],["Business process interruption","Fix needs downtime the business won't allow"],["Degrading functionality","Patch breaks something users need"],["Legacy system inhibitor","No longer supported or patchable"],["Proprietary system inhibitor","Only the vendor can change it"]],
 kpi:[["Metric vs KPI","A KPI is a metric tied to a goal"],["Trend metric","Open vulnerabilities over time by severity"],["Top 10 report","Most common findings or most vulnerable hosts"],["SLO compliance","Percent of findings fixed within target time"],["Zero-day count","Vulnerabilities with no patch yet"],["Mean age of open criticals","How long critical findings stay open"],["Stakeholder: system owner","Needs their findings and deadlines"],["Stakeholder: compliance","Needs evidence for audits"],["Stakeholder: developers","Need code-level fix guidance"],["MTTD","Mean time to detect"],["MTTR","Mean time to respond (detection to containment)"],["Mean time to remediate","Detection to fix complete"],["Dwell time","How long an attacker was present undetected"],["Alert volume","Number of alerts analysts handle"],["Rising alerts, flat true positives","Rules need tuning"]],
 ir:[["Incident declaration","Formal decision that starts the IR process"],["Escalation triggers","Severity, sensitive data, regulators, media attention"],["Executive summary","One page, plain language: what, impact, status, asks"],["What stays out of an exec summary","Hashes, IPs, tool output"],["Incident report: timeline","Key events in UTC from first activity to closure"],["Incident report: scope","Systems, accounts and data affected"],["Incident report: impact","Effect on business, data, customers and cost"],["Incident report: recommendations","Changes with owners and dates"],["5 Ws","Who, what, when, where, why"],["Legal's role","Privilege, notification duties, evidence, law enforcement"],["PR's role","Single approved voice to customers and media"],["Who talks to reporters?","Only the designated spokesperson"],["GDPR notification","Supervisory authority within 72 hours of awareness"],["HIPAA individual notice","Without unreasonable delay, no later than 60 days"],["SEC cyber disclosure","Form 8-K within 4 business days of materiality determination"],["PCI DSS breach","Notify card brands through the acquirer"],["Law enforcement (US)","FBI or Secret Service for cybercrime"],["Out-of-band comms","Channels independent of compromised systems"],["Customer communication","Approved, accurate, timely notice to affected customers"]],
 chg:[["CS0-004 launch","June 23, 2026"],["CS0-003 English retirement","December 22, 2026"],["CS0-004 questions","Up to 85"],["CS0-004 time","165 minutes"],["CySA+ passing score","750 on a 100-900 scale"],["CS0-004 biggest new topic","AI in security operations"],["Domain that grew most in CS0-004","Incident Response and Management (20% to 24%)"],["Domain that shrank most","Vulnerability Management (30% to 26%)"],["CS0-004 Security Operations weight","34%"],["CS0-004 Reporting weight","16%"]]
};
const DECKS=[["vm","VM reporting and inhibitors"],["kpi","Metrics and KPIs"],["ir","Incident reporting and comms"],["chg","Exam changes"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"The same OpenSSL finding reappears on new servers every month. What does the report's recurrence data MOST likely point to?",o:["An unpatched golden image or baseline","A scanner bug","Too many analysts","An expired license"],a:0,e:"Fix the source image so new builds aren't vulnerable."},
 {q:"Which report section would a system owner need MOST?",o:["Their affected hosts, findings and fix steps with deadlines","Company-wide trend charts","The CISO's budget","Threat actor attribution"],a:0,e:"Actionable detail for their systems."},
 {q:"Which belongs in a vulnerability report for executives?",o:["Risk trends, SLO performance and decisions needed","Every plugin ID","Raw Nmap output","Packet captures"],a:0,e:"Executives need risk and asks, not raw data."},
 {q:"An auditor asks for proof that quarterly external scans happened. Which report?",o:["Compliance report","Incident report","Executive summary of an incident","Root cause analysis"],a:0,e:"Compliance reports evidence control operation."},
 {q:"Users keep reusing weak passwords that scans flag. Which action plan fits BEST?",o:["Awareness, education and training plus policy enforcement","More patching","A new firewall","Risk transfer"],a:0,e:"The cause is behavior."},
 {q:"A hospital's MRI controller can't be patched because only the manufacturer may modify it. Which inhibitor?",o:["Proprietary system","MOU","Degrading functionality","Business process interruption"],a:0,e:"Vendor-controlled system."},
 {q:"A contract with a hosting provider says it controls all changes to the servers. Which inhibitor applies?",o:["SLA / contractual agreement","Legacy system","Zero-day","Recurrence"],a:0,e:"Agreements can restrict remediation."},
 {q:"A patch fixes a vulnerability but breaks the label printing feature the warehouse depends on. Which inhibitor?",o:["Degrading functionality","Organizational governance","Proprietary system","MOU"],a:0,e:"The fix reduces functionality."},
 {q:"The fix requires 8 hours of downtime on the order system during peak season. Which inhibitor?",o:["Business process interruption","Legacy system","MOU","Recurrence"],a:0,e:"The business can't stop."},
 {q:"An emergency patch waits two weeks for the monthly change board. Which inhibitor?",o:["Organizational governance","Degrading functionality","Proprietary system","SLA"],a:0,e:"Process and approvals slow it down. Consider an emergency change process."},
 {q:"Windows Server 2008 can't receive patches. Which inhibitor?",o:["Legacy system","Proprietary system","MOU","Business process interruption"],a:0,e:"End of support."},
 {q:"Two departments sign a document agreeing on how a shared system is managed. What is it?",o:["MOU","SLA","NDA","SOW"],a:0,e:"Memorandum of understanding."},
 {q:"What's the difference between a metric and a KPI?",o:["A KPI is a metric tied to a specific goal","They're identical","KPIs are always financial","Metrics are only for executives"],a:0,e:"KPIs measure progress toward objectives."},
 {q:"Which KPI BEST shows whether remediation meets policy?",o:["Percentage of criticals fixed within the SLO","Number of scans run","Scanner license count","Number of plugins"],a:0,e:"SLO compliance measures performance against targets."},
 {q:"A chart shows open critical vulnerabilities by month for a year. What kind of metric is it?",o:["Trend","Top 10","Zero-day count","MTTD"],a:0,e:"Change over time."},
 {q:"Which report helps identify the teams or hosts contributing the most risk?",o:["Top 10 most vulnerable hosts/owners","MTTR trend","Compliance attestation","Change log"],a:0,e:"Top 10 lists focus effort."},
 {q:"Why report the number of zero-days affecting the environment?",o:["They need compensating controls since no patch exists","They're always low risk","They don't affect SLOs","They're already fixed"],a:0,e:"No patch means other controls and monitoring."},
 {q:"Which stakeholder needs code-level guidance on fixing an XSS flaw?",o:["Developers","Executives","Legal","PR"],a:0,e:"Developers fix code."},
 {q:"What formally starts the incident response process?",o:["Incident declaration","Lessons learned","A KPI review","A vulnerability scan"],a:0,e:"Declaration triggers the plan."},
 {q:"An incident now involves customer payment data. According to most IR plans, what happens?",o:["Escalate to management, legal and compliance","Keep it within the SOC","Close it","Wait a week"],a:0,e:"Sensitive data and regulatory duties trigger escalation."},
 {q:"Which belongs in an executive summary?",o:["Business impact, current status and decisions needed, in plain language","SHA-256 hashes of every file","Full packet captures","Volatility plugin output"],a:0,e:"Technical detail goes in later sections."},
 {q:"In which time zone should an incident timeline be written?",o:["UTC, consistently","Each source's local time","Whatever the analyst prefers","Eastern time"],a:0,e:"One time zone avoids confusion."},
 {q:"Which report section lists the systems, accounts and data affected?",o:["Scope","Recommendations","Executive summary","Evidence"],a:0,e:"Scope is what was touched."},
 {q:"Which report section says 'Deploy phishing-resistant MFA to all admins by March 31 (owner: IAM team)'?",o:["Recommendations","Timeline","Impact","Scope"],a:0,e:"Actionable changes with owners and dates."},
 {q:"The '5 Ws' in an incident report are:",o:["Who, what, when, where, why","Weakness, worm, web, wire, wipe","Week, work, wage, wait, why","Who, what, which, way, while"],a:0,e:"Core facts."},
 {q:"A reporter calls an analyst during an incident. What should the analyst do?",o:["Refer them to the designated PR spokesperson","Give a technical briefing","Deny any incident","Post on social media"],a:0,e:"One approved voice."},
 {q:"Who should be involved EARLY to advise on notification obligations and privilege?",o:["Legal","Marketing","Facilities","The vendor"],a:0,e:"Legal counsel."},
 {q:"Under GDPR, how quickly must a controller usually notify the supervisory authority of a personal data breach?",o:["Within 72 hours of becoming aware","Within 30 days","Within 1 year","Never"],a:0,e:"72 hours, where feasible."},
 {q:"A US public company determines a cyber incident is material. How soon must it file Form 8-K?",o:["Within 4 business days of the materiality determination","Within 72 hours of detection","Within 60 days","At the next annual report"],a:0,e:"SEC rule (Item 1.05)."},
 {q:"Under HIPAA, affected individuals must be notified of a breach of unsecured PHI:",o:["Without unreasonable delay and no later than 60 days after discovery","Within 24 hours","Within 1 year","Only if more than 500 people"],a:0,e:"60-day outer limit."},
 {q:"A merchant suffers a card data breach. Who do they typically notify for PCI DSS?",o:["The card brands through their acquiring bank","The ISAC only","Nobody","The scanner vendor"],a:0,e:"Through the acquirer."},
 {q:"Which agency is typically contacted in the US for a ransomware attack?",o:["FBI","FCC","FDA","EPA"],a:0,e:"The FBI (or Secret Service for financial crime)."},
 {q:"Why decide with legal before contacting law enforcement?",o:["It can affect evidence handling, timing and disclosure","Law enforcement is never involved","It's cheaper","It avoids the IR plan"],a:0,e:"Coordination matters."},
 {q:"Customers must be told about a breach. Who should approve the message?",o:["Legal and PR, per the IR plan","The first analyst who found it","The attacker","The help desk alone"],a:0,e:"Approved, accurate messaging."},
 {q:"The attacker may be reading corporate email. How should the IR team coordinate?",o:["Out-of-band channels","Reply-all","Public forums","The compromised mail server"],a:0,e:"Don't tip off the attacker."},
 {q:"An attack began Monday 08:00 and was detected Wednesday 08:00. What is the time to detect for this incident?",o:["48 hours","24 hours","2 hours","72 hours"],a:0,e:"Start of attack to detection."},
 {q:"Detected at 08:00, the host was contained at 09:30. What does this time measure?",o:["Time to respond (contain)","Time to detect","Dwell time","Alert volume"],a:0,e:"Detection to containment."},
 {q:"Which metric measures from detection until the fix is fully in place?",o:["Mean time to remediate","MTTD","Alert volume","False positive rate"],a:0,e:"Remediation complete."},
 {q:"Alert volume doubled but true positives stayed the same. What should the SOC do?",o:["Tune detection rules to cut noise","Hire analysts only","Ignore low alerts","Disable the SIEM"],a:0,e:"More noise, same signal: tune."},
 {q:"Which is the BEST indicator that detection is improving over a year?",o:["Falling MTTD trend","More alerts","More tools purchased","Longer reports"],a:0,e:"Faster detection = less dwell time."},
 {q:"When did CS0-004 launch?",o:["June 23, 2026","January 1, 2026","December 22, 2026","June 6, 2023"],a:0,e:"CS0-003 launched June 6, 2023."},
 {q:"Which topic is NEW in CS0-004?",o:["AI in security operations","The Diamond Model","CVSS","Chain of custody"],a:0,e:"AI use cases, risks and governance."},
 {q:"Which CS0-004 domain has the highest weight?",o:["Security Operations (34%)","Vulnerability Management (26%)","Incident Response (24%)","Reporting (16%)"],a:0,e:"Security Operations."},
 {q:"How many questions and minutes does CS0-004 have?",o:["Up to 85 questions, 165 minutes","90 questions, 90 minutes","100 questions, 120 minutes","50 questions, 45 minutes"],a:0,e:"Same as CS0-003."},
 {q:"Which domain's weight grew the most from CS0-003 to CS0-004?",o:["Incident Response and Management","Vulnerability Management","Reporting and Communication","Security Operations"],a:0,e:"20% to 24%."},
 {q:"Which metric would BEST show leadership that remediation is improving?",o:["A falling trend in mean age of open critical vulnerabilities","Number of scanners","Number of plugins","Report length"],a:0,e:"Trends tied to goals."},
 {q:"A report lists 'Top 10 vulnerabilities across the enterprise'. What's its main use?",o:["Focusing remediation effort where it removes the most risk","Proving compliance alone","Calculating MTTD","Replacing the scan"],a:0,e:"Prioritize common findings."},
 {q:"Which BEST describes an action plan in a vulnerability report?",o:["The specific steps, owners and dates to fix findings","A list of CVEs only","The scanner configuration","The incident timeline"],a:0,e:"What will be done, by whom, by when."},
 {q:"During an incident, who should approve public statements?",o:["Leadership with legal and PR","Any analyst","The help desk","The vendor"],a:0,e:"Approved communications only."},
 {q:"Which item belongs in the evidence section of an incident report?",o:["What was collected, hashes and chain of custody references","Marketing plans","Budget requests","Employee reviews"],a:0,e:"Preserved evidence details."},
 {q:"Why should an incident report include a timeline?",o:["It shows the sequence of attacker and responder actions for analysis and legal needs","It's decorative","It replaces the executive summary","CVSS requires it"],a:0,e:"Sequence matters."},
 {q:"An incident is escalated because the media started asking questions. What triggered the escalation?",o:["Public or media attention","CVSS score","Scanner output","A KPI"],a:0,e:"A common escalation trigger."},
 {q:"Which stakeholder typically decides if an incident is 'material' for SEC reporting?",o:["Company leadership with legal advice","A SOC analyst","The scanner vendor","The ISP"],a:0,e:"A business and legal decision."},
 {q:"What does a rising mean time to respond suggest?",o:["Containment is getting slower, perhaps due to staffing or unclear playbooks","Detection improved","Fewer attacks","Better patching"],a:0,e:"Look at process and resources."},
 {q:"Which report audience needs the LEAST technical detail?",o:["The board of directors","Incident responders","System administrators","Developers"],a:0,e:"Boards need risk and decisions."}
];

registerModule({
  id:"rpt",slug:"reporting",title:"Reporting and Communication",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["vmaud","inhib","kpi","exec","who","mttx","delta"],
  viz(){
sortViz($("#viz-vmaud"),{title:"Who needs this part of the report?",bins:{exec:"Executives",own:"System owners",comp:"Compliance / audit",dev:"Developers"},
  items:[["Open criticals are down 40% this quarter; we need budget to replace 12 legacy servers","exec","Trends and decisions."],["Your 6 hosts need KB5034441 by Friday; steps attached","own","Their hosts, their deadlines."],["All four quarterly ASV scans passed; exceptions log attached","comp","Evidence for auditors."],["Use parameterized queries in OrderController.cs line 212","dev","Code-level fix."],["Risk to the payment service is high until the VPN is patched","exec","Business risk in plain language."],["Recurring finding: the RHEL golden image ships with an old OpenSSL","own","Fix the image they maintain."],["Remediation SLO met for 96% of criticals","comp","Control effectiveness."],["Upgrade the vulnerable npm package listed in the SBOM","dev","Dependency fix."]],done:"Matched every report section to its audience"});

sortViz($("#viz-inhib"),{title:"Name the inhibitor to remediation",bins:{mou:"MOU / SLA",gov:"Governance",bpi:"Business interruption",deg:"Degrading functionality",leg:"Legacy",prop:"Proprietary"},
  items:[["The hosting contract allows changes only in a quarterly window","mou","Agreements limit changes."],["The CAB meets monthly; the critical patch waits","gov","Approval process."],["Patching the POS system needs a store closure on Black Friday","bpi","Downtime not allowed."],["After the update, the barcode scanners stop working","deg","Lost functionality."],["Windows XP runs the lab instrument and can't be upgraded","leg","Unsupported."],["Only the vendor's engineer may change the PACS server","prop","Vendor-controlled."],["A partner agreement says the shared VPN can't change without 30 days' notice","mou","Formal agreement."],["Fixing TLS breaks an old client app the call center relies on","deg","The fix removes something users need."]],done:"Named every inhibitor"});

/* ---- KPI dashboard ---- */
(function(){
  const el=$("#viz-kpi");
  const M=["Jun","Jul","Aug","Sep","Oct","Nov"],crit=[42,39,31,35,22,14],high=[180,172,160,151,133,118],slo=[71,74,82,79,90,95];
  let k="crit";const seen=new Set();
  const D={crit:["Open critical vulnerabilities",crit,"Down 67% since June. The September bump came from a new acquisition's servers joining the scan."],high:["Open high vulnerabilities",high,"Steadily falling, about 6% a month."],slo:["% of criticals fixed within the 15-day SLO",slo,"From 71% to 95%. This is the KPI the board asked for."]};
  el.innerHTML=`<div class="viz-title">Read the vulnerability dashboard</div><div class="chips">${Object.entries(D).map(([x,v])=>`<button class="chip" data-k="${x}">${v[0]}</button>`).join("")}</div><div class="bars"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const [t,v,c]=D[k],mx=Math.max(...v);el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    $(".bars",el).innerHTML=v.map((x,i)=>`<div class="br"><span>${M[i]}</span><i style="width:${x/mx*100}%"></i><b>${x}${k==="slo"?"%":""}</b></div>`).join("");
    seen.add(k);$(".caption",el).innerHTML=`<b>${t}.</b> ${c}`+(seen.size===3?'<br><br><span class="status-good">For executives, lead with the SLO trend and the one decision you need, not with raw counts.</span>':"");
    if(seen.size===3)award("viz:kpi",20,"Read the KPI dashboard")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b){k=b.dataset.k;draw()}});draw();
})();

quizViz($("#viz-exec"),{title:"Write the executive summary",done:"Wrote a clean executive summary",qs:[
  ["Which opening sentence is best?",["On November 9, attackers encrypted finance file shares after an employee opened a malicious invoice. Operations were restored within 26 hours; no customer data was taken.","At 03:12:07 UTC EDR detected PID 4980 scvhost.exe beaconing to 91.215.85.4:8443.","We got hacked, details to follow.","The SOC did a great job and nothing bad happened."],0,"Plain language: what happened, impact, status."],
  ["Which detail belongs in the technical appendix, not the executive summary?",["SHA-256 hashes and C2 IP addresses","Business impact","Whether customer data was involved","Decisions needed from leadership"],0,"Executives don't act on hashes."],
  ["Which recommendation is written best?",["Block macros in files from the internet for all users by Dec 15 (owner: Endpoint team)","Improve security","Buy more tools","Train people better somehow"],0,"Specific, owned and dated."],
  ["What should the summary end with?",["What you need from leadership: approval for the MFA rollout budget","A list of every alert","The attacker's probable home country","Nothing"],0,"Make the ask clear."]]});

sortViz($("#viz-who"),{title:"Who handles this communication?",bins:{legal:"Legal",pr:"PR / communications",reg:"Regulators",le:"Law enforcement",int:"Internal leadership"},
  items:[["Decide whether the incident triggers breach notification laws","legal","Legal counsel."],["Draft the customer notice and the press statement","pr","One approved voice."],["GDPR notice within 72 hours","reg","Supervisory authority."],["Report the ransomware extortion demand","le","FBI in the US."],["Brief the CEO and board on impact and decisions","int","Escalation to leadership."],["Answer a journalist's phone call","pr","Only the spokesperson."],["File the SEC Form 8-K after the materiality decision","reg","Securities regulator."],["Advise whether evidence should go to the FBI","legal","Coordinate first."]],done:"Routed every communication"});

/* ---- MTTx calculator ---- */
(function(){
  const el=$("#viz-mttx");
  const I=[["Ransomware (Nov)","2026-11-08 22:40","2026-11-09 03:12","2026-11-09 03:20","2026-11-10 05:00"],["Phishing account takeover (Oct)","2026-10-14 08:11","2026-10-14 09:05","2026-10-14 09:30","2026-10-14 16:00"],["Web shell (Sep)","2026-09-01 10:00","2026-09-19 14:00","2026-09-19 16:00","2026-09-22 12:00"]];
  const t=s=>new Date(s.replace(" ","T")+":00Z").getTime(),h=ms=>ms/36e5;
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Calculate detection and response times</div><div class="chips">${I.map((x,i)=>`<button class="chip" data-i="${i}">${x[0]}</button>`).join("")}<button class="chip" data-i="avg">Average of all three</button></div><div class="kpi"><div><b id="mt-d">–</b><span>time to detect</span></div><div><b id="mt-r">–</b><span>time to respond (contain)</span></div><div><b id="mt-m">–</b><span>time to remediate</span></div></div><pre class="term" style="min-height:0;white-space:pre-wrap"></pre><div class="caption" aria-live="polite">Pick an incident.</div>`;
  const f=x=>x>=48?(x/24).toFixed(1)+" days":x.toFixed(1)+" h";
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const k=b.dataset.i;seen.add(k);
    const calc=x=>[h(t(x[2])-t(x[1])),h(t(x[3])-t(x[2])),h(t(x[4])-t(x[2]))];
    let v;if(k==="avg"){const all=I.map(calc);v=[0,1,2].map(j=>all.reduce((a,r)=>a+r[j],0)/3);$("pre",el).textContent="Averages across the three incidents: these are the 'mean' times you report.";}
    else{const x=I[+k];v=calc(x);$("pre",el).textContent=`First attacker activity: ${x[1]} UTC\nDetected:              ${x[2]} UTC\nContained:             ${x[3]} UTC\nRemediated:            ${x[4]} UTC`}
    $("#mt-d",el).textContent=f(v[0]);$("#mt-r",el).textContent=f(v[1]);$("#mt-m",el).textContent=f(v[2]);
    $(".caption",el).innerHTML=k==="2"?"The web shell sat undetected for 18 days. That dwell time is what drags the mean time to detect up.":k==="avg"?'<span class="status-good">Mean times calculated.</span> One slow detection dominates the average, which is why some teams also report the median.':"Detection to containment is the response time; detection to full fix is remediation.";
    if(seen.size===4)award("viz:mttx",30,"Calculated MTTD and MTTR")});
})();

revealViz($("#viz-delta"),{title:"CS0-003 to CS0-004 at a glance",cols:2,done:"Reviewed every exam change",items:[
  ["AI in security operations","New","A whole objective on AI use cases, risks (hallucination, prompt injection, data exposure, poisoning) and governance. See lesson 1.13.","atk"],
  ["Incident response grew","20% → 24%","More questions on attack frameworks, the IR process and response techniques. Module 3 covers them.","vio"],
  ["Vulnerability management shrank","30% → 26%","Still a quarter of the exam: scanning, tool output, prioritization and controls.","def"],
  ["Cloud and identity indicators","More emphasis","Impossible travel, token theft, MFA fatigue, OAuth consent and control-plane changes. See lesson 1.6.","vio"],
  ["Control types","Reframed","CS0-004 frames control types alongside risk and vulnerability management. Know both the categories (managerial, operational, technical, physical) and functions (preventive, detective, corrective and so on). See lesson 2.7.","def"],
  ["Format","Unchanged","Up to 85 questions, 165 minutes, 750 of 900 to pass, multiple choice plus performance-based questions.","def"]]});
  },
  sims:[
    {id:"execpick",type:"check",title:"Build the executive summary",
      scenario:"You're writing the one-page executive summary for the ransomware incident. Select everything that belongs in it.",
      opts:[["What happened, in two plain-language sentences",1],["Business impact: finance shares offline for 26 hours, no customer data taken",1],["Current status: contained, eradicated and restored",1],["Decision needed: approve budget for phishing-resistant MFA",1],["The full Volatility pslist output",0],["Every IP address and hash from the case",0],["Top three recommendations with owners and dates",1],["The name of the employee who opened the attachment",0]],
      success:"Plain language, impact, status, recommendations and the ask. Names of individuals and raw technical data stay out."},
    {id:"stake",type:"match",title:"Send the right report to the right people",
      scenario:"Six people asked for an update. Match each to what they should receive.",
      items:[["Board-level risk trend and decisions","board"],["Host list with patches and deadlines","owner"],["Scan cadence and SLO evidence","audit"],["Code fix guidance","dev"],["Approved customer notice draft","pr"],["Notification obligations analysis","legal"]],
      slots:[["board","CEO","Wants to know if we're more or less at risk than last quarter"],["owner","Server team lead","Owns 40 of the vulnerable Linux hosts"],["audit","PCI assessor","Asks for proof of quarterly scanning"],["dev","App team","Owns the app with the SQL injection finding"],["pr","Communications director","Must answer customer questions"],["legal","General counsel","Needs to know if breach laws apply"]],
      success:"Same incident, six different messages."},
    {id:"inhibsim",type:"classify",title:"Explain why these findings are still open",
      scenario:"The quarterly report must explain four overdue critical findings. Name the inhibitor and the best action plan for each.",
      cols:[{k:"i",label:"Inhibitor",opts:[["leg","Legacy system"],["prop","Proprietary system"],["bpi","Business interruption"],["gov","Governance"]]},{k:"a",label:"Action plan",opts:[["comp","Compensating controls + exception"],["emerg","Emergency change process"],["sched","Schedule an approved window"]]}],
      rows:[
        {t:"Lab instrument PC on Windows 7",meta:"CVSS 9.8 · 140 days open",d:"Vendor software only runs on Windows 7. Replacement budgeted for next year.",ans:{i:"leg",a:"comp"},why:"Unsupported OS, can't patch: isolate it, monitor it, document an exception with an end date."},
        {t:"MRI workstation",meta:"CVSS 8.8 · 60 days open",d:"Only the manufacturer may install updates; their next service visit is in 45 days.",ans:{i:"prop",a:"comp"},why:"Vendor-controlled: compensate (segment, restrict) until the vendor patches."},
        {t:"E-commerce database cluster",meta:"CVSS 9.1 · 22 days open",d:"Patch needs a 4-hour outage; the business refused during the holiday sale.",ans:{i:"bpi",a:"sched"},why:"Schedule a window the business approves, with temporary controls until then."},
        {t:"VPN gateway",meta:"CVSS 10.0 · KEV · 18 days open",d:"Waiting for next month's change advisory board meeting.",ans:{i:"gov",a:"emerg"},why:"Actively exploited and exposed: use the emergency change process instead of waiting."}],
      success:"Every overdue finding has a reason, an owner and a plan. That's what auditors and executives need to see."},
    {id:"notify",type:"choice",title:"Handle the breach communications",
      scenario:"Analysis confirms attackers stole names and email addresses of 80,000 EU and US customers from a public company's web store.",
      steps:[
        ["Who should you bring in first?",["Legal counsel, per the IR plan","A journalist","All customers immediately by text","Nobody"],0,"Legal assesses obligations."],
        ["The data includes EU residents' personal data. What's the regulator deadline to keep in mind?",["72 hours from awareness under GDPR","30 days","1 year","No deadline"],0,"GDPR notification."],
        ["Leadership decides the incident is material. What does the SEC rule require?",["A Form 8-K within 4 business days of that determination","Nothing","A press release within 1 hour","A filing at year end"],0,"Item 1.05."],
        ["A reporter emails the SOC analyst. What does the analyst do?",["Forward to the PR lead and don't comment","Reply with technical details","Confirm the number of records","Ignore it and tell no one"],0,"One voice."],
        ["The attacker sent an extortion email. Who may be contacted, with legal's agreement?",["Law enforcement (FBI)","The attacker, to negotiate alone","A random security forum","No one"],0,"Report the crime."]],
      success:"Legal first, regulators on time, one spokesperson, and law enforcement coordinated."},
    {id:"mttsim",type:"choice",title:"Report the response metrics",
      scenario:"For the quarterly report: an attacker first logged in at 01:00 Monday. The SOC detected it at 13:00 Monday, contained it at 14:30 Monday, and finished remediation at 13:00 Wednesday.",
      steps:[
        ["What is the time to detect?",["12 hours","1.5 hours","48 hours","36 hours"],0,"01:00 to 13:00."],
        ["What is the time to respond (contain)?",["1.5 hours","12 hours","48 hours","13.5 hours"],0,"13:00 to 14:30."],
        ["What is the time to remediate?",["48 hours","12 hours","1.5 hours","60 hours"],0,"Monday 13:00 to Wednesday 13:00."],
        ["Alerts rose from 900 to 1,800 a day, but true positives stayed at 20. What do you recommend?",["Tune noisy detection rules","Ignore low-severity alerts entirely","Hire twice as many analysts and change nothing","Turn off the SIEM"],0,"Reduce noise to protect detection time."]],
      success:"Time to detect 12 h, respond 1.5 h, remediate 48 h, plus a tuning recommendation."}
  ],
  badges:[
    ["reader","RC","Briefing Room","Mark all 7 reporting lessons studied",c=>c.allStudied()],
    ["lab","DB","Dashboard Pro","Complete all 7 diagrams in this module",c=>c.vizAll()],
    ["exec","ES","Bottom Line Up Front","Pass the executive summary simulation",c=>c.passed("execpick")],
    ["notify","72","Seventy-Two Hours","Pass the breach communications simulation",c=>c.passed("notify")],
    ["mtt","MT","Clock Watcher","Calculate detection and response times for every incident",c=>c.earned("viz:mttx")],
    ["sims","CM","Communicator","Pass all 5 reporting simulations",c=>["execpick","stake","inhibsim","notify","mttsim"].every(c.passed)],
    ["perfect","RP","Report Perfect","Score 100% on a reporting quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
