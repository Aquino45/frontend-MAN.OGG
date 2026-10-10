import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { arbolesSector1Mock } from '@/mocks'
import { useArbolesDeSector } from './useArbolesDeSector'

describe('useArbolesDeSector', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sin sector no pide nada', () => {
    const { result } = renderHook(() => useArbolesDeSector(null))
    expect(result.current.estado).toBe('inactivo')
  })

  it('carga los árboles del sector con mocks', async () => {
    const { result } = renderHook(() => useArbolesDeSector(1))
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arboles).toHaveLength(arbolesSector1Mock.features.length)
  })

  it('un sector sin árboles termina en una lista vacía', async () => {
    const { result } = renderHook(() => useArbolesDeSector(2))
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arboles).toEqual([])
  })

  it('un fallo de la API da error y reintentar vuelve a pedir', async () => {
    vi.stubEnv('VITE_USAR_MOCKS', 'false')
    const fetchFalso = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(arbolesSector1Mock), { status: 200 }))
    vi.stubGlobal('fetch', fetchFalso)
    const { result } = renderHook(() => useArbolesDeSector(1))
    await waitFor(() => expect(result.current.estado).toBe('error'))
    result.current.reintentar()
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(fetchFalso).toHaveBeenCalledTimes(2)
  })
})
