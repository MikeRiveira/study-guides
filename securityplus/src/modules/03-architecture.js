/* ================= Module 3: Security Architecture (SY0-701 Domain 3.0, 18%) ================= */
(function(){
const LESSONS=[
{id:"cloud",num:"3.1",title:"Cloud and architecture models",html:`
<h3>Cloud responsibility</h3>
<p>In the cloud, security is shared. The <b>responsibility matrix</b> shows who handles what. The more managed the service, the less you handle, but <b>your data and who can access it are always yours</b>.</p>
<ul><li><b>IaaS</b> (infrastructure as a service): you manage the OS, apps and data. The provider runs the hardware and hypervisor.</li>
<li><b>PaaS</b> (platform as a service): you manage your app and data. The provider runs the OS and runtime.</li>
<li><b>SaaS</b> (software as a service): you manage your data, users and settings. The provider runs everything else.</li></ul>
<div class="viz" id="viz-shared"></div>
<h3>Hybrid and third-party</h3>
<p>A <b>hybrid cloud</b> mixes on-premises and cloud, or several providers. Watch for consistent policies across both. <b>Third-party vendors</b> in the mix add supply chain risk.</p>
<h3>Other models</h3>
<ul><li><b>Infrastructure as code (IaC)</b>: servers and networks defined in files, so builds are repeatable and reviewable. A mistake in the template is copied everywhere.</li>
<li><b>Serverless</b>: you write functions and the provider runs them. No OS to patch, but function permissions matter.</li>
<li><b>Microservices</b>: an app split into small services talking through APIs. Secure the APIs.</li>
<li><b>Network infrastructure</b>: <b>physical isolation</b> (an <b>air gap</b> with no connection at all), <b>logical segmentation</b> (VLANs) and <b>software-defined networking (SDN)</b>, which separates the control plane from the data plane.</li>
<li><b>On-premises</b>: you control everything, and you pay for and secure everything. <b>Centralized</b> vs <b>decentralized</b>: one point of control (and failure) vs control spread across many locations.</li>
<li><b>Containerization</b>: apps packaged with their dependencies sharing one OS kernel. <b>Virtualization</b>: full guest OSes on a hypervisor.</li>
<li><b>IoT</b>: smart devices, often weakly secured. <b>ICS/SCADA</b>: industrial control systems running physical processes; availability and safety come first. <b>RTOS</b>: real-time OS with strict timing, as in cars and medical devices. <b>Embedded systems</b>: dedicated-purpose computers that are often hard to patch.</li>
<li><b>High availability</b>: designs that stay up through failures.</li></ul>
<div class="viz" id="viz-models"></div>
<h3>Considerations</h3>
<p>Weigh <b>availability</b>, <b>resilience</b>, <b>cost</b>, <b>responsiveness</b>, <b>scalability</b>, <b>ease of deployment</b>, <b>risk transference</b>, <b>ease of recovery</b>, <b>patch availability</b>, <b>inability to patch</b>, <b>power</b> and <b>compute</b>. An embedded medical pump may score badly on patch availability, so it needs compensating controls.</p>`},
{id:"infra",num:"3.2",title:"Secure network infrastructure",html:`
<h3>Placement and zones</h3>
<p><b>Device placement</b> decides what each control can see. <b>Security zones</b> group systems by trust, with controls between them. Every connection you add grows the <b>attack surface</b>.</p>
<h3>Failure modes</h3>
<ul><li><b>Fail-open</b>: if the device fails, traffic keeps flowing. Availability wins, security loses.</li>
<li><b>Fail-closed</b>: if the device fails, traffic stops. Security wins, availability loses.</li></ul>
<h3>Device attributes</h3>
<ul><li><b>Active</b> devices can block (IPS). <b>Passive</b> devices only watch (IDS).</li>
<li><b>Inline</b>: traffic passes through the device. <b>Tap/monitor</b>: the device gets a copy from a network tap or SPAN port.</li></ul>
<h3>Appliances</h3>
<ul><li><b>Jump server</b> (jump box): a hardened host admins connect to first, then reach internal systems from it.</li>
<li><b>Proxy server</b>: makes requests on behalf of clients. Forward proxies filter user web traffic. Reverse proxies sit in front of servers.</li>
<li><b>IPS/IDS</b>: inspect traffic for attacks; IPS blocks, IDS alerts.</li>
<li><b>Load balancer</b>: spreads traffic across servers for availability.</li>
<li><b>Sensors</b>: collect traffic or events for monitoring.</li></ul>
<h3>Firewalls</h3>
<ul><li><b>Layer 4</b> firewalls filter by IP address and port. <b>Layer 7</b> firewalls understand applications.</li>
<li><b>Web application firewall (WAF)</b>: protects web apps from SQLi, XSS and similar attacks.</li>
<li><b>Unified threat management (UTM)</b>: firewall, IPS, antivirus, content filter and VPN in one box, often for small offices.</li>
<li><b>Next-generation firewall (NGFW)</b>: application-aware, with IPS and user identity built in.</li></ul>
<h3>Port security</h3>
<p><b>802.1X</b> keeps a switch port closed until the device authenticates through RADIUS, using <b>EAP</b> (Extensible Authentication Protocol) methods such as EAP-TLS.</p>
<div class="viz" id="viz-failmode"></div>
<div class="viz" id="viz-appl"></div>`},
{id:"remote",num:"3.3",title:"Secure communication and access",html:`
<ul><li><b>VPN</b>: an encrypted tunnel across an untrusted network. <b>Remote access VPNs</b> connect users. <b>Site-to-site VPNs</b> connect offices.</li>
<li><b>Tunneling</b>: <b>TLS</b> VPNs work through browsers and port 443. <b>IPsec</b> works at layer 3 and uses <b>AH</b> (integrity and authentication, no encryption) and <b>ESP</b> (encryption plus integrity). <b>Tunnel mode</b> encrypts the whole original packet; <b>transport mode</b> encrypts only the payload.</li>
<li><b>Full tunnel</b> sends all traffic through the VPN. <b>Split tunnel</b> sends only corporate traffic through it.</li>
<li><b>SD-WAN</b>: software-defined WAN that picks the best path across links such as broadband, LTE and MPLS.</li>
<li><b>SASE</b> (secure access service edge): cloud-delivered networking and security (secure web gateway, CASB, zero trust access, firewall) close to users wherever they are.</li></ul>
<div class="viz" id="viz-ipsec"></div>
<h3>Selecting controls</h3>
<p>Choose controls that fit the architecture. A remote-first company leans on SASE and zero trust. A factory leans on segmentation and physical isolation. A small office might use a single UTM.</p>
<div class="viz" id="viz-pickarch"></div>`},
{id:"data",num:"3.4",title:"Protecting data",html:`
<h3>Data types</h3>
<p><b>Regulated</b> (health, payment), <b>trade secrets</b>, <b>intellectual property</b>, <b>legal</b> and <b>financial</b> information. Data can be <b>human-readable</b> or <b>non-human-readable</b> (binary, barcodes, encoded).</p>
<h3>Classifications</h3>
<p>Typical labels: <b>public</b>, <b>private</b>, <b>sensitive</b>, <b>confidential</b>, <b>restricted</b> and <b>critical</b>. The label decides the handling rules.</p>
<div class="viz" id="viz-class"></div>
<h3>Data states</h3>
<ul><li><b>At rest</b>: stored on disk, in a database or backup. Use disk, file and database encryption.</li>
<li><b>In transit</b>: moving across a network. Use TLS, IPsec and VPNs.</li>
<li><b>In use</b>: in memory being processed. The hardest to protect: secure enclaves and careful access control.</li></ul>
<div class="viz" id="viz-states"></div>
<h3>Sovereignty and protection methods</h3>
<p><b>Data sovereignty</b>: data is subject to the laws of the country where it's stored. <b>Geolocation</b> and <b>geographic restrictions</b> control where it can be stored or accessed.</p>
<p>Methods: <b>encryption</b>, <b>hashing</b>, <b>masking</b>, <b>tokenization</b>, <b>obfuscation</b>, <b>segmentation</b> and <b>permission restrictions</b>.</p>`},
{id:"resil",num:"3.5",title:"Resilience and recovery",html:`
<h3>High availability</h3>
<p><b>Load balancing</b> spreads work across active servers. <b>Clustering</b> groups servers so another takes over if one fails. Build redundancy in at every layer.</p>
<h3>Site considerations</h3>
<ul><li><b>Hot site</b>: fully equipped and running, data replicated. Recovery in minutes to hours. Most expensive.</li>
<li><b>Warm site</b>: hardware in place, data needs restoring. Recovery in hours to days.</li>
<li><b>Cold site</b>: space, power and cooling only. Recovery in days to weeks. Cheapest.</li>
<li><b>Geographic dispersion</b>: sites far enough apart that one disaster doesn't hit both.</li></ul>
<div class="viz" id="viz-sites"></div>
<h3>Diversity and continuity</h3>
<p><b>Platform diversity</b> (different OSes or vendors) and <b>multi-cloud</b> avoid a single point of failure. <b>Continuity of operations planning (COOP)</b> keeps essential functions running. <b>Capacity planning</b> covers <b>people</b>, <b>technology</b> and <b>infrastructure</b>.</p>
<h3>Testing</h3>
<p><b>Tabletop exercises</b> (talking through a scenario), <b>failover</b> tests, <b>simulations</b> and <b>parallel processing</b> (running the backup system alongside production to compare).</p>
<h3>Backups</h3>
<ul><li><b>Onsite and offsite</b> copies. Keep at least one offline or immutable copy that ransomware can't reach.</li>
<li><b>Frequency</b> sets your recovery point. <b>Encrypt</b> backups.</li>
<li><b>Snapshots</b>: point-in-time copies of a VM or volume. <b>Replication</b>: continuous copying to another site. <b>Journaling</b>: logging changes so you can replay to a point in time.</li>
<li><b>Recovery</b>: test restores regularly. An untested backup isn't a backup.</li></ul>
<p><b>RPO</b> (recovery point objective) is how much data you can afford to lose, measured back in time. <b>RTO</b> (recovery time objective) is how long you can afford to be down.</p>
<div class="viz" id="viz-rpo"></div>
<h3>Power</h3>
<p>A <b>UPS</b> bridges short outages and gives time to shut down or for <b>generators</b> to start. Generators run for long outages.</p>`}
];

const G={
 cloud:[["Shared responsibility model","Provider and customer split security duties by service model"],["Always the customer's responsibility","Data, identities and access"],["IaaS customer manages","OS, applications, data, access"],["PaaS customer manages","Applications, data, access"],["SaaS customer manages","Data, users, configuration"],["Hybrid cloud","Mix of on-premises and cloud, or multiple providers"],["Infrastructure as code","Infrastructure defined in templates; repeatable builds"],["Serverless","Provider runs your functions; no OS to manage"],["Microservices","App built from small services communicating by API"],["Air gap","Physical isolation with no network connection"],["Logical segmentation","Separating networks with VLANs or ACLs"],["SDN","Software-defined networking separates control and data planes"],["Containerization","Apps packaged with dependencies sharing one OS kernel"],["ICS / SCADA","Industrial control systems for physical processes; availability first"],["RTOS","Real-time OS with strict timing guarantees"],["Embedded system","Dedicated-purpose computer, often hard to patch"],["IoT","Internet-connected smart devices, often weakly secured"],["Centralized architecture","One point of control and a single point of failure"]],
 infra:[["Fail-open","Traffic passes if the device fails; favors availability"],["Fail-closed","Traffic stops if the device fails; favors security"],["Active device","Can block traffic, e.g. IPS"],["Passive device","Monitors only, e.g. IDS"],["Inline","Traffic flows through the device"],["Tap / monitor","Device receives a copy of traffic"],["Jump server","Hardened host used to reach internal systems for admin"],["Forward proxy","Makes web requests for internal clients and filters them"],["Reverse proxy","Sits in front of servers and handles inbound requests"],["IPS","Intrusion prevention system; inline, blocks"],["IDS","Intrusion detection system; alerts only"],["Load balancer","Distributes traffic across servers"],["Layer 4 firewall","Filters on IP and port"],["Layer 7 firewall","Understands applications"],["WAF","Web application firewall; blocks SQLi and XSS"],["UTM","All-in-one firewall, IPS, AV, filter and VPN"],["NGFW","Application-aware firewall with IPS and identity"],["802.1X","Port-based network access control via RADIUS"],["EAP","Extensible Authentication Protocol used in 802.1X"]],
 remote:[["Remote access VPN","Connects individual users to the network"],["Site-to-site VPN","Connects networks such as branch offices"],["TLS VPN","VPN over TLS/443; often browser-based"],["IPsec AH","Authentication Header: integrity and authentication, no encryption"],["IPsec ESP","Encapsulating Security Payload: encryption and integrity"],["IPsec tunnel mode","Encrypts the entire original packet"],["IPsec transport mode","Encrypts only the payload"],["Split tunnel","Only corporate traffic uses the VPN"],["Full tunnel","All traffic goes through the VPN"],["SD-WAN","Software-defined WAN choosing paths across links"],["SASE","Cloud-delivered network security close to users"]],
 data:[["Regulated data","Data governed by law, e.g. health or card data"],["Trade secret","Confidential business information giving an advantage"],["Intellectual property","Creations protected by patents, copyrights, trademarks"],["Data at rest","Stored data; protect with disk/database encryption"],["Data in transit","Moving data; protect with TLS, IPsec"],["Data in use","Data in memory; hardest to protect"],["Data sovereignty","Data is subject to the laws where it's stored"],["Geographic restrictions","Limiting where data can be stored or accessed"],["Restricted classification","Highest sensitivity; strict need-to-know"],["Public classification","Approved for anyone"],["Critical data","Data essential to operations"]],
 resil:[["Hot site","Fully running with live data; fastest, most expensive"],["Warm site","Hardware ready, data must be restored"],["Cold site","Space and power only; slowest, cheapest"],["Geographic dispersion","Sites far apart so one disaster doesn't hit both"],["Load balancing vs clustering","Spread load across actives vs failover between nodes"],["Platform diversity","Different vendors or OSes to avoid common failures"],["Multi-cloud","Using more than one cloud provider"],["COOP","Continuity of operations planning"],["Capacity planning","People, technology and infrastructure"],["Tabletop exercise","Talk through a scenario without touching systems"],["Failover test","Actually switch to the backup system"],["Parallel processing test","Run backup systems alongside production"],["Snapshot","Point-in-time copy of a VM or volume"],["Replication","Continuous copy of data to another location"],["Journaling","Logging changes to replay to a point in time"],["RPO","Recovery point objective: max acceptable data loss"],["RTO","Recovery time objective: max acceptable downtime"],["UPS","Battery power for short outages"],["Generator","Long-term backup power"],["Immutable backup","Can't be changed or deleted; resists ransomware"]]
};
const DECKS=[["cloud","Architecture models"],["infra","Infrastructure"],["remote","Secure access"],["data","Data protection"],["resil","Resilience"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A company moves its email to a SaaS provider. Which is still the company's responsibility?",o:["Patching the mail server OS","Physical security of the data center","Configuring user access and MFA","Hypervisor updates"],a:2,e:"In SaaS the customer still owns data, identities and access settings."},
 {q:"In IaaS, who patches the guest operating system?",o:["The cloud provider","The customer","The hardware vendor","Nobody"],a:1,e:"IaaS customers manage everything from the OS up."},
 {q:"Which service model leaves the customer responsible for the application code and data, but not the OS?",o:["IaaS","PaaS","SaaS","On-premises"],a:1,e:"PaaS provides the OS and runtime."},
 {q:"Which document defines who handles which security tasks between a cloud provider and customer?",o:["Responsibility matrix","CRL","BIA","MOU"],a:0,e:"The responsibility matrix maps duties by service model."},
 {q:"A template that builds 200 identical servers had SSH open to the internet. All 200 servers are exposed. Which model's risk is this?",o:["Infrastructure as code","Air gap","RTOS","Hot site"],a:0,e:"IaC repeats whatever is in the template, including mistakes. Review templates like code."},
 {q:"Which model removes OS patching from the customer's duties entirely?",o:["IaaS","Serverless","On-premises","Containers on your own hosts"],a:1,e:"With serverless functions, the provider manages the runtime and OS."},
 {q:"A nuclear plant's control network has no physical connection to any other network. What is this?",o:["VLAN","Air gap","SDN","DMZ"],a:1,e:"An air gap is physical isolation."},
 {q:"Which architecture separates the control plane from the data plane so networks can be managed centrally by software?",o:["SDN","SCADA","RTOS","UTM"],a:0,e:"Software-defined networking separates the two planes."},
 {q:"Containers differ from VMs because containers:",o:["Each run a full guest OS","Share the host OS kernel","Can't be isolated","Require a hypervisor"],a:1,e:"Containers share one kernel, making them lighter but tying their isolation to that kernel."},
 {q:"Which system's top priority is usually availability and safety rather than confidentiality?",o:["ICS/SCADA","Email server","HR database","Marketing website"],a:0,e:"Industrial systems control physical processes where downtime can be dangerous."},
 {q:"An infusion pump runs a real-time OS and the vendor won't allow patches. What's the BEST approach?",o:["Install antivirus on it","Segment it and apply compensating controls","Connect it directly to the internet","Ignore it"],a:1,e:"When you can't patch, isolate and monitor."},
 {q:"A firewall fails and all traffic is blocked until it's replaced. What failure mode is this?",o:["Fail-open","Fail-closed","Fail-safe for availability","Passive"],a:1,e:"Fail-closed stops traffic, protecting security over availability."},
 {q:"A hospital wants patient monitors to keep sending data even if the inline security appliance crashes. Which failure mode should the appliance use?",o:["Fail-open","Fail-closed","Active","Tap"],a:0,e:"Fail-open keeps traffic flowing when availability is critical."},
 {q:"Which device sits inline and blocks malicious traffic?",o:["IDS","IPS","Network tap","SIEM"],a:1,e:"An IPS is active and inline."},
 {q:"An IDS connected to a SPAN port is BEST described as:",o:["Active and inline","Passive and monitoring a copy","Fail-closed","A proxy"],a:1,e:"It receives a copy of traffic and only alerts."},
 {q:"Administrators must first connect to one hardened server before reaching any production database. What is that server?",o:["Proxy","Jump server","Load balancer","Honeypot"],a:1,e:"A jump server is the controlled entry point for admin access."},
 {q:"Which device protects a web app from SQL injection and XSS?",o:["WAF","Layer 4 firewall","Load balancer","UPS"],a:0,e:"Web application firewalls inspect HTTP for application attacks."},
 {q:"A small branch office wants firewall, antivirus, content filtering and VPN in one appliance. What should it buy?",o:["UTM","HSM","SAN","Jump server"],a:0,e:"Unified threat management combines these functions."},
 {q:"Which firewall can block a specific application, like a file-sharing app, even when it uses port 443?",o:["Layer 4 packet filter","Next-generation firewall","Stateless ACL","Network tap"],a:1,e:"NGFWs are application-aware."},
 {q:"Which server sits in front of web servers and handles incoming client requests on their behalf?",o:["Forward proxy","Reverse proxy","Jump server","RADIUS"],a:1,e:"A reverse proxy fronts servers. A forward proxy fronts clients."},
 {q:"A switch port stays closed until the laptop presents a valid certificate checked by RADIUS. What is this?",o:["802.1X with EAP-TLS","Port mirroring","MAC filtering only","Split tunneling"],a:0,e:"802.1X with EAP-TLS authenticates with certificates."},
 {q:"Which IPsec protocol provides encryption?",o:["AH","ESP","IKE only","GRE"],a:1,e:"ESP encrypts. AH only provides integrity and authentication."},
 {q:"Which IPsec mode encrypts the entire original IP packet, including headers, and is used for site-to-site VPNs?",o:["Transport mode","Tunnel mode","Split mode","Passive mode"],a:1,e:"Tunnel mode wraps the whole packet in a new one."},
 {q:"Remote users' Netflix traffic goes straight to the internet while corporate traffic uses the VPN. What is this?",o:["Full tunnel","Split tunnel","Site-to-site","SASE"],a:1,e:"Split tunneling sends only corporate traffic through the tunnel."},
 {q:"A security team wants all remote user traffic inspected by corporate security tools. What should they use?",o:["Split tunnel","Full tunnel","No VPN","Air gap"],a:1,e:"A full tunnel routes everything through corporate controls."},
 {q:"A company with 40 branches wants to choose the best path across broadband, LTE and MPLS automatically. What technology fits?",o:["SD-WAN","802.1X","RTOS","WAF"],a:0,e:"SD-WAN manages and steers traffic across multiple links."},
 {q:"A fully remote company wants cloud-delivered secure web gateway, CASB and zero trust access close to each user. What is this?",o:["SASE","UTM","SCADA","Hot site"],a:0,e:"Secure access service edge delivers these from the cloud."},
 {q:"Which data state is hardest to protect?",o:["At rest","In transit","In use","Archived"],a:2,e:"Data in memory must be decrypted to be processed."},
 {q:"Which protects data in transit?",o:["BitLocker","TLS","Tokenization of backups","Data masking"],a:1,e:"TLS encrypts data moving across networks."},
 {q:"A European company must keep citizen data in EU data centers because of local law. What concept is this?",o:["Data sovereignty","Data masking","Tokenization","Least privilege"],a:0,e:"Data is subject to the laws of the country where it's stored."},
 {q:"A recipe that gives a company its competitive edge is which data type?",o:["Regulated","Trade secret","Public","Legal"],a:1,e:"Trade secrets are confidential business information."},
 {q:"Patient health records are BEST described as:",o:["Public data","Regulated data","Non-human-readable data","Trade secrets"],a:1,e:"Health data is governed by laws such as HIPAA."},
 {q:"Which classification is MOST appropriate for a press release approved for publication?",o:["Restricted","Confidential","Public","Critical"],a:2,e:"Approved-for-release content is public."},
 {q:"A cloud app blocks logins to the finance dashboard from outside the country. What method is this?",o:["Geographic restriction","Hashing","Journaling","Steganography"],a:0,e:"Location-based limits are geographic restrictions."},
 {q:"Which recovery site has hardware ready but needs data restored before use?",o:["Hot","Warm","Cold","Mobile"],a:1,e:"Warm sites are partly ready."},
 {q:"A business can't be down for more than one hour and money is no object. Which site?",o:["Cold","Warm","Hot","None; use backups only"],a:2,e:"A hot site is running with current data."},
 {q:"Which is cheapest but slowest to bring online?",o:["Hot site","Warm site","Cold site","Cluster"],a:2,e:"A cold site is just space, power and cooling."},
 {q:"A company's backup data center is 3 miles from headquarters on the same flood plain. What principle is violated?",o:["Geographic dispersion","Platform diversity","Least privilege","Journaling"],a:0,e:"Sites must be far enough apart that one disaster doesn't hit both."},
 {q:"What is the difference between RPO and RTO?",o:["RPO is downtime, RTO is data loss","RPO is acceptable data loss, RTO is acceptable downtime","They're the same","RPO applies only to cloud"],a:1,e:"RPO looks back (how much data); RTO looks forward (how long to recover)."},
 {q:"Backups run every 24 hours, but the business can lose only 4 hours of data. Which objective is missed?",o:["RTO","RPO","MTBF","SLA"],a:1,e:"A 24-hour backup interval means up to 24 hours of data loss, failing a 4-hour RPO."},
 {q:"The team discusses how they'd respond to a ransomware attack in a conference room, without touching any systems. What is this?",o:["Failover test","Tabletop exercise","Parallel processing","Simulation with live traffic"],a:1,e:"Tabletop exercises are discussion-based."},
 {q:"The backup payroll system runs alongside production for a month to compare results. What test is this?",o:["Parallel processing","Tabletop","Cold site test","Snapshot"],a:0,e:"Parallel processing runs both systems side by side."},
 {q:"Which backup approach BEST protects against ransomware that targets backup servers?",o:["Snapshots on the same server","Immutable or offline offsite copies","More frequent onsite copies only","Disabling encryption"],a:1,e:"Copies that can't be changed or reached survive ransomware."},
 {q:"What provides power for a few minutes during an outage so systems can shut down or a generator can start?",o:["UPS","PDU","Generator","Load balancer"],a:0,e:"A UPS bridges short gaps."},
 {q:"Which keeps a service running if one web server fails, by spreading requests across several active servers?",o:["Load balancer","Cold site","Journaling","Jump server"],a:0,e:"Load balancing distributes traffic and removes failed nodes."},
 {q:"Using both AWS and Azure so one provider's outage doesn't stop the business is called:",o:["Multi-cloud","Hybrid on-premises","Air gap","SD-WAN"],a:0,e:"Multi-cloud avoids dependence on a single provider."},
 {q:"Which captures the state of a VM at a moment in time so you can roll back after a bad update?",o:["Snapshot","Journaling","Replication","Tabletop"],a:0,e:"Snapshots are point-in-time copies."},
 {q:"A database logs every transaction so it can be restored to the exact moment before corruption. What is this?",o:["Journaling","Snapshot","Mirroring only","Tokenization"],a:0,e:"Journaling records changes for point-in-time recovery."},
 {q:"Capacity planning for resilience considers which three areas?",o:["People, technology, infrastructure","Hot, warm, cold","AH, ESP, IKE","CIA"],a:0,e:"You need enough staff, systems and facilities to handle demand and disruptions."},
 {q:"Which is the MAIN risk of a centralized architecture?",o:["Single point of failure","Too many admins","Inconsistent policies","Data sovereignty"],a:0,e:"If the central point fails, everything that depends on it fails."},
 {q:"A company runs Windows and Linux servers for the same service so one OS flaw can't take it all down. What is this?",o:["Platform diversity","Clustering","Hot site","Air gap"],a:0,e:"Diversity avoids common-mode failures."}
];

registerModule({
  id:"arc",slug:"architecture",title:"Security Architecture",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["shared","models","failmode","appl","ipsec","pickarch","class","states","sites","rpo"],
  viz(){
/* ---- shared responsibility ---- */
(function(){
  const el=$("#viz-shared");
  const L=["Data","Identities and access","Applications","Operating system","Runtime / middleware","Virtualization","Network","Physical hosts","Data center"];
  const M={onprem:["On-premises",9],iaas:["IaaS",4],paas:["PaaS",3],saas:["SaaS",2]};
  const ex={onprem:"You own and secure everything, from the building to the data.",iaas:"Rent virtual machines. You patch the OS and everything above it.",paas:"Deploy code to a managed platform. You secure your app, data and access.",saas:"Use finished software like email. You still own your data and who can access it."};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Shared responsibility: who secures each layer?</div><div class="chips">${Object.entries(M).map(([k,v])=>`<button class="chip" data-m="${k}">${v[0]}</button>`).join("")}</div><div class="scroll"><table class="sr-tbl" id="sr-t"></table></div><div class="legend"><span><i style="background:var(--accent)"></i>You</span><span><i style="background:var(--blue)"></i>Provider</span></div><div class="caption" aria-live="polite">Pick a service model.</div>`;
  function draw(k){const n=M[k][1];el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===k));
    $("#sr-t",el).innerHTML=`<tr><th>Layer</th><th>${M[k][0]}</th></tr>`+L.map((l,i)=>`<tr><td>${l}</td><td class="${i<n?"you":"prov"}">${i<n?"You":"Provider"}</td></tr>`).join("");
    seen.add(k);$(".caption",el).innerHTML=ex[k]+(seen.size===4?' <span class="status-good">Notice that data and access are yours in every model.</span>':"");if(seen.size===4)award("viz:shared",20,"Mapped shared responsibility")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b)draw(b.dataset.m)});
})();

revealViz($("#viz-models"),{title:"Architecture models and their security trade-offs",cols:4,done:"Compared every architecture model",items:[
  ["Infrastructure as code","Cloud","Pro: consistent, reviewable builds. Con: one bad template misconfigures everything. Scan templates before deploying.","vio"],["Serverless","Cloud","Pro: no OS to patch. Con: many small functions, each needing least-privilege permissions.","vio"],["Microservices","App design","Pro: a flaw in one service is contained. Con: many APIs to authenticate and monitor.","vio"],["Containers","Compute","Pro: lightweight, consistent. Con: a kernel exploit can affect every container on the host.","vio"],
  ["Air-gapped network","Isolation","Pro: no network path for attackers. Con: updates and data transfer need removable media, which is its own risk.","def"],["SDN","Network","Pro: central, programmable control. Con: the controller is a high-value target.","vio"],["ICS / SCADA","Industrial","Availability and safety first. Often legacy, hard to patch. Segment heavily.","atk"],["Embedded / RTOS","Devices","Strict timing, limited compute, rarely patched. Compensating controls are the norm.","atk"],
  ["IoT","Devices","Weak defaults, long lifespans. Put them on their own network segment.","atk"],["On-premises","Ownership","Full control and full responsibility for power, hardware and physical security.","vio"],["Hybrid cloud","Mixed","Policies must be consistent across environments, or gaps appear between them.","vio"],["Decentralized","Control","No single point of failure, but harder to keep policies consistent.","vio"]]});

quizViz($("#viz-failmode"),{title:"Fail-open or fail-closed?",done:"Chose every failure mode",qs:[
  ["Inline IPS protecting a bank's payment API.",["Fail-open","Fail-closed"],1,"Payments must not flow uninspected. Security wins."],
  ["Door locks on a stairwell exit during a fire alarm.",["Fail-open","Fail-closed"],0,"Life safety: doors must open so people can escape."],
  ["Web content filter for a hospital's clinical systems that need constant access.",["Fail-open","Fail-closed"],0,"Clinicians need access even if the filter breaks."],
  ["Firewall in front of a classified research database.",["Fail-open","Fail-closed"],1,"Confidentiality matters more than uptime here."],
  ["Badge reader on the data center's server room door (not a fire exit).",["Fail-open","Fail-closed"],1,"Keep the secure area locked if the reader fails."]]});

revealViz($("#viz-appl"),{title:"Network appliances: placement and purpose",cols:4,done:"Reviewed every network appliance",items:[
  ["Jump server","Management zone","Admins connect here first, with MFA and session recording, then reach internal systems.","def"],["Forward proxy","Between users and internet","Filters and logs user web traffic and can cache content.","def"],["Reverse proxy","In front of web servers","Terminates TLS, hides server details and can load balance.","def"],["WAF","In front of web apps","Inspects HTTP for SQLi, XSS and other app attacks.","def"],
  ["IPS (inline)","Active","Sits in the traffic path and drops attacks. Decide its failure mode.","def"],["IDS (tap)","Passive","Watches a copy of traffic and alerts. Can't block anything itself.","vio"],["Load balancer","In front of server pools","Spreads requests and removes failed servers from rotation.","vio"],["Sensor","Anywhere","Collects traffic or events and feeds them to a SIEM or NDR platform.","vio"],
  ["UTM","Small office edge","Firewall, IPS, AV, filtering and VPN in one box. Simple, but a single point of failure.","def"],["NGFW","Network edge or core","Application-aware rules, user identity and built-in IPS.","def"],["Layer 4 firewall","Edge","Filters on IPs and ports only. Fast but blind to applications.","vio"],["802.1X switch","Access layer","Keeps the port closed until the device authenticates with EAP through RADIUS.","def"]]});

seqViz($("#viz-ipsec"),{title:"IPsec site-to-site tunnel",left:"Branch firewall",right:"HQ firewall",intro:"Two offices build an IPsec tunnel over the internet.",
  steps:[{dir:"r",label:"IKE phase 1",sub:"Authenticate peers, build a secure channel",text:"The firewalls authenticate each other with certificates or a pre-shared key and agree on a secure management channel."},
         {dir:"l",label:"IKE phase 2",sub:"Negotiate the IPsec SAs",text:"They agree on how to protect the actual traffic: ESP with AES-256 and SHA-256."},
         {dir:"r",label:"ESP · tunnel mode",sub:"Whole original packet encrypted",text:"Each packet from the branch is wrapped whole inside a new packet. Even the internal IP addresses are hidden."},
         {dir:"l",label:"ESP · tunnel mode",sub:"Reply, also encrypted",text:"Replies are protected the same way. AH alone would prove integrity but leave the data readable."}],
  end:"ESP encrypts, AH doesn't. Tunnel mode for site-to-site, transport mode for host-to-host."});

quizViz($("#viz-pickarch"),{title:"Pick the architecture",done:"Picked every architecture",qs:[
  ["1,200 staff work from home and coffee shops. Security wants consistent web filtering and zero trust access without backhauling traffic to HQ.",["SASE","Site-to-site IPsec","Air gap"],0,"SASE delivers security from the cloud, near the user."],
  ["30 retail stores with broadband and LTE need reliable, centrally managed links to HQ.",["SD-WAN","Cold site","WAF"],0,"SD-WAN manages and steers traffic across multiple links."],
  ["A water treatment plant's controllers must never be reachable from the internet.",["Air gap / strict segmentation","Split tunnel","SaaS"],0,"Isolate industrial controls physically or with strict segmentation."],
  ["A 6-person office wants one affordable box for firewall, VPN and antivirus.",["UTM","SDN controller","HSM"],0,"A UTM combines functions for small sites."]]});

sortViz($("#viz-class"),{title:"Classify each piece of data",bins:{pub:"Public",conf:"Confidential",rest:"Restricted",crit:"Critical"},
  items:[["Published annual report","pub","Released to the public."],["Unreleased merger plans","rest","Very few people may know, with severe damage if leaked."],["Employee salary list","conf","Sensitive internal data with limited access."],["Domain controller backups","crit","Essential to keep the business running."],["Job postings on the website","pub","Meant for anyone."],["Source code for the flagship product","rest","Intellectual property with strict need-to-know."],["Customer contact list","conf","Internal, privacy-sensitive data."],["Payment processing system config","crit","Operations stop without it."]],done:"Classified every data item",intro:"Labels vary by organization. These follow a common commercial scheme."});

/* ---- data states ---- */
(function(){
  const el=$("#viz-states");
  const S2={rest:["At rest","💾","Stored on laptops, servers, databases and backups.",["Full-disk encryption (BitLocker, FileVault)","Database and file encryption","Permission restrictions","Tokenization in the database"]],
    transit:["In transit","📡","Crossing a network: browser to server, office to office, app to API.",["TLS 1.2/1.3 for web and APIs","IPsec or VPN tunnels","SSH/SFTP for admin and files","Email encryption (S/MIME)"]],
    use:["In use","🧠","Decrypted in memory while an app processes it.",["Secure enclaves and trusted execution","Strict access control and least privilege","Data masking on screens","Memory protection (ASLR, DEP)"]]};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Data states: one customer record's journey</div><div class="resp-row" style="grid-template-columns:repeat(3,1fr)">${Object.entries(S2).map(([k,v])=>`<button class="rv-c" data-s="${k}"><span class="s-small">${v[1]}</span><b>${v[0]}</b></button>`).join("")}</div><div class="caption" aria-live="polite">Tap each state to see how it's protected.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b)return;const v=S2[b.dataset.s];seen.add(b.dataset.s);el.querySelectorAll("[data-s]").forEach(x=>{x.classList.toggle("sel",x===b);if(seen.has(x.dataset.s))x.classList.add("seen")});
    $(".caption",el).innerHTML=`<b>${v[0]}.</b> ${v[2]}<ul style="margin:6px 0 0">${v[3].map(x=>`<li>${x}</li>`).join("")}</ul>`;if(seen.size===3)award("viz:states",20,"Protected data in every state")});
})();

revealViz($("#viz-sites"),{title:"Recovery sites compared",cols:3,done:"Compared every recovery site",items:[
  ["Hot site","Minutes to hours","Fully equipped, running and replicated. Switch over almost immediately. Highest cost.","def"],["Warm site","Hours to days","Hardware and connectivity ready. Restore recent backups, then go live. Middle cost.","vio"],["Cold site","Days to weeks","Empty space with power and cooling. Buy, ship and configure everything. Lowest cost.","atk"],
  ["Cloud recovery","Varies","Spin up infrastructure on demand. Can act hot or warm depending on what you pre-build.","vio"],["Geographic dispersion","Distance","Far enough apart that one hurricane, flood or grid failure can't hit both sites.","def"],["Multi-cloud","Provider diversity","Avoids a single provider outage taking everything down, at the cost of complexity.","vio"]]});

/* ---- RPO / RTO timeline ---- */
(function(){
  const el=$("#viz-rpo");const REQ={rpo:4,rto:8};const SITE={hot:[1,"Hot site",3],warm:[12,"Warm site",2],cold:[96,"Cold site",1]};
  let freq=24,site="cold";
  el.innerHTML=`<div class="viz-title">Meet the objectives: RPO 4 hours, RTO 8 hours</div>
  <div class="rng-row"><span>Backup every</span><input type="range" min="1" max="24" value="24" aria-label="Backup interval in hours"><b id="rp-f">24 h</b></div>
  <div class="chips">${Object.entries(SITE).map(([k,v])=>`<button class="chip" data-s="${k}">${v[1]}</button>`).join("")}</div>
  <div class="tl"><div class="ln"></div><div class="seg rpo" id="rp-a"></div><div class="seg rto" id="rp-b"></div><div class="pt dn r" id="rp-p1">last backup</div><div class="pt up" style="left:50%">💥 disaster</div><div class="pt dn l" id="rp-p2">back online</div></div>
  <div class="legend"><span><i style="background:rgba(255,115,147,.6)"></i>Data lost (RPO)</span><span><i style="background:rgba(255,210,122,.6)"></i>Downtime (RTO)</span></div>
  <div class="kv" id="rp-kv"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const rt=SITE[site][0],scale=h=>Math.min(48,h)/48*50;
    el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===site));$("#rp-f",el).textContent=freq+" h";
    const a=scale(freq),b2=scale(rt);$("#rp-a",el).style.cssText=`left:${50-a}%;width:${a}%`;$("#rp-b",el).style.cssText=`left:50%;width:${b2}%`;$("#rp-p1",el).style.left=(50-a)+"%";$("#rp-p2",el).style.left=(50+b2)+"%";$("#rp-p1",el).className="pt dn "+(50-a<22?"l":"r");$("#rp-p2",el).className="pt dn "+(50+b2>78?"r":"l");
    const okP=freq<=REQ.rpo,okT=rt<=REQ.rto;
    $("#rp-kv",el).innerHTML=`<span>Worst-case data loss</span><b class="${okP?"status-good":"status-bad"}">${freq} h ${okP?"✓":"✗ (needs ≤ 4 h)"}</b><span>Time to recover</span><b class="${okT?"status-good":"status-bad"}">${rt} h ${okT?"✓":"✗ (needs ≤ 8 h)"}</b><span>Relative cost</span><b>${"$".repeat(SITE[site][2])}</b>`;
    $(".caption",el).innerHTML=okP&&okT?'<span class="status-good">Both objectives met.</span> Backup frequency controls RPO, and the recovery site controls RTO.':!okP?"Backups aren't frequent enough. The RPO is how far back in time you'd lose data.":"The site takes too long to bring online. The RTO is how long you can be down.";
    if(okP&&okT)award("viz:rpo",30,"Met the RPO and RTO")}
  $("input",el).addEventListener("input",e=>{freq=+e.target.value;draw()});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(b){site=b.dataset.s;draw()}});draw();
})();
  },
  sims:[
    {id:"place",type:"match",title:"Place the security devices",
      scenario:"You're designing the network for a new online store. Match each device to where it belongs.",
      items:[["WAF","waf"],["Load balancer","lb"],["NGFW","fw"],["IDS sensor on a SPAN port","ids"],["Jump server","jump"],["Forward proxy","proxy"]],
      slots:[["waf","Position 1","Directly in front of the storefront web app, inspecting HTTP"],["lb","Position 2","Spreading customer requests across three web servers"],["fw","Position 3","At the internet edge, with application-aware rules"],["ids","Position 4","Watching a copy of core switch traffic without being inline"],["jump","Position 5","The only path admins use to reach the database servers"],["proxy","Position 6","Between employee browsers and the internet, filtering sites"]],
      success:"Every device is placed where it can see what it needs to and do its job."},
    {id:"ics",type:"check",title:"Secure the factory floor",
      scenario:"A manufacturer's ICS/SCADA network controls robotic welders. The PLCs run an RTOS and can't be patched. Select every appropriate control.",
      opts:[["Put the ICS network in its own segment with a firewall between it and the corporate LAN",1],["Allow only the specific protocols and hosts the HMI needs (allow list)",1],["Use a jump server with MFA for engineers' remote maintenance",1],["Deploy a passive IDS that understands industrial protocols",1],["Make the IPS in front of the PLCs fail-open so production isn't halted by an appliance failure",1],["Give the PLCs public IP addresses for vendor support",0],["Install standard desktop antivirus directly on each PLC",0],["Bridge the ICS network to guest Wi-Fi for convenience",0],["Rely on the PLC vendor's default passwords",0]],
      success:"Segmented, allow-listed, monitored and maintained through a controlled path. That's how you protect systems you can't patch."},
    {id:"site",type:"choice",title:"Plan disaster recovery",
      scenario:"A regional bank's leadership asks you to plan disaster recovery. Requirements: online banking must be back within 2 hours, losing no more than 15 minutes of transactions.",
      steps:[
        ["Which recovery site meets a 2-hour RTO?",["Cold site","Warm site","Hot site","No site; restore to new hardware"],2,"Only a hot site can be running within 2 hours."],
        ["How do you meet a 15-minute RPO?",["Nightly tape backups","Continuous replication to the hot site plus journaling","Weekly full backups","Monthly snapshots"],1,"Replication and journaling keep loss to minutes."],
        ["The CFO suggests a backup site in the same office park to save on travel. Your response?",["Agree, it's cheaper","Recommend geographic dispersion so one disaster can't hit both","Use the same building, different floor","Skip the backup site"],1,"Sites need distance between them."],
        ["Ransomware could encrypt replicated data too. What else do you add?",["Nothing","Immutable, offline backups on a separate schedule","Faster replication","A bigger UPS"],1,"Replication copies corruption instantly. Immutable or offline copies survive it."],
        ["How should the plan be validated first, without risking production?",["A tabletop exercise","Pull the plug on production","Wait for a real disaster","Ask the vendor"],0,"Start with a tabletop, then progress to failover tests."]],
      success:"The plan meets the RTO and RPO, survives regional disasters and ransomware, and gets tested."},
    {id:"states",type:"match",title:"Protect data in every state",
      scenario:"A healthcare app handles patient data in several places. Match each situation to the best protection.",
      items:[["Full-disk encryption","fde"],["TLS 1.3","tls"],["Secure enclave","enc"],["Tokenization","tok"],["Data masking","mask"],["Geographic restriction","geo"]],
      slots:[["fde","At rest","Clinicians' laptops could be stolen from cars"],["tls","In transit","The mobile app sends records to the API"],["enc","In use","Records are decrypted in memory for an analytics job"],["tok","At rest","Billing needs card numbers kept out of the main database"],["mask","In use","Call-center staff only need the last 4 digits of an ID"],["geo","Sovereignty","Records of EU patients must stay in EU regions"]],
      success:"Each state and requirement has a matching protection."}
  ],
  badges:[
    ["reader","AR","Architect","Mark all 5 architecture lessons studied",c=>c.allStudied()],
    ["lab","BP","Blueprint","Complete all 10 diagrams in this module",c=>c.vizAll()],
    ["shared","SR","Shared Duty","Compare all four cloud responsibility models",c=>c.earned("viz:shared")],
    ["rpo","RP","Recovery Point","Meet the RPO and RTO in the recovery timeline",c=>c.earned("viz:rpo")],
    ["place","DD","Defense in Depth","Pass the device placement simulation",c=>c.passed("place")],
    ["ics","OT","Plant Protector","Pass the ICS security simulation",c=>c.passed("ics")],
    ["dr","DR","Disaster Ready","Pass the disaster recovery simulation",c=>c.passed("site")],
    ["perfect","FP","Fortress","Score 100% on an architecture quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
