// Pide los sectores del campus (con la caché compartida) y expone su estado, con reintento.
import { useCallback, useEffect, useState } from 'react'
import type { SectorFeature } from '@/api/cliente'
import { cargarSectores, alInvalidarCacheCampus, invalidarCacheCampus } from './cacheCampus'

export type EstadoSectoresDelCampus =
  | { estado: 'cargando' }
  | { estado: 'listo'; sectores: SectorFeature[] }
  | { estado: 'error'; error: Error }

type Resultado =
  | { intento: number; estado: 'listo'; sectores: SectorFeature[] }
  | { intento: number; estado: 'error'; error: Error }

export function useSectoresDelCampus(): EstadoSectoresDelCampus & { reintentar: () => void } {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    cargarSectores()
      .then((sectores) => {
        if (vigente) setResultado({ intento, estado: 'listo', sectores })
      })
      .catch((error: unknown) => {
        if (!vigente) return
        setResultado({
          intento,
          estado: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => {
      vigente = false
    }
  }, [intento])

  // Cualquier invalidación (el «Reintentar» de otra parte del sitio) hace que este hook vuelva a pedir.
  useEffect(
    () => alInvalidarCacheCampus('sectores', () => setIntento((anterior) => anterior + 1)),
    [],
  )

  const reintentar = useCallback(() => invalidarCacheCampus(['sectores']), [])

  if (resultado === null || resultado.intento !== intento) return { estado: 'cargando', reintentar }
  return { ...resultado, reintentar }
}
