// Dibujo del árbol de la portada sobre una rejilla de 24 x 24 celdas. Conserva la silueta del
// glifo de 12 x 12 (cada pixel de aquel son 2 x 2 celdas) y le suma una textura fina.
// Es dato del dibujo: no sabe nada de animación.

export const LADO_REJILLA_ARBOL = 24
// Punto sobre el que pivotan la copa y el tronco: donde la copa se apoya en el tronco
export const PIVOTE_COPA = { x: 12, y: 16 } as const
export const BASE_TRONCO_Y = 24

export type ParteArbol = 'copa-alta' | 'copa-media' | 'copa-baja' | 'tronco'

// Bandas de la silueta: [x, y, ancho, alto, parte], en celdas
const BANDAS_COPA = [
  [6, 0, 12, 2, 'copa-alta'],
  [2, 2, 20, 4, 'copa-alta'],
  [0, 6, 24, 4, 'copa-media'],
  [2, 10, 20, 4, 'copa-baja'],
  [6, 14, 12, 2, 'copa-baja'],
] as const

export const TRONCO = { x: 10, y: 16, ancho: 4, alto: 8 } as const

// Motas de 1 x 1 celda con el tono vecino, dentro de su banda: [x, y, parte]
const MOTAS = [
  [14, 0, 'copa-media'],
  [9, 1, 'copa-media'],
  [4, 3, 'copa-media'],
  [12, 3, 'copa-media'],
  [18, 4, 'copa-media'],
  [7, 5, 'copa-media'],
  [3, 7, 'copa-alta'],
  [11, 6, 'copa-alta'],
  [17, 8, 'copa-alta'],
  [21, 7, 'copa-alta'],
  [6, 9, 'copa-baja'],
  [14, 9, 'copa-baja'],
  [22, 8, 'copa-baja'],
  [5, 10, 'copa-media'],
  [13, 11, 'copa-media'],
  [19, 10, 'copa-media'],
  [8, 14, 'copa-media'],
  [15, 15, 'copa-media'],
] as const

export interface Tramo {
  x: number
  ancho: number
  parte: ParteArbol
}

export interface Mota {
  x: number
  parte: ParteArbol
}

export interface FilaCopa {
  // Fila de la rejilla; 0 es la de arriba
  y: number
  tramo: Tramo
  motas: Mota[]
}

// Las 16 filas de la copa, de arriba hacia abajo
export const FILAS_COPA: readonly FilaCopa[] = Array.from({ length: 16 }, (_, y) => {
  const banda = BANDAS_COPA.find(([, bandaY, , alto]) => y >= bandaY && y < bandaY + alto)
  if (!banda) throw new Error(`La fila ${y} de la copa no tiene banda`)
  const [x, , ancho, , parte] = banda
  return {
    y,
    tramo: { x, ancho, parte },
    motas: MOTAS.filter(([, motaY]) => motaY === y).map(([motaX, , motaParte]) => ({
      x: motaX,
      parte: motaParte,
    })),
  }
})

// El tronco, en 4 pasos de 2 filas, de abajo hacia arriba (el 0 es la base)
export const PASOS_TRONCO = 4
export const FILAS_POR_PASO_TRONCO = TRONCO.alto / PASOS_TRONCO

// Dónde nace una hoja: celdas de las filas bajas de la copa, [x, y]
export const ORIGENES_HOJA = [
  [3, 11],
  [6, 12],
  [8, 14],
  [15, 14],
  [18, 12],
  [20, 11],
] as const

// Suelo donde se apoya la hoja que cae (fila superior de la hoja de 2 x 2)
export const SUELO_HOJA_Y = BASE_TRONCO_Y - 2

// Celda de 2 x 2 que parpadea en la copa alta
export const CELDA_PARPADEO = { x: 11, y: 2 } as const

// Todas las celdas ocupadas por la silueta, como «x,y» (para comprobar que no cambió)
export function celdasDeLaSilueta(): Set<string> {
  const celdas = new Set<string>()
  for (const { y, tramo } of FILAS_COPA) {
    for (let x = tramo.x; x < tramo.x + tramo.ancho; x++) celdas.add(`${x},${y}`)
  }
  for (let y = TRONCO.y; y < TRONCO.y + TRONCO.alto; y++) {
    for (let x = TRONCO.x; x < TRONCO.x + TRONCO.ancho; x++) celdas.add(`${x},${y}`)
  }
  return celdas
}
