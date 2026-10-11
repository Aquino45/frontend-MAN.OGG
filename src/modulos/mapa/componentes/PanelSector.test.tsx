import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ArbolFeature } from '@/api/cliente'
import { TEXTOS_MAPA, TEXTOS_PANEL } from '@/config/constantes'
import { arbolesSector1Mock, sectoresMock } from '@/mocks'
import type { EstadoArbolesDeSector } from '../hooks/useArbolesDeSector'
import { PanelSector } from './PanelSector'

const SECTOR_1 = sectoresMock.features[0].properties
const SECTOR_PROVISIONAL = sectoresMock.features.find(
  (sector) => sector.properties.provisional,
)!.properties
const FRASE = 'Contando árboles…'

function montar(
  arboles: EstadoArbolesDeSector,
  acciones: Partial<{
    onResaltar: (codigo: string | null) => void
    onAbrir: (codigo: string) => void
    onVolver: () => void
    onReintentar: () => void
  }> = {},
  sector = SECTOR_1,
  codigoResaltado: string | null = null,
) {
  return render(
    <PanelSector
      sector={sector}
      arboles={arboles}
      fraseCarga={FRASE}
      codigoResaltado={codigoResaltado}
      onResaltar={acciones.onResaltar ?? (() => {})}
      onAbrir={acciones.onAbrir ?? (() => {})}
      onVolver={acciones.onVolver ?? (() => {})}
      onReintentar={acciones.onReintentar ?? (() => {})}
    />,
  )
}

describe('PanelSector', () => {
  it('la cabecera muestra el nombre, el total y la nota de límites provisionales', () => {
    montar({ estado: 'cargando' }, {}, SECTOR_PROVISIONAL)
    expect(screen.getByRole('heading', { name: SECTOR_PROVISIONAL.nombre })).toBeInTheDocument()
    expect(screen.getByText(TEXTOS_MAPA.limitesProvisionales)).toBeInTheDocument()
  })

  it('un sector definitivo no lleva la nota de límites provisionales', () => {
    montar({ estado: 'cargando' }, {}, { ...SECTOR_1, provisional: false })
    expect(screen.queryByText(TEXTOS_MAPA.limitesProvisionales)).not.toBeInTheDocument()
  })

  it('estado cargando: muestra la frase de carga', () => {
    montar({ estado: 'cargando' })
    expect(screen.getByRole('status')).toHaveTextContent(FRASE)
  })

  it('estado error: muestra el mensaje y «Reintentar» lo pide de nuevo', () => {
    const alReintentar = vi.fn()
    montar({ estado: 'error', error: new Error('503') }, { onReintentar: alReintentar })
    expect(screen.getByRole('alert')).toHaveTextContent(TEXTOS_PANEL.errorArboles)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_PANEL.reintentar }))
    expect(alReintentar).toHaveBeenCalledOnce()
  })

  it('estado vacío: dice «Aún sin árboles registrados»', () => {
    montar({ estado: 'listo', arboles: [] })
    expect(screen.getByText(TEXTOS_PANEL.sinArboles)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('estado listo: una fila por árbol, en el orden de la API, con sus datos', () => {
    montar({ estado: 'listo', arboles: arbolesSector1Mock.features })
    const filas = screen.getAllByRole('listitem')
    expect(filas.map((fila) => fila.querySelector('.fila-arbol__codigo')?.textContent)).toEqual(
      arbolesSector1Mock.features.map((arbol) => arbol.properties.codigo),
    )
    expect(screen.getByText('Molle')).toBeInTheDocument()
    expect(screen.getByText('Prosopis pallida')).toBeInTheDocument()
    expect(screen.getByText('Regular')).toBeInTheDocument()
    expect(screen.getAllByText('Dato de ejemplo')).toHaveLength(1)
  })

  it('un árbol sin nombre dice «Sin dato» y uno sin ubicación dice «Sin ubicación»', () => {
    const sinUbicacion: ArbolFeature = {
      ...arbolesSector1Mock.features[3],
      geometry: null,
    }
    montar({ estado: 'listo', arboles: [sinUbicacion] })
    expect(screen.getAllByText(TEXTOS_PANEL.sinDatoNombre).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(TEXTOS_PANEL.sinUbicacion)).toBeInTheDocument()
  })

  it('click abre el árbol; hover y foco lo resaltan, y «Volver» sale del sector', () => {
    const alAbrir = vi.fn()
    const alResaltar = vi.fn()
    const alVolver = vi.fn()
    montar(
      { estado: 'listo', arboles: arbolesSector1Mock.features },
      { onAbrir: alAbrir, onResaltar: alResaltar, onVolver: alVolver },
    )
    const [primera] = screen.getAllByRole('button', { name: /S01-A001/ })
    fireEvent.pointerEnter(primera)
    expect(alResaltar).toHaveBeenLastCalledWith('S01-A001')
    fireEvent.pointerLeave(primera)
    expect(alResaltar).toHaveBeenLastCalledWith(null)
    fireEvent.click(primera)
    expect(alAbrir).toHaveBeenCalledWith('S01-A001')
    fireEvent.click(screen.getByRole('button', { name: new RegExp(TEXTOS_PANEL.volverASectores) }))
    expect(alVolver).toHaveBeenCalledOnce()
  })

  it('la fila del árbol resaltado se marca', () => {
    const { container } = montar(
      { estado: 'listo', arboles: arbolesSector1Mock.features },
      {},
      SECTOR_1,
      'S01-A012',
    )
    expect(container.querySelectorAll('.fila-arbol--resaltada')).toHaveLength(1)
    expect(container.querySelector('.fila-arbol--resaltada')).toHaveAttribute(
      'data-codigo',
      'S01-A012',
    )
  })
})
