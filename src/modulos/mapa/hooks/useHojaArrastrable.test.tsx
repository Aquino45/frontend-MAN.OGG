import { act, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOJA_ARRASTRE } from '@/config/constantes'
import { useHojaArrastrable } from './useHojaArrastrable'

const ALTO_HOJA_PX = 400

function Hoja({ onCerrar, salePorAbajo = true }: { onCerrar: () => void; salePorAbajo?: boolean }) {
  const { refHoja, propsAsa } = useHojaArrastrable({ onCerrar, salePorAbajo })
  return (
    <aside ref={refHoja} data-testid="hoja">
      <div data-testid="asa" {...propsAsa} />
    </aside>
  )
}

interface Punto {
  y: number
  ms: number
  id?: number
}

// jsdom no pone la hora del evento: se fija para poder medir la velocidad. React toma un
// timeStamp de 0 como «sin hora», así que el reloj simulado arranca lejos de cero.
const INICIO_RELOJ_MS = 1000

function disparar(
  elemento: Element,
  tipo: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel',
  { y, ms, id = 1 }: Punto,
) {
  const evento = createEvent[tipo](elemento, { pointerId: id, clientY: y, button: 0 })
  Object.defineProperty(evento, 'timeStamp', { value: INICIO_RELOJ_MS + ms })
  fireEvent(elemento, evento)
}

function arrastrar(puntos: Punto[]) {
  const asa = screen.getByTestId('asa')
  const [primero, ...resto] = puntos
  disparar(asa, 'pointerDown', primero)
  resto.slice(0, -1).forEach((punto) => disparar(asa, 'pointerMove', punto))
  const ultimo = resto[resto.length - 1]
  disparar(asa, 'pointerMove', ultimo)
  return () => disparar(asa, 'pointerUp', ultimo)
}

