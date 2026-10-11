import { describe, expect, it } from 'vitest'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { elegirDestacados } from './destacados'

function arbol(codigo: string, sectorId: number, destacado: boolean): ArbolFeature {
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
      destacado,
      motivo_destacado: destacado ? 'motivo' : null,
    },
  } as ArbolFeature
}

function sector(id: number): SectorFeature {
  return {
    type: 'Feature',
    id,
    geometry: { type: 'Polygon', coordinates: [] },
    properties: { id, nombre: `Sector ${id}`, color: null, provisional: false, total_arboles: 0 },
  } as SectorFeature
}

describe('elegirDestacados', () => {
  const sectores = [sector(1), sector(2)]

  it('deja solo los destacados', () => {
    const resultado = elegirDestacados(
      [arbol('S01-A001', 1, false), arbol('S01-A002', 1, true)],
      sectores,
      6,
    )
    expect(resultado.map((d) => d.arbol.codigo)).toEqual(['S01-A002'])
  })

  it('los ordena por sector y luego por código, sin depender del orden de llegada', () => {
    const resultado = elegirDestacados(
      [arbol('S02-A001', 2, true), arbol('S01-A010', 1, true), arbol('S01-A002', 1, true)],
      sectores,
      6,
    )
    expect(resultado.map((d) => d.arbol.codigo)).toEqual(['S01-A002', 'S01-A010', 'S02-A001'])
  })

  it('respeta el máximo', () => {
    const arboles = [1, 2, 3, 4].map((n) => arbol(`S01-A00${n}`, 1, true))
    expect(elegirDestacados(arboles, sectores, 2)).toHaveLength(2)
  })

  it('trae el nombre del sector de la API, o null si el sector no está', () => {
    const resultado = elegirDestacados(
      [arbol('S01-A001', 1, true), arbol('S09-A001', 9, true)],
      sectores,
      6,
    )
    expect(resultado.map((d) => d.nombreSector)).toEqual(['Sector 1', null])
  })

  it('sin destacados devuelve una lista vacía', () => {
    expect(elegirDestacados([arbol('S01-A001', 1, false)], sectores, 6)).toEqual([])
  })
})
