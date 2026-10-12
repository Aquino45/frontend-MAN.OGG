import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import type { FilaCo2 } from '../lib/cifrasCo2'
import { BloqueCo2Barras } from './BloqueCo2Barras'

const TEXTOS = TEXTOS_CIFRAS.co2.almacenadoPorSector

const FILAS: FilaCo2[] = [
  { clave: '1', etiqueta: 'Sector 1', valor: { campo: 150, ejemplo: 0 } },
  { clave: '2', etiqueta: 'Sector 2', valor: { campo: 25, ejemplo: 25_000 } },
]

function ver(sinDato = 0) {
  return render(
    <BloqueCo2Barras
      titulo={TEXTOS.titulo}
      descripcion={TEXTOS.descripcion}
      columna={TEXTOS.columna}
      filas={FILAS}
      tipo="almacenado"
      sinDato={sinDato}
    />,
  )
}

describe('BloqueCo2Barras', () => {
  it('lleva su título como encabezado y un gráfico decorativo', () => {
    const { container } = ver()
    expect(screen.getByRole('heading', { level: 3, name: TEXTOS.titulo })).toBeVisible()
    expect(container.querySelector('.cifras-grafico[aria-hidden="true"]')).not.toBeNull()
  })

  it('la tabla accesible trae campo y ejemplo aparte, con kg o t según el umbral', () => {
    ver()
    const tabla = screen.getByRole('table', { name: TEXTOS.descripcion })
    const filas = [...tabla.querySelectorAll('tbody tr')].map((fila) =>
      [...fila.querySelectorAll('th, td')].map((celda) => celda.textContent),
    )
    expect(filas[0]).toEqual(['Sector 1', '150 kg CO₂e', '0 kg CO₂e', '150 kg CO₂e'])
    expect(filas[1]).toEqual(['Sector 2', '25 kg CO₂e', '25.0 t CO₂e', '25.0 t CO₂e'])
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual([
      TEXTOS.columna,
      TEXTOS_CIFRAS.co2.campo,
      TEXTOS_CIFRAS.co2.ejemplo,
      TEXTOS_CIFRAS.co2.total,
    ])
  })

  it('la leyenda y las barras distinguen el ejemplo con trama, no solo con color', () => {
    const { container } = ver()
    expect(container.querySelectorAll('.cifras-grafico__ejemplo')).toHaveLength(FILAS.length)
    expect(container.querySelector('.cifras-leyenda__muestra--ejemplo')).not.toBeNull()
  })

  it('avisa cuántos árboles quedaron fuera por no tener dato, en singular y plural', () => {
    const { unmount } = ver(1)
    expect(screen.getByText(TEXTOS_CIFRAS.co2.sinDatoUno)).toBeVisible()
    unmount()
    ver(3)
    expect(screen.getByText(TEXTOS_CIFRAS.co2.sinDato.replace('{n}', '3'))).toBeVisible()
  })

  it('sin árboles sin dato no escribe ningún aviso', () => {
    ver(0)
    expect(screen.queryByText(/sin dato de CO/)).not.toBeInTheDocument()
  })

  it('la tabla se puede enfocar para desplazarla', () => {
    ver()
    expect(
      screen.getByRole('region', { name: TEXTOS_CIFRAS.tablaConDesplazamiento }),
    ).toHaveAttribute('tabindex', '0')
  })
})
