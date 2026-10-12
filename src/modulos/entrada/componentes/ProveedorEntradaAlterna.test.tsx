import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ENTRADA_ALTERNA as E, FORZAR_ENTRADA as F } from '@/config/constantes'
import { useForzarEntrada } from '../hooks/contextoForzarEntrada'
import { marcarGesto, reiniciarGestos } from '../lib/gesto'
import { huellaSha256 } from '../lib/huella'
import { ProveedorEntradaAlterna } from './ProveedorEntradaAlterna'

const SIEMPRE_ESTANDAR = () => 0
const SIEMPRE_ALTERNA = () => 0.9999
// Una palabra de prueba, sin relación con ninguna clave real
const PALABRA_DE_PRUEBA = 'abcdef'

let contextosCreados = 0
class AudioFalso {
  currentTime = 0
  destination = {}
  constructor() {
    contextosCreados += 1
  }
  createGain() {
    return {
      gain: {
        value: 0,
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
        linearRampToValueAtTime() {},
        cancelScheduledValues() {},
      },
      connect() {},
    }
  }
  createOscillator() {
    return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }
  }
  createMediaElementSource() {
    return { connect() {} }
  }
  close() {
    return Promise.resolve()
  }
}

function Controles() {
  const navegar = useNavigate()
  const { pathname, search } = useLocation()
  const { clicEnArbol } = useForzarEntrada()
  return (
    <>
      <output>{pathname + search}</output>
      <button onClick={() => navegar('/mapa')}>ir al mapa</button>
      <button onClick={() => navegar('/mapa?sector=1')}>cambiar consulta</button>
      <button onClick={() => navegar('/arboles', { replace: true })}>reemplazar</button>
      <button onClick={clicEnArbol}>clic en el árbol</button>
    </>
  )
}

async function montar(aleatorio: () => number, huella?: string) {
  const vista = render(
    <MemoryRouter initialEntries={['/']}>
      <ProveedorEntradaAlterna aleatorio={aleatorio} huella={huella}>
        <Controles />
        <p>contenido</p>
      </ProveedorEntradaAlterna>
    </MemoryRouter>,
  )
  // El hash de la clave de prueba y la carga de la variante son asíncronos: se espera lo que haga falta
  return vista
}

const capa = () => document.querySelector('.entrada-alterna')
const teclear = (texto: string) =>
  [...texto].forEach((tecla) => fireEvent.keyDown(window, { key: tecla }))

