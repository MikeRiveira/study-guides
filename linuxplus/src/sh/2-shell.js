/* ================= Linux shell simulator: bash language =================
   Lexer, parser and interpreter for the subset of bash the exam expects: pipes, redirection, ; && ||, quoting, variables,
   command substitution, arithmetic, globs, brace expansion, here-documents, if/for/while/until/case, functions, test and [[ ]].
   LX.session(w,user) makes a login shell; LX.exec(sh,line) runs a line and returns the terminal output. */
(function(){
const C={};LX.C=C;            /* external commands, filled by 3-cmds.js and 4-sys.js */
const SBIN=new Set();LX.SBIN=SBIN;
class Ctl{constructor(k,n){this.k=k;this.n=n}}  /* break / continue / return / exit */
LX.Ctl=Ctl;

/* ---------- lexer ---------- */
const OPS=["2>&1","1>&2",">&2","&>>","2>>","&>","2>",";;","&&","||",">>","<<<","<<",">|","|",";","&",">","<","(",")"];
function lex(src){
  const T=[];let i=0,w=null,pend=[];const n=src.length;
  const push=()=>{if(w!==null){T.push({t:"w",v:w});w=null}};
  const grab=(open,close)=>{/* from i (at open) consume balanced, return text */let d=0,s="",q=null;
    while(i<n){const c=src[i];s+=c;i++;
      if(q){if(c==="\\"&&q==='"'&&i<n){s+=src[i];i++;continue}if(c===q)q=null;continue}
      if(c==="'"||c==='"'){q=c;continue}if(c==="\\"&&i<n){s+=src[i];i++;continue}
      if(c===open){d++;continue}if(c===close){d--;if(d===0)return s}}
    return s};
  while(i<n){const c=src[i];
    if(c==="\\"&&src[i+1]==="\n"){i+=2;continue}
    if(c===" "||c==="\t"){push();i++;continue}
    if(c==="\n"){push();T.push({t:"nl"});i++;
      while(pend.length){const h=pend.shift();let body=[];while(i<n){let e=src.indexOf("\n",i);if(e<0)e=n;let line=src.slice(i,e);i=e+1;const cmp=h.strip?line.replace(/^\t+/,""):line;if(cmp===h.delim)break;body.push(h.strip?cmp:line)}h.tok.body=body.join("\n")+(body.length?"\n":"")}
      continue}
    if(w===null&&T.length&&T[T.length-1].t==="w"&&T[T.length-1].v==="=~"){let d=0,s2="";while(i<n){const ch=src[i];if(d===0&&(ch===" "||ch==="\t"||ch==="\n"||ch===";"))break;if(ch==="'"){const e=src.indexOf("'",i+1);const e2=e<0?n:e+1;s2+=src.slice(i,e2);i=e2;continue}if(ch==='"'){let j=i+1;while(j<n&&src[j]!=='"'){if(src[j]==="\\")j++;j++}s2+=src.slice(i,j+1);i=j+1;continue}if(ch==="\\"){s2+=src.slice(i,i+2);i+=2;continue}if(ch==="(")d++;if(ch===")")d--;s2+=ch;i++}T.push({t:"w",v:s2});continue}
    if(c==="#"&&w===null){while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="'"){const e=src.indexOf("'",i+1);const s=e<0?src.slice(i):src.slice(i,e+1);w=(w||"")+s;i=e<0?n:e+1;continue}
    if(c==='"'){let s='"';i++;while(i<n&&src[i]!=='"'){if(src[i]==="\\"&&i+1<n){s+=src[i]+src[i+1];i+=2;continue}
        if(src[i]==="$"&&src[i+1]==="("){i++;s+="$"+grab("(",")");continue}
        if(src[i]==="`"){const e=src.indexOf("`",i+1);s+=src.slice(i,e<0?n:e+1);i=e<0?n:e+1;continue}s+=src[i];i++}
      s+='"';i++;w=(w||"")+s;continue}
    if(c==="\\"){w=(w||"")+src.slice(i,i+2);i+=2;continue}
    if(c==="$"&&src[i+1]==="("){i++;w=(w||"")+"$"+grab("(",")");continue}
    if(c==="$"&&src[i+1]==="{"){i++;w=(w||"")+"$"+grab("{","}");continue}
    if(c==="`"){const e=src.indexOf("`",i+1);w=(w||"")+src.slice(i,e<0?n:e+1);i=e<0?n:e+1;continue}
    if(c==="("&&src[i+1]==="("&&w===null){const st=i;let d=0;while(i<n){if(src[i]==="(")d++;if(src[i]===")"){d--;if(d===0){i++;break}}i++}push();T.push({t:"w",v:src.slice(st,i),arith:true});continue}
    if(c==="("&&w!==null&&/=$/.test(w)){w+=grab("(",")");continue}
    if(c==="("&&w!==null&&src[i+1]===")"){push();T.push({t:"op",v:"("});T.push({t:"op",v:")"});i+=2;continue}
    if(c==="("&&w!==null){w+=c;i++;continue}
    if((w==="2"||w==="1")&&src.startsWith(">&",i)&&/[12]/.test(src[i+2]||"")){T.push({t:"op",v:w+">&"+src[i+2]});w=null;i+=3;continue}
    if(w==="2"&&c===">"){w=null;const op=src.startsWith(">>",i)?"2>>":"2>";T.push({t:"op",v:op});i+=op.length-1;continue}
    {const op=OPS.find(o=>src.startsWith(o,i));
      if(op){push();T.push({t:"op",v:op});i+=op.length;
        if(op==="<<"){while(src[i]===" ")i++;let strip=false;if(src[i]==="-"){strip=true;i++}while(src[i]===" ")i++;let d="";while(i<n&&!/[\s;|&<>]/.test(src[i]))d+=src[i++];const tok={t:"w",v:"",here:true,quoted:/['"\\]/.test(d)};T.push(tok);pend.push({delim:d.replace(/['"\\]/g,""),strip,tok})}
        continue}}
    w=(w||"")+c;i++}
  push();return T}
LX.lex=lex;

/* ---------- parser ---------- */
const RESERVED=new Set(["if","then","elif","else","fi","for","in","do","done","while","until","case","esac","function","{","}","!","select"]);
function parse(src){const T=lex(src);let i=0;
  const peek=()=>T[i],isW=(v)=>T[i]&&T[i].t==="w"&&T[i].v===v,isOp=v=>T[i]&&T[i].t==="op"&&T[i].v===v;
  const skipNl=()=>{while(T[i]&&(T[i].t==="nl"||isOp(";")))i++};
  const skipNlOnly=()=>{while(T[i]&&T[i].t==="nl")i++};
  const expectW=v=>{skipNl();if(!isW(v))throw new SyntaxError(`syntax error near unexpected token \`${T[i]?T[i].v||"newline":"end of file"}'`);i++};
  function list(ends){const items=[];skipNlOnly();
    while(T[i]){if(T[i].t==="w"&&ends.includes(T[i].v)&&!T[i].arith)break;if(isOp(";;")||isOp(")")&&ends.includes(")"))break;
      const ao=andor();if(!ao)break;let bg=false;
      if(isOp("&")){bg=true;i++}else if(isOp(";"))i++;
      items.push({...ao,bg});skipNlOnly()}
    return {k:"list",items}}
  function andor(){const first=pipeline();if(!first)return null;const parts=[[null,first]];
    while(isOp("&&")||isOp("||")){const op=T[i].v;i++;skipNlOnly();parts.push([op,pipeline()])}
    return {k:"andor",parts}}
  function pipeline(){let neg=false;if(isW("!")){neg=true;i++}const cmds=[command()];if(!cmds[0])return null;
    while(isOp("|")){i++;skipNlOnly();cmds.push(command())}return {k:"pipe",cmds,neg}}
  function redirs(node){node.redirs=node.redirs||[];
    while(T[i]&&T[i].t==="op"&&/^(2>&1|1>&2|>&2|&>>|2>>|&>|2>|>>|>|<|<<|<<<|>\|)$/.test(T[i].v)){const op=T[i].v;i++;
      if(op==="2>&1"||op==="1>&2"||op===">&2"){node.redirs.push({op});continue}
      const t=T[i];i++;node.redirs.push({op,v:t?t.v:"",tok:t})}
    return node}
  function command(){skipNlOnly();const t=peek();if(!t)return null;
    if(t.t==="w"&&!t.arith){
      if(t.v==="if"){i++;const clauses=[];let cond=list(["then"]);expectW("then");let body=list(["elif","else","fi"]);clauses.push([cond,body]);let els=null;
        while(isW("elif")){i++;cond=list(["then"]);expectW("then");body=list(["elif","else","fi"]);clauses.push([cond,body])}
        if(isW("else")){i++;els=list(["fi"])}expectW("fi");return redirs({k:"if",clauses,els})}
      if(t.v==="for"){i++;const v=T[i];i++;
        if(v&&v.arith){/* for ((a;b;c)) */const inner=v.v.slice(2,-2).split(";");skipNl();expectW("do");const body=list(["done"]);expectW("done");return redirs({k:"cfor",init:inner[0]||"",cond:inner[1]||"",step:inner[2]||"",body})}
        let words=null;skipNlOnly();if(isW("in")){i++;words=[];while(T[i]&&T[i].t==="w"&&!(T[i].v==="do"))words.push(T[i++].v)}
        skipNl();expectW("do");const body=list(["done"]);expectW("done");return redirs({k:"for",v:v.v,words,body})}
      if(t.v==="while"||t.v==="until"){i++;const cond=list(["do"]);expectW("do");const body=list(["done"]);expectW("done");return redirs({k:"while",until:t.v==="until",cond,body})}
      if(t.v==="case"){i++;const word=T[i++].v;skipNlOnly();expectW("in");const items=[];skipNl();
        while(T[i]&&!isW("esac")){if(isOp("("))i++;const pats=[];while(T[i]&&!isOp(")")){if(T[i].t==="w")pats.push(T[i].v);i++}i++;
          const body=list(["esac",";;"]);if(isOp(";;"))i++;items.push([pats,body]);skipNl()}
        expectW("esac");return redirs({k:"case",word,items})}
      if(t.v==="{"){i++;const body=list(["}"]);expectW("}");return redirs({k:"group",body})}
      if(t.v==="function"){i++;const name=T[i++].v.replace(/\(\)$/,"");if(isOp("(")){i+=2}skipNlOnly();const b=command();return {k:"func",name,body:b}}
      if(T[i+1]&&T[i+1].t==="op"&&T[i+1].v==="("&&T[i+2]&&T[i+2].v===")"){const name=t.v;i+=3;skipNlOnly();const b=command();return {k:"func",name,body:b}}
      if(["then","fi","do","done","else","elif","esac","}"].includes(t.v))throw new SyntaxError(`syntax error near unexpected token \`${t.v}'`)}
    if(t.t==="op"&&t.v==="("){i++;const body=list([")"]);if(isOp(")"))i++;return redirs({k:"sub",body})}
    if(t.t==="op"&&!/^(2>&1|&>|2>|>>|>|<|<<|<<<|2>>)$/.test(t.v))throw new SyntaxError(`syntax error near unexpected token \`${t.v}'`);
    /* simple command */
    const node={k:"simple",words:[],assigns:[],redirs:[]};
    while(T[i]){const x=T[i];
      if(x.t==="nl")break;
      if(x.t==="op"){if(/^(2>&1|1>&2|>&2|&>>|2>>|&>|2>|>>|>|<|<<|<<<|>\|)$/.test(x.v)){redirs(node);continue}break}
      if(x.arith&&!node.words.length){i++;node.words.push(x.v);node.arithCmd=true;continue}
      if(x.v==="[["&&!node.words.length){i++;node.words.push("[[");while(T[i]&&!(T[i].t==="w"&&T[i].v==="]]")){if(T[i].t==="nl")break;node.words.push(T[i].t==="op"?"\u0000"+T[i].v:T[i].v);i++}if(isW("]]")){node.words.push("]]");i++}continue}
      if(!node.words.length&&/^[A-Za-z_][A-Za-z0-9_]*(\[[^\]]*\])?\+?=/.test(x.v)){node.assigns.push(x.v);i++;continue}
      node.words.push(x.v);i++}
    if(!node.words.length&&!node.assigns.length&&!node.redirs.length)return null;
    return node}
  const L=list([]);if(i<T.length&&T[i]){const t=T[i];throw new SyntaxError(`syntax error near unexpected token \`${t.v||"newline"}'`)}
  return L}
LX.parse=parse;

/* ---------- session ---------- */
LX.session=(w,user,o={})=>{const U=w.users[user];const sh={w,user,cwd:o.cwd||U.home,v:{},exp:new Set(),fns:{},aliases:{ll:"ls -l",la:"ls -A","l.":"ls -d .* --color=auto",grep:"grep --color=auto"},last:0,frames:[{args:[],locals:null,name:"bash"}],
  umask:0o022,stack:[],oldpwd:null,hist:[],opts:{},jobs:[],steps:0,login:true,cwdStack:[]};
  LX.loginEnv(sh);return sh};
LX.loginEnv=sh=>{const w=sh.w,U=w.users[sh.user];Object.assign(sh.v,{HOME:U.home,USER:sh.user,LOGNAME:sh.user,SHELL:U.shell,PATH:sh.user==="root"?"/root/.local/bin:/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin":`/home/${sh.user}/.local/bin:/home/${sh.user}/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin`,HOSTNAME:w.host,LANG:"en_US.UTF-8",TERM:"xterm-256color",HISTSIZE:"1000",EDITOR:"vim",PWD:sh.cwd,SHLVL:"1",MAIL:"/var/spool/mail/"+sh.user});
  ["HOME","USER","LOGNAME","SHELL","PATH","HOSTNAME","LANG","TERM","HISTSIZE","EDITOR","PWD","SHLVL","MAIL"].forEach(k=>sh.exp.add(k));
  sh.umask=sh.user==="root"?0o022:0o022};
LX.prompt=sh=>{const w=sh.w,home=w.users[sh.user].home;let d=sh.cwd===home?"~":sh.cwd.startsWith(home+"/")?"~"+sh.cwd.slice(home.length):sh.cwd;
  const base=d==="~"||d==="/"?d:d.split("/").pop();const s=sh.user==="root"?"#":"$";
  return w.distro==="debian"?`${sh.user}@${w.host}:${d}${s} `:`[${sh.user}@${w.host} ${base}]${s} `};

/* ---------- variables ---------- */
function getVar(sh,name){const F=sh.frames;
  if(name==="?")return String(sh.last);if(name==="#")return String(F[F.length-1].args.length);if(name==="$")return "1802";if(name==="!")return String(sh.lastBg||"");
  if(name==="@"||name==="*")return F[F.length-1].args.join(" ");if(/^\d+$/.test(name)){const n=+name;return n===0?F[F.length-1].name:(F[F.length-1].args[n-1]??"")}
  if(name==="RANDOM")return String(Math.floor(Math.random()*32768));if(name==="PWD")return sh.cwd;if(name==="UID")return String(sh.w.users[sh.user].uid);if(name==="EUID")return String(sh.w.users[sh.user].uid);
  if(name==="SECONDS")return "42";if(name==="BASH_VERSION")return "5.2.26(1)-release";if(name==="OLDPWD")return sh.oldpwd||"";
  for(let k=F.length-1;k>=0;k--)if(F[k].locals&&name in F[k].locals)return F[k].locals[name];
  const m=name.match(/^(\w+)\[(.+)\]$/);if(m){const a=sh.v[m[1]];if(Array.isArray(a)){if(m[2]==="@"||m[2]==="*")return a.join(" ");return a[+arith(sh,m[2])]??""}return m[2]==="0"?(sh.v[m[1]]??""):""}
  const v=sh.v[name];return Array.isArray(v)?(v[0]??""):(v??"")}
function setVar(sh,name,val){const F=sh.frames;for(let k=F.length-1;k>=0;k--)if(F[k].locals&&name in F[k].locals){F[k].locals[name]=val;return}
  if(sh.ro&&sh.ro.has(name))return;sh.v[name]=val;if(name==="PATH")sh.exp.add(name)}
LX.getVar=getVar;LX.setVar=setVar;

/* ---------- arithmetic ---------- */
function arith(sh,expr){expr=String(expr).trim();if(!expr)return 0;
  const parts=splitTop(expr,",");let r=0;for(const p of parts)r=arith1(sh,p.trim());return r}
function splitTop(s,ch){const o=[];let d=0,cur="";for(const c of s){if(c==="(")d++;if(c===")")d--;if(c===ch&&d===0){o.push(cur);cur=""}else cur+=c}o.push(cur);return o}
function arith1(sh,e){let m;
  if(m=e.match(/^(\w+)\s*(\+\+|--)$/)){const v=+getVar(sh,m[1])||0;setVar(sh,m[1],String(m[2]==="++"?v+1:v-1));return v}
  if(m=e.match(/^(\+\+|--)\s*(\w+)$/)){const v=(+getVar(sh,m[2])||0)+(m[1]==="++"?1:-1);setVar(sh,m[2],String(v));return v}
  if(m=e.match(/^(\w+)\s*([-+*/%]?)=(?!=)\s*(.+)$/)){const rhs=arith1(sh,m[3]);const cur=+getVar(sh,m[1])||0;const v=m[2]==="+"?cur+rhs:m[2]==="-"?cur-rhs:m[2]==="*"?cur*rhs:m[2]==="/"?Math.trunc(cur/rhs):m[2]==="%"?cur%rhs:rhs;setVar(sh,m[1],String(v));return v}
  let js=e.replace(/\$\{?(\w+)\}?/g,(_,n)=>String(+getVar(sh,n)||0)).replace(/\b([A-Za-z_]\w*)\b/g,(_,n)=>String(+getVar(sh,n)||0));
  if(!/^[\d\s+\-*/%()<>=!&|?:^~]*$/.test(js))throw new Error(`${e}: syntax error in expression`);
  js=js.replace(/(\d+)\s*\/\s*(\d+)/g,"Math.trunc($1/$2)");
  let v;try{v=Function("return ("+js+")")()}catch(x){throw new Error(`${e}: syntax error in expression`)}
  if(v===true)v=1;if(v===false)v=0;if(!isFinite(v))throw new Error("division by 0 (error token is \""+e+"\")");return Math.trunc(v)}
LX.arith=arith;

/* ---------- expansion ---------- */
function braceExpand(word){/* one level of {a,b} and {1..5}, outside quotes */
  let q=null;for(let i=0;i<word.length;i++){const c=word[i];if(q){if(c===q)q=null;continue}if(c==="'"||c==='"'){q=c;continue}if(c==="\\"){i++;continue}
    if(c==="$"&&word[i+1]==="{"){let d=0;for(;i<word.length;i++){if(word[i]==="{")d++;if(word[i]==="}"){d--;if(!d)break}}continue}
    if(c==="{"){let d=0,j=i;for(;j<word.length;j++){if(word[j]==="{")d++;if(word[j]==="}"){d--;if(!d)break}}if(j>=word.length)return [word];
      const inner=word.slice(i+1,j),pre=word.slice(0,i),post=word.slice(j+1);let m;
      if(m=inner.match(/^(-?\d+)\.\.(-?\d+)(?:\.\.(\d+))?$/)){const a=+m[1],b=+m[2],s=+(m[3]||1),out=[];const pad=m[1].startsWith("0")&&m[1].length>1?m[1].length:0;if(a<=b)for(let k=a;k<=b;k+=s)out.push(pre+String(k).padStart(pad,"0")+post);else for(let k=a;k>=b;k-=s)out.push(pre+k+post);return out.flatMap(braceExpand)}
      if(m=inner.match(/^([a-z])\.\.([a-z])$/i)){const out=[];for(let k=m[1].charCodeAt(0);k<=m[2].charCodeAt(0);k++)out.push(pre+String.fromCharCode(k)+post);return out.flatMap(braceExpand)}
      const alts=splitTop(inner,",");if(alts.length>1&&!inner.includes("{")||alts.length>1)return alts.map(a=>pre+a+post).flatMap(braceExpand);
      i=j}}
  return [word]}
function paramExp(sh,body,x){let m;
  if(m=body.match(/^#(\w+)$/))return String(getVar(sh,m[1]).length);
  if(m=body.match(/^#(\w+)\[[@*]\]$/)){const a=sh.v[m[1]];return String(Array.isArray(a)?a.length:a?1:0)}
  if(m=body.match(/^(\w+(?:\[[^\]]+\])?):?-(.*)$/s)){const v=getVar(sh,m[1]);return v!==""?v:expandStr(sh,m[2],x)}
  if(m=body.match(/^(\w+):?=(.*)$/s)){const v=getVar(sh,m[1]);if(v!=="")return v;const d=expandStr(sh,m[2],x);setVar(sh,m[1],d);return d}
  if(m=body.match(/^(\w+):?\+(.*)$/s)){const v=getVar(sh,m[1]);return v!==""?expandStr(sh,m[2],x):""}
  if(m=body.match(/^(\w+):\?(.*)$/s)){const v=getVar(sh,m[1]);if(v!=="")return v;throw new Error(`${m[1]}: ${m[2]||"parameter null or not set"}`)}
  if(m=body.match(/^(\w+)(%%?|##?)(.+)$/s)){const v=getVar(sh,m[1]);const re=globRe(expandStr(sh,m[3],x),true);
    if(m[2]==="%"||m[2]==="%%"){for(let k=m[2]==="%"?v.length:0;m[2]==="%"?k>=0:k<=v.length;m[2]==="%"?k--:k++)if(re.test(v.slice(k)))return v.slice(0,k);return v}
    for(let k=m[2]==="#"?0:v.length;m[2]==="#"?k<=v.length:k>=0;m[2]==="#"?k++:k--)if(re.test(v.slice(0,k)))return v.slice(k);return v}
  if(m=body.match(/^(\w+)\/\/?([^/]*)\/?(.*)$/s)){const v=getVar(sh,m[1]);const all=body.startsWith(m[1]+"//");const re=new RegExp(globRe(m[2],true).source.slice(1,-1),all?"g":"");return v.replace(re,m[3])}
  if(m=body.match(/^(\w+)(\^\^|,,)$/)){const v=getVar(sh,m[1]);return m[2]==="^^"?v.toUpperCase():v.toLowerCase()}
  if(m=body.match(/^(\w+):(-?\d+)(?::(\d+))?$/)){const v=getVar(sh,m[1]);let s=+m[2];if(s<0)s=Math.max(0,v.length+s);return m[3]!=null?v.substr(s,+m[3]):v.slice(s)}
  return getVar(sh,body)}
function cmdSub(sh,src,x){const sub={sh,out:[],in:{s:""},depth:(x?.depth||0)+1};if(sub.depth>40)throw new Error("maximum nesting exceeded");
  const save=sh.last;runSrc(sh,src,sub);const o=sub.out.filter(c=>c[0]===1).map(c=>c[1]).join("");sub.out.filter(c=>c[0]===2).forEach(c=>x&&x.out.push(c));return o.replace(/\n+$/,"")}
/* expand a raw word into a list of segments [{s,q}] */
function segs(sh,raw,x,inDq){const out=[];let i=0;const n=raw.length;const add=(s,q)=>out.push({s,q});
  while(i<n){const c=raw[i];
    if(!inDq&&c==="'"){const e=raw.indexOf("'",i+1);add(raw.slice(i+1,e<0?n:e),true);i=e<0?n:e+1;continue}
    if(!inDq&&c==='"'){let j=i+1,s="";while(j<n&&raw[j]!=='"'){if(raw[j]==="\\"&&j+1<n){s+=raw[j]+raw[j+1];j+=2;continue}if(raw[j]==="$"&&raw[j+1]==="("){let d=0,k=j+1;for(;k<n;k++){if(raw[k]==="(")d++;if(raw[k]===")"){d--;if(!d)break}}s+=raw.slice(j,k+1);j=k+1;continue}s+=raw[j++]}
      const am=s.match(/^\$\{(\w+)\[@\]\}$/);if(s==="$@"||s==="${@}"){add("\u0001AT",true)}else if(am){const v=sh.v[am[1]];out.push({s:"\u0001AT",q:true,list:Array.isArray(v)?v.filter(z=>z!==undefined).map(String):v&&typeof v==="object"?Object.values(v).map(String):v!=null?[String(v)]:[]})}else add(segs(sh,s,x,true).map(z=>z.s).join(""),true);i=j+1;continue}
    if(c==="\\"){if(inDq){const nx=raw[i+1];if("$`\"\\\n".includes(nx)){add(nx,true);i+=2;continue}add("\\",true);i++;continue}add(raw[i+1]||"",true);i+=2;continue}
    if(c==="`"){const e=raw.indexOf("`",i+1);add(cmdSub(sh,raw.slice(i+1,e<0?n:e),x),inDq);i=e<0?n:e+1;continue}
    if(c==="$"){const nx=raw[i+1];
      if(nx==="("&&raw[i+2]==="("){let d=0,k=i+1;for(;k<n;k++){if(raw[k]==="(")d++;if(raw[k]===")"){d--;if(!d)break}}add(String(arith(sh,raw.slice(i+3,k-1))),inDq);i=k+1;continue}
      if(nx==="("){let d=0,k=i+1,q=null;for(;k<n;k++){const ch=raw[k];if(q){if(ch===q)q=null;continue}if(ch==="'"||ch==='"'){q=ch;continue}if(ch==="(")d++;if(ch===")"){d--;if(!d)break}}add(cmdSub(sh,raw.slice(i+2,k),x),inDq);i=k+1;continue}
      if(nx==="{"){let d=0,k=i+1;for(;k<n;k++){if(raw[k]==="{")d++;if(raw[k]==="}"){d--;if(!d)break}}add(paramExp(sh,raw.slice(i+2,k),x),inDq);i=k+1;continue}
      const m=raw.slice(i+1).match(/^([A-Za-z_]\w*|[0-9?#$@*!])/);if(m){if(!inDq&&(m[1]==="@"||m[1]==="*"))add("\u0001AT",false);else add(getVar(sh,m[1]),inDq);i+=1+m[1].length;continue}
      add("$",true);i++;continue}
    let j=i;while(j<n&&!"'\"\\`$".includes(raw[j]))j++;if(j===i)j++;add(raw.slice(i,j),inDq);i=j}
  return out}
function expandStr(sh,raw,x){return segs(sh,raw,x,true).map(z=>z.s).join("")}
LX.expandStr=expandStr;
function globRe(p,anchored=true){let r="";for(let i=0;i<p.length;i++){const c=p[i];if(c==="*")r+=".*";else if(c==="?")r+=".";else if(c==="["){const e=p.indexOf("]",i+1);if(e<0){r+="\\[";continue}let cls=p.slice(i+1,e);if(cls[0]==="!")cls="^"+cls.slice(1);r+="["+cls.replace(/\\/g,"\\\\")+"]";i=e}else r+=c.replace(/[.+^${}()|\\/]/g,"\\$&")}return new RegExp(anchored?"^"+r+"$":r)}
LX.globRe=globRe;
function glob(sh,pat){const abs=pat.startsWith("/");const parts=pat.split("/").filter(Boolean);let cands=[abs?"/":""];
  for(const part of parts){const next=[];const g=/[*?[]/.test(part);
    for(const base of cands){const dirPath=LX.abs(sh.cwd,base||".");const dn=LX.lookup(sh.w,dirPath);if(!dn||dn.t!=="d")continue;
      if(!g){if(dn.k[part]||part===".."||part===".")next.push(base+(base&&!base.endsWith("/")?"/":"")+part);continue}
      const re=globRe(part);Object.keys(dn.k).sort().forEach(k=>{if(k.startsWith(".")&&!part.startsWith("."))return;if(re.test(k))next.push(base+(base&&!base.endsWith("/")?"/":"")+k)})}
    cands=next;if(!cands.length)return null}
  return cands.length?cands:null}
/* full word expansion: brace, tilde, params, command subst, arithmetic, word splitting, globbing */
function expandWord(sh,raw,x,noSplit){
  const fields=[];
  for(const w0 of braceExpand(raw)){
    let w=w0;if(/^~(\/|$)/.test(w))w=sh.w.users[sh.user].home+w.slice(1);else if(/^~\w+(\/|$)/.test(w)){const u=w.match(/^~(\w+)/)[1];if(sh.w.users[u])w=sh.w.users[u].home+w.slice(1+u.length)}
    const S=segs(sh,w,x,false);
    if(S.some(z=>z.s==="\u0001AT")){const ix=S.findIndex(z=>z.s==="\u0001AT");const args=S[ix].list||sh.frames[sh.frames.length-1].args;const pre=S.slice(0,ix).map(z=>z.s).join("");const post=S.slice(ix+1).map(z=>z.s).join("");if(!args.length){if(pre||post)fields.push(pre+post);continue}args.forEach((a,k)=>fields.push((k===0?pre:"")+a+(k===args.length-1?post:"")));continue}
    if(noSplit){fields.push(S.map(z=>z.s).join(""));continue}
    /* split unquoted parts on whitespace */
    let cur=[],any=false;const flush=()=>{if(cur.length){fields.push(globField(sh,cur));cur=[]}};
    S.forEach(z=>{if(z.q){cur.push(z);any=true;return}const bits=z.s.split(/([ \t\n]+)/);bits.forEach((b,k)=>{if(k%2===1){flush();return}if(b!=="")cur.push({s:b,q:false})})});
    if(cur.length)flush();else if(any&&!fields.length&&S.every(z=>z.q))fields.push("")}
  return fields.flat()}
function globField(sh,parts){const s=parts.map(z=>z.s).join("");if(!parts.some(z=>!z.q&&/[*?[]/.test(z.s)))return s;
  /* build pattern with quoted parts escaped */
  const pat=parts.map(z=>z.q?z.s.replace(/[*?[]/g,"\\$&"):z.s).join("");if(/\\[*?[]/.test(pat))return s;const g=glob(sh,pat);return g?g:s}
LX.expandWord=expandWord;LX.glob=glob;

/* ---------- interpreter ---------- */
function runSrc(sh,src,x){let ast;try{ast=parse(src)}catch(e){x.out.push([2,`bash: ${e.message}\n`]);sh.last=2;return 2}
  return runList(sh,ast,x)}
LX.runSrc=runSrc;
function runList(sh,L,x){let c=0;for(const it of L.items){
  if(it.bg){const pid=sh.w.nextPid++;sh.jobs.push(pid);sh.lastBg=pid;x.out.push([2,`[${sh.jobs.length}] ${pid}\n`]);
    const words=it.parts[0][1].cmds[0].words||[];if(/^(sleep|yes|dd|tar|rsync|find|python3|\.\/)/.test(words[0]||"")||words[0]==="nohup"){sh.w.procs.push({pid,ppid:1802,u:sh.user,cmd:words.join(" "),cpu:words[0]==="yes"?99:0,mem:0.1,ni:0,st:"S",t:new Date().toTimeString().slice(0,5),tty:"pts/0",job:sh.jobs.length});if(words[0]==="nohup")x.out.push([2,"nohup: ignoring input and appending output to 'nohup.out'\n"]);c=0;sh.last=0;continue}
    const sub={...x,out:[]};c=runAndOr(sh,it,sub);sub.out.forEach(o=>x.out.push(o));continue}
  c=runAndOr(sh,it,x)}
  return c}
function runAndOr(sh,ao,x){let c=0;for(const [op,p] of ao.parts){if(op==="&&"&&c!==0)continue;if(op==="||"&&c===0)continue;c=runPipe(sh,p,x);
    if(sh.opts.e&&c!==0&&op===null&&ao.parts.length===1&&!x.inCond)throw new Ctl("exit",c)}
  return c}
function runPipe(sh,p,x){
  if(p.cmds.length===1){const c=runCmd(sh,p.cmds[0],x);sh.last=p.neg?(c?0:1):c;return sh.last}
  let input=x.in;let c=0;const codes=[];
  p.cmds.forEach((cmd,k)=>{const sub={...x,out:[],in:input,piped:k<p.cmds.length-1};c=runCmd(sh,cmd,sub);codes.push(c);
    if(k<p.cmds.length-1){input={s:sub.out.filter(o=>o[0]===1).map(o=>o[1]).join("")};sub.out.filter(o=>o[0]===2).forEach(o=>x.out.push(o))}
    else sub.out.forEach(o=>x.out.push(o))});
  if(sh.opts.pipefail){const f=codes.filter(v=>v!==0);if(f.length)c=f[f.length-1]}
  sh.last=p.neg?(c?0:1):c;return sh.last}
function step(sh){if(++sh.steps>4000)throw new Error("simulator: too many loop iterations (is this an infinite loop?)")}
function runCmd(sh,node,x){
  if(!node)return 0;
  /* redirections apply to the whole node */
  if(node.redirs&&node.redirs.length){return withRedirs(sh,node,x,(y)=>runNode(sh,node,y))}
  return runNode(sh,node,x)}
function withRedirs(sh,node,x,fn){const y={...x,out:[]};let inS=x.in;const targets=[];
  for(const r of node.redirs){
    if(r.op==="<"){const f=expandWord(sh,r.v,x)[0];const p=LX.abs(sh.cwd,f,sh.w.users[sh.user].home);const res=LX.readFile(sh,p);if(res.err){x.out.push([2,`bash: ${f}: ${res.err}\n`]);return 1}inS={s:res.c}}
    else if(r.op==="<<"){const b=r.tok&&r.tok.body||"";inS={s:r.tok&&r.tok.quoted?b:expandStr(sh,b,x)}}
    else if(r.op==="<<<"){inS={s:expandWord(sh,r.v,x,true)[0]+"\n"}}
    else if(r.op==="2>&1")targets.push({fd:2,dup:1});else if(r.op==="1>&2"||r.op===">&2")targets.push({fd:1,dup:2});
    else{const f=expandWord(sh,r.v,x,true)[0];const fd=r.op.startsWith("2")?2:r.op.startsWith("&")?3:1;const app=r.op.includes(">>");
      if(f==="/dev/null"){targets.push({fd,null:true});continue}if(f==="/dev/stderr"){targets.push({fd,dup:2});continue}if(f==="/dev/stdout"){targets.push({fd,dup:1});continue}
      const p=LX.abs(sh.cwd,f,sh.w.users[sh.user].home);const chk=LX.writeFile(sh,p,"",app,true);if(chk){x.out.push([2,`bash: ${f}: ${chk}\n`]);return 1}
      targets.push({fd,file:p,app,buf:""})}}
  y.in=inS;const c=fn(y);
  /* route output */
  const route=(fd)=>{let t=null;for(const tg of targets){if(tg.fd===fd||tg.fd===3&&(fd===1||fd===2))t=tg}return t};
  const files={};
  y.out.forEach(([fd,s])=>{let t=route(fd);if(t&&t.dup){const t2=route(t.dup);if(t2&&!t2.dup)t=t2;else{x.out.push([t.dup,s]);return}}
    if(!t){x.out.push([fd,s]);return}if(t.null)return;(files[t.file]=files[t.file]||{app:t.app,s:""}).s+=s});
  targets.forEach(t=>{if(t.file&&!files[t.file])files[t.file]={app:t.app,s:""}});
  Object.entries(files).forEach(([p,f])=>LX.writeFile(sh,p,f.s,f.app));
  return c}
function runNode(sh,node,x){
  switch(node.k){
    case "simple":return runSimple(sh,node,x);
    case "list":return runList(sh,node,x);
    case "group":return runList(sh,node.body,x);
    case "sub":{const save={cwd:sh.cwd,v:{...sh.v}};try{return runList(sh,node.body,x)}catch(e){if(e instanceof Ctl&&e.k==="exit")return e.n;throw e}finally{sh.cwd=save.cwd;sh.v=save.v}}
    case "if":{for(const [cond,body] of node.clauses){const c=runList(sh,cond,{...x,inCond:true});if(c===0)return runList(sh,body,x)}return node.els?runList(sh,node.els,x):0}
    case "for":{const items=node.words===null?[...sh.frames[sh.frames.length-1].args]:node.words.flatMap(wd=>expandWord(sh,wd,x));let c=0;
      for(const it of items){step(sh);setVar(sh,node.v,it);try{c=runList(sh,node.body,x)}catch(e){if(e instanceof Ctl){if(e.k==="break"){if(e.n>1){e.n--;throw e}break}if(e.k==="continue"){if(e.n>1){e.n--;throw e}continue}}throw e}}return c}
    case "cfor":{let c=0;arith(sh,node.init);while(node.cond.trim()===""||arith(sh,node.cond)){step(sh);try{c=runList(sh,node.body,x)}catch(e){if(e instanceof Ctl){if(e.k==="break")break;if(e.k==="continue"){arith(sh,node.step);continue}}throw e}arith(sh,node.step)}return c}
    case "while":{let c=0;while(true){step(sh);const r=runList(sh,node.cond,{...x,inCond:true});if(node.until?r===0:r!==0)break;try{c=runList(sh,node.body,x)}catch(e){if(e instanceof Ctl){if(e.k==="break"){if(e.n>1){e.n--;throw e}break}if(e.k==="continue")continue}throw e}}return c}
    case "case":{const v=expandWord(sh,node.word,x,true)[0];for(const [pats,body] of node.items){for(const p of pats){const pp=expandWord(sh,p,x,true)[0];if(pp.split("|").some(z=>globRe(z).test(v)))return runList(sh,body,x)}}return 0}
    case "func":{sh.fns[node.name]=node.body;return 0}
  }
  return 0}
LX.isBuiltin=n=>n in B;
function runSimple(sh,node,x){
  step(sh);
  if(node.arithCmd){try{const v=arith(sh,node.words[0].slice(2,-2));return v?0:1}catch(e){x.out.push([2,`bash: ${e.message}\n`]);return 1}}
  let words;try{
    if(node.words[0]==="[["){words=node.words}
    else{words=[];for(const wd of node.words){
        if(words.length===0&&x.interactive!==false&&sh.aliases[wd]&&!x.noAlias){const al=sh.aliases[wd];const sub=lex(al).filter(t=>t.t==="w").map(t=>t.v);words.push(...sub.flatMap(s=>expandWord(sh,s,x)));continue}
        if(words.length&&/^(declare|typeset|local)$/.test(words[0])&&/^\w+=\(.*\)$/s.test(wd)){const m=wd.match(/^(\w+)=\((.*)\)$/s);const items=lex(m[2]).filter(t=>t.t==="w").flatMap(t=>expandWord(sh,t.v,x));words.push(m[1]+"=\u0002"+JSON.stringify(items));continue}
        words.push(...expandWord(sh,wd,x))}}
  }catch(e){if(e instanceof Ctl)throw e;x.out.push([2,`bash: ${e.message}\n`]);return 1}
  /* assignments */
  const assigns=node.assigns.map(a=>{const m=a.match(/^([A-Za-z_]\w*)(\[[^\]]*\])?(\+?)=(.*)$/s);let val;
    if(m[4].startsWith("(")&&m[4].endsWith(")")){val=lex(m[4].slice(1,-1)).filter(t=>t.t==="w").flatMap(t=>expandWord(sh,t.v,x))}else val=expandWord(sh,m[4],x,true)[0]??"";
    return [m[1],val,m[3]==="+",m[2]]});
  if(!words.length){assigns.forEach(([n,v,app,idx])=>{if(idx){const a=Array.isArray(sh.v[n])?sh.v[n]:(sh.v[n]!=null?[sh.v[n]]:[]);a[+arith(sh,idx.slice(1,-1))]=v;sh.v[n]=a}else if(Array.isArray(v))sh.v[n]=app&&Array.isArray(sh.v[n])?sh.v[n].concat(v):v;else setVar(sh,n,app?getVar(sh,n)+v:v)});return 0}
  const saved={};assigns.forEach(([n,v])=>{saved[n]=sh.v[n];sh.v[n]=v});
  try{
    if(sh.opts.x)x.out.push([2,"+ "+words.join(" ")+"\n"]);
    return runArgv(sh,words,x)}
  finally{assigns.forEach(([n])=>{if(saved[n]===undefined)delete sh.v[n];else sh.v[n]=saved[n]})}}
/* run an argument vector: function, builtin, script file, or command */
function runArgv(sh,argv,x){const name=argv[0],args=argv.slice(1);
  if(name===undefined)return 0;
  if(sh.fns[name]&&!x.noFn){if(sh.frames.length>60){x.out.push([2,"bash: maximum function nesting level exceeded\n"]);return 1}
    sh.frames.push({args,locals:{},name:sh.frames[sh.frames.length-1].name});try{return runCmd(sh,sh.fns[name],x)}catch(e){if(e instanceof Ctl&&e.k==="return")return e.n;throw e}finally{sh.frames.pop()}}
  if(B[name])return B[name](sh,args,x)??0;
  if(name.includes("/"))return runScriptFile(sh,name,args,x);
  return LX.runExternal(sh,name,args,x)}
LX.runArgv=runArgv;
LX.readFile=(sh,p)=>{const w=sh.w;const n=LX.lookup(w,p);if(!LX.traverse(sh,p))return {err:"Permission denied"};if(!n)return {err:"No such file or directory"};if(n.t==="d")return {err:"Is a directory"};if(!LX.can(w,sh.user,n,"r"))return {err:"Permission denied"};return {c:n.gen?n.gen(w):n.c,n}};
/* every directory on the way must be searchable (x) */
LX.traverse=(sh,p)=>{const w=sh.w;if(w.users[sh.user].uid===0)return true;const parts=LX.norm(p).split("/").filter(Boolean);let cur="";
  for(let i=0;i<parts.length-1;i++){cur+="/"+parts[i];const n=LX.lookup(w,cur);if(!n)return true;if(n.t==="d"&&!LX.can(w,sh.user,n,"x"))return false}return true};
/* create or write a file as the session user. check=true only tests. returns error string or null */
LX.writeFile=(sh,p,c,app,check)=>{const w=sh.w;const n=LX.lookup(w,p);
  if(!LX.traverse(sh,p))return "Permission denied";
  if(n){if(n.t==="d")return "Is a directory";if(n.attr&&n.attr.includes("i"))return "Operation not permitted";if(n.attr&&n.attr.includes("a")&&!app)return "Operation not permitted";
    if(n.gen&&!check)return "Operation not permitted";if(!LX.can(w,sh.user,n,"w"))return "Permission denied";if(check)return null;
    const mnt=LX.mountOf(w,p);if(mnt&&mnt.ro)return "Read-only file system";
    if(mnt&&w.fs[mnt.src]&&LX.fsUsed(w,mnt).used>=w.fs[mnt.src].size-0.0001&&c.length)return "No space left on device";
    n.c=app?n.c+c:c;n.m=Date.now();return null}
  const dir=LX.lookup(w,LX.dirname(p));if(!dir)return "No such file or directory";if(dir.t!=="d")return "Not a directory";
  if(!LX.can(w,sh.user,dir,"w")||!LX.can(w,sh.user,dir,"x"))return "Permission denied";if(dir.attr&&dir.attr.includes("i"))return "Operation not permitted";
  const mnt=LX.mountOf(w,p);if(mnt&&mnt.ro)return "Read-only file system";
  if(mnt&&w.fs[mnt.src]&&LX.fsUsed(w,mnt).used>=w.fs[mnt.src].size-0.0001)return "No space left on device";
  if(check)return null;
  const U=w.users[sh.user];const f=LX.F(c,0o666&~sh.umask,U.uid,(dir.mode&0o2000)?dir.gid:U.gid);if(dir.dacl)f.acl=JSON.parse(JSON.stringify(dir.dacl));dir.k[LX.basename(p)]=f;return null};
function runScriptFile(sh,path,args,x){const w=sh.w;const p=LX.abs(sh.cwd,path,w.users[sh.user].home);const n=LX.lookup(w,p);
  if(!n){x.out.push([2,`bash: ${path}: No such file or directory\n`]);return 127}
  if(n.t==="d"){x.out.push([2,`bash: ${path}: Is a directory\n`]);return 126}
  if(!LX.can(w,sh.user,n,"x")||!LX.traverse(sh,p)){x.out.push([2,`bash: ${path}: Permission denied\n`]);return 126}
  const mnt=LX.mountOf(w,p);if(mnt&&/noexec/.test(mnt.opts||"")){x.out.push([2,`bash: ${path}: Permission denied\n`]);return 126}
  if(n.bin)return n.bin(sh,args,x);
  const r=LX.readFile(sh,p);if(r.err){x.out.push([2,`bash: ${path}: Permission denied\n`]);return 126}
  return LX.runScript(sh,r.c,path,args,x)}
LX.runScript=(sh,src,name,args,x)=>{const first=src.split("\n")[0];
  if(/^#!.*python/.test(first)){x.out.push([2,`${name}: this simulator runs bash scripts only. Python is covered in the lessons as read-the-code exercises.\n`]);return 1}
  if(/\r/.test(src)){x.out.push([2,`${name}: line 1: $'\\r': command not found\n`]);return 127}
  if(!/^#!/.test(first)&&!x.viaBash){/* bash still runs it */}
  const saveOpts={...sh.opts};sh.frames.push({args,locals:null,name,script:true});
  try{return runSrc(sh,src,x)}catch(e){if(e instanceof Ctl&&(e.k==="exit"||e.k==="return"))return e.n;if(e instanceof Ctl)return 0;x.out.push([2,`${name}: ${e.message}\n`]);return 1}
  finally{const fr=sh.frames.pop();sh.opts=saveOpts;if(fr.traps&&fr.traps.EXIT){sh.frames.push({args,locals:null,name,script:true});try{runSrc(sh,fr.traps.EXIT,x)}catch(e){}finally{sh.frames.pop()}}}};

/* ---------- test / [ / [[ ---------- */
function fileTest(sh,op,f){const w=sh.w;const p=LX.abs(sh.cwd,f,w.users[sh.user].home);const n=LX.lookup(w,p),ln=LX.lookup(w,p,false);
  switch(op){case "-e":case "-a":return !!n;case "-f":return !!n&&n.t==="f";case "-d":return !!n&&n.t==="d";case "-L":case "-h":return !!ln&&ln.t==="l";
    case "-s":return !!n&&LX.size(n)>0;case "-r":return !!n&&LX.can(w,sh.user,n,"r");case "-w":return !!n&&LX.can(w,sh.user,n,"w");case "-x":return !!n&&LX.can(w,sh.user,n,"x");
    case "-u":return !!n&&(n.mode&0o4000)>0;case "-g":return !!n&&(n.mode&0o2000)>0;case "-k":return !!n&&(n.mode&0o1000)>0;case "-O":return !!n&&n.uid===w.users[sh.user].uid;case "-b":return /^\/dev\/(sd|nvme|vd|xvd|md|dm-|mapper)/.test(p);case "-c":return /^\/dev\/(null|zero|tty|random|urandom)/.test(p);}
  return false}
function evalTest(sh,a,dbl){
  const num=v=>{if(!/^\s*-?\d+\s*$/.test(v))throw new Error(`${v}: integer expression expected`);return +v};
  function expr(){let r=term();while(a[0]==="-o"||a[0]==="||"){a.shift();const r2=term();r=r||r2}return r}
  function term(){let r=fact();while(a[0]==="-a"&&!(a.length>1&&false)||a[0]==="&&"){a.shift();const r2=fact();r=r&&r2}return r}
  function fact(){if(a[0]==="!"){a.shift();return !fact()}if(a[0]==="("){a.shift();const r=expr();if(a[0]===")")a.shift();return r}
    if(a.length>=3&&/^(=|==|!=|-eq|-ne|-lt|-le|-gt|-ge|<|>|=~|-nt|-ot)$/.test(a[1])){const [l,op,r]=a.splice(0,3);
      switch(op){case "=":case "==":return dbl?globRe(r).test(l):l===r;case "!=":return dbl?!globRe(r).test(l):l!==r;case "<":return l<r;case ">":return l>r;
        case "=~":{try{const m=l.match(new RegExp(r));if(m)sh.v.BASH_REMATCH=[...m];return !!m}catch(e){return false}}
        case "-eq":return num(l)===num(r);case "-ne":return num(l)!==num(r);case "-lt":return num(l)<num(r);case "-le":return num(l)<=num(r);case "-gt":return num(l)>num(r);case "-ge":return num(l)>=num(r);case "-nt":case "-ot":return false}}
    if(a.length>=2&&/^-[a-zA-Z]$/.test(a[0])){const [op,v]=a.splice(0,2);if(op==="-z")return v==="";if(op==="-n")return v!=="";if(op==="-v")return getVar(sh,v)!=="";return fileTest(sh,op,v)}
    const v=a.shift();return v!==undefined&&v!==""}
  return expr()}
/* ---------- builtins ---------- */
const B={};LX.B=B;
const o1=(x,s)=>x.out.push([1,s]),o2=(x,s)=>x.out.push([2,s]);LX.o1=o1;LX.o2=o2;
B["true"]=B[":"]=()=>0;B["false"]=()=>1;
B.test=(sh,a,x)=>{try{return evalTest(sh,[...a],false)?0:1}catch(e){o2(x,`bash: test: ${e.message}\n`);return 2}};
B["["]=(sh,a,x)=>{if(a[a.length-1]!=="]"){o2(x,"bash: [: missing `]'\n");return 2}try{return evalTest(sh,a.slice(0,-1),false)?0:1}catch(e){o2(x,`bash: [: ${e.message}\n`);return 2}};
B["[["]=(sh,a,x)=>{const raw=a.slice(0,a[a.length-1]==="]]"?-1:a.length);const ex=[];
  for(let k=0;k<raw.length;k++){let t=raw[k];if(t.startsWith("\u0000")){ex.push(t.slice(1));continue}
    if(t==="=~"&&k+1<raw.length){ex.push(t);ex.push(segs(sh,raw[++k],x,false).map(z=>z.s).join(""));continue}
    if((t==="=="||t==="!=")&&k+1<raw.length){ex.push(t);ex.push(segs(sh,raw[++k],x,false).map(z=>z.q?z.s.replace(/[*?[]/g,"\\$&"):z.s).join(""));continue}
    ex.push(expandWord(sh,t,x,true)[0]??"")}
  try{return evalTest(sh,ex,true)?0:1}catch(e){o2(x,`bash: ${e.message}\n`);return 2}};
B.echo=(sh,a,x)=>{let n=false,e=false;while(a[0]&&/^-[neE]+$/.test(a[0])){const f=a.shift();if(f.includes("n"))n=true;if(f.includes("e"))e=true}
  let s=a.join(" ");if(e)s=s.replace(/\\n/g,"\n").replace(/\\t/g,"\t").replace(/\\e\[[0-9;]*m/g,"").replace(/\\\\/g,"\\");o1(x,s+(n?"":"\n"));return 0};
B.printf=(sh,a,x)=>{if(a[0]==="--")a=a.slice(1);if(!a.length){o2(x,"printf: usage: printf [-v var] format [arguments]\n");return 2}let fmt=a[0],args=a.slice(1),out="";let guard=0;
  const one=()=>fmt.replace(/%(-?\d*)(?:\.(\d+))?([sdfxo%])|\\n|\\t|\\\\/g,(m,w,pr,t)=>{if(m==="\\n")return "\n";if(m==="\\t")return "\t";if(m==="\\\\")return "\\";if(t==="%")return "%";let v=args.length?args.shift():"";
    if(t==="d")v=String(parseInt(v)||0);if(t==="f")v=(parseFloat(v)||0).toFixed(pr!=null?+pr:6);if(t==="x")v=(parseInt(v)||0).toString(16);if(t==="o")v=(parseInt(v)||0).toString(8);if(t==="s"&&pr!=null)v=v.slice(0,+pr);
    const wd=parseInt(w);if(wd)v=wd<0?String(v).padEnd(-wd):String(v).padStart(wd);return v});
  do{out+=one();guard++}while(args.length&&guard<200&&/%[sdfxo]/.test(fmt));o1(x,out);return 0};
B.cd=(sh,a,x)=>{const w=sh.w;let t=a[0];if(t==="-L"||t==="-P")t=a[1];if(t===undefined||t==="~")t=w.users[sh.user].home;if(t==="-"){if(!sh.oldpwd){o2(x,"bash: cd: OLDPWD not set\n");return 1}t=sh.oldpwd;o1(x,t+"\n")}
  const p=LX.abs(sh.cwd,t,w.users[sh.user].home);const n=LX.lookup(w,p);
  if(!n){o2(x,`bash: cd: ${a[0]}: No such file or directory\n`);return 1}if(n.t!=="d"){o2(x,`bash: cd: ${a[0]}: Not a directory\n`);return 1}
  if(!LX.can(w,sh.user,n,"x")||!LX.traverse(sh,p)){o2(x,`bash: cd: ${a[0]}: Permission denied\n`);return 1}
  sh.oldpwd=sh.cwd;sh.cwd=p;sh.v.PWD=p;return 0};
B.pwd=(sh,a,x)=>{o1(x,sh.cwd+"\n");return 0};
B.export=(sh,a,x)=>{if(!a.length||a[0]==="-p"){Object.keys(sh.v).filter(k=>sh.exp.has(k)).sort().forEach(k=>o1(x,`declare -x ${k}="${sh.v[k]}"\n`));return 0}
  a.forEach(s=>{if(s==="-n")return;const m=s.match(/^([A-Za-z_]\w*)=(.*)$/s);if(m){setVar(sh,m[1],m[2]);sh.exp.add(m[1])}else sh.exp.add(s)});return 0};
B.unset=(sh,a)=>{a.forEach(n=>{if(n==="-f"||n==="-v")return;delete sh.v[n];delete sh.fns[n];sh.exp.delete(n)});return 0};
B.readonly=(sh,a)=>{sh.ro=sh.ro||new Set();a.forEach(s=>{const m=s.match(/^(\w+)=(.*)$/s);if(m){sh.v[m[1]]=m[2];sh.ro.add(m[1])}else sh.ro.add(s)});return 0};
B.local=(sh,a,x)=>{const F=sh.frames[sh.frames.length-1];if(!F.locals){o2(x,"bash: local: can only be used in a function\n");return 1}a.forEach(s=>{const m=s.match(/^(\w+)=(.*)$/s);if(m)F.locals[m[1]]=m[2].startsWith("\u0002")?JSON.parse(m[2].slice(1)):m[2];else if(!/^-/.test(s))F.locals[s]=""});return 0};
B.declare=B.typeset=(sh,a,x)=>{const fl=a.filter(s=>/^-/.test(s)).join("");a.filter(s=>!/^-/.test(s)).forEach(s=>{const m=s.match(/^(\w+)=(.*)$/s);if(m){let v=m[2];if(fl.includes("i"))v=String(arith(sh,v));if(v.startsWith("\u0002"))v=JSON.parse(v.slice(1));else if(fl.includes("a")&&v.startsWith("("))v=v.slice(1,-1).split(/\s+/).filter(Boolean);sh.v[m[1]]=v;if(fl.includes("x"))sh.exp.add(m[1])}else if(fl.includes("a"))sh.v[s]=[];else if(!(s in sh.v))sh.v[s]=""});
  if(!a.length||a.join("")==="-p")Object.keys(sh.v).sort().forEach(k=>o1(x,`declare -- ${k}="${sh.v[k]}"\n`));return 0};
B.let=(sh,a,x)=>{let v=0;try{a.forEach(e=>v=arith(sh,e))}catch(e){o2(x,`bash: let: ${e.message}\n`);return 1}return v?0:1};
B.read=(sh,a,x)=>{let prompt=null,arr=null;const names=[];let raw=false,silent=false;
  for(let k=0;k<a.length;k++){if(a[k]==="-p")prompt=a[++k];else if(a[k]==="-r")raw=true;else if(a[k]==="-s")silent=true;else if(a[k]==="-a")arr=a[++k];else if(a[k]==="-t"||a[k]==="-n")k++;else names.push(a[k])}
  if(prompt)o2(x,prompt);
  const src=x.in;if(!src||!src.s){if(x.stdinQueue&&x.stdinQueue.length){const l=x.stdinQueue.shift();if(!silent&&prompt)o2(x,l+"\n");assign(l);return 0}names.forEach(n=>setVar(sh,n,""));return 1}
  const e=src.s.indexOf("\n");let line;if(e<0){line=src.s;src.s=""}else{line=src.s.slice(0,e);src.s=src.s.slice(e+1)}
  assign(line);return 0;
  function assign(line){if(!raw)line=line.replace(/\\(.)/g,"$1");const ifs=sh.v.IFS!=null?sh.v.IFS:" \t\n";const re=new RegExp("["+ifs.replace(/[\]\\^-]/g,"\\$&")+"]+");
    if(arr){sh.v[arr]=line.trim().split(re).filter(Boolean);return}if(!names.length){sh.v.REPLY=line;return}
    const parts=ifs===" \t\n"?line.trim().split(re):line.split(re);names.forEach((n,k)=>setVar(sh,n,k===names.length-1?parts.slice(k).join(ifs===" \t\n"?" ":ifs[0]):(parts[k]??"")))}};
B.exit=(sh,a)=>{throw new Ctl("exit",a[0]!=null?(+a[0]&255):sh.last)};
B.logout=B.exit;
B.return=(sh,a)=>{throw new Ctl("return",a[0]!=null?+a[0]:sh.last)};
B.break=(sh,a)=>{throw new Ctl("break",+(a[0]||1))};B.continue=(sh,a)=>{throw new Ctl("continue",+(a[0]||1))};
B.shift=(sh,a)=>{const F=sh.frames[sh.frames.length-1];F.args=F.args.slice(+(a[0]||1));return 0};
B.set=(sh,a,x)=>{if(!a.length){Object.keys(sh.v).sort().forEach(k=>o1(x,`${k}=${sh.v[k]}\n`));return 0}
  for(let k=0;k<a.length;k++){const f=a[k];if(f==="--"){sh.frames[sh.frames.length-1].args=a.slice(k+1);break}
    if(f==="-o"||f==="+o"){const o=a[++k];if(o==="pipefail")sh.opts.pipefail=f==="-o";if(o==="errexit")sh.opts.e=f==="-o";if(o==="nounset")sh.opts.u=f==="-o";if(o==="xtrace")sh.opts.x=f==="-o";continue}
    if(/^[-+][euxvo]+$/.test(f)){const on=f[0]==="-";[...f.slice(1)].forEach(c=>{if(c==="o"){const o=a[++k];const M={pipefail:"pipefail",errexit:"e",nounset:"u",xtrace:"x"};if(M[o])sh.opts[M[o]]=on}else sh.opts[c]=on});continue}
    sh.frames[sh.frames.length-1].args=a.slice(k);break}return 0};
B.source=B["."]=(sh,a,x)=>{if(!a[0]){o2(x,"bash: source: filename argument required\n");return 2}const p=LX.abs(sh.cwd,a[0],sh.w.users[sh.user].home);const r=LX.readFile(sh,p);if(r.err){o2(x,`bash: ${a[0]}: ${r.err}\n`);return 1}
  const F=sh.frames[sh.frames.length-1];const save=F.args;if(a.length>1)F.args=a.slice(1);try{return runSrc(sh,r.c,x)}catch(e){if(e instanceof Ctl&&e.k==="return")return e.n;throw e}finally{F.args=save}};
B.alias=(sh,a,x)=>{if(!a.length){Object.keys(sh.aliases).sort().forEach(k=>o1(x,`alias ${k}='${sh.aliases[k]}'\n`));return 0}
  let c=0;a.forEach(s=>{const m=s.match(/^([^=]+)=(.*)$/s);if(m)sh.aliases[m[1]]=m[2];else if(sh.aliases[s])o1(x,`alias ${s}='${sh.aliases[s]}'\n`);else{o2(x,`bash: alias: ${s}: not found\n`);c=1}});return c};
B.unalias=(sh,a)=>{a.forEach(n=>{if(n==="-a")sh.aliases={};delete sh.aliases[n]});return 0};
B.history=(sh,a,x)=>{if(a[0]==="-c"){sh.hist.length=0;return 0}const H=sh.hist;const n=a[0]?+a[0]:H.length;H.slice(-n).forEach((h,k)=>o1(x,`${String(H.length-Math.min(n,H.length)+k+1).padStart(5)}  ${h}\n`));return 0};
B.type=(sh,a,x)=>{let c=0;a.filter(s=>!s.startsWith("-")).forEach(n=>{if(sh.aliases[n])o1(x,`${n} is aliased to \`${sh.aliases[n]}'\n`);else if(RESERVED.has(n))o1(x,`${n} is a shell keyword\n`);else if(sh.fns[n])o1(x,`${n} is a function\n`);else if(B[n])o1(x,`${n} is a shell builtin\n`);else{const p=LX.which(sh,n);if(p)o1(x,`${n} is ${p}\n`);else{o2(x,`bash: type: ${n}: not found\n`);c=1}}});return c};
B.umask=(sh,a,x)=>{if(!a.length||a[0]==="-S"){if(a[0]==="-S"){const m=0o777&~sh.umask;const r=b=>(m&b*4?"r":"")+(m&b*2?"w":"")+(m&b?"x":"");o1(x,`u=${r(0o100)},g=${r(0o10)},o=${r(1)}\n`)}else o1(x,sh.umask.toString(8).padStart(4,"0")+"\n");return 0}
  if(!/^[0-7]{1,4}$/.test(a[0])){o2(x,`bash: umask: ${a[0]}: octal number out of range\n`);return 1}sh.umask=parseInt(a[0],8);return 0};
B.eval=(sh,a,x)=>runSrc(sh,a.join(" "),x);
B.exec=(sh,a,x)=>a.length?runArgv(sh,a,x):0;
B.wait=()=>0;
B.jobs=(sh,a,x)=>{sh.w.procs.filter(p=>p.job).forEach(p=>o1(x,`[${p.job}]+  Running                 ${p.cmd} &\n`));return 0};
B.fg=(sh,a,x)=>{const p=sh.w.procs.filter(p=>p.job).pop();if(!p){o2(x,"bash: fg: current: no such job\n");return 1}o1(x,p.cmd+"\n^C\n");sh.w.procs=sh.w.procs.filter(q=>q!==p);return 130};
B.bg=(sh,a,x)=>{const p=sh.w.procs.filter(p=>p.job).pop();if(!p){o2(x,"bash: bg: current: no such job\n");return 1}o1(x,`[${p.job}]+ ${p.cmd} &\n`);return 0};
B.disown=(sh)=>{sh.w.procs.forEach(p=>{if(p.job)delete p.job});return 0};
B.command=(sh,a,x)=>{if(a[0]==="-v"){const n=a[1];if(B[n]||sh.fns[n]){o1(x,n+"\n");return 0}const p=LX.which(sh,n);if(p){o1(x,p+"\n");return 0}return 1}return runArgv(sh,a,{...x,noFn:true})};
B.builtin=(sh,a,x)=>B[a[0]]?B[a[0]](sh,a.slice(1),x):1;
B.times=(sh,a,x)=>{o1(x,"0m0.012s 0m0.008s\n0m0.000s 0m0.000s\n");return 0};
B.help=(sh,a,x)=>{o1(x,LX.helpText(sh));return 0};
B.hash=()=>0;B.shopt=()=>0;B.trap=(sh,a,x)=>{if(!a.length||a[0]==="-p"){const fr=[...sh.frames].reverse().find(f=>f.script)||sh;Object.entries(fr.traps||{}).forEach(([k,v])=>o1(x,`trap -- '${v}' ${k}\n`));return 0}if(a[0]==="-l"){o1(x," 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 9) SIGKILL\t15) SIGTERM\n");return 0}const fr=[...sh.frames].reverse().find(f=>f.script)||sh;fr.traps=fr.traps||{};a.slice(1).forEach(sig=>{const k=sig.toUpperCase().replace(/^SIG/,"");const kk=k==="0"?"EXIT":k;if(a[0]==="-"||a[0]==="")delete fr.traps[kk];else fr.traps[kk]=a[0]});return 0};B.ulimit=(sh,a,x)=>{if(a.includes("-a"))o1(x,"core file size              (blocks, -c) 0\ndata seg size               (kbytes, -d) unlimited\nfile size                   (blocks, -f) unlimited\nopen files                          (-n) 1024\nmax user processes                  (-u) 31357\nstack size                  (kbytes, -s) 8192\ncpu time                   (seconds, -t) unlimited\n");else if(a.includes("-n"))o1(x,"1024\n");else o1(x,"unlimited\n");return 0};
B.pushd=(sh,a,x)=>{const old=sh.cwd;const c=B.cd(sh,[a[0]||sh.w.users[sh.user].home],x);if(!c){sh.cwdStack.unshift(old);o1(x,[sh.cwd,...sh.cwdStack].join(" ")+"\n")}return c};
B.popd=(sh,a,x)=>{const d=sh.cwdStack.shift();if(!d){o2(x,"bash: popd: directory stack empty\n");return 1}sh.cwd=d;o1(x,[sh.cwd,...sh.cwdStack].join(" ")+"\n");return 0};
B.dirs=(sh,a,x)=>{o1(x,[sh.cwd,...sh.cwdStack].join(" ")+"\n");return 0};
B.getopts=(sh,a,x)=>{const spec=a[0],name=a[1];const F=sh.frames[sh.frames.length-1];let ind=+(sh.v.OPTIND||1);const arg=F.args[ind-1];
  if(!arg||!arg.startsWith("-")||arg==="--"){setVar(sh,name,"?");return 1}const ch=arg[1];const k=spec.indexOf(ch);
  if(k<0){setVar(sh,name,"?");o2(x,`${F.name}: illegal option -- ${ch}\n`);sh.v.OPTIND=String(ind+1);return 0}
  setVar(sh,name,ch);if(spec[k+1]===":"){sh.v.OPTARG=arg.length>2?arg.slice(2):(F.args[ind]||"");ind+=arg.length>2?1:2}else ind++;sh.v.OPTIND=String(ind);return 0};

/* ---------- top-level entry ---------- */
/* exec a typed line: returns {out:"text with fd tags", code} */
LX.exec=(sh,line,opts={})=>{const x={sh,out:[],in:opts.stdin?{s:opts.stdin}:{s:""},interactive:true,stdinQueue:opts.queue};sh.steps=0;
  if(/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/.test(line)){sh.w.flags.fork=1;LX.flagHook&&LX.flagHook("fork");return {out:[[2,"bash: fork: retry: Resource temporarily unavailable\nbash: fork: retry: Resource temporarily unavailable\nbash: fork: Resource temporarily unavailable\n\n(The simulator stopped the fork bomb. On a real system, limit processes with ulimit -u or nproc in /etc/security/limits.conf.)\n"]],code:254}}
  let c=0;try{c=runSrc(sh,line,x)}catch(e){if(e instanceof Ctl){if(e.k==="exit"){c=e.n;x.exit=true}else c=0}else{x.out.push([2,`bash: ${e.message}\n`]);c=1;if(typeof console!=="undefined"&&!(e instanceof SyntaxError)&&!/simulator|syntax|expression|nesting|not set|null/.test(e.message))console.error(e)}}
  sh.last=c;return {out:x.out,code:c,exit:x.exit}};
})();
