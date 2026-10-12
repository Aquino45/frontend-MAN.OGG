import { act, fireEvent, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACCESO_PANEL_RETENCION_MS,
  ACCESO_PANEL_SENAL_DESDE_MS,
  ACCESO_PANEL_TOLERANCIA_CELDAS,
} from '@/config/constantes'
import { LADO_REJILLA_ARBOL } from '../lib/dibujoArbol'
import { useAccesoAlPanel } from './useAccesoAlPanel'

const URL_PANEL = 'https://panel.prueba.invalid/admin/'
const ANCHO_ARBOL_PX = 400
const CELDA_PX = ANCHO_ARBOL_PX / LADO_REJILLA_ARBOL

function Prueba({ urlPanel, alEmpezar }: { urlPanel: string | null; alEmpezar?: () => void }) {
  const referencia = useRef<HTMLDivElement>(null)
  const acceso = useAccesoAlPanel(referencia, { urlPanel, alEmpezar })
  return (
    <div
      ref={referencia}
      data-testid="arbol"
      data-reteniendo={acceso.reteniendo}
      data-senal={acceso.senal}
      data-desbloqueado={acceso.desbloqueado}
      data-url={acceso.urlPanel ?? ''}
    >
      <button type="button" onClick={acceso.reiniciar}>
        reiniciar
      </button>
    </div>
  )
}

function montar(urlPanel: string | null = URL_PANEL, alEmpezar?: () => void) {
  const vista = render(<Prueba urlPanel={urlPanel} alEmpezar={alEmpezar} />)
  const arbol = vista.getByTestId('arbol')
  arbol.getBoundingClientRect = () => ({ width: ANCHO_ARBOL_PX }) as DOMRect
  return { arbol, ...vista }
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

const desbloqueado = (arbol: Element) => arbol.getAttribute('data-desbloqueado') === 'true'

describe('useAccesoAlPanel', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('la retención son 5 segundos', () => {
    expect(ACCESO_PANEL_RETENCION_MS).toBe(5000)
  })

  it('mantener presionado el tiempo completo desbloquea, y no un instante antes', async () => {
    const { arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS - 1)
    expect(desbloqueado(arbol)).toBe(false)
    expect(arbol).toHaveAttribute('data-reteniendo', 'true')
    await avanzar(1)
    expect(desbloqueado(arbol)).toBe(true)
    expect(arbol).toHaveAttribute('data-reteniendo', 'false')
    expect(arbol).toHaveAttribute('data-url', URL_PANEL)
  })

  it('soltar antes de tiempo cancela', async () => {
    const { arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS - 1000)
    fireEvent.pointerUp(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('una vez desbloqueado, soltar o salir ya no cancela nada', async () => {
    const { arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    fireEvent.pointerUp(window, { pointerId: 1 })
    fireEvent.pointerLeave(arbol)
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 900, clientY: 900 })
    window.dispatchEvent(new Event('blur'))
    expect(desbloqueado(arbol)).toBe(true)
    expect(arbol).toHaveAttribute('data-senal', 'true')
  })

  it('salir del árbol o cancelar el gesto cancela', async () => {
    const { arbol } = montar()
    presionar(arbol)
    fireEvent.pointerLeave(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
    presionar(arbol)
    fireEvent.pointerCancel(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('moverse un poco no cancela', async () => {
    const { arbol } = montar()
    presionar(arbol)
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 100 + CELDA_PX, clientY: 100 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(true)
  })

  it('moverse más de unas celdas cancela', async () => {
    const { arbol } = montar()
    presionar(arbol)
    const lejos = CELDA_PX * ACCESO_PANEL_TOLERANCIA_CELDAS + 2
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 100 + lejos })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('un segundo dedo anula la pulsación', async () => {
    const { arbol } = montar()
    presionar(arbol)
    presionar(arbol, { pointerId: 2 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('con otro botón del ratón no cuenta', async () => {
    const { arbol } = montar()
    presionar(arbol, { pointerType: 'mouse', button: 2 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('al ocultarse la pestaña cancela', async () => {
    const { arbol } = montar()
    presionar(arbol)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(false)
  })

  it('sin dirección del panel no hace nada: ni retiene, ni señal, ni desbloquea', async () => {
    const alEmpezar = vi.fn()
    const { arbol } = montar(null, alEmpezar)
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(arbol).toHaveAttribute('data-reteniendo', 'false')
    expect(arbol).toHaveAttribute('data-senal', 'false')
    expect(desbloqueado(arbol)).toBe(false)
    expect(alEmpezar).not.toHaveBeenCalled()
  })

  it('al empezar a presionar avisa una vez (para ir pidiendo el código de la cortina)', () => {
    const alEmpezar = vi.fn()
    const { arbol } = montar(URL_PANEL, alEmpezar)
    presionar(arbol)
    expect(alEmpezar).toHaveBeenCalledOnce()
    presionar(arbol, { pointerId: 2 })
    expect(alEmpezar).toHaveBeenCalledOnce()
  })

  it('la señal de progreso empieza al cumplirse 1 s de presión: un toque casual no la ve', async () => {
    const { arbol } = montar()
    presionar(arbol)
    expect(arbol).toHaveAttribute('data-senal', 'false')
    await avanzar(ACCESO_PANEL_SENAL_DESDE_MS - 1)
    expect(arbol).toHaveAttribute('data-senal', 'false')
    await avanzar(1)
    expect(arbol).toHaveAttribute('data-senal', 'true')
    fireEvent.pointerUp(window, { pointerId: 1 })
    expect(arbol).toHaveAttribute('data-senal', 'false')
  })

  it('un toque corto nunca llega a mostrar la señal', async () => {
    const { arbol } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_SENAL_DESDE_MS - 200)
    fireEvent.pointerUp(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(arbol).toHaveAttribute('data-senal', 'false')
  })

  it('reiniciar quita el desbloqueo y deja volver a intentarlo', async () => {
    const { arbol, getByText } = montar()
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(true)
    fireEvent.click(getByText('reiniciar'))
    expect(desbloqueado(arbol)).toBe(false)
    expect(arbol).toHaveAttribute('data-senal', 'false')
    presionar(arbol)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(desbloqueado(arbol)).toBe(true)
  })
})
