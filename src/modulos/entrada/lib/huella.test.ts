import { describe, expect, it } from 'vitest'
import { huellaSha256, letraDeTecla } from './huella'

const tecla = (key: string, extra: Partial<KeyboardEvent> = {}) => ({
  key,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  ...extra,
})

describe('huellaSha256', () => {
  it('da el SHA-256 en hexadecimal (valor conocido de «abc»)', async () => {
    expect(await huellaSha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('sin crypto.subtle (contexto no seguro) da null en vez de fallar', async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
    Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true })
    try {
      expect(await huellaSha256('abc')).toBeNull()
    } finally {
      if (original) Object.defineProperty(globalThis, 'crypto', original)
    }
  })
})

describe('letraDeTecla', () => {
  it('pasa a minúscula las letras', () => {
    expect(letraDeTecla(tecla('a'))).toBe('a')
    expect(letraDeTecla(tecla('Q'))).toBe('q')
  })

  it('ignora espacios, números, teclas especiales y combinaciones', () => {
    for (const ignorada of [' ', '7', 'Shift', 'Enter', 'Escape', '.', 'ñ']) {
      expect(letraDeTecla(tecla(ignorada))).toBeNull()
    }
    expect(letraDeTecla(tecla('a', { ctrlKey: true }))).toBeNull()
    expect(letraDeTecla(tecla('a', { altKey: true }))).toBeNull()
    expect(letraDeTecla(tecla('a', { metaKey: true }))).toBeNull()
  })
})
