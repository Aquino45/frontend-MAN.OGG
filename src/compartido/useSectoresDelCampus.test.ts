import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi, obtenerSectores } from '@/api/cliente'
import { sectoresMock } from '@/mocks'
import { invalidarCacheCampus } from './cacheCampus'
import { useSectoresDelCampus } from './useSectoresDelCampus'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)

describe('useSectoresDelCampus', () => {
  beforeEach(() => invalidarCacheCampus())
  afterEach(() => obtenerSectoresFalso.mockReset())

  it('carga los sectores y no repite la petición entre dos usos', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    const primero = renderHook(() => useSectoresDelCampus())
    expect(primero.result.current.estado).toBe('cargando')
    await waitFor(() => expect(primero.result.current.estado).toBe('listo'))
    const segundo = renderHook(() => useSectoresDelCampus())
    await waitFor(() => expect(segundo.result.current.estado).toBe('listo'))
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1)
  })

  it('un error no se guarda y reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    const { result } = renderHook(() => useSectoresDelCampus())
    await waitFor(() => expect(result.current.estado).toBe('error'))
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    act(() => result.current.reintentar())
    expect(result.current.estado).toBe('cargando')
    await waitFor(() => expect(result.current.estado).toBe('listo'))
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(2)
  })
})
