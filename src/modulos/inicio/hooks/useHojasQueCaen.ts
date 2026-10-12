// Las hojas del árbol: una se suelta sola de vez en cuando (a lo más dos a la vez) y, al presionar
// el árbol, cinco caen en abanico. El azar de las hojas es propio y no depende del sorteo de la entrada.
import { useCallback, useEffect, useRef, useState } from 'react'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import type { EspecificacionHoja } from '../lib/guionArbol'
import { FILA_ABANICO, ORIGENES_HOJA, PIVOTE_COPA } from '../lib/rejillaArbol'

export interface HojaCayendo extends EspecificacionHoja {
  id: number
}

interface OpcionesHojas {
  // Se sueltan hojas solas
  activa: boolean
  pausado: boolean
  aleatorio: () => number
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
    const sueltas = hojasAhora.current.filter((hoja) => hoja.vaiven).length
    if (sueltas >= G.hojasSimultaneas) return
    const [x, y] = ORIGENES_HOJA[Math.floor(aleatorio() * ORIGENES_HOJA.length)]
    agregar([{ x, y, deriva: 0, duracionMs: G.hojaCaidaMs, vaiven: true }])
  }, [agregar, aleatorio])

  const soltarAbanico = useCallback(() => {
    const mitad = (G.abanicoHojas - 1) / 2
    agregar(
      Array.from({ length: G.abanicoHojas }, (_, indice) => {
        const lado = indice - mitad
        return {
          x: PIVOTE_COPA.x - 1 + Math.round(lado * 2),
          y: FILA_ABANICO,
          deriva: lado * G.abanicoDerivaCeldas,
          duracionMs: G.abanicoCaidaMs,
          vaiven: false,
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
