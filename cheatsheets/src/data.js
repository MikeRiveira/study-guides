/* Cheat sheet content. Pipe-separated rows keep the data compact; app.js parses and renders them. */

/* port | transport | protocol | what it does | secure alternative | exams (A=A+, N=Network+, S=Security+, C=CCNA) */
const PORTS = `
20, 21|TCP|FTP|File transfer: 20 data, 21 control. Sends credentials in clear text.|SFTP (22) or FTPS (989/990)|ANSC
22|TCP|SSH / SFTP / SCP|Encrypted remote shell and file transfer|—|ANSC
23|TCP|Telnet|Remote shell in clear text. Avoid it.|SSH (22)|ANSC
25|TCP|SMTP|Sends mail between mail servers|SMTP with STARTTLS (587) or SMTPS (465)|ANC
49|TCP|TACACS+|Cisco AAA for device admin logins; encrypts the whole payload|—|SC
53|TCP/UDP|DNS|Name resolution. UDP for queries, TCP for zone transfers and large replies.|DNS over TLS (853), DNSSEC for integrity|ANSC
67, 68|UDP|DHCP|Hands out IP settings. Server 67, client 68.|—|ANC
69|UDP|TFTP|Trivial file transfer with no login. Used for config and firmware loads.|SFTP|NC
80|TCP|HTTP|Web traffic in clear text|HTTPS (443)|ANSC
88|TCP/UDP|Kerberos|Ticket-based authentication in Active Directory|—|S
110|TCP|POP3|Downloads mail from a server|POP3S (995)|A
123|UDP|NTP|Time sync. Logs, Kerberos and certificates depend on it.|NTS (NTP with TLS)|NSC
137–139|TCP/UDP|NetBIOS|Legacy Windows name and session services|SMB over 445 only|A
143|TCP|IMAP|Reads mail while leaving it on the server|IMAPS (993)|A
161, 162|UDP|SNMP|Device monitoring. 161 polls the agent, 162 receives traps.|SNMPv3 (auth + encryption)|NSC
179|TCP|BGP|Routing between internet autonomous systems|—|N
389|TCP/UDP|LDAP|Directory lookups (Active Directory)|LDAPS (636)|ANS
443|TCP/UDP|HTTPS|Web over TLS. UDP 443 carries HTTP/3 (QUIC).|—|ANSC
445|TCP|SMB / CIFS|Windows file and printer sharing|SMB 3 encryption; never expose to the internet|ANS
465|TCP|SMTPS|SMTP with TLS from the first byte|—|S
500|UDP|IKE / ISAKMP|Sets up IPsec VPN tunnels|—|NS
514|UDP|Syslog|Sends log messages to a collector|Syslog over TLS (6514)|NSC
520|UDP|RIP|Distance vector routing (hop count)|—|N
546, 547|UDP|DHCPv6|DHCP for IPv6. Client 546, server 547.|—|N
587|TCP|SMTP submission|Mail clients sending mail, with STARTTLS|—|NS
636|TCP|LDAPS|LDAP over TLS|—|NS
853|TCP|DNS over TLS|Encrypted DNS queries|—|S
989, 990|TCP|FTPS|FTP over TLS|—|S
993|TCP|IMAPS|IMAP over TLS|—|AS
995|TCP|POP3S|POP3 over TLS|—|AS
1433|TCP|MS SQL Server|Microsoft SQL database|TLS encrypted connections|N
1701|UDP|L2TP|Layer 2 tunnel, usually paired with IPsec|—|N
1723|TCP|PPTP|Old VPN with weak security|IPsec or SSL/TLS VPN|N
1812, 1813|UDP|RADIUS|AAA for Wi-Fi and VPN logins. 1812 auth, 1813 accounting.|RADIUS over TLS (RadSec)|NSC
3306|TCP|MySQL|MySQL and MariaDB databases|TLS encrypted connections|N
3389|TCP/UDP|RDP|Windows Remote Desktop|RDP through a VPN or RD Gateway, with NLA|ANS
4500|UDP|IPsec NAT-T|IPsec through NAT|—|NS
5060, 5061|TCP/UDP|SIP|VoIP call setup. 5061 is SIP over TLS.|SIP over TLS (5061) plus SRTP|NS
5900|TCP|VNC|Cross-platform remote desktop|Tunnel through SSH or VPN|A
5985, 5986|TCP|WinRM|PowerShell remoting. 5985 HTTP, 5986 HTTPS.|WinRM over HTTPS (5986)|—
8080|TCP|HTTP alternate|Web proxies and app servers|HTTPS (8443)|—
`;

/* IP protocol numbers: these ride directly on IP, so they have no port. */
const PROTO_NUMS = `
1|ICMP|Ping, traceroute and error messages
2|IGMP|IPv4 multicast group membership
6|TCP|Reliable, connection-oriented transport
17|UDP|Fast, connectionless transport
47|GRE|Generic tunnels (often under IPsec)
50|ESP|IPsec encryption and integrity
51|AH|IPsec integrity only (no encryption)
88|EIGRP|Cisco advanced distance vector routing
89|OSPF|Link-state routing
112|VRRP|Gateway redundancy (open standard)
`;

/* TCP vs UDP comparison rows */
const TCP_UDP = `
Connection|Connection-oriented (3-way handshake: SYN, SYN-ACK, ACK)|Connectionless, no handshake
Reliability|Acknowledges, retransmits and reorders segments|Best effort; the app handles loss
Flow control|Sliding window|None
Header|20 bytes minimum|8 bytes
Ending|FIN / ACK (graceful) or RST (abort)|Nothing to close
Used by|HTTP(S), SSH, SMTP, FTP, RDP, SMB|DNS queries, DHCP, TFTP, SNMP, NTP, VoIP, video, QUIC
`;

