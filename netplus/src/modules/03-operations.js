/* ================= Module 3: Network Operations (N10-009 Domain 3.0, 19%) ================= */
(function(){
const LESSONS=[
{id:"docs",num:"3.1",title:"Documentation and diagrams",html:`
<p>Good documentation turns a 4-hour outage into a 10-minute fix. The exam expects you to know which document answers which question.</p>
<ul>
<li><b>Physical diagram</b>: where things actually are: racks, rooms, cable runs, patch panel ports. <b>Rack diagrams</b> show what sits in each U. <b>Cable maps</b> show which jack connects to which panel port.</li>
<li><b>Logical diagram</b>: how traffic flows: subnets, VLANs, routing, IP addressing, regardless of physical location. Diagrams are often drawn per layer: Layer 1 (cabling), Layer 2 (switching and VLANs) and Layer 3 (routing and subnets).</li>
<li><b>Asset inventory</b>: hardware, software, licensing and warranty and support status.</li>
<li><b>IPAM (IP address management)</b>: tracks subnets, assignments, reservations and DNS records so two devices don't get the same address.</li>
<li><b>SLA (service level agreement)</b>: the provider's promised uptime and response times, such as 99.9% availability.</li>
<li><b>Wireless survey and heat map</b>: a walk-through measuring signal strength, shown as a colored floor plan to find dead spots and interference.</li>
</ul>
<div class="viz" id="viz-diagram"></div>`},
{id:"lifecycle",num:"3.2",title:"Life cycle, change and configuration management",html:`
<h3>Life-cycle management</h3>
<ul><li><b>End of life (EOL)</b>: the vendor stops selling the product. <b>End of support (EOS)</b>: no more patches or help, which makes it a security risk. Plan replacements before EOS.</li>
<li><b>Software management</b>: patches, OS updates and firmware, tested and applied on a schedule.</li>
<li><b>Decommissioning</b>: wipe configs and data, update inventory and documentation, and dispose of hardware properly.</li></ul>
<h3>Change management</h3>
<p>Changes go through a formal <b>request process</b> with tracking: describe the change, assess the risk, get approval (often from a change advisory board), schedule it in a maintenance window, have a backout plan, then test and document. Unplanned changes are a top cause of outages.</p>
<h3>Configuration management</h3>
<ul><li><b>Production configuration</b>: what the device is running now.</li><li><b>Backup configuration</b>: saved copies, taken automatically and before every change.</li><li><b>Baseline / golden configuration</b>: the approved standard that every device of that type should match. Comparing against it reveals <b>drift</b>.</li></ul>
<div class="viz" id="viz-drift"></div>`},
{id:"monitor",num:"3.3",title:"Network monitoring",html:`
<h3>SNMP</h3>
<p>A management station <b>polls</b> devices on UDP 161 and devices send <b>traps</b> on UDP 162 when something happens. Each value has an <b>OID</b>, and the collection of OIDs a device supports is its <b>MIB</b>. <b>SNMPv2c</b> uses <b>community strings</b> sent in clear text. <b>SNMPv3</b> adds real <b>authentication and encryption</b>, so use it.</p>
<h3>Other data sources</h3>
<ul><li><b>Flow data</b> (NetFlow, IPFIX, sFlow): who talked to whom, on which ports, and how much. Great for "what is eating the bandwidth?"</li>
<li><b>Packet capture</b>: every byte of every packet (Wireshark, tcpdump). The deepest detail, but heavy to store.</li>
<li><b>Port mirroring (SPAN)</b>: the switch copies a port's traffic to another port where a capture tool or IDS listens. A network <b>tap</b> does the same in hardware.</li>
<li><b>Log aggregation</b>: a <b>syslog collector</b> gathers logs centrally. A <b>SIEM</b> correlates logs from many sources and raises alerts.</li>
<li><b>API integration</b>: monitoring tools pull data from, or push changes to, controllers and cloud platforms.</li></ul>
<h3>Baselines</h3>
<p>A <b>baseline</b> records normal performance (utilization, latency, errors) so that <b>anomalies</b> stand out and trigger alerts.</p>
<div class="viz" id="viz-baseline"></div>
<p>Monitoring solutions include <b>network discovery</b> (ad hoc or scheduled scans to find devices), <b>traffic analysis</b>, <b>performance monitoring</b>, <b>availability monitoring</b> (is it up?) and <b>configuration monitoring</b> (did it change?).</p>`},
{id:"dr",num:"3.4",title:"Disaster recovery and high availability",html:`
<div class="scroll"><table><thead><tr><th>Metric</th><th>Question it answers</th></tr></thead><tbody>
<tr><td class="port">RPO</td><td>Recovery point objective: how much data can we afford to lose, measured in time? Drives backup frequency.</td></tr>
<tr><td class="port">RTO</td><td>Recovery time objective: how long can we be down before it hurts too much?</td></tr>
<tr><td class="port">MTTR</td><td>Mean time to repair: the average time to fix a failure.</td></tr>
<tr><td class="port">MTBF</td><td>Mean time between failures: how long a component usually runs before failing.</td></tr>
</tbody></table></div>
<div class="viz" id="viz-rpo"></div>
<h3>Recovery sites</h3>
<ul><li><b>Hot site</b>: fully equipped with current data. Running in minutes. Most expensive.</li>
<li><b>Warm site</b>: hardware and connectivity ready, but data must be restored. Hours to days.</li>
<li><b>Cold site</b>: space, power and cooling only. Days to weeks. Cheapest.</li></ul>
<h3>High availability</h3>
<p><b>Active-active</b>: all nodes carry traffic at once, so a failure just reduces capacity. <b>Active-passive</b>: a standby waits idle and takes over on failure.</p>
<h3>Testing</h3>
<p>A <b>tabletop exercise</b> talks through a scenario around a table. A <b>validation test</b> actually fails over systems to prove the plan works.</p>`},
{id:"dhcp",num:"3.5",title:"DHCP and SLAAC",html:`
<ul><li><b>Scope</b>: the range of addresses offered. <b>Exclusions</b>: addresses in the scope never handed out. <b>Reservations</b>: a fixed address for a given MAC.</li>
<li><b>Lease time</b>: how long the client may keep its address. It tries to renew at 50% of the lease.</li>
<li><b>Options</b>: extra settings sent with the address, such as option 3 (default gateway), 6 (DNS servers), 15 (domain name), and 66 or 150 (TFTP server for IP phones).</li>
<li><b>DHCP relay / IP helper</b>: DHCP Discover is a broadcast, and routers don't forward broadcasts. A relay agent on the router turns the broadcast into a unicast to a DHCP server on another subnet.</li></ul>
<div class="viz" id="viz-relay"></div>
<h3>SLAAC</h3>
<p>With <b>stateless address autoconfiguration</b>, an IPv6 host listens for a <b>router advertisement</b>, takes the advertised /64 prefix and builds its own interface ID (from its MAC with EUI-64, or randomly for privacy). No DHCP server is needed, though DHCPv6 can still supply DNS settings.</p>`},
{id:"dns",num:"3.6",title:"DNS and time services",html:`
<div class="scroll"><table><thead><tr><th>Record</th><th>Purpose</th></tr></thead><tbody>
<tr><td class="port">A</td><td>Name to IPv4 address</td></tr><tr><td class="port">AAAA</td><td>Name to IPv6 address</td></tr><tr><td class="port">CNAME</td><td>Alias to another name</td></tr><tr><td class="port">MX</td><td>Mail server for the domain, with a priority</td></tr><tr><td class="port">TXT</td><td>Text, including SPF, DKIM and DMARC email security</td></tr><tr><td class="port">NS</td><td>Name servers that are authoritative for the zone</td></tr><tr><td class="port">PTR</td><td>Reverse lookup: IP address to name</td></tr><tr><td class="port">SOA</td><td>Start of authority: the zone's primary server and timers</td></tr>
</tbody></table></div>
<ul><li><b>Forward zone</b>: names to addresses. <b>Reverse zone</b>: addresses to names (in-addr.arpa for IPv4).</li>
<li><b>Primary</b> servers hold the editable zone. <b>Secondary</b> servers keep read-only copies through zone transfers.</li>
<li>An <b>authoritative</b> answer comes from a server that owns the zone. A <b>non-authoritative</b> answer comes from a cache.</li>
<li>A <b>recursive</b> resolver does all the work for the client, querying root, TLD and authoritative servers <b>iteratively</b>.</li>
<li>The local <b>hosts file</b> is checked before DNS and overrides it.</li></ul>
<div class="viz" id="viz-dnsres"></div>
<h3>Securing DNS</h3>
<p><b>DNSSEC</b> signs records so resolvers can verify they weren't tampered with (integrity, not privacy). <b>DNS over HTTPS (DoH)</b> on port 443 and <b>DNS over TLS (DoT)</b> on port 853 encrypt queries for privacy.</p>
<h3>Time</h3>
<p><b>NTP</b> (UDP 123) syncs clocks to within milliseconds, organized in strata (stratum 0 is the reference clock). <b>PTP</b> (Precision Time Protocol, IEEE 1588) reaches sub-microsecond accuracy with hardware timestamping, for finance and industrial networks. <b>NTS</b> (Network Time Security) adds authentication to NTP so attackers can't feed false time.</p>`},
{id:"access",num:"3.7",title:"Remote access and management methods",html:`
<h3>VPNs</h3>
<ul><li><b>Site-to-site VPN</b>: routers or firewalls at two locations keep a permanent tunnel between their networks.</li>
<li><b>Client-to-site VPN</b>: a remote user's device connects to the company network. <b>Clientless</b> VPNs run in a web browser over TLS with no installed software.</li>
<li><b>Full tunnel</b>: all the user's traffic, including internet browsing, goes through the company. <b>Split tunnel</b>: only company-bound traffic uses the tunnel, and the rest goes straight to the internet.</li></ul>
<div class="viz" id="viz-tunnel"></div>
<h3>Connection methods</h3>
<p><b>SSH</b> for the command line, a <b>GUI</b> (usually HTTPS) for web management, an <b>API</b> for automation, and a <b>console</b> cable for direct serial access when the network is down or the device is new. A <b>jump box</b> (jump host) is a hardened server admins connect to first, and only it can reach the management interfaces.</p>
<h3>In-band vs out-of-band</h3>
<p><b>In-band</b> management uses the same network that carries user traffic. If that network breaks, you lose access. <b>Out-of-band</b> management uses a separate path, such as a dedicated management network, console servers, or a cellular modem, so you can still fix things during an outage.</p>
<div class="viz" id="viz-oob"></div>`}
];

const C=[
 ["Physical diagram","Shows real locations: racks, rooms, cable runs, ports"],["Logical diagram","Shows subnets, VLANs, routing and traffic flow"],["Rack diagram","What occupies each U of a rack"],["IPAM","Tracks IP subnets, assignments and reservations"],["SLA","Provider's promised uptime and response times"],["Wireless heat map","Floor plan colored by measured signal strength"],["Asset inventory","Hardware, software, licensing and warranty records"],
 ["EOL vs EOS","EOL: no longer sold. EOS: no more patches or support."],["Decommissioning","Wipe, update inventory and docs, dispose properly"],["Change management steps","Request, assess risk, approve, schedule, implement with backout plan, test, document"],["Backout plan","How to undo a change if it fails"],["Golden configuration","The approved baseline config for a device type"],["Running config no longer matches the approved baseline. What is this called?","Configuration drift"],
 ["SNMP poll vs trap ports","Polls UDP 161; traps UDP 162"],["MIB","The set of OIDs a device exposes over SNMP"],["SNMPv3 advantage","Authentication and encryption"],["SNMPv2c weakness","Community strings in clear text"],["Flow data (NetFlow/IPFIX)","Who talked to whom, ports and volume"],["Packet capture","Full contents of packets"],["Port mirroring (SPAN)","Switch copies a port's traffic to a monitoring port"],["SIEM","Correlates logs from many sources and alerts"],["Syslog collector","Central server for device logs"],["Baseline","Record of normal performance used to spot anomalies"],["Availability monitoring","Checks whether devices and services are up"],
 ["RPO","Max acceptable data loss, in time; sets backup frequency"],["RTO","Max acceptable downtime"],["MTTR","Average time to repair"],["MTBF","Average time between failures"],["Hot site","Ready in minutes with current data; most expensive"],["Warm site","Hardware ready, data restore needed; hours to days"],["Cold site","Space and power only; days to weeks; cheapest"],["Active-active","All nodes serve traffic at once"],["Active-passive","Standby node takes over on failure"],["Tabletop exercise","Discussion-based walk-through of a disaster scenario"],
 ["DHCP scope","Range of addresses the server can lease"],["DHCP exclusion","Addresses in a scope that are never leased"],["DHCP reservation","Fixed IP for a specific MAC address"],["DHCP lease renewal","Client tries at 50% of the lease time"],["DHCP option 3","Default gateway"],["DHCP option 6","DNS servers"],["DHCP relay / IP helper","Forwards DHCP broadcasts to a server on another subnet"],["SLAAC","IPv6 host builds its own address from the router advertisement prefix"],["EUI-64","Builds a 64-bit interface ID from the 48-bit MAC"],
 ["NS record","Lists authoritative name servers"],["PTR record","Reverse lookup: IP to name"],["SOA record","Zone's primary server and timers"],["MX record","Mail server for a domain"],["Reverse zone suffix (IPv4)","in-addr.arpa"],["Authoritative answer","Comes from a server that owns the zone"],["Recursive resolver","Does the full lookup on the client's behalf"],["Hosts file","Local name mappings checked before DNS"],["DNSSEC","Digitally signs DNS records for integrity"],["DoH port","443"],["DoT port","853"],["NTP stratum 0","The reference clock (GPS, atomic)"],["PTP","IEEE 1588; sub-microsecond time with hardware timestamps"],["NTS","Network Time Security: authenticates NTP"],
 ["Site-to-site VPN","Permanent tunnel between two networks"],["Clientless VPN","Browser-based remote access over TLS"],["Split tunnel","Only corporate traffic uses the VPN"],["Full tunnel","All traffic goes through the VPN"],["Jump box","Hardened host admins use to reach management interfaces"],["Out-of-band management","Separate path to devices that works when the main network is down"],["Console connection","Direct serial access to a device"]
];
const CARDS=C.map((c,i)=>({deck:i<13?"docs":i<24?"monitor":i<34?"dr":i<56?"services":"access",id:"c"+i,q:c[0],a:c[1]}));

const QUIZ=[
 {q:"A technician needs to find which patch panel port a user's wall jack connects to. Which document helps?",o:["Logical diagram","Cable map / physical diagram","SLA","Change log"],a:1,e:"Physical documentation such as cable maps records which jack terminates on which panel port."},
 {q:"Which diagram shows VLANs, subnets and routing without regard to physical location?",o:["Rack diagram","Logical diagram","Floor plan","Cable map"],a:1,e:"Logical diagrams show how traffic flows: addressing, VLANs and routing."},
 {q:"Two servers keep getting the same static IP address. Which tool would prevent this?",o:["SIEM","IPAM","NetFlow","SLA"],a:1,e:"IP address management tracks assignments so the same address isn't used twice."},
 {q:"An ISP promises 99.95% uptime and a four-hour response time. Where is this defined?",o:["SLA","MOU","AUP","NDA"],a:0,e:"A service level agreement sets measurable performance commitments."},
 {q:"Before installing new APs, a company wants to see signal strength across the floor. What should be done?",o:["Packet capture","Wireless survey with a heat map","Port mirroring","Tabletop exercise"],a:1,e:"A wireless site survey measures RF coverage and presents it as a heat map."},
 {q:"A vendor will stop releasing security patches for a firewall model next month. What milestone is this?",o:["End of life","End of support","General availability","Decommissioning"],a:1,e:"End of support means no more patches, which makes continued use a security risk."},
 {q:"A switch is being retired. Which step is part of proper decommissioning?",o:["Leave the config in place for reuse","Wipe its configuration and update the inventory","Unplug it and leave it in the rack","Copy its config to all other switches"],a:1,e:"Decommissioning removes sensitive configs and keeps documentation accurate."},
 {q:"A router change caused an outage, and nobody can remember the previous settings. What would have helped most?",o:["A backup of the configuration taken before the change","A faster router","An SLA","A wireless survey"],a:0,e:"Configuration backups before every change make it easy to roll back."},
 {q:"An audit finds that some switches allow Telnet even though the standard config disables it. What has occurred?",o:["Configuration drift","Elasticity","Split tunneling","Jitter"],a:0,e:"Drift is when running configs deviate from the golden baseline."},
 {q:"Which part of change management describes how to undo a failed change?",o:["Risk assessment","Backout plan","SLA","Asset inventory"],a:1,e:"A backout (rollback) plan is prepared before implementation."},
 {q:"Which SNMP version provides authentication and encryption?",o:["v1","v2c","v3","All versions"],a:2,e:"SNMPv3 adds user-based authentication and encryption. v1 and v2c use clear-text community strings."},
 {q:"A switch sends an alert to the management station when a port goes down. What is this message called?",o:["A poll","A trap","A MIB","A BPDU"],a:1,e:"Traps are unsolicited alerts sent to the manager on UDP 162."},
 {q:"What defines the set of values a device makes available through SNMP?",o:["The MIB","The SLA","The DHCP scope","The SOA"],a:0,e:"The management information base lists the device's OIDs."},
 {q:"Which data source best answers \"which hosts are using the most bandwidth and on which ports?\"",o:["Syslog","Flow data such as NetFlow or IPFIX","SNMP traps","The hosts file"],a:1,e:"Flow records summarize conversations by addresses, ports and byte counts."},
 {q:"A security analyst needs to see the actual contents of suspicious traffic. What should be used?",o:["NetFlow","Packet capture","SNMP polling","A ping sweep"],a:1,e:"Packet captures record the full packets for detailed analysis."},
 {q:"An IDS needs to receive a copy of traffic from a switch port. What should be configured on the switch?",o:["Port mirroring (SPAN)","Port security","LACP","A trunk"],a:0,e:"Port mirroring copies traffic from one port or VLAN to the monitoring port."},
 {q:"A company wants to correlate firewall, server and authentication logs and alert on attack patterns. What should it deploy?",o:["SIEM","IPAM","TFTP server","NTP server"],a:0,e:"A SIEM aggregates and correlates logs from many sources."},
 {q:"Why establish a performance baseline?",o:["To speed up the network","To recognize abnormal behavior","To assign IP addresses","To encrypt logs"],a:1,e:"Knowing what's normal makes anomalies stand out and enables useful alert thresholds."},
 {q:"Which monitoring solution answers \"is the web server responding right now?\"",o:["Availability monitoring","Configuration monitoring","Flow analysis","Asset inventory"],a:0,e:"Availability monitoring checks whether devices and services are reachable."},
 {q:"A business can lose at most 15 minutes of transactions. Which metric is this?",o:["RTO","RPO","MTBF","MTTR"],a:1,e:"RPO is the maximum acceptable data loss, so backups or replication must run at least every 15 minutes."},
 {q:"Systems must be running again within 2 hours of a failure. Which metric is this?",o:["RPO","RTO","MTBF","SLA"],a:1,e:"RTO is the maximum acceptable time to restore service."},
 {q:"A switch model averages 200,000 hours between failures. Which metric is this?",o:["MTTR","MTBF","RPO","RTO"],a:1,e:"Mean time between failures measures reliability."},
 {q:"A company needs to resume operations within minutes after its data center is destroyed, and cost is not a concern. Which site?",o:["Cold site","Warm site","Hot site","Mobile site"],a:2,e:"A hot site is fully equipped with current data and can take over almost immediately."},
 {q:"Which recovery site provides only power, space and cooling?",o:["Hot","Warm","Cold","Active-active"],a:2,e:"A cold site is an empty facility. It's cheap but slow to bring online."},
 {q:"Two firewalls both pass traffic, and if one fails the other carries everything. Which design is this?",o:["Active-passive","Active-active","Cold standby","Tabletop"],a:1,e:"In active-active, all nodes handle traffic simultaneously."},
 {q:"The DR team meets in a conference room to talk through how they would respond to a ransomware attack. What is this?",o:["Validation test","Tabletop exercise","Failover test","Penetration test"],a:1,e:"A tabletop exercise is discussion-based with no systems touched."},
 {q:"Clients on VLAN 20 can't get DHCP addresses. The DHCP server is on VLAN 10 and works for VLAN 10 clients. What is missing?",o:["A DHCP reservation","A DHCP relay (IP helper) on the VLAN 20 gateway","A larger scope","An exclusion"],a:1,e:"DHCP Discover broadcasts don't cross routers. A relay forwards them to the server."},
 {q:"Which DHCP option supplies the default gateway?",o:["Option 3","Option 6","Option 15","Option 66"],a:0,e:"Option 3 is the router (gateway). Option 6 is DNS servers."},
 {q:"IP phones need to find their TFTP configuration server automatically. What should be added to the DHCP scope?",o:["Option 66 or 150","Option 3","A PTR record","A shorter lease"],a:0,e:"Options 66 and 150 point phones at the TFTP server holding their configs."},
 {q:"At what point does a DHCP client first try to renew its lease?",o:["When it expires","At 50% of the lease","At 87.5% only","Every hour"],a:1,e:"Clients renew at 50% (T1), then try any server at 87.5% (T2)."},
 {q:"A coffee shop's DHCP scope runs out of addresses daily because visitors keep them for 8 days. What should be changed?",o:["Increase the lease time","Shorten the lease time","Add reservations","Disable DHCP"],a:1,e:"Shorter leases return addresses to the pool faster in high-turnover environments."},
 {q:"How does an IPv6 host using SLAAC learn its network prefix?",o:["From a DHCPv4 server","From a router advertisement","From a PTR record","From ARP"],a:1,e:"Routers advertise the prefix, and the host builds its own interface ID."},
 {q:"Which DNS record maps an IP address back to a hostname?",o:["A","CNAME","PTR","NS"],a:2,e:"PTR records live in reverse zones and map addresses to names."},
 {q:"Which DNS record identifies the authoritative name servers for a zone?",o:["SOA","NS","MX","TXT"],a:1,e:"NS records list the zone's authoritative name servers."},
 {q:"A user's nslookup reply says \"Non-authoritative answer.\" What does that mean?",o:["The record is fake","It came from a cache, not the zone's own server","DNSSEC failed","The zone is a reverse zone"],a:1,e:"Non-authoritative answers come from a resolver's cache."},
 {q:"A secondary DNS server is out of date. What process keeps it in sync with the primary?",o:["Zone transfer","Recursion","DHCP relay","SLAAC"],a:0,e:"Secondaries pull copies of the zone from the primary through zone transfers (TCP 53)."},
 {q:"A PC resolves an internal server name to an old address even though DNS is correct. What should be checked first?",o:["The hosts file","The MX record","The NTP server","The DHCP lease"],a:0,e:"Entries in the local hosts file take priority over DNS."},
 {q:"Which technology protects DNS answers from tampering by digitally signing them?",o:["DoH","DNSSEC","DoT","NTS"],a:1,e:"DNSSEC provides integrity and authenticity, not confidentiality."},
 {q:"Which port does DNS over TLS use?",o:["53","443","853","8080"],a:2,e:"DoT uses TCP 853. DoH uses 443."},
 {q:"A trading firm needs sub-microsecond clock accuracy across its switches. Which protocol?",o:["NTP","PTP","SNMP","NTS"],a:1,e:"Precision Time Protocol with hardware timestamping reaches sub-microsecond accuracy."},
 {q:"Which addition authenticates NTP so attackers can't spoof time?",o:["NTS","PTP","DNSSEC","SNMPv3"],a:0,e:"Network Time Security adds cryptographic authentication to NTP."},
 {q:"What does stratum 0 represent in NTP?",o:["An unsynchronized clock","The reference clock such as GPS or atomic","The NTP client","The fastest server"],a:1,e:"Stratum 0 devices are reference clocks. Servers directly attached to them are stratum 1."},
 {q:"Two offices need a permanent encrypted connection between their networks. What should be configured?",o:["Client-to-site VPN","Site-to-site VPN","Split tunnel","Clientless VPN"],a:1,e:"A site-to-site VPN links two networks through their gateways."},
 {q:"Remote users' video calls are slow because all internet traffic goes through headquarters. What change helps?",o:["Full tunnel","Split tunnel","Out-of-band management","Jumbo frames"],a:1,e:"Split tunneling sends internet-bound traffic directly, using the tunnel only for corporate resources."},
 {q:"Security policy requires all remote users' web traffic to pass through the corporate web filter. Which VPN mode is required?",o:["Split tunnel","Full tunnel","Clientless","Site-to-site"],a:1,e:"A full tunnel sends all traffic through the company, where it can be inspected."},
 {q:"Contractors need access to one internal web app from any browser without installing software. What fits?",o:["Site-to-site VPN","Clientless VPN","Console cable","SNMPv3"],a:1,e:"A clientless SSL/TLS VPN runs in the browser."},
 {q:"Admins must connect to a hardened server first, and only that server can reach device management interfaces. What is this server?",o:["Proxy","Jump box","Honeypot","Domain controller"],a:1,e:"A jump box (jump host) is the single controlled entry point to management networks."},
 {q:"The core switch failed and admins can't reach any device over the network. Which approach would still let them in?",o:["In-band management","Out-of-band management","Split tunnel","SNMP traps"],a:1,e:"Out-of-band management uses a separate path, such as console servers or a cellular link."},
 {q:"A brand-new router has no IP configuration. How should the technician connect to it first?",o:["SSH","Console cable","HTTPS GUI","API"],a:1,e:"Console access works without any network configuration."},
 {q:"A team wants scripts to configure hundreds of devices automatically. Which management method fits best?",o:["Console","API","GUI","Telnet"],a:1,e:"APIs let automation tools make changes programmatically."},
 {q:"Which DNS record holds the zone's primary server and refresh timers?",o:["SOA","NS","PTR","A"],a:0,e:"The start of authority record defines the zone's primary server, serial number and timers."},
 {q:"Which record would hold a domain's SPF policy?",o:["MX","TXT","CNAME","PTR"],a:1,e:"SPF, DKIM and DMARC are published in TXT records."}
];

registerModule({
  id:"ops",slug:"operations",title:"Network Operations",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:[["docs","Documentation"],["monitor","Monitoring"],["dr","Recovery"],["services","DHCP, DNS, time"],["access","Access"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["diagram","drift","baseline","rpo","viz-relay","dnsres","tunnel","oob"],
  viz(){

/* ---- Physical vs logical diagram ---- */
(function(){
  const el=$("#viz-diagram");let mode="phys";const seen=new Set(["phys"]);
  el.innerHTML=`<div class="viz-title">One network, two diagrams</div><div class="chips"><button class="chip" data-m="phys">Physical</button><button class="chip" data-m="log">Logical (Layer 3)</button></div>
  <div class="viz-scroll"><svg viewBox="0 0 640 280" style="min-width:460px" role="img" aria-label="Network diagram"></svg></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el);
  const box=(x,y,w,h,t,s,c="")=>`<g class="m-node ${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/><text x="${x+w/2}" y="${y+h/2+(s?-3:5)}" text-anchor="middle" class="s-b" style="font-size:12.5px">${t}</text>${s?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" class="s-small" style="font-size:10px">${s}</text>`:""}</g>`;
  function draw(){el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
    if(mode==="phys"){svg.innerHTML=`<rect x="10" y="10" width="300" height="260" rx="12" class="m-zone"/><text x="22" y="30" class="s-small">MDF · Room 101 · Rack A</text>
      <rect x="330" y="10" width="300" height="260" rx="12" class="m-zone"/><text x="342" y="30" class="s-small">IDF · Floor 2 · Closet 2B</text>
      ${box(60,50,200,34,"Router · U40","")}${box(60,100,200,34,"Core switch · U38","")}${box(60,150,200,34,"Patch panel A · U36","")}${box(60,200,200,34,"Server · U20–21","")}
      ${box(380,60,200,34,"Access switch · U12","")}${box(380,110,200,34,"Patch panel 2B · U14","")}${box(380,200,95,40,"Jack 2-114","Desk 14")}${box(485,200,95,40,"Jack 2-131","AP ceiling")}
      <line class="m-link on" x1="260" y1="117" x2="380" y2="77"/><text x="320" y="88" text-anchor="middle" class="s-small" style="font-size:10px">SMF riser · 62 m</text>
      <line class="m-link" x1="480" y1="144" x2="427" y2="200"/><line class="m-link" x1="480" y1="144" x2="532" y2="200"/>`;
      $(".caption",el).innerHTML="<b>Physical.</b> Where things are: rooms, racks, rack units, the fiber riser between floors, and which jack goes to which desk. Use it to dispatch a tech or trace a cable."}
    else{svg.innerHTML=`${box(250,20,140,40,"Router","10.0.0.1 · OSPF")}${box(250,110,140,40,"Core L3 switch","SVIs .1 per VLAN")}
      <line class="m-link on" x1="320" y1="60" x2="320" y2="110"/><text x="330" y="90" class="s-small" style="font-size:10px">10.0.0.0/30</text>
      ${box(20,210,140,48,"VLAN 10 · Staff","10.10.10.0/24")}${box(180,210,140,48,"VLAN 20 · Voice","10.10.20.0/24")}${box(340,210,140,48,"VLAN 30 · Guest","10.10.30.0/24")}${box(500,210,120,48,"VLAN 99 · Mgmt","10.10.99.0/24")}
      ${[90,250,410,560].map(x=>`<line class="m-link" x1="320" y1="150" x2="${x}" y2="210"/>`).join("")}`;
      $(".caption",el).innerHTML="<b>Logical.</b> The same gear as subnets, VLANs and routing. It doesn't say which closet anything is in, but it tells you which gateway a VLAN 30 guest uses and what's routable from where."}}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;mode=b.dataset.m;seen.add(mode);draw();if(seen.size===2)award("viz:diagram",20,"Compared physical and logical diagrams")});draw();
})();

/* ---- Config drift ---- */
(function(){
  const el=$("#viz-drift");
  const G=["hostname SW-FLOOR2","service password-encryption","no ip http server","ip ssh version 2","line vty 0 4"," transport input ssh","snmp-server group NOC v3 priv","ntp server 10.10.99.5","logging host 10.10.99.20","spanning-tree mode rapid-pvst"];
  const R=["hostname SW-FLOOR2","service password-encryption","ip http server","ip ssh version 2","line vty 0 4"," transport input ssh telnet","snmp-server community public RO","ntp server 10.10.99.5","logging host 10.10.99.20","spanning-tree mode rapid-pvst"];
  const WHY={2:"The web server was turned on, opening an unencrypted management page.",5:"Telnet was re-enabled on the remote lines, so passwords can cross the network in clear text.",6:"SNMPv3 was replaced by v2c with the default community string \"public\"."};
  const found=new Set();
  el.innerHTML=`<div class="viz-title">Spot the drift: tap each line that differs from the golden config</div><div class="drift"><div><span class="s-small">GOLDEN BASELINE</span><pre class="term">${G.map(l=>l.replace(/</g,"&lt;")).join("\n")}</pre></div><div><span class="s-small">RUNNING CONFIG · SW-FLOOR2</span><div class="term dr-run">${R.map((l,i)=>`<button class="dr-l" data-i="${i}">${l}</button>`).join("")}</div></div></div><div class="caption" aria-live="polite">3 lines have drifted. Find them.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(!b)return;const i=+b.dataset.i;
    if(WHY[i]){found.add(i);b.classList.add("bad");$(".caption",el).innerHTML=`<span class="status-bad">Drift, line ${i+1}.</span> ${WHY[i]} ${found.size===3?'<br><span class="status-good">All 3 found.</span> A configuration monitoring tool would flag these automatically.':`${3-found.size} to go.`}`;if(found.size===3)award("viz:drift",20,"Found all configuration drift")}
    else{b.classList.add("okl");$(".caption",el).innerHTML=`Line ${i+1} matches the baseline. ${3-found.size} drifted line${3-found.size===1?"":"s"} left.`}});
})();

/* ---- Baseline anomaly chart ---- */
(function(){
  const el=$("#viz-baseline");
  const H=24;const base=h=>18+52*Math.max(0,Math.sin((h-7)/24*Math.PI*2*0.9))+(h>=9&&h<=17?14:0);
  const today=Array.from({length:H},(_,h)=>Math.round(base(h)+(h===3?58:0)+(h===14?33:0)+((h*37)%9)-4));
  let thr=5;
  el.innerHTML=`<div class="viz-title">Tune the alert threshold above the baseline</div><div class="viz-scroll"><svg viewBox="0 0 620 230" style="min-width:440px" role="img" aria-label="Utilization vs baseline"></svg></div>
  <div class="sn-top"><span class="sn-prefix bl-t"></span><input type="range" min="0" max="60" value="5" aria-label="Alert threshold above baseline, in percentage points"></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el),r=$("input",el);const X=h=>40+h*(560/(H-1)),Y=v=>200-v*1.7;
  function draw(){thr=+r.value;$(".bl-t",el).textContent="+"+thr+"%";
    const alerts=today.map((v,h)=>v>base(h)+thr?h:-1).filter(h=>h>=0);
    let s=`<path class="bl-band" d="M${Array.from({length:H},(_,h)=>`${X(h)},${Y(base(h)+thr)}`).join(" L")} L${Array.from({length:H},(_,h)=>`${X(H-1-h)},${Y(base(H-1-h))}`).join(" L")} Z"/>`;
    s+=`<polyline class="bl-base" points="${Array.from({length:H},(_,h)=>`${X(h)},${Y(base(h))}`).join(" ")}"/><polyline class="bl-now" points="${today.map((v,h)=>`${X(h)},${Y(v)}`).join(" ")}"/>`;
    today.forEach((v,h)=>{if(alerts.includes(h))s+=`<circle cx="${X(h)}" cy="${Y(v)}" r="6" class="bl-alert"/>`});
    [0,6,12,18,23].forEach(h=>s+=`<text x="${X(h)}" y="222" text-anchor="middle" class="s-small">${String(h).padStart(2,"0")}:00</text>`);
    [0,50,100].forEach(v=>s+=`<text x="30" y="${Y(v)+4}" text-anchor="end" class="s-small">${v}%</text>`);
    svg.innerHTML=s;
    const real=[3,14],caught=real.filter(h=>alerts.includes(h)).length,noise=alerts.filter(h=>!real.includes(h)).length;
    $(".caption",el).innerHTML=`Dashed line: the normal baseline for this WAN link. Bright line: today. <b>${alerts.length}</b> alert${alerts.length===1?"":"s"}: ${caught} of 2 real anomalies caught${noise?`, <span class="status-bad">${noise} false alarm${noise>1?"s":""}</span>`:""}. ${caught===2&&!noise?'<span class="status-good">Well tuned.</span> The 03:00 spike (a backup job gone wrong, or exfiltration?) and the 14:00 surge both alert, and normal noise doesn\'t.':thr<10?"Too sensitive: normal variation is paging the on-call engineer.":caught<2?"Too loose: a real anomaly slipped through.":""}`;
    if(caught===2&&!noise)award("viz:baseline",30,"Tuned a baseline alert")}
  r.addEventListener("input",draw);draw();
})();

/* ---- RPO / RTO timeline ---- */
(function(){
  const el=$("#viz-rpo");const TGT={rpo:4,rto:8};
  el.innerHTML=`<div class="viz-title">Meet an RPO of 4 hours and an RTO of 8 hours</div>
  <label class="rf"><span>Backup every</span><select class="rp-b">${[1,4,12,24].map(h=>`<option value="${h}" ${h===24?"selected":""}>${h} hour${h>1?"s":""}</option>`).join("")}</select></label>
  <label class="rf"><span>Recovery site</span><select class="rp-s"><option value="0.5">Hot site (≈30 min)</option><option value="6">Warm site (≈6 h)</option><option value="72" selected>Cold site (≈3 days)</option></select></label>
  <div class="rp-line"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){const b=+$(".rp-b",el).value,s=+$(".rp-s",el).value;const lost=b,down=s;
    const span=Math.max(30,b+s+6),P=v=>v/span*100,crash=b+0.0;
    $(".rp-line",el).innerHTML=`<div class="rp-track">${Array.from({length:Math.floor(crash/b)+1},(_,i)=>`<i class="rp-bk" style="left:${P(i*b)}%" title="Backup"></i>`).join("")}
      <span class="rp-loss ${lost<=TGT.rpo?"ok":"no"}" style="left:${P(0)}%;width:${P(lost)}%">data lost ${lost} h</span>
      <b class="rp-x" style="left:${P(crash)}%">⚡</b>
      <span class="rp-down ${down<=TGT.rto?"ok":"no"}" style="left:${P(crash)}%;width:${P(down)}%">down ${down<1?"30 min":down>=24?down/24+" days":down+" h"}</span></div>
      <div class="legend"><span><i style="background:var(--accent)"></i>Backup</span><span>⚡ Failure, worst case: just before the next backup</span></div>`;
    const ok1=lost<=TGT.rpo,ok2=down<=TGT.rto;
    $(".caption",el).innerHTML=`RPO: ${ok1?'<span class="status-good">met</span>':'<span class="status-bad">missed</span>'}, up to ${lost} h of data lost. RTO: ${ok2?'<span class="status-good">met</span>':'<span class="status-bad">missed</span>'}. ${ok1&&ok2?(b===4&&s===6?"This is the cheapest plan that meets both targets: a hot site would be overkill.":"Both met. Could a cheaper option still meet them?"):"Backup frequency controls RPO, and the recovery site controls RTO."}`;
    if(ok1&&ok2&&b===4&&s===6)award("viz:rpo",30,"Found the cheapest plan that meets RPO and RTO")}
  el.addEventListener("change",draw);draw();
})();

/* ---- DHCP relay ---- */
seqViz($("#viz-relay"),{title:"DHCP across a router with an IP helper",left:"Client (VLAN 20)",right:"DHCP server (VLAN 10)",
  intro:"The DHCP server is on another subnet. Without help, the client's broadcast stops at the router. Press <b>Next step</b>.",
  steps:[
   {dir:"r",label:"Discover → relay",sub:"broadcast reaches router 10.20.0.1 only",dash:true,text:"<b>Discover.</b> The client broadcasts. The router won't forward broadcasts, but its <b>ip helper-address</b> catches DHCP and re-sends it as a unicast to 10.10.0.5, filling in its own interface address (10.20.0.1) so the server knows which scope to use."},
   {dir:"l",label:"Offer (via relay)",sub:"10.20.0.57 from the VLAN 20 scope",text:"<b>Offer.</b> The server sees the relay address 10.20.0.1, picks the VLAN 20 scope, and replies to the relay, which passes it to the client."},
   {dir:"r",label:"Request (via relay)",dash:true,text:"<b>Request.</b> The client accepts. The relay forwards again."},
   {dir:"l",label:"Ack (via relay)",sub:"lease 8 h, gw 10.20.0.1, DNS 10.10.0.53",text:"<b>Acknowledge.</b> The lease begins, with options for gateway and DNS."}],
  end:"<b>Exam tip.</b> \"Clients on one VLAN get APIPA addresses but other VLANs are fine\" almost always means a missing or wrong DHCP relay."});

/* ---- DNS resolution ---- */
(function(){
  const el=$("#viz-dnsres");
  const N={pc:[70,140,"Your PC","stub resolver"],res:[230,140,"Recursive resolver","ISP or 10.10.0.53"],root:[430,40,"Root server","."],tld:[540,140,"TLD server",".com"],auth:[430,240,"Authoritative","example.com"]};
  const S=[["pc","res","PC → resolver: \"www.example.com?\" The PC checks its cache and hosts file first, then asks its configured DNS server. This is a <b>recursive</b> query: \"give me the final answer.\""],
    ["res","root","Resolver → root: the resolver's cache is empty, so it starts at a root server. This and the next steps are <b>iterative</b>."],
    ["root","res","Root → resolver: \"I don't know, but here are the .com TLD servers.\" (a referral)"],
    ["res","tld","Resolver → .com TLD: \"www.example.com?\""],
    ["tld","res","TLD → resolver: \"Ask example.com's name servers\" (from its NS records)."],
    ["res","auth","Resolver → authoritative server for example.com."],
    ["auth","res","Authoritative → resolver: \"www.example.com A 93.184.216.34, TTL 3600.\" This is an <b>authoritative</b> answer."],
    ["res","pc","Resolver → PC: the answer, now cached for an hour. If another user asks, the resolver replies at once with a <b>non-authoritative</b> answer from cache."]];
  let i=-1;
  el.innerHTML=`<div class="viz-title">Follow a DNS lookup from cold cache</div><div class="viz-scroll"><svg viewBox="0 0 640 290" style="min-width:460px" role="img" aria-label="DNS resolution diagram"></svg></div><div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="n">Next step</button><button class="btn" data-a="r">Start over</button><span class="grow"></span></div>`;
  const svg=$("svg",el);
  function draw(){let s="";const pairs=[["pc","res"],["res","root"],["res","tld"],["res","auth"]];
    pairs.forEach(([a,b])=>{const on=i>=0&&[S[i][0],S[i][1]].sort().join()===[a,b].sort().join();s+=`<line class="m-link${on?" on":""}" x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}"/>`});
    for(const[k,[x,y,n,sub]]of Object.entries(N))s+=`<g class="m-node${i>=0&&(S[i][0]===k||S[i][1]===k)?" on":""}"><rect x="${x-70}" y="${y-22}" width="140" height="44" rx="9"/><text x="${x}" y="${y-3}" text-anchor="middle" class="s-b" style="font-size:12.5px">${n}</text><text x="${x}" y="${y+13}" text-anchor="middle" class="s-small" style="font-size:10px">${sub}</text></g>`;
    if(i>=0){const [a,b]=S[i],A=N[a],B=N[b];s+=`<circle class="m-dot" r="8" cx="${A[0]+(B[0]-A[0])*.62}" cy="${A[1]+(B[1]-A[1])*.62}"/>`}
    svg.innerHTML=s;$(".caption",el).innerHTML=i<0?"Nothing is cached anywhere. Press <b>Next step</b>.":`<b>${i+1}.</b> ${S[i][2]}`;
    $(".grow",el).textContent=`Step ${i+1} of ${S.length}`;$('[data-a="n"]',el).disabled=i===S.length-1;if(i===S.length-1)award("viz:dnsres",20,"Resolved a name from scratch")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="n")i++;if(a==="r")i=-1;if(a)draw()});draw();
})();

