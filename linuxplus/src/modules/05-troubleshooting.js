/* ================= Module 5: Troubleshooting (XK0-006 Domain 5.0, 22%) ================= */
(function(){
const R=(w,...cmds)=>{const s=LX.session(w,"root");cmds.forEach(c=>LX.exec(s,c))};
const node=(w,p)=>LX.lookup(w,p);
const rd=(w,p)=>LX.read(w,p)||"";
const rootUse=w=>{const m=w.mounts.find(z=>z.tgt==="/");const u=LX.fsUsed(w,m);return u.used/u.size*100};
const resolves=(w,h)=>{const s=LX.session(w,"admin");return LX.exec(s,"getent hosts "+h).code===0};
const pingOk=(w,ip)=>{const s=LX.session(w,"admin");return LX.exec(s,"ping -c1 -W1 "+ip).code===0};
const badFstab=(w,line)=>{LX.mkdirp(w,"/data");LX.put(w,"/etc/fstab",rd(w,"/etc/fstab")+line+"\n",{});w.boot.emergency=true};
const EMERG="[FAILED] Failed to mount data.mount - /data.\n[DEPEND] Dependency failed for Local File Systems.\nYou are in emergency mode. After logging in, type \"journalctl -xb\" to view\nsystem logs, \"systemctl reboot\" to reboot, or \"exit\" to continue bootup.\nGive root password for maintenance\n(or press Control-D to continue): (logged in as root)";
const fullDisk=w=>{R(w,"systemctl start httpd");const pid=w.units.httpd.pid;const n=LX.put(w,"/var/log/httpd/access_log.1","",{});n.sz=Math.round(26.4*1073741824);n.held=pid;LX.jlog(w,"kernel",4,"XFS (dm-0): Filesystem has run out of space");LX.jlog(w,"rsyslog",3,"action 'action-0-builtin:omfile' suspended: write error, No space left on device")};
const LABS={
 boot:{title:"Shell exercise: rescue a server stuck in emergency mode",user:"root",banner:EMERG,
   setup:w=>{badFstab(w,"UUID=9f1c2e00-dead-beef-0000-000000000000 /data xfs defaults 0 0");LX.jlog(w,"systemd",3,"dev-disk-by\\x2duuid-9f1c2e00\\x2ddead\\x2dbeef\\x2d0000\\x2d000000000000.device: Job dev-disk-by\\x2duuid-9f1c2e00.device/start timed out.");LX.jlog(w,"systemd",3,"Timed out waiting for device /dev/disk/by-uuid/9f1c2e00-dead-beef-0000-000000000000.");LX.jlog(w,"systemd",3,"Dependency failed for data.mount - /data.")},
   scenario:"A colleague added a line to /etc/fstab for a disk that was later removed. The server booted into emergency mode. Find the bad entry, fix fstab so the server boots normally, and reboot.",
   tasks:[{t:"Read the boot log to find what failed",hint:"journalctl -xb\n(or journalctl -b -p err)",check:(w,sh)=>LX.ran(sh,/journalctl\s+.*-(x?b|p)/),sticky:true},
     {t:"Check fstab for errors",hint:"findmnt --verify\n(or cat /etc/fstab and blkid)",check:(w,sh)=>LX.ran(sh,/findmnt\s+--verify|cat\s+\/etc\/fstab|blkid|lsblk/),sticky:true},
     {t:"Fix /etc/fstab: comment out or remove the /data line (or add nofail)",hint:"vim /etc/fstab\n(or sed -i '/\\/data/s/^/#/' /etc/fstab)",check:w=>!/^\s*UUID=9f1c2e00\S*\s+\/data\s+xfs\s+(?![^\n]*nofail)/m.test(rd(w,"/etc/fstab"))},
     {t:"Confirm with mount -a, then reboot",hint:"systemctl daemon-reload\nmount -a\nsystemctl reboot",check:(w,sh)=>LX.ran(sh,/reboot/)&&!w.boot.emergency,sticky:true}],
   solution:"journalctl -xb | tail\nfindmnt --verify\nsed -i '/\\/data/s/^/#/' /etc/fstab\nsystemctl daemon-reload\nmount -a\nsystemctl reboot"},
 disk:{title:"Shell exercise: the disk is full",world:{pkgs:["httpd"]},setup:fullDisk,
   scenario:"Monitoring says / is 96% full. Someone already deleted a huge log, but the space didn't come back. Find out why and free it without rebooting.",
   tasks:[{t:"Check filesystem usage",hint:"df -h",check:(w,sh)=>LX.ran(sh,/^(sudo\s+)?df\b/),sticky:true},
     {t:"Look for the biggest directories under /var",hint:"sudo du -sh /var/* | sort -h",check:(w,sh)=>LX.ran(sh,/du\s+-\w*s/),sticky:true},
     {t:"Remove the rotated access log",hint:"sudo rm /var/log/httpd/access_log.1",check:w=>!node(w,"/var/log/httpd/access_log.1")},
     {t:"Find the deleted file that's still open",hint:"sudo lsof +L1\n(or sudo lsof | grep deleted)",check:(w,sh)=>LX.ran(sh,/lsof\s+.*(\+L1|deleted)/),sticky:true},
     {t:"Restart the process holding it so / drops below 50%",hint:"sudo systemctl restart httpd\ndf -h /",check:w=>rootUse(w)<50}],
   solution:"df -h\nsudo du -sh /var/* | sort -h\nsudo du -sh /var/log/* | sort -h | tail -3\nsudo rm /var/log/httpd/access_log.1\ndf -h /\nsudo lsof +L1\nsudo systemctl restart httpd\ndf -h /"},
 net:{title:"Shell exercise: \"the internet is down\"",
   setup:w=>{R(w,"nmcli con mod eth0 ipv4.dns 10.0.0.99","nmcli con up eth0")},
   scenario:"Users on this server say nothing on the internet works. Work up the layers: link, IP, gateway, DNS. Fix what's broken through NetworkManager.",
   tasks:[{t:"Check the interface and address",hint:"ip -br addr\nip link",check:(w,sh)=>LX.ran(sh,/ip\s+(-br\s+)?(a|addr|link)|nmcli\s+(dev|con)/),sticky:true},
     {t:"Ping the default gateway",hint:"ip route\nping -c2 10.0.0.1",check:(w,sh)=>LX.ran(sh,/ping\s+.*10\.0\.0\.1\b/),sticky:true},
     {t:"Ping an internet IP to prove routing works (8.8.8.8)",hint:"ping -c2 8.8.8.8",check:(w,sh)=>LX.ran(sh,/ping\s+.*8\.8\.8\.8/),sticky:true},
     {t:"Find the DNS problem",hint:"cat /etc/resolv.conf\ndig www.example.com\ndig @10.0.0.53 www.example.com",check:(w,sh)=>LX.ran(sh,/resolv\.conf|dig|nslookup|host\s|resolvectl/),sticky:true},
     {t:"Fix the DNS server to 10.0.0.53 with nmcli and reactivate",hint:"sudo nmcli con mod eth0 ipv4.dns 10.0.0.53\nsudo nmcli con up eth0",check:w=>resolves(w,"www.example.com")}],
   solution:"ip -br addr\nip route\nping -c2 10.0.0.1\nping -c2 8.8.8.8\nping -c2 www.example.com\ncat /etc/resolv.conf\ndig @10.0.0.53 www.example.com +short\nsudo nmcli con mod eth0 ipv4.dns 10.0.0.53\nsudo nmcli con up eth0\nping -c2 www.example.com"},
 perf:{title:"Shell exercise: why is the server slow?",
   setup:w=>{w.procs.push({pid:5150,ppid:1,u:"etl",cmd:"/opt/etl/bin/loader --batch=all",cpu:12.4,mem:71.5,ni:0,st:"S",t:"02:41",unit:null},{pid:5151,ppid:1802,u:"admin",cmd:"gzip -9 /srv/archive/huge.tar",cpu:98.7,mem:0.2,ni:0,st:"R",t:"00:22",tty:"pts/1"});w.users.etl=w.users.etl||{uid:1500,gid:1500,home:"/opt/etl",shell:"/sbin/nologin",gecos:""};w.groups.etl=w.groups.etl||{gid:1500,members:[]};LX.jlog(w,"kernel",4,"loader invoked oom-killer: gfp_mask=0x140cca(GFP_HIGHUSER_MOVABLE|__GFP_COMP), order=0, oom_score_adj=0");LX.jlog(w,"kernel",3,"Out of memory: Killed process 4980 (loader) total-vm:9123456kB, anon-rss:5734210kB")},
   scenario:"Users report the server is sluggish. Check load, CPU and memory, then deal with the culprits sensibly.",
   tasks:[{t:"Check the load average",hint:"uptime",check:(w,sh)=>LX.ran(sh,/uptime|^w$|top|htop/),sticky:true},
     {t:"Check memory and swap",hint:"free -h",check:(w,sh)=>LX.ran(sh,/free|vmstat|\/proc\/meminfo/),sticky:true},
     {t:"Find the past OOM kill in the kernel log",hint:"journalctl -k | grep -i oom\n(or dmesg | grep -i 'out of memory')",check:(w,sh)=>LX.ran(sh,/(journalctl|dmesg).*(-k|oom|memory)|grep.*-i.*(oom|memory)/i),sticky:true},
     {t:"Find the process using the most memory",hint:"ps aux --sort=-%mem | head",check:(w,sh)=>LX.ran(sh,/ps\b.*(sort=-?%?mem|aux)|top/),sticky:true},
     {t:"Lower the gzip job's priority to nice 19 instead of killing it",hint:"renice -n 19 -p 5151",check:w=>{const p=w.procs.find(p=>p.pid===5151);return !!p&&p.ni>=19}}],
   solution:"uptime\nfree -h\njournalctl -k | grep -i oom\nps aux --sort=-%mem | head -5\nps aux --sort=-%cpu | head -5\nrenice -n 19 -p 5151"},
 svc:{title:"Shell exercise: the web server won't start",world:{pkgs:["httpd","nginx"]},
   setup:w=>{R(w,"systemctl enable --now nginx","systemctl enable httpd","sed -i 's/^Listen 80/Listne 80/' /etc/httpd/conf/httpd.conf");R(w,"systemctl start httpd")},
   scenario:"httpd is enabled but failed. Read the errors, fix its configuration, and resolve whatever else stops it from starting. nginx was a test install that isn't needed.",
   tasks:[{t:"See the failure and read the unit's log",hint:"systemctl status httpd\njournalctl -xeu httpd",check:(w,sh)=>LX.ran(sh,/systemctl\s+status\s+httpd|journalctl.*httpd/),sticky:true},
     {t:"Fix the typo and pass the config test",hint:"sudo apachectl configtest\nsudo sed -i 's/^Listne/Listen/' /etc/httpd/conf/httpd.conf\nsudo apachectl configtest",check:w=>/^\s*Listen\s+80\b/m.test(rd(w,"/etc/httpd/conf/httpd.conf"))&&!/^\s*Listne/m.test(rd(w,"/etc/httpd/conf/httpd.conf"))},
     {t:"Find what already holds port 80",hint:"sudo ss -tlnp | grep ':80'",check:(w,sh)=>LX.ran(sh,/ss\s+-\w*[tl]\w*.*|lsof\s+-i|netstat/),sticky:true},
     {t:"Stop and disable nginx, then start httpd",hint:"sudo systemctl disable --now nginx\nsudo systemctl start httpd",check:w=>w.units.httpd?.active==="active"&&w.units.nginx?.active!=="active"&&!w.units.nginx?.enabled}],
   solution:"systemctl status httpd\nsudo journalctl -xeu httpd | tail\nsudo apachectl configtest\nsudo sed -i 's/^Listne/Listen/' /etc/httpd/conf/httpd.conf\nsudo apachectl configtest\nsudo systemctl start httpd\nsudo journalctl -u httpd -n 3\nsudo ss -tlnp | grep ':80'\nsudo systemctl disable --now nginx\nsudo systemctl start httpd\nsystemctl is-active httpd"},
 login:{title:"Shell exercise: \"I can't log in\"",world:{users:["dana"]},
   setup:w=>{R(w,"echo 'dana:Passw0rd!' | chpasswd","usermod -s /sbin/nologin dana","chage -E 2026-01-31 dana");w.faillock=w.faillock||{};w.faillock.dana=Array.from({length:4},(_,i)=>({when:"2026-11-10 07:5"+i+":12",src:"10.0.0.44"}));[0,1,2,3].forEach(()=>LX.jlog(w,"sshd",5,"Failed password for dana from 10.0.0.44 port 52211 ssh2"));LX.jlog(w,"sshd",5,"pam_faillock(sshd:auth): Consecutive login failures for user dana account temporarily locked")},
   scenario:"dana can't log in over SSH with her correct password. There may be more than one cause. Investigate and fix all of them.",
   tasks:[{t:"Read sshd's log messages about dana",hint:"sudo journalctl -u sshd | grep dana\n(or sudo grep dana /var/log/secure)",check:(w,sh)=>LX.ran(sh,/(journalctl|grep|tail|less).*(sshd|secure|auth)/),sticky:true},
     {t:"Clear dana's failed-login lockout",hint:"sudo faillock --user dana\nsudo faillock --user dana --reset",check:w=>!((w.faillock||{}).dana||[]).length},
     {t:"Fix the expired account (no expiry, or a future date)",hint:"sudo chage -l dana\nsudo chage -E -1 dana",check:w=>{const e=w.users.dana?.exp;return e==null||e<0||e>=Math.floor(Date.now()/864e5)}},
     {t:"Give her a real login shell",hint:"getent passwd dana\nsudo usermod -s /bin/bash dana",check:w=>/\/(bash|zsh|sh)$/.test(w.users.dana?.shell||"")}],
   solution:"sudo journalctl -u sshd | grep dana\nsudo faillock --user dana\nsudo faillock --user dana --reset\nsudo chage -l dana\nsudo chage -E -1 dana\ngetent passwd dana\nsudo usermod -s /bin/bash dana"}
};

const LESSONS=[
{id:"method",num:"5.1",title:"A troubleshooting method and boot problems",html:`
<h3>Work methodically</h3>
<ol><li><b>Identify the problem</b>: exact symptoms and error messages, who's affected, what changed recently (updates, config edits, new hardware).</li>
<li><b>Establish a theory</b> of probable cause. Start simple: is it plugged in, running, listening, allowed through?</li>
<li><b>Test the theory</b>. If it's wrong, form another or escalate.</li>
<li><b>Plan and implement</b> the fix, with a rollback (backup the file, snapshot the VM).</li>
<li><b>Verify</b> full functionality and prevent it happening again.</li>
<li><b>Document</b> what you found and did.</li></ol>
<p>Change one thing at a time, read the logs before guessing, and remember <code>journalctl -xe</code>, <code>systemctl status</code> and <code>dmesg</code> are usually the fastest route to the truth.</p>
<div class="viz" id="viz-method"></div>
<h3>Boot failures by stage</h3>
<table><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>No boot device / grub rescue&gt;</td><td>Wrong boot order, damaged boot loader, missing /boot</td><td>Firmware boot order; boot rescue media and reinstall GRUB (<code>grub2-install</code>, <code>grub2-mkconfig</code>)</td></tr>
<tr><td>Kernel panic: VFS unable to mount root</td><td>Missing storage driver in the initramfs, wrong <code>root=</code></td><td>Boot an older kernel from the GRUB menu; <code>dracut -f</code> / <code>update-initramfs -u</code></td></tr>
<tr><td>Emergency mode</td><td>A filesystem in /etc/fstab can't be mounted (typo, removed disk, bad UUID)</td><td>Log in as root, fix fstab (or add <code>nofail</code>), <code>mount -a</code>, reboot</td></tr>
<tr><td>Hangs on a service</td><td>A unit waiting on the network or a device</td><td>Boot with <code>systemd.unit=rescue.target</code>; <code>systemctl disable</code> it</td></tr>
<tr><td>Lost root password</td><td>-</td><td>At GRUB press <b>e</b>, add <code>rd.break</code> (or <code>init=/bin/bash</code>), remount sysroot rw, <code>chroot</code>, <code>passwd</code>, <code>touch /.autorelabel</code></td></tr>
<tr><td>Filesystem errors at boot</td><td>Unclean shutdown, bad disk</td><td>Unmount and run <code>fsck</code> / <code>xfs_repair</code> from rescue mode</td></tr></table>
<p>Use <code>systemd-analyze blame</code> and <code>systemd-analyze critical-chain</code> to find slow boots, and <code>journalctl -b -1</code> for the previous boot's log.</p>
<div class="viz" id="viz-bootlab"></div>`},
{id:"storage",num:"5.2",title:"Storage and filesystem problems",html:`
<table><tr><th>Symptom</th><th>Check</th><th>Typical fix</th></tr>
<tr><td>"No space left on device"</td><td><code>df -h</code>, <code>du -sh /var/* | sort -h</code>, <code>ncdu</code></td><td>Clean logs (logrotate, <code>journalctl --vacuum-size</code>), package caches (<code>dnf clean all</code>), old kernels; grow the LV</td></tr>
<tr><td>Space doesn't return after deleting</td><td><code>lsof +L1</code></td><td>A process still has the deleted file open: restart it (or truncate the file instead of deleting it next time)</td></tr>
<tr><td>No space, but df shows free blocks</td><td><code>df -i</code></td><td>Inodes exhausted by millions of tiny files: find and remove them</td></tr>
<tr><td>Filesystem went read-only</td><td><code>dmesg</code>, <code>journalctl -k</code></td><td>The kernel remounted it after I/O errors: check the disk, then fsck/xfs_repair unmounted</td></tr>
<tr><td>I/O errors, slow disk</td><td><code>smartctl -a /dev/sda</code>, <code>iostat -x</code></td><td>Replace a failing disk; check RAID with <code>cat /proc/mdstat</code></td></tr>
<tr><td>Mount fails</td><td><code>blkid</code>, <code>lsblk -f</code>, <code>findmnt --verify</code></td><td>Correct UUID, filesystem type or mount point</td></tr>
<tr><td>"target is busy" on umount</td><td><code>lsof /mnt/x</code>, <code>fuser -vm /mnt/x</code></td><td>Close what's using it (often a shell sitting inside it)</td></tr>
<tr><td>User over quota</td><td><code>quota -u user</code>, <code>repquota -a</code></td><td>Clean up or raise with <code>edquota</code></td></tr></table>
<div class="viz" id="viz-storq"></div>
<div class="viz" id="viz-disklab"></div>`},
{id:"network",num:"5.3",title:"Network problems",html:`
<p>Work up the layers and test each before moving on:</p>
<div class="viz" id="viz-netladder"></div>
<pre class="term">ip -br link; ethtool eth0              <span class="t-n"># link up? cable, speed, duplex</span>
ip -br addr; nmcli dev status          <span class="t-n"># right IP and prefix? DHCP worked?</span>
ip route; ping -c3 10.0.0.1            <span class="t-n"># default gateway reachable?</span>
ping -c3 8.8.8.8; tracepath 8.8.8.8    <span class="t-n"># routing beyond the gateway</span>
cat /etc/resolv.conf; dig example.com; dig @10.0.0.53 example.com   <span class="t-n"># DNS</span>
ss -tulpn; nc -zv db01 5432; curl -v http://web01   <span class="t-n"># service listening? port reachable?</span>
firewall-cmd --list-all; tcpdump -i eth0 port 53   <span class="t-n"># filtered? what's on the wire?</span></pre>
<ul><li>"Destination Host Unreachable" from your own IP means no ARP reply: wrong subnet or the host is down. "Network is unreachable" means no route.</li>
<li>Works by IP but not by name: DNS. Check <code>/etc/resolv.conf</code>, <code>/etc/nsswitch.conf</code> and <code>/etc/hosts</code>. Fix the server in NetworkManager, not by editing resolv.conf (it gets overwritten).</li>
<li>Connection refused: nothing listening on that port (or a REJECT rule). Timeout: a firewall dropping packets or routing.</li>
<li>Listening only on <code>127.0.0.1</code> in <code>ss</code> output means the service is reachable locally only.</li>
<li>Duplicate IP addresses cause flapping connectivity (<code>arping</code>); MTU mismatches cause hangs on big transfers (<code>ping -M do -s 1472</code>).</li>
<li>Large latency or loss: <code>mtr</code> shows where along the path; <code>iperf3</code> measures throughput; <code>ip -s link</code> shows interface errors and drops.</li></ul>
<div class="viz" id="viz-netlab"></div>`},
{id:"perf",num:"5.4",title:"Performance: CPU, memory and I/O",html:`
<h3>Load average</h3>
<p><code>uptime</code> shows the 1, 5 and 15-minute averages of processes running or waiting (including those stuck in disk I/O). Compare to the CPU count from <code>nproc</code>: a load of 8 on 8 cores is busy; on 2 cores it's overloaded.</p>
<table><tr><th>Resource</th><th>Tools</th><th>Signs of trouble</th></tr>
<tr><td>CPU</td><td><code>top</code>, <code>htop</code>, <code>mpstat -P ALL</code>, <code>pidstat</code>, <code>sar -u</code></td><td>High %us (applications) or %sy (kernel); one process at 100%; high %st on VMs (stolen by the hypervisor)</td></tr>
<tr><td>Memory</td><td><code>free -h</code>, <code>vmstat 1</code>, <code>/proc/meminfo</code>, <code>ps aux --sort=-%mem</code></td><td>Low <b>available</b> (not free: cache is reclaimable), swap in/out (si/so) constantly, OOM killer messages</td></tr>
<tr><td>Disk I/O</td><td><code>iostat -xz 1</code>, <code>iotop</code>, <code>vmstat</code> (wa, b)</td><td>High %iowait, %util near 100%, processes in D state</td></tr>
<tr><td>Network</td><td><code>ss -s</code>, <code>iftop</code>, <code>nethogs</code>, <code>sar -n DEV</code></td><td>Saturated links, retransmits</td></tr>
<tr><td>History</td><td><code>sar</code> (sysstat)</td><td>What happened at 3 a.m. yesterday</td></tr></table>
<div class="viz" id="viz-perfsort"></div>
<h3>Responding</h3>
<ul><li>A runaway process: <code>renice</code> it, or <code>kill</code> (SIGTERM first). Limit services with cgroups: <code>systemctl set-property app.service CPUQuota=50% MemoryMax=2G</code>.</li>
<li><b>OOM killer</b>: when memory runs out, the kernel kills the process with the highest <code>oom_score</code>. Look for "Out of memory: Killed process" in <code>journalctl -k</code>. Add RAM or swap, fix the leak, or limit the service.</li>
<li>Swap: <code>swapon --show</code>; add a swap file with <code>fallocate</code>, <code>mkswap</code>, <code>swapon</code> and fstab. <code>vm.swappiness</code> tunes how eagerly the kernel swaps.</li>
<li>"Too many open files": raise <code>ulimit -n</code> / <code>LimitNOFILE=</code>. Zombies pile up when a parent doesn't reap children: restart the parent.</li></ul>
<div class="viz" id="viz-perflab"></div>`},
{id:"svc",num:"5.5",title:"Services and applications",html:`
<pre class="term">systemctl status httpd          <span class="t-n"># state, main PID, last log lines</span>
systemctl --failed               <span class="t-n"># everything that failed</span>
journalctl -xeu httpd            <span class="t-n"># full error with explanations</span>
apachectl configtest; nginx -t; sshd -t; named-checkconf; visudo -c   <span class="t-n"># validate before restarting</span>
ss -tulpn | grep :80             <span class="t-n"># port already taken?</span>
systemctl list-dependencies httpd; systemctl cat httpd
ls -lZ /var/www/html; ausearch -m AVC -ts recent   <span class="t-n"># permissions and SELinux</span></pre>
<table><tr><th>Error</th><th>Meaning</th></tr>
<tr><td>Address already in use</td><td>Another process holds the port</td></tr>
<tr><td>Permission denied binding a port</td><td>SELinux port label, or a non-root user below 1024</td></tr>
<tr><td>Unit not found</td><td>Wrong name, or <code>daemon-reload</code> needed after adding the file</td></tr>
<tr><td>start request repeated too quickly</td><td>It keeps crashing; <code>systemctl reset-failed</code> after fixing</td></tr>
<tr><td>status=203/EXEC</td><td>ExecStart path wrong or not executable</td></tr>
<tr><td>status=217/USER</td><td>User= account doesn't exist</td></tr>
<tr><td>Masked</td><td><code>systemctl unmask</code> first</td></tr></table>
<p>For applications, check the app's own logs, file ownership (the service user must read its config and write its data), environment variables, dependencies (<code>ldd</code> for missing libraries), and whether a database or API it needs is reachable. For containers: <code>podman ps -a</code>, <code>podman logs</code>, <code>podman inspect</code>.</p>
<div class="viz" id="viz-svcq"></div>
<div class="viz" id="viz-svclab"></div>`},
{id:"access",num:"5.6",title:"Users, permissions and access",html:`
<table><tr><th>Symptom</th><th>Check</th><th>Fix</th></tr>
<tr><td>"This account is currently not available"</td><td><code>getent passwd user</code></td><td>Shell is /sbin/nologin: <code>usermod -s /bin/bash</code></td></tr>
<tr><td>"Your account has expired"</td><td><code>chage -l user</code></td><td><code>chage -E -1 user</code> or a new date</td></tr>
<tr><td>Correct password rejected</td><td><code>passwd -S</code>, <code>faillock --user</code>, logs</td><td>Unlock (<code>usermod -U</code>), <code>faillock --reset</code>, reset the password</td></tr>
<tr><td>"Password expired, change now"</td><td><code>chage -l</code></td><td>Expected: user picks a new one</td></tr>
<tr><td>SSH key ignored</td><td><code>ssh -v</code>, server log ("bad ownership or modes")</td><td>700 on ~/.ssh, 600 on authorized_keys, owner correct, <code>restorecon -Rv ~/.ssh</code></td></tr>
<tr><td>SSH denied for one user only</td><td><code>AllowUsers</code>/<code>AllowGroups</code>/<code>DenyUsers</code> in sshd_config</td><td>Add the user or group</td></tr>
<tr><td>"user is not in the sudoers file"</td><td><code>sudo -l -U user</code>, <code>id</code></td><td>Add to wheel/sudo or a sudoers.d rule (then log in again)</td></tr>
<tr><td>Permission denied on a file</td><td><code>ls -l</code> on the file <i>and every parent directory</i>, <code>getfacl</code>, <code>lsattr</code>, <code>ls -Z</code></td><td>Missing x on a parent directory is a classic; ACL mask; immutable attribute; SELinux label</td></tr>
<tr><td>Can't write: "Disk quota exceeded"</td><td><code>quota</code></td><td>Clean up or raise the limit</td></tr>
<tr><td>Login works but no home directory</td><td><code>ls -ld /home/user</code></td><td><code>mkhomedir_helper user</code> or create it and copy /etc/skel</td></tr></table>
<p>The authentication log (<code>/var/log/secure</code>, <code>/var/log/auth.log</code>, <code>journalctl -u sshd</code>) usually names the exact reason.</p>
<div class="viz" id="viz-permpath"></div>
<div class="viz" id="viz-loginlab"></div>`}
];

const G={
 method:[["Step 1 of troubleshooting","Identify the problem: symptoms, scope, recent changes"],["Establish a theory","Probable cause, simplest first"],["Test the theory","Confirm before changing things"],["Plan the fix","Include a rollback"],["Verify","Confirm full functionality and prevent recurrence"],["Document","Record findings, actions and outcome"],["Emergency mode","Minimal root shell; often caused by a bad fstab entry"],["Rescue mode","Single-user with basic services and filesystems"],["nofail (fstab)","Don't stop the boot if this mount fails"],["Lost root password on RHEL: which kernel argument do you add in GRUB?","rd.break"],["touch /.autorelabel","Relabel SELinux contexts after editing shadow offline"],["Kernel panic at boot","Try an older kernel from GRUB; rebuild initramfs"],["After adding a storage driver, the RHEL server can't find root at boot. Rebuild what, with which command?","The initramfs, with dracut -f"],["grub2-install","Reinstall the GRUB boot loader"],["systemd-analyze blame","Units sorted by startup time"],["journalctl -b -1","Logs from the previous boot"]],
 storage:[["df -h","Filesystem space usage"],["df -i","Inode usage"],["du -sh *","Size of each item in a directory"],["lsof +L1","Open files that were deleted"],["Deleted but open","Space isn't freed until the process closes the file"],["Read-only remount","Kernel response to filesystem I/O errors"],["fsck / xfs_repair","Check and repair an unmounted filesystem"],["smartctl -a","Disk health from SMART data"],["iostat -x","Per-device utilization and latency"],["Where do you check if a software RAID array is degraded or rebuilding?","cat /proc/mdstat"],["target is busy","Something is using the mount; find it with lsof or fuser"],["fuser -vm","Processes using a mount"],["Test an edited /etc/fstab before rebooting","findmnt --verify (then mount -a)"],["journalctl --vacuum-size=","Shrink the journal"],["dnf clean all","Remove cached packages"],["repquota -a","Quota report for all users"]],
 network:[["ip -br addr","Brief interface addresses"],["Host can reach its subnet but nothing beyond. Which command checks the default gateway?","ip route"],["NIC negotiated 100 Mb/s half duplex. Which command shows it?","ethtool eth0"],["ping the gateway","Tests the local network"],["ping 8.8.8.8","Tests routing beyond the gateway"],["Works by IP, not by name","DNS problem"],["dig @server name","Query a specific DNS server"],["Name lookups fail. Which file shows the DNS servers in use?","/etc/resolv.conf (managed by NetworkManager; change with nmcli)"],["/etc/hosts entry is ignored for a name. Which file sets lookup order?","/etc/nsswitch.conf (hosts: files dns)"],["Connection refused","Nothing listening, or REJECT"],["Connection timed out","Dropped by a firewall or routing"],["Service runs but clients can't connect. How do you confirm it's listening, and on which address?","ss -tulpn (check 0.0.0.0 vs 127.0.0.1)"],["127.0.0.1 listener","Reachable only from the host itself"],["nc -zv host port","Test whether a TCP port is open"],["traceroute / tracepath / mtr","Show the path and where it fails"],["tcpdump","Capture packets on an interface"],["ip -s link","Interface error and drop counters"],["MTU problem","Small packets work, large transfers hang"],["arping","Detect duplicate IP addresses"]],
 perf:[["Load average","Average runnable plus uninterruptible processes over 1, 5, 15 minutes"],["nproc","Number of CPUs; compare to load"],["%us / %sy","User vs kernel CPU time"],["%wa (iowait)","CPU idle waiting for disk"],["%st (steal)","CPU taken by the hypervisor"],["free -h available","Memory usable without swapping"],["Buffers/cache","Reclaimable memory, not a problem"],["vmstat si/so","Swap in/out per second"],["OOM killer","Kernel kills a process when memory runs out"],["oom_score","How likely a process is to be OOM-killed"],["iotop","Processes doing the most I/O"],["D state","Uninterruptible sleep, usually disk I/O"],["sar","Historical performance data (sysstat)"],["pidstat","Per-process CPU, memory and I/O"],["CPUQuota= / MemoryMax=","systemd cgroup limits for a service"],["vm.swappiness","How eagerly the kernel swaps"],["ulimit -n","Open-file limit for the shell"]],
 svc:[["systemctl --failed","List failed units"],["journalctl -xeu unit","Recent unit log with explanations"],["apachectl configtest","Validate Apache configuration"],["nginx -t","Validate nginx configuration"],["Address already in use","Another process has the port"],["status=203/EXEC","ExecStart path wrong or not executable"],["status=217/USER","Service user doesn't exist"],["start request repeated too quickly","Crash loop; fix then reset-failed"],["systemctl reset-failed","Clear a unit's failed state"],["systemctl cat","Show the unit file and drop-ins"],["systemctl list-dependencies","Show what a unit needs"],["Binary fails with 'error while loading shared libraries'. Which command lists what's missing?","ldd /path/to/binary (look for 'not found')"],["Container exits right after start. What do you check first?","podman logs <name>"]],
 access:[["This account is currently not available","Shell is nologin"],["Your account has expired","chage -E date passed"],["passwd -S","Password status (LK = locked)"],["User is locked out after too many bad passwords. How do you unlock them?","faillock --user name --reset"],["Bad ownership or modes","sshd refuses keys with loose permissions"],["AllowGroups","sshd only admits listed groups"],["not in the sudoers file","No sudo rule for the user"],["Group changes need re-login","New groups apply at next login or newgrp"],["x on every parent directory","Needed to reach a file"],["getfacl shows user:eli:rwx but #effective:r-x. Why?","The ACL mask limits named entries; fix with setfacl -m m::rwx"],["lsattr i flag","Immutable file"],["Disk quota exceeded","User hit a quota"],["mkhomedir_helper","Create a missing home directory"],["ssh -v","Verbose client debugging"]]
};
const DECKS=[["method","Method and boot"],["storage","Storage"],["network","Network"],["perf","Performance"],["svc","Services"],["access","Access"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"What's the first step of the troubleshooting methodology?",o:["Identify the problem","Implement a fix","Document","Reboot"],a:0,e:"Gather symptoms and recent changes."},
 {q:"After fixing an issue, what should you do before documenting?",o:["Verify full system functionality","Close the ticket","Reboot all servers","Escalate"],a:0,e:"And prevent recurrence."},
 {q:"A server boots to 'You are in emergency mode' after a disk was removed. Likely cause?",o:["An /etc/fstab entry for the missing disk","A bad GRUB password set by the kernel update","SELinux denial","An expired password"],a:0,e:"Fix or add nofail."},
 {q:"Which fstab option lets the boot continue if a non-critical disk is missing?",o:["nofail","noauto only","defaults","sync"],a:0,e:"Good for removable and network storage."},
 {q:"After a kernel update the server panics: 'VFS: Unable to mount root fs'. Quickest recovery?",o:["Boot the previous kernel from the GRUB menu","Reinstall the OS from the installation media","Run fsck on /","Disable SELinux"],a:0,e:"Then rebuild the initramfs for the new kernel."},
 {q:"You forgot the root password on RHEL. Where do you start?",o:["Edit the GRUB entry and add rd.break","Boot to multi-user.target","Run passwd as admin","Delete /etc/shadow"],a:0,e:"Then chroot /sysroot, passwd, touch /.autorelabel."},
 {q:"Why touch /.autorelabel after resetting a password from rd.break?",o:["The new /etc/shadow has the wrong SELinux label","To reset the GRUB password","To rebuild the initramfs","To clear the journal"],a:0,e:"Otherwise logins fail."},
 {q:"Which command lists the units that slowed the boot the most?",o:["systemd-analyze blame","journalctl -f","systemctl list-timers","uptime"],a:0,e:"critical-chain shows the dependency path."},
 {q:"How do you read errors from the boot before the current one?",o:["journalctl -b -1 -p err","journalctl -b","dmesg -1","last reboot"],a:0,e:"Needs a persistent journal."},
 {q:"You deleted a 20 GB log but df still shows the disk full. Why?",o:["A process still has the deleted file open","The trash folder is full and must be emptied","df caches results","XFS needs fsck"],a:0,e:"lsof +L1, then restart the process."},
 {q:"Touch fails with 'No space left on device' but df -h shows 40% free. Check next?",o:["df -i for inode exhaustion","du -sh / for large directories","free -h","lsblk"],a:0,e:"Millions of tiny files."},
 {q:"A filesystem suddenly became read-only. What does that usually mean?",o:["The kernel detected I/O or filesystem errors","Someone ran chmod -R a-w on the mount","Quota exceeded","SELinux enforcing"],a:0,e:"Check dmesg, then the disk."},
 {q:"umount /mnt/backup says 'target is busy'. Find the culprit with",o:["lsof /mnt/backup or fuser -vm /mnt/backup","df -h /mnt/backup or findmnt --verify /mnt/backup","blkid","mount -a"],a:0,e:"Often your own shell's cwd."},
 {q:"Which command shows a disk's reallocated sectors and health?",o:["smartctl -a /dev/sda","tune2fs -l /dev/sda1","fdisk -l","lsblk -f"],a:0,e:"From smartmontools."},
 {q:"Which safely frees space used by the systemd journal?",o:["journalctl --vacuum-size=500M","rm -rf /var/log/journal/*","truncate /var/log/messages","systemctl stop systemd-journald"],a:0,e:"Or --vacuum-time."},
 {q:"ping 8.8.8.8 works but ping www.example.com fails. Problem area?",o:["DNS","The default gateway","The NIC driver","The firewall on the remote site"],a:0,e:"Check resolv.conf and dig."},
 {q:"ping to the default gateway fails with 'Destination Host Unreachable'. Next?",o:["Check the IP, prefix and link (ip addr, ethtool)","Change DNS servers in /etc/resolv.conf","Restart httpd","Flush iptables"],a:0,e:"Layer 1 to 3 locally."},
 {q:"You edited /etc/resolv.conf by hand and it reverted. Why?",o:["NetworkManager regenerates it; set DNS with nmcli","SELinux restored it from the policy's default copy","A cron job","The file is immutable"],a:0,e:"nmcli con mod eth0 ipv4.dns."},
 {q:"curl to a server gives 'Connection refused'. That means",o:["The host answered, but nothing is listening (or a REJECT rule)","The DNS name is wrong","The packets were silently dropped","The cable is unplugged"],a:0,e:"Timeouts suggest drops."},
 {q:"ss -tlnp shows mysqld on 127.0.0.1:3306. Remote apps can't connect. Fix?",o:["Change bind-address to listen on the network interface","Open port 3306 in firewalld only, then restart the clients","Restart the client","Change DNS"],a:0,e:"It only listens locally."},
 {q:"Which tool shows each hop and loss along a path continuously?",o:["mtr","ping","dig","ss"],a:0,e:"Combines ping and traceroute."},
 {q:"Small web pages load but large downloads hang. Suspect?",o:["MTU mismatch","DNS","Wrong gateway","Expired certificate"],a:0,e:"Test with ping -M do -s 1472."},
 {q:"Which captures DNS packets on eth0 to see if queries leave the host?",o:["tcpdump -i eth0 port 53","dig +trace @8.8.8.8 example.com","ss -u","ip neigh"],a:0,e:"Needs root."},
 {q:"A 4-CPU server shows load average 12, 11, 9. What does it suggest?",o:["Sustained overload: three times more demand than CPUs","Normal for a 4-CPU server; load averages are a per-core percentage","Mostly idle","A memory leak only"],a:0,e:"Then check CPU vs I/O wait."},
 {q:"top shows high %wa. Where is the bottleneck?",o:["Disk I/O","CPU","Network","Memory leak"],a:0,e:"Use iostat -x and iotop."},
 {q:"free -h shows 200 MB free but 5 GB available. Is the server short of memory?",o:["No; cache is reclaimable","Yes, add RAM now","Yes, drop caches hourly","It's a kernel bug"],a:0,e:"Look at available."},
 {q:"A database process vanished overnight. The kernel log says 'Out of memory: Killed process'. What happened?",o:["The OOM killer ended it","It segfaulted","Someone ran kill -9","SELinux killed it"],a:0,e:"Add memory, limit others, or tune."},
 {q:"Which shows historical CPU usage from yesterday at 03:00?",o:["sar -u -f /var/log/sa/saDD","top -d 3600 -n 1","uptime","mpstat now"],a:0,e:"sysstat collects every 10 minutes."},
 {q:"A VM is slow and top shows %st at 30. Meaning?",o:["The hypervisor is giving CPU time to other VMs","The disk is slow and the CPU is waiting","Swap is full","A user process is stuck"],a:0,e:"Talk to the virtualization team."},
 {q:"How do you cap a service at half a CPU and 1 GB RAM with systemd?",o:["systemctl set-property svc CPUQuota=50% MemoryMax=1G","nice -n 10 svc and ulimit -m 1048576 in the unit's ExecStart","ulimit -m 1G","renice svc"],a:0,e:"cgroup limits."},
 {q:"Processes in state D that never finish usually point to",o:["Storage or NFS I/O problems","A CPU-bound loop in user code","DNS","Too many users"],a:0,e:"They can't be killed until I/O returns."},
 {q:"systemctl start httpd fails. Fastest way to see the actual error?",o:["journalctl -xeu httpd","ps aux","cat /etc/passwd","reboot"],a:0,e:"Or systemctl status httpd."},
 {q:"httpd logs 'Address already in use: could not bind to 0.0.0.0:80'. Check with",o:["ss -tlnp | grep :80","dig","df -h","getenforce"],a:0,e:"Another server owns port 80."},
 {q:"A custom service fails with status=203/EXEC. Likely cause?",o:["The ExecStart path is wrong or not executable","The port in ListenStream is already in use by another process","SELinux boolean","Out of memory"],a:0,e:"Check the path and chmod +x."},
 {q:"You added /etc/systemd/system/app.service but systemctl says 'Unit app.service not found'. Fix?",o:["systemctl daemon-reload","systemctl reset-failed","reboot","chmod 777 the file"],a:0,e:"systemd caches unit files."},
 {q:"After fixing a crash-looping service, systemctl start still refuses. What clears it?",o:["systemctl reset-failed svc","systemctl mask svc","daemon-reexec","kill -9 1"],a:0,e:"'start request repeated too quickly'."},
 {q:"Which validates nginx configuration before a reload?",o:["nginx -t","nginx -s stop","systemctl cat nginx","ss -t"],a:0,e:"apachectl configtest for Apache."},
 {q:"A program fails: 'error while loading shared libraries: libfoo.so.2'. Check with",o:["ldd /path/to/program","ls -Z","strace -c","ldconfig -p only"],a:0,e:"Install the library or fix ld.so.conf."},
 {q:"SSH says 'This account is currently not available'. Cause?",o:["The user's shell is /sbin/nologin","The password expired and must be changed","Firewall","Expired key"],a:0,e:"usermod -s /bin/bash."},
 {q:"A user's correct password is rejected and the log shows pam_faillock 'account temporarily locked'. Fix?",o:["faillock --user name --reset","passwd -d name","usermod -e 0 name","Restart sshd"],a:0,e:"Then look at where the failures came from."},
 {q:"Which shows when an account and its password expire?",o:["chage -l user","id user","passwd -S only","last user"],a:0,e:"chage -E -1 removes the expiry."},
 {q:"sshd logs 'Authentication refused: bad ownership or modes for directory /home/eli'. Fix?",o:["Remove group/other write from /home/eli (e.g. chmod 750)","chmod 777 /home/eli so sshd can read authorized_keys","Disable StrictModes","Regenerate host keys"],a:0,e:"StrictModes protects keys."},
 {q:"eli was added to the docker group but still gets permission denied. Why?",o:["Group changes apply at the next login","The group needs a password","usermod needs a reboot","docker ignores groups"],a:0,e:"Log out and in, or newgrp."},
 {q:"A user can't read /srv/data/report.txt even though the file is mode 644. Check",o:["Execute permission on /srv and /srv/data","Only the file's owner","The umask","The sticky bit"],a:0,e:"x is needed on every directory in the path."},
 {q:"A user gets 'is not in the sudoers file'. Fix on RHEL?",o:["usermod -aG wheel user (then re-login)","chmod u+s /usr/bin/sudo","Add them to root's group","Edit /etc/shadow"],a:0,e:"Or a sudoers.d rule."},
 {q:"A user can log in, but writing files fails with 'Disk quota exceeded'. Check",o:["quota -u user","df -i","lsattr","getenforce"],a:0,e:"Clean up or edquota."},
 {q:"Which tool gives detailed client-side SSH debugging?",o:["ssh -vvv user@host","sshd -t","ssh-keygen -l","ssh-add -L"],a:0,e:"Shows which keys are offered."}
];

/* ---------- custom diagram: network layer ladder ---------- */
function netLadder(el){const S=[["Link","ip -br link · ethtool eth0","Is the interface UP with a carrier? A down link or wrong VLAN stops everything above it."],["Address","ip -br addr · nmcli dev status","Right IP and prefix for this network? 169.254.x.x means DHCP failed."],["Gateway","ip route · ping 10.0.0.1","Is there a default route, and does the gateway answer?"],["Routing","ping 8.8.8.8 · tracepath","Can packets leave the local network?"],["DNS","dig example.com · cat /etc/resolv.conf","Do names resolve? Works by IP but not by name points here."],["Service","ss -tulpn · nc -zv host port · curl -v","Is the service listening, on the right address, and allowed by firewalls?"]];let i=0;
  const draw=()=>{el.innerHTML=`<div class="viz-title">Climb the network ladder</div><div class="ladder">${S.map((s,k)=>`<button class="ladder-step ${k<i?"ok":k===i?"on":""}" data-k="${k}" aria-current="${k===i}"><b>${k+1}. ${s[0]}</b><span class="mono s-small">${s[1]}</span></button>`).join("")}</div><div class="caption" aria-live="polite"><b>${S[i][0]}:</b> ${S[i][2]}</div><div class="viz-controls"><button class="btn primary" data-a="next">${i<S.length-1?"Layer works, go up":"Start over"}</button></div>`};
  el.addEventListener("click",e=>{const s=e.target.closest("[data-k]");if(s){i=+s.dataset.k;draw();return}if(!e.target.closest("[data-a]"))return;if(i===S.length-1){award("viz:netladder",15,"Climbed the network ladder");i=0}else i++;draw()});draw()}
/* ---------- custom diagram: permission path walker ---------- */
function permPath(el){const P=[["/","drwxr-xr-x root root","Others have r-x: eli may enter.",true],["/srv","drwxr-xr-x root root","r-x for others: fine.",true],["/srv/data","drwxr-x--- root finance","eli isn't in finance, and others have no x. eli is stopped here, whatever the file's own mode says.",false],["/srv/data/report.txt","-rw-r--r-- root finance","Readable by others, but eli never gets this far.",null]];let i=0;
  const draw=()=>{el.innerHTML=`<div class="viz-title">Why can't eli read report.txt?</div><div class="caption">eli runs <code>cat /srv/data/report.txt</code> and gets Permission denied. Walk the path.</div><div class="ladder">${P.map((p,k)=>`<div class="ladder-step ${k<i?(p[3]?"ok":"bad"):k===i?"on":""}"><b class="mono">${p[0]}</b><span class="mono s-small">${p[1]}</span></div>`).join("")}</div><div class="caption" aria-live="polite">${P[i][2]}${i===2?" <b>Fix:</b> add eli to finance (usermod -aG finance eli, then re-login), or an ACL: setfacl -m u:eli:rx /srv/data.":""}</div><div class="viz-controls"><button class="btn primary" data-a="next">${i<P.length-1?"Next directory":"Start over"}</button></div>`};
  el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;if(i===P.length-1){i=0}else{i++;if(i===2)award("viz:permpath",15,"Walked a permission path")}draw()});draw()}

