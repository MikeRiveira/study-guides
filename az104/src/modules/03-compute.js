/* ================= Module 3: Deploy and Manage Azure Compute Resources (AZ-104 Domain 3, 20–25%) ================= */
(function(){
const LESSONS=[
{id:"arm",num:"3.1",title:"ARM templates and Bicep",html:`
<p><b>Azure Resource Manager (ARM)</b> is the deployment and management layer behind the portal, CLI, PowerShell and REST API. <b>Infrastructure as code</b> describes resources in files you can version, review and redeploy identically.</p>
<h3>ARM templates (JSON)</h3>
<p>An ARM template is a <b>declarative</b> JSON file. Its sections:</p>
<div class="viz" id="viz-armparts"></div>
<p>A separate <b>parameters file</b> (<code>main.parameters.json</code>) supplies values per environment, so the same template deploys dev and prod. Use <code>reference()</code> and <code>dependsOn</code> to order resources, and a <b>Key Vault reference</b> in the parameters file to pass secrets.</p>
<h3>Bicep</h3>
<p><b>Bicep</b> is a simpler language that compiles to ARM JSON. Same capabilities, far less syntax, automatic dependencies from symbolic names, and <b>modules</b> for reuse. Convert with <code>az bicep build</code> (Bicep → JSON) and <code>az bicep decompile</code> (JSON → Bicep).</p>
<pre class="json">param location string = resourceGroup().location
@minLength(3)
@maxLength(24)
param storageName string

resource sa 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}
output blobEndpoint string = sa.properties.primaryEndpoints.blob</pre>
<h3>Deploying</h3>
<ul><li><code>az deployment group create -g rg --template-file main.bicep --parameters @main.parameters.json</code> or <code>New-AzResourceGroupDeployment</code>.</li>
<li>Scopes: resource group, subscription (<code>az deployment sub create</code>, for example to create resource groups or assign policy), management group and tenant.</li>
<li><b>What-if</b> (<code>az deployment group what-if</code>, or <code>-WhatIf</code>) previews creates, modifies and deletes before you deploy.</li>
<li><b>Incremental</b> mode (default) adds and updates resources and leaves others alone. <b>Complete</b> mode <b>deletes</b> resources in the group that aren't in the template.</li>
<li><b>Export</b> a template from an existing resource group or a past deployment (Automation → Export template) to capture what's there.</li></ul>
<div class="viz" id="viz-mode"></div>
<div class="viz" id="viz-armq"></div>`},
{id:"vm",num:"3.2",title:"Create and configure virtual machines",html:`
<p>An Azure <b>virtual machine</b> is made of several resources: the VM itself, an <b>OS disk</b>, optional <b>data disks</b>, a <b>network interface</b> (NIC) in a VNet subnet, and usually a <b>network security group</b> and maybe a <b>public IP</b>.</p>
<div class="viz" id="viz-vmparts"></div>
<h3>Choosing a size</h3>
<p>Sizes come in families: <b>B</b> (burstable, cheap for light loads), <b>D</b> (general purpose), <b>E</b> (memory optimized), <b>F</b> (compute optimized), <b>L</b> (storage optimized), <b>N</b> (GPU), <b>M</b> (huge memory, SAP), <b>H</b> (HPC). Resize later; if the new size isn't on the current hardware cluster, <b>deallocate</b> first.</p>
<div class="viz" id="viz-sizes"></div>
<h3>Power states and billing</h3>
<ul><li><b>Running</b>: you pay for compute and storage.</li>
<li><b>Stopped</b> (shut down from inside the OS or <code>az vm stop</code>): still allocated, <b>still billed</b> for compute.</li>
<li><b>Stopped (deallocated)</b>: compute released; you pay only for disks (and static public IPs). Dynamic public IPs are released.</li></ul>
<div class="viz" id="viz-power"></div>
<h3>Other things to know</h3>
<ul><li><b>Authentication</b>: SSH keys (recommended for Linux) or password; Windows needs a complex password and a non-reserved username.</li>
<li><b>Spot VMs</b>: cheap spare capacity that can be evicted (Deallocate or Delete policy). <b>Azure Hybrid Benefit</b>: bring Windows Server or SQL licenses.</li>
<li><b>Extensions</b> run post-deployment tasks: Custom Script Extension, Azure Monitor Agent, DSC, antimalware. <b>Run Command</b> runs a script inside the VM through the agent without network access.</li>
<li><b>Cloud-init</b> (Linux) or custom data configures a VM at first boot.</li>
<li><b>Connect</b> with SSH or RDP over a public IP, or better, through <b>Azure Bastion</b> (module 4) with no public IP at all. <b>Redeploy</b> moves a VM to a new host when it's unreachable.</li></ul>`},
{id:"disks",num:"3.3",title:"VM disks and encryption",html:`
<p>VMs use <b>managed disks</b>: Azure handles the storage account behind them. Each VM has an <b>OS disk</b>, a temporary disk (lost on deallocate or redeploy; never store data there) and optional <b>data disks</b>.</p>
<div class="viz" id="viz-disktype"></div>
<ul><li><b>Ultra Disk</b>: highest performance, adjustable IOPS and throughput, data disks only.</li>
<li><b>Premium SSD v2</b>: flexible performance without resizing, data disks only.</li>
<li><b>Premium SSD</b>: production and performance-sensitive workloads; single-VM SLA of 99.9%.</li>
<li><b>Standard SSD</b>: web servers, light production, dev/test.</li>
<li><b>Standard HDD</b>: backups and non-critical data.</li></ul>
<p>Disks can be <b>LRS</b> or <b>ZRS</b> (Premium and Standard SSD). You can <b>increase</b> a disk's size (never shrink it), and change its type while the VM is deallocated. <b>Snapshots</b> capture a disk at a point in time; <b>images</b> and the <b>Azure Compute Gallery</b> let you reuse a generalized VM.</p>
<h3>Encryption</h3>
<ul><li><b>Server-side encryption</b> (SSE): always on, platform-managed or customer-managed keys (through a <b>disk encryption set</b>).</li>
<li><b>Encryption at host</b>: also encrypts temp disks and caches on the host. Must be enabled on the subscription feature first.</li>
<li><b>Azure Disk Encryption</b> (ADE): encrypts inside the OS with BitLocker (Windows) or DM-Crypt (Linux), keys in <b>Key Vault</b> (the vault must allow disk encryption).</li>
<li><b>Confidential disk encryption</b> for confidential VMs.</li></ul>
<div class="viz" id="viz-encq"></div>`},
{id:"avail",num:"3.4",title:"Availability and moving VMs",html:`
<p>Hardware fails and hosts get patched. Azure offers three ways to keep a workload running, each with its own SLA:</p>
<div class="viz" id="viz-sla"></div>
<ul><li><b>Availability sets</b> spread VMs across <b>fault domains</b> (separate racks with their own power and network; up to 3) and <b>update domains</b> (groups rebooted together during maintenance; up to 20, default 5) in <b>one datacenter</b>. 99.95% SLA with 2+ VMs. You can only add a VM to an availability set when you create it.</li>
<li><b>Availability zones</b> place VMs in physically separate datacenters in the region. 99.99% SLA with VMs in 2+ zones. A VM can't be in both an availability set and a zone.</li>
<li><b>Single VM</b> with Premium SSD or Ultra disks: 99.9%.</li></ul>
<p>Load balancers (module 4) spread traffic across the VMs. For regional disasters, replicate to another region with <b>Azure Site Recovery</b> (module 5).</p>
<h3>Moving VMs</h3>
<ul><li><b>Another resource group or subscription</b>: <code>az resource move</code> or the portal, with the NIC, disks and public IP. The region doesn't change.</li>
<li><b>Another region</b>: <b>Azure Resource Mover</b> (or Site Recovery).</li>
<li><b>Into a zone</b>: for an existing regional VM, use the portal's zone move (Site Recovery-based) or rebuild from snapshots.</li>
<li><b>Into an availability set</b>: you can't add an existing VM; recreate it from its disks.</li></ul>
<div class="viz" id="viz-moveq"></div>`},
{id:"vmss",num:"3.5",title:"Virtual Machine Scale Sets",html:`
<p>A <b>Virtual Machine Scale Set</b> (VMSS) deploys and manages a group of load-balanced VMs from one configuration, and scales the number of instances automatically.</p>
<ul><li><b>Orchestration modes</b>: <b>Flexible</b> (recommended; mix sizes, full VM APIs, spread across zones and fault domains) and <b>Uniform</b> (identical instances, managed as a group).</li>
<li><b>Upgrade policy</b> for model changes: <b>Manual</b>, <b>Automatic</b> or <b>Rolling</b> (batches, with health checks).</li>
<li>Spread instances across <b>availability zones</b> for 99.99%. Up to 1,000 instances (Flexible).</li></ul>
<h3>Autoscale</h3>
<p><b>Autoscale</b> settings (in Azure Monitor) change the instance count:</p>
<ul><li><b>Instance limits</b>: minimum, maximum and default.</li>
<li><b>Metric rules</b>, for example scale out by 1 when average CPU &gt; 70% for 10 minutes, scale in by 1 when &lt; 30%. Always pair a scale-out rule with a scale-in rule.</li>
<li><b>Schedule</b>-based profiles, for example 10 instances on weekdays 8:00–18:00.</li>
<li>A <b>cooldown</b> (default 5 minutes) waits after a scale action before evaluating again.</li>
<li><b>Predictive autoscale</b> forecasts CPU load from history.</li></ul>
<div class="viz" id="viz-autoscale"></div>
<div class="viz" id="viz-vmssdrill"></div>`},
{id:"containers",num:"3.6",title:"Containers: ACR, Container Instances and Container Apps",html:`
<p>Containers package an app with its dependencies. AZ-104 covers three services:</p>
<h3>Azure Container Registry (ACR)</h3>
<ul><li>A private registry for container images and artifacts. Name: 5–50 alphanumeric characters, globally unique (<code>contosoacr.azurecr.io</code>).</li>
<li>Tiers: <b>Basic</b>, <b>Standard</b>, <b>Premium</b>. Only Premium adds <b>geo-replication</b>, private endpoints and content trust.</li>
<li><b>ACR Tasks</b> build images in the cloud (<code>az acr build</code>), no local Docker needed. <code>az acr import</code> copies images from other registries.</li>
<li>Authenticate with Entra ID (<code>az acr login</code>), managed identities with the <b>AcrPull</b> role, or the admin account (off by default; avoid).</li></ul>
<h3>Azure Container Instances (ACI)</h3>
<ul><li>The fastest way to run a container: no VMs or orchestrator. Billed per second for CPU and memory.</li>
<li>A <b>container group</b> shares a host, network and storage (like a Kubernetes pod).</li>
<li>Public IP with a <b>DNS name label</b> (<code>label.region.azurecontainer.io</code>) or private IP in a VNet. Mount Azure Files shares for persistent data.</li>
<li><b>Restart policy</b>: <b>Always</b> (default; web apps), <b>OnFailure</b> or <b>Never</b> (batch jobs that run once).</li></ul>
<h3>Azure Container Apps</h3>
<ul><li>Serverless containers for microservices and APIs, built on Kubernetes with KEDA and Dapr, without managing a cluster.</li>
<li>Apps live in a <b>Container Apps environment</b> (shared network and logging).</li>
<li><b>Ingress</b> (external or internal), <b>revisions</b> with traffic splitting, and <b>scale rules</b> (HTTP, events, CPU). Can <b>scale to zero</b>.</li>
<li>CPU and memory come in fixed pairs (0.25 vCPU / 0.5 GiB up to 4 vCPU / 8 GiB on Consumption).</li></ul>
<div class="viz" id="viz-cpick"></div>
<div class="viz" id="viz-acidrill"></div>`},
{id:"appsvc",num:"3.7",title:"Azure App Service",html:`
<p><b>App Service</b> hosts web apps, REST APIs and mobile back ends (.NET, Java, Node.js, Python, PHP, or a container) on Windows or Linux, fully managed.</p>
<h3>App Service plans</h3>
<p>A <b>plan</b> is the set of VMs (workers) that apps run on: region, OS, tier and instance count. Every app in a plan shares its workers and its cost.</p>
<div class="viz" id="viz-tier"></div>
<ul><li><b>Scale up</b>: change the tier or size (more CPU, memory, features).</li>
<li><b>Scale out</b>: add instances, manually or with <b>autoscale</b> (Standard and higher), or <b>automatic scaling</b> (Premium v2/v3).</li>
<li><b>Zone redundancy</b> (Premium v2/v3 and Isolated v2) needs at least 3 instances.</li></ul>
<h3>Deployment slots</h3>
<p><b>Slots</b> (Standard: 5, Premium: 20) are live copies of the app with their own host names, for example <code>contoso-shop-staging.azurewebsites.net</code>. Deploy to <b>staging</b>, warm it up and test, then <b>swap</b> with production: no downtime, and swapping again rolls back. Settings marked as <b>deployment slot settings</b> ("sticky") stay with their slot; others move with the code.</p>
<div class="viz" id="viz-swap"></div>
<h3>Other configuration</h3>
<ul><li><b>Custom domains</b>: add a <b>CNAME</b> (subdomain) or an <b>A record</b> plus a <b>TXT</b> record <code>asuid.&lt;domain&gt;</code> for verification. Not on Free. Then bind a <b>TLS/SSL certificate</b> (a free App Service managed certificate, an imported one, or one from Key Vault) with SNI SSL.</li>
<li><b>Backup</b>: automatic backups on Basic and higher; custom scheduled backups to a storage account on Standard and higher.</li>
<li><b>Networking</b>: <b>VNet integration</b> for outbound calls into a VNet; <b>private endpoints</b> and <b>access restrictions</b> for inbound.</li>
<li><b>Always On</b> keeps the app loaded (not on Free); <b>HTTPS Only</b>; app settings and connection strings become environment variables.</li></ul>`}
];

const G={
 arm:[["ARM template format","Declarative JSON"],["ARM template sections","$schema, contentVersion, parameters, variables, functions, resources, outputs"],["Required template sections","$schema, contentVersion, resources"],["Bicep","A simpler language that compiles to ARM JSON"],["Bicep to ARM JSON","az bicep build"],["ARM JSON to Bicep","az bicep decompile"],["Default deployment mode","Incremental"],["Complete mode","Deletes resources in the group that aren't in the template"],["Preview a deployment","what-if (az deployment group what-if / -WhatIf)"],["Deploy to a resource group (CLI)","az deployment group create"],["Deploy to a resource group (PowerShell)","New-AzResourceGroupDeployment"],["Deploy at subscription scope","az deployment sub create"],["Pass secrets to a template safely","Key Vault reference in the parameters file"],["Capture an existing resource group as a template","Export template"],["Order resources in ARM JSON","dependsOn (Bicep infers it)"],["Reuse Bicep code","Modules"]],
 vm:[["Resources created with a VM","OS disk, NIC, often NSG, public IP and VNet"],["B-series","Burstable, low-cost"],["D-series","General purpose"],["E-series","Memory optimized"],["F-series","Compute optimized"],["N-series","GPU"],["L-series","Storage optimized"],["Stopped vs deallocated","Stopped still bills compute; deallocated doesn't"],["Resize to a size on another cluster","Deallocate first"],["Spot VM","Discounted spare capacity that can be evicted"],["Custom Script Extension","Runs scripts on a VM after deployment"],["Run Command","Runs a script inside the VM via the agent"],["Fix an unreachable VM by moving it to a new host","Redeploy"],["Temporary disk","Lost on deallocate or redeploy"],["Can you shrink a managed disk?","No, only increase"],["Disk types, fastest to slowest","Ultra, Premium SSD v2, Premium SSD, Standard SSD, Standard HDD"],["Single-VM SLA requires","Premium SSD or Ultra disks (99.9%)"],["Azure Disk Encryption uses","BitLocker (Windows) or DM-Crypt (Linux) with keys in Key Vault"],["Encryption at host","Encrypts temp disks and caches on the host"],["Customer-managed keys for disks","Disk encryption set"]],
 avail:[["Fault domain","A rack with shared power and network"],["Update domain","VMs rebooted together during maintenance"],["Max fault domains in an availability set","3"],["Max update domains","20 (default 5)"],["Availability set SLA","99.95% (2+ VMs)"],["Availability zones SLA","99.99% (2+ zones)"],["Can a VM be in an availability set and a zone?","No"],["Add an existing VM to an availability set?","No; recreate it from its disks"],["Move a VM to another region","Azure Resource Mover or Site Recovery"],["VMSS orchestration modes","Flexible and Uniform"],["VMSS upgrade policies","Manual, Automatic, Rolling"],["Autoscale cooldown default","5 minutes"],["Autoscale best practice","Pair every scale-out rule with a scale-in rule"],["Autoscale profile types","Default, recurring schedule, fixed date"],["Max Flexible VMSS instances","1,000"]],
 app:[["ACR name rules","5–50 alphanumeric characters, globally unique"],["ACR tier with geo-replication","Premium"],["Build an image in the cloud","az acr build (ACR Tasks)"],["Role to pull images from ACR","AcrPull"],["ACI container group","Containers sharing a host, network and storage"],["ACI restart policies","Always, OnFailure, Never"],["Run a one-time batch container","ACI with restart policy Never or OnFailure"],["ACI DNS name format","label.region.azurecontainer.io"],["Container Apps features","Ingress, revisions, traffic splitting, scale to zero"],["Container Apps environment","Shared network and logging boundary for apps"],["App Service plan","The workers (VMs) that apps run on"],["Scale up vs scale out","Bigger tier vs more instances"],["Lowest tier with deployment slots","Standard (5 slots)"],["Premium slots","20"],["Lowest tier with autoscale","Standard"],["Custom domains need","CNAME, or A + TXT asuid record; not on Free"],["Sticky setting","Deployment slot setting that stays with its slot"],["Roll back a bad swap","Swap again"],["Free TLS certificate","App Service managed certificate"],["Outbound access to a VNet from App Service","VNet integration"],["Zone-redundant App Service needs","Premium v2/v3 or Isolated v2 with 3+ instances"],["Always On","Keeps the app loaded; not on Free"]]
};
const DECKS=[["arm","ARM and Bicep"],["vm","VMs and disks"],["avail","Availability and scale sets"],["app","Containers and App Service"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which ARM template section defines values supplied at deployment time?",o:["parameters","variables","outputs","resources"],a:0,e:"Variables are computed inside the template."},
 {q:"Which sections must every ARM template have?",o:["$schema, contentVersion, resources","parameters and outputs","variables and functions","Only resources"],a:0,e:"Everything else is optional."},
 {q:"You deploy a template in Complete mode to rg-web. The template defines only a storage account; rg-web also has a VM. What happens to the VM?",o:["It's deleted","It's kept","It's stopped","The deployment fails"],a:0,e:"Complete mode removes resources not in the template."},
 {q:"How do you preview what a deployment would change?",o:["az deployment group what-if","az deployment group validate --mode Complete","az bicep build","Export template"],a:0,e:"What-if shows creates, modifies and deletes."},
 {q:"Which command converts an ARM JSON template to Bicep?",o:["az bicep decompile","az bicep build","az deployment export","az bicep convert"],a:0,e:"build goes the other way."},
 {q:"You want one template for dev and prod with different SKUs. What do you use?",o:["Separate parameters files","Two copies of the template","Complete mode","Resource locks"],a:0,e:"Parameters files per environment."},
 {q:"A template needs an admin password without storing it in the parameters file. What do you use?",o:["A Key Vault reference in the parameters file","A variable","An output","A tag"],a:0,e:"The vault must be enabled for template deployment."},
 {q:"Which command deploys a Bicep file to a resource group with PowerShell?",o:["New-AzResourceGroupDeployment","New-AzDeployment","New-AzTemplate","Set-AzResourceGroup"],a:0,e:"New-AzDeployment targets the subscription."},
 {q:"You must create resource groups from a template. At which scope do you deploy?",o:["Subscription","Resource group","Resource","Tenant only"],a:0,e:"az deployment sub create."},
 {q:"How can you capture an existing resource group as a reusable template?",o:["Export template","what-if","Resource Mover","Azure Advisor"],a:0,e:"Automation → Export template."},
 {q:"A VM is shut down from inside Windows. Is compute still billed?",o:["Yes; it's stopped but still allocated","No","Only for the OS disk","Only for the public IP"],a:0,e:"Deallocate it to stop compute billing."},
 {q:"Which VM family is memory optimized?",o:["E","F","B","N"],a:0,e:"F is compute optimized, N is GPU, B is burstable."},
 {q:"A dev VM is idle most of the day with short spikes. Which family is cheapest?",o:["B (burstable)","E","M","H"],a:0,e:"B-series banks credits."},
 {q:"Resizing a running VM fails because the size isn't available on the current cluster. What do you do?",o:["Deallocate the VM, then resize","Delete and recreate it","Redeploy it","Change the region"],a:0,e:"Deallocating lets Azure place it on a new cluster."},
 {q:"You need to run a script inside a VM that has no network access to you. What do you use?",o:["Run Command","Bastion","Azure Policy","A NIC"],a:0,e:"It runs through the VM agent."},
 {q:"Which extension downloads and runs a script after deployment?",o:["Custom Script Extension","Azure Monitor Agent","Network Watcher","DSC only"],a:0,e:"Common for post-deployment configuration."},
 {q:"A VM is unreachable and diagnostics suggest a host problem. What should you try?",o:["Redeploy","Resize to a smaller size","Add a tag","Delete the OS disk"],a:0,e:"Redeploy moves it to a new host; temp disk data is lost."},
 {q:"Which data is lost when you deallocate a VM?",o:["The temporary disk","The OS disk","Data disks","The NIC"],a:0,e:"Never keep data on the temp disk."},
 {q:"Which disk type gives a single VM a 99.9% SLA?",o:["Premium SSD","Standard HDD","Standard SSD","Temporary disk"],a:0,e:"Premium SSD or Ultra on all disks."},
 {q:"A database needs the highest IOPS, adjustable without downtime. Which disk?",o:["Ultra Disk","Standard SSD","Standard HDD","Premium SSD v1 at 32 GB"],a:0,e:"Ultra is data disks only."},
 {q:"You need to shrink a 1 TB data disk to 512 GB. What can you do?",o:["Create a new smaller disk and copy the data","Resize it in the portal","Use az disk update --size-gb 512","Change it to Standard HDD"],a:0,e:"Managed disks can only grow."},
 {q:"Which feature encrypts a VM's disks inside the guest OS with BitLocker or DM-Crypt?",o:["Azure Disk Encryption","Server-side encryption","Encryption at host","TLS"],a:0,e:"Keys are in Key Vault."},
 {q:"What does encryption at host add on top of server-side encryption?",o:["Encryption of temp disks and caches on the host","Encryption in transit","Guest OS encryption","Nothing"],a:0,e:"Data is encrypted before it leaves the host."},
 {q:"Where do you configure customer-managed keys for managed disks?",o:["A disk encryption set","The VM's NIC","The storage account","Azure Policy"],a:0,e:"It points to a Key Vault key."},
 {q:"Two VMs in an availability set: what protects them from a rack power failure?",o:["Fault domains","Update domains","Availability zones","Scale sets"],a:0,e:"Fault domains are separate racks."},
 {q:"What protects VMs in an availability set from planned maintenance reboots at the same time?",o:["Update domains","Fault domains","Spot priority","Disk encryption"],a:0,e:"Only one update domain reboots at a time."},
 {q:"Which configuration gives a 99.99% VM SLA?",o:["Two or more VMs across availability zones","Two VMs in an availability set","One VM with Premium SSD","One VM with Standard HDD"],a:0,e:"Zones: 99.99%; sets: 99.95%; single: 99.9%."},
 {q:"Can you add an existing VM to an availability set?",o:["No; recreate it from its disks into the set","Yes, any time","Yes, if deallocated","Only with PowerShell"],a:0,e:"Availability sets are chosen at creation."},
 {q:"How many fault domains can an availability set have at most?",o:["3","2","5","20"],a:0,e:"Update domains go up to 20."},
 {q:"You must move a VM from East US to West Europe. Which tool?",o:["Azure Resource Mover","az resource move","Export template only","Availability set"],a:0,e:"az resource move doesn't change regions."},
 {q:"Which VMSS orchestration mode is recommended for new deployments?",o:["Flexible","Uniform","Classic","Manual"],a:0,e:"Flexible offers full VM control and zone spreading."},
 {q:"A VMSS should add an instance when average CPU is above 75% for 10 minutes. What do you configure?",o:["An autoscale scale-out rule","An availability set","A Delete lock","A larger VM size"],a:0,e:"And pair it with a scale-in rule."},
 {q:"Why pair a scale-out rule with a scale-in rule?",o:["Otherwise the instance count only grows, and so do costs","Autoscale requires exactly two rules","To avoid locks","Scale-in rules set the maximum"],a:0,e:"Instances never shrink without one."},
 {q:"Your app needs 10 instances every weekday from 8:00 to 18:00. What do you add?",o:["A recurring schedule profile","A cooldown of 10 hours","A Spot VM","Manual scaling"],a:0,e:"Schedule-based autoscale."},
 {q:"What does the autoscale cooldown do?",o:["Waits after a scale action before scaling again","Cools the CPU","Stops the scale set","Defines the minimum instances"],a:0,e:"Prevents flapping."},
 {q:"Which VMSS upgrade policy updates instances in batches with health checks?",o:["Rolling","Manual","Automatic","Flexible"],a:0,e:"Rolling upgrades."},
 {q:"Which ACR tier supports geo-replication?",o:["Premium","Standard","Basic","All"],a:0,e:"Also private endpoints."},
 {q:"You need to build a container image without Docker installed. What do you run?",o:["az acr build","docker build","az container create","az acr login"],a:0,e:"ACR Tasks build in the cloud."},
 {q:"An app's managed identity must pull images from ACR. Which role?",o:["AcrPull","AcrPush","Contributor","Owner"],a:0,e:"Least privilege for pulling."},
 {q:"A nightly batch container should run once and stop. Which ACI restart policy?",o:["Never (or OnFailure)","Always","Rolling","Manual"],a:0,e:"Always restarts it forever."},
 {q:"Which ACI feature lets several containers share a network and lifecycle?",o:["Container group","Revision","Slot","Scale set"],a:0,e:"Similar to a Kubernetes pod."},
 {q:"A microservice API should scale to zero when idle and split traffic between versions. Which service?",o:["Azure Container Apps","Azure Container Instances","App Service Free tier","A VM"],a:0,e:"Revisions and scale to zero."},
 {q:"Which tier is the lowest that supports deployment slots?",o:["Standard","Basic","Free","Shared"],a:0,e:"Standard gives 5 slots."},
 {q:"After a swap, the production app connects to the staging database. Why?",o:["The connection string wasn't marked as a deployment slot setting","Swap always copies everything","The plan is Basic","Always On was off"],a:0,e:"Sticky settings stay with their slot."},
 {q:"A swap to production introduced a bug. Fastest rollback?",o:["Swap again","Redeploy the previous version from source","Delete the slot","Scale down"],a:0,e:"The old version is now in staging."},
 {q:"Your app needs more memory per instance. What do you do?",o:["Scale up (higher tier or size)","Scale out","Add a slot","Add a custom domain"],a:0,e:"Scale out adds instances."},
 {q:"To map www.contoso.com to an App Service app, which DNS record do you create?",o:["CNAME www → contoso-shop.azurewebsites.net","MX","PTR","SRV"],a:0,e:"Apex domains use A + TXT asuid."},
 {q:"Which tier can't use custom domains?",o:["Free (F1)","Basic","Standard","Premium"],a:0,e:"Shared and up support custom domains."},
 {q:"An App Service app must call a database that only has a private IP in a VNet. What do you configure?",o:["VNet integration","A private endpoint for the app","Access restrictions","A deployment slot"],a:0,e:"VNet integration is for outbound traffic."},
 {q:"Which App Service feature keeps the app loaded to avoid cold starts?",o:["Always On","Auto-heal","ARR affinity","HTTP/2"],a:0,e:"Not available on Free."}
];

/* ---------- interactive diagrams ---------- */
const SAP=(o)=>Object.assign({sku:"Standard_LRS",kind:"StorageV2",tier:"Hot",https:true,tls:"TLS1_2",publicBlob:false,pna:"Enabled",defaultAction:"Allow",ipRules:[],vnetRules:[],containers:{},shares:{},keyGen:{key1:1,key2:1},blobProps:{},hns:false},o||{});
function vizMode(){const el=$("#viz-mode");const RG=[["vm-app01","Virtual machine"],["stapp4410","Storage account"],["kv-app","Key vault"],["sql-app","SQL server"]];let tpl=new Set(["stapp4410","kv-app"]),mode="Incremental",res=null;const seen=new Set();
  function draw(){el.innerHTML=`<div class="viz-title">Incremental vs Complete deployment</div>
    <div class="two-col"><div class="panel"><div class="s-small">TEMPLATE DEFINES (tap to toggle)</div><div class="sc-list">${RG.map(r=>`<label class="${tpl.has(r[0])?"done":""}"><input type="checkbox" data-t="${r[0]}" ${tpl.has(r[0])?"checked":""}><span>${r[0]}</span><span class="tag">${r[1]}</span></label>`).join("")}</div></div>
    <div class="panel"><div class="s-small">rg-app AFTER DEPLOYMENT</div><div class="sc-list">${RG.map(r=>{const st=!res?"exists":res[r[0]];return `<label class="${st==="deleted"?"":"done"}"><span>${st==="deleted"?"✗":"✓"}</span><span>${r[0]}</span><span class="tag">${st}</span></label>`}).join("")}</div></div></div>
    <div class="seg-row"><button class="chip" data-m="Incremental" aria-pressed="${mode==="Incremental"}">Incremental</button><button class="chip" data-m="Complete" aria-pressed="${mode==="Complete"}">Complete</button><button class="btn" data-a="go">Deploy</button><button class="btn" data-a="reset">Reset</button></div>
    <div class="caption" aria-live="polite">${!res?"rg-app already has all four resources. Choose what the template defines and a mode, then deploy.":mode==="Complete"?`Complete mode deleted ${RG.filter(r=>res[r[0]]==="deleted").map(r=>r[0]).join(", ")||"nothing"}. Always run what-if first!`:"Incremental mode updated the resources in the template and left the others untouched."} <span class="s-small">${seen.size}/2 modes tried</span></div>`;
    if(seen.size===2)award("viz:mode",25,"Compared deployment modes")}
  el.addEventListener("change",e=>{const t=e.target.dataset.t;if(t){e.target.checked?tpl.add(t):tpl.delete(t);draw()}});
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),a=e.target.closest("[data-a]")?.dataset.a;if(m){mode=m.dataset.m;draw()}if(a==="go"){res={};RG.forEach(r=>res[r[0]]=tpl.has(r[0])?"updated":mode==="Complete"?"deleted":"untouched");seen.add(mode);draw()}if(a==="reset"){res=null;draw()}});draw()}
function vizPower(){const el=$("#viz-power");let st="run";const seen=new Set(["run"]);
  const S={run:["Running","Compute ✓ billed","Disks ✓ billed","Dynamic public IP kept","10.0.1.4 kept"],stop:["Stopped","Compute ✓ still billed","Disks ✓ billed","Dynamic public IP kept","10.0.1.4 kept"],dealloc:["Stopped (deallocated)","Compute ✗ not billed","Disks ✓ billed","Dynamic public IP released","Dynamic private IP may change on start"],del:["Deleted","Compute ✗","Disks ✓ still billed (left behind unless deleted)","Public IP left behind","NIC left behind"]};
  const A=[["start","Start",["stop","dealloc"],"run"],["stop","Stop (az vm stop / shut down in OS)",["run"],"stop"],["dealloc","Stop (deallocate)",["run","stop"],"dealloc"],["del","Delete VM",["run","stop","dealloc"],"del"]];
  function draw(){const s=S[st];el.innerHTML=`<div class="viz-title">VM power states and billing</div>
    <div class="stp-flow">${["run","stop","dealloc","del"].map(k=>`<span class="${k===st?"on":""}">${S[k][0]}</span>`).join("")}</div>
    <div class="viz-controls">${A.map(a=>`<button class="btn" data-a="${a[0]}" ${a[2].includes(st)?"":"disabled"}>${a[1]}</button>`).join("")}<button class="btn" data-a="reset">New VM</button></div>
    <div class="kv">${s.slice(1).map(x=>`<span>${x.split(" ")[0]==="Compute"?"Compute":x.startsWith("Disks")?"Disks":x.includes("public")||x.startsWith("Public")?"Public IP":"Private IP / NIC"}</span><b>${x}</b>`).join("")}</div>
    <div class="caption" aria-live="polite">${st==="stop"?"Surprise: a VM shut down from inside the OS still costs compute. Deallocate it from Azure.":st==="dealloc"?"Deallocated: you only pay for disks (and static IPs).":st==="del"?"Deleting a VM leaves its disks, NIC and public IP behind unless you chose to delete them too.":"Running: you pay for everything."} <span class="s-small">${seen.size}/4 states seen</span></div>`;
    if(seen.size===4)award("viz:power",20,"Explored every VM power state")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(!a||a.disabled)return;const k=a.dataset.a;if(k==="reset")st="run";else st=A.find(x=>x[0]===k)[3];seen.add(st);draw()});draw()}
