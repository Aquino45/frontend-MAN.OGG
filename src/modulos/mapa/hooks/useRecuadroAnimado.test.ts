import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRecuadroAnimado } from './useRecuadroAnimado'

const MAPA = { x: 0, y: 0, ancho: 1000, alto: 800 }
const SECTOR = { x: 200, y: 100, ancho: 250, alto: 200 }
const DURACION_MS = 300
const ESPACIO_SVG = 'http://www.w3.org/2000/svg'

function anchoDelViewBox(svg: SVGSVGElement): number {
  return Number(svg.getAttribute('viewBox')?.split(' ')[2])
}

function montar() {
  const svg = document.createElementNS(ESPACIO_SVG, 'svg')
  const referencia = { current: svg }
  let dibujos = 0
  const vista = renderHook(
    ({ objetivo }) => {
      dibujos += 1
      useRecuadroAnimado(referencia, objetivo, MAPA.ancho, DURACION_MS)
    },
    { initialProps: { objetivo: MAPA } },
  )
  return { svg, vista, dibujos: () => dibujos }
}

describe('useRecuadroAnimado', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.documentElement.removeAttribute('data-entrada')
  })

  it('escribe el recuadro inicial al montar, sin animar', () => {
    const { svg } = montar()
    expect(svg.getAttribute('viewBox')).toBe('0 0 1000 800')
    expect(svg.style.getPropertyValue('--escala-zoom')).toBe('1')
  })

  it('llega al nuevo recuadro al terminar la transición y --escala-zoom lo acompaña', () => {
    const { svg, vista } = montar()
    vista.rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(anchoDelViewBox(svg)).toBeLessThan(MAPA.ancho)
    expect(anchoDelViewBox(svg)).toBeGreaterThan(SECTOR.ancho)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(svg.getAttribute('viewBox')).toBe('200 100 250 200')
    expect(svg.style.getPropertyValue('--escala-zoom')).toBe('0.25')
  })

  it('no vuelve a dibujar el componente durante el zoom', () => {
    const { vista, dibujos } = montar()
    vista.rerender({ objetivo: SECTOR })
    const antes = dibujos()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(dibujos()).toBe(antes)
  })

  it('si cambia el objetivo a media transición, sigue desde donde iba', () => {
    const { svg, vista } = montar()
    vista.rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(150)
    })
    const aMedias = anchoDelViewBox(svg)
    vista.rerender({ objetivo: MAPA })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    expect(Math.abs(anchoDelViewBox(svg) - aMedias)).toBeLessThan(120)
  })

  it('con movimiento reducido salta directo al recuadro final', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { svg, vista } = montar()
    vista.rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(svg.getAttribute('viewBox')).toBe('200 100 250 200')
  })

  it('si la acción la disparó el teclado, salta directo al recuadro final', () => {
    const { svg, vista } = montar()
    document.documentElement.setAttribute('data-entrada', 'teclado')
    vista.rerender({ objetivo: SECTOR })
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(svg.getAttribute('viewBox')).toBe('200 100 250 200')
  })
})
