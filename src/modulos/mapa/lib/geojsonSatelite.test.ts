import { describe, expect, it } from 'vitest'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import {
  coleccionArboles,
  coleccionSectores,
  limitesDeSector,
  limitesDeSectores,
  posicionEtiqueta,
  urlTeselasConClave,
} from './geojsonSatelite'

function sector(id: number, anillo: [number, number][]): SectorFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Polygon', coordinates: [anillo] },
    properties: {
      id,
      nombre: `Sector ${id}`,
      color: null,
      provisional: id === 2,
      total_arboles: 3,
    },
  }
}

const SECTOR_UNO = sector(1, [
  [-76.9, -11.9],
  [-76.8, -11.9],
  [-76.8, -11.8],
  [-76.9, -11.8],
  [-76.9, -11.9],
])
const SECTOR_DOS = sector(2, [
  [-76.8, -11.95],
  [-76.7, -11.95],
  [-76.7, -11.85],
  [-76.8, -11.85],
  [-76.8, -11.95],
])

function arbol(codigo: string, coordenadas: [number, number] | null, demo = false): ArbolFeature {
  return {
    type: 'Feature',
    id: codigo,
    geometry: coordenadas ? { type: 'Point', coordinates: coordenadas } : null,
    properties: {
      codigo,
      uid: `uid-${codigo}`,
      sector: 1,
      nombre_comun: null,
      nombre_cientifico: null,
      origen: null,
      altura_total_m: null,
      dap_cm: null,
      estado_general: null,
      foto_miniatura_url: null,
      co2_almacenado_kg: null,
      co2_captura_anual_kg: null,
      co2_simulado: false,
      demo,
      destacado: codigo === 'S01-A001',
      motivo_destacado: null,
    },
  }
}

describe('limitesDeSectores', () => {
  it('abarca los polígonos de todos los sectores', () => {
    expect(limitesDeSectores([SECTOR_UNO, SECTOR_DOS])).toEqual([
      [-76.9, -11.95],
      [-76.7, -11.8],
    ])
  })

  it('devuelve null si no hay sectores', () => {
    expect(limitesDeSectores([])).toBeNull()
  })
})

describe('limitesDeSector', () => {
  it('abarca solo el sector pedido', () => {
    expect(limitesDeSector([SECTOR_UNO, SECTOR_DOS], 2)).toEqual([
      [-76.8, -11.95],
      [-76.7, -11.85],
    ])
  })

  it('devuelve null si el sector no existe', () => {
    expect(limitesDeSector([SECTOR_UNO], 9)).toBeNull()
  })
})

describe('posicionEtiqueta', () => {
  it('cae dentro del sector, como la etiqueta del mapa ilustrado', () => {
    const [longitud, latitud] = posicionEtiqueta(SECTOR_UNO)
    expect(longitud).toBeCloseTo(-76.85, 5)
    expect(latitud).toBeCloseTo(-11.85, 5)
  })

  it('en un sector cóncavo sigue cayendo dentro del polígono', () => {
    const sectorEnL = sector(3, [
      [0, 0],
      [10, 0],
      [10, 2],
      [2, 2],
      [2, 10],
      [0, 10],
      [0, 0],
    ])
    const [longitud, latitud] = posicionEtiqueta(sectorEnL)
    const dentroDelBrazoHorizontal = longitud >= 0 && longitud <= 10 && latitud >= 0 && latitud <= 2
    const dentroDelBrazoVertical = longitud >= 0 && longitud <= 2 && latitud >= 0 && latitud <= 10
    expect(dentroDelBrazoHorizontal || dentroDelBrazoVertical).toBe(true)
  })
})

describe('coleccionSectores', () => {
  it('marca el sector activo y conserva la geometría del contrato', () => {
    const coleccion = coleccionSectores([SECTOR_UNO, SECTOR_DOS], 2)
    expect(coleccion.features).toHaveLength(2)
    expect(coleccion.features[0].geometry).toEqual(SECTOR_UNO.geometry)
    expect(coleccion.features.map((f) => f.properties?.activo)).toEqual([false, true])
    expect(coleccion.features[1].properties?.provisional).toBe(true)
  })

  it('no marca ninguno sin sector activo', () => {
    const coleccion = coleccionSectores([SECTOR_UNO], null)
    expect(coleccion.features[0].properties?.activo).toBe(false)
  })
})

describe('coleccionArboles', () => {
  it('deja fuera los árboles sin posición y copia sus marcas', () => {
    const coleccion = coleccionArboles([
      arbol('S01-A001', [-76.85, -11.85]),
      arbol('S01-A002', null),
      arbol('S01-A003', [-76.86, -11.86], true),
    ])
    expect(coleccion.features.map((f) => f.properties?.codigo)).toEqual(['S01-A001', 'S01-A003'])
    expect(coleccion.features[0].properties).toMatchObject({ destacado: true, demo: false })
    expect(coleccion.features[1].properties).toMatchObject({ destacado: false, demo: true })
  })
})

describe('urlTeselasConClave', () => {
  it('agrega la clave como parámetro', () => {
    expect(urlTeselasConClave('https://teselas.test/{z}/{y}/{x}', 'abc')).toBe(
      'https://teselas.test/{z}/{y}/{x}?token=abc',
    )
  })

  it('respeta los parámetros que ya trae y escapa la clave', () => {
    expect(urlTeselasConClave('https://teselas.test/{z}/{y}/{x}?f=png', 'a b&c')).toBe(
      'https://teselas.test/{z}/{y}/{x}?f=png&token=a%20b%26c',
    )
  })
})
