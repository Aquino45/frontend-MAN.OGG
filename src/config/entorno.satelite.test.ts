import { describe, expect, it } from 'vitest'
import { leerConfigSatelite } from './entorno'
import { SATELITE_URL_TESELAS_POR_DEFECTO } from './satelite'

describe('leerConfigSatelite', () => {
  it('sin clave no hay vista satelital', () => {
    expect(leerConfigSatelite({})).toBeNull()
    expect(leerConfigSatelite({ VITE_ESRI_CLAVE: '   ' })).toBeNull()
    expect(leerConfigSatelite({ VITE_ESRI_CLAVE: 123 })).toBeNull()
  })

  it('con clave usa el servicio por defecto', () => {
    expect(leerConfigSatelite({ VITE_ESRI_CLAVE: ' abc ' })).toEqual({
      clave: 'abc',
      urlTeselas: SATELITE_URL_TESELAS_POR_DEFECTO,
    })
  })

  it('la URL del entorno manda sobre la de por defecto', () => {
    expect(
      leerConfigSatelite({
        VITE_ESRI_CLAVE: 'abc',
        VITE_ESRI_URL_TESELAS: 'https://otra.test/{z}/{y}/{x}',
      }),
    ).toEqual({ clave: 'abc', urlTeselas: 'https://otra.test/{z}/{y}/{x}' })
  })
})
