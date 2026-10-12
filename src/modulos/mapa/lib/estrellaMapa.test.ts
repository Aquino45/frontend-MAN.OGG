import { describe, expect, it } from 'vitest'
import { verticesDeEstrella } from './estrellaMapa'

describe('verticesDeEstrella', () => {
  const centro = { x: 10, y: 10 }
  const vertices = verticesDeEstrella(centro, 8, 0.4, 5)

  it('una estrella de 5 puntas tiene 10 vértices, alternando punta y valle', () => {
    expect(vertices).toHaveLength(10)
    const distancia = (v: { x: number; y: number }) => Math.hypot(v.x - centro.x, v.y - centro.y)
    vertices.forEach((vertice, indice) => {
      expect(distancia(vertice)).toBeCloseTo(indice % 2 === 0 ? 8 : 3.2, 5)
    })
  })

  it('la primera punta apunta hacia arriba', () => {
    expect(vertices[0].x).toBeCloseTo(10, 5)
    expect(vertices[0].y).toBeCloseTo(2, 5)
  })

  it('es simétrica de izquierda a derecha', () => {
    const lado = (indice: number) => vertices[indice]
    expect(lado(1).x - centro.x).toBeCloseTo(centro.x - lado(9).x, 5)
    expect(lado(2).x - centro.x).toBeCloseTo(centro.x - lado(8).x, 5)
    expect(lado(1).y).toBeCloseTo(lado(9).y, 5)
  })
})
