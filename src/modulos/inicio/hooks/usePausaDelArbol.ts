// El árbol se pausa con la pestaña oculta y cuando sale de la pantalla.
import { useEffect, useState, type RefObject } from 'react'

export function usePausaDelArbol(refEnvoltura: RefObject<HTMLElement | null>): boolean {
  const [pestanaOculta, setPestanaOculta] = useState(() => document.visibilityState === 'hidden')
  const [fueraDePantalla, setFueraDePantalla] = useState(false)

  useEffect(() => {
    const alCambiar = () => setPestanaOculta(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', alCambiar)
    return () => document.removeEventListener('visibilitychange', alCambiar)
  }, [])

  useEffect(() => {
    const envoltura = refEnvoltura.current
    if (!envoltura || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => {
      setFueraDePantalla(!entrada.isIntersecting)
    })
    observador.observe(envoltura)
    return () => observador.disconnect()
  }, [refEnvoltura])

  return pestanaOculta || fueraDePantalla
}
