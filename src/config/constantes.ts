// ---------- ENTRADA AL MAPA ----------

// PESO DE CADA VARIANTE DE ENTRADA (se sortea en cada carga)
export const PESOS_ENTRADA = { estandar: 998, alterna: 1 } as const

export type VarianteEntrada = keyof typeof PESOS_ENTRADA

// CUÁNTO SE VE LA ILUSTRACIÓN DE LA ENTRADA ALTERNA, EN ms (aprox. una vuelta: 21 cuadros de 120 ms)
export const DURACION_ENTRADA_ALTERNA_MS = 3000

// CUÁNTO TARDA EN DESVANECERSE LA ILUSTRACIÓN DE LA ENTRADA ALTERNA, EN ms
export const DURACION_SALIDA_ENTRADA_MS = 300

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

// ---------- ESTADOS COMPARTIDOS (carga, vacío y error) ----------

// TEXTOS DE LAS ACCIONES DE LOS ESTADOS COMPARTIDOS
export const TEXTOS_ESTADOS = {
  reintentar: 'Reintentar',
  limpiarFiltros: 'Limpiar filtros',
} as const

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

// ---------- ÁRBOLES DESTACADOS ----------

// LADO DE LA GRILLA EN QUE SE DIBUJA LA ESTRELLA (se escala al tamaño pedido)
export const ESTRELLA_LADO_GRILLA = 24

// CONTORNO DE LA ESTRELLA DE UN ÁRBOL DESTACADO, EN LA GRILLA DE ARRIBA
export const ESTRELLA_CONTORNO =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'

// TAMAÑO DE LA ESTRELLA RESPECTO AL PUNTO NORMAL (multiplica el diámetro del punto)
export const MAPA_ESCALA_ESTRELLA = 2.4

// TEXTOS DE LOS ÁRBOLES DESTACADOS
export const TEXTOS_DESTACADO = {
  etiqueta: 'Destacado',
  leyenda: 'Árbol destacado del sector',
} as const

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

// ---------- CÁPSULAS «?» Y «SOBRE ESTE ÁRBOL» ----------

// MARCADORES DE LAS PLANTILLAS DE TEXTO (se reemplazan por lo que manda la API)
export const MARCADOR_TITULO = '{titulo}'
export const MARCADOR_TEXTO = '{texto}'
export const MARCADOR_FUENTE = '{fuente}'

// CONSULTA DE MEDIOS: SOLO ASÍ UNA CÁPSULA SE ABRE AL PASAR EL CURSOR (en pantallas táctiles, con toque)
export const CONSULTA_HOVER_FINO = '(hover: hover) and (pointer: fine)'

// TEXTOS DE LAS CÁPSULAS «?» (la explicación de cada dato sale solo de la API)
export const TEXTOS_CAPSULA = {
  etiquetaBoton: 'Qué significa {titulo}',
  enEsteArbol: 'En este árbol: {texto}',
  unirTitulos: ' y ',
} as const

// TEXTOS DE LA SECCIÓN «SOBRE ESTE ÁRBOL»
export const TEXTOS_SOBRE_ARBOL = {
  titulo: 'Sobre este árbol',
  motivo: 'Por qué se destaca',
  beneficios: 'Qué aporta su especie',
  datoCurioso: 'Dato curioso',
  cuidados: 'Cuidados',
  fuente: 'Fuente: {fuente}',
} as const

// CONSULTA DE MEDIOS DE QUIEN PIDE MENOS MOVIMIENTO
export const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

// MARCA QUE LA APP DEJA EN EL ESTADO DEL HISTORIAL DE LAS ENTRADAS QUE ELLA AGREGA
export const MARCA_HISTORIAL = 'censoArboreoEntrada'

// ---------- RUTAS Y ARMAZÓN DEL SITIO ----------

// RUTAS DEL SITIO (la cartilla y el sector viajan en la consulta de /mapa: ?sector=…&arbol=…)
export const RUTAS = {
  inicio: '/',
  mapa: '/mapa',
  arboles: '/arboles',
  cifras: '/cifras',
} as const

