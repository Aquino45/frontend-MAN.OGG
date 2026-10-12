// La caja de diálogo de la secuencia de la entrada alterna: borde pixel blanco sobre negro y el texto
// en la fuente pixel, que se escribe rápido, letra por letra, con un blip por cada una. Entra de forma
// dramática (sube y aparece). Con `completa`, el texto se ve entero y fijo.
import { useEffect, useRef, useState } from 'react'
import { CORTINA_CURVA, ENTRADA_ALTERNA as E } from '@/config/constantes'

interface PropsCajaDeDialogo {
  // El texto que se escribe (para escribir otro desde cero, quien la usa la monta con otra `key`)
  frase: string
  // Se ve entero y fijo, sin escribirse ni animar
  completa?: boolean
  // Suena una vez por letra visible (su orden, para alternar notas)
  alLetra?: (orden: number) => void
}

export function CajaDeDialogo({ frase, completa = false, alLetra }: PropsCajaDeDialogo) {
  const refCaja = useRef<HTMLDivElement>(null)
  const [escritas, setEscritas] = useState(0)
  // Quien la usa puede pasar una función nueva en cada render sin reiniciar la escritura
  const refAlLetra = useRef(alLetra)
  useEffect(() => {
    refAlLetra.current = alLetra
  })

  // Entrada dramática, una sola vez
  useEffect(() => {
    const caja = refCaja.current
    if (!caja || completa || typeof caja.animate !== 'function') return
    const animacion = caja.animate(
      [
        { opacity: 0, transform: `translateY(${E.cajaDesplazamientoPx}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      {
        duration: E.cajaDuracionMs,
        easing: `cubic-bezier(${CORTINA_CURVA.join(', ')})`,
        fill: 'both',
      },
    )
    return () => animacion.cancel()
  }, [completa])

  useEffect(() => {
    if (completa) return
    let cuenta = 0
    const intervalo = window.setInterval(() => {
      cuenta += 1
      setEscritas(cuenta)
      if (frase[cuenta - 1] !== ' ') refAlLetra.current?.(cuenta)
      if (cuenta >= frase.length) window.clearInterval(intervalo)
    }, E.msPorLetra)
    return () => window.clearInterval(intervalo)
  }, [frase, completa])

  const visibles = completa ? frase.length : escritas
  return (
    <div ref={refCaja} className="entrada-alterna__caja">
      {/* La frase completa reserva el espacio: la caja no cambia de tamaño mientras se escribe */}
      <p className="entrada-alterna__frase">
        <span>{frase.slice(0, visibles)}</span>
        <span className="entrada-alterna__frase-pendiente">{frase.slice(visibles)}</span>
      </p>
    </div>
  )
}
