// Cifras de la página de Inicio: se calculan con los sectores y los árboles que trae la API.
// Función pura: no pide datos ni escribe nada; los números nunca se escriben a mano.
import type { ArbolFeature, SectorFeature } from '@/api/cliente'

export interface Cifras {
  // Árboles con datos de campo (demo === false)
  arbolesDeCampo: number
  sectores: number
  // Nombres científicos distintos entre los árboles de campo
  especiesIdentificadas: number
  // Árboles de ejemplo (demo === true)
  arbolesDeEjemplo: number
}

export interface ConteoDeSector {
  deCampo: number
  deEjemplo: number
}

export function calcularCifras(
  sectores: readonly SectorFeature[],
  arboles: readonly ArbolFeature[],
): Cifras {
  const especies = new Set<string>()
  let arbolesDeCampo = 0
  let arbolesDeEjemplo = 0
  for (const { properties } of arboles) {
    if (properties.demo) {
      arbolesDeEjemplo += 1
      continue
    }
    arbolesDeCampo += 1
    const nombre = properties.nombre_cientifico?.trim()
    if (nombre) especies.add(nombre)
  }
  return {
    arbolesDeCampo,
    sectores: sectores.length,
    especiesIdentificadas: especies.size,
    arbolesDeEjemplo,
  }
}

// Cuántos árboles de campo y de ejemplo tiene cada sector (la clave es el id del sector).
export function conteoPorSector(arboles: readonly ArbolFeature[]): Map<number, ConteoDeSector> {
  const conteos = new Map<number, ConteoDeSector>()
  for (const { properties } of arboles) {
    const conteo = conteos.get(properties.sector) ?? { deCampo: 0, deEjemplo: 0 }
    if (properties.demo) conteo.deEjemplo += 1
    else conteo.deCampo += 1
    conteos.set(properties.sector, conteo)
  }
  return conteos
}
