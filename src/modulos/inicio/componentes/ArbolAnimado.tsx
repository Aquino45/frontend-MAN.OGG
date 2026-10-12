// Árbol pixel de la portada: se ve completo y quieto desde el primer cuadro; cuando termina la
// entrada del sitio la copa respira por cuadros, suelta hojas y responde al cursor, todo en saltos
// de una celda. Es adorno (aria-hidden). Con «reducir movimiento» queda completo y quieto.
import { useEffect, useRef, useState } from 'react'
import { useEntradaTerminada } from '@/modulos/entrada'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { useAccesoAlPanel } from '../hooks/useAccesoAlPanel'
import { useAnimacionArbol } from '../hooks/useAnimacionArbol'
import { useDesplazamientoAlPuntero } from '../hooks/useDesplazamientoAlPuntero'
import { useHojasQueCaen } from '../hooks/useHojasQueCaen'
import { usePausaDelArbol } from '../hooks/usePausaDelArbol'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'
import { COPA_BASE, PIEZAS_CUERPO, copasReposo, type CapaArbol } from '../lib/piezasArbol'
import { HojaCayendo } from './HojaCayendo'

interface PropsArbolAnimado {
  // Fuente de azar de las hojas; propia, separada de la del sorteo de la entrada
  aleatorioHojas?: () => number
  // Dirección del panel y cómo se va a ella; se inyectan en los tests
  urlPanel?: string | null
  irAlPanel?: (direccion: string) => void
}

function Capa({ capa }: { capa: CapaArbol }) {
  const trazo = (
    <path className={`arbol-animado__capa arbol-animado__capa--${capa.clase}`} d={capa.entera} />
  )
  return capa.arriba ? <g data-parte="arriba">{trazo}</g> : trazo
}

export function ArbolAnimado({
  aleatorioHojas = Math.random,
  urlPanel,
  irAlPanel,
}: PropsArbolAnimado) {
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
  // Los cuadros del reposo se arman y se dibujan solo cuando van a verse
  const conReposo = arranco && fase !== 'quieto'
  // Mientras se mantiene presionado, el árbol deja de soltar hojas
  const retenido = useAccesoAlPanel(refEnvoltura, { urlPanel, ir: irAlPanel })
  const { hojas, soltarAbanico, quitar } = useHojasQueCaen({
    activa: enReposo && !retenido,
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
      onContextMenu={(evento) => evento.preventDefault()}
    >
      <svg
        ref={refRaiz}
        className="arbol-animado__svg"
        aria-hidden="true"
        viewBox={`0 0 ${LADO_REJILLA_ARBOL} ${LADO_REJILLA_ARBOL}`}
        focusable="false"
      >
        {PIEZAS_CUERPO.map((pieza) => (
          <g key={pieza.clave} data-pieza={pieza.clave}>
            {pieza.capas.map((capa, indice) => (
              <Capa key={indice} capa={capa} />
            ))}
          </g>
        ))}
        <g data-parte="copa">
          <g data-cuadro="0">
            {COPA_BASE.map((pieza) => (
              <g key={pieza.clave} data-pieza={pieza.clave}>
                {pieza.capas.map((capa, indice) => (
                  <Capa key={indice} capa={capa} />
                ))}
              </g>
            ))}
          </g>
          {conReposo &&
            copasReposo().map((copa, indice) => (
              <g key={indice} data-cuadro={indice + 1} className="arbol-animado__cuadro">
                {copa.flatMap((pieza) =>
                  pieza.capas.map((capa, orden) => (
                    <Capa key={`${pieza.clave}-${orden}`} capa={capa} />
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
