import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PARAMETROS_URL, RUTAS, TEXTOS_INICIO, TEXTOS_MAPA } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { nombreAccesibleSector, textoTotalArboles } from '@/modulos/mapa'
import type { ConteoDeSector } from '../lib/cifras'
import { MapaInicio } from './MapaInicio'

function Ubicacion() {
  const { pathname, search } = useLocation()
  return <p data-testid="ubicacion">{pathname + search}</p>
}

function verMapa(conteos: Map<number, ConteoDeSector> | null) {
  return render(
    <MemoryRouter>
      <MapaInicio sectores={sectoresMock.features} conteos={conteos} />
      <Ubicacion />
    </MemoryRouter>,
  )
}

describe('MapaInicio', () => {
  it('dibuja un enlace por sector, hacia el mapa con su id en la consulta', () => {
    verMapa(null)
    const enlaces = screen.getAllByRole('link')
    expect(enlaces).toHaveLength(sectoresMock.features.length)
    for (const sector of sectoresMock.features) {
      const enlace = screen.getByRole('link', { name: nombreAccesibleSector(sector.properties) })
      expect(enlace).toHaveAttribute(
        'href',
        `${RUTAS.mapa}?${PARAMETROS_URL.sector}=${sector.properties.id}`,
      )
    }
  })

  it('sin conteos muestra el nombre y el total de árboles de la API', () => {
    const { container } = verMapa(null)
    const primero = sectoresMock.features[0].properties
    const texto = container.querySelector('[data-sector], .inicio-sector__texto')
    expect(texto).toHaveTextContent(primero.nombre)
    expect(texto).toHaveTextContent(textoTotalArboles(primero.total_arboles))
    // Sin conteos todos los sectores van con el relleno neutro de ejemplo
    expect(container.querySelectorAll('.inicio-sector--campo')).toHaveLength(0)
  })

  it('con conteos muestra «N de campo» y «M de ejemplo» y rellena según los de campo', () => {
    const conteos = new Map<number, ConteoDeSector>([
      [1, { deCampo: 3, deEjemplo: 1 }],
      [2, { deCampo: 0, deEjemplo: 4 }],
    ])
    const { container } = verMapa(conteos)
    const textos = [...container.querySelectorAll('.inicio-sector__texto')].map(
      (nodo) => nodo.textContent,
    )
    expect(textos[0]).toContain(`3 ${TEXTOS_INICIO.conteoDeCampo}`)
    expect(textos[0]).toContain(`1 ${TEXTOS_INICIO.conteoDeEjemplo}`)
    expect(textos[1]).toContain(`4 ${TEXTOS_INICIO.conteoDeEjemplo}`)
    expect(textos[1]).not.toContain(TEXTOS_INICIO.conteoDeCampo)
    // Un sector sin árboles en los conteos lo dice con un texto corto
    expect(textos[2]).toContain(TEXTOS_INICIO.sinArbolesAun)

    const sectores = container.querySelectorAll('.inicio-sector')
    expect(sectores[0]).toHaveClass('inicio-sector--campo')
    expect(sectores[1]).toHaveClass('inicio-sector--ejemplo')
  })

  it('los sectores con límites provisionales van marcados para el punteado', () => {
    const { container } = verMapa(null)
    const sectores = container.querySelectorAll('.inicio-sector')
    sectoresMock.features.forEach((sector, indice) => {
      expect(sectores[indice].classList.contains('inicio-sector--provisional')).toBe(
        sector.properties.provisional,
      )
    })
  })

  it('los textos del mapa van en una capa decorativa sobre las formas y el mapa tiene nombre', () => {
    const { container } = verMapa(null)
    expect(screen.getByRole('group', { name: TEXTOS_MAPA.tituloRegion })).toBeInTheDocument()
    const capa = container.querySelector('.inicio-mapa__textos')
    expect(capa).toHaveAttribute('aria-hidden', 'true')
    expect(capa?.querySelectorAll('.inicio-sector__texto')).toHaveLength(
      sectoresMock.features.length,
    )
    // La capa de textos va después de todos los sectores, para que ninguno la tape
    expect(container.querySelector('svg')?.lastElementChild).toBe(capa)
  })

  it('al pulsar un sector navega a /mapa?sector=<id>', () => {
    verMapa(null)
    const sector = sectoresMock.features[2].properties
    fireEvent.click(screen.getByRole('link', { name: nombreAccesibleSector(sector) }))
    expect(screen.getByTestId('ubicacion')).toHaveTextContent(
      `${RUTAS.mapa}?${PARAMETROS_URL.sector}=${sector.id}`,
    )
  })
})
