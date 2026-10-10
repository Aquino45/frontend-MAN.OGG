// Pantalla principal: el mapa de sectores y, al entrar en uno, su panel con la lista de árboles
// o la cartilla del árbol abierto. El sector y el árbol abiertos viven en la URL.
import '../estilos.css'
import { useEffect, useMemo, useState } from 'react'
import { VistaCartilla } from '@/modulos/cartilla'
import {
  FRASES_CARGA,
  MAPA_GLIFOS_POR_SECTOR,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  TEXTOS_MAPA,
  TEXTOS_PANEL,
} from '@/config/constantes'
import { elegirVariante } from '@/lib/elegirVariante'
import type { FormaGlifo } from '../componentes/GlifoArbol'
import { MapaSectores } from '../componentes/MapaSectores'
import { PanelSector } from '../componentes/PanelSector'
import { useArbolesDeSector } from '../hooks/useArbolesDeSector'
import { useSectores } from '../hooks/useSectores'
import { useRetornoDeFoco } from '../hooks/useRetornoDeFoco'
import { useSeleccionEnUrl } from '../hooks/useSeleccionEnUrl'

const TECLA_ESCAPE = 'Escape'

interface PropsVistaMapa {
  // Fuente de azar para las variantes de adorno; se inyecta en los tests.
  aleatorio?: () => number
}

export function VistaMapa({ aleatorio = Math.random }: PropsVistaMapa) {
  const sectores = useSectores()
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
        <p className="vista-mapa__carga" role="status">
          {fraseCarga}
        </p>
      </section>
    )
  }

  if (sectores.estado === 'error') {
    return (
      <section className="vista-mapa">
        <div className="vista-mapa__error" role="alert">
          <p>{TEXTOS_MAPA.errorSectores}</p>
          <button type="button" className="boton" onClick={sectores.reintentar}>
            {TEXTOS_MAPA.reintentar}
          </button>
        </div>
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
      {sectorAbierto && (
        <aside
          className="vista-mapa__panel"
          key={arbolCodigo ?? sectorAbierto.id}
          aria-label={
            arbolCodigo ?? `${TEXTOS_PANEL.hojaInferior}: ${sectorAbierto.properties.nombre}`
          }
        >
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
