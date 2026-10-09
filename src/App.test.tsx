import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('muestra el título MAN.OGG', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'MAN.OGG' })).toBeInTheDocument()
  })

  it('muestra la línea descriptiva', () => {
    render(<App />)
    expect(screen.getByText('Censo arbóreo · UPeU Ñaña')).toBeInTheDocument()
  })
})
