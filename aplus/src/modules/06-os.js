/* ================= Module 6: Operating Systems (Core 2, 220-1202) ================= */
(function(){
const LESSONS=[
{id:"types",num:"6.1",title:"OS types, file systems and partitions",short:"File systems",html:`
<p>Workstation OSs include <b>Windows</b>, <b>macOS</b>, <b>Linux</b> and <b>ChromeOS</b>. Mobile OSs include <b>iOS</b>, <b>iPadOS</b> and <b>Android</b>. Each formats drives with its own preferred file system, which decides who can read the drive and how big files can be.</p>
<div class="viz" id="viz-fs"></div>
<p>Before formatting, a drive gets a <b>partition table</b>. Older BIOS systems use <b>MBR</b>. UEFI systems use <b>GPT</b>.</p>
<div class="viz" id="viz-part"></div>
<div class="tip"><b>Exam tip.</b> A 4 GB+ file won't copy to a FAT32 flash drive. Reformat it as exFAT (works on Windows and macOS) or NTFS (Windows).</div>`},
{id:"editions",num:"6.2",title:"Windows editions and requirements",short:"Editions",html:`
<p>Exam questions often describe a business need and ask which edition meets it. The usual answer is: <b>Home</b> can't join a domain, so businesses need <b>Pro</b> or higher.</p>
<div class="viz" id="viz-ed"></div>
<ul><li><b>Windows 11 minimums:</b> 64-bit CPU with 2+ cores at 1 GHz, 4 GB RAM, 64 GB storage, UEFI with Secure Boot, and TPM 2.0.</li>
<li><b>32-bit vs 64-bit:</b> a 32-bit OS can use only about 4 GB of RAM. A 64-bit OS runs 32-bit apps, but a 32-bit OS can't run 64-bit apps. Windows 11 is 64-bit only.</li>
<li><b>Upgrade paths:</b> an in-place upgrade (for example Home to Pro) keeps files and apps. Moving between editions or versions may need a new license key.</li>
<li><b>End of life:</b> once an OS stops getting security updates, it should be upgraded or replaced.</li></ul>`},
{id:"install",num:"6.3",title:"Installing operating systems and apps",short:"Installing",html:`
<ul><li><b>Boot methods:</b> USB drive, optical disc, network boot (<b>PXE</b>), an internet-based install, an external drive, or a recovery partition on the internal drive.</li>
<li><b>Clean install:</b> wipes the drive and starts fresh. Best for new drives or badly broken systems. Back up data first.</li>
<li><b>In-place upgrade:</b> installs over the existing OS, keeping files, settings and apps.</li>
<li><b>Image deployment:</b> copies a prepared image to many PCs at once. Common in businesses.</li>
<li><b>Repair install:</b> reinstalls Windows while keeping files, to fix corrupted system files.</li>
<li><b>Recovery partition:</b> a hidden partition from the manufacturer that restores factory settings.</li></ul>
<h3>Installing applications</h3>
<ul><li>Check the app's <b>requirements</b>: CPU (32 or 64-bit), RAM, storage, and graphics (dedicated card and VRAM vs integrated graphics).</li>
<li><b>Distribution methods:</b> physical media, a downloaded installer, a mountable <b>ISO</b> image, or an app store.</li>
<li>Consider the <b>impact</b>: on the device (compatibility), on the network (bandwidth), on operations (training and support) and on the business (licensing).</li></ul>`},
{id:"tools",num:"6.4",title:"Windows tools and utilities",short:"Windows tools",html:`
<p>Many tools open fastest from the Run box (<kbd>Win</kbd>+<kbd>R</kbd>) by name. Learn the names: the exam uses them.</p>
<div class="scroll"><table><thead><tr><th>Tool</th><th>Run name</th><th>Use it to</th></tr></thead><tbody>
<tr><td>Task Manager</td><td class="mono">taskmgr</td><td>End frozen apps, watch CPU and RAM, disable startup apps, view services and users</td></tr>
<tr><td>Event Viewer</td><td class="mono">eventvwr.msc</td><td>Read System, Application and Security logs</td></tr>
<tr><td>Disk Management</td><td class="mono">diskmgmt.msc</td><td>Initialize, partition, format, extend or shrink volumes</td></tr>
<tr><td>Task Scheduler</td><td class="mono">taskschd.msc</td><td>Run a program or script on a schedule or trigger</td></tr>
<tr><td>Device Manager</td><td class="mono">devmgmt.msc</td><td>Update, roll back or disable drivers</td></tr>
<tr><td>Certificate Manager</td><td class="mono">certmgr.msc</td><td>View and manage certificates</td></tr>
<tr><td>Local Users and Groups</td><td class="mono">lusrmgr.msc</td><td>Create users, reset passwords, set group membership</td></tr>
<tr><td>Performance Monitor</td><td class="mono">perfmon.msc</td><td>Log performance counters over time</td></tr>
<tr><td>Group Policy Editor</td><td class="mono">gpedit.msc</td><td>Set local policies (Pro and higher)</td></tr>
<tr><td>Services</td><td class="mono">services.msc</td><td>Start, stop and set services to automatic</td></tr>
<tr><td>System Information</td><td class="mono">msinfo32</td><td>See hardware, drivers and system details</td></tr>
<tr><td>Resource Monitor</td><td class="mono">resmon</td><td>See which process uses CPU, disk, network or memory</td></tr>
<tr><td>System Configuration</td><td class="mono">msconfig</td><td>Set boot options, including Safe Mode</td></tr>
<tr><td>Disk Cleanup</td><td class="mono">cleanmgr</td><td>Delete temporary and unneeded files</td></tr>
<tr><td>Defragment and Optimize</td><td class="mono">dfrgui</td><td>Defragment HDDs, TRIM SSDs</td></tr>
<tr><td>Registry Editor</td><td class="mono">regedit</td><td>Edit the registry. Back it up first.</td></tr>
</tbody></table></div>
<div class="tip"><b>MMC.</b> Files ending in <span class="mono">.msc</span> are snap-ins for the Microsoft Management Console.</div>`},
{id:"cli",num:"6.5",title:"The command line",short:"Commands",html:`
<p>Click commands to run them. Switch between Windows and Linux to see the matching tools on each.</p>
<div class="viz" id="viz-cli"></div>
<ul><li>Add <b>/?</b> to any Windows command (or run <span class="mono">help</span>) to see its options. On Linux, use <span class="mono">man</span>.</li>
<li>Many commands need an <b>elevated</b> prompt: right-click Command Prompt and choose Run as administrator. On Linux, prefix with <span class="mono">sudo</span>.</li></ul>`},
{id:"settings",num:"6.6",title:"Settings, Control Panel and Windows networking",short:"Settings and networks",html:`
<ul><li><b>Settings</b> is the modern app for System, Bluetooth and devices, Network and internet, Personalization, Apps, Accounts, Time and language, Gaming, Accessibility, Privacy and security, and Windows Update.</li>
<li><b>Control Panel</b> still holds Internet Options, Devices and Printers, Programs and Features, Network and Sharing Center, System, Windows Defender Firewall, Mail, Sound, User Accounts, Device Manager, Indexing Options, Administrative Tools, File Explorer Options (show hidden files and extensions), Power Options and Ease of Access.</li>
<li><b>Power options:</b> sleep saves to RAM, hibernate saves to disk and powers off. Fast startup is a partial hibernate.</li>
<li><b>Workgroup vs domain:</b> a workgroup is peer-to-peer, each PC with its own accounts. A domain uses central Active Directory accounts and Group Policy.</li>
<li><b>Mapped drives:</b> assign a drive letter to a share, such as <span class="mono">net use Z: \\\\fileserver\\finance</span>.</li>
<li>Network settings also cover static IPs, DNS, proxy settings, metered connections, VPNs and firewall rules.</li></ul>`},
{id:"mac",num:"6.7",title:"macOS",short:"macOS",html:`
<div class="scroll"><table><thead><tr><th>Feature</th><th>What it does</th></tr></thead><tbody>
<tr><td>Finder</td><td>The file manager (like File Explorer)</td></tr>
<tr><td>Spotlight</td><td>System-wide search. <kbd>Cmd</kbd>+<kbd>Space</kbd></td></tr>
<tr><td>Mission Control</td><td>See all open windows and desktops (Spaces)</td></tr>
<tr><td>Dock</td><td>Launch and switch apps</td></tr>
<tr><td>Keychain</td><td>Stores passwords, certificates and keys</td></tr>
<tr><td>iCloud</td><td>Syncs files, photos, passwords and backups</td></tr>
<tr><td>Time Machine</td><td>Built-in backups to an external drive</td></tr>
<tr><td>FileVault</td><td>Full-disk encryption</td></tr>
<tr><td>Disk Utility</td><td>Erase, partition, and run First Aid on drives</td></tr>
<tr><td>Terminal</td><td>The command line (zsh shell)</td></tr>
<tr><td>Force Quit</td><td>Close frozen apps. <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>Esc</kbd></td></tr>
<tr><td>Gestures</td><td>Multi-finger trackpad swipes, pinches and taps</td></tr>
<tr><td>Remote Disc</td><td>Use another computer's optical drive</td></tr>
</tbody></table></div>
<ul><li><b>Installing apps:</b> from the App Store, a <span class="mono">.dmg</span> disk image (drag the <span class="mono">.app</span> to Applications) or a <span class="mono">.pkg</span> installer.</li>
<li><b>Uninstalling:</b> drag the app to the Trash, or use its uninstaller.</li>
<li><b>Updates:</b> System Settings, then General, then Software Update.</li></ul>`},
{id:"linux",num:"6.8",title:"Linux",short:"Linux",html:`
<ul><li><b>Root</b> is the all-powerful admin account. Use <span class="mono">sudo</span> to run one command as root, or <span class="mono">su</span> to switch users.</li>
<li><b>Package managers</b> install software from repositories: <span class="mono">apt</span> (Debian, Ubuntu) and <span class="mono">dnf</span> (Red Hat, Fedora).</li>
<li><b>Permissions</b> are read (4), write (2) and execute (1) for the owner, group and others. <span class="mono">chmod 754</span> means owner rwx, group r-x, others r--.</li>
<li><b>Key files:</b> <span class="mono">/etc/passwd</span> (users), <span class="mono">/etc/shadow</span> (password hashes), <span class="mono">/etc/hosts</span> (local name lookups), <span class="mono">/etc/resolv.conf</span> (DNS servers), <span class="mono">/etc/fstab</span> (drives mounted at boot).</li>
<li><b>Common tools:</b> <span class="mono">nano</span> to edit text, <span class="mono">cron</span> to schedule jobs, <span class="mono">Samba</span> to share files with Windows.</li></ul>`}
];

const CARDS=[
 ...[["taskmgr","Task Manager: end tasks, startup apps, performance"],["eventvwr.msc","Event Viewer: system, app and security logs"],["diskmgmt.msc","Disk Management: partition, format, extend volumes"],["taskschd.msc","Task Scheduler: run jobs on a schedule"],
     ["devmgmt.msc","Device Manager: drivers"],["certmgr.msc","Certificate Manager"],["lusrmgr.msc","Local Users and Groups"],["perfmon.msc","Performance Monitor: log counters over time"],
     ["gpedit.msc","Local Group Policy Editor (Pro and higher)"],["services.msc","Services: start, stop, set startup type"],["msinfo32","System Information"],["resmon","Resource Monitor: per-process CPU, disk, network, memory"],
     ["msconfig","System Configuration: boot options and Safe Mode"],["regedit","Registry Editor"],["cleanmgr","Disk Cleanup"],["dfrgui","Defragment and Optimize Drives"]].map((c,i)=>({deck:"tools",id:"wt"+i,q:c[0],a:c[1]})),
 ...[["chkdsk /f","Fix file system errors on a drive (/r also finds bad sectors)"],["sfc /scannow","Scan and repair protected Windows system files"],["gpupdate /force","Reapply Group Policy now"],["gpresult /r","Show which Group Policies applied"],
     ["robocopy","Robust copy of folders, resumes after interruptions"],["diskpart","Command-line partitioning tool"],["net use","Map a network drive"],["net user","Manage user accounts"],
     ["netstat","Show active connections and listening ports"],["winver","Show the Windows version and build"],["shutdown /r /t 0","Restart immediately"],["pathping","Combines ping and tracert, with loss per hop"],
     ["ls / pwd","List files / print the current directory (Linux)"],["chmod","Change file permissions (Linux)"],["chown","Change file owner (Linux)"],["sudo","Run one command as root"],
     ["apt / dnf","Package managers for Debian/Ubuntu and Red Hat/Fedora"],["grep","Search text for a pattern"],["ps / top","List processes / live process monitor"],["df / du","Free disk space / space used by files"]].map((c,i)=>({deck:"cmd",id:"cm"+i,q:c[0],a:c[1]})),
 ...[["NTFS","Windows. Permissions, encryption, compression, journaling."],["FAT32","Universal, but 4 GB max file size"],["exFAT","Flash drives. Large files, Windows and macOS."],["ext4 / XFS","Linux file systems"],
     ["APFS","macOS. SSD-optimized, snapshots, encryption."],["ReFS","Windows resilient file system for large storage"],["MBR","BIOS. 4 primary partitions, 2 TB max."],["GPT","UEFI. 128 partitions in Windows, huge drives."],
     ["Domain join, BitLocker, gpedit, RDP host","Need Windows Pro or higher"],["Windows 11 minimums","64-bit 2-core 1 GHz, 4 GB RAM, 64 GB, UEFI Secure Boot, TPM 2.0"],["32-bit OS RAM limit","About 4 GB"],["PXE","Booting an OS installer over the network"]].map((c,i)=>({deck:"fs",id:"fs"+i,q:c[0],a:c[1]})),
 ...[["Spotlight","macOS search (Cmd+Space)"],["Keychain","macOS password and certificate store"],["Time Machine","macOS backup"],["FileVault","macOS full-disk encryption"],["Mission Control","macOS view of all windows and Spaces"],
     ["Force Quit (macOS)","Cmd+Option+Esc"],[".dmg vs .pkg","Disk image you drag from vs installer package"],["/etc/shadow","Linux password hashes"],["chmod 755","Owner rwx, group and others r-x"]].map((c,i)=>({deck:"mac",id:"ml"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"A user needs to copy a 6 GB video file to a flash drive used on both Windows and macOS. Which file system should the drive use?",o:["FAT32","exFAT","ext4","APFS"],a:1,e:"exFAT supports large files and works on Windows and macOS. FAT32 caps files at 4 GB."},
 {q:"Which file system supports file permissions, EFS encryption and compression on Windows?",o:["FAT32","exFAT","NTFS","ext4"],a:2,e:"NTFS is Windows' full-featured file system."},
 {q:"Which file system is the default on modern Macs?",o:["HFS","APFS","NTFS","ext4"],a:1,e:"APFS (Apple File System) is optimized for SSDs."},
 {q:"Which file systems are commonly used by Linux? (Choose the best answer.)",o:["ext4 and XFS","NTFS and ReFS","APFS and HFS+","FAT12 and FAT16"],a:0,e:"ext4 is the common default. XFS is the default on Red Hat Enterprise Linux."},
 {q:"A technician installs a new 4 TB drive in a BIOS-only PC and can only use 2 TB of it. Why?",o:["The drive is failing","MBR partitioning supports up to 2 TB","NTFS can't exceed 2 TB","The PSU is too weak"],a:1,e:"MBR is limited to 2 TB. GPT, which requires UEFI to boot, supports far larger drives."},
 {q:"How many primary partitions does MBR support?",o:["2","4","64","128"],a:1,e:"MBR allows four primary partitions, or three plus an extended partition."},
 {q:"A small business needs PCs that can join an Active Directory domain. Which Windows edition is the minimum?",o:["Home","Pro","Enterprise","Education"],a:1,e:"Home can't join a domain. Pro is the lowest edition that can."},
 {q:"Which feature is NOT available in Windows Home?",o:["Windows Update","BitLocker","Microsoft Defender","Settings app"],a:1,e:"Full BitLocker requires Pro or higher. Home only has basic device encryption on some hardware."},
 {q:"A user wants to connect to their Windows Home PC using Remote Desktop from the office. What is the problem?",o:["Home can't act as a Remote Desktop host","RDP needs Linux","RDP is blocked by NTFS","Home has no network support"],a:0,e:"Home can connect out as an RDP client but can't accept incoming Remote Desktop sessions."},
 {q:"Which is a minimum requirement for Windows 11?",o:["2 GB RAM","TPM 2.0","32-bit CPU","16 GB storage"],a:1,e:"Windows 11 needs TPM 2.0, UEFI Secure Boot, 4 GB RAM, 64 GB storage and a 64-bit CPU."},
 {q:"A PC with 8 GB of RAM shows only about 3.5 GB usable. What is the likely cause?",o:["A 32-bit OS is installed","Bad RAM","The page file is too small","BitLocker is on"],a:0,e:"A 32-bit OS can address only about 4 GB of memory."},
 {q:"Which install type keeps the user's files, settings and apps?",o:["Clean install","In-place upgrade","Image deployment","Low-level format"],a:1,e:"An in-place upgrade installs over the existing OS and preserves data and apps."},
 {q:"An IT team wants to install Windows on 50 new PCs over the network without USB drives. Which boot method should they use?",o:["Optical disc","PXE network boot","Recovery partition","Safe Mode"],a:1,e:"PXE lets the NIC boot an installer from a deployment server."},
 {q:"A laptop's hidden partition can restore it to factory condition. What is this?",o:["Swap partition","Recovery partition","Extended partition","EFI system partition"],a:1,e:"Manufacturers include a recovery partition with a factory image."},
 {q:"A downloaded application arrives as an .iso file. How can it be installed without burning a disc?",o:["Rename it to .exe","Mount the ISO as a virtual drive","Extract it with regedit","It can't be"],a:1,e:"Windows can mount an ISO and present it as a drive."},
 {q:"Before installing a CAD program, what should a technician confirm?",o:["The app's system requirements, such as RAM and a dedicated GPU","The monitor brand","The keyboard layout","The color of the case"],a:0,e:"Check CPU, RAM, storage and graphics requirements, including VRAM."},
 {q:"A frozen application won't close. Which tool should a user open first?",o:["Event Viewer","Task Manager","Disk Management","regedit"],a:1,e:"Task Manager can end unresponsive tasks."},
 {q:"A PC takes five minutes to boot because of many startup apps. Where can they be disabled?",o:["Task Manager, Startup apps","Device Manager","Disk Cleanup","certmgr.msc"],a:0,e:"Task Manager's Startup apps tab shows each app's impact and lets you disable them."},
 {q:"A technician needs to see what errors occurred when a service crashed last night. Which tool should they use?",o:["Event Viewer","Resource Monitor","msinfo32","dfrgui"],a:0,e:"Event Viewer logs system, application and security events with timestamps."},
 {q:"A newly added drive shows as 'Not initialized'. Which tool fixes this?",o:["Device Manager","Disk Management","Task Scheduler","Services"],a:1,e:"Disk Management initializes, partitions and formats drives."},
 {q:"After a driver update, a webcam stopped working. Where can the driver be rolled back?",o:["Device Manager","Event Viewer","Disk Management","lusrmgr.msc"],a:0,e:"Device Manager has a Roll Back Driver option in the device's properties."},
 {q:"A backup script must run every night at 2 a.m. Which tool should be used?",o:["Task Scheduler","msconfig","Services","Performance Monitor"],a:0,e:"Task Scheduler runs programs on schedules and triggers."},
 {q:"A technician wants to start Windows in Safe Mode on the next restart. Which tool can set this?",o:["msconfig","msinfo32","cleanmgr","resmon"],a:0,e:"System Configuration's Boot tab has a Safe boot option."},
 {q:"Which tool shows exactly which process is using the most disk activity right now?",o:["Resource Monitor","Disk Cleanup","Event Viewer","Certificate Manager"],a:0,e:"Resource Monitor breaks down CPU, memory, disk and network use per process."},
 {q:"A print spooler service must start automatically at boot. Where is this set?",o:["services.msc","devmgmt.msc","diskmgmt.msc","certmgr.msc"],a:0,e:"The Services console sets each service's startup type."},
 {q:"A technician needs to reset a local user's password on a Windows Pro PC. Which snap-in should they use?",o:["lusrmgr.msc","gpedit.msc","eventvwr.msc","taskschd.msc"],a:0,e:"Local Users and Groups manages local accounts and group memberships."},
 {q:"A user's drive is nearly full of temporary files. Which built-in tool removes them?",o:["Disk Cleanup","Defragment and Optimize","Disk Management","chkdsk"],a:0,e:"Disk Cleanup (cleanmgr) clears temporary and unneeded files."},
 {q:"What should a technician do before editing the registry?",o:["Back up the registry","Disable the firewall","Run defrag","Uninstall antivirus"],a:0,e:"A bad registry edit can stop Windows from booting. Export a backup first."},
 {q:"Windows reports corrupted system files. Which command scans and repairs them?",o:["chkdsk","sfc /scannow","diskpart","gpupdate"],a:1,e:"System File Checker restores protected system files."},
 {q:"Which command checks a drive for file system errors and bad sectors?",o:["chkdsk /r","sfc /scannow","format","robocopy"],a:0,e:"chkdsk /f fixes errors. /r also locates bad sectors and recovers readable data."},
 {q:"An admin changed a Group Policy and wants it applied to a PC immediately. Which command?",o:["gpresult /r","gpupdate /force","net use","ipconfig /renew"],a:1,e:"gpupdate /force reapplies all policies now."},
 {q:"Which command shows which Group Policies have been applied to the current user and PC?",o:["gpupdate","gpresult /r","winver","whoami"],a:1,e:"gpresult /r displays the resulting set of policy."},
 {q:"A technician must copy 200 GB of folders over an unreliable connection, resuming if interrupted. Which command is best?",o:["copy","robocopy","md","move"],a:1,e:"robocopy handles large folder copies, retries and restartable mode."},
 {q:"Which command maps drive letter Z: to a shared folder?",o:["net user Z: \\\\server\\share","net use Z: \\\\server\\share","map Z: server","mount Z:"],a:1,e:"net use connects a drive letter to a network share."},
 {q:"Which command shows the exact Windows version and build number?",o:["winver","hostname","ver /all","msconfig"],a:0,e:"winver opens a window with the edition, version and build."},
 {q:"Which command lists active connections and listening ports?",o:["netstat","nslookup","tracert","pathping"],a:0,e:"netstat shows TCP and UDP connections and their state."},
 {q:"On Linux, which command changes a file's permissions?",o:["chown","chmod","sudo","grep"],a:1,e:"chmod changes permissions. chown changes the owner."},
 {q:"A Linux user needs to install a package on Ubuntu. Which command is correct?",o:["sudo apt install","sudo dnf install","msiexec","brew get"],a:0,e:"Ubuntu uses apt. Red Hat and Fedora use dnf."},
 {q:"Which Linux command searches a file for lines containing a word?",o:["find","grep","ls","pwd"],a:1,e:"grep searches text for patterns. find searches for files by name or attributes."},
 {q:"Which Linux command shows how much free space each mounted file system has?",o:["du","df","ps","top"],a:1,e:"df shows disk free space per file system. du shows space used by files and folders."},
 {q:"What does chmod 750 set?",o:["Owner rwx, group r-x, others nothing","Everyone full access","Owner read only","Group rwx, others r-x"],a:0,e:"7 = rwx, 5 = r-x, 0 = no access."},
 {q:"Which Linux file stores password hashes?",o:["/etc/passwd","/etc/shadow","/etc/hosts","/etc/fstab"],a:1,e:"/etc/shadow holds the hashes and is readable only by root."},
 {q:"A Mac user wants to find a document quickly by name. Which feature should they use?",o:["Spotlight","Keychain","Mission Control","Boot Camp"],a:0,e:"Spotlight (Cmd+Space) searches files, apps and settings."},
 {q:"Which macOS feature backs up files to an external drive automatically?",o:["Time Machine","FileVault","iCloud Keychain","Disk Utility"],a:0,e:"Time Machine makes hourly, daily and weekly backups."},
 {q:"Which macOS feature provides full-disk encryption?",o:["Gatekeeper","FileVault","Keychain","Spotlight"],a:1,e:"FileVault encrypts the startup disk."},
 {q:"A Mac app has frozen. Which keys open Force Quit?",o:["Ctrl+Alt+Del","Cmd+Option+Esc","Cmd+Space","Cmd+Tab"],a:1,e:"Cmd+Option+Esc opens the Force Quit Applications window."},
 {q:"Which is the macOS tool for repairing a drive with First Aid?",o:["Disk Utility","Finder","Terminal","Mission Control"],a:0,e:"Disk Utility's First Aid checks and repairs disks."},
 {q:"Which describes a Windows workgroup?",o:["Central accounts managed by a domain controller","Peer-to-peer computers, each with its own local accounts","A cloud-only login","A VPN connection"],a:1,e:"Workgroups have no central authority. Domains use Active Directory."},
 {q:"Where can a user show hidden files and file extensions in Windows?",o:["File Explorer Options","Device Manager","Power Options","Sound"],a:0,e:"File Explorer Options (or the View menu) controls hidden files and extensions."},
 {q:"Which power state saves the contents of RAM to disk and fully powers off?",o:["Sleep","Hibernate","Lock","Standby"],a:1,e:"Hibernate writes RAM to the hiberfil.sys file and turns the PC off."}
];

registerModule({
  id:"os",slug:"operating-systems",title:"Operating Systems",
  lessons:LESSONS,
  decks:[["tools","Windows tools"],["cmd","Commands"],["fs","File systems and editions"],["mac","macOS and Linux"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["fs","part","ed","cli"],
  viz(){
/* ---- File system explorer ---- */
(function(){
  const el=$("#viz-fs");if(!el)return;
  const FS={
    NTFS:{os:{Windows:2,macOS:1,Linux:2},max:"16 TB+",use:"Windows system drives",f:["Permissions","Encryption (EFS)","Compression","Journaling"]},
    FAT32:{os:{Windows:2,macOS:2,Linux:2},max:"4 GB",use:"Old devices, cameras, small USB drives",f:["Works almost everywhere","No permissions"]},
    exFAT:{os:{Windows:2,macOS:2,Linux:2},max:"16 EB",use:"Flash drives and SD cards",f:["Large files","No journaling","No permissions"]},
    ReFS:{os:{Windows:2,macOS:0,Linux:0},max:"35 PB",use:"Windows Server and storage pools",f:["Self-healing","Large volumes","Can't boot Windows clients"]},
    ext4:{os:{Windows:0,macOS:0,Linux:2},max:"16 TB",use:"Most Linux distributions",f:["Journaling","Permissions"]},
    XFS:{os:{Windows:0,macOS:0,Linux:2},max:"8 EB",use:"Red Hat Enterprise Linux default",f:["Journaling","Very large files"]},
    APFS:{os:{Windows:0,macOS:2,Linux:0},max:"8 EB",use:"macOS and iOS",f:["SSD-optimized","Snapshots","Built-in encryption"]}
  };
  const LV=["No native support","Read only","Read and write"];
  const seen=new Set();let cur="FAT32";
  el.innerHTML=`<div class="viz-title">Compare file systems</div>
  <div class="viz-controls">${Object.keys(FS).map(k=>`<button class="chip" data-fs="${k}">${k}</button>`).join("")}</div>
  <div class="fsx"></div>`;
  function draw(){
    const d=FS[cur];seen.add(cur);
    el.querySelectorAll("[data-fs]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.fs===cur));
    $(".fsx",el).innerHTML=`<div class="fsx-os">${Object.entries(d.os).map(([o,l])=>`<div class="fsx-row"><span>${o}</span><span class="fsx-bar"><i class="lv${l}" style="width:${[6,50,100][l]}%"></i></span><b class="lv${l}t">${LV[l]}</b></div>`).join("")}</div>
    <div class="fsx-side"><div class="fsx-max"><span class="s-small">MAX FILE SIZE</span><b class="mono">${d.max}</b></div><p><b>Used for:</b> ${d.use}</p><div class="chips">${d.f.map(x=>`<span class="tag">${x}</span>`).join("")}</div></div>`;
    if(seen.size===Object.keys(FS).length)award("viz:fs",30,"Compared every file system");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-fs]");if(b){cur=b.dataset.fs;draw()}});draw();
})();

/* ---- MBR vs GPT ---- */
(function(){
  const el=$("#viz-part");if(!el)return;
  let style="MBR",tb=4;const tried=new Set();
  el.innerHTML=`<div class="viz-title">Partition a drive: MBR vs GPT</div>
  <div class="viz-controls"><button class="chip" data-st="MBR">MBR (BIOS)</button><button class="chip" data-st="GPT">GPT (UEFI)</button>
  <label class="rng">Drive size <input type="range" min="1" max="8" value="4" data-tb><b class="mono"></b></label></div>
  <div class="disk"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){
    tried.add(style+(tb>2?"big":"small"));
    el.querySelectorAll("[data-st]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.st===style));
    $(".rng b",el).textContent=tb+" TB";
    const usable=style==="MBR"?Math.min(tb,2):tb,pct=usable/tb*100;
    const parts=style==="MBR"?[["System","p1",.05],["C:","p2",.55],["D:","p3",.3],["Recovery","p4",.1]]:[["EFI","p1",.03],["MSR","p4",.02],["C:","p2",.6],["D:","p3",.3],["Recovery","p4",.05]];
    $(".disk",el).innerHTML=`<div class="disk-used" style="width:${pct}%">${parts.map(([n,c,w])=>`<span class="dp ${c}" style="flex:${w}" title="${n}">${w>=.1?n:""}</span>`).join("")}</div>${pct<100?`<div class="disk-lost" style="width:${100-pct}%">${tb-usable} TB unusable</div>`:""}`;
    $(".caption",el).innerHTML=style==="MBR"
      ?`<b>MBR</b> holds the partition table in the first sector. Max <b>4 primary partitions</b> and <b>2 TB</b> per disk. ${tb>2?`<span class="status-bad">${tb-2} TB of this drive is wasted.</span> Switch to GPT.`:"This drive fits."}`
      :`<b>GPT</b> stores a backup copy of the partition table at the end of the disk. Windows allows <b>128 partitions</b> and drives far larger than 8 TB. Booting from GPT requires <b>UEFI</b>.`;
    if(tried.has("MBRbig")&&tried.has("GPTbig"))award("viz:part",20,"Compared MBR and GPT");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-st]");if(b){style=b.dataset.st;draw()}});
  el.addEventListener("input",e=>{if(e.target.matches("[data-tb]")){tb=+e.target.value;draw()}});draw();
})();

/* ---- Edition feature matrix ---- */
(function(){
  const el=$("#viz-ed");if(!el)return;
  const ED=["Home","Pro","Enterprise","Education"];
  const F=[["Join a domain or Entra ID",[0,1,1,1]],["BitLocker drive encryption",[0,1,1,1]],["Group Policy Editor (gpedit)",[0,1,1,1]],["Remote Desktop host",[0,1,1,1]],["Hyper-V",[0,1,1,1]],["Maximum RAM",["128 GB","2 TB","6 TB","2 TB"]],["How it is licensed",["Retail","Retail","Volume","Volume"]],["Remote Desktop client",[1,1,1,1]]];
  const seen=new Set();let cur=-1;
  el.innerHTML=`<div class="viz-title">Which Windows 11 edition does the job?</div>
  <p class="s-small" style="margin:0 0 10px">Click a feature row to see which editions include it.</p>
  <div class="scroll"><table class="edt"><thead><tr><th>Feature</th>${ED.map(e=>`<th>${e}</th>`).join("")}</tr></thead><tbody>
  ${F.map(([n,v],i)=>`<tr data-r="${i}" tabindex="0"><td>${n}</td>${v.map(x=>`<td class="${x===0?"ed-no":x===1?"ed-yes":"ed-val"}">${x===1?"✓":x===0?"✗":x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <div class="caption" aria-live="polite">Home is for consumers. Businesses usually need Pro or higher.</div>`;
  const NOTE=["Home can't join a domain. This is the most tested edition difference.","Home has only basic device encryption on some hardware. Full BitLocker with management needs Pro.","Home has no Local Group Policy Editor.","Home can connect out with Remote Desktop, but can't be connected to.","Hyper-V virtualization needs Pro or higher.","Home tops out at 128 GB, so workstations with more RAM need Pro or higher.","Enterprise and Education are sold through volume licensing to organizations and schools.","Every edition can connect out to another computer with Remote Desktop."];
  el.addEventListener("click",e=>{const r=e.target.closest("[data-r]");if(!r)return;cur=+r.dataset.r;seen.add(cur);
    el.querySelectorAll("[data-r]").forEach(x=>x.classList.toggle("sel",+x.dataset.r===cur));
    $(".caption",el).innerHTML=`<b>${F[cur][0]}.</b> ${NOTE[cur]}`;if(seen.size>=5)award("viz:ed",20,"Compared Windows editions")});
})();

/* ---- Command console ---- */
(function(){
  const el=$("#viz-cli");if(!el)return;
  const W={
    "ipconfig /all":"Host Name . . . . . : FRONTDESK-07\nPhysical Address. . : 3C-52-82-1A-77-0E\nDHCP Enabled. . . . : Yes\nIPv4 Address. . . . : 10.0.20.57\nDefault Gateway . . : 10.0.20.1\nDNS Servers . . . . : 10.0.0.10",
    "sfc /scannow":"Beginning system scan.  This process will take some time.\nVerification 100% complete.\nWindows Resource Protection found corrupt files and successfully repaired them.",
    "chkdsk C: /f":"The type of the file system is NTFS.\nCannot lock current drive.\nWould you like to schedule this volume to be checked\nthe next time the system restarts? (Y/N) Y",
    "gpupdate /force":"Updating policy...\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.",
    "gpresult /r":"Applied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n    Mapped Drives - Finance\n    USB Storage Block",
    "net use Z: \\\\fs01\\finance":"The command completed successfully.",
    "robocopy C:\\Data E:\\Backup /E":"   Total    Copied   Skipped  Mismatch    FAILED    Extras\nDirs :    42        42         0         0         0         0\nFiles:  1318      1318         0         0         0         0",
    "netstat -an":"  Proto  Local Address          Foreign Address        State\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING\n  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING\n  TCP    10.0.20.57:51544       52.96.14.2:443         ESTABLISHED",
    "winver":"Microsoft Windows\nVersion 24H2 (OS Build 26100)\nWindows 11 Pro",
    "whoami":"corp\\jsmith",
    "shutdown /r /t 0":"(The computer restarts immediately.)"
  };
  const L={
    "pwd":"/home/jsmith",
    "ls -l":"-rw-r--r-- 1 jsmith staff  2048 Nov  9 report.txt\n-rwxr-x--- 1 jsmith staff   512 Nov  9 backup.sh\ndrwxr-xr-x 2 jsmith staff  4096 Nov  9 photos",
    "chmod 750 backup.sh":"(No output. Owner rwx, group r-x, others none.)",
    "sudo apt install htop":"[sudo] password for jsmith:\nReading package lists... Done\nSetting up htop (3.3.0-4) ...",
    "grep error /var/log/syslog":"Nov  9 08:14:02 web01 nginx: connect() failed: error 111\nNov  9 08:14:05 web01 nginx: upstream error, retrying",
    "df -h":"Filesystem   Size  Used Avail Use% Mounted on\n/dev/sda2     98G   91G  2.1G  98% /\n/dev/sdb1    1.8T  420G  1.3T  24% /data",
    "ps aux | head -3":"USER   PID %CPU %MEM COMMAND\nroot     1  0.0  0.1 /sbin/init\nwww    842 87.5  4.2 nginx: worker process",
    "ip addr":"2: eth0: <BROADCAST,UP> mtu 1500\n    inet 192.168.1.40/24 brd 192.168.1.255 scope global eth0",
    "sudo chown alice report.txt":"(No output. alice now owns report.txt.)",
    "man ls":"LS(1)        User Commands        LS(1)\nNAME\n       ls - list directory contents"
  };
  const NOTE={"chkdsk C: /f":"chkdsk can't fix the system drive while Windows is using it, so it schedules a check at the next restart.","df -h":"98% full on / is a problem worth fixing before the server stops writing logs.","ps aux | head -3":"nginx is using 87.5% CPU. top would show this live.","sfc /scannow":"Run it from an elevated prompt.","gpresult /r":"Shows which policies actually applied, handy when a setting isn't taking effect."};
  let os="win";const seen=new Set();
  el.innerHTML=`<div class="viz-title">Command console</div>
  <div class="viz-controls"><button class="chip" data-os="win">Windows</button><button class="chip" data-os="lin">Linux</button></div>
  <div class="chips cmds"></div><pre class="term" aria-live="polite"></pre><div class="caption"></div>`;
  function tabs(){
    el.querySelectorAll("[data-os]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.os===os));
    const D=os==="win"?W:L;
    $(".cmds",el).innerHTML=Object.keys(D).map(c=>`<button class="chip" data-c="${c.replace(/"/g,"&quot;")}">${c}</button>`).join("");
    $(".term",el).innerHTML=`<span class="t-n">${os==="win"?"Click a command to run it in Command Prompt.":"Click a command to run it in a bash shell."}</span>`;
    $(".caption",el).textContent=`${seen.size} of 8 commands tried`;
  }
  function run(c){
    const D=os==="win"?W:L,p=os==="win"?"C:\\&gt; ":"jsmith@web01:~$ ";seen.add(c);
    el.querySelectorAll("[data-c]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===c));
    const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    $(".term",el).innerHTML=`<span class="t-c">${p}${esc(c)}</span>\n<span class="t-ok">${esc(D[c])}</span>`;
    $(".caption",el).innerHTML=(NOTE[c]?NOTE[c]+" ":"")+`<span class="s-small">${Math.min(seen.size,8)} of 8 commands tried</span>`;
    if(seen.size>=8)award("viz:cli",30,"Ran 8 commands");
  }
  el.addEventListener("click",e=>{const o=e.target.closest("[data-os]");if(o){os=o.dataset.os;tabs();return}const c=e.target.closest("[data-c]");if(c)run(c.dataset.c)});
  tabs();
})();
  },
  sims:[
    {id:"tools",type:"match",title:"Pick the right Windows tool",
      scenario:"Eight help desk requests. Match each one to the tool that handles it. Tap a tool, then tap the request.",
      items:[["Event Viewer","logs"],["Disk Management","disk"],["Task Scheduler","sched"],["Device Manager","drv"],["Services","svc"],["msconfig","safe"],["Resource Monitor","res"],["Local Users and Groups","user"]],
      slots:[["logs","Why did the app crash at 3 a.m.?","Need timestamps and error codes"],["disk","New drive shows as unallocated","Needs a partition and format"],["sched","Run a cleanup script every Friday",""],["drv","Roll back the new graphics driver",""],["svc","Make a service start automatically",""],["safe","Boot into Safe Mode next restart",""],["res","Which app is hammering the disk?","Live, per process"],["user","Reset a local account password","Windows Pro PC"]],
      success:"You know where everything lives in Windows."},
    {id:"cmds",type:"match",title:"Command line challenge",
      scenario:"Match each task to the command that does it. Tap a command, then tap the task.",
      items:[["sfc /scannow","sfc"],["chkdsk /r","chk"],["gpupdate /force","gpu"],["robocopy","robo"],["net use","net"],["netstat","ns"],["chmod","chmod"],["sudo apt install","apt"]],
      slots:[["sfc","Repair corrupted Windows system files",""],["chk","Find bad sectors on a drive",""],["gpu","Apply a new policy right now",""],["robo","Copy 200 GB of folders, resuming on failure",""],["net","Map Z: to a file share",""],["ns","List listening ports",""],["chmod","Make a Linux script executable",""],["apt","Install software on Ubuntu",""]],
      success:"Command line mastered on both platforms."},
    {id:"build",title:"Install Windows for an accounting firm",mount(el,api,sim){
      const F={ed:"",fw:"Legacy BIOS",tpm:false,ps:"",fsys:"",type:"",boot:"",join:"Workgroup",bl:false};let R={...F},graded=null;
      const CHECKS=[
        ["Edition can join the domain and use BitLocker",()=>R.ed==="Pro","Home can't join a domain or use BitLocker. Enterprise needs a volume license the firm doesn't have."],
        ["Firmware set to UEFI with TPM enabled",()=>R.fw==="UEFI"&&R.tpm,"Windows 11 needs UEFI, Secure Boot and TPM 2.0."],
        ["GPT partition table",()=>R.ps==="GPT","The drive is 4 TB. MBR would waste 2 TB, and UEFI boots from GPT."],
        ["NTFS file system",()=>R.fsys==="NTFS","Windows installs on NTFS. It also supports permissions and BitLocker."],
        ["Clean install",()=>R.type==="Clean install","The drive is brand new and blank, so there's nothing to upgrade."],
        ["USB boot media",()=>R.boot==="USB drive","The firm has no deployment server for PXE, and the PC has no optical drive."],
        ["Joined to the company domain",()=>R.join==="Domain: acct.local","The firm uses central domain accounts."],
        ["BitLocker turned on",()=>R.bl,"Client financial data must be encrypted at rest."]
      ];
      const sel=(id,f,opts)=>`<select id="w-${id}" data-f="${f}"><option value="" ${!R[f]?"selected":""}>Choose…</option>${opts.map(o=>`<option ${R[f]===o?"selected":""}>${o}</option>`).join("")}</select>`;
      function draw(){
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <div class="scenario"><p>A 12-person accounting firm bought a new PC with a blank 4 TB SSD and no optical drive. They buy retail licenses and have no deployment server. Requirements:</p>
        <ol><li>Run Windows 11 and sign in with accounts from the firm's <b>acct.local</b> domain.</li><li>Encrypt the drive, since it holds client tax records.</li><li>Use the full 4 TB.</li></ol></div>
        <div class="router"><div class="router-bar"><span>Setup checklist</span><span class="mono">ACCT-PC-13</span></div><div class="router-body">
          <label class="rf"><span>Firmware mode</span><select id="w-fw" data-f="fw">${["Legacy BIOS","UEFI"].map(o=>`<option ${R.fw===o?"selected":""}>${o}</option>`).join("")}</select></label>
          <label class="rf rf-tog"><span>TPM 2.0 (firmware)</span><input type="checkbox" id="w-tpm" data-f="tpm" ${R.tpm?"checked":""}></label>
          <label class="rf"><span>Boot media</span>${sel("boot","boot",["USB drive","PXE network boot","DVD"])}</label>
          <label class="rf"><span>Edition</span>${sel("ed","ed",["Home","Pro","Enterprise"])}</label>
          <label class="rf"><span>Install type</span>${sel("type","type",["Clean install","In-place upgrade","Repair install"])}</label>
          <label class="rf"><span>Partition table</span>${sel("ps","ps",["MBR","GPT"])}</label>
          <label class="rf"><span>File system</span>${sel("fsys","fsys",["NTFS","FAT32","exFAT"])}</label>
          <label class="rf"><span>Network identity</span><select id="w-join" data-f="join">${["Workgroup","Domain: acct.local"].map(o=>`<option ${R.join===o?"selected":""}>${o}</option>`).join("")}</select></label>
          <label class="rf rf-tog"><span>BitLocker</span><input type="checkbox" id="w-bl" data-f="bl" ${R.bl?"checked":""}></label>
        </div></div>
        ${graded?`<div class="grade">${CHECKS.map((c,i)=>`<div class="${graded[i]?"g-ok":"g-no"}"><b>${graded[i]?"✓":"✗"} ${c[0]}</b>${graded[i]?"":`<span>${c[2]}</span>`}</div>`).join("")}</div>`:""}
        <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">All ${CHECKS.length} requirements met.</span> The PC is encrypted, on the domain and ready for tax season.`:`<b>${graded.filter(Boolean).length} of ${CHECKS.length}</b> requirements met. Fix the ones marked ✗ and check again.`):"Press <b>Check setup</b> when you're done."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Check setup</button><button class="btn" data-a="reset">Start over</button></div>`;
      }
      el.addEventListener("change",e=>{const f=e.target.dataset.f;if(!f)return;R[f]=e.target.type==="checkbox"?e.target.checked:e.target.value});
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;
        if(a==="reset"){R={...F};graded=null;draw()}
        if(a==="grade"){graded=CHECKS.map(c=>c[1]());if(graded.every(Boolean))api.pass();draw()}});
      draw();
    }}
  ],
  badges:[
    ["reader","OS","Sysadmin","Mark all 8 operating system lessons studied",c=>c.allStudied()],
    ["lab","FS","Formatter","Complete all 4 operating system diagrams",c=>c.vizAll()],
    ["tools","MM","Snap-in Savvy","Pass the Windows tools simulation",c=>c.passed("tools")],
    ["cmds","CL","Command Line","Pass the command line simulation",c=>c.passed("cmds")],
    ["build","IN","Installer","Pass the Windows install simulation",c=>c.passed("build")],
    ["perfect","RT","Root","Score 100% on an operating systems quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
