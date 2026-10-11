import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, obtenerArbol } from '@/api/cliente'
import { arbolDemoMock, arbolRealMock } from '@/mocks'
import { useMedidasDeDestacados } from './useMedidasDeDestacados'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerArbol: vi.fn(),
}))

const obtenerArbolFalso = vi.mocked(obtenerArbol)

describe('useMedidasDeDestacados', () => {
  afterEach(() => obtenerArbolFalso.mockReset())

  it('sin códigos no pide nada', () => {
    const { result } = renderHook(() => useMedidasDeDestacados(null))
    expect(obtenerArbolFalso).not.toHaveBeenCalled()
    expect(result.current('S01-A001')).toEqual({ estado: 'cargando' })
  })

  it('pide el detalle solo de los códigos recibidos y entrega DAP y altura', async () => {
    obtenerArbolFalso.mockImplementation(async (codigo) =>
      codigo === arbolDemoMock.codigo ? arbolDemoMock : arbolRealMock,
    )
    const codigos = [arbolDemoMock.codigo, arbolRealMock.codigo]
    const { result } = renderHook(() => useMedidasDeDestacados(codigos))
    expect(result.current(codigos[0])).toEqual({ estado: 'cargando' })
    await waitFor(() => expect(result.current(codigos[0]).estado).toBe('listo'))
    await waitFor(() => expect(result.current(codigos[1]).estado).toBe('listo'))
    expect(result.current(codigos[0])).toEqual({
      estado: 'listo',
      dapCm: arbolDemoMock.dap_cm,
      alturaM: arbolDemoMock.altura_total_m,
    })
    expect(obtenerArbolFalso).toHaveBeenCalledTimes(2)
  })

  it('si uno falla, solo ese queda en error', async () => {
    obtenerArbolFalso.mockImplementation(async (codigo) => {
      if (codigo === arbolDemoMock.codigo) throw new ErrorApi('/arboles/x', 503)
      return arbolRealMock
    })
    const codigos = [arbolDemoMock.codigo, arbolRealMock.codigo]
    const { result } = renderHook(() => useMedidasDeDestacados(codigos))
    await waitFor(() => expect(result.current(codigos[0]).estado).toBe('error'))
    await waitFor(() => expect(result.current(codigos[1]).estado).toBe('listo'))
  })
})