/* ---------- Subnetting ---------- */
const RANGES = `
10.0.0.0/8|Private (RFC 1918)|10.0.0.0 – 10.255.255.255
172.16.0.0/12|Private (RFC 1918)|172.16.0.0 – 172.31.255.255
192.168.0.0/16|Private (RFC 1918)|192.168.0.0 – 192.168.255.255
100.64.0.0/10|Carrier-grade NAT (shared)|100.64.0.0 – 100.127.255.255
169.254.0.0/16|APIPA / link-local. DHCP failed.|169.254.0.1 – 169.254.255.254
127.0.0.0/8|Loopback (127.0.0.1)|127.0.0.0 – 127.255.255.255
224.0.0.0/4|Multicast (Class D)|224.0.0.0 – 239.255.255.255
240.0.0.0/4|Reserved (Class E)|240.0.0.0 – 255.255.255.254
192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24|Documentation examples (TEST-NET)|Never routed
255.255.255.255/32|Limited broadcast|Stays on the local segment
`;

const CLASSES = `
A|1 – 126|/8 (255.0.0.0)|0
B|128 – 191|/16 (255.255.0.0)|10
C|192 – 223|/24 (255.255.255.0)|110
D|224 – 239|Multicast, no mask|1110
E|240 – 255|Experimental|1111
`;

const MAGIC = [
  ["Find the interesting octet", "The octet where the mask isn't 255 or 0. For /26 (255.255.255.192) it's the 4th octet."],
  ["Get the block size", "256 minus the mask value in that octet. 256 − 192 = 64, so subnets go up in steps of 64."],
  ["List the subnets", "Count up by the block size: .0, .64, .128, .192. Your host falls in the one at or below it. 10.1.1.100 is in 10.1.1.64."],
  ["Read the rest off", "Broadcast = next subnet − 1 (.127). Usable hosts = network + 1 to broadcast − 1 (.65 – .126). Hosts = 2^host bits − 2 = 62."]
];

const IPV6 = `
::1/128|Loopback|Like 127.0.0.1
::/128|Unspecified|No address yet (like 0.0.0.0)
2000::/3|Global unicast|Public, routable on the internet
fe80::/10|Link-local|Auto-assigned on every IPv6 interface, never routed
fc00::/7 (fd00::/8 in use)|Unique local|Private, like RFC 1918
ff00::/8|Multicast|Replaces broadcast (ff02::1 = all nodes, ff02::2 = all routers)
2001:db8::/32|Documentation|Examples only
::ffff:0:0/96|IPv4-mapped|IPv4 address inside IPv6
`;

const IPV6_FACTS = [
  "128 bits, written as 8 groups of 4 hex digits: 2001:0db8:0000:0000:0000:ff00:0042:8329",
  "Drop leading zeros in a group: 0db8 → db8, 0042 → 42",
  "Replace ONE run of all-zero groups with :: → 2001:db8::ff00:42:8329",
  "A normal LAN is a /64: 64 bits of network prefix, 64 bits of interface ID",
  "No broadcast. Neighbor Discovery (NDP, ICMPv6) replaces ARP.",
  "SLAAC lets hosts build their own address from the router's prefix (EUI-64 or a random ID)",
  "EUI-64: split the 48-bit MAC, insert fffe in the middle, flip the 7th bit",
  "Dual stack runs IPv4 and IPv6 side by side. Tunneling (6to4, Teredo) and NAT64 bridge the two."
];

/* ---------- OSI ---------- */
const OSI = `
7|Application|Data|Network services for apps|HTTP, HTTPS, DNS, SMTP, FTP, SSH, SNMP, DHCP|Hosts, L7 firewalls, load balancers, proxies
6|Presentation|Data|Formatting, encryption, compression|TLS/SSL, JPEG, ASCII, MPEG|—
5|Session|Data|Opens, manages and closes sessions|RPC, NetBIOS, SQL sessions, SIP|—
4|Transport|Segment (TCP) / Datagram (UDP)|End-to-end delivery, ports, reliability|TCP, UDP|Stateful firewalls
3|Network|Packet|Logical addressing and routing|IPv4, IPv6, ICMP, IPsec, OSPF|Routers, L3 switches
2|Data Link|Frame|MAC addressing, local delivery, error detection|Ethernet, 802.11, ARP, VLAN (802.1Q), STP, PPP|Switches, bridges, WAPs, NICs
1|Physical|Bits|Signals on the wire or the air|Cabling, fiber, radio, DSL|Hubs, repeaters, cables, media converters
`;

const TCPIP = `
Application|7, 6, 5|HTTP, DNS, SSH, SMTP
Transport|4|TCP, UDP
Internet|3|IP, ICMP, ARP*
Network access (link)|2, 1|Ethernet, Wi-Fi
`;

