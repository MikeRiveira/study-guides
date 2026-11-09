/* ================= Module 5: Network Troubleshooting (N10-009 Domain 5.0, 24%) ================= */
(function(){
const METHOD=["Identify the problem","Establish a theory of probable cause","Test the theory to determine the cause","Establish a plan of action and identify potential effects","Implement the solution or escalate as necessary","Verify full system functionality and implement preventive measures","Document findings, actions, outcomes and lessons learned"];

const LESSONS=[
{id:"method",num:"5.1",title:"The troubleshooting methodology",html:`
<p>CompTIA's seven steps appear on every Network+ exam, usually as "what should the technician do next?"</p>
<ol>
<li><b>Identify the problem</b>: gather information, question users, identify symptoms, determine if anything changed, duplicate the problem if possible, and approach multiple problems individually.</li>
<li><b>Establish a theory of probable cause</b>: question the obvious, and pick an approach: <b>top-to-bottom</b> or <b>bottom-to-top</b> through the OSI model, or <b>divide and conquer</b> (start in the middle).</li>
<li><b>Test the theory</b>. If it's confirmed, plan the fix. If not, establish a new theory or escalate.</li>
<li><b>Establish a plan of action</b> and identify potential effects.</li>
<li><b>Implement the solution</b> or escalate.</li>
<li><b>Verify full system functionality</b> and implement preventive measures.</li>
<li><b>Document</b> findings, actions, outcomes and lessons learned.</li>
</ol>
<div class="viz" id="viz-approach"></div>
<div class="tip"><b>Exam trap.</b> Don't jump to a fix before you've identified the problem and tested a theory. And documentation is always the last step, after verification.</div>`},
{id:"cabling",num:"5.2",title:"Cabling and physical layer issues",html:`
<ul>
<li><b>Incorrect cable</b>: multimode patch on a single-mode optic, Cat 5e where 10 Gbps needs Cat 6a, or UTP where shielded (STP) cable is needed near heavy electrical equipment.</li>
<li><b>Signal degradation</b>: <b>attenuation</b> (signal fades with distance; copper's limit is 100 m), <b>interference</b> (EMI from motors, fluorescent lights, power lines) and <b>crosstalk</b> (signal bleeding between pairs, often from untwisting too much wire at the termination).</li>
<li><b>Improper termination</b>: wrong pinout, split pairs, or wires not fully seated.</li>
<li><b>TX/RX transposed</b>: fiber strands swapped, so each side transmits into the other's transmitter. Swap the strands at one end.</li>
</ul>
<p>A <b>cable tester</b> checks wiremap and continuity. A <b>TDR</b> (time-domain reflectometer) finds the distance to a copper fault by timing a reflected pulse. An <b>OTDR</b> does the same for fiber, and a <b>visual fault locator</b> shines red laser light into a fiber so breaks glow.</p>
<div class="viz" id="viz-tdr"></div>`},
{id:"interface",num:"5.3",title:"Interface counters, port status and PoE",html:`
<h3>Interface counters</h3>
<p><code>show interface</code> exposes the symptoms of most Layer 1 and 2 problems. Watch for counters that are <b>increasing</b>, not just non-zero.</p>
<ul><li><b>CRC errors</b>: frames damaged in transit. Bad cable, EMI or a duplex mismatch.</li><li><b>Runts</b>: frames smaller than 64 bytes, usually from collisions. <b>Giants</b>: frames bigger than the MTU, often an MTU or jumbo frame mismatch.</li><li><b>Drops</b>: the interface discarded frames because buffers were full (congestion).</li><li><b>Late collisions</b>: the classic duplex mismatch sign.</li></ul>
<div class="viz" id="viz-counters"></div>
<h3>Port status</h3>
<ul><li><b>Administratively down</b>: someone ran <code>shutdown</code>. Fix with <code>no shutdown</code>.</li><li><b>Error disabled</b>: the switch shut the port itself, for example after a port security violation or BPDU guard trigger. Fix the cause, then bounce the port.</li><li><b>Suspended</b>: a link aggregation member that doesn't match the bundle's settings, so LACP won't use it.</li></ul>
<h3>Hardware: PoE and transceivers</h3>
<p>A PoE switch has a total <b>power budget</b>. When it's used up, new devices are denied power. A device that needs <b>802.3bt</b> won't fully power from an 802.3at switch: an <b>incorrect standard</b>. Transceivers must match each other (wavelength, fiber type, speed), and low <b>signal strength</b> (receive power in dBm) points to dirty connectors, bends or too much distance.</p>
<div class="viz" id="viz-poe"></div>`},
{id:"services",num:"5.4",title:"Network service and addressing issues",html:`
<h3>Switching issues</h3>
<ul><li><b>STP problems</b>: a <b>network loop</b> (broadcast storm, MAC table flapping, CPU spikes), the wrong <b>root bridge</b> selection, or unexpected port roles and states.</li>
<li><b>Incorrect VLAN assignment</b>: the port is in the wrong VLAN, so the device gets an address from the wrong subnet or none at all.</li>
<li><b>ACLs</b> blocking traffic that should be allowed.</li></ul>
<h3>Routing issues</h3>
<p>Missing routes in the routing table, or a wrong or missing <b>default route</b>, send traffic nowhere. Check with <code>show ip route</code> and <code>traceroute</code>.</p>
<h3>Addressing issues</h3>
<ul><li><b>Address pool exhaustion</b>: the DHCP scope is full, so new clients fall back to APIPA (169.254.x.x).</li>
<li><b>Incorrect default gateway</b>: local traffic works, but nothing off the subnet does.</li>
<li><b>Duplicate IP address</b>: intermittent connectivity for both devices, and "address conflict" warnings.</li>
<li><b>Incorrect subnet mask</b>: some local hosts look remote (or the reverse), so some connections work and others don't.</li></ul>
<div class="viz" id="viz-hostcfg"></div>`},
{id:"perf",num:"5.5",title:"Performance issues",html:`
<ul><li><b>Bandwidth</b> is the capacity of a link. <b>Throughput</b> is what you actually get, which is always lower because of overhead, congestion and errors.</li>
<li><b>Congestion / contention</b>: more traffic than a link or device can carry. A <b>bottleneck</b> is the slowest point in the path, which limits everything behind it.</li>
<li><b>Latency</b>: the delay for a packet to arrive (ms). <b>Jitter</b>: variation in that delay, which wrecks voice and video. <b>Packet loss</b>: packets that never arrive.</li></ul>
<div class="viz" id="viz-perf"></div>
<div class="tip"><b>Voice targets.</b> For good call quality, aim for one-way latency under 150 ms, jitter under 30 ms and packet loss under 1%. QoS helps when the problem is congestion.</div>`},
{id:"wireless",num:"5.6",title:"Wireless troubleshooting",html:`
<ul>
<li><b>Interference</b>: channel overlap with neighboring APs (co-channel or adjacent-channel), or non-Wi-Fi sources like microwaves and Bluetooth.</li>
<li><b>Signal degradation or loss</b>: distance, walls, metal shelving and water (including people) absorb signal.</li>
<li><b>Insufficient coverage</b>: dead zones between APs. A site survey finds them.</li>
<li><b>Client disassociation</b>: clients drop off, for example from weak signal, interference, or an attacker sending deauthentication frames.</li>
<li><b>Roaming misconfiguration</b>: APs with different SSIDs or security settings, or <b>sticky clients</b> that cling to a far AP instead of roaming to a closer one.</li>
</ul>
<p><b>RSSI</b> measures received signal strength in dBm (−30 is excellent, −67 is the usual minimum for voice, −80 is barely usable). <b>SNR</b> is signal minus the noise floor, and 25 dB or more is good.</p>
<div class="viz" id="viz-roam"></div>`},
{id:"tools",num:"5.7",title:"Troubleshooting tools and commands",html:`
<h3>Hardware tools</h3>
<ul><li><b>Toner and probe</b>: trace a cable to find its other end.</li><li><b>Cable tester</b>: verify wiremap, opens, shorts and split pairs.</li><li><b>Network tap</b>: copy traffic from a link to a monitor.</li><li><b>Wi-Fi analyzer</b>: see SSIDs, channels and signal strength.</li><li><b>Visual fault locator</b>: red laser to find fiber breaks and bad bends.</li></ul>
<h3>Software tools</h3>
<ul><li><b>Protocol analyzer</b> (Wireshark) and <b>tcpdump</b>: capture and decode packets.</li>
<li><b>ping</b>: is it reachable? <b>traceroute / tracert</b>: where along the path does it stop?</li>
<li><b>nslookup / dig</b>: test DNS. <b>ipconfig / ifconfig / ip</b>: show the host's own settings.</li>
<li><b>arp</b>: show the IP-to-MAC cache. <b>netstat</b>: show connections and listening ports.</li>
<li><b>nmap</b>: discover hosts and open ports. <b>LLDP / CDP</b>: discover directly connected neighbors (switch name and port). <b>Speed tester</b>: measure real throughput.</li></ul>
<h3>Network device commands</h3>
<p><code>show mac-address-table</code>, <code>show route</code>, <code>show interface</code>, <code>show config</code>, <code>show arp</code>, <code>show vlan</code> and <code>show power</code>.</p>
<div class="viz" id="viz-cli"></div>`}
];

const C=[
 ["Troubleshooting step 1","Identify the problem"],["Troubleshooting step 2","Establish a theory of probable cause"],["Troubleshooting step 3","Test the theory to determine the cause"],["Troubleshooting step 4","Establish a plan of action and identify potential effects"],["Troubleshooting step 5","Implement the solution or escalate"],["Troubleshooting step 6","Verify full functionality and implement preventive measures"],["Troubleshooting step 7","Document findings, actions, outcomes and lessons learned"],["Divide and conquer","Start troubleshooting in the middle of the OSI model"],["Bottom-to-top approach","Start at Layer 1 (cables) and work up"],
 ["Attenuation","Signal weakening over distance"],["Crosstalk","Signal bleeding between wire pairs"],["EMI fix","Reroute away from the source or use shielded cable"],["TX/RX transposed","Fiber strands swapped; swap them at one end"],["TDR","Finds the distance to a copper cable fault"],["OTDR","Finds the distance to a fiber fault"],["Visual fault locator","Red laser that shows fiber breaks"],
 ["CRC errors","Damaged frames: bad cable, EMI or duplex mismatch"],["Runts","Frames under 64 bytes"],["Giants","Frames over the MTU"],["Output drops","Buffers full: congestion"],["Late collisions","Duplex mismatch"],["Administratively down","Port was shut down by config"],["Error disabled","Switch shut the port after a violation"],["Suspended port","LACP member that doesn't match the bundle"],["PoE budget exceeded","New devices are denied power"],["Low receive power on fiber","Dirty connector, bend, or too long"],
 ["Broadcast storm symptoms","Flooding, MAC flapping, high CPU, network crawl"],["APIPA on new clients only","DHCP scope exhausted"],["Can reach local hosts but not remote","Wrong or missing default gateway"],["Intermittent connectivity and conflict warnings","Duplicate IP address"],["Some local hosts unreachable","Incorrect subnet mask"],["Wrong subnet address on a desk PC","Port assigned to the wrong VLAN"],
 ["Bandwidth vs throughput","Capacity vs what is actually delivered"],["Latency","Delay for a packet to arrive"],["Jitter","Variation in latency"],["Bottleneck","Slowest point in the path"],["VoIP targets","Latency < 150 ms, jitter < 30 ms, loss < 1%"],
 ["RSSI","Received signal strength in dBm"],["Good RSSI for voice","−67 dBm or stronger"],["SNR","Signal minus noise floor; ≥ 25 dB is good"],["Sticky client","Client that won't roam to a closer AP"],["Client disassociation causes","Weak signal, interference, deauth attacks"],["Roaming misconfiguration","Different SSIDs or security settings between APs"],
 ["ping","Tests reachability with ICMP echo"],["tracert / traceroute","Shows each hop along the path"],["nslookup / dig","Query DNS"],["arp -a","Shows the IP-to-MAC cache"],["netstat -an","Shows connections and listening ports"],["ipconfig /all","Windows IP settings, including DNS and DHCP"],["ip addr","Linux interface addresses"],["tcpdump","Command-line packet capture"],["nmap","Scans for hosts and open ports"],["LLDP / CDP","Discover neighbor device and port"],["show mac address-table","Which MAC is on which switch port"],["show vlan","VLANs and their ports"],["show power inline","PoE allocation per port"],["Toner and probe","Traces a cable to its far end"],["Wi-Fi analyzer","Shows SSIDs, channels and signal strength"]
];
const CARDS=C.map((c,i)=>({deck:i<9?"method":i<32?"issues":i<43?"perf":"tools",id:"c"+i,q:c[0],a:c[1]}));

const QUIZ=[
 {q:"A user reports that they can't reach a file share. What should the technician do first?",o:["Replace the NIC","Gather information and question the user","Reboot the file server","Document the solution"],a:1,e:"Step 1 is to identify the problem: gather information, question users and identify symptoms."},
 {q:"A technician's theory is confirmed: a bad patch cable. What is the next step?",o:["Document findings","Establish a plan of action","Verify full functionality","Question the user"],a:1,e:"After the theory is confirmed, establish a plan of action and identify potential effects."},
 {q:"The theory that a switch port is faulty proves wrong. What should the technician do?",o:["Replace the switch anyway","Establish a new theory or escalate","Document the results","Close the ticket"],a:1,e:"If the theory isn't confirmed, establish a new theory or escalate."},
 {q:"Which step comes immediately after implementing the solution?",o:["Document findings","Verify full system functionality and implement preventive measures","Establish a theory","Identify the problem"],a:1,e:"Verify it works and prevent recurrence, then document."},
 {q:"What is the final step of the troubleshooting methodology?",o:["Verify functionality","Document findings, actions, outcomes and lessons learned","Escalate","Implement the solution"],a:1,e:"Documentation is always the last step."},
 {q:"A technician starts troubleshooting by checking whether the cable is plugged in and the link light is on. Which approach is this?",o:["Top-to-bottom","Bottom-to-top","Divide and conquer","Escalation"],a:1,e:"Starting at the physical layer and working up is bottom-to-top."},
 {q:"A technician first tests whether the user can ping the server's IP, then moves up or down depending on the result. Which approach is this?",o:["Bottom-to-top","Top-to-bottom","Divide and conquer","Question the obvious"],a:2,e:"Starting at Layer 3 (the middle) is divide and conquer."},
 {q:"Three users report different problems at the same time. What does the methodology recommend?",o:["Fix the easiest first and assume the rest are related","Approach multiple problems individually","Escalate all of them","Reboot the core switch"],a:1,e:"Treat each problem separately to avoid wrong assumptions."},
 {q:"A cable run of 135 m between a switch and a PC has intermittent errors. What is the most likely cause?",o:["Crosstalk","Attenuation from exceeding 100 m","Duplex mismatch","Wrong VLAN"],a:1,e:"Copper Ethernet is limited to 100 m. Beyond that, the signal is too weak."},
 {q:"Cables running alongside an elevator motor show rising CRC errors. What is the best fix?",o:["Use a longer cable","Reroute the cable or use shielded cable","Change the VLAN","Enable jumbo frames"],a:1,e:"EMI from motors corrupts frames. Move the cable or use STP (shielded) cable."},
 {q:"A newly terminated cable has crosstalk failures on the tester. What is the most likely cause?",o:["Too much untwisting at the connector","Wrong VLAN","The cable is plenum-rated","Fiber strands reversed"],a:0,e:"Untwisting pairs too far at the termination increases crosstalk."},
 {q:"A new fiber link shows no light received on either switch. The optics and cable test fine. What should be tried?",o:["Swap the TX/RX strands at one end","Replace with Cat 6a","Disable STP","Change the native VLAN"],a:0,e:"Transposed TX/RX strands mean each side is transmitting into the other's transmitter."},
 {q:"A multimode patch cable is connected to a 10GBASE-LR optic. What is the problem?",o:["Wrong fiber type for the transceiver","TX/RX transposed","Duplex mismatch","PoE budget"],a:0,e:"LR optics are single-mode. Using multimode fiber causes high loss or no link."},
 {q:"Which tool finds the exact distance to a break in a copper cable?",o:["Toner","TDR","Wi-Fi analyzer","Loopback plug"],a:1,e:"A time-domain reflectometer times a reflected pulse to locate the fault."},
 {q:"Which tool makes a fiber break glow with visible red light?",o:["OTDR","Visual fault locator","Cable tester","Toner"],a:1,e:"A VFL injects red laser light that escapes at breaks and tight bends."},
 {q:"An interface shows a rising count of late collisions and CRC errors. What is the most likely cause?",o:["MTU mismatch","Duplex mismatch","VLAN mismatch","PoE budget exceeded"],a:1,e:"Late collisions are the classic sign of one side at half duplex and the other at full."},
 {q:"An interface on a storage network shows a growing number of giants. What is likely wrong?",o:["Duplex mismatch","MTU / jumbo frame mismatch","Bad DNS","Wrong gateway"],a:1,e:"Giants are frames larger than the configured MTU."},
 {q:"An uplink shows increasing output drops during business hours. What does this indicate?",o:["A bad cable","Congestion","A duplex mismatch","An STP loop"],a:1,e:"Output drops mean the interface couldn't queue frames fast enough: congestion."},
 {q:"A switch port shows \"administratively down.\" What is the fix?",o:["Replace the cable","Run no shutdown on the interface","Change the VLAN","Clear the MAC table"],a:1,e:"Administratively down means the port was disabled in config."},
 {q:"A port went into the err-disabled state after a user plugged in a small hub. What most likely triggered it?",o:["Port security violation","Duplex mismatch","DNS failure","A long cable"],a:0,e:"A hub adds extra MACs, which can trigger port security and err-disable the port."},
 {q:"One member of a four-port LACP bundle shows \"suspended.\" What is the most likely cause?",o:["Its speed or duplex doesn't match the others","PoE budget","A DNS issue","An expired DHCP lease"],a:0,e:"Bundle members must have identical settings or LACP suspends them."},
 {q:"Newly installed APs don't power on, but older APs on the same switch work. show power inline shows them as denied. What is the cause?",o:["Wrong VLAN","PoE budget exhausted","Duplex mismatch","DNS failure"],a:1,e:"The switch has used up its total PoE budget, so it denies power to new devices."},
 {q:"A PTZ camera requires 60 W, but the switch supports only 802.3at. What happens?",o:["It works normally","It won't get enough power: incorrect PoE standard","It gets 100 W","It uses DHCP to request power"],a:1,e:"802.3at supplies up to 30 W. 60 W needs 802.3bt."},
 {q:"A fiber transceiver shows receive power far below its rated sensitivity. What should be checked first?",o:["The DNS server","Dirty or damaged connectors","The VLAN","The NTP server"],a:1,e:"Dirty connectors are the most common cause of low light levels. Clean and inspect them."},
 {q:"The network slows to a crawl, switch CPUs spike and MAC addresses flap between ports. What is happening?",o:["DHCP exhaustion","A switching loop / broadcast storm","DNS poisoning","A duplex mismatch"],a:1,e:"Loops cause broadcast storms and MAC flapping. Check STP."},
 {q:"New laptops in a conference room get 169.254.x.x addresses, but existing devices work. What is the most likely cause?",o:["DNS server down","DHCP scope exhausted","Wrong subnet mask","STP loop"],a:1,e:"Existing devices keep their leases. New ones can't get one because the pool is full."},
 {q:"A PC can ping hosts on its own subnet but nothing beyond it. ipconfig shows gateway 192.168.1.254, but the router is 192.168.1.1. What is the issue?",o:["Wrong subnet mask","Incorrect default gateway","Duplicate IP","DNS failure"],a:1,e:"Off-subnet traffic goes to the gateway. A wrong gateway breaks only remote traffic."},
 {q:"Two PCs lose connectivity intermittently and Windows shows an address conflict. What is the cause?",o:["Wrong gateway","Duplicate IP address","Bad DNS","Port security"],a:1,e:"Two devices with the same IP fight over ARP entries, causing intermittent drops."},
 {q:"A host with 10.1.1.70/26 can't reach 10.1.1.20 on the same physical LAN, but can reach other hosts. What is most likely wrong?",o:["The DNS server","The subnet mask","The NIC driver","The patch cable"],a:1,e:"With /26, .70 is in .64–.127 and .20 looks remote. The LAN is really a /24, so the mask is wrong."},
 {q:"A desk PC gets an address in the guest subnet instead of the staff subnet. What should be checked?",o:["The VLAN assignment on its switch port","The DNS server","The NTP server","The patch panel labels only"],a:0,e:"The access port is likely in the guest VLAN."},
 {q:"Users can reach a server by IP but a new firewall rule broke their access to it by name. Which should be checked first?",o:["ACL rules for DNS (port 53) to the resolver","The PoE budget","STP root","Jumbo frames"],a:0,e:"Name resolution needs DNS traffic allowed. An ACL blocking port 53 breaks names but not IPs."},
 {q:"Branch users can't reach the internet, and show ip route on the branch router has no 0.0.0.0/0 entry. What is missing?",o:["A VLAN","A default route","A DHCP reservation","An SVI"],a:1,e:"Without a default route, traffic to unknown destinations is dropped."},
 {q:"A link is rated at 1 Gbps but file transfers top out at 600 Mbps. What term describes the 600 Mbps?",o:["Bandwidth","Throughput","Latency","Jitter"],a:1,e:"Throughput is the actual delivered rate, lower than the bandwidth (capacity)."},
 {q:"VoIP calls sound choppy, with words arriving out of rhythm. Ping times vary between 20 ms and 180 ms. What is the issue?",o:["High jitter","Low bandwidth only","DNS failure","Duplex mismatch"],a:0,e:"Large variation in delay is jitter, which disrupts real-time audio."},
 {q:"Every user at a branch is slow, and the 50 Mbps WAN link is at 100% while the LAN is lightly used. What is this?",o:["A bottleneck at the WAN link","A duplex mismatch","DNS failure","A loop"],a:0,e:"The WAN link is the slowest point in the path, limiting everyone."},
 {q:"Which measure would most improve voice quality on a congested link?",o:["QoS prioritizing voice","Jumbo frames","Disabling STP","A longer DHCP lease"],a:0,e:"QoS gives voice priority so it isn't queued behind bulk data."},
 {q:"Users at the far end of a warehouse lose Wi-Fi among the metal shelving. What is the most likely cause?",o:["Signal degradation and insufficient coverage","DHCP exhaustion","A routing loop","Wrong DNS"],a:0,e:"Metal absorbs and reflects RF, creating dead zones. Add or move APs."},
 {q:"A laptop stays connected to a distant AP with poor signal even though another AP is much closer. What is this?",o:["An evil twin","A sticky client / roaming issue","Channel bonding","DFS"],a:1,e:"Sticky clients don't roam. Adjusting roaming thresholds or minimum RSSI on APs helps."},
 {q:"Users lose Wi-Fi every time they walk between two buildings. The APs in each building use different SSIDs. What is the issue?",o:["Roaming misconfiguration","Duplex mismatch","DHCP exhaustion","Jitter"],a:0,e:"Seamless roaming needs the same SSID and security settings on all APs."},
 {q:"Wi-Fi drops in the break room every day around lunch. What is a likely cause?",o:["Microwave oven interference on 2.4 GHz","DNS poisoning","PoE budget","STP"],a:0,e:"Microwaves emit near 2.4 GHz and interfere with Wi-Fi."},
 {q:"Which RSSI value indicates the strongest signal?",o:["−85 dBm","−72 dBm","−60 dBm","−45 dBm"],a:3,e:"Values closer to zero are stronger. −45 dBm is excellent."},
 {q:"The noise floor is −92 dBm and the signal is −70 dBm. What is the SNR?",o:["22 dB","70 dB","92 dB","162 dB"],a:0,e:"SNR = signal − noise = −70 − (−92) = 22 dB, which is a bit low."},
 {q:"Which command shows each hop between a Windows PC and a remote server?",o:["ping","tracert","arp -a","netstat"],a:1,e:"tracert lists the routers along the path and the delay to each."},
 {q:"Which command shows a Windows PC's DNS servers, DHCP status and MAC address?",o:["ipconfig /all","netstat -an","nslookup","arp -a"],a:0,e:"ipconfig /all shows the full adapter configuration."},
 {q:"Which command shows which ports a server is listening on?",o:["netstat -an","tracert","nslookup","arp -a"],a:0,e:"netstat lists active connections and listening ports."},
 {q:"Which command shows the IP-to-MAC mappings a PC has learned?",o:["arp -a","ipconfig","show vlan","dig"],a:0,e:"arp -a displays the ARP cache."},
 {q:"Which Linux tool queries DNS with detailed output?",o:["dig","ip","tcpdump","nmap"],a:0,e:"dig (and nslookup) query DNS servers directly."},
 {q:"A technician needs to find all hosts on a subnet and the services they expose. Which tool?",o:["nmap","ping only","arp -a","Toner"],a:0,e:"nmap discovers hosts and scans for open ports and service versions."},
 {q:"A technician needs to know which switch and port a wall jack connects to without tracing the cable. What helps?",o:["LLDP/CDP neighbor information","A speed test","DNS","NTP"],a:0,e:"LLDP/CDP on the connected device (or a handheld tester) reports the switch name and port."},
 {q:"Which switch command shows which MAC address is learned on each port?",o:["show mac address-table","show vlan","show ip route","show power inline"],a:0,e:"The MAC address table maps MACs to ports and VLANs."},
 {q:"Which command shows a switch's VLANs and which ports belong to each?",o:["show vlan","show arp","show route","show config"],a:0,e:"show vlan (brief) lists VLANs and their access ports."},
 {q:"Which tool captures and decodes packets on a Linux server's command line?",o:["tcpdump","nslookup","ipconfig","toner"],a:0,e:"tcpdump captures packets. Wireshark is the graphical equivalent."},
 {q:"Which tool finds which patch panel port an unlabeled cable from an office connects to?",o:["Toner and probe","Wi-Fi analyzer","Speed tester","nmap"],a:0,e:"Put the toner on the office end and use the probe at the panel."},
 {q:"Which tool measures actual internet throughput to verify an ISP's promised speed?",o:["Speed tester","Cable tester","arp","LLDP"],a:0,e:"A speed test measures real throughput."},
 {q:"A ping to a server succeeds, but the web page won't load. Which OSI layers are confirmed working?",o:["Layers 1–3","Only Layer 7","Layers 4–7","None"],a:0,e:"ping proves physical, data link and network connectivity. Check the transport and application layers next."}
];

registerModule({
  id:"ts",slug:"troubleshooting",title:"Network Troubleshooting",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:[["method","Methodology"],["issues","Issues"],["perf","Performance and wireless"],["tools","Tools"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["approach","tdr","counters","poe","hostcfg","perf","roam","cli"],
  viz(){

/* ---- OSI approaches ---- */
(function(){
  const el=$("#viz-approach");
  const L=["7 Application","6 Presentation","5 Session","4 Transport","3 Network","2 Data link","1 Physical"];
  const AP={bt:{n:"Bottom-to-top",o:[6,5,4,3,2,1,0],t:"Start with cables and link lights and work up. Thorough, and good when you suspect hardware, but slow if the problem is an app setting."},
    td:{n:"Top-to-bottom",o:[0,1,2,3,4,5,6],t:"Start with the application and work down. Good when one app fails but others work."},
    dc:{n:"Divide and conquer",o:[4,3,5,2,6,1,0],t:"Start in the middle, often with a ping (Layer 3). If it works, Layers 1–3 are fine and you go up. If not, go down. Fastest on average."}};
  let k=null,i=0,tm=null;const seen=new Set();
  el.innerHTML=`<div class="viz-title">Three ways to walk the OSI model</div><div class="chips">${Object.entries(AP).map(([key,a])=>`<button class="chip" data-k="${key}">${a.n}</button>`).join("")}</div><div class="ap-stack">${L.map((l,j)=>`<div class="ap-l" data-j="${j}"><span>${l}</span><em></em></div>`).join("")}</div><div class="caption" aria-live="polite">Pick an approach.</div>`;
  function run(){clearTimeout(tm);el.querySelectorAll(".ap-l").forEach(x=>{x.className="ap-l";$("em",x).textContent=""});i=0;const a=AP[k];
    const step=()=>{if(!el.isConnected)return;const j=a.o[i];const row=el.querySelector(`[data-j="${j}"]`);row.classList.add("on");$("em",row).textContent="#"+(i+1);i++;if(i<a.o.length)tm=setTimeout(step,REDUCED?0:380)};step();
    $(".caption",el).innerHTML=`<b>${a.n}.</b> ${a.t}`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;k=b.dataset.k;seen.add(k);el.querySelectorAll("[data-k]").forEach(x=>x.setAttribute("aria-pressed",x===b));run();if(seen.size===3)award("viz:approach",20,"Compared troubleshooting approaches")});
})();

/* ---- TDR trace ---- */
(function(){
  const el=$("#viz-tdr");
  const F={ok:["Good cable",null,"End of the cable at 62 m with a small, normal reflection. The cable passes."],open:["Open (cut)",37,"A large positive reflection at 37 m: the conductor is broken there. That's about where the cable passes over the ceiling tile by the stairwell."],short:["Short",52,"A large negative (inverted) reflection at 52 m: two conductors are touching, often from a crushed cable or a staple."],long:["Too long",118,"The end of the cable is at 118 m, past the 100 m limit. Expect attenuation errors. Add a switch closer to the user."],split:["Split pair",null,"The TDR length looks fine, but the wiremap shows a split pair: wires from two different pairs were swapped. It passes continuity but fails crosstalk (NEXT) tests."]};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Read a TDR trace</div><div class="chips">${Object.entries(F).map(([k,f])=>`<button class="chip" data-k="${k}">${f[0]}</button>`).join("")}</div><div class="viz-scroll"><svg viewBox="0 0 620 200" style="min-width:420px" role="img" aria-label="TDR trace"></svg></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el),X=m=>40+m*4.2,Y0=100;
  function draw(k){const f=F[k];const end=k==="long"?118:k==="open"||k==="short"?f[1]:62;let pts=[[X(0),Y0-50],[X(1),Y0]];
    for(let m=2;m<end;m+=2)pts.push([X(m),Y0+Math.sin(m*1.7)*2]);
    const amp=k==="short"?60:k==="open"?-60:-22;pts.push([X(end)-4,Y0],[X(end),Y0+amp],[X(end)+5,Y0],[X(Math.min(end+12,135)),Y0]);
    svg.innerHTML=`<line x1="40" y1="${Y0}" x2="610" y2="${Y0}" class="ch-axis"/>${[0,25,50,75,100,125].map(m=>`<line x1="${X(m)}" y1="${Y0+70}" x2="${X(m)}" y2="${Y0+76}" class="ch-axis"/><text x="${X(m)}" y="${Y0+92}" text-anchor="middle" class="s-small">${m} m</text>`).join("")}
      <line x1="${X(100)}" y1="20" x2="${X(100)}" y2="${Y0+70}" class="tdr-lim"/><text x="${X(100)+4}" y="30" class="s-small">100 m limit</text>
      <polyline class="tdr-tr${k==="ok"||k==="split"?"":" bad"}" points="${pts.map(p=>p.join(",")).join(" ")}"/>`;
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));$(".caption",el).innerHTML=`<b>${f[0]}.</b> ${f[2]}`}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;seen.add(b.dataset.k);draw(b.dataset.k);if(seen.size===5)award("viz:tdr",20,"Read every TDR trace")});draw("ok");
})();

/* ---- Interface counters ---- */
(function(){
  const el=$("#viz-counters");
  const SC={
   dup:["Duplex mismatch",{dup:"Half-duplex, 100Mb/s",crc:"1,842",late:"912",runts:"220"},"Half duplex here while the far end is full. Late collisions and CRC errors climb whenever traffic is heavy. Set both ends to auto, or both to the same fixed speed and duplex."],
   emi:["Bad cable / EMI",{crc:"23,560",inerr:"23,611"},"CRC and input errors are high while collisions are zero, so this isn't duplex. The frames are being corrupted on the wire: replace the cable, check terminations, or reroute away from interference."],
   mtu:["MTU mismatch",{giants:"48,203",mtu:"MTU 1500 bytes"},"Giants are frames larger than this port's 1,500-byte MTU. The server is sending 9,000-byte jumbo frames. Enable jumbo frames along the whole path, or set the server back to 1,500."],
   cong:["Congestion",{drops:"118,442",load:"txload 255/255"},"Output drops while the transmit load is pegged at 255/255 (100%). Nothing is broken: the link is full. Add bandwidth, use link aggregation, or apply QoS."]};
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Diagnose from show interface</div><div class="chips">${Object.entries(SC).map(([k,s])=>`<button class="chip" data-k="${k}">${s[0]}</button>`).join("")}</div><pre class="term ct"></pre><div class="caption" aria-live="polite"></div>`;
  function draw(k){const v=SC[k]?SC[k][1]:{};const h=(key,def)=>v[key]?`<span class="t-bad">${v[key]}</span>`:def;
    $(".ct",el).innerHTML=`<span class="t-c">SW1# show interface gi1/0/7</span>
GigabitEthernet1/0/7 is up, line protocol is up
  ${h("mtu","MTU 1500 bytes")}, BW 1000000 Kbit/sec
  reliability 255/255, ${h("load","txload 12/255")}, rxload 9/255
  ${h("dup","Full-duplex, 1000Mb/s")}, media type is 10/100/1000BaseTX
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: ${h("drops","0")}
     4,812,201 packets input, 3,991,022,104 bytes
     Received 21,004 broadcasts, ${h("runts","0")} runts, ${h("giants","0")} giants
     ${h("inerr","0")} input errors, ${h("crc","0")} CRC, 0 frame, 0 overrun
     3,702,551 packets output, 2,118,930,442 bytes
     0 output errors, 0 collisions, ${h("late","0")} late collision`;
    el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k));
    $(".caption",el).innerHTML=SC[k]?`<b>${SC[k][0]}.</b> ${SC[k][2]}`:"A healthy port: zero errors. Pick a scenario to see what changes."}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;seen.add(b.dataset.k);draw(b.dataset.k);if(seen.size===4)award("viz:counters",30,"Diagnosed four interface problems")});draw();
})();

/* ---- PoE budget ---- */
(function(){
  const el=$("#viz-poe");const BUD=370;
  const T=[["IP phone","af",7],["Camera","af",13],["Wi-Fi 6 AP","at",25.5],["Wi-Fi 7 AP","bt",45],["PTZ camera","bt",60]];
  let ports=[];let sawDeny=false;
  el.innerHTML=`<div class="viz-title">Plug devices into a 24-port 802.3at switch (370 W budget)</div><div class="chips">${T.map((t,i)=>`<button class="chip" data-t="${i}">+ ${t[0]} (${t[2]} W)</button>`).join("")}<button class="chip" data-t="c">Unplug all</button></div>
  <div class="pw"><div class="pw-bar"><i></i></div><div class="pw-t mono"></div></div><div class="poe-ports"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){let used=0;const st=ports.map(p=>{const t=T[p],need=t[1]==="bt"?30:t[2];if(used+need>BUD)return {t,s:"deny",w:0};used+=need;return {t,s:t[1]==="bt"?"low":"ok",w:need}});
    $(".pw-bar i",el).style.width=Math.min(used/BUD*100,100)+"%";$(".pw-bar i",el).className=used>BUD*.9?"warn":"";
    $(".pw-t",el).textContent=`${used.toFixed(1)} W of ${BUD} W allocated`;
    $(".poe-ports",el).innerHTML=Array.from({length:24},(_,i)=>{const x=st[i];return `<div class="pp ${x?x.s:""}" title="${x?x.t[0]:"empty"}"><span>${i+1}</span>${x?`<em>${x.s==="deny"?"denied":x.s==="low"?"30 W only":x.w+" W"}</em>`:""}</div>`}).join("");
    const d=st.filter(x=>x.s==="deny").length,l=st.filter(x=>x.s==="low").length;if(d)sawDeny=true;
    $(".caption",el).innerHTML=(d?`<span class="status-bad">${d} device${d>1?"s":""} denied power</span>: the budget is spent. `:"")+(l?`<span class="status-bad">${l} 802.3bt device${l>1?"s":""} underpowered</span>: this switch tops out at 30 W per port (incorrect PoE standard). `:"")+(!d&&!l?"Add devices and watch the budget.":"Fixes: a switch with a bigger budget or 802.3bt support, a second PoE switch, or PoE injectors.");
    if(sawDeny&&l)award("viz:poe",20,"Hit both PoE limits")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;if(b.dataset.t==="c")ports=[];else if(ports.length<24)ports.push(+b.dataset.t);draw()});draw();
})();

