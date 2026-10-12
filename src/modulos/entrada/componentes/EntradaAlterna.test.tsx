import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CORTINA_HOJAS,
  DURACION_ENTRADA_ALTERNA_MS,
  DURACION_ENTRADA_ALTERNA_REDUCIDA_MS,
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  ENTRADA_ALTERNA as E,
  TEXTOS_ENTRADA_ALTERNA as T,
} from '@/config/constantes'
import { cantidadDeHojasGrandes } from '../lib/hojasGrandes'
import { EntradaAlterna } from './EntradaAlterna'

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

const capa = () => document.querySelector('.entrada-alterna')
const hojas = () => document.querySelectorAll('.entrada-alterna__hoja')
const textoEscrito = () =>
  document.querySelector('.entrada-alterna__frase span:first-child')?.textContent ?? ''

let osciladores = 0
let contextosCreados = 0
let animaciones = 0

function simularMovimientoReducido(reducido: boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: reducido && consulta.includes('prefers-reduced-motion'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

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
    osciladores += 1
    return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }
  }
  createMediaElementSource() {
    return { connect() {} }
  }
  close() {
    return Promise.resolve()
  }
}

function montar(propiedades: Partial<Parameters<typeof EntradaAlterna>[0]> = {}) {
  const onTerminar = vi.fn()
  const alCerrar = vi.fn()
  const vista = render(
    <EntradaAlterna
      onTerminar={onTerminar}
      alCerrar={alCerrar}
      aleatorio={() => 0.5}
      {...propiedades}
    />,
  )
  return { onTerminar, alCerrar, ...vista }
}

describe('EntradaAlterna', () => {
  beforeAll(() => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    HTMLMediaElement.prototype.pause = vi.fn()
  })
  beforeEach(() => {
    vi.useFakeTimers()
    osciladores = 0
    contextosCreados = 0
    animaciones = 0
    simularMovimientoReducido(false)
    vi.stubGlobal('AudioContext', AudioFalso)
    Element.prototype.animate = function () {
      animaciones += 1
      return { cancel: () => {} } as unknown as Animation
    }
    window.innerWidth = 1440
    window.innerHeight = 900
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('empieza con la cortina de hojas y la capa oculta hasta que ya cubre', async () => {
    montar()
    expect(document.querySelector('.cortina-hojas')).toHaveAttribute('data-activa', 'si')
    expect(capa()).not.toHaveClass('entrada-alterna--cubierta')
    await avanzar(E.ilustracionDesdeMs - 1)
    expect(capa()).not.toHaveClass('entrada-alterna--cubierta')
    await avanzar(1)
    expect(capa()).toHaveClass('entrada-alterna--cubierta')
    expect(E.ilustracionDesdeMs).toBe(CORTINA_HOJAS.cubrirMs)
  })

  it('la ilustración es adorno y la capa entera va oculta a los lectores de pantalla', () => {
    montar()
    expect(capa()).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('.entrada-alterna__imagen')).toHaveAttribute('alt', '')
  })

  it('las hojas grandes salen la primera a su hora y luego una cada tanto, hasta el final', async () => {
    montar()
    await avanzar(E.hojaGrandeDesdeMs - 1)
    expect(hojas()).toHaveLength(0)
    await avanzar(1)
    expect(hojas()).toHaveLength(1)
    await avanzar(E.hojaGrandeCadaMs - 1)
    expect(hojas()).toHaveLength(1)
    await avanzar(1)
    expect(hojas()).toHaveLength(2)
    await avanzar(DURACION_ENTRADA_ALTERNA_MS)
    expect(cantidadDeHojasGrandes()).toBe(7)
  })

  it('cada hoja grande cambia un paso respecto de la anterior y ninguna pasa del tope', async () => {
    // Sube, sube, baja, sube; lo que sigue (las posiciones) no importa
    const valores = [0.9, 0.9, 0.1, 0.9]
    let llamada = 0
    montar({ aleatorio: () => valores[llamada++] ?? 0.5 })
    await avanzar(DURACION_ENTRADA_ALTERNA_MS - 1)
    const lados = [...hojas()].map((hoja) => parseFloat((hoja as HTMLElement).style.width))
    const base = 900 * E.hojaGrandeBase
    const factores = lados.map((lado) => Math.round((lado / base) * 10) / 10)
    expect(factores).toEqual([1, 1.1, 1.2, 1.1, 1.2, 1.3, 1.3])
    factores.forEach((factor) => {
      expect(factor).toBeGreaterThanOrEqual(1 - E.hojaGrandeTope)
      expect(factor).toBeLessThanOrEqual(1 + E.hojaGrandeTope)
    })
  })

  it('la caja de diálogo entra a su hora y escribe la primera frase letra por letra', async () => {
    montar()
    await avanzar(E.cajaDesdeMs + 1)
    expect(document.querySelector('.entrada-alterna__caja')).toBeNull()
    await avanzar(E.frase1DesdeMs - E.cajaDesdeMs - 1)
    expect(document.querySelector('.entrada-alterna__caja')).not.toBeNull()
    expect(textoEscrito()).toBe('')
    await avanzar(E.msPorLetra * 5)
    expect(textoEscrito()).toBe(T.frases[0].slice(0, 5))
    await avanzar(E.msPorLetra * T.frases[0].length)
    expect(textoEscrito()).toBe(T.frases[0])
  })

  it('la segunda frase reemplaza a la primera y también se escribe entera', async () => {
    montar()
    // Por pasos: lo que monta cada frase se ve en el cuadro siguiente al de su hora
    await avanzar(E.frase2DesdeMs)
    await avanzar(E.msPorLetra * 3)
    expect(textoEscrito()).toBe(T.frases[1].slice(0, 3))
    await avanzar(E.msPorLetra * T.frases[1].length)
    expect(textoEscrito()).toBe(T.frases[1])
  })

  it('avisa que la vista ya puede verse a los 11,3 s y se quita 1,2 s después, una sola vez', async () => {
    const { onTerminar, alCerrar } = montar()
    await avanzar(DURACION_ENTRADA_ALTERNA_MS - 1)
    expect(onTerminar).not.toHaveBeenCalled()
    await avanzar(1)
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(capa()).toHaveClass('entrada-alterna--saliendo')
    expect(alCerrar).not.toHaveBeenCalled()
    await avanzar(DURACION_SALIDA_ENTRADA_MS)
    expect(capa()).toBeNull()
    expect(alCerrar).toHaveBeenCalledOnce()
    await avanzar(DURACION_ENTRADA_ALTERNA_MS * 2)
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(alCerrar).toHaveBeenCalledOnce()
  })

  it('Esc la cierra al instante con un fundido corto', async () => {
    const { onTerminar, alCerrar } = montar()
    await avanzar(E.frase1DesdeMs)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(capa()).toHaveClass('entrada-alterna--saliendo')
    expect(capa()).toHaveStyle({ animationDuration: `${DURACION_SALIDA_ANTICIPADA_MS}ms` })
    await avanzar(DURACION_SALIDA_ANTICIPADA_MS)
    expect(capa()).toBeNull()
    expect(alCerrar).toHaveBeenCalledOnce()
    // Lo que seguía programado ya no pasa
    await avanzar(DURACION_ENTRADA_ALTERNA_MS)
    expect(onTerminar).toHaveBeenCalledOnce()
  })

  it('un clic sobre la capa también la cierra, y otra tecla no', async () => {
    const { onTerminar } = montar()
    await avanzar(E.ilustracionDesdeMs + 10)
    fireEvent.keyDown(window, { key: 'a' })
    expect(onTerminar).not.toHaveBeenCalled()
    fireEvent.pointerDown(capa()!)
    expect(onTerminar).toHaveBeenCalledOnce()
  })

  it('un clic sobre la cortina, antes de que cubra, también la cierra', async () => {
    const { onTerminar } = montar()
    await avanzar(100)
    fireEvent.pointerDown(document.querySelector('.cortina-hojas')!)
    expect(onTerminar).toHaveBeenCalledOnce()
  })

  it('sin gesto previo no suena: ni se crea el audio', async () => {
    montar({ conSonido: false })
    await avanzar(DURACION_ENTRADA_ALTERNA_MS)
    expect(contextosCreados).toBe(0)
    expect(osciladores).toBe(0)
  })

  it('con gesto previo suena un blip por cada letra visible y no por los espacios', async () => {
    montar({ conSonido: true })
    expect(contextosCreados).toBe(1)
    await avanzar(E.frase1DesdeMs)
    await avanzar(E.msPorLetra * T.frases[0].length)
    await avanzar(E.frase2DesdeMs - E.frase1DesdeMs - E.msPorLetra * T.frases[0].length)
    await avanzar(E.msPorLetra * T.frases[1].length)
    const letras = (frase: string) => frase.replaceAll(' ', '').length
    expect(osciladores).toBe(letras(T.frases[0]) + letras(T.frases[1]))
  })

  it('el audio se suelta al terminar', async () => {
    const cerrar = vi.spyOn(AudioFalso.prototype, 'close')
    montar({ conSonido: true })
    await avanzar(DURACION_ENTRADA_ALTERNA_MS + DURACION_SALIDA_ENTRADA_MS + 10)
    expect(cerrar).toHaveBeenCalled()
  })

  it('sin Web Audio sigue la secuencia en silencio y sin errores', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const { onTerminar } = montar({ conSonido: true })
    await avanzar(DURACION_ENTRADA_ALTERNA_MS)
    expect(onTerminar).toHaveBeenCalledOnce()
  })
})

