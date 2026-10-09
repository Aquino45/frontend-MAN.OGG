// Elige una clave con probabilidad proporcional a su peso.
// `aleatorio` es un número en [0, 1); se inyecta para que el resultado sea reproducible.
export function elegirVariante<Clave extends string>(
  pesos: Readonly<Record<Clave, number>>,
  aleatorio: number,
): Clave {
  const entradas = Object.entries(pesos) as [Clave, number][]
  if (entradas.length === 0) throw new Error('elegirVariante: no hay pesos.')
  for (const [clave, peso] of entradas) {
    if (!Number.isFinite(peso) || peso <= 0) {
      throw new Error(
        `elegirVariante: el peso de «${clave}» debe ser positivo (recibido: ${peso}).`,
      )
    }
  }
  if (!(aleatorio >= 0 && aleatorio < 1)) {
    throw new Error(`elegirVariante: el aleatorio debe estar en [0, 1) (recibido: ${aleatorio}).`)
  }

  const total = entradas.reduce((suma, [, peso]) => suma + peso, 0)
  let umbral = aleatorio * total
  for (const [clave, peso] of entradas) {
    if (umbral < peso) return clave
    umbral -= peso
  }
  // Por redondeo de coma flotante, un aleatorio muy cercano a 1 cae en la última clave.
  return entradas[entradas.length - 1][0]
}
