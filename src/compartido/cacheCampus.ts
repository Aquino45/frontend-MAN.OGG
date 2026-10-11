// Caché en memoria de lo que piden varias partes del sitio (Inicio y el pie): los sectores y los
// árboles del campus. Se guarda la petición en curso, así dos pedidos iguales comparten una sola
// llamada a la API. Un error no se guarda, lo guardado vence pasado `TIEMPO_VIDA_CACHE_CAMPUS_MS`
// y «Reintentar» invalida todo y avisa a quien esté mirando para que vuelva a pedir.
import {
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolFeature,
  type SectorFeature,
} from '@/api/cliente'
import { TIEMPO_VIDA_CACHE_CAMPUS_MS } from '@/config/constantes'

const SEPARADOR_DE_IDS = ','

export type ParteDelCache = 'sectores' | 'arboles'

interface EntradaDeCache<T> {
  peticion: Promise<T>
  guardadaEnMs: number
}

let sectoresEnCache: EntradaDeCache<SectorFeature[]> | null = null
const arbolesEnCache = new Map<string, EntradaDeCache<ArbolFeature[]>>()
const oyentesDeInvalidacion: Record<ParteDelCache, Set<() => void>> = {
  sectores: new Set(),
  arboles: new Set(),
}

function estaVigente(entrada: EntradaDeCache<unknown>): boolean {
  return Date.now() - entrada.guardadaEnMs < TIEMPO_VIDA_CACHE_CAMPUS_MS
}

// Avisa cada vez que se invalida esa parte de la caché; devuelve la función para dejar de escuchar.
export function alInvalidarCacheCampus(parte: ParteDelCache, oyente: () => void): () => void {
  oyentesDeInvalidacion[parte].add(oyente)
  return () => {
    oyentesDeInvalidacion[parte].delete(oyente)
  }
}

// Sin argumento invalida todo; con una parte, solo esa (y avisa solo a quien la mira).
export function invalidarCacheCampus(
  partes: readonly ParteDelCache[] = ['sectores', 'arboles'],
): void {
  if (partes.includes('sectores')) sectoresEnCache = null
  if (partes.includes('arboles')) arbolesEnCache.clear()
  partes.forEach((parte) => oyentesDeInvalidacion[parte].forEach((oyente) => oyente()))
}

export function cargarSectores(): Promise<SectorFeature[]> {
  if (sectoresEnCache === null || !estaVigente(sectoresEnCache)) {
    const peticion = obtenerSectores().then((coleccion) => coleccion.features)
    const entrada = { peticion, guardadaEnMs: Date.now() }
    sectoresEnCache = entrada
    peticion.catch(() => {
      if (sectoresEnCache === entrada) sectoresEnCache = null
    })
  }
  return sectoresEnCache.peticion
}

export function cargarArbolesDelCampus(sectorIds: readonly number[]): Promise<ArbolFeature[]> {
  const clave = sectorIds.join(SEPARADOR_DE_IDS)
  let entrada = arbolesEnCache.get(clave)
  if (entrada === undefined || !estaVigente(entrada)) {
    const peticion = Promise.all(sectorIds.map((id) => obtenerArbolesDeSector(id))).then(
      (colecciones) => colecciones.flatMap((coleccion) => coleccion.features),
    )
    const nueva = { peticion, guardadaEnMs: Date.now() }
    entrada = nueva
    arbolesEnCache.set(clave, nueva)
    peticion.catch(() => {
      if (arbolesEnCache.get(clave) === nueva) arbolesEnCache.delete(clave)
    })
  }
  return entrada.peticion
}
