import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import type { FilaConteo } from '../lib/cifrasCenso'
import { BloqueCifras } from './BloqueCifras'

const FILAS: FilaConteo[] = [
  { clave: '1', etiqueta: 'Sector 1', conteo: { campo: 6, ejemplo: 2 } },
  { clave: '2', etiqueta: 'Sector 2', conteo: { campo: 0, ejemplo: 4 } },
]

function ver(filas: FilaConteo[] = FILAS) {
  return render(
    <BloqueCifras
      titulo="Árboles por sector"
      descripcion="Descripción de la tabla"
      columna="Sector"
      filas={filas}
    />,
  )
}

describe('BloqueCifras', () => {
  it('es una sección con su h2', () => {
    ver()
    const seccion = screen.getByRole('region', { name: 'Árboles por sector' })
    expect(within(seccion).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Árboles por sector',
    )
  })

  it('la tabla accesible trae caption, encabezados con scope y campo, ejemplo y total por separado', () => {
    ver()
    const tabla = screen.getByRole('table', { name: 'Descripción de la tabla' })
    expect(tabla.querySelector('caption')).toHaveTextContent('Descripción de la tabla')
    const columnas = within(tabla).getAllByRole('columnheader')
    expect(columnas.map((c) => c.textContent)).toEqual([
      'Sector',
      TEXTOS_CIFRAS.campo,
      TEXTOS_CIFRAS.ejemplo,
      TEXTOS_CIFRAS.total,
    ])
    for (const columna of columnas) expect(columna).toHaveAttribute('scope', 'col')
    const filas = within(tabla).getAllByRole('row').slice(1)
    expect(filas).toHaveLength(2)
    const encabezadoFila = within(filas[0]).getByRole('rowheader')
    expect(encabezadoFila).toHaveTextContent('Sector 1')
    expect(encabezadoFila).toHaveAttribute('scope', 'row')
    expect(
      within(filas[0])
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['6', '2', '8'])
    expect(
      within(filas[1])
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['0', '4', '4'])
  })

  it('la tabla se desplaza dentro de su recuadro y se alcanza con el teclado', () => {
    const { container } = ver()
    const recuadro = container.querySelector('.cifras-tabla') as HTMLElement
    expect(recuadro).toHaveAttribute('tabindex', '0')
    expect(recuadro).toHaveAttribute('role', 'region')
    expect(recuadro).toHaveAccessibleName(TEXTOS_CIFRAS.tablaConDesplazamiento)
  })

  it('el gráfico es decorativo (la tabla es la fuente accesible) y muestra los valores en texto', () => {
    const { container } = ver()
    const grafico = container.querySelector('.cifras-grafico') as HTMLElement
    expect(grafico).toHaveAttribute('aria-hidden', 'true')
    expect(grafico).toHaveTextContent('6 campo · 2 ejemplo')
    expect(grafico).toHaveTextContent('0 campo · 4 ejemplo')
  })

  it('las barras son proporcionales al mayor total y campo y ejemplo son segmentos distintos', () => {
    const { container } = ver()
    const barras = container.querySelectorAll('.cifras-grafico__fila')
    const primera = barras[0]
    expect((primera.querySelector('.cifras-grafico__campo') as HTMLElement).style.inlineSize).toBe(
      '75%',
    )
    expect(
      (primera.querySelector('.cifras-grafico__ejemplo') as HTMLElement).style.inlineSize,
    ).toBe('25%')
    const segunda = barras[1]
    expect((segunda.querySelector('.cifras-grafico__campo') as HTMLElement).style.inlineSize).toBe(
      '0%',
    )
    expect(
      (segunda.querySelector('.cifras-grafico__ejemplo') as HTMLElement).style.inlineSize,
    ).toBe('50%')
  })

  it('con todos en cero las barras quedan en 0% (sin dividir entre cero)', () => {
    const { container } = ver([
      { clave: '1', etiqueta: 'Sector 1', conteo: { campo: 0, ejemplo: 0 } },
    ])
    expect(
      (container.querySelector('.cifras-grafico__campo') as HTMLElement).style.inlineSize,
    ).toBe('0%')
  })

  it('trae la leyenda: relleno liso para campo y rayado para ejemplo', () => {
    const { container } = ver()
    expect(container.querySelector('.cifras-leyenda__muestra--campo')).not.toBeNull()
    expect(container.querySelector('.cifras-leyenda__muestra--ejemplo')).not.toBeNull()
    expect(screen.getAllByText(TEXTOS_CIFRAS.campo).length).toBeGreaterThan(0)
  })
})
