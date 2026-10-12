// Pasa las formas del dibujo del árbol (lóbulos y tramos de tronco) a celdas enteras de la
// rejilla y las junta en un solo trazo por color: sin rectángulos sueltos, que dejan líneas
// finas entre filas. Es dato del dibujo: no sabe nada de animación.

// Lóbulo: [x, y, ancho, alto, esquina]; la esquina es el radio, en celdas, del escalón redondeado
export type Lobulo = readonly [number, number, number, number, number]
// Tramo de una fila: [y, x, ancho]
export type Tramo = readonly [number, number, number]

export type Celda = readonly [number, number]

// Cuánto se recorta cada fila de una esquina, de la punta hacia adentro
const RECORTES_ESQUINA: Readonly<Record<number, readonly number[]>> = {
  0: [],
  1: [1],
  2: [2, 1],
  3: [3, 1, 1],
  4: [4, 2, 1, 1],
}

function recorteDeFila(fila: number, alto: number, esquina: number): number {
  const recortes = RECORTES_ESQUINA[esquina] ?? []
  const desdeArriba = recortes[fila] ?? 0
  const desdeAbajo = recortes[alto - 1 - fila] ?? 0
  return Math.max(desdeArriba, desdeAbajo)
}

export function celdasDeLobulo([x, y, ancho, alto, esquina]: Lobulo, dx = 0, dy = 0): Celda[] {
  const celdas: Celda[] = []
  for (let fila = 0; fila < alto; fila++) {
    const recorte = recorteDeFila(fila, alto, esquina)
    for (let columna = recorte; columna < ancho - recorte; columna++) {
      celdas.push([x + columna + dx, y + fila + dy])
    }
  }
  return celdas
}

// La línea de 1 celda que queda justo debajo de un lóbulo, solo donde hay copa debajo
export function sombraBajoLobulo(lobulo: Lobulo, copa: readonly Celda[]): Celda[] {
  const [, y, , alto] = lobulo
  const dentro = new Set(copa.map(([cx, cy]) => `${cx},${cy}`))
  return celdasDeLobulo(lobulo)
    .filter(([, cy]) => cy === y + alto - 1)
    .map(([cx, cy]): Celda => [cx, cy + 1])
    .filter(([cx, cy]) => dentro.has(`${cx},${cy}`))
}

export function celdasDeTramos(tramos: readonly Tramo[], dx = 0, dy = 0): Celda[] {
  return tramos.flatMap(([y, x, ancho]) =>
    Array.from({ length: ancho }, (_, columna): Celda => [x + columna + dx, y + dy]),
  )
}

const clave = (x: number, y: number) => `${x},${y}`

// Celdas sin repetir, en orden de fila y columna
export function unirCeldas(...grupos: readonly (readonly Celda[])[]): Celda[] {
  const vistas = new Map<string, Celda>()
  for (const grupo of grupos) for (const celda of grupo) vistas.set(clave(...celda), celda)
  return [...vistas.values()].sort((a, b) => a[1] - b[1] || a[0] - b[0])
}

// Las celdas vecinas (arriba, abajo, izquierda, derecha) que no están en `celdas`
export function bordeExterior(celdas: readonly Celda[]): Celda[] {
  const dentro = new Set(celdas.map(([x, y]) => clave(x, y)))
  const borde: Celda[] = []
  for (const [x, y] of celdas) {
    for (const [vx, vy] of [
      [x, y - 1],
      [x, y + 1],
      [x - 1, y],
      [x + 1, y],
    ] as const) {
      if (!dentro.has(clave(vx, vy))) borde.push([vx, vy])
    }
  }
  return unirCeldas(borde)
}

export function restarCeldas(base: readonly Celda[], quitar: readonly Celda[]): Celda[] {
  const fuera = new Set(quitar.map(([x, y]) => clave(x, y)))
  return base.filter(([x, y]) => !fuera.has(clave(x, y)))
}

// Un solo trazo (atributo d de un <path>): una pasada horizontal por cada tramo seguido de celdas.
// Los números son enteros, así que con celdas de píxeles enteros no quedan costuras.
export function trazoDeCeldas(celdas: readonly Celda[]): string {
  const filas = new Map<number, number[]>()
  for (const [x, y] of celdas) filas.set(y, [...(filas.get(y) ?? []), x])
  const partes: string[] = []
  for (const [y, xs] of [...filas.entries()].sort((a, b) => a[0] - b[0])) {
    const ordenadas = [...new Set(xs)].sort((a, b) => a - b)
    let inicio = ordenadas[0]
    let anterior = inicio
    for (const x of [...ordenadas.slice(1), Number.POSITIVE_INFINITY]) {
      if (x !== anterior + 1) {
        partes.push(`M${inicio} ${y}h${anterior - inicio + 1}v1h${inicio - anterior - 1}z`)
        inicio = x
      }
      anterior = x
    }
  }
  return partes.join('')
}

// La pieza un paso más chica: sin las celdas que tocan el vacío. Si casi no queda nada (líneas y
// tramos finos), un damero de la pieza, como se disuelve un sprite al aparecer.
export function versionChica(celdas: readonly Celda[]): Celda[] {
  const dentro = new Set(celdas.map(([x, y]) => clave(x, y)))
  const interior = celdas.filter(
    ([x, y]) =>
      dentro.has(clave(x, y - 1)) &&
      dentro.has(clave(x, y + 1)) &&
      dentro.has(clave(x - 1, y)) &&
      dentro.has(clave(x + 1, y)),
  )
  if (interior.length * 10 >= celdas.length * 3) return interior
  return celdas.filter(([x, y]) => (x + y) % 2 === 0)
}

// Celdas que tocan (arriba, abajo, izquierda o derecha) alguna celda de `otras`
export function celdasVecinasDe(celdas: readonly Celda[], otras: readonly Celda[]): Celda[] {
  const cerca = new Set(
    otras.flatMap(([x, y]) => [clave(x, y - 1), clave(x, y + 1), clave(x - 1, y), clave(x + 1, y)]),
  )
  return celdas.filter(([x, y]) => cerca.has(clave(x, y)))
}
