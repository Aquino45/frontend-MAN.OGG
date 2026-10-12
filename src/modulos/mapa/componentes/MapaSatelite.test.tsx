import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SectorFeature } from '@/api/cliente'
import type { ConfigSatelite } from '@/config/entorno'
import { SATELITE_CAPA_ARBOLES, SATELITE_CAPA_RELLENO, TEXTOS_SATELITE } from '@/config/satelite'
import { sectoresMock } from '@/mocks'
import MapaSatelite from './MapaSatelite'

// MapLibre necesita WebGL, que jsdom no tiene: se reemplaza por un mapa falso que registra lo que
// se le pide y deja disparar sus eventos.
const falso = vi.hoisted(() => {
  type Manejador = (evento: unknown) => void
  class MapaFalso {
    static instancias: MapaFalso[] = []
    static fallarAlCrear = false
    opciones: Record<string, unknown>
    manejadores = new Map<string, Manejador[]>()
    capas: string[] = []
    pintura: Record<string, unknown> = {}
    datos: Record<string, unknown> = {}
    camara: string[] = []
    consultas: Record<string, unknown[]> = {}
    removido = false
    constructor(opciones: Record<string, unknown>) {
      if (MapaFalso.fallarAlCrear) throw new Error('sin WebGL')
      this.opciones = opciones
      MapaFalso.instancias.push(this)
    }
    on(evento: string, manejador: Manejador) {
      this.manejadores.set(evento, [...(this.manejadores.get(evento) ?? []), manejador])
    }
    disparar(evento: string, carga: unknown = {}) {
      this.manejadores.get(evento)?.forEach((manejador) => manejador(carga))
    }
    addSource(id: string) {
      this.datos[id] = null
    }
    addLayer(capa: { id: string }) {
      this.capas.push(capa.id)
    }
    getSource(id: string) {
      return { setData: (datos: unknown) => (this.datos[id] = datos) }
    }
    setPaintProperty(capa: string, propiedad: string, valor: unknown) {
      this.pintura[`${capa}.${propiedad}`] = valor
    }
    queryRenderedFeatures(_punto: unknown, { layers }: { layers: string[] }) {
      return this.consultas[layers[0]] ?? []
    }
    resize() {
      this.camara.push('resize')
    }
    cameraForBounds() {
      return { center: [0, 0], zoom: 5 }
    }
    jumpTo() {
      this.camara.push('jumpTo')
    }
    fitBounds() {
      this.camara.push('fitBounds')
    }
    getCanvas() {
      return document.createElement('canvas')
    }
    remove() {
      this.removido = true
    }
  }
  class MarcadorFalso {
    static creados: { texto: string; posicion: [number, number]; removido: boolean }[] = []
    registro: { texto: string; posicion: [number, number]; removido: boolean }
    constructor({ element }: { element: HTMLElement }) {
      this.registro = { texto: element.textContent ?? '', posicion: [0, 0], removido: false }
      MarcadorFalso.creados.push(this.registro)
    }
    setLngLat(posicion: [number, number]) {
      this.registro.posicion = posicion
      return this
    }
    addTo() {
      return this
    }
    remove() {
      this.registro.removido = true
    }
  }
  const ponerTrabajador = vi.fn()
  return { MapaFalso, MarcadorFalso, ponerTrabajador }
})

vi.mock('maplibre-gl', () => ({
  Map: falso.MapaFalso,
  Marker: falso.MarcadorFalso,
  setWorkerUrl: falso.ponerTrabajador,
}))

const CONFIG: ConfigSatelite = { urlTeselas: 'https://teselas.test/{z}/{y}/{x}', clave: 'k&1' }
const SECTORES = sectoresMock.features as SectorFeature[]

function pintar(propiedades: Partial<React.ComponentProps<typeof MapaSatelite>> = {}) {
  const props = {
    sectores: SECTORES,
    sectorSeleccionado: null,
    config: CONFIG,
    tenido: false,
    onSeleccionar: vi.fn(),
    onAbrirArbol: vi.fn(),
    ...propiedades,
  }
  return { ...render(<MapaSatelite {...props} />), props }
}

const ultimoMapa = () => falso.MapaFalso.instancias[falso.MapaFalso.instancias.length - 1]
const cargar = () => act(() => ultimoMapa().disparar('load'))

