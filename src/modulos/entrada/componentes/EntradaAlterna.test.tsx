import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CELEBRACION_ENTRADA as C,
  CORTINA_HOJAS,
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  ENTRADA_ALTERNA as E,
  SONIDO_ENTRADA_ALTERNA as S,
  TEXTOS_ENTRADA_ALTERNA as T,
} from '@/config/constantes'
import { pausaTrasCaracter, suenaCaracter } from '../lib/tipeo'
import { EntradaAlterna } from './EntradaAlterna'

const avanzar = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

// Avanza por tramos cortos: React pinta al terminar cada tramo, así que lo que programa un efecto
// (la espera de cada paso) empieza a correr recién ahí
const avanzarPorPasos = async (totalMs: number, pasoMs = 250) => {
  for (let transcurrido = 0; transcurrido < totalMs; transcurrido += pasoMs) await avanzar(pasoMs)
}

// Lo que tarda en escribirse una frase entera (la pausa después de la última letra no cuenta)
const msDeEscritura = (frase: string) =>
  [...frase].reduce(
    (total, caracter, orden) =>
      total + E.msPorLetra + (orden < frase.length - 1 ? pausaTrasCaracter(caracter) : 0),
    0,
  )

const pulsar = (tecla: string) => fireEvent.keyDown(window, { key: tecla })

const capa = () => document.querySelector('.entrada-alterna')
const hojas = () => document.querySelectorAll('.entrada-alterna__hoja')
const papelPicado = () => document.querySelectorAll('.entrada-alterna__papel')
const indicador = () => document.querySelector('.entrada-alterna__indicador')
const opciones = () => [...document.querySelectorAll('.entrada-alterna__opcion')]
const opcionMarcada = () =>
  opciones()
    .find((opcion) => opcion.getAttribute('data-marcada') === 'si')
    ?.textContent?.trim()
const textoEscrito = () =>
  document.querySelector('.entrada-alterna__frase span:first-child')?.textContent ?? ''
const letrasQueSuenan = (frase: string) => [...frase].filter(suenaCaracter).length

let osciladores = 0
let contextosCreados = 0
let animaciones = 0

function simularPantalla({ reducido = false, punteroFino = true } = {}) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: consulta.includes('prefers-reduced-motion')
      ? reducido
      : consulta.includes('pointer: fine')
        ? punteroFino
        : false,
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
    return {
      type: '',
      frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
      start() {},
      stop() {},
    }
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

// Llega a la pregunta con las opciones a la vista, avanzando a mano (completar y pasar, cada frase)
async function llegarALaEleccion() {
  await avanzar(E.fraseDesdeMs)
  for (let i = 0; i < 2 * T.frases.length - 1; i++) pulsar('Enter')
}

function prepararEntorno() {
  vi.useFakeTimers()
  osciladores = 0
  contextosCreados = 0
  animaciones = 0
  vi.stubGlobal('AudioContext', AudioFalso)
  Element.prototype.animate = function () {
    animaciones += 1
    return { cancel: () => {} } as unknown as Animation
  }
  window.innerWidth = 1440
  window.innerHeight = 900
}

function limpiarEntorno() {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(Element.prototype, 'animate')
}

