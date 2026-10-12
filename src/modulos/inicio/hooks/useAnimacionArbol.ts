// Pone en marcha el guion del árbol: el crecimiento y, al terminar, la vida en reposo.
// Todo corre con la API de animaciones del navegador sobre transform, opacity y clip-path.
// Con «reducir movimiento» no se crea ninguna animación: el árbol queda completo y quieto.
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import {
  CLAVE_RESPIRA,
  fotogramasSacudida,
  OPCIONES_SACUDIDA,
  planCrecimiento,
  planReposo,
  type PlanAnimacion,
} from '../lib/guionArbol'

export type FaseArbol = 'esperando' | 'creciendo' | 'reposo' | 'quieto'

interface OpcionesAnimacionArbol {
  // La entrada del sitio ya terminó y pasó la espera inicial
  activo: boolean
  // Pestaña oculta o árbol fuera de la pantalla
  pausado: boolean
  // Reposo completo o, si no, solo mecido
  reposoCompleto: boolean
}

type PlanLanzable = Pick<PlanAnimacion, 'fotogramas' | 'opciones'>

// Lanza una animación y la anota para pausarla o reanudarla con el resto.
function lanzar(
  registro: Set<Animation>,
  pausada: boolean,
  elemento: Element,
  plan: PlanLanzable,
): Animation {
  const animacion = elemento.animate(plan.fotogramas, plan.opciones)
  registro.add(animacion)
  const olvidar = () => registro.delete(animacion)
  animacion.addEventListener('finish', olvidar)
  animacion.addEventListener('cancel', olvidar)
  if (pausada) animacion.pause()
  return animacion
}

export function useAnimacionArbol(
  refRaiz: RefObject<SVGSVGElement | null>,
  { activo, pausado, reposoCompleto }: OpcionesAnimacionArbol,
) {
  // Sin la API de animaciones (navegadores muy viejos) el árbol queda completo y quieto
  const sinSoporte =
    typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function'
  const pideMenos = usePideMenosMovimiento() || sinSoporte
  const [enReposo, setEnReposo] = useState(false)
  const registro = useRef(new Set<Animation>())
  const pausadoAhora = useRef(pausado)
  const respira = useRef<Animation | null>(null)

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

    const aplicar = (planes: PlanAnimacion[]) =>
      planes.flatMap((paso) => {
        const elemento = raiz.querySelector(`[data-parte="${paso.clave}"]`)
        if (!elemento) return []
        const animacion = lanzar(guardadas, pausadoAhora.current, elemento, paso)
        propias.push(animacion)
        return [{ clave: paso.clave, animacion }]
      })

    const crecimiento = aplicar(planCrecimiento())
    Promise.all(crecimiento.map(({ animacion }) => animacion.finished))
      .then(() => {
        if (!vigente) return
        crecimiento.forEach(({ animacion }) => animacion.cancel())
        const reposo = aplicar(planReposo(reposoCompleto))
        respira.current = reposo.find(({ clave }) => clave === CLAVE_RESPIRA)?.animacion ?? null
        setEnReposo(true)
      })
      .catch(() => undefined)

    return () => {
      vigente = false
      propias.forEach((animacion) => animacion.cancel())
      respira.current = null
      setEnReposo(false)
    }
  }, [activo, pideMenos, reposoCompleto, refRaiz])

  // Sacudida corta de la copa (al presionar)
  function sacudir() {
    const copa = refRaiz.current?.querySelector('[data-parte="rebote"]')
    if (!copa) return
    lanzar(registro.current, pausadoAhora.current, copa, {
      fotogramas: fotogramasSacudida(),
      opciones: OPCIONES_SACUDIDA,
    })
  }

  // La respiración se acelera mientras el cursor está encima
  function respirarRapido(rapido: boolean) {
    if (respira.current) respira.current.playbackRate = rapido ? G.respiracionRapida : 1
  }

  const fase: FaseArbol = pideMenos
    ? 'quieto'
    : enReposo
      ? 'reposo'
      : activo
        ? 'creciendo'
        : 'esperando'
  return { fase, sacudir, respirarRapido }
}
