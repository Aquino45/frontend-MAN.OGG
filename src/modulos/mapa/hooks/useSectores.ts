// Pide los sectores a la API y expone su estado de carga, con la opción de reintentar.
import { useCallback, useEffect, useState } from 'react'
import { obtenerSectores, type SectorFeature } from '@/api/cliente'

export type EstadoSectores =
  | { estado: 'cargando' }
  | { estado: 'listo'; sectores: SectorFeature[] }
  | { estado: 'error'; error: Error }

export function useSectores(): EstadoSectores & { reintentar: () => void } {
  const [estado, setEstado] = useState<EstadoSectores>({ estado: 'cargando' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerSectores({ signal: controlador.signal })
      .then((coleccion) => setEstado({ estado: 'listo', sectores: coleccion.features }))
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setEstado({
          estado: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => controlador.abort()
  }, [intento])

  const reintentar = useCallback(() => {
    setEstado({ estado: 'cargando' })
    setIntento((anterior) => anterior + 1)
  }, [])

  return { ...estado, reintentar }
}