/* ---------- Commands: [section, [[command, what it does], ...]] ---------- */
const WINDOWS = [
  ["Networking", [
    ["ipconfig /all", "Full IP config: address, mask, gateway, DNS, MAC, DHCP lease"],
    ["ipconfig /release && ipconfig /renew", "Drop and request a new DHCP lease"],
    ["ipconfig /flushdns", "Clear the local DNS cache"],
    ["ipconfig /displaydns", "Show cached DNS lookups"],
    ["ping -t 8.8.8.8", "Ping until Ctrl+C. -n 10 sends 10, -a resolves names, -l sets size."],
    ["tracert example.com", "Show each router hop to a destination"],
    ["pathping example.com", "Traceroute plus packet loss per hop"],
    ["nslookup example.com 1.1.1.1", "Query DNS, optionally against a specific server"],
    ["netstat -ano", "All connections and listening ports with the owning process ID"],
    ["arp -a", "Show the IP-to-MAC cache"],
    ["route print", "Show the routing table"],
    ["netsh wlan show profiles", "Saved Wi-Fi networks"],
    ["netsh advfirewall show allprofiles", "Windows Firewall status"],
    ["Test-NetConnection server -Port 443", "PowerShell: ping plus TCP port check"],
    ["Resolve-DnsName example.com", "PowerShell DNS lookup"],
    ["Get-NetIPConfiguration", "PowerShell IP summary"]
  ]],
  ["Disk and repair", [
    ["sfc /scannow", "Scan and repair protected system files"],
    ["DISM /Online /Cleanup-Image /RestoreHealth", "Repair the Windows image (run before sfc if sfc fails)"],
    ["chkdsk C: /f /r", "Fix file system errors and find bad sectors"],
    ["diskpart", "Partition tool: list disk, select disk 1, clean, create partition primary"],
    ["format D: /fs:NTFS /q", "Quick format a volume"],
    ["bootrec /fixmbr  ·  bootrec /fixboot  ·  bootrec /rebuildbcd", "Repair boot records from the recovery console"],
    ["bcdedit", "View or edit boot configuration data"],
    ["winver", "Show the Windows version and build"]
  ]],
  ["Files", [
    ["dir /a", "List files, including hidden"],
    ["cd \\Users  ·  cd ..", "Change directory, go up one level"],
    ["md Reports  ·  rd /s Reports", "Make or remove a directory"],
    ["copy a.txt D:\\  ·  move a.txt D:\\", "Copy or move a file"],
    ["xcopy C:\\Data D:\\Data /e /h", "Copy folders with subfolders and hidden files"],
    ["robocopy C:\\Data \\\\srv\\backup /mir", "Robust copy. /mir mirrors (deletes extras at the target)."],
    ["del /f file.txt", "Delete a file"],
    ["attrib +h file.txt", "Set or clear attributes (hidden, read-only, system)"]
  ]],
  ["Users, shares and policy", [
    ["whoami /all", "Current user, groups and privileges"],
    ["net user", "List local users. net user bob /add creates one."],
    ["net localgroup administrators bob /add", "Add a user to the local Administrators group"],
    ["net use Z: \\\\server\\share", "Map a network drive"],
    ["net share", "List shares on this PC"],
    ["gpupdate /force", "Reapply Group Policy now"],
    ["gpresult /r", "Show which Group Policies applied"],
    ["runas /user:admin cmd", "Run a program as another user"]
  ]],
  ["System and processes", [
    ["systeminfo", "OS, build, uptime, RAM, hotfixes"],
    ["hostname", "This computer's name"],
    ["tasklist", "Running processes"],
    ["taskkill /PID 4321 /F", "Force-end a process (or /IM notepad.exe)"],
    ["shutdown /r /t 0", "Restart now. /s shuts down, /a aborts."],
    ["Get-Process  ·  Stop-Process -Id 4321", "PowerShell process tools"],
    ["Get-Service  ·  Restart-Service Spooler", "PowerShell service tools"],
    ["Get-WinEvent -LogName System -MaxEvents 20", "Latest System log entries"],
    ["Get-Help Get-Process -Examples", "Built-in PowerShell help"]
  ]],
  ["Run box shortcuts (Win+R)", [
    ["devmgmt.msc", "Device Manager"],
    ["diskmgmt.msc", "Disk Management"],
    ["services.msc", "Services"],
    ["eventvwr.msc", "Event Viewer"],
    ["compmgmt.msc", "Computer Management"],
    ["gpedit.msc", "Local Group Policy Editor (Pro and up)"],
    ["lusrmgr.msc", "Local Users and Groups"],
    ["taskschd.msc", "Task Scheduler"],
    ["certmgr.msc", "Certificate Manager"],
    ["perfmon  ·  resmon", "Performance Monitor, Resource Monitor"],
    ["msconfig", "System Configuration (boot options)"],
    ["msinfo32", "System Information"],
    ["regedit", "Registry Editor"],
    ["ncpa.cpl", "Network Connections"],
    ["appwiz.cpl", "Programs and Features"],
    ["sysdm.cpl", "System Properties"],
    ["mstsc", "Remote Desktop client"],
    ["cleanmgr", "Disk Cleanup"]
  ]]
];

const LINUX = [
  ["Files and navigation", [
    ["pwd", "Print the current directory"],
    ["ls -la", "List all files with permissions, owner and size"],
    ["cd /etc  ·  cd ~  ·  cd ..", "Change directory: absolute, home, up one"],
    ["mkdir -p a/b/c", "Make directories, including parents"],
    ["cp -r src/ dst/", "Copy (recursive for folders)"],
    ["mv old.txt new.txt", "Move or rename"],
    ["rm file  ·  rm -r dir", "Delete. There is no recycle bin, so take care with rm -rf."],
    ["touch notes.txt", "Create an empty file or update its timestamp"],
    ["cat  ·  less  ·  head -n 20  ·  tail -n 20", "View a file"],
    ["tail -f /var/log/syslog", "Follow a log as it grows"],
    ["find / -name \"*.conf\" 2>/dev/null", "Find files by name"],
    ["grep -ri \"error\" /var/log", "Search text, case-insensitive and recursive"],
    ["ln -s /target linkname", "Make a symbolic link"],
    ["tar -czvf backup.tar.gz dir/  ·  tar -xzvf backup.tar.gz", "Create or extract a gzip archive"],
    ["nano file  ·  vi file", "Edit text. In vi: i to insert, Esc then :wq to save and quit."]
  ]],
  ["Permissions and users", [
    ["chmod 755 script.sh", "Owner rwx, group r-x, others r-x"],
    ["chmod u+x script.sh", "Add execute for the owner"],
    ["chown alice:devs file", "Change owner and group"],
    ["sudo command", "Run one command as root"],
    ["su - alice", "Switch user with a login shell"],
    ["useradd -m alice  ·  passwd alice", "Create a user with a home folder, set the password"],
    ["usermod -aG sudo alice", "Add to a group (wheel on RHEL-family)"],
    ["id  ·  whoami  ·  groups", "Who am I and which groups"],
    ["umask", "Default permission mask for new files"]
  ]],
  ["Processes, services and system", [
    ["ps aux", "All running processes"],
    ["top  ·  htop", "Live CPU and memory view"],
    ["kill 1234  ·  kill -9 1234", "End a process (-9 forces it)"],
    ["systemctl status sshd", "Service status. Also start, stop, restart, enable, disable."],
    ["journalctl -u sshd --since today", "Logs for one service"],
    ["df -h", "Disk space per file system"],
    ["du -sh *", "Size of each item in this folder"],
    ["free -h", "Memory and swap use"],
    ["lsblk  ·  mount  ·  fdisk -l", "Disks, partitions and mounts"],
    ["uname -a  ·  cat /etc/os-release", "Kernel and distro version"],
    ["dmesg | tail", "Kernel messages (hardware, drivers)"],
    ["crontab -e", "Schedule recurring jobs"],
    ["history", "Previous commands"],
    ["man ls  ·  ls --help", "Manual and help"]
  ]],
  ["Networking", [
    ["ip a", "Interfaces and addresses (replaces ifconfig)"],
    ["ip route", "Routing table and default gateway"],
    ["ip link set eth0 up", "Bring an interface up"],
    ["ping -c 4 8.8.8.8", "Send 4 pings"],
    ["traceroute example.com", "Hops to a destination (tracepath also works)"],
    ["ss -tulpn", "Listening TCP/UDP ports and processes (replaces netstat)"],
    ["dig example.com  ·  dig +short MX example.com", "DNS lookups"],
    ["nslookup example.com", "DNS lookup"],
    ["curl -I https://example.com", "Fetch HTTP headers"],
    ["wget https://example.com/file", "Download a file"],
    ["ssh alice@10.0.0.5", "Remote shell"],
    ["scp file alice@10.0.0.5:/tmp/", "Copy a file over SSH"],
    ["nmcli device status", "NetworkManager status"],
    ["tcpdump -i eth0 port 53", "Capture packets"],
    ["nmap -sV 10.0.0.0/24", "Scan for hosts and services (only on networks you're allowed to scan)"],
    ["cat /etc/resolv.conf", "Configured DNS servers"]
  ]],
  ["Packages", [
    ["sudo apt update && sudo apt upgrade", "Debian/Ubuntu: refresh and upgrade"],
    ["sudo apt install nginx", "Debian/Ubuntu: install a package"],
    ["sudo dnf install nginx", "Fedora/RHEL: install (yum on older releases)"],
    ["dpkg -l  ·  rpm -qa", "List installed packages"],
    ["snap install  ·  flatpak install", "Distro-independent packages"]
  ]],
  ["Key paths", [
    ["/etc", "System config files"],
    ["/var/log", "Logs"],
    ["/home/alice  ·  /root", "User home folders"],
    ["/bin  ·  /usr/bin  ·  /sbin", "Programs"],
    ["/tmp", "Temporary files, cleared on reboot"],
    ["/dev", "Device files (disks are /dev/sda, /dev/nvme0n1)"],
    ["/proc", "Live kernel and process info"],
    ["/etc/passwd  ·  /etc/shadow", "User accounts and password hashes"]
  ]],
  ["Shell operators", [
    ["cmd1 | cmd2", "Pipe output into the next command"],
    ["cmd > file  ·  cmd >> file", "Write output to a file (overwrite, append)"],
    ["cmd 2> errors.txt", "Redirect errors"],
    ["cmd1 && cmd2", "Run cmd2 only if cmd1 succeeds"],
    ["cmd &", "Run in the background"]
  ]]
];