/* ---- Host configuration checker ---- */
(function(){
  const el=$("#viz-hostcfg");
  const OK={ip:"192.168.20.77",mask:"255.255.255.0",gw:"192.168.20.1",dns:"192.168.20.53"};
  const PRE={gw:{...OK,gw:"192.168.20.254"},mask:{...OK,mask:"255.255.255.192"},dup:{...OK,ip:"192.168.20.45"},apipa:{ip:"169.254.31.9",mask:"255.255.0.0",gw:"",dns:""},dns:{...OK,dns:"192.168.20.99"}};
  let H={...PRE.gw},fixed=new Set(),cur="gw";
  const t=s=>{const p=s.trim().split(".").map(Number);return p.length===4&&p.every(x=>Number.isInteger(x)&&x>=0&&x<=255)?((p[0]*16777216)+(p[1]<<16)+(p[2]<<8)+p[3])>>>0:null};
  const same=(a,b,m)=>((a&m)>>>0)===((b&m)>>>0);
  function tests(){const ip=t(H.ip),m=t(H.mask),gw=t(H.gw),dns=t(H.dns);const LAN=t("192.168.20.0"),LM=t("255.255.255.0"),RG=t("192.168.20.1");
    if(ip===null||m===null)return [["Valid settings",false,"The IP address or mask isn't valid."]];
    const phys=same(ip,LAN,LM),dup=H.ip.trim()==="192.168.20.45";
    const reach=dst=>{if(!phys||dup)return false;if(same(ip,dst,m))return same(dst,LAN,LM);return gw!==null&&same(ip,gw,m)&&gw===RG};
    const r=[["Ping a local PC (192.168.20.10)",reach(t("192.168.20.10"))],["Ping the gateway (192.168.20.1)",reach(RG)],["Ping a remote server (8.8.8.8)",reach(t("8.8.8.8"))],["Resolve www.comptia.org",dns!==null&&dns===t("192.168.20.53")&&reach(dns)&&reach(t("8.8.8.8"))]];
    return r.map(x=>[x[0],x[1]]).concat(dup?[["Duplicate address",false,"Windows reports an IP address conflict with 192.168.20.45 (a printer)."]]:[])}
  el.innerHTML=`<div class="viz-title">Fix the broken host settings</div><div class="chips">${[["gw","Wrong gateway"],["mask","Wrong mask"],["dup","Duplicate IP"],["apipa","APIPA"],["dns","Wrong DNS"]].map(([k,l])=>`<button class="chip" data-p="${k}">${l}</button>`).join("")}</div>
  <p class="s-note">The LAN is 192.168.20.0/24. The router is .1, the DNS server is .53, and a printer already uses .45.</p>
  <div class="hc">${[["ip","IP address"],["mask","Subnet mask"],["gw","Default gateway"],["dns","DNS server"]].map(([k,l])=>`<label class="rf"><span>${l}</span><input data-f="${k}" autocomplete="off" spellcheck="false" inputmode="decimal"></label>`).join("")}</div>
  <div class="hc-t"></div><div class="caption" aria-live="polite"></div>`;
  function fill(){el.querySelectorAll("[data-f]").forEach(i=>i.value=H[i.dataset.f]);el.querySelectorAll("[data-p]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.p===cur))}
  function draw(){const r=tests();$(".hc-t",el).innerHTML=r.map(x=>`<div class="hc-r ${x[1]?"ok":"no"}"><b>${x[1]?"✓":"✗"}</b><span>${x[0]}</span>${x[2]?`<em>${x[2]}</em>`:""}</div>`).join("");
    const all=r.every(x=>x[1]);if(all&&cur){fixed.add(cur)}
    $(".caption",el).innerHTML=all?`<span class="status-good">Everything works.</span> ${fixed.size<5?`Fixed ${fixed.size} of 5 scenarios. Pick another.`:"You fixed all five classic addressing faults."}`:"Edit the settings until all four tests pass. Read which tests fail: that pattern points to the cause.";
    if(fixed.size===5)award("viz:hostcfg",30,"Fixed five addressing faults")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;cur=b.dataset.p;H={...PRE[cur]};fill();draw()});
  el.addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;H[f]=e.target.value;draw()});
  fill();draw();
})();

