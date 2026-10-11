import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TEXTOS_CARTILLA, TEXTOS_ESTADOS } from '@/config/constantes'
import { EstadoCarga } from './EstadoCarga'
import { EstadoError } from './EstadoError'
import { EstadoVacio } from './EstadoVacio'
import estadosCss from './estados.estilos.css?raw'
import { GlifoPixelArbol } from './GlifoPixelArbol'
import { SelloDemo } from './SelloDemo'
import { SinDato } from './SinDato'

describe('componentes compartidos', () => {
  it('SelloDemo dice «Dato de ejemplo»', () => {
    render(<SelloDemo />)
    expect(screen.getByText(TEXTOS_CARTILLA.selloDemo)).toBeInTheDocument()
  })

  it('SinDato dice «Sin dato»', () => {
    render(<SinDato />)
    expect(screen.getByText(TEXTOS_CARTILLA.sinDato)).toBeInTheDocument()
  })

  it('GlifoPixelArbol es decorativo y no tiene texto', () => {
    const { container } = render(<GlifoPixelArbol />)
    const dibujo = container.querySelector('svg')
    expect(dibujo).toHaveAttribute('aria-hidden', 'true')
    expect(dibujo?.textContent).toBe('')
  })
})

describe('EstadoCarga', () => {
  it('es un status con la etiqueta para lectores y sin números inventados', () => {
    const { container } = render(<EstadoCarga etiqueta="Cargando los sectores…" />)
    const estado = screen.getByRole('status')
    expect(estado).toHaveAttribute('aria-busy', 'true')
    expect(estado).toHaveTextContent('Cargando los sectores…')
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
    expect(estado.textContent).not.toMatch(/\d/)
  })

  it.each([
    ['lista', 3, '.estado-carga__fila'],
    ['cifras', 4, '.estado-carga__cifra'],
    ['tarjeta', 1, '.estado-carga__foto'],
    ['bloque', 1, '.estado-carga__bloque'],
  ] as const)('la forma «%s» dibuja %i pieza(s) con su forma real', (forma, cantidad, selector) => {
    const { container } = render(
      <EstadoCarga etiqueta="Cargando" forma={forma} cantidad={cantidad} />,
    )
    expect(container.querySelectorAll(selector)).toHaveLength(cantidad)
  })

  it('el color del esqueleto es el del texto mezclado al 14 % y no hay colores sueltos', () => {
    expect(estadosCss).toContain('color-mix(in srgb, currentColor var(--esqueleto-mezcla)')
    expect(estadosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
  })
})

describe('EstadoVacio', () => {
  it('dice la frase y, sin acción, no trae botón', () => {
    render(<EstadoVacio mensaje="Esta sección llega pronto" />)
    expect(screen.getByText('Esta sección llega pronto')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('con acción muestra un botón secundario que la dispara', () => {
    const alLimpiar = vi.fn()
    render(
      <EstadoVacio
        mensaje="Ningún árbol coincide"
        accion={{ texto: TEXTOS_ESTADOS.limpiarFiltros, alPulsar: alLimpiar }}
      />,
    )
    const boton = screen.getByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros })
    expect(boton).toHaveClass('boton', 'boton--secundario')
    fireEvent.click(boton)
    expect(alLimpiar).toHaveBeenCalledOnce()
  })
})

describe('EstadoError', () => {
  it('es un alert que dice qué falló y ofrece «Reintentar» como botón secundario', () => {
    const alReintentar = vi.fn()
    render(<EstadoError mensaje="No pudimos cargar los sectores." onReintentar={alReintentar} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los sectores.')
    const boton = screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar })
    expect(boton).toHaveClass('boton', 'boton--secundario')
    fireEvent.click(boton)
    expect(alReintentar).toHaveBeenCalledOnce()
  })
})