const IOS = [
  ["Modes and prompts", [
    ["Router>", "User EXEC: look only"],
    ["enable  →  Router#", "Privileged EXEC: show, debug, copy, reload"],
    ["configure terminal  →  Router(config)#", "Global configuration"],
    ["interface g0/0  →  Router(config-if)#", "Interface configuration"],
    ["line vty 0 4  →  Router(config-line)#", "Console or remote line configuration"],
    ["router ospf 1  →  Router(config-router)#", "Routing protocol configuration"],
    ["exit  ·  end (Ctrl+Z)", "Up one level, or straight back to privileged EXEC"],
    ["do show ip int brief", "Run an EXEC command from config mode"],
    ["?  ·  Tab", "Help and command completion. Abbreviations work: sh ip int br."]
  ]],
  ["Initial setup", [
    ["hostname R1", "Set the device name"],
    ["enable secret Str0ng!", "Hashed password for privileged mode"],
    ["service password-encryption", "Hide plain-text passwords in the config"],
    ["banner motd #Authorized access only#", "Login banner"],
    ["no ip domain-lookup", "Stop typos being treated as hostnames"],
    ["line console 0 / password x / login", "Console password"],
    ["logging synchronous", "Stop log messages interrupting your typing"]
  ]],
  ["Show commands", [
    ["show running-config", "Active config in RAM"],
    ["show startup-config", "Saved config in NVRAM"],
    ["show version", "IOS version, uptime, config register"],
    ["show ip interface brief", "Every interface with IP and up/down status"],
    ["show interfaces g0/0", "Counters, errors, duplex and speed"],
    ["show interfaces status", "Switch ports: VLAN, duplex, speed"],
    ["show ip route", "Routing table (C connected, S static, O OSPF)"],
    ["show vlan brief", "VLANs and their access ports"],
    ["show interfaces trunk", "Trunk ports, allowed and native VLANs"],
    ["show mac address-table", "Learned MAC addresses per port"],
    ["show spanning-tree", "STP root, port roles and states"],
    ["show cdp neighbors detail  ·  show lldp neighbors", "Directly connected devices"],
    ["show ip ospf neighbor", "OSPF adjacencies"],
    ["show ip nat translations", "Active NAT entries"],
    ["show access-lists", "ACLs with hit counts"],
    ["show port-security interface f0/1", "Port security status and violations"],
    ["show etherchannel summary", "Port-channel bundles"],
    ["show ip arp", "ARP table"],
    ["show running-config | include ospf", "Filter output (also section, begin, exclude)"]
  ]],
  ["Interfaces and IP", [
    ["interface g0/0", "Enter an interface"],
    ["ip address 192.168.1.1 255.255.255.0", "Assign an IPv4 address"],
    ["no shutdown", "Turn the interface on (router ports start shut down)"],
    ["description Uplink to SW1", "Label the port"],
    ["ipv6 unicast-routing", "Enable IPv6 routing (global)"],
    ["ipv6 address 2001:db8:1::1/64", "Assign an IPv6 address"],
    ["interface range f0/1 - 24", "Configure many ports at once"]
  ]],
  ["VLANs and trunks", [
    ["vlan 10 / name SALES", "Create and name a VLAN"],
    ["switchport mode access", "Make the port an access port"],
    ["switchport access vlan 10", "Put the port in VLAN 10"],
    ["switchport mode trunk", "Make the port an 802.1Q trunk"],
    ["switchport trunk allowed vlan 10,20", "Limit which VLANs cross the trunk"],
    ["switchport trunk native vlan 99", "Change the native (untagged) VLAN"],
    ["switchport nonegotiate", "Turn off DTP (stops VLAN hopping by switch spoofing)"],
    ["interface vlan 10 / ip address …", "SVI for management or inter-VLAN routing"],
    ["spanning-tree portfast  ·  spanning-tree bpduguard enable", "Edge port settings"]
  ]],
  ["Routing", [
    ["ip route 0.0.0.0 0.0.0.0 203.0.113.1", "Default static route"],
    ["ip route 10.2.0.0 255.255.0.0 10.0.0.2 200", "Static route with AD 200 (floating backup)"],
    ["router ospf 1", "Start OSPF process 1"],
    ["router-id 1.1.1.1", "Set the OSPF router ID"],
    ["network 10.0.0.0 0.0.0.255 area 0", "Enable OSPF on matching interfaces (wildcard mask)"],
    ["ip ospf 1 area 0", "Enable OSPF directly on an interface"],
    ["passive-interface g0/1", "Advertise the network but send no hellos"],
    ["ip helper-address 10.0.0.10", "Forward DHCP broadcasts to a server (on the client-side interface)"]
  ]],
  ["ACLs", [
    ["access-list 10 permit 192.168.1.0 0.0.0.255", "Standard ACL: matches source only. Place near the destination."],
    ["ip access-list extended WEB", "Named extended ACL: source, destination, port. Place near the source."],
    ["permit tcp any host 10.1.1.10 eq 443", "Allow HTTPS to one server"],
    ["deny ip any any log", "Explicit deny with logging (there's always an implicit deny at the end)"],
    ["ip access-group WEB in", "Apply the ACL to an interface, inbound"]
  ]],
  ["NAT / PAT and DHCP", [
    ["ip nat inside  ·  ip nat outside", "Mark the LAN and WAN interfaces"],
    ["ip nat inside source list 1 interface g0/1 overload", "PAT: many inside hosts share the WAN address"],
    ["ip nat inside source static 192.168.1.10 203.0.113.10", "Static one-to-one NAT"],
    ["ip dhcp excluded-address 192.168.1.1 192.168.1.10", "Keep addresses out of the pool"],
    ["ip dhcp pool LAN / network 192.168.1.0 255.255.255.0", "Create a DHCP pool"],
    ["default-router 192.168.1.1 / dns-server 8.8.8.8", "Gateway and DNS for clients"]
  ]],
  ["Security and SSH", [
    ["ip domain-name lab.local", "Needed before making RSA keys"],
    ["crypto key generate rsa modulus 2048", "Create SSH keys"],
    ["username admin secret Pa55w0rd!", "Local user account"],
    ["ip ssh version 2", "SSH version 2 only"],
    ["line vty 0 4 / transport input ssh / login local", "Allow only SSH with local accounts"],
    ["switchport port-security", "Turn on port security"],
    ["switchport port-security maximum 2", "Allow up to 2 MACs"],
    ["switchport port-security mac-address sticky", "Learn and save MACs"],
    ["switchport port-security violation restrict", "Drop and log (protect drops silently, shutdown err-disables)"],
    ["ip dhcp snooping  ·  ip arp inspection vlan 10", "Block rogue DHCP and ARP spoofing"]
  ]],
  ["Save and troubleshoot", [
    ["copy running-config startup-config", "Save the config (or write memory)"],
    ["reload", "Restart the device"],
    ["erase startup-config", "Wipe the saved config"],
    ["ping 10.0.0.2  ·  traceroute 10.0.0.2", "Test reachability (! success, . timeout, U unreachable)"],
    ["debug ip ospf adj  ·  undebug all", "Live debugging. Turn it off when done."],
    ["clear mac address-table dynamic", "Flush learned MACs"],
    ["shutdown / no shutdown", "Bounce an err-disabled port after fixing the cause"]
  ]]
];

