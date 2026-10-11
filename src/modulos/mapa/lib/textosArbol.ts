// Textos que se arman con los datos de un árbol de la lista («S01-A001, Molle»).
import type { ArbolResumen } from '@/api/cliente'
import { TEXTOS_DESTACADO } from '@/config/constantes'

// Si el árbol es destacado, el texto suma el motivo («S01-A012, Huarango. Destacado: copa amplia»).
export function nombreAccesibleArbol(
  arbol: Pick<ArbolResumen, 'codigo' | 'nombre_comun' | 'destacado' | 'motivo_destacado'>,
  textoSinNombre: string,
): string {
  const base = `${arbol.codigo}, ${arbol.nombre_comun ?? textoSinNombre}`
  if (!arbol.destacado) return base
  const destacado = arbol.motivo_destacado
    ? `${TEXTOS_DESTACADO.etiqueta}: ${arbol.motivo_destacado}`
    : TEXTOS_DESTACADO.etiqueta
  return `${base}. ${destacado}`
}
