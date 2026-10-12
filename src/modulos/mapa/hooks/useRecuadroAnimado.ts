// Lleva el viewBox del mapa de un recuadro a otro con la curva de movimiento del sitio.
// Escribe el viewBox y --escala-zoom directo en el SVG, cuadro a cuadro, sin pasar por React:
// el mapa no se vuelve a dibujar durante el zoom. Con «movimiento reducido» o si la acción la
// disparó el teclado salta directo al recuadro final.
import { useLayoutEffect, useRef, type RefObject } from 'react'
import { entradaPorTeclado } from '@/compartido/modalidadEntrada'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { MAPA_CURVA_ZOOM } from '@/config/constantes'
import { crearCurvaBezier } from '../lib/curvaBezier'
import type { Recuadro } from '../lib/proyectar'

const curvaZoom = crearCurvaBezier(MAPA_CURVA_ZOOM)

function mezclar(desde: Recuadro, hasta: Recuadro, avance: number): Recuadro {
  const entre = (a: number, b: number) => a + (b - a) * avance
  return {
    x: entre(desde.x, hasta.x),
    y: entre(desde.y, hasta.y),
    ancho: entre(desde.ancho, hasta.ancho),
    alto: entre(desde.alto, hasta.alto),
  }
}

export function useRecuadroAnimado(
  refSvg: RefObject<SVGSVGElement | null>,
  objetivo: Recuadro,
  anchoMapa: number,
  duracionMs: number,
): void {
  const ultimo = useRef<Recuadro | null>(null)
  const pideMenosMovimiento = usePideMenosMovimiento()
  const { x, y, ancho, alto } = objetivo

  useLayoutEffect(() => {
    const svg = refSvg.current
    if (!svg) return
    const destino = { x, y, ancho, alto }
    const escribir = (recuadro: Recuadro) => {
      ultimo.current = recuadro
      svg.setAttribute('viewBox', `${recuadro.x} ${recuadro.y} ${recuadro.ancho} ${recuadro.alto}`)
      svg.style.setProperty('--escala-zoom', String(recuadro.ancho / anchoMapa))
    }
    const origen = ultimo.current
    if (origen === null || duracionMs <= 0 || pideMenosMovimiento || entradaPorTeclado()) {
      escribir(destino)
      return
    }
    let cuadro = 0
    let inicio: number | null = null
    const avanzar = (instante: number) => {
      inicio ??= instante
      const avance = Math.min(1, (instante - inicio) / duracionMs)
      escribir(avance >= 1 ? destino : mezclar(origen, destino, curvaZoom(avance)))
      if (avance < 1) cuadro = window.requestAnimationFrame(avanzar)
    }
    cuadro = window.requestAnimationFrame(avanzar)
    return () => window.cancelAnimationFrame(cuadro)
  }, [refSvg, x, y, ancho, alto, anchoMapa, duracionMs, pideMenosMovimiento])
}
