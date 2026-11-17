// Servidor estático mínimo (solo lectura, solo localhost) para revisar el build.
// Uso: node scripts/serve.mjs [carpeta=dist] [puerto=8080]   (antes: npm run build; puerto 0 = uno libre)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..', 'dist'));
const port = Number(process.argv[3] || 8080);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
// Solo se atiende a localhost: evita que una página externa lo lea mediante DNS rebinding.
const LOCAL_HOST = /^(127\.0\.0\.1|localhost)(:\d+)?$/;

function send(res, code, body = '') {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!LOCAL_HOST.test(req.headers.host || '')) return send(res, 421);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405);
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return send(res, 400); }
  if (p.includes('\0')) return send(res, 400);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(root, '.' + p);
  if (!file.startsWith(root + path.sep)) return send(res, 403);
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, '404');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
});
server.listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + server.address().port));
