import { describe, expect, it } from 'vitest'
import estilosCss from './estilos.css?raw'

describe('estilos de la cartilla', () => {
  it('los indicadores pasan a una columna en un panel angosto', () => {
    expect(estilosCss).toMatch(/@container \(max-width: [\d.]+rem\)/)
  })

  it('el escalonado de los bloques se desactiva con movimiento reducido', () => {
    const reducido = estilosCss.slice(estilosCss.indexOf('prefers-reduced-motion: reduce'))
    expect(reducido).toContain('.cartilla > *')
    expect(reducido).toContain('animation: none')
  })
})
