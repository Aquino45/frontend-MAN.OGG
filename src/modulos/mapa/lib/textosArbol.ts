// Textos que se arman con los datos de un árbol de la lista («S01-A001, Molle»).
import type { ArbolResumen } from '@/api/cliente'

export function nombreAccesibleArbol(
  arbol: Pick<ArbolResumen, 'codigo' | 'nombre_comun'>,
  textoSinNombre: string,
): string {
  return `${arbol.codigo}, ${arbol.nombre_comun ?? textoSinNombre}`
}
