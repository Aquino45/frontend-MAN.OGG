// Árboles destacados que muestra Inicio: salen de los que la API marca con destacado = true.
// Función pura: no pide datos; el orden es estable (sector y luego código).
import type { ArbolFeature, ArbolResumen, SectorFeature } from '@/api/cliente'
import { REGION_INTERFAZ } from '@/config/constantes'

export interface Destacado {
  arbol: ArbolResumen
  // Nombre del sector según la API; null si el sector no vino
  nombreSector: string | null
}

export function elegirDestacados(
  arboles: readonly ArbolFeature[],
  sectores: readonly SectorFeature[],
  maximo: number,
): Destacado[] {
  const nombres = new Map(
    sectores.map((sector) => [sector.properties.id, sector.properties.nombre]),
  )
  return arboles
    .map((feature) => feature.properties)
    .filter((propiedades) => propiedades.destacado)
    .sort(
      (a, b) =>
        a.sector - b.sector || a.codigo.localeCompare(b.codigo, REGION_INTERFAZ, { numeric: true }),
    )
    .slice(0, maximo)
    .map((arbol) => ({ arbol, nombreSector: nombres.get(arbol.sector) ?? null }))
}
