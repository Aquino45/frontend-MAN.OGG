// Árbol pixel de la portada: sus piezas brotan una tras otra, la copa respira por cuadros, suelta
// hojas y responde al cursor, todo en saltos de una celda. Es adorno (aria-hidden). Con «reducir
// movimiento» queda completo y quieto.
import { useEffect, useRef, useState } from 'react'
import { useEntradaTerminada } from '@/modulos/entrada'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { useAnimacionArbol } from '../hooks/useAnimacionArbol'
import { useDesplazamientoAlPuntero } from '../hooks/useDesplazamientoAlPuntero'
import { useHojasQueCaen } from '../hooks/useHojasQueCaen'
import { usePausaDelArbol } from '../hooks/usePausaDelArbol'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'
import {
  COPA_BASE,
  COPAS_REPOSO,
  PIEZAS_CUERPO,
  type CapaArbol,
  type PiezaArbol,
} from '../lib/piezasArbol'
import { HojaCayendo } from './HojaCayendo'

interface PropsArbolAnimado {
  // Fuente de azar de las hojas; propia, separada de la del sorteo de la entrada
  aleatorioHojas?: () => number
}

function Capa({ capa, forma }: { capa: CapaArbol; forma: 'entera' | 'chica' }) {
  const trazo = (
    <path className={`arbol-animado__capa arbol-animado__capa--${capa.clase}`} d={capa[forma]} />
  )
  return capa.arriba ? <g data-parte="arriba">{trazo}</g> : trazo
}

// Una pieza del crecimiento: su versión chica (solo mientras brota) y la entera
function PiezaQueBrota({ pieza }: { pieza: PiezaArbol }) {
  return (
    <g data-pieza={pieza.clave}>
      <g data-forma="chica" className="arbol-animado__chica">
        {pieza.capas.map((capa, indice) => (
          <Capa key={indice} capa={capa} forma="chica" />
        ))}
      </g>
      <g data-forma="entera">
        {pieza.capas.map((capa, indice) => (
          <Capa key={indice} capa={capa} forma="entera" />
        ))}
      </g>
    </g>
  )
}

export function ArbolAnimado({ aleatorioHojas = Math.random }: PropsArbolAnimado) {
  const refEnvoltura = useRef<HTMLDivElement>(null)
  const refRaiz = useRef<SVGSVGElement>(null)
  const entradaTerminada = useEntradaTerminada()
  const [arranco, setArranco] = useState(false)
  const pausado = usePausaDelArbol(refEnvoltura)
  const ultimaPulsacion = useRef(-Infinity)

  // Empieza cuando termina la entrada del sitio, sin competir con ella.
  useEffect(() => {
    if (!entradaTerminada) return
    const temporizador = window.setTimeout(() => setArranco(true), G.retrasoInicioMs)
    return () => window.clearTimeout(temporizador)
  }, [entradaTerminada])

  const { fase, sacudir } = useAnimacionArbol(refRaiz, { activo: arranco, pausado })
  const enReposo = fase === 'reposo'
  const { hojas, soltarAbanico, quitar } = useHojasQueCaen({
    activa: enReposo,
    pausado,
    aleatorio: aleatorioHojas,
  })
  useDesplazamientoAlPuntero(refRaiz, refEnvoltura, enReposo && !pausado)

  const alPresionar = () => {
    const ahora = performance.now()
    if (!enReposo || ahora - ultimaPulsacion.current < G.enfriamientoPulsacionMs) return
    ultimaPulsacion.current = ahora
    sacudir()
    soltarAbanico()
  }

  return (
    <div
      ref={refEnvoltura}
      className="arbol-animado"
      data-fase={fase}
      aria-hidden="true"
      onPointerDown={alPresionar}
    >
      <svg
        ref={refRaiz}
        className="arbol-animado__svg"
        aria-hidden="true"
        viewBox={`0 0 ${LADO_REJILLA_ARBOL} ${LADO_REJILLA_ARBOL}`}
        focusable="false"
      >
        {PIEZAS_CUERPO.map((pieza) => (
          <PiezaQueBrota key={pieza.clave} pieza={pieza} />
        ))}
        <g data-parte="copa">
          <g data-cuadro="0">
            {COPA_BASE.map((pieza) => (
              <PiezaQueBrota key={pieza.clave} pieza={pieza} />
            ))}
          </g>
          {COPAS_REPOSO.map((copa, indice) => (
            <g key={indice} data-cuadro={indice + 1} className="arbol-animado__cuadro">
              {copa.flatMap((pieza) =>
                pieza.capas.map((capa, orden) => (
                  <Capa key={`${pieza.clave}-${orden}`} capa={capa} forma="entera" />
                )),
              )}
            </g>
          ))}
        </g>
        <g>
          {hojas.map((hoja) => (
            <HojaCayendo key={hoja.id} hoja={hoja} pausado={pausado} onTermina={quitar} />
          ))}
        </g>
      </svg>
    </div>
  )
}
