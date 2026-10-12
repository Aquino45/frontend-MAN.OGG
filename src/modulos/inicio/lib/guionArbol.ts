// Guion del árbol de la portada: qué se anima, cuándo y cómo. Son planes puros (datos para la
// API de animaciones del navegador); quien los ejecuta es el hook del árbol.
// Solo se animan transform, opacity y clip-path. Los tiempos y las medidas salen de constantes.ts.
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import {
  FILAS_COPA,
  LADO_REJILLA_ARBOL,
  PASOS_TRONCO,
  PIVOTE_COPA,
  SUELO_HOJA_Y,
} from './rejillaArbol'

// Las mismas curvas de movimiento.tokens.css (la API de animaciones no lee variables CSS)
const CURVA_SALIDA = 'cubic-bezier(0.23, 1, 0.32, 1)'
const CURVA_MOVIMIENTO = 'cubic-bezier(0.77, 0, 0.175, 1)'

export interface PlanAnimacion {
  // Elemento del dibujo al que se aplica (atributo data-parte)
  clave: string
  fotogramas: Keyframe[]
  opciones: KeyframeAnimationOptions
}

export const claveTronco = (paso: number) => `tronco-${paso}`
export const claveFila = (y: number) => `fila-${y}`
export const CLAVE_DESTELLO = 'destello'
export const CLAVE_PARPADEO = 'parpadeo'
export const CLAVE_RESPIRA = 'respira'

const px = (valor: number) => `${valor}px`

// Crecimiento: semilla, tronco en pasos, copa fila por fila de abajo hacia arriba y un destello.
export function planCrecimiento(): PlanAnimacion[] {
  const plan: PlanAnimacion[] = []

  for (let paso = 0; paso < PASOS_TRONCO; paso++) {
    const retraso = paso === 0 ? 0 : G.troncoPrimerPasoMs + (paso - 1) * G.troncoPasoMs
    plan.push({
      clave: claveTronco(paso),
      fotogramas:
        paso === 0
          ? [
              { opacity: 0, transform: 'scale(0.9)' },
              { opacity: 1, transform: 'scale(1)' },
            ]
          : [{ opacity: 0 }, { opacity: 1 }],
      opciones: {
        delay: retraso,
        duration: paso === 0 ? G.semillaMs : G.troncoFundidoMs,
        easing: CURVA_SALIDA,
        fill: 'both',
      },
    })
  }

  const ultima = FILAS_COPA.length - 1
  for (const { y } of FILAS_COPA) {
    plan.push({
      clave: claveFila(y),
      fotogramas: [
        { clipPath: 'inset(0 50% 0 50%)', opacity: 0 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1 },
      ],
      opciones: {
        delay: G.copaInicioMs + (ultima - y) * G.copaEscalonadoMs,
        duration: G.copaFilaMs,
        easing: CURVA_SALIDA,
        fill: 'both',
      },
    })
  }

  plan.push({
    clave: CLAVE_DESTELLO,
    fotogramas: [
      { transform: `translateX(${px(0)})` },
      { transform: `translateX(${px(LADO_REJILLA_ARBOL + 6)})` },
    ],
    opciones: {
      delay: G.destelloInicialMs,
      duration: G.destelloInicialDuracionMs,
      easing: 'linear',
      fill: 'backwards',
    },
  })
  return plan
}

// Cuándo termina el último paso del crecimiento (ms desde el arranque)
export function duracionTotalCrecimiento(): number {
  return Math.max(
    ...planCrecimiento().map(({ opciones }) => Number(opciones.delay) + Number(opciones.duration)),
  )
}

