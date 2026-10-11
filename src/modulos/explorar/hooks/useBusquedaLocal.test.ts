import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEBOUNCE_BUSQUEDA_MS } from '@/config/constantes'
import { useBusquedaLocal } from './useBusquedaLocal'

function montar(inicial = '') {
  const alEscribir = vi.fn()
  const vista = renderHook(({ url }) => useBusquedaLocal(url, alEscribir), {
    initialProps: { url: inicial },
  })
  return { ...vista, alEscribir }
}

describe('useBusquedaLocal', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('arranca con lo que dice la URL', () => {
    const { result } = montar('molle')
    expect(result.current.texto).toBe('molle')
  })

  it('lo que se escribe se ve al instante y la URL se escribe una sola vez, tras la pausa', () => {
    const { result, alEscribir } = montar()
    act(() => result.current.cambiar('h'))
    act(() => result.current.cambiar('hu'))
    act(() => result.current.cambiar('hua'))
    expect(result.current.texto).toBe('hua')
    expect(alEscribir).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS - 1))
    expect(alEscribir).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(alEscribir).toHaveBeenCalledTimes(1)
    expect(alEscribir).toHaveBeenCalledWith('hua')
  })

  it('el eco de la propia escritura en la URL no pisa lo que se sigue escribiendo', () => {
    const { result, rerender, alEscribir } = montar()
    act(() => result.current.cambiar('hua'))
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS))
    // El usuario sigue escribiendo antes de que la URL llegue de vuelta
    act(() => result.current.cambiar('huar'))
    rerender({ url: 'hua' })
    expect(result.current.texto).toBe('huar')
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS))
    expect(alEscribir).toHaveBeenLastCalledWith('huar')
  })

  it('un cambio de la URL desde fuera (atrás, adelante, limpiar) actualiza el texto', () => {
    const { result, rerender } = montar('molle')
    rerender({ url: 'palma' })
    expect(result.current.texto).toBe('palma')
    rerender({ url: '' })
    expect(result.current.texto).toBe('')
  })

  it('un cambio desde fuera cancela lo que estaba por escribirse', () => {
    const { result, rerender, alEscribir } = montar('molle')
    act(() => result.current.cambiar('molles'))
    rerender({ url: '' })
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS * 2))
    expect(alEscribir).not.toHaveBeenCalled()
    expect(result.current.texto).toBe('')
  })

  it('después de limpiar se puede volver a escribir lo mismo de antes', () => {
    const { result, rerender, alEscribir } = montar()
    act(() => result.current.cambiar('ab'))
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS))
    rerender({ url: 'ab' })
    rerender({ url: '' })
    expect(result.current.texto).toBe('')
    act(() => result.current.cambiar('ab'))
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSQUEDA_MS))
    expect(alEscribir).toHaveBeenCalledTimes(2)
  })
})
