/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// PUERTO DE DESARROLLO POR DEFECTO SI PUERTO_DEV NO ESTÁ DEFINIDO (VER .env.example)
const PUERTO_DEV_POR_DEFECTO = 5173

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const puertoDev = Number(env.PUERTO_DEV) || PUERTO_DEV_POR_DEFECTO

  return {
    plugins: [react()],
    server: { port: puertoDev },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: false,
    },
  }
})
