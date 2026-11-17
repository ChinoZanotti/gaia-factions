// Copia texto al portapapeles. Devuelve true si pudo.
// 1) API moderna (requiere contexto seguro: HTTPS o localhost). 2) Respaldo con un textarea oculto y execCommand
// (obsoleto, pero funciona en contextos no seguros). Si los dos fallan, quien llama muestra el texto para copiar a mano.
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // sigue con el respaldo
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}
