/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { NOMBRE_PRODUCTO } from './src/config/constantes'

// ALIAS @/ → src/ (el mismo de tsconfig.app.json)
const ALIAS_SRC = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

// PUERTO DE DESARROLLO POR DEFECTO SI PUERTO_DEV NO ESTÁ DEFINIDO (VER .env.example)
const PUERTO_DEV_POR_DEFECTO = 5173

// EL <title> DE index.html SALE DE NOMBRE_PRODUCTO, PARA QUE EL NOMBRE NO QUEDE ESCRITO DOS VECES
const MARCA_NOMBRE_PRODUCTO = '%NOMBRE_PRODUCTO%'
const ponerNombreDelProducto = {
  name: 'nombre-del-producto',
  transformIndexHtml: (html: string) => html.replace(MARCA_NOMBRE_PRODUCTO, NOMBRE_PRODUCTO),
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const puertoDev = Number(env.PUERTO_DEV) || PUERTO_DEV_POR_DEFECTO

  return {
    plugins: [react(), ponerNombreDelProducto],
    resolve: { alias: ALIAS_SRC },
    server: { port: puertoDev },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: false,
      // Los tests de tokens y de estilos leen el CSS como texto (?raw); sin esto Vitest lo vacía.
      css: { include: [/tokens\.css/, /estilos\.css/] },
    },
  }
})
