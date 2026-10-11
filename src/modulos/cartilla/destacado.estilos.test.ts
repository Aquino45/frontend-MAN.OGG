import { describe, expect, it } from 'vitest'
import estilosCss from './destacado.estilos.css?raw'

// Todas las hojas de estilos del sitio, para comprobar que ningún brillo comparte nombre con otro
const hojas = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true })

describe('estilos de la insignia del destacado', () => {
  it('usa solo tokens y su brillo entra con ease-out', () => {
    expect(estilosCss).toContain('var(--punto-destacado)')
    expect(estilosCss).toContain('var(--punto-destacado-borde)')
    expect(estilosCss).toContain('var(--destacado-brillo-duracion)')
    expect(estilosCss).toContain('var(--curva-salida)')
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/)
  })

  it('el brillo se desactiva con movimiento reducido', () => {
    const reducido = estilosCss.slice(estilosCss.lastIndexOf('prefers-reduced-motion: reduce'))
    expect(reducido).toContain('.insignia-destacado')
    expect(reducido).toContain('animation: none')
  })

  it('no desborda en 360 px: el texto se parte', () => {
    expect(estilosCss).toMatch(/\.insignia-destacado__motivo\s*{[^}]*overflow-wrap: anywhere/)
  })

  it('el nombre de cada animación es único en todo el sitio', () => {
    const nombres = Object.values(hojas).flatMap((css) =>
      [...String(css).matchAll(/@keyframes\s+([\w-]+)/g)].map((coincidencia) => coincidencia[1]),
    )
    expect(new Set(nombres).size).toBe(nombres.length)
  })
})
