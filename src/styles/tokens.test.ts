import { describe, expect, it } from 'vitest'
import { ATRIBUTO_TEMA, TEMAS } from '@/config/constantes'
import tokensCss from './tokens.css?raw'

// Selectores de atributo que aparecen en tokens.css, por ejemplo [data-tema='claro']
const PATRON_SELECTOR_ATRIBUTO = /\[([a-z-]+)=['"]?([a-z-]+)['"]?\]/g
const PATRON_BLOQUE_CLARO = new RegExp(
  String.raw`:root\[${ATRIBUTO_TEMA}=['"]?${TEMAS.claro}['"]?\]\s*\{([^}]*)\}`,
)

const TOKENS_DEL_MAPA = [
  '--mapa-relleno-reposo',
  '--mapa-relleno-resaltado',
  '--mapa-borde',
  '--mapa-opacidad-atenuada',
  '--mapa-elevacion',
]

function propiedadesDe(bloque: string): string[] {
  return [...bloque.matchAll(/(^|;|\{)\s*(--?[a-z-]+)\s*:/g)].map((coincidencia) => coincidencia[2])
}

const ALIAS_DE_LA_CARTILLA = [
  '--color-tarjeta',
  '--color-texto-tenue',
  '--color-texto-suave',
  '--color-pista',
  '--color-co2-fondo',
  '--color-co2-texto',
  '--color-co2-acento',
]

const TOKENS_DE_LA_CARTILLA = [
  '--fuente-display',
  '--fuente-pixel',
  '--superficie-tarjeta',
  '--texto-tenue',
  '--texto-suave',
  '--panel-ancho',
  '--hoja-alto-lista',
  '--hoja-alto-cartilla',
  '--foto-proporcion',
  '--estado-bueno-fondo',
  '--estado-bueno-texto',
  '--estado-regular-fondo',
  '--estado-regular-texto',
  '--estado-malo-fondo',
  '--estado-malo-texto',
  '--estado-otro-fondo',
  '--estado-otro-texto',
]

describe('tokens.css', () => {
  it('los selectores de tema usan el atributo y los valores de las constantes', () => {
    const selectores = [...tokensCss.matchAll(PATRON_SELECTOR_ATRIBUTO)]
    expect(selectores.length).toBeGreaterThan(0)
    const valoresDeTema: string[] = Object.values(TEMAS)
    for (const [, atributo, valor] of selectores) {
      expect(atributo).toBe(ATRIBUTO_TEMA)
      expect(valoresDeTema).toContain(valor)
    }
  })

  it('el tema claro redefine solo alias semánticos (--color-*)', () => {
    const bloqueClaro = tokensCss.match(PATRON_BLOQUE_CLARO)?.[1]
    expect(bloqueClaro).toBeDefined()
    const propiedades = propiedadesDe(bloqueClaro ?? '').filter(
      (nombre) => nombre !== 'color-scheme',
    )
    expect(propiedades.length).toBeGreaterThan(0)
    for (const nombre of propiedades) expect(nombre).toMatch(/^--color-/)
  })

  it('define los tokens del mapa', () => {
    for (const token of TOKENS_DEL_MAPA) expect(tokensCss).toContain(`${token}:`)
  })

  it('define los tokens de la cartilla, las fuentes y los 3 estados', () => {
    for (const token of TOKENS_DE_LA_CARTILLA) expect(tokensCss).toContain(`${token}:`)
    expect(tokensCss).toContain("'Bricolage Grotesque'")
    expect(tokensCss).toContain("'Silkscreen'")
  })

  it('los alias de la cartilla existen en el oscuro y el claro los redefine', () => {
    const bloqueClaro = tokensCss.match(PATRON_BLOQUE_CLARO)?.[1] ?? ''
    for (const alias of ALIAS_DE_LA_CARTILLA) {
      expect(tokensCss).toContain(`${alias}:`)
      expect(bloqueClaro).toContain(`${alias}:`)
    }
  })

  it('el relleno resaltado del mapa es magenta oscuro, no el carmín', () => {
    expect(tokensCss).toMatch(/--mapa-relleno-resaltado:\s*var\(--copa-magenta-oscuro\)/)
  })
})
