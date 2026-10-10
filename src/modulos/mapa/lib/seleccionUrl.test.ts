import { describe, expect, it } from 'vitest'
import { PARAMETROS_URL } from '@/config/constantes'
import { escribirSeleccion, leerSeleccion, SIN_SELECCION } from './seleccionUrl'

describe('seleccionUrl', () => {
  it('lee el sector y el árbol de la URL', () => {
    expect(leerSeleccion('?sector=1&arbol=S01-A012')).toEqual({
      sectorId: 1,
      arbolCodigo: 'S01-A012',
    })
  })

  it('ignora un sector que no es un entero positivo y un árbol vacío', () => {
    expect(leerSeleccion('?sector=abc&arbol=')).toEqual(SIN_SELECCION)
    expect(leerSeleccion('?sector=0')).toEqual(SIN_SELECCION)
    expect(leerSeleccion('?sector=-3')).toEqual(SIN_SELECCION)
    expect(leerSeleccion('')).toEqual(SIN_SELECCION)
  })

  it('escribe con los nombres de las constantes y es la inversa de leer', () => {
    const texto = escribirSeleccion({ sectorId: 2, arbolCodigo: 'S02-D001' })
    expect(texto).toBe(`?${PARAMETROS_URL.sector}=2&${PARAMETROS_URL.arbol}=S02-D001`)
    expect(leerSeleccion(texto)).toEqual({ sectorId: 2, arbolCodigo: 'S02-D001' })
  })

  it('no escribe nada si no hay selección', () => {
    expect(escribirSeleccion(SIN_SELECCION)).toBe('')
    expect(escribirSeleccion({ sectorId: 3, arbolCodigo: null })).toBe('?sector=3')
  })
})
