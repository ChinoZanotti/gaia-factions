import { useState } from 'react';
import { Badge, DIFFICULTY, Icon, Meter, Panel, PlanetToken, Tabs } from '../design-system';
import { FINAL, GUIDE, SCORINGS, colorOf } from '../data/data.js';
import { CBY, FBY, SBY } from '../lookups.js';
import CopyGuide from './CopyGuide.jsx';

const GLOSSARY = [
  ['PI', 'Instituto Planetario'], ['AC', 'Academia'], ['RL', 'Laboratorio de investigación'], ['TS', 'Puesto comercial'],
  ['M', 'Minas en el mapa al final de R1 (cuentan las 2 del inicio)'], ['R1', 'Primera ronda'],
];

function Openings({ g }) {
  return (
    <>
      <Panel size="sm" variant="flat" title="Cómo se juega">
        <p className="gp-p" style={{ marginTop: 0, color: 'var(--ink)' }}>{g.style}</p>
      </Panel>
      <Panel size="sm" variant="flat">
        {g.openings.map((o, i) => (
          <div key={i} className="gp-open">
            <div className="gp-open__top">
              <span className="gp-open__name">{o.name}</span>
              <Badge tone={i === 0 ? 'accent' : 'neutral'}>{o.tag}</Badge>
            </div>
            <p>{o.text}</p>
          </div>
        ))}
      </Panel>
      <Glossary />
    </>
  );
}

// Las siglas aparecen en aperturas, consejos y "Qué evitar": el glosario va en las dos pestañas.
function Glossary() {
  return (
    <Panel size="sm" variant="flat" title="Siglas">
      <div className="gp-gloss">
        {GLOSSARY.map(([k, v]) => [<b key={k}>{k}</b>, <span key={k + '-d'}>{v}</span>])}
      </div>
    </Panel>
  );
}

function Tips({ g }) {
  return (
    <>
      <Panel size="sm" variant="flat" title="Consejos">
        <ul className="gp-list">
          {g.tips.map((t, i) => <li key={i}><Icon name="check" /><span>{t}</span></li>)}
        </ul>
      </Panel>
      <Panel size="sm" variant="flat" title="Qué evitar">
        <ul className="gp-list gp-list--bad">
          <li><Icon name="alert" /><span>{g.avoid}</span></li>
        </ul>
      </Panel>
      <Glossary />
    </>
  );
}

function Fit({ id, scorings }) {
  const fin = FINAL[id];
  const ids = scorings.length ? scorings : SCORINGS.map((x) => x.id);
  return (
    <Panel size="sm" variant="flat" title="Encaje con las puntuaciones">
      <div className="gp-fit">
        {ids.map((sid) => [<span key={sid}>{SBY[sid].name}</span>, <Meter key={sid + '-m'} value={fin[sid]} label={SBY[sid].name} />])}
      </div>
      <p className="gp-note" style={{ marginTop: 12 }}>
        {scorings.length ? '' : 'Todavía no elegiste puntuaciones; acá se ven las 6. '}
        {'Valores estimados: qué tan seguido la facción logra buen puntaje ahí cuando gana.'}
      </p>
    </Panel>
  );
}

export default function Detail({ id, pos, state, list }) {
  const f = FBY[id], g = GUIDE[id];
  const [tab, setTab] = useState('open');
  const row = list.find((r) => r.id === id);
  const color = CBY[colorOf(id)];
  const tabs = [{ value: 'open', label: 'Aperturas', count: g.openings.length }, { value: 'tips', label: 'Consejos' }, { value: 'fit', label: 'Encaje' }];
  const tone = f.difficulty === 'hard' ? 'danger' : f.difficulty === 'easy' ? 'success' : 'info';
  return (
    <div className="gp-stack">
      <div className="gp-hero">
        <PlanetToken type={f.planet} size="lg" />
        <div>
          <h2>{f.name}</h2>
          <div className="gf-row">
            <Badge tone="neutral">{color.name}</Badge>
            <Badge tone={tone}>{DIFFICULTY[f.difficulty]}</Badge>
            {row && !row.unavailable ? <Badge tone="accent" icon="trophy">{'#' + pos + ' · ' + Math.round(row.score)}</Badge> : null}
          </div>
        </div>
      </div>
      <p className="gp-p" style={{ marginTop: 0 }}>{f.summary}</p>
      <CopyGuide name={f.name} guide={g} />
      <Tabs label="Secciones" tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'open' ? <Openings g={g} /> : tab === 'tips' ? <Tips g={g} /> : <Fit id={id} scorings={state.scorings} />}
      <p className="gp-note">Aperturas y consejos resumidos de los artículos de Arun Murali (BGG, 2021). Es una guía, no una garantía.</p>
    </div>
  );
}
