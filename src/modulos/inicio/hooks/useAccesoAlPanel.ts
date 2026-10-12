// Mantener presionado el árbol de la portada durante `ACCESO_PANEL_RETENCION_MS` lleva al panel de
// administración, en la misma pestaña. Moverse unas celdas, soltar, salir del árbol, pasar a otra
// pestaña o apoyar un segundo dedo cancela. Sin `VITE_URL_PANEL` no hace nada.
import { useEffect, useState, type RefObject } from 'react'
import { ACCESO_PANEL_RETENCION_MS, ACCESO_PANEL_TOLERANCIA_CELDAS } from '@/config/constantes'
import { obtenerUrlPanel } from '@/config/entorno'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'

const irA = (direccion: string) => window.location.assign(direccion)

interface OpcionesAccesoAlPanel {
  // Dirección del panel; por defecto sale del entorno
  urlPanel?: string | null
  // Cómo se va a la dirección; por defecto, en la misma pestaña
  ir?: (direccion: string) => void
}

// Devuelve si el árbol está siendo mantenido presionado (el árbol lo usa para dejar de soltar hojas)
export function useAccesoAlPanel(
  refEnvoltura: RefObject<HTMLElement | null>,
  { urlPanel = obtenerUrlPanel(), ir = irA }: OpcionesAccesoAlPanel = {},
): boolean {
  const [reteniendo, setReteniendo] = useState(false)

  useEffect(() => {
    const envoltura = refEnvoltura.current
    if (!envoltura || urlPanel === null) return
    let temporizador: number | null = null
    let punteroActivo: number | null = null
    let origen = { x: 0, y: 0 }

    const cancelar = () => {
      if (temporizador !== null) window.clearTimeout(temporizador)
      temporizador = null
      punteroActivo = null
      setReteniendo(false)
    }

    const alPresionar = (evento: PointerEvent) => {
      // Un segundo dedo, o un botón que no es el principal, anula la pulsación
      if (punteroActivo !== null || (evento.pointerType === 'mouse' && evento.button !== 0)) {
        cancelar()
        return
      }
      punteroActivo = evento.pointerId
      origen = { x: evento.clientX, y: evento.clientY }
      setReteniendo(true)
      temporizador = window.setTimeout(() => {
        cancelar()
        ir(urlPanel)
      }, ACCESO_PANEL_RETENCION_MS)
    }

    const alMover = (evento: PointerEvent) => {
      if (evento.pointerId !== punteroActivo) return
      const celdaPx = envoltura.getBoundingClientRect().width / LADO_REJILLA_ARBOL
      const limite = celdaPx * ACCESO_PANEL_TOLERANCIA_CELDAS
      if (Math.hypot(evento.clientX - origen.x, evento.clientY - origen.y) > limite) cancelar()
    }

    const alSoltar = (evento: PointerEvent) => {
      if (evento.pointerId === punteroActivo) cancelar()
    }
    const alOcultarse = () => {
      if (document.visibilityState === 'hidden') cancelar()
    }

    envoltura.addEventListener('pointerdown', alPresionar)
    envoltura.addEventListener('pointerleave', cancelar)
    window.addEventListener('pointermove', alMover)
    window.addEventListener('pointerup', alSoltar)
    window.addEventListener('pointercancel', alSoltar)
    window.addEventListener('blur', cancelar)
    document.addEventListener('visibilitychange', alOcultarse)
    return () => {
      envoltura.removeEventListener('pointerdown', alPresionar)
      envoltura.removeEventListener('pointerleave', cancelar)
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerup', alSoltar)
      window.removeEventListener('pointercancel', alSoltar)
      window.removeEventListener('blur', cancelar)
      document.removeEventListener('visibilitychange', alOcultarse)
      if (temporizador !== null) window.clearTimeout(temporizador)
    }
  }, [refEnvoltura, urlPanel, ir])

  return reteniendo
}
