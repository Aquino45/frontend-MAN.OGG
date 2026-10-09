// PROBABILIDAD DE QUE APAREZCA EL EASTER EGG (1 ENTRE 999)
export const PROBABILIDAD_EASTER_EGG = 1 / 999

// DURACIÓN DEL EASTER EGG EN MS (~1 VUELTA DEL GIF: 21 CUADROS x 120 MS, REDONDEADA)
export const DURACION_EASTER_EGG_MS = 3000

// ---------- TEMA CLARO Y OSCURO ----------

// ATRIBUTO DE <html> QUE INDICA EL TEMA ACTIVO (tokens.css lo usa en sus selectores)
export const ATRIBUTO_TEMA = 'data-tema'

// VALORES POSIBLES DEL TEMA (el oscuro es el de la paleta del GIF)
export const TEMAS = { oscuro: 'oscuro', claro: 'claro' } as const

// CLAVE DE localStorage DONDE SE RECUERDA EL TEMA ELEGIDO A MANO
export const CLAVE_TEMA_GUARDADO = 'censo-arboreo:tema'

// CONSULTA DE MEDIOS QUE DICE SI EL SISTEMA PREFIERE EL TEMA CLARO
export const CONSULTA_TEMA_CLARO = '(prefers-color-scheme: light)'

// TEXTOS DEL INTERRUPTOR DE TEMA (nombre accesible según el tema al que cambia)
export const TEXTOS_TEMA = {
  cambiarAClaro: 'Cambiar a tema claro',
  cambiarAOscuro: 'Cambiar a tema oscuro',
} as const

// ---------- MAPA DE SECTORES ----------

// REGIÓN DE FORMATO DE NÚMEROS DE LA INTERFAZ
export const REGION_INTERFAZ = 'es-PE'

// ANCHO DEL viewBox DEL MAPA EN UNIDADES SVG (el alto sale de la proporción real)
export const MAPA_ANCHO_VIEWBOX = 1000

// MARGEN INTERIOR DEL viewBox, EN UNIDADES SVG, PARA QUE NINGÚN BORDE QUEDE CORTADO
export const MAPA_MARGEN_VIEWBOX = 24

// DECIMALES DE LAS COORDENADAS SVG GENERADAS (suficiente para 1000 unidades)
export const MAPA_DECIMALES_SVG = 1

// TAMAÑO DE UN GLIFO DECORATIVO DE ÁRBOL, EN UNIDADES SVG
export const MAPA_TAMANO_GLIFO = 40

// CUÁNTOS GLIFOS DECORATIVOS SE INTENTAN PONER DENTRO DE CADA SECTOR
export const MAPA_GLIFOS_POR_SECTOR = 3

// TEXTOS FIJOS DEL MAPA
export const TEXTOS_MAPA = {
  tituloRegion: 'Mapa de los sectores del campus',
  arbolSingular: 'árbol',
  arbolPlural: 'árboles',
  sinArboles: 'Aún sin árboles registrados',
  limitesProvisionales: 'Límites provisionales',
  errorSectores: 'No pudimos cargar los sectores.',
  reintentar: 'Reintentar',
} as const

// FRASES QUE SE MUESTRAN MIENTRAS CARGA EL MAPA (se elige una por carga)
export const FRASES_CARGA = {
  contando: 'Contando árboles…',
  ubicando: 'Ubicando sectores…',
  midiendo: 'Midiendo el DAP…',
} as const

// PESO DE CADA FRASE DE CARGA (probabilidad proporcional al peso)
export const PESOS_FRASES_CARGA: Record<keyof typeof FRASES_CARGA, number> = {
  contando: 2,
  ubicando: 2,
  midiendo: 1,
}

// PESO DE CADA FORMA DE GLIFO DECORATIVO DE ÁRBOL DENTRO DE LOS SECTORES
export const PESOS_GLIFOS_ARBOL = { copaRedonda: 3, copaAlta: 2, palma: 1 } as const

// ---------- PRODUCTO ----------

// NOMBRE PÚBLICO DEL PRODUCTO (título de la página y de la cabecera)
export const NOMBRE_PRODUCTO = 'Censo arbóreo UPeU Lima'

// NOMBRE DEL CAMPUS DONDE SE HACE EL CENSO
export const NOMBRE_CAMPUS = 'UPeU Ñaña'

// ---------- ESTADO EN LA URL ----------

// NOMBRES DE LOS PARÁMETROS DE LA URL (?sector=<id>&arbol=<codigo>)
export const PARAMETROS_URL = { sector: 'sector', arbol: 'arbol' } as const

// ---------- ENTRADA AL SECTOR Y PUNTOS DE LOS ÁRBOLES ----------

