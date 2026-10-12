// La variante alterna de la entrada: una secuencia interactiva. Cae la cortina de hojas, queda el fondo
// con la ilustración, caen hojas grandes en diagonal, entra una caja de diálogo y se escriben tres frases
// letra por letra (con un pulso grave por letra y, si hay una pista, música de fondo). Cada frase espera a
// que la persona avance (Enter, Z, espacio o clic) o avanza sola; la última pregunta tiene dos opciones
// (flechas o A/D y Enter, Z o clic; sin respuesta, NO). Elegir SÍ lanza una celebración. La secuencia
// termina al cerrarse la última frase, o antes con Esc; se desvanece y deja ver la vista pedida. Con
// «reducir movimiento»: sin cortina, hojas, cursor, escritura, celebración ni sonido; las frases se ven
// completas, la elección funciona con teclado y la salida es inmediata. Este archivo y sus recursos se
// cargan solo cuando sale esta variante.
import { useEffect, useReducer, useRef, useState } from 'react'
import { CortinaDeHojas } from '@/compartido/cortinaHojas/CortinaDeHojas'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import {
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  ENTRADA_ALTERNA as E,
} from '@/config/constantes'
import '@fontsource/silkscreen/400.css'
import { usePunteroFino } from '../hooks/usePunteroFino'
import { ESTADO_INICIAL, esperaDe, INDICE_CIERRE, reducirEstado, textoDe } from '../lib/secuencia'
import { crearSonido, type Sonido } from '../lib/sonido'
import { suenaCaracter } from '../lib/tipeo'
import pista from '../recursos/pista-entrada.mp3'
import { CajaDeDialogo, type EstadoDeFrase } from './CajaDeDialogo'
import { Celebracion } from './Celebracion'
import { CursorCorazon } from './CursorCorazon'
import { HojasGrandes } from './HojasGrandes'
import { Ilustracion } from './Ilustracion'

interface PropsEntradaAlterna {
  // Se avisa cuando la vista pedida ya puede verse (empieza el desvanecimiento)
  onTerminar: () => void
  // Se avisa cuando la capa ya se quitó del todo
  alCerrar?: () => void
  // Solo suena si el navegador ya dejó sonar (hubo un gesto); por defecto, en silencio
  conSonido?: boolean
  // Fuente de azar de las hojas grandes y el papel picado; se inyecta en los tests
  aleatorio?: () => number
}

type Fase = 'visible' | 'saliendo' | 'oculta'

