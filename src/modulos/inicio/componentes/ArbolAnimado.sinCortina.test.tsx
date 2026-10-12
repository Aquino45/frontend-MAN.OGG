import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESO_PANEL_RETENCION_MS, ARBOL_ANIMADO as G } from '@/config/constantes'
import { ArbolAnimado } from './ArbolAnimado'

// El chunk de la cortina no llega (red caída)
vi.mock('./CortinaDesbloqueo', () => {
  throw new Error('chunk caído')
})
vi.mock('@/modulos/entrada', () => ({ useEntradaTerminada: () => true }))

const URL_PANEL = 'https://panel.prueba.invalid/admin/'

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

describe('ArbolAnimado: la cortina no carga', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('al cumplirse los 5 s va igual al panel, una sola vez, sin romper la portada', async () => {
    const ir = vi.fn()
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} irAlPanel={ir} />)
    await avanzar(G.retrasoInicioMs + 10)
    const arbol = container.firstElementChild as HTMLElement
    arbol.getBoundingClientRect = () => ({ width: 400 }) as DOMRect
    fireEvent.pointerDown(arbol, { pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 10 })
    await avanzar(ACCESO_PANEL_RETENCION_MS - 100)
    expect(ir).not.toHaveBeenCalled()
    await avanzar(200)
    expect(ir).toHaveBeenCalledTimes(1)
    expect(ir).toHaveBeenCalledWith(URL_PANEL)
  })
})
