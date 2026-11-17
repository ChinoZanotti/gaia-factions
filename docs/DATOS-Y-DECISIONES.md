# Datos y decisiones del motor de ranking

## Fuentes (en docs/datos/, solo local: no se versiona ni se publica)
Serie "Navigating through Statistics" de Arun Murali (BGG, sept–oct 2021, datos de Board Game Stats online / BGS). Texto en `articulos/`, tablas como imagen en `tablas/`. Material de referencia privado (no republicar).
- 00 intro/metodología · 01 tier list por facción (rango promedio) · 02 rutas de puntuación · 03 puntuación final · 04a aperturas PI/AC/RL · 04b aperturas por facción.
- Reglas del juego: `docs/reglas/gaia-rulebook.txt`.

## Qué es cada dato en src/data/data.js
- `RANK[jugadores][free|auction]` (= nivel Competitivo): "Avg. Rank Without Bid" (free) y "Avg. Rank" (auction) en la columna de mayor nivel: 4p = >300 elo, min score 120; 2p y 3p = >250 elo, min score 120. Menor es mejor. Fuente: tablas del artículo 01 (imágenes en tablas/01-tier-list-facciones/). Los 84 valores están verificados contra las imágenes ampliadas (noviembre de 2026) y fijados en `tests/ranking.test.mjs`; se corrigió Ambas en 3p sin subasta (estaba 2,05; la tabla dice 2,12: no cambia el orden, su puntaje base baja de 55 a 49).
- `RANK_BY_LEVEL[nivel]` y `GAMES[nivel]`: rango promedio y partidas por facción para cada nivel de la mesa (ver "Nivel de la mesa").
- `FINAL[facción][puntuación]`: calificación 0–100 de "qué tan seguido logra buen puntaje en esa puntuación final cuando gana". NO son datos del autor: sus ratings reales están en una hoja de Google que no pudimos abrir. Los valores son ESTIMACIONES derivadas del texto del artículo 03 (solo hay valores exactos citados: Geoden Tipos de planeta 97, Terrans Tipos 9, Bal T'aks Estructuras 47). Mejora pendiente: reemplazar por los números reales de la hoja (hay hojas por 2p/3p/4p y por pares de puntuaciones).
- `RIVAL`: ajustes por rival (criterio propio, basado en observaciones del autor): Taklons/Nevlas crecen con carga de poder → penalizan a Gleens/Lantids (−4) y Ambas/Xenos (−2); Ambas penaliza Gleens (−3, riesgo de aislamiento); Xenos Gleens (−2). Tope total −8.
- `GUIDE`: aperturas estándar y consejos por facción, resumidos del artículo 04a/04b y 03/02. Notación PI/AC/RL/TS/M explicada en la app.
- `COLORS`: 7 colores de planeta, 2 facciones cada uno; elegir una bloquea la otra.

## Motor (rank())
1. Base = 86 − 52 × (rango − min)/(max − min) por tabla (2/3/4 jugadores; con o sin subasta; nivel de la mesa).
2. Ajuste de puntuaciones finales = (promedio de las calificaciones de las 2 elegidas − 50) × 0.28.
3. Ajuste de rivales = suma de RIVAL, tope −8.
4. Puntaje final limitado a 0–100. Facciones cuyo color ya está ocupado (por rival o marcado a mano) van al final como "No".
5. Empates: si dos facciones disponibles muestran el mismo puntaje redondeado, el motivo dice "empata con X". A igual puntaje el orden entre ellas es arbitrario (orden interno de la lista).

## Nivel de la mesa (noviembre de 2026)
El paso 1 ("La mesa") pide jugadores, experiencia de la mesa y subasta. La experiencia elige qué tabla de rango promedio usa el motor; los ajustes de puntuación final (`FINAL`) y de rivales (`RIVAL`) y las aperturas (`GUIDE`) son los mismos para los tres niveles.

**Qué mide el "nivel" en los datos.** Arun agrupa las partidas por el **elo promedio de BGS** de sus jugadores (tramos <100, 100–150, 150–200, 200–250, 250–300 y >300; en 2p/3p el más alto es >250 por falta de partidas). El puntaje mínimo de 120 es un filtro extra que solo se aplicó al tramo más alto (en 4p sacó 134 de 484 partidas). Elo de BGS según su código (`apps/api/app/engine/elo.ts` y `services/elo.ts` del repo boardgamers/boardgamers-mono, igual desde al menos dic. 2021):
- Cada partida cuenta como un duelo contra cada rival (fórmula de elo estándar, escala 400); K = 60 en las primeras 10 partidas, 40 hasta la 19 y 20 desde la 20, ajustado por cantidad de jugadores (× 3/(jugadores + 1)).
- Arranca en 0 y nunca baja de 100 una vez alcanzado; por debajo de 100 perder no resta. Por eso el elo mezcla experiencia (sin partidas, cerca de 0) y resultados contra otros (los que pierden mucho quedan en 100–150 aunque jueguen mucho). En el ranking actual de BGS (233 jugadores, consultado en nov. 2026): 0–100 tiene una mediana de 2 partidas jugadas; 100–150, de 64; 300+, de 140–160.

**Niveles de la app** (`LEVELS` en data.js; nombres elegidos por el dueño):

| Nivel | Datos | Cómo se calculó |
|---|---|---|
| Aprendiendo | elo < 150 | Promedio de los tramos <100 y 100–150, ponderado por las partidas de cada facción (cálculo propio; sin filtro de puntaje). |
| Con experiencia (**por defecto**) | elo 150–250 | Promedio de 150–200 y 200–250, ponderado igual (cálculo propio; sin filtro de puntaje). |
| Competitivo | 4p >300, 2p/3p >250, mínimo 120 | Valores exactos de la tabla (= `RANK`). |

El tramo 250–300 de 4p no se usa. Por defecto va "Con experiencia": tiene 5 a 10 veces más partidas que Competitivo y representa mejor a una mesa típica.

**Diferencias principales** (4p sin subasta salvo indicación): el orden es estable entre niveles (correlación con Competitivo 0,93 en Con experiencia y 0,82 en Aprendiendo); Nevlas baja del 5.º al 8.º–9.º fuera de Competitivo; Ambas sube al 3.º–4.º; en 2p Hadsch Hallas pasa del 2.º (Competitivo) al 9.º (Aprendiendo). Con subasta las diferencias son mucho mayores (correlación 0,34–0,68).

**Margen de error y aviso de muestra chica.** El tramo alto es el de menos partidas. Margen (95 %) del rango promedio = 1,96 × desvío / √partidas, con desvío del puesto al azar 0,5 (2p), 0,82 (3p) y 1,12 (4p). Competitivo: 4p ±0,19–0,25 (las 5 primeras están dentro del margen entre sí), 3p ±0,22–0,41 (15–55 partidas por facción, antes del filtro de 120), 2p ±0,07–0,13; Con experiencia ±0,08–0,13. `sampleNote()` avisa cuando el margen de alguna facción llega a ±0,30: con los datos actuales solo en 3p Competitivo.

## Conclusiones del análisis que guiaron el diseño
- Jugadores es el primer filtro: Ivits dominan 2p/3p; Hadsch Hallas suben mucho en 2p/3p y bajan en 4p; Lantids necesitan más jugadores; Taklons mejoran con más jugadores; Nevlas, Terrans, Itars estables arriba.
- Con subasta cambia el ranking (Taklons e Itars bajan, Nevlas suben): por eso el interruptor.
- La experiencia de la mesa también cambia el ranking (sobre todo Nevlas, Ambas y Hadsch Hallas en 2p): por eso el selector de nivel.
- Las puntuaciones finales mueven mucho a Taklons, Ambas, Terrans, Lantids, Nevlas, Geoden (según categoría) y casi nada a Ivits.
- Los rivales importan sobre todo por carga de poder (Taklons/Nevlas) y expansión (Ambas/Xenos vs Gleens).
- Los factores del mapa y las losetas de tecnología avanzada NO están modelados todavía.

## Pendientes / ideas
- Reemplazar FINAL con los ratings reales (hoja de Google del artículo 03) y por cantidad de jugadores.
- Agregar mapa (distancia a planetas de tu color, Gaia cercanos, sectores) y losetas de ronda/avanzadas.
- Aperturas: separar AC de 2 conocimiento vs QIC, y mostrar con qué pista combinan (el artículo 04b lo detalla).
- Persistir la partida (localStorage con try/catch) y compartir por enlace.
- Modo claro (`data-theme="rulebook"`).
