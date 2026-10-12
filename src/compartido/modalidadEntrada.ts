// Anota en <html> si la persona usa el teclado o un puntero. El CSS apaga todo el movimiento
// mientras se usa el teclado: nada se anima en una acción de teclado.
import {
  ATRIBUTO_MODALIDAD_ENTRADA,
  MODALIDADES_ENTRADA,
  TECLAS_MODIFICADORAS,
} from '@/config/constantes'

type Modalidad = (typeof MODALIDADES_ENTRADA)[keyof typeof MODALIDADES_ENTRADA]

const EVENTOS_DE_PUNTERO = ['pointerdown', 'pointermove'] as const

// Devuelve la función que deja de escuchar.
export function iniciarModalidadEntrada(documento: Document = document): () => void {
  const raiz = documento.documentElement
  const poner = (modalidad: Modalidad) => {
    if (raiz.getAttribute(ATRIBUTO_MODALIDAD_ENTRADA) !== modalidad) {
      raiz.setAttribute(ATRIBUTO_MODALIDAD_ENTRADA, modalidad)
    }
  }
  const alPulsarTecla = (evento: KeyboardEvent) => {
    if ((TECLAS_MODIFICADORAS as readonly string[]).includes(evento.key)) return
    poner(MODALIDADES_ENTRADA.teclado)
  }
  const alUsarPuntero = () => poner(MODALIDADES_ENTRADA.puntero)

  poner(MODALIDADES_ENTRADA.puntero)
  documento.addEventListener('keydown', alPulsarTecla, true)
  EVENTOS_DE_PUNTERO.forEach((nombre) => documento.addEventListener(nombre, alUsarPuntero, true))
  return () => {
    documento.removeEventListener('keydown', alPulsarTecla, true)
    EVENTOS_DE_PUNTERO.forEach((nombre) =>
      documento.removeEventListener(nombre, alUsarPuntero, true),
    )
  }
}
