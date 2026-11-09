/* IT Quick Reference: tabbed cheat sheets with cross-sheet search, copy-to-clipboard commands,
   a few calculators and drills, and print layouts for one sheet or all of them. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rows = txt => txt.trim().split("\n").map(l => l.split("|"));

const EXAMS = { A: ["A+", "aplus"], N: ["Network+", "netplus"], S: ["Security+", "securityplus"], C: ["CCNA", "ccna"] };
const GUIDE = { aplus: "A+", netplus: "Network+", securityplus: "Security+", az900: "AZ-900", ccna: "CCNA" };

/* table(headers, rows): rows are arrays of cell HTML; opts.cls adds a table class, opts.attr(row,i) adds tr attributes */
function table(head, body, opts = {}) {
  return `<div class="tw"><table class="t ${opts.cls || ""}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
    body.map((r, i) => `<tr class="r"${opts.attr ? " " + opts.attr(r, i) : ""}>${r.map((c, j) => `<td data-l="${esc(head[j]).replace(/<[^>]+>/g, "")}">${c}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}
const blk = (title, html, cls = "") => `<div class="blk ${cls}">${title ? `<h3>${title}</h3>` : ""}${html}</div>`;
const tool = (title, html) => blk(title, html, "ns noprint tool");
const list = (items, ordered) => `<${ordered ? "ol" : "ul"} class="facts">${items.map(t => `<li class="r">${t}</li>`).join("")}</${ordered ? "ol" : "ul"}>`;

/* A command cell: each "·"-separated piece is its own copy button. In IOS, " / " means "next line". */
function cmdCell(raw, ios) {
  return raw.split(/\s+·\s+/).map(piece => {
    const [cmd, prompt] = piece.split(/\s+→\s+/);
    const copy = ios ? cmd.replace(/\s\/\s/g, "\n") : cmd;
    return `<button class="cmd" type="button" data-copy="${esc(copy)}" title="Copy"><code>${esc(cmd)}</code></button>${prompt ? `<span class="prompt">→ <code>${esc(prompt)}</code></span>` : ""}`;
  }).join(" ");
}
function cmdSheet(sections, ios) {
  return sections.map(([title, items]) => blk(title, table(["Command", "What it does"], items.map(([c, d]) => [cmdCell(c, ios), esc(d)]), { cls: "cmds" }))).join("");
}
const links = ids => `<p class="more ns noprint">Go deeper: ${ids.map(id => `<a href="../${id}/">${GUIDE[id]} guide</a>`).join(" · ")}</p>`;

/* ---------- Sheets ---------- */
const SHEETS = [
  { id: "ports", nav: "Ports", glyph: "PORT", title: "Ports and protocols", lead: "The port numbers that show up on every IT exam and every firewall rule. Learn the clear-text protocol and its secure replacement as a pair.", guides: ["netplus", "aplus", "securityplus", "ccna"], render() {
    const P = rows(PORTS);
    return tool("Filter by exam", `<div class="chips" role="group" aria-label="Filter ports by exam"><button type="button" class="chip on" data-ex="">All</button>${Object.entries(EXAMS).map(([k, [n]]) => `<button type="button" class="chip" data-ex="${k}">${n}</button>`).join("")}</div>`)
      + blk("", table(["Port", "Transport", "Protocol", "What it does", "Secure alternative", "Exams"], P.map(([port, tr, name, what, sec, ex]) => [
        `<b class="port">${esc(port)}</b>`, `<span class="tr">${esc(tr)}</span>`, `<b>${esc(name)}</b>`, esc(what), sec === "—" ? `<span class="dim">—</span>` : esc(sec),
        ex === "—" ? `<span class="dim">General</span>` : [...ex].map(k => `<span class="ex ex-${k}">${EXAMS[k][0]}</span>`).join("")
      ]), { cls: "ports", attr: (r, i) => `data-ex="${P[i][5]}"` }))
      + `<p class="note">Security+ and CCNA don't publish a fixed port list. Their tags mark ports their objectives cover. Network+ N10-009 and A+ 220-1201 list ports directly.</p>`
      + tool("Port drill", `<div class="drill" id="drill"></div>`)
      + blk("No port: IP protocol numbers", table(["Number", "Protocol", "Use"], rows(PROTO_NUMS).map(([n, p, u]) => [`<b class="port">${n}</b>`, `<b>${p}</b>`, esc(u)])))
      + blk("TCP vs UDP", table(["", "TCP", "UDP"], rows(TCP_UDP).map(([a, b, c]) => [`<b>${a}</b>`, esc(b), esc(c)])))
      + blk("Port ranges", table(["Range", "Name", "Meaning"], [["0 – 1023", "Well-known", "System services (needs admin rights to listen on most OSes)"], ["1024 – 49151", "Registered", "Assigned to specific applications"], ["49152 – 65535", "Dynamic / ephemeral", "Temporary client-side ports"]].map(([a, b, c]) => [`<b class="port">${a}</b>`, `<b>${b}</b>`, c])));
  } },
  { id: "subnetting", nav: "Subnetting", glyph: "/24", title: "Subnetting", lead: "Masks, host counts and the shortcut method. Hosts = 2^(host bits) − 2, because the network and broadcast addresses aren't usable.", guides: ["netplus", "ccna", "aplus"], render() {
    const cidr = [];
    for (let n = 8; n <= 32; n++) {
      const m = n ? (0xffffffff << (32 - n)) >>> 0 : 0, oct = [24, 16, 8, 0].map(s => (m >>> s) & 255);
      const blockSz = 256 - oct[Math.min(3, Math.floor((n - 1) / 8))];
      const hosts = n === 32 ? "1" : n === 31 ? "2 (point-to-point)" : (2 ** (32 - n) - 2).toLocaleString("en-US");
      cidr.push([`<b class="port">/${n}</b>`, `<code>${oct.join(".")}</code>`, `<code>${oct.map(o => 255 - o).join(".")}</code>`, `${blockSz} <span class="dim">(octet ${Math.floor((n - 1) / 8) + 1})</span>`, (2 ** (32 - n)).toLocaleString("en-US"), hosts]);
    }
    return tool("Subnet calculator", `<form class="calc" id="subcalc" onsubmit="return false"><label>IP address <input id="sc-ip" value="192.168.10.77" inputmode="decimal" autocomplete="off" spellcheck="false"></label><label>Prefix <span class="pfx">/<input id="sc-n" type="number" min="0" max="32" value="26"></span></label><input id="sc-r" type="range" min="0" max="32" value="26" aria-label="Prefix length"></form><div id="sc-out" class="calc-out" aria-live="polite"></div>`)
      + blk("CIDR reference", table(["CIDR", "Subnet mask", "Wildcard", "Block size", "Addresses", "Usable hosts"], cidr, { cls: "cidr", attr: r => `data-n="${r[0].replace(/\D/g, "")}"` }))
      + blk("The magic number method", list(MAGIC.map(([t, d]) => `<b>${t}.</b> ${d}`), true))
      + blk("Powers of 2", `<div class="pow">${Array.from({ length: 17 }, (_, i) => `<span class="r"><b>2<sup>${i}</sup></b>${(2 ** i).toLocaleString("en-US")}</span>`).join("")}</div><p class="note">Need N hosts? Find the smallest 2^h with 2^h − 2 ≥ N, then the prefix is /(32 − h). Need N subnets? Borrow b bits where 2^b ≥ N.</p>`)
      + blk("Special IPv4 ranges", table(["Range", "Purpose", "Addresses"], rows(RANGES).map(([a, b, c]) => [`<code>${esc(a)}</code>`, `<b>${esc(b)}</b>`, esc(c)])))
      + blk("Classful addressing (legacy, still tested)", table(["Class", "First octet", "Default mask", "Leading bits"], rows(CLASSES).map(([a, b, c, d]) => [`<b>${a}</b>`, b, esc(c), `<code>${d}</code>`])) + `<p class="note">127 is reserved for loopback, so Class A stops at 126.</p>`)
      + blk("IPv6 address types", table(["Prefix", "Type", "Notes"], rows(IPV6).map(([a, b, c]) => [`<code>${esc(a)}</code>`, `<b>${b}</b>`, esc(c)])))
      + blk("IPv6 rules of thumb", list(IPV6_FACTS.map(esc)));
  } },
  { id: "osi", nav: "OSI model", glyph: "L1–7", title: "OSI and TCP/IP models", lead: "Top down: All People Seem To Need Data Processing. Bottom up: Please Do Not Throw Sausage Pizza Away.", guides: ["netplus", "aplus", "ccna"], render() {
    return blk("", `<div class="stack">${rows(OSI).map(([n, name, pdu, job, protos, dev]) => `<div class="layer r l${n}"><div class="ln">${n}</div><div class="lbody"><div class="lt"><b>${name}</b><span class="pdu">${esc(pdu)}</span></div><p>${esc(job)}</p><dl><dt>Protocols</dt><dd>${esc(protos)}</dd><dt>Devices</dt><dd>${esc(dev)}</dd></dl></div></div>`).join("")}</div>`)
      + blk("TCP/IP (4-layer) model", table(["TCP/IP layer", "OSI layers", "Examples"], rows(TCPIP).map(([a, b, c]) => [`<b>${a}</b>`, b, esc(c)])) + `<p class="note">*ARP is often placed between layers 2 and 3. It resolves IP addresses to MAC addresses on the local network.</p>`)
      + blk("Encapsulation", `<div class="encap r"><span class="e-data">Data</span><span>→</span><span class="e-seg">+ TCP/UDP header = Segment</span><span>→</span><span class="e-pkt">+ IP header = Packet</span><span>→</span><span class="e-frm">+ MAC header &amp; FCS trailer = Frame</span><span>→</span><span class="e-bit">Bits on the wire</span></div><p class="note">The receiver reverses it (de-encapsulation). Switches read up to layer 2, routers to layer 3.</p>`)
      + blk("Troubleshoot by layer", list([
        "<b>Layer 1:</b> cable unplugged or damaged, bad port, no link light, interference, attenuation",
        "<b>Layer 2:</b> wrong VLAN, duplex mismatch, STP blocking, MAC table issues, port security shutdown",
        "<b>Layer 3:</b> wrong IP, mask or gateway, missing route, APIPA address (DHCP failed)",
        "<b>Layer 4:</b> port blocked by a firewall or ACL, service not listening",
        "<b>Layer 7:</b> DNS failure, expired certificate, application misconfiguration"
      ]));
  } },
  { id: "windows", nav: "Windows", glyph: "WIN", title: "Windows commands", lead: "Command Prompt and PowerShell tools for support work. Click any command to copy it. Most repair tools need an elevated (Run as administrator) prompt.", guides: ["aplus"], render() { return cmdSheet(WINDOWS); } },
  { id: "linux", nav: "Linux", glyph: "$_", title: "Linux commands", lead: "Shell essentials for support and admin work. Click any command to copy it. Prefix with sudo when you need root.", guides: ["aplus", "securityplus"], render() {
    return tool("chmod calculator", `<div class="chmod" id="chmod">${["Owner", "Group", "Others"].map((w, i) => `<fieldset><legend>${w}</legend>${["Read", "Write", "Execute"].map((p, j) => `<label><input type="checkbox" data-i="${i}" data-b="${4 >> j}"${[7, 5, 5][i] & (4 >> j) ? " checked" : ""}> ${p}</label>`).join("")}</fieldset>`).join("")}<div class="chmod-out"><label>Octal <input id="ch-oct" value="755" maxlength="3" inputmode="numeric"></label><code id="ch-sym">rwxr-xr-x</code><button class="cmd" type="button" id="ch-copy" data-copy="chmod 755 file"><code>chmod 755 file</code></button></div></div><p class="note">Read = 4, write = 2, execute = 1. Add them per group: 7 = rwx, 6 = rw-, 5 = r-x, 4 = r--. Common: 644 files, 755 scripts and folders, 600 private keys.</p>`)
      + cmdSheet(LINUX);
  } },
  { id: "ios", nav: "Cisco IOS", glyph: "IOS", title: "Cisco IOS commands", lead: "Router and switch CLI for CCNA labs. Click a command to copy it. Steps joined with / are separate lines.", guides: ["ccna", "netplus"], render() { return cmdSheet(IOS, true) + blk("Administrative distance", table(["Source", "AD"], [["Connected", "0"], ["Static", "1"], ["eBGP", "20"], ["EIGRP (internal)", "90"], ["OSPF", "110"], ["IS-IS", "115"], ["RIP", "120"], ["EIGRP (external)", "170"], ["iBGP", "200"], ["Unusable", "255"]].map(([a, b]) => [a, `<b class="port">${b}</b>`]))) + `<p class="note">Lower AD wins between routing sources. Within one source, the longest prefix match wins first.</p>`; } },
  { id: "acronyms", nav: "Acronyms", glyph: "A–Z", title: "Acronyms", lead: "The acronyms that come up across A+, Network+, Security+, CCNA and AZ-900. Type in the search box at the top to jump to one.", guides: ["aplus", "netplus", "securityplus", "ccna", "az900"], render() {
    const A = rows(ACRONYMS), area = { N: "Networking", S: "Security", H: "Hardware", C: "Cloud", O: "Operations" };
    return tool("Filter by area", `<div class="chips" role="group" aria-label="Filter acronyms by area"><button type="button" class="chip on" data-ar="">All ${A.length}</button>${Object.entries(area).map(([k, n]) => `<button type="button" class="chip" data-ar="${k}">${n}</button>`).join("")}</div>`)
      + blk("", `<dl class="acr">${A.map(([a, m, t]) => `<div class="r a-${t}" data-ar="${t}"><dt>${esc(a)}</dt><dd>${esc(m)}</dd></div>`).join("")}</dl>`);
  } },
  { id: "troubleshoot", nav: "Troubleshooting", glyph: "1→7", title: "Troubleshooting method", lead: "The CompTIA methodology. Network+ uses these 7 steps. A+ uses 6, combining steps 4 and 5 into one.", guides: ["aplus", "netplus"], render() {
    return blk("", `<ol class="steps">${TROUBLE.map(([t, d], i) => `<li class="r"><span class="sn">${i + 1}</span><div><b>${t}</b><p>${esc(d)}</p></div></li>`).join("")}</ol>`)
      + blk("Quick checks before you dig in", list(["Is it plugged in, powered on and connected?", "Can you reproduce it? Does it happen for one user, many, or everyone?", "What changed recently: updates, new hardware, new software, config changes?", "Check the logs: Event Viewer, syslog, journalctl, the device log", "Reboot only after you've captured the error and any evidence you need"]));
  } },
  { id: "wifi", nav: "Wi-Fi", glyph: "Wi-Fi", title: "Wi-Fi standards", lead: "Speeds are theoretical maximums. Real throughput is often half or less.", guides: ["netplus", "aplus"], render() {
    return blk("802.11 standards", table(["Standard", "Name", "Bands", "Max rate", "Notes"], rows(WIFI).map(([a, b, c, d, e]) => [`<b class="port">${a}</b>`, b === "—" ? `<span class="dim">—</span>` : `<b>${b}</b>`, esc(c), esc(d), esc(e)])))
      + blk("Wireless security", table(["Protocol", "Encryption", "Notes"], rows(WIFI_SEC).map(([a, b, c]) => [`<b>${a}</b>`, esc(b), esc(c)])))
      + blk("Placement and channels", list(WIFI_FACTS.map(esc)));
  } },
  { id: "cables", nav: "Cables", glyph: "RJ45", title: "Cables and connectors", lead: "Copper runs top out at 100 m (328 ft). Use plenum-rated cable in air-handling spaces above ceilings and below floors.", guides: ["aplus", "netplus"], render() {
    const pins = (p, name) => `<div class="pinout r"><b>${name}</b><ol>${p.map((c, i) => { const [a, b] = c.toLowerCase().split("/"); const base = b || a; return `<li><span class="wire w-${base}${b ? " striped" : ""}" aria-hidden="true"></span><span class="pn">${i + 1}</span>${c}</li>`; }).join("")}</ol></div>`;
    return blk("Twisted pair categories", table(["Category", "Max speed", "Max length", "Notes"], rows(CABLES).map(([a, b, c, d]) => [`<b>${a}</b>`, esc(b), c, esc(d)])))
      + blk("T568A and T568B wiring", `<div class="pins">${pins(PINOUT_B, "T568B (most common)")}${pins(PINOUT_A, "T568A")}</div><p class="note">Same standard on both ends = straight-through (PC to switch). T568A on one end and T568B on the other = crossover (like devices, though Auto-MDIX makes this mostly unneeded). Pins 1, 2, 3 and 6 carry 10/100 traffic; gigabit uses all 8.</p>`)
      + blk("Fiber", table(["Type", "Light source", "Distance", "Notes"], rows(FIBER).map(([a, b, c, d]) => [`<b>${a}</b>`, esc(b), esc(c), esc(d)])))
      + blk("Connectors", table(["Connector", "Use"], rows(CONNECTORS).map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)])))
      + blk("Ethernet standards", table(["Standard", "Speed", "Media"], rows(ETH_STD).map(([a, b, c]) => [`<b class="port">${a}</b>`, b, esc(c)])))
      + blk("Coax", list(["<b>RG-6:</b> cable internet and TV, F-type connector", "<b>RG-59:</b> older and thinner, CCTV and short video runs"]));
  } },
  { id: "raid", nav: "RAID", glyph: "RAID", title: "RAID levels", lead: "RAID protects against drive failure, not deletion, ransomware or fire. It is not a backup.", guides: ["aplus", "securityplus"], render() {
    return blk("", table(["Level", "Method", "Min drives", "Survives", "Usable capacity", "Notes"], rows(RAID).map(([a, b, c, d, e, f]) => [`<b class="port">RAID ${a}</b>`, `<b>${b}</b>`, c, esc(d), esc(e), esc(f)])))
      + tool("RAID capacity calculator", `<form class="calc" id="raidcalc" onsubmit="return false"><label>Level <select id="rc-l"><option value="0">RAID 0</option><option value="1">RAID 1</option><option value="5" selected>RAID 5</option><option value="6">RAID 6</option><option value="10">RAID 10</option></select></label><label>Drives <input id="rc-n" type="number" min="2" max="24" value="4"></label><label>Size each (TB) <input id="rc-s" type="number" min="0.1" step="0.1" value="4"></label></form><div id="rc-out" class="calc-out" aria-live="polite"></div>`)
      + blk("Backup types", table(["Type", "Backs up", "Clears archive bit", "Restore needs"], [["Full", "Everything", "Yes", "The last full"], ["Incremental", "Changes since the last backup of any kind", "Yes", "Last full + every incremental since"], ["Differential", "Changes since the last full", "No", "Last full + the latest differential"], ["Snapshot", "Point-in-time state of a VM or volume", "—", "The snapshot"]].map(([a, b, c, d]) => [`<b>${a}</b>`, b, c, d])) + `<p class="note">3-2-1 rule: 3 copies of your data, on 2 different media, with 1 off-site (and ideally one offline or immutable).</p>`);
  } },
  { id: "attacks", nav: "Attacks", glyph: "ATK", title: "Attacks and defenses", lead: "Match each attack to the control that stops it. That pairing is how most Security+ questions are written.", guides: ["securityplus", "netplus", "ccna"], render() {
    const A = rows(ATTACKS), cats = [...new Set(A.map(r => r[3]))];
    return cats.map(c => blk(c, table(["Attack", "What it is", "Defenses"], A.filter(r => r[3] === c).map(([a, b, d]) => [`<b>${esc(a)}</b>`, esc(b), `<span class="def">${esc(d)}</span>`]), { cls: "atk" }))).join("");
  } }
];

