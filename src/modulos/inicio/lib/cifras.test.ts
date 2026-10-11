import { describe, expect, it } from 'vitest'
import type { ArbolFeature } from '@/api/cliente'
import { arbolesSector1Mock, sectoresMock } from '@/mocks'
import { calcularCifras, conteoPorSector } from './cifras'

// Árbol mínimo con la forma del contrato; solo cambian los campos que importan a cada caso.
function arbol(
  codigo: string,
  propiedades: { demo: boolean; sector?: number; nombre_cientifico?: string | null },
): ArbolFeature {
  return {
    type: 'Feature',
    id: codigo,
    geometry: null,
    properties: {
      codigo,
      sector: propiedades.sector ?? 1,
      nombre_comun: null,
      nombre_cientifico: propiedades.nombre_cientifico ?? null,
      estado_general: null,
      foto_miniatura_url: null,
      demo: propiedades.demo,
    },
  }
}

describe('calcularCifras', () => {
  it('con listas vacías todo da cero', () => {
    expect(calcularCifras([], [])).toEqual({
      arbolesDeCampo: 0,
      sectores: 0,
      especiesIdentificadas: 0,
      arbolesDeEjemplo: 0,
    })
  })

  it('separa los árboles de campo de los de ejemplo', () => {
    const arboles = [
      arbol('A1', { demo: false }),
      arbol('A2', { demo: false }),
      arbol('A3', { demo: true }),
    ]
    const cifras = calcularCifras([], arboles)
    expect(cifras.arbolesDeCampo).toBe(2)
    expect(cifras.arbolesDeEjemplo).toBe(1)
  })

  it('cuenta los sectores recibidos', () => {
    expect(calcularCifras(sectoresMock.features, []).sectores).toBe(sectoresMock.features.length)
  })

  it('cuenta cada especie una sola vez aunque se repita', () => {
    const arboles = [
      arbol('A1', { demo: false, nombre_cientifico: 'Schinus molle' }),
      arbol('A2', { demo: false, nombre_cientifico: 'Schinus molle' }),
      arbol('A3', { demo: false, nombre_cientifico: 'Roystonea regia' }),
    ]
    expect(calcularCifras([], arboles).especiesIdentificadas).toBe(2)
  })

  it('no cuenta los nombres nulos, vacíos ni en blanco', () => {
    const arboles = [
      arbol('A1', { demo: false, nombre_cientifico: null }),
      arbol('A2', { demo: false, nombre_cientifico: '' }),
      arbol('A3', { demo: false, nombre_cientifico: '   ' }),
      arbol('A4', { demo: false, nombre_cientifico: 'Schinus' }),
    ]
    expect(calcularCifras([], arboles).especiesIdentificadas).toBe(1)
  })

  it('recorta los espacios para decidir si dos nombres son el mismo', () => {
    const arboles = [
      arbol('A1', { demo: false, nombre_cientifico: 'Schinus molle' }),
      arbol('A2', { demo: false, nombre_cientifico: '  Schinus molle ' }),
    ]
    expect(calcularCifras([], arboles).especiesIdentificadas).toBe(1)
  })

  it('una especie que solo aparece en árboles de ejemplo no cuenta', () => {
    const arboles = [
      arbol('A1', { demo: false, nombre_cientifico: 'Schinus molle' }),
      arbol('A2', { demo: true, nombre_cientifico: 'Prosopis pallida' }),
      arbol('A3', { demo: true, nombre_cientifico: 'Schinus molle' }),
    ]
    const cifras = calcularCifras([], arboles)
    expect(cifras.especiesIdentificadas).toBe(1)
    expect(cifras.arbolesDeEjemplo).toBe(2)
  })

  it('con los árboles del mock del sector 1 coincide con lo que dicen los datos', () => {
    const arboles = arbolesSector1Mock.features
    const noDemo = arboles.filter((feature) => !feature.properties.demo)
    const especies = new Set(
      noDemo
        .map((feature) => feature.properties.nombre_cientifico?.trim())
        .filter((nombre): nombre is string => Boolean(nombre)),
    )
    const cifras = calcularCifras(sectoresMock.features, arboles)
    expect(cifras.arbolesDeCampo).toBe(noDemo.length)
    expect(cifras.arbolesDeEjemplo).toBe(arboles.length - noDemo.length)
    expect(cifras.especiesIdentificadas).toBe(especies.size)
  })
})

describe('conteoPorSector', () => {
  it('sin árboles devuelve un mapa vacío', () => {
    expect(conteoPorSector([]).size).toBe(0)
  })

  it('agrupa por sector separando campo y ejemplo', () => {
    const arboles = [
      arbol('A1', { demo: false, sector: 1 }),
      arbol('A2', { demo: false, sector: 1 }),
      arbol('A3', { demo: true, sector: 1 }),
      arbol('B1', { demo: true, sector: 2 }),
      arbol('B2', { demo: true, sector: 2 }),
    ]
    const conteos = conteoPorSector(arboles)
    expect(conteos.get(1)).toEqual({ deCampo: 2, deEjemplo: 1 })
    expect(conteos.get(2)).toEqual({ deCampo: 0, deEjemplo: 2 })
    expect(conteos.get(3)).toBeUndefined()
  })
})
