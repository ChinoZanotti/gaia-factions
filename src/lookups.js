// Índices por id de facciones (sistema de diseño), puntuaciones y colores (data.js).
import { FACTIONS } from './design-system';
import { SCORINGS, COLORS } from './data/data.js';

const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));

export const FBY = byId(FACTIONS);
export const SBY = byId(SCORINGS);
export const CBY = byId(COLORS);
export const factionName = (id) => FBY[id].name;
