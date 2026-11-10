/* ================= Module 3: Azure Management and Governance (AZ-900 Domain 3, 30–35%) ================= */
(function(){
const LESSONS=[
{id:"costs",num:"3.1",title:"Factors that affect cost",html:`
<p>Azure moves your spending from CapEx to OpEx, but the bill still depends on choices you make:</p>
<ul><li><b>Resource type</b>: each service, tier and size has its own price. A storage account's type, access tier and redundancy all change its cost.</li>
<li><b>Consumption</b>: pay-as-you-go bills for what you use. <b>Reservations</b> and savings plans cut the price in exchange for a 1- or 3-year commitment.</li>
<li><b>Maintenance</b>: unused resources still cost money. Deleting a VM can leave its <b>disks, network interface and public IP</b> behind, and they keep billing. Clean them up.</li>
<li><b>Geography</b>: prices vary by <b>region</b>, because power, labor and taxes differ around the world.</li>
<li><b>Network traffic</b>: data coming <b>into</b> Azure (ingress) is generally free. Data going <b>out</b> (egress) and between regions is billed, priced by geographic zone.</li>
<li><b>Subscription type</b>: some subscriptions, such as the free account, include usage allowances.</li>
<li><b>Azure Marketplace</b>: third-party solutions you buy through Azure are billed with your Azure usage.</li></ul>
<div class="tip"><b>Exam tip.</b> A VM <b>stopped from inside the OS</b> is still allocated and still billed for compute. A VM that's <b>Stopped (deallocated)</b> in Azure stops compute billing, but its disks are still billed.</div>
<div class="viz" id="viz-costdrv"></div>
<div class="viz" id="viz-costq"></div>`},
{id:"calc",num:"3.2",title:"The pricing calculator and TCO calculator",html:`
<ul><li><b>Pricing calculator</b>: estimates the cost of <b>provisioning resources in Azure</b>. Pick services, then set the region, tier, size, hours, redundancy and support options to see an estimated monthly cost. It's for estimates only; nothing is created and you aren't charged.</li>
<li><b>TCO (total cost of ownership) calculator</b>: <b>compares</b> the cost of running your <b>on-premises</b> infrastructure with running it in Azure. You enter your servers, databases, storage and networking, adjust assumptions like power and IT labor costs, and get a side-by-side report.</li></ul>
<div class="viz" id="viz-calc"></div>
<div class="viz" id="viz-calcsort"></div>`},
{id:"costmgmt",num:"3.3",title:"Cost Management and tags",html:`
<h3>Microsoft Cost Management</h3>
<p><b>Cost Management</b> lets you check resource costs, set up alerts based on spending, and create budgets.</p>
<ul><li><b>Cost analysis</b>: explore costs by billing cycle, region, resource, service and more, with charts.</li>
<li><b>Cost alerts</b>: <b>budget alerts</b> (when spending hits a threshold you set), <b>credit alerts</b> (when Azure credit commitments are used up) and <b>department spending quota alerts</b> (when a department reaches its quota).</li>
<li><b>Budgets</b>: a spending limit for a scope such as a subscription or resource group. Budgets trigger alerts; they <b>don't stop spending on their own</b>, but an alert can run automation to suspend or change resources.</li></ul>
<div class="viz" id="viz-budget"></div>
<h3>Tags</h3>
<p><b>Tags</b> are <b>name/value pairs</b> of metadata you add to resources, resource groups and subscriptions, such as <code>env = prod</code> or <code>costcenter = 4410</code>. Use them for:</p>
<ul><li><b>Cost management and optimization</b>: group costs by department or project.</li>
<li><b>Resource management</b>: find resources by owner or app.</li>
<li><b>Operations management</b>: group resources by how critical they are.</li>
<li><b>Security</b>: mark resources by data classification.</li>
<li><b>Governance and regulatory compliance</b>: identify resources that must meet rules such as ISO 27001.</li>
<li><b>Workload optimization and automation</b>: find all resources in a workload, or automate tasks on them.</li></ul>
<p>Tags are <b>not inherited</b> from resource groups by default. Use <b>Azure Policy</b> to require tags or copy them down. You can add tags in the portal, PowerShell, the CLI, ARM templates or the REST API.</p>
<div class="viz" id="viz-tags"></div>`},
{id:"purview",num:"3.4",title:"Microsoft Purview",html:`
<p><b>Microsoft Purview</b> is a family of <b>data governance, risk and compliance</b> solutions that gives you a single, unified view of your data, wherever it lives: on-premises, in multiple clouds, and in SaaS apps.</p>
<ul><li><b>Risk and compliance</b>: protect sensitive data across Microsoft 365 (Teams, OneDrive, Exchange), identify data risks, and manage regulatory compliance requirements.</li>
<li><b>Unified data governance</b>: build a <b>data map</b> by scanning sources like Azure SQL Database, Azure Data Lake, Amazon S3, on-premises SQL Server and Power BI. Purview automatically <b>classifies</b> sensitive data, tracks <b>data lineage</b>, and lets people discover trustworthy data in a catalog.</li></ul>
<div class="viz" id="viz-purview"></div>`},
{id:"policy",num:"3.5",title:"Azure Policy",html:`
<p><b>Azure Policy</b> helps you create, assign and manage rules that enforce your organization's standards and assess compliance at scale.</p>
<ul><li>A <b>policy definition</b> is a rule, such as "only allow these VM sizes" or "every resource must have an env tag".</li>
<li>An <b>initiative</b> is a group of related policy definitions assigned together, such as "Enable monitoring in Microsoft Defender for Cloud".</li>
<li>Azure Policy has many <b>built-in definitions</b> for storage, networking, compute and security.</li>
<li>Assign policies at a management group, subscription or resource group. They're <b>inherited</b> by everything below.</li>
<li><b>Effects</b> decide what happens: <b>Deny</b> blocks non-compliant resources from being created or changed; <b>Audit</b> allows them but flags them as non-compliant; other effects can <b>modify</b> or add settings, or deploy missing configurations.</li>
<li>Azure Policy evaluates existing resources too, shows a <b>compliance</b> dashboard, and can <b>remediate</b> many non-compliant resources automatically.</li></ul>
<p>RBAC controls <b>who</b> can do something. Azure Policy controls <b>what</b> can be deployed and how it must be configured.</p>
<div class="viz" id="viz-policy"></div>`},
{id:"locks",num:"3.6",title:"Resource locks",html:`
<p>A <b>resource lock</b> prevents resources from being accidentally deleted or changed. Locks apply to <b>everyone</b>, even users with the Owner role.</p>
<ul><li><b>Delete</b> (shown as CanNotDelete): users can still read and modify the resource, but <b>can't delete</b> it.</li>
<li><b>ReadOnly</b>: users can read the resource, but <b>can't modify or delete</b> it. It's like giving everyone the Reader role for that resource.</li></ul>
<p>Apply locks to a subscription, resource group or individual resource. They're <b>inherited</b>: a lock on a resource group protects everything in it. To change or delete a locked resource, you must <b>remove the lock first</b>, which requires permission to manage locks (such as the Owner or User Access Administrator role).</p>
<div class="viz" id="viz-lock"></div>
<div class="viz" id="viz-govsort"></div>`},
{id:"tools",num:"3.7",title:"The Azure portal, Cloud Shell, Azure CLI and Azure PowerShell",html:`
<ul><li><b>Azure portal</b>: a web-based, unified console. Build, manage and monitor everything from simple web apps to complex deployments, create <b>custom dashboards</b>, and set accessibility options. It's updated continually and needs no downtime for maintenance.</li>
<li><b>Azure Cloud Shell</b>: a browser-based shell you open from the portal. Choose <b>Bash</b> or <b>PowerShell</b>. You're already authenticated with your Azure account, nothing is installed on your computer, and an Azure Files share keeps your files between sessions.</li>
<li><b>Azure CLI</b>: a command-line tool with commands that start with <code>az</code>, using Bash-style syntax. Runs on Windows, macOS and Linux, and in Cloud Shell.</li>
<li><b>Azure PowerShell</b>: a set of <b>cmdlets</b> (the Az module) with verb-noun names such as <code>New-AzVM</code>. Runs on Windows, macOS and Linux, and in Cloud Shell.</li></ul>
<p>The CLI and PowerShell can do the same tasks; pick the syntax you prefer. Both are great for <b>scripting</b> repeatable tasks so they're done the same way every time.</p>
<div class="viz" id="viz-shell"></div>
<div class="viz" id="viz-clisort"></div>`},
{id:"arc",num:"3.8",title:"Azure Arc",html:`
<p><b>Azure Arc</b> extends Azure management to resources <b>outside Azure</b>: on-premises, in other clouds, and at the edge. Connected resources show up in the Azure portal as if they were Azure resources, so you manage everything from one place.</p>
<p>With Arc you can manage:</p>
<ul><li><b>Servers</b> (Windows and Linux, physical or virtual)</li>
<li><b>Kubernetes clusters</b></li>
<li><b>Azure data services</b>, such as SQL Managed Instance and PostgreSQL</li>
<li><b>SQL Server</b> instances</li>
<li><b>Virtual machines</b> in VMware vSphere or System Center Virtual Machine Manager</li></ul>
<p>Once connected, you can apply <b>Azure Policy</b>, <b>RBAC</b>, <b>tags</b>, <b>Azure Monitor</b> and <b>Microsoft Defender for Cloud</b> to them, just like native Azure resources.</p>
<div class="viz" id="viz-arc"></div>`},
{id:"arm",num:"3.9",title:"Infrastructure as code, ARM and ARM templates",html:`
<h3>Infrastructure as code</h3>
<p><b>Infrastructure as code (IaC)</b> means managing infrastructure with code files instead of clicking through a portal. The files can be versioned, reviewed and reused, so every environment is built the same way.</p>
<h3>Azure Resource Manager (ARM)</h3>
<p><b>Azure Resource Manager</b> is the deployment and management service for Azure. <b>Every request</b>, whether from the portal, PowerShell, the CLI, REST APIs or SDKs, goes through ARM. It authenticates and authorizes the request, then sends it to the right Azure service. Because everything goes through one layer, results are consistent. ARM lets you:</p>
<ul><li>Manage infrastructure through <b>declarative templates</b> instead of scripts.</li>
<li>Deploy, manage and monitor resources <b>as a group</b>.</li>
<li><b>Redeploy</b> consistently throughout the development lifecycle.</li>
<li>Define <b>dependencies</b> so resources deploy in the right order.</li>
<li>Apply access control (RBAC), locks and <b>tags</b> to resources.</li></ul>
<div class="viz" id="viz-armflow"></div>
<h3>ARM templates and Bicep</h3>
<p>An <b>ARM template</b> is a <b>JSON</b> file that describes the resources you want. Its key benefits:</p>
<ul><li><b>Declarative syntax</b>: you state <i>what</i> you want, not the steps to create it.</li>
<li><b>Repeatable results</b>: deploy the same template many times and get the same result. Deployments are <b>idempotent</b>; redeploying an unchanged template changes nothing.</li>
<li><b>Orchestration</b>: ARM works out the order and deploys independent resources in parallel.</li>
<li><b>Modular files</b>: split templates into smaller, reusable ones and link them.</li>
<li><b>Extensibility</b>: add deployment scripts in Bash or PowerShell.</li></ul>
<p><b>Bicep</b> is a simpler language that compiles to ARM JSON, with the same capabilities.</p>
<div class="viz" id="viz-arm"></div>`},
{id:"advisor",num:"3.10",title:"Azure Advisor",html:`
<p><b>Azure Advisor</b> evaluates your Azure resources and makes <b>personalized recommendations</b> to improve them. Recommendations appear on a dashboard in the portal, and you can set up alerts for new ones. Advisor groups them into five categories:</p>
<ul><li><b>Reliability</b>: keep business-critical apps running (for example, add redundancy).</li>
<li><b>Security</b>: detect threats and vulnerabilities (fed by Microsoft Defender for Cloud).</li>
<li><b>Performance</b>: improve the speed of your apps.</li>
<li><b>Operational excellence</b>: improve process and workflow efficiency, resource manageability and deployment best practices.</li>
<li><b>Cost</b>: reduce overall spending, such as by resizing or shutting down underused VMs, or buying reservations.</li></ul>
<div class="viz" id="viz-advisor"></div>`},
{id:"health",num:"3.11",title:"Azure Service Health",html:`
<p><b>Azure Service Health</b> tracks the health of Azure services and your resources. It combines three views, from broad to narrow:</p>
<ul><li><b>Azure status</b>: a public page showing service outages <b>across all Azure regions</b>. Good for the big picture.</li>
<li><b>Service Health</b>: a personalized view of the <b>services and regions you use</b>. It shows <b>service issues</b>, <b>planned maintenance</b>, <b>health advisories</b> and security advisories, and you can set up alerts.</li>
<li><b>Resource Health</b>: the health of <b>your individual resources</b>, such as one specific VM, and whether a problem is caused by the platform.</li></ul>
<p>Service Health keeps historical information so you can review past incidents, and it provides documentation for any SLA claims.</p>
<div class="viz" id="viz-health"></div>`},
{id:"monitor",num:"3.12",title:"Azure Monitor, Log Analytics, alerts and Application Insights",html:`
<p><b>Azure Monitor</b> collects, analyzes and acts on <b>metrics and logs</b> from Azure, on-premises and other clouds: from apps, operating systems, resources, subscriptions and your tenant. It can display the data in dashboards and workbooks, analyze it, and respond automatically.</p>
<ul><li><b>Log Analytics</b>: the tool in the portal for writing and running <b>log queries</b> on the data Azure Monitor collects, using the <b>Kusto Query Language (KQL)</b>.</li>
<li><b>Azure Monitor alerts</b>: notify you when a condition is met, such as CPU above 90% or an error in the logs. Alert types include <b>metric</b>, <b>log</b> and <b>activity log</b> alerts. Alerts use <b>action groups</b> to email, text, call a webhook, or run automation.</li>
<li><b>Application Insights</b>: application performance monitoring (APM) for web apps, whether in Azure, on-premises or in another cloud. It tracks <b>request rates, response times and failure rates</b>, <b>dependency</b> calls, page views and load performance, user and session counts, and performance counters. It can also send synthetic requests to check that your app is available (availability tests).</li></ul>
<div class="viz" id="viz-kql"></div>
<div class="viz" id="viz-alert"></div>
<div class="viz" id="viz-monsort"></div>`}
];

const G={
 cost:[["Factors that affect Azure costs","Resource type, consumption, maintenance, geography, network traffic, subscription type, Marketplace"],["Does a VM stopped inside the OS still cost money?","Yes; it's still allocated and billed for compute"],["Stopped (deallocated)","Compute billing stops; disks are still billed"],["Ingress vs egress","Data into Azure is generally free; data out (egress) is billed"],["Why do prices differ by region?","Power, labor, taxes and fees vary by location"],["Resources often left behind when a VM is deleted","Disks, network interfaces and public IPs"],["Azure Marketplace billing","Third-party solutions are billed with your Azure usage"],["Pricing calculator","Estimates the cost of resources you plan to provision in Azure"],["TCO calculator","Compares on-premises costs with the cost of running in Azure"],["Does the pricing calculator create resources?","No; it only estimates costs"],["Microsoft Cost Management","Analyze costs, create budgets and set spending alerts"],["Cost analysis","Visualize costs by billing cycle, region, resource or service"],["Budget alert","Fires when spending reaches a threshold you set"],["Credit alert","Fires when Azure credit commitments are being used up"],["Department spending quota alert","Fires when a department reaches its spending quota"],["Do budgets stop resources automatically?","No; they alert, but alerts can trigger automation"],["Tag","A name/value pair of metadata on a resource, group or subscription"],["Uses of tags","Cost tracking, resource and operations management, security, compliance, automation"],["Are tags inherited from resource groups?","No, not by default; use Azure Policy to enforce or inherit them"],["How to require a tag on every resource","Assign an Azure Policy"],["Azure free account", "Credit for the first 30 days, 12 months of popular free services, and always-free services"],["Scopes for budgets and cost analysis", "Management group, subscription or resource group"],["Maximum tags per resource", "50 name/value pairs"]],
 gov:[["Microsoft Purview","Unified data governance, risk and compliance across on-premises, multicloud and SaaS data"],["Purview data map","Scans data sources and classifies sensitive data automatically"],["Purview risk and compliance","Protects sensitive data in Microsoft 365 and manages regulatory compliance"],["Data lineage","Where data came from and how it moved (tracked by Purview)"],["Azure Policy","Creates and enforces rules for how resources must be configured"],["Policy definition","A single rule, such as allowed locations"],["Policy initiative","A group of related policy definitions assigned together"],["Policy effect: Deny","Blocks creation or changes that don't comply"],["Policy effect: Audit","Allows the change but marks it non-compliant"],["Policy remediation","Automatically fixes non-compliant resources where possible"],["Is Azure Policy inherited?","Yes, by all child scopes"],["RBAC vs Azure Policy","RBAC controls who can act; Policy controls what can be deployed and how"],["Resource lock","Prevents accidental deletion or modification; applies even to Owners"],["Delete lock (CanNotDelete)","Read and modify allowed; delete blocked"],["ReadOnly lock","Read allowed; modify and delete blocked"],["Are resource locks inherited?","Yes; a lock on a resource group protects its resources"],["How do you delete a locked resource?","Remove the lock first (needs lock management permission)"],["Where can locks be applied?","Subscription, resource group or individual resource"],["Policy effect: Modify", "Adds, updates or removes properties or tags on a resource"],["Policy effect: DeployIfNotExists", "Deploys a related resource or setting when it's missing"]],
 tools:[["Azure portal","Web-based console to build, manage and monitor Azure resources"],["Portal dashboards","Customizable views of your resources and metrics"],["Azure Cloud Shell","Browser-based Bash or PowerShell, pre-authenticated, nothing to install"],["Cloud Shell storage","An Azure Files share keeps your files between sessions"],["Azure CLI","Cross-platform command line; commands start with az"],["Azure PowerShell","Az module cmdlets with verb-noun names like New-AzVM"],["Which tools run in Cloud Shell?","Both Azure CLI (Bash) and Azure PowerShell"],["Which service extends Azure Policy, RBAC and tags to on-premises and multicloud servers?","Azure Arc"],["What can Azure Arc manage?","Servers, Kubernetes, Azure data services, SQL Server, VMware and SCVMM VMs"],["What can you apply to Arc-enabled resources?","Azure Policy, RBAC, tags, Azure Monitor, Defender for Cloud"],["Infrastructure as code","Defining infrastructure in code files that can be versioned and reused"],["Azure Resource Manager (ARM)","The deployment and management layer every Azure request passes through"],["Which requests go through ARM?","All: portal, PowerShell, CLI, REST APIs and SDKs"],["ARM template","A JSON file that declares the resources to deploy"],["Declarative syntax","Describe what you want, not the steps to build it"],["Idempotent deployment","Redeploying an unchanged template produces the same result"],["ARM template orchestration","Deploys resources in dependency order, in parallel where possible"],["Bicep","A simpler language that compiles to ARM JSON templates"],["Linked or nested templates","Split big templates into smaller reusable files (modular)"],["Azure portal maintenance", "Updated continually with no downtime for maintenance"],["Arc-enabled resources in ARM", "They appear in Azure Resource Manager like native Azure resources"],["Modular ARM templates", "Split a template into smaller linked templates you can reuse"]],
 mon:[["Azure Advisor","Personalized recommendations to improve your Azure resources"],["Azure Advisor categories","Reliability, security, performance, operational excellence, cost"],["Advisor: resize an underused VM","Cost recommendation"],["Advisor: add a second VM for redundancy","Reliability recommendation"],["Azure status page","Global view of Azure service health across all regions"],["Azure Service Health","Personalized view of service issues and maintenance for services and regions you use"],["Planned maintenance notices appear in…","Azure Service Health"],["Azure Resource Health","Health of your individual resources, such as one VM"],["Azure Monitor","Collects and analyzes metrics and logs from Azure, on-premises and other clouds"],["Log Analytics","Write and run log queries on Azure Monitor data"],["KQL","Kusto Query Language, used in Log Analytics"],["Azure Monitor alerts","Notify or act when a metric or log condition is met"],["Alert types","Metric alerts, log alerts and activity log alerts"],["Action group","What an alert does: email, SMS, webhook, automation"],["Application Insights","Application performance monitoring for web apps"],["What Application Insights tracks","Requests, response times, failures, dependencies, page views, users and sessions"],["Availability test","Application Insights sends synthetic requests to check the app is up"],["Can Application Insights monitor apps outside Azure?","Yes: on-premises and in other clouds"],["Azure Monitor data sources", "Apps, operating systems, Azure resources, subscriptions and the tenant, plus on-premises and other clouds"],["Activity log", "Records control-plane events: who did what to which resource, and when"]]
};
const DECKS=[["cost","Cost management"],["gov","Governance and compliance"],["tools","Management and deployment tools"],["mon","Monitoring"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which factor does NOT directly affect Azure costs?",o:["The color theme of your Azure portal","Resource type and the size you choose","Region","Network egress"],a:0,e:"Resource type, consumption, maintenance, geography, traffic, subscription and Marketplace do."},
 {q:"A VM was shut down from inside Windows, but the bill shows compute charges continuing. Why?",o:["The VM is still allocated; it must be stopped (deallocated) in Azure","Azure bills deleted VMs until the end of the month they were deleted in","Disks are free","The pricing calculator is wrong"],a:0,e:"Only deallocation stops compute billing."},
 {q:"A VM is stopped (deallocated). What is still billed?",o:["Its managed disks","Its compute hours","Nothing at all","Its vCPUs"],a:0,e:"Storage keeps billing even when compute stops."},
 {q:"Which network traffic is generally free in Azure?",o:["Data coming into Azure (ingress)","Data leaving Azure (egress)","Data between regions","Data out to the internet"],a:0,e:"Ingress is free; egress is billed."},
 {q:"The same VM size costs more in one region than another. Which cost factor is this?",o:["Geography","Maintenance","Subscription type","Tags"],a:0,e:"Prices vary by region."},
 {q:"After deleting a VM, a company still pays for its disk and public IP. Which cost factor is this?",o:["Maintenance (unused resources left behind)","Geography (the region where the VM ran)","Consumption","Network ingress"],a:0,e:"Clean up orphaned resources."},
 {q:"A company buys a third-party firewall from Azure Marketplace. How is it billed?",o:["Through the Azure bill","Only by the vendor directly, outside Azure","It's always free","Through Microsoft 365"],a:0,e:"Marketplace purchases are billed with Azure usage."},
 {q:"Which tool estimates the monthly cost of VMs and storage you plan to deploy in Azure?",o:["Pricing calculator","TCO calculator","Azure Advisor","Service Health"],a:0,e:"The pricing calculator estimates Azure costs."},
 {q:"Which tool compares the cost of your on-premises datacenter with running the same workloads in Azure?",o:["TCO calculator","Pricing calculator","Cost analysis","Azure Monitor"],a:0,e:"TCO compares on-premises with Azure."},
 {q:"What happens when you add a VM to an estimate in the pricing calculator?",o:["Nothing is deployed or charged; it's only an estimate","The VM is deployed to a sandbox subscription for testing","You're billed immediately","A reservation is purchased"],a:0,e:"The calculator is informational only."},
 {q:"Which tool lets you visualize spending by service, region and resource group over time?",o:["Cost analysis in Cost Management","Azure Advisor reliability recommendations","Azure Arc","Resource locks"],a:0,e:"Cost analysis shows where money goes."},
 {q:"A team wants an email when monthly spending reaches 80% of $5,000. What should they create?",o:["A budget with an alert","A resource lock","A tag","An availability set"],a:0,e:"Budgets trigger budget alerts at thresholds."},
 {q:"Spending reaches 100% of a budget. What happens to the resources by default?",o:["They keep running; budgets alert but don't stop spending on their own","They're deallocated automatically and restart when the next billing period starts","They're deleted","The subscription is canceled"],a:0,e:"You can add automation, but budgets alone only notify."},
 {q:"Which alert type warns that Azure credit commitments are being consumed?",o:["Credit alert","Budget alert","Metric alert","Service Health alert"],a:0,e:"Credit alerts track credit consumption."},
 {q:"What are tags?",o:["Name/value pairs of metadata on Azure resources","Security groups that control who can access a resource","Storage tiers","Region pairs"],a:0,e:"For example, env = prod."},
 {q:"Finance wants to see costs per department across many resource groups. What's the simplest way?",o:["Tag resources with a department tag and group costs by it","Create a separate Azure region for each department","Use resource locks","Use Azure DNS"],a:0,e:"Tags make cost reporting flexible."},
 {q:"A resource group has the tag env = prod. Do resources inside it automatically get that tag?",o:["No, tags aren't inherited by default","Yes, every resource inherits it","Only VMs do","Only after 24 hours"],a:0,e:"Use Azure Policy to copy or require tags."},
 {q:"How can you make sure every new resource has a costcenter tag?",o:["Assign an Azure Policy that requires the tag","Add a ReadOnly lock to each resource group","Use Azure Advisor","Use Service Health"],a:0,e:"Policy enforces tagging."},
 {q:"Which service provides data governance, risk and compliance with a unified view of data across on-premises, multicloud and SaaS?",o:["Microsoft Purview","Azure Policy","Azure Advisor","Azure Arc"],a:0,e:"Purview maps and governs your data estate."},
 {q:"A company wants to automatically discover and classify sensitive data in Azure SQL, Amazon S3 and on-premises SQL Server. Which service?",o:["Microsoft Purview","Azure Monitor","Resource locks","Azure Migrate"],a:0,e:"Purview's data map scans and classifies sources."},
 {q:"Which service lets you enforce rules such as \"resources may only be created in East US and West Europe\"?",o:["Azure Policy","Azure RBAC","Resource locks","Azure Advisor"],a:0,e:"Allowed locations is a built-in policy."},
 {q:"What is an Azure Policy initiative?",o:["A group of related policy definitions assigned together","A single resource lock that applies to a whole subscription","A type of budget","A region pair"],a:0,e:"Initiatives bundle policies toward a goal."},
 {q:"A policy uses the Audit effect. A user creates a non-compliant resource. What happens?",o:["It's created and flagged as non-compliant","It's blocked and the user sees a policy error","It's deleted after an hour","The user loses access"],a:0,e:"Audit reports; Deny blocks."},
 {q:"A policy uses the Deny effect. A user tries to create a non-compliant resource. What happens?",o:["The request is blocked","It's created and flagged","It's created in another region","It's moved to a different resource group"],a:0,e:"Deny prevents non-compliant resources."},
 {q:"Does Azure Policy evaluate resources that existed before the policy was assigned?",o:["Yes, and it reports their compliance","No, only resources created after assignment","Only if they're tagged","Only VMs"],a:0,e:"Existing resources are evaluated and can be remediated."},
 {q:"What's the difference between Azure Policy and Azure RBAC?",o:["Policy controls what can be deployed and how; RBAC controls who can do what","They're the same: both control who can deploy which resources in each subscription","RBAC controls costs; Policy controls identity","Policy is only for storage"],a:0,e:"Different questions: what vs who."},
 {q:"A policy is assigned to a management group. Which resources does it evaluate?",o:["Everything in all subscriptions under it","Only the management group resource itself","Only new subscriptions","Nothing until reassigned"],a:0,e:"Policies are inherited."},
 {q:"Which prevents a critical production database from being accidentally deleted, even by an Owner?",o:["A Delete (CanNotDelete) resource lock","The Reader role assigned to every Owner of the subscription","An Azure Policy audit","A tag"],a:0,e:"Locks override RBAC permissions."},
 {q:"A resource has a ReadOnly lock. What can an Owner do?",o:["Read it, but not modify or delete it","Modify but not delete it","Delete but not modify it","Anything"],a:0,e:"ReadOnly blocks changes and deletion."},
 {q:"A resource has a Delete lock. What can a Contributor do?",o:["Read and modify it, but not delete it","Only read it; all changes are blocked","Delete it","Nothing"],a:0,e:"CanNotDelete still allows changes."},
 {q:"A resource group has a Delete lock. What happens when someone tries to delete a VM in it?",o:["It's blocked, because locks are inherited","It's deleted","Only the disk is deleted","The lock is removed automatically"],a:0,e:"Child resources inherit the lock."},
 {q:"An admin needs to delete a resource that has a lock. What must happen first?",o:["Remove the lock","Add a tag","Assign the Reader role","Open a support ticket"],a:0,e:"The lock must be removed by someone allowed to manage locks."},
 {q:"At which levels can you apply a resource lock?",o:["Subscription, resource group or resource","Only resource, never a container","Only management group","Only region"],a:0,e:"Locks are inherited downward from where they're applied."},
 {q:"Which tool is a web-based, unified console for managing Azure with customizable dashboards?",o:["Azure portal","Azure CLI","AzCopy","Azure Data Box"],a:0,e:"The portal runs in your browser."},
 {q:"Which tool gives you a browser-based Bash or PowerShell session, already signed in to Azure, with nothing to install?",o:["Azure Cloud Shell","Azure Storage Explorer","Azure Arc","Azure Advisor"],a:0,e:"Cloud Shell opens from the portal."},
 {q:"How does Cloud Shell keep your scripts between sessions?",o:["An Azure Files share","Your browser cache","A local hard drive","It doesn't"],a:0,e:"Cloud Shell mounts a file share."},
 {q:"Which command creates a resource group with the Azure CLI?",o:["az group create","New-AzResourceGroup","Create-ResourceGroup","azcopy make"],a:0,e:"Azure CLI commands start with az."},
 {q:"Which command creates a resource group with Azure PowerShell?",o:["New-AzResourceGroup","az group create","Get-AzVM","azcopy create"],a:0,e:"PowerShell cmdlets use verb-noun names."},
 {q:"Which platforms can run Azure CLI and Azure PowerShell?",o:["Windows, macOS and Linux","Windows only","Linux only","Only Cloud Shell"],a:0,e:"Both are cross-platform."},
 {q:"An administrator wants to automate a repeatable daily task. Which tools are best suited?",o:["Azure CLI or Azure PowerShell scripts","Clicking through the portal","The TCO calculator","Service Health"],a:0,e:"Scripts give consistent, repeatable results."},
 {q:"Which service lets you manage on-premises servers and Kubernetes clusters in other clouds from the Azure portal?",o:["Azure Arc","Azure Migrate","Azure Data Box","Azure DNS"],a:0,e:"Arc projects external resources into Azure."},
 {q:"After connecting on-premises servers with Azure Arc, what can you apply to them?",o:["Azure Policy, RBAC, tags and Defender for Cloud","Only tags, since Arc servers aren't Azure resources","Nothing","Only resource locks"],a:0,e:"Arc-enabled resources are managed like Azure resources."},
 {q:"Which can Azure Arc manage?",o:["VMs in VMware vSphere","Microsoft Teams chats","Physical datacenter cooling","Domain name registrations"],a:0,e:"Servers, Kubernetes, data services, SQL Server and VMware/SCVMM VMs."},
 {q:"What is infrastructure as code (IaC)?",o:["Managing infrastructure with code files instead of manual steps","Writing applications in C# that run on infrastructure in Azure","A type of VM","A billing model"],a:0,e:"IaC makes infrastructure repeatable and versionable."},
 {q:"What is Azure Resource Manager (ARM)?",o:["The deployment and management service that all Azure requests go through","A VM size family designed for running management and monitoring tools","A storage tier","A monitoring dashboard"],a:0,e:"ARM authenticates, authorizes and routes requests."},
 {q:"A user creates a VM in the portal and another uses the CLI. Which service processes both requests?",o:["Azure Resource Manager","Azure Monitor activity log","Azure Advisor","Azure DNS"],a:0,e:"Every tool talks to ARM."},
 {q:"In what format are ARM templates written?",o:["JSON","YAML only","XML","CSV"],a:0,e:"ARM templates are JSON. Bicep compiles to JSON."},
 {q:"ARM templates use declarative syntax. What does that mean?",o:["You describe what you want deployed, not the steps","You write every step in the order Azure should run it","You must use the portal","Templates can't be reused"],a:0,e:"ARM works out how."},
 {q:"You deploy the same unchanged ARM template twice. What happens the second time?",o:["Nothing changes; the deployment is idempotent","Duplicate resources are created","The first resources are deleted","It fails"],a:0,e:"Same template, same result."},
 {q:"What is Bicep?",o:["A simpler language that compiles to ARM templates","A monitoring tool that collects metrics from VMs","A VM series","A storage redundancy option"],a:0,e:"Bicep is a friendlier IaC syntax for ARM."},
 {q:"Which ARM template benefit means resources are deployed in the correct order, in parallel where possible?",o:["Orchestration","Idempotency","Tagging","Modularity"],a:0,e:"ARM handles dependency order."},
 {q:"Which service gives personalized recommendations to improve reliability, security, performance, operational excellence and cost?",o:["Azure Advisor","Azure Service Health","Microsoft Purview","Azure Arc"],a:0,e:"Those are Advisor's five categories."},
 {q:"Azure Advisor recommends shutting down an underused VM. Which category is this?",o:["Cost","Reliability","Security","Performance"],a:0,e:"It reduces spending."},
 {q:"Azure Advisor recommends adding VMs to an availability set. Which category is this?",o:["Reliability","Cost","Performance","Operational excellence"],a:0,e:"It improves resilience."},
 {q:"Which is NOT an Azure Advisor category?",o:["Compliance","Reliability","Performance","Operational excellence"],a:0,e:"The five are reliability, security, performance, operational excellence and cost."},
 {q:"Which shows the health of Azure services across ALL regions globally?",o:["Azure status","Resource Health","Azure Advisor","Log Analytics"],a:0,e:"Azure status is the broad, public view."},
 {q:"Which gives a personalized view of outages and planned maintenance for the services and regions you use?",o:["Azure Service Health","Azure status","Resource Health","Azure Advisor"],a:0,e:"Service Health is personalized."},
 {q:"A single VM is unreachable. Which tool shows whether that specific VM has a platform problem?",o:["Resource Health","Azure status","Azure Advisor","Cost Management"],a:0,e:"Resource Health covers individual resources."},
 {q:"Where would you find advance notice of planned maintenance affecting your Azure resources?",o:["Azure Service Health","The TCO calculator","Azure DNS","Microsoft Purview"],a:0,e:"Service Health shows planned maintenance."},
 {q:"Which service collects and analyzes metrics and logs from Azure, on-premises and other clouds?",o:["Azure Monitor","Azure Advisor","Azure Policy","Azure Arc"],a:0,e:"Azure Monitor is the telemetry platform."},
 {q:"Which tool do you use to write and run queries against log data collected by Azure Monitor?",o:["Log Analytics","Azure Advisor","Service Health","Storage Explorer"],a:0,e:"Log Analytics runs KQL queries."},
 {q:"Which query language does Log Analytics use?",o:["Kusto Query Language (KQL)","Structured Query Language (SQL)","GraphQL","PowerShell only"],a:0,e:"KQL is used across Azure Monitor."},
 {q:"An admin wants a text message when a VM's CPU stays above 90% for 10 minutes. What should they configure?",o:["An Azure Monitor metric alert with an action group","A resource lock that sends a notification when the VM is changed","A budget","A tag"],a:0,e:"Alerts use action groups for notifications."},
 {q:"What does an action group define in Azure Monitor?",o:["Who gets notified and what actions run when an alert fires","Which region to deploy to when an alert rule is created","Which tags are required","Storage redundancy"],a:0,e:"Email, SMS, voice, webhook, automation."},
 {q:"Which service monitors a web app's request rates, response times, failure rates and dependencies?",o:["Application Insights","Azure Advisor","Service Health","Azure Policy"],a:0,e:"Application Insights is APM for web apps."},
 {q:"Can Application Insights monitor an app hosted on-premises or in another cloud?",o:["Yes","No, only App Service","No, only VMs","Only with ExpressRoute"],a:0,e:"It works wherever the app runs."},
 {q:"Which Application Insights feature sends synthetic requests to check that your website is up?",o:["Availability tests","Cost alerts","Resource locks","Initiatives"],a:0,e:"Availability tests ping the app from around the world."},
 {q:"Which alert type fires when someone deletes a resource in your subscription?",o:["Activity log alert","Metric alert only","Budget alert","Credit alert"],a:0,e:"Activity log alerts track control-plane operations."},
 {q:"A company wants to stop developers from deploying expensive VM sizes. Which is the BEST tool?",o:["Azure Policy with allowed VM sizes","Resource locks on the subscription","Tags","Azure status"],a:0,e:"Policy can deny disallowed sizes."},
 {q:"Which tool helps you find and buy reserved instances to lower costs for always-on VMs?",o:["Azure Advisor cost recommendations","Resource Health for each VM","Log Analytics","Azure DNS"],a:0,e:"Advisor recommends reservations based on usage."}
];

/* ---------- custom diagrams ---------- */
function vizCostdrv(){
  const el=$("#viz-costdrv");const used=new Set();
  const s={state:"run",reg:"eus",commit:"payg",ahb:false,egress:50};
  const REG={eus:["East US",1],weu:["West Europe",1.12],brs:["Brazil South",1.45]};
  el.innerHTML=`<div class="viz-title">What drives this VM's bill?</div><div class="s-small">ILLUSTRATIVE WINDOWS VM · NOT CURRENT AZURE RATES</div>
    <div class="sel-row"><span>Power state</span><div class="seg-row" data-g="state"><button class="chip" data-v="run">Running</button><button class="chip" data-v="os">Stopped inside the OS</button><button class="chip" data-v="dealloc">Stopped (deallocated)</button></div></div>
    <div class="sel-row"><span>Region</span><div class="seg-row" data-g="reg">${Object.keys(REG).map(k=>`<button class="chip" data-v="${k}">${REG[k][0]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Pricing</span><div class="seg-row" data-g="commit"><button class="chip" data-v="payg">Pay-as-you-go</button><button class="chip" data-v="res">3-year reservation</button></div></div>
    <label class="check"><input type="checkbox" data-k="ahb"> Use Azure Hybrid Benefit (we own Windows Server licenses)</label>
    <div class="rng-row"><span>Data out (egress)</span><input type="range" min="0" max="2000" step="50" value="${s.egress}" data-k="egress" aria-label="Egress in GB"><b data-o="eg"></b></div>
    <div class="out"></div>`;
  function draw(){el.querySelectorAll("[data-g]").forEach(g=>g.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",s[g.dataset.g]===b.dataset.v)));$('[data-o="eg"]',el).textContent=fmt(s.egress)+" GB";
    const m=REG[s.reg][1],billed=s.state!=="dealloc";
    const compute=billed?100*m*(s.commit==="res"?0.38:1):0,lic=billed&&!s.ahb?45*m:0,disk=18*m,eg=Math.max(0,s.egress-100)*0.087,tot=compute+lic+disk+eg;
    $(".out",el).innerHTML=`<div class="tbl-wrap"><table class="tbl"><tr><th>Item</th><th class="num">Per month</th></tr>
      <tr><td>Compute (vCPUs and memory)</td><td class="num ${compute?"":"ok"}">$${compute.toFixed(2)}</td></tr><tr><td>Windows license</td><td class="num ${lic?"":"ok"}">$${lic.toFixed(2)}</td></tr>
      <tr><td>Managed OS disk</td><td class="num">$${disk.toFixed(2)}</td></tr><tr><td>Egress (first 100 GB free)</td><td class="num">$${eg.toFixed(2)}</td></tr>
      <tr><th>Total</th><th class="num">$${tot.toFixed(2)}</th></tr></table></div>
      <div class="caption" aria-live="polite">${s.state==="os"?"<span class=\"status-bad\">Still billed.</span> Shutting down inside Windows leaves the VM allocated, so compute keeps charging.":s.state==="dealloc"?"<span class=\"status-good\">Compute billing stopped.</span> The disk is still billed because the data still exists.":s.commit==="res"?"A 3-year reservation cuts the compute price sharply for an always-on VM.":"Change each setting to see how it moves the bill."}</div>
      <div class="rv-prog s-small">${used.size} of 5 cost factors explored</div>`;
    if(used.size>=5)award("viz:costdrv",30,"Explored every cost factor")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(!b)return;const g=b.closest("[data-g]").dataset.g;s[g]=b.dataset.v;if(g==="state"&&s.state==="dealloc")used.add("state");if(g==="reg"&&s.reg!=="eus")used.add("reg");if(g==="commit"&&s.commit==="res")used.add("commit");draw()});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="ahb"){s.ahb=e.target.checked;if(s.ahb)used.add("ahb");draw()}});
  el.addEventListener("input",e=>{if(e.target.dataset.k==="egress"){s.egress=+e.target.value;if(s.egress>100)used.add("egress");draw()}});draw();
}
function vizCalc(){
  const el=$("#viz-calc");let regChanged=false;
  const CAT=[["Virtual machine · D2s (Linux) · 730 h",70],["Virtual machine · D4s (Windows) · 730 h",280],["Azure SQL Database · 2 vCores",370],["Blob storage · 1 TB hot · LRS",21],["App Service plan · P1v3",125],["Bandwidth · 500 GB out",35],["Azure Functions · 5 million executions",1]];
  const REG={eus:["East US",1],weu:["West Europe",1.1],jpe:["Japan East",1.2]};let reg="eus";const est=[];
  function draw(){const m=REG[reg][1],tot=est.reduce((a,i)=>a+CAT[i][1]*m,0);
    el.innerHTML=`<div class="viz-title">Mini pricing calculator</div><div class="s-small">ILLUSTRATIVE PRICES · ESTIMATE ONLY · NOTHING IS DEPLOYED</div>
    <div class="sel-row"><span>Region</span><div class="seg-row">${Object.keys(REG).map(k=>`<button class="chip" data-r="${k}" aria-pressed="${k===reg}">${REG[k][0]}</button>`).join("")}</div></div>
    <div class="two-col"><div class="panel"><b>Products</b>${CAT.map((c,i)=>`<button class="chip" data-add="${i}">+ ${c[0]}</button>`).join("")}</div>
    <div class="panel"><b>Your estimate</b>${est.length?est.map((i,k)=>`<div class="kv" style="margin:0;grid-template-columns:1fr auto auto"><span>${CAT[i][0]}</span><b class="mono">$${(CAT[i][1]*m).toFixed(2)}</b><button class="chip" data-rm="${k}" aria-label="Remove">×</button></div>`).join(""):'<span class="s-small">Add products from the list</span>'}
    <div class="kv"><span>Estimated monthly cost</span><b class="big-cost">$${tot.toFixed(2)}</b></div></div></div>
    <div class="caption" aria-live="polite">${est.length>=3&&regChanged?"<span class=\"status-good\">Estimate built.</span> In the real calculator you can export or share it, and add support plans and dev/test pricing.":"Add at least three products and compare regions. The same resources cost different amounts in different regions."}</div>`;
    if(est.length>=3&&regChanged)award("viz:calc",30,"Built a cost estimate")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-add]"),r=e.target.closest("[data-rm]"),g=e.target.closest("[data-r]");
    if(a)est.push(+a.dataset.add);if(r)est.splice(+r.dataset.rm,1);if(g){reg=g.dataset.r;if(reg!=="eus")regChanged=true}if(a||r||g)draw()});draw();
}
function vizBudget(){
  const el=$("#viz-budget");const fired=new Set();let sp=420;
  const TH=[[50,"Email the team lead"],[90,"Email finance and post in Teams"],[100,"Action group runs automation that shuts down dev VMs"]];
  el.innerHTML=`<div class="viz-title">Budget alerts: $1,000 a month for the dev subscription</div>
    <div class="rng-row"><span>Spend so far</span><input type="range" min="0" max="1300" step="10" value="${sp}" data-k="sp" aria-label="Spend so far"><b data-o="sp"></b></div><div class="out"></div>`;
  function draw(){$('[data-o="sp"]',el).textContent="$"+fmt(sp);const pct=sp/10;TH.forEach(t=>{if(pct>=t[0])fired.add(t[0])});
    $(".out",el).innerHTML=`<div class="meter" aria-hidden="true"><i style="width:${Math.min(100,pct)}%"></i></div>
    <div class="sc-list">${TH.map(t=>`<label class="${pct>=t[0]?"done":""}"><span class="mono">${t[0]}%</span><span>${t[1]}</span><span>${pct>=t[0]?"Fired":"Waiting"}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${pct>=100?"Over budget. The budget itself doesn't stop spending; here the 100% alert triggers automation that does.":pct>=50?"Alerts fire as spending crosses each threshold you set.":"Under 50% of budget. No alerts yet."}</div>`;
    if(fired.size===3)award("viz:budget",20,"Triggered every budget alert")}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="sp"){sp=+e.target.value;draw()}});draw();
}
function vizTags(){
  const el=$("#viz-tags");const seen=new Set();
  const RS=[["vm-web01","VM",210,{env:"prod",dept:"Sales",costcenter:"4410"}],["sql-orders","SQL Database",370,{env:"prod",dept:"Sales",costcenter:"4410"}],["vm-test01","VM",95,{env:"dev",dept:"Engineering",costcenter:"5120"}],["st-logs","Storage",40,{env:"prod",dept:"IT",costcenter:"3001"}],["aks-ml","AKS cluster",640,{env:"dev",dept:"Engineering",costcenter:"5120"}],["app-hr","App Service",125,{env:"prod",dept:"HR",costcenter:"2200"}],["vm-old","VM",80,{}]];
  let key="dept";
  function draw(){seen.add(key);const grp={};RS.forEach(r=>{const k=r[3][key]||"(untagged)";grp[k]=(grp[k]||0)+r[2]});const max=Math.max(...Object.values(grp));
    el.innerHTML=`<div class="viz-title">Group costs by tag</div>
    <div class="seg-row">${["env","dept","costcenter"].map(k=>`<button class="chip" data-k="${k}" aria-pressed="${k===key}">Group by ${k}</button>`).join("")}</div>
    <div class="dd-bars" style="display:grid;gap:6px">${Object.entries(grp).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="rng-row" style="grid-template-columns:120px 1fr 70px"><span>${k}</span><span class="meter" style="margin:0"><i style="width:${v/max*100}%;background:${k==="(untagged)"?"var(--bad)":"linear-gradient(90deg,var(--accent),var(--blue))"}"></i></span><b>$${fmt(v)}</b></div>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Resource</th><th>Type</th><th>Tags</th></tr>${RS.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${Object.keys(r[3]).length?Object.entries(r[3]).map(([k,v])=>`<span class="tag">${k}=${v}</span>`).join(" "):'<span class="status-bad">none</span>'}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">Tags let finance slice the same bill by environment, department or cost center. vm-old has no tags, so its cost can't be assigned to anyone. An Azure Policy that requires tags would have stopped that.</div>`;
    if(seen.size===3)award("viz:tags",20,"Grouped costs by every tag")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b){key=b.dataset.k;draw()}});draw();
}
function vizPolicy(){
  const el=$("#viz-policy");const res={},outs=new Set();let eff="deny";
  const D=[["VM D2s in East US, tagged env=prod",{loc:"East US",size:"D",tag:1}],["VM D4s in Brazil South, tagged env=dev",{loc:"Brazil South",size:"D",tag:1}],["Storage account in West Europe, no tags",{loc:"West Europe",tag:0}],["VM M128 (128 vCPUs) in East US, tagged",{loc:"East US",size:"M",tag:1}],["SQL database in West Europe, tagged env=prod",{loc:"West Europe",tag:1}]];
  const check=x=>{const v=[];if(!["East US","West Europe"].includes(x.loc))v.push("Allowed locations");if(x.size&&!["B","D"].includes(x.size))v.push("Allowed VM sizes");if(!x.tag)v.push("Require an env tag");return v};
  function draw(){const vals=Object.values(res),comp=vals.filter(r=>r.st==="ok").length,nc=vals.filter(r=>r.st==="nc").length;
    el.innerHTML=`<div class="viz-title">Azure Policy: deploy into a governed subscription</div>
    <div class="s-small">ASSIGNED: ALLOWED LOCATIONS (EAST US, WEST EUROPE) · ALLOWED VM SIZES (B, D) · REQUIRE AN ENV TAG</div>
    <div class="sel-row"><span>Effect</span><div class="seg-row"><button class="chip" data-e="deny" aria-pressed="${eff==="deny"}">Deny</button><button class="chip" data-e="audit" aria-pressed="${eff==="audit"}">Audit</button></div></div>
    <div class="sc-list">${D.map((d,i)=>{const r=res[i];return `<label class="${r?r.st==="ok"?"done":"":""}" style="grid-template-columns:1fr auto auto"><span>${d[0]}</span><span class="${r?r.st==="ok"?"status-good":"status-bad":"s-small"}">${r?r.st==="ok"?"Deployed · compliant":r.st==="nc"?"Deployed · non-compliant":"Blocked by policy":"Not deployed"}</span><button class="btn" data-d="${i}">Deploy</button></label>`}).join("")}</div>
    <div class="kv"><span>Compliance</span><b class="mono">${comp+nc?Math.round(comp/(comp+nc)*100)+"% of deployed resources":"—"}</b></div>
    <div class="caption" aria-live="polite">${el._msg||"Deploy each resource. Then switch the effect and try again."}</div>`;
    if(outs.has("blocked")&&outs.has("nc")&&outs.has("ok"))award("viz:policy",30,"Saw Deny and Audit in action")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]"),f=e.target.closest("[data-e]");
    if(f){eff=f.dataset.e;el._msg=eff==="deny"?"Deny blocks non-compliant requests before anything is created.":"Audit lets everything through, but non-compliant resources show up in the compliance report.";Object.keys(res).forEach(k=>delete res[k])}
    if(b){const i=+b.dataset.d,v=check(D[i][1]);const st=!v.length?"ok":eff==="deny"?"blocked":"nc";res[i]={st};outs.add(st);
      el._msg=!v.length?`<span class="status-good">Compliant.</span> ${D[i][0]} was created.`:`<span class="status-bad">${eff==="deny"?"Request denied":"Created, but flagged"}</span> by: ${v.join(", ")}.`}
    if(b||f)draw()});draw();
}
function vizLock(){
  const el=$("#viz-lock");const tried=new Set();let lock="none",last=null;
  const A=[["read","View the VM's settings",1],["tag","Add a tag",2],["resize","Resize the VM",2],["delete","Delete the VM",3]];
  const LK={none:"No lock",del:"Delete lock (CanNotDelete)",ro:"ReadOnly lock"};
  const allowed=a=>lock==="none"||a[2]===1||lock==="del"&&a[2]===2;
  function draw(){
    el.innerHTML=`<div class="viz-title">Resource lock tester · you are an Owner</div>
    <div class="sel-row"><span>Lock on rg-prod</span><div class="seg-row">${Object.keys(LK).map(k=>`<button class="chip" data-l="${k}" aria-pressed="${k===lock}">${LK[k]}</button>`).join("")}</div></div>
    <div class="viz-controls">${A.map(a=>`<button class="btn" data-a="${a[0]}">${a[1]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Action on vm-prod01</th>${Object.keys(LK).map(k=>`<th class="${k===lock?"cur":""}">${LK[k].split(" (")[0]}</th>`).join("")}</tr>${A.map(a=>`<tr><td>${a[1]}</td>${Object.keys(LK).map(k=>{const ok=k==="none"||a[2]===1||k==="del"&&a[2]===2;return `<td class="${tried.has(k+":"+a[0])?(ok?"ok":"no"):"dim"}">${tried.has(k+":"+a[0])?(ok?"✓ Allowed":"✗ Blocked"):"?"}</td>`}).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${last?(allowed(last)?`<span class="status-good">Allowed.</span> ${last[1]} worked.`:`<span class="status-bad">Blocked by the ${LK[lock]}.</span> Even an Owner can't do this until the lock is removed.`):"Pick a lock, then try each action."}</div>
    <div class="rv-prog s-small">${tried.size} of 12 combinations tried</div>`;
    if(tried.size>=10)award("viz:lock",30,"Tested every resource lock")}
  el.addEventListener("click",e=>{const l=e.target.closest("[data-l]"),a=e.target.closest("[data-a]");if(l){lock=l.dataset.l;last=null}
    if(a){last=A.find(x=>x[0]===a.dataset.a);tried.add(lock+":"+last[0]);if(lock==="ro"&&last[2]===2)flag("lockedout")}if(l||a)draw()});draw();
}
function vizShell(){
  const el=$("#viz-shell");const run=new Set();let tab="bash";
  const C={bash:{"az group create --name rg-demo --location eastus":`{\n  "id": "/subscriptions/…/resourceGroups/rg-demo",\n  "location": "eastus",\n  "name": "rg-demo",\n  <span class="t-ok">"properties": { "provisioningState": "Succeeded" }</span>\n}`,
    "az vm list --output table":`Name       ResourceGroup    Location\n---------  ---------------  ----------\nvm-web01   RG-WEB           eastus\nvm-test01  RG-TEST          westeurope\n<span class="t-n"># Every VM in the subscription, as a table.</span>`,
    "az vm deallocate -g rg-test -n vm-test01":`<span class="t-ok">Succeeded</span>\n<span class="t-n"># Deallocated: compute billing stops. Disks are still billed.</span>`,
    "az storage account create -n stdemo4410 -g rg-demo --sku Standard_ZRS":`{\n  "name": "stdemo4410",\n  "kind": "StorageV2",\n  <span class="t-ok">"sku": { "name": "Standard_ZRS" }</span>,\n  "primaryEndpoints": { "blob": "https://stdemo4410.blob.core.windows.net/" }\n}`,
    "az lock create -n nodelete --lock-type CanNotDelete -g rg-prod":`{\n  "level": "CanNotDelete",\n  "name": "nodelete"\n}\n<span class="t-n"># Everything in rg-prod is now protected from deletion.</span>`},
   ps:{"New-AzResourceGroup -Name rg-demo -Location eastus":`ResourceGroupName : rg-demo\nLocation          : eastus\n<span class="t-ok">ProvisioningState : Succeeded</span>`,
    "Get-AzVM -Status | Select Name, PowerState":`Name       PowerState\n----       ----------\nvm-web01   <span class="t-ok">VM running</span>\nvm-test01  <span class="t-bad">VM deallocated</span>`,
    "Stop-AzVM -ResourceGroupName rg-web -Name vm-web01":`Virtual machine stopping operation\nThis cmdlet will stop the specified virtual machine. Continue? [Y] Yes\n<span class="t-ok">Status : Succeeded</span>\n<span class="t-n"># Stop-AzVM deallocates by default.</span>`,
    "Update-AzTag -ResourceId $vm.Id -Tag @{env='prod'} -Operation Merge":`Properties :\n  Name  Value\n  ====  =====\n  <span class="t-ok">env   prod</span>`,
    "Get-AzSubscription":`Name              Id                                    State\n----              --                                    -----\nContoso-Prod      0f3c…a91b                             Enabled\nContoso-Dev       7d21…44e0                             Enabled`}};
  const total=Object.keys(C.bash).length+Object.keys(C.ps).length;
  function draw(out){el.innerHTML=`<div class="viz-title">Cloud Shell lab: run each command (no typing needed)</div>
    <div class="seg-row"><button class="chip" data-t="bash" aria-pressed="${tab==="bash"}">Bash · Azure CLI</button><button class="chip" data-t="ps" aria-pressed="${tab==="ps"}">PowerShell · Az module</button></div>
    <div class="chips cmds">${Object.keys(C[tab]).map(c=>`<button class="chip mono ${run.has(c)?"seen":""}" data-c="${esc(c)}">${run.has(c)?"✓ ":""}${esc(c)}</button>`).join("")}</div>
    <pre class="term cli-o" aria-live="polite">${out||`<span class="t-n">${tab==="bash"?"Bash":"PowerShell"} in Cloud Shell. You're already signed in. Pick a command to run it.</span>`}</pre>
    <div class="rv-prog s-small">${run.size} of ${total} commands run</div>`;
    if(run.size===total){flag("collector");award("viz:shell",30,"Ran every Cloud Shell command")}}
  el.addEventListener("click",e=>{const t=e.target.closest("[data-t]"),b=e.target.closest("[data-c]");if(t){tab=t.dataset.t;draw()}
    if(b){const c=b.dataset.c;run.add(c);draw(`<span class="t-c">${tab==="bash"?"$":"PS /home/dana>"} ${esc(c)}</span>\n${C[tab][c]}`)}});draw();
}
function vizArc(){
  const el=$("#viz-arc");const on=new Set();
  const E=[["onprem","On-premises datacenter","3 Windows Server machines"],["aws","Amazon Web Services","2 Linux VMs"],["gcp","Google Cloud","1 Kubernetes cluster"],["edge","Retail store (edge)","SQL Server on a local server"]];
  function draw(){
    el.innerHTML=`<div class="viz-title">Bring everything under Azure management with Azure Arc</div>
    <div class="two-col"><div class="panel"><b>Outside Azure</b>${E.map(x=>`<div class="kv" style="margin:0;grid-template-columns:1fr auto"><span><b style="color:var(--fg)">${x[1]}</b><br>${x[2]}</span>${on.has(x[0])?'<span class="pill-good">Connected</span>':`<button class="btn" data-c="${x[0]}">Connect with Arc</button>`}</div>`).join("")}</div>
    <div class="panel ${on.size===4?"good":""}"><b>Azure portal: one view</b>${on.size?E.filter(x=>on.has(x[0])).map(x=>`<div class="dep new">${x[2]} · ${x[1]}</div>`).join(""):'<span class="s-small">Nothing connected yet</span>'}
    ${on.size?`<div class="dep-row">${["Azure Policy","RBAC","Tags","Azure Monitor","Defender for Cloud"].map(t=>`<span class="tag">${t}</span>`).join("")}</div>`:""}</div></div>
    <div class="caption" aria-live="polite">${on.size===4?"<span class=\"status-good\">Everything is in one place.</span> The same policies, access control, monitoring and security now apply across on-premises, other clouds and the edge.":"Connected resources appear in Azure as Arc-enabled resources, so you can govern them with the same tools."}</div>`;
    if(on.size===4)award("viz:arc",20,"Connected every environment with Azure Arc")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(b){on.add(b.dataset.c);draw()}});draw();
}
function vizArm(){
  const el=$("#viz-arm");const did=new Set();let deployed=false,sku="Standard_LRS",last=null;
  const tpl=hl=>`{
  <span class="k">"$schema"</span>: <span class="v">"…/deploymentTemplate.json#"</span>,
  <span class="k">"resources"</span>: [
    {
      <span class="k">"type"</span>: <span class="v">"Microsoft.Storage/storageAccounts"</span>,
      <span class="k">"name"</span>: <span class="v">"stshop4410"</span>,
      <span class="k">"location"</span>: <span class="v">"eastus"</span>,
      <span class="k">"sku"</span>: { <span class="k">"name"</span>: <span class="${hl?"hl":"v"}">"${sku}"</span> },
      <span class="k">"kind"</span>: <span class="v">"StorageV2"</span>
    },
    {
      <span class="k">"type"</span>: <span class="v">"Microsoft.Web/serverfarms"</span>,
      <span class="k">"name"</span>: <span class="v">"plan-shop"</span>,
      <span class="k">"sku"</span>: { <span class="k">"name"</span>: <span class="v">"P1v3"</span> }
    },
    {
      <span class="k">"type"</span>: <span class="v">"Microsoft.Web/sites"</span>,
      <span class="k">"name"</span>: <span class="v">"app-shop"</span>,
      <span class="k">"dependsOn"</span>: [ <span class="v">"plan-shop"</span> ]
    }
  ]
}`;
  function draw(){const R=[["stshop4410",last==="first"?"new":last==="edit"?"upd":"same"],["plan-shop",last==="first"?"new":"same"],["app-shop",last==="first"?"new":"same"]];
    el.innerHTML=`<div class="viz-title">Deploy an ARM template</div>
    <pre class="json">${tpl(last==="edit")}</pre>
    <div class="viz-controls"><button class="btn primary" data-a="deploy">${deployed?"Deploy again (unchanged)":"Deploy"}</button><button class="btn" data-a="edit" ${deployed?"":"disabled"}>Change sku to Standard_GRS and deploy</button></div>
    <div class="dep-row">${deployed?R.map(r=>`<span class="dep ${r[1]}">${r[0]} · ${r[1]==="new"?"created":r[1]==="upd"?"updated":"no change"}</span>`).join(""):'<span class="s-small">Nothing deployed yet</span>'}</div>
    <div class="caption" aria-live="polite">${!last?"The template declares what should exist. Azure Resource Manager works out how.":last==="first"?"ARM created all three. It deployed the storage account and the plan in parallel, and created app-shop after plan-shop because of dependsOn.":last==="again"?"<b>Idempotent.</b> The template matches what exists, so nothing changed. Run it 100 times and you get the same result.":"Only the storage account changed. ARM compares the template with what's deployed and updates just the difference."}</div>`;
    if(did.size===3)award("viz:arm",30,"Deployed, redeployed and updated a template")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="deploy"){last=deployed?"again":"first";deployed=true}if(a==="edit"){sku="Standard_GRS";last="edit"}did.add(last);draw()});draw();
}
function vizKql(){
  const el=$("#viz-kql");const run=new Set();
  const Q={"Heartbeat | summarize LastSeen = max(TimeGenerated) by Computer":`Computer      LastSeen\n------------  -------------------\nvm-web01      2026-11-09 18:41:02\nvm-test01     2026-11-09 18:40:57\n<span class="t-bad">srv-onprem3   2026-11-09 11:02:14</span>\n<span class="t-n"># An Arc server stopped sending heartbeats 7 hours ago.</span>`,
   "Perf | where CounterName == \"% Processor Time\" | summarize avg(CounterValue) by Computer":`Computer      avg_CounterValue\n------------  ----------------\n<span class="t-bad">vm-web01      91.4</span>\nvm-test01     12.8\n<span class="t-n"># vm-web01 is running hot. Time for an alert, or to scale out.</span>`,
   "AzureActivity | where OperationNameValue endswith \"DELETE\" | project TimeGenerated, Caller, Resource":`TimeGenerated         Caller              Resource\n--------------------  ------------------  ----------\n2026-11-09 09:12:44   dana@contoso.com    vm-old\n<span class="t-n"># The activity log records who deleted what, and when.</span>`,
   "AppRequests | where Success == false | summarize count() by Name":`Name                    count_\n----------------------  ------\n<span class="t-bad">POST /api/checkout      214</span>\nGET /api/products       3\n<span class="t-n"># Application Insights data: checkout is failing.</span>`};
  function draw(out){el.innerHTML=`<div class="viz-title">Log Analytics: run KQL queries</div>
    <div class="chips cmds">${Object.keys(Q).map((c,i)=>`<button class="chip mono" data-q="${i}">${run.has(c)?"✓ ":""}${esc(c)}</button>`).join("")}</div>
    <pre class="term cli-o" aria-live="polite">${out||'<span class="t-n">Pick a query to run it against the workspace.</span>'}</pre><div class="rv-prog s-small">${run.size} of 4 queries run</div>`;
    if(run.size===4)award("viz:kql",20,"Ran every Log Analytics query")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(!b)return;const c=Object.keys(Q)[+b.dataset.q];run.add(c);draw(`<span class="t-c">${esc(c)}</span>\n\n${Q[c]}`)});draw();
}
function vizAlert(){
  const el=$("#viz-alert");const seen=new Set();let th=85,act="email";
  const D=[34,38,41,45,52,61,72,88,93,79,66,58,55,60,74,91,96,84,63,48,42,39,36,33];
  const AC={email:"Email the on-call engineer",sms:"Text message and voice call",auto:"Run automation to scale out"};
  el.innerHTML=`<div class="viz-title">Build a metric alert: CPU percentage on vm-web01</div>
    <div class="rng-row"><span>Alert when CPU &gt;</span><input type="range" min="50" max="100" step="1" value="${th}" data-k="th" aria-label="CPU threshold"><b data-o="th"></b></div>
    <div class="sel-row"><span>Action group</span><div class="seg-row" data-g>${Object.keys(AC).map(k=>`<button class="chip" data-a="${k}">${AC[k]}</button>`).join("")}</div></div><div class="out"></div>`;
  function draw(){$('[data-o="th"]',el).textContent=th+"%";el.querySelectorAll("[data-a]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.a===act));
    const W=560,H=170,x=i=>30+i*(W-40)/23,y=v=>H-20-v*1.4;const fires=D.map((v,i)=>v>th?i:-1).filter(i=>i>=0);seen.add(fires.length?"fire":"quiet");
    $(".out",el).innerHTML=`<div class="viz-scroll"><svg viewBox="0 0 ${W} ${H}" style="min-width:400px" role="img" aria-label="CPU over 24 hours with alert threshold">
      <line x1="30" y1="${H-20}" x2="${W-10}" y2="${H-20}" class="ax-l"/><polyline class="ln-a" points="${D.map((v,i)=>`${x(i)},${y(v)}`).join(" ")}"/>
      <line x1="30" y1="${y(th)}" x2="${W-10}" y2="${y(th)}" class="thr"/><text x="${W-12}" y="${y(th)-6}" text-anchor="end" class="chart-l">threshold ${th}%</text>
      ${fires.map(i=>`<circle class="fire" cx="${x(i)}" cy="${y(D[i])}" r="5"/>`).join("")}
      ${[0,6,12,18,23].map(i=>`<text x="${x(i)}" y="${H-4}" text-anchor="middle" class="chart-l">${i}:00</text>`).join("")}</svg></div>
    <div class="caption" aria-live="polite">${fires.length?`<span class="status-bad">The alert fires ${fires.length} time${fires.length>1?"s":""} today</span>, and each time the action group will: <b>${AC[act]}</b>.`:"<span class=\"status-good\">Quiet.</span> CPU never crosses the threshold. Set it too high and you'd miss real problems."}</div>`;
    if(seen.size===2)award("viz:alert",20,"Tuned a metric alert")}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="th"){th=+e.target.value;draw()}});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b){act=b.dataset.a;draw()}});draw();
}

