/* ================= Module 1: General Security Concepts (SY0-701 Domain 1.0, 12%) ================= */
(function(){
const LESSONS=[
{id:"controls",num:"1.1",title:"Security control categories and types",html:`
<p>Every safeguard on the exam can be described two ways: by its <b>category</b> (what kind of thing it is) and by its <b>type</b> (what it does).</p>
<h3>Four categories</h3>
<ul><li><b>Technical</b> (logical): implemented in hardware or software. Firewalls, encryption, antivirus, access control lists.</li>
<li><b>Managerial</b> (administrative): policies and planning that direct how security is run. Risk assessments, security policies, onboarding procedures.</li>
<li><b>Operational</b>: carried out by people day to day. Security guards, awareness training, change reviews, log reviews.</li>
<li><b>Physical</b>: protect the facility and hardware. Fences, locks, badge readers, lighting, bollards.</li></ul>
<div class="viz" id="viz-ccat"></div>
<h3>Six types</h3>
<ul><li><b>Preventive</b>: stops an incident before it happens (a firewall rule, a locked door).</li>
<li><b>Deterrent</b>: discourages an attacker without physically stopping them (a warning sign, a visible camera).</li>
<li><b>Detective</b>: identifies an incident during or after it happens (an IDS, log review, motion sensor).</li>
<li><b>Corrective</b>: limits damage and restores normal operation (restoring from backup, reimaging a host).</li>
<li><b>Compensating</b>: an alternative when the primary control isn't possible (isolating a legacy server that can't be patched).</li>
<li><b>Directive</b>: tells people what to do (a policy, a "Do not enter" sign, a required procedure).</li></ul>
<div class="tip"><b>Exam tip.</b> One control can have more than one type. A visible camera is a deterrent, and its recordings make it detective. Read the question for what the control is being used for.</div>
<div class="viz" id="viz-ctype"></div>`},
{id:"cia",num:"1.2",title:"CIA, non-repudiation, AAA and gap analysis",html:`
<h3>The CIA triad</h3>
<ul><li><b>Confidentiality</b>: only authorized people can read the data. Encryption, access controls, MFA.</li>
<li><b>Integrity</b>: data is not changed without detection. Hashing, digital signatures, certificates.</li>
<li><b>Availability</b>: systems and data are there when needed. Redundancy, patching, backups, DDoS protection.</li></ul>
<p><b>Non-repudiation</b> means someone can't deny an action they took. A <b>digital signature</b> provides it, because only the holder of the private key could have produced it.</p>
<div class="viz" id="viz-ciasort"></div>
<h3>AAA</h3>
<ul><li><b>Authentication</b>: proving who you are (password, certificate, biometrics). Systems and devices authenticate too, often with certificates.</li>
<li><b>Authorization</b>: what you're allowed to do once you're in. Authorization models include role-based, attribute-based and rule-based access.</li>
<li><b>Accounting</b>: recording what you did (logs of logins, commands, data transferred).</li></ul>
<p>AAA is often delivered by a <b>RADIUS</b> or <b>TACACS+</b> server sitting behind a VPN concentrator, switch or wireless controller.</p>
<div class="viz" id="viz-aaa"></div>
<h3>Gap analysis</h3>
<p>A <b>gap analysis</b> compares where security is today with where it should be, usually against a framework such as NIST or ISO/IEC 27001. The output lists missing controls and a plan to close each gap.</p>`},
{id:"zerotrust",num:"1.3",title:"Zero trust",html:`
<p><b>Zero trust</b> drops the idea of a trusted inside network. Every request is authenticated, authorized and checked, every time, no matter where it comes from. "Never trust, always verify."</p>
<h3>Control plane</h3>
<ul><li><b>Adaptive identity</b>: the decision changes with context, such as location, device health and time of day.</li>
<li><b>Threat scope reduction</b>: limit how far an attacker can get by granting access only to the specific resource needed.</li>
<li><b>Policy-driven access control</b>: rules define who gets what, under what conditions.</li>
<li><b>Policy engine</b>: evaluates the request against policy and decides grant, deny or revoke.</li>
<li><b>Policy administrator</b>: carries out the decision, telling the enforcement point to open or close the session.</li>
<li>Together, the policy engine and policy administrator form the <b>policy decision point (PDP)</b>.</li></ul>
<h3>Data plane</h3>
<ul><li><b>Implicit trust zones</b>: the area past the enforcement point, where traffic is trusted only after it's been checked.</li>
<li><b>Subject/system</b>: the user or device asking for access.</li>
<li><b>Policy enforcement point (PEP)</b>: the gatekeeper that allows, monitors and ends connections.</li></ul>
<div class="viz" id="viz-zt"></div>`},
{id:"physical",num:"1.4",title:"Physical security and deception",html:`
<h3>Physical controls</h3>
<ul><li><b>Bollards</b>: posts that stop vehicles from reaching a building.</li>
<li><b>Access control vestibule</b> (mantrap): two doors where only one opens at a time, stopping tailgating.</li>
<li><b>Fencing</b>, <b>lighting</b> and <b>security guards</b> deter and detect.</li>
<li><b>Video surveillance</b>: cameras that record and can use motion or object detection.</li>
<li><b>Access badges</b>: track who entered and when.</li>
<li><b>Sensors</b>: <b>infrared</b> (body heat), <b>pressure</b> (weight on a floor or window), <b>microwave</b> (movement over a wide area) and <b>ultrasonic</b> (sound wave reflections).</li></ul>
<div class="viz" id="viz-phys"></div>
<h3>Deception and disruption</h3>
<ul><li><b>Honeypot</b>: a decoy system that looks valuable. Any connection to it is suspicious.</li>
<li><b>Honeynet</b>: a network of honeypots.</li>
<li><b>Honeyfile</b>: a decoy file, such as "passwords.xlsx", that alerts when opened.</li>
<li><b>Honeytoken</b>: fake data, such as a dummy API key or fake customer record, that alerts if it's ever used or shows up somewhere it shouldn't.</li></ul>`},
{id:"change",num:"1.5",title:"Change management",html:`
<p>Uncontrolled changes cause outages and open security holes. <b>Change management</b> makes every change planned, approved, tested and reversible.</p>
<h3>Business processes</h3>
<ul><li><b>Approval process</b>, usually through a <b>change advisory board (CAB)</b>.</li>
<li><b>Ownership</b>: someone is accountable for each change. <b>Stakeholders</b> are the people affected.</li>
<li><b>Impact analysis</b>: what could break, and how badly.</li>
<li><b>Test results</b> from a sandbox before production.</li>
<li><b>Backout plan</b>: how to undo the change if it fails.</li>
<li><b>Maintenance window</b>: a scheduled time with the least business impact.</li>
<li><b>Standard operating procedure</b>: the written, repeatable steps.</li></ul>
<h3>Technical implications</h3>
<p>Changes can be blocked by <b>allow lists and deny lists</b>, involve <b>restricted activities</b>, require <b>downtime</b> or <b>service and application restarts</b>, break <b>legacy applications</b> and create <b>dependencies</b>. Afterward, update diagrams, policies and procedures (<b>documentation</b>) and use <b>version control</b>.</p>
<div class="viz" id="viz-cm"></div>`},
{id:"crypto",num:"1.6",title:"Encryption: symmetric, asymmetric and key exchange",html:`
<h3>Symmetric encryption</h3>
<p>One shared key encrypts and decrypts. It's fast, so it's used for bulk data. The problem is getting the key to the other side safely. Examples: <b>AES</b> (the standard today), 3DES (legacy), ChaCha20.</p>
<h3>Asymmetric encryption</h3>
<p>A <b>key pair</b>: what one key encrypts, only the other can decrypt. You share the <b>public key</b> with everyone and guard the <b>private key</b>. It's slow, so it's used for small things: key exchange and signatures. Examples: <b>RSA</b>, <b>ECC</b> (elliptic curve, smaller keys for the same strength), <b>Diffie-Hellman</b> (key agreement).</p>
<ul><li>Encrypt <b>to</b> someone with <b>their public key</b>. Only their private key can decrypt it.</li>
<li>Sign with <b>your private key</b>. Anyone can verify with your public key.</li></ul>
<h3>Key exchange and key length</h3>
<p>TLS uses both. Asymmetric crypto agrees on a <b>session key</b>, then symmetric crypto encrypts the data. Longer keys are stronger: AES-256 is stronger than AES-128, and RSA needs about 2048 bits or more. <b>Key stretching</b> (PBKDF2, bcrypt) makes weak passwords harder to brute-force.</p>
<p><b>Encryption levels</b>: full-disk, partition, volume, file, database and record. <b>Transport encryption</b> (TLS, IPsec, VPN) protects data in transit.</p>
<div class="viz" id="viz-tls"></div>
<div class="viz" id="viz-keypick"></div>`},
{id:"hashing",num:"1.7",title:"Hashing, salting and digital signatures",html:`
<p>A <b>hash</b> is a fixed-length fingerprint of data. It's one-way: you can't turn a hash back into the data. Change one bit of the input and the hash changes completely (the <b>avalanche effect</b>).</p>
<ul><li><b>SHA-256</b> is a common secure hash. <b>MD5</b> and <b>SHA-1</b> are broken because attackers can create <b>collisions</b> (two inputs with the same hash).</li>
<li>Hashes verify <b>integrity</b>: compare the hash of a download with the one the vendor published.</li>
<li>Passwords are stored as hashes, never in plain text.</li></ul>
<div class="viz" id="viz-hash"></div>
<h3>Salting</h3>
<p>A <b>salt</b> is random data added to each password before hashing. Two users with the same password get different hashes, which defeats <b>rainbow tables</b> (precomputed hash lists).</p>
<h3>Digital signatures</h3>
<p>The sender hashes the message and encrypts the hash with their <b>private key</b>. The receiver decrypts it with the sender's <b>public key</b> and compares it to their own hash of the message. A match proves <b>integrity</b>, <b>authentication</b> and <b>non-repudiation</b>.</p>
<div class="viz" id="viz-sig"></div>`},
{id:"pki",num:"1.8",title:"PKI and certificates",html:`
<p>A <b>public key infrastructure (PKI)</b> lets you trust that a public key really belongs to who it says.</p>
<ul><li><b>Certificate authority (CA)</b>: signs certificates. A <b>root CA</b> is trusted by your OS or browser. <b>Intermediate CAs</b> do the day-to-day signing so the root can stay offline.</li>
<li><b>Certificate signing request (CSR)</b>: you generate a key pair and send the CA a CSR containing your public key and details.</li>
<li><b>Self-signed certificate</b>: signed by its own key, so nobody vouches for it. <b>Third-party</b> certificates are signed by a public CA.</li>
<li><b>Wildcard</b> (*.example.com) covers all subdomains one level down. <b>Subject alternative name (SAN)</b> lists several names on one certificate.</li>
<li><b>Revocation</b>: a <b>certificate revocation list (CRL)</b> is a list of revoked serial numbers. <b>OCSP</b> checks one certificate's status in real time. <b>OCSP stapling</b> has the server attach a recent OCSP response.</li>
<li><b>Key escrow</b>: a trusted third party holds a copy of keys for recovery.</li>
<li><b>Root of trust</b>: the anchor everything else is verified against, such as a root CA or a TPM.</li></ul>
<div class="viz" id="viz-cert"></div>`},
{id:"tools",num:"1.9",title:"Crypto tools and obfuscation",html:`
<h3>Where keys live</h3>
<ul><li><b>TPM (Trusted Platform Module)</b>: a chip on the motherboard that stores keys, supports secure boot and full-disk encryption like BitLocker.</li>
<li><b>HSM (hardware security module)</b>: a dedicated, tamper-resistant device for generating and storing keys at scale, such as a CA's signing keys.</li>
<li><b>Key management system</b>: software or a cloud service that creates, rotates and revokes keys centrally.</li>
<li><b>Secure enclave</b>: an isolated area of a processor that protects data even if the OS is compromised.</li></ul>
<h3>Obfuscation</h3>
<ul><li><b>Steganography</b>: hiding data inside another file, such as an image.</li>
<li><b>Tokenization</b>: replacing sensitive data with a random token that maps back to it in a secure vault. Common for credit card numbers.</li>
<li><b>Data masking</b>: hiding part of the data, such as showing only the last four digits.</li></ul>
<h3>Other</h3>
<p><b>Blockchain</b> is a distributed, append-only ledger where each block contains the hash of the one before, so tampering is obvious. An <b>open public ledger</b> lets anyone verify it.</p>
<div class="viz" id="viz-tools"></div>
<div class="viz" id="viz-mask"></div>`}
];

const G={
 controls:[["Technical control","Implemented in hardware or software: firewall, encryption, antivirus"],["Managerial control","Administrative policy and planning: risk assessment, security policy"],["Operational control","Done by people day to day: guards, awareness training"],["Physical control","Protects the facility: fences, locks, bollards"],["Preventive control","Stops an incident before it happens"],["Deterrent control","Discourages an attack without stopping it: warning sign"],["Detective control","Identifies an incident: IDS, log review, motion sensor"],["Corrective control","Limits damage and restores: backup restore, reimage"],["Compensating control","Alternative when the primary control isn't possible"],["Directive control","Tells people what to do: policy, signage"],["Gap analysis","Compares current security to a target framework"],["Confidentiality","Only authorized people can read data"],["Integrity","Data isn't altered without detection"],["Availability","Systems are up and reachable when needed"],["Non-repudiation","Can't deny an action; provided by digital signatures"],["Authentication","Proving identity"],["Authorization","What you're allowed to do"],["Accounting","Recording what you did"],["Zero trust","Never trust, always verify; no implicit trusted network"],["Policy engine","Zero trust: decides grant, deny or revoke"],["Policy administrator","Zero trust: carries out the decision, signals the PEP"],["Policy decision point","Policy engine + policy administrator"],["Policy enforcement point","Zero trust gatekeeper that allows or ends sessions"],["Adaptive identity","Access decisions that use context such as location and device health"],["Threat scope reduction","Limit access to only the needed resource"],["Implicit trust zone","Area past the PEP where checked traffic flows"]],
 physical:[["Bollards","Posts that stop vehicles"],["Access control vestibule","Two-door entry where one opens at a time; stops tailgating"],["Infrared sensor","Detects body heat"],["Pressure sensor","Detects weight on a surface"],["Microwave sensor","Detects movement over a wide area"],["Ultrasonic sensor","Detects movement through sound reflections"],["Honeypot","Decoy system to attract attackers"],["Honeynet","A network of honeypots"],["Honeyfile","Decoy file that alerts when opened"],["Honeytoken","Fake data that alerts when used"],["Change advisory board","Group that approves changes"],["Backout plan","How to undo a failed change"],["Maintenance window","Scheduled time for changes with least impact"],["Impact analysis","Assessing what a change could break"],["Version control","Tracks every change to code or configuration"]],
 crypto:[["Symmetric encryption","One shared key; fast; bulk data (AES)"],["Asymmetric encryption","Public/private key pair; slow; key exchange and signatures"],["AES","Standard symmetric cipher; 128, 192 or 256-bit keys"],["RSA","Asymmetric algorithm; 2048+ bit keys"],["ECC","Asymmetric with smaller keys for the same strength"],["Diffie-Hellman","Key agreement over an untrusted network"],["Encrypt to someone","Use their public key"],["Sign a message","Use your own private key"],["Session key","Symmetric key agreed during TLS for bulk data"],["Key stretching","Repeated hashing to slow brute force: PBKDF2, bcrypt"],["Hash","One-way fixed-length fingerprint of data"],["Avalanche effect","Tiny input change, completely different hash"],["Collision","Two inputs with the same hash; breaks MD5, SHA-1"],["SHA-256","Common secure hashing algorithm"],["Salt","Random data added before hashing; defeats rainbow tables"],["Rainbow table","Precomputed list of hashes for common passwords"],["Digital signature","Hash encrypted with the sender's private key"],["Digital signature proves","Integrity, authentication, non-repudiation"],["Full-disk encryption","Encrypts the whole drive, e.g. BitLocker"],["Transport encryption","Protects data in transit: TLS, IPsec, VPN"]],
 pki:[["PKI","System of CAs and certificates that binds public keys to identities"],["Root CA","Top of the chain, trusted by the OS; kept offline"],["Intermediate CA","Signs certificates on behalf of the root"],["CSR","Certificate signing request: your public key + details sent to a CA"],["Self-signed certificate","Signed by its own key; not trusted by default"],["Wildcard certificate","*.example.com covers one subdomain level"],["SAN","Subject alternative name: many names on one certificate"],["CRL","Certificate revocation list"],["OCSP","Online Certificate Status Protocol: real-time revocation check"],["OCSP stapling","Server attaches a signed OCSP response to the handshake"],["Key escrow","Third party holds keys for recovery"],["Root of trust","Trusted anchor everything is verified against"],["TPM","Motherboard chip storing keys; secure boot, BitLocker"],["HSM","Tamper-resistant appliance for key generation and storage"],["Key management system","Central service to create, rotate and revoke keys"],["Secure enclave","Isolated processor area protecting data from the OS"],["Steganography","Hiding data inside another file"],["Tokenization","Replace sensitive data with a token mapped in a vault"],["Data masking","Hide part of the data, e.g. last 4 digits shown"],["Blockchain","Append-only ledger; each block holds the previous block's hash"],["Open public ledger","Blockchain anyone can read and verify"]]
};
const DECKS=[["controls","Controls and zero trust"],["physical","Physical and change"],["crypto","Cryptography"],["pki","PKI and tools"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A company installs a firewall that blocks inbound RDP. What category and type of control is this?",o:["Technical, preventive","Managerial, detective","Physical, deterrent","Operational, corrective"],a:0,e:"A firewall is a technical control, and blocking traffic before it arrives is preventive."},
 {q:"Which is an example of a managerial control?",o:["A risk assessment","A security guard","A motion sensor","Antivirus software"],a:0,e:"Managerial (administrative) controls are policy and planning, such as risk assessments."},
 {q:"A sign at a data center door reads \"Authorized personnel only. Violators will be prosecuted.\" Which control type is this mainly?",o:["Corrective","Deterrent","Compensating","Detective"],a:1,e:"It discourages the attempt without physically stopping anyone, so it's a deterrent. Signs can also be directive."},
 {q:"A legacy medical device can't be patched, so it's moved to an isolated VLAN with strict firewall rules. What type of control is the isolation?",o:["Compensating","Directive","Deterrent","Preventive only"],a:0,e:"It's an alternative to the control you'd normally apply (patching), so it's compensating."},
 {q:"After ransomware hits, an administrator restores the file server from last night's backup. What type of control is this?",o:["Detective","Corrective","Deterrent","Directive"],a:1,e:"Restoring after an incident limits damage and returns to normal operation: corrective."},
 {q:"Which control is detective?",o:["Door lock","IDS alert on a port scan","Acceptable use policy","Encryption"],a:1,e:"An IDS identifies an attack in progress. It doesn't stop it, so it's detective."},
 {q:"Security awareness training for all staff is which category of control?",o:["Technical","Physical","Operational","Managerial"],a:2,e:"Training is carried out by people as part of daily operations. Some sources call it managerial, but CompTIA lists awareness programs as operational."},
 {q:"Which security goal is MOST directly protected by hashing?",o:["Confidentiality","Integrity","Availability","Authorization"],a:1,e:"A hash shows whether data has changed, which is integrity."},
 {q:"A sender wants to prove they sent a contract and can't later deny it. What provides this?",o:["Symmetric encryption","A digital signature","A salt","Data masking"],a:1,e:"Only the private key holder can create the signature, giving non-repudiation."},
 {q:"In AAA, logging the commands an administrator ran on a router is which function?",o:["Authentication","Authorization","Accounting","Auditing the CA"],a:2,e:"Accounting records what users did."},
 {q:"A user logs in with a password and is then allowed to edit only the HR folder. Being allowed to edit the HR folder is which function?",o:["Authentication","Authorization","Accounting","Non-repudiation"],a:1,e:"Authorization decides what an authenticated identity can do."},
 {q:"An organization compares its current controls with the NIST Cybersecurity Framework to find what's missing. What is this?",o:["Penetration test","Gap analysis","Tabletop exercise","Business impact analysis"],a:1,e:"A gap analysis compares the current state with a target framework."},
 {q:"In a zero trust architecture, which component decides whether to grant access?",o:["Policy enforcement point","Policy engine","Implicit trust zone","Subject"],a:1,e:"The policy engine makes the decision. The policy administrator carries it out and the PEP enforces it."},
 {q:"Which zero trust component sits in the data plane and allows or terminates the connection?",o:["Policy administrator","Policy engine","Policy enforcement point","Policy decision point"],a:2,e:"The PEP is the gatekeeper in the data plane."},
 {q:"A zero trust system denies access because a user's laptop is missing patches, even though their password is correct. Which concept does this show?",o:["Implicit trust","Adaptive identity","Key escrow","Defense in depth"],a:1,e:"Adaptive identity uses context such as device health and location in each decision."},
 {q:"Which principle is the core of zero trust?",o:["Trust the internal network","Never trust, always verify","Encrypt only data at rest","Allow by default"],a:1,e:"Zero trust removes implicit trust based on network location."},
 {q:"Which physical control prevents tailgating into a server room?",o:["Bollards","Access control vestibule","Fencing","Lighting"],a:1,e:"A vestibule (mantrap) lets one person through at a time."},
 {q:"Which physical control is designed to stop a vehicle from ramming a building entrance?",o:["Bollards","Pressure sensor","Badge reader","Vestibule"],a:0,e:"Bollards are short, strong posts that stop vehicles."},
 {q:"A sensor that detects body heat in a dark warehouse is which type?",o:["Ultrasonic","Microwave","Infrared","Pressure"],a:2,e:"Infrared sensors detect heat."},
 {q:"A security team places a file named \"Q4-payroll-passwords.xlsx\" on a share. Opening it triggers an alert. What is this?",o:["Honeynet","Honeyfile","Honeytoken","Steganography"],a:1,e:"A honeyfile is a decoy file that alerts when accessed."},
 {q:"A fake AWS access key is planted in a code repository. If anyone tries to use it, the security team is alerted. What is it?",o:["Honeytoken","Honeypot","Wildcard certificate","Tokenization"],a:0,e:"A honeytoken is fake data whose use signals compromise."},
 {q:"Which change management element describes how to return to the previous state if a change fails?",o:["Impact analysis","Backout plan","Maintenance window","Ownership"],a:1,e:"The backout plan is the undo procedure."},
 {q:"Who typically approves a significant change to production systems?",o:["The end user","The change advisory board","The CA","The policy engine"],a:1,e:"A CAB reviews and approves changes."},
 {q:"A firewall rule change is scheduled for Sunday 2 a.m. when traffic is lowest. What is this time called?",o:["Backout plan","Maintenance window","SLA","Recovery point"],a:1,e:"A maintenance window is the scheduled low-impact time for changes."},
 {q:"A patch requires restarting a database that a payment app depends on. Which technical implication is this?",o:["Dependencies and service restart","Allow list","Steganography","Version control"],a:0,e:"Changes can force restarts and affect dependent applications."},
 {q:"Which encryption type uses the same key to encrypt and decrypt?",o:["Asymmetric","Symmetric","Hashing","Digital signature"],a:1,e:"Symmetric uses one shared key."},
 {q:"Alice wants to send Bob a message only Bob can read. Which key does she encrypt it with?",o:["Alice's private key","Alice's public key","Bob's public key","Bob's private key"],a:2,e:"Encrypt with the recipient's public key. Only Bob's private key can decrypt it."},
 {q:"Alice wants to sign a message. Which key does she use?",o:["Her private key","Her public key","Bob's public key","A shared session key"],a:0,e:"Signatures are created with the signer's private key and verified with their public key."},
 {q:"Why does TLS use asymmetric encryption to set up a session and symmetric encryption for the data?",o:["Symmetric is more secure","Asymmetric is too slow for bulk data","Symmetric can't be used over networks","Asymmetric can't encrypt"],a:1,e:"Asymmetric solves key exchange; symmetric is far faster for bulk data."},
 {q:"Which algorithm provides strong security with shorter keys and suits mobile devices?",o:["RSA","ECC","3DES","MD5"],a:1,e:"Elliptic curve cryptography gives equal strength with much smaller keys."},
 {q:"Which is a key agreement protocol?",o:["AES","SHA-256","Diffie-Hellman","bcrypt"],a:2,e:"Diffie-Hellman lets two parties agree on a shared secret over an untrusted network."},
 {q:"Which technique makes a stolen password hash slower to brute-force by hashing many times?",o:["Salting","Key stretching","Tokenization","Masking"],a:1,e:"Key stretching (PBKDF2, bcrypt) repeats the hash to slow attacks."},
 {q:"Which is the strongest choice for encrypting a laptop drive?",o:["AES-256","DES","MD5","ROT13"],a:0,e:"AES-256 is the modern standard. DES is broken, MD5 is a hash and ROT13 is not encryption."},
 {q:"A user changes one letter of a document and the SHA-256 hash changes completely. What property is this?",o:["Collision","Avalanche effect","Key stretching","Salting"],a:1,e:"A small input change creating a totally different hash is the avalanche effect."},
 {q:"Why is MD5 no longer recommended for integrity checks?",o:["It's too slow","Collisions can be created","It requires a private key","It's symmetric"],a:1,e:"Attackers can craft two inputs with the same MD5 hash."},
 {q:"Two users chose the same password but their stored hashes are different. Why?",o:["Each hash is salted","They used different keys","The hashes are encrypted","The system uses tokenization"],a:0,e:"A unique salt per user makes identical passwords hash differently."},
 {q:"A salt mainly defends against which attack?",o:["Rainbow tables","Phishing","Replay","DDoS"],a:0,e:"Salts make precomputed hash tables useless."},
 {q:"A vendor publishes a SHA-256 value next to a download. What is it for?",o:["Encrypting the file","Verifying the file wasn't altered","Proving the vendor's location","Compressing the file"],a:1,e:"Compare your hash with the published one to verify integrity."},
 {q:"To verify a digital signature, the receiver uses which key?",o:["The sender's public key","The sender's private key","The receiver's private key","The CA's private key"],a:0,e:"The sender's public key decrypts the signed hash for comparison."},
 {q:"Which device would a certificate authority use to protect its root signing key?",o:["TPM","HSM","USB flash drive","Secure enclave on a phone"],a:1,e:"HSMs are tamper-resistant appliances built to generate and protect high-value keys."},
 {q:"BitLocker stores its keys in which component on a laptop?",o:["HSM","TPM","Key escrow","CRL"],a:1,e:"The TPM chip on the motherboard holds the keys."},
 {q:"Which certificate would cover www.example.com, mail.example.com and shop.example.com?",o:["Self-signed","Wildcard *.example.com","Root certificate","CRL"],a:1,e:"A wildcard covers every first-level subdomain."},
 {q:"A single certificate must cover example.com and example.net. What field allows this?",o:["Wildcard","Subject alternative name","OCSP","Key escrow"],a:1,e:"The SAN field lists multiple names."},
 {q:"Which provides real-time checking of whether one certificate has been revoked?",o:["CRL","OCSP","CSR","SAN"],a:1,e:"OCSP checks a single certificate's status on demand. A CRL is a downloaded list."},
 {q:"A web server attaches a time-stamped, CA-signed revocation status to its TLS handshake. What is this?",o:["OCSP stapling","Key escrow","Certificate pinning","CRL distribution"],a:0,e:"OCSP stapling saves the client from contacting the CA."},
 {q:"What do you send to a CA to request a certificate?",o:["Your private key","A CSR","A CRL","A salt"],a:1,e:"A CSR contains your public key and identity details. Never send the private key."},
 {q:"Users see a browser warning when opening an internal app. The certificate was created on the server and not signed by any CA. What is the cause?",o:["Wildcard certificate","Self-signed certificate","OCSP stapling","Expired CRL"],a:1,e:"Self-signed certificates aren't vouched for by a trusted CA."},
 {q:"Why do root CAs usually sign intermediate CAs instead of server certificates?",o:["To keep the root offline and protected","Because roots can't sign","To avoid using hashes","To make certificates cheaper"],a:0,e:"If an intermediate is compromised, it can be revoked without replacing the root."},
 {q:"A government agency requires a third party to hold copies of encryption keys for recovery. What is this?",o:["Key stretching","Key escrow","Key exchange","Tokenization"],a:1,e:"Key escrow keeps keys with a trusted third party."},
 {q:"A payment system replaces card numbers with random values that map back to the real numbers in a secure vault. What is this?",o:["Masking","Tokenization","Hashing","Steganography"],a:1,e:"Tokenization substitutes a token for the sensitive value."},
 {q:"A support screen shows a customer's card as ************4821. What is this?",o:["Tokenization","Data masking","Encryption","Salting"],a:1,e:"Masking hides part of the data."},
 {q:"An attacker hides stolen data inside a vacation photo before emailing it out. What technique is this?",o:["Steganography","Tokenization","Blockchain","Key escrow"],a:0,e:"Steganography hides data inside other files."},
 {q:"Why is tampering with an old block in a blockchain easy to detect?",o:["Each block contains the previous block's hash","Blocks are encrypted with AES","Blocks are stored on a TPM","Blocks expire"],a:0,e:"Changing one block breaks the hash chain for every block after it."},
 {q:"Which processor feature keeps data isolated even if the operating system is compromised?",o:["Secure enclave","CRL","Honeypot","SAN"],a:0,e:"A secure enclave is a hardware-isolated execution area."},
 {q:"Which level of encryption protects a single sensitive column in a customer table?",o:["Full-disk","Volume","Record or database-field","Transport"],a:2,e:"Database and record-level encryption can target specific fields."}
];

registerModule({
  id:"gen",slug:"concepts",title:"General Security Concepts",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["ccat","ctype","ciasort","aaa","zt","phys","cm","tls","keypick","hash","sig","cert","tools","mask"],
  viz(){
sortViz($("#viz-ccat"),{title:"Sort each control into its category",bins:{tech:"Technical",man:"Managerial",op:"Operational",phy:"Physical"},
  items:[["Firewall","tech","Implemented in hardware or software."],["Risk assessment","man","Planning and analysis that directs security decisions."],["Security guard","op","A person performing security every day."],["Bollards","phy","They protect the facility from vehicles."],["Antivirus","tech","Software that blocks malware."],["Acceptable use policy","man","A written policy that directs behavior."],["Awareness training","op","An ongoing program carried out by people."],["Badge reader","phy","Controls who can physically enter."],["Full-disk encryption","tech","Software encryption of the drive."],["Log review by analysts","op","A daily task performed by staff."]],done:"Sorted every control category"});

quizViz($("#viz-ctype"),{title:"Name the control type",done:"Named every control type",qs:[
  ["A login banner warns that all activity is monitored.",["Deterrent","Corrective","Compensating"],0,"It discourages misuse but doesn't stop it."],
  ["An IPS drops packets matching an exploit signature.",["Detective","Preventive","Directive"],1,"Dropping the packet stops the attack, so it's preventive. An IDS that only alerts would be detective."],
  ["A SIEM raises an alert after 50 failed logins.",["Detective","Deterrent","Corrective"],0,"It identifies something happening. It doesn't stop it."],
  ["An infected PC is wiped and reimaged.",["Preventive","Corrective","Directive"],1,"Reimaging fixes the damage and restores the system."],
  ["MFA isn't supported on an old app, so it's only reachable through a VPN that requires MFA.",["Compensating","Deterrent","Detective"],0,"The VPN stands in for a control the app can't support."],
  ["A policy requires employees to lock screens when they step away.",["Directive","Corrective","Detective"],0,"It tells people what to do."]]});

sortViz($("#viz-ciasort"),{title:"Which goal does each control protect most?",bins:{c:"Confidentiality",i:"Integrity",a:"Availability",n:"Non-repudiation"},
  items:[["AES encryption","c","Encryption keeps data unreadable to outsiders."],["SHA-256 file hash","i","A hash shows if the file changed."],["RAID 1 mirror","a","A failed drive doesn't take the data offline."],["Digital signature on a contract","n","The signer can't deny signing it."],["Access control list","c","Restricts who can read data."],["Load balancer","a","Spreads traffic so the service stays up."],["Code signing on an update","i","Shows the update wasn't modified. (It also proves the publisher.)"],["Off-site backups","a","Data can be restored after a disaster."]],done:"Sorted CIA controls"});

seqViz($("#viz-aaa"),{title:"AAA: a VPN sign-in",left:"VPN client",right:"RADIUS server",intro:"Follow a remote user connecting through a VPN concentrator that uses RADIUS for AAA.",
  steps:[{dir:"r",label:"Username + password + MFA code",sub:"Authentication request",text:"<b>Authentication.</b> The user proves who they are with a password and a one-time code."},
         {dir:"l",label:"Access-Accept",sub:"Identity confirmed",text:"The server confirms the identity."},
         {dir:"l",label:"Group: Finance-VPN",sub:"Authorization attributes",text:"<b>Authorization.</b> The server returns what the user may reach, here only the finance subnet."},
         {dir:"r",label:"Accounting-Start",sub:"Session logged",dash:true,text:"<b>Accounting.</b> The session start, IP and time are logged."},
         {dir:"r",label:"Accounting-Stop · 212 MB",sub:"Session ends",dash:true,text:"When the user disconnects, the duration and data transferred are logged for audits."}],
  end:"Authentication proves identity, authorization grants access, and accounting records what happened."});

/* ---- zero trust walkthrough ---- */
(function(){
  const el=$("#viz-zt");
  const SC={good:{n:"Managed laptop, office hours",ok:true,ctx:["Valid password + FIDO2 key","Device patched, EDR running","Home city","10:14"]},
            bad:{n:"Unpatched laptop, 3 a.m., new country",ok:false,ctx:["Valid password + FIDO2 key","Device 74 days behind on patches","Unfamiliar country","03:02"]}};
  const ST=[["Subject","The user and device request the payroll app."],["PEP","The policy enforcement point intercepts the request. Nothing passes until a decision is made."],["Policy engine","The policy engine weighs identity, device health, location and time against policy."],["Policy administrator","The policy administrator tells the PEP to open, or refuse, the session."],["Resource","If allowed, the session reaches only the payroll app, nothing else on the network (threat scope reduction)."]];
  let sc="good",n=0;const done=new Set();
  el.innerHTML=`<div class="viz-title">Zero trust: follow one request</div><div class="chips">${Object.entries(SC).map(([k,v])=>`<button class="chip" data-s="${k}">${v.n}</button>`).join("")}</div><div class="kv ztk"></div><div class="stp-flow">${ST.map((s,i)=>`<div class="stp-n" data-i="${i}"><span class="mono">${i<3?(i===0?"DATA PLANE":i===1?"DATA PLANE":"CONTROL PLANE"):i===3?"CONTROL PLANE":"DATA PLANE"}</span><b>${s[0]}</b></div>`).join("")}</div><div class="caption" aria-live="polite"></div><div class="viz-controls"><button class="btn primary" data-a="next">Next</button><button class="btn" data-a="reset">Start over</button></div>`;
  function draw(){const S2=SC[sc];el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===sc));
    $(".ztk",el).innerHTML=S2.ctx.map((c,i)=>`<span>${["Identity","Device","Location","Time"][i]}</span><b class="${!S2.ok&&i>0?"status-bad":""}">${c}</b>`).join("");
    el.querySelectorAll(".stp-n").forEach((x,i)=>{x.classList.toggle("on",i<n);x.classList.toggle("cur",i===n-1)});
    let t=n===0?"Pick a scenario and press Next.":ST[n-1][1];
    if(n===3)t+=S2.ok?' <span class="status-good">Decision: grant.</span>':' <span class="status-bad">Decision: deny.</span> The password was right, but the context fails policy.';
    if(n===5&&!S2.ok)t='<span class="status-bad">Access denied.</span> The PEP never opens a session, so the request never reaches the resource. In a traditional VPN, the right password alone would have let this device onto the whole network.';
    $(".caption",el).innerHTML=t;$('[data-a="next"]',el).disabled=n===ST.length;
    if(n===ST.length){done.add(sc);if(done.size===2)award("viz:zt",20,"Traced zero trust decisions")}}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),a=e.target.closest("[data-a]")?.dataset.a;if(s){sc=s.dataset.s;n=0}if(a==="next")n=Math.min(n+1,ST.length);if(a==="reset")n=0;draw()});
  draw();
})();

revealViz($("#viz-phys"),{title:"Walk the perimeter: tap each control",cols:4,done:"Inspected every physical control",items:[
  ["Bollards","Perimeter","Steel or concrete posts that stop vehicles. They're preventive."],["Fencing","Perimeter","Marks the boundary and slows intruders. Tall fencing with barbed wire is preventive and deterrent."],["Lighting","Perimeter","Removes hiding places, deters intruders and helps cameras."],["Security guard","Entrance","A person who can verify ID, respond to events and make judgment calls cameras can't."],
  ["Access vestibule","Entrance","Two interlocking doors. Only one opens at a time, so nobody can tailgate."],["Access badge","Entrance","Proves who you are at a reader and logs every entry."],["Video surveillance","Inside","Records activity. Modern systems detect motion and objects and alert guards."],["Infrared sensor","Inside","Detects body heat. Good in the dark."],
  ["Pressure sensor","Inside","Detects weight on floors or windows."],["Microwave sensor","Inside","Sends microwaves and detects movement over a large area, even through some walls."],["Ultrasonic sensor","Inside","Uses high-frequency sound reflections to detect movement."],["Honeypot server","Network","A decoy server in the rack. Anyone touching it is up to no good. This is deception, not a physical control."]]});

orderVizCM();
function orderVizCM(){stepViz($("#viz-cm"),{title:"A change from request to close",done:"Walked a change through change management",steps:[
  ["Request","The owner submits a change request: upgrade the VPN concentrator firmware. Stakeholders are listed."],
  ["Impact analysis","What could break? Remote staff lose VPN during the reboot, and an old client version might not connect."],
  ["Test","The firmware is tested in a lab. Test results are attached to the request."],
  ["CAB approval","The change advisory board reviews the risk, test results and backout plan, then approves."],
  ["Maintenance window","The change runs Sunday at 2 a.m., when the fewest users are connected. The service restart is expected."],
  ["Backout ready","If the new firmware fails, the backout plan reloads the previous image within 15 minutes."],
  ["Document","Diagrams, the SOP and version control are updated so the next person knows the current state."]],
  end:"Skipping steps is how outages happen. The exam loves backout plans, impact analysis and documentation."})}

seqViz($("#viz-tls"),{title:"How TLS combines asymmetric and symmetric crypto",left:"Browser",right:"Web server",intro:"TLS uses slow asymmetric crypto only to agree on a key, then switches to fast symmetric encryption.",
  steps:[{dir:"r",label:"ClientHello",sub:"Supported ciphers, random value",text:"The browser lists the cipher suites it supports."},
         {dir:"l",label:"ServerHello + certificate",sub:"Server's public key, signed by a CA",text:"The server sends its certificate. The browser checks the chain up to a trusted root CA."},
         {dir:"r",label:"Key share (Diffie-Hellman)",sub:"Asymmetric",text:"Both sides exchange Diffie-Hellman values. Each side can now compute the same <b>session key</b>, but anyone listening can't."},
         {dir:"l",label:"Finished",sub:"Proves the server holds its private key",text:"The server proves it holds the private key matching the certificate."},
         {dir:"r",label:"Encrypted data (AES-GCM)",sub:"Symmetric",text:"From here on, all data is encrypted with the fast symmetric session key."}],
  end:"Asymmetric: key exchange and authentication. Symmetric: the bulk data. That's why it's called hybrid encryption."});

quizViz($("#viz-keypick"),{title:"Which key does each job?",done:"Picked the right key every time",qs:[
  ["Alice sends Bob a confidential file.",["Alice's private key","Bob's public key","Bob's private key","Alice's public key"],1,"Encrypt to the recipient with their public key."],
  ["Bob opens the confidential file.",["Bob's private key","Alice's public key","Bob's public key","Alice's private key"],0,"Only Bob's private key decrypts what was encrypted with his public key."],
  ["Alice signs a purchase order.",["Alice's private key","Alice's public key","Bob's public key","A session key"],0,"Sign with your own private key."],
  ["Bob checks Alice's signature.",["Alice's public key","Alice's private key","Bob's private key","Bob's public key"],0,"Anyone can verify with the signer's public key."],
  ["Alice and Bob encrypt a 4 GB video call.",["Bob's public key","A symmetric session key","Alice's private key","A hash"],1,"Bulk data uses a fast symmetric key agreed by key exchange."]]});

/* ---- hash avalanche + salting demo ---- */
(function(){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function sha256(str){const b=new TextEncoder().encode(str),l=b.length,n=((l+9+63)>>6)<<6,m=new Uint8Array(n);m.set(b);m[l]=0x80;const dv=new DataView(m.buffer);dv.setUint32(n-4,l*8);
    let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const w=new Array(64),r=(x,k)=>(x>>>k)|(x<<(32-k));
    for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);for(let i=16;i<64;i++){const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
      let[a,bb,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]+w[i])|0,S0=r(a,2)^r(a,13)^r(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
      h=h.map((x,i)=>(x+[a,bb,c,d,e,f,g,hh][i])|0)}return h.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("")}
  window.SP_SHA256=sha256;
  const el=$("#viz-hash");let prev=null,typed=false,salted=false;
  el.innerHTML=`<div class="viz-title">SHA-256 live: change one character</div>
  <input class="txt-in" id="h-in" value="Transfer $500 to Bob" aria-label="Text to hash">
  <div class="s-small" style="margin-top:8px">SHA-256 HASH <span class="h-diff"></span></div><div class="hash-out" id="h-out"></div>
  <div class="viz-title" style="margin-top:14px">Two users, same password</div>
  <div class="chips"><button class="chip" data-salt="0" aria-pressed="true">No salt</button><button class="chip" data-salt="1">Unique salt per user</button></div>
  <div class="kv" id="h-users"></div><div class="caption" aria-live="polite">Edit the text. Characters that changed in the hash are highlighted.</div>`;
  const inp=$("#h-in",el);
  function draw(){const h=sha256(inp.value);let diff=0;
    $("#h-out",el).innerHTML=prev?[...h].map((c,i)=>c!==prev[i]?(diff++,`<i>${c}</i>`):c).join(""):h;
    $(".h-diff",el).textContent=prev&&prev!==h?`· ${diff} of 64 characters changed`:"";
    const pw="Summer2024!",sa=["x9Qa","M2rT"];
    $("#h-users",el).innerHTML=["alice","bob"].map((u,i)=>`<span>${u}${salted?` · salt ${sa[i]}`:""}</span><b class="mono" style="font-size:12px;word-break:break-all">${sha256((salted?sa[i]:"")+pw).slice(0,32)}…</b>`).join("");
    if(typed&&salted)award("viz:hash",20,"Saw the avalanche effect and salting")}
  let last=inp.value;inp.oninput=()=>{prev=sha256(last);last=inp.value;typed=true;draw();
    $(".caption",el).innerHTML=`Even a one-character change flips about half the hash. That's the <b>avalanche effect</b>.${salted?"":" Now try the salt toggle."}`};
  el.addEventListener("click",e=>{const s=e.target.closest("[data-salt]");if(!s)return;salted=s.dataset.salt==="1";el.querySelectorAll("[data-salt]").forEach(b=>b.setAttribute("aria-pressed",b===s));
    $(".caption",el).innerHTML=salted?"With a unique salt, the same password produces different hashes, so one rainbow table can't crack everyone.":"Without a salt, the same password produces the same hash. Crack one and you've cracked both.";draw()});
  draw();
})();

