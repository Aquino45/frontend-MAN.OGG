import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { SectorFeature } from '@/api/cliente'
import { TEXTOS_MAPA } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { MapaSectores } from './MapaSectores'

const SECTORES = sectoresMock.features
const NOMBRE_SECTOR_1 = 'Sector 1, 118 árboles'

// Envuelve el mapa con el mismo estado que le da la vista.
function MapaConEstado({
  sectores = SECTORES,
  alSeleccionar = () => {},
}: {
  sectores?: readonly SectorFeature[]
  alSeleccionar?: (sectorId: number) => void
}) {
  const [resaltado, setResaltado] = useState<number | null>(null)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  return (
    <MapaSectores
      sectores={sectores}
      sectorResaltado={resaltado}
      sectorSeleccionado={seleccionado}
      formasGlifos={['copaRedonda', 'palma']}
      onResaltar={setResaltado}
      onSeleccionar={(sectorId) => {
        setSeleccionado(sectorId)
        alSeleccionar(sectorId)
      }}
    />
  )
}

const grupoDe = (forma: HTMLElement) => forma.closest('g.sector') as Element
const gruposAtenuados = (contenedor: HTMLElement) =>
  contenedor.querySelectorAll('.mapa-sectores__svg--con-activo .sector:not(.sector--activo)')

describe('MapaSectores', () => {
  it('dibuja un sector por cada dato, con su nombre accesible', () => {
    render(<MapaConEstado />)
    const sectores = screen.getAllByRole('button')
    expect(sectores).toHaveLength(SECTORES.length)
    expect(screen.getByRole('button', { name: NOMBRE_SECTOR_1 })).toBeInTheDocument()
    expect(sectores.every((sector) => sector.getAttribute('d')?.startsWith('M'))).toBe(true)
  })

  it('el hover resalta un sector y atenúa los otros 4; al salir todo vuelve', () => {
    const { container } = render(<MapaConEstado />)
    const sector1 = screen.getByRole('button', { name: NOMBRE_SECTOR_1 })

    fireEvent.pointerEnter(sector1, { pointerType: 'mouse' })
    expect(grupoDe(sector1)).toHaveClass('sector--activo')
    expect(gruposAtenuados(container)).toHaveLength(SECTORES.length - 1)

    fireEvent.pointerLeave(sector1, { pointerType: 'mouse' })
    expect(grupoDe(sector1)).not.toHaveClass('sector--activo')
    expect(gruposAtenuados(container)).toHaveLength(0)
  })

  it('con el teclado: el foco resalta y Enter o Espacio seleccionan', () => {
    const alSeleccionar = vi.fn()
    render(<MapaConEstado alSeleccionar={alSeleccionar} />)
    const sector1 = screen.getByRole('button', { name: NOMBRE_SECTOR_1 })
    expect(sector1).toHaveAttribute('tabindex', '0')

    fireEvent.focus(sector1)
    expect(grupoDe(sector1)).toHaveClass('sector--activo')

    fireEvent.keyDown(sector1, { key: 'Enter' })
    expect(alSeleccionar).toHaveBeenLastCalledWith(1)
    expect(sector1).toHaveAttribute('aria-pressed', 'true')

    const sector2 = screen.getAllByRole('button')[1]
    fireEvent.keyDown(sector2, { key: ' ' })
    expect(alSeleccionar).toHaveBeenLastCalledWith(2)
  })

  it('al tacto: el primer toque resalta y el segundo selecciona', () => {
    const alSeleccionar = vi.fn()
    render(<MapaConEstado alSeleccionar={alSeleccionar} />)
    const sector1 = screen.getByRole('button', { name: NOMBRE_SECTOR_1 })

    const tocar = () => {
      fireEvent.pointerEnter(sector1, { pointerType: 'touch' })
      fireEvent.pointerDown(sector1, { pointerType: 'touch' })
      fireEvent.focus(sector1)
      fireEvent.click(sector1)
    }

    tocar()
    expect(grupoDe(sector1)).toHaveClass('sector--activo')
    expect(alSeleccionar).not.toHaveBeenCalled()

    tocar()
    expect(alSeleccionar).toHaveBeenCalledWith(1)
  })

  it('los sectores provisionales llevan borde punteado y la nota sale de los datos', () => {
    const { container, rerender } = render(<MapaConEstado />)
    const provisionales = SECTORES.filter((sector) => sector.properties.provisional)
    expect(container.querySelectorAll('.sector--provisional')).toHaveLength(provisionales.length)
    expect(screen.getByText(TEXTOS_MAPA.limitesProvisionales)).toBeInTheDocument()

    const sinProvisionales = SECTORES.map((sector) => ({
      ...sector,
      properties: { ...sector.properties, provisional: false },
    }))
    rerender(<MapaConEstado sectores={sinProvisionales} />)
    expect(screen.queryByText(TEXTOS_MAPA.limitesProvisionales)).not.toBeInTheDocument()
  })

  it('los glifos son decorativos', () => {
    const { container } = render(<MapaConEstado />)
    const glifos = container.querySelectorAll('.glifo-arbol')
    expect(glifos.length).toBeGreaterThan(0)
    glifos.forEach((glifo) => expect(glifo.closest('[aria-hidden="true"]')).not.toBeNull())
  })
})
