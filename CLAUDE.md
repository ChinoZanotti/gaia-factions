# Gaia Factions — selector de facciones para Gaia Project

App web (fan, no oficial) que ayuda a elegir facción en Gaia Project: el usuario carga jugadores → 2 puntuaciones finales → colores/rivales, y el ranking de 14 facciones se reordena en vivo; al tocar una facción se ven aperturas estándar y consejos.

## Prioridades
- MÓVIL PRIMERO (360–430 px). Escritorio es secundario.
- Español rioplatense con voseo. Sin emojis.
- Seguir el sistema de diseño en `docs/sistema-de-diseno/README.md` (componentes en `src/design-system/bundle.js` + `src/styles/bundle.css`, tokens en `src/styles/tokens.css`; el bundle no se edita). Nada de colores sueltos; un solo botón primary por vista.

## Estado actual
- Vite + React 19.3.1 con JSX. Entrada `src/main.jsx` → `src/App.jsx` (estado y navegación) → `src/components/` (un componente por pantalla/sección).
- Datos y motor: `src/data/data.js` (módulo ES). Textos del ranking: `src/lib/reasons.js`. Animación: `src/hooks/useFlip.js`.
- Sistema de diseño: `src/design-system/index.js` reexporta los componentes del bundle (que lee `window.React`, expuesto por `react-global.js`).
- El resultado del build (`dist/`) es un sitio estático; no hay backend.
- Flujo: 4 pasos + detalle. Ranking en vivo en cada paso con animación FLIP.
- Datos y decisiones: `docs/DATOS-Y-DECISIONES.md`. Reglas: `docs/reglas/`. Artículos y tablas fuente: `docs/datos/`. Esas dos carpetas son material con derechos de terceros: existen solo en la máquina del dueño (están en `.gitignore`) y nunca se commitean ni publican.

## Stack preferido del dueño (Chino, Arsis)
JavaScript, React, Node/Express, PostgreSQL. Backend solo si se necesita guardar partidas.

## Comandos
- Desarrollo: `npm run dev` (Vite, http://localhost:5173).
- Build: `npm run build` → `dist/`. Para servirlo: `node scripts/serve.mjs` (sirve `dist/` en http://127.0.0.1:8080; no hay Python en la máquina del dueño).
- Tests: `npm test` (= `node --test`, sin dependencias).
- Auditoría móvil: con el build servido, `node scripts/audit-mobile.mjs 390 <carpeta>` (y 360; contra dev: `APP_URL=http://localhost:5173/`). Recorre los 4 pasos y el detalle en Chrome headless, guarda capturas y reporta desbordes y objetivos táctiles < 44 px.

## Reglas de trabajo
- No inventar datos: lo estimado se marca como estimado (ver FINAL y RIVAL en src/data/data.js).
- Cambios al ranking: actualizar `docs/DATOS-Y-DECISIONES.md` y los casos de `tests/ranking.test.mjs`, y correr los tests (p. ej. 4p sin subasta: Taklons/Ivits arriba; 2p: Ivits primero).
- Verificar siempre a 360 y 390 px: sin desborde horizontal, objetivos táctiles ≥ 44 px, safe-area.
- Correr `npm test` antes de cada commit; al corregir o agregar funcionalidad, agregar o actualizar tests.
- Una rama nueva por tarea, nunca directo en main. Commits chicos con mensajes claros. Sin push, merge ni deploy hasta que el dueño lo pida.
- No instalar ni actualizar dependencias sin avisar y justificarlo. Nada de comandos destructivos sin confirmación.
- No leer, imprimir ni commitear `.env`, credenciales, llaves ni dumps. Si hace falta, usar `.env.example` con valores ficticios.
- No hacer cambios de diseño ni de datos sin consultar. Antes de cada cambio, explicar brevemente qué y por qué.
