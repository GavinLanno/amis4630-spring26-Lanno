import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const backendProxyTarget = process.env.VITE_PROXY_TARGET ?? 'https://localhost:7000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: backendProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
