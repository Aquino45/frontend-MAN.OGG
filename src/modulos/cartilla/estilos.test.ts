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

  it('la insignia del destacado usa solo tokens y su brillo entra con ease-out', () => {
    const bloque = estilosCss.slice(estilosCss.indexOf('.insignia-destacado {'))
    expect(bloque).toContain('var(--punto-destacado)')
    expect(bloque).toContain('var(--punto-destacado-borde)')
    expect(bloque).toContain('var(--destacado-brillo-duracion)')
    expect(bloque).toContain('var(--curva-salida)')
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('el brillo de la insignia se desactiva con movimiento reducido', () => {
    const reducido = estilosCss.slice(estilosCss.lastIndexOf('prefers-reduced-motion: reduce'))
    expect(reducido).toContain('.insignia-destacado')
  })

  it('la insignia no desborda en 360 px: el texto se parte', () => {
    expect(estilosCss).toMatch(/\.insignia-destacado__motivo\s*{[^}]*overflow-wrap: anywhere/)
  })
})
