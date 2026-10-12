// Reglas puras del arrastre de la hoja inferior del celular. Las cifras salen de HOJA_ARRASTRE.
import { HOJA_ARRASTRE } from '@/config/constantes'

// Hacia abajo la hoja sigue al dedo; hacia arriba (negativo) se frena cada vez más y nunca pasa
// del elástico: lo que se jala de más cuesta, como una goma, en vez de chocar con una pared.
export function amortiguarHaciaArriba(
  desplazamientoPx: number,
  elasticoPx: number = HOJA_ARRASTRE.elasticoPx,
): number {
  if (desplazamientoPx >= 0) return desplazamientoPx
  const jalado = -desplazamientoPx
  return -(elasticoPx * jalado) / (jalado + elasticoPx)
}

interface EntradaCierre {
  // Cuánto bajó la hoja desde su posición de reposo (px)
  desplazamientoPx: number
  // Alto de la hoja (px)
  altoPx: number
  // Lo que se movió el dedo desde que empezó el gesto (px) y lo que tardó (ms)
  recorridoPx: number
  tiempoMs: number
}

// Cierra si bajó una fracción del alto o si fue un empujón rápido hacia abajo.
export function debeCerrarHoja({
  desplazamientoPx,
  altoPx,
  recorridoPx,
  tiempoMs,
}: EntradaCierre): boolean {
  if (desplazamientoPx >= altoPx * HOJA_ARRASTRE.fraccionCierre) return true
  const velocidad = recorridoPx / Math.max(tiempoMs, 1)
  return velocidad > HOJA_ARRASTRE.velocidadCierrePxPorMs && desplazamientoPx > 0
}
