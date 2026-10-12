// La caja de diálogo de la secuencia de la entrada alterna: borde pixel blanco sobre negro y el texto en la
// fuente pixel, que se escribe letra por letra. Entra de forma dramática una sola vez (sube y aparece) y
// se queda: cada frase nueva se escribe dentro de la misma caja. Cuando la frase está escrita y espera,
// parpadea el indicador (▼); en la pregunta, debajo salen las opciones con un corazón en la marcada.
import { useEffect, useRef, useState } from 'react'
import {
  CORTINA_CURVA,
  ENTRADA_ALTERNA as E,
  TEXTOS_ENTRADA_ALTERNA as T,
} from '@/config/constantes'
import { SPRITE_CORAZON, SPRITE_INDICADOR } from '../lib/sprites'
import { pausaTrasCaracter } from '../lib/tipeo'
import { SpritePixel } from './SpritePixel'

// Cómo se ve la frase: sin empezar (todo oculto), escribiéndose o entera y fija
export type EstadoDeFrase = 'pendiente' | 'escribiendo' | 'completa'

interface PropsCajaDeDialogo {
  // El texto que se escribe; si cambia, se escribe el nuevo desde cero
  frase: string
  estado: EstadoDeFrase
  // La caja entra con su animación (no con «reducir movimiento»)
  animarEntrada: boolean
  // Avisa que la frase terminó de escribirse sola
  alTerminar: () => void
  // Suena una vez por cada caracter que aparece (quien la usa decide si suena)
  alCaracter?: (caracter: string) => void
  // Muestra el indicador de «sigue»
  conIndicador: boolean
  // En la elección: cuál opción está marcada y qué hacer si se elige una con el clic
  eleccion?: { marcada: number; alElegir: (opcion: number) => void }
}

interface PropsTexto {
  frase: string
  estado: EstadoDeFrase
  alTerminar: () => void
  alCaracter?: (caracter: string) => void
}

function TextoEscrito({ frase, estado, alTerminar, alCaracter }: PropsTexto) {
  const [escritas, setEscritas] = useState(0)
  // Quien la usa puede pasar funciones nuevas en cada render sin reiniciar la escritura
  const refAvisos = useRef({ alTerminar, alCaracter })
  useEffect(() => {
    refAvisos.current = { alTerminar, alCaracter }
  })

  useEffect(() => {
    if (estado !== 'escribiendo') return
    let cuenta = 0
    let temporizador = 0
    const escribir = () => {
      cuenta += 1
      setEscritas(cuenta)
      const caracter = frase[cuenta - 1]
      refAvisos.current.alCaracter?.(caracter)
      if (cuenta >= frase.length) {
        refAvisos.current.alTerminar()
        return
      }
      temporizador = window.setTimeout(escribir, E.msPorLetra + pausaTrasCaracter(caracter))
    }
    temporizador = window.setTimeout(escribir, E.msPorLetra)
    return () => window.clearTimeout(temporizador)
  }, [frase, estado])

  const visibles = estado === 'completa' ? frase.length : estado === 'pendiente' ? 0 : escritas
  return (
    // La frase completa reserva el espacio: la caja no cambia de tamaño mientras se escribe
    <p className="entrada-alterna__frase">
      <span>{frase.slice(0, visibles)}</span>
      <span className="entrada-alterna__frase-pendiente">{frase.slice(visibles)}</span>
    </p>
  )
}

export function CajaDeDialogo({
  frase,
  estado,
  animarEntrada,
  alTerminar,
  alCaracter,
  conIndicador,
  eleccion,
}: PropsCajaDeDialogo) {
  const refCaja = useRef<HTMLDivElement>(null)

  // Entrada dramática, una sola vez
  useEffect(() => {
    const caja = refCaja.current
    if (!caja || !animarEntrada || typeof caja.animate !== 'function') return
    const animacion = caja.animate(
      [
        { opacity: 0, transform: `translateY(${E.cajaDesplazamientoPx}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      {
        duration: E.cajaDuracionMs,
        easing: `cubic-bezier(${CORTINA_CURVA.join(', ')})`,
        fill: 'both',
      },
    )
    return () => animacion.cancel()
  }, [animarEntrada])

  return (
    <div ref={refCaja} className="entrada-alterna__caja">
      <TextoEscrito
        key={frase}
        frase={frase}
        estado={estado}
        alTerminar={alTerminar}
        alCaracter={alCaracter}
      />
      {eleccion && (
        <ul className="entrada-alterna__opciones">
          {T.opciones.map((etiqueta, opcion) => (
            <li
              key={etiqueta}
              className="entrada-alterna__opcion"
              data-marcada={opcion === eleccion.marcada ? 'si' : undefined}
              // Elegir con el clic no debe contar también como «avanzar» de la capa
              onPointerDown={(evento) => {
                evento.stopPropagation()
                if (evento.button === 0) eleccion.alElegir(opcion)
              }}
            >
              <span className="entrada-alterna__corazon-opcion">
                {opcion === eleccion.marcada && (
                  <SpritePixel sprite={SPRITE_CORAZON} altoPx={E.corazonLadoPx} />
                )}
              </span>
              {etiqueta}
            </li>
          ))}
        </ul>
      )}
      {conIndicador && (
        <SpritePixel
          sprite={SPRITE_INDICADOR}
          altoPx={E.indicadorLadoPx}
          className="entrada-alterna__indicador"
          style={{ animationDuration: `${E.indicadorParpadeoMs}ms` }}
        />
      )}
    </div>
  )
}
