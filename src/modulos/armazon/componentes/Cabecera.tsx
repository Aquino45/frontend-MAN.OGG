import '../estilos.css'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, NavLink } from 'react-router'
import { ENLACES_NAVEGACION, NOMBRE_PRODUCTO, RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'
import { Wordmark } from '@/compartido/marca/LogoMarca'
import { LogoUpeu } from '@/compartido/marca/LogoUpeu'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import { InterruptorTema } from '@/modulos/tema'

// Cabecera única del sitio: el wordmark lleva a Inicio (con la co-marca de la UPeU desde 32rem), los
// enlaces de navegación y el tema.
// En pantallas angostas los enlaces salen tras el botón «Menú» y empujan el contenido.
// No es un h1: cada página pone el suyo.
export function Cabecera() {
  const idNavegacion = useId()
  const [abierto, setAbierto] = useState(false)
  const refBoton = useRef<HTMLButtonElement>(null)
  const conTransicion = useEnlaceConTransicion()

  function alPulsarTecla(evento: KeyboardEvent) {
    if (evento.key === 'Escape' && abierto) {
      setAbierto(false)
      refBoton.current?.focus()
    }
  }

  return (
    <header className="armazon-cabecera" onKeyDown={alPulsarTecla}>
      <div className="armazon-cabecera__identidad logo-marca">
        <Link
          className="armazon-cabecera__marca"
          to={RUTAS.inicio}
          aria-label={NOMBRE_PRODUCTO}
          onClick={conTransicion}
        >
          <Wordmark />
        </Link>
        <span className="logo-marca__separador" aria-hidden="true" />
        <span className="logo-marca__upeu">
          <LogoUpeu />
        </span>
      </div>
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
                onClick={(evento) => {
                  setAbierto(false)
                  conTransicion(evento)
                }}
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
