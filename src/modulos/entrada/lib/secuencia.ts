// La máquina de estados de la secuencia de la entrada alterna: cada frase se escribe, espera a que la
// persona avance, y la última abre una elección de dos opciones que termina (o sigue con un cierre).
// Funciones puras: quien la usa traduce teclas, clics y temporizadores a eventos.
import { ENTRADA_ALTERNA as E, TEXTOS_ENTRADA_ALTERNA as T } from '@/config/constantes'

// `texto` es la posición en la lista de textos: las frases y, al final, el cierre de la opción SÍ
export type Paso =
  | { fase: 'escribiendo' | 'esperando'; texto: number }
  | { fase: 'eligiendo'; opcion: number }
  | { fase: 'cerrada' }

export type Evento =
  // La persona avanza (Enter, Z, espacio o clic); mientras se escribe, completa la frase
  | { tipo: 'avanzar' }
  // Se agotó la espera del paso
  | { tipo: 'agotada' }
  // La frase terminó de escribirse sola
  | { tipo: 'termino' }
  | { tipo: 'mover'; hacia: -1 | 1 }
  | { tipo: 'elegir'; opcion: number }

const PREGUNTA = T.frases.length - 1
// La posición del cierre de la opción SÍ: justo después de las frases
export const INDICE_CIERRE = T.frases.length
const CIERRE = INDICE_CIERRE

export const PASO_INICIAL: Paso = { fase: 'escribiendo', texto: 0 }

export function textoDe(texto: number): string {
  return texto === CIERRE ? T.cierreSi : T.frases[texto]
}

function confirmar(opcion: number): Paso {
  return opcion === T.opcionSi ? { fase: 'escribiendo', texto: CIERRE } : { fase: 'cerrada' }
}

export function reducir(paso: Paso, evento: Evento): Paso {
  switch (paso.fase) {
    case 'escribiendo':
      if (evento.tipo !== 'termino' && evento.tipo !== 'avanzar') return paso
      return paso.texto === PREGUNTA
        ? { fase: 'eligiendo', opcion: T.opcionPorDefecto }
        : { fase: 'esperando', texto: paso.texto }
    case 'esperando':
      if (evento.tipo !== 'avanzar' && evento.tipo !== 'agotada') return paso
      return paso.texto === CIERRE
        ? { fase: 'cerrada' }
        : { fase: 'escribiendo', texto: paso.texto + 1 }
    case 'eligiendo': {
      if (evento.tipo === 'mover') {
        const opcion = Math.min(T.opciones.length - 1, Math.max(0, paso.opcion + evento.hacia))
        return opcion === paso.opcion ? paso : { fase: 'eligiendo', opcion }
      }
      if (evento.tipo === 'elegir') return confirmar(evento.opcion)
      if (evento.tipo === 'avanzar') return confirmar(paso.opcion)
      if (evento.tipo === 'agotada') return confirmar(T.opcionPorDefecto)
      return paso
    }
    case 'cerrada':
      return paso
  }
}

// Cuánto espera el paso antes de seguir solo; null si no espera (se está escribiendo o ya cerró)
export function esperaDe(paso: Paso): number | null {
  if (paso.fase === 'esperando') return E.esperaFraseMs
  if (paso.fase === 'eligiendo') return E.esperaEleccionMs
  return null
}

// El paso junto con el último texto que se mostró: al cerrar (cerrada no trae texto) la caja sigue
// mostrando lo último mientras se desvanece
export interface EstadoSecuencia {
  paso: Paso
  texto: number
}

export const ESTADO_INICIAL: EstadoSecuencia = { paso: PASO_INICIAL, texto: 0 }

export function reducirEstado(estado: EstadoSecuencia, evento: Evento): EstadoSecuencia {
  const paso = reducir(estado.paso, evento)
  if (paso === estado.paso) return estado
  if (paso.fase === 'cerrada') return { paso, texto: estado.texto }
  return { paso, texto: paso.fase === 'eligiendo' ? PREGUNTA : paso.texto }
}
