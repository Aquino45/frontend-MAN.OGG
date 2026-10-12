// La celebración al elegir SÍ: papel picado (cuadritos pixel con los colores de la paleta) que sale de las
// dos esquinas de abajo, sube hacia el centro y cae girando mientras se desvanece. Solo `transform` y
// `opacity`, con WAAPI; la subida frena (ease-out fuerte) y la caída es lineal. Quien la monta no la
// monta con «reducir movimiento».
import { useEffect, useMemo, useRef } from 'react'
import { CELEBRACION_ENTRADA as C, CORTINA_CURVA } from '@/config/constantes'
import { piezasDeCelebracion, type PiezaDeCelebracion } from '../lib/celebracion'

interface PropsCelebracion {
  aleatorio: () => number
}

function Pieza({ pieza }: { pieza: PiezaDeCelebracion }) {
  const refPieza = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const elemento = refPieza.current
    if (!elemento || typeof elemento.animate !== 'function') return
    const en = (x: number, y: number, grados: number) =>
      `translate(${x}px, ${y}px) rotate(${grados}deg)`
    const animacion = elemento.animate(
      [
        {
          transform: en(pieza.origenX, pieza.origenY, 0),
          opacity: 1,
          easing: `cubic-bezier(${CORTINA_CURVA.join(', ')})`,
        },
        {
          offset: C.subidaFraccion,
          transform: en(pieza.cimaX, pieza.cimaY, pieza.giroGrados / 2),
          opacity: 1,
          easing: 'linear',
        },
        { transform: en(pieza.caidaX, pieza.caidaY, pieza.giroGrados), opacity: 0 },
      ],
      { duration: C.duracionMs, delay: pieza.retrasoMs, fill: 'both' },
    )
    return () => animacion.cancel()
  }, [pieza])
  return (
    <div
      ref={refPieza}
      className={`entrada-alterna__papel entrada-alterna__papel--${pieza.color}`}
      style={{ width: pieza.ladoPx, height: pieza.ladoPx }}
    />
  )
}

export function Celebracion({ aleatorio }: PropsCelebracion) {
  // El reparto se arma una sola vez al montar, con el azar recibido
  const piezas = useMemo(
    () =>
      piezasDeCelebracion({ anchoPx: window.innerWidth, altoPx: window.innerHeight }, aleatorio),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <div className="entrada-alterna__celebracion" aria-hidden="true">
      {piezas.map((pieza, indice) => (
        <Pieza key={indice} pieza={pieza} />
      ))}
    </div>
  )
}
