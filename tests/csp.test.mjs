// CSP por <meta> (config/csp.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CSP, injectSecurityMeta, securityMetaPlugin } from '../config/csp.js';

const directives = Object.fromEntries(CSP.split('; ').map((d) => { const [k, ...v] = d.split(' '); return [k, v]; }));

test('política estricta: sin unsafe-inline/unsafe-eval ni comodines', () => {
  assert.ok(!/unsafe-|\*|data:|blob:/.test(CSP), CSP);
  assert.deepEqual(directives['default-src'], ["'none'"]);
  assert.deepEqual(directives['script-src'], ["'self'"]);
  for (const k of ['base-uri', 'form-action', 'object-src']) assert.deepEqual(directives[k], ["'none'"], k);
});
test('solo directivas válidas en <meta> (no frame-ancestors/report-uri/sandbox)', () => {
  for (const k of ['frame-ancestors', 'report-uri', 'report-to', 'sandbox']) assert.ok(!(k in directives), k);
});
test('se inserta justo después del charset del index.html real', () => {
  const html = fs.readFileSync(path.join(import.meta.dirname, '..', 'index.html'), 'utf8');
  const out = injectSecurityMeta(html);
  const lines = out.split(/\r?\n/);
  const i = lines.findIndex((l) => l.includes('<meta charset="utf-8">'));
  assert.ok(lines[i + 1].startsWith('<meta http-equiv="Content-Security-Policy" content="' + CSP + '">'));
  assert.equal(lines[i + 2], '<meta name="referrer" content="no-referrer">');
  assert.ok(out.indexOf('Content-Security-Policy') < out.indexOf('<link'), 'la CSP tiene que ir antes de cualquier recurso');
});
test('sin charset falla en vez de publicar sin CSP', () => {
  assert.throws(() => injectSecurityMeta('<html><head></head></html>'), /charset/);
});
test('el plugin solo actúa en el build', () => {
  const p = securityMetaPlugin();
  assert.equal(p.apply, 'build');
  assert.equal(p.transformIndexHtml.handler, injectSecurityMeta);
});
test('sin orígenes externos: fuentes y estilos solo del propio sitio', () => {
  assert.ok(!/https?:/.test(CSP), CSP);
  assert.deepEqual(directives['font-src'], ["'self'"]);
  assert.deepEqual(directives['style-src'], ["'self'"]);
});
