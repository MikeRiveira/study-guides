/* ================= Module 9: Operational Procedures (Core 2, 220-1202) ================= */
(function(){
const LESSONS=[
{id:"docs",num:"9.1",title:"Documentation, ticketing and asset management",short:"Documentation",html:`
<h3>Ticketing systems</h3>
<ul><li>A good ticket records <b>user information</b>, <b>device information</b>, a <b>description</b>, a <b>category</b>, a <b>severity</b> and the <b>escalation level</b>.</li>
<li>Write clearly: a <b>problem description</b> anyone can follow, <b>progress notes</b> as you work, and the <b>problem resolution</b> when you close it.</li></ul>
<h3>Asset management</h3>
<ul><li><b>Inventory lists</b> and a <b>configuration management database (CMDB)</b> track every device and how it's set up.</li>
<li><b>Asset tags and IDs</b> link physical devices to records, including the <b>assigned user</b>, <b>warranty</b> and <b>licensing</b>.</li>
<li>The <b>procurement life cycle</b> covers buying, deploying, maintaining and disposing of equipment.</li></ul>
<h3>Document types</h3>
<div class="scroll"><table><thead><tr><th>Document</th><th>Purpose</th></tr></thead><tbody>
<tr><td>Acceptable use policy (AUP)</td><td>What users may and may not do with company systems</td></tr>
<tr><td>Network topology diagram</td><td>Map of how the network is connected</td></tr>
<tr><td>Regulatory compliance requirements</td><td>Rules the company must follow, like HIPAA or PCI DSS</td></tr>
<tr><td>Splash screen</td><td>A login banner warning that use is monitored</td></tr>
<tr><td>Incident report</td><td>Records what happened during a security or safety incident</td></tr>
<tr><td>Standard operating procedure (SOP)</td><td>Step-by-step instructions, like installing a custom software package</td></tr>
<tr><td>New user and offboarding checklists</td><td>Make sure accounts and equipment are set up, and later removed, every time</td></tr>
<tr><td>Service-level agreement (SLA)</td><td>Promised response and resolution times, with internal teams or external vendors</td></tr>
<tr><td>Knowledge base article</td><td>Documented fixes so problems are solved faster next time</td></tr>
</tbody></table></div>`},
{id:"change",num:"9.2",title:"Change management",short:"Change management",html:`
<p>Uncontrolled changes cause outages. Change management makes every change planned, approved, tested and reversible.</p>
<div class="viz" id="viz-change"></div>
<ul><li><b>Request form:</b> the purpose, scope, change type, date and time, affected systems and impact.</li>
<li><b>Risk analysis:</b> assigns a risk level.</li>
<li><b>Change advisory board (CAB):</b> approves or rejects the change.</li>
<li><b>Sandbox testing:</b> try the change in an isolated environment first.</li>
<li>Have a <b>rollback plan</b> and a <b>backup plan</b>, and name the <b>responsible staff member</b>.</li>
<li><b>Peer review</b> checks the work. <b>End-user acceptance</b> confirms it works for the people who use it.</li></ul>`},
{id:"backup",num:"9.3",title:"Backup and recovery",short:"Backups",html:`
<p>Pick a backup scheme, then pick the day the drive fails to see which backups you'd need to restore.</p>
<div class="viz" id="viz-backup"></div>
<ul><li><b>Full:</b> everything. Slowest to back up, fastest to restore.</li>
<li><b>Incremental:</b> changes since the <b>last backup of any kind</b>. Fastest backups, but restore needs the full plus <b>every</b> incremental.</li>
<li><b>Differential:</b> changes since the <b>last full</b>. Grows each day, but restore needs only the full plus the <b>latest</b> differential.</li>
<li><b>Synthetic full:</b> built by combining a full with later incrementals, without re-reading the source.</li>
<li><b>3-2-1 rule:</b> 3 copies of data, on 2 types of media, with 1 offsite.</li>
<li><b>Grandfather-father-son (GFS):</b> a rotation of monthly, weekly and daily backups.</li>
<li><b>Test your backups</b> regularly by actually restoring them. Untested backups may not work.</li></ul>`},
{id:"safety",num:"9.4",title:"Safety and environmental controls",short:"Safety",html:`
<ul><li><b>ESD:</b> wear an antistatic wrist strap, work on an ESD mat, and store parts in antistatic bags.</li>
<li><b>Equipment grounding</b> sends fault current safely to earth. Never remove the ground pin.</li>
<li><b>Disconnect power</b> before working inside equipment. Never open a power supply or CRT: they hold dangerous charges.</li>
<li><b>Lift with your legs</b>, keep your back straight, and get help with heavy items.</li>
<li><b>Electrical fires</b> need a Class C fire extinguisher (CO₂ or dry chemical). Never use water.</li>
<li>Wear <b>safety goggles</b> and an <b>air filtration mask</b> when dealing with dust, toner or chemicals.</li>
<li>Follow government regulations, like OSHA rules.</li></ul>
<h3>Environmental impacts</h3>
<ul><li><b>Safety data sheets (SDS/MSDS)</b> explain how to handle and dispose of materials like toner and batteries.</li>
<li>Control <b>temperature</b>, <b>humidity</b> (too low means static, too high means condensation) and <b>ventilation</b>.</li>
<li>Clean dust with compressed air or an ESD-safe vacuum.</li>
<li><b>Power problems:</b> surges and spikes (surge suppressor), brownouts (sags) and blackouts (UPS). A <b>UPS</b> provides battery power long enough to shut down safely.</li>
<li>Recycle batteries, toner and electronics through proper channels. Never throw them in the trash.</li></ul>`},
{id:"privacy",num:"9.5",title:"Prohibited content, privacy and licensing",short:"Privacy and licensing",html:`
<h3>Incident response</h3>
<ul><li><b>Identify</b> the prohibited content or activity, then <b>report</b> it through proper channels (management, and law enforcement if required).</li>
<li><b>Preserve the data and device.</b> Make a copy of the drive for analysis so the original stays intact.</li>
<li><b>Document</b> everything, and keep a <b>chain of custody</b>: a record of who handled the evidence and when.</li></ul>
<h3>Licensing</h3>
<ul><li><b>EULA:</b> the end-user license agreement you accept when installing software.</li>
<li><b>DRM:</b> digital rights management technology that limits copying.</li>
<li><b>Perpetual vs subscription</b> licenses. <b>Personal vs corporate</b> use. Make sure licenses are valid and not expired.</li>
<li><b>Open-source</b> licenses allow using and modifying the code, under the license's terms.</li></ul>
<h3>Regulated data</h3>
<ul><li><b>PII</b> (personally identifiable information), <b>credit card data</b> (PCI DSS), <b>healthcare data</b> (HIPAA, PHI), and <b>government-issued information</b>.</li>
<li>Follow <b>data retention</b> requirements: keep data as long as required, then dispose of it properly.</li></ul>`},
{id:"pro",num:"9.6",title:"Communication and professionalism",short:"Professionalism",html:`
<ul><li>Use proper language. Avoid jargon, acronyms and slang with users.</li>
<li>Keep a positive attitude and project confidence.</li>
<li><b>Actively listen.</b> Take notes, don't interrupt, and repeat back what you heard.</li>
<li>Be culturally sensitive. Use appropriate titles.</li>
<li>Be on time. If you'll be late, contact the customer.</li>
<li><b>Avoid distractions:</b> no personal calls, texts, social media or personal visits on the job.</li>
<li><b>Difficult customers:</b> don't argue or be defensive, don't dismiss their problem, don't post about it on social media. Clarify by asking open-ended questions.</li>
<li><b>Set and meet expectations:</b> give a timeline, offer repair or replacement options, provide documentation, and follow up to confirm satisfaction.</li>
<li><b>Confidential materials:</b> don't look at or touch the customer's documents, desk, printouts or screen.</li></ul>`},
{id:"script",num:"9.7",title:"Scripting basics",short:"Scripting",html:`
<div class="viz" id="viz-script"></div>
<ul><li><b>Use cases:</b> basic automation, restarting machines, remapping network drives, installing applications, automated backups, gathering information, and starting updates.</li>
<li><b>Risks:</b> accidentally introducing malware (from untrusted scripts), changing system settings unintentionally, and crashing a browser or system by mishandling resources (for example, an endless loop).</li>
<li>Scripts use <b>variables</b>, <b>loops</b>, <b>conditionals</b> (if/else), <b>comments</b> and basic <b>data types</b> like strings and integers.</li></ul>`},
{id:"remote",num:"9.8",title:"Remote access technologies",short:"Remote access",html:`
<div class="viz" id="viz-remote"></div>
<ul><li><b>Third-party tools:</b> screen-sharing, video conferencing, file transfer software and desktop management tools.</li>
<li><b>Security:</b> use MFA, strong encryption and least privilege. Never expose RDP directly to the internet. Always get the user's permission before taking control of their screen.</li></ul>`},
{id:"ai",num:"9.9",title:"Basic AI concepts",short:"AI basics",html:`
<ul><li><b>Application integration:</b> AI features are built into many apps, like email drafting, search and help desk chatbots.</li>
<li><b>Policy:</b> follow your organization's rules on appropriate use. Passing off AI-written work as your own can be plagiarism.</li>
<li><b>Limitations:</b> AI can show <b>bias</b> from its training data, produce <b>hallucinations</b> (confident but false answers) and make accuracy mistakes. Verify important output.</li>
<li><b>Private vs public AI:</b> public tools may store or learn from what you type. Never paste confidential or regulated data into a public AI tool. Private (company-hosted or contracted) AI keeps data under the organization's control.</li>
<li>Consider data security, where the AI's data comes from, and data privacy.</li></ul>`}
];

const CARDS=[
 ...[["AUP","Acceptable use policy: rules for using company systems"],["SLA","Service-level agreement: promised response and resolution times"],["SOP","Standard operating procedure: step-by-step instructions"],["CMDB","Configuration management database"],
     ["Splash screen","Login banner warning that use is monitored"],["Knowledge base","Documented fixes for future reference"],["Ticket essentials","User, device, description, category, severity, escalation"],["Offboarding checklist","Disable accounts, collect equipment, transfer data"],
     ["CAB","Change advisory board: approves changes"],["Rollback plan","How to undo a change if it fails"],["Sandbox testing","Testing a change in an isolated environment first"],["End-user acceptance","Users confirm the change works for them"]].map((c,i)=>({deck:"docs",id:"dc"+i,q:c[0],a:c[1]})),
 ...[["Full backup","Everything. Slowest backup, fastest restore."],["Incremental backup","Changes since the last backup of any kind"],["Differential backup","Changes since the last full backup"],["Restore with incrementals","Last full + every incremental since"],
     ["Restore with differentials","Last full + the latest differential"],["Synthetic full","Full built from a full plus incrementals"],["3-2-1 rule","3 copies, 2 media types, 1 offsite"],["GFS","Grandfather-father-son rotation: monthly, weekly, daily"]].map((c,i)=>({deck:"backup",id:"bk"+i,q:c[0],a:c[1]})),
 ...[["ESD prevention","Wrist strap, ESD mat, antistatic bags"],["Electrical fire extinguisher","Class C (CO₂ or dry chemical)"],["SDS / MSDS","How to handle and dispose of hazardous materials"],["UPS","Battery backup for brownouts and blackouts"],
     ["Surge suppressor","Protects against spikes and surges"],["Low humidity risk","Static electricity"],["Chain of custody","Record of who handled evidence and when"],["EULA","End-user license agreement"],["DRM","Digital rights management"],
     ["PCI DSS","Rules for protecting credit card data"],["PHI","Protected health information (HIPAA)"],["First response to prohibited content","Identify, report, preserve, document"]].map((c,i)=>({deck:"safety",id:"sf"+i,q:c[0],a:c[1]})),
 ...[[".bat","Windows batch file"],[".ps1","PowerShell script"],[".vbs","VBScript (Windows)"],[".sh","Linux/macOS shell script"],[".js","JavaScript"],[".py","Python script"],
     ["RDP","Remote Desktop Protocol, TCP 3389"],["SSH","Secure command-line access, TCP 22"],["VNC","Cross-platform screen sharing, TCP 5900"],["RMM","Remote monitoring and management for MSPs"],["SPICE","Remote display protocol for virtual machines"],["AI hallucination","Confident but false output"],["Public AI risk","Data you enter may be stored or used for training"]].map((c,i)=>({deck:"script",id:"sc"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"Which document tells employees what they're allowed to do on company computers?",o:["SLA","AUP","SOP","EULA"],a:1,e:"The acceptable use policy sets the rules for using company systems."},
 {q:"A vendor contract promises a four-hour response time for critical issues. What document is this?",o:["SLA","AUP","MSDS","CMDB"],a:0,e:"A service-level agreement defines response and resolution commitments."},
 {q:"Which document gives step-by-step instructions for installing a custom software package?",o:["SOP","AUP","Incident report","Topology diagram"],a:0,e:"Standard operating procedures make tasks consistent."},
 {q:"What should a technician add to a ticket while working on it?",o:["Progress notes","Their personal opinion of the user","Nothing until it's closed","The user's password"],a:0,e:"Progress notes keep everyone informed and help if the ticket is escalated."},
 {q:"Which system tracks devices, their configurations and their relationships?",o:["CMDB","SLA","AUP","DRM"],a:0,e:"A configuration management database tracks assets and configurations."},
 {q:"A login banner warns that activity is monitored. What is this called?",o:["Splash screen","Knowledge base","EULA","Topology map"],a:0,e:"Splash screens set expectations before login."},
 {q:"An employee leaves the company. Which document makes sure their accounts are disabled and equipment returned?",o:["Offboarding checklist","New user checklist","SLA","AUP"],a:0,e:"The offboarding checklist covers every step consistently."},
 {q:"Who approves or rejects proposed changes in a change management process?",o:["The change advisory board","The help desk","The end user","The vendor"],a:0,e:"The CAB reviews risk and approves changes."},
 {q:"Before applying a change, what plan describes how to undo it if it fails?",o:["Rollback plan","Disaster recovery plan only","AUP","SLA"],a:0,e:"A rollback plan returns systems to their previous state."},
 {q:"A change is tested on isolated copies of production servers first. What is this?",o:["Sandbox testing","Peer review","End-user acceptance","Risk analysis"],a:0,e:"A sandbox lets you test without affecting production."},
 {q:"After a change is made, users confirm the new system works for them. What is this step?",o:["End-user acceptance","Rollback","Risk analysis","Scope definition"],a:0,e:"End-user acceptance confirms the change meets their needs."},
 {q:"Which part of a change request rates how likely and how severe problems might be?",o:["Risk analysis","Purpose","Date and time","Peer review"],a:0,e:"Risk analysis assigns a risk level that the CAB considers."},
 {q:"Which backup type copies only files changed since the last backup of any type?",o:["Full","Incremental","Differential","Synthetic full"],a:1,e:"Incremental backups are the fastest and smallest each day."},
 {q:"A company does a full backup Sunday and differentials Monday to Friday. The server fails Thursday afternoon. What's needed to restore?",o:["Sunday full only","Sunday full and Thursday's differential","Sunday full and every differential","Thursday's differential only"],a:1,e:"Each differential holds all changes since the full, so only the latest is needed."},
 {q:"A company does a full backup Sunday and incrementals Monday to Friday. The server fails Thursday afternoon. What's needed to restore?",o:["Sunday full and Thursday's incremental","Sunday full plus Monday, Tuesday, Wednesday and Thursday incrementals","Thursday's incremental only","Sunday full only"],a:1,e:"Each incremental holds only one day's changes, so all are needed."},
 {q:"Which backup type takes the longest to back up but is the fastest to restore?",o:["Full","Incremental","Differential","Snapshot"],a:0,e:"A full backup contains everything in one set."},
 {q:"What does the 3-2-1 backup rule require?",o:["3 copies, 2 media types, 1 offsite","3 backups a day, 2 weekly, 1 monthly","3 servers, 2 sites, 1 cloud","3 admins, 2 approvals, 1 test"],a:0,e:"It protects against device failure and site disasters."},
 {q:"What is the best way to confirm backups will work in a disaster?",o:["Regularly test restoring them","Check the backup log size","Make more backups","Use only full backups"],a:0,e:"Only a test restore proves a backup is usable."},
 {q:"Which rotation scheme uses monthly, weekly and daily backup sets?",o:["Grandfather-father-son","3-2-1","Synthetic full","Round robin"],a:0,e:"GFS keeps monthly (grandfather), weekly (father) and daily (son) backups."},
 {q:"What should a technician wear to prevent ESD damage when installing RAM?",o:["Antistatic wrist strap","Rubber gloves","Safety goggles","Steel-toe boots"],a:0,e:"A wrist strap equalizes static charge between you and the PC."},
 {q:"Which fire extinguisher class is used on electrical fires?",o:["Class A","Class B","Class C","Class K"],a:2,e:"Class C extinguishers (CO₂ or dry chemical) don't conduct electricity."},
 {q:"Where can a technician find how to safely dispose of a toner cartridge?",o:["Safety data sheet (SDS)","EULA","AUP","SLA"],a:0,e:"SDS documents cover handling, hazards and disposal."},
 {q:"Which device keeps a server running long enough to shut down during a blackout?",o:["Surge suppressor","UPS","Power strip","Line conditioner only"],a:1,e:"A UPS provides battery power during outages."},
 {q:"A server room has very low humidity. What is the main risk?",o:["Static electricity","Condensation","Rust","Fan failure"],a:0,e:"Dry air increases static discharge risk."},
 {q:"How should a technician lift a heavy server?",o:["Bend at the knees and lift with the legs","Bend at the waist","Twist while lifting","Lift quickly"],a:0,e:"Keep your back straight and use your legs. Get help with heavy items."},
 {q:"Why should a technician never open a power supply?",o:["Capacitors can hold a dangerous charge even when unplugged","It voids the OS license","It has no serviceable fuses","It contains toner"],a:0,e:"PSU capacitors store lethal voltage."},
 {q:"A technician finds illegal content on a user's laptop during a repair. What should they do first?",o:["Delete it","Report it through proper channels","Ignore it","Copy it to a USB drive"],a:1,e:"Identify, report and preserve. Never alter the evidence."},
 {q:"Which document records everyone who handled evidence, and when?",o:["Chain of custody","SLA","AUP","Incident ticket"],a:0,e:"Chain of custody proves evidence wasn't tampered with."},
 {q:"Why should investigators work from a copy of a drive?",o:["To preserve the original evidence","It's faster","To save licenses","To defragment it"],a:0,e:"Working on a copy keeps the original intact for court."},
 {q:"A user wants to install home-use software on their work PC. What is the problem?",o:["Personal licenses usually don't cover corporate use","The software is too old","It needs a 32-bit OS","There is no problem"],a:0,e:"Personal licenses often prohibit business use."},
 {q:"Which license type requires ongoing payments to keep using the software?",o:["Subscription","Perpetual","Open-source","Freeware"],a:0,e:"Subscription licenses expire if not renewed."},
 {q:"Which regulation covers protecting credit card data?",o:["PCI DSS","HIPAA","GDPR only","FERPA"],a:0,e:"The Payment Card Industry Data Security Standard applies to card data."},
 {q:"Patient medical records are an example of what?",o:["PHI, protected under HIPAA","Public data","Open-source data","DRM data"],a:0,e:"Healthcare data is regulated."},
 {q:"A customer is angry about a repeat problem. What should the technician do?",o:["Argue that it isn't their fault","Listen without interrupting and avoid being defensive","Tell them to calm down","Post about it online"],a:1,e:"Active listening and staying calm defuse frustration."},
 {q:"A technician's personal phone rings while helping a customer. What should they do?",o:["Let it go to voicemail","Answer it quickly","Text back","Put it on speaker"],a:0,e:"Avoid personal interruptions while working with customers."},
 {q:"A technician will be 30 minutes late to an appointment. What should they do?",o:["Contact the customer before the appointment time","Arrive late without mention","Cancel without notice","Send another tech without telling anyone"],a:0,e:"Being professional means setting and meeting expectations."},
 {q:"While fixing a PC, a technician sees a confidential report on the printer. What should they do?",o:["Leave it alone and don't read it","Read it for context","Move it to their bag","Throw it away"],a:0,e:"Respect confidential materials on the customer's desk and screen."},
 {q:"Which question is open-ended?",o:["What happened right before the error appeared?","Is the PC on?","Did you restart?","Is the cable plugged in?"],a:0,e:"Open-ended questions get users to describe the problem in their words."},
 {q:"Which file extension is a PowerShell script?",o:[".ps1",".bat",".sh",".vbs"],a:0,e:".ps1 is PowerShell. .bat is a batch file."},
 {q:"Which file extension is a Linux shell script?",o:[".sh",".bat",".ps1",".vbs"],a:0,e:".sh scripts run in bash and other Unix shells."},
 {q:"A script meant to map drives instead locks up every PC because it never exits. What risk is this?",o:["Mishandling resources (an endless loop)","Malware","DRM","Phishing"],a:0,e:"Bugs like endless loops can crash systems."},
 {q:"What is a risk of running a script downloaded from an unknown website?",o:["It could introduce malware","It is always too slow","It can't run on Windows","It voids the warranty"],a:0,e:"Only run scripts from trusted sources, and read them first."},
 {q:"Which remote access tool gives a graphical desktop on Windows and uses TCP 3389?",o:["RDP","SSH","Telnet","SFTP"],a:0,e:"Remote Desktop Protocol uses port 3389."},
 {q:"An admin needs secure command-line access to a Linux server. What should they use?",o:["SSH","Telnet","RDP","VNC"],a:0,e:"SSH encrypts the session on TCP 22. Telnet is unencrypted."},
 {q:"Which tool lets an MSP monitor, patch and support many client PCs from one console?",o:["RMM","VPN","DRM","EULA"],a:0,e:"Remote monitoring and management tools are built for this."},
 {q:"A remote worker needs encrypted access to internal company servers. What should they use?",o:["VPN","Public Wi-Fi","Port forwarding RDP to the internet","FTP"],a:0,e:"A VPN creates an encrypted tunnel into the company network."},
 {q:"An AI chatbot confidently cites a policy that doesn't exist. What is this called?",o:["Hallucination","Bias","Plagiarism","Integration"],a:0,e:"Hallucinations are confident but false outputs."},
 {q:"Why shouldn't an employee paste customer records into a public AI tool?",o:["The data may be stored or used outside the company's control","It is too slow","It can't read text","It is always illegal to use AI"],a:0,e:"Public AI tools may keep what you enter. Use approved private tools for sensitive data."},
 {q:"An AI hiring tool favors one group because of its training data. What limitation is this?",o:["Bias","Hallucination","Latency","DRM"],a:0,e:"AI can reflect biases in the data it learned from."}
];

registerModule({
  id:"ops",slug:"operational-procedures",title:"Operational Procedures",
  lessons:LESSONS,
  decks:[["docs","Documentation and change"],["backup","Backups"],["safety","Safety, privacy, licensing"],["script","Scripting, remote, AI"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["change","backup","script","remote"],
  viz(){
/* ---- Change management flow ---- */
(function(){
  const el=$("#viz-change");if(!el)return;
  const S=[
    ["Request","Submit a change request: upgrade the file server's firmware. Purpose: fix a security flaw. Scope: one server. Affected systems: shared drives."],
    ["Risk analysis","Risk level: medium. Shared drives will be offline for 20 minutes. If the update fails, the server may not boot."],
    ["CAB approval","The change advisory board approves it for Saturday at 7 a.m., outside business hours."],
    ["Sandbox test","The firmware is tested on an identical spare server first. It works."],
    ["Plans ready","Backup taken. Rollback plan: reflash the old firmware from the saved image. Responsible staff member: Dana."],
    ["Implement","Dana applies the update Saturday at 7 a.m. A peer reviews the result."],
    ["User acceptance","Monday morning, the finance team confirms they can open and save files."],
    ["Document","The change record is closed with notes, and the CMDB is updated with the new firmware version."]
  ];
  let i=-1;
  el.innerHTML=`<div class="viz-title">Follow a change from request to close</div>
  <div class="chg">${S.map((s,j)=>`<div class="chg-st" id="cg${j}"><span class="mono">${j+1}</span>${s[0]}</div>`).join("")}</div>
  <div class="caption" aria-live="polite">Press <b>Next step</b>.</div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button></div>`;
  function draw(){
    S.forEach((_,j)=>$("#cg"+j).className="chg-st"+(j<i?" done":j===i?" on":""));
    $(".caption",el).innerHTML=i<0?"Press <b>Next step</b>.":`<b>${S[i][0]}.</b> ${S[i][1]}`;
    $('[data-a="back"]',el).disabled=i<0;$('[data-a="next"]',el).disabled=i>=S.length-1;
    if(i===S.length-1)award("viz:change",20,"Followed a change through");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next")i=Math.min(i+1,S.length-1);if(a==="back")i=Math.max(i-1,-1);if(a)draw()});draw();
})();

/* ---- Backup scheme simulator ---- */
(function(){
  const el=$("#viz-backup");if(!el)return;
  const D=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],CH=[0,8,6,9,7,10,4];
  const SCH={full:"Full every day",inc:"Full Sunday + incremental",diff:"Full Sunday + differential"};
  let sch="inc",fail=4;const seen=new Set();
  el.innerHTML=`<div class="viz-title">Backup scheme simulator</div>
  <div class="viz-controls">${Object.entries(SCH).map(([k,n])=>`<button class="chip" data-sch="${k}">${n}</button>`).join("")}</div>
  <div class="bk"></div>
  <div class="bk-fail"><span class="s-small">DRIVE FAILS ON</span><div class="chips">${D.slice(1).map((d,j)=>`<button class="chip" data-f="${j+1}">${d}</button>`).join("")}</div></div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(){
    seen.add(sch);
    el.querySelectorAll("[data-sch]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sch===sch));
    el.querySelectorAll("[data-f]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.f===fail));
    const FULL=50;let cum=0;
    const sets=D.map((d,j)=>{let size,type;
      if(j===0||sch==="full"){size=FULL;type="Full";cum=0}
      else if(sch==="inc"){size=CH[j];type="Incr"}
      else{cum+=CH[j];size=cum;type="Diff"}
      return {d,size,type}});
    const last=fail-1;let need;
    if(sch==="full")need=[last];else if(sch==="inc")need=[...Array(last+1).keys()];else need=last===0?[0]:[0,last];
    $(".bk",el).innerHTML=sets.map((s,j)=>`<div class="bk-d ${j>=fail?"future":""} ${need.includes(j)?"need":""}"><div class="bk-bar"><i class="t-${s.type}" style="height:${s.size/FULL*100}%"></i></div><b class="mono">${s.type}</b><span>${s.d}</span><em class="s-small">${s.size} GB</em></div>`).join("");
    const time=sets.slice(0,7).reduce((a,s)=>a+s.size,0);
    $(".caption",el).innerHTML=`To restore after <b>${D[fail]}</b>'s failure you need <b>${need.length} backup set${need.length>1?"s":""}</b>: ${need.map(j=>D[j]+" ("+sets[j].type.replace("Incr","incremental").replace("Diff","differential").replace("Full","full")+")").join(", ")}. `+
      (sch==="full"?"Fastest restore, but the week's backups use "+time+" GB.":sch==="inc"?"The smallest daily backups, but the restore needs every set in order. Lose one and the chain breaks.":"Daily backups grow until the next full, but the restore needs only two sets.");
    if(seen.size===3)award("viz:backup",30,"Compared backup schemes");
  }
  el.addEventListener("click",e=>{const s=e.target.closest("[data-sch]"),f=e.target.closest("[data-f]");if(s)sch=s.dataset.sch;if(f)fail=+f.dataset.f;if(s||f)draw()});draw();
})();

/* ---- Script sampler ---- */
(function(){
  const el=$("#viz-script");if(!el)return;
  const SC={
    ".bat":["Windows batch","Map a drive at login","@echo off\nREM Map the finance share\nnet use Z: \\\\fs01\\finance /persistent:yes\necho Drive mapped."],
    ".ps1":["PowerShell","Restart a stuck service on many PCs","# Restart the print spooler on each PC\n$pcs = Get-Content .\\pcs.txt\nforeach ($pc in $pcs) {\n    Restart-Service -Name Spooler -ComputerName $pc\n}"],
    ".vbs":["VBScript","Legacy Windows automation","' Show a message to the user\nDim msg\nmsg = \"Updates will install tonight.\"\nMsgBox msg"],
    ".sh":["Bash shell (Linux and macOS)","Nightly backup","#!/bin/bash\n# Back up the web folder with today's date\nDATE=$(date +%F)\ntar -czf /backup/web-$DATE.tar.gz /var/www\necho \"Backup done: $DATE\""],
    ".js":["JavaScript","Web pages and automation with Node.js","// Warn when disk space is low\nconst freeGB = 4;\nif (freeGB < 10) {\n  console.log(\"Low disk space!\");\n}"],
    ".py":["Python","Gather information from many systems","# Check which hosts answer\nimport subprocess\nfor host in [\"10.0.0.1\", \"10.0.0.10\"]:\n    r = subprocess.run([\"ping\", \"-c\", \"1\", host])\n    print(host, \"up\" if r.returncode == 0 else \"down\")"]
  };
  const seen=new Set();let cur=".ps1";
  el.innerHTML=`<div class="viz-title">Script types and what they look like</div>
  <div class="viz-controls">${Object.keys(SC).map(k=>`<button class="chip mono" data-x="${k}">${k}</button>`).join("")}</div>
  <div class="scr-h"></div><pre class="term"></pre>
  <p class="s-small">Spot the building blocks: <span class="kw-c">comments</span>, <span class="kw-v">variables</span>, <span class="kw-l">loops and conditionals</span>.</p>`;
  function hl(code,ext){
    const esc=code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return esc.split("\n").map(l=>{
      if(/^\s*(REM|#|'|\/\/)/.test(l)&&!/^#!/.test(l))return `<span class="kw-c">${l}</span>`;
      return l.replace(/\b(foreach|for|if|else|in)\b/g,'<span class="kw-l">$1</span>').replace(/(\$[A-Za-z]+|\bDim\b|\bconst\b)/g,'<span class="kw-v">$1</span>');
    }).join("\n");
  }
  function draw(){
    const s=SC[cur];seen.add(cur);
    el.querySelectorAll("[data-x]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.x===cur));
    $(".scr-h",el).innerHTML=`<b>${cur}</b> is a <b>${s[0]}</b> script. Example use: ${s[1]}.`;
    $(".term",el).innerHTML=hl(s[2],cur);
    if(seen.size===6)award("viz:script",20,"Explored every script type");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(b){cur=b.dataset.x;draw()}});draw();
})();

/* ---- Remote access comparison ---- */
(function(){
  const el=$("#viz-remote");if(!el)return;
  const R={
    RDP:["TCP 3389","Full graphical Windows desktop","Built into Windows. Never expose it directly to the internet. Put it behind a VPN or gateway and require MFA.",["gui","win"]],
    VNC:["TCP 5900","Screen sharing on any OS","Cross-platform. Older versions send data unencrypted, so tunnel it or use a secure version.",["gui","any"]],
    SSH:["TCP 22","Encrypted command line","The standard for Linux, macOS and network devices. Use keys instead of passwords where possible.",["cli","any"]],
    VPN:["Varies (e.g. UDP 1194, 443)","Encrypted tunnel into the network","Not remote control itself: it puts a remote user on the internal network, so they can then use RDP or file shares safely.",["net","any"]],
    RMM:["HTTPS agent","Monitor, patch and control many PCs","Used by MSPs. Powerful, so protect it with MFA. Attackers who compromise an RMM tool reach every client.",["gui","any"]],
    SPICE:["Varies","Remote display for virtual machines","Used with KVM-based virtualization to view and control VM consoles.",["gui","vm"]]
  };
  const seen=new Set();let cur="RDP";
  el.innerHTML=`<div class="viz-title">Choose the right remote access tool</div>
  <div class="viz-controls">${Object.keys(R).map(k=>`<button class="chip" data-r="${k}">${k}</button>`).join("")}</div>
  <div class="rmt"><div class="rmt-link"><div class="rmt-pc"><span>Technician</span></div><div class="rmt-wire"><b class="mono"></b><i></i></div><div class="rmt-pc"><span class="rmt-t"></span></div></div><div class="caption" aria-live="polite"></div></div>`;
  function draw(){
    const r=R[cur];seen.add(cur);
    el.querySelectorAll("[data-r]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.r===cur));
    $(".rmt-wire b",el).textContent=cur+" · "+r[0];
    $(".rmt-wire",el).className="rmt-wire k-"+r[3][0];
    $(".rmt-t",el).textContent=r[3][1]==="vm"?"Virtual machine":r[3][0]==="net"?"Office network":r[3][0]==="cli"?"Server (terminal)":r[3][1]==="win"?"Windows desktop":"Remote screen";
    $(".caption",el).innerHTML=`<b>${r[1]}.</b> ${r[2]}`;
    if(seen.size===6)award("viz:remote",20,"Compared remote access tools");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(b){cur=b.dataset.r;draw()}});draw();
})();
  },
  sims:[
    {id:"restore",title:"Restore the file server",mount(el,api,sim){
      const D=["Sun","Mon","Tue","Wed","Thu","Fri"];
      const C=[
        {name:"Server A",scheme:"Full on Sunday, incremental every other night",type:"Incr",fail:"Friday morning",ans:[0,1,2,3,4]},
        {name:"Server B",scheme:"Full on Sunday, differential every other night",type:"Diff",fail:"Friday morning",ans:[0,4]}
      ];
      let pick=[new Set(),new Set()],graded=null;
      function draw(){
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <p class="scenario">Two servers failed on Friday morning before their nightly backup ran. Select <b>only</b> the backup sets you need to restore each one to Thursday night. Using extra sets wastes hours of restore time.</p>
        ${C.map((c,ci)=>`<div class="rst ${graded?(graded[ci]?"ok":"no"):""}"><div class="rst-h"><b>${c.name}</b><span class="s-small">${c.scheme}</span></div>
          <div class="tapes">${D.slice(0,5).map((d,j)=>`<button class="tape ${pick[ci].has(j)?"sel":""}" data-c="${ci}" data-j="${j}"><b class="mono">${j===0?"Full":c.type}</b><span>${d}</span></button>`).join("")}</div>
          ${graded&&!graded[ci]?`<p class="tk-e">${c.type==="Incr"?"Each incremental only holds one day's changes, so you need the full plus every incremental since.":"Each differential holds everything since the full, so you need only the full and the latest differential."}</p>`:""}</div>`).join("")}
        <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">Both servers restored with the minimum sets.</span>`:"Not quite. Read the notes and try again."):"Tap backup sets to select them."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Start restore</button><button class="btn" data-a="reset">Clear</button></div>`;
      }
      el.addEventListener("click",e=>{const t=e.target.closest("[data-j]");if(t){const s=pick[+t.dataset.c],j=+t.dataset.j;s.has(j)?s.delete(j):s.add(j);graded=null;draw();return}
        const a=e.target.closest("[data-a]")?.dataset.a;if(a==="reset"){pick=[new Set(),new Set()];graded=null;draw()}
        if(a==="grade"){graded=C.map((c,ci)=>pick[ci].size===c.ans.length&&c.ans.every(j=>pick[ci].has(j)));if(graded.every(Boolean))api.pass();draw()}});
      draw();
    }},
    {id:"evidence",type:"order",title:"Handle prohibited content",
      scenario:"While repairing a laptop, you find content that violates company policy and may be illegal. Tap the response steps in order.",
      steps:["Stop and identify the prohibited content","Report it through proper channels","Preserve the data and the device","Document what you found and what you did","Maintain chain of custody when handing over the evidence"],
      success:"The evidence is preserved and admissible."},
    {id:"docsmatch",type:"match",title:"Find the right document",
      scenario:"Match each situation to the document that handles it. Tap a document, then tap the situation.",
      items:[["AUP","aup"],["SLA","sla"],["SOP","sop"],["SDS","sds"],["Knowledge base article","kb"],["Change request","cr"],["Incident report","ir"],["EULA","eula"]],
      slots:[["aup","Can employees stream video at work?",""],["sla","How fast must the vendor respond?",""],["sop","Steps to image a new laptop",""],["sds","How to dispose of toner",""],["kb","Fix for a printer error, saved for next time",""],["cr","Plan to upgrade the firewall Saturday",""],["ir","What happened during last night's breach",""],["eula","Terms you accept installing software",""]],
      success:"Every situation is matched to the right paperwork."}
  ],
  badges:[
    ["reader","OP","Professional","Mark all 9 operational procedures lessons studied",c=>c.allStudied()],
    ["lab","BK","Backup Boss","Complete all 4 operational procedures diagrams",c=>c.vizAll()],
    ["restore","RS","Restorer","Pass the restore simulation",c=>c.passed("restore")],
    ["evidence","CC","Chain of Custody","Pass the prohibited content simulation",c=>c.passed("evidence")],
    ["docsmatch","DX","Documentarian","Pass the documentation simulation",c=>c.passed("docsmatch")],
    ["perfect","CB","Change Approved","Score 100% on an operational procedures quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
