// Árbol pixel de la portada: crece al abrir el sitio, se mece en reposo, suelta hojas y responde
// al cursor. Es adorno (aria-hidden). Con «reducir movimiento» queda completo y quieto.
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useEntradaTerminada } from '@/modulos/entrada'
import { ARBOL_ANIMADO as G, ARBOL_REPOSO_COMPLETO, CONSULTA_HOVER_FINO } from '@/config/constantes'
import { useAnimacionArbol } from '../hooks/useAnimacionArbol'
import { useHojasQueCaen } from '../hooks/useHojasQueCaen'
import { useInclinacionAlPuntero } from '../hooks/useInclinacionAlPuntero'
import { usePausaDelArbol } from '../hooks/usePausaDelArbol'
import { claveFila, claveTronco, ORIGEN_COPA } from '../lib/guionArbol'
import {
  BASE_TRONCO_Y,
  CELDA_PARPADEO,
  FILAS_COPA,
  FILAS_POR_PASO_TRONCO,
  LADO_REJILLA_ARBOL,
  PASOS_TRONCO,
  TRONCO,
} from '../lib/rejillaArbol'
import { HojaCayendo } from './HojaCayendo'

interface PropsArbolAnimado {
  // Fuente de azar de las hojas; propia, separada de la del sorteo de la entrada
  aleatorioHojas?: () => number
  // Reposo completo o simple (la red de seguridad de rendimiento)
  reposoCompleto?: boolean
}

const ORIGEN_BASE = `${LADO_REJILLA_ARBOL / 2}px ${BASE_TRONCO_Y}px`
const ESTILO_COPA: CSSProperties = { transformOrigin: ORIGEN_COPA }
const ANCHO_DESTELLO = 5
const LADO_PARPADEO = 2

function pasosDelTronco() {
  return Array.from({ length: PASOS_TRONCO }, (_, paso) => ({
    paso,
    y: TRONCO.y + TRONCO.alto - (paso + 1) * FILAS_POR_PASO_TRONCO,
  }))
}

export function ArbolAnimado({
  aleatorioHojas = Math.random,
  reposoCompleto = ARBOL_REPOSO_COMPLETO,
}: PropsArbolAnimado) {
  const idSilueta = useId().replace(/:/g, '')
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

  const { fase, sacudir, respirarRapido } = useAnimacionArbol(refRaiz, {
    activo: arranco,
    pausado,
    reposoCompleto,
  })
  const enReposo = fase === 'reposo'
  const { hojas, soltarAbanico, quitar } = useHojasQueCaen({
    activa: enReposo,
    pausado,
    aleatorio: aleatorioHojas,
  })
  useInclinacionAlPuntero(refRaiz, refEnvoltura, enReposo && !pausado)

  const alPresionar = () => {
    const ahora = performance.now()
    if (!enReposo || ahora - ultimaPulsacion.current < G.enfriamientoPulsacionMs) return
    ultimaPulsacion.current = ahora
    sacudir()
    soltarAbanico()
  }

  const hayCursorFino = () =>
    typeof window.matchMedia === 'function' && window.matchMedia(CONSULTA_HOVER_FINO).matches

  return (
    <div
      ref={refEnvoltura}
      className="arbol-animado"
      data-fase={fase}
      aria-hidden="true"
      onPointerDown={alPresionar}
      onPointerEnter={() => hayCursorFino() && respirarRapido(true)}
      onPointerLeave={() => respirarRapido(false)}
    >
      <svg
        ref={refRaiz}
        className="glifo-pixel arbol-animado__svg"
        aria-hidden="true"
        viewBox={`0 0 ${LADO_REJILLA_ARBOL} ${LADO_REJILLA_ARBOL}`}
        focusable="false"
      >
        <defs>
          <clipPath id={idSilueta}>
            {FILAS_COPA.map(({ y, tramo }) => (
              <rect key={y} x={tramo.x} y={y} width={tramo.ancho} height={1} />
            ))}
            <rect x={TRONCO.x} y={TRONCO.y} width={TRONCO.ancho} height={TRONCO.alto} />
          </clipPath>
        </defs>

        {pasosDelTronco().map(({ paso, y }) => (
          <g
            key={paso}
            data-parte={claveTronco(paso)}
            style={paso === 0 ? { transformOrigin: ORIGEN_BASE } : undefined}
          >
            <rect
              className="glifo-pixel__tronco"
              x={TRONCO.x}
              y={y}
              width={TRONCO.ancho}
              height={FILAS_POR_PASO_TRONCO}
            />
          </g>
        ))}

        <g data-parte="inclina" style={ESTILO_COPA}>
          <g data-parte="rebote">
            <g data-parte="respira" style={ESTILO_COPA}>
              {FILAS_COPA.map(({ y, tramo, motas }) => (
                <g key={y} data-parte={claveFila(y)}>
                  <rect
                    className={`glifo-pixel__${tramo.parte}`}
                    x={tramo.x}
                    y={y}
                    width={tramo.ancho}
                    height={1}
                  />
                  {motas.map((mota) => (
                    <rect
                      key={mota.x}
                      className={`glifo-pixel__${mota.parte}`}
                      x={mota.x}
                      y={y}
                      width={1}
                      height={1}
                    />
                  ))}
                </g>
              ))}
              <rect
                data-parte="parpadeo"
                className="glifo-pixel__copa-media arbol-animado__parpadeo"
                x={CELDA_PARPADEO.x}
                y={CELDA_PARPADEO.y}
                width={LADO_PARPADEO}
                height={LADO_PARPADEO}
              />
            </g>
          </g>
        </g>

        <g clipPath={`url(#${idSilueta})`}>
          <rect
            data-parte="destello"
            className="arbol-animado__destello"
            x={-ANCHO_DESTELLO - 1}
            y={0}
            width={ANCHO_DESTELLO}
            height={LADO_REJILLA_ARBOL}
          />
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
