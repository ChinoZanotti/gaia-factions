import { SegmentedControl, Switch } from '../design-system';

export default function StepPlayers({ state, set }) {
  return (
    <div className="gp-stack">
      <SegmentedControl className="gp-seg" label="Cantidad de jugadores" value={state.players} onChange={(v) => set({ players: v })}
        options={[2, 3, 4].map((n) => ({ value: n, label: <span>{n}<small>jugadores</small></span> }))} />
      <div className="gp-switch">
        <Switch label="Elegimos facciones con subasta" checked={state.auction} onChange={(e) => set({ auction: e.target.checked })} />
      </div>
      <p className="gp-note">
        {state.auction ? 'Ranking contando el costo de la subasta (lo que se paga por la facción).' : 'Ranking por fuerza real de la facción, sin subasta (elección directa).'}
      </p>
    </div>
  );
}
