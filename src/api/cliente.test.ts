import { afterEach, describe, expect, it, vi } from 'vitest'
import { sectoresMock } from '@/mocks'
import { ErrorApi, obtenerSectores } from './cliente'

const URL_PRUEBA = 'http://api.prueba.invalid/v1'
const CON_MOCKS = { urlApi: URL_PRUEBA, usarMocks: true }
const SIN_MOCKS = { urlApi: URL_PRUEBA, usarMocks: false }

function simularFetch(estado: number, cuerpo: unknown) {
  const fetchFalso = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

describe('obtenerSectores', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('con mocks devuelve el ejemplo del contrato sin llamar a la red', async () => {
    const fetchFalso = simularFetch(200, {})
    await expect(obtenerSectores({ entorno: CON_MOCKS })).resolves.toEqual(sectoresMock)
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('sin mocks pide /sectores a la URL del entorno y devuelve el cuerpo', async () => {
    const fetchFalso = simularFetch(200, sectoresMock)
    await expect(obtenerSectores({ entorno: SIN_MOCKS })).resolves.toEqual(sectoresMock)
    expect(fetchFalso).toHaveBeenCalledWith(`${URL_PRUEBA}/sectores`, expect.anything())
  })

  it('sin entorno explícito lee VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://otra.prueba.invalid/api')
    vi.stubEnv('VITE_USAR_MOCKS', 'false')
    const fetchFalso = simularFetch(200, sectoresMock)
    await obtenerSectores()
    expect(fetchFalso).toHaveBeenCalledWith(
      'http://otra.prueba.invalid/api/sectores',
      expect.anything(),
    )
  })

  it('una respuesta 503 lanza ErrorApi con el estado', async () => {
    simularFetch(503, { detail: 'sin conexión' })
    const promesa = obtenerSectores({ entorno: SIN_MOCKS })
    await expect(promesa).rejects.toBeInstanceOf(ErrorApi)
    await expect(promesa).rejects.toMatchObject({ estado: 503 })
  })

  it('el mock tiene los 5 sectores del ejemplo', () => {
    expect(sectoresMock.features.map((sector) => sector.properties.nombre)).toHaveLength(5)
  })
})
