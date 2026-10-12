import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import { ContextoEntrada, type EstadoEntrada } from '@/modulos/entrada'
import { FILAS_COPA, PASOS_TRONCO } from '../lib/rejillaArbol'
import { ArbolAnimado } from './ArbolAnimado'

// jsdom no trae la API de animaciones: se simula lo justo para ver qué se pide y a quién.
interface Lanzada {
  elemento: Element
  fotogramas: Keyframe[]
  opciones: KeyframeAnimationOptions
  animacion: AnimacionFalsa
}

class AnimacionFalsa {
  playbackRate = 1
  playState: AnimationPlayState = 'running'
  pause = vi.fn(() => {
    this.playState = 'paused'
  })
  play = vi.fn(() => {
    this.playState = 'running'
  })
  cancel = vi.fn()
  addEventListener = vi.fn()
  finished: Promise<void>
  terminar: () => void = () => undefined
  constructor(infinita: boolean) {
    this.finished = infinita
      ? new Promise<void>(() => undefined)
      : new Promise<void>((resolver) => {
          this.terminar = resolver
        })
  }
}

let lanzadas: Lanzada[] = []

function simularAnimaciones() {
  lanzadas = []
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value(this: Element, fotogramas: Keyframe[], opciones: KeyframeAnimationOptions) {
      const animacion = new AnimacionFalsa(opciones.iterations === Infinity)
      lanzadas.push({ elemento: this, fotogramas, opciones, animacion })
      return animacion
    },
  })
}

function simularMedia({ reducido, cursorFino }: { reducido: boolean; cursorFino: boolean }) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: consulta.includes('reduce') ? reducido : cursorFino,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }))
}

function montar(estado: EstadoEntrada = 'terminada', aleatorio: () => number = () => 0) {
  const arbol = (valor: EstadoEntrada) => (
    <ContextoEntrada.Provider value={valor}>
      <ArbolAnimado aleatorioHojas={aleatorio} />
    </ContextoEntrada.Provider>
  )
  const resultado = render(arbol(estado))
  return {
    ...resultado,
    raiz: resultado.container.querySelector('.arbol-animado') as HTMLElement,
    cambiarEstado: (valor: EstadoEntrada) => resultado.rerender(arbol(valor)),
  }
}

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

const conClave = (clave: string) =>
  lanzadas.filter(({ elemento }) => elemento.getAttribute('data-parte') === clave)

// Termina el crecimiento (las animaciones con fin) y deja pasar las promesas.
async function terminarCrecimiento() {
  await act(async () => {
    lanzadas
      .filter(({ opciones }) => opciones.iterations !== Infinity)
      .forEach((l) => l.animacion.terminar())
    await vi.advanceTimersByTimeAsync(0)
  })
}

const hojas = (raiz: HTMLElement) =>
  raiz.querySelectorAll('svg > g:last-child > rect.glifo-pixel__copa-media')

