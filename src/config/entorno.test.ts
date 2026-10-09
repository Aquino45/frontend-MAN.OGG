import { afterEach, describe, expect, it, vi } from 'vitest'
import { leerEntorno, obtenerEntorno } from './entorno'

const URL_PRUEBA = 'http://api.prueba.invalid/v1'

describe('leerEntorno', () => {
  it('acepta valores válidos con mocks activados', () => {
    expect(leerEntorno({ VITE_API_URL: URL_PRUEBA, VITE_USAR_MOCKS: 'true' })).toEqual({
      urlApi: URL_PRUEBA,
      usarMocks: true,
    })
  })

  it('acepta mocks desactivados', () => {
    expect(leerEntorno({ VITE_API_URL: URL_PRUEBA, VITE_USAR_MOCKS: 'false' }).usarMocks).toBe(
      false,
    )
  })

  it('lanza error si falta VITE_API_URL', () => {
    expect(() => leerEntorno({ VITE_USAR_MOCKS: 'true' })).toThrow(/VITE_API_URL/)
    expect(() => leerEntorno({ VITE_API_URL: '  ', VITE_USAR_MOCKS: 'true' })).toThrow(
      /VITE_API_URL/,
    )
  })

  it('lanza error si VITE_USAR_MOCKS trae otro valor', () => {
    expect(() => leerEntorno({ VITE_API_URL: URL_PRUEBA, VITE_USAR_MOCKS: 'si' })).toThrow(
      /VITE_USAR_MOCKS/,
    )
    expect(() => leerEntorno({ VITE_API_URL: URL_PRUEBA })).toThrow(/VITE_USAR_MOCKS/)
  })
})

describe('obtenerEntorno', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('lee import.meta.env', () => {
    vi.stubEnv('VITE_API_URL', URL_PRUEBA)
    vi.stubEnv('VITE_USAR_MOCKS', 'false')
    expect(obtenerEntorno()).toEqual({ urlApi: URL_PRUEBA, usarMocks: false })
  })
})