describe('EntradaAlterna con «reducir movimiento»', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    osciladores = 0
    contextosCreados = 0
    animaciones = 0
    simularMovimientoReducido(true)
    vi.stubGlobal('AudioContext', AudioFalso)
    Element.prototype.animate = function () {
      animaciones += 1
      return { cancel: () => {} } as unknown as Animation
    }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(Element.prototype, 'animate')
  })

  it('sin cortina, hojas, animaciones ni sonido (aunque haya gesto previo)', async () => {
    montar({ conSonido: true })
    await avanzar(DURACION_ENTRADA_ALTERNA_REDUCIDA_MS - 10)
    expect(animaciones).toBe(0)
    expect(contextosCreados).toBe(0)
    expect(document.querySelector('.cortina-hojas')).toBeNull()
    expect(hojas()).toHaveLength(0)
  })

  it('muestra desde el principio el fondo, la ilustración y las dos frases completas', () => {
    montar()
    expect(capa()).toHaveClass('entrada-alterna--cubierta')
    const frases = [...document.querySelectorAll('.entrada-alterna__frase')].map(
      (frase) => frase.textContent,
    )
    expect(frases).toEqual([...T.frases])
    expect(document.querySelector('.entrada-alterna__ilustracion')).toHaveAttribute(
      'data-visible',
      'si',
    )
  })

  it('después de 2 s deja ver la vista pedida, sin fundido', async () => {
    const { onTerminar, alCerrar } = montar()
    await avanzar(DURACION_ENTRADA_ALTERNA_REDUCIDA_MS - 1)
    expect(onTerminar).not.toHaveBeenCalled()
    await avanzar(1)
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(alCerrar).toHaveBeenCalledOnce()
    expect(capa()).toBeNull()
  })

  it('Esc o un clic también la saltan', async () => {
    const { onTerminar } = montar()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(capa()).toBeNull()
  })
})