registerModule({
  id:"gov",slug:"governance",title:"Azure Management and Governance",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["costdrv","costq","calc","calcsort","budget","tags","purview","policy","lock","govsort","shell","clisort","arc","armflow","arm","advisor","health","kql","alert","monsort"],
  viz(){
vizCostdrv();
quizViz($("#viz-costq"),{title:"Why is the bill higher?",done:"Diagnosed every cost surprise",qs:[
  ["The bill shows a disk and public IP for a VM deleted last month.",["Maintenance: orphaned resources keep billing","Geography","Ingress traffic"],0,"Delete leftover disks, NICs and IPs."],
  ["The same app costs 30% more in São Paulo than in Virginia.",["Geography: prices vary by region","Subscription type","Tags"],0,"Regional pricing differs."],
  ["A video site's bill jumped after a viral clip was downloaded millions of times.",["Network egress","Ingress","Resource locks"],0,"Data leaving Azure is billed."],
  ["An always-on database costs much more than a colleague's identical one.",["They used pay-as-you-go; the colleague has a reservation","Region pairs","Azure Advisor"],0,"Consumption choices change the price."],
  ["A third-party firewall appears on the Azure invoice.",["Azure Marketplace","Ingress","Azure Policy"],0,"Marketplace purchases are billed through Azure."]]});
vizCalc();
sortViz($("#viz-calcsort"),{title:"Pricing calculator or TCO calculator?",bins:{pc:"Pricing calculator",tco:"TCO calculator"},
  items:[["Estimate next month's cost for 4 VMs and a SQL database in Azure","pc","Estimating Azure resources."],["Compare our datacenter's power, cooling and labor costs with Azure","tco","On-premises vs Azure."],["Pick a region and VM size to see the hourly price","pc","Configuring Azure services."],["Build a business case for migrating 200 servers","tco","Total cost of ownership."],["Add a support plan to an estimate","pc","Support options are in the pricing calculator."],["Adjust assumptions for electricity and IT staff salaries","tco","Those are on-premises costs."]],done:"Matched every calculator task"});
vizBudget();vizTags();
stepViz($("#viz-purview"),{title:"Microsoft Purview: from scattered data to governed data",done:"Walked through Purview",steps:[
  ["Register sources","Point Purview at Azure SQL Database, Azure Data Lake, Amazon S3, on-premises SQL Server and Power BI."],
  ["Scan","Purview scans each source and builds a <b>data map</b> of what exists and where."],
  ["Classify","It automatically labels sensitive data, such as credit card numbers and national ID numbers."],
  ["Track lineage","It shows where data came from and how it flowed into reports."],
  ["Discover","Analysts search the catalog for trusted data instead of asking around."],
  ["Protect and comply","Risk and compliance tools protect sensitive data in Microsoft 365 and track regulatory requirements."]],
  end:"One unified view of data across on-premises, multicloud and SaaS."});
vizPolicy();vizLock();
sortViz($("#viz-govsort"),{title:"Which governance tool?",bins:{pol:"Azure Policy",lock:"Resource locks",rbac:"Azure RBAC",tags:"Tags",pur:"Microsoft Purview"},
  items:[["Only allow resources in approved regions","pol","Policy controls what can be deployed."],["Stop anyone, even Owners, from deleting the production database","lock","A Delete lock."],["Let the help desk restart VMs but not delete them","rbac","A role controls who can do what."],["Report costs by department","tags","Name/value metadata."],["Find and classify personal data across Azure and Amazon S3","pur","Data governance."],["Make every resource carry a costcenter tag","pol","Policy can require tags."],["Make a configuration impossible to change until the lock is removed","lock","A ReadOnly lock."]],done:"Matched every governance tool"});
vizShell();
sortViz($("#viz-clisort"),{title:"Azure CLI or Azure PowerShell?",bins:{cli:"Azure CLI",ps:"Azure PowerShell"},
  items:[["az vm create","cli","CLI commands start with az."],["New-AzVM","ps","Verb-noun cmdlets."],["az storage account list","cli","CLI."],["Get-AzResourceGroup","ps","PowerShell."],["az group delete --name rg-old","cli","CLI."],["Remove-AzResourceGroup -Name rg-old","ps","PowerShell."]],done:"Sorted every command",end:"Both run on Windows, macOS and Linux, and both are built into Cloud Shell."});
vizArc();
stepViz($("#viz-armflow"),{title:"Every request goes through Azure Resource Manager",done:"Followed a request through ARM",steps:[
  ["You send a request","From the portal, Azure CLI, PowerShell, a REST API or an SDK. The tool doesn't matter."],
  ["ARM receives it","Every request lands at the same management layer."],
  ["Authenticate","ARM checks who you are with Microsoft Entra ID."],
  ["Authorize","ARM checks your RBAC roles, then Azure Policy and resource locks."],
  ["Resource provider","ARM hands the request to the right service, such as Microsoft.Compute for VMs."],
  ["Consistent result","Because every tool goes through ARM, you get the same result whichever one you use."]]});
vizArm();
sortViz($("#viz-advisor"),{title:"Which Azure Advisor category?",bins:{rel:"Reliability",sec:"Security",perf:"Performance",ops:"Operational excellence",cost:"Cost"},
  items:[["Resize or shut down underused VMs","cost","Saves money."],["Buy reservations for always-on VMs","cost","Saves money."],["Add a second VM to an availability set","rel","Keeps the app running."],["Enable MFA for subscription owners","sec","From Defender for Cloud."],["Upgrade to premium disks to cut latency","perf","Faster apps."],["Create Service Health alerts and use tags for automation","ops","Process and manageability."],["Turn on soft delete for storage to recover from mistakes","rel","Recoverability."]],done:"Sorted every Advisor recommendation"});
sortViz($("#viz-health"),{title:"Azure status, Service Health or Resource Health?",bins:{st:"Azure status",sh:"Service Health",rh:"Resource Health"},
  items:[["Is there an outage anywhere in Azure right now?","st","The global, public view."],["Planned maintenance next week for the regions we use","sh","Personalized to your services and regions."],["Is my vm-web01 unavailable because of a platform problem?","rh","One specific resource."],["Health advisories about features we use being retired","sh","Personalized notices."],["Set an alert for service issues affecting our subscriptions","sh","Service Health alerts."],["Review the history of one storage account's availability","rh","Per-resource health history."]],done:"Matched every health view"});
vizKql();vizAlert();
sortViz($("#viz-monsort"),{title:"Which monitoring tool?",bins:{mon:"Azure Monitor alerts",la:"Log Analytics",ai:"Application Insights",adv:"Azure Advisor"},
  items:[["Text the on-call engineer when CPU is over 90%","mon","An alert with an action group."],["Query the last 24 hours of sign-in logs with KQL","la","Log Analytics."],["See which API call makes the web app slow","ai","Application performance monitoring."],["Check from five cities that the site is up","ai","Availability tests."],["Get recommendations to cut costs","adv","Advisor's cost category."],["Notify when someone deletes a resource","mon","An activity log alert."],["Count failed requests by page","ai","Application Insights telemetry (query it in Log Analytics)."]],done:"Matched every monitoring tool"});
  },
  sims:[
    {id:"govsim",type:"match",title:"Govern Contoso's subscription",
      scenario:"Contoso's cloud team has five governance requirements. Match each one to the right tool.",
      items:[["Azure Policy","pol"],["Resource lock","lock"],["Tags","tags"],["Azure RBAC","rbac"],["Microsoft Purview","pur"]],
      slots:[["pol","Regions","Block any resource created outside East US and West Europe"],["lock","Protection","Make sure no one can delete the production resource group by accident"],["tags","Chargeback","Report monthly costs by cost center"],["rbac","Access","Let the database team manage only the data resource group"],["pur","Data","Classify sensitive customer data across Azure and on-premises SQL Server"]],
      success:"Every requirement has a tool that enforces it."},
    {id:"lockpol",type:"choice",title:"Locks and policies in practice",
      scenario:"You're the Azure administrator for a hospital. Answer each request from the team.",
      steps:[
        ["The records database must never be deleted, but its settings still need tuning.",["Delete (CanNotDelete) lock","ReadOnly lock","Reader role for everyone"],0,"Delete locks allow changes but block deletion."],
        ["An Owner tries to delete a resource with a Delete lock. What happens?",["It's blocked until the lock is removed","It's deleted because Owners can do anything","It's moved to the recycle bin"],0,"Locks apply to everyone."],
        ["Compliance wants a report of every resource missing an encryption setting, without blocking anyone yet.",["Azure Policy with the Audit effect","Azure Policy with the Deny effect","A ReadOnly lock"],0,"Audit reports without blocking."],
        ["Next month, non-compliant resources must be blocked outright.",["Switch the policy effect to Deny","Add more tags","Use Azure Advisor"],0,"Deny prevents non-compliant deployments."],
        ["The policy must cover every subscription the hospital owns.",["Assign it at the management group above them","Assign it to each VM","Create a resource group"],0,"Policies are inherited downward."],
        ["Finance wants costs split by department, but tags on resource groups aren't showing on resources.",["Tags aren't inherited; use a policy to inherit or require them","Delete the resource groups","Use a ReadOnly lock"],0,"Policy can copy tags from resource groups."]],
      success:"Protected, compliant and reportable."},
    {id:"toolsim",type:"match",title:"Pick the management tool",
      scenario:"Match each task to the best Azure management or deployment tool.",
      items:[["Azure portal","portal"],["Azure Cloud Shell","shell"],["Azure CLI","cli"],["Azure PowerShell","ps"],["ARM template or Bicep","arm"],["Azure Arc","arc"]],
      slots:[["portal","New admin","Build a custom dashboard by clicking through a web console"],["shell","Borrowed laptop","Run commands from a browser with nothing installed"],["cli","Linux team","Script deployments in Bash with az commands"],["ps","Windows team","Automate tasks with verb-noun cmdlets like New-AzVM"],["arm","Platform team","Deploy identical dev, test and production environments from a declarative file"],["arc","Hybrid team","Apply Azure Policy to servers in their own datacenter and in AWS"]],
      success:"The right tool for each person and task."},
    {id:"monsim",type:"match",title:"Answer the on-call questions",
      scenario:"It's your week on call. Match each question to the tool that answers it.",
      items:[["Azure Advisor","adv"],["Azure Service Health","sh"],["Resource Health","rh"],["Log Analytics","la"],["Application Insights","ai"],["Azure Monitor alerts","al"]],
      slots:[["adv","Manager","Where can we save money and improve reliability?"],["sh","Team lead","Is Microsoft doing maintenance in our regions this weekend?"],["rh","Support ticket","Is this one VM down because of an Azure platform issue?"],["la","Security analyst","Who signed in from outside the country yesterday? (KQL query)"],["ai","Developer","Why is the checkout page slow, and which dependency is failing?"],["al","Operations","Page me automatically if disk space drops below 10%"]],
      success:"Every question went to the right tool."},
    {id:"costsim",type:"check",title:"Cut the monthly bill",
      scenario:"Contoso's Azure bill grew 40% this quarter. Select every action that would actually reduce it.",
      opts:[["Deallocate dev VMs at night and on weekends",1],["Buy reservations for the always-on production VMs",1],["Delete disks and public IPs left behind by deleted VMs",1],["Apply Azure Hybrid Benefit using existing Windows Server licenses",1],["Move rarely read logs from the hot tier to cool or archive",1],["Act on Azure Advisor cost recommendations",1],["Shut down VMs from inside Windows but leave them allocated",0],["Add more tags to every resource",0],["Move all workloads to a more expensive region",0]],
      success:"Real savings come from deallocating, reserving, cleaning up and right-sizing."}
  ],
  badges:[
    ["reader","GV","Governor","Mark all 12 management and governance lessons studied",c=>c.allStudied()],
    ["lab","OL","Operations Lab","Complete all 20 diagrams in this module",c=>c.vizAll()],
    ["costdrv","$","Cost Detective","Explore every factor in the VM cost explorer",c=>c.earned("viz:costdrv")],
    ["policy","PL","Policy Maker","See Deny and Audit in the Azure Policy lab",c=>c.earned("viz:policy")],
    ["lock","LK","Lock Smith","Test the resource locks with every action",c=>c.earned("viz:lock")],
    ["shell","CS","Shell Scripter","Run every command in the Cloud Shell lab",c=>c.earned("viz:shell")],
    ["arm","IaC","Idempotent","Deploy, redeploy and update an ARM template",c=>c.earned("viz:arm")],
    ["govsim","GD","Guardrails","Pass the governance simulation",c=>c.passed("govsim")],
    ["lockpol","CP","Compliance Pro","Pass the locks and policies simulation",c=>c.passed("lockpol")],
    ["toolsim","TB","Toolbox","Pass the management tool simulation",c=>c.passed("toolsim")],
    ["monsim","OC","On Call","Pass the monitoring simulation",c=>c.passed("monsim")],
    ["costsim","CO","Cost Optimizer","Pass the cost-cutting simulation",c=>c.passed("costsim")],
    ["perfect","G+","Fully Governed","Score 100% on a governance quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
