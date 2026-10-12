// Capas del mapa sobre la geografía real (calles o satélite): la base, los sectores, los árboles y
// sus colores. Igual que el mapa ilustrado: límite continuo si el sector es real y punteado si es
// provisional, árboles como puntos y destacados como estrellas.
import type {
  ExpressionSpecification,
  FilterSpecification,
  Map as MapaMapLibre,
  StyleSpecification,
} from 'maplibre-gl'
import {
  SATELITE_CAPA_ARBOLES,
  SATELITE_CAPA_BORDE,
  SATELITE_CAPA_BORDE_PROVISIONAL,
  SATELITE_CAPA_CONTORNO,
  SATELITE_CAPA_ESTRELLAS,
  SATELITE_CAPA_IMAGEN,
  SATELITE_CAPA_RELLENO,
  SATELITE_DENSIDAD_ESTRELLA,
  SATELITE_DESPLAZAMIENTO_ESTRELLA,
  SATELITE_ESCALA_PUNTO_DESTACADO,
  SATELITE_FUENTE_ARBOLES,
  SATELITE_FUENTE_IMAGEN,
  SATELITE_FUENTE_SECTORES,
  SATELITE_GROSOR_BORDE_ACTIVO,
  SATELITE_GROSOR_BORDE_ESTRELLA_PX,
  SATELITE_GROSOR_BORDE_PUNTO_PX,
  SATELITE_GROSOR_BORDE_SECTOR,
  SATELITE_GROSOR_CONTORNO_EXTRA,
  SATELITE_IMAGEN_ESTRELLA,
  SATELITE_LADO_ESTRELLA_PX,
  SATELITE_OPACIDAD_PUNTO_DEMO,
  SATELITE_OPACIDAD_PUNTO_REAL,
  SATELITE_OPACIDAD_RELLENO_ACTIVO,
  SATELITE_OPACIDAD_RELLENO_SECTOR,
  SATELITE_PUNTAS_ESTRELLA,
  SATELITE_RADIO_INTERNO_ESTRELLA,
  SATELITE_RADIO_PUNTO_PX,
  SATELITE_TAMANO_TESELA_PX,
  SATELITE_TRAZO_PROVISIONAL,
  SATELITE_ZOOM_MAXIMO,
} from '@/config/satelite'
import {
  leerColoresSatelite,
  lectorDeTokensDelDocumento,
  type ColoresSatelite,
} from '../lib/coloresSatelite'
import { verticesDeEstrella } from '../lib/estrellaMapa'
import { coleccionArboles, coleccionSectores, urlTeselasConClave } from '../lib/geojsonSatelite'

const ES_DESTACADO: FilterSpecification = ['==', ['get', 'destacado'], true]
const NO_ES_DESTACADO: FilterSpecification = ['!=', ['get', 'destacado'], true]
const ES_PROVISIONAL: FilterSpecification = ['==', ['get', 'provisional'], true]
const NO_ES_PROVISIONAL: FilterSpecification = ['!=', ['get', 'provisional'], true]

// `clave` es null en las calles (no la piden): la dirección va tal cual
export function estiloDeLaBase(config: {
  clave: string | null
  urlTeselas: string
}): StyleSpecification {
  return {
    version: 8,
    sources: {
      [SATELITE_FUENTE_IMAGEN]: {
        type: 'raster',
        tiles: [
          config.clave ? urlTeselasConClave(config.urlTeselas, config.clave) : config.urlTeselas,
        ],
        tileSize: SATELITE_TAMANO_TESELA_PX,
        maxzoom: SATELITE_ZOOM_MAXIMO,
      },
    },
    layers: [{ id: SATELITE_CAPA_IMAGEN, type: 'raster', source: SATELITE_FUENTE_IMAGEN }],
  }
}

