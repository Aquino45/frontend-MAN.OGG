import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RUTAS, TEXTOS_ESTADOS, TEXTOS_EXPLORAR } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import {
  codigosVisibles,
  contador,
  esperarLista,
  filas,
  obtenerArbolesFalso,
  prepararApi,
  tipoNavegacion,
  reiniciarApi,
  urlActual,
  ver,
} from './montajeExplorar'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

describe('VistaExplorar: buscador, filtros y URL', () => {
  beforeEach(prepararApi)
  afterEach(reiniciarApi)

  describe('buscador', () => {
    it.each([
      ['código', 's02-a002', ['S02-A002']],
      ['nombre común', 'palma', ['S01-A002']],
      ['nombre científico', 'PROSOPIS', ['S02-A001']],
      ['sin tildes', 'alamo', ['S02-A002']],
    ])('busca por %s', async (_n, texto, esperados) => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: texto } })
      await waitFor(() =>
        expect(codigosVisibles().map((href) => href?.split('arbol=')[1])).toEqual(esperados),
      )
    })

    it('escribir actualiza la URL', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'molle' } })
      await waitFor(() => expect(urlActual()).toBe(`${RUTAS.arboles}?q=molle`))
    })

    it('lo que se teclea se ve al instante, antes de que la URL cambie', async () => {
      ver()
      await esperarLista()
      const caja = screen.getByRole('searchbox')
      fireEvent.change(caja, { target: { value: 'mol' } })
      expect(caja).toHaveValue('mol')
      expect(urlActual()).toBe(RUTAS.arboles)
    })

    it('escribir en medio no mueve el cursor aunque la URL se actualice después', async () => {
      ver()
      await esperarLista()
      const caja = screen.getByRole('searchbox') as HTMLInputElement
      fireEvent.change(caja, { target: { value: 'huarango' } })
      caja.setSelectionRange(2, 2)
      fireEvent.change(caja, { target: { value: 'huYarango' } })
      caja.setSelectionRange(3, 3)
      await waitFor(() => expect(urlActual()).toBe(`${RUTAS.arboles}?q=huYarango`))
      expect(caja).toHaveValue('huYarango')
      expect(caja.selectionStart).toBe(3)
    })

    it('la URL se escribe reemplazando la entrada del historial', async () => {
      ver()
      await esperarLista()
      const caja = screen.getByRole('searchbox')
      for (const valor of ['m', 'mo', 'mol', 'moll', 'molle']) {
        fireEvent.change(caja, { target: { value: valor } })
      }
      await waitFor(() => expect(urlActual()).toBe(`${RUTAS.arboles}?q=molle`))
      // Escribir en el buscador nunca agrega entradas al historial
      expect(tipoNavegacion()).toBe('REPLACE')
    })

    it('«atrás» y «Limpiar filtros» actualizan lo que se ve en el buscador', async () => {
      ver(`${RUTAS.arboles}?q=zzz`)
      await screen.findByText(TEXTOS_EXPLORAR.sinResultados)
      expect(screen.getByRole('searchbox')).toHaveValue('zzz')
      fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros }))
      expect(screen.getByRole('searchbox')).toHaveValue('')
      fireEvent.click(screen.getByRole('button', { name: 'atrás-prueba' }))
      expect(await screen.findByText(TEXTOS_EXPLORAR.sinResultados)).toBeVisible()
      expect(screen.getByRole('searchbox')).toHaveValue('zzz')
    })
  })

  describe('filtros', () => {
    it('las opciones de sector salen de la API y las de estado, de los valores que traen los árboles', async () => {
      ver()
      await esperarLista()
      const sector = screen.getByLabelText(TEXTOS_EXPLORAR.sector)
      const nombres = sectoresMock.features.map((s) => s.properties.nombre)
      expect(
        within(sector)
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual([TEXTOS_EXPLORAR.todosSectores, ...nombres])
      const estado = screen.getByLabelText(TEXTOS_EXPLORAR.estado)
      expect(
        within(estado)
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual([TEXTOS_EXPLORAR.todosEstados, 'Bueno', 'Regular'])
    })

    it('por sector', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.sector), { target: { value: '2' } })
      expect(filas()).toHaveLength(2)
      expect(urlActual()).toBe(`${RUTAS.arboles}?sector=2`)
    })

    it('por estado general', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.estado), {
        target: { value: 'Regular' },
      })
      expect(filas()).toHaveLength(2)
      expect(urlActual()).toBe(`${RUTAS.arboles}?estado=Regular`)
    })

    it('por destacado', async () => {
      ver()
      await esperarLista()
      fireEvent.click(screen.getByRole('checkbox', { name: TEXTOS_EXPLORAR.soloDestacados }))
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?destacados=1`)
    })

    it('por origen del dato: campo y ejemplo', async () => {
      ver()
      await esperarLista()
      const origen = screen.getByLabelText(TEXTOS_EXPLORAR.origen)
      fireEvent.change(origen, { target: { value: 'ejemplo' } })
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?origen=ejemplo`)
      fireEvent.change(origen, { target: { value: 'campo' } })
      expect(filas()).toHaveLength(3)
    })

    it('combinados se suman', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.sector), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.estado), {
        target: { value: 'Regular' },
      })
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?sector=1&estado=Regular`)
    })

    it('todos los controles tienen etiqueta visible', async () => {
      ver()
      await esperarLista()
      for (const etiqueta of [
        TEXTOS_EXPLORAR.buscar,
        TEXTOS_EXPLORAR.sector,
        TEXTOS_EXPLORAR.estado,
        TEXTOS_EXPLORAR.origen,
        TEXTOS_EXPLORAR.soloDestacados,
      ]) {
        expect(screen.getByLabelText(etiqueta)).toBeVisible()
      }
    })
  })

  describe('la URL manda', () => {
    it('un sector de la URL que la API no tiene se refleja en el selector y deja la lista vacía', async () => {
      ver(`${RUTAS.arboles}?sector=99`)
      expect(await screen.findByText(TEXTOS_EXPLORAR.sinResultados)).toBeVisible()
      const selector = screen.getByLabelText(TEXTOS_EXPLORAR.sector)
      expect(selector).toHaveValue('99')
      expect(
        within(selector).getByRole('option', {
          name: TEXTOS_EXPLORAR.sectorDesconocido.replace('{id}', '99'),
        }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros })).toBeVisible()
    })

    it('abrir un enlace con filtros reproduce el estado en la lista y en los controles', async () => {
      ver(`${RUTAS.arboles}?q=a&origen=ejemplo&destacados=1&estado=Regular&sector=2`)
      await esperarLista()
      expect(filas()).toHaveLength(1)
      expect(screen.getByRole('searchbox')).toHaveValue('a')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.origen)).toHaveValue('ejemplo')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.sector)).toHaveValue('2')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.estado)).toHaveValue('Regular')
      expect(screen.getByRole('checkbox', { name: TEXTOS_EXPLORAR.soloDestacados })).toBeChecked()
    })
  })

  describe('sin resultados', () => {
    it('dice que nada coincide y «Limpiar filtros» borra todos los parámetros', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
      await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument())
      expect(screen.getByText(TEXTOS_EXPLORAR.sinResultados)).toBeVisible()
      expect(contador()).toHaveTextContent('0 árboles')
      fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros }))
      expect(urlActual()).toBe(RUTAS.arboles)
      expect(filas()).toHaveLength(4)
      expect(screen.getByRole('searchbox')).toHaveValue('')
    })

    it('si de verdad no hay árboles lo dice, sin «Limpiar filtros» inventado', async () => {
      obtenerArbolesFalso.mockResolvedValue({ type: 'FeatureCollection', features: [] })
      ver()
      expect(await screen.findByText(TEXTOS_EXPLORAR.sinArboles)).toBeVisible()
      expect(screen.queryByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros })).toBeNull()
    })
  })
})
