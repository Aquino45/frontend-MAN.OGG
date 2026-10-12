import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CORTINA_CURVA, CORTINA_HOJAS as C } from '@/config/constantes'
import { CortinaDeHojas } from './CortinaDeHojas'

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

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

describe('CortinaDeHojas', () => {
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

  it('va en el cuerpo de la página, sobre todo lo demás, y no más hojas que el tope', () => {
    const { baseElement } = render(<CortinaDeHojas activa />)
    expect(baseElement.querySelector('.cortina-hojas')?.parentElement).toBe(document.body)
    const hojas = baseElement.querySelectorAll('[data-hoja]')
    expect(hojas.length).toBeGreaterThan(0)
    expect(hojas.length).toBeLessThanOrEqual(C.hojasMax)
  })

  it('las hojas y el fondo son adorno; lo que va encima queda fuera de lo oculto', () => {
    const { baseElement, getByText } = render(
      <CortinaDeHojas activa>
        <p>encima</p>
      </CortinaDeHojas>,
    )
    const decoracion = baseElement.querySelector('.cortina-hojas__decoracion')
    expect(decoracion).toHaveAttribute('aria-hidden', 'true')
    expect(decoracion).toContainElement(baseElement.querySelector('[data-fondo]'))
    expect(decoracion).not.toContainElement(getByText('encima'))
  })

  it('cada hoja cae en diagonal hacia la derecha con la curva de salida, solo con transform y opacity', () => {
    render(<CortinaDeHojas activa />)
    const deHojas = llamadas.filter(({ elemento }) => elemento.hasAttribute('data-hoja'))
    expect(deHojas.length).toBeGreaterThan(0)
    for (const { fotogramas, opciones } of llamadas) {
      expect(opciones.easing).toBe(`cubic-bezier(${CORTINA_CURVA.join(', ')})`)
      for (const fotograma of fotogramas) {
        for (const propiedad of Object.keys(fotograma).filter((clave) => clave !== 'offset')) {
          expect(['transform', 'opacity']).toContain(propiedad)
        }
        expect(String(fotograma.transform ?? '')).not.toMatch(/rotate|scale|skew/)
      }
    }
    for (const { fotogramas, opciones } of deHojas) {
      expect(opciones.duration).toBe(C.caidaHojaMs)
      expect(Number(opciones.delay)).toBeLessThanOrEqual(C.retrasoMaximoHojaMs)
      // Empieza arriba y a la izquierda: baja y se corre hacia la derecha
      const [x, y] = String(fotogramas[0].transform)
        .match(/-?\d+(\.\d+)?/g)!
        .map(Number)
      expect(y).toBeLessThan(0)
      expect(x).toBeLessThan(0)
      expect(fotogramas[0].opacity).toBe(0)
    }
  })

  it('el fondo entra a su hora y la ola va de izquierda a derecha', () => {
    const { baseElement } = render(<CortinaDeHojas activa />)
    const fondo = llamadas.find(
      ({ elemento }) => elemento === baseElement.querySelector('[data-fondo]'),
    )
    expect(fondo?.opciones.delay).toBe(C.fondoRetrasoMs)
    expect(fondo?.opciones.duration).toBe(C.fondoDuracionMs)
    const hojas = [...baseElement.querySelectorAll<SVGElement>('[data-hoja]')]
    const retraso = (hoja: SVGElement) =>
      Number(llamadas.find(({ elemento }) => elemento === hoja)?.opciones.delay)
    const izquierda = hojas.filter((hoja) => parseFloat(hoja.style.left) === 0)
    const derecha = hojas.filter((hoja) => parseFloat(hoja.style.left) > 1000)
    expect(Math.max(...izquierda.map(retraso))).toBeLessThan(Math.max(...derecha.map(retraso)) + 1)
    expect(C.retrasoMaximoHojaMs + C.caidaHojaMs).toBeLessThanOrEqual(C.cubrirMs)
    expect(C.fondoRetrasoMs + C.fondoDuracionMs).toBeLessThanOrEqual(C.cubrirMs)
  })

  it('avisa una sola vez cuando ya cubre, a su hora y no antes', async () => {
    const alCubrir = vi.fn()
    render(<CortinaDeHojas activa alCubrir={alCubrir} />)
    await avanzar(C.cubrirMs - 1)
    expect(alCubrir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(alCubrir).toHaveBeenCalledOnce()
    await avanzar(C.cubrirMs * 2)
    expect(alCubrir).toHaveBeenCalledOnce()
  })

  it('una función nueva en cada render no reinicia la animación', async () => {
    const alCubrir = vi.fn()
    const { rerender } = render(<CortinaDeHojas activa alCubrir={() => alCubrir()} />)
    const antes = llamadas.length
    await avanzar(C.cubrirMs / 2)
    rerender(<CortinaDeHojas activa alCubrir={() => alCubrir()} />)
    expect(llamadas).toHaveLength(antes)
    await avanzar(C.cubrirMs / 2)
    expect(alCubrir).toHaveBeenCalledOnce()
  })

  it('montada sin activar queda oculta, sin animar y sin avisar', async () => {
    const alCubrir = vi.fn()
    const { baseElement } = render(<CortinaDeHojas activa={false} alCubrir={alCubrir} />)
    await avanzar(C.cubrirMs * 2)
    expect(llamadas).toHaveLength(0)
    expect(alCubrir).not.toHaveBeenCalled()
    expect(baseElement.querySelector('.cortina-hojas')).not.toHaveAttribute('data-activa')
    expect(baseElement.querySelectorAll('[data-hoja]').length).toBeGreaterThan(0)
  })

  it('al activarse empieza a animar y a contar desde ese momento', async () => {
    const alCubrir = vi.fn()
    const { rerender } = render(<CortinaDeHojas activa={false} alCubrir={alCubrir} />)
    await avanzar(C.cubrirMs * 3)
    rerender(<CortinaDeHojas activa alCubrir={alCubrir} />)
    expect(llamadas.length).toBeGreaterThan(0)
    await avanzar(C.cubrirMs - 1)
    expect(alCubrir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(alCubrir).toHaveBeenCalledOnce()
  })

  it('al retirarse se desvanece con la curva de salida', () => {
    const { rerender, baseElement } = render(<CortinaDeHojas activa />)
    llamadas.length = 0
    rerender(<CortinaDeHojas activa retirada />)
    const salida = llamadas.find(
      ({ elemento }) => elemento === baseElement.querySelector('.cortina-hojas'),
    )
    expect(salida?.fotogramas).toEqual([{ opacity: 1 }, { opacity: 0 }])
    expect(salida?.opciones.duration).toBe(C.retiradaMs)
    expect(salida?.opciones.easing).toBe(`cubic-bezier(${CORTINA_CURVA.join(', ')})`)
  })

  it('si se desmonta a medias, cancela sus animaciones y no avisa', async () => {
    const alCubrir = vi.fn()
    const { unmount } = render(<CortinaDeHojas activa alCubrir={alCubrir} />)
    await avanzar(C.cubrirMs / 2)
    unmount()
    await avanzar(C.cubrirMs)
    expect(alCubrir).not.toHaveBeenCalled()
    for (const { cancelar } of llamadas) expect(cancelar).toHaveBeenCalled()
  })
})

describe('CortinaDeHojas con «reducir movimiento»', () => {
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

  it('no crea ninguna animación (ni la de retirarse) y cubre al instante', async () => {
    const alCubrir = vi.fn()
    const { baseElement, rerender } = render(<CortinaDeHojas activa alCubrir={alCubrir} />)
    rerender(<CortinaDeHojas activa retirada alCubrir={alCubrir} />)
    expect(llamadas).toHaveLength(0)
    expect(baseElement.querySelector('.cortina-hojas')).toHaveAttribute('data-reducido', 'si')
    await avanzar(1)
    expect(alCubrir).toHaveBeenCalledOnce()
  })
})
