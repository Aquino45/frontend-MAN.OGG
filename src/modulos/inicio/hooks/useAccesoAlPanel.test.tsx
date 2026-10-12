import { act, fireEvent, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESO_PANEL_RETENCION_MS, ACCESO_PANEL_TOLERANCIA_CELDAS } from '@/config/constantes'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'
import { useAccesoAlPanel } from './useAccesoAlPanel'

const URL_PANEL = 'https://panel.prueba.invalid/admin/'
const ANCHO_ARBOL_PX = 400
const CELDA_PX = ANCHO_ARBOL_PX / LADO_REJILLA_ARBOL

function Prueba({ urlPanel, ir }: { urlPanel: string | null; ir: (direccion: string) => void }) {
  const referencia = useRef<HTMLDivElement>(null)
  const reteniendo = useAccesoAlPanel(referencia, { urlPanel, ir })
  return <div ref={referencia} data-testid="arbol" data-reteniendo={reteniendo} />
}

function montar(urlPanel: string | null = URL_PANEL) {
  const ir = vi.fn()
  const vista = render(<Prueba urlPanel={urlPanel} ir={ir} />)
  const arbol = vista.getByTestId('arbol')
  arbol.getBoundingClientRect = () => ({ width: ANCHO_ARBOL_PX }) as DOMRect
  return { ir, arbol }
}

const presionar = (arbol: Element, opciones: PointerEventInit = {}) =>
  fireEvent.pointerDown(arbol, {
    pointerId: 1,
    pointerType: 'touch',
    clientX: 100,
    clientY: 100,
    ...opciones,
  })

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

describe('useAccesoAlPanel', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('mantener presionado el tiempo completo lleva al panel, una sola vez', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS - 1)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(1)
    expect(ir).toHaveBeenCalledExactlyOnceWith(URL_PANEL)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).toHaveBeenCalledOnce()
  })

  it('soltar antes de tiempo cancela', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS - 1000)
    fireEvent.pointerUp(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('salir del árbol o cancelar el gesto cancela', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    fireEvent.pointerLeave(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    presionar(arbol)
    fireEvent.pointerCancel(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('moverse más de unas celdas cancela; moverse un poco, no', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 100 + CELDA_PX, clientY: 100 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).toHaveBeenCalledOnce()

    ir.mockClear()
    presionar(arbol)
    const lejos = CELDA_PX * ACCESO_PANEL_TOLERANCIA_CELDAS + 2
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 100 + lejos })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('un segundo dedo anula la pulsación', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    presionar(arbol, { pointerId: 2 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('con otro botón del ratón no cuenta', async () => {
    const { ir, arbol } = montar()
    presionar(arbol, { pointerType: 'mouse', button: 2 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('al ocultarse la pestaña cancela', async () => {
    const { ir, arbol } = montar()
    presionar(arbol)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('sin dirección del panel no hace nada ni marca la retención', async () => {
    const { ir, arbol } = montar(null)
    presionar(arbol)
    expect(arbol).toHaveAttribute('data-reteniendo', 'false')
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(ir).not.toHaveBeenCalled()
  })

  it('mientras se mantiene presionado avisa que está retenido, y deja de avisar al soltar', () => {
    const { arbol } = montar()
    presionar(arbol)
    expect(arbol).toHaveAttribute('data-reteniendo', 'true')
    fireEvent.pointerUp(window, { pointerId: 1 })
    expect(arbol).toHaveAttribute('data-reteniendo', 'false')
  })
})