/* ---- Latency, jitter, loss ---- */
(function(){
  const el=$("#viz-perf");let lat=40,jit=5,loss=0,anim=null,t0=null;const moved=new Set();
  el.innerHTML=`<div class="viz-title">Make a VoIP call sound bad, then fix it</div><div class="viz-scroll"><svg viewBox="0 0 620 120" style="min-width:420px" role="img" aria-label="Packet stream"></svg></div>
  ${[["lat","Latency",0,400,"ms"],["jit","Jitter",0,100,"ms"],["loss","Packet loss",0,10,"%"]].map(([k,l,a,b,u])=>`<label class="rf"><span>${l} <b class="mono pf-${k}"></b></span><input type="range" data-k="${k}" min="${a}" max="${b}" value="${k==="lat"?40:k==="jit"?5:0}" step="${k==="loss"?0.5:1}"></label>`).join("")}
  <div class="pf-q"></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el);
  const PK=Array.from({length:14},(_,i)=>({i,r:Math.random(),d:Math.random()}));
  function quality(){const s=(lat>150?1:0)+(jit>30?1:0)+(loss>1?1:0);return s===0?["Excellent","ok"]:s===1?["Choppy","warn"]:["Unusable","bad"]}
  function frame(ts){t0??=ts;const T=(ts-t0)/1000;let s=`<rect x="10" y="40" width="70" height="40" rx="8" class="s-node"/><text x="45" y="65" text-anchor="middle" class="s-b" style="font-size:12px">Caller</text><rect x="540" y="40" width="70" height="40" rx="8" class="s-node"/><text x="575" y="65" text-anchor="middle" class="s-b" style="font-size:12px">Callee</text><line x1="80" y1="60" x2="540" y2="60" class="m-link"/>`;
    const travel=0.6+lat/200;PK.forEach(p=>{const start=p.i*0.2;let ph=((T-start)%2.8+2.8)%2.8;const delay=travel+(p.d-.5)*jit/40;const f=ph/delay;if(f>1||f<0)return;const lost=p.r<loss/100*3;const x=80+f*460;
      if(lost&&f>.55)return;s+=`<rect x="${x-7}" y="53" width="14" height="14" rx="3" class="pf-p${lost?" lost":""}"/>`});
    svg.innerHTML=s;if(el.isConnected&&!REDUCED)anim=requestAnimationFrame(frame)}
  function draw(){$(".pf-lat",el).textContent=lat+" ms";$(".pf-jit",el).textContent=jit+" ms";$(".pf-loss",el).textContent=loss+"%";
    const [q,c]=quality();$(".pf-q",el).innerHTML=`<span class="pf-badge ${c}">Call quality: ${q}</span>`;
    const why=[];if(lat>150)why.push("latency over 150 ms causes awkward pauses and people talking over each other");if(jit>30)why.push("jitter over 30 ms makes audio choppy because packets arrive unevenly");if(loss>1)why.push("loss over 1% drops syllables");
    $(".caption",el).innerHTML=why.length?`<span class="status-bad">Problem:</span> ${why.join("; ")}.`:"All within voice targets. Drag the sliders past them to hear what each problem does to a call.";
    if(moved.size===3&&!why.length)award("viz:perf",20,"Tuned a call back to good quality")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;const v=+e.target.value;if(k==="lat")lat=v;if(k==="jit")jit=v;if(k==="loss")loss=v;if((k==="lat"&&v>150)||(k==="jit"&&v>30)||(k==="loss"&&v>1))moved.add(k);draw()});
  draw();if(REDUCED)frame(0);else anim=requestAnimationFrame(frame);
})();

/* ---- Roaming and RSSI ---- */
(function(){
  const el=$("#viz-roam");let pos=10,thr=-80,ap=0,roamed=false;
  const rssi=(d)=>Math.round(-32-20*Math.log10(1+Math.abs(d)/2.2));
  el.innerHTML=`<div class="viz-title">Walk a laptop between two APs</div><div class="viz-scroll"><svg viewBox="0 0 620 150" style="min-width:420px" role="img" aria-label="Roaming diagram"></svg></div>
  <label class="rf"><span>Laptop position</span><input type="range" data-k="pos" min="0" max="100" value="10"></label>
  <label class="rf"><span>Roam when RSSI drops below <b class="mono rm-t"></b></span><input type="range" data-k="thr" min="-85" max="-60" value="-80"></label>
  <div class="sn-grid rm-g"></div><div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el),X=p=>72+p*4.76;
  function draw(){const d0=pos-0,d1=100-pos;const r0=rssi(d0),r1=rssi(d1);
    const cur=ap===0?r0:r1,oth=ap===0?r1:r0;if(cur<thr&&oth>cur+5){ap=1-ap;if(ap===1)roamed=true}
    const r=ap===0?r0:r1,snr=r+95;
    svg.innerHTML=`<circle cx="${X(0)}" cy="75" r="${ap===0?70:50}" class="ap-cov c1"/><circle cx="${X(100)}" cy="75" r="${ap===1?70:50}" class="ap-cov c6"/>
      <g class="m-node${ap===0?" on":""}"><rect x="${X(0)-34}" y="57" width="68" height="36" rx="9"/><text x="${X(0)}" y="80" text-anchor="middle" class="s-b" style="font-size:12px">AP-1</text></g>
      <g class="m-node${ap===1?" on":""}"><rect x="${X(100)-34}" y="57" width="68" height="36" rx="9"/><text x="${X(100)}" y="80" text-anchor="middle" class="s-b" style="font-size:12px">AP-2</text></g>
      <line x1="${X(pos)}" y1="110" x2="${X(ap===0?0:100)}" y2="75" class="m-link on"/><rect x="${X(pos)-22}" y="104" width="44" height="26" rx="5" class="rm-lap"/><text x="${X(pos)}" y="122" text-anchor="middle" class="s-b" style="font-size:11px">💻</text>`;
    $(".rm-t",el).textContent=thr+" dBm";
    $(".rm-g",el).innerHTML=[["Connected to","AP-"+(ap+1)],["RSSI",r+" dBm"],["SNR",snr+" dB"],["Closer AP",r0>=r1?"AP-1":"AP-2"]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
    const sticky=(ap===0&&r1>r0+8)||(ap===1&&r0>r1+8);
    $(".caption",el).innerHTML=r>=-67?`<span class="status-good">Strong enough for voice</span> (−67 dBm or better).`:sticky?`<span class="status-bad">Sticky client.</span> It's hanging on to a weak AP at ${r} dBm while the other AP is much stronger. Raise the roaming threshold (toward −70) so it moves sooner.`:`<span class="status-bad">Weak signal</span> at ${r} dBm. Expect slow speeds and drops.`;
    if(roamed&&thr>=-72&&pos>=80)award("viz:roam",20,"Tuned roaming for voice")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(k==="pos")pos=+e.target.value;if(k==="thr")thr=+e.target.value;draw()});draw();
})();

