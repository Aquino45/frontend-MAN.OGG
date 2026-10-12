import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ArbolFeature } from '@/api/cliente'
import {
  ESTRELLA_CONTORNO,
  TEXTOS_DESTACADO,
  TEXTOS_ESTADOS,
  TEXTOS_MAPA,
  TEXTOS_PANEL,
} from '@/config/constantes'
import { arbolesSector1Mock, sectoresMock } from '@/mocks'
import type { EstadoArbolesDeSector } from '../hooks/useArbolesDeSector'
import { ordenarDestacadosPrimero } from '../lib/ordenArboles'
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
    const estado = screen.getByRole('status')
    expect(estado).toHaveTextContent(FRASE)
    expect(estado).toHaveAttribute('aria-busy', 'true')
    expect(estado).toHaveClass('estado-carga--lista')
  })

  it('estado error: usa el error compartido y «Reintentar» lo pide de nuevo', () => {
    const alReintentar = vi.fn()
    montar({ estado: 'error', error: new Error('503') }, { onReintentar: alReintentar })
    expect(screen.getByRole('alert')).toHaveTextContent(TEXTOS_PANEL.errorArboles)
    const reintentar = screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar })
    expect(reintentar).toHaveClass('boton', 'boton--secundario')
    fireEvent.click(reintentar)
    expect(alReintentar).toHaveBeenCalledOnce()
  })

  it('estado vacío: usa el vacío compartido y dice «Aún sin árboles registrados»', () => {
    const { container } = montar({ estado: 'listo', arboles: [] })
    expect(screen.getByText(TEXTOS_PANEL.sinArboles)).toBeInTheDocument()
    expect(container.querySelector('.estado--vacio')).not.toBeNull()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('«Volver a los sectores» es un botón secundario del sistema', () => {
    montar({ estado: 'cargando' })
    const volver = screen.getByRole('button', { name: new RegExp(TEXTOS_PANEL.volverASectores) })
    expect(volver).toHaveClass('boton', 'boton--secundario')
    expect(volver).not.toHaveClass('boton--texto')
  })

  it('estado listo: una fila por árbol, con los destacados primero, y sus datos', () => {
    montar({ estado: 'listo', arboles: arbolesSector1Mock.features })
    const filas = screen.getAllByRole('listitem')
    expect(filas.map((fila) => fila.querySelector('.mapa-fila__codigo')?.textContent)).toEqual(
      ordenarDestacadosPrimero(arbolesSector1Mock.features).map((arbol) => arbol.properties.codigo),
    )
    expect(filas[0].querySelector('.mapa-fila__codigo')).toHaveTextContent('S01-A012')
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

  it('la fila de un destacado lleva la estrella y la palabra «Destacado», sin repetir el motivo', () => {
    const { container } = montar({ estado: 'listo', arboles: arbolesSector1Mock.features })
    const estrellas = container.querySelectorAll('.mapa-fila__estrella')
    expect(estrellas).toHaveLength(1)
    const fila = estrellas[0].closest('li') as HTMLElement
    expect(fila.querySelector('.mapa-fila__codigo')).toHaveTextContent('S01-A012')
    expect(fila).toHaveTextContent(TEXTOS_DESTACADO.etiqueta)
    expect(fila).not.toHaveTextContent('ejemplar de mayor copa del sector')
    expect(container.querySelector('.mapa-fila__motivo')).toBeNull()
    expect(estrellas[0].querySelector('path')).toHaveAttribute('d', ESTRELLA_CONTORNO)
  })

  it('un destacado sin motivo también muestra la etiqueta', () => {
    const sinMotivo: ArbolFeature = {
      ...arbolesSector1Mock.features[2],
      properties: { ...arbolesSector1Mock.features[2].properties, motivo_destacado: null },
    }
    montar({ estado: 'listo', arboles: [sinMotivo] })
    expect(screen.getByText(TEXTOS_DESTACADO.etiqueta)).toBeInTheDocument()
  })

  it('la fila del árbol resaltado se marca', () => {
    const { container } = montar(
      { estado: 'listo', arboles: arbolesSector1Mock.features },
      {},
      SECTOR_1,
      'S01-A012',
    )
    expect(container.querySelectorAll('.mapa-fila--resaltada')).toHaveLength(1)
    expect(container.querySelector('.mapa-fila--resaltada')).toHaveAttribute(
      'data-codigo',
      'S01-A012',
    )
  })
})
