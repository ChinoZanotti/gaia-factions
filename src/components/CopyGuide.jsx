import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from '../design-system';
import { copyText } from '../lib/clipboard.js';
import { buildGuideText } from '../lib/guideText.js';

const COPIED_MS = 2000; // cuánto dice "Copiado" el botón
const ANNOUNCE_MS = 3000; // cuánto dura el aviso para lectores de pantalla

// Botón "Copiar aperturas y consejos" del detalle (propuesta de Molly, aprobada por el dueño).
// Fuera de las pestañas: copia Aperturas + Consejos sin importar cuál esté a la vista.
export default function CopyGuide({ name, guide }) {
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [failed, setFailed] = useState(false);
  const timers = useRef([]);
  const buttonWrap = useRef(null);
  const textRef = useRef(null);
  const text = buildGuideText(name, guide);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  async function onCopy() {
    clearTimers();
    if (!(await copyText(text))) { setCopied(false); setFailed(true); return; }
    setCopied(true);
    setAnnounce('Copiado: aperturas y consejos de ' + name + '.');
    timers.current.push(setTimeout(() => setCopied(false), COPIED_MS), setTimeout(() => setAnnounce(''), ANNOUNCE_MS));
  }

  function closeFallback() {
    setFailed(false);
    buttonWrap.current?.querySelector('button')?.focus();
  }

  // Al abrir el respaldo: foco en el texto, ya seleccionado para copiar a mano.
  useEffect(() => { if (failed) { textRef.current?.focus(); textRef.current?.select(); } }, [failed]);

  return (
    <>
      <div ref={buttonWrap} className="gp-copy">
        <Button variant="secondary" block icon={copied ? 'check' : undefined} onClick={onCopy}>
          {copied ? 'Copiado' : 'Copiar aperturas y consejos'}
        </Button>
      </div>
      <p className="gp-sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</p>
      {failed && (
        <Modal title="No pudimos copiar" footer={<div className="gp-copy"><Button variant="secondary" onClick={closeFallback}>Cerrar</Button></div>}>
          <div onKeyDown={(e) => { if (e.key === 'Escape') closeFallback(); }}>
            <p className="gp-p" style={{ marginTop: 0 }}>Tu navegador no nos dejó copiar. Seleccioná el texto y copialo a mano.</p>
            <div className="gp-copy__box">
              <textarea ref={textRef} className="gp-copy__text" readOnly value={text} aria-label={'Aperturas y consejos de ' + name} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
