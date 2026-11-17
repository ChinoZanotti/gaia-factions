// Texto plano de la guía de una facción (Aperturas + Consejos, sin siglas ni encaje), para copiar al portapapeles.
// Formato definido por el dueño. Saltos de línea \n para que se pegue igual en cualquier destino.
export function buildGuideText(name, guide) {
  const openings = guide.openings.map((o) => o.name + '\n' + o.tag + '\n' + o.text).join('\n\n');
  const tips = guide.tips.map((t) => '- ' + t).join('\n');
  return name + '\n---\n\n' + guide.style + '\n\n' + openings + '\n\nConsejos:\n' + tips + '\n\nQué evitar:\n- ' + guide.avoid;
}
