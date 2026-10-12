import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CORTINA_CURVA, DESBLOQUEO_ANIMACION as D, TEXTOS_DESBLOQUEO } from '@/config/constantes'
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

function espiarAnimaciones() {
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

const deElemento = (base: HTMLElement, selector: string) =>
  llamadas.filter(({ elemento }) => base.querySelector(selector) === elemento)

describe('CortinaDesbloqueo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    llamadas.length = 0
    simularMovimientoReducido(false)
    espiarAnimaciones()
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

  it('lo dibujado (candado, palabras y línea) es adorno: no se lee dos veces', () => {
    const { baseElement } = montar()
    const escena = baseElement.querySelector('.desbloqueo')
    expect(escena).toHaveAttribute('aria-hidden', 'true')
    expect(escena).toContainElement(baseElement.querySelector('[data-candado]'))
    expect(escena?.textContent).toBe(TEXTOS_DESBLOQUEO.palabras.join(''))
  })

  it('la primera fase es la cortina de hojas: hay hojas cayendo antes que nada de la segunda', () => {
    const { baseElement } = montar()
    expect(baseElement.querySelectorAll('[data-hoja]').length).toBeGreaterThan(0)
    expect(baseElement.querySelector('.cortina-hojas')).toContainElement(
      baseElement.querySelector('.desbloqueo'),
    )
    // La segunda fase empieza cuando la primera ya cubrió
    expect(D.atenuadoRetrasoMs).toBeGreaterThanOrEqual(1_000)
    for (const retraso of [
      D.candadoRetrasoMs,
      D.arcoRetrasoMs,
      D.textoRetrasoMs,
      D.lineaRetrasoMs,
    ]) {
      expect(retraso).toBeGreaterThanOrEqual(D.atenuadoRetrasoMs)
    }
  })

  it('segunda fase en orden: velo, candado, arco que sube, palabras escalonadas y línea', () => {
    const { baseElement } = montar()
    const velo = deElemento(baseElement, '[data-atenuado]')[0]
    const candado = deElemento(baseElement, '[data-candado]')[0]
    const arco = deElemento(baseElement, '[data-arco]')[0]
    const linea = deElemento(baseElement, '[data-linea]')[0]
    expect(velo.opciones.delay).toBe(D.atenuadoRetrasoMs)
    expect(velo.fotogramas[1]).toMatchObject({ opacity: D.atenuadoOpacidad })
    expect(candado.opciones.delay).toBe(D.candadoRetrasoMs)
    expect(arco.opciones.delay).toBe(D.arcoRetrasoMs)
    expect(arco.fotogramas[1]).toMatchObject({ transform: `translateY(${-D.arcoCeldasQueSube}px)` })
    expect(linea.opciones.delay).toBe(D.lineaRetrasoMs)
    expect(linea.fotogramas[0]).toMatchObject({ transform: 'scaleX(0)' })
    expect(Number(candado.opciones.delay)).toBeLessThan(Number(arco.opciones.delay))
    const palabras = [...baseElement.querySelectorAll('[data-palabra]')]
    const retrasos = palabras.map((palabra) =>
      Number(llamadas.find(({ elemento }) => elemento === palabra)?.opciones.delay),
    )
    expect(retrasos).toEqual(palabras.map((_, i) => D.textoRetrasoMs + i * D.textoEscalonadoMs))
  })

  it('nada nace de la nada: candado y palabras entran desde abajo y con opacidad, sin scale(0)', () => {
    const { baseElement } = montar()
    const entradas = [
      ...deElemento(baseElement, '[data-candado]'),
      ...llamadas.filter(({ elemento }) => elemento.hasAttribute('data-palabra')),
    ]
    expect(entradas.length).toBe(1 + TEXTOS_DESBLOQUEO.palabras.length)
    for (const { fotogramas } of entradas) {
      expect(fotogramas[0]).toMatchObject({
        opacity: 0,
        transform: `translateY(${D.textoDesplazamientoPx}px)`,
      })
    }
  })

  it('anima solo transform y opacity y con la curva de salida', () => {
    const { baseElement } = montar()
    const propias = llamadas.filter(({ elemento }) =>
      baseElement.querySelector('.desbloqueo')?.contains(elemento),
    )
    expect(propias.length).toBeGreaterThan(0)
    for (const { fotogramas, opciones } of propias) {
      expect(opciones.easing).toBe(`cubic-bezier(${CORTINA_CURVA.join(', ')})`)
      for (const fotograma of fotogramas) {
        for (const propiedad of Object.keys(fotograma).filter((clave) => clave !== 'offset')) {
          expect(['transform', 'opacity']).toContain(propiedad)
        }
        expect(String(fotograma.transform ?? '')).not.toMatch(/rotate|skew|scale\(0\)\s*$/)
      }
    }
  })

  it('todo termina antes de navegar y dura entre 2 y 2,5 s', () => {
    const ultimaPalabra =
      D.textoRetrasoMs + (TEXTOS_DESBLOQUEO.palabras.length - 1) * D.textoEscalonadoMs
    expect(ultimaPalabra + D.textoDuracionMs).toBeLessThanOrEqual(D.duracionTotalMs)
    expect(D.lineaRetrasoMs + D.lineaDuracionMs).toBeLessThanOrEqual(D.duracionTotalMs)
    expect(D.arcoRetrasoMs + D.arcoDuracionMs).toBeLessThanOrEqual(D.duracionTotalMs)
    expect(D.duracionTotalMs).toBeGreaterThanOrEqual(2_000)
    expect(D.duracionTotalMs).toBeLessThanOrEqual(2_500)
  })

  it('navega una sola vez, a la dirección del panel y no antes de que termine', async () => {
    const { ir } = montar()
    await avanzar(D.duracionTotalMs - 1)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(ir).toHaveBeenCalledExactlyOnceWith(URL_PANEL)
    await avanzar(D.duracionTotalMs * 2)
    expect(ir).toHaveBeenCalledOnce()
  })

  it('si se desmonta antes de tiempo, no navega y cancela sus animaciones', async () => {
    const { ir, unmount } = montar()
    await avanzar(D.duracionTotalMs / 2)
    unmount()
    await avanzar(D.duracionTotalMs)
    expect(ir).not.toHaveBeenCalled()
    for (const { cancelar } of llamadas) expect(cancelar).toHaveBeenCalled()
  })

  it('montada sin activar queda oculta, sin anunciar y sin navegar', async () => {
    const { ir, baseElement } = montar(vi.fn(), false)
    await avanzar(D.duracionTotalMs * 2)
    expect(llamadas).toHaveLength(0)
    expect(ir).not.toHaveBeenCalled()
    expect(baseElement.querySelector('.cortina-hojas')).not.toHaveAttribute('data-activa')
    expect(screen.getByRole('status', { hidden: true })).toBeEmptyDOMElement()
  })

  it('al activarse empieza a contar el tiempo desde ese momento', async () => {
    const ir = vi.fn()
    const { rerender } = render(
      <CortinaDesbloqueo activa={false} urlPanel={URL_PANEL} ir={ir} alQuitar={vi.fn()} />,
    )
    await avanzar(D.duracionTotalMs * 3)
    rerender(<CortinaDesbloqueo activa urlPanel={URL_PANEL} ir={ir} alQuitar={vi.fn()} />)
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
    espiarAnimaciones()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('no crea ninguna animación: candado abierto y texto fijos', () => {
    const { baseElement } = montar()
    expect(llamadas).toHaveLength(0)
    expect(baseElement.querySelector('.cortina-hojas')).toHaveAttribute('data-reducido', 'si')
    const arco = baseElement.querySelector<SVGElement>('[data-arco]')
    expect(arco?.style.transform).toBe(`translateY(${-D.arcoCeldasQueSube}px)`)
  })

  it('anuncia el texto y navega un instante después, sin esperar la animación', async () => {
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
