// La copa se inclina hacia el cursor con un suavizado (interpolación por cuadro, solo transform).
// Solo con cursor fino: en pantallas táctiles no hay a dónde mirar.
import { useEffect, type RefObject } from 'react'
import { ARBOL_ANIMADO as G, CONSULTA_HOVER_FINO } from '@/config/constantes'
import { ORIGEN_COPA, transformInclinacion } from '../lib/guionArbol'

const UMBRAL_REPOSO = 0.001

const acotar = (valor: number) => Math.max(-1, Math.min(1, valor))

export function useInclinacionAlPuntero(
  refRaiz: RefObject<SVGSVGElement | null>,
  refEnvoltura: RefObject<HTMLElement | null>,
  habilitado: boolean,
) {
  useEffect(() => {
    const raiz = refRaiz.current
    const envoltura = refEnvoltura.current
    if (!habilitado || !raiz || !envoltura) return
    if (
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia(CONSULTA_HOVER_FINO).matches
    ) {
      return
    }
    const copa = raiz.querySelector<SVGGElement>('[data-parte="inclina"]')
    if (!copa) return

    copa.style.transformOrigin = ORIGEN_COPA
    let objetivo = 0
    let actual = 0
    let cuadro = 0

    const avanzar = () => {
      actual += (objetivo - actual) * G.inclinacionSuavizado
      const quieta = Math.abs(objetivo - actual) < UMBRAL_REPOSO
      if (quieta) actual = objetivo
      copa.style.transform = transformInclinacion(actual)
      cuadro = quieta ? 0 : window.requestAnimationFrame(avanzar)
    }

    const alMoverElPuntero = (evento: PointerEvent) => {
      if (evento.pointerType === 'touch') return
      const caja = envoltura.getBoundingClientRect()
      const centro = caja.left + caja.width / 2
      objetivo = acotar((evento.clientX - centro) / (caja.width * G.inclinacionAlcanceAnchos))
      if (cuadro === 0) cuadro = window.requestAnimationFrame(avanzar)
    }

    window.addEventListener('pointermove', alMoverElPuntero)
    return () => {
      window.removeEventListener('pointermove', alMoverElPuntero)
      window.cancelAnimationFrame(cuadro)
      copa.style.transform = ''
    }
  }, [habilitado, refRaiz, refEnvoltura])
}
