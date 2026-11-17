/* Gaia Factions — datos y motor de ranking (módulo ES).
   Fuente: serie "Navigating through Statistics" (Arun Murali, BGG, 2021, datos de BGS online).
   Los rangos promedio salen de las tablas del artículo 01 por nivel de la mesa (elo promedio de BGS de los jugadores):
   Competitivo = >300 elo en 4p, >250 en 2p/3p, puntaje mínimo 120 (valores de la tabla); Con experiencia = 150–250 elo;
   Aprendiendo = menos de 150 elo. Estos dos últimos son promedios propios de dos tramos de la tabla, ponderados por partidas.
   Las calificaciones de puntuación final son una escala 0–100 estimada a partir de la descripción del autor. */
var IDS = ['terrans','lantids','xenos','gleens','taklons','ambas','hadsch-hallas','ivits','bal-taks','geodens','firaks','bescods','nevlas','itars'];

// Rango promedio (menor = mejor). free: "sin subasta" (Avg. Rank Without Bid); auction: con subasta (Avg. Rank).
// RANK es el nivel Competitivo: valores exactos de la tabla (fijados en tests/ranking.test.mjs).
var RANK = {
  4: {
    free: {taklons:2.19, ivits:2.19, itars:2.23, nevlas:2.30, terrans:2.30, ambas:2.46, 'bal-taks':2.57, firaks:2.60, xenos:2.63, geodens:2.68, 'hadsch-hallas':2.71, lantids:2.91, bescods:2.91, gleens:2.94},
    auction: {nevlas:2.29, terrans:2.36, ivits:2.38, itars:2.41, taklons:2.45, firaks:2.49, 'bal-taks':2.51, geodens:2.52, ambas:2.56, xenos:2.56, lantids:2.59, bescods:2.65, 'hadsch-hallas':2.72, gleens:2.79}
  },
  3: {
    free: {ivits:1.67, terrans:1.81, itars:1.86, taklons:1.87, nevlas:1.95, 'hadsch-hallas':1.96, firaks:2.00, ambas:2.12, xenos:2.16, geodens:2.19, bescods:2.20, 'bal-taks':2.25, lantids:2.29, gleens:2.31},
    auction: {nevlas:1.71, terrans:1.74, ivits:1.80, taklons:1.90, firaks:1.94, 'hadsch-hallas':1.96, xenos:2.04, itars:2.12, ambas:2.12, lantids:2.15, geodens:2.16, 'bal-taks':2.19, bescods:2.21, gleens:2.31}
  },
  2: {
    free: {ivits:1.31, 'hadsch-hallas':1.42, itars:1.43, geodens:1.44, nevlas:1.45, taklons:1.48, 'bal-taks':1.49, ambas:1.55, terrans:1.57, firaks:1.57, bescods:1.61, xenos:1.62, gleens:1.63, lantids:1.78},
    auction: {ivits:1.36, 'hadsch-hallas':1.40, 'bal-taks':1.42, geodens:1.42, itars:1.44, nevlas:1.49, terrans:1.55, taklons:1.55, firaks:1.56, ambas:1.57, xenos:1.58, gleens:1.60, bescods:1.61, lantids:1.70}
  }
};

// Nivel de la mesa. El elo de BGS arranca en 0, nunca baja de 100 y sube al ganarle a cada rival: mide experiencia
// y resultados contra otros jugadores (ver docs/DATOS-Y-DECISIONES.md).
var LEVELS = [
  { id: 'learning', name: 'Aprendiendo', desc: 'Primeras partidas, o todavía no conocen bien las facciones.', source: 'mesas con elo promedio menor a 150' },
  { id: 'experienced', name: 'Con experiencia', desc: 'Conocen las facciones y sus habilidades, pero juegan sin aperturas fijas.', source: 'mesas con elo promedio de 150 a 250' },
  { id: 'competitive', name: 'Competitivo', desc: 'Juegan seguido, conocen las aperturas estándar y no regalan carga de poder.', source: null }
];
var DEFAULT_LEVEL = 'experienced';

