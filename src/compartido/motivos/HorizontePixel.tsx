// Horizonte de copa entre dos secciones de distinto fondo: un borde de nubes en pixel art que
// hace de transición de forma (como una ola). Se pone justo antes de la sección que sigue. Detrás
// lleva el color de la sección de arriba y los lóbulos se pintan con el fondo de la que sigue, así
// se ve igual en los dos sentidos y no deja ver el fondo de la página; una sombra en magenta
// oscuro separa las dos. Es adorno (aria-hidden). La celda mide un número entero de píxeles.
import { useId, type CSSProperties } from 'react'
import { HORIZONTE_CELDA_PX } from '@/config/constantes'
import {
  ALTO_HORIZONTE,
  ANCHO_HORIZONTE,
  TRAZO_HORIZONTE,
  TRAZO_SOMBRA_HORIZONTE,
} from './dibujoHorizonte'

interface PropsHorizontePixel {
  // Fondo de la sección de arriba, como valor de CSS (por ejemplo `var(--color-fondo)`)
  desde: string
  // Fondo de la sección que sigue, como valor de CSS (por ejemplo `var(--franja-cifras-fondo)`)
  fondo: string
}

export function HorizontePixel({ desde, fondo }: PropsHorizontePixel) {
  const idPatron = useId().replace(/:/g, '')
  return (
    <svg
      className="horizonte-pixel"
      aria-hidden="true"
      focusable="false"
      width="100%"
      height={ALTO_HORIZONTE * HORIZONTE_CELDA_PX}
      style={{ '--horizonte-desde': desde, '--horizonte-fondo': fondo } as CSSProperties}
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
      <rect className="horizonte-pixel__cielo" width="100%" height="100%" />
      <rect width="100%" height="100%" fill={`url(#${idPatron})`} />
    </svg>
  )
}
