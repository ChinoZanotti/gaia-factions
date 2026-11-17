import { Icon } from '../design-system';

// Aviso de muestra chica (ver sampleNote en data.js). El elemento existe siempre para que la región viva
// anuncie cuando aparece; vacío queda fuera del flujo (gp-sr-only) y no suma espacio.
export default function SampleNote({ note }) {
  return (
    <p role="status" className={note ? 'gp-sample' : 'gp-sr-only'}>
      {note && (
        <>
          <Icon name="info" />
          <span>{'Hay pocas partidas registradas para esta combinación (de ' + note.min + ' a ' + note.max + ' por facción, o menos): tomá el orden como orientativo.'}</span>
        </>
      )}
    </p>
  );
}
