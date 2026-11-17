// Navegación con teclado (src/lib/keyNav.js). node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIndex } from '../src/lib/keyNav.js';

test('flechas: siguiente y anterior', () => {
  assert.equal(nextIndex('ArrowRight', 0, 3), 1);
  assert.equal(nextIndex('ArrowDown', 1, 3), 2);
  assert.equal(nextIndex('ArrowLeft', 2, 3), 1);
  assert.equal(nextIndex('ArrowUp', 1, 3), 0);
});
test('flechas dan la vuelta en los extremos', () => {
  assert.equal(nextIndex('ArrowRight', 2, 3), 0);
  assert.equal(nextIndex('ArrowLeft', 0, 3), 2);
});
test('Inicio y Fin', () => {
  assert.equal(nextIndex('Home', 2, 3), 0);
  assert.equal(nextIndex('End', 0, 3), 2);
});
test('otras teclas o índices inválidos → null', () => {
  assert.equal(nextIndex('Enter', 0, 3), null);
  assert.equal(nextIndex('a', 0, 3), null);
  assert.equal(nextIndex('ArrowRight', -1, 3), null);
  assert.equal(nextIndex('ArrowRight', 3, 3), null);
  assert.equal(nextIndex('ArrowRight', 0, 0), null);
});
