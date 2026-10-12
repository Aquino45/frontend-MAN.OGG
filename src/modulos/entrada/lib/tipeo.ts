// Reglas del tipeo de la entrada alterna: qué caracteres suenan y cuánto se detiene después de algunos.
import { SONIDO_ENTRADA_ALTERNA as S } from '@/config/constantes'

// Solo letras y números suenan; los espacios y los signos, no
export function suenaCaracter(caracter: string | undefined): boolean {
  return caracter !== undefined && /^[\p{L}\p{N}]$/u.test(caracter)
}

// Pausa extra (ms) después de escribir el caracter: una coma o un final de oración
export function pausaTrasCaracter(caracter: string | undefined): number {
  if (caracter === ',') return S.tipeo.pausaComaMs
  if (caracter !== undefined && S.tipeo.caracteresDePausaFin.includes(caracter)) {
    return S.tipeo.pausaFinMs
  }
  return 0
}
