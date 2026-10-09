/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// ALIAS @/ → src/ (el mismo de tsconfig.app.json)
const ALIAS_SRC = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

// PUERTO DE DESARROLLO POR DEFECTO SI PUERTO_DEV NO ESTÁ DEFINIDO (VER .env.example)
const PUERTO_DEV_POR_DEFECTO = 5173

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const puertoDev = Number(env.PUERTO_DEV) || PUERTO_DEV_POR_DEFECTO

  return {
    plugins: [react()],
    resolve: { alias: ALIAS_SRC },
    server: { port: puertoDev },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: false,
      // Los tests de tokens leen tokens.css como texto (?raw); sin esto Vitest lo vacía.
      css: { include: [/tokens\.css/] },
    },
  }
})
