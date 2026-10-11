import { afterEach, describe, expect, it, vi } from 'vitest'
import { arbolDemoMock, arbolRealMock, arbolesSector1Mock, sectoresMock } from '@/mocks'
import {
  ErrorApi,
  ErrorNoEncontrado,
  obtenerArbol,
  obtenerArbolesDeSector,
  obtenerSectores,
} from './cliente'

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

describe('obtenerArbolesDeSector', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('con mocks devuelve la colección del sector 1 y vacía en los demás', async () => {
    const fetchFalso = simularFetch(200, {})
    await expect(obtenerArbolesDeSector(1, { entorno: CON_MOCKS })).resolves.toEqual(
      arbolesSector1Mock,
    )
    const vacia = await obtenerArbolesDeSector(2, { entorno: CON_MOCKS })
    expect(vacia.features).toEqual([])
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('sin mocks pide la ruta del sector a la URL del entorno', async () => {
    const fetchFalso = simularFetch(200, arbolesSector1Mock)
    await expect(obtenerArbolesDeSector(1, { entorno: SIN_MOCKS })).resolves.toEqual(
      arbolesSector1Mock,
    )
    expect(fetchFalso).toHaveBeenCalledWith(`${URL_PRUEBA}/sectores/1/arboles`, expect.anything())
  })

  it('un 404 lanza ErrorNoEncontrado y un 503 lanza ErrorApi', async () => {
    simularFetch(404, { detail: 'No encontrado.' })
    await expect(obtenerArbolesDeSector(9, { entorno: SIN_MOCKS })).rejects.toBeInstanceOf(
      ErrorNoEncontrado,
    )
    simularFetch(503, {})
    const promesa = obtenerArbolesDeSector(1, { entorno: SIN_MOCKS })
    await expect(promesa).rejects.toMatchObject({ estado: 503 })
    await expect(promesa).rejects.not.toBeInstanceOf(ErrorNoEncontrado)
  })
})

describe('obtenerArbol', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('con mocks devuelve la cartilla real y la demo', async () => {
    await expect(obtenerArbol('S01-A001', { entorno: CON_MOCKS })).resolves.toEqual(arbolRealMock)
    await expect(obtenerArbol('S01-A012', { entorno: CON_MOCKS })).resolves.toEqual(arbolDemoMock)
  })

  it('con mocks, un código sin cartilla de ejemplo lanza ErrorNoEncontrado', async () => {
    await expect(obtenerArbol('S01-A002', { entorno: CON_MOCKS })).rejects.toBeInstanceOf(
      ErrorNoEncontrado,
    )
  })

  it('sin mocks pide la ruta del árbol a la URL del entorno', async () => {
    const fetchFalso = simularFetch(200, arbolRealMock)
    await expect(obtenerArbol('S01-A001', { entorno: SIN_MOCKS })).resolves.toEqual(arbolRealMock)
    expect(fetchFalso).toHaveBeenCalledWith(`${URL_PRUEBA}/arboles/S01-A001`, expect.anything())
  })

  it('un 404 lanza ErrorNoEncontrado y un 503 lanza ErrorApi', async () => {
    simularFetch(404, { detail: 'No encontrado.' })
    await expect(obtenerArbol('S01-A099', { entorno: SIN_MOCKS })).rejects.toBeInstanceOf(
      ErrorNoEncontrado,
    )
    simularFetch(503, {})
    const promesa = obtenerArbol('S01-A001', { entorno: SIN_MOCKS })
    await expect(promesa).rejects.toMatchObject({ estado: 503 })
    await expect(promesa).rejects.not.toBeInstanceOf(ErrorNoEncontrado)
  })
})
