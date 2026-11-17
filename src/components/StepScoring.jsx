import { Icon } from '../design-system';
import { SCORINGS } from '../data/data.js';

export default function StepScoring({ state, set }) {
  const full = state.scorings.length >= 2;
  return (
    <div className="gp-stack">
      <div className="gp-chips">
        {SCORINGS.map((c) => {
          const on = state.scorings.includes(c.id);
          return (
            <button key={c.id} type="button" className="gp-chip" aria-pressed={on} disabled={!on && full}
              onClick={() => set({ scorings: on ? state.scorings.filter((x) => x !== c.id) : state.scorings.concat(c.id) })}>
              <Icon name={c.icon} />
              <span><span className="gp-chip__t">{c.short}</span><span className="gp-chip__d">{c.desc}</span></span>
            </button>
          );
        })}
      </div>
      <p className="gp-note">
        <span className="gp-count">{state.scorings.length + '/2'}</span>
        {' elegidas. Podés seguir sin elegir si todavía no se sortearon.'}
      </p>
    </div>
  );
}
