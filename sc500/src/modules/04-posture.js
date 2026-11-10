/* ================= Module 4: Manage and monitor security posture (SC-500 Domain 4, 20–25%) ================= */
(function(){
const LESSONS=[
{id:"cspm",num:"4.1",title:"Defender for Cloud and Defender CSPM",html:`
<p><b>Microsoft Defender for Cloud</b> is a cloud-native application protection platform (CNAPP). It has two halves: <b>cloud security posture management</b> (CSPM: find and fix weaknesses) and <b>cloud workload protection</b> (CWP: detect and respond to threats, lesson 4.3).</p>
<h3>Foundational CSPM (free) vs Defender CSPM (paid)</h3>
<ul><li><b>Foundational CSPM</b>: on by default for every subscription. Security recommendations, <b>secure score</b>, asset inventory, the Microsoft cloud security benchmark, and multicloud posture for AWS and GCP.</li>
<li><b>Defender CSPM</b> adds the <b>cloud security graph</b>, <b>attack path analysis</b>, the <b>cloud security explorer</b> (graph queries such as "VMs exposed to the internet with high-severity vulnerabilities and a managed identity that can reach a key vault"), <b>agentless scanning</b> for VMs and containers, <b>data security posture management</b> (sensitive data discovery), <b>AI security posture management</b>, <b>code-to-cloud</b> DevOps context, <b>permissions management</b>, <b>secret scanning</b>, governance rules and regulatory compliance beyond MCSB.</li></ul>
<h3>Secure score</h3>
<ul><li>Recommendations are grouped into <b>security controls</b> (such as "Enable MFA", "Secure management ports", "Remediate vulnerabilities").</li>
<li>Each control has max points. You earn them by remediating <b>every</b> resource in the control: the score is proportional to healthy resources.</li>
<li>Your score = points earned ÷ max points. <b>Exempted</b> resources don't count against you; preview recommendations don't affect the score.</li>
<li><b>Governance rules</b> assign owners and due dates to recommendations automatically. <b>Quick fix</b> and <b>Fix</b> buttons remediate some recommendations in place.</li></ul>
<div class="viz" id="viz-score"></div>
<div class="viz" id="viz-cspmsort"></div>
<div class="tip"><b>Exam tip.</b> "Find internet-exposed VMs with critical CVEs that can reach sensitive data" is <b>attack path analysis</b> or the <b>cloud security explorer</b>, both <b>Defender CSPM</b> features. Foundational CSPM can't do it.</div>`},
{id:"comp",num:"4.2",title:"Regulatory compliance, standards and recommendations",html:`
<h3>Security standards</h3>
<ul><li>A <b>standard</b> is a set of controls with assessments. The <b>Microsoft cloud security benchmark</b> (MCSB) is assigned by default to every Azure subscription and AWS/GCP connector.</li>
<li>With <b>Defender CSPM</b> (or any paid plan), add <b>regulatory standards</b>: NIST SP 800-53, PCI DSS 4.0, ISO 27001, SOC 2, CIS benchmarks, HIPAA, FedRAMP, CMMC and more. In Azure they're implemented as Azure Policy initiatives.</li>
<li><b>Custom standards</b>: build your own from built-in recommendations, or create <b>custom recommendations</b> from Azure Policy definitions or <b>KQL</b> queries (multicloud).</li></ul>
<h3>Regulatory compliance dashboard</h3>
<p>Shows each standard's controls as passing, failing or skipped, with the failing resources behind each. Some controls are <b>Microsoft responsibility</b> or need <b>manual attestation</b>. Download <b>compliance reports</b> and Microsoft audit reports (SOC, ISO) for auditors. Continuous export can stream compliance data to Log Analytics.</p>
<h3>Recommendations</h3>
<ul><li>Each recommendation has a <b>risk level</b> (based on exploitability, business impact and attack paths in Defender CSPM), affected resources, remediation steps and sometimes a Fix button.</li>
<li><b>Exempt</b> a resource (waiver or mitigated) when the risk is accepted or handled elsewhere. Use <b>Deny</b> or <b>Enforce</b> to stop new non-compliant resources via Azure Policy.</li></ul>
<div class="viz" id="viz-stdsort"></div>
<div class="viz" id="viz-compq"></div>
<div class="tip"><b>Exam tip.</b> "Track PCI DSS compliance across Azure and AWS" means add the PCI DSS standard to the subscriptions and connectors in <b>Environment settings &gt; Security policies</b>. It needs a paid plan.</div>`},
{id:"cwp",num:"4.3",title:"Workload protection plans",html:`
<p><b>Cloud workload protection</b> plans add threat detection for specific resource types. Enable them per subscription in <b>Environment settings &gt; Defender plans</b> (and configure components such as agents or sensors).</p>
<ul><li><b>Defender for Servers</b> (Plan 1 / Plan 2): EDR, vulnerability management, JIT, FIM (module 3).</li>
<li><b>Defender for Storage</b>: activity monitoring, malware scanning, sensitive data threat detection.</li>
<li><b>Defender for Databases</b>: Azure SQL, SQL on machines, open-source relational, Cosmos DB.</li>
<li><b>Defender for Containers</b>: AKS, EKS, GKE and registries.</li>
<li><b>Defender for App Service</b>, <b>Defender for Key Vault</b>, <b>Defender for Resource Manager</b> (suspicious management operations, such as a toolkit like MicroBurst), <b>Defender for APIs</b>, and <b>Defender for AI Services</b>.</li></ul>
<p>Alerts from every plan flow into Defender for Cloud and, through the integration, into <b>Microsoft Defender XDR</b> incidents and Microsoft Sentinel.</p>
<h3>Managing alerts</h3>
<ul><li>Each alert has a <b>severity</b> (High, Medium, Low, Informational), the affected resource, MITRE ATT&amp;CK tactics, and <b>take action</b> steps (mitigate, prevent, trigger automation, suppress).</li>
<li><b>Suppression rules</b> dismiss known benign alerts automatically. Alerts can be <b>simulated</b> with sample alerts to test pipelines.</li></ul>
<div class="viz" id="viz-plansort"></div>
<div class="viz" id="viz-alertq"></div>
<div class="tip"><b>Exam tip.</b> "Alert when someone runs suspicious management operations against the subscription" is <b>Defender for Resource Manager</b>, not Defender for Servers.</div>`},
{id:"multi",num:"4.4",title:"Multicloud, vulnerability management and EASM",html:`
<h3>Connecting AWS and GCP</h3>
<ul><li>In <b>Environment settings</b>, add an <b>AWS connector</b> (management account for the whole organization, or a single account) or a <b>GCP connector</b> (organization or project).</li>
<li>Defender for Cloud gives you a CloudFormation template (AWS) or gcloud script (GCP) that creates roles Defender uses to read configuration. No credentials are stored.</li>
<li>Pick plans per connector: foundational CSPM, Defender CSPM, Defender for Servers (with Arc auto-provisioning), Containers, Databases.</li>
<li>AWS and GCP resources then show up in recommendations, secure score, inventory and attack paths alongside Azure.</li>
<li>On-premises servers come in through <b>Azure Arc</b>.</li></ul>
<h3>Microsoft Defender Vulnerability Management settings</h3>
<ul><li>Choose the <b>vulnerability assessment</b> solution for machines: the built-in MDVM (recommended), or bring your own.</li>
<li>Findings appear in the recommendation "Machines should have vulnerability findings resolved", grouped by CVE, with exploit and threat context from Defender.</li>
<li>MDVM <b>premium</b> (Plan 2) adds security baselines assessment, browser extension and certificate inventory, and the ability to block vulnerable apps.</li></ul>
<h3>Microsoft Defender External Attack Surface Management (EASM)</h3>
<ul><li>Discovers your <b>internet-facing assets</b> from the outside, as an attacker would: domains, hosts, IPs, certificates, web pages, ASNs. It starts from <b>seeds</b> (known domains, IP blocks) and builds an inventory.</li>
<li>Flags <b>unmanaged assets</b> (shadow IT), expiring certificates, exposed services, and known CVEs on those assets.</li>
<li>Deploy an EASM resource in Azure, add discovery seeds, then review <b>dashboards</b> (attack surface summary, security posture, GDPR, OWASP Top 10).</li></ul>
<div class="viz" id="viz-connect"></div>
<div class="viz" id="viz-easm"></div>
<div class="tip"><b>Exam tip.</b> EASM looks at you from the <b>internet</b> and finds assets you didn't know you had. Defender CSPM looks from <b>inside</b> your cloud accounts. The exam may ask which finds a forgotten marketing website on another host.</div>`},
{id:"sentws",num:"4.5",title:"Microsoft Sentinel workspaces, roles and content hub",html:`
<p><b>Microsoft Sentinel</b> is Microsoft's cloud-native SIEM and SOAR. It runs on a <b>Log Analytics workspace</b> and is increasingly used through the unified <b>Microsoft Defender portal</b>, together with Defender XDR.</p>
<h3>Creating and connecting workspaces</h3>
<ul><li>Create (or pick) a Log Analytics workspace, then <b>add Microsoft Sentinel</b> to it. Prefer few workspaces: separate them only for data residency, billing separation or strict access boundaries.</li>
<li>Connect the workspace to the <b>Defender portal</b> for unified incidents, hunting and the Sentinel data lake. A primary workspace is required; others can be added.</li>
<li>For managed service providers and multiple tenants, use <b>Azure Lighthouse</b> and <b>workspace manager</b> to manage content across workspaces.</li></ul>
<h3>Sentinel roles (assign at resource group or workspace)</h3>
<ul><li><b>Microsoft Sentinel Reader</b>: view data, incidents, workbooks.</li>
<li><b>Microsoft Sentinel Responder</b>: Reader plus manage incidents (assign, change status and severity).</li>
<li><b>Microsoft Sentinel Contributor</b>: Responder plus create and edit analytics rules, workbooks and other content.</li>
<li><b>Microsoft Sentinel Playbook Operator</b>: list and run playbooks manually.</li>
<li><b>Microsoft Sentinel Automation Contributor</b>: assigned to the Sentinel service account so automation rules can run playbooks (not for users).</li>
<li><b>Logic App Contributor</b> is needed to create or edit playbooks. Resource-context RBAC and table-level RBAC limit what data people see.</li></ul>
<h3>Content hub</h3>
<p>The <b>content hub</b> delivers packaged <b>solutions</b> (for example, Microsoft Entra ID, Azure Activity, Palo Alto, AWS) that bundle data connectors, analytics rule templates, hunting queries, workbooks, parsers and playbooks. Install the solution, then enable the pieces you need, and update when new versions arrive.</p>
<div class="viz" id="viz-roles"></div>
<div class="viz" id="viz-hub"></div>
<div class="tip"><b>Exam tip.</b> "Analysts must change incident status but must not edit analytics rules" is <b>Microsoft Sentinel Responder</b>. "Run playbooks on demand" is <b>Playbook Operator</b>.</div>`},
{id:"collect",num:"4.6",title:"Data connectors, syslog, CEF, Windows events and custom tables",html:`
<h3>Microsoft data connectors for Azure</h3>
<ul><li><b>Service-to-service</b> connectors: Microsoft Entra ID (sign-in and audit logs, needs P1/P2 for sign-ins), <b>Azure Activity</b> (via a diagnostic settings policy), Microsoft Defender XDR (incidents and raw tables), Defender for Cloud alerts, Microsoft 365 (Office activity), Azure Firewall, Key Vault, Storage and other <b>diagnostic settings</b> based sources.</li>
<li>Many of these are free to ingest (Azure Activity, Office 365 audit, Defender alerts).</li></ul>
<h3>Syslog and Common Event Format (CEF)</h3>
<ul><li>Both are collected by the <b>Azure Monitor Agent</b> (AMA) on a Linux machine, configured by a <b>data collection rule</b> (DCR). The legacy Log Analytics agent is retired.</li>
<li><b>Syslog via AMA</b> lands in the <b>Syslog</b> table. <b>CEF via AMA</b> lands in <b>CommonSecurityLog</b>. Appliances (firewalls, proxies) send to a <b>Linux log forwarder</b> running rsyslog or syslog-ng plus AMA.</li>
<li>Select facilities and minimum severity in the DCR to control volume. Don't collect the same facility as both Syslog and CEF, or you'll duplicate data.</li></ul>
<h3>Windows Security events</h3>
<ul><li><b>Windows Security Events via AMA</b> sends events to the <b>SecurityEvent</b> table. Choose <b>All events</b>, <b>Common</b>, <b>Minimal</b> or <b>Custom</b> (XPath queries) in the DCR.</li>
<li><b>Windows Event Forwarding</b> (WEF): Windows machines forward events to a <b>Windows Event Collector</b> server; the <b>Windows Forwarded Events</b> connector collects them from the collector into the <b>WindowsEvent</b> table.</li>
<li>Arc-enabled servers can run AMA too, so on-premises and multicloud Windows machines are covered.</li></ul>
<h3>Custom log tables</h3>
<ul><li>Create a <b>DCR-based custom table</b> (name ending in <b>_CL</b>) with a schema you define.</li>
<li>Ingest with the <b>Logs Ingestion API</b> (a data collection endpoint plus a DCR and an Entra app with Monitoring Metrics Publisher), or collect text and JSON files with AMA.</li>
<li><b>Transformations</b> in the DCR (KQL) filter, parse or drop columns at ingestion time, for example to remove PII or cut cost.</li></ul>
<div class="viz" id="viz-cef"></div>
<div class="viz" id="viz-tablesort"></div>
<div class="tip"><b>Exam tip.</b> CEF goes to <b>CommonSecurityLog</b>, syslog to <b>Syslog</b>, Windows security events to <b>SecurityEvent</b>, WEF to <b>WindowsEvent</b>, and custom data to a table ending in <b>_CL</b>.</div>`},
{id:"rules",num:"4.7",title:"Analytics rules and hunting with KQL",html:`
<h3>Analytics rules</h3>
<ul><li><b>Scheduled</b>: a KQL query that runs on a schedule (every 5 minutes to 14 days) over a lookback window, with a threshold, <b>entity mapping</b> (Account, Host, IP, URL…), <b>alert grouping</b> into incidents, and suppression.</li>
<li><b>Near-real-time (NRT)</b>: runs every minute for the most urgent detections, with some query limits.</li>
<li><b>Microsoft security</b> rules create incidents from alerts of other Microsoft products (less relevant once the workspace is in the Defender portal, where XDR correlates them).</li>
<li><b>Anomaly</b> rules (machine learning) and <b>Fusion</b> / multistage attack detection that correlates low-fidelity signals.</li>
<li><b>Threat intelligence</b> matching rules compare logs to indicators.</li>
<li>Create rules from <b>templates</b> in the content hub, and map them to MITRE ATT&amp;CK tactics.</li></ul>
<h3>KQL essentials</h3>
<ul><li>Start with a table, then pipe: <code>where</code> (filter), <code>project</code> (pick columns), <code>summarize count() by</code> (aggregate), <code>extend</code> (new column), <code>join</code>, <code>top</code>, <code>order by</code>, <code>bin(TimeGenerated, 1h)</code>, <code>ago(1d)</code>.</li>
<li>Failed sign-ins in Entra ID: <code>SigninLogs | where ResultType != "0"</code>. Windows failed logons: <code>SecurityEvent | where EventID == 4625</code>.</li></ul>
<h3>Hunting</h3>
<p>Run <b>hunting queries</b>, bookmark interesting results, use <b>livestream</b> for real-time sessions, and promote findings to incidents or new analytics rules. In the Defender portal, <b>advanced hunting</b> queries Sentinel and XDR tables together.</p>
<div class="viz" id="viz-kql"></div>
<div class="viz" id="viz-rulesort"></div>
<div class="tip"><b>Exam tip.</b> An analytics rule creates alerts, but you only get useful incidents if <b>entities are mapped</b>. Without entity mapping, investigation graphs and automation that rely on entities don't work.</div>`},
{id:"auto",num:"4.8",title:"Automation rules and playbooks",html:`
<h3>Automation rules</h3>
<ul><li>Run when an <b>incident is created</b>, an <b>incident is updated</b>, or an <b>alert is created</b>.</li>
<li><b>Conditions</b>: analytics rule name, severity, tactics, entities, tags, owner and more.</li>
<li><b>Actions</b>: assign an owner, change status or severity, add tags, add a task list, <b>run a playbook</b>, and set an expiration.</li>
<li>Rules run in <b>order</b> (1, 2, 3…). Use them to triage at scale, such as auto-closing known benign alerts, or assigning high-severity identity incidents to the identity team.</li></ul>
<h3>Playbooks</h3>
<ul><li>A playbook is an <b>Azure Logic App</b> with a Microsoft Sentinel trigger: <b>incident</b>, <b>alert</b> or <b>entity</b> trigger.</li>
<li>Typical actions: disable a user in Entra ID, revoke sessions, isolate a machine through Defender for Endpoint, block an IP on a firewall, post to Teams, open a ServiceNow ticket.</li>
<li>Use a <b>managed identity</b> for the Logic App and grant it only the roles it needs (such as Microsoft Sentinel Responder on the workspace).</li>
<li>To let an automation rule call a playbook, Sentinel's service account needs <b>Microsoft Sentinel Automation Contributor</b> on the playbook's resource group (granted from Settings &gt; Playbook permissions).</li></ul>
<h3>Defender for Cloud workflow automation</h3>
<p>Defender for Cloud has its own <b>workflow automation</b>: when a recommendation, alert or regulatory compliance assessment matches conditions, it triggers a Logic App. Continuous export streams alerts and recommendations to Log Analytics or Event Hubs.</p>
<div class="viz" id="viz-soar"></div>
<div class="viz" id="viz-autoq"></div>
<div class="tip"><b>Exam tip.</b> Automation rules decide <b>when</b> and orchestrate; playbooks (Logic Apps) do the <b>complex</b> work and call external systems. "Auto-assign and tag" needs only an automation rule.</div>`},
{id:"retain",num:"4.9",title:"Data retention and Purview Audit in Defender XDR",html:`
<h3>Table plans and retention in the Sentinel workspace</h3>
<ul><li><b>Analytics</b> tier: full KQL, analytics rules, hunting. <b>Interactive retention</b> is 90 days included with Sentinel (default for Sentinel tables), extendable up to 2 years.</li>
<li><b>Total retention</b> (long-term) extends up to <b>12 years</b> at low cost. Data past the interactive period can be queried with <b>search jobs</b> or brought back with <b>restore</b>.</li>
<li><b>Basic</b> logs plan: cheaper ingestion for high-volume, lower-value logs, limited KQL, 30-day interactive.</li>
<li><b>Microsoft Sentinel data lake</b> (data lake tier, formerly auxiliary): very low-cost storage for large volumes (such as flow logs or firewall logs), queried with KQL jobs and notebooks, with long retention. Analytics-tier tables can be mirrored to the lake.</li>
<li>Set retention per table in <b>Tables</b> (Log Analytics) or the Defender portal's table management. Workspace-level default retention applies otherwise.</li></ul>
<h3>Querying Microsoft Purview Audit in Defender XDR</h3>
<ul><li>Purview <b>Audit</b> records user and admin activity across Microsoft 365: file access, mailbox access (MailItemsAccessed), sharing, admin changes, Copilot interactions.</li>
<li>In the Microsoft Defender portal, <b>advanced hunting</b> exposes it in tables such as <b>CloudAppEvents</b> (from Defender for Cloud Apps' Microsoft 365 connector), and you can search audit logs in Purview with <b>Audit (Standard)</b> 180-day or <b>Audit (Premium)</b> 1-year (up to 10 years with add-on) retention.</li>
<li>Join audit events with sign-in and device data to investigate data exfiltration end to end.</li></ul>
<div class="viz" id="viz-tiers"></div>
<div class="viz" id="viz-retq"></div>
<div class="tip"><b>Exam tip.</b> "Keep firewall logs for 7 years as cheaply as possible, and query them only during investigations" points to long-term (total) retention or the data lake tier, not 7 years of interactive retention.</div>`},
{id:"copilot",num:"4.10",title:"Microsoft Security Copilot",html:`
<p><b>Microsoft Security Copilot</b> is a generative AI assistant for security teams. It's embedded in Defender, Entra, Intune, Purview and Sentinel, and has a <b>standalone</b> portal (securitycopilot.microsoft.com).</p>
<h3>Workspaces and capacity</h3>
<ul><li>Security Copilot runs on <b>security compute units</b> (SCUs). You provision capacity (provisioned SCUs, plus optional <b>overage</b>) in an Azure subscription, then link it to a <b>workspace</b>. Microsoft 365 E5 includes a monthly allocation for eligible tenants.</li>
<li><b>Workspaces</b> separate teams or regions, each with its own capacity, settings, plugins and data storage location. Settings include data sharing and whether prompts can be evaluated outside your geography.</li></ul>
<h3>Permissions and roles</h3>
<ul><li>Security Copilot has two roles: <b>Copilot owner</b> (manage settings, plugins, capacity, roles) and <b>Copilot contributor</b> (use it: create sessions and prompts).</li>
<li>By default, <b>Security Administrators</b> and Global Administrators are owners; you can add users or groups as contributors (often "Everyone" is removed for least privilege).</li>
<li>Copilot works <b>on behalf of the user</b>: it can only see data the user can access in each product (Defender, Entra, Purview). Copilot roles don't grant access to data.</li></ul>
<h3>Plugins</h3>
<ul><li><b>Microsoft plugins</b>: Defender XDR, Sentinel, Entra, Intune, Purview, Defender for Cloud, Defender EASM, Azure Firewall, Azure WAF and others. Owners decide which are on and whether contributors can manage them.</li>
<li><b>Non-Microsoft plugins</b> (ServiceNow, Splunk, CrowdStrike) and <b>custom plugins</b> (KQL, API, GPT) extend it.</li>
<li><b>Promptbooks</b> package a series of prompts (for example, incident investigation) to run with one click.</li></ul>
<h3>Agents</h3>
<ul><li><b>Microsoft agents</b> perform tasks autonomously: the <b>Phishing Triage Agent</b> (classifies user-reported phishing in Defender), the <b>Conditional Access Optimization Agent</b> (finds gaps in CA policies in Entra), the <b>Vulnerability Remediation Agent</b> (Intune), <b>Threat Intelligence Briefing Agent</b> and the Purview <b>Alert Triage Agents</b>.</li>
<li><b>Partner agents</b> from the <b>Security Store</b> can be added. Each agent runs under an identity with defined permissions, and you review its decisions and give feedback.</li></ul>
<div class="viz" id="viz-scc"></div>
<div class="viz" id="viz-sccq"></div>
<div class="tip"><b>Exam tip.</b> Security Copilot never widens access: it uses the <b>signed-in user's</b> permissions. Giving someone the Copilot contributor role doesn't let them read Sentinel data they couldn't read before.</div>`}
];

const G={
 cspm:[["CNAPP","Cloud-native application protection platform: CSPM plus CWP"],["Foundational CSPM","Free: recommendations, secure score, inventory, MCSB, multicloud posture"],["Defender CSPM","Paid: attack paths, cloud security explorer, agentless scanning, DSPM, AI-SPM, permissions management"],["Attack path analysis","Finds exploitable chains from exposure to critical assets"],["Cloud security explorer","Graph queries across resources, risks and relationships"],["Cloud security graph","Context engine linking assets, identities, vulnerabilities and data"],["Secure score","Points earned / max points across security controls"],["Security control","Group of related recommendations with max points"],["How a control's points are earned","Proportionally to healthy resources; fully when all are remediated"],["Do exemptions affect secure score?","Exempted resources don't count against the score"],["Governance rules","Automatically assign owners and due dates to recommendations"],["Asset inventory","Every resource with its security state, filterable and exportable"],["Permissions management (CIEM)","Defender CSPM recommendations for unused or excessive permissions"]],
 std:[["Microsoft cloud security benchmark","Default standard assigned to every subscription and connector"],["Regulatory standard examples","NIST SP 800-53, PCI DSS 4.0, ISO 27001, SOC 2, CIS, HIPAA"],["Adding regulatory standards needs","A paid Defender plan, such as Defender CSPM"],["Custom standard","Your own set of recommendations as a standard"],["Custom recommendation sources","Azure Policy definitions or KQL queries (multicloud)"],["Regulatory compliance dashboard","Shows passing and failing controls per standard"],["Manual attestation","Controls you mark compliant yourself with evidence"],["Exemption categories","Waiver (risk accepted) or mitigated (handled elsewhere)"],["Continuous export","Streams alerts, recommendations and compliance data to Log Analytics or Event Hubs"],["Where to add standards","Environment settings > subscription or connector > Security policies"]],
 cwp:[["Cloud workload protection","Threat detection plans per resource type"],["Defender for Resource Manager","Alerts on suspicious management operations against subscriptions"],["Which Defender plan flags dangling DNS and attacks on web apps?","Defender for App Service"],["Which Defender plan alerts on a vault being accessed from a Tor exit node?","Defender for Key Vault"],["Which Defender plan inventories APIM APIs and detects attacks on them?","Defender for APIs"],["Alert severities","High, Medium, Low, Informational"],["Suppression rule","Automatically dismisses known benign alerts"],["Sample alerts","Simulated alerts to test detection pipelines"],["Where alerts converge","Defender for Cloud, Defender XDR incidents and Sentinel"],["Enable a plan","Environment settings > subscription > Defender plans"],["AWS connector setup","CloudFormation template creating roles for Defender for Cloud"],["GCP connector setup","gcloud script creating service accounts for Defender for Cloud"],["Multicloud servers","Defender for Servers on EC2/Compute Engine via Arc auto-provisioning"],["Built-in VA for machines","Microsoft Defender Vulnerability Management"],["MDVM premium features","Security baselines, browser extension and certificate inventory, block vulnerable apps"],["Defender EASM","Discovers internet-facing assets from the outside"],["EASM seeds","Known domains, IPs and ASNs used to start discovery"],["EASM finds","Shadow IT, expiring certificates, exposed services, CVEs on internet assets"]],
 sen:[["Microsoft Sentinel","Cloud-native SIEM and SOAR on a Log Analytics workspace"],["Unified security operations","Sentinel and Defender XDR together in the Defender portal"],["When to use multiple workspaces","Data residency, billing separation, strict access boundaries"],["Sentinel Reader","View data, incidents and workbooks"],["Sentinel Responder","Reader plus manage incidents"],["Sentinel Contributor","Responder plus create and edit content like analytics rules"],["Sentinel Playbook Operator","List and run playbooks manually"],["Sentinel Automation Contributor","For the Sentinel service account to run playbooks from automation rules"],["Who can create playbooks?","Users with Logic App Contributor (plus Sentinel Contributor for integration)"],["Content hub","Packaged solutions with connectors, rules, hunting queries, workbooks, playbooks"],["Workspace manager","Manage content across multiple Sentinel workspaces"],["Azure Lighthouse with Sentinel","Manage customers' workspaces from a service provider tenant"],["Table-level RBAC","Restrict access to specific tables in a workspace"]],
 col:[["Azure Activity connector","Uses a diagnostic settings policy to stream subscription activity"],["Entra ID connector","Sign-in and audit logs; sign-ins need P1/P2"],["Syslog via AMA table","Syslog"],["CEF via AMA table","CommonSecurityLog"],["Linux log forwarder","rsyslog or syslog-ng plus AMA, receiving from appliances"],["Avoid duplicate syslog and CEF","Don't collect the same facility for both"],["Windows Security Events via AMA table","SecurityEvent"],["Windows security event sets","All, Common, Minimal, Custom (XPath)"],["WEF","Windows Event Forwarding to a Windows Event Collector"],["Windows Forwarded Events table","WindowsEvent"],["DCR","Data collection rule: what to collect, transformations and destination"],["DCE","Data collection endpoint used by the Logs Ingestion API"],["Custom table suffix","_CL"],["Logs Ingestion API needs","DCE, DCR and an Entra app with Monitoring Metrics Publisher"],["Ingestion-time transformation","KQL in a DCR to filter or modify data before storage"],["Legacy Log Analytics agent","Retired; use Azure Monitor Agent"]],
 rul:[["Scheduled rule","KQL on a schedule with lookback, threshold, entity mapping and grouping"],["NRT rule","Near-real-time rule that runs every minute"],["Microsoft security rule","Creates incidents from other Microsoft products' alerts"],["Fusion","ML-based multistage attack correlation"],["Anomaly rules","ML templates detecting unusual behavior"],["Entity mapping","Maps query columns to entities like Account, Host, IP"],["Alert grouping","Combines related alerts into one incident"],["Scheduled rule max lookback","14 days"],["Failed Entra sign-ins","SigninLogs | where ResultType != \"0\""],["Windows failed logon event ID","4625"],["Windows successful logon event ID","4624"],["KQL summarize","Aggregates, e.g. summarize count() by IPAddress"],["KQL project","Selects columns"],["KQL ago()","Relative time, e.g. ago(1d)"],["KQL bin()","Buckets values, e.g. bin(TimeGenerated, 1h)"],["Bookmark","Saved hunting result that can be added to an incident"],["Livestream","Real-time query session for active hunting"],["Advanced hunting","Defender portal hunting across Sentinel and XDR tables"]],
 aut:[["Automation rule triggers","Incident created, incident updated, alert created"],["Automation rule actions","Assign owner, change status/severity, add tags or tasks, run playbook"],["Automation rule order","Run in the order number you set"],["Playbook","Logic App with a Sentinel incident, alert or entity trigger"],["Playbook identity","Managed identity with least-privileged roles"],["Playbook permissions setting","Grants Sentinel Automation Contributor on playbook resource groups"],["Defender for Cloud workflow automation","Triggers Logic Apps on alerts, recommendations or compliance changes"],["Typical playbook actions","Disable user, revoke sessions, isolate device, block IP, notify Teams"],["Interactive retention","Analytics-tier queryable period: 90 days included with Sentinel, up to 2 years"],["Total retention","Long-term retention up to 12 years"],["Search job","Queries data in long-term retention asynchronously"],["Restore","Brings archived data back to interactive for investigation"],["Basic logs","Lower-cost plan, limited KQL, 30-day interactive"],["Sentinel data lake","Very low-cost tier for high-volume logs with long retention"],["Purview Audit (Standard)","180-day audit log retention"],["Purview Audit (Premium)","1-year retention by default, up to 10 years with add-on"],["CloudAppEvents table","Advanced hunting table with Microsoft 365 activity"],["MailItemsAccessed","Audit event recording mailbox item access"]],
 scc:[["Microsoft Security Copilot","Generative AI assistant for security teams"],["SCU","Security compute unit: Security Copilot capacity"],["Overage units","Extra capacity used when provisioned SCUs run out"],["Security Copilot workspace","Separate capacity, settings, plugins and data location for a team"],["Copilot owner","Manages Security Copilot settings, plugins and roles"],["Copilot contributor","Uses Security Copilot"],["Security Copilot data access","Uses the signed-in user's permissions in each product"],["Microsoft plugins examples","Defender XDR, Sentinel, Entra, Intune, Purview, Defender EASM"],["Custom plugin types","KQL, API and GPT plugins"],["Promptbook","A saved series of prompts run together"],["Phishing Triage Agent","Classifies user-reported phishing in Defender"],["Conditional Access Optimization Agent","Finds gaps and overlaps in CA policies"],["Security Store","Marketplace for partner security agents and solutions"]]
};
const DECKS=[["cspm","Defender CSPM and secure score"],["std","Compliance and standards"],["cwp","Workload protection and multicloud"],["sen","Sentinel workspaces and roles"],["col","Data collection"],["rul","Analytics rules and KQL"],["aut","Automation and retention"],["scc","Security Copilot"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"You need to find VMs exposed to the internet that have critical vulnerabilities and a managed identity with access to a key vault. What should you use?",o:["Attack path analysis / cloud security explorer in Defender CSPM","Foundational CSPM recommendations filtered by severity and resource type","Azure Advisor security recommendations","Network Watcher topology"],a:0,e:"Graph-based risk queries need Defender CSPM."},
 {q:"Which capability is included free in foundational CSPM?",o:["Secure score and security recommendations","Attack path analysis","Agentless scanning","Data security posture management"],a:0,e:"The others are Defender CSPM features."},
 {q:"A security control is worth 10 points and covers 20 VMs. 15 are healthy. Roughly how many points do you earn?",o:["7.5","10","2.5","5.0"],a:0,e:"Points are proportional to healthy resources: 15/20 × 10."},
 {q:"A recommendation doesn't apply to a VM because a third-party tool covers it. How do you stop it hurting the secure score?",o:["Create an exemption with category Mitigated","Delete the VM and redeploy it from a hardened image","Disable Defender for Cloud","Ignore it"],a:0,e:"Exempted resources don't count against the score."},
 {q:"Recommendations should be automatically assigned to resource owners based on a tag, with due dates. What should you configure?",o:["Governance rules","Workflow automation","Suppression rules","Continuous export"],a:0,e:"Governance rules assign owners and due dates."},
 {q:"Which standard is assigned by default when you onboard a subscription to Defender for Cloud?",o:["Microsoft cloud security benchmark","PCI DSS 4.0","ISO 27001:2022","NIST Cybersecurity Framework"],a:0,e:"MCSB is the default."},
 {q:"You want to track PCI DSS 4.0 compliance in Defender for Cloud. What's required?",o:["A paid plan such as Defender CSPM, then add the standard in Security policies","Only the free foundational CSPM, which includes every regulatory standard","An Azure Lighthouse delegation to a compliance partner's tenant","A Sentinel workspace with the PCI DSS compliance workbook installed"],a:0,e:"Regulatory standards beyond MCSB need a paid plan."},
 {q:"Your company has internal security requirements not covered by any standard. What should you create?",o:["A custom standard with custom recommendations","A suppression rule that hides findings not covered by standards","A new subscription with its own default initiative","A Sentinel workbook only"],a:0,e:"Custom standards and recommendations cover internal requirements."},
 {q:"A custom recommendation must check AWS resources too. What should you base it on?",o:["A KQL query","An Azure Policy definition only","A resource lock","A deployment stack"],a:0,e:"KQL-based custom recommendations work multicloud."},
 {q:"Auditors want a PDF report showing compliance status for ISO 27001. Where do you get it?",o:["Regulatory compliance dashboard > Download report","Secure score page > Export to CSV","Activity log > Download as CSV","Azure Advisor > Security > Download PDF"],a:0,e:"The dashboard offers downloadable compliance reports."},
 {q:"Alerts must stream to a third-party SIEM through Event Hubs. What should you configure in Defender for Cloud?",o:["Continuous export","Workflow automation","Governance rules","A suppression rule"],a:0,e:"Continuous export sends alerts and recommendations to Event Hubs or Log Analytics."},
 {q:"You receive an alert that a known toolkit ran suspicious operations against your subscription's management plane. Which plan generated it?",o:["Defender for Resource Manager","Defender for Servers","Defender for App Service","Defender CSPM"],a:0,e:"Defender for Resource Manager watches ARM operations."},
 {q:"A benign scanner keeps raising the same alert. What should you configure?",o:["An alert suppression rule","Delete the plan","An exemption on the recommendation","A Deny policy"],a:0,e:"Suppression rules auto-dismiss known benign alerts."},
 {q:"You want to test that alerts reach your automation pipeline without a real attack. What should you do?",o:["Generate sample alerts in Defender for Cloud","Disable all Defender plans, then turn them back on","Create a fake VM with a known-vulnerable image","Run an unannounced penetration test against production"],a:0,e:"Sample alerts simulate detections."},
 {q:"Where do you enable Defender for Storage for a subscription?",o:["Environment settings > the subscription > Defender plans","Storage account > Access keys > Advanced threat protection","Entra ID > Security > Identity Protection","Sentinel > Data connectors > Azure Storage"],a:0,e:"Plans are enabled per subscription."},
 {q:"You need AWS EC2 instances to appear in secure score and get Defender for Servers. What do you create?",o:["An AWS connector in Environment settings, with Defender for Servers and Arc auto-provisioning","An Azure Lighthouse delegation from the AWS account to your tenant","A site-to-site VPN from AWS to Azure so Defender can scan the instances","A Defender EASM workspace that discovers the instances' public IPs"],a:0,e:"Multicloud connectors onboard AWS accounts."},
 {q:"How does Defender for Cloud get access to an AWS account?",o:["A CloudFormation template creates IAM roles that Defender assumes","You paste the AWS root account access keys into the connector","Through an ExpressRoute circuit peered with AWS Direct Connect","Through Azure Arc only, installed on every EC2 instance"],a:0,e:"No long-lived credentials are stored."},
 {q:"Which vulnerability assessment solution is built into Defender for Servers?",o:["Microsoft Defender Vulnerability Management","Qualys, which is the only option, with a separate license","Tenable Nessus agents deployed by Defender for Cloud","Network Watcher packet capture with vulnerability rules"],a:0,e:"MDVM is the built-in option."},
 {q:"Marketing launched a website on a third-party host years ago and nobody tracks it. Which service can discover it?",o:["Microsoft Defender External Attack Surface Management","Defender CSPM attack path analysis on your subscriptions","Azure Policy with an Audit assignment on all subscriptions","Defender for Servers Plan 2 on the web servers"],a:0,e:"EASM discovers internet-facing assets from the outside."},
 {q:"What does EASM use to begin discovering your attack surface?",o:["Seeds such as known domains, IP blocks and ASNs","A Log Analytics workspace that holds your sign-in and DNS logs","Azure Arc agents installed on every internet-facing server","Entra ID sign-in logs"],a:0,e:"Discovery starts from seeds."},
 {q:"You're adding Sentinel. What's the first resource you need?",o:["A Log Analytics workspace","An Event Hub","A storage account","A Logic App"],a:0,e:"Sentinel is enabled on a workspace."},
 {q:"Why should you minimize the number of Sentinel workspaces?",o:["Correlation, hunting and management are simpler in one workspace; split only for residency, billing or access needs","Sentinel can be enabled on only one workspace in each Microsoft Entra tenant, so extra workspaces sit idle","Each extra workspace adds a fixed monthly Sentinel license fee","Multiple workspaces can't use Azure RBAC or resource-context access"],a:0,e:"Fewer workspaces is the recommended design."},
 {q:"Tier 1 analysts must assign and close incidents but not change analytics rules. Which role?",o:["Microsoft Sentinel Responder","Microsoft Sentinel Contributor","Microsoft Sentinel Reader","Owner"],a:0,e:"Responder manages incidents."},
 {q:"Detection engineers must create and edit analytics rules and workbooks. Which role?",o:["Microsoft Sentinel Contributor","Microsoft Sentinel Responder","Microsoft Sentinel Playbook Operator","Log Analytics Reader"],a:0,e:"Contributor manages content."},
 {q:"Analysts need to run existing playbooks manually on incidents, but not edit them. Which role?",o:["Microsoft Sentinel Playbook Operator","Logic App Contributor","Microsoft Sentinel Contributor","Automation Contributor"],a:0,e:"Playbook Operator lists and runs playbooks."},
 {q:"An automation rule can't run a playbook. What permission is usually missing?",o:["Microsoft Sentinel Automation Contributor for the Sentinel service on the playbook's resource group","Owner on the subscription for the analyst who created the automation rule and the playbook","Key Vault Secrets User for the Sentinel service on the playbook","Contributor on the subscription for every Sentinel user"],a:0,e:"Grant it from Settings > Playbook permissions."},
 {q:"You want packaged connectors, rules and workbooks for Palo Alto firewalls. Where do you get them?",o:["Content hub solutions","Azure Marketplace VMs","GitHub only","Defender EASM"],a:0,e:"Content hub delivers solutions."},
 {q:"An MSSP must manage Sentinel in 30 customer tenants from its own tenant. What enables this?",o:["Azure Lighthouse (with workspace manager for content)","Guest accounts in every customer tenant with Sentinel Contributor","One shared workspace","Cross-tenant VPN"],a:0,e:"Lighthouse delegates access across tenants."},
 {q:"Which connector streams Azure subscription activity into Sentinel?",o:["Azure Activity (diagnostic settings policy)","Syslog via AMA from a Linux collector in the subscription","Windows Security Events","CEF via AMA"],a:0,e:"Azure Activity uses diagnostic settings."},
 {q:"A firewall appliance sends CEF messages. What's the recommended collection method?",o:["A Linux log forwarder with AMA and a CEF via AMA DCR","The legacy Log Analytics agent installed on the firewall appliance","Direct HTTPS to Sentinel","Windows Event Forwarding"],a:0,e:"AMA on a Linux forwarder handles CEF."},
 {q:"Where do CEF events land in the workspace?",o:["CommonSecurityLog","Syslog","SecurityEvent","WindowsEvent"],a:0,e:"CEF goes to CommonSecurityLog."},
 {q:"Logs are duplicated in Syslog and CommonSecurityLog. What's the likely cause?",o:["The same facility is collected by both a Syslog DCR and a CEF DCR","The Azure Monitor Agent is retired and sends logs twice","The workspace has two tables with the same retention","Basic logs are turned on for the Syslog table"],a:0,e:"Don't collect the same facility twice."},
 {q:"Windows servers must send only a curated set of security events to reduce cost. Which option?",o:["Windows Security Events via AMA with the Common (or Custom XPath) set","All Security Events via the legacy Log Analytics agent","The Office 365 connector with Exchange audit logs","CEF via AMA from a Linux forwarder on each server"],a:0,e:"Common and Custom limit the event set."},
 {q:"Workstations already forward events to a Windows Event Collector with WEF. Which connector collects them?",o:["Windows Forwarded Events (into WindowsEvent)","Syslog via AMA, using a Linux collector","Azure Activity, sent through diagnostic settings","Microsoft Entra ID sign-in and audit logs"],a:0,e:"The WEF connector reads forwarded events from the collector."},
 {q:"An app must push custom JSON security events into Sentinel. What do you need?",o:["A DCR-based custom table (_CL), a data collection endpoint, a DCR and the Logs Ingestion API","A storage account SAS token that Sentinel uses to read the JSON files","A CEF forwarder VM running AMA that converts the JSON events to Syslog","NSG flow logs sent to the workspace with a custom parsing function"],a:0,e:"The Logs Ingestion API uses DCE and DCR."},
 {q:"You must drop a column containing email addresses before it's stored. What should you use?",o:["An ingestion-time transformation in the DCR","A KQL query at search time that projects the column away","A workbook","An automation rule"],a:0,e:"DCR transformations filter or modify data at ingestion."},
 {q:"Which Windows event ID records a failed logon?",o:["4625","4624","4688","1102"],a:0,e:"4625 is an account failed to log on."},
 {q:"Which KQL returns failed Entra ID sign-ins?",o:["SigninLogs | where ResultType != \"0\"","SecurityEvent | where EventID == 4624","AzureActivity | where Level == \"Error\"","Syslog | where Facility == \"auth\""],a:0,e:"ResultType 0 means success."},
 {q:"Which KQL operator counts events per IP?",o:["summarize count() by IPAddress","project IPAddress, count","extend Count = count()","where IPAddress != \"\""],a:0,e:"summarize aggregates."},
 {q:"A detection must fire within about a minute of a privileged role assignment. Which rule type?",o:["Near-real-time (NRT)","Scheduled every 24 hours","Anomaly","Fusion"],a:0,e:"NRT rules run every minute."},
 {q:"Incidents created by a scheduled rule have no investigation graph and automation can't find the user. What's missing?",o:["Entity mapping","Alert grouping","A workbook","Suppression"],a:0,e:"Entities drive graphs and automation."},
 {q:"Low-fidelity signals across products should be correlated into one high-fidelity multistage incident. What does this?",o:["Fusion (multistage attack detection)","NRT rules (near-real-time)","Workbooks with KQL joins","Watchlists of known attackers"],a:0,e:"Fusion correlates signals with ML."},
 {q:"Hunters want to save interesting query results and attach them to an incident. What do they use?",o:["Bookmarks","Workbooks","Watchlists","Data connectors"],a:0,e:"Bookmarks preserve hunting findings."},
 {q:"All incidents from the 'Impossible travel' rule should be assigned to the identity team and tagged automatically. What's the simplest solution?",o:["An automation rule on incident created","A playbook that polls every minute","A workbook","A new workspace"],a:0,e:"Automation rules can assign and tag without a playbook."},
 {q:"When a high-severity incident involves a user, the user must be disabled in Entra ID and a Teams message sent. What do you build?",o:["A playbook (Logic App) triggered by an automation rule","An analytics rule only, with entity mapping for the user","A suppression rule that closes the incident automatically","A data connector for Microsoft Entra ID and Teams"],a:0,e:"Playbooks perform actions in other systems."},
 {q:"How should a playbook authenticate to Microsoft Graph to disable users?",o:["With a managed identity granted only the needed permissions","With a Global Administrator's password stored in the Logic App","With a storage account key saved in a Key Vault secret","Anonymously, since Graph trusts calls from Azure"],a:0,e:"Managed identities avoid stored credentials."},
 {q:"Defender for Cloud should open a ServiceNow ticket whenever a high-severity recommendation appears. What should you configure?",o:["Workflow automation with a Logic App","A Sentinel workbook","A governance rule only","Continuous export to storage"],a:0,e:"Workflow automation triggers Logic Apps."},
 {q:"In what order do automation rules run?",o:["By the order number you assign","Randomly","By creation date only","Alphabetically"],a:0,e:"You set the order."},
 {q:"How long is interactive retention included with Sentinel for analytics tables?",o:["90 days","30 days","1 year","7 days"],a:0,e:"Sentinel includes 90 days."},
 {q:"Logs must be kept for 7 years at low cost and queried rarely. What should you configure?",o:["Long-term (total) retention or the data lake tier","2-year interactive retention on the Analytics tier","Basic logs with 30 days only","Export to a VM disk"],a:0,e:"Total retention goes up to 12 years."},
 {q:"You need to query data that's in long-term retention for an investigation. What should you use?",o:["A search job (or restore)","A near-real-time (NRT) rule","A workbook with a long time range","A watchlist of archived events"],a:0,e:"Search jobs query archived data."},
 {q:"High-volume network flow logs are needed for occasional hunting but not for detections. Most cost-effective option?",o:["Microsoft Sentinel data lake tier","Analytics tier with 2-year retention","Interactive only for 90 days","Event Hubs"],a:0,e:"The data lake tier is very low cost for high-volume logs."},
 {q:"Which advanced hunting table contains Microsoft 365 activity such as SharePoint file access?",o:["CloudAppEvents","DeviceEvents","IdentityLogonEvents","SigninLogs"],a:0,e:"CloudAppEvents holds app activity from Defender for Cloud Apps connectors."},
 {q:"What's the default retention for Purview Audit (Standard)?",o:["180 days","90 days","1 year","10 years"],a:0,e:"Standard is 180 days; Premium is 1 year by default."},
 {q:"A Security Copilot user asks about Sentinel incidents they don't have access to. What happens?",o:["Copilot can't show them; it uses the user's own permissions","Copilot shows everything, because it runs with tenant-wide permissions","Copilot grants temporary access","The SCU is consumed and data is shown"],a:0,e:"Copilot works on behalf of the user."},
 {q:"Who can change Security Copilot plugin settings by default?",o:["Copilot owners (Security Administrators and Global Administrators)","Every user with the Copilot contributor role in the tenant","Only Microsoft support, through a service request","Users with the Microsoft Sentinel Reader role on the workspace"],a:0,e:"Owners manage settings and plugins."},
 {q:"The SOC in Europe and the SOC in the US need separate capacity, plugins and data locations in Security Copilot. What should you create?",o:["Separate workspaces","Separate tenants","Two Sentinel workspaces only","A promptbook"],a:0,e:"Workspaces separate capacity and settings."},
 {q:"What does Security Copilot consume as capacity?",o:["Security compute units (SCUs)","Data collection rules","Defender plans","Log Analytics GB"],a:0,e:"Capacity is measured in SCUs."},
 {q:"You want Security Copilot to query your own Log Analytics data with a fixed KQL query. What should you add?",o:["A custom KQL plugin","A Logic App connector","A workbook template","A data collection rule"],a:0,e:"Custom plugins can be KQL, API or GPT."},
 {q:"Which Security Copilot agent finds gaps in Conditional Access coverage?",o:["Conditional Access Optimization Agent","Phishing Triage Agent","Vulnerability Remediation Agent","Threat Intelligence Briefing Agent"],a:0,e:"It runs in Entra and suggests policy changes."},
 {q:"User-reported phishing emails pile up. Which Security Copilot agent helps?",o:["Phishing Triage Agent","Conditional Access Optimization Agent","Alert Triage Agent for DLP","Data Security agent"],a:0,e:"It classifies reported phishing in Defender."},
 {q:"Where do you find partner-built Security Copilot agents?",o:["Security Store","Azure Marketplace VM images","Content hub only","GitHub Actions"],a:0,e:"The Security Store offers partner agents and solutions."}
];

/* ---------- custom diagrams ---------- */
function vizScore(){
  const el=$("#viz-score");const C=[["Enable MFA",10,4,1],["Secure management ports",8,12,6],["Apply system updates",6,20,14],["Remediate vulnerabilities",6,20,9],["Encrypt data in transit",4,10,10],["Restrict unauthorized network access",4,15,9]];
  const fixed=C.map(c=>c[3]);let touched=new Set();
  function draw(){const earned=C.reduce((a,c,i)=>a+c[1]*fixed[i]/c[2],0),max=C.reduce((a,c)=>a+c[1],0),pct=Math.round(earned/max*100);
    el.innerHTML=`<div class="viz-title">Secure score calculator · tap Fix to remediate one resource</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Security control</th><th class="num">Max</th><th class="num">Healthy</th><th class="num">Points</th><th></th></tr>${C.map((c,i)=>`<tr><td>${c[0]}</td><td class="num">${c[1]}</td><td class="num ${fixed[i]===c[2]?"ok":""}">${fixed[i]}/${c[2]}</td><td class="num">${(c[1]*fixed[i]/c[2]).toFixed(1)}</td><td><button class="btn" data-f="${i}" ${fixed[i]===c[2]?"disabled":""}>Fix</button></td></tr>`).join("")}</table></div>
    <div class="xpbar" role="progressbar" aria-label="Secure score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
    <div class="caption" aria-live="polite">Secure score: <b>${pct}%</b> (${earned.toFixed(1)} of ${max} points). ${touched.has(0)?"Notice MFA: one account fixed moved the score more than one VM patched, because the control has more points and fewer resources.":"Points in each control are proportional to its healthy resources. Which fixes move the score most?"}</div>
    <div class="rv-prog s-small">${touched.size} of 6 controls improved</div>`;
    if(touched.size>=4)award("viz:score",30,"Raised the secure score")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(!b)return;const i=+b.dataset.f;fixed[i]=Math.min(C[i][2],fixed[i]+1);touched.add(i);draw()});draw();
}
function vizKql(){
  const el=$("#viz-kql");const run=new Set();
  const Q={"Failed Entra sign-ins by IP (last 1 day)":[`SigninLogs\n| where TimeGenerated > ago(1d)\n| where ResultType != "0"\n| summarize Failures = count() by IPAddress, UserPrincipalName\n| order by Failures desc\n| take 5`,`IPAddress        UserPrincipalName        Failures\n---------------  -----------------------  --------\n<span class="t-bad">198.51.100.23    ana.ruiz@contoso.com     412</span>\n<span class="t-bad">198.51.100.23    ben.ode@contoso.com      388</span>\n203.0.113.40     lee.chan@contoso.com     6\n<span class="t-n"># One IP, many users: a password spray.</span>`],
   "Windows failed logons (4625) per host":[`SecurityEvent\n| where EventID == 4625\n| summarize count() by Computer, bin(TimeGenerated, 1h)\n| where count_ > 50`,`Computer          TimeGenerated         count_\n----------------  --------------------  ------\n<span class="t-bad">vm-finance01      2026-11-09T02:00:00Z  1,204</span>\n<span class="t-n"># Brute force against one VM at 2 a.m. Is RDP open? Check JIT.</span>`],
   "Firewall denies from CEF appliances":[`CommonSecurityLog\n| where DeviceVendor == "Palo Alto Networks"\n| where DeviceAction == "deny"\n| summarize Denies = count() by SourceIP, DestinationPort\n| top 3 by Denies`,`SourceIP        DestinationPort  Denies\n--------------  ---------------  ------\n192.0.2.15      445              9,321\n192.0.2.15      3389             4,002\n<span class="t-n"># SMB and RDP scanning from one host.</span>`],
   "Role assignments in Azure (Activity)":[`AzureActivity\n| where OperationNameValue =~ "MICROSOFT.AUTHORIZATION/ROLEASSIGNMENTS/WRITE"\n| where ActivityStatusValue == "Success"\n| project TimeGenerated, Caller, ResourceGroup`,`TimeGenerated         Caller                   ResourceGroup\n--------------------  -----------------------  -------------\n<span class="t-bad">2026-11-09T03:12:44Z  svc-legacy@contoso.com   rg-payments</span>\n<span class="t-n"># A service account granting roles at 3 a.m. deserves a look.</span>`],
   "Mass file downloads (CloudAppEvents)":[`CloudAppEvents\n| where ActionType == "FileDownloaded"\n| summarize Files = count() by AccountDisplayName\n| where Files > 500`,`AccountDisplayName   Files\n-------------------  -----\n<span class="t-bad">Dana Wells           2,315</span>\n<span class="t-n"># Possible exfiltration before a resignation. Correlate with sign-ins.</span>`]};
  const K=Object.keys(Q);
  function draw(k){el.innerHTML=`<div class="viz-title">KQL hunting lab: run each query (no typing needed)</div>
    <div class="chips cmds">${K.map(q=>`<button class="chip ${run.has(q)?"seen":""}" data-q="${esc(q)}">${run.has(q)?"✓ ":""}${q}</button>`).join("")}</div>
    <pre class="term" aria-live="polite">${k?`<span class="t-c">${esc(Q[k][0])}</span>\n\n${Q[k][1]}`:`<span class="t-n">// Sentinel workspace: law-soc-prod. Pick a hunting query to run it.</span>`}</pre>
    <div class="rv-prog s-small">${run.size} of ${K.length} queries run</div>`;
    if(run.size===K.length){flag("hunter");award("viz:kql",30,"Ran every hunting query")}}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b){const k=K.find(x=>esc(x)===b.dataset.q)||b.dataset.q;run.add(k);draw(k)}});draw();
}
function vizTiers(){
  const el=$("#viz-tiers");const seen=new Set();let t="an";
  const T={an:["Analytics tier",["Full KQL","Analytics rules and NRT","90 days interactive included, up to 2 years","Highest ingestion cost"],"Detections and frequent hunting: sign-ins, security events, XDR data."],
    basic:["Basic logs",["Limited KQL (single table)","No scheduled analytics rules","30 days interactive","Lower ingestion cost, pay per query"],"High-volume troubleshooting logs you query occasionally."],
    lake:["Data lake tier",["KQL jobs and notebooks","Not for real-time detections","Long retention at very low cost","Lowest cost per GB"],"Flow logs, proxy and firewall logs, and history kept for compliance and retro-hunting."],
    lt:["Long-term (total) retention",["Search jobs and restore","Up to 12 years","Archived beyond interactive period","Low storage cost"],"Compliance retention for any table after its interactive period."]};
  function draw(){seen.add(t);const x=T[t];
    el.innerHTML=`<div class="viz-title">Where should this data live?</div>
    <div class="seg-row">${Object.keys(T).map(k=>`<button class="chip" data-t="${k}" aria-pressed="${k===t}">${T[k][0]}</button>`).join("")}</div>
    <div class="dep-row">${x[1].map(f=>`<span class="dep">${f}</span>`).join("")}</div>
    <div class="caption" aria-live="polite"><b>Best for:</b> ${x[2]}</div>
    <div class="rv-prog s-small">${seen.size} of 4 options explored</div>`;
    if(seen.size===4)award("viz:tiers",20,"Compared data tiers and retention")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(b){t=b.dataset.t;draw()}});draw();
}

registerModule({
  id:"pos",slug:"posture",title:"Security Posture and Monitoring",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:(,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["score","cspmsort","stdsort","compq","plansort","alertq","connect","easm","roles","hub","cef","tablesort","kql","rulesort","soar","autoq","tiers","retq","scc","sccq"],
  viz(){
vizScore();
sortViz($("#viz-cspmsort"),{title:"Free foundational CSPM or paid Defender CSPM?",bins:{f:"Foundational CSPM (free)",d:"Defender CSPM (paid)"},done:"Sorted every CSPM capability",
  items:[["Secure score","f","Free for everyone."],["Security recommendations","f","Free."],["Asset inventory","f","Free."],["Attack path analysis","d","Needs the security graph."],["Cloud security explorer","d","Graph queries."],["Agentless VM scanning for posture","d","Paid."],["Sensitive data discovery (DSPM)","d","Paid."],["AI security posture management","d","Paid."],["Multicloud posture for AWS and GCP","f","Foundational CSPM works for connectors too."]]});
sortViz($("#viz-stdsort"),{title:"What should you configure?",bins:{std:"Add a regulatory standard",cust:"Create a custom standard or recommendation",exm:"Create an exemption",deny:"Deny or Enforce via Policy"},done:"Matched every compliance task",
  items:[["Track ISO 27001 controls","std","Built-in regulatory standard."],["Internal rule: every VM must have the 'owner' tag","cust","Custom recommendation."],["A dev subscription accepts the risk of no backup","exm","Waiver."],["Stop anyone creating storage without secure transfer","deny","Prevent new non-compliance."],["Check a custom AWS configuration with a query","cust","KQL-based recommendation."],["A firewall from another vendor covers this control","exm","Mitigated."]]});
quizViz($("#viz-compq"),{title:"Compliance questions",done:"Answered every compliance question",qs:[
  ["Which standard do you get without doing anything?",["Microsoft cloud security benchmark","PCI DSS","NIST 800-53"],0,"MCSB is default."],
  ["Where do you add NIST SP 800-53 to an AWS connector?",["Environment settings > connector > Security policies","AWS console","Sentinel content hub"],0,"Standards are assigned per scope."],
  ["The auditor wants Microsoft's own SOC 2 report.",["Regulatory compliance > Audit reports","Secure score","Activity log"],0,"Microsoft audit reports are available there."]]});
sortViz($("#viz-plansort"),{title:"Which Defender plan raises this alert?",bins:{st:"Defender for Storage",arm:"Defender for Resource Manager",kv:"Defender for Key Vault",sql:"Defender for Databases",srv:"Defender for Servers"},done:"Matched every alert to its plan",
  items:[["Malware uploaded to a blob container","st","Malware scanning."],["Suspicious management operations by a hacking toolkit","arm","ARM operations."],["Unusual secret access from a Tor exit node","kv","Vault access."],["Potential SQL injection","sql","Database threat protection."],["Suspicious PowerShell on a VM","srv","Defender for Endpoint signal."],["Unusual data extraction from storage","st","Activity monitoring."]]});
quizViz($("#viz-alertq"),{title:"Handle the alert",done:"Handled every alert correctly",qs:[
  ["A vulnerability scanner you run weekly triggers the same alert.",["Create a suppression rule","Disable Defender for Servers","Delete the VM"],0,"Suppress known benign activity."],
  ["You need to check the alert pipeline before go-live.",["Create sample alerts","Wait for an attack","Disable automation"],0,"Simulated alerts test the flow."],
  ["An alert lists MITRE tactics 'Credential Access'. What does that tell you?",["Which attack stage the activity maps to","The alert's cost","Which plan to buy"],0,"Tactics map to ATT&CK stages."]]});
stepViz($("#viz-connect"),{title:"Connecting an AWS organization to Defender for Cloud",done:"Connected AWS to Defender for Cloud",steps:[
  ["Add connector","Environment settings > Add environment > Amazon Web Services. Choose the management account to cover the whole organization."],
  ["Pick plans","Select foundational CSPM, Defender CSPM, Defender for Servers and Containers as needed."],
  ["Deploy template","Download the CloudFormation template (StackSet for member accounts) and deploy it in AWS. It creates IAM roles Defender assumes; no keys are stored."],
  ["Auto-provision","For Defender for Servers, Arc and Defender for Endpoint are provisioned on EC2 instances."],
  ["Use it","AWS resources appear in recommendations, secure score, inventory, compliance and attack paths."]]});
revealViz($("#viz-easm"),{title:"What Defender EASM discovers",cols:3,done:"Explored EASM discoveries",items:[
  ["Domains","Seeds","Your registered domains and the subdomains found from them.","def"],["Hosts and IPs","Exposure","Internet-facing hosts and the services they run.","vio"],["Certificates","Hygiene","Expired or expiring certificates and weak ciphers.","def"],
  ["Web pages","Content","Login pages, forms and technologies in use.","vio"],["Shadow IT","Unknown","Assets tied to your brand that nobody registered with IT.","def"],["CVEs","Risk","Known vulnerabilities on discovered software versions.","vio"]]});
sortViz($("#viz-roles"),{title:"Least-privileged Sentinel role",bins:{rd:"Sentinel Reader",rs:"Sentinel Responder",ct:"Sentinel Contributor",po:"Playbook Operator"},done:"Assigned every Sentinel role correctly",
  items:[["An auditor reviews incidents and workbooks","rd","View only."],["Tier 1 analyst closes false positives","rs","Manage incidents."],["Detection engineer writes analytics rules","ct","Manage content."],["Analyst runs the 'block IP' playbook on demand","po","Run playbooks."],["Manager views dashboards weekly","rd","View only."],["Analyst changes incident severity and owner","rs","Incident management."]]});
stepViz($("#viz-hub"),{title:"Deploying a content hub solution",done:"Deployed a content hub solution",steps:[
  ["Find","Content hub > search 'Microsoft Entra ID'. The solution lists its connectors, rules, hunting queries, workbooks and playbooks."],
  ["Install","Install the solution into the workspace. Nothing is active yet."],
  ["Connect","Open the data connector page and connect the sign-in and audit logs."],
  ["Enable","Create analytics rules from the included templates, review their KQL and entity mappings, and enable them."],
  ["Maintain","When the solution shows 'Update available', update it to get new and improved content."]]});
seqViz($("#viz-cef"),{title:"CEF from a firewall to Sentinel",left:"Palo Alto firewall",right:"Linux forwarder + AMA",intro:"Follow a CEF event from the appliance to the CommonSecurityLog table.",
  steps:[{dir:"r",label:"Syslog over TCP 514 (CEF format)",text:"The appliance sends CEF-formatted syslog to the Linux forwarder running rsyslog."},{dir:"r",label:"rsyslog hands the message to AMA",dash:true,text:"rsyslog forwards the facility configured in the DCR to the Azure Monitor Agent on the same machine."},{dir:"l",label:"DCR: CEF via AMA, facility local4, severity ≥ info",text:"The data collection rule tells AMA which facilities and severities to collect, and can transform the data."},{dir:"r",label:"Sent to the Sentinel workspace over HTTPS",text:"AMA uploads the events. They land in CommonSecurityLog, ready for analytics rules."}],
  end:"Syslog (non-CEF) from the same forwarder lands in the Syslog table. Keep the facilities separate to avoid duplicates."});
sortViz($("#viz-tablesort"),{title:"Which table will the data land in?",bins:{csl:"CommonSecurityLog",sys:"Syslog",se:"SecurityEvent",we:"WindowsEvent",cl:"Custom _CL table"},done:"Mapped every source to its table",
  items:[["CEF from a Fortinet firewall","csl","CEF via AMA."],["Linux auth logs","sys","Syslog via AMA."],["Windows logon events from domain controllers via AMA","se","Windows Security Events via AMA."],["Events forwarded through a Windows Event Collector","we","WEF connector."],["JSON events pushed by an app through the Logs Ingestion API","cl","DCR-based custom table."],["Cisco ASA in CEF format","csl","CEF."]]});
vizKql();
sortViz($("#viz-rulesort"),{title:"Which analytics rule type?",bins:{sch:"Scheduled",nrt:"Near-real-time",fus:"Fusion / multistage",ti:"Threat intelligence"},done:"Picked the right rule type every time",
  items:[["Run a KQL query every hour for 50+ failed logons","sch","Scheduled query."],["Alert within a minute of a break-glass sign-in","nrt","Runs every minute."],["Correlate an anomalous sign-in, mass download and mailbox rule into one incident","fus","Multistage correlation."],["Match firewall logs to known malicious IPs","ti","Indicator matching."],["Daily report of new admin role assignments","sch","Scheduled."],["Immediate alert on audit log clearing (event 1102)","nrt","Urgent, simple query."]]});
stepViz($("#viz-soar"),{title:"From alert to automated response",done:"Followed the SOAR flow",steps:[
  ["Detect","A scheduled rule detects a password spray followed by a successful sign-in, maps the Account and IP entities, and raises an alert."],
  ["Incident","The alert is grouped into an incident with severity High."],
  ["Automation rule","Rule 1: incidents from this analytics rule are assigned to the identity team, tagged 'spray', and a playbook runs."],
  ["Playbook","The Logic App uses its managed identity to revoke the user's sessions, require a password reset, and add the IP to a firewall block list."],
  ["Notify","It posts a summary card to the SOC Teams channel and adds a comment to the incident."],
  ["Close","An analyst reviews, confirms, and closes the incident as true positive."]]});
quizViz($("#viz-autoq"),{title:"Automation decisions",done:"Made every automation decision",qs:[
  ["Auto-close informational incidents from a test rule.",["Automation rule: change status to Closed","Playbook with Graph","Workbook"],0,"No playbook needed."],
  ["Isolate a device through Defender for Endpoint when malware is confirmed.",["Playbook triggered by an automation rule","Analytics rule only","Suppression rule"],0,"External action means a playbook."],
  ["Defender for Cloud should email owners on new high-severity recommendations.",["Workflow automation","Sentinel automation rule","Governance rule"],0,"Defender for Cloud's own automation."],
  ["The automation rule shows 'Sentinel doesn't have permission to run this playbook'.",["Grant playbook permissions (Automation Contributor) on its resource group","Make every analyst Owner","Delete the rule"],0,"Settings > Playbook permissions."]]});
vizTiers();
quizViz($("#viz-retq"),{title:"Retention and audit questions",done:"Answered every retention question",qs:[
  ["Entra sign-in logs must be hunted interactively for a full year.",["Extend the table's interactive retention to 365 days","Basic logs","Data lake only"],0,"Interactive retention goes up to 2 years."],
  ["Investigate a 3-year-old event in long-term retention.",["Run a search job","Create an NRT rule","Open a workbook"],0,"Search jobs reach archived data."],
  ["Which advanced hunting table shows SharePoint file downloads?",["CloudAppEvents","DeviceProcessEvents","SecurityEvent"],0,"Microsoft 365 activity."],
  ["Mailbox access must be auditable for a year.",["Purview Audit (Premium) with MailItemsAccessed","Audit (Standard) only","Sentinel workbook"],0,"Premium includes 1-year retention and key events."]]});
revealViz($("#viz-scc"),{title:"Security Copilot building blocks",cols:3,done:"Explored Security Copilot",items:[
  ["SCUs","Capacity","Security compute units provisioned in Azure, with optional overage.","def"],["Workspace","Boundary","Separate capacity, plugins, settings and data location per team.","vio"],["Owner / contributor","Roles","Owners manage settings; contributors use it. Neither grants data access.","def"],
  ["Plugins","Reach","Microsoft, partner and custom (KQL, API, GPT) plugins connect Copilot to data.","vio"],["Promptbooks","Repeatable","A saved sequence of prompts for common investigations.","def"],["Agents","Autonomous","Phishing triage, CA optimization and Security Store partner agents.","vio"]]});
quizViz($("#viz-sccq"),{title:"Security Copilot scenarios",done:"Solved every Security Copilot scenario",qs:[
  ["A contributor asks Copilot about Purview DLP alerts but has no Purview role.",["Copilot can't access them for that user","Copilot shows them anyway","Copilot elevates the user"],0,"On-behalf-of the user."],
  ["Only the SOC team should use Security Copilot.",["Remove 'Everyone' and add the SOC group as contributors","Give the SOC Global Admin","Create a new tenant"],0,"Least privilege on contributors."],
  ["Investigations follow the same 8 prompts every time.",["Create a promptbook","Write a playbook","Add a DCR"],0,"Promptbooks save prompt sequences."],
  ["Find CA policy gaps automatically and suggest fixes.",["Conditional Access Optimization Agent","Phishing Triage Agent","EASM"],0,"Runs in Entra."]]});
  },
  sims:[
    {id:"postsim",type:"choice",title:"Raise the secure score before the audit",
      scenario:"Contoso's secure score is 41%. The audit is in six weeks and covers Azure and AWS against PCI DSS.",
      steps:[
        ["How do you get PCI DSS tracked for Azure and AWS?",["Enable Defender CSPM and add PCI DSS to the subscriptions and AWS connector","Foundational CSPM only","Create a Sentinel workbook"],0,"Regulatory standards need a paid plan."],
        ["Which fix gives the best score improvement per hour of work?",["Controls with high points and few unhealthy resources, such as MFA","Patching all 400 VMs first","Renaming resources"],0,"Score is points × fraction healthy."],
        ["Owners must be assigned and chased automatically.",["Governance rules with owners from tags and due dates","Email reminders by hand","Suppression rules"],0,"Governance rules automate accountability."],
        ["A control is handled by an approved third-party product.",["Exempt the resources as Mitigated","Ignore it","Delete the resources"],0,"Exemptions remove it from the score honestly."],
        ["Prevent new non-compliant storage accounts.",["Use Deny/Enforce via Azure Policy from the recommendation","Wait for the next scan","Delete old accounts"],0,"Stop the bleeding."],
        ["Leadership wants to know which exposures could reach cardholder data.",["Attack path analysis in Defender CSPM","Secure score","Workflow automation"],0,"Attack paths show reachable critical assets."]],
      success:"The score climbs, owners are accountable, and the auditors get a clean PCI DSS report."},
    {id:"collsim",type:"match",title:"Connect the data sources",
      scenario:"You're onboarding data into the new Sentinel workspace. Match each source to its collection method.",
      items:[["Azure Activity connector (diagnostic settings policy)","act"],["CEF via AMA on a Linux forwarder","cef"],["Windows Security Events via AMA","wse"],["Windows Forwarded Events","wef"],["Logs Ingestion API with a DCR-based _CL table","api"]],
      slots:[["act","Subscriptions","Who created, changed or deleted Azure resources"],["cef","Perimeter firewall","Appliance logs in Common Event Format"],["wse","Domain controllers","Logon and account events, Common set"],["wef","Workstations","Events already sent to a Windows Event Collector"],["api","In-house app","Custom JSON security events pushed by code"]],
      success:"Every source lands in the right table with the right collector."},
    {id:"socsim",type:"order",title:"Build the response pipeline",
      scenario:"Put the steps in order to go from raw logs to automated response for a password spray detection.",
      steps:["Connect Microsoft Entra ID sign-in logs","Install the Entra ID solution from the content hub","Enable a scheduled analytics rule with Account and IP entity mapping","Create a playbook with a managed identity that revokes sessions","Grant Sentinel playbook permissions on the playbook's resource group","Create an automation rule that runs the playbook on new incidents"],
      success:"Detection, incident, automation rule, playbook: the full SOAR loop."},
    {id:"rolesim",type:"check",title:"Least privilege in the SOC",
      scenario:"Select every assignment that follows least privilege for the Contoso SOC.",
      opts:[["Tier 1 analysts: Microsoft Sentinel Responder",1],["Detection engineers: Microsoft Sentinel Contributor",1],["On-call analysts who only trigger playbooks: Playbook Operator",1],["Sentinel service account: Automation Contributor on the playbooks resource group",1],["Playbook managed identity: only the Graph permissions it needs",1],["Security Copilot: SOC group as contributors, 'Everyone' removed",1],["Give all analysts Owner on the subscription",0],["Store a Global Admin password in the playbook",0],["Make every user a Security Copilot owner",0]],
      success:"Everyone can do their job, and nobody can do more."},
    {id:"retsim",type:"choice",title:"Design log retention on a budget",
      scenario:"The CFO wants Sentinel costs cut 30% without losing detections or compliance.",
      steps:[
        ["Entra sign-ins and Defender XDR data drive most detections. Where should they stay?",["Analytics tier","Data lake only","Delete them"],0,"Detections need analytics tables."],
        ["VNet flow logs are 60% of volume and used only for investigations.",["Move them to the data lake tier","Keep in analytics for 2 years","Drop them"],0,"Very low cost for high volume."],
        ["Regulators require 7 years of security logs.",["Set total (long-term) retention to 7 years","Interactive retention for 7 years","Export to a laptop"],0,"Long-term retention is cheap."],
        ["A noisy column in firewall logs is never used.",["Drop it with a DCR transformation at ingestion","Ignore it","Increase retention"],0,"You don't pay to store what you drop."],
        ["An investigation needs a 4-year-old event.",["Run a search job","Restore the whole workspace","Rebuild the event"],0,"Search jobs reach long-term retention."]],
      success:"Costs fall, detections keep running, and compliance is met."}
  ],
  badges:[
    ["reader","PO","Posture Pro","Mark all 10 posture and monitoring lessons studied",c=>c.allStudied()],
    ["lab","SL","SOC Lab","Complete all 20 diagrams in this module",c=>c.vizAll()],
    ["score","SS","Score Climber","Raise the secure score in the calculator",c=>c.earned("viz:score")],
    ["kql","KQ","Hunter","Run every query in the KQL hunting lab",c=>c.earned("viz:kql")],
    ["postsim","AU","Audit Ready","Pass the secure score simulation",c=>c.passed("postsim")],
    ["collsim","DC","Data Connector","Pass the data collection simulation",c=>c.passed("collsim")],
    ["socsim","SO","SOAR Builder","Pass the response pipeline simulation",c=>c.passed("socsim")],
    ["rolesim","LP","Least Privilege SOC","Pass the SOC roles simulation",c=>c.passed("rolesim")],
    ["retsim","RT","Retention Planner","Pass the log retention simulation",c=>c.passed("retsim")],
    ["perfect","P+","Posture Perfect","Score 100% on a posture and monitoring quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
