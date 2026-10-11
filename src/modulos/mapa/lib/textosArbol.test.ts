import { describe, expect, it } from 'vitest'
import { TEXTOS_PANEL } from '@/config/constantes'
import { nombreAccesibleArbol } from './textosArbol'

describe('nombreAccesibleArbol', () => {
  it('une el código y el nombre común', () => {
    expect(
      nombreAccesibleArbol(
        { codigo: 'S01-A001', nombre_comun: 'Molle', destacado: false, motivo_destacado: null },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A001, Molle')
  })

  it('sin nombre común dice «especie sin dato»', () => {
    expect(
      nombreAccesibleArbol(
        { codigo: 'S01-A015', nombre_comun: null, destacado: false, motivo_destacado: null },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A015, especie sin dato')
  })

  it('un destacado suma «Destacado: <motivo>»', () => {
    expect(
      nombreAccesibleArbol(
        {
          codigo: 'S01-A012',
          nombre_comun: 'Huarango',
          destacado: true,
          motivo_destacado: 'Copa más amplia',
        },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A012, Huarango. Destacado: Copa más amplia')
  })

  it('un destacado sin motivo dice solo «Destacado»', () => {
    expect(
      nombreAccesibleArbol(
        {
          codigo: 'S01-A012',
          nombre_comun: 'Huarango',
          destacado: true,
          motivo_destacado: null,
        },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A012, Huarango. Destacado')
  })

  it('un árbol que no es destacado ignora el motivo', () => {
    expect(
      nombreAccesibleArbol(
        { codigo: 'S01-A001', nombre_comun: 'Molle', destacado: false, motivo_destacado: null },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A001, Molle')
  })
})
