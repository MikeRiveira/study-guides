/* ================= Module 1: Manage Azure Identities and Governance (AZ-104 Domain 1, 20–25%) ================= */
(function(){
const LESSONS=[
{id:"entra",num:"1.1",title:"Microsoft Entra ID: users, groups and licenses",html:`
<p><b>Microsoft Entra ID</b> (formerly Azure Active Directory) is Microsoft's cloud identity service. Each organization gets a <b>tenant</b>: a dedicated, isolated instance of Entra ID with a default domain like <code>contoso.onmicrosoft.com</code>. You can add and verify <b>custom domains</b> (such as <code>contoso.com</code>) by creating a TXT or MX record at your DNS host. Every Azure subscription trusts exactly one tenant for sign-in.</p>
<h3>Users</h3>
<ul><li><b>Cloud identities</b> are created directly in Entra ID (portal, CLI, PowerShell or Microsoft Graph).</li>
<li><b>Directory-synchronized identities</b> come from on-premises Active Directory Domain Services through <b>Microsoft Entra Connect</b> or <b>Cloud Sync</b>. You manage them on-premises.</li>
<li><b>Guest users</b> are people from outside your organization invited with B2B collaboration (lesson 1.2).</li></ul>
<p>Create many users at once with <b>Bulk create</b> (upload a CSV template in the portal) or a script. A deleted user stays in <b>Deleted users</b> for <b>30 days</b> and can be restored with all their group memberships and licenses.</p>
<h3>Groups</h3>
<ul><li><b>Security groups</b> grant access to resources and Azure roles. They can contain users, devices, service principals and other groups.</li>
<li><b>Microsoft 365 groups</b> add a shared mailbox, calendar, SharePoint site and Teams. They contain users only (no devices).</li></ul>
<p>Membership can be <b>Assigned</b> (you add members), <b>Dynamic user</b> or <b>Dynamic device</b> (a rule such as <code>(user.department -eq "Sales")</code> adds and removes members automatically). Dynamic groups need <b>Microsoft Entra ID P1</b> licenses, and you can't add members by hand to a dynamic group.</p>
<div class="viz" id="viz-dyn"></div>
<div class="viz" id="viz-grouptype"></div>
<h3>Licenses</h3>
<p>Licenses (Microsoft 365, Entra ID P1/P2 and others) can be assigned to users directly or through <b>group-based licensing</b>: assign the license to a group and every member gets it, now and in future. Group-based licensing needs Entra ID P1 or a plan that includes it.</p>
<p>A user needs a <b>usage location</b> (country) before a license can be assigned directly, because some services aren't available in every country. With group-based licensing, users without a usage location inherit the directory's location.</p>
<div class="viz" id="viz-license"></div>
<div class="tip"><b>Exam tip.</b> "Users should automatically get or lose access when their department changes" means a <b>dynamic group</b>. "Assign licenses to 500 users and keep new hires covered" means <b>group-based licensing</b>.</div>`},
{id:"external",num:"1.2",title:"External users and self-service password reset",html:`
<h3>B2B collaboration (guest users)</h3>
<p><b>Microsoft Entra B2B collaboration</b> lets you invite people from other organizations (or with personal Microsoft, Google or email one-time passcode accounts) to use your apps and Azure resources. They sign in with <b>their own credentials</b>; you never manage their password. In your directory they appear as users with <b>UserType = Guest</b>.</p>
<ul><li>Invite one guest from the portal (<b>Users → Invite external user</b>), or many with <b>Bulk invite</b> (CSV).</li>
<li><b>External collaboration settings</b> control who can invite guests (for example only admins and the <b>Guest Inviter</b> role) and which domains are allowed or blocked.</li>
<li>Guests have <b>limited directory permissions</b> by default; they can't browse the whole directory.</li>
<li>Assign guests to groups and Azure roles exactly like members.</li></ul>
<div class="viz" id="viz-b2b"></div>
<h3>Self-service password reset (SSPR)</h3>
<p>SSPR lets users reset a forgotten password or unlock their account without calling the help desk. In <b>Entra ID → Password reset</b> you configure:</p>
<ul><li><b>Enabled for</b>: None, <b>Selected</b> (one group, great for a pilot) or All.</li>
<li><b>Number of methods required</b>: 1 or 2.</li>
<li><b>Methods available</b>: Microsoft Authenticator notification or code, email, mobile phone (SMS or call), office phone, security questions.</li>
<li><b>Registration</b>: require users to register when they next sign in, and ask them to reconfirm every N days (default 180).</li>
<li><b>Notifications</b>: tell users when their password is reset; tell all admins when another admin resets theirs.</li>
<li><b>On-premises integration</b>: <b>password writeback</b> (through Entra Connect or Cloud Sync) sends resets back to Active Directory for hybrid users.</li></ul>
<p>Administrator accounts are <b>always</b> enabled for SSPR and use a stronger <b>two-gate</b> policy: two methods, and security questions aren't allowed. Resetting a forgotten password needs <b>Entra ID P1</b> (or a Microsoft 365 business plan that includes it); writeback for hybrid users needs P1 too.</p>
<div class="viz" id="viz-sspr"></div>`},
{id:"rbac",num:"1.3",title:"Azure role-based access control (RBAC)",html:`
<p><b>Azure RBAC</b> controls who can do what to Azure resources. Every <b>role assignment</b> joins three things:</p>
<div class="viz" id="viz-rbac4"></div>
<h3>Built-in roles you must know</h3>
<ul><li><b>Owner</b>: full access to everything, including <b>assigning roles</b> to others.</li>
<li><b>Contributor</b>: create and manage all resources, but <b>can't grant access</b> to anyone.</li>
<li><b>Reader</b>: view everything, change nothing.</li>
<li><b>User Access Administrator</b>: manage access (role assignments) only.</li>
<li><b>Role Based Access Control Administrator</b>: manage role assignments, optionally limited by conditions to specific roles or principals. Safer than User Access Administrator.</li>
<li>Hundreds of <b>service-specific roles</b>, such as Virtual Machine Contributor, Network Contributor, Storage Account Contributor and Backup Operator.</li></ul>
<p>Roles have <b>Actions</b> (management plane, for example <code>Microsoft.Compute/virtualMachines/start/action</code>) and <b>DataActions</b> (data plane, for example reading a blob). Owner and Contributor don't include data actions, so reading blobs with Entra ID sign-in needs a data role such as <b>Storage Blob Data Reader</b>.</p>
<div class="viz" id="viz-roles"></div>
<h3>Custom roles</h3>
<p>When no built-in role fits, create a <b>custom role</b>: a JSON definition with <code>Actions</code>, <code>NotActions</code>, <code>DataActions</code>, <code>NotDataActions</code> and <code>AssignableScopes</code> (where it can be assigned). Start by cloning a built-in role in the portal, or use <code>az role definition create</code> or <code>New-AzRoleDefinition</code>. A tenant can have up to 5,000 custom roles. <code>NotActions</code> isn't a deny: it just subtracts from <code>Actions</code>, and another role assignment can still grant the action.</p>
<h3>Entra roles are different</h3>
<p><b>Microsoft Entra roles</b> (Global Administrator, User Administrator, Billing Administrator…) manage the directory: users, groups, licenses and domains. <b>Azure roles</b> manage Azure resources. A Global Administrator has no Azure resource access by default, but can <b>elevate access</b> to become User Access Administrator at the root scope of every subscription.</p>
<div class="viz" id="viz-entraaz"></div>
<div class="viz" id="viz-rbaccli"></div>`},
{id:"scope",num:"1.4",title:"Interpreting access assignments",html:`
<p>You can assign a role at four <b>scopes</b>: a <b>management group</b>, a <b>subscription</b>, a <b>resource group</b> or a single <b>resource</b>. Assignments are <b>inherited</b> by everything below. Contributor on a subscription means Contributor on every resource group and resource in it.</p>
<div class="viz" id="viz-scope"></div>
<h3>How Azure decides</h3>
<ul><li>RBAC is <b>additive</b>: your effective permissions are the union of every role assigned to you and to every group you belong to, at every scope above the resource.</li>
<li>There's no "deny" role. The only way to block an action that a role allows is a <b>deny assignment</b>, which Azure creates for you (for example for managed applications or deployment stacks). You can't create one directly.</li>
<li>Assign roles to <b>groups</b>, not individuals, and at the <b>narrowest scope</b> that works (least privilege).</li>
<li>Role assignments on a resource don't follow it when you move it to another resource group or subscription.</li></ul>
<p>To find out what someone can do, open the resource's <b>Access control (IAM)</b> blade and use <b>Check access</b>, or run <code>az role assignment list --assignee &lt;user&gt; --all --include-inherited</code>. A subscription supports up to 4,000 role assignments.</p>
<div class="viz" id="viz-effective"></div>
<div class="tip"><b>Exam tip.</b> A user who is Reader on the subscription and Contributor on <code>rg-web</code> can change resources in <code>rg-web</code> and only view everything else. Permissions add up; they never cancel each other out.</div>`},
{id:"policy",num:"1.5",title:"Azure Policy",html:`
<p><b>Azure Policy</b> enforces rules about <b>what resources look like</b>, no matter who creates them. RBAC answers "who can act"; Policy answers "is this configuration allowed".</p>
<ul><li>A <b>policy definition</b> is a JSON rule (<code>if</code> a condition, <code>then</code> an effect). Hundreds are built in: <i>Allowed locations</i>, <i>Allowed virtual machine size SKUs</i>, <i>Not allowed resource types</i>, <i>Require a tag on resources</i>, <i>Inherit a tag from the resource group if missing</i>.</li>
<li>An <b>initiative</b> (policy set) groups related definitions, for example a regulatory compliance standard.</li>
<li>An <b>assignment</b> applies a definition or initiative to a scope (management group, subscription or resource group), with <b>parameters</b>, optional <b>exclusions</b> and an <b>enforcement mode</b>.</li>
<li>An <b>exemption</b> waives a specific resource from an assignment.</li></ul>
<div class="viz" id="viz-poleffect"></div>
<h3>Effects</h3>
<ul><li><b>Deny</b>: block the request. <b>Audit</b>: allow it, but flag the resource as non-compliant.</li>
<li><b>Modify</b>: add, change or remove properties such as tags at create or update time. <b>Append</b>: add fields.</li>
<li><b>DeployIfNotExists</b>: deploy a related resource (for example a diagnostic setting) when it's missing. <b>AuditIfNotExists</b>: flag it.</li>
<li><b>DenyAction</b>: block specific actions such as delete. <b>Disabled</b>: turn the rule off.</li></ul>
<p>Modify and DeployIfNotExists assignments need a <b>managed identity</b> with the right role so Azure can make changes. New and updated resources are handled automatically; <b>existing</b> non-compliant resources are fixed only when you run a <b>remediation task</b>.</p>
<p>Compliance for a new assignment shows up after a short delay (it can take up to about 30 minutes), then resources are re-evaluated every 24 hours or when they change. You can start a scan on demand.</p>
<div class="viz" id="viz-polflow"></div>
<div class="viz" id="viz-poltest"></div>
<div class="tip"><b>Exam tip.</b> <i>Allowed locations</i> doesn't apply to resource groups or global resources. To restrict where resource groups go, also assign <i>Allowed locations for resource groups</i>.</div>`},
{id:"locks",num:"1.6",title:"Resource locks, tags, resource groups and moving resources",html:`
<h3>Resource locks</h3>
<p>Locks protect resources from accidental change, and they apply to <b>everyone</b>, including Owners. Apply them to a subscription, resource group or resource; they're inherited.</p>
<ul><li><b>CanNotDelete</b> (Delete in the portal): read and modify, but not delete.</li>
<li><b>ReadOnly</b>: read only. It blocks every write and delete <b>and</b> operations that use POST, such as listing storage account keys or starting and restarting a VM.</li></ul>
<p>Only roles with <code>Microsoft.Authorization/locks/*</code> (Owner and User Access Administrator) can create or remove locks. Locks protect the <b>management plane</b>: a ReadOnly lock on a storage account doesn't stop someone with a data role from deleting blobs.</p>
<div class="viz" id="viz-lock"></div>
<h3>Tags</h3>
<p>Tags are name/value pairs for organizing, cost reporting and automation. Up to 50 per resource, resource group or subscription. Tag names are case-insensitive; values are case-sensitive. <b>Tags aren't inherited</b>: a tag on a resource group doesn't appear on its resources unless an Azure Policy (Modify effect) copies it. Cost reports only show tags from the time they're applied.</p>
<div class="viz" id="viz-tagq"></div>
<h3>Resource groups and moves</h3>
<p>Every resource lives in exactly one resource group. The group's location only stores metadata; its resources can be in any region. Resource groups can't be nested or renamed, and deleting one deletes everything in it.</p>
<p>You can <b>move</b> resources to another resource group or subscription in the same tenant. The resource keeps its <b>region</b> (only its resource ID changes), dependent resources must move together (a VM with its disks and NICs), and role assignments made directly on the resource don't move. To move to another <b>region</b>, use <b>Azure Resource Mover</b> or redeploy.</p>
<div class="viz" id="viz-move"></div>`},
{id:"cost",num:"1.7",title:"Subscriptions, management groups and costs",html:`
<h3>Subscriptions and management groups</h3>
<p>A <b>subscription</b> is a billing and access boundary. <b>Management groups</b> organize subscriptions so you can apply RBAC and Azure Policy to many at once.</p>
<ul><li>Every tenant has one <b>root management group</b> that can't be moved or deleted.</li>
<li>Up to <b>six levels</b> of depth below the root (not counting subscriptions), and up to 10,000 management groups.</li>
<li>Each management group and subscription has exactly <b>one parent</b>.</li>
<li>Moving a subscription to another management group changes the policies and roles it inherits.</li></ul>
<div class="viz" id="viz-mg"></div>
<h3>Managing costs</h3>
<ul><li><b>Cost analysis</b> shows actual and forecast cost, grouped by service, location, resource group or <b>tag</b>.</li>
<li><b>Budgets</b> set a monthly, quarterly or yearly amount with alert thresholds on <b>actual</b> or <b>forecasted</b> cost. Alerts email people or trigger an <b>action group</b> (which can run automation). A budget <b>doesn't stop</b> resources by itself.</li>
<li><b>Cost alerts</b> include budget alerts, credit alerts, department spending quota alerts and anomaly alerts.</li>
<li><b>Azure Advisor</b> cost recommendations find idle and oversized resources.</li>
<li>Save with <b>reservations</b> (1 or 3 years for a specific resource type), <b>savings plans for compute</b> (an hourly commitment across services), <b>Azure Hybrid Benefit</b> (reuse Windows Server and SQL Server licenses), <b>Spot VMs</b>, autoscale and deallocating idle VMs.</li></ul>
<div class="viz" id="viz-budget"></div>
<div class="viz" id="viz-costsort"></div>`}
];

const G={
 entra:[["Microsoft Entra ID tenant","A dedicated instance of Entra ID for one organization"],["Default tenant domain","yourname.onmicrosoft.com"],["How do you verify a custom domain?","Add a TXT or MX record at your DNS host, then verify in Entra ID"],["Directory-synchronized user","A user synced from on-premises AD DS by Entra Connect or Cloud Sync"],["How long can you restore a deleted user?","30 days"],["Bulk create users","Upload a CSV template in the portal (Users → Bulk operations)"],["Security group vs Microsoft 365 group","Security: access to resources; M365: shared mailbox, calendar, SharePoint and Teams"],["Can a Microsoft 365 group contain devices?","No, users only"],["Membership types","Assigned, Dynamic user, Dynamic device"],["License needed for dynamic groups","Microsoft Entra ID P1"],["Dynamic rule for the Sales department","(user.department -eq \"Sales\")"],["Can you add members manually to a dynamic group?","No; the rule controls membership"],["Group-based licensing","Assign a license to a group; members get it automatically"],["What must a user have before direct license assignment?","A usage location"],["Usage location with group-based licensing","Users without one inherit the directory's location"],["B2B guest UserType","Guest"],["Who manages a B2B guest's password?","Their home organization or identity provider"],["Role that lets non-admins invite guests when invites are restricted","Guest Inviter"],["Where do you restrict which domains can be invited?","External collaboration settings"],["SSPR 'Enabled for' options","None, Selected (one group) or All"],["SSPR number of methods","1 or 2"],["SSPR for administrators","Always on, two methods, no security questions"],["Password writeback","Sends cloud password resets back to on-premises AD"],["SSPR reconfirm default","Every 180 days"]],
 rbac:[["The three parts of a role assignment","Security principal, role definition, scope"],["Security principal types","User, group, service principal, managed identity"],["Owner","Full access, including assigning roles"],["Contributor","Manage everything except access (can't assign roles)"],["Reader","View everything, change nothing"],["User Access Administrator","Manage role assignments (access) only"],["Role Based Access Control Administrator","Manage role assignments, optionally limited by conditions"],["Actions vs DataActions","Management plane operations vs data plane operations"],["Can Owner read blobs with Entra sign-in by default?","No; it needs a data role like Storage Blob Data Reader"],["Custom role JSON properties","Actions, NotActions, DataActions, NotDataActions, AssignableScopes"],["Is NotActions a deny?","No; it subtracts from Actions. Another assignment can still grant it"],["Max custom roles per tenant","5,000"],["CLI to create a custom role","az role definition create --role-definition @role.json"],["PowerShell to create a custom role","New-AzRoleDefinition"],["Four RBAC scopes","Management group, subscription, resource group, resource"],["Are role assignments inherited?","Yes, down to every child scope"],["How do multiple role assignments combine?","Additively (union)"],["What blocks an action a role allows?","A deny assignment (created by Azure)"],["Entra roles vs Azure roles","Entra: directory objects; Azure: Azure resources"],["How does a Global Administrator get Azure access?","Elevate access (User Access Administrator at root scope)"],["Where to see someone's effective access to a resource","Access control (IAM) → Check access"],["Role assignments per subscription","Up to 4,000"],["Do resource-level role assignments move with a resource?","No"]],
 gov:[["Azure Policy vs RBAC","Policy: what resources may look like; RBAC: who can act"],["Policy initiative","A set of policy definitions assigned together"],["Policy assignment scopes","Management group, subscription, resource group"],["Exclusion vs exemption","Exclusion: scope left out of an assignment; exemption: waive one resource"],["Deny effect","Blocks a non-compliant request"],["Audit effect","Allows it, marks it non-compliant"],["Modify effect","Adds or changes properties such as tags"],["DeployIfNotExists","Deploys a missing related resource"],["What do Modify and DeployIfNotExists need?","A managed identity with permissions"],["How are existing non-compliant resources fixed?","A remediation task"],["Standard policy evaluation cycle","Every 24 hours (and when resources change)"],["Allowed locations covers resource groups?","No; use Allowed locations for resource groups"],["CanNotDelete lock","Read and modify, but no delete"],["ReadOnly lock","Read only; blocks writes, deletes and POST actions"],["Does a ReadOnly lock block listing storage keys?","Yes (it's a POST)"],["Who can manage locks?","Owner and User Access Administrator"],["Do locks protect data plane operations?","No"],["Tags per resource","Up to 50"],["Are tags inherited from resource groups?","No; use a Modify policy to inherit them"],["Tag names vs values","Names are case-insensitive; values are case-sensitive"],["Does moving a resource change its region?","No; only its resource group or subscription and ID"],["Move a resource to another region","Azure Resource Mover (or redeploy)"],["Can resource groups be nested or renamed?","No"]],
 cost:[["Subscription","A billing and access boundary"],["Root management group","Top of the hierarchy; can't be moved or deleted"],["Management group depth limit","Six levels below root (not counting subscriptions)"],["How many parents can a subscription have?","One"],["Max management groups","10,000 per tenant"],["Cost analysis","View actual and forecast costs grouped by service, tag, location…"],["Does a budget stop resources?","No; it alerts (and can trigger an action group)"],["Budget alert threshold types","Actual and forecasted"],["Reservation","1 or 3 year commitment for a resource type"],["Savings plan for compute","Hourly spend commitment that applies across compute services"],["Azure Hybrid Benefit","Reuse existing Windows Server and SQL Server licenses"],["Spot VMs","Deep discounts on spare capacity; can be evicted"],["Tool that recommends resizing idle VMs","Azure Advisor (cost)"],["Cost alerts types","Budget, credit, department spending quota, anomaly"]]
};
const DECKS=[["entra","Entra ID users and groups"],["rbac","Azure RBAC"],["gov","Policy, locks and tags"],["cost","Subscriptions and costs"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"Sales staff should automatically join a group when their department is set to Sales and leave when it changes. What should you create?",o:["A security group with Dynamic user membership","A security group with Assigned membership","A Microsoft 365 group with Assigned membership","An administrative unit"],a:0,e:"Dynamic user groups add and remove members based on a rule. They need Entra ID P1."},
 {q:"You must assign Microsoft 365 licenses directly to a user, but the assignment fails. What's most likely missing?",o:["The user's usage location","The user's manager","A dynamic group","An Azure subscription"],a:0,e:"Direct license assignment needs a usage location."},
 {q:"Which group type can contain devices?",o:["Security group","Microsoft 365 group","Both","Neither"],a:0,e:"Microsoft 365 groups contain users only."},
 {q:"A partner's consultant needs access to one resource group. They should sign in with their company account. What do you use?",o:["Invite them as a B2B guest and assign an Azure role","Create a cloud user with a new password","Sync them with Entra Connect","Give them the subscription access keys"],a:0,e:"B2B guests use their own credentials."},
 {q:"In your directory, how does an invited B2B user appear?",o:["UserType = Guest","UserType = Member","As a service principal","As a device"],a:0,e:"Guests have limited directory permissions by default."},
 {q:"You want only admins and specific people to invite guests. What do you configure?",o:["External collaboration settings, and the Guest Inviter role","A dynamic device group","A resource lock","Azure Policy"],a:0,e:"Guest invite restrictions live in external collaboration settings."},
 {q:"You're piloting SSPR with 50 users. What should 'Enabled for' be set to?",o:["Selected, with a group containing the 50 users","All","None","Only administrators"],a:0,e:"Selected applies SSPR to one group."},
 {q:"Which statement about SSPR for administrator accounts is true?",o:["Admins are always enabled and need two methods; security questions aren't allowed","Admins are excluded from SSPR","Admins can only use security questions","Admins follow exactly the same policy as users"],a:0,e:"Admins use the two-gate policy."},
 {q:"Hybrid users reset their password in the cloud but still can't sign in on-premises with the new one. What's missing?",o:["Password writeback","Dynamic groups","B2B collaboration","A ReadOnly lock"],a:0,e:"Writeback sends resets to on-premises AD."},
 {q:"A deleted user must be restored with their group memberships. How long do you have?",o:["30 days","7 days","90 days","1 year"],a:0,e:"Deleted users are kept for 30 days."},
 {q:"A role assignment is made of which three parts?",o:["Security principal, role definition, scope","User, password, subscription","Policy, initiative, assignment","Tenant, domain, license"],a:0,e:"Who, what and where."},
 {q:"Which built-in role can create resources but can't grant access to others?",o:["Contributor","Owner","User Access Administrator","Role Based Access Control Administrator"],a:0,e:"Contributor excludes Microsoft.Authorization write and delete."},
 {q:"A security team member must manage who has access to resources but not manage the resources. Which role is the best fit with least privilege?",o:["Role Based Access Control Administrator","Owner","Contributor","Reader"],a:0,e:"It manages role assignments only, and can be limited with conditions."},
 {q:"A subscription Owner signs in with Entra ID and gets 'not authorized' reading blobs in the portal (key access is disabled). Why?",o:["Owner has no DataActions; assign Storage Blob Data Reader","Owner is blocked by default from storage","The blob is in the archive tier","A Delete lock blocks reads"],a:0,e:"Data plane access needs a data role."},
 {q:"In a custom role, what does NotActions do?",o:["Subtracts actions from Actions in that role only","Denies the action even if another role grants it","Blocks data plane actions","Limits where the role can be assigned"],a:0,e:"It's not a deny; other roles can still grant the action."},
 {q:"Which property limits where a custom role can be assigned?",o:["AssignableScopes","NotActions","DataActions","IsCustom"],a:0,e:"AssignableScopes lists management groups, subscriptions or resource groups."},
 {q:"Which command creates a custom role from a JSON file?",o:["az role definition create --role-definition @role.json","az role assignment create --role @role.json","az ad role create","az policy definition create"],a:0,e:"New-AzRoleDefinition is the PowerShell equivalent."},
 {q:"A Global Administrator can't see any subscriptions in the portal. What can they do?",o:["Elevate access to become User Access Administrator at the root scope","Assign themselves Contributor in Entra ID","Create a dynamic group","Nothing; Global Administrators never have Azure access"],a:0,e:"Elevated access grants User Access Administrator at /."},
 {q:"Which role manages users, groups and passwords in Entra ID, but not Azure resources?",o:["User Administrator (an Entra role)","Contributor (an Azure role)","Owner","Virtual Machine Contributor"],a:0,e:"Entra roles manage the directory."},
 {q:"Dana is Reader on the subscription and Contributor on rg-web. What can Dana do on a VM in rg-web?",o:["Manage it (Contributor applies)","Only read it, because Reader wins","Nothing","Delete the subscription"],a:0,e:"RBAC is additive."},
 {q:"Dana is Contributor on a subscription. Where can Dana create a storage account?",o:["In any resource group in that subscription","Only in resource groups Dana created","Nowhere without Owner","Only in the management group"],a:0,e:"Assignments are inherited downward."},
 {q:"You must stop a Contributor from deleting VMs, without changing their role. What's the simplest management-plane control?",o:["A CanNotDelete lock","A NotActions entry in a different role","Azure Policy Audit effect","A budget"],a:0,e:"Locks apply to everyone. NotActions in another role wouldn't remove Contributor's rights."},
 {q:"Which scope is NOT valid for an Azure role assignment?",o:["A Microsoft Entra administrative unit","A management group","A resource group","A single resource"],a:0,e:"Administrative units scope Entra roles, not Azure roles."},
 {q:"What's the best practice for assigning Azure roles to 40 help desk staff?",o:["Assign the role to a group at the narrowest scope","Assign each user Owner on the subscription","Share one admin account","Assign at the root management group"],a:0,e:"Groups and least privilege."},
 {q:"After you move a VM to another resource group, a user who had a role assignment directly on the VM loses access. Why?",o:["Resource-level role assignments don't move with the resource","Moves delete the VM","Locks were applied","The VM changed regions"],a:0,e:"Re-create the assignment after the move."},
 {q:"Which tool enforces that resources may only be created in East US and West Europe?",o:["Azure Policy with Allowed locations","Azure RBAC","A resource lock","Tags"],a:0,e:"Policy controls resource properties."},
 {q:"You assigned Allowed locations (East US only), yet someone created a resource group in West US. Why?",o:["Allowed locations doesn't apply to resource groups","The policy needs a managed identity","Policy only audits","The user was an Owner"],a:0,e:"Use Allowed locations for resource groups too."},
 {q:"Which effect blocks a non-compliant deployment?",o:["Deny","Audit","Append","AuditIfNotExists"],a:0,e:"Audit only reports."},
 {q:"Every new resource must automatically get the costcenter tag from its resource group. Which effect does the built-in policy use?",o:["Modify","Deny","Audit","Disabled"],a:0,e:"'Inherit a tag from the resource group if missing' uses Modify."},
 {q:"An assignment with a Modify effect fixed new resources but not 300 existing ones. What do you do?",o:["Create a remediation task","Delete and re-create the assignment","Add a ReadOnly lock","Wait 24 hours"],a:0,e:"Remediation tasks fix existing resources."},
 {q:"Why does a DeployIfNotExists assignment need a managed identity?",o:["So Azure can deploy the missing resources on your behalf","To sign users in","To encrypt the policy","To bill the subscription"],a:0,e:"The identity needs a role that allows the deployment."},
 {q:"What's an initiative?",o:["A group of policy definitions assigned together","A single policy rule","A remediation task","A role definition"],a:0,e:"Also called a policy set."},
 {q:"One test resource group must be left out of a subscription-wide policy. What do you configure?",o:["An exclusion on the assignment","A Delete lock","A tag","A custom role"],a:0,e:"Exclusions remove child scopes from an assignment."},
 {q:"Which lock still allows changing a VM's size?",o:["CanNotDelete","ReadOnly","Both","Neither"],a:0,e:"CanNotDelete only blocks deletion."},
 {q:"A ReadOnly lock is on a resource group. A developer can't start a VM in it. Why?",o:["Starting a VM is a POST operation, which ReadOnly blocks","ReadOnly only blocks deletes","The VM needs a tag","RBAC denied it"],a:0,e:"ReadOnly blocks writes and POST actions."},
 {q:"With a ReadOnly lock on a storage account, an app that uses the account key from 'List keys' fails. Why?",o:["listKeys is a POST and is blocked","ReadOnly encrypts the keys","Keys expire with a lock","The app needs Owner"],a:0,e:"Use Entra ID authorization or remove the lock."},
 {q:"Who can delete a resource lock?",o:["Owner or User Access Administrator","Contributor","Reader","Anyone"],a:0,e:"Locks need Microsoft.Authorization/locks/* permissions."},
 {q:"You tag a resource group with env=prod. Do its resources show env=prod?",o:["No; tags aren't inherited","Yes, immediately","Yes, after 24 hours","Only VMs"],a:0,e:"Use a Modify policy to inherit tags."},
 {q:"Running 'az resource tag --tags dept=it' on a VM that already has env=prod. What tags remain?",o:["Only dept=it (tags are replaced unless you use --is-incremental)","env=prod and dept=it","Only env=prod","None"],a:0,e:"Use --is-incremental, or Update-AzTag -Operation Merge in PowerShell."},
 {q:"What happens to a VM's region when you move it to another resource group?",o:["It stays the same","It moves to the resource group's region","It moves to the paired region","It's chosen at random"],a:0,e:"Moves change the resource group, not the region."},
 {q:"You move a VM to another subscription. What else must move with it?",o:["Its dependent resources, such as disks and NICs","Only its tags","Its resource group","Nothing"],a:0,e:"Dependent resources move together."},
 {q:"Which service moves resources between Azure regions?",o:["Azure Resource Mover","az resource move","Azure Migrate only","Azure Policy"],a:0,e:"az resource move changes groups or subscriptions, not regions."},
 {q:"How many levels deep can a management group hierarchy be?",o:["Six levels below the root","Three","Ten","Unlimited"],a:0,e:"Not counting the root or subscriptions."},
 {q:"Where should you assign a policy that must cover every subscription in your company?",o:["The root management group (or a top-level management group)","Each resource group","Each resource","The billing account"],a:0,e:"Assignments are inherited by child subscriptions."},
 {q:"A budget reaches 100% of its amount. What happens to running resources?",o:["They keep running unless an action group runs automation to stop them","They stop automatically","They're deleted","The subscription is disabled"],a:0,e:"Budgets alert; they don't stop resources."},
 {q:"You want a warning before the month's spend actually exceeds the budget. Which threshold type?",o:["Forecasted","Actual","Credit","Quota"],a:0,e:"Forecasted alerts fire on predicted spend."},
 {q:"Finance wants monthly costs by department. What should you do first?",o:["Tag resources with a department tag (enforced with Policy) and group cost analysis by tag","Create a management group per VM","Add Delete locks","Use Azure Hybrid Benefit"],a:0,e:"Tags drive cost grouping."},
 {q:"Which option lowers the cost of always-on VMs you'll run for 3 years?",o:["Reservations","Spot VMs","Budgets","Resource locks"],a:0,e:"Reservations trade commitment for discount."},
 {q:"You already own Windows Server licenses with Software Assurance. How do you lower VM costs?",o:["Azure Hybrid Benefit","Dynamic groups","Premium SSD","Availability zones"],a:0,e:"Reuse eligible on-premises licenses."},
 {q:"Which tool gives personalized recommendations to resize or shut down underused VMs?",o:["Azure Advisor","Azure Policy","Microsoft Entra ID","Resource Mover"],a:0,e:"Advisor's cost category."}
];

/* ---------- interactive diagrams ---------- */
function vizDyn(){const el=$("#viz-dyn");
  const U=[["Ava Chen","Sales","Account Manager","US","Member"],["Ben Ortiz","Sales","Sales Director","CA","Member"],["Chloe Ward","IT","Helpdesk Technician","US","Member"],["Dev Patel","IT","Helpdesk Lead","GB","Member"],["Eli Moss","Finance","Accountant","US","Member"],["Fatima Noor","Sales","Sales Engineer","US","Member"],["Gus Lind","","Consultant","DE","Guest"],["Hana Sato","Marketing","Designer","JP","Guest"]];
  const P={department:1,jobTitle:2,country:3,userType:4};const T=[["Everyone in the Sales department",u=>u[1]==="Sales"],["All B2B guests",u=>u[4]==="Guest"],["Everyone whose job title starts with Helpdesk",u=>u[2].startsWith("Helpdesk")],["Everyone not in the US",u=>u[3]!=="US"]];
  let prop="department",op="-eq",val="Sales",t=0;const solved=new Set();
  const test=u=>{const v=u[P[prop]],x=val;return op==="-eq"?lc2(v)===lc2(x):op==="-ne"?lc2(v)!==lc2(x):op==="-startsWith"?lc2(v).startsWith(lc2(x)):lc2(v).includes(lc2(x))};
  function lc2(s){return String(s).toLowerCase()}
  function draw(){const m=U.map(test),want=U.map(T[t][1]),ok=m.every((x,i)=>x===want[i]);if(ok)solved.add(t);
    el.innerHTML=`<div class="viz-title">Dynamic membership rule builder</div>
    <div class="seg-row">${T.map((x,i)=>`<button class="chip" data-t="${i}" aria-pressed="${i===t}">${solved.has(i)?"✓ ":""}Goal ${i+1}</button>`).join("")}</div>
    <p class="scenario"><b>Goal:</b> ${T[t][0]}</p>
    <div class="dyn-row"><select class="txt-in" data-k="prop">${Object.keys(P).map(k=>`<option ${k===prop?"selected":""}>${k}</option>`).join("")}</select>
      <select class="txt-in" data-k="op">${["-eq","-ne","-startsWith","-contains"].map(o=>`<option ${o===op?"selected":""}>${o}</option>`).join("")}</select>
      <input class="txt-in" data-k="val" value="${esc(val)}" aria-label="Value"></div>
    <pre class="term" style="min-height:0">(user.${prop} ${op} "${esc(val)}")</pre>
    <div class="tbl-wrap"><table class="tbl"><tr><th>User</th><th>department</th><th>jobTitle</th><th>country</th><th>userType</th><th>In group?</th></tr>${U.map((u,i)=>`<tr><td>${u[0]}</td><td>${u[1]||"—"}</td><td>${u[2]}</td><td>${u[3]}</td><td>${u[4]}</td><td class="${m[i]===want[i]?(m[i]?"ok":"dim"):"no"}">${m[i]?"✓ Member":"—"}${m[i]!==want[i]?(want[i]?" (should be in)":" (shouldn't be)"):""}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${ok?`<span class="status-good">Rule matches the goal.</span> ${solved.size<T.length?"Pick the next goal.":"All four goals solved."}`:"Change the property, operator or value until the group contains exactly the right people."} ${solved.size}/${T.length} goals solved.</div>`;
    if(solved.size===T.length)award("viz:dyn",30,"Built every dynamic group rule")}
  el.addEventListener("change",e=>{const k=e.target.dataset.k;if(k==="prop")prop=e.target.value;if(k==="op")op=e.target.value;if(k)draw()});
  el.addEventListener("input",e=>{if(e.target.dataset.k==="val"){val=e.target.value;const pos=e.target.selectionStart;draw();const i=el.querySelector('[data-k="val"]');i.focus();i.setSelectionRange(pos,pos)}});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(b){t=+b.dataset.t;draw()}});draw()}
function vizRoles(){const el=$("#viz-roles");
  const R=["Owner","Contributor","Reader","User Access Administrator","RBAC Administrator","Virtual Machine Contributor","Storage Blob Data Reader"];
  const A=[["Read resource settings",[1,1,1,1,1,1,0]],["Create or delete VMs",[1,1,0,0,0,1,0]],["Create a storage account",[1,1,0,0,0,0,0]],["Restart a VM",[1,1,0,0,0,1,0]],["Assign roles to others",[1,0,0,1,1,0,0]],["Read blob data with Entra sign-in",[0,0,0,0,0,0,1]]];
  const why=["Owner can do every management action and assign roles. It has no DataActions, so reading blobs with Entra sign-in needs a data role.","Contributor can manage everything except access. It can't assign roles.","Reader views everything and changes nothing.","User Access Administrator manages access only. It can read, but not change resources.","Role Based Access Control Administrator manages role assignments only, and can be limited with conditions.","Virtual Machine Contributor manages VMs (and their NICs and disks) but not storage accounts or access.","Storage Blob Data Reader is a data plane role: it reads blob contents but can't manage the account itself."];
  const seen=new Set();let r=0;
  function draw(){seen.add(r);el.innerHTML=`<div class="viz-title">What can each role do?</div><div class="seg-row">${R.map((x,i)=>`<button class="chip" data-r="${i}" aria-pressed="${i===r}">${seen.has(i)?"✓ ":""}${x}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Action</th><th class="cur">${R[r]}</th></tr>${A.map(a=>`<tr><td>${a[0]}</td><td class="${a[1][r]?"ok":"no"}">${a[1][r]?"✓ Allowed":"✗ Not allowed"}</td></tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${why[r]}</div><div class="rv-prog s-small">${seen.size} of ${R.length} roles explored</div>`;
    if(seen.size===R.length)award("viz:roles",20,"Compared every built-in role")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-r]");if(b){r=+b.dataset.r;draw()}});draw()}
function vizScope(){const el=$("#viz-scope");
  const N=[["root","Tenant Root Group",0,"Management group",null],["corp","mg-corp",1,"Management group","root"],["prod","Contoso-Prod",2,"Subscription","corp"],["rgweb","rg-web",3,"Resource group","prod"],["vm","vm-web01",4,"Resource","rgweb"],["st","stweb4410",4,"Resource","rgweb"],["rgdata","rg-data",3,"Resource group","prod"],["sql","sql-orders",4,"Resource","rgdata"],["dev","Contoso-Dev",2,"Subscription","corp"],["rgtest","rg-test",3,"Resource group","dev"],["vmt","vm-test01",4,"Resource","rgtest"]];
  const par=k=>N.find(n=>n[0]===k)[4];const under=(k,a)=>{while(k){if(k===a)return true;k=par(k)}return false};
  let at=null;const levels=new Set();
  function draw(){const n=at&&N.find(x=>x[0]===at);const hit=N.filter(x=>at&&under(x[0],at));
    el.innerHTML=`<div class="viz-title">Scope explorer: assign Dana the Contributor role</div><p class="s-small">Tap a scope to make the assignment there. Everything highlighted inherits it.</p>
    <div class="tree">${N.map(x=>`<button class="tnode${x[0]===at?" src":hit.some(h=>h[0]===x[0])?" hit":""}" style="--d:${x[2]}" data-n="${x[0]}"><span class="tag">${x[3]}</span>${x[1]}${x[0]===at?"<em>Assigned here</em>":hit.some(h=>h[0]===x[0])?"<em>Inherited</em>":""}</button>`).join("")}</div>
    <div class="caption" aria-live="polite">${n?`Contributor at <b>${n[1]}</b> (${n[3].toLowerCase()}) gives Dana access to <b>${hit.length}</b> of ${N.length} items. ${n[3]==="Resource"?"That's the narrowest scope: just one resource.":n[3]==="Management group"?"Every subscription below inherits it, including ones added later.":n[3]==="Subscription"?"Every resource group in this subscription, including future ones.":"Every resource in this group, and nothing outside it."}`:"Assignments flow down, never up or sideways."} <span class="s-small">Scope types tried: ${levels.size}/4</span></div>`;
    if(levels.size===4)award("viz:scope",30,"Assigned a role at every scope level")}
  el.addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(b){at=b.dataset.n;levels.add(N.find(x=>x[0]===at)[3]);draw()}});draw()}
function vizPolTest(){const el=$("#viz-poltest");
  const P=[["loc","Allowed locations: East US, West Europe","Deny"],["tag","Require a tag on resources: costcenter","Deny"],["inh","Inherit a tag from the resource group: env","Modify"],["net","Storage accounts should restrict network access","Audit"]];
  const on={loc:true,tag:false,inh:false,net:false};const R=[["VM in East US, costcenter=1001","vm","eastus",{costcenter:"1001"}],["Storage account in West US, costcenter=1001","sa","westus",{costcenter:"1001"}],["Storage account in East US, no tags, open network","sa","eastus",{}],["SQL database in West Europe, costcenter=2002","sql","westeurope",{costcenter:"2002"}]];
  const res={};const outs=new Set();
  function run(i){const [name,t,loc,tags0]=R[i];const tags=Object.assign({},tags0);const by=[];if(on.loc&&!["eastus","westeurope"].includes(loc))by.push("Allowed locations");if(on.inh&&!tags.env)tags.env="prod";if(on.tag&&!tags.costcenter)by.push("Require a tag");
    if(by.length)return {st:"blocked",msg:`Blocked by ${by.join(" and ")} (Deny).`};const nc=on.net&&t==="sa";const mod=on.inh?" The Modify effect added env=prod from the resource group.":"";return {st:nc?"nc":"ok",mod:!!mod,msg:(nc?"Created, but flagged non-compliant by the Audit policy.":"Created and compliant.")+mod}}
  function draw(){el.innerHTML=`<div class="viz-title">Policy lab: assignments on the Contoso-Prod subscription</div><p class="s-small">The resource group rg-prod is tagged env=prod. Turn assignments on or off, then deploy.</p>
    <div class="sc-list">${P.map(p=>`<label class="${on[p[0]]?"done":""}"><input type="checkbox" data-p="${p[0]}" ${on[p[0]]?"checked":""}><span>${p[1]}</span><span class="tag">${p[2]}</span></label>`).join("")}</div>
    <div class="sc-list" style="margin-top:8px">${R.map((r,i)=>`<label style="grid-template-columns:1fr auto auto"><span>${r[0]}</span><span class="${res[i]?res[i].st==="ok"?"status-good":"status-bad":"s-small"}">${res[i]?res[i].st==="ok"?"Compliant":res[i].st==="nc"?"Non-compliant":"Blocked":"—"}</span><button class="btn" data-d="${i}">Deploy</button></label>`).join("")}</div>
    <div class="caption" aria-live="polite">${el._m||"Deploy each resource with different assignments turned on."} <span class="s-small">Seen: ${["blocked","nc","mod"].filter(x=>outs.has(x)).length}/3 (blocked, audited, modified)</span></div>`;
    if(outs.has("blocked")&&outs.has("nc")&&outs.has("mod"))award("viz:poltest",30,"Saw Deny, Audit and Modify in action")}
  el.addEventListener("change",e=>{const p=e.target.dataset.p;if(p){on[p]=e.target.checked;Object.keys(res).forEach(k=>delete res[k]);el._m="Assignments changed. Deploy again.";draw()}});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b)return;const i=+b.dataset.d;const r=run(i);res[i]=r;outs.add(r.st);if(r.mod)outs.add("mod");el._m=`<b>${R[i][0]}:</b> ${r.msg}`;draw()});draw()}
function vizLock(){const el=$("#viz-lock");const tried=new Set();let lock="none",last=null;
  const A=[["read","View the VM's settings",0],["tag","Add a tag to the VM",1],["resize","Resize the VM",1],["start","Start the VM (POST)",2],["keys","List the storage account keys (POST)",2],["del","Delete the VM",3]];
  const LK={none:"No lock",del:"CanNotDelete",ro:"ReadOnly"};const ok=(k,a)=>k==="none"||a[2]===0||(k==="del"&&a[2]!==3);
  function draw(){el.innerHTML=`<div class="viz-title">Resource lock tester · you're the subscription Owner</div>
    <div class="sel-row"><span>Lock on rg-prod</span><div class="seg-row">${Object.keys(LK).map(k=>`<button class="chip" data-l="${k}" aria-pressed="${k===lock}">${LK[k]}</button>`).join("")}</div></div>
    <div class="viz-controls">${A.map(a=>`<button class="btn" data-a="${a[0]}">${a[1]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Action</th>${Object.keys(LK).map(k=>`<th class="${k===lock?"cur":""}">${LK[k]}</th>`).join("")}</tr>${A.map(a=>`<tr><td>${a[1]}</td>${Object.keys(LK).map(k=>`<td class="${tried.has(k+a[0])?(ok(k,a)?"ok":"no"):"dim"}">${tried.has(k+a[0])?(ok(k,a)?"✓ Allowed":"✗ Blocked"):"?"}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${last?(ok(lock,last)?`<span class="status-good">Allowed.</span> ${last[1]} worked.`:`<span class="status-bad">ScopeLocked.</span> The ${LK[lock]} lock blocks this, even for an Owner.${last[2]===2?" ReadOnly blocks POST operations too, not just writes.":""}`):"Pick a lock, then try each action."}</div><div class="rv-prog s-small">${tried.size} of 18 combinations tried</div>`;
    if(tried.size>=15)award("viz:lock",30,"Tested every lock against every action")}
  el.addEventListener("click",e=>{const l=e.target.closest("[data-l]"),a=e.target.closest("[data-a]");if(l){lock=l.dataset.l;last=null}if(a){last=A.find(x=>x[0]===a.dataset.a);tried.add(lock+last[0])}if(l||a)draw()});draw()}
function vizBudget(){const el=$("#viz-budget");let spend=300,day=15;const fired=new Set();const B=1000;
  const TH=[[50,"Actual","Email the team lead"],[80,"Actual","Email finance and the team lead"],[100,"Forecasted","Trigger the action group (runbook shuts down dev VMs)"]];
  function draw(){const fc=Math.round(spend/day*30);const st=TH.map(t=>(t[1]==="Actual"?spend:fc)>=B*t[0]/100);st.forEach((x,i)=>{if(x)fired.add(i)});
    el.innerHTML=`<div class="viz-title">Budget: $1,000 per month for rg-dev</div>
    <div class="rng-row"><span>Spend so far</span><input type="range" min="0" max="1400" step="10" value="${spend}" data-k="s"><b>$${spend}</b></div>
    <div class="rng-row"><span>Day of month</span><input type="range" min="1" max="30" value="${day}" data-k="d"><b>${day}</b></div>
    <div class="kv"><span>Forecast for the month</span><b class="mono">$${fc}</b><span>Budget used (actual)</span><b class="mono">${Math.round(spend/B*100)}%</b></div>
    <div class="meter"><i style="width:${Math.min(100,spend/B*100)}%"></i></div>
    <div class="grade">${TH.map((t,i)=>`<div class="${st[i]?"g-no":"g-ok"}"><b>${st[i]?"Alert fired":"Waiting"}</b><span>${t[0]}% ${t[1].toLowerCase()} → ${t[2]}</span></div>`).join("")}</div>
    <div class="caption" aria-live="polite">${st[2]?"The forecast alert fired before the money was actually spent. Note that only the action group's automation stops anything; the budget itself never shuts resources down.":"Move the sliders. A forecasted threshold can fire early in the month if spending is running hot."} <span class="s-small">${fired.size}/3 alerts seen</span></div>`;
    if(fired.size===3)award("viz:budget",20,"Triggered every budget alert")}
  el.addEventListener("input",e=>{const k=e.target.dataset.k;if(!k)return;if(k==="s")spend=+e.target.value;if(k==="d")day=+e.target.value;draw();const i=el.querySelector(`[data-k="${k}"]`);i.focus()});draw()}

registerModule({
  id:"idg",slug:"identity",title:"Manage Azure Identities and Governance",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["dyn","grouptype","license","b2b","sspr","rbac4","roles","entraaz","rbaccli","scope","effective","poleffect","polflow","poltest","lock","tagq","move","mg","budget","costsort"],
  viz(){
vizDyn();
sortViz($("#viz-grouptype"),{title:"Which group setup fits?",bins:{as:"Security group, Assigned",du:"Security group, Dynamic user",dd:"Security group, Dynamic device",m365:"Microsoft 365 group"},
  items:[["Give five named admins Contributor on a resource group","as","Small, fixed membership."],["Everyone whose department is Finance, automatically","du","A user attribute rule."],["All Windows laptops, for Intune policies","dd","A device rule (security groups only)."],["A project team needs a shared mailbox, calendar and Teams","m365","Collaboration features."],["New hires in the US get access on their first day","du","Rule on user.country."],["A hand-picked list of contractors for one app","as","Add members yourself."]],done:"Matched every group type"});
stepViz($("#viz-license"),{title:"Group-based licensing, step by step",done:"Walked through group-based licensing",steps:[
  ["Create or pick a group","For example a dynamic group for everyone in Sales, or an assigned group of named users."],
  ["Assign the license to the group","Entra ID → Groups → your group → Licenses → Assignments. Choose the product and, optionally, turn off individual service plans."],
  ["Members inherit it","Every current member gets the license. New members get it automatically; people who leave the group lose it."],
  ["Usage location","Users without a usage location inherit the directory's country. With direct assignment, a missing usage location makes the assignment fail."],
  ["Watch for errors","If you run out of licenses or two products conflict, the affected users show a licensing error on the group's Licenses page. Buy more or fix the conflict, then reprocess."]],end:"Needs Entra ID P1 (or a plan that includes it) for the people who receive licenses this way."});
stepViz($("#viz-b2b"),{title:"Inviting a B2B guest",done:"Walked through a B2B invitation",steps:[
  ["Invite","An admin (or anyone allowed by external collaboration settings) invites raj@fabrikam.com from Users → Invite external user, or with Bulk invite."],
  ["Guest object created","A user with UserType = Guest appears in your directory right away, with a pending invitation."],
  ["Redeem","Raj opens the email link (or a direct app link) and consents. He signs in with his own Fabrikam account."],
  ["Assign access","Add Raj to groups, assign Azure roles at the scope he needs, or assign him to apps."],
  ["Sign in","Raj uses his home credentials and MFA. Your Conditional Access policies can still apply to him."],
  ["Review","Use access reviews or remove the guest when the project ends."]]});
quizViz($("#viz-sspr"),{title:"SSPR scenarios",done:"Solved every SSPR scenario",qs:[
  ["SSPR is enabled for Selected: the SSPR-Pilot group. Lena isn't in the group and forgets her password. Can she reset it herself?",["No; only members of the selected group can","Yes; everyone can","Only on weekends"],0,"Selected applies to one group."],
  ["Methods required is 2. Omar registered only an email address. What happens when he tries to reset?",["He can't complete the reset until he registers a second method","He resets with email only","His account is deleted"],0,"He must register enough methods."],
  ["A Global Administrator wants to use security questions to reset their password. Allowed?",["No; admins use two methods and can't use security questions","Yes","Only with Entra ID P2"],0,"Admins get the stricter two-gate policy."],
  ["A hybrid user resets their password in the cloud, but their on-premises sign-in still uses the old one. What's missing?",["Password writeback","A dynamic group","Guest access"],0,"Writeback sends the new password to AD DS."],
  ["You want users to confirm their registered methods periodically. Which setting?",["Number of days before users are asked to reconfirm","Notify admins","Methods required"],0,"The default is 180 days."]]});
revealViz($("#viz-rbac4"),{title:"Anatomy of a role assignment",cols:3,done:"Explored a role assignment",items:[["Security principal","WHO","The user, group, service principal or managed identity that gets access. Assign to groups whenever you can."],["Role definition","WHAT","A collection of allowed actions, such as Virtual Machine Contributor. Built-in or custom (JSON)."],["Scope","WHERE","Management group, subscription, resource group or resource. The assignment applies here and below."]]});
vizRoles();
sortViz($("#viz-entraaz"),{title:"Microsoft Entra role or Azure role?",bins:{entra:"Microsoft Entra role",azure:"Azure role"},
  items:[["Reset a user's password","entra","User Administrator or Helpdesk Administrator."],["Create a virtual machine","azure","Contributor or Virtual Machine Contributor."],["Add a custom domain to the tenant","entra","Domain Name Administrator or Global Administrator."],["Assign someone Reader on a subscription","azure","Owner, User Access Administrator or RBAC Administrator."],["Create users and groups","entra","User Administrator."],["Read blobs in a storage account","azure","Storage Blob Data Reader."],["Manage license assignments","entra","License Administrator."]],done:"Sorted Entra and Azure roles",end:"Entra roles manage the directory; Azure roles manage resources. A Global Administrator must elevate access to manage Azure resources."});
azViz($("#viz-rbaccli"),{title:"Cloud Shell drill: check and grant access",scenario:"Dana from the web team needs to manage VMs in rg-web, and nothing else.",
  setup:(w,AZ)=>{w.rgs["rg-web"]={name:"rg-web",loc:"eastus",tags:{}};w.users.push({displayName:"Dana Lee",userPrincipalName:"dana@contoso.onmicrosoft.com",id:AZ.guid(),accountEnabled:true,userType:"Member"})},
  tasks:[{t:"Give <b>dana@contoso.onmicrosoft.com</b> the <b>Virtual Machine Contributor</b> role on <b>rg-web</b>.",hint:'az role assignment create --assignee dana@contoso.onmicrosoft.com --role "Virtual Machine Contributor" --resource-group rg-web',check:w=>w.roles.some(r=>r.principal==="dana@contoso.onmicrosoft.com"&&r.role==="Virtual Machine Contributor"&&/resourceGroups\/rg-web$/i.test(r.scope))},
    {t:"List Dana's role assignments as a table to confirm.",hint:"az role assignment list --assignee dana@contoso.onmicrosoft.com --all -o table",sticky:true,check:(w)=>w._listed}],
  onCmd:(l,w)=>{if(/role assignment list/.test(l)&&/dana/i.test(l))w._listed=true},
  solution:'az role assignment create --assignee dana@contoso.onmicrosoft.com --role "Virtual Machine Contributor" --resource-group rg-web\naz role assignment list --assignee dana@contoso.onmicrosoft.com --all -o table'},"rbaccli",40,"Granted access from Cloud Shell");
vizScope();
quizViz($("#viz-effective"),{title:"What can they actually do?",done:"Worked out effective access every time",qs:[
  ["Priya is Reader on the subscription. Her group, Web-Admins, is Contributor on rg-web. Can she restart a VM in rg-web?",["Yes; group roles add to hers","No; Reader wins","Only if she's Owner"],0,"Effective access is the union of user and group assignments."],
  ["Sam is Contributor on rg-data. Can he give a colleague Reader on rg-data?",["No; Contributor can't assign roles","Yes","Only with a lock"],0,"Assigning roles needs Owner, User Access Administrator or RBAC Administrator."],
  ["Lee has Owner on vm-web01 only. Can he delete rg-web?",["No; his scope is one resource","Yes; Owner can do anything","Yes, if the VM is stopped"],0,"Scope limits where a role applies."],
  ["Ana is Contributor on the subscription and there's a CanNotDelete lock on rg-prod. Can she delete a disk in rg-prod?",["No; the lock blocks everyone","Yes; Contributor can delete","Only with Policy"],0,"Locks override role permissions."],
  ["A custom role has Actions */read and NotActions Microsoft.Compute/*/read. Kim also has Reader on the same scope. Can Kim read VMs?",["Yes; Reader grants it, and NotActions isn't a deny","No; NotActions denies it","Only in the portal"],0,"NotActions only shapes its own role."]]});
sortViz($("#viz-poleffect"),{title:"Which policy effect?",bins:{deny:"Deny",audit:"Audit",modify:"Modify",dine:"DeployIfNotExists"},
  items:[["Block VMs larger than D4s_v5","deny","Prevent the request."],["Report storage accounts that allow public network access, without blocking","audit","Flag only."],["Add the costcenter tag from the resource group when missing","modify","Change properties."],["Turn on diagnostic settings for every new Key Vault","dine","Deploy a related resource."],["Stop resources from being created in West US","deny","Allowed locations uses Deny."],["Add an env tag to every resource","modify","Tags are changed with Modify."]],done:"Matched every effect"});
stepViz($("#viz-polflow"),{title:"From definition to compliance",done:"Followed a policy from start to finish",steps:[
  ["Definition","Pick a built-in definition such as Allowed locations, or write your own JSON rule."],
  ["Initiative (optional)","Group related definitions, for example everything needed for a security baseline."],
  ["Assignment","Assign to a management group, subscription or resource group. Set parameters (the allowed regions), exclusions and, for Modify or DeployIfNotExists, a managed identity."],
  ["Evaluation","New and updated resources are checked at request time. Existing resources are scanned shortly after assignment and then every 24 hours."],
  ["Compliance","The Compliance page shows each resource as compliant or non-compliant, with the reason."],
  ["Remediation","Create a remediation task to fix existing non-compliant resources for Modify and DeployIfNotExists policies."]]});
vizPolTest();vizLock();
quizViz($("#viz-tagq"),{title:"Tag puzzles",done:"Solved every tag puzzle",qs:[
  ["rg-web is tagged env=prod. You create vm-web02 in it with no tags. What tags does the VM have?",["None","env=prod","env=prod and rg=web"],0,"Tags aren't inherited."],
  ["How do you make every new resource get the costcenter tag from its resource group?",["Assign 'Inherit a tag from the resource group if missing' (Modify)","Add a Delete lock","Use a dynamic group"],0,"Modify adds tags automatically."],
  ["A VM has tags env=prod and owner=dana. You run Update-AzTag with -Operation Replace and @{dept='it'}. What's left?",["Only dept=it","All three tags","env=prod and owner=dana"],0,"Replace swaps the whole set; Merge adds to it."],
  ["Are the tags Env and env different tags?",["No; tag names are case-insensitive","Yes","Only in PowerShell"],0,"Values, however, are case-sensitive."],
  ["You tag resources today. Will last month's cost report group by the tag?",["No; tags apply to usage from when they're added","Yes, retroactively","Only for VMs"],0,"Tag early."]]});
quizViz($("#viz-move"),{title:"Moving resources",done:"Answered every move question",qs:[
  ["You move vm-app01 from rg-a (East US) to rg-b (West Europe). Where does the VM run now?",["Still East US","West Europe","The paired region"],0,"Moves don't change regions."],
  ["What else must you include when moving a VM?",["Its disks and network interfaces","Its resource group","Nothing"],0,"Dependent resources move together."],
  ["Which tool moves a VM to another region?",["Azure Resource Mover","az resource move","A management group"],0,"az resource move is for groups and subscriptions."],
  ["After a move, what changes about the resource?",["Its resource ID","Its IP addresses and data","Its region"],0,"Scripts that use the old ID must be updated."],
  ["Can you move resources to a subscription in a different Entra tenant with az resource move?",["No; both subscriptions must be in the same tenant","Yes","Only storage accounts"],0,"Transfer the subscription itself to change tenants."]]});
revealViz($("#viz-mg"),{title:"Building a management group hierarchy",cols:2,done:"Explored the hierarchy",items:[["Tenant Root Group","LEVEL 0","Created automatically. Can't be moved or deleted. Policies here apply to everything."],["mg-contoso","LEVEL 1","Company-wide policy: allowed regions, required tags, security baseline."],["mg-platform / mg-landingzones","LEVEL 2","Split shared platform services from application workloads."],["mg-prod / mg-nonprod","LEVEL 3","Stricter rules for production, looser for development."],["Subscriptions","BELOW","Each subscription has one parent and inherits every policy and role above it."],["Limits","RULES","Six levels below the root, up to 10,000 management groups, one parent per group or subscription."]]});
vizBudget();
sortViz($("#viz-costsort"),{title:"Which cost tool?",bins:{ca:"Cost analysis",bud:"Budgets",adv:"Azure Advisor",res:"Reservations or savings plans",ahb:"Azure Hybrid Benefit"},
  items:[["Show last month's spend grouped by the dept tag","ca","Group by tag."],["Email finance at 80% of the monthly amount","bud","Budget alert."],["Find VMs that are idle most of the time","adv","Cost recommendations."],["Commit for 3 years to always-on SQL VMs for a big discount","res","Long-term commitment."],["Reuse our Windows Server licenses with Software Assurance","ahb","License mobility."],["Forecast this month's total cost","ca","Forecast view."]],done:"Matched every cost tool"});
  },
  sims:[
    {id:"onboard",type:"cli",title:"Onboard the help desk team",shell:"bash",
      scenario:"Riley Park joins the help desk. Create the account, put Riley in a Helpdesk security group, and give the group just enough access to manage the VMs in <b>rg-ops</b>.",
      setup:(w,AZ)=>{w.rgs["rg-ops"]={name:"rg-ops",loc:"eastus",tags:{}};AZ.newVm(w,"rg-ops","vm-ops01",{image:"Ubuntu2204",size:"Standard_B2s"})},
      tasks:[
        {t:"Create the user <b>Riley Park</b> with the sign-in name <b>riley@contoso.onmicrosoft.com</b> and a strong password.",hint:'az ad user create --display-name "Riley Park" --user-principal-name riley@contoso.onmicrosoft.com --password "Helpd3sk!2026"',check:w=>w.users.some(u=>u.userPrincipalName==="riley@contoso.onmicrosoft.com")},
        {t:"Create a security group called <b>Helpdesk</b>.",hint:"az ad group create --display-name Helpdesk --mail-nickname helpdesk",check:w=>w.groups.some(g=>g.displayName.toLowerCase()==="helpdesk")},
        {t:"Add Riley to the Helpdesk group.",hint:"az ad group member add --group Helpdesk --member-id riley@contoso.onmicrosoft.com",check:w=>{const g=w.groups.find(g=>g.displayName.toLowerCase()==="helpdesk");const u=w.users.find(u=>u.userPrincipalName==="riley@contoso.onmicrosoft.com");return g&&u&&g.members.includes(u.id)}},
        {t:"Assign the <b>group</b> (not Riley) the <b>Virtual Machine Contributor</b> role, scoped to <b>rg-ops</b> only.",hint:'az role assignment create --assignee Helpdesk --role "Virtual Machine Contributor" --resource-group rg-ops',check:w=>w.roles.some(r=>r.principal.toLowerCase()==="helpdesk"&&r.role==="Virtual Machine Contributor"&&/resourceGroups\/rg-ops$/i.test(r.scope))},
        {t:"Make sure nobody on the help desk got access at the subscription scope.",hint:"az role assignment list --all -o table",check:w=>!w.roles.some(r=>/^\/subscriptions\/[^/]+$/i.test(r.scope)&&r.principal!==w.me)}],
      success:"Riley inherits VM management on rg-ops through the group. When the next person joins, you only add them to Helpdesk.",
      solution:'az ad user create --display-name "Riley Park" --user-principal-name riley@contoso.onmicrosoft.com --password "Helpd3sk!2026"\naz ad group create --display-name Helpdesk --mail-nickname helpdesk\naz ad group member add --group Helpdesk --member-id riley@contoso.onmicrosoft.com\naz role assignment create --assignee Helpdesk --role "Virtual Machine Contributor" --resource-group rg-ops\naz role assignment list --all -o table'},
    {id:"governlab",type:"cli",title:"Put guardrails on production",shell:"both",
      scenario:"Contoso's new production subscription has no rules yet. Build the resource group, restrict regions, protect it from deletion and prove the policy works. Use Bash or PowerShell (the same subscription is behind both tabs).",
      tasks:[
        {t:"Create the resource group <b>rg-prod</b> in <b>eastus</b> with the tags <b>env=prod</b> and <b>costcenter=1001</b>.",hint:"az group create --name rg-prod --location eastus --tags env=prod costcenter=1001",psHint:'New-AzResourceGroup -Name rg-prod -Location eastus -Tag @{env="prod";costcenter="1001"}',check:w=>{const g=w.rgs["rg-prod"];return g&&g.loc==="eastus"&&g.tags.env==="prod"&&g.tags.costcenter==="1001"}},
        {t:"Assign the built-in <b>Allowed locations</b> policy at the <b>subscription</b> scope, allowing only <b>eastus</b> and <b>eastus2</b>. (Run <code>az policy definition list -o table</code> to find it.)",hint:'az policy assignment create --name allowed-locations --policy e56962a6-4747-49cd-b67b-bf8b01975c4c --params \'{"listOfAllowedLocations":{"value":["eastus","eastus2"]}}\'',check:w=>w.pols.some(p=>p.def==="e56962a6-4747-49cd-b67b-bf8b01975c4c"&&/^\/subscriptions\/[^/]+$/i.test(p.scope)&&JSON.stringify((p.params.listOfAllowedLocations||[]).map(x=>x.toLowerCase()).sort())==='["eastus","eastus2"]')},
        {t:"Prove the policy works: try to create a storage account in <b>westus</b> in rg-prod. It should be <b>denied</b>.",hint:"az storage account create -n stprodwest4410 -g rg-prod -l westus",psHint:"New-AzStorageAccount -ResourceGroupName rg-prod -Name stprodwest4410 -Location westus -SkuName Standard_LRS",sticky:true,check:w=>!!w.flags.denied},
        {t:"Create a zone-redundant (<b>Standard_ZRS</b>) StorageV2 account in rg-prod in eastus.",hint:"az storage account create -n stprod4410 -g rg-prod -l eastus --sku Standard_ZRS --kind StorageV2",psHint:"New-AzStorageAccount -ResourceGroupName rg-prod -Name stprod4410 -Location eastus -SkuName Standard_ZRS -Kind StorageV2",check:w=>w.res.some(r=>r.t==="sa"&&r.rg==="rg-prod"&&r.p.sku==="Standard_ZRS")},
        {t:"Add a <b>CanNotDelete</b> lock named <b>nodelete</b> to rg-prod.",hint:"az lock create --name nodelete --lock-type CanNotDelete --resource-group rg-prod",psHint:"New-AzResourceLock -LockName nodelete -LockLevel CanNotDelete -ResourceGroupName rg-prod -Force",check:w=>w.locks.some(l=>l.name==="nodelete"&&l.level==="CanNotDelete"&&/resourceGroups\/rg-prod$/i.test(l.scope))}],
      success:"Production now rejects deployments outside East US and East US 2, and nobody can delete rg-prod by accident. Try deleting it to see the lock in action.",
      solution:'az group create --name rg-prod --location eastus --tags env=prod costcenter=1001\naz policy assignment create --name allowed-locations --policy e56962a6-4747-49cd-b67b-bf8b01975c4c --params \'{"listOfAllowedLocations":{"value":["eastus","eastus2"]}}\'\naz storage account create -n stprodwest4410 -g rg-prod -l westus\naz storage account create -n stprod4410 -g rg-prod -l eastus --sku Standard_ZRS --kind StorageV2\naz lock create --name nodelete --lock-type CanNotDelete --resource-group rg-prod',
      psSolution:'New-AzResourceGroup -Name rg-prod -Location eastus -Tag @{env="prod";costcenter="1001"}\n# Policy assignment: switch to the Bash tab for az policy assignment create\nNew-AzStorageAccount -ResourceGroupName rg-prod -Name stprod4410 -Location eastus -SkuName Standard_ZRS -Kind StorageV2\nNew-AzResourceLock -LockName nodelete -LockLevel CanNotDelete -ResourceGroupName rg-prod -Force'},
    {id:"customrole",type:"cli",title:"Create a custom VM operator role",shell:"bash",
      scenario:"The night shift must start, stop and restart VMs, but never create, resize or delete them. No built-in role fits. A JSON definition is waiting in your home directory: read it, create the role, then assign it.",
      filesData:{"vm-operator.json":JSON.stringify({Name:"Virtual Machine Operator",IsCustom:true,Description:"Start, stop, restart and deallocate VMs.",Actions:["Microsoft.Compute/virtualMachines/read","Microsoft.Compute/virtualMachines/start/action","Microsoft.Compute/virtualMachines/restart/action","Microsoft.Compute/virtualMachines/deallocate/action","Microsoft.Compute/virtualMachines/powerOff/action","Microsoft.Resources/subscriptions/resourceGroups/read"],NotActions:[],DataActions:[],NotDataActions:[],AssignableScopes:["/subscriptions/3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c"]},null,2)},
      setup:(w,AZ)=>{w.rgs["rg-prod"]={name:"rg-prod",loc:"eastus",tags:{}};w.groups.push({displayName:"NightShift",mailNickname:"nightshift",id:AZ.guid(),members:[],securityEnabled:true})},
      tasks:[
        {t:"Look at the role definition file (<code>ls</code>, then <code>cat vm-operator.json</code>).",hint:"cat vm-operator.json",sticky:true,check:w=>w._cat},
        {t:"Create the custom role from the file.",hint:"az role definition create --role-definition @vm-operator.json",check:w=>w.customRoles.some(r=>r.roleName==="Virtual Machine Operator")},
        {t:"Assign <b>Virtual Machine Operator</b> to the <b>NightShift</b> group on <b>rg-prod</b>.",hint:'az role assignment create --assignee NightShift --role "Virtual Machine Operator" --resource-group rg-prod',check:w=>w.roles.some(r=>r.principal==="NightShift"&&r.role==="Virtual Machine Operator"&&/rg-prod$/i.test(r.scope))},
        {t:"Confirm the role is listed as a custom role.",hint:"az role definition list --custom-role-only true -o table",sticky:true,check:w=>w._listedCustom}],
      onCmd:(l,w)=>{if(/^cat\s+vm-operator\.json/.test(l.trim()))w._cat=true;if(/role definition list/.test(l)&&/custom-role-only|Virtual Machine Operator/.test(l))w._listedCustom=true},
      success:"NightShift can now power-manage VMs in rg-prod and nothing more. AssignableScopes limits the role to this subscription.",
      solution:'cat vm-operator.json\naz role definition create --role-definition @vm-operator.json\naz role assignment create --assignee NightShift --role "Virtual Machine Operator" --resource-group rg-prod\naz role definition list --custom-role-only true -o table'},
    {id:"featmatch",type:"match",title:"Pick the identity feature",
      scenario:"Match each request from Contoso's managers to the Entra ID or Azure feature that solves it.",
      items:[["Dynamic group","dyn"],["Group-based licensing","lic"],["B2B collaboration","b2b"],["Self-service password reset","sspr"],["Custom role","cust"],["Management group","mg"]],
      slots:[["dyn","HR","Engineers should join the Eng group automatically based on their department"],["lic","IT","Every Sales user, including new hires, needs a Microsoft 365 E3 license"],["b2b","Legal","An outside law firm needs to sign in with its own accounts to read one SharePoint site"],["sspr","Help desk","Cut password-reset tickets by letting users reset their own passwords"],["cust","Security","Operators may start and stop VMs but never delete them"],["mg","Cloud team","Apply one policy to 40 subscriptions at once"]],
      success:"Every request has the right tool."},
    {id:"access",type:"choice",title:"Troubleshoot access",
      scenario:"Tickets are piling up in the cloud team's queue. Decide what's going on in each one.",
      steps:[
        ["Mia is Contributor on rg-web but gets an error assigning Reader to a new teammate there.",["Contributor can't assign roles; she needs Owner, User Access Administrator or RBAC Administrator on rg-web","The lock on rg-web blocks her","Mia needs a license"],0,"Contributor excludes Microsoft.Authorization write."],
        ["An Owner can't delete an old storage account in rg-legacy. The error says ScopeLocked.",["Remove the lock on rg-legacy (or the account) first","Give the Owner Contributor too","Wait 24 hours"],0,"Locks apply to everyone, Owners included."],
        ["A new VM in West US was rejected with RequestDisallowedByPolicy.",["An Allowed locations policy assignment covers that scope","The user lacks Reader","The subscription is out of budget"],0,"Deny effects block the request."],
        ["Ravi's group is Contributor on the subscription, but he's denied writing blob data with Entra sign-in.",["Contributor has no DataActions; assign Storage Blob Data Contributor","The account needs a lock","Ravi needs Owner"],0,"Data plane needs a data role."],
        ["A Global Administrator can't see any subscriptions.",["Elevate access in Entra ID properties, then assign proper Azure roles","Create a guest account","Enable SSPR"],0,"Entra roles don't include Azure resource access."],
        ["A user was given Owner directly on vm-db01. After the VM moved to rg-db, she lost access.",["Resource-level assignments don't move; re-create it","The move changed the region","Owner expires after a move"],0,"Assign roles to groups at a stable scope."]],
      success:"Tickets closed, and nobody got more access than they needed."},
    {id:"costcheck",type:"check",title:"Prepare for the cost review",
      scenario:"Finance wants department-level cost reports and a warning before the dev subscription overspends. Select every action that helps.",
      opts:[["Require a department tag with Azure Policy and inherit it from resource groups",1],["Group cost analysis by the department tag",1],["Create a budget with actual and forecasted alert thresholds",1],["Connect the budget alert to an action group that runs a shutdown runbook for dev VMs",1],["Review Azure Advisor cost recommendations",1],["Expect the budget to stop resources automatically at 100%",0],["Add a ReadOnly lock to every resource group",0],["Rely on tags on resource groups showing up on resources automatically",0]],
      success:"Tags you can trust, reports by department, and early warnings that can act."}
  ],
  badges:[
    ["reader","ID","Identity Architect","Mark all 7 identity and governance lessons studied",c=>c.allStudied()],
    ["lab","GL","Governance Lab","Complete all 20 diagrams in this module",c=>c.vizAll()],
    ["scope","SC","Scope Master","Assign a role at every scope level in the scope explorer",c=>c.earned("viz:scope")],
    ["onboard","HD","Help Desk Hero","Pass the help desk onboarding lab",c=>c.passed("onboard")],
    ["governlab","GR","Guardrails","Pass the production guardrails lab",c=>c.passed("governlab")],
    ["customrole","CR","Role Crafter","Pass the custom role lab",c=>c.passed("customrole")],
    ["access","AT","Access Detective","Pass the access troubleshooting simulation",c=>c.passed("access")],
    ["costs","$","Cost Conscious","Pass the cost review simulation and trigger every budget alert",c=>c.passed("costcheck")&&c.earned("viz:budget")],
    ["perfect","ID+","Least Privilege","Score 100% on an identity and governance quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
