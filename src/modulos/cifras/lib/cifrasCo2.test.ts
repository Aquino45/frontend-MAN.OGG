import { describe, expect, it } from 'vitest'
import type { ArbolFeature, ArbolResumen, SectorFeature } from '@/api/cliente'
import {
  CANTIDAD_TOP_ARBOLES_CO2,
  KG_POR_TONELADA,
  PARAMETROS_URL,
  RUTAS,
  SEPARADOR_MILES,
  TEXTOS_CIFRAS,
  UMBRAL_CO2_A_TONELADAS_KG,
} from '@/config/constantes'
import { calcularCifrasCo2, formatearCo2, textoSinDatoCo2 } from './cifrasCo2'

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
      co2_almacenado_kg: null,
      co2_captura_anual_kg: null,
      co2_simulado: false,
      ...cambios,
    },
  } as ArbolFeature
}

const SECTORES = [sector(1), sector(2), sector(3)]
const MAXIMO_ESPECIES = 2

describe('calcularCifrasCo2: sumas por sector', () => {
  const arboles = [
    arbol(1, { co2_almacenado_kg: 100, co2_captura_anual_kg: 10 }),
    arbol(1, { co2_almacenado_kg: 50, co2_captura_anual_kg: 5 }),
    arbol(2, { co2_almacenado_kg: 400, co2_captura_anual_kg: 40, demo: true }),
    arbol(2, { co2_almacenado_kg: 25, co2_captura_anual_kg: 2 }),
  ]
  const cifras = calcularCifrasCo2(SECTORES, arboles, MAXIMO_ESPECIES, CANTIDAD_TOP_ARBOLES_CO2)

  it('suma el almacenado por sector con campo y ejemplo separados', () => {
    expect(cifras.almacenadoPorSector.map((fila) => [fila.etiqueta, fila.valor])).toEqual([
      ['Sector 1', { campo: 150, ejemplo: 0 }],
      ['Sector 2', { campo: 25, ejemplo: 400 }],
      ['Sector 3', { campo: 0, ejemplo: 0 }],
    ])
  })

  it('suma la captura anual por sector con campo y ejemplo separados', () => {
    expect(cifras.capturaPorSector.map((fila) => [fila.etiqueta, fila.valor])).toEqual([
      ['Sector 1', { campo: 15, ejemplo: 0 }],
      ['Sector 2', { campo: 2, ejemplo: 40 }],
      ['Sector 3', { campo: 0, ejemplo: 0 }],
    ])
  })
})

describe('calcularCifrasCo2: árboles sin dato', () => {
  const arboles = [
    arbol(1, { co2_almacenado_kg: 100, co2_captura_anual_kg: null }),
    arbol(1, { co2_almacenado_kg: null, co2_captura_anual_kg: null }),
    arbol(2, { co2_almacenado_kg: null, co2_captura_anual_kg: 3 }),
  ]
  const cifras = calcularCifrasCo2(SECTORES, arboles, MAXIMO_ESPECIES, CANTIDAD_TOP_ARBOLES_CO2)

  it('los null no suman y se cuentan aparte por magnitud', () => {
    expect(cifras.sinDatoAlmacenado).toBe(2)
    expect(cifras.sinDatoCaptura).toBe(2)
    expect(cifras.almacenadoPorSector[0].valor).toEqual({ campo: 100, ejemplo: 0 })
    expect(cifras.capturaPorSector[1].valor).toEqual({ campo: 3, ejemplo: 0 })
  })

  it('un árbol sin almacenado no entra al ranking', () => {
    expect(cifras.top).toHaveLength(1)
    expect(cifras.top[0].co2_almacenado_kg).toBe(100)
  })

  it('el texto del conteo usa singular y plural', () => {
    expect(textoSinDatoCo2(1)).toBe(TEXTOS_CIFRAS.co2.sinDatoUno)
    expect(textoSinDatoCo2(2)).toBe(TEXTOS_CIFRAS.co2.sinDato.replace('{n}', '2'))
    expect(textoSinDatoCo2(0)).toBeNull()
  })
})

describe('calcularCifrasCo2: especies', () => {
  const arboles = [
    arbol(1, { nombre_cientifico: 'Alfa', co2_almacenado_kg: 500 }),
    arbol(1, { nombre_cientifico: 'Alfa', co2_almacenado_kg: 100, demo: true }),
    arbol(1, { nombre_cientifico: 'Beta', co2_almacenado_kg: 300 }),
    arbol(1, { nombre_cientifico: 'Gamma', co2_almacenado_kg: 50 }),
    arbol(1, { nombre_cientifico: 'Delta', co2_almacenado_kg: 20, demo: true }),
    arbol(1, { nombre_cientifico: null, co2_almacenado_kg: 10 }),
    arbol(1, { nombre_cientifico: 'Epsilon', co2_almacenado_kg: null }),
  ]
  const cifras = calcularCifrasCo2(SECTORES, arboles, MAXIMO_ESPECIES, CANTIDAD_TOP_ARBOLES_CO2)

  it('deja las N con más CO₂, agrupa el resto en «Otras» y no mezcla campo con ejemplo', () => {
    expect(cifras.almacenadoPorEspecie.map((fila) => [fila.etiqueta, fila.valor])).toEqual([
      ['Alfa', { campo: 500, ejemplo: 100 }],
      ['Beta', { campo: 300, ejemplo: 0 }],
      [TEXTOS_CIFRAS.otras, { campo: 50, ejemplo: 20 }],
      [TEXTOS_CIFRAS.sinEspecie, { campo: 10, ejemplo: 0 }],
    ])
  })

  it('una especie sin ningún valor de CO₂ no genera renglón', () => {
    expect(cifras.almacenadoPorEspecie.some((fila) => fila.etiqueta === 'Epsilon')).toBe(false)
  })
})

