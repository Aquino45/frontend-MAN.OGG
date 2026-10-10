// Geometría de la elipse que representa la copa de un árbol dentro de su anillo de escala.
import { ESCALA_COPA_MAX_M } from '@/config/constantes'

// Lado del dibujo y radios, en unidades de su viewBox
export const COPA_LADO = 96
export const COPA_RADIO_ANILLO = 44
export const COPA_RADIO_CERO = 10
export const COPA_RADIO_CENTRO = 3

export type FormaCopa =
  | { tipo: 'sinDato' }
  // Diámetro registrado en 0: se dibuja un círculo punteado pequeño
  | { tipo: 'cero' }
  | { tipo: 'elipse'; radioX: number; radioY: number }

// Fracción del anillo que ocupa un diámetro (no pasa de 1, aunque la copa sea mayor que la escala)
function fraccionDeEscala(diametroM: number): number {
  return Math.min(Math.max(diametroM / ESCALA_COPA_MAX_M, 0), 1)
}

// nsM: diámetro norte-sur (vertical); eoM: diámetro este-oeste (horizontal).
// Con un solo diámetro se dibuja un círculo con ese valor.
export function formaDeCopa(nsM: number | null, eoM: number | null): FormaCopa {
  const diametros = [nsM, eoM].filter((valor): valor is number => valor !== null)
  if (diametros.length === 0) return { tipo: 'sinDato' }
  if (diametros.every((valor) => valor === 0)) return { tipo: 'cero' }
  const vertical = fraccionDeEscala(nsM ?? eoM ?? 0) * COPA_RADIO_ANILLO
  const horizontal = fraccionDeEscala(eoM ?? nsM ?? 0) * COPA_RADIO_ANILLO
  return { tipo: 'elipse', radioX: horizontal, radioY: vertical }
}
