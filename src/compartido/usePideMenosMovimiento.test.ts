import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePideMenosMovimiento } from './usePideMenosMovimiento'

type Escucha = (evento: { matches: boolean }) => void

function simularMedia(inicial: boolean) {
  const escuchas = new Set<Escucha>()
  const media = {
    matches: inicial,
    addEventListener: (_: string, escucha: Escucha) => escuchas.add(escucha),
    removeEventListener: (_: string, escucha: Escucha) => escuchas.delete(escucha),
  }
  vi.stubGlobal('matchMedia', () => media)
  return {
    cambiar(valor: boolean) {
      media.matches = valor
      escuchas.forEach((escucha) => escucha({ matches: valor }))
    },
    escuchas,
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('usePideMenosMovimiento', () => {
  it('lee la preferencia inicial', () => {
    simularMedia(true)
    expect(renderHook(() => usePideMenosMovimiento()).result.current).toBe(true)
  })

  it('sigue los cambios de la preferencia y deja de escuchar al desmontar', () => {
    const media = simularMedia(false)
    const { result, unmount } = renderHook(() => usePideMenosMovimiento())
    expect(result.current).toBe(false)
    act(() => media.cambiar(true))
    expect(result.current).toBe(true)
    unmount()
    expect(media.escuchas.size).toBe(0)
  })

  it('sin matchMedia no pide menos movimiento', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(() => usePideMenosMovimiento()).result.current).toBe(false)
  })
})