describe('calcularCifrasCo2: top de árboles', () => {
  const arboles = Array.from({ length: CANTIDAD_TOP_ARBOLES_CO2 + 3 }, (_, indice) =>
    arbol(indice % 2 === 0 ? 1 : 2, {
      co2_almacenado_kg: (indice + 1) * 10,
      nombre_cientifico: `Especie ${indice}`,
      demo: indice === CANTIDAD_TOP_ARBOLES_CO2 + 2,
    }),
  )
  const cifras = calcularCifrasCo2(SECTORES, arboles, MAXIMO_ESPECIES, CANTIDAD_TOP_ARBOLES_CO2)

  it('trae solo los N con más CO₂, de mayor a menor, mezclando campo y ejemplo', () => {
    expect(cifras.top).toHaveLength(CANTIDAD_TOP_ARBOLES_CO2)
    const valores = cifras.top.map((fila) => fila.co2_almacenado_kg)
    expect(valores).toEqual([...valores].sort((a, b) => b - a))
    expect(cifras.top[0].co2_almacenado_kg).toBe((CANTIDAD_TOP_ARBOLES_CO2 + 3) * 10)
    expect(cifras.top[0].demo).toBe(true)
    expect(cifras.top[1].demo).toBe(false)
  })

  it('cada fila trae código, especie, sector y el enlace a su cartilla', () => {
    const fila = cifras.top[1]
    const origen = arboles.find(({ properties }) => properties.codigo === fila.codigo)
    expect(fila.especie).toBe(origen?.properties.nombre_cientifico)
    expect(fila.sector).toBe(`Sector ${origen?.properties.sector}`)
    expect(fila.enlace).toBe(
      `${RUTAS.mapa}?${PARAMETROS_URL.sector}=${origen?.properties.sector}&${PARAMETROS_URL.arbol}=${fila.codigo}`,
    )
  })

  it('a igual valor desempata por código, así el orden no depende de la llegada', () => {
    const iguales = [
      arbol(1, { co2_almacenado_kg: 5, codigo: 'S01-A900' }),
      arbol(1, { co2_almacenado_kg: 5, codigo: 'S01-A100' }),
    ]
    const resultado = calcularCifrasCo2(SECTORES, iguales, MAXIMO_ESPECIES, 2)
    expect(resultado.top.map((fila) => fila.codigo)).toEqual(['S01-A100', 'S01-A900'])
  })
})

describe('calcularCifrasCo2: hayCo2Simulado', () => {
  it('sale de los datos: verdadero si algún valor graficado es simulado', () => {
    const conSimulado = [arbol(1, { co2_almacenado_kg: 10, co2_simulado: true })]
    expect(calcularCifrasCo2(SECTORES, conSimulado, 2, 10).hayCo2Simulado).toBe(true)
  })

  it('falso con datos reales', () => {
    const reales = [arbol(1, { co2_almacenado_kg: 10, co2_captura_anual_kg: 1 })]
    expect(calcularCifrasCo2(SECTORES, reales, 2, 10).hayCo2Simulado).toBe(false)
  })

  it('un simulado sin valores de CO₂ no se grafica y no cuenta', () => {
    const sinValores = [arbol(1, { co2_simulado: true })]
    expect(calcularCifrasCo2(SECTORES, sinValores, 2, 10).hayCo2Simulado).toBe(false)
  })

  it('sin árboles no hay nada simulado ni sin dato', () => {
    const vacias = calcularCifrasCo2(SECTORES, [], 2, 10)
    expect(vacias.hayCo2Simulado).toBe(false)
    expect(vacias.top).toEqual([])
    expect(vacias.sinDatoAlmacenado).toBe(0)
  })
})

describe('formatearCo2', () => {
  it('por debajo del umbral va en kg, con separador de miles', () => {
    expect(formatearCo2(UMBRAL_CO2_A_TONELADAS_KG - 1, 'almacenado')).toBe(
      `9${SEPARADOR_MILES}999 kg CO₂e`,
    )
    expect(formatearCo2(0, 'almacenado')).toBe('0 kg CO₂e')
  })

  it('desde el umbral va en toneladas', () => {
    const toneladas = (UMBRAL_CO2_A_TONELADAS_KG / KG_POR_TONELADA).toFixed(1)
    expect(formatearCo2(UMBRAL_CO2_A_TONELADAS_KG, 'almacenado')).toBe(`${toneladas} t CO₂e`)
    expect(formatearCo2(1_234_567, 'almacenado')).toBe(`1${SEPARADOR_MILES}234.6 t CO₂e`)
  })

  it('la captura anual lleva su unidad por año', () => {
    expect(formatearCo2(1503.7, 'captura')).toBe(`1${SEPARADOR_MILES}503.7 kg/año`)
    expect(formatearCo2(25_000, 'captura')).toBe('25.0 t/año')
  })
})
