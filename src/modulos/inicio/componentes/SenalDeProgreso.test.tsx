import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACCESO_PANEL_RETENCION_MS,
  ACCESO_PANEL_SENAL_DESDE_MS,
  ACCESO_PANEL_SENAL_OPACIDAD,
  ACCESO_PANEL_SENAL_SALIDA_MS,
  CORTINA_CURVA,
} from '@/config/constantes'
import { SILUETA_ARBOL } from '../lib/siluetaArbol'
import { SenalDeProgreso } from './SenalDeProgreso'

interface Llamada {
  fotogramas: Keyframe[]
  opciones: KeyframeAnimationOptions
  cancelar: ReturnType<typeof vi.fn>
  fijar: ReturnType<typeof vi.fn>
}
const llamadas: Llamada[] = []

function simularMovimientoReducido(reducido: boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: reducido && consulta.includes('prefers-reduced-motion'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

function Prueba({ activa }: { activa: boolean }) {
  return (
    <svg>
      <SenalDeProgreso activa={activa} />
    </svg>
  )
}

describe('SenalDeProgreso', () => {
  beforeEach(() => {
    llamadas.length = 0
    simularMovimientoReducido(false)
    Element.prototype.animate = function (fotogramas, opciones) {
      const cancelar = vi.fn()
      const fijar = vi.fn()
      llamadas.push({
        fotogramas: fotogramas as Keyframe[],
        opciones: opciones as KeyframeAnimationOptions,
        cancelar,
        fijar,
      })
      return { cancel: cancelar, commitStyles: fijar } as unknown as Animation
    }
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('dibuja la silueta del árbol y empieza invisible', () => {
    const { container } = render(<Prueba activa={false} />)
    const trazo = container.querySelector('path')
    expect(trazo).toHaveAttribute('d', SILUETA_ARBOL)
    expect(trazo).toHaveClass('arbol-animado__senal')
    expect(llamadas).toHaveLength(0)
  })

  it('al activarse sube de la base a la copa, lineal, durante lo que falta de la retención', () => {
    const { rerender } = render(<Prueba activa={false} />)
    rerender(<Prueba activa />)
    expect(llamadas).toHaveLength(1)
    const [subida] = llamadas
    expect(subida.opciones.easing).toBe('linear')
    expect(subida.opciones.duration).toBe(ACCESO_PANEL_RETENCION_MS - ACCESO_PANEL_SENAL_DESDE_MS)
    expect(subida.fotogramas[0]).toMatchObject({
      clipPath: 'inset(100% 0 0 0)',
      opacity: ACCESO_PANEL_SENAL_OPACIDAD,
    })
    expect(subida.fotogramas[1]).toMatchObject({ clipPath: 'inset(0 0 0 0)' })
  })

  it('es tenue: queda por debajo del 30 % de opacidad', () => {
    expect(ACCESO_PANEL_SENAL_OPACIDAD).toBeGreaterThan(0)
    expect(ACCESO_PANEL_SENAL_OPACIDAD).toBeLessThanOrEqual(0.3)
  })

  it('al soltar se apaga rápido con ease-out, desde donde iba', () => {
    const { rerender } = render(<Prueba activa />)
    const [subida] = llamadas
    rerender(<Prueba activa={false} />)
    expect(subida.fijar).toHaveBeenCalled()
    expect(subida.cancelar).toHaveBeenCalled()
    const salida = llamadas[1]
    expect(salida.opciones.duration).toBe(ACCESO_PANEL_SENAL_SALIDA_MS)
    expect(salida.opciones.easing).toBe(`cubic-bezier(${CORTINA_CURVA.join(', ')})`)
    expect(salida.fotogramas.at(-1)).toMatchObject({ opacity: 0 })
    // Apagar es más rápido que subir
    expect(Number(salida.opciones.duration)).toBeLessThan(Number(subida.opciones.duration))
  })

  it('solo anima clip-path y opacity', () => {
    const { rerender } = render(<Prueba activa />)
    rerender(<Prueba activa={false} />)
    for (const { fotogramas } of llamadas) {
      for (const fotograma of fotogramas) {
        for (const clave of Object.keys(fotograma).filter((c) => c !== 'offset')) {
          expect(['clipPath', 'opacity']).toContain(clave)
        }
      }
    }
  })

  it('con «reducir movimiento» no crea ninguna animación', () => {
    simularMovimientoReducido(true)
    const { rerender } = render(<Prueba activa={false} />)
    rerender(<Prueba activa />)
    rerender(<Prueba activa={false} />)
    expect(llamadas).toHaveLength(0)
  })

  it('si nunca se activó, no apaga nada (un toque casual no deja rastro)', () => {
    const { unmount } = render(<Prueba activa={false} />)
    unmount()
    expect(llamadas).toHaveLength(0)
  })
})
