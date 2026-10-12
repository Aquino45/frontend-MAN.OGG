// Las hojas grandes que caen en diagonal durante la secuencia de la entrada alterna: cuántas son y
// de qué tamaño. Cada una cambia su tamaño respecto de la anterior en un paso fijo (arriba o abajo,
// según el azar) y nunca se pasa del tope respecto de la base. Funciones puras.
import { DURACION_ENTRADA_ALTERNA_MS, ENTRADA_ALTERNA as E } from '@/config/constantes'

// Cuántas salen: la primera y una más cada tanto, hasta que empieza el final
export function cantidadDeHojasGrandes(): number {
  return Math.floor((DURACION_ENTRADA_ALTERNA_MS - E.hojaGrandeDesdeMs) / E.hojaGrandeCadaMs) + 1
}

// Factores del tamaño base (1 es el base). `aleatorio` da números en [0, 1)
export function factoresDeTamano(cantidad: number, aleatorio: () => number): number[] {
  const factores: number[] = []
  let actual = 1
  for (let i = 0; i < cantidad; i++) {
    if (i > 0) {
      const paso = aleatorio() < 0.5 ? -E.hojaGrandePaso : E.hojaGrandePaso
      // Redondeo a 2 decimales: sumar pasos de 0,1 acumula error de coma flotante
      actual = Math.round((actual + paso) * 100) / 100
      actual = Math.min(1 + E.hojaGrandeTope, Math.max(1 - E.hojaGrandeTope, actual))
    }
    factores.push(actual)
  }
  return factores
}
