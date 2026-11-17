// Textos del ranking (src/lib/reasons.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rank } from '../src/data/data.js';
import { baseRankOrder, reasonFor } from '../src/lib/reasons.js';

const NAMES = { taklons: 'Taklons', nevlas: 'Nevlas' };
const nameOf = (id) => NAMES[id] || id;
const base = { players: 4, auction: false, scorings: [], rivals: [], blocked: [] };
function reasons(patch) {
  const s = { ...base, ...patch }, order = baseRankOrder(s.players, s.auction);
  return Object.fromEntries(rank(s).map((r) => [r.id, reasonFor(r, order[r.id], s.players, nameOf)]));
}

test('baseRankOrder: puestos 1..14 sin repetir', () => {
  const o = baseRankOrder(4, false);
  assert.deepEqual(Object.values(o).sort((a, b) => a - b), Array.from({ length: 14 }, (_, i) => i + 1));
  assert.equal(o.gleens, 14);
});
test('sin ajustes: fuerte / nivel medio / débil según el puesto base', () => {
  const r = reasons({});
  assert.equal(r.ivits, 'Fuerte con 4 jugadores');
  assert.equal(r.ambas, 'Nivel medio con 4 jugadores');
  assert.equal(r.gleens, 'Débil con 4 jugadores');
});
test('puntuación final a favor y en contra', () => {
  const r = reasons({ scorings: ['planet'] });
  assert.equal(r.geodens, 'Encaja con las puntuaciones finales');
  assert.equal(r.terrans, 'Flojo en estas puntuaciones finales');
});
test('rival que penaliza va primero, unido con " · "', () => {
  const r = reasons({ rivals: ['taklons'], scorings: ['planet', 'sat'] });
  assert.equal(r.lantids, 'Cuidado: los Taklons crecen con tu carga de poder · flojo en estas puntuaciones finales');
});
test('color ocupado: a mano o por un rival', () => {
  const r = reasons({ rivals: ['taklons'], blocked: ['ice'] });
  assert.equal(r.ambas, 'Color ocupado por Taklons');
  assert.equal(r.nevlas, 'Color ocupado');
});
