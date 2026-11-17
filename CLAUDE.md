# Gaia Factions — selector de facciones para Gaia Project

App web (fan, no oficial) que ayuda a elegir facción en Gaia Project: el usuario carga jugadores → 2 puntuaciones finales → colores/rivales, y el ranking de 14 facciones se reordena en vivo; al tocar una facción se ven aperturas estándar y consejos.

## Prioridades
- MÓVIL PRIMERO (360–430 px). Escritorio es secundario.
- Español rioplatense con voseo. Sin emojis.
- Seguir el sistema de diseño en `docs/sistema-de-diseno/README.md` (componentes en `js/bundle.js`/`css/bundle.css`, tokens en `css/tokens.css`). Nada de colores sueltos; un solo botón primary por vista.

## Estado actual
- Sitio estático sin build: React 18.3.1 por CDN, `React.createElement` (sin JSX), `window.GaiaFactions` (sistema de diseño), `window.GaiaData` (js/data.js: datos + motor), js/app.js (pantallas).
- Flujo: 4 pasos + detalle. Ranking en vivo en cada paso con animación FLIP.
- Datos y decisiones: `docs/DATOS-Y-DECISIONES.md`. Reglas: `docs/reglas/`. Artículos y tablas fuente: `docs/datos/`.

## Stack preferido del dueño (Chino, Arsis)
JavaScript, React, Node/Express, PostgreSQL. Migrar a Vite + React (JSX) es el primer paso previsto; backend solo si se necesita guardar partidas.

## Comandos
- Servir en local (no hay Python en la máquina del dueño): `node scripts/serve.mjs` → http://127.0.0.1:8080
- Tests: `node --test` (sin dependencias).
- Auditoría móvil: con el servidor levantado, `node scripts/audit-mobile.mjs 390 <carpeta>` (y 360). Recorre los 4 pasos y el detalle en Chrome headless, guarda capturas y reporta desbordes y objetivos táctiles < 44 px.

## Reglas de trabajo
- No inventar datos: lo estimado se marca como estimado (ver FINAL y RIVAL en data.js).
- Cambios al ranking: actualizar `docs/DATOS-Y-DECISIONES.md` y los casos de `tests/ranking.test.mjs`, y correr los tests (p. ej. 4p sin subasta: Taklons/Ivits arriba; 2p: Ivits primero).
- Verificar siempre a 360 y 390 px: sin desborde horizontal, objetivos táctiles ≥ 44 px, safe-area.
- Correr `node --test` antes de cada commit; al corregir o agregar funcionalidad, agregar o actualizar tests.
- Una rama nueva por tarea, nunca directo en main. Commits chicos con mensajes claros. Sin push, merge ni deploy hasta que el dueño lo pida.
- No instalar ni actualizar dependencias sin avisar y justificarlo. Nada de comandos destructivos sin confirmación.
- No leer, imprimir ni commitear `.env`, credenciales, llaves ni dumps. Si hace falta, usar `.env.example` con valores ficticios.
- No hacer cambios de diseño ni de datos sin consultar. Antes de cada cambio, explicar brevemente qué y por qué.
