// Búsqueda y filtros de la lista de árboles, y su lectura y escritura en la URL.
// Funciones puras: no piden datos ni tocan el navegador.
import type { ArbolResumen } from '@/api/cliente'
import {
  ORIGENES_DATO,
  PARAMETROS_EXPLORAR,
  REGION_INTERFAZ,
  VALOR_FILTRO_ACTIVO,
} from '@/config/constantes'

export type OrigenDato = (typeof ORIGENES_DATO)[keyof typeof ORIGENES_DATO]

export interface FiltrosExplorar {
  // Texto del buscador tal como se escribió
  busqueda: string
  sectorId: number | null
  estadoGeneral: string | null
  soloDestacados: boolean
  origen: OrigenDato | null
}

export const FILTROS_VACIOS: FiltrosExplorar = {
  busqueda: '',
  sectorId: null,
  estadoGeneral: null,
  soloDestacados: false,
  origen: null,
}

// Minúsculas, sin tildes y sin espacios en los bordes: «ÁLAMO » y «alamo» son lo mismo.
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function leerSectorId(texto: string | null): number | null {
  return texto !== null && /^[1-9]\d*$/.test(texto) ? Number(texto) : null
}

function leerOrigen(texto: string | null): OrigenDato | null {
  return Object.values(ORIGENES_DATO).find((origen) => origen === texto) ?? null
}

export function leerFiltros(consulta: string): FiltrosExplorar {
  const parametros = new URLSearchParams(consulta)
  const estado = parametros.get(PARAMETROS_EXPLORAR.estado)
  return {
    busqueda: parametros.get(PARAMETROS_EXPLORAR.busqueda) ?? '',
    sectorId: leerSectorId(parametros.get(PARAMETROS_EXPLORAR.sector)),
    estadoGeneral: estado ? estado : null,
    soloDestacados: parametros.get(PARAMETROS_EXPLORAR.destacados) === VALOR_FILTRO_ACTIVO,
    origen: leerOrigen(parametros.get(PARAMETROS_EXPLORAR.origen)),
  }
}

// Cadena de consulta con el «?» inicial, o vacía si no hay filtros.
export function escribirFiltros(filtros: FiltrosExplorar): string {
  const parametros = new URLSearchParams()
  if (filtros.busqueda !== '') parametros.set(PARAMETROS_EXPLORAR.busqueda, filtros.busqueda)
  if (filtros.sectorId !== null)
    parametros.set(PARAMETROS_EXPLORAR.sector, String(filtros.sectorId))
  if (filtros.estadoGeneral !== null) {
    parametros.set(PARAMETROS_EXPLORAR.estado, filtros.estadoGeneral)
  }
  if (filtros.soloDestacados) {
    parametros.set(PARAMETROS_EXPLORAR.destacados, VALOR_FILTRO_ACTIVO)
  }
  if (filtros.origen !== null) parametros.set(PARAMETROS_EXPLORAR.origen, filtros.origen)
  const texto = parametros.toString()
  return texto === '' ? '' : `?${texto}`
}

export function hayFiltros(filtros: FiltrosExplorar): boolean {
  return (
    normalizarTexto(filtros.busqueda) !== '' ||
    filtros.sectorId !== null ||
    filtros.estadoGeneral !== null ||
    filtros.soloDestacados ||
    filtros.origen !== null
  )
}

export function filtrarArboles(
  arboles: readonly ArbolResumen[],
  filtros: FiltrosExplorar,
): ArbolResumen[] {
  const texto = normalizarTexto(filtros.busqueda)
  return arboles.filter((arbol) => {
    if (filtros.sectorId !== null && arbol.sector !== filtros.sectorId) return false
    if (filtros.estadoGeneral !== null && arbol.estado_general !== filtros.estadoGeneral) {
      return false
    }
    if (filtros.soloDestacados && !arbol.destacado) return false
    if (filtros.origen === ORIGENES_DATO.campo && arbol.demo) return false
    if (filtros.origen === ORIGENES_DATO.ejemplo && !arbol.demo) return false
    if (texto === '') return true
    return [arbol.codigo, arbol.nombre_comun, arbol.nombre_cientifico].some(
      (campo) => campo !== null && normalizarTexto(campo).includes(texto),
    )
  })
}

// Orden estable: por sector y luego por código (los números del código se comparan como números).
export function ordenarArboles(arboles: readonly ArbolResumen[]): ArbolResumen[] {
  return [...arboles].sort(
    (a, b) =>
      a.sector - b.sector || a.codigo.localeCompare(b.codigo, REGION_INTERFAZ, { numeric: true }),
  )
}

// Valores distintos de estado general que traen los árboles (nunca una lista escrita a mano).
export function opcionesDeEstado(arboles: readonly ArbolResumen[]): string[] {
  const estados = new Set<string>()
  for (const arbol of arboles) {
    if (arbol.estado_general !== null) estados.add(arbol.estado_general)
  }
  return [...estados].sort((a, b) => a.localeCompare(b, REGION_INTERFAZ))
}
