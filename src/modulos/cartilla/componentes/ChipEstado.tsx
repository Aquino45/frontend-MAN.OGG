// Chip «Estado: <valor>» con el estilo que corresponde al estado general del árbol.
import { ESTILO_ESTADO_GENERAL, ESTILO_ESTADO_OTRO, TEXTOS_CARTILLA } from '@/config/constantes'

interface PropsChipEstado {
  estadoGeneral: string | null
}

function estiloDe(estadoGeneral: string | null): string {
  if (estadoGeneral === null) return ESTILO_ESTADO_OTRO
  return Object.hasOwn(ESTILO_ESTADO_GENERAL, estadoGeneral)
    ? ESTILO_ESTADO_GENERAL[estadoGeneral]
    : ESTILO_ESTADO_OTRO
}

export function ChipEstado({ estadoGeneral }: PropsChipEstado) {
  return (
    <span className={`chip-estado chip-estado--${estiloDe(estadoGeneral)}`}>
      {TEXTOS_CARTILLA.estado}: {estadoGeneral ?? TEXTOS_CARTILLA.sinDato}
    </span>
  )
}
