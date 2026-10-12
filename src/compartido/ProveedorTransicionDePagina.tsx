// Cambio de página con transición: la navegación se hace dentro de una transición del navegador y
// esta espera a que la página nueva esté dibujada. El router no cambia.
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router'
import { TIEMPO_MAXIMO_TRANSICION_MS } from '@/config/constantes'
import { ContextoTransicion, type NavegarConTransicion } from './contextoTransicion'
import { transicionar } from './transicion'

export function ProveedorTransicionDePagina({ children }: { children: ReactNode }) {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const alDibujarse = useRef<(() => void) | null>(null)

  // Cuando la ubicación nueva ya se dibujó, la transición puede tomar su foto final.
  useLayoutEffect(() => {
    alDibujarse.current?.()
    alDibujarse.current = null
  }, [ubicacion])

  const navegarConTransicion: NavegarConTransicion = (destino) => {
    transicionar(
      () =>
        new Promise<void>((resolver) => {
          const limite = window.setTimeout(resolver, TIEMPO_MAXIMO_TRANSICION_MS)
          alDibujarse.current = () => {
            window.clearTimeout(limite)
            resolver()
          }
          flushSync(() => navegar(destino))
        }),
    )
  }

  return <ContextoTransicion value={navegarConTransicion}>{children}</ContextoTransicion>
}
