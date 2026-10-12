import { describe, expect, it } from 'vitest'
import { arbolDePrueba, sectorDePrueba } from './fabricasDePrueba'
import { listarSectores } from './sectores'

describe('listarSectores', () => {
  it('lista los sectores de la API por id, también los que no tienen árboles', () => {
    const filas = listarSectores(
      [sectorDePrueba(3), sectorDePrueba(1)],
      [arbolDePrueba('S01-A001')],
    )
    expect(filas).toEqual([
      { clave: '1', etiqueta: 'Sector 1' },
      { clave: '3', etiqueta: 'Sector 3' },
    ])
  })

  it('agrega al final los sectores que solo aparecen en los árboles', () => {
    const filas = listarSectores(
      [sectorDePrueba(1)],
      [arbolDePrueba('S07-A001'), arbolDePrueba('S05-A001'), arbolDePrueba('S01-A001')],
    )
    expect(filas.map((fila) => fila.clave)).toEqual(['1', '5', '7'])
    expect(filas[1].etiqueta).toContain('5')
  })

  it('sin sectores ni árboles no hay renglones', () => {
    expect(listarSectores([], [])).toEqual([])
  })
})
