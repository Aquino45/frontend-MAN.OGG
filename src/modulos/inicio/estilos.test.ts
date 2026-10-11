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
    expect(principal).toMatch(/transition:\s*none/)
    expect(bloqueMovimientoReducido(estilosMapa)).toMatch(/transition:\s*none/)
  })

  it('el archivo principal importa el del mapa y el de las cifras', () => {
    expect(estilosBase).toContain("@import './mapa.estilos.css'")
    expect(estilosBase).toContain("@import './cifras.estilos.css'")
    expect(estilosMapa.length).toBeGreaterThan(0)
    expect(estilosCifras.length).toBeGreaterThan(0)
  })

  it('la aparición usa los tokens de duración, curva y desplazamiento', () => {
    expect(estilosCss).toContain('var(--duracion-aparicion)')
    expect(estilosCss).toContain('var(--curva-salida)')
    expect(estilosCss).toContain('var(--desplazamiento-aparicion)')
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
