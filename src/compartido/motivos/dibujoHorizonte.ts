// Horizonte de copa: el motivo pixel que separa dos secciones de distinto fondo. Es un solo borde
// continuo de lóbulos de nube en escalón, como el borde de abajo de la copa del árbol, con
// lóbulos de 3 tamaños en una secuencia fija que no se repite antes de ANCHO_HORIZONTE celdas.
// La pieza se pinta con el color del fondo de la sección que sigue, y una segunda capa corrida
// una celda hacia arriba hace de sombra. Cada pixel tiene intención: nada al azar.
import { trazoDeCeldas, type Celda } from '../rasterizarPixel'

// [ancho, alto] de cada lóbulo, en celdas, de izquierda a derecha
const LOBULOS_HORIZONTE: readonly (readonly [number, number])[] = [
  [10, 3],
  [6, 2],
  [14, 5],
  [10, 3],
  [6, 2],
  [6, 2],
  [14, 4],
  [10, 3],
  [14, 5],
  [6, 2],
  [10, 3],
  [10, 3],
  [6, 2],
  [14, 4],
  [6, 2],
  [14, 5],
  [10, 3],
  [6, 2],
  [14, 4],
  [10, 3],
  [6, 2],
  [10, 3],
]

export const ANCHO_HORIZONTE = LOBULOS_HORIZONTE.reduce((suma, [ancho]) => suma + ancho, 0)
// Alto en celdas: el lóbulo más alto más la fila de la sombra
export const ALTO_HORIZONTE = Math.max(...LOBULOS_HORIZONTE.map(([, alto]) => alto)) + 1

// Altura, en celdas, de la columna `columna` dentro de un lóbulo: una cúpula en escalón. Nunca
// baja de 1, así el borde es continuo y entre dos lóbulos queda un valle de una celda.
function alturaDeColumna(columna: number, ancho: number, alto: number): number {
  const t = ((columna + 0.5) / ancho) * 2 - 1
  return Math.max(1, Math.round(alto * Math.sqrt(1 - t * t)))
}

function celdasDelHorizonte(): Celda[] {
  const celdas: Celda[] = []
  let inicio = 0
  for (const [ancho, alto] of LOBULOS_HORIZONTE) {
    for (let columna = 0; columna < ancho; columna++) {
      const altura = alturaDeColumna(columna, ancho, alto)
      // Desde arriba (dejando libre la fila de la sombra) hasta la base de la pieza
      for (let fila = ALTO_HORIZONTE - altura; fila < ALTO_HORIZONTE; fila++) {
        celdas.push([inicio + columna, fila])
      }
    }
    inicio += ancho
  }
  return celdas
}

const CELDAS_HORIZONTE = celdasDelHorizonte()
export const TRAZO_HORIZONTE = trazoDeCeldas(CELDAS_HORIZONTE)
// La sombra es la misma silueta corrida una celda hacia arriba
export const TRAZO_SOMBRA_HORIZONTE = trazoDeCeldas(
  CELDAS_HORIZONTE.map(([x, y]): Celda => [x, y - 1]),
)
