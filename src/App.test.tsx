import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TEXTOS_TEMA } from '@/config/constantes'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })

  afterEach(() => vi.unstubAllEnvs())

  it('muestra el título MAN.OGG', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'MAN.OGG' })).toBeInTheDocument()
  })

  it('muestra la línea descriptiva', () => {
    render(<App />)
    expect(screen.getByText('Censo arbóreo · UPeU Ñaña')).toBeInTheDocument()
  })

  it('muestra el interruptor de tema y los 5 sectores de los mocks', async () => {
    render(<App />)
    expect(
      screen.getByRole('button', {
        name: new RegExp(`${TEXTOS_TEMA.cambiarAClaro}|${TEXTOS_TEMA.cambiarAOscuro}`),
      }),
    ).toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: /^Sector \d/ })).toHaveLength(5)
  })
})
