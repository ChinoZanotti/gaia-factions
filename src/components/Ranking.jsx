import { useMemo, useRef } from 'react';
import { Badge, Meter, PlanetToken } from '../design-system';
import useFlip from '../hooks/useFlip.js';
import { baseRankOrder, reasonFor } from '../lib/reasons.js';
import { FBY, factionName } from '../lookups.js';

export default function Ranking({ list, state, onPick }) {
  const ref = useRef(null);
  const baseOrder = useMemo(() => baseRankOrder(state.players, state.auction), [state.players, state.auction]);
  useFlip(ref, list.map((r) => r.id).join());
  return (
    <div className="gp-rank-wrap" role="list" aria-label="Ranking de facciones" ref={ref}>
      {list.map((r, i) => {
        const f = FBY[r.id], adj = Math.round(r.finalAdj + r.rivalAdj);
        const cls = 'gp-row' + (i === 0 && !r.unavailable ? ' gp-row--top' : '') + (r.unavailable ? ' gp-row--off' : '');
        return (
          <button key={r.id} data-fid={r.id} role="listitem" type="button" className={cls}
            onClick={() => onPick(r.id, i + 1)} aria-label={f.name + ', puesto ' + (i + 1)}>
            <div className="gf-rank__pos">{i + 1}</div>
            <PlanetToken type={f.planet} size="md" />
            <div className="gp-row__name">
              <div className="gf-rank__name">{f.name}</div>
              <div className="gf-rank__why">{reasonFor(r, baseOrder[r.id], state.players, factionName)}</div>
            </div>
            <div className="gp-row__delta">
              {r.unavailable
                ? <Badge tone="neutral">No</Badge>
                : adj !== 0 ? <Badge tone={adj > 0 ? 'success' : 'danger'} icon={adj > 0 ? 'plus' : 'minus'}>{Math.abs(adj)}</Badge> : null}
            </div>
            <Meter value={Math.round(r.score)} label={'Puntaje ' + f.name} />
          </button>
        );
      })}
    </div>
  );
}
