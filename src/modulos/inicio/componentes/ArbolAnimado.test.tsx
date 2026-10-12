import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { CUADROS_REPOSO } from '../lib/dibujoArbol'
import { ArbolAnimado } from './ArbolAnimado'

let entradaTerminada = true
vi.mock('@/modulos/entrada', () => ({ useEntradaTerminada: () => entradaTerminada }))

interface AnimacionFalsa {
  finished: Promise<AnimacionFalsa>
  playState: string
  cancel: () => void
  pause: () => void
  play: () => void
  addEventListener: () => void
}

const llamadas: {
  elemento: Element
  fotogramas: Keyframe[]
  opciones: KeyframeAnimationOptions
}[] = []
let animacionesCreadas: AnimacionFalsa[] = []

function animacionFalsa(): AnimacionFalsa {
  const animacion: AnimacionFalsa = {
    finished: Promise.resolve() as unknown as Promise<AnimacionFalsa>,
    playState: 'running',
    cancel: vi.fn(),
    pause: vi.fn(() => {
      animacion.playState = 'paused'
    }),
    play: vi.fn(),
    addEventListener: vi.fn(),
  }
  animacionesCreadas.push(animacion)
  return animacion
}

function simularMatchMedia(coincide: (consulta: string) => boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: coincide(consulta),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

async function arrancar() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(G.retrasoInicioMs + 10)
  })
}

describe('ArbolAnimado', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    entradaTerminada = true
    llamadas.length = 0
    animacionesCreadas = []
    simularMatchMedia(() => false)
    Element.prototype.animate = function (this: Element, fotogramas, opciones) {
      llamadas.push({
        elemento: this,
        fotogramas: fotogramas as Keyframe[],
        opciones: opciones as KeyframeAnimationOptions,
      })
      return animacionFalsa() as unknown as Animation
    }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('es decorativo y está dibujado en una rejilla de 40 x 40', () => {
    const { container } = render(<ArbolAnimado />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 40 40')
  })

  it('se dibuja con trazos, sin un rectángulo por fila', () => {
    const { container } = render(<ArbolAnimado />)
    expect(container.querySelectorAll('svg rect')).toHaveLength(0)
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(10)
  })

  it('se ve completo y quieto desde el primer cuadro, aunque la entrada no haya terminado', async () => {
    entradaTerminada = false
    const { container } = render(<ArbolAnimado />)
    expect(container.querySelectorAll('[data-pieza]')).toHaveLength(7)
    expect(container.querySelector('[data-cuadro="1"]')).toBeNull()
    await arrancar()
    expect(container.firstElementChild).toHaveAttribute('data-fase', 'esperando')
    expect(llamadas).toHaveLength(0)
  })

  it('no dibuja nada que desaparezca ni parte de un árbol vacío: sin versiones chicas', () => {
    const { container } = render(<ArbolAnimado />)
    expect(container.querySelector('[data-forma]')).toBeNull()
    expect(container.querySelector('svg')?.getAttribute('style')).toBeNull()
  })

  it('al terminar la entrada pasa al reposo con un cuadro base y los de la copa', async () => {
    const { container } = render(<ArbolAnimado />)
    await arrancar()
    expect(container.firstElementChild).toHaveAttribute('data-fase', 'reposo')
    const cuadros = llamadas.filter(({ elemento }) => elemento.hasAttribute('data-cuadro'))
    expect(cuadros).toHaveLength(CUADROS_REPOSO.length + 1)
    for (const { opciones } of cuadros) expect(opciones.iterations).toBe(Number.POSITIVE_INFINITY)
  })

  it('nunca recorta, gira ni escala: solo opacidad y corrimientos enteros', async () => {
    const { container } = render(<ArbolAnimado />)
    await arrancar()
    fireEvent.pointerDown(container.firstElementChild as Element)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(llamadas.length).toBeGreaterThan(CUADROS_REPOSO.length)
    for (const { fotogramas } of llamadas) {
      for (const fotograma of fotogramas) {
        const claves = Object.keys(fotograma).filter(
          (clave) => clave !== 'offset' && clave !== 'easing',
        )
        for (const clave of claves) expect(['opacity', 'transform']).toContain(clave)
        expect(String(fotograma.transform ?? '')).not.toMatch(/rotate|scale|clip/)
      }
    }
  })

  it('al presionar suelta 5 hojas y sacude la copa una celda', async () => {
    const { container } = render(<ArbolAnimado />)
    await arrancar()
    const antes = llamadas.length
    fireEvent.pointerDown(container.firstElementChild as Element)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    const nuevas = llamadas.slice(antes)
    expect(nuevas.filter(({ elemento }) => elemento.tagName === 'rect')).toHaveLength(
      G.abanicoHojas,
    )
    expect(
      nuevas.filter(({ elemento }) => elemento.getAttribute('data-parte') === 'copa'),
    ).toHaveLength(1)
  })

  it('con la pestaña oculta, las animaciones se pausan', async () => {
    render(<ArbolAnimado />)
    await arrancar()
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(animacionesCreadas.length).toBeGreaterThan(0)
    for (const animacion of animacionesCreadas) expect(animacion.pause).toHaveBeenCalled()
  })

  it('con «reducir movimiento» queda completo y quieto, sin crear ninguna animación', async () => {
    simularMatchMedia((consulta) => consulta.includes('prefers-reduced-motion'))
    const { container } = render(<ArbolAnimado />)
    await arrancar()
    expect(container.firstElementChild).toHaveAttribute('data-fase', 'quieto')
    expect(llamadas).toHaveLength(0)
    expect(container.querySelectorAll('[data-pieza]')).toHaveLength(7)
    expect(container.querySelector('[data-cuadro="1"]')).toBeNull()
  })
})
