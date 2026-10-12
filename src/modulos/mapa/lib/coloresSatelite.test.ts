import { describe, expect, it } from 'vitest'
import { leerColoresSatelite } from './coloresSatelite'

describe('leerColoresSatelite', () => {
  it('lee cada color de su token y le quita los espacios', () => {
    const valores: Record<string, string> = {
      '--mapa-borde': ' rojo ',
      '--mapa-relleno-resaltado': 'verde',
      '--punto-relleno': 'azul',
      '--punto-borde': 'negro',
      '--punto-destacado': 'ambar',
    }
    expect(leerColoresSatelite((nombre) => valores[nombre])).toEqual({
      borde: 'rojo',
      relleno: 'verde',
      puntoRelleno: 'azul',
      puntoBorde: 'negro',
      puntoDestacado: 'ambar',
    })
  })
})