describe('ProveedorEntradaAlterna: al cambiar de sección', () => {
  beforeAll(async () => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    HTMLMediaElement.prototype.pause = vi.fn()
    // La variante se carga con import(): se deja lista para que resuelva sin esperar disco
    await import('./EntradaAlterna')
  })
  beforeEach(() => {
    contextosCreados = 0
    reiniciarGestos()
    vi.stubGlobal('AudioContext', AudioFalso)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('no sale al cargar la página: eso lo sortea la vista de entrada', async () => {
    await montar(SIEMPRE_ALTERNA)
    await act(async () => {})
    expect(capa()).toBeNull()
  })

  it('con el azar de la alterna, sale al cambiar de sección y deja la sección pedida debajo', async () => {
    await montar(SIEMPRE_ALTERNA)
    fireEvent.click(screen.getByText('ir al mapa'))
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('la dirección es la de la sección pedida antes, durante y después de la secuencia', async () => {
    await montar(SIEMPRE_ALTERNA)
    fireEvent.click(screen.getByText('ir al mapa'))
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(screen.getByRole('status')).toHaveTextContent('/mapa')
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(capa()).toBeNull())
    expect(screen.getByRole('status')).toHaveTextContent('/mapa')
  })

  it('con el azar de siempre, la estándar, no sale nada', async () => {
    await montar(SIEMPRE_ESTANDAR)
    fireEvent.click(screen.getByText('ir al mapa'))
    await act(async () => {})
    expect(capa()).toBeNull()
  })

  it('cada cambio es un sorteo independiente, con los mismos pesos', async () => {
    const azar = vi.fn(() => 0.5)
    await montar(azar)
    fireEvent.click(screen.getByText('ir al mapa'))
    expect(azar).toHaveBeenCalledOnce()
  })

  it('un cambio de consulta (misma sección) no sortea', async () => {
    const azar = vi.fn(() => 0.5)
    await montar(azar)
    fireEvent.click(screen.getByText('ir al mapa'))
    azar.mockClear()
    fireEvent.click(screen.getByText('cambiar consulta'))
    expect(azar).not.toHaveBeenCalled()
  })

  it('una redirección (reemplazo del historial) no sortea', async () => {
    const azar = vi.fn(() => 0.5)
    await montar(azar)
    fireEvent.click(screen.getByText('reemplazar'))
    expect(azar).not.toHaveBeenCalled()
  })

  it('sin gesto previo no suena; con un clic o una tecla recientes, sí', async () => {
    await montar(SIEMPRE_ALTERNA)
    fireEvent.click(screen.getByText('ir al mapa'))
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(contextosCreados).toBe(0)
  })

  it('cuando el cambio vino de un gesto reciente, suena', async () => {
    await montar(SIEMPRE_ALTERNA)
    marcarGesto()
    fireEvent.click(screen.getByText('ir al mapa'))
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(contextosCreados).toBe(1)
  })

  it('un gesto de hace demasiado tiempo ya no cuenta', async () => {
    await montar(SIEMPRE_ALTERNA)
    marcarGesto(performance.now() - E.gestoValidoMs - 100)
    fireEvent.click(screen.getByText('ir al mapa'))
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(contextosCreados).toBe(0)
  })
})

describe('ProveedorEntradaAlterna: forzarla a mano', () => {
  let huella: string
  beforeAll(async () => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    HTMLMediaElement.prototype.pause = vi.fn()
    await import('./EntradaAlterna')
    huella = (await huellaSha256(PALABRA_DE_PRUEBA)) ?? ''
  })
  beforeEach(() => {
    contextosCreados = 0
    reiniciarGestos()
    vi.stubGlobal('AudioContext', AudioFalso)
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('la huella de prueba existe (el navegador de pruebas ofrece crypto.subtle)', () => {
    expect(huella).toMatch(/^[0-9a-f]{64}$/)
  })

  it('un clic y la clave dentro de la ventana la fuerzan, con sonido (la última tecla fue un gesto)', async () => {
    await montar(SIEMPRE_ESTANDAR, huella)
    fireEvent.click(screen.getByText('clic en el árbol'))
    expect(capa()).toBeNull()
    teclear(PALABRA_DE_PRUEBA)
    await waitFor(() => expect(capa()).not.toBeNull())
    expect(contextosCreados).toBe(1)
  })

  it('las mayúsculas, los espacios y las teclas sueltas en el camino no estorban', async () => {
    await montar(SIEMPRE_ESTANDAR, huella)
    fireEvent.click(screen.getByText('clic en el árbol'))
    teclear('ZZ AB')
    fireEvent.keyDown(window, { key: 'Shift' })
    fireEvent.keyDown(window, { key: '7' })
    teclear(' cDe f')
    await waitFor(() => expect(capa()).not.toBeNull())
  })

  it('sin el clic previo no hace nada', async () => {
    await montar(SIEMPRE_ESTANDAR, huella)
    teclear(PALABRA_DE_PRUEBA)
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(capa()).toBeNull()
  })

  it('otra palabra no la fuerza', async () => {
    await montar(SIEMPRE_ESTANDAR, huella)
    fireEvent.click(screen.getByText('clic en el árbol'))
    teclear('abcdeg')
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(capa()).toBeNull()
  })

  it('pasada la ventana de 8 s ya no la fuerza', async () => {
    const ahora = vi.spyOn(performance, 'now')
    ahora.mockReturnValue(1_000)
    await montar(SIEMPRE_ESTANDAR, huella)
    fireEvent.click(screen.getByText('clic en el árbol'))
    ahora.mockReturnValue(1_000 + F.ventanaMs + 1)
    teclear(PALABRA_DE_PRUEBA)
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(capa()).toBeNull()
  })

  it('dentro de la ventana (a 1 ms de cerrarse) todavía la fuerza', async () => {
    const ahora = vi.spyOn(performance, 'now')
    ahora.mockReturnValue(1_000)
    await montar(SIEMPRE_ESTANDAR, huella)
    fireEvent.click(screen.getByText('clic en el árbol'))
    ahora.mockReturnValue(1_000 + F.ventanaMs - 1)
    teclear(PALABRA_DE_PRUEBA)
    await waitFor(() => expect(capa()).not.toBeNull())
  })

  it('la clave se compara por su huella: con la huella real no sale con la palabra de prueba', async () => {
    await montar(SIEMPRE_ESTANDAR)
    fireEvent.click(screen.getByText('clic en el árbol'))
    teclear(PALABRA_DE_PRUEBA)
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 50))
    })
    expect(capa()).toBeNull()
  })
})
