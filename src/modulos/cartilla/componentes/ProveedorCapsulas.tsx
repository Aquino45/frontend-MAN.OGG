import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ContextoCapsulas, type ValorCapsulas } from '../hooks/contextoCapsulas'
import { indexarCapsulas, type Capsula } from '../lib/capsulas'

interface PropsProveedorCapsulas {
  capsulas: readonly Capsula[]
  children: ReactNode
}

interface EstadoAbierta {
  clave: string | null
  fijada: boolean
  instantaneo: boolean
}

// Reparte las cápsulas de un árbol y recuerda cuál está abierta: abrir una cierra la anterior.
export function ProveedorCapsulas({ capsulas, children }: PropsProveedorCapsulas) {
  const [estado, setEstado] = useState<EstadoAbierta>({
    clave: null,
    fijada: false,
    instantaneo: false,
  })
  const indice = useMemo(() => indexarCapsulas(capsulas), [capsulas])

  // Si ya había otra abierta, la nueva aparece sin animación (y la anterior se va igual)
  const abrir = useCallback(
    (clave: string, fijada: boolean) =>
      setEstado((anterior) => ({
        clave,
        fijada,
        instantaneo: anterior.clave !== null && anterior.clave !== clave,
      })),
    [],
  )
  const cerrar = useCallback(
    (porTeclado = false) => setEstado({ clave: null, fijada: false, instantaneo: porTeclado }),
    [],
  )

  const valor = useMemo<ValorCapsulas>(
    () => ({
      capsulas: indice,
      abierta: estado.clave,
      fijada: estado.fijada,
      sinAnimacion: estado.instantaneo,
      abrir,
      cerrar,
    }),
    [indice, estado, abrir, cerrar],
  )
  return <ContextoCapsulas.Provider value={valor}>{children}</ContextoCapsulas.Provider>
}
