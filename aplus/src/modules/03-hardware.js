/* ================= Module 3: Hardware (Core 1, 220-1201) ================= */
(function(){
const LESSONS=[
{id:"cables",num:"3.1",title:"Cables and connectors",short:"Cables and connectors",html:`
<p>Most hardware questions start with "which cable or port is this?" Learn each one by its shape, its speed and what it carries.</p>
<div class="viz" id="viz-panel"></div>
<h3>USB versions</h3>
<div class="scroll"><table><thead><tr><th>Version</th><th>Max speed</th><th>Notes</th></tr></thead><tbody>
<tr><td class="port">USB 2.0</td><td>480 Mbps</td><td>Hi-Speed. Usually a black port.</td></tr>
<tr><td class="port">USB 3.2 Gen 1</td><td>5 Gbps</td><td>Formerly USB 3.0. Often a blue port.</td></tr>
<tr><td class="port">USB 3.2 Gen 2</td><td>10 Gbps</td><td>Formerly USB 3.1 Gen 2.</td></tr>
<tr><td class="port">USB 3.2 Gen 2x2</td><td>20 Gbps</td><td>USB-C only.</td></tr>
<tr><td class="port">USB4</td><td>40 Gbps</td><td>USB-C only. Based on Thunderbolt 3.</td></tr>
<tr><td class="port">Thunderbolt 3 / 4</td><td>40 Gbps</td><td>USB-C connector. Carries data, video and power.</td></tr>
</tbody></table></div>
<h3>Video</h3>
<ul><li><b>HDMI</b>: digital video and audio on one cable. TVs, monitors and projectors.</li>
<li><b>DisplayPort</b>: digital video and audio, common on PCs. One corner is cut off. Can daisy-chain monitors.</li>
<li><b>DVI</b>: digital (DVI-D), analog (DVI-A) or both (DVI-I). Video only.</li>
<li><b>VGA</b>: analog, 15 pins in three rows, usually blue. Legacy.</li></ul>
<h3>Network and storage cables</h3>
<div class="scroll"><table><thead><tr><th>Cable</th><th>Speed and distance</th></tr></thead><tbody>
<tr><td class="port">Cat 5e</td><td>1 Gbps up to 100 m</td></tr>
<tr><td class="port">Cat 6</td><td>10 Gbps up to 55 m (1 Gbps at 100 m)</td></tr>
<tr><td class="port">Cat 6a</td><td>10 Gbps up to 100 m</td></tr>
<tr><td class="port">Coaxial (RG-6)</td><td>Cable TV and cable modems. F-type screw-on connector.</td></tr>
<tr><td class="port">Fiber</td><td>Long distance, immune to interference. Connectors: LC (small, square), SC (square, push-pull), ST (round, twist-lock).</td></tr>
<tr><td class="port">SATA</td><td>Internal drives, 6 Gbps. eSATA is the external version.</td></tr>
</tbody></table></div>
<div class="tip"><b>Plenum vs PVC.</b> Plenum-rated cable has a fire-resistant jacket and must be used in air-handling spaces such as drop ceilings. Shielded twisted pair (STP) resists interference near motors and lights.</div>`},
{id:"ram",num:"3.2",title:"RAM types and configurations",short:"RAM",html:`
<p>RAM holds whatever the CPU is working on right now. It is volatile, so its contents disappear when power is lost.</p>
<ul><li><b>DIMM</b> sticks go in desktops. <b>SODIMM</b> sticks are the smaller laptop version.</li>
<li><b>DDR4</b> and <b>DDR5</b> desktop DIMMs both have 288 pins, but the notch is in a different place, so they can't be swapped. Each motherboard supports only one generation.</li>
<li><b>ECC</b> RAM detects and corrects memory errors. Used in servers and needs a board and CPU that support it.</li>
<li><b>Virtual memory</b> is disk space (the page file) used when RAM runs out. It is much slower.</li></ul>
<div class="viz" id="viz-ram"></div>
<div class="tip"><b>Matched pairs.</b> For dual-channel, install identical sticks in matching slots (usually the same color). Mixed sizes or speeds run at the slowest stick's speed.</div>`},
{id:"storage",num:"3.3",title:"Storage devices and RAID",short:"Storage and RAID",html:`
<h3>Drive types</h3>
<ul><li><b>Hard disk drive (HDD)</b>: spinning platters at 5,400, 7,200, 10,000 or 15,000 rpm. Cheap per terabyte, but slow and fragile. Sizes are 3.5 inch (desktop) and 2.5 inch (laptop).</li>
<li><b>SATA SSD</b>: flash memory with no moving parts, limited by the 6 Gbps SATA link.</li>
<li><b>NVMe SSD</b>: flash memory on the PCIe bus, usually in an <b>M.2</b> slot. Several times faster than SATA.</li>
<li><b>M.2</b> is a form factor, not a speed. An M.2 drive can be NVMe (M key) or SATA (B+M key), so check what the slot supports.</li>
<li><b>Removable</b>: USB flash drives, SD and microSD cards, and optical discs (CD 700 MB, DVD 4.7 GB, Blu-ray 25 GB per layer).</li></ul>
<div class="viz" id="viz-race"></div>
<h3>RAID</h3>
<p>RAID combines drives for speed, fault tolerance or both. Fault tolerance is not a backup: deleted or encrypted files are gone from every drive at once.</p>
<div class="viz" id="viz-raid"></div>`},
{id:"board",num:"3.4",title:"Motherboards, CPUs and add-on cards",short:"Motherboards and CPUs",html:`
<div class="viz" id="viz-board"></div>
<h3>Form factors</h3>
<div class="scroll"><table><thead><tr><th>Form factor</th><th>Size</th><th>Typical use</th></tr></thead><tbody>
<tr><td class="port">ATX</td><td>12 × 9.6 in</td><td>Full desktops with many expansion slots</td></tr>
<tr><td class="port">microATX</td><td>9.6 × 9.6 in</td><td>Smaller desktops, fewer slots</td></tr>
<tr><td class="port">Mini-ITX</td><td>6.7 × 6.7 in</td><td>Small form factor PCs, one slot</td></tr>
</tbody></table></div>
<h3>BIOS and UEFI settings</h3>
<ul><li><b>UEFI</b> replaced the legacy BIOS. It supports GPT drives over 2 TB, a mouse-driven interface and <b>Secure Boot</b>, which only loads signed operating systems.</li>
<li><b>TPM</b> (Trusted Platform Module) stores encryption keys in hardware, used by BitLocker and Windows 11.</li>
<li>Other settings: boot order, BIOS passwords, fan curves, enabling virtualization (Intel VT-x or AMD-V), and USB permissions.</li>
<li>A dead <b>CMOS battery</b> (usually a CR2032) makes the clock and settings reset every time the PC is unplugged.</li></ul>
<h3>CPUs and cooling</h3>
<ul><li>x86-64 CPUs (Intel, AMD) run most PCs. <b>ARM</b> CPUs use less power and run phones, tablets and some laptops.</li>
<li>More <b>cores</b> run more tasks at once. Hyperthreading (SMT) lets each core run two threads.</li>
<li>Cooling: a heat sink with <b>thermal paste</b> between it and the CPU, plus fans or liquid cooling. Reapply paste whenever the cooler is removed.</li></ul>
<h3>Expansion cards</h3>
<p>Graphics, sound, network, capture and storage controller cards go in PCIe slots. A graphics card uses an x16 slot. Small cards use x1.</p>`},
{id:"power",num:"3.5",title:"Power supplies",short:"Power supplies",html:`
<p>The power supply unit (PSU) turns wall AC into the DC voltages components use: <b>+3.3 V, +5 V and +12 V</b>. The 12 V rail powers the hungriest parts, the CPU and GPU.</p>
<div class="scroll"><table><thead><tr><th>Connector</th><th>Powers</th></tr></thead><tbody>
<tr><td class="port">24-pin ATX</td><td>The motherboard</td></tr>
<tr><td class="port">4+4 / 8-pin EPS</td><td>The CPU, near the socket</td></tr>
<tr><td class="port">6+2-pin PCIe</td><td>Graphics cards. Newer high-end cards use the 16-pin 12V-2x6 (12VHPWR).</td></tr>
<tr><td class="port">15-pin SATA</td><td>SATA drives (3.3, 5 and 12 V)</td></tr>
<tr><td class="port">4-pin Molex</td><td>Older drives and fans (5 and 12 V)</td></tr>
</tbody></table></div>
<ul><li>Input voltage: 120 V in North America, 230 V in much of the world. Most PSUs switch automatically.</li>
<li><b>Modular</b> PSUs let you attach only the cables you need. <b>Redundant</b> PSUs in servers keep running if one fails.</li>
<li><b>80 Plus</b> ratings (Bronze, Gold, Platinum, Titanium) show efficiency: less power wasted as heat.</li></ul>
<div class="viz" id="viz-psu"></div>`},
{id:"printers",num:"3.6",title:"Printers and multifunction devices",short:"Printer setup",html:`
<ul><li><b>Connections</b>: USB, Ethernet, Wi-Fi, or a shared print server.</li>
<li><b>Drivers</b>: PCL (common for laser printers) or PostScript (better for graphics and design work). Install the right 32- or 64-bit driver.</li>
<li><b>Settings</b>: duplex (two-sided), orientation, tray selection, quality, and collation.</li>
<li><b>Security</b>: badge or PIN release so jobs print only when the user is at the device, audit logs, and user permissions.</li>
<li><b>Scanning</b>: scan to email, to a network folder (SMB), or to the cloud. An ADF (automatic document feeder) scans many pages at once.</li></ul>
<div class="tip"><b>Unbox carefully.</b> Remove all packing tape and locks, let a printer reach room temperature if it was delivered cold, and lift heavy printers with two people.</div>`},
{id:"printtech",num:"3.7",title:"Printer types and maintenance",short:"Printer types",html:`
<h3>Laser printers</h3>
<p>Laser printers use static electricity, toner powder and heat. CompTIA tests the seven-step imaging process in order.</p>
<div class="viz" id="viz-laser"></div>
<p>Maintenance: replace the toner, drum and fuser on schedule using a <b>maintenance kit</b>, and clean with a toner-safe vacuum. The fuser gets very hot, so let it cool first.</p>
<h3>Other printer types</h3>
<div class="scroll"><table><thead><tr><th>Type</th><th>How it works</th><th>Maintenance</th></tr></thead><tbody>
<tr><td class="port">Inkjet</td><td>Sprays ink through tiny nozzles (thermal bubble or piezoelectric)</td><td>Replace cartridges, clean and calibrate print heads</td></tr>
<tr><td class="port">Thermal</td><td>A heating element darkens special heat-sensitive paper. Receipts and labels.</td><td>Replace paper, clean the heating element with isopropyl alcohol</td></tr>
<tr><td class="port">Impact</td><td>Pins strike an inked ribbon. Prints multipart (carbon copy) forms on tractor-fed paper.</td><td>Replace ribbon, print head and paper</td></tr>
<tr><td class="port">3D</td><td>Builds objects layer by layer from plastic filament or liquid resin</td><td>Replace filament or resin, level and clean the bed</td></tr>
</tbody></table></div>`}
];

const CARDS=[
 ...[["USB 2.0 max speed","480 Mbps"],["USB 3.2 Gen 1 max speed","5 Gbps (formerly USB 3.0)"],["USB 3.2 Gen 2 max speed","10 Gbps"],["USB4 and Thunderbolt 3/4 speed","40 Gbps over USB-C"],
     ["Video connector that also carries audio, common on TVs","HDMI"],["Video connector with one corner cut off","DisplayPort"],["Analog video, 15 pins in 3 rows","VGA"],["DVI-D vs DVI-I","DVI-D is digital only. DVI-I carries digital and analog."],
     ["Cat 5e max speed and distance","1 Gbps, 100 m"],["Cat 6a max speed and distance","10 Gbps, 100 m"],["Connector for cable TV coax","F-type (RG-6 cable)"],["Fiber connector: small and square, often in pairs","LC"],["Fiber connector: round, twist to lock","ST"],
     ["Cable jacket required in drop ceilings","Plenum-rated"],["SATA III speed","6 Gbps"]].map((c,i)=>({deck:"cables",id:"hc"+i,q:c[0],a:c[1]})),
 ...[["DDR4 vs DDR5 DIMM pins","Both 288, but the notch differs, so they are not interchangeable"],["Memory module used in laptops and small form factor PCs","SODIMM (small outline DIMM)"],["RAM that corrects memory errors","ECC"],
     ["RAID 0","Striping. Fast, no fault tolerance. Min 2 drives."],["RAID 1","Mirroring. Survives one drive failure. 2 drives."],["RAID 5","Striping with parity. Survives 1 failure. Min 3 drives. Loses 1 drive of capacity."],
     ["RAID 6","Double parity. Survives 2 failures. Min 4 drives."],["RAID 10","Mirrored pairs, then striped. Min 4 drives. Half the capacity."],["NVMe connects over which bus?","PCIe"],
     ["Common HDD speeds","5,400 and 7,200 rpm (10k and 15k in servers)"]].map((c,i)=>({deck:"memory",id:"hm"+i,q:c[0],a:c[1]})),
 ...[["UEFI feature that only boots signed operating systems","Secure Boot"],["Chip that stores encryption keys for BitLocker","TPM"],["Clock resets every time the PC is unplugged","Replace the CMOS battery"],
     ["ATX motherboard size","12 × 9.6 in"],["Mini-ITX motherboard size","6.7 × 6.7 in"],["Must be enabled in UEFI to run virtual machines","Intel VT-x or AMD-V"],
     ["Motherboard power connector","24-pin ATX"],["CPU power connector","4+4 (8-pin) EPS 12 V"],["PSU output voltages","+3.3 V, +5 V, +12 V"],["Graphics card power connector","6+2-pin PCIe, or 16-pin 12V-2x6 on high-end cards"]].map((c,i)=>({deck:"board",id:"hb"+i,q:c[0],a:c[1]})),
 ...[["The 7 laser printing steps","Processing, Charging, Exposing, Developing, Transferring, Fusing, Cleaning"],["Laser step that melts toner onto paper","Fusing (heat and pressure)"],["Laser step where the laser writes the image on the drum","Exposing"],
     ["Printer for multipart carbon forms","Impact (dot matrix)"],["Printer that needs heat-sensitive paper","Thermal"],["Fix streaky inkjet output","Clean and calibrate the print heads"],["PostScript vs PCL","PostScript suits graphics and design. PCL is common for general office laser printing."]].map((c,i)=>({deck:"print",id:"hp"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"A user wants to connect a laptop to a TV and send both video and sound over one cable. Which is the best choice?",o:["VGA","DVI-D","HDMI","Cat 6"],a:2,e:"HDMI carries digital video and audio together. VGA and DVI carry video only."},
 {q:"Which connector has 15 pins in three rows and carries an analog signal?",o:["DisplayPort","VGA","DVI-D","HDMI"],a:1,e:"VGA (DE-15) is analog with 15 pins in three rows, usually blue."},
 {q:"Which USB version has a maximum speed of 480 Mbps?",o:["USB 2.0","USB 3.2 Gen 1","USB 3.2 Gen 2","USB4"],a:0,e:"USB 2.0 (Hi-Speed) tops out at 480 Mbps. USB 3.2 Gen 1 is 5 Gbps."},
 {q:"A network cable must run through the drop ceiling, which is also an air return. What type of cable is required?",o:["PVC","Plenum","Coaxial","Shielded PVC"],a:1,e:"Plenum-rated jackets resist fire and produce less toxic smoke, as required in air-handling spaces."},
 {q:"Which cable supports 10 Gbps over the full 100 m distance?",o:["Cat 5e","Cat 6","Cat 6a","RG-6"],a:2,e:"Cat 6a runs 10 Gbps to 100 m. Cat 6 manages 10 Gbps only up to about 55 m."},
 {q:"A cable modem connects to the wall with a screw-on connector. What is it?",o:["RJ11","F-type","ST","LC"],a:1,e:"Coaxial RG-6 cable uses the F-type screw-on connector."},
 {q:"Which fiber connector is round and uses a bayonet twist to lock?",o:["LC","SC","ST","RJ45"],a:2,e:"ST connectors twist to lock. SC is square push-pull, and LC is small and square."},
 {q:"A technician has two identical 16 GB DIMMs. How should they be installed to enable dual-channel mode?",o:["In two slots of the same channel","In matching slots on different channels","Any two slots","Only in slot A1 and A2"],a:1,e:"Dual-channel needs one stick per channel, usually in the same-colored slots. Check the motherboard manual."},
 {q:"Why won't a DDR4 stick fit in a DDR5 slot?",o:["DDR4 has fewer pins","The notch is in a different position","DDR5 is only for laptops","DDR4 needs ECC"],a:1,e:"Both have 288 pins, but the key notch is in a different place so the wrong generation can't be installed."},
 {q:"Which type of RAM detects and corrects single-bit memory errors?",o:["SODIMM","ECC","DDR5","Virtual memory"],a:1,e:"ECC (error-correcting code) memory is used in servers where memory errors must be caught."},
 {q:"A server admin needs fault tolerance that survives two simultaneous drive failures. Which RAID level?",o:["RAID 0","RAID 1","RAID 5","RAID 6"],a:3,e:"RAID 6 stores two sets of parity, so any two drives can fail."},
 {q:"Four 2 TB drives are configured as RAID 5. What is the usable capacity?",o:["2 TB","4 TB","6 TB","8 TB"],a:2,e:"RAID 5 loses one drive's worth of capacity to parity: (4 − 1) × 2 TB = 6 TB."},
 {q:"Which RAID level offers the best performance but no fault tolerance?",o:["RAID 0","RAID 1","RAID 5","RAID 10"],a:0,e:"RAID 0 stripes data across drives for speed. If any drive fails, all data is lost."},
 {q:"What is the minimum number of drives for RAID 10?",o:["2","3","4","5"],a:2,e:"RAID 10 needs at least four drives: two mirrored pairs, striped together."},
 {q:"A user wants the fastest storage for a new PC. Which should a technician recommend?",o:["7,200 rpm HDD","SATA SSD","NVMe SSD in an M.2 slot","eSATA external drive"],a:2,e:"NVMe uses PCIe lanes and is several times faster than SATA SSDs, which are limited to 6 Gbps."},
 {q:"A new M.2 drive isn't detected. The board's M.2 slot supports SATA only. What is the likely cause?",o:["The drive is NVMe","The CMOS battery is dead","RAID is enabled","The drive needs a Molex connector"],a:0,e:"M.2 is a form factor. An NVMe M.2 drive won't work in a slot that only supports M.2 SATA."},
 {q:"Which feature in UEFI prevents unsigned bootloaders from starting?",o:["TPM","Secure Boot","Hyperthreading","Fast Boot"],a:1,e:"Secure Boot only lets digitally signed bootloaders run, blocking boot-level malware."},
 {q:"BitLocker needs a place to store encryption keys in hardware. Which component provides it?",o:["CMOS","TPM","Chipset","BIOS chip"],a:1,e:"The Trusted Platform Module securely stores keys for BitLocker and other security features."},
 {q:"Every time a PC is unplugged, the date and time reset. What should be replaced?",o:["Power supply","CMOS battery","RAM","Hard drive"],a:1,e:"The CMOS battery keeps the clock and settings when the PC has no power."},
 {q:"A user can't start virtual machines and gets an error that hardware virtualization is unavailable. Where is it enabled?",o:["Device Manager","UEFI/BIOS settings","Control Panel","The hypervisor's network settings"],a:1,e:"Intel VT-x or AMD-V must be turned on in the UEFI/BIOS firmware settings."},
 {q:"Which motherboard form factor is the smallest?",o:["ATX","microATX","Mini-ITX","Extended ATX"],a:2,e:"Mini-ITX is 6.7 × 6.7 in. microATX is 9.6 × 9.6 in and ATX is 12 × 9.6 in."},
 {q:"What should be applied between a CPU and its heat sink?",o:["Thermal paste","Dielectric grease","Silicone sealant","Nothing"],a:0,e:"Thermal paste fills tiny gaps so heat moves from the CPU into the heat sink."},
 {q:"Which slot is used for a dedicated graphics card?",o:["PCIe x1","PCIe x16","M.2","DIMM"],a:1,e:"Graphics cards need the bandwidth of a PCIe x16 slot."},
 {q:"Which PSU connector powers the motherboard?",o:["24-pin ATX","8-pin EPS","15-pin SATA","6+2-pin PCIe"],a:0,e:"The 24-pin ATX connector is the main motherboard power. The 8-pin EPS powers the CPU."},
 {q:"Which voltages does a standard ATX power supply provide?",o:["+1.5, +3.3, +5 V","+3.3, +5, +12 V","+5, +12, +24 V","+12, +24, +48 V"],a:1,e:"ATX PSUs supply +3.3 V, +5 V and +12 V DC."},
 {q:"A server must keep running even if a power supply fails. What should it have?",o:["A modular PSU","Redundant PSUs","An 80 Plus Gold PSU","A higher-wattage PSU"],a:1,e:"Redundant power supplies share the load, so one can fail (and be hot-swapped) without downtime."},
 {q:"What does an 80 Plus Gold rating describe?",o:["Maximum wattage","Efficiency","Number of rails","Cable length"],a:1,e:"80 Plus tiers describe how efficiently the PSU converts AC to DC."},
 {q:"Which is the correct order of the laser printing process?",o:["Charging, Processing, Exposing, Fusing, Developing, Transferring, Cleaning","Processing, Charging, Exposing, Developing, Transferring, Fusing, Cleaning","Processing, Exposing, Charging, Transferring, Developing, Cleaning, Fusing","Cleaning, Charging, Processing, Exposing, Developing, Fusing, Transferring"],a:1,e:"Remember: Processing, Charging, Exposing, Developing, Transferring, Fusing, Cleaning."},
 {q:"Printed pages from a laser printer smudge when touched. Which part is most likely failing?",o:["Drum","Fuser","Transfer roller","Pickup roller"],a:1,e:"The fuser melts toner onto the paper. If it's failing, toner sits loose and smears."},
 {q:"In which laser printing step does toner move onto the drum?",o:["Charging","Exposing","Developing","Transferring"],a:2,e:"In developing, toner sticks to the areas of the drum that the laser exposed."},
 {q:"A shipping department prints multipart forms with carbon copies. Which printer type is required?",o:["Laser","Inkjet","Impact","Thermal"],a:2,e:"Impact printers physically strike the page, so the pressure transfers to every copy."},
 {q:"A receipt printer is producing faded output. The paper is correct. What should be cleaned?",o:["The fuser","The heating element","The print heads","The drum"],a:1,e:"Thermal printers use a heating element. Clean it with isopropyl alcohol."},
 {q:"Inkjet output has missing lines and streaks. What should be done first?",o:["Replace the fuser","Clean the print heads","Replace the drum","Install a PostScript driver"],a:1,e:"Clogged nozzles cause streaks. Run the print head cleaning routine, then calibrate."},
 {q:"A design studio needs accurate printing of complex graphics. Which driver type is best?",o:["PCL","PostScript","Generic text","XPS"],a:1,e:"PostScript is device-independent and handles complex graphics and fonts precisely."},
 {q:"Which printer feature holds jobs until the user authenticates at the device?",o:["Duplexing","Badge or PIN release","Collation","Tray selection"],a:1,e:"Secure release keeps sensitive pages from sitting in the output tray."},
 {q:"Which item is NOT usually in a laser printer maintenance kit?",o:["Fuser","Pickup rollers","Transfer roller","Ink cartridge"],a:3,e:"Ink cartridges are for inkjet printers. Laser maintenance kits replace fusers and rollers."},
 {q:"How much data does a single-layer Blu-ray disc hold?",o:["700 MB","4.7 GB","25 GB","50 GB"],a:2,e:"Single-layer Blu-ray holds 25 GB, and dual-layer holds 50 GB. A DVD holds 4.7 GB."},
 {q:"Which connection carries data, video and power over a USB-C connector at 40 Gbps?",o:["eSATA","Thunderbolt 4","HDMI","DVI"],a:1,e:"Thunderbolt 3 and 4 run at 40 Gbps over USB-C and carry data, video and power."},
 {q:"A workstation shuts off when a demanding game starts. A new high-end GPU was just installed. What is most likely?",o:["Bad RAM","The power supply wattage is too low","The CMOS battery is dead","The monitor cable is loose"],a:1,e:"A GPU raises power draw. If the PSU can't supply it, the system shuts down under load."},
 {q:"A tech replaces a CPU cooler. What must be done before reinstalling it?",o:["Update the BIOS","Clean off and reapply thermal paste","Replace the CMOS battery","Reset the boot order"],a:1,e:"Old paste should be cleaned off and fresh paste applied for good heat transfer."}
];

registerModule({
  id:"hw",slug:"hardware",title:"Hardware",
  lessons:LESSONS,
  decks:[["cables","Cables and ports"],["memory","RAM and storage"],["board","Boards and power"],["print","Printers"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["panel","ram","race","raid","board","psu","laser"],
  viz(){
/* ---- Rear I/O panel: identify ports ---- */
(function(){
  const el=$("#viz-panel");if(!el)return;
  const P=[
    {id:"usba",x:40,y:40,w:44,h:18,draw:(x,y)=>`<rect x="${x}" y="${y}" width="44" height="18" rx="2" class="pt-body"/><rect x="${x+5}" y="${y+4}" width="34" height="6" class="pt-in"/>`,name:"USB-A",info:"<b>USB-A.</b> The classic rectangular USB port for keyboards, mice and flash drives. Blue inside usually means USB 3.x (5 Gbps)."},
    {id:"usbc",x:40,y:80,w:40,h:14,draw:(x,y)=>`<rect x="${x}" y="${y}" width="40" height="14" rx="7" class="pt-body"/><rect x="${x+8}" y="${y+5}" width="24" height="4" rx="2" class="pt-in"/>`,name:"USB-C",info:"<b>USB-C.</b> Small, oval and reversible. Can carry USB data, video (DisplayPort Alt Mode), Thunderbolt and power delivery."},
    {id:"hdmi",x:120,y:40,w:46,h:18,draw:(x,y)=>`<polygon points="${x},${y} ${x+46},${y} ${x+46},${y+11} ${x+40},${y+18} ${x+6},${y+18} ${x},${y+11}" class="pt-body"/><rect x="${x+6}" y="${y+5}" width="34" height="5" class="pt-in"/>`,name:"HDMI",info:"<b>HDMI.</b> Digital video and audio on one cable. The most common port on TVs and monitors."},
    {id:"dp",x:120,y:80,w:42,h:18,draw:(x,y)=>`<polygon points="${x},${y} ${x+42},${y} ${x+42},${y+12} ${x+36},${y+18} ${x},${y+18}" class="pt-body"/><rect x="${x+6}" y="${y+5}" width="28" height="5" class="pt-in"/>`,name:"DisplayPort",info:"<b>DisplayPort.</b> Digital video and audio with one corner cut off. Supports high refresh rates and daisy-chaining monitors."},
    {id:"vga",x:200,y:36,w:60,h:26,draw:(x,y)=>`<polygon points="${x},${y} ${x+60},${y} ${x+54},${y+26} ${x+6},${y+26}" class="pt-vga"/>`+[0,1,2].map(r=>[0,1,2,3,4].map(c=>`<circle cx="${x+13+c*8.5-(r===1?0:0)}" cy="${y+6+r*7}" r="1.8" class="pt-pin"/>`).join("")).join(""),name:"VGA",info:"<b>VGA.</b> Analog video, 15 pins in three rows, usually blue. Legacy, but still found on projectors."},
    {id:"dvi",x:200,y:78,w:74,h:24,draw:(x,y)=>`<rect x="${x}" y="${y}" width="74" height="24" rx="3" class="pt-dvi"/>`+[0,1,2].map(r=>[0,1,2,3,4,5,6,7].map(c=>`<rect x="${x+6+c*6}" y="${y+5+r*6}" width="3" height="3" class="pt-pin"/>`).join("")).join("")+`<rect x="${x+58}" y="${y+10}" width="11" height="3" class="pt-pin"/>`,name:"DVI",info:"<b>DVI.</b> Video only. DVI-D is digital, DVI-A is analog, DVI-I carries both. Look for the flat blade on the side."},
    {id:"rj45",x:300,y:36,w:34,h:30,draw:(x,y)=>`<rect x="${x}" y="${y}" width="34" height="30" rx="2" class="pt-body"/><rect x="${x+5}" y="${y+5}" width="24" height="16" class="pt-in"/><rect x="${x+12}" y="${y+21}" width="10" height="5" class="pt-in"/>`,name:"RJ45 Ethernet",info:"<b>RJ45.</b> Wired networking with 8 pins, for twisted pair cable such as Cat 6. Wider than the 4- or 6-pin RJ11 phone jack."},
    {id:"audio",x:300,y:80,w:70,h:22,draw:(x,y)=>[["#4cae4f",0],["#e86fa6",24],["#5aa6e8",48]].map(([c,o])=>`<circle cx="${x+11+o}" cy="${y+11}" r="10" fill="${c}" opacity=".85"/><circle cx="${x+11+o}" cy="${y+11}" r="4" class="pt-in"/>`).join(""),name:"3.5 mm audio",info:"<b>3.5 mm audio jacks.</b> Green is line out for speakers or headphones, pink is microphone in, and blue is line in."},
    {id:"ps2",x:400,y:38,w:28,h:28,draw:(x,y)=>`<circle cx="${x+14}" cy="${y+14}" r="13" fill="#8a6bd1" opacity=".8"/><circle cx="${x+14}" cy="${y+14}" r="6" class="pt-in"/>`,name:"PS/2",info:"<b>PS/2.</b> Legacy round port for keyboards (purple) and mice (green). Not hot-swappable."},
    {id:"esata",x:400,y:82,w:40,h:16,draw:(x,y)=>`<polygon points="${x+4},${y} ${x+36},${y} ${x+40},${y+4} ${x+40},${y+16} ${x},${y+16} ${x},${y+4}" class="pt-body"/><polygon points="${x+6},${y+6} ${x+34},${y+6} ${x+34},${y+12} ${x+6},${y+12}" class="pt-in"/>`,name:"eSATA",info:"<b>eSATA.</b> External SATA for drives, up to 6 Gbps. A flat port with angled top corners, so a USB plug won't fit. Largely replaced by USB-C."}
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Identify the ports on the back of a PC</div>
  <div class="viz-scroll"><svg viewBox="0 0 470 130" style="min-width:420px" role="group" aria-label="PC rear panel">
    <rect x="20" y="20" width="440" height="100" rx="8" class="pt-plate"/>
    ${P.map(p=>`<g class="pt" data-p="${p.id}" tabindex="0" role="button" aria-label="${p.name}">${p.draw(p.x,p.y)}<rect x="${p.x-4}" y="${p.y-4}" width="${p.w+8}" height="${p.h+8}" rx="4" class="pt-hit"/></g>`).join("")}
  </svg></div>
  <div class="caption" aria-live="polite">Click each port to learn what it is. Find all ${P.length} to complete this diagram.</div>
  <div class="viz-controls"><span class="grow">0 of ${P.length} found</span></div>`;
  const svg=$("svg",el),cap=$(".caption",el),cnt=$(".grow",el);
  const pick=id=>{const p=P.find(x=>x.id===id);seen.add(id);svg.querySelectorAll(".pt").forEach(g=>g.classList.toggle("sel",g.dataset.p===id));svg.querySelector(`[data-p="${id}"]`).classList.add("seen");
    cap.innerHTML=p.info;cnt.textContent=`${seen.size} of ${P.length} found`;if(seen.size===P.length)award("viz:panel",20,"Identified every rear port")};
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-p]");if(g)pick(g.dataset.p)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-p]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(g.dataset.p)}});
})();

/* ---- RAM slot configurator ---- */
(function(){
  const el=$("#viz-ram");if(!el)return;
  const slots=["A1","A2","B1","B2"];let fill={A1:false,A2:false,B1:false,B2:false};
  el.innerHTML=`<div class="viz-title">Install RAM for dual-channel</div>
  <div class="ram-board"><div class="ram-cpu">CPU</div><div class="ram-slots"></div></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn" data-r="one">1 stick</button><button class="btn" data-r="bad">2 sticks, same channel</button><button class="btn primary" data-r="good">2 sticks, dual-channel</button><button class="btn" data-r="four">4 sticks</button></div>`;
  function draw(){
    $(".ram-slots",el).innerHTML=slots.map(s=>`<button class="ram-slot ch${s[0]}${fill[s]?" on":""}" data-s="${s}" aria-pressed="${fill[s]}"><span class="ram-stick">${fill[s]?"16 GB":""}</span><b>${s}</b></button>`).join("");
    const a=+fill.A1+ +fill.A2,b=+fill.B1+ +fill.B2,n=a+b,gb=n*16;
    let msg;
    if(!n)msg="Tap a slot to install a 16 GB stick. Slots A1 and A2 share channel A, and B1 and B2 share channel B.";
    else if(!a||!b)msg=`<span class="status-bad">Single-channel, ${gb} GB.</span> All sticks are on one channel, so the CPU reads memory over one 64-bit path. Move a stick to the other channel.`;
    else if(a===b){msg=`<span class="status-good">Dual-channel, ${gb} GB.</span> Both channels have equal memory, so the CPU reads from both at once and memory bandwidth doubles.`;award("viz:ram",20,"Configured dual-channel RAM")}
    else msg=`<span class="status-bad">Flex mode, ${gb} GB.</span> Channels have different amounts. Only the matched part runs dual-channel. Add a stick to balance them.`;
    $(".caption",el).innerHTML=msg;
  }
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),r=e.target.closest("[data-r]")?.dataset.r;
    if(s){fill[s.dataset.s]=!fill[s.dataset.s];draw()}
    if(r){fill={one:{A1:0,A2:1,B1:0,B2:0},bad:{A1:1,A2:1,B1:0,B2:0},good:{A1:0,A2:1,B1:0,B2:1},four:{A1:1,A2:1,B1:1,B2:1}}[r];for(const k in fill)fill[k]=!!fill[k];draw()}});
  draw();
})();

/* ---- Storage speed race ---- */
(function(){
  const el=$("#viz-race");if(!el)return;
  const D=[["7,200 rpm HDD",160],["SATA SSD",550],["NVMe SSD (PCIe 3.0)",3500],["NVMe SSD (PCIe 4.0)",7000]];
  const MB=10240;let raf=null;
  el.innerHTML=`<div class="viz-title">Race four drives copying a 10 GB file</div>
  <div class="race">${D.map(([n,s],i)=>`<div class="race-row"><span class="race-name">${n}<em>~${fmt(s)} MB/s</em></span><div class="race-track"><i id="rb${i}"></i></div><span class="race-time mono" id="rt${i}">—</span></div>`).join("")}</div>
  <div class="caption" aria-live="polite">Typical sequential read speeds. Real results vary by model. Press <b>Start the race</b>. The animation runs 8 times faster than real life.</div>
  <div class="viz-controls"><button class="btn primary" data-a="go">Start the race</button></div>`;
  $('[data-a="go"]',el).onclick=()=>{
    cancelAnimationFrame(raf);const t0=performance.now(),SPEED=8;
    const tick=now=>{if(!el.isConnected)return;const t=(now-t0)/1000*SPEED;let done=true;
      D.forEach(([,s],i)=>{const need=MB/s,p=Math.min(t/need,1);$("#rb"+i).style.width=(p*100)+"%";$("#rt"+i).textContent=p>=1?need.toFixed(1)+" s":(t).toFixed(1)+" s";if(p<1)done=false});
      if(!done&&!REDUCED)raf=requestAnimationFrame(tick);
      else{D.forEach(([,s],i)=>{$("#rb"+i).style.width="100%";$("#rt"+i).textContent=(MB/s).toFixed(1)+" s"});
        $(".caption",el).innerHTML="The HDD needs over a minute. A PCIe 4.0 NVMe drive finishes in about 1.5 seconds, more than 40 times faster.";award("viz:race",20,"Raced the storage drives")}};
    raf=requestAnimationFrame(tick);
  };
})();

/* ---- RAID builder ---- */
(function(){
  const el=$("#viz-raid");if(!el)return;
  const L={0:{min:2,ft:0,cap:n=>n,d:"Striping. Data is split across every drive, so reads and writes are fast. One failure loses everything."},
           1:{min:2,max:2,ft:1,cap:()=>1,d:"Mirroring. Both drives hold identical copies. Half the raw capacity is used for the copy."},
           5:{min:3,ft:1,cap:n=>n-1,d:"Striping with parity spread across all drives. Any one drive can fail, and its data is rebuilt from parity."},
           6:{min:4,ft:2,cap:n=>n-2,d:"Striping with two sets of parity. Any two drives can fail at the same time."},
           10:{min:4,even:true,ft:"1 per pair",cap:n=>n/2,d:"Drives are mirrored in pairs, then the pairs are striped. Fast, and survives one failure in each pair."}};
  let lv=5,n=4,failed=new Set();const SZ=4;
  el.innerHTML=`<div class="viz-title">Build a RAID array, then fail some drives</div>
  <div class="viz-controls"><span>Level:</span>${Object.keys(L).map(k=>`<button class="chip" data-l="${k}">RAID ${k}</button>`).join("")}</div>
  <div class="viz-controls"><span>Drives:</span><button class="btn" data-n="-1" aria-label="Remove a drive">−</button><b class="mono" id="raid-n"></b><button class="btn" data-n="1" aria-label="Add a drive">+</button><span class="grow">Each drive is ${SZ} TB</span></div>
  <div class="raid-drives"></div>
  <div class="sn-grid raid-stats"></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn bad" data-a="fail">Fail a random drive</button><button class="btn" data-a="fix">Replace failed drives</button></div>`;
  function lost(){
    if(lv==0)return failed.size>0;if(lv==1)return failed.size>=2;if(lv==5)return failed.size>1;if(lv==6)return failed.size>2;
    for(let i=0;i<n;i+=2)if(failed.has(i)&&failed.has(i+1))return true;return false;
  }
  function draw(){
    const c=L[lv];
    el.querySelectorAll("[data-l]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l==lv));
    $("#raid-n").textContent=n;
    const dead=lost();
    $(".raid-drives",el).innerHTML=Array.from({length:n},(_,i)=>`<button class="drive${failed.has(i)?" failed":""}${lv==10?(i%2?" pair-b":" pair-a"):""}" data-d="${i}" aria-label="Drive ${i+1}${failed.has(i)?", failed":""}"><span class="led"></span><b>Disk ${i+1}</b><em>${failed.has(i)?"FAILED":lv==0?"stripe":lv==1?"mirror":lv==5?"data + parity":lv==6?"data + 2× parity":"pair "+(Math.floor(i/2)+1)}</em></button>`).join("");
    $(".raid-stats",el).innerHTML=[["Minimum drives",c.min],["Usable capacity",c.cap(n)*SZ+" TB of "+n*SZ],["Survives",typeof c.ft==="number"?c.ft+" failure"+(c.ft===1?"":"s"):c.ft],["Array status",dead?"DATA LOST":failed.size?"Degraded":"Healthy"]].map(([k,v])=>`<div><span>${k}</span><b class="${k==="Array status"?(dead?"status-bad":failed.size?"":"status-good"):""}">${v}</b></div>`).join("");
    $(".caption",el).innerHTML=dead?`<span class="status-bad">The array has failed and its data is gone.</span> ${lv==0?"RAID 0 has no redundancy.":"Too many drives failed for this level."} Restore from backup.`:failed.size?`<span class="status-good">Still running, but degraded.</span> Replace the failed drive so the array can rebuild before another one fails.`:c.d;
  }
  el.addEventListener("click",e=>{
    const l=e.target.closest("[data-l]"),d=e.target.closest("[data-n]"),dr=e.target.closest("[data-d]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(l){lv=+l.dataset.l;const c=L[lv];n=Math.max(c.min,c.max?Math.min(n,c.max):n);if(c.even&&n%2)n++;failed.clear();draw()}
    if(d){const c=L[lv];let m=n+(+d.dataset.n)*(c.even?2:1);m=Math.max(c.min,Math.min(c.max||8,m));n=m;failed.clear();draw()}
    if(dr){const i=+dr.dataset.d;failed.has(i)?failed.delete(i):failed.add(i);draw();award("viz:raid",30,"Stress-tested a RAID array")}
    if(a==="fail"){const ok=[...Array(n).keys()].filter(i=>!failed.has(i));if(ok.length){failed.add(ok[Math.floor(Math.random()*ok.length)]);draw();award("viz:raid",30,"Stress-tested a RAID array")}}
    if(a==="fix"){failed.clear();draw()}
  });
  draw();
})();

/* ---- Motherboard map ---- */
(function(){
  const el=$("#viz-board");if(!el)return;
  const C=[
    ["cpu",230,80,120,120,"CPU socket","<b>CPU socket.</b> Holds the processor. Intel uses LGA (pins in the socket). AMD desktop CPUs now use LGA too. Lift the retention arm, line up the triangle, and never force it."],
    ["dimm",400,60,64,210,"DIMM slots","<b>DIMM slots.</b> Hold RAM sticks. Slots are paired into channels, often color-coded. Open the clips and press the stick straight down until they snap."],
    ["atx",500,120,26,100,"24-pin ATX","<b>24-pin ATX power.</b> Main power from the PSU to the motherboard."],
    ["eps",150,30,56,20,"8-pin EPS","<b>8-pin EPS (4+4).</b> 12 V power for the CPU, placed near the socket. Forgetting it means the PC won't POST."],
    ["fan",280,30,30,12,"CPU fan","<b>CPU fan header.</b> A 4-pin header that powers the cooler fan and lets the board control its speed (PWM)."],
    ["m2",100,240,220,16,"M.2 slot","<b>M.2 slot.</b> For NVMe (or SATA) SSDs that lie flat on the board, held by a small screw. 2280 means 22 mm wide and 80 mm long."],
    ["pcie16",50,290,320,16,"PCIe x16","<b>PCIe x16 slot.</b> The longest slot, for graphics cards. Usually reinforced with metal."],
    ["pcie1",50,330,90,12,"PCIe x1","<b>PCIe x1 slot.</b> A short slot for small cards like Wi-Fi, sound, or an extra NIC."],
    ["pcie16b",50,365,320,16,"PCIe x16 (x4)","<b>Second x16 slot.</b> Full length, but often wired with fewer lanes (x4 or x8). Check the manual."],
    ["chip",400,320,60,60,"Chipset","<b>Chipset.</b> Connects the CPU to slower parts: SATA ports, USB, extra PCIe lanes. Has its own heat sink."],
    ["sata",500,300,30,90,"SATA ports","<b>SATA ports.</b> Data connections for 2.5 and 3.5 inch drives and optical drives. Power comes separately from the PSU."],
    ["cmos",250,420,0,0,"CMOS battery","<b>CMOS battery.</b> A CR2032 coin cell that keeps the clock and firmware settings when the PC is unplugged."],
    ["bios",340,420,34,34,"Firmware chip","<b>Firmware (BIOS/UEFI) chip.</b> Flash memory that holds the UEFI firmware. Updating it is called flashing the BIOS."],
    ["front",420,450,70,14,"Front panel","<b>Front panel header.</b> Small pins for the case power button, reset button and LEDs. Match the labels in the manual."],
    ["usbh",120,450,50,16,"USB header","<b>Internal USB header.</b> Connects the case's front USB ports to the motherboard."],
    ["io",20,40,40,200,"Rear I/O","<b>Rear I/O panel.</b> The ports on the back of the PC, such as USB, video, network and audio."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Explore an ATX motherboard</div>
  <div class="viz-scroll"><svg viewBox="0 0 560 490" style="min-width:440px" role="group" aria-label="ATX motherboard">
    <rect x="10" y="10" width="540" height="470" rx="10" class="mb-pcb"/>
    ${C.map(([id,x,y,w,h,name])=>`<g class="m-node mb" data-c="${id}" tabindex="0" role="button" aria-label="${name}">${id==="cmos"?`<circle cx="${x}" cy="${y+20}" r="22"/>`:id==="dimm"?[0,1,2,3].map(i=>`<rect x="${x+i*16}" y="${y}" width="10" height="${h}" rx="2"/>`).join(""):id==="sata"?[0,1,2,3].map(i=>`<rect x="${x}" y="${y+i*23}" width="${w}" height="17" rx="2"/>`).join(""):`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`}
      <text x="${id==="cmos"?x:id==="io"?x+20:x+w/2}" y="${id==="cmos"?y+24:id==="io"?y+h/2:y+h/2+4}" text-anchor="middle" class="s-small mb-label" ${id==="io"?`transform="rotate(-90 ${x+20} ${y+h/2})"`:""}>${["pcie1","front","usbh","fan","eps"].includes(id)?"":name}</text></g>`).join("")}
  </svg></div>
  <div class="caption" aria-live="polite">Click any part of the board. Find ${C.length} parts to complete this diagram.</div>
  <div class="viz-controls"><span class="grow">0 of ${C.length} found</span></div>`;
  const svg=$("svg",el);
  const pick=id=>{const c=C.find(x=>x[0]===id);seen.add(id);svg.querySelectorAll(".mb").forEach(g=>g.classList.toggle("sel",g.dataset.c===id));svg.querySelector(`[data-c="${id}"]`).classList.add("on");
    $(".caption",el).innerHTML=c[6];$(".grow",el).textContent=`${seen.size} of ${C.length} found`;if(seen.size===C.length)award("viz:board",30,"Mapped the whole motherboard")};
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-c]");if(g)pick(g.dataset.c)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-c]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(g.dataset.c)}});
})();

/* ---- PSU wattage planner ---- */
(function(){
  const el=$("#viz-psu");if(!el)return;
  const O={cpu:[["65 W office CPU",65],["125 W gaming CPU",125],["170 W workstation CPU",170]],gpu:[["Integrated graphics",0],["Mid-range GPU (200 W)",200],["High-end GPU (350 W)",350]]};
  const s={cpu:0,gpu:1,drives:2,fans:3};
  el.innerHTML=`<div class="viz-title">Size a power supply for a build</div>
  <div class="psu-form">
    <label class="rf"><span>Processor</span><select id="psu-cpu" data-k="cpu">${O.cpu.map((o,i)=>`<option value="${i}">${o[0]}</option>`).join("")}</select></label>
    <label class="rf"><span>Graphics</span><select id="psu-gpu" data-k="gpu">${O.gpu.map((o,i)=>`<option value="${i}" ${i===1?"selected":""}>${o[0]}</option>`).join("")}</select></label>
    <label class="rf"><span>Drives (10 W each)</span><input type="range" id="psu-drives" data-k="drives" min="1" max="8" value="2"></label>
    <label class="rf"><span>Case fans (3 W each)</span><input type="range" id="psu-fans" data-k="fans" min="0" max="8" value="3"></label>
  </div>
  <div class="psu-meter"><div class="psu-load"></div></div>
  <div class="sn-grid psu-out"></div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(){
    const cpu=O.cpu[s.cpu][1],gpu=O.gpu[s.gpu][1],base=60,total=cpu+gpu+base+s.drives*10+s.fans*3,rec=Math.ceil(total*1.4/50)*50;
    $(".psu-load",el).style.width=(total/rec*100)+"%";
    $(".psu-out",el).innerHTML=[["Estimated draw",total+" W"],["Recommended PSU",rec+" W"],["Load at peak",Math.round(total/rec*100)+"%"],["GPU power cables",gpu===0?"None":gpu===200?"1× 8-pin PCIe":"2–3× 8-pin or 1× 16-pin"],["SATA power plugs",s.drives],["Always needed","24-pin ATX + 8-pin EPS"]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");
    $(".caption",el).innerHTML=`The estimate includes about 60 W for the motherboard, RAM and USB devices. Sizing the PSU about 40% above peak draw keeps it in its most efficient range and leaves room for upgrades. The graphics card is the biggest swing factor.`;
  }
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;s[k]=+e.target.value;draw();award("viz:psu",20,"Planned a power budget")});
  draw();
})();

/* ---- Laser printer process ---- */
(function(){
  const el=$("#viz-laser");if(!el)return;
  const ST=[
    ["proc","Processing","The printer's formatter turns the page into a bitmap (raster image) of dots and stores it in memory."],
    ["charge","Charging","The primary charge roller (or corona wire) puts a uniform negative charge across the whole drum surface."],
    ["expose","Exposing","The laser scans across the drum. Wherever it hits, the charge is neutralized, drawing the image as a pattern of charges."],
    ["develop","Developing","The developer roller brings charged toner to the drum. Toner sticks only to the areas the laser exposed."],
    ["transfer","Transferring","The transfer roller gives the paper a positive charge, which pulls the toner off the drum and onto the paper."],
    ["fuse","Fusing","Heated fuser rollers melt the toner and press it into the paper. Pages come out warm."],
    ["clean","Cleaning","A rubber blade wipes leftover toner off the drum, and an erase lamp removes leftover charge, ready for the next page."]
  ];
  let step=-1;
  const P={proc:[70,60],charge:[160,92],expose:[290,40],develop:[430,160],transfer:[290,262],fuse:[470,212],clean:[150,170]};
  el.innerHTML=`<div class="viz-title">Step through the laser printing process</div>
  <div class="viz-scroll"><svg viewBox="0 0 560 320" style="min-width:440px" role="img" aria-label="Laser printer imaging process">
    <line x1="130" y1="262" x2="540" y2="262" class="paper"/>
    <text x="140" y="290" class="s-small">paper path →</text>
    <circle cx="290" cy="160" r="72" class="drum"/><text x="290" y="165" text-anchor="middle" class="s-b">Drum</text>
    <path d="M330,96 A72,72 0 0 1 356,128" class="spin"/><polygon points="356,128 348,116 362,118" class="spin-h"/>
    <line x1="290" y1="40" x2="290" y2="88" class="beam"/>
    <circle cx="470" cy="245" r="14" class="fuser"/><circle cx="470" cy="279" r="14" class="fuser"/>
    ${ST.map(([id,name])=>{const [x,y]=P[id];return `<g class="station" data-st="${id}"><rect x="${x-50}" y="${y-15}" width="100" height="30" rx="7"/><text x="${x}" y="${y+5}" text-anchor="middle" style="font-size:12.5px">${name}</text></g>`}).join("")}
  </svg></div>
  <div class="caption" aria-live="polite">The drum turns clockwise. Press <b>Next step</b> to follow one page through the printer.</div>
  <div class="viz-controls"><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next step</button><span class="grow">Step 0 of 7</span></div>`;
  function draw(){
    el.querySelectorAll(".station").forEach((g,i)=>{g.classList.toggle("on",i===step);g.classList.toggle("done",i<step)});
    $(".beam",el).classList.toggle("on",step===2);
    $(".caption",el).innerHTML=step<0?"The drum turns clockwise. Press <b>Next step</b> to follow one page through the printer.":`<b>${step+1}. ${ST[step][1]}.</b> ${ST[step][2]}`;
    $(".grow",el).textContent=`Step ${step+1} of 7`;
    $('[data-a="back"]',el).disabled=step<0;$('[data-a="next"]',el).disabled=step>=6;
    if(step===6)award("viz:laser",30,"Followed the laser printing process");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next")step=Math.min(step+1,6);if(a==="back")step=Math.max(step-1,-1);if(a)draw()});
  draw();
})();
  },
  sims:[
    {id:"build",type:"match",title:"Assemble a workstation",
      scenario:"You're building a PC for a video editor. Match each part to where it connects on the motherboard or power supply. Tap a part, then tap its connection.",
      items:[["Graphics card","pcie16"],["NVMe SSD","m2"],["2.5-inch SATA SSD","sata"],["32 GB DDR5 stick","dimm"],["Motherboard power","atx"],["CPU power","eps"],["Case power button","front"],["Wi-Fi card","pcie1"]],
      slots:[["pcie16","PCIe x16 slot","Full-length expansion slot"],["m2","M.2 slot","Flat slot with a standoff screw"],["sata","SATA data port","Small L-shaped connector"],["dimm","DIMM slot","Long slot with clips at each end"],["atx","24-pin ATX","Largest PSU connector"],["eps","8-pin EPS","Near the CPU socket"],["front","Front panel header","Small pins for case buttons"],["pcie1","PCIe x1 slot","Short expansion slot"]],
      success:"The workstation powers on and POSTs on the first try."},
    {id:"laser",type:"order",title:"Put the laser printing process in order",
      scenario:"A junior tech is studying for the exam and has the laser printing steps scrambled. Tap the seven steps in the order they happen.",
      steps:["Processing","Charging","Exposing","Developing","Transferring","Fusing","Cleaning"],
      success:"That's the order CompTIA tests."},
    {id:"raidpick",type:"match",title:"Choose the right RAID level",
      scenario:"Four clients need storage. Match each requirement to the RAID level that fits best. Tap a RAID level, then tap the requirement.",
      items:[["RAID 0","speed"],["RAID 1","mirror"],["RAID 5","parity"],["RAID 6","double"]],
      slots:[["speed","Video scratch disk","Maximum speed, data can be recreated"],["mirror","Small office PC, 2 drives","Exact copy of the system drive"],["parity","File server, 4 drives","Most capacity while surviving 1 failure"],["double","Archive server, 8 drives","Must survive 2 failures at once"]],
      success:"Each client gets the right balance of speed, capacity and protection."}
  ],
  badges:[
    ["reader","BT","Bench Tech","Mark all 7 hardware lessons studied",c=>c.allStudied()],
    ["lab","TD","Teardown","Complete all 7 hardware diagrams",c=>c.vizAll()],
    ["build","SB","System Builder","Pass the workstation assembly simulation",c=>c.passed("build")],
    ["toner","TT","Toner Tamer","Pass the laser printing simulation",c=>c.passed("laser")],
    ["raid","PR","Parity Pro","Pass the RAID simulation",c=>c.passed("raidpick")],
    ["cables","CC","Cable Connoisseur","Get every cables and ports card to Familiar or higher",c=>c.deckAtLeast("cables",2)],
    ["perfect","PP","Perfect POST","Score 100% on a hardware quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
