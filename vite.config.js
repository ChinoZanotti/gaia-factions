import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { securityMetaPlugin } from './config/csp.js';

export default defineConfig({
  plugins: [react(), securityMetaPlugin()],
  // Rutas relativas: el build funciona servido desde cualquier subcarpeta (p. ej. GitHub Pages).
  base: './',
});
