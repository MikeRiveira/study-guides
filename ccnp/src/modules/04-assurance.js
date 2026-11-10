/* ================= Module 4: Network Assurance (350-401 v1.2 Domain 4.0, 10%) ================= */
(function(){
const LESSONS=[
{id:"diag",num:"4.1",title:"Diagnosing problems: debugs, ping, traceroute, syslog and SNMP",html:`
<p>Assurance means knowing the network works, and finding out quickly when it doesn't. The first set of tools is built into every IOS XE device.</p>
<h3>Debugs and conditional debugs</h3>
<ul><li><code>debug</code> prints events as they happen (<code>debug ip ospf adj</code>, <code>debug ip bgp</code>, <code>debug crypto isakmp</code>). Output goes to the console, or to a VTY session after <code>terminal monitor</code>.</li>
<li>Debugs run at high priority and can overload the CPU. <code>debug ip packet</code> on a busy router is the classic outage. Narrow it with an ACL (<code>debug ip packet 101 detail</code>) or a <b>condition</b>.</li>
<li><b>Conditional debugging</b> limits debug output to matching traffic or interfaces: <code>debug condition interface g0/0/1</code> or <code>debug condition ip 10.1.1.10</code>. Check with <code>show debugging</code> and <code>show debug condition</code>.</li>
<li>Always know how to stop: <code>undebug all</code> (or <code>no debug all</code>). Use <code>logging buffered</code> rather than the console so a flood doesn't lock you out.</li></ul>
<div class="viz" id="viz-condebug"></div>
<h3>Extended ping and traceroute</h3>
<ul><li><b>Extended ping</b> (type <code>ping</code> with no address) sets the source address or interface, repeat count, size, DF bit and more. <code>ping 10.9.9.9 source loopback0</code> tests the <b>return path</b> to that source, which a plain ping from the exit interface doesn't.</li>
<li>Ping output: <code>!</code> reply, <code>.</code> timeout, <code>U</code> unreachable, <code>M</code> could not fragment (DF set and the MTU is too small), <code>Q</code> source quench, <code>&amp;</code> TTL exceeded.</li>
<li><b>Traceroute</b> sends probes with TTL 1, 2, 3... Each router that decrements TTL to zero returns an ICMP <b>time exceeded</b>, revealing itself. Cisco traceroute uses UDP to high ports; the destination answers with <b>port unreachable</b>. <code>*</code> means no reply for that probe (often a filter, not a failure).</li></ul>
<div class="viz" id="viz-trace"></div>
<h3>Syslog</h3>
<table><tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr><tr><td>1</td><td>alerts</td><td>Immediate action needed</td></tr><tr><td>2</td><td>critical</td><td>Hardware failure</td></tr><tr><td>3</td><td>errors</td><td>Interface errors</td></tr><tr><td>4</td><td>warnings</td><td>Configuration warnings</td></tr><tr><td>5</td><td>notifications</td><td>Interface up/down, config changes</td></tr><tr><td>6</td><td>informational</td><td>ACL hits, normal events</td></tr><tr><td>7</td><td>debugging</td><td>Debug output</td></tr></table>
<p>A level setting includes everything <b>more severe</b>: <code>logging trap warnings</code> sends levels 0 to 4 to the syslog server. A memory aid: "<b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce cream <b>D</b>aily". Messages look like <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface Gi0/0/1, changed state to down</code>: facility, severity, mnemonic, text. Syslog uses UDP 514 by default (TCP is possible). Add <code>service timestamps log datetime msec</code> and NTP so the times mean something.</p>
<div class="viz" id="viz-syslog"></div>
<h3>SNMP</h3>
<ul><li>The <b>manager</b> (NMS) polls <b>agents</b> on devices with GET/GETNEXT/GETBULK on UDP 161 and changes values with SET. Agents send <b>traps</b> (unacknowledged) or <b>informs</b> (acknowledged) to UDP 162.</li>
<li>Values live in the <b>MIB</b>, identified by <b>OIDs</b> like 1.3.6.1.2.1.1.5 (sysName).</li>
<li><b>SNMPv1/v2c</b> authenticate with a plain-text community string. v2c adds GETBULK and informs.</li>
<li><b>SNMPv3</b> adds users and three security levels: <b>noAuthNoPriv</b> (username only), <b>authNoPriv</b> (HMAC with SHA), <b>authPriv</b> (authentication plus AES encryption).</li></ul>
<pre class="term">snmp-server group NMS v3 priv
snmp-server user nmsuser NMS v3 auth sha Auth!Pass priv aes 128 Priv!Pass
snmp-server host 10.0.0.50 version 3 priv nmsuser
snmp-server enable traps</pre>
<div class="viz" id="viz-snmpver"></div>
<div class="tip"><b>Exam tip.</b> logging trap N sends N and everything lower (more severe). SNMPv3 authPriv = auth + encryption. Conditional debugs keep debug output (and CPU) under control.</div>`},
{id:"fnf",num:"4.2",title:"NetFlow and Flexible NetFlow",html:`
<p>SNMP tells you <i>how much</i> traffic crossed an interface. <b>NetFlow</b> tells you <i>who was talking to whom</i>: per-flow statistics for capacity planning, billing, troubleshooting and security (spotting scans and data exfiltration).</p>
<ul><li>A <b>flow</b> is a set of packets sharing the same <b>key fields</b>. Traditional NetFlow uses seven: source and destination IP, source and destination port, protocol, ToS byte and input interface.</li>
<li>The router keeps a <b>flow cache</b>. A flow is exported to a <b>collector</b> when it ends (FIN/RST), goes idle (<b>inactive timeout</b>, 15 s default) or has run a long time (<b>active timeout</b>, 30 min default).</li>
<li>Versions: <b>v5</b> fixed format, IPv4 only. <b>v9</b> template-based, so it can carry any fields including IPv6 and MPLS. <b>IPFIX</b> is the IETF standard based on v9 (sometimes called v10).</li></ul>
<h3>Flexible NetFlow (FNF)</h3>
<p>FNF separates the configuration into three reusable pieces, then applies them to an interface:</p>
<ol><li><b>Flow record</b>: which fields are <b>keys</b> (<code>match</code>: they define a flow) and which are <b>non-key</b> data to collect (<code>collect</code>: counters, timestamps).</li>
<li><b>Flow exporter</b>: where to send it (<code>destination</code>, <code>transport udp 2055</code>, <code>source</code>, <code>export-protocol</code>).</li>
<li><b>Flow monitor</b>: ties a record to one or more exporters and holds the cache.</li>
<li>Apply it: <code>ip flow monitor NAME input</code> on the interface.</li></ol>
<pre class="term">flow record APP-REC
 match ipv4 source address
 match ipv4 destination address
 match transport destination-port
 collect counter bytes
 collect counter packets
flow exporter TO-COLLECTOR
 destination 10.0.0.60
 source GigabitEthernet0/0/1
 transport udp 2055
flow monitor APP-MON
 record APP-REC
 exporter TO-COLLECTOR
interface GigabitEthernet0/0/0
 ip flow monitor APP-MON input</pre>
<p>Verify with <code>show flow monitor APP-MON cache</code>, <code>show flow exporter</code> and <code>show flow interface</code>.</p>
<div class="viz" id="viz-fnfparts"></div>
<div class="viz" id="viz-fnfkey"></div>
<div class="tip"><b>Exam tip.</b> match = key field (defines the flow), collect = non-key data. The monitor references the record and exporter and is the thing applied to the interface.</div>`},
{id:"span",num:"4.3",title:"SPAN, RSPAN and ERSPAN",html:`
<p>To capture traffic with Wireshark or an IDS you need a copy of it. Switches make copies with <b>port mirroring</b>.</p>
<table><tr><th></th><th>SPAN</th><th>RSPAN</th><th>ERSPAN</th></tr>
<tr><td>Destination</td><td>A port on the same switch</td><td>A port on another switch in the same Layer 2 domain</td><td>A device anywhere reachable by IP</td></tr>
<tr><td>Transport</td><td>Local copy</td><td>A dedicated <b>RSPAN VLAN</b> carried over trunks</td><td><b>GRE</b> encapsulation across a routed network</td></tr>
<tr><td>Config</td><td><code>monitor session 1 source ...</code> / <code>destination interface ...</code></td><td><code>vlan 999</code> + <code>remote-span</code> on every switch; source session sends to <code>destination remote vlan 999</code>; far switch uses <code>source remote vlan 999</code></td><td><code>monitor session 1 type erspan-source</code> with <code>destination</code>, <code>ip address</code>, <code>erspan-id</code> and <code>origin ip address</code></td></tr></table>
<ul><li>Sources can be ports or VLANs, in direction <code>rx</code>, <code>tx</code> or <code>both</code> (the default).</li>
<li>A SPAN destination port stops acting as a normal switchport: it only sends the copies and doesn't learn addresses or forward normal traffic (unless <code>ingress</code> is enabled).</li>
<li>A port can't be both a source and a destination. Oversubscription happens: mirroring two 10 Gbps ports in both directions to one 10 Gbps port drops copies.</li>
<li>The RSPAN VLAN must be allowed on every trunk in the path and used for nothing else.</li></ul>
<div class="viz" id="viz-spantypes"></div>
<div class="viz" id="viz-spanmini"></div>
<div class="tip"><b>Exam tip.</b> SPAN = same switch. RSPAN = remote-span VLAN over trunks. ERSPAN = GRE over IP, so it can cross routers.</div>`},
{id:"sla",num:"4.4",title:"IP SLA and object tracking",html:`
<p>An interface can be up while the path beyond it is dead: an ISP's router fails behind a media converter, or a provider network loses its upstream. <b>IP SLA</b> sends synthetic probes to measure what users would actually experience.</p>
<ul><li>Operations include <b>icmp-echo</b> (reachability and round-trip time), <b>udp-jitter</b> (jitter, latency and loss for voice; needs an <code>ip sla responder</code> at the far end), <b>http</b>, <b>dns</b> and <b>tcp-connect</b>.</li>
<li>Configure the operation, then <b>schedule</b> it: <code>ip sla schedule 1 life forever start-time now</code>. A configured but unscheduled probe never runs.</li>
<li>Results: <code>show ip sla statistics</code> (return code OK or Timeout, RTT) and <code>show ip sla summary</code>.</li></ul>
<h3>Tracking</h3>
<p>A <b>track object</b> turns something into an up/down state: an interface's line protocol, a route's presence, or an IP SLA result (<code>track 1 ip sla 1 reachability</code>). Other features then react to it:</p>
<ul><li><b>Static routes</b>: <code>ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1</code> is removed when track 1 goes down, so a floating static (higher AD) takes over.</li>
<li><b>HSRP/VRRP</b>: <code>standby 10 track 1 decrement 20</code>.</li>
<li><b>EEM</b>: <code>event track 1 state down</code>.</li>
<li><code>delay down 10 up 30</code> under the track object stops flapping.</li></ul>
<pre class="term">ip sla 1
 icmp-echo 203.0.113.1 source-interface GigabitEthernet0/0/0
 frequency 10
ip sla schedule 1 life forever start-time now
track 1 ip sla 1 reachability
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 250</pre>
<div class="viz" id="viz-slaflow"></div>
<div class="tip"><b>Exam tip.</b> The probe needs scheduling. udp-jitter needs a responder. A tracked static plus a floating static (higher AD) gives failover when the interface stays up but the path dies.</div>`},
{id:"catc",num:"4.5",title:"Catalyst Center workflows and AI-driven assurance",html:`
<p><b>Cisco Catalyst Center</b> (formerly DNA Center) is the controller and assurance platform for campus networks. ENCOR asks you to describe its workflows for configuration, monitoring and management.</p>
<h3>The workflow</h3>
<ol><li><b>Design</b>: the network hierarchy (sites, buildings, floors), network settings (DNS, NTP, AAA, syslog, SNMP servers), IP address pools, wireless SSIDs, and the <b>software image repository</b> with golden images.</li>
<li><b>Policy</b>: group-based access policy (security groups and contracts), QoS application policy (business relevant, default, irrelevant), and virtual networks for SD-Access.</li>
<li><b>Provision</b>: discover or <b>Plug and Play</b> onboard devices, assign them to sites, push templates and settings, and build SD-Access fabrics. <b>Template Editor</b> pushes CLI templates (with variables) to many devices; <b>SWIM</b> upgrades images.</li>
<li><b>Assurance</b>: health scores for the network, clients and applications, built from streaming telemetry, syslog, SNMP, NetFlow and wireless data. Issues come with suggested causes and actions.</li>
<li><b>Platform</b>: REST APIs (Intent API), event notifications (webhooks) and integrations with ITSM tools like ServiceNow.</li></ol>
<div class="viz" id="viz-catcflow"></div>
<h3>AI and ML in assurance</h3>
<ul><li><b>Baselining and anomaly detection</b>: machine learning learns what's normal for each site and time of day (onboarding times, roaming, throughput) and flags deviations instead of relying on fixed thresholds.</li>
<li><b>Root cause analysis</b>: correlates events from many devices into one issue ("clients on floor 3 fail DHCP because the relay is unreachable").</li>
<li><b>Network comparisons and trends</b>: compares a site with its peers or with itself over time.</li>
<li><b>Predictive insights</b>: forecasting capacity or AP issues before users notice.</li>
<li><b>AI assistants</b>: natural language questions about health, issues and configuration (the AI Assistant in Catalyst Center and other Cisco platforms).</li>
<li><b>Intelligent capture and sensors</b>: on-demand packet captures from APs and synthetic tests from wireless sensors.</li></ul>
<div class="viz" id="viz-aiops"></div>
<div class="tip"><b>Exam tip.</b> Design (what the network should look like), Policy (who can talk to whom and with what priority), Provision (push it), Assurance (prove it works). AI/ML in assurance = dynamic baselines, anomaly detection and correlated root cause.</div>`},
{id:"yang",num:"4.6",title:"NETCONF and RESTCONF",html:`
<p>CLI scraping is fragile: output formats change between versions. <b>Model-driven programmability</b> uses <b>YANG</b> data models so software can read and change configuration and state as structured data.</p>
<h3>YANG</h3>
<ul><li>A data modeling language (RFC 7950) that describes the structure: <b>containers</b>, <b>lists</b> (with keys), <b>leaves</b> (single values with types) and leaf-lists.</li>
<li><b>Native</b> models (Cisco-IOS-XE-native) map closely to the CLI. <b>IETF</b> models (ietf-interfaces) and <b>OpenConfig</b> models are vendor-neutral.</li></ul>
<h3>NETCONF (RFC 6241)</h3>
<ul><li>Runs over <b>SSH on TCP 830</b>. Encodes data in <b>XML</b>.</li>
<li>Layers: transport (SSH), messages (<code>&lt;rpc&gt;</code> and <code>&lt;rpc-reply&gt;</code>), operations, content (YANG data).</li>
<li>Operations: <code>&lt;get&gt;</code> (config and state), <code>&lt;get-config&gt;</code>, <code>&lt;edit-config&gt;</code>, <code>&lt;copy-config&gt;</code>, <code>&lt;delete-config&gt;</code>, <code>&lt;lock&gt;</code>/<code>&lt;unlock&gt;</code>, <code>&lt;commit&gt;</code>, <code>&lt;close-session&gt;</code>.</li>
<li>Datastores: <b>running</b>, <b>startup</b> and <b>candidate</b> (stage changes, validate, then commit them all at once). Changes are transactional: all or nothing.</li>
<li>The session starts with a <code>&lt;hello&gt;</code> exchange in which each side lists its <b>capabilities</b> (supported models and features).</li></ul>
<h3>RESTCONF (RFC 8040)</h3>
<ul><li>A REST-style interface to the same YANG models over <b>HTTPS (TCP 443)</b>, with <b>JSON or XML</b> encoding.</li>
<li>HTTP methods map to operations: <b>GET</b> (read), <b>POST</b> (create), <b>PUT</b> (create or replace), <b>PATCH</b> (merge/update), <b>DELETE</b> (remove).</li>
<li>URL: <code>https://10.1.1.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1</code>. Headers: <code>Accept: application/yang-data+json</code> and <code>Content-Type: application/yang-data+json</code>.</li>
<li>No candidate datastore and no locking; each request is its own change.</li></ul>
<h3>Enabling them on IOS XE</h3>
<pre class="term">aaa new-model
aaa authentication login default local
aaa authorization exec default local
username netadmin privilege 15 secret Str0ng!Pass
netconf-yang
ip http secure-server
ip http authentication local
restconf</pre>
<p>Both need a privilege 15 user (and AAA). Check with <code>show platform software yang-management process</code> (confd, ncsshd and nginx should be Running) and <code>show netconf-yang sessions</code>.</p>
<div class="viz" id="viz-ncvsrc"></div>
<div class="viz" id="viz-ncstack"></div>
<div class="viz" id="viz-rcurl"></div>
<div class="tip"><b>Exam tip.</b> NETCONF: SSH 830, XML, candidate datastore, edit-config. RESTCONF: HTTPS 443, JSON or XML, HTTP verbs. Both use YANG.</div>`}
];

const G={
diag:[["Command to see debugs on an SSH session?","terminal monitor."],["Stop all debugs?","undebug all (or no debug all)."],["Limit debug output to one interface?","debug condition interface X."],["Why is debug ip packet dangerous?","It can overload the CPU on a busy router."],["Show active debugs?","show debugging."],["Ping symbol . means?","Timeout."],["Ping symbol U?","Destination unreachable."],["Ping symbol M?","Could not fragment (DF set, MTU too small)."],["Why ping with source loopback0?","To test the return path to that source address."],["How does traceroute discover hops?","Increasing TTLs; each hop returns ICMP time exceeded."],["Traceroute * means?","No reply for that probe, often filtered."],["What does Cisco traceroute send by default?","UDP probes to high ports."],["Syslog level 0?","Emergencies."],["Syslog level 3?","Errors."],["Syslog level 4?","Warnings."],["Syslog level 5?","Notifications."],["Syslog level 6?","Informational."],["Syslog level 7?","Debugging."],["logging trap warnings sends which levels?","0 to 4."],["Syslog default port?","UDP 514."],["Parts of a syslog message?","%FACILITY-SEVERITY-MNEMONIC: text."],["Why configure NTP with syslog?","So timestamps are accurate and comparable."],["SNMP polling port?","UDP 161."],["SNMP trap port?","UDP 162."],["Trap vs inform?","Informs are acknowledged; traps aren't."],["What is a MIB?","The database of managed objects."],["What is an OID?","The numeric identifier of a MIB object."],["SNMPv2c security?","Plain-text community string."],["SNMPv3 noAuthNoPriv?","Username only."],["SNMPv3 authNoPriv?","Authentication (HMAC) without encryption."],["SNMPv3 authPriv?","Authentication and encryption."],["What did v2c add over v1?","GETBULK and informs."]],
flow:[["What does NetFlow record?","Per-flow statistics: who talked to whom, how much."],["Traditional NetFlow key fields?","Src/dst IP, src/dst port, protocol, ToS, input interface."],["NetFlow inactive timeout default?","15 seconds."],["NetFlow active timeout default?","30 minutes."],["NetFlow v5 limitation?","Fixed format, IPv4 only."],["NetFlow v9 feature?","Templates: any fields, IPv6, MPLS."],["IPFIX?","The IETF standard based on NetFlow v9."],["Three FNF building blocks?","Flow record, flow exporter, flow monitor."],["FNF match keyword?","Defines a key field."],["FNF collect keyword?","Defines a non-key field to collect."],["What is applied to the interface in FNF?","The flow monitor: ip flow monitor NAME input."],["Where is the collector address set?","In the flow exporter: destination."],["Show the flow cache?","show flow monitor NAME cache."],["Common NetFlow collector UDP ports?","2055, 9995 or 9996 (configurable)."],["Security use of NetFlow?","Detecting scans, DDoS and data exfiltration."]],
span:[["SPAN destination?","A port on the same switch."],["RSPAN transport?","A remote-span VLAN carried over trunks."],["ERSPAN transport?","GRE across an IP network."],["Command to mark an RSPAN VLAN?","remote-span under the VLAN."],["RSPAN source switch destination?","monitor session N destination remote vlan V."],["RSPAN far switch source?","monitor session N source remote vlan V."],["Default SPAN direction?","both."],["Can a port be SPAN source and destination?","No."],["What happens to a SPAN destination port?","It only sends mirrored copies; no normal switching."],["SPAN oversubscription risk?","Mirroring more traffic than the destination port's speed drops copies."],["ERSPAN session type command?","monitor session N type erspan-source."],["Verify SPAN?","show monitor session N."]],
sla:[["Why use IP SLA?","Interfaces can be up while the path beyond is dead."],["IP SLA operation for voice quality?","udp-jitter."],["What does udp-jitter need at the far end?","ip sla responder."],["Start an IP SLA probe?","ip sla schedule N life forever start-time now."],["Track an SLA probe?","track N ip sla N reachability."],["Tie a static route to a track?","ip route ... next-hop track N."],["What is a floating static?","A backup static route with a higher AD."],["Show SLA results?","show ip sla statistics."],["Stop a track object flapping?","delay down X up Y under the track."],["Things that can use track objects?","Static routes, HSRP/VRRP, EEM, PBR."]],
catc:[["Catalyst Center's former name?","DNA Center."],["Four main workflow areas?","Design, Policy, Provision, Assurance."],["Where are DNS, NTP and AAA servers set?","Design > Network Settings."],["Where are golden images managed?","Design > Image Repository (SWIM)."],["What does Provision do?","Assigns devices to sites, pushes templates and settings, builds fabrics."],["Zero-touch onboarding in Catalyst Center?","Plug and Play (PnP)."],["Assurance data sources?","Streaming telemetry, syslog, SNMP, NetFlow, wireless data."],["What are health scores?","Rated health for network devices, clients and apps."],["AI/ML baselining?","Learns normal behavior per site and time to flag anomalies."],["AI root cause analysis?","Correlates events into one issue with a likely cause."],["Catalyst Center northbound API?","Intent API (REST)."],["Template Editor?","Pushes CLI templates with variables to many devices."]],
yang:[["What is YANG?","A data modeling language for config and state (RFC 7950)."],["YANG node types?","Container, list, leaf, leaf-list."],["Vendor-neutral YANG model families?","IETF and OpenConfig."],["NETCONF transport and port?","SSH, TCP 830."],["NETCONF encoding?","XML."],["NETCONF read config op?","<get-config>."],["NETCONF change config op?","<edit-config>."],["NETCONF datastores?","Running, startup, candidate."],["Candidate datastore benefit?","Stage and validate, then commit atomically."],["What starts a NETCONF session?","<hello> with capabilities."],["RESTCONF transport?","HTTPS, TCP 443."],["RESTCONF encodings?","JSON or XML."],["RESTCONF read?","GET."],["RESTCONF create?","POST."],["RESTCONF replace?","PUT."],["RESTCONF merge/update?","PATCH."],["RESTCONF media type?","application/yang-data+json (or +xml)."],["RESTCONF URL root?","/restconf/data/."],["Enable NETCONF on IOS XE?","netconf-yang."],["Enable RESTCONF on IOS XE?","restconf, plus ip http secure-server."],["Check NETCONF/RESTCONF processes?","show platform software yang-management process."],["User privilege needed for NETCONF?","15."]]
};
const DECKS=[["diag","Debug, syslog, SNMP"],["flow","NetFlow"],["span","SPAN"],["sla","IP SLA and tracking"],["catc","Catalyst Center and AI"],["yang","NETCONF and RESTCONF"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"Which command shows debug output on a VTY session?",o:["terminal monitor","logging console","debug vty","show debugging"],a:0,e:"Debugs go to the console by default."},
{q:"How can you safely debug traffic for a single host on a busy router?",o:["debug condition ip <host> then the debug","debug all","debug ip packet with no ACL","logging console debugging"],a:0,e:"Conditional debugging."},
{q:"A ping returns M M M. What's the problem?",o:["Packets need fragmenting but DF is set","No route","ACL","The host is down"],a:0,e:"MTU."},
{q:"Why use 'ping 10.9.9.9 source loopback0'?",o:["To test that the far end can route back to the loopback","To test the console","To raise TTL","To use TCP"],a:0,e:"Return path."},
{q:"How does traceroute learn each hop?",o:["TTL expires and the router returns ICMP time exceeded","Each hop sends CDP","It reads routing tables","It uses SNMP"],a:0,e:"Incrementing TTL."},
{q:"'logging trap notifications' sends which levels?",o:["0 through 5","5 only","5 through 7","0 through 4"],a:0,e:"Level and more severe."},
{q:"Which syslog level is 'errors'?",o:["3","2","4","5"],a:0,e:"0 emerg, 1 alert, 2 crit, 3 err."},
{q:"%LINEPROTO-5-UPDOWN. What is 5?",o:["Severity: notifications","Facility","Interface number","Sequence number"],a:0,e:"Facility-severity-mnemonic."},
{q:"Which SNMPv3 level provides encryption?",o:["authPriv","authNoPriv","noAuthNoPriv","v2c"],a:0,e:"Priv = privacy."},
{q:"Which SNMP message is acknowledged?",o:["Inform","Trap","GET","GETBULK"],a:0,e:"Informs are confirmed."},
{q:"An NMS polls devices. Which port do the agents listen on?",o:["UDP 161","UDP 162","TCP 161","UDP 514"],a:0,e:"162 is for traps."},
{q:"What does NetFlow provide that SNMP interface counters don't?",o:["Per-conversation detail: who talked to whom","Interface utilization","CPU usage","Device uptime"],a:0,e:"Flows."},
{q:"In Flexible NetFlow, what defines which packets belong to the same flow?",o:["match statements in the flow record","collect statements","The exporter","The monitor"],a:0,e:"Key fields."},
{q:"Which FNF component is applied to the interface?",o:["Flow monitor","Flow record","Flow exporter","Flow sampler only"],a:0,e:"ip flow monitor."},
{q:"Which NetFlow version is fixed-format and IPv4 only?",o:["v5","v9","IPFIX","v10"],a:0,e:"v9 introduced templates."},
{q:"Where do you set the NetFlow collector's IP address?",o:["flow exporter","flow record","flow monitor","interface"],a:0,e:"destination."},
{q:"A long file transfer still shows in the NetFlow cache after 20 minutes. When will it be exported?",o:["At the active timeout (30 min default)","At the inactive timeout","Never","Only when it ends"],a:0,e:"Long-lived flows."},
{q:"You need to capture traffic from a switch port and send it to an analyzer on another switch in the same campus Layer 2 domain. Which feature?",o:["RSPAN","Local SPAN","ERSPAN only","NetFlow"],a:0,e:"Remote-span VLAN."},
{q:"The analyzer is in a data center several routed hops away. Which feature?",o:["ERSPAN","RSPAN","Local SPAN","Port security"],a:0,e:"GRE."},
{q:"What must be configured on every switch carrying RSPAN traffic?",o:["The VLAN with remote-span, allowed on the trunks","A GRE tunnel","IP routing","An SVI"],a:0,e:"Dedicated VLAN."},
{q:"A SPAN destination port connected to a laptop has no network access. Why?",o:["SPAN destinations don't forward normal traffic","The laptop is wrong","STP","PortFast"],a:0,e:"It only sends copies."},
{q:"An ISP's router fails but your WAN interface stays up. Which feature detects the failure?",o:["IP SLA with tracking","Interface tracking","HSRP","UDLD"],a:0,e:"Probe beyond the interface."},
{q:"An IP SLA operation is configured but 'show ip sla statistics' shows no results. Likely cause?",o:["It was never scheduled","The frequency is too high","No track object","NTP not set"],a:0,e:"ip sla schedule."},
{q:"Which IP SLA operation measures jitter for voice?",o:["udp-jitter","icmp-echo","http","dns"],a:0,e:"Needs a responder."},
{q:"How do you make a static route depend on an IP SLA probe?",o:["track N ip sla N reachability, then 'track N' on the ip route","Put the SLA number in the AD","Use a route map","Configure ip sla route"],a:0,e:"Track object."},
{q:"Two default routes: one via ISP-A with 'track 1', one via ISP-B with AD 250. Track 1 goes down. What happens?",o:["The ISP-B default is installed","Both are removed","Both are used","Nothing"],a:0,e:"Floating static."},
{q:"In which Catalyst Center area do you define sites, IP pools and the NTP server?",o:["Design","Policy","Provision","Assurance"],a:0,e:"Network hierarchy and settings."},
{q:"Which Catalyst Center area assigns devices to sites and pushes configuration?",o:["Provision","Design","Policy","Platform"],a:0,e:"Provisioning."},
{q:"What does AI/ML baselining in Catalyst Center Assurance do?",o:["Learns normal behavior and flags anomalies","Pushes images","Assigns IP addresses","Writes ACLs"],a:0,e:"Dynamic baselines instead of fixed thresholds."},
{q:"Catalyst Center shows one issue 'clients on floor 3 failing DHCP' instead of 200 separate alerts. Which capability?",o:["AI-driven root cause analysis/correlation","SNMP traps","Syslog","SPAN"],a:0,e:"Correlation."},
{q:"Which transport and port does NETCONF use?",o:["SSH, TCP 830","HTTPS, 443","SSH, 22 only","UDP 161"],a:0,e:"830."},
{q:"Which NETCONF datastore lets you stage changes and commit them together?",o:["Candidate","Running","Startup","Intended"],a:0,e:"Commit."},
{q:"Which NETCONF operation changes configuration?",o:["<edit-config>","<get-config>","<get>","<hello>"],a:0,e:"edit-config."},
{q:"A RESTCONF client wants to change one leaf without replacing the whole interface config. Which method?",o:["PATCH","PUT","POST","GET"],a:0,e:"Merge."},
{q:"Which encodings can RESTCONF use?",o:["JSON or XML","XML only","YAML only","CSV"],a:0,e:"application/yang-data+json or +xml."},
{q:"What describes the structure of the data NETCONF and RESTCONF exchange?",o:["YANG models","MIBs","JSON Schema","Templates"],a:0,e:"Model-driven."},
{q:"Which command enables RESTCONF on IOS XE (with the HTTPS server)?",o:["restconf","netconf-yang","ip http restconf","yang restconf enable"],a:0,e:"Plus ip http secure-server."},
{q:"Which is a vendor-neutral YANG model family?",o:["OpenConfig","Cisco-IOS-XE-native","Cisco-IOS-XE-oper","MIB-II"],a:0,e:"Also IETF."},
{q:"Which RESTCONF URL reads interface GigabitEthernet1?",o:["/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet1","/netconf/interfaces/1","/api/v1/interface/1","/restconf/ops/get"],a:0,e:"Resource path."},
{q:"What is exchanged at the start of a NETCONF session?",o:["<hello> messages listing capabilities","SNMP traps","Certificates only","A RESTCONF token"],a:0,e:"Capabilities."}
];

registerModule({
  id:"assure",slug:"assurance",title:"Network Assurance",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["condebug","trace","syslog","snmpver","fnfparts","fnfkey","spantypes","spanmini","slaflow","catcflow","aiops","ncvsrc","ncstack","rcurl"],
  viz(){
stepViz($("#viz-condebug"),{title:"Debugging safely on a production router",done:"Debugged safely",steps:[
  ["The problem","Users on 10.1.1.10 say they can't reach a server. R1 forwards 50,000 packets per second."],
  ["The wrong move","'debug ip packet' with no filter tries to print every packet. The CPU hits 100%, the console locks and routing protocols may drop. Don't do this."],
  ["Send output to the buffer","logging buffered 64000 debugging and no logging console. Now debug output fills memory you can read with show logging, instead of the slow console."],
  ["Set a condition","debug condition ip 10.1.1.10 limits debugs that support conditions to that host. show debug condition confirms it."],
  ["Narrow further with an ACL","access-list 101 permit ip host 10.1.1.10 host 10.9.9.9 then debug ip packet 101 detail."],
  ["Read and stop","show logging shows the drops ('unroutable' or 'access denied'). Then undebug all, and remove the condition with undebug condition all."]]});

seqViz($("#viz-trace"),{title:"How traceroute finds each hop",left:"PC",right:"Hops",done:"Traced a route",intro:"traceroute 10.9.9.9 from R1 through R2 and R3.",steps:[
  {dir:"r",label:"Probe TTL 1",sub:"UDP to port 33434",text:"R2 decrements TTL to 0 and drops it."},
  {dir:"l",label:"ICMP time exceeded",sub:"from R2",text:"Hop 1 = R2's address, with three RTT samples."},
  {dir:"r",label:"Probe TTL 2",sub:"",text:"R2 forwards it with TTL 1. R3 decrements to 0."},
  {dir:"l",label:"ICMP time exceeded",sub:"from R3",text:"Hop 2 = R3."},
  {dir:"r",label:"Probe TTL 3",sub:"",text:"The packet reaches 10.9.9.9 itself. Nothing listens on that UDP port."},
  {dir:"l",label:"ICMP port unreachable",sub:"from 10.9.9.9",text:"The destination answered, so traceroute stops. A hop showing * * * only means that router didn't reply (often rate-limited or filtered)."}],
  end:"Windows tracert uses ICMP echo instead of UDP, so a firewall may treat the two differently."});

/* ---- syslog level slider ---- */
(function(){const el=$("#viz-syslog");const L=[["emergencies","%SYS-0-SYS_LCPERR0: system unusable"],["alerts","%PLATFORM-1-TEMP: temperature critical, shutting down"],["critical","%PLATFORM-2-PSU: power supply 1 failed"],["errors","%LINK-3-UPDOWN: Interface Gi0/0/1, changed state to down"],["warnings","%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID"],["notifications","%LINEPROTO-5-UPDOWN: Line protocol on Gi0/0/2 changed state to up"],["informational","%SEC-6-IPACCESSLOGP: list 101 denied tcp 10.1.1.10 -> 10.9.9.9"],["debugging","%OSPF-7-ADJCHG debug: Rcv hello from 2.2.2.2"]];let t=4;const seen=new Set();
  function draw(){seen.add(t);el.innerHTML=`<div class="viz-title">logging trap: which messages reach the server?</div><div class="chips">${L.map((l,i)=>`<button class="chip" data-i="${i}" aria-pressed="${i===t}">${i} ${l[0]}</button>`).join("")}</div>
    <div class="term">${L.map((l,i)=>`<span class="${i<=t?"tp-l up":"tp-l blk"}">${i<=t?"SENT  ":"drop  "}${l[1]}</span>`).join("\n")}</div><div class="caption" aria-live="polite">logging trap ${L[t][0]} (${t}) sends levels 0 to ${t}. ${t>=6?"Level 6 and 7 can be very chatty: make sure the server and the router CPU can handle it.":t<=2?"Very quiet: interface failures (level 3) and up/down notices (level 5) won't reach the server.":"A common production choice."}</div>`;if(seen.size>=4)award("viz:syslog",20,"Tuned the syslog trap level")}
  el.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){t=+c.dataset.i;draw()}});draw()})();

revealViz($("#viz-snmpver"),{title:"SNMP versions and security levels",cols:3,done:"Compared SNMP versions",items:[
  ["SNMPv1","Community","Plain-text community string. 32-bit counters. Traps only."],
  ["SNMPv2c","Community","Still a plain-text community, but adds GETBULK, 64-bit counters and informs."],
  ["v3 noAuthNoPriv","User only","Matches a username, nothing more. Rarely used."],
  ["v3 authNoPriv","HMAC","Authenticates each message with SHA (or MD5), so it can't be forged or altered. Content is still readable."],
  ["v3 authPriv","HMAC + AES","Authenticated and encrypted. The level to use in production."],
  ["Views and ACLs","Limit access","snmp-server view limits which OIDs a group sees; an ACL on the community or group limits which managers may poll."]]});

revealViz($("#viz-fnfparts"),{title:"Flexible NetFlow building blocks",cols:2,done:"Explored the FNF building blocks",items:[
  ["Flow record","What to track","match fields (keys) define a flow. collect fields (non-key) are the data gathered for each flow: bytes, packets, timestamps."],
  ["Flow exporter","Where to send it","Collector address, source interface, UDP port, export protocol (v9 or IPFIX)."],
  ["Flow monitor","Ties it together","References one record and one or more exporters, and holds the cache with its timeouts."],
  ["Interface","Where to watch","ip flow monitor NAME input (or output). The same monitor can be used on many interfaces."]]});

sortViz($("#viz-fnfkey"),{title:"Key field (match) or non-key field (collect)?",bins:{m:"match (key)",c:"collect (non-key)"},done:"Sorted the flow record fields",intro:"You want one flow per source, destination and application port.",items:[
  ["ipv4 source address","m","Different sources are different flows."],["ipv4 destination address","m",""],["transport destination-port","m","Separates HTTPS from SSH between the same hosts."],["counter bytes","c","Data about the flow, not part of its identity."],["counter packets","c",""],["timestamp sys-uptime first","c","When the flow started."],["ipv4 protocol","m","TCP vs UDP."],["interface output","c","Useful to know but it doesn't split flows here."]]});

revealViz($("#viz-spantypes"),{title:"SPAN, RSPAN and ERSPAN",cols:3,done:"Compared the port mirroring types",items:[
  ["SPAN","Local","Source ports or VLANs and a destination port on the same switch. Simplest, no extra transport."],
  ["RSPAN","Layer 2 remote","Copies go into a dedicated remote-span VLAN carried by trunks to the switch where the analyzer is."],
  ["ERSPAN","Layer 3 remote","Copies are wrapped in GRE and routed to an IP destination anywhere, identified by an ERSPAN ID."]]});

iosViz($("#viz-spanmini"),{title:"Mini lab: mirror a port to Wireshark",scenario:"An analyzer is plugged into SW1 G1/0/10. Mirror both directions of the server port G1/0/2 to it.",
  devices:[{name:"SW1",kind:"switch"}],links:[],
  boot:{SW1:["hostname SW1","interface g1/0/2","switchport mode access"]},consoles:["SW1"],startMode:"priv",topo:{SW1:[300,70]},topoH:120,
  tasks:[{t:"Session 1: source G1/0/2 both directions",hint:"configure terminal\nmonitor session 1 source interface g1/0/2 both",check:(w,D)=>(D.SW1.mon[1]?.src||[]).some(s=>s.if===IOS.ifName("g1/0/2"))},
    {t:"Destination G1/0/10",hint:"monitor session 1 destination interface g1/0/10",check:(w,D)=>D.SW1.mon[1]?.dst===IOS.ifName("g1/0/10")},
    {t:"Verify the session",hint:"do show monitor session 1",check:(w,D,S)=>ranCmd(S,"SW1",/sh\S* mon\S*/i)}],
  solution:"configure terminal\nmonitor session 1 source interface g1/0/2 both\nmonitor session 1 destination interface g1/0/10\ndo show monitor session 1",
  success:"Try making G1/0/2 the destination too: a port can't be both."},"spanmini",40,"SPAN mini lab");

stepViz($("#viz-slaflow"),{title:"IP SLA failover, step by step",done:"Followed an IP SLA failover",steps:[
  ["Normal","IP SLA 1 pings ISP-A's router 203.0.113.1 every 10 seconds. Replies come back, so track 1 is Up and the default route via ISP-A (AD 1) is installed."],
  ["The failure","ISP-A's router crashes. R1's interface stays up because the provider's media converter still has link."],
  ["Without IP SLA","The static default stays in the table, because its next hop is still in a connected subnet. Traffic is blackholed."],
  ["With IP SLA","Probes time out. After the timeout, track 1 changes to Down and logs %TRACK-6-STATE: 1 ip sla 1 reachability Up -> Down."],
  ["Failover","The tracked default route is withdrawn. The floating default via ISP-B (AD 250) is now the best route and is installed."],
  ["Recovery","When probes succeed again, track 1 returns Up (after any 'delay up' timer) and the ISP-A route comes back."]]});

stepViz($("#viz-catcflow"),{title:"Onboarding a new branch with Catalyst Center",done:"Walked through the Catalyst Center workflow",steps:[
  ["Design: hierarchy","Create the site Global/US/Chicago/Building 1/Floor 2. Settings inherit down the hierarchy."],
  ["Design: settings","Set DNS, DHCP, NTP, syslog, SNMP and AAA servers, IP pools for the site, and mark a golden image for the switch platform."],
  ["Policy","Assign security groups (Employees, Contractors, IoT) and the application QoS policy marking collaboration apps as business relevant."],
  ["Provision: Plug and Play","A new switch boots with no config, finds Catalyst Center (DHCP option 43 or DNS), and is claimed to the site. It's upgraded to the golden image and gets a day-0 template."],
  ["Provision: templates","A day-N template with variables (hostname, VLANs) is pushed to every access switch on the floor."],
  ["Assurance","Health scores appear for the switch and its clients. A week later, AI-driven baselining notices onboarding times rising and links it to a slow RADIUS server."]]});

sortViz($("#viz-aiops"),{title:"AI-driven or traditional monitoring?",bins:{ai:"AI/ML-driven",tr:"Traditional"},done:"Sorted AI and traditional monitoring",items:[
  ["Alert when CPU passes a fixed 80% threshold","tr","Static threshold."],["Learn that Monday 9 a.m. onboarding is normally slower and only alert on unusual deviations","ai","Dynamic baseline."],["Poll ifInOctets every 5 minutes","tr","SNMP polling."],["Group 200 client failures into one issue with a probable cause","ai","Correlation and root cause."],["Compare a site's Wi-Fi performance to similar sites","ai","Peer comparison."],["Send a syslog message when an interface goes down","tr",""],["Ask 'which APs had the most client failures yesterday?' in plain language","ai","AI assistant."],["Forecast that a WAN link will hit capacity next quarter","ai","Predictive analytics."]]});

sortViz($("#viz-ncvsrc"),{title:"NETCONF, RESTCONF or both?",bins:{nc:"NETCONF",rc:"RESTCONF",b:"Both"},done:"Compared NETCONF and RESTCONF",items:[
  ["SSH on TCP 830","nc",""],["HTTPS on TCP 443","rc",""],["Uses YANG models","b",""],["JSON encoding","rc","RESTCONF can also use XML."],["XML encoding","b","NETCONF is XML only."],["Candidate datastore and commit","nc",""],["HTTP verbs GET, PUT, PATCH, POST, DELETE","rc",""],["<edit-config> and <get-config>","nc",""],["Locking the datastore","nc",""],["Needs a privilege 15 user on IOS XE","b",""]]});

revealViz($("#viz-ncstack"),{title:"The NETCONF protocol layers",cols:2,done:"Explored the NETCONF layers",items:[
  ["Content","YANG data","The configuration or state itself, structured by YANG models: <interfaces><interface><name>GigabitEthernet1</name>..."],
  ["Operations","What to do","<get>, <get-config>, <edit-config>, <copy-config>, <delete-config>, <lock>, <commit>..."],
  ["Messages","RPC framing","<rpc message-id=\"101\"> and the matching <rpc-reply>, plus <notification>."],
  ["Secure transport","SSH","Port 830, authenticated with the device's users."]]});

quizViz($("#viz-rcurl"),{title:"Build the RESTCONF request",done:"Built every RESTCONF request",qs:[
  ["Read the configuration of every interface in the IETF model.",["GET /restconf/data/ietf-interfaces:interfaces","POST /restconf/data/ietf-interfaces:interfaces","GET /netconf/interfaces","PATCH /restconf/interfaces"],0,"GET reads."],
  ["Change only the description of GigabitEthernet2, leaving everything else.",["PATCH .../interface=GigabitEthernet2","PUT .../interface=GigabitEthernet2","DELETE .../interface=GigabitEthernet2","GET .../interface=GigabitEthernet2"],0,"PATCH merges; PUT would replace the whole interface."],
  ["Create a new Loopback100 interface.",["POST to .../interfaces (or PUT to .../interface=Loopback100)","GET .../Loopback100","PATCH /restconf","DELETE .../interfaces"],0,"POST creates a child resource."],
  ["Which header asks for a JSON response?",["Accept: application/yang-data+json","Content-Type: text/html","Accept: application/xml-rpc","Authorization: json"],0,"Accept is what you want back."],
  ["The request returns 401 Unauthorized. Likely cause?",["Wrong credentials or no privilege 15 user","Wrong URL","Wrong JSON","RESTCONF uses SSH"],0,"404 would mean a wrong path."]]});
  },
  sims:[
    {id:"logsnmp",type:"ios",title:"Syslog and SNMPv3 hardening",lab:{
      scenario:"R1 still uses SNMPv2c with community 'public' and logs nothing off the box. Send syslog warnings and above to 10.0.0.50 with millisecond timestamps, replace the community with SNMPv3 authPriv for the NMS at 10.0.0.50, and enable traps.",
      devices:[{name:"R1",kind:"router"},{name:"SW1",kind:"switch"}],links:[["R1:g0/0/1","SW1:g1/0/1"]],hosts:[{name:"NMS",ip:"10.0.0.50",gw:"10.0.0.1",at:"SW1:g1/0/2"}],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.0.0.1 255.255.255.0","no shutdown","snmp-server community public RO"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[160,70],SW1:[340,70],NMS:[500,70]},topoH:130,
      tasks:[
        {t:"Syslog to 10.0.0.50, levels 0 to 4 only",hint:"logging host 10.0.0.50\nlogging trap warnings",check:(w,D)=>D.R1.logging.hosts.includes(ip("10.0.0.50"))&&D.R1.logging.trap===4},
        {t:"Timestamps with date, time and milliseconds",hint:"service timestamps log datetime msec",check:(w,D)=>!!D.R1.logging.ts},
        {t:"SNMPv3 group NMS with priv, and user nmsuser (SHA Auth!Pass, AES 128 Priv!Pass)",hint:"snmp-server group NMS v3 priv\nsnmp-server user nmsuser NMS v3 auth sha Auth!Pass priv aes 128 Priv!Pass",check:(w,D)=>(D.R1.snmp.groups||[]).includes("NMS")&&D.R1.snmp.v3.some(u=>u.u==="nmsuser"&&u.g==="NMS")},
        {t:"Send v3 authPriv traps to 10.0.0.50 and enable traps",hint:"snmp-server host 10.0.0.50 version 3 priv nmsuser\nsnmp-server enable traps",check:(w,D)=>D.R1.snmp.hosts.some(h=>h.ip===ip("10.0.0.50")&&/3 priv/.test(h.v))&&!!D.R1.snmp.traps},
        {t:"Remove the 'public' community",hint:"no snmp-server community public",check:(w,D)=>!D.R1.snmp.comm.some(c=>c.name==="public")}],
      solution:"configure terminal\nlogging host 10.0.0.50\nlogging trap warnings\nservice timestamps log datetime msec\nsnmp-server group NMS v3 priv\nsnmp-server user nmsuser NMS v3 auth sha Auth!Pass priv aes 128 Priv!Pass\nsnmp-server host 10.0.0.50 version 3 priv nmsuser\nsnmp-server enable traps\nno snmp-server community public",
      success:"Polls and traps are now authenticated and encrypted, and anything at warning level or worse reaches the syslog server."}},
    {id:"fnflab",type:"ios",title:"Flexible NetFlow to a collector",lab:{
      scenario:"The security team wants flow data for traffic arriving from the internet on R1 G0/0/0. Build a record keyed on source address, destination address and destination port that collects bytes and packets, export it to 10.0.0.60 on UDP 2055 from G0/0/1, and apply it inbound on G0/0/0.",
      devices:[{name:"R1",kind:"router"},{name:"ISP",kind:"router"}],links:[["R1:g0/0/0","ISP:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 10.0.0.1 255.255.255.0","no shutdown"],ISP:["hostname ISP","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[180,70],ISP:[420,70]},topoH:130,
      tasks:[
        {t:"Flow record SEC-REC: match source, destination and destination port; collect bytes and packets",hint:"flow record SEC-REC\nmatch ipv4 source address\nmatch ipv4 destination address\nmatch transport destination-port\ncollect counter bytes\ncollect counter packets",check:(w,D)=>{const R=D.R1.fnf.rec["SEC-REC"];return R&&["ipv4 source address","ipv4 destination address","transport destination-port"].every(m=>R.match.includes(m))&&["counter bytes","counter packets"].every(c=>R.collect.includes(c))}},
        {t:"Flow exporter SEC-EXP: 10.0.0.60, UDP 2055, source G0/0/1",hint:"flow exporter SEC-EXP\ndestination 10.0.0.60\ntransport udp 2055\nsource g0/0/1",check:(w,D)=>{const E=D.R1.fnf.exp["SEC-EXP"];return E&&E.dst===ip("10.0.0.60")&&E.port===2055&&E.src===IOS.ifName("g0/0/1")}},
        {t:"Flow monitor SEC-MON uses both",hint:"flow monitor SEC-MON\nrecord SEC-REC\nexporter SEC-EXP",check:(w,D)=>{const M=D.R1.fnf.mon["SEC-MON"];return M&&M.rec==="SEC-REC"&&M.exp.includes("SEC-EXP")}},
        {t:"Apply it inbound on G0/0/0",hint:"interface g0/0/0\nip flow monitor SEC-MON input",check:(w,D)=>D.R1.ifs[IOS.ifName("g0/0/0")].flowMon.in==="SEC-MON"},
        {t:"Look at the cache",hint:"do show flow monitor SEC-MON cache",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* flow mon\S* SEC-MON cache/i)}],
      solution:"configure terminal\nflow record SEC-REC\nmatch ipv4 source address\nmatch ipv4 destination address\nmatch transport destination-port\ncollect counter bytes\ncollect counter packets\nflow exporter SEC-EXP\ndestination 10.0.0.60\ntransport udp 2055\nsource g0/0/1\nflow monitor SEC-MON\nrecord SEC-REC\nexporter SEC-EXP\ninterface g0/0/0\nip flow monitor SEC-MON input\ndo show flow monitor SEC-MON cache",
      success:"Notice the order: the monitor needs the record and exporter first, and the interface needs the monitor."}},
    {id:"rspanlab",type:"ios",title:"Remote SPAN across two switches",lab:{
      scenario:"A server on SW1 G1/0/2 is misbehaving, but the analyzer is on SW2 G1/0/10. The switches connect with a trunk on G1/0/1. Use RSPAN VLAN 999 to deliver the copies.",
      devices:[{name:"SW1",kind:"switch"},{name:"SW2",kind:"switch"}],links:[["SW1:g1/0/1","SW2:g1/0/1"]],
      boot:{SW1:["hostname SW1","interface g1/0/1","switchport mode trunk","interface g1/0/2","switchport mode access"],SW2:["hostname SW2","interface g1/0/1","switchport mode trunk"]},
      consoles:["SW1","SW2"],startMode:"priv",topo:{SW1:[180,70],SW2:[420,70]},topoH:130,
      tasks:[
        {t:"VLAN 999 as a remote-span VLAN on both switches",hint:"vlan 999\nremote-span",check:(w,D)=>["SW1","SW2"].every(s=>D[s].vlans[999]?.rspan)},
        {t:"SW1: session 1 sources G1/0/2 and sends to remote VLAN 999",hint:"monitor session 1 source interface g1/0/2\nmonitor session 1 destination remote vlan 999",check:(w,D)=>D.SW1.mon[1]?.dstVlan===999&&(D.SW1.mon[1].src||[]).some(s=>s.if===IOS.ifName("g1/0/2"))},
        {t:"SW2: session 1 takes remote VLAN 999 to G1/0/10",hint:"monitor session 1 source remote vlan 999\nmonitor session 1 destination interface g1/0/10",check:(w,D)=>D.SW2.mon[1]?.srcRemote===999&&D.SW2.mon[1].dst===IOS.ifName("g1/0/10")},
        {t:"The trunk carries VLAN 999",hint:"do show interfaces trunk",check:(w,D,S)=>ranCmd(S,"SW2",/sh\S* int\S* tr/i)||ranCmd(S,"SW1",/sh\S* int\S* tr/i)?IOS.trunkAllows(D.SW1.ifs[IOS.ifName("g1/0/1")],999):false}],
      solution:"! SW1\nconfigure terminal\nvlan 999\nremote-span\nexit\nmonitor session 1 source interface g1/0/2\nmonitor session 1 destination remote vlan 999\n! SW2\nconfigure terminal\nvlan 999\nremote-span\nexit\nmonitor session 1 source remote vlan 999\nmonitor session 1 destination interface g1/0/10\ndo show interfaces trunk",
      success:"If a trunk in the path pruned VLAN 999, the copies would never arrive. In a routed network, you'd use ERSPAN instead."}},
    {id:"slalab",type:"ios",title:"IP SLA failover between two ISPs",lab:{
      scenario:"R1 has a default route to ISP1 (203.0.113.1) and a backup link to ISP2 (198.51.100.1). Last month ISP1's router failed while the link stayed up, and the branch was offline for hours. Probe ISP1 with IP SLA, track it, and make the default route fail over to ISP2 automatically.",
      devices:[{name:"R1",kind:"router"},{name:"ISP1",kind:"router"},{name:"ISP2",kind:"router"}],links:[["R1:g0/0/0","ISP1:g0/0/0"],["R1:g0/0/1","ISP2:g0/0/0"]],
      boot:{R1:["hostname R1","interface g0/0/0","ip address 203.0.113.2 255.255.255.252","no shutdown","interface g0/0/1","ip address 198.51.100.2 255.255.255.252","no shutdown","ip route 0.0.0.0 0.0.0.0 203.0.113.1"],ISP1:["hostname ISP1","interface g0/0/0","ip address 203.0.113.1 255.255.255.252","no shutdown"],ISP2:["hostname ISP2","interface g0/0/0","ip address 198.51.100.1 255.255.255.252","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[160,110],ISP1:[440,40],ISP2:[440,180]},topoH:230,
      events:[{label:"ISP1 router fails (link stays up)",run:(w,D)=>{const i=D.ISP1.ifs[IOS.ifName("g0/0/0")];i._ip=i.ip;i.ip=null;return "ISP1 stops answering. R1 G0/0/0 is still up/up."}},{label:"ISP1 recovers",run:(w,D)=>{const i=D.ISP1.ifs[IOS.ifName("g0/0/0")];if(i._ip!=null)i.ip=i._ip;return "ISP1 answers again."}}],
      tasks:[
        {t:"IP SLA 1: icmp-echo to 203.0.113.1 from G0/0/0 every 10 seconds, scheduled now and forever",hint:"ip sla 1\nicmp-echo 203.0.113.1 source-interface g0/0/0\nfrequency 10\nexit\nip sla schedule 1 life forever start-time now",check:(w,D)=>{const s=D.R1.slas[1];return s&&s.dst===ip("203.0.113.1")&&s.freq===10&&s.sched},sticky:true},
        {t:"Track 1 follows IP SLA 1 reachability",hint:"track 1 ip sla 1 reachability",check:(w,D)=>D.R1.tracks[1]?.type==="sla"&&+D.R1.tracks[1].sla===1,sticky:true},
        {t:"Replace the default route with one that tracks object 1",hint:"no ip route 0.0.0.0 0.0.0.0 203.0.113.1\nip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1",check:(w,D)=>D.R1.routes.some(r=>r.len===0&&r.nh===ip("203.0.113.1")&&r.track===1),sticky:true},
        {t:"Floating default via ISP2 with AD 250",hint:"ip route 0.0.0.0 0.0.0.0 198.51.100.1 250",check:(w,D)=>D.R1.routes.some(r=>r.len===0&&r.nh===ip("198.51.100.1")&&r.ad===250),sticky:true},
        {t:"Fail ISP1 and confirm the default route now points to ISP2",hint:"(press ISP1 router fails (link stays up))\ndo show ip route static\ndo show track 1",check:(w,D)=>bestVia(w,D,"R1","0.0.0.0",0)==="198.51.100.1"&&D.R1.routes.some(r=>r.track===1),sticky:true}],
      solution:"configure terminal\nip sla 1\nicmp-echo 203.0.113.1 source-interface g0/0/0\nfrequency 10\nexit\nip sla schedule 1 life forever start-time now\ntrack 1 ip sla 1 reachability\nexit\nno ip route 0.0.0.0 0.0.0.0 203.0.113.1\nip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1\nip route 0.0.0.0 0.0.0.0 198.51.100.1 250\n(press ISP1 router fails (link stays up))\ndo show ip route static\ndo show track 1",
      success:"Press 'ISP1 recovers' and the primary default route returns. Without the probe, the dead route would have stayed in the table because the interface never went down."}},
    {id:"debugpick",type:"choice",title:"Pick the right diagnostic tool",scenario:"Each situation calls for a different tool. Pick the one that answers the question fastest without hurting the network.",success:"You matched each problem to the tool built for it.",steps:[
      ["Users report slow video calls between two sites, but there are no drops on interface counters. You need jitter and latency numbers over time.",["IP SLA udp-jitter with a responder at the far site","debug ip packet","show interfaces","SPAN"],0,"Synthetic probes measure what voice and video experience."],
      ["The security team wants to know which internal hosts sent the most data to the internet last night.",["Flexible NetFlow to a collector","SNMP interface counters","Syslog","traceroute"],0,"Per-flow data."],
      ["An OSPF adjacency on a busy core router keeps resetting. You want to see the hellos on one interface without flooding the console.",["debug condition interface plus debug ip ospf adj, logged to the buffer","debug all","debug ip packet","ping"],0,"Conditional debug."],
      ["An IDS needs a copy of all traffic from a server port, and it sits in another building reachable only through routers.",["ERSPAN","RSPAN","Local SPAN","NetFlow"],0,"GRE across Layer 3."],
      ["You need to know at which hop packets to a SaaS app start taking a bad path.",["traceroute","SNMP","Syslog","show cdp neighbors"],0,"Hop by hop."],
      ["You want devices to push configuration changes and link failures to a central server with accurate timestamps.",["Syslog with NTP and service timestamps","SNMP GET","NetFlow","SPAN"],0,"Event logging."]]},
    {id:"yanglab",type:"ios",title:"Enable NETCONF and RESTCONF",lab:{
      scenario:"An automation team will manage R1 with Python over NETCONF and Postman over RESTCONF. Prepare R1: AAA with local login and exec authorization, a privilege 15 user 'netadmin', then NETCONF and RESTCONF over HTTPS.",
      devices:[{name:"R1",kind:"router"}],links:[],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.0.0.1 255.255.255.0","no shutdown","ip domain name lab.local"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[300,70]},topoH:120,
      tasks:[
        {t:"AAA with local login and local exec authorization",hint:"aaa new-model\naaa authentication login default local\naaa authorization exec default local",check:(w,D)=>D.R1.aaa&&/local/.test(D.R1.aaaLogin||"")},
        {t:"User netadmin with privilege 15 and a secret",hint:"username netadmin privilege 15 secret Str0ng!Pass",check:(w,D)=>D.R1.users.netadmin?.priv===15},
        {t:"Enable NETCONF",hint:"netconf-yang",check:(w,D)=>D.R1.extra.netconf},
        {t:"Enable the HTTPS server with local authentication, and RESTCONF",hint:"ip http secure-server\nip http authentication local\nrestconf",check:(w,D)=>D.R1.extra.restconf&&D.R1.extra.https},
        {t:"Check the yang-management processes",hint:"do show platform software yang-management process",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* plat\S* soft\S* yang/i)}],
      solution:"configure terminal\naaa new-model\naaa authentication login default local\naaa authorization exec default local\nusername netadmin privilege 15 secret Str0ng!Pass\nnetconf-yang\nip http secure-server\nip http authentication local\nrestconf\ndo show platform software yang-management process",
      success:"ncsshd answers NETCONF on port 830 and nginx answers RESTCONF on 443. A user below privilege 15 would get access denied."}},
    {id:"verbmatch",type:"match",title:"Match the operation to its protocol message",scenario:"Tap an operation, then tap the protocol message that performs it.",success:"NETCONF names its operations in XML; RESTCONF reuses HTTP methods.",items:[["Read running config with NETCONF","getcfg"],["Change config with NETCONF","edit"],["Read data with RESTCONF","get"],["Replace a resource with RESTCONF","put"],["Merge a change with RESTCONF","patch"],["Create a resource with RESTCONF","post"],["Remove a resource with RESTCONF","del"],["Apply staged candidate changes","commit"]],
      slots:[["getcfg","<get-config>","NETCONF"],["edit","<edit-config>","NETCONF"],["commit","<commit>","NETCONF"],["get","GET","RESTCONF"],["put","PUT","RESTCONF"],["patch","PATCH","RESTCONF"],["post","POST","RESTCONF"],["del","DELETE","RESTCONF"]]}
  ],
  badges:[
    ["reader","AS","Assurance Scholar","Mark all 6 assurance lessons studied",c=>c.allStudied()],
    ["lab","DX","Diagnostician","Complete every diagram in this module",c=>c.vizAll()],
    ["snmp","v3","authPriv","Pass the syslog and SNMPv3 lab",c=>c.passed("logsnmp")],
    ["fnf","FNF","Flow Master","Pass the Flexible NetFlow lab",c=>c.passed("fnflab")],
    ["span","SPN","Mirror Mirror","Pass the RSPAN lab and the SPAN mini lab",c=>c.passed("rspanlab")&&c.earned("viz:spanmini")],
    ["sla","SLA","Never Blackholed","Pass the IP SLA failover lab",c=>c.passed("slalab")],
    ["tool","DBG","Right Tool","Pass the diagnostic tool picker",c=>c.passed("debugpick")],
    ["yang","830","Model Driven","Pass the NETCONF/RESTCONF lab and the verb match",c=>c.passed("yanglab")&&c.passed("verbmatch")],
    ["perfect","AS","Fully Assured","Score 100% on an assurance quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
