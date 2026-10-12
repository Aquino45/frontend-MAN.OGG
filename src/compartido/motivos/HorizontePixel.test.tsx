import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HORIZONTE_CELDA_PX } from '@/config/constantes'
import motivosCss from '@/styles/motivos.estilos.css?raw'
import {
  ALTO_HORIZONTE,
  ANCHO_HORIZONTE,
  TRAZO_HORIZONTE,
  TRAZO_SOMBRA_HORIZONTE,
} from './dibujoHorizonte'
import { HorizontePixel } from './HorizontePixel'

// Cada tramo del trazo es «M x y h ancho v1 h -ancho z»
function celdasDe(trazo: string): Set<string> {
  const celdas = new Set<string>()
  for (const [, x, y, ancho] of trazo.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let columna = 0; columna < Number(ancho); columna++) {
      celdas.add(`${Number(x) + columna},${y}`)
    }
  }
  return celdas
}

describe('horizonte de copa: el dibujo', () => {
  const principal = celdasDe(TRAZO_HORIZONTE)
  const sombra = celdasDe(TRAZO_SOMBRA_HORIZONTE)

  it('mide de 16 a 24 px de alto y no se repite antes de 600 px', () => {
    expect(ALTO_HORIZONTE * HORIZONTE_CELDA_PX).toBeGreaterThanOrEqual(16)
    expect(ALTO_HORIZONTE * HORIZONTE_CELDA_PX).toBeLessThanOrEqual(24)
    expect(ANCHO_HORIZONTE * HORIZONTE_CELDA_PX).toBeGreaterThanOrEqual(600)
  })

  it('la celda es más fina que la del árbol y de px enteros (3 o 4)', () => {
    expect(Number.isInteger(HORIZONTE_CELDA_PX)).toBe(true)
    expect(HORIZONTE_CELDA_PX).toBeGreaterThanOrEqual(3)
    expect(HORIZONTE_CELDA_PX).toBeLessThanOrEqual(4)
  })

  it('es un borde continuo: todas las columnas tienen la fila de abajo', () => {
    for (let columna = 0; columna < ANCHO_HORIZONTE; columna++) {
      expect(principal.has(`${columna},${ALTO_HORIZONTE - 1}`), `columna ${columna}`).toBe(true)
    }
  })

  it('tiene lóbulos de 3 alturas distintas como mínimo', () => {
    const alturas = new Set<number>()
    for (let columna = 0; columna < ANCHO_HORIZONTE; columna++) {
      let altura = 0
      for (let fila = 0; fila < ALTO_HORIZONTE; fila++)
        if (principal.has(`${columna},${fila}`)) altura++
      alturas.add(altura)
    }
    expect(alturas.size).toBeGreaterThanOrEqual(3)
  })

  it('la sombra es la misma silueta corrida una celda hacia arriba y cabe en la rejilla', () => {
    for (const celda of principal) {
      const [x, y] = celda.split(',').map(Number)
      expect(sombra.has(`${x},${y - 1}`)).toBe(true)
    }
    for (const celda of sombra) expect(Number(celda.split(',')[1])).toBeGreaterThanOrEqual(0)
  })
})

describe('HorizontePixel', () => {
  it('es decorativo, usa un patrón que se repite y lleva el fondo que se le da', () => {
    const { container } = render(<HorizontePixel fondo="var(--franja-cifras-fondo)" />)
    const svg = container.querySelector('svg') as SVGElement
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('height', String(ALTO_HORIZONTE * HORIZONTE_CELDA_PX))
    expect(svg.style.getPropertyValue('--horizonte-fondo')).toBe('var(--franja-cifras-fondo)')
    expect(container.querySelector('pattern')).toHaveAttribute(
      'patternTransform',
      `scale(${HORIZONTE_CELDA_PX})`,
    )
    expect(container.querySelectorAll('path')).toHaveLength(2)
  })
})

describe('estilos del horizonte', () => {
  it('el fondo es el de la sección que sigue y la sombra es magenta oscuro, ambos por token', () => {
    expect(motivosCss).toMatch(/\.horizonte-pixel__fondo\s*\{\s*fill:\s*var\(--horizonte-fondo\)/)
    expect(motivosCss).toMatch(
      /\.horizonte-pixel__sombra\s*\{\s*fill:\s*var\(--copa-magenta-oscuro\)/,
    )
    expect(motivosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
    expect(motivosCss).not.toContain('--fuente-pixel')
  })

  it('no se anima', () => {
    expect(motivosCss).not.toMatch(/@keyframes|animation|transition/)
  })
})
