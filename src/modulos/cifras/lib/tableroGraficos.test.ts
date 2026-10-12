import { describe, expect, it } from 'vitest'
import { arbolDePrueba, sectorDePrueba } from './fabricasDePrueba'
import { calcularDispersion, calcularHistogramaDap, estadoPorSector } from './tableroGraficos'

const ARBOLES = [
  arbolDePrueba('S01-A001', {
    nombre_cientifico: 'Schinus',
    estado_general: 'Regular',
    dap_cm: 392,
    altura_total_m: 12,
    co2_almacenado_kg: 1000,
  }),
  arbolDePrueba('S01-A002', {
    nombre_cientifico: 'Roystonea',
    estado_general: 'Bueno',
    dap_cm: 75,
  }),
  arbolDePrueba('S02-D001', {
    demo: true,
    nombre_cientifico: 'Roystonea',
    estado_general: 'Bueno',
    dap_cm: 70,
    altura_total_m: 4,
    co2_almacenado_kg: 50,
  }),
  arbolDePrueba('S02-D002', {
    demo: true,
    nombre_cientifico: 'Roystonea',
    estado_general: 'Estado raro',
    dap_cm: 110,
    altura_total_m: 5,
  }),
  arbolDePrueba('S02-D003', { demo: true, nombre_cientifico: 'Ficus' }),
]
const TODOS = new Set(ARBOLES.map((a) => a.properties.codigo))
const SECTORES = [sectorDePrueba(1), sectorDePrueba(2), sectorDePrueba(3)]

describe('estadoPorSector', () => {
  const filas = estadoPorSector(ARBOLES, SECTORES)

  it('una fila por sector, también el que no tiene árboles', () => {
    expect(filas.map((f) => [f.etiqueta, f.total])).toEqual([
      ['Sector 1', 2],
      ['Sector 2', 3],
      ['Sector 3', 0],
    ])
    expect(filas[2].segmentos).toEqual([])
  })

  it('los segmentos van en el orden del catálogo y el resto al final, campo y ejemplo aparte', () => {
    expect(filas[0].segmentos.map((s) => [s.estado, s.estilo, s.ejemplo, s.cantidad])).toEqual([
      ['Bueno', 'bueno', false, 1],
      ['Regular', 'regular', false, 1],
    ])
    expect(filas[1].segmentos.map((s) => [s.estado, s.estilo, s.ejemplo])).toEqual([
      ['Bueno', 'bueno', true],
      ['Estado raro', 'otro', true],
      ['Sin dato', 'otro', true],
    ])
  })

  it('las cantidades de cada fila suman su total', () => {
    for (const fila of filas) {
      expect(fila.segmentos.reduce((suma, s) => suma + s.cantidad, 0)).toBe(fila.total)
    }
  })
})

describe('calcularDispersion', () => {
  it('solo dibuja los árboles con DAP y altura y cuenta los visibles que faltan', () => {
    const { puntos, sinMedidas } = calcularDispersion(ARBOLES, TODOS, 4)
    expect(puntos.map((p) => p.codigo).sort()).toEqual(['S01-A001', 'S02-D001', 'S02-D002'])
    expect(sinMedidas).toBe(2)
  })

  it('los de más CO₂ van primero, para que los chicos queden encima', () => {
    const { puntos } = calcularDispersion(ARBOLES, TODOS, 4)
    expect(puntos.map((p) => p.codigo)).toEqual(['S01-A001', 'S02-D001', 'S02-D002'])
  })

  it('al filtrar, los puntos se quedan y se marcan como no visibles; los ejes no se mueven', () => {
    const completo = calcularDispersion(ARBOLES, TODOS, 4)
    const filtrado = calcularDispersion(ARBOLES, new Set(['S02-D001']), 4)
    expect(filtrado.puntos).toHaveLength(completo.puntos.length)
    expect(filtrado.puntos.filter((p) => p.visible).map((p) => p.codigo)).toEqual(['S02-D001'])
    expect(filtrado.dominio).toEqual(completo.dominio)
    expect(completo.dominio).toEqual({ dapMaximo: 392, alturaMaxima: 12, co2Maximo: 1000 })
    expect(filtrado.sinMedidas).toBe(0)
  })

  it('el color sale de la posición de la especie, y lo que pasa del tope comparte el último', () => {
    const { puntos } = calcularDispersion(ARBOLES, TODOS, 1)
    expect(puntos.find((p) => p.especie === 'Roystonea')?.serie).toBe(0)
    expect(puntos.find((p) => p.especie === 'Schinus')?.serie).toBe(1)
  })

  it('marca los de ejemplo y trae el enlace a la cartilla', () => {
    const { puntos } = calcularDispersion(ARBOLES, TODOS, 4)
    expect(puntos.find((p) => p.codigo === 'S02-D001')).toMatchObject({
      ejemplo: true,
      enlace: '/mapa?sector=2&arbol=S02-D001',
    })
  })
})

describe('calcularHistogramaDap', () => {
  it('rangos fijos hasta cubrir el mayor DAP y conteos de campo y ejemplo por separado', () => {
    const { rangos, sinDap } = calcularHistogramaDap(ARBOLES, TODOS, 50)
    expect(rangos).toHaveLength(8)
    expect(rangos[1]).toEqual({ desdeCm: 50, hastaCm: 100, campo: 1, ejemplo: 1 })
    expect(rangos[2]).toEqual({ desdeCm: 100, hastaCm: 150, campo: 0, ejemplo: 1 })
    expect(rangos[7]).toMatchObject({ desdeCm: 350, campo: 1 })
    expect(sinDap).toBe(1)
  })

  it('al filtrar los rangos no cambian, solo los conteos', () => {
    const completo = calcularHistogramaDap(ARBOLES, TODOS, 50)
    const filtrado = calcularHistogramaDap(ARBOLES, new Set(['S01-A001']), 50)
    expect(filtrado.rangos.map((r) => r.desdeCm)).toEqual(completo.rangos.map((r) => r.desdeCm))
    expect(filtrado.rangos.reduce((suma, r) => suma + r.campo + r.ejemplo, 0)).toBe(1)
    expect(filtrado.sinDap).toBe(0)
  })

  it('sin árboles hay un solo rango vacío', () => {
    expect(calcularHistogramaDap([], new Set(), 50).rangos).toEqual([
      { desdeCm: 0, hastaCm: 50, campo: 0, ejemplo: 0 },
    ])
  })
})
