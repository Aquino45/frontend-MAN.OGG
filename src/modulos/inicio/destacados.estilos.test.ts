import { describe, expect, it } from 'vitest'
import estilosBase from './estilos.css?raw'
import estilosCss from './destacados.estilos.css?raw'
import movimientoCss from '@/styles/movimiento.tokens.css?raw'

// Cuerpo de la primera regla cuyo selector es exactamente `selector`
function reglaDe(selector: string): string {
  const inicio = estilosCss.indexOf(`${selector} {`)
  if (inicio === -1) return ''
  return estilosCss.slice(estilosCss.indexOf('{', inicio), estilosCss.indexOf('}', inicio))
}

describe('estilos del bloque de destacados', () => {
  it('el archivo principal de Inicio lo importa', () => {
    expect(estilosBase).toContain("@import './destacados.estilos.css'")
  })

  it('las tarjetas son planas: superficie de tarjeta, radio 16 y sin sombra', () => {
    const tarjeta = reglaDe('.destacado-tarjeta')
    expect(tarjeta).toMatch(/background:\s*var\(--color-tarjeta\)/)
    expect(tarjeta).toMatch(/border-radius:\s*var\(--radio-tarjeta\)/)
    expect(tarjeta).not.toMatch(/box-shadow/)
    expect(tarjeta).toMatch(/min-block-size:\s*var\(--tamano-control\)/)
  })

  it('el hover está protegido y el activo escala 0.97', () => {
    expect(estilosCss).toContain('@media (hover: hover) and (pointer: fine)')
    expect(estilosCss).toMatch(
      /\.destacado-tarjeta:active\s*\{[^}]*scale\(var\(--escala-activo\)\)/,
    )
  })

  it('a 360 px va en una columna y en pantallas anchas en grilla', () => {
    expect(reglaDe('.inicio-destacados__lista')).toMatch(
      /grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(100%,/,
    )
  })

  it('nada se sale de la pantalla: min-width 0 y textos que se parten', () => {
    expect(reglaDe('.inicio-destacados__item')).toMatch(/min-inline-size:\s*0/)
    expect(reglaDe('.destacado-tarjeta')).toMatch(/min-inline-size:\s*0/)
    for (const selector of [
      '.destacado-tarjeta__nombre',
      '.destacado-tarjeta__cientifico',
      '.destacado-tarjeta__ubicacion',
    ]) {
      expect(reglaDe(selector), selector).toMatch(/overflow-wrap:\s*anywhere/)
    }
  })

  it('el nombre científico va en cursiva, las medidas con números tabulares y la estrella ámbar fija', () => {
    expect(reglaDe('.destacado-tarjeta__cientifico')).toMatch(/font-style:\s*italic/)
    expect(reglaDe('.destacado-tarjeta__valor')).toMatch(/tabular-nums/)
    expect(reglaDe('.destacado-tarjeta__estrella')).toMatch(/fill:\s*var\(--punto-destacado\)/)
  })

  it('usa solo tokens: sin colores literales ni fuente pixel', () => {
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
    expect(estilosCss).not.toContain('--fuente-pixel')
  })

  it('las tarjetas entran escalonadas (40 a 60 ms) solo con opacidad y transform, una vez', () => {
    expect(estilosCss).toMatch(
      /@keyframes inicio-destacado-entra\s*\{\s*from\s*\{[^}]*opacity:\s*0/,
    )
    expect(estilosCss).not.toMatch(
      /inicio-destacado-entra[^}]*(scale|rotate|height|width|top|left)/,
    )
    expect(estilosCss).toContain("[data-visible='true']")
    expect(estilosCss).toContain('var(--retraso-escalonado-destacado)')
    const retraso = Number(/--retraso-escalonado-destacado:\s*(\d+)ms/.exec(movimientoCss)?.[1])
    expect(retraso).toBeGreaterThanOrEqual(40)
    expect(retraso).toBeLessThanOrEqual(60)
  })

  it('el título del bloque no dibuja anillo de foco', () => {
    expect(estilosCss).toMatch(/\.inicio-destacados__titulo:focus\s*\{[^}]*outline:\s*none/)
  })
})
