/* ================= Module 2: Implement and Manage Storage (AZ-104 Domain 2, 15–20%) ================= */
(function(){
const LESSONS=[
{id:"accounts",num:"2.1",title:"Storage accounts",html:`
<p>A <b>storage account</b> is the top-level container for Azure Storage data. One account can hold four data services, each with its own endpoint:</p>
<div class="viz" id="viz-svc"></div>
<h3>Account types</h3>
<ul><li><b>Standard general-purpose v2</b> (StorageV2): the default for almost everything. Blobs, files, queues and tables; every redundancy option; Hot, Cool, Cold and Archive tiers.</li>
<li><b>Premium block blobs</b> (BlockBlobStorage): SSD-backed, low latency for high transaction rates. LRS or ZRS only.</li>
<li><b>Premium file shares</b> (FileStorage): SSD-backed Azure Files, the only type that supports <b>NFS</b> shares. LRS or ZRS only.</li>
<li><b>Premium page blobs</b>: for unmanaged disks and page-blob workloads.</li>
<li>General-purpose v1 and BlobStorage are legacy; upgrade them to v2 (one way, no downtime).</li></ul>
<p>The account name becomes part of every endpoint (<code>https://<b>stweb4410</b>.blob.core.windows.net</code>), so it must be <b>globally unique</b>, <b>3–24 characters</b>, and use <b>only lowercase letters and numbers</b>. You can't rename an account; you can't switch an account between Standard and Premium either.</p>
<div class="viz" id="viz-saname"></div>
<h3>Settings to know at creation</h3>
<ul><li><b>Secure transfer required</b> (HTTPS only), on by default. <b>Minimum TLS version</b> 1.2.</li>
<li><b>Allow blob anonymous access</b>: off by default. When off, no container can be made public.</li>
<li><b>Hierarchical namespace</b>: turns the account into <b>Azure Data Lake Storage</b> for analytics (folders, POSIX ACLs).</li>
<li><b>Default access tier</b> for blobs: Hot or Cool (Cold and Archive are set per blob).</li></ul>
<div class="viz" id="viz-satype"></div>`},
{id:"redundancy",num:"2.2",title:"Redundancy",html:`
<p>Azure Storage always keeps <b>multiple copies</b> of your data. You choose how far apart those copies are.</p>
<div class="viz" id="viz-redund"></div>
<ul><li><b>LRS</b> (locally redundant): 3 copies in one datacenter. Survives a disk or rack failure. Cheapest; at least 11 nines of durability.</li>
<li><b>ZRS</b> (zone-redundant): 3 copies across 3 <b>availability zones</b> in the region. Survives a datacenter (zone) outage with no downtime.</li>
<li><b>GRS</b> (geo-redundant): LRS in the primary region, plus 3 more copies (LRS) in the <b>paired secondary region</b>, copied <b>asynchronously</b>. Survives a regional outage.</li>
<li><b>GZRS</b>: ZRS in the primary region plus LRS in the secondary. The most resilient option.</li>
<li><b>RA-GRS / RA-GZRS</b>: the same, but you can <b>read</b> from the secondary endpoint (<code>account-secondary.blob.core.windows.net</code>) at any time.</li></ul>
<p>With GRS or GZRS (no RA), the secondary copy isn't readable until a <b>failover</b>. A <b>customer-managed failover</b> promotes the secondary to primary; afterwards the account is LRS in the new region, and any data not yet replicated (see <b>Last Sync Time</b>) is lost.</p>
<p>You can change redundancy later: LRS↔GRS↔RA-GRS is a simple setting change; moving to or from ZRS needs a <b>conversion</b> (requested in the portal) or a manual migration. Premium accounts support only LRS and ZRS.</p>
<div class="viz" id="viz-redpick"></div>
<div class="tip"><b>Exam tip.</b> "Data must remain available if a datacenter fails" means at least <b>ZRS</b>. "Readable even if the primary region is down, without waiting for failover" means <b>RA-GRS</b> or <b>RA-GZRS</b>.</div>`},
{id:"access",num:"2.3",title:"Access keys, SAS, stored access policies and identity",html:`
<p>Every request to storage data must be authorized. You have four ways to do it:</p>
<div class="viz" id="viz-authsort"></div>
<h3>Account access keys</h3>
<p>Each account has <b>two 512-bit keys</b>. A key gives <b>full access</b> to everything in the account, so treat it like a root password. Two keys let you <b>rotate</b> without downtime: move apps to key2, regenerate key1, move back. Store keys in <b>Azure Key Vault</b>, which can rotate them for you. You can turn off <b>shared key access</b> entirely to force Entra ID.</p>
<h3>Shared access signatures (SAS)</h3>
<p>A SAS is a signed URL token that grants <b>limited</b> access: specific services, resources, permissions (<code>r</code> read, <code>w</code> write, <code>d</code> delete, <code>l</code> list, <code>a</code> add, <code>c</code> create…), a start and expiry time, an allowed <b>IP range</b> and protocol (HTTPS only).</p>
<ul><li><b>User delegation SAS</b>: signed with Entra ID credentials. Blob storage only, at most 7 days. <b>The most secure SAS</b>, recommended by Microsoft.</li>
<li><b>Service SAS</b>: signed with an account key; one service (blob, file, queue or table).</li>
<li><b>Account SAS</b>: signed with an account key; one or more services and service-level operations.</li></ul>
<div class="viz" id="viz-sas"></div>
<h3>Stored access policies and revoking a SAS</h3>
<p>A SAS signed with a key stays valid until it expires, unless you <b>regenerate the key</b> (which breaks every SAS and app that uses that key). A <b>stored access policy</b> on a container (up to 5 per container) holds the permissions and expiry instead of the token itself. Change or delete the policy and every SAS that references it changes or stops working immediately. A user delegation SAS is revoked by revoking the user delegation key.</p>
<div class="viz" id="viz-revoke"></div>
<h3>Identity-based access</h3>
<p>Assign <b>data plane RBAC roles</b> such as <b>Storage Blob Data Reader</b>, <b>Storage Blob Data Contributor</b>, <b>Storage Queue Data Contributor</b> or <b>Storage File Data SMB Share Contributor</b>. Apps use a <b>managed identity</b>, so there are no secrets to store. For Azure Files over SMB, use identity-based authentication with AD DS, Microsoft Entra Domain Services or Microsoft Entra Kerberos, and combine share-level roles with NTFS permissions.</p>
<h3>Encryption</h3>
<p>All data is encrypted at rest with 256-bit AES (Storage Service Encryption), and you can't turn it off. Keys are <b>Microsoft-managed</b> by default; you can use <b>customer-managed keys</b> in Key Vault or Managed HSM. <b>Infrastructure encryption</b> adds a second layer, and <b>encryption scopes</b> let you use different keys per container or blob.</p>`},
{id:"netaccess",num:"2.4",title:"Network access to storage",html:`
<p>By default a storage account accepts connections from any network (it still needs authorization). Lock it down in <b>Networking</b>:</p>
<ul><li><b>Public network access</b>: Enabled from all networks, Enabled from selected virtual networks and IP addresses, or Disabled.</li>
<li><b>IP network rules</b>: allow <b>public</b> IP addresses or ranges (for example your office). Private address ranges aren't allowed in IP rules.</li>
<li><b>Virtual network rules</b>: allow a subnet. The subnet must have a <b>Microsoft.Storage service endpoint</b>; traffic then travels over the Azure backbone with the subnet's identity, but still to the account's public endpoint.</li>
<li><b>Resource instance rules</b> and <b>trusted Microsoft services</b> exceptions (such as Azure Backup or Event Grid).</li>
<li><b>Private endpoints</b>: give the account a <b>private IP address</b> in your VNet. Traffic never touches the public endpoint, it works from peered VNets and on-premises (VPN or ExpressRoute), and you can then disable public access completely. A private DNS zone (<code>privatelink.blob.core.windows.net</code>) makes the normal name resolve to the private IP.</li></ul>
<div class="viz" id="viz-fw"></div>
<div class="viz" id="viz-epvs"></div>
<div class="tip"><b>Exam tip.</b> Service endpoints are free, per subnet, and only work from that VNet. Private endpoints cost a little, are per resource, and work from anywhere that can route to the private IP, including on-premises.</div>`},
{id:"blobs",num:"2.5",title:"Blob storage: containers, tiers and lifecycle",html:`
<p>Blob storage holds unstructured data: documents, images, backups, logs. Blobs live in <b>containers</b> (3–63 lowercase letters, numbers and hyphens). There are three blob types: <b>block</b> blobs (files, up to about 190 TiB), <b>append</b> blobs (logs) and <b>page</b> blobs (VHDs, random access).</p>
<p>A container's <b>anonymous access level</b> can be Private (default), Blob (read single blobs anonymously) or Container (read and list), but only if the account allows anonymous access.</p>
<h3>Access tiers</h3>
<div class="viz" id="viz-tiers"></div>
<ul><li><b>Hot</b>: frequently accessed. Highest storage cost, lowest access cost.</li>
<li><b>Cool</b>: infrequent access, kept at least <b>30 days</b>.</li>
<li><b>Cold</b>: rarely accessed, kept at least <b>90 days</b>.</li>
<li><b>Archive</b>: offline, kept at least <b>180 days</b>. Cheapest storage, but you can't read an archived blob until you <b>rehydrate</b> it to an online tier (Standard priority up to 15 hours, High priority often under an hour for small blobs), or copy it to a new blob.</li></ul>
<p>Deleting or moving a blob out of Cool, Cold or Archive before its minimum period incurs an <b>early deletion charge</b>. Archive is set per blob, and isn't available in ZRS, GZRS or RA-GZRS accounts.</p>
<h3>Lifecycle management</h3>
<p>A <b>lifecycle management policy</b> is a JSON set of rules that moves blobs to cooler tiers or deletes them based on days since they were <b>modified</b>, <b>created</b> or <b>last accessed</b> (needs access tracking). Rules can filter by blob type, <b>prefix</b> (like <code>logs/</code>) and <b>blob index tags</b>, and can also act on old <b>versions</b> and <b>snapshots</b>. Azure runs the policy about once a day.</p>
<div class="viz" id="viz-lifecycle"></div>
<h3>Object replication</h3>
<p><b>Object replication</b> copies block blobs asynchronously from a source container to a destination container in another account (any region). It needs <b>blob versioning</b> on both accounts and <b>change feed</b> on the source. Use it to reduce read latency or to keep a copy in another region with your own rules.</p>`},
{id:"protect",num:"2.6",title:"Data protection for blobs and files",html:`
<p>Redundancy protects against hardware failure. These features protect against <b>people</b>: accidental deletes, overwrites and ransomware.</p>
<div class="viz" id="viz-protsort"></div>
<ul><li><b>Blob soft delete</b>: deleted blobs (and overwritten data, as snapshots) are kept for 1–365 days and can be <b>undeleted</b>.</li>
<li><b>Container soft delete</b>: deleted containers are kept for 1–365 days and can be restored.</li>
<li><b>Blob versioning</b>: every write creates a new version automatically. Restore any previous version. Combine with soft delete.</li>
<li><b>Point-in-time restore</b>: roll block blobs back to an earlier time. Needs soft delete, versioning and change feed, and the restore window must be shorter than the soft delete period.</li>
<li><b>Snapshots</b>: manual read-only copies of a blob at a moment in time.</li>
<li><b>Immutable storage</b> (WORM): <b>time-based retention</b> or <b>legal hold</b> policies stop anyone, including admins, from modifying or deleting data until they expire. Used for compliance.</li>
<li><b>Resource lock</b> on the account: stops the <b>account</b> being deleted, not the data inside.</li>
<li><b>Azure Files</b>: share <b>snapshots</b> (up to 200 per share) and <b>soft delete for shares</b>; protect shares with <b>Azure Backup</b>.</li></ul>
<div class="viz" id="viz-oops"></div>`},
{id:"files",num:"2.7",title:"Azure Files and storage tools",html:`
<p><b>Azure Files</b> provides fully managed file shares in the cloud that you mount with <b>SMB</b> (Windows, Linux, macOS; port <b>445</b>) or <b>NFS</b> (Linux, premium FileStorage accounts only). Use it to replace or extend on-premises file servers, for shared app settings, and for lift-and-shift apps.</p>
<ul><li><b>Tiers</b>: <b>Premium</b> (SSD, in FileStorage accounts), and on standard accounts <b>Transaction optimized</b>, <b>Hot</b> and <b>Cool</b>.</li>
<li>Each share has a <b>quota</b> (size limit) up to 100 TiB.</li>
<li>Port 445 outbound is often blocked by ISPs; use a VPN, ExpressRoute or Azure File Sync instead.</li>
<li><b>Azure File Sync</b> caches shares on on-premises Windows Servers. Its parts: a <b>Storage Sync Service</b>, a <b>sync group</b>, a <b>cloud endpoint</b> (the share; one per sync group), and <b>server endpoints</b> (a path on each registered server). <b>Cloud tiering</b> keeps hot files local and leaves cold files as pointers.</li></ul>
<div class="viz" id="viz-blobfile"></div>
<div class="viz" id="viz-filesync"></div>
<h3>Tools for moving and managing data</h3>
<ul><li><b>Azure Storage Explorer</b>: a free desktop app to browse and manage blobs, files, queues and tables, and to generate SAS tokens.</li>
<li><b>AzCopy</b>: a command-line tool for fast copy and sync (<code>azcopy copy</code>, <code>azcopy sync</code>), authenticated with Entra ID (<code>azcopy login</code>) or a SAS.</li>
<li><b>Azure Data Box</b>: Microsoft ships you a rugged device to move terabytes offline when the network is too slow.</li>
<li><b>Azure Import/Export</b>: ship your own disks to an Azure datacenter.</li>
<li><b>Storage browser</b> in the portal: a lightweight Storage Explorer.</li></ul>
<div class="viz" id="viz-tools"></div>
<div class="viz" id="viz-azcopy"></div>`}
];

const G={
 acct:[["Four data services in a storage account","Blob, Files, Queue, Table"],["Default account type","Standard general-purpose v2 (StorageV2)"],["Account type for NFS file shares","Premium file shares (FileStorage)"],["Premium block blob kind","BlockBlobStorage"],["Storage account name rules","3–24 characters, lowercase letters and numbers, globally unique"],["Can you rename a storage account?","No"],["Can you change Standard to Premium?","No; create a new account and copy the data"],["Blob endpoint format","https://<account>.blob.core.windows.net"],["Hierarchical namespace","Turns on Azure Data Lake Storage (folders, ACLs)"],["Secure transfer required","Rejects HTTP; HTTPS only"],["Allow blob anonymous access off means","No container can be made public"],["Upgrade GPv1 to GPv2","One-way, no downtime"],["LRS","3 copies in one datacenter"],["ZRS","3 copies across 3 availability zones"],["GRS","LRS in primary + LRS in the paired region (async)"],["GZRS","ZRS in primary + LRS in the paired region"],["RA-GRS","GRS plus read access to the secondary at any time"],["Redundancy for Premium accounts","LRS or ZRS only"],["Survive a zone outage with no downtime","ZRS (or GZRS)"],["Last Sync Time","Up to when the secondary has the primary's data"],["After a customer-managed failover the account is","LRS in the new primary region"]],
 sec:[["What does an account key grant?","Full access to the whole account"],["How many access keys per account?","Two"],["Why two keys?","Rotate without downtime"],["Where should you store access keys?","Azure Key Vault"],["Most secure SAS type","User delegation SAS (Entra ID credentials)"],["User delegation SAS max lifetime","7 days"],["User delegation SAS works with","Blob storage only"],["Service SAS","Key-signed SAS for one service"],["Account SAS","Key-signed SAS for one or more services"],["SAS permission letters r w d l","Read, write, delete, list"],["How do you instantly revoke a key-signed SAS without rotating keys?","Use a stored access policy and delete or change it"],["Stored access policies per container","Up to 5"],["Effect of regenerating key1","Every SAS and connection string using key1 stops working"],["Role to read blobs with Entra ID","Storage Blob Data Reader"],["Role to read and write blobs with Entra ID","Storage Blob Data Contributor"],["Encryption at rest","Always on, AES-256; Microsoft- or customer-managed keys"],["Where are customer-managed keys stored?","Azure Key Vault or Managed HSM"],["Disable shared key access","Forces Entra ID authorization; key-signed SAS stops working"],["IP network rules accept","Public IP addresses and ranges only"],["What must a subnet have for a storage VNet rule?","A Microsoft.Storage service endpoint"],["Private endpoint for a storage account","A NIC with a private IP from your VNet for one storage service (blob, file...); needs a privatelink DNS zone"],["Private DNS zone for blobs","privatelink.blob.core.windows.net"],["Which works from on-premises over VPN: service endpoint or private endpoint?","Private endpoint"],["Trusted Microsoft services exception","Lets services like Azure Backup bypass the firewall"]],
 blob:[["Blob types","Block, append, page"],["Append blob use","Logging"],["Page blob use","VHDs and random read/write"],["Container naming","3–63 lowercase letters, numbers and hyphens"],["Container access levels","Private, Blob, Container"],["Cool minimum retention","30 days"],["Cold minimum retention","90 days"],["Archive minimum retention","180 days"],["Can you read an archived blob?","No; rehydrate it to Hot, Cool or Cold first"],["Rehydration priorities","Standard (up to 15 hours) and High"],["Early deletion charge","Removing a blob before the tier's minimum period"],["Is Archive available in ZRS accounts?","No"],["Lifecycle rule conditions","Days since modified, created or last accessed"],["Lifecycle filters","Blob type, prefix, blob index tags"],["How often does lifecycle management run?","About once a day"],["Object replication requirements","Versioning on both accounts, change feed on the source"],["Blob soft delete retention range","1–365 days"],["Blob versioning","Keeps a version on every write"],["Point-in-time restore requires","Soft delete, versioning and change feed"],["Immutable storage policy types","Time-based retention and legal hold"],["Does a lock on the account protect blobs?","No; only the account resource"]],
 files:[["Azure Files protocols","SMB and NFS"],["SMB port","445"],["NFS shares need","A premium FileStorage account"],["Standard file share tiers","Transaction optimized, Hot, Cool"],["Max share size","100 TiB"],["Share snapshots per share","Up to 200"],["Azure File Sync parts","Storage Sync Service, sync group, cloud endpoint, server endpoints"],["Cloud endpoints per sync group","One"],["Cloud tiering","Keeps hot files locally, cold files as pointers in the cloud"],["Identity-based SMB auth sources","AD DS, Entra Domain Services, Entra Kerberos"],["AzCopy","Command-line copy and sync tool"],["AzCopy sign-in","azcopy login (Entra ID) or a SAS"],["Azure Storage Explorer","Free desktop app to manage storage"],["Azure Data Box","Microsoft-supplied device for offline bulk transfer"],["Azure Import/Export","Ship your own disks to Azure"]]
};
const DECKS=[["acct","Accounts and redundancy"],["sec","Access and security"],["blob","Blobs, tiers and protection"],["files","Azure Files and tools"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Which storage account name is valid?",o:["stcontoso2026","St-Contoso","contoso_storage","sa"],a:0,e:"3–24 lowercase letters and numbers."},
 {q:"You need NFS file shares for Linux VMs. Which account type?",o:["Premium file shares (FileStorage)","Standard general-purpose v2","Premium block blobs","BlobStorage"],a:0,e:"NFS needs a premium FileStorage account."},
 {q:"An app needs consistently low-latency writes of millions of small blobs. Which account type?",o:["Premium block blobs","Standard GPv2 with Archive","Premium file shares","GPv1"],a:0,e:"BlockBlobStorage is SSD-backed."},
 {q:"You must move an account from Standard_LRS to Premium_LRS. What do you do?",o:["Create a new Premium account and copy the data","Change the SKU in Configuration","Run az storage account update --sku Premium_LRS","Convert with a support request"],a:0,e:"You can't switch between Standard and Premium."},
 {q:"Which feature turns a storage account into Azure Data Lake Storage?",o:["Hierarchical namespace","Large file shares","Versioning","Change feed"],a:0,e:"It adds directories and ACLs."},
 {q:"Data must survive the loss of one datacenter in the region with no downtime, at the lowest cost. Which redundancy?",o:["ZRS","LRS","GRS","RA-GZRS"],a:0,e:"ZRS spans availability zones."},
 {q:"Users must keep reading data even if the whole primary region is unavailable, without a failover. Which redundancy?",o:["RA-GRS","GRS","GZRS","ZRS"],a:0,e:"Read access to the secondary endpoint."},
 {q:"How many copies of your data does GRS keep?",o:["Six","Three","Two","Nine"],a:0,e:"Three in the primary, three in the secondary."},
 {q:"How is data copied to the secondary region with GRS?",o:["Asynchronously","Synchronously","Only during failover","Weekly"],a:0,e:"That's why Last Sync Time matters."},
 {q:"After a customer-managed failover of a GRS account, what is its redundancy?",o:["LRS in the new primary region","GRS, paired back to the old primary","ZRS in the new primary region","RA-GRS"],a:0,e:"Re-enable geo-redundancy afterward."},
 {q:"Which redundancy options does a Premium file share account support?",o:["LRS and ZRS","LRS, ZRS and GRS","All options","GRS only"],a:0,e:"Premium accounts don't support geo-redundancy."},
 {q:"Which is the most secure way to give an app access to blobs?",o:["A managed identity with a Storage Blob Data role","An account key in app settings","An account SAS valid for a year","Anonymous container access"],a:0,e:"No secrets to manage."},
 {q:"Which SAS type is signed with Entra ID credentials?",o:["User delegation SAS","Service SAS","Account SAS","Ad hoc SAS"],a:0,e:"It's the most secure SAS."},
 {q:"What's the longest a user delegation SAS can be valid?",o:["7 days","1 hour","30 days","1 year"],a:0,e:"It's limited by the user delegation key."},
 {q:"A partner should upload files to one container for 30 days from their office IP only. What do you give them?",o:["A SAS with write/create permissions, an expiry, and an IP range","The account key, with an instruction to use it only from their office","Owner on the account","Anonymous container access"],a:0,e:"SAS supports permissions, time and IP limits."},
 {q:"A service SAS leaked. You need to revoke it right away without breaking other apps that use the account key. What should you have used?",o:["A stored access policy, which you can delete","A longer expiry, so you could rotate the token less often","An account SAS","Anonymous access"],a:0,e:"Deleting the policy revokes every SAS tied to it."},
 {q:"How many stored access policies can a container have?",o:["5","1","10","Unlimited"],a:0,e:"Up to five."},
 {q:"What happens when you regenerate key1?",o:["Apps and SAS tokens using key1 stop working","Nothing until the next day","Only key2 changes","The account is deleted"],a:0,e:"Rotate apps to key2 first."},
 {q:"A ReadOnly lock is on a storage account. A developer can't get the connection string from the portal. Why?",o:["Listing keys is a POST action blocked by ReadOnly","Connection strings need Premium","Shared key is disabled by the lock","The account is in Archive"],a:0,e:"Use Entra ID authorization or a CanNotDelete lock."},
 {q:"Which role lets a user read and write blob data with Entra ID, without managing the account?",o:["Storage Blob Data Contributor","Storage Account Contributor","Reader","Contributor"],a:0,e:"Data roles grant DataActions."},
 {q:"You want to use your own keys for storage encryption. Where are they kept?",o:["Azure Key Vault or Managed HSM","In the storage account","In Entra ID","In a blob"],a:0,e:"Customer-managed keys."},
 {q:"You add your office's public IP to the storage firewall, but VMs in vnet-app still can't connect. What allows them?",o:["A virtual network rule for their subnet with a Microsoft.Storage service endpoint (or a private endpoint)","Adding the VNet's address space, such as 10.0.0.0/16, as an IP rule in the storage firewall's address range list","Turning on secure transfer","Changing to ZRS"],a:0,e:"IP rules accept public IPs only."},
 {q:"You try to add a VNet rule for subnet-app and get 'SubnetsHaveNoServiceEndpointsConfigured'. What's missing?",o:["A Microsoft.Storage service endpoint on the subnet","A route table on the subnet with a route to the storage service","An NSG rule","A private DNS zone"],a:0,e:"Enable the service endpoint first."},
 {q:"On-premises servers connected by ExpressRoute must reach a storage account privately with public access disabled. What do you use?",o:["A private endpoint","A service endpoint","An IP rule for 10.0.0.0/8","Anonymous access"],a:0,e:"Private endpoints work across VPN and ExpressRoute."},
 {q:"After creating a private endpoint for blob storage, which DNS zone makes the account name resolve to the private IP?",o:["privatelink.blob.core.windows.net","blob.core.windows.net","privatelink.azure.com","core.windows.net"],a:0,e:"Link it to the VNet."},
 {q:"Azure Backup must reach a storage account that has its firewall on. What do you enable?",o:["Allow trusted Microsoft services","Anonymous access","A Delete lock","Hierarchical namespace"],a:0,e:"A firewall exception for trusted services."},
 {q:"Which access tier has the lowest storage cost?",o:["Archive","Cold","Cool","Hot"],a:0,e:"But it's offline."},
 {q:"What's the minimum retention for the Cool tier before early deletion charges?",o:["30 days","7 days","90 days","180 days"],a:0,e:"Cold is 90 and Archive is 180."},
 {q:"An auditor needs a 2-year-old archived blob within the hour. What do you do?",o:["Rehydrate it to Hot with High priority","Download it directly","Change the account tier","Enable versioning"],a:0,e:"High priority can finish under an hour for small blobs."},
 {q:"Why can't you set the Archive tier on a blob?",o:["The account uses ZRS, GZRS or RA-GZRS","The blob is too small","Versioning is on","Soft delete is on"],a:0,e:"Archive needs LRS, GRS or RA-GRS."},
 {q:"Logs should move to Cool after 30 days, to Archive after 90, and be deleted after 365. What do you configure?",o:["A lifecycle management policy","Object replication","Soft delete","A budget"],a:0,e:"Rules based on days since modification."},
 {q:"A lifecycle rule should only affect blobs whose names start with logs/. Which filter?",o:["prefixMatch","blobIndexMatch","tierToCool","daysAfterCreation"],a:0,e:"Prefix filters by path."},
 {q:"You want to tier blobs based on when they were last read. What must be on?",o:["Last access time tracking","Versioning","Change feed","Hierarchical namespace"],a:0,e:"daysAfterLastAccessTimeGreaterThan needs it."},
 {q:"Object replication needs which features?",o:["Versioning on both accounts and change feed on the source","Soft delete on both accounts and a lifecycle management policy","Hierarchical namespace","Premium accounts"],a:0,e:"Both are required."},
 {q:"A user deleted a blob yesterday. What lets you restore it?",o:["Blob soft delete (if enabled before the delete)","A ReadOnly lock on the storage account","GRS (read from the secondary)","Lifecycle management"],a:0,e:"Undelete within the retention period."},
 {q:"An app overwrote a blob with bad data. Which feature lets you restore the previous content easily?",o:["Blob versioning","Container soft delete","ZRS","Private endpoint"],a:0,e:"Promote the previous version."},
 {q:"Which features does point-in-time restore require?",o:["Soft delete, versioning and change feed","Only versioning and a ReadOnly lock","Only snapshots","Immutable storage"],a:0,e:"And the restore window must be shorter than the soft delete period."},
 {q:"Financial records must not be modified or deleted by anyone for 7 years. Which feature?",o:["Immutable storage with a time-based retention policy","Soft delete for 365 days, renewed each year","A CanNotDelete lock","Versioning"],a:0,e:"WORM storage."},
 {q:"Someone deleted a whole container. What would have saved it?",o:["Container soft delete","Blob versioning only","LRS","A SAS"],a:0,e:"Restore the container within its retention."},
 {q:"Does a CanNotDelete lock on a storage account stop someone deleting blobs?",o:["No; locks protect the account resource, not data","Yes","Only in the Archive tier","Only with Premium"],a:0,e:"Use soft delete or immutability for data."},
 {q:"Users can't map an Azure file share from home. It works from the office VPN. What's the likely cause?",o:["Their ISP blocks outbound port 445","The share is NFS","The account is ZRS","The share is over quota"],a:0,e:"Use VPN or Azure File Sync."},
 {q:"Branch offices want fast local access to a cloud file share and to keep only frequently used files on site. What do you deploy?",o:["Azure File Sync with cloud tiering","Object replication","AzCopy sync on a schedule","Data Box"],a:0,e:"Cloud tiering caches hot files."},
 {q:"How many cloud endpoints can an Azure File Sync sync group have?",o:["One","Two","Ten","Unlimited"],a:0,e:"One share per sync group, many server endpoints."},
 {q:"Which tool copies a folder to blob storage from a script?",o:["AzCopy","Azure Data Box","Storage Explorer only","Import/Export"],a:0,e:"azcopy copy or azcopy sync."},
 {q:"You must move 80 TB to Azure over a slow link within two weeks. What do you use?",o:["Azure Data Box","AzCopy","Storage Explorer","Object replication"],a:0,e:"Offline transfer."},
 {q:"Which desktop app lets you browse storage, upload files and create SAS tokens?",o:["Azure Storage Explorer","AzCopy","Azure Data Box","Azure Monitor"],a:0,e:"Free for Windows, macOS and Linux."},
 {q:"Which file share tier is SSD-backed?",o:["Premium","Transaction optimized","Hot","Cool"],a:0,e:"Premium shares live in FileStorage accounts."},
 {q:"Someone deleted files on a share an hour ago. Which feature restores them quickly?",o:["A share snapshot","Blob versioning","Object replication","A Delete lock"],a:0,e:"Restore files from previous versions."},
 {q:"Which service stores messages for asynchronous processing between app components?",o:["Queue storage","Table storage","Blob storage","Azure Files"],a:0,e:"Messages up to 64 KB."},
 {q:"With 'Allow blob anonymous access' off, can you set a container to Container access level?",o:["No","Yes","Only with RA-GRS","Only with a SAS"],a:0,e:"The account setting overrides containers."}
];

/* ---------- interactive diagrams ---------- */
function vizRedund(){const el=$("#viz-redund");
  const S={LRS:{p:[[0,0],[0,0],[0,0]],s:0,ra:0},ZRS:{p:[[0,0],[1,0],[2,0]],s:0,ra:0},GRS:{p:[[0,0],[0,0],[0,0]],s:1,ra:0},"RA-GRS":{p:[[0,0],[0,0],[0,0]],s:1,ra:1},GZRS:{p:[[0,0],[1,0],[2,0]],s:1,ra:0},"RA-GZRS":{p:[[0,0],[1,0],[2,0]],s:1,ra:1}};
  const F=[["none","Everything healthy"],["disk","A disk fails"],["dc","Zone 1 datacenter fails"],["region","East US region outage"]];
  let sku="LRS",f="none";const seen=new Set();
  function draw(){const s=S[sku];const dead=(z)=>f==="dc"&&z===0||f==="region";
    const prim=s.p.map(([z])=>!dead(z)).filter(Boolean).length;const read=prim>0?"Primary":s.ra?"Secondary (read-only)":s.s?"Not until you fail over":"Unavailable";
    const ok=prim>0||s.ra;seen.add(sku+f);
    const zone=z=>`<div class="zone${f==="region"||f==="dc"&&z===0?" down":""}"><b>Zone ${z+1}</b>${s.p.filter(c=>c[0]===z).map((c,i)=>`<i class="copy${dead(z)?" lost":f==="disk"&&z===0&&i===0?" lost":""}"></i>`).join("")||'<span class="s-small">—</span>'}</div>`;
    el.innerHTML=`<div class="viz-title">Redundancy simulator</div>
    <div class="seg-row">${Object.keys(S).map(k=>`<button class="chip" data-s="${k}" aria-pressed="${k===sku}">${k}</button>`).join("")}</div>
    <div class="seg-row">${F.map(x=>`<button class="chip" data-f="${x[0]}" aria-pressed="${x[0]===f}">${x[1]}</button>`).join("")}</div>
    <div class="two-col"><div class="panel"><div class="s-small">PRIMARY · East US</div><div class="zones">${[0,1,2].map(zone).join("")}</div></div>
    <div class="panel"><div class="s-small">SECONDARY · West US (paired)</div>${s.s?`<div class="zones"><div class="zone"><b>One datacenter</b><i class="copy"></i><i class="copy"></i><i class="copy"></i></div></div><div class="s-small">${s.ra?"Readable any time":"Not readable until failover"} · copied asynchronously</div>`:'<div class="s-small az-empty">No secondary copy</div>'}</div></div>
    <div class="kv"><span>Copies</span><b class="mono">${3+(s.s?3:0)}</b><span>Read from</span><b class="${ok?"status-good":"status-bad"}">${read}</b><span>Write</span><b class="${prim?"status-good":"status-bad"}">${prim?"Available":"Unavailable"}</b></div>
    <div class="caption" aria-live="polite">${f==="none"?"Pick a failure to see what happens.":f==="disk"?"Every option keeps at least three copies, so a disk failure is invisible.":f==="dc"?(sku.includes("Z")?"Copies in the other zones keep serving reads and writes.":"With all three copies in one datacenter, the data is offline until it recovers"+(s.s?" (or you fail over to the secondary).":".")):(s.ra?"The secondary endpoint keeps serving reads right away.":s.s?"The data is safe in West US. Start a customer-managed failover to read and write again.":"The data is unavailable until the region recovers.")} <span class="s-small">${seen.size}/24 combinations tried</span></div>`;
    if(seen.size>=12)award("viz:redund",30,"Broke storage in a dozen ways")}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]"),x=e.target.closest("[data-f]");if(s)sku=s.dataset.s;if(x)f=x.dataset.f;if(s||x)draw()});draw()}
function vizSaName(){const el=$("#viz-saname");let v="Contoso_Storage";const tried=new Set();const taken=["contoso","storage","test","mystorage"];
  function rules(n){return [[n.length>=3&&n.length<=24,`3–24 characters (now ${n.length})`],[/^[a-z0-9]*$/.test(n),"Only lowercase letters and numbers"],[!taken.includes(n),"Not already taken by anyone in Azure"]]}
  function draw(){const r=rules(v);const ok=r.every(x=>x[0]);if(ok)tried.add(v);
    el.innerHTML=`<div class="viz-title">Name a storage account</div><input class="txt-in mono" data-k="v" value="${esc(v)}" aria-label="Storage account name" maxlength="30">
    <div class="sc-list">${r.map(x=>`<label class="${x[0]?"done":""}"><span>${x[0]?"✓":"✗"}</span><span>${x[1]}</span></label>`).join("")}</div>
    <pre class="term" style="min-height:0">${ok?`https://${esc(v)}.blob.core.windows.net\nhttps://${esc(v)}.file.core.windows.net`:"(az) AccountNameInvalid: not a valid storage account name."}</pre>
    <div class="caption" aria-live="polite">${ok?"Valid. The name becomes part of every endpoint, which is why it must be unique across all of Azure.":"Fix the name until all three checks pass."} <span class="s-small">${tried.size}/3 valid names found</span></div>`;
    if(tried.size>=3)award("viz:saname",20,"Named three valid storage accounts")}
  el.addEventListener("input",e=>{if(e.target.dataset.k){v=e.target.value;const p=e.target.selectionStart;draw();const i=el.querySelector("[data-k]");i.focus();i.setSelectionRange(p,p)}});draw()}
function vizSas(){const el=$("#viz-sas");const P=[["r","Read"],["a","Add"],["c","Create"],["w","Write"],["d","Delete"],["l","List"]];
  const st={perm:new Set(["r"]),exp:7,ip:"",https:true,type:"user"};const done=new Set();
  const REQ=[["Download report.pdf from 203.0.113.10 over HTTPS, day 1",{need:"r",day:1,ip:"203.0.113.10",https:1}],["List the container from 203.0.113.10, day 2",{need:"l",day:2,ip:"203.0.113.10",https:1}],["Upload new.csv from 203.0.113.10, day 3",{need:"cw",day:3,ip:"203.0.113.10",https:1}],["Download report.pdf from 198.51.100.7 (a stranger), day 1",{need:"r",day:1,ip:"198.51.100.7",https:1,bad:1}],["Download over plain HTTP, day 1",{need:"r",day:1,ip:"203.0.113.10",https:0,bad:1}],["Delete report.pdf from 203.0.113.10, day 1",{need:"d",day:1,ip:"203.0.113.10",https:1,bad:1}],["Download report.pdf, day 10",{need:"r",day:10,ip:"203.0.113.10",https:1,bad:1}]];
  const inRange=(ip)=>!st.ip||st.ip.split("-").length===2?(()=>{if(!st.ip)return true;const [a,b]=st.ip.split("-").map(AZip);const x=AZip(ip);return x>=a&&x<=b})():AZip(ip)===AZip(st.ip);
  function AZip(s){const p=String(s).trim().split(".").map(Number);return p.length===4&&p.every(n=>n>=0&&n<=255)?((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3]:-1}
  function test(r){const q=r[1];const why=[];if(st.type==="user"&&st.exp>7)why.push("a user delegation SAS can't last more than 7 days");if(![...q.need].some(c=>st.perm.has(c)))why.push(`the SAS lacks ${q.need.split("").join(" or ")} permission`);if(q.day>st.exp)why.push("the SAS expired");if(!inRange(q.ip))why.push("the IP isn't in the allowed range");if(st.https&&!q.https)why.push("HTTPS is required");return why}
  function draw(){const tok=`sp=${P.map(p=>p[0]).filter(c=>st.perm.has(c)).join("")}&se=day${st.exp}${st.ip?"&sip="+st.ip:""}&spr=${st.https?"https":"https,http"}${st.type==="user"?"&skoid=…&sks=b":""}&sig=…`;
    const res=REQ.map(test);const good=REQ.every((r,i)=>r[1].bad?res[i].length>0:res[i].length===0);
    el.innerHTML=`<div class="viz-title">SAS builder: share the reports container with a partner at 203.0.113.10</div>
    <div class="seg-row"><button class="chip" data-t="user" aria-pressed="${st.type==="user"}">User delegation SAS</button><button class="chip" data-t="svc" aria-pressed="${st.type==="svc"}">Service SAS (account key)</button></div>
    <div class="seg-row">${P.map(p=>`<button class="chip" data-p="${p[0]}" aria-pressed="${st.perm.has(p[0])}">${p[0]} · ${p[1]}</button>`).join("")}</div>
    <div class="rng-row"><span>Expires after</span><input type="range" min="1" max="30" value="${st.exp}" data-k="exp"><b>${st.exp} day${st.exp>1?"s":""}</b></div>
    <div class="dyn-row"><input class="txt-in mono" data-k="ip" value="${esc(st.ip)}" placeholder="Allowed IP or range (a.b.c.d or a-b)" aria-label="Allowed IP"><label class="chip"><input type="checkbox" data-k="https" ${st.https?"checked":""}> HTTPS only</label></div>
    <pre class="term" style="min-height:0">?${esc(tok)}</pre>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Request</th><th>Result</th></tr>${REQ.map((r,i)=>`<tr><td>${r[0]}</td><td class="${(res[i].length===0)!==!!r[1].bad?"ok":"no"}">${res[i].length?"403 · "+res[i][0]:"200 OK"}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${good?'<span class="status-good">Least privilege achieved.</span> The partner can read, list and upload from their IP for the week; everything else is refused.':"Goal: the first three requests succeed (green) and the last four are refused. A green cell means the result is what you want."}</div>`;
    if(good){done.add(st.type);award("viz:sas",30,"Built a least-privilege SAS")}}
  el.addEventListener("click",e=>{const p=e.target.closest("[data-p]"),t=e.target.closest("[data-t]");if(p){const c=p.dataset.p;st.perm.has(c)?st.perm.delete(c):st.perm.add(c);draw()}if(t){st.type=t.dataset.t;draw()}});
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(k==="exp"){st.exp=+e.target.value;draw();el.querySelector('[data-k="exp"]').focus()}if(k==="ip"){st.ip=e.target.value.trim();const p=e.target.selectionStart;draw();const i=el.querySelector('[data-k="ip"]');i.focus();i.setSelectionRange(p,p)}});
  el.addEventListener("change",e=>{if(e.target.dataset.k==="https"){st.https=e.target.checked;draw()}});draw()}
function vizRevoke(){const el=$("#viz-revoke");
  const T=[["sasA","Partner SAS (ad hoc, signed with key1)","key1",null],["sasB","Reporting SAS (uses stored policy 'reports-ro', key1)","key1","reports-ro"],["sasC","Backup SAS (ad hoc, signed with key2)","key2",null],["app","Web app connection string (key1)","key1",null],["mi","Function app (managed identity + Storage Blob Data Reader)",null,null]];
  let state={key1:1,key2:1,pol:1};const did=new Set();
  const alive=t=>t[0]==="mi"?true:(t[2]==="key1"?state.key1===1:state.key2===1)&&(!t[3]||state.pol);
  function draw(){el.innerHTML=`<div class="viz-title">Revoke access: what breaks?</div>
    <div class="viz-controls"><button class="btn" data-a="pol">${state.pol?"Delete":"Re-create"} stored policy 'reports-ro'</button><button class="btn" data-a="key1">Regenerate key1</button><button class="btn" data-a="key2">Regenerate key2</button><button class="btn" data-a="reset">Reset</button></div>
    <div class="sc-list">${T.map(t=>`<label class="${alive(t)?"done":""}"><span>${alive(t)?"✓":"✗"}</span><span>${t[1]}</span><span class="tag">${alive(t)?"works":"403"}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${el._m||"The partner SAS leaked. Revoke only what you need to."} <span class="s-small">${did.size}/3 actions tried</span></div>`;
    if(did.size>=3)award("viz:revoke",20,"Compared every way to revoke a SAS")}
  el.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;
    if(a==="reset"){state={key1:1,key2:1,pol:1};el._m="";draw();return}did.add(a);
    if(a==="pol"){state.pol=!state.pol;el._m=state.pol?"Policy re-created: tokens that reference it work again.":"Only the reporting SAS stopped working. Stored access policies let you revoke a group of SAS tokens without touching keys."}
    if(a==="key1"){state.key1++;el._m="Regenerating key1 killed the leaked SAS, but also the reporting SAS and the web app's connection string. The managed identity didn't care: no keys involved."}
    if(a==="key2"){state.key2++;el._m="Only the backup SAS used key2. The leaked partner SAS still works!"}draw()});draw()}
function vizFw(){const el=$("#viz-fw");const st={mode:"sel",office:false,sub:false,trusted:false};const seen=new Set();
  const C=[["Office laptop (public IP 203.0.113.10)","office"],["VM in vnet-app/subnet-web (service endpoint)","sub"],["VM in vnet-app/subnet-db (no service endpoint)","db"],["Azure Backup (trusted service)","trusted"],["Home user (public IP 198.51.100.7)","home"]];
  const ok=k=>st.mode==="all"||(st.mode==="sel"&&(k==="office"&&st.office||k==="sub"&&st.sub||k==="trusted"&&st.trusted));
  function draw(){const r=C.map(c=>ok(c[1]));const goal=r[0]&&r[1]&&!r[2]&&r[3]&&!r[4]&&st.mode==="sel";
    el.innerHTML=`<div class="viz-title">Storage firewall: who gets in?</div>
    <div class="seg-row">${[["all","Enabled from all networks"],["sel","Selected networks"],["off","Disabled"]].map(x=>`<button class="chip" data-m="${x[0]}" aria-pressed="${st.mode===x[0]}">${x[1]}</button>`).join("")}</div>
    ${st.mode==="sel"?`<div class="sc-list"><label><input type="checkbox" data-c="office" ${st.office?"checked":""}><span>IP rule 203.0.113.10</span></label><label><input type="checkbox" data-c="sub" ${st.sub?"checked":""}><span>VNet rule vnet-app/subnet-web</span></label><label><input type="checkbox" data-c="trusted" ${st.trusted?"checked":""}><span>Allow trusted Microsoft services</span></label></div>`:""}
    <div class="sc-list" style="margin-top:8px">${C.map((c,i)=>`<label class="${r[i]?"done":""}"><span>${r[i]?"✓":"✗"}</span><span>${c[0]}</span><span class="tag">${r[i]?"allowed":"403 blocked"}</span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${goal?'<span class="status-good">Locked down correctly.</span> The office, the web subnet and Azure Backup get in; nobody else does.':st.mode==="off"?"Public access disabled: only private endpoints can reach the account now.":"Goal: allow the office, subnet-web and Azure Backup, and block everyone else."}</div>`;
    seen.add(st.mode);if(goal&&seen.size>=2)award("viz:fw",30,"Configured the storage firewall")}
  el.addEventListener("click",e=>{const m=e.target.closest("[data-m]");if(m){st.mode=m.dataset.m;draw()}});
  el.addEventListener("change",e=>{const c=e.target.dataset.c;if(c){st[c]=e.target.checked;draw()}});draw()}
function vizTiers(){const el=$("#viz-tiers");let gb=1000,reads=10,months=6;const seen=new Set();
  const T=[["Hot",0.018,0.0004,0,0],["Cool",0.01,0.01,30,0],["Cold",0.0036,0.03,90,0],["Archive",0.00099,0.02,180,1]];
  function draw(){const rows=T.map(t=>{const store=t[1]*gb*months;const read=t[2]*gb*(reads/100)*months;const early=months*30<t[3]?t[1]*gb*(t[3]/30-months):0;return {t,cost:store+read+early,early}});const best=rows.reduce((a,b)=>b.cost<a.cost?b:a);seen.add(best.t[0]);
    el.innerHTML=`<div class="viz-title">Pick the cheapest tier (illustrative prices)</div>
    <div class="rng-row"><span>Data</span><input type="range" min="100" max="10000" step="100" value="${gb}" data-k="gb"><b>${gb} GB</b></div>
    <div class="rng-row"><span>Read per month</span><input type="range" min="0" max="200" step="5" value="${reads}" data-k="reads"><b>${reads}% of the data</b></div>
    <div class="rng-row"><span>Keep for</span><input type="range" min="1" max="24" value="${months}" data-k="months"><b>${months} month${months>1?"s":""}</b></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Tier</th><th>Min days</th><th>Total cost</th><th>Notes</th></tr>${rows.map(r=>`<tr class="${r===best?"cur":""}"><td>${r.t[0]}</td><td>${r.t[3]||"—"}</td><td class="${r===best?"ok":""}">$${r.cost.toFixed(0)}</td><td class="s-small">${r.early?`Early deletion fee $${r.early.toFixed(0)}`:""}${r.t[4]?" Offline: rehydrate before reading":""}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite"><b>${best.t[0]}</b> is cheapest here. ${best.t[0]==="Hot"?"Data you read a lot belongs in Hot: access charges dominate.":best.t[0]==="Archive"?"Long-lived data you rarely read belongs in Archive, if you can wait hours to read it.":"Middle tiers win when reads are occasional."} <span class="s-small">${seen.size}/4 tiers have won</span></div>`;
    if(seen.size>=3)award("viz:tiers",25,"Found when each tier wins")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;if(k==="gb")gb=+e.target.value;if(k==="reads")reads=+e.target.value;if(k==="months")months=+e.target.value;draw();el.querySelector(`[data-k="${k}"]`).focus()});draw()}
function vizLifecycle(){const el=$("#viz-lifecycle");let c=30,a=90,d=365,day=0;const seen=new Set();
  function tierAt(x){return d&&x>=d?"Deleted":a&&x>=a?"Archive":c&&x>=c?"Cool":"Hot"}
  function draw(){const valid=c<a&&a<d;const t=tierAt(day);if(valid)seen.add(t);
    const pol={rules:[{enabled:true,name:"logs-tiering",type:"Lifecycle",definition:{filters:{blobTypes:["blockBlob"],prefixMatch:["logs/"]},actions:{baseBlob:{tierToCool:{daysAfterModificationGreaterThan:c},tierToArchive:{daysAfterModificationGreaterThan:a},delete:{daysAfterModificationGreaterThan:d}}}}}]};
    el.innerHTML=`<div class="viz-title">Lifecycle policy designer · logs/app-2026-01.log</div>
    <div class="rng-row"><span>To Cool after</span><input type="range" min="1" max="200" value="${c}" data-k="c"><b>${c} days</b></div>
    <div class="rng-row"><span>To Archive after</span><input type="range" min="1" max="400" value="${a}" data-k="a"><b>${a} days</b></div>
    <div class="rng-row"><span>Delete after</span><input type="range" min="1" max="800" value="${d}" data-k="d"><b>${d} days</b></div>
    <div class="rng-row"><span>Blob age today</span><input type="range" min="0" max="800" value="${day}" data-k="day"><b>${day} days</b></div>
    <div class="stp-flow">${["Hot","Cool","Archive","Deleted"].map(x=>`<span class="${x===t?"on":""}">${x}</span>`).join("")}</div>
    ${valid?`<pre class="json">${esc(JSON.stringify(pol,null,2))}</pre>`:'<div class="status-bad">Invalid policy: each action must come after the one before it (Cool &lt; Archive &lt; Delete).</div>'}
    <div class="caption" aria-live="polite">${valid?`At ${day} days the blob is <b>${t}</b>.${t==="Archive"&&day-a<180?" Moving it again before 180 days in Archive would incur an early deletion charge.":""}`:"Fix the order to continue."} <span class="s-small">States seen: ${seen.size}/4</span></div>`;
    if(seen.size===4)award("viz:lifecycle",30,"Followed a blob through its whole lifecycle")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;const v=+e.target.value;if(k==="c")c=v;if(k==="a")a=v;if(k==="d")d=v;if(k==="day")day=v;draw();el.querySelector(`[data-k="${k}"]`).focus()});draw()}
function vizOops(){const el=$("#viz-oops");const F=[["sd","Blob soft delete (14 days)"],["csd","Container soft delete (7 days)"],["ver","Blob versioning"],["imm","Immutable storage (time-based retention)"],["lock","CanNotDelete lock on the account"]];
  const on={sd:false,csd:false,ver:false,imm:false,lock:false};const saved=new Set();
  const E=[["Dev deletes invoice-0042.pdf",o=>o.sd||o.imm?(o.imm?"Blocked: the immutability policy forbids deleting it.":"Recovered with undelete."):null],["An app overwrites prices.json with bad data",o=>o.ver?"Restored the previous version.":o.sd?"Recovered: soft delete kept the overwritten data as a snapshot.":o.imm?"Blocked: immutable blobs can't be overwritten.":null],["Intern deletes the whole 'invoices' container",o=>o.csd?"Restored the container.":o.imm?"Blocked: a container with immutable blobs can't be deleted.":null],["Someone tries to delete the storage account",o=>o.lock?"Blocked by the CanNotDelete lock.":null],["Ransomware encrypts every blob in place",o=>o.imm?"Blocked: immutable blobs can't be modified.":o.ver?"Restored earlier versions of every blob.":null]];
  function draw(){const r=E.map(x=>x[1](on));r.forEach((x,i)=>{if(x)saved.add(i)});
    el.innerHTML=`<div class="viz-title">Oops simulator: turn on protection, then see what you can recover</div>
    <div class="sc-list">${F.map(f=>`<label class="${on[f[0]]?"done":""}"><input type="checkbox" data-f="${f[0]}" ${on[f[0]]?"checked":""}><span>${f[1]}</span></label>`).join("")}</div>
    <div class="sc-list" style="margin-top:8px">${E.map((x,i)=>`<label class="${r[i]?"done":""}"><span>${r[i]?"✓":"✗"}</span><span><b>${x[0]}</b><br><span class="s-small">${r[i]||"Data lost."}</span></span></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${r.every(Boolean)?'<span class="status-good">Every incident handled.</span> Notice that the lock only protected the account, and that redundancy (LRS, GRS…) never appears: replicas copy deletes too.':"Turn features on one at a time to see which incident each one handles."} <span class="s-small">${saved.size}/5 incidents survived at least once</span></div>`;
    if(saved.size===5)award("viz:oops",25,"Protected data against every accident")}
  el.addEventListener("change",e=>{const f=e.target.dataset.f;if(f){on[f]=e.target.checked;draw()}});draw()}

const LIFE_JSON=JSON.stringify({rules:[{enabled:true,name:"archive-logs",type:"Lifecycle",definition:{filters:{blobTypes:["blockBlob"],prefixMatch:["logs/"]},actions:{baseBlob:{tierToCool:{daysAfterModificationGreaterThan:30},tierToArchive:{daysAfterModificationGreaterThan:90},delete:{daysAfterModificationGreaterThan:365}}}}}]},null,2);

registerModule({
  id:"sto",slug:"storage",title:"Implement and Manage Storage",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["svc","saname","satype","redund","redpick","authsort","sas","revoke","fw","epvs","tiers","lifecycle","protsort","oops","blobfile","filesync","tools","azcopy"],
  viz(){
revealViz($("#viz-svc"),{title:"One account, four services",cols:2,done:"Explored every storage service",items:[["Blob storage","BLOB","Unstructured objects: documents, images, video, backups, data lakes. https://acct.blob.core.windows.net"],["Azure Files","FILES","Managed SMB and NFS file shares you can mount like a network drive. https://acct.file.core.windows.net"],["Queue storage","QUEUE","Messages (up to 64 KB each) that decouple app components. https://acct.queue.core.windows.net"],["Table storage","TABLE","NoSQL key-attribute data with a flexible schema. https://acct.table.core.windows.net"]]});
vizSaName();
sortViz($("#viz-satype"),{title:"Which account type?",bins:{v2:"Standard general-purpose v2",bb:"Premium block blobs",fs:"Premium file shares"},
  items:[["Website images, backups and logs with Archive for old data","v2","The default; supports every tier."],["NFS shares for Linux SAP servers","fs","NFS needs FileStorage."],["IoT telemetry with very high write rates and low latency","bb","SSD-backed blobs."],["Files, queues and tables for a small app, with GRS","v2","Premium can't use GRS."],["High-performance SMB shares for a database tier","fs","Premium SSD file shares."],["Data Lake Storage for analytics on a budget","v2","Enable hierarchical namespace."]],done:"Matched every account type"});
vizRedund();
quizViz($("#viz-redpick"),{title:"Choose the redundancy",done:"Picked the right redundancy every time",qs:[
  ["Dev/test data you can recreate. Cheapest option.",["LRS","ZRS","GZRS"],0,"Three copies in one datacenter."],
  ["Production data must stay available for reads and writes if one datacenter fails.",["ZRS","LRS","GRS"],0,"GRS doesn't survive a zone outage without failover; ZRS does."],
  ["Must survive a regional disaster and a zone failure, with reads from the secondary at any time.",["RA-GZRS","GRS","ZRS"],0,"The most resilient option."],
  ["A Premium file share account needs zone resilience.",["ZRS","GZRS","RA-GRS"],0,"Premium supports LRS and ZRS only."],
  ["You must keep a geo copy but you rarely need to read it.",["GRS","RA-GRS","LRS"],0,"No need to pay for read access."]]});
sortViz($("#viz-authsort"),{title:"Which authorization method?",bins:{key:"Account key",sas:"SAS token",ent:"Entra ID (RBAC)",anon:"Anonymous"},
  items:[["An app on a VM reads blobs using its managed identity","ent","Data plane roles, no secrets."],["A partner uploads files for 7 days from one IP","sas","Limited, time-bound."],["A public website serves product images to anyone","anon","Container access level Blob."],["A legacy tool needs full access with a connection string","key","Full access: protect it in Key Vault."],["An admin browses data in the portal with 'Microsoft Entra user account' selected","ent","The portal uses your identity."],["Give a customer a download link valid for one hour","sas","Expiry built in."]],done:"Matched every authorization method"});
vizSas();vizRevoke();vizFw();
sortViz($("#viz-epvs"),{title:"Service endpoint or private endpoint?",bins:{se:"Service endpoint",pe:"Private endpoint"},
  items:[["The storage account gets a private IP in your VNet","pe","A NIC in your subnet."],["Free, enabled per subnet","se","No extra resource."],["Reachable from on-premises over ExpressRoute","pe","Routable private IP."],["Traffic goes to the account's public endpoint over the Azure backbone","se","Still the public endpoint."],["Lets you disable public network access completely","pe","Private only."],["Needs a privatelink DNS zone for name resolution","pe","Resolves the normal name to the private IP."]],done:"Sorted endpoints correctly",end:"Both keep traffic on Microsoft's network. Only private endpoints remove the public endpoint from the picture."});
vizTiers();vizLifecycle();
sortViz($("#viz-protsort"),{title:"Which feature protects against what?",bins:{sd:"Soft delete",ver:"Versioning",imm:"Immutable storage",red:"Redundancy (ZRS/GRS)",pitr:"Point-in-time restore"},
  items:[["A disk or datacenter fails","red","Copies protect hardware, not people."],["A blob was deleted by mistake","sd","Undelete it."],["An app overwrote a blob with bad data","ver","Restore the previous version."],["Records must be unchangeable for 7 years","imm","WORM."],["Roll an entire container back to how it was at 9:00 this morning","pitr","Block blobs only."],["A whole region goes offline","red","GRS/GZRS."]],done:"Matched every protection feature"});
vizOops();
sortViz($("#viz-blobfile"),{title:"Blob storage or Azure Files?",bins:{blob:"Blob storage",files:"Azure Files"},
  items:[["Replace a Windows file server with mapped drives","files","SMB shares."],["Store millions of images served over HTTPS","blob","Object storage."],["Lift-and-shift app that reads config from \\\\server\\share","files","Same SMB path semantics."],["Data lake for analytics","blob","With hierarchical namespace."],["Archive old backups for 7 years cheaply","blob","Archive tier."],["Linux servers mount a shared NFS path","files","Premium NFS shares."]],done:"Picked the right storage service"});
stepViz($("#viz-filesync"),{title:"Setting up Azure File Sync",done:"Walked through Azure File Sync setup",steps:[
  ["Create a file share","In a storage account, for example 'finance' in stfiles4410."],
  ["Deploy a Storage Sync Service","The top-level resource that ties shares and servers together."],
  ["Create a sync group","Defines what syncs. Add the file share as the one cloud endpoint."],
  ["Install the agent and register servers","Install the Azure File Sync agent on each Windows Server and register it with the Storage Sync Service."],
  ["Add server endpoints","Add a path on each registered server (for example D:\\Finance). Several servers can sync the same share."],
  ["Turn on cloud tiering","Keep free space on the volume; cold files become pointers and are recalled when opened."]]});
sortViz($("#viz-tools"),{title:"Which tool?",bins:{az:"AzCopy",se:"Storage Explorer",db:"Data Box",ie:"Import/Export"},
  items:[["Nightly script syncs a folder to a container","az","azcopy sync."],["A support engineer browses blobs and creates a SAS with a GUI","se","Desktop app."],["Move 200 TB with no fast network, using a Microsoft device","db","Offline device."],["Ship your own hard drives to the datacenter","ie","Your disks."],["Copy blobs between two storage accounts quickly from the command line","az","Server-to-server copy."]],done:"Picked the right storage tool"});
azViz($("#viz-azcopy"),{title:"Cloud Shell drill: upload with AzCopy and a SAS",scenario:"Upload <code>report.csv</code> to the <b>reports</b> container in <b>stdata4410</b> using a short-lived SAS.",
  filesData:{"report.csv":"region,sales\neast,1200\nwest,980"},
  setup:(w,AZ)=>{w.rgs["rg-data"]={name:"rg-data",loc:"eastus",tags:{}};const r=AZ.newSa(w,"rg-data","stdata4410","eastus",{sku:"Standard_LRS"});AZ.newContainer(r,"reports")},
  tasks:[{t:"Create a container SAS with <b>create</b> and <b>write</b> permissions (<code>cw</code>) that expires soon, and save it in a variable.",hint:"sas=$(az storage container generate-sas --account-name stdata4410 --name reports --permissions cw --expiry 2026-12-31T23:59Z --https-only -o tsv)",check:w=>(w.res.find(r=>r.name==="stdata4410").p.sas||[]).some(s=>/[cw]/.test(s.perm))},
    {t:"Copy report.csv to the container with AzCopy, using the SAS.",hint:'azcopy copy report.csv "https://stdata4410.blob.core.windows.net/reports/report.csv?$sas"',check:w=>!!w.res.find(r=>r.name==="stdata4410").p.containers.reports.blobs["report.csv"]}],
  solution:'sas=$(az storage container generate-sas --account-name stdata4410 --name reports --permissions cw --expiry 2026-12-31T23:59Z --https-only -o tsv)\nazcopy copy report.csv "https://stdata4410.blob.core.windows.net/reports/report.csv?$sas"\naz storage blob list --account-name stdata4410 --container-name reports -o table'},"azcopy",40,"Uploaded with AzCopy");
  },
  sims:[
    {id:"secure",type:"cli",title:"Build a secure storage account",shell:"both",
      scenario:"The finance team needs storage for invoices. Security's rules: zone-redundant, HTTPS only with TLS 1.2, no anonymous access, reachable only from the office (public IP <b>203.0.113.10</b>) and from <b>subnet-app</b> in <b>vnet-fin</b>.",
      setup:(w,AZ)=>{w.rgs["rg-fin"]={name:"rg-fin",loc:"eastus",tags:{}};AZ.exec(w,"az network vnet create -g rg-fin -n vnet-fin --address-prefixes 10.20.0.0/16 --subnet-name subnet-app --subnet-prefixes 10.20.1.0/24")},
      tasks:[
        {t:"Create <b>stfin4410</b> in rg-fin: StorageV2, <b>Standard_ZRS</b>, minimum TLS 1.2, blob anonymous access <b>off</b>.",hint:"az storage account create -n stfin4410 -g rg-fin -l eastus --sku Standard_ZRS --kind StorageV2 --min-tls-version TLS1_2 --allow-blob-public-access false",psHint:"New-AzStorageAccount -ResourceGroupName rg-fin -Name stfin4410 -Location eastus -SkuName Standard_ZRS -Kind StorageV2 -MinimumTlsVersion TLS1_2 -AllowBlobPublicAccess $false",check:w=>{const r=w.res.find(x=>x.name==="stfin4410");return r&&r.p.sku==="Standard_ZRS"&&r.p.kind==="StorageV2"&&r.p.tls==="TLS1_2"&&!r.p.publicBlob}},
        {t:"Add a <b>Microsoft.Storage</b> service endpoint to subnet-app.",hint:"az network vnet subnet update -g rg-fin --vnet-name vnet-fin -n subnet-app --service-endpoints Microsoft.Storage",check:w=>{const v=w.res.find(r=>r.t==="vnet"&&r.name==="vnet-fin");return v&&v.p.subnets.some(s=>s.name==="subnet-app"&&(s.svcEp||[]).map(x=>x.toLowerCase()).includes("microsoft.storage"))}},
        {t:"Allow subnet-app and the office IP <b>203.0.113.10</b> through the storage firewall.",hint:"az storage account network-rule add -g rg-fin --account-name stfin4410 --vnet-name vnet-fin --subnet subnet-app\naz storage account network-rule add -g rg-fin --account-name stfin4410 --ip-address 203.0.113.10",check:w=>{const r=w.res.find(x=>x.name==="stfin4410");return r&&r.p.vnetRules.length>0&&r.p.ipRules.includes("203.0.113.10")}},
        {t:"Set the firewall's default action to <b>Deny</b> so nothing else gets in.",hint:"az storage account update -n stfin4410 -g rg-fin --default-action Deny",check:w=>{const r=w.res.find(x=>x.name==="stfin4410");return r&&r.p.defaultAction==="Deny"}},
        {t:"Create a private container called <b>invoices</b>.",hint:"az storage container create --account-name stfin4410 --name invoices --auth-mode login",check:w=>{const r=w.res.find(x=>x.name==="stfin4410");return r&&r.p.containers.invoices&&r.p.containers.invoices.pub==="off"}}],
      success:"Zone-redundant, encrypted, HTTPS-only and reachable from just two places. Try adding a private IP like 10.20.1.4 as an IP rule to see why VNet rules exist.",
      solution:"az storage account create -n stfin4410 -g rg-fin -l eastus --sku Standard_ZRS --kind StorageV2 --min-tls-version TLS1_2 --allow-blob-public-access false\naz network vnet subnet update -g rg-fin --vnet-name vnet-fin -n subnet-app --service-endpoints Microsoft.Storage\naz storage account network-rule add -g rg-fin --account-name stfin4410 --vnet-name vnet-fin --subnet subnet-app\naz storage account network-rule add -g rg-fin --account-name stfin4410 --ip-address 203.0.113.10\naz storage account update -n stfin4410 -g rg-fin --default-action Deny\naz storage container create --account-name stfin4410 --name invoices --auth-mode login"},
    {id:"protectlab",type:"cli",title:"Protect and tier blob data",shell:"bash",
      scenario:"<b>stlogs4410</b> holds application logs and an important price list. Turn on protection, recover from a mistake, and set up automatic tiering with the lifecycle policy in <code>lifecycle.json</code>.",
      filesData:{"lifecycle.json":LIFE_JSON},
      setup:(w,AZ)=>{w.rgs["rg-logs"]={name:"rg-logs",loc:"eastus",tags:{}};const r=AZ.newSa(w,"rg-logs","stlogs4410","eastus",{sku:"Standard_LRS"});const c=AZ.newContainer(r,"data");["prices.json","logs/app-2025-01.log","logs/app-2025-02.log"].forEach(n=>c.blobs[n]={name:n,tier:"Hot",size:240000,at:Date.now(),versions:[]});c.blobs["archive/2019-audit.zip"]={name:"archive/2019-audit.zip",tier:"Archive",size:9e8,at:Date.now(),versions:[]}},
      tasks:[
        {t:"Turn on <b>blob soft delete</b> (14 days) and <b>versioning</b> for stlogs4410.",hint:"az storage account blob-service-properties update --account-name stlogs4410 -g rg-logs --enable-delete-retention true --delete-retention-days 14 --enable-versioning true",check:w=>{const b=w.res.find(r=>r.name==="stlogs4410").p.blobProps;return b.softDelete&&b.softDays===14&&b.versioning}},
        {t:"Oops: delete <b>prices.json</b> from the data container…",hint:"az storage blob delete --account-name stlogs4410 -c data -n prices.json",sticky:true,check:w=>!!w.res.find(r=>r.name==="stlogs4410").p.containers.data.deleted["prices.json"]||w._undeleted},
        {t:"…then get it back.",hint:"az storage blob undelete --account-name stlogs4410 -c data -n prices.json",check:w=>w._undeleted&&!!w.res.find(r=>r.name==="stlogs4410").p.containers.data.blobs["prices.json"]},
        {t:"Apply the lifecycle policy from <code>lifecycle.json</code> (have a look at it first).",hint:"az storage account management-policy create --account-name stlogs4410 -g rg-logs --policy @lifecycle.json",check:w=>!!w.res.find(r=>r.name==="stlogs4410").p.lifecycle},
        {t:"The auditors need <b>archive/2019-audit.zip</b>. Try to download it, then start rehydrating it to <b>Hot</b> with <b>High</b> priority.",hint:"az storage blob set-tier --account-name stlogs4410 -c data -n archive/2019-audit.zip --tier Hot --rehydrate-priority High",check:w=>{const b=w.res.find(r=>r.name==="stlogs4410").p.containers.data.blobs["archive/2019-audit.zip"];return b&&b.rehydrateTo==="Hot"}}],
      onCmd:(l,w)=>{if(/blob undelete/.test(l)&&/prices\.json/.test(l)&&w.res.find(r=>r.name==="stlogs4410").p.containers.data.blobs["prices.json"])w._undeleted=true},
      success:"Deletes are now reversible, old logs tier themselves, and the audit file will be readable once rehydration finishes.",
      solution:"az storage account blob-service-properties update --account-name stlogs4410 -g rg-logs --enable-delete-retention true --delete-retention-days 14 --enable-versioning true\naz storage blob delete --account-name stlogs4410 -c data -n prices.json\naz storage blob undelete --account-name stlogs4410 -c data -n prices.json\ncat lifecycle.json\naz storage account management-policy create --account-name stlogs4410 -g rg-logs --policy @lifecycle.json\naz storage blob download --account-name stlogs4410 -c data -n archive/2019-audit.zip\naz storage blob set-tier --account-name stlogs4410 -c data -n archive/2019-audit.zip --tier Hot --rehydrate-priority High"},
    {id:"shares",type:"cli",title:"Set up file shares",shell:"bash",
      scenario:"Move the HR department's file server to Azure Files: a 100 GiB SMB share with share soft delete and a snapshot before the migration starts.",
      setup:(w,AZ)=>{w.rgs["rg-files"]={name:"rg-files",loc:"eastus",tags:{}}},
      tasks:[
        {t:"Create a StorageV2 account <b>sthr4410</b> (Standard_LRS) in rg-files.",hint:"az storage account create -n sthr4410 -g rg-files -l eastus --sku Standard_LRS --kind StorageV2",check:w=>w.res.some(r=>r.name==="sthr4410")},
        {t:"Create an SMB share named <b>hr</b> with a <b>100 GiB</b> quota.",hint:"az storage share-rm create -g rg-files --storage-account sthr4410 --name hr --quota 100 --enabled-protocols SMB",check:w=>{const r=w.res.find(x=>x.name==="sthr4410");return r&&r.p.shares.hr&&r.p.shares.hr.quota===100}},
        {t:"Turn on soft delete for file shares (14 days).",hint:"az storage account file-service-properties update --account-name sthr4410 -g rg-files --enable-delete-retention true --delete-retention-days 14",check:w=>{const r=w.res.find(x=>x.name==="sthr4410");return r&&r.p.fileSoftDelete&&r.p.fileSoftDays===14}},
        {t:"Take a snapshot of the hr share.",hint:"az storage share-rm snapshot -g rg-files --storage-account sthr4410 --name hr",check:w=>{const r=w.res.find(x=>x.name==="sthr4410");return r&&r.p.shares.hr&&r.p.shares.hr.snaps.length>0}},
        {t:"Try to create an <b>NFS</b> share called <b>hrnfs</b> in the same account. Why does it fail?",hint:"az storage share-rm create -g rg-files --storage-account sthr4410 --name hrnfs --enabled-protocols NFS",sticky:true,check:w=>w._nfs}],
      onCmd:(l,w,r)=>{if(/share-rm create/.test(l)&&/NFS/i.test(l)&&r&&r.err)w._nfs=true},
      success:"HR has its share with a safety net. NFS would need a separate Premium FileStorage account.",
      solution:"az storage account create -n sthr4410 -g rg-files -l eastus --sku Standard_LRS --kind StorageV2\naz storage share-rm create -g rg-files --storage-account sthr4410 --name hr --quota 100 --enabled-protocols SMB\naz storage account file-service-properties update --account-name sthr4410 -g rg-files --enable-delete-retention true --delete-retention-days 14\naz storage share-rm snapshot -g rg-files --storage-account sthr4410 --name hr\naz storage share-rm create -g rg-files --storage-account sthr4410 --name hrnfs --enabled-protocols NFS"},
    {id:"stomatch",type:"match",title:"Match the storage requirement",
      scenario:"Each team sent one requirement. Match the Azure Storage feature that meets it.",
      items:[["RA-GZRS","ragzrs"],["User delegation SAS","uds"],["Private endpoint","pe"],["Lifecycle management","lc"],["Immutable storage","imm"],["Azure File Sync","afs"]],
      slots:[["ragzrs","Ops","Reads must keep working through a zone failure and a regional outage"],["uds","Security","Temporary blob links must be signed with Entra ID, not account keys"],["pe","Network","On-premises servers reach storage privately over ExpressRoute"],["lc","Finance","Logs older than 90 days should move to Archive automatically"],["imm","Legal","Contracts can't be changed or deleted by anyone for 10 years"],["afs","Branches","Keep a local cache of the cloud file share on each branch server"]],
      success:"Six requirements met with six features."},
    {id:"stotrouble",type:"choice",title:"Storage help desk",
      scenario:"Work the storage tickets in the queue.",
      steps:[
        ["'I can't open the old 2018 backup blob. It says the operation isn't permitted.'",["It's in the Archive tier; rehydrate it first","The SAS is too long","The account is ZRS"],0,"Archived blobs are offline."],
        ["'Our SAS stopped working this morning for every partner at once.'",["Someone regenerated the key that signed the SAS tokens","The blobs moved to Cool","Soft delete is on"],0,"Regenerating a key invalidates every SAS it signed."],
        ["'The VM in subnet-db gets 403 from the storage account, but subnet-web works.'",["subnet-db has no service endpoint or VNet rule","The VM needs a public IP","The account needs Premium"],0,"Each subnet needs its own rule."],
        ["'I can't make the images container public.'",["The account has blob anonymous access turned off","Containers can never be public","The container is in Archive"],0,"The account-level setting overrides the container."],
        ["'We set Archive on a blob and got an error.'",["The account uses ZRS (or GZRS/RA-GZRS), which doesn't support Archive","Archive requires Premium","The blob must be over 1 GB"],0,"Archive needs LRS, GRS or RA-GRS."],
        ["'Home users can't map the file share, but it works in the office.'",["Their ISPs block port 445; use VPN or File Sync","The share is over quota","SMB needs Premium"],0,"Common SMB issue."]],
      success:"Tickets closed."}
  ],
  badges:[
    ["reader","ST","Storage Scholar","Mark all 7 storage lessons studied",c=>c.allStudied()],
    ["lab","SL","Storage Lab","Complete all 18 diagrams in this module",c=>c.vizAll()],
    ["sas","SAS","Token Smith","Build a least-privilege SAS in the SAS builder",c=>c.earned("viz:sas")],
    ["secure","FW","Firewall Builder","Pass the secure storage account lab",c=>c.passed("secure")],
    ["protectlab","UN","Undelete","Pass the blob protection lab",c=>c.passed("protectlab")],
    ["shares","FS","Share Keeper","Pass the file shares lab",c=>c.passed("shares")],
    ["redund","GZ","Six Copies","Break storage a dozen ways in the redundancy simulator",c=>c.earned("viz:redund")],
    ["trouble","HD","Storage Help Desk","Pass the storage help desk simulation",c=>c.passed("stotrouble")],
    ["perfect","ST+","Perfect Tier","Score 100% on a storage quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
