// La silueta del árbol de la portada como un solo trazo (todas las celdas de sus piezas juntas), para
// dibujar encima una capa de un solo color sin duplicar piezas ni colores.
import { COPA_BASE, PIEZAS_CUERPO } from './piezasArbol'

export const SILUETA_ARBOL: string = [...PIEZAS_CUERPO, ...COPA_BASE]
  .flatMap((pieza) => pieza.capas.map((capa) => capa.entera))
  .join('')
