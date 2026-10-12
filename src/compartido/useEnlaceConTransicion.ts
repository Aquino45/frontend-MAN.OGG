// Devuelve el onClick que se pone a un enlace (Link o NavLink). Solo actúa en un clic simple que
// cambia de página; en cualquier otro caso deja que el enlace haga lo suyo.
import { useContext, type MouseEvent } from 'react'
import { useLocation } from 'react-router'
import { ContextoTransicion } from './contextoTransicion'
import { puedeTransicionar } from './transicion'

export function useEnlaceConTransicion(): (evento: MouseEvent<Element>) => void {
  const navegar = useContext(ContextoTransicion)
  const ubicacion = useLocation()

  return (evento) => {
    if (navegar === null || evento.defaultPrevented) return
    if (
      evento.button !== 0 ||
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey
    ) {
      return
    }
    const enlace = evento.currentTarget
    const objetivo = enlace.getAttribute('target')
    if (objetivo !== null && objetivo !== '_self') return
    const href = enlace.getAttribute('href')
    if (href === null) return
    const destino = new URL(href, window.location.href)
    if (destino.origin !== window.location.origin) return
    if (destino.pathname === ubicacion.pathname) return
    if (!puedeTransicionar()) return
    evento.preventDefault()
    navegar(destino.pathname + destino.search + destino.hash)
  }
}
