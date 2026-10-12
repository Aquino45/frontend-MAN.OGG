// Cifras del tablero de Cifras: resumen, especies y mapa de calor. Un campo que la API no trae (la
// versión anterior a la que suma DAP, altura y origen al resumen) cuenta igual que uno sin dato. Todo se calcula de lo que entrega
// la API, nunca a mano, y los árboles de campo y los de ejemplo (demo) van SIEMPRE por separado.
// Funciones puras.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { METRICAS_MAPA_CALOR, ORIGEN_NATIVO, TEXTOS_TABLERO } from '@/config/tablero'
import { enlaceDeCartilla } from './cifrasCo2'
import { listarSectores } from './sectores'
import type { MetricaMapa } from './filtrosTablero'

export interface Par<Valor> {
  campo: Valor
  ejemplo: Valor
}

export interface MayorDap {
  codigo: string
  dapCm: number
  especie: string | null
  // Ruta a la cartilla del árbol en el mapa
  enlace: string
}

export interface ProporcionNativas {
  nativas: number
  exoticas: number
  sinDato: number
  total: number
}

export interface Kpis {
  arboles: Par<number>
  // Especies distintas; las de campo y las de ejemplo pueden repetirse, por eso no se suman
  especies: { total: number; campo: number; ejemplo: number }
  // kg de CO₂, de campo y de ejemplo por separado
  co2: Par<number>
  captura: Par<number>
  // Verdadero si algún valor de CO₂ viene marcado como simulado por la API
  haySimulado: boolean
  mayorDap: Par<MayorDap | null>
  // null si no hay árboles de ese origen
  nativas: Par<ProporcionNativas | null>
}

type Propiedades = ArbolFeature['properties']

const nombreCientifico = (propiedades: Propiedades): string | null =>
  propiedades.nombre_cientifico?.trim() || null

const delOrigen = (arboles: readonly ArbolFeature[], ejemplo: boolean) =>
  arboles.map(({ properties }) => properties).filter((propiedades) => propiedades.demo === ejemplo)

const sumar = (valores: readonly (number | null)[]): number =>
  valores.reduce<number>((suma, valor) => suma + (valor ?? 0), 0)

const especiesDistintas = (lista: readonly Propiedades[]): number =>
  new Set(lista.map(nombreCientifico).filter((nombre) => nombre !== null)).size

function mayorDapDe(lista: readonly Propiedades[]): MayorDap | null {
  const conDap = lista.filter((propiedades) => typeof propiedades.dap_cm === 'number')
  if (conDap.length === 0) return null
  const mayor = conDap.reduce((ganador, actual) =>
    (actual.dap_cm ?? 0) > (ganador.dap_cm ?? 0) ||
    ((actual.dap_cm ?? 0) === (ganador.dap_cm ?? 0) && actual.codigo < ganador.codigo)
      ? actual
      : ganador,
  )
  return {
    codigo: mayor.codigo,
    dapCm: mayor.dap_cm ?? 0,
    especie: nombreCientifico(mayor),
    enlace: enlaceDeCartilla(mayor),
  }
}

function nativasDe(lista: readonly Propiedades[]): ProporcionNativas | null {
  if (lista.length === 0) return null
  const nativas = lista.filter((propiedades) => propiedades.origen === ORIGEN_NATIVO).length
  const sinDato = lista.filter((propiedades) => typeof propiedades.origen !== 'string').length
  return {
    nativas,
    exoticas: lista.length - nativas - sinDato,
    sinDato,
    total: lista.length,
  }
}

export function calcularKpis(arboles: readonly ArbolFeature[]): Kpis {
  const campo = delOrigen(arboles, false)
  const ejemplo = delOrigen(arboles, true)
  const todos = [...campo, ...ejemplo]
  return {
    arboles: { campo: campo.length, ejemplo: ejemplo.length },
    especies: {
      total: especiesDistintas(todos),
      campo: especiesDistintas(campo),
      ejemplo: especiesDistintas(ejemplo),
    },
    co2: {
      campo: sumar(campo.map((p) => p.co2_almacenado_kg)),
      ejemplo: sumar(ejemplo.map((p) => p.co2_almacenado_kg)),
    },
    captura: {
      campo: sumar(campo.map((p) => p.co2_captura_anual_kg)),
      ejemplo: sumar(ejemplo.map((p) => p.co2_captura_anual_kg)),
    },
    haySimulado: todos.some(
      (p) => p.co2_simulado && (p.co2_almacenado_kg !== null || p.co2_captura_anual_kg !== null),
    ),
    mayorDap: { campo: mayorDapDe(campo), ejemplo: mayorDapDe(ejemplo) },
    nativas: { campo: nativasDe(campo), ejemplo: nativasDe(ejemplo) },
  }
}

// ---------- Especies ----------

export interface FilaEspecie {
  // Nombre científico: es lo que filtra. null en «Otras» y en «Sin especie», que no se pueden elegir
  clave: string | null
  etiqueta: string
  comun: string | null
  cantidad: number
  campo: number
  ejemplo: number
  // Posición de su color en la paleta (la de «Otras» y «Sin especie» es la última)
  serie: number
}