// LICENCIA DE LOS DATOS DEL CONTORNO DEL CAMPUS (OpenStreetMap, ODbL)
export const URL_LICENCIA_ODBL = 'https://opendatacommons.org/licenses/odbl/1-0/'

// TEXTOS FIJOS DE LA CABECERA, EL PIE Y LA PÁGINA «NO ENCONTRADA»
export const TEXTOS_ARMAZON = {
  navegacionPrincipal: 'Principal',
  inicio: 'Inicio',
  mapa: 'Mapa',
  arboles: 'Árboles',
  cifras: 'Cifras',
  menu: 'Menú',
  creditoContorno: 'Contorno del campus © colaboradores de OpenStreetMap',
  nombreLicencia: 'ODbL',
  tituloNoEncontrada: 'Página no encontrada',
  fraseNoEncontrada: 'La dirección que abriste no existe o cambió de lugar.',
  volverAlInicio: 'Volver al inicio',
} as const

// PLANTILLAS DE LA NOTA DEL PIE SOBRE EL ORIGEN DE LOS DATOS. Los nombres de sector salen de la API
// y reemplazan el marcador; nada de aquí afirma qué sector es de campo.
export const MARCADOR_SECTORES = '{sectores}'
export const PLANTILLAS_NOTA_DATOS = {
  campoUno: '{sectores} tiene datos de campo.',
  campoVarios: '{sectores} tienen datos de campo.',
  ejemploUno: '{sectores} solo tiene datos de ejemplo.',
  ejemploVarios: '{sectores} solo tienen datos de ejemplo.',
  todosCampo: 'Todos los sectores tienen datos de campo.',
  todosEjemplo: 'Por ahora todos los sectores tienen solo datos de ejemplo.',
} as const

// ENLACES DE LA NAVEGACIÓN PRINCIPAL, EN ORDEN (agregar una página es agregar una fila).
// «exacta» evita que Inicio quede activo en todas las rutas.
export const ENLACES_NAVEGACION = [
  { ruta: RUTAS.inicio, texto: TEXTOS_ARMAZON.inicio, exacta: true },
  { ruta: RUTAS.mapa, texto: TEXTOS_ARMAZON.mapa, exacta: false },
  { ruta: RUTAS.arboles, texto: TEXTOS_ARMAZON.arboles, exacta: false },
  { ruta: RUTAS.cifras, texto: TEXTOS_ARMAZON.cifras, exacta: false },
] as const

// ---------- EXPLORAR ÁRBOLES Y CIFRAS DEL CENSO ----------

// TEXTOS DE LAS PÁGINAS DE EXPLORAR Y DE CIFRAS (mientras llegan sus vistas completas)
export const TEXTOS_EXPLORAR = {
  titulo: 'Explorar árboles',
  ariaFiltros: 'Buscar y filtrar árboles',
  buscar: 'Buscar',
  ayudaBuscar: 'Código, nombre común o nombre científico',
  sector: 'Sector',
  todosSectores: 'Todos los sectores',
  estado: 'Estado general',
  todosEstados: 'Todos los estados',
  origen: 'Origen del dato',
  todosOrigenes: 'Todos los orígenes',
  origenCampo: 'Datos de campo',
  origenEjemplo: 'Datos de ejemplo',
  soloDestacados: 'Solo destacados',
  resultados: 'Resultados',
  arbolSingular: 'árbol',
  arbolPlural: 'árboles',
  cargando: 'Cargando los árboles…',
  error: 'No pudimos cargar los árboles.',
  sinResultados: 'Ningún árbol coincide con la búsqueda y los filtros.',
  sinArboles: 'Aún no hay árboles registrados.',
} as const

// NOMBRES DE LOS PARÁMETROS DE LA URL DE EXPLORAR (?q=…&sector=…&estado=…&destacados=1&origen=…)
export const PARAMETROS_EXPLORAR = {
  busqueda: 'q',
  sector: 'sector',
  estado: 'estado',
  destacados: 'destacados',
  origen: 'origen',
} as const

