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
})
