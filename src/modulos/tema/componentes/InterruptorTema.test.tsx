import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ATRIBUTO_TEMA, CLAVE_TEMA_GUARDADO, TEMAS, TEXTOS_TEMA } from '@/config/constantes'
import { aplicarTemaInicial } from '../hooks/useTema'
import { InterruptorTema } from './InterruptorTema'

function simularSistema(prefiereClaro: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: prefiereClaro,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

const temaDeHtml = () => document.documentElement.getAttribute(ATRIBUTO_TEMA)

describe('tema claro y oscuro', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute(ATRIBUTO_TEMA)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('arranca con el tema del sistema', () => {
    simularSistema(true)
    aplicarTemaInicial()
    expect(temaDeHtml()).toBe(TEMAS.claro)

    simularSistema(false)
    aplicarTemaInicial()
    expect(temaDeHtml()).toBe(TEMAS.oscuro)
  })

  it('el interruptor cambia el tema y lo recuerda', () => {
    simularSistema(false)
    render(<InterruptorTema />)
    expect(temaDeHtml()).toBe(TEMAS.oscuro)

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_TEMA.cambiarAClaro }))
    expect(temaDeHtml()).toBe(TEMAS.claro)
    expect(window.localStorage.getItem(CLAVE_TEMA_GUARDADO)).toBe(TEMAS.claro)
    expect(screen.getByRole('button', { name: TEXTOS_TEMA.cambiarAOscuro })).toBeInTheDocument()
  })

  it('la elección guardada manda sobre el sistema', () => {
    simularSistema(false)
    window.localStorage.setItem(CLAVE_TEMA_GUARDADO, TEMAS.claro)
    aplicarTemaInicial()
    expect(temaDeHtml()).toBe(TEMAS.claro)
  })

  it('si localStorage lanza error, sigue con el tema del sistema y el interruptor funciona', () => {
    simularSistema(true)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })

    expect(() => aplicarTemaInicial()).not.toThrow()
    expect(temaDeHtml()).toBe(TEMAS.claro)

    render(<InterruptorTema />)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_TEMA.cambiarAOscuro }))
    expect(temaDeHtml()).toBe(TEMAS.oscuro)
  })

  it('sin matchMedia arranca en oscuro', () => {
    vi.stubGlobal('matchMedia', undefined)
    aplicarTemaInicial()
    expect(temaDeHtml()).toBe(TEMAS.oscuro)
  })
})
