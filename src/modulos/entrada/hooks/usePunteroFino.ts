// Dice si el dispositivo tiene un puntero fino (ratón o lápiz) y se entera si cambia. En táctil, no.
import { useSyncExternalStore } from 'react'
import { ENTRADA_ALTERNA as E } from '@/config/constantes'

function consulta(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(E.consultaPunteroFino) : null
}

function suscribir(avisar: () => void): () => void {
  const media = consulta()
  media?.addEventListener?.('change', avisar)
  return () => media?.removeEventListener?.('change', avisar)
}

const leer = () => consulta()?.matches ?? false

export function usePunteroFino(): boolean {
  return useSyncExternalStore(suscribir, leer, () => false)
}
