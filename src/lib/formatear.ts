// Formato de números para la interfaz: miles con espacio fino y punto decimal.
import { MEDIDAS, SEPARADOR_MILES, type Magnitud } from '@/config/constantes'

const MINIMO_DIGITOS_PARA_AGRUPAR = 4

function agruparMiles(digitos: string): string {
  if (digitos.length < MINIMO_DIGITOS_PARA_AGRUPAR) return digitos
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, SEPARADOR_MILES)
}

// Número sin unidad, con los decimales de la magnitud. null si no hay dato.
export function formatearNumero(valor: number | null, magnitud: Magnitud): string | null {
  if (valor === null || !Number.isFinite(valor)) return null
  const { decimales, recortarCeros } = MEDIDAS[magnitud]
  const [enteros, fraccion] = valor.toFixed(decimales).split('.')
  const signo = enteros.startsWith('-') ? '-' : ''
  const cuerpo = agruparMiles(enteros.replace('-', ''))
  const sinCeros = recortarCeros && fraccion !== undefined && /^0+$/.test(fraccion)
  return `${signo}${cuerpo}${fraccion !== undefined && !sinCeros ? `.${fraccion}` : ''}`
}

// Número con su unidad («9.4 m»). null si no hay dato.
export function formatearMedida(valor: number | null, magnitud: Magnitud): string | null {
  const numero = formatearNumero(valor, magnitud)
  if (numero === null) return null
  const { unidad } = MEDIDAS[magnitud]
  return unidad === '' ? numero : `${numero} ${unidad}`
}
