import { afterEach, describe, expect, it } from 'vitest'
import { ATRIBUTO_MODALIDAD_ENTRADA, MODALIDADES_ENTRADA } from '@/config/constantes'
import { iniciarModalidadEntrada } from './modalidadEntrada'

const leer = () => document.documentElement.getAttribute(ATRIBUTO_MODALIDAD_ENTRADA)
let detener: (() => void) | null = null

afterEach(() => {
  detener?.()
  detener = null
  document.documentElement.removeAttribute(ATRIBUTO_MODALIDAD_ENTRADA)
})

describe('iniciarModalidadEntrada', () => {
  it('arranca en «puntero»', () => {
    detener = iniciarModalidadEntrada()
    expect(leer()).toBe(MODALIDADES_ENTRADA.puntero)
  })

  it('una tecla pasa a «teclado» y un puntero vuelve a «puntero»', () => {
    detener = iniciarModalidadEntrada()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(leer()).toBe(MODALIDADES_ENTRADA.teclado)
    document.dispatchEvent(new Event('pointerdown'))
    expect(leer()).toBe(MODALIDADES_ENTRADA.puntero)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    document.dispatchEvent(new Event('pointermove'))
    expect(leer()).toBe(MODALIDADES_ENTRADA.puntero)
  })

  it('las teclas modificadoras solas no cuentan', () => {
    detener = iniciarModalidadEntrada()
    for (const key of ['Shift', 'Control', 'Alt', 'Meta']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }))
    }
    expect(leer()).toBe(MODALIDADES_ENTRADA.puntero)
  })

  it('al detenerse deja de escuchar', () => {
    const parar = iniciarModalidadEntrada()
    parar()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(leer()).toBe(MODALIDADES_ENTRADA.puntero)
  })
})
