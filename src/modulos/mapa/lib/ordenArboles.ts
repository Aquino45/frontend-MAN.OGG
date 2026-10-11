// Orden de los árboles de un sector: los destacados se muestran primero.
import type { ArbolFeature } from '@/api/cliente'

// Orden estable: dentro de cada grupo se conserva el orden en que llegó de la API.
export function ordenarDestacadosPrimero(arboles: readonly ArbolFeature[]): ArbolFeature[] {
  const destacados = arboles.filter((arbol) => arbol.properties.destacado)
  const demas = arboles.filter((arbol) => !arbol.properties.destacado)
  return [...destacados, ...demas]
}

export function hayDestacados(arboles: readonly ArbolFeature[]): boolean {
  return arboles.some((arbol) => arbol.properties.destacado)
}
