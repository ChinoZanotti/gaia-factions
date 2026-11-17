// Recorre la app en Chrome headless (CDP, sin dependencias) y audita a un ancho dado.
// Uso: node scripts/audit-mobile.mjs [ancho=390] [carpeta-capturas=./shots]
// Variables opcionales: APP_URL (por defecto http://127.0.0.1:8080/), CHROME_PATH.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const WIDTH = Number(process.argv[2] || 390);
const OUT = path.resolve(process.argv[3] || './shots');
const URL_ = process.env.APP_URL || 'http://127.0.0.1:8080/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-audit-'));
try { await fetch(URL_); } catch { console.error('No responde ' + URL_ + ': levantá el servidor primero.'); process.exit(1); }

const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + profile, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let ws, id = 0; const pend = new Map(); const logs = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const l = await (await fetch('http://127.0.0.1:9333/json/list')).json(); const p = l.find((t) => t.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch {}
    await wait(200);
  }
  throw new Error('no chrome');
}
function send(method, params = {}) {
  return new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function shot(name) {
  const m = await send('Page.getLayoutMetrics');
  const h = Math.ceil(m.cssContentSize.height);
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: h, scale: 1 } });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
}
const AUDIT = `(() => {
  const W = document.documentElement.clientWidth;
  const res = { view: W, scrollWidth: document.documentElement.scrollWidth, overflow: [], small: [] };
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (r.right > W + 0.5 || r.left < -0.5) res.overflow.push(el.tagName.toLowerCase() + '.' + (el.className && el.className.baseVal === undefined ? el.className : '') + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
    const inter = el.matches('button, a[href], input, select, textarea, [role=tab], [role=switch], label');
    if (inter && (r.height < 44 || r.width < 44)) res.small.push(el.tagName.toLowerCase() + '.' + el.className + ' "' + (el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  res.small = [...new Set(res.small)]; res.overflow = [...new Set(res.overflow)].slice(0, 15);
  return res;
})()`;
const click = (sel, text) => ev(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})]; const el = ${text ? `els.find(e => e.textContent.includes(${JSON.stringify(text)}))` : 'els[0]'}; if (!el) return 'NOT FOUND'; el.click(); return 'ok'; })()`);

try {
  ws = new WebSocket(await connect());
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
    if (d.method === 'Runtime.consoleAPICalled') logs.push(d.params.type + ': ' + d.params.args.map((a) => a.value ?? a.description).join(' '));
    if (d.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + d.params.exceptionDetails.exception?.description);
    if (d.method === 'Log.entryAdded') logs.push('LOG ' + d.params.entry.level + ': ' + d.params.entry.text + ' ' + (d.params.entry.url || ''));
  });
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url: URL_ });
  await wait(2500);
  const report = {};
  const step = async (name) => { await wait(600); report[name] = await ev(AUDIT); await shot(WIDTH + '-' + name); };
  report.fonts = await ev(`document.fonts.check('16px "Chakra Petch"') + ' / ' + document.fonts.check('16px Barlow')`);
  await step('1-jugadores');
  await click('.gp-bar button'); await step('2-puntuaciones');
  await click('.gp-chip', 'Tipos'); await click('.gp-chip', 'Satélites'); await step('2b-puntuaciones-elegidas');
  await click('.gp-bar button'); await click('.gp-fbtn', 'Taklons'); await click('.gp-color__head', 'Hielo'); await step('3-rivales');
  await click('.gp-bar button'); await step('4-ranking');
  await click('.gp-row'); await step('5-detalle-aperturas');
  await click('[role=tab]', 'Consejos'); await step('5b-detalle-consejos');
  await click('[role=tab]', 'Encaje'); await step('5c-detalle-encaje');
  report.logs = logs;
  console.log(JSON.stringify(report, null, 1));
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill();
}