// La estrella como imagen para el mapa; null si el navegador no puede dibujar en un lienzo
export function imagenDeEstrella(colores: ColoresSatelite): ImageData | null {
  const lado = SATELITE_LADO_ESTRELLA_PX * SATELITE_DENSIDAD_ESTRELLA
  const lienzo = document.createElement('canvas')
  lienzo.width = lado
  lienzo.height = lado
  const contexto = lienzo.getContext('2d')
  if (!contexto) return null
  const grosor = SATELITE_GROSOR_BORDE_ESTRELLA_PX * SATELITE_DENSIDAD_ESTRELLA
  const radio = lado / 2 - grosor
  const vertices = verticesDeEstrella(
    { x: lado / 2, y: lado / 2 + radio * SATELITE_DESPLAZAMIENTO_ESTRELLA },
    radio,
    SATELITE_RADIO_INTERNO_ESTRELLA,
    SATELITE_PUNTAS_ESTRELLA,
  )
  contexto.beginPath()
  vertices.forEach((vertice, indice) =>
    indice === 0 ? contexto.moveTo(vertice.x, vertice.y) : contexto.lineTo(vertice.x, vertice.y),
  )
  contexto.closePath()
  contexto.fillStyle = colores.puntoDestacado
  contexto.strokeStyle = colores.puntoBorde
  contexto.lineWidth = grosor
  contexto.lineJoin = 'round'
  contexto.fill()
  contexto.stroke()
  return contexto.getImageData(0, 0, lado, lado)
}

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
  // Contorno oscuro bajo el borde de la paleta: sobre la foto o las calles el magenta solo no se separa
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
  const anchoDelBorde: ExpressionSpecification = [
    'case',
    ['get', 'activo'],
    SATELITE_GROSOR_BORDE_ACTIVO,
    SATELITE_GROSOR_BORDE_SECTOR,
  ]
  mapa.addLayer({
    id: SATELITE_CAPA_BORDE,
    type: 'line',
    source: SATELITE_FUENTE_SECTORES,
    filter: NO_ES_PROVISIONAL,
    paint: { 'line-color': colores.borde, 'line-width': anchoDelBorde },
  })
  mapa.addLayer({
    id: SATELITE_CAPA_BORDE_PROVISIONAL,
    type: 'line',
    source: SATELITE_FUENTE_SECTORES,
    filter: ES_PROVISIONAL,
    paint: {
      'line-color': colores.borde,
      'line-width': anchoDelBorde,
      'line-dasharray': SATELITE_TRAZO_PROVISIONAL,
    },
  })
  mapa.addLayer({
    id: SATELITE_CAPA_ARBOLES,
    type: 'circle',
    source: SATELITE_FUENTE_ARBOLES,
    filter: NO_ES_DESTACADO,
    paint: {
      'circle-radius': SATELITE_RADIO_PUNTO_PX,
      'circle-color': colores.puntoRelleno,
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
  // Destacados: la estrella de siempre; si el navegador no puede dibujarla, un punto ámbar más grande
  const estrella = imagenDeEstrella(colores)
  if (estrella) {
    mapa.addImage(SATELITE_IMAGEN_ESTRELLA, estrella, { pixelRatio: SATELITE_DENSIDAD_ESTRELLA })
    mapa.addLayer({
      id: SATELITE_CAPA_ESTRELLAS,
      type: 'symbol',
      source: SATELITE_FUENTE_ARBOLES,
      filter: ES_DESTACADO,
      layout: {
        'icon-image': SATELITE_IMAGEN_ESTRELLA,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    })
  } else {
    mapa.addLayer({
      id: SATELITE_CAPA_ESTRELLAS,
      type: 'circle',
      source: SATELITE_FUENTE_ARBOLES,
      filter: ES_DESTACADO,
      paint: {
        'circle-radius': SATELITE_RADIO_PUNTO_PX * SATELITE_ESCALA_PUNTO_DESTACADO,
        'circle-color': colores.puntoDestacado,
        'circle-stroke-color': colores.puntoBorde,
        'circle-stroke-width': SATELITE_GROSOR_BORDE_PUNTO_PX,
      },
    })
  }
}

export function aplicarColores(mapa: MapaMapLibre, colores: ColoresSatelite) {
  mapa.setPaintProperty(SATELITE_CAPA_RELLENO, 'fill-color', colores.relleno)
  mapa.setPaintProperty(SATELITE_CAPA_BORDE, 'line-color', colores.borde)
  mapa.setPaintProperty(SATELITE_CAPA_BORDE_PROVISIONAL, 'line-color', colores.borde)
  mapa.setPaintProperty(SATELITE_CAPA_CONTORNO, 'line-color', colores.puntoBorde)
  mapa.setPaintProperty(SATELITE_CAPA_ARBOLES, 'circle-color', colores.puntoRelleno)
  mapa.setPaintProperty(SATELITE_CAPA_ARBOLES, 'circle-stroke-color', colores.puntoBorde)
}

export function coloresActuales(): ColoresSatelite {
  return leerColoresSatelite(lectorDeTokensDelDocumento(document.documentElement))
}
