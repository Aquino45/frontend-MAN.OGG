import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACCESO_PANEL_RETENCION_MS,
  ACCESO_PANEL_SENAL_DESDE_MS,
  ARBOL_ANIMADO as G,
  FORZAR_ENTRADA,
} from '@/config/constantes'
import { ArbolAnimado } from './ArbolAnimado'

// La cortina se prueba aparte: aquí solo se ve cuándo y con qué dirección se monta
vi.mock('./CortinaDesbloqueo', () => ({
  default: ({ urlPanel, activa }: { urlPanel: string; activa: boolean }) => (
    <p data-testid="cortina" data-activa={activa ? 'si' : undefined}>
      {urlPanel}
    </p>
  ),
}))
const clicEnArbol = vi.hoisted(() => vi.fn())
vi.mock('@/modulos/entrada', () => ({
  useEntradaTerminada: () => true,
  useForzarEntrada: () => ({ clicEnArbol }),
}))

const URL_PANEL = 'https://panel.prueba.invalid/admin/'
const animaciones: { fotogramas: Keyframe[] }[] = []

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

function presionarArbol(contenedor: HTMLElement) {
  const arbol = contenedor.firstElementChild as HTMLElement
  arbol.getBoundingClientRect = () => ({ width: 400 }) as DOMRect
  fireEvent.pointerDown(arbol, { pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 10 })
  return arbol
}

describe('ArbolAnimado: acceso con cortina', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clicEnArbol.mockClear()
    animaciones.length = 0
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    Element.prototype.animate = function (fotogramas) {
      animaciones.push({ fotogramas: fotogramas as Keyframe[] })
      return {
        finished: Promise.resolve(),
        playState: 'running',
        cancel: () => {},
        pause: () => {},
        play: () => {},
        commitStyles: () => {},
        addEventListener: () => {},
      } as unknown as Animation
    }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('la cortina se arma oculta con la señal (1 s) y se activa a los 5 s, con la dirección del panel', async () => {
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} />)
    await avanzar(G.retrasoInicioMs + 10)
    presionarArbol(container)
    await avanzar(ACCESO_PANEL_SENAL_DESDE_MS - 1)
    expect(screen.queryByTestId('cortina')).not.toBeInTheDocument()
    // La cortina se pide con import(): se deja pasar un rato para que cargue
    await avanzar(50)
    expect(screen.getByTestId('cortina')).not.toHaveAttribute('data-activa')
    await avanzar(ACCESO_PANEL_RETENCION_MS - ACCESO_PANEL_SENAL_DESDE_MS - 50)
    expect(screen.getByTestId('cortina')).not.toHaveAttribute('data-activa')
    await avanzar(1)
    expect(screen.getByTestId('cortina')).toHaveAttribute('data-activa', 'si')
    expect(screen.getByTestId('cortina')).toHaveTextContent(URL_PANEL)
  })

  it('soltar antes de los 5 s no monta nada', async () => {
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} />)
    await avanzar(G.retrasoInicioMs + 10)
    presionarArbol(container)
    await avanzar(ACCESO_PANEL_RETENCION_MS - 500)
    expect(screen.getByTestId('cortina')).not.toHaveAttribute('data-activa')
    fireEvent.pointerUp(window, { pointerId: 1 })
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    expect(screen.queryByTestId('cortina')).not.toBeInTheDocument()
  })

  it('sin dirección del panel no pasa nada, ni a los 5 s ni después', async () => {
    const { container } = render(<ArbolAnimado urlPanel={null} />)
    await avanzar(G.retrasoInicioMs + 10)
    presionarArbol(container)
    await avanzar(ACCESO_PANEL_RETENCION_MS * 2)
    expect(screen.queryByTestId('cortina')).not.toBeInTheDocument()
  })

  it('la señal de progreso no existe en un toque corto y sube después del primer segundo', async () => {
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} />)
    await avanzar(G.retrasoInicioMs + 10)
    const antes = animaciones.length
    presionarArbol(container)
    await avanzar(ACCESO_PANEL_SENAL_DESDE_MS - 1)
    const conSenal = (lista: typeof animaciones) =>
      lista.filter(({ fotogramas }) => fotogramas.some((f) => 'clipPath' in f))
    expect(conSenal(animaciones.slice(antes))).toHaveLength(0)
    await avanzar(1)
    expect(conSenal(animaciones.slice(antes))).toHaveLength(1)
  })

  it('con la cortina puesta, el árbol deja de soltar hojas solas', async () => {
    const aleatorio = vi.fn(() => 0.5)
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} aleatorioHojas={aleatorio} />)
    await avanzar(G.retrasoInicioMs + 10)
    presionarArbol(container)
    await avanzar(ACCESO_PANEL_RETENCION_MS)
    const llamadas = aleatorio.mock.calls.length
    await avanzar(G.hojaIntervaloMaxMs * 3)
    expect(aleatorio.mock.calls.length).toBe(llamadas)
  })

  it('un clic simple avisa a la entrada y mantener presionado no', async () => {
    const { container } = render(<ArbolAnimado urlPanel={URL_PANEL} />)
    await avanzar(G.retrasoInicioMs + 10)
    const arbol = presionarArbol(container)
    fireEvent.pointerUp(arbol, { pointerId: 1, pointerType: 'touch' })
    fireEvent.click(arbol)
    expect(clicEnArbol).toHaveBeenCalledOnce()

    clicEnArbol.mockClear()
    presionarArbol(container)
    await avanzar(FORZAR_ENTRADA.clicMaximoMs + 1)
    fireEvent.click(arbol)
    expect(clicEnArbol).not.toHaveBeenCalled()
  })
})
