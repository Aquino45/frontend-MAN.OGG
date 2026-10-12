// Los lóbulos de arriba se corren una celda hacia el cursor (sin girar ni escalar), solo con un
// puntero fino. El corrimiento es de una celda entera: salta, no se desliza.
import { useEffect, type RefObject } from 'react'
import { ARBOL_ANIMADO as G, CONSULTA_HOVER_FINO } from '@/config/constantes'

type Direccion = -1 | 0 | 1

function direccion(distancia: number, ancho: number): Direccion {
  const lejos = Math.abs(distancia) > ancho * G.punteroAlcanceAnchos
  const cerca = Math.abs(distancia) < ancho * G.punteroZonaMuertaAnchos
  if (lejos || cerca) return 0
  return distancia < 0 ? -1 : 1
}

export function useDesplazamientoAlPuntero(
  refRaiz: RefObject<SVGSVGElement | null>,
  refEnvoltura: RefObject<HTMLElement | null>,
  activo: boolean,
) {
  useEffect(() => {
    const raiz = refRaiz.current
    const envoltura = refEnvoltura.current
    if (!activo || !raiz || !envoltura) return
    const hayCursorFino =
      typeof window.matchMedia === 'function' && window.matchMedia(CONSULTA_HOVER_FINO).matches
    if (!hayCursorFino) return
    const lobulos = raiz.querySelectorAll<SVGGElement>('[data-parte="arriba"]')
    let actual: Direccion = 0
    const poner = (siguiente: Direccion) => {
      if (siguiente === actual) return
      actual = siguiente
      const transform = siguiente === 0 ? '' : `translate(${siguiente}px, 0px)`
      lobulos.forEach((lobulo) => {
        lobulo.style.transform = transform
      })
    }
    const alMover = (evento: PointerEvent) => {
      if (evento.pointerType === 'touch') return
      const caja = envoltura.getBoundingClientRect()
      poner(direccion(evento.clientX - (caja.left + caja.width / 2), caja.width))
    }
    const alSalir = () => poner(0)
    window.addEventListener('pointermove', alMover)
    document.addEventListener('pointerleave', alSalir)
    return () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerleave', alSalir)
      poner(0)
    }
  }, [activo, refRaiz, refEnvoltura])
}
