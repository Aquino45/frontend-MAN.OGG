import '../estilos.css'
import { TEXTOS_ARMAZON, URL_LICENCIA_ODBL } from '@/config/constantes'

// Pie del sitio: de dónde salen los datos y el crédito obligatorio del contorno del campus.
export function Pie() {
  return (
    <footer className="armazon-pie">
      <div className="armazon-pie__contenido">
        <p className="armazon-pie__texto">{TEXTOS_ARMAZON.notaDatos}</p>
        <p className="armazon-pie__texto">
          {TEXTOS_ARMAZON.creditoContorno} (
          <a className="armazon-pie__enlace" href={URL_LICENCIA_ODBL}>
            {TEXTOS_ARMAZON.nombreLicencia}
          </a>
          )
        </p>
      </div>
    </footer>
  )
}
