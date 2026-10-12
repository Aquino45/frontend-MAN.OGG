// La variante alterna de la entrada: una secuencia de unos 9 s. Cae la cortina de hojas, queda el fondo
// con la ilustración, caen hojas grandes en diagonal, entra una caja de diálogo y se escriben dos
// frases letra por letra con un blip por letra (y, si hay una pista, música de fondo). Al terminar,
// o antes con Esc o un clic, se desvanece y deja ver la vista pedida. Con «reducir movimiento»: sin
// cortina, hojas, escritura ni sonido; todo quieto y completo un par de segundos. Este archivo y sus
// recursos se cargan solo cuando sale esta variante.
import { useEffect, useRef, useState } from 'react'
import { CortinaDeHojas } from '@/compartido/cortinaHojas/CortinaDeHojas'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import {
  DURACION_ENTRADA_ALTERNA_MS,
  DURACION_ENTRADA_ALTERNA_REDUCIDA_MS,
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  ENTRADA_ALTERNA as E,
  TEXTOS_ENTRADA_ALTERNA as T,
} from '@/config/constantes'
import '@fontsource/silkscreen/400.css'
import { cantidadDeHojasGrandes } from '../lib/hojasGrandes'
import { crearSonido, type Sonido } from '../lib/sonido'
import pista from '../recursos/pista-entrada.mp3'
import { CajaDeDialogo } from './CajaDeDialogo'
import { HojasGrandes } from './HojasGrandes'
import { Ilustracion } from './Ilustracion'

interface PropsEntradaAlterna {
  // Se avisa cuando la vista pedida ya puede verse (empieza el desvanecimiento)
  onTerminar: () => void
  // Se avisa cuando la capa ya se quitó del todo
  alCerrar?: () => void
  // Solo suena si el navegador ya dejó sonar (hubo un gesto); por defecto, en silencio
  conSonido?: boolean
  // Fuente de azar de las hojas grandes; se inyecta en los tests
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
  const [fase, setFase] = useState<Fase>('visible')
  const [salidaMs, setSalidaMs] = useState(DURACION_SALIDA_ENTRADA_MS)
  // Qué ya pasó de la secuencia
  const [cubierta, setCubierta] = useState(pideMenos)
  const [caja, setCaja] = useState(pideMenos)
  const [frase, setFrase] = useState(pideMenos ? T.frases.length - 1 : -1)
  const [hojasSalidas, setHojasSalidas] = useState(0)
  const sonido = useRef<Sonido | null>(null)
  const cierre = useRef({ onTerminar, alCerrar })
  useEffect(() => {
    cierre.current = { onTerminar, alCerrar }
  })
  const refSalir = useRef<(anticipada: boolean) => void>(() => {})

  useEffect(() => {
    const temporizadores: number[] = []
    const programar = (ms: number, accion: () => void) =>
      temporizadores.push(window.setTimeout(accion, ms))
    let saliendo = false

    const salir = (anticipada: boolean) => {
      if (saliendo) return
      saliendo = true
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

    if (pideMenos) {
      programar(DURACION_ENTRADA_ALTERNA_REDUCIDA_MS, () => salir(false))
    } else {
      if (conSonido) {
        sonido.current = crearSonido()
        sonido.current?.iniciarPista(pista)
      }
      programar(E.ilustracionDesdeMs, () => setCubierta(true))
      programar(E.cajaDesdeMs, () => setCaja(true))
      T.frases.forEach((_, orden) =>
        programar(orden === 0 ? E.frase1DesdeMs : E.frase2DesdeMs, () => setFrase(orden)),
      )
      for (let orden = 0; orden < cantidadDeHojasGrandes(); orden++) {
        programar(E.hojaGrandeDesdeMs + orden * E.hojaGrandeCadaMs, () =>
          setHojasSalidas(orden + 1),
        )
      }
      programar(DURACION_ENTRADA_ALTERNA_MS, () => salir(false))
    }

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') salir(true)
    }
    window.addEventListener('keydown', alTeclear)
    return () => {
      window.removeEventListener('keydown', alTeclear)
      temporizadores.forEach((temporizador) => window.clearTimeout(temporizador))
      sonido.current?.detener(0)
      sonido.current = null
    }
  }, [pideMenos, conSonido])

  if (fase === 'oculta') return null
  return (
    <div
      className={`entrada-alterna${fase === 'saliendo' ? ' entrada-alterna--saliendo' : ''}${cubierta ? ' entrada-alterna--cubierta' : ''}`}
      style={{ animationDuration: `${salidaMs}ms` }}
      onPointerDown={() => refSalir.current(true)}
      aria-hidden="true"
    >
      <Ilustracion quieta={pideMenos} visible={cubierta} />
      {!pideMenos && <HojasGrandes salidas={hojasSalidas} aleatorio={aleatorio} />}
      {caja && frase >= 0 && (
        <div className="entrada-alterna__cajas">
          {pideMenos ? (
            T.frases.map((texto) => <CajaDeDialogo key={texto} frase={texto} completa />)
          ) : (
            <CajaDeDialogo
              key={frase}
              frase={T.frases[frase]}
              alLetra={(orden) => sonido.current?.blip(orden)}
            />
          )}
        </div>
      )}
      {/* La cortina va por un portal, pero un clic sobre ella también sube hasta esta capa */}
      {!pideMenos && fase === 'visible' && <CortinaDeHojas activa retirada={cubierta} />}
    </div>
  )
}
