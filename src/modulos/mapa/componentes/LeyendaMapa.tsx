import { TEXTOS_MAPA } from '@/config/constantes'

interface PropsLeyendaMapa {
  hayProvisionales: boolean
}

// Leyenda del mapa. La nota de límites provisionales sale solo si algún sector lo es.
export function LeyendaMapa({ hayProvisionales }: PropsLeyendaMapa) {
  if (!hayProvisionales) return null
  return (
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
  )
}
