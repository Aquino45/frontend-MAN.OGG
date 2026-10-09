// Pantalla principal: el mapa de sectores con su estado de carga y la franja del seleccionado.
import { useMemo, useState } from 'react'
import {
  FRASES_CARGA,
  MAPA_GLIFOS_POR_SECTOR,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  TEXTOS_MAPA,
} from '@/config/constantes'
import { elegirVariante } from '@/lib/elegirVariante'
import { FranjaSector } from '../componentes/FranjaSector'
import type { FormaGlifo } from '../componentes/GlifoArbol'
import { MapaSectores } from '../componentes/MapaSectores'
import { useSectores } from '../hooks/useSectores'

interface PropsVistaMapa {
  // Fuente de azar para las variantes de adorno; se inyecta en los tests.
  aleatorio?: () => number
}

export function VistaMapa({ aleatorio = Math.random }: PropsVistaMapa) {
  const sectores = useSectores()
  const [sectorResaltado, setSectorResaltado] = useState<number | null>(null)
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null)
  const [fraseCarga] = useState(() => FRASES_CARGA[elegirVariante(PESOS_FRASES_CARGA, aleatorio())])
  const cantidadSectores = sectores.estado === 'listo' ? sectores.sectores.length : 0
  const formasGlifos = useMemo<FormaGlifo[]>(
    () =>
      Array.from({ length: cantidadSectores * MAPA_GLIFOS_POR_SECTOR }, () =>
        elegirVariante(PESOS_GLIFOS_ARBOL, aleatorio()),
      ),
    [cantidadSectores, aleatorio],
  )

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

  const seleccionado = sectores.sectores.find((sector) => sector.id === sectorSeleccionado)

  return (
    <section className="vista-mapa">
      <MapaSectores
        sectores={sectores.sectores}
        sectorResaltado={sectorResaltado}
        sectorSeleccionado={sectorSeleccionado}
        formasGlifos={formasGlifos}
        onResaltar={setSectorResaltado}
        onSeleccionar={setSectorSeleccionado}
      />
      <div className="vista-mapa__franja" aria-live="polite">
        {seleccionado && (
          <FranjaSector
            key={seleccionado.id}
            nombre={seleccionado.properties.nombre}
            totalArboles={seleccionado.properties.total_arboles}
          />
        )}
      </div>
    </section>
  )
}
