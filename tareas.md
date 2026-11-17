# Tareas

Lista de trabajo del proyecto. Las pendientes siguen el orden de prioridad aprobado por el dueño; la numeración se mantiene para poder referirse a cada tarea ("la 7"). Al terminar una, pasarla a "Hechas" con la fecha.

Origen: **Molly** = revisión de UX y sistema de diseño; **Case** = revisión de seguridad (ambas de noviembre de 2026).

## Pendientes

### Prioridad 1 — Sin impacto visual, bajo riesgo

Completa (ver "Hechas").


### Prioridad 2 — Cambios visuales chicos (requieren OK)

Completa (ver "Hechas").

### Prioridad 3 — Decisiones de producto o diseño

- [ ] **15. Descubribilidad** (Molly). Chevrón en las filas, pista "Tocá una facción" en todos los pasos, leyenda del +N/−N.
- [ ] **17. Compartir partida por enlace** (Case). Estado en el fragmento `#` (no en la query), mismo validador que la 16, formato versionado, tope de longitud, si falla vuelve al estado inicial.
- [ ] **18. Menos ruido** (Molly). Nota de fuentes solo en el paso 4 y en el detalle; quitar el párrafo repetido del paso 3.
- [ ] **19. Chaflán o borde redondeado** en chips, colores y ranking (Molly). Hoy usan `radius-md` en vez de la firma del sistema: aplicar chaflán o documentar la excepción.
- [ ] **20. Pestañas con flechas del teclado** (Molly). Lo implementa el bundle: anotar como deuda del sistema de diseño, no parchear desde la app.
- [ ] **24. Migrar a React 19.** Dependabot ignora los saltos mayores de React hasta hacerlo a mano: probar el bundle del sistema de diseño con React 19 y actualizar `react` y `react-dom` juntos.

### Del dueño (fuera del código)

- [ ] **21. Pedir a GitHub Support** que purgue el commit huérfano `6c8213323f2e8e1a18ab8ab4d016a3023d9cbb99` (material de terceros, todavía accesible por hash).
- [ ] **22. Identidad.** Usar el email `noreply` de GitHub en los commits futuros (y activar "Keep my email private"). Decidir si `CLAUDE.md` debe nombrar a la empresa, dado que el repo es público.
- [ ] **23. Dominio propio** (más adelante). Aísla localStorage del resto de `chinozanotti.github.io` y simplifica un backend futuro.

### Backlog

- [ ] Reemplazar `FINAL` con los ratings reales (hoja de Google del artículo 03), por cantidad de jugadores.
- [ ] Mapa (distancia a planetas del color, Gaia cercanos, sectores) y losetas de ronda/avanzadas.
- [ ] Aperturas: separar AC de conocimiento vs QIC y mostrar con qué pista combinan (artículo 04b).
- [ ] Tema claro (`data-theme="rulebook"`).
- [ ] View Transitions al cambiar de paso y de vista (opcional, con fallback).

## Hechas

### Noviembre de 2026

