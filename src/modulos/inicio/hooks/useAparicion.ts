// Aparición de las secciones de Inicio. Solo anima al llegar navegando: al abrir el sitio manda la
// entrada. Las secciones que quedan bajo el pliegue esperan a acercarse a la pantalla, una sola vez.
import { useEffect, useState } from 'react'
import { useEstadoEntrada } from '@/modulos/entrada'

const CLASE_APARECE = 'inicio-aparece'
const CLASE_OCULTA = 'inicio-aparece--oculta'

// «inmediata»: anima al montarse. «alEntrar»: anima cuando entra en pantalla.
// Devuelve la función para poner de «ref» en el elemento y la clase que le toca.
export function useAparicion(
  modo: 'inmediata' | 'alEntrar',
): [anclar: (elemento: HTMLElement | null) => void, clase: string] {
  const estadoEntrada = useEstadoEntrada()
  const [elemento, anclar] = useState<HTMLElement | null>(null)
  // Se decide al montar: no cambia si la entrada termina después
  const [anima] = useState(estadoEntrada !== 'en-curso')
  // Sin IntersectionObserver no hay a qué esperar
  const [entro, setEntro] = useState(typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (!anima || modo === 'inmediata' || !elemento) return
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return
      setEntro(true)
      observador.disconnect()
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [anima, modo, elemento])

  if (!anima) return [anclar, '']
  const visible = modo === 'inmediata' || entro
  return [anclar, visible ? CLASE_APARECE : CLASE_OCULTA]
}