stepViz($("#viz-sig"),{title:"Sign and verify a message",done:"Signed and verified a message",steps:[
  ["Hash","Alice hashes the contract with SHA-256: <span class='mono'>9f2c…41ab</span>."],
  ["Encrypt hash","She encrypts that hash with <b>her private key</b>. The result is the digital signature."],
  ["Send","She sends the contract and the signature. The contract itself isn't encrypted, so this doesn't give confidentiality."],
  ["Decrypt signature","Bob decrypts the signature with <b>Alice's public key</b> and gets <span class='mono'>9f2c…41ab</span>."],
  ["Re-hash","Bob hashes the contract he received himself."],
  ["Compare","The hashes match. The contract wasn't changed (integrity), it came from Alice (authentication), and she can't deny signing it (non-repudiation)."]],
  end:"If one comma in the contract had changed, Bob's hash wouldn't match and the signature would fail."});

quizViz($("#viz-cert"),{title:"Diagnose the certificate warning",done:"Diagnosed every certificate problem",qs:[
  ["<span class='mono'>portal.corp.local</span>: issuer is portal.corp.local itself.",["Self-signed","Revoked","Name mismatch"],0,"Issuer equals subject and no CA vouches for it."],
  ["<span class='mono'>shop.example.com</span>: valid chain, but OCSP responds \"revoked\".",["Expired","Revoked","Wildcard"],1,"The CA revoked it, perhaps because the private key leaked."],
  ["Certificate for <span class='mono'>*.example.com</span> used on <span class='mono'>api.eu.example.com</span>.",["Name mismatch","Expired","Self-signed"],0,"A wildcard covers one level only. api.eu.example.com is two levels deep. Add a SAN or a separate certificate."],
  ["Chain: server cert → Intermediate G3 → (missing).",["Untrusted chain: intermediate not sent","Revoked","Wildcard"],0,"The server must send the intermediate so the browser can build a path to a trusted root."],
  ["Valid until 2025-03-01. Today is 2026-11-09.",["Expired","Revoked","SAN error"],0,"Certificates have a validity period. Renew before it ends."]]});

