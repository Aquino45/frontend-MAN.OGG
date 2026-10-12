// Pantalla principal: el mapa de sectores y, al entrar en uno, su panel con la lista de árboles
// o la cartilla del árbol abierto. El sector y el árbol abiertos viven en la URL.
import '../estilos.css'
import '../hoja.estilos.css'
import '../destacados.estilos.css'
import '../satelite.estilos.css'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import { EstadoError } from '@/compartido/EstadoError'
import { VistaCartilla } from '@/modulos/cartilla'
import {
  FRASES_CARGA,
  MAPA_GLIFOS_POR_SECTOR,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  TEXTOS_MAPA,
  TEXTOS_PANEL,
} from '@/config/constantes'
import { obtenerConfigSatelite, type ConfigSatelite } from '@/config/entorno'
import { TEXTOS_SATELITE, type VistaMapaTipo } from '@/config/satelite'
import { elegirVariante } from '@/lib/elegirVariante'
import { ControlVistaMapa } from '../componentes/ControlVistaMapa'
import type { FormaGlifo } from '../componentes/GlifoArbol'
import { MapaSectores } from '../componentes/MapaSectores'
import { PanelSector } from '../componentes/PanelSector'
import { useArbolesDeSector } from '../hooks/useArbolesDeSector'
import { useColorNatural } from '../hooks/useColorNatural'
import { useRetornoDeFoco } from '../hooks/useRetornoDeFoco'
import { useHojaArrastrable } from '../hooks/useHojaArrastrable'
import { useSeleccionEnUrl } from '../hooks/useSeleccionEnUrl'

const TECLA_ESCAPE = 'Escape'
// Proporción del esqueleto del mapa mientras carga (la misma del mapa compacto de Inicio)
import { PROPORCION_MAPA } from './proporcionMapa'

// MapLibre pesa: el mapa satelital se descarga solo cuando alguien activa «Satélite».
const MapaSatelite = lazy(() => import('../componentes/MapaSatelite'))

interface PropsVistaMapa {
  // Fuente de azar para las variantes de adorno; se inyecta en los tests.
  aleatorio?: () => number
  // Vista satelital: sin configuración (sin clave) no hay botón. Se inyecta en los tests.
  configSatelite?: ConfigSatelite | null
}

