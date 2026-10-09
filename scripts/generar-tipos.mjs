// Genera src/api/schema.d.ts desde el contrato OpenAPI del back (ruta en CONTRATO_RUTA).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import { format, resolveConfig } from 'prettier'

const ARCHIVO_ENV = '.env'
const VARIABLE_RUTA = 'CONTRATO_RUTA'
const ARCHIVO_SALIDA = resolve('src', 'api', 'schema.d.ts')
const CABECERA =
  '// Archivo generado con `npm run contrato:tipos` desde el contrato del back. No se edita a mano.\n\n'

function fallar(mensaje) {
  console.error(`contrato:tipos: ${mensaje}`)
  process.exit(1)
}

if (!process.env[VARIABLE_RUTA] && existsSync(ARCHIVO_ENV)) process.loadEnvFile(ARCHIVO_ENV)

const rutaContrato = process.env[VARIABLE_RUTA]?.trim()
if (!rutaContrato) {
  fallar(`falta ${VARIABLE_RUTA}. Defínela en .env (ver .env.example) con la ruta a openapi.yaml.`)
}

const rutaAbsoluta = resolve(rutaContrato)
if (!existsSync(rutaAbsoluta)) {
  fallar(`no existe el contrato en ${rutaAbsoluta} (${VARIABLE_RUTA}=${rutaContrato}).`)
}

const ast = await openapiTS(pathToFileURL(rutaAbsoluta))
mkdirSync(dirname(ARCHIVO_SALIDA), { recursive: true })
const configPrettier = await resolveConfig(ARCHIVO_SALIDA)
const tipos = await format(CABECERA + astToString(ast), {
  ...configPrettier,
  filepath: ARCHIVO_SALIDA,
})
writeFileSync(ARCHIVO_SALIDA, tipos)
console.log(`contrato:tipos OK → ${ARCHIVO_SALIDA}`)
