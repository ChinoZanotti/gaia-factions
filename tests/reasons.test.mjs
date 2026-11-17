// Textos del ranking (src/lib/reasons.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rank } from '../src/data/data.js';
import { baseRankOrder, reasonFor, rowAdjust, rowLabel, tiesOf, topSummary } from '../src/lib/reasons.js';

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
  assert.equal(r.terrans, 'Poco encaje con estas puntuaciones finales');
});
test('rival que penaliza va primero, unido con " · "', () => {
  const r = reasons({ rivals: ['taklons'], scorings: ['planet', 'sat'] });
  assert.equal(r.lantids, 'Cuidado: los Taklons crecen con tu carga de poder · poco encaje con estas puntuaciones finales');
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
    + '. Cuidado: los Taklons crecen con tu carga de poder, poco encaje con estas puntuaciones finales. Ajuste por tus datos: menos 13.');
  assert.match(x.geodens.label, /Ajuste por tus datos: más 8\.$/);
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

// ---- Empates y nivel en el motivo ----
const NAMES2 = { taklons: 'Taklons', ivits: 'Ivits', terrans: 'Terrans', nevlas: 'Nevlas', lantids: 'Lantids', bescods: 'Bescods', xenos: 'Xenos', 'bal-taks': "Bal T'aks" };
const nameOf2 = (id) => NAMES2[id] || id;
test('tiesOf: mismo puntaje redondeado entre disponibles (4p Competitivo: Taklons–Ivits, Terrans–Nevlas, Lantids–Bescods)', () => {
  const t = tiesOf(rank(base));
  assert.deepEqual(t.taklons, ['ivits']);
  assert.deepEqual(t.ivits, ['taklons']);
  assert.deepEqual(t.nevlas, ['terrans']);
  assert.deepEqual(Object.keys(t).sort(), ['bescods', 'ivits', 'lantids', 'nevlas', 'taklons', 'terrans']);
});
test('tiesOf: las no disponibles no empatan', () => {
  const t = tiesOf(rank({ ...base, rivals: ['taklons'] })); // Taklons y Ambas quedan sin color
  assert.ok(!('taklons' in t) && !('ivits' in t));
});
test('tiesOf: sin empates en el nivel por defecto (4p Con experiencia)', () => {
  assert.deepEqual(tiesOf(rank({ ...base, level: 'experienced' })), {});
});
test('reasonFor agrega "empata con" al final, también con 3 facciones', () => {
  const order = baseRankOrder(4, false, 'competitive'), r = rank(base).find((x) => x.id === 'ivits');
  assert.equal(reasonFor(r, order.ivits, 4, nameOf2, ['taklons']), 'Fuerte con 4 jugadores · empata con Taklons');
  assert.equal(reasonFor(r, order.ivits, 4, nameOf2, ['taklons', 'terrans', 'nevlas']), 'Fuerte con 4 jugadores · empata con Taklons, Terrans y Nevlas');
  const x = rank({ ...base, players: 3, auction: true, level: 'experienced' }), tt = tiesOf(x);
  assert.deepEqual(tt.lantids.slice().sort(), ['bescods', 'xenos']);
});
test('el motivo "fuerte / débil" usa el nivel elegido', () => {
  // Nevlas 4p: 5.ª en Competitivo (fuerte), 9.ª en Aprendiendo (nivel medio)
  const r = (level) => { const s = { ...base, level }, o = baseRankOrder(4, false, level); return reasonFor(rank(s).find((x) => x.id === 'nevlas'), o.nevlas, 4, nameOf2); };
  assert.equal(r('competitive'), 'Nivel medio con 4 jugadores');
  assert.equal(r('learning'), 'Nivel medio con 4 jugadores');
  const o = baseRankOrder(4, false, 'learning');
  assert.equal(o.ambas, 3); // Ambas: 3.ª en Aprendiendo → "fuerte" solo ahí
  assert.equal(baseRankOrder(4, false, 'competitive').ambas, 6);
});