/* ---------- Build the page ---------- */
function build() {
  $("#nav").innerHTML = SHEETS.map(s => `<a href="#${s.id}" data-id="${s.id}"><span class="gl">${s.glyph}</span>${s.nav}</a>`).join("");
  $("#sheets").innerHTML = SHEETS.map(s => `<section class="sheet" id="s-${s.id}" data-id="${s.id}" aria-labelledby="h-${s.id}">
    <div class="sheet-head"><div><div class="eyebrow">IT quick reference</div><h2 id="h-${s.id}">${s.title}</h2></div><button type="button" class="btn ghost noprint" data-print="one">Print this sheet</button></div>
    <p class="lead ns">${s.lead}</p>${s.render()}${links(s.guides)}</section>`).join("");
}

/* ---------- Routing ---------- */
let current = "ports";
function route() {
  const id = location.hash.slice(1);
  current = SHEETS.some(s => s.id === id) ? id : "ports";
  $$(".sheet").forEach(s => s.classList.toggle("on", s.dataset.id === current));
  $$("#nav a").forEach(a => a.setAttribute("aria-current", a.dataset.id === current ? "page" : "false"));
  const a = $(`#nav a[data-id="${current}"]`); if (a) a.scrollIntoView({ block: "nearest", inline: "nearest" });
  document.title = `${SHEETS.find(s => s.id === current).title} · IT Quick Reference`;
}

