// Datos simulados con la forma exacta de los ejemplos del contrato (VITE_USAR_MOCKS=true).
import type { components } from '@/api/schema'
import arbolDemoJson from './arbol-demo.json'
import arbolRealJson from './arbol-real.json'
import sector1ArbolesJson from './sector-1-arboles.json'
import sectoresJson from './sectores.json'

type Esquemas = components['schemas']

// Forma que TypeScript infiere al importar un JSON: los literales pasan a string y las tuplas
// a arreglos. Si el contrato agrega, quita o cambia de tipo un campo, `satisfies` falla.
type ComoJson<Tipo> = Tipo extends string
  ? string
  : Tipo extends readonly (infer Elemento)[]
    ? ComoJson<Elemento>[]
    : Tipo extends object
      ? { [Clave in keyof Tipo]: ComoJson<Tipo[Clave]> }
      : Tipo

export const sectoresMock = sectoresJson satisfies ComoJson<
  Esquemas['SectorColeccion']
> as Esquemas['SectorColeccion']

export const arbolesSector1Mock = sector1ArbolesJson satisfies ComoJson<
  Esquemas['ArbolResumenColeccion']
> as Esquemas['ArbolResumenColeccion']

export const arbolRealMock = arbolRealJson satisfies ComoJson<
  Esquemas['Arbol']
> as Esquemas['Arbol']

export const arbolDemoMock = arbolDemoJson satisfies ComoJson<
  Esquemas['Arbol']
> as Esquemas['Arbol']

// Árboles de ejemplo por código y colecciones de ejemplo por sector (los demás no tienen mock).
export const arbolesMockPorCodigo: Record<string, Esquemas['Arbol']> = {
  [arbolRealMock.codigo]: arbolRealMock,
  [arbolDemoMock.codigo]: arbolDemoMock,
}

export const arbolesMockPorSector: Record<number, Esquemas['ArbolResumenColeccion']> = {
  1: arbolesSector1Mock,
}
