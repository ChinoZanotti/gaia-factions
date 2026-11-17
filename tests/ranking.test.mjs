// Test del motor de ranking (src/data/data.js). Sin dependencias: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../src/data/data.js';

// Los casos conocidos del artículo 01 son del nivel Competitivo (el que usaba la app antes de agregar niveles).
const base = { players: 4, auction: false, level: 'competitive', scorings: [], rivals: [], blocked: [] };
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
test('ajuste de puntuación final = (promedio − 50) × 0.28 × peso de la facción', () => {
  const r = byId({ scorings: ['planet', 'sat'] });
  assert.ok(Math.abs(r.geodens.finalAdj - ((97 + 55) / 2 - 50) * 0.28 * 1.15) < 1e-9);
  assert.ok(Math.abs(r.ivits.finalAdj - ((40 + 15) / 2 - 50) * 0.28 * 0.64) < 1e-9);
});
test('peso de la puntuación final: 14 facciones, promedio ≈ 1, Ivits el menor (0,64)', () => {
  const w = D.FINAL_WEIGHT, v = D.IDS.map((id) => w[id]);
  assert.ok(v.every((x) => x > 0.5 && x < 1.5));
  assert.ok(Math.abs(v.reduce((a, b) => a + b, 0) / v.length - 1) < 0.01);
  assert.equal(Math.min(...v), w.ivits);
  assert.equal(w.ivits, 0.64);
});
test('Ivits: con Tipos + Satélites (4p, Con experiencia) queda 2.º, detrás de Taklons', () => {
  assert.deepEqual(order({ level: 'experienced', scorings: ['planet', 'sat'] }).slice(0, 3), ['taklons', 'ivits', 'itars']);
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

// ---- Valores fuente: columna "alto" de las tablas del artículo 01 (docs/datos/tablas/01-tier-list-facciones),
// transcriptos por separado de data.js. 4p: >300 elo; 2p/3p: >250 elo; todos con mínimo 120.
// free = "Avg. Rank Without Bid"; auction = "Avg. Rank".
const SOURCE = {
  4: {
    free: { taklons: 2.19, ivits: 2.19, itars: 2.23, nevlas: 2.30, terrans: 2.30, ambas: 2.46, 'bal-taks': 2.57, firaks: 2.60, xenos: 2.63, geodens: 2.68, 'hadsch-hallas': 2.71, lantids: 2.91, bescods: 2.91, gleens: 2.94 },
    auction: { nevlas: 2.29, terrans: 2.36, ivits: 2.38, itars: 2.41, taklons: 2.45, firaks: 2.49, 'bal-taks': 2.51, geodens: 2.52, ambas: 2.56, xenos: 2.56, lantids: 2.59, bescods: 2.65, 'hadsch-hallas': 2.72, gleens: 2.79 },
  },
  3: {
    free: { ivits: 1.67, terrans: 1.81, itars: 1.86, taklons: 1.87, nevlas: 1.95, 'hadsch-hallas': 1.96, firaks: 2.00, ambas: 2.12, xenos: 2.16, geodens: 2.19, bescods: 2.20, 'bal-taks': 2.25, lantids: 2.29, gleens: 2.31 },
    auction: { nevlas: 1.71, terrans: 1.74, ivits: 1.80, taklons: 1.90, firaks: 1.94, 'hadsch-hallas': 1.96, xenos: 2.04, itars: 2.12, ambas: 2.12, lantids: 2.15, geodens: 2.16, 'bal-taks': 2.19, bescods: 2.21, gleens: 2.31 },
  },
  2: {
    free: { ivits: 1.31, 'hadsch-hallas': 1.42, itars: 1.43, geodens: 1.44, nevlas: 1.45, taklons: 1.48, 'bal-taks': 1.49, ambas: 1.55, terrans: 1.57, firaks: 1.57, bescods: 1.61, xenos: 1.62, gleens: 1.63, lantids: 1.78 },
    auction: { ivits: 1.36, 'hadsch-hallas': 1.40, 'bal-taks': 1.42, geodens: 1.42, itars: 1.44, nevlas: 1.49, terrans: 1.55, taklons: 1.55, firaks: 1.56, ambas: 1.57, xenos: 1.58, gleens: 1.60, bescods: 1.61, lantids: 1.70 },
  },
};
test('RANK coincide con las tablas del artículo 01 (84 valores)', () => {
  for (const p of [2, 3, 4]) for (const m of ['free', 'auction']) for (const f of D.IDS) {
    assert.equal(D.RANK[p][m][f], SOURCE[p][m][f], `RANK[${p}].${m}.${f}`);
  }
});
test('3p sin subasta: orden esperado (Ambas 8ª con 2,12)', () => {
  assert.deepEqual(order({ players: 3 }), ['ivits', 'terrans', 'itars', 'taklons', 'nevlas', 'hadsch-hallas', 'firaks', 'ambas', 'xenos', 'geodens', 'bescods', 'bal-taks', 'lantids', 'gleens']);
});

// ---- Nivel de la mesa ----
const lvl = (level, patch = {}) => order({ ...patch, level });
test('niveles: Competitivo es exactamente RANK; los tres tienen las 14 facciones en rango válido', () => {
  assert.equal(D.RANK_BY_LEVEL.competitive, D.RANK);
  assert.deepEqual(D.LEVELS.map((l) => l.id), ['learning', 'experienced', 'competitive']);
  for (const l of D.LEVELS) for (const p of [2, 3, 4]) for (const m of ['free', 'auction']) {
    const t = D.RANK_BY_LEVEL[l.id][p][m];
    assert.deepEqual(Object.keys(t).sort(), [...D.IDS].sort(), `${l.id} ${p} ${m}`);
    for (const v of Object.values(t)) assert.ok(v >= 1 && v <= p, `${l.id} ${p} ${m}: ${v}`);
    for (const id of D.IDS) assert.ok(D.GAMES[l.id][p][id] > 0, `partidas ${l.id} ${p} ${id}`);
  }
});
test('niveles: promedio ponderado por partidas (control a mano)', () => {
  // Taklons 4p sin subasta: 150–200 = 2,22 (481 partidas), 200–250 = 2,04 (376) → 2,14
  assert.equal(D.RANK_BY_LEVEL.experienced[4].free.taklons, 2.14);
  assert.equal(D.GAMES.experienced[4].taklons, 857);
  // Ivits 2p sin subasta: <100 = 1,24 (464), 100–150 = 1,25 (500) → 1,25
  assert.equal(D.RANK_BY_LEVEL.learning[2].free.ivits, 1.25);
});
test('nivel por defecto: Con experiencia; un nivel desconocido usa el de defecto', () => {
  assert.equal(D.DEFAULT_LEVEL, 'experienced');
  const s = { players: 4, auction: false, scorings: [], rivals: [], blocked: [] };
  const exp = D.rank({ ...s, level: 'experienced' }).map((r) => r.id);
  assert.deepEqual(D.rank(s).map((r) => r.id), exp);
  assert.deepEqual(D.rank({ ...s, level: '__proto__' }).map((r) => r.id), exp);
});
test('niveles 4p sin subasta: top 3 y los cambios conocidos (Nevlas baja, Ambas sube)', () => {
  assert.deepEqual(lvl('learning').slice(0, 3), ['ivits', 'itars', 'ambas']);
  assert.deepEqual(lvl('experienced').slice(0, 3), ['taklons', 'ivits', 'itars']);
  assert.equal(lvl('competitive').indexOf('nevlas') + 1, 5);
  assert.equal(lvl('experienced').indexOf('nevlas') + 1, 8);
  assert.equal(lvl('learning').indexOf('nevlas') + 1, 9);
  assert.equal(lvl('learning').indexOf('ambas') + 1, 3);
});
test('niveles 2p sin subasta: Hadsch Hallas 2.º en Competitivo, 9.º en Aprendiendo; Ivits siempre 1.º', () => {
  assert.equal(lvl('competitive', { players: 2 }).indexOf('hadsch-hallas') + 1, 2);
  assert.equal(lvl('learning', { players: 2 }).indexOf('hadsch-hallas') + 1, 9);
  for (const l of ['learning', 'experienced', 'competitive']) assert.equal(lvl(l, { players: 2 })[0], 'ivits');
});
test('aviso de muestra chica: solo 3p Competitivo (15–55 partidas por facción)', () => {
  for (const p of [2, 3, 4]) for (const l of D.LEVELS) {
    const n = D.sampleNote(p, l.id);
    if (p === 3 && l.id === 'competitive') { assert.equal(n.min, 15); assert.equal(n.max, 55); assert.ok(n.margin >= 0.3); }
    else assert.equal(n, null, `${p} ${l.id}`);
  }
});
test('nota de fuente según nivel y jugadores', () => {
  assert.equal(D.sourceOf(4, 'competitive'), 'mesas con elo promedio mayor a 300 y puntaje mínimo 120');
  assert.equal(D.sourceOf(3, 'competitive'), 'mesas con elo promedio mayor a 250 y puntaje mínimo 120');
  assert.equal(D.sourceOf(2, 'experienced'), 'mesas con elo promedio de 150 a 250');
  assert.equal(D.sourceOf(4, 'learning'), 'mesas con elo promedio menor a 150');
});
