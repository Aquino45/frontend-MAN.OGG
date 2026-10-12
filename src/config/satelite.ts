// Vista satelital del mapa: textos, atribución, claves de almacenamiento y medidas del encuadre.
// La URL del servicio y la clave salen del entorno (`config/entorno.ts`).

// Servicio de teselas de Esri World Imagery con clave. La clave se agrega como `token`.
export const SATELITE_URL_TESELAS_POR_DEFECTO =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const SATELITE_PARAMETRO_CLAVE = 'token'
export const SATELITE_TAMANO_TESELA_PX = 256
export const SATELITE_ZOOM_MAXIMO = 19

// Atribución obligatoria de Esri y de los proveedores de la imagen (texto por confirmar con los
// términos del servicio).
export const SATELITE_ATRIBUCION =
  'Esri, Maxar, Earthstar Geographics y la comunidad de usuarios de GIS'
export const SATELITE_ENLACE_ATRIBUCION = 'https://www.esri.com/'

export const VISTAS_MAPA = ['ilustrado', 'satelite'] as const
export type VistaMapaTipo = (typeof VISTAS_MAPA)[number]

// Preferencia del color de la foto, guardada en el navegador como el tema
export const CLAVE_SATELITE_COLOR_NATURAL = 'satelite-color-natural'

// Márgenes del encuadre en píxeles (el mapa satelital se acerca a un sector con este aire)
export const SATELITE_MARGEN_CAMPUS_PX = 48
export const SATELITE_MARGEN_SECTOR_PX = 32
export const SATELITE_DURACION_VUELO_MS = 800

// Tinte de la foto: la imagen pierde su color y una capa de la paleta se mezcla encima
export const SATELITE_SATURACION_TENIDA = -1
export const SATELITE_SATURACION_NATURAL = 0
export const SATELITE_OPACIDAD_RELLENO_SECTOR = 0.18
export const SATELITE_OPACIDAD_RELLENO_ACTIVO = 0.42
export const SATELITE_GROSOR_BORDE_SECTOR = 2
export const SATELITE_GROSOR_BORDE_ACTIVO = 4
export const SATELITE_RADIO_PUNTO_PX = 6
export const SATELITE_RADIO_PUNTO_ACTIVO_PX = 9
export const SATELITE_GROSOR_BORDE_PUNTO_PX = 1.5

// Nombres internos de las fuentes y capas de MapLibre
export const SATELITE_FUENTE_IMAGEN = 'imagen'
export const SATELITE_FUENTE_SECTORES = 'sectores'
export const SATELITE_FUENTE_ARBOLES = 'arboles'
export const SATELITE_CAPA_IMAGEN = 'imagen'
export const SATELITE_CAPA_RELLENO = 'sectores-relleno'
export const SATELITE_CAPA_BORDE = 'sectores-borde'
export const SATELITE_CAPA_ARBOLES = 'arboles-puntos'

export const TEXTOS_SATELITE = {
  grupoVista: 'Vista del mapa',
  ilustrado: 'Ilustrado',
  satelite: 'Satélite',
  colorNatural: 'Color natural',
  colorTenido: 'Color de la paleta',
  etiquetaMapa: 'Mapa satelital del campus',
  listaSectores: 'Sectores del campus',
  cargando: 'Cargando el mapa satelital',
  errorTitulo: 'No pudimos cargar el mapa satelital.',
  errorAyuda: 'Vuelve a la vista ilustrada o prueba de nuevo.',
  reintentar: 'Reintentar',
  atribucionEtiqueta: 'Imágenes',
} as const
