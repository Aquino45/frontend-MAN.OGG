import { describe, expect, it } from 'vitest'
import { ESCALA_COPA_MAX_M } from '@/config/constantes'
import { COPA_RADIO_ANILLO, formaDeCopa } from './copa'

describe('formaDeCopa', () => {
  it('sin ningún diámetro no hay dibujo', () => {
    expect(formaDeCopa(null, null)).toEqual({ tipo: 'sinDato' })
  })

  it('con 0 en los dos diámetros es un círculo punteado de «cero»', () => {
    expect(formaDeCopa(0, 0)).toEqual({ tipo: 'cero' })
    expect(formaDeCopa(0, null)).toEqual({ tipo: 'cero' })
  })

  it('los radios son proporcionales a E-O (horizontal) y N-S (vertical)', () => {
    const forma = formaDeCopa(ESCALA_COPA_MAX_M / 2, ESCALA_COPA_MAX_M)
    expect(forma).toEqual({
      tipo: 'elipse',
      radioX: COPA_RADIO_ANILLO,
      radioY: COPA_RADIO_ANILLO / 2,
    })
  })

  it('con un solo diámetro dibuja un círculo', () => {
    const forma = formaDeCopa(null, ESCALA_COPA_MAX_M / 4)
    expect(forma).toMatchObject({ tipo: 'elipse' })
    if (forma.tipo === 'elipse') expect(forma.radioX).toBe(forma.radioY)
  })

  it('una copa mayor que la escala no se sale del anillo', () => {
    const forma = formaDeCopa(ESCALA_COPA_MAX_M * 3, ESCALA_COPA_MAX_M * 2)
    expect(forma).toEqual({
      tipo: 'elipse',
      radioX: COPA_RADIO_ANILLO,
      radioY: COPA_RADIO_ANILLO,
    })
  })

  it('un diámetro en 0 junto a otro con valor dibuja la elipse', () => {
    expect(formaDeCopa(0, 10)).toMatchObject({ tipo: 'elipse', radioY: 0 })
  })
})
