// Pone en marcha el guion del árbol: las piezas brotan una tras otra y, al terminar, la copa pasa
// a su reposo por cuadros. Todo con la API de animaciones del navegador sobre opacity y transform.
// Con «reducir movimiento» no se crea ninguna animación: el árbol queda completo y quieto.
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import {
  inicioDePiezaMs,
  planCuadro,
  planPiezaChica,
  planPiezaEntera,
  planSacudida,
  type PlanAnimacion,
} from '../lib/guionArbol'
import { COPAS_REPOSO, type ClavePieza } from '../lib/piezasArbol'

export type FaseArbol = 'esperando' | 'creciendo' | 'reposo' | 'quieto'

interface OpcionesAnimacionArbol {
  // La entrada del sitio ya terminó y pasó la espera inicial
  activo: boolean
  // Pestaña oculta o árbol fuera de la pantalla
  pausado: boolean
}

export function useAnimacionArbol(
  refRaiz: RefObject<SVGSVGElement | null>,
  { activo, pausado }: OpcionesAnimacionArbol,
) {
  // Sin la API de animaciones (navegadores muy viejos) el árbol queda completo y quieto
  const sinSoporte =
    typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function'
  const pideMenos = usePideMenosMovimiento() || sinSoporte
  const [enReposo, setEnReposo] = useState(false)
  const registro = useRef(new Set<Animation>())
  const pausadoAhora = useRef(pausado)

  useEffect(() => {
    pausadoAhora.current = pausado
    registro.current.forEach((animacion) => {
      if (pausado) animacion.pause()
      else if (animacion.playState === 'paused') animacion.play()
    })
  }, [pausado])

  // Antes de pintar: así el árbol nunca se ve completo un instante antes de empezar a crecer.
  useLayoutEffect(() => {
    const raiz = refRaiz.current
    if (!raiz || !activo || pideMenos) return
    const guardadas = registro.current
    let vigente = true
    const propias: Animation[] = []

    const lanzar = (elemento: Element | null, plan: PlanAnimacion) => {
      if (!elemento) return null
      const animacion = elemento.animate(plan.fotogramas, plan.opciones)
      propias.push(animacion)
      guardadas.add(animacion)
      if (pausadoAhora.current) animacion.pause()
      return animacion
    }

    const terminadas: Promise<Animation>[] = []
    raiz.querySelectorAll<SVGGElement>('[data-pieza]').forEach((pieza) => {
      const inicio = inicioDePiezaMs(pieza.dataset.pieza as ClavePieza)
      lanzar(pieza.querySelector('[data-forma="chica"]'), planPiezaChica(inicio))
      const entera = lanzar(pieza.querySelector('[data-forma="entera"]'), planPiezaEntera(inicio))
      if (entera) terminadas.push(entera.finished)
    })

    Promise.all(terminadas)
      .then(() => {
        if (!vigente) return
        for (let cuadro = 0; cuadro <= COPAS_REPOSO.length; cuadro++) {
          lanzar(raiz.querySelector(`[data-cuadro="${cuadro}"]`), planCuadro(cuadro))
        }
        setEnReposo(true)
      })
      .catch(() => undefined)

    return () => {
      vigente = false
      propias.forEach((animacion) => {
        animacion.cancel()
        guardadas.delete(animacion)
      })
      setEnReposo(false)
    }
  }, [activo, pideMenos, refRaiz])

  // Sacudida corta de toda la copa (al presionar): una celda a cada lado
  function sacudir() {
    const copa = refRaiz.current?.querySelector('[data-parte="copa"]')
    if (!copa) return
    const plan = planSacudida()
    const animacion = copa.animate(plan.fotogramas, plan.opciones)
    registro.current.add(animacion)
    animacion.addEventListener('finish', () => registro.current.delete(animacion))
    if (pausadoAhora.current) animacion.pause()
  }

  const fase: FaseArbol = pideMenos
    ? 'quieto'
    : enReposo
      ? 'reposo'
      : activo
        ? 'creciendo'
        : 'esperando'
  return { fase, sacudir }
}