revealViz($("#viz-tools"),{title:"Where do the keys live?",cols:4,done:"Explored every crypto tool",items:[
  ["TPM","On the motherboard","Stores keys for BitLocker and supports secure boot by measuring each boot step.","def"],["HSM","Appliance or card","Tamper-resistant hardware for CAs, banks and payment systems. Can generate and store thousands of keys.","def"],["Key management system","Central service","Cloud KMS or software that creates, rotates, audits and revokes keys from one place.","def"],["Secure enclave","Inside the CPU","Isolated memory and processing. Phones keep fingerprint data here.","def"],
  ["Steganography","Obfuscation","Hidden data inside an image, audio or video file. Attackers use it to sneak data out.","atk"],["Tokenization","Obfuscation","The real value lives in a vault; systems use a random token instead.","vio"],["Data masking","Obfuscation","Replaces part of a value with asterisks or fake data.","vio"],["Blockchain","Ledger","Blocks linked by hashes. Change one and every later hash breaks.","vio"]]});

/* ---- masking vs tokenization vs encryption vs hashing ---- */
(function(){
  const el=$("#viz-mask");const card="4111 2222 3333 4821";const seen=new Set();
  const M={mask:["Masked","**** **** **** 4821","Part of the value is hidden. Support staff can confirm the last four digits without seeing the rest. Not reversible from the masked value."],
    token:["Tokenized","tok_8Fq2LmZ91xYw","A random token stored in place of the card. Only the token vault can map it back. If the database is stolen, the tokens are worthless."],
    enc:["Encrypted (AES)","U2FsdGVkX19vQ8mR…","Reversible with the key. Protect the key and the data stays confidential."],
    hash:["Hashed (SHA-256)",SP_SHA256(card).slice(0,32)+"…","One-way. You can check if a value matches, but can't get the card number back."]};
  el.innerHTML=`<div class="viz-title">One card number, four protections</div><div class="kv"><span>Original</span><b class="mono">${card}</b></div><div class="chips">${Object.entries(M).map(([k,v])=>`<button class="chip" data-m="${k}">${v[0]}</button>`).join("")}</div><div class="hash-out" id="m-out">Pick a method.</div><div class="caption" aria-live="polite"></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;const m=M[b.dataset.m];seen.add(b.dataset.m);el.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x===b));
    $("#m-out",el).textContent=m[1];$(".caption",el).innerHTML=m[2];if(seen.size===4)award("viz:mask",20,"Compared data protection methods")});
})();
  },
  sims:[
    {id:"classify",type:"match",title:"Classify the controls",
      scenario:"An auditor needs each new control at a clinic labeled with its primary type. Match each control to its type.",
      items:[["Preventive","prev"],["Deterrent","det"],["Detective","detc"],["Corrective","corr"],["Compensating","comp"],["Directive","dir"]],
      slots:[["prev","Control A","Badge-only door to the records room"],["det","Control B","\"Premises under 24-hour video surveillance\" sign"],["detc","Control C","Weekly review of failed-login reports"],["corr","Control D","Automatic restore of a corrupted database from snapshot"],["comp","Control E","Extra logging and an isolated VLAN for an unpatchable X-ray workstation"],["dir","Control F","Policy requiring encrypted USB drives"]],
      success:"Every control is labeled. Remember that many controls fit more than one type, and the exam asks about the main purpose."},
    {id:"chain",type:"order",title:"Get a trusted certificate",
      scenario:"You need a publicly trusted TLS certificate for shop.example.com. Put the steps in order.",
      steps:["Generate a key pair on the web server","Create a CSR containing the public key and domain name","Submit the CSR to a public CA","Prove you control the domain (DNS or HTTP challenge)","CA signs the certificate with its intermediate key","Install the certificate and intermediate chain on the server","Browser validates the chain up to a trusted root"],
      success:"The private key never left the server. Sending the intermediate with your certificate prevents untrusted-chain errors."},
    {id:"crypto",type:"match",title:"Pick the right cryptography",
      scenario:"A development team has six requirements. Match each one to the best tool.",
      items:[["AES-256","aes"],["RSA / ECC key pair","rsa"],["SHA-256","sha"],["bcrypt with a salt","bcrypt"],["Digital signature","sig"],["Tokenization","tok"]],
      slots:[["aes","Req 1","Encrypt 2 TB of backup data quickly"],["rsa","Req 2","Let partners send us data only we can decrypt, without sharing a secret first"],["sha","Req 3","Detect if a downloaded installer was altered"],["bcrypt","Req 4","Store user passwords so stolen hashes are slow to crack"],["sig","Req 5","Prove an approval came from the CFO and can't be denied"],["tok","Req 6","Keep card numbers out of the order database entirely"]],
      success:"Right tool for each job. Symmetric for bulk, asymmetric for sharing, hashes for integrity, slow salted hashes for passwords."},
    {id:"change",type:"order",title:"Run a change through change management",
      scenario:"A critical firewall upgrade is needed. Put the change management steps in order.",
      steps:["Submit a change request with an owner","Perform an impact analysis","Test the change in a staging environment","Present the change, test results and backout plan to the CAB","Schedule it in the maintenance window","Implement the change, with the backout plan ready","Update documentation and version control"],
      success:"Approved, tested, reversible and documented. That's a clean change."}
  ],
  badges:[
    ["reader","GC","Grounded","Mark all 9 general concepts lessons studied",c=>c.allStudied()],
    ["lab","CL","Concept Lab","Complete all 14 diagrams in this module",c=>c.vizAll()],
    ["zt","ZT","Never Trust","Trace both zero trust scenarios",c=>c.earned("viz:zt")],
    ["root","RT","Root of Trust","Pass the certificate request simulation",c=>c.passed("chain")],
    ["cipher","CS","Cipher Suite","Pass the cryptography selection simulation",c=>c.passed("crypto")],
    ["cab","CB","CAB Approved","Pass the change management simulation",c=>c.passed("change")],
    ["recall","KR","Key Recall","Master 20 general concepts flashcards",c=>c.countAtLeast(4)>=20],
    ["perfect","AV","Avalanche","Score 100% on a general concepts quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
