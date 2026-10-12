// Constantes y textos del tablero de Cifras (el dashboard). Aparte de constantes.ts para no pasar del
// largo razonable de un archivo; las reglas son las mismas: nada de números ni textos en el código.

// VALOR DEL CATÁLOGO DE LA PLANILLA QUE MARCA A UN ÁRBOL COMO NATIVO (SU CAMPO `origen`)
export const ORIGEN_NATIVO = 'Nativa'

// PARÁMETROS DE LA URL DE CIFRAS: LOS FILTROS SE GUARDAN AQUÍ (SIN ELLOS, «TODOS»)
export const PARAMETROS_TABLERO = {
  sector: 'sector',
  datos: 'datos',
  especie: 'especie',
  metrica: 'metrica',
} as const

export const DATOS_TABLERO = { todos: 'todos', campo: 'campo', ejemplo: 'ejemplo' } as const
export const METRICAS_MAPA_CALOR = { arboles: 'arboles', co2: 'co2', dap: 'dap' } as const

// CUÁNTAS ESPECIES MUESTRA LA DONA ANTES DE JUNTAR EL RESTO EN «OTRAS»
export const CANTIDAD_ESPECIES_DONA = 4

// ANCHO DE CADA RANGO DEL HISTOGRAMA DE DAP, EN cm
export const ANCHO_RANGO_DAP_CM = 50

// CUÁNTOS ÁRBOLES SE LISTAN EN LA TABLA ACCESIBLE DE LA DISPERSIÓN (LOS DE MÁS CO₂ PRIMERO)
export const FILAS_TABLA_DISPERSION = 10

export const TEXTOS_TABLERO = {
  intro:
    'Todo sale de la API. Los árboles de campo y los de ejemplo se cuentan por separado, y el CO₂ está marcado como simulado.',
  filtros: {
    grupo: 'Filtros del tablero',
    sector: 'Sector',
    datos: 'Datos',
    todos: 'Todos',
    campo: 'Campo',
    ejemplo: 'Ejemplo',
    sectorN: 'Sector {id}',
    especieActiva: 'Especie: {especie}',
    quitarEspecie: 'Quitar',
    sinResultados: 'Ningún árbol cumple estos filtros.',
    limpiar: 'Quitar los filtros',
  },
  kpis: {
    titulo: 'Resumen',
    arboles: 'Árboles',
    especies: 'Especies',
    co2: 'CO₂ almacenado',
    captura: 'Captura anual',
    mayorDap: 'Mayor DAP',
    nativas: 'Nativas',
    campo: 'campo',
    ejemplo: 'ejemplo',
    simulado: 'Simulado',
    sinDato: 'Sin dato',
    especiesDe: '{n} en campo · {m} en ejemplo',
    nativasDe: '{n} de {total}',
    verCartilla: 'Ver la cartilla de {codigo}',
  },
  mapaCalor: {
    titulo: 'Mapa de calor por sector',
    descripcion: 'Un clic en un sector lo elige como filtro de todo el tablero',
    metrica: 'Qué mide el mapa',
    arboles: 'Árboles',
    co2: 'CO₂',
    dap: 'DAP medio',
    menos: 'menos',
    mas: 'más',
    etiquetaSector: '{sector} {valor}',
    columnaSector: 'Sector',
    sinDato: 'sin dato',
  },
  especies: {
    titulo: 'Especies',
    descripcion: 'Un clic en una especie la elige como filtro de todo el tablero',
    total: 'árboles',
    columnaEspecie: 'Especie',
    columnaArboles: 'Árboles',
    columnaCampo: 'Campo',
    columnaEjemplo: 'Ejemplo',
    otras: 'Otras',
    sinNombre: 'Sin especie identificada',
  },
  estado: {
    titulo: 'Estado por sector',
    descripcion: 'Árboles por estado general, al 100 % de cada sector',
    columnaSector: 'Sector',
    sinDato: 'Sin dato',
    ejemplo: 'Borde punteado: datos de ejemplo',
    etiquetaBarra: '{sector}: {estado}, {n}',
  },
  nativas: {
    titulo: 'Nativas y exóticas',
    descripcion: 'Según el origen que dice la planilla',
    nativas: 'Nativas',
    exoticas: 'Exóticas',
    sinDato: 'Sin dato',
    columnaGrupo: 'Datos',
    etiquetaMedia: '{p} % nativas, {grupo}',
  },
  dispersion: {
    titulo: 'DAP y altura',
    descripcion:
      'Color: especie. Tamaño: CO₂ almacenado (simulado). Un clic en un punto abre su cartilla',
    ejeX: 'DAP (cm)',
    ejeY: 'Altura (m)',
    tamano: 'Tamaño: CO₂ almacenado',
    campo: 'Campo',
    ejemplo: 'Ejemplo (borde punteado)',
    sinMedidas: '{n} árboles sin DAP o sin altura no aparecen',
    sinMedidasUno: '1 árbol sin DAP o sin altura no aparece',
    etiquetaPunto: '{codigo}, {especie}, DAP {dap} cm, altura {altura} m. Abrir la cartilla',
    columnaCodigo: 'Árbol',
    columnaEspecie: 'Especie',
    columnaDap: 'DAP (cm)',
    columnaAltura: 'Altura (m)',
    columnaCo2: 'CO₂ (simulado)',
    columnaDatos: 'Datos',
  },
  histograma: {
    titulo: 'Distribución del DAP',
    descripcion: 'Árboles por rango de diámetro, de campo y de ejemplo por separado',
    ejeX: 'DAP (cm)',
    columnaRango: 'Rango de DAP (cm)',
    campo: 'Campo',
    ejemplo: 'Ejemplo (borde punteado)',
    rango: '{desde} a {hasta}',
    sinDap: '{n} árboles sin DAP no aparecen',
    sinDapUno: '1 árbol sin DAP no aparece',
  },
  tabla: { ver: 'Ver {grafico} como tabla', regionDe: 'Tabla de {grafico}' },
  sinDato: 'Sin dato',
} as const

// CUÁNTOS BLOQUES TIENE EL ESQUELETO MIENTRAS CARGA EL TABLERO (SOLO LA FORMA, SIN NÚMEROS)
export const BLOQUES_ESQUELETO_TABLERO = 4
