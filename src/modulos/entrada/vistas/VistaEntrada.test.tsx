import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { DURACION_SALIDA_ENTRADA_MS, ENTRADA_ALTERNA as E } from '@/config/constantes'
import { VistaEntrada } from './VistaEntrada'

const SIEMPRE_ESTANDAR = () => 0
const SIEMPRE_ALTERNA = () => 0.999
const VISTA_PEDIDA = 'Vista pedida'

// Deja pasar las promesas pendientes (la carga de la variante alterna) sin mover los relojes.
async function dejarCargar() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

// Más de lo que puede tardar la secuencia sin que nadie toque nada
const SECUENCIA_SOLA_MS = 60_000

// Por tramos: React pinta al terminar cada uno, y cada paso de la secuencia programa el siguiente
const avanzarPorPasos = async (totalMs: number, pasoMs = 250) => {
  for (let t = 0; t < totalMs; t += pasoMs) await avanzar(pasoMs)
}

const ilustracion = (contenedor: HTMLElement) =>
  contenedor.ownerDocument.querySelector('.entrada-alterna')

describe('VistaEntrada', () => {
  beforeAll(async () => {
    // La variante alterna se carga con import(): se deja lista para que resuelva sin esperar disco.
    await import('../componentes/EntradaAlterna')
  })
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    window.history.replaceState(null, '', '/')
  })

  it('la entrada estándar muestra la vista pedida de inmediato, con su transición', () => {
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ESTANDAR}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    expect(screen.getByText(VISTA_PEDIDA)).toBeVisible()
    expect(container.querySelector('.entrada--estandar')).not.toBeNull()
    expect(ilustracion(container)).toBeNull()
  })

  it('la alterna dibuja la vista pedida desde el inicio pero la tapa con la ilustración', async () => {
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()
    expect(screen.getByText(VISTA_PEDIDA)).toBeInTheDocument()
    expect(container.querySelector('.entrada--tapada')).not.toBeNull()
    expect(container.querySelector('.entrada--tapada')).toHaveAttribute('inert')
    expect(ilustracion(container)).not.toBeNull()
  })

  it('la ilustración es decorativa: sin texto alternativo y oculta a los lectores de pantalla', async () => {
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()
    expect(ilustracion(container)).toHaveAttribute('aria-hidden', 'true')
    expect(container.ownerDocument.querySelector('.entrada-alterna__imagen')).toHaveAttribute(
      'alt',
      '',
    )
  })

  it('la alterna termina sola, sin tocar nada, y después se ve la vista pedida', async () => {
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()

    await avanzar(E.fraseDesdeMs)
    expect(container.querySelector('.entrada--tapada')).not.toBeNull()
    expect(ilustracion(container)).not.toHaveClass('entrada-alterna--saliendo')

    await avanzarPorPasos(SECUENCIA_SOLA_MS)
    expect(container.querySelector('.entrada--tapada')).toBeNull()
    await avanzar(DURACION_SALIDA_ENTRADA_MS)
    expect(ilustracion(container)).toBeNull()
    expect(screen.getByText(VISTA_PEDIDA)).toBeVisible()
  })

  it('Esc la cierra al instante y deja ver la vista pedida', async () => {
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()
    await avanzar(E.fraseDesdeMs)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.entrada--tapada')).toBeNull()
  })

  it('con movimiento reducido la ilustración se quita sin desvanecerse', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { container } = render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()
    // Sin escribir nada: cada frase espera lo suyo y la elección toma NO
    await avanzarPorPasos(SECUENCIA_SOLA_MS)
    expect(ilustracion(container)).toBeNull()
    expect(container.querySelector('.entrada--tapada')).toBeNull()
  })

  it('la URL es la misma antes, durante y después de la entrada', async () => {
    window.history.replaceState(null, '', '/?sector=1&arbol=S01-A012')
    const antes = window.location.pathname + window.location.search
    render(
      <VistaEntrada aleatorio={SIEMPRE_ALTERNA}>
        <p>{VISTA_PEDIDA}</p>
      </VistaEntrada>,
    )
    await dejarCargar()
    expect(window.location.pathname + window.location.search).toBe(antes)
    await avanzarPorPasos(SECUENCIA_SOLA_MS + DURACION_SALIDA_ENTRADA_MS)
    expect(window.location.pathname + window.location.search).toBe(antes)
  })
})