/* ---------- Search across every sheet ---------- */
function search(q) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  document.body.classList.toggle("searching", terms.length > 0);
  let total = 0;
  $$(".sheet").forEach(sh => {
    let n = 0;
    $$(".r", sh).forEach(r => {
      const t = r.dataset.t || (r.dataset.t = (r.children.length ? [...r.children].map(c => c.textContent).join(" ") : r.textContent).toLowerCase());
      const hit = !terms.length || terms.every(w => t.includes(w));
      r.classList.toggle("qhide", !hit);
      if (hit && terms.length && !r.classList.contains("fhide")) n++;
    });
    $$(".blk", sh).forEach(b => b.classList.toggle("qempty", terms.length > 0 && !$$(".r", b).some(r => !r.classList.contains("qhide") && !r.classList.contains("fhide"))));
    sh.classList.toggle("has", n > 0);
    total += n;
  });
  const out = $("#qcount");
  out.textContent = terms.length ? (total ? `${total} match${total === 1 ? "" : "es"} across ${$$(".sheet.has").length} sheet${$$(".sheet.has").length === 1 ? "" : "s"}` : "No matches. Try a shorter word.") : "";
}

/* ---------- Copy ---------- */
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1600); }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch (e) {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.append(ta); ta.select();
    try { document.execCommand("copy"); toast("Copied"); } catch (e2) { toast("Couldn't copy. Select the text instead."); }
    ta.remove();
  }
}

