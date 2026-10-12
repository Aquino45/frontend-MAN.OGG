// Las hojas del árbol: una se suelta sola de vez en cuando (a lo más dos a la vez) y, al presionar
// el árbol, cinco caen en abanico. El azar de las hojas es propio y no depende del sorteo de la entrada.
import { useCallback, useEffect, useRef, useState } from 'react'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'
import type { EspecificacionHoja } from '../lib/guionArbol'
import { ORIGENES_HOJA } from '../lib/piezasArbol'

export interface HojaCayendo extends EspecificacionHoja {
  id: number
}

interface OpcionesHojas {
  // Se sueltan hojas solas
  activa: boolean
  pausado: boolean
  aleatorio: () => number
}

// Cuántas celdas baja una hoja que sale de la fila `y`: hasta cerca del suelo del dibujo
function pasosDesde(y: number): number {
  return Math.min(G.hojaPasosMax, LADO_REJILLA_ARBOL - 2 - y)
}

export function useHojasQueCaen({ activa, pausado, aleatorio }: OpcionesHojas) {
  const [hojas, setHojas] = useState<HojaCayendo[]>([])
  const hojasAhora = useRef<HojaCayendo[]>([])
  const siguienteId = useRef(0)

  const agregar = useCallback((nuevas: EspecificacionHoja[]) => {
    const conId = nuevas.map((hoja) => ({ ...hoja, id: ++siguienteId.current }))
    hojasAhora.current = [...hojasAhora.current, ...conId]
    setHojas(hojasAhora.current)
  }, [])

  const quitar = useCallback((id: number) => {
    hojasAhora.current = hojasAhora.current.filter((hoja) => hoja.id !== id)
    setHojas(hojasAhora.current)
  }, [])

  const soltarUna = useCallback(() => {
    if (hojasAhora.current.length >= G.hojasSimultaneas) return
    const origen = ORIGENES_HOJA[Math.floor(aleatorio() * ORIGENES_HOJA.length)]
    agregar([{ ...origen, pasos: pasosDesde(origen.y), derivaPorPaso: 0, retrasoMs: 0 }])
  }, [agregar, aleatorio])

  // Cinco hojas repartidas a lo ancho de la copa, que se abren en abanico al caer
  const soltarAbanico = useCallback(() => {
    const mitad = (G.abanicoHojas - 1) / 2
    agregar(
      Array.from({ length: G.abanicoHojas }, (_, indice) => {
        const origen =
          ORIGENES_HOJA[Math.floor(((indice + 0.5) / G.abanicoHojas) * ORIGENES_HOJA.length)]
        return {
          ...origen,
          pasos: pasosDesde(origen.y),
          derivaPorPaso: ((indice - mitad) / mitad) * G.abanicoDerivaPorPaso,
          retrasoMs: indice * G.abanicoEscalonMs,
        }
      }),
    )
  }, [agregar])

  useEffect(() => {
    if (!activa || pausado) return
    let temporizador = 0
    const programar = () => {
      const espera =
        G.hojaIntervaloMinMs + aleatorio() * (G.hojaIntervaloMaxMs - G.hojaIntervaloMinMs)
      temporizador = window.setTimeout(() => {
        soltarUna()
        programar()
      }, espera)
    }
    programar()
    return () => window.clearTimeout(temporizador)
  }, [activa, pausado, aleatorio, soltarUna])

  return { hojas, soltarAbanico, quitar }
}
