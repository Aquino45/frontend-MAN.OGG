import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONTEO_ANIMADO } from '@/config/constantes'
import { ConteoAnimado } from './ConteoAnimado'

type Avisar = (entradas: { isIntersecting: boolean }[]) => void
let avisar: Avisar | null = null

class ObservadorFalso {
  constructor(alCambiar: Avisar) {
    avisar = alCambiar
  }
  observe() {}
  disconnect() {}
}

function visibleEnPantalla() {
  act(() => {
    avisar?.([{ isIntersecting: true }])
  })
}

// El texto que se ve (el que cuenta) y el que leen los lectores de pantalla
function textos(contenedor: HTMLElement) {
  return {
    visible: contenedor.querySelector('[aria-hidden="true"]')?.textContent,
    accesible: contenedor.querySelector('.solo-lectores')?.textContent,
  }
}

describe('ConteoAnimado', () => {
  beforeEach(() => {
    avisar = null
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('sin observador de pantalla muestra el valor final directo', () => {
    const { container } = render(<ConteoAnimado valor={12} />)
    expect(textos(container)).toEqual({ visible: '12', accesible: '12' })
  })

  it('parte de 0 y no cuenta hasta que entra en pantalla; el texto accesible ya trae el final', () => {
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    const { container } = render(<ConteoAnimado valor={120} />)
    expect(textos(container)).toEqual({ visible: '0', accesible: '120' })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(textos(container).visible).toBe('0')
  })

  it('al entrar en pantalla cuenta hasta el valor en 900 ms o menos, y sale rápido al principio', () => {
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    const { container } = render(<ConteoAnimado valor={100} />)
    visibleEnPantalla()
    act(() => {
      vi.advanceTimersByTime(CONTEO_ANIMADO.duracionMs / 4)
    })
    // ease-out: a un cuarto del tiempo ya pasó de un cuarto del valor
    expect(Number(textos(container).visible)).toBeGreaterThan(25)
    expect(Number(textos(container).visible)).toBeLessThan(100)
    act(() => {
      vi.advanceTimersByTime(CONTEO_ANIMADO.duracionMs)
    })
    expect(textos(container)).toEqual({ visible: '100', accesible: '100' })
    expect(CONTEO_ANIMADO.duracionMs).toBeLessThanOrEqual(900)
  })

  it('cuenta una sola vez: un cambio de valor después se muestra directo', () => {
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    const { container, rerender } = render(<ConteoAnimado valor={50} />)
    visibleEnPantalla()
    act(() => {
      vi.advanceTimersByTime(CONTEO_ANIMADO.duracionMs + 50)
    })
    rerender(<ConteoAnimado valor={80} />)
    expect(textos(container)).toEqual({ visible: '80', accesible: '80' })
  })

  it('con «reducir movimiento» muestra el valor final directo', () => {
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { container } = render(<ConteoAnimado valor={77} />)
    expect(textos(container)).toEqual({ visible: '77', accesible: '77' })
    expect(screen.getByText('77', { selector: '.solo-lectores' })).toBeInTheDocument()
  })
})
