import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Icon, Meter, PlanetToken } from '../design-system';
import useFlip from '../hooks/useFlip.js';
import { baseRankOrder, reasonFor, rowAdjust, rowLabel, tiesOf, topSummary } from '../lib/reasons.js';
import { FBY, factionName } from '../lookups.js';

// Espera antes de anunciar un cambio, para no leer cada toque cuando se marcan varios datos seguidos.
const ANNOUNCE_DELAY = 600;

// Anuncia el nuevo top 3 a lectores de pantalla cuando cambia (no al montar).
function useTopAnnouncement(list) {
  const summary = topSummary(list, factionName);
  const [message, setMessage] = useState('');
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    const t = setTimeout(() => setMessage(summary), ANNOUNCE_DELAY);
    return () => clearTimeout(t);
  }, [summary]);
  return message;
}

export default function Ranking({ list, state, onPick }) {
  const ref = useRef(null);
  const baseOrder = useMemo(() => baseRankOrder(state.players, state.auction, state.level), [state.players, state.auction, state.level]);
  const ties = useMemo(() => tiesOf(list), [list]);
  useFlip(ref, list.map((r) => r.id).join());
  const announcement = useTopAnnouncement(list);
  return (
    <>
      {/* role="list" explícito: Safari/VoiceOver quita la semántica de lista cuando hay list-style: none. */}
      <div className="gp-rank-frame gf-chamfer">
      <ol className="gp-rank-wrap gf-chamfer" role="list" aria-label="Ranking de facciones" ref={ref}>
        {list.map((r, i) => {
          const f = FBY[r.id], adj = rowAdjust(r), pos = i + 1;
          const reason = reasonFor(r, baseOrder[r.id], state.players, factionName, ties[r.id]);
          const cls = 'gp-row' + (i === 0 && !r.unavailable ? ' gp-row--top' : '') + (r.unavailable ? ' gp-row--off' : '');
          return (
            <li key={r.id}>
              <button data-fid={r.id} type="button" className={cls}
                onClick={() => onPick(r.id, pos)} aria-label={rowLabel(r, pos, f.name, reason)}>
                <div className="gf-rank__pos">{pos}</div>
                <PlanetToken type={f.planet} size="md" />
                <div className="gp-row__name">
                  <div className="gf-rank__name">{f.name}</div>
                  <div className="gf-rank__why">{reason}</div>
                </div>
                <div className="gp-row__delta">
                  {r.unavailable
                    ? <Badge tone="neutral">No</Badge>
                    : adj !== 0 ? <Badge tone={adj > 0 ? 'success' : 'danger'} icon={adj > 0 ? 'plus' : 'minus'}>{Math.abs(adj)}</Badge> : null}
                </div>
                <Meter value={Math.round(r.score)} label={'Puntaje ' + f.name} />
                <Icon name="chevron-right" className="gp-row__chev" />
              </button>
            </li>
          );
        })}
      </ol>
      </div>
      <p className="gp-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </>
  );
}
