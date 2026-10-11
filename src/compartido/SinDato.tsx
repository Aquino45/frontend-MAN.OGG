// Valor que falta en el registro: nunca se muestra null, undefined ni un cero inventado.
import { TEXTOS_CARTILLA } from '@/config/constantes'

export function SinDato() {
  return <span className="sin-dato">{TEXTOS_CARTILLA.sinDato}</span>
}
