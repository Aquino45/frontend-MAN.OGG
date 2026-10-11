import '../estilos.css'
import { Link } from 'react-router'
import { RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'

// Página para cualquier dirección que el sitio no conoce, con salida a Inicio.
export function VistaNoEncontrada() {
  return (
    <section className="armazon-no-encontrada">
      <h1 className="armazon-no-encontrada__titulo">{TEXTOS_ARMAZON.tituloNoEncontrada}</h1>
      <p className="armazon-no-encontrada__frase">{TEXTOS_ARMAZON.fraseNoEncontrada}</p>
      <Link className="armazon-boton" to={RUTAS.inicio}>
        {TEXTOS_ARMAZON.volverAlInicio}
      </Link>
    </section>
  )
}
