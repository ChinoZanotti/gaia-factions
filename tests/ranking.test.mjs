// Test del motor de ranking (src/data/data.js). Sin dependencias: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/data/data.js';

const base = { players: 4, auction: false, scorings: [], rivals: [], blocked: [] };
const order = (patch) => D.rank({ ...base, ...patch }).map((r) => r.id);
const byId = (patch) => Object.fromEntries(D.rank({ ...base, ...patch }).map((r) => [r.id, r]));

// ---- Integridad de datos ----
test('cada tabla RANK tiene las 14 facciones', () => {
  for (const p of [2, 3, 4]) for (const m of ['free', 'auction']) {
    assert.deepEqual(Object.keys(D.RANK[p][m]).sort(), [...D.IDS].sort(), `RANK[${p}].${m}`);
  }
});
test('FINAL tiene las 6 puntuaciones para cada facción, en 0–100', () => {
  const ids = D.SCORINGS.map((s) => s.id).sort();
  for (const f of D.IDS) {
    assert.deepEqual(Object.keys(D.FINAL[f]).sort(), ids, f);
    for (const v of Object.values(D.FINAL[f])) assert.ok(v >= 0 && v <= 100, f);
  }
});
test('COLORS cubre las 14 facciones exactamente una vez', () => {
  const all = D.COLORS.flatMap((c) => c.f);
  assert.equal(all.length, 14);
  assert.deepEqual([...all].sort(), [...D.IDS].sort());
});
test('GUIDE existe para cada facción', () => {
  for (const f of D.IDS) assert.ok(D.GUIDE[f] && D.GUIDE[f].openings.length > 0, f);
});

// ---- Casos conocidos (CLAUDE.md y artículo 01) ----
test('4p sin subasta: Taklons e Ivits arriba (empatados 2.19)', () => {
  assert.deepEqual(order({}).slice(0, 2).sort(), ['ivits', 'taklons']);
});
test('4p sin subasta: Gleens último', () => {
  assert.equal(order({}).at(-1), 'gleens');
});
test('4p con subasta: Nevlas primero, Gleens último', () => {
  const o = order({ auction: true });
  assert.equal(o[0], 'nevlas');
  assert.equal(o.at(-1), 'gleens');
});
test('3p sin subasta: Ivits primero', () => assert.equal(order({ players: 3 })[0], 'ivits'));
test('3p con subasta: Nevlas primero', () => assert.equal(order({ players: 3, auction: true })[0], 'nevlas'));
test('2p sin subasta: Ivits primero, Lantids último', () => {
  const o = order({ players: 2 });
  assert.equal(o[0], 'ivits');
  assert.equal(o.at(-1), 'lantids');
});
test('2p con subasta: Ivits primero', () => assert.equal(order({ players: 2, auction: true })[0], 'ivits'));

// ---- Motor ----
test('base: el mejor vale 86 y el peor 34', () => {
  for (const p of [2, 3, 4]) for (const auction of [false, true]) {
    const v = Object.values(D.baseScores(p, auction));
    assert.equal(Math.max(...v), 86);
    assert.ok(Math.abs(Math.min(...v) - 34) < 1e-9);
  }
});
test('sin puntuaciones ni rivales el puntaje es la base', () => {
  for (const r of D.rank(base)) { assert.equal(r.finalAdj, 0); assert.equal(r.rivalAdj, 0); assert.equal(r.score, r.base); }
});
test('ajuste de puntuación final = (promedio − 50) × 0.28', () => {
  const r = byId({ scorings: ['planet', 'sat'] });
  assert.ok(Math.abs(r.geodens.finalAdj - ((97 + 55) / 2 - 50) * 0.28) < 1e-9);
});
test('Tipos de planeta sube a Geodens y baja a Terrans', () => {
  const o0 = order({}), o1 = order({ scorings: ['planet'] });
  assert.ok(o1.indexOf('geodens') < o0.indexOf('geodens'));
  assert.ok(o1.indexOf('terrans') > o0.indexOf('terrans'));
});
test('rival Taklons: Ambas no disponible (mismo color) y Gleens/Lantids −4', () => {
  const r = byId({ rivals: ['taklons'] });
  assert.equal(r.ambas.unavailable, true);
  assert.equal(r.ambas.takenBy, 'taklons');
  assert.equal(r.gleens.rivalAdj, -4);
  assert.equal(r.lantids.rivalAdj, -4);
  assert.equal(r.xenos.rivalAdj, -2);
});
test('ajuste de rivales con tope −8', () => {
  const r = byId({ players: 4, rivals: ['taklons', 'nevlas', 'ambas'] }); // Gleens: −4 −4 −3 = −11
  assert.equal(r.gleens.rivalAdj, -8);
  assert.deepEqual([...r.gleens.rivalBy], ['taklons', 'nevlas', 'ambas']);
});
test('color bloqueado a mano: sus 2 facciones van al final', () => {
  const list = D.rank({ ...base, blocked: ['oxide'] });
  assert.deepEqual(list.slice(-2).map((r) => r.id).sort(), ['hadsch-hallas', 'ivits']);
  assert.ok(list.slice(-2).every((r) => r.unavailable && r.takenBy === 'blocked'));
  assert.ok(list.slice(0, -2).every((r) => !r.unavailable));
});
test('el resultado es siempre una permutación de las 14, ordenada y en 0–100', () => {
  const scs = D.SCORINGS.map((s) => s.id);
  for (const p of [2, 3, 4]) for (const auction of [false, true]) for (const a of scs) for (const b of scs) {
    if (a >= b) continue;
    const list = D.rank({ players: p, auction, scorings: [a, b], rivals: ['nevlas'], blocked: ['terra'] });
    assert.deepEqual(list.map((r) => r.id).sort(), [...D.IDS].sort());
    for (let i = 0; i < list.length; i++) {
      assert.ok(list[i].score >= 0 && list[i].score <= 100);
      if (i && list[i].unavailable === list[i - 1].unavailable) assert.ok(list[i - 1].score >= list[i].score);
    }
  }
});
test('rank no modifica el estado de entrada', () => {
  const s = { players: 3, auction: true, scorings: ['gaia'], rivals: ['xenos'], blocked: ['ice'] };
  const copy = JSON.stringify(s);
  D.rank(s);
  assert.equal(JSON.stringify(s), copy);
});
