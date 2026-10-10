import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { arbolDemoMock } from '@/mocks'
import { useArbol } from './useArbol'

describe('useArbol', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('carga la cartilla de ejemplo', async () => {
    const { result } = renderHook(() => useArbol('S01-A012'))
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arbol).toEqual(arbolDemoMock)
  })

  it('un código sin cartilla da «noEncontrado», distinto de un error', async () => {
    const { result } = renderHook(() => useArbol('S01-A099'))
    await waitFor(() => expect(result.current.estado).toBe('noEncontrado'))
  })

  it('un 503 da error y reintentar vuelve a pedir', async () => {
    vi.stubEnv('VITE_USAR_MOCKS', 'false')
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(arbolDemoMock), { status: 200 }))
    vi.stubGlobal('fetch', fetchFalso)
    const { result } = renderHook(() => useArbol('S01-A012'))
    await waitFor(() => expect(result.current.estado).toBe('error'))
    result.current.reintentar()
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(fetchFalso).toHaveBeenCalledTimes(2)
  })

  it('al cambiar de código vuelve a «cargando»', async () => {
    const { result, rerender } = renderHook(({ codigo }) => useArbol(codigo), {
      initialProps: { codigo: 'S01-A012' },
    })
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    rerender({ codigo: 'S01-A001' })
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
  })
})
