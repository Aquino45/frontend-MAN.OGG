import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRecuadroAnimado } from './useRecuadroAnimado'

const MAPA = { x: 0, y: 0, ancho: 1000, alto: 800 }
const SECTOR = { x: 200, y: 100, ancho: 250, alto: 200 }
const DURACION_MS = 300

describe('useRecuadroAnimado', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('empieza en el recuadro dado y llega al nuevo al terminar la transición', () => {
    const { result, rerender } = renderHook(
      ({ objetivo }) => useRecuadroAnimado(objetivo, DURACION_MS),
      { initialProps: { objetivo: MAPA } },
    )
    expect(result.current).toEqual(MAPA)
    rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current.ancho).toBeLessThan(MAPA.ancho)
    expect(result.current.ancho).toBeGreaterThan(SECTOR.ancho)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toEqual(SECTOR)
  })

  it('con movimiento reducido salta directo al recuadro final', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { result, rerender } = renderHook(
      ({ objetivo }) => useRecuadroAnimado(objetivo, DURACION_MS),
      { initialProps: { objetivo: MAPA } },
    )
    rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(result.current).toEqual(SECTOR)
  })
})
