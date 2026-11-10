/* ================= Module 4: Implement and Manage Virtual Networking (AZ-104 Domain 4, 15–20%) ================= */
(function(){
const LESSONS=[
{id:"vnets",num:"4.1",title:"Virtual networks, subnets and IP addresses",html:`
<p>A <b>virtual network</b> (VNet) is your private network in one Azure region and one subscription. It has one or more <b>address spaces</b> in CIDR notation, usually private ranges from RFC 1918 (<code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>). Plan address spaces so they <b>don't overlap</b> with other VNets or on-premises networks you'll connect to, because overlapping networks can't be peered or routed.</p>
<h3>Subnets</h3>
<p>Subnets divide a VNet. Every subnet must fit inside the address space and can't overlap another subnet. Azure <b>reserves 5 addresses</b> in every subnet: the network address, <code>.1</code> (default gateway), <code>.2</code> and <code>.3</code> (Azure DNS), and the broadcast address. The smallest subnet is a <b>/29</b> (8 addresses, 3 usable).</p>
<div class="viz" id="viz-cidr"></div>
<p>Some services need a dedicated subnet with a fixed name: <b>GatewaySubnet</b> (VPN and ExpressRoute gateways; /27 or larger recommended) and <b>AzureBastionSubnet</b> (/26 or larger). Others use <b>subnet delegation</b> (for example App Service VNet integration or Azure Container Instances).</p>
<div class="viz" id="viz-subnetplan"></div>
<h3>IP addresses</h3>
<ul><li><b>Private IPs</b> come from the subnet, assigned <b>dynamically</b> (the next free address; kept until the NIC is deleted) or <b>statically</b> (one you choose).</li>
<li><b>Public IPs</b> are separate resources. The <b>Standard SKU</b> is static, zone-redundant or zonal, and <b>secure by default</b> (closed until an NSG allows traffic). The Basic SKU was retired in September 2025.</li>
<li>Public IP <b>prefixes</b> give you a contiguous block of public addresses.</li>
<li>Resources in a VNet get outbound internet access through a <b>NAT gateway</b> (recommended), a load balancer outbound rule or an instance-level public IP. Default outbound access for new VNets is being retired, so plan explicit outbound.</li></ul>`},
{id:"peering",num:"4.2",title:"Virtual network peering",html:`
<p><b>VNet peering</b> connects two VNets so their resources talk over private IPs on the Microsoft backbone, with low latency and no gateway.</p>
<ul><li><b>Regional</b> peering (same region) and <b>global</b> peering (different regions). Peerings can cross subscriptions and even tenants.</li>
<li>A peering is created on <b>both sides</b>. One side alone shows <b>Initiated</b>; when both exist they show <b>Connected</b>.</li>
<li>Address spaces <b>can't overlap</b>. After you change a peered VNet's address space, <b>sync</b> the peering.</li>
<li>Peering is <b>not transitive</b>: if A peers with Hub and Hub peers with B, A can't reach B. Fix it with a direct A↔B peering, or route through a firewall or NVA in the hub with user-defined routes (and <b>Allow forwarded traffic</b> on the peerings), or use Azure Virtual WAN.</li>
<li><b>Gateway transit</b>: spokes can use the hub's VPN or ExpressRoute gateway. Turn on <b>Allow gateway transit</b> on the hub side and <b>Use remote gateways</b> on the spoke side.</li></ul>
<div class="viz" id="viz-peer"></div>
<div class="viz" id="viz-peersettings"></div>
<p>To connect a VNet to <b>on-premises</b>, use a <b>VPN gateway</b> (site-to-site IPsec over the internet, or point-to-site for single clients) or <b>ExpressRoute</b> (a private circuit through a connectivity provider). VNet-to-VNet VPN connections are an alternative to peering when you need encryption.</p>`},
{id:"routes",num:"4.3",title:"User-defined routes",html:`
<p>Azure creates <b>system routes</b> for every subnet: traffic within the VNet, to peered VNets, to the internet (<code>0.0.0.0/0</code> → Internet) and drops for some private ranges. <b>User-defined routes</b> (UDRs) in a <b>route table</b> override them.</p>
<ul><li>A route has an <b>address prefix</b> and a <b>next hop type</b>: <b>Virtual appliance</b> (with an IP, such as Azure Firewall or a third-party NVA), <b>Virtual network gateway</b>, <b>Virtual network</b>, <b>Internet</b> or <b>None</b> (drop).</li>
<li>Associate a route table with one or more <b>subnets</b> (each subnet has at most one route table). It applies to traffic <b>leaving</b> that subnet.</li>
<li>Azure picks the route with the <b>longest prefix match</b>. If prefixes tie, UDRs beat BGP routes, which beat system routes.</li>
<li>An NVA VM must have <b>IP forwarding</b> enabled on its NIC (and in its OS) to pass traffic that isn't addressed to it.</li>
<li><b>Disable gateway route propagation</b> stops on-premises routes learned by BGP from reaching the subnet.</li></ul>
<div class="viz" id="viz-lpm"></div>
<p>Classic pattern: a <b>forced tunneling</b> route <code>0.0.0.0/0 → VirtualAppliance 10.0.100.4</code> on every spoke subnet sends all internet-bound traffic through a firewall in the hub. Use <b>Network Watcher → Next hop</b> or the NIC's <b>Effective routes</b> to check what really applies.</p>
<div class="viz" id="viz-udrq"></div>`},
{id:"nsg",num:"4.4",title:"Network security groups and application security groups",html:`
<p>A <b>network security group</b> (NSG) filters traffic with ordered rules. Associate an NSG with a <b>subnet</b>, a <b>NIC</b>, or both.</p>
<ul><li>Each rule has a <b>priority</b> (100–4096; lower is evaluated first), source and destination (IP ranges, <b>service tags</b> such as <code>Internet</code>, <code>VirtualNetwork</code>, <code>AzureLoadBalancer</code>, <code>Storage</code>, or ASGs), ports, protocol, direction and <b>Allow</b> or <b>Deny</b>.</li>
<li>Processing <b>stops at the first match</b>.</li>
<li><b>Default rules</b> (priority 65000+) can't be deleted but can be overridden: inbound allows VNet and load balancer traffic and denies everything else; outbound allows VNet and internet traffic.</li>
<li>NSGs are <b>stateful</b>: return traffic for an allowed flow is allowed automatically.</li>
<li>With NSGs on both: <b>inbound</b> traffic is checked by the <b>subnet</b> NSG first, then the <b>NIC</b> NSG; <b>outbound</b> by the NIC NSG first, then the subnet NSG. Traffic must be allowed by <b>both</b>.</li></ul>
<div class="viz" id="viz-nsgeval"></div>
<h3>Application security groups</h3>
<p><b>Application security groups</b> (ASGs) let you group VM NICs by role (asg-web, asg-db) and write rules like "allow asg-web → asg-db on 1433" without tracking IP addresses. NICs in an ASG must be in the same VNet as the ASG.</p>
<div class="viz" id="viz-asg"></div>
<h3>Checking effective rules</h3>
<p><b>Effective security rules</b> on a NIC show the combined result of every NSG. <b>IP flow verify</b> (Network Watcher) tests whether a specific packet would be allowed and names the rule that decided it.</p>`},
{id:"secure",num:"4.5",title:"Azure Bastion, service endpoints and private endpoints",html:`
<h3>Azure Bastion</h3>
<p><b>Azure Bastion</b> gives browser-based (or native client) <b>RDP and SSH</b> over TLS 443 to VMs that have <b>no public IP</b>. Deploy it into a subnet named <b>AzureBastionSubnet</b> (/26 or larger) with a Standard public IP. Bastion works for VMs in its VNet and in <b>peered</b> VNets.</p>
<ul><li><b>Developer</b>: free, shared, one connection at a time, no subnet needed.</li>
<li><b>Basic</b>: dedicated, fixed 2 instances.</li>
<li><b>Standard</b>: scale units, <b>native client</b> support (az network bastion ssh/rdp), file transfer, IP-based connection, shareable links.</li>
<li><b>Premium</b>: adds session recording and private-only deployment.</li></ul>
<div class="viz" id="viz-bastion"></div>
<h3>Service endpoints and private endpoints</h3>
<p><b>Service endpoints</b> extend a subnet's identity to a PaaS service (Storage, SQL, Key Vault…) so you can allow that subnet in the service's firewall. Traffic stays on the backbone but still goes to the service's <b>public</b> endpoint. <b>Service endpoint policies</b> restrict which storage accounts a subnet can reach.</p>
<p><b>Private endpoints</b> (Azure Private Link) put a <b>NIC with a private IP</b> for a specific resource in your subnet. Clients in the VNet, in peered VNets and on-premises reach the resource privately, and you can disable public access. You need DNS so the service's usual name resolves to the private IP: a <b>private DNS zone</b> such as <code>privatelink.blob.core.windows.net</code> linked to the VNet.</p>
<div class="viz" id="viz-pedns"></div>`},
{id:"dns",num:"4.6",title:"Azure DNS",html:`
<p><b>Azure DNS</b> hosts DNS zones on Microsoft's global name servers.</p>
<h3>Public DNS zones</h3>
<ul><li>Create a zone (for example <code>contoso.com</code>), then <b>delegate</b> it: at your domain registrar, replace the name servers with the four Azure DNS name servers (<code>ns1-0x.azure-dns.com</code>…) shown on the zone.</li>
<li>Record types: <b>A</b> (IPv4), <b>AAAA</b> (IPv6), <b>CNAME</b> (alias to another name; not at the zone apex), <b>MX</b> (mail), <b>TXT</b> (verification, SPF), <b>NS</b>, <b>SOA</b>, <b>SRV</b>, <b>CAA</b>, <b>PTR</b>.</li>
<li><b>Alias records</b> point to an Azure resource (public IP, Traffic Manager, Front Door), even at the apex, and update automatically if its IP changes.</li>
<li>Child domains can be delegated to another zone with NS records.</li></ul>
<div class="viz" id="viz-dnsrec"></div>
<h3>Private DNS zones</h3>
<ul><li>A <b>private DNS zone</b> (for example <code>contoso.internal</code>) resolves names only inside the VNets you <b>link</b> to it.</li>
<li>Turn on <b>auto-registration</b> on a link and VMs in that VNet register their own A records automatically. A VNet can have only <b>one</b> registration zone but can link to up to 1,000 resolution zones.</li>
<li>Without custom DNS, VMs use <b>Azure-provided DNS</b> (168.63.129.16). For hybrid name resolution, use the <b>Azure DNS Private Resolver</b> or your own DNS servers set on the VNet.</li></ul>
<div class="viz" id="viz-pdnsdrill"></div>`},
{id:"lb",num:"4.7",title:"Load balancing and network troubleshooting",html:`
<h3>Azure Load Balancer</h3>
<p><b>Azure Load Balancer</b> works at <b>layer 4</b> (TCP/UDP). It can be <b>public</b> (internet-facing, with a public IP frontend) or <b>internal</b> (private IP frontend).</p>
<ul><li><b>Frontend IP configuration</b>: the address clients connect to.</li>
<li><b>Backend pool</b>: the VM NICs or scale set instances (in one VNet).</li>
<li><b>Health probe</b>: TCP, HTTP or HTTPS check; unhealthy instances stop getting new flows. Probes come from <code>168.63.129.16</code> (service tag AzureLoadBalancer), so NSGs must allow it.</li>
<li><b>Load-balancing rule</b>: frontend port → backend port, with a probe. Distribution: 5-tuple hash (default), or <b>session persistence</b> by client IP (2-tuple) or client IP and protocol (3-tuple).</li>
<li><b>Inbound NAT rules</b>: map a frontend port to one VM (for example 50001 → vm1:22).</li>
<li><b>Outbound rules</b> give backend VMs outbound internet through the frontend IP (SNAT).</li>
<li><b>Standard SKU</b> (the Basic SKU retired in September 2025): zone-redundant, up to 1,000 instances, secure by default (an NSG must allow traffic), <b>HA ports</b> on internal load balancers.</li></ul>
<div class="viz" id="viz-lbflow"></div>
<div class="viz" id="viz-lbpick"></div>
<h3>Troubleshooting with Network Watcher</h3>
<ul><li><b>IP flow verify</b>: is a packet allowed or denied, and by which NSG rule?</li>
<li><b>Next hop</b>: where does traffic from a VM go, and which route table decided it?</li>
<li><b>Effective security rules</b> and <b>effective routes</b> on a NIC.</li>
<li><b>Connection troubleshoot</b>: end-to-end test from a VM to an address and port, showing hops and issues.</li>
<li><b>Packet capture</b>, <b>VPN troubleshoot</b>, <b>topology</b>, and <b>flow logs</b> (VNet flow logs to a storage account, analyzed with Traffic Analytics).</li></ul>
<div class="viz" id="viz-nwpick"></div>`}
];

const G={
 vnet:[["VNet scope","One region and one subscription"],["RFC 1918 private ranges","10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"],["Addresses Azure reserves per subnet","5 (network, .1, .2, .3, broadcast)"],["Smallest subnet","/29 (3 usable addresses)"],["Usable IPs in a /24","251"],["Usable IPs in a /26","59"],["Bastion subnet name and size","AzureBastionSubnet, /26 or larger"],["Gateway subnet name","GatewaySubnet"],["Dynamic private IP","Next free address; kept until the NIC is deleted"],["Standard public IP","Static, zone-aware, closed by default"],["Basic public IP status","Retired (September 2025)"],["Recommended outbound internet for a subnet","NAT gateway"],["Subnet delegation","Dedicates a subnet to a service like App Service or ACI"],["Public IP prefix","A contiguous block of public IPs"]],
 peer:[["VNet peering","Private connectivity between VNets over the backbone"],["Global peering","Peering between regions"],["Peering state with one side created","Initiated"],["Peering state with both sides","Connected"],["Is peering transitive?","No"],["Make spokes talk through a hub","NVA or Azure Firewall in the hub + UDRs + Allow forwarded traffic"],["Gateway transit settings","Allow gateway transit (hub), Use remote gateways (spoke)"],["Can overlapping VNets be peered?","No"],["After changing a peered VNet's address space","Sync the peering"],["Site-to-site VPN","IPsec tunnel over the internet to on-premises"],["Point-to-site VPN","Individual clients connect to the VNet"],["ExpressRoute","Private connection through a provider, not over the internet"]],
 sec:[["UDR next hop types","Virtual appliance, Virtual network gateway, Virtual network, Internet, None"],["How does Azure choose a route?","Longest prefix match, then UDR > BGP > system"],["Route tables per subnet","One"],["NVA NIC setting","IP forwarding"],["Forced tunneling route","0.0.0.0/0 → Virtual appliance"],["NSG priority range","100–4096 (lower first)"],["NSG processing","Stops at the first matching rule"],["Are NSGs stateful?","Yes"],["Inbound evaluation order with two NSGs","Subnet NSG, then NIC NSG"],["Outbound evaluation order","NIC NSG, then subnet NSG"],["Default inbound rules","Allow VNet, allow load balancer, deny all"],["Service tag for the internet","Internet"],["Application security group","Groups NICs by role for NSG rules"],["Check which NSG rule allows a packet","IP flow verify"],["Azure Bastion protocol to the browser","TLS 443"],["Bastion SKU for native client","Standard (or Premium)"],["Service endpoint","Subnet identity to a PaaS public endpoint over the backbone"],["Private endpoint","A private IP NIC for a specific resource"],["Private endpoint DNS for blob","privatelink.blob.core.windows.net"]],
 dns:[["Delegate a domain to Azure DNS","Set the zone's Azure name servers at the registrar"],["Can a CNAME be at the zone apex?","No; use an alias record"],["Alias record","Points to an Azure resource and updates automatically"],["MX record","Mail servers for the domain"],["TXT record","Text: verification, SPF"],["Private DNS auto-registration","VMs in a linked VNet register A records automatically"],["Registration zones per VNet","One"],["Azure-provided DNS IP","168.63.129.16"],["Hybrid DNS resolution service","Azure DNS Private Resolver"],["Load Balancer layer","Layer 4 (TCP/UDP)"],["Load Balancer parts","Frontend IP, backend pool, health probe, rules"],["Health probe source","168.63.129.16 (AzureLoadBalancer tag)"],["Session persistence options","None (5-tuple), client IP, client IP and protocol"],["Inbound NAT rule","Maps a frontend port to one backend VM"],["HA ports","Internal Standard LB rule for all ports"],["Layer 7 regional load balancer with WAF","Application Gateway"],["Global HTTP load balancer and CDN","Azure Front Door"],["DNS-based global traffic routing","Traffic Manager"],["Network Watcher tool for routes","Next hop"],["End-to-end connectivity test","Connection troubleshoot"]]
};
const DECKS=[["vnet","VNets and IP addressing"],["peer","Peering and connectivity"],["sec","Routing and security"],["dns","DNS and load balancing"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"How many usable IP addresses does a /27 subnet give you in Azure?",o:["27","32","30","29"],a:0,e:"32 minus the 5 Azure reserves."},
 {q:"What's the smallest subnet Azure allows?",o:["/29","/30","/28","/32"],a:0,e:"8 addresses, 3 usable."},
 {q:"Which address is NOT reserved in 10.0.1.0/24?",o:["10.0.1.4","10.0.1.1","10.0.1.3","10.0.1.255"],a:0,e:".0, .1, .2, .3 and .255 are reserved; .4 is the first usable."},
 {q:"VNet vnet-app is 10.1.0.0/16. Which subnet prefix is invalid?",o:["10.2.0.0/24","10.1.0.0/24","10.1.255.0/24","10.1.128.0/17"],a:0,e:"Subnets must fit in the VNet's address space."},
 {q:"You're deploying Azure Bastion. What must the subnet be?",o:["Named AzureBastionSubnet, /26 or larger","Named BastionSubnet, /29","Any name, /27","GatewaySubnet"],a:0,e:"The name and size are fixed."},
 {q:"A VM's private IP must never change, even across deallocation. What do you set?",o:["A static private IP on the NIC","A Standard public IP","A NAT gateway","A larger subnet"],a:0,e:"Dynamic IPs usually persist but aren't guaranteed for every operation."},
 {q:"Which public IP SKU is secure by default and zone-redundant?",o:["Standard","Basic","Global","Dynamic"],a:0,e:"Basic is retired."},
 {q:"Subnet VMs need reliable outbound internet with a fixed public IP and no inbound exposure. What do you use?",o:["NAT gateway","An instance public IP per VM","An NSG","A private endpoint"],a:0,e:"NAT gateway is the recommended outbound path."},
 {q:"You create a peering from vnet-a to vnet-b only. What's its state?",o:["Initiated","Connected","Disconnected","Pending"],a:0,e:"Create the reverse peering to make it Connected."},
 {q:"vnet-a peers with vnet-hub, and vnet-hub peers with vnet-b. Can VMs in vnet-a reach vnet-b?",o:["No; peering isn't transitive","Yes","Only with global peering","Only over IPv6"],a:0,e:"Add a direct peering or route through an NVA."},
 {q:"Peering fails with VnetAddressSpacesOverlap. What's the fix?",o:["Re-address one VNet so the spaces don't overlap","Use global peering","Enable gateway transit","Add an NSG"],a:0,e:"Overlapping VNets can't be peered."},
 {q:"Spokes must use the hub's VPN gateway to reach on-premises. Which settings?",o:["Allow gateway transit on the hub peering, Use remote gateways on the spoke peering","Use remote gateways on both","Allow forwarded traffic only","A UDR to Internet"],a:0,e:"Gateway transit."},
 {q:"You added 10.5.0.0/16 to a peered VNet. Peered VNets can't reach it. What do you do?",o:["Sync the peering","Delete the VNet","Add an NSG","Restart the VMs"],a:0,e:"Peerings need a sync after address space changes."},
 {q:"Which connects on-premises to Azure privately, without the internet?",o:["ExpressRoute","Site-to-site VPN","Point-to-site VPN","VNet peering"],a:0,e:"A provider circuit."},
 {q:"A remote developer's laptop needs to reach a VNet. Which VPN type?",o:["Point-to-site","Site-to-site","ExpressRoute","Peering"],a:0,e:"P2S is per client."},
 {q:"All internet traffic from spoke subnets must go through a firewall at 10.0.100.4. Which route?",o:["0.0.0.0/0, next hop Virtual appliance 10.0.100.4","10.0.100.4/32, next hop Internet","0.0.0.0/0, next hop None","10.0.0.0/8, next hop VNet gateway"],a:0,e:"Forced tunneling."},
 {q:"Traffic to 10.2.5.9 matches 10.2.0.0/16 (UDR to NVA) and 10.2.5.0/24 (system route to a peered VNet). Which wins?",o:["10.2.5.0/24, the longest prefix","10.2.0.0/16, because UDRs always win","Both, load balanced","Neither"],a:0,e:"Longest prefix first; UDR wins only on ties."},
 {q:"An NVA VM receives traffic but doesn't forward it. What's missing?",o:["IP forwarding on its NIC (and in the OS)","A public IP","Accelerated networking","An ASG"],a:0,e:"NICs drop traffic not addressed to them by default."},
 {q:"How many route tables can one subnet have?",o:["One","Two","Unlimited","None"],a:0,e:"One route table can serve many subnets."},
 {q:"Which next hop type drops traffic?",o:["None","Internet","Virtual network","Virtual appliance"],a:0,e:"Useful for blocking ranges."},
 {q:"An NSG has Allow 3389 at priority 200 and Deny 3389 at priority 100. Is RDP allowed?",o:["No; priority 100 is processed first","Yes; Allow beats Deny","Both apply","It depends on the NIC"],a:0,e:"Lowest number first, stop at first match."},
 {q:"A subnet NSG allows 443 and the NIC NSG has only default rules. Is inbound 443 from the internet allowed?",o:["No; the NIC NSG's default DenyAllInbound blocks it","Yes","Only for the first VM","Only with ASGs"],a:0,e:"Traffic must pass both NSGs."},
 {q:"In what order are NSGs evaluated for inbound traffic?",o:["Subnet NSG, then NIC NSG","NIC NSG, then subnet NSG","Only the NIC NSG","Only the subnet NSG"],a:0,e:"Outbound is the reverse."},
 {q:"Which default inbound rule lets load balancer health probes through?",o:["AllowAzureLoadBalancerInBound","AllowVnetInBound","AllowInternetInBound","DenyAllInBound"],a:0,e:"Probes come from 168.63.129.16."},
 {q:"An NSG allows outbound 443 but doesn't allow the inbound responses. Do responses arrive?",o:["Yes; NSGs are stateful","No","Only for UDP","Only with a NAT gateway"],a:0,e:"Return traffic is automatic."},
 {q:"You want 'allow web servers to reach database servers on 1433' without listing IPs. What do you use?",o:["Application security groups","Service tags","Route tables","Private DNS"],a:0,e:"Rules reference asg-web and asg-db."},
 {q:"Which service tag represents all of the VNet's address space plus peered and connected networks?",o:["VirtualNetwork","Internet","AzureCloud","AzureLoadBalancer"],a:0,e:"Used by AllowVnetInBound."},
 {q:"Which tool tells you which NSG rule blocks a specific packet to a VM?",o:["IP flow verify","Next hop","Connection monitor","Traffic Analytics"],a:0,e:"It names the rule."},
 {q:"Admins need RDP to VMs without public IPs, through the browser. What do you deploy?",o:["Azure Bastion","A VPN gateway","A public load balancer","A NAT gateway"],a:0,e:"RDP/SSH over TLS 443."},
 {q:"Admins want to use their local SSH client through Bastion. Which SKU at minimum?",o:["Standard","Developer","Basic","Free"],a:0,e:"Native client support needs Standard or Premium."},
 {q:"Can Bastion in vnet-hub reach VMs in a peered vnet-spoke?",o:["Yes","No","Only with global peering disabled","Only Windows VMs"],a:0,e:"Bastion works across peering."},
 {q:"A subnet should reach a storage account over the backbone, and the account's firewall should allow only that subnet. Cheapest option?",o:["Service endpoint plus a VNet rule","Private endpoint","ExpressRoute","Public IP rule"],a:0,e:"Service endpoints are free."},
 {q:"On-premises users must reach a SQL database privately, with public access disabled. What do you use?",o:["Private endpoint","Service endpoint","NSG","Public IP"],a:0,e:"Private endpoints work from on-premises."},
 {q:"After creating a private endpoint, clients still resolve the public IP. What's missing?",o:["A privatelink private DNS zone linked to the VNet","A NAT gateway","An NSG rule","A UDR"],a:0,e:"DNS must resolve to the private IP."},
 {q:"You created the zone contoso.com in Azure DNS, but the internet still uses the old DNS host. What's left?",o:["Update the name servers at the domain registrar","Create an A record for @","Create a private DNS zone","Wait 30 days"],a:0,e:"Delegation happens at the registrar."},
 {q:"Which record maps www.contoso.com to contoso-shop.azurewebsites.net?",o:["CNAME","A","MX","SRV"],a:0,e:"CNAME aliases a name to another name."},
 {q:"The apex contoso.com must point to a public IP that may change. Which record?",o:["An alias A record targeting the public IP resource","A CNAME at the apex","A static A record","A TXT record"],a:0,e:"Alias records track the resource."},
 {q:"Which record type proves domain ownership to services like App Service or Microsoft 365?",o:["TXT","MX","PTR","NS"],a:0,e:"Verification strings."},
 {q:"VMs in vnet-app should automatically get DNS names in contoso.internal. What do you configure?",o:["Link the private DNS zone to vnet-app with auto-registration","Create a public zone","Add A records by hand","Use Azure-provided DNS only"],a:0,e:"Registration on the link."},
 {q:"Can vnet-app have auto-registration links to two private DNS zones?",o:["No; one registration zone per VNet","Yes","Only in different regions","Only for Windows VMs"],a:0,e:"Many resolution links, one registration link."},
 {q:"Which load balancer works at layer 4 and spreads TCP traffic across VMs in a region?",o:["Azure Load Balancer","Application Gateway","Front Door","Traffic Manager"],a:0,e:"Layer 4."},
 {q:"You need URL path routing (/images, /api) and a web application firewall for a regional app. Which service?",o:["Application Gateway with WAF","Azure Load Balancer","Traffic Manager","NAT gateway"],a:0,e:"Layer 7, regional."},
 {q:"Users worldwide should hit the closest healthy region of a web app, with caching. Which service?",o:["Azure Front Door","Azure Load Balancer","Application Gateway","Internal load balancer"],a:0,e:"Global layer 7."},
 {q:"VMs behind a Standard load balancer all show unhealthy. The app works. What's the likely cause?",o:["An NSG blocks the health probe or the probe port is wrong","The LB needs Basic SKU","The VMs need public IPs","Session persistence is on"],a:0,e:"Check probe port and AzureLoadBalancer in NSGs."},
 {q:"Users of a stateful app keep losing their session as requests hit different VMs. What do you change?",o:["Session persistence to Client IP","The probe interval","The backend port","Add an inbound NAT rule"],a:0,e:"Client IP affinity."},
 {q:"You need SSH to each of three VMs behind a public load balancer on different ports. What do you add?",o:["Inbound NAT rules","More load-balancing rules on port 22","Health probes","Outbound rules"],a:0,e:"Port 50001 → vm1:22 and so on."},
 {q:"Which feature of an internal Standard load balancer forwards all ports and protocols, for NVAs?",o:["HA ports","Floating IP","Outbound rules","Session persistence"],a:0,e:"Protocol All, port 0."},
 {q:"A VM can't reach the internet. Which tool shows the next hop and the route table that chose it?",o:["Network Watcher Next hop","IP flow verify","Packet capture","Connection monitor"],a:0,e:"Maybe a UDR sends it to an NVA."},
 {q:"You need to test end-to-end whether vm-web can reach sql01 on port 1433, including NSGs and routes. Which tool?",o:["Connection troubleshoot","Next hop","NSG flow logs only","Azure Advisor"],a:0,e:"It reports where the path breaks."},
 {q:"Security wants a record of all traffic flowing through a VNet for analysis. What do you enable?",o:["VNet flow logs with Traffic Analytics","IP flow verify","Bastion session recording","Effective routes"],a:0,e:"Flow logs go to a storage account."}
];

/* ---------- interactive diagrams ---------- */
const ip2n=s=>{const p=String(s).trim().split(".").map(Number);return p.length===4&&p.every(n=>Number.isInteger(n)&&n>=0&&n<=255)?((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3]:null};
const n2ip=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
const parseC=s=>{const m=/^\s*([\d.]+)\/(\d{1,2})\s*$/.exec(s||"");if(!m)return null;const b=+m[2],a=ip2n(m[1]);if(a==null||b>32)return null;const mask=b?(~0<<(32-b))>>>0:0;return {net:(a&mask)>>>0,bits:b,size:2**(32-b),ok:((a&mask)>>>0)===a}};
function vizCidr(){const el=$("#viz-cidr");let bits=24;const seen=new Set();
  function draw(){const c=parseC("10.0.1.0/"+bits);const usable=c.size-5;seen.add(bits);const s=c.net,e=(s+c.size-1)>>>0;
    el.innerHTML=`<div class="viz-title">Subnet calculator · 10.0.1.0/${bits}</div>
    <div class="rng-row"><span>Prefix length</span><input type="range" min="16" max="29" value="${bits}" data-k="b"><b>/${bits}</b></div>
    <div class="kv"><span>Total addresses</span><b class="mono">${c.size.toLocaleString()}</b><span>Usable in Azure</span><b class="mono status-good">${usable.toLocaleString()}</b><span>Range</span><b class="mono">${n2ip(s)} – ${n2ip(e)}</b></div>
    <div class="ip-strip">${[[s,"Network address"],[s+1,"Default gateway"],[s+2,"Azure DNS"],[s+3,"Azure DNS"]].map(x=>`<span class="rsv"><b>${n2ip(x[0]>>>0)}</b>${x[1]}</span>`).join("")}<span class="use"><b>${n2ip((s+4)>>>0)}</b>first usable</span><span class="use"><b>…</b>${(usable-2).toLocaleString()} more</span><span class="use"><b>${n2ip((e-1)>>>0)}</b>last usable</span><span class="rsv"><b>${n2ip(e)}</b>Broadcast</span></div>
    <div class="caption" aria-live="polite">${bits===29?"/29 is the smallest subnet Azure allows: 8 addresses, 3 usable.":bits===26?"/26 is the minimum size for AzureBastionSubnet.":"Azure always keeps the first four addresses and the last one."} <span class="s-small">${seen.size}/14 sizes tried</span></div>`;
    if(seen.has(29)&&seen.has(26)&&seen.size>=5)award("viz:cidr",20,"Sized subnets like a network engineer")}
  el.addEventListener("input",e=>{if(e.target.dataset.k){bits=+e.target.value;draw();el.querySelector('[data-k="b"]').focus()}});draw()}
function vizSubnetPlan(){const el=$("#viz-subnetplan");const V=parseC("10.10.0.0/16");const S=[["snet-web","10.10.1.0/24"],["snet-app","10.10.1.128/25"],["snet-db","10.10.3.0/29"],["AzureBastionSubnet","10.10.4.0/27"],["GatewaySubnet","10.20.0.0/27"]];const val=S.map(x=>x[1]);let won=false;
  function check(){return S.map((x,i)=>{const c=parseC(val[i]);if(!c)return "Not valid CIDR";if(!c.ok)return `Not a network address (try ${n2ip(c.net)}/${c.bits})`;if(c.bits>29)return "Smaller than /29";if(c.net<V.net||c.net+c.size>V.net+V.size)return "Outside 10.10.0.0/16";if(x[0]==="AzureBastionSubnet"&&c.bits>26)return "Bastion needs /26 or larger";
    for(let j=0;j<S.length;j++){if(j===i)continue;const d=parseC(val[j]);if(d&&d.ok&&c.net<d.net+d.size&&d.net<c.net+c.size)return `Overlaps ${S[j][0]}`}return ""})}
  function draw(){const r=check();const ok=r.every(x=>!x);if(ok)won=true;
    el.innerHTML=`<div class="viz-title">Fix the subnet plan for vnet-prod (10.10.0.0/16)</div>
    <div class="sc-list">${S.map((x,i)=>`<label class="${r[i]?"":"done"}" style="grid-template-columns:auto 1fr auto"><span class="mono">${x[0]}</span><input class="txt-in mono" data-i="${i}" value="${esc(val[i])}" aria-label="${x[0]} prefix"><span class="${r[i]?"status-bad":"status-good"} s-small">${r[i]||"✓ OK"}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${ok?'<span class="status-good">Valid plan.</span> Every subnet fits, nothing overlaps, and Bastion has room to scale.':"The architect's draft has four mistakes. Edit the prefixes until every row is OK."}</div>`;
    if(won)award("viz:subnetplan",30,"Fixed a broken subnet plan")}
  el.addEventListener("input",e=>{const i=e.target.dataset.i;if(i==null)return;val[+i]=e.target.value;const p=e.target.selectionStart;draw();const x=el.querySelector(`[data-i="${i}"]`);x.focus();x.setSelectionRange(p,p)});draw()}
function vizPeer(){const el=$("#viz-peer");const L=[["ah","spoke-a ↔ hub"],["hb","hub ↔ spoke-b"],["ab","spoke-a ↔ spoke-b"]];const on={ah:true,hb:true,ab:false};let nva=false;const seen=new Set();
  function reach(x,y){const k=[x,y].sort().join("");const map={ahub:"ah",bhub:"hb",ab:"ab"};const key=x==="hub"||y==="hub"?(x==="a"||y==="a"?"ah":"hb"):"ab";if(on[key])return "direct";if(key==="ab"&&on.ah&&on.hb&&nva)return "via NVA";return ""}
  function draw(){const ab=reach("a","b"),ah=reach("a","hub"),hb=reach("hub","b");seen.add((ab||"none")+(nva?"n":""));
    el.innerHTML=`<div class="viz-title">Is peering transitive?</div>
    <div class="peer-map"><div class="pv">spoke-a<br><span class="s-small">10.1.0.0/16</span></div><div class="pl ${on.ah?"on":""}"></div><div class="pv hub">hub<br><span class="s-small">10.0.0.0/16</span>${nva?'<em>Azure Firewall 10.0.100.4</em>':""}</div><div class="pl ${on.hb?"on":""}"></div><div class="pv">spoke-b<br><span class="s-small">10.2.0.0/16</span></div></div>
    <div class="seg-row">${L.map(l=>`<button class="chip" data-l="${l[0]}" aria-pressed="${on[l[0]]}">Peering ${l[1]}</button>`).join("")}<button class="chip" data-n="1" aria-pressed="${nva}">Firewall in hub + UDRs on spokes + allow forwarded traffic</button></div>
    <div class="kv"><span>spoke-a → hub</span><b class="${ah?"status-good":"status-bad"}">${ah?"✓ Reachable":"✗ No route"}</b><span>hub → spoke-b</span><b class="${hb?"status-good":"status-bad"}">${hb?"✓ Reachable":"✗ No route"}</b><span>spoke-a → spoke-b</span><b class="${ab?"status-good":"status-bad"}">${ab?"✓ Reachable ("+ab+")":"✗ No route"}</b></div>
    <div class="caption" aria-live="polite">${!ab&&on.ah&&on.hb?"Both spokes peer with the hub, but they still can't reach each other: peering isn't transitive.":ab==="via NVA"?"Hub-and-spoke done right: spoke traffic routes through the firewall, which forwards it to the other spoke.":ab==="direct"?"A direct peering works too, but with many spokes you'd need a full mesh of peerings.":"Turn peerings on and off to see what's reachable."} <span class="s-small">${seen.size}/3 outcomes seen</span></div>`;
    if(seen.has("none")&&(seen.has("via NVAn"))&&(seen.has("direct")||seen.has("directn")))award("viz:peer",30,"Proved peering isn't transitive")}
  el.addEventListener("click",e=>{const l=e.target.closest("[data-l]"),n=e.target.closest("[data-n]");if(l)on[l.dataset.l]=!on[l.dataset.l];if(n)nva=!nva;if(l||n)draw()});draw()}
function vizLpm(){const el=$("#viz-lpm");let dst="10.2.5.9";const seen=new Set();
  const R=[["10.0.0.0/16","Virtual network","System","Local VNet"],["10.2.0.0/16","VNet peering","System","Peered spoke"],["10.2.5.0/24","Virtual appliance 10.0.100.4","User","Inspect traffic to the payments subnet"],["0.0.0.0/0","Virtual appliance 10.0.100.4","User","Forced tunneling"],["0.0.0.0/0","Internet","System","Default internet route (overridden)"],["10.9.9.0/24","None","User","Block a decommissioned range"]];
  function pick(ip){const n=ip2n(ip);if(n==null)return null;const m=R.map((r,i)=>({r,i,c:parseC(r[0])})).filter(x=>n>=x.c.net&&n<x.c.net+x.c.size);m.sort((a,b)=>b.c.bits-a.c.bits||(a.r[2]==="User"?-1:1));return {m,best:m[0]}}
  function draw(){const p=pick(dst);if(p&&p.best)seen.add(p.best.i);
    el.innerHTML=`<div class="viz-title">Route selection from snet-web (longest prefix match)</div>
    <div class="dyn-row"><span>Destination IP</span><input class="txt-in mono" data-k="d" value="${esc(dst)}" aria-label="Destination IP"></div>
    <div class="seg-row">${["10.0.3.7","10.2.5.9","10.2.8.1","8.8.8.8","10.9.9.20"].map(x=>`<button class="chip" data-x="${x}">${x}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Prefix</th><th>Next hop</th><th>Source</th><th>Match?</th></tr>${R.map((r,i)=>{const hit=p&&p.m.some(x=>x.i===i);const best=p&&p.best&&p.best.i===i;return `<tr class="${best?"cur":""}"><td class="mono">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="${best?"ok":hit?"dim":""}">${best?"✓ Chosen":hit?"matches, shorter or lower priority":""}</td></tr>`}).join("")}</table></div>
    <div class="caption" aria-live="polite">${!p?"Enter a valid IPv4 address.":`<b>${esc(dst)}</b> → ${p.best.r[1]} (${p.best.r[3]}). ${p.best.r[1]==="None"?"Dropped.":p.m.length>1?"Longest prefix wins; on a tie, the user-defined route beats the system route.":""}`} <span class="s-small">${seen.size}/5 different routes chosen</span></div>`;
    if(seen.size>=5)award("viz:lpm",30,"Mastered longest prefix match")}
  el.addEventListener("input",e=>{if(e.target.dataset.k){dst=e.target.value.trim();const q=e.target.selectionStart;draw();const i=el.querySelector('[data-k="d"]');i.focus();i.setSelectionRange(q,q)}});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(b){dst=b.dataset.x;draw()}});draw()}
function vizNsgEval(){const el=$("#viz-nsgeval");
  const SUB=[[100,"Allow-HTTPS","Internet","443","Allow"],[200,"Allow-SSH-Admins","203.0.113.0/24","22","Allow"],[300,"Deny-SSH","*","22","Deny"]];
  const NIC=[[100,"Deny-HTTPS-Old","198.51.100.0/24","443","Deny"],[400,"Allow-Web","*","443","Allow"]];
  const DEF=[[65000,"AllowVnetInBound","VirtualNetwork","*","Allow"],[65001,"AllowAzureLoadBalancerInBound","AzureLoadBalancer","*","Allow"],[65500,"DenyAllInBound","*","*","Deny"]];
  const P=[["Internet user 52.10.4.8 → 443","52.10.4.8","443"],["Admin 203.0.113.9 → 22","203.0.113.9","22"],["Attacker 52.10.4.8 → 22","52.10.4.8","22"],["Old partner 198.51.100.20 → 443","198.51.100.20","443"],["VM in the VNet 10.0.2.5 → 3389","10.0.2.5","3389"]];
  let pk=0,nicOn=true;const seen=new Set();
  const matchSrc=(rule,ip)=>rule==="*"||rule==="Internet"&&!/^10\./.test(ip)||rule==="VirtualNetwork"&&/^10\./.test(ip)||rule.includes("/")&&(()=>{const c=parseC(rule),n=ip2n(ip);return n>=c.net&&n<c.net+c.size})();
  const ev=(rules,ip,port)=>rules.concat(DEF).find(r=>matchSrc(r[2],ip)&&(r[3]==="*"||r[3]===port));
  function draw(){const p=P[pk];const a=ev(SUB,p[1],p[2]);const b=nicOn?ev(NIC,p[1],p[2]):null;const ok=a[4]==="Allow"&&(!nicOn||b[4]==="Allow");seen.add(pk+(nicOn?"n":""));
    const tbl=(t,rules,hit)=>`<div class="panel"><div class="s-small">${t}</div><div class="tbl-wrap"><table class="tbl"><tr><th>Pri</th><th>Name</th><th>Source</th><th>Port</th><th></th></tr>${rules.concat(DEF).map(r=>`<tr class="${hit===r?"cur":""}"><td>${r[0]}</td><td>${r[1]}</td><td class="mono">${r[2]}</td><td>${r[3]}</td><td class="${hit===r?(r[4]==="Allow"?"ok":"no"):"dim"}">${r[4]}</td></tr>`).join("")}</table></div></div>`;
    el.innerHTML=`<div class="viz-title">NSG evaluator · inbound to vm-web01 (10.0.1.4)</div>
    <div class="seg-row">${P.map((x,i)=>`<button class="chip" data-p="${i}" aria-pressed="${i===pk}">${x[0]}</button>`).join("")}</div>
    <label class="chip"><input type="checkbox" data-k="nic" ${nicOn?"checked":""}> NSG on the NIC too</label>
    <div class="two-col">${tbl("① SUBNET NSG nsg-snet-web",SUB,a)}${nicOn?tbl("② NIC NSG nsg-vm-web01",NIC,b):'<div class="panel s-small">No NSG on the NIC</div>'}</div>
    <div class="verdict ${ok?"ok":"no"}">${ok?"✓ Allowed":"✗ Denied"} · ${a[4]==="Deny"?`subnet rule ${a[1]} (${a[0]})`:nicOn&&b[4]==="Deny"?`NIC rule ${b[1]} (${b[0]})`:`subnet ${a[1]}${nicOn?" then NIC "+b[1]:""}`}</div>
    <div class="caption" aria-live="polite">Inbound: the subnet NSG is checked first, then the NIC NSG. The first matching rule in each decides, and both must allow. <span class="s-small">${seen.size}/10 combinations tried</span></div>`;
    if(seen.size>=7)award("viz:nsgeval",30,"Evaluated NSG rules like Azure does")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b){pk=+b.dataset.p;draw()}});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="nic"){nicOn=e.target.checked;draw()}});draw()}
