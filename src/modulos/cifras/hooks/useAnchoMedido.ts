// Mide el ancho de un elemento y avisa cuando cambia, para dibujar un gráfico SVG a su tamaño real
// (con un viewBox fijo, el texto se encogería al angostarse la pantalla). Sin ResizeObserver
// (tests, navegadores muy viejos) se queda con el ancho inicial.
import { useEffect, useRef, useState, type RefObject } from 'react'

export function useAnchoMedido<Elemento extends HTMLElement>(
  anchoInicial: number,
): [RefObject<Elemento | null>, number] {
  const referencia = useRef<Elemento>(null)
  const [ancho, setAncho] = useState(anchoInicial)

  useEffect(() => {
    const elemento = referencia.current
    if (!elemento || typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(([entrada]) => {
      const medido = Math.round(entrada.contentRect.width)
      if (medido > 0) setAncho(medido)
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [referencia, ancho]
}
