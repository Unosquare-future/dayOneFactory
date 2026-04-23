import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
//
// `base` lets Vite emit asset paths that work when the app is served
// from a sub-path on GitHub Pages (https://unosquare-future.github.io/dayOneFactory/).
// Can be overridden at build time via `VITE_BASE=/ npm run build` for
// local previews or root-domain deploys.
const BASE = process.env.VITE_BASE ?? '/dayOneFactory/';

export default defineConfig({
  base: BASE,
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
