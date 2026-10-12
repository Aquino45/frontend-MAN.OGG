// Una hoja que se desprende de la copa y cae. Se quita sola al llegar al suelo.
import { useEffect, useRef } from 'react'
import { fotogramasHoja } from '../lib/guionArbol'
import type { HojaCayendo as DatosHoja } from '../hooks/useHojasQueCaen'

interface PropsHojaCayendo {
  hoja: DatosHoja
  pausado: boolean
  onTermina: (id: number) => void
}

const LADO_HOJA = 2

export function HojaCayendo({ hoja, pausado, onTermina }: PropsHojaCayendo) {
  const refHoja = useRef<SVGRectElement>(null)
  const refAnimacion = useRef<Animation | null>(null)
  const { id, x, y, duracionMs } = hoja

  useEffect(() => {
    const elemento = refHoja.current
    if (!elemento) return
    const animacion = elemento.animate(fotogramasHoja(hoja), {
      duration: duracionMs,
      easing: 'linear',
      fill: 'both',
    })
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
      className="glifo-pixel__copa-media"
      x={x}
      y={y}
      width={LADO_HOJA}
      height={LADO_HOJA}
      opacity={0}
    />
  )
}
