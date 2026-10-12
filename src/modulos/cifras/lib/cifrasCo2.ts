// Cifras de CO₂ de la página «Cifras del censo»: sumas de lo que entrega la API, nunca calculadas
// aquí. Función pura. Regla dura: campo (demo = false) y ejemplo (demo = true) van SIEMPRE
// separados en sectores y especies; un árbol sin dato (null) no suma y se cuenta aparte.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import {
  KG_POR_TONELADA,
  PARAMETROS_URL,
  REGION_INTERFAZ,
  RUTAS,
  TEXTOS_CIFRAS,
  UMBRAL_CO2_A_TONELADAS_KG,
} from '@/config/constantes'
import { formatearMedida } from '@/lib/formatear'
import { listarSectores } from './sectores'

// kg de CO₂ de campo y de ejemplo, siempre por separado
export interface ValorCo2 {
  campo: number
  ejemplo: number
}

export interface FilaCo2 {
  clave: string
  etiqueta: string
  valor: ValorCo2
}

export interface FilaTopCo2 {
  codigo: string
  especie: string | null
  sector: string
  co2_almacenado_kg: number
  demo: boolean
  // Ruta a la cartilla del árbol en el mapa
  enlace: string
}

export interface CifrasCo2 {
  almacenadoPorSector: FilaCo2[]
  capturaPorSector: FilaCo2[]
  almacenadoPorEspecie: FilaCo2[]
  top: FilaTopCo2[]
  sinDatoAlmacenado: number
  sinDatoCaptura: number
  // Verdadero si algún valor graficado viene marcado como simulado por la API
  hayCo2Simulado: boolean
}

export type TipoCo2 = 'almacenado' | 'captura'

type Propiedades = ArbolFeature['properties']
type CampoKg = 'co2_almacenado_kg' | 'co2_captura_anual_kg'

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })
const CLAVE_OTRAS = 'otras'
const CLAVE_SIN_ESPECIE = 'sin-especie'

export const totalCo2De = (valor: ValorCo2): number => valor.campo + valor.ejemplo

const vacio = (): ValorCo2 => ({ campo: 0, ejemplo: 0 })

function sumarEn(valor: ValorCo2, kg: number, esEjemplo: boolean): void {
  if (esEjemplo) valor.ejemplo += kg
  else valor.campo += kg
}

// Más CO₂ primero; a igual valor, por nombre
function porValorYNombre(a: FilaCo2, b: FilaCo2): number {
  return (
    totalCo2De(b.valor) - totalCo2De(a.valor) ||
    a.etiqueta.localeCompare(b.etiqueta, REGION_INTERFAZ)
  )
}

function agruparPorSector(arboles: readonly ArbolFeature[], campo: CampoKg): Map<string, ValorCo2> {
  const grupos = new Map<string, ValorCo2>()
  for (const { properties } of arboles) {
    const kg = properties[campo]
    if (kg === null) continue
    const clave = String(properties.sector)
    const valor = grupos.get(clave) ?? vacio()
    sumarEn(valor, kg, properties.demo)
    grupos.set(clave, valor)
  }
  return grupos
}

function porSector(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
  campo: CampoKg,
): FilaCo2[] {
  const grupos = agruparPorSector(arboles, campo)
  return listarSectores(sectores, arboles).map(({ clave, etiqueta }) => ({
    clave,
    etiqueta,
    valor: grupos.get(clave) ?? vacio(),
  }))
}

