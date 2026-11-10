/* ================= Module 2: Services and User Management (XK0-006 Domain 2.0, 20%) ================= */
(function(){
const R=(w,...cmds)=>{const s=LX.session(w,"root");cmds.forEach(c=>LX.exec(s,c))};
const has=(w,p)=>!!LX.lookup(w,p);
const node=(w,p)=>LX.lookup(w,p);
const modeOf=(w,p)=>{const n=node(w,p);return n?n.mode&0o7777:-1};
const inGroup=(w,u,g)=>!!w.users[u]&&!!w.groups[g]&&(w.users[u].gid===w.groups[g].gid||w.groups[g].members.includes(u));
const unit=(w,u)=>w.units[u]||{};
const LABS={
 files:{title:"Shell exercise: find files and make links",
   world:{files:{"/var/log/app/old.log":{c:"x".repeat(200),owner:"root:root"},"/opt/app/releases/v2.3/bin/app":{c:"#!/bin/bash\necho app v2.3\n",mode:0o755},"/opt/app/releases/v2.4/bin/app":{c:"#!/bin/bash\necho app v2.4\n",mode:0o755},"/home/admin/report-2026.txt":"Q3 report\n","/home/admin/notes/todo.txt":"patch servers\n"}},
   setup:w=>{const n=node(w,"/var/log/app/old.log");n.sz=900*1024*1024},
   scenario:"Practice the everyday file commands: links for releases, and find for big or misplaced files.",
   tasks:[{t:"Create a symbolic link /opt/app/current that points to /opt/app/releases/v2.4",hint:"sudo ln -s /opt/app/releases/v2.4 /opt/app/current",check:w=>{const n=node(w,"/opt/app")?.k?.current;return !!n&&n.t==="l"&&/releases\/v2\.4\/?$/.test(n.to||"")}},
     {t:"Run the app through the link",hint:"/opt/app/current/bin/app",check:(w,sh)=>LX.ran(sh,/\/opt\/app\/current\/bin\/app/),sticky:true},
     {t:"Find files over 500 MB under /var",hint:"sudo find /var -type f -size +500M",check:(w,sh)=>LX.ran(sh,/find\s+\/var.*-size\s+\+\d+[MG]/),sticky:true},
     {t:"Make a hard link ~/report.txt to ~/report-2026.txt",hint:"ln report-2026.txt report.txt",check:w=>{const a=node(w,"/home/admin/report.txt"),b=node(w,"/home/admin/report-2026.txt");return !!a&&a===b}}],
   solution:"sudo ln -s /opt/app/releases/v2.4 /opt/app/current\nls -l /opt/app\n/opt/app/current/bin/app\nsudo find /var -type f -size +500M\nln report-2026.txt report.txt\nls -li report*"},
 perms:{title:"Shell exercise: a shared team directory",world:{users:["dana","eli"]},
   setup:w=>R(w,"groupadd finance","usermod -aG finance dana","usermod -aG finance eli","mkdir /srv/finance"),
   scenario:"dana and eli are in the finance group. /srv/finance should be readable and writable by the group only, new files should belong to finance automatically, and nobody may delete someone else's files.",
   tasks:[{t:"Give /srv/finance to group finance",hint:"sudo chgrp finance /srv/finance",check:w=>node(w,"/srv/finance").gid===w.groups.finance.gid},
     {t:"Set rwx for owner and group, nothing for others",hint:"sudo chmod 770 /srv/finance",check:w=>(modeOf(w,"/srv/finance")&0o777)===0o770},
     {t:"Add SGID so new files inherit the group",hint:"sudo chmod g+s /srv/finance",check:w=>!!(modeOf(w,"/srv/finance")&0o2000)},
     {t:"Add the sticky bit so users can only delete their own files",hint:"sudo chmod +t /srv/finance",check:w=>!!(modeOf(w,"/srv/finance")&0o1000)},
     {t:"Give the auditor account read-only access with an ACL (user admin, r-x)",hint:"sudo setfacl -m u:admin:rx /srv/finance",check:w=>{const n=node(w,"/srv/finance");return !!(n.acl&&(n.acl.users||n.acl.u||{}).admin!==undefined)||/user:admin:r-x/.test(LX.q(w,"getfacl /srv/finance"))}}],
   solution:"sudo chgrp finance /srv/finance\nsudo chmod 3770 /srv/finance\nsudo setfacl -m u:admin:rx /srv/finance\nls -ld /srv/finance\ngetfacl /srv/finance"},
 proc:{title:"Shell exercise: find and stop a runaway process",
   setup:w=>{w.procs.push({pid:4242,ppid:1802,u:"admin",cmd:"/usr/bin/python3 /home/admin/crunch.py",cpu:99.1,mem:3.4,ni:0,st:"R",t:"00:12",tty:"pts/0"},{pid:4250,ppid:1,u:"root",cmd:"/usr/sbin/rsyslogd -n",cpu:0.2,mem:0.3,ni:0,st:"Ssl",t:"Nov09"})},
   scenario:"The server feels slow. Find the process eating the CPU, lower its priority, and then stop it politely.",
   tasks:[{t:"Find the top CPU process",hint:"ps aux --sort=-%cpu | head\n(or top)",check:(w,sh)=>LX.ran(sh,/ps\b.*(sort|aux|-ef)|^top|htop|pgrep/),sticky:true},
     {t:"Lower its priority to nice 10",hint:"renice -n 10 -p 4242",check:w=>{const p=w.procs.find(p=>p.pid===4242);return !p||p.ni>=10},sticky:true},
     {t:"Ask it to exit with SIGTERM",hint:"kill 4242   (or kill -15 4242)",check:w=>!w.procs.some(p=>p.pid===4242)}],
   solution:"ps aux --sort=-%cpu | head -5\nrenice -n 10 -p 4242\nkill 4242\nps -p 4242"},
 pkg:{title:"Shell exercise: query and install packages",
   scenario:"Use the package manager to answer questions and install a tool.",
   tasks:[{t:"Find which package owns /usr/bin/ssh",hint:"rpm -qf /usr/bin/ssh",check:(w,sh)=>LX.ran(sh,/rpm\s+-qf|dnf\s+provides|yum\s+provides/),sticky:true},
     {t:"Find which package would provide the dig command",hint:"dnf provides dig\n(or dnf provides */dig)",check:(w,sh)=>LX.ran(sh,/(dnf|yum)\s+(provides|whatprovides)/),sticky:true},
     {t:"Install it",hint:"sudo dnf install -y bind-utils",check:w=>w.installed.has("bind-utils")},
     {t:"Show the installed package's information",hint:"rpm -qi bind-utils",check:(w,sh)=>LX.ran(sh,/rpm\s+-qi\s+bind-utils|dnf\s+info\s+bind-utils/),sticky:true}],
   setup:w=>{w.installed.delete("bind-utils");LX.syncBins(w)},
   solution:"rpm -qf /usr/bin/ssh\ndnf provides dig\nsudo dnf install -y bind-utils\nrpm -qi bind-utils"},
 cron:{title:"Shell exercise: schedule a job with cron",world:{files:{"/usr/local/bin/cleanup.sh":{c:"#!/bin/bash\nfind /tmp -type f -mtime +7 -delete\n",mode:0o755}}},
   scenario:"Run /usr/local/bin/cleanup.sh as root at 2:30 a.m. every Monday to Friday.",
   tasks:[{t:"Add the root crontab entry",hint:"echo '30 2 * * 1-5 /usr/local/bin/cleanup.sh' | sudo crontab -\n(or sudo crontab -e)",check:w=>/^\s*30\s+0?2\s+\*\s+\*\s+(1-5|mon-fri)\s+\/usr\/local\/bin\/cleanup\.sh/mi.test(w.cron.root||"")},
     {t:"List root's crontab to confirm",hint:"sudo crontab -l",check:(w,sh)=>LX.ran(sh,/crontab\s+(-u\s+root\s+)?-l/),sticky:true}],
   solution:"echo '30 2 * * 1-5 /usr/local/bin/cleanup.sh' | sudo crontab -\nsudo crontab -l"},
 logs:{title:"Shell exercise: dig through the logs",
   setup:w=>{LX.jlog(w,"sshd",6,"Accepted publickey for admin from 10.0.0.5 port 51122 ssh2");for(let i=0;i<4;i++)LX.jlog(w,"sshd",5,`Failed password for invalid user oracle from 203.0.113.77 port ${40100+i} ssh2`);LX.jlog(w,"kernel",3,"EXT4-fs error (device sdb1): ext4_find_entry:1455: inode #2: comm ls: reading directory lblock 0");LX.jlog(w,"crond",6,"(root) CMD (/usr/local/bin/cleanup.sh)")},
   scenario:"Use journalctl filters instead of scrolling. Answer: who is attacking SSH, and is anything at error level or worse?",
   tasks:[{t:"Show only the sshd unit's messages",hint:"journalctl -u sshd",check:(w,sh)=>LX.ran(sh,/journalctl.*-u\s*sshd|journalctl.*_COMM=sshd|grep.*sshd/),sticky:true},
     {t:"Show only priority err and worse",hint:"journalctl -p err",check:(w,sh)=>LX.ran(sh,/journalctl.*-p\s*(err|3|0\.\.3)/),sticky:true},
     {t:"Show messages from the current boot only",hint:"journalctl -b",check:(w,sh)=>LX.ran(sh,/journalctl.*-b/),sticky:true},
     {t:"Write a message of your own to the log with logger",hint:"logger -t maint 'starting patching'",check:w=>w.journal.some(j=>j.u==="maint"||/patch/i.test(j.m)&&j.u!=="sshd")}],
   solution:"journalctl -u sshd\njournalctl -p err\njournalctl -b -n 20\nlogger -t maint 'starting patching'\njournalctl -t maint"},
 ctr:{title:"Shell exercise: your first container",world:{pkgs:["podman"]},
   scenario:"Pull an image, run a web server container on port 8080, and look inside it.",
   tasks:[{t:"Pull the nginx image",hint:"podman pull docker.io/library/nginx",check:w=>w.images.some(i=>/nginx/.test(i.name))},
     {t:"Run it detached, named web, publishing host port 8080 to container port 80",hint:"podman run -d --name web -p 8080:80 nginx",check:w=>w.ctrs.some(c=>c.name==="web"&&c.state==="running"&&c.ports.some(p=>p.h===8080&&p.c===80))},
     {t:"Fetch the page through the published port",hint:"curl localhost:8080",check:(w,sh)=>LX.ran(sh,/curl.*8080/),sticky:true},
     {t:"Read the container's logs",hint:"podman logs web",check:(w,sh)=>LX.ran(sh,/podman\s+logs/),sticky:true}],
   solution:"podman pull docker.io/library/nginx\npodman run -d --name web -p 8080:80 nginx\npodman ps\ncurl localhost:8080\npodman logs web"}
};

const LESSONS=[
{id:"files",num:"2.1",title:"Files, directories, links and finding things",html:`
<h3>Everyday file commands</h3>
<table><tr><th>Command</th><th>Notes</th></tr>
<tr><td><code>ls -la</code>, <code>ls -lh</code>, <code>ls -lt</code>, <code>ls -Z</code>, <code>ls -i</code></td><td>long, all, human sizes, by time, SELinux context, inode numbers</td></tr>
<tr><td><code>cp -a src dst</code>, <code>cp -r</code></td><td>-a keeps permissions, owners, times and links (archive)</td></tr>
<tr><td><code>mv</code>, <code>rm -r</code>, <code>rmdir</code>, <code>mkdir -p a/b/c</code></td><td>rm has no undo; -i asks first</td></tr>
<tr><td><code>touch</code>, <code>stat</code>, <code>file</code></td><td>create or update timestamps; show inode details; identify contents</td></tr>
<tr><td><code>cat</code>, <code>less</code>, <code>head -n</code>, <code>tail -n</code>, <code>tail -f</code></td><td>view; follow a growing log</td></tr>
<tr><td><code>diff</code>, <code>wc</code>, <code>sort</code>, <code>uniq</code>, <code>cut</code>, <code>tr</code></td><td>compare and process text</td></tr></table>
<h3>Hard and symbolic links</h3>
<ul><li>A <b>hard link</b> is a second name for the same inode (<code>ln target name</code>). The data stays until the last name is removed. It can't cross filesystems or point at a directory.</li>
<li>A <b>symbolic (soft) link</b> is a small file that holds a path (<code>ln -s target name</code>). It can cross filesystems and point at directories, but it breaks ("dangling") if the target moves.</li></ul>
<div class="viz" id="viz-links"></div>
<h3>Finding files</h3>
<pre class="term">find /var -type f -size +500M                 <span class="t-n"># big files</span>
find /home -user eli -name "*.mp4"            <span class="t-n"># by owner and name</span>
find /etc -mtime -1                           <span class="t-n"># changed in the last day</span>
find / -perm -4000 -type f 2>/dev/null        <span class="t-n"># SUID programs (an audit favorite)</span>
find /tmp -type f -mtime +7 -delete           <span class="t-n"># act on matches (or -exec rm {} \\;)</span>
locate sshd_config                            <span class="t-n"># fast lookup in a database; refresh with updatedb</span>
which python3; whereis ssh; type ll</pre>
<div class="viz" id="viz-findq"></div>
<div class="viz" id="viz-fileslab"></div>`},
{id:"perms",num:"2.2",title:"Permissions, ownership, special bits and ACLs",html:`
<p><code>ls -l</code> shows <code>-rwxr-x---</code>: the type (<code>-</code> file, <code>d</code> directory, <code>l</code> link), then read/write/execute for the <b>user (owner)</b>, the <b>group</b> and <b>others</b>.</p>
<table><tr><th>Bit</th><th>On a file</th><th>On a directory</th></tr>
<tr><td>r (4)</td><td>read contents</td><td>list names</td></tr><tr><td>w (2)</td><td>change contents</td><td>create, delete, rename entries</td></tr><tr><td>x (1)</td><td>run it</td><td>enter it (cd) and reach files inside</td></tr></table>
<p>Octal adds the numbers per class: rwx=7, r-x=5, r--=4. So <code>chmod 750 file</code> is rwxr-x---. Symbolic form changes pieces: <code>chmod u+x,g-w,o= file</code>. Ownership: <code>chown user:group file</code>, <code>chgrp group file</code>, <code>-R</code> for a tree.</p>
<div class="viz" id="viz-permcalc"></div>
<h3>umask</h3>
<p>New files start at 666 and directories at 777, minus the <b>umask</b>. With the usual umask 022, files are 644 and directories 755. With 027, files are 640 and directories 750. Set it in <code>~/.bashrc</code> or system-wide in <code>/etc/profile</code> or <code>/etc/login.defs</code>.</p>
<h3>Special bits</h3>
<table><tr><th>Bit</th><th>Octal</th><th>Shows as</th><th>Effect</th></tr>
<tr><td><b>SUID</b></td><td>4000</td><td><code>rws</code> in user</td><td>A program runs with its owner's rights (passwd runs as root to edit /etc/shadow)</td></tr>
<tr><td><b>SGID</b></td><td>2000</td><td><code>rws</code> in group</td><td>On a program: runs with the group's rights. On a directory: new files inherit the directory's group</td></tr>
<tr><td><b>Sticky</b></td><td>1000</td><td><code>t</code> in others</td><td>On a directory: only a file's owner (or root) can delete it, as on /tmp</td></tr></table>
<p>A capital <code>S</code> or <code>T</code> means the special bit is set but the execute bit underneath isn't.</p>
<h3>ACLs and attributes</h3>
<ul><li>Access control lists add permissions for specific users and groups: <code>setfacl -m u:eli:rw file</code>, <code>setfacl -m d:g:dev:rwx dir</code> (a default ACL inherited by new files), <code>getfacl file</code>, <code>setfacl -x</code> to remove. A <code>+</code> after the mode in <code>ls -l</code> means an ACL exists. The <b>mask</b> caps what named users and groups can get.</li>
<li>Attributes: <code>chattr +i file</code> makes it immutable even for root; <code>chattr +a</code> allows append only (logs). See them with <code>lsattr</code>.</li></ul>
<div class="viz" id="viz-special"></div>
<div class="viz" id="viz-permlab"></div>`},
{id:"users",num:"2.3",title:"Users and groups",html:`
<h3>The account files</h3>
<table><tr><th>File</th><th>Holds</th></tr>
<tr><td><code>/etc/passwd</code></td><td><code>name:x:UID:GID:comment:home:shell</code>, readable by all</td></tr>
<tr><td><code>/etc/shadow</code></td><td>Password hashes and aging (last change, min, max, warn, inactive, expire), root only</td></tr>
<tr><td><code>/etc/group</code></td><td><code>group:x:GID:member1,member2</code></td></tr>
<tr><td><code>/etc/gshadow</code></td><td>Group passwords and administrators</td></tr>
<tr><td><code>/etc/login.defs</code>, <code>/etc/default/useradd</code></td><td>Defaults: UID ranges, password aging, home directory creation</td></tr>
<tr><td><code>/etc/skel/</code></td><td>Files copied into every new home directory</td></tr></table>
<p>UID 0 is root. System accounts (for services) use low UIDs, usually below 1000, with a shell like <code>/sbin/nologin</code>. Regular users start at 1000. Each user has one <b>primary group</b> (the GID in passwd, used for new files) and any number of <b>supplementary groups</b>.</p>
<h3>Managing accounts</h3>
<pre class="term">sudo useradd -m -s /bin/bash -c "Dana Ops" -G wheel dana   <span class="t-n"># -m makes the home directory</span>
sudo passwd dana
sudo usermod -aG docker dana     <span class="t-n"># -a appends; without it, -G replaces all supplementary groups!</span>
sudo usermod -L dana / -U        <span class="t-n"># lock / unlock (also passwd -l / -u)</span>
sudo usermod -s /sbin/nologin svc_backup
sudo userdel -r dana             <span class="t-n"># -r removes the home and mail spool</span>
sudo groupadd finance; sudo groupdel finance; sudo gpasswd -a eli finance
sudo chage -M 90 -W 7 -E 2026-12-31 dana   <span class="t-n"># max age, warning days, account expiry</span>
chage -l dana; id dana; groups dana; getent passwd dana
who; w; last; lastb; whoami</pre>
<p>On Debian, <code>adduser</code> is a friendly interactive wrapper around <code>useradd</code>. Group membership changes take effect at the user's next login (or <code>newgrp</code>).</p>
<div class="viz" id="viz-passwd"></div>
<div class="viz" id="viz-userq"></div>`},
{id:"procs",num:"2.4",title:"Processes, signals and priorities",html:`
<p>Every running program is a <b>process</b> with a PID, a parent (PPID), an owner and a state: <b>R</b> running, <b>S</b> sleeping, <b>D</b> uninterruptible I/O wait, <b>T</b> stopped, <b>Z</b> zombie (finished, waiting for its parent to collect it).</p>
<pre class="term">ps aux                      <span class="t-n"># everything, BSD style (%CPU, %MEM, STAT)</span>
ps -ef --forest             <span class="t-n"># System V style with parent tree</span>
ps -eo pid,ppid,user,ni,%cpu,cmd --sort=-%cpu | head
top / htop                  <span class="t-n"># live; in top press P (CPU), M (memory), k (kill), r (renice)</span>
pgrep -a nginx; pidof sshd; pstree -p
cat /proc/1842/status</pre>
<h3>Signals</h3>
<table><tr><th>Signal</th><th>Number</th><th>Meaning</th></tr>
<tr><td>SIGHUP</td><td>1</td><td>Hang up; many daemons reload their config</td></tr>
<tr><td>SIGINT</td><td>2</td><td>Interrupt (Ctrl+C)</td></tr>
<tr><td>SIGKILL</td><td>9</td><td>Kill immediately; can't be caught, no cleanup</td></tr>
<tr><td>SIGTERM</td><td>15</td><td>Polite request to exit (the default for kill)</td></tr>
<tr><td>SIGSTOP / SIGTSTP</td><td>19 / 20</td><td>Pause (Ctrl+Z sends SIGTSTP)</td></tr>
<tr><td>SIGCONT</td><td>18</td><td>Resume</td></tr></table>
<p><code>kill PID</code> sends SIGTERM; try that before <code>kill -9</code>. <code>pkill -u eli</code> and <code>killall nginx</code> match by name or owner.</p>
<div class="viz" id="viz-signals"></div>
<h3>Jobs and priority</h3>
<ul><li><code>cmd &amp;</code> starts in the background. <code>jobs</code> lists, <code>fg %1</code> foregrounds, Ctrl+Z then <code>bg</code> continues it in the background. <code>nohup cmd &amp;</code> survives logout; <code>disown</code> detaches a running job. For long sessions use <code>tmux</code> or <code>screen</code>.</li>
<li><b>Niceness</b> runs from -20 (highest priority) to 19 (lowest). <code>nice -n 10 cmd</code> starts low; <code>renice -n 5 -p PID</code> changes a running one. Only root can lower niceness (raise priority).</li></ul>
<div class="viz" id="viz-proclab"></div>`},
{id:"pkg",num:"2.5",title:"Software: packages, repositories and building from source",html:`
<table><tr><th>Task</th><th>RHEL family (RPM)</th><th>Debian family (DEB)</th></tr>
<tr><td>Install / remove</td><td><code>dnf install pkg</code> / <code>dnf remove</code></td><td><code>apt install pkg</code> / <code>apt remove</code> (<code>purge</code> also deletes config)</td></tr>
<tr><td>Update</td><td><code>dnf upgrade</code> (<code>dnf check-update</code>)</td><td><code>apt update</code> (refresh lists) then <code>apt upgrade</code></td></tr>
<tr><td>Search / info</td><td><code>dnf search</code>, <code>dnf info</code></td><td><code>apt search</code>, <code>apt show</code></td></tr>
<tr><td>Which package has file X?</td><td><code>dnf provides */X</code> or <code>rpm -qf /path</code> (installed)</td><td><code>dpkg -S /path</code> (installed), <code>apt-file search</code></td></tr>
<tr><td>Files in a package</td><td><code>rpm -ql pkg</code></td><td><code>dpkg -L pkg</code></td></tr>
<tr><td>Install a local file</td><td><code>dnf install ./x.rpm</code> (rpm -ivh skips dependencies)</td><td><code>apt install ./x.deb</code> (dpkg -i skips dependencies)</td></tr>
<tr><td>Verify</td><td><code>rpm -V pkg</code></td><td><code>dpkg --verify</code></td></tr>
<tr><td>History / undo</td><td><code>dnf history</code>, <code>dnf history undo N</code></td><td><code>/var/log/apt/history.log</code></td></tr>
<tr><td>Repositories</td><td><code>/etc/yum.repos.d/*.repo</code>, <code>dnf repolist</code>, <code>dnf config-manager</code></td><td><code>/etc/apt/sources.list</code> and <code>sources.list.d/</code></td></tr></table>
<p>Packages are signed: <code>rpm --import KEY</code> or a keyring under <code>/etc/apt/keyrings/</code> trusts a repository's GPG key. RHEL systems also need a subscription (<code>subscription-manager register</code>) for Red Hat's repositories. Extra repos like <b>EPEL</b> add community packages.</p>
<p><b>Universal formats</b>: <b>Flatpak</b> and <b>Snap</b> bundle an app with its dependencies in a sandbox; <b>AppImage</b> is a single runnable file. Python libraries come from <code>pip</code>, ideally inside a virtual environment.</p>
<h3>Building from source</h3>
<pre class="term">tar -xzf app-1.4.tar.gz && cd app-1.4
./configure --prefix=/usr/local     <span class="t-n"># checks dependencies, writes a Makefile</span>
make                                 <span class="t-n"># compiles (needs gcc, make, *-devel / *-dev headers)</span>
sudo make install                    <span class="t-n"># copies into /usr/local</span></pre>
<p>Shared libraries: <code>ldd /usr/bin/ssh</code> lists them; after installing libraries into a new path, add it to <code>/etc/ld.so.conf.d/</code> and run <code>ldconfig</code>.</p>
<div class="viz" id="viz-pkgsort"></div>
<div class="viz" id="viz-pkglab"></div>`},
{id:"systemd",num:"2.6",title:"systemd services, timers and scheduled jobs",html:`
<pre class="term">systemctl status sshd
sudo systemctl start|stop|restart|reload sshd
sudo systemctl enable --now httpd      <span class="t-n"># start at boot, and start now</span>
sudo systemctl disable httpd; sudo systemctl mask httpd   <span class="t-n"># mask: impossible to start</span>
systemctl is-active httpd; systemctl is-enabled httpd
systemctl list-units --type=service --state=failed
systemctl cat sshd; sudo systemctl edit sshd   <span class="t-n"># view; add a drop-in override</span>
sudo systemctl daemon-reload            <span class="t-n"># after changing unit files</span></pre>
<div class="tip"><b>enable is not start.</b> enable creates the symlinks for the next boot; start runs it now. Use <code>enable --now</code> to do both. And never edit files in <code>/usr/lib/systemd/system/</code>: package updates overwrite them. Put your own units and overrides in <code>/etc/systemd/system/</code>.</div>
<h3>Writing a unit</h3>
<pre class="term">[Unit]
Description=Report generator
After=network-online.target
Wants=network-online.target

[Service]
Type=simple                 <span class="t-n"># or forking, oneshot, notify</span>
User=reports
ExecStart=/usr/local/bin/report-server
Restart=on-failure
Environment=PORT=8081

[Install]
WantedBy=multi-user.target</pre>
<div class="viz" id="viz-unit"></div>
<h3>Scheduling</h3>
<ul><li><b>cron</b>: <code>crontab -e</code> for your own jobs, <code>/etc/crontab</code> and <code>/etc/cron.d/</code> for system jobs (which add a user field), and drop-in scripts in <code>/etc/cron.daily/</code> etc. Access is controlled by <code>/etc/cron.allow</code> and <code>/etc/cron.deny</code>.</li>
<li>The five fields: <b>minute hour day-of-month month day-of-week</b>. <code>*/15 * * * *</code> every 15 minutes; <code>0 3 * * 0</code> Sundays at 3:00; <code>30 2 * * 1-5</code> weekdays at 2:30.</li>
<li><b>systemd timers</b> pair a <code>.timer</code> with a <code>.service</code>: <code>OnCalendar=*-*-* 02:30:00</code> or <code>OnCalendar=weekly</code>, <code>OnBootSec=10min</code>, and <code>Persistent=true</code> to catch up on runs missed while powered off. List them with <code>systemctl list-timers</code>. Output lands in the journal.</li>
<li><b>at</b> runs something once: <code>echo "reboot" | at 23:00</code>, <code>atq</code>, <code>atrm</code>.</li></ul>
<div class="viz" id="viz-cron"></div>
<div class="viz" id="viz-cronlab"></div>`},
{id:"logs",num:"2.7",title:"Logging and time",html:`
<h3>journald</h3>
<pre class="term">journalctl -u nginx --since "1 hour ago"
journalctl -p err -b         <span class="t-n"># errors and worse, this boot (-b -1: previous boot)</span>
journalctl -f                <span class="t-n"># follow</span>
journalctl -k                <span class="t-n"># kernel messages</span>
journalctl -xe              <span class="t-n"># jump to the end with explanations</span>
journalctl --disk-usage; sudo journalctl --vacuum-time=2weeks</pre>
<p>The journal is binary and lives in <code>/run/log/journal</code> (lost at reboot) unless <code>/var/log/journal</code> exists or <code>Storage=persistent</code> is set in <code>/etc/systemd/journald.conf</code>.</p>
<h3>Syslog and text logs</h3>
<p><b>rsyslog</b> writes classic text files and can forward to a central server (<code>*.* @@logserver:514</code> for TCP, a single <code>@</code> for UDP). Rules match <b>facility.severity</b>, for example <code>authpriv.*  /var/log/secure</code>.</p>
<table><tr><th>File</th><th>Contents</th></tr>
<tr><td><code>/var/log/messages</code> (RHEL) / <code>/var/log/syslog</code> (Debian)</td><td>General system messages</td></tr>
<tr><td><code>/var/log/secure</code> / <code>/var/log/auth.log</code></td><td>Logins, sudo, SSH</td></tr>
<tr><td><code>/var/log/audit/audit.log</code></td><td>auditd records, including SELinux denials</td></tr>
<tr><td><code>/var/log/dnf.log</code>, <code>/var/log/apt/</code></td><td>Package history</td></tr>
<tr><td><code>/var/log/wtmp</code>, <code>btmp</code>, <code>lastlog</code></td><td>Binary login records read by last, lastb, lastlog</td></tr></table>
<p>Severities from most to least severe: <b>emerg (0), alert (1), crit (2), err (3), warning (4), notice (5), info (6), debug (7)</b>. Write your own entries with <code>logger -p user.warning -t myscript "message"</code>.</p>
<p><b>logrotate</b> (run daily by a timer or cron) rotates, compresses and deletes old logs according to <code>/etc/logrotate.conf</code> and <code>/etc/logrotate.d/</code>: <code>weekly</code>, <code>rotate 4</code>, <code>compress</code>, <code>missingok</code>, <code>postrotate</code> to signal the daemon.</p>
<div class="viz" id="viz-sev"></div>
<h3>Time</h3>
<p>Accurate time matters for logs, Kerberos and TLS. <code>timedatectl</code> shows and sets the time zone (<code>timedatectl set-timezone Europe/Berlin</code>) and NTP state. <b>chrony</b> is the usual NTP client: servers in <code>/etc/chrony.conf</code>, status with <code>chronyc sources -v</code> and <code>chronyc tracking</code>. <code>hwclock</code> reads or sets the hardware clock; <code>date</code> shows system time.</p>
<div class="viz" id="viz-logslab"></div>`},
{id:"ctr",num:"2.8",title:"Containers with Podman and Docker",html:`
<p>A <b>container</b> is a process isolated with kernel <b>namespaces</b> (its own view of PIDs, network, mounts, hostname, users) and limited with <b>cgroups</b> (CPU, memory). It shares the host kernel, so it starts in milliseconds and is much lighter than a VM. An <b>image</b> is the read-only template, built in layers and pulled from a <b>registry</b> (docker.io, quay.io, registry.access.redhat.com).</p>
<div class="viz" id="viz-vmctr"></div>
<table><tr><th></th><th>Docker</th><th>Podman</th></tr>
<tr><td>Architecture</td><td>Client talks to the dockerd daemon (root)</td><td>Daemonless, each container is a child process</td></tr>
<tr><td>Rootless</td><td>Optional</td><td>Default for normal users</td></tr>
<tr><td>Commands</td><td colspan="2">Almost identical: <code>alias docker=podman</code> works for most tasks</td></tr>
<tr><td>Access</td><td>Members of the docker group are effectively root</td><td>Each user has separate containers and images</td></tr></table>
<pre class="term">podman search nginx; podman pull docker.io/library/nginx:1.27
podman images; podman rmi IMAGE
podman run -d --name web -p 8080:80 -v /srv/site:/usr/share/nginx/html:Z nginx
podman ps -a; podman logs web; podman exec -it web bash
podman stop web; podman rm web; podman inspect web
podman volume create data; podman network create appnet
podman build -t myapp:1.0 .      <span class="t-n"># from a Containerfile/Dockerfile</span></pre>
<ul><li><code>-p host:container</code> publishes a port. Rootless users can't bind ports below 1024.</li>
<li><code>-v host:container</code> bind-mounts a directory; a named volume (<code>-v data:/var/lib/mysql</code>) is managed by the engine. On SELinux hosts add <b>:Z</b> (private) or <b>:z</b> (shared) to relabel the content, or the container gets permission denied.</li>
<li><code>-e KEY=value</code> sets environment variables; <code>--restart=always</code> restarts it.</li>
<li>Containers are disposable: data you care about lives in volumes, not in the container's writable layer.</li></ul>
<h3>Images and orchestration</h3>
<pre class="term">FROM registry.access.redhat.com/ubi9/ubi
RUN dnf install -y python3 && dnf clean all
COPY app.py /opt/app/
EXPOSE 8000
USER 1001
CMD ["python3", "/opt/app/app.py"]</pre>
<p><b>Compose</b> files (<code>compose.yaml</code>) describe several containers and networks; run them with <code>docker compose up -d</code> or <code>podman-compose</code>. To run a Podman container as a service, use a <b>Quadlet</b> file (<code>~/.config/containers/systemd/web.container</code>) or the older <code>podman generate systemd</code>, plus <code>loginctl enable-linger user</code> so user services start without a login. <b>Kubernetes</b> orchestrates containers across many nodes: pods, deployments, services, managed with <code>kubectl</code>.</p>
<div class="viz" id="viz-ctrq"></div>
<div class="viz" id="viz-ctrlab"></div>`}
];

const G={
 files:[["ls -la","Long listing including hidden files"],["cp -a","Copy preserving permissions, ownership, times and links"],["rm -r","Remove a directory tree (no undo)"],["mkdir -p","Create parent directories as needed"],["stat","Shows inode, size, permissions and timestamps"],["file","Identifies file contents (ELF binary, ASCII text...)"],["tail -f","Follows a log as it grows"],["Hard link","Another name for the same inode; same filesystem, not directories"],["Symbolic link","A file containing a path; can cross filesystems; breaks if the target moves"],["ln -s target name","Create a symbolic link"],["Inode","On-disk record of a file's metadata and data location"],["find -size +100M","Files larger than 100 MB"],["find -mtime -1","Modified within the last day"],["find -perm -4000","Files with SUID set"],["find ... -exec cmd {} \\;","Run a command on each match"],["locate / updatedb","Fast filename search using a database refreshed by updatedb"],["which / whereis / type","Show which program a command runs, or where it lives"],["diff","Show line differences between files"],["wc -l","Count lines"],["sort | uniq -c","Count duplicate lines"]],
 perms:[["r w x values","4, 2, 1"],["chmod 750","rwxr-x---"],["chmod 644","rw-r--r--"],["chmod u+x,o-r","Symbolic: add execute for owner, remove read for others"],["x on a directory","Allows entering it and reaching files inside"],["w on a directory","Allows creating, deleting and renaming entries"],["chown user:group","Change owner and group"],["umask 022","New files 644, directories 755"],["umask 027","New files 640, directories 750"],["SUID (4000)","Program runs with the file owner's privileges"],["SGID on a directory (2000)","New files inherit the directory's group"],["Sticky bit (1000)","Only the owner can delete files in the directory (/tmp)"],["Capital S in ls -l","SUID/SGID set but the execute bit is not"],["setfacl -m u:name:rw","Grant a user extra rights with an ACL"],["Default ACL","setfacl -m d:... ; inherited by new files in a directory"],["ACL mask","Maximum rights named users and groups can receive"],["+ after the mode","The file has an ACL"],["chattr +i","Immutable: not even root can change or delete it until removed"],["chattr +a","Append-only file"],["lsattr","Show extended attributes"]],
 users:[["/etc/passwd","name:x:UID:GID:comment:home:shell"],["/etc/shadow","Password hashes and aging, root-only"],["/etc/group","Groups and their members"],["/etc/skel","Template files copied into new home directories"],["/etc/login.defs","Defaults for UID ranges and password aging"],["UID 0","root"],["System account","Low UID, no login shell, runs a service"],["/sbin/nologin","Shell that refuses interactive logins"],["Primary group","The GID in /etc/passwd; owns new files"],["Supplementary groups","Extra groups listed in /etc/group"],["useradd -m","Create a user with a home directory"],["usermod -aG group user","Add to a group without removing others"],["usermod -G without -a","Replaces all supplementary groups"],["userdel -r","Delete a user and their home directory"],["passwd -l / usermod -L","Lock an account's password"],["chage -M 90","Password must change every 90 days"],["chage -E date","Account expires on that date"],["id user","Show UID, GID and groups"],["getent passwd user","Look up a user through NSS (local or LDAP)"],["last / lastb","Successful / failed login history"]],
 procs:[["PID / PPID","Process ID and its parent's ID"],["ps aux","All processes, BSD style"],["ps -ef","All processes, System V style"],["top / htop","Live process monitor"],["State R / S / D","Running, sleeping, uninterruptible I/O wait"],["Zombie (Z)","Finished process whose parent hasn't collected its exit status"],["SIGTERM (15)","Polite request to exit; kill's default"],["SIGKILL (9)","Immediate kill; can't be caught"],["SIGHUP (1)","Hang up; many daemons reload configuration"],["SIGINT (2)","Ctrl+C"],["SIGTSTP / SIGCONT","Pause (Ctrl+Z) and resume"],["pkill / killall","Signal processes by name or user"],["pgrep -a","Find PIDs by name"],["Niceness","-20 highest priority to 19 lowest"],["nice -n 10 cmd","Start at lower priority"],["renice","Change a running process's niceness"],["jobs / fg / bg","Manage shell background jobs"],["nohup","Keep a command running after logout"],["/proc/PID","Kernel's live view of a process"]],
 pkg:[["dnf install / remove","Install or remove on RHEL family"],["apt update","Refresh Debian package lists (not an upgrade)"],["apt upgrade","Install newer versions of installed packages"],["apt purge","Remove a package and its configuration"],["rpm -qf /path","Which installed package owns a file"],["dpkg -S /path","Debian: which package owns a file"],["dnf provides","Which package (installed or not) provides a file"],["rpm -ql / dpkg -L","List files in a package"],["rpm -qa","List all installed packages"],["rpm -V","Verify installed files against the package database"],["dnf history undo","Roll back a transaction"],["/etc/yum.repos.d/","RHEL repository definitions"],["/etc/apt/sources.list.d/","Debian repository definitions"],["GPG key","Verifies packages come from the repository owner"],["EPEL","Extra community packages for RHEL"],["Flatpak / Snap","Sandboxed apps bundled with dependencies"],["./configure && make && make install","Build from source"],["ldd","Show shared libraries a binary needs"],["ldconfig","Refresh the shared library cache"],["pip in a venv","Install Python packages without touching system packages"]],
 systemd:[["systemctl enable --now","Start at boot and start now"],["enable vs start","Next boot vs right now"],["mask","Link a unit to /dev/null so it can't start"],["systemctl daemon-reload","Reload unit files after changes"],["/etc/systemd/system/","Your units and overrides (survive package updates)"],["systemctl edit","Create a drop-in override"],["Type=oneshot","Runs a task to completion then exits"],["Restart=on-failure","Restart the service if it crashes"],["After= vs Wants=","Ordering vs dependency"],["WantedBy=multi-user.target","Start when that target starts (enable)"],["systemctl list-units --state=failed","Show failed units"],["Cron fields","minute hour day-of-month month day-of-week"],["*/15 * * * *","Every 15 minutes"],["0 3 * * 0","Sundays at 3:00"],["crontab -e / -l","Edit or list your cron jobs"],["/etc/cron.d/","System cron files with a user field"],["cron.allow / cron.deny","Who may use crontab"],["OnCalendar=","Timer schedule, like *-*-* 02:30:00"],["Persistent=true","Timer runs missed jobs after downtime"],["at","Run a command once at a set time"]],
 logs:[["journalctl -u unit","Messages from one unit"],["journalctl -p err","Priority err and worse"],["journalctl -b / -b -1","This boot / previous boot"],["journalctl -f","Follow new messages"],["journalctl -k","Kernel messages"],["Persistent journal","Create /var/log/journal or set Storage=persistent"],["rsyslog","Writes text logs and forwards to remote servers"],["@@server:514","rsyslog forwarding over TCP (@ is UDP)"],["/var/log/secure or auth.log","Authentication and sudo events"],["/var/log/messages or syslog","General system log"],["Severity order","emerg alert crit err warning notice info debug (0-7)"],["logger","Write a message to the system log from a script"],["logrotate","Rotates, compresses and removes old logs"],["timedatectl","Show and set time zone and NTP state"],["chronyc sources","Show NTP servers and sync state"],["hwclock","Read or set the hardware clock"]],
 ctr:[["Container","Isolated process sharing the host kernel"],["Namespaces","Give a container its own PIDs, network, mounts and hostname"],["cgroups","Limit a container's CPU and memory"],["Image","Read-only layered template for containers"],["Registry","Server that stores images (docker.io, quay.io)"],["Podman","Daemonless, rootless-by-default container engine"],["docker group","Membership is effectively root on the host"],["-p 8080:80","Publish host port 8080 to container port 80"],["-v /host:/ctr:Z","Bind mount relabeled for SELinux"],["Named volume","Engine-managed persistent storage"],["podman exec -it","Run a command inside a running container"],["podman logs","Show a container's output"],["Containerfile / Dockerfile","Instructions to build an image"],["FROM","Base image line in a Containerfile"],["Compose","YAML describing multi-container applications"],["Quadlet","Podman container defined as a systemd unit file"],["loginctl enable-linger","Let a user's services run without a login"],["Rootless port limit","Normal users can't publish ports below 1024"],["Kubernetes pod","Smallest deployable unit; one or more containers"],["kubectl","Kubernetes command-line client"]]
};
const DECKS=[["files","Files and links"],["perms","Permissions"],["users","Users and groups"],["procs","Processes"],["pkg","Packages"],["systemd","Services and scheduling"],["logs","Logging and time"],["ctr","Containers"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which copy command preserves ownership, permissions and timestamps?",o:["cp -a","cp -r","cp -f","cp -u"],a:0,e:"-a is archive mode."},
 {q:"A symbolic link points to /opt/app/v2. You delete /opt/app/v2. What happens to the link?",o:["It dangles (broken)","It's deleted automatically","It now holds the data","It points to v1"],a:0,e:"Soft links only store a path."},
 {q:"Why can't you hard-link /etc/hosts into /home on a separate filesystem?",o:["Hard links can't cross filesystems","Hard links need root","/etc is read-only","Only directories can be hard-linked"],a:0,e:"A hard link is a directory entry for an inode on the same filesystem."},
 {q:"Which finds files over 1 GB under /home?",o:["find /home -size +1G","find /home -size 1G+","locate -size 1G /home","find /home -big 1G"],a:0,e:"+ means greater than."},
 {q:"locate can't find a file you created a minute ago. Why?",o:["Its database hasn't been refreshed with updatedb","locate only searches /usr","The file is hidden","locate needs root"],a:0,e:"locate searches a periodic index."},
 {q:"Which permissions does chmod 640 set?",o:["rw-r-----","rwxr-----","rw-rw----","r--r-----"],a:0,e:"6=rw-, 4=r--, 0=---."},
 {q:"A user can list a directory but can't cd into it. Which bit is missing?",o:["x","r","w","t"],a:0,e:"Execute on a directory allows entering it."},
 {q:"With umask 027, what mode does a new directory get?",o:["750","755","770","640"],a:0,e:"777 minus 027."},
 {q:"Why does /usr/bin/passwd have the SUID bit?",o:["It must run as root to update /etc/shadow","So only root can run it","To make it immutable","To log its use"],a:0,e:"SUID runs with the owner's privileges."},
 {q:"New files in /srv/projects should automatically belong to the projects group. What do you set?",o:["SGID on the directory","SUID on the directory","Sticky bit","umask 002"],a:0,e:"chmod g+s."},
 {q:"Users in a shared directory keep deleting each other's files. What stops it?",o:["The sticky bit","SGID","An ACL mask","chattr +a"],a:0,e:"Like /tmp."},
 {q:"ls -l shows rwSr--r--. What does the capital S mean?",o:["SUID is set but owner execute is not","The file is sparse","SELinux is enforcing","The file is a socket"],a:0,e:"Lowercase s means both are set."},
 {q:"How do you give user eli read and write on one file without changing its group?",o:["setfacl -m u:eli:rw file","chmod o+rw file","chown eli file","usermod -aG eli file"],a:0,e:"ACLs add specific users."},
 {q:"Even root can't delete a log file, and lsattr shows ----i----. Why?",o:["It's immutable; remove with chattr -i","SELinux denies it for every user, including root","The disk is full","It has an ACL"],a:0,e:"The i attribute blocks all changes."},
 {q:"Which file stores password hashes?",o:["/etc/shadow","/etc/passwd","/etc/group","/etc/login.defs"],a:0,e:"passwd shows x in that field."},
 {q:"What does the third field in /etc/passwd hold?",o:["UID","GID","Home directory","Shell"],a:0,e:"name:x:UID:GID:comment:home:shell."},
 {q:"You ran usermod -G docker dana and now dana lost wheel access. Why?",o:["-G without -a replaced her supplementary groups","docker removes wheel","usermod requires a reboot","wheel is primary"],a:0,e:"Always use -aG."},
 {q:"Which command creates a user with a home directory populated from /etc/skel?",o:["useradd -m","useradd -M","usermod -m","adduser -r"],a:0,e:"-m makes the home."},
 {q:"Which forces dana to change her password every 60 days?",o:["chage -M 60 dana","passwd -n 60 dana","usermod -e 60 dana","chage -E 60 dana"],a:0,e:"-M is maximum age; -E is account expiry."},
 {q:"A service account should never log in interactively. Which shell?",o:["/sbin/nologin","/bin/bash","/bin/sh","/usr/bin/sudo"],a:0,e:"/bin/false also works."},
 {q:"Which command deletes a user and their home directory?",o:["userdel -r","userdel","deluser --keep-home","usermod -L"],a:0,e:"-r removes the home and spool."},
 {q:"Which shows failed login attempts?",o:["lastb","last","who","w"],a:0,e:"It reads /var/log/btmp."},
 {q:"Which signal does kill send by default?",o:["SIGTERM (15)","SIGKILL (9)","SIGHUP (1)","SIGINT (2)"],a:0,e:"A polite request."},
 {q:"A process ignores SIGTERM. What ends it without cleanup?",o:["kill -9","kill -1","kill -18","kill -15 twice"],a:0,e:"SIGKILL can't be caught."},
 {q:"Which signal makes many daemons reload their configuration?",o:["SIGHUP","SIGKILL","SIGSTOP","SIGCONT"],a:0,e:"Signal 1."},
 {q:"A process shows state Z in ps. What is it?",o:["A zombie waiting for its parent to reap it","A sleeping process waiting on a timer","A process in I/O wait","A stopped job"],a:0,e:"Killing the parent clears it."},
 {q:"Which nice value gives the lowest priority?",o:["19","-20","0","10"],a:0,e:"Higher niceness is nicer to others."},
 {q:"You started a long job, pressed Ctrl+Z, and want it to keep running in the background. What next?",o:["bg","fg","kill -STOP","nohup"],a:0,e:"bg continues the stopped job."},
 {q:"Which command shows the processes using the most CPU first?",o:["ps aux --sort=-%cpu","ps -ef --forest","pstree -p","pidof cpu"],a:0,e:"top sorted by P also works."},
 {q:"Which command shows which installed package owns /etc/ssh/sshd_config on RHEL?",o:["rpm -qf /etc/ssh/sshd_config","rpm -ql sshd_config","dnf owner sshd_config","dpkg -S /etc/ssh/sshd_config"],a:0,e:"dpkg -S is the Debian version."},
 {q:"On Ubuntu, apt install says the package can't be found, though it exists. What's the likely fix?",o:["Run apt update first","Run apt upgrade","Reboot","Use dpkg -i"],a:0,e:"The package lists are stale."},
 {q:"Which removes a Debian package and its configuration files?",o:["apt purge","apt remove","apt autoremove","dpkg --unpack"],a:0,e:"remove keeps config."},
 {q:"Where are RHEL repository definitions stored?",o:["/etc/yum.repos.d/","/etc/apt/sources.list","/var/lib/rpm","/etc/dnf/plugins"],a:0,e:".repo files."},
 {q:"An update broke an app. Which undoes the last dnf transaction?",o:["dnf history undo last","dnf downgrade all","rpm --rollback","dnf clean all"],a:0,e:"dnf keeps a transaction history."},
 {q:"Why prefer dnf install ./x.rpm over rpm -ivh x.rpm?",o:["dnf resolves dependencies from repositories","rpm can't install local files","dnf is faster","rpm doesn't verify signatures"],a:0,e:"rpm doesn't fetch dependencies."},
 {q:"In a source build, what does ./configure do?",o:["Checks dependencies and generates the Makefile","Compiles the code and links the binary in one step","Installs the binary","Downloads the source"],a:0,e:"make compiles; make install installs."},
 {q:"A newly compiled program can't find libfoo.so in /opt/foo/lib. What fixes it system-wide?",o:["Add the path to /etc/ld.so.conf.d/ and run ldconfig","Run ldd on the program and then chmod +x every listed library","chmod +x the library","Set PATH"],a:0,e:"The dynamic linker cache."},
 {q:"You need nginx to start now and at every boot.",o:["systemctl enable --now nginx","systemctl start nginx","systemctl enable nginx","systemctl unmask nginx"],a:0,e:"enable alone waits for the next boot."},
 {q:"You edited a unit file in /etc/systemd/system. What must you run?",o:["systemctl daemon-reload","systemctl reboot","systemctl reset-failed","systemctl preset"],a:0,e:"systemd caches unit files."},
 {q:"How do you change one setting of a packaged unit so updates don't overwrite it?",o:["systemctl edit unit (a drop-in in /etc/systemd/system/unit.d/)","Edit /usr/lib/systemd/system/unit","Copy the binary","Change /etc/default/unit only"],a:0,e:"Drop-ins override specific lines."},
 {q:"Which prevents a service from being started even manually or as a dependency?",o:["systemctl mask","systemctl disable","systemctl stop","systemctl isolate"],a:0,e:"It links the unit to /dev/null."},
 {q:"Which service Type runs a script to completion and then is considered done?",o:["oneshot","simple","forking","notify"],a:0,e:"Typical for timers."},
 {q:"What does '*/10 * * * *' mean in cron?",o:["Every 10 minutes","At 10 minutes past each hour","Every 10 hours","On the 10th of each month"],a:0,e:"Step values."},
 {q:"Which cron line runs at 23:45 every Friday?",o:["45 23 * * 5","23 45 * * 5","45 23 5 * *","* 23 45 * 5"],a:0,e:"minute hour dom month dow."},
 {q:"A laptop is off at 03:00 when a nightly systemd timer should fire. What makes it run at next boot?",o:["Persistent=true","OnBootSec=","RemainAfterExit=","WantedBy=timers.target"],a:0,e:"Persistent catches up missed runs."},
 {q:"Which command shows errors from the previous boot?",o:["journalctl -b -1 -p err","journalctl -k","dmesg -1","journalctl --vacuum"],a:0,e:"-b -1 is the previous boot."},
 {q:"Journal entries vanish after every reboot. Why?",o:["The journal is volatile; create /var/log/journal or set Storage=persistent","rsyslog deletes the journal files when it starts, so set ForwardToSyslog=no","logrotate runs at boot","SELinux blocks /var/log"],a:0,e:"/run is a tmpfs."},
 {q:"On RHEL, where are SSH and sudo authentication messages written?",o:["/var/log/secure","/var/log/messages only","/var/log/auth.log","/var/log/sudo"],a:0,e:"Debian uses auth.log."},
 {q:"Which severity is more severe than warning?",o:["err","notice","info","debug"],a:0,e:"emerg alert crit err warning notice info debug."},
 {q:"Which rsyslog line forwards everything to a log server over TCP?",o:["*.* @@logs.example.lan:514","*.* @logs.example.lan:514","*.* tcp://logs:514","forward all logs"],a:0,e:"@@ is TCP; @ is UDP."},
 {q:"Which command shows whether chrony is synchronized and to which source?",o:["chronyc sources -v","timedatectl set-ntp","hwclock -r","date -s"],a:0,e:"chronyc tracking shows offset too."},
 {q:"What isolates a container's view of processes and network?",o:["Namespaces","cgroups","SELinux","Images"],a:0,e:"cgroups limit resources."},
 {q:"A rootless Podman user gets 'cannot expose privileged port 80'. What's the simplest fix?",o:["Publish a port above 1024, like -p 8080:80","Add the user to the wheel group and retry","Use --privileged","Disable SELinux"],a:0,e:"Unprivileged users can't bind below 1024 by default."},
 {q:"A container gets permission denied reading a bind-mounted directory on an SELinux host. Which option fixes it?",o:[":Z on the volume","--privileged","chmod 777","-p 80:80"],a:0,e:"Relabels the content for the container."},
 {q:"Why is adding a user to the docker group risky?",o:["It gives effectively root access to the host","It exposes the Docker API on TCP port 2375","It disables SELinux","It removes sudo"],a:0,e:"They can mount / into a container."},
 {q:"Which keeps a database container's data when the container is removed?",o:["A named volume","The writable layer","--rm","An image tag"],a:0,e:"Containers are disposable; volumes persist."},
 {q:"Which makes a user's Podman service start at boot without that user logging in?",o:["loginctl enable-linger user","systemctl enable podman","podman --restart","usermod -aG podman"],a:0,e:"User managers run only during sessions otherwise."}
];

/* ---------- custom diagram: permission calculator ---------- */
function permCalc(el){const C=[["user","u"],["group","g"],["others","o"]];let bits=0o644;let goal=0;
  const GOALS=[[0o755,"a script anyone may run but only the owner may change"],[0o640,"a config file the owner edits, the group reads, others can't see"],[0o700,"a private directory only the owner can use"],[0o2770,"a team directory where new files get the group"],[0o1777,"a public scratch area like /tmp"],[0o4755,"a program that runs as its owner (like passwd)"]];
  const sym=m=>{const r=(b,s,ch)=>(m&b?"r":"-")+(m&(b>>1)?"w":"-")+(m&(b>>2)?(m&s?ch:"x"):(m&s?ch.toUpperCase():"-"));return r(0o400,0o4000,"s")+r(0o40,0o2000,"s")+r(0o4,0o1000,"t")};
  const draw=msg=>{el.innerHTML=`<div class="viz-title">Permission calculator</div>
    <div class="pc-grid">${C.map(([n,k],i)=>`<div class="pc-row"><b>${n}</b>${["r","w","x"].map((p,j)=>{const b=1<<(8-i*3-j);return `<button class="chip" aria-pressed="${!!(bits&b)}" data-b="${b}">${p}</button>`}).join("")}</div>`).join("")}
    <div class="pc-row"><b>special</b>${[[0o4000,"SUID"],[0o2000,"SGID"],[0o1000,"sticky"]].map(([b,l])=>`<button class="chip" aria-pressed="${!!(bits&b)}" data-b="${b}">${l}</button>`).join("")}</div></div>
    <div class="pc-out"><span class="mono">${(bits>0o777?bits.toString(8).padStart(4,"0"):bits.toString(8).padStart(3,"0"))}</span><span class="mono">-${sym(bits)}</span><span class="mono s-small">chmod ${bits.toString(8)} file</span></div>
    <div class="caption" aria-live="polite">${msg||""} <b>Challenge ${goal+1} of ${GOALS.length}:</b> set the mode for ${GOALS[goal][1]}.</div>
    <div class="viz-controls"><button class="btn primary" data-a="check">Check</button><span class="grow"></span></div>`};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-b]");const a=e.target.closest("[data-a]");if(b){bits^=+b.dataset.b;draw();return}
    if(a){if(bits===GOALS[goal][0]){goal++;if(goal>=GOALS.length){award("viz:permcalc",20,"Mastered the permission calculator");goal=0;draw(`<span class="status-good">All six done.</span> Play on if you like.`)}else draw(`<span class="status-good">Correct: ${bits.toString(8)}.</span>`)}else draw(`<span class="status-bad">Not yet.</span> You have ${bits.toString(8)}.`)}});
  draw()}
