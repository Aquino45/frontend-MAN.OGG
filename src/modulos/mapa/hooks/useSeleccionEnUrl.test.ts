import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useSeleccionEnUrl } from './useSeleccionEnUrl'

function irA(url: string) {
  window.history.replaceState(null, '', url)
}

const esperar = () => new Promise((resolver) => setTimeout(resolver, 30))

describe('useSeleccionEnUrl', () => {
  beforeEach(() => irA('/'))
  afterEach(() => irA('/'))

  it('entra directo al sector y a la cartilla de la URL', () => {
    irA('/?sector=1&arbol=S01-A012')
    const { result } = renderHook(() => useSeleccionEnUrl())
    expect(result.current.sectorId).toBe(1)
    expect(result.current.arbolCodigo).toBe('S01-A012')
  })

  it('seleccionar un sector y un árbol escribe la URL', () => {
    const { result } = renderHook(() => useSeleccionEnUrl())
    act(() => result.current.seleccionarSector(1))
    expect(window.location.search).toBe('?sector=1')
    act(() => result.current.seleccionarArbol('S01-A001'))
    expect(window.location.search).toBe('?sector=1&arbol=S01-A001')
    expect(result.current.arbolCodigo).toBe('S01-A001')
  })

  it('«atrás» cierra la cartilla y deja el sector', async () => {
    const { result } = renderHook(() => useSeleccionEnUrl())
    act(() => result.current.seleccionarSector(1))
    act(() => result.current.seleccionarArbol('S01-A001'))
    await act(async () => {
      window.history.back()
      await esperar()
    })
    expect(result.current.arbolCodigo).toBeNull()
    expect(result.current.sectorId).toBe(1)
    expect(window.location.search).toBe('?sector=1')
  })

  it('cerrar la cartilla vuelve a la entrada anterior si la agregó la app', async () => {
    const { result } = renderHook(() => useSeleccionEnUrl())
    act(() => result.current.seleccionarSector(1))
    act(() => result.current.seleccionarArbol('S01-A001'))
    await act(async () => {
      result.current.cerrarArbol()
      await esperar()
    })
    expect(result.current.arbolCodigo).toBeNull()
    expect(window.location.search).toBe('?sector=1')
  })

  it('si la URL se abrió directo, cerrar reescribe sin salir de la página', () => {
    irA('/?sector=1&arbol=S01-A012')
    const { result } = renderHook(() => useSeleccionEnUrl())
    act(() => result.current.cerrarArbol())
    expect(result.current.arbolCodigo).toBeNull()
    expect(window.location.search).toBe('?sector=1')
    act(() => result.current.cerrarSector())
    expect(result.current.sectorId).toBeNull()
    expect(window.location.search).toBe('')
  })
})
