// El símbolo del logo: tres baldosas de pasto con tres especies y la insignia con su check.
import './marca.estilos.css'
import { capasDeFilas } from './capasDeFilas'
import { SIMBOLO_LOGO } from './simbolo.datos'

const ANCHO = SIMBOLO_LOGO[0].length
const ALTO = SIMBOLO_LOGO.length

export function SimboloLogo() {
  return (
    <svg
      className="simbolo-logo"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      aria-hidden="true"
      focusable="false"
    >
      {capasDeFilas(SIMBOLO_LOGO).map(({ letra, trazo }) => (
        <path key={letra} className={`marca-px marca-px--${letra}`} d={trazo} />
      ))}
    </svg>
  )
}
