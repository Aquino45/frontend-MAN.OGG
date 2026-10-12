// Transiciones del navegador (View Transitions) para el cambio de página y de tema.
// Donde no hay soporte, con «reducir movimiento» o mientras se usa el teclado, el cambio es
// inmediato y sin animación.
import {
  ATRIBUTO_MODALIDAD_ENTRADA,
  ATRIBUTO_TRANSICION,
  CONSULTA_MOVIMIENTO_REDUCIDO,
  MODALIDADES_ENTRADA,
  TRANSICIONES,
} from '@/config/constantes'

type TipoTransicion = (typeof TRANSICIONES)[keyof typeof TRANSICIONES]

export function puedeTransicionar(): boolean {
  if (typeof document.startViewTransition !== 'function') return false
  const reducido =
    typeof window.matchMedia === 'function' &&
    window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO).matches
  if (reducido) return false
  const modalidad = document.documentElement.getAttribute(ATRIBUTO_MODALIDAD_ENTRADA)
  return modalidad !== MODALIDADES_ENTRADA.teclado
}

// Ejecuta el cambio dentro de una transición si se puede, y si no, directamente.
// «actualizar» puede devolver una promesa: la transición espera a que la página nueva esté lista.
export function transicionar(
  actualizar: () => void | Promise<void>,
  tipo: TipoTransicion = TRANSICIONES.pagina,
): void {
  if (!puedeTransicionar()) {
    void actualizar()
    return
  }
  const raiz = document.documentElement
  raiz.setAttribute(ATRIBUTO_TRANSICION, tipo)
  const transicion = document.startViewTransition(async () => {
    await actualizar()
  })
  const limpiar = () => raiz.removeAttribute(ATRIBUTO_TRANSICION)
  transicion.finished.then(limpiar, limpiar)
}
