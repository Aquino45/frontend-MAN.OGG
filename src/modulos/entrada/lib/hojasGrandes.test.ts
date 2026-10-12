import { describe, expect, it } from 'vitest'
import { ENTRADA_ALTERNA as E } from '@/config/constantes'
import { factoresDeTamano } from './hojasGrandes'

describe('factoresDeTamano', () => {
  it('la primera es del tamaño base', () => {
    expect(factoresDeTamano(1, () => 0.5)).toEqual([1])
    expect(factoresDeTamano(0, () => 0.5)).toEqual([])
  })

  it('cada una cambia exactamente un paso del 10 % respecto de la anterior', () => {
    const azar = [0.9, 0.1, 0.9, 0.9]
    let i = 0
    const factores = factoresDeTamano(5, () => azar[i++])
    expect(factores).toEqual([1, 1.1, 1, 1.1, 1.2])
  })

  it('nunca se pasa de ±30 % del tamaño base, ni subiendo ni bajando', () => {
    expect(factoresDeTamano(10, () => 0.9).every((f) => f <= 1.3)).toBe(true)
    expect(factoresDeTamano(10, () => 0.9).at(-1)).toBe(1.3)
    expect(factoresDeTamano(10, () => 0).every((f) => f >= 0.7)).toBe(true)
    expect(factoresDeTamano(10, () => 0).at(-1)).toBe(0.7)
  })

  it('con cualquier azar los cambios son de 0 o de un paso, sin error de coma flotante', () => {
    let semilla = 7
    const azar = () => {
      semilla = (semilla * 16807) % 2147483647
      return semilla / 2147483647
    }
    const factores = factoresDeTamano(200, azar)
    factores.forEach((factor, i) => {
      expect(Number.isInteger(Math.round(factor * 100))).toBe(true)
      if (i > 0) {
        const cambio = Math.round(Math.abs(factor - factores[i - 1]) * 100)
        expect([0, E.hojaGrandePaso * 100]).toContain(cambio)
      }
    })
  })
})
