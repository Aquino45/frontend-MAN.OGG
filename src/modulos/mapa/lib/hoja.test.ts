import { describe, expect, it } from 'vitest'
import { HOJA_ARRASTRE } from '@/config/constantes'
import { amortiguarHaciaArriba, debeCerrarHoja } from './hoja'

describe('amortiguarHaciaArriba', () => {
  it('hacia abajo sigue al dedo sin cambios', () => {
    expect(amortiguarHaciaArriba(0)).toBe(0)
    expect(amortiguarHaciaArriba(120)).toBe(120)
  })

  it('hacia arriba se frena y no pasa del elástico', () => {
    const limite = HOJA_ARRASTRE.elasticoPx
    const poco = amortiguarHaciaArriba(-10)
    const mucho = amortiguarHaciaArriba(-400)
    expect(poco).toBeLessThan(0)
    expect(Math.abs(poco)).toBeLessThan(10)
    expect(Math.abs(mucho)).toBeLessThan(limite)
    expect(Math.abs(mucho)).toBeGreaterThan(Math.abs(poco))
  })

  it('cada px extra rinde menos que el anterior', () => {
    const paso1 = Math.abs(amortiguarHaciaArriba(-20)) - Math.abs(amortiguarHaciaArriba(-10))
    const paso2 = Math.abs(amortiguarHaciaArriba(-110)) - Math.abs(amortiguarHaciaArriba(-100))
    expect(paso2).toBeLessThan(paso1)
  })
})

describe('debeCerrarHoja', () => {
  const alto = 400

  it('cierra al pasar el 25 % del alto, aunque vaya despacio', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: 100, altoPx: alto, recorridoPx: 100, tiempoMs: 2000 }),
    ).toBe(true)
  })

  it('no cierra si baja poco y despacio', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: 60, altoPx: alto, recorridoPx: 60, tiempoMs: 2000 }),
    ).toBe(false)
  })

  it('cierra con un empujón rápido (más de 0.11 px/ms) aunque baje poco', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: 40, altoPx: alto, recorridoPx: 40, tiempoMs: 200 }),
    ).toBe(true)
  })

  it('justo en el umbral de velocidad no cierra (solo por encima)', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: 30, altoPx: alto, recorridoPx: 33, tiempoMs: 300 }),
    ).toBe(false)
  })

  it('un empujón rápido hacia arriba no cierra', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: -10, altoPx: alto, recorridoPx: -40, tiempoMs: 100 }),
    ).toBe(false)
  })

  it('un tiempo de 0 ms no divide por cero', () => {
    expect(
      debeCerrarHoja({ desplazamientoPx: 20, altoPx: alto, recorridoPx: 20, tiempoMs: 0 }),
    ).toBe(true)
  })
})
