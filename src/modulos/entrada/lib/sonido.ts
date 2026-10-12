// El sonido de la entrada alterna, sintetizado con Web Audio: un blip corto y agudo por letra y, si hay
// una pista, su música de fondo con fundidos. Se crea solo cuando el navegador ya dejó sonar (hubo un
// gesto); sin Web Audio devuelve null y la entrada sigue en silencio.
import { SONIDO_ENTRADA_ALTERNA as S } from '@/config/constantes'

export interface Sonido {
  // Un blip (el índice alterna las notas)
  blip: (indice: number) => void
  // Empieza la pista de fondo con su fundido de entrada
  iniciarPista: (url: string) => void
  // Apaga todo con un fundido de salida (milisegundos) y suelta los recursos
  detener: (fundidoMs: number) => void
}

type ConstructorAudio = typeof AudioContext

export function crearSonido(): Sonido | null {
  const Contexto: ConstructorAudio | undefined = window.AudioContext
  if (typeof Contexto !== 'function') return null
  let contexto: AudioContext
  try {
    contexto = new Contexto()
  } catch {
    return null
  }
  const pistaGanancia = contexto.createGain()
  pistaGanancia.gain.value = 0
  pistaGanancia.connect(contexto.destination)
  let pista: HTMLAudioElement | null = null
  let cerrado = false

  return {
    blip(indice) {
      if (cerrado) return
      const ahora = contexto.currentTime
      const oscilador = contexto.createOscillator()
      const ganancia = contexto.createGain()
      const frecuencias = S.blipFrecuenciasHz
      oscilador.type = 'square'
      oscilador.frequency.value = frecuencias[indice % frecuencias.length]
      // Ataque instantáneo y caída rápida: suena a «tick» dulce, no a zumbido
      ganancia.gain.setValueAtTime(S.blipVolumen, ahora)
      ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + S.blipDuracionMs / 1000)
      oscilador.connect(ganancia)
      ganancia.connect(contexto.destination)
      oscilador.start(ahora)
      oscilador.stop(ahora + S.blipDuracionMs / 1000)
    },
    iniciarPista(url) {
      if (cerrado || pista) return
      pista = new Audio(url)
      pista.loop = false
      contexto.createMediaElementSource(pista).connect(pistaGanancia)
      const ahora = contexto.currentTime
      pistaGanancia.gain.setValueAtTime(0, ahora)
      pistaGanancia.gain.linearRampToValueAtTime(
        S.pistaVolumen,
        ahora + S.pistaFundidoEntradaMs / 1000,
      )
      // Si el navegador no deja reproducir, queda en silencio y no pasa nada
      const intento = pista.play() as Promise<void> | undefined
      intento?.catch(() => {})
    },
    detener(fundidoMs) {
      if (cerrado) return
      cerrado = true
      const ahora = contexto.currentTime
      pistaGanancia.gain.cancelScheduledValues(ahora)
      pistaGanancia.gain.setValueAtTime(pistaGanancia.gain.value, ahora)
      pistaGanancia.gain.linearRampToValueAtTime(0, ahora + fundidoMs / 1000)
      window.setTimeout(() => {
        pista?.pause()
        void contexto.close().catch(() => {})
      }, fundidoMs)
    },
  }
}
