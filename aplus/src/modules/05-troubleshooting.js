/* ================= Module 5: Hardware and Network Troubleshooting (Core 1, 220-1201) ================= */
(function(){
const LESSONS=[
{id:"method",num:"5.1",title:"The troubleshooting methodology",short:"Methodology",html:`
<p>CompTIA expects you to follow the same six steps in the same order every time, and exam questions often ask "what should the technician do <b>next</b>?"</p>
<div class="viz" id="viz-method"></div>
<ol>
<li><b>Identify the problem.</b> Gather information from the user, identify recent changes, and inquire about environmental or infrastructure changes. Back up data before making changes.</li>
<li><b>Establish a theory of probable cause.</b> Question the obvious. Research knowledge bases and the internet if needed.</li>
<li><b>Test the theory to determine the cause.</b> If confirmed, decide the next steps. If not, establish a new theory or escalate.</li>
<li><b>Establish a plan of action and implement the solution.</b> Follow vendor instructions and company change policies.</li>
<li><b>Verify full system functionality</b> and, if applicable, implement preventive measures.</li>
<li><b>Document</b> findings, actions and outcomes.</li></ol>
<div class="tip"><b>Exam trap.</b> Documenting comes last, after verifying. And backing up data belongs in step 1, before you change anything.</div>`},
{id:"board",num:"5.2",title:"Motherboard, RAM, CPU and power problems",short:"Boot and power",html:`
<p>Watch where the boot process stops. Each stage depends on the one before it, so the point of failure narrows the cause.</p>
<div class="viz" id="viz-boot"></div>
<div class="scroll"><table><thead><tr><th>Symptom</th><th>Likely causes</th></tr></thead><tbody>
<tr><td>No power, no fans, no lights</td><td>Wall outlet, power cable, PSU switch, failed PSU</td></tr>
<tr><td>Fans spin, blank screen, beeps</td><td>POST failure: RAM, GPU or CPU. Beep codes vary by firmware maker.</td></tr>
<tr><td>Blue screen (BSOD) or kernel panic</td><td>Bad driver, failing RAM, overheating, corrupted system files</td></tr>
<tr><td>Random shutdowns</td><td>Overheating (dust, failed fan, old thermal paste) or a failing PSU</td></tr>
<tr><td>Burning smell or smoke</td><td>Power off and unplug immediately. Inspect the PSU and board.</td></tr>
<tr><td>Swollen or leaking capacitors</td><td>Failing motherboard or PSU. Replace it.</td></tr>
<tr><td>Wrong date and time after power loss</td><td>Dead CMOS battery</td></tr>
<tr><td>Sluggish performance, loud fans</td><td>Thermal throttling, not enough RAM, failing drive</td></tr>
</tbody></table></div>`},
{id:"storage",num:"5.3",title:"Storage and RAID problems",short:"Storage",html:`
<ul><li><b>Clicking or grinding</b> from an HDD: mechanical failure is coming. Back up immediately and replace the drive.</li>
<li><b>"Bootable device not found"</b>: wrong boot order, a disconnected drive, or a corrupted boot sector.</li>
<li><b>S.M.A.R.T. warnings</b>: the drive is reporting its own health problems. Plan a replacement.</li>
<li><b>Extended read/write times and low IOPS</b>: a failing or full drive, or an HDD where an SSD is needed.</li>
<li><b>Drive missing in the OS</b>: check cables and power, then Disk Management (it may need initializing).</li>
<li><b>RAID degraded or missing</b>: check the RAID controller utility and status LEDs. Replace the failed drive and let the array rebuild.</li>
<li><b>Data loss or corruption</b>: restore from backup. Fault tolerance is not a backup.</li></ul>`},
{id:"display",num:"5.4",title:"Video, projector and display problems",short:"Displays",html:`
<ul><li><b>No image</b>: check the input source selected on the display, then cables and power.</li>
<li><b>Dim image</b>: brightness setting, or a failing backlight or projector bulb.</li>
<li><b>Fuzzy image</b>: wrong (non-native) resolution, or projector focus.</li>
<li><b>Flickering</b>: loose cable, wrong refresh rate, or a failing backlight.</li>
<li><b>Dead pixels</b> stay black. <b>Stuck pixels</b> stay one color. Both may be covered by warranty.</li>
<li><b>Burn-in</b>: ghost of a static image, mostly on OLED and plasma.</li>
<li><b>Wrong colors</b>: color profile, a bent pin in a VGA cable, or a loose connection.</li>
<li><b>Projector shuts off by itself</b>: overheating. Clean the air filter and check the fan.</li>
<li><b>Burned-out projector bulb</b>: replace it and reset the lamp timer. Don't touch the glass.</li></ul>`},
{id:"mobile",num:"5.5",title:"Mobile device problems",short:"Mobile",html:`
<ul><li><b>Poor battery health</b>: check the battery health report. Replace aging batteries.</li>
<li><b>Swollen battery</b>: stop using the device and replace the battery. Never puncture it.</li>
<li><b>Improper charging</b>: try another cable and charger, and clean lint out of the port.</li>
<li><b>Poor or no connectivity</b>: airplane mode, Wi-Fi or Bluetooth toggles, carrier settings, or a damaged antenna.</li>
<li><b>Liquid damage</b>: power off, don't charge it, and check the liquid contact indicator.</li>
<li><b>Overheating</b>: heavy apps, a case trapping heat, a failing battery, or malware.</li>
<li><b>Touch problems</b>: clean the screen, remove the screen protector, recalibrate, or replace the digitizer.</li>
<li><b>Cursor drift</b> on laptops: recalibrate the touchpad or check for a swollen battery pushing on it.</li></ul>`},
{id:"network",num:"5.6",title:"Network problems",short:"Network",html:`
<p>Work from your own computer outward, one hop at a time. Each command tests one more piece of the path.</p>
<div class="viz" id="viz-ping"></div>
<div class="scroll"><table><thead><tr><th>Symptom</th><th>Likely causes</th></tr></thead><tbody>
<tr><td>Intermittent wireless</td><td>Interference, distance, channel overlap, roaming between access points</td></tr>
<tr><td>Slow speeds</td><td>Congestion, bandwidth-hungry apps, a duplex mismatch, a bad cable</td></tr>
<tr><td>Limited connectivity (169.254.x.x)</td><td>DHCP server unreachable</td></tr>
<tr><td>Jitter and poor VoIP quality</td><td>Delay that varies. Fix with QoS to prioritize voice traffic.</td></tr>
<tr><td>High latency</td><td>Congested links, satellite connections, long routes</td></tr>
<tr><td>Port flapping</td><td>A switch port repeatedly going up and down: bad cable or NIC</td></tr>
<tr><td>IP conflict</td><td>Two devices with the same static IP, or a static IP inside the DHCP scope</td></tr>
<tr><td>Authentication failures</td><td>Wrong Wi-Fi password or certificate, expired credentials</td></tr>
</tbody></table></div>`},
{id:"printers",num:"5.7",title:"Printer problems",short:"Printers",html:`
<p>The printout itself is the best clue. Click each sample page to diagnose it.</p>
<div class="viz" id="viz-pages"></div>
<ul><li><b>Paper jams and misfeeds</b>: worn pickup rollers, wrong paper type, humid paper. Multiple sheets feeding at once points to a worn separation pad.</li>
<li><b>Jobs stuck in the queue</b>: restart the <b>Print Spooler</b> service and clear the queue.</li>
<li><b>Grinding noise</b>: a stripped gear or something caught in the paper path.</li>
<li><b>Wrong orientation or finishing</b> (stapling, hole punch): check the print driver settings.</li>
<li><b>Wrong colors</b>: an empty cartridge, or the color profile and calibration.</li></ul>`}
];

const CARDS=[
 ...[["Troubleshooting step 1","Identify the problem (and back up data before changes)"],["Troubleshooting step 2","Establish a theory of probable cause (question the obvious)"],["Troubleshooting step 3","Test the theory. If not confirmed, new theory or escalate."],
     ["Troubleshooting step 4","Establish a plan of action and implement the solution"],["Troubleshooting step 5","Verify full system functionality and implement preventive measures"],["Troubleshooting step 6","Document findings, actions and outcomes"]].map((c,i)=>({deck:"method",id:"tm"+i,q:c[0],a:c[1]})),
 ...[["No power, no fans","Check the outlet and cable, then the PSU"],["Beeps at startup, no video","POST failure. RAM, GPU or CPU. Check the beep code."],["Clock resets after unplugging","Dead CMOS battery"],["Random shutdowns under load","Overheating or a failing PSU"],
     ["Burning smell","Power off and unplug immediately"],["Swollen capacitors","Replace the motherboard or PSU"],["Clicking or grinding HDD","Back up now, replace the drive"],["Bootable device not found","Boot order, drive cable, or boot sector"],
     ["S.M.A.R.T. warning","The drive is predicting its own failure"],["Projector shuts off after a while","Overheating. Clean the filter, check the fan."],["Dim display visible with flashlight","Backlight or inverter failure"],["Fuzzy image on LCD","Not running at native resolution"],
     ["Dead pixel vs stuck pixel","Dead stays black. Stuck stays one color."]].map((c,i)=>({deck:"hw",id:"th"+i,q:c[0],a:c[1]})),
 ...[["169.254.x.x address","APIPA. DHCP server unreachable."],["Can ping IPs but not names","DNS problem"],["Can ping the gateway but not the internet","Problem beyond the router: ISP or upstream"],["Fix for choppy VoIP","QoS to prioritize voice traffic"],
     ["Jitter","Variation in delay between packets"],["Port flapping","A switch port repeatedly going up and down"],["IP conflict cause","Duplicate static IP, or a static IP inside the DHCP scope"],["ping 127.0.0.1 tests","The local TCP/IP stack (loopback)"]].map((c,i)=>({deck:"net",id:"tn"+i,q:c[0],a:c[1]})),
 ...[["Vertical white line down every laser page","Scratched drum or blocked toner path"],["Toner smears off the page","Fuser failing (not fusing)"],["Ghost (echo) image","Drum not cleaned, or a bad drum or fuser"],["Speckles on laser prints","Toner leak or dirty drum"],
     ["Garbled characters","Wrong or corrupted print driver"],["Faded prints","Low toner or ink, or economy mode"],["Many jobs stuck in the queue","Restart the Print Spooler service"],["Multiple sheets feed at once","Worn separation pad, or paper needs fanning"],
     ["Swollen phone battery","Stop using it and replace the battery"],["Phone charges slowly or not at all","Try another cable and charger, clean the port"]].map((c,i)=>({deck:"print",id:"tp"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"A user reports their PC won't print. What is the first step of the troubleshooting methodology?",o:["Establish a theory of probable cause","Identify the problem","Replace the printer driver","Document findings"],a:1,e:"Always start by identifying the problem: question the user and find out what changed."},
 {q:"A technician has confirmed the cause of a problem. What is the next step?",o:["Document findings","Establish a plan of action and implement the solution","Identify the problem","Question the obvious"],a:1,e:"Once the theory is confirmed, plan the fix and implement it."},
 {q:"A technician's theory turns out to be wrong. What should happen next?",o:["Document and close the ticket","Establish a new theory or escalate","Reimage the computer","Verify functionality"],a:1,e:"If testing doesn't confirm the theory, form a new one or escalate."},
 {q:"Which is the final step of the CompTIA troubleshooting methodology?",o:["Verify full system functionality","Implement preventive measures","Document findings, actions and outcomes","Test the theory"],a:2,e:"Documentation comes last, after verifying the fix."},
 {q:"During which step should a technician back up user data before making changes?",o:["Identify the problem","Test the theory","Verify functionality","Document"],a:0,e:"CompTIA places backing up data in step 1, before any changes are made."},
 {q:"After fixing an overheating issue, the tech sets up a reminder to clean dust filters quarterly. Which step is this?",o:["Establish a theory","Verify functionality and implement preventive measures","Identify the problem","Document"],a:1,e:"Preventive measures are part of step 5, alongside verifying full functionality."},
 {q:"A PC shows no lights and no fan movement when the power button is pressed. What should be checked first?",o:["The RAM","The wall outlet and power cable","The hard drive","The GPU driver"],a:1,e:"Question the obvious: confirm there's power at the outlet and the cable is seated."},
 {q:"A PC powers on, fans spin, and it beeps repeatedly with no video. What is most likely?",o:["A POST failure such as bad or unseated RAM","A DNS problem","A full hard drive","A bad print driver"],a:0,e:"Beep codes signal POST failures, very often RAM or video."},
 {q:"A workstation shuts down randomly, especially during heavy use. The case is full of dust. What is the likely cause?",o:["Bad DNS settings","Overheating","A failing monitor","Wrong boot order"],a:1,e:"Dust blocks airflow, causing heat that triggers protective shutdowns."},
 {q:"A user smells something burning from their PC. What should the technician do first?",o:["Run diagnostics","Power off and unplug the PC","Update drivers","Open a ticket and wait"],a:1,e:"Safety first: cut the power immediately, then inspect."},
 {q:"A technician sees bulging, leaking capacitors on a motherboard. What should be done?",o:["Reseat the RAM","Replace the motherboard","Update the BIOS","Clean with alcohol"],a:1,e:"Failed capacitors mean the board is failing and must be replaced."},
 {q:"A PC shows a blue screen with a stop code right after a new driver was installed. What should be tried first?",o:["Replace the motherboard","Roll back the driver","Replace the PSU","Reformat the drive"],a:1,e:"A recent change is the prime suspect. Roll back the driver."},
 {q:"An HDD is making clicking noises. What should the technician do first?",o:["Defragment it","Back up the data immediately","Run a disk cleanup","Increase the page file"],a:1,e:"Clicking means mechanical failure is coming. Save the data while you still can."},
 {q:"A PC reports 'Bootable device not found' after a new USB drive was plugged in. What is the likely cause?",o:["Dead CMOS battery","The boot order tries USB first","Bad RAM","Failed GPU"],a:1,e:"Firmware may be trying to boot from the USB drive. Remove it or fix the boot order."},
 {q:"A drive's monitoring software reports a S.M.A.R.T. failure. What does this mean?",o:["The drive is encrypted","The drive is predicting its own failure","The drive is full","RAID is disabled"],a:1,e:"S.M.A.R.T. tracks drive health indicators. A warning means replace soon."},
 {q:"A server's RAID 5 array shows 'Degraded' and one drive's LED is amber. What should be done?",o:["Delete the array","Replace the failed drive and let it rebuild","Convert to RAID 0","Ignore it, RAID 5 is fault tolerant"],a:1,e:"The array still works but has no redundancy left. Replace the drive promptly."},
 {q:"A newly installed second drive doesn't appear in File Explorer, but it shows in UEFI. What should be checked?",o:["Disk Management, to initialize and format it","The CMOS battery","The print spooler","The DNS server"],a:0,e:"New drives must be initialized, partitioned and formatted before Windows shows them."},
 {q:"A projector shows no image, but its lamp is on. What should be checked first?",o:["The bulb","The selected input source","The fan","The ceiling mount"],a:1,e:"The wrong input is the most common cause. Check the source first."},
 {q:"A projector turns itself off after 20 minutes. What is the most likely cause?",o:["Wrong resolution","Overheating from a clogged filter or failed fan","A dead pixel","A bad HDMI cable"],a:1,e:"Projectors shut down to protect themselves when they overheat."},
 {q:"An LCD looks fuzzy, and text has soft edges. What should be checked?",o:["The resolution is set to the native resolution","The backlight","The inverter","The bulb hours"],a:0,e:"LCDs are sharp only at their native resolution."},
 {q:"A single pixel on a new monitor is always black. What is this?",o:["Stuck pixel","Dead pixel","Burn-in","Ghosting"],a:1,e:"A dead pixel never lights. A stuck pixel stays one color."},
 {q:"An OLED display shows a faint outline of the taskbar even when watching video. What is this?",o:["Dead pixels","Burn-in","Flicker","Wrong refresh rate"],a:1,e:"Static images can permanently burn in on OLED panels."},
 {q:"Colors on a VGA-connected monitor are tinted purple. What is most likely?",o:["Low toner","A loose or damaged cable with bent pins","A dead CMOS battery","Wrong DNS"],a:1,e:"Analog VGA carries each color on separate pins, so a bad pin or cable shifts colors."},
 {q:"A phone's battery case is bulging. What should the user do?",o:["Keep charging it","Stop using it and have the battery replaced","Put it in the freezer","Puncture it to let air out"],a:1,e:"Swollen lithium batteries can catch fire. Stop use and replace."},
 {q:"A phone won't charge with its cable, but the cable works with another phone. What should be checked?",o:["The phone's port for lint or damage","The SIM card","The screen protector","The Wi-Fi settings"],a:0,e:"Pocket lint often packs into charging ports and blocks the connector."},
 {q:"A phone was dropped in water. What should be done first?",o:["Charge it to test it","Power it off and don't charge it","Use a hair dryer on high heat","Run a speed test"],a:1,e:"Power and moisture cause short circuits. Turn it off and let it dry or get it serviced."},
 {q:"Touches register in the wrong place after a screen replacement. What should be tried?",o:["Recalibrate the digitizer","Replace the battery","Factory reset immediately","Change the wallpaper"],a:0,e:"Calibration realigns the digitizer to the display."},
 {q:"A laptop's cursor drifts on its own and the touchpad is raised slightly. What could be the cause?",o:["Malware","A swollen battery pushing on the touchpad","Bad DNS","A dead CMOS battery"],a:1,e:"A swelling battery can push up the touchpad, causing phantom input. Replace it now."},
 {q:"A PC has the address 169.254.10.20. What is the problem?",o:["DNS failure","It can't reach a DHCP server","IP conflict","Wrong subnet mask"],a:1,e:"169.254 is APIPA, assigned when DHCP doesn't answer."},
 {q:"A user can ping 8.8.8.8 but can't open websites by name. What is the likely cause?",o:["DHCP","DNS","The NIC","The cable"],a:1,e:"Internet connectivity works, so name resolution (DNS) is failing."},
 {q:"Which command tests the local TCP/IP stack without using the network?",o:["ping 127.0.0.1","ping 8.8.8.8","tracert","nslookup"],a:0,e:"127.0.0.1 is the loopback address, which tests the computer's own TCP/IP stack."},
 {q:"A user can ping the default gateway but nothing on the internet. Where is the problem?",o:["The user's NIC","Beyond the router: the ISP or upstream connection","The user's cable","DNS only"],a:1,e:"The LAN path works up to the gateway, so the fault lies past it."},
 {q:"VoIP calls are choppy whenever large downloads run. What is the best fix?",o:["Disable DHCP","Configure QoS to prioritize voice traffic","Use a static IP","Change the SSID"],a:1,e:"QoS gives voice traffic priority so downloads can't crowd it out."},
 {q:"What term describes variation in the delay between packets, which hurts voice and video?",o:["Latency","Jitter","Bandwidth","Attenuation"],a:1,e:"Jitter is inconsistent delay. Latency is the delay itself."},
 {q:"Windows reports an IP address conflict. What is the likely cause?",o:["Two devices have the same IP address","DNS is down","The cable is too long","Wi-Fi is on channel 6"],a:0,e:"Often a static IP was set inside the DHCP scope, so DHCP gave it out again."},
 {q:"A switch log shows one port going up and down every few seconds. What is this called?",o:["Port flapping","Jitter","Port forwarding","Roaming"],a:0,e:"Port flapping usually points to a bad cable, connector or NIC."},
 {q:"Wireless drops every time the office microwave runs. What is the cause?",o:["DHCP exhaustion","Interference on the 2.4 GHz band","Wrong DNS","Bad patch panel"],a:1,e:"Microwave ovens operate near 2.4 GHz. Move clients to 5 GHz or change channels."},
 {q:"Every page from a laser printer has the same vertical white streak. What is most likely?",o:["Bad fuser","Scratched drum or blocked toner path","Wrong driver","Low memory"],a:1,e:"A defect in the drum or toner path repeats in the same spot on every page."},
 {q:"Toner smears and rubs off pages from a laser printer. Which part should be replaced?",o:["Drum","Fuser","Pickup roller","Transfer belt"],a:1,e:"The fuser melts toner into the paper. If it isn't hot enough, toner stays loose."},
 {q:"A laser printer prints a faint copy of earlier content lower on the page. What is this?",o:["Speckling","Ghosting (echo images)","Garbled print","Banding"],a:1,e:"Ghost images come from a drum that isn't being cleaned or discharged properly, or a failing fuser."},
 {q:"A printer prints pages of random symbols. What is the most likely cause?",o:["Low toner","Wrong or corrupted print driver","Dirty drum","Humid paper"],a:1,e:"Garbled output usually means the driver language doesn't match the printer."},
 {q:"Many print jobs are stuck in the queue and new ones won't print. What should be done?",o:["Replace the toner","Restart the Print Spooler service","Change the paper","Reinstall Windows"],a:1,e:"Restarting the spooler clears stuck jobs."},
 {q:"Several sheets feed through the printer at once. What should be checked?",o:["Fuser temperature","The separation pad and paper (fan the stack)","Toner level","The network cable"],a:1,e:"A worn separation pad or paper sticking together causes multi-feeds."},
 {q:"Laser prints have small random dots of toner all over them. What is this called?",o:["Ghosting","Speckling","Fading","Banding"],a:1,e:"Speckling comes from loose toner, often a leaking cartridge or dirty components."},
 {q:"Pages come out portrait when the user selected landscape. Where should the tech look?",o:["The drum","Print driver and application settings","The fuser","The paper tray"],a:1,e:"Orientation and finishing are set in the driver and app print settings."}
];

registerModule({
  id:"ts",slug:"hw-net-troubleshooting",title:"Hardware and Network Troubleshooting",
  lessons:LESSONS,
  decks:[["method","Methodology"],["hw","Hardware"],["net","Network"],["print","Printers and mobile"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["method","boot","ping","pages"],
  viz(){
/* ---- Methodology flow with a live ticket ---- */
(function(){
  const el=$("#viz-method");if(!el)return;
  const S=[
    ["Identify the problem","A user says their PC won't connect to the internet since this morning. You ask questions and learn that IT moved her desk last night. You back up her files to be safe."],
    ["Establish a theory","Question the obvious: the network cable may not have been reconnected after the move."],
    ["Test the theory","You check under the desk. The cable is plugged in. Theory not confirmed."],
    ["Establish a new theory","The link light on the NIC is off. New theory: the wall jack was patched to the wrong switch port."],
    ["Test the theory","You plug a laptop into the same jack. No link. Theory confirmed."],
    ["Plan and implement","You get approval, then patch the jack to a live switch port in the wiring closet."],
    ["Verify and prevent","The user browses the web, prints and reaches the file share. You label the patch panel so the next move goes smoothly."],
    ["Document","You record the cause, the fix and the labeling in the ticket, then close it."]
  ];
  const NODE=[[0,"Identify"],[1,"Theory"],[2,"Test"],[3,"Plan and implement"],[4,"Verify and prevent"],[5,"Document"]];
  const MAP=[0,1,2,1,2,3,4,5];
  let i=-1;
  el.innerHTML=`<div class="viz-title">Work a real ticket through the six steps</div>
  <div class="viz-scroll"><svg viewBox="0 0 640 170" style="min-width:520px" role="img" aria-label="Troubleshooting methodology flow">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>
    ${NODE.map(([k,n],j)=>`<g class="station" data-n="${k}"><rect x="${10+j*105}" y="40" width="94" height="46" rx="9"/><text x="${57+j*105}" y="${n.length>12?58:68}" text-anchor="middle" style="font-size:12px">${n.length>12?n.split(" ").slice(0,2).join(" "):n}</text>${n.length>12?`<text x="${57+j*105}" y="74" text-anchor="middle" style="font-size:12px">${n.split(" ").slice(2).join(" ")}</text>`:""}<text x="${57+j*105}" y="30" text-anchor="middle" class="s-small">STEP ${j+1}</text></g>`).join("")}
    ${[0,1,2,3,4].map(j=>`<line x1="${104+j*105}" y1="63" x2="${114+j*105}" y2="63" class="m-link" marker-end="url(#ah)"/>`).join("")}
    <path d="M267,86 C267,140 162,140 162,90" class="loop" marker-end="url(#ah)"/><text x="214" y="150" text-anchor="middle" class="s-small">not confirmed: new theory</text>
    <path d="M267,86 L267,120 L330,120" class="esc" /><text x="336" y="124" class="s-small">or escalate</text>
  </svg></div>
  <div class="caption" aria-live="polite">Press <b>Next step</b> to follow a ticket from report to resolution.</div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button><span class="grow"></span></div>`;
  function draw(){
    const cur=i>=0?MAP[i]:-1;
    el.querySelectorAll(".station").forEach((g,j)=>{g.classList.toggle("on",j===cur);g.classList.toggle("done",i>=0&&MAP.slice(0,i).includes(j)&&j!==cur)});
    $(".loop",el).classList.toggle("on",i===3);
    $(".caption",el).innerHTML=i<0?"Press <b>Next step</b> to follow a ticket from report to resolution.":`<b>${S[i][0]}.</b> ${S[i][1]}`;
    $(".grow",el).textContent=i<0?"":`Step ${MAP[i]+1} of 6`;
    $('[data-a="back"]',el).disabled=i<0;$('[data-a="next"]',el).disabled=i>=S.length-1;
    if(i===S.length-1)award("viz:method",30,"Worked a ticket through all six steps");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next")i=Math.min(i+1,S.length-1);if(a==="back")i=Math.max(i-1,-1);if(a)draw()});
  draw();
})();

/* ---- Boot sequence: break it ---- */
(function(){
  const el=$("#viz-boot");if(!el)return;
  const ST=["Power","PSU","CPU + firmware","POST: RAM","POST: video","Boot device","OS loads"];
  const F={
    none:[7,"Every stage passes. Windows loads normally."],
    outlet:[0,"<b>Nothing happens.</b> No lights, no fans. Power never reaches the PSU. Check the outlet, power strip, cable and the PSU's rear switch."],
    psu:[1,"<b>No power or random shutdowns.</b> A dead PSU gives no lights or fans. A weak one may spin fans for a second, then die. Test with a PSU tester or a known-good unit."],
    cpu:[2,"<b>Fans spin, but nothing else.</b> No beeps, no video. The CPU or firmware isn't starting. Check the 8-pin CPU power cable, CPU seating and cooler."],
    ram:[3,"<b>Beeps and no video.</b> POST can't find working memory. Reseat or replace the RAM. The beep pattern differs by firmware maker, so check the manual."],
    gpu:[4,"<b>Beeps, or a powered-on PC with a black screen.</b> POST can't find video. Reseat the graphics card, check its power cable, or try onboard video."],
    disk:[5,"<b>\"Bootable device not found.\"</b> POST passed, but firmware can't find an OS. Check the boot order, drive cables and drive health."],
    os:[6,"<b>Boot loop or blue screen during startup.</b> Hardware is fine. Use Windows Recovery: Startup Repair, System Restore, or roll back the last driver or update."]
  };
  const B=[["none","Healthy PC"],["outlet","Dead outlet"],["psu","Failed PSU"],["cpu","CPU not powered"],["ram","Bad RAM"],["gpu","Unseated GPU"],["disk","Disconnected drive"],["os","Corrupted OS"]];
  const seen=new Set();let cur="none",anim=null;
  el.innerHTML=`<div class="viz-title">Break a PC and see where startup stops</div>
  <div class="viz-controls">${B.map(([k,n])=>`<button class="chip" data-f="${k}">${n}</button>`).join("")}</div>
  <div class="boot">${ST.map((s,i)=>`<div class="bt-st" id="bt${i}"><span class="mono">${i+1}</span>${s}</div>`).join("")}</div>
  <div class="caption" aria-live="polite"></div>`;
  function run(){
    clearTimeout(anim);const [stop,msg]=F[cur];seen.add(cur);
    el.querySelectorAll("[data-f]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===cur));
    ST.forEach((_,i)=>$("#bt"+i).className="bt-st");
    $(".caption",el).innerHTML="Starting up…";
    let i=0;const step=()=>{if(!el.isConnected)return;if(i<stop){$("#bt"+i).className="bt-st ok";i++;anim=setTimeout(step,REDUCED?0:260)}else{if(stop<ST.length)$("#bt"+stop).className="bt-st fail";$(".caption",el).innerHTML=msg;if(seen.size>=6)award("viz:boot",30,"Diagnosed boot failures")}};
    step();
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(b){cur=b.dataset.f;run()}});
  run();
})();

/* ---- Ping ladder terminal ---- */
(function(){
  const el=$("#viz-ping");if(!el)return;
  const STEPS=[["ipconfig","Check your IP settings"],["ping 127.0.0.1","Test the local TCP/IP stack"],["ping 192.168.1.23","Test your own NIC"],["ping 192.168.1.1","Reach the default gateway"],["ping 8.8.8.8","Reach the internet by IP"],["nslookup comptia.org","Test DNS name resolution"]];
  const SC={
    ok:{name:"Everything works",fail:9,ip:"192.168.1.23",note:"Every hop answers. If the user still has a problem, look at the application or the website itself."},
    apipa:{name:"No DHCP",fail:0,ip:"169.254.88.14",note:"<b>APIPA address.</b> The PC never got a lease. Check the cable or Wi-Fi connection, then the DHCP server. Run <code>ipconfig /release</code> and <code>ipconfig /renew</code> after fixing it."},
    gw:{name:"Router down",fail:3,ip:"192.168.1.23",note:"<b>The gateway doesn't answer.</b> The PC's settings are fine, but the router is off, or the switch port or cable between them is bad."},
    isp:{name:"ISP outage",fail:4,ip:"192.168.1.23",note:"<b>The LAN works up to the router, but nothing past it.</b> Check the modem and the ISP's status. Everyone in the office will be affected."},
    dns:{name:"DNS broken",fail:5,ip:"192.168.1.23",note:"<b>Internet works by IP, but names don't resolve.</b> Check the DNS server setting, try another DNS server, or run <code>ipconfig /flushdns</code>."}
  };
  const seen=new Set();let cur="apipa";
  el.innerHTML=`<div class="viz-title">Walk the ping ladder from your PC to the internet</div>
  <div class="viz-controls">${Object.entries(SC).map(([k,s])=>`<button class="chip" data-s="${k}">${s.name}</button>`).join("")}</div>
  <pre class="term" aria-live="polite"></pre>
  <div class="caption"></div>`;
  function out(k,i,s){
    const [cmd]=STEPS[i];const failed=i===s.fail||(s.fail===0&&i>0&&i!==1);
    if(i===0)return `IPv4 Address. . . : ${s.ip}\nSubnet Mask . . . : ${s.fail===0?"255.255.0.0":"255.255.255.0"}\nDefault Gateway . : ${s.fail===0?"":"192.168.1.1"}`;
    if(i===5)return failed?"*** can't find comptia.org: Server failed":"Name:    comptia.org\nAddress: 104.18.12.40";
    if(i===2&&s.fail===0)return "Reply from 169.254.88.14: bytes=32 time<1ms TTL=128";
    return failed?"Request timed out.\nRequest timed out.\nPackets: Sent = 4, Received = 0 (100% loss)":`Reply from ${cmd.split(" ")[1]}: bytes=32 time=${i===4?"14":"<1"}ms\nPackets: Sent = 4, Received = 4 (0% loss)`;
  }
  function draw(){
    const s=SC[cur];seen.add(cur);
    el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===cur));
    let t="";for(let i=0;i<STEPS.length;i++){const fail=i===s.fail||(i===0&&s.fail===0);t+=`<span class="t-c">C:\\&gt; ${STEPS[i][0]}</span>   <span class="t-n"># ${STEPS[i][1]}</span>\n<span class="${fail?"t-bad":"t-ok"}">${out(cur,i,s).replace(/</g,"&lt;")}</span>\n\n`;if(fail)break}
    $(".term",el).innerHTML=t.trim();
    $(".caption",el).innerHTML=s.note;
    if(seen.size>=4)award("viz:ping",30,"Walked the ping ladder");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(b){cur=b.dataset.s;draw()}});draw();
})();

/* ---- Printer defect gallery ---- */
(function(){
  const el=$("#viz-pages");if(!el)return;
  const P=[
    ["lines","Vertical lines","<b>Vertical lines or streaks.</b> Laser: a scratched drum or toner stuck in the developer. Inkjet: clogged nozzles, so run head cleaning."],
    ["speck","Speckles","<b>Speckling.</b> Loose toner from a leaking cartridge or a dirty drum. Replace the cartridge and clean the inside with a toner vacuum."],
    ["ghost","Ghost image","<b>Ghosting (echo images).</b> A faint repeat of earlier content further down the page. The drum isn't being cleaned or discharged, or the fuser is failing."],
    ["faded","Faded","<b>Faded prints.</b> Low toner or ink, economy or draft mode turned on, or (on thermal printers) a dirty heating element."],
    ["smear","Toner smears","<b>Toner rubs off.</b> The fuser isn't melting toner into the paper. Replace the fuser. Also check that the paper type setting matches."],
    ["garbled","Garbled text","<b>Garbled characters.</b> The print driver doesn't match the printer. Reinstall the correct driver (PCL or PostScript) and clear the queue."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Diagnose the printout</div>
  <div class="pages">${P.map(([k,n])=>`<button class="pg pg-${k}" data-p="${k}"><span class="pg-sheet"><i></i><i></i><i></i><i></i><i></i><b>${k==="garbled"?"§¶Ω ±∆ ¥∂Ξ ¤":"Quarterly report"}</b></span><em>${n}</em></button>`).join("")}</div>
  <div class="caption" aria-live="polite">Click a page to see what causes it.</div>`;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;const p=P.find(x=>x[0]===b.dataset.p);seen.add(p[0]);
    el.querySelectorAll(".pg").forEach(x=>x.classList.toggle("sel",x===b));$(".caption",el).innerHTML=p[2];if(seen.size===P.length)award("viz:pages",20,"Diagnosed every printout")});
})();
  },
  sims:[
    {id:"steps",type:"order",title:"Put the troubleshooting steps in order",
      scenario:"A new help desk tech has the CompTIA methodology scrambled on a sticky note. Tap the six steps in the right order.",
      steps:["Identify the problem","Establish a theory of probable cause","Test the theory to determine the cause","Establish a plan of action and implement the solution","Verify full system functionality and implement preventive measures","Document findings, actions and outcomes"],
      success:"That's the exact order CompTIA tests."},
    {id:"triage",type:"match",title:"Triage the morning's tickets",
      scenario:"Eight tickets came in overnight. Match each one to the best first fix. Tap a fix, then tap the ticket.",
      items:[["Back up, then replace the drive","hdd"],["Replace the CMOS battery","clock"],["Check the cable and DHCP server","apipa"],["Power off and unplug now","smoke"],["Clean the filter, check the fan","proj"],["Stop using it, replace the battery","phone"],["Enable QoS for voice","voip"],["Restart the Print Spooler","queue"]],
      slots:[["hdd","Desktop clicking loudly","Files still open, for now"],["clock","Date resets every morning","PC is unplugged at night"],["apipa","IP is 169.254.20.7","No network access"],["smoke","Burning smell from a PC","Faint smoke from the back"],["proj","Projector shuts off","After 20 minutes of use"],["phone","Phone case bulging","Screen lifting at the edge"],["voip","Choppy calls","Only during big downloads"],["queue","40 jobs stuck","Nothing prints"]],
      success:"Every ticket is triaged with the right first move."},
    {id:"printfix",type:"match",title:"Fix the print room",
      scenario:"The print room has six broken printers. Match each symptom to the part or fix that solves it. Tap a fix, then tap the symptom.",
      items:[["Replace the fuser","smear"],["Replace the drum","line"],["Reinstall the correct driver","garb"],["Replace the separation pad","multi"],["Clean and align print heads","streak"],["Clean the heating element","thermal"]],
      slots:[["smear","Laser: toner rubs off","Pages feel cool"],["line","Laser: same white line on every page","Toner is full"],["garb","Pages of random symbols","After a new PC was added"],["multi","Three sheets feed at once","Fanning the paper didn't help"],["streak","Inkjet: missing lines in text","Cartridges are new"],["thermal","Receipt printer: faded text","Paper is correct"]],
      success:"All six printers are back in service."}
  ],
  badges:[
    ["reader","TS","Troubleshooter","Mark all 7 troubleshooting lessons studied",c=>c.allStudied()],
    ["lab","DX","Diagnostician","Complete all 4 troubleshooting diagrams",c=>c.vizAll()],
    ["steps","SX","Six Steps","Pass the methodology simulation",c=>c.passed("steps")],
    ["triage","TM","Triage Master","Pass the ticket triage simulation",c=>c.passed("triage")],
    ["printfix","PW","Printer Whisperer","Pass the print room simulation",c=>c.passed("printfix")],
    ["perfect","RC","Root Cause","Score 100% on a troubleshooting quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
