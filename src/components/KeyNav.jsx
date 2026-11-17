import { useRef } from 'react';
import { nextIndex } from '../lib/keyNav.js';

// Agrega navegación con flechas, Inicio y Fin a un SegmentedControl o Tabs del bundle, que no la implementan
// (ver "Deuda conocida del sistema" en docs/sistema-de-diseno/README.md). No toca el bundle: escucha las teclas
// en un contenedor, cambia la selección y lleva el foco a la opción elegida.
export default function KeyNav({ values, value, onChange, children }) {
  const ref = useRef(null);
  function onKeyDown(e) {
    const n = nextIndex(e.key, values.indexOf(value), values.length);
    if (n === null) return;
    e.preventDefault(); // que las flechas no desplacen la página
    if (values[n] !== value) onChange(values[n]);
    // Después del render, el foco va a la opción elegida (la única con tabIndex 0).
    requestAnimationFrame(() => ref.current?.querySelector('[aria-checked="true"], [aria-selected="true"]')?.focus());
  }
  return <div ref={ref} onKeyDown={onKeyDown}>{children}</div>;
}
