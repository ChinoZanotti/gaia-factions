import { Icon } from '../design-system';

// Etiqueta liviana sobre la lista del ranking: que es en vivo, que las filas se tocan y, si hay ajustes, qué es el +N/−N.
export default function LiveHint({ step, showLegend }) {
  return (
    <>
      <div className="gp-hint">
        <Icon name="trophy" />
        <span>{step < 3 ? 'Ranking en vivo: tocá una facción para ver su detalle.' : 'Mejor a peor para esta partida'}</span>
      </div>
      {showLegend && <p className="gp-note gp-legend">+N / −N: ajuste por puntuaciones finales y rivales.</p>}
    </>
  );
}
