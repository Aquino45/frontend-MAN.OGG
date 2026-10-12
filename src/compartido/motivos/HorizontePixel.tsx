// Horizonte de copa entre dos secciones de distinto fondo: un borde de nubes en pixel art que
// hace de transición de forma (como una ola). Se pone justo antes de la sección que sigue y se
// pinta con el fondo de esa sección; una sombra en magenta oscuro lo separa de la de arriba.
// Es adorno (aria-hidden). La celda mide un número entero de píxeles: sin líneas finas.
import { useId, type CSSProperties } from 'react'
import { HORIZONTE_CELDA_PX } from '@/config/constantes'
import {
  ALTO_HORIZONTE,
  ANCHO_HORIZONTE,
  TRAZO_HORIZONTE,
  TRAZO_SOMBRA_HORIZONTE,
} from './dibujoHorizonte'

interface PropsHorizontePixel {
  // Fondo de la sección que sigue, como valor de CSS (por ejemplo `var(--franja-cifras-fondo)`)
  fondo: string
}

export function HorizontePixel({ fondo }: PropsHorizontePixel) {
  const idPatron = useId().replace(/:/g, '')
  return (
    <svg
      className="horizonte-pixel"
      aria-hidden="true"
      focusable="false"
      width="100%"
      height={ALTO_HORIZONTE * HORIZONTE_CELDA_PX}
      style={{ '--horizonte-fondo': fondo } as CSSProperties}
    >
      <defs>
        <pattern
          id={idPatron}
          width={ANCHO_HORIZONTE}
          height={ALTO_HORIZONTE}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${HORIZONTE_CELDA_PX})`}
        >
          <path className="horizonte-pixel__sombra" d={TRAZO_SOMBRA_HORIZONTE} />
          <path className="horizonte-pixel__fondo" d={TRAZO_HORIZONTE} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${idPatron})`} />
    </svg>
  )
}
