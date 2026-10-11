// Pide los árboles de todos los sectores (con la caché compartida) y expone su estado, con reintento.
import { useCallback, useEffect, useState } from 'react'
import type { ArbolFeature } from '@/api/cliente'
import { cargarArbolesDelCampus, invalidarCacheCampus } from './cacheCampus'

export type EstadoArbolesDelCampus =
  | { estado: 'inactivo' }
  | { estado: 'cargando' }
  | { estado: 'listo'; arboles: ArbolFeature[] }
  | { estado: 'error'; error: Error }

type Resultado =
  | { clave: string; intento: number; estado: 'listo'; arboles: ArbolFeature[] }
  | { clave: string; intento: number; estado: 'error'; error: Error }

const SEPARADOR_DE_IDS = ','

// Recibe los ids de los sectores, o null mientras ellos mismos cargan (no pide nada).
export function useArbolesDelCampus(
  sectorIds: readonly number[] | null,
): EstadoArbolesDelCampus & { reintentar: () => void } {
  // Un arreglo nuevo en cada render no debe repetir la petición: la dependencia es la clave.
  const clave = sectorIds === null ? null : sectorIds.join(SEPARADOR_DE_IDS)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (clave === null) return
    const ids = clave === '' ? [] : clave.split(SEPARADOR_DE_IDS).map(Number)
    let vigente = true
    cargarArbolesDelCampus(ids)
      .then((arboles) => {
        if (vigente) setResultado({ clave, intento, estado: 'listo', arboles })
      })
      .catch((error: unknown) => {
        if (!vigente) return
        setResultado({
          clave,
          intento,
          estado: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => {
      vigente = false
    }
  }, [clave, intento])

  const reintentar = useCallback(() => {
    invalidarCacheCampus()
    setIntento((anterior) => anterior + 1)
  }, [])

  if (clave === null) return { estado: 'inactivo', reintentar }
  // Un resultado de otros sectores o de un intento anterior ya no vale: se está cargando.
  if (resultado === null || resultado.clave !== clave || resultado.intento !== intento) {
    return { estado: 'cargando', reintentar }
  }
  return resultado.estado === 'listo'
    ? { estado: 'listo', arboles: resultado.arboles, reintentar }
    : { estado: 'error', error: resultado.error, reintentar }
}
