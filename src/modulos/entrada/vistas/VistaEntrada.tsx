// Entrada al mapa: sortea una variante y deja ver la vista pedida cuando termina.
// La vista pedida se dibuja desde el primer momento, así sus datos ya se están pidiendo.
import '../estilos.css'
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { DURACION_APARICION_ENTRADA_MS } from '@/config/constantes'
import { ContextoEntrada, type EstadoEntrada } from '../hooks/contextoEntrada'
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

  // La entrada estándar termina cuando acaba su fundido; la alterna, cuando deja ver la vista.
  const [fundidoTerminado, setFundidoTerminado] = useState(false)
  useEffect(() => {
    if (variante !== 'estandar') return
    const temporizador = window.setTimeout(
      () => setFundidoTerminado(true),
      DURACION_APARICION_ENTRADA_MS,
    )
    return () => window.clearTimeout(temporizador)
  }, [variante])
  const estado: EstadoEntrada =
    terminada && (variante === 'alterna' || fundidoTerminado) ? 'terminada' : 'en-curso'

  const tapada = variante === 'alterna' && !terminada
  const clases = [
    'entrada',
    variante === 'estandar' && 'entrada--estandar',
    tapada && 'entrada--tapada',
  ].filter(Boolean)

  return (
    <ContextoEntrada.Provider value={estado}>
      <div className={clases.join(' ')} inert={tapada}>
        {children}
      </div>
      {variante === 'alterna' && Alterna && <Alterna onTerminar={terminar} />}
    </ContextoEntrada.Provider>
  )
}
