// Falla si hay colores literales (#rgb, #rrggbb, rgb(, hsl() en src/ fuera de tokens.css.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const RAIZ_SRC = resolve('src')
const ARCHIVO_PERMITIDO = join(RAIZ_SRC, 'styles', 'tokens.css')
const PATRON_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g

function* listarArchivos(directorio) {
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    const ruta = join(directorio, entrada.name)
    if (entrada.isDirectory()) yield* listarArchivos(ruta)
    else yield ruta
  }
}

const infracciones = []
for (const ruta of listarArchivos(RAIZ_SRC)) {
  if (ruta === ARCHIVO_PERMITIDO) continue
  readFileSync(ruta, 'utf8')
    .split(/\r?\n/)
    .forEach((linea, indice) => {
      if (PATRON_COLOR.test(linea)) {
        infracciones.push(
          `${relative(process.cwd(), ruta).split(sep).join('/')}:${indice + 1}: ${linea.trim()}`,
        )
      }
      PATRON_COLOR.lastIndex = 0
    })
}

if (infracciones.length > 0) {
  console.error('Colores literales fuera de src/styles/tokens.css:')
  infracciones.forEach((infraccion) => console.error(`  ${infraccion}`))
  process.exit(1)
}
console.log('verificar:colores OK')
