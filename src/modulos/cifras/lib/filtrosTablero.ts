// Filtros del tablero de Cifras: qué sector, qué datos (campo o ejemplo), qué especie y qué mide el
// mapa de calor. Viven en la URL (sin parámetro, «todos»). Funciones puras.
import type { ArbolFeature } from '@/api/cliente'
import { DATOS_TABLERO, METRICAS_MAPA_CALOR, PARAMETROS_TABLERO } from '@/config/constantes'

export type DatosFiltro = (typeof DATOS_TABLERO)[keyof typeof DATOS_TABLERO]
export type MetricaMapa = (typeof METRICAS_MAPA_CALOR)[keyof typeof METRICAS_MAPA_CALOR]

export interface FiltrosTablero {
  // null = todos los sectores
  sector: number | null
  datos: DatosFiltro
  // Nombre científico; null = todas
  especie: string | null
  metrica: MetricaMapa
}

export const FILTROS_INICIALES: FiltrosTablero = {
  sector: null,
  datos: DATOS_TABLERO.todos,
  especie: null,
  metrica: METRICAS_MAPA_CALOR.arboles,
}

const esDe = <Valor extends string>(valores: Record<string, Valor>, texto: string | null) =>
  Object.values(valores).find((valor) => valor === texto)

// Lee los filtros de la URL; lo que no se entiende (un sector que no existe, un valor raro) vuelve
// al valor por defecto.
export function leerFiltros(
  parametros: URLSearchParams,
  sectoresConocidos: readonly number[],
): FiltrosTablero {
  const sector = Number(parametros.get(PARAMETROS_TABLERO.sector))
  const especie = parametros.get(PARAMETROS_TABLERO.especie)?.trim()
  return {
    sector: sectoresConocidos.includes(sector) ? sector : FILTROS_INICIALES.sector,
    datos: esDe(DATOS_TABLERO, parametros.get(PARAMETROS_TABLERO.datos)) ?? FILTROS_INICIALES.datos,
    especie: especie ? especie : FILTROS_INICIALES.especie,
    metrica:
      esDe(METRICAS_MAPA_CALOR, parametros.get(PARAMETROS_TABLERO.metrica)) ??
      FILTROS_INICIALES.metrica,
  }
}

// Devuelve los parámetros con los filtros puestos; los que valen lo de por defecto no se escriben.
// Lo que la URL tenga de otra cosa se conserva.
export function escribirFiltros(
  parametros: URLSearchParams,
  filtros: FiltrosTablero,
): URLSearchParams {
  const nuevos = new URLSearchParams(parametros)
  const poner = (clave: string, valor: string | null) => {
    if (valor === null) nuevos.delete(clave)
    else nuevos.set(clave, valor)
  }
  poner(PARAMETROS_TABLERO.sector, filtros.sector === null ? null : String(filtros.sector))
  poner(PARAMETROS_TABLERO.datos, filtros.datos === FILTROS_INICIALES.datos ? null : filtros.datos)
  poner(PARAMETROS_TABLERO.especie, filtros.especie)
  poner(
    PARAMETROS_TABLERO.metrica,
    filtros.metrica === FILTROS_INICIALES.metrica ? null : filtros.metrica,
  )
  return nuevos
}

export const hayFiltros = (filtros: FiltrosTablero): boolean =>
  filtros.sector !== null || filtros.datos !== DATOS_TABLERO.todos || filtros.especie !== null

// Qué filtros se aplican: el mapa de calor y el estado por sector comparan los sectores entre sí,
// así que no se achican por el sector elegido; la dona compara las especies, así que tampoco por la
// especie elegida.
export interface AlcanceDeFiltros {
  sector?: boolean
  especie?: boolean
}

export function aplicarFiltros(
  arboles: readonly ArbolFeature[],
  filtros: FiltrosTablero,
  alcance: AlcanceDeFiltros = {},
): ArbolFeature[] {
  const { sector = true, especie = true } = alcance
  return arboles.filter(({ properties }) => {
    if (sector && filtros.sector !== null && properties.sector !== filtros.sector) return false
    if (filtros.datos === DATOS_TABLERO.campo && properties.demo) return false
    if (filtros.datos === DATOS_TABLERO.ejemplo && !properties.demo) return false
    if (especie && filtros.especie !== null && properties.nombre_cientifico !== filtros.especie) {
      return false
    }
    return true
  })
}
