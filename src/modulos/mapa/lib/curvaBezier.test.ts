import { describe, expect, it } from 'vitest'
import { crearCurvaBezier } from './curvaBezier'

describe('crearCurvaBezier', () => {
  it('empieza en 0 y termina en 1', () => {
    const curva = crearCurvaBezier([0.77, 0, 0.175, 1])
    expect(curva(0)).toBe(0)
    expect(curva(1)).toBe(1)
    expect(curva(-0.5)).toBe(0)
    expect(curva(2)).toBe(1)
  })

  it('la lineal devuelve el mismo avance', () => {
    const lineal = crearCurvaBezier([0, 0, 1, 1])
    for (const avance of [0.1, 0.25, 0.5, 0.9]) expect(lineal(avance)).toBeCloseTo(avance, 4)
  })

  it('ease-in-out: lenta al principio y al final, y pasa por el centro en 0.5', () => {
    const curva = crearCurvaBezier([0.77, 0, 0.175, 1])
    expect(curva(0.1)).toBeLessThan(0.1)
    expect(curva(0.9)).toBeGreaterThan(0.9)
    expect(curva(0.5)).toBeGreaterThan(0.4)
    expect(curva(0.5)).toBeLessThan(0.75)
  })

  it('nunca retrocede', () => {
    const curva = crearCurvaBezier([0.77, 0, 0.175, 1])
    let anterior = 0
    for (let paso = 1; paso <= 100; paso++) {
      const valor = curva(paso / 100)
      expect(valor).toBeGreaterThanOrEqual(anterior - 1e-9)
      anterior = valor
    }
  })
})
