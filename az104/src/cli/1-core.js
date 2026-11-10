/* ================= Azure CLI simulator: world model, parser, output =================
   A small, honest model of an Azure subscription. Commands mutate the world and print what the real
   Azure CLI prints (trimmed). Labs check the world, not the text you typed, so any valid route passes. */
(function(){
const AZ=window.AZ={};
const SUBID="3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c",SUB2="8b1d4c7e-2f3a-4b5c-9d8e-0a1b2c3d4e5f",TENANT="72f988bf-86f1-41af-91ab-2d7cd011db47";
AZ.SUBID=SUBID;
const LOCS=["eastus","eastus2","westus","westus2","westus3","centralus","northcentralus","southcentralus","canadacentral","westeurope","northeurope","uksouth","ukwest","francecentral","germanywestcentral","swedencentral","japaneast","australiaeast","southeastasia","brazilsouth","centralindia","koreacentral"];
const PAIR={eastus:"westus",westus:"eastus",eastus2:"centralus",centralus:"eastus2",westus2:"westcentralus",westus3:"eastus",northcentralus:"southcentralus",southcentralus:"northcentralus",westeurope:"northeurope",northeurope:"westeurope",uksouth:"ukwest",ukwest:"uksouth",francecentral:"francesouth",germanywestcentral:"germanynorth",japaneast:"japanwest",australiaeast:"australiasoutheast",southeastasia:"eastasia",brazilsouth:"southcentralus",canadacentral:"canadaeast",centralindia:"southindia",koreacentral:"koreasouth",swedencentral:"swedensouth"};
AZ.LOCS=LOCS;AZ.PAIR=PAIR;
const T={vnet:"Microsoft.Network/virtualNetworks",nsg:"Microsoft.Network/networkSecurityGroups",asg:"Microsoft.Network/applicationSecurityGroups",pip:"Microsoft.Network/publicIPAddresses",nic:"Microsoft.Network/networkInterfaces",
  vm:"Microsoft.Compute/virtualMachines",disk:"Microsoft.Compute/disks",avset:"Microsoft.Compute/availabilitySets",vmss:"Microsoft.Compute/virtualMachineScaleSets",
  sa:"Microsoft.Storage/storageAccounts",plan:"Microsoft.Web/serverFarms",web:"Microsoft.Web/sites",acr:"Microsoft.ContainerRegistry/registries",aci:"Microsoft.ContainerInstance/containerGroups",
  cae:"Microsoft.App/managedEnvironments",ca:"Microsoft.App/containerApps",lb:"Microsoft.Network/loadBalancers",rt:"Microsoft.Network/routeTables",bas:"Microsoft.Network/bastionHosts",
  pe:"Microsoft.Network/privateEndpoints",dns:"Microsoft.Network/dnszones",pdns:"Microsoft.Network/privateDnsZones",rsv:"Microsoft.RecoveryServices/vaults",
  ag:"Microsoft.Insights/actionGroups",alert:"Microsoft.Insights/metricAlerts",aalert:"Microsoft.Insights/activityLogAlerts",law:"Microsoft.OperationalInsights/workspaces",kv:"Microsoft.KeyVault/vaults",as:"Microsoft.Insights/autoscaleSettings"};
AZ.T=T;
const TL={vnet:"Virtual network",nsg:"Network security group",asg:"Application security group",pip:"Public IP address",nic:"Network interface",vm:"Virtual machine",disk:"Disk",avset:"Availability set",vmss:"VM scale set",sa:"Storage account",plan:"App Service plan",web:"App Service",acr:"Container registry",aci:"Container instance",cae:"Container Apps environment",ca:"Container app",lb:"Load balancer",rt:"Route table",bas:"Bastion",pe:"Private endpoint",dns:"DNS zone",pdns:"Private DNS zone",rsv:"Recovery Services vault",ag:"Action group",alert:"Metric alert rule",aalert:"Activity log alert",law:"Log Analytics workspace",kv:"Key vault",as:"Autoscale setting"};
AZ.TL=TL;

/* ---------- small utilities ---------- */
const lc=s=>String(s==null?"":s).toLowerCase();
const hex=n=>{let s="";for(let i=0;i<n;i++)s+="0123456789abcdef"[Math.floor(Math.random()*16)];return s};
const guid=()=>`${hex(8)}-${hex(4)}-4${hex(3)}-${"89ab"[Math.floor(Math.random()*4)]}${hex(3)}-${hex(12)}`;
AZ.guid=guid;AZ.hex=hex;
function ip2n(s){const p=String(s).split(".").map(Number);if(p.length!==4||p.some(x=>!(x>=0&&x<=255)||isNaN(x)))return null;return ((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3]}
function n2ip(n){return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join(".")}
function cidr(s){const m=/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/.exec(String(s).trim());if(!m)return null;const len=+m[2];if(len>32)return null;const ip=ip2n(m[1]);if(ip===null)return null;const mask=len===0?0:(0xffffffff<<(32-len))>>>0;return {base:(ip&mask)>>>0,len,mask,ip,ok:((ip&mask)>>>0)===ip,size:2**(32-len)}}
const inC=(ipn,c)=>((ipn&c.mask)>>>0)===c.base;
const overlap=(a,b)=>{const l=Math.min(a.len,b.len),m=l===0?0:(0xffffffff<<(32-l))>>>0;return ((a.base&m)>>>0)===((b.base&m)>>>0)};
const within=(inner,outer)=>inner.len>=outer.len&&inC(inner.base,outer);
AZ.ip2n=ip2n;AZ.n2ip=n2ip;AZ.cidr=cidr;AZ.overlap=overlap;AZ.within=within;AZ.inC=inC;
const isPrivate=n=>inC(n,cidr("10.0.0.0/8"))||inC(n,cidr("172.16.0.0/12"))||inC(n,cidr("192.168.0.0/16"));
AZ.isPrivate=isPrivate;

/* ---------- errors ---------- */
class AzErr extends Error{constructor(t){super(t);this.az=true}}
AZ.Err=AzErr;
const E=(code,msg)=>{throw new AzErr(`(${code}) ${msg}\nCode: ${code}\nMessage: ${msg}`)};
const U=msg=>{throw new AzErr("ERROR: "+msg)};
AZ.E=E;AZ.U=U;

/* ---------- world ---------- */
AZ.world=function(lab){
  const w={subs:[{name:"Contoso-Prod",id:SUBID},{name:"Contoso-Dev",id:SUB2}],sub:SUBID,mgs:{},rgs:{},res:[],users:[],groups:[],roles:[],customRoles:[],pols:[],locks:[],budgets:[],
    files:JSON.parse(JSON.stringify(lab&&lab.filesData||{})),tpl:Object.assign({},lab&&lab.files||{}),deploys:[],jobs:[],vars:{},
    taken:new Set(["storage","contoso","data","backup","test","mystorageaccount","files","myapp","webapp","contosoweb","registry","contosoacr"]),
    domains:["contoso.onmicrosoft.com","contoso.com"],me:"admin@contoso.onmicrosoft.com",seq:4,ipSeq:12,flags:{}};
  w.users.push({displayName:"Azure Admin",userPrincipalName:w.me,id:guid(),accountEnabled:true,userType:"Member"});
  w.roles.push({principal:w.me,role:"Owner",scope:"/subscriptions/"+SUBID,id:guid()});
  return w;
};
const subOf=w=>w.subs.find(s=>s.id===w.sub);
AZ.subOf=subOf;
const rgId=(w,rg)=>`/subscriptions/${w.sub}/resourceGroups/${rg}`;
AZ.rgId=rgId;
const rid=r=>`/subscriptions/${SUBID}/resourceGroups/${r.rg}/providers/${T[r.t]}/${r.name}`;
AZ.rid=rid;
AZ.getRg=(w,name)=>{const k=Object.keys(w.rgs).find(k=>lc(k)===lc(name));return k?w.rgs[k]:null};
AZ.needRg=(w,name)=>{if(!name)U("the following arguments are required: --resource-group/-g");const r=AZ.getRg(w,name);if(!r)E("ResourceGroupNotFound",`Resource group '${name}' could not be found.`);return r};
AZ.get=(w,t,name,rg)=>w.res.find(r=>r.t===t&&lc(r.name)===lc(name)&&(!rg||lc(r.rg)===lc(rg)));
AZ.all=(w,t,rg)=>w.res.filter(r=>r.t===t&&(!rg||lc(r.rg)===lc(rg)));
AZ.need=(w,t,name,rg)=>{const r=AZ.get(w,t,name,rg);if(!r)E("ResourceNotFound",`The Resource '${T[t]}/${name}' under resource group '${rg||"?"}' was not found.`);return r};
/* resolve a name or a full resource ID */
AZ.resolve=(w,ref,t,rg)=>{if(!ref)return null;ref=String(ref);if(ref.startsWith("/")){const p=ref.split("/");const name=p[p.length-1],rgn=p[4];const type=Object.keys(T).find(k=>lc(ref).includes(lc(T[k])+"/"));return w.res.find(r=>(!t||r.t===t)&&(!type||r.t===type)&&lc(r.name)===lc(name)&&lc(r.rg)===lc(rgn))||null}
  return w.res.find(r=>(!t||r.t===t)&&lc(r.name)===lc(ref)&&(!rg||lc(r.rg)===lc(rg)))||w.res.find(r=>(!t||r.t===t)&&lc(r.name)===lc(ref))||null};

/* management group that holds a subscription, walking up to the root */
function mgChain(w,subId){const out=[];let mg=Object.values(w.mgs).find(m=>m.subs.includes(subId));while(mg){out.push(mg);mg=mg.parent?w.mgs[mg.parent]:null}return out}
AZ.mgChain=mgChain;
/* scopes that cover a resource, broadest first */
AZ.scopesFor=(w,rg,res)=>{const s=[...mgChain(w,w.sub).reverse().map(m=>"/providers/Microsoft.Management/managementGroups/"+m.name),"/subscriptions/"+w.sub];if(rg)s.push(rgId(w,rg));if(res)s.push(rid(res));return s};
AZ.normScope=(w,s)=>{if(!s)return null;s=String(s).replace(/\/+$/,"");return s};

/* ---------- locks ---------- */
AZ.lockCheck=(w,rg,op,res)=>{const sc=AZ.scopesFor(w,rg,res).map(lc);const hit=w.locks.filter(l=>sc.includes(lc(l.scope))&&(l.level==="ReadOnly"||op==="delete"));
  if(hit.length){if(op==="delete")w.flags.lockedout=1;const target=res?rid(res):rg?rgId(w,rg):"/subscriptions/"+w.sub;
    E("ScopeLocked",`The scope '${target}' cannot perform ${op==="action"?"write":op} operation because following scope(s) are locked: '${hit.map(l=>l.scope).join("', '")}'. Please remove the lock and try again.`)}};

/* ---------- Azure Policy ---------- */
const POL={
  "e56962a6-4747-49cd-b67b-bf8b01975c4c":{dn:"Allowed locations",eff:"Deny",p:"listOfAllowedLocations",test:(x,p)=>x.isRg||!x.loc||x.loc==="global"||(p.listOfAllowedLocations||[]).map(lc).includes(lc(x.loc))},
  "e765b5de-1225-4ba3-bd56-1ac6695af988":{dn:"Allowed locations for resource groups",eff:"Deny",p:"listOfAllowedLocations",test:(x,p)=>!x.isRg||(p.listOfAllowedLocations||[]).map(lc).includes(lc(x.loc))},
  "871b6d14-10aa-478d-b590-94f262ecfa99":{dn:"Require a tag on resources",eff:"Deny",p:"tagName",test:(x,p)=>x.isRg||Object.keys(x.tags||{}).map(lc).includes(lc(p.tagName))},
  "96670d01-0a4d-4649-9c89-2d3abc0a5025":{dn:"Require a tag on resource groups",eff:"Deny",p:"tagName",test:(x,p)=>!x.isRg||Object.keys(x.tags||{}).map(lc).includes(lc(p.tagName))},
  "cccc23c7-8427-4f53-ad12-b6a63eb452b3":{dn:"Allowed virtual machine size SKUs",eff:"Deny",p:"listOfAllowedSKUs",test:(x,p)=>!(x.t==="vm"||x.t==="vmss")||(p.listOfAllowedSKUs||[]).map(lc).includes(lc(x.sku))},
  "6c112d4e-5bc7-47ae-a041-ea2d9dccd749":{dn:"Not allowed resource types",eff:"Deny",p:"listOfResourceTypesNotAllowed",test:(x,p)=>x.isRg||!(p.listOfResourceTypesNotAllowed||[]).map(lc).includes(lc(T[x.t]))},
  "ea3f2387-9b95-492a-a190-fcdc54f7b070":{dn:"Inherit a tag from the resource group if missing",eff:"Modify",p:"tagName",test:()=>true},
  "404c3081-a854-4457-ae30-26a93ef643f9":{dn:"Secure transfer to storage accounts should be enabled",eff:"Audit",test:x=>x.t!=="sa"||x.https!==false},
  "34c877ad-507e-4c82-993e-3452a6e0ad3c":{dn:"Storage accounts should restrict network access",eff:"Audit",test:x=>x.t!=="sa"||x.defaultAction==="Deny"}
};
AZ.POL=POL;
AZ.polFind=ref=>{ref=String(ref||"").replace(/^.*\/policyDefinitions\//,"");return Object.keys(POL).find(k=>k===lc(ref)||lc(POL[k].dn)===lc(ref))};
/* x={t,isRg,name,loc,tags,sku,rg} ; throws on Deny, applies Modify, returns audit results */
AZ.policyCheck=(w,x)=>{const sc=AZ.scopesFor(w,x.isRg?null:x.rg).map(lc);if(x.isRg)sc.push(lc(rgId(w,x.name)));
  const asg=w.pols.filter(a=>sc.includes(lc(a.scope))&&!(a.notScopes||[]).some(n=>sc.includes(lc(n))||(x.rg&&lc(n)===lc(rgId(w,x.rg)))));
  asg.forEach(a=>{const d=POL[a.def];if(d.eff==="Modify"&&!x.isRg&&x.rg){const g=AZ.getRg(w,x.rg);const tn=a.params.tagName;if(g&&g.tags&&g.tags[tn]!=null&&!(tn in (x.tags||{}))){x.tags=Object.assign({},x.tags,{[tn]:g.tags[tn]});x.modified=(x.modified||[]).concat(tn)}}});
  const deny=asg.filter(a=>POL[a.def].eff==="Deny"&&!POL[a.def].test(x,a.params));
  if(deny.length){w.flags.denied=1;E("RequestDisallowedByPolicy",`Resource '${x.name}' was disallowed by policy. Reasons: '${deny.map(a=>POL[a.def].dn).join("', '")}'. Policy assignment: '${deny.map(a=>a.name).join("', '")}' at scope '${deny[0].scope}'.`)}
  return x};
AZ.compliance=(w,r)=>{const sc=AZ.scopesFor(w,r.rg).map(lc);return w.pols.filter(a=>sc.includes(lc(a.scope))&&POL[a.def].eff!=="Modify").map(a=>{const d=POL[a.def];const x={t:r.t,name:r.name,loc:r.loc,tags:r.tags,sku:r.p.size||r.p.sku,https:r.p.https,defaultAction:r.p.defaultAction};return {a,ok:d.test(x,a.params)}})};

/* ---------- resource creation ---------- */
AZ.mk=(w,t,rg,name,loc,p,tags,opts)=>{const g=AZ.getRg(w,rg);
  const x=AZ.policyCheck(w,{t,rg:g?g.name:rg,name,loc:loc||(g&&g.loc),tags:Object.assign({},tags||{}),sku:p&&(p.size||p.sku)});
  const old=AZ.get(w,t,name,rg);if(old){if(!(opts&&opts.quiet))AZ.lockCheck(w,old.rg,"write",old);Object.assign(old.p,p||{});old.tags=Object.assign(old.tags||{},x.tags);return old}
  if(g&&!(opts&&opts.nolock))AZ.lockCheck(w,g.name,"write");
  const r={t,rg:g?g.name:rg,name,loc:x.loc,tags:x.tags,p:p||{},created:Date.now()};w.res.push(r);return r};
AZ.rmRes=(w,r)=>{w.res=w.res.filter(x=>x!==r)};
AZ.newIp=w=>{w.ipSeq++;return `20.${(w.ipSeq*7)%200+20}.${(w.ipSeq*13)%250}.${(w.ipSeq*29)%250+2}`};

/* ---------- tokenizer and argument parser ---------- */
AZ.tokens=line=>{const out=[];let cur="",q=null,any=false;for(let i=0;i<line.length;i++){const ch=line[i];
  if(q){if(ch===q){q=null}else if(ch==="\\"&&q==='"'&&line[i+1]==='"'){cur+='"';i++}else cur+=ch;continue}
  if(ch==='"'||ch==="'"){q=ch;any=true;continue}
  if(/\s/.test(ch)){if(cur||any)out.push(cur);cur="";any=false;continue}
  if(ch==="\\"&&line[i+1]===" "){cur+=" ";i++;continue}
  cur+=ch}
  if(q)return {err:"unterminated quote"};if(cur||any)out.push(cur);return out};
const GLOBAL=["output","query","only-show-errors","no-wait","verbose","debug","subscription","help","yes"];
const GFLAG=["only-show-errors","no-wait","verbose","debug","help","yes"];
const GALIAS={o:"output",h:"help",y:"yes"};
const LONGAL={nsg:"network-security-group","address-prefix":"address-prefixes","subnet-prefix":"subnet-prefixes","resource-group-name":"resource-group","vm":"vm-name","zones":"zone","address-prefixes":"address-prefix"};
AZ.C={};
/* def: {d, al:"g:resource-group n:name", r:"name resource-group", o:"opt1 opt2", f:"flag1 flag2", ex:"example", run(w,a,ctx)} */
AZ.cmd=(path,def)=>{def.path=path;const al={g:"resource-group",n:"name",l:"location"};(def.al||"").split(/\s+/).filter(Boolean).forEach(p=>{const [k,v]=p.split(":");al[k]=v});def.alias=al;
  def.req=(def.r||"").split(/\s+/).filter(Boolean);def.opt=(def.o||"").split(/\s+/).filter(Boolean);def.flags=(def.f||"").split(/\s+/).filter(Boolean);AZ.C[path]=def};
function parseArgs(def,toks){const a={_:{},_pos:[]};const allowed=new Set([...def.req,...def.opt,...def.flags,...GLOBAL]);const bad=[];
  for(let i=0;i<toks.length;i++){const t=toks[i];let name=null;
    if(/^--[a-z0-9-]+(=.*)?$/i.test(t)){name=t.slice(2);if(name.includes("=")){const [n,...v]=name.split("=");if(!allowed.has(lc(n))){bad.push(t);continue}a._[lc(n)]=[v.join("=")];continue}name=lc(name)}
    else if(/^-[a-zA-Z]$/.test(t)){const k=t.slice(1);name=def.alias[k]||GALIAS[k];if(!name){bad.push(t);continue}}
    else {a._pos.push(t);continue}
    if(!allowed.has(name)&&LONGAL[name]&&allowed.has(LONGAL[name]))name=LONGAL[name];
    if(!allowed.has(name)){bad.push(t);while(i+1<toks.length&&!/^--?[a-zA-Z]/.test(toks[i+1]))bad.push(toks[++i]);continue}
    if(def.flags.includes(name)||GFLAG.includes(name)){if(i+1<toks.length&&/^(true|false)$/i.test(toks[i+1])){a._[name]=[lc(toks[++i])]}else a._[name]=["true"];continue}
    const vals=[];while(i+1<toks.length&&!(/^--[a-zA-Z]/.test(toks[i+1])||/^-[a-zA-Z]$/.test(toks[i+1])))vals.push(toks[++i]);
    if(!vals.length){U(`argument --${name}: expected at least one argument`)}
    a._[name]=(a._[name]||[]).concat(vals)}
  if(bad.length)U("unrecognized arguments: "+bad.join(" "));
  if(a._pos.length&&!def.pos)U("unrecognized arguments: "+a._pos.join(" "));
  if(a._.help)return {help:true};
  const miss=def.req.filter(r=>!(r in a._)&&!(def.reqAny&&def.reqAny[r]&&def.reqAny[r].some(x=>x in a._)));
  if(miss.length)U("the following arguments are required: "+miss.map(m=>"--"+m+(Object.entries(def.alias).find(([,v])=>v===m)?"/-"+Object.entries(def.alias).find(([,v])=>v===m)[0]:"")).join(", "));
  a.get=k=>a._[k]?a._[k].join(" "):undefined;a.one=k=>a._[k]?a._[k][0]:undefined;a.all=k=>a._[k]||[];a.has=k=>k in a._;
  a.bool=k=>a._[k]?!/^(false|0|no)$/i.test(a._[k][0]):undefined;
  return a}
AZ.parseArgs=parseArgs;

/* tags: "k=v k2=v2" */
AZ.tagsFrom=arr=>{const o={};(arr||[]).forEach(s=>{if(s==="")return;const i=s.indexOf("=");if(i<0)o[s]="";else o[s.slice(0,i)]=s.slice(i+1)});return o};
AZ.json=s=>{if(typeof s!=="string")return s;try{return JSON.parse(s)}catch(e){U(`Failed to parse JSON: ${s}`)}};

/* ---------- output: JSON, table, tsv, --query ---------- */
const escH=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
AZ.escH=escH;
function jsonHi(o){return escH(JSON.stringify(o,null,2)).replace(/^(\s*)(&quot;|")([^"\n]+)\2:/gm,'$1<span class="t-k">"$3"</span>:').replace(/("provisioningState"<\/span>: |"provisioningState": )"(Succeeded)"/g,'$1<span class="t-ok">"$2"</span>').replace(/"(Succeeded|Connected|VM running|Running|Enabled|Allow|Completed)"/g,'<span class="t-ok">"$1"</span>').replace(/"(Failed|Deny|Disconnected|VM deallocated|Initiated|Stopped|Disabled)"/g,'<span class="t-warn">"$1"</span>')}
AZ.jsonHi=jsonHi;
function table(rows,cols){if(!rows.length)return "";cols=cols||Object.keys(rows[0]).filter(k=>rows.some(r=>r[k]!==null&&typeof r[k]!=="object"));
  const val=(r,c)=>{const v=r[c];return v==null?"":Array.isArray(v)?v.join(","):typeof v==="object"?"":String(v)};
  const wd=cols.map(c=>Math.max(c.length,...rows.map(r=>val(r,c).length)));
  const head=cols.map((c,i)=>c.padEnd(wd[i])).join("  ").trimEnd(),dash=wd.map(n=>"-".repeat(n)).join("  ");
  return escH([head,dash,...rows.map(r=>cols.map((c,i)=>val(r,c).padEnd(wd[i])).join("  ").trimEnd())].join("\n"))}
AZ.table=table;
function jpath(o,p){return p.split(".").reduce((x,k)=>{if(x==null)return x;const m=/^(\w*)\[(\d+)\]$/.exec(k);if(m){const y=m[1]?x[m[1]]:x;return y==null?y:y[+m[2]]}return x[k]},o)}
function query(o,q){q=q.trim();let m;
  if((m=/^\[\]\.\{(.+)\}$/.exec(q))||(m=/^\[\*\]\.\{(.+)\}$/.exec(q))){const pr=m[1].split(",").map(s=>s.split(":").map(x=>x.trim()));return (Array.isArray(o)?o:[o]).map(x=>Object.fromEntries(pr.map(([k,v])=>[k,jpath(x,v||k)])))}
  if((m=/^\[\]\.(.+)$/.exec(q))||(m=/^\[\*\]\.(.+)$/.exec(q)))return (Array.isArray(o)?o:[o]).map(x=>jpath(x,m[1]));
  if((m=/^\[\?(\w+(?:\.\w+)*)\s*==\s*'([^']*)'\]\.?(.*)$/.exec(q))){const f=(Array.isArray(o)?o:[]).filter(x=>lc(jpath(x,m[1]))===lc(m[2]));return m[3]?f.map(x=>jpath(x,m[3])):f}
  if((m=/^\{(.+)\}$/.exec(q))){const pr=m[1].split(",").map(s=>s.split(":").map(x=>x.trim()));return Object.fromEntries(pr.map(([k,v])=>[k,jpath(o,v||k)]))}
  if(/^length\(@\)$/.test(q))return Array.isArray(o)?o.length:0;
  if(/^[\w.]+$/.test(q)||/^\w+\[\d+\](\.[\w.\[\]]+)?$/.test(q))return jpath(o,q);
  if((m=/^\[(\d+)\]\.?(.*)$/.exec(q))){const x=(o||[])[+m[1]];return m[2]?jpath(x,m[2]):x}
  U(`argument --query: invalid jmespath_type value: '${q}' (this simulator supports simple queries like id, [].name and [].{Name:name})`)}
AZ.render=(res,a)=>{if(res==null)return "";if(res&&res.__text!==undefined)return res.__text;
  let o=res&&res.__json!==undefined?res.__json:res;const tblRows=res&&res.__table;
  if(o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).some(k=>k.startsWith("__"))){o=Object.fromEntries(Object.entries(o).filter(([k,v])=>!k.startsWith("__")));if(!Object.keys(o).length)return ""}
  if(a&&a.has("query"))o=query(o,a.get("query"));
  const fmt=a&&a.one("output");
  if(fmt==="table"){let rows=(!a.has("query")&&tblRows)||o;if(!Array.isArray(rows))rows=[rows];if(rows.length&&typeof rows[0]!=="object")return escH(["Result","------",...rows.map(String)].join("\n"));return table(rows)}
  if(fmt==="tsv"){const rows=Array.isArray(o)?o:[o];return escH(rows.map(r=>r!==null&&typeof r==="object"?Object.values(r).filter(v=>v===null||typeof v!=="object").join("\t"):r==null?"":String(r)).join("\n"))}
  if(fmt&&!["json","jsonc","yaml","none","yamlc"].includes(fmt))U(`argument --output/-o: invalid choice: '${fmt}' (choose from 'json', 'jsonc', 'none', 'table', 'tsv', 'yaml', 'yamlc')`);
  if(fmt==="none")return "";
  return jsonHi(o)};

/* ---------- shell: variables, $(...) substitution, built-ins ---------- */
AZ.expand=(w,line,ps)=>{
  line=line.replace(/\$\(([^()]*)\)/g,(m,inner)=>{const r=AZ.exec(w,inner,{sub:true});if(r.err)throw new AzErr(r.out);return r.raw});
  if(ps)line=line.replace(/\$(\w+)\.(\w+)/g,(m,v,p)=>{const o=w.vars[lc(v)];if(o==null)return "";const k=Object.keys(o).find(k=>lc(k)===lc(p));return k?String(o[k]):""});
  return line.replace(/\$\{?(\w+)\}?/g,(m,v)=>{const x=w.vars[lc(v)];return x==null?(ps?m:""):typeof x==="object"?(x.Id||x.ResourceId||x.id||JSON.stringify(x)):String(x)})};
const BUILTIN={
  ls:w=>Object.keys(w.files).concat(Object.keys(w.tpl)).sort().join("  ")||"",
  pwd:()=>"/home/admin",whoami:()=>"admin",date:()=>new Date().toUTCString(),
  cat:(w,args)=>{const f=args[0];if(!f)return "cat: missing file operand";const t=w.tpl[f]?w.tpl[f].text:w.files[f]!=null?(typeof w.files[f]==="string"?w.files[f]:JSON.stringify(w.files[f],null,2)):null;return t==null?`cat: ${f}: No such file or directory`:escH(t)},
  echo:(w,args)=>escH(args.join(" ")),
  help:()=>`<span class="t-n">This is a simulated Azure Cloud Shell. Try:\n  az --help              list command groups\n  az vm --help           list commands in a group\n  az vm create --help    arguments and an example\n  ls, cat &lt;file&gt;          read files in your home directory\n  clear                  clear the screen\n↑ / ↓ for history, Tab to complete.</span>`
};
AZ.groups=()=>[...new Set(Object.keys(AZ.C).map(p=>p.split(" ")[0]))].sort();
function helpFor(prefix){const subs=Object.keys(AZ.C).filter(p=>p===prefix||p.startsWith(prefix+" "));if(!subs.length)return null;
  const exact=AZ.C[prefix];
  if(exact&&subs.length===1){const d=exact;const al=n=>{const k=Object.entries(d.alias).find(([,v])=>v===n);return k?" -"+k[0]:""};
    return `<span class="t-n">Command</span>\n    az ${escH(prefix)} : ${escH(d.d||"")}\n\n<span class="t-n">Arguments</span>\n${d.req.map(r=>`    --${r}${al(r)} [Required]`).join("\n")}${d.req.length?"\n":""}${d.opt.concat(d.flags).map(r=>`    --${r}${al(r)}`).join("\n")}${d.ex?`\n\n<span class="t-n">Examples</span>\n    ${escH(d.ex)}`:""}`}
  const depth=prefix?prefix.split(" ").length:0;const kids=[...new Set(subs.map(p=>p.split(" ").slice(0,depth+1).join(" ")))];
  return `<span class="t-n">Group</span>\n    az ${escH(prefix)}\n\n<span class="t-n">Subgroups and commands</span>\n${kids.map(k=>{const c=AZ.C[k];return `    ${k.split(" ").pop().padEnd(22)}: ${c?escH(c.d||""):"(group)"}`}).join("\n")}`}
AZ.helpFor=helpFor;

/* run one line: returns {out (html), err, raw (plain text for substitution)} */
AZ.exec=(w,line,ctx)=>{ctx=ctx||{};let toks;
  try{
    line=line.trim();if(!line)return {out:""};
    if(line.startsWith("#"))return {out:""};
    let asg=null;const am=/^(\w+)=(.*)$/.exec(line);
    if(am&&!/^az\b/.test(line)){w.vars[lc(am[1])]=AZ.expand(w,am[2].trim()).replace(/^["']|["']$/g,"").trim();return {out:""}}
    line=AZ.expand(w,line);
    toks=AZ.tokens(line);if(toks.err)return {out:"bash: unexpected EOF while looking for matching quote",err:true};
    if(!toks.length)return {out:""};
    if(toks[0]!=="az"){const b=BUILTIN[toks[0]];if(b)return {out:b(w,toks.slice(1)),raw:""};if(toks[0]==="clear")return {clear:true,out:""};
      if(toks[0]==="azcopy")return AZ.azcopy?AZ.azcopy(w,toks.slice(1)):{out:"azcopy: not available in this lab",err:true};
      return {out:`bash: ${escH(toks[0])}: command not found`,err:true}}
    const rest=toks.slice(1);
    if(!rest.length||rest[0]==="--help"||rest[0]==="-h")return {out:`<span class="t-n">Welcome to the cool new Azure CLI!</span>\n\n<span class="t-n">Groups</span>\n${AZ.groups().map(g=>"    "+g).join("\n")}\n\n<span class="t-n">Use az &lt;group&gt; --help for more.</span>`};
    if(rest[0]==="version"||rest[0]==="--version")return {out:`azure-cli                         2.67.0\n\ncore                              2.67.0\ntelemetry                          1.1.0`};
    let path=null,n=0;for(let i=Math.min(rest.length,5);i>0;i--){const p=rest.slice(0,i).join(" ");if(AZ.C[p]){path=p;n=i;break}}
    if(!path){let k=0;for(let i=1;i<=rest.length;i++){if(Object.keys(AZ.C).some(p=>p===rest.slice(0,i).join(" ")||p.startsWith(rest.slice(0,i).join(" ")+" ")))k=i;else break}
      const pre=rest.slice(0,k).join(" ");
      if(k&&(rest.length===k||/^-/.test(rest[k])))return {out:helpFor(pre)};
      const bad=rest[k]||rest[0];return {out:`ERROR: '${escH(bad)}' is misspelled or not recognized by the system.\n\nExamples from AI knowledge base:\n    az ${escH(pre?pre+" --help":"--help")}`,err:true}}
    const def=AZ.C[path];const a=parseArgs(def,rest.slice(n));
    if(a.help)return {out:helpFor(path)};
    const res=def.run(w,a,ctx);
    AZ.lastJson=res&&res.__json!==undefined?res.__json:res;
    if(res&&res.__warn&&!ctx.sub){}
    const out=(res&&res.__warn?`<span class="t-warn">${escH(res.__warn)}</span>\n`:"")+AZ.render(res,a);
    let raw="";{let o=res&&res.__json!==undefined?res.__json:res;if(a.has("query"))try{o=query(o,a.get("query"))}catch(e){}raw=o==null?"":typeof o==="object"?(Array.isArray(o)?o.map(x=>typeof x==="object"?JSON.stringify(x):x).join("\n"):(o.id||JSON.stringify(o))):String(o)}
    if(asg){w.vars[lc(asg)]=raw;return {out:""}}
    return {out,raw,ok:true,path}}
  catch(e){if(e&&e.az)return {out:`<span class="t-bad">${escH(e.message)}</span>`,err:true,raw:""};if(typeof console!=="undefined")console.error(e);return {out:`<span class="t-bad">Simulator error: ${escH(e.message)}</span>`,err:true,raw:""}}};

/* tab completion over command words and argument names */
AZ.complete=(line)=>{const m=/^(.*?)(\S*)$/.exec(line);const before=m[1],word=m[2];const toks=before.trim().split(/\s+/).filter(Boolean);
  if(toks[0]!=="az"){if(!toks.length&&"az".startsWith(word))return "az ";return null}
  const words=toks.slice(1).filter(t=>!t.startsWith("-"));
  let path=null;for(let i=words.length;i>0;i--){const p=words.slice(0,i).join(" ");if(AZ.C[p]){path=p;break}}
  let cands;
  if(path&&word.startsWith("-")){const d=AZ.C[path];cands=[...d.req,...d.opt,...d.flags].map(x=>"--"+x).filter(x=>x.startsWith(word))}
  else if(!path){const pre=words.join(" ");const depth=words.length;cands=[...new Set(Object.keys(AZ.C).filter(p=>!pre||p.startsWith(pre+" ")).map(p=>p.split(" ")[depth]).filter(Boolean))].filter(x=>x.startsWith(word))}
  else return null;
  if(!cands.length)return null;if(cands.length===1)return before+cands[0]+" ";
  let c=cands[0];cands.forEach(x=>{while(!x.startsWith(c))c=c.slice(0,-1)});return c.length>word.length?before+c:{list:cands}};
})();
