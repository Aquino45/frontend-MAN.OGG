// Vistas del mapa sobre la geografía real (satélite y calles): textos, atribución y medidas.
// La clave y las URL de los servicios salen del entorno (`config/entorno.ts`).

// Satélite: teselas de Esri World Imagery con clave (se agrega como `token`). Calles: las teselas
// estándar de OpenStreetMap, que no piden clave (sirve la misma atribución que ya lleva el pie).
export const SATELITE_URL_TESELAS_POR_DEFECTO =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const CALLES_URL_TESELAS_POR_DEFECTO = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const SATELITE_PARAMETRO_CLAVE = 'token'
export const SATELITE_TAMANO_TESELA_PX = 256
export const SATELITE_ZOOM_MAXIMO = 19

// Las dos bases sobre las que se dibujan los sectores y los árboles
export const BASES_MAPA_REAL = ['calles', 'satelite'] as const
export type BaseMapaReal = (typeof BASES_MAPA_REAL)[number]

export const VISTAS_MAPA = ['ilustrado', ...BASES_MAPA_REAL] as const
export type VistaMapaTipo = (typeof VISTAS_MAPA)[number]

// Atribución obligatoria de Esri y de los proveedores de cada capa (texto por confirmar con los
// términos del servicio).
export const ATRIBUCION_POR_BASE: Record<BaseMapaReal, string> = {
  satelite: 'Esri, Maxar, Earthstar Geographics y la comunidad de usuarios de GIS',
  calles: '© colaboradores de OpenStreetMap',
}
export const ENLACE_ATRIBUCION_POR_BASE: Record<BaseMapaReal, string> = {
  satelite: 'https://www.esri.com/',
  calles: 'https://www.openstreetmap.org/copyright',
}

// Márgenes del encuadre en píxeles (el mapa se acerca a un sector con este aire)
export const SATELITE_MARGEN_CAMPUS_PX = 48
export const SATELITE_MARGEN_SECTOR_PX = 32
export const SATELITE_DURACION_VUELO_MS = 800

// Sectores y árboles: igual que el mapa ilustrado, límite continuo si es real y punteado si es provisional
export const SATELITE_OPACIDAD_RELLENO_SECTOR = 0.14
export const SATELITE_OPACIDAD_RELLENO_ACTIVO = 0.28
export const SATELITE_OPACIDAD_PUNTO_REAL = 1
export const SATELITE_OPACIDAD_PUNTO_DEMO = 0.75
export const SATELITE_GROSOR_BORDE_SECTOR = 2
export const SATELITE_GROSOR_CONTORNO_EXTRA = 3
export const SATELITE_GROSOR_BORDE_ACTIVO = 4
export const SATELITE_TRAZO_PROVISIONAL: number[] = [2, 2]
export const SATELITE_RADIO_PUNTO_PX = 6
export const SATELITE_GROSOR_BORDE_PUNTO_PX = 1.5
// Estrella de los destacados: se dibuja en un lienzo de este lado (en px de pantalla) y a doble densidad
export const SATELITE_LADO_ESTRELLA_PX = 26
export const SATELITE_DENSIDAD_ESTRELLA = 2
export const SATELITE_PUNTAS_ESTRELLA = 5
export const SATELITE_RADIO_INTERNO_ESTRELLA = 0.42
export const SATELITE_GROSOR_BORDE_ESTRELLA_PX = 1.5

// Nombres internos de las fuentes, capas e imágenes de MapLibre
export const SATELITE_FUENTE_IMAGEN = 'imagen'
export const SATELITE_FUENTE_SECTORES = 'sectores'
export const SATELITE_FUENTE_ARBOLES = 'arboles'
export const SATELITE_CAPA_IMAGEN = 'imagen'
export const SATELITE_CAPA_RELLENO = 'sectores-relleno'
export const SATELITE_CAPA_BORDE = 'sectores-borde'
export const SATELITE_CAPA_BORDE_PROVISIONAL = 'sectores-borde-provisional'
export const SATELITE_CAPA_CONTORNO = 'sectores-contorno'
export const SATELITE_CAPA_ARBOLES = 'arboles-puntos'
export const SATELITE_CAPA_ESTRELLAS = 'arboles-estrellas'
export const SATELITE_IMAGEN_ESTRELLA = 'estrella'

export const TEXTOS_SATELITE = {
  grupoVista: 'Vista del mapa',
  ilustrado: 'Ilustrado',
  calles: 'Calles',
  satelite: 'Satélite',
  etiquetaMapa: {
    calles: 'Mapa de calles del campus',
    satelite: 'Mapa satelital del campus',
  },
  listaSectores: 'Sectores del campus',
  cargando: {
    calles: 'Cargando el mapa de calles',
    satelite: 'Cargando el mapa satelital',
  },
  errorTitulo: {
    calles: 'No pudimos cargar el mapa de calles.',
    satelite: 'No pudimos cargar el mapa satelital.',
  },
  errorAyuda: 'Vuelve a la vista ilustrada o prueba de nuevo.',
  reintentar: 'Reintentar',
  atribucionEtiqueta: 'Mapa base',
} as const
