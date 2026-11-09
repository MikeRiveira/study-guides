/* ================= Module 4: Virtualization and Cloud Computing (Core 1, 220-1201) ================= */
(function(){
const LESSONS=[
{id:"why",num:"4.1",title:"Why virtualize",short:"Why virtualize",html:`
<p>Virtualization runs several operating systems on one physical computer. Each <b>virtual machine (VM)</b> believes it has its own hardware, but it is sharing the host's CPU, RAM, storage and network.</p>
<ul><li><b>Sandboxing</b>: open suspicious files or test changes where they can't hurt the real system.</li>
<li><b>Test and development</b>: try a new OS, an update or a script, then roll back with a <b>snapshot</b>.</li>
<li><b>Legacy software</b>: run an old app on the old OS it needs.</li>
<li><b>Cross-platform</b>: run Linux on a Windows PC, or Windows on a Mac.</li>
<li><b>Server consolidation</b>: many lightly used servers become VMs on one host, saving power and space.</li></ul>
<h3>Resource requirements</h3>
<ul><li>CPU support for virtualization, <b>Intel VT-x or AMD-V</b>, enabled in UEFI.</li>
<li>Enough <b>RAM</b> for the host plus every running VM. RAM is usually the first limit you hit.</li>
<li>Disk space for each VM's virtual disk, and for snapshots, which grow over time.</li>
<li>Network: each VM gets a virtual NIC connected to a virtual switch.</li></ul>
<div class="viz" id="viz-alloc"></div>
<h3>Security concerns</h3>
<ul><li><b>VM escape</b>: an attack that breaks out of a VM to reach the host or other VMs. Keep hypervisors patched.</li>
<li><b>VM sprawl</b>: forgotten, unpatched VMs pile up. Track and remove what isn't needed.</li>
<li>Each VM needs its own updates, antivirus and firewall, just like a physical PC.</li></ul>`},
{id:"hyper",num:"4.2",title:"Hypervisors, containers and VDI",short:"Hypervisors and containers",html:`
<div class="viz" id="viz-stack"></div>
<div class="scroll"><table><thead><tr><th>Type</th><th>Runs on</th><th>Examples</th><th>Typical use</th></tr></thead><tbody>
<tr><td class="port">Type 1</td><td>Directly on hardware (bare metal)</td><td>VMware ESXi, Microsoft Hyper-V, Proxmox, KVM</td><td>Servers and data centers</td></tr>
<tr><td class="port">Type 2</td><td>As an app on a host OS</td><td>Oracle VirtualBox, VMware Workstation, Parallels</td><td>Desktops and labs</td></tr>
<tr><td class="port">Containers</td><td>A container engine on a host OS, sharing its kernel</td><td>Docker, Podman</td><td>Packaging and running apps</td></tr>
</tbody></table></div>
<h3>VM network modes</h3>
<ul><li><b>NAT</b>: the VM shares the host's IP address to reach outside networks. The default in most Type 2 hypervisors.</li>
<li><b>Bridged</b>: the VM gets its own address on the physical network, like a separate PC.</li>
<li><b>Host-only (internal)</b>: the VM talks only to the host and other VMs. Good for isolated testing.</li></ul>
<h3>Desktop virtualization</h3>
<p><b>VDI</b> (virtual desktop infrastructure) runs users' desktops as VMs in a data center or the cloud. Users connect from any device, and data never leaves the server. <b>Application virtualization</b> streams a single app instead of a whole desktop.</p>`},
{id:"models",num:"4.3",title:"Cloud deployment models",short:"Deployment models",html:`
<div class="viz" id="viz-deploy"></div>
<div class="scroll"><table><thead><tr><th>Model</th><th>Who uses it</th><th>Key point</th></tr></thead><tbody>
<tr><td class="port">Public</td><td>Anyone who pays, sharing the provider's hardware</td><td>No hardware to buy. Scales on demand.</td></tr>
<tr><td class="port">Private</td><td>One organization</td><td>Full control, on-site or hosted. Costs more.</td></tr>
<tr><td class="port">Hybrid</td><td>A mix of private and public</td><td>Sensitive data stays private. Overflow goes public.</td></tr>
<tr><td class="port">Community</td><td>Several organizations with shared needs</td><td>Shared costs, shared compliance rules (for example, hospitals).</td></tr>
</tbody></table></div>`},
{id:"services",num:"4.4",title:"Cloud service models and characteristics",short:"Service models",html:`
<p>Service models describe how much the provider manages for you. Click a column to see who is responsible for each layer.</p>
<div class="viz" id="viz-resp"></div>
<ul><li><b>IaaS</b> (infrastructure): rent virtual servers, storage and networks. You manage the OS and up. Example: Amazon EC2, Azure VMs.</li>
<li><b>PaaS</b> (platform): deploy your code. The provider runs the OS and runtime. Example: Azure App Service, Google App Engine.</li>
<li><b>SaaS</b> (software): just use the app in a browser. Example: Microsoft 365, Gmail, Salesforce.</li></ul>
<h3>Cloud characteristics</h3>
<ul><li><b>Shared resources</b> and <b>multitenancy</b>: many customers share the same hardware, kept separate by software.</li>
<li><b>Metered utilization</b>: pay for what you use, like a utility bill.</li>
<li><b>Rapid elasticity</b>: resources scale up and down automatically with demand.</li>
<li><b>High availability</b>: services keep running through failures, often across several data centers.</li>
<li><b>File synchronization</b>: files stay the same across every device (OneDrive, Google Drive, Dropbox).</li>
<li><b>Ingress and egress</b>: data going into the cloud is usually free. Data coming out (egress) is often billed.</li></ul>
<div class="viz" id="viz-elastic"></div>`}
];

const CARDS=[
 ...[["Type 1 hypervisor","Runs directly on hardware (bare metal). ESXi, Hyper-V, Proxmox."],["Type 2 hypervisor","Runs as an app on a host OS. VirtualBox, VMware Workstation."],["Container","Packages an app with its libraries and shares the host OS kernel. Docker."],
     ["Container vs VM","Containers share the host kernel and start in seconds. VMs each run a full guest OS."],["CPU feature needed for VMs","Intel VT-x or AMD-V, enabled in UEFI"],["Snapshot","Saves a VM's state so you can roll back later"],
     ["Sandbox","An isolated environment for testing risky files or changes"],["VM escape","An attack that breaks out of a VM into the host or other VMs"],["VM sprawl","Too many unmanaged, unpatched VMs"],
     ["NAT network mode","The VM shares the host's IP to reach outside networks"],["Bridged network mode","The VM gets its own IP on the physical LAN"],["Host-only network mode","The VM can reach only the host and other VMs"],
     ["VDI","Virtual desktop infrastructure: user desktops run as VMs on servers"],["Usually the first resource limit on a VM host","RAM"]].map((c,i)=>({deck:"virt",id:"vv"+i,q:c[0],a:c[1]})),
 ...[["Public cloud","Shared provider hardware, open to any paying customer"],["Private cloud","Used by one organization only"],["Hybrid cloud","A mix of private and public clouds"],["Community cloud","Shared by organizations with common needs or regulations"],
     ["IaaS","Rent servers, storage and networking. You manage the OS and up."],["PaaS","Deploy code. The provider manages the OS and runtime."],["SaaS","Use a finished app over the internet. Microsoft 365, Gmail."],
     ["Rapid elasticity","Resources scale up and down automatically with demand"],["Metered utilization","Pay only for what you use"],["Multitenancy","Many customers share the same infrastructure, kept separate"],
     ["High availability","Designed to keep running through failures"],["Egress cost","A fee for data leaving the cloud provider"],["File synchronization","Keeps files the same across devices, such as OneDrive"],["Who patches the OS in IaaS?","The customer"]].map((c,i)=>({deck:"cloud",id:"vc"+i,q:c[0],a:c[1]}))
];

const QUIZ=[
 {q:"Which hypervisor type runs directly on the server hardware without a host operating system?",o:["Type 1","Type 2","Container engine","Emulator"],a:0,e:"Type 1 (bare-metal) hypervisors such as ESXi and Hyper-V run directly on hardware."},
 {q:"A technician installs VirtualBox on a Windows 11 laptop to test Linux. What type of hypervisor is this?",o:["Type 1","Type 2","Container","VDI"],a:1,e:"VirtualBox runs as an application on a host OS, which makes it a Type 2 hypervisor."},
 {q:"A user can't create a 64-bit VM, and the hypervisor says hardware virtualization is unavailable. What should be checked?",o:["Network mode","VT-x or AMD-V in UEFI","The amount of disk space","The guest OS license"],a:1,e:"Hardware virtualization extensions must be enabled in the UEFI/BIOS settings."},
 {q:"Which resource is most often the first to run out when adding VMs to a host?",o:["CPU cache","RAM","Network ports","USB ports"],a:1,e:"Every running VM needs its own memory, so RAM usually limits how many VMs a host can run."},
 {q:"Before installing a risky update in a VM, what should be done so it can be undone quickly?",o:["Take a snapshot","Switch to bridged networking","Add more RAM","Convert it to a container"],a:0,e:"A snapshot captures the VM's state so you can roll back in seconds."},
 {q:"A security analyst wants to open a suspicious email attachment safely. What is the best option?",o:["Open it on their own desktop","Open it in an isolated VM sandbox","Email it to a coworker","Print it"],a:1,e:"A sandboxed VM keeps malware away from the real system, and it can be reverted afterward."},
 {q:"Which attack breaks out of a guest VM to access the hypervisor or other VMs?",o:["VM sprawl","VM escape","Phishing","DDoS"],a:1,e:"VM escape is the main risk of virtualization. Patching the hypervisor reduces it."},
 {q:"An audit finds dozens of old, unpatched test VMs nobody owns. What is this called?",o:["VM escape","VM sprawl","Multitenancy","Elasticity"],a:1,e:"VM sprawl happens when VMs are created and never tracked or removed."},
 {q:"A test VM must reach the host but nothing else on the network. Which network mode should be used?",o:["Bridged","NAT","Host-only","Public"],a:2,e:"Host-only (internal) networking limits the VM to the host and other VMs."},
 {q:"A VM needs its own IP address on the office LAN so other PCs can reach it. Which network mode?",o:["NAT","Bridged","Host-only","None"],a:1,e:"Bridged mode connects the VM to the physical network like a separate computer."},
 {q:"What do containers share with each other that VMs do not?",o:["The host OS kernel","A hypervisor license","Physical NICs only","A BIOS chip"],a:0,e:"Containers share the host kernel, which makes them small and fast to start."},
 {q:"Which technology packages an app and its dependencies so it runs the same everywhere, without a full guest OS?",o:["Type 1 hypervisor","Container","VDI","Snapshot"],a:1,e:"Containers such as Docker bundle the app and its libraries and share the host kernel."},
 {q:"A company wants employees to reach their full Windows desktop from any device while data stays in the data center. What should it deploy?",o:["SaaS email","VDI","A Type 2 hypervisor on each laptop","Containers"],a:1,e:"Virtual desktop infrastructure hosts desktops as VMs on servers."},
 {q:"An accounting app only runs on Windows XP. What is the safest way to keep using it?",o:["Install XP on a spare PC on the main network","Run XP in an isolated VM","Disable the firewall","Use a container on Linux"],a:1,e:"A VM lets the legacy OS run while being isolated from the rest of the network."},
 {q:"A company rents virtual servers and installs and patches its own operating systems. Which service model is this?",o:["SaaS","PaaS","IaaS","DaaS"],a:2,e:"With IaaS, the provider supplies the infrastructure and the customer manages the OS and above."},
 {q:"Developers want to upload code without managing servers or operating systems. Which model fits?",o:["IaaS","PaaS","SaaS","On-premises"],a:1,e:"PaaS provides the platform and runtime. Developers manage only their code and data."},
 {q:"A business uses Microsoft 365 for email and documents in a browser. Which service model is this?",o:["IaaS","PaaS","SaaS","Private cloud"],a:2,e:"SaaS delivers a complete application over the internet."},
 {q:"In which service model does the customer manage the least?",o:["IaaS","PaaS","SaaS","On-premises"],a:2,e:"SaaS providers manage everything up to the app. The customer manages users and data."},
 {q:"In IaaS, who is responsible for patching the guest operating system?",o:["The cloud provider","The customer","The ISP","Nobody"],a:1,e:"The customer manages everything from the OS up in IaaS."},
 {q:"Which cloud deployment model is used by a single organization only?",o:["Public","Private","Community","Hybrid"],a:1,e:"A private cloud is dedicated to one organization, on-site or hosted."},
 {q:"A retailer keeps customer data in its own data center but adds public cloud servers during holiday sales. Which model is this?",o:["Public","Private","Hybrid","Community"],a:2,e:"Hybrid clouds combine private and public resources."},
 {q:"Several hospitals share a cloud built to meet the same health-privacy rules. Which model is this?",o:["Community","Public","Private","Hybrid"],a:0,e:"A community cloud is shared by organizations with common requirements."},
 {q:"A startup with no servers rents everything from a large provider alongside many other customers. Which model?",o:["Private","Public","Community","On-premises"],a:1,e:"Public clouds share the provider's infrastructure among many customers."},
 {q:"A website automatically adds servers during a traffic spike and removes them afterward. Which cloud characteristic is this?",o:["Multitenancy","Rapid elasticity","File synchronization","Egress"],a:1,e:"Rapid elasticity scales resources with demand automatically."},
 {q:"A company's cloud bill rises and falls each month based on actual usage. Which characteristic is this?",o:["Metered utilization","High availability","Shared resources","Private cloud"],a:0,e:"Metered utilization means you pay for what you use, like electricity."},
 {q:"Many customers' VMs run on the same physical cloud servers, kept separate from each other. What is this called?",o:["Multitenancy","VM sprawl","Bridging","Elasticity"],a:0,e:"Multitenancy lets the provider serve many tenants on shared hardware."},
 {q:"A cloud service is spread across three data centers so it keeps running if one fails. Which characteristic is this?",o:["Metered utilization","High availability","Egress","Sandboxing"],a:1,e:"High availability designs remove single points of failure."},
 {q:"A company is surprised by charges for downloading large backups from the cloud. What is this fee called?",o:["Ingress","Egress","Multitenancy","Licensing"],a:1,e:"Providers often charge for data leaving the cloud (egress). Ingress is usually free."},
 {q:"A user edits a document on a laptop and sees the change on their phone moments later. Which feature is this?",o:["Rapid elasticity","File synchronization","VDI","Snapshotting"],a:1,e:"Cloud file sync services keep files identical across devices."},
 {q:"Which is an example of a Type 1 hypervisor?",o:["Oracle VirtualBox","VMware ESXi","VMware Workstation","Parallels Desktop"],a:1,e:"ESXi installs on bare metal. The others run on top of a host OS."},
 {q:"Why does a VM need its own antivirus and updates?",o:["It doesn't, the host protects it","It is a full OS with its own vulnerabilities","Hypervisors block updates","Containers handle it"],a:1,e:"Each guest OS can be attacked like a physical PC and must be maintained."},
 {q:"A host has 32 GB of RAM. The host OS needs 8 GB. How much can be given to running VMs without overcommitting?",o:["8 GB","24 GB","32 GB","40 GB"],a:1,e:"32 − 8 = 24 GB is left for VMs. Giving more forces swapping and slows everything."},
 {q:"Which statement about cloud fault tolerance vs backups is true?",o:["High availability replaces backups","Replication copies deletions and ransomware too, so backups are still needed","Backups are only for on-premises","SaaS never loses data"],a:1,e:"Replicated systems copy mistakes instantly. Separate, versioned backups are still required."},
 {q:"What is the main benefit of server consolidation with virtualization?",o:["Every app gets its own physical server","Fewer physical servers, lower power and space costs","No need for patches","Faster internet"],a:1,e:"Running many VMs on fewer hosts saves hardware, power and rack space."},
 {q:"Which component connects a VM's virtual NIC to other VMs and the physical network?",o:["Virtual switch","Container engine","Snapshot","TPM"],a:0,e:"The hypervisor's virtual switch links virtual NICs together and to physical adapters."}
];

registerModule({
  id:"vc",slug:"virtualization-cloud",title:"Virtualization and Cloud Computing",
  lessons:LESSONS,
  decks:[["virt","Virtualization"],["cloud","Cloud"]],
  cards:CARDS,quiz:QUIZ,
  vizKeys:["alloc","stack","deploy","resp","elastic"],
  viz(){
/* ---- VM resource allocator ---- */
(function(){
  const el=$("#viz-alloc");if(!el)return;
  const HOST={cpu:16,ram:64,disk:1000},HOSTOS={cpu:2,ram:8,disk:100};
  const PRESET=[["Windows 11 test",2,8,80],["Linux web server",2,4,40],["Domain controller",2,8,80],["Database server",4,16,250],["Sandbox for malware",2,4,60]];
  let vms=[[...PRESET[0]],[...PRESET[1]]];
  el.innerHTML=`<div class="viz-title">Fit VMs onto a host server</div>
  <p class="s-note" style="margin:0">Host: ${HOST.cpu} CPU cores, ${HOST.ram} GB RAM, ${HOST.disk} GB disk. The host OS keeps ${HOSTOS.cpu} cores and ${HOSTOS.ram} GB RAM for itself.</p>
  <div class="alloc"></div><div class="vm-list"></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls">${PRESET.map((p,i)=>`<button class="btn" data-add="${i}">+ ${p[0]}</button>`).join("")}<button class="btn" data-a="clear">Remove all</button></div>`;
  function draw(){
    const used={cpu:HOSTOS.cpu,ram:HOSTOS.ram,disk:HOSTOS.disk};vms.forEach(v=>{used.cpu+=v[1];used.ram+=v[2];used.disk+=v[3]});
    $(".alloc",el).innerHTML=[["cpu","CPU cores",""],["ram","RAM"," GB"],["disk","Disk"," GB"]].map(([k,l,u])=>{const p=used[k]/HOST[k]*100,over=p>100;
      return `<div class="al-row"><span>${l}</span><div class="al-track"><i class="al-host" style="width:${HOSTOS[k]/HOST[k]*100}%"></i><i class="al-vm${over?" over":""}" style="width:${Math.min(p,100)-HOSTOS[k]/HOST[k]*100}%"></i></div><b class="mono${over?" status-bad":""}">${used[k]}/${HOST[k]}${u}</b></div>`}).join("");
    $(".vm-list",el).innerHTML=vms.map((v,i)=>`<button class="vm-chip" data-rm="${i}" aria-label="Remove ${v[0]}"><b>${v[0]}</b><span>${v[1]} cores · ${v[2]} GB · ${v[3]} GB</span><em>×</em></button>`).join("")||'<span class="s-note">No VMs yet. Add some below.</span>';
    const ramOver=used.ram>HOST.ram,cpuOver=used.cpu>HOST.cpu;
    $(".caption",el).innerHTML=ramOver?`<span class="status-bad">RAM is overcommitted.</span> The host would start swapping to disk and every VM would slow down. Remove a VM or add RAM to the host. Notice RAM runs out before CPU does.`
      :cpuOver?`<span class="status-bad">CPU is overcommitted.</span> VMs can share cores, but heavy workloads will compete for time. That's often acceptable for light servers.`
      :`<span class="status-good">Everything fits.</span> ${vms.length} VM${vms.length===1?"":"s"} running with ${HOST.ram-used.ram} GB RAM to spare.`;
    if(vms.length>=4)award("viz:alloc",20,"Packed a virtualization host");
  }
  el.addEventListener("click",e=>{const a=e.target.closest("[data-add]"),r=e.target.closest("[data-rm]"),c=e.target.closest("[data-a]");
    if(a){vms.push([...PRESET[+a.dataset.add]]);draw()}if(r){vms.splice(+r.dataset.rm,1);draw()}if(c){vms=[];draw()}});
  draw();
})();

/* ---- Hypervisor stacks ---- */
(function(){
  const el=$("#viz-stack");if(!el)return;
  const S={
    t1:{name:"Type 1 (bare metal)",cols:[["App","Guest OS"],["App","Guest OS"],["App","Guest OS"]],base:[["Hypervisor (ESXi, Hyper-V)","hv"],["Physical hardware","hw"]],note:"The hypervisor <b>is</b> the operating system on the server. No host OS sits in between, so it's faster and more secure. Used in data centers."},
    t2:{name:"Type 2 (hosted)",cols:[["App","Guest OS"],["App","Guest OS"],["Your apps",""]],base:[["Hypervisor app (VirtualBox)","hv"],["Host OS (Windows, macOS)","os"],["Physical hardware","hw"]],note:"The hypervisor is an <b>app</b> running on a normal OS. Easy to install on a laptop, but every VM call goes through the host OS, which adds overhead."},
    ct:{name:"Containers",cols:[["App + libraries",""],["App + libraries",""],["App + libraries",""]],base:[["Container engine (Docker)","hv"],["Host OS kernel (shared)","os"],["Physical hardware","hw"]],note:"No guest OS at all. Containers share the host's kernel, so they are tiny and start in seconds. The trade-off: all containers must suit the host OS (Linux containers need a Linux kernel)."}
  };
  const seen=new Set();let cur="t1";
  el.innerHTML=`<div class="viz-title">Compare hypervisor and container stacks</div>
  <div class="viz-controls">${Object.entries(S).map(([k,s])=>`<button class="chip" data-s="${k}">${s.name}</button>`).join("")}</div>
  <div class="stack"></div><div class="caption" aria-live="polite"></div>`;
  function draw(){
    const s=S[cur];seen.add(cur);
    el.querySelectorAll("[data-s]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===cur));
    $(".stack",el).innerHTML=`<div class="st-cols">${s.cols.map(c=>`<div class="st-col">${c.filter(Boolean).map((x,i)=>`<div class="st-blk ${i?"guest":"app"}">${x}</div>`).join("")}</div>`).join("")}</div>${s.base.map(([n,c])=>`<div class="st-blk ${c}">${n}</div>`).join("")}`;
    $(".caption",el).innerHTML=s.note;
    if(seen.size===3)award("viz:stack",20,"Compared hypervisor stacks");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(b){cur=b.dataset.s;draw()}});draw();
})();

/* ---- Deployment models ---- */
(function(){
  const el=$("#viz-deploy");if(!el)return;
  const M={
    public:{name:"Public",note:"<b>Public cloud.</b> One provider's data center serves many unrelated customers. Nothing to buy up front, and it scales almost without limit.",orgs:["Company A","Company B","Company C"],links:[[0,"pub"],[1,"pub"],[2,"pub"]],clouds:["pub"]},
    private:{name:"Private",note:"<b>Private cloud.</b> Cloud-style self-service, but the hardware serves one organization only. More control and isolation, more cost.",orgs:["Your company"],links:[[0,"priv"]],clouds:["priv"]},
    hybrid:{name:"Hybrid",note:"<b>Hybrid cloud.</b> Sensitive systems stay in the private cloud, and the public cloud absorbs extra demand or hosts less sensitive apps.",orgs:["Your company"],links:[[0,"priv"],[0,"pub"]],clouds:["priv","pub"]},
    community:{name:"Community",note:"<b>Community cloud.</b> A cloud shared by organizations with the same needs, such as hospitals or government agencies, splitting the cost and the compliance work.",orgs:["Hospital 1","Hospital 2","Hospital 3"],links:[[0,"comm"],[1,"comm"],[2,"comm"]],clouds:["comm"]}
  };
  const CL={pub:[470,70,"Public cloud provider"],priv:[470,180,"Private cloud"],comm:[470,125,"Shared community cloud"]};
  const seen=new Set();let cur="public";
  el.innerHTML=`<div class="viz-title">See who shares each type of cloud</div>
  <div class="viz-controls">${Object.entries(M).map(([k,m])=>`<button class="chip" data-m="${k}">${m.name}</button>`).join("")}</div>
  <div class="viz-scroll"><svg viewBox="0 0 620 250" style="min-width:440px" role="img" aria-label="Cloud deployment model diagram"></svg></div>
  <div class="caption" aria-live="polite"></div>`;
  function draw(){
    const m=M[cur];seen.add(cur);
    el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===cur));
    const oy=i=>m.orgs.length===1?125:50+i*75;
    let s=m.links.map(([o,c])=>`<line x1="190" y1="${oy(o)}" x2="${CL[c][0]-110}" y2="${CL[c][1]}" class="m-link on"/>`).join("");
    s+=m.orgs.map((n,i)=>`<g class="m-node on"><rect x="40" y="${oy(i)-22}" width="150" height="44" rx="9"/><text x="115" y="${oy(i)+5}" text-anchor="middle" class="s-b" style="font-size:13px">${n}</text></g>`).join("");
    s+=m.clouds.map(c=>{const [x,y,n]=CL[c];return `<g class="cloud-g ${c}"><ellipse cx="${x}" cy="${y}" rx="110" ry="38"/><text x="${x}" y="${y+5}" text-anchor="middle" class="s-b" style="font-size:13px">${n}</text></g>`}).join("");
    $("svg",el).innerHTML=s;$(".caption",el).innerHTML=m.note;
    if(seen.size===4)award("viz:deploy",20,"Explored cloud deployment models");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){cur=b.dataset.m;draw()}});draw();
})();

/* ---- Shared responsibility matrix ---- */
(function(){
  const el=$("#viz-resp");if(!el)return;
  const L=["Applications","Data","Runtime","Middleware","Operating system","Virtualization","Servers","Storage","Networking"];
  const C=[["onprem","On-premises",0],["iaas","IaaS",4],["paas","PaaS",2],["saas","SaaS",0]];/* number of layers (from top) the customer manages; onprem = all */
  const custN={onprem:9,iaas:5,paas:2,saas:0};
  const seen=new Set();let cur="iaas";
  el.innerHTML=`<div class="viz-title">Who manages what? Click a column</div>
  <div class="viz-scroll"><table class="resp"><thead><tr><th>Layer</th>${C.map(([k,n])=>`<th><button class="chip" data-c="${k}">${n}</button></th>`).join("")}</tr></thead><tbody></tbody></table></div>
  <div class="legend"><span><i class="you"></i>You manage</span><span><i class="prov"></i>Provider manages</span></div>
  <div class="caption" aria-live="polite"></div>`;
  const notes={onprem:"<b>On-premises.</b> You own and run everything, from the network cables to the apps.",iaas:"<b>IaaS.</b> The provider runs the physical hardware and virtualization. You manage the OS, patches, runtime, apps and data.",paas:"<b>PaaS.</b> The provider also runs the OS and runtime. You bring your application and data.",saas:"<b>SaaS.</b> The provider runs the whole application. You still own your data and who has access to it."};
  function draw(){
    seen.add(cur);
    el.querySelectorAll("[data-c]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===cur));
    $("tbody",el).innerHTML=L.map((l,i)=>`<tr><td>${l}</td>${C.map(([k])=>{const you=i<custN[k]||(k==="saas"&&i===1);return `<td class="${you?"you":"prov"}${k===cur?" cur":""}">${you?"You":"Provider"}</td>`}).join("")}</tr>`).join("");
    $(".caption",el).innerHTML=notes[cur];
    if(seen.size===4)award("viz:resp",20,"Mapped shared responsibility");
  }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(b){cur=b.dataset.c;draw()}});draw();
})();

