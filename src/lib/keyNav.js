// Navegación con teclado para grupos de opciones (radiogroup / tablist), según el patrón ARIA:
// flechas mueven a la anterior/siguiente (dando la vuelta), Inicio/Fin a la primera/última.
// Devuelve el índice nuevo o null si la tecla no corresponde.
const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function nextIndex(key, index, count) {
  if (count < 1 || index < 0 || index >= count) return null;
  if (key in STEP) return (index + STEP[key] + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}
