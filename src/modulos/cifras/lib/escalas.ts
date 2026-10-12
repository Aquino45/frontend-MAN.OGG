// Escalas de los gráficos del tablero. Funciones puras, sin dependencias.

// Lleva un valor del dominio [d0, d1] al rango [r0, r1] (el rango puede ir al revés, como el eje Y)
export function escalaLineal(
  d0: number,
  d1: number,
  r0: number,
  r1: number,
): (valor: number) => number {
  const ancho = d1 - d0
  return (valor) => (ancho === 0 ? r0 : r0 + ((valor - d0) / ancho) * (r1 - r0))
}

export interface MarcasDeEje {
  // Valor máximo del eje, múltiplo del paso
  tope: number
  marcas: number[]
}

// Paso «redondo» (1, 2, 5 por una potencia de 10) para que el eje tenga unas `cantidad` marcas
function pasoRedondo(maximo: number, cantidad: number): number {
  if (maximo <= 0) return 1
  const crudo = maximo / cantidad
  const potencia = 10 ** Math.floor(Math.log10(crudo))
  const fraccion = crudo / potencia
  const base = fraccion <= 1 ? 1 : fraccion <= 2 ? 2 : fraccion <= 5 ? 5 : 10
  return base * potencia
}

// Marcas de un eje que empieza en cero y cubre `maximo`, con valores redondos. Con `enteras`, el
// paso nunca baja de 1 (para ejes que cuentan cosas: no hay «medio árbol»).
export function marcasRedondas(maximo: number, cantidad: number, enteras = false): MarcasDeEje {
  const paso = enteras ? Math.max(1, pasoRedondo(maximo, cantidad)) : pasoRedondo(maximo, cantidad)
  const tope = Math.max(paso, Math.ceil(maximo / paso) * paso)
  const marcas: number[] = []
  for (let valor = 0; valor <= tope + paso / 1000; valor += paso) {
    marcas.push(Number(valor.toFixed(10)))
  }
  return { tope, marcas }
}

// Radio de un punto cuya ÁREA es proporcional al valor (raíz cuadrada), entre `minimo` y `maximo`.
// Sin dato, el radio mínimo.
export function radioPorArea(
  valor: number | null,
  valorMaximo: number,
  minimo: number,
  maximo: number,
): number {
  if (valor === null || valor <= 0 || valorMaximo <= 0) return minimo
  return minimo + (maximo - minimo) * Math.sqrt(Math.min(1, valor / valorMaximo))
}

// Intensidad de 0 a 1 de un valor respecto del máximo (para un mapa de calor)
export function intensidad(valor: number | null, maximo: number): number {
  if (valor === null || maximo <= 0) return 0
  return Math.max(0, Math.min(1, valor / maximo))
}
