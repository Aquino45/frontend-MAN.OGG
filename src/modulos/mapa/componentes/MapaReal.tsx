// Mapa sobre la geografía real, en calles o en satélite (Esri): los mismos sectores y árboles del
// mapa ilustrado, dibujados desde las mismas coordenadas del contrato, con el límite continuo si el
// sector es real y punteado si es provisional, y los destacados como estrellas. Se carga aparte
// (React.lazy) solo al activar una de las dos vistas, porque MapLibre pesa. Los nombres de los
// sectores son marcadores HTML (el mapa no tiene tipografías de MapLibre). Con movimiento reducido
// la cámara salta en vez de volar.
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map as MapaMapLibre, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl'
// MapLibre busca su worker junto a su propio archivo, y ahí no existe una vez empaquetado: se le da
// el worker ya empaquetado por Vite.
import urlTrabajadorMapLibre from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { EstadoError } from '@/compartido/EstadoError'
import { usePideMenosMovimiento } from '@/compartido/usePideMenosMovimiento'
import { ATRIBUTO_TEMA } from '@/config/constantes'
import type { ConfigMapaReal } from '@/config/entorno'
import {
  ATRIBUCION_OSM,
  ATRIBUCION_POR_BASE,
  ENLACE_ATRIBUCION_OSM,
  ENLACE_ATRIBUCION_POR_BASE,
  SATELITE_CAPA_ARBOLES,
  SATELITE_CAPA_ESTRELLAS,
  SATELITE_CAPA_RELLENO,
  SATELITE_DURACION_VUELO_MS,
  SATELITE_FUENTE_ARBOLES,
  SATELITE_FUENTE_SECTORES,
  SATELITE_MARGEN_CAMPUS_PX,
  SATELITE_MARGEN_SECTOR_PX,
  SATELITE_TOLERANCIA_CLIC_PX,
  SATELITE_ZOOM_MAXIMO,
  TEXTOS_SATELITE,
  type BaseMapaReal,
} from '@/config/satelite'
import {
  coleccionArboles,
  coleccionSectores,
  limitesDeSector,
  limitesDeSectores,
  posicionEtiqueta,
} from '../lib/geojsonSatelite'
import { agregarCapas, aplicarColores, coloresActuales, estiloDeLaBase } from './capasMapaReal'

interface PropsMapaReal {
  sectores: readonly SectorFeature[]
  sectorSeleccionado: number | null
  arboles?: readonly ArbolFeature[]
  config: ConfigMapaReal
  // Qué se ve debajo de los sectores: las calles o la foto satelital
  base: BaseMapaReal
  onSeleccionar: (sectorId: number) => void
  onAbrirArbol: (codigo: string) => void
}

const SIN_ARBOLES: readonly ArbolFeature[] = []
// Los árboles comunes y los destacados (estrellas) abren su cartilla igual
const CAPAS_ARBOLES = [SATELITE_CAPA_ARBOLES, SATELITE_CAPA_ESTRELLAS]

// Un cuadrado alrededor del puntero: así un punto chico se acierta también con el dedo
function alrededorDe(punto: { x: number; y: number }): [[number, number], [number, number]] {
  const t = SATELITE_TOLERANCIA_CLIC_PX
  return [
    [punto.x - t, punto.y - t],
    [punto.x + t, punto.y + t],
  ]
}

export default function MapaReal({
  sectores,
  sectorSeleccionado,
  arboles = SIN_ARBOLES,
  config,
  base,
  onSeleccionar,
  onAbrirArbol,
}: PropsMapaReal) {
  // El mapa solo se recrea si cambia la dirección o la clave, no porque llegue otro objeto igual
  // Solo el satélite lleva clave; las calles no la piden
  const clave = base === 'satelite' ? config.clave : null
  const urlTeselas = config.urlsTeselas[base]
  const contenedor = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<MapaMapLibre | null>(null)
  const [listo, setListo] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [intento, setIntento] = useState(0)
  const pideMenosMovimiento = usePideMenosMovimiento()

  // Los manejadores del clic viven en refs para no recrear el mapa cuando cambian.
  const alSeleccionar = useRef(onSeleccionar)
  const alAbrirArbol = useRef(onAbrirArbol)
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
        style: estiloDeLaBase({ urlTeselas, clave }),
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
      const puntos = mapa.queryRenderedFeatures(alrededorDe(evento.point), {
        layers: CAPAS_ARBOLES,
      })
      const codigo = puntos[0]?.properties?.codigo
      if (typeof codigo === 'string') return alAbrirArbol.current(codigo)
      const zonas = mapa.queryRenderedFeatures(evento.point, { layers: [SATELITE_CAPA_RELLENO] })
      const sectorId = zonas[0]?.properties?.id
      if (typeof sectorId === 'number') alSeleccionar.current(sectorId)
    })
    mapa.on('mousemove', (evento) => {
      const encima = [
        ...mapa.queryRenderedFeatures(alrededorDe(evento.point), { layers: CAPAS_ARBOLES }),
        ...mapa.queryRenderedFeatures(evento.point, { layers: [SATELITE_CAPA_RELLENO] }),
      ]
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

  // Nombres de los sectores sobre la foto (decorativos: los botones de abajo ya los nombran)
  useEffect(() => {
    const mapa = mapaRef.current
    if (!listo || !mapa) return
    const marcadores = sectores.map((sector) => {
      const elemento = document.createElement('span')
      // Sobre las calles (fondo claro) el nombre va oscuro con halo claro; sobre la foto, al revés
      elemento.className = `mapa-satelite__etiqueta mapa-satelite__etiqueta--${base}`
      elemento.setAttribute('aria-hidden', 'true')
      elemento.textContent = sector.properties.nombre
      return new Marker({ element: elemento }).setLngLat(posicionEtiqueta(sector)).addTo(mapa)
    })
    return () => marcadores.forEach((marcador) => marcador.remove())
  }, [listo, sectores, base])

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
        mensaje={`${TEXTOS_SATELITE.errorTitulo[base]} ${TEXTOS_SATELITE.errorAyuda}`}
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
          aria-label={TEXTOS_SATELITE.etiquetaMapa[base]}
        />
        {!listo && (
          <p className="mapa-satelite__cargando" role="status">
            {TEXTOS_SATELITE.cargando[base]}
          </p>
        )}
      </div>
      <p className="mapa-satelite__atribucion">
        {TEXTOS_SATELITE.atribucionEtiqueta}:{' '}
        <a href={ENLACE_ATRIBUCION_POR_BASE[base]} target="_blank" rel="noreferrer">
          {ATRIBUCION_POR_BASE[base]}
        </a>
        {/* En el satélite el crédito de OpenStreetMap es el de los contornos de los sectores */}
        {base === 'satelite' && (
          <>
            {' · '}
            {TEXTOS_SATELITE.contornos}{' '}
            <a href={ENLACE_ATRIBUCION_OSM} target="_blank" rel="noreferrer">
              {ATRIBUCION_OSM}
            </a>
          </>
        )}
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
