// Desbloqueo del modo admin, en dos fases. Primero cae la cortina de hojas hasta cubrir la pantalla;
// después las hojas se apagan, un candado pixel se abre y entra «Modo admin desbloqueado», palabra
// por palabra, con una línea que se dibuja debajo. Al terminar navega a la dirección del panel, en
// la misma pestaña. Solo `transform` y `opacity`, con la curva fuerte de salida; lo dibujado es
// adorno (aria-hidden) y el texto se anuncia con aria-live. Con «reducir movimiento» no hay hojas ni
// transiciones: se ve el candado abierto y el texto fijos un instante y se navega.
import { useEffect, useRef, useState } from 'react'
import { CortinaDeHojas } from '@/compartido/cortinaHojas/CortinaDeHojas'
import { capasDeFilas } from '@/compartido/marca/capasDeFilas'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { CORTINA_CURVA, DESBLOQUEO_ANIMACION as D, TEXTOS_DESBLOQUEO } from '@/config/constantes'
import {
  ALTO_CANDADO_EN_CELDAS,
  ANCHO_CANDADO_EN_CELDAS,
  ARCO_CANDADO,
  CUERPO_CANDADO,
} from '../lib/candadoDesbloqueo'
import './desbloqueo.estilos.css'

const CURVA_SALIDA = `cubic-bezier(${CORTINA_CURVA.join(', ')})`

interface PropsCortinaDesbloqueo {
  // Montada pero oculta mientras es falso; al volverse verdadero empieza la cortina
  activa: boolean
  // Dirección del panel
  urlPanel: string
  // Cómo se va a ella; por defecto, en la misma pestaña
  ir?: (direccion: string) => void
  // Se pide quitar la cortina (por ejemplo, si el navegador restaura la página al volver)
  alQuitar: () => void
}

const irAlPanelEnLaMismaPestana = (direccion: string) => window.location.assign(direccion)

function Pieza({ filas }: { filas: readonly string[] }) {
  return capasDeFilas(filas).map(({ letra, trazo }) => (
    <path key={letra} className={`marca-px marca-px--${letra}`} d={trazo} />
  ))
}

export default function CortinaDesbloqueo({
  activa,
  urlPanel,
  ir = irAlPanelEnLaMismaPestana,
  alQuitar,
}: PropsCortinaDesbloqueo) {
  const pideMenos = usePideMenosMovimiento()
  const refEscena = useRef<HTMLDivElement>(null)
  const [anunciado, setAnunciado] = useState(false)

  // El texto entra después de activar la zona de avisos: así los lectores de pantalla lo anuncian
  useEffect(() => {
    if (!activa) return
    const temporizador = window.setTimeout(() => setAnunciado(true), 0)
    return () => window.clearTimeout(temporizador)
  }, [activa])

  // Si el navegador restaura la página al volver con «Atrás», no se vuelve a una pantalla tapada
  useEffect(() => {
    const alMostrar = (evento: PageTransitionEvent) => {
      if (evento.persisted) alQuitar()
    }
    window.addEventListener('pageshow', alMostrar)
    return () => window.removeEventListener('pageshow', alMostrar)
  }, [alQuitar])

  useEffect(() => {
    const escena = refEscena.current
    if (!escena || !activa) return
    const animaciones: Animation[] = []
    const sinAnimaciones = pideMenos || typeof escena.animate !== 'function'
    if (!sinAnimaciones) {
      const base = { easing: CURVA_SALIDA, fill: 'both' } as const
      const entra = (elemento: Element, retrasoMs: number, duracionMs: number) =>
        animaciones.push(
          elemento.animate(
            [
              { opacity: 0, transform: `translateY(${D.textoDesplazamientoPx}px)` },
              { opacity: 1, transform: 'translateY(0px)' },
            ],
            { ...base, duration: duracionMs, delay: retrasoMs },
          ),
        )
      animaciones.push(
        escena
          .querySelector('[data-atenuado]')!
          .animate([{ opacity: 0 }, { opacity: D.atenuadoOpacidad }], {
            ...base,
            duration: D.atenuadoDuracionMs,
            delay: D.atenuadoRetrasoMs,
          }),
        escena
          .querySelector('[data-arco]')!
          .animate(
            [
              { transform: 'translateY(0px)' },
              { transform: `translateY(${-D.arcoCeldasQueSube}px)` },
            ],
            { ...base, duration: D.arcoDuracionMs, delay: D.arcoRetrasoMs },
          ),
        escena
          .querySelector('[data-linea]')!
          .animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
            ...base,
            duration: D.lineaDuracionMs,
            delay: D.lineaRetrasoMs,
          }),
      )
      entra(escena.querySelector('[data-candado]')!, D.candadoRetrasoMs, D.candadoDuracionMs)
      escena
        .querySelectorAll('[data-palabra]')
        .forEach((palabra, orden) =>
          entra(palabra, D.textoRetrasoMs + orden * D.textoEscalonadoMs, D.textoDuracionMs),
        )
    }
    // La navegación no espera más de lo que dura la animación
    const temporizador = window.setTimeout(
      () => ir(urlPanel),
      sinAnimaciones ? D.demoraReducidaMs : D.duracionTotalMs,
    )
    return () => {
      window.clearTimeout(temporizador)
      animaciones.forEach((animacion) => animacion.cancel())
    }
  }, [activa, ir, pideMenos, urlPanel])

  return (
    <CortinaDeHojas activa={activa}>
      <p role="status" aria-live="polite" className="solo-lectores">
        {anunciado ? TEXTOS_DESBLOQUEO.anuncio : ''}
      </p>
      <div ref={refEscena} className="desbloqueo" aria-hidden="true">
        <div className="desbloqueo__atenuado" data-atenuado />
        <div className="desbloqueo__contenido">
          <svg
            className="desbloqueo__candado"
            data-candado
            style={{
              width: ANCHO_CANDADO_EN_CELDAS * D.candadoCeldaPx,
              height: (ALTO_CANDADO_EN_CELDAS + D.arcoCeldasQueSube) * D.candadoCeldaPx,
            }}
            viewBox={`0 ${-D.arcoCeldasQueSube} ${ANCHO_CANDADO_EN_CELDAS} ${ALTO_CANDADO_EN_CELDAS + D.arcoCeldasQueSube}`}
            focusable="false"
          >
            <g data-arco style={{ transform: `translateY(${-D.arcoCeldasQueSube}px)` }}>
              <Pieza filas={ARCO_CANDADO} />
            </g>
            <g transform={`translate(0 ${ARCO_CANDADO.length})`}>
              <Pieza filas={CUERPO_CANDADO} />
            </g>
          </svg>
          <p className="desbloqueo__texto">
            {TEXTOS_DESBLOQUEO.palabras.map((palabra) => (
              <span key={palabra} className="desbloqueo__palabra" data-palabra>
                {palabra}
              </span>
            ))}
          </p>
          <div className="desbloqueo__linea" data-linea />
        </div>
      </div>
    </CortinaDeHojas>
  )
}
