/* ================= Print & export (shared by every guide) =================
   Loaded by each guide's build.py after its engine and modules, before boot().
   Adds a #print route (whole guide) and #print-<slug> (one module) with:
   - a printable summary (lessons, flashcards, optional quiz with answer key) for Print / Save as PDF
   - an Anki import file (tab-separated, with Anki header lines) of the flashcards
   It relies only on the engine globals every guide shares: MODULES, OUTLINE, modNum, modBySlug, MS, KEY, $. */
(function(){
const GUIDE=document.title.replace(/\s+/g," ").trim()||"Study Guide";
const TAG=String(KEY).replace(/-guide.*$/,"").replace(/[^a-z0-9]+/gi,"");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const outlineOf=m=>OUTLINE.find(o=>o.slug===m.slug)||{};
const modLabel=m=>{const o=outlineOf(m),n=o.domain!==undefined?modNum(o):"";return (n!==""?"Module "+n+": ":"")+(o.title||m.title)};
const MASTERED=4;
let PE={lessons:true,cards:true,quiz:false};

/* ---------- styles: on-screen preview and print ---------- */
const css=`
.pe-link{display:inline-flex;align-items:center;gap:8px;margin:10px 0 0;padding:7px 14px;border:1px solid var(--line);border-radius:999px;color:var(--fg);text-decoration:none;font-family:var(--display);font-size:14px;background:var(--surface)}
.pe-link:hover,.pe-link:focus-visible{border-color:var(--accent);color:var(--accent)}
.pe-panel{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:16px 18px;margin:16px 0}
.pe-panel h2{margin:0 0 6px;font-family:var(--display);font-size:20px}
.pe-panel p{margin:4px 0 12px;color:var(--muted)}
.pe-row{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin:10px 0}
.pe-row label{display:inline-flex;gap:8px;align-items:center;cursor:pointer}
.pe-row select{font:inherit;color:var(--fg);background:var(--surface-solid);border:1px solid var(--line);border-radius:8px;padding:7px 10px;max-width:100%}
.pe-row input[type=checkbox],.pe-row input[type=radio]{accent-color:var(--accent);width:18px;height:18px}
.pe-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.pe-note{font-size:14px;color:var(--muted)}
.pe-steps{margin:8px 0 0 20px;padding:0;color:var(--muted);font-size:14.5px}
.pe-doc{background:#fff;color:#16181d;border-radius:10px;padding:28px 32px;margin:18px 0 40px;font-family:var(--body);line-height:1.55;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.pe-doc *{color:inherit!important;background:transparent!important;box-shadow:none!important;text-shadow:none!important;-webkit-text-fill-color:currentColor}
.pe-doc h1{font-family:var(--display);font-size:26px;margin:0 0 4px}
.pe-doc h2{font-family:var(--display);font-size:21px;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid #16181d}
.pe-doc h3{font-family:var(--display);font-size:16.5px;margin:20px 0 6px}
.pe-doc h4{font-size:15px;margin:14px 0 4px}
.pe-doc p,.pe-doc li{font-size:13.5px}
.pe-doc .p-meta{color:#555!important;font-size:13px;margin-bottom:18px}
.pe-doc .p-mod{margin-top:30px}
.pe-doc table{border-collapse:collapse;width:100%;margin:8px 0 12px;font-size:12.5px}
.pe-doc th,.pe-doc td{border:1px solid #b9bec7!important;padding:4px 7px;text-align:left;vertical-align:top}
.pe-doc th{background:#eef0f3!important}
.pe-doc .scroll{overflow:visible}
.pe-doc .tip{border-left:4px solid #16181d!important;background:#f2f3f5!important;border-radius:0;padding:7px 11px;margin:10px 0;font-size:13px}
.pe-doc pre,.pe-doc code,.pe-doc .mono{font-family:var(--mono);font-size:12px}
.pe-doc pre{white-space:pre-wrap;border:1px solid #d4d7dc;padding:7px 9px;border-radius:4px}
.pe-doc svg{max-width:100%;height:auto}
.pe-doc .p-viz{font-size:12px;font-style:italic;color:#666!important;margin:4px 0}
.pe-doc .p-q{margin:10px 0;break-inside:avoid}
.pe-doc .p-q ol{margin:4px 0 0 4px;padding-left:20px;list-style:upper-alpha}
.pe-doc .p-key li{margin:3px 0}
.pe-doc .p-cards td:first-child{width:40%;font-weight:600}
.pe-doc tr,.pe-doc .tip,.pe-doc pre{break-inside:avoid}
@media (max-width:640px){.pe-doc{padding:18px 16px;border-radius:8px}}
@media print{
  @page{margin:14mm 13mm}
  html,body{background:#fff!important;color:#000!important}
  body *{visibility:hidden}
  .pe-doc,.pe-doc *{visibility:visible}
  header,.toasts,.levelup,.pe-panel,.pe-link,nav{display:none!important}
  main,.wrap,#view{margin:0!important;padding:0!important;max-width:none!important;width:auto!important}
  .pe-doc{position:absolute;left:0;top:0;width:100%;margin:0;padding:0;box-shadow:none;border-radius:0}
  .pe-doc .p-mod{break-before:page;margin-top:0}
  .pe-doc .p-mod:first-of-type{break-before:auto}
  .pe-doc .p-keys{break-before:page}
  .pe-doc a{text-decoration:none}
}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

/* ---------- printable summary ---------- */
function cleanLesson(html){
  const d=document.createElement("div");d.innerHTML=html;
  d.querySelectorAll(".viz").forEach(n=>{const e=document.createElement("p");e.className="p-viz";e.textContent="Interactive diagram: see the online guide.";n.replaceWith(e)});
  d.querySelectorAll(".viz-controls,.viz-title,button,input,select,textarea,script,canvas,[data-sim],.sim").forEach(n=>n.remove());
  d.querySelectorAll("[id]").forEach(n=>n.removeAttribute("id"));
  d.querySelectorAll("[onclick]").forEach(n=>n.removeAttribute("onclick"));
  return d.innerHTML;
}
function modSection(m,num){
  let h=`<section class="p-mod"><h2>${esc(modLabel(m))}</h2>`;
  const o=outlineOf(m);if(o.weight)h+=`<div class="p-meta">${o.weight}% of the exam · ${m.lessons.length} lessons · ${m.cards.length} flashcards</div>`;
  if(PE.lessons)h+=m.lessons.map(l=>`<h3>${esc(l.num?l.num+" ":"")}${esc(l.title)}</h3>${cleanLesson(l.html||"")}`).join("");
  if(PE.cards&&m.cards.length)h+=`<h3>Flashcard review</h3><table class="p-cards"><thead><tr><th>Prompt</th><th>Answer</th></tr></thead><tbody>${m.cards.map(c=>`<tr><td>${c.q}</td><td>${c.a}</td></tr>`).join("")}</tbody></table>`;
  if(PE.quiz&&(m.quiz||[]).length)h+=`<h3>Practice questions</h3>`+m.quiz.map((q,i)=>`<div class="p-q"><b>${num}.${i+1}</b> ${q.q}<ol>${q.o.map(x=>`<li>${x}</li>`).join("")}</ol></div>`).join("");
  return h+"</section>";
}
function answerKeys(mods){
  if(!PE.quiz)return"";
  const ks=mods.filter(m=>(m.quiz||[]).length);if(!ks.length)return"";
  return `<section class="p-keys"><h2>Answer key</h2>`+ks.map(m=>{const n=mods.indexOf(m)+1;
    return `<h3>${esc(modLabel(m))}</h3><ol class="p-key" style="list-style:none;padding:0">${m.quiz.map((q,i)=>`<li><b>${n}.${i+1} ${"ABCDEFGH"[q.a]||""}.</b> ${q.o[q.a]}${q.e?" · "+q.e:""}</li>`).join("")}</ol>`}).join("")+"</section>";
}
function paper(mods){
  const date=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const scope=mods.length===MODULES.length?"Full guide summary":modLabel(mods[0]);
  return `<h1>${esc(GUIDE)}</h1><div class="p-meta">${esc(scope)} · Printed ${date} · mikeriveira.github.io/study-guides</div>`+
    mods.map((m,i)=>modSection(m,i+1)).join("")+answerKeys(mods);
}

/* ---------- Anki export ---------- */
const field=s=>'"'+String(s).replace(/\r?\n|\t/g," ").replace(/"/g,'""')+'"';
function cardsFor(mods,onlyNew){
  const rows=[];
  mods.forEach(m=>{const s=MS(m.id);m.cards.forEach(c=>{if(onlyNew&&(s.box[c.id]||0)>=MASTERED)return;
    const o=outlineOf(m),tags=[TAG,TAG+"::"+(o.slug||m.slug),c.deck?TAG+"::"+(o.slug||m.slug)+"::"+c.deck:""].filter(Boolean).map(t=>t.replace(/\s+/g,"_"));
    rows.push([c.q,c.a,tags.join(" "),TAG+"-"+m.id+"-"+c.id])})});
  return rows;
}
function ankiFile(mods,onlyNew){
  const rows=cardsFor(mods,onlyNew);
  const head=["#separator:tab","#html:true","#notetype:Basic","#deck:"+GUIDE,"#tags column:3","#guid column:4"];
  return {count:rows.length,text:head.join("\n")+"\n"+rows.map(r=>r.map(field).join("\t")).join("\n")+"\n"};
}
function download(name,text){
  const b=new Blob([text],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
}

/* ---------- the page ---------- */
function renderPrint(slug){
  CUR=null;
  const one=slug&&modBySlug(slug);
  $("#head").innerHTML=`<div class="crumbs"><a href="../">Roadmap</a><span>/</span><a href="#home">All modules</a><span>/</span>Print &amp; export</div><h1>Print &amp; export</h1>`;
  $("#nav").hidden=true;$("#stats").hidden=true;
  const opts=`<option value="">Whole guide (${MODULES.length} modules)</option>`+MODULES.map(m=>`<option value="${m.slug}" ${one===m?"selected":""}>${esc(modLabel(m))}</option>`).join("");
  $("#view").innerHTML=`
  <div class="pe-panel">
    <h2>What to include</h2>
    <div class="pe-row"><label for="pe-scope">Scope</label><select id="pe-scope">${opts}</select></div>
    <div class="pe-row">
      <label><input type="checkbox" id="pe-l" ${PE.lessons?"checked":""}> Lessons</label>
      <label><input type="checkbox" id="pe-c" ${PE.cards?"checked":""}> Flashcard table</label>
      <label><input type="checkbox" id="pe-q" ${PE.quiz?"checked":""}> Practice questions with answer key</label>
    </div>
  </div>
  <div class="pe-panel">
    <h2>Printable summary</h2>
    <p>Opens your browser's print dialog. Choose "Save as PDF" as the printer to keep a copy. Interactive diagrams are left out of the printout.</p>
    <div class="pe-actions"><button class="btn" id="pe-print">Print / Save as PDF</button></div>
  </div>
  <div class="pe-panel">
    <h2>Flashcards for Anki</h2>
    <p id="pe-count"></p>
    <div class="pe-row">
      <label><input type="radio" name="pe-a" value="all" checked> All cards</label>
      <label><input type="radio" name="pe-a" value="new"> Only cards I haven't mastered yet</label>
    </div>
    <div class="pe-actions"><button class="btn" id="pe-anki">Download Anki file</button></div>
    <ol class="pe-steps"><li>In Anki, choose File, then Import, and pick the downloaded file.</li><li>Anki reads the settings from the file: Basic cards, deck "${esc(GUIDE)}", tags by module.</li><li>Click Import. Importing again later updates the same cards instead of making copies.</li></ol>
  </div>
  <p class="pe-note">Preview</p>
  <div class="pe-doc" id="pe-paper"></div>`;
  const scope=()=>{const v=$("#pe-scope").value;return v?[modBySlug(v)]:MODULES.slice()};
  const onlyNew=()=>$('input[name="pe-a"]:checked').value==="new";
  const draw=()=>{PE={lessons:$("#pe-l").checked,cards:$("#pe-c").checked,quiz:$("#pe-q").checked};
    const mods=scope();$("#pe-paper").innerHTML=paper(mods);
    const all=ankiFile(mods,false).count,left=ankiFile(mods,true).count;
    $("#pe-count").textContent=`${all} cards in this scope, ${left} not mastered yet. The file imports straight into Anki as Basic cards, tagged by module.`};
  $("#pe-scope").onchange=()=>{const v=$("#pe-scope").value;history.replaceState(null,"","#print"+(v?"-"+v:""));draw()};
  ["#pe-l","#pe-c","#pe-q"].forEach(s=>$(s).onchange=draw);
  $("#pe-print").onclick=()=>window.print();
  $("#pe-anki").onclick=()=>{const mods=scope(),f=ankiFile(mods,onlyNew());
    if(!f.count){alert("Every card in this scope is already mastered. Choose All cards to export them anyway.");return}
    const part=mods.length===MODULES.length?"all":mods[0].slug;
    download(`${TAG}-${part}-anki${onlyNew()?"-unmastered":""}.txt`,f.text)};
  draw();
}

/* ---------- hook into the engine ---------- */
const baseRoute=route,baseHome=renderHome,baseOpen=openModule;
route=function(){
  const h=location.hash.slice(1);
  if(h==="print"||h.startsWith("print-")){clearInterval(examTimer);renderPrint(h.slice(6));window.scrollTo(0,0);return}
  return baseRoute.apply(this,arguments);
};
renderHome=function(){
  const r=baseHome.apply(this,arguments);
  const h=$("#head");if(h&&!h.querySelector(".pe-link"))h.insertAdjacentHTML("beforeend",`<a class="pe-link" href="#print">Print summary &amp; Anki export</a>`);
  return r;
};
openModule=function(m){
  const r=baseOpen.apply(this,arguments);
  const h=$("#head");if(h&&!h.querySelector(".pe-link"))h.insertAdjacentHTML("beforeend",`<a class="pe-link" href="#print-${m.slug}">Print or export this module</a>`);
  return r;
};
window.PrintExport={ankiFile,paper,renderPrint};
})();
