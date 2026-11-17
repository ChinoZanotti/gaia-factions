# Datos y decisiones del motor de ranking

## Fuentes (en docs/datos/, solo local: no se versiona ni se publica)
Serie "Navigating through Statistics" de Arun Murali (BGG, sept–oct 2021, datos de Board Game Stats online / BGS). Texto en `articulos/`, tablas como imagen en `tablas/`. Material de referencia privado (no republicar).
- 00 intro/metodología · 01 tier list por facción (rango promedio) · 02 rutas de puntuación · 03 puntuación final · 04a aperturas PI/AC/RL · 04b aperturas por facción.
- Reglas del juego: `docs/reglas/gaia-rulebook.txt`.

## Qué es cada dato en src/data/data.js
- `RANK[jugadores][free|auction]`: "Avg. Rank Without Bid" (free) y "Avg. Rank" (auction) en la columna de mayor nivel: 4p = >300 elo, min score 120; 2p y 3p = >250 elo, min score 120. Menor es mejor. Fuente: tablas del artículo 01 (imágenes en tablas/01-tier-list-facciones/). Algunos valores de 2p/3p se leyeron a ojo de heatmaps pequeños (±0,01–0,03): verificarlos contra las imágenes.
- `FINAL[facción][puntuación]`: calificación 0–100 de "qué tan seguido logra buen puntaje en esa puntuación final cuando gana". NO son datos del autor: sus ratings reales están en una hoja de Google que no pudimos abrir. Los valores son ESTIMACIONES derivadas del texto del artículo 03 (solo hay valores exactos citados: Geoden Tipos de planeta 97, Terrans Tipos 9, Bal T'aks Estructuras 47). Mejora pendiente: reemplazar por los números reales de la hoja (hay hojas por 2p/3p/4p y por pares de puntuaciones).
- `RIVAL`: ajustes por rival (criterio propio, basado en observaciones del autor): Taklons/Nevlas crecen con carga de poder → penalizan a Gleens/Lantids (−4) y Ambas/Xenos (−2); Ambas penaliza Gleens (−3, riesgo de aislamiento); Xenos Gleens (−2). Tope total −8.
- `GUIDE`: aperturas estándar y consejos por facción, resumidos del artículo 04a/04b y 03/02. Notación PI/AC/RL/TS/M explicada en la app.
- `COLORS`: 7 colores de planeta, 2 facciones cada uno; elegir una bloquea la otra.

## Motor (rank())
1. Base = 86 − 52 × (rango − min)/(max − min) por tabla (2/3/4 jugadores; con o sin subasta).
2. Ajuste de puntuaciones finales = (promedio de las calificaciones de las 2 elegidas − 50) × 0.28.
3. Ajuste de rivales = suma de RIVAL, tope −8.
4. Puntaje final limitado a 0–100. Facciones cuyo color ya está ocupado (por rival o marcado a mano) van al final como "No".

## Conclusiones del análisis que guiaron el diseño
- Jugadores es el primer filtro: Ivits dominan 2p/3p; Hadsch Hallas suben mucho en 2p/3p y bajan en 4p; Lantids necesitan más jugadores; Taklons mejoran con más jugadores; Nevlas, Terrans, Itars estables arriba.
- Con subasta cambia el ranking (Taklons e Itars bajan, Nevlas suben): por eso el interruptor.
- Las puntuaciones finales mueven mucho a Taklons, Ambas, Terrans, Lantids, Nevlas, Geoden (según categoría) y casi nada a Ivits.
- Los rivales importan sobre todo por carga de poder (Taklons/Nevlas) y expansión (Ambas/Xenos vs Gleens).
- Los factores del mapa y las losetas de tecnología avanzada NO están modelados todavía.

## Pendientes / ideas
- Reemplazar FINAL con los ratings reales (hoja de Google del artículo 03) y por cantidad de jugadores.
- Agregar mapa (distancia a planetas de tu color, Gaia cercanos, sectores) y losetas de ronda/avanzadas.
- Aperturas: separar AC de 2 conocimiento vs QIC, y mostrar con qué pista combinan (el artículo 04b lo detalla).
- Persistir la partida (localStorage con try/catch) y compartir por enlace.
- Modo claro (`data-theme="rulebook"`).
