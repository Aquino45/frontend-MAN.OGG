import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ArbolFeature } from '@/api/cliente'
import { arbolesSector1Mock } from '@/mocks'
import { PuntosArboles } from './PuntosArboles'

const ARBOLES = arbolesSector1Mock.features
const RADIO = 6

function dibujar(
  arboles: readonly ArbolFeature[] = ARBOLES,
  acciones: {
    onResaltar?: (codigo: string | null) => void
    onAbrir?: (codigo: string) => void
  } = {},
  codigoResaltado: string | null = null,
) {
  return render(
    <svg>
      <PuntosArboles
        arboles={arboles}
        proyectarPosicion={([lon, lat]) => ({ x: lon, y: -lat })}
        radio={RADIO}
        codigoResaltado={codigoResaltado}
        onResaltar={acciones.onResaltar ?? (() => {})}
        onAbrir={acciones.onAbrir ?? (() => {})}
      />
    </svg>,
  )
}

describe('PuntosArboles', () => {
  it('dibuja un punto por árbol con ubicación, enfocable y con su nombre accesible', () => {
    dibujar()
    expect(screen.getAllByRole('button')).toHaveLength(ARBOLES.length)
    const molle = screen.getByRole('button', { name: 'S01-A001, Molle' })
    expect(molle).toHaveAttribute('tabindex', '0')
    expect(molle).toHaveAttribute('r', String(RADIO))
    expect(screen.getByRole('button', { name: 'S01-A015, especie sin dato' })).toBeInTheDocument()
  })

  it('un árbol sin ubicación no se dibuja', () => {
    dibujar([{ ...ARBOLES[0], geometry: null }, ARBOLES[1]])
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('los puntos de ejemplo se distinguen por una clase de trazo propia', () => {
    dibujar()
    expect(screen.getByRole('button', { name: 'S01-A012, Huarango' })).toHaveClass(
      'punto-arbol--demo',
    )
    expect(screen.getByRole('button', { name: 'S01-A001, Molle' })).not.toHaveClass(
      'punto-arbol--demo',
    )
  })

  it('se abre con click, Enter y Espacio, y no con otras teclas', () => {
    const alAbrir = vi.fn()
    dibujar(ARBOLES, { onAbrir: alAbrir })
    const molle = screen.getByRole('button', { name: 'S01-A001, Molle' })
    fireEvent.click(molle)
    fireEvent.keyDown(molle, { key: 'Enter' })
    fireEvent.keyDown(molle, { key: ' ' })
    expect(alAbrir).toHaveBeenCalledTimes(3)
    fireEvent.keyDown(molle, { key: 'a' })
    expect(alAbrir).toHaveBeenCalledTimes(3)
  })

  it('hover y foco resaltan el árbol y salir lo quita', () => {
    const alResaltar = vi.fn()
    dibujar(ARBOLES, { onResaltar: alResaltar })
    const molle = screen.getByRole('button', { name: 'S01-A001, Molle' })
    fireEvent.pointerEnter(molle)
    expect(alResaltar).toHaveBeenLastCalledWith('S01-A001')
    fireEvent.pointerLeave(molle)
    expect(alResaltar).toHaveBeenLastCalledWith(null)
    fireEvent.focus(molle)
    expect(alResaltar).toHaveBeenLastCalledWith('S01-A001')
  })

  it('marca el punto del árbol resaltado', () => {
    const { container } = dibujar(ARBOLES, {}, 'S01-A012')
    expect(container.querySelectorAll('.punto-arbol--resaltado')).toHaveLength(1)
  })
})
