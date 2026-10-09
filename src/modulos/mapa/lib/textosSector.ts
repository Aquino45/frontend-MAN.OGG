// Textos que se arman con los datos de un sector («118 árboles», «Sector 1, 118 árboles»).
import { REGION_INTERFAZ, TEXTOS_MAPA } from '@/config/constantes'

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })

export function textoTotalArboles(total: number): string {
  if (total === 0) return TEXTOS_MAPA.sinArboles
  const unidad = total === 1 ? TEXTOS_MAPA.arbolSingular : TEXTOS_MAPA.arbolPlural
  return `${FORMATO_ENTERO.format(total)} ${unidad}`
}

export function nombreAccesibleSector(sector: {
  nombre: string
  total_arboles: number
  provisional: boolean
}): string {
  const partes = [sector.nombre, textoTotalArboles(sector.total_arboles)]
  if (sector.provisional) partes.push(TEXTOS_MAPA.limitesProvisionales)
  return partes.join(', ')
}
