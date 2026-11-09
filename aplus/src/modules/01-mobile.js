/* ================= Module 1: Mobile Devices (Core 1, 220-1201) ================= */
(function(){
const LESSONS=[
{id:"laptop",num:"1.1",title:"Laptop hardware",short:"Laptop hardware",html:`
<p>Laptops pack desktop parts into a tight space. Many parts can still be replaced, but some (often RAM and storage on thin models) are soldered to the board.</p>
<div class="viz" id="viz-teardown"></div>
<h3>Replaceable parts</h3>
<ul><li><b>Battery</b>: lithium-ion. Internal batteries are disconnected from the board before any other work. A <b>swollen</b> battery is a fire risk: stop using it and recycle it properly.</li>
<li><b>RAM</b>: SODIMM sticks, or soldered on thin models.</li>
<li><b>Storage</b>: an M.2 SSD, or a 2.5-inch drive on older models.</li>
<li><b>Wireless card</b>: a small M.2 card with two thin antenna wires that run up into the display.</li>
<li><b>Keyboard and touchpad</b>: often part of the top case.</li></ul>
<h3>Physical security and privacy</h3>
<ul><li><b>Biometrics</b>: fingerprint readers and facial recognition (such as Windows Hello).</li>
<li><b>Cable lock</b> slot, a <b>webcam privacy shutter</b>, and a <b>privacy screen</b> filter that narrows the viewing angle.</li>
<li><b>NFC</b> readers for badge or payment authentication on some business laptops.</li></ul>
<div class="tip"><b>Disassembly habits.</b> Use the service manual, wear an ESD strap, and keep screws organized on a labeled mat, because laptop screws come in many lengths.</div>`},
{id:"display",num:"1.2",title:"Mobile display components",short:"Displays",html:`
<div class="viz" id="viz-display"></div>
<h3>What lives in the display lid</h3>
<ul><li><b>Wi-Fi antennas</b> run up through the hinge into the bezel, as high as possible for better reception.</li>
<li><b>Webcam and microphone</b> sit in the top bezel.</li>
<li><b>Digitizer</b>: the touch-sensitive layer on touchscreens. It turns taps and pen strokes into input and may need calibrating.</li>
<li><b>Inverter</b>: older laptops with <b>CCFL</b> backlights need an inverter to power the lamp. LED backlights don't. A dim image that is visible with a flashlight points to a failed backlight or inverter.</li></ul>`},
{id:"accessories",num:"1.3",title:"Accessories and ports",short:"Accessories and ports",html:`
<div class="viz" id="viz-mports"></div>
<h3>Accessories</h3>
<ul><li><b>Docking station</b>: one connection gives a laptop power, monitors, network and USB devices, and may add expansion.</li>
<li><b>Port replicator</b>: a simpler device that only copies the laptop's ports.</li>
<li><b>Touch pens (styluses)</b>, headsets, speakers, external webcams, trackpads and drawing pads.</li></ul>
<h3>Wireless connections</h3>
<div class="viz" id="viz-range"></div>
<p>To pair a Bluetooth device, follow the steps CompTIA expects:</p>
<div class="viz" id="viz-pair"></div>`},
{id:"connect",num:"1.4",title:"Network connectivity and app support",short:"Connectivity and MDM",html:`
<h3>Cellular and Wi-Fi</h3>
<ul><li><b>4G and 5G</b> cellular data. <b>Airplane mode</b> turns off every radio at once.</li>
<li><b>Hotspot</b>: the phone shares its cellular data over Wi-Fi. <b>Tethering</b> shares it over a USB cable or Bluetooth.</li>
<li><b>SIM</b> cards identify the subscriber (IMSI). An <b>eSIM</b> is built in and programmed remotely, so one phone can hold several lines. The <b>IMEI</b> identifies the phone hardware itself.</li></ul>
<h3>Location services</h3>
<p><b>GPS</b> uses satellites and works anywhere outdoors. Phones also estimate location from cell towers and nearby Wi-Fi, which works indoors. Apps ask permission to use location.</p>
<h3>Mobile device management</h3>
<p>Companies use <b>MDM</b> to manage the whole device: push Wi-Fi, email and VPN settings, require a passcode and encryption, and wipe a lost phone. <b>MAM</b> manages only the company's apps and data, which suits personal phones (BYOD).</p>
<div class="viz" id="viz-mdm"></div>
<h3>Syncing and corporate email</h3>
<ul><li>Email, contacts and calendars sync through an account such as Microsoft 365 (Exchange ActiveSync) or Google Workspace.</li>
<li>Manual email setup needs the server address, the port, the security type (SSL/TLS), and the username.</li>
<li><b>Two-factor authentication</b> adds a code from an authenticator app, a text message, or a hardware key.</li></ul>`}
];

const CARDS=[
 ...[["Laptop RAM form factor","SODIMM, or soldered to the board"],["Where laptop Wi-Fi antennas run","Through the hinge into the display bezel"],["Swollen laptop battery","Stop using it, power down, and recycle it safely. Fire risk."],
     ["First step inside a laptop with an internal battery","Disconnect the battery from the motherboard"],["Privacy screen","A filter that narrows the viewing angle so others can't read the display"],["Windows Hello","Biometric sign-in with face or fingerprint"]].map((c,i)=>({deck:"laptop",id:"ml"+i,q:c[0],a:c[1]})),
 ...[["IPS panel","Best color accuracy and viewing angles among LCDs"],["TN panel","Fast response, cheap, poor viewing angles"],["VA panel","High contrast, deep blacks for an LCD"],["OLED","Each pixel makes its own light. True blacks, no backlight, burn-in risk."],
     ["Mini-LED","An LCD with thousands of tiny backlight LEDs for local dimming"],["Digitizer","The touch-sensitive layer that turns touch or pen into input"],["Needs an inverter","CCFL backlights (older laptops)"],["Dim image, visible with a flashlight","Failed backlight or inverter"]].map((c,i)=>({deck:"display",id:"md"+i,q:c[0],a:c[1]})),
 ...[["Apple's older 8-pin phone connector","Lightning"],["Small trapezoid phone connector","Micro-USB"],["Docking station vs port replicator","A dock adds power, monitors and expansion. A port replicator only copies ports."],
     ["NFC range","About 4 cm"],["Typical Bluetooth range","About 10 m"],["Bluetooth pairing steps","Enable Bluetooth, make discoverable, select the device, enter or confirm the PIN, test"]].map((c,i)=>({deck:"ports",id:"mp"+i,q:c[0],a:c[1]})),
 ...[["Hotspot","Sharing cellular data over Wi-Fi"],["Tethering","Sharing cellular data over USB or Bluetooth"],["eSIM","An embedded SIM programmed remotely. Supports multiple lines."],["IMEI","Identifies the phone hardware"],["IMSI","Identifies the subscriber, stored on the SIM"],
     ["Airplane mode","Turns off all radios: cellular, Wi-Fi and Bluetooth"],["MDM","Manages the whole device: policies, apps, remote wipe"],["MAM","Manages only corporate apps and data. Good for BYOD."],["BYOD","Bring your own device: staff use personal phones for work"],
     ["Remote wipe","Erases a lost or stolen device's data over the network"],["Manual email setup needs","Server address, port, security type (SSL/TLS), username"],["GPS vs cell location","GPS uses satellites (outdoors). Cell and Wi-Fi location also work indoors."],
     ["Corporate email protocol on phones","Exchange ActiveSync (Microsoft 365)"],["Two-factor authentication","Something you know plus a code from something you have, such as an authenticator app"]].map((c,i)=>({deck:"connect",id:"mc"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"A technician is replacing a laptop's SSD. What should be done first after powering off and unplugging it?",o:["Remove the keyboard","Disconnect the internal battery","Remove the display","Update the BIOS"],a:1,e:"Disconnecting the battery prevents shorts and damage while you work inside."},
 {q:"A laptop's battery has bulged and lifted the touchpad. What should the technician do?",o:["Press it flat and keep using it","Charge it fully to stabilize it","Stop using it and recycle it safely","Puncture it to release the gas"],a:2,e:"Swollen lithium-ion batteries can catch fire. Power down, remove it carefully and recycle it."},
 {q:"Which memory form factor do most upgradable laptops use?",o:["DIMM","SODIMM","ECC DIMM","RIMM"],a:1,e:"SODIMM is the small-outline module for laptops and small PCs."},
 {q:"After a screen replacement, a laptop's Wi-Fi is very weak. What was most likely missed?",o:["The inverter","The Wi-Fi antenna leads","The webcam cable","The CMOS battery"],a:1,e:"Wi-Fi antennas run through the hinge into the display. Unplugged or pinched leads weaken the signal."},
 {q:"A user needs to stop people next to them on a plane from reading their screen. What should they use?",o:["Webcam shutter","Privacy screen filter","Cable lock","Biometric login"],a:1,e:"A privacy filter narrows the viewing angle so only the person in front can see clearly."},
 {q:"Which display technology has no backlight because each pixel produces its own light?",o:["IPS","TN","OLED","Mini-LED"],a:2,e:"OLED pixels are self-emissive, which gives true blacks."},
 {q:"A graphic designer needs the most accurate colors on an LCD laptop. Which panel type should they choose?",o:["TN","IPS","VA","CCFL"],a:1,e:"IPS panels have the best color accuracy and viewing angles among LCDs."},
 {q:"A laptop screen is very dim, but the image can be seen with a flashlight. What is the likely problem?",o:["Bad digitizer","Failed backlight or inverter","Wrong resolution","Bad GPU driver"],a:1,e:"The LCD is still drawing the image, but nothing lights it from behind."},
 {q:"Taps on a tablet's touchscreen register in the wrong place. What should be tried first?",o:["Replace the LCD","Calibrate the digitizer","Replace the battery","Reinstall the OS"],a:1,e:"The digitizer maps touches to screen positions. Calibrating it often fixes offsets."},
 {q:"Which component do older CCFL-backlit laptop screens need that LED-backlit screens don't?",o:["Digitizer","Inverter","Antenna","Webcam"],a:1,e:"CCFL lamps need an inverter to convert DC to the AC that drives the lamp."},
 {q:"Which display type is most at risk of burn-in from static images?",o:["IPS","TN","OLED","VA"],a:2,e:"OLED pixels age with use, so static elements can leave a ghost image."},
 {q:"A user wants one cable that connects their laptop to power, two monitors, Ethernet and a keyboard. What should they buy?",o:["Port replicator","Docking station","USB hub","KVM switch"],a:1,e:"A docking station provides power, displays, network and USB through a single connection."},
 {q:"Which connector is reversible and is now used on most new phones and laptops?",o:["Micro-USB","Mini-USB","USB-C","Lightning"],a:2,e:"USB-C is reversible and carries data, video and power. Even iPhones moved to it."},
 {q:"A customer pays by tapping a phone on a card reader. Which technology is used?",o:["Bluetooth","NFC","Wi-Fi Direct","Infrared"],a:1,e:"NFC works at a few centimeters, which suits tap-to-pay."},
 {q:"What is the correct first step when pairing a Bluetooth headset?",o:["Enter the PIN","Enable Bluetooth on both devices","Test connectivity","Select the device"],a:1,e:"Pairing starts with Bluetooth enabled and the accessory in pairing (discoverable) mode."},
 {q:"What is the last step of the Bluetooth pairing process?",o:["Enable pairing","Select the device","Enter the PIN","Test connectivity"],a:3,e:"After pairing, confirm the device actually works, for example by playing audio."},
 {q:"A traveler needs to get a laptop online using their phone's cellular plan over Wi-Fi. What feature is this?",o:["Tethering","Hotspot","Airplane mode","NFC"],a:1,e:"A mobile hotspot shares cellular data over Wi-Fi. Tethering does it over USB or Bluetooth."},
 {q:"Which feature shares a phone's cellular connection with a laptop over a USB cable?",o:["Hotspot","Tethering","eSIM","Location services"],a:1,e:"Tethering uses a cable or Bluetooth. A hotspot uses Wi-Fi."},
 {q:"An employee wants a personal and a business phone number on one phone without a second physical card. What allows this?",o:["eSIM","IMEI","NFC","MAM"],a:0,e:"An eSIM can hold multiple carrier profiles alongside or instead of a physical SIM."},
 {q:"Which number identifies the phone hardware itself, even if the SIM is changed?",o:["IMSI","IMEI","ICCID","MAC"],a:1,e:"The IMEI identifies the device. The IMSI on the SIM identifies the subscriber."},
 {q:"A flight attendant asks passengers to disable all wireless radios at once. Which setting does that?",o:["Do Not Disturb","Airplane mode","Battery saver","Location off"],a:1,e:"Airplane mode turns off cellular, Wi-Fi and Bluetooth together (Wi-Fi and Bluetooth can be re-enabled)."},
 {q:"A company wants to push Wi-Fi settings, require passcodes and remotely wipe company phones. What should it use?",o:["MAM","MDM","VPN","SSO"],a:1,e:"Mobile device management controls the whole device, including policies and remote wipe."},
 {q:"Staff use personal phones and object to the company controlling their whole device. What fits best?",o:["MDM with full wipe","MAM","Disable BYOD","Airplane mode"],a:1,e:"MAM manages only corporate apps and data, so a wipe removes company data and leaves personal data alone."},
 {q:"A user's company phone was stolen. What should IT do immediately?",o:["Change the SSID","Remote wipe it through MDM","Disable Bluetooth","Order a new SIM only"],a:1,e:"A remote wipe protects company data on the stolen device."},
 {q:"Which information is needed to set up corporate email manually on a phone?",o:["IMEI and IMSI","Server address, port and security type","MAC address and SSID","GPS coordinates"],a:1,e:"Manual setup needs the mail server, port, SSL/TLS setting and the user's credentials."},
 {q:"A user's contacts and calendar on a new phone should match their Microsoft 365 account. What should be configured?",o:["Bluetooth sync","The work account (Exchange ActiveSync)","NFC","A hotspot"],a:1,e:"Adding the Microsoft 365 work account syncs email, contacts and calendar."},
 {q:"A delivery app shows the driver's location accurately on the highway but poorly inside a warehouse. Why?",o:["GPS needs a clear view of satellites","Bluetooth is off","The phone has no eSIM","NFC is disabled"],a:0,e:"GPS works best outdoors. Indoors, phones rely on less precise Wi-Fi and cell location."},
 {q:"After entering a password, a user must also enter a code from an app on their phone. What is this?",o:["Single sign-on","Two-factor authentication","Biometrics","MAM"],a:1,e:"Something you know (password) plus something you have (phone app) is two-factor authentication."},
 {q:"Which is a biometric authentication method on a laptop?",o:["PIN","Smart card","Fingerprint reader","Cable lock"],a:2,e:"Fingerprint and facial recognition are biometric factors."},
 {q:"What is typically the maximum range of NFC?",o:["About 4 cm","About 1 m","About 10 m","About 100 m"],a:0,e:"NFC works at a few centimeters, which helps prevent accidental or remote reads."},
 {q:"Which component in a laptop display assembly is usually in the top bezel?",o:["Inverter","Webcam and microphone","Hard drive","Battery"],a:1,e:"The webcam and microphones sit in the top bezel, with the Wi-Fi antennas."},
 {q:"A laptop owner wants to add a second internal SSD. The board has an empty M.2 slot. What else should be checked?",o:["Whether the slot supports NVMe or SATA","The inverter voltage","The SIM type","The display panel type"],a:0,e:"M.2 slots can support NVMe, SATA or both. The drive must match the slot."},
 {q:"A thin laptop has 8 GB of RAM and the user wants 16 GB. There are no SODIMM slots. What is the likely reason?",o:["The RAM is soldered to the motherboard","The BIOS is locked","The battery is too small","It uses DDR2"],a:0,e:"Many thin laptops solder RAM to the board, so it can't be upgraded."},
 {q:"Which accessory lets a user write notes directly on a tablet screen?",o:["Trackpad","Stylus","Webcam","Port replicator"],a:1,e:"A stylus (touch pen) works with the digitizer for handwriting and drawing."},
 {q:"Which wireless technology has the longest range?",o:["NFC","Bluetooth","Wi-Fi","Cellular"],a:3,e:"Cell towers cover kilometers. Wi-Fi covers tens of meters, Bluetooth about 10 m, and NFC centimeters."},
 {q:"A Bluetooth mouse disconnects often when the user is across the room. What is the most likely cause?",o:["It's beyond the typical 10 m range or blocked","NFC is off","The eSIM is inactive","The digitizer needs calibration"],a:0,e:"Common Bluetooth devices reach about 10 m, and walls or bodies shorten that."},
 {q:"Why do technicians organize laptop screws by location during disassembly?",o:["Screws are magnetic","Screws come in different lengths, and the wrong one can damage parts","It speeds up the CPU","CompTIA requires color coding"],a:1,e:"A long screw in a short hole can puncture the board or battery."},
 {q:"Which MDM policy protects data if a phone is lost and someone removes its storage?",o:["Require device encryption","Enable Bluetooth","Allow unknown apps","Disable updates"],a:0,e:"Encryption makes stored data unreadable without the passcode or key."},
 {q:"Which should be disabled on a company phone to block apps from outside the official store?",o:["Location services","Install from unknown sources","Airplane mode","NFC"],a:1,e:"Blocking unknown sources (sideloading) keeps out unvetted, possibly malicious apps."},
 {q:"A user's phone runs out of storage. Which setting moves photos off the device but keeps them available?",o:["Factory reset","Cloud photo sync with optimize storage","Airplane mode","Clearing the IMEI"],a:1,e:"Cloud sync stores originals online and keeps smaller copies on the phone."}
];

registerModule({
  id:"mob",slug:"mobile-devices",title:"Mobile Devices",
  lessons:LESSONS,
  decks:[["laptop","Laptops"],["display","Displays"],["ports","Ports and wireless"],["connect","Connectivity and MDM"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["teardown","display","mports","range","viz-pair","viz-mdm"],
  viz(){
/* ---- Laptop teardown ---- */
(function(){
  const el=$("#viz-teardown");if(!el)return;
  const P=[
    ["bat",40,150,245,90,"Battery","Internal lithium-ion battery","<b>Battery.</b> Disconnect its cable from the board before touching anything else. Replace it if it swells or holds little charge."],
    ["ram",300,40,130,44,"SODIMM RAM","Upgradable","<b>SODIMM slot.</b> Laptop RAM. Release the side clips and the stick pops up at an angle. Thin laptops often solder RAM instead."],
    ["ssd",300,96,130,26,"M.2 SSD","NVMe or SATA","<b>M.2 SSD.</b> Held by one small screw at the end. Check whether the slot supports NVMe, SATA or both."],
    ["wifi",445,40,100,44,"Wi-Fi card","Two antenna leads","<b>Wi-Fi card.</b> An M.2 card with two tiny antenna leads (often black and white) that run up into the display. Note which goes where."],
    ["fan",40,40,120,90,"Fan and heat sink","Cooling","<b>Fan and heat pipe.</b> Moves heat from the CPU and GPU out of the vents. Clean dust out with compressed air. Replace paste when the heat sink is removed."],
    ["cpu",175,40,110,90,"CPU and GPU","Soldered","<b>CPU and GPU.</b> Almost always soldered (BGA) in laptops, so they can't be swapped. Overheating shows up as fan noise and throttling."],
    ["cmos",445,96,100,40,"CMOS battery","Coin cell","<b>CMOS/RTC battery.</b> Keeps the clock and firmware settings. Sometimes a coin cell on a short cable."],
    ["spk",300,150,245,40,"Speakers","Bottom corners","<b>Speakers.</b> Usually in the bottom corners, connected by a small cable."],
    ["kb",300,205,245,35,"Keyboard ribbon","Top case","<b>Keyboard and touchpad.</b> Connect with flat ribbon cables. Lift the connector latch before pulling a ribbon out."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Take the bottom cover off a laptop</div>
  <div class="viz-scroll"><svg viewBox="0 0 585 280" style="min-width:440px" role="group" aria-label="Inside a laptop">
    <rect x="20" y="20" width="545" height="240" rx="18" class="lt-case"/>
    ${P.map(([id,x,y,w,h,name,sub])=>`<g class="m-node mb" data-c="${id}" tabindex="0" role="button" aria-label="${name}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/><text x="${x+w/2}" y="${y+h/2+(h>34?-2:4)}" text-anchor="middle" class="s-b" style="font-size:12px">${name}</text>${h>34?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" class="s-small" style="font-size:10px">${sub}</text>`:""}</g>`).join("")}
  </svg></div>
  <div class="caption" aria-live="polite">Click each part. Find all ${P.length} to complete this diagram.</div>
  <div class="viz-controls"><span class="grow">0 of ${P.length} found</span></div>`;
  const svg=$("svg",el);
  const pick=id=>{const p=P.find(x=>x[0]===id);seen.add(id);svg.querySelectorAll(".mb").forEach(g=>g.classList.toggle("sel",g.dataset.c===id));svg.querySelector(`[data-c="${id}"]`).classList.add("on");
    $(".caption",el).innerHTML=p[7];$(".grow",el).textContent=`${seen.size} of ${P.length} found`;if(seen.size===P.length)award("viz:teardown",30,"Explored a laptop teardown")};
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-c]");if(g)pick(g.dataset.c)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-c]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(g.dataset.c)}});
})();

/* ---- Display technology layers ---- */
(function(){
  const el=$("#viz-display");if(!el)return;
  const T={
    lcd:{name:"LCD (IPS, TN, VA)",layers:[["Glass and touch digitizer","#7d8bb0"],["Color filter","#a495ff"],["Liquid crystal","#56e0ff"],["Polarizer","#8f9bbb"],["LED backlight (always on)","#ffd27a"]],black:"gray",
      note:"A white LED backlight shines through liquid crystals that twist to block or pass light. Black pixels still leak a little backlight, so blacks look dark gray. <b>IPS</b> has the best color and angles, <b>TN</b> is fastest and cheapest, and <b>VA</b> has the best contrast."},
    mini:{name:"Mini-LED",layers:[["Glass and touch digitizer","#7d8bb0"],["Color filter","#a495ff"],["Liquid crystal","#56e0ff"],["Polarizer","#8f9bbb"],["Thousands of dimming zones","#ffd27a"]],black:"zones",
      note:"Still an LCD, but the backlight is split into thousands of zones that dim separately. Blacks get much deeper, with slight glow (blooming) around bright objects."},
    oled:{name:"OLED",layers:[["Glass and touch digitizer","#7d8bb0"],["Encapsulation","#8f9bbb"],["Self-lit organic pixels","#5fe3a1"],["Substrate","#4a5675"]],black:"off",
      note:"No backlight at all: each pixel makes its own light and turns fully off for black. Thin, true blacks and great contrast, but static images can cause <b>burn-in</b>."}
  };
  const seen=new Set();let cur="lcd";
  el.innerHTML=`<div class="viz-title">Compare display technologies layer by layer</div>
  <div class="viz-controls">${Object.entries(T).map(([k,t])=>`<button class="chip" data-t="${k}">${t.name}</button>`).join("")}</div>
  <div class="disp"><div class="disp-stack"></div><div class="disp-demo"><div class="disp-screen"><span class="moon"></span></div><em>A white moon on a black sky</em></div></div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(){
    const t=T[cur];seen.add(cur);
    el.querySelectorAll("[data-t]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===cur));
    $(".disp-stack",el).innerHTML=t.layers.map(([n,c],i)=>`<div class="layer" style="--c:${c};--i:${i}"><span>${n}</span></div>`).join("");
    $(".disp-screen",el).className="disp-screen black-"+t.black;
    $(".caption",el).innerHTML=t.note;
    if(seen.size===3)award("viz:display",20,"Compared display technologies");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(b){cur=b.dataset.t;draw()}});
  draw();
})();

/* ---- Mobile connectors ---- */
(function(){
  const el=$("#viz-mports");if(!el)return;
  const P=[
    ["usbc","USB-C",(x,y)=>`<rect x="${x}" y="${y}" width="70" height="26" rx="13" class="pt-body"/><rect x="${x+14}" y="${y+10}" width="42" height="6" rx="3" class="pt-in"/>`,"<b>USB-C.</b> Oval and reversible. The standard on new phones (including iPhone since the iPhone 15), tablets and laptops. Carries data, video and fast charging."],
    ["light","Lightning",(x,y)=>`<rect x="${x}" y="${y}" width="56" height="20" rx="10" class="pt-body"/><rect x="${x+8}" y="${y+7}" width="40" height="6" rx="3" class="pt-in"/>`,"<b>Lightning.</b> Apple's older 8-pin reversible connector, on iPhones up to the iPhone 14 and older iPads."],
    ["micro","Micro-USB",(x,y)=>`<polygon points="${x},${y} ${x+60},${y} ${x+52},${y+18} ${x+8},${y+18}" class="pt-body"/><rect x="${x+12}" y="${y+6}" width="36" height="5" class="pt-in"/>`,"<b>Micro-USB.</b> A small trapezoid that only fits one way. Common on older Android phones and cheap accessories."],
    ["mini","Mini-USB",(x,y)=>`<polygon points="${x},${y} ${x+56},${y} ${x+56},${y+14} ${x+48},${y+24} ${x+8},${y+24} ${x},${y+14}" class="pt-body"/><rect x="${x+10}" y="${y+8}" width="36" height="6" class="pt-in"/>`,"<b>Mini-USB.</b> Older and chunkier than micro-USB. Found on old cameras, GPS units and game controllers."]
  ];
  const seen=new Set();
  el.innerHTML=`<div class="viz-title">Name that mobile connector</div>
  <div class="viz-scroll"><svg viewBox="0 0 440 90" style="min-width:380px" role="group" aria-label="Mobile connectors">
    ${P.map(([id,n,d],i)=>`<g class="pt" data-p="${id}" tabindex="0" role="button" aria-label="${n}">${d(20+i*108,24)}<rect x="${14+i*108}" y="16" width="${id==="usbc"?82:70}" height="44" rx="6" class="pt-hit"/><text x="${50+i*108}" y="80" text-anchor="middle" class="s-small">${n}</text></g>`).join("")}
  </svg></div>
  <div class="caption" aria-live="polite">Click each connector to learn where you'll see it.</div>`;
  const svg=$("svg",el);
  const pick=id=>{const p=P.find(x=>x[0]===id);seen.add(id);svg.querySelectorAll(".pt").forEach(g=>g.classList.toggle("sel",g.dataset.p===id));svg.querySelector(`[data-p="${id}"]`).classList.add("seen");$(".caption",el).innerHTML=p[3];if(seen.size===P.length)award("viz:mports",20,"Identified every mobile connector")};
  svg.addEventListener("click",e=>{const g=e.target.closest("[data-p]");if(g)pick(g.dataset.p)});
  svg.addEventListener("keydown",e=>{const g=e.target.closest("[data-p]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(g.dataset.p)}});
})();

/* ---- Wireless range ruler ---- */
(function(){
  const el=$("#viz-range");if(!el)return;
  /* log scale from 1 cm to 10 km */
  const TECH=[["NFC",0.04,"Tap to pay, badge readers, quick pairing"],["Bluetooth",10,"Headsets, mice, watches"],["Wi-Fi",50,"Typical indoor range from one access point"],["Cellular (4G/5G)",5000,"Kilometers from a tower"]];
  const toX=m=>40+(Math.log10(m)+2)/6*560,fromV=v=>Math.pow(10,v/100*6-2);
  el.innerHTML=`<div class="viz-title">How far does each wireless technology reach?</div>
  <div class="viz-scroll"><svg viewBox="0 0 640 190" style="min-width:460px" role="img" aria-label="Wireless range chart, log scale"></svg></div>
  <label class="rf"><span>Distance between devices</span><input type="range" id="range-d" min="0" max="100" value="45" aria-label="Distance"></label>
  <div class="caption" aria-live="polite"></div>`;
  const svg=$("svg",el),r=$("#range-d",el);
  function fmtM(m){return m<1?Math.round(m*100)+" cm":m<1000?(m<10?m.toFixed(1):Math.round(m))+" m":(m/1000).toFixed(1)+" km"}
  function draw(){
    const d=fromV(+r.value);
    let s=TECH.map(([n,max],i)=>{const y=24+i*32,ok=d<=max;return `<rect x="40" y="${y}" width="${toX(max)-40}" height="20" rx="10" class="rg-bar${ok?" ok":""}"/><text x="48" y="${y+14}" style="font-size:12px" class="s-b">${n}</text><text x="${toX(max)+6}" y="${y+14}" class="s-small">${fmtM(max)}</text>`}).join("");
    [0.01,0.1,1,10,100,1000,10000].forEach(m=>{s+=`<line x1="${toX(m)}" y1="152" x2="${toX(m)}" y2="158" class="ch-axis"/><text x="${toX(m)}" y="172" text-anchor="middle" class="s-small">${fmtM(m)}</text>`});
    s+=`<line x1="40" y1="152" x2="600" y2="152" class="ch-axis"/><line x1="${toX(d)}" y1="16" x2="${toX(d)}" y2="152" class="rg-mark"/><text x="${toX(d)}" y="12" text-anchor="middle" class="s-b" style="font-size:12px">${fmtM(d)}</text>`;
    svg.innerHTML=s;
    const works=TECH.filter(t=>d<=t[1]).map(t=>t[0]);
    $(".caption",el).innerHTML=`At <b>${fmtM(d)}</b>: ${works.length?works.join(", ")+" can connect.":"none of these reach that far."} ${d<=0.04?"Close enough to tap.":d<=10?"Same room.":d<=50?"Same floor.":"Different building or across town."} <span class="s-note">Log scale. Real ranges vary with walls and interference.</span>`;
  }
  r.addEventListener("input",()=>{draw();award("viz:range",20,"Explored wireless ranges")});draw();
})();

seqViz($("#viz-pair"),{title:"Pair a Bluetooth headset",left:"Phone",right:"Headset",
  intro:"Press <b>Next step</b> to walk through pairing in the order CompTIA expects.",
  steps:[
    {dir:"l",label:"Enable Bluetooth",sub:"turn it on and enter pairing mode",dash:true,text:"<b>1. Enable Bluetooth</b> on the phone, and put the headset into pairing (discoverable) mode, usually by holding its power button."},
    {dir:"r",label:"Scan and find the device",sub:"discovery",dash:true,text:"<b>2. Find the device.</b> The phone scans and lists nearby discoverable devices."},
    {dir:"r",label:"Select the headset",text:"<b>3. Select the device</b> from the list to start pairing."},
    {dir:"l",label:"Enter or confirm the PIN",sub:"often 0000, or a matching code",text:"<b>4. Enter or confirm the PIN.</b> Some devices show a code to compare on both screens. Simple accessories may use 0000."},
    {dir:"r",label:"Test connectivity",text:"<b>5. Test connectivity.</b> Play audio or make a call to confirm it works."}],
  end:"Once paired, the devices remember each other and reconnect automatically."});
seqViz($("#viz-mdm"),{title:"Enroll a company phone in MDM",left:"Employee phone",right:"MDM server",
  intro:"Press <b>Next step</b> to see what MDM does for a new company phone.",
  steps:[
    {dir:"r",label:"Enroll the device",sub:"sign in with work account",text:"<b>Enroll.</b> The user signs in with their work account, or the phone enrolls automatically when it is first set up."},
    {dir:"l",label:"Push configuration profile",sub:"Wi-Fi, email, VPN, certificates",text:"<b>Configure.</b> The server pushes Wi-Fi, corporate email, VPN and certificate settings, so the user doesn't type them in."},
    {dir:"l",label:"Enforce policies",sub:"passcode, encryption, updates",text:"<b>Enforce.</b> Policies require a strong passcode, device encryption and current OS updates, and can block unknown app sources."},
    {dir:"l",label:"Install company apps",text:"<b>Deploy apps.</b> Required work apps install automatically from the managed app catalog."},
    {dir:"r",label:"Report compliance",text:"<b>Report.</b> The phone reports its status. Non-compliant devices can be blocked from company email."},
    {dir:"l",label:"Remote wipe (if lost)",dash:true,text:"<b>Remote wipe.</b> If the phone is lost or stolen, IT erases it, or only the company data if it's a personal phone."}],
  end:"On personal phones (BYOD), MAM manages just the company apps instead of the whole device."});
  },
  sims:[
    {id:"ssd",type:"order",title:"Upgrade a laptop's SSD",
      scenario:"A user's laptop needs a bigger SSD. Tap the steps in the order a careful technician would do them.",
      steps:["Back up the user's data","Power off and unplug the charger","Remove the bottom cover screws, tracking each location","Disconnect the internal battery","Remove the old SSD and install the new one","Reconnect the battery and replace the cover","Power on, verify the drive, and restore the data"],
      success:"The laptop boots with the new drive and nothing was damaged or lost."},
    {id:"needs",type:"match",title:"Match the technology to the need",
      scenario:"A sales rep lists what they need from their phone and laptop. Match each need to the right technology. Tap a technology, then tap the need.",
      items:[["NFC","pay"],["Bluetooth","buds"],["Hotspot","share"],["Docking station","desk"],["eSIM","lines"],["MDM","wipe"],["Stylus","notes"],["GPS","nav"]],
      slots:[["pay","Pay at checkout","Tap the phone on a reader"],["buds","Wireless earbuds","Audio within a few meters"],["share","Laptop online in a taxi","Share cellular data over Wi-Fi"],["desk","One-cable desk setup","Power, monitors, network, USB"],["lines","Work and personal numbers","Two lines, one physical phone"],["wipe","Erase if stolen","Company-controlled policies"],["notes","Handwritten notes","Write on the tablet screen"],["nav","Turn-by-turn directions","Satellite positioning"]],
      success:"The rep is connected everywhere they go."},
    {id:"corp",title:"Set up a corporate smartphone",mount(el,api,sim){
      const F={lock:"Swipe",encrypt:false,mdm:false,acct:"IMAP",server:"",mfa:false,unknown:true,update:false};let R={...F},graded=null;
      const CHECKS=[
        ["Screen lock is a 6+ digit PIN with biometrics",()=>R.lock==="PIN6bio","Company policy requires a strong lock. Swipe and 4-digit PINs are too easy to bypass."],
        ["Device encryption is on",()=>R.encrypt,"Encryption keeps data unreadable if the phone is lost."],
        ["Enrolled in company MDM",()=>R.mdm,"Enrollment lets IT push settings and wipe the phone if it's stolen."],
        ["Email uses Exchange ActiveSync to mail.example.com",()=>R.acct==="EAS"&&R.server.trim().toLowerCase()==="mail.example.com","The company uses Microsoft Exchange, which syncs email, contacts and calendar."],
        ["Authenticator app set up for MFA",()=>R.mfa,"Multifactor authentication protects the account even if the password leaks."],
        ["Installing apps from unknown sources is blocked",()=>!R.unknown,"Sideloaded apps skip store review and are a common malware source."],
        ["OS updated to the latest version",()=>R.update,"Updates patch security holes. Install them before handing over the phone."]
      ];
      function draw(){
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <div class="scenario"><p>A new hire's company phone just arrived. Company policy says:</p>
        <ol><li>Lock the phone with a <b>PIN of 6 or more digits plus biometrics</b>, and encrypt it.</li><li>Enroll it in the company's <b>MDM</b>.</li><li>Set up email on the company's Microsoft Exchange server, <b>mail.example.com</b>.</li><li>Protect the account with <b>MFA</b>.</li><li>Close any security gaps before handing it over.</li></ol></div>
        <div class="router"><div class="router-bar"><span>Settings</span><span class="mono">Phone · Android</span></div><div class="router-body">
          <label class="rf"><span>Screen lock</span><select id="c-lock" data-f="lock">${[["Swipe","Swipe"],["PIN4","4-digit PIN"],["PIN6bio","6-digit PIN + fingerprint"],["Pattern","Pattern"]].map(([v,l])=>`<option value="${v}" ${R.lock===v?"selected":""}>${l}</option>`).join("")}</select></label>
          <label class="rf rf-tog"><span>Encrypt device</span><input type="checkbox" id="c-encrypt" data-f="encrypt" ${R.encrypt?"checked":""}></label>
          <div class="rf"><span>Work profile (MDM)</span><div class="fwline">${R.mdm?'<span class="status-good">Enrolled</span>':'<button class="btn" data-a="mdm">Enroll device</button>'}</div></div>
          <label class="rf"><span>Email account type</span><select id="c-acct" data-f="acct">${[["POP3","POP3"],["IMAP","IMAP"],["EAS","Exchange ActiveSync"]].map(([v,l])=>`<option value="${v}" ${R.acct===v?"selected":""}>${l}</option>`).join("")}</select></label>
          <label class="rf"><span>Mail server</span><input id="c-server" data-f="server" value="${R.server}" placeholder="server address" autocomplete="off" spellcheck="false"></label>
          <label class="rf rf-tog"><span>Authenticator app (MFA)</span><input type="checkbox" id="c-mfa" data-f="mfa" ${R.mfa?"checked":""}></label>
          <label class="rf rf-tog"><span>Install unknown apps</span><input type="checkbox" id="c-unknown" data-f="unknown" ${R.unknown?"checked":""}></label>
          <div class="rf"><span>System update</span><div class="fwline">${R.update?'<span class="status-good">Up to date</span>':'<b class="mono">Update available</b><button class="btn" data-a="upd">Install</button>'}</div></div>
        </div></div>
        ${graded?`<div class="grade">${CHECKS.map((c,i)=>`<div class="${graded[i]?"g-ok":"g-no"}"><b>${graded[i]?"✓":"✗"} ${c[0]}</b>${graded[i]?"":`<span>${c[2]}</span>`}</div>`).join("")}</div>`:""}
        <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">All ${CHECKS.length} requirements met.</span> The phone is ready for the new hire.`:`<b>${graded.filter(Boolean).length} of ${CHECKS.length}</b> requirements met. Fix the ones marked ✗ and check again.`):"Changes save as you go. Press <b>Check setup</b> when you're done."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Check setup</button><button class="btn" data-a="reset">Reset phone</button></div>`;
      }
      el.addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;R[f]=e.target.type==="checkbox"?e.target.checked:e.target.value});
      el.addEventListener("change",e=>{const f=e.target.dataset.f;if(f&&e.target.tagName==="SELECT")R[f]=e.target.value});
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;
        if(a==="mdm"){R.mdm=true;draw()}if(a==="upd"){R.update=true;draw()}
        if(a==="reset"){R={...F};graded=null;draw()}
        if(a==="grade"){graded=CHECKS.map(c=>c[1]());if(graded.every(Boolean))api.pass();draw()}});
      draw();
    }}
  ],
  badges:[
    ["reader","RW","Road Warrior","Mark all 4 mobile lessons studied",c=>c.allStudied()],
    ["lab","SC","Screwdriver Certified","Complete all 6 mobile diagrams",c=>c.vizAll()],
    ["ssd","SS","Swap Specialist","Pass the laptop SSD upgrade simulation",c=>c.passed("ssd")],
    ["corp","LD","Locked Down","Pass the corporate smartphone simulation",c=>c.passed("corp")],
    ["needs","CN","Connected","Pass the technology matching simulation",c=>c.passed("needs")],
    ["perfect","FB","Full Bars","Score 100% on a mobile quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