// Aprendiendo y Con experiencia: promedio de los tramos <100 y 100–150, y 150–200 y 200–250, ponderado por las
// partidas de cada facción en cada tramo (cálculo propio sobre las tablas del artículo 01; sin filtro de puntaje).
var RANK_BY_LEVEL = {
  learning: {
    4: {
      free: {taklons:2.35, ivits:2.19, itars:2.26, nevlas:2.59, terrans:2.42, ambas:2.32, 'bal-taks':2.38, firaks:2.43, xenos:2.68, geodens:2.57, 'hadsch-hallas':2.8, lantids:2.82, bescods:2.81, gleens:2.66},
      auction: {taklons:2.38, ivits:2.24, itars:2.31, nevlas:2.63, terrans:2.45, ambas:2.32, 'bal-taks':2.37, firaks:2.4, xenos:2.65, geodens:2.55, 'hadsch-hallas':2.78, lantids:2.72, bescods:2.78, gleens:2.6},
    },
    3: {
      free: {taklons:1.91, ivits:1.61, itars:1.91, nevlas:2.06, terrans:2, ambas:1.95, 'bal-taks':2.01, firaks:1.95, xenos:2.18, geodens:2.07, 'hadsch-hallas':2.07, lantids:2.33, bescods:2.14, gleens:2.1},
      auction: {taklons:1.92, ivits:1.62, itars:1.92, nevlas:2.1, terrans:2, ambas:1.97, 'bal-taks':2.01, firaks:1.96, xenos:2.15, geodens:2.05, 'hadsch-hallas':2.08, lantids:2.3, bescods:2.11, gleens:2.07},
    },
    2: {
      free: {taklons:1.49, ivits:1.25, itars:1.47, nevlas:1.55, terrans:1.52, ambas:1.47, 'bal-taks':1.53, firaks:1.5, xenos:1.6, geodens:1.52, 'hadsch-hallas':1.54, lantids:1.79, bescods:1.55, gleens:1.6},
      auction: {taklons:1.49, ivits:1.25, itars:1.48, nevlas:1.56, terrans:1.53, ambas:1.48, 'bal-taks':1.53, firaks:1.5, xenos:1.59, geodens:1.51, 'hadsch-hallas':1.54, lantids:1.76, bescods:1.53, gleens:1.59},
    }
  },
  experienced: {
    4: {
      free: {taklons:2.14, ivits:2.19, itars:2.25, nevlas:2.59, terrans:2.38, ambas:2.32, 'bal-taks':2.58, firaks:2.54, xenos:2.67, geodens:2.73, 'hadsch-hallas':2.68, lantids:2.83, bescods:2.82, gleens:2.79},
      auction: {taklons:2.24, ivits:2.28, itars:2.32, nevlas:2.61, terrans:2.41, ambas:2.38, 'bal-taks':2.56, firaks:2.52, xenos:2.61, geodens:2.69, 'hadsch-hallas':2.67, lantids:2.68, bescods:2.7, gleens:2.67},
    },
    3: {
      free: {taklons:1.83, ivits:1.6, itars:1.87, nevlas:2.05, terrans:1.97, ambas:1.88, 'bal-taks':2.01, firaks:1.94, xenos:2.29, geodens:2.12, 'hadsch-hallas':2.11, lantids:2.29, bescods:2.27, gleens:2.35},
      auction: {taklons:1.86, ivits:1.63, itars:1.96, nevlas:2.08, terrans:1.99, ambas:1.91, 'bal-taks':1.98, firaks:1.9, xenos:2.18, geodens:2.1, 'hadsch-hallas':2.13, lantids:2.18, bescods:2.18, gleens:2.3},
    },
    2: {
      free: {taklons:1.51, ivits:1.24, itars:1.44, nevlas:1.44, terrans:1.55, ambas:1.48, 'bal-taks':1.52, firaks:1.51, xenos:1.62, geodens:1.56, 'hadsch-hallas':1.53, lantids:1.85, bescods:1.69, gleens:1.62},
      auction: {taklons:1.52, ivits:1.25, itars:1.45, nevlas:1.45, terrans:1.56, ambas:1.49, 'bal-taks':1.51, firaks:1.49, xenos:1.6, geodens:1.55, 'hadsch-hallas':1.54, lantids:1.79, bescods:1.68, gleens:1.62},
    }
  },
  competitive: RANK
};

