// Datos simulados con la forma exacta de los ejemplos del contrato (VITE_USAR_MOCKS=true).
import type { ArbolColeccion } from '@/api/cliente'
import type { components } from '@/api/schema'
import arbolDemoJson from './arbol-demo.json'
import arbolRealJson from './arbol-real.json'
import sector1ArbolesJson from './sector-1-arboles.json'
import sector2ArbolesJson from './sector-2-arboles.json'
import sector3ArbolesJson from './sector-3-arboles.json'
import sector4ArbolesJson from './sector-4-arboles.json'
import sector5ArbolesJson from './sector-5-arboles.json'
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

// Las listas por sector tienen la forma del contrato 0.6.0: el resumen trae DAP, altura y origen
export const arbolesSector1Mock =
  sector1ArbolesJson satisfies ComoJson<ArbolColeccion> as ArbolColeccion

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

export const arbolesMockPorSector: Record<number, ArbolColeccion> = {
  1: arbolesSector1Mock,
}

// Los 5 sectores, para recorrer el sitio con VITE_USAR_MOCKS: del 2 al 5 solo hay árboles de ejemplo (demo)
export const arbolesMockDelCampus: Record<number, ArbolColeccion> = {
  ...arbolesMockPorSector,
  2: sector2ArbolesJson satisfies ComoJson<ArbolColeccion> as ArbolColeccion,
  3: sector3ArbolesJson satisfies ComoJson<ArbolColeccion> as ArbolColeccion,
  4: sector4ArbolesJson satisfies ComoJson<ArbolColeccion> as ArbolColeccion,
  5: sector5ArbolesJson satisfies ComoJson<ArbolColeccion> as ArbolColeccion,
}