/* ---------- custom diagram: cron expression builder ---------- */
function cronViz(el){const F=["minute","hour","day of month","month","day of week"];let v=["*","*","*","*","*"];let goal=0;
  const GOALS=[["30 2 * * 1-5","at 02:30 Monday to Friday"],["*/15 * * * *","every 15 minutes"],["0 0 1 * *","at midnight on the 1st of every month"],["0 18 * * 5","at 18:00 every Friday"],["0 */6 * * *","every 6 hours on the hour"]];
  const DOW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const say=()=>{const [m,h,d,mo,w]=v;let s="Runs ";const t=(m==="*"&&h==="*")?"every minute":/^\*\/\d+$/.test(m)&&h==="*"?`every ${m.slice(2)} minutes`:/^\d+$/.test(m)&&/^\*\/\d+$/.test(h)?`at minute ${m} of every ${h.slice(2)} hours`:/^\d+$/.test(m)&&/^\d+$/.test(h)?`at ${h.padStart(2,"0")}:${m.padStart(2,"0")}`:/^\d+$/.test(m)&&h==="*"?`at minute ${m} of every hour`:`at minute ${m}, hour ${h}`;s+=t;
    if(d!=="*")s+=`, on day ${d} of the month`;if(mo!=="*")s+=`, in month ${mo}`;if(w!=="*")s+=", on "+w.replace(/\d/g,c=>DOW[+c]).replace("-"," to ").replace(/,/g," and ");return s};
  const draw=msg=>{el.innerHTML=`<div class="viz-title">Cron expression builder</div><div class="cron-f">${F.map((f,i)=>`<label><span class="s-small">${f}</span><input class="mono" data-i="${i}" value="${v[i]}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`).join("")}</div>
    <div class="pc-out"><span class="mono">${v.join(" ")} /usr/local/bin/job.sh</span></div><div class="caption cron-say" aria-live="polite">${say()}.</div>
    <div class="caption">${msg||""} <b>Challenge ${goal+1} of ${GOALS.length}:</b> run a job ${GOALS[goal][1]}.</div><div class="viz-controls"><button class="btn primary" data-a="check">Check</button></div>`};
  el.addEventListener("input",e=>{const i=e.target.dataset.i;if(i==null)return;v[+i]=e.target.value.trim()||"*";$(".pc-out .mono",el).textContent=v.join(" ")+" /usr/local/bin/job.sh";$(".cron-say",el).textContent=say()+"."});
  el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;const norm=s=>s.replace(/mon/i,"1").replace(/fri/i,"5");if(v.map(norm).join(" ")===GOALS[goal][0]){goal++;if(goal>=GOALS.length){award("viz:cron",20,"Built every cron schedule");goal=0;draw(`<span class="status-good">All five built.</span>`)}else draw(`<span class="status-good">Correct.</span>`)}else draw(`<span class="status-bad">Not quite.</span> Remember the order: minute, hour, day of month, month, day of week.`)});
  draw()}

registerModule({
  id:"svc",slug:"services",title:"Services and User Management",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,labs:LABS,
  vizKeys:["links","findq","fileslab","permcalc","special","permlab","passwd","userq","signals","proclab","pkgsort","pkglab","unit","cron","cronlab","sev","logslab","vmctr","ctrq","ctrlab"],
  viz(){
revealViz($("#viz-links"),{title:"Hard link or symbolic link?",cols:2,done:"Compared link types",items:[
  ["Hard link","ln a b","Both names point at the same inode; ls -li shows the same number and a link count of 2. Delete either name and the data survives through the other."],
  ["Symbolic link","ln -s a b","b is a tiny file containing the path a. ls -l shows b -> a. Delete a and b dangles."],
  ["Crossing filesystems","which works?","Only symbolic links. Inode numbers are per filesystem."],
  ["Linking directories","which works?","Only symbolic links (hard-linked directories would create loops). Release switching like /opt/app/current -> releases/v2.4 uses symlinks."]]});
quizViz($("#viz-findq"),{title:"Which find command?",done:"Picked the right find every time",qs:[
  ["Files in /home owned by eli",["find /home -user eli","find /home -name eli","find /home -group eli","find -owner eli /home"],0,"-user matches the owner."],
  ["Files under /var/log changed in the last 24 hours",["find /var/log -mtime -1","find /var/log -mtime +1","find /var/log -atime 1","find /var/log -newer 1"],0,"-1 means less than one day."],
  ["Every SUID program on the system",["find / -perm -4000 -type f","find / -suid","find / -perm 777","find / -type s"],0,"-perm -4000 means the bit is set."],
  ["Delete .tmp files older than 7 days in /data",["find /data -name '*.tmp' -mtime +7 -delete","rm -rf /data/*.tmp","find /data -tmp 7","locate .tmp | rm"],0,"Test without -delete first."],
  ["Empty directories under /srv",["find /srv -type d -empty","find /srv -size 0","ls -R /srv | grep empty","find /srv -empty -type f"],0,"-type d -empty."]]});
shellViz($("#viz-fileslab"),LABS.files,"fileslab");
permCalc($("#viz-permcalc"));
sortViz($("#viz-special"),{title:"Which special bit or attribute?",bins:{suid:"SUID",sgid:"SGID",sticky:"Sticky bit",acl:"ACL",immut:"chattr +i"},
  items:[["passwd must update /etc/shadow when a user runs it","suid","Runs as its owner, root."],["Files created in /srv/marketing should belong to the marketing group","sgid","Group inheritance."],["Users in /tmp mustn't delete each other's files","sticky","Owner-only deletion."],["Give one auditor read access without changing the group","acl","Named user entry."],["Prevent anyone, even root, from changing /etc/resolv.conf","immut","Until chattr -i."],["New files in a project should automatically grant the qa group rw","acl","A default ACL."]],done:"Matched every special permission"});
shellViz($("#viz-permlab"),LABS.perms,"permlab");
stepViz($("#viz-passwd"),{title:"Read an /etc/passwd line",done:"Decoded /etc/passwd",steps:[
  ["The line","<code>dana:x:1001:1001:Dana Ops:/home/dana:/bin/bash</code>"],["Name","dana is the login name."],["Password field","x means the hash is in /etc/shadow, readable only by root."],["UID","1001, a regular user (1000 and up). UID 0 is root, whatever the name."],["GID","1001, dana's primary group. Supplementary groups are in /etc/group."],["Comment (GECOS)","Full name or description."],["Home","/home/dana, created from /etc/skel with useradd -m."],["Shell","/bin/bash. Service accounts get /sbin/nologin."]],
  end:"A second account with UID 0 is a classic backdoor: audit with awk -F: '$3==0' /etc/passwd."});
quizViz($("#viz-userq"),{title:"Users and groups in practice",done:"Handled every account request",qs:[
  ["Add eli to the docker group without touching his other groups",["usermod -aG docker eli","usermod -G docker eli","groupadd docker eli","useradd -G docker eli"],0,"-a appends."],
  ["A contractor's account must stop working on 2026-12-31",["chage -E 2026-12-31 contractor","chage -M 2026-12-31 contractor","passwd -l contractor","userdel contractor"],0,"-E sets account expiry."],
  ["Temporarily block a user without deleting anything",["usermod -L user (or passwd -l)","userdel user","chmod 000 /home/user","rm /etc/shadow"],0,"Unlock with -U."],
  ["Which groups is dana in?",["id dana","whoami dana","last dana","chage -l dana"],0,"groups dana also works."],
  ["A new service needs an account that can't log in",["useradd -r -s /sbin/nologin svc","useradd -m svc","adduser --admin svc","useradd -G wheel svc"],0,"-r makes a system account."]]});
sortViz($("#viz-signals"),{title:"Pick the signal",bins:{term:"SIGTERM (15)",kill:"SIGKILL (9)",hup:"SIGHUP (1)",stop:"SIGSTOP / SIGTSTP",cont:"SIGCONT (18)"},
  items:[["Ask a process to exit cleanly","term","The default for kill."],["A hung process ignores everything else","kill","Can't be caught."],["Make nginx reread its config without dropping connections","hup","Many daemons reload on HUP."],["Pause a job (what Ctrl+Z sends)","stop","SIGTSTP from the keyboard."],["Resume a paused job","cont","bg and fg send it."]],done:"Matched every signal"});
shellViz($("#viz-proclab"),LABS.proc,"proclab");
sortViz($("#viz-pkgsort"),{title:"RPM world or Debian world?",bins:{rpm:"RHEL family",deb:"Debian family",both:"Both"},
  items:[["dnf install","rpm","Also yum on older systems."],["apt update && apt upgrade","deb","update refreshes lists."],["rpm -qf /path","rpm","Owner of a file."],["dpkg -L pkg","deb","Files in a package."],["/etc/yum.repos.d/","rpm","Repo files."],["/etc/apt/sources.list.d/","deb","Repo files."],["Packages signed with GPG keys","both","Both verify signatures."],["Flatpak apps","both","Distribution-neutral."]],done:"Sorted the package tools"});
shellViz($("#viz-pkglab"),LABS.pkg,"pkglab");
stepViz($("#viz-unit"),{title:"Anatomy of a service unit",done:"Read a unit file",steps:[
  ["[Unit] Description","Shown in systemctl status and the journal."],["After= / Wants=","After orders startup (start after the network). Wants pulls the other unit in. Requires= fails if it fails."],["[Service] Type","simple: ExecStart is the main process. forking: it daemonizes. oneshot: runs and exits. notify: tells systemd when ready."],["User= / Environment=","Run as an unprivileged account with settings in the environment."],["ExecStart / ExecReload","The commands to start and reload."],["Restart=on-failure","Restart if it crashes. RestartSec= adds a delay."],["[Install] WantedBy","multi-user.target: enable links it so it starts with that target at boot."]],
  end:"Put it in /etc/systemd/system/, run daemon-reload, then enable --now."});
cronViz($("#viz-cron"));
shellViz($("#viz-cronlab"),LABS.cron,"cronlab");
quizViz($("#viz-sev"),{title:"Log severity and location",done:"Placed every log message",qs:[
  ["Which is most severe?",["crit","err","warning","notice"],0,"emerg, alert, crit, err, warning, notice, info, debug."],
  ["Where do you look for sudo use on Ubuntu?",["/var/log/auth.log","/var/log/messages","/var/log/dpkg.log","/var/log/kern.log"],0,"RHEL uses /var/log/secure."],
  ["journalctl -p warning shows which levels?",["warning and everything more severe","warning only","warning and less severe","all levels"],0,"The level and above."],
  ["Logs fill /var. Which tool should be compressing and deleting old ones?",["logrotate","journald","cron.deny","tmpfiles"],0,"Check /etc/logrotate.d/."],
  ["SELinux denials are recorded in",["/var/log/audit/audit.log","/var/log/selinux","/var/log/secure only","dmesg only"],0,"Search them with ausearch -m AVC."]]});
shellViz($("#viz-logslab"),LABS.logs,"logslab");
revealViz($("#viz-vmctr"),{title:"VMs versus containers",cols:2,done:"Compared VMs and containers",items:[
  ["Kernel","shared?","A VM boots its own kernel on virtual hardware. A container shares the host's kernel, so a Linux host runs Linux containers."],
  ["Start time and size","speed","VMs take tens of seconds and gigabytes. Containers start in milliseconds and images are often megabytes."],
  ["Isolation","security","VMs have a strong hardware boundary. Containers rely on namespaces, cgroups, seccomp and SELinux/AppArmor; a kernel bug affects all of them."],
  ["Best for","use","VMs: different OSes, strong tenant isolation. Containers: packaging apps and microservices consistently from laptop to production."]]});
quizViz($("#viz-ctrq"),{title:"Container commands",done:"Answered every container question",qs:[
  ["Run nginx in the background with host port 8080 mapped to 80",["podman run -d -p 8080:80 nginx","podman run -p 80:8080 nginx","podman start nginx 8080","podman exec -d nginx"],0,"host:container."],
  ["Open a shell inside the running container 'web'",["podman exec -it web bash","podman run -it web bash","podman attach web --shell","podman logs -it web"],0,"exec runs in an existing container."],
  ["See why container 'db' exited immediately",["podman logs db","podman ps","podman images","podman pull db"],0,"Often a missing environment variable."],
  ["Remove all stopped containers",["podman container prune","podman rmi -a","podman stop -a","podman system reset"],0,"rmi removes images."],
  ["Build an image tagged myapp:1.0 from the Containerfile here",["podman build -t myapp:1.0 .","podman commit myapp","podman create myapp:1.0","podman tag . myapp"],0,"The dot is the build context."]]});
shellViz($("#viz-ctrlab"),LABS.ctr,"ctrlab");
  },
  sims:[
    {id:"onboard",type:"shell",title:"Onboard a new team",lab:{world:{users:["dana"]},
      scenario:"Two developers join: priya and marco. Create the group developers, create both accounts in it with home directories and bash, make priya an administrator through the wheel group, require password changes every 90 days, and set up /srv/dev so the team shares files there. Also, dana left the company: lock her account but keep her files.",
      tasks:[{t:"Create the group developers",hint:"sudo groupadd developers",check:w=>!!w.groups.developers},
        {t:"Create priya and marco with home directories, bash, and developers as a supplementary group",hint:"sudo useradd -m -s /bin/bash -G developers priya\nsudo useradd -m -s /bin/bash -G developers marco",check:w=>["priya","marco"].every(u=>w.users[u]&&inGroup(w,u,"developers")&&has(w,"/home/"+u)&&/bash/.test(w.users[u].shell))},
        {t:"Add priya to wheel without removing her other groups",hint:"sudo usermod -aG wheel priya",check:w=>inGroup(w,"priya","wheel")&&inGroup(w,"priya","developers")},
        {t:"Set a 90-day maximum password age for both",hint:"sudo chage -M 90 priya\nsudo chage -M 90 marco",check:w=>w.users.priya&&w.users.marco&&w.users.priya.maxd===90&&w.users.marco.maxd===90},
        {t:"Create /srv/dev owned by group developers with mode 2770",hint:"sudo mkdir /srv/dev\nsudo chgrp developers /srv/dev\nsudo chmod 2770 /srv/dev",check:w=>{const n=node(w,"/srv/dev");return !!n&&w.groups.developers&&n.gid===w.groups.developers.gid&&(n.mode&0o7777)===0o2770}},
        {t:"Lock dana's account without deleting her home directory",hint:"sudo usermod -L dana",check:w=>w.users.dana&&(w.users.dana.locked||/^!/.test(w.users.dana.pw||""))&&has(w,"/home/dana")}],
      solution:"sudo groupadd developers\nsudo useradd -m -s /bin/bash -G developers priya\nsudo useradd -m -s /bin/bash -G developers marco\nsudo usermod -aG wheel priya\nsudo chage -M 90 priya\nsudo chage -M 90 marco\nsudo mkdir /srv/dev\nsudo chgrp developers /srv/dev\nsudo chmod 2770 /srv/dev\nsudo usermod -L dana\nid priya; ls -ld /srv/dev",
      success:"Group first, users with -m and -G, -aG to append, chage for aging, SGID for the shared directory, and a lock rather than a delete for the leaver."}},
    {id:"timer",type:"shell",title:"Replace a cron job with a systemd timer",lab:{
      setup:w=>R(w,"mkdir -p /backup"),
      scenario:"Write a script that archives /etc to /backup, a oneshot service that runs it, and a timer that fires daily at 02:30 and catches up after downtime. Enable the timer and run the service once to prove it works.",
      tasks:[{t:"Create the executable script /usr/local/bin/etc-backup.sh that runs tar to /backup",hint:"printf '#!/bin/bash\\ntar -czf /backup/etc-$(date +%%F).tar.gz /etc\\n' | sudo tee /usr/local/bin/etc-backup.sh\nsudo chmod 755 /usr/local/bin/etc-backup.sh",check:w=>{const n=node(w,"/usr/local/bin/etc-backup.sh");return !!n&&!!(n.mode&0o100)&&/tar\s/.test(n.c||"")}},
        {t:"Create /etc/systemd/system/etc-backup.service with Type=oneshot running the script",hint:"sudo vim /etc/systemd/system/etc-backup.service\n  [Unit]\n  Description=Back up /etc\n  [Service]\n  Type=oneshot\n  ExecStart=/usr/local/bin/etc-backup.sh",check:w=>/Type\s*=\s*oneshot/.test(LX.read(w,"/etc/systemd/system/etc-backup.service")||"")&&/ExecStart\s*=\s*\/usr\/local\/bin\/etc-backup\.sh/.test(LX.read(w,"/etc/systemd/system/etc-backup.service")||"")},
        {t:"Create etc-backup.timer: OnCalendar daily at 02:30, Persistent=true, WantedBy=timers.target",hint:"sudo vim /etc/systemd/system/etc-backup.timer\n  [Timer]\n  OnCalendar=*-*-* 02:30:00\n  Persistent=true\n  [Install]\n  WantedBy=timers.target",check:w=>{const c=LX.read(w,"/etc/systemd/system/etc-backup.timer")||"";return /OnCalendar\s*=\s*(\*-\*-\*\s+)?0?2:30(:00)?\s*$/m.test(c)&&/Persistent\s*=\s*true/.test(c)&&/WantedBy\s*=\s*timers\.target/.test(c)}},
        {t:"Reload systemd and enable the timer now",hint:"sudo systemctl daemon-reload\nsudo systemctl enable --now etc-backup.timer",check:w=>!!(w.timers&&w.timers["etc-backup"]&&w.timers["etc-backup"].enabled&&w.timers["etc-backup"].active)},
        {t:"Run the service once and check that an archive appeared in /backup",hint:"sudo systemctl start etc-backup.service\nls /backup",check:w=>Object.keys(node(w,"/backup")?.k||{}).some(f=>/\.(tar\.gz|tgz)$/.test(f))}],
      solution:"printf '#!/bin/bash\\ntar -czf /backup/etc-$(date +%%F).tar.gz /etc\\n' | sudo tee /usr/local/bin/etc-backup.sh\nsudo chmod 755 /usr/local/bin/etc-backup.sh\nprintf '[Unit]\\nDescription=Back up /etc\\n\\n[Service]\\nType=oneshot\\nExecStart=/usr/local/bin/etc-backup.sh\\n' | sudo tee /etc/systemd/system/etc-backup.service\nprintf '[Unit]\\nDescription=Daily /etc backup\\n\\n[Timer]\\nOnCalendar=*-*-* 02:30:00\\nPersistent=true\\n\\n[Install]\\nWantedBy=timers.target\\n' | sudo tee /etc/systemd/system/etc-backup.timer\nsudo systemctl daemon-reload\nsudo systemctl enable --now etc-backup.timer\nsystemctl list-timers\nsudo systemctl start etc-backup.service\nls /backup",
      success:"Unlike cron, the timer logs every run to the journal, catches up missed runs, and can be checked with systemctl list-timers."}},
    {id:"rootless",type:"shell",title:"Run a website in a rootless container",lab:{world:{pkgs:["podman"],files:{"/home/admin/site/index.html":{c:"<h1>Team wiki</h1>\n",owner:"admin:admin"}}},
      scenario:"Serve ~/site with nginx in a rootless Podman container named wiki on port 8080. SELinux is enforcing. Then make it start at boot as a user service.",
      tasks:[{t:"Run nginx detached as wiki, port 8080 to 80, with ~/site mounted read-only on /usr/share/nginx/html",hint:"podman run -d --name wiki -p 8080:80 -v ~/site:/usr/share/nginx/html:ro nginx",check:w=>w.ctrs.some(c=>c.name==="wiki"&&c.state==="running"&&c.ports.some(p=>p.h===8080))},
        {t:"Make curl localhost:8080 return the Team wiki page (fix SELinux labeling if you get 403)",hint:"podman rm -f wiki\npodman run -d --name wiki -p 8080:80 -v ~/site:/usr/share/nginx/html:ro,Z nginx\ncurl localhost:8080",check:w=>/Team wiki/.test((LX.httpGet(w,"localhost",8080,"/")||{}).body||"")},
        {t:"Write a Quadlet file ~/.config/containers/systemd/wiki.container with Image, PublishPort and Volume",hint:"mkdir -p ~/.config/containers/systemd\nvim ~/.config/containers/systemd/wiki.container\n  [Container]\n  Image=docker.io/library/nginx\n  PublishPort=8080:80\n  Volume=/home/admin/site:/usr/share/nginx/html:ro,Z\n  [Install]\n  WantedBy=default.target",check:w=>{const q=LX.quadlets(w,"admin").find(z=>z.name==="wiki");return !!q&&/nginx/.test(q.image||"")&&q.ports.some(p=>/8080:80/.test(p))&&q.vols.length>0}},
        {t:"Let admin's user services run without a login session",hint:"loginctl enable-linger admin",check:w=>!!(w.linger&&w.linger.has("admin"))}],
      solution:"podman run -d --name wiki -p 8080:80 -v ~/site:/usr/share/nginx/html:ro nginx\ncurl localhost:8080\npodman rm -f wiki\npodman run -d --name wiki -p 8080:80 -v ~/site:/usr/share/nginx/html:ro,Z nginx\ncurl localhost:8080\nmkdir -p ~/.config/containers/systemd\nprintf '[Container]\\nImage=docker.io/library/nginx\\nPublishPort=8080:80\\nVolume=/home/admin/site:/usr/share/nginx/html:ro,Z\\n\\n[Install]\\nWantedBy=default.target\\n' > ~/.config/containers/systemd/wiki.container\nloginctl enable-linger admin",
      success:"The :Z relabel is what SELinux needed. Quadlet plus linger turns a container into a proper service that starts at boot."}},
    {id:"permmatch",type:"match",title:"Match the octal mode",scenario:"Tap a mode, then the row whose ls -l string it produces.",
      items:[["755","a"],["644","b"],["600","c"],["750","d"],["4755","e"],["1777","f"],["2770","g"]],
      slots:[["a","-rwxr-xr-x"],["b","-rw-r--r--"],["c","-rw-------"],["d","-rwxr-x---"],["e","-rwsr-xr-x"],["f","drwxrwxrwt"],["g","drwxrws---"]],success:"4 read, 2 write, 1 execute, plus 4000 SUID, 2000 SGID and 1000 sticky."},
    {id:"svcorder",type:"order",title:"Deploy a new service the right way",scenario:"Put the steps in order for running a new in-house daemon under systemd.",
      steps:["Write /etc/systemd/system/report.service","Run systemctl daemon-reload","Run systemctl enable --now report","Check systemctl status report","Read journalctl -u report if it failed"],success:"Unit file, reload, enable and start, verify, then read the journal if anything's off."},
    {id:"pkgcall",type:"choice",title:"Patch a production server",scenario:"A critical OpenSSL fix is out. You manage a RHEL 9 web server.",
      steps:[["What do you check first?",["dnf check-update openssl (and the advisory)","Reboot","Remove openssl","rpm -e --nodeps openssl"],0,"Know what will change."],
        ["The server has a maintenance window tonight. What protects you if the update breaks the app?",["A snapshot or backup, and dnf history undo as a fallback","Nothing needed","Disable SELinux","Remove the repo"],0,"Plan the rollback before the change."],
        ["How do you apply just this update?",["dnf upgrade openssl","dnf install openssl --nogpgcheck","rpm -Uvh from a random website","yum remove openssl"],0,"From the signed repository."],
        ["Services still use the old library in memory. What's the fix?",["Restart the services that use it (or reboot)","Run ldconfig","Nothing, it's automatic","Run dnf clean all"],0,"Running processes keep the old library mapped. dnf needs-restarting lists them."],
        ["How do you confirm the fix is installed?",["rpm -q openssl and compare with the advisory","Look at the website","Check uptime","Run openssl genrsa"],0,"Verify the version."]],success:"Check, back up, update from signed repos, restart what uses it, verify."}
  ],
  badges:[
    ["reader","SVC","Service Scholar","Mark all 8 services and user lessons studied",c=>c.allStudied()],
    ["lab","DIA","Hands-On Admin","Complete all 20 diagrams and exercises in this module",c=>c.vizAll()],
    ["onboard","UID","Onboarding Pro","Pass the new team lab",c=>c.passed("onboard")],
    ["timer","⏱","Timekeeper","Replace cron with a systemd timer",c=>c.passed("timer")],
    ["ctr","CTR","Rootless","Run a rootless container as a service",c=>c.passed("rootless")],
    ["perm","755","chmod Master","Finish the permission calculator and the mode match",c=>c.earned("viz:permcalc")&&c.passed("permmatch")],
    ["kill","-15","Graceful Exit","Stop the runaway process without SIGKILL",c=>c.earned("viz:proclab")],
    ["perfect","100","PID 1","Score 100% on a services quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
