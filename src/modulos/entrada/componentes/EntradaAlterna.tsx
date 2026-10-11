// Ilustración animada de la entrada: ocupa la pantalla unos segundos y se desvanece.
// Este archivo y su imagen se cargan solo cuando sale esta variante.
import { useEffect, useState } from 'react'
import {
  CONSULTA_MOVIMIENTO_REDUCIDO,
  DURACION_ENTRADA_ALTERNA_MS,
  DURACION_SALIDA_ENTRADA_MS,
} from '@/config/constantes'
import '@fontsource/silkscreen/400.css'
import ilustracionEntrada from '../recursos/ilustracion-entrada.gif'

interface PropsEntradaAlterna {
  // Se avisa cuando la vista pedida ya puede verse (empieza el desvanecimiento)
  onTerminar: () => void
}

function pideMenosMovimiento(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO).matches
  )
}

export function EntradaAlterna({ onTerminar }: PropsEntradaAlterna) {
  const [fase, setFase] = useState<'visible' | 'saliendo' | 'oculta'>('visible')

  useEffect(() => {
    const sinMovimiento = pideMenosMovimiento()
    const temporizadores: number[] = []
    temporizadores.push(
      window.setTimeout(() => {
        onTerminar()
        if (sinMovimiento) {
          setFase('oculta')
          return
        }
        setFase('saliendo')
        temporizadores.push(window.setTimeout(() => setFase('oculta'), DURACION_SALIDA_ENTRADA_MS))
      }, DURACION_ENTRADA_ALTERNA_MS),
    )
    return () => temporizadores.forEach((temporizador) => window.clearTimeout(temporizador))
  }, [onTerminar])

  if (fase === 'oculta') return null
  return (
    <div
      className={`entrada-alterna${fase === 'saliendo' ? ' entrada-alterna--saliendo' : ''}`}
      style={{ animationDuration: `${DURACION_SALIDA_ENTRADA_MS}ms` }}
      aria-hidden="true"
    >
      <img className="entrada-alterna__imagen" src={ilustracionEntrada} alt="" />
    </div>
  )
}