// Partidas por facción en cada nivel (tablas de "picks" del artículo 01). Competitivo 4p: descontado el filtro de
// 120 puntos (350 de 484 partidas); 2p/3p: antes del filtro (cota superior: puede haber menos).
var GAMES = {
  learning: {
    4: {taklons:592, ivits:625, itars:643, nevlas:536, terrans:847, ambas:574, 'bal-taks':453, firaks:385, xenos:591, geodens:568, 'hadsch-hallas':560, lantids:372, bescods:444, gleens:462},
    3: {taklons:321, ivits:450, itars:393, nevlas:328, terrans:592, ambas:376, 'bal-taks':259, firaks:267, xenos:363, geodens:398, 'hadsch-hallas':394, lantids:188, bescods:295, gleens:287},
    2: {taklons:389, ivits:964, itars:719, nevlas:594, terrans:1102, ambas:845, 'bal-taks':456, firaks:473, xenos:541, geodens:751, 'hadsch-hallas':713, lantids:185, bescods:420, gleens:496},
  },
  experienced: {
    4: {taklons:857, ivits:992, itars:978, nevlas:666, terrans:1156, ambas:863, 'bal-taks':796, firaks:669, xenos:753, geodens:740, 'hadsch-hallas':764, lantids:544, bescods:625, gleens:649},
    3: {taklons:272, ivits:371, itars:341, nevlas:265, terrans:372, ambas:299, 'bal-taks':239, firaks:224, xenos:198, geodens:279, 'hadsch-hallas':277, lantids:160, bescods:181, gleens:200},
    2: {taklons:370, ivits:792, itars:593, nevlas:379, terrans:638, ambas:606, 'bal-taks':405, firaks:448, xenos:369, geodens:411, 'hadsch-hallas':502, lantids:148, bescods:282, gleens:315},
  },
  competitive: {
    4: {taklons:130, ivits:116, itars:124, nevlas:91, terrans:132, ambas:103, 'bal-taks':102, firaks:90, xenos:95, geodens:94, 'hadsch-hallas':90, lantids:77, bescods:79, gleens:77},
    3: {taklons:37, ivits:55, itars:41, nevlas:26, terrans:44, ambas:48, 'bal-taks':30, firaks:38, xenos:36, geodens:34, 'hadsch-hallas':31, lantids:15, bescods:25, gleens:20},
    2: {taklons:70, ivits:172, itars:107, nevlas:85, terrans:123, ambas:126, 'bal-taks':73, firaks:92, xenos:71, geodens:86, 'hadsch-hallas':89, lantids:54, bescods:67, gleens:93},
  }
};

var SCORINGS = [
  { id: 'gaia',   name: 'Gaia',                  short: 'Gaia',        icon: 'gaia',       desc: 'Planetas Gaia colonizados' },
  { id: 'planet', name: 'Tipos de planeta',      short: 'Tipos',       icon: 'planet',     desc: 'Tipos de planeta distintos' },
  { id: 'struct', name: 'Estructuras',           short: 'Estructuras', icon: 'mine',       desc: 'Edificios en el mapa' },
  { id: 'fed',    name: 'Estructuras en federación', short: 'Est. federadas', icon: 'federation', desc: 'Edificios dentro de federaciones' },
  { id: 'sat',    name: 'Satélites',             short: 'Satélites',   icon: 'star',       desc: 'Satélites y estaciones' },
  { id: 'sector', name: 'Sectores',              short: 'Sectores',    icon: 'sector',     desc: 'Sectores con presencia' }
];

