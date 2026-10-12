// El sonido de la entrada alterna, sintetizado con Web Audio: un pulso corto y grave por letra y, si hay
// una pista, su música de fondo con fundidos. Se crea solo cuando el navegador ya dejó sonar (hubo un
// gesto); sin Web Audio devuelve null y la entrada sigue en silencio.
import { SONIDO_ENTRADA_ALTERNA as S } from '@/config/constantes'

export interface Sonido {
  // El pulso de una letra al escribirse
  tipeo: () => void
  // Empieza la pista de fondo con su fundido de entrada
  iniciarPista: (url: string) => void
  // La celebración de elegir SÍ: una corneta de fiesta y unos soniditos brillantes
  celebrar: () => void
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
    tipeo() {
      if (cerrado) return
      const ahora = contexto.currentTime
      const { frecuenciaHz, mezclaTriangular, duracionMs, volumen } = S.tipeo
      const fin = ahora + duracionMs / 1000
      // Dos ondas con la misma nota: la cuadrada pone el cuerpo y la triangular la suaviza
      for (const [tipo, nivel] of [
        ['square', volumen],
        ['triangle', volumen * mezclaTriangular],
      ] as const) {
        const oscilador = contexto.createOscillator()
        const ganancia = contexto.createGain()
        oscilador.type = tipo
        oscilador.frequency.value = frecuenciaHz
        // Ataque instantáneo y caída rápida: suena a «tic» grave, no a zumbido
        ganancia.gain.setValueAtTime(nivel, ahora)
        ganancia.gain.exponentialRampToValueAtTime(0.0001, fin)
        oscilador.connect(ganancia)
        ganancia.connect(contexto.destination)
        oscilador.start(ahora)
        oscilador.stop(fin)
      }
    },
    celebrar() {
      if (cerrado) return
      const C = S.celebracion
      const ahora = contexto.currentTime
      // Corneta: onda cuadrada que sube de nota y se apaga rápido al final
      const corneta = contexto.createOscillator()
      const gananciaCorneta = contexto.createGain()
      const finCorneta = ahora + C.cornetaDuracionMs / 1000
      corneta.type = 'square'
      corneta.frequency.setValueAtTime(C.cornetaDesdeHz, ahora)
      corneta.frequency.exponentialRampToValueAtTime(C.cornetaHastaHz, finCorneta)
      gananciaCorneta.gain.setValueAtTime(C.cornetaVolumen, ahora)
      gananciaCorneta.gain.exponentialRampToValueAtTime(0.0001, finCorneta)
      corneta.connect(gananciaCorneta)
      gananciaCorneta.connect(contexto.destination)
      corneta.start(ahora)
      corneta.stop(finCorneta)
      // Soniditos: una escalera de notas cortas
      C.soniditosHz.forEach((frecuenciaHz, orden) => {
        const inicio = ahora + (C.soniditosDesdeMs + orden * C.soniditoCadaMs) / 1000
        const fin = inicio + C.soniditoDuracionMs / 1000
        const oscilador = contexto.createOscillator()
        const ganancia = contexto.createGain()
        oscilador.type = 'triangle'
        oscilador.frequency.value = frecuenciaHz
        ganancia.gain.setValueAtTime(C.soniditoVolumen, inicio)
        ganancia.gain.exponentialRampToValueAtTime(0.0001, fin)
        oscilador.connect(ganancia)
        ganancia.connect(contexto.destination)
        oscilador.start(inicio)
        oscilador.stop(fin)
      })
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
