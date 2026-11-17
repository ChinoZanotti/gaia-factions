// Servidor local (scripts/serve.mjs): sirve archivos, rechaza lo raro y no se cae. node --test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let proc, port, dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaia-serve-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><p>ok</p>');
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'assets', 'a.js'), 'export {}');
  fs.writeFileSync(path.join(path.dirname(dir), path.basename(dir) + '-secreto.txt'), 'no');
  proc = spawn(process.execPath, [path.join(import.meta.dirname, '..', 'scripts', 'serve.mjs'), dir, '0']);
  port = await new Promise((resolve, reject) => {
    proc.stdout.on('data', (d) => { const m = String(d).match(/:(\d+)/); if (m) resolve(Number(m[1])); });
    proc.on('exit', (c) => reject(new Error('el servidor terminó: ' + c)));
  });
});
after(() => {
  proc.kill();
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(path.join(path.dirname(dir), path.basename(dir) + '-secreto.txt'), { force: true });
});

// Pedido HTTP crudo: la ruta y el Host van tal cual, sin normalizar.
function get(rawPath, host = '127.0.0.1:' + port, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: rawPath, method, headers: { Host: host } }, (res) => {
      let body = ''; res.on('data', (c) => { body += c; }); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
}

test('sirve index.html y assets con su tipo y nosniff', async () => {
  const r = await get('/');
  assert.equal(r.status, 200);
  assert.match(r.headers['content-type'], /text\/html/);
  assert.equal(r.headers['x-content-type-options'], 'nosniff');
  assert.match((await get('/assets/a.js')).headers['content-type'], /javascript/);
});
test('404 si no existe', async () => assert.equal((await get('/nada.js')).status, 404));
test('URL malformada → 400 y el servidor sigue vivo', async () => {
  assert.equal((await get('/%E0%A4%A')).status, 400);
  assert.equal((await get('/')).status, 200);
});
test('byte nulo → 400', async () => assert.equal((await get('/index.html%00.js')).status, 400));
test('path traversal → 403 (/ y \\ codificadas)', async () => {
  const name = path.basename(dir) + '-secreto.txt';
  assert.equal((await get('/..%2f' + name)).status, 403);
  assert.equal((await get('/..%5c' + name)).status, 403);
});
test('Host ajeno (DNS rebinding) → 421; localhost aceptado', async () => {
  assert.equal((await get('/', 'evil.example:' + port)).status, 421);
  assert.equal((await get('/', 'localhost:' + port)).status, 200);
});
test('solo GET/HEAD', async () => {
  assert.equal((await get('/', undefined, 'POST')).status, 405);
  const h = await get('/', undefined, 'HEAD');
  assert.equal(h.status, 200);
  assert.equal(h.body, '');
});
