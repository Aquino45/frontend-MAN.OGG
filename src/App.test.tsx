import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NOMBRE_PRODUCTO, TEXTOS_TEMA } from '@/config/constantes'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })

  afterEach(() => vi.unstubAllEnvs())

  it('muestra el nombre público del producto como título', () => {
    render(<App />)
    expect(NOMBRE_PRODUCTO).toBe('Censo arbóreo UPeU Lima')
    expect(screen.getByRole('heading', { level: 1, name: NOMBRE_PRODUCTO })).toBeInTheDocument()
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
