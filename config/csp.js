// Content-Security-Policy y Referrer-Policy por <meta>, solo en el build (GitHub Pages no permite cabeceras HTTP).
// En dev no se aplica: Vite inyecta <style> inline y usa un websocket para recargar.
//
// Por qué cada origen:
// - script-src/style-src 'self': el build no tiene scripts ni estilos inline (los style={} de React van por CSSOM).
// - fonts.googleapis.com / fonts.gstatic.com: Google Fonts (se pueden quitar si se autoalojan las fuentes, tareas.md #11).
// - img-src 'self': favicon e íconos propios; los SVG del sistema de diseño son inline y sin URLs externas.
// Limitaciones del <meta>: no admite frame-ancestors, report-uri ni sandbox.
export const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ');

const CHARSET = '<meta charset="utf-8">';

// Inserta las metas justo después del charset, antes de cualquier recurso.
export function injectSecurityMeta(html) {
  if (!html.includes(CHARSET)) throw new Error('index.html debe tener ' + CHARSET + ' para insertar la CSP');
  return html.replace(CHARSET, CHARSET + '\n<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n<meta name="referrer" content="no-referrer">');
}

export function securityMetaPlugin() {
  return { name: 'gaia-security-meta', apply: 'build', transformIndexHtml: { order: 'pre', handler: injectSecurityMeta } };
}
