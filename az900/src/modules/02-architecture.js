/* ================= Module 2: Azure Architecture and Services (AZ-900 Domain 2, 35–40%) ================= */
(function(){
const LESSONS=[
{id:"regions",num:"2.1",title:"Regions, region pairs and sovereign regions",html:`
<p>An <b>Azure region</b> is a geographical area containing at least one, and often several, datacenters connected by a low-latency network. Azure has more than 60 regions. When you deploy a resource, you usually choose its region.</p>
<ul><li>Pick a region close to your users for lower latency, and one that meets your <b>data residency</b> rules.</li>
<li>Some services or VM sizes are available only in certain regions. A few services are <b>global</b> and don't need a region, such as Microsoft Entra ID, Azure Traffic Manager and Azure DNS.</li></ul>
<h3>Region pairs</h3>
<p>Most regions are paired with another region in the same <b>geography</b> (such as the US, Europe or Asia), usually at least <b>300 miles apart</b>. If a disaster hits one region, the other can take over.</p>
<ul><li>Platform updates roll out to <b>one region in a pair at a time</b>, to reduce the risk of both going down.</li>
<li>In a broad outage, one region from every pair is <b>prioritized for recovery</b>.</li>
<li>Data stays in the same geography as its pair for tax and legal reasons. <b>Brazil South</b> is the exception: it pairs with South Central US, outside its geography.</li>
<li>Most pairs are two-way. Some are one-way: Brazil South's secondary is South Central US, but South Central US's secondary is North Central US.</li>
<li>Some newer regions have no pair and use availability zones for resilience instead.</li></ul>
<h3>Sovereign regions</h3>
<p><b>Sovereign regions</b> are Azure instances isolated from the main Azure cloud for legal or compliance reasons.</p>
<ul><li><b>Azure Government</b> (US DoD Central, US Gov Virginia, US Gov Iowa and others): for US government agencies and partners. Operated by screened US personnel and physically isolated.</li>
<li><b>Azure in China</b> (China East, China North): operated by <b>21Vianet</b>, not directly by Microsoft. Physically separated from the rest of Azure.</li></ul>
<div class="viz" id="viz-map"></div>`},
{id:"zones",num:"2.2",title:"Availability zones and datacenters",html:`
<p>Azure <b>datacenters</b> are facilities full of racks of servers, with their own power, cooling and networking. You don't choose a datacenter directly; they're grouped into availability zones and regions.</p>
<p><b>Availability zones</b> are physically separate datacenters within one region. Each zone has <b>independent power, cooling and networking</b>, and is connected to the others by high-speed private fiber. If one zone goes down, the others keep working. Every zone-enabled region has a <b>minimum of three zones</b>.</p>
<ul><li><b>Zonal services</b>: you pin the resource to a specific zone, such as a VM, managed disk or IP address.</li>
<li><b>Zone-redundant services</b>: the platform replicates across zones automatically, such as zone-redundant storage and Azure SQL Database.</li>
<li><b>Non-regional services</b>: always available, even if a whole region fails.</li></ul>
<p>Running copies in multiple zones may cost more (extra VMs and data transfer between zones), but it protects you from a datacenter-level failure. For protection against a whole-region outage, use the <b>paired region</b>.</p>
<div class="viz" id="viz-az"></div>
<div class="viz" id="viz-azsort"></div>`},
{id:"hier",num:"2.3",title:"Resources, resource groups, subscriptions and management groups",html:`
<ul><li><b>Resource</b>: the basic building block. Anything you create: a VM, virtual network, database, storage account.</li>
<li><b>Resource group</b>: a logical container for resources that share a lifecycle, such as one app's VMs, network and database.
<ul><li>Each resource is in <b>exactly one</b> resource group. You can move resources between groups.</li>
<li>Resource groups <b>can't be nested</b>.</li>
<li><b>Deleting a resource group deletes everything in it.</b></li>
<li>Access and policy applied to a resource group apply to every resource inside it.</li></ul></li>
<li><b>Subscription</b>: a unit of management, billing and scale. You need an <b>Azure account</b> to create subscriptions. A subscription is both a <b>billing boundary</b> (each gets its own invoice and cost reports) and an <b>access control boundary</b>. Companies often create separate subscriptions for environments (dev, test, production), departments or billing needs.</li>
<li><b>Management group</b>: a container for subscriptions (and other management groups). Policies and access assigned to a management group are <b>inherited</b> by every subscription under it.
<ul><li>Up to <b>10,000</b> management groups in a single directory.</li>
<li>The tree can be up to <b>six levels deep</b>, not counting the root level or the subscription level.</li>
<li>Each management group and subscription has <b>one parent</b>.</li></ul></li></ul>
<p>The hierarchy, top to bottom: <b>management groups → subscriptions → resource groups → resources</b>. Settings flow down.</p>
<div class="viz" id="viz-hier"></div>
<div class="viz" id="viz-inherit"></div>`},
{id:"compute",num:"2.4",title:"Compute types: VMs, containers and functions",html:`
<ul><li><b>Virtual machines</b> (IaaS): full control of the OS and software. Best for lift-and-shift, custom software, or when you need total control. You manage patches and configuration.</li>
<li><b>Containers</b>: a lightweight, portable way to run apps. A container packages the app and its dependencies but shares the host's OS kernel, so it starts in seconds and many fit on one host. Azure options:
<ul><li><b>Azure Container Instances (ACI)</b>: the fastest, simplest way to run a container. PaaS, no VMs to manage.</li>
<li><b>Azure Container Apps</b>: serverless containers with built-in load balancing and scaling.</li>
<li><b>Azure Kubernetes Service (AKS)</b>: a managed Kubernetes service to orchestrate many containers.</li></ul></li>
<li><b>Azure Functions</b>: serverless, event-driven code. No servers to manage; you pay only while the code runs. Functions can be <b>stateless</b> (the default) or <b>stateful</b> (Durable Functions).</li></ul>
<div class="viz" id="viz-compute"></div>
<div class="viz" id="viz-pickcomp"></div>`},
{id:"vmopts",num:"2.5",title:"VM options: scale sets, availability sets and Azure Virtual Desktop",html:`
<h3>Virtual Machine Scale Sets</h3>
<p>Create and manage a group of <b>identical, load-balanced VMs</b>. The number of instances can grow or shrink automatically with demand or on a schedule. Great for large-scale services like web front ends and big compute.</p>
<h3>Availability sets</h3>
<p>Spread VMs so a single hardware failure or update doesn't take them all down. There's no extra charge; you pay only for the VMs.</p>
<ul><li><b>Fault domains</b>: groups of VMs that share power and networking, like a server rack. Up to <b>3</b> fault domains.</li>
<li><b>Update domains</b>: groups of VMs that can be rebooted at the same time during planned maintenance. Only one update domain is updated at a time. <b>5 by default</b>, up to <b>20</b>.</li></ul>
<div class="viz" id="viz-avset"></div>
<h3>Azure Virtual Desktop</h3>
<p><b>Azure Virtual Desktop</b> is desktop and app virtualization in the cloud. Users get a full Windows desktop (including <b>Windows 11 or 10 multi-session</b>) from any device, and data stays in the cloud, not on the device. It uses Microsoft Entra ID and supports MFA and Conditional Access.</p>
<div class="viz" id="viz-vmopt"></div>`},
{id:"vmres",num:"2.6",title:"VM resources and application hosting",html:`
<h3>What a VM needs</h3>
<ul><li><b>Size</b>: the CPU, memory and GPU.</li>
<li><b>Image</b>: the operating system, such as Windows Server or Ubuntu.</li>
<li><b>Storage disks</b>: an OS disk and optional data disks (managed disks).</li>
<li><b>Networking</b>: a <b>virtual network</b> and <b>subnet</b>, a <b>network interface (NIC)</b>, optionally a <b>public IP address</b>, and a <b>network security group (NSG)</b> to filter traffic.</li></ul>
<div class="viz" id="viz-vmparts"></div>
<h3>Application hosting options</h3>
<ul><li><b>Azure App Service</b>: an HTTP-based PaaS for hosting <b>web apps</b>, <b>API apps</b>, <b>WebJobs</b> (background tasks) and <b>mobile back ends</b>. Supports .NET, Java, Node.js, Python and PHP on Windows or Linux, with built-in autoscale, load balancing and deployment from GitHub or Azure DevOps.</li>
<li><b>Containers</b>: ACI, Container Apps or AKS, when you've packaged your app in containers.</li>
<li><b>Virtual machines</b>: when you need full control of the server.</li></ul>
<div class="viz" id="viz-host"></div>`},
{id:"vnet",num:"2.7",title:"Virtual networking",html:`
<p>An <b>Azure virtual network (VNet)</b> lets Azure resources talk to each other, to the internet and to your on-premises networks. VNets provide <b>isolation and segmentation</b>, <b>internet communication</b>, communication between Azure resources, communication with on-premises resources, and <b>routing</b> and <b>filtering</b> of traffic.</p>
<ul><li><b>Subnets</b> divide a VNet's address space into segments, such as a web tier and a data tier. Resources in subnets of the same VNet can communicate by default.</li>
<li><b>Virtual network peering</b> connects two VNets directly. Traffic is private and stays on the <b>Microsoft backbone</b>, never the public internet. <b>Global peering</b> connects VNets in different regions. Peering isn't transitive.</li>
<li><b>Network security groups</b> filter traffic in and out of subnets and NICs by IP, port and protocol.</li>
<li><b>Azure DNS</b> hosts your DNS domains on Azure's global name servers, so you manage records with the same credentials, billing and tools as your other Azure resources. You can't buy domain names with Azure DNS, but you can host them. It supports <b>private DNS zones</b> for names inside your VNets.</li></ul>
<h3>Connecting to on-premises</h3>
<ul><li><b>Azure VPN Gateway</b>: sends <b>encrypted traffic over the public internet</b>.
<ul><li><b>Site-to-site</b>: connect an office network to Azure.</li>
<li><b>Point-to-site</b>: connect a single device, such as a laptop at home.</li>
<li><b>Network-to-network</b>: connect two Azure VNets through gateways.</li>
<li>Gateways can be <b>policy-based</b> or <b>route-based</b> (more common), and deployed active/standby, active/active or zone-redundant for high availability.</li></ul></li>
<li><b>Azure ExpressRoute</b>: a <b>private connection</b> through a connectivity provider that <b>doesn't go over the public internet</b>. More reliable, faster, lower latency and more secure than VPN. It connects to Azure and Microsoft 365. Models include colocation at a cloud exchange, point-to-point Ethernet, any-to-any (IPVPN) networks and ExpressRoute Direct. <b>ExpressRoute Global Reach</b> links your on-premises sites to each other through Microsoft's network.</li></ul>
<div class="viz" id="viz-net"></div>
<div class="viz" id="viz-netq"></div>`},
{id:"endp",num:"2.8",title:"Public and private endpoints",html:`
<p>An <b>endpoint</b> is the address a service is reached at.</p>
<ul><li><b>Public endpoint</b>: a public IP address or DNS name reachable from the internet. Many PaaS services, like Azure Storage and Azure SQL Database, have one by default. You can still limit it with firewall rules.</li>
<li><b>Private endpoint</b>: a network interface with a <b>private IP address from your virtual network</b>, connected to a PaaS service through <b>Azure Private Link</b>. Traffic travels over the Microsoft backbone, never the public internet, and you can turn off the public endpoint completely. Your on-premises network can also reach it through VPN or ExpressRoute.</li></ul>
<div class="viz" id="viz-endp"></div>`},
{id:"storage",num:"2.9",title:"Storage services and storage accounts",html:`
<h3>Azure Storage services</h3>
<ul><li><b>Azure Blobs</b>: massively scalable object storage for <b>unstructured data</b> such as text, images, video, logs and backups. Reached over HTTP/HTTPS from anywhere. Also the base of Azure Data Lake Storage for big data analytics.</li>
<li><b>Azure Files</b>: fully managed <b>file shares</b> using <b>SMB</b> or <b>NFS</b>. Mount them at the same time from cloud or on-premises machines running Windows, Linux or macOS.</li>
<li><b>Azure Queues</b>: store large numbers of <b>messages</b> (up to 64 KB each) for asynchronous processing between app components.</li>
<li><b>Azure Tables</b>: a <b>NoSQL</b> store for structured, schemaless key/attribute data.</li>
<li><b>Azure Disks</b>: block-level storage volumes (managed disks) for Azure VMs.</li></ul>
<div class="viz" id="viz-stor"></div>
<h3>Storage accounts</h3>
<p>A <b>storage account</b> holds your data objects and gives them a unique namespace. The name must be <b>globally unique</b>, 3 to 24 characters, lowercase letters and numbers only. Each service gets its own endpoint, such as <code>https://mystorage.blob.core.windows.net</code>, <code>.file.</code>, <code>.queue.</code>, <code>.table.</code> and <code>.dfs.</code> (Data Lake).</p>
<ul><li><b>Standard general-purpose v2</b>: the default for most scenarios. Supports Blob (including Data Lake), Queue, Table and Azure Files, and every redundancy option.</li>
<li><b>Premium block blobs</b>: high transaction rates or low latency. LRS or ZRS.</li>
<li><b>Premium file shares</b>: enterprise or high-performance file shares. LRS or ZRS.</li>
<li><b>Premium page blobs</b>: page blobs only (the format behind VM disks). LRS only.</li></ul>
<div class="viz" id="viz-acct"></div>`},
{id:"tiers",num:"2.10",title:"Storage tiers",html:`
<p>Blob storage has <b>access tiers</b> that trade storage cost against access cost:</p>
<ul><li><b>Hot</b>: data accessed frequently, like website images. Highest storage cost, lowest access cost.</li>
<li><b>Cool</b>: infrequently accessed data stored for at least <b>30 days</b>, like short-term backups.</li>
<li><b>Cold</b>: rarely accessed data stored for at least <b>90 days</b>.</li>
<li><b>Archive</b>: rarely accessed data stored for at least <b>180 days</b>, with flexible latency of <b>hours</b>. Archived blobs are offline: you must <b>rehydrate</b> them to an online tier before reading, which can take up to 15 hours. Lowest storage cost, highest access cost.</li></ul>
<p>Only hot, cool and cold can be set at the account level. Archive is set on individual blobs. Deleting or moving data out of cool, cold or archive before the minimum period incurs an early deletion charge.</p>
<div class="viz" id="viz-tier"></div>`},
{id:"redund",num:"2.11",title:"Redundancy options",html:`
<p>Azure Storage always keeps multiple copies of your data. You choose how far apart they are:</p>
<h3>In the primary region</h3>
<ul><li><b>Locally redundant storage (LRS)</b>: <b>three copies in a single datacenter</b>. Cheapest. Protects against server rack and drive failures, but not a datacenter disaster. At least 11 nines (99.999999999%) durability.</li>
<li><b>Zone-redundant storage (ZRS)</b>: three copies across <b>three availability zones</b>. Data stays readable and writable if a zone goes down. At least 12 nines.</li></ul>
<h3>Also in a secondary region</h3>
<ul><li><b>Geo-redundant storage (GRS)</b>: LRS in the primary region, plus an <b>asynchronous</b> copy to LRS in the paired secondary region. At least 16 nines.</li>
<li><b>Geo-zone-redundant storage (GZRS)</b>: ZRS in the primary region, plus LRS in the secondary. The most protection for both availability and durability.</li>
<li>With GRS and GZRS, the secondary copy <b>can't be read until a failover</b>. Add <b>read access</b> with <b>RA-GRS</b> or <b>RA-GZRS</b> to read from the secondary region at any time.</li></ul>
<div class="viz" id="viz-redund"></div>`},
{id:"move",num:"2.12",title:"Moving files and migrating to Azure",html:`
<h3>Moving files</h3>
<ul><li><b>AzCopy</b>: a <b>command-line</b> tool to copy blobs or files to, from or between storage accounts. It can sync in <b>one direction only</b>.</li>
<li><b>Azure Storage Explorer</b>: a free <b>graphical app</b> for Windows, macOS and Linux to manage storage accounts. It uses AzCopy behind the scenes.</li>
<li><b>Azure File Sync</b>: centralizes file shares in Azure Files while keeping a <b>local cache on Windows file servers</b>. Use any protocol Windows Server supports (SMB, NFS, FTPS), keep as many caches as you need worldwide, replace a failed server by installing File Sync on a new one, and use <b>cloud tiering</b> so frequently used files stay local.</li></ul>
<h3>Migrating</h3>
<ul><li><b>Azure Migrate</b>: a central <b>hub</b> to discover, assess and migrate on-premises servers, databases, web apps and virtual desktops to Azure. Integrated tools include <b>Discovery and assessment</b>, <b>Migration and modernization</b> (for servers), <b>Data Migration Assistant</b>, <b>Azure Database Migration Service</b> and the <b>Web app migration assistant</b>.</li>
<li><b>Azure Data Box</b>: a rugged <b>physical device</b> (up to 80 TB usable) that Microsoft ships to you. You load your data, ship it back, and Microsoft uploads it. Use it when you have <b>large amounts of data and little or no network bandwidth</b>: one-time migrations, initial bulk transfers, or exporting data out of Azure for disaster recovery. Data is AES-256 encrypted and the device is wiped to NIST 800-88 standards after upload.</li></ul>
<div class="viz" id="viz-move"></div>
<div class="viz" id="viz-movesort"></div>`},
{id:"identity",num:"2.13",title:"Identity: Microsoft Entra ID and authentication",html:`
<h3>Directory services</h3>
<ul><li><b>Microsoft Entra ID</b> (formerly Azure Active Directory): Microsoft's cloud-based identity and access management service. It provides <b>authentication</b>, <b>single sign-on</b>, <b>application management</b>, <b>device management</b>, and <b>identity protection</b> that flags risky sign-ins. Use <b>Microsoft Entra Connect</b> to sync users from on-premises Active Directory, so people use one identity everywhere (hybrid identity).</li>
<li><b>Microsoft Entra Domain Services</b>: managed domain services such as <b>domain join</b>, <b>Group Policy</b>, <b>LDAP</b> and <b>Kerberos/NTLM</b> authentication, without deploying or patching domain controllers. Use it to run legacy apps in the cloud that can't use modern authentication. It syncs one way from Entra ID.</li></ul>
<div class="viz" id="viz-entra"></div>
<h3>Authentication methods</h3>
<ul><li><b>Single sign-on (SSO)</b>: sign in once and reach many apps. Fewer passwords means fewer forgotten and reused passwords.</li>
<li><b>Multifactor authentication (MFA)</b>: prove identity with two or more kinds of factor: <b>something you know</b> (password), <b>something you have</b> (phone, security key), <b>something you are</b> (fingerprint, face).</li>
<li><b>Passwordless</b>: remove the password and use something you have plus something you are or know: <b>Windows Hello for Business</b>, the <b>Microsoft Authenticator app</b>, or <b>FIDO2 security keys</b>.</li></ul>
<div class="viz" id="viz-auth"></div>
<h3>External identities</h3>
<p><b>External identities</b> let people outside your organization use their own credentials:</p>
<ul><li><b>B2B collaboration</b>: partners sign in with their own work, school or social account and appear as <b>guest users</b> in your directory.</li>
<li><b>B2B direct connect</b>: a mutual, two-way trust with another Entra organization, used for Teams shared channels.</li>
<li><b>Customer identity (Azure AD B2C, now Microsoft Entra External ID)</b>: sign-up and sign-in for customers of your public-facing apps.</li></ul>
<div class="viz" id="viz-ext"></div>`},
{id:"access",num:"2.14",title:"Conditional Access and Azure RBAC",html:`
<h3>Microsoft Entra Conditional Access</h3>
<p>Conditional Access uses <b>signals</b> to make an access <b>decision</b> and <b>enforce</b> it, like an if-then policy engine.</p>
<ul><li><b>Signals</b>: who the user is and their group, the location (IP address), the device and its compliance, the app being accessed, and real-time sign-in risk.</li>
<li><b>Decisions</b>: <b>allow</b> access, <b>require extra steps</b> such as MFA or a compliant device, or <b>block</b> access.</li></ul>
<p>Examples: require MFA for admins, block sign-ins from certain countries, or only allow a sensitive app from managed devices.</p>
<div class="viz" id="viz-ca"></div>
<h3>Azure role-based access control (RBAC)</h3>
<p>Azure RBAC controls <b>what people can do</b> with Azure resources. You assign a <b>role</b> to a <b>security principal</b> (a user, group or app) at a <b>scope</b>.</p>
<ul><li>Built-in roles include <b>Owner</b> (full access, including granting access to others), <b>Contributor</b> (create and manage everything, but can't grant access), <b>Reader</b> (view only) and <b>User Access Administrator</b> (manage access only).</li>
<li>Scopes: <b>management group</b>, <b>subscription</b>, <b>resource group</b> or a single <b>resource</b>.</li>
<li>Roles are <b>inherited</b>: a role at a resource group applies to every resource in it.</li>
<li>RBAC is an <b>allow</b> model and permissions are <b>additive</b>: two roles give the union of their permissions.</li>
<li>It's enforced on every action that goes through <b>Azure Resource Manager</b>.</li>
<li>Follow <b>least privilege</b>: give the smallest role at the narrowest scope that does the job.</li></ul>
<div class="viz" id="viz-rbac"></div>`},
{id:"defense",num:"2.15",title:"Zero Trust, defense in depth and Microsoft Defender for Cloud",html:`
<h3>Zero Trust</h3>
<p><b>Zero Trust</b> assumes the worst and verifies every request as though it came from an uncontrolled network. Its three principles:</p>
<ul><li><b>Verify explicitly</b>: authenticate and authorize using every available signal.</li>
<li><b>Use least privilege access</b>: just-in-time and just-enough access.</li>
<li><b>Assume breach</b>: segment access, encrypt end to end, and use analytics to detect threats.</li></ul>
<p>Instead of trusting everything inside the corporate network, Zero Trust checks the user, device and context on each request.</p>
<div class="viz" id="viz-zt"></div>
<h3>Defense in depth</h3>
<p>Defense in depth uses <b>layers</b> of protection so that if one layer is breached, the next one slows the attack. From the outside in:</p>
<ol><li><b>Physical security</b>: controlling access to the datacenter buildings.</li>
<li><b>Identity and access</b>: SSO, MFA, auditing sign-ins.</li>
<li><b>Perimeter</b>: DDoS protection and perimeter firewalls.</li>
<li><b>Network</b>: segmentation and deny-by-default rules, limiting traffic between resources.</li>
<li><b>Compute</b>: securing VMs, patching, endpoint protection.</li>
<li><b>Application</b>: secure code, no secrets stored in code.</li>
<li><b>Data</b>: protecting the data itself, the attacker's real target.</li></ol>
<div class="viz" id="viz-did"></div>
<h3>Microsoft Defender for Cloud</h3>
<p><b>Microsoft Defender for Cloud</b> is a monitoring tool for <b>security posture management</b> and <b>threat protection</b>. It covers Azure, <b>on-premises</b> (through Azure Arc) and <b>other clouds</b> such as AWS and Google Cloud. It does three things:</p>
<ul><li><b>Assess</b>: continuously scans your resources for vulnerabilities and misconfigurations.</li>
<li><b>Secure</b>: gives a <b>secure score</b> and prioritized recommendations, based on the Microsoft cloud security benchmark.</li>
<li><b>Defend</b>: raises security alerts and offers workload protections, such as just-in-time VM access.</li></ul>
<div class="viz" id="viz-score"></div>`}
];

const G={
 core:[["Azure region","A geographical area with one or more datacenters connected by a low-latency network"],["Region pair","Two regions in the same geography, usually 300+ miles apart, for disaster recovery"],["Why region pairs matter","Updates roll out to one region of a pair at a time, and one region per pair is prioritized for recovery"],["Region pair exception","Brazil South pairs with South Central US, outside its geography"],["One-way pair example","Brazil South → South Central US, but South Central US → North Central US"],["Sovereign region","An Azure instance isolated from the main cloud for compliance or legal reasons"],["Azure Government","Sovereign cloud for US government agencies, run by screened US personnel"],["Azure in China","Sovereign cloud operated by 21Vianet, physically separated"],["Examples of global (non-regional) services","Microsoft Entra ID, Azure Traffic Manager, Azure DNS"],["Availability zone","A physically separate datacenter group in a region with its own power, cooling and networking"],["Minimum number of zones in a zone-enabled region","Three"],["Zonal service","You pin the resource to one zone (VMs, managed disks, IP addresses)"],["Zone-redundant service","The platform replicates across zones automatically (ZRS, Azure SQL Database)"],["Azure datacenter","A facility of racked servers with dedicated power, cooling and networking"],["Protect against a datacenter failure","Deploy across availability zones"],["Protect against a region-wide outage","Use a second region (the region pair)"],["Resource","Anything you create in Azure: VM, VNet, database, storage account"],["Resource group","A logical container for resources that share a lifecycle"],["Can resource groups be nested?","No"],["How many resource groups can a resource be in?","Exactly one (it can be moved)"],["What happens when you delete a resource group?","Every resource in it is deleted"],["Subscription","A unit of management, billing and scale; a billing and access control boundary"],["Why create multiple subscriptions?","Separate environments, departments, billing, or to stay under subscription limits"],["Management group","A container for subscriptions; policies and access are inherited by everything below"],["Management group limits","10,000 per directory; up to six levels deep (excluding root and subscriptions)"],["Azure hierarchy, top to bottom","Management groups → subscriptions → resource groups → resources"],["What do you need to create a subscription?","An Azure account"]],
 compute:[["Azure Virtual Machines","IaaS VMs with full control of the OS"],["When to use a VM","Lift-and-shift, custom software, full OS control, testing"],["Virtual Machine Scale Sets","Identical, load-balanced VMs that scale automatically"],["Availability set","Spreads VMs across fault and update domains; no extra cost"],["Fault domain","VMs sharing power and network, like a rack; up to 3"],["Update domain","VMs rebooted together during planned maintenance; 5 by default, up to 20"],["Azure Virtual Desktop","Cloud-hosted Windows desktops and apps, including Windows 11/10 multi-session"],["Benefit of Azure Virtual Desktop","Data stays in the cloud, not on users' devices; access from any device"],["Container","A lightweight package of an app and its dependencies that shares the host OS kernel"],["Containers vs VMs","Containers start in seconds and share the OS kernel; VMs virtualize hardware and run a full OS"],["Azure Container Instances","The fastest, simplest way to run a container in Azure (PaaS)"],["Azure Container Apps","Serverless containers with built-in load balancing and scaling"],["Azure Kubernetes Service","Managed Kubernetes for orchestrating many containers"],["Azure Functions","Event-driven serverless code; pay only while it runs"],["Durable Functions","Stateful functions that keep context between runs"],["Resources a VM needs","Size, image, disks, VNet/subnet, NIC, optional public IP, NSG"],["Network interface (NIC)","Connects a VM to a subnet"],["Azure App Service","PaaS for web apps, API apps, WebJobs and mobile back ends"],["WebJobs","Background tasks that run in App Service"],["App Service languages",".NET, Java, Node.js, Python and PHP on Windows or Linux"]],
 net:[["Azure virtual network (VNet)","Private network in Azure for isolation, segmentation, routing and filtering"],["Subnet","A segment of a VNet's address space"],["Network security group (NSG)","Filters traffic by IP, port and protocol on subnets and NICs"],["Virtual network peering","Connects VNets privately over the Microsoft backbone"],["Global VNet peering","Peering VNets in different regions"],["Is VNet peering transitive?","No"],["Azure DNS","Hosts DNS domains on Azure's name servers; can't register domain names"],["Private DNS zone","DNS names that resolve only inside your VNets"],["Azure VPN Gateway","Encrypted traffic between Azure and on-premises over the public internet"],["Site-to-site VPN","Connects an on-premises network to Azure"],["Point-to-site VPN","Connects a single device to Azure"],["Network-to-network VPN","Connects two Azure VNets through gateways"],["Policy-based vs route-based VPN","Policy-based uses static IP rules; route-based uses routing tables (more common)"],["Azure ExpressRoute","Private connection to Microsoft through a provider; doesn't use the public internet"],["ExpressRoute benefits","Reliability, speed, lower latency, more security; reaches Microsoft 365 too"],["ExpressRoute Global Reach","Links on-premises sites to each other over Microsoft's network"],["ExpressRoute connectivity models","Cloud exchange colocation, point-to-point Ethernet, any-to-any (IPVPN), ExpressRoute Direct"],["Public endpoint","A public IP or DNS name reachable from the internet"],["Private endpoint","A private IP in your VNet for a PaaS service, using Azure Private Link"],["Benefit of a private endpoint","Traffic stays on the Microsoft backbone and public access can be disabled"]],
 storage:[["Azure Blob storage","Object storage for unstructured data: images, video, backups, logs"],["Azure Files","Managed SMB or NFS file shares, mountable from cloud or on-premises"],["Azure Queues","Stores messages (up to 64 KB each) for asynchronous processing"],["Azure Tables","NoSQL key/attribute store for structured, schemaless data"],["Azure Disks","Block-level managed disks for VMs"],["Azure Data Lake Storage","Big data analytics storage built on Blob storage"],["Storage account name rules","Globally unique, 3–24 characters, lowercase letters and numbers"],["Blob endpoint format","https://<account>.blob.core.windows.net"],["Standard general-purpose v2","Default account type: Blob, Queue, Table and Files with every redundancy option"],["Premium block blobs","High-transaction or low-latency blob storage; LRS or ZRS"],["Premium file shares","High-performance file shares; LRS or ZRS"],["Premium page blobs","Page blobs only; LRS only"],["Hot tier","Frequently accessed data; highest storage cost, lowest access cost"],["Cool tier","Infrequent access, stored at least 30 days"],["Cold tier","Rarely accessed, stored at least 90 days"],["Archive tier","Rarely accessed, at least 180 days, offline with latency of hours"],["Rehydration","Moving an archived blob to an online tier before it can be read (up to 15 hours)"],["Which tiers can be the account default?","Hot, cool and cold (archive is per blob)"],["Early deletion charge","Fee for removing data from cool, cold or archive before the minimum period"],["LRS","Three copies in one datacenter; at least 11 nines"],["ZRS","Three copies across three availability zones; at least 12 nines"],["GRS","LRS in the primary plus async LRS in the paired region; at least 16 nines"],["GZRS","ZRS in the primary plus LRS in the secondary region"],["RA-GRS / RA-GZRS","Adds read access to the secondary region at any time"],["Can you read GRS secondary data without failover?","No; you need RA-GRS or RA-GZRS"],["AzCopy","Command-line tool to copy data to and from storage; one-way sync"],["Azure Storage Explorer","Free GUI app to manage storage; uses AzCopy underneath"],["Azure File Sync","Syncs Windows file servers with Azure Files; local cache and cloud tiering"],["Cloud tiering","File Sync keeps frequently used files local and moves the rest to Azure"],["Azure Migrate","Hub to discover, assess and migrate on-premises workloads to Azure"],["Azure Data Box","Physical device (up to 80 TB) to ship data to or from Azure"],["When to use Data Box","Large data sets with little or no network bandwidth"]],
 id:[["Microsoft Entra ID","Cloud identity and access management (formerly Azure AD)"],["Entra ID capabilities","Authentication, SSO, app management, device management, identity protection"],["Microsoft Entra Connect","Syncs users from on-premises Active Directory to Entra ID"],["Microsoft Entra Domain Services","Managed domain join, Group Policy, LDAP and Kerberos/NTLM without domain controllers"],["When to use Entra Domain Services","Running legacy apps that need traditional domain authentication in the cloud"],["Single sign-on (SSO)","Sign in once to access many apps"],["Multifactor authentication","Two or more of: something you know, have, or are"],["Passwordless options","Windows Hello for Business, Microsoft Authenticator app, FIDO2 security keys"],["B2B collaboration","Partners use their own accounts and appear as guests"],["B2B direct connect","Two-way trust with another Entra organization (Teams shared channels)"],["Customer identity (Azure AD B2C / Entra External ID)","Sign-up and sign-in for customers of your apps"],["Conditional Access","Uses signals to allow, require MFA/compliant device, or block access"],["Conditional Access signals","User or group, location (IP), device, application, sign-in risk"],["Azure RBAC","Controls what principals can do with Azure resources at a scope"],["Owner role","Full access, including assigning roles to others"],["Contributor role","Create and manage all resources, but can't grant access"],["Reader role","View resources only"],["User Access Administrator","Manages user access to resources"],["RBAC scopes","Management group, subscription, resource group, resource"],["Is RBAC inherited?","Yes, by every child scope"],["RBAC model","Allow model; permissions are additive"],["Least privilege","Give only the access needed, at the narrowest scope"],["Zero Trust principles","Verify explicitly, use least privilege access, assume breach"],["Defense in depth","Layers of security so one breach doesn't expose everything"],["Defense in depth layers (outside in)","Physical, identity and access, perimeter, network, compute, application, data"],["Perimeter layer","DDoS protection and perimeter firewalls"],["Network layer","Segmentation and deny-by-default traffic rules"],["Microsoft Defender for Cloud","Security posture management and threat protection for Azure, on-premises and other clouds"],["Secure score","Defender for Cloud's measure of security posture; rises as you fix recommendations"],["Defender for Cloud: three functions","Assess, secure, defend"],["Just-in-time VM access","Opens management ports only when needed, for a limited time"]]
};
const DECKS=[["core","Regions, zones and hierarchy"],["compute","Compute and hosting"],["net","Networking"],["storage","Storage and migration"],["id","Identity, access and security"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"What is an Azure region?",o:["A geographical area with one or more datacenters connected by a low-latency network","A single server rack","A billing account","A virtual network"],a:0,e:"Regions group nearby datacenters."},
 {q:"Why are Azure regions paired?",o:["To provide disaster recovery and staggered updates","To double the price","To share a single datacenter","To connect to on-premises networks"],a:0,e:"Pairs support recovery and roll out updates one region at a time."},
 {q:"Region pairs are usually at least how far apart?",o:["300 miles","3 miles","30 miles","3,000 miles"],a:0,e:"Distance protects against regional disasters."},
 {q:"Which region is paired with a region outside its own geography?",o:["Brazil South","West Europe","East US","Japan East"],a:0,e:"Brazil South pairs with South Central US."},
 {q:"During a broad outage affecting multiple regions, what does Azure do with region pairs?",o:["Prioritizes recovery of one region from every pair","Shuts down both regions","Moves all data to a third geography","Nothing different"],a:0,e:"One region per pair is prioritized."},
 {q:"A US government agency needs a cloud operated by screened US personnel. Which should it use?",o:["Azure Government","A standard public region","Azure in China","A region pair"],a:0,e:"Azure Government is a sovereign cloud for US agencies."},
 {q:"Who operates Azure in China?",o:["21Vianet","Microsoft directly","The Chinese government","AWS"],a:0,e:"Azure China is operated by 21Vianet."},
 {q:"Which is a sovereign region?",o:["US Gov Virginia","East US 2","North Europe","Australia East"],a:0,e:"US Gov regions are part of Azure Government."},
 {q:"What is an availability zone?",o:["A physically separate datacenter location within a region with independent power, cooling and networking","Another name for a region pair","A resource group","A subnet"],a:0,e:"Zones isolate failures inside a region."},
 {q:"What is the minimum number of availability zones in a zone-enabled region?",o:["Three","One","Two","Six"],a:0,e:"Zone-enabled regions have at least three zones."},
 {q:"You deploy VMs in three availability zones. What does this protect against?",o:["A datacenter or zone failure","A whole-region outage","Accidental deletion","Application bugs"],a:0,e:"Zones protect within a region. Use another region for regional outages."},
 {q:"Which protects an app from an entire Azure region going offline?",o:["Deploying to a second region","Using an availability set","Adding more VMs in the same zone","Using LRS"],a:0,e:"Only another region survives a regional outage."},
 {q:"A VM that you pin to Zone 2 is an example of a:",o:["Zonal service","Zone-redundant service","Non-regional service","Sovereign service"],a:0,e:"Zonal resources are placed in a specific zone."},
 {q:"Azure SQL Database replicating automatically across zones is an example of a:",o:["Zone-redundant service","Zonal service","Region pair","Management group"],a:0,e:"The platform handles replication across zones."},
 {q:"Which Azure service is global and doesn't require choosing a region?",o:["Microsoft Entra ID","Azure Virtual Machines","Azure Storage account","Azure SQL Database"],a:0,e:"Entra ID, Traffic Manager and Azure DNS are global."},
 {q:"What is a resource group?",o:["A logical container for resources that share a lifecycle","A billing invoice","A collection of subscriptions","A physical datacenter"],a:0,e:"Resource groups organize related resources."},
 {q:"Can a resource belong to more than one resource group?",o:["No, only one","Yes, up to two","Yes, unlimited","Only VMs can"],a:0,e:"Each resource lives in exactly one group, though it can be moved."},
 {q:"You delete a resource group that contains a VM, a disk and a VNet. What happens?",o:["All three resources are deleted","Only the group is deleted","The resources move to another group","Nothing until you confirm each one"],a:0,e:"Deleting a group deletes everything in it."},
 {q:"Can resource groups be nested inside other resource groups?",o:["No","Yes, up to six levels","Yes, unlimited","Only in production"],a:0,e:"Resource groups are flat."},
 {q:"What is an Azure subscription?",o:["A unit of management, billing and scale","A container of management groups","A type of VM","A DNS zone"],a:0,e:"Subscriptions are billing and access boundaries."},
 {q:"A company wants each department to get its own Azure invoice. What should it create?",o:["A separate subscription for each department","A separate resource group for each department","More availability zones","A region pair"],a:0,e:"Subscriptions are billing boundaries."},
 {q:"What is the purpose of management groups?",o:["To organize subscriptions and apply policy and access across them","To store blobs","To create VMs","To connect VNets"],a:0,e:"Management groups sit above subscriptions."},
 {q:"An Azure Policy is assigned to a management group. Which resources does it apply to?",o:["All subscriptions, resource groups and resources under it","Only the management group itself","Only new subscriptions created after today","Nothing until assigned to each resource"],a:0,e:"Settings are inherited down the hierarchy."},
 {q:"What is the correct order of the Azure hierarchy, from top to bottom?",o:["Management groups, subscriptions, resource groups, resources","Subscriptions, management groups, resources, resource groups","Resource groups, subscriptions, resources, management groups","Resources, resource groups, management groups, subscriptions"],a:0,e:"MG → subscription → RG → resource."},
 {q:"How many levels deep can a management group hierarchy be?",o:["Six (excluding root and subscriptions)","Two","Ten","Unlimited"],a:0,e:"Six levels, not counting the root or subscription level."},
 {q:"Which compute option gives you the MOST control over the operating system?",o:["Azure Virtual Machines","Azure Functions","Azure Container Instances","Azure App Service"],a:0,e:"VMs are IaaS with full OS control."},
 {q:"How do containers differ from VMs?",o:["Containers share the host OS kernel and start faster","Containers include a full guest OS","Containers can't run in Azure","Containers are always more expensive"],a:0,e:"Containers are lightweight and portable."},
 {q:"Which is the fastest and simplest way to run a single container in Azure without managing VMs?",o:["Azure Container Instances","Azure Kubernetes Service","Azure Virtual Desktop","Availability sets"],a:0,e:"ACI is the simplest container option."},
 {q:"A team needs to orchestrate hundreds of containers with automatic scaling and self-healing. Which service?",o:["Azure Kubernetes Service","Azure Container Instances","Azure Files","Azure DNS"],a:0,e:"AKS is managed Kubernetes."},
 {q:"Which service runs code in response to events, scaling automatically and billing only while the code runs?",o:["Azure Functions","Azure Virtual Machines","Azure Virtual Desktop","Azure ExpressRoute"],a:0,e:"Functions is serverless and event-driven."},
 {q:"Which service creates a group of identical, load-balanced VMs that scale automatically?",o:["Virtual Machine Scale Sets","Availability sets","Azure Container Instances","Resource groups"],a:0,e:"Scale sets manage identical VMs at scale."},
 {q:"What is an availability set?",o:["A way to spread VMs across fault domains and update domains","A group of regions","A type of storage redundancy","A Conditional Access policy"],a:0,e:"Availability sets protect against rack failures and planned maintenance."},
 {q:"In an availability set, what does a fault domain represent?",o:["VMs that share a power source and network switch, like a rack","VMs that are updated together","VMs in different regions","A billing boundary"],a:0,e:"Fault domains are physical failure boundaries."},
 {q:"In an availability set, what does an update domain represent?",o:["VMs that can be rebooted together during planned maintenance","VMs on the same rack","VMs in the same subscription","VMs in the same zone"],a:0,e:"Only one update domain is rebooted at a time."},
 {q:"What does an availability set cost?",o:["Nothing extra; you pay only for the VMs","A fixed monthly fee","Double the VM cost","It requires a reserved instance"],a:0,e:"There's no charge for the set itself."},
 {q:"A company wants employees to access a full Windows desktop from any device while keeping data off those devices. Which service?",o:["Azure Virtual Desktop","Azure Virtual Machine Scale Sets","Azure Functions","Azure File Sync"],a:0,e:"AVD delivers cloud desktops and apps."},
 {q:"Which feature lets multiple users share one Windows 11 session host in Azure Virtual Desktop?",o:["Windows 11 multi-session","Availability sets","Spot pricing","ExpressRoute"],a:0,e:"Multi-session is unique to Azure Virtual Desktop."},
 {q:"Which resource connects a VM to a subnet?",o:["A network interface (NIC)","A resource group","A storage account","A management group"],a:0,e:"The NIC attaches the VM to the network."},
 {q:"Which is NOT a resource you configure when creating a VM?",o:["A management group","A size","A disk","A virtual network"],a:0,e:"Management groups organize subscriptions, not VMs."},
 {q:"Which PaaS service hosts web apps, REST APIs and mobile back ends with built-in autoscale?",o:["Azure App Service","Azure Virtual Machines","Azure Data Box","Azure DNS"],a:0,e:"App Service is HTTP-based hosting."},
 {q:"In App Service, what runs background tasks alongside a web app?",o:["WebJobs","Durable Functions only","Queues only","Logic Apps only"],a:0,e:"WebJobs run programs or scripts in the same context as the app."},
 {q:"Which is a purpose of an Azure virtual network?",o:["Isolating and segmenting Azure resources","Storing blobs","Assigning RBAC roles","Billing"],a:0,e:"VNets provide isolation, connectivity, routing and filtering."},
 {q:"VMs in two different subnets of the same VNet need to communicate. What's required?",o:["Nothing; subnets in a VNet can communicate by default","VNet peering","ExpressRoute","A VPN gateway"],a:0,e:"Default system routes connect subnets in a VNet."},
 {q:"Which connects two Azure VNets so traffic stays on the Microsoft backbone?",o:["Virtual network peering","Point-to-site VPN","Azure DNS","A public endpoint"],a:0,e:"Peering is private and fast."},
 {q:"What is global VNet peering?",o:["Peering VNets in different Azure regions","Peering with an on-premises network","Peering with the internet","Peering subscriptions"],a:0,e:"Global peering crosses regions."},
 {q:"Which statement about Azure DNS is TRUE?",o:["You can host domains but can't buy domain names with it","You can buy domain names with it","It only works on-premises","It replaces VPN Gateway"],a:0,e:"Buy names from a registrar; host them in Azure DNS."},
 {q:"Which sends encrypted traffic between an on-premises network and Azure over the public internet?",o:["Azure VPN Gateway","Azure ExpressRoute","VNet peering","Azure Private Link"],a:0,e:"VPN Gateway uses the internet with encryption."},
 {q:"An employee working from home needs to connect their laptop to an Azure VNet. Which VPN type?",o:["Point-to-site","Site-to-site","Network-to-network","ExpressRoute"],a:0,e:"Point-to-site connects a single device."},
 {q:"A branch office network must connect to Azure through its firewall over the internet. Which VPN type?",o:["Site-to-site","Point-to-site","ExpressRoute Direct","Global peering"],a:0,e:"Site-to-site connects whole networks."},
 {q:"A bank needs a private, dedicated connection to Azure that does NOT travel over the public internet. Which service?",o:["Azure ExpressRoute","Azure VPN Gateway","Azure DNS","A public endpoint"],a:0,e:"ExpressRoute uses a connectivity provider, not the internet."},
 {q:"Which is a benefit of ExpressRoute over VPN Gateway?",o:["Faster speeds and lower latency because it doesn't use the internet","It's always free","It doesn't need a provider","It only connects to Microsoft 365"],a:0,e:"Private connectivity gives reliability, speed and lower latency."},
 {q:"Which ExpressRoute feature connects a company's on-premises sites to each other through Microsoft's network?",o:["ExpressRoute Global Reach","Point-to-site VPN","Private DNS","VNet peering"],a:0,e:"Global Reach links your sites."},
 {q:"What is a private endpoint?",o:["A network interface with a private IP from your VNet that connects to a PaaS service","A public IP address","A firewall rule","A type of storage tier"],a:0,e:"Private endpoints use Azure Private Link."},
 {q:"A company wants VMs to reach a storage account without the traffic using a public IP, and wants to block internet access to it. What should it use?",o:["A private endpoint","A public endpoint","A larger VM","Azure DNS only"],a:0,e:"Private endpoints keep traffic private, and public access can be disabled."},
 {q:"Which storage service is BEST for storing millions of images and videos for a website?",o:["Azure Blob storage","Azure Queues","Azure Tables","Azure Disks"],a:0,e:"Blobs store unstructured objects."},
 {q:"Which storage service provides SMB file shares that on-premises and cloud machines can mount at the same time?",o:["Azure Files","Azure Blobs","Azure Queues","Azure Tables"],a:0,e:"Azure Files is managed file shares."},
 {q:"Which storage service passes messages between app components for asynchronous processing?",o:["Azure Queues","Azure Files","Azure Disks","Azure Data Box"],a:0,e:"Queue storage holds messages until processed."},
 {q:"Which storage service is a NoSQL store for structured, schemaless data?",o:["Azure Tables","Azure Blobs","Azure Files","Azure Disks"],a:0,e:"Table storage holds key/attribute entities."},
 {q:"Which storage provides block-level volumes for Azure VMs?",o:["Azure Disks","Azure Tables","Azure Queues","Azure Files"],a:0,e:"Managed disks back VM OS and data disks."},
 {q:"Which storage account type is recommended for most scenarios?",o:["Standard general-purpose v2","Premium page blobs","Premium file shares","Classic storage"],a:0,e:"GPv2 supports every service and redundancy option."},
 {q:"Which is a valid storage account name?",o:["contosodata01","Contoso-Data","contoso_data","ab"],a:0,e:"3–24 characters, lowercase letters and numbers only, globally unique."},
 {q:"Which access tier is BEST for data that is accessed frequently?",o:["Hot","Cool","Cold","Archive"],a:0,e:"Hot has the lowest access costs."},
 {q:"Backups are kept for at least 30 days and rarely read. Which tier balances cost?",o:["Cool","Hot","Archive","Premium"],a:0,e:"Cool is for infrequently accessed data stored 30+ days."},
 {q:"Compliance records must be kept for 7 years, are almost never read, and a delay of hours is acceptable. Which tier?",o:["Archive","Hot","Cool","Premium block blob"],a:0,e:"Archive has the lowest storage cost and latency of hours."},
 {q:"What must happen before you can read a blob in the archive tier?",o:["It must be rehydrated to an online tier","It must be deleted","It must be copied to a VM","Nothing; it reads instantly"],a:0,e:"Archive is offline; rehydration can take hours."},
 {q:"What is the minimum recommended storage period for the archive tier?",o:["180 days","30 days","90 days","7 days"],a:0,e:"Cool 30, cold 90, archive 180."},
 {q:"Which redundancy option keeps three copies of data in a single datacenter?",o:["LRS","ZRS","GRS","GZRS"],a:0,e:"Locally redundant storage."},
 {q:"Which redundancy option copies data synchronously across three availability zones in the primary region?",o:["ZRS","LRS","GRS","RA-GRS"],a:0,e:"Zone-redundant storage."},
 {q:"Which redundancy option protects against a regional outage by copying data to a secondary region?",o:["GRS","LRS","ZRS","Premium LRS"],a:0,e:"Geo-redundant storage replicates to the paired region."},
 {q:"A company needs to READ its data from the secondary region at any time, even without a failover. Which option?",o:["RA-GZRS","GRS","ZRS","LRS"],a:0,e:"Read-access geo options make the secondary readable."},
 {q:"Which option offers the highest protection by using zones in the primary region AND a copy in a secondary region?",o:["GZRS","LRS","ZRS","GRS"],a:0,e:"GZRS combines ZRS with geo-replication."},
 {q:"Which is the cheapest redundancy option?",o:["LRS","ZRS","GRS","RA-GZRS"],a:0,e:"Fewer, closer copies cost less."},
 {q:"Which tool copies blobs from the command line and syncs in one direction?",o:["AzCopy","Azure File Sync","Azure Migrate","Azure Data Box"],a:0,e:"AzCopy is a CLI copy and sync tool."},
 {q:"An administrator wants a graphical tool to upload, download and manage blobs from their Mac. Which tool?",o:["Azure Storage Explorer","AzCopy","Azure Data Box","Azure Migrate"],a:0,e:"Storage Explorer is a free GUI for Windows, macOS and Linux."},
 {q:"A company wants to centralize file shares in Azure Files while keeping fast local access on its Windows file servers. Which service?",o:["Azure File Sync","AzCopy","Azure Data Box","Azure Blob storage"],a:0,e:"File Sync caches files locally with cloud tiering."},
 {q:"Which service is a central hub to discover, assess and migrate on-premises servers and databases to Azure?",o:["Azure Migrate","Azure Advisor","Azure Arc","Azure Monitor"],a:0,e:"Azure Migrate unifies migration tools."},
 {q:"A company needs to move 70 TB of data to Azure but has a slow internet connection. What should it use?",o:["Azure Data Box","AzCopy over the internet","Azure File Sync","A point-to-site VPN"],a:0,e:"Data Box ships data on a physical device."},
 {q:"What is Microsoft Entra ID?",o:["Microsoft's cloud-based identity and access management service","A virtual network","A storage tier","A billing tool"],a:0,e:"Formerly Azure Active Directory."},
 {q:"Which tool syncs user accounts from on-premises Active Directory to Microsoft Entra ID?",o:["Microsoft Entra Connect","Azure Migrate","AzCopy","Azure Arc"],a:0,e:"Entra Connect enables hybrid identity."},
 {q:"A legacy app in Azure needs domain join, Group Policy and Kerberos, but you don't want to manage domain controllers. Which service?",o:["Microsoft Entra Domain Services","Microsoft Entra ID only","Azure DNS","Azure Policy"],a:0,e:"Entra Domain Services provides managed domain services."},
 {q:"Which authentication method lets users sign in once and access many applications?",o:["Single sign-on","MFA","Passwordless","Conditional Access"],a:0,e:"SSO reduces sign-ins and passwords."},
 {q:"A user signs in with a password and then approves a notification on their phone. What is this?",o:["Multifactor authentication","Single sign-on only","Passwordless only","B2B collaboration"],a:0,e:"Something you know plus something you have."},
 {q:"Which is a passwordless authentication method?",o:["FIDO2 security key","A longer password","Security questions","A shared PIN on a sticky note"],a:0,e:"Windows Hello, Authenticator and FIDO2 keys are passwordless."},
 {q:"A partner company's employees need access to your SharePoint site using their own work accounts. What should you use?",o:["B2B collaboration (guest users)","Customer identity (B2C)","Creating new accounts for each partner","Entra Domain Services"],a:0,e:"B2B lets partners use their own credentials."},
 {q:"Which external identity option handles sign-up and sign-in for customers of a public-facing app?",o:["Customer identity (Azure AD B2C / Entra External ID)","B2B collaboration","Entra Domain Services","RBAC"],a:0,e:"Customer identity is for consumer apps."},
 {q:"Which feature requires MFA when a user signs in from outside the corporate network?",o:["Conditional Access","Azure Policy","Resource locks","Azure DNS"],a:0,e:"Conditional Access evaluates signals like location."},
 {q:"Which is NOT a Conditional Access signal?",o:["The VM size","The user's location","The device","The application"],a:0,e:"Signals are user, location, device, app and risk."},
 {q:"Which Azure RBAC role can create and manage all resources but can't grant access to others?",o:["Contributor","Owner","Reader","User Access Administrator"],a:0,e:"Owner can also assign roles."},
 {q:"Which role has full access, including the ability to assign roles?",o:["Owner","Contributor","Reader","Billing Reader"],a:0,e:"Owner is the most powerful built-in role."},
 {q:"An auditor needs to view all resources in a subscription without changing anything. Which role and scope?",o:["Reader at the subscription","Contributor at the subscription","Owner at a resource group","Reader at one VM"],a:0,e:"Least privilege at the scope that covers everything they need."},
 {q:"A user has Reader on a subscription and Contributor on one resource group. What can they do in that resource group?",o:["Manage resources (permissions are additive)","Only view resources","Nothing","Assign roles"],a:0,e:"RBAC permissions add together."},
 {q:"Which are valid Azure RBAC scopes?",o:["Management group, subscription, resource group, resource","Region, zone, datacenter, rack","Tenant, VNet, subnet, NIC","User, group, device, app"],a:0,e:"Roles can be assigned at those four levels."},
 {q:"Which principle is part of Zero Trust?",o:["Assume breach","Trust everything on the corporate network","Use shared admin accounts","Disable MFA for speed"],a:0,e:"Verify explicitly, least privilege, assume breach."},
 {q:"Zero Trust's \"use least privilege access\" principle means:",o:["Give just-in-time, just-enough access","Give every user Owner rights","Trust devices on the office network","Never audit access"],a:0,e:"Limit access to what's needed, when it's needed."},
 {q:"In defense in depth, which layer includes DDoS protection and perimeter firewalls?",o:["Perimeter","Data","Application","Physical security"],a:0,e:"The perimeter layer protects against network-based attacks."},
 {q:"In defense in depth, which layer is the innermost and the attacker's real target?",o:["Data","Network","Compute","Perimeter"],a:0,e:"Every other layer protects the data."},
 {q:"In defense in depth, securing VMs by patching and using endpoint protection is part of which layer?",o:["Compute","Identity and access","Physical security","Perimeter"],a:0,e:"The compute layer secures the machines."},
 {q:"What is the purpose of the defense-in-depth model?",o:["To slow an attack with multiple layers, so one breach doesn't expose everything","To replace all firewalls with one","To reduce cloud costs","To speed up deployments"],a:0,e:"Layered security."},
 {q:"Which service gives a secure score and recommendations across Azure, on-premises and other clouds?",o:["Microsoft Defender for Cloud","Azure Advisor only","Azure Service Health","Azure Migrate"],a:0,e:"Defender for Cloud manages security posture and threat protection."},
 {q:"Which clouds can Microsoft Defender for Cloud protect?",o:["Azure, on-premises (through Arc), AWS and Google Cloud","Only Azure","Only on-premises","Only Microsoft 365"],a:0,e:"Defender for Cloud is multi-cloud and hybrid."}
];

/* ---------- custom diagrams ---------- */
function vizMap(){
  const el=$("#viz-map");const seen=new Set();
  const R=[["eus","East US","Virginia",37.4,-79,"wus"],["wus","West US","California",37.8,-122.4,"eus"],["ncus","North Central US","Illinois",41.9,-87.6,"scus"],["scus","South Central US","Texas",29.4,-98.5,"ncus"],["brs","Brazil South","São Paulo",-23.5,-46.6,"scus"],["cac","Canada Central","Toronto",43.7,-79.4,"cae"],["cae","Canada East","Quebec City",46.8,-71.2,"cac"],["neu","North Europe","Ireland",53.3,-6.3,"weu"],["weu","West Europe","Netherlands",52.4,4.9,"neu"],["sea","Southeast Asia","Singapore",1.3,103.8,"ea"],["ea","East Asia","Hong Kong",22.3,114.2,"sea"],["jpe","Japan East","Tokyo",35.7,139.7,"jpw"],["jpw","Japan West","Osaka",34.7,135.5,"jpe"],["aue","Australia East","Sydney",-33.9,151.2,"ause"],["ause","Australia Southeast","Melbourne",-37.8,145,"aue"],["gov","US Gov Arizona","Azure Government",33.4,-112.1,null,1],["cn","China North","Operated by 21Vianet",39.9,116.4,null,1]];
  const W=600,H=300,X=lon=>(lon+180)/360*W,Y=lat=>(80-lat)/140*H;
  const by=Object.fromEntries(R.map(r=>[r[0],r]));let sel=null;
  /* very rough land outlines for orientation only */
  const LAND=[[[-165,68],[-140,70],[-95,72],[-65,60],[-55,50],[-80,25],[-97,18],[-85,10],[-105,22],[-125,40],[-140,58]],[[-80,10],[-60,8],[-35,-6],[-40,-22],[-58,-38],[-70,-52],[-75,-40],[-80,-5]],[[-10,36],[-5,44],[-10,52],[5,60],[30,70],[60,70],[100,75],[140,70],[170,65],[140,50],[125,35],[120,22],[105,10],[95,18],[80,8],[70,22],[50,25],[35,30],[25,36],[10,38]],[[-17,15],[-5,35],[10,37],[32,31],[43,12],[51,11],[40,-15],[30,-33],[18,-34],[12,-10],[8,4],[-10,5]],[[114,-22],[130,-12],[145,-15],[153,-28],[147,-39],[135,-35],[115,-34]]];
  function draw(){
    const r=sel&&by[sel],p=r&&r[5]&&by[r[5]];
    const back=r&&p&&p[5]!==r[0]?by[p[5]]:null;
    let s=`<svg viewBox="0 0 ${W} ${H}" class="mp" style="min-width:460px" role="img" aria-label="Map of selected Azure regions">`;
    for(let lon=-150;lon<=180;lon+=30)s+=`<line class="mp-g" x1="${X(lon)}" y1="0" x2="${X(lon)}" y2="${H}"/>`;
    for(let lat=60;lat>=-60;lat-=30)s+=`<line class="mp-g" x1="0" y1="${Y(lat)}" x2="${W}" y2="${Y(lat)}"/>`;
    LAND.forEach(poly=>s+=`<polygon class="mp-land" points="${poly.map(([lo,la])=>X(lo)+","+Y(la)).join(" ")}"/>`);
    if(r&&p)s+=`<path class="mp-ln" d="M${X(r[4])},${Y(r[3])} Q${(X(r[4])+X(p[4]))/2},${Math.min(Y(r[3]),Y(p[3]))-40} ${X(p[4])},${Y(p[3])}"/>`;
    R.forEach(x=>{const c=x[0]===sel?"sel":p&&x[0]===p[0]?"pair":"";s+=`<circle class="mp-dot ${x[6]?"sov":""} ${c} ${seen.has(x[0])?"seen":""}" data-r="${x[0]}" cx="${X(x[4])}" cy="${Y(x[3])}" r="${c?7:5}"><title>${x[1]}</title></circle>`});
    [r,p].filter(Boolean).forEach((x,i)=>s+=`<text class="mp-t on" x="${X(x[4])+(X(x[4])>480?-10:10)}" y="${Y(x[3])+(i?16:-10)}" text-anchor="${X(x[4])>480?"end":"start"}">${x[1]}</text>`);
    s+=`</svg>`;
    let cap="Tap a region on the map, or pick one below, to see its pair.";
    if(r){cap=r[6]?`<b>${r[1]}</b> (${r[2]}) is a <b>sovereign region</b>, isolated from the main Azure cloud. ${r[0]==="gov"?"Azure Government serves US government agencies and their partners, run by screened US personnel.":"Azure in China is physically separated and operated by 21Vianet, not directly by Microsoft."}`
      :`<b>${r[1]}</b> (${r[2]}) pairs with <b>${p[1]}</b>.${r[0]==="brs"?" Brazil South is the exception that pairs <b>outside its geography</b>.":""}${back?` This pair is <b>one-way</b>: ${p[1]}'s own secondary is ${back[1]}.`:" Updates roll out to one region of the pair at a time."}`}
    el.innerHTML=`<div class="viz-title">Azure region pairs and sovereign regions</div><div class="viz-scroll">${s}</div>
    <div class="legend-row"><span><i class="sw c-ms"></i>Region</span><span><i class="sw" style="background:var(--blue)"></i>Its pair</span><span><i class="sw c-sh"></i>Sovereign region</span></div>
    <div class="chips">${R.map(x=>`<button class="chip" data-r="${x[0]}" aria-pressed="${x[0]===sel}">${x[1]}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${cap}</div><div class="rv-prog s-small">${seen.size} of ${R.length} regions explored</div>`;
    if(seen.size>=10&&seen.has("brs")&&(seen.has("gov")||seen.has("cn")))award("viz:map",30,"Explored region pairs")}
  el.addEventListener("click",e=>{const d=e.target.closest("[data-r]");if(!d)return;sel=d.dataset.r;seen.add(sel);draw()});draw();
}
function vizAz(){
  const el=$("#viz-az");const fails=new Set(),deps=new Set();
  const D={single:["Single VM",[["E",1,0,0]]],aset:["Availability set (one datacenter)",[["E",1,0,0],["E",1,0,1]]],zr:["Across 3 zones",[["E",1,0,0],["E",2,0,0],["E",3,0,0]]],mr:["3 zones + paired region",[["E",1,0,0],["E",2,0,0],["E",3,0,0],["W",1,0,0],["W",2,0,0]]]};
  const F={none:"No failure",rack:"A server rack fails",dc:"A datacenter fails",zone:"Zone 1 fails",region:"East US region fails"};
  let dep="single",fail="none";
  const dead=v=>fail==="rack"?v[0]==="E"&&v[1]===1&&v[2]===0&&v[3]===0:fail==="dc"?v[0]==="E"&&v[1]===1&&v[2]===0:fail==="zone"?v[0]==="E"&&v[1]===1:fail==="region"?v[0]==="E":false;
  function region(code,name){const down=fail==="region"&&code==="E";
    return `<div class="az-region ${down?"down":""}"><b>${name}${down?" · OFFLINE":""}</b><div class="zones">${[1,2,3].filter(z=>code==="E"||z<3).map(z=>{const zd=code==="E"&&(fail==="zone"&&z===1||down);
      return `<div class="zone ${zd?"down":""}"><span>ZONE ${z}</span>${[0,1].map(d=>{const dd=code==="E"&&z===1&&d===0&&fail==="dc";
        const vms=D[dep][1].filter(v=>v[0]===code&&v[1]===z&&v[2]===d);
        return `<div class="dc ${dd?"down":""}">DC ${z}${"ab"[d]} ${vms.map(v=>`<span class="vmx ${dead(v)?"dead":""}">VM</span>`).join("")}</div>`}).join("")}</div>`}).join("")}</div></div>`}
  function draw(){const vms=D[dep][1],alive=vms.filter(v=>!dead(v)).length,up=alive>0;
    deps.add(dep);if(fail!=="none")fails.add(fail);if(fail==="region"&&dep!=="mr")flag("regiondown");
    el.innerHTML=`<div class="viz-title">Failure simulator: what survives?</div>
    <div class="sel-row"><span>Deployment</span><div class="seg-row">${Object.keys(D).map(k=>`<button class="chip" data-d="${k}" aria-pressed="${k===dep}">${D[k][0]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Failure</span><div class="seg-row">${Object.keys(F).map(k=>`<button class="chip" data-f="${k}" aria-pressed="${k===fail}">${F[k]}</button>`).join("")}</div></div>
    <div class="az-regions">${region("E","East US (primary)")}${region("W","West US (paired region)")}</div>
    <div class="status-line ${up?"status-good":"status-bad"}" aria-live="polite">${up?`App online · ${alive} of ${vms.length} VMs running`:"App offline · every VM is down"}</div>
    <div class="caption">${fail==="none"?"Pick a failure to see which deployments survive it.":fail==="rack"?"An availability set spreads VMs across racks (fault domains), so a rack failure only takes one.":fail==="dc"?"A whole datacenter is gone. Only VMs in other datacenters or zones survive.":fail==="zone"?"Every datacenter in Zone 1 is down. Availability zones keep the other copies running.":"The whole region is offline. Only the copy in the paired region keeps the app running."}</div>
    <div class="rv-prog s-small">${fails.size} of 4 failures tried · ${deps.size} of 4 deployments tried</div>`;
    if(fails.size===4&&deps.size>=3)award("viz:az",30,"Tested every failure level")}
  el.addEventListener("click",e=>{const d=e.target.closest("[data-d]"),f=e.target.closest("[data-f]");if(d)dep=d.dataset.d;if(f)fail=f.dataset.f;if(d||f)draw()});draw();
}
function vizInherit(){
  const el=$("#viz-inherit");const lv=new Set();
  const T=[["root","Tenant root group","Management group",0,null],["corp","Contoso","Management group",1,"root"],["prod","Production","Management group",2,"corp"],["sand","Sandbox","Management group",2,"corp"],["psub","Prod subscription","Subscription",3,"prod"],["dsub","Dev subscription","Subscription",3,"sand"],["rgw","rg-web","Resource group",4,"psub"],["rgd","rg-data","Resource group",4,"psub"],["rgt","rg-test","Resource group",4,"dsub"],["vm","vm-web01","Resource",5,"rgw"],["app","app-shop","Resource",5,"rgw"],["sql","sql-orders","Resource",5,"rgd"],["vmt","vm-test01","Resource",5,"rgt"]];
  const kids=id=>T.filter(t=>t[4]===id).flatMap(t=>[t[0],...kids(t[0])]);
  let src=null,what="policy";
  const W={policy:"Azure Policy: allowed regions = East US",rbac:"RBAC: Reader for the audit team",lock:"Delete lock"};
  function draw(){const hit=src?kids(src):[];
    el.innerHTML=`<div class="viz-title">Assign it once, inherit everywhere below</div>
    <div class="seg-row">${Object.keys(W).map(k=>`<button class="chip" data-w="${k}" aria-pressed="${k===what}">${W[k]}</button>`).join("")}</div>
    <div class="tree">${T.map(t=>`<button class="tnode ${t[0]===src?"src":hit.includes(t[0])?"hit":""}" style="--d:${t[3]}" data-n="${t[0]}"><span class="tag">${t[2]}</span>${t[1]}${t[0]===src?"<em>assigned here</em>":hit.includes(t[0])?"<em>inherited</em>":""}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${src?`<b>${W[what]}</b> assigned at <b>${T.find(t=>t[0]===src)[1]}</b> applies to ${hit.length} item${hit.length===1?"":"s"} below it, and nothing above or beside it.`:"Pick what to assign, then tap a level in the tree to assign it there."}</div>
    <div class="rv-prog s-small">Assigned at ${lv.size} of 4 levels (management group, subscription, resource group, resource)</div>`;
    if(lv.size===4)award("viz:inherit",30,"Traced inheritance through the hierarchy")}
  el.addEventListener("click",e=>{const n=e.target.closest("[data-n]"),w=e.target.closest("[data-w]");if(w)what=w.dataset.w;if(n){src=n.dataset.n;lv.add(T.find(t=>t[0]===src)[2])}if(n||w)draw()});draw();
}
function vizAvset(){
  const el=$("#viz-avset");const seen=new Set();
  const VMS=Array.from({length:6},(_,i)=>({n:"vm"+(i+1),fd:i%3,ud:i%5}));let ev=null;
  function draw(){const down=v=>ev&&(ev[0]==="fd"&&v.fd===ev[1]||ev[0]==="ud"&&v.ud===ev[1]);const alive=VMS.filter(v=>!down(v)).length;
    let g='<span></span>'+[0,1,2,3,4].map(u=>`<span>UD ${u}</span>`).join("");
    for(let f=0;f<3;f++){g+=`<span>FD ${f}</span>`;for(let u=0;u<5;u++){const v=VMS.filter(x=>x.fd===f&&x.ud===u);const isDown=ev&&(ev[0]==="fd"&&ev[1]===f||ev[0]==="ud"&&ev[1]===u);
      g+=`<div class="cx ${isDown?"down":""}">${v.map(x=>`<span class="vmx ${down(x)?"dead":""}">${x.n}</span>`).join("")}</div>`}}
    el.innerHTML=`<div class="viz-title">Availability set: 6 VMs, 3 fault domains, 5 update domains</div>
    <div class="viz-scroll"><div class="avs" style="min-width:420px">${g}</div></div>
    <div class="viz-controls">${[0,1,2].map(f=>`<button class="btn" data-e="fd:${f}">Rack ${f} loses power</button>`).join("")}<button class="btn" data-e="ud:${ev&&ev[0]==="ud"?(ev[1]+1)%5:0}">Planned maintenance: UD ${ev&&ev[0]==="ud"?(ev[1]+1)%5:0}</button><button class="btn" data-e="none">All healthy</button></div>
    <div class="status-line ${alive>=4?"status-good":"status-bad"}" aria-live="polite">${alive} of 6 VMs running</div>
    <div class="caption">${!ev?"VMs are spread round-robin across fault domains (racks) and update domains (reboot groups).":ev[0]==="fd"?`Rack ${ev[1]} failed. Only the VMs in fault domain ${ev[1]} went down; the app keeps serving.`:`Azure is patching update domain ${ev[1]}. Only those VMs reboot, and only one update domain is updated at a time.`}</div>`;
    }
  el.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(!b)return;const v=b.dataset.e;ev=v==="none"?null:[v.split(":")[0],+v.split(":")[1]];if(ev)seen.add(ev[0]);draw();if(seen.size===2)award("viz:avset",30,"Survived rack failures and maintenance")});draw();
}
function vizNet(){
  const el=$("#viz-net");const ok=new Set();
  const S={peer:false,vpn:false,er:false};
  const TESTS={sub:["Web subnet → data subnet (same VNet)",()=>[true,"Subnets in one VNet communicate by default.",["w-d"]]],
    peer:["Hub VM → Spoke VM",()=>S.peer?[true,"Peered: traffic flows privately over the Microsoft backbone.",["h-s"]]:[false,"Separate VNets can't talk until you peer them.",[]]],
    hq:["Head office → Hub VM",()=>S.er?[true,"ExpressRoute: a private circuit through a provider. It never touches the public internet.",["hq-er"]]:S.vpn?[true,"Site-to-site VPN: encrypted, but it travels over the public internet.",["hq-vpn"]]:[false,"There's no connection to on-premises. Add a VPN gateway or ExpressRoute.",[]]],
    home:["Laptop at home → Hub VM",()=>S.vpn?[true,"Point-to-site VPN: one device connects over the internet through the VPN gateway.",["lap"]]:[false,"A single remote device needs a point-to-site VPN through a VPN gateway.",[]]]};
  let test=null;
  function draw(){const res=test?TESTS[test][1]():null,path=res?res[2]:[];if(res&&res[0])ok.add(test);
    const L=(id,x1,y1,x2,y2,on,inet)=>`<path class="nl ${on?"on":""} ${inet?"inet":""} ${path.includes(id)?"path":""}" d="M${x1},${y1} L${x2},${y2}"/>`;
    const N=(x,y,w,h,t,s,on)=>`<g class="nn ${on?"on":""}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/><text x="${x+w/2}" y="${y+20}" text-anchor="middle" class="s-b">${t}</text>${s?`<text x="${x+w/2}" y="${y+37}" text-anchor="middle" class="s-small">${s}</text>`:""}</g>`;
    el.innerHTML=`<div class="viz-title">Build a hybrid network, then test the paths</div>
    <div class="seg-row"><button class="chip" data-s="peer" aria-pressed="${S.peer}">VNet peering</button><button class="chip" data-s="vpn" aria-pressed="${S.vpn}">VPN gateway</button><button class="chip" data-s="er" aria-pressed="${S.er}">ExpressRoute circuit</button></div>
    <div class="viz-scroll net"><svg viewBox="0 0 600 270" style="min-width:470px" role="img" aria-label="Network diagram">
      ${L("hq-vpn",120,70,250,120,S.vpn,true)}${L("hq-er",120,90,250,150,S.er,false)}${L("lap",120,225,250,175,S.vpn,true)}${L("h-s",410,140,460,140,S.peer,false)}
      ${N(10,50,110,56,"Head office","192.168.0.0/16",S.vpn||S.er)}${N(10,200,110,56,"Home laptop","",S.vpn)}
      <g class="nn on"><rect x="250" y="40" width="160" height="200" rx="12"/><text x="330" y="62" text-anchor="middle" class="s-b">Hub VNet</text><text x="330" y="80" text-anchor="middle" class="s-small">10.0.0.0/16 · East US</text></g>
      ${N(265,95,130,44,"web subnet","10.0.1.0/24",true)}${N(265,180,130,44,"data subnet","10.0.2.0/24",true)}
      <path class="nl on ${path.includes("w-d")?"path":""}" d="M330,139 L330,180"/>
      ${N(460,105,130,70,"Spoke VNet","10.1.0.0/16",S.peer)}
      ${S.vpn?`<text x="178" y="76" text-anchor="middle" class="s-small">VPN (internet)</text>`:""}${S.er?`<text x="172" y="142" text-anchor="middle" class="s-small">ExpressRoute</text>`:""}
    </svg></div>
    <div class="seg-row">${Object.keys(TESTS).map(k=>`<button class="chip" data-t="${k}" aria-pressed="${k===test}">${ok.has(k)?"✓ ":""}${TESTS[k][0]}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${res?`<span class="${res[0]?"status-good":"status-bad"}">${res[0]?"Connected.":"No route."}</span> ${res[1]}`:"Turn on connections, then pick a path to test."}</div>
    <div class="rv-prog s-small">${ok.size} of 4 paths connected</div>`;
    if(ok.size===4)award("viz:net",30,"Connected every network path")}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),t=e.target.closest("[data-t]");if(s)S[s.dataset.s]=!S[s.dataset.s];if(t)test=t.dataset.t;if(s||t)draw()});draw();
}
function vizEndp(){
  const el=$("#viz-endp");const seen=new Set();let m="pub";
  const ROWS=[["Address","stcontoso.blob.core.windows.net → public IP 20.60.x.x","stcontoso.privatelink.blob.core.windows.net → 10.0.2.5 (your subnet)"],["Reachable from the internet","Yes, unless firewall rules restrict it","No, if you disable public network access"],["Path from a VM in your VNet","To the service's public address","Stays inside your VNet and the Microsoft backbone"],["Path from on-premises","Over the internet","Through your VPN or ExpressRoute"],["Built on","The service's default endpoint","Azure Private Link"]];
  function draw(){seen.add(m);
    el.innerHTML=`<div class="viz-title">Public vs private endpoint for a storage account</div>
    <div class="seg-row"><button class="chip" data-m="pub" aria-pressed="${m==="pub"}">Public endpoint</button><button class="chip" data-m="priv" aria-pressed="${m==="priv"}">Private endpoint</button></div>
    <div class="tbl-wrap"><table class="tbl">${ROWS.map(r=>`<tr><td>${r[0]}</td><td class="${m==="pub"?"c-sh":"c-ms"}">${m==="pub"?r[1]:r[2]}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${m==="pub"?"Public endpoints are the default for many PaaS services. They're convenient but exposed to the internet.":"A private endpoint gives the service a private IP inside your VNet, so it's reachable like any other resource on your network."}</div>`;
    if(seen.size===2)award("viz:endp",20,"Compared public and private endpoints")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){m=b.dataset.m;draw()}});draw();
}
function vizTier(){
  const el=$("#viz-tier");const won=new Set();let gb=1000,rd=10,msg="";
  const T=[["Hot",0.018,0.0004,"none","Milliseconds"],["Cool",0.010,0.01,"30 days","Milliseconds"],["Cold",0.0045,0.03,"90 days","Milliseconds"],["Archive",0.002,0.05,"180 days","Hours (rehydrate first)"]];
  el.innerHTML=`<div class="viz-title">Storage tier cost explorer</div><div class="s-small">ILLUSTRATIVE PRICES PER GB · NOT CURRENT AZURE RATES</div>
    <div class="rng-row"><span>Data stored</span><input type="range" min="100" max="10000" step="100" value="${gb}" data-k="gb" aria-label="Data stored in GB"><b data-o="gb"></b></div>
    <div class="rng-row"><span>Read each month</span><input type="range" min="0" max="200" step="10" value="${rd}" data-k="rd" aria-label="Percent of data read each month"><b data-o="rd"></b></div><div class="out"></div>`;
  function draw(){$('[data-o="gb"]',el).textContent=fmt(gb)+" GB";$('[data-o="rd"]',el).textContent=rd+"%";
    const c=T.map(t=>({t,s:gb*t[1],r:gb*rd/100*t[2]}));c.forEach(x=>x.tot=x.s+x.r);const best=c.reduce((a,b)=>b.tot<a.tot?b:a);won.add(best.t[0]);
    $(".out",el).innerHTML=`<div class="tbl-wrap"><table class="tbl"><tr><th>Tier</th><th class="num">Storage</th><th class="num">Reads</th><th class="num">Total / month</th><th>Min. days</th><th>Read latency</th><th></th></tr>
    ${c.map(x=>`<tr><td>${x.t[0]}</td><td class="num">$${x.s.toFixed(2)}</td><td class="num">$${x.r.toFixed(2)}</td><td class="num ${x===best?"ok":""}">$${x.tot.toFixed(2)}</td><td>${x.t[3]}</td><td>${x.t[4]}</td><td><button class="btn" data-open="${x.t[0]}">Open a file</button></td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${msg||`<b>Cheapest: ${best.t[0]}.</b> ${best.t[0]==="Hot"?"Read a lot, and the low access price wins.":best.t[0]==="Archive"?"Almost never read, and the tiny storage price wins, as long as you can wait hours.":"In between: infrequent reads favor the cool and cold tiers."}`}</div>
    <div class="rv-prog s-small">Tiers that won so far: ${[...won].join(", ")} (find 3)</div>`;msg="";
    if(won.size>=3)award("viz:tier",30,"Found the cheapest tier for different access patterns")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(k==="gb")gb=+e.target.value;if(k==="rd")rd=+e.target.value;if(k)draw()});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-open]");if(!b)return;const t=b.dataset.open;
    if(t==="Archive"){flag("frozen");msg=`<span class="status-bad">Blob is offline.</span> Archived blobs can't be read directly. Rehydrate it to hot, cool or cold first, which can take up to 15 hours (or less with high priority).`}
    else msg=`<span class="status-good">Opened.</span> ${t} blobs are online and read in milliseconds.${t!=="Hot"?" You pay a higher per-GB read charge than hot.":""}`;draw()});draw();
}
function vizRedund(){
  const el=$("#viz-redund");const tried=new Set();
  const O={LRS:["E1"],ZRS:["E1","E2","E3"],GRS:["E1","W1"],"RA-GRS":["E1","W1"],GZRS:["E1","E2","E3","W1"],"RA-GZRS":["E1","E2","E3","W1"]};
  const F={none:"No failure",dc:"Datacenter in Zone 1 fails",zone:"Zone 1 fails",region:"East US region fails"};
  let o="LRS",f="none";
  const lost=loc=>f==="none"?false:loc==="E1"?true:f==="region"&&loc[0]==="E";
  function draw(){const L=O[o],prim=L.filter(x=>x[0]==="E"&&!lost(x)).length,sec=L.includes("W1"),ra=o.startsWith("RA");
    if(f==="zone"||f==="region")tried.add(o);
    let read,write,note;
    if(prim){read=write="Yes";note=f==="none"?"Everything healthy.":"The surviving zones keep the data readable and writable."}
    else if(sec){write="After failover";read=ra?"Yes, from the secondary":"After failover";note=ra?"The primary copies are offline, but read access lets apps keep reading from the secondary region right away.":"The data is safe in the secondary region, but you can't read it until a failover to the secondary."}
    else{read=write="No";note=o==="LRS"?"All three LRS copies live in one datacenter, so they all went down together.":"ZRS survives a zone, but every zone in the region is down."}
    const box=(loc,label)=>`<div class="dc ${lost(loc)?"down":""}">${label} ${L.includes(loc)?(loc==="W1"?'<span class="vmx data">copy (async)</span>':loc==="E1"&&(o==="LRS"||o.includes("GRS"))?'<span class="vmx data">×3</span>':'<span class="vmx data">copy</span>'):""}</div>`;
    el.innerHTML=`<div class="viz-title">Redundancy outage simulator</div>
    <div class="sel-row"><span>Redundancy</span><div class="seg-row">${Object.keys(O).map(k=>`<button class="chip" data-o="${k}" aria-pressed="${k===o}">${k}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Failure</span><div class="seg-row">${Object.keys(F).map(k=>`<button class="chip" data-f="${k}" aria-pressed="${k===f}">${F[k]}</button>`).join("")}</div></div>
    <div class="az-regions"><div class="az-region ${f==="region"?"down":""}"><b>East US (primary)</b><div class="zones">${box("E1","Zone 1")}${box("E2","Zone 2")}${box("E3","Zone 3")}</div></div>
    <div class="az-region"><b>West US (secondary)</b><div class="zones" style="grid-template-columns:1fr">${box("W1","Datacenter")}</div></div></div>
    <div class="kv"><span>Can apps read?</span><b class="${read==="Yes"||read.startsWith("Yes")?"status-good":"status-bad"}">${read}</b><span>Can apps write?</span><b class="${write==="Yes"?"status-good":"status-bad"}">${write}</b></div>
    <div class="caption" aria-live="polite">${note}</div><div class="rv-prog s-small">${tried.size} of 6 options tested against a zone or region failure</div>`;
    if(tried.size===6)award("viz:redund",30,"Tested every redundancy option")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-o]"),b=e.target.closest("[data-f]");if(a)o=a.dataset.o;if(b)f=b.dataset.f;if(a||b)draw()});draw();
}
function vizCa(){
  const el=$("#viz-ca");const out=new Set();
  const Q={user:[["emp","Employee"],["admin","Global admin"],["guest","Partner guest"]],loc:[["office","Office network"],["home","Home Wi-Fi"],["blocked","Country on the blocked list"]],dev:[["comp","Compliant company laptop"],["byod","Personal unmanaged phone"]],risk:[["low","Low sign-in risk"],["high","High sign-in risk"]],app:[["teams","Microsoft Teams"],["portal","Azure portal"],["pay","Payroll app"]]};
  const LBL={user:"User",loc:"Location",dev:"Device",risk:"Risk",app:"App"};
  const P=[["Block blocked countries",s=>s.loc==="blocked","block"],["Block high-risk sign-ins",s=>s.risk==="high","block"],["Payroll only from compliant devices",s=>s.app==="pay"&&s.dev==="byod","block"],["Admins always use MFA",s=>s.user==="admin","mfa"],["Guests use MFA",s=>s.user==="guest","mfa"],["MFA for the Azure portal",s=>s.app==="portal","mfa"],["MFA outside the office",s=>s.loc!=="office","mfa"]];
  const s={user:"emp",loc:"office",dev:"comp",risk:"low",app:"teams"};
  function draw(){const hit=P.filter(p=>p[1](s)),v=hit.some(p=>p[2]==="block")?"block":hit.length?"mfa":"allow";out.add(v);
    el.innerHTML=`<div class="viz-title">Conditional Access policy evaluator</div>
    ${Object.keys(Q).map(k=>`<div class="sel-row"><span>${LBL[k]}</span><div class="seg-row">${Q[k].map(([id,l])=>`<button class="chip" data-q="${k}:${id}" aria-pressed="${s[k]===id}">${l}</button>`).join("")}</div></div>`).join("")}
    <div class="verdict ${v}" aria-live="polite">${v==="block"?"Block access":v==="mfa"?"Grant, but require MFA":"Allow access"}</div>
    <div class="caption">${hit.length?`Policies that applied: ${hit.map(p=>`<b>${p[0]}</b>`).join(", ")}. ${v==="block"?"A block always wins over a grant.":""}`:"No policy matched these signals, so the sign-in goes straight through."}</div>
    <div class="rv-prog s-small">Outcomes seen: ${["allow","mfa","block"].map(x=>(out.has(x)?"✓ ":"· ")+x).join(" · ")}</div>`;
    if(out.size===3)award("viz:ca",30,"Saw every Conditional Access outcome")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(!b)return;const [k,v]=b.dataset.q.split(":");s[k]=v;draw()});draw();
}
function vizRbac(){
  const el=$("#viz-rbac");const roles=new Set(),scopes=new Set();
  const RES=[["vm-web01","rg-web"],["app-shop","rg-web"],["sql-orders","rg-data"]];
  const SC={sub:"Subscription",rgw:"Resource group rg-web",vm:"Resource vm-web01"};
  const RL={Reader:[1,0,0],Contributor:[1,1,0],Owner:[1,1,1]};
  let role="Reader",sc="rgw";
  const inScope=r=>sc==="sub"||sc==="rgw"&&r[1]==="rg-web"||sc==="vm"&&r[0]==="vm-web01";
  function draw(){roles.add(role);scopes.add(sc);const p=RL[role];
    el.innerHTML=`<div class="viz-title">Assign Dana a role, then see what she can do</div>
    <div class="sel-row"><span>Role</span><div class="seg-row">${Object.keys(RL).map(k=>`<button class="chip" data-r="${k}" aria-pressed="${k===role}">${k}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Scope</span><div class="seg-row">${Object.keys(SC).map(k=>`<button class="chip" data-s="${k}" aria-pressed="${k===sc}">${SC[k]}</button>`).join("")}</div></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Resource</th><th>View</th><th>Change or delete</th><th>Grant access</th></tr>
    ${RES.map(r=>{const i=inScope(r);return `<tr><td>${r[0]} <span class="s-small">${r[1]}</span></td>${p.map(x=>`<td class="${i&&x?"ok":"no"}">${i&&x?"✓ Allowed":"✗"}</td>`).join("")}</tr>`}).join("")}</table></div>
    <div class="caption" aria-live="polite"><b>${role}</b> at <b>${SC[sc]}</b>: ${role==="Reader"?"view only.":role==="Contributor"?"manage everything in scope, but can't give anyone else access.":"full control in scope, including assigning roles."} ${sc==="sub"?"Assigned at the subscription, it's inherited by every resource group and resource.":sc==="rgw"?"Inherited by everything in rg-web, but not rg-data.":"Only this one VM. That's the narrowest scope."}</div>
    <div class="rv-prog s-small">${roles.size} of 3 roles · ${scopes.size} of 3 scopes tried</div>`;
    if(roles.size===3&&scopes.size===3)award("viz:rbac",30,"Explored RBAC roles and scopes")}
  el.addEventListener("click",e=>{const r=e.target.closest("[data-r]"),s=e.target.closest("[data-s]");if(r)role=r.dataset.r;if(s)sc=s.dataset.s;if(r||s)draw()});draw();
}
function vizDid(){
  const el=$("#viz-did");
  const L=[["Physical security","A stranger tries to tailgate into the datacenter.","Badge readers, guards and biometrics stop them at the door."],["Identity and access","An attacker logs in with a stolen password.","MFA and Conditional Access block the sign-in."],["Perimeter","A botnet floods the public website.","Azure DDoS Protection absorbs the flood."],["Network","A compromised web VM scans the database subnet.","Network security groups deny traffic between tiers by default."],["Compute","Malware targets an unpatched VM.","Patching and endpoint protection stop it."],["Application","A bug lets someone send SQL in a form field.","Secure coding and input validation block the injection."],["Data","An attacker finally reaches the storage account.","Encryption and access controls keep the data unreadable."]];
  let n=0;
  function draw(){
    el.innerHTML=`<div class="viz-title">Defense in depth: follow an attack inward</div>
    <div class="ring-l">${L.map((l,i)=>`<div class="${i<n-1?"hit":i===n-1?"stop":""}" style="width:${100-i*9}%">${l[0]}</div>`).join("")}</div>
    <div class="caption" aria-live="polite">${n===0?"Each layer is a chance to stop an attacker. Press Next layer to try an attack at each one.":`<b>${L[n-1][0]}.</b> ${L[n-1][1]} <span class="status-good">${L[n-1][2]}</span>${n===L.length?"<br><br>Even when one layer fails, the next one is waiting. That's the point of defense in depth.":""}`}</div>
    <div class="viz-controls"><button class="btn primary" data-a="next" ${n===L.length?"disabled":""}>Next layer</button><button class="btn" data-a="reset">Start over</button><span class="grow">Layer ${n} of ${L.length}</span></div>`;
    if(n===L.length)award("viz:did",20,"Walked through every defense layer")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="next")n=Math.min(n+1,L.length);if(a==="reset")n=0;if(a)draw()});draw();
}
function vizScore(){
  const el=$("#viz-score");
  const R=[["Enable MFA for accounts with owner permissions",10],["Restrict management ports (RDP, SSH) with just-in-time access",8],["Apply system updates to VMs",6],["Remediate vulnerabilities found on VMs",6],["Encrypt data in transit (require HTTPS)",4],["Enable endpoint protection on VMs",4],["Disable public network access to storage accounts",2]];
  const tot=R.reduce((a,r)=>a+r[1],0);const done=new Set([2]);
  function draw(){const pts=R.filter((r,i)=>done.has(i)).reduce((a,r)=>a+r[1],0),pct=Math.round(pts/tot*100);
    el.innerHTML=`<div class="viz-title">Raise your secure score in Defender for Cloud</div>
    <div class="kv"><span>Secure score</span><b class="big-cost">${pct}%</b></div><div class="meter" aria-hidden="true"><i style="width:${pct}%;background:linear-gradient(90deg,var(--bad),var(--gold),var(--good))"></i></div>
    <div class="sc-list">${R.map((r,i)=>`<label class="${done.has(i)?"done":""}"><input type="checkbox" data-i="${i}" ${done.has(i)?"checked":""}><span>${r[0]}</span><span class="mono">+${r[1]}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${pct===100?"<span class=\"status-good\">100%.</span> Every recommendation is fixed. In real life, new resources bring new recommendations, so this is ongoing.":"Defender for Cloud ranks recommendations by how much each raises your score. Fix the big ones first."}</div>`;
    if(pct===100)award("viz:score",20,"Reached a 100% secure score")}
  el.addEventListener("change",e=>{const c=e.target.closest("[data-i]");if(!c)return;c.checked?done.add(+c.dataset.i):done.delete(+c.dataset.i);draw()});draw();
}

registerModule({
  id:"arc",slug:"architecture",title:"Azure Architecture and Services",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["map","az","azsort","hier","inherit","compute","pickcomp","avset","vmopt","vmparts","host","net","netq","endp","stor","acct","tier","redund","move","movesort","entra","auth","ext","ca","rbac","zt","did","score"],
  viz(){
vizMap();vizAz();
sortViz($("#viz-azsort"),{title:"Zonal, zone-redundant or non-regional?",bins:{zonal:"Zonal",zr:"Zone-redundant",nonreg:"Non-regional (global)"},
  items:[["A VM you place in Zone 1","zonal","You pick the zone."],["A managed disk pinned to Zone 3","zonal","Pinned to one zone."],["A zonal public IP address","zonal","Bound to one zone."],["Zone-redundant storage (ZRS)","zr","Replicated across zones by the platform."],["Azure SQL Database with zone redundancy","zr","The platform handles it."],["Microsoft Entra ID","nonreg","A global service."],["Azure DNS","nonreg","Global name servers."]],done:"Classified every zone service type"});
sortViz($("#viz-hier"),{title:"Which level of the hierarchy is it?",bins:{mg:"Management group",sub:"Subscription",rg:"Resource group",res:"Resource"},
  items:[["The billing boundary that gets its own invoice","sub","Subscriptions are billing boundaries."],["Can't be nested inside another of its kind","rg","Resource groups are flat."],["Holds subscriptions, up to six levels deep","mg","Management groups organize subscriptions."],["A virtual machine","res","The basic building block."],["Deleting it deletes everything inside","rg","Resource groups share a lifecycle."],["A storage account","res","Anything you create is a resource."],["Up to 10,000 of these per directory","mg","The management group limit."],["You need an Azure account to create one","sub","Accounts own subscriptions."]],done:"Placed every level of the hierarchy"});
vizInherit();
revealViz($("#viz-compute"),{title:"VMs, containers and functions compared",cols:3,done:"Compared every compute type",items:[
  ["Virtual machines","IaaS · minutes to start","You manage the OS. Full control, most management. Billed while running.","vio"],["Containers","Seconds to start","App plus dependencies, sharing the host kernel. Portable and dense.","def"],["Azure Functions","Serverless · on demand","Code runs on events. No servers. Billed per execution.","def"],
  ["Azure Container Instances","Simplest containers","Run a container without managing VMs or orchestration.","def"],["Azure Container Apps","Serverless containers","Built-in load balancing and scaling for microservices.","def"],["Azure Kubernetes Service","Orchestration","Managed Kubernetes for many containers at scale.","vio"]]});
quizViz($("#viz-pickcomp"),{title:"Pick the compute service",done:"Picked the right compute every time",qs:[
  ["Run one container quickly for a short test, with nothing else to set up.",["Azure Container Instances","Azure Kubernetes Service","A VM scale set"],0,"ACI is the simplest container option."],
  ["Resize every image as it's uploaded, paying only when uploads happen.",["Azure Functions","A reserved VM","Azure Virtual Desktop"],0,"Event-driven and serverless."],
  ["A legacy app needs a custom driver installed on Windows Server.",["Azure Virtual Machines","Azure Functions","Azure Container Instances"],0,"Only VMs give full OS control."],
  ["Orchestrate 200 microservices with rolling updates and self-healing.",["Azure Kubernetes Service","Azure Container Instances","Azure Functions"],0,"Kubernetes is built for orchestration."],
  ["A web front end needs 2 to 20 identical VMs depending on load.",["Virtual Machine Scale Sets","An availability set","A single large VM"],0,"Scale sets autoscale identical VMs."]]});
vizAvset();
sortViz($("#viz-vmopt"),{title:"Scale sets, availability sets or Azure Virtual Desktop?",bins:{vmss:"VM Scale Sets",aset:"Availability sets",avd:"Azure Virtual Desktop"},
  items:[["Automatically add VMs when CPU is high","vmss","Scale sets autoscale."],["Spread VMs across fault domains","aset","Protects against rack failure."],["Give contractors a Windows desktop from their own laptops","avd","Cloud-hosted desktops."],["Only one group rebooted during maintenance","aset","Update domains."],["Hundreds of identical, load-balanced VMs","vmss","Built for scale."],["Windows 11 multi-session","avd","Unique to Azure Virtual Desktop."],["No extra charge beyond the VMs","aset","You pay only for VMs in the set."]],done:"Matched every VM option"});
revealViz($("#viz-vmparts"),{title:"Parts of a VM deployment",cols:4,done:"Explored every VM component",items:[
  ["Size","Compute","CPU cores, memory and GPU. Changing size is vertical scaling.","def"],["Image","OS","Windows Server, Ubuntu, or a custom image.","def"],["OS disk","Storage","A managed disk holding the operating system.","vio"],["Data disks","Storage","Extra managed disks for application data.","vio"],
  ["Virtual network and subnet","Network","The private network the VM joins.","def"],["Network interface","Network","Connects the VM to the subnet and holds its private IP.","def"],["Public IP","Optional","Lets the internet reach the VM. Often avoided for security.","atk"],["Network security group","Network","Allow and deny rules for inbound and outbound traffic.","vio"]]});
sortViz($("#viz-host"),{title:"Where should this app run?",bins:{app:"Azure App Service",ctr:"Containers",vm:"Virtual machines"},
  items:[["A Python web app deployed from GitHub, no servers to manage","app","PaaS web hosting."],["A REST API with deployment slots and autoscale","app","API apps on App Service."],["An app already packaged as a Docker image","ctr","Run it in ACI, Container Apps or AKS."],["Microservices that need orchestration","ctr","AKS or Container Apps."],["Software that needs a specific Windows Server registry tweak","vm","Full control of the OS."],["Moving an old server as-is","vm","Lift-and-shift."],["Background tasks that run with the web app","app","WebJobs."]],done:"Placed every app"});
vizNet();
quizViz($("#viz-netq"),{title:"Pick the connection",done:"Chose every network connection correctly",qs:[
  ["Connect a branch office router to Azure over the internet, encrypted.",["Site-to-site VPN","ExpressRoute","Point-to-site VPN"],0,"Whole network, over the internet."],
  ["A developer's laptop at a coffee shop needs to reach a VNet.",["Point-to-site VPN","Site-to-site VPN","VNet peering"],0,"One device."],
  ["A trading firm needs a private, low-latency link that never touches the internet.",["ExpressRoute","Site-to-site VPN","Public endpoint"],0,"ExpressRoute is private."],
  ["Two VNets in East US and West Europe need private connectivity.",["Global VNet peering","Point-to-site VPN","Azure DNS"],0,"Peering across regions."],
  ["Host the records for contoso.com alongside your other Azure resources.",["Azure DNS","ExpressRoute","An NSG"],0,"Azure DNS hosts zones (you still buy the name from a registrar)."],
  ["Allow only HTTPS into the web subnet.",["A network security group","VNet peering","Azure Data Box"],0,"NSGs filter traffic."]]});
vizEndp();
sortViz($("#viz-stor"),{title:"Which storage service?",bins:{blob:"Blobs",files:"Files",queue:"Queues",table:"Tables",disk:"Disks"},
  items:[["Product photos and videos for a website","blob","Unstructured objects."],["A shared drive mounted with SMB from office PCs","files","Managed file shares."],["Orders waiting to be processed by a worker","queue","Asynchronous messages."],["Schemaless device settings looked up by key","table","NoSQL key/attribute store."],["The OS volume of a VM","disk","Block storage for VMs."],["Nightly database backup files","blob","Blobs (often in cool or archive)."],["Lift-and-shift an app that reads \\\\server\\share","files","SMB shares replace the file server."],["Big data analytics files for a data lake","blob","Data Lake Storage is built on Blob storage."]],done:"Sorted every storage service"});
revealViz($("#viz-acct"),{title:"Storage account types",cols:4,done:"Explored every account type",items:[
  ["Standard general-purpose v2","Default","Blob, Data Lake, Queue, Table and Files. Every redundancy option. Use it unless you need premium.","def"],["Premium block blobs","Low latency","For high transaction rates or small objects. LRS or ZRS.","vio"],["Premium file shares","Fast shares","Enterprise and high-performance file shares (SMB and NFS). LRS or ZRS.","vio"],["Premium page blobs","VM disks","Page blobs only. LRS only.","vio"],
  ["Unique name","Global","3–24 lowercase letters and numbers, unique across all of Azure.","atk"],["Blob endpoint","URL","https://name.blob.core.windows.net","def"],["File endpoint","URL","https://name.file.core.windows.net","def"],["Data Lake endpoint","URL","https://name.dfs.core.windows.net","def"]]});
vizTier();vizRedund();
quizViz($("#viz-move"),{title:"Pick the migration or transfer tool",done:"Chose the right tool every time",qs:[
  ["Script a nightly copy of log files into a blob container.",["AzCopy","Azure Data Box","Azure Migrate"],0,"Command-line copy, easy to script."],
  ["An admin wants to drag and drop files into a storage account on a Mac.",["Azure Storage Explorer","AzCopy","Azure File Sync"],0,"The GUI tool."],
  ["Keep a fast local cache of a cloud file share at each branch office.",["Azure File Sync","Azure Data Box","Azure Migrate"],0,"File Sync with cloud tiering."],
  ["Discover and assess 300 on-premises VMs before moving them.",["Azure Migrate","AzCopy","Storage Explorer"],0,"Azure Migrate is the migration hub."],
  ["Move 60 TB to Azure from a site with a slow internet link.",["Azure Data Box","AzCopy over the internet","Point-to-site VPN"],0,"Ship it on a device."]]});
sortViz($("#viz-movesort"),{title:"Moving files or migrating?",bins:{az:"AzCopy",se:"Storage Explorer",fs:"Azure File Sync",mig:"Azure Migrate",db:"Azure Data Box"},
  items:[["Command line, one-way sync","az","AzCopy syncs one direction only."],["Graphical app for Windows, macOS and Linux","se","Uses AzCopy under the hood."],["Cloud tiering on Windows file servers","fs","Hot files stay local."],["Includes the Database Migration Service and Data Migration Assistant","mig","Integrated migration tools."],["Rugged device, up to 80 TB","db","Shipped to and from Azure."],["Export data out of Azure for disaster recovery","db","Data Box works both ways."]],done:"Matched every transfer tool"});
revealViz($("#viz-entra"),{title:"Entra ID vs Entra Domain Services",cols:2,done:"Compared both directory services",items:[
  ["Microsoft Entra ID","Cloud identity","Modern authentication (OAuth, OpenID Connect, SAML) for Microsoft 365, Azure and thousands of SaaS apps. SSO, MFA, Conditional Access, device management.","def"],["Microsoft Entra Domain Services","Managed domain","Domain join, Group Policy, LDAP and Kerberos/NTLM for legacy apps, with no domain controllers to patch.","vio"],
  ["Microsoft Entra Connect","Hybrid identity","Syncs users and passwords from on-premises Active Directory so people keep one identity.","def"],["Identity protection","Risk detection","Flags risky sign-ins, such as impossible travel or leaked credentials.","atk"]]});
sortViz($("#viz-auth"),{title:"Know, have or are?",bins:{know:"Something you know",have:"Something you have",are:"Something you are"},
  items:[["Password","know","A secret you remember."],["PIN","know","Also something you know."],["Microsoft Authenticator app on your phone","have","A device you possess."],["FIDO2 security key","have","A physical key."],["Fingerprint","are","Biometric."],["Face recognition with Windows Hello","are","Biometric."],["One-time code sent by text message","have","Proves you have the phone."]],done:"Classified every authentication factor"});
quizViz($("#viz-ext"),{title:"Which external identity option?",done:"Matched every external identity scenario",qs:[
  ["A consulting firm's staff need access to your project site using their own company accounts.",["B2B collaboration","Customer identity (B2C)","New internal accounts"],0,"They become guest users."],
  ["Millions of shoppers need to sign up for your store's app with email or social accounts.",["Customer identity (Azure AD B2C / Entra External ID)","B2B collaboration","Entra Domain Services"],0,"Customer identity scales to consumers."],
  ["Two organizations want Teams shared channels with a mutual trust.",["B2B direct connect","B2C","Entra Connect"],0,"Direct connect is a two-way trust."],
  ["A partner's account in your directory shows a user type of…",["Guest","Owner","Member only"],0,"B2B users appear as guests."]]});
vizCa();vizRbac();
revealViz($("#viz-zt"),{title:"Zero Trust: the three principles",cols:3,done:"Learned the Zero Trust principles",items:[
  ["Verify explicitly","Every request","Authenticate and authorize with every signal: identity, location, device, service and risk.","def"],["Use least privilege access","Just enough","Just-in-time and just-enough access, with risk-based policies.","vio"],["Assume breach","Limit damage","Segment access, encrypt end to end, and watch analytics for threats.","atk"]]});
vizDid();vizScore();
  },
  sims:[
    {id:"vmdeploy",type:"order",title:"Deploy a web server VM",
      scenario:"You're deploying a new web server in Azure from scratch. Put the steps in a logical order.",
      steps:["Create a resource group in East US","Create a virtual network with a web subnet","Create the VM in that subnet, with its NIC, OS disk and public IP","Allow inbound HTTPS in the VM's network security group","Sign in to the VM and install the web server","Browse to the public IP to test the site"],
      success:"Container, network, VM, firewall rule, software, test."},
    {id:"netdesign",type:"choice",title:"Design Fabrikam's hybrid network",
      scenario:"Fabrikam has a head office, remote staff, and two Azure VNets: a hub for shared services and a spoke for the new app.",
      steps:[
        ["The hub and spoke VNets must communicate privately. What do you add?",["VNet peering","A public IP on every VM","A point-to-site VPN"],0,"Peering connects VNets over the backbone."],
        ["The head office needs a quick, encrypted connection to Azure this week, over its existing internet link.",["Site-to-site VPN through a VPN gateway","ExpressRoute","Azure DNS"],0,"VPN works over the internet you already have."],
        ["Next year, Fabrikam wants a private connection with predictable latency that avoids the internet.",["ExpressRoute","A larger VPN gateway","Global peering"],0,"ExpressRoute uses a connectivity provider."],
        ["Remote staff need to reach the hub from home laptops.",["Point-to-site VPN","Site-to-site VPN","ExpressRoute Direct"],0,"Individual devices use point-to-site."],
        ["The app's storage account must not be reachable from the internet.",["Private endpoint, with public access disabled","A public endpoint with no firewall","A bigger storage account"],0,"Private Link keeps it on your network."],
        ["Fabrikam wants to manage DNS records for fabrikam.com in Azure.",["Host the zone in Azure DNS","Buy the domain through Azure DNS","Use an NSG"],0,"Azure DNS hosts domains; registrars sell them."]],
      success:"A connected, private network from head office to cloud."},
    {id:"redsim",type:"match",title:"Choose redundancy for each data set",
      scenario:"Match each storage requirement with the cheapest redundancy option that meets it.",
      items:[["LRS","lrs"],["ZRS","zrs"],["GRS","grs"],["RA-GZRS","ragzrs"]],
      slots:[["lrs","Test data","Easy to recreate; lowest cost wins"],["zrs","Order database files","Must stay writable if a zone fails; must stay in the region"],["grs","Backups","Must survive a regional disaster; reading after failover is fine"],["ragzrs","Global storefront images","Must survive a zone or region outage and stay readable at all times"]],
      success:"Protection that matches each data set's value, without overpaying."},
    {id:"storsim",type:"match",title:"Pick the storage service",
      scenario:"A media company is moving to Azure. Match each need to a storage service.",
      items:[["Azure Blobs","blob"],["Azure Files","files"],["Azure Queues","queue"],["Azure Tables","table"],["Azure Disks","disk"]],
      slots:[["blob","Video library","Petabytes of video streamed over HTTPS"],["files","Editing team share","A mapped drive (SMB) for editors on-premises and in the cloud"],["queue","Encoding jobs","Messages telling workers which video to encode next"],["table","User preferences","Schemaless settings looked up by user ID"],["disk","Render VM","The OS and scratch volumes of a VM"]],
      success:"Every workload has the right home."},
    {id:"rbacsim",type:"match",title:"Grant least-privilege access",
      scenario:"Four people need access to Contoso's Azure environment. Match each one to the role and scope that gives them just enough.",
      items:[["Reader at the subscription","r"],["Contributor on rg-web","c"],["Owner on the subscription","o"],["User Access Administrator on rg-data","u"]],
      slots:[["r","External auditor","Must view every resource in the subscription, change nothing"],["c","Web developer","Must create and change resources for the website only"],["o","Cloud lead","Must manage everything in the subscription and grant access"],["u","Data access manager","Must manage who can access the data resources, without changing them"]],
      success:"Everyone can do their job, and nobody can do more."},
    {id:"idsim",type:"choice",title:"Secure Northwind's sign-ins",
      scenario:"Northwind is moving to Microsoft Entra ID and wants strong identity security without frustrating users.",
      steps:[
        ["Users have accounts in on-premises Active Directory. How do they get the same identity in the cloud?",["Microsoft Entra Connect","Create new cloud accounts by hand","Entra Domain Services"],0,"Connect syncs on-premises identities."],
        ["Users complain about signing in to every app separately. What helps?",["Single sign-on","More passwords","Shorter session timeouts"],0,"SSO means one sign-in."],
        ["Admins must prove identity with more than a password.",["Require MFA with a Conditional Access policy","Longer admin passwords only","Share one admin account"],0,"Conditional Access can require MFA."],
        ["Sign-ins from a country Northwind never operates in must be stopped.",["A Conditional Access policy that blocks that location","Azure Policy","A resource lock"],0,"Location is a Conditional Access signal."],
        ["Northwind wants to remove passwords for frontline staff.",["Passwordless with Windows Hello or FIDO2 keys","Security questions","Writing PINs on badges"],0,"Passwordless uses something you have plus something you are or know."],
        ["Overall, which model should guide these choices?",["Zero Trust: verify explicitly, least privilege, assume breach","Trust everything inside the office","Perimeter firewalls only"],0,"Zero Trust checks every request."]],
      success:"Strong identity, fewer passwords, and access decisions based on signals."}
  ],
  badges:[
    ["reader","AR","Architect in Training","Mark all 15 architecture and services lessons studied",c=>c.allStudied()],
    ["lab","SL","Service Lab","Complete all 28 diagrams in this module",c=>c.vizAll()],
    ["map","RP","Globetrotter","Explore the region map, including Brazil South and a sovereign region",c=>c.earned("viz:map")],
    ["az","AZ","Zone Defender","Test every failure level in the failure simulator",c=>c.earned("viz:az")],
    ["inherit","IN","Heir Apparent","Assign at every level of the hierarchy",c=>c.earned("viz:inherit")],
    ["net","NW","Network Builder","Connect every path in the hybrid network",c=>c.earned("viz:net")],
    ["redund","RA","Copy That","Test every redundancy option against an outage",c=>c.earned("viz:redund")],
    ["vmdeploy","VM","First Deployment","Pass the VM deployment simulation",c=>c.passed("vmdeploy")],
    ["netdesign","HN","Hybrid Designer","Pass the hybrid network simulation",c=>c.passed("netdesign")],
    ["redsim","GR","Geo-Redundant","Pass the redundancy simulation",c=>c.passed("redsim")],
    ["storsim","ST","Storage Savvy","Pass the storage service simulation",c=>c.passed("storsim")],
    ["rbacsim","LP","Least Privilege","Pass the RBAC simulation",c=>c.passed("rbacsim")],
    ["idsim","ZT","Zero Trust","Pass the identity simulation",c=>c.passed("idsim")],
    ["perfect","A+","Solution Architect","Score 100% on an architecture quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