beforeEach(() => {
  vi.useFakeTimers()
  simularAnimaciones()
  simularMedia({ reducido: false, cursorFino: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(Element.prototype, 'animate')
})

describe('ArbolAnimado', () => {
  it('con «reducir movimiento» queda completo y quieto, sin pedir ninguna animación', async () => {
    simularMedia({ reducido: true, cursorFino: true })
    const { raiz } = montar()
    await avanzar(30000)
    expect(raiz).toHaveAttribute('data-fase', 'quieto')
    expect(lanzadas).toHaveLength(0)
    expect(raiz.querySelectorAll('[data-parte^="fila-"]')).toHaveLength(FILAS_COPA.length)
    expect(raiz.querySelectorAll('[data-parte^="tronco-"]')).toHaveLength(PASOS_TRONCO)
    expect(hojas(raiz)).toHaveLength(0)
  })

  it('es decorativo', () => {
    expect(montar().raiz).toHaveAttribute('aria-hidden', 'true')
  })

  it('espera a que termine la entrada del sitio', async () => {
    const { raiz, cambiarEstado } = montar('en-curso')
    await avanzar(5000)
    expect(raiz).toHaveAttribute('data-fase', 'esperando')
    expect(lanzadas).toHaveLength(0)
    cambiarEstado('terminada')
    await avanzar(G.retrasoInicioMs - 1)
    expect(lanzadas).toHaveLength(0)
    await avanzar(1)
    expect(raiz).toHaveAttribute('data-fase', 'creciendo')
    expect(lanzadas.length).toBeGreaterThan(0)
  })

  it('crece del tronco a la copa, fila por fila de abajo hacia arriba', async () => {
    const { raiz } = montar()
    await avanzar(G.retrasoInicioMs)
    expect(raiz).toHaveAttribute('data-fase', 'creciendo')
    const retraso = (clave: string) => Number(conClave(clave)[0].opciones.delay)
    expect(retraso('tronco-0')).toBeLessThan(retraso('tronco-3'))
    const ultima = FILAS_COPA.length - 1
    expect(retraso(`fila-${ultima}`)).toBeLessThan(retraso('fila-0'))
    for (const { opciones } of lanzadas) {
      expect(Number(opciones.delay) + Number(opciones.duration)).toBeLessThanOrEqual(1600)
    }
  })

  it('al terminar de crecer queda en reposo: mecido de cada fila, respiración, barrido y parpadeo', async () => {
    const { raiz } = montar()
    await avanzar(G.retrasoInicioMs)
    const crecimiento = lanzadas.slice()
    await terminarCrecimiento()
    expect(raiz).toHaveAttribute('data-fase', 'reposo')
    crecimiento.forEach(({ animacion }) => expect(animacion.cancel).toHaveBeenCalled())
    const infinitas = lanzadas.filter(({ opciones }) => opciones.iterations === Infinity)
    expect(infinitas).toHaveLength(FILAS_COPA.length + 3)
  })

  it('con la red de seguridad queda solo el mecido', async () => {
    const { container } = render(
      <ContextoEntrada.Provider value="terminada">
        <ArbolAnimado reposoCompleto={false} />
      </ContextoEntrada.Provider>,
    )
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    expect(container.querySelector('.arbol-animado')).toHaveAttribute('data-fase', 'reposo')
    expect(lanzadas.filter(({ opciones }) => opciones.iterations === Infinity)).toHaveLength(
      FILAS_COPA.length,
    )
  })

  it('se pausa con la pestaña oculta y reanuda al volver', async () => {
    montar()
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    const vivas = lanzadas.filter(({ opciones }) => opciones.iterations === Infinity)
    const cambiarVisibilidad = (estado: DocumentVisibilityState) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: estado })
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })
    }
    cambiarVisibilidad('hidden')
    vivas.forEach(({ animacion }) => expect(animacion.pause).toHaveBeenCalled())
    cambiarVisibilidad('visible')
    vivas.forEach(({ animacion }) => expect(animacion.play).toHaveBeenCalled())
  })

  it('suelta una hoja cada 7 a 11 s, como mucho dos a la vez', async () => {
    const { raiz } = montar('terminada', () => 0)
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    await avanzar(G.hojaIntervaloMinMs - 1)
    expect(hojas(raiz)).toHaveLength(0)
    await avanzar(1)
    expect(hojas(raiz)).toHaveLength(1)
    await avanzar(G.hojaIntervaloMinMs)
    expect(hojas(raiz)).toHaveLength(2)
    await avanzar(G.hojaIntervaloMinMs * 3)
    expect(hojas(raiz)).toHaveLength(2)
  })

  it('el intervalo máximo de las hojas es de 11 s', async () => {
    const { raiz } = montar('terminada', () => 0.999999)
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    await avanzar(G.hojaIntervaloMaxMs)
    expect(hojas(raiz)).toHaveLength(1)
  })

  it('no suelta hojas mientras está pausado', async () => {
    const { raiz } = montar('terminada', () => 0)
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await avanzar(60000)
    expect(hojas(raiz)).toHaveLength(0)
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })

  it('al presionar hay una sacudida y cinco hojas en abanico; no se repite enseguida', async () => {
    const { raiz } = montar()
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    fireEvent.pointerDown(raiz)
    expect(hojas(raiz)).toHaveLength(G.abanicoHojas)
    const sacudidas = lanzadas.filter(({ opciones }) => opciones.duration === G.sacudidaMs)
    expect(sacudidas).toHaveLength(1)
    fireEvent.pointerDown(raiz)
    expect(hojas(raiz)).toHaveLength(G.abanicoHojas)
    await avanzar(G.enfriamientoPulsacionMs)
    fireEvent.pointerDown(raiz)
    expect(hojas(raiz)).toHaveLength(G.abanicoHojas * 2)
  })

  it('presionar antes de que termine de crecer no hace nada', async () => {
    const { raiz } = montar()
    await avanzar(G.retrasoInicioMs)
    fireEvent.pointerDown(raiz)
    expect(hojas(raiz)).toHaveLength(0)
  })

  it('la respiración se acelera con el cursor encima (solo con cursor fino)', async () => {
    simularMedia({ reducido: false, cursorFino: true })
    const { raiz } = montar()
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    const respira = conClave('respira').find(({ opciones }) => opciones.iterations === Infinity)!
    fireEvent.pointerEnter(raiz)
    expect(respira.animacion.playbackRate).toBe(G.respiracionRapida)
    fireEvent.pointerLeave(raiz)
    expect(respira.animacion.playbackRate).toBe(1)
  })

  it('al desmontar cancela todo', async () => {
    const { unmount } = montar()
    await avanzar(G.retrasoInicioMs)
    await terminarCrecimiento()
    unmount()
    for (const { animacion } of lanzadas) expect(animacion.cancel).toHaveBeenCalled()
  })
})
