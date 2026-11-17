import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => { window.scrollTo(0, 0); }, [pick]);

  const head = (
    <header className="gp-head">
      <div className="gp-head__row">
        {(inDetail || step > 0) && (
          <IconButton icon="chevron-right" label="Volver" variant="ghost" style={{ transform: 'rotate(180deg)' }}
            onClick={() => (inDetail ? setPick(null) : go(step - 1))} />
        )}
        <h1 className="gp-head__title">
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
        <Ranking list={list} state={state} onPick={(id, pos) => setPick({ id, pos })} />
        <p className="gp-note">Basado en las estadísticas de Arun Murali (BGG, 2021): partidas de nivel alto, puntaje mínimo 120. Es una guía, no una garantía: el mapa y las losetas también cuentan.</p>
      </>
    );

  let action;
  if (inDetail) action = <Button size="lg" block onClick={() => setPick(null)}>Volver al ranking</Button>;
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
