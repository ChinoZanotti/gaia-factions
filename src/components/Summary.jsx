import { Badge } from '../design-system';
import { FBY, SBY, CBY } from '../lookups.js';

// Resumen de la partida en el paso final; cada badge lleva al paso donde se cambia.
export default function Summary({ state, go }) {
  return (
    <div className="gp-sum">
      <button type="button" onClick={() => go(0)}>
        <Badge tone="info" icon="players">{state.players + ' jug.' + (state.auction ? ' · subasta' : '')}</Badge>
      </button>
      {state.scorings.map((id) => (
        <button key={id} type="button" onClick={() => go(1)}><Badge tone="accent" icon={SBY[id].icon}>{SBY[id].short}</Badge></button>
      ))}
      {state.rivals.map((id) => (
        <button key={id} type="button" onClick={() => go(2)}><Badge tone="power">{FBY[id].name}</Badge></button>
      ))}
      {state.blocked.map((id) => (
        <button key={id} type="button" onClick={() => go(2)}><Badge tone="neutral">{CBY[id].name + ' ocupado'}</Badge></button>
      ))}
    </div>
  );
}