export function VistaMapa({
  aleatorio = Math.random,
  configSatelite = obtenerConfigSatelite(),
}: PropsVistaMapa) {
  const sectores = useSectoresDelCampus()
  const [vista, setVista] = useState<VistaMapaTipo>('ilustrado')
  const [colorNatural, alternarColorNatural] = useColorNatural()
  const seleccion = useSeleccionEnUrl()
  const recordarOrigen = useRetornoDeFoco(seleccion.arbolCodigo)
  const [sectorResaltado, setSectorResaltado] = useState<number | null>(null)
  const [arbolResaltado, setArbolResaltado] = useState<string | null>(null)
  const [fraseCarga] = useState(() => FRASES_CARGA[elegirVariante(PESOS_FRASES_CARGA, aleatorio())])
  const cantidadSectores = sectores.estado === 'listo' ? sectores.sectores.length : 0
  const formasGlifos = useMemo<FormaGlifo[]>(
    () =>
      Array.from({ length: cantidadSectores * MAPA_GLIFOS_POR_SECTOR }, () =>
        elegirVariante(PESOS_GLIFOS_ARBOL, aleatorio()),
      ),
    [cantidadSectores, aleatorio],
  )

  const sectorAbierto =
    sectores.estado === 'listo'
      ? sectores.sectores.find((sector) => sector.id === seleccion.sectorId)
      : undefined
  const arboles = useArbolesDeSector(sectorAbierto?.id ?? null)
  const { arbolCodigo, cerrarArbol, cerrarSector } = seleccion
  // Bajar la hoja del celular cierra un nivel, como Esc: con la cartilla abierta vuelve a la lista.
  const { refHoja, propsAsa } = useHojaArrastrable({
    onCerrar: arbolCodigo === null ? cerrarSector : cerrarArbol,
    salePorAbajo: arbolCodigo === null,
  })

  // Esc cierra primero la cartilla y después el sector.
  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== TECLA_ESCAPE || evento.defaultPrevented) return
      if (arbolCodigo !== null) cerrarArbol()
      else if (sectorAbierto) cerrarSector()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [arbolCodigo, sectorAbierto, cerrarArbol, cerrarSector])

  if (sectores.estado === 'cargando') {
    return (
      <section className="vista-mapa">
        <EstadoCarga etiqueta={fraseCarga} forma="bloque" proporcion={PROPORCION_MAPA} />
      </section>
    )
  }

  if (sectores.estado === 'error') {
    return (
      <section className="vista-mapa">
        <EstadoError mensaje={TEXTOS_MAPA.errorSectores} onReintentar={sectores.reintentar} />
      </section>
    )
  }

  const abrirArbol = (codigo: string) => {
    recordarOrigen(codigo)
    seleccion.seleccionarArbol(codigo)
  }

  const alSeleccionarSector = (sectorId: number) => {
    if (sectorId !== sectorAbierto?.id) seleccion.seleccionarSector(sectorId)
  }

  return (
    <section className={`vista-mapa${sectorAbierto ? ' vista-mapa--con-sector' : ''}`}>
      <div className="vista-mapa__mapa">
        {configSatelite && (
          <ControlVistaMapa
            vista={vista}
            colorNatural={colorNatural}
            onCambiarVista={setVista}
            onAlternarColor={alternarColorNatural}
          />
        )}
        {configSatelite && vista === 'satelite' ? (
          <Suspense
            fallback={
              <EstadoCarga
                etiqueta={TEXTOS_SATELITE.cargando}
                forma="bloque"
                proporcion={PROPORCION_MAPA}
              />
            }
          >
            <MapaSatelite
              sectores={sectores.sectores}
              sectorSeleccionado={sectorAbierto?.id ?? null}
              arboles={arboles.estado === 'listo' ? arboles.arboles : undefined}
              config={configSatelite}
              colorNatural={colorNatural}
              onSeleccionar={alSeleccionarSector}
              onAbrirArbol={abrirArbol}
            />
          </Suspense>
        ) : (
          <MapaSectores
            sectores={sectores.sectores}
            sectorResaltado={sectorResaltado}
            sectorSeleccionado={sectorAbierto?.id ?? null}
            formasGlifos={formasGlifos}
            onResaltar={setSectorResaltado}
            onSeleccionar={alSeleccionarSector}
            arboles={arboles.estado === 'listo' ? arboles.arboles : undefined}
            arbolResaltado={arbolResaltado}
            onResaltarArbol={setArbolResaltado}
            onAbrirArbol={abrirArbol}
          />
        )}
      </div>
      {sectorAbierto && (
        <aside
          ref={refHoja}
          className="vista-mapa__panel"
          aria-label={
            arbolCodigo ?? `${TEXTOS_PANEL.hojaInferior}: ${sectorAbierto.properties.nombre}`
          }
        >
          <div className="vista-mapa__asa" aria-hidden="true" {...propsAsa} />
          {arbolCodigo === null ? (
            <PanelSector
              sector={sectorAbierto.properties}
              arboles={arboles}
              fraseCarga={fraseCarga}
              codigoResaltado={arbolResaltado}
              onResaltar={setArbolResaltado}
              onAbrir={abrirArbol}
              onVolver={cerrarSector}
              onReintentar={arboles.reintentar}
            />
          ) : (
            <VistaCartilla
              codigo={arbolCodigo}
              nombreSector={sectorAbierto.properties.nombre}
              onVolver={cerrarArbol}
            />
          )}
        </aside>
      )}
    </section>
  )
}
