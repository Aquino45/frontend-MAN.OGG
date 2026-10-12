// ---------- ENTRADA AL MAPA ----------

// PESO DE CADA VARIANTE DE ENTRADA (se sortea en cada carga)
export const PESOS_ENTRADA = { estandar: 998, alterna: 1 } as const

export type VarianteEntrada = keyof typeof PESOS_ENTRADA

// ENTRADA ALTERNA: LA SECUENCIA. Todo en ms y desde que empieza. Es una pieza que se ve muy pocas veces,
// así que puede pasar de los 300 ms de la interfaz de todos los días.
// Hasta cuándo se ve entera, antes de que empiece a desvanecerse y deje ver la vista pedida
export const DURACION_ENTRADA_ALTERNA_MS = 8_300
// Cuánto tarda en desvanecerse al final (y al salir antes con Esc o un clic, bastante menos)
export const DURACION_SALIDA_ENTRADA_MS = 700
export const DURACION_SALIDA_ANTICIPADA_MS = 200
// Con «reducir movimiento»: todo quieto y completo este rato, sin sonido, y se sigue
export const DURACION_ENTRADA_ALTERNA_REDUCIDA_MS = 2_000

export const ENTRADA_ALTERNA = {
  // Después de la cortina de hojas (que dura CORTINA_HOJAS.cubrirMs) aparece el fondo con la ilustración
  ilustracionDesdeMs: 1_000,
  ilustracionDuracionMs: 600,
  // Hojas grandes en diagonal: la primera y luego una cada tanto, hasta que empieza el final
  hojaGrandeDesdeMs: 1_600,
  hojaGrandeCadaMs: 1_500,
  hojaGrandeCaidaMs: 2_600,
  // Tamaño de la hoja grande: fracción del lado menor de la pantalla; cada una cambia un paso de la
  // anterior y nunca se pasa del tope respecto de la base
  hojaGrandeBase: 0.14,
  hojaGrandePaso: 0.1,
  hojaGrandeTope: 0.3,
  // Qué parte del alto se corre hacia la derecha mientras cae (la diagonal)
  hojaGrandeDiagonal: 0.4,
  // La caja de diálogo entra de forma dramática, tras una pausa con la ilustración sola
  cajaDesdeMs: 2_400,
  cajaDuracionMs: 600,
  cajaDesplazamientoPx: 24,
  // Las frases se escriben letra por letra y se quedan un rato para leerlas
  frase1DesdeMs: 3_000,
  frase2DesdeMs: 5_500,
  msPorLetra: 35,
  // Hasta cuándo se puede forzar con el gesto previo (el navegador solo deja sonar tras un gesto)
  gestoValidoMs: 1_500,
} as const

export const TEXTOS_ENTRADA_ALTERNA = {
  frases: ['* Bueno, aquí hay un hombre.', '* Quizás se alegre de verte.'],
} as const

// SONIDO DE LA ENTRADA ALTERNA (sintetizado con Web Audio; volumen bajo y fijo)
export const SONIDO_ENTRADA_ALTERNA = {
  // Cada letra suena con un blip corto, agudo y dulce (onda cuadrada); alternan dos notas para que no cansen
  blipFrecuenciasHz: [1_318.5, 1_568],
  blipDuracionMs: 45,
  blipVolumen: 0.04,
  // La pista de fondo entra y sale con fundidos
  pistaVolumen: 0.18,
  pistaFundidoEntradaMs: 600,
  pistaFundidoSalidaMs: 700,
} as const

// FORZAR LA VARIANTE A MANO: un clic simple en el árbol de Inicio abre una ventana; si en ese lapso se
// escribe la clave, sale. La clave nunca va escrita: se compara su huella SHA-256 (hex, de la clave en
// minúsculas y sin espacios).
export const FORZAR_ENTRADA = {
  ventanaMs: 8_000,
  largoClave: 6,
  // Un clic es simple si se suelta antes de esto (más largo ya es mantener presionado)
  clicMaximoMs: 400,
  // Mientras no se defina la clave real, la huella no coincide con nada que se pueda teclear
  huella: '91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203',
} as const

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

// MARCA: LOS TEXTOS DEL LOGO (EL WORDMARK ES «CENSO» EN MAYÚSCULAS ESPACIADAS Y «ARBÓREO» GRANDE)
export const TEXTOS_MARCA = {
  censo: 'Censo',
  arboreo: 'Arbóreo',
  upeu: 'Universidad Peruana Unión',
} as const

// SPRITE PIXEL DE CADA ESPECIE: SE ELIGE POR EL GÉNERO DEL NOMBRE CIENTÍFICO O POR UN ALIAS DEL
// NOMBRE COMÚN (SIN TILDES NI MAYÚSCULAS). SI NO HAY COINCIDENCIA SE USA EL GENÉRICO.
export const SPRITES_POR_ESPECIE = {
  palma: { generos: ['roystonea'], alias: ['palma real', 'palmera real'] },
  huarango: { generos: ['prosopis'], alias: ['huarango', 'algarrobo'] },
  molle: { generos: ['schinus'], alias: ['molle', 'molle serrano', 'pimentero'] },
  ficus: { generos: ['ficus'], alias: ['ficus', 'higuera', 'matapalo'] },
} as const
export const SPRITE_GENERICO = 'generico'
export type ClaveSprite = keyof typeof SPRITES_POR_ESPECIE | typeof SPRITE_GENERICO

