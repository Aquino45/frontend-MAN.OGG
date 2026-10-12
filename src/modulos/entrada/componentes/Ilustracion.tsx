// La ilustración de la entrada alterna: aparece con un fundido cuando la cortina ya cubre. Con «reducir
// movimiento» queda quieta, en su primer cuadro, y se ve desde el principio.
import { useEffect, useRef, useState } from 'react'
import { CORTINA_CURVA, ENTRADA_ALTERNA as E } from '@/config/constantes'
import ilustracionEntrada from '../recursos/ilustracion-entrada.gif'

interface PropsIlustracion {
  quieta: boolean
  visible: boolean
}

// Dibuja el primer cuadro del GIF en un lienzo; si no se puede, se usa la imagen tal cual
function useCuadroQuieto(activo: boolean) {
  const refLienzo = useRef<HTMLCanvasElement>(null)
  const [dibujado, setDibujado] = useState(false)
  useEffect(() => {
    const lienzo = refLienzo.current
    if (!activo || !lienzo) return
    const contexto = lienzo.getContext?.('2d')
    if (!contexto) return
    const imagen = new Image()
    imagen.onload = () => {
      lienzo.width = imagen.naturalWidth
      lienzo.height = imagen.naturalHeight
      contexto.drawImage(imagen, 0, 0)
      setDibujado(true)
    }
    imagen.src = ilustracionEntrada
  }, [activo])
  return { refLienzo, dibujado }
}

export function Ilustracion({ quieta, visible }: PropsIlustracion) {
  const refImagen = useRef<HTMLDivElement>(null)
  const { refLienzo, dibujado } = useCuadroQuieto(quieta)

  useEffect(() => {
    const envoltura = refImagen.current
    if (!envoltura || quieta || !visible || typeof envoltura.animate !== 'function') return
    const animacion = envoltura.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: E.ilustracionDuracionMs,
      easing: `cubic-bezier(${CORTINA_CURVA.join(', ')})`,
      fill: 'both',
    })
    return () => animacion.cancel()
  }, [quieta, visible])

  return (
    <div
      ref={refImagen}
      className="entrada-alterna__ilustracion"
      data-visible={visible || quieta ? 'si' : undefined}
    >
      {quieta && <canvas ref={refLienzo} className="entrada-alterna__imagen" hidden={!dibujado} />}
      {(!quieta || !dibujado) && (
        <img className="entrada-alterna__imagen" src={ilustracionEntrada} alt="" />
      )}
    </div>
  )
}