// Todas las especies con nombre, de la más a la menos frecuente (a igual cantidad, por nombre)
export function especiesPorCantidad(arboles: readonly ArbolFeature[]): FilaEspecie[] {
  const grupos = new Map<string, FilaEspecie>()
  for (const { properties } of arboles) {
    const nombre = nombreCientifico(properties)
    if (nombre === null) continue
    const fila = grupos.get(nombre) ?? {
      clave: nombre,
      etiqueta: nombre,
      comun: properties.nombre_comun,
      cantidad: 0,
      campo: 0,
      ejemplo: 0,
      serie: 0,
    }
    fila.cantidad += 1
    if (properties.demo) fila.ejemplo += 1
    else fila.campo += 1
    fila.comun ??= properties.nombre_comun
    grupos.set(nombre, fila)
  }
  return [...grupos.values()].sort(
    (a, b) => b.cantidad - a.cantidad || a.etiqueta.localeCompare(b.etiqueta),
  )
}

// La dona: las `maximo` especies más frecuentes, «Otras» con el resto y, aparte, los árboles sin
// especie. El color de cada una sale de su posición y se conserva aunque cambien los filtros si se
// le pasa `orden` (las especies ordenadas sobre TODOS los árboles).
export function agruparEspecies(
  arboles: readonly ArbolFeature[],
  maximo: number,
  orden: readonly FilaEspecie[] = especiesPorCantidad(arboles),
): FilaEspecie[] {
  const posicion = new Map(orden.map((fila, indice) => [fila.etiqueta, indice]))
  const presentes = especiesPorCantidad(arboles)
  const principales = presentes
    .filter((fila) => (posicion.get(fila.etiqueta) ?? Infinity) < maximo)
    .map((fila) => ({ ...fila, serie: posicion.get(fila.etiqueta) ?? 0 }))
    .sort((a, b) => b.cantidad - a.cantidad || a.serie - b.serie)
  const resto = presentes.filter((fila) => !((posicion.get(fila.etiqueta) ?? Infinity) < maximo))
  const filas: FilaEspecie[] = [...principales]
  if (resto.length > 0) {
    filas.push({
      clave: null,
      etiqueta: TEXTOS_TABLERO.especies.otras,
      comun: null,
      cantidad: resto.reduce((suma, fila) => suma + fila.cantidad, 0),
      campo: resto.reduce((suma, fila) => suma + fila.campo, 0),
      ejemplo: resto.reduce((suma, fila) => suma + fila.ejemplo, 0),
      serie: maximo,
    })
  }
  const sinNombre = arboles.filter(({ properties }) => nombreCientifico(properties) === null)
  if (sinNombre.length > 0) {
    const ejemplo = sinNombre.filter(({ properties }) => properties.demo).length
    filas.push({
      clave: null,
      etiqueta: TEXTOS_TABLERO.especies.sinNombre,
      comun: null,
      cantidad: sinNombre.length,
      campo: sinNombre.length - ejemplo,
      ejemplo,
      serie: maximo,
    })
  }
  return filas
}

// ---------- Mapa de calor ----------

export interface SectorDelMapa {
  id: number
  nombre: string
  // Lo que mide el mapa; null si el sector no tiene dato para esa medida
  valor: number | null
  arbolesCampo: number
  arbolesEjemplo: number
}

function medida(lista: readonly Propiedades[], metrica: MetricaMapa): number | null {
  if (metrica === METRICAS_MAPA_CALOR.arboles) return lista.length
  const valores = lista
    .map((p) => (metrica === METRICAS_MAPA_CALOR.co2 ? p.co2_almacenado_kg : p.dap_cm))
    .filter((valor) => typeof valor === 'number')
  if (valores.length === 0) return null
  const total = valores.reduce((suma, valor) => suma + valor, 0)
  return metrica === METRICAS_MAPA_CALOR.co2 ? total : total / valores.length
}

export function calcularMapaCalor(
  arboles: readonly ArbolFeature[],
  sectores: readonly SectorFeature[],
  metrica: MetricaMapa,
): SectorDelMapa[] {
  const nombres = new Map(listarSectores(sectores, arboles).map((s) => [s.clave, s.etiqueta]))
  return [...sectores]
    .sort((a, b) => a.properties.id - b.properties.id)
    .map(({ properties }) => {
      const delSector = arboles
        .map((arbol) => arbol.properties)
        .filter((propiedades) => propiedades.sector === properties.id)
      return {
        id: properties.id,
        nombre: nombres.get(String(properties.id)) ?? properties.nombre,
        valor: medida(delSector, metrica),
        arbolesCampo: delSector.filter((p) => !p.demo).length,
        arbolesEjemplo: delSector.filter((p) => p.demo).length,
      }
    })
}

// ---------- Por sector ----------

export interface ValorDeSector extends Par<number> {
  sectorId: number
}

// Suma, por sector y con campo y ejemplo aparte, una medida de cada árbol (un null no suma). Para
// contar árboles, la medida es 1.
export function sumarPorSector(
  arboles: readonly ArbolFeature[],
  sectores: readonly SectorFeature[],
  medida: (propiedades: Propiedades) => number | null,
): ValorDeSector[] {
  return [...sectores]
    .sort((a, b) => a.properties.id - b.properties.id)
    .map(({ properties: sector }) => {
      const valor: ValorDeSector = { sectorId: sector.id, campo: 0, ejemplo: 0 }
      for (const { properties } of arboles) {
        if (properties.sector !== sector.id) continue
        valor[properties.demo ? 'ejemplo' : 'campo'] += medida(properties) ?? 0
      }
      return valor
    })
}
