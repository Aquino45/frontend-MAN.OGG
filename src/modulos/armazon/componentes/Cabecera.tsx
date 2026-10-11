import '../estilos.css'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, NavLink } from 'react-router'
import { ENLACES_NAVEGACION, NOMBRE_PRODUCTO, RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { InterruptorTema } from '@/modulos/tema'

// Cabecera única del sitio: la marca lleva a Inicio, los enlaces de navegación y el tema.
// En pantallas angostas los enlaces salen tras el botón «Menú» y empujan el contenido.
// No es un h1: cada página pone el suyo.
export function Cabecera() {
  const idNavegacion = useId()
  const [abierto, setAbierto] = useState(false)
  const refBoton = useRef<HTMLButtonElement>(null)

  function alPulsarTecla(evento: KeyboardEvent) {
    if (evento.key === 'Escape' && abierto) {
      setAbierto(false)
      refBoton.current?.focus()
    }
  }

  return (
    <header className="armazon-cabecera" onKeyDown={alPulsarTecla}>
      <Link className="armazon-cabecera__marca" to={RUTAS.inicio}>
        <span className="armazon-cabecera__glifo">
          <GlifoPixelArbol />
        </span>
        <span className="armazon-cabecera__nombre">{NOMBRE_PRODUCTO}</span>
      </Link>
      <div className="armazon-cabecera__acciones">
        <button
          ref={refBoton}
          type="button"
          className="boton boton--secundario armazon-cabecera__menu"
          aria-expanded={abierto}
          aria-controls={idNavegacion}
          onClick={() => setAbierto((valor) => !valor)}
        >
          {TEXTOS_ARMAZON.menu}
        </button>
        <InterruptorTema />
      </div>
      <nav
        id={idNavegacion}
        className="armazon-cabecera__nav"
        aria-label={TEXTOS_ARMAZON.navegacionPrincipal}
        data-abierto={abierto}
      >
        <ul className="armazon-cabecera__enlaces">
          {ENLACES_NAVEGACION.map((enlace) => (
            <li key={enlace.ruta}>
              <NavLink
                className="armazon-cabecera__enlace"
                to={enlace.ruta}
                end={enlace.exacta}
                onClick={() => setAbierto(false)}
              >
                {enlace.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
