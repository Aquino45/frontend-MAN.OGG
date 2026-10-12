// Mapa satelital: la foto de Esri con los mismos sectores y árboles del mapa ilustrado, dibujados
// desde las mismas coordenadas del contrato. Se carga aparte (React.lazy) solo al activar «Satélite»,
// porque MapLibre pesa. La foto se ve en color natural; el teñido con la paleta (opcional) es una
// capa CSS encima del lienzo. Los nombres de los sectores son marcadores HTML (el mapa no tiene
// tipografías de MapLibre). Con movimiento reducido la cámara salta en vez de volar.
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as MapaMapLibre, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl'
// MapLibre busca su worker junto a su propio archivo, y ahí no existe una vez empaquetado: se le da
// el worker ya empaquetado por Vite.
import urlTrabajadorMapLibre from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { EstadoError } from '@/compartido/EstadoError'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import type { ConfigSatelite } from '@/config/entorno'
import { ATRIBUTO_TEMA } from '@/config/constantes'
import {
  SATELITE_ATRIBUCION,
  SATELITE_CAPA_ARBOLES,
  SATELITE_CAPA_IMAGEN,
  SATELITE_CAPA_RELLENO,
  SATELITE_DURACION_VUELO_MS,
  SATELITE_ENLACE_ATRIBUCION,
  SATELITE_FUENTE_ARBOLES,
  SATELITE_FUENTE_SECTORES,
  SATELITE_MARGEN_CAMPUS_PX,
  SATELITE_MARGEN_SECTOR_PX,
  SATELITE_ZOOM_MAXIMO,
  TEXTOS_SATELITE,
} from '@/config/satelite'
import {
  coleccionArboles,
  coleccionSectores,
  limitesDeSector,
  limitesDeSectores,
  posicionEtiqueta,
} from '../lib/geojsonSatelite'
import {
  agregarCapas,
  aplicarColores,
  coloresActuales,
  estiloDeLaImagen,
  saturacion,
} from './capasSatelite'

interface PropsMapaSatelite {
  sectores: readonly SectorFeature[]
  sectorSeleccionado: number | null
  arboles?: readonly ArbolFeature[]
  config: ConfigSatelite
  tenido: boolean
  onSeleccionar: (sectorId: number) => void
  onAbrirArbol: (codigo: string) => void
}

const SIN_ARBOLES: readonly ArbolFeature[] = []

