// Dibujo del árbol de la portada sobre una rejilla de 40 x 40 celdas, inspirado en la ilustración
// de la marca: copa de nubes asimétrica en lóbulos redondeados en escalón (carmín al frente y
// arriba a la derecha, magenta oscuro atrás a la izquierda y abajo), una línea de sombra bajo
// los lóbulos, brillos en pastilla arriba a la izquierda de cada lóbulo, salientes que asoman a
// los lados y una nubecita suelta; tronco retorcido con dos ramas (una asoma a un costado de la
// copa) y cuatro raíces que se abren desde una base ancha.
// Cada pixel tiene intención: nada de celdas al azar. Los cuadros del reposo son la misma copa
// con algunos lóbulos y brillos corridos una celda.
import type { Lobulo, Tramo } from '@/compartido/rasterizarPixel'

export const LADO_REJILLA_ARBOL = 40

// Corrimiento de una pieza en celdas: [dx, dy]
export type Corrimiento = readonly [number, number]

// Pastilla horizontal de 2 filas: la de arriba, una celda más corta de cada lado
export function pastilla(x: number, y: number, ancho: number): readonly Tramo[] {
  return [
    [y, x + 1, ancho - 2],
    [y + 1, x, ancho],
  ]
}

export interface DibujoArbol {
  atras: readonly Lobulo[]
  frente: readonly Lobulo[]
  // Posiciones, dentro de `frente`, de los lóbulos que llevan una línea de sombra debajo
  sombrasBajo: readonly number[]
  // Posiciones, dentro de `frente`, de los lóbulos de arriba: se corren hacia el cursor
  frenteArriba: readonly number[]
  salientes: readonly Lobulo[]
  brillos: readonly (readonly Tramo[])[]
  // Posiciones, dentro de `brillos`, de los brillos de los lóbulos de arriba
  brillosArriba: readonly number[]
  nube: readonly Tramo[]
  tronco: readonly Tramo[]
  ramas: readonly Tramo[]
  raices: readonly Tramo[]
}

export const DIBUJO_ARBOL: DibujoArbol = {
  atras: [
    [3, 11, 13, 11, 3],
    [8, 18, 15, 8, 3],
    [18, 19, 15, 5, 3],
    [6, 7, 11, 6, 2],
    [24, 23, 6, 3, 1],
    [11, 25, 5, 2, 1],
  ],
  frente: [
    [13, 4, 13, 9, 4],
    [23, 7, 14, 10, 4],
    [10, 10, 16, 9, 4],
    [22, 15, 15, 7, 1],
    [13, 18, 12, 5, 3],
  ],
  sombrasBajo: [0, 2, 1],
  frenteArriba: [0, 1],
  salientes: [
    [1, 14, 10, 3, 1],
    [32, 11, 7, 2, 1],
  ],
  brillos: [pastilla(15, 6, 5), pastilla(26, 9, 4), pastilla(12, 12, 5), pastilla(5, 13, 3)],
  brillosArriba: [0, 1],
  nube: [
    [2, 32, 5],
    [3, 31, 7],
  ],
  tronco: [
    [26, 18, 5],
    [27, 17, 5],
    [28, 17, 5],
    [29, 16, 5],
    [30, 16, 5],
    [31, 17, 5],
    [32, 17, 5],
    [33, 16, 6],
    [34, 14, 9],
    [35, 13, 11],
  ],
  ramas: [
    [28, 22, 2],
    [27, 23, 3],
    [26, 26, 3],
    [25, 29, 3],
    [24, 32, 3],
    [23, 35, 3],
    [28, 14, 3],
    [27, 12, 3],
    [26, 10, 3],
    [25, 9, 3],
  ],
  raices: [
    [36, 11, 2],
    [37, 9, 2],
    [38, 8, 2],
    [36, 15, 2],
    [37, 14, 2],
    [38, 14, 2],
    [36, 20, 2],
    [37, 21, 2],
    [38, 21, 2],
    [36, 24, 2],
    [37, 26, 2],
    [38, 28, 2],
  ],
}

// Corrimientos de cada cuadro del reposo, en el orden de las listas del dibujo. El cuadro base
// (sin corrimientos) no se lista. Nunca se mueve una fila sola: se mueven lóbulos y brillos enteros.
export interface CuadroReposo {
  atras: readonly Corrimiento[]
  frente: readonly Corrimiento[]
  salientes: readonly Corrimiento[]
  brillos: readonly Corrimiento[]
  nube: Corrimiento
}

const QUIETO: Corrimiento = [0, 0]

export const CUADROS_REPOSO: readonly CuadroReposo[] = [
  {
    atras: [QUIETO, QUIETO, QUIETO, QUIETO, QUIETO, QUIETO],
    frente: [[0, 1], QUIETO, QUIETO, QUIETO, QUIETO],
    salientes: [QUIETO, [1, 0]],
    brillos: [[1, 0], [1, 0], QUIETO, QUIETO],
    nube: [-1, 0],
  },
  {
    atras: [[-1, 0], QUIETO, QUIETO, QUIETO, QUIETO, QUIETO],
    frente: [[-1, 0], QUIETO, [-1, 0], QUIETO, QUIETO],
    salientes: [[-1, 0], QUIETO],
    brillos: [QUIETO, [0, 1], [1, 0], [0, -1]],
    nube: QUIETO,
  },
  {
    atras: [QUIETO, QUIETO, QUIETO, QUIETO, QUIETO, [1, 0]],
    frente: [QUIETO, QUIETO, QUIETO, QUIETO, [1, 0]],
    salientes: [QUIETO, [1, 0]],
    brillos: [[0, 1], QUIETO, [-1, 0], [1, 0]],
    nube: [1, 0],
  },
]
