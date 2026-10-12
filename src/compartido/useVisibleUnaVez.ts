// Dice si un elemento ya entró en la pantalla alguna vez. Sirve para que lo que se presenta
// (conteos, dibujos, entradas escalonadas) ocurra cuando se ve y una sola vez. Sin
// IntersectionObserver no hay a qué esperar: se considera visible.
import { useEffect, useState } from 'react'

export function useVisibleUnaVez<T extends Element>(): [
  anclar: (elemento: T | null) => void,
  visible: boolean,
  elemento: T | null,
] {
  const [elemento, anclar] = useState<T | null>(null)
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible || !elemento) return
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return
      setVisible(true)
      observador.disconnect()
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [visible, elemento])

  return [anclar, visible, elemento]
}
