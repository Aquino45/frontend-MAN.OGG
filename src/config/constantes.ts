// ---------- ENTRADA AL MAPA ----------

// PESO DE CADA VARIANTE DE ENTRADA (se sortea en cada carga)
export const PESOS_ENTRADA = { estandar: 998, alterna: 1 } as const

export type VarianteEntrada = keyof typeof PESOS_ENTRADA

// CUÁNTO SE VE LA ILUSTRACIÓN DE LA ENTRADA ALTERNA, EN ms (aprox. una vuelta: 21 cuadros de 120 ms)
export const DURACION_ENTRADA_ALTERNA_MS = 3000

// CUÁNTO TARDA EN DESVANECERSE LA ILUSTRACIÓN DE LA ENTRADA ALTERNA, EN ms
export const DURACION_SALIDA_ENTRADA_MS = 200
// Lo que dura el fundido de la entrada estándar (lo que Inicio espera antes de animar su árbol)
export const DURACION_APARICION_ENTRADA_MS = 200

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
  co2AlmacenadoT: { decimales: 1, unidad: 't CO₂e', recortarCeros: false },
  co2CapturaAnualKg: { decimales: 1, unidad: 'kg/año', recortarCeros: false },
  co2CapturaAnualT: { decimales: 1, unidad: 't/año', recortarCeros: false },
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
  co2Simulado: 'Simulado',
  co2SimuladoAccesible: 'Valor simulado; se reemplazará con el dato real',
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

// CÓMO SE ESTÁ USANDO EL SITIO: con el teclado no se anima nada (lo lee el CSS en <html>)
export const ATRIBUTO_MODALIDAD_ENTRADA = 'data-entrada'
export const MODALIDADES_ENTRADA = { teclado: 'teclado', puntero: 'puntero' } as const
// Teclas que por sí solas no son una acción de teclado
export const TECLAS_MODIFICADORAS = ['Shift', 'Control', 'Alt', 'Meta'] as const

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
  sectorDesconocido: 'Sector {id}',
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

// PAUSA, EN ms, ANTES DE ESCRIBIR EN LA URL LO QUE SE TECLEA EN EL BUSCADOR
export const DEBOUNCE_BUSQUEDA_MS = 200

// TIEMPO, EN ms, QUE VALE LO YA PEDIDO DE SECTORES Y ÁRBOLES DEL CAMPUS ANTES DE VOLVER A PEDIRLO
export const TIEMPO_VIDA_CACHE_CAMPUS_MS = 5 * 60 * 1000

// VALOR DEL PARÁMETRO «destacados» CUANDO EL FILTRO ESTÁ ACTIVO
export const VALOR_FILTRO_ACTIVO = '1'

export const TEXTOS_CIFRAS = {
  titulo: 'Cifras del censo',
  cargando: 'Cargando las cifras del censo…',
  error: 'No pudimos cargar las cifras del censo.',
  sinArboles: 'Aún no hay árboles registrados.',
  campo: 'Datos de campo',
  ejemplo: 'Datos de ejemplo',
  total: 'Total',
  unidadCampo: 'campo',
  unidadEjemplo: 'ejemplo',
  notaSeparados: 'Los datos de campo y los de ejemplo se cuentan siempre por separado.',
  resumen: 'Resumen',
  arbolesDeCampo: 'Árboles de campo',
  arbolesDeEjemplo: 'Árboles de ejemplo',
  otras: 'Otras',
  sinEspecie: 'Sin especie identificada',
  sectorSinNombre: 'Sector {id}',
  tablaConDesplazamiento: 'Tabla (se desplaza hacia los lados en pantallas angostas)',
  porSector: {
    titulo: 'Árboles por sector',
    columna: 'Sector',
    descripcion: 'Árboles por sector, separados en datos de campo y datos de ejemplo',
  },
  porEstado: {
    titulo: 'Árboles por estado general',
    columna: 'Estado general',
    descripcion: 'Árboles por estado general, separados en datos de campo y datos de ejemplo',
  },
  porEspecie: {
    titulo: 'Árboles por especie',
    columna: 'Especie (nombre científico)',
    descripcion: 'Especies más frecuentes, separadas en datos de campo y datos de ejemplo',
  },
  destacados: {
    titulo: 'Árboles destacados por sector',
    columna: 'Sector',
    descripcion: 'Árboles destacados por sector, separados en datos de campo y datos de ejemplo',
  },
  co2: {
    titulo: 'CO₂ del campus',
    simulado: 'Estimaciones simuladas: se reemplazarán con los datos reales',
    sinDato: '{n} árboles sin dato de CO₂',
    sinDatoUno: '1 árbol sin dato de CO₂',
    campo: 'Campo',
    ejemplo: 'Ejemplo',
    total: 'Total',
    arbol: 'Árbol',
    especie: 'Especie',
    sector: 'Sector',
    valor: 'CO₂ almacenado',
    verEnMapa: 'Ver la cartilla de {codigo} en el mapa',
    almacenadoPorSector: {
      titulo: 'CO₂ almacenado por sector',
      columna: 'Sector',
      descripcion: 'CO₂ almacenado por sector, separado en datos de campo y datos de ejemplo',
    },
    almacenadoPorEspecie: {
      titulo: 'CO₂ almacenado por especie',
      columna: 'Especie (nombre científico)',
      descripcion:
        'Especies con más CO₂ almacenado, separadas en datos de campo y datos de ejemplo',
    },
    capturaPorSector: {
      titulo: 'Captura anual de CO₂ por sector',
      columna: 'Sector',
      descripcion: 'Captura anual de CO₂ por sector, separada en datos de campo y datos de ejemplo',
    },
    top: {
      titulo: 'Los 10 árboles con más CO₂ almacenado',
      descripcion: 'Árboles con más CO₂ almacenado, ordenados de mayor a menor',
    },
  },
} as const