// VALORES DEL FILTRO «ORIGEN DEL DATO» EN LA URL (campo = registrado por la brigada; ejemplo = demo)
export const ORIGENES_DATO = { campo: 'campo', ejemplo: 'ejemplo' } as const

// VALOR DEL PARÁMETRO «destacados» CUANDO EL FILTRO ESTÁ ACTIVO
export const VALOR_FILTRO_ACTIVO = '1'

export const TEXTOS_CIFRAS = {
  titulo: 'Cifras del censo',
  proximamente: 'Esta sección llega pronto',
} as const

// ---------- PÁGINA DE INICIO ----------

// TEXTOS FIJOS DE LA PÁGINA DE INICIO (ninguna cifra va escrita aquí: todas salen de la API)
export const TEXTOS_INICIO = {
  ciudad: 'Lima',
  sectorSingular: 'sector',
  sectorPlural: 'sectores',
  tituloPortada: 'Cada árbol del campus, ',
  tituloPortadaAcento: 'con nombre y medida.',
  frasePortada:
    'Recorre el campus por sectores, entra a cualquier árbol y abre su cartilla: especie, altura, diámetro, estado y foto.',
  explorarMapa: 'Explorar el mapa',
  verDestacados: 'Ver destacados',
  tituloFranja: 'El campus, árbol por árbol.',
  fraseFranja:
    'Elige un sector en el mapa para ver sus árboles. Cada punto abre una cartilla con su especie, sus medidas y su estado.',
  leyendaCampo: 'Datos de campo',
  leyendaEjemplo: 'Datos de ejemplo · límites provisionales',
  conteoDeCampo: 'de campo',
  conteoDeEjemplo: 'de ejemplo',
  sinArbolesAun: 'Sin árboles aún',
  cargandoSectores: 'Cargando los sectores…',
  errorSectores: 'No pudimos cargar los sectores.',
  tituloDestacados: 'Árboles destacados',
  cargandoDestacados: 'Cargando los árboles destacados…',
  errorDestacados: 'No pudimos cargar los árboles destacados.',
  sinDestacados: 'Aún no hay árboles destacados.',
  destacados: {
    dap: 'DAP',
    altura: 'Altura',
    cargandoMedidas: 'Cargando medidas…',
  },
  tituloCifras: 'El censo hoy',
  cargandoCifras: 'Cargando las cifras del censo…',
  errorCifras: 'No pudimos cargar las cifras del censo.',
  cifras: {
    arbolesDeCampo: { etiqueta: 'Árboles de campo', nota: 'registrados por la brigada' },
    sectores: { etiqueta: 'Sectores del campus', nota: 'los que muestra el mapa' },
    especiesIdentificadas: {
      etiqueta: 'Especies identificadas',
      nota: 'nombres científicos distintos, sin contar los de ejemplo',
    },
    arbolesDeEjemplo: { etiqueta: 'Árboles de ejemplo', nota: 'hasta que llegue la data real' },
  },
} as const

// CUÁNTAS TARJETAS DE ÁRBOLES DESTACADOS MUESTRA INICIO (como máximo)
export const CANTIDAD_DESTACADOS_INICIO = 6

// ID DEL TÍTULO DEL BLOQUE DE DESTACADOS (a él apunta «Ver destacados» de la portada)
export const ID_TITULO_DESTACADOS = 'destacados'

// CUÁNTOS BLOQUES DE ESQUELETO SE MUESTRAN EN LAS CIFRAS MIENTRAS CARGAN (uno por cifra)
export const CANTIDAD_CIFRAS_INICIO = Object.keys(TEXTOS_INICIO.cifras).length

// INTERLINEADO DE LOS TEXTOS DE CADA SECTOR EN EL MAPA DE INICIO, EN em
export const MAPA_INICIO_INTERLINEA_EM = 1.25

// CUÁNTO SUBE EL NOMBRE DEL SECTOR POR CADA LÍNEA DE CONTEO, EN em (así el bloque queda centrado)
export const MAPA_INICIO_SUBIDA_POR_LINEA_EM = 0.5
