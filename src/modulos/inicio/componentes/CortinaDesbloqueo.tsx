// Cortina de desbloqueo: una lluvia de hojas pixel (las del árbol, en los colores de la paleta) cae
// escalonada hasta cubrir toda la pantalla, detrás entra un fondo que asegura la cobertura y encima
// el texto «Modo admin desbloqueado». Al terminar navega a la dirección del panel, en la misma
// pestaña. Solo `transform` y `opacity`, con la curva fuerte de salida; las hojas son adorno
// (aria-hidden) y el texto se anuncia con aria-live. Con «reducir movimiento» no hay hojas ni
// transiciones: se ve el texto un instante y se navega. Se monta oculta antes de hacer falta (mientras
// se presiona), así el costo de armar las hojas no cae en el momento de la animación; solo al
// activarse empieza a animar y a contar el tiempo.
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { capasDeFilas } from '@/compartido/marca/capasDeFilas'
import '@/compartido/marca/marca.estilos.css'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { DESBLOQUEO_ANIMACION as D, DESBLOQUEO_CURVA, TEXTOS_DESBLOQUEO } from '@/config/constantes'
import { disenarCortina } from '../lib/cortinaDesbloqueo'
import { HOJAS_DE_DESBLOQUEO, LADO_HOJA_EN_CELDAS } from '../lib/hojaDesbloqueo'
import './desbloqueo.estilos.css'

const CURVA_SALIDA = `cubic-bezier(${DESBLOQUEO_CURVA.join(', ')})`
// Desde qué parte de la caída la hoja ya se ve entera (antes aparece sin saltos)
const OFFSET_HOJA_VISIBLE = 0.12

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

export default function CortinaDesbloqueo({
  activa,
  urlPanel,
  ir = irAlPanelEnLaMismaPestana,
  alQuitar,
}: PropsCortinaDesbloqueo) {
  const pideMenos = usePideMenosMovimiento()
  const prefijo = useId().replace(/\W/g, '')
  const refContenedor = useRef<HTMLDivElement>(null)
  const [anunciado, setAnunciado] = useState(false)
  // Se mide al activar: si la ventana cambió de tamaño mientras estaba oculta, la rejilla sale al día
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const diseno = useMemo(() => disenarCortina(window.innerWidth, window.innerHeight), [activa])

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
    const contenedor = refContenedor.current
    if (!contenedor || !activa) return
    const animaciones: Animation[] = []
    const sinAnimaciones = pideMenos || typeof contenedor.animate !== 'function'
    if (!sinAnimaciones) {
      const base = { easing: CURVA_SALIDA, fill: 'both' } as const
      const hojas = contenedor.querySelectorAll('[data-hoja]')
      diseno.hojas.forEach((hoja, indice) => {
        animaciones.push(
          hojas[indice].animate(
            [
              { transform: `translateY(${-(hoja.y + diseno.ladoPx)}px)`, opacity: 0 },
              { opacity: 1, offset: OFFSET_HOJA_VISIBLE },
              { transform: 'translateY(0px)', opacity: 1 },
            ],
            { ...base, duration: D.caidaHojaMs, delay: hoja.retrasoMs },
          ),
        )
      })
      animaciones.push(
        contenedor.querySelector('[data-fondo]')!.animate([{ opacity: 0 }, { opacity: 1 }], {
          ...base,
          duration: D.fondoDuracionMs,
          delay: D.fondoRetrasoMs,
        }),
        contenedor.querySelector('[data-chapa]')!.animate(
          [
            { opacity: 0, transform: `translateY(${D.textoDesplazamientoPx}px)` },
            { opacity: 1, transform: 'translateY(0px)' },
          ],
          { ...base, duration: D.textoDuracionMs, delay: D.textoRetrasoMs },
        ),
      )
    }
    // La navegación no espera más de lo que dura la cortina
    const temporizador = window.setTimeout(
      () => ir(urlPanel),
      sinAnimaciones ? D.demoraReducidaMs : D.duracionTotalMs,
    )
    return () => {
      window.clearTimeout(temporizador)
      animaciones.forEach((animacion) => animacion.cancel())
    }
  }, [activa, diseno, ir, pideMenos, urlPanel])

  return createPortal(
    <div
      ref={refContenedor}
      className="desbloqueo"
      data-activa={activa ? 'si' : undefined}
      data-reducido={pideMenos ? 'si' : undefined}
    >
      <p role="status" aria-live="polite" className="solo-lectores">
        {anunciado ? TEXTOS_DESBLOQUEO.anuncio : ''}
      </p>
      <div className="desbloqueo__decoracion" aria-hidden="true">
        <svg className="desbloqueo__simbolos" width="0" height="0" focusable="false">
          {HOJAS_DE_DESBLOQUEO.map((filas, variante) => (
            <symbol
              key={variante}
              id={`${prefijo}-${variante}`}
              viewBox={`0 0 ${LADO_HOJA_EN_CELDAS} ${LADO_HOJA_EN_CELDAS}`}
            >
              {capasDeFilas(filas).map(({ letra, trazo }) => (
                <path key={letra} className={`marca-px marca-px--${letra}`} d={trazo} />
              ))}
            </symbol>
          ))}
        </svg>
        <div className="desbloqueo__fondo" data-fondo />
        {diseno.hojas.map((hoja, indice) => (
          <svg
            key={indice}
            data-hoja
            className="desbloqueo__hoja"
            style={{ left: hoja.x, top: hoja.y, width: diseno.ladoPx, height: diseno.ladoPx }}
            viewBox={`0 0 ${LADO_HOJA_EN_CELDAS} ${LADO_HOJA_EN_CELDAS}`}
            focusable="false"
          >
            <use href={`#${prefijo}-${hoja.variante}`} />
          </svg>
        ))}
        <div className="desbloqueo__chapa" data-chapa>
          <p className="desbloqueo__texto">{TEXTOS_DESBLOQUEO.anuncio}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
