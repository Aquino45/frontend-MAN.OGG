// Recuerda cuándo fue el último clic, toque o tecla. El navegador solo deja sonar tras un gesto, y
// la entrada alterna solo suena si el cambio de sección vino de uno. El registro se arma una vez,
// cuando alguien lo pide, y escucha en la fase de captura para que nada lo oculte.
import { useEffect } from 'react'

let ultimoGestoMs = -Infinity

export function marcarGesto(ahoraMs: number = performance.now()): void {
  ultimoGestoMs = ahoraMs
}

export function reiniciarGestos(): void {
  ultimoGestoMs = -Infinity
}

export function hayGestoReciente(ventanaMs: number, ahoraMs: number = performance.now()): boolean {
  return ahoraMs - ultimoGestoMs <= ventanaMs
}

export function useRegistroDeGestos(): void {
  useEffect(() => {
    const registrar = () => marcarGesto()
    const opciones = { capture: true, passive: true } as const
    window.addEventListener('pointerdown', registrar, opciones)
    window.addEventListener('keydown', registrar, opciones)
    return () => {
      window.removeEventListener('pointerdown', registrar, opciones)
      window.removeEventListener('keydown', registrar, opciones)
    }
  }, [])
}
