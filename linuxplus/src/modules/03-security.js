/* ================= Module 3: Security (XK0-006 Domain 3.0, 18%) ================= */
(function(){
const R=(w,...cmds)=>{const s=LX.session(w,"root");cmds.forEach(c=>LX.exec(s,c))};
const node=(w,p)=>LX.lookup(w,p);
const rd=(w,p)=>LX.read(w,p)||"";
const sshd=(w,k)=>{const m=rd(w,"/etc/ssh/sshd_config").match(new RegExp("^\\s*"+k+"\\s+(\\S+)","mi"));return m?m[1].toLowerCase():null};
const fwp=w=>(w.fw&&w.fw.perm)||{services:[],ports:[],rich:[]};
const fwr=w=>(w.fw&&w.fw.rt)||{services:[],ports:[],rich:[]};
const ANS={"continue connecting":"yes","password":"Passw0rd!","capital letters":"YES","passphrase":"Corr3ct-Horse-Battery"};
const LABS={
 ssh:{title:"Shell exercise: SSH keys instead of passwords",answers:ANS,
   scenario:"Create a key pair, install the public key on web01 (10.0.0.20, password Passw0rd!), and log in without a password.",
   tasks:[{t:"Generate an Ed25519 key pair",hint:"ssh-keygen -t ed25519\n(press Enter for the defaults, or add -N '' for no passphrase in this lab)",check:w=>!!node(w,"/home/admin/.ssh/id_ed25519")&&!!node(w,"/home/admin/.ssh/id_ed25519.pub")},
     {t:"Copy the public key to admin@web01",hint:"ssh-copy-id admin@10.0.0.20",check:w=>{const R=w.remotes.web01;return !!R&&(R.keys.admin||[]).length>0}},
     {t:"Run hostname on web01 over SSH, with no password prompt",hint:"ssh admin@10.0.0.20 hostname",check:(w,sh)=>LX.ran(sh,/^ssh\s+(admin@)?(10\.0\.0\.20|web01)\s+\S/),sticky:true},
     {t:"Check the private key's permissions (must be 600)",hint:"ls -l ~/.ssh",check:w=>{const n=node(w,"/home/admin/.ssh/id_ed25519");return !!n&&(n.mode&0o777)===0o600}}],
   solution:"ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519\nssh-copy-id admin@10.0.0.20\nssh admin@10.0.0.20 hostname\nls -l ~/.ssh"},
 sshd:{title:"Shell exercise: harden the SSH server",
   setup:w=>R(w,"mkdir -p /home/admin/.ssh","echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIadminkey admin@laptop' > /home/admin/.ssh/authorized_keys","chown -R admin:admin /home/admin/.ssh","chmod 700 /home/admin/.ssh","chmod 600 /home/admin/.ssh/authorized_keys"),
   scenario:"admin already has a key installed. Turn off root logins and password logins, validate the config, and reload sshd without dropping your session.",
   tasks:[{t:"Set PermitRootLogin no in /etc/ssh/sshd_config",hint:"sudo vim /etc/ssh/sshd_config\n(or sudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config)",check:w=>sshd(w,"PermitRootLogin")==="no"},
     {t:"Set PasswordAuthentication no",hint:"sudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config",check:w=>sshd(w,"PasswordAuthentication")==="no"},
     {t:"Test the configuration syntax",hint:"sudo sshd -t",check:(w,sh)=>LX.ran(sh,/sshd\s+-t/),sticky:true},
     {t:"Reload sshd",hint:"sudo systemctl reload sshd",check:(w,sh)=>LX.ran(sh,/systemctl\s+(reload|restart)\s+sshd/),sticky:true}],
   solution:"sudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\nsudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config\nsudo grep -E '^(PermitRootLogin|PasswordAuthentication)' /etc/ssh/sshd_config\nsudo sshd -t\nsudo systemctl reload sshd"},
 sudo:{title:"Shell exercise: least-privilege sudo",world:{users:["dana"],pkgs:["httpd"]},
   scenario:"dana should be able to restart the web server, and nothing else, as root. Use a drop-in file in /etc/sudoers.d, and always validate.",
   tasks:[{t:"Create /etc/sudoers.d/dana allowing dana to run only /usr/bin/systemctl restart httpd",hint:"sudo visudo -f /etc/sudoers.d/dana\n  dana ALL=(root) /usr/bin/systemctl restart httpd",check:w=>/^\s*dana\s+ALL\s*=\s*(\((root|ALL)\)\s*)?(NOPASSWD:\s*)?\/usr\/bin\/systemctl\s+restart\s+httpd(\.service)?\s*$/m.test(rd(w,"/etc/sudoers.d/dana"))},
     {t:"Validate all sudoers files",hint:"sudo visudo -c",check:(w,sh)=>LX.ran(sh,/visudo\s+-c/),sticky:true},
     {t:"List what dana may run",hint:"sudo -l -U dana",check:(w,sh)=>LX.ran(sh,/sudo\s+-l\s+-U\s+dana|sudo\s+-U\s+dana\s+-l/),sticky:true}],
   solution:"echo 'dana ALL=(root) /usr/bin/systemctl restart httpd' | sudo tee /etc/sudoers.d/dana\nsudo chmod 440 /etc/sudoers.d/dana\nsudo visudo -c\nsudo -l -U dana"},
 fw:{title:"Shell exercise: firewalld",world:{pkgs:["httpd"]},setup:w=>R(w,"systemctl enable --now httpd"),
   scenario:"A web server is running, but the firewall only allows SSH and cockpit. Open HTTP and HTTPS permanently, remove cockpit, and confirm.",
   tasks:[{t:"Allow the http and https services permanently",hint:"sudo firewall-cmd --permanent --add-service=http --add-service=https\n(or two separate commands)",check:w=>["http","https"].every(s=>fwp(w).services.includes(s))},
     {t:"Remove cockpit permanently",hint:"sudo firewall-cmd --permanent --remove-service=cockpit",check:w=>!fwp(w).services.includes("cockpit")},
     {t:"Load the permanent rules into the running firewall",hint:"sudo firewall-cmd --reload",check:w=>fwr(w).services.includes("http")&&!fwr(w).services.includes("cockpit")},
     {t:"List the active rules",hint:"sudo firewall-cmd --list-all",check:(w,sh)=>LX.ran(sh,/firewall-cmd\s+.*--list-(all|services)/),sticky:true}],
   solution:"sudo firewall-cmd --permanent --add-service=http\nsudo firewall-cmd --permanent --add-service=https\nsudo firewall-cmd --permanent --remove-service=cockpit\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-all"},
 selinux:{title:"Shell exercise: SELinux contexts",world:{pkgs:["httpd"]},
   setup:w=>{R(w,"systemctl enable --now httpd");const s=LX.session(w,"admin");LX.exec(s,"echo '<h1>Status page</h1>' > ~/index.html");R(w,"mv /home/admin/index.html /var/www/html/")},
   scenario:"Someone wrote index.html in their home directory and moved it into /var/www/html. The web server returns 403 Forbidden. Find out why and fix it without disabling SELinux.",
   tasks:[{t:"See the 403 for yourself",hint:"curl -I localhost",check:(w,sh)=>LX.ran(sh,/curl/),sticky:true},
     {t:"Look at the file's SELinux context",hint:"ls -Z /var/www/html",check:(w,sh)=>LX.ran(sh,/ls\s+.*-\w*Z|stat\s|matchpathcon/),sticky:true},
     {t:"Find the denial in the audit log",hint:"sudo ausearch -m AVC -ts recent\n(or sudo sealert -a /var/log/audit/audit.log)",check:(w,sh)=>LX.ran(sh,/ausearch|sealert|audit2why|grep.*(AVC|denied).*audit/),sticky:true},
     {t:"Restore the default context",hint:"sudo restorecon -Rv /var/www/html",check:w=>/httpd_sys_content_t/.test(node(w,"/var/www/html/index.html")?.ctx||"")},
     {t:"Confirm the page loads",hint:"curl localhost",check:(w,sh)=>LX.ran(sh,/curl/)&&/Status page/.test((LX.httpGet(w,"localhost",80,"/")||{}).body||""),sticky:true}],
   solution:"curl -I localhost\nls -Z /var/www/html\nsudo ausearch -m AVC -ts recent\nsudo restorecon -Rv /var/www/html\ncurl localhost"},
 crypt:{title:"Shell exercise: hashes, keys and certificates",
   scenario:"Use the everyday crypto tools: checksums, a random secret, and a self-signed certificate you inspect.",
   tasks:[{t:"Compute a SHA-256 checksum of /etc/hosts",hint:"sha256sum /etc/hosts",check:(w,sh)=>LX.ran(sh,/sha256sum|openssl\s+dgst/),sticky:true},
     {t:"Generate 16 random bytes as hex",hint:"openssl rand -hex 16",check:(w,sh)=>LX.ran(sh,/openssl\s+rand/),sticky:true},
     {t:"Create a self-signed certificate web.crt and key web.key valid 365 days for CN=web01",hint:"openssl req -x509 -newkey rsa:2048 -nodes -keyout web.key -out web.crt -days 365 -subj /CN=web01",check:w=>/CERT:.*web01/.test(rd(w,"/home/admin/web.crt"))&&!!node(w,"/home/admin/web.key")},
     {t:"Show the certificate's subject and expiry dates",hint:"openssl x509 -in web.crt -noout -subject -dates",check:(w,sh)=>LX.ran(sh,/openssl\s+x509.*-in/),sticky:true}],
   solution:"sha256sum /etc/hosts\nopenssl rand -hex 16\nopenssl req -x509 -newkey rsa:2048 -nodes -keyout web.key -out web.crt -days 365 -subj /CN=web01\nopenssl x509 -in web.crt -noout -subject -dates\nls -l web.*"},
 audit:{title:"Shell exercise: watch a file with auditd",world:{users:["dana"]},
   scenario:"Compliance wants a record of every change to /etc/passwd. Add an audit watch with a key, cause a change, and find it.",
   tasks:[{t:"Watch /etc/passwd for writes and attribute changes with key passwd_changes",hint:"sudo auditctl -w /etc/passwd -p wa -k passwd_changes",check:w=>(w.auditRules||[]).some(r=>/-w \/etc\/passwd -p \w*w\w* -k passwd_changes/.test(r))},
     {t:"Change an account (for example, set dana's shell to /bin/sh)",hint:"sudo usermod -s /bin/sh dana",check:w=>(w.auditEv||[]).some(e=>e.k==="passwd_changes")},
     {t:"Search the audit log by key",hint:"sudo ausearch -k passwd_changes",check:(w,sh)=>LX.ran(sh,/ausearch\s+.*-k\s+passwd_changes/),sticky:true}],
   solution:"sudo auditctl -w /etc/passwd -p wa -k passwd_changes\nsudo auditctl -l\nsudo usermod -s /bin/sh dana\nsudo ausearch -k passwd_changes"}
};

const LESSONS=[
{id:"auth",num:"3.1",title:"Authentication: PAM, password policy and directory services",html:`
<p><b>PAM</b> (Pluggable Authentication Modules) decides how programs like login, sshd and sudo check who you are. Each service has a file in <code>/etc/pam.d/</code> with lines of <b>type control module</b>:</p>
<pre class="term">auth     required    pam_faillock.so preauth
auth     sufficient  pam_unix.so
account  required    pam_unix.so
password requisite   pam_pwquality.so retry=3
session  required    pam_limits.so</pre>
<table><tr><th>Type</th><th>Job</th></tr><tr><td>auth</td><td>Prove identity (password, key, token)</td></tr><tr><td>account</td><td>Is the account allowed now? (expired, time of day, access lists)</td></tr><tr><td>password</td><td>Rules for changing the password</td></tr><tr><td>session</td><td>Setup and teardown at login (limits, home directory, logging)</td></tr></table>
<p>Control flags: <b>required</b> (must pass, keep checking), <b>requisite</b> (must pass, stop immediately on failure), <b>sufficient</b> (success is enough if nothing required failed), <b>optional</b>. On RHEL, don't hand-edit the generated files: use <code>authselect</code> (<code>authselect select sssd with-faillock</code>). Debian uses <code>pam-auth-update</code>.</p>
<div class="viz" id="viz-pamflow"></div>
<h3>Password and lockout policy</h3>
<ul><li><code>/etc/security/pwquality.conf</code>: <code>minlen = 14</code>, <code>dcredit</code>, <code>ucredit</code>, <code>minclass = 3</code>, <code>dictcheck</code>.</li>
<li><code>/etc/security/faillock.conf</code>: <code>deny = 5</code>, <code>unlock_time = 900</code>. Check and clear with <code>faillock --user dana</code> and <code>faillock --user dana --reset</code>.</li>
<li>Aging with <code>chage</code> and defaults in <code>/etc/login.defs</code> (PASS_MAX_DAYS). Resource limits in <code>/etc/security/limits.conf</code> (<code>nofile</code>, <code>nproc</code>).</li></ul>
<h3>Central identity</h3>
<ul><li><b>LDAP</b> is a directory of users and groups (port 389, or 636 for LDAPS). <b>Kerberos</b> issues tickets so you sign in once (<code>kinit</code>, <code>klist</code>); it needs accurate time.</li>
<li><b>SSSD</b> connects Linux to LDAP, Active Directory or FreeIPA and caches credentials. <code>realm join ad.example.com</code> joins a domain; <code>getent passwd user@ad.example.com</code> and <code>id</code> test it. <code>/etc/nsswitch.conf</code> says where to look (<code>passwd: files sss</code>).</li>
<li><b>MFA</b> adds something you have: TOTP apps through <code>pam_google_authenticator</code>, hardware keys (FIDO2/U2F), or smart cards. <b>SSO</b> and <b>OAuth/OIDC</b> federate web logins.</li></ul>
<div class="viz" id="viz-authq"></div>`},
{id:"priv",num:"3.2",title:"Privilege: sudo, su and least privilege",html:`
<p><b>su</b> switches to another user and needs <i>their</i> password (<code>su -</code> gives a full login environment). <b>sudo</b> runs one command as another user with <i>your</i> password, according to rules, and logs every use. That's why sudo is preferred: no shared root password and a clear audit trail.</p>
<pre class="term">user   hosts = (run-as)   commands
dana   ALL   = (root)     /usr/bin/systemctl restart httpd
%wheel ALL   = (ALL)      ALL                 <span class="t-n"># % means a group (sudo on Debian)</span>
%ops   ALL   = (ALL)      NOPASSWD: /usr/bin/dnf
Defaults timestamp_timeout=5</pre>
<ul><li>Always edit with <b>visudo</b> (or <code>visudo -f /etc/sudoers.d/name</code>). It locks the file and checks syntax, because a broken sudoers can lock everyone out of root.</li>
<li>Prefer small files in <code>/etc/sudoers.d/</code> (mode 440). <code>sudo -l</code> lists your rights; <code>sudo -l -U dana</code> lists dana's.</li>
<li>Be careful what you allow: <code>sudo vim</code>, <code>less</code>, <code>find</code> or <code>tar</code> can all spawn a root shell. Allow specific commands with specific arguments.</li>
<li>Logs: <code>/var/log/secure</code> or <code>auth.log</code>, and <code>journalctl _COMM=sudo</code>.</li>
<li><b>polkit</b> authorizes desktop and D-Bus actions (like <code>systemctl</code> without sudo for allowed users); <code>pkexec</code> is its sudo-like tool.</li></ul>
<div class="viz" id="viz-sudolab"></div>
<div class="viz" id="viz-sudosort"></div>`},
{id:"ssh",num:"3.3",title:"SSH: keys, hardening and tunnels",html:`
<pre class="term">ssh-keygen -t ed25519 -C "admin@laptop"     <span class="t-n"># ~/.ssh/id_ed25519 (private) and .pub</span>
ssh-copy-id admin@web01                     <span class="t-n"># appends the .pub to ~/.ssh/authorized_keys there</span>
ssh -i ~/.ssh/deploy_key -p 2222 deploy@web01
eval "$(ssh-agent)"; ssh-add                <span class="t-n"># unlock a passphrase-protected key once</span>
scp file web01:/tmp/; sftp web01; rsync -avz dir/ web01:/srv/dir/</pre>
<p>Permissions matter: <code>~/.ssh</code> 700, private keys and <code>authorized_keys</code> 600. sshd ignores keys that others can write. The server's identity is checked against <code>~/.ssh/known_hosts</code>; a "REMOTE HOST IDENTIFICATION HAS CHANGED" warning means a rebuilt server or a man-in-the-middle. Remove a stale entry with <code>ssh-keygen -R host</code>.</p>
<div class="viz" id="viz-keyflow"></div>
<div class="viz" id="viz-sshlab"></div>
<h3>Hardening sshd_config</h3>
<table><tr><th>Setting</th><th>Why</th></tr>
<tr><td><code>PermitRootLogin no</code></td><td>Log in as yourself, then sudo</td></tr>
<tr><td><code>PasswordAuthentication no</code></td><td>Keys only; ends password guessing</td></tr>
<tr><td><code>AllowUsers</code> / <code>AllowGroups</code></td><td>Only listed accounts may connect</td></tr>
<tr><td><code>Port 2222</code></td><td>Cuts log noise (also needs firewall and SELinux port changes)</td></tr>
<tr><td><code>MaxAuthTries 3</code>, <code>LoginGraceTime</code>, <code>ClientAliveInterval</code></td><td>Limit attempts and idle sessions</td></tr>
<tr><td><code>X11Forwarding no</code>, <code>AllowTcpForwarding no</code></td><td>Disable features you don't use</td></tr>
<tr><td><code>Banner /etc/issue.net</code></td><td>Legal warning before login</td></tr></table>
<p>Put changes in <code>/etc/ssh/sshd_config.d/*.conf</code> on newer systems, run <code>sshd -t</code> to test, then <code>systemctl reload sshd</code>. Keep your current session open until a new login works.</p>
<p><b>Tunnels</b>: <code>ssh -L 8080:db01:5432 jump</code> forwards a local port through the server; <code>-R</code> does the reverse; <code>-D 1080</code> makes a SOCKS proxy; <code>-J bastion</code> hops through a jump host.</p>
<div class="viz" id="viz-sshdlab"></div>`},
{id:"fw",num:"3.4",title:"Firewalls: firewalld, ufw, nftables and iptables",html:`
<p>All Linux firewalls program the kernel's <b>netfilter</b>. Modern systems use <b>nftables</b>; <b>iptables</b> is the older interface. Most admins use a front end.</p>
<h3>firewalld (RHEL family)</h3>
<pre class="term">firewall-cmd --get-default-zone; firewall-cmd --get-active-zones
firewall-cmd --list-all
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8081/tcp
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=10.0.0.0/24 service name=ssh accept'
firewall-cmd --permanent --zone=internal --add-source=10.0.0.0/24
firewall-cmd --reload</pre>
<p><b>Zones</b> (public, internal, trusted, drop, dmz...) group rules and apply to interfaces or source addresses. Without <code>--permanent</code> a change is <b>runtime only</b> and lost at reload or reboot; with it, the change waits until <code>--reload</code>. (<code>--runtime-to-permanent</code> saves what's running.)</p>
<div class="viz" id="viz-fwmode"></div>
<h3>ufw (Ubuntu)</h3>
<pre class="term">ufw default deny incoming; ufw default allow outgoing
ufw allow 22/tcp; ufw allow from 10.0.0.0/24 to any port 5432
ufw enable; ufw status numbered; ufw delete 3</pre>
<h3>nftables and iptables</h3>
<pre class="term">nft list ruleset
nft add rule inet filter input tcp dport 443 accept
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j ACCEPT
iptables -P INPUT DROP          <span class="t-n"># default policy</span>
iptables-save > /etc/sysconfig/iptables</pre>
<p>iptables chains are INPUT (to this host), OUTPUT (from it) and FORWARD (through it, as a router). Rules match top to bottom and the first match wins. Targets: ACCEPT, DROP (silently), REJECT (with an error), LOG. NAT and masquerading live in the <code>nat</code> table; routing between interfaces also needs <code>net.ipv4.ip_forward=1</code>.</p>
<div class="viz" id="viz-fwlab"></div>
<div class="viz" id="viz-fwq"></div>`},
{id:"mac",num:"3.5",title:"Mandatory access control: SELinux and AppArmor",html:`
<p>Normal permissions are <b>discretionary</b>: owners decide. <b>Mandatory access control</b> adds a system policy that even root processes obey, so a hacked web server still can't read <code>/etc/shadow</code> or home directories.</p>
<h3>SELinux (RHEL family)</h3>
<p>Every process and file has a <b>context</b> <code>user:role:type:level</code>. The <b>type</b> is what matters: the targeted policy allows <code>httpd_t</code> processes to read <code>httpd_sys_content_t</code> files and bind to <code>http_port_t</code> ports. See them with <code>ls -Z</code>, <code>ps -eZ</code>, <code>id -Z</code>.</p>
<table><tr><th>Mode</th><th>Meaning</th></tr><tr><td>Enforcing</td><td>Denies and logs</td></tr><tr><td>Permissive</td><td>Logs only (for troubleshooting)</td></tr><tr><td>Disabled</td><td>No policy (relabel needed to turn back on)</td></tr></table>
<p><code>getenforce</code>, <code>setenforce 0|1</code> (until reboot), <code>sestatus</code>, and <code>SELINUX=</code> in <code>/etc/selinux/config</code> (permanent).</p>
<div class="viz" id="viz-sefix"></div>
<pre class="term">ls -Z /var/www/html; restorecon -Rv /var/www/html            <span class="t-n"># wrong label: restore default</span>
semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"   <span class="t-n"># new path: add a rule...</span>
restorecon -Rv /srv/web                                        <span class="t-n"># ...then apply it</span>
semanage port -a -t http_port_t -p tcp 8081                   <span class="t-n"># non-standard port</span>
getsebool -a | grep httpd; setsebool -P httpd_can_network_connect on  <span class="t-n"># feature switch</span>
ausearch -m AVC -ts recent; sealert -a /var/log/audit/audit.log; audit2why</pre>
<p><code>chcon</code> changes a label temporarily (a relabel undoes it); <code>semanage fcontext</code> plus <code>restorecon</code> is permanent. <code>touch /.autorelabel</code> relabels everything at next boot. <code>audit2allow -M</code> builds a custom policy module, but it's the last resort after labels, ports and booleans.</p>
<div class="viz" id="viz-selab"></div>
<h3>AppArmor (Ubuntu, SUSE)</h3>
<p>AppArmor confines programs with <b>path-based profiles</b> in <code>/etc/apparmor.d/</code>. Modes are <b>enforce</b> and <b>complain</b> (log only). Tools: <code>aa-status</code>, <code>aa-complain /usr/sbin/nginx</code>, <code>aa-enforce</code>, <code>aa-disable</code>, <code>apparmor_parser -r</code> to reload a profile. Denials appear in the kernel log and <code>/var/log/syslog</code> with <code>apparmor="DENIED"</code>.</p>`},
{id:"crypto",num:"3.6",title:"Cryptography: hashes, certificates, GPG and disk encryption",html:`
<table><tr><th>Tool</th><th>Purpose</th></tr>
<tr><td>Hashing</td><td><code>sha256sum file</code>, <code>sha256sum -c SHA256SUMS</code> verifies downloads. A hash proves integrity, not who made it. MD5 and SHA-1 are broken for security use.</td></tr>
<tr><td>Symmetric</td><td>One shared key, fast (AES). Used for disks and bulk data.</td></tr>
<tr><td>Asymmetric</td><td>Public/private pair (RSA, Ed25519, ECDSA). Public encrypts or verifies; private decrypts or signs.</td></tr></table>
<h3>TLS certificates with OpenSSL</h3>
<pre class="term">openssl req -new -newkey rsa:2048 -nodes -keyout web.key -out web.csr -subj "/CN=web01.example.lan"   <span class="t-n"># key + CSR for a CA</span>
openssl req -x509 -newkey rsa:2048 -nodes -keyout web.key -out web.crt -days 365 -subj "/CN=web01"    <span class="t-n"># self-signed</span>
openssl x509 -in web.crt -noout -subject -issuer -dates
openssl s_client -connect web01:443                 <span class="t-n"># inspect a live server's chain</span>
certbot --nginx -d www.example.com                  <span class="t-n"># free certificates from Let's Encrypt (ACME)</span></pre>
<p>Trust: add a private CA to <code>/etc/pki/ca-trust/source/anchors/</code> then <code>update-ca-trust</code> (RHEL), or <code>/usr/local/share/ca-certificates/</code> then <code>update-ca-certificates</code> (Debian). System-wide algorithm rules on RHEL: <code>update-crypto-policies --set FUTURE</code>; <code>fips-mode-setup --enable</code> for FIPS 140.</p>
<div class="viz" id="viz-pki"></div>
<h3>GPG</h3>
<pre class="term">gpg --full-generate-key; gpg --list-keys
gpg --export -a admin > admin.pub; gpg --import colleague.pub
gpg -e -r colleague file.txt    <span class="t-n"># encrypt for them</span>
gpg -d file.txt.gpg              <span class="t-n"># decrypt with your private key</span>
gpg --sign / --verify            <span class="t-n"># prove authorship</span>
gpg -c secrets.tar               <span class="t-n"># symmetric, passphrase only</span></pre>
<h3>LUKS disk encryption</h3>
<pre class="term">cryptsetup luksFormat /dev/sdb           <span class="t-n"># destroys data, sets a passphrase</span>
cryptsetup open /dev/sdb secure          <span class="t-n"># unlocks to /dev/mapper/secure</span>
mkfs.xfs /dev/mapper/secure; mount /dev/mapper/secure /secure
cryptsetup luksAddKey /dev/sdb keyfile   <span class="t-n"># a second key slot</span>
cryptsetup close secure</pre>
<p>Unlock at boot with <code>/etc/crypttab</code> (<code>secure UUID=... none</code> prompts for a passphrase, or give a key file), and mount with <code>/etc/fstab</code> using <code>/dev/mapper/secure</code>. Encryption at rest protects stolen disks and laptops, not a running system.</p>
<div class="viz" id="viz-cryptlab"></div>`},
{id:"harden",num:"3.7",title:"Hardening, auditing and compliance",html:`
<h3>Reduce the attack surface</h3>
<ul><li>Remove or disable what you don't need: <code>dnf remove telnet-server</code>, <code>systemctl disable --now cups</code>, <code>ss -tulpn</code> to see what listens.</li>
<li>Patch regularly (<code>dnf upgrade --security</code>, <code>unattended-upgrades</code>) and reboot or restart services after kernel and library fixes.</li>
<li>Kernel settings in <code>/etc/sysctl.d/</code>: <code>net.ipv4.ip_forward=0</code>, <code>net.ipv4.conf.all.accept_redirects=0</code>, <code>kernel.randomize_va_space=2</code>, <code>net.ipv4.tcp_syncookies=1</code>. Apply with <code>sysctl --system</code>.</li>
<li>Mount options: <code>noexec,nosuid,nodev</code> on <code>/tmp</code> and removable media.</li>
<li>Boot: UEFI <b>Secure Boot</b> with signed kernels; a GRUB password (<code>grub2-setpassword</code>) stops editing boot entries to get a root shell.</li>
<li>Banners in <code>/etc/issue</code>, <code>/etc/issue.net</code> and <code>/etc/motd</code> give legal notice.</li>
<li>Remove unneeded SUID programs, lock unused accounts, and check for UID 0 duplicates and empty passwords (<code>pwck</code>, <code>awk -F: '$2==""' /etc/shadow</code>).</li></ul>
<div class="viz" id="viz-hardsort"></div>
<h3>Detect and record</h3>
<ul><li><b>auditd</b> records security events: <code>auditctl -w /etc/passwd -p wa -k passwd_changes</code> watches a file (r read, w write, x execute, a attribute change); permanent rules go in <code>/etc/audit/rules.d/*.rules</code>. Search with <code>ausearch -k</code>, summarize with <code>aureport</code>.</li>
<li><b>AIDE</b> is file integrity monitoring: <code>aide --init</code> builds a database of hashes, move it into place, then <code>aide --check</code> reports changed files.</li>
<li><b>fail2ban</b> reads logs and bans IPs that fail too often (<code>fail2ban-client status sshd</code>, jails in <code>/etc/fail2ban/jail.local</code>).</li>
<li><b>Scanners and benchmarks</b>: <b>CIS Benchmarks</b> and <b>DISA STIGs</b> list hardening settings; <b>OpenSCAP</b> (<code>oscap xccdf eval --profile cis ...</code>) checks them automatically; <code>lynis audit system</code> gives quick suggestions. Vulnerabilities are tracked as <b>CVEs</b> and scored with <b>CVSS</b>.</li></ul>
<div class="viz" id="viz-auditlab"></div>
<div class="viz" id="viz-secq"></div>`}
];

const G={
 auth:[["PAM","Pluggable Authentication Modules: how programs check identity"],["/etc/pam.d/","One PAM configuration file per service"],["auth (PAM type)","Proves identity"],["account (PAM type)","Checks whether the account may log in now"],["password (PAM type)","Rules for changing passwords"],["session (PAM type)","Setup at login, like limits and logging"],["required","Must pass; other modules still run"],["requisite","Must pass; stops immediately on failure"],["sufficient","Success is enough if no required module failed"],["authselect","RHEL tool that manages PAM and nsswitch profiles"],["pam_pwquality","Enforces password complexity"],["pam_faillock","Locks accounts after failed logins"],["faillock --reset","Unlocks a user locked by failed attempts"],["/etc/security/limits.conf","Per-user resource limits (open files, processes)"],["LDAP","Directory service for users and groups (389, LDAPS 636)"],["Kerberos","Ticket-based single sign-on; needs synchronized clocks"],["SSSD","Connects Linux to LDAP, AD or FreeIPA and caches credentials"],["realm join","Join a Linux host to Active Directory"],["/etc/nsswitch.conf","Order of sources for users, groups and hosts"],["MFA","Requires something you know plus something you have"]],
 priv:[["sudo","Runs a command as another user using your password, with logging"],["su -","Switch user with their password and a login environment"],["visudo","Edits sudoers safely with locking and syntax checks"],["/etc/sudoers.d/","Drop-in sudo rules (mode 440)"],["%wheel","Group rule in sudoers (sudo group on Debian)"],["NOPASSWD:","Allows a sudo command without a password prompt"],["sudo -l","Lists your sudo rights"],["sudo -l -U user","Lists another user's sudo rights"],["Least privilege","Grant only the access a task needs"],["sudo vim risk","Editors and pagers can spawn a root shell"],["polkit","Authorizes privileged desktop and D-Bus actions"],["pkexec","Run a command through polkit"],["sudo logs","/var/log/secure or auth.log, journalctl _COMM=sudo"]],
 ssh:[["ssh-keygen -t ed25519","Create a modern SSH key pair"],["ssh-copy-id","Install your public key on a server"],["authorized_keys","Public keys allowed to log in to an account"],["known_hosts","Fingerprints of servers you've connected to"],["~/.ssh permissions","700 for the directory, 600 for private keys"],["ssh-agent / ssh-add","Hold unlocked keys for the session"],["ssh-keygen -R host","Remove a stale host key"],["PermitRootLogin no","Blocks direct root logins"],["PasswordAuthentication no","Keys only"],["AllowUsers / AllowGroups","Restrict who may connect"],["sshd -t","Test sshd configuration syntax"],["ssh -L","Local port forwarding"],["ssh -R","Remote port forwarding"],["ssh -J","Connect through a jump host"],["scp / sftp / rsync","Copy files over SSH"]],
 fw:[["netfilter","Kernel packet-filtering framework behind all Linux firewalls"],["nftables","Modern netfilter interface (nft)"],["firewalld zone","Named set of rules bound to interfaces or sources"],["--permanent","Saved rule, applied after --reload"],["Runtime rule","Active now, lost on reload or reboot"],["--runtime-to-permanent","Save the running configuration"],["--add-service=https","Allow a predefined service"],["--add-port=8081/tcp","Allow a specific port"],["Rich rule","firewalld rule with source, service and action"],["ufw default deny incoming","Ubuntu: block inbound by default"],["ufw status numbered","Show ufw rules with numbers to delete"],["INPUT / OUTPUT / FORWARD","iptables chains for traffic to, from and through the host"],["DROP vs REJECT","Silently discard vs answer with an error"],["iptables -P INPUT DROP","Default deny policy"],["First match wins","iptables evaluates rules top to bottom"],["Masquerade","NAT that hides internal hosts behind the firewall's address"]],
 mac:[["MAC","Mandatory access control; a policy even root processes obey"],["SELinux context","user:role:type:level"],["Type enforcement","Rules about which process types reach which file and port types"],["Enforcing","SELinux denies and logs"],["Permissive","SELinux logs only"],["setenforce 0","Permissive until reboot"],["/etc/selinux/config","Permanent SELinux mode"],["ls -Z / ps -eZ","Show file and process contexts"],["restorecon -Rv","Reset files to their default labels"],["semanage fcontext -a","Add a labeling rule for a custom path"],["chcon","Temporary label change"],["semanage port -a","Allow a service on a non-standard port"],["setsebool -P","Turn a policy boolean on permanently"],["ausearch -m AVC","Find SELinux denials"],["sealert","Explains denials and suggests fixes"],["audit2allow","Builds a custom policy module (last resort)"],["/.autorelabel","Relabel the whole filesystem at next boot"],["AppArmor","Path-based profiles (Ubuntu, SUSE)"],["aa-complain / aa-enforce","Switch an AppArmor profile's mode"],["aa-status","List AppArmor profiles and modes"]],
 crypto:[["Hash","Fixed-length fingerprint proving integrity"],["sha256sum -c","Verify files against a checksum list"],["Symmetric encryption","One shared key (AES)"],["Asymmetric encryption","Public/private key pair (RSA, Ed25519)"],["CSR","Certificate signing request sent to a CA"],["Self-signed certificate","Signed by its own key; not trusted by others"],["openssl x509 -noout -dates","Show a certificate's validity period"],["openssl s_client","Inspect a TLS server's certificate chain"],["update-ca-trust","Add a CA to RHEL's trust store"],["update-ca-certificates","Add a CA to Debian's trust store"],["certbot","ACME client for Let's Encrypt certificates"],["update-crypto-policies","RHEL system-wide crypto algorithm policy"],["gpg -e -r","Encrypt for a recipient's public key"],["gpg --sign / --verify","Sign or check a signature"],["LUKS","Linux disk encryption standard"],["cryptsetup luksFormat","Initialize an encrypted device (destroys data)"],["cryptsetup open","Unlock to /dev/mapper/name"],["/etc/crypttab","Encrypted devices to unlock at boot"],["Key slots","LUKS allows several passphrases or key files"]],
 harden:[["Attack surface","Everything an attacker can reach; minimize it"],["ss -tulpn","List listening ports and their programs"],["sysctl.d","Persistent kernel security settings"],["noexec,nosuid,nodev","Restrictive mount options for /tmp and media"],["Secure Boot","UEFI only runs signed boot loaders and kernels"],["GRUB password","Stops editing boot entries for a root shell"],["/etc/issue.net","Pre-login banner for SSH"],["auditd","Kernel-level security event logging"],["auditctl -w path -p wa -k key","Watch a file for writes and attribute changes"],["/etc/audit/rules.d/","Persistent audit rules"],["ausearch -k","Search audit events by key"],["aureport","Summarize audit events"],["AIDE","File integrity monitoring by hashes"],["fail2ban","Bans IPs after repeated failures"],["CIS Benchmark","Consensus hardening guide"],["DISA STIG","US DoD hardening requirements"],["OpenSCAP","Automated compliance scanning (oscap)"],["lynis","Quick security audit tool"],["CVE","Public identifier for a vulnerability"],["CVSS","0 to 10 severity score for vulnerabilities"]]
};
const DECKS=[["auth","Authentication"],["priv","sudo and privilege"],["ssh","SSH"],["fw","Firewalls"],["mac","SELinux and AppArmor"],["crypto","Cryptography"],["harden","Hardening and auditing"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which PAM control flag stops processing immediately when the module fails?",o:["requisite","required","sufficient","optional"],a:0,e:"required keeps going, then fails."},
 {q:"Which PAM type checks whether an account is expired or allowed to log in at this time?",o:["account","auth","password","session"],a:0,e:"auth proves identity first."},
 {q:"On RHEL 9, what's the supported way to add faillock to PAM?",o:["authselect enable-feature with-faillock","Edit /etc/pam.d/system-auth by hand","pam-auth-update","setsebool faillock on"],a:0,e:"authselect regenerates the files."},
 {q:"A user is locked out after too many bad passwords. Which unlocks them?",o:["faillock --user dana --reset","passwd -u dana","usermod -U dana","chage -E -1 dana"],a:0,e:"pam_faillock tracks failures."},
 {q:"Where do you set minimum password length and character classes?",o:["/etc/security/pwquality.conf","/etc/shadow","/etc/login.defs only","/etc/pam.d/sshd"],a:0,e:"minlen, minclass."},
 {q:"Which service connects a Linux host to Active Directory and caches logins?",o:["SSSD","rsyslog","chronyd","Samba nmbd"],a:0,e:"realm join configures it."},
 {q:"Kerberos logins fail with clock skew errors. What do you fix?",o:["Time synchronization (chrony)","DNS search domain","The SELinux mode","The firewall zone"],a:0,e:"Tickets are time-stamped."},
 {q:"Which file decides whether user lookups check local files before SSSD?",o:["/etc/nsswitch.conf","/etc/host.conf","/etc/sssd/sssd.conf","/etc/pam.d/login"],a:0,e:"passwd: files sss."},
 {q:"Why is sudo preferred over sharing the root password?",o:["Individual accountability and fine-grained rules","sudo is faster","su doesn't work over SSH","sudo disables SELinux"],a:0,e:"Every command is logged per user."},
 {q:"How should you edit sudo rules?",o:["visudo","vim /etc/sudoers","echo >> /etc/sudoers","chmod 777 /etc/sudoers"],a:0,e:"It checks syntax before saving."},
 {q:"Which sudoers line lets members of group ops run any command as any user?",o:["%ops ALL=(ALL) ALL","ops ALL=(ALL) ALL","@ops ALL=ALL","group ops ALL"],a:0,e:"% marks a group."},
 {q:"Why is 'dana ALL=(root) /usr/bin/vim' dangerous?",o:["vim can open a root shell with :!bash","vim can't run as root","It disables logging","It needs NOPASSWD"],a:0,e:"Allow sudoedit instead."},
 {q:"Which command shows what you're allowed to run with sudo?",o:["sudo -l","sudo -v","sudo -k","sudo -i"],a:0,e:"-k forgets cached credentials."},
 {q:"Which key type is the modern default choice for SSH?",o:["Ed25519","DSA","RSA-1024","MD5"],a:0,e:"Fast and strong; RSA 3072+ is also fine."},
 {q:"SSH ignores your key and asks for a password. ~/.ssh/authorized_keys is mode 664. Why?",o:["sshd rejects keys files writable by others","The key is too long","SELinux is permissive","PasswordAuthentication is no"],a:0,e:"StrictModes; use 600."},
 {q:"What does ssh-copy-id do?",o:["Appends your public key to the remote authorized_keys","Copies your private key to the server","Copies the server's key to known_hosts only","Creates a new key pair"],a:0,e:"Never share the private key."},
 {q:"You rebuilt web01 and ssh now warns REMOTE HOST IDENTIFICATION HAS CHANGED. What's the right fix after verifying?",o:["ssh-keygen -R web01","Delete ~/.ssh entirely","Set StrictHostKeyChecking no globally","Reinstall OpenSSH"],a:0,e:"Remove only the stale entry."},
 {q:"Which sshd setting forces key-only logins?",o:["PasswordAuthentication no","PermitRootLogin no","PubkeyAuthentication no","UsePAM no"],a:0,e:"Make sure a key works first."},
 {q:"What should you run before reloading sshd after editing its config?",o:["sshd -t","ssh -V","systemctl daemon-reload","ssh-keyscan"],a:0,e:"A syntax error could lock you out."},
 {q:"You need to reach a database on db01:5432 that's only reachable from bastion. Which command?",o:["ssh -L 5432:db01:5432 bastion","ssh -R 5432:db01:5432 bastion","ssh -D 5432 db01","scp db01:5432 ."],a:0,e:"Local forward through the bastion."},
 {q:"You ran firewall-cmd --add-port=8443/tcp and it worked, but it's gone after a reboot. Why?",o:["It was a runtime-only change; add --permanent","firewalld was masked","SELinux removed it","The zone was dmz"],a:0,e:"Or use --runtime-to-permanent."},
 {q:"After firewall-cmd --permanent --add-service=http, the port still isn't open. What's missing?",o:["firewall-cmd --reload","systemctl restart httpd","semanage port","ufw enable"],a:0,e:"Permanent changes load at reload."},
 {q:"Which firewalld rule allows SSH only from 10.0.0.0/24?",o:["A rich rule with source address 10.0.0.0/24 and service ssh","--add-port=22/tcp","--add-service=ssh --zone=public","--add-interface=10.0.0.0/24"],a:0,e:"Also remove the general ssh service."},
 {q:"Which ufw command sets the default for incoming traffic to block?",o:["ufw default deny incoming","ufw deny all","ufw block in","ufw reset"],a:0,e:"Then allow what you need."},
 {q:"Which iptables chain handles traffic routed through the host to another network?",o:["FORWARD","INPUT","OUTPUT","PREROUTING only"],a:0,e:"INPUT is for the host itself."},
 {q:"What's the difference between DROP and REJECT?",o:["DROP discards silently; REJECT sends an error back","DROP logs, REJECT doesn't","They're identical","REJECT only applies to UDP"],a:0,e:"DROP makes scans slower."},
 {q:"What does SELinux type enforcement compare?",o:["The process type and the file or port type","File owner and group","The user's password","The IP address and port"],a:0,e:"httpd_t can read httpd_sys_content_t."},
 {q:"A file moved from /home into /var/www/html gives 403. ls -Z shows user_home_t. Fix?",o:["restorecon -Rv /var/www/html","chmod 777 the file","setenforce 0 permanently","semanage port -a"],a:0,e:"mv keeps the old label; cp creates a new one."},
 {q:"You serve web content from a new directory /srv/web. How do you label it permanently?",o:["semanage fcontext -a -t httpd_sys_content_t '/srv/web(/.*)?' then restorecon -Rv /srv/web","chcon -t httpd_sys_content_t /srv/web only","setsebool -P httpd_srv on","touch /srv/web/.autorelabel"],a:0,e:"chcon is undone by a relabel."},
 {q:"httpd fails to start on port 8081 with a name_bind denial. Fix?",o:["semanage port -a -t http_port_t -p tcp 8081","setsebool -P httpd_can_network_connect on","restorecon -Rv /etc/httpd","firewall-cmd --add-port=8081/tcp"],a:0,e:"The firewall is a separate issue."},
 {q:"A PHP app can't connect to a remote API. The AVC shows name_connect. Fix?",o:["setsebool -P httpd_can_network_connect on","semanage port -a -t http_port_t","restorecon -Rv /var/www","chcon -t bin_t"],a:0,e:"Booleans toggle features."},
 {q:"Which command makes SELinux permissive only until reboot?",o:["setenforce 0","SELINUX=permissive in /etc/selinux/config","setsebool -P permissive on","selinux --off"],a:0,e:"Edit the config for permanent change."},
 {q:"Which tool explains an SELinux denial in plain language with suggested fixes?",o:["sealert","semodule","getenforce","matchpathcon"],a:0,e:"From setroubleshoot-server."},
 {q:"When is audit2allow the right fix?",o:["After ruling out labels, ports and booleans, for a real policy gap","Always, it's quickest","Never","Only on Ubuntu"],a:0,e:"It can over-allow."},
 {q:"Ubuntu: a confined service needs to read a new path and AppArmor blocks it. How do you test without enforcement?",o:["aa-complain on its profile","setenforce 0","aa-status","chcon"],a:0,e:"Then update the profile and aa-enforce."},
 {q:"How is AppArmor different from SELinux?",o:["AppArmor uses path-based profiles; SELinux uses labels on objects","AppArmor is discretionary","SELinux only runs on Ubuntu","AppArmor has no enforcement mode"],a:0,e:"Both are MAC."},
 {q:"What does a SHA-256 checksum prove about a download?",o:["The file wasn't altered (if the checksum came from a trusted place)","Who wrote it","That it's malware-free","That it's encrypted"],a:0,e:"Signatures prove origin."},
 {q:"Which openssl command creates a key and a CSR to send to a certificate authority?",o:["openssl req -new -newkey rsa:2048 -nodes -keyout k.key -out r.csr","openssl x509 -in r.csr","openssl s_client -connect ca:443","openssl rand -hex 32"],a:0,e:"The CA signs the CSR."},
 {q:"Browsers on your network don't trust your internal CA. On RHEL clients, what do you do?",o:["Copy the CA cert to /etc/pki/ca-trust/source/anchors/ and run update-ca-trust","update-ca-certificates","Set SELinux permissive","Disable TLS"],a:0,e:"Debian uses update-ca-certificates."},
 {q:"How do you check when a server's certificate expires?",o:["openssl x509 -in cert.pem -noout -enddate","sha256sum cert.pem","gpg --verify cert.pem","ssh-keygen -l"],a:0,e:"-checkend tests a window."},
 {q:"You want to send a colleague an encrypted file only they can read. With GPG you encrypt with",o:["Their public key","Your private key","Their private key","A shared password only"],a:0,e:"They decrypt with their private key."},
 {q:"Which command initializes LUKS encryption on /dev/sdb?",o:["cryptsetup luksFormat /dev/sdb","cryptsetup open /dev/sdb","mkfs.luks /dev/sdb","gpg -c /dev/sdb"],a:0,e:"It destroys existing data."},
 {q:"Which file lists encrypted volumes to unlock during boot?",o:["/etc/crypttab","/etc/fstab only","/etc/luks.conf","/etc/default/grub"],a:0,e:"fstab then mounts the mapper device."},
 {q:"Which mount options harden /tmp?",o:["noexec,nosuid,nodev","rw,exec,suid","defaults,dev","sync,atime"],a:0,e:"Blocks running dropped binaries."},
 {q:"Which prevents someone at the console from editing GRUB to boot into a root shell?",o:["A GRUB password","SELinux permissive","Disabling SSH","faillock"],a:0,e:"grub2-setpassword."},
 {q:"Which auditctl rule records writes and attribute changes to /etc/shadow?",o:["auditctl -w /etc/shadow -p wa -k shadow","auditctl -w /etc/shadow -p r","auditctl -a /etc/shadow","auditctl -l /etc/shadow"],a:0,e:"w write, a attribute."},
 {q:"Where do audit rules go so they survive reboot?",o:["/etc/audit/rules.d/","/etc/auditctl.conf","/var/log/audit/","/etc/sysctl.d/"],a:0,e:"augenrules loads them."},
 {q:"Which tool detects that /usr/bin/ls was replaced?",o:["AIDE","fail2ban","ufw","chrony"],a:0,e:"It compares file hashes with a baseline."},
 {q:"Which tool automatically bans an IP after repeated failed SSH logins?",o:["fail2ban","AIDE","auditd","lynis"],a:0,e:"It adds firewall rules."},
 {q:"Which tool checks a system against a CIS profile automatically?",o:["OpenSCAP (oscap)","rpm -V","sealert","ssh-audit only"],a:0,e:"Generates an HTML report."},
 {q:"What does a CVSS score of 9.8 indicate?",o:["Critical severity vulnerability","A low-risk bug","A CVE number","A passing compliance score"],a:0,e:"0 to 10 scale."},
 {q:"Which kernel setting should be 0 on a server that isn't a router?",o:["net.ipv4.ip_forward","kernel.randomize_va_space","net.ipv4.tcp_syncookies","fs.file-max"],a:0,e:"Randomization should be 2; syncookies 1."},
 {q:"Which command lists listening ports with their owning programs?",o:["ss -tulpn","netstat -r","ip link","lsblk"],a:0,e:"Close what you don't need."}
];

/* ---------- custom diagram: SSH key login handshake ---------- */
function keyFlow(el){const S=[["You","Run ssh admin@web01. The client offers the public key from ~/.ssh/id_ed25519.pub."],["web01","sshd looks in /home/admin/.ssh/authorized_keys. The key is there, so it sends a random challenge."],["You","The client signs the challenge with the private key. The private key never leaves your machine."],["web01","sshd checks the signature with the stored public key. It matches: you're in, no password sent."],["If it fails","Check permissions (700 and 600), the key really is in authorized_keys, PubkeyAuthentication yes, SELinux context ssh_home_t (restorecon -Rv ~/.ssh), and ssh -v for details."]];let i=0;
  const draw=()=>{el.innerHTML=`<div class="viz-title">How an SSH key login works</div><div class="kf"><div class="kf-side ${i%2===0&&i<4?"on":""}"><b>Client</b><span class="mono s-small">id_ed25519 (private)</span></div><div class="kf-arrow" aria-hidden="true">${i===0||i===2?"→":i===1?"←":i===3?"✓":"?"}</div><div class="kf-side ${i%2===1&&i<4?"on":""}"><b>web01</b><span class="mono s-small">authorized_keys (public)</span></div></div>
    <div class="caption" aria-live="polite"><b>Step ${i+1} of ${S.length}. ${S[i][0]}:</b> ${S[i][1]}</div><div class="viz-controls"><button class="btn" data-a="prev" ${i?"":"disabled"}>Back</button><button class="btn primary" data-a="next">${i<S.length-1?"Next":"Start over"}</button></div>`};
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(!a)return;if(a.dataset.a==="prev")i--;else{if(i===S.length-1){i=0}else{i++;if(i===S.length-1)award("viz:keyflow",15,"Followed an SSH key login")}}draw()});draw()}

registerModule({
  id:"sec",slug:"security",title:"Security",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,labs:LABS,
  vizKeys:["pamflow","authq","sudolab","sudosort","keyflow","sshlab","sshdlab","fwmode","fwlab","fwq","sefix","selab","pki","cryptlab","hardsort","auditlab","secq"],
  viz(){
stepViz($("#viz-pamflow"),{title:"Walk a login through PAM",done:"Traced a PAM login",steps:[
  ["dana types her password at SSH","sshd hands the check to PAM using /etc/pam.d/sshd, which includes password-auth."],
  ["auth: pam_faillock preauth","Has dana failed too often recently? If she's locked, stop here."],
  ["auth: pam_unix","Compare the password with the hash in /etc/shadow (or pam_sss asks SSSD for a directory account)."],
  ["account: pam_unix","Is the account or password expired (chage)? Is the shell valid?"],
  ["account: pam_access / pam_nologin","Is dana allowed from this host? Does /etc/nologin block non-root logins?"],
  ["session: pam_limits, pam_systemd","Apply limits.conf, register the session with systemd-logind, maybe create the home directory."],
  ["Logged in","Each step logged to /var/log/secure."]],end:"Fail a required module and PAM still runs the rest of the stack (so attackers can't tell which step failed), then denies."});
quizViz($("#viz-authq"),{title:"Authentication scenarios",done:"Solved every authentication scenario",qs:[
  ["Require 14-character passwords with three character classes",["pwquality.conf: minlen=14, minclass=3","login.defs PASS_MAX_DAYS 14","chage -m 14","faillock deny=14"],0,"pam_pwquality reads it."],
  ["Lock accounts for 15 minutes after 5 failures",["faillock.conf: deny=5, unlock_time=900","pwquality.conf retry=5","sshd MaxAuthTries 5 only","limits.conf maxlogins 5"],0,"MaxAuthTries is per connection only."],
  ["Let AD users log in to a RHEL server",["realm join, which configures SSSD","Copy /etc/passwd from the DC","Install Samba only","Add them with useradd"],0,"Then permit groups with realm permit."],
  ["A user hits 'too many open files'",["Raise nofile in /etc/security/limits.conf (or LimitNOFILE in the unit)","Raise PASS_MAX_DAYS","Use chattr","Add the user to wheel"],0,"pam_limits applies it at login."]]});
shellViz($("#viz-sudolab"),LABS.sudo,"sudolab");
sortViz($("#viz-sudosort"),{title:"Good sudo rule or risky?",bins:{ok:"Least privilege",risk:"Risky"},
  items:[["dana ALL=(root) /usr/bin/systemctl restart httpd","ok","One command, one argument set."],["%devs ALL=(ALL) NOPASSWD: ALL","risk","Root without even a password."],["eli ALL=(root) /usr/bin/less /var/log/*","risk","less can run !sh; the wildcard can match ../ too."],["%dba ALL=(postgres) /usr/bin/psql","ok","Runs as postgres, not root."],["ops ALL=(root) /usr/bin/vim /etc/hosts","risk","Use sudoedit /etc/hosts instead."],["backup ALL=(root) NOPASSWD: /usr/local/bin/backup.sh","ok","Fine if the script is root-owned and not writable by others."]],done:"Judged every sudo rule"});
keyFlow($("#viz-keyflow"));
shellViz($("#viz-sshlab"),LABS.ssh,"sshlab");
shellViz($("#viz-sshdlab"),LABS.sshd,"sshdlab");
revealViz($("#viz-fwmode"),{title:"Runtime versus permanent firewalld rules",cols:2,done:"Compared runtime and permanent",items:[
  ["firewall-cmd --add-service=http","runtime","Works right away. Lost at --reload or reboot. Good for testing."],
  ["firewall-cmd --permanent --add-service=http","permanent","Saved in /etc/firewalld but not active until --reload."],
  ["Both","best habit","Run with --permanent, then --reload. Or test at runtime, then --runtime-to-permanent."],
  ["--timeout=300","temporary","A runtime rule that removes itself after 5 minutes."]]});
shellViz($("#viz-fwlab"),LABS.fw,"fwlab");
quizViz($("#viz-fwq"),{title:"Pick the firewall command",done:"Answered every firewall question",qs:[
  ["Ubuntu: allow PostgreSQL only from 10.0.0.0/24",["ufw allow from 10.0.0.0/24 to any port 5432","ufw allow 5432","firewall-cmd --add-port=5432/tcp","iptables -P INPUT ACCEPT"],0,"Specific source."],
  ["RHEL: put the 10.0.0.0/24 network in the internal zone",["firewall-cmd --permanent --zone=internal --add-source=10.0.0.0/24","firewall-cmd --set-default-zone=internal","ufw zone internal","nft add zone internal"],0,"Sources pick the zone."],
  ["See the complete nftables configuration",["nft list ruleset","iptables -S","firewall-cmd --state","ufw status"],0,"Shows what firewalld generated too."],
  ["iptables: allow established replies before a default drop",["iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT","iptables -A INPUT -j DROP","iptables -F","iptables -P OUTPUT DROP"],0,"Stateful filtering."]]});
sortViz($("#viz-sefix"),{title:"Which SELinux fix?",bins:{rc:"restorecon",fc:"semanage fcontext + restorecon",port:"semanage port",bool:"setsebool -P"},
  items:[["A file copied with mv into /var/www/html has user_home_t","rc","The default label for that path is right; restore it."],["nginx should serve files from /data/site","fc","A new path needs a rule."],["sshd should listen on port 2222","port","ssh_port_t."],["httpd must connect to a remote database","bool","httpd_can_network_connect_db."],["Apache should serve ~/public_html","bool","httpd_enable_homedirs (plus labels)."],["MariaDB data moved to /srv/mysql","fc","mysqld_db_t on the new path."]],done:"Matched every SELinux fix"});
shellViz($("#viz-selab"),LABS.selinux,"selab");
stepViz($("#viz-pki"),{title:"How a TLS certificate gets trusted",done:"Followed the certificate chain",steps:[
  ["Make a key and CSR","On web01: a private key (kept secret) and a certificate signing request with the hostname."],["The CA verifies","A public CA (or Let's Encrypt through ACME) checks you control the domain. An internal CA trusts your process."],["The CA signs","You get web01.crt, signed by an intermediate CA, plus the chain file."],["Install on the server","Point nginx or httpd at the key, certificate and chain."],["The client checks","The browser follows the chain to a root CA in its trust store, and checks the name and dates."],["Renew before expiry","certbot renew runs on a timer. Expired certificates are a classic outage."]],end:"Self-signed certificates skip the CA, so every client must trust them by hand."});
shellViz($("#viz-cryptlab"),LABS.crypt,"cryptlab");
sortViz($("#viz-hardsort"),{title:"Which control is it?",bins:{surface:"Reduce attack surface",detect:"Detect and record",protect:"Protect data",access:"Control access"},
  items:[["systemctl disable --now cups on a server","surface","Fewer listening services."],["auditctl watch on /etc/sudoers","detect","Records changes."],["LUKS on the laptop's disk","protect","Stolen disks are unreadable."],["PermitRootLogin no","access","Who can log in."],["AIDE nightly check","detect","Finds changed files."],["noexec on /tmp","surface","Dropped binaries can't run there."],["GPG-encrypted backups","protect","Confidential off-site."],["AllowGroups sshusers","access","Restricts SSH."]],done:"Sorted the controls"});
shellViz($("#viz-auditlab"),LABS.audit,"auditlab");
quizViz($("#viz-secq"),{title:"Security triage",done:"Handled every security alert",qs:[
  ["lastb shows thousands of SSH failures from many IPs",["Key-only auth plus fail2ban","Change the root password daily","Disable the firewall","Set SELinux permissive"],0,"Remove the target, then slow the noise."],
  ["AIDE reports /usr/sbin/sshd changed but no update ran",["Treat it as a possible compromise: isolate and investigate","Re-run aide --init","Ignore it","Reboot"],0,"Don't reset the baseline over evidence."],
  ["A scan finds TLS 1.0 enabled",["Raise the crypto policy (DEFAULT or FUTURE) and restart services","Delete the certificate","Open port 443","Disable SELinux"],0,"update-crypto-policies on RHEL."],
  ["A contractor left yesterday",["Lock the account, remove keys and sudo rules, review their crontab","Delete /home immediately","Do nothing until it expires","Change the root password only"],0,"Preserve data for handover."]]});
  },
  sims:[
    {id:"lockdown",type:"shell",title:"Lock down a new web server",lab:{answers:ANS,world:{pkgs:["httpd"]},
      setup:w=>{R(w,"sed -i 's/^Listen 80/Listen 8081/' /etc/httpd/conf/httpd.conf","echo '<h1>Intranet</h1>' > /var/www/html/index.html")},
      scenario:"A new intranet server must serve Apache on port 8081 (already set in httpd.conf). SELinux stays enforcing. Get httpd running at boot, open 8081 permanently in the firewall, remove cockpit, and stop root logins over SSH.",
      tasks:[{t:"Try to start httpd and find out why it fails",hint:"sudo systemctl start httpd\nsudo ausearch -m AVC -ts recent\n(or journalctl -xeu httpd)",check:(w,sh)=>LX.ran(sh,/ausearch|sealert|journalctl|audit2why/),sticky:true},
        {t:"Allow httpd to bind to 8081 in SELinux",hint:"sudo semanage port -a -t http_port_t -p tcp 8081",check:w=>(w.selinux.ports.http_port_t||[]).includes("tcp 8081")},
        {t:"Enable and start httpd",hint:"sudo systemctl enable --now httpd",check:w=>w.units.httpd?.active==="active"&&!!w.units.httpd?.enabled},
        {t:"Open 8081/tcp permanently and remove cockpit, then reload",hint:"sudo firewall-cmd --permanent --add-port=8081/tcp\nsudo firewall-cmd --permanent --remove-service=cockpit\nsudo firewall-cmd --reload",check:w=>fwr(w).ports.includes("8081/tcp")&&fwp(w).ports.includes("8081/tcp")&&!fwr(w).services.includes("cockpit")&&!fwp(w).services.includes("cockpit")},
        {t:"Set PermitRootLogin no and reload sshd",hint:"sudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\nsudo sshd -t && sudo systemctl reload sshd",check:(w,sh)=>sshd(w,"PermitRootLogin")==="no"&&LX.ran(sh,/systemctl\s+(reload|restart)\s+sshd/)},
        {t:"Confirm the page loads on 8081",hint:"curl localhost:8081",check:(w,sh)=>/Intranet/.test((LX.httpGet(w,"localhost",8081,"/")||{}).body||"")&&LX.ran(sh,/curl.*8081/),sticky:true}],
      solution:"sudo systemctl start httpd\nsudo ausearch -m AVC -ts recent\nsudo semanage port -a -t http_port_t -p tcp 8081\nsudo systemctl enable --now httpd\nsudo firewall-cmd --permanent --add-port=8081/tcp\nsudo firewall-cmd --permanent --remove-service=cockpit\nsudo firewall-cmd --reload\nsudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\nsudo sshd -t\nsudo systemctl reload sshd\ncurl localhost:8081",
      success:"Three independent layers: SELinux port labels, the firewall, and the service itself. Each needed its own fix, and none needed SELinux turned off."}},
    {id:"luks",type:"shell",title:"Encrypt a data disk",lab:{answers:ANS,world:{disks:[["sdb",10]]},
      scenario:"Encrypt the new disk /dev/sdb with LUKS (use the passphrase Corr3ct-Horse-Battery), put an XFS filesystem on it named secure, mount it on /secure, and record it in /etc/crypttab and /etc/fstab.",
      tasks:[{t:"Format /dev/sdb as LUKS",hint:"sudo cryptsetup luksFormat /dev/sdb\n(type YES, then the passphrase twice)",check:w=>!!w.luks["/dev/sdb"]},
        {t:"Open it as /dev/mapper/secure",hint:"sudo cryptsetup open /dev/sdb secure",check:w=>w.luks["/dev/sdb"]?.open==="secure"},
        {t:"Create an XFS filesystem on the mapped device and mount it on /secure",hint:"sudo mkfs.xfs /dev/mapper/secure\nsudo mkdir /secure\nsudo mount /dev/mapper/secure /secure",check:w=>w.mounts.some(m=>m.src==="/dev/mapper/secure"&&m.tgt==="/secure")},
        {t:"Add a /etc/crypttab line for secure using the LUKS UUID",hint:"sudo blkid /dev/sdb\necho \"secure UUID=$(sudo blkid -s UUID -o value /dev/sdb) none\" | sudo tee -a /etc/crypttab",check:w=>new RegExp("^\\s*secure\\s+(UUID="+(w.luks["/dev/sdb"]?.uuid||"x")+"|/dev/sdb)\\s+none","m").test(rd(w,"/etc/crypttab"))},
        {t:"Add /etc/fstab for /dev/mapper/secure on /secure",hint:"echo '/dev/mapper/secure /secure xfs defaults 0 0' | sudo tee -a /etc/fstab",check:w=>/^\s*\/dev\/mapper\/secure\s+\/secure\s+xfs/m.test(rd(w,"/etc/fstab"))}],
      solution:"sudo cryptsetup luksFormat /dev/sdb\nsudo cryptsetup open /dev/sdb secure\nsudo mkfs.xfs /dev/mapper/secure\nsudo mkdir /secure\nsudo mount /dev/mapper/secure /secure\necho \"secure UUID=$(sudo blkid -s UUID -o value /dev/sdb) none\" | sudo tee -a /etc/crypttab\necho '/dev/mapper/secure /secure xfs defaults 0 0' | sudo tee -a /etc/fstab\nlsblk /dev/sdb",
      success:"At boot, crypttab prompts for the passphrase and creates /dev/mapper/secure; then fstab mounts it. Keep a backup key slot (luksAddKey) and a header backup."}},
    {id:"sshharden",type:"shell",title:"Key-only SSH for the admin team",lab:{answers:ANS,
      scenario:"Set up key login from this server to web01 (admin, password Passw0rd!), then harden this server's own sshd: no root, no passwords, only members of the sshusers group, and a max of 3 tries. Make sure admin is in sshusers before you reload, or you'll lock yourself out.",
      tasks:[{t:"Create a key and install it on web01",hint:"ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519\nssh-copy-id admin@10.0.0.20",check:w=>(w.remotes.web01?.keys.admin||[]).length>0},
        {t:"Create group sshusers and add admin to it",hint:"sudo groupadd sshusers\nsudo usermod -aG sshusers admin",check:w=>!!w.groups.sshusers&&w.groups.sshusers.members.includes("admin")},
        {t:"In sshd_config: PermitRootLogin no, PasswordAuthentication no, AllowGroups sshusers, MaxAuthTries 3",hint:"sudo vim /etc/ssh/sshd_config\n(or append the four lines with tee -a)",check:w=>sshd(w,"PermitRootLogin")==="no"&&sshd(w,"PasswordAuthentication")==="no"&&sshd(w,"AllowGroups")==="sshusers"&&sshd(w,"MaxAuthTries")==="3"},
        {t:"Test the config and reload sshd",hint:"sudo sshd -t && sudo systemctl reload sshd",check:(w,sh)=>LX.ran(sh,/sshd\s+-t/)&&LX.ran(sh,/systemctl\s+(reload|restart)\s+sshd/)}],
      solution:"ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519\nssh-copy-id admin@10.0.0.20\nsudo groupadd sshusers\nsudo usermod -aG sshusers admin\nsudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\nsudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config\nsudo sed -i 's/^#\\?MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config\necho 'AllowGroups sshusers' | sudo tee -a /etc/ssh/sshd_config\nsudo sshd -t\nsudo systemctl reload sshd",
      success:"The order matters: key first, group membership second, sshd changes last, and a syntax test before the reload."}},
    {id:"mactype",type:"match",title:"Match the security tool",scenario:"Tap a tool, then what it does.",
      items:[["restorecon","a"],["semanage port","b"],["aa-complain","c"],["faillock","d"],["visudo","e"],["cryptsetup","f"],["aide","g"]],
      slots:[["a","Resets SELinux file labels to their defaults"],["b","Lets a service use a non-standard port under SELinux"],["c","Puts an AppArmor profile in log-only mode"],["d","Shows and clears failed-login lockouts"],["e","Edits sudo rules with a syntax check"],["f","Manages LUKS encrypted devices"],["g","Checks files against a hash baseline"]],success:"Each tool has one job; knowing which fits is half the exam."},
    {id:"incident",type:"order",title:"Respond to a suspected compromise",scenario:"AIDE flags a changed /usr/bin/ps and outbound traffic to an unknown IP. Put the response in order.",
      steps:["Isolate the server from the network (keep it powered on)","Capture volatile evidence: processes, connections, logged-in users","Preserve logs and take a disk image","Find the root cause and scope from the evidence","Rebuild from known-good media and patch","Restore data, rotate credentials and keys, monitor"],success:"Contain, preserve, investigate, eradicate, recover. Rebuilding beats cleaning a rooted host."},
    {id:"selcall",type:"choice",title:"The SELinux service mystery",scenario:"After moving MariaDB's data to /srv/mysql, mariadb won't start. Permissions look right.",
      steps:[["What's your first move?",["Check for AVC denials: ausearch -m AVC -ts recent","setenforce 0 permanently","chmod -R 777 /srv/mysql","Reinstall MariaDB"],0,"Find out, don't guess."],
        ["The denial shows tcontext default_t on /srv/mysql. The right type is mysqld_db_t. What fixes it permanently?",["semanage fcontext -a -t mysqld_db_t '/srv/mysql(/.*)?' then restorecon -Rv /srv/mysql","chcon -R -t mysqld_db_t /srv/mysql","setsebool -P mysql_any on","audit2allow -M mysql"],0,"chcon would be undone by a relabel."],
        ["How do you confirm the label?",["ls -Zd /srv/mysql","getenforce","sestatus","id -Z"],0,"Check the directory and files."],
        ["Start it and verify",["systemctl start mariadb; systemctl status mariadb","reboot","setenforce 1","restorecon /"],0,"Then check the AVC log is quiet."]],success:"Label the new path with semanage fcontext, apply with restorecon, and SELinux stays enforcing."}
  ],
  badges:[
    ["reader","SEC","Security Scholar","Mark all 7 security lessons studied",c=>c.allStudied()],
    ["lab","DIA","Defender in Training","Complete all 17 diagrams and exercises in this module",c=>c.vizAll()],
    ["lock","FW","Locksmith","Lock down the new web server",c=>c.passed("lockdown")],
    ["luks","KEY","Encrypted at Rest","Encrypt a data disk with LUKS",c=>c.passed("luks")],
    ["ssh","SSH","Keymaster","Set up key-only SSH for the team",c=>c.passed("sshharden")],
    ["selinux","SE","Enforcing","Fix SELinux without turning it off (lesson lab and the mystery)",c=>c.earned("viz:selab")&&c.passed("selcall")],
    ["ir","IR","First Responder","Order the incident response steps",c=>c.passed("incident")],
    ["perfect","100","Hardened","Score 100% on a security quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
