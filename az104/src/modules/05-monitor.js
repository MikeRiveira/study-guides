/* ================= Module 5: Monitor and Maintain Azure Resources (AZ-104 Domain 5, 10–15%) ================= */
(function(){
const LESSONS=[
{id:"monitor",num:"5.1",title:"Azure Monitor: metrics, logs and data sources",html:`
<p><b>Azure Monitor</b> collects, analyzes and acts on telemetry from Azure, other clouds and on-premises. Everything it collects is one of two data types:</p>
<div class="viz" id="viz-mvl"></div>
<ul><li><b>Metrics</b>: numbers sampled at regular intervals (CPU %, requests per second). Lightweight, near real-time, kept <b>93 days</b>, viewed in <b>Metrics explorer</b>. Platform metrics are collected automatically for every resource.</li>
<li><b>Logs</b>: records with many properties (events, traces, performance counters). Stored in a <b>Log Analytics workspace</b> and queried with <b>KQL</b>.</li></ul>
<h3>Where the data comes from</h3>
<ul><li><b>Activity log</b>: subscription-level record of every management operation (who deleted that VM?), service health and Azure Advisor events. Kept 90 days; send it to a workspace to keep it longer and query it.</li>
<li><b>Resource logs</b> (platform logs from inside a resource, like Key Vault access or storage reads): <b>not collected</b> until you create a <b>diagnostic setting</b>.</li>
<li><b>Diagnostic settings</b> route resource logs and metrics to a <b>Log Analytics workspace</b> (query and alert), a <b>storage account</b> (cheap archive), an <b>event hub</b> (stream to a SIEM or third-party tool) or a partner solution. Up to 5 per resource.</li>
<li><b>Guest OS data</b> (event logs, syslog, performance counters inside a VM): needs the <b>Azure Monitor Agent</b> (AMA) and a <b>data collection rule</b> (DCR) that says what to collect and where to send it. AMA replaces the retired Log Analytics agent.</li>
<li><b>Application Insights</b>: application performance monitoring for code.</li></ul>
<div class="viz" id="viz-route"></div>
<h3>Log Analytics workspaces</h3>
<p>A workspace has a region, a pricing tier (pay-as-you-go per GB, or commitment tiers), and <b>retention</b>: interactive retention from 30 days (31 for some tables, free) up to 2 years, plus long-term archive up to 12 years. Access is controlled with workspace or table-level RBAC (Log Analytics Reader, Log Analytics Contributor). Most organizations need just a few workspaces.</p>`},
{id:"kql",num:"5.2",title:"Querying logs with KQL",html:`
<p><b>Kusto Query Language</b> (KQL) reads like a pipeline: start with a <b>table</b>, then pipe (<code>|</code>) it through operators, each working on the output of the previous one.</p>
<pre class="json">Perf
| where TimeGenerated &gt; ago(1h)
| where CounterName == "% Processor Time"
| summarize avg(CounterValue) by Computer
| order by avg_CounterValue desc
| take 5</pre>
<ul><li><code>where</code> filters rows (<code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>contains</code>, <code>has</code>, <code>startswith</code>, <code>in</code>, <code>and</code>, <code>or</code>).</li>
<li><code>project</code> picks columns; <code>extend</code> adds calculated columns.</li>
<li><code>summarize</code> aggregates: <code>count()</code>, <code>avg()</code>, <code>sum()</code>, <code>max()</code>, <code>dcount()</code>, grouped <code>by</code> columns or time buckets with <code>bin(TimeGenerated, 1h)</code>.</li>
<li><code>order by</code> / <code>sort by</code>, <code>take</code> / <code>limit</code>, <code>top 10 by</code>, <code>count</code>.</li>
<li><code>render timechart</code> draws a chart; <code>join</code> combines tables.</li>
<li>Common tables: <b>Heartbeat</b> (agent check-ins), <b>Perf</b>, <b>Event</b> (Windows), <b>Syslog</b> (Linux), <b>AzureActivity</b>, <b>AzureDiagnostics</b>, <b>InsightsMetrics</b>.</li></ul>
<div class="viz" id="viz-kql"></div>
<div class="viz" id="viz-kqlorder"></div>`},
{id:"alerts",num:"5.3",title:"Alerts and action groups",html:`
<p>An <b>alert rule</b> watches a signal and fires when a condition is met. Its parts:</p>
<div class="viz" id="viz-alertparts"></div>
<h3>Alert rule types</h3>
<ul><li><b>Metric alerts</b>: evaluate a metric every <b>frequency</b> over a <b>window</b> (for example average CPU &gt; 80% over 5 minutes, checked every minute). Static or <b>dynamic thresholds</b> (machine-learned). <b>Stateful</b>: they fire once and auto-resolve when the condition clears.</li>
<li><b>Log search alerts</b>: run a KQL query on a schedule and fire on the number of results or a measured value.</li>
<li><b>Activity log alerts</b>: fire on a management event (a VM deleted, a policy assignment created) or a <b>Service Health</b> or <b>Resource Health</b> event.</li>
<li><b>Smart detection</b> (Application Insights) and Prometheus alerts.</li></ul>
<p><b>Severity</b> goes from <b>Sev 0 (Critical)</b> to <b>Sev 4 (Verbose)</b>.</p>
<div class="viz" id="viz-alertsim"></div>
<h3>Action groups and processing rules</h3>
<p>An <b>action group</b> is a reusable list of <b>notifications</b> (email, SMS, push to the Azure mobile app, voice) and <b>actions</b> (Automation runbook, Azure Function, Logic App, webhook, ITSM, Event Hubs). Its <b>short name</b> (up to 12 characters) appears in SMS and emails. One action group can serve many alert rules.</p>
<p><b>Alert processing rules</b> change fired alerts: <b>suppress</b> notifications during a maintenance window, or <b>add</b> an action group to every alert in a scope, without editing each rule.</p>
<div class="viz" id="viz-alertpick"></div>`},
{id:"insights",num:"5.4",title:"Insights, Service Health and Advisor",html:`
<p>Azure Monitor includes ready-made experiences called <b>insights</b>:</p>
<ul><li><b>VM insights</b>: performance charts and a <b>dependency map</b> of processes and connections for VMs and scale sets. Uses the Azure Monitor Agent and a data collection rule; data goes to a Log Analytics workspace (InsightsMetrics table).</li>
<li><b>Storage insights</b>, <b>Network insights</b>, <b>Container insights</b> (AKS), <b>Key Vault insights</b> and others: pre-built workbooks over metrics and logs.</li>
<li><b>Workbooks</b>: interactive reports combining text, KQL queries, metrics and parameters. <b>Dashboards</b> pin charts for an at-a-glance view.</li></ul>
<h3>Health and recommendations</h3>
<ul><li><b>Azure Service Health</b>: outages, planned maintenance and health advisories for the services and regions <b>you use</b>. Create Service Health alerts to hear about them.</li>
<li><b>Resource Health</b>: is <b>your</b> specific resource available right now, and was a past problem caused by Azure?</li>
<li><b>Azure Status</b> page: global status of all Azure services.</li>
<li><b>Azure Advisor</b>: personalized recommendations in five categories: <b>Reliability</b>, <b>Security</b>, <b>Performance</b>, <b>Cost</b> and <b>Operational excellence</b>.</li></ul>
<div class="viz" id="viz-healthpick"></div>
<div class="viz" id="viz-mondrill"></div>`},
{id:"backup",num:"5.5",title:"Azure Backup: vaults and policies",html:`
<p><b>Azure Backup</b> protects VMs, files and folders, SQL Server and SAP HANA in VMs, Azure Files, blobs, disks and more, with backups stored in a <b>vault</b>.</p>
<h3>Two kinds of vault</h3>
<ul><li><b>Recovery Services vault</b>: Azure VMs, SQL/SAP HANA in VMs, Azure Files, on-premises (MARS agent, MABS/DPM), and <b>Azure Site Recovery</b>.</li>
<li><b>Backup vault</b>: newer workloads such as Azure Blobs, Azure Disks, Azure Database for PostgreSQL and AKS.</li>
<li><b>Backup center</b> (and Business Continuity Center) manages all vaults in one place.</li></ul>
<p>A vault must be in the <b>same region</b> as the resources it protects, and a VM can be protected by only <b>one vault</b>. Set the vault's <b>storage redundancy</b> (LRS, ZRS or GRS, default GRS) and <b>Cross Region Restore</b> (needs GRS) <b>before</b> you protect anything: redundancy can't change after items are protected.</p>
<div class="viz" id="viz-vaultpick"></div>
<h3>Backup policies</h3>
<ul><li><b>Schedule</b>: daily or weekly (Standard policy), or every few hours (Enhanced policy, which also supports Trusted Launch VMs).</li>
<li><b>Retention</b>: daily, weekly, monthly and yearly points (up to 99 years).</li>
<li><b>Instant restore</b>: snapshots kept 1–5 days (Standard) or up to 30 (Enhanced) for fast restores before data moves to the vault tier.</li>
<li>VM backups are <b>application-consistent</b> on Windows (VSS) and file-system consistent on Linux unless you add pre/post scripts.</li>
<li><b>Backup now</b> creates an on-demand point with its own retention.</li></ul>
<div class="viz" id="viz-retention"></div>
<h3>Protecting backups</h3>
<p><b>Soft delete</b> keeps deleted backup data for <b>14 days</b> at no cost (enhanced soft delete can keep it longer and can be made always-on). <b>Immutable vaults</b>, <b>multi-user authorization</b> (Resource Guard) and <b>Backup reports</b> add protection and visibility. Watch <b>backup jobs</b> and set up alerts for failures.</p>`},
{id:"restore",num:"5.6",title:"Restoring from backup",html:`
<p>When you restore an Azure VM from a <b>recovery point</b>, you choose how:</p>
<div class="viz" id="viz-restorepick"></div>
<ul><li><b>Create a new VM</b>: quick, in the same region (or the paired region with Cross Region Restore).</li>
<li><b>Restore disks</b>: disks restored to a resource group, plus a template to build a customized VM (for example a different size or network). Needs a <b>staging storage account</b> in the same region, not Premium.</li>
<li><b>Replace existing</b>: swap the VM's disks with the recovery point's disks; the current disk is kept as a snapshot.</li>
<li><b>File recovery</b> (item-level restore): mount the recovery point as drives with a script and copy individual files.</li>
<li><b>Cross Region Restore</b>: restore in the secondary paired region, even when the primary is fine (needs a GRS vault with CRR on).</li></ul>
<p>Restores from an <b>instant restore snapshot</b> are much faster than from the vault tier. Azure Files backups support restoring a whole share or individual files, to the original or an alternate location. To <b>stop protection</b>, choose to keep or delete backup data; deleted data goes into soft delete first.</p>
<div class="viz" id="viz-restoreflow"></div>`},
{id:"asr",num:"5.7",title:"Azure Site Recovery",html:`
<p><b>Azure Site Recovery</b> (ASR) is disaster recovery: it continuously <b>replicates</b> VMs to another region (or from on-premises to Azure) so you can <b>fail over</b> when the primary site is down. Backup restores data from a point in time; Site Recovery keeps a whole workload running somewhere else.</p>
<div class="viz" id="viz-bvsr"></div>
<ul><li>Uses a <b>Recovery Services vault</b> in the <b>target</b> region (not the source region).</li>
<li><b>Replication policy</b>: how long to keep recovery points and how often to take app-consistent snapshots. Crash-consistent points are taken every few minutes.</li>
<li><b>RPO</b> (recovery point objective): how much data you can lose. <b>RTO</b> (recovery time objective): how long recovery may take.</li>
<li><b>Test failover</b> brings VMs up in an isolated VNet without disrupting replication. Do it regularly, then <b>clean up</b>.</li>
<li><b>Failover</b> (unplanned or planned) → <b>commit</b> → <b>re-protect</b> (replicate back) → <b>fail back</b> when the primary is healthy.</li>
<li><b>Recovery plans</b> group VMs into ordered boot groups with scripts and manual steps, for example database first, then app tier, then web tier.</li>
<li>Network mapping, target resource groups and availability options (zones, sets) are configured per VM.</li></ul>
<div class="viz" id="viz-asrflow"></div>
<div class="viz" id="viz-rporto"></div>`}
];

const G={
 mon:[["Two types of Azure Monitor data","Metrics and logs"],["Metrics retention","93 days"],["Where are logs stored?","Log Analytics workspace"],["Activity log","Subscription-level management operations and health events"],["Activity log retention","90 days (send to a workspace to keep longer)"],["Are resource logs collected by default?","No; create a diagnostic setting"],["Diagnostic setting destinations","Log Analytics, storage account, event hub, partner"],["Stream logs to a SIEM","Event hub"],["Cheapest long-term log archive","Storage account"],["Diagnostic settings per resource","Up to 5"],["Collect guest OS logs from a VM","Azure Monitor Agent + data collection rule"],["Data collection rule","Defines what AMA collects and where it sends it"],["Workspace interactive retention","30 days to 2 years"],["Long-term log archive","Up to 12 years"]],
 kql:[["KQL pipe operator","| passes rows to the next operator"],["Filter rows","where"],["Choose columns","project"],["Add a calculated column","extend"],["Aggregate","summarize ... by ..."],["Group by hour","bin(TimeGenerated, 1h)"],["Last hour","where TimeGenerated > ago(1h)"],["Count distinct","dcount()"],["First N rows","take or limit"],["Top 5 by a column","top 5 by Column desc"],["Draw a chart","render timechart"],["Table for agent check-ins","Heartbeat"],["Table for performance counters","Perf"],["Linux system logs table","Syslog"],["Windows event table","Event"],["Management operations table","AzureActivity"]],
 alert:[["Alert rule parts","Scope, condition, actions, details (severity, name)"],["Severity scale","Sev 0 Critical to Sev 4 Verbose"],["Metric alert evaluation","Every frequency, over a window"],["Can frequency exceed window size?","No"],["Dynamic thresholds","Machine-learned thresholds"],["Stateful alert","Fires once, resolves when the condition clears"],["Alert on a VM being deleted","Activity log alert"],["Alert on an Azure outage in your region","Service Health alert"],["Alert from a KQL query","Log search alert"],["Action group","Notifications and actions reused by alert rules"],["Action group short name limit","12 characters"],["Action types","Runbook, Function, Logic App, webhook, ITSM, Event Hubs"],["Suppress alerts during maintenance","Alert processing rule"],["VM insights dependency map","Shows processes and connections"],["Service Health vs Resource Health","Services and regions you use vs one specific resource"],["Azure Advisor categories","Reliability, Security, Performance, Cost, Operational excellence"]],
 bk:[["Vault for Azure VM backup","Recovery Services vault"],["Vault for blobs, disks, PostgreSQL","Backup vault"],["Vault region rule","Same region as the protected resource"],["Vaults per VM","One"],["Default vault redundancy","GRS"],["Change vault redundancy after protecting items?","No"],["Cross Region Restore needs","GRS vault"],["Enhanced policy","Hourly backups, Trusted Launch support"],["Instant restore snapshot retention","1–5 days (Standard), up to 30 (Enhanced)"],["Backup soft delete","14 days, no cost"],["Restore options for a VM","Create VM, restore disks, replace existing, file recovery"],["Staging account for restore disks","Same region, not Premium"],["Item-level file restore","File recovery script mounts the recovery point"],["Protect backups from rogue admins","Multi-user authorization (Resource Guard), immutable vault"],["Site Recovery purpose","Replicate and fail over workloads (DR)"],["ASR vault location","Target (secondary) region"],["RPO","Maximum acceptable data loss"],["RTO","Maximum acceptable downtime"],["Test failover","Failover into an isolated network without disrupting replication"],["After failover, before failback","Commit, then re-protect"],["Recovery plan","Ordered groups of VMs with scripts for failover"]]
};
const DECKS=[["mon","Azure Monitor data"],["kql","KQL"],["alert","Alerts and insights"],["bk","Backup and Site Recovery"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which Azure Monitor data type is a numeric value sampled at regular intervals?",o:["Metrics","Logs","Traces","Events"],a:0,e:"Metrics are lightweight and near real time."},
 {q:"How long are platform metrics kept?",o:["93 days","30 days","1 year","7 days"],a:0,e:"Send them to a workspace to keep longer."},
 {q:"Who deleted a VM yesterday? Where do you look?",o:["Activity log","Metrics explorer","VM insights","Boot diagnostics"],a:0,e:"Management operations are in the activity log."},
 {q:"You need Key Vault access logs for 1 year. What do you configure first?",o:["A diagnostic setting sending logs to a workspace or storage","An action group","A metric alert","VM insights"],a:0,e:"Resource logs aren't collected by default."},
 {q:"Security wants Azure resource logs streamed to a third-party SIEM. Which destination?",o:["Event hub","Storage account","Log Analytics only","Activity log"],a:0,e:"Event hubs stream data out."},
 {q:"Compliance requires keeping raw logs 7 years at the lowest cost. Which destination?",o:["Storage account","Event hub","Metrics explorer","Dashboard"],a:0,e:"Or workspace long-term archive."},
 {q:"You need Windows event logs from inside 50 VMs in a workspace. What do you deploy?",o:["Azure Monitor Agent with a data collection rule","A diagnostic setting on each VM","Network Watcher","Boot diagnostics"],a:0,e:"Guest data needs the agent."},
 {q:"What defines which performance counters the Azure Monitor Agent collects?",o:["A data collection rule","An action group","A workbook","A policy initiative"],a:0,e:"DCRs say what and where."},
 {q:"How long is the activity log kept without exporting it?",o:["90 days","30 days","1 year","Forever"],a:0,e:"Export to a workspace for more."},
 {q:"Which query language does Log Analytics use?",o:["KQL","SQL","PowerShell","JMESPath"],a:0,e:"Kusto Query Language."},
 {q:"Which KQL operator filters rows?",o:["where","project","summarize","extend"],a:0,e:"project picks columns."},
 {q:"Which query counts heartbeats per computer?",o:["Heartbeat | summarize count() by Computer","Heartbeat | project count() by Computer","Heartbeat | where count() by Computer","summarize Heartbeat by Computer"],a:0,e:"summarize with by."},
 {q:"How do you group results into hourly buckets?",o:["summarize ... by bin(TimeGenerated, 1h)","where TimeGenerated == 1h","project bin(1h)","take 1h"],a:0,e:"bin rounds times down."},
 {q:"Which clause limits results to the last 24 hours?",o:["where TimeGenerated > ago(24h)","where TimeGenerated < ago(24h)","take 24h","project ago(24h)"],a:0,e:"Greater than 24 hours ago."},
 {q:"Which table shows when an agent last checked in?",o:["Heartbeat","Perf","AzureActivity","Syslog"],a:0,e:"Find VMs that stopped reporting."},
 {q:"Which KQL operator adds a calculated column?",o:["extend","project-away","summarize","order"],a:0,e:"extend keeps existing columns."},
 {q:"An alert must fire when average CPU on a VM is above 85% for 15 minutes. Which alert type?",o:["Metric alert","Activity log alert","Service Health alert","Budget alert"],a:0,e:"Window 15 minutes, aggregation average."},
 {q:"A metric alert has window size 5 minutes. Which evaluation frequency is NOT allowed?",o:["15 minutes","1 minute","5 minutes","All are allowed"],a:0,e:"Frequency can't be longer than the window."},
 {q:"You must be notified when anyone deletes a VM in the subscription. Which alert?",o:["Activity log alert on Microsoft.Compute/virtualMachines/delete","Metric alert on CPU","Log search alert on Perf","Budget alert"],a:0,e:"Administrative category."},
 {q:"You want an email when Azure has an outage affecting your regions. What do you create?",o:["A Service Health alert","A metric alert","A diagnostic setting","An Advisor alert"],a:0,e:"Service Health covers services you use."},
 {q:"Which severity is most critical?",o:["Sev 0","Sev 4","Sev 1","Sev 2"],a:0,e:"0 Critical, 1 Error, 2 Warning, 3 Informational, 4 Verbose."},
 {q:"Ten alert rules must all email the on-call team and run a runbook. What's the simplest setup?",o:["One action group used by all ten rules","Ten action groups","Ten workbooks","One diagnostic setting"],a:0,e:"Action groups are reusable."},
 {q:"Which action automatically restarts a service when an alert fires?",o:["An Automation runbook (or Function/Logic App) in the action group","An email notification","A severity change","A dashboard"],a:0,e:"Actions run automation."},
 {q:"Notifications must stop during Saturday's maintenance window without disabling alert rules. What do you use?",o:["An alert processing rule that suppresses notifications","Delete the action group","A Delete lock","Lower the severity"],a:0,e:"Schedule-based suppression."},
 {q:"Creating an action group fails: short name too long. What's the limit?",o:["12 characters","64 characters","8 characters","24 characters"],a:0,e:"It appears in SMS messages."},
 {q:"An alert should fire on more than 20 failed sign-ins in a KQL result within 10 minutes. Which alert type?",o:["Log search alert","Metric alert","Activity log alert","Smart detection"],a:0,e:"Query on a schedule."},
 {q:"Which feature learns a metric's normal pattern so you don't pick a fixed threshold?",o:["Dynamic thresholds","Static thresholds","Alert processing rules","Workbooks"],a:0,e:"Machine-learned."},
 {q:"Which tool shows a VM's processes and their network connections as a map?",o:["VM insights","Metrics explorer","Activity log","Advisor"],a:0,e:"The Map feature."},
 {q:"Was yesterday's outage of your VM caused by Azure? Where do you check?",o:["Resource Health","Azure Advisor","Cost analysis","Policy compliance"],a:0,e:"Per-resource health history."},
 {q:"Which Azure Advisor category flags VMs that aren't in an availability set or zone?",o:["Reliability","Cost","Performance","Security"],a:0,e:"Formerly High availability."},
 {q:"Which tool combines text, KQL queries and metric charts into interactive reports?",o:["Workbooks","Action groups","Diagnostic settings","Alert rules"],a:0,e:"Insights are built from workbooks."},
 {q:"You want to back up Azure VMs. Which vault?",o:["Recovery Services vault","Backup vault","Key Vault","Storage account"],a:0,e:"Backup vault handles blobs, disks, PostgreSQL."},
 {q:"You must back up Azure Disks and blobs with the newer backup engine. Which vault?",o:["Backup vault","Recovery Services vault","Key Vault","Log Analytics workspace"],a:0,e:"Backup vault."},
 {q:"vm-web01 is in East US. Your vault is in West US. Can you protect the VM?",o:["No; create a vault in East US","Yes","Only with GRS","Only with Enhanced policy"],a:0,e:"Vault and VM must be in the same region."},
 {q:"vm-web01 is protected by vault A. Can vault B also back it up?",o:["No; one vault per VM","Yes","Only with a different policy","Only on weekends"],a:0,e:"Stop protection in A first."},
 {q:"You protected 20 VMs, then try to change the vault from GRS to LRS. What happens?",o:["It's blocked; redundancy can't change after items are protected","It changes immediately","It changes after 24 hours","Only new VMs use LRS"],a:0,e:"Set it before configuring backup."},
 {q:"You want to restore VMs in the paired region even when the primary region is healthy. What must be on?",o:["Cross Region Restore on a GRS vault","LRS redundancy","Soft delete","Instant restore"],a:0,e:"CRR needs GRS."},
 {q:"Which policy type supports backups every 4 hours and Trusted Launch VMs?",o:["Enhanced","Standard","Default","Instant"],a:0,e:"Enhanced policy."},
 {q:"Backup data was deleted by mistake 5 days ago. Can you recover it?",o:["Yes, from soft delete (14 days)","No","Only with GRS","Only from Site Recovery"],a:0,e:"Undelete the item."},
 {q:"A user needs one file from last Tuesday's VM backup. Which restore option?",o:["File recovery","Create new VM","Replace existing","Cross Region Restore"],a:0,e:"Mount the recovery point and copy the file."},
 {q:"You need to restore a VM with a different size and network settings. Which option is most flexible?",o:["Restore disks, then deploy from the generated template","Replace existing","Create new VM with defaults","File recovery"],a:0,e:"Customize the template."},
 {q:"Restore disks fails: the staging account isn't supported. What's likely wrong?",o:["It's Premium or in another region","It has GRS","It has soft delete","It's StorageV2"],a:0,e:"Same region, Standard."},
 {q:"Why are some restores much faster than others?",o:["Restores from instant restore snapshots skip the vault tier","Larger VMs restore faster","GRS vaults are faster","Linux restores faster"],a:0,e:"Snapshots are kept locally for a few days."},
 {q:"What's the difference between Azure Backup and Site Recovery?",o:["Backup restores data from points in time; Site Recovery replicates workloads for failover","They're the same","Site Recovery is only for files","Backup is only for on-premises"],a:0,e:"Backup vs disaster recovery."},
 {q:"Where do you create the Recovery Services vault for replicating East US VMs to West US with ASR?",o:["West US (the target region)","East US","Either","A global region"],a:0,e:"The vault lives in the DR region."},
 {q:"You must prove DR works without affecting production replication. What do you run?",o:["Test failover into an isolated VNet","Planned failover","Unplanned failover","Restore disks"],a:0,e:"Then clean up the test."},
 {q:"After failing over to West US, what must you do before you can fail back?",o:["Commit, then re-protect (reverse replication)","Delete the vault","Disable replication","Nothing"],a:0,e:"Re-protect replicates West US back to East US."},
 {q:"The database tier must start before the web tier during failover. What do you use?",o:["A recovery plan with ordered groups","A backup policy","An alert processing rule","An availability set"],a:0,e:"Groups boot in order."},
 {q:"The business can lose at most 15 minutes of data. Which objective is that?",o:["RPO","RTO","SLA","MTTR"],a:0,e:"Recovery point objective."},
 {q:"The app must be back within 2 hours of a disaster. Which objective is that?",o:["RTO","RPO","SLO","Retention"],a:0,e:"Recovery time objective."}
];

/* ---------- interactive diagrams ---------- */
const now=Date.UTC(2026,10,10,12,0,0);
const DATA=(()=>{const C=["vm-web01","vm-web02","vm-db01","vm-app01"];const H=[],P=[],A=[];
  for(let m=0;m<240;m+=5)C.forEach((c,i)=>{const t=now-m*60e3;if(!(c==="vm-app01"&&m<90))H.push({TimeGenerated:t,Computer:c,OSType:c==="vm-db01"?"Windows":"Linux",Category:"Azure Monitor Agent"});
    P.push({TimeGenerated:t,Computer:c,ObjectName:"Processor",CounterName:"% Processor Time",CounterValue:Math.round(c==="vm-web02"?70+20*Math.sin(m/20):c==="vm-db01"?45+10*Math.cos(m/30):20+8*Math.sin(m/15+i))});
    if(m%30===0)P.push({TimeGenerated:t,Computer:c,ObjectName:"Memory",CounterName:"Available MBytes",CounterValue:Math.round(c==="vm-db01"?900:3200-i*300)})});
  [["admin@contoso.onmicrosoft.com","Microsoft.Compute/virtualMachines/delete","vm-test07",30],["dana@contoso.onmicrosoft.com","Microsoft.Compute/virtualMachines/restart/action","vm-web01",50],["admin@contoso.onmicrosoft.com","Microsoft.Network/networkSecurityGroups/securityRules/write","nsg-web",75],["riley@contoso.onmicrosoft.com","Microsoft.Compute/virtualMachines/deallocate/action","vm-app01",95],["dana@contoso.onmicrosoft.com","Microsoft.Storage/storageAccounts/listKeys/action","stweb4410",130],["admin@contoso.onmicrosoft.com","Microsoft.Compute/virtualMachines/delete","vm-test08",150]].forEach(x=>A.push({TimeGenerated:now-x[3]*60e3,Caller:x[0],OperationNameValue:x[1],Resource:x[2],ActivityStatusValue:"Success"}));
  return {Heartbeat:H,Perf:P,AzureActivity:A}})();
function kqlRun(q){const parts=q.split("|").map(s=>s.trim()).filter(Boolean);if(!parts.length)throw new Error("Type a query.");let rows=DATA[parts[0]];if(!rows)throw new Error(`Failed to resolve table '${parts[0]}'. Tables here: Heartbeat, Perf, AzureActivity.`);rows=rows.map(r=>({...r}));let cols=Object.keys(rows[0]);
  const val=(r,e)=>{e=e.trim();let m;if((m=/^ago\((\d+)([mhd])\)$/.exec(e)))return now-(+m[1])*(m[2]==="m"?60e3:m[2]==="h"?36e5:864e5);if(/^".*"$|^'.*'$/.test(e))return e.slice(1,-1);if(/^-?\d+(\.\d+)?$/.test(e))return +e;if(e in r)return r[e];throw new Error(`Failed to resolve scalar expression named '${e}'.`)};
  const cond=(r,c)=>c.split(/\s+and\s+/i).every(p=>{const m=/^(.+?)\s*(==|!=|>=|<=|>|<|contains|has|startswith|!contains)\s*(.+)$/i.exec(p.trim());if(!m)throw new Error(`Couldn't parse where clause '${p}'.`);const a=val(r,m[1]),b=val(r,m[3]);const s=String(a).toLowerCase(),t=String(b).toLowerCase();
    switch(m[2].toLowerCase()){case "==":return a===b;case "!=":return a!==b;case ">":return a>b;case "<":return a<b;case ">=":return a>=b;case "<=":return a<=b;case "contains":case "has":return s.includes(t);case "!contains":return !s.includes(t);case "startswith":return s.startsWith(t)}});
  for(const p of parts.slice(1)){let m;
    if((m=/^where\s+(.+)$/i.exec(p)))rows=rows.filter(r=>cond(r,m[1]));
    else if((m=/^project\s+(.+)$/i.exec(p))){const c=m[1].split(",").map(s=>s.trim());c.forEach(x=>{if(!cols.includes(x))throw new Error(`Failed to resolve column '${x}'.`)});rows=rows.map(r=>Object.fromEntries(c.map(x=>[x,r[x]])));cols=c}
    else if((m=/^summarize\s+(.+?)(?:\s+by\s+(.+))?$/i.exec(p))){const ag=m[1].split(/,(?![^(]*\))/).map(s=>s.trim());const by=m[2]?m[2].split(/,(?![^(]*\))/).map(s=>s.trim()):[];
      const keyOf=r=>by.map(b=>{const x=/^bin\((\w+),\s*(\d+)([mhd])\)$/.exec(b);if(x){const ms=(+x[2])*(x[3]==="m"?60e3:x[3]==="h"?36e5:864e5);return Math.floor(r[x[1]]/ms)*ms}if(!(b in r))throw new Error(`Failed to resolve column '${b}'.`);return r[b]});
      const grp=new Map();rows.forEach(r=>{const k=JSON.stringify(keyOf(r));if(!grp.has(k))grp.set(k,{k:keyOf(r),rs:[]});grp.get(k).rs.push(r)});
      const names=by.map(b=>{const x=/^bin\((\w+)/.exec(b);return x?x[1]:b});
      rows=[...grp.values()].map(g=>{const o=Object.fromEntries(names.map((n,i)=>[n,g.k[i]]));ag.forEach(a=>{const x=/^(?:(\w+)\s*=\s*)?(count|avg|sum|max|min|dcount)\((\w*)\)$/i.exec(a);if(!x)throw new Error(`Unsupported aggregation '${a}'. Try count(), avg(Col), sum(Col), max(Col), min(Col), dcount(Col).`);const f=x[2].toLowerCase(),c=x[3];const nm=x[1]||(f==="count"?"count_":`${f}_${c}`);const v=g.rs.map(r=>r[c]);
        o[nm]=f==="count"?g.rs.length:f==="avg"?Math.round(v.reduce((s,n)=>s+n,0)/v.length*100)/100:f==="sum"?v.reduce((s,n)=>s+n,0):f==="max"?Math.max(...v):f==="min"?Math.min(...v):new Set(v).size});return o});cols=rows.length?Object.keys(rows[0]):names}
    else if((m=/^(?:order|sort)\s+by\s+(\w+)(?:\s+(asc|desc))?$/i.exec(p))){const c=m[1],d=(m[2]||"desc").toLowerCase()==="desc"?-1:1;if(!cols.includes(c))throw new Error(`Failed to resolve column '${c}'.`);rows.sort((a,b)=>(a[c]>b[c]?1:a[c]<b[c]?-1:0)*d)}
    else if((m=/^(?:take|limit)\s+(\d+)$/i.exec(p)))rows=rows.slice(0,+m[1]);
    else if((m=/^top\s+(\d+)\s+by\s+(\w+)(?:\s+(asc|desc))?$/i.exec(p))){const c=m[2],d=(m[3]||"desc").toLowerCase()==="desc"?-1:1;rows.sort((a,b)=>(a[c]>b[c]?1:a[c]<b[c]?-1:0)*d);rows=rows.slice(0,+m[1])}
    else if(/^count$/i.test(p)){rows=[{Count:rows.length}];cols=["Count"]}
    else throw new Error(`This playground supports where, project, summarize, order by, take, top and count. Couldn't run '${p}'.`)}
  return {rows,cols}}
function vizKql(){const el=$("#viz-kql");
  const CH=[["Which computers sent a heartbeat in the last 30 minutes?",r=>r.length===3&&r.every(x=>"Computer" in x)&&!r.some(x=>x.Computer==="vm-app01"),"Heartbeat | where TimeGenerated > ago(30m) | summarize count() by Computer"],
    ["Average % Processor Time per computer, highest first.",r=>r.length===4&&r[0].Computer==="vm-web02"&&Object.keys(r[0]).some(k=>/avg/i.test(k)),'Perf | where CounterName == "% Processor Time" | summarize avg(CounterValue) by Computer | order by avg_CounterValue desc'],
    ["Who deleted VMs? Show Caller and Resource only.",r=>r.length===2&&r.every(x=>Object.keys(x).join()==="Caller,Resource"),'AzureActivity | where OperationNameValue contains "delete" | project Caller, Resource'],
    ["How many Perf samples are memory counters?",r=>r.length===1&&r[0].Count===DATA.Perf.filter(x=>x.ObjectName==="Memory").length,'Perf | where ObjectName == "Memory" | count']];
  let q="Heartbeat | take 5",cur=0,res=null,err="";const solved=new Set();
  const fmt=v=>typeof v==="number"&&v>1e12?new Date(v).toISOString().replace("T"," ").slice(0,16):v;
  function run(){try{res=kqlRun(q);err="";if(CH[cur][1](res.rows))solved.add(cur)}catch(e){err=e.message;res=null}}
  function draw(){el.innerHTML=`<div class="viz-title">KQL playground · law-contoso</div>
    <div class="seg-row">${CH.map((c,i)=>`<button class="chip" data-c="${i}" aria-pressed="${i===cur}">${solved.has(i)?"✓ ":""}Challenge ${i+1}</button>`).join("")}</div>
    <p class="scenario"><b>Challenge:</b> ${CH[cur][0]}</p>
    <textarea class="txt-in mono kql-in" rows="3" data-k="q" aria-label="KQL query" spellcheck="false">${esc(q)}</textarea>
    <div class="viz-controls"><button class="btn" data-a="run">Run (Ctrl+Enter)</button><button class="btn" data-a="hint">Show an answer</button><span class="s-small">Tables: Heartbeat, Perf, AzureActivity</span></div>
    ${err?`<div class="status-bad mono s-small">${esc(err)}</div>`:res?`<div class="s-small">${res.rows.length} row${res.rows.length===1?"":"s"}</div><div class="tbl-wrap kql-out"><table class="tbl"><tr>${res.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${res.rows.slice(0,12).map(r=>`<tr>${res.cols.map(c=>`<td>${esc(fmt(r[c]))}</td>`).join("")}</tr>`).join("")}</table></div>${res.rows.length>12?'<div class="s-small">Showing 12 rows.</div>':""}`:""}
    <div class="caption" aria-live="polite">${solved.has(cur)?'<span class="status-good">Correct!</span> ':""}${solved.size}/4 challenges solved.</div>`;
    if(solved.size===4)award("viz:kql",40,"Solved every KQL challenge")}
  el.addEventListener("input",e=>{if(e.target.dataset.k==="q")q=e.target.value});
  el.addEventListener("keydown",e=>{if(e.target.dataset.k==="q"&&e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();draw();el.querySelector('[data-k="q"]').focus()}});
  el.addEventListener("click",e=>{const c=e.target.closest("[data-c]"),a=e.target.closest("[data-a]")?.dataset.a;if(c){cur=+c.dataset.c;res=null;err="";draw()}if(a==="run"){run();draw()}if(a==="hint"){q=CH[cur][2];run();draw()}});run();draw()}
function vizKqlOrder(){const el=$("#viz-kqlorder");const L=["Perf","| where TimeGenerated > ago(1h)","| where CounterName == \"% Processor Time\"","| summarize avg(CounterValue) by Computer","| order by avg_CounterValue desc","| take 5"];
  let pool=shuffleArr(L.map((_,i)=>i)),seq=[],msg="";
  function draw(){const done=seq.length===L.length;const ok=done&&seq.every((x,i)=>x===i);
    el.innerHTML=`<div class="viz-title">Build the query: top 5 busiest computers in the last hour</div>
    <pre class="term" style="min-height:0">${seq.map(i=>esc(L[i])).join("\n")||"Tap the lines below in order."}</pre>
    <div class="seg-row">${pool.filter(i=>!seq.includes(i)).map(i=>`<button class="chip mono" data-i="${i}">${esc(L[i])}</button>`).join("")}</div>
    <div class="viz-controls"><button class="btn" data-a="undo" ${seq.length?"":"disabled"}>Undo</button><button class="btn" data-a="reset">Start over</button></div>
    <div class="caption" aria-live="polite">${ok?'<span class="status-good">Correct.</span> Table first, then filter, aggregate, sort and limit. Filtering early keeps queries fast.':done?'<span class="status-bad">Not quite.</span> Remember: you can only order by avg_CounterValue after summarize creates it.':msg}</div>`;
    if(ok)award("viz:kqlorder",20,"Built a KQL query in the right order")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-i]"),a=e.target.closest("[data-a]")?.dataset.a;if(b)seq.push(+b.dataset.i);if(a==="undo")seq.pop();if(a==="reset"){seq=[];pool=shuffleArr(L.map((_,i)=>i))}if(b||a)draw()});draw()}
function vizAlertSim(){const el=$("#viz-alertsim");const CPU=[40,45,50,82,88,91,86,79,84,90,93,60,55,40,35,30];let th=80,win=3,agg="avg",freq=1;let seen=new Set();
  function eval_(){const out=[];let firing=false,fired=0;for(let t=0;t<CPU.length;t++){if((t+1)%freq!==0){out.push({t,state:firing?"Fired":"",v:null});continue}const w=CPU.slice(Math.max(0,t-win+1),t+1);const v=agg==="avg"?w.reduce((a,b)=>a+b,0)/w.length:agg==="max"?Math.max(...w):Math.min(...w);const hit=v>th;let st="";if(hit&&!firing){firing=true;fired++;st="Fired"}else if(!hit&&firing){firing=false;st="Resolved"}else if(firing)st="Fired";out.push({t,v:Math.round(v),state:st,hit})}return {out,fired}}
  function draw(){const {out,fired}=eval_();seen.add(fired===0?"0":fired===1?"1":"many");
    el.innerHTML=`<div class="viz-title">Metric alert simulator · Percentage CPU on vm-web01</div>
    <div class="dyn-row"><span>Condition</span><select class="txt-in" data-k="agg">${["avg","max","min"].map(x=>`<option ${x===agg?"selected":""}>${x}</option>`).join("")}</select><span>Percentage CPU &gt;</span><input type="range" min="50" max="95" step="5" value="${th}" data-k="th"><b>${th}%</b></div>
    <div class="rng-row"><span>Window size</span><input type="range" min="1" max="6" value="${win}" data-k="win"><b>${win*5} min</b></div>
    <div class="rng-row"><span>Evaluate every</span><input type="range" min="1" max="${win}" value="${Math.min(freq,win)}" data-k="freq"><b>${freq*5} min</b></div>
    <div class="as-chart">${CPU.map((c,i)=>`<div class="as-bar" title="${c}%"><i style="height:${c}%" class="${c>th?"hot":""}"></i><b>${out[i].v!=null?out[i].v:"·"}</b><em class="${out[i].state==="Fired"&&out[i].hit!==false?"st-f":out[i].state==="Resolved"?"st-r":""}">${out[i].state==="Resolved"?"✓":out[i].state==="Fired"&&(i===0||out[i-1].state!=="Fired")?"🔔":""}</em></div>`).join("")}</div>
    <div class="caption" aria-live="polite">Bars are raw 5-minute CPU; the number is the value the rule evaluates. 🔔 fires (once, it's stateful), ✓ resolves. This setup fires <b>${fired}</b> time${fired===1?"":"s"}. ${win===1?"A tiny window reacts to every spike: expect noisy alerts.":"A longer window with avg smooths out short spikes."} <span class="s-small">Seen: ${seen.size}/3 (no alert, one alert, several alerts)</span></div>`;
    if(seen.size===3)award("viz:alertsim",30,"Tuned a metric alert")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k||k==="agg")return;const v=+e.target.value;if(k==="th")th=v;if(k==="win"){win=v;if(freq>win)freq=win}if(k==="freq")freq=v;draw();el.querySelector(`[data-k="${k}"]`).focus()});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="agg"){agg=e.target.value;draw()}});draw()}
function vizRetention(){const el=$("#viz-retention");const st={d:30,w:12,m:12,y:3,inst:2};const seen=new Set();
  function draw(){const pts=st.d+(st.w?st.w:0)+(st.m?st.m:0)+(st.y?st.y:0);const longest=st.y?`${st.y} year${st.y>1?"s":""}`:st.m?`${st.m} months`:st.w?`${st.w} weeks`:`${st.d} days`;
    const goals=[["Keep 30 days of dailies for ops",st.d>=30],["Keep 12 monthly points for audit",st.m>=12],["Keep 7 years of yearly points for finance",st.y>=7],["Restore yesterday's backup in minutes",st.inst>=2]];goals.forEach((g,i)=>{if(g[1])seen.add(i)});
    el.innerHTML=`<div class="viz-title">Backup policy designer · DailyPolicy-prod (backup at 22:00)</div>
    ${[["d","Daily points kept",7,180,"days"],["w","Weekly (Sunday) points",0,52,"weeks"],["m","Monthly (1st Sunday)",0,60,"months"],["y","Yearly (January)",0,10,"years"],["inst","Instant restore snapshots",1,5,"days"]].map(x=>`<div class="rng-row"><span>${x[1]}</span><input type="range" min="${x[2]}" max="${x[3]}" value="${st[x[0]]}" data-k="${x[0]}"><b>${st[x[0]]} ${x[4]}</b></div>`).join("")}
    <div class="kv"><span>Recovery points kept (about)</span><b class="mono">${pts}</b><span>Oldest restore available</span><b class="mono">${longest}</b></div>
    <div class="sc-list">${goals.map(g=>`<label class="${g[1]?"done":""}"><span>${g[1]?"✓":"○"}</span><span>${g[0]}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${goals.every(g=>g[1])?'<span class="status-good">Policy meets every requirement.</span> Longer retention means more storage cost, so keep only what the business needs.':"Adjust retention until every requirement is met."}</div>`;
    if(goals.every(g=>g[1]))award("viz:retention",25,"Designed a backup policy that meets every requirement")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;st[k]=+e.target.value;draw();el.querySelector(`[data-k="${k}"]`).focus()});draw()}

registerModule({
  id:"mon",slug:"monitor",title:"Monitor and Maintain Azure Resources",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["mvl","route","kql","kqlorder","alertparts","alertsim","alertpick","healthpick","mondrill","vaultpick","retention","restorepick","restoreflow","bvsr","asrflow","rporto"],
  viz(){
sortViz($("#viz-mvl"),{title:"Metric or log?",bins:{m:"Metric",l:"Log"},
  items:[["Percentage CPU every minute","m","Numeric time series."],["'User dana deleted vm-test07'","l","An event record."],["Storage account transactions per second","m","Numbers."],["Windows System event 7036 text","l","Event log entry."],["Key Vault: who read which secret","l","Resource log."],["Available memory bytes","m","Numeric sample."]],done:"Sorted metrics and logs"});
sortViz($("#viz-route"),{title:"Where should the diagnostic setting send it?",bins:{law:"Log Analytics workspace",sa:"Storage account",eh:"Event hub"},
  items:[["Query Key Vault access with KQL and alert on it","law","Query and alert."],["Keep NSG flow and audit logs 7 years as cheaply as possible","sa","Archive."],["Stream logs to Splunk in real time","eh","Streaming."],["Build a workbook over SQL database logs","law","Workbooks query workspaces."],["Send activity logs to a third-party SIEM","eh","SIEM integration."]],done:"Routed every log to the right place"});
vizKql();
vizKqlOrder();
revealViz($("#viz-alertparts"),{title:"Anatomy of an alert rule",cols:2,done:"Explored every part of an alert rule",items:[["Scope","WHAT","The resources to watch: a VM, every VM in a resource group, a workspace, a subscription."],["Condition","WHEN","The signal (metric, log query, activity log event), the logic (avg CPU > 80) and timing (window, frequency)."],["Actions","WHO/HOW","One or more action groups: email and SMS the on-call team, run a runbook, call a webhook."],["Details","CONTEXT","Name, description, severity (0–4), resource group, and whether it auto-resolves."]]});
vizAlertSim();
sortViz($("#viz-alertpick"),{title:"Which alert type?",bins:{metric:"Metric alert",log:"Log search alert",act:"Activity log alert",sh:"Service Health alert"},
  items:[["Average CPU over 85% for 10 minutes","metric","Metric signal."],["More than 5 failed logons in the Event table within 15 minutes","log","KQL query."],["Anyone deletes a resource group","act","Administrative event."],["Planned maintenance is coming to East US Storage","sh","Service Health."],["HTTP 5xx errors on a web app above 10 per minute","metric","Http5xx metric."],["A policy assignment is created or deleted","act","Administrative event."]],done:"Picked every alert type"});
sortViz($("#viz-healthpick"),{title:"Which tool answers this?",bins:{sh:"Service Health",rh:"Resource Health",adv:"Advisor",vmi:"VM insights",wb:"Workbooks"},
  items:[["Is there an Azure outage in a region we use?","sh","Service-level events."],["Was my VM's restart last night Azure's fault?","rh","One resource."],["Which VMs are underused and could be resized?","adv","Cost recommendations."],["Which servers does vm-app01 talk to on port 1433?","vmi","Dependency map."],["An interactive report mixing KQL results, metrics and text","wb","Workbooks."],["Are we missing redundancy for our databases?","adv","Reliability recommendations."]],done:"Picked every monitoring tool"});
azViz($("#viz-mondrill"),{title:"Cloud Shell drill: route logs to a workspace",scenario:"Send all of <b>kv-ops4410</b>'s logs and metrics to a new Log Analytics workspace so you can query who reads secrets.",
  setup:(w,AZ)=>{w.rgs["rg-ops"]={name:"rg-ops",loc:"eastus",tags:{}};AZ.exec(w,"az keyvault create -g rg-ops -n kv-ops4410 -l eastus")},
  tasks:[{t:"Create a Log Analytics workspace <b>law-ops</b> with 90 days retention.",hint:"az monitor log-analytics workspace create -g rg-ops -n law-ops --retention-time 90",check:w=>w.res.some(r=>r.t==="law"&&r.name==="law-ops"&&r.p.retention===90)},
    {t:"Create a diagnostic setting <b>to-law</b> on kv-ops4410 that sends <b>allLogs</b> and <b>AllMetrics</b> to law-ops.",hint:"az monitor diagnostic-settings create --name to-law --resource kv-ops4410 -g rg-ops --workspace law-ops --logs '[{\"categoryGroup\":\"allLogs\",\"enabled\":true}]' --metrics '[{\"category\":\"AllMetrics\",\"enabled\":true}]'",check:w=>{const k=w.res.find(r=>r.t==="kv");return k&&(k.p.diag||[]).some(d=>d.law==="law-ops"&&d.logs.length&&d.metrics.length)}}],
  solution:"az monitor log-analytics workspace create -g rg-ops -n law-ops --retention-time 90\naz monitor diagnostic-settings create --name to-law --resource kv-ops4410 -g rg-ops --workspace law-ops --logs '[{\"categoryGroup\":\"allLogs\",\"enabled\":true}]' --metrics '[{\"category\":\"AllMetrics\",\"enabled\":true}]'"},"mondrill",40,"Routed logs with a diagnostic setting");
sortViz($("#viz-vaultpick"),{title:"Recovery Services vault or Backup vault?",bins:{rsv:"Recovery Services vault",bv:"Backup vault"},
  items:[["Daily backups of Azure VMs","rsv","Classic workload."],["Operational backup of Azure Blobs","bv","Newer workloads."],["Azure Site Recovery replication","rsv","Only RSV supports ASR."],["Azure Disk snapshots on a schedule","bv","Disk backup."],["SQL Server running in an Azure VM","rsv","Workload-aware backup."],["Azure Database for PostgreSQL flexible server","bv","Backup vault."],["Azure Files shares","rsv","File share backup."]],done:"Picked the right vault every time"});
vizRetention();
sortViz($("#viz-restorepick"),{title:"Which restore option?",bins:{nvm:"Create new VM",disk:"Restore disks",rep:"Replace existing",file:"File recovery",crr:"Cross Region Restore"},
  items:[["A user deleted one spreadsheet from a file server VM","file","Item-level restore."],["Bring back a VM fast after ransomware, same name and settings","rep","Swap disks in place."],["Rebuild the VM with a new size and in another VNet","disk","Customize from the template."],["Spin up a copy of last week's VM to compare configs","nvm","New VM alongside."],["The primary region is unavailable; restore in the paired region","crr","Needs GRS + CRR."]],done:"Picked every restore option"});
stepViz($("#viz-restoreflow"),{title:"Restoring a VM from backup",done:"Walked through a VM restore",steps:[
  ["Pick the item","Vault → Backup items → Azure Virtual Machine → vm-web01 → Restore VM."],
  ["Pick a recovery point","Snapshot points (instant restore tier) restore fastest; Vault-standard points take longer."],
  ["Choose the restore type","Create new VM, Restore disks, or Replace existing."],
  ["Staging location","Restore disks needs a Standard storage account in the vault's region for staging."],
  ["Run and monitor","Watch the Restore job under Backup jobs. A deployment template is generated for Restore disks."],
  ["Finish up","Create the VM from the restored disks (if needed), reconnect it to the network, and re-enable backup on the new VM."]]});
sortViz($("#viz-bvsr"),{title:"Azure Backup or Site Recovery?",bins:{bk:"Azure Backup",asr:"Site Recovery"},
  items:[["Recover a file deleted three weeks ago","bk","Point-in-time data."],["Keep the order system running if East US goes down","asr","Failover."],["Keep 7 years of monthly copies for audits","bk","Long retention."],["RPO of a few minutes for a critical VM","asr","Continuous replication."],["Roll back a VM after a bad patch","bk","Restore a point."],["Migrate on-premises VMware VMs to Azure with failover","asr","Replication and failover."]],done:"Told backup and disaster recovery apart"});
stepViz($("#viz-asrflow"),{title:"Site Recovery lifecycle",done:"Followed a full Site Recovery cycle",steps:[["Enable replication","Pick source VMs in East US, a Recovery Services vault in West US, target resource group, VNet and replication policy."],["Initial replication","Disks copy to the target region; then changes replicate continuously."],["Test failover","Bring VMs up in an isolated test VNet, check the app, then clean up."],["Failover","Disaster strikes East US: fail over to the latest or an app-consistent recovery point."],["Commit","Confirm the recovery point. VMs now run in West US."],["Re-protect","Start replicating West US back to East US."],["Fail back","When East US is healthy, fail over again to return, then re-protect."]]});
quizViz($("#viz-rporto"),{title:"RPO and RTO",done:"Nailed RPO and RTO",qs:[
  ["'We can't lose more than 5 minutes of orders.'",["RPO = 5 minutes","RTO = 5 minutes","SLA = 99.95%"],0,"Data loss is RPO."],
  ["'The site must be back within 1 hour.'",["RTO = 1 hour","RPO = 1 hour","Retention = 1 hour"],0,"Downtime is RTO."],
  ["Nightly backups only. What's the worst-case RPO?",["About 24 hours","5 minutes","Zero"],0,"Everything since the last backup is lost."],
  ["Which helps lower RTO for a multi-tier app during failover?",["A recovery plan with automation scripts","Longer retention","LRS vault"],0,"Automated, ordered recovery."]]});
  },
  sims:[
    {id:"alertlab",type:"cli",title:"Wire up alerting for production",shell:"bash",
      scenario:"<b>vm-prod01</b> keeps running hot, and last week someone deleted a VM without telling anyone. Build an on-call action group, a CPU alert and a delete alert.",
      setup:(w,AZ)=>{w.rgs["rg-prod"]={name:"rg-prod",loc:"eastus",tags:{}};w.rgs["rg-ops"]={name:"rg-ops",loc:"eastus",tags:{}};AZ.newVm(w,"rg-prod","vm-prod01",{size:"Standard_D2s_v5"})},
      tasks:[
        {t:"Create an action group <b>ag-oncall</b> in rg-ops that emails <b>oncall@contoso.com</b>. Its short name must be 12 characters or fewer.",hint:"az monitor action-group create -g rg-ops -n ag-oncall --short-name oncall --action email oncall oncall@contoso.com",check:w=>{const g=w.res.find(r=>r.t==="ag"&&r.name==="ag-oncall");return g&&g.p.actions.some(a=>a.type==="email")}},
        {t:"Create a metric alert <b>cpu-high</b> on vm-prod01: <b>avg Percentage CPU &gt; 85</b> over <b>15 minutes</b>, checked every <b>5 minutes</b>, severity <b>2</b>, using ag-oncall.",hint:'vmid=$(az vm show -g rg-prod -n vm-prod01 --query id -o tsv)\naz monitor metrics alert create -g rg-ops -n cpu-high --scopes $vmid --condition "avg Percentage CPU > 85" --window-size 15m --evaluation-frequency 5m --severity 2 --action ag-oncall',check:w=>{const a=w.res.find(r=>r.t==="alert"&&r.name==="cpu-high");return a&&a.p.th===85&&a.p.window==="15m"&&a.p.freq==="5m"&&a.p.sev===2&&a.p.ags.includes("ag-oncall")}},
        {t:"Create an activity log alert <b>vm-deleted</b> that fires on <b>Microsoft.Compute/virtualMachines/delete</b> and notifies ag-oncall.",hint:"az monitor activity-log alert create -g rg-ops -n vm-deleted --condition category=Administrative and operationName=Microsoft.Compute/virtualMachines/delete --action-group ag-oncall",check:w=>{const a=w.res.find(r=>r.t==="aalert"&&r.name==="vm-deleted");return a&&/virtualMachines\/delete/i.test(a.p.condition)&&a.p.ags.includes("ag-oncall")}},
        {t:"Saturday maintenance: add an alert processing rule <b>sat-maint</b> that removes all action groups for rg-prod.",hint:"az monitor alert-processing-rule create -g rg-ops -n sat-maint --rule-type RemoveAllActionGroups --scopes /subscriptions/3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c/resourceGroups/rg-prod --schedule-start-datetime '2026-11-14 22:00:00' --schedule-end-datetime '2026-11-15 04:00:00'",check:w=>(w.apr||[]).some(r=>r.name==="sat-maint"&&r.type==="RemoveAllActionGroups")}],
      success:"High CPU and VM deletions now page the on-call team, and Saturday's maintenance won't wake anyone.",
      solution:'az monitor action-group create -g rg-ops -n ag-oncall --short-name oncall --action email oncall oncall@contoso.com\nvmid=$(az vm show -g rg-prod -n vm-prod01 --query id -o tsv)\naz monitor metrics alert create -g rg-ops -n cpu-high --scopes $vmid --condition "avg Percentage CPU > 85" --window-size 15m --evaluation-frequency 5m --severity 2 --action ag-oncall\naz monitor activity-log alert create -g rg-ops -n vm-deleted --condition category=Administrative and operationName=Microsoft.Compute/virtualMachines/delete --action-group ag-oncall\naz monitor alert-processing-rule create -g rg-ops -n sat-maint --rule-type RemoveAllActionGroups --scopes /subscriptions/3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c/resourceGroups/rg-prod --schedule-start-datetime "2026-11-14 22:00:00" --schedule-end-datetime "2026-11-15 04:00:00"'},
    {id:"backuplab",type:"cli",title:"Back up and restore a VM",shell:"bash",
      scenario:"Protect <b>vm-fin01</b> (East US) with Azure Backup. Someone already made a vault in West US; find out why it can't be used, build the right one, back up, then restore the disks.",
      setup:(w,AZ)=>{w.rgs["rg-fin"]={name:"rg-fin",loc:"eastus",tags:{}};w.rgs["rg-bk"]={name:"rg-bk",loc:"eastus",tags:{}};AZ.newVm(w,"rg-fin","vm-fin01",{image:"Win2022Datacenter",size:"Standard_D2s_v5"});AZ.exec(w,"az backup vault create -g rg-bk -n rsv-westus -l westus");AZ.newSa(w,"rg-bk","stbkstage4410","eastus",{sku:"Standard_LRS"})},
      tasks:[
        {t:"Try protecting vm-fin01 with <b>rsv-westus</b> and DefaultPolicy. Read the error.",hint:"az backup protection enable-for-vm -g rg-bk --vault-name rsv-westus --vm vm-fin01 --policy-name DefaultPolicy",sticky:true,check:w=>w._region},
        {t:"Create a Recovery Services vault <b>rsv-eastus</b> in <b>eastus</b>.",hint:"az backup vault create -g rg-bk -n rsv-eastus -l eastus",check:w=>w.res.some(r=>r.t==="rsv"&&r.name==="rsv-eastus")},
        {t:"<b>Before</b> protecting anything, set rsv-eastus to <b>GeoRedundant</b> with <b>Cross Region Restore</b> on.",hint:"az backup vault backup-properties set -g rg-bk -n rsv-eastus --backup-storage-redundancy GeoRedundant --cross-region-restore-flag true",check:w=>{const v=w.res.find(r=>r.t==="rsv"&&r.name==="rsv-eastus");return v&&v.p.crr}},
        {t:"Protect vm-fin01 with <b>DefaultPolicy</b> in rsv-eastus, then run <b>backup now</b>.",hint:"az backup protection enable-for-vm -g rg-bk --vault-name rsv-eastus --vm vm-fin01 --policy-name DefaultPolicy\naz backup protection backup-now -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01",check:w=>{const v=w.res.find(r=>r.t==="rsv"&&r.name==="rsv-eastus");return v&&v.p.items.some(i=>i.vm==="vm-fin01"&&i.points.length)}},
        {t:"Restore the disks from that recovery point using staging account <b>stbkstage4410</b>.",hint:'rp=$(az backup recoverypoint list -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01 --query "[0].name" -o tsv)\naz backup restore restore-disks -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01 --rp-name $rp --storage-account stbkstage4410',check:w=>{const v=w.res.find(r=>r.t==="rsv"&&r.name==="rsv-eastus");return v&&(v.p.restores||[]).length>0}}],
      onCmd:(l,w,r)=>{if(/enable-for-vm/.test(l)&&/rsv-westus/.test(l)&&r&&r.err)w._region=true},
      success:"vm-fin01 is protected in its own region with geo-redundant, cross-region-restorable backups, and you've proven the restore works.",
      solution:'az backup protection enable-for-vm -g rg-bk --vault-name rsv-westus --vm vm-fin01 --policy-name DefaultPolicy\naz backup vault create -g rg-bk -n rsv-eastus -l eastus\naz backup vault backup-properties set -g rg-bk -n rsv-eastus --backup-storage-redundancy GeoRedundant --cross-region-restore-flag true\naz backup protection enable-for-vm -g rg-bk --vault-name rsv-eastus --vm vm-fin01 --policy-name DefaultPolicy\naz backup protection backup-now -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01\nrp=$(az backup recoverypoint list -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01 --query "[0].name" -o tsv)\naz backup restore restore-disks -g rg-bk --vault-name rsv-eastus --container-name vm-fin01 --item-name vm-fin01 --rp-name $rp --storage-account stbkstage4410'},
    {id:"softdel",type:"cli",title:"Recover deleted backups",shell:"bash",
      scenario:"A rushed admin stopped protection on <b>vm-hr01</b> and deleted its backup data. Use soft delete to get it back and resume protection.",
      setup:(w,AZ)=>{w.rgs["rg-hr"]={name:"rg-hr",loc:"eastus",tags:{}};AZ.newVm(w,"rg-hr","vm-hr01",{});AZ.exec(w,"az backup vault create -g rg-hr -n rsv-hr -l eastus");AZ.exec(w,"az backup protection enable-for-vm -g rg-hr --vault-name rsv-hr --vm vm-hr01 --policy-name DefaultPolicy");AZ.exec(w,"az backup protection backup-now -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01");AZ.exec(w,"az backup protection disable -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01 --delete-backup-data true --yes")},
      tasks:[
        {t:"List the vault's protected items. Is vm-hr01 there?",hint:"az backup item list -g rg-hr --vault-name rsv-hr -o table",sticky:true,check:w=>w._listed},
        {t:"Undelete vm-hr01's backup item.",hint:"az backup protection undelete -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01",check:w=>{const v=w.res.find(r=>r.t==="rsv");return v.p.items.some(i=>i.vm==="vm-hr01")}},
        {t:"Resume protection with DefaultPolicy.",hint:"az backup protection resume -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01 --policy-name DefaultPolicy",check:w=>{const v=w.res.find(r=>r.t==="rsv");return v.p.items.some(i=>i.vm==="vm-hr01"&&i.state==="Protected")}}],
      onCmd:(l,w)=>{if(/backup item list/.test(l))w._listed=true},
      success:"Soft delete saved the day: the recovery points are back and backups run again.",
      solution:"az backup item list -g rg-hr --vault-name rsv-hr -o table\naz backup protection undelete -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01\naz backup protection resume -g rg-hr --vault-name rsv-hr --container-name vm-hr01 --item-name vm-hr01 --policy-name DefaultPolicy\naz backup item list -g rg-hr --vault-name rsv-hr -o table"},
    {id:"monmatch",type:"match",title:"Match the monitoring need",
      scenario:"Match each request to the Azure feature that delivers it.",
      items:[["Diagnostic setting","diag"],["Azure Monitor Agent + DCR","ama"],["Action group","ag"],["Alert processing rule","apr"],["Cross Region Restore","crr"],["Recovery plan","rp"]],
      slots:[["diag","Security","Key Vault audit logs must reach the workspace"],["ama","Ops","Collect Linux syslog from 40 VMs"],["ag","On-call","Alerts must text and email the on-call engineer"],["apr","Change board","No pages during Saturday's patch window"],["crr","BCDR","Restore VMs in the paired region during a regional outage"],["rp","App team","Fail over SQL first, then the app tier, then the web tier"]],
      success:"Every request has the right feature."},
    {id:"montrouble",type:"choice",title:"Monitoring and recovery tickets",
      scenario:"Work the ops queue.",
      steps:[
        ["'We have no storage account read logs in Log Analytics.'",["Create a diagnostic setting on the storage account's blob service to the workspace","Install the Azure Monitor Agent on the account","Enable Service Health"],0,"Resource logs need diagnostic settings."],
        ["'The CPU alert fires constantly on short spikes.'",["Use a longer window with avg aggregation (or dynamic thresholds)","Lower the threshold","Shorten the window to 1 minute"],0,"Smooth the signal."],
        ["'Enabling backup fails: the vault is in a different region.'",["Create a Recovery Services vault in the VM's region","Use GRS","Use a Backup vault"],0,"Same region rule."],
        ["'We need to switch the vault to LRS to save money, but it's greyed out.'",["Redundancy can't change after items are protected","LRS needs Premium","Turn off soft delete"],0,"Set it first."],
        ["'Our DR test must not disturb replication or production.'",["Run a test failover into an isolated VNet","Run an unplanned failover","Disable replication first"],0,"That's what test failover is for."],
        ["'We can't find who stopped vm-sql01 yesterday.'",["Check the activity log (Administrative) for the deallocate operation","Look at Percentage CPU","Check VM insights Map"],0,"Activity log shows the caller."]],
      success:"Ops queue cleared."}
  ],
  badges:[
    ["reader","MN","Monitor Scholar","Mark all 7 monitor and maintain lessons studied",c=>c.allStudied()],
    ["lab","ML","Ops Lab","Complete all 16 diagrams in this module",c=>c.vizAll()],
    ["kql","KQL","Kusto Coder","Solve every challenge in the KQL playground",c=>c.earned("viz:kql")],
    ["alertlab","AL","On Call","Pass the alerting lab",c=>c.passed("alertlab")],
    ["backuplab","BK","Backup Hero","Pass the backup and restore lab",c=>c.passed("backuplab")],
    ["softdel","SD","Second Chance","Pass the soft delete recovery lab",c=>c.passed("softdel")],
    ["alertsim","TH","Signal Tuner","Tune the metric alert simulator through every outcome",c=>c.earned("viz:alertsim")],
    ["trouble","OP","Ops Hero","Pass the monitoring and recovery tickets simulation",c=>c.passed("montrouble")],
    ["perfect","MN+","Five Nines","Score 100% on a monitor and maintain quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
