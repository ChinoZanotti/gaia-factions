// Textos del ranking. Lógica pura (sin React ni window): se testea en Node.
import { IDS, RIVAL_WHY, baseScores } from '../data/data.js';

// Puesto (1 = mejor) de cada facción solo por rango promedio, sin ajustes.
export function baseRankOrder(players, auction) {
  const b = baseScores(players, auction);
  const m = {};
  IDS.slice().sort((a, c) => b[c] - b[a]).forEach((id, i) => { m[id] = i + 1; });
  return m;
}

// Línea corta que explica la posición de una facción. nameOf(id) devuelve el nombre visible.
export function reasonFor(r, baseRank, players, nameOf) {
  if (r.unavailable) return r.takenBy === 'blocked' ? 'Color ocupado' : 'Color ocupado por ' + nameOf(r.takenBy);
  const parts = [];
  if (r.rivalAdj <= -2 && r.rivalBy.length) parts.push(RIVAL_WHY[r.rivalBy[0]]);
  if (r.finalAdj >= 3) parts.push('encaja con las puntuaciones finales');
  else if (r.finalAdj <= -3) parts.push('flojo en estas puntuaciones finales');
  if (!parts.length) parts.push(baseRank <= 4 ? 'fuerte con ' + players + ' jugadores' : baseRank >= 11 ? 'débil con ' + players + ' jugadores' : 'nivel medio con ' + players + ' jugadores');
  const s = parts.join(' · ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
