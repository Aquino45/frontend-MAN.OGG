// Cortina de hojas pixel: una lluvia de hojas (las del árbol, en los colores de la paleta) cae en
// diagonal hacia la derecha, en una ola de izquierda a derecha, y cubre toda la pantalla; detrás
// entra un fondo que cierra lo que queda entre ellas. La usa quien necesite tapar la pantalla con
// estilo; lo que se ve encima va como hijos. Solo `transform` y `opacity`, con la curva fuerte de
// salida. Las hojas son adorno (aria-hidden). Con «reducir movimiento» no hay hojas ni transiciones:
// el fondo se ve fijo. Se monta oculta antes de hacer falta, así el costo de armar las hojas no cae
// en el momento de la animación; solo al activarse empieza a animar y a contar el tiempo.
import { useEffect, useId, useMemo, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CORTINA_CURVA, CORTINA_HOJAS as C } from '@/config/constantes'
import { capasDeFilas } from '../marca/capasDeFilas'
import '../marca/marca.estilos.css'
import { usePideMenosMovimiento } from '../usePideMenosMovimiento'
import { disenarCortina } from './disenoCortina'
import { HOJAS_DE_CORTINA, LADO_HOJA_EN_CELDAS } from './hojasCortina'
import './cortinaHojas.estilos.css'

const CURVA_SALIDA = `cubic-bezier(${CORTINA_CURVA.join(', ')})`
// Desde qué parte de la caída la hoja ya se ve entera (antes aparece sin saltos)
const OFFSET_HOJA_VISIBLE = 0.12

interface PropsCortinaDeHojas {
  // Montada pero oculta mientras es falso; al volverse verdadero empieza a caer
  activa: boolean
  // Se desvanece (cuando otra capa toma la pantalla)
  retirada?: boolean
  // Ya cubre toda la pantalla (con «reducir movimiento», al instante)
  alCubrir?: () => void
  // Lo que se ve encima de las hojas
  children?: ReactNode
}

export function CortinaDeHojas({
  activa,
  retirada = false,
  alCubrir,
  children,
}: PropsCortinaDeHojas) {
  const pideMenos = usePideMenosMovimiento()
  const prefijo = useId().replace(/\W/g, '')
  const refCapa = useRef<HTMLDivElement>(null)
  // Se mide al activar: si la ventana cambió de tamaño mientras estaba oculta, la rejilla sale al día
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const diseno = useMemo(() => disenarCortina(window.innerWidth, window.innerHeight), [activa])
  // Quien la usa puede pasar una función nueva en cada render sin reiniciar las animaciones
  const refAlCubrir = useRef(alCubrir)
  useEffect(() => {
    refAlCubrir.current = alCubrir
  })

  useEffect(() => {
    const capa = refCapa.current
    if (!capa || !activa) return
    const animaciones: Animation[] = []
    const sinAnimaciones = pideMenos || typeof capa.animate !== 'function'
    if (!sinAnimaciones) {
      const base = { easing: CURVA_SALIDA, fill: 'both' } as const
      const hojas = capa.querySelectorAll('[data-hoja]')
      diseno.hojas.forEach((hoja, indice) => {
        const caida = hoja.y + diseno.ladoPx
        animaciones.push(
          hojas[indice].animate(
            [
              { transform: `translate(${-caida * C.diagonal}px, ${-caida}px)`, opacity: 0 },
              { opacity: 1, offset: OFFSET_HOJA_VISIBLE },
              { transform: 'translate(0px, 0px)', opacity: 1 },
            ],
            { ...base, duration: C.caidaHojaMs, delay: hoja.retrasoMs },
          ),
        )
      })
      animaciones.push(
        capa.querySelector('[data-fondo]')!.animate([{ opacity: 0 }, { opacity: 1 }], {
          ...base,
          duration: C.fondoDuracionMs,
          delay: C.fondoRetrasoMs,
        }),
      )
    }
    const temporizador = window.setTimeout(
      () => refAlCubrir.current?.(),
      sinAnimaciones ? 0 : C.cubrirMs,
    )
    return () => {
      window.clearTimeout(temporizador)
      animaciones.forEach((animacion) => animacion.cancel())
    }
  }, [activa, diseno, pideMenos])

  // Sale con un fundido; la capa queda con su último cuadro mientras quien la usa decide qué sigue
  useEffect(() => {
    const capa = refCapa.current
    if (!capa || !retirada || pideMenos || typeof capa.animate !== 'function') return
    const salida = capa.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: C.retiradaMs,
      easing: CURVA_SALIDA,
      fill: 'both',
    })
    return () => salida.cancel()
  }, [retirada, pideMenos])

  return createPortal(
    <div
      ref={refCapa}
      className="cortina-hojas"
      data-activa={activa ? 'si' : undefined}
      data-reducido={pideMenos ? 'si' : undefined}
    >
      <div className="cortina-hojas__decoracion" aria-hidden="true">
        <svg className="cortina-hojas__simbolos" width="0" height="0" focusable="false">
          {HOJAS_DE_CORTINA.map((filas, variante) => (
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
        <div className="cortina-hojas__fondo" data-fondo />
        {diseno.hojas.map((hoja, indice) => (
          <svg
            key={indice}
            data-hoja
            className="cortina-hojas__hoja"
            style={{ left: hoja.x, top: hoja.y, width: diseno.ladoPx, height: diseno.ladoPx }}
            viewBox={`0 0 ${LADO_HOJA_EN_CELDAS} ${LADO_HOJA_EN_CELDAS}`}
            focusable="false"
          >
            <use href={`#${prefijo}-${hoja.variante}`} />
          </svg>
        ))}
      </div>
      {children}
    </div>,
    document.body,
  )
}