export default function MapaSatelite({
  sectores,
  sectorSeleccionado,
  arboles = SIN_ARBOLES,
  config,
  tenido,
  onSeleccionar,
  onAbrirArbol,
}: PropsMapaSatelite) {
  // El mapa solo se recrea si cambia la dirección o la clave, no porque llegue otro objeto igual
  const { urlTeselas, clave } = config
  const contenedor = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<MapaMapLibre | null>(null)
  const [listo, setListo] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [intento, setIntento] = useState(0)
  const pideMenosMovimiento = usePideMenosMovimiento()

  // Los manejadores del clic viven en refs para no recrear el mapa cuando cambian.
  const alSeleccionar = useRef(onSeleccionar)
  const alAbrirArbol = useRef(onAbrirArbol)
  const tenidoInicial = useRef(tenido)
  useEffect(() => {
    alSeleccionar.current = onSeleccionar
    alAbrirArbol.current = onAbrirArbol
  })

  useEffect(() => {
    const elemento = contenedor.current
    if (!elemento) return
    let mapa: MapaMapLibre
    setWorkerUrl(urlTrabajadorMapLibre)
    try {
      mapa = new MapaMapLibre({
        container: elemento,
        style: estiloDeLaImagen({ urlTeselas, clave }, tenidoInicial.current),
        attributionControl: false,
        maxZoom: SATELITE_ZOOM_MAXIMO,
      })
    } catch {
      // Sin WebGL el mapa no se puede crear: se avisa fuera del efecto y se ofrece reintentar.
      queueMicrotask(() => setFallo(true))
      return
    }
    mapaRef.current = mapa
    let cargado = false
    mapa.on('load', () => {
      cargado = true
      agregarCapas(mapa, coloresActuales())
      setListo(true)
    })
    mapa.on('error', () => {
      if (!cargado) setFallo(true)
    })
    mapa.on('click', (evento) => {
      const puntos = mapa.queryRenderedFeatures(evento.point, { layers: [SATELITE_CAPA_ARBOLES] })
      const codigo = puntos[0]?.properties?.codigo
      if (typeof codigo === 'string') return alAbrirArbol.current(codigo)
      const zonas = mapa.queryRenderedFeatures(evento.point, { layers: [SATELITE_CAPA_RELLENO] })
      const sectorId = zonas[0]?.properties?.id
      if (typeof sectorId === 'number') alSeleccionar.current(sectorId)
    })
    mapa.on('mousemove', (evento) => {
      const encima = mapa.queryRenderedFeatures(evento.point, {
        layers: [SATELITE_CAPA_ARBOLES, SATELITE_CAPA_RELLENO],
      })
      mapa.getCanvas().style.cursor = encima.length > 0 ? 'pointer' : ''
    })
    // Los colores salen de los tokens: si cambia el tema, se vuelven a leer.
    const vigilante = new MutationObserver(() => {
      if (cargado) aplicarColores(mapa, coloresActuales())
    })
    vigilante.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [ATRIBUTO_TEMA],
    })
    return () => {
      vigilante.disconnect()
      mapa.remove()
      mapaRef.current = null
      setListo(false)
    }
  }, [urlTeselas, clave, intento])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    const fuente = mapa.getSource<GeoJSONSource>(SATELITE_FUENTE_SECTORES)
    fuente?.setData(coleccionSectores(sectores, sectorSeleccionado))
  }, [listo, sectores, sectorSeleccionado])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    const fuente = mapa.getSource<GeoJSONSource>(SATELITE_FUENTE_ARBOLES)
    fuente?.setData(coleccionArboles(arboles))
  }, [listo, arboles])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    mapa.setPaintProperty(SATELITE_CAPA_IMAGEN, 'raster-saturation', saturacion(tenido))
  }, [tenido, listo])

  // Nombres de los sectores sobre la foto (decorativos: los botones de abajo ya los nombran)
  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    const marcadores = sectores.map((sector) => {
      const elemento = document.createElement('span')
      elemento.className = 'mapa-satelite__etiqueta'
      elemento.setAttribute('aria-hidden', 'true')
      elemento.textContent = sector.properties.nombre
      return new Marker({ element: elemento }).setLngLat(posicionEtiqueta(sector)).addTo(mapa)
    })
    return () => marcadores.forEach((marcador) => marcador.remove())
  }, [listo, sectores])

  // Encuadre: todo el campus, o el sector abierto. Con movimiento reducido, la cámara salta.
  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    const limites =
      (sectorSeleccionado !== null ? limitesDeSector(sectores, sectorSeleccionado) : null) ??
      limitesDeSectores(sectores)
    if (!limites) return
    // Al abrir un sector el panel le quita ancho al mapa: se vuelve a medir antes de encuadrar
    mapa.resize()
    const padding =
      sectorSeleccionado !== null ? SATELITE_MARGEN_SECTOR_PX : SATELITE_MARGEN_CAMPUS_PX
    if (pideMenosMovimiento) {
      const camara = mapa.cameraForBounds(limites, { padding })
      if (camara) mapa.jumpTo(camara)
    } else {
      mapa.fitBounds(limites, { padding, duration: SATELITE_DURACION_VUELO_MS })
    }
  }, [listo, sectores, sectorSeleccionado, pideMenosMovimiento])

  if (fallo) {
    return (
      <EstadoError
        mensaje={`${TEXTOS_SATELITE.errorTitulo} ${TEXTOS_SATELITE.errorAyuda}`}
        onReintentar={() => {
          setFallo(false)
          setIntento((anterior) => anterior + 1)
        }}
      />
    )
  }

  return (
    <div className="mapa-satelite">
      <div className="mapa-satelite__marco">
        <div
          ref={contenedor}
          className="mapa-satelite__lienzo"
          role="region"
          aria-label={TEXTOS_SATELITE.etiquetaMapa}
        />
        {tenido && <div className="mapa-satelite__tinte" aria-hidden="true" />}
        {!listo && (
          <p className="mapa-satelite__cargando" role="status">
            {TEXTOS_SATELITE.cargando}
          </p>
        )}
      </div>
      <p className="mapa-satelite__atribucion">
        {TEXTOS_SATELITE.atribucionEtiqueta}:{' '}
        <a href={SATELITE_ENLACE_ATRIBUCION} target="_blank" rel="noreferrer">
          {SATELITE_ATRIBUCION}
        </a>
      </p>
      <nav aria-label={TEXTOS_SATELITE.listaSectores}>
        <ul className="mapa-satelite__sectores">
          {sectores.map((sector) => (
            <li key={sector.id}>
              <button
                type="button"
                className="boton boton--secundario"
                aria-pressed={sector.id === sectorSeleccionado}
                onClick={() => onSeleccionar(sector.id)}
              >
                {sector.properties.nombre}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
