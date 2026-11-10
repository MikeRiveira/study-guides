/* ================= Module 7: Security (Core 2, 220-1202) ================= */
(function(){
const LESSONS=[
{id:"physical",num:"7.1",title:"Physical security",short:"Physical",html:`
<p>Attackers who can touch hardware can bypass most software defenses, so security starts at the door.</p>
<div class="scroll"><table><thead><tr><th>Control</th><th>What it stops</th></tr></thead><tbody>
<tr><td>Bollards</td><td>Vehicles driving into buildings</td></tr>
<tr><td>Access control vestibule</td><td>Tailgating. Two doors, and only one opens at a time.</td></tr>
<tr><td>Badge reader, key fob, smart card</td><td>Unauthorized entry, and it logs who went in</td></tr>
<tr><td>Biometrics</td><td>Retina, fingerprint, palm print or face. Hard to share or steal.</td></tr>
<tr><td>Video surveillance and alarms</td><td>Deters intruders and records evidence</td></tr>
<tr><td>Motion sensors, lighting, fences</td><td>Detects and discourages intruders</td></tr>
<tr><td>Security guards</td><td>Verify identity and keep an access list</td></tr>
<tr><td>Door locks, equipment locks</td><td>Theft of laptops and servers (cable locks, locked racks)</td></tr>
<tr><td>Magnetometers</td><td>Metal detectors that screen people for weapons</td></tr>
</tbody></table></div>`},
{id:"logical",num:"7.2",title:"Logical security and authentication",short:"Logical",html:`
<ul><li><b>Principle of least privilege:</b> give users only the access they need for their job.</li>
<li><b>Zero trust:</b> verify every user and device on every request, even inside the network.</li>
<li><b>Access control lists (ACLs):</b> rules that allow or deny traffic or access.</li>
<li><b>Multifactor authentication (MFA)</b> combines different factors: something you <b>know</b> (password, PIN), something you <b>have</b> (hardware token, authenticator app, SMS code), and something you <b>are</b> (fingerprint, face). Two passwords is still one factor.</li>
<li><b>One-time passwords:</b> TOTP codes from an authenticator app change every 30 seconds. SMS, email and voice call codes are weaker because they can be intercepted.</li>
<li><b>SSO</b> lets one login reach many apps. <b>SAML</b> is a common standard for passing that login between systems.</li>
<li><b>Just-in-time (JIT) access</b> and <b>privileged access management (PAM)</b> give admin rights only when needed, then take them away.</li>
<li><b>MDM</b> manages mobile devices. <b>DLP</b> blocks sensitive data from leaving. <b>IAM</b> manages identities and their permissions.</li></ul>
<h3>Active Directory</h3>
<ul><li>A <b>domain</b> holds central user and computer accounts. <b>Organizational units (OUs)</b> group them for management.</li>
<li><b>Group Policy</b> pushes settings. <b>Security groups</b> grant permissions to many users at once.</li>
<li><b>Login scripts</b> run at sign-in (for example, to map drives). <b>Home folders</b> and <b>folder redirection</b> store users' files on a server.</li></ul>`},
{id:"wireless",num:"7.3",title:"Wireless security protocols",short:"Wireless",html:`
<div class="viz" id="viz-wifi"></div>
<ul><li><b>RADIUS:</b> central authentication for Wi-Fi (WPA2/WPA3-Enterprise), VPNs and switches. Uses UDP.</li>
<li><b>TACACS+:</b> Cisco's protocol for authenticating admins to network devices. Uses TCP and encrypts the whole exchange.</li>
<li><b>Kerberos:</b> ticket-based authentication used by Active Directory domains.</li></ul>`},
{id:"malware",num:"7.4",title:"Malware and how to remove it",short:"Malware",html:`
<div class="scroll"><table><thead><tr><th>Type</th><th>What it does</th></tr></thead><tbody>
<tr><td>Virus</td><td>Attaches to files and spreads when they run</td></tr>
<tr><td>Boot sector virus</td><td>Infects the boot sector, so it loads before the OS</td></tr>
<tr><td>Trojan</td><td>Pretends to be useful software</td></tr>
<tr><td>Rootkit</td><td>Hides deep in the OS with admin-level access. Hard to detect.</td></tr>
<tr><td>Ransomware</td><td>Encrypts files and demands payment</td></tr>
<tr><td>Spyware, keylogger</td><td>Watches activity, records keystrokes</td></tr>
<tr><td>Stalkerware</td><td>Spyware secretly installed to track a person</td></tr>
<tr><td>Cryptominer</td><td>Uses your CPU or GPU to mine cryptocurrency</td></tr>
<tr><td>Fileless malware</td><td>Runs only in memory, using built-in tools like PowerShell</td></tr>
<tr><td>Adware, PUP</td><td>Shows ads or installs unwanted extras</td></tr>
</tbody></table></div>
<p>Tools include antivirus, anti-malware, software firewalls, <b>EDR</b> (endpoint detection and response), <b>MDR</b> (managed detection and response, run by a provider), <b>XDR</b> (extended detection across endpoints, network and cloud), email security gateways, the Windows Recovery Environment, user education, and as a last resort, reinstalling the OS.</p>
<p>CompTIA tests a specific seven-step removal process:</p>
<div class="viz" id="viz-mal"></div>`},
{id:"social",num:"7.5",title:"Social engineering and other threats",short:"Threats",html:`
<p>People are the easiest system to hack. Find all the red flags in this message.</p>
<div class="viz" id="viz-phish"></div>
<ul><li><b>Phishing</b> is fake email. <b>Spear phishing</b> targets one person. <b>Whaling</b> targets executives. <b>Vishing</b> uses phone calls, <b>smishing</b> uses text messages, and <b>QR code phishing</b> hides a bad link in a QR code.</li>
<li><b>Business email compromise (BEC):</b> a real or spoofed executive account asks for wire transfers or gift cards.</li>
<li><b>Shoulder surfing</b> (watching a screen), <b>tailgating</b> (following someone through a door), <b>impersonation</b>, and <b>dumpster diving</b>.</li>
<li><b>DoS and DDoS:</b> flooding a service until it fails. <b>Evil twin:</b> a fake access point with a real network's name. <b>On-path:</b> intercepting traffic between two parties.</li>
<li><b>Zero-day:</b> a flaw with no patch yet. <b>Spoofing:</b> faking an address or identity. <b>Brute force</b> and <b>dictionary</b> attacks guess passwords.</li>
<li><b>SQL injection</b> sends database commands through form fields. <b>Cross-site scripting (XSS)</b> injects scripts into websites.</li>
<li><b>Insider threats</b>, <b>supply chain attacks</b>, and risky systems: <b>unpatched</b>, <b>end-of-life</b>, non-compliant, and unmanaged <b>BYOD</b> devices.</li></ul>`},
{id:"windows",num:"7.6",title:"Windows and workstation security",short:"Windows security",html:`
<ul><li><b>Microsoft Defender Antivirus</b> and <b>Windows Defender Firewall</b> are built in. Keep definitions updated.</li>
<li><b>Accounts:</b> Administrator, Standard user and Guest. Use a standard account day to day. <b>UAC</b> prompts before admin-level changes.</li>
<li><b>Sign-in options:</b> password, PIN, Windows Hello (face or fingerprint), passwordless and SSO.</li>
<li><b>BitLocker</b> encrypts whole drives. <b>BitLocker To Go</b> encrypts USB drives. <b>EFS</b> encrypts individual files on NTFS.</li></ul>
<div class="viz" id="viz-perm"></div>
<h3>Workstation best practices</h3>
<ul><li>Encrypt data at rest. Require complex passwords and set expirations where policy demands.</li>
<li>Set BIOS/UEFI passwords so settings and boot order can't be changed.</li>
<li>Lock the screen when you walk away (<kbd>Win</kbd>+<kbd>L</kbd>), use timeout locks, and log off when done.</li>
<li>Restrict login times, lock accounts after failed attempts, disable the Guest account, and rename or disable the default Administrator.</li>
<li>Disable AutoRun and AutoPlay so inserted media can't launch programs.</li>
<li>Secure PII and passwords. Never leave them on sticky notes.</li></ul>`},
{id:"mobile",num:"7.7",title:"Mobile security and data destruction",short:"Mobile and disposal",html:`
<ul><li><b>Screen locks:</b> face, fingerprint, PIN, pattern or swipe (swipe is not secure).</li>
<li><b>Remote wipe</b> and <b>locator apps</b> for lost devices. Limit failed login attempts so the device wipes or locks.</li>
<li>Keep the OS updated, encrypt the device, back up remotely, and consider antivirus and firewall apps.</li>
<li><b>BYOD vs corporate-owned:</b> BYOD devices usually get a separate work profile managed by MDM.</li></ul>
<h3>Data destruction</h3>
<ul><li><b>Physical destruction:</b> drilling, shredding, degaussing (magnetic HDDs and tapes only, not SSDs) and incineration.</li>
<li><b>Reuse:</b> a standard format only removes the file table, so data can be recovered. Use a secure erase or wipe tool to overwrite it.</li>
<li><b>Outsourcing:</b> a third-party vendor destroys the drives and provides a <b>certificate of destruction</b>.</li></ul>`},
{id:"soho",num:"7.8",title:"SOHO routers and browser security",short:"Routers and browsers",html:`
<ul><li><b>Router:</b> change the default admin password, update firmware, and allow management only from the inside network (or over HTTPS).</li>
<li><b>Wireless:</b> use WPA3 (or WPA2 with AES), change the default SSID, disable WPS, and isolate or disable guest access. Change channels to avoid interference.</li>
<li><b>Firewall:</b> close unused ports, forward only what's needed, and disable <b>UPnP</b> so devices can't open ports on their own. Put public servers in a <b>screened subnet</b> (DMZ).</li>
<li><b>Other:</b> IP filtering, content filtering, and placing the router where people can't touch it.</li></ul>
<h3>Browser security</h3>
<ul><li>Download browsers and extensions only from trusted sources. Verify installers with their published <b>hash</b>.</li>
<li>Look for HTTPS and a valid certificate. Certificate warnings mean stop.</li>
<li>Use a <b>password manager</b>, a pop-up blocker and an ad blocker. Remove unknown extensions.</li>
<li>Clear the cache and cookies when troubleshooting. Private browsing doesn't save history, but it doesn't hide you from your employer or ISP.</li>
<li>Browser sync, proxy settings and secure DNS (DNS over HTTPS) are configured in the browser's settings.</li></ul>`}
];

const CARDS=[
 ...[["Access control vestibule","Two-door entry that stops tailgating"],["Bollards","Posts that stop vehicles"],["Degaussing","Erases magnetic media with a strong magnet. Not for SSDs."],["Certificate of destruction","Proof from a vendor that drives were destroyed"],
     ["Standard format","Leaves data recoverable"],["Something you have","Smart card, hardware token, authenticator app"],["Something you are","Biometrics: fingerprint, face, retina"],["Least privilege","Only the access needed for the job"],
     ["Zero trust","Verify every request, even inside the network"],["SSO","One login for many applications"],["SAML","Standard for passing SSO logins between systems"],["JIT / PAM","Temporary admin rights, managed privileged accounts"],["DLP","Stops sensitive data from leaving"]].map((c,i)=>({deck:"access",id:"ac"+i,q:c[0],a:c[1]})),
 ...[["Phishing","Fake email to steal info or install malware"],["Spear phishing","Phishing aimed at one person"],["Whaling","Phishing aimed at executives"],["Vishing / smishing","Phishing by voice call / text message"],
     ["Tailgating","Following someone through a secure door"],["Shoulder surfing","Watching someone's screen or keypad"],["Evil twin","Fake access point with a real network's name"],["On-path attack","Intercepting traffic between two parties"],
     ["Zero-day","A flaw with no patch available yet"],["SQL injection","Database commands sent through form fields"],["XSS","Malicious scripts injected into websites"],["BEC","Business email compromise: fake exec asks for money"],["DDoS","Many systems flood a target"]].map((c,i)=>({deck:"threats",id:"th"+i,q:c[0],a:c[1]})),
 ...[["Rootkit","Hides in the OS with admin access"],["Ransomware","Encrypts files, demands payment"],["Trojan","Malware disguised as useful software"],["Keylogger","Records keystrokes"],["Fileless malware","Runs in memory using built-in tools"],["Cryptominer","Mines cryptocurrency on your hardware"],
     ["Malware removal step 1","Investigate and verify symptoms"],["Malware removal step 2","Quarantine the infected system"],["Malware removal step 3","Disable System Restore"],["Malware removal step 4","Remediate: update anti-malware, scan and remove"],
     ["Malware removal step 5","Schedule scans and run updates"],["Malware removal step 6","Enable System Restore, create a restore point"],["Malware removal step 7","Educate the end user"],["EDR","Endpoint detection and response"]].map((c,i)=>({deck:"malware",id:"mw"+i,q:c[0],a:c[1]})),
 ...[["WEP","Broken. Never use it."],["WPA2 encryption","AES (CCMP). TKIP is the weak legacy option."],["WPA3","SAE replaces the pre-shared key handshake, stronger encryption"],["RADIUS","Central authentication for Wi-Fi and VPN (UDP)"],["TACACS+","Device admin authentication (TCP, full encryption)"],
     ["Kerberos","Ticket-based authentication in AD domains"],["Share + NTFS permissions over the network","The most restrictive wins"],["Explicit deny","Overrides allow"],["Disable UPnP","Stops devices opening router ports themselves"],["BitLocker To Go","Encrypts removable drives"],["EFS","Encrypts individual files on NTFS"]].map((c,i)=>({deck:"config",id:"cf"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"An office wants to stop people from following employees through a secure door. Which control is best?",o:["Bollards","Access control vestibule","Motion sensor","Cable lock"],a:1,e:"A vestibule (mantrap) lets only one door open at a time, stopping tailgating."},
 {q:"Which control prevents a vehicle from being driven into a building entrance?",o:["Bollards","Badge reader","Fence","Magnetometer"],a:0,e:"Bollards are sturdy posts designed to stop vehicles."},
 {q:"A user signs in with a password and a code from an authenticator app. Which factors are used?",o:["Something you know and something you are","Something you know and something you have","Two things you know","Something you are and somewhere you are"],a:1,e:"The password is known. The app on the phone is something you have."},
 {q:"Which is NOT multifactor authentication?",o:["Password and fingerprint","Password and security question","Smart card and PIN","PIN and authenticator code"],a:1,e:"A password and a security question are both something you know."},
 {q:"Users should be given only the access needed for their job. What is this principle?",o:["Zero trust","Least privilege","Defense in depth","Separation of duties"],a:1,e:"Least privilege limits damage if an account is compromised."},
 {q:"A company requires every device and user to be verified on each request, even inside the office network. What model is this?",o:["Zero trust","Least privilege","Perimeter security","SSO"],a:0,e:"Zero trust assumes no location is automatically trusted."},
 {q:"Users sign in once and reach email, HR and CRM apps without logging in again. What is this?",o:["MFA","SSO","PAM","DLP"],a:1,e:"Single sign-on uses one authentication for many applications."},
 {q:"Admins receive elevated rights only for a two-hour maintenance window. What is this?",o:["Just-in-time access","Least functionality","Account lockout","SSO"],a:0,e:"JIT access grants privileges only when needed, then removes them."},
 {q:"Which solution prevents employees from emailing files containing credit card numbers outside the company?",o:["DLP","MDM","EDR","UPnP"],a:0,e:"Data loss prevention inspects outgoing data for sensitive content."},
 {q:"In Active Directory, what groups user and computer accounts so policies can be applied to them?",o:["Workgroups","Organizational units","VLANs","Home folders"],a:1,e:"OUs organize objects so Group Policy can target them."},
 {q:"Which wireless security protocol should be chosen on a new access point?",o:["WEP","WPA with TKIP","WPA2 with TKIP","WPA3"],a:3,e:"WPA3 is the strongest. If unavailable, use WPA2 with AES."},
 {q:"Which encryption should WPA2 use?",o:["TKIP","AES","RC4","DES"],a:1,e:"WPA2 with AES (CCMP) is secure. TKIP is a weak legacy option."},
 {q:"A company wants Wi-Fi users to sign in with their own domain credentials. What should be configured?",o:["WPA2-Personal","WPA2/WPA3-Enterprise with RADIUS","WEP","MAC filtering only"],a:1,e:"Enterprise mode sends logins to a RADIUS server, which checks the directory."},
 {q:"Which protocol authenticates administrators to routers and switches using TCP and full-packet encryption?",o:["RADIUS","TACACS+","Kerberos","LDAP"],a:1,e:"TACACS+ uses TCP and encrypts the entire payload."},
 {q:"Which authentication protocol uses tickets and is used by Active Directory?",o:["RADIUS","Kerberos","TACACS+","SAML"],a:1,e:"Kerberos issues tickets so passwords aren't sent across the network."},
 {q:"A user's files have all been renamed with a strange extension, and a note demands payment. What is this?",o:["Spyware","Ransomware","Adware","Rootkit"],a:1,e:"Ransomware encrypts files and demands payment to unlock them."},
 {q:"Malware is hiding from antivirus by running with system-level privileges deep in the OS. What type is it?",o:["Rootkit","Adware","Worm","PUP"],a:0,e:"Rootkits hide in the kernel or boot process and are hard to remove."},
 {q:"A free game installed malware that steals passwords. What type of malware is this?",o:["Trojan","Boot sector virus","Cryptominer","Ransomware"],a:0,e:"Trojans pose as legitimate software."},
 {q:"A PC's fans are always loud and CPU use stays near 100% even when idle. Which malware is likely?",o:["Cryptominer","Keylogger","Stalkerware","Ransomware"],a:0,e:"Cryptominers use the processor to mine cryptocurrency."},
 {q:"Malware runs only in memory using PowerShell and leaves no files on disk. What is this?",o:["Fileless malware","Boot sector virus","Adware","Worm"],a:0,e:"Fileless attacks abuse built-in tools and are hard for file scanners to catch."},
 {q:"What is the FIRST step of the CompTIA malware removal process?",o:["Quarantine the system","Investigate and verify malware symptoms","Disable System Restore","Educate the user"],a:1,e:"First confirm that malware really is the cause."},
 {q:"After quarantining an infected PC, what is the next malware removal step?",o:["Educate the user","Disable System Restore","Schedule scans","Reinstall Windows"],a:1,e:"Disable System Restore so infected restore points can't bring the malware back."},
 {q:"What is the final step of the malware removal process?",o:["Enable System Restore","Educate the end user","Run updates","Quarantine"],a:1,e:"Teaching the user helps prevent reinfection."},
 {q:"Why should an infected PC be disconnected from the network?",o:["To speed up scanning","To stop the malware spreading to other systems","To reset DHCP","To update drivers"],a:1,e:"Quarantining isolates the infection."},
 {q:"Malware keeps reloading at startup. Where can the technician scan without it running?",o:["Safe Mode or a preinstallation environment","Task Manager","Event Viewer","Normal mode"],a:0,e:"Scanning outside the normal boot stops the malware from protecting itself."},
 {q:"An employee gets a call from someone claiming to be IT, asking for their password. What is this?",o:["Smishing","Vishing","Whaling","Tailgating"],a:1,e:"Vishing is voice phishing over the phone."},
 {q:"The CFO receives an email crafted to look like it's from the board chairman. What is this?",o:["Whaling","Smishing","Dumpster diving","Evil twin"],a:0,e:"Whaling targets high-level executives."},
 {q:"A text message says a package is held and asks the user to click a link. What is this?",o:["Vishing","Smishing","Spoofing","XSS"],a:1,e:"Smishing is phishing by SMS."},
 {q:"An attacker sets up a hotspot named 'CoffeeShop-Guest' next to the real one. What is this?",o:["Evil twin","On-path only","DDoS","Zero-day"],a:0,e:"An evil twin copies a trusted network name to lure users."},
 {q:"An attacker secretly sits between a user and a website, reading and changing traffic. What is this?",o:["On-path attack","Brute force","Dumpster diving","Shoulder surfing"],a:0,e:"On-path (man-in-the-middle) attacks intercept traffic."},
 {q:"A vendor announces a flaw that attackers are already exploiting, with no patch available. What is this?",o:["Zero-day","Insider threat","Supply chain","Spoofing"],a:0,e:"A zero-day has no fix available yet."},
 {q:"An attacker types ' OR 1=1 -- into a website login form. What attack is this?",o:["XSS","SQL injection","Brute force","Phishing"],a:1,e:"SQL injection sends database commands through input fields."},
 {q:"Thousands of compromised computers flood a website until it goes offline. What is this?",o:["DoS","DDoS","Spoofing","On-path"],a:1,e:"A distributed denial of service uses many sources."},
 {q:"Someone searches the office recycling bins for printed passwords. What is this?",o:["Dumpster diving","Tailgating","Impersonation","Whaling"],a:0,e:"Dumpster diving finds sensitive info in trash. Shred documents."},
 {q:"A share grants Everyone 'Full Control'. The folder's NTFS permissions give Sales 'Read'. What can Sales users do over the network?",o:["Full control","Read only","Modify","Nothing"],a:1,e:"Over the network, the most restrictive of share and NTFS permissions applies."},
 {q:"A user has Read access through one group and an explicit Deny through another. What happens?",o:["Read wins","Deny wins","The most recent change wins","Full control is granted"],a:1,e:"An explicit deny overrides allow permissions."},
 {q:"Which feature asks for confirmation before a program makes admin-level changes in Windows?",o:["UAC","BitLocker","EFS","Windows Hello"],a:0,e:"User Account Control prompts before elevation."},
 {q:"Which feature encrypts a USB flash drive in Windows?",o:["EFS","BitLocker To Go","FileVault","Windows Hello"],a:1,e:"BitLocker To Go encrypts removable drives."},
 {q:"Which should be disabled so an inserted USB drive can't automatically launch a program?",o:["AutoRun/AutoPlay","UAC","Windows Update","Fast Startup"],a:0,e:"Disabling AutoRun and AutoPlay stops media from launching code."},
 {q:"How can a technician stop users from changing the boot order on their PCs?",o:["Set a BIOS/UEFI password","Enable UAC","Disable AutoPlay","Use EFS"],a:0,e:"A firmware password protects UEFI settings."},
 {q:"Which account should be disabled on every Windows workstation?",o:["Guest","Standard user","Administrator group","SYSTEM"],a:0,e:"The Guest account allows access without a password."},
 {q:"A company is donating old PCs with HDDs. What should be done to the drives?",o:["Quick format","Delete the user profiles","Securely wipe them by overwriting the data","Defragment them"],a:2,e:"A standard format leaves data recoverable. Overwrite it."},
 {q:"Which destruction method does NOT work on SSDs?",o:["Shredding","Degaussing","Incineration","Drilling"],a:1,e:"Degaussing works on magnetic media. SSDs store data in flash chips."},
 {q:"A hospital hires a vendor to destroy old drives. What should the vendor provide?",o:["A certificate of destruction","A restore point","A license key","An SLA"],a:0,e:"The certificate documents that data was destroyed, for compliance."},
 {q:"A lost company phone holds sensitive email. What should IT do?",o:["Remote wipe it","Wait for it to turn up","Change the SSID","Disable Bluetooth"],a:0,e:"Remote wipe erases the data before anyone can access it."},
 {q:"Which screen lock is NOT secure?",o:["PIN","Fingerprint","Swipe","Face"],a:2,e:"Swipe unlocks with no authentication at all."},
 {q:"What is the FIRST thing to change on a new SOHO router?",o:["The channel","The default admin password","The DHCP range","The LED brightness"],a:1,e:"Default credentials are published online."},
 {q:"Why should UPnP be disabled on a SOHO router?",o:["It slows Wi-Fi","It lets devices and malware open ports without approval","It disables DHCP","It blocks DNS"],a:1,e:"UPnP lets internal devices create port forwards automatically."},
 {q:"A small business hosts a public web server. Where should it be placed?",o:["On the internal LAN","In a screened subnet (DMZ)","On the guest Wi-Fi","Behind a modem only"],a:1,e:"A screened subnet separates public servers from the internal network."},
 {q:"A user wants to confirm a downloaded installer hasn't been altered. What should they compare?",o:["The file's hash with the one on the vendor's site","The file name","The download speed","The file icon"],a:0,e:"A matching hash proves the file hasn't been altered."}
];

registerModule({
  id:"sec",slug:"security",title:"Security",
  lessons:LESSONS,
  decks:[["access","Access and destruction"],["threats","Threats"],["malware","Malware"],["config","Wireless and Windows"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["wifi","mal","phish","perm"],
  viz(){
/* ---- Wireless security ladder ---- */
(function(){
  const el=$("#viz-wifi");if(!el)return;
  const P={
    WEP:{lvl:1,c:"RC4",y:"1999",s:"Broken. Its keys can be cracked in minutes. Never use it.",st:"bad"},
    WPA:{lvl:2,c:"TKIP (RC4)",y:"2003",s:"A stopgap for WEP hardware. TKIP is also broken now.",st:"bad"},
    WPA2:{lvl:4,c:"AES (CCMP)",y:"2004",s:"Secure with AES and a long passphrase. Avoid the TKIP setting. Personal mode is vulnerable to offline guessing of weak passwords.",st:"good"},
    WPA3:{lvl:5,c:"AES (GCMP, CCMP)",y:"2018",s:"SAE replaces the pre-shared key handshake, so captured traffic can't be used to guess the password offline. Best choice.",st:"good"}
  };
  const seen=new Set();let cur="WEP",mode="Personal";
  el.innerHTML=`<div class="viz-title">Wireless security, from worst to best</div>
  <div class="viz-controls">${Object.keys(P).map(k=>`<button class="chip" data-w="${k}">${k}</button>`).join("")}<span class="grow"></span><button class="chip" data-m="Personal">Personal</button><button class="chip" data-m="Enterprise">Enterprise</button></div>
  <div class="wl">${Object.keys(P).map(k=>`<div class="wl-col" data-col="${k}"><div class="wl-bar"><i style="height:${P[k].lvl*20}%"></i></div><span>${k}</span></div>`).join("")}<div class="wl-info"></div></div>`;
  function draw(){
    const p=P[cur];seen.add(cur);
    el.querySelectorAll("[data-w]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.w===cur));
    el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
    el.querySelectorAll(".wl-col").forEach(c=>{c.classList.toggle("sel",c.dataset.col===cur);c.classList.toggle("bad",P[c.dataset.col].st==="bad")});
    const auth=cur==="WEP"?"Shared key":mode==="Personal"?(cur==="WPA3"?"SAE passphrase":"Pre-shared key (PSK)"):"802.1X with a RADIUS server";
    $(".wl-info",el).innerHTML=`<h3 class="wl-h">${cur} <span class="s-small">${p.y}</span></h3><p><span class="s-small">ENCRYPTION</span><br><b class="mono">${p.c}</b></p><p><span class="s-small">LOGIN (${mode.toUpperCase()})</span><br><b>${auth}</b></p><p class="${p.st==="bad"?"status-bad":""}">${p.s}</p>${mode==="Enterprise"&&cur!=="WEP"?`<p class="s-small">Enterprise mode gives every user their own login, checked by RADIUS.</p>`:""}`;
    if(seen.size===4)award("viz:wifi",20,"Compared wireless security");
  }
  el.addEventListener("click",e=>{const w=e.target.closest("[data-w]"),m=e.target.closest("[data-m]");if(w)cur=w.dataset.w;if(m)mode=m.dataset.m;if(w||m)draw()});draw();
})();

/* ---- Malware removal stepper ---- */
(function(){
  const el=$("#viz-mal");if(!el)return;
  const S=[
    ["Investigate and verify symptoms","Pop-ups everywhere, the browser home page changed, and the PC is slow. You confirm it isn't just a bad extension or a failing drive."],
    ["Quarantine the infected system","Unplug the network cable and turn off Wi-Fi so it can't spread. Don't plug in USB drives that will go back to other PCs."],
    ["Disable System Restore","Turn off System Restore and delete restore points, which may contain the malware."],
    ["Remediate: update and scan","Update anti-malware definitions (on a clean PC if needed), then scan and remove in Safe Mode or from a preinstallation environment."],
    ["Schedule scans and run updates","Set daily scans and install OS and app updates to close the hole it used."],
    ["Enable System Restore and create a restore point","Turn System Restore back on and create a clean restore point."],
    ["Educate the end user","Show the user how the infection started (a fake download) and how to spot it next time."]
  ];
  let i=-1;
  el.innerHTML=`<div class="viz-title">Clean an infected PC, one step at a time</div>
  <div class="mal">${S.map((s,j)=>`<div class="mal-st" id="ms${j}"><span class="mono">${j+1}</span><b>${s[0]}</b></div>`).join("")}</div>
  <div class="pcbox"><div class="pc-screen" id="mal-pc"><span>⚠ 47 threats</span></div><div class="caption" aria-live="polite"></div></div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button></div>`;
  function draw(){
    S.forEach((_,j)=>$("#ms"+j).className="mal-st"+(j<i?" done":j===i?" on":""));
    const pc=$("#mal-pc");pc.className="pc-screen s"+Math.max(i,0);
    const LBL=["⚠ Infected","⚠ Isolated","⚠ Isolated","✓ Threats removed","✓ Clean","✓ Clean","✓ Clean"];
    pc.innerHTML=`<span>${LBL[Math.max(i,0)]}</span>${i>=1&&i<=3?'<em class="s-small">offline</em>':""}`;
    $(".caption",el).innerHTML=i<0?"Press <b>Next step</b> to start.":`<b>Step ${i+1}.</b> ${S[i][1]}`;
    $('[data-a="back"]',el).disabled=i<0;$('[data-a="next"]',el).disabled=i>=S.length-1;
    if(i===S.length-1)award("viz:mal",30,"Walked through malware removal");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next")i=Math.min(i+1,S.length-1);if(a==="back")i=Math.max(i-1,-1);if(a)draw()});draw();
})();

/* ---- Phishing inspector ---- */
(function(){
  const el=$("#viz-phish");if(!el)return;
  const FL={
    from:"<b>Look-alike sender.</b> The domain is cloudrive-support.co, not the company's real domain. Attackers register names that look right at a glance.",
    urgent:"<b>Urgency and threats.</b> \"24 hours\" and \"permanently deleted\" are meant to rush you past thinking.",
    greet:"<b>Generic greeting.</b> A real provider knows your name.",
    link:"<b>Mismatched link.</b> The button says CloudDrive, but hovering shows it goes to cloudrive-verify.ru/login.",
    attach:"<b>Dangerous attachment.</b> Invoice.pdf.exe is a program with a fake .pdf in its name. Windows hides known extensions by default, so users only see \"Invoice.pdf\".",
    pass:"<b>Asks for your password.</b> Legitimate services never ask you to confirm a password by email."
  };
  const found=new Set();
  el.innerHTML=`<div class="viz-title">Find the six red flags <span class="s-small" id="ph-n">0 of 6</span></div>
  <div class="mail">
    <div class="mail-h"><div><span class="s-small">From</span> <button class="flag" data-fl="from">CloudDrive Security &lt;security@cloudrive-support.co&gt;</button></div>
    <div><span class="s-small">Subject</span> <button class="flag" data-fl="urgent">URGENT: Your account will be deleted in 24 hours</button></div></div>
    <div class="mail-b"><p><button class="flag" data-fl="greet">Dear Valued Customer,</button></p>
    <p>We detected unusual sign-in activity. Your files will be permanently deleted unless you verify your account.</p>
    <p><button class="flag" data-fl="pass">Please confirm your username and password</button> using the secure link below.</p>
    <p><button class="flag mail-btn" data-fl="link">Verify my CloudDrive account</button></p>
    <p>Your latest invoice is attached.</p>
    <button class="flag mail-att" data-fl="attach">📎 Invoice.pdf.exe <span class="s-small">412 KB</span></button></div>
  </div>
  <div class="caption" aria-live="polite">Click anything suspicious.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-fl]");if(!b)return;found.add(b.dataset.fl);b.classList.add("hit");
    $("#ph-n").textContent=`${found.size} of 6`;$(".caption",el).innerHTML=FL[b.dataset.fl]+(found.size===6?` <span class="status-good">All six found.</span> Report it with the phishing button, then delete it.`:"");
    if(found.size===6)award("viz:phish",30,"Spotted every phishing red flag")});
})();

/* ---- Share + NTFS permissions ---- */
(function(){
  const el=$("#viz-perm");if(!el)return;
  const LV=["No access","Read","Modify","Full control"];
  const SH=[["Read",1],["Change",2],["Full Control",3]],NT=[["Read",1],["Modify",2],["Full control",3]];
  let sh=3,nt=1;const seen=new Set();
  el.innerHTML=`<div class="viz-title">Share vs NTFS permissions</div>
  <div class="perm">
    <div class="perm-col"><span class="s-small">SHARE PERMISSION</span><div class="chips">${SH.map(([n,v])=>`<button class="chip" data-sh="${v}">${n}</button>`).join("")}</div>
    <span class="s-small">NTFS PERMISSION</span><div class="chips">${NT.map(([n,v])=>`<button class="chip" data-nt="${v}">${n}</button>`).join("")}</div></div>
    <div class="perm-out">
      <div class="po"><span class="s-small">OVER THE NETWORK</span><b id="pm-net"></b><em class="s-small">share and NTFS both apply</em></div>
      <div class="po"><span class="s-small">SITTING AT THE PC</span><b id="pm-loc"></b><em class="s-small">only NTFS applies</em></div>
    </div>
  </div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(){
    seen.add(sh+"-"+nt);
    el.querySelectorAll("[data-sh]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.sh===sh));
    el.querySelectorAll("[data-nt]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.nt===nt));
    const net=Math.min(sh,nt);
    $("#pm-net").textContent=LV[net];$("#pm-loc").textContent=LV[nt];
    $("#pm-net").className="lv-"+net;$("#pm-loc").className="lv-"+nt;
    $(".caption",el).innerHTML=sh===nt?"Both permissions match, so the result is the same either way.":`Over the network, the <b>most restrictive</b> wins, so ${sh<nt?"the share":"NTFS"} limits this user to <b>${LV[net]}</b>. Remember too: an explicit <b>Deny</b> always wins, and files <b>copied</b> to a new folder take on that folder's permissions.`;
    if(seen.size>=4)award("viz:perm",20,"Worked out effective permissions");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-sh]"),b=e.target.closest("[data-nt]");if(a)sh=+a.dataset.sh;if(b)nt=+b.dataset.nt;if(a||b)draw()});draw();
})();
  },
  sims:[
    {id:"remove",type:"order",title:"Remove the malware",
      scenario:"A receptionist's PC is infected. Tap the seven CompTIA malware removal steps in order.",
      steps:["Investigate and verify malware symptoms","Quarantine the infected system","Disable System Restore","Remediate: update anti-malware, then scan and remove","Schedule scans and run updates","Enable System Restore and create a restore point","Educate the end user"],
      success:"The PC is clean and the user knows what to watch for."},
    {id:"attacks",type:"match",title:"Name that attack",
      scenario:"The security team logged eight incidents this week. Name each one. Tap an attack type, then tap the incident.",
      items:[["Vishing","vish"],["Whaling","whale"],["Tailgating","tail"],["Evil twin","twin"],["SQL injection","sqli"],["Shoulder surfing","shoulder"],["Business email compromise","bec"],["Smishing","smish"]],
      slots:[["vish","Caller posing as the bank asks for a PIN",""],["whale","Fake legal summons emailed to the CEO",""],["tail","Visitor walks in behind an employee",""],["twin","A second 'Hotel-WiFi' network appears in the lobby",""],["sqli","Web form input: ' OR 1=1 --",""],["shoulder","Someone watches a user type their password",""],["bec","\"CFO\" email asks accounting to wire $40,000",""],["smish","Text: your package is held, click here",""]],
      success:"Every incident is correctly classified."},
    {id:"soho",title:"Lock down a SOHO router",mount(el,api,sim){
      const F={pw:false,fw:false,sec:"WPA2 (TKIP)",ssid:"HomeRouter-5G-04",wps:true,upnp:true,guest:"Same network",pf:true,mgmt:"LAN and WAN"};let R={...F},graded=null;
      const CHECKS=[
        ["Default admin password changed",()=>R.pw,"Default router passwords are published online."],
        ["Firmware updated",()=>R.fw,"Updates patch known router vulnerabilities."],
        ["Strong wireless encryption",()=>R.sec==="WPA3"||R.sec==="WPA2 (AES)","Use WPA3, or WPA2 with AES. TKIP and WEP are broken."],
        ["Default SSID changed",()=>R.ssid.trim()&&R.ssid.trim()!=="HomeRouter-5G-04","The default SSID tells attackers the router model."],
        ["WPS disabled",()=>!R.wps,"WPS PINs can be brute-forced."],
        ["UPnP disabled",()=>!R.upnp,"UPnP lets malware open ports without anyone noticing."],
        ["Guest Wi-Fi isolated from the office",()=>R.guest!=="Same network","Customers shouldn't share a network with the office PCs."],
        ["Unneeded port forward removed",()=>!R.pf,"The old RDP forward exposes a PC to the internet."],
        ["Management allowed only from the LAN",()=>R.mgmt==="LAN only","Remote admin over the internet invites attacks."]
      ];
      function draw(){
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <div class="scenario"><p>A small bakery uses this router for its office PC and offers free Wi-Fi to customers. It still has its factory settings. The owner wants it secured. Nobody needs to reach the office PC from outside.</p></div>
        <div class="router"><div class="router-bar"><span>Router admin</span><span class="mono">192.168.0.1</span></div><div class="router-body">
          <div class="rf"><span>Admin password</span><div class="fwline">${R.pw?'<span class="status-good">Changed</span>':'<b class="mono">admin / admin</b><button class="btn" data-a="pw">Change</button>'}</div></div>
          <div class="rf"><span>Firmware</span><div class="fwline">${R.fw?'<span class="status-good">v3.2.1 (latest)</span>':'<b class="mono">v1.0.4</b><button class="btn" data-a="fw">Update</button>'}</div></div>
          <label class="rf"><span>SSID</span><input id="s-ssid" data-f="ssid" value="${R.ssid}"></label>
          <label class="rf"><span>Security</span><select id="s-sec" data-f="sec">${["WEP","WPA2 (TKIP)","WPA2 (AES)","WPA3"].map(o=>`<option ${R.sec===o?"selected":""}>${o}</option>`).join("")}</select></label>
          <label class="rf rf-tog"><span>WPS</span><input type="checkbox" id="s-wps" data-f="wps" ${R.wps?"checked":""}></label>
          <label class="rf rf-tog"><span>UPnP</span><input type="checkbox" id="s-upnp" data-f="upnp" ${R.upnp?"checked":""}></label>
          <label class="rf"><span>Guest Wi-Fi</span><select id="s-guest" data-f="guest">${["Same network","Isolated guest network"].map(o=>`<option ${R.guest===o?"selected":""}>${o}</option>`).join("")}</select></label>
          <div class="rf"><span>Port forwarding</span><div class="fwline">${R.pf?'<b class="mono">TCP 3389 → 192.168.0.20</b><button class="btn" data-a="pf">Delete</button>':'<span class="status-good">No rules</span>'}</div></div>
          <label class="rf"><span>Remote management</span><select id="s-mgmt" data-f="mgmt">${["LAN and WAN","LAN only"].map(o=>`<option ${R.mgmt===o?"selected":""}>${o}</option>`).join("")}</select></label>
        </div></div>
        ${graded?`<div class="grade">${CHECKS.map((c,i)=>`<div class="${graded[i]?"g-ok":"g-no"}"><b>${graded[i]?"✓":"✗"} ${c[0]}</b>${graded[i]?"":`<span>${c[2]}</span>`}</div>`).join("")}</div>`:""}
        <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">All ${CHECKS.length} settings secured.</span> The bakery's network is locked down.`:`<b>${graded.filter(Boolean).length} of ${CHECKS.length}</b> settings secured. Fix the ones marked ✗ and check again.`):"Press <b>Check router</b> when you're done."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Check router</button><button class="btn" data-a="reset">Start over</button></div>`;
      }
      el.addEventListener("input",e=>{const f=e.target.dataset.f;if(f==="ssid")R.ssid=e.target.value});
      el.addEventListener("change",e=>{const f=e.target.dataset.f;if(!f||f==="ssid")return;R[f]=e.target.type==="checkbox"?e.target.checked:e.target.value});
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;
        if(a==="pw"){R.pw=true;draw()}if(a==="fw"){R.fw=true;draw()}if(a==="pf"){R.pf=false;draw()}if(a==="reset"){R={...F};graded=null;draw()}
        if(a==="grade"){graded=CHECKS.map(c=>!!c[1]());if(graded.every(Boolean))api.pass();draw()}});
      draw();
    }}
  ],
  badges:[
    ["reader","SC","Guardian","Mark all 8 security lessons studied",c=>c.allStudied()],
    ["lab","SH","Shield Lab","Complete all 4 security diagrams",c=>c.vizAll()],
    ["remove","MR","Malware Hunter","Pass the malware removal simulation",c=>c.passed("remove")],
    ["attacks","SE","Social Engineer Spotter","Pass the attack identification simulation",c=>c.passed("attacks")],
    ["soho","LK","Locksmith","Pass the SOHO router simulation",c=>c.passed("soho")],
    ["perfect","ZT","Zero Trust","Score 100% on a security quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
