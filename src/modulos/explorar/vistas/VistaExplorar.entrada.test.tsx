import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EXPLORAR_FIN_ENTRADA_MS,
  EXPLORAR_PASOS_ESCALONADO,
  TEXTOS_EXPLORAR,
} from '@/config/constantes'
import { esperarLista, filas, prepararApi, reiniciarApi, ver } from './montajeExplorar'
import estilosCss from '../estilos.css?raw'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

describe('VistaExplorar: entrada escalonada de la lista', () => {
  beforeEach(prepararApi)
  afterEach(() => {
    vi.useRealTimers()
    reiniciarApi()
  })

  it('la primera vez que se ve la lista, cada fila entra con su turno', async () => {
    ver()
    await esperarLista()
    const turnos = filas().map((fila) => fila.style.getPropertyValue('--indice'))
    expect(turnos).toEqual(
      filas().map((_, indice) => String(Math.min(indice, EXPLORAR_PASOS_ESCALONADO))),
    )
    for (const fila of filas()) expect(fila).toHaveClass('explorar__item--entra')
  })

  it('pasado el tiempo de la entrada, filtrar no vuelve a animar las filas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    ver()
    await esperarLista()
    act(() => {
      vi.advanceTimersByTime(EXPLORAR_FIN_ENTRADA_MS)
    })
    await waitFor(() => {
      for (const fila of filas()) expect(fila).not.toHaveClass('explorar__item--entra')
    })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a' } })
    await waitFor(() => expect(filas().length).toBeGreaterThan(0))
    for (const fila of filas()) expect(fila).not.toHaveClass('explorar__item--entra')
  })

  it('el estado de carga y el contador no se escalonan', async () => {
    ver()
    expect(screen.getByRole('status')).toHaveTextContent(TEXTOS_EXPLORAR.cargando)
    await esperarLista()
    expect(document.querySelector('.explorar__contador')).not.toHaveClass('explorar__item--entra')
  })
})

describe('estilos de la entrada de Explorar', () => {
  it('usa los tokens de movimiento: la duración de entrada, el retraso escalonado y la curva de salida', () => {
    const regla = estilosCss.match(/\.explorar__item--entra\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regla).toMatch(/var\(--duracion-entrada\)/)
    expect(regla).toMatch(/var\(--curva-salida\)/)
    expect(regla).toMatch(/var\(--indice\) \* var\(--retraso-escalonado-grafico\)/)
  })

  it('solo anima opacidad y desplazamiento (transform), sin escala desde cero', () => {
    const cuerpo = estilosCss.match(/@keyframes explorar-entra\s*\{([\s\S]*?\n\})/)?.[1] ?? ''
    expect(cuerpo).toMatch(/opacity:\s*0/)
    expect(cuerpo).toMatch(/translateY\(var\(--desplazamiento-entrada\)\)/)
    expect(cuerpo).not.toMatch(/scale/)
  })
})
