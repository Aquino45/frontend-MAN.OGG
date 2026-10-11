// Caché en memoria de lo que piden varias partes del sitio (Inicio y el pie): los sectores y los
// árboles del campus. Se guarda la petición en curso, así dos pedidos iguales comparten una sola
// llamada a la API. Un error no se guarda y «Reintentar» invalida todo.
import {
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolFeature,
  type SectorFeature,
} from '@/api/cliente'

const SEPARADOR_DE_IDS = ','

let sectoresEnCache: Promise<SectorFeature[]> | null = null
const arbolesEnCache = new Map<string, Promise<ArbolFeature[]>>()

export function invalidarCacheCampus(): void {
  sectoresEnCache = null
  arbolesEnCache.clear()
}

export function cargarSectores(): Promise<SectorFeature[]> {
  if (sectoresEnCache === null) {
    const peticion = obtenerSectores().then((coleccion) => coleccion.features)
    sectoresEnCache = peticion
    peticion.catch(() => {
      if (sectoresEnCache === peticion) sectoresEnCache = null
    })
  }
  return sectoresEnCache
}

export function cargarArbolesDelCampus(sectorIds: readonly number[]): Promise<ArbolFeature[]> {
  const clave = sectorIds.join(SEPARADOR_DE_IDS)
  let peticion = arbolesEnCache.get(clave)
  if (peticion === undefined) {
    const nueva = Promise.all(sectorIds.map((id) => obtenerArbolesDeSector(id))).then(
      (colecciones) => colecciones.flatMap((coleccion) => coleccion.features),
    )
    peticion = nueva
    arbolesEnCache.set(clave, nueva)
    nueva.catch(() => {
      if (arbolesEnCache.get(clave) === nueva) arbolesEnCache.delete(clave)
    })
  }
  return peticion
}
