import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { hayGestoReciente, marcarGesto, reiniciarGestos, useRegistroDeGestos } from './gesto'

describe('gestos', () => {
  beforeEach(() => reiniciarGestos())

  it('sin ningún gesto no hay gesto reciente', () => {
    expect(hayGestoReciente(1_500)).toBe(false)
  })

  it('un gesto cuenta dentro de la ventana y no después', () => {
    marcarGesto(1_000)
    expect(hayGestoReciente(1_500, 2_500)).toBe(true)
    expect(hayGestoReciente(1_500, 2_501)).toBe(false)
  })

  it('el registro anota un clic o una tecla, y deja de escuchar al desmontarse', () => {
    const { unmount } = renderHook(() => useRegistroDeGestos())
    fireEvent.pointerDown(document.body)
    expect(hayGestoReciente(1_500)).toBe(true)
    reiniciarGestos()
    fireEvent.keyDown(document.body, { key: 'a' })
    expect(hayGestoReciente(1_500)).toBe(true)
    unmount()
    reiniciarGestos()
    fireEvent.pointerDown(document.body)
    expect(hayGestoReciente(1_500)).toBe(false)
  })
})
