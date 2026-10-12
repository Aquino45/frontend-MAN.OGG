import { describe, expect, it } from 'vitest'
import estilosCss from './estilos.css?raw'

// Cuerpo de la primera regla cuyo selector es exactamente `selector`
function reglaDe(selector: string): string {
  const inicio = estilosCss.indexOf(`${selector} {`)
  if (inicio === -1) return ''
  return estilosCss.slice(estilosCss.indexOf('{', inicio), estilosCss.indexOf('}', inicio))
}

describe('estilos de Cifras', () => {
  it('usa solo tokens: sin colores literales ni fuente pixel', () => {
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
    expect(estilosCss).not.toContain('--fuente-pixel')
  })

  it('campo y ejemplo se distinguen por relleno liso y rayado, no solo por color', () => {
    expect(estilosCss).toMatch(
      /\.cifras-grafico__campo\s*\{[^}]*background:\s*var\(--grafico-campo\)/,
    )
    expect(estilosCss).toMatch(/\.cifras-grafico__ejemplo\s*\{[^}]*repeating-linear-gradient/)
  })

  it('la tabla se desplaza dentro de su recuadro y no desborda la página', () => {
    expect(reglaDe('.cifras-tabla')).toMatch(/overflow-x:\s*auto/)
    expect(reglaDe('.cifras-tabla')).toMatch(/max-inline-size:\s*100%/)
    expect(reglaDe('.cifras-bloque')).toMatch(/min-inline-size:\s*0/)
  })

  it('una columna a 360 px y grilla de bloques en pantallas anchas', () => {
    expect(reglaDe('.cifras__bloques')).toMatch(/repeat\(auto-fit, minmax\(min\(100%,/)
  })

  it('los números van tabulares', () => {
    expect(estilosCss).toMatch(/\.cifras-tabla__numero\s*\{[^}]*tabular-nums/)
    expect(reglaDe('.cifras-grafico__valores')).toMatch(/tabular-nums/)
  })

  it('sin animaciones propias: nada que apagar con movimiento reducido', () => {
    expect(estilosCss).not.toContain('@keyframes')
    expect(estilosCss).not.toContain('animation')
    expect(estilosCss).not.toContain('transition')
  })
})
