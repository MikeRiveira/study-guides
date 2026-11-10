/* ================= Module 2: Secure storage, databases, and networking (SC-500 Domain 2, 25–30%) ================= */
(function(){
const LESSONS=[
{id:"stsec",num:"2.1",title:"Securing storage accounts",html:`
<p>A storage account is one of the most attacked resources in Azure because a single misconfiguration can expose millions of files. Harden every account with these settings.</p>
<h3>Baseline settings</h3>
<ul><li><b>Secure transfer required</b> (HTTPS only) and <b>minimum TLS version 1.2</b>.</li>
<li><b>Allow Blob anonymous access: disabled</b>. With it off, no container can be made public.</li>
<li><b>Allow storage account key access: disabled</b> where possible, forcing Microsoft Entra authorization for blobs, queues and tables. This also blocks SAS tokens signed with account keys.</li>
<li><b>Default to Microsoft Entra authorization</b> in the Azure portal.</li>
<li><b>Permitted scope for copy operations</b>: limit copies to accounts in the same tenant or with private links.</li></ul>
<h3>Encryption</h3>
<ul><li>All data is encrypted at rest with <b>Storage Service Encryption</b> (AES-256), using <b>Microsoft-managed keys</b> by default.</li>
<li><b>Customer-managed keys</b> (CMK, also called bring your own key) live in Key Vault or Managed HSM. The account's managed identity needs wrap and unwrap rights, and the vault needs soft delete and purge protection.</li>
<li><b>Infrastructure encryption</b> adds a second layer of encryption with a different algorithm and key (double encryption). It must be set when the account is created.</li>
<li><b>Encryption scopes</b> let you use different keys for different containers or blobs.</li></ul>
<div class="viz" id="viz-sthard"></div>
<div class="viz" id="viz-enclayers"></div>
<div class="tip"><b>Exam tip.</b> Infrastructure (double) encryption can't be turned on later. If a question says "existing account," the answer is to create a new account with it enabled and copy the data.</div>`},
{id:"staccess",num:"2.2",title:"Managing access to storage",html:`
<p>There are four ways to authorize a request to Azure Storage. Know when each one fits.</p>
<h3>Authorization options</h3>
<ul><li><b>Microsoft Entra ID with Azure RBAC</b> (recommended): data roles such as <b>Storage Blob Data Reader</b>, <b>Contributor</b> and <b>Owner</b>, <b>Storage Queue Data Contributor</b>, and for Azure Files, <b>Storage File Data SMB Share Reader / Contributor / Elevated Contributor</b>. You can add <b>attribute-based conditions</b> (ABAC) such as "only blobs with tag project=alpine".</li>
<li><b>Shared Key</b> (account access keys): two 512-bit keys that grant full access to everything. Rotate them regularly (Key Vault or manual rotation with key expiration policies), or disable Shared Key entirely.</li>
<li><b>Shared access signatures (SAS)</b>: a signed URL with permissions, start and expiry time, allowed IPs and protocol.</li>
<li><b>Anonymous public read</b> for containers. Disable it at the account level.</li></ul>
<h3>Three kinds of SAS</h3>
<ul><li><b>User delegation SAS</b>: signed with an Entra user delegation key. Blob and Data Lake only. The most secure SAS, and it's audited to an identity.</li>
<li><b>Service SAS</b>: signed with an account key, for one service (blob, queue, table or file).</li>
<li><b>Account SAS</b>: signed with an account key, can cover several services and service-level operations.</li></ul>
<p>A <b>stored access policy</b> on a container defines the permissions and expiry for service SAS tokens that reference it. Change or delete the policy and every SAS that uses it changes or is revoked at once. The only other way to revoke an account-key SAS is to rotate the key.</p>
<h3>Azure Files access</h3>
<p>SMB shares can use identity-based authentication with <b>on-premises AD DS</b>, <b>Microsoft Entra Domain Services</b> or <b>Microsoft Entra Kerberos</b> (hybrid identities), with share-level RBAC roles plus Windows ACLs at the directory and file level.</p>
<div class="viz" id="viz-sas"></div>
<div class="viz" id="viz-sassort"></div>
<div class="tip"><b>Exam tip.</b> "Revoke a SAS without rotating keys" means a <b>stored access policy</b>. "SAS that doesn't depend on account keys" means a <b>user delegation SAS</b>.</div>`},
{id:"stfw",num:"2.3",title:"Storage firewall, Defender for Storage and data protection",html:`
<h3>Storage firewall rules</h3>
<ul><li><b>Public network access</b>: enabled from all networks, enabled from selected virtual networks and IP addresses, or disabled.</li>
<li><b>Virtual network rules</b> rely on <b>service endpoints</b> for Microsoft.Storage on the subnet.</li>
<li><b>IP network rules</b> allow public IP ranges (not private RFC 1918 ranges).</li>
<li><b>Resource instance rules</b> allow a specific Azure resource (such as one Synapse workspace) by its managed identity.</li>
<li><b>Exceptions</b>: allow trusted Microsoft services, allow reading logs and metrics from anywhere.</li>
<li>For fully private access, use <b>private endpoints</b> and disable public access (lesson 2.9).</li></ul>
<h3>Microsoft Defender for Storage</h3>
<ul><li><b>Activity monitoring</b>: detects unusual access, such as from a suspicious IP, unusual data extraction, or access from a Tor exit node.</li>
<li><b>Malware scanning</b>: scans blobs on upload (or on demand) with Microsoft Defender Antivirus, and can tag, soft delete or quarantine infected files.</li>
<li><b>Sensitive data threat detection</b>: uses sensitive information types to prioritize alerts on accounts holding sensitive data.</li>
<li>Enabled per subscription (with overrides per account), billed per storage account and per GB scanned.</li></ul>
<h3>Protecting data against loss and ransomware</h3>
<ul><li><b>Soft delete</b> for blobs, containers and file shares. <b>Versioning</b> keeps previous versions on overwrite. <b>Point-in-time restore</b> for block blobs. <b>Change feed</b> logs every change.</li>
<li><b>Immutable storage</b> (WORM): <b>time-based retention</b> policies or <b>legal holds</b> at container or version level. A <b>locked</b> time-based policy can't be shortened or deleted.</li>
<li><b>Azure Backup</b> for blobs and Azure Files, and a <b>CanNotDelete</b> lock on the account.</li></ul>
<div class="viz" id="viz-stfwtest"></div>
<div class="viz" id="viz-protsort"></div>
<div class="tip"><b>Exam tip.</b> "Files must not be modified or deleted for 7 years for compliance" means immutable storage with a locked time-based retention policy, not soft delete.</div>`},
{id:"sql",num:"2.4",title:"Platform security for Azure SQL",html:`
<p>Azure SQL Database and Azure SQL Managed Instance share a set of layered protections. Think of them from the outside in.</p>
<h3>Network</h3>
<ul><li><b>Server-level and database-level IP firewall rules</b> (SQL Database). "Allow Azure services and resources to access this server" opens it to all of Azure, including other customers. Avoid it.</li>
<li><b>Virtual network rules</b> (service endpoints), <b>private endpoints</b> and <b>Deny public network access</b>.</li>
<li><b>SQL Managed Instance</b> lives inside your VNet in a delegated subnet. Its <b>public endpoint</b> (port 3342) is off by default; the private endpoint uses port 1433. NSG rules on the subnet control access.</li>
<li><b>Connection policy</b>: Redirect (clients connect directly to the node, ports 11000–11999) or Proxy (through the gateway, port 1433).</li></ul>
<h3>Identity</h3>
<ul><li><b>Microsoft Entra authentication</b>: set an <b>Entra admin</b> for the server, create contained users from Entra identities (<code>CREATE USER [name] FROM EXTERNAL PROVIDER</code>), and use managed identities for apps.</li>
<li><b>Microsoft Entra-only authentication</b> disables SQL authentication completely.</li></ul>
<h3>Data protection</h3>
<ul><li><b>Transparent Data Encryption</b> (TDE): encrypts data and log files at rest, on by default. The protector can be <b>service-managed</b> or a <b>customer-managed key</b> in Key Vault (needs soft delete and purge protection).</li>
<li><b>Always Encrypted</b>: columns are encrypted in the client driver, so the database engine and its admins never see plaintext. <b>Deterministic</b> encryption allows equality lookups; <b>randomized</b> is stronger but can't be searched. <b>Secure enclaves</b> allow richer queries.</li>
<li><b>Dynamic data masking</b>: hides data in query results for non-privileged users (for example, XXXX-XXXX-XXXX-1234). Not encryption; users with UNMASK see real data.</li>
<li><b>Row-level security</b>, <b>ledger</b> tables (tamper evidence), and TLS 1.2 minimum for data in transit.</li></ul>
<div class="viz" id="viz-sqlpick"></div>
<div class="viz" id="viz-ddm"></div>
<div class="tip"><b>Exam tip.</b> "Even DBAs must not see the credit card numbers" means <b>Always Encrypted</b>. "Support staff should see only the last four digits" means <b>dynamic data masking</b>.</div>`},
{id:"dbmon",num:"2.5",title:"Database auditing and Defender for Databases",html:`
<h3>Auditing for Azure SQL Database and SQL Managed Instance</h3>
<ul><li>Auditing tracks database events and writes them to a <b>storage account</b>, a <b>Log Analytics workspace</b> or <b>Event Hubs</b>.</li>
<li>A <b>server-level</b> audit policy applies to every database on the server. A database-level policy adds to it; it doesn't replace it.</li>
<li>Default action groups capture successful and failed logins and all batches. Audit <b>Microsoft support operations</b> separately.</li>
<li>For SQL Managed Instance, auditing is configured with T-SQL (<code>CREATE SERVER AUDIT ... TO URL</code> or <code>TO EXTERNAL_MONITOR</code>) and targets storage, Log Analytics or Event Hubs.</li>
<li>Storage targets should use a managed identity and immutable storage if logs must be tamper-proof.</li></ul>
<h3>Microsoft Defender for Databases</h3>
<p>One plan family that covers:</p>
<ul><li><b>Defender for Azure SQL</b> (SQL Database, Managed Instance, Synapse dedicated pools) and <b>SQL servers on machines</b> (on Azure VMs, on-premises and other clouds via Arc).</li>
<li><b>Open-source relational databases</b>: Azure Database for PostgreSQL, MySQL and MariaDB.</li>
<li><b>Azure Cosmos DB</b>.</li></ul>
<p>It provides <b>vulnerability assessment</b> (misconfigurations, excessive permissions, unprotected sensitive data, with a baseline you approve) and <b>Advanced Threat Protection</b> alerts: SQL injection, potential SQL injection, brute force, access from an unusual location or a suspicious application, and unusual data export.</p>
<div class="viz" id="viz-auditflow"></div>
<div class="viz" id="viz-dbalerts"></div>
<div class="tip"><b>Exam tip.</b> If both server and database auditing are on, events are audited <b>twice</b>. Microsoft recommends server-level auditing only, unless one database needs a different destination or event set.</div>`},
{id:"nsg",num:"2.6",title:"Network security groups and application security groups",html:`
<p>A <b>network security group</b> (NSG) is a stateful layer 3–4 filter attached to a <b>subnet</b>, a <b>network interface</b> or both.</p>
<h3>How rules work</h3>
<ul><li>Each rule has a <b>priority</b> (100–4096; lower numbers win), source, source port, destination, destination port, protocol and action (Allow or Deny).</li>
<li>Processing stops at the first match. Return traffic is allowed automatically (stateful).</li>
<li><b>Default rules</b> (65000+) allow VNet-to-VNet traffic and Azure Load Balancer probes, allow all outbound to the internet, and deny everything else inbound.</li>
<li>Inbound: the <b>subnet NSG</b> is evaluated first, then the <b>NIC NSG</b>. Outbound: NIC first, then subnet. Traffic must be allowed by both.</li>
<li><b>Service tags</b> (Internet, VirtualNetwork, AzureLoadBalancer, Storage.EastUS, AzureCloud, Sql) stand in for Microsoft-maintained IP ranges.</li></ul>
<h3>Application security groups</h3>
<p>An <b>ASG</b> groups NICs by role (asg-web, asg-app, asg-db). Rules then say "allow asg-web to asg-app on 8080" instead of listing IP addresses. All NICs in an ASG must be in the same VNet.</p>
<h3>Checking what's really applied</h3>
<p><b>Effective security rules</b> on a NIC show the merged result of the subnet and NIC NSGs (and Virtual Network Manager admin rules). <b>IP flow verify</b> tells you which rule allows or denies a specific packet.</p>
<div class="viz" id="viz-nsgeval"></div>
<div class="viz" id="viz-asg"></div>
<div class="tip"><b>Exam tip.</b> A rule at priority 200 that allows 3389 from the internet beats a rule at 300 that denies it. Watch the numbers, not the order they're listed in.</div>`},
{id:"avnm",num:"2.7",title:"Virtual Network Manager and Virtual WAN security",html:`
<h3>Azure Virtual Network Manager (AVNM)</h3>
<p>AVNM manages connectivity and security for many VNets across subscriptions from one place.</p>
<ul><li><b>Network groups</b>: static members or dynamic membership through Azure Policy (for example, every VNet tagged env=prod).</li>
<li><b>Security admin rules</b>: organization-wide rules applied to network groups and evaluated <b>before</b> NSGs. Actions are <b>Allow</b> (then NSGs still evaluate), <b>Deny</b> (dropped, NSGs can't override) and <b>Always allow</b> (allowed, NSGs skipped).</li>
<li>Use them to block high-risk ports (such as 3389 and 22 from the internet) everywhere, or to guarantee monitoring traffic always gets through.</li>
<li>Configurations take effect only after you <b>deploy</b> them to target regions.</li>
<li>Connectivity configurations build hub-and-spoke or mesh topologies; <b>routing configurations</b> push UDRs at scale.</li></ul>
<h3>Securing Azure Virtual WAN</h3>
<ul><li>A <b>secured virtual hub</b> is a Virtual WAN hub with <b>Azure Firewall</b> (or a supported third-party security provider) deployed in it, managed by <b>Azure Firewall Manager</b>.</li>
<li><b>Routing intent</b> sends internet traffic, private traffic (branch-to-branch, VNet-to-VNet) or both through the hub firewall.</li>
<li>Firewall policies are created in Firewall Manager and can be hierarchical (a parent policy for the org, child policies per region).</li>
<li>Virtual WAN Standard supports site-to-site VPN, point-to-site VPN, ExpressRoute and any-to-any transit.</li></ul>
<div class="viz" id="viz-avnm"></div>
<div class="viz" id="viz-vwan"></div>
<div class="tip"><b>Exam tip.</b> "Developers own their NSGs, but the security team must block RDP from the internet across 300 VNets, and devs must not be able to override it" is an AVNM <b>security admin rule</b> with <b>Deny</b>.</div>`},
{id:"vpn",num:"2.8",title:"VPN connections and Microsoft Entra Private Access",html:`
<h3>Site-to-site and point-to-site VPN security</h3>
<ul><li><b>Site-to-site (S2S)</b>: IPsec/IKE tunnels between an on-premises VPN device and an Azure <b>VPN gateway</b> (route-based). Use IKEv2, and a strong pre-shared key or certificates.</li>
<li><b>Custom IPsec/IKE policy</b>: choose the encryption (GCMAES256), integrity, DH group and PFS group instead of defaults, to meet compliance requirements.</li>
<li><b>Point-to-site (P2S)</b>: individual clients connect to the gateway with <b>OpenVPN</b>, <b>IKEv2</b> or <b>SSTP</b>.</li>
<li>P2S authentication: <b>Azure certificate</b>, <b>RADIUS</b>, or <b>Microsoft Entra ID</b> (OpenVPN only). Entra ID lets you apply <b>Conditional Access and MFA</b> to VPN sign-ins.</li>
<li>Use <b>generation 2</b>, zone-redundant gateway SKUs (VpnGw2AZ and up), and consider <b>active-active</b> for resilience.</li>
<li><b>ExpressRoute</b> is private but <b>not encrypted</b> by default. Add <b>MACsec</b> (ExpressRoute Direct, layer 2) or an <b>IPsec VPN over ExpressRoute private peering</b> for end-to-end encryption.</li></ul>
<h3>Microsoft Entra Private Access</h3>
<p>Part of Microsoft's <b>Global Secure Access</b> security service edge, Entra Private Access is a <b>zero trust network access</b> (ZTNA) replacement for traditional VPN.</p>
<ul><li>Users run the <b>Global Secure Access client</b>. Traffic to private apps travels through Microsoft's edge to a <b>private network connector</b> installed near the app, which makes only outbound connections.</li>
<li>Define <b>Quick Access</b> (broad replacement for VPN) or per-app <b>enterprise applications</b> by FQDN, IP and port.</li>
<li>Apply <b>Conditional Access</b> (MFA, compliant device, risk) to each private app, and assign only the users who need it.</li>
<li>Users reach only the apps they're allowed to, not the whole network: no lateral movement.</li></ul>
<div class="viz" id="viz-vpnsort"></div>
<div class="viz" id="viz-epa"></div>
<div class="tip"><b>Exam tip.</b> P2S with Microsoft Entra authentication requires the <b>OpenVPN</b> tunnel type and the Azure VPN Client. "MFA for VPN users" points to Entra auth plus Conditional Access.</div>`},
{id:"pe",num:"2.9",title:"Private endpoints, Private Link and service endpoints",html:`
<p>PaaS services such as Storage, SQL and Key Vault have public endpoints by default. Three features bring them closer to your network.</p>
<h3>Service endpoints</h3>
<ul><li>Enabled per <b>subnet</b> per service (Microsoft.Storage, Microsoft.Sql, Microsoft.KeyVault).</li>
<li>Traffic leaves the subnet over the Azure backbone with the subnet's identity, so the service's firewall can allow "only this subnet".</li>
<li>The service still uses its <b>public IP</b>. Doesn't work from on-premises. Free. <b>Service endpoint policies</b> can limit Storage traffic to specific accounts.</li></ul>
<h3>Private endpoints</h3>
<ul><li>A <b>network interface with a private IP</b> in your subnet, connected to one specific resource (one storage account's blob sub-resource, one SQL server).</li>
<li>Works from peered VNets and on-premises over VPN or ExpressRoute. Prevents <b>data exfiltration</b> because it maps to one resource only.</li>
<li>Needs <b>DNS</b>: a private DNS zone such as <b>privatelink.blob.core.windows.net</b> linked to the VNet, so the public name resolves to the private IP. On-premises needs a conditional forwarder to an Azure DNS Private Resolver inbound endpoint.</li>
<li>After it works, <b>disable public network access</b> on the resource.</li>
<li>Private endpoints bypass NSGs and UDRs unless you enable <b>network policies</b> for private endpoints on the subnet.</li></ul>
<h3>Private Link service</h3>
<p>Your own service behind a <b>Standard Load Balancer</b> exposed privately to other VNets or tenants. Consumers create a private endpoint to it, and you approve the connection. Traffic is NATed, so overlapping address spaces work.</p>
<h3>App Service and Functions networking</h3>
<p>Inbound: <b>private endpoints</b> and <b>access restrictions</b>. Outbound: <b>VNet integration</b> lets the app reach private resources. An <b>App Service Environment</b> runs fully inside your VNet.</p>
<div class="viz" id="viz-pechoose"></div>
<div class="viz" id="viz-dns"></div>
<div class="tip"><b>Exam tip.</b> Private endpoint created but the app still connects to the public IP? The DNS isn't resolving to the private address. Check the private DNS zone and its VNet link.</div>`},
{id:"afw",num:"2.10",title:"Azure Firewall and Network Watcher diagnostics",html:`
<h3>Azure Firewall</h3>
<p>A managed, stateful, highly available firewall usually placed in a <b>hub</b> VNet (subnet named <b>AzureFirewallSubnet</b>), with <b>UDRs</b> sending spoke traffic (0.0.0.0/0) to its private IP.</p>
<ul><li><b>SKUs</b>: <b>Basic</b> (small businesses, up to 250 Mbps), <b>Standard</b> (threat intelligence, FQDN filtering, DNS proxy), <b>Premium</b> (adds <b>TLS inspection</b>, signature-based <b>IDPS</b>, <b>URL filtering</b> and <b>web categories</b>).</li>
<li><b>Rule types</b>, processed in this order: <b>DNAT</b> rules (inbound port forwarding), then <b>network</b> rules (IP, port, protocol), then <b>application</b> rules (FQDNs, FQDN tags, HTTP/S). Within each, rule collection groups and collections are processed by priority.</li>
<li><b>Firewall policy</b>: the recommended way to manage rules, reusable across firewalls, with <b>parent and child</b> policies and settings like threat intelligence mode (Alert, or Alert and deny) and DNS proxy.</li>
<li><b>Forced tunneling</b> sends internet-bound traffic on to an on-premises device (needs a management subnet).</li>
<li>Logs: structured logs to Log Analytics, and the <b>Policy Analytics</b> and workbook views.</li></ul>
<h3>Network Watcher diagnostics</h3>
<ul><li><b>IP flow verify</b>: will a packet (5-tuple) to or from a VM be allowed or denied, and by which NSG rule?</li>
<li><b>Effective security rules</b>: every rule applied to a NIC after merging subnet and NIC NSGs.</li>
<li><b>Next hop</b>: where a VM's traffic goes (internet, virtual appliance, gateway) and which route table caused it.</li>
<li><b>Connection troubleshoot</b>: tests reachability end to end and reports where it fails.</li>
<li><b>VNet flow logs</b> (successor to NSG flow logs): records allowed and denied flows to storage, optionally with <b>traffic analytics</b> in Log Analytics.</li>
<li><b>Packet capture</b>: capture traffic on a VM for deep analysis.</li></ul>
<div class="viz" id="viz-fwtrace"></div>
<div class="viz" id="viz-nwtools"></div>
<div class="tip"><b>Exam tip.</b> "Outbound HTTPS must be decrypted and inspected for malware" is Azure Firewall <b>Premium</b> with TLS inspection (and an intermediate CA certificate in Key Vault).</div>`}
];

const G={
 st:[["Secure transfer required","Storage account accepts HTTPS requests only"],["Minimum TLS for storage","Set to TLS 1.2"],["Allow Blob anonymous access","Account setting that, when disabled, blocks any public container"],["Disable Shared Key access","Forces Entra ID authorization; blocks account keys and key-signed SAS"],["Storage Service Encryption","Always-on AES-256 encryption at rest"],["Customer-managed key requirements","Key in Key Vault or Managed HSM, purge protection, identity with wrap/unwrap"],["Infrastructure encryption","Second encryption layer with a different key and algorithm; set at creation only"],["Encryption scope","Different keys for different containers or blobs"],["Storage Blob Data Reader","Read blob data with Entra auth"],["Storage Blob Data Owner","Full data access plus POSIX ACL management in Data Lake"],["ABAC condition","Role assignment condition on attributes such as blob index tags"],["User delegation SAS","SAS signed with Entra credentials; blob and Data Lake only; most secure"],["Service SAS","Account-key signed SAS for one service"],["Account SAS","Account-key signed SAS covering one or more services"],["Stored access policy","Container-level policy SAS tokens reference; change or delete it to revoke them"],["How to revoke an account-key SAS without a policy","Rotate the key that signed it"],["Key expiration policy","Reminds you to rotate storage access keys after a set number of days"],["Azure Files identity sources","AD DS, Microsoft Entra Domain Services, Microsoft Entra Kerberos"],["Storage File Data SMB Share Elevated Contributor","Read, write, delete and modify NTFS permissions on a share"]],
 stp:[["Storage firewall options","All networks, selected VNets and IPs, or disabled"],["VNet rule on storage needs","A Microsoft.Storage service endpoint on the subnet"],["Resource instance rule","Allows one specific Azure resource instance through the storage firewall"],["Trusted Microsoft services exception","Lets services like Azure Backup and Event Grid bypass the firewall"],["Defender for Storage activity monitoring","Detects suspicious access, exfiltration and unusual IPs"],["Defender for Storage malware scanning","Scans uploaded blobs with Defender Antivirus; results via tags and events"],["Sensitive data threat detection","Prioritizes alerts on storage with sensitive data"],["Blob soft delete","Recover deleted blobs within a retention period"],["Blob versioning","Keeps previous versions automatically on overwrite"],["Point-in-time restore","Restore block blobs in a container to an earlier time"],["Immutable storage","WORM: data can't be changed or deleted during retention"],["Time-based retention policy","Immutability for a set interval; locked policies can't be shortened"],["Legal hold","Immutability until the hold is cleared"],["Change feed","Ordered log of every blob change"],["Container soft delete","Recover a deleted container and its blobs"]],
 sql:[["Allow Azure services to access server","Opens the SQL server to all Azure IPs, including other customers; avoid"],["SQL server-level firewall rule","IP range allowed to every database on the server"],["Deny public network access (SQL)","Only private endpoints can connect"],["SQL MI public endpoint port","3342 (off by default)"],["SQL connection policy Redirect","Clients connect directly to the node on ports 11000-11999"],["Entra admin for SQL","Entra user or group that administers the server and creates Entra logins/users"],["Create an Entra user in a database","CREATE USER [name] FROM EXTERNAL PROVIDER"],["Microsoft Entra-only authentication","Disables SQL authentication entirely"],["TDE","Encrypts database, log and backup files at rest; on by default"],["TDE protector options","Service-managed key or customer-managed key in Key Vault"],["Always Encrypted","Client-side column encryption; the engine never sees plaintext"],["Deterministic encryption","Same plaintext gives same ciphertext; allows equality searches"],["Randomized encryption","Stronger; no searching or joining on the column"],["Always Encrypted with secure enclaves","Allows pattern matching and range queries on encrypted columns"],["Dynamic data masking","Masks values in query results for non-privileged users"],["UNMASK permission","Lets a user see unmasked data"],["Row-level security","Predicate functions limit which rows a user sees"],["Ledger tables","Tamper-evident, cryptographically verifiable history"]],
 dbm:[["SQL audit destinations","Storage account, Log Analytics workspace, Event Hubs"],["Server-level audit policy","Applies to all databases on the server"],["Server and database auditing both on","Events are audited twice"],["Audit Microsoft support operations","Separate setting to log support engineers' access"],["SQL MI auditing","Configured with T-SQL CREATE SERVER AUDIT"],["Defender for Azure SQL","Vulnerability assessment and threat protection for SQL DB, MI and Synapse"],["SQL servers on machines","Defender for SQL on VMs, on-premises and multicloud via Arc"],["Open-source relational databases plan","Defender for PostgreSQL, MySQL and MariaDB"],["Defender for Azure Cosmos DB","Detects injection and anomalous access to Cosmos DB"],["SQL vulnerability assessment baseline","Approved results so future scans flag only deviations"],["SQL injection alert","Defender detected an injection attempt or vulnerable statement"],["Brute force alert","Many failed logins from one source"]],
 nsg:[["NSG","Stateful layer 3-4 filter for subnets and NICs"],["NSG priority range","100 to 4096; lower number = higher priority"],["NSG processing","Stops at first matching rule"],["Inbound evaluation order","Subnet NSG, then NIC NSG"],["Outbound evaluation order","NIC NSG, then subnet NSG"],["DenyAllInBound","Default rule 65500 denying all other inbound traffic"],["AllowVnetInBound","Default rule allowing traffic within the VNet address space"],["Service tag","Named group of Microsoft-managed IP prefixes, e.g. Internet, Storage, AzureLoadBalancer"],["ASG","Application security group: group NICs by role for NSG rules"],["ASG restriction","All NICs in an ASG must be in the same VNet"],["Effective security rules","Merged view of all rules applied to a NIC"],["AVNM","Azure Virtual Network Manager: central connectivity and security for many VNets"],["Network group","AVNM group of VNets, static or dynamic via Azure Policy"],["Security admin rule","AVNM rule evaluated before NSGs"],["Security admin Allow","Allows, then NSGs still evaluate"],["Security admin Always allow","Allows and skips NSGs"],["Security admin Deny","Drops traffic; NSGs can't override"],["AVNM deployment","Configurations apply only after deployment to regions"],["Secured virtual hub","Virtual WAN hub with Azure Firewall managed by Firewall Manager"],["Routing intent","Sends internet and/or private traffic through the hub firewall"]],
 vpn:[["Site-to-site VPN","IPsec/IKE tunnel between on-premises device and Azure VPN gateway"],["Custom IPsec/IKE policy","Choose specific encryption, integrity, DH and PFS groups"],["P2S tunnel types","OpenVPN, IKEv2, SSTP"],["P2S authentication options","Azure certificate, RADIUS, Microsoft Entra ID"],["P2S Entra ID auth requires","OpenVPN tunnel type and the Azure VPN Client"],["MFA for P2S VPN","Use Entra ID authentication and Conditional Access"],["Is ExpressRoute encrypted?","No, not by default"],["MACsec","Layer 2 encryption on ExpressRoute Direct ports"],["IPsec over ExpressRoute","VPN tunnel over private peering for end-to-end encryption"],["Entra Private Access","ZTNA in Global Secure Access; per-app access to private resources without VPN"],["Private network connector","Outbound-only agent near private apps for Entra Private Access"],["Quick Access","Entra Private Access app covering broad private ranges, a VPN replacement"],["Global Secure Access client","Endpoint client that routes traffic to Microsoft's SSE"],["Entra Internet Access","SSE secure web gateway for internet and SaaS traffic"]],
 pe:[["Service endpoint","Subnet traffic to a PaaS service over the backbone with the subnet identity; public IP"],["Service endpoint limitation","Doesn't extend to on-premises; still a public endpoint"],["Service endpoint policy","Limits Storage service endpoint traffic to specific accounts"],["Private endpoint","NIC with a private IP mapped to one specific resource"],["Why private endpoints stop exfiltration","They map to one resource, not the whole service"],["Private endpoint DNS zone for blob","privatelink.blob.core.windows.net"],["On-premises resolution of private endpoints","Conditional forwarder to Azure DNS Private Resolver inbound endpoint"],["Private endpoint network policies","Subnet setting so NSGs and UDRs apply to private endpoints"],["Private Link service","Your service behind a Standard Load Balancer exposed via private endpoints"],["App Service VNet integration","Outbound access from the app into a VNet"],["App Service access restrictions","Inbound allow/deny rules by IP, service tag or subnet"],["App Service Environment","Single-tenant App Service deployed inside your VNet"]],
 fw:[["Azure Firewall subnet name","AzureFirewallSubnet"],["Azure Firewall SKUs","Basic, Standard, Premium"],["Premium-only features","TLS inspection, IDPS, URL filtering, web categories"],["Rule processing order","DNAT, then network, then application rules"],["DNAT rule","Translates inbound public traffic to a private IP and port"],["Application rule","Allows outbound by FQDN, FQDN tag or URL"],["FQDN tag","Microsoft-maintained list of FQDNs for a service, e.g. WindowsUpdate"],["Threat intelligence mode","Off, Alert, or Alert and deny for known malicious IPs and domains"],["Firewall policy","Reusable rules and settings; supports parent and child policies"],["Firewall Manager","Central management of firewall policies and secured hubs"],["Spoke traffic to firewall","UDR 0.0.0.0/0 with next hop = firewall private IP"],["Forced tunneling","Send internet-bound traffic on to on-premises"],["IP flow verify","Checks if a 5-tuple is allowed or denied and by which rule"],["Next hop","Shows where a VM's traffic goes and which route caused it"],["Connection troubleshoot","Tests end-to-end connectivity and finds the failure point"],["VNet flow logs","Logs allowed and denied flows; successor to NSG flow logs"],["Traffic analytics","Analyzes flow logs in Log Analytics"],["DDoS Network Protection","Adaptive tuning, attack analytics, rapid response, cost protection for a VNet's public IPs"]]
};
const DECKS=[["st","Storage security and access"],["stp","Storage firewall and data protection"],["sql","Azure SQL security"],["dbm","Auditing and Defender for Databases"],["nsg","NSGs, ASGs, AVNM and Virtual WAN"],["vpn","VPN and Entra Private Access"],["pe","Private access to PaaS"],["fw","Azure Firewall and Network Watcher"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A compliance team wants a second layer of encryption on a new storage account using a different algorithm. What should you enable at creation?",o:["Infrastructure encryption","Customer-managed keys only","Secure transfer","Encryption scopes"],a:0,e:"Infrastructure encryption gives double encryption and must be chosen at creation."},
 {q:"You must stop all access to a storage account that uses account keys, including key-signed SAS tokens. Which setting?",o:["Disable Allow storage account key access","Disable secure transfer required on the storage account","Enable versioning","Enable blob soft delete"],a:0,e:"Disabling Shared Key forces Entra authorization."},
 {q:"You need to guarantee no container in an account can ever be made public. What should you configure?",o:["Disable Allow Blob anonymous access on the account","Set every existing container's access level to private","Add a CanNotDelete lock","Enable Defender for Storage"],a:0,e:"The account-level setting overrides container settings."},
 {q:"A partner needs read access to one container for 7 days, and you must be able to revoke it instantly without rotating keys. What should you use?",o:["A service SAS linked to a stored access policy","An account SAS for the Blob service, valid for 7 days","Share the storage account key with the partner for 7 days","Anonymous read access on the container for 7 days"],a:0,e:"Deleting or changing the policy revokes every SAS that references it."},
 {q:"Which SAS type is signed with Microsoft Entra credentials instead of an account key?",o:["User delegation SAS","Service SAS","Stored-access-policy SAS","Account SAS"],a:0,e:"User delegation SAS uses a user delegation key."},
 {q:"An account SAS token was leaked. It isn't tied to a stored access policy. How do you revoke it?",o:["Rotate the account key that signed it","Delete the container the SAS grants access to","Change the SAS expiry time in the portal","Enable soft delete"],a:0,e:"Key-signed SAS tokens stay valid until expiry unless the signing key changes."},
 {q:"Users must access an Azure Files SMB share with their hybrid identities, without a domain controller line of sight from Azure. Which identity source?",o:["Microsoft Entra Kerberos","Storage account keys","Anonymous access","SAS tokens"],a:0,e:"Entra Kerberos issues Kerberos tickets for hybrid users."},
 {q:"A user needs to set NTFS permissions on files in an Azure Files share. Which share-level role is needed?",o:["Storage File Data SMB Share Elevated Contributor","Storage File Data SMB Share Reader","Reader","Storage Blob Data Owner"],a:0,e:"Elevated Contributor allows modifying Windows ACLs."},
 {q:"A role assignment should allow reading only blobs tagged project=alpine. What feature do you use?",o:["An ABAC condition on the role assignment","A stored access policy on the container with a tag filter","A NotActions entry","An encryption scope"],a:0,e:"Attribute-based conditions refine RBAC on blob attributes."},
 {q:"The storage firewall allows a subnet, but traffic is still denied. What's missing?",o:["A Microsoft.Storage service endpoint on the subnet","A private DNS zone for privatelink.blob.core.windows.net","A user delegation key for the subnet's identities","TLS 1.3 set as the minimum version on the account"],a:0,e:"VNet rules require the service endpoint."},
 {q:"You add 10.1.0.0/16 to the storage account's IP rules for an on-premises network over ExpressRoute private peering. What's wrong?",o:["IP rules accept only public IP ranges","IP rules need a service tag","The range must be /24","Nothing"],a:0,e:"Private ranges can't be used in storage IP rules; use private endpoints."},
 {q:"Only one specific Synapse workspace should bypass the storage firewall. What should you configure?",o:["A resource instance rule","Allow trusted Microsoft services","An IP rule for Azure","Disable the firewall"],a:0,e:"Resource instance rules allow specific resource instances."},
 {q:"Uploaded files must be scanned for malware before processing. What should you enable?",o:["Defender for Storage malware scanning","Blob versioning with a lifecycle rule that deletes old versions","Immutable storage","Azure Firewall Premium"],a:0,e:"Malware scanning checks blobs on upload."},
 {q:"Financial records must not be changed or deleted for 7 years, and the policy itself must be tamper-proof. What should you configure?",o:["A locked time-based retention immutability policy","Blob soft delete with a 7-year retention period on the account","A legal hold","A CanNotDelete lock"],a:0,e:"Locked WORM policies can't be shortened or removed."},
 {q:"Ransomware overwrote thousands of blobs. Which feature lets you recover previous content?",o:["Blob versioning","Change feed alone","Secure transfer","Shared Key access"],a:0,e:"Versions preserve previous content on overwrite."},
 {q:"The SQL server has 'Allow Azure services and resources to access this server' on. What's the risk?",o:["Any Azure customer's resources can reach the server's firewall","Only resources in your own subscription can connect to the server","It disables TDE on every database on the server","It blocks private endpoints"],a:0,e:"It allows all Azure IP addresses, not just yours."},
 {q:"Developers must authenticate to Azure SQL with their Entra accounts and MFA, and SQL logins must be disabled. What do you configure?",o:["Set an Entra admin and enable Microsoft Entra-only authentication","Create SQL logins with strong passwords and enable the SQL firewall","Enable TDE with a customer-managed key","Enable dynamic data masking"],a:0,e:"Entra-only auth disables SQL authentication."},
 {q:"How do you create a database user for an Entra group?",o:["CREATE USER [group] FROM EXTERNAL PROVIDER","CREATE LOGIN WITH PASSWORD","sp_addrolemember only","Add the group in the portal firewall"],a:0,e:"Contained users from Entra use FROM EXTERNAL PROVIDER."},
 {q:"DBAs must never see credit card numbers in plaintext, even with full database access. Which feature?",o:["Always Encrypted","Dynamic data masking","TDE","Row-level security"],a:0,e:"Always Encrypted keeps keys on the client side."},
 {q:"Support staff should see only the last four digits of phone numbers in query results. Which feature?",o:["Dynamic data masking","Always Encrypted randomized","TDE","Ledger"],a:0,e:"DDM masks results for non-privileged users."},
 {q:"An encrypted SSN column must support equality lookups. Which Always Encrypted type?",o:["Deterministic","Randomized","Masked","Transparent"],a:0,e:"Deterministic encryption allows equality comparisons."},
 {q:"The company must control and be able to revoke the key that encrypts the database at rest. What should you configure?",o:["TDE with a customer-managed key in Key Vault","Dynamic data masking","Always Encrypted deterministic","Service-managed TDE"],a:0,e:"CMK TDE lets you control and revoke the protector."},
 {q:"Which statement about dynamic data masking is true?",o:["It doesn't encrypt data; users with UNMASK see real values","It encrypts the masked columns at rest with a service-managed key","It requires client driver changes","It hides data from db_owner always"],a:0,e:"DDM is a presentation-layer obfuscation."},
 {q:"You need tamper-evidence proving rows in a table haven't been changed by anyone, including admins. Which feature?",o:["Ledger tables","Row-level security","DDM","Auditing to storage"],a:0,e:"Ledger provides cryptographic verification of history."},
 {q:"SQL Managed Instance's public endpoint uses which port?",o:["3342","1433","443","11000"],a:0,e:"The public endpoint is 3342 and disabled by default."},
 {q:"You enable auditing on the server and on a database to the same storage account. What happens?",o:["Events for that database are audited twice","The database policy overrides the server","Only server events are logged","Auditing fails"],a:0,e:"Both policies apply independently."},
 {q:"Audit logs must be queryable with KQL alongside other security data. Which audit destination?",o:["Log Analytics workspace","Storage account (immutable)","Event Hubs only","SQL table"],a:0,e:"Log Analytics supports KQL and Sentinel."},
 {q:"How is auditing configured for Azure SQL Managed Instance?",o:["With T-SQL CREATE SERVER AUDIT, or the portal diagnostic settings for Log Analytics/Event Hubs","Only through an Azure Policy DeployIfNotExists assignment on the instance","It isn't supported; Managed Instance only offers SQL Server error logs","With NSG flow logs on the Managed Instance subnet sent to Log Analytics"],a:0,e:"MI auditing uses SQL Server audit syntax."},
 {q:"Which Defender plan covers Azure Database for PostgreSQL threat protection?",o:["Defender for open-source relational databases","Defender for Azure SQL Databases","Defender for Storage","Defender for Servers Plan 2"],a:0,e:"Part of the Defender for Databases plan family."},
 {q:"Defender alerts 'Potential SQL injection' on an app's database. What does this indicate?",o:["A statement pattern indicates the app is vulnerable or was attacked with injection","The SQL server firewall allows connections from all Azure services","A customer-managed TDE protector key in Key Vault has expired","Transparent Data Encryption was turned off on the database"],a:0,e:"ATP detects injection attempts and vulnerable code paths."},
 {q:"SQL vulnerability assessment keeps flagging an approved configuration. What should you do?",o:["Add it to the baseline","Disable Defender","Delete the database","Turn off auditing"],a:0,e:"Baselines mark results as accepted."},
 {q:"An NSG has rule 200 Allow TCP 3389 from Internet, and rule 100 Deny TCP 3389 from Internet. What happens to RDP from the internet?",o:["Denied by rule 100","Allowed by rule 200","Allowed because Allow wins","Denied by the default rule"],a:0,e:"Lowest priority number is evaluated first."},
 {q:"A VM's subnet NSG allows inbound 443, but its NIC NSG has no rule for 443. Is inbound HTTPS allowed?",o:["No, the NIC NSG's default DenyAllInbound blocks it","Yes, the subnet rule is enough","Yes, NIC NSGs only filter outbound","Only from the VNet"],a:0,e:"Traffic must pass both NSGs."},
 {q:"You want web servers to reach app servers on 8080 without tracking IP addresses. What should you use?",o:["Application security groups in NSG rules","Service tags in NSG rules for each tier","UDRs between the web and app subnets","Private endpoints on each app server"],a:0,e:"ASGs group NICs by role."},
 {q:"Which default rule lets Azure Load Balancer health probes reach VMs?",o:["AllowAzureLoadBalancerInBound","AllowVnetInBound","AllowInternetOutBound","DenyAllInBound"],a:0,e:"It allows the AzureLoadBalancer service tag."},
 {q:"Which tool shows the merged rules from the subnet and NIC NSGs for a VM?",o:["Effective security rules","Next hop","Packet capture","Connection monitor"],a:0,e:"Effective security rules show the combined set."},
 {q:"The security team must block SSH from the internet on 300 VNets, and app teams must not be able to override it with NSGs. What should you use?",o:["AVNM security admin rule with Deny","An NSG on each subnet with a Deny rule for port 22","Azure Policy Audit","A UDR"],a:0,e:"Deny admin rules are evaluated before NSGs and can't be overridden."},
 {q:"Monitoring traffic must reach every VM even if an app team's NSG would block it. Which AVNM action?",o:["Always allow","Allow","Deny","Audit only"],a:0,e:"Always allow skips NSG evaluation."},
 {q:"You created an AVNM security admin configuration, but nothing changed. What step is missing?",o:["Deploy the configuration to the target regions","Create an NSG on each subnet that the configuration targets","Enable service endpoints on the member VNets","Restart the VMs in the network group"],a:0,e:"AVNM configurations apply only after deployment."},
 {q:"New VNets tagged env=prod should automatically join an AVNM network group. How?",o:["Dynamic membership using Azure Policy","Static membership, updated by a scheduled script","A UDR that points prod VNets to the hub","A peering from each prod VNet to the hub"],a:0,e:"Network groups support policy-based dynamic membership."},
 {q:"Branch-to-branch and VNet-to-VNet traffic in Virtual WAN must be inspected by Azure Firewall. What should you configure?",o:["A secured virtual hub with routing intent for private traffic","An NSG on the hub that inspects branch and VNet traffic","Service endpoints on every spoke subnet for the firewall","A VPN gateway in the hub with BGP route filtering only"],a:0,e:"Routing intent sends private traffic through the hub firewall."},
 {q:"VPN users must sign in with MFA. Which P2S configuration?",o:["OpenVPN with Microsoft Entra ID authentication and Conditional Access","SSTP with certificate authentication and a self-signed root certificate","IKEv2 with RADIUS authentication against an on-premises NPS server","A site-to-site VPN from each user's home router to the gateway"],a:0,e:"Entra auth works with OpenVPN and supports CA."},
 {q:"Compliance requires GCMAES256 and DH group 24 on site-to-site tunnels. What should you configure?",o:["A custom IPsec/IKE policy on the connection","A policy-based VPN gateway with default settings","An NSG on the GatewaySubnet that allows only IKEv2","A Basic SKU VPN gateway with a custom IKE version"],a:0,e:"Custom policies set specific algorithms."},
 {q:"Traffic over ExpressRoute private peering must be encrypted end to end. What can you use?",o:["An IPsec VPN over ExpressRoute private peering","Nothing; ExpressRoute is encrypted","Service endpoints","DDoS Protection"],a:0,e:"ExpressRoute isn't encrypted by default; add IPsec or MACsec."},
 {q:"You want to encrypt traffic at layer 2 on ExpressRoute Direct ports. What should you enable?",o:["MACsec","IPsec","TLS 1.3","SSE"],a:0,e:"MACsec is supported on ExpressRoute Direct."},
 {q:"Remote employees need access to one on-premises web app without full network VPN access, with Conditional Access per app. What should you use?",o:["Microsoft Entra Private Access with a per-app enterprise application","A point-to-site VPN with certificate authentication for each employee","A site-to-site VPN from each home router to the on-premises network","Azure Bastion with a jump host that publishes the web app"],a:0,e:"Entra Private Access is ZTNA with per-app CA."},
 {q:"In Entra Private Access, what makes the connection from the private network to Microsoft's edge?",o:["A private network connector that makes outbound connections","Inbound NAT rules on the edge firewall that publish each private app","A VPN gateway","An ExpressRoute circuit"],a:0,e:"Connectors are outbound-only, no inbound ports."},
 {q:"An app must reach one storage account privately from on-premises over ExpressRoute. What should you use?",o:["A private endpoint","A service endpoint","A storage IP rule","A NAT gateway"],a:0,e:"Service endpoints don't extend to on-premises."},
 {q:"You created a private endpoint for a storage account, but VMs still resolve its public IP. What's the fix?",o:["Link the privatelink.blob.core.windows.net private DNS zone to the VNet","Add an NSG rule that denies outbound traffic to the public endpoint","Enable a Microsoft.Storage service endpoint on the VM subnet","Recreate the storage account with public network access disabled"],a:0,e:"Private endpoints depend on private DNS."},
 {q:"Why do private endpoints help prevent data exfiltration compared with service endpoints?",o:["They map to a single resource rather than the whole service","They encrypt all data in transit with a customer-managed key","They block all outbound traffic from the subnet by default","They require MFA for every connection to the resource"],a:0,e:"A service endpoint allows any account of that service unless policies limit it."},
 {q:"Service endpoint traffic to Storage must be limited to only your company's accounts. What should you add?",o:["A service endpoint policy","A private DNS zone","An ASG","A Bastion host"],a:0,e:"Service endpoint policies restrict to specific accounts."},
 {q:"NSG rules don't seem to apply to traffic to a private endpoint. What should you enable?",o:["Network policies for private endpoints on the subnet","A UDR on the private endpoint's network interface","A Microsoft.Storage service endpoint on the subnet","Accelerated networking on the private endpoint"],a:0,e:"By default private endpoints bypass NSGs and UDRs."},
 {q:"You want to expose your own service behind a Standard Load Balancer to a customer's VNet with overlapping address space. What should you use?",o:["A Private Link service","VNet peering","A service endpoint","A public IP"],a:0,e:"Private Link service NATs traffic, so overlaps are fine."},
 {q:"An App Service web app must call a SQL database that has only a private endpoint. What should you configure on the app?",o:["VNet integration","Access restrictions","A private endpoint for the app","A custom domain"],a:0,e:"VNet integration controls outbound traffic into the VNet."},
 {q:"Which Azure Firewall SKU is needed for TLS inspection and IDPS?",o:["Premium","Standard","Basic","Any SKU"],a:0,e:"Premium adds TLS inspection, IDPS, URL filtering and web categories."},
 {q:"In what order does Azure Firewall process rule types?",o:["DNAT, network, application","Application, network, DNAT","Network, DNAT, application","All at once by priority"],a:0,e:"DNAT first, then network, then application."},
 {q:"Spoke VMs must send all internet traffic through Azure Firewall in the hub. What do you configure?",o:["A UDR on spoke subnets with 0.0.0.0/0 to the firewall's private IP","An NSG on AzureFirewallSubnet that allows all outbound traffic","A Microsoft.Web service endpoint on every spoke subnet","A private endpoint to the firewall in each spoke VNet"],a:0,e:"Route tables steer traffic to the firewall."},
 {q:"Allow VMs to reach Windows Update only, without tracking its many URLs. What should the application rule use?",o:["The WindowsUpdate FQDN tag","A network rule for 0.0.0.0/0","A DNAT rule","A web category"],a:0,e:"FQDN tags are Microsoft-maintained lists."},
 {q:"A central team wants org-wide firewall rules that every regional firewall inherits, with local additions. What should you use?",o:["Parent and child firewall policies in Firewall Manager","Classic rules copied to each firewall with an Azure Automation runbook","NSGs","AVNM connectivity configs"],a:0,e:"Child policies inherit parent rules."},
 {q:"A VM can't reach a database on port 1433. Which tool tells you which NSG rule blocked the packet?",o:["IP flow verify","Next hop","Traffic analytics","Packet capture"],a:0,e:"IP flow verify reports the matching rule."},
 {q:"Traffic from a VM is going to an NVA instead of the internet. Which tool reveals the route causing it?",o:["Next hop","IP flow verify","Effective security rules","VPN troubleshoot"],a:0,e:"Next hop shows the next hop type and route table."},
 {q:"You need to record allowed and denied flows across a VNet for analysis. What should you enable?",o:["VNet flow logs with traffic analytics","Packet capture","Diagnostic settings on the VM","Connection troubleshoot"],a:0,e:"VNet flow logs replace NSG flow logs."},
 {q:"Public-facing apps need adaptive DDoS tuning, attack analytics and cost protection. What should you enable?",o:["Azure DDoS Network Protection","Azure Firewall Basic","NSG flow logs","A WAF in detection mode"],a:0,e:"DDoS Network Protection adds those to basic infrastructure protection."}
];

/* ---------- custom diagrams ---------- */
function vizSas(){
  const el=$("#viz-sas");const seen=new Set();
  let type="ud",perm=new Set(["r"]),exp=8,ip=true,https=true;
  const T={ud:"User delegation",svc:"Service",acct:"Account"};
  function risk(){let r=0;const n=[];if(type!=="ud"){r+=2;n.push("signed with an account key")}if(perm.has("w")||perm.has("d")){r+=2;n.push("write or delete rights")}if(exp>24){r+=exp>24*7?3:1;n.push("long expiry")}if(!ip){r+=1;n.push("any IP")}if(!https){r+=2;n.push("HTTP allowed")}return [r,n]}
  function draw(){const [r,n]=risk();const lvl=r<=1?"Low":r<=4?"Medium":"High";seen.add(lvl);
    const st=new Date(),en=new Date(st.getTime()+exp*36e5);
    const url=`https://stcontoso.blob.core.windows.net/invoices/q3.pdf?sv=2024-11-04&amp;sp=${[...perm].sort().join("")}&amp;st=${st.toISOString().slice(0,16)}Z&amp;se=${en.toISOString().slice(0,16)}Z${ip?"&amp;sip=203.0.113.10":""}&amp;spr=${https?"https":"https,http"}${type==="ud"?"&amp;skoid=…&amp;sktid=…":""}&amp;sr=b&amp;sig=…`;
    el.innerHTML=`<div class="viz-title">SAS token builder: share one invoice with a partner</div>
    <div class="sel-row"><span>Signed by</span><div class="seg-row">${Object.keys(T).map(k=>`<button class="chip" data-t="${k}" aria-pressed="${k===type}">${T[k]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Permissions</span><div class="seg-row">${[["r","Read"],["w","Write"],["d","Delete"]].map(([k,l])=>`<button class="chip" data-p="${k}" aria-pressed="${perm.has(k)}">${l}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Expires in</span><div class="seg-row">${[[8,"8 hours"],[72,"3 days"],[24*365,"1 year"]].map(([k,l])=>`<button class="chip" data-e="${k}" aria-pressed="${k===exp}">${l}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Restrictions</span><div class="seg-row"><button class="chip" data-i="1" aria-pressed="${ip}">Partner IP only</button><button class="chip" data-h="1" aria-pressed="${https}">HTTPS only</button></div></div>
    <pre class="term" style="min-height:0;white-space:pre-wrap;word-break:break-all">${url}</pre>
    <div class="caption" aria-live="polite">Risk: <b class="${lvl==="Low"?"status-good":"status-bad"}">${lvl}</b>. ${n.length?"Concerns: "+n.join(", ")+".":"Short-lived, read-only, IP-restricted, HTTPS, and tied to an Entra identity. This is the gold standard."}${type!=="ud"?" To revoke a key-signed SAS you'd need a stored access policy or a key rotation.":" Revoke by revoking the user delegation key."}</div>
    <div class="rv-prog s-small">${seen.size} of 3 risk levels seen</div>`;
    if(seen.size===3)award("viz:sas",30,"Built SAS tokens at every risk level")}
  el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
    if(d.t)type=d.t;if(d.p){perm.has(d.p)?perm.delete(d.p):perm.add(d.p);if(!perm.size)perm.add("r")}if(d.e)exp=+d.e;if(d.i)ip=!ip;if(d.h)https=!https;draw()});draw();
}
function vizStFw(){
  const el=$("#viz-stfwtest");const seen=new Set();let mode="sel",last=null;
  const SRC=[["app","App VM in snet-app (service endpoint on)","vnet"],["dev","Developer laptop at 203.0.113.10 (allowed IP)","ip"],["home","Unknown home IP 198.51.100.7","none"],["pe","VM using a private endpoint","pe"],["bak","Azure Backup (trusted service)","trusted"]];
  const M={all:"All networks",sel:"Selected networks",off:"Disabled (private only)"};
  const ok=(s)=>mode==="all"||s[2]==="pe"||mode==="sel"&&s[2]!=="none";
  function draw(){
    el.innerHTML=`<div class="viz-title">Storage firewall tester · stpayments</div>
    <div class="sel-row"><span>Public access</span><div class="seg-row">${Object.keys(M).map(k=>`<button class="chip" data-m="${k}" aria-pressed="${k===mode}">${M[k]}</button>`).join("")}</div></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Request from</th><th>Result</th></tr>${SRC.map(s=>`<tr><td><button class="btn" data-s="${s[0]}">Send</button> ${s[1]}</td><td class="${seen.has(mode+s[0])?(ok(s)?"ok":"no"):"dim"}">${seen.has(mode+s[0])?(ok(s)?"✓ Allowed":"✗ 403 AuthorizationFailure"):"?"}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${last?({app:"VNet rules work because the subnet has the Microsoft.Storage service endpoint.",dev:"IP rules allow specific public IP ranges.",home:"Not on any list, so the firewall rejects it (the network check happens even if the caller has a valid key).",pe:"Private endpoint traffic is always allowed, even when public access is disabled.",bak:"With 'Allow trusted Microsoft services' checked, Azure Backup can reach the account."}[last]+(mode==="off"&&last!=="pe"?" <b>But public access is disabled, so only private endpoints get in.</b>":mode==="all"&&last==="home"?" <b>With 'All networks', anyone with a valid credential gets in.</b>":"")):"Pick a mode, then send requests from each source."}</div>
    <div class="rv-prog s-small">${seen.size} of 15 combinations tried</div>`;
    if(seen.size>=12)award("viz:stfwtest",30,"Tested the storage firewall")}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]"),s=e.target.closest("[data-s]");if(m){mode=m.dataset.m;last=null}if(s){last=s.dataset.s;seen.add(mode+last)}if(m||s)draw()});draw();
}
function vizDdm(){
  const el=$("#viz-ddm");const seen=new Set();let who="support";
  const ROWS=[["Ana Ruiz","ana.ruiz@contoso.com","4111-1111-1111-4242","555-0142"],["Ben Ode","ben.o@fabrikam.com","5500-0000-0000-0004","555-0199"]];
  const W={support:"Support agent (no UNMASK)",analyst:"Analyst with UNMASK",dba:"DBA (Always Encrypted column)",app:"App with column master key"};
  const mask=(r)=>who==="support"?[r[0],r[1][0]+"XXX@XXXX.com","XXXX-XXXX-XXXX-"+r[2].slice(-4),"XXX-"+r[3].slice(-4)]:who==="dba"?[r[0],r[1],"0x01A3F9C2…(ciphertext)",r[3]]:r;
  function draw(){seen.add(who);
    el.innerHTML=`<div class="viz-title">Same query, different viewers: SELECT * FROM Customers</div>
    <div class="seg-row">${Object.keys(W).map(k=>`<button class="chip" data-w="${k}" aria-pressed="${k===who}">${W[k]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Name</th><th>Email (masked: email())</th><th>Card (Always Encrypted)</th><th>Phone (masked: partial)</th></tr>${ROWS.map(r=>`<tr>${mask(r).map((c,i)=>`<td class="${(who==="support"&&i>0)||(who==="dba"&&i===2)?"c-sh":""}">${c}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${{support:"Dynamic data masking rewrites results for users without UNMASK. The stored data is unchanged. For the card column the support agent's app has the key, so they see masking applied on top.",analyst:"UNMASK reveals every masked column. Masking is not encryption: it's a convenience for limiting exposure.",dba:"The DBA has full database rights but no access to the column master key, so the Always Encrypted card number is ciphertext. Masked columns aren't masked for an admin.",app:"The application's driver holds the column master key (in Key Vault), so it decrypts the card number on the client. The SQL engine never saw the plaintext."}[who]}</div>
    <div class="rv-prog s-small">${seen.size} of 4 viewers tried</div>`;
    if(seen.size===4)award("viz:ddm",30,"Compared masking and Always Encrypted")}
  el.addEventListener("click",e=>{const w=e.target.closest("[data-w]");if(w){who=w.dataset.w;draw()}});draw();
}
function vizNsgEval(){
  const el=$("#viz-nsgeval");const seen=new Set();let pkt=0;
  const RULES=[[100,"Deny-RDP-Internet","Internet","*","3389","Deny"],[200,"Allow-HTTPS","Internet","asg-web","443","Allow"],[300,"Allow-Bastion-SSH","10.0.1.0/26","*","22","Allow"],[400,"Allow-RDP-Admin","203.0.113.10","*","3389","Allow"],[65000,"AllowVnetInBound","VirtualNetwork","VirtualNetwork","*","Allow"],[65001,"AllowAzureLoadBalancerInBound","AzureLoad&shy;Balancer","*","*","Allow"],[65500,"DenyAllInBound","*","*","*","Deny"]];
  const P=[["HTTPS from internet to web VM","Internet","asg-web","443"],["RDP from admin IP 203.0.113.10","Internet","*","3389",true],["SSH from Bastion subnet 10.0.1.4","10.0.1.0/26","*","22"],["SQL 1433 from internet","Internet","*","1433"],["App VM to DB VM on 1433 (same VNet)","VirtualNetwork","VirtualNetwork","1433"]];
  const match=(r,p)=>(r[2]==="*"||r[2]===p[1]||(r[2]==="203.0.113.10"&&p[4])||(r[2]==="Internet"&&p[4]))&&(r[3]==="*"||r[3]===p[2]||(r[3]==="VirtualNetwork"&&p[2]==="VirtualNetwork"))&&(r[4]==="*"||r[4]===p[3]);
  function draw(){const p=P[pkt];seen.add(pkt);const hit=RULES.find(r=>match(r,p));
    el.innerHTML=`<div class="viz-title">NSG rule evaluator · inbound to snet-web</div>
    <div class="seg-row">${P.map((x,i)=>`<button class="chip" data-p="${i}" aria-pressed="${i===pkt}">${x[0]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl" style="font-size:12.5px"><tr><th class="num">Prio</th><th>Name</th><th>Source</th><th>Dest.</th><th>Port</th><th>Action</th></tr>${RULES.map(r=>`<tr>${r.map((c,i)=>`<td class="${r===hit?(r[5]==="Allow"?"ok":"no"):RULES.indexOf(r)<RULES.indexOf(hit)?"":"dim"} ${i===0?"num":""}">${i===1?String(c).replace(/([a-z])([A-Z-])/g,"$1<wbr>$2"):c}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">Rules are checked from priority 100 upward. ${RULES.indexOf(hit)>0?`${RULES.indexOf(hit)} rule${RULES.indexOf(hit)>1?"s":""} didn't match, then `:""}<b>${hit[1]}</b> (${hit[0]}) matched: <span class="${hit[5]==="Allow"?"status-good":"status-bad"}">${hit[5]}</span>. ${pkt===1?"The admin's RDP is from the internet, so rule 100 denies it before rule 400 is ever reached. Fix it by giving the allow rule a lower number, or better, use Bastion.":pkt===3?"Nothing allows 1433 from the internet, so the default DenyAllInBound catches it.":pkt===4?"Default rules allow traffic inside the VNet. Tighten this with ASG rules and an explicit deny above 65000.":"Processing stops at the first match."}</div>
    <div class="rv-prog s-small">${seen.size} of ${P.length} packets sent</div>`;
    if(seen.size===P.length)award("viz:nsgeval",30,"Evaluated NSG rules like a firewall")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b){pkt=+b.dataset.p;draw()}});draw();
}
function vizAvnm(){
  const el=$("#viz-avnm");const seen=new Set();let admin="deny",nsg="allow";
  const A={none:"No admin rule",allow:"Allow",always:"Always allow",deny:"Deny"};
  function res(){if(admin==="deny")return ["Dropped by the security admin rule","no","NSGs never get a say."];if(admin==="always")return ["Allowed, NSG skipped","ok","The admin rule guarantees delivery."];return nsg==="allow"?["Allowed by the NSG","ok",admin==="allow"?"The admin Allow passes traffic on to the NSG, which also allows it.":"No admin rule, so it's up to the NSG."]:["Denied by the NSG","no",admin==="allow"?"Allow isn't a guarantee: the NSG still evaluates and denies.":"No admin rule, so it's up to the NSG."]}
  function draw(){seen.add(admin+nsg);const r=res();
    el.innerHTML=`<div class="viz-title">Security admin rules vs NSGs · RDP from the internet to a spoke VM</div>
    <div class="sel-row"><span>AVNM admin rule</span><div class="seg-row">${Object.keys(A).map(k=>`<button class="chip" data-a="${k}" aria-pressed="${k===admin}">${A[k]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>App team's NSG</span><div class="seg-row"><button class="chip" data-n="allow" aria-pressed="${nsg==="allow"}">Allows 3389</button><button class="chip" data-n="deny" aria-pressed="${nsg==="deny"}">Denies 3389</button></div></div>
    <div class="stp-flow"><div class="stp-n on"><span class="mono">01</span><b>Packet arrives</b></div><div class="stp-n ${admin!=="none"?"on cur":""}"><span class="mono">02</span><b>Security admin rule</b></div><div class="stp-n ${admin==="none"||admin==="allow"?"on cur":""}"><span class="mono">03</span><b>NSG rules</b></div><div class="stp-n on"><span class="mono">04</span><b class="${r[1]==="ok"?"status-good":"status-bad"}">${r[0]}</b></div></div>
    <div class="caption" aria-live="polite">${r[2]}</div>
    <div class="rv-prog s-small">${seen.size} of 8 combinations tried</div>`;
    if(seen.size>=7)award("viz:avnm",30,"Compared security admin rules and NSGs")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]"),n=e.target.closest("[data-n]");if(a)admin=a.dataset.a;if(n)nsg=n.dataset.n;if(a||n)draw()});draw();
}
function vizPeChoose(){
  const el=$("#viz-pechoose");const seen=new Set();let m="pe";
  const ROWS=[["Destination IP","Service's public IP","Private IP in your subnet","Private IP (your LB frontend)"],["Scope","Whole service (all accounts) unless a policy limits it","One resource","Your own service"],["Reach from on-premises","No","Yes, over VPN/ExpressRoute","Yes"],["DNS changes","None","privatelink zone needed","Consumer creates the PE and DNS"],["Exfiltration protection","Weak","Strong","Strong"],["Cost","Free","Per hour + per GB","Per hour + per GB"]];
  const K={se:1,pe:2,pls:3},N={se:"Service endpoint",pe:"Private endpoint",pls:"Private Link service"};
  function draw(){seen.add(m);
    el.innerHTML=`<div class="viz-title">Service endpoint vs private endpoint vs Private Link service</div>
    <div class="seg-row">${Object.keys(N).map(k=>`<button class="chip" data-m="${k}" aria-pressed="${k===m}">${N[k]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Feature</th><th class="cur">${N[m]}</th></tr>${ROWS.map(r=>`<tr><td>${r[0]}</td><td class="${/No|Weak|None/.test(r[K[m]])&&m==="se"?"c-sh":"c-ms"}">${r[K[m]]}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${{se:"Quick and free: lock a PaaS firewall to a subnet. But it's still the public endpoint and can't serve on-premises.",pe:"Gives one resource a private IP. Pair it with private DNS and disable public access on the resource.",pls:"The provider side: publish your own service behind a Standard Load Balancer so others can reach it through private endpoints."}[m]}</div>
    <div class="rv-prog s-small">${seen.size} of 3 options compared</div>`;
    if(seen.size===3)award("viz:pechoose",20,"Compared private access options")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b){m=b.dataset.m;draw()}});draw();
}
function vizFwTrace(){
  const el=$("#viz-fwtrace");const seen=new Set();let f=0;
  const F=[["Spoke VM → www.microsoft.com:443","app","Allow-MS-Web (application rule, FQDN *.microsoft.com)","ok","No DNAT or network rule matched, so the application rules were checked and the FQDN rule allowed it."],
    ["Spoke VM → 8.8.8.8:53 (UDP)","net","Allow-DNS (network rule, UDP 53)","ok","Network rules are checked before application rules, so this matched first."],
    ["Internet → firewall public IP:443","dnat","DNAT-Web: translate to 10.1.2.4:443","ok","DNAT rules are checked first. The translated flow is implicitly allowed through."],
    ["Spoke VM → known C2 domain","ti","Threat intelligence: Alert and deny","no","Threat intelligence filtering runs before the rules and blocks known malicious IPs and domains."],
    ["Spoke VM → gambling site (web category)","prem","Deny-Gambling (web categories, Premium)","no","Web categories and URL filtering need Premium for full URL paths over HTTPS."],
    ["Spoke VM → unknown-site.example:443","def","No rule matched: default deny","no","Azure Firewall denies everything that isn't explicitly allowed."]];
  function draw(){seen.add(f);const x=F[f];
    el.innerHTML=`<div class="viz-title">Packet tracer: hub-and-spoke through Azure Firewall</div>
    <div class="seg-row">${F.map((y,i)=>`<button class="chip" data-f="${i}" aria-pressed="${i===f}">${y[0]}</button>`).join("")}</div>
    <div class="stp-flow">${[["ti","Threat intel"],["dnat","DNAT rules"],["net","Network rules"],["app","Application rules"],["def","Default deny"]].map(([k,l],i)=>{const order=["ti","dnat","net","app","def"],hitK=x[1]==="prem"?"app":x[1],hi=order.indexOf(hitK);return `<div class="stp-n ${i<=hi?"on":""} ${i===hi?"cur":""}"><span class="mono">${String(i+1).padStart(2,"0")}</span><b>${l}</b></div>`}).join("")}</div>
    <div class="caption" aria-live="polite"><b class="${x[3]==="ok"?"status-good":"status-bad"}">${x[3]==="ok"?"Allowed":"Denied"}</b> by ${x[2]}. ${x[4]}</div>
    <div class="rv-prog s-small">${seen.size} of ${F.length} flows traced</div>`;
    if(seen.size===F.length)award("viz:fwtrace",30,"Traced every flow through Azure Firewall")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-f]");if(b){f=+b.dataset.f;draw()}});draw();
}

registerModule({
  id:"dat",slug:"data",title:"Storage, Databases and Networking",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:(,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["sthard","enclayers","sas","sassort","stfwtest","protsort","sqlpick","ddm","auditflow","dbalerts","nsgeval","asg","avnm","vwan","vpnsort","epa","pechoose","dns","fwtrace","nwtools"],
  viz(){
quizViz($("#viz-sthard"),{title:"Harden the storage account",done:"Hardened the storage account",qs:[
  ["A security scan flags HTTP requests to the account.",["Enable Secure transfer required","Enable versioning","Disable soft delete"],0,"HTTPS only."],
  ["Clients still negotiate TLS 1.0.",["Set minimum TLS version to 1.2","Enable infrastructure encryption","Add an IP rule"],0,"Block old TLS versions."],
  ["An intern made a container public.",["Disable Allow Blob anonymous access on the account","Delete the container","Rotate keys"],0,"Account setting overrides containers."],
  ["Policy says all data access must be tied to an Entra identity.",["Disable storage account key access","Use account SAS","Use a service SAS"],0,"Forces Entra authorization."]]});
revealViz($("#viz-enclayers"),{title:"Layers of storage encryption",cols:2,done:"Explored every encryption layer",items:[
  ["Microsoft-managed keys","Default","AES-256 SSE with keys Microsoft manages and rotates. Nothing to configure.","def"],["Customer-managed keys","You control","Key in Key Vault or Managed HSM. You rotate it, and can revoke it to make data unreadable.","vio"],
  ["Infrastructure encryption","Double","A second, independent encryption layer at the infrastructure level. Creation-time only.","def"],["Encryption scopes","Per container","Different keys for different tenants' containers in one account.","vio"],
  ["In transit","TLS","Secure transfer and minimum TLS 1.2 protect data on the wire. SMB 3.x encryption for Azure Files.","def"],["Client-side encryption","Before upload","The app encrypts before sending; Azure never sees plaintext.","vio"]]});
vizSas();
sortViz($("#viz-sassort"),{title:"Which storage authorization fits?",bins:{rbac:"Entra ID + RBAC",ud:"User delegation SAS",sap:"Service SAS + stored access policy",none:"Don't do it"},done:"Picked the right storage authorization",
  items:[["An app with a managed identity reads blobs","rbac","No secrets at all."],["Give a browser a 15-minute upload link, audited to the issuing user","ud","Entra-signed, short-lived."],["A partner needs a link you can revoke instantly without key rotation","sap","Change or delete the policy to revoke."],["Embed the account key in a mobile app","none","Account keys grant full access to everything."],["Analysts query Data Lake with their own accounts","rbac","Data roles plus ACLs."],["Make a container public so a vendor can download a file","none","Use a SAS instead and keep anonymous access off."]]});
vizStFw();
sortViz($("#viz-protsort"),{title:"Pick the data protection feature",bins:{sd:"Soft delete",ver:"Versioning",imm:"Immutable storage",mal:"Defender malware scanning"},done:"Matched every data protection feature",
  items:[["Someone deleted a blob by accident yesterday","sd","Restore within the retention period."],["Ransomware overwrote files with encrypted copies","ver","Restore the previous version."],["SEC rule: records can't change for 7 years","imm","WORM retention."],["Customers upload files that might contain malware","mal","Scan on upload."],["Litigation: preserve these blobs until the case closes","imm","Legal hold."],["A container was deleted by a script","sd","Container soft delete."]]});
sortViz($("#viz-sqlpick"),{title:"Which SQL protection stops this threat?",bins:{fw:"Firewall / private endpoint",ent:"Entra-only auth",ae:"Always Encrypted",ddm:"Dynamic data masking",tde:"TDE"},done:"Matched every SQL protection",
  items:[["Attackers scan the internet for open SQL ports","fw","Network isolation."],["Shared SQL passwords keep getting reused","ent","Central identity with MFA."],["A cloud admin might read sensitive columns","ae","Engine never sees plaintext."],["Call center staff only need the last 4 digits","ddm","Mask in results."],["A stolen backup file must be unreadable","tde","Encrypts data, logs and backups at rest."],["Remove SQL logins entirely","ent","Entra-only authentication."]]});
vizDdm();
stepViz($("#viz-auditflow"),{title:"Setting up Azure SQL auditing",done:"Configured SQL auditing end to end",steps:[
  ["Choose the level","Turn on auditing at the server level so every database, including new ones, is covered."],
  ["Pick destinations","Log Analytics for KQL and Sentinel, storage for long-term retention (with immutability if needed), Event Hubs for a third-party SIEM. You can pick more than one."],
  ["Secure the target","Use a managed identity to write to storage behind a firewall, and set retention."],
  ["Support operations","Enable auditing of Microsoft support operations to see when support engineers access your server."],
  ["Review","Query the SQLSecurityAuditEvents table, or open audit logs in the portal, and connect to Sentinel for alerting."]]});
revealViz($("#viz-dbalerts"),{title:"Defender for Databases alerts",cols:3,done:"Explored every database alert",items:[
  ["SQL injection","Attack","A statement was executed that looks like a successful injection.","def"],["Potential SQL injection","Vulnerable app","A faulty statement suggests an injectable code path.","vio"],["Brute force","Credential attack","Many failed logins from one source, possibly followed by success.","def"],
  ["Unusual location","Anomaly","A login from a location not seen in the last 60 days.","vio"],["Suspicious app","Tooling","Access from a potentially harmful application, such as an attack tool.","def"],["Unusual export","Exfiltration","An unusual export of data to a new location.","vio"]]});
vizNsgEval();
quizViz($("#viz-asg"),{title:"Design the NSG rules",done:"Designed NSG rules with ASGs",qs:[
  ["Web VMs scale out often. How do you allow 443 to them without updating IPs?",["Put their NICs in asg-web and target the ASG","List every IP","Use a UDR"],0,"ASGs follow the NICs."],
  ["App tier should accept 8080 only from the web tier.",["Source asg-web, destination asg-app, port 8080","Source Internet","Source VirtualNetwork"],0,"Role-to-role rules."],
  ["Block all other VNet traffic to the DB tier.",["Deny rule from VirtualNetwork to asg-db at a priority above 65000","Rely on defaults","Delete AllowVnetInBound"],0,"Default rules can't be deleted, but a lower-number deny overrides them."],
  ["Allow Azure SQL in East US outbound without IP lists.",["Service tag Sql.EastUS","ASG","IP range 0.0.0.0/0"],0,"Service tags track Microsoft ranges."]]});
vizAvnm();
stepViz($("#viz-vwan"),{title:"Building a secured virtual hub",done:"Built a secured virtual hub",steps:[
  ["Virtual WAN","Create a Standard Virtual WAN and a hub in each region."],
  ["Connect","Connect spoke VNets, branch sites (S2S VPN), remote users (P2S) and ExpressRoute circuits to the hub."],
  ["Secure the hub","Deploy Azure Firewall into the hub from Firewall Manager. The hub is now a secured virtual hub."],
  ["Firewall policy","Attach a firewall policy, inheriting from a parent policy with org-wide rules."],
  ["Routing intent","Turn on routing intent for internet and private traffic so all flows go through the firewall."],
  ["Monitor","Send firewall logs to Log Analytics and Sentinel."]]});
sortViz($("#viz-vpnsort"),{title:"Which secure connectivity option?",bins:{s2s:"Site-to-site VPN",p2s:"P2S with Entra ID",epa:"Entra Private Access",er:"ExpressRoute + MACsec/IPsec"},done:"Picked the right connectivity every time",
  items:[["A branch office firewall needs an always-on tunnel to Azure","s2s","IPsec between sites."],["Laptops connect to the whole VNet with MFA","p2s","OpenVPN with Entra auth and CA."],["Contractors need one internal app, nothing else","epa","Per-app ZTNA."],["A 10 Gbps private link that must also be encrypted","er","Add encryption on top of ExpressRoute."],["Replace legacy VPN with per-app Conditional Access","epa","Zero trust network access."],["Datacenter-to-Azure tunnel with GCMAES256 required","s2s","Custom IPsec policy."]]});
stepViz($("#viz-epa"),{title:"How Entra Private Access connects a user to a private app",done:"Traced an Entra Private Access session",steps:[
  ["Client","The user's device runs the Global Secure Access client, signed in with Entra ID."],
  ["Policy","The user opens hr.contoso.local. The client sends the traffic to Microsoft's edge, where Conditional Access checks MFA and device compliance for that enterprise app."],
  ["Connector","A private network connector on-premises, which only makes outbound connections, picks up the session."],
  ["App","The connector reaches the app on its private IP and port. The user never gets an IP on the internal network."],
  ["Result","Only that app is reachable, so a compromised laptop can't scan or move laterally. Every session is logged."]]});
vizPeChoose();
seqViz($("#viz-dns"),{title:"Private endpoint DNS resolution",left:"VM in VNet",right:"Azure DNS",intro:"A VM looks up stpayments.blob.core.windows.net after you create a private endpoint.",
  steps:[{dir:"r",label:"Query stpayments.blob.core.windows.net",text:"The VM asks Azure DNS (168.63.129.16) for the storage account's name."},{dir:"l",label:"CNAME stpayments.privatelink.blob.core.windows.net",text:"Public DNS returns a CNAME to the privatelink name, because a private endpoint exists."},{dir:"r",label:"Resolve the privatelink name",text:"The VNet is linked to the private DNS zone privatelink.blob.core.windows.net."},{dir:"l",label:"A record: 10.2.0.5",sub:"the private endpoint's IP",text:"The private zone answers with the endpoint's private IP. Traffic stays on your network."}],
  end:"Without the zone link, the CNAME resolves to the public IP, and if public access is disabled the connection fails. On-premises clients need a conditional forwarder to a DNS Private Resolver inbound endpoint."});
revealViz($("#viz-nwtools"),{title:"Network Watcher toolbox",cols:3,done:"Explored every Network Watcher tool",items:[
  ["IP flow verify","Is it allowed?","Tests a 5-tuple against a VM's NSGs and names the rule that decides.","def"],["Effective security rules","What's applied?","Merged rules from subnet and NIC NSGs and admin rules.","vio"],["Next hop","Where does it go?","Next hop type and the route that chose it.","def"],
  ["Connection troubleshoot","Can A reach B?","End-to-end test with hop-by-hop latency and the failure point.","vio"],["VNet flow logs","What happened?","Allowed and denied flows over time, plus traffic analytics.","def"],["Packet capture","Show me the packets","Captures traffic on a VM for Wireshark-level analysis.","vio"]]});
vizFwTrace();
  },
  sims:[
    {id:"stsim",type:"check",title:"Pass the storage security review",
      scenario:"stinvoices holds customer invoices. Select every change that makes it more secure without breaking the app, which uses a managed identity.",
      opts:[["Require secure transfer and TLS 1.2",1],["Disable Blob anonymous access",1],["Disable storage account key access",1],["Assign the app's identity Storage Blob Data Reader",1],["Add a private endpoint and disable public access",1],["Enable versioning and blob soft delete",1],["Enable Defender for Storage with malware scanning",1],["Share the account key with the partner team",0],["Give the app identity Owner on the subscription",0],["Allow access from all networks for convenience",0]],
      success:"Invoices are private, identity-based, recoverable and watched for threats."},
    {id:"sqlsim",type:"choice",title:"Secure the orders database",
      scenario:"sql-orders holds customer and payment data. Auditors and the DBA team have requirements.",
      steps:[
        ["Database access must be through Entra identities only.",["Set an Entra admin and enable Microsoft Entra-only authentication","Rotate the sa password","Enable TDE"],0,"Removes SQL authentication."],
        ["Card numbers must be hidden even from DBAs.",["Always Encrypted on the card column","Dynamic data masking","Row-level security"],0,"Client-side encryption."],
        ["Support staff see emails, but masked.",["Dynamic data masking with the email() function","Always Encrypted randomized","TDE"],0,"Presentation-layer masking."],
        ["Keys protecting data at rest must be revocable by the company.",["TDE with a customer-managed key","Service-managed TDE","DDM"],0,"CMK TDE."],
        ["All logins and queries must be logged for every database, queryable with KQL.",["Server-level auditing to Log Analytics","Database-level auditing to storage only","Diagnostic logs on the VM"],0,"Server-level covers all databases."],
        ["Detect injection and brute force attempts.",["Enable Defender for Azure SQL","Enable soft delete","Add an NSG"],0,"Advanced Threat Protection."]],
      success:"sql-orders meets every audit requirement."},
    {id:"nsgsim",type:"order",title:"Evaluate the packet's journey",
      scenario:"An internet client sends HTTPS to a VM in a spoke VNet with AVNM, subnet and NIC protections. Put the checks in the order they're applied to the inbound packet.",
      steps:["AVNM security admin rules","Subnet NSG rules","NIC NSG rules","Packet delivered to the VM's guest OS firewall"],
      success:"Admin rules first, then subnet, then NIC, inbound."},
    {id:"pesim",type:"choice",title:"Make Key Vault and Storage private",
      scenario:"An app in a spoke VNet and on-premises users must reach a storage account and key vault with no public exposure.",
      steps:[
        ["What gives each resource a private IP reachable from on-premises?",["Private endpoints","Service endpoints","Public IP rules"],0,"Service endpoints don't work from on-premises."],
        ["VMs still resolve public IPs. What do you add?",["Private DNS zones (privatelink.blob…, privatelink.vaultcore.azure.net) linked to the VNets","An NSG","A UDR"],0,"DNS makes private endpoints work."],
        ["On-premises clients need the same answers. How?",["Conditional forwarders to an Azure DNS Private Resolver inbound endpoint","Hosts files on every PC","Public DNS records"],0,"The resolver bridges on-premises DNS."],
        ["Endpoints work. What's the last step?",["Disable public network access on both resources","Enable anonymous access","Delete the private DNS zones"],0,"Close the public door."],
        ["The security team wants NSG rules to apply to the endpoints.",["Enable private endpoint network policies on the subnet","Add an ASG to the storage account","Use a service tag"],0,"Off by default."]],
      success:"Both resources are reachable only over private IPs."},
    {id:"fwsim",type:"match",title:"Pick the right network control",
      scenario:"Match each requirement to the control that meets it.",
      items:[["Azure Firewall Premium","prem"],["Azure Firewall DNAT rule","dnat"],["AVNM security admin rule","avnm"],["Microsoft Entra Private Access","epa"],["IP flow verify","ipfv"]],
      slots:[["prem","Outbound inspection","Decrypt and inspect HTTPS with IDPS signatures"],["dnat","Inbound publishing","Forward the firewall's public IP port 443 to an internal web server"],["avnm","Org-wide guardrail","Block RDP from the internet on every VNet, no overrides"],["epa","Remote access","Give contractors one internal app with MFA, no network access"],["ipfv","Troubleshooting","Find which NSG rule is dropping port 1433"]],
      success:"Every requirement has the right tool."}
  ],
  badges:[
    ["reader","DN","Data Defender","Mark all 10 storage, database and networking lessons studied",c=>c.allStudied()],
    ["lab","NL","Network Lab","Complete all 20 diagrams in this module",c=>c.vizAll()],
    ["sas","SA","Token Smith","Build SAS tokens at every risk level",c=>c.earned("viz:sas")],
    ["nsg","NS","Rule Reader","Send every packet through the NSG evaluator",c=>c.earned("viz:nsgeval")],
    ["fw","FW","Firewall Tracer","Trace every flow through Azure Firewall",c=>c.earned("viz:fwtrace")],
    ["stsim","ST","Locked Blob","Pass the storage security simulation",c=>c.passed("stsim")],
    ["sqlsim","SQ","Query Guard","Pass the database simulation",c=>c.passed("sqlsim")],
    ["nsgsim","PK","Packet Path","Pass the packet journey simulation",c=>c.passed("nsgsim")],
    ["pesim","PE","Gone Private","Pass the private endpoint simulation",c=>c.passed("pesim")],
    ["fwsim","NC","Network Controller","Pass the network control simulation",c=>c.passed("fwsim")],
    ["perfect","D+","Perimeter Perfect","Score 100% on a storage and networking quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
