import { describe, expect, it } from 'vitest'
import type { ArbolFeature, ArbolResumen, SectorFeature } from '@/api/cliente'
import { TEXTOS_CARTILLA, TEXTOS_CIFRAS } from '@/config/constantes'
import { calcularCifrasCenso, type FilaConteo } from './cifrasCenso'

function sector(id: number): SectorFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Polygon', coordinates: [] },
    properties: { id, nombre: `Sector ${id}`, color: null, provisional: false, total_arboles: 0 },
  } as SectorFeature
}

let contador = 0
function arbol(sectorId: number, cambios: Partial<ArbolResumen> = {}): ArbolFeature {
  contador += 1
  const codigo = `S0${sectorId}-A${String(contador).padStart(3, '0')}`
  return {
    type: 'Feature',
    id: codigo,
    geometry: null,
    properties: {
      codigo,
      uid: `uid-${codigo}`,
      sector: sectorId,
      nombre_comun: null,
      nombre_cientifico: null,
      estado_general: null,
      foto_miniatura_url: null,
      demo: false,
      destacado: false,
      motivo_destacado: null,
      ...cambios,
    },
  } as ArbolFeature
}

const SECTORES = [sector(1), sector(2), sector(3)]
const CON_NOMBRE = (nombre: string, cambios: Partial<ArbolResumen> = {}) => ({
  nombre_cientifico: nombre,
  ...cambios,
})
const fila = (filas: FilaConteo[], etiqueta: string) => filas.find((f) => f.etiqueta === etiqueta)

describe('calcularCifrasCenso: campo y ejemplo siempre separados', () => {
  const arboles = [
    arbol(1),
    arbol(1),
    arbol(1, { demo: true }),
    arbol(2, { demo: true }),
    arbol(2, { demo: true, destacado: true }),
  ]
  const cifras = calcularCifrasCenso(SECTORES, arboles, 5)

  it('el resumen separa campo de ejemplo', () => {
    expect(cifras.total).toEqual({ campo: 2, ejemplo: 3 })
  })

  it('por sector: un renglón por sector de la API (también los vacíos) con campo y ejemplo aparte', () => {
    expect(cifras.porSector.map((f) => [f.etiqueta, f.conteo.campo, f.conteo.ejemplo])).toEqual([
      ['Sector 1', 2, 1],
      ['Sector 2', 0, 2],
      ['Sector 3', 0, 0],
    ])
  })

  it('destacados por sector: solo cuenta los destacados, también separados', () => {
    expect(
      cifras.destacadosPorSector.map((f) => [f.etiqueta, f.conteo.campo, f.conteo.ejemplo]),
    ).toEqual([
      ['Sector 1', 0, 0],
      ['Sector 2', 0, 1],
      ['Sector 3', 0, 0],
    ])
  })

  it('un árbol de un sector que la API no lista no se pierde: lleva su número', () => {
    const resultado = calcularCifrasCenso(SECTORES, [arbol(9)], 5)
    expect(resultado.porSector.at(-1)?.etiqueta).toBe(
      TEXTOS_CIFRAS.sectorSinNombre.replace('{id}', '9'),
    )
  })

  it('no trae ninguna medida ni CO₂: solo conteos', () => {
    const claves = JSON.stringify(Object.keys(cifras)).toLowerCase()
    expect(claves).not.toContain('co2')
    expect(claves).not.toContain('altura')
  })
})

describe('calcularCifrasCenso: por estado general', () => {
  it('sale de los datos, con «Sin dato» para los null, ordenado por cantidad y luego por nombre', () => {
    const arboles = [
      arbol(1, { estado_general: 'Regular' }),
      arbol(1, { estado_general: 'Bueno' }),
      arbol(1, { estado_general: 'Bueno', demo: true }),
      arbol(1),
      arbol(1, { estado_general: 'Alfa' }),
    ]
    const { porEstado } = calcularCifrasCenso(SECTORES, arboles, 5)
    expect(porEstado.map((f) => f.etiqueta)).toEqual([
      'Bueno',
      'Alfa',
      'Regular',
      TEXTOS_CARTILLA.sinDato,
    ])
    expect(fila(porEstado, 'Bueno')?.conteo).toEqual({ campo: 1, ejemplo: 1 })
  })
})

describe('calcularCifrasCenso: por especie', () => {
  const nombres = [
    'Molle',
    'Molle',
    'Molle',
    'Palma',
    'Palma',
    'Huarango',
    'Ficus',
    'Acacia',
    'Cedro',
  ]
  const arboles = [
    ...nombres.map((n) => arbol(1, CON_NOMBRE(n))),
    arbol(1, CON_NOMBRE('Molle', { demo: true })),
    arbol(1),
    arbol(2, CON_NOMBRE('   ')),
  ]

  it('las N más frecuentes, luego «Otras» y «Sin especie identificada», cada una con campo y ejemplo', () => {
    const { porEspecie } = calcularCifrasCenso(SECTORES, arboles, 3)
    expect(porEspecie.map((f) => f.etiqueta)).toEqual([
      'Molle',
      'Palma',
      'Acacia',
      TEXTOS_CIFRAS.otras,
      TEXTOS_CIFRAS.sinEspecie,
    ])
    expect(fila(porEspecie, 'Molle')?.conteo).toEqual({ campo: 3, ejemplo: 1 })
    // Huarango, Ficus y Cedro empatan con uno: sobran 3 especies de 1 árbol
    expect(fila(porEspecie, TEXTOS_CIFRAS.otras)?.conteo).toEqual({ campo: 3, ejemplo: 0 })
    expect(fila(porEspecie, TEXTOS_CIFRAS.sinEspecie)?.conteo).toEqual({ campo: 2, ejemplo: 0 })
  })

  it('el desempate es por nombre: el resultado no depende del orden de llegada', () => {
    const uno = calcularCifrasCenso(SECTORES, arboles, 3).porEspecie.map((f) => f.etiqueta)
    const otro = calcularCifrasCenso(SECTORES, [...arboles].reverse(), 3).porEspecie.map(
      (f) => f.etiqueta,
    )
    expect(otro).toEqual(uno)
  })

  it('si caben todas no hay «Otras», y sin árboles sin especie no hay ese renglón', () => {
    const { porEspecie } = calcularCifrasCenso(SECTORES, [arbol(1, CON_NOMBRE('Molle'))], 5)
    expect(porEspecie.map((f) => f.etiqueta)).toEqual(['Molle'])
  })

  it('lo repartido suma exactamente los árboles (nada se pierde ni se inventa)', () => {
    const { porEspecie, total } = calcularCifrasCenso(SECTORES, arboles, 3)
    const campo = porEspecie.reduce((suma, f) => suma + f.conteo.campo, 0)
    const ejemplo = porEspecie.reduce((suma, f) => suma + f.conteo.ejemplo, 0)
    expect({ campo, ejemplo }).toEqual(total)
  })
})

describe('calcularCifrasCenso: listas vacías', () => {
  it('sin árboles todo queda en cero y sin renglones inventados', () => {
    const cifras = calcularCifrasCenso(SECTORES, [], 5)
    expect(cifras.total).toEqual({ campo: 0, ejemplo: 0 })
    expect(cifras.porEstado).toEqual([])
    expect(cifras.porEspecie).toEqual([])
    expect(cifras.porSector).toHaveLength(SECTORES.length)
  })

  it('sin sectores ni árboles no hay nada', () => {
    const cifras = calcularCifrasCenso([], [], 5)
    expect(cifras.porSector).toEqual([])
    expect(cifras.destacadosPorSector).toEqual([])
  })
})