registerModule({
  id:"ts",slug:"troubleshooting",title:"Troubleshooting",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,labs:LABS,
  vizKeys:["method","bootlab","storq","disklab","netladder","netlab","perfsort","perflab","svcq","svclab","permpath","loginlab"],
  viz(){
seqViz($("#viz-method"),{title:"Put the troubleshooting steps in order",done:"Ordered the troubleshooting method",steps:["Identify the problem","Establish a theory of probable cause","Test the theory","Plan and implement the fix","Verify full functionality","Document findings and actions"]});
shellViz($("#viz-bootlab"),LABS.boot,"bootlab");
quizViz($("#viz-storq"),{title:"Storage symptoms",done:"Diagnosed every storage symptom",qs:[
  ["df shows 100% on /var, du of /var adds up to only 30%",["A deleted file held open: lsof +L1","Inodes: df -i","Bad UUID","RAID degraded"],0,"The space is held by a process."],
  ["'No space left' creating files; df -h 50%, df -i 100%",["Inodes exhausted by many small files","A process holds a deleted file","Quota","Read-only remount"],0,"Find directories with huge file counts."],
  ["dmesg shows 'EXT4-fs error ... remounting filesystem read-only'",["Unmount and fsck, and check the disk's health","Run chmod -R","Restart sshd","Increase swap"],0,"Back up first if possible."],
  ["/proc/mdstat shows [U_]",["A RAID 1 member failed; replace it with mdadm","Normal","Disk full","Wrong fstab"],0,"--fail, --remove, --add."]]});
shellViz($("#viz-disklab"),LABS.disk,"disklab");
netLadder($("#viz-netladder"));
shellViz($("#viz-netlab"),LABS.net,"netlab");
sortViz($("#viz-perfsort"),{title:"Which resource is the bottleneck?",bins:{cpu:"CPU",mem:"Memory",io:"Disk I/O",net:"Network"},
  items:[["top: one process at 100% %CPU, load equals CPU count","cpu","CPU-bound."],["vmstat: si and so in the hundreds every second","mem","Constant swapping."],["iostat: %util 99% on sdb, await 120 ms","io","Saturated disk."],["Many processes in D state, high %wa","io","Waiting on storage."],["journalctl -k: Out of memory: Killed process","mem","OOM killer."],["sar -n DEV: eth0 at 940 Mbit/s on a 1 Gbit link","net","Saturated link."]],done:"Spotted every bottleneck"});
shellViz($("#viz-perflab"),LABS.perf,"perflab");
quizViz($("#viz-svcq"),{title:"Read the service error",done:"Decoded every service error",qs:[
  ["Main process exited, code=exited, status=203/EXEC",["ExecStart binary missing or not executable","Port conflict","Out of memory","SELinux boolean"],0,"Check the path."],
  ["(13)Permission denied: make_sock: could not bind to address 0.0.0.0:8081",["SELinux port label (semanage port)","Port already in use","Config typo","Wrong user"],0,"13 is EACCES; 98 would be in use."],
  ["Failed to start app.service: Unit app.service is masked.",["systemctl unmask app","daemon-reload","reset-failed","Reinstall"],0,"Masking links it to /dev/null."],
  ["app.service: Start request repeated too quickly.",["It's crash-looping: read earlier log lines, fix, then reset-failed","Raise RestartSec only","Reboot","Disable logging"],0,"The first error is the real one."]]});
shellViz($("#viz-svclab"),LABS.svc,"svclab");
permPath($("#viz-permpath"));
shellViz($("#viz-loginlab"),LABS.login,"loginlab");
  },
  sims:[
    {id:"bootfix",type:"shell",title:"The server won't boot",lab:{user:"root",banner:EMERG,world:{disks:[["sdb",20]]},
      setup:w=>{R(w,"mkfs.xfs -L appdata /dev/sdb","mkdir -p /srv/app");badFstab(w,"LABEL=app-data /srv/app xfs defaults 0 0");LX.jlog(w,"systemd",3,"Timed out waiting for device /dev/disk/by-label/app-data.");LX.jlog(w,"systemd",3,"Dependency failed for srv-app.mount - /srv/app.")},
      scenario:"After maintenance the server stopped in emergency mode. The new data disk is attached and has an XFS filesystem. Find out why its fstab entry fails, correct it (keep the disk mounted on /srv/app at boot), and get the server back to normal.",
      tasks:[{t:"Find the failing mount in the boot log",hint:"journalctl -xb | grep -i fail",check:(w,sh)=>LX.ran(sh,/journalctl/),sticky:true},
        {t:"Compare fstab with the real label or UUID",hint:"cat /etc/fstab\nblkid /dev/sdb\nlsblk -f",check:(w,sh)=>LX.ran(sh,/blkid|lsblk\s+-f|xfs_admin|e2label/),sticky:true},
        {t:"Fix the /srv/app line so it matches the filesystem",hint:"The label is appdata, not app-data:\nsed -i 's/LABEL=app-data/LABEL=appdata/' /etc/fstab\n(or use UUID=...)",check:w=>{const l=rd(w,"/etc/fstab").split("\n").find(l=>/\s\/srv\/app\s/.test(l)&&!/^\s*#/.test(l))||"";const fs=w.fs["/dev/sdb"]||{};return new RegExp("^\\s*(LABEL=appdata|UUID="+fs.uuid+"|/dev/sdb)\\s").test(l)}},
        {t:"Mount everything to prove it works",hint:"systemctl daemon-reload\nmount -a\nfindmnt /srv/app",check:w=>w.mounts.some(m=>m.tgt==="/srv/app")},
        {t:"Reboot into normal mode",hint:"systemctl reboot",check:(w,sh)=>LX.ran(sh,/reboot/)&&!w.boot.emergency&&w.mounts.some(m=>m.tgt==="/srv/app"),sticky:true}],
      solution:"journalctl -xb | grep -i fail\ncat /etc/fstab\nblkid /dev/sdb\nsed -i 's/LABEL=app-data/LABEL=appdata/' /etc/fstab\nsystemctl daemon-reload\nmount -a\nfindmnt /srv/app\nsystemctl reboot",
      success:"A one-character label typo stopped the boot. findmnt --verify and mount -a before rebooting would have caught it."}},
    {id:"webdown",type:"shell",title:"The website is down",lab:{world:{pkgs:["httpd"]},
      setup:w=>{R(w,"systemctl enable httpd","sed -i 's/^Listen 80/Listen 8080/' /etc/httpd/conf/httpd.conf","echo '<h1>Shop</h1>' > /var/www/html/index.html","systemctl start httpd")},
      scenario:"The shop's site at http://server1:8080 is down after a change last night. Get httpd running on port 8080 with SELinux enforcing, make it reachable through the firewall, and make sure it starts at boot.",
      tasks:[{t:"Find why httpd won't start",hint:"systemctl status httpd\nsudo journalctl -xeu httpd\nsudo ausearch -m AVC -ts recent",check:(w,sh)=>LX.ran(sh,/journalctl|ausearch|sealert|systemctl\s+status/),sticky:true},
        {t:"Allow httpd to use 8080 in SELinux",hint:"sudo semanage port -l | grep http_port_t\nsudo semanage port -a -t http_port_t -p tcp 8080\n(8080 may already be listed under http_cache_port_t: use -m to modify)",check:w=>(w.selinux.ports.http_port_t||[]).includes("tcp 8080")},
        {t:"Start httpd",hint:"sudo systemctl start httpd",check:w=>w.units.httpd?.active==="active"},
        {t:"Open 8080/tcp permanently and reload the firewall",hint:"sudo firewall-cmd --permanent --add-port=8080/tcp\nsudo firewall-cmd --reload",check:w=>(w.fw.rt.ports||[]).includes("8080/tcp")&&(w.fw.perm.ports||[]).includes("8080/tcp")},
        {t:"Confirm the page and that httpd is enabled",hint:"curl localhost:8080\nsystemctl is-enabled httpd",check:(w,sh)=>/Shop/.test((LX.httpGet(w,"localhost",8080,"/")||{}).body||"")&&!!w.units.httpd?.enabled&&LX.ran(sh,/curl.*8080/),sticky:true}],
      solution:"systemctl status httpd\nsudo journalctl -xeu httpd | tail -5\nsudo ausearch -m AVC -ts recent\nsudo semanage port -a -t http_port_t -p tcp 8080\nsudo systemctl start httpd\nsudo firewall-cmd --permanent --add-port=8080/tcp\nsudo firewall-cmd --reload\ncurl localhost:8080\nsystemctl is-enabled httpd",
      success:"Service, SELinux and firewall: three layers, each checked in turn, and nothing disabled to get there."}},
    {id:"fullsim",type:"shell",title:"3 a.m. page: disk full",lab:{world:{pkgs:["httpd"]},setup:w=>{fullDisk(w);for(let i=0;i<6;i++){const n=LX.put(w,`/var/cache/dnf/pkg${i}.rpm`,"",{});n.sz=60*1048576}},
      scenario:"/ is 96% full and the app is logging write errors. Free space now, safely, without rebooting, and leave it below 50%.",
      tasks:[{t:"Confirm which filesystem is full",hint:"df -h",check:(w,sh)=>LX.ran(sh,/^(sudo\s+)?df\b/),sticky:true},
        {t:"See recent errors about space",hint:"sudo journalctl -p err -n 20\n(or journalctl -k | grep -i space)",check:(w,sh)=>LX.ran(sh,/journalctl/),sticky:true},
        {t:"Find the space hog",hint:"sudo du -xsh /var/* | sort -h",check:(w,sh)=>LX.ran(sh,/du\s+-/),sticky:true},
        {t:"Free the space (the log is held open by httpd)",hint:"sudo rm /var/log/httpd/access_log.1\nsudo lsof +L1\nsudo systemctl restart httpd",check:w=>rootUse(w)<50},
        {t:"Clean the package cache too",hint:"sudo dnf clean all",check:(w,sh)=>LX.ran(sh,/(dnf|yum)\s+clean\s+all|apt(-get)?\s+clean/),sticky:true}],
      solution:"df -h\nsudo journalctl -p err -n 20\nsudo du -xsh /var/* | sort -h\nsudo du -xsh /var/log/* | sort -h | tail -3\nsudo rm /var/log/httpd/access_log.1\nsudo lsof +L1\nsudo systemctl restart httpd\nsudo dnf clean all\ndf -h /",
      success:"Next time: truncate (> file) instead of rm for a log that's still open, and fix logrotate so it never grows that big."}},
    {id:"symptom",type:"match",title:"Match the symptom to the first tool",scenario:"Tap a symptom, then the command you'd run first.",
      items:[["Works by IP, not by name","a"],["Space not freed after rm","b"],["Load 20 on 4 cores, high %wa","c"],["Service failed to start","d"],["Correct password rejected","e"],["No space but df -h shows free","f"],["Slow boot","g"]],
      slots:[["a","dig and /etc/resolv.conf"],["b","lsof +L1"],["c","iostat -x"],["d","journalctl -xeu unit"],["e","faillock --user"],["f","df -i"],["g","systemd-analyze blame"]],success:"Each symptom has a fast first check. Start there, then dig."},
    {id:"rootpw",type:"order",title:"Reset a lost root password (RHEL)",scenario:"Put the recovery steps in order.",
      steps:["Reboot and press e at the GRUB menu","Add rd.break to the linux line and boot with Ctrl+X","mount -o remount,rw /sysroot","chroot /sysroot","passwd root","touch /.autorelabel","exit twice to continue booting"],success:"Physical or console access is all it takes, which is why GRUB passwords and disk encryption matter."},
    {id:"slowcall",type:"choice",title:"\"The app is slow\"",scenario:"At 10:00 users say the inventory app on a 4-CPU VM is very slow.",
      steps:[["What do you check first?",["uptime and top for load, CPU and the busiest processes","Reboot the VM","Add RAM","Restart the database"],0,"Measure first."],
        ["Load is 9. top shows %wa 60 and little user CPU. What's the bottleneck?",["Disk I/O","CPU","Network","DNS"],0,"High iowait."],
        ["iotop shows a backup job reading heavily. It's urgent work hours. Best action?",["Lower its I/O priority (ionice -c3) or pause it, and reschedule it to night","kill -9 it and delete the backup","Ignore it","Disable the disk cache"],0,"Least disruptive fix first."],
        ["Load drops and the app is fast again. What's left?",["Document it and move the backup timer outside work hours","Nothing","Reboot to be safe","Disable backups"],0,"Prevent recurrence."]],success:"Measure, identify the resource, apply the least disruptive fix, prevent it next time."}
  ],
  badges:[
    ["reader","TS","Troubleshooter","Mark all 6 troubleshooting lessons studied",c=>c.allStudied()],
    ["lab","DIA","Field Tested","Complete all 12 diagrams and exercises in this module",c=>c.vizAll()],
    ["boot","SOS","Back from Emergency","Fix the server that won't boot",c=>c.passed("bootfix")],
    ["web","503","Site Restored","Bring the website back up",c=>c.passed("webdown")],
    ["disk","DF","Space Finder","Clear the full disk at 3 a.m.",c=>c.passed("fullsim")],
    ["net","DNS","It Was DNS","Fix the network lab",c=>c.earned("viz:netlab")],
    ["login","SSH","Let Me In","Fix every login problem in the access lab",c=>c.earned("viz:loginlab")],
    ["perfect","100","Root Cause","Score 100% on a troubleshooting quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
