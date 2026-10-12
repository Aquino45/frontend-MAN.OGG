// Pone en marcha el guion del árbol: el árbol ya está completo y quieto desde el primer cuadro y,
// cuando arranca, la copa pasa a su reposo por cuadros. Todo con la API de animaciones del
// navegador sobre opacity y transform. Con «reducir movimiento» no se crea ninguna animación.
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { CUADROS_REPOSO } from '../lib/dibujoArbol'
import { planCuadro, planSacudida } from '../lib/guionArbol'

// «esperando»: completo y quieto, a la espera de que termine la entrada del sitio
export type FaseArbol = 'esperando' | 'reposo' | 'quieto'

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
  const registro = useRef(new Set<Animation>())
  const pausadoAhora = useRef(pausado)

  useEffect(() => {
    pausadoAhora.current = pausado
    registro.current.forEach((animacion) => {
      if (pausado) animacion.pause()
      else if (animacion.playState === 'paused') animacion.play()
    })
  }, [pausado])

  // Los cuadros del reposo ya están en el árbol cuando `activo` se vuelve verdadero.
  useLayoutEffect(() => {
    const raiz = refRaiz.current
    if (!raiz || !activo || pideMenos) return
    const guardadas = registro.current
    const propias: Animation[] = []

    for (let cuadro = 0; cuadro <= CUADROS_REPOSO.length; cuadro++) {
      const elemento = raiz.querySelector(`[data-cuadro="${cuadro}"]`)
      if (!elemento) continue
      const plan = planCuadro(cuadro)
      const animacion = elemento.animate(plan.fotogramas, plan.opciones)
      propias.push(animacion)
      guardadas.add(animacion)
      if (pausadoAhora.current) animacion.pause()
    }

    return () => {
      propias.forEach((animacion) => {
        animacion.cancel()
        guardadas.delete(animacion)
      })
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

  const fase: FaseArbol = pideMenos ? 'quieto' : activo ? 'reposo' : 'esperando'
  return { fase, sacudir }
}