// Vida en reposo. Con «completo» en falso queda solo el mecido.
export function planReposo(completo: boolean): PlanAnimacion[] {
  const plan: PlanAnimacion[] = []
  const ultima = FILAS_COPA.length - 1

  // Mecido: cada fila oscila más cuanto más arriba, con un pequeño desfase entre filas
  for (const { y } of FILAS_COPA) {
    const altura = (ultima - y) / ultima
    const amplitud =
      G.meceoCeldas * (G.meceoMinimoProporcion + (1 - G.meceoMinimoProporcion) * altura)
    plan.push({
      clave: claveFila(y),
      fotogramas: [
        { transform: `translateX(${px(-amplitud)})` },
        { transform: `translateX(${px(amplitud)})` },
      ],
      opciones: {
        duration: G.meceoSentidoMs,
        delay: -(ultima - y) * G.meceoDesfaseMs,
        direction: 'alternate',
        iterations: Infinity,
        easing: 'ease-in-out',
      },
    })
  }

  if (!completo) return plan

  plan.push({
    clave: CLAVE_RESPIRA,
    fotogramas: [{ transform: 'scale(1)' }, { transform: `scale(${G.respiracionEscala})` }],
    opciones: {
      duration: G.respiracionSentidoMs,
      direction: 'alternate',
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  })

  plan.push({
    clave: CLAVE_DESTELLO,
    fotogramas: [
      { transform: `translateX(${px(0)})` },
      { transform: `translateX(${px(LADO_REJILLA_ARBOL + 6)})` },
    ],
    opciones: {
      delay: G.barridoRetrasoMs,
      duration: G.barridoDuracionMs,
      endDelay: G.barridoCicloMs - G.barridoDuracionMs,
      iterations: Infinity,
      easing: CURVA_MOVIMIENTO,
    },
  })

  plan.push({
    clave: CLAVE_PARPADEO,
    fotogramas: [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }],
    opciones: {
      delay: G.parpadeoRetrasoMs,
      duration: G.parpadeoDuracionMs,
      endDelay: G.parpadeoCicloMs - G.parpadeoDuracionMs,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  })
  return plan
}

// Una hoja que se desprende. «deriva» es cuánto se desplaza de lado (en celdas) hasta el suelo.
export interface EspecificacionHoja {
  x: number
  y: number
  deriva: number
  duracionMs: number
  // Vaivén de lado a lado mientras cae (las hojas sueltas); las de la ráfaga caen en abanico
  vaiven: boolean
}

export function fotogramasHoja({ y, deriva, vaiven }: EspecificacionHoja): Keyframe[] {
  const recorrido = SUELO_HOJA_Y - y
  const posicion = (avance: number, lado: number): string =>
    `translate(${px(lado)}, ${px(recorrido * avance)})`
  if (!vaiven) {
    return [
      { transform: posicion(0, 0), opacity: 1 },
      { transform: posicion(0.7, deriva * 0.7), opacity: 1, offset: 0.7 },
      { transform: posicion(1, deriva), opacity: 0 },
    ]
  }
  const lado = G.hojaVaivenCeldas
  return [
    { transform: posicion(0, 0), opacity: 1 },
    { transform: posicion(0.25, lado), opacity: 1, offset: 0.25 },
    { transform: posicion(0.5, -lado), opacity: 1, offset: 0.5 },
    { transform: posicion(0.7, lado), opacity: 1, offset: 0.7 },
    { transform: posicion(1, deriva), opacity: 0 },
  ]
}

// Sacudida corta de la copa al presionar: de lado a lado y de vuelta
export function fotogramasSacudida(): Keyframe[] {
  const c = G.sacudidaCeldas
  return [
    { transform: 'translateX(0px)' },
    { transform: `translateX(${px(-c)})`, offset: 0.25 },
    { transform: `translateX(${px(c)})`, offset: 0.55 },
    { transform: `translateX(${px(-c / 2)})`, offset: 0.8 },
    { transform: 'translateX(0px)' },
  ]
}

export const OPCIONES_SACUDIDA: KeyframeAnimationOptions = {
  duration: G.sacudidaMs,
  easing: CURVA_SALIDA,
}

// Inclinación de la copa hacia el puntero: «cuanto» va de -1 (izquierda) a 1 (derecha)
export function transformInclinacion(cuanto: number): string {
  return `translateX(${px(cuanto * G.inclinacionCeldas)}) rotate(${cuanto * G.inclinacionGrados}deg)`
}

export const ORIGEN_COPA = `${px(PIVOTE_COPA.x)} ${px(PIVOTE_COPA.y)}`
