# Sistema de diseño "Gaia Factions"

Fuente original: https://claude.ai/artifact/HgTSSZJb4xB6ppmt1moYCz (artefacto tipo Design System). Esta es una copia de las reglas; el bundle de componentes está en `src/design-system/bundle.js` (sin modificar; se importa vía `src/design-system/index.js`), los estilos en `src/styles/bundle.css` y los tokens en `src/styles/tokens.css` (generado a mano desde `project/tokens.json` del artefacto original, con los temas `space` y `rulebook`).

## Voz
- Español rioplatense con voseo ("Elegí", "Confirmá"). Nunca tuteo.
- Botones: verbo + objeto, en MAYÚSCULAS por estilo CSS, no en el texto fuente.
- Nombres de facción en su forma original (Hadsch Hallas, Bal T'aks). Planetas y pistas en español.
- Tono de manual de reglas: directo, sin exclamaciones ni emojis. Recomendaciones con el porqué en una línea.

## Color
- Dos temas: `space` (oscuro, principal) y `rulebook` (claro). Siempre por token, nunca hex suelto.
- Fondo `bg-000`; paneles `surface-100`; elevados/inputs/hover `surface-200`; seleccionado `surface-300`.
- Texto: `ink`, `ink-muted` (secundario), `ink-subtle` (placeholder/deshabilitado).
- `accent` = color de acción (botón primario, segmento/tab activo, barra de afinidad). Texto naranja siempre `accent-ink`; sobre `accent` el texto es `on-accent`.
- Estados `success`/`danger`/`info` siempre con ícono o palabra. Dificultad: success = Fácil, info = Media, danger = Difícil.
- `planet-*`, `res-*`, `track-*`, `power` son fijos y solo representan su pieza.
- Foco: anillo `focus` de 2px en todo control.

## Tipografía
- Chakra Petch (`--font-display`): títulos, nombres de facción, botones, etiquetas, números.
- Barlow (`--font-body`): texto corrido. Puntajes con `tabular-nums`.

## Forma
- Firma: chaflán con `clip-path` (paneles `chamfer-lg`, tarjetas `chamfer-md`, botones/tabs/segmentos `chamfer-sm`). Marco: cromo 3px (`.gf-metal`) → filete 2px → superficie.
- `radius-sm` solo en inputs/checkbox/badges; `radius-pill` en banner de sección y switches.
- Espaciado `space-1`…`space-8` (4–64px). Sombras con `filter: drop-shadow` en elementos con clip-path.
- Movimiento mínimo (120–150 ms).

## Componentes (window.GaiaFactions)
Logo, Icon, Button, IconButton, Panel, Banner, Badge, PlanetToken, ResourceToken, ResearchTrack, ScoringTile, Meter, FactionCard, FactionRankRow, TextField, Select, Checkbox, Switch, SegmentedControl, Tabs, Tooltip, Toast, Modal, EmptyState + datos FACTIONS, PLANETS, TRACKS, RESOURCES, DIFFICULTY, ICON_NAMES.
- Un solo botón `primary` por vista.
- Íconos disponibles: check close plus minus chevron-down chevron-right arrow-right search info alert players shuffle sliders dice trophy star sector federation mine planet swap book gaia research.
- Sin emojis, sin arte oficial del juego. App no oficial, sin afiliación con Feuerland ni Capstone Games.

## Notas de la app
- La app usa el bundle tal cual y lo adapta a celular con `src/styles/app.css` (el sistema trae `.gf-fcard` de 300px y `.gf-rank` con columna de barra de 120–220px; la app usa filas propias `.gp-row` en 2 líneas).
- Fuentes: autoalojadas. `src/styles/fonts.css` declara los @font-face (los tokens no los traen) con los .woff2 de `src/assets/fonts/`: Barlow 400/500/600/700 y Chakra Petch 600/700, subconjunto latino. Son idénticos byte a byte (SHA-256) a los de `project/fonts/` del artefacto del sistema de diseño (que son los de Fontsource); Chakra Petch 400/500 existen ahí pero la app no los usa. Licencia SIL OFL 1.1 en `public/fonts/` (se publica con el sitio). Chakra Petch no tiene dígitos tabulares (`tnum`), así que `tabular-nums` no tiene efecto en los números; Barlow sí los tiene.
- Íconos del sitio: `public/favicon.svg` es el emblema del bundle (`LOGOS.emblem`) copiado tal cual; `public/apple-touch-icon.png` (180 px) es ese mismo SVG renderizado sobre `bg-000`. Si cambia el emblema, regenerarlos.
- Marco de botones y ventanas: la app reemplaza el cromo en degradé (`.gf-metal`) de los botones primary/secondary y del `Modal` por un marco sólido `--metal-300` (decisión del dueño). Los chips, tarjetas de color, selectores y el marco del ranking usan `--frame`/`--surface-300` con el mismo chaflán del sistema. Override en `src/styles/app.css`; el bundle no se toca.
- Esquinas rectas: la app pone `border-radius: 0` (90°) en todo lo que el sistema dibuja con `radius-*` o en cápsula: badges, Toast, switch (riel y perilla), barras de puntaje, puntos de progreso, aviso de muestra chica y cuadro de texto del Modal (decisión del dueño: ni redondeado ni chaflán). Los paneles, botones, selectores, chips, tarjetas y el marco del ranking mantienen el chaflán. Los paneles `flat` del sistema tenían las capas interiores recortadas con −2/−3 px, que tapaban el borde de 1 px en la diagonal; la app usa −0,59 px. Todo en `src/styles/app.css`.

## Deuda conocida del sistema (bundle)
Limitaciones del bundle que la app no corrige editándolo. Verificadas con teclado en Chrome (noviembre de 2026).
- **Sin navegación con flechas en `SegmentedControl` ni `Tabs`.** Implementan "roving tabindex" a medias: la opción o pestaña elegida tiene `tabIndex 0` y las demás `-1`, pero no hay manejo de teclas (ninguna `onKeyDown` en el bundle). Resultado: con teclado solo se llega a la opción elegida y no se puede cambiar (en la app: jugadores, nivel de la mesa y pestañas del detalle). Incumple WCAG 2.1.1. Lo esperado según el patrón ARIA: flechas izquierda/derecha (e inicio/fin) mueven el foco y la selección. **La app lo resuelve sin tocar el bundle** con `src/components/KeyNav.jsx` (envuelve el selector o las pestañas y maneja flechas, Inicio y Fin).
- **`Tabs` sin `tabpanel`.** No emite `id` en las pestañas ni `aria-controls`, así que el contenido no queda asociado a su pestaña para lectores de pantalla.
- **`Modal` sin manejo de foco.** No mueve el foco al abrir, no lo atrapa dentro ni cierra con Escape (la app lo hace por su cuenta en "No pudimos copiar").
- **Botones de cerrar de 32 px** en `Modal` y `Toast` (`IconButton size="sm"`): por debajo del mínimo táctil de 44 px. La app no los usa (no pasa `onClose`) y pone su propio botón.
