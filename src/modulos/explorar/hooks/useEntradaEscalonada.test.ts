import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EXPLORAR_FIN_ENTRADA_MS } from '@/config/constantes'
import { useEntradaEscalonada } from './useEntradaEscalonada'

describe('useEntradaEscalonada', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('entra escalonada y, pasado el tiempo de la entrada, ya no', () => {
    const { result } = renderHook(() => useEntradaEscalonada(true))
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(EXPLORAR_FIN_ENTRADA_MS - 1))
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(false)
  })

  it('el tiempo corre desde que hay filas, no desde que se monta', () => {
    const { result, rerender } = renderHook(({ hay }) => useEntradaEscalonada(hay), {
      initialProps: { hay: false },
    })
    act(() => vi.advanceTimersByTime(EXPLORAR_FIN_ENTRADA_MS * 2))
    expect(result.current).toBe(true)
    rerender({ hay: true })
    act(() => vi.advanceTimersByTime(EXPLORAR_FIN_ENTRADA_MS))
    expect(result.current).toBe(false)
  })

  it('una vez terminada, no vuelve a entrar aunque las filas aparezcan de nuevo', () => {
    const { result, rerender } = renderHook(({ hay }) => useEntradaEscalonada(hay), {
      initialProps: { hay: true },
    })
    act(() => vi.advanceTimersByTime(EXPLORAR_FIN_ENTRADA_MS))
    rerender({ hay: false })
    rerender({ hay: true })
    expect(result.current).toBe(false)
  })
})
