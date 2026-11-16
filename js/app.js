(function () {
  var React = window.React, h = React.createElement, G = window.GaiaFactions, D = window.GaiaData;
  var useState = React.useState, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect, useEffect = React.useEffect, useMemo = React.useMemo;
  var FBY = {}; G.FACTIONS.forEach(function (f) { FBY[f.id] = f; });
  var SBY = {}; D.SCORINGS.forEach(function (s) { SBY[s.id] = s; });
  var CBY = {}; D.COLORS.forEach(function (c) { CBY[c.id] = c; });
  var STEPS = [
    { t: 'Jugadores', h: '¿Cuántos juegan?', p: 'El ranking cambia mucho según la cantidad de jugadores.' },
    { t: 'Puntuaciones finales', h: 'Puntuaciones finales', p: 'Elegí las 2 que salieron en esta partida.' },
    { t: 'Colores y rivales', h: 'Colores y rivales', p: 'Tocá la facción que eligió cada rival, o el color si no sabés cuál.' },
    { t: 'Ranking', h: 'Tu ranking', p: 'Tocá una facción para ver sus aperturas y consejos.' }
  ];

  function reasonFor(r, baseRank, players) {
    if (r.unavailable) return r.takenBy === 'blocked' ? 'Color ocupado' : 'Color ocupado por ' + FBY[r.takenBy].name;
    var parts = [];
    if (r.rivalAdj <= -2 && r.rivalBy.length) parts.push(G.FACTIONS && D.RIVAL_WHY[r.rivalBy[0]]);
    if (r.finalAdj >= 3) parts.push('encaja con las puntuaciones finales');
    else if (r.finalAdj <= -3) parts.push('flojo en estas puntuaciones finales');
    if (!parts.length) parts.push(baseRank <= 4 ? 'fuerte con ' + players + ' jugadores' : baseRank >= 11 ? 'débil con ' + players + ' jugadores' : 'nivel medio con ' + players + ' jugadores');
    var s = parts.join(' · ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function useFlip(ref, key) {
    var prev = useRef({});
    useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      var kids = el.querySelectorAll('[data-fid]'), next = {};
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      kids.forEach(function (k) { next[k.getAttribute('data-fid')] = k.offsetTop; });
      if (!reduce) kids.forEach(function (k) {
        var id = k.getAttribute('data-fid'), d = prev.current[id] != null ? prev.current[id] - next[id] : 0;
        if (d) { k.style.transition = 'none'; k.style.transform = 'translateY(' + d + 'px)'; k.getBoundingClientRect();
          k.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)'; k.style.transform = ''; }
      });
      prev.current = next;
    }, [key]);
  }

  function Ranking(p) {
    var list = p.list, ref = useRef(null);
    var baseOrder = useMemo(function () {
      var b = D.baseScores(p.state.players, p.state.auction), ids = D.IDS.slice().sort(function (a, c) { return b[c] - b[a]; }), m = {};
      ids.forEach(function (id, i) { m[id] = i + 1; }); return m;
    }, [p.state.players, p.state.auction]);
    useFlip(ref, list.map(function (r) { return r.id; }).join());
    return h('div', { className: 'gp-rank-wrap', role: 'list', 'aria-label': 'Ranking de facciones', ref: ref },
      list.map(function (r, i) {
        var f = FBY[r.id], adj = Math.round(r.finalAdj + r.rivalAdj);
        return h('button', { key: r.id, 'data-fid': r.id, role: 'listitem', type: 'button', className: 'gp-row' + (i === 0 && !r.unavailable ? ' gp-row--top' : '') + (r.unavailable ? ' gp-row--off' : ''), onClick: function () { p.onPick(r.id, i + 1); },
          'aria-label': f.name + ', puesto ' + (i + 1) },
          h('div', { className: 'gf-rank__pos' }, i + 1),
          h(G.PlanetToken, { type: f.planet, size: 'md' }),
          h('div', { className: 'gp-row__name' }, h('div', { className: 'gf-rank__name' }, f.name), h('div', { className: 'gf-rank__why' }, reasonFor(r, baseOrder[r.id], p.state.players))),
          h('div', { className: 'gp-row__delta' }, r.unavailable ? h(G.Badge, { tone: 'neutral' }, 'No') : (adj !== 0 ? h(G.Badge, { tone: adj > 0 ? 'success' : 'danger', icon: adj > 0 ? 'plus' : 'minus' }, Math.abs(adj)) : null)),
          h(G.Meter, { value: Math.round(r.score), label: 'Puntaje ' + f.name }));
      }));
  }

  function StepPlayers(p) {
    var s = p.state;
    return h('div', { className: 'gp-stack' },
      h(G.SegmentedControl, { className: 'gp-seg', label: 'Cantidad de jugadores', value: s.players, onChange: function (v) { p.set({ players: v }); },
        options: [2, 3, 4].map(function (n) { return { value: n, label: h('span', null, n, h('small', null, 'jugadores')) }; }) }),
      h('div', { className: 'gp-switch' }, h(G.Switch, { label: 'Elegimos facciones con subasta', checked: s.auction, onChange: function (e) { p.set({ auction: e.target.checked }); } })),
      h('p', { className: 'gp-note' }, s.auction ? 'Ranking contando el costo de la subasta (lo que se paga por la facción).' : 'Ranking por fuerza real de la facción, sin subasta (elección directa).'));
  }

  function StepScoring(p) {
    var s = p.state, full = s.scorings.length >= 2;
    return h('div', { className: 'gp-stack' },
      h('div', { className: 'gp-chips' }, D.SCORINGS.map(function (c) {
        var on = s.scorings.indexOf(c.id) >= 0;
        return h('button', { key: c.id, type: 'button', className: 'gp-chip', 'aria-pressed': on, disabled: !on && full,
          onClick: function () { p.set({ scorings: on ? s.scorings.filter(function (x) { return x !== c.id; }) : s.scorings.concat(c.id) }); } },
          h(G.Icon, { name: c.icon }), h('span', null, h('span', { className: 'gp-chip__t' }, c.short), h('span', { className: 'gp-chip__d' }, c.desc)));
      })),
      h('p', { className: 'gp-note' }, h('span', { className: 'gp-count' }, s.scorings.length + '/2'), ' elegidas. Podés seguir sin elegir si todavía no se sortearon.'));
  }

  function StepRivals(p) {
    var s = p.state;
    function toggleRival(id) {
      var on = s.rivals.indexOf(id) >= 0;
      p.set({ rivals: on ? s.rivals.filter(function (x) { return x !== id; }) : s.rivals.concat(id) });
    }
    function toggleColor(c) {
      var on = s.blocked.indexOf(c) >= 0;
      p.set({ blocked: on ? s.blocked.filter(function (x) { return x !== c; }) : s.blocked.concat(c) });
    }
    return h('div', { className: 'gp-stack' },
      D.COLORS.map(function (c) {
        var rivalHere = c.f.filter(function (id) { return s.rivals.indexOf(id) >= 0; });
        var off = rivalHere.length > 0 || s.blocked.indexOf(c.id) >= 0;
        return h('div', { key: c.id, className: 'gp-color' + (off ? ' gp-color--off' : '') },
          h('button', { type: 'button', className: 'gp-color__head', 'aria-pressed': s.blocked.indexOf(c.id) >= 0, onClick: function () { toggleColor(c.id); } },
            h(G.PlanetToken, { type: c.id, size: 'sm' }), h('span', null, c.name),
            h('span', { className: 'gf-badge' + (off ? ' gf-badge--danger' : '') }, off ? 'Ocupado' : 'Libre')),
          h('div', { className: 'gp-color__pair' }, c.f.map(function (id) {
            var f = FBY[id], on = s.rivals.indexOf(id) >= 0;
            return h('button', { key: id, type: 'button', className: 'gp-fbtn', 'aria-pressed': on, onClick: function () { toggleRival(id); } },
              h('b', null, f.name), h('small', null, on ? 'La eligió un rival' : G.DIFFICULTY[f.difficulty]));
          })));
      }),
      h('p', { className: 'gp-note' }, 'Tocá el nombre del color para marcarlo ocupado sin saber qué facción es. Tocá una facción para marcar que la eligió un rival.'));
  }

  function Summary(p) {
    var s = p.state;
    return h('div', { className: 'gp-sum' },
      h('button', { type: 'button', onClick: function () { p.go(0); } }, h(G.Badge, { tone: 'info', icon: 'players' }, s.players + ' jug.' + (s.auction ? ' · subasta' : ''))),
      s.scorings.map(function (id) { return h('button', { key: id, type: 'button', onClick: function () { p.go(1); } }, h(G.Badge, { tone: 'accent', icon: SBY[id].icon }, SBY[id].short)); }),
      s.rivals.map(function (id) { return h('button', { key: id, type: 'button', onClick: function () { p.go(2); } }, h(G.Badge, { tone: 'power' }, FBY[id].name)); }),
      s.blocked.map(function (id) { return h('button', { key: id, type: 'button', onClick: function () { p.go(2); } }, h(G.Badge, { tone: 'neutral' }, CBY[id].name + ' ocupado')); }));
  }

  function Detail(p) {
    var f = FBY[p.id], g = D.GUIDE[p.id], s = p.state;
    var tabState = useState('open'), tab = tabState[0];
    var row = p.list.filter(function (r) { return r.id === p.id; })[0];
    var color = CBY[D.colorOf(p.id)];
    var tabs = [{ value: 'open', label: 'Aperturas', count: g.openings.length }, { value: 'tips', label: 'Consejos' }, { value: 'fit', label: 'Encaje' }];
    var body;
    if (tab === 'open') {
      body = h(React.Fragment, null,
        h(G.Panel, { size: 'sm', variant: 'flat', title: 'Cómo se juega' }, h('p', { className: 'gp-p', style: { marginTop: 0, color: 'var(--ink)' } }, g.style)),
        h(G.Panel, { size: 'sm', variant: 'flat' }, g.openings.map(function (o, i) {
          return h('div', { key: i, className: 'gp-open' },
            h('div', { className: 'gp-open__top' }, h('span', { className: 'gp-open__name' }, o.name), h(G.Badge, { tone: i === 0 ? 'accent' : 'neutral' }, o.tag)),
            h('p', null, o.text));
        })),
        h(G.Panel, { size: 'sm', variant: 'flat', title: 'Siglas' }, h('div', { className: 'gp-gloss' },
          h('b', null, 'PI'), h('span', null, 'Instituto Planetario'), h('b', null, 'AC'), h('span', null, 'Academia'), h('b', null, 'RL'), h('span', null, 'Laboratorio de investigación'),
          h('b', null, 'TS'), h('span', null, 'Puesto comercial'), h('b', null, 'M'), h('span', null, 'Minas en el mapa al final de R1 (cuentan las 2 del inicio)'), h('b', null, 'R1'), h('span', null, 'Primera ronda'))));
    } else if (tab === 'tips') {
      body = h(React.Fragment, null,
        h(G.Panel, { size: 'sm', variant: 'flat', title: 'Consejos' }, h('ul', { className: 'gp-list' }, g.tips.map(function (t, i) { return h('li', { key: i }, h(G.Icon, { name: 'check' }), h('span', null, t)); }))),
        h(G.Panel, { size: 'sm', variant: 'flat', title: 'Evitá' }, h('ul', { className: 'gp-list gp-list--bad' }, h('li', null, h(G.Icon, { name: 'alert' }), h('span', null, g.avoid)))));
    } else {
      var fin = D.FINAL[p.id];
      body = h(G.Panel, { size: 'sm', variant: 'flat', title: 'Encaje con las puntuaciones' },
        h('div', { className: 'gp-fit' }, (s.scorings.length ? s.scorings : D.SCORINGS.map(function (x) { return x.id; })).map(function (id) {
          return h(React.Fragment, { key: id }, h('span', null, SBY[id].name), h(G.Meter, { value: fin[id], label: SBY[id].name }));
        })),
        h('p', { className: 'gp-note', style: { marginTop: 12 } }, s.scorings.length ? '' : 'Todavía no elegiste puntuaciones; acá se ven las 6. ', 'Valores estimados: qué tan seguido la facción logra buen puntaje ahí cuando gana.'));
    }
    return h('div', { className: 'gp-stack' },
      h('div', { className: 'gp-hero' }, h(G.PlanetToken, { type: f.planet, size: 'lg' }),
        h('div', null, h('h2', null, f.name),
          h('div', { className: 'gf-row' }, h(G.Badge, { tone: 'neutral' }, color.name), h(G.Badge, { tone: f.difficulty === 'hard' ? 'danger' : f.difficulty === 'easy' ? 'success' : 'info' }, G.DIFFICULTY[f.difficulty]),
            row && !row.unavailable ? h(G.Badge, { tone: 'accent', icon: 'trophy' }, '#' + p.pos + ' · ' + Math.round(row.score)) : null))),
      h('p', { className: 'gp-p', style: { marginTop: 0 } }, f.summary),
      h(G.Tabs, { label: 'Secciones', tabs: tabs, value: tab, onChange: function (v) { tabState[1](v); } }),
      body);
  }

  function App() {
    var st = useState({ players: 4, auction: false, scorings: [], rivals: [], blocked: [] }), state = st[0];
    var stepS = useState(0), step = stepS[0];
    var pickS = useState(null), pick = pickS[0];
    function set(patch) { st[1](Object.assign({}, state, patch)); }
    function go(n) { stepS[1](n); pickS[1](null); window.scrollTo(0, 0); }
    var list = useMemo(function () { return D.rank(state); }, [state]);
    var inDetail = !!pick;
    var cur = STEPS[step];

    useEffect(function () { window.scrollTo(0, 0); }, [pick]);

    var head = h('header', { className: 'gp-head' },
      h('div', { className: 'gp-head__row' },
        (inDetail || step > 0) && h(G.IconButton, { icon: 'chevron-right', label: 'Volver', variant: 'ghost', style: { transform: 'rotate(180deg)' }, onClick: function () { inDetail ? pickS[1](null) : go(step - 1); } }),
        h('h1', { className: 'gp-head__title' }, h('small', null, inDetail ? 'Detalle de facción' : 'Paso ' + (step + 1) + ' de ' + STEPS.length), inDetail ? FBY[pick.id].name : cur.t),
        h(G.Logo, { variant: 'emblem', theme: 'dark', height: 36 })),
      !inDetail && h('div', { className: 'gp-dots', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': STEPS.length, 'aria-valuenow': step + 1 }, STEPS.map(function (s, i) { return h('div', { key: i, className: 'gp-dot' + (i <= step ? ' gp-dot--on' : '') }); })));

    var main;
    if (inDetail) {
      main = h(Detail, { id: pick.id, pos: pick.pos, state: state, list: list });
    } else {
      main = h(React.Fragment, null,
        h('div', null, h('h2', { className: 'gp-h' }, cur.h), h('p', { className: 'gp-p' }, cur.p)),
        step === 0 && h(StepPlayers, { state: state, set: set }),
        step === 1 && h(StepScoring, { state: state, set: set }),
        step === 2 && h(StepRivals, { state: state, set: set }),
        step === 3 && h(Summary, { state: state, go: go }),
        h(Banner, { step: step }),
        h(Ranking, { list: list, state: state, onPick: function (id, pos) { pickS[1]({ id: id, pos: pos }); } }),
        h('p', { className: 'gp-note' }, 'Basado en las estadísticas de Arun Murali (BGG, 2021): partidas de nivel alto, puntaje mínimo 120. Es una guía, no una garantía: el mapa y las losetas también cuentan.'));
    }

    var bar = h('div', { className: 'gp-bar' }, h('div', { className: 'gp-bar__in' },
      inDetail ? h(G.Button, { size: 'lg', block: true, onClick: function () { pickS[1](null); } }, 'Volver al ranking')
        : step < 3 ? h(G.Button, { size: 'lg', block: true, iconRight: 'arrow-right', onClick: function () { go(step + 1); } }, step === 2 ? 'Ver ranking final' : 'Siguiente')
        : h(G.Button, { size: 'lg', block: true, variant: 'secondary', icon: 'shuffle', onClick: function () { st[1]({ players: 4, auction: false, scorings: [], rivals: [], blocked: [] }); go(0); } }, 'Nueva partida')));

    return h('div', { className: 'gp-app' }, head, h('main', { className: 'gp-main' }, main), bar);
  }

  // etiqueta ligera sobre la lista (líder actual)
  function Banner(p) {
    return h('div', { className: 'gp-hint' }, h(G.Icon, { name: 'trophy' }), h('span', null, p.step < 3 ? 'Ranking en vivo — se reordena con cada dato' : 'Mejor a peor para esta partida'));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
