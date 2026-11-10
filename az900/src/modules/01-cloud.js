/* ================= Module 1: Cloud Concepts (AZ-900 Domain 1, 25–30%) ================= */
(function(){
const LESSONS=[
{id:"what",num:"1.1",title:"What cloud computing is",html:`
<p><b>Cloud computing</b> is the delivery of computing services over the internet: servers, storage, databases, networking, software, analytics and intelligence. Instead of buying and running your own datacenter, you rent what you need from a <b>cloud provider</b> like Microsoft Azure and pay only for what you use.</p>
<h3>What changes when you move to the cloud</h3>
<ul><li>You don't buy hardware up front or wait weeks for it to arrive. You create resources in minutes.</li>
<li>The provider runs the buildings, power, cooling, physical security and hardware.</li>
<li>You can grow or shrink in minutes, and you're billed for actual use.</li>
<li>Services are reached over a network, usually the internet, through a portal, command line or API.</li></ul>
<div class="viz" id="viz-onprem"></div>
<div class="tip"><b>Exam tip.</b> Cloud computing is about <b>renting compute power and storage from someone else's datacenter</b> and treating it as a service. You still own your data and how you configure things.</div>`},
{id:"shared",num:"1.2",title:"The shared responsibility model",html:`
<p>In a traditional datacenter, your company is responsible for everything: the building, power, network, servers, operating systems, apps and data. In the cloud, those responsibilities are <b>shared</b> between you and the provider.</p>
<ul><li>The <b>cloud provider</b> is always responsible for the <b>physical datacenter</b>, <b>physical network</b> and <b>physical hosts</b>.</li>
<li><b>You</b> are always responsible for your <b>information and data</b>, the <b>devices</b> allowed to connect (phones and PCs), and the <b>accounts and identities</b> of your people.</li>
<li>Everything in between (operating system, network controls, applications, identity and directory infrastructure) depends on the service type.</li></ul>
<p>The more the provider manages, the less you manage: <b>IaaS</b> puts the most responsibility on you, <b>PaaS</b> splits it, and <b>SaaS</b> puts the most on the provider.</p>
<div class="viz" id="viz-shared"></div>
<div class="viz" id="viz-srq"></div>`},
{id:"models",num:"1.3",title:"Cloud models: public, private and hybrid",html:`
<ul><li><b>Public cloud</b>: built, controlled and maintained by a third-party provider. Anyone can buy services. No up-front capital cost, and you can scale quickly. You don't control the hardware.</li>
<li><b>Private cloud</b>: cloud resources used by a single organization. It can be in your own datacenter or hosted by a third party. You get full control, but you pay for and maintain the hardware.</li>
<li><b>Hybrid cloud</b>: public and private clouds connected so they work together. You decide where each workload runs: keep sensitive or legacy systems private, and burst to the public cloud for extra capacity.</li>
<li><b>Multi-cloud</b>: using more than one public cloud provider, such as Azure and another provider, either for different features or during a migration.</li></ul>
<p><b>Azure Arc</b> helps manage hybrid and multi-cloud environments from Azure. <b>Azure VMware Solution</b> lets you run VMware workloads in Azure.</p>
<div class="viz" id="viz-models"></div>
<div class="viz" id="viz-modelcmp"></div>`},
{id:"consume",num:"1.4",title:"The consumption-based model",html:`
<h3>CapEx vs OpEx</h3>
<ul><li><b>Capital expenditure (CapEx)</b>: a one-time, up-front spend on physical infrastructure, like servers and a building. The value is deducted (depreciated) over time.</li>
<li><b>Operational expenditure (OpEx)</b>: spending on services or products over time, billed as you go. You can deduct it in the same year.</li></ul>
<p>Cloud computing is <b>OpEx</b>. It runs on a <b>consumption-based model</b>: you pay only for the resources you use, with no up-front costs, no need to buy and manage infrastructure you might not use, and the ability to add or remove resources as needed.</p>
<div class="viz" id="viz-capex"></div>
<div class="viz" id="viz-cxsort"></div>`},
{id:"pricing",num:"1.5",title:"Cloud pricing models",html:`
<ul><li><b>Pay-as-you-go</b>: the default. Pay per second, hour or transaction with no commitment. Best for short-term, unpredictable or new workloads.</li>
<li><b>Reserved instances</b>: commit to a specific VM size and region for <b>1 or 3 years</b>, and save <b>up to 72%</b> compared with pay-as-you-go. Best for steady workloads that run all the time.</li>
<li><b>Azure savings plan for compute</b>: commit to spending a fixed hourly amount on compute for 1 or 3 years, across sizes and regions. Savings of <b>up to 65%</b>, with more flexibility than reservations.</li>
<li><b>Spot pricing</b>: use Azure's unused capacity at a <b>deep discount (up to 90%)</b>. Azure can <b>evict</b> spot VMs at short notice when it needs the capacity back, so use them only for interruptible work like batch jobs, testing and rendering.</li>
<li><b>Azure Hybrid Benefit</b>: reuse existing Windows Server and SQL Server licenses (with Software Assurance) in Azure to cut costs.</li></ul>
<div class="viz" id="viz-pricecalc"></div>
<div class="viz" id="viz-pickprice"></div>`},
{id:"serverless",num:"1.6",title:"Serverless",html:`
<p>With <b>serverless</b> computing, the provider manages the servers entirely. You write the code or define the workflow, and the platform runs it when it's needed. Servers still exist; you just never see or manage them.</p>
<ul><li><b>Event-driven</b>: code runs in response to a trigger, such as an HTTP request, a timer, a new file or a queue message.</li>
<li><b>Automatic scaling</b>: the platform adds instances as events increase, and scales back down, even <b>to zero</b>, when idle.</li>
<li><b>Pay per execution</b>: you're billed for the time and resources your code actually uses, not for idle servers.</li></ul>
<p>Azure examples: <b>Azure Functions</b> (run code) and <b>Azure Logic Apps</b> (run low-code workflows). Serverless is a kind of PaaS.</p>
<div class="viz" id="viz-serverless"></div>`},
{id:"ha",num:"1.7",title:"High availability and scalability",html:`
<h3>High availability</h3>
<p>A highly available system stays up even when something fails. Availability is measured as a percentage of uptime and promised in a <b>service-level agreement (SLA)</b>. Each extra "nine" cuts allowed downtime by 90%.</p>
<div class="viz" id="viz-sla"></div>
<h3>Scalability</h3>
<p><b>Scalability</b> is the ability to adjust resources to meet demand. Because you pay for what you use, you can add resources when demand rises and remove them when it falls.</p>
<ul><li><b>Vertical scaling</b> (scale up or down): give one resource more or less power, such as more CPUs or RAM for a VM.</li>
<li><b>Horizontal scaling</b> (scale out or in): add or remove instances, such as more VMs behind a load balancer.</li>
<li><b>Elasticity</b>: scaling automatically as demand changes (autoscale).</li></ul>
<div class="viz" id="viz-scale"></div>`},
{id:"benefits",num:"1.8",title:"Reliability, predictability, security, governance and manageability",html:`
<h3>Reliability and predictability</h3>
<ul><li><b>Reliability</b>: the ability to recover from failures and keep working. The cloud's decentralized design lets you spread resources across zones and regions, so an outage in one place doesn't take you down.</li>
<li><b>Performance predictability</b>: knowing the resources you need for a good customer experience. Autoscaling, load balancing and high availability help.</li>
<li><b>Cost predictability</b>: forecasting what you'll spend. Tools like the <b>pricing calculator</b>, <b>TCO calculator</b> and <b>Cost Management</b> help you plan and track.</li></ul>
<h3>Security and governance</h3>
<ul><li>Templates and policies help you follow corporate standards and regulatory requirements.</li>
<li>Audits flag resources that aren't compliant.</li>
<li>IaaS gives you maximum control of security; with PaaS and SaaS, the provider handles patching and maintenance for you.</li>
<li>The provider has strong protection against network attacks such as <b>DDoS</b> and secures the physical datacenters.</li></ul>
<h3>Manageability</h3>
<ul><li><b>Management of the cloud</b>: scale automatically, deploy from templates, monitor health and replace failing resources automatically, and get alerts.</li>
<li><b>Management in the cloud</b>: manage your resources through a web portal, a command line (CLI or PowerShell) or APIs.</li></ul>
<div class="viz" id="viz-benefits"></div>`},
{id:"svc",num:"1.9",title:"Cloud service types: IaaS, PaaS and SaaS",html:`
<ul><li><b>Infrastructure as a service (IaaS)</b>: the most flexible. You rent the hardware (servers, storage, networking) and manage the operating system and everything on top. Use cases: <b>lift-and-shift migrations</b>, testing and development environments, and workloads that need full OS control. Azure example: <b>Azure Virtual Machines</b>.</li>
<li><b>Platform as a service (PaaS)</b>: the provider runs the infrastructure <i>and</i> the operating system, middleware, development tools and databases. You focus on your app and data. Use cases: <b>development frameworks</b>, <b>analytics and business intelligence</b>. Azure examples: <b>Azure App Service</b>, <b>Azure SQL Database</b>, <b>Azure Functions</b>.</li>
<li><b>Software as a service (SaaS)</b>: a complete, finished application you rent and use. The provider manages almost everything; you manage your data, users and devices. Use cases: <b>email and messaging</b>, <b>business productivity apps</b>, <b>finance and expense tracking</b>. Examples: <b>Microsoft 365</b>, Outlook, Teams.</li></ul>
<div class="viz" id="viz-svc"></div>
<div class="viz" id="viz-svccmp"></div>
<div class="tip"><b>Exam tip.</b> If the question mentions <b>full control of the OS</b> or <b>lift-and-shift</b>, think IaaS. If it says <b>developers just deploy code</b>, think PaaS. If it's a <b>ready-to-use app</b>, think SaaS.</div>`}
];

const G={
 basics:[["Cloud computing","Delivery of computing services (servers, storage, databases, networking, software) over the internet"],["Cloud provider","Company that owns and runs the datacenters and rents out services, such as Microsoft (Azure)"],["Shared responsibility model","Security and management duties are split between the cloud provider and the customer"],["Always the provider's responsibility","Physical datacenter, physical network and physical hosts"],["Always the customer's responsibility","Information and data, devices (mobile and PCs), and accounts and identities"],["Responsibility in IaaS","Customer manages OS, network controls, apps, identity infrastructure and data; provider manages physical layers"],["Responsibility in PaaS","Provider also manages the OS; network controls, apps and identity infrastructure are shared"],["Responsibility in SaaS","Provider manages almost everything; customer manages data, devices, accounts and identities"],["On-premises responsibility","The customer is responsible for everything"],["Which service type gives the customer the most responsibility?","IaaS"],["Which service type gives the customer the least responsibility?","SaaS"],["Who patches the guest OS on an Azure VM?","The customer (IaaS)"],["Who patches the OS under Azure App Service?","Microsoft (PaaS)"],["Who secures the physical datacenter for Azure?","Microsoft, always"],["Who is responsible for data classification and protection in Microsoft 365?","The customer"],["Who configures network controls for an Azure VM?", "The customer (IaaS)"],["Who protects the physical network in every cloud service type?", "The cloud provider"]],
 models:[["Public cloud","Built and run by a third-party provider; anyone can buy services; no CapEx"],["Private cloud","Cloud resources used by a single organization, on-premises or hosted"],["Hybrid cloud","Public and private clouds connected so workloads can run in either"],["Multi-cloud","Using more than one public cloud provider"],["Benefit of public cloud","No up-front hardware cost, rapid scaling, pay for what you use"],["Benefit of private cloud","Complete control over resources and security"],["Drawback of private cloud","You buy and maintain the hardware (CapEx)"],["Benefit of hybrid cloud","Keep sensitive or legacy workloads on-premises while using public cloud for scale"],["Cloud bursting","Using the public cloud for extra capacity when on-premises demand peaks (hybrid)"],["Azure Arc","Manages servers, Kubernetes and data services across on-premises, multi-cloud and edge from Azure"],["Azure VMware Solution","Runs VMware workloads natively in Azure"],["Which model has no up-front capital cost?","Public cloud"],["Which model offers the most control?","Private cloud"],["Private cloud hosted by a third party", "Still private: dedicated to one organization in someone else's datacenter"],["Common reasons for multi-cloud", "Use features from different providers, avoid lock-in, or migrate between them"]],
 money:[["CapEx","Capital expenditure: one-time up-front spending on physical infrastructure"],["OpEx","Operational expenditure: ongoing spending on services, billed over time"],["Is cloud computing CapEx or OpEx?","OpEx"],["Consumption-based model","Pay only for the resources you use; no up-front cost"],["Benefit of the consumption model","No paying for idle capacity; add or remove resources as needed"],["Depreciation","Spreading a CapEx purchase's cost over its useful life"],["Pay-as-you-go","Default pricing: pay per use with no commitment"],["Reserved instances","Commit to 1 or 3 years for a VM size and region; save up to 72%"],["Azure savings plan for compute","Commit to an hourly compute spend for 1 or 3 years; save up to 65% across sizes and regions"],["Spot VMs","Unused Azure capacity at up to 90% off; can be evicted at short notice"],["Best workload for spot VMs","Interruptible work: batch processing, dev/test, rendering"],["Best workload for reserved instances","Steady, predictable workloads that run 24/7"],["Azure Hybrid Benefit","Reuse existing Windows Server and SQL Server licenses in Azure to save money"],["Serverless","Provider manages all servers; code runs on events and you pay per execution"],["Azure Functions","Serverless compute: run code in response to events"],["Azure Logic Apps","Serverless low-code workflows that connect apps and services"],["Scale to zero","Serverless apps use no instances, and cost nothing, when idle"],["Is serverless IaaS, PaaS or SaaS?","A form of PaaS"],["Pay-as-you-go billing granularity", "Per second, hour or transaction, depending on the service"],["Reservation terms", "1 year or 3 years"]],
 benefits:[["High availability","Keeping a service running with minimal downtime, even when components fail"],["SLA","Service-level agreement: the provider's formal uptime and connectivity commitment"],["99.9% uptime allows about…","43.8 minutes of downtime per month (8.76 hours per year)"],["99.95% uptime allows about…","21.9 minutes of downtime per month"],["99.99% uptime allows about…","4.4 minutes of downtime per month"],["99.999% uptime allows about…","26 seconds of downtime per month"],["Composite SLA","For services that depend on each other, multiply their SLAs; the result is lower than either"],["Scalability","Adjusting resources to meet demand"],["Vertical scaling","Scale up or down: add CPU or RAM to an existing resource"],["Horizontal scaling","Scale out or in: add or remove instances"],["Elasticity","Automatic scaling as demand changes"],["Reliability","The ability to recover from failures and keep functioning"],["Predictability","Confidence in performance and in cost"],["Performance predictability","Achieved with autoscaling, load balancing and high availability"],["Cost predictability","Forecasting spend with the pricing calculator, TCO calculator and Cost Management"],["Governance in the cloud","Templates, policies and audits keep resources compliant with standards"],["Management of the cloud","Managing the resources themselves: autoscale, templates, monitoring, auto-replace"],["Management in the cloud","How you manage: portal, CLI, PowerShell, APIs"],["DDoS protection","The provider shields its network against distributed denial-of-service attacks"],["Fault tolerance", "Continuing to operate when a component fails, usually through redundancy"],["Service credit", "A partial refund when Microsoft misses an SLA commitment"],["Why does a composite SLA go down?", "Every dependent service is one more thing that can fail"],["Raising availability with redundancy", "Run independent copies in zones or regions so all must fail at once"]],
 svc:[["IaaS","Infrastructure as a service: rent hardware; you manage the OS and up"],["PaaS","Platform as a service: provider manages infrastructure and OS; you manage apps and data"],["SaaS","Software as a service: a finished app; the provider manages almost everything"],["IaaS use cases","Lift-and-shift migration, test and development, full OS control"],["PaaS use cases","Development frameworks, analytics and business intelligence"],["SaaS use cases","Email and messaging, productivity apps, finance and expense tracking"],["Azure example of IaaS","Azure Virtual Machines"],["Azure examples of PaaS","Azure App Service, Azure SQL Database, Azure Functions"],["Example of SaaS","Microsoft 365 (Outlook, Teams, Word online)"],["Lift-and-shift","Moving servers to the cloud as VMs without redesigning them (IaaS)"],["Most flexible service type","IaaS"],["Service type with the least management","SaaS"],["Developers deploy code without managing servers","PaaS"],["Which type requires you to install OS updates?","IaaS"],["Who manages the runtime and middleware in PaaS?", "Microsoft"],["Who manages the application itself in SaaS?", "Microsoft (you manage data, users and devices)"]]
};
const DECKS=[["basics","Cloud basics and shared responsibility"],["models","Cloud models"],["money","Consumption and pricing"],["benefits","Cloud benefits"],["svc","IaaS, PaaS and SaaS"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which statement BEST describes cloud computing?",o:["Delivering computing services over the internet on a pay-as-you-go basis","Buying servers and hosting them in your own office, paid for up front each year","Installing software from DVDs","Running all workloads on employee laptops"],a:0,e:"Cloud computing rents compute, storage and services over a network."},
 {q:"In the shared responsibility model, which is ALWAYS the cloud provider's responsibility?",o:["The physical datacenter","Your data","User accounts","Devices that connect"],a:0,e:"Physical datacenter, network and hosts always belong to the provider."},
 {q:"In the shared responsibility model, which is ALWAYS the customer's responsibility?",o:["Information and data","Physical hosts","Physical network","Datacenter cooling"],a:0,e:"Customers always own their data, devices, accounts and identities."},
 {q:"A company runs Windows Server on an Azure virtual machine. Who is responsible for installing OS security updates?",o:["The company","Microsoft","Shared equally","Nobody; VMs patch themselves"],a:0,e:"Azure VMs are IaaS, so the guest OS is the customer's job."},
 {q:"A company uses Azure App Service for its website. Who maintains the underlying operating system?",o:["Microsoft","The company","The web developer's ISP","The end users"],a:0,e:"App Service is PaaS: Microsoft manages the OS."},
 {q:"Which service type places the MOST responsibility on the customer?",o:["IaaS","PaaS","SaaS","Serverless"],a:0,e:"With IaaS you manage the OS and everything above it."},
 {q:"Which service type places the LEAST responsibility on the customer?",o:["SaaS","IaaS","PaaS","On-premises"],a:0,e:"SaaS is a finished app; you manage only data, devices and accounts."},
 {q:"Your company uses Microsoft 365. Who is responsible for classifying and protecting the documents stored in it?",o:["Your company","Microsoft","The document authors' ISPs","No one"],a:0,e:"Data is always the customer's responsibility, even in SaaS."},
 {q:"Which cloud model is owned and run by a third party and offered to anyone who wants to buy services?",o:["Public cloud","Private cloud","Hybrid cloud","Community server"],a:0,e:"Public cloud is shared infrastructure open to all customers."},
 {q:"A government agency must keep complete control of all hardware and use cloud technologies for one organization only. Which model fits?",o:["Private cloud","Public cloud","SaaS","Multi-cloud"],a:0,e:"Private clouds serve a single organization with full control."},
 {q:"A retailer keeps its customer database on-premises but uses Azure for extra web servers during the holidays. Which model is this?",o:["Hybrid cloud","Private cloud","Public cloud only","Multi-cloud"],a:0,e:"Combining on-premises and public cloud is hybrid."},
 {q:"A company uses Azure for analytics and another provider's cloud for email hosting. Which model is this?",o:["Multi-cloud","Private cloud","Hybrid cloud only","On-premises"],a:0,e:"Multiple public cloud providers is multi-cloud."},
 {q:"Which cloud model has NO up-front capital expenditure for hardware?",o:["Public cloud","Private cloud","On-premises datacenter","Hybrid with new on-premises servers"],a:0,e:"The public cloud provider buys the hardware."},
 {q:"Which Azure service helps you manage servers and Kubernetes clusters running on-premises and in other clouds?",o:["Azure Arc","Azure Data Box","Azure Advisor","Azure DNS"],a:0,e:"Azure Arc extends Azure management to hybrid and multi-cloud resources."},
 {q:"Which describes capital expenditure (CapEx)?",o:["Up-front spending on physical infrastructure","Monthly spending on cloud services","Paying per transaction","Spot pricing"],a:0,e:"CapEx is a one-time purchase deducted over time."},
 {q:"Which describes operational expenditure (OpEx)?",o:["Spending on services over time as you use them","Buying a building","Buying servers up front","Paying for a 10-year lease in advance"],a:0,e:"OpEx is ongoing, as-you-go spending."},
 {q:"Moving from your own datacenter to Azure mainly shifts spending from:",o:["CapEx to OpEx","OpEx to CapEx","Variable to fixed","Opex to depreciation"],a:0,e:"Cloud services are operating expenses."},
 {q:"Which is a benefit of the consumption-based model?",o:["You pay only for the resources you use","You pay for peak capacity all year","You must buy three years of hardware","Prices never change"],a:0,e:"No paying for idle capacity."},
 {q:"A workload runs 24 hours a day, every day, on the same VM size for the next 3 years. Which pricing option saves the most?",o:["Reserved instances","Pay-as-you-go","Spot VMs","Free account"],a:0,e:"Reservations reward steady, long-term use with up to 72% savings."},
 {q:"A rendering job can be paused and restarted at any time and must be as cheap as possible. Which pricing option fits?",o:["Spot VMs","Reserved instances","Pay-as-you-go","Dedicated hosts"],a:0,e:"Spot VMs are cheapest but can be evicted, so they suit interruptible work."},
 {q:"What is the main risk of using Azure spot VMs?",o:["Azure can evict them when it needs the capacity","They can't run Linux","They cost more than pay-as-you-go","They require a 3-year contract"],a:0,e:"Spot capacity can be reclaimed at short notice."},
 {q:"A team launches a brand-new app with unknown traffic. Which pricing model should they start with?",o:["Pay-as-you-go","3-year reserved instance","Spot only","Prepaid hardware"],a:0,e:"No commitment while usage is unpredictable."},
 {q:"A company wants to commit to a fixed hourly compute spend but keep flexibility to change VM sizes and regions. Which option fits?",o:["Azure savings plan for compute","Reserved instances for one size","Spot VMs","Azure Hybrid Benefit"],a:0,e:"Savings plans apply across sizes and regions."},
 {q:"A company has existing Windows Server licenses with Software Assurance. Which benefit lowers their Azure VM costs?",o:["Azure Hybrid Benefit","Spot pricing for Windows","Free tier","Azure Advisor"],a:0,e:"Hybrid Benefit lets you reuse eligible licenses."},
 {q:"Which BEST describes serverless computing?",o:["The provider manages servers; code runs on events and you pay per execution","You rent physical servers and pay only for the hours they are powered on","You install your own hypervisor","Software you buy on a disc"],a:0,e:"No server management, event-driven, pay per use."},
 {q:"Which Azure service lets developers run small pieces of code in response to events without managing servers?",o:["Azure Functions","Azure Virtual Machines","Azure Virtual Desktop","Azure Data Box"],a:0,e:"Functions is Azure's serverless compute."},
 {q:"What happens to a serverless function app's cost when no events arrive (on a consumption plan)?",o:["It scales to zero and you pay little or nothing","You pay for one VM all the time, even when it's idle","You pay for peak capacity","It is deleted"],a:0,e:"Serverless scales to zero when idle."},
 {q:"Which Azure service builds serverless, low-code workflows that connect apps like Outlook and Salesforce?",o:["Azure Logic Apps","Azure Monitor","Azure Policy","AzCopy"],a:0,e:"Logic Apps is serverless workflow automation."},
 {q:"An SLA guarantees 99.9% uptime. About how much downtime is allowed each month?",o:["About 43 minutes","About 4 minutes","About 7 hours","About 26 seconds"],a:0,e:"0.1% of a 730-hour month is about 43.8 minutes."},
 {q:"An SLA guarantees 99.99% uptime. About how much downtime is allowed each month?",o:["About 4 minutes","About 43 minutes","About 7 hours","None"],a:0,e:"0.01% of a month is about 4.4 minutes."},
 {q:"A web app (99.95% SLA) depends on a database (99.99% SLA). What is the composite SLA?",o:["About 99.94%","About 99.99%","99.95%","100%"],a:0,e:"Multiply dependent SLAs: 0.9995 × 0.9999 ≈ 0.9994."},
 {q:"What does an Azure SLA describe?",o:["Microsoft's commitments for uptime and connectivity","The price of each service and how discounts are applied","The number of datacenters","Your company's security policy"],a:0,e:"SLAs set availability commitments, with service credits if they're missed."},
 {q:"Adding more RAM and CPUs to an existing VM is an example of:",o:["Vertical scaling","Horizontal scaling","Elasticity only","Geo-replication"],a:0,e:"Scaling up a single resource is vertical."},
 {q:"Adding more VMs behind a load balancer during peak traffic is an example of:",o:["Horizontal scaling","Vertical scaling","Reserved capacity","Lift-and-shift"],a:0,e:"Scaling out by adding instances is horizontal."},
 {q:"Which term describes a system that automatically adds and removes resources as demand changes?",o:["Elasticity","Durability","Predictability","Fault tolerance"],a:0,e:"Elastic systems scale automatically."},
 {q:"Which cloud benefit is the ability to recover from failures and keep functioning?",o:["Reliability","Manageability","Governance","Elasticity"],a:0,e:"Reliability is about recovering and continuing to work."},
 {q:"Which tools help with cost predictability?",o:["Pricing calculator and TCO calculator","Azure DNS and VPN Gateway","AzCopy and Storage Explorer","Defender for Cloud and Entra ID"],a:0,e:"They forecast and compare costs before you deploy."},
 {q:"Autoscaling and load balancing mainly support which benefit?",o:["Performance predictability","Cost governance and budgets","Data sovereignty","Identity security"],a:0,e:"They keep performance consistent under changing load."},
 {q:"Using templates and policies to make sure every deployment meets company standards is an example of:",o:["Governance","Elasticity","Serverless","Spot pricing"],a:0,e:"Governance keeps resources compliant."},
 {q:"Managing your Azure resources from a web portal, CLI or APIs is called:",o:["Management in the cloud","Management of the cloud","Lift-and-shift","Cloud bursting"],a:0,e:"\"In the cloud\" is how you manage; \"of the cloud\" is what's managed, like autoscale and monitoring."},
 {q:"Which is an example of \"management of the cloud\"?",o:["Automatically replacing a failing resource","Opening the Azure portal in a browser","Typing an Azure CLI command","Calling a REST API"],a:0,e:"Management of the cloud covers scaling, deploying from templates, monitoring and self-healing."},
 {q:"A company wants to move 200 on-premises servers to Azure quickly without changing them. Which service type fits?",o:["IaaS","SaaS","PaaS only","Serverless"],a:0,e:"Lift-and-shift to Azure VMs is IaaS."},
 {q:"Developers want to deploy a web app without managing the operating system or web server. Which service type fits?",o:["PaaS","IaaS","SaaS","On-premises"],a:0,e:"PaaS handles the platform so developers focus on code."},
 {q:"A company wants employees to use email and office apps without installing or maintaining any servers. Which service type fits?",o:["SaaS","IaaS","PaaS","Private cloud"],a:0,e:"Microsoft 365 is SaaS."},
 {q:"Which is an example of IaaS in Azure?",o:["Azure Virtual Machines","Microsoft 365","Azure App Service","Outlook.com"],a:0,e:"VMs give you infrastructure you manage."},
 {q:"Which is an example of PaaS in Azure?",o:["Azure SQL Database","Azure Virtual Machines","Microsoft Teams","A physical server"],a:0,e:"Azure SQL Database is a managed database platform."},
 {q:"Which service type is BEST for analytics and business intelligence workloads where you don't want to manage infrastructure?",o:["PaaS","IaaS","On-premises","Colocation"],a:0,e:"PaaS provides managed data and analytics platforms."},
 {q:"Which service type is the MOST flexible, giving you the most control?",o:["IaaS","PaaS","SaaS","Serverless"],a:0,e:"IaaS lets you configure the OS and everything above it."},
 {q:"In PaaS, which layer is a shared responsibility between the customer and Microsoft?",o:["Applications","Physical hosts","Information and data","Physical datacenter"],a:0,e:"In PaaS, applications, network controls and identity infrastructure are shared."},
 {q:"A company keeps patient records on-premises for regulatory reasons, but runs its public website in Azure. What is a benefit of this hybrid approach?",o:["It meets compliance needs while using cloud scale where allowed","It removes all capital expenditure forever, for every workload","It means Microsoft owns the patient data","It eliminates the need for security"],a:0,e:"Hybrid lets you choose where each workload runs."},
 {q:"Which statement about the public cloud is TRUE?",o:["You don't control the physical hardware","You must buy servers up front","Only one organization can use it","It can't scale quickly"],a:0,e:"The provider owns and controls the hardware."},
 {q:"What is cloud bursting?",o:["Using the public cloud for extra capacity when on-premises resources are maxed out","A DDoS attack that floods cloud services with traffic until resources are exhausted","Deleting cloud resources","A type of storage tier"],a:0,e:"A common hybrid scenario."},
 {q:"Which pricing approach would you avoid for a production database that must never be interrupted?",o:["Spot VMs","Pay-as-you-go","Reserved instances","Savings plan"],a:0,e:"Spot VMs can be evicted at any time."},
 {q:"A company deploys VMs in two availability zones so the app keeps running if one zone fails. Which benefit does this provide?",o:["High availability","Lower CapEx","Serverless billing","Data classification"],a:0,e:"Redundancy across zones keeps services available."},
 {q:"Which BEST describes the difference between scalability and elasticity?",o:["Scalability is the ability to grow; elasticity is doing it automatically as demand changes","They are unrelated; scalability is about cost and elasticity is about uptime guarantees","Elasticity only applies to storage","Scalability means lowering costs"],a:0,e:"Elasticity is automatic scalability."},
 {q:"Which statement about the consumption-based model is TRUE?",o:["Costs rise and fall with usage","You pay a fixed amount no matter how much you use","You must forecast five years ahead","You pay for unused capacity"],a:0,e:"Usage drives the bill."},
 {q:"Which is a characteristic of a private cloud?",o:["The organization is responsible for buying and maintaining the hardware","No capital expenditure, because the provider buys and maintains all hardware","Resources are shared with other companies","Microsoft manages your on-premises hardware"],a:0,e:"Control comes with cost and maintenance."},
 {q:"A company needs to run a legacy app that requires a specific OS configuration and custom drivers. Which service type?",o:["IaaS","SaaS","PaaS","Serverless"],a:0,e:"Only IaaS gives control of the OS."}
];

/* ---------- custom diagrams ---------- */
function vizOnprem(){
  const el=$("#viz-onprem");const seen=new Set();
  const ROWS=[["Buy servers and storage","Order, wait weeks, pay up front","Create in minutes, no purchase"],["Power, cooling and building","You pay and maintain","Included in the price"],["Physical security","Guards, cameras and badges are yours","Microsoft secures the datacenter"],["Replace failed hardware","You keep spares and swap disks","Provider swaps it; your VM moves"],["Scale for a sales spike","Buy for the peak, idle the rest of the year","Add capacity for the spike, remove it after"],["How you pay","Capital expense, depreciated over years","Operating expense, billed per use"],["Your data and configuration","Your responsibility","Still your responsibility"]];
  let mode="on";
  function draw(){seen.add(mode);
    el.innerHTML=`<div class="viz-title">Your own datacenter vs the cloud</div>
    <div class="seg-row"><button class="chip" data-m="on" aria-pressed="${mode==="on"}">Own datacenter</button><button class="chip" data-m="cl" aria-pressed="${mode==="cl"}">Azure</button></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Task</th><th class="cur">${mode==="on"?"Your own datacenter":"In Azure"}</th></tr>${ROWS.map((r,i)=>`<tr><td>${r[0]}</td><td class="${i===6?"c-cust":mode==="on"?"c-cust":"c-ms"}">${mode==="on"?r[1]:r[2]}</td></tr>`).join("")}</table></div>
    <div class="legend-row"><span><i class="sw c-cust"></i>Your company</span><span><i class="sw c-ms"></i>Cloud provider</span></div>
    <div class="caption" aria-live="polite">${mode==="on"?"In your own datacenter, everything from the building to the data is your job.":"In Azure, the provider takes the physical work. Notice the last row: your data never stops being yours."}</div>`;
    if(seen.size===2)award("viz:onprem",20,"Compared on-premises and cloud")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){mode=b.dataset.m;draw()}});draw();
}
function vizShared(){
  const el=$("#viz-shared");const seen=new Set();
  const L=["Information and data","Devices (mobile and PCs)","Accounts and identities","Identity and directory infrastructure","Applications","Network controls","Operating system","Physical hosts","Physical network","Physical datacenter"];
  /* C customer, S shared, M Microsoft */
  const M={on:"CCCCCCCCCC",iaas:"CCCCCCCMMM",paas:"CCCSSSMMMM",saas:"CCCSMMMMMM"};
  const N={on:"On-premises",iaas:"IaaS",paas:"PaaS",saas:"SaaS"};
  const cls={C:"c-cust",S:"c-sh",M:"c-ms"},lab={C:"Customer",S:"Shared",M:"Microsoft"};
  const NOTE={on:"On-premises, you own every layer, down to the building.",iaas:"With IaaS (Azure VMs), Microsoft takes the physical layers. You still patch the OS, configure firewalls and run the apps.",paas:"With PaaS (App Service, Azure SQL), Microsoft also runs the OS. Apps, network controls and identity infrastructure become shared.",saas:"With SaaS (Microsoft 365), Microsoft runs the app too. You keep the top three rows, as you always do."};
  let cur="iaas";
  function draw(){seen.add(cur);const counts={C:0,S:0,M:0};[...M[cur]].forEach(c=>counts[c]++);
    el.innerHTML=`<div class="viz-title">Who manages each layer?</div>
    <div class="seg-row">${Object.keys(N).map(k=>`<button class="chip" data-k="${k}" aria-pressed="${k===cur}">${N[k]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl">${L.map((l,i)=>`<tr><td>${l}</td><td class="${cls[M[cur][i]]}" style="width:38%">${lab[M[cur][i]]}</td></tr>`).join("")}</table></div>
    <div class="legend-row"><span><i class="sw c-cust"></i>Customer ${counts.C}</span><span><i class="sw c-sh"></i>Shared ${counts.S}</span><span><i class="sw c-ms"></i>Microsoft ${counts.M}</span></div>
    <div class="caption" aria-live="polite">${NOTE[cur]}</div><div class="rv-prog s-small">${seen.size} of 4 models viewed</div>`;
    if(seen.size===4)award("viz:shared",30,"Explored the shared responsibility model")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b){cur=b.dataset.k;draw()}});draw();
}
function vizCapex(){
  const el=$("#viz-capex");const seen=new Set();
  const PAT={steady:[60,62,61,63,60,62,61,63,62,60,61,62],seasonal:[35,35,38,40,40,42,45,50,60,80,100,95],spiky:[30,32,95,30,28,90,33,30,31,100,29,30],growth:[15,20,25,32,38,45,52,60,68,75,85,95]};
  const PN={steady:"Steady",seasonal:"Seasonal (holiday peak)",spiky:"Spiky (campaigns)",growth:"Fast growth"};
  let p="seasonal";
  function draw(){seen.add(p);const d=PAT[p],peak=Math.max(...d),own=peak,W=560,H=200,x=i=>40+i*(W-60)/11,y=v=>H-24-v*1.5;
    const ownCost=own*12,cloudCost=d.reduce((a,b)=>a+b,0)*1.15,waste=Math.round((own*12-d.reduce((a,b)=>a+b,0))/(own*12)*100);
    const pts=d.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
    el.innerHTML=`<div class="viz-title">CapEx vs OpEx: buy for the peak, or pay for what you use?</div>
    <div class="seg-row">${Object.keys(PAT).map(k=>`<button class="chip" data-p="${k}" aria-pressed="${k===p}">${PN[k]}</button>`).join("")}</div>
    <div class="viz-scroll"><svg viewBox="0 0 ${W} ${H}" style="min-width:420px" role="img" aria-label="Demand over 12 months compared with owned capacity">
      <line x1="40" y1="${H-24}" x2="${W-20}" y2="${H-24}" class="ax-l"/>
      <polygon class="ar-w" points="${x(0)},${y(own)} ${x(11)},${y(own)} ${[...d].reverse().map((v,i)=>`${x(11-i)},${y(v)}`).join(" ")}"/>
      <polygon class="ar-a" points="${x(0)},${y(0)} ${pts} ${x(11)},${y(0)}"/>
      <polyline class="ln-a" points="${pts}"/>
      <line x1="${x(0)}" y1="${y(own)}" x2="${x(11)}" y2="${y(own)}" class="ln-b"/>
      <text x="${x(0)}" y="${y(own)-8}" class="chart-l">Owned capacity (bought for the peak)</text>
      ${"JFMAMJJASOND".split("").map((m,i)=>`<text x="${x(i)}" y="${H-6}" text-anchor="middle" class="chart-l">${m}</text>`).join("")}
    </svg></div>
    <div class="legend-row"><span><i class="sw c-ms"></i>Actual demand (what the cloud bills)</span><span><i class="sw c-sh"></i>Owned capacity</span><span><i class="sw" style="background:var(--bad)"></i>Paid for but idle</span></div>
    <div class="kv"><span>Own hardware (CapEx)</span><b class="mono">${fmt(Math.round(ownCost))} units / year · ${waste}% idle</b><span>Cloud (OpEx)</span><b class="mono">${fmt(Math.round(cloudCost))} units / year</b></div>
    <div class="caption" aria-live="polite">${p==="steady"?"With steady demand, owning hardware wastes little. The cloud still removes the up-front purchase, and reservations can cut the price further.":p==="growth"?"With fast growth you'd have to guess the peak a year ahead. In the cloud you add capacity month by month.":`With ${PN[p].toLowerCase()} demand, owned hardware sits idle most of the year. The consumption model bills only the blue area.`}</div><div class="rv-prog s-small">${seen.size} of 4 patterns tried</div>`;
    if(seen.size===4)award("viz:capex",30,"Compared CapEx and OpEx")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b){p=b.dataset.p;draw()}});draw();
}
function vizPrice(){
  const el=$("#viz-pricecalc");const seen=new Set();const RATE=0.20;
  let hrs=24,intr=false;
  el.innerHTML=`<div class="viz-title">Pricing model calculator</div><div class="s-small">ILLUSTRATIVE VM AT $0.20 AN HOUR · 730 HOURS IN A MONTH</div>
    <div class="rng-row"><span>Hours used per day</span><input type="range" min="1" max="24" value="${hrs}" data-k="hrs" aria-label="Hours used per day"><b data-o="hrs"></b></div>
    <label class="check"><input type="checkbox" data-k="intr"> The work can be interrupted and restarted</label><div class="out"></div>`;
  function draw(){const h=hrs*730/24;$('[data-o="hrs"]',el).textContent=hrs+" h";
    const opts=[["Pay-as-you-go",RATE*h,"No commitment"],["1-year reservation",RATE*0.6*730,"Billed for every hour, used or not"],["3-year reservation",RATE*0.38*730,"Billed for every hour, used or not"],["Spot VM",intr?RATE*0.15*h:null,intr?"Can be evicted at any time":"Not an option: this workload can't be interrupted"]];
    const valid=opts.filter(o=>o[1]!==null),best=valid.reduce((a,b)=>b[1]<a[1]?b:a);
    if(best[0]==="Pay-as-you-go")seen.add("payg");if(best[0].includes("reservation"))seen.add("res");if(best[0]==="Spot VM")seen.add("spot");
    $(".out",el).innerHTML=`<div class="tbl-wrap"><table class="tbl"><tr><th>Option</th><th class="num">Per month</th><th>Note</th></tr>${opts.map(o=>`<tr><td>${o[0]}</td><td class="num ${o===best?"ok":o[1]===null?"dim":""}">${o[1]===null?"—":"$"+o[1].toFixed(2)}</td><td class="${o[1]===null?"dim":""}">${o[2]}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite"><b>Cheapest: ${best[0]}.</b> ${best[0]==="Pay-as-you-go"?"Used only a few hours a day, paying per hour beats a reservation you'd pay for around the clock.":best[0]==="Spot VM"?"Interruptible work can use spare capacity at a deep discount.":"Running most of the day, a commitment pays off."}</div>
    <div class="rv-prog s-small">Find a case where each wins: pay-as-you-go ${seen.has("payg")?"✓":"·"} · reservation ${seen.has("res")?"✓":"·"} · spot ${seen.has("spot")?"✓":"·"}</div>`;
    if(seen.size===3)award("viz:pricecalc",30,"Found when each pricing model wins")}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="hrs"){hrs=+e.target.value;draw()}});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="intr"){intr=e.target.checked;draw()}});draw();
}
function vizServerless(){
  const el=$("#viz-serverless");const seen=new Set();let ev=40;
  el.innerHTML=`<div class="viz-title">Serverless scaling: drag the event rate</div><div class="s-small">AZURE FUNCTIONS · CONSUMPTION PLAN · ORDERS ARRIVING PER SECOND</div>
    <div class="rng-row"><span>Events per second</span><input type="range" min="0" max="100" step="5" value="${ev}" data-k="ev" aria-label="Events per second"><b data-o="ev"></b></div><div class="out"></div>`;
  function draw(){const inst=ev===0?0:Math.ceil(ev/20);if(ev===0)seen.add("zero");if(ev>=80)seen.add("peak");if(ev>0&&ev<80)seen.add("mid");
    $('[data-o="ev"]',el).textContent=ev+"/s";
    $(".out",el).innerHTML=`<div class="inst-row">${inst?Array.from({length:inst},(_,i)=>`<span class="inst">ƒ${i+1}</span>`).join(""):'<span class="s-small">0 instances running</span>'}</div>
    <div class="kv"><span>Instances</span><b class="mono">${inst}</b><span>Billed for</span><b class="mono">${ev?fmt(ev*3600)+" executions an hour":"nothing while idle"}</b><span>Servers you manage</span><b class="mono">0</b></div>
    <div class="caption" aria-live="polite">${ev===0?"No events, no instances, no compute charge. That's <b>scale to zero</b>.":ev>=80?"A traffic burst. The platform added instances on its own; you didn't configure any servers.":"Each event triggers your function. The platform adds or removes instances as the rate changes."}</div>`;
    if(seen.size===3)award("viz:serverless",20,"Scaled a serverless app")}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="ev"){ev=+e.target.value;draw()}});draw();
}
function vizSla(){
  const el=$("#viz-sla");const seen=new Set();
  const SL=[99,99.9,99.95,99.99,99.999];let a=99.95,b=99.99,mode="single";
  const down=p=>{const m=(1-p/100)*43800/60*60;/* minutes per month (730 h) */return m};
  const fm=m=>m>=60?(m/60).toFixed(1)+" hours":m>=1?m.toFixed(1)+" minutes":(m*60).toFixed(0)+" seconds";
  function draw(){let comp=a,txt="";
    if(mode==="chain"){comp=a*b/100;txt=`App Service (${a}%) <b>and</b> its database (${b}%) must both be up: ${a}% × ${b}% = <b>${comp.toFixed(3)}%</b>. Chaining services lowers the combined SLA.`}
    else if(mode==="pair"){comp=100-(100-a)*(100-a)/100;txt=`Two independent copies in different regions: the app is down only if both fail. 1 − (${(100-a).toFixed(3)}%)² = <b>${comp.toFixed(5)}%</b>. Redundancy raises availability.`}
    else txt=`A single service with a ${a}% SLA.`;seen.add(mode);
    el.innerHTML=`<div class="viz-title">SLA and downtime calculator</div>
    <div class="sel-row"><span>Service SLA</span><div class="seg-row">${SL.map(s=>`<button class="chip" data-a="${s}" aria-pressed="${s===a}">${s}%</button>`).join("")}</div></div>
    <div class="sel-row"><span>Architecture</span><div class="seg-row"><button class="chip" data-m="single" aria-pressed="${mode==="single"}">One service</button><button class="chip" data-m="chain" aria-pressed="${mode==="chain"}">App + database (composite)</button><button class="chip" data-m="pair" aria-pressed="${mode==="pair"}">Two regions (redundant)</button></div></div>
    <div class="kv"><span>Combined SLA</span><b class="mono">${comp.toFixed(mode==="pair"?5:3)}%</b><span>Allowed downtime</span><b class="mono">${fm(down(comp))} a month · ${fm(down(comp)*12)} a year</b></div>
    <div class="meter" aria-hidden="true"><i style="width:${Math.min(100,down(comp)/440*100)}%"></i></div>
    <div class="caption" aria-live="polite">${txt}</div>`;
    if(seen.size===3)award("viz:sla",30,"Calculated composite SLAs")}
  el.addEventListener("click",e=>{const x=e.target.closest("[data-a]"),m=e.target.closest("[data-m]");if(x){a=+x.dataset.a;draw()}if(m){mode=m.dataset.m;draw()}});draw();
}
function vizScale(){
  const el=$("#viz-scale");const seen=new Set();let n=2,big=false,load=40;
  el.innerHTML=`<div class="viz-title">Scale up or scale out?</div>
    <div class="rng-row"><span>Traffic</span><input type="range" min="10" max="240" step="10" value="${load}" data-k="load" aria-label="Traffic"><b data-o="load"></b></div>
    <div class="out"></div>
    <div class="viz-controls"><button class="btn" data-a="up">Scale up (bigger VMs)</button><button class="btn" data-a="down">Scale down</button><button class="btn" data-a="out">Scale out (+1 VM)</button><button class="btn" data-a="in">Scale in (−1 VM)</button></div>
    <div class="caption" aria-live="polite"></div>`;
  function draw(){const cap=n*(big?60:30),ok=cap>=load;$('[data-o="load"]',el).textContent=load;
    $(".out",el).innerHTML=`<div class="inst-row">${Array.from({length:n},()=>`<span class="inst${big?" big":""}">${big?"D8":"D4"}</span>`).join("")}</div><div class="kv"><span>Capacity</span><b class="mono ${ok?"status-good":"status-bad"}">${cap} of ${load} needed</b></div>`;
    $('[data-a="up"]',el).disabled=big;$('[data-a="down"]',el).disabled=!big;$('[data-a="out"]',el).disabled=n>=6;$('[data-a="in"]',el).disabled=n<=1;
    $(".caption",el).innerHTML=`${ok?"Enough capacity. ":"<span class=\"status-bad\">Overloaded:</span> users see slow pages. "}Scaling up is <b>vertical</b> (a bigger VM, often needs a restart). Scaling out is <b>horizontal</b> (more VMs behind a load balancer, which also adds redundancy).`}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="load"){load=+e.target.value;draw()}});
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;if(a==="up")big=true;if(a==="down")big=false;if(a==="out")n++;if(a==="in")n--;seen.add(a);draw();
    if(seen.has("up")&&seen.has("out")&&(seen.has("in")||seen.has("down")))award("viz:scale",20,"Scaled vertically and horizontally")});draw();
}

