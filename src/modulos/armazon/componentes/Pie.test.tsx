import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { TEXTOS_ARMAZON, URL_LICENCIA_ODBL } from '@/config/constantes'
import { Pie } from './Pie'

function verPie() {
  return render(
    <MemoryRouter>
      <Pie />
    </MemoryRouter>,
  )
}

describe('Pie', () => {
  it('trae la nota de los datos', () => {
    verPie()
    expect(screen.getByText(TEXTOS_ARMAZON.notaDatos)).toBeInTheDocument()
  })

  it('trae el crédito de OpenStreetMap con enlace real a la licencia ODbL', () => {
    verPie()
    const credito = screen.getByText(
      (_, elemento) =>
        elemento?.tagName === 'P' &&
        elemento.textContent ===
          `${TEXTOS_ARMAZON.creditoContorno} (${TEXTOS_ARMAZON.nombreLicencia})`,
    )
    expect(credito).toBeInTheDocument()
    const enlace = screen.getByRole('link', { name: TEXTOS_ARMAZON.nombreLicencia })
    expect(enlace).toHaveAttribute('href', URL_LICENCIA_ODBL)
    expect(URL_LICENCIA_ODBL).toMatch(/^https:\/\//)
  })

  it('es un contentinfo', () => {
    verPie()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
