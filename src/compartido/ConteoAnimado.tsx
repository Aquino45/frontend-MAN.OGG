// Un número que cuenta desde 0 hasta su valor al entrar en la pantalla, una sola vez. El valor
// final siempre está en el texto accesible; con «reducir movimiento» (o sin IntersectionObserver)
// se muestra directo. El conteo escribe en el texto sin volver a dibujar con React.
import { useCallback, useLayoutEffect, useRef } from 'react'
import { CONTEO_ANIMADO, REGION_INTERFAZ } from '@/config/constantes'
import { usePideMenosMovimiento } from './usePideMenosMovimiento'
import { useVisibleUnaVez } from './useVisibleUnaVez'

interface PropsConteoAnimado {
  valor: number
}

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })
const formatear = (numero: number) => FORMATO_ENTERO.format(numero)

// Sale rápido y se asienta despacio (ease-out cúbico)
const suavizar = (avance: number) => 1 - (1 - avance) ** 3

// Los números que ya contaron en esta carga de la página no vuelven a contar
const contados = new WeakSet<Element>()

export function ConteoAnimado({ valor }: PropsConteoAnimado) {
  const [anclar, visible, elemento] = useVisibleUnaVez<HTMLSpanElement>()
  const refTexto = useRef<HTMLSpanElement | null>(null)
  const fijar = useCallback(
    (nodo: HTMLSpanElement | null) => {
      refTexto.current = nodo
      anclar(nodo)
    },
    [anclar],
  )
  const pideMenos = usePideMenosMovimiento()
  const sinObservador = typeof IntersectionObserver === 'undefined'

  useLayoutEffect(() => {
    const nodo = refTexto.current
    if (!elemento || !nodo) return
    if (pideMenos || sinObservador || contados.has(nodo)) {
      nodo.textContent = formatear(valor)
      return
    }
    if (!visible) {
      nodo.textContent = formatear(0)
      return
    }
    contados.add(nodo)
    let cuadro = 0
    let inicio: number | null = null
    const avanzar = (instante: number) => {
      inicio ??= instante
      const avance = Math.min(1, (instante - inicio) / CONTEO_ANIMADO.duracionMs)
      nodo.textContent = formatear(Math.round(valor * suavizar(avance)))
      if (avance < 1) cuadro = window.requestAnimationFrame(avanzar)
    }
    cuadro = window.requestAnimationFrame(avanzar)
    return () => window.cancelAnimationFrame(cuadro)
  }, [elemento, valor, visible, pideMenos, sinObservador])

  return (
    <>
      <span ref={fijar} aria-hidden="true" />
      <span className="solo-lectores">{formatear(valor)}</span>
    </>
  )
}