function vizSla(){const el=$("#viz-sla");const O=[["single","Single VM, Standard HDD","—",0],["prem","Single VM, Premium SSD","99.9%",1],["avset","2 VMs in an availability set","99.95%",2],["zones","2 VMs in different zones","99.99%",3]];
  const F=[["rack","A rack loses power"],["maint","Planned host maintenance"],["dc","A whole datacenter (zone) fails"],["region","The region goes down"]];
  let o="single";const seen=new Set();
  const up=(o,f)=>o==="single"||o==="prem"?false:o==="avset"?f!=="dc"&&f!=="region":f!=="region";
  function draw(){const x=O.find(z=>z[0]===o);el.innerHTML=`<div class="viz-title">Availability options under fire</div>
    <div class="seg-row">${O.map(z=>`<button class="chip" data-o="${z[0]}" aria-pressed="${z[0]===o}">${z[1]}</button>`).join("")}</div>
    <div class="kv"><span>SLA</span><b class="mono">${x[2]}</b></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Event</th><th>App stays up?</th></tr>${F.map(f=>{seen.add(o+f[0]);return `<tr><td>${f[1]}</td><td class="${up(o,f[0])?"ok":"no"}">${up(o,f[0])?"✓ Yes":"✗ Downtime"}</td></tr>`}).join("")}</table></div>
    <div class="caption" aria-live="polite">${o==="avset"?"Fault domains handle racks; update domains handle maintenance. But all of it is in one datacenter.":o==="zones"?"Separate datacenters survive anything short of a regional outage. For that, use Site Recovery to another region.":"One VM means any host problem is downtime. Premium disks only raise the SLA."}</div>`;
    if(O.every(z=>seen.has(z[0]+"rack")))award("viz:sla",25,"Compared every availability option")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-o]");if(b){o=b.dataset.o;draw()}});draw()}
function vizAutoscale(){const el=$("#viz-autoscale");const st={min:2,max:6,out:70,inn:30,cool:2};let t=0,n=2,last=-99,hist=[];const LOAD=[30,35,55,80,90,95,92,88,70,50,35,25,20,18,22];const seen=new Set();
  function step(){if(t>=LOAD.length)return;const total=LOAD[t]*2;const cpu=Math.min(100,Math.round(total/n*2/2));let act="";
    if(t-last>=st.cool){if(cpu>st.out&&n<st.max){n++;last=t;act="+1";seen.add("out")}else if(cpu<st.inn&&n>st.min){n--;last=t;act="−1";seen.add("in")}else if(cpu>st.out&&n>=st.max){act="at max";seen.add("max")}}else if(cpu>st.out||cpu<st.inn)act="cooldown";
    hist.push({t,cpu,n,act});t++}
  function draw(){el.innerHTML=`<div class="viz-title">Autoscale simulator · vmss-web</div>
    <div class="rng-row"><span>Min / max instances</span><input type="range" min="1" max="5" value="${st.min}" data-k="min"><b>${st.min}</b><input type="range" min="2" max="10" value="${st.max}" data-k="max"><b>${st.max}</b></div>
    <div class="rng-row"><span>Scale out if CPU &gt;</span><input type="range" min="50" max="95" step="5" value="${st.out}" data-k="out"><b>${st.out}%</b></div>
    <div class="rng-row"><span>Scale in if CPU &lt;</span><input type="range" min="5" max="45" step="5" value="${st.inn}" data-k="inn"><b>${st.inn}%</b></div>
    <div class="rng-row"><span>Cooldown</span><input type="range" min="1" max="4" value="${st.cool}" data-k="cool"><b>${st.cool} interval${st.cool>1?"s":""}</b></div>
    <div class="viz-controls"><button class="btn" data-a="step" ${t>=LOAD.length?"disabled":""}>Next 5 minutes</button><button class="btn" data-a="run" ${t>=LOAD.length?"disabled":""}>Run the day</button><button class="btn" data-a="reset">Reset</button></div>
    <div class="as-chart">${hist.map(h=>`<div class="as-bar" title="t${h.t}: ${h.cpu}% CPU, ${h.n} instances"><i style="height:${h.cpu}%" class="${h.cpu>st.out?"hot":h.cpu<st.inn?"cold":""}"></i><b>${h.n}</b><em>${h.act}</em></div>`).join("")||'<span class="s-small">Press Next to start the workday.</span>'}</div>
    <div class="caption" aria-live="polite">Bars show average CPU per instance; the number is the instance count. ${seen.has("max")?"Hitting the maximum means users feel the load: raise max or scale up.":""} <span class="s-small">Seen: ${["out","in","max"].filter(x=>seen.has(x)).length}/3 (scale out, scale in, at max)</span></div>`;
    if(seen.has("out")&&seen.has("in"))award("viz:autoscale",30,"Watched autoscale scale out and back in")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;st[k]=+e.target.value;if(st.min>st.max)st.max=st.min;t=0;n=st.min;last=-99;hist=[];draw();el.querySelector(`[data-k="${k}"]`).focus()});
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(a==="step")step();if(a==="run")while(t<LOAD.length)step();if(a==="reset"){t=0;n=st.min;last=-99;hist=[]}if(a)draw()});draw()}
function vizTier(){const el=$("#viz-tier");const T=[["F1","Free",0,1,0,0,0,0,0],["B1","Basic",13,3,1,0,0,0,0],["S1","Standard",70,10,1,1,5,1,0],["P1v3","Premium v3",125,30,1,1,20,1,1]];
  const N=[["dom","Custom domain and TLS",4],["as","Autoscale",5],["slot","Deployment slots",6],["bk","Scheduled backups",7],["zr","Zone redundancy",8]];const need=new Set();let inst=1;const seen=new Set();
  function draw(){const fit=T.find(t=>[...need].every(k=>t[N.find(n=>n[0]===k)[2]])&&t[3]>=inst);if(fit)seen.add(fit[0]);
    el.innerHTML=`<div class="viz-title">Pick the cheapest App Service tier</div>
    <div class="seg-row">${N.map(n=>`<button class="chip" data-n="${n[0]}" aria-pressed="${need.has(n[0])}">${n[1]}</button>`).join("")}</div>
    <div class="rng-row"><span>Instances needed</span><input type="range" min="1" max="30" value="${inst}" data-k="i"><b>${inst}</b></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Feature</th>${T.map(t=>`<th class="${fit===t?"cur":""}">${t[1]}</th>`).join("")}</tr>
      <tr><td>Max instances</td>${T.map(t=>`<td class="${t[3]>=inst?"ok":"no"}">${t[3]}</td>`).join("")}</tr>
      ${N.map(n=>`<tr><td>${n[1]}</td>${T.map(t=>`<td class="${t[n[2]]?"ok":"no"}${need.has(n[0])?"":" dim"}">${n[0]==="slot"?(t[6]||"✗"):t[n[2]]?"✓":"✗"}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${fit?`Cheapest fit: <b>${fit[1]} (${fit[0]})</b>.`:"Nothing fits; Isolated v2 goes up to 100 instances."} ${need.has("zr")?"Zone redundancy also needs at least 3 instances.":""} <span class="s-small">${seen.size}/4 tiers recommended</span></div>`;
    if(seen.size===4)award("viz:tier",25,"Found a use for every App Service tier")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(b){const k=b.dataset.n;need.has(k)?need.delete(k):need.add(k);draw()}});
  el.addEventListener("input",e=>{if(e.target.dataset.k){inst=+e.target.value;draw();el.querySelector('[data-k="i"]').focus()}});draw()}
function vizSwap(){const el=$("#viz-swap");let P={v:"v1",db:"prod-db",flag:"off"},S={v:"v2",db:"staging-db",flag:"on"};let sticky=new Set();let swaps=0,bad=false;const seen=new Set();
  function draw(){const card=(n,x)=>`<div class="panel"><div class="s-small">${n}</div><b class="mono">Code ${x.v}</b><div class="kv"><span>DB_CONNECTION${sticky.has("db")?" 📌":""}</span><b class="mono">${x.db}</b><span>FEATURE_FLAG${sticky.has("flag")?" 📌":""}</span><b class="mono">${x.flag}</b></div></div>`;
    el.innerHTML=`<div class="viz-title">Slot swap: staging → production</div>
    <div class="seg-row"><span class="s-small">Mark as deployment slot setting (sticky):</span><button class="chip" data-s="db" aria-pressed="${sticky.has("db")}">DB_CONNECTION</button><button class="chip" data-s="flag" aria-pressed="${sticky.has("flag")}">FEATURE_FLAG</button></div>
    <div class="two-col">${card("PRODUCTION · contoso-shop.azurewebsites.net",P)}${card("STAGING · contoso-shop-staging.azurewebsites.net",S)}</div>
    <div class="viz-controls"><button class="btn" data-a="swap">Swap</button><button class="btn" data-a="reset">Reset</button></div>
    <div class="caption" aria-live="polite">${swaps===0?"Staging has v2 with the new feature flag on. Decide which settings should stick to their slot, then swap.":P.db!=="prod-db"?'<span class="status-bad">Production is now talking to the staging database!</span> Mark DB_CONNECTION as a slot setting and try again.':P.v==="v2"?'<span class="status-good">v2 is live with the production database.</span> The feature flag traveled with the code. Swap again to roll back.':"Rolled back: v1 is serving production again."}</div>`;
    if(seen.has("bad")&&seen.has("good"))award("viz:swap",30,"Mastered sticky slot settings")}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),a=e.target.closest("[data-a]")?.dataset.a;if(s){const k=s.dataset.s;sticky.has(k)?sticky.delete(k):sticky.add(k);draw();return}
    if(a==="swap"){const np={...S},ns={...P};["db","flag"].forEach(k=>{if(sticky.has(k)){np[k]=P[k];ns[k]=S[k]}});P=np;S=ns;swaps++;seen.add(P.db==="prod-db"&&P.v==="v2"?"good":P.db!=="prod-db"?"bad":"rb");draw()}
    if(a==="reset"){P={v:"v1",db:"prod-db",flag:"off"};S={v:"v2",db:"staging-db",flag:"on"};swaps=0;draw()}});draw()}

