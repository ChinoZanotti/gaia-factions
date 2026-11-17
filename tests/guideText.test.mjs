// Texto para copiar del detalle de facción (src/lib/guideText.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE, IDS } from '../src/data/data.js';
import { buildGuideText } from '../src/lib/guideText.js';

// Ejemplo aprobado por el dueño, tal cual.
// Escrito como líneas unidas con "\n": un texto multilínea dentro del archivo pasaría a "\r\n" con autocrlf en Windows.
const ITARS = [
  "Itars",
  "---",
  "",
  "Dos grandes opciones: AC o PI. Ambas son sus mejores salidas.",
  "",
  "AC (3 conocimiento)",
  "Ligeramente mejor",
  "Tienen la mejor AC del juego. Suma Economía o Ciencia y gaiaformás cuando saques el PI.",
  "",
  "PI + paso en Gaia",
  "Sinergia",
  "Quemás las fichas de Gaia para losetas de tecnología en la fase Gaia siguiente.",
  "",
  "RL + 5M",
  "Aceptable",
  "Es la única variante de RL que rinde parecido.",
  "",
  "Consejos:",
  "- PI inmediato: más seguridad por competencia en Gaia, pero menos pistas (~3 vs 5).",
  "- Satélites: equilibrá las fichas entre tecnología y satélites.",
  "- Con PI temprano compensá en otros lados.",
  "",
  "Qué evitar:",
  "- RL de apertura salvo RL + 5M.",
].join('\n');

test('Itars: idéntico al formato aprobado', () => {
  assert.equal(buildGuideText('Itars', GUIDE.itars), ITARS);
});

test('las 14 facciones: todas las aperturas y consejos, sin siglas ni encaje, solo \\n', () => {
  for (const id of IDS) {
    const g = GUIDE[id], t = buildGuideText(id, g);
    for (const o of g.openings) for (const part of [o.name, o.tag, o.text]) assert.ok(t.includes(part), `${id}: falta "${part}"`);
    for (const tip of g.tips) assert.ok(t.includes('- ' + tip), `${id}: falta consejo`);
    assert.ok(t.endsWith('Qué evitar:\n- ' + g.avoid), id);
    assert.ok(!/Siglas|Instituto Planetario|Encaje/.test(t), `${id}: no debe incluir siglas ni encaje`);
    assert.ok(!t.includes('\r'), `${id}: solo \\n`);
  }
});
