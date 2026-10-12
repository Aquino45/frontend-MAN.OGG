// El cursor propio de la entrada alterna: un corazón pixel que sigue al puntero mientras dura la
// secuencia (el cursor del sistema se oculta con CSS dentro de la capa). No se ve hasta que el puntero
// se mueve por primera vez. Quien lo monta decide si hay puntero fino.
import { useEffect, useRef } from 'react'
import { ENTRADA_ALTERNA as E } from '@/config/constantes'
import { SPRITE_CORAZON } from '../lib/sprites'
import { SpritePixel } from './SpritePixel'

export function CursorCorazon() {
  const refCursor = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const alMover = (evento: PointerEvent) => {
      const cursor = refCursor.current
      if (!cursor) return
      // El corazón queda centrado sobre el punto del puntero; solo `transform`, sin re-render
      cursor.style.transform = `translate(${evento.clientX - E.cursorLadoPx / 2}px, ${evento.clientY - E.cursorLadoPx / 2}px)`
      cursor.dataset.visible = 'si'
    }
    window.addEventListener('pointermove', alMover)
    return () => window.removeEventListener('pointermove', alMover)
  }, [])
  return (
    <div ref={refCursor} className="entrada-alterna__cursor" aria-hidden="true">
      <SpritePixel sprite={SPRITE_CORAZON} altoPx={E.cursorLadoPx} />
    </div>
  )
}
