import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obtenerSectores } from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import type { ConfigMapaReal } from '@/config/entorno'
import { TEXTOS_SATELITE } from '@/config/satelite'
import { sectoresMock } from '@/mocks'
import { VistaMapa } from './VistaMapa'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))

// Configuraciones que recibió el mapa en cada dibujo (para ver que no llega un objeto nuevo cada vez)
const configsRecibidas = vi.hoisted(() => [] as unknown[])

// MapLibre necesita WebGL, que jsdom no tiene: el mapa real se reemplaza por un testigo.
vi.mock('../componentes/MapaReal', () => ({
  default: (props: { base: string; config: unknown; onSeleccionar: (id: number) => void }) => {
    configsRecibidas.push(props.config)
    return (
      <div data-testid="mapa-real" data-base={props.base}>
        <button type="button" onClick={() => props.onSeleccionar(1)}>
          elegir sector 1
        </button>
      </div>
    )
  },
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const SIEMPRE_CERO = () => 0
const CONFIG: ConfigMapaReal = {
  clave: 'clave-falsa',
  urlsTeselas: {
    satelite: 'https://satelite.test/{z}/{y}/{x}',
    calles: 'https://calles.test/{z}/{y}/{x}',
  },
}

describe('VistaMapa: calles y satélite', () => {
  beforeEach(() => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
  })

  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    invalidarCacheCampus()
  })

  it('sin clave de Esri hay calles pero no satélite, y no hay errores', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={{ ...CONFIG, clave: null }} />)
    expect(await screen.findAllByRole('button', { name: /^Sector 1,/ })).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: TEXTOS_SATELITE.calles })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: TEXTOS_SATELITE.satelite })).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('con clave empieza en la vista ilustrada y hay tres vistas', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={CONFIG} />)
    const ilustrado = await screen.findByRole('button', { name: TEXTOS_SATELITE.ilustrado })
    expect(ilustrado).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: TEXTOS_SATELITE.calles })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: TEXTOS_SATELITE.satelite })).toBeInTheDocument()
    expect(screen.queryByTestId('mapa-real')).toBeNull()
  })

  it.each(['calles', 'satelite'] as const)(
    '«%s» muestra el mapa real con esa base y se vuelve al ilustrado',
    async (base) => {
      render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={CONFIG} />)
      fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE[base] }))
      const mapa = await screen.findByTestId('mapa-real')
      expect(mapa).toHaveAttribute('data-base', base)
      expect(screen.getByRole('button', { name: TEXTOS_SATELITE[base] })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.queryAllByRole('button', { name: /^Sector 1,/ })).toHaveLength(0)

      fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.ilustrado }))
      expect(screen.queryByTestId('mapa-real')).toBeNull()
      expect(await screen.findAllByRole('button', { name: /^Sector 1,/ })).not.toHaveLength(0)
    },
  )

  it('pasar de calles a satélite cambia la base sin quedarse con la anterior', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={CONFIG} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.calles }))
    expect(await screen.findByTestId('mapa-real')).toHaveAttribute('data-base', 'calles')
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_SATELITE.satelite }))
    expect(screen.getByTestId('mapa-real')).toHaveAttribute('data-base', 'satelite')
  })

  it('el teñido ya no existe: no hay botón ni preferencia guardada', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={CONFIG} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.satelite }))
    await screen.findByTestId('mapa-real')
    expect(screen.queryByRole('button', { name: /teñido/i })).toBeNull()
  })

  it('elegir un sector en el mapa real abre su panel', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} configMapaReal={CONFIG} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.calles }))
    fireEvent.click(await screen.findByRole('button', { name: 'elegir sector 1' }))
    expect(await screen.findByRole('region', { name: 'Sector 1' })).toBeInTheDocument()
  })

  it('lee la configuración del entorno una sola vez: el mapa nunca recibe un objeto nuevo', async () => {
    vi.stubEnv('VITE_ESRI_CLAVE', 'clave-del-entorno')
    configsRecibidas.length = 0
    const { rerender } = render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_SATELITE.satelite }))
    await screen.findByTestId('mapa-real')
    // Cada vez que la vista se vuelve a dibujar, la configuración debe seguir siendo la misma
    rerender(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    rerender(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    expect(configsRecibidas.length).toBeGreaterThan(1)
    expect(new Set(configsRecibidas).size).toBe(1)
    expect(configsRecibidas[0]).toMatchObject({ clave: 'clave-del-entorno' })
    vi.unstubAllEnvs()
  })
})
