import { describe, expect, it } from 'vitest'
import estilosCo2 from './co2.estilos.css?raw'

describe('estilos de la etiqueta «Simulado» de la cartilla', () => {
  it('lleva borde punteado, para que se distinga también sin color', () => {
    expect(estilosCo2).toMatch(/\.bloque-co2__simulado \{[^}]*border:[^;]*dashed/)
  })

  it('en un panel angosto la columna de captura y su etiqueta se alinean al inicio', () => {
    const angosto = estilosCo2.slice(estilosCo2.indexOf('@container'))
    expect(angosto).toMatch(/\.bloque-co2__columna--derecha \{[^}]*text-align:\s*start/)
    expect(angosto).toMatch(/\.bloque-co2__simulado \{[^}]*align-self:\s*flex-start/)
  })

  it('la hoja cabe en ~300 líneas', () => {
    expect(estilosCo2.split('\n').length).toBeLessThanOrEqual(300)
  })
})
