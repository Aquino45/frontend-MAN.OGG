// Lee y escribe el sector y el árbol abiertos en la URL (?sector=<id>&arbol=<codigo>).
import { PARAMETROS_URL } from '@/config/constantes'

export interface SeleccionUrl {
  sectorId: number | null
  arbolCodigo: string | null
}

export const SIN_SELECCION: SeleccionUrl = { sectorId: null, arbolCodigo: null }

function leerSectorId(texto: string | null): number | null {
  if (texto === null || !/^[1-9]\d*$/.test(texto)) return null
  return Number(texto)
}

export function leerSeleccion(busqueda: string): SeleccionUrl {
  const parametros = new URLSearchParams(busqueda)
  const arbol = parametros.get(PARAMETROS_URL.arbol)?.trim()
  return {
    sectorId: leerSectorId(parametros.get(PARAMETROS_URL.sector)),
    arbolCodigo: arbol ? arbol : null,
  }
}

// Cadena de consulta con el «?» inicial, o vacía si no hay nada abierto.
export function escribirSeleccion(seleccion: SeleccionUrl): string {
  const parametros = new URLSearchParams()
  if (seleccion.sectorId !== null) parametros.set(PARAMETROS_URL.sector, String(seleccion.sectorId))
  if (seleccion.arbolCodigo !== null) parametros.set(PARAMETROS_URL.arbol, seleccion.arbolCodigo)
  const texto = parametros.toString()
  return texto === '' ? '' : `?${texto}`
}
