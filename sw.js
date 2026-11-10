/* Service worker for the IT Study Guides app.
   Saves the roadmap, every guide and the cheat sheets on the first visit so the whole site works offline.
   Pages are served from the saved copy right away and refreshed in the background; when a refreshed page
   differs from the saved one, open tabs are told so they can offer a reload.
   Adding a guide: add its folder to PAGES below and bump VERSION. */
const VERSION = "v2";
const CACHE = "study-guides-" + VERSION;
const FONT_CACHE = "study-guides-fonts";
const PAGES = [
  "./", "aplus/", "netplus/", "securityplus/", "securityplus/sy0-701/", "az900/", "ccna/", "cysaplus/",
  "sc500/", "linuxplus/", "ccnp/", "az104/", "cheatsheets/"
];
const ASSETS = [
  "manifest.webmanifest", "pwa.js", "mobile.css", "icons/icon.svg", "icons/icon-192.png",
  "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"
];
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
const BASE = new URL("./", self.location).href;
const SYNC_KEY = BASE + "__last-sync";
const SYNC_EVERY = 6 * 60 * 60 * 1000;

const abs = p => new URL(p, BASE).href;

/* Every page lives at folder/ and folder/index.html; save it once under folder/. */
function pageKey(url) {
  const u = new URL(url);
  u.hash = ""; u.search = "";
  if (u.pathname.endsWith("/index.html")) u.pathname = u.pathname.slice(0, -10);
  else if (!u.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(u.pathname)) u.pathname += "/";
  return u.href;
}

async function cacheFonts() {
  try {
    const cache = await caches.open(FONT_CACHE);
    const res = await fetch(FONT_CSS);
    if (!res.ok) return;
    const css = await res.clone().text();
    await cache.put(FONT_CSS, res);
    const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
    await Promise.allSettled(urls.map(async u => {
      if (await cache.match(u)) return;
      const r = await fetch(u);
      if (r.ok) await cache.put(u, r);
    }));
  } catch (e) { /* fonts are a nice-to-have; the system font fallback works offline */ }
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled([...PAGES, ...ASSETS].map(async p => {
      const res = await fetch(abs(p), { cache: "reload" });
      if (res.ok) await cache.put(abs(p), res);
    }));
    await cacheFonts();
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = [CACHE, FONT_CACHE];
    for (const k of await caches.keys()) if (k.startsWith("study-guides-") && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function notify(msg) {
  for (const c of await self.clients.matchAll({ type: "window" })) c.postMessage(msg);
}

function sameBody(a, b) {
  const ea = a.headers.get("etag"), eb = b.headers.get("etag");
  if (ea && eb) return Promise.resolve(ea === eb);
  return Promise.all([a.clone().text(), b.clone().text()]).then(([x, y]) => x === y);
}

/* Fetch a fresh copy, save it, and report whether it changed. */
async function refresh(key, request) {
  const cache = await caches.open(CACHE);
  const res = await fetch(request || key, { cache: "no-cache" });
  if (!res.ok || res.type === "opaqueredirect") return false;
  const old = await cache.match(key);
  const changed = old ? !(await sameBody(old, res)) : false;
  if (!old || changed) await cache.put(key, res.clone());
  return changed;
}

async function status() {
  const cache = await caches.open(CACHE);
  let saved = 0;
  for (const p of PAGES) if (await cache.match(abs(p))) saved++;
  return { type: "status", saved, total: PAGES.length, version: VERSION };
}

async function syncAll(force) {
  const cache = await caches.open(CACHE);
  const last = await cache.match(SYNC_KEY);
  if (!force && last && Date.now() - Number(await last.text()) < SYNC_EVERY) return;
  await cache.put(SYNC_KEY, new Response(String(Date.now())));
  const changed = [];
  await Promise.allSettled([...PAGES, ...ASSETS].map(async p => {
    if (await refresh(abs(p))) changed.push(abs(p));
  }));
  if (changed.length) await notify({ type: "updated", urls: changed });
  await notify(await status());
}

self.addEventListener("message", event => {
  const d = event.data || {};
  if (d.type === "status") event.waitUntil(status().then(s => event.source && event.source.postMessage(s)));
  if (d.type === "sync") event.waitUntil(syncAll(!!d.force).catch(() => {}));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(req.url);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") await cache.put(req.url, res.clone());
        return res;
      } catch (e) { return new Response("", { status: 504 }); }
    })());
    return;
  }

  if (!req.url.startsWith(BASE) || url.pathname.endsWith("/sw.js")) return;

  const isPage = req.mode === "navigate";
  const key = isPage ? pageKey(req.url) : (() => { const u = new URL(req.url); u.hash = ""; return u.href; })();
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key, { ignoreSearch: isPage });
    if (hit) {
      /* Serve the saved copy now; refresh it in the background and tell the page if it changed. */
      event.waitUntil(refresh(key, isPage ? key : req)
        .then(changed => changed && notify({ type: "updated", urls: [key] }))
        .catch(() => {}));
      return hit;
    }
    try {
      const res = await fetch(req);
      if (res.ok && res.type === "basic") await cache.put(key, res.clone());
      return res;
    } catch (e) {
      if (isPage) {
        const home = await cache.match(BASE);
        if (home) return home;
      }
      return new Response("Offline and not saved yet.", { status: 503, headers: { "content-type": "text/plain" } });
    }
  })());
});
