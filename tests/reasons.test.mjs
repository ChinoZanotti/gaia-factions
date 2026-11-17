// Textos del ranking (src/lib/reasons.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rank } from '../src/data/data.js';
import { baseRankOrder, reasonFor, rowAdjust, rowLabel, topSummary } from '../src/lib/reasons.js';

const NAMES = { taklons: 'Taklons', nevlas: 'Nevlas', ivits: 'Ivits', itars: 'Itars', lantids: 'Lantids', ambas: 'Ambas' };
const nameOf = (id) => NAMES[id] || id;
const base = { players: 4, auction: false, level: 'competitive', scorings: [], rivals: [], blocked: [] };
function reasons(patch) {
  const s = { ...base, ...patch }, order = baseRankOrder(s.players, s.auction, s.level);
  return Object.fromEntries(rank(s).map((r) => [r.id, reasonFor(r, order[r.id], s.players, nameOf)]));
}

test('baseRankOrder: puestos 1..14 sin repetir', () => {
  const o = baseRankOrder(4, false, 'competitive');
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

// ---- Accesibilidad del ranking ----
function rows(patch) {
  const s = { ...base, ...patch }, order = baseRankOrder(s.players, s.auction, s.level);
  return rank(s).map((r, i) => ({ r, pos: i + 1, label: rowLabel(r, i + 1, nameOf(r.id), reasonFor(r, order[r.id], s.players, nameOf)) }));
}
const byFaction = (patch) => Object.fromEntries(rows(patch).map((x) => [x.r.id, x]));

test('rowLabel: nombre, puesto, puntaje, motivo y ajuste con signo en palabras', () => {
  const x = byFaction({ scorings: ['planet', 'sat'], rivals: ['taklons'] });
  assert.equal(x.lantids.label, 'Lantids, puesto ' + x.lantids.pos + ', puntaje ' + Math.round(x.lantids.r.score)
    + '. Cuidado: los Taklons crecen con tu carga de poder, flojo en estas puntuaciones finales. Ajuste por tus datos: menos 12.');
  assert.match(x.geodens.label, /Ajuste por tus datos: más 7\.$/);
});
test('rowLabel: sin ajuste no menciona ajuste; no disponible no da puesto ni puntaje', () => {
  const x = byFaction({ rivals: ['taklons'] });
  assert.equal(x.ivits.label, 'Ivits, puesto ' + x.ivits.pos + ', puntaje ' + Math.round(x.ivits.r.score) + '. Fuerte con 4 jugadores.');
  assert.equal(x.ambas.label, 'Ambas, no disponible. Color ocupado por Taklons.');
});
test('rowLabel nunca lee el separador "·"', () => {
  for (const { label } of rows({ scorings: ['planet', 'sat'], rivals: ['taklons', 'nevlas'] })) assert.ok(!label.includes('·'), label);
});
test('rowAdjust coincide con el badge (final + rivales, redondeado)', () => {
  for (const { r } of rows({ scorings: ['gaia', 'fed'], rivals: ['nevlas'] })) assert.equal(rowAdjust(r), Math.round(r.finalAdj + r.rivalAdj));
});
test('topSummary: top 3 disponible, saltea los no disponibles', () => {
  assert.equal(topSummary(rank(base), nameOf), 'Ranking actualizado: 1 Taklons, 2 Ivits, 3 Itars.');
  const s = { ...base, blocked: ['swamp', 'oxide', 'ice', 'terra', 'desert', 'volcanic', 'titanium'] };
  assert.equal(topSummary(rank(s), nameOf), '');
});