/* ---- CLI simulator ---- */
(function(){
  const el=$("#viz-cli");
  const O={
   win:{p:"C:\\> ",c:{"ipconfig /all":`Ethernet adapter Ethernet:
   Physical Address. . . . . . . . . : 3C-52-82-1A-77-4B
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 10.10.10.57(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Monday 08:02:11
   Default Gateway . . . . . . . . . : 10.10.10.1
   DHCP Server . . . . . . . . . . . : 10.10.0.5
   DNS Servers . . . . . . . . . . . : 10.10.0.53`,
    "ping 10.10.10.1":`Pinging 10.10.10.1 with 32 bytes of data:
Reply from 10.10.10.1: bytes=32 time<1ms TTL=255
Reply from 10.10.10.1: bytes=32 time<1ms TTL=255
Reply from 10.10.10.1: bytes=32 time=1ms TTL=255
Reply from 10.10.10.1: bytes=32 time<1ms TTL=255
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
    "tracert 8.8.8.8":`Tracing route to dns.google [8.8.8.8] over a maximum of 30 hops:
  1    <1 ms    <1 ms    <1 ms  10.10.10.1
  2     2 ms     1 ms     2 ms  10.255.0.1
  3     9 ms     8 ms     9 ms  203.0.113.1
  4     *        *        *     Request timed out.
  5    14 ms    13 ms    14 ms  8.8.8.8
Trace complete.`,
    "nslookup intranet.corp.local":`Server:  dns1.corp.local
Address:  10.10.0.53

Name:    intranet.corp.local
Address:  10.10.0.40`,
    "arp -a":`Interface: 10.10.10.57 --- 0x7
  Internet Address      Physical Address      Type
  10.10.10.1            00-1a-2b-00-00-01     dynamic
  10.10.10.12           3c-52-82-4f-11-20     dynamic
  10.10.10.255          ff-ff-ff-ff-ff-ff     static`,
    "netstat -an":`  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING
  TCP    10.10.10.57:50112      10.10.0.40:443         ESTABLISHED
  TCP    10.10.10.57:50118      10.10.0.20:22          TIME_WAIT`}},
   lin:{p:"$ ",c:{"ip addr show eth0":`2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    link/ether 52:54:00:9a:3f:12 brd ff:ff:ff:ff:ff:ff
    inet 10.10.20.31/24 brd 10.10.20.255 scope global eth0
    inet6 fe80::5054:ff:fe9a:3f12/64 scope link`,
    "dig www.example.com":`;; QUESTION SECTION:
;www.example.com.        IN  A
;; ANSWER SECTION:
www.example.com.  3600  IN  A  93.184.216.34
;; Query time: 18 msec
;; SERVER: 10.10.0.53#53(10.10.0.53)`,
    "traceroute 10.20.0.9":`traceroute to 10.20.0.9, 30 hops max
 1  10.10.20.1  0.412 ms
 2  10.255.0.6  1.208 ms
 3  * * *
 4  * * *
 5  * * *    <- the path stops after hop 2: check routing or an ACL there`,
    "tcpdump -i eth0 -c 3 port 53":`10:41:07.112 IP 10.10.20.31.51432 > 10.10.0.53.53: A? www.example.com
10:41:07.130 IP 10.10.0.53.53 > 10.10.20.31.51432: A 93.184.216.34
3 packets captured`,
    "nmap -sV 10.10.20.0/24":`Nmap scan report for 10.10.20.10
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 9.3
443/tcp  open  https    nginx 1.24
Nmap scan report for 10.10.20.45
PORT     STATE SERVICE
23/tcp   open  telnet   <- why is Telnet open on the printer?
Nmap done: 256 IP addresses (14 hosts up)`}},
   sw:{p:"SW1# ",c:{"show vlan brief":`VLAN Name        Status    Ports
1    default     active    Gi1/0/23
10   STAFF       active    Gi1/0/1, Gi1/0/2, Gi1/0/3
20   VOICE       active    Gi1/0/3
30   GUEST       active    Gi1/0/4, Gi1/0/7   <- desk PC on 7 is in GUEST
99   MGMT        active`,
    "show mac address-table":`Vlan  Mac Address       Type     Ports
  10  3c52.821a.774b    DYNAMIC  Gi1/0/1
  10  3c52.824f.1120    DYNAMIC  Gi1/0/2
  30  a483.e75d.209c    DYNAMIC  Gi1/0/7
  99  001a.2b00.0001    STATIC   CPU`,
    "show ip route":`Gateway of last resort is 10.255.0.1 to network 0.0.0.0
S*   0.0.0.0/0 [1/0] via 10.255.0.1
C    10.10.10.0/24 is directly connected, Vlan10
O    10.20.0.0/16 [110/20] via 10.255.0.6, Gi1/0/24`,
    "show interface status":`Port      Name     Status       Vlan  Duplex  Speed
Gi1/0/1   desk-01  connected    10    a-full  a-1000
Gi1/0/5   lobby    err-disabled 10    auto    auto   <- port security violation
Gi1/0/6   spare    disabled     999   auto    auto
Gi1/0/9   printer  connected    10    a-half  a-100  <- check duplex`,
    "show power inline":`Available:370.0(w)  Used:368.5(w)  Remaining:1.5(w)
Interface Admin  Oper    Power(W)  Device
Gi1/0/11  auto   on      25.5      AP-Floor2
Gi1/0/12  auto   on      13.0      Camera-Lobby
Gi1/0/13  auto   off     0.0       n/a     <- denied: budget exhausted`,
    "show cdp neighbors":`Device ID     Local Intrfce   Holdtme  Capability  Platform  Port ID
CORE-SW1      Gi1/0/24        152      R S I       C9500     Te1/0/3
AP-Floor2     Gi1/0/11        131      T           AIR-AP    Gi0`}}};
  let os="win";const ran=new Set();
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
  el.innerHTML=`<div class="viz-title">Run real commands (no typing needed)</div><div class="chips"><button class="chip" data-o="win">Windows</button><button class="chip" data-o="lin">Linux</button><button class="chip" data-o="sw">Switch</button></div><div class="chips cmds"></div><pre class="term cli-o" aria-live="polite"></pre>`;
  function draw(){el.querySelectorAll("[data-o]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.o===os));$(".cmds",el).innerHTML=Object.keys(O[os].c).map(c=>`<button class="chip mono" data-c="${esc(c)}">${esc(c)}</button>`).join("");$(".cli-o",el).innerHTML=`<span class="t-n">Pick a command to run it.</span>`}
  el.addEventListener("click",e=>{const o=e.target.closest("[data-o]"),c=e.target.closest("[data-c]");if(o){os=o.dataset.o;draw()}
    if(c){const cmd=c.dataset.c;ran.add(os+cmd);$(".cli-o",el).innerHTML=`<span class="t-c">${esc(O[os].p+cmd)}</span>\n${esc(O[os].c[cmd]).replace(/(&lt;- [^\n]+)/g,'<span class="t-bad">$1</span>')}`;if(ran.size>=8)award("viz:cli",30,"Ran eight troubleshooting commands")}});
  draw();
})();

  },
  sims:[
    {id:"method",type:"order",title:"Work the ticket in the right order",
      scenario:"A branch office reports that nobody can print. Put CompTIA's troubleshooting steps in order.",
      steps:METHOD,success:"That's the methodology the exam expects, from first question to final documentation."},
    {id:"tickets",title:"Clear the trouble ticket queue",mount(el,api,sim){
      const T=[["New devices get 169.254.x.x","Since 10 a.m., any laptop that joins VLAN 30 gets a 169.254 address. Devices that were already connected work fine. The VLAN 30 scope has 50 addresses and 50 active leases.",["DNS server is down","DHCP scope exhausted","Duplex mismatch","STP loop"],1,"Existing clients still have leases. New ones can't get one because all 50 addresses are leased. Expand the scope or shorten the lease time."],
        ["Websites fail, IPs work","<code>ping 8.8.8.8</code> succeeds. <code>nslookup www.comptia.org</code> returns \"DNS request timed out\". <code>ipconfig /all</code> shows DNS Servers: 10.10.0.99.",["Wrong default gateway","Wrong DNS server configured","Bad patch cable","Port err-disabled"],1,"Internet routing works (the ping succeeds), so the gateway is fine. The DNS server address is wrong: 10.10.0.53 is the real resolver."],
        ["Only local works","The user can reach the shared printer at 10.10.10.40 but nothing outside 10.10.10.0/24. <code>ipconfig</code>: IP 10.10.10.57, mask 255.255.255.0, gateway 10.10.10.254. The router is 10.10.10.1.",["Incorrect default gateway","Incorrect subnet mask","Duplicate IP","DHCP exhaustion"],0,"Local traffic doesn't use the gateway, so it works. Everything remote goes to .254, which doesn't exist."],
        ["Slow transfers on one port","<code>show interface gi1/0/9</code>: Half-duplex, 100Mb/s, 1,904 CRC, 812 late collisions. The server's NIC is hard-set to 1 Gbps full duplex.",["MTU mismatch","Duplex mismatch","EMI","PoE budget"],1,"The NIC is hard-set, so the switch's autonegotiation falls back to half duplex. Late collisions confirm it. Set both sides to auto, or both to the same fixed values."],
        ["New AP is dark","A new Wi-Fi 6 AP on gi1/0/13 shows no lights. <code>show power inline</code>: Available 370.0 W, Used 368.5 W, gi1/0/13 oper off.",["Wrong VLAN","PoE budget exceeded","Bad DNS","TX/RX transposed"],1,"Only 1.5 W remains, so the switch denies the AP. Free up budget, add a PoE switch, or use an injector."],
        ["Fiber uplink won't come up","Both ends use 10GBASE-LR SFP+ optics. The installer used an orange OM3 patch cable from the spare bin. Receive power: −28 dBm.",["Wrong fiber type: multimode cable on single-mode optics","Duplex mismatch","Native VLAN mismatch","Expired certificate"],0,"LR optics need single-mode (usually yellow) fiber. Orange or aqua cable is multimode, causing huge loss."]];
      let ans=T.map(()=>null),graded=false;
      function d(){el.innerHTML=`${simHead(sim,api)}<p class="scenario">Six tickets came in overnight. Read the evidence in each and pick the root cause.</p>
        <div class="tickets">${T.map((t,i)=>`<div class="tk ${graded?(ans[i]===t[3]?"ok":"no"):""}"><div class="tk-h"><span class="mono">#${7300+i}</span><b>${t[0]}</b></div><p>${t[1]}</p>
        <div class="tk-o">${t[2].map((o,j)=>`<button class="opt ${ans[i]===j?"sel":""}" data-t="${i}" data-o="${j}">${o}</button>`).join("")}</div>${graded&&ans[i]!==t[3]?`<p class="tk-e">${t[4]}</p>`:""}</div>`).join("")}</div>
        <div class="caption" aria-live="polite">${graded?(T.every((t,i)=>ans[i]===t[3])?'<span class="status-good">Queue cleared.</span> Every root cause is right.':`<b>${T.filter((t,i)=>ans[i]===t[3]).length} of ${T.length}</b> correct. Read the hints on the tickets marked in red.`):"Pick one cause per ticket, then submit."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="check">Submit diagnoses</button></div>`}
      el.addEventListener("click",e=>{const o=e.target.closest("[data-o]"),a=e.target.closest("[data-a]");if(o){ans[+o.dataset.t]=+o.dataset.o;graded=false;d()}if(a){graded=true;if(T.every((t,i)=>ans[i]===t[3]))api.pass();d()}});d();
    }},
    {id:"tools",type:"match",title:"Grab the right tool",
      scenario:"Match each job to the tool you'd reach for first.",
      items:[["Toner and probe","toner"],["Cable tester","tester"],["Visual fault locator","vfl"],["Wi-Fi analyzer","wifi"],["Protocol analyzer","pa"],["nmap","nmap"],["LLDP/CDP","lldp"],["Speed tester","speed"]],
      slots:[["toner","Job 1","Find which patch panel port an unlabeled office jack connects to"],["tester","Job 2","Confirm a freshly crimped cable has the right pinout"],["vfl","Job 3","Find a break in a short fiber patch cable"],["wifi","Job 4","See which channels the neighbors' APs are using"],["pa","Job 5","Decode the SIP packets of a failing VoIP call"],["nmap","Job 6","List every host on a subnet and its open ports"],["lldp","Job 7","Identify which switch and port a phone is plugged into"],["speed","Job 8","Check whether the ISP is delivering the promised 500 Mbps"]],
      success:"Right tool for every job."},
    {id:"output",type:"match",title:"Which command printed this?",
      scenario:"A colleague pasted some output into the ticket without saying what they ran. Match each snippet to its command.",
      items:[["ping","ping"],["tracert","tracert"],["nslookup","nslookup"],["arp -a","arp"],["netstat -an","netstat"],["show mac address-table","mac"],["show ip route","route"]],
      slots:[["ping","Output A","Reply from 10.0.0.1: bytes=32 time<1ms TTL=255"],["tracert","Output B","1 <1 ms 10.0.0.1 · 2 9 ms 203.0.113.1 · 3 * * * Request timed out"],["nslookup","Output C","Non-authoritative answer: Name: www.example.com Address: 93.184.216.34"],["arp","Output D","Internet Address 10.0.0.1 Physical Address 00-1a-2b-00-00-01 dynamic"],["netstat","Output E","TCP 0.0.0.0:443 0.0.0.0:0 LISTENING"],["mac","Output F","Vlan 10 · 3c52.821a.774b · DYNAMIC · Gi1/0/1"],["route","Output G","Gateway of last resort is 10.255.0.1 to network 0.0.0.0"]],
      success:"You can read any of these outputs at a glance."}
  ],
  badges:[
    ["reader","TS","Root Cause","Mark all 7 troubleshooting lessons studied",c=>c.allStudied()],
    ["lab","FL","Field Lab","Complete all 8 troubleshooting diagrams",c=>c.vizAll()],
    ["cli","CL","Command Line Hero","Run eight commands in the CLI simulator",c=>c.earned("viz:cli")],
    ["tickets","TQ","Queue Cleared","Pass the trouble ticket simulation",c=>c.passed("tickets")],
    ["method","7S","Seven Steps","Pass the methodology simulation",c=>c.passed("method")],
    ["host","IP","Address Doctor","Fix all five addressing faults",c=>c.earned("viz:hostcfg")],
    ["recall","TR","Total Recall","Master 15 troubleshooting flashcards",c=>c.countAtLeast(4)>=15],
    ["perfect","PP","Zero Packet Loss","Score 100% on a troubleshooting quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
