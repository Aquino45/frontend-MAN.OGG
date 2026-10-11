import { TEXTOS_DESTACADO, TEXTOS_MAPA } from '@/config/constantes'
import { IconoEstrella } from './IconoEstrella'

interface PropsLeyendaMapa {
  hayProvisionales: boolean
  // El sector abierto tiene árboles destacados
  hayDestacados: boolean
}

// Leyenda del mapa. La nota de límites provisionales sale solo si algún sector lo es,
// y la de la estrella solo cuando el sector abierto tiene destacados.
export function LeyendaMapa({ hayProvisionales, hayDestacados }: PropsLeyendaMapa) {
  if (!hayProvisionales && !hayDestacados) return null
  return (
    <div className="leyenda-mapa-grupo">
      {hayProvisionales && (
        <p className="leyenda-mapa">
          <svg
            className="leyenda-mapa__muestra"
            viewBox="0 0 32 12"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="1" y1="6" x2="31" y2="6" />
          </svg>
          {TEXTOS_MAPA.limitesProvisionales}
        </p>
      )}
      {hayDestacados && (
        <p className="leyenda-mapa leyenda-mapa--destacado">
          <IconoEstrella className="leyenda-mapa__estrella" />
          {TEXTOS_DESTACADO.leyenda}
        </p>
      )}
    </div>
  )
}
