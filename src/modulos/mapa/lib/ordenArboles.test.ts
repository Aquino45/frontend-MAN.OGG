import { describe, expect, it } from 'vitest'
import { arbolesSector1Mock } from '@/mocks'
import { hayDestacados, ordenarDestacadosPrimero } from './ordenArboles'

const ARBOLES = arbolesSector1Mock.features
const codigos = (lista: typeof ARBOLES) => lista.map((arbol) => arbol.properties.codigo)

describe('ordenarDestacadosPrimero', () => {
  it('pone los destacados primero y respeta el orden original dentro de cada grupo', () => {
    expect(codigos(ordenarDestacadosPrimero(ARBOLES))).toEqual([
      'S01-A012',
      'S01-A001',
      'S01-A002',
      'S01-A015',
    ])
  })

  it('con varios destacados mantiene su orden relativo', () => {
    const marcados = ARBOLES.map((arbol, indice) => ({
      ...arbol,
      properties: { ...arbol.properties, destacado: indice === 1 || indice === 3 },
    }))
    expect(codigos(ordenarDestacadosPrimero(marcados))).toEqual([
      'S01-A002',
      'S01-A015',
      'S01-A001',
      'S01-A012',
    ])
  })

  it('no modifica la lista original', () => {
    const antes = codigos(ARBOLES)
    ordenarDestacadosPrimero(ARBOLES)
    expect(codigos(ARBOLES)).toEqual(antes)
  })
})

describe('hayDestacados', () => {
  it('es verdadero solo si algún árbol es destacado', () => {
    expect(hayDestacados(ARBOLES)).toBe(true)
    expect(hayDestacados(ARBOLES.filter((arbol) => !arbol.properties.destacado))).toBe(false)
    expect(hayDestacados([])).toBe(false)
  })
})
