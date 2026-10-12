// Mantener presionado el árbol de la portada durante `ACCESO_PANEL_RETENCION_MS` desbloquea el acceso
// al panel de administración. Moverse unas celdas, soltar, salir del árbol, pasar a otra pestaña o
// apoyar un segundo dedo cancela. Sin `VITE_URL_PANEL` no hace nada. Pasado el primer segundo de
// presión aparece una señal de progreso (un toque casual no la ve). Al cumplirse el tiempo el hook
// solo avisa: quien lo usa muestra la cortina y navega; soltar después ya no cancela nada.
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  ACCESO_PANEL_RETENCION_MS,
  ACCESO_PANEL_SENAL_DESDE_MS,
  ACCESO_PANEL_TOLERANCIA_CELDAS,
} from '@/config/constantes'
import { obtenerUrlPanel } from '@/config/entorno'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'

interface OpcionesAccesoAlPanel {
  // Dirección del panel; por defecto sale del entorno
  urlPanel?: string | null
  // Se llama al empezar a presionar (por ejemplo, para ir pidiendo el código de la cortina)
  alEmpezar?: () => void
}

export interface AccesoAlPanel {
  // El árbol está siendo mantenido presionado (deja de soltar hojas)
  reteniendo: boolean
  // Ya pasó el tiempo desde el que se ve la señal de progreso
  senal: boolean
  // Se cumplió la retención: toca la cortina y la navegación
  desbloqueado: boolean
  // Dirección a la que se navega; null si no hay panel configurado
  urlPanel: string | null
  // Quita el desbloqueo (si el navegador restaura la página al volver con «Atrás»)
  reiniciar: () => void
}

export function useAccesoAlPanel(
  refEnvoltura: RefObject<HTMLElement | null>,
  { urlPanel = obtenerUrlPanel(), alEmpezar }: OpcionesAccesoAlPanel = {},
): AccesoAlPanel {
  const [reteniendo, setReteniendo] = useState(false)
  const [senal, setSenal] = useState(false)
  const [desbloqueado, setDesbloqueado] = useState(false)
  const desbloqueadoAhora = useRef(false)
  const alEmpezarAhora = useRef(alEmpezar)

  useEffect(() => {
    alEmpezarAhora.current = alEmpezar
  }, [alEmpezar])

  const reiniciar = useCallback(() => {
    desbloqueadoAhora.current = false
    setDesbloqueado(false)
    setSenal(false)
    setReteniendo(false)
  }, [])

  useEffect(() => {
    const envoltura = refEnvoltura.current
    if (!envoltura || urlPanel === null) return
    let temporizadorSenal: number | null = null
    let temporizadorDesbloqueo: number | null = null
    let punteroActivo: number | null = null
    let origen = { x: 0, y: 0 }

    const limpiarTemporizadores = () => {
      if (temporizadorSenal !== null) window.clearTimeout(temporizadorSenal)
      if (temporizadorDesbloqueo !== null) window.clearTimeout(temporizadorDesbloqueo)
      temporizadorSenal = null
      temporizadorDesbloqueo = null
    }

    const cancelar = () => {
      // Una vez desbloqueado, soltar el árbol ya no cancela nada
      if (desbloqueadoAhora.current) return
      limpiarTemporizadores()
      punteroActivo = null
      setReteniendo(false)
      setSenal(false)
    }

    const alPresionar = (evento: PointerEvent) => {
      if (desbloqueadoAhora.current) return
      // Un segundo dedo, o un botón que no es el principal, anula la pulsación
      if (punteroActivo !== null || (evento.pointerType === 'mouse' && evento.button !== 0)) {
        cancelar()
        return
      }
      punteroActivo = evento.pointerId
      origen = { x: evento.clientX, y: evento.clientY }
      setReteniendo(true)
      alEmpezarAhora.current?.()
      temporizadorSenal = window.setTimeout(() => setSenal(true), ACCESO_PANEL_SENAL_DESDE_MS)
      temporizadorDesbloqueo = window.setTimeout(() => {
        limpiarTemporizadores()
        desbloqueadoAhora.current = true
        punteroActivo = null
        setReteniendo(false)
        setSenal(true)
        setDesbloqueado(true)
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
      limpiarTemporizadores()
    }
  }, [refEnvoltura, urlPanel])

  return { reteniendo, senal, desbloqueado, urlPanel, reiniciar }
}
