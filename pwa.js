/* IT Study Guides app helper, loaded by the roadmap, every guide and the cheat sheets.
   Registers the offline service worker (sw.js), shows "Offline ready" and "Update ready" notices,
   and drives the "Install app" button on any element with [data-pwa-install]. */
(function () {
  "use strict";
  var script = document.currentScript;
  var BASE = new URL("./", script ? script.src : location.href).href;
  var STANDALONE = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  var IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var deferredPrompt = null;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  function pageKey(href) {
    var u = new URL(href); u.hash = ""; u.search = "";
    if (/\/index\.html$/.test(u.pathname)) u.pathname = u.pathname.slice(0, -10);
    return u.href;
  }

  /* ---------- notices ---------- */
  var css =
    ".pwa-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9000;" +
    "display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);width:max-content;padding:8px 8px 8px 14px;border-radius:16px;" +
    "background:rgba(15,23,43,.96);border:1px solid rgba(86,224,255,.35);color:#e9eefb;font:500 14px/1.3 Sora,'Segoe UI',system-ui,sans-serif;" +
    "box-shadow:0 10px 34px -12px rgba(86,224,255,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}" +
    ".pwa-bar .dot{width:8px;height:8px;border-radius:50%;background:#5fe3a1;flex:none;box-shadow:0 0 8px #5fe3a1}" +
    ".pwa-bar.off .dot{background:#ffd27a;box-shadow:0 0 8px #ffd27a}" +
    ".pwa-bar button{min-height:36px;border:0;border-radius:999px;padding:6px 14px;font:700 13.5px/1 Sora,'Segoe UI',system-ui,sans-serif;cursor:pointer;" +
    "background:linear-gradient(120deg,#56e0ff,#a495ff);color:#03141c}" +
    ".pwa-bar button.x{background:transparent;color:#8f9bbb;padding:6px 10px;font-size:18px}" +
    ".pwa-bar button:focus-visible{outline:2px solid #56e0ff;outline-offset:2px}" +
    ".pwa-sheet{position:fixed;inset:0;z-index:9001;display:grid;place-items:end center;background:rgba(3,6,14,.6);padding:12px}" +
    ".pwa-sheet>div{width:min(440px,100%);margin-bottom:env(safe-area-inset-bottom,0px);background:#0f172b;border:1px solid rgba(150,175,255,.25);" +
    "border-radius:14px;padding:18px 18px 14px;color:#e9eefb;font:300 15px/1.6 Sora,'Segoe UI',system-ui,sans-serif}" +
    ".pwa-sheet h2{margin:0 0 8px;font:700 18px/1.2 'Chakra Petch','Segoe UI',system-ui,sans-serif}" +
    ".pwa-sheet ol{margin:0 0 12px;padding-left:20px}.pwa-sheet b{font-weight:600}" +
    ".pwa-sheet button{min-height:44px;width:100%;border:1px solid rgba(150,175,255,.25);border-radius:8px;background:rgba(255,255,255,.04);color:#e9eefb;font:700 15px Sora,system-ui,sans-serif;cursor:pointer}" +
    "@media (prefers-reduced-motion:no-preference){.pwa-bar{animation:pwa-in .25s ease-out}@keyframes pwa-in{from{opacity:0;transform:translate(-50%,10px)}}}" +
    "@media print{.pwa-bar,.pwa-sheet{display:none!important}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bar = null, barTimer = null;
  function showBar(text, opts) {
    opts = opts || {};
    hideBar();
    bar = document.createElement("div");
    bar.className = "pwa-bar" + (opts.off ? " off" : "");
    bar.setAttribute("role", "status");
    var dot = document.createElement("span"); dot.className = "dot"; bar.appendChild(dot);
    var t = document.createElement("span"); t.textContent = text; bar.appendChild(t);
    if (opts.action) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = opts.action;
      b.onclick = opts.onAction; bar.appendChild(b);
    }
    var x = document.createElement("button"); x.type = "button"; x.className = "x"; x.setAttribute("aria-label", "Dismiss"); x.textContent = "×";
    x.onclick = hideBar; bar.appendChild(x);
    document.body.appendChild(bar);
    if (opts.timeout) barTimer = setTimeout(hideBar, opts.timeout);
  }
  function hideBar() {
    clearTimeout(barTimer);
    if (bar) { bar.remove(); bar = null; }
  }

  /* ---------- offline status ---------- */
  var statusEls = function () { return document.querySelectorAll("[data-pwa-status]"); };
  function setStatus(text) {
    statusEls().forEach(function (el) { el.textContent = text; el.hidden = !text; });
  }
  function onStatus(s) {
    if (s.saved >= s.total) {
      setStatus(navigator.onLine ? "✓ Offline ready" : "Offline mode");
      if (!store.get("pwa-offline-ready")) {
        store.set("pwa-offline-ready", "1");
        showBar("Offline ready: every guide is saved on this device.", { timeout: 6000 });
      }
    } else {
      setStatus("Saving for offline… " + s.saved + "/" + s.total);
    }
  }
  addEventListener("offline", function () {
    setStatus("Offline mode");
    showBar("You're offline. Saved guides still work.", { off: true, timeout: 5000 });
  });
  addEventListener("online", function () {
    hideBar();
    ask("status");
    ask("sync");
  });

  /* ---------- service worker ---------- */
  function ask(type, extra) {
    var c = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!c) return;
    var msg = { type: type }; for (var k in extra || {}) msg[k] = extra[k];
    c.postMessage(msg);
  }
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d.type === "status") onStatus(d);
      if (d.type === "updated" && (d.urls || []).indexOf(pageKey(location.href)) !== -1) {
        showBar("Update ready", { action: "Reload", onAction: function () { location.reload(); } });
      }
    });
    navigator.serviceWorker.register(BASE + "sw.js", { scope: BASE }).then(function (reg) {
      function ready() {
        ask("status");
        if (navigator.onLine) ask("sync");
      }
      if (navigator.serviceWorker.controller) ready();
      else navigator.serviceWorker.addEventListener("controllerchange", ready, { once: true });
      /* First install: the worker saves everything while installing, so check again once it is active. */
      var w = reg.installing || reg.waiting;
      if (w) w.addEventListener("statechange", function () { if (w.state === "activated") setTimeout(function () { ask("status"); }, 300); });
    }).catch(function () {});
  }

  /* ---------- install button ---------- */
  function installButtons() { return document.querySelectorAll("[data-pwa-install]"); }
  function refreshInstall() {
    var show = !STANDALONE && (deferredPrompt || IOS);
    installButtons().forEach(function (b) { b.hidden = !show; });
  }
  function iosSheet() {
    var s = document.createElement("div");
    s.className = "pwa-sheet";
    s.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="pwa-h"><h2 id="pwa-h">Install on iPhone or iPad</h2>' +
      "<ol><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>" +
      '<p style="margin:0 0 12px;color:#8f9bbb;font-size:14px">The app opens full screen and works without internet.</p>' +
      '<button type="button">Got it</button></div>';
    function close() { s.remove(); }
    s.addEventListener("click", function (e) { if (e.target === s || e.target.tagName === "BUTTON") close(); });
    s.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.body.appendChild(s);
    s.querySelector("button").focus();
  }
  addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    refreshInstall();
  });
  addEventListener("appinstalled", function () {
    deferredPrompt = null;
    STANDALONE = true;
    refreshInstall();
    showBar("Installed. Find IT Study Guides with your apps.", { timeout: 6000 });
  });
  function wire() {
    installButtons().forEach(function (b) {
      b.addEventListener("click", function () {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.finally(function () { deferredPrompt = null; refreshInstall(); });
        } else if (IOS) iosSheet();
      });
    });
    refreshInstall();
    if (!navigator.onLine) setStatus("Offline mode");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
