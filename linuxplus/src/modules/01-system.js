/* ================= Module 1: System Management (XK0-006 Domain 1.0, 23%) ================= */
(function(){
/* run setup commands as root inside a lab world */
const R=(w,...cmds)=>{const s=LX.session(w,"root");cmds.forEach(c=>LX.exec(s,c))};
const has=(w,p)=>!!LX.lookup(w,p);
const fstab=w=>LX.read(w,"/etc/fstab")||"";
const mnt=(w,t)=>w.mounts.find(m=>m.tgt===t);
const LABS={
 boot:{title:"Shell exercise: boot targets and kernel arguments",host:"server1",
   scenario:"This server boots to a graphical desktop nobody uses. Make it boot to the text-mode multi-user target, then add a kernel argument for every installed kernel.",
   setup:w=>{w.boot.target="graphical.target"},
   tasks:[{t:"Check the current default target",hint:"systemctl get-default",check:(w,sh)=>LX.ran(sh,/get-default/),sticky:true},
     {t:"Make multi-user.target the default",hint:"sudo systemctl set-default multi-user.target",check:w=>w.boot.target==="multi-user.target"},
     {t:"Add the kernel argument audit=1 to every kernel with grubby",hint:'sudo grubby --update-kernel=ALL --args="audit=1"',check:w=>/audit=1/.test(w.boot.extra||"")},
     {t:"Confirm it with grubby --info=DEFAULT",hint:"sudo grubby --info=DEFAULT",check:(w,sh)=>LX.ran(sh,/grubby\s+--info/),sticky:true}],
   solution:"systemctl get-default\nsudo systemctl set-default multi-user.target\nsudo grubby --update-kernel=ALL --args=\"audit=1\"\nsudo grubby --info=DEFAULT"},
 kmod:{title:"Shell exercise: kernel modules",
   scenario:"A security review says the usb-storage driver must never load on this server. Look at the loaded modules, then block it the persistent way.",
   setup:w=>{if(!w.kmods.includes("usb_storage"))w.kmods.push("usb_storage")},
   tasks:[{t:"List the loaded modules and find usb_storage",hint:"lsmod | grep usb",check:(w,sh)=>LX.ran(sh,/lsmod/),sticky:true},
     {t:"Unload it now",hint:"sudo modprobe -r usb_storage",check:w=>!w.kmods.includes("usb_storage")},
     {t:"Blacklist it in a file under /etc/modprobe.d/",hint:'echo "blacklist usb_storage" | sudo tee /etc/modprobe.d/usb-storage.conf',check:w=>{const d=LX.lookup(w,"/etc/modprobe.d");return !!d&&Object.values(d.k).some(n=>/^\s*(blacklist\s+usb[_-]storage|install\s+usb[_-]storage\s+\/bin\/(false|true))/m.test(n.c||""))}}],
   solution:"lsmod | grep usb\nsudo modprobe -r usb_storage\necho \"blacklist usb_storage\" | sudo tee /etc/modprobe.d/usb-storage.conf"},
 part:{title:"Shell exercise: partition, format and mount",world:{disks:[["sdb",8]]},panel:LX.panelStorage,
   scenario:"A new 8 GB disk, /dev/sdb, was attached. Give it a GPT label, one partition, an ext4 filesystem with the label LOGS, and mount it on /mnt/logs.",
   tasks:[{t:"Create a GPT partition table and one partition",hint:"sudo parted /dev/sdb mklabel gpt\nsudo parted /dev/sdb mkpart logs ext4 1MiB 100%",check:w=>w.disks.sdb.label==="gpt"&&w.disks.sdb.parts.length===1},
     {t:"Make an ext4 filesystem labeled LOGS",hint:"sudo mkfs.ext4 -L LOGS /dev/sdb1",check:w=>w.fs["/dev/sdb1"]&&w.fs["/dev/sdb1"].type==="ext4"&&w.fs["/dev/sdb1"].label==="LOGS"},
     {t:"Mount it on /mnt/logs",hint:"sudo mkdir -p /mnt/logs\nsudo mount /dev/sdb1 /mnt/logs",check:w=>{const m=mnt(w,"/mnt/logs");return !!m&&m.src==="/dev/sdb1"}}],
   solution:"lsblk\nsudo parted /dev/sdb mklabel gpt\nsudo parted /dev/sdb mkpart logs ext4 1MiB 100%\nsudo mkfs.ext4 -L LOGS /dev/sdb1\nsudo mkdir -p /mnt/logs\nsudo mount /dev/sdb1 /mnt/logs\nlsblk -f /dev/sdb"},
 net:{title:"Shell exercise: read the network configuration",
   scenario:"Before you change anything on a server, you look. Find the address, the default gateway and the DNS server.",
   tasks:[{t:"Show the IP addresses",hint:"ip -br addr",check:(w,sh)=>LX.ran(sh,/^ip\s+(-\w+\s+)*a(ddr)?\b|ifconfig|nmcli\s+(d|dev|device)\s+show/),sticky:true},
     {t:"Show the routing table",hint:"ip route",check:(w,sh)=>LX.ran(sh,/ip\s+r(oute)?\b|route\s+-n|netstat\s+-r/),sticky:true},
     {t:"Find the DNS server",hint:"cat /etc/resolv.conf",check:(w,sh)=>LX.ran(sh,/resolv\.conf|resolvectl|nmcli.*dns/i),sticky:true},
     {t:"Test name resolution of www.example.com",hint:"dig www.example.com",check:(w,sh)=>LX.ran(sh,/(dig|nslookup|host|getent\s+hosts|ping).*example\.com/),sticky:true}],
   solution:"ip -br addr\nip route\ncat /etc/resolv.conf\ndig www.example.com +short"},
 redir:{title:"Shell exercise: pipes and redirection",
   world:{files:{"/home/admin/access.log":{c:"10.0.0.21 GET /index.html 200\n10.0.0.35 GET /admin 403\n10.0.0.21 GET /missing 404\n10.0.0.48 GET /index.html 200\n10.0.0.35 GET /old 404\n10.0.0.21 GET /cart 404\n10.0.0.62 POST /login 200\n",owner:"admin:admin"}}},
   scenario:"A web log is in your home directory. Answer the questions with pipelines and save the answers to files.",
   tasks:[{t:"Save the number of 404 lines to ~/404.txt",hint:"grep -c ' 404' access.log > 404.txt",check:w=>/^\s*3\s*$/.test(LX.read(w,"/home/admin/404.txt")||"")},
     {t:"Save the unique client IPs, sorted, to ~/ips.txt",hint:"cut -d' ' -f1 access.log | sort -u > ips.txt",check:w=>/^10\.0\.0\.21\n10\.0\.0\.35\n10\.0\.0\.48\n10\.0\.0\.62\n/.test(LX.read(w,"/home/admin/ips.txt")||"")},
     {t:"Run ls on /nonexistent and send only the error message to ~/err.txt",hint:"ls /nonexistent 2> err.txt",check:w=>/No such file/.test(LX.read(w,"/home/admin/err.txt")||"")},
     {t:"Append the line 'done' to ~/ips.txt without overwriting it",hint:"echo done >> ips.txt",check:w=>/10\.0\.0\.62\ndone\n?$/.test(LX.read(w,"/home/admin/ips.txt")||"")}],
   solution:"grep -c ' 404' access.log > 404.txt\ncut -d' ' -f1 access.log | sort -u > ips.txt\nls /nonexistent 2> err.txt\necho done >> ips.txt\ncat 404.txt ips.txt err.txt"},
 env:{title:"Shell exercise: variables and your environment",
   scenario:"Set a variable for this shell, export it to child processes, and make an alias permanent.",
   tasks:[{t:"Set and export APP_ENV=staging",hint:"export APP_ENV=staging",check:(w,sh)=>sh.v.APP_ENV==="staging"&&sh.exp.has("APP_ENV")},
     {t:"Prove a child shell sees it",hint:"bash -c 'echo $APP_ENV'",check:(w,sh)=>LX.ran(sh,/bash\s+-c|env\s*\|\s*grep|printenv/),sticky:true},
     {t:"Add the alias ll='ls -lh' to ~/.bashrc so new shells get it",hint:"echo \"alias ll='ls -lh'\" >> ~/.bashrc",check:w=>/alias ll=['"]?ls -lh/.test(LX.read(w,"/home/admin/.bashrc")||"")},
     {t:"Load ~/.bashrc into the current shell",hint:"source ~/.bashrc",check:(w,sh)=>LX.ran(sh,/^(source|\.)\s+~?\/?.*\.bashrc/)&&sh.aliases.ll==="ls -lh"}],
   solution:"export APP_ENV=staging\nbash -c 'echo $APP_ENV'\necho \"alias ll='ls -lh'\" >> ~/.bashrc\nsource ~/.bashrc\nll"},
 backup:{title:"Shell exercise: archive and copy",
   world:{files:{"/var/www/html/index.html":"<h1>shop</h1>\n","/var/www/html/app.js":"console.log('shop')\n"}},
   setup:w=>R(w,"mkdir -p /backup"),
   scenario:"Back up the web content two ways: a compressed archive and an rsync mirror.",
   tasks:[{t:"Create a gzip-compressed archive /backup/www.tar.gz of /var/www/html",hint:"sudo tar -czf /backup/www.tar.gz /var/www/html",check:w=>/var\/www\/html\/index\.html/.test(LX.read(w,"/backup/www.tar.gz")||"")},
     {t:"List the archive's contents without extracting it",hint:"tar -tzf /backup/www.tar.gz",check:(w,sh)=>LX.ran(sh,/tar\s+(-?\w*t\w*|--list)/),sticky:true},
     {t:"Mirror /var/www/html/ into /backup/mirror/ with rsync, keeping permissions and times",hint:"sudo rsync -av /var/www/html/ /backup/mirror/",check:w=>has(w,"/backup/mirror/index.html")&&has(w,"/backup/mirror/app.js")}],
   solution:"sudo tar -czf /backup/www.tar.gz /var/www/html\ntar -tzf /backup/www.tar.gz\nsudo rsync -av /var/www/html/ /backup/mirror/\nls -l /backup /backup/mirror"}
};
const LESSONS=[
{id:"boot",num:"1.1",title:"The boot process, GRUB and systemd targets",html:`
<p>Every Linux troubleshooting question about "it won't boot" comes down to knowing which stage failed. The stages, in order:</p>
<ol><li><b>Firmware</b>: <b>UEFI</b> (modern) or legacy <b>BIOS</b> runs the power-on self-test and finds a boot device. UEFI reads the <b>EFI System Partition</b> (FAT32, mounted at <code>/boot/efi</code>) and runs a bootloader file such as <code>shimx64.efi</code> then <code>grubx64.efi</code>. <b>Secure Boot</b> checks that each piece is signed. BIOS instead reads the first 512 bytes of the disk, the <b>MBR</b>.</li>
<li><b>Bootloader</b>: <b>GRUB2</b> shows the menu, loads the kernel (<code>/boot/vmlinuz-*</code>) and the <b>initramfs</b> into memory, and passes the <b>kernel command line</b>.</li>
<li><b>Kernel</b>: initializes hardware and memory, then unpacks the initramfs, a small temporary root filesystem with the drivers needed to reach the real root (storage, LVM, RAID, LUKS).</li>
<li><b>initramfs</b>: finds and mounts the real root filesystem and hands over to it.</li>
<li><b>systemd</b> (PID 1): starts units in parallel until it reaches the <b>default target</b>.</li></ol>
<div class="viz" id="viz-bootflow"></div>
<h3>GRUB2</h3>
<p>Don't edit <code>/boot/grub2/grub.cfg</code> directly; it is generated. Change <code>/etc/default/grub</code> (for example <code>GRUB_TIMEOUT</code> or <code>GRUB_CMDLINE_LINUX</code>) and regenerate:</p>
<pre class="term">sudo grub2-mkconfig -o /boot/grub2/grub.cfg      <span class="t-n"># RHEL family</span>
sudo update-grub                                <span class="t-n"># Debian/Ubuntu</span>
sudo grubby --update-kernel=ALL --args="audit=1" <span class="t-n"># RHEL: change arguments directly</span>
sudo grubby --set-default /boot/vmlinuz-6.12.0-55.el9.x86_64</pre>
<p>At the GRUB menu, press <b>e</b> to edit an entry for one boot only. Adding <code>systemd.unit=rescue.target</code> (or <code>rd.break</code> to stop inside the initramfs) is how you get in when a password is lost or <code>/etc/fstab</code> is broken. After changing drivers needed at boot, rebuild the initramfs with <code>dracut -f</code> (RHEL) or <code>update-initramfs -u</code> (Debian).</p>
<h3>systemd targets</h3>
<table><tr><th>Target</th><th>Old runlevel</th><th>What you get</th></tr>
<tr><td>poweroff.target</td><td>0</td><td>Shut down</td></tr><tr><td>rescue.target</td><td>1</td><td>Single user, root shell, local filesystems mounted</td></tr>
<tr><td>emergency.target</td><td>(none)</td><td>Root shell, root filesystem read-only, almost nothing started</td></tr>
<tr><td>multi-user.target</td><td>3</td><td>Full text-mode system with networking</td></tr><tr><td>graphical.target</td><td>5</td><td>multi-user plus a display manager</td></tr><tr><td>reboot.target</td><td>6</td><td>Reboot</td></tr></table>
<pre class="term">systemctl get-default
sudo systemctl set-default multi-user.target   <span class="t-n"># next boot</span>
sudo systemctl isolate rescue.target           <span class="t-n"># switch now</span></pre>
<div class="viz" id="viz-targets"></div>
<div class="viz" id="viz-bootlab"></div>`},
{id:"fhs",num:"1.2",title:"Filesystem hierarchy, devices and kernel modules",html:`
<p>The <b>Filesystem Hierarchy Standard (FHS)</b> says where things live, so any admin can find them on any distribution.</p>
<div class="viz" id="viz-fhs"></div>
<h3>Everything is a file</h3>
<ul><li><b>/dev</b> holds device files. Block devices (disks: <code>/dev/sda</code>, <code>/dev/nvme0n1</code>, <code>/dev/vda</code>) move data in blocks; character devices (<code>/dev/tty</code>, <code>/dev/null</code>, <code>/dev/random</code>) move a stream of bytes. <b>udev</b> creates these nodes when the kernel detects hardware, and adds stable names under <code>/dev/disk/by-uuid/</code> and <code>/dev/disk/by-id/</code>.</li>
<li><b>/proc</b> is a virtual window into the kernel and processes: <code>/proc/cpuinfo</code>, <code>/proc/meminfo</code>, <code>/proc/mounts</code>, <code>/proc/&lt;PID&gt;/</code>. <b>/sys</b> exposes devices and drivers. Neither takes disk space.</li>
<li>Hardware inventory: <code>lscpu</code>, <code>lsblk</code>, <code>lspci</code>, <code>lsusb</code>, <code>lshw</code>, <code>dmidecode</code> (BIOS, serial numbers), <code>dmesg</code> (kernel ring buffer: detection and driver messages).</li></ul>
<h3>Kernel modules</h3>
<p>Drivers and features are usually loadable <b>modules</b> under <code>/lib/modules/$(uname -r)/</code>.</p>
<table><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>lsmod</code></td><td>List loaded modules and what uses them</td></tr>
<tr><td><code>modinfo xfs</code></td><td>Show a module's file, description, parameters</td></tr>
<tr><td><code>modprobe name</code></td><td>Load a module and its dependencies (preferred)</td></tr>
<tr><td><code>modprobe -r name</code></td><td>Unload it (fails if in use)</td></tr>
<tr><td><code>insmod / rmmod</code></td><td>Low-level load and unload with no dependency handling</td></tr>
<tr><td><code>depmod</code></td><td>Rebuild the dependency map</td></tr></table>
<p>Persistent settings go in <code>/etc/modprobe.d/*.conf</code> (<code>blacklist usb_storage</code>, <code>options e1000 debug=1</code>). Modules to load at every boot go in <code>/etc/modules-load.d/*.conf</code>. Runtime kernel tuning uses <code>sysctl</code> with persistent files in <code>/etc/sysctl.d/</code>.</p>
<div class="viz" id="viz-kmod"></div>`},
{id:"storage",num:"1.3",title:"Partitions, filesystems and mounting",html:`
<h3>Partition tables</h3>
<table><tr><th></th><th>MBR (msdos)</th><th>GPT</th></tr>
<tr><td>Max disk size</td><td>2 TiB</td><td>Effectively unlimited (8 ZiB)</td></tr>
<tr><td>Partitions</td><td>4 primary (or 3 + extended with logicals)</td><td>128 by default</td></tr>
<tr><td>Firmware</td><td>BIOS</td><td>UEFI (required for UEFI boot)</td></tr>
<tr><td>Resilience</td><td>One copy at the start of the disk</td><td>Backup header at the end, CRC checks</td></tr></table>
<p>Tools: <code>fdisk</code> (MBR and GPT, interactive), <code>gdisk</code> (GPT), <code>parted</code> (scriptable, both), <code>sfdisk</code> (dump and restore layouts). After changing a disk that's in use, run <code>partprobe</code> so the kernel rereads it.</p>
<h3>Filesystems</h3>
<table><tr><th>Type</th><th>Strengths</th><th>Grow / shrink</th></tr>
<tr><td><b>xfs</b></td><td>RHEL default, great for large files and parallel I/O</td><td>Grow only, while mounted: <code>xfs_growfs /mount</code></td></tr>
<tr><td><b>ext4</b></td><td>Debian/Ubuntu default, mature, journaled</td><td>Grow online, shrink offline: <code>resize2fs</code></td></tr>
<tr><td><b>btrfs</b></td><td>Copy-on-write, snapshots, checksums, subvolumes</td><td>Both, online</td></tr>
<tr><td><b>vfat</b></td><td>EFI System Partition, USB sticks</td><td>-</td></tr>
<tr><td><b>swap</b></td><td>Virtual memory: <code>mkswap</code>, <code>swapon</code></td><td>-</td></tr>
<tr><td><b>tmpfs</b></td><td>RAM-backed (<code>/run</code>, <code>/dev/shm</code>)</td><td>-</td></tr></table>
<p>Make one with <code>mkfs.xfs /dev/sdb1</code> or <code>mkfs -t ext4 -L DATA /dev/sdb1</code>. See what's there with <code>lsblk -f</code> or <code>blkid</code>. Check and repair <b>unmounted</b> filesystems with <code>fsck</code>/<code>e2fsck</code> (ext) or <code>xfs_repair</code> (xfs).</p>
<h3>Mounting and /etc/fstab</h3>
<pre class="term">sudo mount /dev/sdb1 /mnt/data            <span class="t-n"># now, until reboot</span>
sudo mount -o remount,ro /mnt/data
sudo umount /mnt/data                     <span class="t-n"># "target is busy"? find who: lsof +D /mnt/data or fuser -vm /mnt/data</span></pre>
<p>To survive a reboot, add a line to <code>/etc/fstab</code>. Six fields:</p>
<pre class="term">UUID=6b2f8c3e-...  /srv/data  xfs  defaults,nofail  0 0
<span class="t-n"># device           mountpoint type options          dump fsck-order</span></pre>
<ul><li>Use <b>UUID=</b> or <b>LABEL=</b>, never <code>/dev/sdb1</code>, because device names can change between boots. LVM paths like <code>/dev/vgdata/lvweb</code> are stable too.</li>
<li>The last field is the fsck order: 1 for /, 2 for others, 0 to skip (xfs ignores it).</li>
<li><b>Test before you reboot</b>: <code>sudo mount -a</code> and <code>sudo findmnt --verify</code>. A bad line without <code>nofail</code> drops the system into emergency mode on the next boot. After editing fstab, run <code>systemctl daemon-reload</code>.</li>
<li>Network filesystems (NFS, SMB/CIFS) add <code>_netdev</code> so they wait for the network. <b>autofs</b> mounts them on first access instead.</li></ul>
<div class="viz" id="viz-fstab"></div>
<div class="viz" id="viz-partlab"></div>`},
{id:"lvm",num:"1.4",title:"LVM and RAID",html:`
<p><b>Logical Volume Manager</b> puts a flexible layer between disks and filesystems, so you can grow volumes, span disks and take snapshots without repartitioning.</p>
<ul><li><b>PV</b> (physical volume): a disk or partition prepared with <code>pvcreate</code>.</li><li><b>VG</b> (volume group): a pool of PVs, made with <code>vgcreate</code>, grown with <code>vgextend</code>.</li><li><b>LV</b> (logical volume): carved from a VG with <code>lvcreate</code>. It appears as <code>/dev/VG/LV</code> and <code>/dev/mapper/VG-LV</code>, and you put a filesystem on it.</li></ul>
<div class="viz" id="viz-lvmstack"></div>
<pre class="term">sudo pvcreate /dev/sdb /dev/sdc
sudo vgcreate vgdata /dev/sdb /dev/sdc
sudo lvcreate -n lvweb -L 20G vgdata        <span class="t-n"># or -l 100%FREE</span>
sudo mkfs.xfs /dev/vgdata/lvweb
sudo lvextend -r -L +10G /dev/vgdata/lvweb  <span class="t-n"># -r grows the filesystem too</span>
pvs; vgs; lvs                                <span class="t-n"># summaries (pvdisplay etc. for detail)</span></pre>
<div class="tip"><b>Two steps to grow.</b> Extending the LV doesn't grow the filesystem inside it. Use <code>lvextend -r</code>, or follow up with <code>xfs_growfs /mountpoint</code> (xfs) or <code>resize2fs /dev/VG/LV</code> (ext4). If the VG has no free space, add a disk first: <code>pvcreate</code> then <code>vgextend</code>.</div>
<h3>RAID</h3>
<p>RAID combines disks for speed, redundancy or both. Linux software RAID uses <code>mdadm</code> and shows status in <code>/proc/mdstat</code>.</p>
<div class="viz" id="viz-raid"></div>
<pre class="term">sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
cat /proc/mdstat
sudo mdadm --detail /dev/md0
sudo mdadm /dev/md0 --fail /dev/sdc --remove /dev/sdc   <span class="t-n"># replace a bad disk</span>
sudo mdadm /dev/md0 --add /dev/sdd
sudo mdadm --detail --scan | sudo tee -a /etc/mdadm.conf  <span class="t-n"># persist the array</span></pre>
<div class="tip"><b>RAID is not a backup.</b> It protects against a failed disk, not against deletion, ransomware or a fire.</div>`},
{id:"net",num:"1.5",title:"Network configuration",html:`
<h3>Look first</h3>
<table><tr><th>Task</th><th>Modern (iproute2)</th><th>Legacy (net-tools)</th></tr>
<tr><td>Addresses</td><td><code>ip addr</code> (<code>ip -br a</code>)</td><td><code>ifconfig</code></td></tr>
<tr><td>Routes</td><td><code>ip route</code></td><td><code>route -n</code></td></tr>
<tr><td>Neighbors (ARP)</td><td><code>ip neigh</code></td><td><code>arp -n</code></td></tr>
<tr><td>Sockets</td><td><code>ss -tulpn</code></td><td><code>netstat -tulpn</code></td></tr>
<tr><td>Link details</td><td><code>ip -s link</code>, <code>ethtool eth0</code></td><td>-</td></tr></table>
<p>Changes made with <code>ip addr add</code> or <code>ip route add</code> are <b>runtime only</b> and vanish at reboot. Persistent settings belong to the network manager in use:</p>
<ul><li><b>NetworkManager</b> (RHEL, Fedora, many desktops): <code>nmcli</code> or the text UI <code>nmtui</code>. Profiles live in <code>/etc/NetworkManager/system-connections/</code>.</li>
<li><b>Netplan</b> (Ubuntu): YAML in <code>/etc/netplan/*.yaml</code>, applied with <code>netplan try</code> (rolls back if you lose access) or <code>netplan apply</code>. It renders to systemd-networkd or NetworkManager.</li>
<li><b>systemd-networkd</b>: <code>.network</code> files in <code>/etc/systemd/network/</code>.</li></ul>
<pre class="term">nmcli con show
sudo nmcli con mod eth0 ipv4.method manual ipv4.addresses 10.0.0.50/24 \\
     ipv4.gateway 10.0.0.1 ipv4.dns 10.0.0.53
sudo nmcli con up eth0        <span class="t-n"># apply the change</span></pre>
<h3>Names and resolution</h3>
<ul><li><code>hostnamectl set-hostname web01.example.lan</code> sets the static hostname in <code>/etc/hostname</code>.</li>
<li>Lookups follow <code>/etc/nsswitch.conf</code> (<code>hosts: files dns</code>): first <code>/etc/hosts</code>, then DNS servers from <code>/etc/resolv.conf</code>. On systemd-resolved systems, resolv.conf points at the stub 127.0.0.53; check real servers with <code>resolvectl status</code>.</li>
<li>Test with <code>dig</code>, <code>nslookup</code>, <code>host</code>, and <code>getent hosts name</code> (which follows nsswitch like applications do).</li></ul>
<div class="viz" id="viz-resolve"></div>
<div class="viz" id="viz-netlab"></div>`},
{id:"shell",num:"1.6",title:"Shell operations: redirection, pipes, globs and variables",html:`
<h3>Streams and redirection</h3>
<p>Every process has three streams: <b>stdin (0)</b>, <b>stdout (1)</b> and <b>stderr (2)</b>.</p>
<table><tr><th>Syntax</th><th>Meaning</th></tr>
<tr><td><code>cmd &gt; file</code></td><td>stdout to file (overwrite)</td></tr><tr><td><code>cmd &gt;&gt; file</code></td><td>stdout appended</td></tr>
<tr><td><code>cmd 2&gt; file</code></td><td>stderr to file</td></tr><tr><td><code>cmd &gt; file 2&gt;&amp;1</code> or <code>cmd &amp;&gt; file</code></td><td>both to the same file</td></tr>
<tr><td><code>cmd 2&gt;/dev/null</code></td><td>discard errors</td></tr><tr><td><code>cmd &lt; file</code></td><td>stdin from a file</td></tr>
<tr><td><code>cmd &lt;&lt;EOF ... EOF</code></td><td>here document: inline multi-line stdin</td></tr><tr><td><code>cmd &lt;&lt;&lt; "text"</code></td><td>here string</td></tr>
<tr><td><code>a | b</code></td><td>a's stdout becomes b's stdin</td></tr><tr><td><code>a | tee file</code></td><td>show and save at the same time (<code>tee -a</code> appends)</td></tr></table>
<div class="tip"><b>Order matters.</b> <code>cmd &gt; out 2&gt;&amp;1</code> sends both streams to <i>out</i>. <code>cmd 2&gt;&amp;1 &gt; out</code> sends errors to the terminal, because 2 was copied from 1 before 1 moved. And <code>sudo echo x &gt; /etc/file</code> fails: the redirection runs in your unprivileged shell. Use <code>echo x | sudo tee /etc/file</code>.</div>
<div class="viz" id="viz-redir"></div>
<h3>Combining commands</h3>
<p><code>a ; b</code> runs both. <code>a &amp;&amp; b</code> runs b only if a succeeds (exit status 0). <code>a || b</code> runs b only if a fails. <code>$(cmd)</code> substitutes a command's output. <code>cmd &amp;</code> runs it in the background; <code>jobs</code>, <code>fg</code>, <code>bg</code> manage it.</p>
<h3>Globs, braces and quotes</h3>
<ul><li><code>*</code> any characters, <code>?</code> one character, <code>[abc]</code> or <code>[0-9]</code> one from a set, <code>[!x]</code> not x. Globs match file names; the shell expands them before the command runs.</li>
<li>Brace expansion makes strings whether or not files exist: <code>mkdir -p dir/{a,b,c}</code>, <code>echo {1..5}</code>.</li>
<li><b>Single quotes</b> are literal. <b>Double quotes</b> allow <code>$VAR</code> and <code>$(cmd)</code> but stop word splitting and globbing. A backslash escapes one character.</li></ul>
<h3>Variables and the environment</h3>
<ul><li><code>NAME=value</code> (no spaces) sets a shell variable. <code>export NAME</code> passes it to child processes. <code>env</code> or <code>printenv</code> shows the environment; <code>set</code> shows everything.</li>
<li>Important ones: <code>PATH</code>, <code>HOME</code>, <code>USER</code>, <code>SHELL</code>, <code>PS1</code> (the prompt), <code>EDITOR</code>, <code>LANG</code>.</li>
<li>Startup files: login shells read <code>/etc/profile</code> then <code>~/.bash_profile</code>; interactive non-login shells read <code>~/.bashrc</code>. System-wide additions go in <code>/etc/profile.d/*.sh</code>. Apply changes now with <code>source ~/.bashrc</code>.</li>
<li><code>alias ll='ls -l'</code> for shortcuts, <code>type cmd</code> or <code>which cmd</code> to see what will run, <code>history</code> and <code>!!</code> / <code>!42</code> to repeat.</li></ul>
<div class="viz" id="viz-redirlab"></div>
<div class="viz" id="viz-envlab"></div>`},
{id:"backup",num:"1.7",title:"Archiving, backups and virtualization",html:`
<h3>Archive and compress</h3>
<table><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>tar -czf a.tar.gz dir/</code></td><td>create (c), gzip (z), to file (f)</td></tr>
<tr><td><code>tar -cjf a.tar.bz2 dir/</code> / <code>-cJf a.tar.xz</code></td><td>bzip2 (j) or xz (J): smaller, slower</td></tr>
<tr><td><code>tar -tzf a.tar.gz</code></td><td>list (t)</td></tr><tr><td><code>tar -xzf a.tar.gz -C /restore</code></td><td>extract (x) into a directory</td></tr>
<tr><td><code>gzip f</code> / <code>gunzip f.gz</code> / <code>zcat</code></td><td>compress one file in place (bzip2, xz work the same)</td></tr>
<tr><td><code>zip -r a.zip dir</code> / <code>unzip</code></td><td>archive and compress for Windows users</td></tr>
<tr><td><code>cpio</code></td><td>older archiver, still used inside initramfs and RPMs</td></tr></table>
<p>Compression speed and ratio: gzip is fastest, xz is smallest. <code>tar</code> keeps permissions and ownership (use <code>-p</code> on extract, and run as root to restore owners).</p>
<h3>Copy and clone</h3>
<ul><li><code>rsync -av src/ dest/</code> copies only what changed, keeping permissions, times and links. A trailing slash on the source copies its <i>contents</i>. Add <code>--delete</code> to mirror deletions, <code>-z</code> to compress over the network, <code>user@host:/path</code> to go over SSH.</li>
<li><code>dd if=/dev/sda of=/backup/sda.img bs=4M status=progress</code> copies raw blocks: whole-disk images, writing ISOs to USB. One wrong <code>of=</code> destroys a disk.</li>
<li><code>scp</code> and <code>sftp</code> copy over SSH.</li></ul>
<h3>Backup strategy</h3>
<ul><li><b>Full</b> copies everything. <b>Incremental</b> copies changes since the last backup of any kind (fast backups, slow restores). <b>Differential</b> copies changes since the last full (bigger over time, two-step restore).</li>
<li><b>3-2-1</b>: three copies, on two kinds of media, one offsite. Snapshots (LVM, btrfs, VM) are quick rollback points but live on the same storage.</li>
<li>A backup you've never restored is a hope. Test restores.</li></ul>
<div class="viz" id="viz-bktype"></div>
<h3>Virtualization</h3>
<ul><li>A <b>hypervisor</b> runs virtual machines. <b>Type 1</b> (bare metal): KVM, VMware ESXi, Hyper-V. <b>Type 2</b> runs on a desktop OS: VirtualBox, VMware Workstation. KVM is a kernel module that turns Linux into a type 1 hypervisor; <b>QEMU</b> emulates the hardware and <b>libvirt</b> manages it all.</li>
<li><code>virsh list --all</code>, <code>virsh start|shutdown|destroy vm</code>, <code>virsh dumpxml vm</code>, <code>virt-install</code> to create one.</li>
<li>Disk images: <b>qcow2</b> (thin, supports snapshots) or <b>raw</b> (fastest). <code>qemu-img create -f qcow2 disk.qcow2 20G</code>, <code>qemu-img info</code>, <code>qemu-img convert</code>.</li>
<li>Networking: <b>NAT</b> (VMs share the host's address), <b>bridged</b> (VMs appear on the physical LAN), <b>isolated/host-only</b>.</li>
<li><b>cloud-init</b> configures a new cloud VM on first boot (hostname, users, SSH keys, packages) from user-data YAML.</li></ul>
<div class="viz" id="viz-backuplab"></div>`}
];

const G={
 boot:[["UEFI","Modern firmware that boots .efi files from the EFI System Partition; supports Secure Boot and GPT"],["BIOS","Legacy firmware that boots from the first 512-byte sector (MBR)"],["EFI System Partition","FAT32 partition mounted at /boot/efi holding bootloader .efi files"],["Secure Boot","UEFI checks the signature of the bootloader and kernel before running them"],["GRUB2","The Linux bootloader: shows the menu, loads kernel and initramfs, passes kernel arguments"],["/etc/default/grub","Where you edit GRUB settings, then regenerate grub.cfg"],["grub2-mkconfig -o /boot/grub2/grub.cfg","Regenerate the GRUB configuration (RHEL family); update-grub on Debian"],["grubby","RHEL tool to view and change kernel entries and arguments directly"],["initramfs","Temporary root filesystem loaded with the kernel, with drivers needed to mount the real root"],["dracut -f","Rebuild the initramfs (RHEL); update-initramfs -u on Debian"],["Kernel command line","Arguments GRUB passes to the kernel; see /proc/cmdline"],["rd.break","Kernel argument that stops boot inside the initramfs, for root password recovery"],["systemd.unit=rescue.target","Kernel argument to boot into rescue mode once"],["PID 1","systemd, the first process; starts everything else"],["multi-user.target","Text-mode, networked system (old runlevel 3)"],["graphical.target","multi-user plus a desktop login (old runlevel 5)"],["rescue.target","Single-user root shell with local filesystems (old runlevel 1)"],["emergency.target","Minimal root shell, root read-only; used when fstab or root is broken"],["systemctl set-default","Choose the target for future boots"],["systemctl isolate","Switch to a target now"]],
 fhs:[["/etc","System-wide configuration files"],["/var","Variable data: logs (/var/log), spools, caches, databases"],["/home","Users' home directories"],["/root","The root user's home directory"],["/boot","Kernel, initramfs and bootloader files"],["/usr","Installed programs and libraries (read-mostly)"],["/opt","Optional, self-contained third-party software"],["/tmp","Temporary files, often cleared at boot (sticky bit set)"],["/dev","Device files created by udev"],["/proc","Virtual filesystem showing kernel and process information"],["/sys","Virtual filesystem for devices, drivers and kernel settings"],["/srv","Data served by this system (web, FTP)"],["/mnt and /media","Temporary mounts and removable media"],["Block vs character device","Block devices move data in blocks (disks); character devices move a byte stream (terminals)"],["udev","Creates device nodes and stable names like /dev/disk/by-uuid when hardware appears"],["dmesg","Shows the kernel ring buffer: hardware detection and driver messages"],["lsmod","Lists loaded kernel modules"],["modprobe","Loads a module with its dependencies; -r removes it"],["modinfo","Shows details about a kernel module"],["/etc/modprobe.d/","Persistent module options and blacklists"],["/etc/modules-load.d/","Modules to load at every boot"],["sysctl","Reads or sets kernel parameters at runtime; persist in /etc/sysctl.d/"]],
 storage:[["MBR","Partition table limited to 2 TiB and 4 primary partitions"],["GPT","Modern partition table: huge disks, 128 partitions, backup header, needed for UEFI boot"],["fdisk","Interactive partitioning tool for MBR and GPT"],["parted","Scriptable partitioning tool"],["partprobe","Tell the kernel to reread a disk's partition table"],["xfs","RHEL default filesystem; can grow but not shrink"],["ext4","Common journaled filesystem; grow online, shrink offline"],["btrfs","Copy-on-write filesystem with snapshots and checksums"],["mkfs.xfs / mkfs.ext4","Create a filesystem"],["blkid","Show UUIDs, labels and filesystem types"],["lsblk -f","Tree of block devices with filesystems and mount points"],["/etc/fstab fields","device, mount point, type, options, dump, fsck order"],["UUID= in fstab","Stable reference that survives device renames"],["nofail","fstab option: don't drop to emergency mode if this mount fails"],["_netdev","fstab option: wait for the network (NFS, SMB)"],["mount -a","Mount everything in fstab that isn't mounted (tests your edits)"],["findmnt --verify","Check /etc/fstab for errors"],["umount: target is busy","A process is using the mount; find it with lsof or fuser -vm"],["fsck","Check and repair an unmounted ext filesystem (xfs_repair for xfs)"],["mkswap / swapon","Prepare and enable swap space"],["autofs","Mounts filesystems automatically on first access"]],
 lvm:[["Physical volume (PV)","Disk or partition initialized for LVM with pvcreate"],["Volume group (VG)","Pool of storage made from one or more PVs"],["Logical volume (LV)","Volume carved from a VG; holds a filesystem"],["/dev/mapper/vg-lv","Device-mapper path of a logical volume (also /dev/vg/lv)"],["vgextend","Add a PV to a volume group"],["lvextend -r","Grow an LV and its filesystem in one step"],["xfs_growfs","Grow a mounted xfs filesystem"],["resize2fs","Grow or shrink an ext2/3/4 filesystem"],["pvs, vgs, lvs","Short summaries of LVM objects"],["LVM snapshot","Point-in-time copy of an LV, useful before risky changes"],["-l 100%FREE","lvcreate option: use all free extents in the VG"],["RAID 0","Striping: fast, no redundancy, any disk failure loses everything"],["RAID 1","Mirroring: two or more copies, survives a disk failure"],["RAID 5","Striping with distributed parity; needs 3+ disks, survives one failure"],["RAID 6","Double parity; needs 4+ disks, survives two failures"],["RAID 10","Striped mirrors; needs 4+ disks, fast and redundant"],["mdadm","Tool to create and manage Linux software RAID"],["/proc/mdstat","Live RAID status and rebuild progress"],["mdadm --detail --scan","Output used to persist arrays in /etc/mdadm.conf"]],
 net:[["ip addr","Show and change IP addresses (replaces ifconfig)"],["ip route","Show and change routes (replaces route)"],["ip neigh","ARP/neighbor table"],["ss -tulpn","Listening TCP and UDP sockets with process names"],["nmcli","Command-line client for NetworkManager"],["nmcli con up","Activate a connection profile to apply changes"],["nmtui","Text UI for NetworkManager"],["Netplan","Ubuntu's YAML network configuration in /etc/netplan/"],["netplan try","Apply netplan config with automatic rollback if not confirmed"],["/etc/hosts","Static name-to-address mappings, usually checked before DNS"],["/etc/resolv.conf","DNS servers and search domains"],["/etc/nsswitch.conf","Order of name lookup sources (files dns)"],["getent hosts","Resolve a name the way applications do, through nsswitch"],["hostnamectl set-hostname","Set the static hostname"],["dig","Detailed DNS query tool"],["ethtool","Shows link speed, duplex and NIC settings"],["Runtime vs persistent","ip commands change the running system only; nmcli or netplan settings survive reboot"],["resolvectl status","Shows the real DNS servers when systemd-resolved is in use"]],
 shell:[["stdin, stdout, stderr","File descriptors 0, 1 and 2"],["> and >>","Redirect stdout, overwriting or appending"],["2>","Redirect stderr"],["&> or > file 2>&1","Send stdout and stderr to the same file"],["/dev/null","Discards anything written to it"],["Here document","<<EOF feeds inline lines to a command's stdin"],["tee","Writes stdin to a file and to stdout"],["sudo tee","How to write a root-owned file from a pipeline"],["&&","Run the next command only if the previous succeeded"],["||","Run the next command only if the previous failed"],["$(command)","Command substitution"],["Glob *","Matches any characters in file names"],["Brace expansion","{a,b} or {1..5} generates strings"],["Single vs double quotes","Single: fully literal. Double: variables expand, no word splitting"],["export","Make a variable part of the environment for child processes"],["PATH","Directories searched for commands"],["~/.bashrc","Read by interactive non-login bash shells"],["~/.bash_profile","Read by login shells"],["/etc/profile.d/","System-wide login scripts"],["source file","Run a file in the current shell"],["alias","Shortcut name for a command"]],
 backup:[["tar -czf","Create a gzip-compressed archive"],["tar -xzf ... -C dir","Extract an archive into a directory"],["tar -tzf","List an archive's contents"],["gzip vs bzip2 vs xz","Fastest vs middle vs smallest"],["rsync -av","Copy only changes, preserving metadata"],["Trailing slash in rsync","src/ copies the contents; src copies the directory itself"],["rsync --delete","Remove files from the destination that are gone from the source"],["dd","Block-level copy for disk images"],["Full backup","Copies everything"],["Incremental backup","Changes since the last backup of any type"],["Differential backup","Changes since the last full backup"],["3-2-1 rule","3 copies, 2 media types, 1 offsite"],["Type 1 hypervisor","Runs on bare metal (KVM, ESXi, Hyper-V)"],["Type 2 hypervisor","Runs on a host OS (VirtualBox)"],["KVM","Kernel-based hypervisor; QEMU emulates devices; libvirt manages"],["virsh","Command-line VM manager for libvirt"],["qcow2","Thin-provisioned QEMU disk format supporting snapshots"],["Bridged networking","VMs appear directly on the physical network"],["NAT networking","VMs share the host's address"],["cloud-init","Configures cloud instances on first boot from user-data"]]
};
const DECKS=[["boot","Boot and targets"],["fhs","FHS, devices, modules"],["storage","Partitions and filesystems"],["lvm","LVM and RAID"],["net","Network configuration"],["shell","Shell operations"],["backup","Backups and virtualization"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which firmware reads bootloader files from a FAT32 partition mounted at /boot/efi?",o:["UEFI","Legacy BIOS","GRUB","initramfs"],a:0,e:"UEFI uses the EFI System Partition."},
 {q:"A server must boot from a 4 TB disk using UEFI. Which partition table is required?",o:["GPT","MBR","Extended","LVM"],a:0,e:"MBR tops out at 2 TiB and UEFI boot expects GPT."},
 {q:"What does the initramfs provide?",o:["Drivers and tools needed to mount the real root filesystem","The GRUB menu and the kernel command-line options it passes","The final root filesystem","The systemd journal"],a:0,e:"It is a temporary root used early in boot."},
 {q:"You changed GRUB_TIMEOUT in /etc/default/grub on RHEL. What's next?",o:["grub2-mkconfig -o /boot/grub2/grub.cfg","Edit grub.cfg by hand","dracut -f","Nothing; it's read at boot"],a:0,e:"grub.cfg is generated from /etc/default/grub."},
 {q:"Which command adds a kernel argument to every installed kernel on RHEL?",o:["grubby --update-kernel=ALL --args=\"audit=1\"","sysctl -w audit=1","modprobe audit","echo audit=1 >> /proc/cmdline"],a:0,e:"grubby edits the boot entries directly."},
 {q:"After adding a storage driver needed to reach the root filesystem, what should you rebuild on RHEL?",o:["The initramfs with dracut -f","The GRUB menu only","The fstab","The RPM database"],a:0,e:"The driver must be inside the initramfs."},
 {q:"Which target is the equivalent of runlevel 3?",o:["multi-user.target","graphical.target","rescue.target","default.target"],a:0,e:"Text mode with networking."},
 {q:"How do you make a server boot to text mode from now on?",o:["systemctl set-default multi-user.target","systemctl isolate multi-user.target","init 3","systemctl enable multi-user.target"],a:0,e:"isolate switches now; set-default affects future boots."},
 {q:"A bad fstab line stops boot. Which target gives you a root shell with the root filesystem read-only and almost nothing started?",o:["emergency.target","rescue.target","multi-user.target","poweroff.target"],a:0,e:"rescue.target mounts local filesystems; emergency doesn't."},
 {q:"What is PID 1 on a modern Linux distribution?",o:["systemd","init.d","GRUB","kthreadd"],a:0,e:"systemd starts everything else."},
 {q:"Where do system-wide configuration files live?",o:["/etc","/var","/usr/share","/opt"],a:0,e:"/etc holds configuration."},
 {q:"Which directory holds log files?",o:["/var/log","/etc/log","/usr/log","/tmp/log"],a:0,e:"Variable data lives under /var."},
 {q:"A vendor ships a self-contained application. Where does the FHS suggest it goes?",o:["/opt","/usr/bin","/etc","/srv"],a:0,e:"Optional add-on software."},
 {q:"Which filesystem is virtual and shows process and kernel information?",o:["/proc","/boot","/srv","/media"],a:0,e:"It uses no disk space."},
 {q:"Which service creates /dev/disk/by-uuid links when a disk is attached?",o:["udev","cron","sshd","chronyd"],a:0,e:"udev handles device events."},
 {q:"Which command loads a module and the modules it depends on?",o:["modprobe","insmod","lsmod","depmod"],a:0,e:"insmod doesn't resolve dependencies."},
 {q:"How do you stop a module from ever loading automatically?",o:["Add 'blacklist name' to a file in /etc/modprobe.d/","rmmod it once and then run depmod -a to update the list","Delete it from lsmod","Add it to /etc/fstab"],a:0,e:"modprobe.d holds persistent module rules."},
 {q:"Which command shows the kernel ring buffer, including disk detection messages?",o:["dmesg","journalctl -u kernel","lsblk","lsmod"],a:0,e:"journalctl -k shows the same from the journal."},
 {q:"Which command shows BIOS version and system serial number?",o:["dmidecode","lscpu","lspci","uname -a"],a:0,e:"It reads the DMI/SMBIOS tables."},
 {q:"Which filesystem is the RHEL default and can't be shrunk?",o:["xfs","ext4","btrfs","vfat"],a:0,e:"xfs grows only."},
 {q:"You need to shrink a filesystem. Which type makes that possible (offline)?",o:["ext4","xfs","swap","tmpfs"],a:0,e:"resize2fs can shrink an unmounted ext4."},
 {q:"Why use UUID= in /etc/fstab instead of /dev/sdb1?",o:["Device names can change between boots","UUIDs mount faster","fstab doesn't accept /dev names","UUIDs encrypt the disk"],a:0,e:"Adding or removing disks can renumber sdX names."},
 {q:"Which command tests new /etc/fstab entries without rebooting?",o:["mount -a","fsck -A","systemctl reboot","lsblk"],a:0,e:"Also run findmnt --verify."},
 {q:"An NFS share in fstab hangs boot when the network is slow. Which option helps?",o:["_netdev","noexec","ro","defaults"],a:0,e:"It orders the mount after the network."},
 {q:"umount says 'target is busy'. Which command finds the process?",o:["fuser -vm /mnt/data","df -h /mnt/data","blkid","partprobe"],a:0,e:"lsof +D also works."},
 {q:"Which tool should repair an unmounted xfs filesystem?",o:["xfs_repair","e2fsck","xfs_growfs","resize2fs"],a:0,e:"fsck.xfs does nothing."},
 {q:"What does the sixth field in an fstab line control?",o:["fsck order at boot","Mount options","Dump frequency","Filesystem type"],a:0,e:"1 for root, 2 for others, 0 to skip."},
 {q:"Which command makes the kernel reread a disk's partition table?",o:["partprobe","mkfs","mount -a","udevadm trigger only"],a:0,e:"Needed after partitioning a disk in use."},
 {q:"In LVM, what do you create directly on a disk or partition?",o:["A physical volume","A logical volume","A volume group","A mapper device"],a:0,e:"pvcreate first."},
 {q:"The volume group is full and the LV needs 20 GB more. What do you do first?",o:["pvcreate a new disk and vgextend the VG","lvextend -L +20G immediately","resize2fs","mkfs the new disk"],a:0,e:"The VG needs free extents."},
 {q:"You ran lvextend -L +10G but df shows the old size. Why?",o:["The filesystem wasn't grown","The VG is full","df caches sizes","You must reboot"],a:0,e:"Use -r or xfs_growfs/resize2fs."},
 {q:"Which command grows a mounted xfs filesystem?",o:["xfs_growfs /srv/data","resize2fs /dev/vg/lv","xfs_repair -g","lvresize --fs"],a:0,e:"xfs_growfs takes the mount point."},
 {q:"Which device path refers to LV 'web' in VG 'data'?",o:["/dev/data/web or /dev/mapper/data-web","/dev/web/data or /dev/mapper/web-data","/dev/lvm/web","/dev/sdweb"],a:0,e:"Both names point to the same device."},
 {q:"Which RAID level offers no redundancy?",o:["RAID 0","RAID 1","RAID 5","RAID 10"],a:0,e:"Striping only."},
 {q:"Which RAID level needs at least three disks and survives one disk failure using parity?",o:["RAID 5","RAID 1","RAID 0","RAID 6"],a:0,e:"RAID 6 needs four and survives two."},
 {q:"Where do you watch a software RAID rebuild?",o:["/proc/mdstat","/etc/mdadm.conf","/var/log/raid","/sys/raid"],a:0,e:"Or mdadm --detail."},
 {q:"Why isn't RAID a backup?",o:["It doesn't protect against deletion, corruption or site loss","It's too slow to restore large files, so recovery takes longer","It requires LVM","It only works with xfs"],a:0,e:"It protects against disk failure only."},
 {q:"Which command shows IP addresses on a modern system?",o:["ip addr","route -n","arp -a","netstat -i only"],a:0,e:"iproute2 replaced ifconfig."},
 {q:"You add an address with ip addr add and it disappears after reboot. Why?",o:["ip changes are runtime only","The DHCP server removed it","SELinux blocked it","The NIC failed"],a:0,e:"Persist it with nmcli, netplan or networkd files."},
 {q:"After nmcli con mod, the address hasn't changed. What applies it?",o:["nmcli con up <profile>","systemctl restart network-manager.conf","ifconfig apply","nothing; it applies immediately"],a:0,e:"Reactivating the profile applies the modification."},
 {q:"Which Ubuntu command applies a netplan change and rolls back if you don't confirm?",o:["netplan try","netplan apply","netplan generate","nmcli reload"],a:0,e:"Safe for remote changes."},
 {q:"Which file decides whether /etc/hosts is checked before DNS?",o:["/etc/nsswitch.conf","/etc/resolv.conf","/etc/host.conf only","/etc/hostname"],a:0,e:"hosts: files dns."},
 {q:"dig resolves a name but the application can't. What should you test next?",o:["getent hosts name","ping 8.8.8.8 only","ss -t","ethtool"],a:0,e:"getent follows nsswitch like applications; dig asks DNS only."},
 {q:"Which command lists listening TCP and UDP ports with process names?",o:["ss -tulpn","ip route","ethtool -S","dig"],a:0,e:"netstat -tulpn is the legacy equivalent."},
 {q:"Which redirects both stdout and stderr to out.log?",o:["cmd > out.log 2>&1","cmd 2>&1 > out.log","cmd 2> out.log","cmd | out.log"],a:0,e:"Order matters."},
 {q:"Why does 'sudo echo x > /etc/motd' fail with permission denied?",o:["The redirection is done by your unprivileged shell","sudo can't run shell built-ins like echo at all","/etc/motd is immutable","echo needs -e"],a:0,e:"Use echo x | sudo tee /etc/motd."},
 {q:"What does 'make && make install' do if make fails?",o:["Skips make install","Runs make install anyway","Runs make install in the background","Retries make"],a:0,e:"&& requires success."},
 {q:"Which prints the literal text $HOME?",o:["echo '$HOME'","echo \"$HOME\"","echo $HOME","echo `$HOME`"],a:0,e:"Single quotes prevent expansion."},
 {q:"What does 'mkdir -p proj/{src,docs,tests}' create?",o:["Three directories under proj","One directory named {src,docs,tests}","Nothing without -r","Only proj"],a:0,e:"Brace expansion."},
 {q:"A variable set with NAME=1 isn't visible in a script you run. Why?",o:["It wasn't exported","Scripts can't read variables","Names must be lowercase","It needs quotes"],a:0,e:"export passes it to children."},
 {q:"Which file is read by interactive non-login bash shells?",o:["~/.bashrc","~/.bash_profile","/etc/profile","~/.profile"],a:0,e:"Login shells read profile files."},
 {q:"Which tar command extracts a bzip2 archive into /restore?",o:["tar -xjf a.tar.bz2 -C /restore","tar -czf a.tar.bz2 /restore","tar -tjf a.tar.bz2","tar -xzf a.tar.bz2 /restore"],a:0,e:"x extract, j bzip2, C target directory."},
 {q:"Which compression gives the smallest files but is slowest?",o:["xz","gzip","zip","none"],a:0,e:"gzip is fastest."},
 {q:"What does 'rsync -av /data/ /backup/data/' do on its second run?",o:["Copies only files that changed","Copies everything again","Deletes the backup","Compresses the files"],a:0,e:"rsync transfers differences."},
 {q:"Which backup type copies everything changed since the last full backup?",o:["Differential","Incremental","Full","Snapshot"],a:0,e:"Incremental counts from the last backup of any type."},
 {q:"KVM, ESXi and Hyper-V are which kind of hypervisor?",o:["Type 1 (bare metal)","Type 2 (hosted)","Containers","Emulators only"],a:0,e:"VirtualBox is type 2."},
 {q:"Which disk image format is thin-provisioned and supports snapshots?",o:["qcow2","raw","iso","img only"],a:0,e:"QEMU copy-on-write v2."},
 {q:"Which command lists all libvirt VMs, including stopped ones?",o:["virsh list --all","virsh show","qemu-img list","kvm -l"],a:0,e:"Plain virsh list shows running VMs only."},
 {q:"What sets the hostname, users and SSH keys of a new cloud VM on its first boot?",o:["cloud-init","Ansible Galaxy","dracut","firewalld"],a:0,e:"It reads user-data."}
];

registerModule({
  id:"sys",slug:"system",title:"System Management",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,labs:LABS,
  vizKeys:["bootflow","targets","bootlab","fhs","kmod","fstab","partlab","lvmstack","raid","resolve","netlab","redir","redirlab","envlab","bktype","backuplab"],
  viz(){
stepViz($("#viz-bootflow"),{title:"From power button to login prompt",done:"Walked through the boot process",steps:[
  ["Firmware","UEFI (or BIOS) runs the power-on self-test, finds the boot disk and reads the EFI System Partition. With Secure Boot, the signed shim and GRUB are verified."],
  ["GRUB2","Shows the menu, reads grub.cfg, loads /boot/vmlinuz-* and the matching initramfs, and passes the kernel command line (root=, rd.lvm.lv=, quiet). Press e here to edit an entry for one boot."],
  ["Kernel","Decompresses, initializes CPUs, memory and built-in drivers, and starts the initramfs as a temporary root."],
  ["initramfs","Loads storage, LVM, RAID and LUKS modules, finds the real root filesystem, mounts it and switches to it. A missing driver here gives a dracut emergency shell."],
  ["systemd","PID 1 reads its units, mounts /etc/fstab entries, and starts services in parallel toward the default target."],
  ["Target reached","multi-user.target gives a text login on the console and SSH. graphical.target adds a display manager."]],
  end:"When a system won't boot, ask which of these stages failed: no GRUB menu, kernel panic, dracut shell, or emergency mode each point to a different fix."});
sortViz($("#viz-targets"),{title:"Which target do you need?",bins:{multi:"multi-user.target",graph:"graphical.target",rescue:"rescue.target",emerg:"emergency.target"},
  items:[["A headless web server in production","multi","Text mode with networking."],["A developer workstation with a desktop login","graph","Adds a display manager."],["Reset a forgotten root password with local filesystems mounted","rescue","Single-user maintenance."],["A typo in /etc/fstab stops local filesystems from mounting","emerg","Minimal shell with root read-only."],["Old runlevel 3","multi","Runlevel 3 equals multi-user."],["Old runlevel 5","graph","Runlevel 5 equals graphical."]],done:"Matched every situation to a target"});
shellViz($("#viz-bootlab"),LABS.boot,"bootlab");
revealViz($("#viz-fhs"),{title:"Explore the Filesystem Hierarchy Standard",cols:4,done:"Explored the FHS",items:[
  ["/etc","config","System-wide configuration: passwd, fstab, ssh/sshd_config, systemd overrides. Back this up."],["/var","variable","Logs (/var/log), mail and print spools, caches, databases (/var/lib). Grows over time; a full /var is a classic outage."],["/home","users","Each user's files and dotfiles."],["/root","admin","root's home, kept on the root filesystem so it's there even if /home doesn't mount."],
  ["/boot","boot","Kernels, initramfs images, GRUB files. /boot/efi is the EFI System Partition."],["/usr","programs","Binaries (/usr/bin, /usr/sbin), libraries and docs. On modern distros /bin and /sbin are links into /usr."],["/opt","add-ons","Self-contained third-party software, each in its own directory."],["/srv","served","Data this server provides, such as web or FTP content."],
  ["/tmp","temp","World-writable with the sticky bit, often a tmpfs cleared at boot. /var/tmp survives reboots."],["/dev","devices","Device nodes made by udev: sda, nvme0n1, null, tty, random."],["/proc","kernel","Live kernel and process data: cpuinfo, meminfo, PID directories."],["/sys","devices","Device and driver tree, and many tunables."]]});
shellViz($("#viz-kmod"),LABS.kmod,"kmod");
quizViz($("#viz-fstab"),{title:"Spot the fstab problem",done:"Diagnosed every fstab line",qs:[
  ["<code>/dev/sdc1  /data  xfs  defaults  0 0</code> works today, but after a new disk is added the server mounts the wrong disk.",["It should use UUID= or LABEL=","xfs needs fsck order 2","defaults is invalid","The mount point needs a trailing slash"],0,"sdX names follow detection order."],
  ["<code>UUID=1a2b...  /backup  ext4  defaults  0 2</code> is for a USB disk that's often unplugged, and boot then stops in emergency mode.",["Add nofail","Change ext4 to xfs","Set the last field to 1","Remove defaults"],0,"nofail lets boot continue without it."],
  ["<code>nas:/exports/home  /home  nfs  defaults  0 0</code> times out during boot.",["Add _netdev so it waits for the network","Change nfs to ext4","Use fsck order 1","Add noexec"],0,"Network mounts need the network up."],
  ["<code>UUID=9f...  /srv/web  xfs</code>",["It's missing the options, dump and fsck fields","xfs can't be in fstab","UUIDs need quotes","/srv can't be a mount point"],0,"Six fields; findmnt --verify would flag it."],
  ["You edited fstab and want to be sure it's right before rebooting a remote server.",["Run mount -a and findmnt --verify","Reboot and see","Run fsck -A","Run partprobe"],0,"Test while you still have a shell."]]});
shellViz($("#viz-partlab"),LABS.part,"partlab");
stepViz($("#viz-lvmstack"),{title:"Build an LVM stack",done:"Built the LVM stack",steps:[
  ["Disks","Two new disks appear: /dev/sdb (10 GB) and /dev/sdc (10 GB). lsblk shows them with no partitions."],
  ["Physical volumes","pvcreate /dev/sdb /dev/sdc writes an LVM label on each. pvs now lists them with no VG."],
  ["Volume group","vgcreate vgdata /dev/sdb /dev/sdc pools them: one 20 GB VG divided into 4 MiB extents."],
  ["Logical volume","lvcreate -n lvweb -L 12G vgdata. The LV spans both disks if it needs to, and appears at /dev/vgdata/lvweb."],
  ["Filesystem and mount","mkfs.xfs /dev/vgdata/lvweb, an fstab line, mount -a. Applications only see a 12 GB filesystem."],
  ["Grow","Months later: lvextend -r -L +6G /dev/vgdata/lvweb grows the LV and the xfs filesystem online, without downtime."]],
  end:"Disks → PVs → VG → LVs → filesystems. Each layer can change without rebuilding the ones above it."});
sortViz($("#viz-raid"),{title:"Pick the RAID level",bins:{r0:"RAID 0",r1:"RAID 1",r5:"RAID 5",r6:"RAID 6",r10:"RAID 10"},
  items:[["Scratch space for video rendering where speed is all that matters","r0","Striping, no redundancy."],["Two disks for the OS that must survive one failure","r1","Mirror."],["Three disks, maximize usable space, survive one failure","r5","One disk's worth of parity."],["Eight large disks; must survive two failures during a long rebuild","r6","Double parity."],["Busy database, four disks, needs speed and redundancy","r10","Striped mirrors."],["Usable capacity is half the raw capacity","r1","Also true of RAID 10."],["Write performance suffers from parity calculations","r5","RAID 6 even more."]],done:"Chose a RAID level for every case"});
seqViz($("#viz-resolve"),{title:"How a name lookup works",left:"Application",right:"Resolver sources",intro:"An application asks for the address of db01.example.lan. Press Next step.",steps:[
  {dir:"r",label:"getaddrinfo(\"db01\")",sub:"glibc reads /etc/nsswitch.conf",text:"The C library checks the hosts: line in nsswitch.conf, for example 'files dns'."},
  {dir:"r",label:"files: /etc/hosts",sub:"no match",text:"First /etc/hosts. A stale entry here overrides DNS, which is a common surprise."},
  {dir:"r",label:"dns: nameserver 10.0.0.53",sub:"from /etc/resolv.conf",text:"Then DNS, using the search domain example.lan and the nameservers in resolv.conf."},
  {dir:"l",label:"A 10.0.0.40",sub:"answer",text:"The server answers. dig would show the same, but dig skips /etc/hosts, so test like applications do with getent hosts."}]});
shellViz($("#viz-netlab"),LABS.net,"netlab");
quizViz($("#viz-redir"),{title:"Predict the redirection",done:"Predicted every redirection",qs:[
  ["<code>find / -name core 2>/dev/null</code>",["Shows results, hides permission errors","Hides results, shows errors","Writes results to /dev/null","Deletes core files"],0,"2 is stderr."],
  ["<code>backup.sh > log.txt 2>&1</code>",["Both stdout and stderr go to log.txt","Only errors go to log.txt","Errors go to the screen","log.txt is appended"],0,"2 is copied after 1 moves."],
  ["<code>date >> log.txt</code>",["Appends the date","Overwrites log.txt","Reads log.txt","Fails if log.txt exists"],0,">> appends."],
  ["<code>ps aux | grep nginx | wc -l</code>",["Counts lines mentioning nginx","Kills nginx","Writes to a file named wc","Shows nginx's PID only"],0,"Each stdout feeds the next stdin."],
  ["<code>cat &lt;&lt;EOF > /tmp/note</code> followed by two lines and EOF",["Writes those two lines to /tmp/note","Appends EOF to the file","Reads /tmp/note","Is a syntax error"],0,"A here document."],
  ["<code>ping -c1 gw || echo DOWN</code>",["Prints DOWN only if the ping fails","Always prints DOWN","Never prints DOWN","Runs both in parallel"],0,"|| runs on failure."]]});
shellViz($("#viz-redirlab"),LABS.redir,"redirlab");
shellViz($("#viz-envlab"),LABS.env,"envlab");
sortViz($("#viz-bktype"),{title:"Full, incremental or differential?",bins:{full:"Full",inc:"Incremental",diff:"Differential"},
  items:[["Copies every file every time","full","Simplest restore, biggest backups."],["Sunday full, then each day only what changed since yesterday","inc","Smallest daily backups."],["Sunday full, then each day everything changed since Sunday","diff","Grows through the week."],["Restore needs the full plus every backup since","inc","Long chain."],["Restore needs the full plus the latest one","diff","Two pieces."],["Needed as the base for the other two","full","Everything starts with a full."]],done:"Classified every backup scheme"});
shellViz($("#viz-backuplab"),LABS.backup,"backuplab");
  },
  sims:[
    {id:"newvol",type:"shell",title:"Add a persistent data volume with LVM",lab:{world:{disks:[["sdb",10]]},panel:LX.panelStorage,
      scenario:"The web team needs 4 GB of storage at /srv/web that survives reboots. A new 10 GB disk is attached as /dev/sdb. Use LVM so it can grow later.",
      tasks:[{t:"Make /dev/sdb an LVM physical volume",hint:"sudo pvcreate /dev/sdb",check:w=>!!w.lvm.pv["/dev/sdb"]},
        {t:"Create volume group vgdata from it",hint:"sudo vgcreate vgdata /dev/sdb",check:w=>w.lvm.pv["/dev/sdb"]&&w.lvm.pv["/dev/sdb"].vg==="vgdata"},
        {t:"Create a 4 GB logical volume named lvweb",hint:"sudo lvcreate -n lvweb -L 4G vgdata",check:w=>w.lvm.lv["vgdata/lvweb"]&&Math.abs(w.lvm.lv["vgdata/lvweb"].size-4)<0.05},
        {t:"Put an xfs filesystem on it",hint:"sudo mkfs.xfs /dev/vgdata/lvweb",check:w=>(w.fs["/dev/mapper/vgdata-lvweb"]||{}).type==="xfs"},
        {t:"Add it to /etc/fstab so it mounts on /srv/web at boot",hint:"sudo mkdir -p /srv/web\necho '/dev/vgdata/lvweb /srv/web xfs defaults 0 0' | sudo tee -a /etc/fstab",check:w=>/^\s*(\/dev\/vgdata\/lvweb|\/dev\/mapper\/vgdata-lvweb|UUID=\S+)\s+\/srv\/web\/?\s+xfs\s+\S+/m.test(fstab(w))},
        {t:"Mount it from fstab and confirm",hint:"sudo systemctl daemon-reload\nsudo mount -a\ndf -h /srv/web",check:w=>{const m=mnt(w,"/srv/web");return !!m&&/vgdata-lvweb/.test(m.src)}}],
      solution:"sudo pvcreate /dev/sdb\nsudo vgcreate vgdata /dev/sdb\nsudo lvcreate -n lvweb -L 4G vgdata\nsudo mkfs.xfs /dev/vgdata/lvweb\nsudo mkdir -p /srv/web\necho '/dev/vgdata/lvweb /srv/web xfs defaults 0 0' | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload\nsudo mount -a\ndf -h /srv/web",
      success:"Disk, PV, VG, LV, filesystem, fstab, mount -a. Testing with mount -a means no surprises at the next reboot."}},
    {id:"growvol",type:"shell",title:"The /data volume is full",lab:{world:{disks:[["sdb",4],["sdc",10]]},panel:LX.panelStorage,
      setup:w=>{R(w,"pvcreate /dev/sdb","vgcreate vgapp /dev/sdb","lvcreate -n data -L 3G vgapp","mkfs.xfs /dev/vgapp/data","mkdir -p /data","mount /dev/vgapp/data /data");const f=w.fs["/dev/mapper/vgapp-data"];if(f)f.used=f.size*0.97;w.appAlert=true},
      scenario:"Monitoring says /data is 97% full and the application will stop soon. The volume group vgapp has almost no free space, but a new 10 GB disk /dev/sdc was just attached. Grow /data to 10 GB without unmounting it.",
      tasks:[{t:"Confirm the problem: check /data usage and the VG's free space",hint:"df -h /data\nsudo vgs",check:(w,sh)=>LX.ran(sh,/df/)&&LX.ran(sh,/vgs|vgdisplay/),sticky:true},
        {t:"Add /dev/sdc to the volume group vgapp",hint:"sudo pvcreate /dev/sdc\nsudo vgextend vgapp /dev/sdc",check:w=>w.lvm.pv["/dev/sdc"]&&w.lvm.pv["/dev/sdc"].vg==="vgapp"},
        {t:"Extend the LV to 10 GB",hint:"sudo lvextend -L 10G /dev/vgapp/data",check:w=>w.lvm.lv["vgapp/data"].size>=9.95},
        {t:"Grow the xfs filesystem so df shows about 10 GB",hint:"sudo xfs_growfs /data\n(or use lvextend -r in the previous step)",check:w=>(w.fs["/dev/mapper/vgapp-data"]||{}).size>=9.95}],
      solution:"df -h /data\nsudo vgs\nsudo pvcreate /dev/sdc\nsudo vgextend vgapp /dev/sdc\nsudo lvextend -r -L 10G /dev/vgapp/data\ndf -h /data",
      success:"The application never stopped. LVM plus an online-growable filesystem turns a capacity emergency into four commands."}},
    {id:"staticip",type:"shell",title:"Give the server a static address",lab:{
      scenario:"This new server got 10.0.0.15 from DHCP. Before it goes into production it needs the reserved address 10.0.0.50/24, gateway 10.0.0.1, DNS server 10.0.0.53 and the hostname web01.example.lan. All of it must survive a reboot.",
      setup:w=>{const p=w.nm&&w.nm.eth0;if(p){p.method="auto"}},
      tasks:[{t:"Find the NetworkManager connection profile for eth0",hint:"nmcli con show",check:(w,sh)=>LX.ran(sh,/nmcli\s+(c|con|connection)(\s+show)?\s*$/),sticky:true},
        {t:"Set the address 10.0.0.50/24, gateway 10.0.0.1 and DNS 10.0.0.53, with method manual",hint:"sudo nmcli con mod eth0 ipv4.method manual ipv4.addresses 10.0.0.50/24 ipv4.gateway 10.0.0.1 ipv4.dns 10.0.0.53",check:w=>{const p=w.nm.eth0;return p.method==="manual"&&p.addr==="10.0.0.50/24"&&p.gw==="10.0.0.1"&&/10\.0\.0\.53/.test(p.dns||"")}},
        {t:"Apply the profile so eth0 is using the new address",hint:"sudo nmcli con up eth0",check:w=>w.net.ifs.eth0.ip==="10.0.0.50"},
        {t:"Set the static hostname web01.example.lan",hint:"sudo hostnamectl set-hostname web01.example.lan",check:w=>/^web01\.example\.lan\s*$/.test(LX.read(w,"/etc/hostname")||"")},
        {t:"Verify with ip and a ping to the gateway",hint:"ip -br a\nping -c 2 10.0.0.1",check:(w,sh)=>LX.ran(sh,/ping.*10\.0\.0\.1/),sticky:true}],
      solution:"nmcli con show\nsudo nmcli con mod eth0 ipv4.method manual ipv4.addresses 10.0.0.50/24 ipv4.gateway 10.0.0.1 ipv4.dns 10.0.0.53\nsudo nmcli con up eth0\nsudo hostnamectl set-hostname web01.example.lan\nip -br a\nping -c 2 10.0.0.1",
      success:"The profile holds the settings, nmcli con up applied them, and hostnamectl wrote /etc/hostname. A reboot changes nothing."}},
    {id:"bootorder",type:"order",title:"Put the boot sequence in order",scenario:"Tap the stages in the order they happen on a UEFI system.",
      steps:["UEFI firmware runs POST and reads the EFI System Partition","GRUB2 loads the kernel and initramfs","The kernel initializes hardware","The initramfs mounts the real root filesystem","systemd starts as PID 1","systemd reaches the default target"],success:"Firmware, bootloader, kernel, initramfs, systemd, target."},
    {id:"fhsmatch",type:"match",title:"Where does it go?",scenario:"Tap a directory, then the row describing what belongs there.",
      items:[["/etc","conf"],["/var/log","logs"],["/opt","vendor"],["/boot","kern"],["/proc","live"],["/srv","serve"],["/home","users"],["/dev","devs"]],
      slots:[["conf","sshd_config and fstab"],["logs","messages, secure, audit"],["vendor","A self-contained third-party app"],["kern","vmlinuz and initramfs"],["live","cpuinfo and meminfo, generated by the kernel"],["serve","Website content this server publishes"],["users","Personal files for each account"],["devs","sda, null and tty device nodes"]],success:"The FHS is the map you use on every Linux box."},
    {id:"storagecall",type:"choice",title:"Plan storage for a new database server",scenario:"A database server arrives with four identical 2 TB disks. The DBA wants speed, survival of a disk failure, and room to grow volumes later.",
      steps:[["Which RAID level fits best?",["RAID 10","RAID 0","RAID 5 with a hot spare","No RAID"],0,"Striped mirrors: fast writes and redundancy. RAID 5's parity writes hurt databases."],
        ["Which partition table for the 4 TB array?",["GPT","MBR","None, use the raw device only","Extended"],0,"MBR stops at 2 TiB."],
        ["How should the space be presented to the DBA?",["LVM on top of the array, with LVs for data and logs","One giant partition","A partition per database","Four separate filesystems"],0,"LVM lets you grow and snapshot later."],
        ["Which filesystem for the data LV on RHEL?",["xfs","vfat","tmpfs","swap"],0,"The RHEL default, strong for large files."],
        ["How should /etc/fstab refer to it?",["/dev/vgdb/lvdata or its UUID","/dev/sdb1","/dev/md0p1 by position","By mount order"],0,"Stable names only."],
        ["What protects against an accidental DROP TABLE?",["Tested backups kept off the array","RAID 10","LVM","xfs journaling"],0,"RAID isn't a backup."]],success:"RAID for availability, LVM for flexibility, a stable fstab, and real backups."}
  ],
  badges:[
    ["reader","SYS","Sysadmin Scholar","Mark all 7 system management lessons studied",c=>c.allStudied()],
    ["lab","DIA","Diagram Driver","Complete all 16 diagrams and exercises in this module",c=>c.vizAll()],
    ["lvm","LV","Volume Manager","Pass the new data volume lab",c=>c.passed("newvol")],
    ["grow","+G","Room to Grow","Grow the full /data volume without downtime",c=>c.passed("growvol")],
    ["net","IP","Static Assignment","Pass the static address lab",c=>c.passed("staticip")],
    ["boot","GRB","Bootloader","Order the boot sequence and finish the boot exercise",c=>c.passed("bootorder")&&c.earned("viz:bootlab")],
    ["pipe","|","Pipe Dream","Finish both shell operations exercises",c=>c.earned("viz:redirlab")&&c.earned("viz:envlab")],
    ["perfect","100","Kernel Mode","Score 100% on a system management quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
