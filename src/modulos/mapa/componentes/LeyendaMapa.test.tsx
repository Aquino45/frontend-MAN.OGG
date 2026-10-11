import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_DESTACADO, TEXTOS_MAPA } from '@/config/constantes'
import { arbolesSector1Mock, sectoresMock } from '@/mocks'
import { LeyendaMapa } from './LeyendaMapa'
import { MapaSectores } from './MapaSectores'

const SECTORES = sectoresMock.features

function mapa(arboles = arbolesSector1Mock.features, sectorSeleccionado: number | null = 1) {
  return (
    <MapaSectores
      sectores={SECTORES}
      sectorResaltado={null}
      sectorSeleccionado={sectorSeleccionado}
      formasGlifos={['copaRedonda']}
      onResaltar={() => {}}
      onSeleccionar={() => {}}
      arboles={arboles}
    />
  )
}

describe('LeyendaMapa', () => {
  it('sin provisionales ni destacados no dibuja nada', () => {
    const { container } = render(<LeyendaMapa hayProvisionales={false} hayDestacados={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('explica la estrella cuando hay destacados', () => {
    render(<LeyendaMapa hayProvisionales={false} hayDestacados />)
    expect(screen.getByText(TEXTOS_DESTACADO.leyenda)).toBeInTheDocument()
    expect(screen.queryByText(TEXTOS_MAPA.limitesProvisionales)).not.toBeInTheDocument()
  })

  it('con ambas muestra las dos notas', () => {
    render(<LeyendaMapa hayProvisionales hayDestacados />)
    expect(screen.getByText(TEXTOS_DESTACADO.leyenda)).toBeInTheDocument()
    expect(screen.getByText(TEXTOS_MAPA.limitesProvisionales)).toBeInTheDocument()
  })
})

describe('leyenda dentro del mapa', () => {
  it('la estrella se explica al abrir un sector con destacados', () => {
    render(mapa())
    expect(screen.getByText(TEXTOS_DESTACADO.leyenda)).toBeInTheDocument()
  })

  it('no se explica con el mapa completo ni si el sector no tiene destacados', () => {
    const { rerender } = render(mapa(arbolesSector1Mock.features, null))
    expect(screen.queryByText(TEXTOS_DESTACADO.leyenda)).not.toBeInTheDocument()
    const sinDestacados = arbolesSector1Mock.features.map((arbol) => ({
      ...arbol,
      properties: { ...arbol.properties, destacado: false, motivo_destacado: null },
    }))
    rerender(mapa(sinDestacados))
    expect(screen.queryByText(TEXTOS_DESTACADO.leyenda)).not.toBeInTheDocument()
  })
})
