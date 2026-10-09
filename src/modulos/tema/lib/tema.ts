// Reglas puras del tema: qué valores son válidos y cuál toca al arrancar.
import { TEMAS } from '@/config/constantes'

export type Tema = (typeof TEMAS)[keyof typeof TEMAS]

const VALORES_TEMA: readonly string[] = Object.values(TEMAS)

export function esTema(valor: unknown): valor is Tema {
  return typeof valor === 'string' && VALORES_TEMA.includes(valor)
}

export function temaOpuesto(tema: Tema): Tema {
  return tema === TEMAS.claro ? TEMAS.oscuro : TEMAS.claro
}

// La elección guardada manda; si no hay una válida, se sigue al sistema.
export function resolverTema(guardado: unknown, sistemaPrefiereClaro: boolean): Tema {
  if (esTema(guardado)) return guardado
  return sistemaPrefiereClaro ? TEMAS.claro : TEMAS.oscuro
}
