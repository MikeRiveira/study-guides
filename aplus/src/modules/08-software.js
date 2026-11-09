/* ================= Module 8: Software Troubleshooting (Core 2, 220-1202) ================= */
(function(){
const LESSONS=[
{id:"boot",num:"8.1",title:"Windows boot and stability problems",short:"Boot and stability",html:`
<div class="scroll"><table><thead><tr><th>Symptom</th><th>Common fixes</th></tr></thead><tbody>
<tr><td>Blue screen (BSOD)</td><td>Note the stop code. Roll back the latest driver or update, test RAM, check temperatures.</td></tr>
<tr><td>Won't boot, or boot loops</td><td>Startup Repair, Safe Mode, uninstall the latest update, System Restore</td></tr>
<tr><td>"No OS found"</td><td>Check boot order and remove USB drives, then repair the boot loader</td></tr>
<tr><td>Frequent shutdowns</td><td>Overheating or power (hardware). Check Event Viewer for the reason.</td></tr>
<tr><td>Services fail to start</td><td>Check dependencies and the account it runs as in services.msc. Restart the service.</td></tr>
<tr><td>System instability</td><td>Recent changes, failing RAM or drive, malware, corrupted system files (sfc)</td></tr>
<tr><td>Slow profile load</td><td>Large roaming profile, network problems, or a corrupted profile. Rebuild the profile.</td></tr>
<tr><td>Time drift</td><td>Dead CMOS battery or a time sync (NTP) problem. Wrong time breaks domain logins and certificates.</td></tr>
<tr><td>USB controller resource warnings</td><td>Too many devices on one controller. Move some to another port or controller.</td></tr>
</tbody></table></div>
<p>When Windows fails to start twice, it opens the <b>Windows Recovery Environment (WinRE)</b>. Explore its tools:</p>
<div class="viz" id="viz-winre"></div>`},
{id:"perf",num:"8.2",title:"Performance and application problems",short:"Performance",html:`
<p>Task Manager is where most performance investigations start. Pick a complaint, then click the process causing it.</p>
<div class="viz" id="viz-tm"></div>
<ul><li><b>Degraded performance:</b> too many startup apps, not enough RAM, a full or failing drive, malware, or thermal throttling.</li>
<li><b>Low memory warnings:</b> close apps, check for a memory leak (one app's memory keeps growing), add RAM.</li>
<li><b>App crashes:</b> update, repair or reinstall the app. Check Event Viewer's Application log and the app's requirements.</li>
<li><b>App won't install:</b> check requirements, disk space, permissions (run as administrator), and 32 vs 64-bit.</li></ul>`},
{id:"ladder",num:"8.3",title:"Fixing Windows: from gentle to drastic",short:"Repair ladder",html:`
<p>Always try the least disruptive fix first. Each rung fixes more but risks more data or time.</p>
<div class="viz" id="viz-ladder"></div>
<div class="tip"><b>Exam tip.</b> When a question says a problem began after an update or driver install, the answer is usually to <b>roll back</b> that change. When files must be kept, avoid reimaging.</div>`},
{id:"mobile",num:"8.4",title:"Mobile OS and app problems",short:"Mobile issues",html:`
<p>Tap a symptom on the phone to see the likely cause and fix.</p>
<div class="viz" id="viz-phone"></div>
<ul><li>The usual order: close and reopen the app, restart the device, update the app and OS, clear the app's cache or storage, reinstall the app, and finally factory reset (after a backup).</li>
<li><b>Won't update:</b> check storage space, battery level (updates often need 50%+), Wi-Fi, and whether the device is still supported.</li></ul>`},
{id:"mobsec",num:"8.5",title:"Mobile security problems",short:"Mobile security",html:`
<h3>Risky setups</h3>
<ul><li><b>Sideloading APKs</b> from outside Google Play skips app store security checks.</li>
<li><b>Developer mode</b> left on exposes debugging features.</li>
<li><b>Rooting</b> (Android) or <b>jailbreaking</b> (iOS) removes built-in protections. Many MDM policies block these devices.</li>
<li><b>Bootleg or spoofed apps</b> imitate real apps to steal data.</li></ul>
<h3>Symptoms of compromise</h3>
<ul><li>High network traffic, or a warning about reaching the data limit</li>
<li>Sluggish response and high battery drain</li>
<li>Limited or no internet connectivity</li>
<li>Unexpected app behavior, or apps you didn't install</li>
<li>Leaked personal files or data</li></ul>
<p><b>Response:</b> check for unknown apps and remove them, run an anti-malware scan, update the OS, reset passwords, and factory reset if it persists.</p>`},
{id:"pcsec",num:"8.6",title:"PC and browser security symptoms",short:"PC security",html:`
<ul><li><b>Can't reach the network</b>, often because malware changed proxy or DNS settings, or a firewall blocked it.</li>
<li><b>Desktop alerts</b> and <b>fake antivirus warnings</b> that demand payment (scareware).</li>
<li><b>Altered files:</b> missing, renamed or inaccessible files, a sign of ransomware.</li>
<li><b>Unwanted notifications</b> from websites that were allowed to push alerts.</li>
<li><b>OS update failures</b>: malware often blocks updates and security tools.</li></ul>
<h3>Browser symptoms</h3>
<ul><li><b>Random pop-ups:</b> adware or a malicious extension. Remove unknown extensions and enable the pop-up blocker.</li>
<li><b>Certificate warnings:</b> a wrong system clock, an expired or self-signed certificate, or an on-path attack. Don't click through on unknown sites.</li>
<li><b>Redirection</b> to unexpected sites: a hijacked browser, modified hosts file or DNS settings.</li>
<li><b>Degraded browser performance:</b> too many extensions or tabs, a full cache, or a cryptomining script.</li></ul>`}
];

const CARDS=[
 ...[["BSOD right after a driver update","Roll back the driver (Safe Mode if needed)"],["Boot loop after a Windows update","WinRE, Uninstall Updates"],["No OS found","Check boot order, remove USB drives, repair boot"],["Time drift","CMOS battery or NTP sync problem"],
     ["Slow profile load","Large roaming profile or corrupted profile. Rebuild it."],["Service won't start","Check dependencies and its logon account"],["Memory leak","One app's memory use grows until the system slows"],["Corrupted system files","sfc /scannow"],
     ["Startup Repair","WinRE tool that fixes boot problems automatically"],["Safe Mode","Boots with minimal drivers and services"],["System Restore","Rolls back system files, drivers and settings. Keeps personal files."],["Reset this PC","Reinstalls Windows, optionally keeping files"],
     ["Reimage","Wipe and restore a standard image. Most drastic."],["Rebuild a Windows profile","Rename the old profile, sign in again, copy data back"]].map((c,i)=>({deck:"win",id:"wn"+i,q:c[0],a:c[1]})),
 ...[["App keeps crashing on a phone","Force close, update, clear cache, reinstall"],["Phone won't autorotate","Rotation lock is on, or the app doesn't support it"],["OS update fails on a phone","Storage space, battery level, Wi-Fi, device support"],["Fast battery drain","Check battery usage by app, screen brightness, malware"],
     ["Random reboots on a phone","Bad app, overheating, failing battery, OS bug"],["Bluetooth won't pair","Toggle Bluetooth, forget and re-pair, check range"],["NFC payments fail","NFC turned off, or case blocks it"],["Wi-Fi connected, no internet","Forget and rejoin, check the router, captive portal"]].map((c,i)=>({deck:"mob",id:"mb"+i,q:c[0],a:c[1]})),
 ...[["APK sideloading","Installing Android apps outside Google Play"],["Root / jailbreak","Removes OS protections. Blocked by MDM."],["App spoofing","Fake app imitating a real one"],["Unexpected data limit warning","Possible malware sending data"],
     ["High battery drain plus heat","Possible malware or cryptominer"],["Developer mode","Debug features. Turn off when not needed."],["Leaked personal files","Device may be compromised. Reset passwords, scan, reset."]].map((c,i)=>({deck:"msec",id:"ms"+i,q:c[0],a:c[1]})),
 ...[["Fake antivirus alerts demanding payment","Scareware. Don't pay, scan with real anti-malware."],["Random pop-ups in the browser","Adware or a malicious extension"],["Certificate warning on every site","Check the system date and time"],["Redirected to unexpected sites","Browser hijacker, hosts file or DNS changed"],
     ["Files renamed and inaccessible","Ransomware"],["Windows Update keeps failing","Malware may be blocking it"],["Unwanted website notifications","Revoke notification permission in browser settings"]].map((c,i)=>({deck:"pcs",id:"ps"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"A PC started showing BSODs right after a new graphics driver was installed. What should the technician do first?",o:["Reimage the PC","Roll back the graphics driver","Replace the RAM","Reset the PC"],a:1,e:"The most recent change is the prime suspect. Roll it back."},
 {q:"A PC is stuck in a reboot loop after a Windows update. Where can the update be removed?",o:["WinRE Advanced options, Uninstall Updates","Task Manager","Disk Cleanup","Device Manager in normal mode"],a:0,e:"WinRE can remove the latest quality or feature update without booting Windows."},
 {q:"Which WinRE tool automatically fixes problems that stop Windows from loading?",o:["Startup Repair","System Image Recovery","Command Prompt","UEFI Firmware Settings"],a:0,e:"Startup Repair scans for and fixes common boot problems."},
 {q:"A user's PC shows 'No operating system found' after a weekend. A USB drive is plugged in. What should be checked first?",o:["Remove the USB drive and check boot order","Replace the hard drive","Reinstall Windows","Update the BIOS"],a:0,e:"The firmware may be trying to boot the USB drive."},
 {q:"Which startup mode loads only the minimum drivers and services?",o:["Safe Mode","Fast Startup","Hibernate","Clean install"],a:0,e:"Safe Mode helps isolate problem drivers and software."},
 {q:"A user's PC became unstable after software was installed yesterday. Which tool undoes system changes but keeps personal files?",o:["System Restore","Reset this PC","Reimage","Disk Management"],a:0,e:"System Restore rolls back system files, registry and drivers to a restore point."},
 {q:"Windows reports corrupted system files. Which command should be run?",o:["sfc /scannow","chkdsk /f","gpupdate /force","ipconfig /flushdns"],a:0,e:"System File Checker repairs protected system files."},
 {q:"A technician has tried everything else and needs to reinstall Windows but keep the user's files. Which option fits?",o:["Reset this PC, keep my files","Reimage the drive","Format the drive","System Image Recovery to a factory image"],a:0,e:"Reset can keep personal files while reinstalling Windows."},
 {q:"A user gets a temporary profile at login, and their desktop is empty. What is the likely fix?",o:["Rebuild the Windows profile","Replace the hard drive","Update the BIOS","Disable UAC"],a:0,e:"A corrupted profile can be rebuilt and the user's data copied back."},
 {q:"Domain logins fail with time-related errors, and the PC clock is 12 minutes off. What is the likely cause?",o:["Time drift from a CMOS battery or NTP problem","DNS failure","Bad NIC","Full disk"],a:0,e:"Kerberos fails when clocks differ by more than 5 minutes by default."},
 {q:"A service fails to start after the account it runs under had its password changed. Where is this fixed?",o:["services.msc, the service's Log On tab","Device Manager","Disk Management","msinfo32"],a:0,e:"Update the password stored for the service's logon account."},
 {q:"A PC gets slower over the day, and one app's memory use climbs steadily. What is happening?",o:["A memory leak","Disk fragmentation","A DNS problem","Thermal throttling"],a:0,e:"A memory leak means the app never frees the memory it uses."},
 {q:"An app crashes on launch. Where can the technician find error details?",o:["Event Viewer, Application log","Disk Cleanup","Device Manager","Power Options"],a:0,e:"The Application log records crashes and faulting modules."},
 {q:"A PC takes 4 minutes to boot. Task Manager shows 30 startup apps marked 'High impact'. What should be done?",o:["Disable unnecessary startup apps","Replace the CPU","Reimage immediately","Change the SSID"],a:0,e:"Disabling startup apps speeds boot time."},
 {q:"Disk usage stays at 100% on an older PC with an HDD. Which upgrade helps most?",o:["Replace the HDD with an SSD","Add a second monitor","Install a faster NIC","Change the wallpaper"],a:0,e:"SSDs have far faster random access than HDDs."},
 {q:"A USB headset and webcam fail with a 'not enough USB controller resources' warning. What should be done?",o:["Move devices to ports on a different USB controller","Replace the motherboard","Reinstall Windows","Disable the firewall"],a:0,e:"Each controller has limited endpoints. Spread devices across controllers."},
 {q:"An app won't install, saying it requires a 64-bit OS. What is true?",o:["The PC runs a 32-bit OS","The disk is full","The app is malware","UAC blocked it"],a:0,e:"64-bit apps can't run on a 32-bit OS."},
 {q:"Which is the most drastic fix for a Windows problem?",o:["Reimage the PC","Restart the service","Roll back a driver","Run sfc"],a:0,e:"Reimaging wipes the drive, so data must be backed up first."},
 {q:"A phone app keeps crashing. What should be tried first?",o:["Force close and reopen it","Factory reset","Replace the battery","Root the phone"],a:0,e:"Start with the least disruptive fix."},
 {q:"A phone's screen won't rotate in any app. What is most likely?",o:["Rotation lock is on","The accelerometer is broken","The OS needs a reset","The SIM card is loose"],a:0,e:"Check the rotation lock setting first."},
 {q:"A phone's OS update keeps failing. What should be checked?",o:["Free storage space and battery level","The screen protector","Bluetooth pairing","The ringtone"],a:0,e:"Updates need free space, enough battery charge and a stable connection."},
 {q:"A phone's battery drains quickly after installing a new app. What should be checked?",o:["Battery usage by app in Settings","The SIM card","The case","Screen resolution only"],a:0,e:"Battery settings show which app uses the most power."},
 {q:"A phone's Bluetooth speaker won't reconnect. What should be tried?",o:["Forget the device and pair again","Factory reset the phone","Replace the battery","Turn on airplane mode permanently"],a:0,e:"Removing and re-pairing clears stale pairing data."},
 {q:"Tap-to-pay stopped working on a phone. What should be checked first?",o:["NFC is enabled","Wi-Fi is on","The phone is rooted","Location services"],a:0,e:"NFC must be turned on for contactless payments."},
 {q:"A user installed a game from a website instead of Google Play, and now the phone shows pop-ups. What was the risk?",o:["Sideloading an untrusted APK","Developer mode","Low storage","Airplane mode"],a:0,e:"Sideloaded APKs skip Play Store security checks."},
 {q:"A company's MDM blocks a phone from accessing email because it was jailbroken. Why?",o:["Jailbreaking removes OS security protections","Jailbroken phones are slower","It voids Wi-Fi","It changes the IMEI"],a:0,e:"Jailbroken and rooted devices can run unvetted code with elevated privileges."},
 {q:"A phone uses far more mobile data than usual and gets warm when idle. What should be suspected?",o:["Malware","A bad screen protector","Rotation lock","A weak password"],a:0,e:"Unexplained data use and battery drain are classic compromise symptoms."},
 {q:"A user downloads what looks like their bank's app, but it's from a different developer and asks for unusual permissions. What is this?",o:["App spoofing","Developer mode","Sideloading only","A legitimate update"],a:0,e:"Spoofed apps imitate real ones to steal credentials."},
 {q:"A Windows PC shows a full-screen 'Your PC is infected, call this number' alert. What is this?",o:["Scareware with a fake antivirus alert","A real Defender warning","A BSOD","A Windows update"],a:0,e:"Fake alerts try to scare users into paying or calling scammers."},
 {q:"Users report many files renamed with an unknown extension and they can't open them. What is the likely cause?",o:["Ransomware","Disk fragmentation","A bad driver","A full recycle bin"],a:0,e:"Ransomware encrypts and renames files."},
 {q:"A browser shows certificate warnings on every HTTPS site, including well-known ones. What should be checked first?",o:["The system date and time","The monitor resolution","The printer driver","The Wi-Fi channel"],a:0,e:"A wrong clock makes valid certificates look expired or not yet valid."},
 {q:"Typing a bank's address sends the browser to a look-alike site. Which could cause this?",o:["A modified hosts file or DNS settings","A full cache","A pop-up blocker","Low battery"],a:0,e:"Redirection often comes from changed hosts or DNS settings."},
 {q:"Pop-ups appear even on trusted sites, and the search engine changed by itself. What should be done?",o:["Remove unknown browser extensions and reset browser settings","Replace the NIC","Update the BIOS","Disable the firewall"],a:0,e:"Adware and hijackers often install as extensions."},
 {q:"A browser has become very slow, and CPU use spikes on one website. What could it be?",o:["A cryptomining script","A bad Ethernet cable","An expired license","A dead pixel"],a:0,e:"Some sites run mining scripts in the browser."},
 {q:"Windows Update and the antivirus both fail to run. What might this indicate?",o:["Malware is blocking security tools","The PC is new","The monitor is failing","The keyboard is unplugged"],a:0,e:"Malware often disables updates and security software."},
 {q:"A user sees constant notifications from a website they visited once. How should they stop them?",o:["Revoke that site's notification permission in browser settings","Reinstall Windows","Replace the browser","Disable Wi-Fi"],a:0,e:"Sites can only push notifications if they were allowed to."},
 {q:"A PC suddenly can't reach any website, and the proxy setting was changed to an unknown address. What is likely?",o:["Malware changed the proxy settings","The ISP is down","The cable is unplugged","DHCP is off"],a:0,e:"Malware often redirects traffic through its own proxy."},
 {q:"Which is the best order for fixing a misbehaving app on Windows?",o:["Restart it, update or repair it, then reinstall it","Reimage, then reinstall","Replace hardware first","Disable antivirus permanently"],a:0,e:"Start gentle and escalate."},
 {q:"A technician needs to boot into Safe Mode on a PC that won't start normally. Where can this be chosen?",o:["WinRE, Startup Settings","Device Manager","Disk Cleanup","Control Panel, Sound"],a:0,e:"Startup Settings in WinRE offers Safe Mode options."},
 {q:"A PC shuts off at random, and Event Viewer shows 'Kernel-Power' errors with no clean shutdown. What should be checked?",o:["Power supply and overheating","DNS settings","The printer","Browser extensions"],a:0,e:"Unexpected power loss points to the PSU, power or heat."}
];

registerModule({
  id:"sw",slug:"software-troubleshooting",title:"Software Troubleshooting",
  lessons:LESSONS,
  decks:[["win","Windows"],["mob","Mobile"],["msec","Mobile security"],["pcs","PC and browser security"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["winre","tm","ladder","phone"],
  viz(){
/* ---- WinRE menu ---- */
(function(){
  const el=$("#viz-winre");if(!el)return;
  const T=[
    ["Startup Repair","🔧","Automatically fixes problems that stop Windows from loading, such as a damaged boot configuration."],
    ["Startup Settings","⚙","Restart into <b>Safe Mode</b>, Safe Mode with Networking, low-resolution video, or with driver signature checks off."],
    ["Command Prompt","▮","Run <span class=\"mono\">sfc</span>, <span class=\"mono\">chkdsk</span>, <span class=\"mono\">bootrec</span> and <span class=\"mono\">diskpart</span> without booting Windows."],
    ["Uninstall Updates","⟲","Remove the latest quality or feature update. Perfect when problems began right after an update."],
    ["System Restore","⏱","Roll back to a restore point. Personal files stay, but apps installed since then are removed."],
    ["System Image Recovery","💾","Restore a full system image backup. Replaces everything on the drive."],
    ["UEFI Firmware Settings","▣","Reboot into UEFI to change boot order, enable TPM or Secure Boot."],
    ["Reset this PC","♻","Reinstall Windows, choosing to keep or remove personal files. Apps are removed."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Windows Recovery Environment: Advanced options</div>
  <div class="winre">${T.map((t,i)=>`<button class="wr" data-t="${i}"><span class="wr-i">${t[1]}</span>${t[0]}</button>`).join("")}</div>
  <div class="caption" aria-live="polite">Click a tile.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;const t=T[+b.dataset.t];seen.add(b.dataset.t);
    el.querySelectorAll(".wr").forEach(x=>x.classList.toggle("sel",x===b));$(".caption",el).innerHTML=`<b>${t[0]}.</b> ${t[2]}`;
    if(seen.size>=6)award("viz:winre",20,"Explored the recovery tools")});
})();

/* ---- Task Manager detective ---- */
(function(){
  const el=$("#viz-tm");if(!el)return;
  const SC={
    slow:{name:"\"Everything is slow\"",rows:[["Microsoft Edge (38 tabs)",4,"6,912 MB",1,0],["Microsoft Teams",3,"812 MB",0,0],["Antimalware Service",2,"190 MB",1,0],["File Explorer",0,"88 MB",0,0],["Spooler subsystem app",0,"12 MB",0,0]],ans:0,sort:"mem",
      ok:"Edge with 38 tabs is using almost 7 GB of the PC's 8 GB, so Windows is paging to disk. Close tabs, or add RAM if this is normal for the user."},
    disk:{name:"\"Disk is at 100%\"",rows:[["Windows Update",6,"220 MB",97,0],["Microsoft Edge",3,"640 MB",1,0],["Search Indexer",1,"60 MB",2,0],["Outlook",1,"300 MB",0,0],["Runtime Broker",0,"20 MB",0,0]],ans:0,sort:"disk",
      ok:"Windows Update is downloading and installing. Let it finish. If 100% disk use is constant on an HDD, upgrade to an SSD."},
    fans:{name:"\"The fans never stop\"",rows:[["Microsoft Word",1,"210 MB",0,0],["svchosts.exe",96,"140 MB",0,1],["Service Host: Local System",1,"30 MB",0,0],["Explorer",0,"80 MB",0,0],["Desktop Window Manager",2,"90 MB",0,0]],ans:1,sort:"cpu",
      ok:"<b>svchosts.exe</b> isn't a real Windows process (the real one is svchost.exe), and it's using 96% CPU while idle. That's a likely cryptominer. Quarantine the PC and start the malware removal process."}
  };
  let cur="slow",done=new Set();
  el.innerHTML=`<div class="viz-title">Task Manager detective</div>
  <div class="viz-controls">${Object.entries(SC).map(([k,s])=>`<button class="chip" data-sc="${k}">${s.name}</button>`).join("")}</div>
  <div class="tm"><div class="tm-bar"><span>Task Manager</span><span class="s-small">Processes</span></div><div class="tm-t"></div></div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(msg){
    const s=SC[cur];
    el.querySelectorAll("[data-sc]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sc===cur));
    const col=(v,max,suf)=>`<td class="${v>=60?"hot":v>=10?"warm":""}">${v}${suf}</td>`;
    $(".tm-t",el).innerHTML=`<table><thead><tr><th>Name</th><th class="${s.sort==="cpu"?"srt":""}">CPU</th><th class="${s.sort==="mem"?"srt":""}">Memory</th><th class="${s.sort==="disk"?"srt":""}">Disk</th></tr></thead><tbody>
      ${s.rows.map((r,i)=>`<tr data-p="${i}" tabindex="0"><td>${r[0]}</td>${col(r[1],100,"%")}<td class="${parseInt(r[2].replace(",",""))>4000?"hot":""}">${r[2]}</td>${col(r[3],100," MB/s")}</tr>`).join("")}</tbody></table>`;
    $(".caption",el).innerHTML=msg||`Complaint: ${s.name}. Click the process causing it.`;
  }
  el.addEventListener("click",e=>{const c=e.target.closest("[data-sc]");if(c){cur=c.dataset.sc;draw();return}
    const r=e.target.closest("[data-p]");if(!r)return;const s=SC[cur];
    if(+r.dataset.p===s.ans){done.add(cur);r.classList.add("found");draw(`<span class="status-good">Found it.</span> ${s.ok}`);el.querySelector(`[data-p="${s.ans}"]`).classList.add("found");if(done.size===3)award("viz:tm",30,"Solved every Task Manager case")}
    else draw(`<span class="status-bad">Not that one.</span> Look at the highlighted column for the biggest number, or a name that doesn't look right.`)});
  draw();
})();

/* ---- Repair ladder ---- */
(function(){
  const el=$("#viz-ladder");if(!el)return;
  const R=[
    ["Restart the app or PC","Clears temporary glitches and stuck processes.","Nothing"],
    ["Restart the service","Fixes a stopped or hung service, like the Print Spooler.","Nothing"],
    ["Update, repair or reinstall the app","Fixes bugs and damaged app files.","App settings, sometimes"],
    ["Roll back the driver or update","Undoes a recent change that broke things.","The fixes in that update"],
    ["Run sfc /scannow","Repairs corrupted Windows system files.","Nothing"],
    ["System Restore","Rolls Windows back to an earlier restore point.","Apps and drivers installed since then"],
    ["Repair install or Reset this PC","Reinstalls Windows, keeping files if chosen.","Installed apps and settings"],
    ["Reimage","Wipes the drive and applies a fresh standard image.","Everything not backed up"]
  ];
  const seen=new Set();let cur=0;
  el.innerHTML=`<div class="viz-title">The repair ladder</div>
  <div class="ladder">${R.map((r,i)=>`<button class="rung" data-r="${i}" style="--w:${55+i*6.4}%"><span class="mono">${i+1}</span>${r[0]}</button>`).join("")}</div>
  <div class="lad-info" aria-live="polite"></div>`;
  function draw(){
    seen.add(cur);
    el.querySelectorAll(".rung").forEach((b,i)=>{b.classList.toggle("sel",i===cur);b.style.setProperty("--risk",i/7)});
    const r=R[cur];
    $(".lad-info",el).innerHTML=`<div><span class="s-small">FIXES</span><p>${r[1]}</p></div><div><span class="s-small">WHAT YOU RISK LOSING</span><p class="${cur>=5?"status-bad":""}">${r[2]}</p></div>`;
    if(seen.size===R.length)award("viz:ladder",20,"Climbed the repair ladder");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(b){cur=+b.dataset.r;draw()}});draw();
})();

/* ---- Phone symptom explorer ---- */
(function(){
  const el=$("#viz-phone");if(!el)return;
  const P=[
    ["crash","App crashes","Force close the app, then clear its cache. Update it from the store. If it still crashes, reinstall it. Check that the OS meets the app's requirements."],
    ["slow","Slow response","Close background apps, free up storage (keep 10%+ free), restart, and update the OS. An old phone may simply be underpowered."],
    ["batt","Battery drains fast","Check battery usage by app, lower screen brightness and timeout, disable unused radios. Check battery health. Unexplained drain can be malware."],
    ["reboot","Random reboots","Look for a recently installed app (boot into safe mode to test), overheating, or a failing battery. Update the OS."],
    ["rotate","Won't autorotate","Turn off rotation lock in quick settings. Some apps only work in one orientation. If no app rotates, the accelerometer may need calibration."],
    ["bt","Bluetooth won't pair","Toggle Bluetooth, forget the device and re-pair, check the device is in pairing mode and in range."],
    ["wifi","Wi-Fi but no internet","Forget the network and rejoin, check for a captive portal sign-in page, restart the router, try mobile data to compare."],
    ["update","Update fails","Free up storage, charge above 50%, connect to Wi-Fi, and check the device still gets updates."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Mobile help desk</div>
  <div class="phone-x"><div class="ph-dev"><div class="ph-scr">${P.map(([k,n])=>`<button class="ph-app" data-ph="${k}"><i></i><span>${n}</span></button>`).join("")}</div></div>
  <div class="caption" aria-live="polite">Tap a symptom on the phone.</div></div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-ph]");if(!b)return;const p=P.find(x=>x[0]===b.dataset.ph);seen.add(p[0]);
    el.querySelectorAll(".ph-app").forEach(x=>x.classList.toggle("sel",x===b));$(".caption",el).innerHTML=`<b>${p[1]}.</b> ${p[2]}`;
    if(seen.size>=6)award("viz:phone",20,"Solved mobile problems")});
})();
  },
  sims:[
    {id:"fixes",type:"match",title:"Match the fix",
      scenario:"Eight Windows tickets. Match each one to the best fix. Tap a fix, then tap the ticket.",
      items:[["Roll back the driver","drv"],["Uninstall the latest update","upd"],["sfc /scannow","sfc"],["Rebuild the user profile","prof"],["Fix the service's logon password","svc"],["Disable startup apps","boot"],["Check the CMOS battery and NTP","time"],["Remove USB drive, fix boot order","nos"]],
      slots:[["drv","BSOD after a new GPU driver",""],["upd","Boot loop after Patch Tuesday",""],["sfc","Windows reports corrupted system files",""],["prof","User gets a temporary profile",""],["svc","Backup service fails after a password change",""],["boot","Four-minute boot, 30 startup apps",""],["time","Clock wrong, domain login fails",""],["nos","\"No OS found\" on Monday morning",""]],
      success:"All eight tickets are fixed with the least disruptive option."},
    {id:"browser",type:"match",title:"Rescue the browser",
      scenario:"A user's browser is a mess. Match each symptom to the cause. Tap a cause, then tap the symptom.",
      items:[["Adware extension","pop"],["Wrong system clock","cert"],["Modified hosts file","redir"],["Cryptomining script","cpu"],["Allowed site notifications","notif"],["Malware changed proxy","proxy"]],
      slots:[["pop","Pop-ups on every site",""],["cert","Certificate errors on every HTTPS site",""],["redir","Bank address opens a look-alike site",""],["cpu","CPU at 90% while one site is open",""],["notif","Constant alerts from a site visited once",""],["proxy","No websites load, proxy set to an unknown IP",""]],
      success:"The browser is clean and fast again."},
    {id:"tickets",title:"Work the ticket queue",mount(el,api,sim){
      const T=[
        ["Phone overheating and using lots of data","A sales rep's company phone runs hot and hit its data limit, but she barely used it this month. She installed a \"free VPN\" APK from a website last week.",
         ["Replace the battery","Remove the sideloaded app, scan for malware and reset her passwords","Turn on airplane mode","Factory reset without backing up"],1,"A sideloaded APK plus unexplained data use and heat point to malware. Remove it, scan, and reset credentials."],
        ["Laptop BSOD after update","A laptop shows a blue screen every boot since last night's driver update. The user needs their files.",
         ["Reimage the laptop","Boot into Safe Mode and roll back the driver","Replace the RAM","Reset this PC, removing everything"],1,"Roll back the recent change first. Reimaging and resets lose more than needed."],
        ["Fake virus warning","A full-screen pop-up says the PC is infected and to call a support number. The user hasn't called.",
         ["Call the number to verify","Pay for the cleanup","Close the browser, then run a full scan with real anti-malware","Ignore it"],2,"It's scareware. Never call or pay. Close the browser and scan."],
        ["Certificate errors everywhere","Every HTTPS site shows a certificate warning on one PC. The clock says 2019.",
         ["Reinstall the browser","Set the correct date and time and replace the CMOS battery","Disable HTTPS","Click through the warnings"],1,"A wrong clock makes valid certificates look invalid."],
        ["App won't update on phone","A tablet's apps won't update. Storage shows 99% full.",
         ["Free up storage space","Root the tablet","Replace the screen","Turn off Wi-Fi"],0,"Updates need free space to download and install."]
      ];
      let ans={},graded=false;
      function draw(){
        const right=T.filter((t,i)=>ans[i]===t[3]).length;
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <p class="scenario">Five tickets are waiting. Pick the best next action for each, then submit.</p>
        <div class="tickets">${T.map((t,i)=>`<div class="tk ${graded?(ans[i]===t[3]?"ok":"no"):""}"><div class="tk-h"><span class="mono">#${4100+i}</span><b>${t[0]}</b></div><p>${t[1]}</p>
          <div class="tk-o">${t[2].map((o,j)=>`<button class="opt ${ans[i]===j?"sel":""} ${graded&&j===t[3]?"right":""}" data-t="${i}" data-o="${j}">${o}</button>`).join("")}</div>
          ${graded&&ans[i]!==t[3]?`<p class="tk-e">${t[4]}</p>`:""}</div>`).join("")}</div>
        <div class="caption" aria-live="polite">${graded?(right===T.length?`<span class="status-good">All ${T.length} tickets closed correctly.</span>`:`<b>${right} of ${T.length}</b> correct. Read the notes, change your answers and submit again.`):`${Object.keys(ans).length} of ${T.length} answered.`}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Submit</button><button class="btn" data-a="reset">Start over</button></div>`;
      }
      el.addEventListener("click",e=>{const o=e.target.closest("[data-o]");if(o){ans[+o.dataset.t]=+o.dataset.o;graded=false;draw();return}
        const a=e.target.closest("[data-a]")?.dataset.a;if(a==="reset"){ans={};graded=false;draw()}
        if(a==="grade"){if(Object.keys(ans).length<T.length){$(".caption",el).innerHTML=`Answer all ${T.length} tickets first.`;return}graded=true;if(T.every((t,i)=>ans[i]===t[3]))api.pass();draw()}});
      draw();
    }}
  ],
  badges:[
    ["reader","SW","Debugger","Mark all 6 software troubleshooting lessons studied",c=>c.allStudied()],
    ["lab","TK","Task Killer","Complete all 4 software troubleshooting diagrams",c=>c.vizAll()],
    ["fixes","RB","Rollback","Pass the Windows fixes simulation",c=>c.passed("fixes")],
    ["browser","BR","Browser Medic","Pass the browser simulation",c=>c.passed("browser")],
    ["tickets","Q0","Queue Zero","Pass the ticket queue simulation",c=>c.passed("tickets")],
    ["perfect","BS","No More BSOD","Score 100% on a software troubleshooting quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
