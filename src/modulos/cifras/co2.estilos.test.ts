import { describe, expect, it } from 'vitest'
import estilosCss from './co2.estilos.css?raw'

describe('estilos de CO₂ en Cifras', () => {
  it('usa solo tokens: sin colores literales', () => {
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
  })

  it('la entrada de las barras dura lo que dice la variable y se apaga con movimiento reducido', () => {
    expect(estilosCss).toMatch(
      /animation:\s*cifras-co2-crecer var\(--cifras-co2-entrada-duracion\)/,
    )
    const reducido = estilosCss.slice(estilosCss.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reducido).toMatch(/animation:\s*none/)
  })

  it('el aviso de simulado lleva borde punteado, no solo color', () => {
    expect(estilosCss).toMatch(/\.cifras-co2__simulado\s*\{[^}]*dashed/)
  })

  it('el valor del ranking va con cifras tabulares', () => {
    expect(estilosCss).toMatch(/\.cifras-top__valor\s*\{[^}]*tabular-nums/)
  })
})
