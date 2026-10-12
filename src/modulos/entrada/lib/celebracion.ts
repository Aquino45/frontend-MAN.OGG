// El papel picado de la celebración de la entrada alterna: de dónde sale cada pieza, hasta dónde sube y
// dónde cae. Función pura; `aleatorio` da números en [0, 1).
import { CELEBRACION_ENTRADA as C } from '@/config/constantes'

export interface PiezaDeCelebracion {
  ladoPx: number
  // Índice del color (0 a variantesDeColor - 1), que el CSS traduce a un token de la paleta
  color: number
  retrasoMs: number
  origenX: number
  origenY: number
  cimaX: number
  cimaY: number
  caidaX: number
  caidaY: number
  giroGrados: number
}

interface Pantalla {
  anchoPx: number
  altoPx: number
}

const entre = (minimo: number, maximo: number, azar: number) => minimo + (maximo - minimo) * azar

export function piezasDeCelebracion(
  { anchoPx, altoPx }: Pantalla,
  aleatorio: () => number,
): PiezaDeCelebracion[] {
  const centroX = anchoPx / 2
  return Array.from({ length: C.piezas }, (_, indice) => {
    // Las piezas pares salen de la esquina izquierda y las impares, de la derecha
    const origenX = indice % 2 === 0 ? anchoPx * 0.04 : anchoPx * 0.96
    const cimaX =
      origenX + (centroX - origenX) * entre(C.haciaElCentroMin, C.haciaElCentroMax, aleatorio())
    const cimaY = altoPx * (1 - entre(C.alcanceMin, C.alcanceMax, aleatorio()))
    const ladoPx = Math.round(entre(C.ladoMinPx, C.ladoMaxPx, aleatorio()))
    return {
      ladoPx,
      color: Math.floor(aleatorio() * C.variantesDeColor),
      retrasoMs: Math.round(aleatorio() * C.retrasoMaximoMs),
      origenX,
      origenY: altoPx,
      cimaX,
      cimaY,
      caidaX: cimaX + (aleatorio() - 0.5) * C.dispersionCaida * anchoPx,
      caidaY: altoPx + ladoPx,
      giroGrados: Math.round((aleatorio() * 2 - 1) * C.giroMaxGrados),
    }
  })
}
