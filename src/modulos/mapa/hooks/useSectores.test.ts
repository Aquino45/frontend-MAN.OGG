import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, obtenerSectores } from '@/api/cliente'
import { sectoresMock } from '@/mocks'
import { useSectores } from './useSectores'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)

describe('useSectores', () => {
  afterEach(() => obtenerSectoresFalso.mockReset())

  it('pasa de cargando a listo con los sectores', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    const { result } = renderHook(() => useSectores())
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(result.current).toMatchObject({ sectores: sectoresMock.features })
  })

  it('pasa a error si la API falla y reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    const { result } = renderHook(() => useSectores())
    await waitFor(() => expect(result.current.estado).toBe('error'))
    expect(result.current).toMatchObject({ error: { estado: 503 } })

    obtenerSectoresFalso.mockResolvedValueOnce(sectoresMock)
    act(() => result.current.reintentar())
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(2)
  })
})