// % de partidas ganadas en las que la facción logra buen puntaje en esa puntuación final (estimado).
var FINAL = {
  ambas:           {gaia:25, planet:60, struct:85, fed:85, sat:65, sector:85},
  taklons:         {gaia:15, planet:85, struct:90, fed:90, sat:95, sector:90},
  terrans:         {gaia:90, planet:9,  struct:75, fed:75, sat:85, sector:70},
  lantids:         {gaia:15, planet:20, struct:90, fed:90, sat:20, sector:90},
  firaks:          {gaia:25, planet:70, struct:55, fed:55, sat:80, sector:55},
  bescods:         {gaia:50, planet:55, struct:60, fed:70, sat:75, sector:55},
  itars:           {gaia:90, planet:35, struct:70, fed:70, sat:55, sector:50},
  nevlas:          {gaia:15, planet:85, struct:50, fed:50, sat:85, sector:45},
  xenos:           {gaia:70, planet:40, struct:40, fed:45, sat:40, sector:65},
  gleens:          {gaia:80, planet:20, struct:30, fed:35, sat:30, sector:20},
  geodens:         {gaia:10, planet:97, struct:55, fed:55, sat:55, sector:55},
  'bal-taks':      {gaia:80, planet:30, struct:47, fed:35, sat:30, sector:45},
  'hadsch-hallas': {gaia:55, planet:55, struct:55, fed:55, sat:55, sector:55},
  ivits:           {gaia:40, planet:40, struct:15, fed:15, sat:15, sector:10}
};

// Ajustes por rival (negativo = esa facción sufre cuando ese rival está en la mesa).
var RIVAL = {
  taklons: { gleens: -4, lantids: -4, ambas: -2, xenos: -2 },
  nevlas:  { gleens: -4, lantids: -4, ambas: -2, xenos: -2 },
  ambas:   { gleens: -3 },
  xenos:   { gleens: -2 }
};
var RIVAL_WHY = {
  taklons: 'cuidado: los Taklons crecen con tu carga de poder',
  nevlas: 'cuidado: los Nevlas crecen con tu carga de poder',
  ambas: 'los Ambas expanden rápido y pueden aislarte',
  xenos: 'los Xenos compiten por los mismos planetas'
};

var COLORS = [
  { id: 'terra', name: 'Terra', f: ['terrans','lantids'] },
  { id: 'desert', name: 'Desierto', f: ['xenos','gleens'] },
  { id: 'swamp', name: 'Pantano', f: ['taklons','ambas'] },
  { id: 'oxide', name: 'Óxido', f: ['hadsch-hallas','ivits'] },
  { id: 'volcanic', name: 'Volcánico', f: ['bal-taks','geodens'] },
  { id: 'ice', name: 'Hielo', f: ['nevlas','itars'] },
  { id: 'titanium', name: 'Titanio', f: ['firaks','bescods'] }
];