/* ---- Split vs full tunnel ---- */
(function(){
  const el=$("#viz-tunnel");let mode="full";const seen=new Set();
  el.innerHTML=`<div class="viz-title">Where does a remote worker's traffic go?</div><div class="chips"><button class="chip" data-m="full">Full tunnel</button><button class="chip" data-m="split">Split tunnel</button></div>
  <div class="viz-scroll"><svg viewBox="0 0 620 250" style="min-width:440px" role="img" aria-label="VPN tunnel diagram"></svg></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el);
  function draw(){el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
    const n=(x,y,t,s)=>`<g class="m-node"><rect x="${x-62}" y="${y-22}" width="124" height="44" rx="9"/><text x="${x}" y="${y-3}" text-anchor="middle" class="s-b" style="font-size:12.5px">${t}</text><text x="${x}" y="${y+13}" text-anchor="middle" class="s-small" style="font-size:10px">${s}</text></g>`;
    svg.innerHTML=`<path class="vp-t" d="M80,125 C200,125 330,125 470,125"/><text x="275" y="112" text-anchor="middle" class="s-small">ENCRYPTED TUNNEL</text>
    ${mode==="full"?`<path class="vp-w on" d="M470,125 C520,90 520,60 540,40"/><text x="560" y="96" class="s-small">via HQ firewall + web filter</text>`:`<path class="vp-w on" d="M80,125 C160,60 360,40 540,40"/><text x="300" y="44" text-anchor="middle" class="s-small">straight to the internet</text>`}
    <path class="vp-c on" d="M470,125 C520,160 520,190 540,215"/>
    ${n(80,125,"Home laptop","VPN client")}${n(470,125,"HQ VPN gateway","")}${n(540,40,"Internet","video calls, web")}${n(540,215,"File server","10.10.0.40")}`;
    $(".caption",el).innerHTML=mode==="full"?"<b>Full tunnel.</b> Everything, even a YouTube video, goes through HQ first. The company can inspect and filter it all, but it uses more HQ bandwidth and adds latency.":"<b>Split tunnel.</b> Only traffic for company subnets enters the tunnel. Internet traffic goes straight out from home, which is faster but bypasses the company's web filtering."}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;mode=b.dataset.m;seen.add(mode);draw();if(seen.size===2)award("viz:tunnel",20,"Compared full and split tunnels")});draw();
})();

/* ---- In-band vs out-of-band ---- */
(function(){
  const el=$("#viz-oob");let broken=false;
  el.innerHTML=`<div class="viz-title">Break the production network, then try to manage the switch</div><div class="viz-scroll"><svg viewBox="0 0 620 234" style="min-width:440px" role="img" aria-label="Management paths"></svg></div><div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="b">Fail the core switch</button></div>`;
  const svg=$("svg",el);
  function draw(){const n=(x,y,t,s,c="")=>`<g class="m-node ${c}"><rect x="${x-62}" y="${y-22}" width="124" height="44" rx="9"/><text x="${x}" y="${y-3}" text-anchor="middle" class="s-b" style="font-size:12.5px">${t}</text><text x="${x}" y="${y+13}" text-anchor="middle" class="s-small" style="font-size:10px">${s}</text></g>`;
    svg.innerHTML=`<line class="m-link${broken?" stp-b":" on"}" x1="80" y1="60" x2="310" y2="60"/><line class="m-link${broken?" stp-b":" on"}" x1="310" y1="60" x2="540" y2="60"/>
    <path class="m-link on oob-p" d="M80,60 C80,170 200,180 310,180 C420,180 540,170 540,60"/>
    <text x="310" y="22" text-anchor="middle" class="s-small">IN-BAND (SSH over production)</text><text x="310" y="224" text-anchor="middle" class="s-small">OUT-OF-BAND (console server + LTE modem)</text>
    ${n(80,60,"Admin","jump box")}${n(310,60,"Core switch",broken?"FAILED":"production",broken?"tp-off":"")}${n(540,60,"Branch switch","needs a fix")}${n(310,180,"Console server","serial to every device")}`;
    $(".caption",el).innerHTML=broken?"<span class=\"status-bad\">In-band is down</span> along with the network it depends on. <span class=\"status-good\">Out-of-band still works:</span> the admin dials the console server over LTE and gets a serial session on the branch switch to fix it.":"Day to day, admins manage devices <b>in-band</b> over the production network. The out-of-band path sits ready.";
    $('[data-a="b"]',el).textContent=broken?"Repair the core switch":"Fail the core switch"}
  el.addEventListener("click",e=>{if(!e.target.closest("[data-a]"))return;broken=!broken;draw();if(broken)award("viz:oob",20,"Saw out-of-band management save the day")});draw();
})();

  },
  sims:[
    {id:"dns",type:"match",title:"Build the DNS zone",
      scenario:"You're setting up DNS for a new branch domain. Match each requirement to the record type that satisfies it.",
      items:[["A","a"],["AAAA","aaaa"],["CNAME","cname"],["MX","mx"],["TXT","txt"],["NS","ns"],["PTR","ptr"]],
      slots:[["a","Requirement 1","intranet.branch.example → 10.40.0.20"],["aaaa","Requirement 2","intranet.branch.example → 2001:db8:40::20"],["cname","Requirement 3","wiki.branch.example should point to intranet.branch.example"],["mx","Requirement 4","Mail for the domain goes to mail.example.com"],["txt","Requirement 5","Publish the SPF policy listing allowed senders"],["ns","Requirement 6","Delegate the zone to ns1 and ns2"],["ptr","Requirement 7","10.40.0.20 should resolve back to intranet.branch.example"]],
      success:"The zone is complete: forward, reverse, mail and delegation are all covered."},
    {id:"dr",title:"Design the recovery plans",mount(el,api,sim){
      const T=[["Online store","Loses $40,000 per hour of downtime. Every order counts: at most 5 minutes of data can be lost, and it must be back within 15 minutes.",["Cold site + nightly backups","Warm site + hourly backups","Hot site + continuous replication","Tabletop exercise only"],2,"An RTO of 15 minutes and an RPO of 5 minutes need a hot site with replication."],
        ["Internal wiki","Nice to have. Losing a day of edits is acceptable, and a week of downtime is tolerable.",["Hot site + continuous replication","Cold site + daily backups","Active-active across two regions","Warm site + 15-minute snapshots"],1,"Low-priority systems get the cheapest plan that meets the targets: cold site and daily backups."],
        ["Payroll system","Must be back within 24 hours. Losing up to 4 hours of data is acceptable.",["Warm site + backups every 4 hours","Hot site + continuous replication","Cold site + weekly backups","No backup; rebuild from scratch"],0,"A warm site restores within hours, and 4-hourly backups meet the RPO, at much lower cost than a hot site."],
        ["Two web servers","They must stay up through a single server failure, using both servers' capacity every day.",["Active-passive","Active-active behind a load balancer","Cold standby","A tabletop exercise"],1,"Active-active uses both servers at once and keeps running if one fails."]];
      let ans=T.map(()=>null),graded=false;
      function d(){el.innerHTML=`${simHead(sim,api)}<p class="scenario">The CIO wants recovery plans that meet each system's targets without overspending. Pick the best plan for each.</p>
        <div class="tickets">${T.map((t,i)=>`<div class="tk ${graded?(ans[i]===t[3]?"ok":"no"):""}"><div class="tk-h"><span class="mono">DR-${i+1}</span><b>${t[0]}</b></div><p>${t[1]}</p>
        <div class="tk-o">${t[2].map((o,j)=>`<button class="opt ${ans[i]===j?"sel":""}" data-t="${i}" data-o="${j}">${o}</button>`).join("")}</div>${graded&&ans[i]!==t[3]?`<p class="tk-e">${t[4]}</p>`:""}</div>`).join("")}</div>
        <div class="caption" aria-live="polite">${graded?(T.every((t,i)=>ans[i]===t[3])?'<span class="status-good">Every plan meets its targets at the right cost.</span>':`<b>${T.filter((t,i)=>ans[i]===t[3]).length} of ${T.length}</b> correct.`):"Choose one plan per system."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Submit plans</button></div>`}
      el.addEventListener("click",e=>{const o=e.target.closest("[data-o]"),a=e.target.closest("[data-a]");if(o){ans[+o.dataset.t]=+o.dataset.o;graded=false;d()}if(a){graded=true;if(T.every((t,i)=>ans[i]===t[3]))api.pass();d()}});d();
    }},
    {id:"change",type:"order",title:"Push a firmware upgrade the right way",
      scenario:"All 40 access switches need a firmware upgrade that fixes a security flaw. Put the change management steps in order.",
      steps:["Submit a change request describing the upgrade","Assess risk and impact, and write a backout plan","Get approval from the change advisory board","Schedule it in a maintenance window and notify users","Back up configs, then apply the firmware","Test and verify the switches work","Update documentation and close the request"],
      success:"Approved, scheduled, backed up, tested and documented."},
    {id:"mon",type:"match",title:"Pick the right monitoring tool",
      scenario:"The NOC gets six questions in one morning. Match each question to the monitoring method that answers it best.",
      items:[["SNMP polling","snmp"],["Flow data","flow"],["Packet capture","pcap"],["SIEM","siem"],["Port mirroring","span"],["Availability monitoring","up"]],
      slots:[["snmp","Q1","What is the CPU load and interface error count on core-sw1?"],["flow","Q2","Which hosts sent the most traffic to the internet yesterday?"],["pcap","Q3","What exactly is inside the packets this VoIP phone is sending?"],["siem","Q4","Do failed logins on the VPN line up with firewall denies from the same IP?"],["span","Q5","How do we get a copy of this switch port's traffic to the IDS?"],["up","Q6","Page the on-call engineer the moment the website stops responding"]],
      success:"Right tool, right question."}
  ],
  badges:[
    ["reader","OP","Ops Ready","Mark all 7 operations lessons studied",c=>c.allStudied()],
    ["lab","NC","NOC Console","Complete all 8 operations diagrams",c=>c.vizAll()],
    ["dns","DN","Zone Master","Pass the DNS zone simulation",c=>c.passed("dns")],
    ["dr","DR","Disaster Ready","Pass the recovery plan simulation",c=>c.passed("dr")],
    ["chg","CM","Change Controlled","Pass the change management simulation",c=>c.passed("change")],
    ["base","BL","Signal Not Noise","Tune the baseline alert perfectly",c=>c.earned("viz:baseline")],
    ["recall","TR","Total Recall","Master 15 operations flashcards",c=>c.countAtLeast(4)>=15],
    ["perfect","PP","Five Nines","Score 100% on an operations quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
