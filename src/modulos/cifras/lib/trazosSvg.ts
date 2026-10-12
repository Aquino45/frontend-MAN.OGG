// Trazos SVG de las donas del tablero. Funciones puras.

const DECIMALES = 2
const redondear = (valor: number) => Number(valor.toFixed(DECIMALES))

type Punto = readonly [number, number]

const sobreCircunferencia = (cx: number, cy: number, radio: number, angulo: number): Punto => [
  redondear(cx + radio * Math.cos(angulo)),
  redondear(cy + radio * Math.sin(angulo)),
]

// Trozo de dona entre dos ángulos (en radianes, hacia la derecha), con radio exterior e interior
export function trazoAnillo(
  cx: number,
  cy: number,
  radioExterior: number,
  radioInterior: number,
  desde: number,
  hasta: number,
): string {
  const [x0, y0] = sobreCircunferencia(cx, cy, radioExterior, desde)
  const [x1, y1] = sobreCircunferencia(cx, cy, radioExterior, hasta)
  const [x2, y2] = sobreCircunferencia(cx, cy, radioInterior, hasta)
  const [x3, y3] = sobreCircunferencia(cx, cy, radioInterior, desde)
  const grande = hasta - desde > Math.PI ? 1 : 0
  return (
    `M${x0} ${y0}A${radioExterior} ${radioExterior} 0 ${grande} 1 ${x1} ${y1}` +
    `L${x2} ${y2}A${radioInterior} ${radioInterior} 0 ${grande} 0 ${x3} ${y3}Z`
  )
}

// Arco de circunferencia (para una media dona dibujada con trazo grueso)
export function trazoArco(
  cx: number,
  cy: number,
  radio: number,
  desde: number,
  hasta: number,
): string {
  const [x0, y0] = sobreCircunferencia(cx, cy, radio, desde)
  const [x1, y1] = sobreCircunferencia(cx, cy, radio, hasta)
  const grande = hasta - desde > Math.PI ? 1 : 0
  return `M${x0} ${y0}A${radio} ${radio} 0 ${grande} 1 ${x1} ${y1}`
}

export interface Tramo {
  desde: number
  hasta: number
}

// Reparte una vuelta (o media) entre los valores, en proporción; `inicio` y `barrido` en radianes.
// Un valor 0 queda con ángulo cero. Si todos son 0, todos quedan en cero.
export function repartirAngulos(
  valores: readonly number[],
  inicio: number,
  barrido: number,
): Tramo[] {
  const total = valores.reduce((suma, valor) => suma + valor, 0)
  let actual = inicio
  return valores.map((valor) => {
    const ancho = total > 0 ? (valor / total) * barrido : 0
    const tramo = { desde: actual, hasta: actual + ancho }
    actual += ancho
    return tramo
  })
}