// Aperturas y consejos por facción. Notación: PI = Instituto Planetario, AC = Academia, RL = Laboratorio,
// TS = Puesto comercial, M = mina (cuentan las 2 del inicio).
var GUIDE = {
  terrans: {
    style: 'Versátil: PI temprano con ciencia o economía, o RL + puesto comercial para PI en R2.',
    openings: [
      {name:'PI + 2M', tag:'Más común', text:'Su PI es excelente. Los expertos lo combinan con la vía de Ciencia si no hay mucha competencia por Gaia y el mapa ayuda.'},
      {name:'RL + TS + 2M', tag:'Fuerte', text:'Prepara el PI para R2. Es popular y de las aperturas mejor puntuadas.'},
      {name:'RL + nM (con Navegación)', tag:'Expansión', text:'Mientras más minas, mejor. Sube Navegación para llegar a más planetas.'}
    ],
    tips: ['Es fuerte en Gaia, Satélites y estructuras; el tipo de planeta es su punto débil.', 'Si te cortan los planetas transdimensionales sufres: protegé tu zona.', 'La AC en R1 rinde parecido al PI, pero casi nadie la prueba.'],
    avoid: 'Jugarlos "siempre igual": aguantan varias rutas de pistas.'
  },
  lantids: {
    style: 'Necesitan rivales cerca: más jugadores, mejores resultados. Ideales cuando hay una puntuación final que les gusta.',
    openings: [
      {name:'PI + nM (n ≥ 4)', tag:'Más común', text:'Brilla con 4 o más minas compartidas en R1 para ganar ritmo de pistas.'},
      {name:'RL + TS + 2M', tag:'Subestimada', text:'Rinde bien en promedio y deja listo el PI para R2/R3.'},
      {name:'RL + 2/3M con Economía', tag:'Alternativa', text:'Poco explorada pero con buenos puntajes.'}
    ],
    tips: ['Elegilos cuando al menos una puntuación final les favorezca (Estructuras, Est. federadas o Sectores).', 'Las minas compartidas dan mucha carga: no se las regales a Taklons o Nevlas.', 'Empiezan con 13 créditos, por eso la AC en R1 es difícil.'],
    avoid: 'Evitalos con Gaia + Tipos de planeta + Satélites: casi nunca ganan así.'
  },
  xenos: {
    style: 'Mapa y minas: RL con muchas minas, AC con una mina extra, o 2RL si falta mineral.',
    openings: [
      {name:'RL + nM (n ≥ 5)', tag:'Más común', text:'Comparable a las mejores. Buscá saltos [desierto]-[gaia]-[un terraformeo] dentro de rango 2.'},
      {name:'AC + 2M', tag:'Sólida', text:'Su mina extra inicial permite hacer solo la AC y cerrar la ronda con 2 minas más.'},
      {name:'2RL', tag:'Poco explorada', text:'Si no te alcanza el mineral para la AC, rinde casi igual.'}
    ],
    tips: ['Empiezan en IA: el QIC de 4 en R1 y subir a IA3 es una vía conocida.', 'Juntá varios Gaia temprano para asegurar el 3.º lugar en esa puntuación sin gaiaformar.', 'Su habilidad rinde cuando querés federar rápido.'],
    avoid: 'No saques el PI en R1.'
  },
  gleens: {
    style: 'Minas, minas y más minas. Mientras más temprano se expanden, mejor.',
    openings: [
      {name:'Mine spree (6M / 7M)', tag:'La mejor', text:'4–5 minas nuevas en R1 y nada más. Funciona de maravilla.'},
      {name:'RL + nM (n ≥ 4)', tag:'Común', text:'Solo puntúa bien con 4 o más minas.'},
      {name:'xTS + yM', tag:'Poco usada', text:'Te asegura créditos para R2.'}
    ],
    tips: ['No pueden usar QIC para ampliar el alcance: no te dejes aislar.', 'Con Gaia o Sectores como puntuación final, tené cuidado: te pueden cortar.', 'Son los que menos cargan poder; no cuentes con eso.'],
    avoid: 'AC en R1 con un Ambas en la mesa, y el PI en R1.'
  },
  taklons: {
    style: 'La Piedra Cerebral aprovecha cada carga. Apuntá a AC o 2RL en R1.',
    openings: [
      {name:'AC + 3/4M', tag:'Más común', text:'Una de sus mejores. Posible porque cargan mucho poder en R1.'},
      {name:'2RL', tag:'Mejor puntuada', text:'Buscan cargar desde dos lugares y exprimir las bonificaciones de ronda.'},
      {name:'RL + 4M', tag:'Situacional', text:'Solo rinde con 4 minas o más; RL + TS + 2M da casi lo mismo.'}
    ],
    tips: ['Son quizás la mejor facción de puntuación final; Gaia es su punto flojo.', 'Si juegan contra expertos te van a negar la carga: cavá o conquistá un planeta y unite a la carga.', 'En Satélites, sacá el PI antes de lo habitual.'],
    avoid: 'El PI en R1: es lo que peor les rinde.'
  },
  ambas: {
    style: 'RL con muchas minas o AC con una mina extra; el PI viene después.',
    openings: [
      {name:'RL + nM (n ≥ 4)', tag:'Más común', text:'Empiezan en Navegación 1, así que esto les sale fácil.'},
      {name:'AC + 1/2M', tag:'Buena', text:'Terra 1 cubre el mineral que falta; suman Economía o Ciencia.'},
      {name:'2TS + 4M / 3TS + 2M', tag:'Poco conocida', text:'Cubre la falta de créditos de R2 con buenos puntajes; sacrifica conocimiento.'}
    ],
    tips: ['Buenas en estructuras, est. federadas y sectores; Gaia es lo más flojo (apuntá al 3.º lugar).', 'Mejores con jugadores nuevos: a nivel experto bajan a mitad de tabla.', 'Hacer 4 federaciones no alcanza para ganar.'],
    avoid: 'PI en R1.'
  },
  'hadsch-hallas': {
    style: 'Versátil. Buena en 2 y 3 jugadores; sufre en 4 por la competencia por objetivos comunes.',
    openings: [
      {name:'AC + 2M', tag:'Más común', text:'Su apertura más popular.'},
      {name:'RL + 4/5M', tag:'Buena', text:'Con pasos en Navegación para facilitar las minas.'},
      {name:'2RL + M', tag:'Poco explorada', text:'Rinde parecido a la AC.'}
    ],
    tips: ['Mejoran con Gaia de lo que se cree: gaiaformar les va bien.', 'Pueden perseguir cualquier puntuación final, pero rara vez ganan una.', 'Decidí antes si jugás hacia la puntuación final o hacia otras vías.'],
    avoid: 'PI en R1: es la trampa más común (−19 a −22 PV).'
  },
  ivits: {
    style: 'La más fuerte en 2 y 3 jugadores. Casi no necesita la puntuación final.',
    openings: [
      {name:'PI + RL + 2M', tag:'Mejor', text:'Ya empiezan con PI. Esta es la combinación que mejor puntúa.'},
      {name:'PI + RL + 0/1M', tag:'Común', text:'Variantes más sencillas.'},
      {name:'PI + AC', tag:'Posible', text:'Se hace con federación temprana (2 minerales extra); los datos no la favorecen sobre el RL.'}
    ],
    tips: ['Compensan la puntuación final floja con losetas avanzadas (la mayoría de los puntos de tecnología).', 'Una federación temprana te pone primero para las losetas avanzadas.', 'Con 12/36 PV de puntuación final ya estás bien.'],
    avoid: 'Pelear puntuaciones finales que no te convienen.'
  },
  'bal-taks': {
    style: 'Rígida: AC o RL, siempre con Gaia como primera pista.',
    openings: [
      {name:'AC + 1/2M', tag:'Más común', text:'Buenos resultados con 1 o 2 minas.'},
      {name:'RL + 2M', tag:'Segunda', text:'Otras RL + nM solo según la situación.'},
      {name:'2RL', tag:'Pasa desapercibida', text:'Útil si falta mineral o querés cargar desde dos sitios.'}
    ],
    tips: ['Seriamente podés usar la acción de 4 QIC en R1 (o R2) con QIC extra.', 'Sectores: usá la red transdimensional.', 'Punto fuerte: puntuación final de Gaia.'],
    avoid: 'El PI: casi siempre un desastre (puntajes menores a 100).'
  },
  geodens: {
    style: 'PI temprano para juntar tipos de planeta, o AC con Economía y PI en R2/R3.',
    openings: [
      {name:'PI + 4M', tag:'Más común', text:'Solo sale bien con 4 minas en tipos distintos: base, rojo, amarillo y Gaia.'},
      {name:'AC + Economía', tag:'Mejor que PI+2/3M', text:'Preparás el PI para R2 o R3.'},
      {name:'RL + TS + 2M', tag:'Efectiva', text:'Ideal con planetas base al alcance de QIC; arma el PI de R2.'}
    ],
    tips: ['Son los reyes del QIC: tomá al menos 3 acciones de QIC por partida (desde R4).', 'La puntuación de Tipos de planeta es su especialidad (97).', 'Rara vez miran Gaia.'],
    avoid: 'PI con solo 2–3 minas.'
  },
  firaks: {
    style: 'Su PI da ritmo de pistas incomparable. Lo ideal es PI + TS en R1.',
    openings: [
      {name:'PI + TS', tag:'Mejor (+14 PV)', text:'Necesita 11 de mineral: acción de 2 minerales, Terra 1, o convertir un QIC.'},
      {name:'RL + TS + 1/2M', tag:'Alternativa', text:'Si no podés con el PI o R2 es la ronda de PI.'},
      {name:'RL + 2M', tag:'Popular, pero peor', text:'Es la más común y rinde bastante menos que PI + TS.'}
    ],
    tips: ['Casi siempre el PI sale en las 2 primeras rondas.', 'No puntúan fuerte con los refuerzos; compensan con tecnología.', 'Buenas en Satélites y Tipos de planeta.'],
    avoid: 'No empieces con su AC.'
  },
  bescods: {
    style: 'RL con minas; son más difíciles. Usá la habilidad antes de construir el RL.',
    openings: [
      {name:'RL + nM', tag:'Mejor y más común', text:'Cubrí tus planetas base temprano.'},
      {name:'2RL', tag:'Buena', text:'Cuando no hay presión sobre tus planetas base: Ciencia 2/3 y 4 de conocimiento para avanzar en R2.'},
      {name:'RL + 5M', tag:'Con más minas', text:'En las RL + nM, más minas suele ser mejor.'}
    ],
    tips: ['Usá tu habilidad especial antes de construir el RL, para subir la misma pista dos veces.', 'Las 18 PV en una sola categoría son difíciles: compensá en otro lado.', 'Muy buenas en Satélites y Est. federadas.'],
    avoid: 'PI y AC en R1: rinden mal.'
  },
  nevlas: {
    style: 'Decidí temprano: PI o AC. Con PI, primero PI y después RL.',
    openings: [
      {name:'PI + RL + 1/2M', tag:'Mejor', text:'Las mejores puntuadas. Con Nevlas conviene el PI antes que el RL.'},
      {name:'PI + 2M', tag:'Más común', text:'Más minas mejoran el resultado (más peso de Navegación).'},
      {name:'AC + 1/2M', tag:'Parecida', text:'El PI llega en R2/R3.'}
    ],
    tips: ['Los expertos las exprimen mucho más que los novatos.', 'Convertí gratis a mineral para sumar satélites.', 'Excelentes en Satélites y Tipos de planeta, flojas en Gaia.'],
    avoid: 'Opciones tibias de RL sin comprometerte con PI o AC.'
  },
  itars: {
    style: 'Dos grandes opciones: AC o PI. Ambas son sus mejores salidas.',
    openings: [
      {name:'AC (3 conocimiento)', tag:'Ligeramente mejor', text:'Tienen la mejor AC del juego. Suma Economía o Ciencia y gaiaformás cuando saques el PI.'},
      {name:'PI + paso en Gaia', tag:'Sinergia', text:'Quemás las fichas de Gaia para losetas de tecnología en la fase Gaia siguiente.'},
      {name:'RL + 5M', tag:'Aceptable', text:'Es la única variante de RL que rinde parecido.'}
    ],
    tips: ['PI inmediato: más seguridad por competencia en Gaia, pero menos pistas (~3 vs 5).', 'Satélites: equilibrá las fichas entre tecnología y satélites.', 'Con PI temprano compensá en otros lados.'],
    avoid: 'RL de apertura salvo RL + 5M.'
  }
};

