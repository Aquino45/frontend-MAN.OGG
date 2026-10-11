import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONSULTA_HOVER_FINO } from '@/config/constantes'
import type { Capsula } from '../lib/capsulas'
import { CapsulaAyuda } from './CapsulaAyuda'
import { ProveedorCapsulas } from './ProveedorCapsulas'

const CAPSULAS: Capsula[] = [
  {
    campo: 'altura_total_m',
    titulo: 'Altura total',
    que_es: 'Qué mide la altura.',
    en_este_arbol: null,
  },
  {
    campo: 'dap_cm',
    titulo: 'DAP',
    que_es: 'El grosor del tronco.',
    en_este_arbol: 'Este tronco es grueso.',
  },
  { campo: 'copa_ns_m', titulo: 'Copa N-S', que_es: 'Copa norte-sur.', en_este_arbol: null },
  { campo: 'copa_eo_m', titulo: 'Copa E-O', que_es: 'Copa este-oeste.', en_este_arbol: null },
]

function simularHover(hoverFino: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((consulta: string) => ({
      matches: consulta === CONSULTA_HOVER_FINO ? hoverFino : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function verAyudas(capsulas: Capsula[] = CAPSULAS) {
  return render(
    <ProveedorCapsulas capsulas={capsulas}>
      <p>
        Altura <CapsulaAyuda campo="altura_total_m" />
      </p>
      <p>
        DAP <CapsulaAyuda campo="dap_cm" />
      </p>
      <p>
        Copa <CapsulaAyuda campo={['copa_ns_m', 'copa_eo_m']} />
      </p>
      <p>
        Sin cápsula <CapsulaAyuda campo="interferencia_entorno" />
      </p>
      <button type="button">Fuera</button>
    </ProveedorCapsulas>,
  )
}

const botonAltura = () => screen.getByRole('button', { name: 'Qué significa Altura total' })
const botonDap = () => screen.getByRole('button', { name: 'Qué significa DAP' })

describe('CapsulaAyuda', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('un dato sin cápsula no tiene botón', () => {
    verAyudas()
    // «interferencia_entorno» no trae cápsula: solo hay botón para altura, DAP y copa
    expect(screen.getAllByRole('button', { name: /Qué significa/ })).toHaveLength(3)
  })

  it('sin ninguna cápsula (API sin ayudas) no dibuja ningún botón «?»', () => {
    render(
      <ProveedorCapsulas capsulas={[]}>
        <CapsulaAyuda campo="altura_total_m" />
      </ProveedorCapsulas>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('el botón es un ícono SVG, sin texto, con nombre, aria-expanded y aria-controls', () => {
    verAyudas()
    const boton = botonAltura()
    expect(boton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(boton.textContent).toBe('')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    const idBurbuja = boton.getAttribute('aria-controls') ?? ''
    expect(idBurbuja).not.toBe('')
    expect(document.getElementById(idBurbuja)).not.toBeNull()
  })

  it('un clic abre la burbuja y otro clic la cierra', () => {
    verAyudas()
    const boton = botonAltura()
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    expect(burbuja).not.toBeVisible()
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(burbuja).toBeVisible()
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(burbuja).not.toBeVisible()
  })

  it('Esc la cierra, devuelve el foco al botón y el cierre es instantáneo', () => {
    verAyudas()
    const boton = botonAltura()
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    fireEvent.click(boton)
    screen.getByRole('button', { name: 'Fuera' }).focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveFocus()
    expect(burbuja).toHaveAttribute('data-sin-animacion', 'true')
  })

  it('Esc con una burbuja abierta se consume: la pantalla de atrás no lo recibe', () => {
    verAyudas()
    fireEvent.click(botonAltura())
    expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(false)
  })

  it('Esc sin burbuja abierta no se toca', () => {
    verAyudas()
    expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(true)
  })

  it('un clic fuera la cierra; un clic dentro de la burbuja no', () => {
    verAyudas()
    const boton = botonDap()
    fireEvent.click(boton)
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    fireEvent.pointerDown(burbuja)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera' }))
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('solo una a la vez: abrir otra cierra la anterior', () => {
    verAyudas()
    fireEvent.click(botonAltura())
    fireEvent.click(botonDap())
    expect(botonAltura()).toHaveAttribute('aria-expanded', 'false')
    expect(botonDap()).toHaveAttribute('aria-expanded', 'true')
  })

  it('con en_este_arbol, esa línea va primero con su prefijo y luego lo que es', () => {
    verAyudas()
    const boton = botonDap()
    fireEvent.click(boton)
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    const lineas = [...burbuja.querySelectorAll('.capsula__linea')].map(
      (linea) => linea.textContent,
    )
    expect(lineas).toEqual(['En este árbol: Este tronco es grueso.', 'El grosor del tronco.'])
  })

  it('sin en_este_arbol la burbuja solo trae lo que es', () => {
    verAyudas()
    const boton = botonAltura()
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    expect(
      [...burbuja.querySelectorAll('.capsula__linea')].map((linea) => linea.textContent),
    ).toEqual(['Qué mide la altura.'])
  })

  it('copa norte-sur y este-oeste comparten un botón y una burbuja con las dos explicaciones', () => {
    verAyudas()
    const boton = screen.getByRole('button', { name: 'Qué significa Copa N-S y Copa E-O' })
    const burbuja = document.getElementById(
      boton.getAttribute('aria-controls') ?? '',
    ) as HTMLElement
    expect(burbuja).toHaveTextContent('Copa norte-sur.')
    expect(burbuja).toHaveTextContent('Copa este-oeste.')
  })

  describe('con cursor fino y hover real', () => {
    it('abre al pasar el cursor y cierra al salir', () => {
      simularHover(true)
      verAyudas()
      const boton = botonAltura()
      fireEvent.pointerEnter(boton.parentElement as HTMLElement)
      expect(boton).toHaveAttribute('aria-expanded', 'true')
      fireEvent.pointerLeave(boton.parentElement as HTMLElement)
      expect(boton).toHaveAttribute('aria-expanded', 'false')
    })

    it('si se hizo clic, la burbuja queda fija aunque el cursor salga', () => {
      simularHover(true)
      verAyudas()
      const boton = botonAltura()
      fireEvent.pointerEnter(boton.parentElement as HTMLElement)
      fireEvent.click(boton)
      fireEvent.pointerLeave(boton.parentElement as HTMLElement)
      expect(boton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  it('sin hover fino (táctil) pasar el cursor no abre nada, solo el toque o el clic', () => {
    simularHover(false)
    verAyudas()
    const boton = botonAltura()
    fireEvent.pointerEnter(boton.parentElement as HTMLElement)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
  })
})
