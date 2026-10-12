// El guion del árbol, como datos puros: en qué momento brota cada pieza, cuándo se ve cada cuadro
// del reposo y cómo cae una hoja. Los fotogramas son de opacidad y transform, en saltos enteros
// (steps): ninguna pieza se escala, se gira ni se recorta.
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { COPAS_REPOSO, ORDEN_CRECIMIENTO, type ClavePieza } from './piezasArbol'

export interface OpcionesAnimacion {
  duration: number
  delay?: number
  iterations?: number
  fill?: FillMode
  easing?: string
}

export interface PlanAnimacion {
  fotogramas: Keyframe[]
  opciones: OpcionesAnimacion
}

// ---------- Crecimiento ----------

export function inicioDePiezaMs(clave: ClavePieza): number {
  return ORDEN_CRECIMIENTO.indexOf(clave) * G.escalonPiezaMs
}

// Cuándo termina de verse la última pieza entera
export const DURACION_CRECIMIENTO_MS = (ORDEN_CRECIMIENTO.length - 1) * G.escalonPiezaMs + G.broteMs

// Primer cuadro de una pieza: la versión chica, solo mientras brota
export function planPiezaChica(inicioMs: number): PlanAnimacion {
  return {
    fotogramas: [{ opacity: 1 }, { opacity: 1 }],
    opciones: { duration: G.broteMs, delay: inicioMs, fill: 'none', easing: 'steps(1, end)' },
  }
}

// La pieza entera no se ve hasta que termina de brotar
export function planPiezaEntera(inicioMs: number): PlanAnimacion {
  return {
    fotogramas: [{ opacity: 0 }, { opacity: 0 }],
    opciones: { duration: inicioMs + G.broteMs, fill: 'none', easing: 'steps(1, end)' },
  }
}

// ---------- Reposo ----------

// Orden en que se ven los cuadros del reposo en un ciclo: va y vuelve (1, 2, 3, 2, 1)
export function secuenciaReposo(): number[] {
  const cuadros = COPAS_REPOSO.map((_, indice) => indice + 1)
  return [...cuadros, ...cuadros.slice(0, -1).reverse()]
}

export const CICLO_REPOSO_MS = G.pausaBaseMs + secuenciaReposo().length * G.cuadroMs

// El cuadro 0 es el base; se ve siempre salvo cuando le toca a otro
export function planCuadro(cuadro: number): PlanAnimacion {
  const secuencia = secuenciaReposo()
  const visible = cuadro === 0 ? 1 : 0
  const fotogramas: Keyframe[] = [{ opacity: visible, offset: 0 }]
  secuencia.forEach((delCiclo, posicion) => {
    const desde = (G.pausaBaseMs + posicion * G.cuadroMs) / CICLO_REPOSO_MS
    const hasta = (G.pausaBaseMs + (posicion + 1) * G.cuadroMs) / CICLO_REPOSO_MS
    const ahora = delCiclo === cuadro ? 1 : 0
    fotogramas.push({ opacity: visible, offset: desde }, { opacity: ahora, offset: desde })
    fotogramas.push({ opacity: ahora, offset: hasta }, { opacity: visible, offset: hasta })
  })
  fotogramas.push({ opacity: visible, offset: 1 })
  return {
    fotogramas,
    opciones: { duration: CICLO_REPOSO_MS, iterations: Number.POSITIVE_INFINITY, easing: 'linear' },
  }
}

// ---------- Hojas ----------

export interface EspecificacionHoja {
  x: number
  y: number
  clase: 'carmin' | 'oscuro'
  // Cuántas celdas baja, de a una por paso
  pasos: number
  // Cuánto se corre de lado por cada paso, además del zigzag de 1 celda
  derivaPorPaso: number
  retrasoMs: number
}

// De lado a lado: 0, 0, 1, 1, 0, 0, 1, 1…
export function zigzag(paso: number): number {
  return Math.floor(paso / 2) % 2
}

export function planHoja(hoja: EspecificacionHoja): PlanAnimacion {
  const fotogramas: Keyframe[] = Array.from({ length: hoja.pasos + 1 }, (_, paso) => ({
    transform: `translate(${zigzag(paso) + Math.round(paso * hoja.derivaPorPaso)}px, ${paso}px)`,
    opacity: paso === hoja.pasos ? 0 : 1,
    offset: paso / hoja.pasos,
    easing: 'steps(1, end)',
  }))
  return {
    fotogramas,
    opciones: { duration: hoja.pasos * G.hojaPasoMs, delay: hoja.retrasoMs, fill: 'both' },
  }
}

// ---------- Sacudida al presionar: una celda a la derecha, una a la izquierda y de vuelta ----------

export function planSacudida(): PlanAnimacion {
  const desplazamientos = [0, 1, -1, 1, 0]
  return {
    fotogramas: desplazamientos.map((dx, paso) => ({
      transform: `translate(${dx}px, 0px)`,
      offset: paso / (desplazamientos.length - 1),
      easing: 'steps(1, end)',
    })),
    opciones: { duration: (desplazamientos.length - 1) * G.sacudidaPasoMs },
  }
}