/* ---------- Print ---------- */
function print(all) {
  document.body.classList.toggle("print-all", all);
  window.print();
}
window.addEventListener("afterprint", () => document.body.classList.remove("print-all"));

/* ---------- Tools ---------- */
const ip2n = s => { const p = s.trim().split("."); if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || +x > 255)) return null; return p.reduce((a, x) => a * 256 + +x, 0); };
const n2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join(".");
function subnetCalc() {
  const ip = ip2n($("#sc-ip").value), n = Math.max(0, Math.min(32, parseInt($("#sc-n").value, 10) || 0)), out = $("#sc-out");
  $("#sc-r").value = n;
  $$(".cidr tr.r").forEach(r => r.classList.toggle("hl", +r.dataset.n === n));
  if (ip === null) { out.innerHTML = `<p class="bad">Enter an IPv4 address like 192.168.10.77</p>`; return; }
  const size = 2 ** (32 - n), net = Math.floor(ip / size) * size, bc = net + size - 1, mask = 2 ** 32 - size;
  const first = n >= 31 ? net : net + 1, last = n >= 31 ? bc : bc - 1, hosts = n === 32 ? 1 : n === 31 ? 2 : size - 2;
  const o1 = Math.floor(ip / 2 ** 24), cls = o1 < 128 ? "A" : o1 < 192 ? "B" : o1 < 224 ? "C" : o1 < 240 ? "D (multicast)" : "E (reserved)";
  const inR = (b, p) => Math.floor(ip / 2 ** (32 - p)) === Math.floor(ip2n(b) / 2 ** (32 - p));
  const kind = inR("10.0.0.0", 8) || inR("172.16.0.0", 12) || inR("192.168.0.0", 16) ? "Private (RFC 1918)" : inR("127.0.0.0", 8) ? "Loopback" : inR("169.254.0.0", 16) ? "APIPA / link-local" : inR("100.64.0.0", 10) ? "Carrier-grade NAT" : o1 >= 224 ? "Multicast / reserved" : "Public";
  const bin = n2ip(ip).split(".").map(o => (+o).toString(2).padStart(8, "0")).join("").split("").map((b, i) => `<span class="${i < n ? "nb" : "hb"}">${b}</span>${i % 8 === 7 && i < 31 ? "." : ""}`).join("");
  const cells = [["Network", n2ip(net) + "/" + n], ["Subnet mask", n2ip(mask)], ["Wildcard", n2ip(2 ** 32 - 1 - mask)], ["Broadcast", n === 32 ? "—" : n2ip(bc)], ["Usable range", `${n2ip(first)} – ${n2ip(last)}`], ["Usable hosts", hosts.toLocaleString("en-US")], ["Class", cls], ["Type", kind]];
  out.innerHTML = `<div class="kv">${cells.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div><div class="bin" aria-label="Address in binary"><span class="leg"><i class="nb">network bits</i> <i class="hb">host bits</i></span><code>${bin}</code></div>`;
}

