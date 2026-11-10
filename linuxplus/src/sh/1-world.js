/* ================= Linux shell simulator: world model =================
   LX.world(opts) builds one simulated Linux server: a filesystem tree with owners, modes, ACLs, SELinux contexts and attributes,
   users and groups, packages, systemd units, processes, network, firewall, disks and LVM, cron, containers and Git.
   Everything is plain data, so lab task checks can read it directly. */
const LX={};
(function(){
const now=()=>Date.now();
let INO=1000;
/* ---------- filesystem nodes ---------- */
function D(mode,uid,gid){return {t:"d",mode:mode??0o755,uid:uid??0,gid:gid??0,k:{},m:now(),ino:INO++,nl:2}}
function F(c,mode,uid,gid){return {t:"f",mode:mode??0o644,uid:uid??0,gid:gid??0,c:c??"",m:now(),ino:INO++,nl:1}}
function L(to){return {t:"l",mode:0o777,uid:0,gid:0,to,m:now(),ino:INO++,nl:1}}
LX.D=D;LX.F=F;LX.L=L;
const norm=p=>{const out=[];p.split("/").forEach(s=>{if(!s||s===".")return;if(s==="..")out.pop();else out.push(s)});return "/"+out.join("/")};
LX.norm=norm;
LX.abs=(cwd,p,home)=>{if(p==null||p==="")return cwd;if(p==="~"||p.startsWith("~/"))p=(home||"/root")+p.slice(1);return norm(p.startsWith("/")?p:cwd+"/"+p)};
LX.dirname=p=>{const n=norm(p);return n==="/"?"/":n.replace(/\/[^/]*$/,"")||"/"};
LX.basename=p=>norm(p).split("/").pop()||"/";
/* walk a path; returns node or null. follow=true resolves a final symlink. Generated files have .gen(w). */
function lookup(w,path,follow=true,depth=0){
  if(depth>20)return null;const parts=norm(path).split("/").filter(Boolean);let n=w.root,cur="";
  for(let i=0;i<parts.length;i++){
    if(!n||n.t!=="d")return null;let c=n.k[parts[i]];if(!c)return null;cur+="/"+parts[i];
    if(c.t==="l"&&(follow||i<parts.length-1)){const tgt=c.to.startsWith("/")?c.to:LX.dirname(cur)+"/"+c.to;c=lookup(w,tgt,true,depth+1);if(!c)return null;cur=norm(tgt)}
    n=c}
  return n}
LX.lookup=lookup;
LX.parentOf=(w,path)=>lookup(w,LX.dirname(path));
LX.mkdirp=(w,path,mode,uid,gid)=>{const parts=norm(path).split("/").filter(Boolean);let n=w.root;
  parts.forEach(p=>{if(!n.k[p]){n.k[p]=D(mode,uid,gid);n.nl++}n=n.k[p];if(n.t==="l")n=lookup(w,n.to)});return n};
LX.put=(w,path,c,o={})=>{const dir=LX.mkdirp(w,LX.dirname(path));const name=LX.basename(path);
  const f=F(c,o.mode,o.uid,o.gid);if(o.sz)f.sz=o.sz;if(o.ctx)f.ctx=o.ctx;if(o.gen)f.gen=o.gen;dir.k[name]=f;return f};
LX.read=(w,path)=>{const n=lookup(w,path);if(!n||n.t!=="f")return null;return n.gen?n.gen(w):n.c};
LX.write=(w,path,c)=>{const n=lookup(w,path);if(n&&n.t==="f"){n.c=c;n.m=now();return n}return LX.put(w,path,c)};
LX.size=n=>n.t==="d"?4096:n.t==="l"?n.to.length:(n.sz!=null?n.sz:(n.gen?0:new Blob([n.c]).size));
LX.walk=(n,path,fn)=>{fn(n,path);if(n.t==="d")Object.keys(n.k).sort().forEach(k=>LX.walk(n.k[k],(path==="/"?"":path)+"/"+k,fn))};

/* ---------- users, groups, permissions ---------- */
LX.uidName=(w,uid)=>{for(const u in w.users)if(w.users[u].uid===uid)return u;return String(uid)};
LX.gidName=(w,gid)=>{for(const g in w.groups)if(w.groups[g].gid===gid)return g;return String(gid)};
LX.userGids=(w,u)=>{const U=w.users[u];if(!U)return [];const s=new Set([U.gid]);for(const g in w.groups)if(w.groups[g].members.includes(u))s.add(w.groups[g].gid);return [...s]};
/* can user u do r/w/x on node? honors ACLs (with mask), root override, and immutable attribute for writes */
LX.can=(w,u,n,b)=>{
  if(!n)return false;
  if(b==="w"&&n.attr&&n.attr.includes("i"))return false;
  const U=w.users[u];const uid=U?U.uid:65534;const bit={r:4,w:2,x:1}[b];
  if(uid===0)return b!=="x"||n.t==="d"||(n.mode&0o111)!==0;
  const gids=LX.userGids(w,u);
  if(n.uid===uid)return ((n.mode>>6)&bit)!==0;
  if(n.acl){const mask=n.acl.mask!=null?n.acl.mask:7;const ue=n.acl.u&&n.acl.u[u];if(ue!=null)return (ue&mask&bit)!==0;
    let gm=null;if(gids.includes(n.gid))gm=(n.mode>>3)&7;for(const g in (n.acl.g||{}))if(gids.includes(w.groups[g]?.gid))gm=(gm||0)|n.acl.g[g];
    if(gm!=null)return (gm&mask&bit)!==0}
  else if(gids.includes(n.gid))return ((n.mode>>3)&bit)!==0;
  return (n.mode&bit)!==0};
LX.modeStr=n=>{const t=n.dev||{d:"d",l:"l",f:"-"}[n.t]||"-";const m=n.mode;const r=(s,b)=>(m&b)?s:"-";
  let u=r("r",0o400)+r("w",0o200)+((m&0o4000)?((m&0o100)?"s":"S"):r("x",0o100));
  let g=r("r",0o040)+r("w",0o020)+((m&0o2000)?((m&0o010)?"s":"S"):r("x",0o010));
  let o=r("r",0o004)+r("w",0o002)+((m&0o1000)?((m&0o001)?"t":"T"):r("x",0o001));
  if(n.t==="l")return "lrwxrwxrwx";return t+u+g+o};
LX.octal=m=>(m&0o7777).toString(8).padStart(4,"0");

/* ---------- SELinux default file contexts ---------- */
const FCTX=[[/^\/var\/www(\/.*)?$/,"httpd_sys_content_t"],[/^\/var\/www\/cgi-bin(\/.*)?$/,"httpd_sys_script_exec_t"],[/^\/home\/[^/]+\/\.ssh(\/.*)?$/,"ssh_home_t"],[/^\/home(\/.*)?$/,"user_home_t"],[/^\/root(\/.*)?$/,"admin_home_t"],
  [/^\/tmp(\/.*)?$/,"tmp_t"],[/^\/etc\/ssh(\/.*)?$/,"sshd_key_t"],[/^\/etc(\/.*)?$/,"etc_t"],[/^\/var\/log(\/.*)?$/,"var_log_t"],[/^\/srv(\/.*)?$/,"var_t"],[/^\/usr\/s?bin(\/.*)?$/,"bin_t"],[/^\/var\/lib\/mysql(\/.*)?$/,"mysqld_db_t"],[/^\/(.*)$/,"default_t"]];
LX.defCtx=(w,path)=>{for(const [re,t] of (w.selinux.rules||[]))if(re.test(path))return t;for(const [re,t] of FCTX)if(re.test(path))return t;return "default_t"};
LX.ctxOf=(w,path,n)=>n.ctx||LX.defCtx(w,path);

/* ---------- package catalog ---------- */
/* name:{v,d,bins,units,files,deb (debian name), rh (rhel name)} */
const PKG={
  "bash":{v:"5.2.26",d:"The GNU Bourne Again shell",bins:["bash","sh"],base:1},
  "coreutils":{v:"9.4",d:"GNU core utilities",bins:[],base:1},
  "openssh-server":{v:"9.6p1",d:"OpenSSH server daemon",bins:["sshd"],units:["sshd"],base:1,deb:"openssh-server"},
  "openssh-clients":{v:"9.6p1",d:"OpenSSH client applications",bins:["ssh","scp","ssh-keygen","ssh-copy-id","sftp"],base:1,deb:"openssh-client"},
  "python3":{v:"3.12.3",d:"Python 3 interpreter",bins:["python3","pip","pip3"],base:1},
  "git":{v:"2.45.2",d:"Fast distributed version control system",bins:["git"]},
  "httpd":{v:"2.4.62",d:"Apache HTTP Server",bins:["httpd","apachectl"],units:["httpd"],deb:"apache2"},
  "nginx":{v:"1.26.1",d:"A high performance web server and reverse proxy",bins:["nginx"],units:["nginx"]},
  "mariadb-server":{v:"10.11.8",d:"The MariaDB database server",bins:["mariadb","mysql"],units:["mariadb"]},
  "vim-enhanced":{v:"9.1.0",d:"A version of the vim editor with extra features",bins:["vim"],deb:"vim"},
  "nano":{v:"8.1",d:"A small text editor",bins:["nano"],base:1},
  "tmux":{v:"3.4",d:"A terminal multiplexer",bins:["tmux"]},
  "htop":{v:"3.3.0",d:"Interactive process viewer",bins:["htop"]},
  "podman":{v:"5.1.2",d:"Manage pods, containers and container images",bins:["podman"]},
  "docker-ce":{v:"27.1.1",d:"Docker container engine",bins:["docker"],units:["docker"],deb:"docker.io"},
  "ansible-core":{v:"2.16.3",d:"Radically simple IT automation",bins:["ansible","ansible-playbook","ansible-galaxy","ansible-vault","ansible-inventory"],deb:"ansible"},
  "chrony":{v:"4.5",d:"An NTP client and server",bins:["chronyc"],units:["chronyd"],base:1},
  "nmap":{v:"7.95",d:"Network exploration tool and security scanner",bins:["nmap"]},
  "tcpdump":{v:"4.99.4",d:"Command-line packet analyzer",bins:["tcpdump"]},
  "bind-utils":{v:"9.18.27",d:"DNS lookup utilities (dig, host, nslookup)",bins:["dig","host","nslookup"],deb:"dnsutils",base:1},
  "policycoreutils-python-utils":{v:"3.6",d:"SELinux policy core python utilities (semanage)",bins:["semanage","audit2allow","audit2why"],base:1,deb:"policycoreutils-python-utils"},
  "fail2ban":{v:"1.1.0",d:"Bans IPs that make too many password failures",bins:["fail2ban-client"],units:["fail2ban"]},
  "aide":{v:"0.18.6",d:"Advanced Intrusion Detection Environment",bins:["aide"]},
  "sysstat":{v:"12.7.5",d:"Performance monitoring tools (sar, iostat, mpstat)",bins:["sar","iostat","mpstat","pidstat"]},
  "lvm2":{v:"2.03.24",d:"Userland logical volume management tools",bins:[],base:1},
  "rsync":{v:"3.3.0",d:"A program for synchronizing files over a network",bins:["rsync"],base:1},
  "tar":{v:"1.35",d:"GNU file archiving program",bins:["tar"],base:1},
  "cronie":{v:"1.7.0",d:"Cron daemon for executing programs at set times",bins:["crontab"],units:["crond"],base:1,deb:"cron"},
  "at":{v:"3.2.5",d:"Job spooling tools",bins:["at","atq","atrm"],units:["atd"]},
  "wget":{v:"1.24.5",d:"A utility for retrieving files using HTTP or FTP",bins:["wget"]},
  "curl":{v:"8.6.0",d:"A utility for getting files from remote servers",bins:["curl"],base:1},
  "net-tools":{v:"2.0",d:"Obsolete networking tools (ifconfig, netstat, route)",bins:["ifconfig","netstat","route"]},
  "traceroute":{v:"2.1.5",d:"Traces the route taken by packets",bins:["traceroute"]},
  "mtr":{v:"0.95",d:"Network diagnostic tool combining ping and traceroute",bins:["mtr"]},
  "lsof":{v:"4.98",d:"Lists open files",bins:["lsof"],base:1},
  "strace":{v:"6.9",d:"Tracks and displays system calls",bins:["strace"]},
  "cowsay":{v:"3.8.4",d:"Configurable speaking cow",bins:["cowsay"]},
  "nfs-utils":{v:"2.7.1",d:"NFS utilities and supporting clients and daemons",bins:["showmount","exportfs"],units:["nfs-server"],deb:"nfs-kernel-server"},
  "samba":{v:"4.20.2",d:"Server and client software to interoperate with Windows",bins:["smbpasswd"],units:["smb"]},
  "firewalld":{v:"2.1.1",d:"A firewall daemon with D-Bus interface",bins:["firewall-cmd"],units:["firewalld"]},
  "ufw":{v:"0.36.2",d:"Uncomplicated firewall",bins:["ufw"],units:["ufw"]},
  "gnupg2":{v:"2.4.5",d:"Utility for secure communication and data storage",bins:["gpg"],base:1,deb:"gnupg"},
  "openssl":{v:"3.2.2",d:"Utilities from the general purpose cryptography library",bins:["openssl"],base:1},
  "cryptsetup":{v:"2.7.2",d:"Utility for setting up encrypted disks (LUKS)",bins:["cryptsetup"],base:1},
  "audit":{v:"3.1.2",d:"User space tools for kernel auditing",bins:["ausearch","aureport","auditctl"],units:["auditd"],base:1,deb:"auditd"},
  "rsyslog":{v:"8.2310",d:"Enhanced system logging and kernel message trapping daemon",bins:[],units:["rsyslog"],base:1},
  "kmod":{v:"31",d:"Linux kernel module management utilities",bins:[],base:1},
  "parted":{v:"3.6",d:"The GNU disk partition manipulation program",bins:["parted"],base:1},
  "xfsprogs":{v:"6.4.0",d:"Utilities for managing the XFS filesystem",bins:["mkfs.xfs","xfs_growfs","xfs_repair","xfs_info"],base:1},
  "e2fsprogs":{v:"1.47.0",d:"Utilities for managing ext2, ext3 and ext4 filesystems",bins:["mkfs.ext4","resize2fs","e2fsck","tune2fs","dumpe2fs"],base:1},
  "mdadm":{v:"4.3",d:"Controls Linux software RAID arrays",bins:["mdadm"]},
  "smartmontools":{v:"7.4",d:"Tools for monitoring SMART capable hard disks",bins:["smartctl"]}
};
LX.PKG=PKG;
LX.pkgName=(w,n)=>{if(w.distro==="debian"){for(const k in PKG)if((PKG[k].deb||k)===n)return k;return null}for(const k in PKG)if(k===n)return k;if(n==="vim")return "vim-enhanced";return null};
LX.pkgDisp=(w,k)=>w.distro==="debian"?(PKG[k].deb||k):k;

/* ---------- systemd units ---------- */
const UNITS={
  sshd:{d:"OpenSSH server daemon",exec:"/usr/sbin/sshd -D",ports:()=>null,deb:"ssh"},
  crond:{d:"Command Scheduler",exec:"/usr/sbin/crond -n",deb:"cron"},
  firewalld:{d:"firewalld - dynamic firewall daemon",exec:"/usr/bin/python3 -s /usr/sbin/firewalld --nofork"},
  ufw:{d:"Uncomplicated firewall",exec:"/lib/ufw/ufw-init start"},
  chronyd:{d:"NTP client/server",exec:"/usr/sbin/chronyd -F 2",deb:"chrony"},
  rsyslog:{d:"System Logging Service",exec:"/usr/sbin/rsyslogd -n"},
  auditd:{d:"Security Auditing Service",exec:"/sbin/auditd"},
  NetworkManager:{d:"Network Manager",exec:"/usr/sbin/NetworkManager --no-daemon"},
  "systemd-journald":{d:"Journal Service",exec:"/usr/lib/systemd/systemd-journald"},
  httpd:{d:"The Apache HTTP Server",exec:"/usr/sbin/httpd -DFOREGROUND",user:"apache",deb:"apache2"},
  nginx:{d:"The nginx HTTP and reverse proxy server",exec:"/usr/sbin/nginx",user:"nginx"},
  mariadb:{d:"MariaDB 10.11 database server",exec:"/usr/libexec/mariadbd --basedir=/usr",user:"mysql"},
  docker:{d:"Docker Application Container Engine",exec:"/usr/bin/dockerd -H fd://"},
  fail2ban:{d:"Fail2Ban Service",exec:"/usr/bin/fail2ban-server -xf start"},
  atd:{d:"Deferred execution scheduler",exec:"/usr/sbin/atd -f"},
  "nfs-server":{d:"NFS server and services",exec:"/usr/sbin/rpc.nfsd"},
  smb:{d:"Samba SMB Daemon",exec:"/usr/sbin/smbd --foreground --no-process-group"}
};
LX.UNITS=UNITS;
/* name used on screen (debian renames some units) */
LX.unitName=(w,n)=>w.distro==="debian"&&UNITS[n]?.deb?UNITS[n].deb:n;
LX.unitKey=(w,n)=>{n=String(n).replace(/\.service$/,"");if(w.units[n])return n;for(const k in w.units)if(LX.unitName(w,k)===n)return k;
  if(n==="ssh"&&w.units.sshd)return "sshd";if(n==="apache2"&&w.units.httpd)return "httpd";if(n==="cron"&&w.units.crond)return "crond";return null};

/* ---------- world builder ---------- */
LX.world=function(o={}){
  const deb=o.distro==="debian";
  const w={distro:deb?"debian":"rhel",host:o.host||"server1",domain:"example.lan",root:D(0o555),users:{},groups:{},procs:[],nextPid:1840,units:{},installed:new Set(),
    journal:[],dmesg:[],flags:{},hist:[],cron:{},at:[],ctrs:[],images:[],repos:{},remotes:o.remotes||{},kmods:["xfs","ext4","e1000","virtio_net","nf_tables","ip_tables","br_netfilter","overlay","dm_mod"],sysctl:{"net.ipv4.ip_forward":"0","vm.swappiness":"60","kernel.hostname":o.host||"server1","net.ipv4.icmp_echo_ignore_all":"0","fs.file-max":"9223372036854775807","kernel.randomize_va_space":"2"},
    selinux:{mode:deb?"disabled":"enforcing",cfg:deb?"disabled":"enforcing",bools:{httpd_can_network_connect:false,httpd_enable_homedirs:false,httpd_can_network_connect_db:false,ssh_sysadm_login:false,samba_enable_home_dirs:false},rules:[],ports:{ssh_port_t:["tcp 22"],http_port_t:["tcp 80","tcp 81","tcp 443","tcp 488","tcp 8008","tcp 8009","tcp 8443","tcp 9000"],mysqld_port_t:["tcp 1186","tcp 3306"]},avc:[]},
    apparmor:deb?{enabled:true,profiles:{"/usr/sbin/nginx":"enforce","/usr/sbin/cupsd":"complain","/usr/bin/man":"enforce"}}:null,
    mem:{total:7944,base:1180},cpus:4,time:now(),uptime:3*86400+4*3600+1260,boot:{target:"multi-user.target",kernel:"6.12.0-55.el9.x86_64"},
    net:{ifs:{},routes:[],peers:{},inet:{},dns:{},hostsReach:{}},fw:null,disks:{},fs:{},mounts:[],lvm:{pv:{},vg:{},lv:{}},swaps:[],raid:{},
    luks:{},containers:null,remoteKeys:{}};
  if(deb)w.boot.kernel="6.8.0-48-generic";
  const R=w.root;
  ["bin","boot","dev","etc","home","lib","lib64","media","mnt","opt","proc","root","run","sbin","srv","sys","tmp","usr","var"].forEach(d=>{R.k[d]=D(0o755);R.nl++});
  R.k.root.mode=0o550;R.k.tmp.mode=0o1777;R.k.proc.mode=0o555;
  ["bin","sbin","lib","lib64","local","share","libexec"].forEach(d=>LX.mkdirp(w,"/usr/"+d));["bin","sbin","lib","share","etc"].forEach(d=>LX.mkdirp(w,"/usr/local/"+d));
  ["log","lib","cache","spool","tmp","www","opt","mail","run"].forEach(d=>LX.mkdirp(w,"/var/"+d));
  w.root.k.var.k.tmp.mode=0o1777;
  ["bin","sbin","lib","lib64"].forEach(d=>{R.k[d]=L("usr/"+d)});
  /* groups and users */
  const G=(n,gid,mem=[])=>w.groups[n]={gid,members:mem};
  G("root",0);G("bin",1);G("daemon",2);G("sys",3);G("adm",4,deb?["syslog"]:[]);G("tty",5);G("disk",6);G("lp",7);G("mail",12);G("wheel",10,deb?[]:["admin"]);G("sudo",27,deb?["admin"]:[]);
  G("users",100);G("nobody",65534);G(deb?"www-data":"apache",deb?33:48);G("sshd",74);G("docker",988);G("systemd-journal",190);
  const U=(n,uid,gid,home,shell,gecos)=>w.users[n]={uid,gid,home,shell:shell||"/bin/bash",gecos:gecos||"",pw:"$6$rounds=5000$x",locked:false,maxd:99999,mind:0,warn:7,last:19950,exp:null,inact:null};
  U("root",0,0,"/root","/bin/bash","root");U("bin",1,1,"/bin","/sbin/nologin","bin");U("daemon",2,2,"/sbin","/sbin/nologin","daemon");
  U(deb?"www-data":"apache",deb?33:48,deb?33:48,deb?"/var/www":"/usr/share/httpd","/sbin/nologin","Apache");U("sshd",74,74,"/usr/share/empty.sshd","/sbin/nologin","Privilege-separated SSH");U("nobody",65534,65534,"/","/sbin/nologin","Kernel Overflow User");
  w.users.bin.pw=w.users.daemon.pw=w.users.sshd.pw=w.users.nobody.pw=w.users[deb?"www-data":"apache"].pw="!!";
  const mkUser=(n,uid,gecos)=>{G(n,uid);U(n,uid,uid,"/home/"+n,"/bin/bash",gecos);const h=LX.mkdirp(w,"/home/"+n,0o700,uid,uid);
    LX.put(w,`/home/${n}/.bashrc`,"# .bashrc\n\n# Source global definitions\nif [ -f /etc/bashrc ]; then\n    . /etc/bashrc\nfi\n\n# User specific aliases and functions\nalias ll='ls -l'\n",{uid,gid:uid});
    LX.put(w,`/home/${n}/.bash_profile`,"# .bash_profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\nPATH=$PATH:$HOME/bin\nexport PATH\n",{uid,gid:uid});return h};
  w.mkUser=mkUser;
  mkUser("admin",1000,"Server Admin");
  (o.users||[]).forEach((u,i)=>mkUser(u,1001+i,""));
  /* /etc */
  const E=(p,c,m)=>LX.put(w,"/etc/"+p,c,m?{mode:m}:{});
  E("passwd","",0o644).gen=w=>Object.entries(w.users).map(([n,u])=>`${n}:x:${u.uid}:${u.gid}:${u.gecos}:${u.home}:${u.shell}`).join("\n")+"\n";
  E("group","",0o644).gen=w=>Object.entries(w.groups).map(([n,g])=>`${n}:x:${g.gid}:${g.members.join(",")}`).join("\n")+"\n";
  const sh=E("shadow","",0o000);sh.gen=w=>Object.entries(w.users).map(([n,u])=>`${n}:${u.locked?"!":""}${u.pw}:${u.last}:${u.mind}:${u.maxd}:${u.warn}:${u.inact??""}:${u.exp??""}:`).join("\n")+"\n";
  E("gshadow","",0o000).gen=w=>Object.entries(w.groups).map(([n,g])=>`${n}:!::${g.members.join(",")}`).join("\n")+"\n";
  E("hostname","").gen=w=>w.host+"\n";
  E("hosts","127.0.0.1   localhost localhost.localdomain\n::1         localhost localhost.localdomain\n");
  E("resolv.conf","# Generated by NetworkManager\nsearch example.lan\nnameserver 10.0.0.53\n");
  E("fstab",deb?"# /etc/fstab: static file system information.\nUUID=3f2a9c1e-77b4-4c39-9a51-0d6c7e2b8a10 /         ext4    errors=remount-ro 0 1\nUUID=7C1A-3B2F                            /boot/efi vfat    umask=0077        0 1\n/swap.img                                 none      swap    sw                0 0\n":"#\n# /etc/fstab\n# Created by anaconda\n#\n/dev/mapper/rhel-root   /                       xfs     defaults        0 0\nUUID=6b2f8c3e-1d4a-4e1b-9f2a-5c7d8e9f0a1b /boot   xfs     defaults        0 0\nUUID=7C1A-3B2F          /boot/efi               vfat    umask=0077,shortname=winnt 0 2\n/dev/mapper/rhel-swap   none                    swap    defaults        0 0\n");
  E("os-release",deb?'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\n':'NAME="Red Hat Enterprise Linux"\nVERSION="9.5 (Plow)"\nID="rhel"\nID_LIKE="fedora"\nVERSION_ID="9.5"\nPRETTY_NAME="Red Hat Enterprise Linux 9.5 (Plow)"\n');
  E("sudoers","## Sudoers allows particular users to run various commands as\n## the root user, without needing the root password.\n##\n## Edit this file with visudo, never directly.\nDefaults    !visiblepw\nDefaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin\n\n## Allow root to run any commands anywhere\nroot    ALL=(ALL)       ALL\n\n"+(deb?"## Members of group sudo may execute any command\n%sudo   ALL=(ALL:ALL)   ALL\n":"## Allows people in group wheel to run all commands\n%wheel  ALL=(ALL)       ALL\n")+"\n#includedir /etc/sudoers.d\n",0o440);
  LX.mkdirp(w,"/etc/sudoers.d",0o750);
  E("login.defs","# Password aging controls:\nPASS_MAX_DAYS   99999\nPASS_MIN_DAYS   0\nPASS_WARN_AGE   7\n\nUID_MIN                  1000\nUID_MAX                 60000\nSYS_UID_MIN               201\nCREATE_HOME     yes\nUMASK           022\nENCRYPT_METHOD SHA512\n");
  E("security/pwquality.conf","# Configuration for systemwide password quality limits\n# minlen = 8\n# dcredit = 0\n# ucredit = 0\n# lcredit = 0\n# ocredit = 0\n# minclass = 0\n");
  E("security/faillock.conf","# deny = 3\n# unlock_time = 600\n# silent\n");
  E("security/limits.conf","# /etc/security/limits.conf\n#<domain>      <type>  <item>         <value>\n#*               soft    core            0\n#@student        hard    nproc           20\n");
  E("pam.d/sshd","#%PAM-1.0\nauth       substack     password-auth\nauth       include      postlogin\naccount    required     pam_sepermit.so\naccount    required     pam_nologin.so\naccount    include      password-auth\npassword   include      password-auth\nsession    required     pam_selinux.so close\nsession    required     pam_loginuid.so\nsession    required     pam_selinux.so open env_params\nsession    optional     pam_keyinit.so force revoke\nsession    include      password-auth\nsession    include      postlogin\n");
  E("pam.d/system-auth","#%PAM-1.0\nauth        required      pam_env.so\nauth        required      pam_faillock.so preauth silent\nauth        sufficient    pam_unix.so nullok\nauth        [default=die] pam_faillock.so authfail\nauth        required      pam_deny.so\n\naccount     required      pam_unix.so\n\npassword    requisite     pam_pwquality.so local_users_only\npassword    sufficient    pam_unix.so sha512 shadow use_authtok\npassword    required      pam_deny.so\n\nsession     optional      pam_keyinit.so revoke\nsession     required      pam_limits.so\nsession     required      pam_unix.so\n");
  E("ssh/sshd_config","#\t$OpenBSD: sshd_config,v 1.104 $\n\n# This is the sshd server system-wide configuration file.\n\nInclude /etc/ssh/sshd_config.d/*.conf\n\n#Port 22\n#AddressFamily any\n#ListenAddress 0.0.0.0\n\n#PermitRootLogin prohibit-password\n#MaxAuthTries 6\n\n#PubkeyAuthentication yes\nAuthorizedKeysFile\t.ssh/authorized_keys\n\n#PasswordAuthentication yes\n#PermitEmptyPasswords no\n\nX11Forwarding no\n#AllowUsers\n#Banner none\n\nSubsystem\tsftp\t/usr/libexec/openssh/sftp-server\n",0o600);
  LX.mkdirp(w,"/etc/ssh/sshd_config.d");
  E("ssh/ssh_host_ed25519_key","-----BEGIN OPENSSH PRIVATE KEY-----\n(host private key)\n-----END OPENSSH PRIVATE KEY-----\n",0o600);
  E("ssh/ssh_host_ed25519_key.pub","ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHk2b3Rvc3Q root@"+w.host+"\n");
  E("crontab","SHELL=/bin/bash\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n\n# Example of job definition:\n# .---------------- minute (0 - 59)\n# |  .------------- hour (0 - 23)\n# |  |  .---------- day of month (1 - 31)\n# |  |  |  .------- month (1 - 12)\n# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7)\n# |  |  |  |  |\n# *  *  *  *  * user-name  command to be executed\n");
  ["cron.d","cron.daily","cron.hourly","cron.weekly","cron.monthly","profile.d","skel","yum.repos.d","sysctl.d","modprobe.d","systemd/system","systemd/system/multi-user.target.wants","logrotate.d","exports.d","selinux"].forEach(d=>LX.mkdirp(w,"/etc/"+d));
  E("cron.allow","");delete w.root.k.etc.k["cron.allow"];
  E("selinux/config","# This file controls the state of SELinux on the system.\n# SELINUX= can take one of these three values:\n#     enforcing - SELinux security policy is enforced.\n#     permissive - SELinux prints warnings instead of enforcing.\n#     disabled - No SELinux policy is loaded.\nSELINUX="+(deb?"disabled":"enforcing")+"\nSELINUXTYPE=targeted\n");
  E("sysctl.conf","# sysctl settings are defined through files in\n# /usr/lib/sysctl.d/, /run/sysctl.d/, and /etc/sysctl.d/.\n");
  E("logrotate.conf","# see \"man logrotate\" for details\n# rotate log files weekly\nweekly\n\n# keep 4 weeks worth of backlogs\nrotate 4\n\n# create new (empty) log files after rotating old ones\ncreate\n\n# use date as a suffix of the rotated file\ndateext\n\ncompress\n\ninclude /etc/logrotate.d\n");
  E("logrotate.d/rsyslog","/var/log/messages /var/log/secure /var/log/maillog /var/log/cron\n{\n    missingok\n    sharedscripts\n    postrotate\n        /usr/bin/systemctl -s HUP kill rsyslog.service >/dev/null 2>&1 || true\n    endscript\n}\n");
  E("bashrc","# /etc/bashrc\n# System wide functions and aliases\n# Environment stuff goes in /etc/profile\n");
  E("profile","# /etc/profile\n# System wide environment and startup programs, for login setup\n# Functions and aliases go in /etc/bashrc\n");
  E("environment","");
  E("default/grub",'GRUB_TIMEOUT=5\nGRUB_DISTRIBUTOR="$(sed \'s, release .*$,,g\' /etc/system-release)"\nGRUB_DEFAULT=saved\nGRUB_DISABLE_SUBMENU=true\nGRUB_TERMINAL_OUTPUT="console"\nGRUB_CMDLINE_LINUX="crashkernel=1G-4G:192M,4G-64G:256M rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet"\nGRUB_DISABLE_RECOVERY="true"\nGRUB_ENABLE_BLSCFG=true\n');
  E("chrony.conf","# Use public servers from the pool.ntp.org project.\npool 2.rhel.pool.ntp.org iburst\n\n# Record the rate at which the system clock gains/losses time.\ndriftfile /var/lib/chrony/drift\n\nmakestep 1.0 3\nrtcsync\nlogdir /var/log/chrony\n");
  E("timezone","America/New_York\n");
  E("motd","");E("issue","\\S\nKernel \\r on an \\m\n");
  E("exports","");
  E("modprobe.d/blacklist.conf","# Blacklisted kernel modules\n");
  if(!deb){E("yum.repos.d/rhel.repo","[rhel-9-baseos]\nname=Red Hat Enterprise Linux 9 - BaseOS\nbaseurl=https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n\n[rhel-9-appstream]\nname=Red Hat Enterprise Linux 9 - AppStream\nbaseurl=https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os\nenabled=1\ngpgcheck=1\n")}
  else{LX.mkdirp(w,"/etc/apt/sources.list.d");E("apt/sources.list.d/ubuntu.sources","Types: deb\nURIs: http://archive.ubuntu.com/ubuntu\nSuites: noble noble-updates noble-backports\nComponents: main restricted universe multiverse\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n");LX.mkdirp(w,"/etc/netplan");E("netplan/50-cloud-init.yaml","network:\n  version: 2\n  ethernets:\n    eth0:\n      addresses:\n        - 10.0.0.15/24\n      routes:\n        - to: default\n          via: 10.0.0.1\n      nameservers:\n        addresses: [10.0.0.53]\n",0o600);LX.mkdirp(w,"/etc/apparmor.d")}
  LX.put(w,"/etc/skel/.bashrc","# .bashrc\nalias ll='ls -l'\n");LX.put(w,"/etc/skel/.bash_profile","# .bash_profile\n");
  /* /proc and /sys generated files */
  LX.put(w,"/proc/cpuinfo","").gen=w=>Array.from({length:w.cpus},(_,i)=>`processor\t: ${i}\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz\ncpu MHz\t\t: 2000.000\ncache size\t: 49152 KB\ncpu cores\t: ${w.cpus}\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat lm vmx aes avx avx2\n`).join("\n");
  LX.put(w,"/proc/meminfo","").gen=w=>{const m=LX.memUse(w);return `MemTotal:       ${m.total*1024} kB\nMemFree:        ${m.free*1024} kB\nMemAvailable:   ${m.avail*1024} kB\nBuffers:          51200 kB\nCached:         ${m.cache*1024} kB\nSwapTotal:      ${LX.swapTotal(w)*1024} kB\nSwapFree:       ${LX.swapTotal(w)*1024} kB\n`};
  LX.put(w,"/proc/loadavg","").gen=w=>{const l=LX.load(w);return `${l[0]} ${l[1]} ${l[2]} 2/${200+w.procs.length} ${w.nextPid}\n`};
  LX.put(w,"/proc/version","").gen=w=>`Linux version ${w.boot.kernel} (mockbuild@build) (gcc version 11.5.0) #1 SMP PREEMPT_DYNAMIC\n`;
  LX.put(w,"/proc/cmdline","").gen=w=>`BOOT_IMAGE=(hd0,gpt2)/vmlinuz-${w.boot.kernel} root=/dev/mapper/rhel-root ro crashkernel=1G-4G:192M rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet\n`;
  LX.put(w,"/proc/sys/net/ipv4/ip_forward","").gen=w=>w.sysctl["net.ipv4.ip_forward"]+"\n";
  LX.put(w,"/proc/mounts","").gen=w=>w.mounts.map(m=>`${m.src} ${m.tgt} ${m.type} ${m.opts||"rw,relatime"} 0 0`).join("\n")+"\n";
  LX.put(w,"/proc/partitions","").gen=w=>"major minor  #blocks  name\n\n"+Object.entries(w.disks).flatMap(([d,x])=>[`   8        0 ${x.size*1048576} ${d}`,...x.parts.map((p,i)=>`   8        ${i+1} ${p.size*1048576} ${LX.partName(d,p.n)}`)]).join("\n")+"\n";
  LX.put(w,"/proc/swaps","").gen=w=>"Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n"+w.swaps.map(s=>`${s.dev}\t\t${s.dev.startsWith("/dev")?"partition":"file"}\t${s.size*1048576}\t\t0\t\t-2`).join("\n")+(w.swaps.length?"\n":"");
  LX.put(w,"/proc/mdstat","").gen=w=>"Personalities : [raid1] [raid5] [raid6]\n"+Object.entries(w.raid).map(([n,r])=>`${n} : active raid${r.level} ${r.devs.map((d,i)=>LX.basename(d)+"["+i+"]"+(r.failed?.includes(d)?"(F)":"")).join(" ")}\n      ${r.size*1048576} blocks [${r.devs.length}/${r.devs.length-(r.failed||[]).length}] [${r.devs.map(d=>r.failed?.includes(d)?"_":"U").join("")}]`).join("\n")+"\nunused devices: <none>\n";
  /* home, logs, /usr/bin markers */
  LX.mkdirp(w,"/var/log/journal");LX.mkdirp(w,"/var/log/audit",0o700);
  LX.put(w,deb?"/var/log/syslog":"/var/log/messages","",{mode:0o600}).gen=w=>w.journal.filter(j=>j.u!=="sshd"&&j.u!=="sudo").map(j=>LX.jline(w,j)).join("\n")+"\n";
  LX.put(w,deb?"/var/log/auth.log":"/var/log/secure","",{mode:0o600}).gen=w=>w.journal.filter(j=>j.u==="sshd"||j.u==="sudo"||j.u==="su"||j.u==="useradd").map(j=>LX.jline(w,j)).join("\n")+"\n";
  LX.put(w,"/var/log/audit/audit.log","",{mode:0o600}).gen=w=>w.selinux.avc.map(a=>a.raw).join("\n")+(w.selinux.avc.length?"\n":"");
  LX.put(w,"/var/log/dmesg","").gen=w=>w.dmesg.join("\n")+"\n";
  LX.put(w,"/var/log/cron","",{mode:0o600});LX.put(w,"/var/log/boot.log","[  OK  ] Reached target multi-user.target - Multi-User System.\n",{mode:0o600});
  LX.put(w,"/var/log/lastlog","",{sz:292292});LX.put(w,"/var/log/wtmp","",{sz:38400});
  LX.mkdirp(w,"/var/www/html");LX.mkdirp(w,"/var/spool/cron",0o700);LX.mkdirp(w,"/boot/grub2");
  LX.put(w,"/boot/vmlinuz-"+w.boot.kernel,"",{sz:14168456,mode:0o755});LX.put(w,"/boot/initramfs-"+w.boot.kernel+".img","",{sz:38211520,mode:0o600});
  LX.put(w,"/boot/grub2/grub.cfg","# DO NOT EDIT THIS FILE\n# It is automatically generated by grub2-mkconfig using templates from /etc/grub.d and settings from /etc/default/grub\n",{mode:0o600});
  LX.put(w,"/root/anaconda-ks.cfg","# Generated by Anaconda\n",{mode:0o600});
  LX.put(w,"/usr/share/dict/words","apple\nbanana\ncherry\n");
  /* disks and mounts */
  if(deb){w.disks={sda:{size:40,model:"QEMU HARDDISK",parts:[{n:1,size:1,type:"EFI System"},{n:2,size:39,type:"Linux filesystem"}]}};
    w.fs={"/dev/sda1":{type:"vfat",uuid:"7C1A-3B2F",size:1,used:0.01},"/dev/sda2":{type:"ext4",uuid:"3f2a9c1e-77b4-4c39-9a51-0d6c7e2b8a10",size:38.5,used:9.6}};
    w.mounts=[{src:"/dev/sda2",tgt:"/",type:"ext4"},{src:"/dev/sda1",tgt:"/boot/efi",type:"vfat"}];LX.put(w,"/swap.img","",{mode:0o600,sz:2147483648});w.swaps=[{dev:"/swap.img",size:2}]}
  else{w.disks={sda:{size:40,model:"QEMU HARDDISK",parts:[{n:1,size:0.6,type:"EFI System"},{n:2,size:1,type:"Linux filesystem"},{n:3,size:38.4,type:"Linux LVM"}]}};
    w.lvm={pv:{"/dev/sda3":{vg:"rhel",size:38.4}},vg:{rhel:{}},lv:{"rhel/root":{size:34.4},"rhel/swap":{size:4}}};
    w.fs={"/dev/sda1":{type:"vfat",uuid:"7C1A-3B2F",size:0.6,used:0.01},"/dev/sda2":{type:"xfs",uuid:"6b2f8c3e-1d4a-4e1b-9f2a-5c7d8e9f0a1b",size:0.96,used:0.31},"/dev/mapper/rhel-root":{type:"xfs",uuid:"a91c3e55-2f1d-4b9a-8e47-1c2d3e4f5a6b",size:34.4,used:6.8},"/dev/mapper/rhel-swap":{type:"swap",uuid:"0e8d6c4b-9a71-4f3e-b2d5-8c6a4e2f1b3d",size:4}};
    w.mounts=[{src:"/dev/mapper/rhel-root",tgt:"/",type:"xfs"},{src:"/dev/sda2",tgt:"/boot",type:"xfs"},{src:"/dev/sda1",tgt:"/boot/efi",type:"vfat"}];w.swaps=[{dev:"/dev/dm-1",size:4}]}
  (o.disks||[]).forEach(([n,size])=>w.disks[n]={size,model:"QEMU HARDDISK",parts:[]});
  /* network */
  w.net.ifs={lo:{ip:"127.0.0.1",prefix:8,up:true,mac:"00:00:00:00:00:00",mtu:65536},eth0:{ip:"10.0.0.15",prefix:24,up:true,mac:"52:54:00:8a:3c:01",mtu:1500,con:deb?"netplan-eth0":"eth0",ip6:"fe80::5054:ff:fe8a:3c01"}};
  w.net.routes=[{dst:"default",via:"10.0.0.1",dev:"eth0"}];
  w.net.peers={"10.0.0.1":"gateway","10.0.0.53":"dns1","10.0.0.20":"web01","10.0.0.21":"web02","10.0.0.30":"db01","10.0.0.40":"backup01"};
  w.net.inet={"93.184.216.34":"example.com","8.8.8.8":"dns.google","1.1.1.1":"one.one.one.one","185.199.108.153":"github.io","140.82.112.3":"github.com"};
  w.net.dns={"example.com":"93.184.216.34","www.example.com":"93.184.216.34","github.com":"140.82.112.3","dns.google":"8.8.8.8","web01.example.lan":"10.0.0.20","web02.example.lan":"10.0.0.21","db01.example.lan":"10.0.0.30","backup01.example.lan":"10.0.0.40","gateway.example.lan":"10.0.0.1","repo.example.lan":"10.0.0.20"};
  w.net.dnsUp=true;
  /* firewall */
  w.fw=deb?{kind:"ufw",ufw:{on:false,rules:[],def:{in:"deny",out:"allow"}},ipt:[]}:{kind:"firewalld",zone:"public",rt:{services:["cockpit","dhcpv6-client","ssh"],ports:[],rich:[],sources:[]},perm:{services:["cockpit","dhcpv6-client","ssh"],ports:[],rich:[],sources:[]},ipt:[]};
  /* packages and units */
  Object.entries(PKG).forEach(([k,p])=>{if(p.base)w.installed.add(k)});
  w.installed.add(deb?"ufw":"firewalld");w.installed.add("vim-enhanced");w.installed.add("nano");
  const base=["sshd","crond","chronyd","rsyslog","systemd-journald",deb?"ufw":"firewalld","auditd"];if(!deb)base.push("NetworkManager");
  base.forEach(u=>LX.addUnit(w,u,true,true));
  if(deb){w.units.ufw.active="active"}
  LX.jlog(w,"kernel",6,"Linux version "+w.boot.kernel);LX.jlog(w,"systemd",6,"Reached target multi-user.target - Multi-User System.");LX.jlog(w,"sshd",6,"Server listening on 0.0.0.0 port 22.");
  w.dmesg=["[    0.000000] Linux version "+w.boot.kernel+" (mockbuild@build) #1 SMP PREEMPT_DYNAMIC","[    0.000000] Command line: BOOT_IMAGE=(hd0,gpt2)/vmlinuz root=/dev/mapper/rhel-root ro","[    0.412311] PCI: Using configuration type 1 for base access","[    1.102114] sd 0:0:0:0: [sda] 83886080 512-byte logical blocks: (42.9 GB/40.0 GiB)","[    1.230817] e1000 0000:00:03.0 eth0: (PCI:33MHz:32-bit) 52:54:00:8a:3c:01","[    2.801734] XFS (dm-0): Mounting V5 Filesystem","[    3.440125] systemd[1]: Detected virtualization kvm."];
  (o.disks||[]).forEach(([n,size])=>w.dmesg.push(`[    1.10${Object.keys(w.disks).length}220] sd 0:0:1:0: [${n}] ${size*2097152} 512-byte logical blocks: (${(size*1.0737).toFixed(1)} GB/${size}.0 GiB)`));
  /* a few background processes */
  [["root","/usr/lib/systemd/systemd --switched-root --system",0.1,0.2,1],["root","[kthreadd]",0,0,2]].forEach(([u,c,cpu,mem,pid])=>w.procs.push({pid,ppid:0,u,cmd:c,cpu,mem,ni:0,st:"Ss",t:"Nov09"}));
  w.procs.push({pid:1421,ppid:1,u:"root",cmd:"/usr/lib/systemd/systemd-logind",cpu:0,mem:0.1,ni:0,st:"Ss",t:"Nov09"});
  w.procs.push({pid:1802,ppid:1,u:"admin",cmd:"-bash",cpu:0,mem:0.1,ni:0,st:"Ss",t:"23:41",tty:"pts/0"});
  /* custom setup */
  Object.entries(o.files||{}).forEach(([p,v])=>{if(typeof v==="string")LX.put(w,p,v);else{const f=LX.put(w,p,v.c||"",v);if(v.owner){const [a,b]=v.owner.split(":");f.uid=w.users[a]?.uid??0;f.gid=w.groups[b||a]?.gid??0}}});
  (o.pkgs||[]).forEach(p=>LX.install(w,p,true));
  if(LX.afterWorld)LX.afterWorld(w);
  return w};

/* ---------- logs ---------- */
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
LX.ts=(t)=>{const d=new Date(t||Date.now());return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")} ${d.toTimeString().slice(0,8)}`};
LX.jline=(w,j)=>`${LX.ts(j.t)} ${w.host} ${j.u==="kernel"?"kernel":(LX.unitName(w,j.u)+"["+(j.pid||1)+"]")}: ${j.m}`;
LX.jlog=(w,u,pri,m,pid)=>{w.journal.push({t:Date.now()-(w.journal.length?0:3600e3),u,p:pri,m,pid:pid||(w.units[u]?.pid)||1})};

/* ---------- packages ---------- */
LX.install=(w,k,quiet)=>{const p=PKG[k];if(!p)return false;w.installed.add(k);(p.units||[]).forEach(u=>LX.addUnit(w,u,false,false));
  if(k==="httpd"){const d=w.distro==="debian";LX.mkdirp(w,"/var/www/html");if(!LX.lookup(w,"/var/www/html/index.html"))LX.put(w,"/var/www/html/index.html",d?"<h1>Apache2 Default Page</h1>\n":"");
    if(d){LX.put(w,"/etc/apache2/apache2.conf","# This is the main Apache server configuration file.\nServerRoot \"/etc/apache2\"\nTimeout 300\nKeepAlive On\nUser ${APACHE_RUN_USER}\nIncludeOptional sites-enabled/*.conf\n");LX.put(w,"/etc/apache2/ports.conf","Listen 80\n")}
    else{LX.put(w,"/etc/httpd/conf/httpd.conf","# This is the main Apache HTTP server configuration file.\nServerRoot \"/etc/httpd\"\n\nListen 80\n\nInclude conf.modules.d/*.conf\n\nUser apache\nGroup apache\n\nServerAdmin root@localhost\n\nDocumentRoot \"/var/www/html\"\n\n<Directory \"/var/www/html\">\n    Options Indexes FollowSymLinks\n    AllowOverride None\n    Require all granted\n</Directory>\n\nDirectoryIndex index.html\n\nErrorLog \"logs/error_log\"\nLogLevel warn\n\nIncludeOptional conf.d/*.conf\n");LX.mkdirp(w,"/etc/httpd/conf.d");LX.mkdirp(w,"/var/log/httpd",0o700)}}
  if(k==="nginx"){LX.put(w,"/etc/nginx/nginx.conf","user nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log;\n\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    server {\n        listen       80;\n        server_name  _;\n        root         /usr/share/nginx/html;\n    }\n}\n");LX.put(w,"/usr/share/nginx/html/index.html","<h1>Welcome to nginx!</h1>\n");if(!w.users.nginx){w.groups.nginx={gid:977,members:[]};w.users.nginx={uid:977,gid:977,home:"/var/lib/nginx",shell:"/sbin/nologin",gecos:"Nginx web server",pw:"!!",locked:false,maxd:99999,mind:0,warn:7,last:19950,exp:null}}}
  if(k==="mariadb-server"){LX.mkdirp(w,"/var/lib/mysql");LX.put(w,"/etc/my.cnf","[mysqld]\ndatadir=/var/lib/mysql\nsocket=/var/lib/mysql/mysql.sock\nlog-error=/var/log/mariadb/mariadb.log\n")}
  if(k==="fail2ban")LX.put(w,"/etc/fail2ban/jail.conf","[DEFAULT]\nbantime  = 10m\nfindtime  = 10m\nmaxretry = 5\n\n[sshd]\nport    = ssh\nlogpath = %(sshd_log)s\n");
  if(k==="aide")LX.put(w,"/etc/aide.conf","# AIDE configuration\ndatabase_in=file:/var/lib/aide/aide.db.gz\ndatabase_out=file:/var/lib/aide/aide.db.new.gz\n/etc    NORMAL\n/boot   NORMAL\n/usr/bin NORMAL\n");
  if(k==="docker-ce"&&!w.groups.docker)w.groups.docker={gid:988,members:[]};
  if(k==="nfs-utils")LX.put(w,"/etc/exports","");
  if(LX.syncBins)LX.syncBins(w);
  return true};
LX.remove=(w,k)=>{const p=PKG[k];w.installed.delete(k);(p.units||[]).forEach(u=>{if(w.units[u]){LX.stopUnit(w,u);delete w.units[u]}});if(LX.syncBins)LX.syncBins(w)};
LX.hasBin=(w,b)=>{for(const k of w.installed)if((PKG[k].bins||[]).includes(b))return true;return false};
LX.binPkg=b=>{for(const k in PKG)if((PKG[k].bins||[]).includes(b))return k;return null};

/* ---------- units and processes ---------- */
LX.addUnit=(w,u,enabled,active,custom)=>{const U=UNITS[u]||{d:u,exec:"/usr/bin/"+u};w.units[u]=Object.assign({d:U.d,exec:U.exec,user:U.user||"root",enabled:!!enabled,active:"inactive",sub:"dead",pid:null,since:Date.now()-3*86400e3,custom:!!custom,masked:false,type:"service"},w.units[u]?{}:{});
  if(active)LX.startUnit(w,u,true);return w.units[u]};
LX.startUnit=(w,u,quiet)=>{const U=w.units[u];if(!U)return "Unit not found";if(U.masked)return "masked";
  if(U.active==="active")return null;
  const err=LX.unitCheck(w,u);
  if(err){U.active="failed";U.sub="failed";U.pid=null;U.since=Date.now();U.err=err;(Array.isArray(err)?err:[err]).forEach(m=>LX.jlog(w,u,3,m));LX.jlog(w,"systemd",3,`${LX.unitName(w,u)}.service: Main process exited, code=exited, status=1/FAILURE`);LX.jlog(w,"systemd",4,`${LX.unitName(w,u)}.service: Failed with result 'exit-code'.`);LX.jlog(w,"systemd",3,`Failed to start ${U.d}.`);return err}
  U.active="active";U.sub="running";U.since=Date.now();U.err=null;const pid=w.nextPid++;U.pid=pid;
  w.procs.push({pid,ppid:1,u:U.user==="apache"&&w.distro==="debian"?"www-data":(w.users[U.user]?U.user:"root"),cmd:U.exec,cpu:U.cpu||0.0,mem:U.mem||0.4,ni:0,st:"Ss",t:new Date().toTimeString().slice(0,5),unit:u});
  if(u==="httpd"||u==="nginx")for(let i=0;i<3;i++)w.procs.push({pid:w.nextPid++,ppid:pid,u:w.distro==="debian"?"www-data":(u==="nginx"?"nginx":"apache"),cmd:U.exec,cpu:0,mem:0.3,ni:0,st:"S",t:new Date().toTimeString().slice(0,5),unit:u});
  if(!quiet){LX.jlog(w,"systemd",6,`Starting ${U.d}...`);if(U.okmsg)LX.jlog(w,u,6,U.okmsg,pid);LX.jlog(w,"systemd",6,`Started ${U.d}.`)}
  return null};
LX.stopUnit=(w,u)=>{const U=w.units[u];if(!U)return;w.procs=w.procs.filter(p=>p.unit!==u);if(U.active==="active")LX.jlog(w,"systemd",6,`Stopped ${U.d}.`);U.active="inactive";U.sub="dead";U.pid=null;U.since=Date.now()};
/* the ports a unit listens on, from its config */
LX.unitPorts=(w,u)=>{const r=s=>LX.read(w,s)||"";
  if(u==="sshd"){const c=r("/etc/ssh/sshd_config")+Object.keys(LX.lookup(w,"/etc/ssh/sshd_config.d")?.k||{}).map(f=>r("/etc/ssh/sshd_config.d/"+f)).join("\n");const ps=[...c.matchAll(/^\s*Port\s+(\d+)/gmi)].map(m=>+m[1]);return ps.length?ps:[22]}
  if(u==="httpd"){const c=w.distro==="debian"?r("/etc/apache2/ports.conf"):r("/etc/httpd/conf/httpd.conf")+Object.keys(LX.lookup(w,"/etc/httpd/conf.d")?.k||{}).map(f=>r("/etc/httpd/conf.d/"+f)).join("\n");const ps=[...c.matchAll(/^\s*Listen\s+(?:[\d.]+:)?(\d+)/gmi)].map(m=>+m[1]);return ps.length?[...new Set(ps)]:[80]}
  if(u==="nginx"){const ps=[...r("/etc/nginx/nginx.conf").matchAll(/listen\s+(\d+)/g)].map(m=>+m[1]);return ps.length?ps:[80]}
  if(u==="mariadb")return [3306];if(u==="chronyd")return [];if(u==="smb")return [445,139];if(u==="nfs-server")return [2049];
  if(w.units[u]?.ports)return w.units[u].ports;return []};
/* why would a unit fail to start? returns null or an error message (or list) */
LX.unitCheck=(w,u)=>{const U=w.units[u];if(U.failWith)return typeof U.failWith==="function"?U.failWith(w):U.failWith;
  const busy=port=>{for(const k in w.units)if(k!==u&&w.units[k].active==="active"&&LX.unitPorts(w,k).includes(port))return k;for(const c of (w.ctrs||[]))if(c.state==="running"&&c.ports.some(p=>p.h===port))return "container";return null};
  const selPort=(type,port)=>w.selinux.mode!=="enforcing"||(w.selinux.ports[type]||[]).includes("tcp "+port);
  if(u==="sshd"){const c=LX.read(w,"/etc/ssh/sshd_config")||"";const bad=c.split("\n").find(l=>l.trim()&&!l.trim().startsWith("#")&&!/^\s*(Include|Port|AddressFamily|ListenAddress|PermitRootLogin|MaxAuthTries|PubkeyAuthentication|AuthorizedKeysFile|PasswordAuthentication|PermitEmptyPasswords|X11Forwarding|AllowUsers|AllowGroups|DenyUsers|Banner|Subsystem|ClientAliveInterval|ClientAliveCountMax|LoginGraceTime|MaxSessions|UsePAM|KbdInteractiveAuthentication|ChallengeResponseAuthentication|Protocol|HostKey|SyslogFacility|LogLevel|PrintMotd|AcceptEnv|UseDNS|Ciphers|MACs|KexAlgorithms|GSSAPIAuthentication)\b/i.test(l));
    if(bad)return [`/etc/ssh/sshd_config: line ${c.split("\n").indexOf(bad)+1}: Bad configuration option: ${bad.trim().split(/\s+/)[0]}`,"/etc/ssh/sshd_config: terminating, 1 bad configuration options"];
    const prl=c.match(/^\s*PermitRootLogin\s+(\S+)/mi);if(prl&&!/^(yes|no|prohibit-password|without-password|forced-commands-only)$/i.test(prl[1]))return [`/etc/ssh/sshd_config line ${c.split("\n").findIndex(l=>/^\s*PermitRootLogin/i.test(l))+1}: unsupported option "${prl[1]}".`];
    for(const p of LX.unitPorts(w,"sshd")){if(!selPort("ssh_port_t",p)){LX.avc(w,"name_bind",`src=${p}`,"sshd","system_u:system_r:sshd_t:s0","system_u:object_r:unreserved_port_t:s0","tcp_socket");return [`error: Bind to port ${p} on 0.0.0.0 failed: Permission denied.`,"fatal: Cannot bind any address."]}const b=busy(p);if(b)return [`error: Bind to port ${p} on 0.0.0.0 failed: Address already in use.`,"fatal: Cannot bind any address."]}return null}
  if(u==="httpd"){const d=w.distro==="debian";const conf=d?"/etc/apache2/apache2.conf":"/etc/httpd/conf/httpd.conf";const c=LX.read(w,conf)||"";
    const lines=c.split("\n");const opens=lines.filter(l=>/^\s*<Directory/i.test(l)).length,closes=lines.filter(l=>/^\s*<\/Directory>/i.test(l)).length;
    if(opens!==closes)return [`AH00526: Syntax error on line ${lines.length} of ${conf}:`,"<Directory> was not closed."];
    const dr=c.match(/^\s*DocumentRoot\s+"?([^"\s]+)"?/mi);if(dr&&!LX.lookup(w,dr[1]))return [`AH00112: Warning: DocumentRoot [${dr[1]}] does not exist`,"AH00526: Syntax error: DocumentRoot must be a directory"];
    const bad=lines.findIndex(l=>/^\s*(Listne|Documentroot\s*$|Serverroot\s*$|LoadModul\s)/i.test(l));if(bad>=0)return [`AH00526: Syntax error on line ${bad+1} of ${conf}:`,`Invalid command '${lines[bad].trim().split(/\s+/)[0]}', perhaps misspelled or defined by a module not included in the server configuration`];
    for(const p of LX.unitPorts(w,"httpd")){if(!selPort("http_port_t",p)){LX.avc(w,"name_bind",`src=${p}`,"httpd","system_u:system_r:httpd_t:s0","system_u:object_r:unreserved_port_t:s0","tcp_socket");return [`(13)Permission denied: AH00072: make_sock: could not bind to address [::]:${p}`,`(13)Permission denied: AH00072: make_sock: could not bind to address 0.0.0.0:${p}`,"no listening sockets available, shutting down","AH00015: Unable to open logs"]}const b=busy(p);if(b)return [`(98)Address already in use: AH00072: make_sock: could not bind to address [::]:${p}`,"no listening sockets available, shutting down"]}return null}
  if(u==="nginx"){const c=LX.read(w,"/etc/nginx/nginx.conf")||"";const o=(c.match(/{/g)||[]).length,cl=(c.match(/}/g)||[]).length;if(o!==cl)return [`nginx: [emerg] unexpected end of file, expecting "}" in /etc/nginx/nginx.conf:${c.split("\n").length}`,"nginx: configuration file /etc/nginx/nginx.conf test failed"];
    for(const p of LX.unitPorts(w,"nginx")){const b=busy(p);if(b)return [`nginx: [emerg] bind() to 0.0.0.0:${p} failed (98: Address already in use)`];}return null}
  if(U.custom){const f=LX.unitFile(w,u);if(!f)return [`Unit ${u}.service not found.`];const ex=(f.match(/^\s*ExecStart\s*=\s*(\S+)/m)||[])[1];
    if(!ex)return [`${u}.service: Service has no ExecStart=, ExecStop=, or SuccessAction=. Refusing.`];
    const n=LX.lookup(w,ex);if(!n)return [`${u}.service: Failed to locate executable ${ex}: No such file or directory`,`${u}.service: Failed at step EXEC spawning ${ex}: No such file or directory`];
    if(!(n.mode&0o111))return [`${u}.service: Failed to execute ${ex}: Permission denied`,`${u}.service: Failed at step EXEC spawning ${ex}: Permission denied`];
    const usr=(f.match(/^\s*User\s*=\s*(\S+)/m)||[])[1];if(usr&&!w.users[usr])return [`${u}.service: Failed to determine user credentials: No such process`,`${u}.service: Failed at step USER spawning ${ex}: No such process`];
    return null}
  return null};
LX.unitFile=(w,u)=>LX.read(w,`/etc/systemd/system/${u}.service`)||LX.read(w,`/usr/lib/systemd/system/${u}.service`);
LX.avc=(w,perm,extra,comm,scon,tcon,tclass)=>{const t=(Date.now()/1000).toFixed(3);const raw=`type=AVC msg=audit(${t}:${400+w.selinux.avc.length}): avc:  denied  { ${perm} } for  pid=${w.nextPid} comm="${comm}" ${extra} scontext=${scon} tcontext=${tcon} tclass=${tclass} permissive=0`;
  w.selinux.avc.push({perm,comm,scon,tcon,tclass,extra,raw,t:Date.now()});LX.jlog(w,"setroubleshoot",3,`SELinux is preventing ${comm} from ${perm} access on the ${tclass} ${extra.replace(/^[a-z]+=/,"")}. For complete SELinux messages run: sealert -l ${Math.random().toString(16).slice(2,10)}`)};

/* ---------- resources ---------- */
LX.memUse=w=>{const total=w.mem.total;const used=Math.round(w.mem.base+w.procs.reduce((a,p)=>a+(p.mem||0)*total/100,0));const cache=Math.min(2400,Math.max(200,total-used-400));const free=Math.max(64,total-used-cache);return {total,used,free,cache,avail:free+cache-120}};
LX.swapTotal=w=>w.swaps.reduce((a,s)=>a+s.size,0);
LX.load=w=>{const c=w.procs.reduce((a,p)=>a+(p.cpu||0),0)/100;const io=w.ioWait||0;const l=c+io+0.02;return [l,l*0.86+0.05,l*0.62+0.04].map(x=>x.toFixed(2))};
LX.partName=(d,n)=>/nvme|mmcblk|loop/.test(d)?`${d}p${n}`:`${d}${n}`;
/* filesystem usage of the mount holding path */
LX.mountOf=(w,path)=>{let best=null;w.mounts.forEach(m=>{if((path===m.tgt||path.startsWith(m.tgt==="/"?"/":m.tgt+"/"))&&(!best||m.tgt.length>best.tgt.length))best=m});return best};
LX.fsUsed=(w,m)=>{const f=w.fs[m.src]||{size:1,used:0};let extra=0;const top=LX.lookup(w,m.tgt);if(top)LX.walk(top,m.tgt,(n,p)=>{if(n.t==="f"&&n.sz&&LX.mountOf(w,p)===m)extra+=n.sz});return {size:f.size,used:Math.min(f.size,f.used+extra/1073741824+(f.held||0))}};
})();
