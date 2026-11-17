// Textos del ranking. Lógica pura (sin React ni window): se testea en Node.
import { IDS, RIVAL_WHY, baseScores } from '../data/data.js';

// Puesto (1 = mejor) de cada facción solo por rango promedio del nivel, sin ajustes.
export function baseRankOrder(players, auction, level) {
  const b = baseScores(players, auction, level);
  const m = {};
  IDS.slice().sort((a, c) => b[c] - b[a]).forEach((id, i) => { m[id] = i + 1; });
  return m;
}

// Empates: facciones disponibles que muestran el mismo puntaje (redondeado) que otra. Devuelve { id: [ids empatados] }.
// La lista viene ordenada, así que los empates son contiguos. A igual puntaje el orden entre ellas es arbitrario.
export function tiesOf(list) {
  const out = {};
  const avail = list.filter((r) => !r.unavailable);
  for (const r of avail) {
    const same = avail.filter((o) => o.id !== r.id && Math.round(o.score) === Math.round(r.score)).map((o) => o.id);
    if (same.length) out[r.id] = same;
  }
  return out;
}

// "A", "A y B", "A, B y C"
function joinNames(names) {
  return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' y ' + names.at(-1);
}

// Línea corta que explica la posición de una facción. nameOf(id) devuelve el nombre visible; tiedWith, los ids empatados.
export function reasonFor(r, baseRank, players, nameOf, tiedWith = []) {
  if (r.unavailable) return r.takenBy === 'blocked' ? 'Color ocupado' : 'Color ocupado por ' + nameOf(r.takenBy);
  const parts = [];
  if (r.rivalAdj <= -2 && r.rivalBy.length) parts.push(RIVAL_WHY[r.rivalBy[0]]);
  if (r.finalAdj >= 3) parts.push('encaja con las puntuaciones finales');
  else if (r.finalAdj <= -3) parts.push('poco encaje con estas puntuaciones finales');
  if (!parts.length) parts.push(baseRank <= 4 ? 'fuerte con ' + players + ' jugadores' : baseRank >= 11 ? 'débil con ' + players + ' jugadores' : 'nivel medio con ' + players + ' jugadores');
  if (tiedWith.length) parts.push('empata con ' + joinNames(tiedWith.map(nameOf)));
  const s = parts.join(' · ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Ajuste visible en la fila (badge +N / −N): puntuaciones finales + rivales, redondeado.
export function rowAdjust(r) {
  return Math.round(r.finalAdj + r.rivalAdj);
}

// Nombre accesible de una fila: lo mismo que se ve, en una frase que un lector de pantalla lee de corrido.
export function rowLabel(r, pos, name, reason) {
  const why = reason.replace(/ · /g, ', ') + '.';
  if (r.unavailable) return name + ', no disponible. ' + why;
  const adj = rowAdjust(r);
  const adjText = adj ? ' Ajuste por tus datos: ' + (adj > 0 ? 'más ' : 'menos ') + Math.abs(adj) + '.' : '';
  return name + ', puesto ' + pos + ', puntaje ' + Math.round(r.score) + '. ' + why + adjText;
}

// Anuncio para la región viva: el top 3 disponible. Devuelve '' si no hay facciones disponibles.
export function topSummary(list, nameOf, n = 3) {
  const top = list.filter((r) => !r.unavailable).slice(0, n);
  if (!top.length) return '';
  return 'Ranking actualizado: ' + top.map((r, i) => (i + 1) + ' ' + nameOf(r.id)).join(', ') + '.';
}