function vizLbFlow(){const el=$("#viz-lbflow");const VMS=["vm-web1","vm-web2","vm-web3"];const health=[true,true,true];let probeOk=true,persist="None",client=0,log=[];const seen=new Set();
  function send(){const up=VMS.map((v,i)=>health[i]&&probeOk);const live=VMS.filter((v,i)=>up[i]);if(!live.length){log.unshift("✗ No healthy backends: the request times out.");seen.add("down");return}
    const ip=["52.1.1.1","52.2.2.2","52.3.3.3"][client];let t;if(persist==="ClientIP"){t=live[[...ip].reduce((a,c)=>a+c.charCodeAt(0),0)%live.length]}else{t=live[Math.floor(Math.random()*live.length)]}log.unshift(`${ip}:${40000+Math.floor(Math.random()*9999)} → 20.30.40.50:80 → ${t}`);if(live.length<3)seen.add("failover");if(persist==="ClientIP")seen.add("persist");log=log.slice(0,6)}
  function draw(){el.innerHTML=`<div class="viz-title">Load Balancer in action · lb-web (frontend 20.30.40.50:80)</div>
    <div class="lb-row">${VMS.map((v,i)=>`<button class="chip lb-vm ${health[i]&&probeOk?"up":"down"}" data-v="${i}">${v}<br><span class="s-small">${health[i]?(probeOk?"probe ✓":"probe blocked"):"app crashed"}</span></button>`).join("")}</div>
    <div class="seg-row"><span class="s-small">Session persistence:</span>${["None","ClientIP"].map(x=>`<button class="chip" data-s="${x}" aria-pressed="${persist===x}">${x==="None"?"None (5-tuple)":"Client IP"}</button>`).join("")}<span class="s-small">Client:</span>${[0,1,2].map(i=>`<button class="chip" data-c="${i}" aria-pressed="${client===i}">User ${i+1}</button>`).join("")}</div>
    <label class="chip"><input type="checkbox" data-k="nsg" ${probeOk?"":"checked"}> NSG blocks AzureLoadBalancer (probe traffic)</label>
    <div class="viz-controls"><button class="btn" data-a="send">Send request</button><button class="btn" data-a="burst">Send 5</button></div>
    <pre class="term" style="min-height:0">${log.map(esc).join("\n")||"Tap a VM to crash or fix it, then send requests."}</pre>
    <div class="caption" aria-live="polite">${!probeOk?"Every probe fails, so the load balancer marks all VMs unhealthy even though the app works. Allow the AzureLoadBalancer tag in the NSG.":persist==="ClientIP"?"With client IP persistence, each user sticks to one VM (until it fails).":"Unhealthy VMs stop receiving new flows."} <span class="s-small">Seen: ${["failover","persist","down"].filter(x=>seen.has(x)).length}/3</span></div>`;
    if(seen.has("failover")&&seen.has("persist")&&seen.has("down"))award("viz:lbflow",30,"Broke and fixed a load balancer")}
  el.addEventListener("click",e=>{const v=e.target.closest("[data-v]"),s=e.target.closest("[data-s]"),c=e.target.closest("[data-c]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(v)health[+v.dataset.v]=!health[+v.dataset.v];if(s)persist=s.dataset.s;if(c)client=+c.dataset.c;if(a==="send")send();if(a==="burst")for(let i=0;i<5;i++)send();if(v||s||c||a)draw()});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="nsg"){probeOk=!e.target.checked;draw()}});draw()}

registerModule({
  id:"net",slug:"networking",title:"Implement and Manage Virtual Networking",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["cidr","subnetplan","peer","peersettings","lpm","udrq","nsgeval","asg","bastion","pedns","dnsrec","pdnsdrill","lbflow","lbpick","nwpick"],
  viz(){
vizCidr();vizSubnetPlan();vizPeer();
quizViz($("#viz-peersettings"),{title:"Peering settings",done:"Configured every peering correctly",qs:[
  ["vnet-hub has a VPN gateway. vnet-spoke should use it to reach on-premises. What do you set on the hub's peering?",["Allow gateway transit","Use remote gateways","Allow forwarded traffic only"],0,"And Use remote gateways on the spoke's peering."],
  ["Traffic from spoke-a to spoke-b goes through a firewall in the hub. Which peering setting must be on for the firewall's forwarded packets?",["Allow forwarded traffic","Allow gateway transit","Use remote gateways"],0,"Traffic that didn't originate in the peer VNet."],
  ["vnet-a (East US) must peer with vnet-b (Japan East). Allowed?",["Yes, global peering","No, only regional","Only through VPN"],0,"Global peering crosses regions."],
  ["You only created the peering on vnet-a. VMs can't talk. Why?",["The peering is Initiated; create the reverse peering on vnet-b","Global peering is off","An NSG blocks it"],0,"Both sides are needed."],
  ["vnet-a (10.0.0.0/16) and vnet-b (10.0.128.0/17). Can they be peered?",["No; 10.0.128.0/17 is inside 10.0.0.0/16","Yes","Only with gateway transit"],0,"Overlapping address spaces."]]});
vizLpm();
quizViz($("#viz-udrq"),{title:"Routing scenarios",done:"Solved every routing scenario",qs:[
  ["You associate a route table with 0.0.0.0/0 → Virtual appliance 10.0.100.4 to snet-web. Which traffic is affected?",["Traffic leaving snet-web","Traffic entering snet-web","All subnets in the VNet"],0,"Route tables apply to outbound traffic from their subnets."],
  ["The firewall drops nothing, but spoke VMs lose internet after adding the route. The firewall VM shows no traffic. What's likely missing?",["IP forwarding on the firewall NIC","A public IP on each VM","A private DNS zone"],0,"Without IP forwarding the NIC drops forwarded packets."],
  ["Block all traffic from a subnet to 10.9.9.0/24.",["UDR 10.9.9.0/24 with next hop None","UDR 10.9.9.0/24 to Internet","Delete the system routes"],0,"None drops it (an NSG works too)."],
  ["On-premises routes learned by BGP should not reach the DMZ subnet.",["Disable gateway route propagation on its route table","Delete the VPN gateway","Add an NSG"],0,"Propagation can be turned off per route table."],
  ["How do you see the routes that actually apply to vm-web01?",["Effective routes on its NIC (or Next hop)","The route table only","Activity log"],0,"Effective routes combine system, BGP and user routes."]]});
vizNsgEval();
stepViz($("#viz-asg"),{title:"Rules by role with application security groups",done:"Built rules with application security groups",steps:[
  ["Create ASGs","asg-web and asg-db, in the same region as the VNet."],
  ["Add NICs","Put vm-web01 and vm-web02 NICs in asg-web, sql01 and sql02 NICs in asg-db. A NIC can be in several ASGs."],
  ["Write rules by role","Allow Internet → asg-web on 443. Allow asg-web → asg-db on 1433. Deny * → asg-db on everything else."],
  ["Scale without editing rules","A new web server just joins asg-web and immediately gets the right access. No IP addresses to maintain."],
  ["Limits","All NICs in an ASG must be in the same VNet. Rules can use ASGs as source and destination together only if both are in that VNet."]]});
stepViz($("#viz-bastion"),{title:"Connecting through Azure Bastion",done:"Followed a Bastion connection",steps:[
  ["Admin opens the portal","Select vm-db01 → Connect → Bastion. vm-db01 has no public IP and port 3389 isn't open to the internet."],
  ["TLS on 443","The browser connects to the Bastion host's public IP over HTTPS. Nothing else is exposed."],
  ["Bastion in its subnet","Bastion lives in AzureBastionSubnet (/26+) and has a Standard public IP."],
  ["Private hop","Bastion opens RDP (3389) or SSH (22) to the VM's private IP. The VM's NSG must allow it from the Bastion subnet."],
  ["Peered VNets too","The same Bastion reaches VMs in peered spokes, so one per hub is enough."],
  ["Native client (Standard+)","az network bastion ssh --name bas-hub -g rg-hub --target-resource-id <vm id> --auth-type AAD"]]});
stepViz($("#viz-pedns"),{title:"How a private endpoint resolves",done:"Followed private endpoint DNS",steps:[
  ["App asks for stfin4410.blob.core.windows.net","The VM in vnet-app sends the query to Azure-provided DNS (168.63.129.16)."],
  ["CNAME to privatelink","Public DNS answers: stfin4410.blob.core.windows.net is a CNAME for stfin4410.privatelink.blob.core.windows.net."],
  ["Private zone answers","Because the private DNS zone privatelink.blob.core.windows.net is linked to vnet-app, it answers with the private endpoint's IP, 10.20.2.5."],
  ["Traffic stays private","The VM connects to 10.20.2.5. With public access disabled, nobody outside can reach the account."],
  ["Without the zone link","The same query returns the public IP, and the connection is refused because public access is disabled. Always check DNS first."],
  ["From on-premises","Forward queries for privatelink zones to the Azure DNS Private Resolver's inbound endpoint."]]});
sortViz($("#viz-dnsrec"),{title:"Which DNS record?",bins:{a:"A",cname:"CNAME",alias:"Alias",mx:"MX",txt:"TXT",ns:"NS"},
  items:[["www.contoso.com → contoso-shop.azurewebsites.net","cname","Name to name."],["api.contoso.com → 20.30.40.50","a","Name to IPv4."],["contoso.com (apex) → a public IP resource that might change","alias","Tracks the resource."],["Deliver mail for contoso.com to Microsoft 365","mx","Mail exchanger."],["Prove you own contoso.com to App Service (asuid)","txt","Verification."],["Delegate dev.contoso.com to another zone","ns","Child zone delegation."]],done:"Picked every DNS record type"});
azViz($("#viz-pdnsdrill"),{title:"Cloud Shell drill: private DNS with auto-registration",scenario:"Give VMs in <b>vnet-app</b> automatic names in <b>contoso.internal</b>. vm-app01 and vm-app02 already exist.",
  setup:(w,AZ)=>{w.rgs["rg-net"]={name:"rg-net",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-net -n vnet-app --address-prefixes 10.30.0.0/16 --subnet-name snet-app --subnet-prefixes 10.30.1.0/24");AZ.newVm(w,"rg-net","vm-app01",{vnet:"vnet-app",subnet:"snet-app",pip:""});AZ.newVm(w,"rg-net","vm-app02",{vnet:"vnet-app",subnet:"snet-app",pip:""})},
  tasks:[{t:"Create the private DNS zone <b>contoso.internal</b> in rg-net.",hint:"az network private-dns zone create -g rg-net -n contoso.internal",check:w=>w.res.some(r=>r.t==="pdns"&&r.name==="contoso.internal")},
    {t:"Link it to vnet-app with <b>registration enabled</b>.",hint:"az network private-dns link vnet create -g rg-net -z contoso.internal -n link-app -v vnet-app -e true",check:w=>{const z=w.res.find(r=>r.t==="pdns"&&r.name==="contoso.internal");return z&&z.p.links.some(l=>l.reg)}},
    {t:"List the zone's A records: the VMs registered themselves.",hint:"az network private-dns record-set a list -g rg-net -z contoso.internal -o table",sticky:true,check:w=>w._listed}],
  onCmd:(l,w,r)=>{if(/private-dns record-set a list/.test(l)&&r&&!r.err)w._listed=true},
  solution:"az network private-dns zone create -g rg-net -n contoso.internal\naz network private-dns link vnet create -g rg-net -z contoso.internal -n link-app -v vnet-app -e true\naz network private-dns record-set a list -g rg-net -z contoso.internal -o table"},"pdnsdrill",40,"Set up private DNS auto-registration");
vizLbFlow();
sortViz($("#viz-lbpick"),{title:"Which load balancing service?",bins:{lb:"Load Balancer",agw:"Application Gateway",afd:"Front Door",tm:"Traffic Manager"},
  items:[["Spread TCP 1433 across SQL VMs on an internal IP","lb","Layer 4, regional."],["Route /api to one pool and /images to another, with a WAF, in one region","agw","Layer 7, regional."],["Global HTTP entry point with caching and WAF at the edge","afd","Layer 7, global."],["DNS-based failover between regions for a non-HTTP app","tm","DNS routing."],["UDP game servers behind one public IP","lb","Layer 4 handles UDP."],["TLS termination and cookie-based affinity for a regional web app","agw","Layer 7 features."]],done:"Picked every load balancing service"});
sortViz($("#viz-nwpick"),{title:"Which Network Watcher tool?",bins:{ipf:"IP flow verify",nh:"Next hop",ct:"Connection troubleshoot",fl:"Flow logs",pc:"Packet capture"},
  items:[["Is inbound TCP 22 from 203.0.113.5 allowed to vm-web01, and by which rule?","ipf","Packet-level NSG check."],["Where does traffic from vm-web01 to 8.8.8.8 go?","nh","Routes."],["Can vm-app reach sql01:1433 end to end, and where does it fail?","ct","Path test."],["Keep a record of all allowed and denied flows for a month","fl","Logging."],["Capture the actual packets on vm-web01 for Wireshark","pc","Deep inspection."]],done:"Picked every Network Watcher tool"});
  },
  sims:[
    {id:"hubspoke",type:"cli",title:"Build a hub and spoke",shell:"both",
      scenario:"Contoso wants a hub VNet for shared services and a spoke for the app team. An old <b>vnet-legacy</b> (10.0.0.0/16) already exists. Build the network and connect it.",
      setup:(w,AZ)=>{w.rgs["rg-net"]={name:"rg-net",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-net -n vnet-legacy --address-prefixes 10.0.0.0/16 --subnet-name default --subnet-prefixes 10.0.0.0/24")},
      tasks:[
        {t:"Create <b>vnet-hub</b> with address space <b>10.100.0.0/16</b> and a subnet <b>snet-shared</b> (10.100.1.0/24).",hint:"az network vnet create -g rg-net -n vnet-hub --address-prefixes 10.100.0.0/16 --subnet-name snet-shared --subnet-prefixes 10.100.1.0/24",psHint:'New-AzVirtualNetwork -ResourceGroupName rg-net -Name vnet-hub -Location eastus -AddressPrefix 10.100.0.0/16',check:w=>{const v=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-hub");return v&&v.p.space.includes("10.100.0.0/16")}},
        {t:"Add <b>AzureBastionSubnet</b> to the hub. Pick a prefix big enough for Bastion.",hint:"az network vnet subnet create -g rg-net --vnet-name vnet-hub -n AzureBastionSubnet --address-prefixes 10.100.255.0/26",check:w=>{const v=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-hub");return v&&v.p.subnets.some(s=>s.name==="AzureBastionSubnet")}},
        {t:"Create <b>vnet-spoke1</b> (10.101.0.0/16) with subnet <b>snet-app</b> (10.101.1.0/24).",hint:"az network vnet create -g rg-net -n vnet-spoke1 --address-prefixes 10.101.0.0/16 --subnet-name snet-app --subnet-prefixes 10.101.1.0/24",check:w=>w.res.some(r=>r.t==="vnet"&&r.name==="vnet-spoke1")},
        {t:"Peer the hub and spoke in <b>both</b> directions, so both peerings show <b>Connected</b>.",hint:"az network vnet peering create -g rg-net -n hub-to-spoke1 --vnet-name vnet-hub --remote-vnet vnet-spoke1 --allow-vnet-access --allow-forwarded-traffic\naz network vnet peering create -g rg-net -n spoke1-to-hub --vnet-name vnet-spoke1 --remote-vnet vnet-hub --allow-vnet-access --allow-forwarded-traffic",check:w=>{const h=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-hub"),s=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-spoke1");return h&&s&&h.p.peerings.some(p=>p.remote==="vnet-spoke1"&&p.state==="Connected")&&s.p.peerings.some(p=>p.remote==="vnet-hub"&&p.state==="Connected")}},
        {t:"Try peering the hub with <b>vnet-legacy</b>. It works… but what about spoke1 and legacy? Try peering <b>vnet-spoke1</b> to vnet-legacy too and list the results.",hint:"az network vnet peering create -g rg-net -n hub-to-legacy --vnet-name vnet-hub --remote-vnet vnet-legacy\naz network vnet peering list -g rg-net --vnet-name vnet-hub -o table",sticky:true,check:w=>{const h=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-hub");return h&&h.p.peerings.some(p=>p.remote==="vnet-legacy")}}],
      success:"Hub and spoke connected. Remember: spoke1 can't reach vnet-legacy through the hub, because peering isn't transitive.",
      solution:"az network vnet create -g rg-net -n vnet-hub --address-prefixes 10.100.0.0/16 --subnet-name snet-shared --subnet-prefixes 10.100.1.0/24\naz network vnet subnet create -g rg-net --vnet-name vnet-hub -n AzureBastionSubnet --address-prefixes 10.100.255.0/26\naz network vnet create -g rg-net -n vnet-spoke1 --address-prefixes 10.101.0.0/16 --subnet-name snet-app --subnet-prefixes 10.101.1.0/24\naz network vnet peering create -g rg-net -n hub-to-spoke1 --vnet-name vnet-hub --remote-vnet vnet-spoke1 --allow-vnet-access --allow-forwarded-traffic\naz network vnet peering create -g rg-net -n spoke1-to-hub --vnet-name vnet-spoke1 --remote-vnet vnet-hub --allow-vnet-access --allow-forwarded-traffic\naz network vnet peering create -g rg-net -n hub-to-legacy --vnet-name vnet-hub --remote-vnet vnet-legacy\naz network vnet peering list -g rg-net --vnet-name vnet-hub -o table"},
    {id:"nsglab",type:"cli",title:"Lock down the web tier with NSGs",shell:"bash",
      scenario:"<b>vm-web01</b> (10.40.1.4) in snet-web serves HTTPS. Only HTTPS from the internet and SSH from the admin network <b>203.0.113.0/24</b> should get in. Prove it with IP flow verify.",
      setup:(w,AZ)=>{w.rgs["rg-web"]={name:"rg-web",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-web -n vnet-web --address-prefixes 10.40.0.0/16 --subnet-name snet-web --subnet-prefixes 10.40.1.0/24");AZ.newVm(w,"rg-web","vm-web01",{vnet:"vnet-web",subnet:"snet-web",nsg:"",image:"Ubuntu2204"})},
      tasks:[
        {t:"Create an NSG named <b>nsg-web</b>.",hint:"az network nsg create -g rg-web -n nsg-web",check:w=>w.res.some(r=>r.t==="nsg"&&r.name==="nsg-web")},
        {t:"Allow <b>TCP 443</b> inbound from <b>Internet</b> at priority <b>100</b>.",hint:"az network nsg rule create -g rg-web --nsg-name nsg-web -n allow-https --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes Internet --destination-port-ranges 443",check:w=>{const n=w.res.find(r=>r.t==="nsg"&&r.name==="nsg-web");return n&&n.p.rules.some(x=>x.access==="Allow"&&x.dir==="Inbound"&&(x.port||[]).includes("443"))}},
        {t:"Allow <b>TCP 22</b> inbound from <b>203.0.113.0/24</b> only, at priority <b>110</b>.",hint:"az network nsg rule create -g rg-web --nsg-name nsg-web -n allow-ssh-admins --priority 110 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 203.0.113.0/24 --destination-port-ranges 22",check:w=>{const n=w.res.find(r=>r.t==="nsg"&&r.name==="nsg-web");return n&&n.p.rules.some(x=>x.access==="Allow"&&(x.port||[]).includes("22")&&(x.src||[]).includes("203.0.113.0/24"))}},
        {t:"Associate nsg-web with the <b>snet-web</b> subnet.",hint:"az network vnet subnet update -g rg-web --vnet-name vnet-web -n snet-web --network-security-group nsg-web",check:w=>{const v=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-web");return v&&v.p.subnets.some(s=>s.name==="snet-web"&&s.nsg==="nsg-web")}},
        {t:"Use <b>IP flow verify</b> to confirm SSH from <b>198.51.100.7</b> is <b>denied</b> and HTTPS from it is <b>allowed</b>.",hint:"az network watcher test-ip-flow -g rg-web --vm vm-web01 --direction Inbound --protocol TCP --local 10.40.1.4:22 --remote 198.51.100.7:50000\naz network watcher test-ip-flow -g rg-web --vm vm-web01 --direction Inbound --protocol TCP --local 10.40.1.4:443 --remote 198.51.100.7:50000",sticky:true,check:w=>w._deny22&&w._allow443}],
      onCmd:(l,w,r)=>{if(/test-ip-flow/.test(l)&&r&&r.raw){const s=JSON.stringify(r.raw);if(/:22\b/.test(l)&&/Deny/.test(s))w._deny22=true;if(/:443\b/.test(l)&&/Allow/.test(s))w._allow443=true}},
      success:"The web tier accepts HTTPS from anyone, SSH from admins only, and IP flow verify names the rule behind each decision.",
      solution:"az network nsg create -g rg-web -n nsg-web\naz network nsg rule create -g rg-web --nsg-name nsg-web -n allow-https --priority 100 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes Internet --destination-port-ranges 443\naz network nsg rule create -g rg-web --nsg-name nsg-web -n allow-ssh-admins --priority 110 --direction Inbound --access Allow --protocol Tcp --source-address-prefixes 203.0.113.0/24 --destination-port-ranges 22\naz network vnet subnet update -g rg-web --vnet-name vnet-web -n snet-web --network-security-group nsg-web\naz network watcher test-ip-flow -g rg-web --vm vm-web01 --direction Inbound --protocol TCP --local 10.40.1.4:22 --remote 198.51.100.7:50000\naz network watcher test-ip-flow -g rg-web --vm vm-web01 --direction Inbound --protocol TCP --local 10.40.1.4:443 --remote 198.51.100.7:50000"},
    {id:"routelab",type:"cli",title:"Force traffic through a firewall",shell:"bash",
      scenario:"Security wants every internet-bound packet from <b>snet-app</b> to pass through the firewall VM <b>vm-nva</b> (10.50.2.4) in snet-fw. Route it, make the NVA forward, and verify with Next hop.",
      setup:(w,AZ)=>{w.rgs["rg-sec"]={name:"rg-sec",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-sec -n vnet-sec --address-prefixes 10.50.0.0/16 --subnet-name snet-app --subnet-prefixes 10.50.1.0/24");AZ.exec(w,"az network vnet subnet create -g rg-sec --vnet-name vnet-sec -n snet-fw --address-prefixes 10.50.2.0/24");AZ.newVm(w,"rg-sec","vm-app01",{vnet:"vnet-sec",subnet:"snet-app",pip:""});AZ.newVm(w,"rg-sec","vm-nva",{vnet:"vnet-sec",subnet:"snet-fw",ip:"10.50.2.4"})},
      tasks:[
        {t:"Create a route table <b>rt-app</b>.",hint:"az network route-table create -g rg-sec -n rt-app",check:w=>w.res.some(r=>r.t==="rt"&&r.name==="rt-app")},
        {t:"Add a route <b>default-to-fw</b>: 0.0.0.0/0 → <b>VirtualAppliance</b> 10.50.2.4.",hint:"az network route-table route create -g rg-sec --route-table-name rt-app -n default-to-fw --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.50.2.4",check:w=>{const t=w.res.find(r=>r.t==="rt"&&r.name==="rt-app");return t&&t.p.routes.some(x=>x.prefix==="0.0.0.0/0"&&/virtualappliance/i.test(x.type)&&x.ip==="10.50.2.4")}},
        {t:"Associate rt-app with <b>snet-app</b>.",hint:"az network vnet subnet update -g rg-sec --vnet-name vnet-sec -n snet-app --route-table rt-app",check:w=>{const v=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-sec");return v&&v.p.subnets.some(s=>s.name==="snet-app"&&s.rt==="rt-app")}},
        {t:"Turn on <b>IP forwarding</b> on vm-nva's NIC (<b>vm-nvaVMNic</b>).",hint:"az network nic update -g rg-sec -n vm-nvaVMNic --ip-forwarding true",check:w=>{const n=w.res.find(r=>r.t==="nic"&&r.name==="vm-nvaVMNic");return n&&n.p.ipForwarding}},
        {t:"Run <b>Next hop</b> from vm-app01 to 8.8.8.8 and confirm it goes to the appliance.",hint:"az network watcher show-next-hop -g rg-sec --vm vm-app01 --source-ip 10.50.1.4 --dest-ip 8.8.8.8",sticky:true,check:w=>w._nh}],
      onCmd:(l,w,r)=>{if(/show-next-hop/.test(l)&&r&&r.raw&&/VirtualAppliance/.test(JSON.stringify(r.raw)))w._nh=true},
      success:"snet-app's internet traffic now flows through the firewall, and Next hop proves it.",
      solution:"az network route-table create -g rg-sec -n rt-app\naz network route-table route create -g rg-sec --route-table-name rt-app -n default-to-fw --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.50.2.4\naz network vnet subnet update -g rg-sec --vnet-name vnet-sec -n snet-app --route-table rt-app\naz network nic update -g rg-sec -n vm-nvaVMNic --ip-forwarding true\naz network watcher show-next-hop -g rg-sec --vm vm-app01 --source-ip 10.50.1.4 --dest-ip 8.8.8.8"},
    {id:"lblab",type:"cli",title:"Publish a web farm behind a load balancer",shell:"bash",
      scenario:"Two web VMs (vm-web1, vm-web2) are ready in snet-web. Put a public Standard load balancer in front of them with an HTTP health probe and a rule for port 80.",
      setup:(w,AZ)=>{w.rgs["rg-lb"]={name:"rg-lb",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-lb -n vnet-lb --address-prefixes 10.60.0.0/16 --subnet-name snet-web --subnet-prefixes 10.60.1.0/24");["vm-web1","vm-web2"].forEach(n=>AZ.newVm(w,"rg-lb",n,{vnet:"vnet-lb",subnet:"snet-web",pip:""}))},
      tasks:[
        {t:"Create a public IP <b>pip-lb</b> (Standard).",hint:"az network public-ip create -g rg-lb -n pip-lb --sku Standard",check:w=>w.res.some(r=>r.t==="pip"&&r.name==="pip-lb")},
        {t:"Create <b>lb-web</b> (Standard) using pip-lb, with a backend pool <b>bepool-web</b>.",hint:"az network lb create -g rg-lb -n lb-web --sku Standard --public-ip-address pip-lb --frontend-ip-name fe-web --backend-pool-name bepool-web",check:w=>w.res.some(r=>r.t==="lb"&&r.name==="lb-web")},
        {t:"Add an <b>HTTP</b> health probe <b>probe-http</b> on port 80, path <b>/</b>.",hint:"az network lb probe create -g rg-lb --lb-name lb-web -n probe-http --protocol Http --port 80 --path /",check:w=>{const l=w.res.find(r=>r.t==="lb"&&r.name==="lb-web");return l&&l.p.probes.some(p=>p.name==="probe-http")}},
        {t:"Add a load-balancing rule <b>rule-http</b>: TCP 80 → 80, using the probe.",hint:"az network lb rule create -g rg-lb --lb-name lb-web -n rule-http --protocol Tcp --frontend-port 80 --backend-port 80 --frontend-ip-name fe-web --backend-pool-name bepool-web --probe-name probe-http",check:w=>{const l=w.res.find(r=>r.t==="lb"&&r.name==="lb-web");return l&&l.p.rules.some(p=>p.name==="rule-http")}},
        {t:"Add both VM NICs to bepool-web.",hint:"az network nic ip-config address-pool add -g rg-lb --nic-name vm-web1VMNic --ip-config-name ipconfigvm-web1 --lb-name lb-web --address-pool bepool-web\naz network nic ip-config address-pool add -g rg-lb --nic-name vm-web2VMNic --ip-config-name ipconfigvm-web2 --lb-name lb-web --address-pool bepool-web",check:w=>{const l=w.res.find(r=>r.t==="lb"&&r.name==="lb-web");return l&&l.p.pools.some(p=>p.members.length>=2)}}],
      success:"Requests to pip-lb now spread across both VMs, and a failed probe pulls a VM out of rotation automatically.",
      solution:"az network public-ip create -g rg-lb -n pip-lb --sku Standard\naz network lb create -g rg-lb -n lb-web --sku Standard --public-ip-address pip-lb --frontend-ip-name fe-web --backend-pool-name bepool-web\naz network lb probe create -g rg-lb --lb-name lb-web -n probe-http --protocol Http --port 80 --path /\naz network lb rule create -g rg-lb --lb-name lb-web -n rule-http --protocol Tcp --frontend-port 80 --backend-port 80 --frontend-ip-name fe-web --backend-pool-name bepool-web --probe-name probe-http\naz network nic ip-config address-pool add -g rg-lb --nic-name vm-web1VMNic --ip-config-name ipconfigvm-web1 --lb-name lb-web --address-pool bepool-web\naz network nic ip-config address-pool add -g rg-lb --nic-name vm-web2VMNic --ip-config-name ipconfigvm-web2 --lb-name lb-web --address-pool bepool-web\naz network lb show -g rg-lb -n lb-web -o table"},
    {id:"nettrouble",type:"choice",title:"Network troubleshooting",
      scenario:"The network team's queue is full. Find the root cause of each ticket.",
      steps:[
        ["'Spoke-a can't reach spoke-b, but both reach the hub.'",["Peering isn't transitive; add a direct peering or route via a hub firewall","The NSG default rules block VNet traffic","Global peering is required"],0,"Classic hub-and-spoke gotcha."],
        ["'Peering to the partner VNet fails: VnetAddressSpacesOverlap.'",["Re-address one network; overlapping spaces can't be peered","Use Allow gateway transit","Create the reverse peering first"],0,"Plan address spaces up front."],
        ["'The new subnet NSG allows 443, but HTTPS to the VM still fails.'",["The NIC also has an NSG that denies it; both must allow","NSGs are stateless","Priority 100 is reserved"],0,"Check effective security rules."],
        ["'After adding a 0.0.0.0/0 route to the firewall, the app subnet lost internet.'",["IP forwarding is off on the firewall NIC (or its OS)","The route needs next hop Internet","Route tables only affect inbound"],0,"Next hop and effective routes help confirm."],
        ["'Clients resolve the storage account's public IP even with a private endpoint.'",["Link the privatelink.blob.core.windows.net zone to the VNet","Add a service endpoint","Disable the firewall"],0,"DNS is the usual culprit."],
        ["'All backend VMs show unhealthy in the load balancer.'",["An NSG or OS firewall blocks the probe from AzureLoadBalancer, or the probe port is wrong","The VMs need public IPs","Use the Basic SKU"],0,"Probes come from 168.63.129.16."],
        ["'We can't deploy Bastion: subnet too small.'",["AzureBastionSubnet must be /26 or larger","Bastion needs GatewaySubnet","Bastion needs a NAT gateway"],0,"Fixed name and minimum size."]],
      success:"Network tickets cleared."}
  ],
  badges:[
    ["reader","NW","Network Scholar","Mark all 7 networking lessons studied",c=>c.allStudied()],
    ["lab","NL","Network Lab","Complete all 15 diagrams in this module",c=>c.vizAll()],
    ["hubspoke","HS","Hub and Spoke","Pass the hub-and-spoke lab",c=>c.passed("hubspoke")],
    ["nsglab","NSG","Gatekeeper","Pass the NSG lab",c=>c.passed("nsglab")],
    ["routelab","UDR","Traffic Cop","Pass the forced-tunneling lab",c=>c.passed("routelab")],
    ["lblab","LB","Balancing Act","Pass the load balancer lab",c=>c.passed("lblab")],
    ["peer","PT","Not Transitive","Prove peering isn't transitive in the peering diagram",c=>c.earned("viz:peer")],
    ["trouble","NT","Packet Detective","Pass the network troubleshooting simulation",c=>c.passed("nettrouble")],
    ["perfect","NW+","Zero Packet Loss","Score 100% on a networking quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