function porEspecie(arboles: readonly ArbolFeature[], maximo: number): FilaCo2[] {
  const sinEspecie = vacio()
  const grupos = new Map<string, ValorCo2>()
  let haySinEspecie = false
  for (const { properties } of arboles) {
    const kg = properties.co2_almacenado_kg
    if (kg === null) continue
    const nombre = properties.nombre_cientifico?.trim()
    if (!nombre) {
      haySinEspecie = true
      sumarEn(sinEspecie, kg, properties.demo)
      continue
    }
    const valor = grupos.get(nombre) ?? vacio()
    sumarEn(valor, kg, properties.demo)
    grupos.set(nombre, valor)
  }
  const ordenadas = [...grupos.entries()]
    .map(([etiqueta, valor]) => ({ clave: etiqueta, etiqueta, valor }))
    .sort(porValorYNombre)
  const filas = ordenadas.slice(0, maximo)
  const resto = ordenadas.slice(maximo)
  if (resto.length > 0) {
    const otras = vacio()
    for (const { valor } of resto) {
      otras.campo += valor.campo
      otras.ejemplo += valor.ejemplo
    }
    filas.push({ clave: CLAVE_OTRAS, etiqueta: TEXTOS_CIFRAS.otras, valor: otras })
  }
  if (haySinEspecie) {
    filas.push({ clave: CLAVE_SIN_ESPECIE, etiqueta: TEXTOS_CIFRAS.sinEspecie, valor: sinEspecie })
  }
  return filas
}

export function enlaceDeCartilla(propiedades: Propiedades): string {
  const consulta = new URLSearchParams({
    [PARAMETROS_URL.sector]: String(propiedades.sector),
    [PARAMETROS_URL.arbol]: propiedades.codigo,
  })
  return `${RUTAS.mapa}?${consulta.toString()}`
}

function topPorAlmacenado(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
  cantidad: number,
): FilaTopCo2[] {
  const nombres = new Map(listarSectores(sectores, arboles).map((s) => [s.clave, s.etiqueta]))
  return arboles
    .map(({ properties }) => properties)
    .filter((propiedades) => propiedades.co2_almacenado_kg !== null)
    .sort(
      (a, b) =>
        (b.co2_almacenado_kg ?? 0) - (a.co2_almacenado_kg ?? 0) || a.codigo.localeCompare(b.codigo),
    )
    .slice(0, cantidad)
    .map((propiedades) => ({
      codigo: propiedades.codigo,
      especie: propiedades.nombre_cientifico?.trim() || null,
      sector: nombres.get(String(propiedades.sector)) ?? String(propiedades.sector),
      co2_almacenado_kg: propiedades.co2_almacenado_kg ?? 0,
      demo: propiedades.demo,
      enlace: enlaceDeCartilla(propiedades),
    }))
}

export function calcularCifrasCo2(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
  maximoEspecies: number,
  cantidadTop: number,
): CifrasCo2 {
  const propiedades = arboles.map((arbol) => arbol.properties)
  const conAlmacenado = propiedades.filter((p) => p.co2_almacenado_kg !== null)
  const conCaptura = propiedades.filter((p) => p.co2_captura_anual_kg !== null)
  return {
    almacenadoPorSector: porSector(sectores, arboles, 'co2_almacenado_kg'),
    capturaPorSector: porSector(sectores, arboles, 'co2_captura_anual_kg'),
    almacenadoPorEspecie: porEspecie(arboles, maximoEspecies),
    top: topPorAlmacenado(sectores, arboles, cantidadTop),
    sinDatoAlmacenado: propiedades.length - conAlmacenado.length,
    sinDatoCaptura: propiedades.length - conCaptura.length,
    hayCo2Simulado: [...conAlmacenado, ...conCaptura].some((p) => p.co2_simulado),
  }
}

// «N árboles sin dato de CO₂» (singular si es 1). null si no falta ninguno.
export function textoSinDatoCo2(cantidad: number): string | null {
  if (cantidad <= 0) return null
  if (cantidad === 1) return TEXTOS_CIFRAS.co2.sinDatoUno
  return TEXTOS_CIFRAS.co2.sinDato.replace('{n}', FORMATO_ENTERO.format(cantidad))
}

// kg, o toneladas desde el umbral de las constantes; con separador de miles
export function formatearCo2(kg: number, tipo: TipoCo2): string {
  const enToneladas = Math.abs(kg) >= UMBRAL_CO2_A_TONELADAS_KG
  const magnitud =
    tipo === 'almacenado'
      ? enToneladas
        ? 'co2AlmacenadoT'
        : 'co2AlmacenadoKg'
      : enToneladas
        ? 'co2CapturaAnualT'
        : 'co2CapturaAnualKg'
  return formatearMedida(enToneladas ? kg / KG_POR_TONELADA : kg, magnitud) ?? ''
}