describe('useHojaArrastrable', () => {
  beforeEach(() => {
    HTMLElement.prototype.setPointerCapture = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: ALTO_HOJA_PX,
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight')
  })

  it('la hoja sigue al dedo hacia abajo y marca que se está arrastrando', () => {
    render(<Hoja onCerrar={() => {}} />)
    arrastrar([
      { y: 100, ms: 0 },
      { y: 160, ms: 100 },
    ])
    const hoja = screen.getByTestId('hoja')
    expect(hoja.style.transform).toBe('translateY(60px)')
    expect(hoja.dataset.arrastrando).toBe('true')
  })

  it('un toque sin mover no arrastra ni cierra', () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    const soltar = arrastrar([
      { y: 100, ms: 0 },
      { y: 100 + HOJA_ARRASTRE.holguraInicioPx - 1, ms: 10 },
    ])
    soltar()
    const hoja = screen.getByTestId('hoja')
    expect(hoja.dataset.arrastrando).toBeUndefined()
    expect(hoja.style.transform).toBe('')
    expect(alCerrar).not.toHaveBeenCalled()
  })

  it('cierra si baja más del 25 % del alto, aunque vaya despacio', async () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    arrastrar([
      { y: 0, ms: 0 },
      { y: ALTO_HOJA_PX * HOJA_ARRASTRE.fraccionCierre + 10, ms: 3000 },
    ])()
    await waitFor(() => expect(alCerrar).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('hoja').style.transform).toBe('translateY(100%)')
  })

  it('cierra con un empujón rápido aunque baje poco', async () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    arrastrar([
      { y: 0, ms: 0 },
      { y: 40, ms: 100 },
    ])()
    await waitFor(() => expect(alCerrar).toHaveBeenCalledTimes(1))
  })

  it('si baja poco y despacio, vuelve a su lugar y no cierra', async () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    arrastrar([
      { y: 0, ms: 0 },
      { y: 40, ms: 2000 },
    ])()
    const hoja = screen.getByTestId('hoja')
    await waitFor(() => expect(hoja.style.transform).toBe(''))
    expect(hoja.dataset.arrastrando).toBeUndefined()
    expect(hoja.dataset.hoja).toBeUndefined()
    expect(alCerrar).not.toHaveBeenCalled()
  })

  it('hacia arriba se amortigua: se mueve cada vez menos y no pasa del elástico', () => {
    render(<Hoja onCerrar={() => {}} />)
    arrastrar([
      { y: 500, ms: 0 },
      { y: 100, ms: 600 },
    ])
    const subida = Number(
      /translateY\((-?[\d.]+)px\)/.exec(screen.getByTestId('hoja').style.transform)?.[1],
    )
    expect(subida).toBeLessThan(0)
    expect(Math.abs(subida)).toBeLessThan(HOJA_ARRASTRE.elasticoPx)
  })

  it('un segundo dedo se ignora: no mueve la hoja ni la suelta', () => {
    render(<Hoja onCerrar={() => {}} />)
    const asa = screen.getByTestId('asa')
    disparar(asa, 'pointerDown', { y: 0, ms: 0, id: 1 })
    disparar(asa, 'pointerMove', { y: 50, ms: 50, id: 1 })
    disparar(asa, 'pointerDown', { y: 300, ms: 60, id: 2 })
    disparar(asa, 'pointerMove', { y: 380, ms: 70, id: 2 })
    disparar(asa, 'pointerUp', { y: 380, ms: 80, id: 2 })
    expect(screen.getByTestId('hoja').style.transform).toBe('translateY(50px)')
    expect(screen.getByTestId('hoja').dataset.arrastrando).toBe('true')
  })

  it('si el gesto se cancela, la hoja vuelve a su lugar sin cerrar', async () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    const asa = screen.getByTestId('asa')
    disparar(asa, 'pointerDown', { y: 0, ms: 0 })
    disparar(asa, 'pointerMove', { y: 300, ms: 40 })
    disparar(asa, 'pointerCancel', { y: 300, ms: 50 })
    await waitFor(() => expect(screen.getByTestId('hoja').style.transform).toBe(''))
    expect(alCerrar).not.toHaveBeenCalled()
  })

  it('si cerrar solo cambia el contenido, pide cerrar y la hoja vuelve a su lugar', async () => {
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} salePorAbajo={false} />)
    arrastrar([
      { y: 0, ms: 0 },
      { y: 200, ms: 100 },
    ])()
    const hoja = screen.getByTestId('hoja')
    await waitFor(() => expect(hoja.style.transform).toBe(''))
    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('con una transición del CSS, cierra cuando termina y no antes', async () => {
    vi.useFakeTimers()
    const alCerrar = vi.fn()
    render(<Hoja onCerrar={alCerrar} />)
    screen.getByTestId('hoja').style.transitionDuration = '150ms'
    arrastrar([
      { y: 0, ms: 0 },
      { y: 200, ms: 100 },
    ])()
    expect(screen.getByTestId('hoja').dataset.hoja).toBe('cierra')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })
    expect(alCerrar).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })
    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('mientras sale no se la puede volver a agarrar', async () => {
    vi.useFakeTimers()
    render(<Hoja onCerrar={() => {}} />)
    screen.getByTestId('hoja').style.transitionDuration = '150ms'
    arrastrar([
      { y: 0, ms: 0 },
      { y: 200, ms: 100 },
    ])()
    const asa = screen.getByTestId('asa')
    disparar(asa, 'pointerDown', { y: 0, ms: 120, id: 3 })
    disparar(asa, 'pointerMove', { y: 60, ms: 130, id: 3 })
    expect(screen.getByTestId('hoja').style.transform).toBe('translateY(100%)')
  })

  it('si la hoja se desmonta mientras sale, no pide cerrar', async () => {
    vi.useFakeTimers()
    const alCerrar = vi.fn()
    const { unmount } = render(<Hoja onCerrar={alCerrar} />)
    screen.getByTestId('hoja').style.transitionDuration = '150ms'
    arrastrar([
      { y: 0, ms: 0 },
      { y: 200, ms: 100 },
    ])()
    unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(alCerrar).not.toHaveBeenCalled()
  })
})
