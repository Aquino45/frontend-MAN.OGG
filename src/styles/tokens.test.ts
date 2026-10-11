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

  it('define los tokens de la entrada al mapa', () => {
    for (const token of ['--entrada-escala-inicial', '--entrada-ilustracion-lado']) {
      expect(tokensCss).toContain(`${token}:`)
    }
  })

  it('define la escala tipográfica en rem y el display fluido', () => {
    for (const [token, valor] of [
      ['--texto-xs', '0.75rem'],
      ['--texto-sm', '0.875rem'],
      ['--texto-md', '1rem'],
      ['--texto-cuerpo', '1.125rem'],
      ['--texto-lg', '1.4rem'],
      ['--texto-xl', '1.75rem'],
      ['--texto-2xl', '2.25rem'],
    ]) {
      expect(tokensCss).toMatch(new RegExp(`${token}:\\s*${valor.replace('.', '\\.')};`))
    }
    expect(tokensCss).toMatch(/--texto-display:\s*clamp\(2\.75rem, 1\.25rem \+ 7vw, 6rem\)/)
    expect(tokensCss).toMatch(/--tracking-display:\s*-0\.03em/)
    expect(tokensCss).toMatch(/--tracking-etiqueta:\s*0\.08em/)
    expect(tokensCss).toMatch(/--medida-cuerpo:\s*65ch/)
  })

  it('el espaciado base 4 incluye 12 y 32 px', () => {
    expect(tokensCss).toMatch(/--espacio-12:\s*0\.75rem/)
    expect(tokensCss).toMatch(/--espacio-32:\s*2rem/)
  })

  it('los radios tienen nombre por uso: chip 4, control 8, tarjeta 16', () => {
    expect(tokensCss).toMatch(/--radio-chip:\s*0\.25rem/)
    expect(tokensCss).toMatch(/--radio-control:\s*0\.5rem/)
    expect(tokensCss).toMatch(/--radio-tarjeta:\s*1rem/)
  })

  it('hay una sola sombra para lo que flota', () => {
    expect(tokensCss).toMatch(/--sombra-flotante:\s*0 -8px 24px var\(--color-sombra\)/)
  })

  it('las duraciones y curvas nuevas siguen la guía', () => {
    for (const [token, valor] of [
      ['--duracion-presion', '120ms'],
      ['--duracion-hover', '160ms'],
      ['--duracion-entrada', '200ms'],
      ['--duracion-hoja', '240ms'],
      ['--duracion-zoom', '320ms'],
      ['--duracion-salida', '150ms'],
    ]) {
      expect(tokensCss).toMatch(new RegExp(`${token}:\\s*${valor};`))
    }
    expect(tokensCss).toMatch(/--curva-movimiento:\s*cubic-bezier\(0\.77, 0, 0\.175, 1\)/)
    expect(tokensCss).toMatch(/--curva-hoja:\s*cubic-bezier\(0\.32, 0\.72, 0, 1\)/)
    expect(tokensCss).toMatch(/--curva-salida:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\)/)
  })

  it('la hoja inferior mide 85dvh y el escalonado es de 40 ms', () => {
    expect(tokensCss).toMatch(/--alto-hoja:\s*85dvh/)
    expect(tokensCss).toMatch(/--retraso-escalonado:\s*40ms/)
  })

  it('el «Sin dato» del bloque de CO₂ toma el color del texto del bloque', () => {
    expect(tokensCss).toMatch(/--color-co2-texto:/)
  })

  it('las superficies del navegador salen de tokens', () => {
    for (const token of ['--seleccion-fondo', '--seleccion-texto', '--scrollbar-pulgar']) {
      expect(tokensCss).toContain(`${token}:`)
    }
  })

  it('el relleno resaltado del mapa es magenta oscuro, no el carmín', () => {
    expect(tokensCss).toMatch(/--mapa-relleno-resaltado:\s*var\(--copa-magenta-oscuro\)/)
  })
})
