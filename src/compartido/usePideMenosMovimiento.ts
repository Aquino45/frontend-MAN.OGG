// Dice si la persona pidió menos movimiento y se entera si lo cambia con la página abierta.
// El CSS ya apaga sus propias animaciones; este hook es para quien anima desde código.
import { useSyncExternalStore } from 'react'
import { CONSULTA_MOVIMIENTO_REDUCIDO } from '@/config/constantes'

function consulta(): MediaQueryList | null {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)
    : null
}

function suscribir(avisar: () => void): () => void {
  const media = consulta()
  media?.addEventListener('change', avisar)
  return () => media?.removeEventListener('change', avisar)
}

const leer = () => consulta()?.matches ?? false

export function usePideMenosMovimiento(): boolean {
  return useSyncExternalStore(suscribir, leer, () => false)
}