// CUÁNTAS ESPECIES SE MUESTRAN POR SEPARADO EN LAS CIFRAS (las demás se agrupan en «Otras»)
export const CANTIDAD_ESPECIES_CIFRAS = 5

// CUÁNTAS ESPECIES SE MUESTRAN POR SEPARADO EN LAS CIFRAS DE CO₂ (las demás se agrupan en «Otras»)
export const CANTIDAD_ESPECIES_CO2_CIFRAS = 5

// CUÁNTOS ÁRBOLES TRAE EL RANKING DE CO₂ ALMACENADO
export const CANTIDAD_TOP_ARBOLES_CO2 = 10

// DESDE CUÁNTOS kg UNA CIFRA DE CO₂ SE MUESTRA EN TONELADAS, Y CUÁNTOS kg TIENE UNA TONELADA
export const UMBRAL_CO2_A_TONELADAS_KG = 10_000
export const KG_POR_TONELADA = 1_000

// DURACIÓN DE LA ENTRADA DE LAS BARRAS DE LOS GRÁFICOS DE CO₂ (ms; se apaga con «reducir movimiento»)
export const DURACION_ENTRADA_GRAFICOS_MS = 400

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

// ---------- ÁRBOL ANIMADO DE LA PORTADA ----------
// Tiempos en milisegundos y medidas en celdas de la rejilla del árbol (ver inicio/lib/rejillaArbol.ts).
export const ARBOL_ANIMADO = {
  // Espera tras terminar la entrada del sitio
  retrasoInicioMs: 120,
  // Crecimiento: una semilla, el tronco en pasos y la copa fila por fila de abajo hacia arriba
  semillaMs: 120,
  troncoPrimerPasoMs: 120,
  troncoPasoMs: 100,
  troncoFundidoMs: 80,
  copaInicioMs: 480,
  copaEscalonadoMs: 50,
  copaFilaMs: 160,
  destelloInicialMs: 1380,
  destelloInicialDuracionMs: 120,
  // Vida en reposo
  respiracionSentidoMs: 2000,
  respiracionEscala: 1.025,
  respiracionRapida: 1.3,
  meceoSentidoMs: 3000,
  meceoCeldas: 1,
  meceoMinimoProporcion: 0.25,
  meceoDesfaseMs: 80,
  barridoDuracionMs: 900,
  barridoCicloMs: 10000,
  barridoRetrasoMs: 5000,
  parpadeoDuracionMs: 600,
  parpadeoCicloMs: 6500,
  parpadeoRetrasoMs: 3000,
  // Hojas que caen solas y ráfaga al presionar
  hojaIntervaloMinMs: 7000,
  hojaIntervaloMaxMs: 11000,
  hojasSimultaneas: 2,
  hojaCaidaMs: 2200,
  hojaVaivenCeldas: 1,
  abanicoHojas: 5,
  abanicoCaidaMs: 1400,
  abanicoDerivaCeldas: 3,
  // Respuesta al puntero
  inclinacionGrados: 2,
  inclinacionCeldas: 1,
  inclinacionSuavizado: 0.12,
  inclinacionAlcanceAnchos: 2,
  sacudidaMs: 240,
  sacudidaCeldas: 1,
  enfriamientoPulsacionMs: 600,
} as const

// Red de seguridad de rendimiento: en falso el reposo queda en mecido y hojas (sin respiración,
// barrido de luz ni parpadeo).
export const ARBOL_REPOSO_COMPLETO = true

// ---------- TRANSICIONES ENTRE PÁGINAS Y DE TEMA ----------
// Atributo en <html> que dice qué transición está en curso (el CSS elige su animación)
export const ATRIBUTO_TRANSICION = 'data-transicion'
export const TRANSICIONES = { pagina: 'pagina', tema: 'tema' } as const
// Si la página nueva tarda más que esto en dibujarse, la transición sigue sin esperarla
export const TIEMPO_MAXIMO_TRANSICION_MS = 1000
