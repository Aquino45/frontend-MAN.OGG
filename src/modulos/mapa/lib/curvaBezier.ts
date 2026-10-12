// Curva cúbica de Bézier como la de CSS (`cubic-bezier(x1, y1, x2, y2)`): dado el avance del
// tiempo (0 a 1) devuelve el avance del movimiento. Sirve para mover el mapa cuadro a cuadro
// con la misma curva que usan los tokens de movimiento.
export type PuntosCurva = readonly [number, number, number, number]

const PASOS_NEWTON = 6
const PASOS_BISECCION = 24
const PRECISION = 1e-5

function coordenada(t: number, p1: number, p2: number): number {
  const u = 1 - t
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t
}

function pendiente(t: number, p1: number, p2: number): number {
  const u = 1 - t
  return 3 * u * u * p1 + 6 * u * t * (p2 - p1) + 3 * t * t * (1 - p2)
}

export function crearCurvaBezier([x1, y1, x2, y2]: PuntosCurva): (avance: number) => number {
  // Busca el parámetro t cuya coordenada x es el avance pedido (Newton y, si no basta, bisección).
  const parametroDe = (x: number): number => {
    let t = x
    for (let paso = 0; paso < PASOS_NEWTON; paso++) {
      const error = coordenada(t, x1, x2) - x
      if (Math.abs(error) < PRECISION) return t
      const inclinacion = pendiente(t, x1, x2)
      if (Math.abs(inclinacion) < PRECISION) break
      t -= error / inclinacion
    }
    let bajo = 0
    let alto = 1
    t = x
    for (let paso = 0; paso < PASOS_BISECCION; paso++) {
      const error = coordenada(t, x1, x2) - x
      if (Math.abs(error) < PRECISION) break
      if (error > 0) alto = t
      else bajo = t
      t = (bajo + alto) / 2
    }
    return t
  }
  return (avance) => {
    if (avance <= 0) return 0
    if (avance >= 1) return 1
    return coordenada(parametroDe(avance), y1, y2)
  }
}