function simularMovimientoReducido(reducido: boolean) {
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    matches: reducido,
    media: consulta,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('MapaSatelite', () => {
  beforeEach(() => {
    falso.MapaFalso.instancias = []
    falso.MapaFalso.fallarAlCrear = false
    simularMovimientoReducido(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pide la foto con la clave escapada y la atribución queda visible', () => {
    pintar()
    const estilo = ultimoMapa().opciones.style as {
      sources: { imagen: { tiles: string[] } }
      layers: { paint: Record<string, number> }[]
    }
    expect(estilo.sources.imagen.tiles).toEqual(['https://teselas.test/{z}/{y}/{x}?token=k%261'])
    expect(estilo.layers[0].paint['raster-saturation']).toBe(0)
    expect(screen.getByRole('link', { name: /Esri/ })).toBeVisible()
  })

  it('al cargar agrega los sectores y los árboles, y encuadra el campus', async () => {
    pintar()
    expect(screen.getByRole('status')).toHaveTextContent(TEXTOS_SATELITE.cargando)
    await cargar()
    expect(ultimoMapa().capas).toContain(SATELITE_CAPA_RELLENO)
    expect(ultimoMapa().capas).toContain(SATELITE_CAPA_ARBOLES)
    expect(screen.queryByRole('status')).toBeNull()
    expect(ultimoMapa().camara).toEqual(['resize', 'fitBounds'])
  })

  it('con movimiento reducido la cámara salta en vez de volar', async () => {
    simularMovimientoReducido(true)
    pintar()
    await cargar()
    expect(ultimoMapa().camara).toEqual(['resize', 'jumpTo'])
  })

  it('la foto se ve en color natural por defecto y «Teñido» pone la capa de la paleta', async () => {
    const { container, rerender, props } = pintar()
    await cargar()
    expect(container.querySelector('.mapa-satelite__tinte')).toBeNull()

    rerender(<MapaSatelite {...props} tenido />)
    expect(container.querySelector('.mapa-satelite__tinte')).not.toBeNull()
    expect(ultimoMapa().pintura['imagen.raster-saturation']).toBe(-1)

    rerender(<MapaSatelite {...props} tenido={false} />)
    expect(container.querySelector('.mapa-satelite__tinte')).toBeNull()
    expect(ultimoMapa().pintura['imagen.raster-saturation']).toBe(0)
  })

  it('le da a MapLibre el worker empaquetado y pone el nombre de cada sector sobre la foto', async () => {
    falso.MarcadorFalso.creados = []
    pintar()
    await cargar()
    expect(falso.ponerTrabajador).toHaveBeenCalledWith(expect.any(String))
    expect(falso.MarcadorFalso.creados.map((marcador) => marcador.texto)).toEqual(
      SECTORES.map((sector) => sector.properties.nombre),
    )
    expect(
      falso.MarcadorFalso.creados.every(
        (marcador) => marcador.posicion[0] !== 0 || marcador.posicion[1] !== 0,
      ),
    ).toBe(true)
  })

  it('quita los nombres de la foto al salir y los vuelve a poner si cambian los sectores', async () => {
    falso.MarcadorFalso.creados = []
    const { rerender, props, unmount } = pintar()
    await cargar()
    expect(falso.MarcadorFalso.creados).toHaveLength(SECTORES.length)
    expect(falso.MarcadorFalso.creados.some((marcador) => marcador.removido)).toBe(false)

    rerender(<MapaSatelite {...props} sectores={SECTORES.slice(0, 2)} />)
    const primerosCreados = falso.MarcadorFalso.creados.slice(0, SECTORES.length)
    expect(primerosCreados.every((marcador) => marcador.removido)).toBe(true)
    expect(falso.MarcadorFalso.creados).toHaveLength(SECTORES.length + 2)

    unmount()
    expect(falso.MarcadorFalso.creados.every((marcador) => marcador.removido)).toBe(true)
  })

  it('no recrea el mapa cuando la vista se vuelve a dibujar con la misma configuración', async () => {
    const { rerender, props } = pintar()
    await cargar()
    const primero = ultimoMapa()
    rerender(<MapaSatelite {...props} config={{ ...CONFIG }} sectorSeleccionado={1} />)
    expect(falso.MapaFalso.instancias).toHaveLength(1)
    expect(primero.removido).toBe(false)
  })

  it('un clic en un árbol lo abre y un clic en un sector lo selecciona', async () => {
    const { props } = pintar()
    await cargar()
    ultimoMapa().consultas[SATELITE_CAPA_ARBOLES] = [{ properties: { codigo: 'S01-A001' } }]
    act(() => ultimoMapa().disparar('click', { point: { x: 1, y: 1 } }))
    expect(props.onAbrirArbol).toHaveBeenCalledWith('S01-A001')
    expect(props.onSeleccionar).not.toHaveBeenCalled()

    ultimoMapa().consultas[SATELITE_CAPA_ARBOLES] = []
    ultimoMapa().consultas[SATELITE_CAPA_RELLENO] = [{ properties: { id: 3 } }]
    act(() => ultimoMapa().disparar('click', { point: { x: 1, y: 1 } }))
    expect(props.onSeleccionar).toHaveBeenCalledWith(3)
  })

  it('los sectores se pueden elegir con los botones, sin usar el mapa', () => {
    const { props } = pintar({ sectorSeleccionado: 2 })
    const botones = screen.getAllByRole('button', { name: /^Sector \d/ })
    expect(botones).toHaveLength(SECTORES.length)
    expect(screen.getByRole('button', { name: /^Sector 2/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(botones[0])
    expect(props.onSeleccionar).toHaveBeenCalledWith(SECTORES[0].id)
  })

  it('si el mapa no se puede crear avisa y Reintentar lo vuelve a intentar', async () => {
    falso.MapaFalso.fallarAlCrear = true
    pintar()
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_SATELITE.errorTitulo)

    falso.MapaFalso.fallarAlCrear = false
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(falso.MapaFalso.instancias).toHaveLength(1)
  })

  it('al salir destruye el mapa', () => {
    const { unmount } = pintar()
    const mapa = ultimoMapa()
    unmount()
    expect(mapa.removido).toBe(true)
  })
})
