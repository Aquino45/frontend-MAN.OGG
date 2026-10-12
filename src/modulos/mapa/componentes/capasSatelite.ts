// Capas del mapa satelital: el estilo de la foto, los sectores, los árboles y sus colores.
import type { Map as MapaMapLibre, StyleSpecification } from 'maplibre-gl'
import type { ConfigSatelite } from '@/config/entorno'
import {
  SATELITE_CAPA_ARBOLES,
  SATELITE_CAPA_BORDE,
  SATELITE_CAPA_CONTORNO,
  SATELITE_CAPA_IMAGEN,
  SATELITE_CAPA_RELLENO,
  SATELITE_FUENTE_ARBOLES,
  SATELITE_FUENTE_IMAGEN,
  SATELITE_FUENTE_SECTORES,
  SATELITE_GROSOR_BORDE_ACTIVO,
  SATELITE_GROSOR_BORDE_PUNTO_PX,
  SATELITE_GROSOR_BORDE_SECTOR,
  SATELITE_GROSOR_CONTORNO_EXTRA,
  SATELITE_OPACIDAD_PUNTO_DEMO,
  SATELITE_OPACIDAD_PUNTO_REAL,
  SATELITE_OPACIDAD_RELLENO_ACTIVO,
  SATELITE_OPACIDAD_RELLENO_SECTOR,
  SATELITE_RADIO_PUNTO_ACTIVO_PX,
  SATELITE_RADIO_PUNTO_PX,
  SATELITE_SATURACION_NATURAL,
  SATELITE_SATURACION_TENIDA,
  SATELITE_TAMANO_TESELA_PX,
  SATELITE_ZOOM_MAXIMO,
} from '@/config/satelite'
import {
  leerColoresSatelite,
  lectorDeTokensDelDocumento,
  type ColoresSatelite,
} from '../lib/coloresSatelite'
import { coleccionArboles, coleccionSectores, urlTeselasConClave } from '../lib/geojsonSatelite'

export function estiloDeLaImagen(config: ConfigSatelite, tenido: boolean): StyleSpecification {
  return {
    version: 8,
    sources: {
      [SATELITE_FUENTE_IMAGEN]: {
        type: 'raster',
        tiles: [urlTeselasConClave(config.urlTeselas, config.clave)],
        tileSize: SATELITE_TAMANO_TESELA_PX,
        maxzoom: SATELITE_ZOOM_MAXIMO,
      },
    },
    layers: [
      {
        id: SATELITE_CAPA_IMAGEN,
        type: 'raster',
        source: SATELITE_FUENTE_IMAGEN,
        paint: { 'raster-saturation': saturacion(tenido) },
      },
    ],
  }
}

export const saturacion = (tenido: boolean) =>
  tenido ? SATELITE_SATURACION_TENIDA : SATELITE_SATURACION_NATURAL

export function agregarCapas(mapa: MapaMapLibre, colores: ColoresSatelite) {
  mapa.addSource(SATELITE_FUENTE_SECTORES, { type: 'geojson', data: coleccionSectores([], null) })
  mapa.addSource(SATELITE_FUENTE_ARBOLES, { type: 'geojson', data: coleccionArboles([]) })
  mapa.addLayer({
    id: SATELITE_CAPA_RELLENO,
    type: 'fill',
    source: SATELITE_FUENTE_SECTORES,
    paint: {
      'fill-color': colores.relleno,
      'fill-opacity': [
        'case',
        ['get', 'activo'],
        SATELITE_OPACIDAD_RELLENO_ACTIVO,
        SATELITE_OPACIDAD_RELLENO_SECTOR,
      ],
    },
  })
  // Contorno oscuro bajo el borde de la paleta: sobre la foto el magenta solo no se separa del suelo
  mapa.addLayer({
    id: SATELITE_CAPA_CONTORNO,
    type: 'line',
    source: SATELITE_FUENTE_SECTORES,
    paint: {
      'line-color': colores.puntoBorde,
      'line-width': [
        'case',
        ['get', 'activo'],
        SATELITE_GROSOR_BORDE_ACTIVO + SATELITE_GROSOR_CONTORNO_EXTRA,
        SATELITE_GROSOR_BORDE_SECTOR + SATELITE_GROSOR_CONTORNO_EXTRA,
      ],
    },
  })
  mapa.addLayer({
    id: SATELITE_CAPA_BORDE,
    type: 'line',
    source: SATELITE_FUENTE_SECTORES,
    paint: {
      'line-color': colores.borde,
      'line-width': [
        'case',
        ['get', 'activo'],
        SATELITE_GROSOR_BORDE_ACTIVO,
        SATELITE_GROSOR_BORDE_SECTOR,
      ],
    },
  })
  mapa.addLayer({
    id: SATELITE_CAPA_ARBOLES,
    type: 'circle',
    source: SATELITE_FUENTE_ARBOLES,
    paint: {
      'circle-radius': [
        'case',
        ['get', 'destacado'],
        SATELITE_RADIO_PUNTO_ACTIVO_PX,
        SATELITE_RADIO_PUNTO_PX,
      ],
      'circle-color': ['case', ['get', 'destacado'], colores.puntoDestacado, colores.puntoRelleno],
      'circle-opacity': [
        'case',
        ['get', 'demo'],
        SATELITE_OPACIDAD_PUNTO_DEMO,
        SATELITE_OPACIDAD_PUNTO_REAL,
      ],
      'circle-stroke-color': colores.puntoBorde,
      'circle-stroke-width': SATELITE_GROSOR_BORDE_PUNTO_PX,
    },
  })
}

export function aplicarColores(mapa: MapaMapLibre, colores: ColoresSatelite) {
  mapa.setPaintProperty(SATELITE_CAPA_RELLENO, 'fill-color', colores.relleno)
  mapa.setPaintProperty(SATELITE_CAPA_BORDE, 'line-color', colores.borde)
  mapa.setPaintProperty(SATELITE_CAPA_CONTORNO, 'line-color', colores.puntoBorde)
  mapa.setPaintProperty(SATELITE_CAPA_ARBOLES, 'circle-color', [
    'case',
    ['get', 'destacado'],
    colores.puntoDestacado,
    colores.puntoRelleno,
  ])
  mapa.setPaintProperty(SATELITE_CAPA_ARBOLES, 'circle-stroke-color', colores.puntoBorde)
}

export function coloresActuales(): ColoresSatelite {
  return leerColoresSatelite(lectorDeTokensDelDocumento(document.documentElement))
}
