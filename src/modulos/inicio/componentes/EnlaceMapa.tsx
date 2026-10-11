import { Link } from 'react-router'
import { RUTAS, TEXTOS_INICIO } from '@/config/constantes'

interface PropsEnlaceMapa {
  // «portada»: botón carmín sobre el fondo del sitio; «franja»: botón de la franja de contraste
  variante: 'portada' | 'franja'
}

// Enlace principal a /mapa, con una flecha decorativa.
export function EnlaceMapa({ variante }: PropsEnlaceMapa) {
  return (
    <Link className={`inicio-boton inicio-boton--${variante}`} to={RUTAS.mapa}>
      {TEXTOS_INICIO.explorarMapa}
      <svg
        className="inicio-boton__flecha"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  )
}
