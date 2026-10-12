import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorApi } from '@/api/cliente'
import { TEXTOS_CIFRAS, TEXTOS_ESTADOS } from '@/config/constantes'
import { TEXTOS_TABLERO } from '@/config/tablero'
import { obtenerArbolesFalso, obtenerSectoresFalso } from './montajeCifras'
import { esperarTablero, kpi, prepararApi, tarjeta, ver } from './montajeCifras'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

describe('VistaCifras: estados', () => {
  prepararApi()

  it('mientras carga muestra un esqueleto sin números, y el título siempre', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    ver()
    expect(
      screen.getByRole('heading', { level: 1, name: TEXTOS_CIFRAS.titulo }),
    ).toBeInTheDocument()
    const estado = screen.getByRole('status')
    expect(estado).toHaveAttribute('aria-busy', 'true')
    expect(estado.textContent).not.toMatch(/\d/)
  })

  it('si falla la API muestra el error y Reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    ver()
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    expect(await esperarTablero()).toBeInTheDocument()
  })

  it('sin árboles dice que aún no hay registrados', async () => {
    obtenerArbolesFalso.mockResolvedValue({ type: 'FeatureCollection', features: [] })
    ver()
    expect(await screen.findByText(TEXTOS_CIFRAS.sinArboles)).toBeInTheDocument()
  })
})

describe('VistaCifras: el tablero', () => {
  prepararApi()

  it('trae los seis resúmenes y los filtros', async () => {
    ver()
    await esperarTablero()
    const textos = TEXTOS_TABLERO.kpis
    for (const nombre of [
      textos.arboles,
      textos.especies,
      textos.co2,
      textos.captura,
      textos.mayorDap,
      textos.nativas,
    ]) {
      expect(kpi(nombre)).toBeInTheDocument()
    }
    expect(screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.grupo })).toBeInTheDocument()
  })

  it('campo y ejemplo se cuentan por separado, nunca sumados', async () => {
    ver()
    await esperarTablero()
    const arboles = kpi(TEXTOS_TABLERO.kpis.arboles)
    const lineas = [...arboles.querySelectorAll('.tablero-kpi__linea')].map((l) => l.textContent)
    expect(lineas).toEqual([`3${TEXTOS_TABLERO.kpis.campo}`, `2${TEXTOS_TABLERO.kpis.ejemplo}`])
    expect(within(arboles).queryByText('5')).not.toBeInTheDocument()
  })

  it('«Mayor DAP» separa campo y ejemplo, con enlace a la cartilla de cada uno', async () => {
    ver()
    await esperarTablero()
    const mayor = kpi(TEXTOS_TABLERO.kpis.mayorDap)
    expect(within(mayor).getByRole('link', { name: /S01-A001/ })).toHaveAttribute(
      'href',
      '/mapa?sector=1&arbol=S01-A001',
    )
    expect(within(mayor).getByRole('link', { name: /S02-D001/ })).toHaveAttribute(
      'href',
      '/mapa?sector=2&arbol=S02-D001',
    )
    expect(mayor).toHaveTextContent('392')
    expect(mayor).toHaveTextContent('422')
  })

  it('«Nativas» separa campo y ejemplo', async () => {
    ver()
    await esperarTablero()
    const nativas = kpi(TEXTOS_TABLERO.kpis.nativas)
    // Campo: 2 nativas de 3 (67 %); ejemplo: 1 de 2 (50 %)
    expect(nativas).toHaveTextContent('67 %')
    expect(nativas).toHaveTextContent('50 %')
    expect(nativas).toHaveTextContent('2 de 3')
    expect(nativas).toHaveTextContent('1 de 2')
  })

  it('el CO₂ va marcado como simulado y separado en campo y ejemplo', async () => {
    ver()
    await esperarTablero()
    const co2 = kpi(TEXTOS_TABLERO.kpis.co2)
    expect(within(co2).getByText(TEXTOS_TABLERO.kpis.simulado)).toBeInTheDocument()
    expect(co2).toHaveTextContent(TEXTOS_TABLERO.kpis.campo)
    expect(co2).toHaveTextContent(TEXTOS_TABLERO.kpis.ejemplo)
  })

  it('cada gráfico trae su tabla, plegada bajo él', async () => {
    ver()
    await esperarTablero()
    for (const titulo of [
      TEXTOS_TABLERO.mapaCalor.titulo,
      TEXTOS_TABLERO.especies.titulo,
      TEXTOS_TABLERO.estado.titulo,
      TEXTOS_TABLERO.nativas.titulo,
      TEXTOS_TABLERO.dispersion.titulo,
      TEXTOS_TABLERO.histograma.titulo,
    ]) {
      const unaTarjeta = tarjeta(titulo)
      expect(unaTarjeta.querySelector('details.tablero-tabla summary')).not.toBeNull()
      expect(unaTarjeta.querySelector('table')).not.toBeNull()
    }
  })

  it('la tabla de la dispersión lista los árboles con su DAP y su altura', async () => {
    ver()
    await esperarTablero()
    const filas = [...tarjeta(TEXTOS_TABLERO.dispersion.titulo).querySelectorAll('tbody tr')].map(
      (fila) => fila.textContent,
    )
    expect(filas.some((fila) => fila?.includes('S02-D001') && fila.includes('422'))).toBe(true)
  })

  it('la dispersión pone un enlace por árbol con medidas, y el de ejemplo va marcado', async () => {
    ver()
    await esperarTablero()
    const dispersion = tarjeta(TEXTOS_TABLERO.dispersion.titulo)
    // Cuatro de los cinco árboles tienen DAP y altura
    expect(dispersion.querySelectorAll('a.tablero-punto')).toHaveLength(4)
    const deEjemplo = dispersion.querySelector('a.tablero-punto[href*="S02-D001"]')
    expect(deEjemplo).toHaveAttribute('data-ejemplo', 'si')
    expect(deEjemplo).toHaveAttribute('aria-label', expect.stringContaining('DAP 422 cm'))
    expect(dispersion.textContent).toContain('1 árbol sin DAP o sin altura no aparece')
  })

  it('el histograma cuenta campo y ejemplo aparte y avisa de los que no tienen DAP', async () => {
    ver()
    await esperarTablero()
    const histograma = tarjeta(TEXTOS_TABLERO.histograma.titulo)
    expect(histograma.textContent).toContain('1 árbol sin DAP no aparece')
    const filas = [...histograma.querySelectorAll('tbody tr')].map((fila) =>
      [...fila.querySelectorAll('th, td')].map((celda) => celda.textContent),
    )
    // Campo: 75 y 392; ejemplo: 110 y 422
    expect(filas.find((fila) => fila[0] === '50 a 100')).toEqual(['50 a 100', '1', '0'])
    expect(filas.find((fila) => fila[0] === '100 a 150')).toEqual(['100 a 150', '0', '1'])
  })
})