describe('EntradaAlterna', () => {
  beforeAll(() => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    HTMLMediaElement.prototype.pause = vi.fn()
  })
  beforeEach(() => {
    prepararEntorno()
    simularPantalla()
  })
  afterEach(limpiarEntorno)

  describe('puesta en escena', () => {
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

    it('las hojas grandes salen la primera a su hora y luego una cada tanto, mientras dure', async () => {
      montar()
      await avanzar(E.hojaGrandeDesdeMs - 1)
      expect(hojas()).toHaveLength(0)
      await avanzar(1)
      expect(hojas()).toHaveLength(1)
      await avanzar(E.hojaGrandeCadaMs - 1)
      expect(hojas()).toHaveLength(1)
      await avanzar(1)
      expect(hojas()).toHaveLength(2)
      await avanzar(E.hojaGrandeCadaMs * 4)
      expect(hojas()).toHaveLength(6)
    })

    it('cada hoja grande cambia un paso respecto de la anterior y ninguna pasa del tope', async () => {
      // Sube, sube, baja, sube; lo que sigue (las posiciones) no importa
      const valores = [0.9, 0.9, 0.1, 0.9]
      let llamada = 0
      montar({ aleatorio: () => valores[llamada++] ?? 0.5 })
      await avanzar(E.hojaGrandeDesdeMs + 6 * E.hojaGrandeCadaMs)
      const lados = [...hojas()].map((hoja) => parseFloat((hoja as HTMLElement).style.width))
      const base = 900 * E.hojaGrandeBase
      const factores = lados.map((lado) => Math.round((lado / base) * 10) / 10)
      expect(factores).toEqual([1, 1.1, 1.2, 1.1, 1.2, 1.3, 1.3])
      factores.forEach((factor) => {
        expect(factor).toBeGreaterThanOrEqual(1 - E.hojaGrandeTope)
        expect(factor).toBeLessThanOrEqual(1 + E.hojaGrandeTope)
      })
    })

    it('la caja entra a su hora y la primera frase empieza a escribirse letra por letra después', async () => {
      montar()
      await avanzar(E.cajaDesdeMs - 1)
      expect(document.querySelector('.entrada-alterna__caja')).toBeNull()
      await avanzar(1)
      expect(document.querySelector('.entrada-alterna__caja')).not.toBeNull()
      expect(textoEscrito()).toBe('')
      await avanzar(E.fraseDesdeMs - E.cajaDesdeMs)
      await avanzar(E.msPorLetra * 5)
      expect(textoEscrito()).toBe(T.frases[0].slice(0, 5))
    })

    it('después de una coma el tipeo se detiene un rato más', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      const hastaLaComa = T.frases[0].indexOf(',') + 1
      await avanzar(E.msPorLetra * hastaLaComa)
      expect(textoEscrito()).toBe(T.frases[0].slice(0, hastaLaComa))
      // La siguiente letra tarda su ritmo normal más la pausa de la coma
      await avanzar(E.msPorLetra + S.tipeo.pausaComaMs - 1)
      expect(textoEscrito()).toBe(T.frases[0].slice(0, hastaLaComa))
      await avanzar(1)
      expect(textoEscrito()).toBe(T.frases[0].slice(0, hastaLaComa + 1))
    })
  })

  describe('avanzar a mano', () => {
    it.each([
      ['Enter', () => pulsar('Enter')],
      ['Z', () => pulsar('z')],
      ['espacio', () => pulsar(' ')],
      ['clic', () => fireEvent.pointerDown(capa()!)],
    ])(
      'con %s, mientras se escribe, la frase se completa al instante y se espera',
      async (_n, accion) => {
        montar()
        await avanzar(E.fraseDesdeMs)
        await avanzar(E.msPorLetra * 3)
        expect(textoEscrito()).toBe(T.frases[0].slice(0, 3))
        expect(indicador()).toBeNull()
        accion()
        expect(textoEscrito()).toBe(T.frases[0])
        expect(indicador()).not.toBeNull()
      },
    )

    it.each([
      ['Enter', () => pulsar('Enter')],
      ['Z', () => pulsar('Z')],
      ['espacio', () => pulsar(' ')],
      ['clic', () => fireEvent.pointerDown(capa()!)],
    ])('con %s, ya completa, pasa a escribir la frase siguiente', async (_n, accion) => {
      montar()
      await avanzar(E.fraseDesdeMs)
      accion()
      accion()
      expect(indicador()).toBeNull()
      expect(textoEscrito()).toBe('')
      await avanzar(E.msPorLetra * 4)
      expect(textoEscrito()).toBe(T.frases[1].slice(0, 4))
    })

    it('antes de que empiece la primera frase, avanzar no hace nada', async () => {
      montar()
      await avanzar(E.cajaDesdeMs + 100)
      pulsar('Enter')
      fireEvent.pointerDown(capa()!)
      await avanzar(E.fraseDesdeMs - E.cajaDesdeMs - 100)
      await avanzar(E.msPorLetra * 2)
      expect(textoEscrito()).toBe(T.frases[0].slice(0, 2))
    })

    it('el indicador ▼ parpadea solo cuando la frase espera', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      await avanzar(msDeEscritura(T.frases[0]))
      expect(indicador()).not.toBeNull()
      expect(indicador()).toHaveStyle({ animationDuration: `${E.indicadorParpadeoMs}ms` })
      pulsar('Enter')
      expect(indicador()).toBeNull()
    })

    it('si nadie avanza, la frase pasa sola a los 4 s de escrita (ni antes ni después)', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      await avanzar(msDeEscritura(T.frases[0]))
      expect(textoEscrito()).toBe(T.frases[0])
      await avanzar(E.esperaFraseMs - 1)
      expect(textoEscrito()).toBe(T.frases[0])
      await avanzar(1)
      expect(textoEscrito()).toBe('')
      await avanzar(E.msPorLetra)
      expect(textoEscrito()).toBe(T.frases[1].slice(0, 1))
    })

    it('una tecla que se deja presionada no avanza varias veces', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      pulsar('Enter')
      fireEvent.keyDown(window, { key: 'Enter', repeat: true })
      fireEvent.keyDown(window, { key: 'Enter', repeat: true })
      expect(indicador()).not.toBeNull()
      expect(textoEscrito()).toBe(T.frases[0])
    })

    it('con Ctrl, Cmd o Alt no avanza ni se atrapa la tecla (son atajos del navegador)', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      for (const modificador of ['ctrlKey', 'metaKey', 'altKey']) {
        const evento = new KeyboardEvent('keydown', {
          key: 'z',
          cancelable: true,
          [modificador]: true,
        })
        window.dispatchEvent(evento)
        expect(evento.defaultPrevented).toBe(false)
      }
      expect(indicador()).toBeNull()
    })

    it('el clic derecho o el del medio no avanzan', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      fireEvent.pointerDown(capa()!, { button: 2 })
      fireEvent.pointerDown(capa()!, { button: 1 })
      expect(indicador()).toBeNull()
      fireEvent.pointerDown(capa()!, { button: 0 })
      expect(indicador()).not.toBeNull()
    })

    it('otra tecla no avanza', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      pulsar('q')
      pulsar('Tab')
      expect(textoEscrito()).toBe('')
    })
  })

  describe('la elección', () => {
    it('al escribirse la pregunta salen SÍ y NO, con el corazón en la opción por defecto (NO)', async () => {
      montar()
      await llegarALaEleccion()
      expect(opciones().map((opcion) => opcion.textContent?.trim())).toEqual([...T.opciones])
      expect(opcionMarcada()).toBe('NO')
      expect(document.querySelectorAll('.entrada-alterna__corazon-opcion svg')).toHaveLength(1)
      expect(document.querySelector('.entrada-alterna__opcion[data-marcada] svg')).not.toBeNull()
    })

    it.each([
      ['←', 'ArrowLeft', 'ArrowRight'],
      ['A', 'a', 'd'],
    ])('con %s y su par se mueve la marca entre SÍ y NO', async (_n, izquierda, derecha) => {
      montar()
      await llegarALaEleccion()
      pulsar(izquierda)
      expect(opcionMarcada()).toBe('SÍ')
      pulsar(derecha)
      expect(opcionMarcada()).toBe('NO')
      // En el borde no pasa nada
      pulsar(derecha)
      expect(opcionMarcada()).toBe('NO')
    })

    it('SÍ con teclado: se escribe el cierre, se espera a que avancen y entonces sale', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      pulsar('ArrowLeft')
      pulsar('Enter')
      expect(opciones()).toHaveLength(0)
      expect(textoEscrito()).toBe('')
      await avanzar(E.msPorLetra * T.cierreSi.length)
      expect(textoEscrito()).toBe(T.cierreSi)
      expect(onTerminar).not.toHaveBeenCalled()
      pulsar('z')
      expect(onTerminar).toHaveBeenCalledOnce()
    })

    it('SÍ con clic en la opción: elige esa opción aunque la marcada fuera otra', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      expect(opcionMarcada()).toBe('NO')
      fireEvent.pointerDown(opciones()[T.opcionSi])
      await avanzar(E.msPorLetra * T.cierreSi.length)
      expect(textoEscrito()).toBe(T.cierreSi)
      expect(onTerminar).not.toHaveBeenCalled()
    })

    it('NO con teclado: sale sin decir nada', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      pulsar('Enter')
      expect(onTerminar).toHaveBeenCalledOnce()
      expect(textoEscrito()).toBe(T.frases[T.frases.length - 1])
    })

    it('NO con clic en la opción: sale', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      pulsar('ArrowLeft')
      fireEvent.pointerDown(opciones()[T.opcionPorDefecto])
      expect(onTerminar).toHaveBeenCalledOnce()
    })

    it('el clic en una opción no cuenta además como «avanzar» de la capa', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      fireEvent.pointerDown(opciones()[T.opcionSi])
      // Si hubiera contado dos veces, el cierre ya habría terminado la secuencia
      expect(onTerminar).not.toHaveBeenCalled()
    })

    it('sin respuesta en 9 s se toma NO, aunque la marca esté en SÍ', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      pulsar('ArrowLeft')
      await avanzar(E.esperaEleccionMs - 1)
      expect(onTerminar).not.toHaveBeenCalled()
      await avanzar(1)
      expect(onTerminar).toHaveBeenCalledOnce()
      expect(papelPicado()).toHaveLength(0)
    })

    it('mover la marca reinicia la espera de 9 s', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      await avanzar(E.esperaEleccionMs - 100)
      pulsar('ArrowLeft')
      await avanzar(E.esperaEleccionMs - 1)
      expect(onTerminar).not.toHaveBeenCalled()
      await avanzar(1)
      expect(onTerminar).toHaveBeenCalledOnce()
    })

    it('el cierre de SÍ, si nadie avanza, sale solo a los 4 s', async () => {
      const { onTerminar } = montar()
      await llegarALaEleccion()
      pulsar('ArrowLeft')
      pulsar('Enter')
      await avanzar(msDeEscritura(T.cierreSi))
      await avanzar(E.esperaFraseMs - 1)
      expect(onTerminar).not.toHaveBeenCalled()
      await avanzar(1)
      expect(onTerminar).toHaveBeenCalledOnce()
    })

    it('sin tocar nada la secuencia entera termina sola, por NO', async () => {
      const { onTerminar, alCerrar } = montar()
      await avanzarPorPasos(60_000)
      expect(onTerminar).toHaveBeenCalledOnce()
      await avanzar(DURACION_SALIDA_ENTRADA_MS)
      expect(alCerrar).toHaveBeenCalledOnce()
      expect(capa()).toBeNull()
      expect(papelPicado()).toHaveLength(0)
    })
  })

  describe('la celebración', () => {
    it('elegir SÍ lanza el papel picado; con NO no pasa nada', async () => {
      montar()
      await llegarALaEleccion()
      expect(papelPicado()).toHaveLength(0)
      pulsar('ArrowLeft')
      pulsar('Enter')
      expect(papelPicado()).toHaveLength(C.piezas)
      papelPicado().forEach((pieza) => {
        expect(pieza.className).toMatch(/entrada-alterna__papel--[0-3]/)
      })
    })

    it('elegir NO no lanza nada, ni siquiera un instante', async () => {
      montar()
      await llegarALaEleccion()
      pulsar('Enter')
      expect(papelPicado()).toHaveLength(0)
    })

    it('con gesto previo suena la corneta y los soniditos al elegir SÍ, y no con NO', async () => {
      montar({ conSonido: true })
      await llegarALaEleccion()
      const antes = osciladores
      pulsar('ArrowLeft')
      expect(osciladores).toBe(antes)
      pulsar('Enter')
      expect(osciladores - antes).toBe(1 + S.celebracion.soniditosHz.length)
    })

    it('con NO, el sonido no se agrega', async () => {
      montar({ conSonido: true })
      await llegarALaEleccion()
      const antes = osciladores
      pulsar('Enter')
      expect(osciladores).toBe(antes)
    })
  })

  describe('salida', () => {
    it('Esc la cierra al instante con un fundido corto, en la frase o en la elección', async () => {
      const { onTerminar, alCerrar } = montar()
      await avanzar(E.fraseDesdeMs)
      pulsar('Escape')
      expect(onTerminar).toHaveBeenCalledOnce()
      expect(capa()).toHaveClass('entrada-alterna--saliendo')
      expect(capa()).toHaveStyle({ animationDuration: `${DURACION_SALIDA_ANTICIPADA_MS}ms` })
      await avanzar(DURACION_SALIDA_ANTICIPADA_MS)
      expect(capa()).toBeNull()
      expect(alCerrar).toHaveBeenCalledOnce()
      // Lo que seguía programado ya no pasa
      await avanzar(60_000)
      expect(onTerminar).toHaveBeenCalledOnce()
    })

    it('Esc funciona también antes de la cortina, esperando y en la elección', async () => {
      const antes = montar()
      await avanzar(100)
      pulsar('Escape')
      expect(antes.onTerminar).toHaveBeenCalledOnce()
      antes.unmount()

      const esperando = montar()
      await avanzar(E.fraseDesdeMs + E.msPorLetra * 40)
      pulsar('Escape')
      expect(esperando.onTerminar).toHaveBeenCalledOnce()
      esperando.unmount()

      const eleccion = montar()
      await llegarALaEleccion()
      pulsar('Escape')
      expect(eleccion.onTerminar).toHaveBeenCalledOnce()
    })

    it('un clic ya no cierra: solo avanza', async () => {
      const { onTerminar } = montar()
      await avanzar(E.fraseDesdeMs)
      fireEvent.pointerDown(capa()!)
      expect(onTerminar).not.toHaveBeenCalled()
    })

    it('un clic sobre la cortina, antes de que empiece, no hace nada', async () => {
      const { onTerminar } = montar()
      await avanzar(100)
      fireEvent.pointerDown(document.querySelector('.cortina-hojas')!)
      expect(onTerminar).not.toHaveBeenCalled()
    })

    it('tras salir, las teclas ya no se atrapan', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      pulsar('Escape')
      const evento = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
      window.dispatchEvent(evento)
      expect(evento.defaultPrevented).toBe(false)
    })

    it('Enter que avanza no activa además lo que tenga el foco debajo', async () => {
      montar()
      await avanzar(E.fraseDesdeMs)
      const evento = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
      window.dispatchEvent(evento)
      expect(evento.defaultPrevented).toBe(true)
    })
  })

  describe('cursor propio', () => {
    it('con puntero fino hay un corazón que sigue al puntero y el cursor del sistema se oculta', async () => {
      montar()
      expect(capa()).toHaveClass('entrada-alterna--corazon')
      const cursor = document.querySelector<HTMLElement>('.entrada-alterna__cursor')!
      expect(cursor).not.toBeNull()
      expect(cursor.querySelector('svg')).not.toBeNull()
      expect(cursor).not.toHaveAttribute('data-visible')
      fireEvent(window, new MouseEvent('pointermove', { clientX: 300, clientY: 200 }))
      expect(cursor).toHaveAttribute('data-visible', 'si')
      expect(cursor.style.transform).toBe(
        `translate(${300 - E.cursorLadoPx / 2}px, ${200 - E.cursorLadoPx / 2}px)`,
      )
    })

    it('en táctil (sin puntero fino) no hay cursor propio ni se oculta el del sistema', async () => {
      simularPantalla({ punteroFino: false })
      montar()
      expect(document.querySelector('.entrada-alterna__cursor')).toBeNull()
      expect(capa()).not.toHaveClass('entrada-alterna--corazon')
    })
  })

  describe('sonido', () => {
    it('sin gesto previo no suena: ni se crea el audio', async () => {
      montar({ conSonido: false })
      await avanzar(E.fraseDesdeMs + 5_000)
      expect(contextosCreados).toBe(0)
      expect(osciladores).toBe(0)
    })

    it('con gesto previo suena un tipeo por cada letra y número, y no por espacios ni signos', async () => {
      montar({ conSonido: true })
      expect(contextosCreados).toBe(1)
      await avanzar(E.fraseDesdeMs)
      await avanzar(E.msPorLetra * T.frases[0].length + 400)
      // Cada pulso son dos ondas: la cuadrada y la triangular
      expect(osciladores).toBe(2 * letrasQueSuenan(T.frases[0]))
      expect(letrasQueSuenan(T.frases[0])).toBeLessThan(T.frases[0].length)
    })

    it('al completar una frase con una tecla no suenan las letras que se saltan', async () => {
      montar({ conSonido: true })
      await avanzar(E.fraseDesdeMs + E.msPorLetra * 4)
      const antes = osciladores
      pulsar('Enter')
      await avanzar(1_000)
      expect(osciladores).toBe(antes)
    })

    it('el audio se suelta al terminar', async () => {
      const cerrar = vi.spyOn(AudioFalso.prototype, 'close')
      montar({ conSonido: true })
      pulsar('Escape')
      await avanzar(DURACION_SALIDA_ANTICIPADA_MS + 10)
      expect(cerrar).toHaveBeenCalled()
    })

    it('sin Web Audio sigue la secuencia en silencio y sin errores', async () => {
      vi.stubGlobal('AudioContext', undefined)
      const { onTerminar } = montar({ conSonido: true })
      await llegarALaEleccion()
      pulsar('ArrowLeft')
      pulsar('Enter')
      pulsar('Enter')
      pulsar('Enter')
      expect(onTerminar).toHaveBeenCalledOnce()
    })
  })
})

