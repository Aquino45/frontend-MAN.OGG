// Botón «?» junto a un dato de la cartilla y la burbuja con su explicación (texto de la API).
// Se abre con clic o toque y, con cursor fino, también al pasar el cursor; se cierra con Esc,
// con un clic fuera o al abrir otra. Solo hay una abierta a la vez.
import '../capsulas.estilos.css'
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react'
import {
  CONSULTA_HOVER_FINO,
  MARCADOR_TEXTO,
  MARCADOR_TITULO,
  TEXTOS_CAPSULA,
} from '@/config/constantes'
import { useCapsulas } from '../hooks/contextoCapsulas'
import { llenarPlantilla, type Capsula } from '../lib/capsulas'

interface PropsCapsulaAyuda {
  // Campo del contrato; varios campos comparten un botón y una burbuja (por ejemplo la copa)
  campo: string | readonly string[]
}

function hayHoverFino(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(CONSULTA_HOVER_FINO).matches
}

export function CapsulaAyuda({ campo }: PropsCapsulaAyuda) {
  const { capsulas, abierta, fijada, sinAnimacion, abrir, cerrar } = useCapsulas()
  const idBurbuja = useId()
  const refContenedor = useRef<HTMLSpanElement>(null)
  const refBoton = useRef<HTMLButtonElement>(null)
  const [origenX, setOrigenX] = useState(0)

  const campos = typeof campo === 'string' ? [campo] : campo
  const clave = campos.join('+')
  const propias = campos
    .map((nombre) => capsulas.get(nombre))
    .filter((capsula): capsula is Capsula => capsula !== undefined)
  const estaAbierta = abierta === clave

  useEffect(() => {
    if (!estaAbierta) return
    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      // Esc cierra primero la burbuja: la pantalla que la contiene no debe cerrarse también
      evento.preventDefault()
      cerrar(true)
      refBoton.current?.focus()
    }
    function alPulsarFuera(evento: Event) {
      if (!refContenedor.current?.contains(evento.target as Node)) cerrar()
    }
    document.addEventListener('keydown', alPulsarTecla)
    document.addEventListener('pointerdown', alPulsarFuera)
    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
      document.removeEventListener('pointerdown', alPulsarFuera)
    }
  }, [estaAbierta, cerrar])

  if (propias.length === 0) return null

  const nombre = llenarPlantilla(TEXTOS_CAPSULA.etiquetaBoton, {
    [MARCADOR_TITULO]: propias.map((capsula) => capsula.titulo).join(TEXTOS_CAPSULA.unirTitulos),
  })

  // La burbuja crece desde el botón: su origen es el centro del botón dentro del contenedor.
  function medirOrigen() {
    const boton = refBoton.current?.getBoundingClientRect()
    const burbuja = refContenedor.current?.querySelector<HTMLElement>('.capsula__burbuja')
    const base = burbuja?.offsetParent?.getBoundingClientRect()
    if (boton && base) setOrigenX(boton.left + boton.width / 2 - base.left)
  }

  function alPulsar() {
    if (estaAbierta && fijada) {
      cerrar()
      return
    }
    medirOrigen()
    abrir(clave, true)
  }

  function alEntrar() {
    if (estaAbierta || !hayHoverFino()) return
    medirOrigen()
    abrir(clave, false)
  }

  function alSalir() {
    if (estaAbierta && !fijada) cerrar()
  }

  // Al tabular fuera de la cápsula, la burbuja se cierra; el foco que se va a la nada no la cierra
  function alPerderFoco(evento: FocusEvent<HTMLSpanElement>) {
    const destino = evento.relatedTarget
    if (estaAbierta && destino instanceof Node && !evento.currentTarget.contains(destino)) {
      cerrar()
    }
  }

  return (
    <span
      ref={refContenedor}
      className="capsula"
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
      onBlur={alPerderFoco}
    >
      <button
        ref={refBoton}
        type="button"
        className="capsula__boton"
        aria-label={nombre}
        aria-expanded={estaAbierta}
        aria-controls={idBurbuja}
        onClick={alPulsar}
      >
        <svg className="capsula__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.25c-.75.4-1.1.85-1.1 1.75" />
          <path d="M12 16.75h.01" />
        </svg>
      </button>
      <span
        id={idBurbuja}
        className="capsula__burbuja"
        data-abierta={estaAbierta}
        data-sin-animacion={sinAnimacion}
        style={{ transformOrigin: `${origenX}px 0` }}
      >
        {propias.map((capsula) => (
          <span key={capsula.campo} className="capsula__texto">
            {propias.length > 1 && <strong className="capsula__titulo">{capsula.titulo}</strong>}
            {capsula.en_este_arbol !== null && (
              <span className="capsula__linea capsula__linea--arbol">
                {llenarPlantilla(TEXTOS_CAPSULA.enEsteArbol, {
                  [MARCADOR_TEXTO]: capsula.en_este_arbol,
                })}
              </span>
            )}
            <span className="capsula__linea">{capsula.que_es}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