const BICEP=`param location string = resourceGroup().location
@minLength(3)
@maxLength(24)
param storageName string
@allowed([ 'Standard_LRS', 'Standard_ZRS', 'Standard_GRS' ])
param sku string = 'Standard_LRS'

resource sa 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: sku }
  kind: 'StorageV2'
  properties: { minimumTlsVersion: 'TLS1_2', allowBlobPublicAccess: false }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'plan-\${storageName}'
  location: location
  sku: { name: 'B1' }
}

output blobEndpoint string = sa.properties.primaryEndpoints.blob`;
const TPL={"main.bicep":{text:BICEP,params:{location:{type:"string",default:"eastus"},storageName:{type:"string",minLength:3,maxLength:24},sku:{type:"string",default:"Standard_LRS",allowed:["Standard_LRS","Standard_ZRS","Standard_GRS"]}},
  res:(p)=>[{t:"sa",name:p.storageName,loc:p.location,p:SAP({sku:p.sku})},{t:"plan",name:"plan-"+p.storageName,loc:p.location,p:{sku:"B1",workers:1,linux:false,zr:false}}]}};

registerModule({
  id:"cmp",slug:"compute",title:"Deploy and Manage Azure Compute Resources",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["armparts","mode","armq","vmparts","sizes","power","disktype","encq","sla","moveq","autoscale","vmssdrill","cpick","acidrill","tier","swap"],
  viz(){
revealViz($("#viz-armparts"),{title:"Anatomy of an ARM template",cols:2,done:"Explored every template section",items:[["$schema","REQUIRED","The JSON schema that describes the template language version."],["contentVersion","REQUIRED","Your own version number, like 1.0.0.0."],["parameters","OPTIONAL","Values supplied at deployment, with types, defaults, allowed values and length limits."],["variables","OPTIONAL","Values computed inside the template, like a naming convention."],["functions","OPTIONAL","User-defined functions."],["resources","REQUIRED","The resources to deploy: type, apiVersion, name, location, properties, dependsOn."],["outputs","OPTIONAL","Values returned after deployment, like an endpoint URL."]]});
vizMode();
quizViz($("#viz-armq"),{title:"Template scenarios",done:"Solved every template scenario",qs:[
  ["A deployment fails: 'The value for the template parameter storageName is not provided.' What's missing?",["A value for a parameter without a default","A variable","An output"],0,"Pass --parameters storageName=… or use a parameters file."],
  ["You must know whether a deployment will delete anything before running it.",["Run what-if","Use Complete mode","Use az bicep build"],0,"What-if lists deletes in red."],
  ["The same Bicep file must deploy dev with LRS and prod with GRS.",["Use a parameter for the SKU and two parameters files","Copy the file","Hard-code GRS"],0,"Parameters plus @allowed values."],
  ["You inherited a resource group built by hand and want it as code.",["Export the template, then decompile to Bicep","Run what-if","Move the resources"],0,"Export template, then az bicep decompile."],
  ["A teammate's ARM JSON is hard to read. You want Bicep.",["az bicep decompile","az bicep build","az deployment group create --mode Complete"],0,"Decompile is best effort; review the output."]]});
revealViz($("#viz-vmparts"),{title:"What gets created with a VM",cols:3,done:"Explored every part of a VM",items:[["Virtual machine","COMPUTE","Size (vCPU, memory), image, admin account, zone or availability set."],["OS disk","DISK","A managed disk with the operating system. Premium SSD by default."],["Data disks","DISK","Optional extra managed disks for application data."],["Network interface","NIC","Connects the VM to a subnet with a private IP. Can have its own NSG."],["Network security group","NSG","Filters traffic. The CLI opens SSH (22) or RDP (3389) by default."],["Public IP","PIP","Optional internet address. Use Bastion instead to avoid exposing the VM."]]});
sortViz($("#viz-sizes"),{title:"Pick the VM family",bins:{b:"B (burstable)",d:"D (general purpose)",e:"E (memory)",f:"F (compute)",n:"N (GPU)"},
  items:[["A small dev box that's idle most of the day","b","Banks CPU credits."],["A balanced web and app server","d","General purpose."],["An in-memory SQL Server cache","e","High memory-to-CPU ratio."],["A batch job that crunches numbers on every core","f","High CPU-to-memory ratio."],["Training a machine-learning model","n","GPUs."],["A jump box used a few minutes a day","b","Cheapest option."]],done:"Matched every VM family"});
vizPower();
sortViz($("#viz-disktype"),{title:"Pick the disk type",bins:{ultra:"Ultra Disk",prem:"Premium SSD",ssd:"Standard SSD",hdd:"Standard HDD"},
  items:[["SAP HANA log volume needing sub-millisecond latency","ultra","Highest performance."],["Production SQL Server data disk","prem","Production performance."],["A lightly used web server","ssd","Consistent but cheaper."],["Backup copies rarely read","hdd","Cheapest."],["A single VM that must have a 99.9% SLA","prem","Premium SSD or Ultra."],["Dev/test VM OS disk","ssd","Good value."]],done:"Picked every disk type"});
quizViz($("#viz-encq"),{title:"Disk encryption choices",done:"Chose the right encryption every time",qs:[
  ["Security wants disks encrypted with keys the company controls and can rotate.",["Customer-managed keys with a disk encryption set","Nothing; it's automatic","Encryption at host only"],0,"SSE with CMK."],
  ["Temp disks and host caches must be encrypted too.",["Encryption at host","Azure Disk Encryption only","A private endpoint"],0,"Enable the feature on the subscription first."],
  ["The guest OS volume must be encrypted with BitLocker.",["Azure Disk Encryption","Server-side encryption","TLS 1.2"],0,"Keys go to Key Vault."],
  ["Can you turn off server-side encryption for managed disks?",["No","Yes","Only for HDD"],0,"It's always on."]]});
vizSla();
quizViz($("#viz-moveq"),{title:"Where can this VM go?",done:"Moved VMs the right way every time",qs:[
  ["vm-app01 must move from rg-old to rg-new in the same subscription.",["az resource move with its NIC, disks and public IP","Azure Resource Mover","Recreate it"],0,"Region stays the same."],
  ["vm-app01 must move from East US to North Europe.",["Azure Resource Mover (or Site Recovery)","az resource move","Change its resource group"],0,"Cross-region moves need a mover."],
  ["vm-app01 must join availability set avset-app.",["Recreate it from its disks in the set","Add it in the portal","Resize it"],0,"Sets are chosen at creation."],
  ["You need two VMs to survive a datacenter outage.",["Put them in different availability zones","Use one availability set","Use Premium SSD"],0,"Zones are separate datacenters."]]});
vizAutoscale();
azViz($("#viz-vmssdrill"),{title:"Cloud Shell drill: a scale set that scales itself",scenario:"Create a scale set for the web tier and give it CPU-based autoscale between 2 and 10 instances.",
  setup:(w)=>{w.rgs["rg-web"]={name:"rg-web",loc:"eastus",tags:{}}},
  tasks:[{t:"Create <b>vmss-web</b> (Ubuntu2204, Standard_B2s, 2 instances, Flexible) in rg-web.",hint:"az vmss create -g rg-web -n vmss-web --image Ubuntu2204 --vm-sku Standard_B2s --instance-count 2 --orchestration-mode Flexible --admin-username azureuser --generate-ssh-keys",check:w=>w.res.some(r=>r.t==="vmss"&&r.name==="vmss-web")},
    {t:"Create an autoscale setting <b>as-web</b>: min 2, max 10, default 2.",hint:"az monitor autoscale create -g rg-web --resource vmss-web --resource-type Microsoft.Compute/virtualMachineScaleSets --name as-web --min-count 2 --max-count 10 --count 2",check:w=>w.res.some(r=>r.t==="as"&&r.name==="as-web"&&r.p.min===2&&r.p.max===10)},
    {t:"Add a rule: scale <b>out</b> by 2 when Percentage CPU &gt; 70 (avg over 5 minutes).",hint:'az monitor autoscale rule create -g rg-web --autoscale-name as-web --condition "Percentage CPU > 70 avg 5m" --scale out 2',check:w=>{const a=w.res.find(r=>r.t==="as"&&r.name==="as-web");return a&&a.p.rules.some(r=>r.dir==="out")}},
    {t:"Add the matching scale <b>in</b> rule: remove 1 when CPU &lt; 30.",hint:'az monitor autoscale rule create -g rg-web --autoscale-name as-web --condition "Percentage CPU < 30 avg 5m" --scale in 1',check:w=>{const a=w.res.find(r=>r.t==="as"&&r.name==="as-web");return a&&a.p.rules.some(r=>r.dir==="in")}}],
  solution:'az vmss create -g rg-web -n vmss-web --image Ubuntu2204 --vm-sku Standard_B2s --instance-count 2 --orchestration-mode Flexible --admin-username azureuser --generate-ssh-keys\naz monitor autoscale create -g rg-web --resource vmss-web --resource-type Microsoft.Compute/virtualMachineScaleSets --name as-web --min-count 2 --max-count 10 --count 2\naz monitor autoscale rule create -g rg-web --autoscale-name as-web --condition "Percentage CPU > 70 avg 5m" --scale out 2\naz monitor autoscale rule create -g rg-web --autoscale-name as-web --condition "Percentage CPU < 30 avg 5m" --scale in 1'},"vmssdrill",40,"Built an autoscaling scale set");
sortViz($("#viz-cpick"),{title:"Which container service?",bins:{aci:"Container Instances",aca:"Container Apps",acr:"Container Registry",app:"App Service"},
  items:[["Run a one-off data-processing container for 10 minutes","aci","Per-second billing, no orchestration."],["Microservices that scale to zero and split traffic between revisions","aca","Serverless with revisions."],["Store and geo-replicate private images","acr","Premium tier."],["A web app with deployment slots and custom domains, from a container image","app","Web App for Containers."],["Build images in the cloud on every commit","acr","ACR Tasks."],["An event-driven worker scaling on queue length","aca","KEDA scale rules."]],done:"Matched every container service"});
azViz($("#viz-acidrill"),{title:"Cloud Shell drill: registry to running container",scenario:"Import a sample image into a new registry, then run it in Azure Container Instances with a public DNS name.",
  setup:(w)=>{w.rgs["rg-apps"]={name:"rg-apps",loc:"eastus",tags:{}}},
  tasks:[{t:"Create a <b>Basic</b> registry called <b>contosoacr4410</b> in rg-apps.",hint:"az acr create -g rg-apps -n contosoacr4410 --sku Basic",check:w=>w.res.some(r=>r.t==="acr"&&r.name==="contosoacr4410")},
    {t:"Import <code>mcr.microsoft.com/azuredocs/aci-helloworld:latest</code> as <b>hello:v1</b>.",hint:"az acr import -n contosoacr4410 --source mcr.microsoft.com/azuredocs/aci-helloworld:latest --image hello:v1",check:w=>{const r=w.res.find(r=>r.t==="acr"&&r.name==="contosoacr4410");return r&&(r.p.repos.hello||[]).includes("v1")}},
    {t:"Run it in ACI as <b>aci-hello</b> with a public IP, port 80 and DNS label <b>contoso-hello-4410</b>. The registry is private, so ACI needs credentials. For this drill, enable the admin user and read its password (in production, use a managed identity with AcrPull).",hint:'az acr update -n contosoacr4410 --admin-enabled true\npw=$(az acr credential show -n contosoacr4410 --query "passwords[0].value" -o tsv)\naz container create -g rg-apps -n aci-hello --image contosoacr4410.azurecr.io/hello:v1 --registry-login-server contosoacr4410.azurecr.io --registry-username contosoacr4410 --registry-password $pw --ports 80 --ip-address Public --dns-name-label contoso-hello-4410 --os-type Linux',check:w=>w.res.some(r=>r.t==="aci"&&r.name==="aci-hello"&&r.p.dns==="contoso-hello-4410")}],
  solution:"az acr create -g rg-apps -n contosoacr4410 --sku Basic\naz acr import -n contosoacr4410 --source mcr.microsoft.com/azuredocs/aci-helloworld:latest --image hello:v1\naz acr update -n contosoacr4410 --admin-enabled true\npw=$(az acr credential show -n contosoacr4410 --query \"passwords[0].value\" -o tsv)\naz container create -g rg-apps -n aci-hello --image contosoacr4410.azurecr.io/hello:v1 --registry-login-server contosoacr4410.azurecr.io --registry-username contosoacr4410 --registry-password $pw --ports 80 --ip-address Public --dns-name-label contoso-hello-4410 --os-type Linux\naz container show -g rg-apps -n aci-hello -o table"},"acidrill",40,"Ran a container from your own registry");
vizTier();vizSwap();
  },
  sims:[
    {id:"bicep",type:"cli",title:"Deploy with Bicep safely",shell:"both",
      scenario:"<code>main.bicep</code> creates a storage account and an App Service plan. Preview it, deploy it to <b>rg-iac</b>, then see why Complete mode is dangerous: rg-iac already contains a VM someone built by hand.",
      files:TPL,
      setup:(w,AZ)=>{w.rgs["rg-iac"]={name:"rg-iac",loc:"eastus",tags:{}};AZ.newVm(w,"rg-iac","vm-legacy",{image:"Win2022Datacenter",size:"Standard_B2s",pip:""})},
      tasks:[
        {t:"Read the template (<code>cat main.bicep</code>). Which parameter has no default?",hint:"cat main.bicep",sticky:true,check:w=>w._cat},
        {t:"Preview the deployment with <b>what-if</b>, passing <code>storageName=stiac4410</code>.",hint:"az deployment group what-if -g rg-iac --template-file main.bicep --parameters storageName=stiac4410",psHint:"New-AzResourceGroupDeployment -ResourceGroupName rg-iac -TemplateFile main.bicep -storageName stiac4410 -WhatIf",sticky:true,check:w=>w._whatif},
        {t:"Deploy it (Incremental) with storageName <b>stiac4410</b> and sku <b>Standard_ZRS</b>.",hint:"az deployment group create -g rg-iac --template-file main.bicep --parameters storageName=stiac4410 sku=Standard_ZRS",psHint:"New-AzResourceGroupDeployment -ResourceGroupName rg-iac -TemplateFile main.bicep -storageName stiac4410 -sku Standard_ZRS",check:w=>{const s=w.res.find(r=>r.t==="sa"&&r.name==="stiac4410");return s&&s.p.sku==="Standard_ZRS"}},
        {t:"Make sure <b>vm-legacy</b> survived the deployment.",hint:"az resource list -g rg-iac -o table",check:w=>w.res.some(r=>r.t==="vm"&&r.name==="vm-legacy")&&w.res.some(r=>r.name==="stiac4410")},
        {t:"Run what-if again in <b>Complete</b> mode (don't deploy!) and see what it would delete.",hint:"az deployment group what-if -g rg-iac --template-file main.bicep --parameters storageName=stiac4410 sku=Standard_ZRS --mode Complete",sticky:true,check:w=>w._whatifc}],
      onCmd:(l,w)=>{if(/^cat\s+main\.bicep/.test(l.trim()))w._cat=true;if(/what-?if/i.test(l)&&!/complete/i.test(l)&&/stiac4410/.test(l))w._whatif=true;if(/what-?if/i.test(l)&&/complete/i.test(l))w._whatifc=true},
      success:"Infrastructure as code, previewed before it ran. Complete mode would have deleted vm-legacy and everything attached to it.",
      solution:"cat main.bicep\naz deployment group what-if -g rg-iac --template-file main.bicep --parameters storageName=stiac4410\naz deployment group create -g rg-iac --template-file main.bicep --parameters storageName=stiac4410 sku=Standard_ZRS\naz resource list -g rg-iac -o table\naz deployment group what-if -g rg-iac --template-file main.bicep --parameters storageName=stiac4410 sku=Standard_ZRS --mode Complete",
      psSolution:"cat main.bicep\nNew-AzResourceGroupDeployment -ResourceGroupName rg-iac -TemplateFile main.bicep -storageName stiac4410 -WhatIf\nNew-AzResourceGroupDeployment -ResourceGroupName rg-iac -TemplateFile main.bicep -storageName stiac4410 -sku Standard_ZRS\nGet-AzResource -ResourceGroupName rg-iac\nNew-AzResourceGroupDeployment -ResourceGroupName rg-iac -TemplateFile main.bicep -storageName stiac4410 -sku Standard_ZRS -Mode Complete -WhatIf"},
    {id:"vmlab",type:"cli",title:"Build and manage a VM",shell:"both",
      scenario:"Deploy a zone-redundant web VM, give it a data disk, open HTTP, then resize it and stop paying for it overnight.",
      setup:(w)=>{w.rgs["rg-vm"]={name:"rg-vm",loc:"eastus",tags:{}}},
      tasks:[
        {t:"Create <b>vm-web01</b> in rg-vm: Ubuntu2204, Standard_B2s, availability <b>zone 1</b>, SSH keys.",hint:"az vm create -g rg-vm -n vm-web01 --image Ubuntu2204 --size Standard_B2s --zone 1 --admin-username azureuser --generate-ssh-keys",psHint:"New-AzVM -ResourceGroupName rg-vm -Name vm-web01 -Location eastus -Image Ubuntu2204 -Size Standard_B2s -Zone 1 -Credential (Get-Credential)",sticky:true,check:w=>{const v=w.res.find(r=>r.t==="vm"&&r.name==="vm-web01");return v&&String(v.p.zone)==="1"}},
        {t:"Attach a new <b>64 GB</b> data disk named <b>vm-web01-data</b>.",hint:"az vm disk attach -g rg-vm --vm-name vm-web01 --name vm-web01-data --new --size-gb 64",check:w=>{const v=w.res.find(r=>r.t==="vm"&&r.name==="vm-web01");const d=w.res.find(r=>r.t==="disk"&&r.name==="vm-web01-data");return v&&d&&d.p.vm==="vm-web01"&&d.p.size===64}},
        {t:"Open port <b>80</b> on the VM's NSG.",hint:"az vm open-port -g rg-vm -n vm-web01 --port 80 --priority 900",check:w=>w.res.some(r=>r.t==="nsg"&&r.p.rules.some(x=>(x.port||[]).includes("80")&&x.access==="Allow"))},
        {t:"Resize it to <b>Standard_D2s_v5</b>. (If Azure says the size isn't on this cluster, what must you do first?)",hint:"az vm deallocate -g rg-vm -n vm-web01\naz vm resize -g rg-vm -n vm-web01 --size Standard_D2s_v5",check:w=>{const v=w.res.find(r=>r.t==="vm"&&r.name==="vm-web01");return v&&v.p.size==="Standard_D2s_v5"}},
        {t:"End the day with the VM <b>deallocated</b> so compute billing stops.",hint:"az vm deallocate -g rg-vm -n vm-web01",psHint:"Stop-AzVM -ResourceGroupName rg-vm -Name vm-web01 -Force",check:w=>{const v=w.res.find(r=>r.t==="vm"&&r.name==="vm-web01");return v&&v.p.power==="VM deallocated"}}],
      success:"A zonal VM with its data disk, HTTP open and nothing billing for compute overnight.",
      solution:"az vm create -g rg-vm -n vm-web01 --image Ubuntu2204 --size Standard_B2s --zone 1 --admin-username azureuser --generate-ssh-keys\naz vm disk attach -g rg-vm --vm-name vm-web01 --name vm-web01-data --new --size-gb 64\naz vm open-port -g rg-vm -n vm-web01 --port 80 --priority 900\naz vm resize -g rg-vm -n vm-web01 --size Standard_D2s_v5\naz vm deallocate -g rg-vm -n vm-web01\naz vm resize -g rg-vm -n vm-web01 --size Standard_D2s_v5\naz vm list -d -g rg-vm -o table"},
    {id:"slots",type:"cli",title:"Ship a release with deployment slots",shell:"bash",
      scenario:"<b>contoso-shop-4410</b> runs v1 on a Basic plan. Release v2 with zero downtime: you'll need a staging slot, a sticky database setting, and a swap.",
      filesData:{"shop-v2.zip":"(binary package)"},
      setup:(w,AZ)=>{w.rgs["rg-shop"]={name:"rg-shop",loc:"eastus",tags:{}};AZ.exec(w,"az appservice plan create -g rg-shop -n plan-shop --sku B1 --is-linux");AZ.exec(w,'az webapp create -g rg-shop -p plan-shop -n contoso-shop-4410 --runtime "NODE:20-lts"');AZ.exec(w,"az webapp config appsettings set -g rg-shop -n contoso-shop-4410 --settings DB=prod-db")},
      tasks:[
        {t:"Try to create a <b>staging</b> slot. It fails on Basic: scale the plan <b>up</b> to <b>S1</b>.",hint:"az appservice plan update -g rg-shop -n plan-shop --sku S1",check:w=>w.res.find(r=>r.t==="plan"&&r.name==="plan-shop").p.sku==="S1"},
        {t:"Create the <b>staging</b> slot.",hint:"az webapp deployment slot create -g rg-shop -n contoso-shop-4410 --slot staging",check:w=>!!w.res.find(r=>r.t==="web").p.slots.staging},
        {t:"Make <b>DB=staging-db</b> a <b>deployment slot setting</b> on staging, and mark the production DB setting sticky too.",hint:"az webapp config appsettings set -g rg-shop -n contoso-shop-4410 --slot staging --slot-settings DB=staging-db\naz webapp config appsettings set -g rg-shop -n contoso-shop-4410 --slot-settings DB=prod-db",check:w=>{const s=w.res.find(r=>r.t==="web");return s.p.sticky.includes("DB")&&s.p.slots.staging&&s.p.slots.staging.settings.DB==="staging-db"&&s.p.settings.DB==="prod-db"}},
        {t:"Deploy <code>shop-v2.zip</code> to the <b>staging</b> slot and browse it.",hint:"az webapp deploy -g rg-shop -n contoso-shop-4410 --src-path shop-v2.zip --slot staging\naz webapp browse -g rg-shop -n contoso-shop-4410 --slot staging",check:w=>{const s=w.res.find(r=>r.t==="web");return s.p.slots.staging&&s.p.slots.staging.version==="v2"||s.p.version==="v2"}},
        {t:"Swap staging into production. Production must serve <b>v2</b> and still use <b>prod-db</b>.",hint:"az webapp deployment slot swap -g rg-shop -n contoso-shop-4410 --slot staging --target-slot production",check:w=>{const s=w.res.find(r=>r.t==="web");return s.p.version==="v2"&&s.p.settings.DB==="prod-db"}}],
      success:"v2 is live with no downtime, still on the production database. If anything goes wrong, swap again.",
      solution:"az webapp deployment slot create -g rg-shop -n contoso-shop-4410 --slot staging\naz appservice plan update -g rg-shop -n plan-shop --sku S1\naz webapp deployment slot create -g rg-shop -n contoso-shop-4410 --slot staging\naz webapp config appsettings set -g rg-shop -n contoso-shop-4410 --slot staging --slot-settings DB=staging-db\naz webapp config appsettings set -g rg-shop -n contoso-shop-4410 --slot-settings DB=prod-db\naz webapp deploy -g rg-shop -n contoso-shop-4410 --src-path shop-v2.zip --slot staging\naz webapp browse -g rg-shop -n contoso-shop-4410 --slot staging\naz webapp deployment slot swap -g rg-shop -n contoso-shop-4410 --slot staging --target-slot production\naz webapp browse -g rg-shop -n contoso-shop-4410"},
    {id:"computepick",type:"match",title:"Pick the compute option",
      scenario:"Match each workload to the Azure compute option that fits it best.",
      items:[["Availability zones","az"],["VM Scale Set with autoscale","vmss"],["Spot VMs","spot"],["Container Instances","aci"],["App Service Standard with slots","app"],["Container Apps","aca"]],
      slots:[["az","Ops","Two SQL VMs must survive a datacenter fire"],["vmss","Web","The web tier grows from 2 to 20 VMs on Black Friday and shrinks after"],["spot","Research","Interruptible rendering jobs at the lowest price"],["aci","Data","A container that resizes images once a night and stops"],["app","Shop","A .NET site with blue/green releases and a custom domain"],["aca","API","Microservices that scale to zero overnight"]],
      success:"Every workload has the right home."},
    {id:"vmtrouble",type:"choice",title:"Compute troubleshooting",
      scenario:"Work through the compute tickets.",
      steps:[
        ["'I shut down the VM from Windows but we're still billed for compute.'",["Stop (deallocate) it from Azure","Delete the OS disk","Remove the NIC"],0,"Stopped inside the OS stays allocated."],
        ["'The resize to E8s_v5 fails: not available in the current hardware cluster.'",["Deallocate, then resize","Redeploy the VM","Move to another resource group"],0,"Deallocation lets Azure pick a cluster that has the size."],
        ["'We can't add a staging slot.'",["The plan is Free or Basic; scale up to Standard or higher","Slots need a custom domain","Turn on Always On"],0,"Standard: 5 slots, Premium: 20."],
        ["'After the swap, production used the test database.'",["Mark the connection string as a deployment slot setting","Swap needs Premium","Use Complete mode"],0,"Sticky settings stay in place."],
        ["'The scale set never shrinks after the rush.'",["Add a scale-in rule","Lower the maximum","Use Uniform mode"],0,"Scale-out alone only grows."],
        ["'The ACI container keeps restarting after it finishes its batch.'",["Set the restart policy to Never or OnFailure","Add a public IP","Use Premium ACR"],0,"Always is the default."],
        ["'Complete-mode deployment deleted our database!'",["Use Incremental mode (the default) and run what-if first","Use a parameters file","Use Bicep instead of JSON"],0,"Complete deletes what isn't in the template."]],
      success:"All compute tickets closed."}
  ],
  badges:[
    ["reader","CP","Compute Scholar","Mark all 7 compute lessons studied",c=>c.allStudied()],
    ["lab","CL","Compute Lab","Complete all 16 diagrams in this module",c=>c.vizAll()],
    ["bicep","IaC","Infrastructure as Code","Pass the Bicep deployment lab",c=>c.passed("bicep")],
    ["vmlab","VM","VM Wrangler","Pass the VM lab",c=>c.passed("vmlab")],
    ["slots","SW","Zero Downtime","Pass the deployment slots lab",c=>c.passed("slots")],
    ["autoscale","AS","Elastic","Watch autoscale scale out and back in",c=>c.earned("viz:autoscale")],
    ["swap","ST","Sticky Fingers","Get burned by a non-sticky setting, then fix it, in the swap diagram",c=>c.earned("viz:swap")],
    ["trouble","CT","Compute Medic","Pass the compute troubleshooting simulation",c=>c.passed("vmtrouble")],
    ["perfect","CP+","Flawless Deploy","Score 100% on a compute quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
