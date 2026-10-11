// Nota del pie sobre el origen de los datos: se calcula con los sectores y los árboles que trae la
// API, nunca se escribe a mano. Funciones puras: no piden datos.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { MARCADOR_SECTORES, PLANTILLAS_NOTA_DATOS, REGION_INTERFAZ } from '@/config/constantes'

export interface SectoresClasificados {
  // Sectores con al menos un árbol de campo (demo === false)
  conCampo: SectorFeature[]
  // Sectores sin árboles de campo: solo de ejemplo o todavía sin árboles
  sinCampo: SectorFeature[]
}

export function clasificarSectores(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
): SectoresClasificados {
  const sectoresConCampo = new Set<number>()
  for (const { properties } of arboles) {
    if (!properties.demo) sectoresConCampo.add(properties.sector)
  }
  const ordenados = [...sectores].sort((a, b) => a.properties.id - b.properties.id)
  return {
    conCampo: ordenados.filter((sector) => sectoresConCampo.has(sector.properties.id)),
    sinCampo: ordenados.filter((sector) => !sectoresConCampo.has(sector.properties.id)),
  }
}

const FORMATO_LISTA = new Intl.ListFormat(REGION_INTERFAZ, { style: 'long', type: 'conjunction' })

function nombres(sectores: readonly SectorFeature[]): string {
  return FORMATO_LISTA.format(sectores.map((sector) => sector.properties.nombre))
}

function llenar(plantilla: string, sectores: readonly SectorFeature[]): string {
  return plantilla.replace(MARCADOR_SECTORES, nombres(sectores))
}

// null si no hay sectores: entonces el pie no afirma nada.
export function armarNotaDatos({ conCampo, sinCampo }: SectoresClasificados): string | null {
  if (conCampo.length === 0 && sinCampo.length === 0) return null
  if (sinCampo.length === 0) return PLANTILLAS_NOTA_DATOS.todosCampo
  if (conCampo.length === 0) return PLANTILLAS_NOTA_DATOS.todosEjemplo
  const campo = llenar(
    conCampo.length === 1 ? PLANTILLAS_NOTA_DATOS.campoUno : PLANTILLAS_NOTA_DATOS.campoVarios,
    conCampo,
  )
  const ejemplo = llenar(
    sinCampo.length === 1 ? PLANTILLAS_NOTA_DATOS.ejemploUno : PLANTILLAS_NOTA_DATOS.ejemploVarios,
    sinCampo,
  )
  return `${campo} ${ejemplo}`
}
