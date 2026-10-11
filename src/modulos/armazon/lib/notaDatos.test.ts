import { describe, expect, it } from 'vitest'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { clasificarSectores, armarNotaDatos } from './notaDatos'

function sector(id: number): SectorFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Polygon', coordinates: [] },
    properties: { id, nombre: `Sector ${id}`, color: null, provisional: false, total_arboles: 0 },
  } as SectorFeature
}

function arbol(sectorId: number, demo: boolean, indice = 1): ArbolFeature {
  return {
    type: 'Feature',
    id: `S0${sectorId}-A00${indice}`,
    geometry: null,
    properties: {
      codigo: `S0${sectorId}-A00${indice}`,
      uid: `uid-${sectorId}-${indice}-${demo}`,
      sector: sectorId,
      nombre_comun: null,
      nombre_cientifico: null,
      estado_general: null,
      foto_miniatura_url: null,
      demo,
      destacado: false,
      motivo_destacado: null,
    },
  } as ArbolFeature
}

const SECTORES = [1, 2, 3, 4, 5].map(sector)

describe('clasificarSectores', () => {
  it('separa los sectores con árboles de campo de los que no los tienen', () => {
    const clasificados = clasificarSectores(SECTORES, [arbol(1, false), arbol(2, true)])
    expect(clasificados.conCampo.map((s) => s.properties.nombre)).toEqual(['Sector 1'])
    expect(clasificados.sinCampo.map((s) => s.properties.nombre)).toEqual([
      'Sector 2',
      'Sector 3',
      'Sector 4',
      'Sector 5',
    ])
  })

  it('un sector con campo y ejemplo cuenta como de campo', () => {
    const clasificados = clasificarSectores(SECTORES, [arbol(3, true, 1), arbol(3, false, 2)])
    expect(clasificados.conCampo.map((s) => s.id)).toEqual([3])
  })

  it('ordena por id aunque la API los entregue desordenados', () => {
    const clasificados = clasificarSectores([sector(3), sector(1)], [arbol(3, false)])
    expect(clasificados.sinCampo.map((s) => s.id)).toEqual([1])
  })
})

describe('armarNotaDatos', () => {
  it('solo el sector 1 con campo: singular para campo y plural para ejemplo', () => {
    const nota = armarNotaDatos(clasificarSectores(SECTORES, [arbol(1, false), arbol(2, true)]))
    expect(nota).toBe(
      'Sector 1 tiene datos de campo. Sector 2, Sector 3, Sector 4 y Sector 5 solo tienen datos de ejemplo.',
    )
  })

  it('todos de ejemplo: lo dice sin nombrar sectores', () => {
    const nota = armarNotaDatos(clasificarSectores(SECTORES, [arbol(1, true), arbol(2, true)]))
    expect(nota).toBe('Por ahora todos los sectores tienen solo datos de ejemplo.')
  })

  it('todos con campo', () => {
    const arboles = SECTORES.map((s) => arbol(s.properties.id, false))
    expect(armarNotaDatos(clasificarSectores(SECTORES, arboles))).toBe(
      'Todos los sectores tienen datos de campo.',
    )
  })

  it('mezcla: dos con campo y uno sin él, con «y» y concordancia', () => {
    const tres = SECTORES.slice(0, 3)
    const nota = armarNotaDatos(clasificarSectores(tres, [arbol(1, false), arbol(3, false)]))
    expect(nota).toBe(
      'Sector 1 y Sector 3 tienen datos de campo. Sector 2 solo tiene datos de ejemplo.',
    )
  })

  it('sin sectores no afirma nada', () => {
    expect(armarNotaDatos(clasificarSectores([], []))).toBeNull()
  })
})