// NOMBRE DEL CAMPUS DONDE SE HACE EL CENSO
export const NOMBRE_CAMPUS = 'UPeU Ñaña'

// ---------- ESTADO EN LA URL ----------

// NOMBRES DE LOS PARÁMETROS DE LA URL (?sector=<id>&arbol=<codigo>)
export const PARAMETROS_URL = { sector: 'sector', arbol: 'arbol' } as const

// ---------- ENTRADA AL SECTOR Y PUNTOS DE LOS ÁRBOLES ----------

// MARGEN, EN UNIDADES SVG, ENTRE EL BORDE DE UN SECTOR Y EL DEL RECUADRO AL ENTRAR EN ÉL
export const MAPA_MARGEN_ENTRADA = 28

// DURACIÓN DE LA TRANSICIÓN DEL RECUADRO AL ENTRAR O SALIR DE UN SECTOR (ms) Y SU CURVA.
// Son los valores de --duracion-zoom y --curva-movimiento (un test comprueba que coinciden).
export const MAPA_DURACION_ENTRADA_MS = 280
export const MAPA_CURVA_ZOOM = [0.77, 0, 0.175, 1] as const

// HOJA INFERIOR DEL CELULAR: LO QUE LEE EL GESTO DE ARRASTRE (el resto del movimiento vive en CSS).
// Cierra por velocidad (px/ms) o por la fracción del alto que se bajó; por debajo de la holgura
// (px) el toque no cuenta como arrastre. El elástico (px) es lo más que sube al jalar hacia
// arriba y es igual a --hoja-extension.
export const HOJA_ARRASTRE = {
  velocidadCierrePxPorMs: 0.11,
  fraccionCierre: 0.25,
  holguraInicioPx: 8,
  elasticoPx: 24,
} as const

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

// ---------- ATAJO AL PANEL ----------
// Cuánto hay que mantener presionado el árbol de la portada para ir al panel, en ms
export const ACCESO_PANEL_RETENCION_MS = 5_000
// Cuántas celdas del árbol puede moverse el puntero sin que se cancele la pulsación
export const ACCESO_PANEL_TOLERANCIA_CELDAS = 3
// Desde cuándo de la presión empieza a verse la señal de progreso: un toque casual no la ve
export const ACCESO_PANEL_SENAL_DESDE_MS = 1_000
// Cuánto tarda en apagarse la señal al soltar (rápido: soltar es una respuesta, no una decisión)
export const ACCESO_PANEL_SENAL_SALIDA_MS = 200
// Cuánto se ilumina el árbol al llegar la señal a la copa (0 a 1)
export const ACCESO_PANEL_SENAL_OPACIDAD = 0.14

// CORTINA DE HOJAS PIXEL (la comparten el desbloqueo y la variante alterna de la entrada). Todo en ms.
// Es una pieza de presentación que se ve muy pocas veces: puede pasar de los 300 ms de la interfaz
// de todos los días. Las hojas caen en diagonal hacia la derecha, en una ola de izquierda a derecha.
export const CORTINA_HOJAS = {
  // Cuánto tarda en quedar toda la pantalla cubierta
  cubrirMs: 1_000,
  // Cada hoja cae en este tiempo
  caidaHojaMs: 640,
  // Cuánto se corre hacia la derecha mientras cae, por cada píxel de caída (la diagonal)
  diagonal: 0.35,
  // Escalonado: por columna, por fila y una variación fija por hoja (sin azar, reproducible)
  retrasoColumnaMs: 30,
  retrasoFilaMs: 14,
  variacionHojaMs: 40,
  // Tope del retraso de cualquier hoja: la última asienta justo al terminar de cubrir
  retrasoMaximoHojaMs: 360,
  // El fondo detrás de las hojas cubre lo que queda entre ellas
  fondoRetrasoMs: 400,
  fondoDuracionMs: 400,
  // Cuánto tarda en retirarse (fundido) cuando otra capa toma la pantalla
  retiradaMs: 500,
  // Tope de hojas: sostiene los 60 fps también con la CPU 4× más lenta
  hojasMax: 96,
  // Cada hoja mide 5 x 5 celdas y la celda es de píxeles enteros
  celdasPorHoja: 5,
  celdaMinimaPx: 4,
  // Cuánto se solapan las hojas vecinas (fracción del lado): ninguna, así se lee cada hoja
  solape: 0,
} as const
// Misma curva fuerte de salida que --curva-salida (un test las compara)
export const CORTINA_CURVA = [0.23, 1, 0.32, 1] as const

