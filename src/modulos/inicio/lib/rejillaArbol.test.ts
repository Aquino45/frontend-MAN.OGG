import { describe, expect, it } from 'vitest'
import {
  celdasDeLaSilueta,
  FILAS_COPA,
  LADO_REJILLA_ARBOL,
  ORIGENES_HOJA,
  PASOS_TRONCO,
  TRONCO,
} from './rejillaArbol'

// Silueta del glifo de 12 x 12 de la paleta: [x, y, ancho, alto, parte]
const GLIFO_12 = [
  [3, 0, 6, 1, 'copa-alta'],
  [1, 1, 10, 2, 'copa-alta'],
  [0, 3, 12, 2, 'copa-media'],
  [1, 5, 10, 2, 'copa-baja'],
  [3, 7, 6, 1, 'copa-baja'],
  [5, 8, 2, 4, 'tronco'],
] as const

function bandaDelGlifo(filaGlifo: number) {
  return GLIFO_12.find(([, y, , alto]) => filaGlifo >= y && filaGlifo < y + alto)
}

describe('rejilla del árbol', () => {
  it('conserva la silueta del glifo de 12 x 12, al doble de resolución', () => {
    const esperadas = new Set<string>()
    for (const [x, y, ancho, alto] of GLIFO_12) {
      for (let celdaY = y * 2; celdaY < (y + alto) * 2; celdaY++) {
        for (let celdaX = x * 2; celdaX < (x + ancho) * 2; celdaX++) {
          esperadas.add(`${celdaX},${celdaY}`)
        }
      }
    }
    expect(celdasDeLaSilueta()).toEqual(esperadas)
  })

  it('cada fila de la copa conserva el tono de su banda en el glifo', () => {
    for (const { y, tramo } of FILAS_COPA) {
      expect(tramo.parte, `fila ${y}`).toBe(bandaDelGlifo(Math.floor(y / 2))?.[4])
    }
  })

  it('tiene 16 filas de copa y un tronco que se parte en pasos iguales', () => {
    expect(FILAS_COPA).toHaveLength(16)
    expect(TRONCO.alto % PASOS_TRONCO).toBe(0)
    expect(TRONCO.y + TRONCO.alto).toBe(LADO_REJILLA_ARBOL)
  })

  it('las motas caen dentro de su fila y no salen de la silueta', () => {
    for (const { y, tramo, motas } of FILAS_COPA) {
      for (const mota of motas) {
        expect(mota.x, `fila ${y}`).toBeGreaterThanOrEqual(tramo.x)
        expect(mota.x, `fila ${y}`).toBeLessThan(tramo.x + tramo.ancho)
      }
    }
  })

  it('las hojas nacen dentro de la copa', () => {
    const celdas = celdasDeLaSilueta()
    for (const [x, y] of ORIGENES_HOJA) expect(celdas.has(`${x},${y}`)).toBe(true)
  })
})
