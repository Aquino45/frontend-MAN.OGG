import { describe, expect, it } from 'vitest'
import estilosCss from './estilos.css?raw'

// Cuerpo de la primera regla cuyo selector es exactamente `selector`
function reglaDe(selector: string): string {
  const inicio = estilosCss.indexOf(`${selector} {`)
  if (inicio === -1) return ''
  return estilosCss.slice(estilosCss.indexOf('{', inicio), estilosCss.indexOf('}', inicio))
}

describe('estilos de Explorar', () => {
  it('los controles miden al menos 44 px y usan solo tokens', () => {
    expect(reglaDe('.explorar-control')).toMatch(/min-block-size:\s*var\(--tamano-control\)/)
    expect(reglaDe('.explorar-casilla')).toMatch(/min-block-size:\s*var\(--tamano-control\)/)
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
    expect(estilosCss).not.toContain('--fuente-pixel')
  })

  it('una columna a 360 px y grilla en pantallas anchas', () => {
    expect(reglaDe('.explorar__lista')).toMatch(
      /grid-template-columns:\s*repeat\(auto-fill, minmax\(min\(100%,/,
    )
    expect(reglaDe('.explorar-filtros')).toMatch(/repeat\(auto-fit, minmax\(min\(100%,/)
  })

  it('nada se sale de la pantalla: min-width 0 y textos que se parten', () => {
    for (const selector of ['.explorar-campo', '.explorar__item', '.explorar-fila__cuerpo']) {
      expect(reglaDe(selector), selector).toMatch(/min-inline-size:\s*0/)
    }
    for (const selector of [
      '.explorar-fila__nombre',
      '.explorar-fila__cientifico',
      '.explorar-fila__ubicacion',
      '.explorar__titulo',
    ]) {
      expect(reglaDe(selector), selector).toMatch(/overflow-wrap:\s*anywhere/)
    }
  })

  it('las filas son tarjetas planas con hover protegido y activo 0.97', () => {
    const fila = reglaDe('.explorar-fila')
    expect(fila).toMatch(/background:\s*var\(--color-tarjeta\)/)
    expect(fila).toMatch(/border-radius:\s*var\(--radio-tarjeta\)/)
    expect(fila).not.toMatch(/box-shadow/)
    expect(estilosCss).toContain('@media (hover: hover) and (pointer: fine)')
    expect(estilosCss).toMatch(/\.explorar-fila:active\s*\{[^}]*scale\(var\(--escala-activo\)\)/)
  })

  it('el nombre científico va en cursiva y los números alineados', () => {
    expect(reglaDe('.explorar-fila__cientifico')).toMatch(/font-style:\s*italic/)
    expect(reglaDe('.explorar__contador')).toMatch(/tabular-nums/)
  })
})
