// Pasa un dibujo en filas de letras a trazos: un solo <path> por color. Se calcula una vez por dibujo.
import { trazoDeCeldas, type Celda } from '../rasterizarPixel'

const CELDA_VACIA = '.'

export interface CapaDeFilas {
  // La letra del color, tal como está en el dibujo
  letra: string
  trazo: string
}

const guardadas = new WeakMap<readonly string[], readonly CapaDeFilas[]>()

export function capasDeFilas(filas: readonly string[]): readonly CapaDeFilas[] {
  const guardada = guardadas.get(filas)
  if (guardada) return guardada
  const porLetra = new Map<string, Celda[]>()
  filas.forEach((fila, y) => {
    ;[...fila].forEach((letra, x) => {
      if (letra === CELDA_VACIA) return
      porLetra.set(letra, [...(porLetra.get(letra) ?? []), [x, y]])
    })
  })
  const capas = [...porLetra].map(([letra, celdas]) => ({ letra, trazo: trazoDeCeldas(celdas) }))
  guardadas.set(filas, capas)
  return capas
}
