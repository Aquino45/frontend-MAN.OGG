import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerSectores } from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { RUTAS } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { arrancarCargaTemprana } from './arranqueTemprano'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))
const obtenerSectoresFalso = vi.mocked(obtenerSectores)

describe('arrancarCargaTemprana', () => {
  beforeEach(() => obtenerSectoresFalso.mockResolvedValue(sectoresMock))
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    invalidarCacheCampus()
  })

  it('en el mapa y en Inicio pide los sectores una sola vez, aunque se llame dos veces', () => {
    arrancarCargaTemprana(RUTAS.mapa)
    arrancarCargaTemprana(RUTAS.inicio)
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1)
  })

  it('en las demás páginas no pide nada', () => {
    arrancarCargaTemprana(RUTAS.cifras)
    arrancarCargaTemprana('/otra')
    expect(obtenerSectoresFalso).not.toHaveBeenCalled()
  })

  it('si la API falla no deja un error sin atender', async () => {
    obtenerSectoresFalso.mockRejectedValue(new Error('caída'))
    expect(() => arrancarCargaTemprana(RUTAS.mapa)).not.toThrow()
    await Promise.resolve()
  })
})
