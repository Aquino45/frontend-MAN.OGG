import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DESBLOQUEO_ANIMACION as D, DESBLOQUEO_CURVA, TEXTOS_DESBLOQUEO } from '@/config/constantes'
import CortinaDesbloqueo from './CortinaDesbloqueo'

const URL_PANEL = 'https://panel.prueba.invalid/admin/'

interface Llamada {
  elemento: Element
  fotogramas: Keyframe[]
  opciones: KeyframeAnimationOptions
  cancelar: ReturnType<typeof vi.fn>
}
const llamadas: Llamada[] = []

function simularMovimientoReducido(reducido: boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: reducido && consulta.includes('prefers-reduced-motion'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function montar(alQuitar = vi.fn(), activa = true) {
  const ir = vi.fn()
  const vista = render(
    <CortinaDesbloqueo activa={activa} urlPanel={URL_PANEL} ir={ir} alQuitar={alQuitar} />,
  )
  return { ir, alQuitar, ...vista }
}

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

describe('CortinaDesbloqueo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    llamadas.length = 0
    simularMovimientoReducido(false)
    Element.prototype.animate = function (this: Element, fotogramas, opciones) {
      const cancelar = vi.fn()
      llamadas.push({
        elemento: this,
        fotogramas: fotogramas as Keyframe[],
        opciones: opciones as KeyframeAnimationOptions,
        cancelar,
      })
      return { cancel: cancelar } as unknown as Animation
    }
    window.innerWidth = 1440
    window.innerHeight = 900
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('anuncia «Modo admin desbloqueado» en una zona de avisos', async () => {
    montar()
    await avanzar(1)
    const aviso = screen.getByRole('status')
    expect(aviso).toHaveAttribute('aria-live', 'polite')
    expect(aviso).toHaveTextContent(TEXTOS_DESBLOQUEO.anuncio)
  })

  it('las hojas, el fondo y el texto dibujado son adorno: no se leen dos veces', () => {
    const { baseElement } = montar()
    const decoracion = baseElement.querySelector('.desbloqueo__decoracion')
    expect(decoracion).toHaveAttribute('aria-hidden', 'true')
    expect(decoracion).toContainElement(baseElement.querySelector('.desbloqueo__texto'))
  })

  it('va en el cuerpo de la página, sobre todo lo demás, y no más hojas que el tope', () => {
    const { baseElement } = montar()
    const cortina = baseElement.querySelector('.desbloqueo')
    expect(cortina?.parentElement).toBe(document.body)
    const hojas = baseElement.querySelectorAll('[data-hoja]')
    expect(hojas.length).toBeGreaterThan(0)
    expect(hojas.length).toBeLessThanOrEqual(D.hojasMax)
  })

  it('cada hoja cae con la curva de salida y solo anima transform y opacity, sin girar ni escalar', () => {
    montar()
    const deHojas = llamadas.filter(({ elemento }) => elemento.hasAttribute('data-hoja'))
    expect(deHojas.length).toBeGreaterThan(0)
    for (const { fotogramas, opciones } of llamadas) {
      expect(opciones.easing).toBe(`cubic-bezier(${DESBLOQUEO_CURVA.join(', ')})`)
      for (const fotograma of fotogramas) {
        const propiedades = Object.keys(fotograma).filter((clave) => clave !== 'offset')
        for (const propiedad of propiedades) expect(['transform', 'opacity']).toContain(propiedad)
        expect(String(fotograma.transform ?? '')).not.toMatch(/rotate|scale|skew/)
      }
    }
    for (const { opciones } of deHojas) {
      expect(opciones.duration).toBe(D.caidaHojaMs)
      expect(Number(opciones.delay)).toBeLessThanOrEqual(D.retrasoMaximoHojaMs)
    }
  })

  it('el fondo y el texto entran en su momento; el texto nunca nace de la nada', () => {
    const { baseElement } = montar()
    const fondo = llamadas.find(
      ({ elemento }) => elemento === baseElement.querySelector('[data-fondo]'),
    )
    const chapa = llamadas.find(
      ({ elemento }) => elemento === baseElement.querySelector('[data-chapa]'),
    )
    expect(fondo?.opciones.delay).toBe(D.fondoRetrasoMs)
    expect(chapa?.opciones.delay).toBe(D.textoRetrasoMs)
    expect(chapa?.opciones.duration).toBe(D.textoDuracionMs)
    expect(chapa?.fotogramas[0]).toMatchObject({
      opacity: 0,
      transform: `translateY(${D.textoDesplazamientoPx}px)`,
    })
  })

  it('navega una sola vez, a la dirección del panel y no antes de que termine la cortina', async () => {
    const { ir } = montar()
    await avanzar(D.duracionTotalMs - 1)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(ir).toHaveBeenCalledExactlyOnceWith(URL_PANEL)
    await avanzar(D.duracionTotalMs * 2)
    expect(ir).toHaveBeenCalledOnce()
  })

  it('dura entre 1,2 y 1,6 s en total', () => {
    expect(D.duracionTotalMs).toBeGreaterThanOrEqual(1200)
    expect(D.duracionTotalMs).toBeLessThanOrEqual(1600)
  })

  it('si se desmonta antes de tiempo, no navega y cancela sus animaciones', async () => {
    const { ir, unmount } = montar()
    await avanzar(D.duracionTotalMs / 2)
    unmount()
    await avanzar(D.duracionTotalMs)
    expect(ir).not.toHaveBeenCalled()
    for (const { cancelar } of llamadas) expect(cancelar).toHaveBeenCalled()
  })

  it('montada sin activar queda oculta, sin animar, sin anunciar y sin navegar', async () => {
    const { ir, baseElement } = montar(vi.fn(), false)
    await avanzar(D.duracionTotalMs * 2)
    expect(llamadas).toHaveLength(0)
    expect(ir).not.toHaveBeenCalled()
    expect(baseElement.querySelector('.desbloqueo')).not.toHaveAttribute('data-activa')
    expect(screen.getByRole('status', { hidden: true })).toBeEmptyDOMElement()
    expect(baseElement.querySelectorAll('[data-hoja]').length).toBeGreaterThan(0)
  })

  it('al activarse empieza a animar y a contar el tiempo desde ese momento', async () => {
    const ir = vi.fn()
    const { rerender, baseElement } = render(
      <CortinaDesbloqueo activa={false} urlPanel={URL_PANEL} ir={ir} alQuitar={vi.fn()} />,
    )
    await avanzar(D.duracionTotalMs * 3)
    rerender(<CortinaDesbloqueo activa urlPanel={URL_PANEL} ir={ir} alQuitar={vi.fn()} />)
    expect(baseElement.querySelector('.desbloqueo')).toHaveAttribute('data-activa', 'si')
    expect(llamadas.length).toBeGreaterThan(0)
    await avanzar(D.duracionTotalMs - 1)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(ir).toHaveBeenCalledExactlyOnceWith(URL_PANEL)
  })

  it('al volver con «Atrás» y restaurarse la página, pide quitar la cortina', () => {
    const { alQuitar } = montar()
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: false }))
    expect(alQuitar).not.toHaveBeenCalled()
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    expect(alQuitar).toHaveBeenCalledOnce()
  })
})

describe('CortinaDesbloqueo con «reducir movimiento»', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    llamadas.length = 0
    simularMovimientoReducido(true)
    Element.prototype.animate = function (this: Element, fotogramas, opciones) {
      llamadas.push({
        elemento: this,
        fotogramas: fotogramas as Keyframe[],
        opciones: opciones as KeyframeAnimationOptions,
        cancelar: vi.fn(),
      })
      return { cancel: vi.fn() } as unknown as Animation
    }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('no crea ninguna animación: el texto se ve fijo', () => {
    const { baseElement } = montar()
    expect(llamadas).toHaveLength(0)
    expect(baseElement.querySelector('.desbloqueo')).toHaveAttribute('data-reducido', 'si')
  })

  it('anuncia el texto y navega un instante después, sin esperar la cortina', async () => {
    const { ir } = montar()
    await avanzar(1)
    expect(screen.getByRole('status')).toHaveTextContent(TEXTOS_DESBLOQUEO.anuncio)
    await avanzar(D.demoraReducidaMs - 2)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(2)
    expect(ir).toHaveBeenCalledExactlyOnceWith(URL_PANEL)
    expect(D.demoraReducidaMs).toBeLessThan(D.duracionTotalMs)
  })
})
