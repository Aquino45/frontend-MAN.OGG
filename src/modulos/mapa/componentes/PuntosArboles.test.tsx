import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ArbolFeature } from '@/api/cliente'
import {
  ESTRELLA_CONTORNO,
  ESTRELLA_LADO_GRILLA,
  MAPA_ESCALA_ESTRELLA,
  MAPA_PASOS_CASCADA,
} from '@/config/constantes'
import { arbolesSector1Mock } from '@/mocks'
import { PuntosArboles } from './PuntosArboles'

const ARBOLES = arbolesSector1Mock.features
const RADIO = 6
const NOMBRE_DESTACADO =
  'S01-A012, Huarango. Destacado: Dato de ejemplo: ejemplar de mayor copa del sector'

function dibujar(
  arboles: readonly ArbolFeature[] = ARBOLES,
  acciones: {
    onResaltar?: (codigo: string | null) => void
    onAbrir?: (codigo: string) => void
  } = {},
  codigoResaltado: string | null = null,
  sectorId = 1,
) {
  return render(
    <svg>
      <PuntosArboles
        sectorId={sectorId}
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
    expect(screen.getByRole('button', { name: NOMBRE_DESTACADO })).toHaveClass('punto-arbol--demo')
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

  it('un destacado se dibuja como estrella y los normales como círculo', () => {
    const { container } = dibujar()
    const estrella = screen.getByRole('button', { name: NOMBRE_DESTACADO })
    expect(estrella).toHaveClass('punto-arbol--destacado')
    expect(estrella.tagName.toLowerCase()).toBe('g')
    expect(estrella.querySelector('path')).toHaveAttribute('d', ESTRELLA_CONTORNO)
    expect(container.querySelectorAll('.punto-arbol--destacado')).toHaveLength(1)
    const molle = screen.getByRole('button', { name: 'S01-A001, Molle' })
    expect(molle.tagName.toLowerCase()).toBe('circle')
    expect(molle).not.toHaveClass('punto-arbol--destacado')
  })

  it('la estrella es más grande que el punto normal', () => {
    dibujar()
    const lado = RADIO * 2 * MAPA_ESCALA_ESTRELLA
    const escala = lado / ESTRELLA_LADO_GRILLA
    expect(
      screen.getByRole('button', { name: NOMBRE_DESTACADO }).querySelector('path'),
    ).toHaveAttribute('transform', expect.stringContaining(`scale(${escala})`))
  })

  it('la estrella se dibuja por encima de los demás puntos y conserva código y teclado', () => {
    const { container } = dibujar()
    const puntos = [...container.querySelectorAll('.punto-arbol')]
    expect(puntos.at(-1)).toHaveClass('punto-arbol--destacado')
    expect(puntos.at(-1)).toHaveAttribute('data-codigo', 'S01-A012')
    expect(puntos.at(-1)).toHaveAttribute('tabindex', '0')
  })

  it('la estrella se abre y se resalta igual que un punto normal', () => {
    const alAbrir = vi.fn()
    const alResaltar = vi.fn()
    dibujar(ARBOLES, { onAbrir: alAbrir, onResaltar: alResaltar })
    const estrella = screen.getByRole('button', { name: NOMBRE_DESTACADO })
    fireEvent.click(estrella)
    fireEvent.keyDown(estrella, { key: 'Enter' })
    expect(alAbrir).toHaveBeenCalledTimes(2)
    fireEvent.focus(estrella)
    expect(alResaltar).toHaveBeenLastCalledWith('S01-A012')
    fireEvent.blur(estrella)
    expect(alResaltar).toHaveBeenLastCalledWith(null)
  })

  it('la estrella de ejemplo y la resaltada llevan sus clases', () => {
    dibujar(ARBOLES, {}, 'S01-A012')
    expect(screen.getByRole('button', { name: NOMBRE_DESTACADO })).toHaveClass(
      'punto-arbol--demo',
      'punto-arbol--resaltado',
    )
  })
})

describe('cascada de puntos', () => {
  it('la primera vez que se entra a un sector los puntos llegan en cascada; la segunda, ya están', () => {
    const primera = dibujar(ARBOLES, {}, null, 901)
    expect(primera.container.querySelector('.puntos-arboles')).toHaveAttribute(
      'data-cascada',
      'true',
    )
    primera.unmount()
    const segunda = dibujar(ARBOLES, {}, null, 901)
    expect(segunda.container.querySelector('.puntos-arboles')).toHaveAttribute(
      'data-cascada',
      'false',
    )
  })

  it('el escalonado tiene un tope de pasos', () => {
    const base = ARBOLES.find((arbol) => arbol.geometry !== null) as ArbolFeature
    const muchos = Array.from({ length: 20 }, (_, i) => ({
      ...base,
      properties: { ...base.properties, codigo: `B-${i}`, destacado: false },
    }))
    const { container } = dibujar(muchos, {}, null, 902)
    const indices = [...container.querySelectorAll<SVGElement>('.punto-arbol')].map((punto) =>
      Number(punto.style.getPropertyValue('--indice')),
    )
    expect(Math.max(...indices)).toBe(MAPA_PASOS_CASCADA)
  })
})
