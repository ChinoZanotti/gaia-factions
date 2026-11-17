import { SegmentedControl, Switch } from '../design-system';
import { DEFAULT_LEVEL, LEVELS } from '../data/data.js';
import KeyNav from './KeyNav.jsx';

// Paso 1, "La mesa": cantidad de jugadores, experiencia de la mesa y subasta.
// Los títulos visibles van con aria-hidden porque el mismo texto ya es el nombre accesible de cada grupo.
export default function StepPlayers({ state, set }) {
  const level = LEVELS.find((l) => l.id === state.level) || LEVELS.find((l) => l.id === DEFAULT_LEVEL);
  return (
    <div className="gp-stack">
      <div className="gp-field">
        <p className="gp-label" aria-hidden="true">Jugadores</p>
        <KeyNav values={[2, 3, 4]} value={state.players} onChange={(v) => set({ players: v })}>
          <SegmentedControl className="gp-seg" label="Jugadores" value={state.players} onChange={(v) => set({ players: v })}
            options={[2, 3, 4].map((n) => ({ value: n, label: String(n) }))} />
        </KeyNav>
      </div>
      <div className="gp-field">
        <p className="gp-label" aria-hidden="true">Experiencia de la mesa</p>
        <KeyNav values={LEVELS.map((l) => l.id)} value={level.id} onChange={(v) => set({ level: v })}>
          <SegmentedControl className="gp-seg gp-seg--level" label="Experiencia de la mesa" value={level.id} onChange={(v) => set({ level: v })}
            options={LEVELS.map((l) => ({ value: l.id, label: l.name }))} />
        </KeyNav>
        <p className="gp-level-desc" aria-live="polite">{level.desc}</p>
      </div>
      <div className="gp-switch">
        <Switch label="Elegimos facciones con subasta" checked={state.auction} onChange={(e) => set({ auction: e.target.checked })} />
      </div>
      <p className="gp-note">
        {state.auction ? 'Ranking contando el costo de la subasta (lo que se paga por la facción).' : 'Ranking por fuerza real de la facción, sin subasta (elección directa).'}
      </p>
    </div>
  );
}
