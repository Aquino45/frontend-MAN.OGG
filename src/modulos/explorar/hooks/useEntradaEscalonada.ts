// La lista de Explorar entra escalonada solo la primera vez que se ve con árboles: pasado el tiempo
// de la entrada, las filas que aparezcan al filtrar entran normales, sin animación.
import { useEffect, useState } from 'react'
import { EXPLORAR_FIN_ENTRADA_MS } from '@/config/constantes'

export function useEntradaEscalonada(hayFilas: boolean): boolean {
  const [entrando, setEntrando] = useState(true)

  useEffect(() => {
    if (!hayFilas) return
    const temporizador = window.setTimeout(() => setEntrando(false), EXPLORAR_FIN_ENTRADA_MS)
    return () => window.clearTimeout(temporizador)
  }, [hayFilas])

  return entrando
}
