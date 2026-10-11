// Cápsulas de ayuda de la cartilla: cada una explica un dato con texto que manda la API.
// Aquí no se escribe ninguna explicación; solo se busca qué cápsula va con qué dato.
import type { Arbol } from '@/api/cliente'

export type Capsula = Arbol['capsulas'][number]

// Campos del contrato (clave `campo` de la cápsula) que la cartilla muestra con su botón «?».
// Copa norte-sur y este-oeste comparten un botón (en la etiqueta «Copa»); `tipo_individuo` no se
// muestra en la cartilla y `demo` va en la nota de «Sobre este árbol».
export const CAMPOS_AYUDA_VISIBLES = [
  'codigo',
  'identificacion',
  'origen',
  'condicion_conservacion',
  'altura_total_m',
  'dap_cm',
  'copa_ns_m',
  'copa_eo_m',
  'estado_general',
  'estado_copa',
  'tronco_danos',
  'raices_base',
  'interferencia_entorno',
  'co2_almacenado_kg',
  'co2_captura_anual_kg',
  'ubicacion',
] as const

// Campos cuya explicación del valor de ESTE árbol se junta en «Sobre este árbol», en este orden
export const CAMPOS_ESTADO_EXPLICADO = [
  'estado_general',
  'estado_copa',
  'tronco_danos',
  'raices_base',
] as const

export function indexarCapsulas(capsulas: readonly Capsula[]): ReadonlyMap<string, Capsula> {
  return new Map(capsulas.map((capsula) => [capsula.campo, capsula]))
}

export function explicacionesDelEstado(capsulas: readonly Capsula[]): Capsula[] {
  const indice = indexarCapsulas(capsulas)
  return CAMPOS_ESTADO_EXPLICADO.map((campo) => indice.get(campo)).filter(
    (capsula): capsula is Capsula => capsula !== undefined && capsula.en_este_arbol !== null,
  )
}

// Reemplaza cada marcador de la plantilla por su valor.
export function llenarPlantilla(plantilla: string, valores: Record<string, string>): string {
  return Object.entries(valores).reduce(
    (texto, [marcador, valor]) => texto.replace(marcador, valor),
    plantilla,
  )
}