// ANIMACIÓN DE DESBLOQUEO: cuando la cortina de hojas ya cubre, las hojas se apagan, un candado pixel se
// abre y entra el texto. Todo en ms; los tiempos corren desde que se activa.
export const DESBLOQUEO_ANIMACION = {
  // Cuánto dura todo; al terminar se navega
  duracionTotalMs: 2_300,
  // Las hojas se apagan hasta esta opacidad para que el texto se lea limpio
  atenuadoRetrasoMs: 1_000,
  atenuadoDuracionMs: 300,
  atenuadoOpacidad: 0.78,
  // El candado entra (opacidad + 8 px) y luego su arco sube y queda abierto
  candadoRetrasoMs: 1_150,
  candadoDuracionMs: 280,
  arcoRetrasoMs: 1_450,
  arcoDuracionMs: 240,
  arcoCeldasQueSube: 1,
  candadoCeldaPx: 8,
  // El texto entra palabra por palabra, desde 8 px más abajo
  textoRetrasoMs: 1_300,
  textoEscalonadoMs: 70,
  textoDuracionMs: 280,
  textoDesplazamientoPx: 8,
  // La línea bajo el texto se dibuja de izquierda a derecha
  lineaRetrasoMs: 1_700,
  lineaDuracionMs: 300,
  // Con «reducir movimiento» se ve el texto un instante y se navega
  demoraReducidaMs: 700,
} as const

export const TEXTOS_DESBLOQUEO = {
  anuncio: 'Modo admin desbloqueado',
  palabras: ['Modo', 'admin', 'desbloqueado'],
} as const

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

// CUÁNTOS PASOS DE ESCALONADO TIENE LA CASCADA DE PUNTOS DE UN SECTOR (el resto entra con el último)
export const MAPA_PASOS_CASCADA = 8

// FRASE PARA LECTORES DE PANTALLA MIENTRAS SE TRAE EL CÓDIGO DE UNA PÁGINA
export const TEXTO_CARGANDO_PAGINA = 'Cargando la página'

// ---------- MOTIVOS PIXEL DEL SITIO ----------
// Lado de una celda del horizonte de copa entre secciones, en px enteros (más fina que la del árbol)
export const HORIZONTE_CELDA_PX = 4

// ---------- CONTEO DE CIFRAS AL ENTRAR EN PANTALLA ----------
export const CONTEO_ANIMADO = {
  // Lo que tarda un número en contar de 0 a su valor
  duracionMs: 900,
} as const

// Cuántas tarjetas destacadas escalonan su entrada; las demás entran con la última
export const DESTACADOS_PASOS_ESCALONADO = 6

// ---------- ÁRBOL ANIMADO DE LA PORTADA ----------
// Todo va en cuadros enteros, como pixel art: nada gira ni se escala, y lo que se mueve se mueve
// de a una celda de la rejilla del árbol (ver inicio/lib/dibujoArbol.ts). Tiempos en milisegundos.
export const ARBOL_ANIMADO = {
  // Espera tras terminar la entrada del sitio
  retrasoInicioMs: 120,
  // Reposo: cada cuadro de la copa dura esto; entre ciclos, el cuadro base descansa
  cuadroMs: 220,
  pausaBaseMs: 3800,
  // Hojas que caen solas (de a una celda por paso) y ráfaga al presionar
  hojaPasoMs: 150,
  hojaPasosMax: 16,
  hojaIntervaloMinMs: 7000,
  hojaIntervaloMaxMs: 11000,
  hojasSimultaneas: 2,
  abanicoHojas: 5,
  abanicoEscalonMs: 70,
  abanicoDerivaPorPaso: 0.5,
  // Respuesta al puntero: los lóbulos de arriba se corren una celda hacia el cursor
  punteroZonaMuertaAnchos: 0.12,
  punteroAlcanceAnchos: 1.5,
  sacudidaPasoMs: 60,
  enfriamientoPulsacionMs: 600,
} as const

// ---------- TRANSICIONES ENTRE PÁGINAS Y DE TEMA ----------
// Atributo en <html> que dice qué transición está en curso (el CSS elige su animación)
export const ATRIBUTO_TRANSICION = 'data-transicion'
export const TRANSICIONES = { pagina: 'pagina', tema: 'tema' } as const
// Si la página nueva tarda más que esto en dibujarse, la transición sigue sin esperarla
export const TIEMPO_MAXIMO_TRANSICION_MS = 1000

// ---------- ENTRADA DE LA LISTA DE EXPLORAR ----------
// Cuántos pasos de escalonado tiene la entrada de las filas (el resto entra con el último)
export const EXPLORAR_PASOS_ESCALONADO = 8
// Cuánto dura toda la entrada, en ms: pasa a ser normal la lista (sin animación) para las filas que
// aparecen después. Cubre los pasos con su retraso (30 ms) y la duración de la entrada (200 ms).
export const EXPLORAR_FIN_ENTRADA_MS = 700
