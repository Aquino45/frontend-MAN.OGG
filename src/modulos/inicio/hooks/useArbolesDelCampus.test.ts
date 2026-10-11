import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, obtenerArbolesDeSector, type ArbolColeccion } from '@/api/cliente'
import { arbolesSector1Mock } from '@/mocks'
import { useArbolesDelCampus } from './useArbolesDelCampus'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)
const VACIA: ArbolColeccion = { type: 'FeatureCollection', features: [] }

describe('useArbolesDelCampus', () => {
  afterEach(() => obtenerArbolesFalso.mockReset())

  it('sin ids no pide nada y queda inactivo', () => {
    const { result } = renderHook(() => useArbolesDelCampus(null))
    expect(result.current.estado).toBe('inactivo')
    expect(obtenerArbolesFalso).not.toHaveBeenCalled()
  })

  it('con ids pide cada sector con una señal y junta todos los árboles', async () => {
    obtenerArbolesFalso.mockImplementation(async (sectorId) =>
      sectorId === 1 ? arbolesSector1Mock : VACIA,
    )
    const { result } = renderHook(() => useArbolesDelCampus([1, 2, 3]))
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arboles).toHaveLength(arbolesSector1Mock.features.length)
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(3)
    for (const [indice, sectorId] of [1, 2, 3].entries()) {
      expect(obtenerArbolesFalso.mock.calls[indice][0]).toBe(sectorId)
      expect(obtenerArbolesFalso.mock.calls[indice][1]?.signal).toBeInstanceOf(AbortSignal)
    }
  })

  it('una lista de ids vacía termina en una lista de árboles vacía', async () => {
    const { result } = renderHook(() => useArbolesDelCampus([]))
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arboles).toEqual([])
    expect(obtenerArbolesFalso).not.toHaveBeenCalled()
  })

  it('un arreglo nuevo con los mismos ids en cada render no vuelve a pedir', async () => {
    obtenerArbolesFalso.mockResolvedValue(VACIA)
    const { result, rerender } = renderHook(() => useArbolesDelCampus([1, 2]))
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    rerender()
    rerender()
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(2)
    expect(result.current.estado).toBe('listo')
  })

  it('si un sector falla, todo queda en error y reintentar vuelve a pedir', async () => {
    obtenerArbolesFalso.mockImplementation(async (sectorId) => {
      if (sectorId === 2) throw new ErrorApi('/sectores/2/arboles', 503)
      return VACIA
    })
    const { result } = renderHook(() => useArbolesDelCampus([1, 2]))
    await waitFor(() => expect(result.current.estado).toBe('error'))

    obtenerArbolesFalso.mockReset()
    obtenerArbolesFalso.mockResolvedValue(arbolesSector1Mock)
    act(() => result.current.reintentar())
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(2)
  })

  it('un resultado viejo no vale: al cambiar los ids vuelve a cargar y aborta lo anterior', () => {
    const senales: AbortSignal[] = []
    obtenerArbolesFalso.mockImplementation((_sectorId, opciones) => {
      if (opciones?.signal) senales.push(opciones.signal)
      return new Promise(() => {})
    })
    const { result, rerender } = renderHook(({ ids }) => useArbolesDelCampus(ids), {
      initialProps: { ids: [1] as number[] | null },
    })
    expect(result.current.estado).toBe('cargando')
    rerender({ ids: [1, 2] })
    expect(senales[0].aborted).toBe(true)
    expect(result.current.estado).toBe('cargando')
    rerender({ ids: null })
    expect(result.current.estado).toBe('inactivo')
  })

  it('la respuesta tardía de una petición abortada se ignora', async () => {
    let resolverPrimera: (coleccion: ArbolColeccion) => void = () => {}
    obtenerArbolesFalso.mockImplementationOnce(
      () => new Promise<ArbolColeccion>((resolver) => (resolverPrimera = resolver)),
    )
    obtenerArbolesFalso.mockResolvedValue(VACIA)
    const { result, rerender } = renderHook(({ ids }) => useArbolesDelCampus(ids), {
      initialProps: { ids: [1] },
    })
    rerender({ ids: [2] })
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    await act(async () => resolverPrimera(arbolesSector1Mock))
    if (result.current.estado !== 'listo') throw new Error('no cargó')
    expect(result.current.arboles).toEqual([])
  })
})
