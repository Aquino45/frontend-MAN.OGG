import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CANTIDAD_CIFRAS_INICIO, REGION_INTERFAZ, TEXTOS_INICIO } from '@/config/constantes'
import type { Cifras } from '../lib/cifras'
import { CifrasCenso } from './CifrasCenso'

const CIFRAS: Cifras = {
  arbolesDeCampo: 1234,
  sectores: 5,
  especiesIdentificadas: 12,
  arbolesDeEjemplo: 73,
}

function verCifras(propiedades: Partial<Parameters<typeof CifrasCenso>[0]> = {}) {
  const onReintentar = vi.fn()
  const vista = render(
    <CifrasCenso estado="listo" cifras={CIFRAS} onReintentar={onReintentar} {...propiedades} />,
  )
  return { ...vista, onReintentar }
}

describe('CifrasCenso', () => {
  it('es una sección con nombre y su h2 «El censo hoy» con el estilo etiqueta', () => {
    verCifras()
    const seccion = screen.getByRole('region', { name: TEXTOS_INICIO.tituloCifras })
    const titulo = within(seccion).getByRole('heading', {
      level: 2,
      name: TEXTOS_INICIO.tituloCifras,
    })
    expect(titulo).toHaveClass('inicio-cifras__titulo')
  })

  it('lista las 4 cifras con su valor formateado, su etiqueta y su nota', () => {
    verCifras()
    const formato = new Intl.NumberFormat(REGION_INTERFAZ)
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(CANTIDAD_CIFRAS_INICIO)
    const esperado: [number, keyof typeof TEXTOS_INICIO.cifras][] = [
      [CIFRAS.arbolesDeCampo, 'arbolesDeCampo'],
      [CIFRAS.sectores, 'sectores'],
      [CIFRAS.especiesIdentificadas, 'especiesIdentificadas'],
      [CIFRAS.arbolesDeEjemplo, 'arbolesDeEjemplo'],
    ]
    esperado.forEach(([valor, clave], indice) => {
      expect(items[indice]).toHaveTextContent(formato.format(valor))
      expect(items[indice]).toHaveTextContent(TEXTOS_INICIO.cifras[clave].etiqueta)
      expect(items[indice]).toHaveTextContent(TEXTOS_INICIO.cifras[clave].nota)
    })
  })

  it('las notas no llevan números escritos', () => {
    for (const { nota } of Object.values(TEXTOS_INICIO.cifras)) expect(nota).not.toMatch(/\d/)
  })

  it('cargando muestra 4 bloques de esqueleto ocupados y ningún dígito', () => {
    const { container } = verCifras({ estado: 'cargando', cifras: null })
    const seccion = screen.getByRole('region', { name: TEXTOS_INICIO.tituloCifras })
    expect(seccion.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(container.querySelectorAll('.inicio-cifras__esqueleto')).toHaveLength(
      CANTIDAD_CIFRAS_INICIO,
    )
    expect(seccion.textContent).not.toMatch(/\d/)
  })

  it('con error muestra el mensaje y Reintentar lo pide de nuevo', () => {
    const { onReintentar } = verCifras({ estado: 'error', cifras: null })
    expect(screen.getByRole('alert')).toHaveTextContent(TEXTOS_INICIO.errorCifras)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_INICIO.reintentar }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })
})
