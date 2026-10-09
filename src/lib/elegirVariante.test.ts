import { describe, expect, it } from 'vitest'
import { elegirVariante } from './elegirVariante'

const PESOS = { a: 1, b: 2, c: 1 }

describe('elegirVariante', () => {
  it('con 0 devuelve la primera clave', () => {
    expect(elegirVariante(PESOS, 0)).toBe('a')
  })

  it('con un aleatorio casi 1 devuelve la última clave', () => {
    expect(elegirVariante(PESOS, 0.9999999999)).toBe('c')
  })

  it('respeta los bordes entre claves según el peso', () => {
    // total 4: a ocupa [0, 0.25), b [0.25, 0.75) y c [0.75, 1)
    expect(elegirVariante(PESOS, 0.2499)).toBe('a')
    expect(elegirVariante(PESOS, 0.25)).toBe('b')
    expect(elegirVariante(PESOS, 0.7499)).toBe('b')
    expect(elegirVariante(PESOS, 0.75)).toBe('c')
  })

  it('reparte en proporción al peso sobre una grilla uniforme', () => {
    const conteo: Record<string, number> = { a: 0, b: 0, c: 0 }
    const pasos = 1000
    for (let paso = 0; paso < pasos; paso++) conteo[elegirVariante(PESOS, paso / pasos)]++
    expect(conteo).toEqual({ a: 250, b: 500, c: 250 })
  })

  it('lanza error si no hay pesos', () => {
    expect(() => elegirVariante({}, 0.5)).toThrow(/no hay pesos/)
  })

  it('lanza error si algún peso no es positivo', () => {
    expect(() => elegirVariante({ a: 1, b: 0 }, 0.5)).toThrow(/«b»/)
    expect(() => elegirVariante({ a: -1 }, 0.5)).toThrow(/positivo/)
    expect(() => elegirVariante({ a: Number.NaN }, 0.5)).toThrow(/positivo/)
  })

  it('lanza error si el aleatorio está fuera de [0, 1)', () => {
    expect(() => elegirVariante(PESOS, 1)).toThrow(/\[0, 1\)/)
    expect(() => elegirVariante(PESOS, -0.1)).toThrow(/\[0, 1\)/)
  })
})
