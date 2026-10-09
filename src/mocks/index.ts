// Datos simulados con la forma exacta de los ejemplos del contrato (VITE_USAR_MOCKS=true).
import type { components } from '@/api/schema'
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
