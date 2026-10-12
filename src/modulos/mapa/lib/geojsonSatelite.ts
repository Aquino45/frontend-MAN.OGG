// Datos del mapa satelital: encuadres, colecciones GeoJSON y URL de las teselas. Todo sale de los
// datos del contrato (lon/lat WGS84), igual que el mapa ilustrado, así que ambos caen en el mismo sitio.
import type { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { SATELITE_PARAMETRO_CLAVE } from '@/config/satelite'

// [[oeste, sur], [este, norte]]
export type Limites = [[number, number], [number, number]]

function limitesDe(sectores: readonly SectorFeature[]): Limites | null {
  const posiciones = sectores.flatMap((sector) => sector.geometry.coordinates.flat())
  if (posiciones.length === 0) return null
  const longitudes = posiciones.map(([longitud]) => longitud)
  const latitudes = posiciones.map(([, latitud]) => latitud)
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ]
}

export function limitesDeSectores(sectores: readonly SectorFeature[]): Limites | null {
  return limitesDe(sectores)
}

export function limitesDeSector(
  sectores: readonly SectorFeature[],
  sectorId: number,
): Limites | null {
  return limitesDe(sectores.filter((sector) => sector.id === sectorId))
}

export interface PropiedadesSectorMapa {
  id: number
  nombre: string
  provisional: boolean
  activo: boolean
}

export function coleccionSectores(
  sectores: readonly SectorFeature[],
  sectorActivo: number | null,
): FeatureCollection<Polygon, PropiedadesSectorMapa> {
  return {
    type: 'FeatureCollection',
    features: sectores.map((sector) => ({
      type: 'Feature',
      id: sector.id,
      geometry: sector.geometry,
      properties: {
        id: sector.id,
        nombre: sector.properties.nombre,
        provisional: sector.properties.provisional,
        activo: sector.id === sectorActivo,
      },
    })),
  }
}

export interface PropiedadesArbolMapa {
  codigo: string
  demo: boolean
  destacado: boolean
}

export function coleccionArboles(
  arboles: readonly ArbolFeature[],
): FeatureCollection<Point, PropiedadesArbolMapa> {
  const puntos: Feature<Point, PropiedadesArbolMapa>[] = []
  for (const arbol of arboles) {
    if (arbol.geometry === null) continue
    puntos.push({
      type: 'Feature',
      id: arbol.properties.codigo,
      geometry: arbol.geometry,
      properties: {
        codigo: arbol.properties.codigo,
        demo: arbol.properties.demo,
        destacado: arbol.properties.destacado,
      },
    })
  }
  return { type: 'FeatureCollection', features: puntos }
}

export function urlTeselasConClave(urlTeselas: string, clave: string): string {
  const separador = urlTeselas.includes('?') ? '&' : '?'
  return `${urlTeselas}${separador}${SATELITE_PARAMETRO_CLAVE}=${encodeURIComponent(clave)}`
}
