// Hoja inferior del celular que se arrastra con el dedo desde su asa. Pointer events con captura
// del puntero: el arrastre sigue aunque el dedo salga del asa, y un segundo dedo se ignora.
// Se cierra por velocidad o por distancia; hacia arriba se amortigua. Escribe `transform` directo
// en la hoja (sin pasar por React) y deja las transiciones al CSS, que decide su duración.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react'
import { HOJA_ARRASTRE } from '@/config/constantes'
import { amortiguarHaciaArriba, debeCerrarHoja } from '../lib/hoja'

type EstadoHoja = 'suelta' | 'cierra'

interface Gesto {
  hoja: HTMLElement
  idPuntero: number
  inicioY: number
  inicioMs: number
  // Desplazamiento con el que estaba la hoja al empezar (no es 0 si se la agarró en movimiento)
  baseY: number
  arrastrando: boolean
  desplazamientoY: number
}

export interface PropsAsaHoja {
  onPointerDown: (evento: PointerEvent<HTMLElement>) => void
  onPointerMove: (evento: PointerEvent<HTMLElement>) => void
  onPointerUp: (evento: PointerEvent<HTMLElement>) => void
  onPointerCancel: (evento: PointerEvent<HTMLElement>) => void
}

interface OpcionesHoja {
  // Pedir cerrar: se llama cuando la hoja terminó de salir o, si cambia solo el contenido, al soltar
  onCerrar: () => void
  // Verdadero si cerrar saca a la hoja de la pantalla; falso si solo cambia lo que muestra
  // (de la cartilla a la lista): entonces la hoja vuelve a su lugar mientras cambia el contenido.
  salePorAbajo: boolean
}

function desplazamientoActual(hoja: HTMLElement): number {
  const valor = window.getComputedStyle(hoja).transform
  if (!valor || valor === 'none' || typeof DOMMatrixReadOnly !== 'function') return 0
  return new DOMMatrixReadOnly(valor).m42
}

// Cuánto dura la transición que el CSS le puso a la hoja (0 si no hay o está apagada).
function duracionTransicionMs(hoja: HTMLElement): number {
  const [primera = ''] = window.getComputedStyle(hoja).transitionDuration.split(',')
  const valor = Number.parseFloat(primera)
  if (Number.isNaN(valor)) return 0
  return primera.trim().endsWith('ms') ? valor : valor * 1000
}

export function useHojaArrastrable({ onCerrar, salePorAbajo }: OpcionesHoja): {
  refHoja: RefObject<HTMLElement | null>
  propsAsa: PropsAsaHoja
} {
  const refHoja = useRef<HTMLElement>(null)
  const gesto = useRef<Gesto | null>(null)
  const limpiarEspera = useRef<(() => void) | null>(null)
  const ultimas = useRef({ onCerrar, salePorAbajo })
  // Lo último que dijo quien usa el hook, para leerlo desde los eventos sin volver a crearlos
  useLayoutEffect(() => {
    ultimas.current = { onCerrar, salePorAbajo }
  })

  useEffect(() => () => limpiarEspera.current?.(), [])

  // Pone la hoja en su estado de transición y espera a que termine (o sigue al instante si el
  // CSS no la anima: movimiento reducido, teclado o sin soporte).
  const llevarA = useCallback((hoja: HTMLElement, estado: EstadoHoja, destino: string) => {
    return new Promise<void>((resolver) => {
      limpiarEspera.current?.()
      hoja.dataset.hoja = estado
      delete hoja.dataset.arrastrando
      hoja.style.transform = destino
      const duracion = duracionTransicionMs(hoja)
      if (duracion <= 0) {
        resolver()
        return
      }
      let terminada = false
      const terminar = () => {
        if (terminada) return
        terminada = true
        window.clearTimeout(plazo)
        hoja.removeEventListener('transitionend', alTerminar)
        limpiarEspera.current = null
        resolver()
      }
      const alTerminar = (evento: TransitionEvent) => {
        if (evento.target === hoja && evento.propertyName === 'transform') terminar()
      }
      // Por si el navegador no avisa del fin (pestaña en segundo plano)
      const plazo = window.setTimeout(terminar, duracion + 60)
      hoja.addEventListener('transitionend', alTerminar)
      limpiarEspera.current = terminar
    })
  }, [])

  const volverAlLugar = useCallback(
    async (hoja: HTMLElement) => {
      await llevarA(hoja, 'suelta', '')
      delete hoja.dataset.hoja
    },
    [llevarA],
  )

  const soltar = useCallback(
    async (hoja: HTMLElement, cerrar: boolean) => {
      if (!cerrar) {
        await volverAlLugar(hoja)
        return
      }
      if (!ultimas.current.salePorAbajo) {
        ultimas.current.onCerrar()
        await volverAlLugar(hoja)
        return
      }
      await llevarA(hoja, 'cierra', 'translateY(100%)')
      ultimas.current.onCerrar()
    },
    [llevarA, volverAlLugar],
  )

  const alBajar = useCallback((evento: PointerEvent<HTMLElement>) => {
    const hoja = refHoja.current
    // Solo el primer dedo (o el botón principal del ratón); mientras cierra no se agarra.
    // Un gesto de una hoja que ya no existe no cuenta.
    if (!hoja || evento.button !== 0 || hoja.dataset.hoja === 'cierra') return
    if (gesto.current?.hoja === hoja) return
    const baseY = desplazamientoActual(hoja)
    limpiarEspera.current?.()
    delete hoja.dataset.hoja
    evento.currentTarget.setPointerCapture(evento.pointerId)
    gesto.current = {
      hoja,
      idPuntero: evento.pointerId,
      inicioY: evento.clientY,
      inicioMs: evento.timeStamp,
      baseY,
      arrastrando: false,
      desplazamientoY: baseY,
    }
  }, [])

  const alMover = useCallback((evento: PointerEvent<HTMLElement>) => {
    const hoja = refHoja.current
    const actual = gesto.current
    if (!hoja || !actual || evento.pointerId !== actual.idPuntero) return
    const recorrido = evento.clientY - actual.inicioY
    if (!actual.arrastrando) {
      if (Math.abs(recorrido) < HOJA_ARRASTRE.holguraInicioPx) return
      actual.arrastrando = true
      hoja.dataset.arrastrando = 'true'
      hoja.style.transform = `translateY(${actual.baseY}px)`
    }
    actual.desplazamientoY = amortiguarHaciaArriba(actual.baseY + recorrido)
    hoja.style.transform = `translateY(${actual.desplazamientoY}px)`
  }, [])

  const alTerminar = useCallback(
    (evento: PointerEvent<HTMLElement>, cancelado: boolean) => {
      const hoja = refHoja.current
      const actual = gesto.current
      if (!hoja || !actual || evento.pointerId !== actual.idPuntero) return
      gesto.current = null
      if (!actual.arrastrando) return
      const cierra =
        !cancelado &&
        debeCerrarHoja({
          desplazamientoPx: actual.desplazamientoY,
          altoPx: hoja.offsetHeight,
          recorridoPx: evento.clientY - actual.inicioY,
          tiempoMs: evento.timeStamp - actual.inicioMs,
        })
      void soltar(hoja, cierra)
    },
    [soltar],
  )

  const propsAsa: PropsAsaHoja = {
    onPointerDown: alBajar,
    onPointerMove: alMover,
    onPointerUp: (evento) => alTerminar(evento, false),
    onPointerCancel: (evento) => alTerminar(evento, true),
  }
  return { refHoja, propsAsa }
}
