import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
} from '@/api/cliente'
import { arbolesSector1Mock, sectoresMock } from '@/mocks'
import { cargarArbolesDelCampus, cargarSectores, invalidarCacheCampus } from './cacheCampus'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)
const VACIA: ArbolColeccion = { type: 'FeatureCollection', features: [] }

describe('cacheCampus', () => {
  beforeEach(() => invalidarCacheCampus())
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })

  it('los sectores se piden una sola vez aunque se pidan dos veces', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    const [primera, segunda] = await Promise.all([cargarSectores(), cargarSectores()])
    await cargarSectores()
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1)
    expect(primera).toBe(segunda)
    expect(primera).toHaveLength(sectoresMock.features.length)
  })

  it('los árboles del mismo conjunto de sectores se piden una sola vez', async () => {
    obtenerArbolesFalso.mockResolvedValue(arbolesSector1Mock)
    await cargarArbolesDelCampus([1, 2])
    await cargarArbolesDelCampus([1, 2])
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(2)
  })

  it('otro conjunto de sectores sí vuelve a pedir', async () => {
    obtenerArbolesFalso.mockResolvedValue(VACIA)
    await cargarArbolesDelCampus([1])
    await cargarArbolesDelCampus([1, 2])
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(3)
  })

  it('un error no se guarda: la siguiente petición vuelve a intentarlo', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    await expect(cargarSectores()).rejects.toBeInstanceOf(ErrorApi)
    obtenerSectoresFalso.mockResolvedValueOnce(sectoresMock)
    await expect(cargarSectores()).resolves.toHaveLength(sectoresMock.features.length)
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(2)
  })

  it('invalidar la caché obliga a pedir de nuevo sectores y árboles', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockResolvedValue(VACIA)
    await cargarSectores()
    await cargarArbolesDelCampus([1])
    invalidarCacheCampus()
    await cargarSectores()
    await cargarArbolesDelCampus([1])
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(2)
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(2)
  })
})