function chmodFromBoxes() {
  const v = [0, 0, 0]; $$("#chmod input[type=checkbox]").forEach(c => { if (c.checked) v[+c.dataset.i] += +c.dataset.b; });
  setChmod(v.join(""), true);
}
function setChmod(oct, fromBoxes) {
  if (!/^[0-7]{3}$/.test(oct)) return;
  if (!fromBoxes) $$("#chmod input[type=checkbox]").forEach(c => (c.checked = !!(+oct[+c.dataset.i] & +c.dataset.b)));
  else $("#ch-oct").value = oct;
  $("#ch-sym").textContent = [...oct].map(d => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-")).join("");
  const b = $("#ch-copy"); b.dataset.copy = `chmod ${oct} file`; b.firstChild.textContent = `chmod ${oct} file`;
}

function raidCalc() {
  const l = $("#rc-l").value, n = Math.max(1, parseInt($("#rc-n").value, 10) || 0), s = Math.max(0, parseFloat($("#rc-s").value) || 0), out = $("#rc-out");
  const min = { 0: 2, 1: 2, 5: 3, 6: 4, 10: 4 }[l];
  if (n < min) { out.innerHTML = `<p class="bad">RAID ${l} needs at least ${min} drives.</p>`; return; }
  if (l === "10" && n % 2) { out.innerHTML = `<p class="bad">RAID 10 needs an even number of drives.</p>`; return; }
  const usable = { 0: n * s, 1: s, 5: (n - 1) * s, 6: (n - 2) * s, 10: (n / 2) * s }[l];
  const fail = { 0: "None", 1: `${n - 1} (all but one; most RAID 1 sets are 2 drives)`, 5: "1 drive", 6: "2 drives", 10: `1 per mirror pair (up to ${n / 2} if each is in a different pair)` }[l];
  const f = x => (+x.toFixed(2)).toLocaleString("en-US");
  out.innerHTML = `<div class="kv"><div><span>Raw</span><b>${f(n * s)} TB</b></div><div><span>Usable</span><b>${f(usable)} TB</b></div><div><span>Efficiency</span><b>${Math.round(usable / (n * s || 1) * 100)}%</b></div><div><span>Can lose</span><b>${fail}</b></div></div>`;
}

/* Port drill: name a protocol, pick its port */
let drill = { q: null, score: 0, seen: 0 };
function drillNext() {
  const P = rows(PORTS).filter(r => r[5] !== "—");
  const q = P[Math.floor(Math.random() * P.length)];
  const opts = new Set([q[0]]);
  while (opts.size < 4) opts.add(P[Math.floor(Math.random() * P.length)][0]);
  drill.q = q;
  $("#drill").innerHTML = `<p class="dq">Which port does <b>${esc(q[2])}</b> use?</p><div class="dopts">${[...opts].sort(() => Math.random() - .5).map(o => `<button type="button" class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div><p class="dres" aria-live="polite">Score ${drill.score} / ${drill.seen}</p>`;
}
function drillAnswer(btn) {
  if ($("#drill .opt[disabled]")) return;
  const ok = btn.dataset.o === drill.q[0];
  drill.seen++; if (ok) drill.score++;
  $$("#drill .opt").forEach(b => { b.disabled = true; if (b.dataset.o === drill.q[0]) b.classList.add("good"); });
  if (!ok) btn.classList.add("bad");
  $("#drill .dres").innerHTML = `${ok ? "Correct." : `Not quite. ${esc(drill.q[2])} is ${esc(drill.q[0])}/${esc(drill.q[1])}.`} Score ${drill.score} / ${drill.seen} <button type="button" class="btn" id="dnext">Next</button>`;
  $("#dnext").focus();
}

function filterRows(scope, attr, val, btn) {
  $$(`.chip[data-${attr}]`, scope).forEach(c => c.classList.toggle("on", c === btn));
  $$(`.r[data-${attr}]`, scope).forEach(r => r.classList.toggle("fhide", !!val && !r.dataset[attr].includes(val)));
  search($("#q").value);
}

/* ---------- Events ---------- */
function boot() {
  build(); route();
  addEventListener("hashchange", () => { route(); scrollTo(0, 0); });
  const q = $("#q");
  q.addEventListener("input", () => search(q.value));
  q.addEventListener("keydown", e => { if (e.key === "Escape") { q.value = ""; search(""); } });
  addEventListener("keydown", e => { if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") { e.preventDefault(); q.focus(); } });
  $("#nav").addEventListener("click", () => { if (q.value) { q.value = ""; search(""); } });
  document.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.copy !== undefined) copy(t.dataset.copy);
    else if (t.dataset.print) print(t.dataset.print === "all");
    else if (t.dataset.ex !== undefined) filterRows($("#s-ports"), "ex", t.dataset.ex, t);
    else if (t.dataset.ar !== undefined) filterRows($("#s-acronyms"), "ar", t.dataset.ar, t);
    else if (t.classList.contains("opt")) drillAnswer(t);
    else if (t.id === "dnext") drillNext();
  });
  ["#sc-ip", "#sc-n"].forEach(s => $(s).addEventListener("input", subnetCalc));
  $("#sc-r").addEventListener("input", e => { $("#sc-n").value = e.target.value; subnetCalc(); });
  $("#chmod").addEventListener("change", e => { if (e.target.type === "checkbox") chmodFromBoxes(); });
  $("#ch-oct").addEventListener("input", e => setChmod(e.target.value));
  $$("#raidcalc input, #raidcalc select").forEach(i => i.addEventListener("input", raidCalc));
  subnetCalc(); raidCalc(); drillNext();
}