/* Acronym | meaning | area (N network, S security, H hardware, C cloud, O ops and general) */
const ACRONYMS = `
AAA|Authentication, Authorization, and Accounting|S
ACL|Access Control List|S
AD|Active Directory (also Administrative Distance in routing)|O
AES|Advanced Encryption Standard|S
AH|Authentication Header (IPsec)|S
AI|Artificial Intelligence|O
ALE|Annualized Loss Expectancy|S
AP|Access Point|N
API|Application Programming Interface|O
APIPA|Automatic Private IP Addressing (169.254.x.x)|N
APT|Advanced Persistent Threat|S
ARO|Annualized Rate of Occurrence|S
ARP|Address Resolution Protocol|N
AS|Autonomous System|N
ASLR|Address Space Layout Randomization|S
ATX|Advanced Technology eXtended (motherboard form factor)|H
AUP|Acceptable Use Policy|S
AV|Antivirus|S
BCP|Business Continuity Plan|S
BGP|Border Gateway Protocol|N
BIA|Business Impact Analysis|S
BIOS|Basic Input/Output System|H
BPDU|Bridge Protocol Data Unit (spanning tree)|N
BSOD|Blue Screen of Death|O
BSSID|Basic Service Set Identifier (an AP's radio MAC)|N
BYOD|Bring Your Own Device|S
CA|Certificate Authority|S
CAPEX|Capital Expenditure|C
CASB|Cloud Access Security Broker|S
CDN|Content Delivery Network|N
CDP|Cisco Discovery Protocol|N
CI/CD|Continuous Integration / Continuous Delivery|C
CIA|Confidentiality, Integrity, Availability|S
CIDR|Classless Inter-Domain Routing|N
CLI|Command-Line Interface|O
CMOS|Complementary Metal-Oxide Semiconductor (BIOS settings memory)|H
CNAME|Canonical Name (DNS alias record)|N
CPU|Central Processing Unit|H
CRL|Certificate Revocation List|S
CSMA/CA|Carrier Sense Multiple Access with Collision Avoidance (Wi-Fi)|N
CSMA/CD|Carrier Sense Multiple Access with Collision Detection (old Ethernet)|N
CSR|Certificate Signing Request|S
CSRF|Cross-Site Request Forgery|S
CVE|Common Vulnerabilities and Exposures|S
CVSS|Common Vulnerability Scoring System|S
DAI|Dynamic ARP Inspection|S
DDoS|Distributed Denial of Service|S
DHCP|Dynamic Host Configuration Protocol|N
DKIM|DomainKeys Identified Mail|S
DLP|Data Loss Prevention|S
DMARC|Domain-based Message Authentication, Reporting, and Conformance|S
DMZ|Demilitarized Zone (screened subnet)|S
DNAT|Destination Network Address Translation|N
DNS|Domain Name System|N
DNSSEC|DNS Security Extensions|S
DoS|Denial of Service|S
DR|Disaster Recovery (also Designated Router in OSPF)|S
DRP|Disaster Recovery Plan|S
DSL|Digital Subscriber Line|N
DTP|Dynamic Trunking Protocol|N
DVI|Digital Visual Interface|H
EAP|Extensible Authentication Protocol|S
EDR|Endpoint Detection and Response|S
EFS|Encrypting File System (Windows)|S
EIGRP|Enhanced Interior Gateway Routing Protocol|N
EOL|End of Life|O
ESD|Electrostatic Discharge|H
ESP|Encapsulating Security Payload (IPsec)|S
ESSID|Extended Service Set Identifier|N
EUI-64|Extended Unique Identifier, 64-bit|N
FDE|Full Disk Encryption|S
FHRP|First Hop Redundancy Protocol|N
FQDN|Fully Qualified Domain Name|N
FTP|File Transfer Protocol|N
GDPR|General Data Protection Regulation|S
GPO|Group Policy Object|O
GPT|GUID Partition Table|H
GPU|Graphics Processing Unit|H
GRE|Generic Routing Encapsulation|N
GUI|Graphical User Interface|O
HA|High Availability|C
HDD|Hard Disk Drive|H
HDMI|High-Definition Multimedia Interface|H
HIDS|Host-based Intrusion Detection System|S
HIPAA|Health Insurance Portability and Accountability Act|S
HMAC|Hash-based Message Authentication Code|S
HSM|Hardware Security Module|S
HSRP|Hot Standby Router Protocol (Cisco)|N
HTTP|Hypertext Transfer Protocol|N
HTTPS|HTTP Secure (over TLS)|N
HVAC|Heating, Ventilation, and Air Conditioning|O
IaaS|Infrastructure as a Service|C
IaC|Infrastructure as Code|C
ICMP|Internet Control Message Protocol|N
IDS|Intrusion Detection System|S
IKE|Internet Key Exchange|S
IMAP|Internet Message Access Protocol|N
IoC|Indicator of Compromise|S
IoT|Internet of Things|N
IP|Internet Protocol|N
IPAM|IP Address Management|N
IPS|Intrusion Prevention System|S
IPsec|Internet Protocol Security|S
ISP|Internet Service Provider|N
ITIL|Information Technology Infrastructure Library|O
KVM|Keyboard, Video, Mouse (switch); also Kernel-based Virtual Machine|H
LAN|Local Area Network|N
LACP|Link Aggregation Control Protocol|N
LDAP|Lightweight Directory Access Protocol|N
LDAPS|LDAP over TLS|S
LLDP|Link Layer Discovery Protocol|N
MAC|Media Access Control (address); also Mandatory Access Control|N
MAN|Metropolitan Area Network|N
MBR|Master Boot Record|H
MDM|Mobile Device Management|S
MFA|Multifactor Authentication|S
MIB|Management Information Base (SNMP)|N
MITM|Man-in-the-Middle (now called on-path attack)|S
MOU|Memorandum of Understanding|S
MPLS|Multiprotocol Label Switching|N
MSA|Master Service Agreement|S
MSP|Managed Service Provider|O
MTBF|Mean Time Between Failures|S
MTTR|Mean Time to Repair (or Recover)|S
MTU|Maximum Transmission Unit (1500 bytes on Ethernet)|N
MX|Mail Exchanger (DNS record)|N
NAC|Network Access Control|S
NAS|Network-Attached Storage|H
NAT|Network Address Translation|N
NDA|Non-Disclosure Agreement|S
NDP|Neighbor Discovery Protocol (IPv6)|N
NFC|Near-Field Communication|H
NFV|Network Functions Virtualization|C
NGFW|Next-Generation Firewall|S
NIC|Network Interface Card|H
NIDS|Network-based Intrusion Detection System|S
NIST|National Institute of Standards and Technology|S
NLA|Network Level Authentication (RDP)|S
NTP|Network Time Protocol|N
NVMe|Non-Volatile Memory Express|H
OCSP|Online Certificate Status Protocol|S
OS|Operating System|O
OSI|Open Systems Interconnection (model)|N
OSINT|Open-Source Intelligence|S
OSPF|Open Shortest Path First|N
OTP|One-Time Password|S
OUI|Organizationally Unique Identifier (first half of a MAC)|N
PaaS|Platform as a Service|C
PAT|Port Address Translation (NAT overload)|N
PCI DSS|Payment Card Industry Data Security Standard|S
PCIe|Peripheral Component Interconnect Express|H
PDU|Protocol Data Unit; also Power Distribution Unit|N
PII|Personally Identifiable Information|S
PIN|Personal Identification Number|S
PKI|Public Key Infrastructure|S
PoE|Power over Ethernet|N
POP3|Post Office Protocol version 3|N
POST|Power-On Self-Test|H
PPTP|Point-to-Point Tunneling Protocol|N
PSK|Pre-Shared Key|S
PSU|Power Supply Unit|H
PTR|Pointer record (reverse DNS)|N
PXE|Preboot Execution Environment (network boot)|H
QoS|Quality of Service|N
RADIUS|Remote Authentication Dial-In User Service|S
RAID|Redundant Array of Independent Disks|H
RAM|Random Access Memory|H
RAT|Remote Access Trojan|S
RBAC|Role-Based Access Control|S
RDP|Remote Desktop Protocol|N
RFC|Request for Comments|N
RFID|Radio-Frequency Identification|H
RIP|Routing Information Protocol|N
RMM|Remote Monitoring and Management|O
RPO|Recovery Point Objective|S
RSA|Rivest, Shamir, Adleman (public key algorithm)|S
RTO|Recovery Time Objective|S
SaaS|Software as a Service|C
SAE|Simultaneous Authentication of Equals (WPA3)|S
SAML|Security Assertion Markup Language|S
SAN|Storage Area Network; also Subject Alternative Name|H
SASE|Secure Access Service Edge|S
SATA|Serial Advanced Technology Attachment|H
SCADA|Supervisory Control and Data Acquisition|S
SD-WAN|Software-Defined Wide Area Network|N
SDN|Software-Defined Networking|N
SED|Self-Encrypting Drive|S
SFP|Small Form-factor Pluggable (transceiver)|N
SFTP|SSH File Transfer Protocol|N
SHA|Secure Hash Algorithm|S
SIEM|Security Information and Event Management|S
SIP|Session Initiation Protocol|N
SLA|Service-Level Agreement|O
SLAAC|Stateless Address Autoconfiguration (IPv6)|N
SLE|Single Loss Expectancy|S
SMB|Server Message Block|N
SMTP|Simple Mail Transfer Protocol|N
SNMP|Simple Network Management Protocol|N
SOAR|Security Orchestration, Automation, and Response|S
SOC|Security Operations Center|S
SOHO|Small Office / Home Office|N
SOP|Standard Operating Procedure|O
SOW|Statement of Work|O
SPF|Sender Policy Framework|S
SQL|Structured Query Language|O
SQLi|SQL Injection|S
SSD|Solid-State Drive|H
SSH|Secure Shell|N
SSID|Service Set Identifier (Wi-Fi network name)|N
SSL|Secure Sockets Layer (replaced by TLS)|S
SSO|Single Sign-On|S
STP|Spanning Tree Protocol; also Shielded Twisted Pair|N
SVI|Switched Virtual Interface|N
TACACS+|Terminal Access Controller Access-Control System Plus|S
TCP|Transmission Control Protocol|N
TFTP|Trivial File Transfer Protocol|N
TKIP|Temporal Key Integrity Protocol (old WPA)|S
TLS|Transport Layer Security|S
TOTP|Time-based One-Time Password|S
TPM|Trusted Platform Module|S
TTL|Time to Live|N
UAC|User Account Control|S
UDP|User Datagram Protocol|N
UEFI|Unified Extensible Firmware Interface|H
UPS|Uninterruptible Power Supply|H
URL|Uniform Resource Locator|N
USB|Universal Serial Bus|H
UTM|Unified Threat Management|S
UTP|Unshielded Twisted Pair|N
VDI|Virtual Desktop Infrastructure|C
VLAN|Virtual Local Area Network|N
VM|Virtual Machine|C
VNC|Virtual Network Computing|N
VoIP|Voice over IP|N
VPC|Virtual Private Cloud|C
VPN|Virtual Private Network|S
VRRP|Virtual Router Redundancy Protocol|N
VXLAN|Virtual Extensible LAN|N
WAF|Web Application Firewall|S
WAN|Wide Area Network|N
WAP|Wireless Access Point|N
WEP|Wired Equivalent Privacy (broken)|S
WLAN|Wireless LAN|N
WPA|Wi-Fi Protected Access (WPA2, WPA3)|S
WPS|Wi-Fi Protected Setup (PIN is weak; turn it off)|S
XDR|Extended Detection and Response|S
XSS|Cross-Site Scripting|S
ZTNA|Zero Trust Network Access|S
`;

