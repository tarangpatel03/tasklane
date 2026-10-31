import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    // The shared package is CommonJS, so Vite must pre-bundle it to expose named imports.
    optimizeDeps: { include: ['@task-app/shared'] },
    build: { commonjsOptions: { include: [/node_modules/, /packages[\\/]shared/] } },
    server: {
      port: 5173,
      proxy: { '/api': { target, changeOrigin: true } },
    },
  };
});