describe('EntradaAlterna con «reducir movimiento»', () => {
  beforeEach(() => {
    prepararEntorno()
    simularPantalla({ reducido: true })
  })
  afterEach(limpiarEntorno)

  it('sin cortina, hojas, cursor, animaciones ni sonido (aunque haya gesto previo)', async () => {
    montar({ conSonido: true })
    await avanzar(E.fraseDesdeMs)
    expect(animaciones).toBe(0)
    expect(contextosCreados).toBe(0)
    expect(document.querySelector('.cortina-hojas')).toBeNull()
    expect(hojas()).toHaveLength(0)
    expect(document.querySelector('.entrada-alterna__cursor')).toBeNull()
    expect(capa()).not.toHaveClass('entrada-alterna--corazon')
  })

  it('muestra desde el principio el fondo, la ilustración y la primera frase completa', () => {
    montar()
    expect(capa()).toHaveClass('entrada-alterna--cubierta')
    expect(textoEscrito()).toBe(T.frases[0])
    expect(document.querySelector('.entrada-alterna__ilustracion')).toHaveAttribute(
      'data-visible',
      'si',
    )
  })

  it('cada frase sale completa, avanzar sigue funcionando y la elección va con teclado', async () => {
    const { onTerminar } = montar()
    pulsar('Enter')
    expect(textoEscrito()).toBe(T.frases[1])
    pulsar('Enter')
    expect(textoEscrito()).toBe(T.frases[2])
    expect(opcionMarcada()).toBe('NO')
    pulsar('ArrowLeft')
    expect(opcionMarcada()).toBe('SÍ')
    pulsar('Enter')
    expect(textoEscrito()).toBe(T.cierreSi)
    // Sin celebración
    expect(papelPicado()).toHaveLength(0)
    expect(onTerminar).not.toHaveBeenCalled()
    pulsar('Enter')
    expect(onTerminar).toHaveBeenCalledOnce()
  })

  it('la salida es inmediata, sin fundido', async () => {
    const { onTerminar, alCerrar } = montar()
    pulsar('Enter')
    pulsar('Enter')
    pulsar('Enter')
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(alCerrar).toHaveBeenCalledOnce()
    expect(capa()).toBeNull()
  })

  it('también las esperas máximas siguen valiendo: 4 s por frase y 9 s en la elección', async () => {
    const { onTerminar } = montar()
    await avanzar(E.esperaFraseMs)
    expect(textoEscrito()).toBe(T.frases[1])
    await avanzar(E.esperaFraseMs)
    expect(textoEscrito()).toBe(T.frases[2])
    await avanzar(E.esperaEleccionMs - 1)
    expect(onTerminar).not.toHaveBeenCalled()
    await avanzar(1)
    expect(onTerminar).toHaveBeenCalledOnce()
  })

  it('Esc la salta también', async () => {
    const { onTerminar } = montar()
    pulsar('Escape')
    expect(onTerminar).toHaveBeenCalledOnce()
    expect(capa()).toBeNull()
  })
})
