import { describe, expect, it } from 'vitest'
import { leerConfigMapaReal } from './entorno'
import { CALLES_URL_TESELAS_POR_DEFECTO, SATELITE_URL_TESELAS_POR_DEFECTO } from './satelite'

describe('leerConfigMapaReal', () => {
  it('sin clave no hay satélite, pero las calles siguen con su servicio por defecto', () => {
    for (const variables of [{}, { VITE_ESRI_CLAVE: '   ' }, { VITE_ESRI_CLAVE: 123 }]) {
      const config = leerConfigMapaReal(variables)
      expect(config.clave).toBeNull()
      expect(config.urlsTeselas.calles).toBe(CALLES_URL_TESELAS_POR_DEFECTO)
    }
  })

  it('con clave usa los servicios por defecto de calles y de satélite', () => {
    expect(leerConfigMapaReal({ VITE_ESRI_CLAVE: ' abc ' })).toEqual({
      clave: 'abc',
      urlsTeselas: {
        satelite: SATELITE_URL_TESELAS_POR_DEFECTO,
        calles: CALLES_URL_TESELAS_POR_DEFECTO,
      },
    })
  })

  it('las direcciones del entorno mandan sobre las de por defecto', () => {
    expect(
      leerConfigMapaReal({
        VITE_ESRI_CLAVE: 'abc',
        VITE_ESRI_URL_TESELAS: 'https://satelite.test/{z}/{y}/{x}',
        VITE_URL_CALLES: 'https://calles.test/{z}/{y}/{x}',
      }),
    ).toEqual({
      clave: 'abc',
      urlsTeselas: {
        satelite: 'https://satelite.test/{z}/{y}/{x}',
        calles: 'https://calles.test/{z}/{y}/{x}',
      },
    })
  })
})
