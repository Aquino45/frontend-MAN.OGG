import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TEXTOS_CARTILLA, TEXTOS_DESTACADO, TEXTOS_ESTADOS } from '@/config/constantes'
import { arbolDemoMock } from '@/mocks'
import { VistaCartilla } from './VistaCartilla'

describe('VistaCartilla', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('muestra «cargando» y luego la cartilla, con el foco en el título', async () => {
    render(<VistaCartilla codigo="S01-A012" nombreSector="Sector 1" onVolver={() => {}} />)
    expect(screen.getByRole('status')).toHaveTextContent(TEXTOS_CARTILLA.cargando)
    const titulo = await screen.findByRole('heading', { name: 'Huarango' })
    await waitFor(() => expect(titulo).toHaveFocus())
  })

  it('la cartilla de un destacado muestra su motivo al cargar', async () => {
    render(<VistaCartilla codigo="S01-A012" nombreSector="Sector 1" onVolver={() => {}} />)
    await screen.findByRole('heading', { name: 'Huarango' })
    expect(screen.getAllByText(arbolDemoMock.motivo_destacado ?? '').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getByText(TEXTOS_DESTACADO.etiqueta)).toBeInTheDocument()
  })

  it('un árbol que no existe dice «No encontramos el árbol» y deja volver', async () => {
    const alVolver = vi.fn()
    render(<VistaCartilla codigo="S01-A099" nombreSector="Sector 1" onVolver={alVolver} />)
    expect(await screen.findByText(`${TEXTOS_CARTILLA.noEncontrado} S01-A099`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_CARTILLA.volverALista }))
    expect(alVolver).toHaveBeenCalledOnce()
  })

  it('mientras carga muestra el esqueleto compartido con la forma de la cartilla', () => {
    const { container } = render(
      <VistaCartilla codigo="S01-A012" nombreSector="Sector 1" onVolver={() => {}} />,
    )
    expect(container.querySelector('.estado-carga--tarjeta')).not.toBeNull()
  })

  it('un 503 muestra el error y «Reintentar» vuelve a pedir la cartilla', async () => {
    vi.stubEnv('VITE_USAR_MOCKS', 'false')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('{}', { status: 503 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(arbolDemoMock), { status: 200 })),
    )
    render(<VistaCartilla codigo="S01-A012" nombreSector="Sector 1" onVolver={() => {}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_CARTILLA.error)
    const reintentar = screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar })
    expect(reintentar).toHaveClass('boton--secundario')
    fireEvent.click(reintentar)
    expect(await screen.findByRole('heading', { name: 'Huarango' })).toBeInTheDocument()
  })
})
