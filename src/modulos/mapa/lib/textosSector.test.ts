import { describe, expect, it } from 'vitest'
import { TEXTOS_MAPA } from '@/config/constantes'
import { nombreAccesibleSector, textoTotalArboles } from './textosSector'

describe('textos del sector', () => {
  it('describe el total de árboles', () => {
    expect(textoTotalArboles(118)).toBe('118 árboles')
    expect(textoTotalArboles(1)).toBe('1 árbol')
    expect(textoTotalArboles(0)).toBe(TEXTOS_MAPA.sinArboles)
  })

  it('arma el nombre accesible con el nombre, el total y si es provisional', () => {
    expect(
      nombreAccesibleSector({ nombre: 'Sector 1', total_arboles: 118, provisional: false }),
    ).toBe('Sector 1, 118 árboles')
    expect(nombreAccesibleSector({ nombre: 'Sector 2', total_arboles: 0, provisional: true })).toBe(
      `Sector 2, ${TEXTOS_MAPA.sinArboles}, ${TEXTOS_MAPA.limitesProvisionales}`,
    )
  })
})