var FACTION_BASE = {};
// ---- Motor ----
// Solo ids conocidos (allowlist): un valor como '__proto__' no debe pasar como nivel.
function levelOf(level) { return Object.prototype.hasOwnProperty.call(RANK_BY_LEVEL, level) ? level : DEFAULT_LEVEL; }
function baseScores(players, auction, level) {
  var t = RANK_BY_LEVEL[levelOf(level)][players][auction ? 'auction' : 'free'];
  var min = Infinity, max = -Infinity;
  IDS.forEach(function (id) { min = Math.min(min, t[id]); max = Math.max(max, t[id]); });
  var out = {};
  IDS.forEach(function (id) { out[id] = 86 - 52 * (t[id] - min) / (max - min); });
  return out;
}
function finalAdj(id, scorings) {
  if (!scorings || scorings.length === 0) return 0;
  var s = 0; scorings.forEach(function (k) { s += FINAL[id][k]; });
  return (s / scorings.length - 50) * 0.28;
}
function rivalAdj(id, rivals) {
  var s = 0, why = [];
  (rivals || []).forEach(function (r) {
    var v = RIVAL[r] && RIVAL[r][id];
    if (v) { s += v; why.push(r); }
  });
  return { v: Math.max(-8, s), by: why };
}
function colorOf(id) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].f.indexOf(id) >= 0) return COLORS[i].id; }

