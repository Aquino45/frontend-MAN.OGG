// Cifras de la página «Cifras del censo»: conteos de los árboles que entrega la API (el CO₂ se
// suma en cifrasCo2.ts). Función pura. Regla dura: campo (demo = false) y ejemplo (demo = true)
// van SIEMPRE separados.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { REGION_INTERFAZ, TEXTOS_CARTILLA, TEXTOS_CIFRAS } from '@/config/constantes'

export interface Conteo {
  campo: number
  ejemplo: number
}

export interface FilaConteo {
  // Identifica el renglón (id de sector, estado, nombre científico…)
  clave: string
  etiqueta: string
  conteo: Conteo
}

export interface CifrasCenso {
  total: Conteo
  porSector: FilaConteo[]
  porEstado: FilaConteo[]
  porEspecie: FilaConteo[]
  destacadosPorSector: FilaConteo[]
}

const CLAVE_OTRAS = 'otras'
const CLAVE_SIN_ESPECIE = 'sin-especie'

export const totalDe = (conteo: Conteo): number => conteo.campo + conteo.ejemplo

function sumar(conteo: Conteo, esEjemplo: boolean): void {
  if (esEjemplo) conteo.ejemplo += 1
  else conteo.campo += 1
}

const vacio = (): Conteo => ({ campo: 0, ejemplo: 0 })

// Más árboles primero; a igual cantidad, por nombre (así el orden no depende de cómo lleguen)
function porCantidadYNombre(a: FilaConteo, b: FilaConteo): number {
  return (
    totalDe(b.conteo) - totalDe(a.conteo) || a.etiqueta.localeCompare(b.etiqueta, REGION_INTERFAZ)
  )
}

function agrupar(
  arboles: readonly ArbolFeature[],
  claveDe: (arbol: ArbolFeature['properties']) => string,
): Map<string, Conteo> {
  const grupos = new Map<string, Conteo>()
  for (const { properties } of arboles) {
    const clave = claveDe(properties)
    const conteo = grupos.get(clave) ?? vacio()
    sumar(conteo, properties.demo)
    grupos.set(clave, conteo)
  }
  return grupos
}

// Un renglón por sector de la API (también los que no tienen árboles) y, al final, por cada sector
// con árboles que la API no lista, un renglón con su número.
export interface SectorListado {
  clave: string
  etiqueta: string
}

// Los sectores de la API por id y, al final, los que solo aparecen en los árboles
export function listarSectores(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
): SectorListado[] {
  const conocidos = [...sectores].sort((a, b) => a.properties.id - b.properties.id)
  const filas = conocidos.map((sector) => ({
    clave: String(sector.properties.id),
    etiqueta: sector.properties.nombre,
  }))
  const idsConocidos = new Set(filas.map(({ clave }) => clave))
  const extra = [...new Set(arboles.map(({ properties }) => String(properties.sector)))]
    .filter((clave) => !idsConocidos.has(clave))
    .sort((a, b) => Number(a) - Number(b))
    .map((clave) => ({
      clave,
      etiqueta: TEXTOS_CIFRAS.sectorSinNombre.replace('{id}', clave),
    }))
  return [...filas, ...extra]
}

function conteoPorSector(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
): FilaConteo[] {
  const grupos = agrupar(arboles, (arbol) => String(arbol.sector))
  return listarSectores(sectores, arboles).map(({ clave, etiqueta }) => ({
    clave,
    etiqueta,
    conteo: grupos.get(clave) ?? vacio(),
  }))
}

function conteoPorEstado(arboles: readonly ArbolFeature[]): FilaConteo[] {
  const grupos = agrupar(arboles, (arbol) => arbol.estado_general ?? TEXTOS_CARTILLA.sinDato)
  return [...grupos.entries()]
    .map(([etiqueta, conteo]) => ({ clave: etiqueta, etiqueta, conteo }))
    .sort(porCantidadYNombre)
}

function conteoPorEspecie(arboles: readonly ArbolFeature[], maximo: number): FilaConteo[] {
  const sinEspecie = vacio()
  const conNombre: ArbolFeature[] = []
  for (const arbol of arboles) {
    if (arbol.properties.nombre_cientifico?.trim()) conNombre.push(arbol)
    else sumar(sinEspecie, arbol.properties.demo)
  }
  const grupos = agrupar(conNombre, (arbol) => (arbol.nombre_cientifico ?? '').trim())
  const ordenadas = [...grupos.entries()]
    .map(([etiqueta, conteo]) => ({ clave: etiqueta, etiqueta, conteo }))
    .sort(porCantidadYNombre)
  const principales = ordenadas.slice(0, maximo)
  const resto = ordenadas.slice(maximo)
  const filas = [...principales]
  if (resto.length > 0) {
    const otras = vacio()
    for (const { conteo } of resto) {
      otras.campo += conteo.campo
      otras.ejemplo += conteo.ejemplo
    }
    filas.push({ clave: CLAVE_OTRAS, etiqueta: TEXTOS_CIFRAS.otras, conteo: otras })
  }
  if (totalDe(sinEspecie) > 0) {
    filas.push({ clave: CLAVE_SIN_ESPECIE, etiqueta: TEXTOS_CIFRAS.sinEspecie, conteo: sinEspecie })
  }
  return filas
}

export function calcularCifrasCenso(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
  maximoEspecies: number,
): CifrasCenso {
  const total = vacio()
  for (const { properties } of arboles) sumar(total, properties.demo)
  return {
    total,
    porSector: conteoPorSector(sectores, arboles),
    porEstado: conteoPorEstado(arboles),
    porEspecie: conteoPorEspecie(arboles, maximoEspecies),
    destacadosPorSector: conteoPorSector(
      sectores,
      arboles.filter(({ properties }) => properties.destacado),
    ),
  }
}
