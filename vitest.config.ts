import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true, // 原生支持 tsconfig.json 的 paths
    alias: {
      '@/lib': path.resolve(__dirname, './src/utils/lib'),
      '@/hooks': path.resolve(__dirname, './src/utils/client/hooks'),
      '@': path.resolve(__dirname, './src'),
      '@plugins': path.resolve(__dirname, './plugins'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'forks',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
