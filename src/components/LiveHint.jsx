import { Icon } from '../design-system';

// Etiqueta liviana sobre la lista del ranking.
export default function LiveHint({ step }) {
  return (
    <div className="gp-hint">
      <Icon name="trophy" />
      <span>{step < 3 ? 'Ranking en vivo — se reordena con cada dato' : 'Mejor a peor para esta partida'}</span>
    </div>
  );
}
