// Mantiene el sector y el árbol abiertos en la URL, con la History API (sin librería de rutas).
import { useCallback, useEffect, useState } from 'react'
import { MARCA_HISTORIAL } from '@/config/constantes'
import {
  escribirSeleccion,
  leerSeleccion,
  SIN_SELECCION,
  type SeleccionUrl,
} from '../lib/seleccionUrl'

export interface SeleccionEnUrl extends SeleccionUrl {
  seleccionarSector: (sectorId: number) => void
  seleccionarArbol: (codigo: string) => void
  cerrarArbol: () => void
  cerrarSector: () => void
}

function urlDe(seleccion: SeleccionUrl): string {
  const { pathname, hash } = window.location
  return `${pathname}${escribirSeleccion(seleccion)}${hash}`
}

function entradaAgregadaPorLaApp(): boolean {
  const estado: unknown = window.history.state
  return typeof estado === 'object' && estado !== null && MARCA_HISTORIAL in estado
}

export function useSeleccionEnUrl(): SeleccionEnUrl {
  const [seleccion, setSeleccion] = useState<SeleccionUrl>(() =>
    leerSeleccion(window.location.search),
  )

  // «Atrás» y «adelante» del navegador: se vuelve a leer la URL.
  useEffect(() => {
    const alNavegar = () => setSeleccion(leerSeleccion(window.location.search))
    window.addEventListener('popstate', alNavegar)
    return () => window.removeEventListener('popstate', alNavegar)
  }, [])

  const abrir = useCallback((siguiente: SeleccionUrl) => {
    window.history.pushState({ [MARCA_HISTORIAL]: true }, '', urlDe(siguiente))
    setSeleccion(siguiente)
  }, [])

  // Cierra volviendo a la entrada anterior si la agregó la app; si no, reescribe la URL.
  const cerrar = useCallback((siguiente: SeleccionUrl) => {
    if (entradaAgregadaPorLaApp()) {
      window.history.back()
      return
    }
    window.history.replaceState(window.history.state, '', urlDe(siguiente))
    setSeleccion(siguiente)
  }, [])

  const seleccionarSector = useCallback(
    (sectorId: number) => abrir({ sectorId, arbolCodigo: null }),
    [abrir],
  )
  const seleccionarArbol = useCallback(
    (codigo: string) => abrir({ sectorId: seleccion.sectorId, arbolCodigo: codigo }),
    [abrir, seleccion.sectorId],
  )
  const cerrarArbol = useCallback(
    () => cerrar({ sectorId: seleccion.sectorId, arbolCodigo: null }),
    [cerrar, seleccion.sectorId],
  )
  const cerrarSector = useCallback(() => cerrar(SIN_SELECCION), [cerrar])

  return { ...seleccion, seleccionarSector, seleccionarArbol, cerrarArbol, cerrarSector }
}
