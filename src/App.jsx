import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Logo, Toast } from './design-system';
import { DEFAULT_LEVEL, rank, sampleNote, sourceOf } from './data/data.js';
import { FBY } from './lookups.js';
import { rowAdjust } from './lib/reasons.js';
import Detail from './components/Detail.jsx';
import LiveHint from './components/LiveHint.jsx';
import Ranking from './components/Ranking.jsx';
import SampleNote from './components/SampleNote.jsx';
import StepPlayers from './components/StepPlayers.jsx';
import StepRivals from './components/StepRivals.jsx';
import StepScoring from './components/StepScoring.jsx';
import Summary from './components/Summary.jsx';

const STEPS = [
  { t: 'La mesa', h: '¿Cómo es la mesa?', p: 'Cantidad, experiencia y subasta cambian el ranking.' },
  { t: 'Puntuaciones finales', h: 'Puntuaciones finales', p: 'Elegí las 2 que salieron en esta partida.' },
  { t: 'Colores y rivales', h: 'Colores y rivales', p: 'Tocá la facción que eligió cada rival, o el color si no sabés cuál.' },
  { t: 'Ranking', h: 'Tu ranking', p: 'Tocá una facción para ver sus aperturas y consejos.' },
];
const INITIAL = { players: 4, auction: false, level: DEFAULT_LEVEL, scorings: [], rivals: [], blocked: [] };
const UNDO_MS = 6000; // cuánto queda disponible "Deshacer" después de "Nueva partida"

export default function App() {
  const [state, setState] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(null);
  // "Nueva partida" con Deshacer: se guarda la partida anterior unos segundos. Si el usuario empieza a cargar la nueva,
  // el aviso se va (deshacer no debe pisar lo que acaba de elegir).
  const [undo, setUndo] = useState(null); // { state, step } de la partida anterior
  const undoTimer = useRef(null);
  const clearUndo = () => { clearTimeout(undoTimer.current); setUndo(null); };
  useEffect(() => () => clearTimeout(undoTimer.current), []);
  const set = (patch) => { if (undo) clearUndo(); setState({ ...state, ...patch }); };
  const go = (n) => { setStep(n); setPick(null); window.scrollTo(0, 0); };
  const list = useMemo(() => rank(state), [state]);
  const inDetail = !!pick;
  const cur = STEPS[step];

  // Foco y scroll: al cambiar de paso o de vista el foco va al título (el lector anuncia dónde estás);
  // al volver del detalle se recupera la posición en la lista y el foco en la fila que se tocó.
  const titleRef = useRef(null);
  const returnTo = useRef(null); // { id, y } de la fila desde la que se abrió el detalle
  const mounted = useRef({ step: false, pick: false });
  const openDetail = (id, pos) => { returnTo.current = { id, y: window.scrollY }; setPick({ id, pos }); };
  const closeDetail = () => setPick(null);

  useLayoutEffect(() => {
    if (!mounted.current.step) { mounted.current.step = true; return; }
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  useLayoutEffect(() => {
    if (!mounted.current.pick) { mounted.current.pick = true; return; }
    if (pick) { window.scrollTo(0, 0); titleRef.current?.focus({ preventScroll: true }); return; }
    const back = returnTo.current;
    returnTo.current = null;
    if (!back) return;
    window.scrollTo(0, back.y);
    document.querySelector('[data-fid="' + CSS.escape(back.id) + '"]')?.focus({ preventScroll: true });
  }, [pick]);

  const head = (
    <header className="gp-head">
      <div className="gp-head__row">
        {(inDetail || step > 0) && (
          <IconButton icon="chevron-right" label="Volver" variant="ghost" style={{ transform: 'rotate(180deg)' }}
            onClick={() => (inDetail ? closeDetail() : go(step - 1))} />
        )}
        <h1 className="gp-head__title" ref={titleRef} tabIndex={-1}>
          <small>{inDetail ? 'Detalle de facción' : 'Paso ' + (step + 1) + ' de ' + STEPS.length}</small>
          {inDetail ? FBY[pick.id].name : cur.t}
        </h1>
        <Logo variant="emblem" theme="dark" height={36} />
      </div>
      {!inDetail && (
        // Decorativa: el título ya dice "Paso N de 4".
        <div className="gp-dots" aria-hidden="true">
          {STEPS.map((s, i) => <div key={i} className={'gp-dot' + (i <= step ? ' gp-dot--on' : '')} />)}
        </div>
      )}
    </header>
  );

  const main = inDetail
    ? <Detail id={pick.id} pos={pick.pos} state={state} list={list} />
    : (
      <>
        <div><h2 className="gp-h">{cur.h}</h2><p className="gp-p">{cur.p}</p></div>
        {step === 0 && <StepPlayers state={state} set={set} />}
        {step === 1 && <StepScoring state={state} set={set} />}
        {step === 2 && <StepRivals state={state} set={set} />}
        {step === 3 && <Summary state={state} go={go} />}
        <SampleNote note={sampleNote(state.players, state.level)} />
        <LiveHint step={step} showLegend={list.some((r) => !r.unavailable && rowAdjust(r) !== 0)} />
        <Ranking list={list} state={state} onPick={openDetail} />
        {/* Nota de fuente solo en el ranking final (paso 4); en el detalle va una propia. */}
        {step === 3 && <p className="gp-note">{'Basado en las estadísticas de Arun Murali (BGG, 2021): ' + sourceOf(state.players, state.level) + '. Es una guía, no una garantía: el mapa y las losetas también cuentan.'}</p>}
      </>
    );

  function newGame() {
    clearTimeout(undoTimer.current);
    setUndo({ state, step });
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
    setState(INITIAL);
    go(0);
  }
  function undoNewGame() {
    const prev = undo;
    clearUndo();
    setState(prev.state);
    go(prev.step);
  }

  let action;
  if (inDetail) action = <Button size="lg" block onClick={closeDetail}>Volver al ranking</Button>;
  else if (step < 3) action = <Button size="lg" block iconRight="arrow-right" onClick={() => go(step + 1)}>{step === 2 ? 'Ver ranking final' : 'Siguiente'}</Button>;
  else action = <Button size="lg" block variant="secondary" icon="shuffle" onClick={newGame}>Nueva partida</Button>;

  return (
    <div className="gp-app">
      {head}
      <main className="gp-main">{main}</main>
      {undo && (
        <div className="gp-undo">
          <Toast title="Empezaste una partida nueva.">
            <Button variant="secondary" onClick={undoNewGame}>Deshacer</Button>
          </Toast>
        </div>
      )}
      <div className="gp-bar"><div className="gp-bar__in">{action}</div></div>
    </div>
  );
}
