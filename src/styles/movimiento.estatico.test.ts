import { describe, expect, it } from 'vitest'
import baseCss from './base.estilos.css?raw'
import movimientoCss from './movimiento.tokens.css?raw'

// Todas las hojas del sitio, con su ruta.
const hojas = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true })
const entradas = Object.entries(hojas) as [string, string][]

// Quita los comentarios: las reglas se leen sin ellos.
const sinComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

function hojasQueCumplen(patron: RegExp): string[] {
  return entradas.filter(([, css]) => patron.test(sinComentarios(css))).map(([ruta]) => ruta)
}

describe('reglas de movimiento en todos los CSS', () => {
  it('hay hojas que revisar', () => {
    expect(entradas.length).toBeGreaterThan(15)
  })

  it('ninguna usa «transition: all»', () => {
    expect(hojasQueCumplen(/transition(-property)?\s*:\s*all\b/)).toEqual([])
  })

  it('ninguna usa «ease-in» suelto (ease-in-out sí vale)', () => {
    expect(hojasQueCumplen(/(?<![\w-])ease-in(?![\w-])/)).toEqual([])
  })

  it('ninguna parte de «scale(0)»', () => {
    expect(hojasQueCumplen(/(?<![\w-])scale\(\s*0\s*\)/)).toEqual([])
  })

  it('ninguna deja «will-change» permanente', () => {
    expect(hojasQueCumplen(/will-change\s*:/)).toEqual([])
  })
})

describe('movimiento por teclado', () => {
  it('con la entrada por teclado no corre ninguna transición ni animación', () => {
    const css = sinComentarios(baseCss)
    const bloque = css.match(/:root\[data-entrada='teclado'\][^{]*\{([^}]*)\}/)?.[1] ?? ''
    expect(bloque).toMatch(/transition-duration:\s*0s\s*!important/)
    expect(bloque).toMatch(/animation-duration:\s*0s\s*!important/)
    expect(bloque).toMatch(/animation-delay:\s*0s\s*!important/)
  })
})

describe('tokens de movimiento', () => {
  it('la UI queda por debajo de 300 ms (solo los gráficos, que son presentación, pueden pasarse)', () => {
    const duraciones = [
      ...sinComentarios(movimientoCss).matchAll(/--duracion-([a-z-]+):\s*(\d+)ms/g),
    ]
    expect(duraciones.length).toBeGreaterThan(8)
    for (const [, nombre, milisegundos] of duraciones) {
      if (nombre === 'grafico') continue
      expect(Number(milisegundos), nombre).toBeLessThan(300)
    }
  })

  it('define los tokens nuevos', () => {
    for (const token of [
      '--duracion-menu',
      '--duracion-fundido',
      '--duracion-pagina',
      '--duracion-grafico',
      '--retraso-escalonado-grafico',
    ]) {
      expect(movimientoCss).toContain(`${token}:`)
    }
  })

  it('no queda el token de presión duplicado', () => {
    expect(movimientoCss).not.toContain('--escala-presion')
  })
})
