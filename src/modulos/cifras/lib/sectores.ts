// Un renglón por sector de la API (también los que no tienen árboles) y, al final, por cada sector
// con árboles que la API no lista, un renglón con su número. Función pura.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { TEXTOS_CIFRAS } from '@/config/constantes'

export interface SectorListado {
  clave: string
  etiqueta: string
}

// Los sectores de la API por id y, al final, los que solo aparecen en los árboles
export function listarSectores(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
): SectorListado[] {
  const conocidos = [...sectores].sort((a, b) => a.properties.id - b.properties.id)
  const filas = conocidos.map((sector) => ({
    clave: String(sector.properties.id),
    etiqueta: sector.properties.nombre,
  }))
  const idsConocidos = new Set(filas.map(({ clave }) => clave))
  const extra = [...new Set(arboles.map(({ properties }) => String(properties.sector)))]
    .filter((clave) => !idsConocidos.has(clave))
    .sort((a, b) => Number(a) - Number(b))
    .map((clave) => ({
      clave,
      etiqueta: TEXTOS_CIFRAS.sectorSinNombre.replace('{id}', clave),
    }))
  return [...filas, ...extra]
}
