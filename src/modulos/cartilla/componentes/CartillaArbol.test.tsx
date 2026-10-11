import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Arbol } from '@/api/cliente'
import { NOMBRE_CAMPUS, TEXTOS_CARTILLA } from '@/config/constantes'
import { arbolDemoMock, arbolRealMock } from '@/mocks'
import { CartillaArbol } from './CartillaArbol'

const NOMBRE_SECTOR = 'Sector 1'

// Árbol con todos los campos opcionales en null
const arbolVacio: Arbol = {
  ...arbolRealMock,
  codigo: 'S01-A015',
  nombre_comun: null,
  nombre_cientifico: null,
  lat: null,
  lon: null,
  utm_este_m: null,
  utm_norte_m: null,
  altura_total_m: null,
  dap_cm: null,
  copa_ns_m: null,
  copa_eo_m: null,
  fecha_registro: null,
}

function mostrar(arbol: Arbol) {
  return render(<CartillaArbol arbol={arbol} nombreSector={NOMBRE_SECTOR} />)
}

describe('CartillaArbol', () => {
  it('muestra el código, el sector y el campus en la franja', () => {
    mostrar(arbolDemoMock)
    expect(screen.getByText(arbolDemoMock.codigo)).toBeInTheDocument()
    expect(screen.getByText(`${NOMBRE_SECTOR} · ${NOMBRE_CAMPUS}`)).toBeInTheDocument()
  })

  it('muestra la cartilla demo completa con su sello y sus valores formateados', () => {
    const { container } = mostrar(arbolDemoMock)
    expect(screen.getByText(TEXTOS_CARTILLA.selloDemo)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Huarango' })).toBeInTheDocument()
    expect(screen.getByText('Prosopis pallida')).toBeInTheDocument()
    expect(screen.getByText('Nativa')).toBeInTheDocument()
    expect(screen.getByText('Identificada')).toBeInTheDocument()
    expect(screen.getByText(`${TEXTOS_CARTILLA.conservacion}: Por verificar`)).toBeInTheDocument()
    expect(screen.getByText(`${TEXTOS_CARTILLA.estado}: Regular`)).toBeInTheDocument()
    expect(screen.getByText('9.4 m')).toBeInTheDocument()
    expect(screen.getByText('310 cm')).toBeInTheDocument()
    expect(screen.getByText(/N-S 18\.4 m/)).toBeInTheDocument()
    expect(screen.getByText(/E-O 18\.4 m/)).toBeInTheDocument()
    expect(container.textContent).toContain('75 185')
    expect(container.textContent).toContain('+1 503.7 kg/año')
    expect(screen.getByText(arbolDemoMock.observaciones ?? '')).toBeInTheDocument()
    expect(screen.getByText(/UTM 18S 299 501 E 8 673 505 N/)).toBeInTheDocument()
    expect(screen.getByText(`${TEXTOS_CARTILLA.registrado}: 2026-10-07`)).toBeInTheDocument()
  })

  it('la cartilla real no lleva sello y dice «Sin dato» donde falta el valor', () => {
    mostrar(arbolRealMock)
    expect(screen.queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
    expect(screen.getByText(`${TEXTOS_CARTILLA.estado}: ${TEXTOS_CARTILLA.sinDato}`)).toBeVisible()
    expect(
      screen.getByText(`${TEXTOS_CARTILLA.conservacion}: ${TEXTOS_CARTILLA.sinDato}`),
    ).toBeVisible()
    expect(screen.queryByText('Nativa')).not.toBeInTheDocument()
    // Faltan 4 estados de campo, los 2 valores de CO₂ y la fecha de registro
    expect(screen.getAllByText(TEXTOS_CARTILLA.sinDato).length).toBeGreaterThanOrEqual(7)
    expect(screen.getByText(TEXTOS_CARTILLA.fotoPendiente)).toBeInTheDocument()
  })

  it('con todo en null no aparece null, undefined ni NaN y los 19 campos siguen en pantalla', () => {
    const { container } = mostrar(arbolVacio)
    for (const prohibido of ['null', 'undefined', 'NaN']) {
      expect(container.textContent).not.toContain(prohibido)
    }
    for (const etiqueta of [
      TEXTOS_CARTILLA.altura,
      TEXTOS_CARTILLA.copa,
      TEXTOS_CARTILLA.dap,
      TEXTOS_CARTILLA.co2Almacenado,
      TEXTOS_CARTILLA.capturaAnual,
      TEXTOS_CARTILLA.estadoCopa,
      TEXTOS_CARTILLA.troncoDanos,
      TEXTOS_CARTILLA.raicesBase,
      TEXTOS_CARTILLA.interferencia,
    ]) {
      expect(screen.getByText(etiqueta)).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(TEXTOS_CARTILLA.sinDato)
  })

  it('el chip de estado cambia de estilo según el valor, y «otro valor» es neutro', () => {
    const { rerender } = mostrar({ ...arbolDemoMock, estado_general: 'Bueno' })
    expect(screen.getByText(/Estado: Bueno/)).toHaveClass('chip-estado--bueno')
    rerender(
      <CartillaArbol arbol={{ ...arbolDemoMock, estado_general: 'Malo' }} nombreSector="S" />,
    )
    expect(screen.getByText(/Estado: Malo/)).toHaveClass('chip-estado--malo')
    rerender(
      <CartillaArbol arbol={{ ...arbolDemoMock, estado_general: 'Regular' }} nombreSector="S" />,
    )
    expect(screen.getByText(/Estado: Regular/)).toHaveClass('chip-estado--regular')
    rerender(
      <CartillaArbol arbol={{ ...arbolDemoMock, estado_general: 'Crítico' }} nombreSector="S" />,
    )
    expect(screen.getByText(/Estado: Crítico/)).toHaveClass('chip-estado--otro')
    rerender(<CartillaArbol arbol={{ ...arbolDemoMock, estado_general: null }} nombreSector="S" />)
    expect(screen.getByText(/Estado: Sin dato/)).toHaveClass('chip-estado--otro')
  })

  it('una copa en 0 dice «0 m registrada» y dibuja el círculo punteado', () => {
    const { container } = mostrar({ ...arbolRealMock, copa_ns_m: 0, copa_eo_m: 0 })
    expect(screen.getByText(`0 m ${TEXTOS_CARTILLA.copaCero}`)).toBeInTheDocument()
    expect(container.querySelector('.indicador-copa__cero')).not.toBeNull()
    expect(container.querySelector('.indicador-copa__elipse')).toBeNull()
  })

  it('una copa en null dice «Sin dato» y no dibuja elipse', () => {
    const { container } = mostrar({ ...arbolRealMock, copa_ns_m: null, copa_eo_m: null })
    expect(container.querySelector('.indicador-copa__dibujo')).toBeNull()
    expect(container.querySelector('.indicador-copa .sin-dato')).not.toBeNull()
  })

  it('con una sola copa dibuja un círculo y no inventa el otro diámetro', () => {
    const { container } = mostrar({ ...arbolRealMock, copa_ns_m: 10, copa_eo_m: null })
    const elipse = container.querySelector('.indicador-copa__elipse')
    expect(elipse?.getAttribute('rx')).toBe(elipse?.getAttribute('ry'))
    expect(screen.getByText(/E-O/)).toHaveTextContent(`E-O ${TEXTOS_CARTILLA.sinDato}`)
  })

  it('la barra de altura no se pasa del 100 % con un valor mayor que la escala', () => {
    const { container } = mostrar({ ...arbolRealMock, altura_total_m: 40 })
    const relleno = container.querySelector<HTMLElement>('.indicador-altura__relleno')
    expect(relleno?.style.inlineSize).toBe('100%')
  })

  it('con foto muestra la miniatura y la foto con el texto alternativo del árbol', () => {
    const conFoto = {
      ...arbolRealMock,
      foto_url: 'https://fotos.prueba.invalid/grande.jpg',
      foto_miniatura_url: 'https://fotos.prueba.invalid/mini.jpg',
    }
    mostrar(conFoto)
    const fotos = screen.getAllByAltText('Foto del árbol S01-A001 (Molle)')
    expect(fotos).toHaveLength(2)
    expect(screen.queryByText(TEXTOS_CARTILLA.fotoPendiente)).not.toBeInTheDocument()
  })
})