- [x] **Revisión inicial a 360/390 px** con auditoría automática (Chrome headless): sin desborde horizontal; se detectaron los objetivos < 44 px, el tuteo, el caso Ivits, el empate y el favicon faltante.
- [x] **Test del motor de ranking** (`tests/ranking.test.mjs`): integridad de datos, órdenes conocidos por jugadores y subasta, ajustes, tope de rivales, colores bloqueados, invariantes.
- [x] **`CLAUDE.md`** con comandos y reglas de trabajo.
- [x] **Migración a Vite + React (JSX)**: `data.js` como módulo ES, componentes en `src/components/`, bundle del sistema de diseño sin modificar, CSS en `src/styles/`. Capturas idénticas píxel a píxel a la versión anterior. De paso se corrigió el orden de `backdrop-filter`, que el minificador rompía.
- [x] **Material de terceros fuera del repo**: `docs/datos/` y `docs/reglas/` quitados del historial y en `.gitignore` (quedan solo en local; respaldo en `C:\dev\gaia-factions-backup\`).
- [x] **Publicación en GitHub Pages** con GitHub Actions: https://chinozanotti.github.io/gaia-factions/
- [x] **Favicon e ícono de pantalla de inicio** a partir del emblema del sistema de diseño.
- [x] **Revisiones de Molly (UX) y Case (seguridad)**, consolidadas en esta lista.
- [x] **1. Workflow endurecido**: acciones fijadas por SHA, permisos por job, `npm ci --ignore-scripts`, `npm audit`, versiones exactas, Dependabot.
- [x] **2. Scripts locales endurecidos**: `serve.mjs` (400 en URLs malformadas, solo localhost, solo GET/HEAD, `nosniff`, con tests) y `audit-mobile.mjs` (puerto dinámico, borra el perfil).
- [x] **3. Clon local limpio**: sin objetos del historial viejo (de 6,09 MB a 100 KB); sin forks en GitHub.
- [x] **Dependabot**: `react` y `react-dom` agrupados y sin saltos mayores; cerrados los PRs #1 y #2 (React 19).
- [x] **4. Ranking accesible**: `ol`/`li` con el botón adentro (`role="list"` explícito por VoiceOver), nombre accesible completo por fila (puesto, puntaje, motivo, ajuste), región `role="status"` que anuncia el nuevo top 3 con 600 ms de espera. Sin cambios visuales (capturas idénticas).
- [x] **5. Foco y scroll**: al volver del detalle se recupera la posición en la lista y el foco en la fila tocada; al cambiar de paso o de vista el foco va al título; contorno de foco con teclado en los badges del resumen y los encabezados de color (hacia adentro donde hay `overflow: hidden`, también en las filas). Sin cambios visuales con mouse o toque.
- [x] **6. Limpieza menor**: sin CSS muerto (`.gp-pick`, `.gp-bar__hint`); la barra de pasos es decorativa (`aria-hidden`) en vez de un `progressbar` sin nombre que repetía el título.
- [x] **7. Objetivos táctiles de 44 px** (aprobado con antes/después): switch de subasta (zona tocable de 24 a 44 px, sin cambio visual), badges del resumen del paso 4 (de 25 a 44 px; más separación entre renglones) y pestañas del detalle (de 40 a 44 px, override en `app.css`).
- [x] **8. Contraste** (aprobado con antes/después): notas de `ink-subtle` a `ink-muted` (4,44 → 8,57:1); encabezado de color ocupado a `ink-muted` (4,06 → 7,83:1); filas no disponibles sin opacidad general: planeta atenuado y texto en `ink-muted` (motivo de 2,59 → 7,83:1). El botón de la otra facción de un color ocupado sigue al 40 % (funciona como deshabilitado).
- [x] **9. Números tabulares**: cerrada sin cambios por decisión del dueño. Chakra Petch no tiene dígitos tabulares (con y sin `tabular-nums` miden lo mismo), así que la propiedad no tiene efecto.
- [x] **Rangos de 2p/3p verificados** contra las imágenes del artículo 01 (backlog): 83 de 84 valores bien; corregido Ambas en 3p sin subasta (2,05 → 2,12; mismo orden). Test que fija los 84 valores.
- [x] **Nivel de la mesa** (diseño propuesto por Molly, alternativa A; aprobado con antes/después): el paso 1 pasa a "La mesa" con jugadores, experiencia (Aprendiendo / Con experiencia / Competitivo, por defecto Con experiencia) y subasta; datos por nivel desde las tablas del artículo 01; aviso de muestra chica (solo 3p Competitivo); nota de fuente y badge del resumen según el nivel. Documentado en `docs/DATOS-Y-DECISIONES.md`.
- [x] **11. Fuentes autoalojadas**: Barlow 400–700 y Chakra Petch 600/700 desde `src/assets/fonts/` (idénticas por SHA-256 a las del artefacto del sistema de diseño), licencia OFL en `public/fonts/`, sin Google Fonts; la CSP queda en `'self'` (con test). Capturas idénticas píxel a píxel a la versión con Google, incluido el ≥ de las aperturas. Confirmado de paso que Chakra Petch no tiene dígitos tabulares (tarea 9).
- [x] **12. Textos** (aprobado con antes/después): "sufrís"; "poco encaje con estas puntuaciones finales"; "empata con X" cuando dos facciones disponibles muestran el mismo puntaje (a igual puntaje el orden es arbitrario); "Qué evitar"; "4 jugadores"; sin rayas largas; glosario también en Consejos. De paso: el motivo "fuerte / débil" ahora usa el nivel elegido (antes, siempre el de por defecto).
- [x] **Peso de la puntuación final** (caso Ivits; opción b aprobada con antes/después): el ajuste por puntuación final se multiplica por un peso por facción (Ivits 0,64 … Gleens 1,16) calculado de las tablas de ganadores contra últimos del artículo 02. Documentado en `docs/DATOS-Y-DECISIONES.md`.
- [x] **13. Paso 3**: "Ocupado"/"Libre" con el componente `Badge` (mismo aspecto); cada botón de color se anuncia como "Marcar X como ocupado", con descripción "Libre", "Ocupado por <rival>" u "Ocupado (marcado a mano)". Capturas idénticas.
- [x] **Copiar aperturas y consejos** (pedido del dueño; ubicación y botón propuestos por Molly; aprobado con antes/después): botón secundario de 44 px entre el resumen y las pestañas del detalle; copia en texto plano el formato del dueño (sin siglas ni encaje; `src/lib/guideText.js`, con tests). Confirma con "Copiado" 2 s y región viva; si el navegador no deja copiar, ventana con el texto seleccionado.
- [x] **14. Paso 4** (decisión del dueño; aprobado con antes/después): "Nueva partida" sigue en la barra, sin primary; al tocarla aparece "Empezaste una partida nueva. [Deshacer]" (Toast del sistema, 6 s) que recupera la partida y vuelve al paso 4; el aviso se va si se empieza a cargar la nueva.
- [x] ~~**16. Guardar partida en localStorage**~~: descartada por decisión del dueño. La app se usa un rato al elegir facciones y para consultas sueltas de una facción; no hace falta persistir la partida.
- [x] **10. CSP y referrer por `<meta>`**: `config/csp.js` (con tests) la inserta solo en el build, después del `charset`; política sin `unsafe-inline` ni comodines; `referrer` en `no-referrer`. Sin `upgrade-insecure-requests` (Pages ya fuerza HTTPS y rompía las pruebas locales). Verificado en Chrome: cero violaciones en todo el recorrido, fuentes e íconos cargan, y un script inline de control queda bloqueado.
