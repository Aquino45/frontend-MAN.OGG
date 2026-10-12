import { act, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ATRIBUTO_MODALIDAD_ENTRADA, MODALIDADES_ENTRADA } from '@/config/constantes'
import { ProveedorTransicionDePagina } from './ProveedorTransicionDePagina'
import { useEnlaceConTransicion } from './useEnlaceConTransicion'

function Enlaces() {
  const alHacerClic = useEnlaceConTransicion()
  const { pathname, search } = useLocation()
  return (
    <>
      <p data-testid="donde">{pathname + search}</p>
      <Link to="/otra" onClick={alHacerClic}>
        otra página
      </Link>
      <Link to="/inicio?x=1" onClick={alHacerClic}>
        misma página
      </Link>
      <a href="https://ejemplo.org/otra" onClick={alHacerClic}>
        externo
      </a>
    </>
  )
}

function montar() {
  return render(
    <MemoryRouter initialEntries={['/inicio']}>
      <ProveedorTransicionDePagina>
        <Enlaces />
      </ProveedorTransicionDePagina>
    </MemoryRouter>,
  )
}

function simularSoporte() {
  const startViewTransition = vi.fn((actualizar: () => Promise<void>) => ({
    finished: Promise.resolve().then(actualizar),
  }))
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: startViewTransition,
  })
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  return startViewTransition
}

const donde = () => screen.getByTestId('donde').textContent

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition')
  document.documentElement.removeAttribute(ATRIBUTO_MODALIDAD_ENTRADA)
  vi.unstubAllGlobals()
})

describe('enlaces con transición', () => {
  it('un clic simple a otra página navega dentro de una transición', async () => {
    const startViewTransition = simularSoporte()
    montar()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'otra página' }))
    })
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(donde()).toBe('/otra')
  })

  it('sin soporte el enlace navega como siempre', async () => {
    montar()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'otra página' }))
    })
    expect(donde()).toBe('/otra')
  })

  it('con teclado o con «reducir movimiento» no abre transición pero navega', async () => {
    const startViewTransition = simularSoporte()
    document.documentElement.setAttribute(ATRIBUTO_MODALIDAD_ENTRADA, MODALIDADES_ENTRADA.teclado)
    montar()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'otra página' }))
    })
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(donde()).toBe('/otra')
  })

  it('un cambio dentro de la misma página no abre transición', async () => {
    const startViewTransition = simularSoporte()
    montar()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'misma página' }))
    })
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(donde()).toBe('/inicio?x=1')
  })

  it('un clic con Ctrl o con el botón del medio lo maneja el navegador', async () => {
    const startViewTransition = simularSoporte()
    montar()
    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'otra página' }), { ctrlKey: true })
      fireEvent.click(screen.getByRole('link', { name: 'otra página' }), { button: 1 })
    })
    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it('un enlace a otro sitio no se toca', async () => {
    const startViewTransition = simularSoporte()
    montar()
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true })
    await act(async () => {
      screen.getByRole('link', { name: 'externo' }).dispatchEvent(clic)
    })
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(clic.defaultPrevented).toBe(false)
  })

  it('si la página nueva no se dibuja, la transición sigue pasado el tiempo máximo', async () => {
    vi.useFakeTimers()
    try {
      simularSoporte()
      montar()
      await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: 'otra página' }))
        await vi.advanceTimersByTimeAsync(2000)
      })
      expect(donde()).toBe('/otra')
    } finally {
      vi.useRealTimers()
    }
  })
})
