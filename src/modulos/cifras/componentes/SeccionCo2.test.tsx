import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import type { CifrasCo2 } from '../lib/cifrasCo2'
import { SeccionCo2 } from './SeccionCo2'

const TEXTOS = TEXTOS_CIFRAS.co2

const CIFRAS: CifrasCo2 = {
  almacenadoPorSector: [{ clave: '1', etiqueta: 'Sector 1', valor: { campo: 100, ejemplo: 0 } }],
  capturaPorSector: [{ clave: '1', etiqueta: 'Sector 1', valor: { campo: 10, ejemplo: 0 } }],
  almacenadoPorEspecie: [{ clave: 'A', etiqueta: 'Alfa', valor: { campo: 100, ejemplo: 0 } }],
  top: [
    {
      codigo: 'S01-A001',
      especie: 'Alfa',
      sector: 'Sector 1',
      co2_almacenado_kg: 100,
      demo: false,
      enlace: '/mapa?sector=1&arbol=S01-A001',
    },
  ],
  sinDatoAlmacenado: 0,
  sinDatoCaptura: 0,
  hayCo2Simulado: false,
}

function ver(cifras: CifrasCo2) {
  return render(
    <MemoryRouter>
      <SeccionCo2 cifras={cifras} />
    </MemoryRouter>,
  )
}

describe('SeccionCo2', () => {
  it('trae los cuatro bloques, cada uno con su tabla accesible', () => {
    ver(CIFRAS)
    expect(screen.getByRole('heading', { level: 2, name: TEXTOS.titulo })).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 3 }).map((t) => t.textContent)).toEqual([
      TEXTOS.almacenadoPorSector.titulo,
      TEXTOS.almacenadoPorEspecie.titulo,
      TEXTOS.capturaPorSector.titulo,
      TEXTOS.top.titulo,
    ])
    expect(screen.getAllByRole('table')).toHaveLength(4)
  })

  it('el encabezado de estimaciones simuladas aparece solo con datos simulados', () => {
    const { unmount } = ver({ ...CIFRAS, hayCo2Simulado: true })
    expect(screen.getByText(TEXTOS.simulado)).toBeVisible()
    unmount()
    ver(CIFRAS)
    expect(screen.queryByText(TEXTOS.simulado)).not.toBeInTheDocument()
  })

  it('cada bloque cuenta sus árboles sin dato según su propia magnitud', () => {
    ver({ ...CIFRAS, sinDatoAlmacenado: 2, sinDatoCaptura: 1 })
    expect(screen.getAllByText(TEXTOS.sinDato.replace('{n}', '2'))).toHaveLength(3)
    expect(screen.getAllByText(TEXTOS.sinDatoUno)).toHaveLength(1)
  })
})
