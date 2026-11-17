import { PlanetToken, DIFFICULTY } from '../design-system';
import { COLORS } from '../data/data.js';
import { FBY } from '../lookups.js';

export default function StepRivals({ state, set }) {
  const toggle = (key, id) => {
    const on = state[key].includes(id);
    set({ [key]: on ? state[key].filter((x) => x !== id) : state[key].concat(id) });
  };
  return (
    <div className="gp-stack">
      {COLORS.map((c) => {
        const rivalHere = c.f.filter((id) => state.rivals.includes(id));
        const blocked = state.blocked.includes(c.id);
        const off = rivalHere.length > 0 || blocked;
        return (
          <div key={c.id} className={'gp-color' + (off ? ' gp-color--off' : '')}>
            <button type="button" className="gp-color__head" aria-pressed={blocked} onClick={() => toggle('blocked', c.id)}>
              <PlanetToken type={c.id} size="sm" />
              <span>{c.name}</span>
              <span className={'gf-badge' + (off ? ' gf-badge--danger' : '')}>{off ? 'Ocupado' : 'Libre'}</span>
            </button>
            <div className="gp-color__pair">
              {c.f.map((id) => {
                const f = FBY[id], on = state.rivals.includes(id);
                return (
                  <button key={id} type="button" className="gp-fbtn" aria-pressed={on} onClick={() => toggle('rivals', id)}>
                    <b>{f.name}</b>
                    <small>{on ? 'La eligió un rival' : DIFFICULTY[f.difficulty]}</small>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="gp-note">Tocá el nombre del color para marcarlo ocupado sin saber qué facción es. Tocá una facción para marcar que la eligió un rival.</p>
    </div>
  );
}
