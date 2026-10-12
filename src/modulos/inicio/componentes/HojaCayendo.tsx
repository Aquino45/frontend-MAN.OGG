// Una hoja suelta: una celda de la copa que baja de a un paso, con un zigzag de 1 celda, y se
// quita sola al llegar al suelo.
import { useEffect, useRef } from 'react'
import type { HojaCayendo as DatosHoja } from '../hooks/useHojasQueCaen'
import { planHoja } from '../lib/guionArbol'

interface PropsHojaCayendo {
  hoja: DatosHoja
  pausado: boolean
  onTermina: (id: number) => void
}

export function HojaCayendo({ hoja, pausado, onTermina }: PropsHojaCayendo) {
  const refHoja = useRef<SVGRectElement>(null)
  const refAnimacion = useRef<Animation | null>(null)
  const { id, x, y, clase } = hoja

  useEffect(() => {
    const elemento = refHoja.current
    if (!elemento) return
    const plan = planHoja(hoja)
    const animacion = elemento.animate(plan.fotogramas, plan.opciones)
    refAnimacion.current = animacion
    animacion.finished.then(() => onTermina(id)).catch(() => undefined)
    return () => animacion.cancel()
    // La hoja no cambia mientras cae: su animación se crea una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const animacion = refAnimacion.current
    if (!animacion) return
    if (pausado) animacion.pause()
    else if (animacion.playState === 'paused') animacion.play()
  }, [pausado])

  return (
    <rect
      ref={refHoja}
      className={`arbol-animado__capa arbol-animado__capa--${clase}`}
      x={x}
      y={y}
      width={1}
      height={1}
      opacity={0}
    />
  )
}