/* ---------- Extras ---------- */
const TROUBLE = [
  ["Identify the problem", "Gather information, question users, find symptoms, ask what changed, duplicate the problem if you can, approach multiple problems one at a time. Back up data before you change anything (A+)."],
  ["Establish a theory of probable cause", "Question the obvious. Work top-to-bottom or bottom-to-top through the OSI model, or divide and conquer. Research if needed."],
  ["Test the theory to determine the cause", "If it's confirmed, move on. If not, form a new theory or escalate."],
  ["Establish a plan of action", "Plan the fix and identify potential effects. Check change management and get approval."],
  ["Implement the solution or escalate", "Make the change, or hand it off with your notes."],
  ["Verify full system functionality", "Confirm it works for the user, and implement preventive measures if they apply."],
  ["Document findings, actions, outcomes and lessons learned", "Update the ticket and knowledge base so the next tech is faster."]
];

/* standard | Wi-Fi name | bands | max data rate | notes */
const WIFI = `
802.11a|—|5 GHz|54 Mbps|OFDM, 1999
802.11b|—|2.4 GHz|11 Mbps|DSSS, 1999
802.11g|—|2.4 GHz|54 Mbps|Backward compatible with b
802.11n|Wi-Fi 4|2.4 / 5 GHz|600 Mbps|MIMO, 40 MHz channels
802.11ac|Wi-Fi 5|5 GHz|~6.9 Gbps|MU-MIMO (downlink), 80/160 MHz channels
802.11ax|Wi-Fi 6 / 6E|2.4 / 5 GHz (6E adds 6 GHz)|~9.6 Gbps|OFDMA, BSS coloring, TWT
802.11be|Wi-Fi 7|2.4 / 5 / 6 GHz|~46 Gbps|320 MHz channels, multi-link operation (MLO), 4096-QAM
`;