// Aviso de muestra chica: si el margen de error (95 %) del rango promedio de alguna facción llega a ±0,30, el orden es
// orientativo. Desvío del puesto al azar: 2p 0,5; 3p 0,82; 4p 1,12. Con los datos actuales aplica solo a 3p Competitivo.
var SAMPLE_MARGIN = 0.3;
var RANK_SD = { 2: 0.5, 3: Math.sqrt(2 / 3), 4: Math.sqrt(1.25) };
function sampleNote(players, level) {
  var g = GAMES[levelOf(level)][players], vals = IDS.map(function (id) { return g[id]; });
  var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  var margin = 1.96 * RANK_SD[players] / Math.sqrt(min);
  return margin >= SAMPLE_MARGIN ? { min: min, max: max, margin: margin } : null;
}

// Texto de qué partidas respaldan el ranking, para la nota al pie.
function sourceOf(players, level) {
  var l = LEVELS.filter(function (x) { return x.id === levelOf(level); })[0];
  return l.source || ('mesas con elo promedio mayor a ' + (players === 4 ? 300 : 250) + ' y puntaje mínimo 120');
}

// state: {players, auction, level, scorings:[ids], rivals:[ids], blocked:[colorIds]}; level por defecto: DEFAULT_LEVEL.
function rank(state) {
  var base = baseScores(state.players, state.auction, state.level);
  var taken = {};
  (state.blocked || []).forEach(function (c) { taken[c] = 'blocked'; });
  (state.rivals || []).forEach(function (r) { taken[colorOf(r)] = r; });
  var list = IDS.map(function (id) {
    var fa = finalAdj(id, state.scorings), ra = rivalAdj(id, state.rivals);
    var unavailable = !!taken[colorOf(id)];
    return { id: id, base: base[id], finalAdj: fa, rivalAdj: ra.v, rivalBy: ra.by,
             score: Math.max(0, Math.min(100, base[id] + fa + ra.v)), unavailable: unavailable, takenBy: taken[colorOf(id)] };
  });
  list.sort(function (a, b) {
    if (a.unavailable !== b.unavailable) return a.unavailable ? 1 : -1;
    return b.score - a.score;
  });
  return list;
}

export { IDS, RANK, RANK_BY_LEVEL, LEVELS, DEFAULT_LEVEL, GAMES, SCORINGS, FINAL, COLORS, GUIDE, RIVAL_WHY, rank, colorOf, baseScores, sampleNote, sourceOf };
