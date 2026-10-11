import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { RUTAS, TEXTOS_ESTADOS, TEXTOS_INICIO } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { FranjaSectores } from './FranjaSectores'

function verFranja(propiedades: Partial<Parameters<typeof FranjaSectores>[0]> = {}) {
  const onReintentar = vi.fn()
  const vista = render(
    <MemoryRouter>
      <FranjaSectores
        estado="listo"
        sectores={sectoresMock.features}
        conteos={null}
        onReintentar={onReintentar}
        {...propiedades}
      />
    </MemoryRouter>,
  )
  return { ...vista, onReintentar }
}

describe('FranjaSectores', () => {
  it('es una sección con nombre: su h2, la frase, el botón, la leyenda y el mapa', () => {
    verFranja()
    const franja = screen.getByRole('region', { name: TEXTOS_INICIO.tituloFranja })
    expect(
      within(franja).getByRole('heading', { level: 2, name: TEXTOS_INICIO.tituloFranja }),
    ).toBeInTheDocument()
    expect(within(franja).getByText(TEXTOS_INICIO.fraseFranja)).toBeInTheDocument()
    expect(within(franja).getByRole('link', { name: TEXTOS_INICIO.explorarMapa })).toHaveAttribute(
      'href',
      RUTAS.mapa,
    )
    expect(within(franja).getByText(TEXTOS_INICIO.leyendaCampo)).toBeInTheDocument()
    expect(within(franja).getByText(TEXTOS_INICIO.leyendaEjemplo)).toBeInTheDocument()
    expect(within(franja).getAllByRole('link', { name: /^Sector \d/ })).toHaveLength(
      sectoresMock.features.length,
    )
  })

  it('el botón de la franja es del sistema, sin forma de píldora', () => {
    verFranja()
    const enlace = screen.getByRole('link', { name: TEXTOS_INICIO.explorarMapa })
    expect(enlace).toHaveClass('boton')
    expect(enlace).not.toHaveClass('boton--pildora')
  })

  it('las muestras de la leyenda son decorativas', () => {
    const { container } = verFranja()
    const muestras = container.querySelectorAll('.inicio-leyenda__muestra')
    expect(muestras).toHaveLength(2)
    for (const muestra of muestras) expect(muestra).toHaveAttribute('aria-hidden', 'true')
  })

  it('cargando muestra un esqueleto ocupado, sin mapa y sin ningún dígito', () => {
    const { container } = verFranja({ estado: 'cargando', sectores: [] })
    const franja = screen.getByRole('region', { name: TEXTOS_INICIO.tituloFranja })
    expect(franja.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(container.querySelector('.inicio-mapa')).toBeNull()
    expect(franja.textContent).not.toMatch(/\d/)
  })

  it('con error muestra el mensaje y Reintentar lo pide de nuevo', () => {
    const { container, onReintentar } = verFranja({ estado: 'error', sectores: [] })
    expect(screen.getByRole('alert')).toHaveTextContent(TEXTOS_INICIO.errorSectores)
    expect(container.querySelector('.inicio-mapa')).toBeNull()
    const reintentar = screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar })
    expect(reintentar).toHaveClass('boton', 'boton--secundario')
    fireEvent.click(reintentar)
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })
})