const WIFI_SEC = `
WEP|RC4|Broken. Never use it.
WPA|TKIP (RC4)|Deprecated stopgap
WPA2|AES-CCMP|Still common. Personal (PSK) or Enterprise (802.1X + RADIUS).
WPA3|AES-GCMP / CCMP|SAE replaces PSK (resists offline cracking), forward secrecy, 192-bit Enterprise mode, protected management frames
`;

const WIFI_FACTS = [
  "2.4 GHz non-overlapping channels: 1, 6 and 11 (US). Longer range, more interference.",
  "5 GHz and 6 GHz: many more non-overlapping channels, less range, less interference.",
  "Site survey and heat map before you place APs. Overlap cells about 15–20% for roaming.",
  "Interference sources: microwaves, cordless phones, Bluetooth, neighboring APs, walls and metal.",
  "Antennas: omnidirectional covers all around; directional (Yagi, parabolic) reaches far in one direction."
];

/* category | max speed | max length | notes */
const CABLES = `
Cat 5|100 Mbps|100 m|Obsolete
Cat 5e|1 Gbps|100 m|Minimum for gigabit
Cat 6|1 Gbps (10 Gbps to 55 m)|100 m|Common in new installs
Cat 6a|10 Gbps|100 m|Thicker, better crosstalk protection
Cat 7|10 Gbps|100 m|Shielded, not a TIA standard
Cat 8|25 / 40 Gbps|30 m|Data center switch-to-server runs
`;

