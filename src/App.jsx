import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Logo } from './design-system';
import { rank } from './data/data.js';
import { FBY } from './lookups.js';
import Detail from './components/Detail.jsx';
import LiveHint from './components/LiveHint.jsx';
import Ranking from './components/Ranking.jsx';
import StepPlayers from './components/StepPlayers.jsx';
import StepRivals from './components/StepRivals.jsx';
import StepScoring from './components/StepScoring.jsx';
import Summary from './components/Summary.jsx';

const STEPS = [
  { t: 'Jugadores', h: '¿Cuántos juegan?', p: 'El ranking cambia mucho según la cantidad de jugadores.' },
  { t: 'Puntuaciones finales', h: 'Puntuaciones finales', p: 'Elegí las 2 que salieron en esta partida.' },
  { t: 'Colores y rivales', h: 'Colores y rivales', p: 'Tocá la facción que eligió cada rival, o el color si no sabés cuál.' },
  { t: 'Ranking', h: 'Tu ranking', p: 'Tocá una facción para ver sus aperturas y consejos.' },
];
const INITIAL = { players: 4, auction: false, scorings: [], rivals: [], blocked: [] };

export default function App() {
  const [state, setState] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(null);
  const set = (patch) => setState({ ...state, ...patch });
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
        <div className="gp-dots" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
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
        <LiveHint step={step} />
        <Ranking list={list} state={state} onPick={openDetail} />
        <p className="gp-note">Basado en las estadísticas de Arun Murali (BGG, 2021): partidas de nivel alto, puntaje mínimo 120. Es una guía, no una garantía: el mapa y las losetas también cuentan.</p>
      </>
    );

  let action;
  if (inDetail) action = <Button size="lg" block onClick={closeDetail}>Volver al ranking</Button>;
  else if (step < 3) action = <Button size="lg" block iconRight="arrow-right" onClick={() => go(step + 1)}>{step === 2 ? 'Ver ranking final' : 'Siguiente'}</Button>;
  else action = <Button size="lg" block variant="secondary" icon="shuffle" onClick={() => { setState(INITIAL); go(0); }}>Nueva partida</Button>;

  return (
    <div className="gp-app">
      {head}
      <main className="gp-main">{main}</main>
      <div className="gp-bar"><div className="gp-bar__in">{action}</div></div>
    </div>
  );
}