registerModule({
  id:"cld",slug:"cloud",title:"Cloud Concepts",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["onprem","shared","srq","models","modelcmp","capex","cxsort","pricecalc","pickprice","serverless","sla","scale","benefits","svc","svccmp"],
  viz(){
vizOnprem();vizShared();
quizViz($("#viz-srq"),{title:"Who's responsible?",done:"Answered every responsibility scenario",qs:[
  ["A Linux VM in Azure needs a kernel security patch.",["The customer","Microsoft","Shared"],0,"VMs are IaaS: the guest OS is yours."],
  ["A hard drive fails in an Azure datacenter rack.",["Microsoft","The customer","Shared"],0,"Physical hosts are always the provider's job."],
  ["Someone in your company shares a confidential file publicly from OneDrive.",["The customer","Microsoft","Shared"],0,"Information and data are always yours, even in SaaS."],
  ["The OS under Azure App Service needs an update.",["Microsoft","The customer","Shared"],0,"In PaaS, Microsoft manages the OS."],
  ["An employee's account in Microsoft 365 has a weak password and no MFA.",["The customer","Microsoft","Shared"],0,"Accounts and identities are always yours."],
  ["Flood barriers and backup generators for the datacenter.",["Microsoft","The customer","Shared"],0,"The physical datacenter is always the provider's."]]});
sortViz($("#viz-models"),{title:"Which cloud model fits?",bins:{pub:"Public cloud",priv:"Private cloud",hyb:"Hybrid cloud",multi:"Multi-cloud"},
  items:[["A startup wants to launch fast with no hardware purchases","pub","No CapEx and fast scale."],["A bank must keep full control of hardware used by its own staff only","priv","Single organization, full control."],["Keep the mainframe on-premises, run the new mobile backend in Azure","hyb","On-premises and public, connected."],["Use Azure for AI and another provider for an existing data warehouse","multi","More than one public provider."],["Add Azure capacity when the on-premises datacenter is full at peak","hyb","Cloud bursting is hybrid."],["A website open to the internet with unpredictable traffic","pub","Public cloud scales on demand."],["A defense contractor runs cloud technology in its own secured facility","priv","A private cloud."],["Manage on-premises servers and other clouds together with Azure Arc","multi","Arc helps manage multi-cloud and hybrid estates."]],done:"Matched every cloud model"});
revealViz($("#viz-modelcmp"),{title:"Cloud models compared",cols:4,done:"Compared every cloud model",items:[
  ["Public","No CapEx","Pay as you go, scale fast, but you don't control the hardware.","def"],["Private","Full control","You buy and maintain hardware. One organization uses it.","vio"],["Hybrid","Most flexible","Run each workload where it fits best. Connect on-premises and cloud.","def"],["Multi-cloud","Several providers","Pick features from different providers, or migrate between them. More to manage.","vio"],
  ["Azure Arc","Hybrid management","Manage servers, Kubernetes and SQL Server anywhere from the Azure portal, with Azure Policy and RBAC.","def"],["Azure VMware Solution","Hybrid migration","Run your existing VMware workloads in Azure without converting them.","vio"],["Cloud bursting","Hybrid pattern","Overflow to the public cloud when on-premises capacity runs out.","def"],["Data residency","Common driver","Some data must stay in a location you control, which pushes it to private or hybrid.","atk"]]});
vizCapex();
sortViz($("#viz-cxsort"),{title:"CapEx or OpEx?",bins:{cap:"CapEx (up front)",op:"OpEx (as you go)"},
  items:[["Buying 20 rack servers","cap","A one-time hardware purchase."],["Monthly Azure bill for VMs","op","Billed for use over time."],["Building a new server room","cap","Physical infrastructure, depreciated over years."],["Microsoft 365 per-user subscription","op","A service you pay for monthly."],["Buying a backup generator","cap","Physical equipment bought up front."],["Pay-per-execution Azure Functions charges","op","Pure consumption-based spend."],["Storage billed per GB each month","op","Pay for what you store."],["Purchasing network switches","cap","Hardware you own."]],done:"Sorted every expense"});
vizPrice();
quizViz($("#viz-pickprice"),{title:"Pick the pricing model",done:"Chose the right pricing model every time",qs:[
  ["A database server runs 24/7 and will for the next three years.",["Reserved instance","Spot VM","Pay-as-you-go"],0,"Steady, long-term use is what reservations reward."],
  ["Nightly video rendering that can restart if a VM disappears.",["Spot VM","Reserved instance","Pay-as-you-go"],0,"Interruptible and cost-sensitive: spot."],
  ["A two-week proof of concept with unknown usage.",["Pay-as-you-go","3-year reservation","Spot VM"],0,"No commitment for short or unpredictable work."],
  ["A company commits to a steady compute budget but often changes VM sizes and regions.",["Azure savings plan for compute","Reserved instance","Spot VM"],0,"Savings plans apply flexibly across sizes and regions."],
  ["A company moves Windows Server VMs to Azure and already owns licenses with Software Assurance.",["Azure Hybrid Benefit","Spot pricing","Free tier"],0,"Reuse those licenses to lower the VM price."]]});
vizServerless();vizSla();vizScale();
sortViz($("#viz-benefits"),{title:"Which cloud benefit is it?",bins:{ha:"High availability and scalability",rel:"Reliability and predictability",sec:"Security and governance",mgmt:"Manageability"},
  items:[["The app keeps running when one datacenter fails","ha","Built-in redundancy keeps it available."],["Add VMs automatically during a sale","ha","Scaling to meet demand."],["Recover from a regional failure by failing over","rel","Reliability is recovering and continuing."],["Forecast next quarter's bill with the pricing calculator","rel","Cost predictability."],["Policies stop anyone creating resources outside approved regions","sec","Governance through policy."],["The provider patches the OS in PaaS","sec","Security handled by the provider."],["Deploy 50 identical environments from one template","mgmt","Management of the cloud."],["Manage resources from the portal, CLI or REST API","mgmt","Management in the cloud."]],done:"Matched every cloud benefit"});
sortViz($("#viz-svc"),{title:"IaaS, PaaS or SaaS?",bins:{iaas:"IaaS",paas:"PaaS",saas:"SaaS"},
  items:[["Azure Virtual Machines","iaas","You manage the OS."],["Lift-and-shift 50 servers unchanged","iaas","Move VMs as they are."],["Azure App Service web app","paas","Deploy code; Microsoft runs the platform."],["Azure SQL Database","paas","A managed database platform."],["Azure Functions","paas","Serverless is a form of PaaS."],["Microsoft 365 email","saas","A finished application."],["An expense-tracking app you sign in to and use","saas","Rent the software."],["A dev/test server where you install custom tools","iaas","Full control of the machine."],["An analytics platform for data scientists","paas","Managed analytics tools."]],done:"Sorted every service type"});
revealViz($("#viz-svccmp"),{title:"Service types side by side",cols:3,done:"Compared every service type",items:[
  ["IaaS","Most control","You manage the OS, runtime, apps and data. Microsoft runs the hardware. Example: Azure VMs.","vio"],["PaaS","Balanced","Microsoft runs the hardware and OS. You bring the app and data. Example: App Service.","def"],["SaaS","Least management","Microsoft runs the whole app. You manage users, devices and data. Example: Microsoft 365.","def"],
  ["IaaS use cases","When to pick it","Lift-and-shift migrations, testing and development, apps needing OS control.","vio"],["PaaS use cases","When to pick it","Development frameworks, analytics and business intelligence.","def"],["SaaS use cases","When to pick it","Email and messaging, business productivity, finance and expense tracking.","def"]]});
  },
  sims:[
    {id:"respsim",type:"choice",title:"Draw the responsibility line",
      scenario:"Contoso is moving three systems to the cloud: a legacy app to Azure VMs, a new website to App Service, and email to Microsoft 365. Decide who handles each task.",
      steps:[
        ["The legacy app's Windows Server VM needs monthly patches. Who installs them?",["Contoso","Microsoft","The VM vendor"],0,"IaaS: the guest OS is Contoso's job."],
        ["The App Service website needs the underlying web server OS patched.",["Microsoft","Contoso","Shared"],0,"PaaS: Microsoft runs the OS."],
        ["Who decides which employees can sign in to Microsoft 365?",["Contoso","Microsoft","Shared"],0,"Accounts and identities are always the customer's."],
        ["A storage controller in the Azure datacenter fails.",["Microsoft","Contoso","Shared"],0,"Physical hosts are always the provider's."],
        ["Who configures the network security rules for the VM?",["Contoso","Microsoft","Shared"],0,"In IaaS, network controls are the customer's."],
        ["Under the App Service plan, who is responsible for the application code's security?",["Shared, with Contoso owning its code","Microsoft only","Nobody"],0,"In PaaS, applications are shared: Microsoft secures the platform, Contoso secures its code."]],
      success:"Contoso knows exactly which tasks it still owns in each service type."},
    {id:"opexsim",type:"check",title:"Find the operating expenses",
      scenario:"The finance team is moving to the cloud and wants to classify next year's costs. Select every item that is an operating expense (OpEx).",
      opts:[["Monthly Azure VM charges",1],["Per-user Microsoft 365 subscriptions",1],["Azure Storage billed per GB used",1],["Azure Functions billed per execution",1],["Bandwidth charges for data leaving Azure",1],["Buying a new rack of servers for the office",0],["Building a backup datacenter",0],["Purchasing a 5-year supply of network switches",0]],
      success:"Cloud services are OpEx: billed over time, for what you use."},
    {id:"modelsim",type:"match",title:"Choose a cloud model for each client",
      scenario:"You're a cloud consultant. Match each client to the cloud model that fits best.",
      items:[["Public cloud","pub"],["Private cloud","priv"],["Hybrid cloud","hyb"],["Multi-cloud","multi"]],
      slots:[["pub","Startup","Wants to launch next week with no hardware and pay only for usage"],["priv","Defense agency","Needs cloud technology for one organization with full control of hardware"],["hyb","Hospital","Keeps patient records on-premises, runs its public portal in Azure"],["multi","Media company","Uses Azure for AI and another provider for an existing analytics stack"]],
      success:"Each client gets the model that matches its control, cost and compliance needs."},
    {id:"svcsim",type:"match",title:"Pick the service type",
      scenario:"Match each request to the service that best fits it.",
      items:[["IaaS: Azure Virtual Machines","iaas"],["PaaS: Azure App Service","paas"],["SaaS: Microsoft 365","saas"],["Serverless: Azure Functions","fn"]],
      slots:[["iaas","Infrastructure team","Move a legacy app that needs a custom OS configuration, unchanged"],["paas","Web developers","Deploy a website without managing servers or the OS"],["saas","Office staff","Get email, chat and documents with nothing to install or maintain"],["fn","Integration team","Resize every uploaded image, paying only when an upload happens"]],
      success:"Control where it's needed, and less management everywhere else."},
    {id:"advise",type:"choice",title:"Advise a growing online store",
      scenario:"An online store is leaving its small server room. Traffic is steady most of the year but triples in November and December.",
      steps:[
        ["The store's web servers need to handle the holiday peak. What should they rely on?",["Autoscale: add instances in November, remove them in January","Buy enough VMs for the peak and keep them all year","Scale up one large VM forever"],0,"Elastic, horizontal scaling matches capacity to demand."],
        ["The order database runs at the same size all year, for at least 3 years. Which pricing?",["Reserved instance","Spot VM","Pay-as-you-go only"],0,"Steady and long-term: reserve it."],
        ["The web app (99.95%) depends on the database (99.99%). What's the composite SLA?",["About 99.94%","99.99%","100%"],0,"Multiply dependent SLAs."],
        ["The nightly sales report can be rerun if interrupted. Cheapest compute?",["Spot VMs","Reserved instances","Dedicated hosts"],0,"Interruptible work fits spot pricing."],
        ["Order confirmation emails should be sent each time an order arrives, with no servers to manage.",["Azure Functions triggered by each order","A VM polling every second","A reserved VM"],0,"Event-driven and serverless."]],
      success:"The store pays for peak capacity only during the peak and saves on everything steady."}
  ],
  badges:[
    ["reader","CC","Cloud Curious","Mark all 9 cloud concepts lessons studied",c=>c.allStudied()],
    ["lab","CL","Concept Lab","Complete all 15 diagrams in this module",c=>c.vizAll()],
    ["shared","SR","Line Drawer","View all four models in the shared responsibility diagram",c=>c.earned("viz:shared")],
    ["capex","OX","OpEx Convert","Try every demand pattern in the CapEx vs OpEx chart",c=>c.earned("viz:capex")],
    ["price","PC","Bargain Hunter","Find when each pricing model wins",c=>c.earned("viz:pricecalc")],
    ["sla","9s","Counting Nines","Try every architecture in the SLA calculator",c=>c.earned("viz:sla")],
    ["fn","ƒ0","Scale to Zero","Scale a serverless app to zero and back",c=>c.earned("viz:serverless")],
    ["respsim","RL","Responsibility Line","Pass the shared responsibility simulation",c=>c.passed("respsim")],
    ["opexsim","FX","Finance Friendly","Pass the OpEx simulation",c=>c.passed("opexsim")],
    ["modelsim","CM","Model Citizen","Pass the cloud model simulation",c=>c.passed("modelsim")],
    ["svcsim","XS","Anything as a Service","Pass the service type simulation",c=>c.passed("svcsim")],
    ["advise","AD","Trusted Advisor","Pass the online store simulation",c=>c.passed("advise")],
    ["perfect","C+","Head in the Cloud","Score 100% on a cloud concepts quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
