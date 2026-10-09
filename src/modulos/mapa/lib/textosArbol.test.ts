import { describe, expect, it } from 'vitest'
import { TEXTOS_PANEL } from '@/config/constantes'
import { nombreAccesibleArbol } from './textosArbol'

describe('nombreAccesibleArbol', () => {
  it('une el código y el nombre común', () => {
    expect(
      nombreAccesibleArbol(
        { codigo: 'S01-A001', nombre_comun: 'Molle' },
        TEXTOS_PANEL.sinNombreComun,
      ),
    ).toBe('S01-A001, Molle')
  })

  it('sin nombre común dice «especie sin dato»', () => {
    expect(
      nombreAccesibleArbol({ codigo: 'S01-A015', nombre_comun: null }, TEXTOS_PANEL.sinNombreComun),
    ).toBe('S01-A015, especie sin dato')
  })
})
