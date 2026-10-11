// Estrella decorativa para la lista del sector y la leyenda; el texto que la acompaña dice lo mismo.
import { ESTRELLA_CONTORNO, ESTRELLA_LADO_GRILLA } from '@/config/constantes'

export function IconoEstrella({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${ESTRELLA_LADO_GRILLA} ${ESTRELLA_LADO_GRILLA}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ESTRELLA_CONTORNO} />
    </svg>
  )
}
