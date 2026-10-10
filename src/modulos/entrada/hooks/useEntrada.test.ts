import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PESOS_ENTRADA } from '@/config/constantes'
import { useEntrada } from './useEntrada'

const TOTAL = PESOS_ENTRADA.estandar + PESOS_ENTRADA.alterna
// Primer valor del azar que ya cae en la variante alterna (los pesos las reparten en orden)
const BORDE = PESOS_ENTRADA.estandar / TOTAL

describe('useEntrada', () => {
  it('con el azar en 0 sale la entrada estándar y ya está terminada', () => {
    const { result } = renderHook(() => useEntrada(() => 0))
    expect(result.current.variante).toBe('estandar')
    expect(result.current.terminada).toBe(true)
  })

  it('con el azar en 0.999 sale la alterna y empieza sin terminar', () => {
    const { result } = renderHook(() => useEntrada(() => 0.999))
    expect(result.current.variante).toBe('alterna')
    expect(result.current.terminada).toBe(false)
  })

  it('en el borde entre las dos variantes: justo debajo es estándar, justo en él es alterna', () => {
    const justoDebajo = renderHook(() => useEntrada(() => BORDE - Number.EPSILON))
    expect(justoDebajo.result.current.variante).toBe('estandar')
    const enElBorde = renderHook(() => useEntrada(() => BORDE))
    expect(enElBorde.result.current.variante).toBe('alterna')
  })

  it('sortea una sola vez por montaje, aunque la vista se vuelva a dibujar', () => {
    const azar = vi.fn(() => 0.999)
    const { result, rerender } = renderHook(() => useEntrada(azar))
    rerender()
    rerender()
    expect(azar).toHaveBeenCalledTimes(1)
    expect(result.current.variante).toBe('alterna')
  })

  it('un montaje nuevo vuelve a sortear', () => {
    const azar = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.999)
    const primero = renderHook(() => useEntrada(azar))
    const segundo = renderHook(() => useEntrada(azar))
    expect(primero.result.current.variante).toBe('estandar')
    expect(segundo.result.current.variante).toBe('alterna')
  })

  it('terminar marca la entrada alterna como terminada', () => {
    const { result } = renderHook(() => useEntrada(() => 0.999))
    act(() => result.current.terminar())
    expect(result.current.terminada).toBe(true)
    expect(result.current.variante).toBe('alterna')
  })

  it('caerAEstandar cambia a la entrada estándar y la da por terminada', () => {
    const { result } = renderHook(() => useEntrada(() => 0.999))
    act(() => result.current.caerAEstandar())
    expect(result.current.variante).toBe('estandar')
    expect(result.current.terminada).toBe(true)
  })

  it('no guarda nada en el navegador', () => {
    const guardar = vi.spyOn(Storage.prototype, 'setItem')
    renderHook(() => useEntrada(() => 0.999))
    expect(guardar).not.toHaveBeenCalled()
    guardar.mockRestore()
  })
})
