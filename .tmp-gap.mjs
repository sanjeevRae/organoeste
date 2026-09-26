import fs from "node:fs";

const PORT = Number(process.env.CDP_PORT || 9233);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const EXPR = `(() => {
  const q = (s) => document.querySelector(s);
  const rect = (s) => { const el = q(s); if (!el) return null; const r = el.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), h: +r.height.toFixed(1) }; };
  const lastChildBottom = (s) => { const el = q(s); if (!el) return null; let b = -1; el.querySelectorAll(".canvas > *").forEach((c) => { const r = c.getBoundingClientRect(); if (r.bottom > b) b = r.bottom; }); return +b.toFixed(1); };
  const firstChildTop = (s) => { const el = q(s); if (!el) return null; let t = Infinity; el.querySelectorAll(".canvas > *").forEach((c) => { const r = c.getBoundingClientRect(); if (r.top < t) t = r.top; }); return +t.toFixed(1); };
  const process = rect(".process-section");
  const footer = rect(".site-footer");
  return {
    vw: innerWidth,
    docSW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
    process,
    footer,
    gapBetweenSections: process && footer ? +(footer.top - process.bottom).toFixed(1) : null,
    processContentBottom: lastChildBottom(".process-section"),
    footerContentTop: firstChildTop(".site-footer"),
    footerMarginTop: q(".site-footer") ? getComputedStyle(q(".site-footer")).marginTop : null,
    visualGapBetweenContent: +(firstChildTop(".site-footer") - lastChildBottom(".process-section")).toFixed(1)
  };
})()`;

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = targets.find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
await new Promise((r) => ws.addEventListener("open", r));
await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "http://localhost:3000/" });
await sleep(9000);
for (const sel of [".process-section", ".site-footer"]) {
  await send("Runtime.evaluate", {
    expression: `(()=>{const el=document.querySelector('${sel}');if(el)window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY-120);return 'ok'})()`,
  });
  await sleep(2000);
}
await send("Runtime.evaluate", { expression: "window.scrollTo(0,0); 'ok'" });
await sleep(800);
const res = await send("Runtime.evaluate", { expression: EXPR, returnByValue: true });
const value = res.result?.result?.value;
console.log(JSON.stringify(value, null, 2));
if (process.argv[2] && value?.process) {
  const y = Math.max(0, value.processContentBottom - 150);
  const height = Math.min(value.footer.bottom - y + 40, 1600);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y, width: 1440, height, scale: 1 },
    captureBeyondViewport: true,
  });
  fs.writeFileSync(process.argv[2], Buffer.from(shot.result.data, "base64"));
  console.log("screenshot -> " + process.argv[2] + " (y=" + y + ", h=" + height + ")");
}
ws.close();
