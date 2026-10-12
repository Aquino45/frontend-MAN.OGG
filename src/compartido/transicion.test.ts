import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ATRIBUTO_MODALIDAD_ENTRADA,
  ATRIBUTO_TRANSICION,
  MODALIDADES_ENTRADA,
  TRANSICIONES,
} from '@/config/constantes'
import { puedeTransicionar, transicionar } from './transicion'

const raiz = document.documentElement

function simularSoporte() {
  let terminar: () => void = () => undefined
  const finished = new Promise<void>((resolver) => {
    terminar = resolver
  })
  const startViewTransition = vi.fn((actualizar: () => Promise<void>) => {
    void actualizar()
    return { finished }
  })
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: startViewTransition,
  })
  return { startViewTransition, terminar }
}

function simularReducido(reducido: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: reducido }))
}

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition')
  raiz.removeAttribute(ATRIBUTO_MODALIDAD_ENTRADA)
  raiz.removeAttribute(ATRIBUTO_TRANSICION)
  vi.unstubAllGlobals()
})

describe('puedeTransicionar', () => {
  it('no si el navegador no tiene transiciones', () => {
    simularReducido(false)
    expect(puedeTransicionar()).toBe(false)
  })

  it('sí con soporte y movimiento normal', () => {
    simularSoporte()
    simularReducido(false)
    expect(puedeTransicionar()).toBe(true)
  })

  it('no con «reducir movimiento»', () => {
    simularSoporte()
    simularReducido(true)
    expect(puedeTransicionar()).toBe(false)
  })

  it('no mientras se usa el teclado', () => {
    simularSoporte()
    simularReducido(false)
    raiz.setAttribute(ATRIBUTO_MODALIDAD_ENTRADA, MODALIDADES_ENTRADA.teclado)
    expect(puedeTransicionar()).toBe(false)
  })
})

describe('transicionar', () => {
  it('sin soporte hace el cambio directamente', () => {
    simularReducido(false)
    const actualizar = vi.fn()
    transicionar(actualizar)
    expect(actualizar).toHaveBeenCalledTimes(1)
  })

  it('con soporte lo envuelve en una transición y marca su tipo hasta que termina', async () => {
    const { startViewTransition, terminar } = simularSoporte()
    simularReducido(false)
    const actualizar = vi.fn()
    transicionar(actualizar, TRANSICIONES.tema)
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(actualizar).toHaveBeenCalledTimes(1)
    expect(raiz.getAttribute(ATRIBUTO_TRANSICION)).toBe(TRANSICIONES.tema)
    terminar()
    await Promise.resolve()
    await Promise.resolve()
    expect(raiz.hasAttribute(ATRIBUTO_TRANSICION)).toBe(false)
  })

  it('con «reducir movimiento» no abre ninguna transición pero sí hace el cambio', () => {
    const { startViewTransition } = simularSoporte()
    simularReducido(true)
    const actualizar = vi.fn()
    transicionar(actualizar)
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(actualizar).toHaveBeenCalledTimes(1)
  })
})
