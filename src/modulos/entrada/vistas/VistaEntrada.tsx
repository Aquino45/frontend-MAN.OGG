// Entrada al mapa: sortea una variante y deja ver la vista pedida cuando termina.
// La vista pedida se dibuja desde el primer momento, así sus datos ya se están pidiendo.
import '../estilos.css'
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { useEntrada } from '../hooks/useEntrada'

interface PropsVistaEntrada {
  children: ReactNode
  // Fuente de azar del sorteo; se inyecta en los tests.
  aleatorio?: () => number
}

type ComponenteAlterna = ComponentType<{ onTerminar: () => void }>

export function VistaEntrada({ children, aleatorio }: PropsVistaEntrada) {
  const entrada = useEntrada(aleatorio)
  const { variante, terminada, terminar, caerAEstandar } = entrada
  const [Alterna, setAlterna] = useState<ComponenteAlterna | null>(null)

  // La variante alterna y su ilustración se cargan solo cuando sale.
  useEffect(() => {
    if (variante !== 'alterna') return
    let vigente = true
    import('../componentes/EntradaAlterna')
      .then((modulo) => {
        if (vigente) setAlterna(() => modulo.EntradaAlterna)
      })
      .catch(() => {
        if (vigente) caerAEstandar()
      })
    return () => {
      vigente = false
    }
  }, [variante, caerAEstandar])

  const tapada = variante === 'alterna' && !terminada
  const clases = [
    'entrada',
    variante === 'estandar' && 'entrada--estandar',
    tapada && 'entrada--tapada',
  ].filter(Boolean)

  return (
    <>
      <div className={clases.join(' ')} inert={tapada}>
        {children}
      </div>
      {variante === 'alterna' && Alterna && <Alterna onTerminar={terminar} />}
    </>
  )
}
