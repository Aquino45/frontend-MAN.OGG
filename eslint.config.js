import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import { readdirSync } from 'node:fs'

// ---------- Fronteras entre módulos (docs/ARQUITECTURA.md § 4) ----------
// Los módulos se leen de src/modulos/: un módulo nuevo entra solo a la regla.
const CARPETA_MODULOS = 'src/modulos'
const CAPAS_SIN_MODULOS = ['compartido', 'lib', 'api', 'config']
const MODULOS = readdirSync(CARPETA_MODULOS, { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => entrada.name)

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Import que entra a la carpeta interna de un módulo, por alias (@/modulos/x/…) o por ruta.
const entradaInterna = (modulo) => ({
  regex: `(^|/)modulos/${escaparRegex(modulo)}/.+`,
  message: `Desde fuera del módulo «${modulo}» solo se importa su index.ts (@/modulos/${modulo}).`,
})

// Import relativo desde un módulo hermano (../../x/…).
const entradaInternaRelativa = (modulo) => ({
  regex: `^(\\.\\./)+${escaparRegex(modulo)}/.+`,
  message: `Desde otro módulo, «${modulo}» se importa solo por su index.ts (@/modulos/${modulo}).`,
})

const reglaImports = (patrones) => ({ 'no-restricted-imports': ['error', { patterns: patrones }] })

const fronteras = [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [`${CARPETA_MODULOS}/**`],
    rules: reglaImports(MODULOS.map(entradaInterna)),
  },
  ...MODULOS.map((modulo) => {
    const otros = MODULOS.filter((otro) => otro !== modulo)
    return {
      files: [`${CARPETA_MODULOS}/${modulo}/**/*.{ts,tsx}`],
      rules: reglaImports([...otros.map(entradaInterna), ...otros.map(entradaInternaRelativa)]),
    }
  }),
  {
    files: CAPAS_SIN_MODULOS.map((capa) => `src/${capa}/**/*.{ts,tsx}`),
    rules: reglaImports([
      {
        regex: '(^|/)modulos(/|$)',
        message: 'compartido/, lib/, api/ y config/ no importan de modulos/.',
      },
    ]),
  },
]

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    extends: [js.configs.recommended, prettier],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
  },
  ...fronteras,
])
