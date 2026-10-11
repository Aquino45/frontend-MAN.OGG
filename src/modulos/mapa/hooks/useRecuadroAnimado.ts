// Lleva el viewBox del mapa de un recuadro a otro con una transición corta.
// Con «movimiento reducido» salta directo al recuadro final.
import { useEffect, useRef, useState } from 'react'
import { CONSULTA_MOVIMIENTO_REDUCIDO } from '@/config/constantes'
import type { Recuadro } from '../lib/proyectar'

function pideMenosMovimiento(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO).matches
  )
}

// Curva de salida suave: arranca rápido y termina despacio.
function suavizar(avance: number): number {
  return 1 - (1 - avance) ** 3
}

function mezclar(desde: Recuadro, hasta: Recuadro, avance: number): Recuadro {
  const entre = (a: number, b: number) => a + (b - a) * avance
  return {
    x: entre(desde.x, hasta.x),
    y: entre(desde.y, hasta.y),
    ancho: entre(desde.ancho, hasta.ancho),
    alto: entre(desde.alto, hasta.alto),
  }
}

export function useRecuadroAnimado(objetivo: Recuadro, duracionMs: number): Recuadro {
  const [actual, setActual] = useState(objetivo)
  const ultimo = useRef(objetivo)
  const { x, y, ancho, alto } = objetivo

  useEffect(() => {
    const destino = { x, y, ancho, alto }
    const origen = ultimo.current
    const sinMovimiento = duracionMs <= 0 || pideMenosMovimiento()
    let cuadro = 0
    let inicio: number | null = null
    const avanzar = (instante: number) => {
      inicio ??= instante
      const avance = sinMovimiento ? 1 : Math.min(1, (instante - inicio) / duracionMs)
      const siguiente = avance >= 1 ? destino : mezclar(origen, destino, suavizar(avance))
      ultimo.current = siguiente
      setActual(siguiente)
      if (avance < 1) cuadro = window.requestAnimationFrame(avanzar)
    }
    cuadro = window.requestAnimationFrame(avanzar)
    return () => window.cancelAnimationFrame(cuadro)
  }, [x, y, ancho, alto, duracionMs])

  return actual
}
