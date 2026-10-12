import { describe, expect, it } from 'vitest'
import estilosBase from './estilos.css?raw'
import estilosCifras from './cifras.estilos.css?raw'
import estilosMapa from './mapa.estilos.css?raw'

// Todo el CSS de Inicio: el principal importa los otros dos.
const estilosCss = [estilosBase, estilosMapa, estilosCifras].join('\n')

// Texto del bloque «@media (prefers-reduced-motion: reduce) { … }»
function bloqueMovimientoReducido(css: string): string {
  const inicio = css.indexOf('@media (prefers-reduced-motion: reduce)')
  if (inicio === -1) return ''
  const apertura = css.indexOf('{', inicio)
  let profundidad = 0
  for (let posicion = apertura; posicion < css.length; posicion++) {
    if (css[posicion] === '{') profundidad += 1
    if (css[posicion] === '}') profundidad -= 1
    if (profundidad === 0) return css.slice(apertura + 1, posicion)
  }
  return ''
}

describe('estilos de Inicio', () => {
  it('tiene la regla de movimiento reducido', () => {
    expect(estilosCss).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('con movimiento reducido apaga la aparición y las transiciones', () => {
    const principal = bloqueMovimientoReducido(estilosBase)
    expect(principal).toMatch(/\.inicio-aparece\s*\{\s*animation:\s*none/)
    expect(bloqueMovimientoReducido(estilosMapa)).toMatch(/transition:\s*none/)
  })

  it('el archivo principal importa el del mapa y el de las cifras', () => {
    expect(estilosBase).toContain("@import './mapa.estilos.css'")
    expect(estilosBase).toContain("@import './cifras.estilos.css'")
    expect(estilosMapa.length).toBeGreaterThan(0)
    expect(estilosCifras.length).toBeGreaterThan(0)
  })

  it('la aparición usa los tokens de duración y curva y entra desde scale 0.98', () => {
    expect(estilosCss).toContain('var(--duracion-aparicion)')
    expect(estilosCss).toContain('var(--curva-salida)')
    expect(estilosCss).toContain('scale(var(--entrada-escala-inicial))')
    expect(estilosCss).not.toContain('translateY')
  })

  it('la portada y la franja usan el display y el tracking de los tokens', () => {
    expect(estilosCss).not.toMatch(/letter-spacing:\s*-?[\d.]+(px|em)/)
    expect(estilosCss).toContain('var(--tracking-display)')
    expect(estilosCss).not.toMatch(/line-height:\s*0\.9/)
  })

  it('los botones salen del sistema: ya no hay clases «inicio-boton» ni «inicio-error»', () => {
    expect(estilosCss).not.toContain('inicio-boton')
    expect(estilosCss).not.toContain('inicio-error')
    expect(estilosCss).not.toContain('inicio-esqueleto')
  })

  it('la franja de contraste reconfigura los colores del sistema de botones', () => {
    expect(estilosBase).toMatch(/\.inicio-franja\s*\{[^}]*--boton-principal-fondo/)
    expect(estilosBase).toMatch(/\.inicio-franja\s*\{[^}]*--boton-secundario-texto/)
  })

  it('no usa colores literales ni la fuente pixel', () => {
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
    expect(estilosCss).not.toContain('--fuente-pixel')
  })

  it('los sectores y los enlaces muestran el foco', () => {
    expect(estilosCss).toMatch(/\.inicio-sector:focus-visible\s+\.inicio-sector__forma/)
    expect(estilosCss).toMatch(/\.inicio-franja\s+:focus-visible/)
  })
})

describe('escenario del árbol de la portada', () => {
  const bloque = (selector: string) => {
    const inicio = estilosBase.lastIndexOf(selector)
    return inicio < 0 ? '' : estilosBase.slice(inicio, estilosBase.indexOf('}', inicio))
  }
  const compartido = bloque('.inicio-portada__arbol::before,')
  const halo = bloque('.inicio-portada__arbol::before {')
  const suelo = bloque('.inicio-portada__arbol::after {')

  it('el árbol tiene un halo y una sombra de suelo hechos con tokens', () => {
    expect(halo).toMatch(/radial-gradient/)
    expect(halo).toMatch(/var\(--copa-magenta-oscuro\)/)
    expect(suelo).toMatch(/radial-gradient/)
    expect(suelo).toMatch(/var\(--color-sombra\)/)
    expect(halo + suelo).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
  })

  it('van detrás del árbol, sin animarse y sin atrapar clics', () => {
    expect(compartido).toMatch(/z-index:\s*-1/)
    expect(compartido).toMatch(/pointer-events:\s*none/)
    expect(compartido + halo + suelo).not.toMatch(/animation|transition/)
    expect(bloque('.inicio-portada__arbol {')).toMatch(/isolation:\s*isolate/)
  })
})
