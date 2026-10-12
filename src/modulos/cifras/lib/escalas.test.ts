import { describe, expect, it } from 'vitest'
import { escalaLineal, intensidad, marcasRedondas, radioPorArea } from './escalas'

describe('escalaLineal', () => {
  it('lleva el dominio al rango, también al revés', () => {
    expect(escalaLineal(0, 10, 0, 100)(5)).toBe(50)
    expect(escalaLineal(0, 14, 300, 20)(0)).toBe(300)
    expect(escalaLineal(0, 14, 300, 20)(14)).toBe(20)
  })

  it('un dominio de ancho cero no divide por cero', () => {
    expect(escalaLineal(3, 3, 10, 20)(3)).toBe(10)
  })
})

describe('marcasRedondas', () => {
  it('da marcas con pasos de 1, 2 o 5 por una potencia de 10', () => {
    expect(marcasRedondas(65, 4)).toEqual({ tope: 80, marcas: [0, 20, 40, 60, 80] })
    expect(marcasRedondas(14, 7)).toEqual({ tope: 14, marcas: [0, 2, 4, 6, 8, 10, 12, 14] })
    expect(marcasRedondas(450, 5).marcas).toEqual([0, 100, 200, 300, 400, 500])
  })

  it('con marcas enteras el paso no baja de 1: no hay medio árbol', () => {
    expect(marcasRedondas(2, 5, true)).toEqual({ tope: 2, marcas: [0, 1, 2] })
    expect(marcasRedondas(2, 5).marcas.some((marca) => !Number.isInteger(marca))).toBe(true)
    expect(marcasRedondas(0, 5, true)).toEqual({ tope: 1, marcas: [0, 1] })
  })

  it('con un máximo de cero el eje igual existe', () => {
    expect(marcasRedondas(0, 4)).toEqual({ tope: 1, marcas: [0, 1] })
  })

  it('el tope siempre cubre el máximo', () => {
    for (const maximo of [1, 3, 7, 12, 99, 101, 1234]) {
      expect(marcasRedondas(maximo, 5).tope).toBeGreaterThanOrEqual(maximo)
    }
  })
})

describe('radioPorArea', () => {
  it('el área crece con el valor: un cuarto del valor, la mitad del radio sobre el mínimo', () => {
    expect(radioPorArea(100, 100, 0, 10)).toBe(10)
    expect(radioPorArea(25, 100, 0, 10)).toBe(5)
  })

  it('sin dato o en cero, el radio mínimo', () => {
    expect(radioPorArea(null, 100, 3, 12)).toBe(3)
    expect(radioPorArea(0, 100, 3, 12)).toBe(3)
    expect(radioPorArea(5, 0, 3, 12)).toBe(3)
  })
})

describe('intensidad', () => {
  it('va de 0 a 1 y se recorta', () => {
    expect(intensidad(50, 100)).toBe(0.5)
    expect(intensidad(500, 100)).toBe(1)
    expect(intensidad(null, 100)).toBe(0)
    expect(intensidad(5, 0)).toBe(0)
  })
})
