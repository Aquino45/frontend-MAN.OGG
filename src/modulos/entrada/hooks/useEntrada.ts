// Sortea la entrada al mapa una sola vez por carga y lleva la cuenta de si ya terminó.
import { useCallback, useState } from 'react'
import { PESOS_ENTRADA, type VarianteEntrada } from '@/config/constantes'
import { elegirVariante } from '@/lib/elegirVariante'

export interface Entrada {
  variante: VarianteEntrada
  // La entrada ya dejó ver la vista pedida
  terminada: boolean
  terminar: () => void
  // Si la ilustración no se pudo cargar, se sigue con la entrada estándar sin mostrar errores
  caerAEstandar: () => void
}

const VARIANTE_BASE: VarianteEntrada = 'estandar'

// El azar se inyecta para que los tests no dependan de la suerte; por defecto es Math.random.
export function useEntrada(aleatorio: () => number = Math.random): Entrada {
  const [variante, setVariante] = useState<VarianteEntrada>(() =>
    elegirVariante(PESOS_ENTRADA, aleatorio()),
  )
  const [terminada, setTerminada] = useState(variante === VARIANTE_BASE)

  const terminar = useCallback(() => setTerminada(true), [])
  const caerAEstandar = useCallback(() => {
    setVariante(VARIANTE_BASE)
    setTerminada(true)
  }, [])

  return { variante, terminada, terminar, caerAEstandar }
}
