// Pide los árboles de un sector a la API y expone su estado de carga, con reintento.
import { useCallback, useEffect, useState } from 'react'
import { obtenerArbolesDeSector, type ArbolFeature } from '@/api/cliente'

export type EstadoArbolesDeSector =
  | { estado: 'inactivo' }
  | { estado: 'cargando' }
  | { estado: 'listo'; arboles: ArbolFeature[] }
  | { estado: 'error'; error: Error }

type Resultado =
  | { sectorId: number; intento: number; estado: 'listo'; arboles: ArbolFeature[] }
  | { sectorId: number; intento: number; estado: 'error'; error: Error }

export function useArbolesDeSector(
  sectorId: number | null,
): EstadoArbolesDeSector & { reintentar: () => void } {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (sectorId === null) return
    const controlador = new AbortController()
    obtenerArbolesDeSector(sectorId, { signal: controlador.signal })
      .then((coleccion) =>
        setResultado({ sectorId, intento, estado: 'listo', arboles: coleccion.features }),
      )
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setResultado({
          sectorId,
          intento,
          estado: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => controlador.abort()
  }, [sectorId, intento])

  const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), [])

  if (sectorId === null) return { estado: 'inactivo', reintentar }
  // Un resultado de otro sector o de un intento anterior ya no vale: se está cargando.
  if (resultado === null || resultado.sectorId !== sectorId || resultado.intento !== intento) {
    return { estado: 'cargando', reintentar }
  }
  return resultado.estado === 'listo'
    ? { estado: 'listo', arboles: resultado.arboles, reintentar }
    : { estado: 'error', error: resultado.error, reintentar }
}
