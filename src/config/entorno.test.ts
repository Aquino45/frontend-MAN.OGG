import { afterEach, describe, expect, it, vi } from 'vitest'
import { leerEntorno, leerUrlPanel, obtenerEntorno, obtenerUrlPanel } from './entorno'

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

describe('leerUrlPanel', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('devuelve la dirección si es http o https', () => {
    expect(leerUrlPanel({ VITE_URL_PANEL: 'https://panel.prueba.invalid/admin/' })).toBe(
      'https://panel.prueba.invalid/admin/',
    )
    expect(leerUrlPanel({ VITE_URL_PANEL: ' http://panel.prueba.invalid/admin/ ' })).toBe(
      'http://panel.prueba.invalid/admin/',
    )
  })

  it('sin variable, vacía o con otro formato no hay panel', () => {
    expect(leerUrlPanel({})).toBeNull()
    expect(leerUrlPanel({ VITE_URL_PANEL: '  ' })).toBeNull()
    expect(leerUrlPanel({ VITE_URL_PANEL: '/admin/' })).toBeNull()
    expect(leerUrlPanel({ VITE_URL_PANEL: 'texto suelto' })).toBeNull()
  })

  it('rechaza esquemas que no son de una página web', () => {
    expect(leerUrlPanel({ VITE_URL_PANEL: 'javascript:alert(1)' })).toBeNull()
    expect(leerUrlPanel({ VITE_URL_PANEL: 'data:text/html,hola' })).toBeNull()
  })

  it('lee import.meta.env', () => {
    vi.stubEnv('VITE_URL_PANEL', 'https://panel.prueba.invalid/admin/')
    expect(obtenerUrlPanel()).toBe('https://panel.prueba.invalid/admin/')
  })
})
