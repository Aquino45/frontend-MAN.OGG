import '../estilos.css'
import { Link, NavLink } from 'react-router'
import { NOMBRE_PRODUCTO, RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { InterruptorTema } from '@/modulos/tema'

// Cabecera única del sitio: la marca lleva a Inicio, dos enlaces de navegación y el tema.
// No es un h1: cada página pone el suyo.
export function Cabecera() {
  return (
    <header className="armazon-cabecera">
      <Link className="armazon-cabecera__marca" to={RUTAS.inicio}>
        <span className="armazon-cabecera__glifo">
          <GlifoPixelArbol />
        </span>
        <span className="armazon-cabecera__nombre">{NOMBRE_PRODUCTO}</span>
      </Link>
      <div className="armazon-cabecera__acciones">
        <nav aria-label={TEXTOS_ARMAZON.navegacionPrincipal}>
          <ul className="armazon-cabecera__enlaces">
            <li>
              <NavLink className="armazon-cabecera__enlace" to={RUTAS.inicio} end>
                {TEXTOS_ARMAZON.inicio}
              </NavLink>
            </li>
            <li>
              <NavLink className="armazon-cabecera__enlace" to={RUTAS.mapa}>
                {TEXTOS_ARMAZON.mapa}
              </NavLink>
            </li>
          </ul>
        </nav>
        <InterruptorTema />
      </div>
    </header>
  )
}
