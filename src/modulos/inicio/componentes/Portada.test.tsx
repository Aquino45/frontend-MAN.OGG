import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ID_TITULO_DESTACADOS, NOMBRE_CAMPUS, RUTAS, TEXTOS_INICIO } from '@/config/constantes'
import { Portada } from './Portada'

function verPortada(cantidadSectores: number | null) {
  return render(
    <MemoryRouter>
      <Portada cantidadSectores={cantidadSectores} />
    </MemoryRouter>,
  )
}

describe('Portada', () => {
  it('el antetítulo lleva el campus, la ciudad y la cantidad de sectores que llega por props', () => {
    verPortada(7)
    expect(
      screen.getByText(
        `${NOMBRE_CAMPUS} · ${TEXTOS_INICIO.ciudad} · 7 ${TEXTOS_INICIO.sectorPlural}`,
      ),
    ).toBeInTheDocument()
  })

  it('con un solo sector usa el singular', () => {
    verPortada(1)
    expect(screen.getByText(/· 1 sector$/)).toBeInTheDocument()
  })

  it('sin la cantidad (cargando) el antetítulo no trae ningún número', () => {
    const { container } = verPortada(null)
    const antetitulo = container.querySelector('.inicio-portada__antetitulo')
    expect(antetitulo).toHaveTextContent(`${NOMBRE_CAMPUS} · ${TEXTOS_INICIO.ciudad}`)
    expect(antetitulo?.textContent).not.toMatch(/\d/)
    expect(antetitulo?.textContent).not.toContain(TEXTOS_INICIO.sectorPlural)
  })

  it('tiene el único h1, con la segunda parte en un span de acento', () => {
    const { container } = verPortada(5)
    const titulos = screen.getAllByRole('heading', { level: 1 })
    expect(titulos).toHaveLength(1)
    expect(titulos[0]).toHaveTextContent(
      `${TEXTOS_INICIO.tituloPortada}${TEXTOS_INICIO.tituloPortadaAcento}`,
    )
    const acento = container.querySelector('h1 span')
    expect(acento).toHaveTextContent(TEXTOS_INICIO.tituloPortadaAcento)
  })

  it('muestra la frase y el enlace principal al mapa con una flecha decorativa', () => {
    const { container } = verPortada(5)
    expect(screen.getByText(TEXTOS_INICIO.frasePortada)).toBeInTheDocument()
    const enlace = screen.getByRole('link', { name: TEXTOS_INICIO.explorarMapa })
    expect(enlace).toHaveAttribute('href', RUTAS.mapa)
    expect(enlace.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    // El árbol pixel grande es decorativo
    const arbol = container.querySelector('.inicio-portada__arbol svg.glifo-pixel')
    expect(arbol).toHaveAttribute('aria-hidden', 'true')
  })

  it('el enlace principal es el botón del sistema con forma de píldora', () => {
    verPortada(5)
    const enlace = screen.getByRole('link', { name: TEXTOS_INICIO.explorarMapa })
    expect(enlace).toHaveClass('boton', 'boton--pildora')
  })

  it('trae «Ver destacados» como botón secundario que apunta al bloque de destacados', () => {
    verPortada(5)
    const ancla = screen.getByRole('link', { name: TEXTOS_INICIO.verDestacados })
    expect(ancla).toHaveClass('boton', 'boton--secundario')
    expect(ancla).not.toHaveClass('boton--pildora')
    expect(ancla).toHaveAttribute('href', `#${ID_TITULO_DESTACADOS}`)
  })

  it('al pulsar «Ver destacados» el foco pasa al título del bloque', () => {
    verPortada(5)
    const titulo = document.createElement('h2')
    titulo.id = ID_TITULO_DESTACADOS
    titulo.tabIndex = -1
    document.body.append(titulo)
    fireEvent.click(screen.getByRole('link', { name: TEXTOS_INICIO.verDestacados }))
    expect(titulo).toHaveFocus()
    titulo.remove()
  })

  it('el principal sigue primero y hay un solo botón por objetivo', () => {
    const { container } = verPortada(5)
    const botones = container.querySelectorAll('.inicio-portada__acciones a')
    expect([...botones].map((b) => b.textContent)).toEqual([
      TEXTOS_INICIO.explorarMapa,
      TEXTOS_INICIO.verDestacados,
    ])
  })
})
