// Texto del buscador: mientras se escribe, la fuente de verdad es un estado local (el cursor no
// salta aunque la URL llegue tarde). La URL se escribe una vez, tras una pausa corta, y solo un
// cambio que viene de fuera (atrás, adelante, «Limpiar filtros») vuelve a poner el texto.
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEBOUNCE_BUSQUEDA_MS } from '@/config/constantes'

export interface BusquedaLocal {
  texto: string
  cambiar: (texto: string) => void
}

export function useBusquedaLocal(
  busquedaEnUrl: string,
  alEscribir: (texto: string) => void,
): BusquedaLocal {
  const [texto, setTexto] = useState(busquedaEnUrl)
  // Último valor que la URL tuvo o que esta pantalla le escribió: lo distinto es un cambio externo
  const ultimoConocido = useRef(busquedaEnUrl)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alEscribirActual = useRef(alEscribir)

  useEffect(() => {
    alEscribirActual.current = alEscribir
  })

  const cancelar = useCallback(() => {
    if (temporizador.current !== null) clearTimeout(temporizador.current)
    temporizador.current = null
  }, [])

  useEffect(() => {
    if (busquedaEnUrl === ultimoConocido.current) return
    ultimoConocido.current = busquedaEnUrl
    cancelar()
    setTexto(busquedaEnUrl)
  }, [busquedaEnUrl, cancelar])

  useEffect(() => cancelar, [cancelar])

  const cambiar = useCallback(
    (nuevo: string) => {
      setTexto(nuevo)
      cancelar()
      temporizador.current = setTimeout(() => {
        temporizador.current = null
        ultimoConocido.current = nuevo
        alEscribirActual.current(nuevo)
      }, DEBOUNCE_BUSQUEDA_MS)
    },
    [cancelar],
  )

  return { texto, cambiar }
}