// MARGEN, EN UNIDADES SVG, ENTRE EL BORDE DE UN SECTOR Y EL DEL RECUADRO AL ENTRAR EN ÉL
export const MAPA_MARGEN_ENTRADA = 28

// DURACIÓN DE LA TRANSICIÓN DEL RECUADRO AL ENTRAR O SALIR DE UN SECTOR (ms)
export const MAPA_DURACION_ENTRADA_MS = 320

// RADIO DE UN PUNTO DE ÁRBOL, EN UNIDADES SVG DEL MAPA COMPLETO (se reduce al acercar)
export const MAPA_RADIO_PUNTO = 9

// ANCHO DE PANTALLA, EN REM, DESDE EL CUAL EL PANEL VA A UN COSTADO (debajo, hoja inferior)
export const CORTE_PANEL_LATERAL_REM = 56

// TEXTOS FIJOS DEL PANEL DEL SECTOR
export const TEXTOS_PANEL = {
  volverASectores: '← Volver a los sectores',
  tituloLista: 'Árboles del sector',
  sinDatoNombre: 'Sin dato',
  sinUbicacion: 'Sin ubicación',
  sinNombreComun: 'especie sin dato',
  errorArboles: 'No pudimos cargar los árboles del sector.',
  reintentar: 'Reintentar',
  sinArboles: 'Aún sin árboles registrados',
  hojaInferior: 'Árboles del sector',
} as const

// ---------- CARTILLA DEL ÁRBOL ----------

// ESCALAS DE LOS INDICADORES VISUALES (el valor máximo que llena la barra o el anillo)
export const ESCALA_ALTURA_MAX_M = 15
export const ESCALA_COPA_MAX_M = 20

// ETIQUETA DE LA ZONA DE LAS COORDENADAS UTM
export const ETIQUETA_ZONA_UTM = 'UTM 18S'

// SEPARADOR DE MILES DE LOS NÚMEROS (espacio fino sin salto)
export const SEPARADOR_MILES = ' '

// DECIMALES Y UNIDAD DE CADA MAGNITUD. recortarCeros quita un «.0» final.
export const MEDIDAS = {
  alturaM: { decimales: 1, unidad: 'm', recortarCeros: false },
  copaM: { decimales: 1, unidad: 'm', recortarCeros: false },
  dapCm: { decimales: 1, unidad: 'cm', recortarCeros: true },
  co2AlmacenadoKg: { decimales: 0, unidad: 'kg CO₂e', recortarCeros: false },
  co2CapturaAnualKg: { decimales: 1, unidad: 'kg/año', recortarCeros: false },
  grados: { decimales: 6, unidad: '', recortarCeros: false },
  utmM: { decimales: 0, unidad: '', recortarCeros: false },
} as const

export type Magnitud = keyof typeof MEDIDAS

// ESTILO DEL CHIP DE ESTADO GENERAL SEGÚN SU VALOR (cualquier otro valor usa «otro»)
export const ESTILO_ESTADO_GENERAL: Record<string, string> = {
  Bueno: 'bueno',
  Regular: 'regular',
  Malo: 'malo',
}

export const ESTILO_ESTADO_OTRO = 'otro'

// TEXTOS FIJOS DE LA CARTILLA
export const TEXTOS_CARTILLA = {
  sinDato: 'Sin dato',
  volverALista: '← Lista del sector',
  cerrar: 'Cerrar cartilla',
  cargando: 'Abriendo la cartilla…',
  error: 'No pudimos cargar la cartilla.',
  reintentar: 'Reintentar',
  noEncontrado: 'No encontramos el árbol',
  selloDemo: 'Dato de ejemplo',
  fotoPendiente: 'Foto pendiente',
  fotoDelArbol: 'Foto del árbol',
  estado: 'Estado',
  conservacion: 'Conservación',
  altura: 'Altura total',
  copa: 'Copa',
  copaNorteSur: 'N-S',
  copaEsteOeste: 'E-O',
  copaCero: 'registrada',
  dap: 'DAP registrado',
  notaDap: 'Diámetro del tronco medido a 1.30 m del suelo',
  co2Almacenado: 'CO₂ almacenado',
  capturaAnual: 'Captura anual',
  estadoCopa: 'Estado de copa',
  troncoDanos: 'Tronco / daños',
  raicesBase: 'Raíces / base',
  interferencia: 'Interferencia',
  registrado: 'Registrado',
} as const

// CONSULTA DE MEDIOS DE QUIEN PIDE MENOS MOVIMIENTO
export const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

// MARCA QUE LA APP DEJA EN EL ESTADO DEL HISTORIAL DE LAS ENTRADAS QUE ELLA AGREGA
export const MARCA_HISTORIAL = 'censoArboreoEntrada'