const FIBER = `
Single-mode (SMF)|Laser, 1310 / 1550 nm|Up to tens of km|Thin 9 µm core, yellow jacket
Multimode (MMF)|LED or VCSEL, 850 nm|Up to ~550 m (OM3/OM4)|Wider 50 / 62.5 µm core, orange or aqua jacket
`;

const CONNECTORS = `
RJ45|8-pin Ethernet (twisted pair)
RJ11|Phone line / DSL (smaller, 6-position)
LC|Small square fiber connector, push-latch. Most common on SFPs.
SC|Square fiber connector, push-pull
ST|Round bayonet fiber connector (twist-lock)
MPO / MTP|Multi-fiber ribbon for 40/100G
F-type|Coax for cable modems and TV (RG-6)
BNC|Bayonet coax (older networks, video)
SFP / SFP+ / QSFP|Hot-swappable transceiver modules: 1G / 10G / 40G+
USB-C|Reversible connector for USB 3.x/4, Thunderbolt, DisplayPort alt mode, power delivery
`;

const PINOUT_B = ["White/orange", "Orange", "White/green", "Blue", "White/blue", "Green", "White/brown", "Brown"];
const PINOUT_A = ["White/green", "Green", "White/orange", "Blue", "White/blue", "Orange", "White/brown", "Brown"];

const ETH_STD = `
10BASE-T|10 Mbps|Cat 3+ copper, 100 m
100BASE-TX|100 Mbps|Cat 5+ copper, 100 m
1000BASE-T|1 Gbps|Cat 5e+ copper, 100 m
10GBASE-T|10 Gbps|Cat 6a copper, 100 m
1000BASE-SX / LX|1 Gbps|Multimode (SX) / single-mode (LX) fiber
10GBASE-SR / LR|10 Gbps|Multimode short range / single-mode long range (10 km)
`;

/* level | name | min drives | survives | usable capacity | notes */
const RAID = `
0|Striping|2|No drive failures|100%|Fastest, but one failure loses everything
1|Mirroring|2|1 drive (per mirror)|50%|Simple redundancy, fast reads
5|Striping with parity|3|1 drive|(n − 1) / n|Good balance; slow rebuilds on big drives
6|Striping with double parity|4|2 drives|(n − 2) / n|Safer for large arrays
10 (1+0)|Mirrored stripes|4|1 drive per mirror pair|50%|Fast and redundant, costs the most
`;

/* attack | what it is | defenses | area */
const ATTACKS = `
Phishing (spear, whaling, vishing, smishing)|Fake messages that trick users into clicking, paying or sharing credentials. Spear targets one person, whaling targets executives, vishing is voice, smishing is SMS.|User training, email filtering, SPF/DKIM/DMARC, MFA, report-phish button|Social
Pretexting and impersonation|An invented story to get access or information, such as a fake help desk call|Verify identity by call-back, clear procedures, training|Social
Tailgating / piggybacking|Following an authorized person through a secured door|Access control vestibule (mantrap), badges, guards, training|Physical
Shoulder surfing|Watching someone type a password or PIN|Privacy screens, awareness|Physical
Ransomware|Malware that encrypts data and demands payment|Offline / immutable backups, patching, EDR, least privilege, segmentation|Malware
Trojan / RAT|Malware disguised as legitimate software; a RAT gives remote control|Application allow lists, EDR, downloads from trusted sources only|Malware
Worm|Self-spreading malware across a network|Patching, segmentation, firewalls|Malware
Rootkit|Hides deep in the OS or firmware to keep admin access|Secure Boot, measured boot, reimaging|Malware
Keylogger / spyware|Records keystrokes or activity|EDR, MFA (makes stolen passwords less useful)|Malware
SQL injection|Malicious SQL in an input field runs against the database|Parameterized queries, input validation, least privilege DB accounts, WAF|App
Cross-site scripting (XSS)|Injected script runs in other users' browsers|Output encoding, input validation, Content Security Policy|App
Cross-site request forgery (CSRF)|Tricks a signed-in browser into sending a request|Anti-CSRF tokens, SameSite cookies, re-authentication|App
Buffer overflow|Writes past a memory buffer to crash or run code|Bounds checking, DEP, ASLR, memory-safe languages|App
Directory traversal|../ sequences reach files outside the web root|Input validation, least privilege, chroot / sandbox|App
On-path (man-in-the-middle)|Attacker relays and reads or changes traffic|TLS everywhere, HSTS, certificate validation, 802.1X|Network
ARP poisoning|Fake ARP replies redirect LAN traffic|Dynamic ARP Inspection, static ARP for critical hosts|Network
DHCP spoofing / starvation|Rogue DHCP server or a flood that exhausts the pool|DHCP snooping, port security|Network
DNS poisoning|Fake DNS answers send users to the wrong site|DNSSEC, trusted resolvers, DNS over TLS/HTTPS|Network
MAC flooding|Overflows the switch MAC table so it floods frames|Port security|Network
VLAN hopping|Double tagging or switch spoofing reaches another VLAN|Disable DTP, unused native VLAN, shut unused ports|Network
DoS / DDoS|Floods a service so real users can't reach it|Rate limiting, CDN / DDoS scrubbing, redundancy|Network
Rogue AP / evil twin|Unauthorized or look-alike Wi-Fi access point|Wireless IDS, 802.1X / WPA3-Enterprise, site surveys|Wireless
Brute force / password spraying|Many guesses at one account, or one common password across many accounts|Account lockout, MFA, strong password policy, monitoring|Credentials
Credential stuffing|Reusing leaked username/password pairs|MFA, breached-password checks, unique passwords|Credentials
Pass-the-hash|Reusing a stolen password hash without cracking it|Credential Guard, limit admin logons, LAPS|Credentials
Replay|Capturing and resending valid authentication|Timestamps, nonces, session tokens, Kerberos|Credentials
Privilege escalation|Gaining rights beyond what was granted|Least privilege, patching, monitoring admin use|Access
Insider threat|Misuse by an employee or contractor|Least privilege, separation of duties, DLP, logging, offboarding|Access
Zero-day|An exploit for a flaw with no patch yet|Defense in depth, EDR, segmentation, fast patching once available|Access
Supply chain|Compromise through a vendor, update or library|Vendor risk assessment, SBOM, code signing, update verification|Access
`;
