/* ================= Module 1: Manage identity, access, and governance (SC-500 Domain 1, 20–25%) ================= */
(function(){
const LESSONS=[
{id:"zt",num:"1.1",title:"Microsoft Entra ID and Zero Trust",html:`
<p><b>Microsoft Entra ID</b> (formerly Azure Active Directory) is the cloud identity service behind every Azure subscription, Microsoft 365 tenant and thousands of SaaS apps. A <b>tenant</b> is one dedicated instance of Entra ID for an organization. Every subscription trusts exactly one tenant for sign-in.</p>
<h3>The identities you secure</h3>
<ul><li><b>Users</b>: members of your organization, and <b>guests</b> invited through Entra External ID (B2B collaboration).</li>
<li><b>Groups</b>: security groups (assign access) and Microsoft 365 groups (collaboration). Membership can be <b>assigned</b> or <b>dynamic</b> (rule-based).</li>
<li><b>Workload identities</b>: service principals, app registrations and managed identities that let code sign in.</li>
<li><b>Agent identities</b>: Entra Agent ID gives AI agents their own identity so you can govern them like any other principal (lesson 3.3).</li>
<li><b>Devices</b>: registered, joined or hybrid joined, and checked for compliance by Intune.</li></ul>
<h3>Zero Trust in three lines</h3>
<ul><li><b>Verify explicitly</b>: authenticate and authorize on every signal (user, location, device, app, risk).</li>
<li><b>Use least privilege</b>: just-in-time and just-enough access (PIM, custom roles, narrow scopes).</li>
<li><b>Assume breach</b>: segment, encrypt end to end, and monitor everything (Defender, Sentinel).</li></ul>
<div class="viz" id="viz-ztsort"></div>
<div class="viz" id="viz-ids"></div>
<div class="tip"><b>Exam tip.</b> Entra roles control the <b>directory</b> (users, apps, tenant settings). Azure RBAC roles control <b>Azure resources</b> (VMs, storage, vaults). The exam loves asking which one a scenario needs.</div>`},
{id:"auth",num:"1.2",title:"Authentication methods: MFA and passwordless",html:`
<p>Passwords alone are the root of most account compromises. Entra ID supports many <b>authentication methods</b>, managed centrally in the <b>Authentication methods policy</b> (the legacy per-user MFA and SSPR policies were migrated into it).</p>
<h3>Methods from weakest to strongest</h3>
<ul><li><b>Password</b>: something you know. Never enough on its own.</li>
<li><b>SMS and voice call</b>: better than nothing, but vulnerable to SIM swapping and interception.</li>
<li><b>Microsoft Authenticator push</b> with <b>number matching</b> (always on) and additional context: resists MFA fatigue attacks.</li>
<li><b>OATH tokens</b> (TOTP software or hardware tokens).</li>
<li><b>Phishing-resistant</b>: <b>passkeys (FIDO2)</b> on security keys or in Microsoft Authenticator, <b>Windows Hello for Business</b>, and <b>certificate-based authentication</b> (CBA). These bind the sign-in to the real site, so a fake login page can't replay them.</li></ul>
<h3>Making it stick</h3>
<ul><li><b>Security defaults</b>: a free, one-switch baseline (MFA registration for everyone, block legacy auth). Turn it off when you move to Conditional Access.</li>
<li><b>Authentication strengths</b>: a Conditional Access grant control that requires a specific set of methods, such as "Phishing-resistant MFA" for admins.</li>
<li><b>Temporary Access Pass</b>: a time-limited passcode so a new user can register a passkey without ever having a password.</li>
<li><b>Self-service password reset (SSPR)</b> and <b>password protection</b> (global and custom banned password lists, including on-premises AD through the agent).</li></ul>
<div class="viz" id="viz-methods"></div>
<div class="viz" id="viz-mfaq"></div>
<div class="tip"><b>Exam tip.</b> "Phishing-resistant" means FIDO2/passkeys, Windows Hello for Business or certificate-based authentication. Push notifications and SMS are MFA, but not phishing-resistant.</div>`},
{id:"ca",num:"1.3",title:"Conditional Access policies",html:`
<p><b>Conditional Access</b> (CA) is the Zero Trust policy engine of Entra ID. It needs <b>Microsoft Entra ID P1</b> (risk-based conditions need <b>P2</b>). Every policy reads like an if-then statement: <b>if</b> these assignments and conditions match, <b>then</b> apply these access controls.</p>
<h3>Parts of a policy</h3>
<ul><li><b>Assignments</b>: users, groups, roles, guests, workload identities and agents (include and exclude). Always exclude <b>break-glass</b> (emergency access) accounts.</li>
<li><b>Target resources</b>: cloud apps (such as "Windows Azure Service Management API" for the portal, CLI and PowerShell), user actions (register security info) or authentication context.</li>
<li><b>Conditions</b>: user risk, sign-in risk, device platform, locations (named locations, compliant network), client apps (legacy authentication), filter for devices.</li>
<li><b>Grant</b>: block, or grant while requiring MFA, an authentication strength, a compliant or hybrid joined device, an approved client app, an app protection policy or a password change.</li>
<li><b>Session</b>: sign-in frequency, persistent browser session, app enforced restrictions, Conditional Access App Control (Defender for Cloud Apps), continuous access evaluation.</li></ul>
<h3>How policies combine</h3>
<p>All matching policies apply together. <b>Block wins</b> over every grant. If two policies require different controls, the user must satisfy all of them. New policies should start in <b>report-only</b> mode; use the <b>What If</b> tool and sign-in logs to see the effect before turning them on.</p>
<div class="viz" id="viz-cabuild"></div>
<div class="viz" id="viz-caq"></div>
<div class="tip"><b>Exam tip.</b> CA is evaluated <b>after</b> first-factor authentication. That's why it can use the user's identity and risk, and why it can't stop a password spray from hitting the sign-in page.</div>`},
{id:"pim",num:"1.4",title:"Privileged Identity Management (PIM)",html:`
<p>Standing admin access is a gift to attackers. <b>Privileged Identity Management</b> (Entra ID P2 or Entra ID Governance) replaces it with <b>just-in-time</b>, time-bound and approved access.</p>
<h3>Assignment types</h3>
<ul><li><b>Eligible</b>: the user can activate the role when needed. Nothing is granted until they do.</li>
<li><b>Active</b>: the role is granted now, either permanently or until an end date.</li></ul>
<h3>What PIM manages</h3>
<ul><li><b>Microsoft Entra roles</b> (Global Administrator, Security Administrator and so on).</li>
<li><b>Azure resource roles</b> (Owner, Contributor, User Access Administrator) at management group, subscription, resource group or resource scope.</li>
<li><b>PIM for Groups</b>: just-in-time membership or ownership of a security group, which can carry both kinds of roles.</li></ul>
<h3>Role settings you configure</h3>
<ul><li>Maximum activation duration (1 to 24 hours), require MFA or an authentication context on activation, require justification and a ticket number, require approval and pick approvers.</li>
<li>Allow permanent eligible or active assignments, or force an expiry.</li>
<li>Notifications when roles are assigned or activated.</li></ul>
<p><b>Access reviews</b> ask owners, managers or the users themselves to confirm that access is still needed, and can remove it automatically if nobody answers.</p>
<div class="viz" id="viz-pimflow"></div>
<div class="viz" id="viz-pimq"></div>
<div class="tip"><b>Exam tip.</b> "Require approval to activate the Owner role on the production subscription" is a PIM <b>Azure resource</b> role setting, not an Entra role setting. And PIM needs P2 or Entra ID Governance licenses for the users who benefit.</div>`},
{id:"apps",num:"1.5",title:"Identity for applications",html:`
<p>When an application needs to sign in users or call APIs, it needs an identity in Entra ID. Two objects make that happen, and mixing them up is a classic exam trap.</p>
<h3>App registration vs enterprise application</h3>
<ul><li><b>App registration</b> (the <b>application object</b>): the global definition of the app, living in its <b>home tenant</b>. It holds the client ID, redirect URIs, credentials (client secrets, certificates, federated credentials), exposed API scopes and app roles, and the API permissions it requests.</li>
<li><b>Enterprise application</b> (the <b>service principal</b>): the local instance of the app in <b>each tenant</b> that uses it. Assignments, consent grants, Conditional Access and sign-in logs all attach to the service principal.</li></ul>
<p>A multitenant app has one application object and one service principal in every customer tenant.</p>
<h3>Securing app identities</h3>
<ul><li>Prefer <b>certificates</b> or <b>federated identity credentials</b> (workload identity federation for GitHub Actions, Kubernetes, other clouds) over client secrets. If you must use secrets, keep them short-lived and in Key Vault.</li>
<li>Turn on <b>Assignment required</b> on the enterprise app so only assigned users and groups can sign in.</li>
<li>Assign <b>owners</b>, and use app management policies to restrict credential types and lifetimes.</li>
<li>Protect workload identities with Conditional Access for workload identities and Entra ID Protection risk detections (Workload ID Premium).</li></ul>
<div class="viz" id="viz-appobj"></div>
<div class="viz" id="viz-oauthflow"></div>
<div class="tip"><b>Exam tip.</b> "Users from another tenant must sign in to your app" means a multitenant app registration. "Only the HR group should be able to sign in" means Assignment required on the enterprise application.</div>`},
{id:"consent",num:"1.6",title:"OAuth permission grants and consent",html:`
<p>Apps don't get access to data just by existing. They request <b>permissions</b> (scopes) on an API such as Microsoft Graph, and someone has to <b>consent</b>.</p>
<h3>Two kinds of permissions</h3>
<ul><li><b>Delegated permissions</b>: the app acts <b>on behalf of a signed-in user</b>. Effective access is the overlap of what the app was granted and what the user can do. Some low-risk scopes can be consented by users; others need an admin.</li>
<li><b>Application permissions</b> (app roles): the app acts <b>as itself</b>, with no user, such as a background service reading every mailbox. These <b>always require admin consent</b>.</li></ul>
<h3>Consent settings</h3>
<ul><li><b>User consent settings</b>: do not allow user consent, allow it only for apps from <b>verified publishers</b> requesting <b>low-impact</b> permissions you classify, or allow it for everything (not recommended).</li>
<li><b>Admin consent workflow</b>: users request access, and designated reviewers approve or deny it.</li>
<li><b>Grant admin consent</b> on behalf of the whole organization from the app registration or enterprise app.</li>
<li>Review and revoke existing grants in <b>Enterprise applications &gt; Permissions</b>, and investigate <b>illicit consent grant</b> (consent phishing) attacks where users were tricked into approving a malicious app.</li></ul>
<div class="viz" id="viz-permsort"></div>
<div class="viz" id="viz-consentq"></div>
<div class="tip"><b>Exam tip.</b> A daemon with no signed-in user needs <b>application</b> permissions plus <b>admin consent</b>. A web app reading the signed-in user's calendar needs a <b>delegated</b> permission.</div>`},
{id:"mi",num:"1.7",title:"Managed identities for Azure resources",html:`
<p>The best secret is the one nobody has to store. A <b>managed identity</b> is a service principal that Azure creates and rotates for you, so code running on an Azure resource can get tokens for Entra-protected services (Key Vault, Storage, SQL, Microsoft Graph) without any credential in code or config.</p>
<h3>Two types</h3>
<ul><li><b>System-assigned</b>: enabled on one resource, shares its lifecycle, and is deleted with it. One resource, one identity.</li>
<li><b>User-assigned</b>: a standalone Azure resource you create, then attach to one or many resources. It survives when they're deleted. Good for scale sets, pre-provisioning access, or many resources needing the same permissions.</li></ul>
<h3>How it works</h3>
<p>Code on a VM asks the local <b>Instance Metadata Service</b> endpoint (169.254.169.254) for a token for a resource. Azure returns an Entra access token for the managed identity, and the code presents it to the target service. The target checks its RBAC role assignments to decide what the identity can do. App Service and Functions expose an equivalent local identity endpoint.</p>
<div class="viz" id="viz-miflow"></div>
<div class="viz" id="viz-misort"></div>
<div class="tip"><b>Exam tip.</b> Enabling a managed identity grants nothing by itself. You still need a <b>role assignment</b> on the target, such as Key Vault Secrets User or Storage Blob Data Reader.</div>`},
{id:"kv",num:"1.8",title:"Azure Key Vault",html:`
<p><b>Azure Key Vault</b> stores <b>secrets</b> (passwords, connection strings), <b>keys</b> (RSA and EC keys for encryption and signing) and <b>certificates</b> (with automatic renewal from integrated CAs).</p>
<h3>Deploying and configuring a vault</h3>
<ul><li><b>Standard</b> tier uses software-protected keys; <b>Premium</b> adds HSM-protected keys (FIPS 140 Level 3). <b>Managed HSM</b> is a dedicated, single-tenant HSM pool for the strictest needs.</li>
<li><b>Soft delete</b> is always on: deleted vaults and objects are kept for 7 to 90 days (default 90) and can be recovered.</li>
<li><b>Purge protection</b>: once on, nobody (not even Microsoft) can permanently delete the vault or its objects until the retention period ends. It can't be turned off. Required for customer-managed keys in many services.</li></ul>
<h3>Access control</h3>
<ul><li><b>Control plane</b> (manage the vault itself) is always Azure RBAC.</li>
<li><b>Data plane</b> (read a secret, use a key) uses either <b>Azure RBAC</b> (recommended: Key Vault Administrator, Secrets Officer, Secrets User, Crypto Officer, Crypto User, Crypto Service Encryption User, Certificates Officer, Reader) or legacy <b>vault access policies</b>.</li>
<li>With access policies, anyone with Contributor on the vault can grant themselves data access. That's a key reason to switch to RBAC.</li></ul>
<h3>Network and protection</h3>
<ul><li><b>Firewall</b>: allow only selected virtual networks and IP ranges, optionally allow trusted Microsoft services, or disable public access and use a <b>private endpoint</b>.</li>
<li><b>Rotation</b>: key rotation policies rotate keys on a schedule; Event Grid "near expiry" events can trigger secret rotation functions.</li>
<li><b>Microsoft Defender for Key Vault</b> alerts on unusual access, such as access from a Tor exit node or a suspicious spike in secret reads.</li>
<li><b>Defender CSPM</b> scans VMs, code repositories and cloud deployments for <b>exposed secrets</b> and recommends moving them into Key Vault.</li></ul>
<div class="viz" id="viz-purge"></div>
<div class="viz" id="viz-kvroles"></div>
<div class="tip"><b>Exam tip.</b> "An app must read secrets but not change them" is <b>Key Vault Secrets User</b>. "Storage needs to wrap and unwrap a customer-managed key" is <b>Key Vault Crypto Service Encryption User</b>.</div>`},
{id:"rbac",num:"1.9",title:"Azure RBAC: built-in and custom roles",html:`
<p><b>Azure role-based access control</b> answers three questions: <b>who</b> (security principal), <b>what</b> (role definition) and <b>where</b> (scope). A role assignment ties the three together.</p>
<h3>Scope and inheritance</h3>
<p>Scopes nest: <b>management group &gt; subscription &gt; resource group &gt; resource</b>. Assignments are inherited downward. Assign at the narrowest scope that does the job.</p>
<h3>Built-in roles to know</h3>
<ul><li><b>Owner</b>: full access including assigning roles. <b>Contributor</b>: full management but no role assignments. <b>Reader</b>: view only.</li>
<li><b>User Access Administrator</b>: manage access only. <b>Role Based Access Control Administrator</b>: assign roles, optionally limited by <b>conditions</b> (for example, only allow assigning Reader).</li>
<li>Data roles such as <b>Storage Blob Data Contributor</b> work on the <b>data plane</b> (DataActions), not the control plane (Actions).</li></ul>
<h3>Custom roles</h3>
<ul><li><b>Azure custom roles</b> are JSON with Actions, NotActions, DataActions, NotDataActions and AssignableScopes. NotActions subtracts from Actions; it is not a deny.</li>
<li><b>Entra custom roles</b> (P1) use directory permissions such as <code>microsoft.directory/<wbr>applications/<wbr>credentials/<wbr>update</code> and can be scoped to an administrative unit or a single app.</li>
<li><b>Deny assignments</b> block actions even when a role allows them. You can't create them directly; Azure creates them for managed apps and deployment stack deny settings.</li></ul>
<h3>Remediating overprivileged access</h3>
<p>Review <b>Access control (IAM) &gt; Role assignments</b>, find Owners and Contributors that don't need it, replace them with narrower roles, and move standing access to PIM eligible assignments. Defender CSPM's <b>permissions management</b> recommendations and Entra access reviews highlight unused permissions.</p>
<div class="viz" id="viz-scope"></div>
<div class="viz" id="viz-roleq"></div>
<div class="tip"><b>Exam tip.</b> A user can read a storage account's settings but gets "not authorized" opening a blob with Entra auth? They have a control-plane role (Reader) but no data-plane role (Storage Blob Data Reader).</div>`},
{id:"gov",num:"1.10",title:"Governance: Azure Policy, locks, backup and IaC",html:`
<p>Governance makes the secure configuration the default, and keeps it that way.</p>
<h3>Azure Policy</h3>
<ul><li>A <b>policy definition</b> is a JSON rule (if a condition, then an effect). An <b>initiative</b> (policy set) groups definitions, such as the <b>Microsoft cloud security benchmark</b>.</li>
<li><b>Effects</b>: <b>Deny</b> (block the request), <b>Audit</b> (log non-compliance), <b>AuditIfNotExists</b>, <b>DeployIfNotExists</b> (deploy a missing setting, such as diagnostic settings), <b>Modify</b> (add or change tags and properties), <b>Append</b>, <b>Disabled</b>, and <b>DenyAction</b> (block delete calls).</li>
<li>DeployIfNotExists and Modify need a <b>managed identity</b> on the assignment and a <b>remediation task</b> to fix existing resources.</li>
<li>Assign at management group, subscription or resource group, with <b>exclusions</b> and <b>exemptions</b> (waiver or mitigated).</li></ul>
<h3>Defender for Cloud regulatory compliance</h3>
<p>Defender for Cloud maps policy results to <b>security standards</b> (MCSB by default; add NIST SP 800-53, PCI DSS, ISO 27001, CIS and more) and shows a compliance dashboard per control. More in module 4.</p>
<h3>Resource locks</h3>
<ul><li><b>CanNotDelete</b> (Delete): read and modify, but not delete. <b>ReadOnly</b>: read only, no changes.</li>
<li>Locks apply to everyone, including Owners, and are inherited by child resources. A ReadOnly lock can break things, such as listing storage keys (a POST action).</li></ul>
<h3>Backup security</h3>
<ul><li><b>Soft delete</b> for backups (with always-on option), <b>immutable vaults</b> (locked immutability can't be undone), <b>multi-user authorization</b> (MUA) through a Resource Guard so one admin can't disable protection alone, and <b>encryption with customer-managed keys</b>.</li></ul>
<h3>Infrastructure as code</h3>
<p>Define security in Bicep, ARM or Terraform templates, scan templates in pipelines (Defender for Cloud DevOps security, IaC scanning), and use <b>deployment stacks</b> with deny settings to stop drift.</p>
<div class="viz" id="viz-effects"></div>
<div class="viz" id="viz-lock"></div>
<div class="viz" id="viz-backup"></div>
<div class="tip"><b>Exam tip.</b> "Prevent storage accounts without HTTPS from being created" is <b>Deny</b>. "Automatically configure diagnostic settings on every new key vault" is <b>DeployIfNotExists</b> with a managed identity.</div>`}
];

/* ---------- flashcards ---------- */
const G={
 ent:[["Microsoft Entra ID","Microsoft's cloud identity and access management service (formerly Azure AD)"],["Tenant","A dedicated instance of Entra ID representing one organization"],["How many tenants does a subscription trust?","Exactly one"],["Entra B2B collaboration","Invite external users as guests who sign in with their own identity"],["Dynamic group","Group whose membership is calculated from a rule on user or device attributes (needs P1)"],["Zero Trust principles","Verify explicitly, use least privilege, assume breach"],["Entra roles vs Azure roles","Entra roles manage the directory; Azure RBAC roles manage Azure resources"],["Workload identity","An identity used by software: app registration, service principal or managed identity"],["Entra Agent ID","Identity platform that gives AI agents their own governed identities"],["Break-glass account","Emergency-access cloud-only Global Administrator excluded from Conditional Access, with a strong credential, monitored"],["Administrative unit","Container for users, groups or devices so Entra roles can be scoped to a subset of the directory"],["Entra ID P1 adds","Conditional Access, dynamic groups, custom Entra roles, self-service group management"],["Entra ID P2 adds","ID Protection (risk-based policies), PIM, access reviews"],["Entra ID Protection","Detects user risk and sign-in risk (leaked credentials, impossible travel, anonymous IP) and feeds Conditional Access"],["User risk vs sign-in risk","User risk: likelihood the account is compromised. Sign-in risk: likelihood this sign-in isn't the owner"],["Recommended response to high user risk","Require secure password change (with MFA) through Conditional Access"]],
 auth:[["Phishing-resistant methods","Passkeys (FIDO2), Windows Hello for Business, certificate-based authentication"],["Number matching","Authenticator push requires typing the number shown on the sign-in screen; stops MFA fatigue approvals"],["Why SMS is weak","SIM swap and interception attacks"],["Security defaults","Free baseline: MFA registration for all, MFA for admins, block legacy authentication"],["Security defaults vs Conditional Access","Use one or the other: turn off security defaults before enabling CA policies"],["Authentication strength","CA grant control that requires specific methods, such as phishing-resistant MFA"],["Temporary Access Pass","Time-limited passcode for onboarding or recovery, used to register passwordless methods"],["Authentication methods policy","Central place to enable and target methods (replaced legacy MFA and SSPR settings)"],["Passkey in Authenticator","Device-bound FIDO2 credential stored in the Microsoft Authenticator app"],["Entra password protection","Blocks weak passwords using a global banned list plus your custom list, also for on-premises AD"],["Smart lockout","Locks out attackers guessing passwords while letting the real user keep signing in"],["Legacy authentication","Protocols like POP, IMAP and SMTP basic auth that can't do MFA; block them"],["Certificate-based authentication","Sign in with an X.509 certificate (smart card or device) validated directly by Entra ID"],["SSPR","Self-service password reset: users reset their own password after verifying with registered methods"]],
 ca:[["Conditional Access license","Microsoft Entra ID P1 (risk conditions need P2)"],["CA policy formula","If assignments and conditions match, then apply grant and session controls"],["What wins when policies conflict?","Block always wins; otherwise all required controls must be met"],["Report-only mode","Evaluates and logs a CA policy's result without enforcing it"],["What If tool","Simulates which CA policies would apply to a given sign-in"],["Target the Azure portal, CLI and PowerShell","Windows Azure Service Management API (Microsoft Admin Portals for admin portals)"],["Named location","IP ranges or countries you define for CA location conditions"],["Grant: require compliant device","Device must be Intune-managed and compliant"],["Session control: sign-in frequency","How often a user must reauthenticate"],["Continuous access evaluation","Revokes access in near real time on events like user disabled or IP change"],["Authentication context","Tag (c1–c99) used to require stronger controls for sensitive actions, such as PIM activation"],["CA for workload identities","Block service principals outside known IPs or at high risk (Workload ID Premium)"],["When is CA evaluated?","After first-factor authentication completes"],["Token protection","Session control binding tokens to the device to stop token replay"]],
 pim:[["PIM","Privileged Identity Management: just-in-time, time-bound, approved privileged access"],["PIM license","Entra ID P2 or Entra ID Governance"],["Eligible assignment","User can activate the role when needed; no access until activated"],["Active assignment","Role is granted now, permanent or time-bound"],["Max activation duration","Configurable from 1 to 24 hours"],["PIM for Groups","Just-in-time membership or ownership of a security group"],["What PIM covers","Entra roles, Azure resource roles, and group membership/ownership"],["Activation requirements","MFA or authentication context, justification, ticket info, approval"],["Access reviews","Recurring attestation that users still need access, with auto-apply results"],["PIM alert example","Roles assigned outside PIM, too many Global Administrators, roles not used"],["Who approves activations?","Approvers you select in the role setting (users or groups)"],["Least privileged role to manage PIM","Privileged Role Administrator (for Entra roles)"]],
 app:[["App registration","Application object: global definition of an app in its home tenant"],["Enterprise application","Service principal: the app's local instance in a tenant"],["Multitenant app","One application object, a service principal in each tenant that uses it"],["Client ID","Application (client) ID that uniquely identifies an app registration"],["Credentials an app can use","Client secret, certificate, federated identity credential"],["Best credential for apps","Certificate or federated credential; avoid long-lived secrets"],["Federated identity credential","Trusts tokens from an external IdP (GitHub, Kubernetes) so no secret is needed"],["Assignment required","Enterprise app setting: only assigned users or groups can get a token"],["Delegated permission","App acts on behalf of a signed-in user"],["Application permission","App acts as itself with no user; always needs admin consent"],["Admin consent workflow","Users request consent; designated reviewers approve or deny"],["User consent recommended setting","Allow only for verified publishers and low-impact permissions, or not at all"],["Illicit consent grant","Attack tricking users into consenting to a malicious app"],["Where to revoke app consent","Enterprise applications > the app > Permissions"],["App roles","Roles defined in the app registration and assigned to users, groups or apps"],["Expose an API","Defines scopes other apps can request on your API"]],
 mi:[["Managed identity","Azure-managed service principal for a resource; no credentials to store or rotate"],["System-assigned identity","Tied to one resource and deleted with it"],["User-assigned identity","Standalone resource; attach to many resources; independent lifecycle"],["Token endpoint on a VM","Instance Metadata Service at 169.254.169.254"],["Does a managed identity grant access by itself?","No: assign it a role on the target resource"],["When to pick user-assigned","Many resources need the same identity, or access must exist before the resource"],["Key Vault Secrets User","Read secret contents"],["Key Vault Secrets Officer","Manage secrets (not permissions)"],["Key Vault Crypto User","Perform cryptographic operations with keys"],["Key Vault Crypto Service Encryption User","Read key metadata and wrap/unwrap: used by services for CMK"],["Key Vault Administrator","All data-plane operations on the vault; cannot assign roles unless also given an access role"],["Key Vault tiers","Standard (software keys) and Premium (HSM-backed keys)"],["Managed HSM","Single-tenant, FIPS 140-3 Level 3 HSM pool with local RBAC"],["Soft delete retention","7 to 90 days (default 90); always enabled"],["Purge protection","Blocks permanent deletion during retention; can't be disabled once on"],["Vault access policy weakness","Contributors on the vault can grant themselves data access"],["Key rotation policy","Automatically rotates a key on a schedule and notifies before expiry"],["Key Vault firewall","Allow selected VNets and IPs, trusted Microsoft services, or disable public access"],["Defender for Key Vault","Alerts on unusual access patterns to a vault"],["Key Vault backup","Backup-Az…/az keyvault … backup exports an encrypted blob restorable only in the same geography and subscription"],["Certificate auto-renewal","Key Vault renews certificates from integrated CAs (DigiCert, GlobalSign) before expiry"]],
 rbac:[["RBAC role assignment","Security principal + role definition + scope"],["Scope hierarchy","Management group > subscription > resource group > resource"],["Owner","Full access including assigning roles"],["Contributor","Full management of resources, but can't assign roles"],["Reader","View resources only"],["User Access Administrator","Manage user access to Azure resources"],["Role Based Access Control Administrator","Assign roles, optionally limited by conditions"],["Actions vs DataActions","Actions = control plane; DataActions = data plane (blobs, secrets)"],["NotActions","Subtracts permissions from Actions; not a deny"],["AssignableScopes","Where a custom role can be assigned"],["Deny assignment","Blocks actions regardless of role assignments; created by Azure (managed apps, deployment stacks)"],["Entra custom role","Custom directory role (P1) scoped to tenant, admin unit or app"],["Azure Policy definition","JSON rule with a condition and an effect"],["Initiative","A group of policy definitions assigned together"],["Deny effect","Blocks non-compliant create or update requests"],["Audit effect","Allows the request but logs non-compliance"],["DeployIfNotExists","Deploys a related resource or setting when missing; needs managed identity"],["Modify effect","Adds, updates or removes properties or tags; needs managed identity"],["DenyAction","Blocks specific actions such as delete"],["Remediation task","Applies DeployIfNotExists or Modify to existing non-compliant resources"],["Policy exemption","Waiver or mitigated exception for a scope or resource"],["CanNotDelete lock","Allows read and modify, blocks delete"],["ReadOnly lock","Allows read only; blocks changes and some POST actions like listing keys"],["Who can remove a lock?","Owner or User Access Administrator (Microsoft.Authorization/locks/*)"],["Immutable backup vault","Prevents operations that could lose recovery points; locked mode is irreversible"],["Multi-user authorization","Resource Guard requires a second person to approve critical backup changes"],["Deployment stack deny settings","Block changes or deletes to managed resources outside the stack"]]
};
const DECKS=[["ent","Entra ID and Zero Trust"],["auth","Authentication methods"],["ca","Conditional Access"],["pim","PIM and access reviews"],["app","App identities and consent"],["mi","Managed identities and Key Vault"],["rbac","RBAC, Policy and governance"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

/* ---------- quiz bank (answer is always index 0; shuffled at display) ---------- */
const QUIZ=[
 {q:"Admins must use a sign-in method that can't be replayed through a fake login page. What should the Conditional Access policy require?",o:["An authentication strength of phishing-resistant MFA","Require multifactor authentication with any method the user registered","Require SMS verification","Require password change"],a:0,e:"Authentication strengths let you demand FIDO2, Windows Hello or CBA specifically."},
 {q:"Users are approving MFA prompts they didn't start. Which Authenticator feature addresses this?",o:["Number matching","SMS fallback","Security questions","App passwords"],a:0,e:"Number matching stops blind approvals in MFA fatigue attacks; it's on for all push notifications."},
 {q:"You want to enable Conditional Access. What must you do with security defaults?",o:["Turn them off","Leave them on alongside CA","Convert them to a CA policy automatically","Nothing; they don't interact"],a:0,e:"Security defaults and Conditional Access are mutually exclusive."},
 {q:"Which license do you need for sign-in risk based Conditional Access policies?",o:["Microsoft Entra ID P2","Microsoft Entra ID Free","Microsoft Entra ID P1","Microsoft 365 Business Basic"],a:0,e:"Risk conditions come from ID Protection, a P2 feature."},
 {q:"A new CA policy might lock out users. How should you deploy it first?",o:["Report-only mode","Enabled for all users","Disabled","Excluded from all apps"],a:0,e:"Report-only logs what would happen without enforcing it."},
 {q:"One CA policy grants access with MFA; another matching policy blocks access from a country. A user signs in from that country with MFA. Result?",o:["Blocked","Allowed after MFA","Allowed without MFA","The newest policy wins"],a:0,e:"Block always wins."},
 {q:"Which cloud app should a CA policy target to protect the Azure portal, Azure CLI and Azure PowerShell?",o:["Windows Azure Service Management API","Office 365 Exchange Online","Microsoft Graph PowerShell","Azure Key Vault data plane"],a:0,e:"Service Management API covers Azure Resource Manager access through all three."},
 {q:"Which accounts should every blocking Conditional Access policy exclude?",o:["Emergency access (break-glass) accounts","All guest users","All Global Reader accounts","Accounts synced from on-premises"],a:0,e:"Break-glass accounts keep you from locking yourself out."},
 {q:"You need to require a compliant device only when users download files from a sensitive SharePoint site. What CA feature lets apps step up for a specific action?",o:["Authentication context","Named locations","Sign-in frequency","Terms of use"],a:0,e:"Authentication context tags let apps and PIM request stronger controls for sensitive actions."},
 {q:"A helpdesk admin should reset passwords only for users in the Sales department. What should you use?",o:["An administrative unit with a scoped Helpdesk Administrator role","Azure RBAC with User Access Administrator at the resource group","A dynamic group for Sales with Owner rights on the users","A custom Azure role with Microsoft.Authorization actions"],a:0,e:"Administrative units scope Entra roles to a subset of the directory."},
 {q:"A new employee must register a passkey before they ever have a password. What should you issue?",o:["A Temporary Access Pass","A one-time SMS code","A client secret","A recovery key"],a:0,e:"TAP is a time-limited passcode built for passwordless onboarding."},
 {q:"In PIM, a user should be able to become Global Administrator only after approval, for at most 2 hours. Which assignment type?",o:["Eligible, with approval and a 2-hour max activation","Active, permanent, with an approval workflow on every sign-in","Active, time-bound for 2 hours","Direct assignment outside PIM"],a:0,e:"Eligible assignments plus role settings give just-in-time, approved access."},
 {q:"Where do you require approval to activate Owner on a production subscription?",o:["PIM > Azure resources > the subscription > role settings for Owner","PIM > Microsoft Entra roles > Global Administrator","Conditional Access > Grant controls","Azure Policy > Deny"],a:0,e:"Azure resource roles are managed per scope in PIM."},
 {q:"A team needs just-in-time access to both an Entra role and an Azure role at once. What's the simplest approach?",o:["PIM for Groups: make users eligible members of a group that holds both roles","Two permanent assignments, one Entra role and one Azure role, with MFA","A custom Azure role with directory permissions","A CA policy"],a:0,e:"PIM for Groups activates group membership, which carries every role assigned to the group."},
 {q:"Managers must confirm quarterly that guests still need access to a Teams group, with access removed if they don't answer. What should you configure?",o:["An access review with auto-apply and a 'remove access' default","A PIM alert for guests who haven't signed in for 90 days","A Conditional Access policy that blocks guests after 90 days","A dynamic group rule that removes guests each quarter"],a:0,e:"Access reviews handle recurring attestation and can auto-remove."},
 {q:"Which object holds an app's redirect URIs, client secrets and requested API permissions?",o:["The app registration (application object)","The enterprise application (service principal)","The managed identity","The Conditional Access policy"],a:0,e:"The application object is the global definition."},
 {q:"Where do you set 'Assignment required' so only specific groups can sign in to a SaaS app?",o:["The enterprise application's properties","The app registration's manifest","The tenant's user settings","The subscription's IAM blade"],a:0,e:"Assignment and sign-in control live on the service principal."},
 {q:"A GitHub Actions workflow deploys to Azure. You want no secrets stored in GitHub. What should you configure?",o:["A federated identity credential on an app registration or user-assigned managed identity","A client secret with a 2-year expiry stored as a GitHub secret","A storage account key saved as a GitHub Actions secret","A personal access token with Contributor rights on the subscription"],a:0,e:"Workload identity federation trusts GitHub's OIDC token instead of a secret."},
 {q:"A background service reads all users' mailboxes with no user signed in. What does it need?",o:["Application permissions with admin consent","Delegated permissions with user consent","An Entra custom role","Azure RBAC Reader"],a:0,e:"No signed-in user means application permissions, which always need admin consent."},
 {q:"Users keep consenting to unknown third-party apps. What's the recommended user consent setting?",o:["Allow user consent only for verified publishers and low-impact permissions","Allow user consent for all apps that request any permissions","Require app passwords for every third-party app sign-in","Disable all enterprise apps until an admin reviews each one"],a:0,e:"That limits consent to low-risk scopes from verified publishers."},
 {q:"You blocked user consent, but users still need a way to ask for apps. What should you enable?",o:["Admin consent workflow","Self-service password reset","Security defaults","App proxy"],a:0,e:"Users submit requests; reviewers approve or deny."},
 {q:"A delegated permission is granted to an app. What is the app's effective access?",o:["The intersection of the app's granted permissions and the signed-in user's permissions","Everything the app requested in its manifest, whatever the user can do","Everything the signed-in user can do, even beyond the granted scopes","Global Administrator rights, because admin consent was granted"],a:0,e:"Delegated access never exceeds what the user can do."},
 {q:"You suspect an illicit consent grant. Where do you review and revoke the app's permissions?",o:["Enterprise applications > the app > Permissions","Azure Policy > Compliance","Key Vault > Access policies","Subscriptions > Resource providers"],a:0,e:"Consent grants are recorded on the service principal."},
 {q:"An Azure VM must read a secret from Key Vault without stored credentials. What should you do?",o:["Enable a managed identity on the VM and assign it Key Vault Secrets User","Put the secret in the VM's custom data so it's available at boot time","Create a client secret and store it in a file","Assign the VM Reader on the subscription"],a:0,e:"Managed identity plus a data-plane role is the standard pattern."},
 {q:"Twenty VMs in a scale set need the same identity, and the identity must keep its access when VMs are rebuilt. Which identity type?",o:["User-assigned managed identity","System-assigned managed identity","A shared client secret","A guest account"],a:0,e:"User-assigned identities are independent resources shared across many resources."},
 {q:"What happens to a system-assigned managed identity when its VM is deleted?",o:["It's deleted too","It becomes a user-assigned identity","It stays and keeps its roles","It's moved to the resource group"],a:0,e:"System-assigned identities share the resource's lifecycle."},
 {q:"Code on a VM requests a managed identity token from which endpoint?",o:["169.254.169.254 (Instance Metadata Service)","login.microsoftonline.com with a client secret","The Key Vault URI","168.63.129.16 only"],a:0,e:"IMDS issues tokens for the VM's managed identity."},
 {q:"An app must read secret values but must not create or delete secrets. Which Key Vault RBAC role?",o:["Key Vault Secrets User","Key Vault Secrets Officer","Key Vault Administrator","Key Vault Contributor"],a:0,e:"Secrets User reads secret contents only."},
 {q:"A storage account uses a customer-managed key in Key Vault. What role does the storage account's identity need?",o:["Key Vault Crypto Service Encryption User","Key Vault Secrets User on the vault that holds the key","Key Vault Reader","Owner"],a:0,e:"It needs get, wrap key and unwrap key on the key."},
 {q:"Why do Microsoft recommendations favor Azure RBAC over vault access policies?",o:["With access policies, a vault Contributor can grant themselves data-plane access","Access policies can't be assigned to Entra ID groups","Azure RBAC is required before soft delete can be turned on","Access policies only work with Key Vault Premium"],a:0,e:"RBAC separates management and data-plane permissions properly."},
 {q:"An admin deleted a key vault yesterday. Purge protection is on. What can an attacker with Owner rights do?",o:["Nothing to purge it until the retention period ends","Purge it immediately","Turn off purge protection, then purge","Restore it to another tenant"],a:0,e:"Purge protection is irreversible and blocks permanent deletion during retention."},
 {q:"What's the default soft-delete retention for Key Vault?",o:["90 days","7 days","30 days","365 days"],a:0,e:"Configurable from 7 to 90 days; 90 is the default."},
 {q:"You need HSM-protected keys with single-tenant isolation and FIPS 140-3 Level 3. What should you deploy?",o:["Azure Key Vault Managed HSM","Key Vault Standard","An App Configuration store","A storage account with SSE"],a:0,e:"Managed HSM is a dedicated HSM pool."},
 {q:"Only one VNet should reach a key vault, with no public internet access. What do you configure?",o:["Disable public network access and add a private endpoint in the VNet","Allow trusted Microsoft services only","Add the VNet's address range to the access policy","Enable soft delete"],a:0,e:"A private endpoint gives the vault a private IP in your VNet."},
 {q:"Developers committed a storage key to a repository. Which Defender capability can find exposed secrets like this?",o:["Secret scanning in Defender CSPM (DevOps security)","Defender for Key Vault, which scans repositories for keys","An Azure Policy Audit assignment on the storage account","Network Watcher connection troubleshoot on the repo host"],a:0,e:"Defender CSPM scans code, VMs and deployments for secrets."},
 {q:"You get an alert that a key vault was accessed from a Tor exit node. Which plan generated it?",o:["Microsoft Defender for Key Vault","Microsoft Defender for Storage","Defender CSPM","Entra ID Protection"],a:0,e:"Defender for Key Vault detects unusual access to vaults."},
 {q:"Keys must rotate every 6 months automatically with a notification 30 days before expiry. What should you configure?",o:["A key rotation policy in Key Vault","An Azure Policy Deny","A PIM role setting","A storage lifecycle rule"],a:0,e:"Rotation policies automate key rotation."},
 {q:"A role assigned at a subscription applies to which resources?",o:["All resource groups and resources in it","Only the subscription object","Only resources created after assignment","Only resources with matching tags"],a:0,e:"Assignments inherit down the scope hierarchy."},
 {q:"A user must manage VMs in rg-web but must not grant anyone access. Which role at rg-web?",o:["Virtual Machine Contributor","Owner","User Access Administrator","Reader"],a:0,e:"Contributor-type roles exclude role assignment."},
 {q:"A team lead should be able to assign only the Reader and Backup Operator roles to others. What's the least-privilege option?",o:["Role Based Access Control Administrator with a condition limiting assignable roles","Owner on the resource group, so they can manage everything there","User Access Administrator without conditions on the subscription","Contributor"],a:0,e:"Conditions on RBAC Administrator constrain which roles can be assigned."},
 {q:"In a custom role, what does NotActions do?",o:["Removes those permissions from the Actions granted","Explicitly denies the actions even with other roles","Grants data-plane permissions","Limits where the role can be assigned"],a:0,e:"NotActions subtracts; another role could still grant those actions."},
 {q:"A user with Reader on a storage account gets 'authorization failure' reading a blob with Entra auth. Why?",o:["Reader is a control-plane role; they need a data role like Storage Blob Data Reader","Reader can't sign in with Entra ID to storage; they need the account key","The blob is in the Archive tier and must be rehydrated before it's read","Purge protection on the account blocks reads for non-owners"],a:0,e:"Data access uses DataActions roles."},
 {q:"Which property defines where a custom Azure role can be assigned?",o:["AssignableScopes","DataActions","NotActions","IsCustom"],a:0,e:"AssignableScopes lists management groups, subscriptions or resource groups."},
 {q:"A custom Entra role must let a user update credentials on only one app registration. Where should you scope the assignment?",o:["To that single application","Tenant-wide","To a resource group","To a management group"],a:0,e:"Entra custom roles can be scoped to individual apps."},
 {q:"You find 14 permanent Owners on a subscription. What's the best remediation?",o:["Replace with narrower roles and convert remaining Owners to PIM eligible assignments","Add a ReadOnly lock to the subscription so Owners can't make changes","Add a Conditional Access policy that requires MFA for all Owners","Move the subscription to a new management group with stricter policy"],a:0,e:"Least privilege plus just-in-time access."},
 {q:"New storage accounts must never allow public blob access. Which policy effect blocks creation of a non-compliant account?",o:["Deny","Audit","AuditIfNotExists","Disabled"],a:0,e:"Deny blocks the request."},
 {q:"Diagnostic settings must be deployed automatically to every new key vault. Which effect?",o:["DeployIfNotExists","Deny","AuditIfNotExists","Modify"],a:0,e:"DINE deploys the missing related resource."},
 {q:"A DeployIfNotExists policy doesn't fix existing vaults. What's missing?",o:["A remediation task (using the assignment's managed identity)","A ReadOnly lock on each vault so the policy can write its settings","A Deny effect added to the same assignment so it blocks drift","A policy exemption that marks existing vaults as in scope"],a:0,e:"Existing resources need a remediation task."},
 {q:"Every resource must get a costCenter tag inherited from its resource group automatically. Which effect?",o:["Modify","Deny","Audit","DenyAction"],a:0,e:"Modify adds or changes tags and properties."},
 {q:"You need to stop anyone from deleting a production SQL server while still allowing configuration changes. Simplest control?",o:["A CanNotDelete resource lock","A ReadOnly lock on the server","An Audit policy","Remove all Owners"],a:0,e:"CanNotDelete blocks deletes but allows modification."},
 {q:"After a ReadOnly lock on a storage account resource group, an app can no longer list storage keys. Why?",o:["Listing keys is a POST operation, which ReadOnly blocks","The ReadOnly lock deleted the storage account keys","Purge protection blocks key listing while a lock exists","The lock removed the app's RBAC role assignments"],a:0,e:"ReadOnly blocks write and POST actions such as listKeys."},
 {q:"A rogue admin must not be able to disable soft delete on backups alone. What should you configure?",o:["Multi-user authorization with a Resource Guard","An Azure Policy Audit assignment on the Recovery Services vault","A Conditional Access policy that requires MFA for backup admins","A user-assigned managed identity on the vault"],a:0,e:"MUA requires approval from a Resource Guard owner for critical operations."},
 {q:"Backups must be protected so recovery points can never be deleted early, and the setting itself can't be undone. What do you enable?",o:["Immutable vault, locked","Soft delete only","Cross-region restore","Geo-redundant storage"],a:0,e:"Locked immutability is irreversible."},
 {q:"Which built-in initiative is assigned by default when you enable Defender for Cloud?",o:["Microsoft cloud security benchmark","PCI DSS 4.0","ISO 27001:2022","NIST SP 800-171 Rev. 2 controls"],a:0,e:"MCSB is the default standard."},
 {q:"A team wants to block deletion of resources deployed by a Bicep deployment, even by Owners, outside the pipeline. What should they use?",o:["A deployment stack with deny settings","A role assignment condition","Azure Policy Audit","A tag"],a:0,e:"Deployment stacks can apply deny assignments to managed resources."},
 {q:"Which Zero Trust principle does PIM most directly support?",o:["Use least privilege","Verify explicitly","Assume breach","Encrypt everything"],a:0,e:"Just-in-time, just-enough access is least privilege."},
 {q:"Entra ID Protection marks a user high risk because their credentials appeared on the dark web. Which CA response is recommended?",o:["Require a secure password change with MFA","Block the user permanently and delete the account","Require terms of use","Do nothing"],a:0,e:"A user-risk policy requiring password change remediates leaked credentials."},
 {q:"You need to block legacy authentication tenant-wide. Which CA condition do you use?",o:["Client apps: Exchange ActiveSync and other clients","Device platforms: any device, with a grant control that blocks access","Sign-in risk: medium and high, with block access","Locations: all untrusted locations, with block access"],a:0,e:"Legacy auth clients appear under the client apps condition."},
 {q:"An app should get a token only for users in the HR group, and every other user should be refused at sign-in. Simplest fix?",o:["Set Assignment required on the enterprise app and assign HR","Remove the app's API permissions until HR members consent individually","Create a custom Azure role for HR","Disable user consent"],a:0,e:"Assignment required enforces who can get tokens for the app."},
 {q:"Which statement about workload identities is true?",o:["Conditional Access for workload identities can block service principals from untrusted locations","Workload identities can complete MFA with the Authenticator app when Conditional Access requires it","Managed identities need client secrets that you rotate","Service principal sign-ins never appear in the sign-in logs"],a:0,e:"Workload ID Premium adds CA for single-tenant service principals."}
];

/* ---------- custom diagrams ---------- */
function vizCaBuild(){
  const el=$("#viz-cabuild");const tried=new Set();
  const USERS={all:"All users",admins:"Directory roles: admins",guests:"Guests"},APPS={all:"All cloud apps",azure:"Azure management",m365:"Office 365"};
  const GR={block:"Block access",mfa:"Require MFA",phr:"Require phishing-resistant MFA",dev:"Require compliant device"};
  let u="admins",a="azure",g="phr",excl=true;
  const S=[["Dana","admin","Portal, from a hotel with Authenticator push","azure",{push:1}],["Lee","admin","Portal, with a FIDO2 security key","azure",{fido:1}],["Sam","user","Outlook, from a managed laptop","m365",{push:1,dev:1}],["Ava","guest","Teams, from a personal phone","m365",{push:1}],["Break-glass","bg","Portal, emergency account","azure",{fido:1}]];
  const inU=s=>s[1]==="bg"?(!excl&&u==="all"):u==="all"||u==="admins"&&s[1]==="admin"||u==="guests"&&s[1]==="guest";
  const inA=s=>a==="all"||a===s[3];
  const res=s=>{if(!(inU(s)&&inA(s)))return ["Not in scope","dim"];
    if(g==="block")return ["Blocked","no"];
    if(g==="mfa")return ["Allowed after MFA","ok"];
    if(g==="phr")return s[4].fido?["Allowed (passkey)","ok"]:["Blocked: method too weak","no"];
    return s[4].dev?["Allowed (compliant)","ok"]:["Blocked: unmanaged device","no"]};
  function draw(){tried.add(u+a+g);
    const locked=g==="block"&&u==="all"&&!excl;if(locked)flag("lockedout");
    el.innerHTML=`<div class="viz-title">Conditional Access policy builder</div>
    <div class="sel-row"><span>Users</span><div class="seg-row">${Object.keys(USERS).map(k=>`<button class="chip" data-u="${k}" aria-pressed="${k===u}">${USERS[k]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Exclude</span><div class="seg-row"><button class="chip" data-x="1" aria-pressed="${excl}">${excl?"✓ ":""}Break-glass account</button></div></div>
    <div class="sel-row"><span>Target apps</span><div class="seg-row">${Object.keys(APPS).map(k=>`<button class="chip" data-a="${k}" aria-pressed="${k===a}">${APPS[k]}</button>`).join("")}</div></div>
    <div class="sel-row"><span>Grant</span><div class="seg-row">${Object.keys(GR).map(k=>`<button class="chip" data-g="${k}" aria-pressed="${k===g}">${GR[k]}</button>`).join("")}</div></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Sign-in</th><th>Result</th></tr>${S.map(s=>{const r=res(s);return `<tr><td><b>${s[0]}</b> <span class="s-small">${s[2]}</span></td><td class="${r[1]}">${r[0]}</td></tr>`}).join("")}</table></div>
    <div class="caption" aria-live="polite">${locked?'<span class="status-bad">You just locked out every account, including the emergency one.</span> This is why every block policy excludes break-glass accounts and starts in report-only mode.':g==="phr"?"Authentication strength: push notifications are MFA, but only passkeys, Windows Hello and certificates count as phishing-resistant.":g==="block"?"Block wins over every other policy. Scope block policies tightly.":"Change the users, apps and grant to see who gets in."}</div>
    <div class="rv-prog s-small">${Math.min(tried.size,8)} of 8 policy combinations tried</div>`;
    if(tried.size>=8)award("viz:cabuild",30,"Built Conditional Access policies")}
  el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;if(d.u)u=d.u;if(d.a)a=d.a;if(d.g)g=d.g;if(d.x)excl=!excl;draw()});draw();
}
function vizPurge(){
  const el=$("#viz-purge");let pp=false,state="live",msg="",seen=new Set();
  function draw(){
    el.innerHTML=`<div class="viz-title">Key vault lifecycle: soft delete and purge protection</div>
    <div class="sel-row"><span>Purge protection</span><div class="seg-row"><button class="chip" data-p="0" aria-pressed="${!pp}" ${state!=="live"&&pp?"disabled":""}>Off</button><button class="chip" data-p="1" aria-pressed="${pp}">On</button></div></div>
    <div class="two-col"><div class="panel ${state==="live"?"good":state==="gone"?"bad":""}"><b>kv-contoso-prod</b><span class="s-small">${state==="live"?"Active · 14 secrets, 3 keys":state==="deleted"?"Soft-deleted · recoverable for 90 days":"Permanently purged"}</span></div>
    <div class="panel"><b>Actions</b><div class="dep-row"><button class="btn" data-a="del" ${state!=="live"?"disabled":""}>Delete vault</button><button class="btn" data-a="rec" ${state!=="deleted"?"disabled":""}>Recover</button><button class="btn" data-a="purge" ${state!=="deleted"?"disabled":""}>Purge</button><button class="btn" data-a="reset">Start over</button></div></div></div>
    <div class="caption" aria-live="polite">${msg||"Soft delete is always on. Try deleting, recovering and purging with purge protection off and on."}</div>
    <div class="rv-prog s-small">${seen.size} of 4 outcomes seen</div>`;
    if(seen.size>=4)award("viz:purge",30,"Tested soft delete and purge protection")}
  el.addEventListener("click",e=>{const p=e.target.closest("[data-p]"),a=e.target.closest("[data-a]")?.dataset.a;
    if(p){if(p.dataset.p==="1"){pp=true;msg="Purge protection is on. Note there's no way to switch it back off."}else if(!pp)msg="";else msg="<span class=\"status-bad\">Can't turn it off.</span> Once enabled, purge protection is permanent."}
    if(a==="del"){state="deleted";msg="Deleted. The vault and its objects stay in a soft-deleted state and the name stays reserved.";seen.add("del")}
    if(a==="rec"){state="live";msg="<span class=\"status-good\">Recovered</span> with every secret, key and access setting intact.";seen.add("rec")}
    if(a==="purge"){if(pp){msg="<span class=\"status-bad\">Purge blocked.</span> With purge protection, nobody can purge until the retention period ends, not even a subscription Owner. Your keys survive a rogue admin or ransomware actor.";seen.add("block");flag("purge")}else{state="gone";msg="<span class=\"status-bad\">Gone for good.</span> Anything encrypted with those keys is now unreadable. That's why services using customer-managed keys require purge protection.";seen.add("gone")}}
    if(a==="reset"){state="live";pp=false;msg=""}
    if(p||a)draw()});draw();
}
function vizScope(){
  const el=$("#viz-scope");const seen=new Set();
  const L=[["mg","Management group: Contoso"],["sub","Subscription: Prod"],["rg","Resource group: rg-payments"],["res","Key vault: kv-payments"]];
  let at="rg";
  function draw(){seen.add(at);const ix=L.findIndex(x=>x[0]===at);
    el.innerHTML=`<div class="viz-title">Where should the role assignment go?</div>
    <p class="s-small">Tap a level to assign <b>Contributor</b> to the Payments team there.</p>
    <div class="stp-flow">${L.map((x,i)=>`<button class="stp-n ${i>=ix?"on":""} ${i===ix?"cur":""}" data-s="${x[0]}" style="cursor:pointer"><span class="mono">${["MG","SUB","RG","RES"][i]}</span><b>${x[1]}</b></button>`).join("")}</div>
    <div class="caption" aria-live="polite">${["Assigned at the management group: every subscription under Contoso, including Dev and Test, inherits Contributor. Far too broad.","Assigned at the subscription: every resource group in Prod inherits it, including other teams' resources. Still too broad.","Assigned at rg-payments: the team manages exactly its own resources. Usually the right scope for a team.","Assigned on one key vault: the narrowest scope. Use it when a principal needs only one resource."][ix]}</div>
    <div class="rv-prog s-small">${seen.size} of 4 scopes tried</div>`;
    if(seen.size===4)award("viz:scope",20,"Explored role assignment scope")}
  el.addEventListener("click",e=>{const s=e.target.closest("[data-s]");if(s){at=s.dataset.s;draw()}});draw();
}
function vizLock(){
  const el=$("#viz-lock");const tried=new Set();let lock="none",last=null;
  const A=[["read","View settings",1],["tag","Add a tag",2],["keys","List access keys (POST)",2],["delete","Delete the account",3]];
  const LK={none:"No lock",del:"CanNotDelete",ro:"ReadOnly"};
  const ok=(k,a)=>k==="none"||a[2]===1||k==="del"&&a[2]===2;
  function draw(){
    el.innerHTML=`<div class="viz-title">Resource lock tester · you are an Owner of stpayments</div>
    <div class="sel-row"><span>Lock</span><div class="seg-row">${Object.keys(LK).map(k=>`<button class="chip" data-l="${k}" aria-pressed="${k===lock}">${LK[k]}</button>`).join("")}</div></div>
    <div class="viz-controls">${A.map(a=>`<button class="btn" data-a="${a[0]}">${a[1]}</button>`).join("")}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Action</th>${Object.keys(LK).map(k=>`<th class="${k===lock?"cur":""}">${LK[k]}</th>`).join("")}</tr>${A.map(a=>`<tr><td>${a[1]}</td>${Object.keys(LK).map(k=>`<td class="${tried.has(k+a[0])?(ok(k,a)?"ok":"no"):"dim"}">${tried.has(k+a[0])?(ok(k,a)?"✓ Allowed":"✗ Blocked"):"?"}</td>`).join("")}</tr>`).join("")}</table></div>
    <div class="caption" aria-live="polite">${last?(ok(lock,last)?`<span class="status-good">Allowed.</span>`:`<span class="status-bad">Blocked by the ${LK[lock]} lock.</span> Locks apply to everyone, Owners included.`)+(last[0]==="keys"&&lock==="ro"?" Listing keys is a POST action, so ReadOnly breaks apps that fetch keys.":""):"Pick a lock, then try each action."}</div>
    <div class="rv-prog s-small">${tried.size} of 12 combinations tried</div>`;
    if(tried.size>=10)award("viz:lock",30,"Tested every resource lock")}
  el.addEventListener("click",e=>{const l=e.target.closest("[data-l]"),a=e.target.closest("[data-a]");if(l){lock=l.dataset.l;last=null}
    if(a){last=A.find(x=>x[0]===a.dataset.a);tried.add(lock+last[0])}if(l||a)draw()});draw();
}

registerModule({
  id:"idn",slug:"identity",title:"Identity, Access and Governance",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:(]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["ztsort","ids","methods","mfaq","cabuild","caq","pimflow","pimq","appobj","oauthflow","permsort","consentq","miflow","misort","purge","kvroles","scope","roleq","effects","lock","backup"],
  viz(){
sortViz($("#viz-ztsort"),{title:"Which Zero Trust principle is it?",bins:{v:"Verify explicitly",l:"Use least privilege",b:"Assume breach"},done:"Sorted every Zero Trust control",
  items:[["Require MFA and a compliant device for every sign-in","v","Authenticate on every available signal."],["Evaluate sign-in risk on each request","v","Risk is a signal to verify."],["Make admins eligible in PIM instead of permanent","l","Just-in-time access."],["Assign a role at a resource group instead of the subscription","l","Just-enough scope."],["Segment networks with NSGs and private endpoints","b","Limit blast radius."],["Stream every log to Sentinel","b","Assume an attacker is inside and watch."],["Encrypt data end to end","b","Stolen data stays useless."],["Use a custom role with only the actions needed","l","Just-enough permissions."]]});
revealViz($("#viz-ids"),{title:"Identities you'll secure in Entra ID",cols:3,done:"Explored every identity type",items:[
  ["Member user","Employee","Signs in with your tenant's credentials. Protect with MFA and CA.","def"],["Guest user","B2B","An external person invited to collaborate. Govern with access reviews and cross-tenant access settings.","vio"],["Security group","Access","Assign roles and apps to groups, not individuals. Can be role-assignable for Entra roles.","def"],
  ["Service principal","Workload","An app's identity in your tenant. Protect credentials and limit permissions.","vio"],["Managed identity","Workload","A service principal Azure manages for a resource. No secrets to leak.","def"],["Agent identity","AI agent","Entra Agent ID gives agents an identity you can target with Conditional Access and govern.","vio"]]});
sortViz($("#viz-methods"),{title:"Is this method phishing-resistant?",bins:{y:"Phishing-resistant",n:"MFA, but not phishing-resistant",x:"Not MFA"},done:"Classified every authentication method",
  items:[["FIDO2 security key","y","Bound to the real site's origin."],["Passkey in Microsoft Authenticator","y","A device-bound FIDO2 credential."],["Windows Hello for Business","y","Key pair bound to the device."],["Certificate-based authentication","y","Certificate proof can't be replayed."],["Authenticator push with number matching","n","Stops fatigue, but a proxy page can still relay it."],["SMS code","n","Interceptable and vulnerable to SIM swap."],["Hardware OATH token","n","A code can be typed into a fake page."],["Password only","x","One factor."],["Password plus security questions","x","Two things you know are still one factor type."]]});
quizViz($("#viz-mfaq"),{title:"Authentication scenarios",done:"Solved every authentication scenario",qs:[
  ["A brand-new user must set up a passkey on day one without a password.",["Issue a Temporary Access Pass","Send an SMS code","Give them a shared password"],0,"TAP is built for passwordless onboarding."],
  ["A small business with no P1 licenses wants baseline MFA for everyone.",["Security defaults","Conditional Access","PIM"],0,"Security defaults are free."],
  ["Block passwords like Contoso2026! everywhere, including on-premises AD.",["Entra password protection with a custom banned list","Smart lockout","SSPR"],0,"Password protection works in the cloud and, with an agent, on-premises."],
  ["Admins must use phishing-resistant sign-in for the Azure portal.",["CA policy with authentication strength: phishing-resistant MFA","Turn on number matching","Require password change"],0,"Authentication strengths target specific methods."]]});
vizCaBuild();
quizViz($("#viz-caq"),{title:"Conditional Access calls",done:"Made every Conditional Access call",qs:[
  ["Two matching policies: one requires MFA, one requires a compliant device.",["The user must satisfy both","Only the first applies","The user picks one"],0,"All matching grant requirements apply."],
  ["Block sign-ins from countries where you have no staff.",["Named location (countries) with Block","Sign-in frequency","Terms of use"],0,"Locations condition plus Block."],
  ["Revoke a user's access within minutes after they're disabled.",["Continuous access evaluation","Persistent browser session","Report-only"],0,"CAE reacts to critical events in near real time."],
  ["High sign-in risk should require MFA.",["Sign-in risk condition (P2) with Require MFA","Device platform condition","Client apps condition"],0,"ID Protection risk feeds CA."]]});
stepViz($("#viz-pimflow"),{title:"Activating an eligible role in PIM",done:"Walked through a PIM activation",steps:[
  ["Eligible","Dana is eligible for the Security Administrator role. Right now she has no admin rights at all."],
  ["Request","She opens My roles in PIM, picks the role and asks for 2 hours. The max allowed in the role setting is 4."],
  ["Verify","PIM requires MFA (or an authentication context with phishing-resistant MFA) and a justification with a ticket number."],
  ["Approve","The role requires approval, so the approvers group gets an email and approves in the portal."],
  ["Active","The role is active for 2 hours. Every action is logged, and the activation appears in the PIM audit history."],
  ["Expire","After 2 hours the role deactivates on its own. No standing access is left behind."]]});
quizViz($("#viz-pimq"),{title:"PIM settings",done:"Configured PIM like an engineer",qs:[
  ["Contractors should have Contributor only until their contract ends on June 30.",["Time-bound eligible assignment ending June 30","Permanent active assignment","A CA policy"],0,"Assignments can expire automatically."],
  ["You're alerted that Global Administrator was assigned directly in Entra ID, not through PIM.",["PIM alert: roles assigned outside PIM","Access review","ID Protection risk"],0,"PIM raises alerts for assignments made outside it."],
  ["Activation of Owner must require phishing-resistant MFA.",["Require an authentication context in the role setting, tied to a CA policy","Turn on number matching","Use a ReadOnly lock"],0,"Authentication context links PIM activation to a CA policy."]]});
revealViz($("#viz-appobj"),{title:"App registration vs enterprise application",cols:2,done:"Compared the two app objects",items:[
  ["App registration","Application object","Lives in the home tenant. Holds client ID, redirect URIs, credentials, API permissions requested, exposed scopes and app roles.","def"],
  ["Enterprise application","Service principal","Lives in every tenant using the app. Holds user and group assignments, consent grants, sign-in logs and Conditional Access targeting.","vio"],
  ["Multitenant app","1 + N","One application object in the publisher's tenant, one service principal in each customer tenant.","def"],
  ["Managed identity","Special service principal","Shows under Enterprise applications (filter: managed identities). No app registration, no credentials you can see.","vio"]]});
seqViz($("#viz-oauthflow"),{title:"OAuth 2.0 authorization code flow with consent",left:"Web app",right:"Microsoft Entra ID",intro:"A web app wants to read the signed-in user's calendar through Microsoft Graph. Step through the flow.",
  steps:[{dir:"r",label:"Redirect user to /authorize",sub:"client_id, scope=Calendars.Read"},{dir:"l",label:"User signs in, sees consent prompt",sub:"Delegated permission, user-consentable",text:"Entra ID authenticates the user (and applies Conditional Access), then asks the user to consent to Calendars.Read if no one has yet.",dash:true},{dir:"l",label:"Authorization code returned",sub:"to the redirect URI",text:"The code goes only to a registered redirect URI. That's why redirect URIs matter for security."},{dir:"r",label:"Exchange code for tokens",sub:"with certificate or secret",text:"The app proves who it is with its credential and receives an access token scoped to Calendars.Read."},{dir:"l",label:"Access token issued",sub:"aud=Graph, scp=Calendars.Read",text:"The app calls Graph with this token. It can read only what the user can read, and only calendars."}].map(s=>({...s,text:s.text||"The browser takes the user to Entra ID with the app's client ID and the requested scope."})),
  end:"Consent was recorded as a delegated permission grant on the enterprise application, where admins can review or revoke it."});
sortViz($("#viz-permsort"),{title:"Delegated or application permission?",bins:{d:"Delegated (user present)",a:"Application (no user)"},done:"Sorted every permission scenario",
  items:[["A mobile app shows the signed-in user's OneDrive files","d","Acts on behalf of the user."],["A nightly job exports every user's sign-in logs","a","No signed-in user."],["A web app sends mail as the signed-in user","d","On behalf of the user."],["A daemon that provisions Teams for every new project","a","Runs as itself."],["A SharePoint add-in that reads a site the user opens","d","User context."],["A backup service reading all mailboxes","a","Tenant-wide, no user, needs admin consent."]]});
quizViz($("#viz-consentq"),{title:"Consent decisions",done:"Made every consent decision",qs:[
  ["A Graph application permission like Mail.Read (application) is requested.",["Admin consent is required","Any user can consent","No consent needed"],0,"Application permissions always need admin consent."],
  ["Users should be able to consent only to low-risk apps from known vendors.",["Allow user consent for verified publishers, low-impact permissions","Allow user consent for all apps","Do not allow user consent"],0,"The recommended middle setting."],
  ["Hundreds of users consented to a suspicious app requesting Mail.ReadWrite.",["Revoke the grants and disable the enterprise app, then investigate","Delete the users","Add a CanNotDelete lock"],0,"Classic illicit consent grant response."]]});
seqViz($("#viz-miflow"),{title:"A VM reads a Key Vault secret with its managed identity",left:"VM (app code)",right:"Azure services",intro:"No secrets in code. Step through how the VM gets in.",
  steps:[{dir:"r",label:"GET token from IMDS 169.254.169.254",sub:"resource=https://vault.azure.net",text:"The app asks the local Instance Metadata Service for a token. Only code on this VM can reach this endpoint."},{dir:"l",label:"Entra access token for the identity",sub:"issued and rotated by Azure",text:"Azure issues a token for the VM's managed identity. There's no credential for anyone to steal from the VM's disk."},{dir:"r",label:"GET /secrets/sql-conn with Bearer token",sub:"to kv-payments",text:"The app presents the token to Key Vault."},{dir:"l",label:"Key Vault checks RBAC: Secrets User? Yes",sub:"returns the secret value",text:"Key Vault checks the role assignment on the vault. Without Key Vault Secrets User, it would return 403 Forbidden."}],
  end:"Enabling the identity is step one. The role assignment on the target is what actually grants access."});
sortViz($("#viz-misort"),{title:"System-assigned or user-assigned?",bins:{s:"System-assigned",u:"User-assigned"},done:"Picked the right identity type every time",
  items:[["One function app needs to read one storage account","s","Single resource, same lifecycle."],["A VM scale set with instances that come and go","u","One identity shared across instances."],["Access must be granted before the resource is deployed","u","Create the identity and its roles first."],["The identity should disappear when the resource is deleted","s","Lifecycle tied to the resource."],["Ten web apps need identical permissions to a vault","u","Assign once, attach to many."]]});
vizPurge();
sortViz($("#viz-kvroles"),{title:"Pick the least-privileged Key Vault role",bins:{su:"Key Vault Secrets User",so:"Key Vault Secrets Officer",cs:"Crypto Service Encryption User",co:"Key Vault Crypto Officer"},done:"Picked the right vault role every time",
  items:[["An app reads a connection string at startup","su","Read secret contents only."],["A DevOps pipeline creates and updates secrets","so","Manage secrets."],["Azure SQL TDE uses a customer-managed key","cs","Wrap and unwrap the key."],["A storage account encrypts with your key","cs","Services use this role for CMK."],["A security admin creates keys and sets rotation policies","co","Manage keys."],["A function reads an API key it calls","su","Read only."]]});
vizScope();
quizViz($("#viz-roleq"),{title:"Pick the role",done:"Picked the right role every time",qs:[
  ["Manage VMs in one resource group but not grant access.",["Virtual Machine Contributor at the resource group","Owner at the subscription","User Access Administrator"],0,"Narrow role, narrow scope."],
  ["Read blobs using Entra auth.",["Storage Blob Data Reader","Reader","Storage Account Contributor"],0,"Data-plane access needs a data role."],
  ["Restart VMs only, nothing else.",["Custom role with Microsoft.Compute/virtualMachines/restart/action","Contributor","Virtual Machine Contributor"],0,"Custom roles fit when no built-in role is narrow enough."],
  ["Reset passwords for a subset of users.",["Helpdesk Administrator scoped to an administrative unit","User Access Administrator","Owner"],0,"Entra role, scoped to an AU."]]});
sortViz($("#viz-effects"),{title:"Which Azure Policy effect?",bins:{deny:"Deny",audit:"Audit",dine:"DeployIfNotExists",mod:"Modify"},done:"Matched every policy effect",
  items:[["Block creating VMs outside East US and West US","deny","Stop the request."],["Report VMs without backup, without changing anything","audit","Log non-compliance."],["Deploy the Log Analytics agent config if missing","dine","Deploy the missing related resource."],["Add an env tag copied from the resource group","mod","Change properties or tags."],["Block storage accounts that allow public blob access","deny","Prevent the misconfiguration."],["Enable diagnostic settings on new key vaults","dine","Deploy the setting."],["Turn off public network access on new SQL servers automatically","mod","Modify can change supported properties."]]});
vizLock();
revealViz($("#viz-backup"),{title:"Azure Backup security features",cols:3,done:"Explored every backup security feature",items:[
  ["Soft delete","Undo","Deleted backup data is kept for 14+ days. Enable always-on soft delete so it can't be turned off.","def"],["Immutable vault","No early deletes","Blocks operations that could lose recovery points. Locked mode is irreversible.","vio"],["Multi-user authorization","Two-person rule","A Resource Guard in another subscription or tenant must approve critical changes.","def"],
  ["CMK encryption","Your keys","Encrypt backup data with keys in Key Vault or Managed HSM.","vio"],["Private endpoints","Network","Back up and restore over private IPs.","def"],["Security alerts","Monitoring","Built-in alerts for critical operations, plus Defender for Cloud integration.","vio"]]});
  },
  sims:[
    {id:"casim",type:"choice",title:"Roll out Conditional Access safely",
      scenario:"Contoso is replacing security defaults with Conditional Access for 3,000 users. You're the security engineer.",
      steps:[
        ["What do you create before any blocking policy?",["Two cloud-only break-glass accounts, excluded from CA and monitored","A guest account","A new tenant"],0,"Emergency access protects you from lockout."],
        ["What happens to security defaults?",["Disable them when the CA policies are ready","Keep both on","Enable per-user MFA too"],0,"They can't run together."],
        ["How do you deploy the new 'Require MFA for all users' policy first?",["Report-only, then review sign-in logs and What If","Enabled immediately","Disabled"],0,"See the impact before enforcing."],
        ["Admins need stronger protection for the Azure portal. Which grant?",["Authentication strength: phishing-resistant MFA","Require password change","Terms of use"],0,"Phishing-resistant for privileged access."],
        ["Old mail clients still use basic authentication. What do you add?",["Block legacy authentication via the client apps condition","Allow them from named locations","Sign-in frequency"],0,"Legacy auth can't do MFA."],
        ["High-risk users (leaked credentials) should be fixed automatically. Which control?",["User risk high: require secure password change","Block all users","Require compliant device"],0,"User risk policy remediates compromised credentials."]],
      success:"Contoso is on Conditional Access with no lockouts and stronger admin protection."},
    {id:"pimsim",type:"check",title:"Harden privileged access",
      scenario:"An audit found 9 permanent Global Administrators and 22 permanent subscription Owners. Select every change that follows least privilege.",
      opts:[["Convert admins to PIM eligible assignments",1],["Require approval to activate Global Administrator",1],["Require MFA or an authentication context on activation",1],["Set a maximum activation of a few hours",1],["Run access reviews on privileged roles",1],["Keep two permanent break-glass Global Administrators",1],["Give every admin permanent Owner so they never wait",0],["Remove MFA for admins to speed up activation",0],["Assign roles directly instead of through PIM",0]],
      success:"Standing privilege is gone, and every activation is verified, approved and logged."},
    {id:"appsim",type:"match",title:"Wire up app identities",
      scenario:"Match each requirement to the identity setup that fits it.",
      items:[["System-assigned managed identity","sys"],["User-assigned managed identity","usr"],["Federated identity credential","fed"],["Application permission with admin consent","app"],["Delegated permission","del"]],
      slots:[["sys","Single function app","Read one storage account; identity should be deleted with the app"],["usr","Scale set","Many instances share one identity with access granted in advance"],["fed","GitHub Actions","Deploy to Azure with no secret stored in GitHub"],["app","Nightly export job","Read every user's sign-in activity, no user signed in"],["del","Calendar web app","Show the signed-in user's meetings"]],
      success:"Every workload has an identity and no secrets are sitting in code."},
    {id:"kvsim",type:"choice",title:"Lock down the payments key vault",
      scenario:"kv-payments holds the customer-managed key for the payments database and several secrets. Make it production-ready.",
      steps:[
        ["Which permission model should the vault use?",["Azure RBAC","Vault access policies","Shared access signatures"],0,"RBAC prevents Contributors from granting themselves data access."],
        ["The database encrypts with a key in this vault. What must be on?",["Purge protection","Public network access","Access policies"],0,"CMK scenarios require purge protection so keys can't be destroyed."],
        ["Only the app VNet should reach the vault.",["Disable public access and create a private endpoint","Allow all networks","Add the subscription to the firewall"],0,"Private endpoint keeps traffic private."],
        ["The app needs to read secrets. Which role for its managed identity?",["Key Vault Secrets User","Key Vault Administrator","Owner"],0,"Least privilege for reading secrets."],
        ["Keys must rotate yearly with no human action.",["Key rotation policy","A calendar reminder","A ReadOnly lock"],0,"Rotation policies automate it."],
        ["You want alerts on unusual access, like from a Tor exit node.",["Enable Microsoft Defender for Key Vault","Enable soft delete","Enable diagnostic logs only"],0,"Defender for Key Vault detects anomalous access."]],
      success:"The vault is private, least-privileged, rotation-ready and monitored."},
    {id:"govsim",type:"match",title:"Enforce the security baseline",
      scenario:"Match each requirement to the right governance control.",
      items:[["Azure Policy: Deny","deny"],["Azure Policy: DeployIfNotExists","dine"],["CanNotDelete lock","lock"],["Multi-user authorization","mua"],["Regulatory compliance standard","std"]],
      slots:[["deny","Storage","Nobody can create a storage account without secure transfer"],["dine","Logging","Every new SQL server gets auditing enabled automatically"],["lock","Production DNS","The zone can be edited but never deleted by accident"],["mua","Backup vault","Disabling soft delete needs a second person's approval"],["std","Audit team","Track compliance with PCI DSS controls in a dashboard"]],
      success:"The baseline is enforced, not just documented."}
  ],
  badges:[
    ["reader","ID","Identity Scholar","Mark all 10 identity and governance lessons studied",c=>c.allStudied()],
    ["lab","IL","Identity Lab","Complete all 21 diagrams in this module",c=>c.vizAll()],
    ["ca","CA","Policy Architect","Build 8 Conditional Access policies in the policy builder",c=>c.earned("viz:cabuild")],
    ["purge","KV","Key Guardian","See every outcome in the key vault lifecycle diagram",c=>c.earned("viz:purge")],
    ["casim","RO","Safe Rollout","Pass the Conditional Access rollout simulation",c=>c.passed("casim")],
    ["pimsim","JT","Just in Time","Pass the privileged access simulation",c=>c.passed("pimsim")],
    ["appsim","WI","Workload Wrangler","Pass the app identity simulation",c=>c.passed("appsim")],
    ["kvsim","VL","Vault Locksmith","Pass the key vault simulation",c=>c.passed("kvsim")],
    ["govsim","GV","Governor","Pass the governance simulation",c=>c.passed("govsim")],
    ["perfect","ZT","Zero Trust Hero","Score 100% on an identity quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