export function EntradaAlterna({
  onTerminar,
  alCerrar,
  conSonido = false,
  aleatorio = Math.random,
}: PropsEntradaAlterna) {
  const pideMenos = usePideMenosMovimiento()
  const punteroFino = usePunteroFino()
  const [fase, setFase] = useState<Fase>('visible')
  const [salidaMs, setSalidaMs] = useState(DURACION_SALIDA_ENTRADA_MS)
  // Qué ya pasó de la secuencia
  const [cubierta, setCubierta] = useState(pideMenos)
  const [caja, setCaja] = useState(pideMenos)
  const [comenzo, setComenzo] = useState(pideMenos)
  const [hojasSalidas, setHojasSalidas] = useState(0)
  const [{ paso, texto }, enviar] = useReducer(reducirEstado, ESTADO_INICIAL)
  const sonido = useRef<Sonido | null>(null)
  const cierre = useRef({ onTerminar, alCerrar })
  useEffect(() => {
    cierre.current = { onTerminar, alCerrar }
  })
  const yaSalio = useRef(false)
  const refComenzo = useRef(pideMenos)
  const refSalir = useRef<(anticipada: boolean) => void>(() => {})

  useEffect(() => {
    // Si ya salió, un cambio de preferencia de movimiento no la reinicia ni avisa dos veces
    if (yaSalio.current) return
    const temporizadores: number[] = []
    const programar = (ms: number, accion: () => void) =>
      temporizadores.push(window.setTimeout(accion, ms))

    const salir = (anticipada: boolean) => {
      if (yaSalio.current) return
      yaSalio.current = true
      temporizadores.forEach((temporizador) => window.clearTimeout(temporizador))
      temporizadores.length = 0
      const duracionMs = pideMenos
        ? 0
        : anticipada
          ? DURACION_SALIDA_ANTICIPADA_MS
          : DURACION_SALIDA_ENTRADA_MS
      sonido.current?.detener(duracionMs)
      cierre.current.onTerminar()
      if (duracionMs === 0) {
        setFase('oculta')
        cierre.current.alCerrar?.()
        return
      }
      setSalidaMs(duracionMs)
      setFase('saliendo')
      programar(duracionMs, () => {
        setFase('oculta')
        cierre.current.alCerrar?.()
      })
    }
    refSalir.current = salir

    if (!pideMenos) {
      if (conSonido) {
        sonido.current = crearSonido()
        sonido.current?.iniciarPista(pista)
      }
      programar(E.ilustracionDesdeMs, () => setCubierta(true))
      programar(E.cajaDesdeMs, () => setCaja(true))
      programar(E.fraseDesdeMs, () => {
        refComenzo.current = true
        setComenzo(true)
      })
      for (let orden = 0; orden < E.hojasMaximas; orden++) {
        programar(E.hojaGrandeDesdeMs + orden * E.hojaGrandeCadaMs, () =>
          setHojasSalidas(orden + 1),
        )
      }
    }

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        salir(true)
        return
      }
      if (yaSalio.current || evento.repeat || !refComenzo.current) return
      const tecla = evento.key.toLowerCase()
      if ((E.teclasAvanzar as readonly string[]).includes(tecla)) {
        // Sin esto, Enter o espacio activarían también lo que tuviera el foco debajo de la capa
        evento.preventDefault()
        enviar({ tipo: 'avanzar' })
      } else if ((E.teclasIzquierda as readonly string[]).includes(tecla)) {
        enviar({ tipo: 'mover', hacia: -1 })
      } else if ((E.teclasDerecha as readonly string[]).includes(tecla)) {
        enviar({ tipo: 'mover', hacia: 1 })
      }
    }
    window.addEventListener('keydown', alTeclear)
    return () => {
      window.removeEventListener('keydown', alTeclear)
      temporizadores.forEach((temporizador) => window.clearTimeout(temporizador))
      sonido.current?.detener(0)
      sonido.current = null
    }
  }, [pideMenos, conSonido])

  // Si nadie avanza, el paso sigue solo tras su espera; mover la marca la reinicia (cambia el paso)
  useEffect(() => {
    const espera = esperaDe(paso)
    if (!comenzo || espera === null) return
    const temporizador = window.setTimeout(() => enviar({ tipo: 'agotada' }), espera)
    return () => window.clearTimeout(temporizador)
  }, [paso, comenzo])

  // Con «reducir movimiento» nada se escribe: cada frase ya está completa
  useEffect(() => {
    if (pideMenos && comenzo && paso.fase === 'escribiendo') enviar({ tipo: 'termino' })
  }, [pideMenos, comenzo, paso])

  // Al cerrarse la última frase, la secuencia termina
  useEffect(() => {
    if (paso.fase === 'cerrada') refSalir.current(false)
  }, [paso.fase])

  // Elegir SÍ lanza la celebración (el papel picado y su sonido); con NO no pasa nada
  const celebrando = !pideMenos && texto === INDICE_CIERRE
  useEffect(() => {
    if (celebrando) sonido.current?.celebrar()
  }, [celebrando])

  if (fase === 'oculta') return null
  const estadoDeFrase: EstadoDeFrase = !comenzo
    ? 'pendiente'
    : pideMenos || paso.fase !== 'escribiendo'
      ? 'completa'
      : 'escribiendo'
  const conCursorPropio = punteroFino && !pideMenos
  return (
    <div
      className={`entrada-alterna${fase === 'saliendo' ? ' entrada-alterna--saliendo' : ''}${cubierta ? ' entrada-alterna--cubierta' : ''}${conCursorPropio ? ' entrada-alterna--corazon' : ''}`}
      style={{ animationDuration: `${salidaMs}ms` }}
      onPointerDown={() => {
        if (refComenzo.current) enviar({ tipo: 'avanzar' })
      }}
      aria-hidden="true"
    >
      <Ilustracion quieta={pideMenos} visible={cubierta} />
      {!pideMenos && <HojasGrandes salidas={hojasSalidas} aleatorio={aleatorio} />}
      {celebrando && <Celebracion aleatorio={aleatorio} />}
      {caja && (
        <div className="entrada-alterna__cajas">
          <CajaDeDialogo
            frase={textoDe(texto)}
            estado={estadoDeFrase}
            animarEntrada={!pideMenos}
            alTerminar={() => enviar({ tipo: 'termino' })}
            alCaracter={(caracter) => {
              if (suenaCaracter(caracter)) sonido.current?.tipeo()
            }}
            conIndicador={paso.fase === 'esperando'}
            eleccion={
              paso.fase === 'eligiendo'
                ? {
                    marcada: paso.opcion,
                    alElegir: (opcion) => enviar({ tipo: 'elegir', opcion }),
                  }
                : undefined
            }
          />
        </div>
      )}
      {conCursorPropio && <CursorCorazon />}
      {/* La cortina va por un portal, pero un clic sobre ella también sube hasta esta capa */}
      {!pideMenos && fase === 'visible' && <CortinaDeHojas activa retirada={cubierta} />}
    </div>
  )
}
