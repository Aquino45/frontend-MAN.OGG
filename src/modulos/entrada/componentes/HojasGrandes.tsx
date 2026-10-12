// Las hojas grandes de la secuencia de la entrada alterna: cada tanto cae una en diagonal hacia la
// derecha, con los colores de la paleta, y cada una cambia de tamaño un paso respecto de la anterior.
// Solo `transform` (lineal: es movimiento constante) y se desmontan con la capa.
import { useEffect, useMemo, useRef } from 'react'
import { ENTRADA_ALTERNA as E } from '@/config/constantes'
import { factoresDeTamano } from '../lib/hojasGrandes'

const VARIANTES_DE_COLOR = 3

interface PropsHojasGrandes {
  // Cuántas ya salieron (las primeras `salidas` del reparto)
  salidas: number
  aleatorio: () => number
}

interface HojaGrandeFicha {
  ladoPx: number
  izquierdaPx: number
}

function HojaGrande({ ficha, indice }: { ficha: HojaGrandeFicha; indice: number }) {
  const refHoja = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const hoja = refHoja.current
    if (!hoja || typeof hoja.animate !== 'function') return
    const caida = window.innerHeight + ficha.ladoPx
    const animacion = hoja.animate(
      [
        { transform: `translate(0px, ${-ficha.ladoPx}px)` },
        { transform: `translate(${caida * E.hojaGrandeDiagonal}px, ${window.innerHeight}px)` },
      ],
      { duration: E.hojaGrandeCaidaMs, easing: 'linear', fill: 'both' },
    )
    return () => animacion.cancel()
  }, [ficha])
  return (
    <div
      ref={refHoja}
      className={`entrada-alterna__hoja entrada-alterna__hoja--${indice % VARIANTES_DE_COLOR}`}
      style={{ left: ficha.izquierdaPx, width: ficha.ladoPx, height: ficha.ladoPx }}
    />
  )
}

export function HojasGrandes({ salidas, aleatorio }: PropsHojasGrandes) {
  // El reparto se arma una sola vez al montar, con el azar recibido
  const fichas = useMemo<HojaGrandeFicha[]>(() => {
    const ladoBasePx = Math.min(window.innerWidth, window.innerHeight) * E.hojaGrandeBase
    return factoresDeTamano(E.hojasMaximas, aleatorio).map((factor) => ({
      ladoPx: Math.round(ladoBasePx * factor),
      // Empiezan en la mitad izquierda: la diagonal las lleva hacia la derecha
      izquierdaPx: Math.round(aleatorio() * window.innerWidth * 0.5),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return fichas
    .slice(0, salidas)
    .map((ficha, indice) => <HojaGrande key={indice} ficha={ficha} indice={indice} />)
}
