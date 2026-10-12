import { describe, expect, it } from 'vitest'
import movimientoTokens from '@/styles/movimiento.tokens.css?raw'
import barrasCss from './barras.estilos.css?raw'
import donasCss from './donas.estilos.css?raw'
import graficosParte1 from './graficos.estilos.css?raw'
import tableroParte1 from './tablero.estilos.css?raw'
import tarjetasCss from './tarjetas.estilos.css?raw'

// Cada parte se revisa sola; las reglas que cruzan partes se buscan en el conjunto
const tableroCss = tableroParte1 + tarjetasCss
const graficosCss = graficosParte1 + donasCss + barrasCss

const HOJAS = {
  'tablero.estilos.css': tableroParte1,
  'tarjetas.estilos.css': tarjetasCss,
  'graficos.estilos.css': graficosParte1,
  'donas.estilos.css': donasCss,
  'barras.estilos.css': barrasCss,
}

// Cuerpo de las animaciones @keyframes de un archivo
function propiedadesAnimadas(css: string): string[] {
  const cuerpos = [...css.matchAll(/@keyframes [\w-]+\s*\{([\s\S]*?\n\})\n/g)].map(
    ([, cuerpo]) => cuerpo,
  )
  return cuerpos.flatMap((cuerpo) =>
    [...cuerpo.matchAll(/([\w-]+)\s*:/g)].map(([, nombre]) => nombre),
  )
}

describe('estilos del tablero', () => {
  it('al filtrar, el fundido dura entre 200 y 300 ms', () => {
    const duracion = movimientoTokens.match(/--duracion-filtro:\s*(\d+)ms/)
    expect(duracion).not.toBeNull()
    expect(Number(duracion?.[1])).toBeGreaterThanOrEqual(200)
    expect(Number(duracion?.[1])).toBeLessThanOrEqual(300)
    expect(tableroCss).toMatch(/\.tablero-aparece\s*\{[^}]*var\(--duracion-filtro\)/)
    expect(graficosCss).toMatch(/\.tablero-punto\s*\{[^}]*var\(--duracion-filtro\)/)
    expect(graficosCss).toMatch(/\.tablero-barra\s*\{[^}]*var\(--duracion-filtro\)/)
  })

  it.each(Object.entries(HOJAS))('%s: ninguna duración ni color está escrito a mano', (_, css) => {
    expect(css).not.toMatch(/\d(ms|s)\b(?!\))/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
  })

  it.each(Object.entries(HOJAS))('%s: solo anima opacity, transform y clip-path', (_, css) => {
    const permitidas = new Set(['opacity', 'transform', 'clip-path', 'from', 'to'])
    for (const propiedad of propiedadesAnimadas(css)) expect(permitidas).toContain(propiedad)
    // Y las transiciones nombran sus propiedades, siempre entre esas
    for (const [, lista] of css.matchAll(/transition:\s*([^;]+);/g)) {
      for (const parte of lista.split(',')) {
        const propiedad = parte.trim().split(/\s+/)[0]
        expect(['transform', 'opacity', 'background-color']).toContain(propiedad)
      }
    }
  })

  it.each(Object.entries(HOJAS))('%s: nada de transition: all ni de ease-in', (_, css) => {
    expect(css).not.toMatch(/transition:\s*all/)
    expect(css).not.toMatch(/\bease-in\b/)
  })

  it.each(Object.entries(HOJAS))('%s: el :hover va solo con puntero fino', (_, css) => {
    const sinMedia = css.replace(
      /@media \(hover: hover\) and \(pointer: fine\)\s*\{[\s\S]*?\n\}\n/g,
      '',
    )
    expect(sinMedia).not.toMatch(/:hover/)
  })

  it('la paleta de series sale solo de tokens: carmín, destacado, magenta oscuro, magenta y tenue', () => {
    for (const token of [
      '--copa-carmin',
      '--punto-destacado',
      '--copa-magenta-oscuro',
      '--copa-magenta',
      '--color-texto-tenue',
    ]) {
      expect(tableroCss).toContain(`var(${token})`)
    }
    for (const indice of [0, 1, 2, 3, 4]) expect(tableroCss).toContain(`data-serie='${indice}'`)
  })

  it('en el celular el resumen va en 2 columnas y desde 48rem en 3', () => {
    expect(tableroCss).toMatch(/\.tablero-kpis\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(tableroCss).toMatch(
      /@media \(width >= 48rem\)\s*\{\s*\.tablero-kpis\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/,
    )
  })

  it('los gráficos se apilan en el celular y van de a dos desde 64rem', () => {
    expect(tableroCss).toMatch(/\.tablero-fila\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
    expect(tableroCss).toMatch(
      /@media \(width >= 64rem\)\s*\{\s*\.tablero-fila\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/,
    )
  })

  it('los controles miden al menos 44 px de alto (--tamano-control)', () => {
    expect(tableroCss).toMatch(
      /\.tablero-segmento button\s*\{[^}]*min-block-size:\s*var\(--tamano-control\)/,
    )
    expect(graficosCss).toMatch(
      /\.tablero-leyenda__fila--boton\s*\{[^}]*min-block-size:\s*var\(--tamano-control\)/,
    )
  })

  it('campo y ejemplo se distinguen por el borde punteado y no solo por el color', () => {
    expect(graficosCss).toMatch(
      /\.tablero-punto\[data-ejemplo='si'\] circle\s*\{[^}]*stroke-dasharray/,
    )
    expect(graficosCss).toMatch(/\.tablero-barra--ejemplo\s*\{[^}]*stroke-dasharray/)
    expect(graficosCss).toMatch(/\.tablero-estados__segmento\[data-ejemplo='si'\]\s*\{[^}]*dashed/)
  })

  it('el histograma crece desde la base y su borde punteado no se estira al escalar', () => {
    expect(graficosCss).toMatch(/\.tablero-barra\s*\{[^}]*transform-origin:\s*50% 100%/)
    expect(graficosCss).toMatch(/\.tablero-barra--ejemplo\s*\{[^}]*non-scaling-stroke/)
  })

  it('los estados usan los tokens de estado', () => {
    for (const estado of ['bueno', 'regular', 'malo', 'otro']) {
      expect(graficosCss).toContain(`var(--estado-${estado}-fondo)`)
      expect(graficosCss).toContain(`var(--estado-${estado}-texto)`)
    }
  })
})
