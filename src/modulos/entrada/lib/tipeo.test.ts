import { describe, expect, it } from 'vitest'
import { SONIDO_ENTRADA_ALTERNA as S } from '@/config/constantes'
import { pausaTrasCaracter, suenaCaracter } from './tipeo'

describe('suenaCaracter', () => {
  it('suenan las letras (con tilde y eñe) y los números', () => {
    for (const caracter of ['B', 'u', 'á', 'Í', 'ñ', 'Ñ', '7']) {
      expect(suenaCaracter(caracter)).toBe(true)
    }
  })

  it('no suenan los espacios ni los signos', () => {
    for (const caracter of [' ', '*', ',', '.', '?', '¿', '!', '¡', '-', '«', '\n']) {
      expect(suenaCaracter(caracter)).toBe(false)
    }
  })

  it('un caracter ausente no suena', () => {
    expect(suenaCaracter(undefined)).toBe(false)
  })
})

describe('pausaTrasCaracter', () => {
  it('la coma agrega su pausa y el punto o el cierre de pregunta, la suya, más larga', () => {
    expect(pausaTrasCaracter(',')).toBe(S.tipeo.pausaComaMs)
    expect(pausaTrasCaracter('.')).toBe(S.tipeo.pausaFinMs)
    expect(pausaTrasCaracter('?')).toBe(S.tipeo.pausaFinMs)
    expect(S.tipeo.pausaFinMs).toBeGreaterThan(S.tipeo.pausaComaMs)
  })

  it('con cualquier otro caracter no agrega nada', () => {
    for (const caracter of ['a', ' ', '¿', '*', undefined]) {
      expect(pausaTrasCaracter(caracter)).toBe(0)
    }
  })
})