/* ---- Rapid elasticity ---- */
(function(){
  const el=$("#viz-elastic");if(!el)return;
  const load=[12,9,7,6,6,8,15,30,48,55,58,62,70,66,60,58,64,80,96,100,88,60,35,20];/* % demand by hour */
  const CAP=25,FIXED=3;let mode="elastic",hour=0,raf=null,last=0;
  el.innerHTML=`<div class="viz-title">Watch a website scale through one day</div>
  <div class="viz-controls"><button class="chip" data-m="fixed">3 fixed servers</button><button class="chip" data-m="elastic">Rapid elasticity</button></div>
  <div class="viz-scroll"><svg viewBox="0 0 620 230" style="min-width:440px" role="img" aria-label="Demand versus capacity over 24 hours"></svg></div>
  <div class="sn-grid el-out"></div>
  <div class="caption" aria-live="polite"></div>
  <div class="viz-controls"><button class="btn primary" data-a="play">Play the day</button></div>`;
  const X=h=>50+h*(540/23),Y=p=>190-p*1.6;
  function servers(h){return mode==="fixed"?FIXED:Math.max(1,Math.ceil(load[h]/CAP))}
  function draw(){
    el.querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===mode));
    let s=`<line x1="50" y1="190" x2="590" y2="190" class="ch-axis"/>`;
    [0,6,12,18,23].forEach(h=>s+=`<text x="${X(h)}" y="208" text-anchor="middle" class="s-small">${String(h).padStart(2,"0")}:00</text>`);
    let cap="";for(let h=0;h<24;h++){const c=Math.min(servers(h)*CAP,110);cap+=`${h?"L":"M"}${X(h)-(h?11.7:0)},${Y(c)} L${X(h)+(h<23?11.7:0)},${Y(c)} `}
    s+=`<path d="${cap}" class="el-cap"/>`;
    s+=`<polyline points="${load.map((p,h)=>X(h)+","+Y(p)).join(" ")}" class="el-load"/>`;
    s+=`<line x1="${X(hour)}" y1="20" x2="${X(hour)}" y2="190" class="rg-mark"/>`;
    s+=`<text x="56" y="30" class="s-small">— demand</text><text x="140" y="30" class="s-small el-cap-t">▭ server capacity</text>`;
    $("svg",el).innerHTML=s;
    let over=0,idle=0,hrs=0;for(let h=0;h<=hour;h++){const c=servers(h)*CAP;if(load[h]>c)over++;idle+=Math.max(0,c-load[h]);hrs+=servers(h)}
    $(".el-out",el).innerHTML=[["Time",String(hour).padStart(2,"0")+":00"],["Servers running",servers(hour)],["Hours overloaded",over],["Server-hours billed",hrs]].map(([k,v])=>`<div><span>${k}</span><b class="${k==="Hours overloaded"&&over?"status-bad":""}">${v}</b></div>`).join("");
    $(".caption",el).innerHTML=mode==="fixed"?"With fixed capacity you pay for 3 servers all night while they sit idle, and the site still slows down during the evening peak.":"Servers are added as demand climbs and removed as it falls. You pay only for what runs (metered utilization) and the site never overloads.";
  }
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),a=e.target.closest("[data-a]");
    if(m){mode=m.dataset.m;draw()}
    if(a){cancelAnimationFrame(raf);hour=0;last=0;
      if(REDUCED){hour=23;draw();award("viz:elastic",20,"Watched cloud elasticity in action");return}
      const tick=t=>{if(!el.isConnected)return;if(!last)last=t;if(t-last>220){last=t;hour++;draw()}if(hour<23)raf=requestAnimationFrame(tick);else award("viz:elastic",20,"Watched cloud elasticity in action")};raf=requestAnimationFrame(tick)}});
  hour=23;draw();
})();
  },
  sims:[
    {id:"vmsetup",type:"order",title:"Stand up a test VM",
      scenario:"You're building a Windows test VM on a technician's laptop. Tap the steps in order.",
      steps:["Enable VT-x or AMD-V in UEFI","Install the hypervisor","Create the VM and assign CPU, RAM and disk","Attach the OS installer ISO","Install the guest operating system","Install the hypervisor's guest tools","Take a clean snapshot"],
      success:"The VM is ready, and the snapshot gives you a clean restore point."},
    {id:"pick",type:"match",title:"Pick the right cloud for each client",
      scenario:"Eight clients describe what they need. Match each one to the cloud service or deployment model that fits. Tap a model, then tap the client.",
      items:[["SaaS","email"],["IaaS","vms"],["PaaS","code"],["Private","own"],["Hybrid","burst"],["Community","shared"],["Public","startup"],["VDI","desk"]],
      slots:[["email","Law firm","Email and documents, nothing to manage"],["vms","IT department","Rent servers, install our own OS"],["code","App developers","Upload code, skip server work"],["own","Defense contractor","Must run on hardware only we use"],["burst","Online retailer","Own data center, extra capacity at peak"],["shared","Hospital group","Shared cloud meeting the same privacy rules"],["startup","New startup","No hardware at all, pay as we go"],["desk","Call center","Full Windows desktops on any device"]],
      success:"Every client got the right mix of control and convenience."},
    {id:"vmcfg",title:"Configure a malware analysis VM",mount(el,api,sim){
      const F={hv:"",vt:false,ram:16,cpu:8,disk:32,net:"Bridged",tpm:false,snap:false};let R={...F},graded=null;
      const CHECKS=[
        ["Type 2 hypervisor on the existing laptop OS",()=>R.hv==="t2","The laptop already runs Windows, so a hosted (Type 2) hypervisor installs as an app."],
        ["Hardware virtualization enabled",()=>R.vt,"VT-x or AMD-V must be on in UEFI or 64-bit VMs won't start."],
        ["RAM between 4 and 8 GB",()=>R.ram>=4&&R.ram<=8,"The guest needs at least 4 GB for Windows 11, and the 16 GB host needs the rest for itself."],
        ["2 to 4 CPU cores",()=>R.cpu>=2&&R.cpu<=4,"Giving all 8 cores starves the host."],
        ["Virtual disk of at least 64 GB",()=>R.disk>=64,"Windows 11 requires 64 GB of storage."],
        ["Network isolated from the office LAN",()=>R.net==="Host-only"||R.net==="None","Malware must not reach the company network. Use host-only or no network."],
        ["Virtual TPM enabled",()=>R.tpm,"Windows 11 requires TPM 2.0, which the hypervisor can provide virtually."],
        ["Clean snapshot taken before testing",()=>R.snap,"Snapshot the clean install so you can roll back after each test."]
      ];
      function draw(){
        el.innerHTML=`<div class="sim-head"><span class="sim-tag">Simulation ${sim.n}</span><h2>${sim.title}</h2>${api.passed()?'<span class="pill-good">Passed</span>':""}</div>
        <div class="scenario"><p>A security analyst wants a Windows 11 VM on their laptop (8 cores, 16 GB RAM, running Windows) for opening suspicious files. Requirements:</p>
        <ol><li>Install a hypervisor that runs on the laptop's current OS.</li><li>Give the VM enough resources for Windows 11 without starving the host.</li><li>The VM must <b>not</b> be able to reach the office network.</li><li>Make it easy to undo infections after each test.</li></ol></div>
        <div class="router"><div class="router-bar"><span>New virtual machine</span><span class="mono">Win11-Sandbox</span></div><div class="router-body">
          <label class="rf"><span>Hypervisor</span><select id="v-hv" data-f="hv"><option value="" ${!R.hv?"selected":""}>Choose…</option><option value="t1" ${R.hv==="t1"?"selected":""}>Type 1, wipe the laptop and install ESXi</option><option value="t2" ${R.hv==="t2"?"selected":""}>Type 2, install VirtualBox on Windows</option></select></label>
          <div class="rf"><span>UEFI: Intel VT-x</span><div class="fwline">${R.vt?'<span class="status-good">Enabled</span>':'<b class="mono">Disabled</b><button class="btn" data-a="vt">Enable</button>'}</div></div>
          <label class="rf"><span>RAM: <b class="mono" id="v-ram-v">${R.ram} GB</b></span><input type="range" id="v-ram" data-f="ram" min="1" max="16" value="${R.ram}"></label>
          <label class="rf"><span>CPU cores: <b class="mono" id="v-cpu-v">${R.cpu}</b></span><input type="range" id="v-cpu" data-f="cpu" min="1" max="8" value="${R.cpu}"></label>
          <label class="rf"><span>Virtual disk: <b class="mono" id="v-disk-v">${R.disk} GB</b></span><input type="range" id="v-disk" data-f="disk" min="16" max="256" step="16" value="${R.disk}"></label>
          <label class="rf"><span>Network</span><select id="v-net" data-f="net">${["NAT","Bridged","Host-only","None"].map(o=>`<option ${R.net===o?"selected":""}>${o}</option>`).join("")}</select></label>
          <label class="rf rf-tog"><span>Virtual TPM 2.0</span><input type="checkbox" id="v-tpm" data-f="tpm" ${R.tpm?"checked":""}></label>
          <div class="rf"><span>Snapshots</span><div class="fwline">${R.snap?'<span class="status-good">"Clean install" saved</span>':'<button class="btn" data-a="snap">Take snapshot</button>'}</div></div>
        </div></div>
        ${graded?`<div class="grade">${CHECKS.map((c,i)=>`<div class="${graded[i]?"g-ok":"g-no"}"><b>${graded[i]?"✓":"✗"} ${c[0]}</b>${graded[i]?"":`<span>${c[2]}</span>`}</div>`).join("")}</div>`:""}
        <div class="caption" aria-live="polite">${graded?(graded.every(Boolean)?`<span class="status-good">All ${CHECKS.length} requirements met.</span> The analyst can safely detonate malware and roll back.`:`<b>${graded.filter(Boolean).length} of ${CHECKS.length}</b> requirements met. Fix the ones marked ✗ and check again.`):"Press <b>Check VM</b> when you're done."}</div>
        <div class="viz-controls"><button class="btn primary" data-a="grade">Check VM</button><button class="btn" data-a="reset">Start over</button></div>`;
      }
      el.addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;R[f]=e.target.type==="checkbox"?e.target.checked:e.target.type==="range"?+e.target.value:e.target.value;
        const lbl=$("#v-"+f+"-v",el);if(lbl)lbl.textContent=R[f]+(f==="cpu"?"":" GB")});
      el.addEventListener("change",e=>{const f=e.target.dataset.f;if(f&&e.target.tagName==="SELECT")R[f]=e.target.value});
      el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;
        if(a==="vt"){R.vt=true;draw()}if(a==="snap"){R.snap=true;draw()}if(a==="reset"){R={...F};graded=null;draw()}
        if(a==="grade"){graded=CHECKS.map(c=>c[1]());if(graded.every(Boolean))api.pass();draw()}});
      draw();
    }}
  ],
  badges:[
    ["reader","HV","Hypervisor","Mark all 4 virtualization lessons studied",c=>c.allStudied()],
    ["lab","CL","Cloud Lab","Complete all 5 virtualization and cloud diagrams",c=>c.vizAll()],
    ["vmcfg","SB","Sandbox Builder","Pass the malware analysis VM simulation",c=>c.passed("vmcfg")],
    ["pick","CA","Cloud Architect","Pass the cloud matching simulation",c=>c.passed("pick")],
    ["perfect","EL","Elastic","Score 100% on a virtualization quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
