// Datos de los gráficos del tablero de Cifras: estado por sector, dispersión DAP × altura e
// histograma de DAP. Campo y ejemplo (demo) van siempre por separado. Funciones puras.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { ESTILO_ESTADO_GENERAL, ESTILO_ESTADO_OTRO } from '@/config/constantes'
import { TEXTOS_TABLERO } from '@/config/tablero'
import { listarSectores } from './sectores'
import { enlaceDeCartilla } from './cifrasCo2'
import { especiesPorCantidad } from './tablero'

// ---------- Estado por sector ----------

export interface SegmentoEstado {
  // Valor del catálogo («Bueno»…) o «Sin dato»
  estado: string
  // Sufijo del estilo (bueno, regular, malo u otro)
  estilo: string
  ejemplo: boolean
  cantidad: number
}

export interface FilaEstado {
  clave: string
  etiqueta: string
  total: number
  segmentos: SegmentoEstado[]
}

const estiloDe = (estado: string | null): string =>
  estado !== null && Object.hasOwn(ESTILO_ESTADO_GENERAL, estado)
    ? ESTILO_ESTADO_GENERAL[estado]
    : ESTILO_ESTADO_OTRO

// Orden de los estados dentro de cada barra: los del catálogo en su orden y, al final, el resto
const ORDEN_ESTADOS = Object.keys(ESTILO_ESTADO_GENERAL)
const lugarDe = (estado: string): number => {
  const indice = ORDEN_ESTADOS.indexOf(estado)
  return indice === -1 ? ORDEN_ESTADOS.length : indice
}

export function estadoPorSector(
  arboles: readonly ArbolFeature[],
  sectores: readonly SectorFeature[],
): FilaEstado[] {
  return listarSectores(sectores, arboles).map(({ clave, etiqueta }) => {
    const delSector = arboles.filter(({ properties }) => String(properties.sector) === clave)
    const grupos = new Map<string, SegmentoEstado>()
    for (const { properties } of delSector) {
      const estado = properties.estado_general ?? TEXTOS_TABLERO.estado.sinDato
      const llave = `${estado}|${properties.demo}`
      const segmento = grupos.get(llave) ?? {
        estado,
        estilo: estiloDe(properties.estado_general),
        ejemplo: properties.demo,
        cantidad: 0,
      }
      segmento.cantidad += 1
      grupos.set(llave, segmento)
    }
    const segmentos = [...grupos.values()].sort(
      (a, b) =>
        lugarDe(a.estado) - lugarDe(b.estado) ||
        a.estado.localeCompare(b.estado) ||
        Number(a.ejemplo) - Number(b.ejemplo),
    )
    return { clave, etiqueta, total: delSector.length, segmentos }
  })
}

// ---------- Dispersión ----------

export interface PuntoDispersion {
  codigo: string
  especie: string | null
  dapCm: number
  alturaM: number
  co2Kg: number | null
  ejemplo: boolean
  enlace: string
  // Posición de su color en la paleta de especies
  serie: number
  // Cumple los filtros del momento (si no, el punto se queda donde está pero se apaga)
  visible: boolean
}

export interface DominioDispersion {
  dapMaximo: number
  alturaMaxima: number
  co2Maximo: number
}

export interface Dispersion {
  puntos: PuntoDispersion[]
  // Árboles visibles que no tienen DAP o altura y por eso no aparecen
  sinMedidas: number
  // Calculado sobre todos los árboles, para que los ejes no se muevan al filtrar
  dominio: DominioDispersion
}

export function calcularDispersion(
  todos: readonly ArbolFeature[],
  visibles: ReadonlySet<string>,
  maximoSeries: number,
): Dispersion {
  const orden = new Map(especiesPorCantidad(todos).map((fila, indice) => [fila.etiqueta, indice]))
  const puntos: PuntoDispersion[] = []
  let sinMedidas = 0
  for (const { properties } of todos) {
    const visible = visibles.has(properties.codigo)
    if (typeof properties.dap_cm !== 'number' || typeof properties.altura_total_m !== 'number') {
      if (visible) sinMedidas += 1
      continue
    }
    const especie = properties.nombre_cientifico?.trim() || null
    puntos.push({
      codigo: properties.codigo,
      especie,
      dapCm: properties.dap_cm,
      alturaM: properties.altura_total_m,
      co2Kg: properties.co2_almacenado_kg,
      ejemplo: properties.demo,
      enlace: enlaceDeCartilla(properties),
      serie: Math.min(
        especie === null ? maximoSeries : (orden.get(especie) ?? maximoSeries),
        maximoSeries,
      ),
      visible,
    })
  }
  // Los de más CO₂ primero: así los chicos quedan encima de los grandes
  puntos.sort((a, b) => (b.co2Kg ?? 0) - (a.co2Kg ?? 0) || a.codigo.localeCompare(b.codigo))
  return {
    puntos,
    sinMedidas,
    dominio: {
      dapMaximo: Math.max(0, ...puntos.map((p) => p.dapCm)),
      alturaMaxima: Math.max(0, ...puntos.map((p) => p.alturaM)),
      co2Maximo: Math.max(0, ...puntos.map((p) => p.co2Kg ?? 0)),
    },
  }
}

// ---------- Histograma de DAP ----------

export interface RangoDap {
  desdeCm: number
  hastaCm: number
  campo: number
  ejemplo: number
}

export interface HistogramaDap {
  rangos: RangoDap[]
  sinDap: number
}

// Rangos de `ancho` cm desde cero hasta cubrir el mayor DAP de TODOS los árboles (así los rangos
// no cambian al filtrar); los conteos son de los árboles visibles.
export function calcularHistogramaDap(
  todos: readonly ArbolFeature[],
  visibles: ReadonlySet<string>,
  ancho: number,
): HistogramaDap {
  const maximo = Math.max(0, ...todos.map(({ properties }) => properties.dap_cm ?? 0))
  const cantidad = Math.max(1, Math.floor(maximo / ancho) + 1)
  const rangos: RangoDap[] = Array.from({ length: cantidad }, (_, indice) => ({
    desdeCm: indice * ancho,
    hastaCm: (indice + 1) * ancho,
    campo: 0,
    ejemplo: 0,
  }))
  let sinDap = 0
  for (const { properties } of todos) {
    if (!visibles.has(properties.codigo)) continue
    if (typeof properties.dap_cm !== 'number') {
      sinDap += 1
      continue
    }
    const rango = rangos[Math.min(cantidad - 1, Math.floor(properties.dap_cm / ancho))]
    if (properties.demo) rango.ejemplo += 1
    else rango.campo += 1
  }
  return { rangos, sinDap }
}
