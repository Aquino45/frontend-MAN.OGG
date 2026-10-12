import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerSectores } from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import type { ConfigSatelite } from '@/config/entorno'
import { CLAVE_SATELITE_TENIDO, TEXTOS_SATELITE } from '@/config/satelite'
import { sectoresMock } from '@/mocks'
import { VistaMapa } from './VistaMapa'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))

// MapLibre necesita WebGL, que jsdom no tiene: el mapa satelital se reemplaza por un testigo.
vi.mock('../componentes/MapaSatelite', () => ({
  default: (props: { tenido: boolean; onSeleccionar: (id: number) => void }) => (
    <div data-testid="mapa-satelite" data-tenido={String(props.tenido)}>
      <button type="button" onClick={() => props.onSeleccionar(1)}>
        elegir sector 1
      </button>
    </div>
  ),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const SIEMPRE_CERO = () => 0
const CONFIG: ConfigSatelite = {
  urlTeselas: 'https://teselas.test/{z}/{y}/{x}',
  clave: 'clave-falsa',
}

describe('VistaMapa: vista satelital', () => {
  beforeEach(() => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    window.localStorage.clear()
  })

  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    invalidarCacheCampus()
  })

  it('sin clave no hay botón de satélite y el mapa ilustrado sigue', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configSatelite={null} />)
    expect(await screen.findAllByRole('button', { name: /^Sector 1,/ })).not.toHaveLength(0)
    expect(screen.queryByRole('button', { name: TEXTOS_SATELITE.satelite })).toBeNull()
    expect(screen.queryByRole('button', { name: TEXTOS_SATELITE.tenido })).toBeNull()
  })

  it('con clave empieza en la vista ilustrada y el botón cambia a satélite y vuelve', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configSatelite={CONFIG} />)
    const ilustrado = await screen.findByRole('button', { name: TEXTOS_SATELITE.ilustrado })
    expect(ilustrado).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByTestId('mapa-satelite')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.satelite }))
    expect(await screen.findByTestId('mapa-satelite')).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: /^Sector 1,/ })).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.ilustrado }))
    expect(screen.queryByTestId('mapa-satelite')).toBeNull()
    expect(await screen.findAllByRole('button', { name: /^Sector 1,/ })).not.toHaveLength(0)
  })

  it('«Teñido» solo sale en el satélite, empieza apagado y se recuerda', async () => {
    const { unmount } = render(<VistaMapa aleatorio={SIEMPRE_CERO} configSatelite={CONFIG} />)
    await screen.findByRole('button', { name: TEXTOS_SATELITE.satelite })
    expect(screen.queryByRole('button', { name: TEXTOS_SATELITE.tenido })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.satelite }))
    const testigo = await screen.findByTestId('mapa-satelite')
    expect(testigo).toHaveAttribute('data-tenido', 'false')

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.tenido }))
    expect(screen.getByTestId('mapa-satelite')).toHaveAttribute('data-tenido', 'true')
    expect(window.localStorage.getItem(CLAVE_SATELITE_TENIDO)).not.toBeNull()
    unmount()

    render(<VistaMapa aleatorio={SIEMPRE_CERO} configSatelite={CONFIG} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.satelite }))
    expect(await screen.findByTestId('mapa-satelite')).toHaveAttribute('data-tenido', 'true')
  })

  it('elegir un sector en el satélite abre su panel', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configSatelite={CONFIG} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.satelite }))
    fireEvent.click(await screen.findByRole('button', { name: 'elegir sector 1' }))
    expect(await screen.findByRole('region', { name: 'Sector 1' })).toBeInTheDocument()
  })
})
