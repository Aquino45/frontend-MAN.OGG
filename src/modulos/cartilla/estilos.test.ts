import { describe, expect, it } from 'vitest'
import estilosBase from './estilos.css?raw'
import estilosBloques from './indicadores.estilos.css?raw'

// Toda la hoja de la cartilla: la base y la de indicadores y bloques
const estilosCss = [estilosBase, estilosBloques].join('\n')

// Cuerpo de la primera regla cuyo selector es exactamente `selector`
function reglaDe(selector: string): string {
  const inicio = estilosCss.indexOf(`${selector} {`)
  if (inicio === -1) return ''
  return estilosCss.slice(estilosCss.indexOf('{', inicio), estilosCss.indexOf('}', inicio))
}

describe('estilos de la cartilla', () => {
  it('los indicadores pasan a una columna en un panel angosto', () => {
    expect(estilosCss).toMatch(/@container \(max-width: [\d.]+rem\)/)
  })

  it('con movimiento reducido el escalonado se apaga', () => {
    const reducido = estilosCss.slice(estilosCss.lastIndexOf('prefers-reduced-motion: reduce'))
    expect(reducido).toContain('.cartilla > *')
    expect(reducido).toContain('animation: none')
  })

  it('cada hoja cabe en ~300 líneas', () => {
    expect(estilosBase.split('\n').length).toBeLessThanOrEqual(300)
    expect(estilosBloques.split('\n').length).toBeLessThanOrEqual(300)
  })
})

// Estos tests leen el CSS; la comprobación visual a 360 px de S02-D002 (claro y oscuro)
// la hace el orquestador con el navegador.
describe('cartilla a 360 px: reglas que evitan el desborde', () => {
  it('la franja del código puede pasar a 2 líneas', () => {
    expect(reglaDe('.cartilla__franja')).toMatch(/flex-wrap:\s*wrap/)
  })

  it('código, sector, chip de estado y nombres se parten en vez de desbordar', () => {
    for (const selector of [
      '.cartilla__codigo',
      '.cartilla__sector',
      '.chip-estado',
      '.chip',
      '.encabezado-arbol__nombre',
      '.encabezado-arbol__cientifico',
      '.estados-arbol__valor',
      '.tarjeta__valor',
    ]) {
      expect(reglaDe(selector), selector).toMatch(/overflow-wrap:\s*anywhere/)
    }
  })

  it('los hijos de flex y grid pueden encogerse (min-width: 0)', () => {
    for (const selector of [
      '.cartilla__codigo',
      '.cartilla__sector',
      '.tarjeta',
      '.estados-arbol__campo',
      '.bloque-co2__columna',
      '.indicador-dap__dato',
      '.indicador-copa__valores',
      '.foto-arbol__estado',
    ]) {
      expect(reglaDe(selector), selector).toMatch(/min-inline-size:\s*0/)
    }
  })

  it('el chip de estado no se sale de la foto', () => {
    expect(reglaDe('.foto-arbol__estado')).toMatch(/max-inline-size:\s*calc\(/)
  })

  it('el valor de la copa puede partirse', () => {
    expect(reglaDe('.indicador-copa__valor')).not.toMatch(/white-space:\s*nowrap/)
  })
})

describe('cartilla: sistema de diseño', () => {
  it('sin valores sueltos: tracking en px, gap de 2 px, 12rem ni multiplicadores', () => {
    expect(estilosCss).not.toMatch(/letter-spacing:\s*-?\d+px/)
    expect(estilosCss).not.toMatch(/gap:\s*2px/)
    expect(estilosCss).not.toContain('12rem')
    expect(estilosCss).not.toMatch(/calc\(var\(--texto-cartilla-valor\)/)
  })

  it('el «Sin dato» del bloque de CO₂ toma el color del texto del bloque', () => {
    expect(estilosCss).toMatch(/\.bloque-co2 \.sin-dato\s*\{[^}]*color:\s*var\(--color-co2-texto\)/)
  })

  it('el título que recibe el foco por programa no dibuja anillo', () => {
    expect(estilosCss).not.toMatch(/\.encabezado-arbol__nombre:focus-visible/)
    expect(reglaDe('.encabezado-arbol__nombre:focus')).toMatch(/outline:\s*none/)
  })

  it('radios: tarjetas y cartilla 16, chips 4; los bloques entran desde scale 0.98 en 200 ms', () => {
    expect(reglaDe('.cartilla')).toMatch(/border-radius:\s*var\(--radio-tarjeta\)/)
    expect(reglaDe('.tarjeta')).toMatch(/border-radius:\s*var\(--radio-tarjeta\)/)
    expect(reglaDe('.chip')).toMatch(/border-radius:\s*var\(--radio-chip\)/)
    expect(estilosCss).toMatch(/scale\(var\(--entrada-escala-inicial\)\)/)
    expect(estilosCss).toMatch(/animation:\s*entrada-bloque var\(--duracion-entrada\)/)
    expect(estilosCss).not.toMatch(/translateY/)
  })

  it('las cifras de la cartilla usan números tabulares', () => {
    expect(estilosCss).toMatch(/tabular-nums/)
  })
})
