import { describe, expect, it } from 'vitest'
import estilosCss from './destacado.estilos.css?raw'

// Todas las hojas de estilos del sitio, para comprobar que ningún nombre de animación se repite
const hojas = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true })

describe('estilos de la insignia del destacado', () => {
  it('usa solo tokens: borde fino ámbar, estrella ámbar y sombra con desplazamiento', () => {
    expect(estilosCss).toMatch(/border:\s*var\(--grosor-borde-ui\) solid var\(--punto-destacado\)/)
    expect(estilosCss).toMatch(
      /\.insignia-destacado__estrella\s*\{[^}]*fill:\s*var\(--punto-destacado\)/,
    )
    expect(estilosCss).toMatch(
      /box-shadow:\s*0 var\(--espacio-1\) var\(--espacio-2\) var\(--color-sombra\)/,
    )
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/)
  })

  it('no tiene halo ni brillo: ni animación, ni keyframes, ni sombra sin desplazamiento', () => {
    expect(estilosCss).not.toContain('@keyframes')
    expect(estilosCss).not.toContain('animation')
    expect(estilosCss).not.toContain('--destacado-brillo')
    expect(estilosCss).not.toMatch(/box-shadow:\s*0 0 /)
  })

  it('no desborda en 360 px: el texto se parte', () => {
    expect(estilosCss).toMatch(/\.insignia-destacado__motivo\s*{[^}]*overflow-wrap: anywhere/)
    expect(estilosCss).toMatch(/\.insignia-destacado__motivo\s*{[^}]*min-inline-size: 0/)
    expect(estilosCss).toMatch(/\.insignia-destacado\s*{[^}]*flex-wrap: wrap/)
  })

  it('el nombre de cada animación es único en todo el sitio', () => {
    const nombres = Object.values(hojas).flatMap((css) =>
      [...String(css).matchAll(/@keyframes\s+([\w-]+)/g)].map((coincidencia) => coincidencia[1]),
    )
    expect(new Set(nombres).size).toBe(nombres.length)
  })
})
