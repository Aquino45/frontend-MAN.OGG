import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PARAMETROS_URL, RUTAS, TEXTOS_CARTILLA, TEXTOS_CIFRAS } from '@/config/constantes'
import type { FilaTopCo2 } from '../lib/cifrasCo2'
import { BloqueTopCo2 } from './BloqueTopCo2'

const TEXTOS = TEXTOS_CIFRAS.co2

function fila(codigo: string, cambios: Partial<FilaTopCo2> = {}): FilaTopCo2 {
  return {
    codigo,
    especie: 'Prosopis pallida',
    sector: 'Sector 1',
    co2_almacenado_kg: 500,
    demo: false,
    enlace: `${RUTAS.mapa}?${PARAMETROS_URL.sector}=1&${PARAMETROS_URL.arbol}=${codigo}`,
    ...cambios,
  }
}

const FILAS = [
  fila('S01-A001', { co2_almacenado_kg: 75_185, demo: true }),
  fila('S01-A002', { co2_almacenado_kg: 900, especie: null }),
]

function ver(filas: FilaTopCo2[] = FILAS) {
  return render(
    <MemoryRouter>
      <BloqueTopCo2 filas={filas} sinDato={0} />
    </MemoryRouter>,
  )
}

describe('BloqueTopCo2', () => {
  it('es una sola lista ordenada, en el orden que llega (mayor a menor)', () => {
    ver()
    const lista = screen.getByRole('list', { name: TEXTOS.top.descripcion })
    const items = within(lista).getAllByRole('listitem')
    expect(items).toHaveLength(FILAS.length)
    expect(lista.tagName).toBe('OL')
    expect(items[0]).toHaveTextContent('S01-A001')
    expect(items[1]).toHaveTextContent('S01-A002')
  })

  it('cada fila enlaza a su cartilla en el mapa con sector y árbol', () => {
    ver()
    const enlace = screen.getByRole('link', {
      name: TEXTOS.verEnMapa.replace('{codigo}', 'S01-A001'),
    })
    expect(enlace).toHaveAttribute(
      'href',
      `${RUTAS.mapa}?${PARAMETROS_URL.sector}=1&${PARAMETROS_URL.arbol}=S01-A001`,
    )
    expect(screen.getAllByRole('link')).toHaveLength(FILAS.length)
  })

  it('solo las filas de ejemplo llevan el sello existente, sin texto nuevo', () => {
    ver()
    const items = within(screen.getByRole('list', { name: TEXTOS.top.descripcion })).getAllByRole(
      'listitem',
    )
    expect(within(items[0]).getByText(TEXTOS_CARTILLA.selloDemo)).toBeVisible()
    expect(within(items[1]).queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
  })

  it('muestra especie, sector y el valor en kg o t; sin especie dice «Sin dato»', () => {
    ver()
    const items = within(screen.getByRole('list', { name: TEXTOS.top.descripcion })).getAllByRole(
      'listitem',
    )
    expect(items[0]).toHaveTextContent('Prosopis pallida')
    expect(items[0]).toHaveTextContent('Sector 1')
    expect(items[0]).toHaveTextContent('75.2 t CO₂e')
    expect(items[1]).toHaveTextContent('900 kg CO₂e')
    expect(items[1]).toHaveTextContent(TEXTOS_CARTILLA.sinDato)
  })

  it('trae su tabla accesible debajo, con las mismas filas', () => {
    ver()
    const tabla = screen.getByRole('table', { name: TEXTOS.top.descripcion })
    const filas = [...tabla.querySelectorAll('tbody tr')].map((f) =>
      [...f.querySelectorAll('th, td')].map((celda) => celda.textContent),
    )
    expect(filas).toHaveLength(FILAS.length)
    expect(filas[0][0]).toContain('S01-A001')
    expect(filas[1].map((celda) => celda?.trim())).toEqual([
      'S01-A002',
      TEXTOS_CARTILLA.sinDato,
      'Sector 1',
      '900 kg CO₂e',
    ])
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual([TEXTOS.arbol, TEXTOS.especie, TEXTOS.sector, TEXTOS.valor])
  })

  it('avisa cuántos árboles quedan fuera por no tener dato', () => {
    render(
      <MemoryRouter>
        <BloqueTopCo2 filas={FILAS} sinDato={2} />
      </MemoryRouter>,
    )
    expect(screen.getByText(TEXTOS.sinDato.replace('{n}', '2'))).toBeVisible()
  })
})
