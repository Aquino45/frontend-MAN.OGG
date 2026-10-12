import { describe, expect, it } from 'vitest'
import { ENTRADA_ALTERNA as E, TEXTOS_ENTRADA_ALTERNA as T } from '@/config/constantes'
import {
  ESTADO_INICIAL,
  esperaDe,
  PASO_INICIAL,
  reducir,
  reducirEstado,
  textoDe,
  type Paso,
} from './secuencia'

const PREGUNTA = T.frases.length - 1
const CIERRE = T.frases.length
const avanzar = { tipo: 'avanzar' } as const
const agotada = { tipo: 'agotada' } as const
const termino = { tipo: 'termino' } as const

describe('secuencia de la entrada alterna', () => {
  it('empieza escribiendo la primera frase', () => {
    expect(PASO_INICIAL).toEqual({ fase: 'escribiendo', texto: 0 })
    expect(textoDe(0)).toBe(T.frases[0])
    expect(textoDe(CIERRE)).toBe(T.cierreSi)
  })

  it('al terminar de escribirse una frase espera a que la persona avance', () => {
    expect(reducir({ fase: 'escribiendo', texto: 0 }, termino)).toEqual({
      fase: 'esperando',
      texto: 0,
    })
  })

  it('avanzar mientras se escribe completa la frase al instante, sin saltar a la siguiente', () => {
    expect(reducir({ fase: 'escribiendo', texto: 1 }, avanzar)).toEqual({
      fase: 'esperando',
      texto: 1,
    })
  })

  it('avanzar (o agotarse la espera) pasa a escribir la frase siguiente', () => {
    expect(reducir({ fase: 'esperando', texto: 0 }, avanzar)).toEqual({
      fase: 'escribiendo',
      texto: 1,
    })
    expect(reducir({ fase: 'esperando', texto: 0 }, agotada)).toEqual({
      fase: 'escribiendo',
      texto: 1,
    })
  })

  it('la última frase, ya escrita, lleva a la elección con la opción por defecto marcada', () => {
    const esperandoAntes: Paso = { fase: 'esperando', texto: PREGUNTA - 1 }
    expect(reducir(esperandoAntes, avanzar)).toEqual({ fase: 'escribiendo', texto: PREGUNTA })
    const eleccion = { fase: 'eligiendo', opcion: T.opcionPorDefecto }
    expect(reducir({ fase: 'escribiendo', texto: PREGUNTA }, termino)).toEqual(eleccion)
    expect(reducir({ fase: 'escribiendo', texto: PREGUNTA }, avanzar)).toEqual(eleccion)
  })

  it('las flechas mueven la marca entre las dos opciones, sin salirse', () => {
    const sobreSi: Paso = { fase: 'eligiendo', opcion: T.opcionSi }
    const sobreNo: Paso = { fase: 'eligiendo', opcion: T.opcionPorDefecto }
    expect(reducir(sobreNo, { tipo: 'mover', hacia: -1 })).toEqual(sobreSi)
    expect(reducir(sobreSi, { tipo: 'mover', hacia: 1 })).toEqual(sobreNo)
    // En el borde no cambia nada (ni siquiera el objeto: la espera no se reinicia)
    expect(reducir(sobreSi, { tipo: 'mover', hacia: -1 })).toBe(sobreSi)
    expect(reducir(sobreNo, { tipo: 'mover', hacia: 1 })).toBe(sobreNo)
  })

  it('confirmar SÍ escribe el cierre, espera a que avancen y termina', () => {
    const sobreSi: Paso = { fase: 'eligiendo', opcion: T.opcionSi }
    const escribiendo = reducir(sobreSi, avanzar)
    expect(escribiendo).toEqual({ fase: 'escribiendo', texto: CIERRE })
    const esperando = reducir(escribiendo, termino)
    expect(esperando).toEqual({ fase: 'esperando', texto: CIERRE })
    expect(reducir(esperando, avanzar)).toEqual({ fase: 'cerrada' })
    expect(reducir(esperando, agotada)).toEqual({ fase: 'cerrada' })
  })

  it('confirmar NO termina sin decir nada', () => {
    expect(reducir({ fase: 'eligiendo', opcion: 1 }, avanzar)).toEqual({ fase: 'cerrada' })
  })

  it('elegir una opción con un clic la confirma, sea cual sea la marcada', () => {
    const sobreNo: Paso = { fase: 'eligiendo', opcion: 1 }
    expect(reducir(sobreNo, { tipo: 'elegir', opcion: T.opcionSi })).toEqual({
      fase: 'escribiendo',
      texto: CIERRE,
    })
    expect(reducir({ fase: 'eligiendo', opcion: 0 }, { tipo: 'elegir', opcion: 1 })).toEqual({
      fase: 'cerrada',
    })
  })

  it('sin respuesta en la elección se toma la opción por defecto (NO), aunque esté marcada SÍ', () => {
    expect(T.opciones[T.opcionPorDefecto]).toBe('NO')
    expect(reducir({ fase: 'eligiendo', opcion: T.opcionPorDefecto }, agotada)).toEqual({
      fase: 'cerrada',
    })
    expect(reducir({ fase: 'eligiendo', opcion: T.opcionSi }, agotada)).toEqual({ fase: 'cerrada' })
  })

  it('lo que no corresponde al paso no lo cambia, y cerrada es final', () => {
    const escribiendo: Paso = { fase: 'escribiendo', texto: 0 }
    expect(reducir(escribiendo, agotada)).toBe(escribiendo)
    const esperando: Paso = { fase: 'esperando', texto: 0 }
    expect(reducir(esperando, termino)).toBe(esperando)
    expect(reducir(esperando, { tipo: 'mover', hacia: 1 })).toBe(esperando)
    const cerrada: Paso = { fase: 'cerrada' }
    expect(reducir(cerrada, avanzar)).toBe(cerrada)
    expect(reducir(cerrada, agotada)).toBe(cerrada)
  })

  it('espera 4 s tras cada frase escrita y 9 s en la elección; mientras escribe, no espera', () => {
    expect(esperaDe({ fase: 'esperando', texto: 0 })).toBe(E.esperaFraseMs)
    expect(esperaDe({ fase: 'esperando', texto: CIERRE })).toBe(E.esperaFraseMs)
    expect(esperaDe({ fase: 'eligiendo', opcion: 1 })).toBe(E.esperaEleccionMs)
    expect(esperaDe({ fase: 'escribiendo', texto: 0 })).toBeNull()
    expect(esperaDe({ fase: 'cerrada' })).toBeNull()
    expect(E.esperaFraseMs).toBe(4_000)
    expect(E.esperaEleccionMs).toBe(9_000)
  })

  it('recorrido completo sin tocar nada termina solo, por la opción por defecto', () => {
    let paso: Paso = PASO_INICIAL
    for (let i = 0; i < 20 && paso.fase !== 'cerrada'; i++) {
      paso = reducir(paso, paso.fase === 'escribiendo' ? termino : agotada)
    }
    expect(paso).toEqual({ fase: 'cerrada' })
  })

  it('el estado recuerda el último texto mostrado, incluso al cerrar', () => {
    let estado = ESTADO_INICIAL
    expect(estado.texto).toBe(0)
    estado = reducirEstado(estado, termino)
    estado = reducirEstado(estado, avanzar)
    expect(estado).toEqual({ paso: { fase: 'escribiendo', texto: 1 }, texto: 1 })
    estado = { paso: { fase: 'eligiendo', opcion: 1 }, texto: PREGUNTA }
    const cerrado = reducirEstado(estado, avanzar)
    expect(cerrado).toEqual({ paso: { fase: 'cerrada' }, texto: PREGUNTA })
    // Si nada cambia, es el mismo objeto
    expect(reducirEstado(cerrado, avanzar)).toBe(cerrado)
  })
})
