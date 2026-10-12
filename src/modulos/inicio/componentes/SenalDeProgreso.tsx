// Señal de progreso al mantener presionado el árbol: una capa tenue con su silueta que sube de la base
// a la copa, lineal, en lo que falta para cumplirse el tiempo (mantener para confirmar: lento y
// parejo mientras la persona decide). Al soltar o cancelar se apaga rápido, con ease-out. Solo
// existe mientras se presiona y con «reducir movimiento» no se ve.
import { useEffect, useRef } from 'react'
import {
  ACCESO_PANEL_RETENCION_MS,
  ACCESO_PANEL_SENAL_DESDE_MS,
  ACCESO_PANEL_SENAL_OPACIDAD,
  ACCESO_PANEL_SENAL_SALIDA_MS,
  DESBLOQUEO_CURVA,
} from '@/config/constantes'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { SILUETA_ARBOL } from '../lib/siluetaArbol'

const CURVA_SALIDA = `cubic-bezier(${DESBLOQUEO_CURVA.join(', ')})`
const SIN_CLIP = 'inset(0 0 0 0)'
const CLIP_DESDE_LA_BASE = 'inset(100% 0 0 0)'

export function SenalDeProgreso({ activa }: { activa: boolean }) {
  const refTrazo = useRef<SVGPathElement>(null)
  const salida = useRef<Animation | null>(null)
  const pideMenos = usePideMenosMovimiento()

  useEffect(() => {
    const trazo = refTrazo.current
    if (!trazo || !activa || pideMenos || typeof trazo.animate !== 'function') return
    salida.current?.cancel()
    const subida = trazo.animate(
      [
        { clipPath: CLIP_DESDE_LA_BASE, opacity: ACCESO_PANEL_SENAL_OPACIDAD },
        { clipPath: SIN_CLIP, opacity: ACCESO_PANEL_SENAL_OPACIDAD },
      ],
      {
        // La señal nació a ACCESO_PANEL_SENAL_DESDE_MS: sube durante lo que falta
        duration: ACCESO_PANEL_RETENCION_MS - ACCESO_PANEL_SENAL_DESDE_MS,
        easing: 'linear',
        fill: 'forwards',
      },
    )
    return () => {
      // Al soltar queda donde iba y se apaga rápido
      try {
        subida.commitStyles()
      } catch {
        // sin commitStyles se apaga igual, desde la altura que tenga
      }
      subida.cancel()
      if (typeof trazo.animate !== 'function') return
      salida.current = trazo.animate([{ opacity: ACCESO_PANEL_SENAL_OPACIDAD }, { opacity: 0 }], {
        duration: ACCESO_PANEL_SENAL_SALIDA_MS,
        easing: CURVA_SALIDA,
        fill: 'forwards',
      })
    }
  }, [activa, pideMenos])

  return <path ref={refTrazo} className="arbol-animado__senal" d={SILUETA_ARBOL} />
}
