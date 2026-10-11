// Página «Árboles»: todos los árboles del campus con buscador y filtros guardados en la URL.
import '../estilos.css'
import { useDeferredValue, useMemo } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { useArbolesDelCampus } from '@/compartido/useArbolesDelCampus'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import { REGION_INTERFAZ, TEXTOS_ESTADOS, TEXTOS_EXPLORAR } from '@/config/constantes'
import { BarraFiltros } from '../componentes/BarraFiltros'
import { FilaArbol } from '../componentes/FilaArbol'
import { useBusquedaLocal } from '../hooks/useBusquedaLocal'
import { useFiltrosEnUrl } from '../hooks/useFiltrosEnUrl'
import { filtrarArboles, hayFiltros, opcionesDeEstado, ordenarArboles } from '../lib/filtros'

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })
// Filas del esqueleto mientras carga la lista (solo la forma, sin datos)
const FILAS_ESQUELETO = 6

export function VistaExplorar() {
  const sectores = useSectoresDelCampus()
  const sectoresListos = sectores.estado === 'listo' ? sectores.sectores : null
  const idsDeSectores = useMemo(
    () => sectoresListos?.map((sector) => sector.properties.id) ?? null,
    [sectoresListos],
  )
  const arboles = useArbolesDelCampus(idsDeSectores)
  const { filtros, cambiar, limpiar } = useFiltrosEnUrl()
  // El texto del buscador va por delante de la URL; la lista se filtra con un valor diferido
  const busqueda = useBusquedaLocal(filtros.busqueda, (texto) => cambiar({ busqueda: texto }, true))
  const filtrosDiferidos = useDeferredValue(filtros)

  const resumenes = useMemo(
    () =>
      arboles.estado === 'listo' ? arboles.arboles.map((feature) => feature.properties) : null,
    [arboles],
  )
  const opcionesSector = useMemo(
    () => (sectoresListos ?? []).map((s) => ({ id: s.properties.id, nombre: s.properties.nombre })),
    [sectoresListos],
  )
  const nombresDeSector = useMemo(
    () => new Map(opcionesSector.map((sector) => [sector.id, sector.nombre])),
    [opcionesSector],
  )
  const estados = useMemo(() => opcionesDeEstado(resumenes ?? []), [resumenes])
  const visibles = useMemo(
    () => (resumenes ? ordenarArboles(filtrarArboles(resumenes, filtrosDiferidos)) : []),
    [resumenes, filtrosDiferidos],
  )

  const hayError = sectores.estado === 'error' || arboles.estado === 'error'
  const reintentar = sectores.estado === 'error' ? sectores.reintentar : arboles.reintentar
  const listo = resumenes !== null

  return (
    <section className="explorar">
      <h1 className="explorar__titulo">{TEXTOS_EXPLORAR.titulo}</h1>
      {hayError && <EstadoError mensaje={TEXTOS_EXPLORAR.error} onReintentar={reintentar} />}
      {!hayError && !listo && (
        <EstadoCarga etiqueta={TEXTOS_EXPLORAR.cargando} forma="lista" cantidad={FILAS_ESQUELETO} />
      )}
      {!hayError && listo && (
        <>
          <BarraFiltros
            filtros={filtros}
            busqueda={busqueda.texto}
            onBuscar={busqueda.cambiar}
            sectores={opcionesSector}
            estados={estados}
            onCambiar={cambiar}
          />
          <h2 className="solo-lectores">{TEXTOS_EXPLORAR.resultados}</h2>
          <p className="explorar__contador" aria-live="polite">
            {FORMATO_ENTERO.format(visibles.length)}{' '}
            {visibles.length === 1 ? TEXTOS_EXPLORAR.arbolSingular : TEXTOS_EXPLORAR.arbolPlural}
          </p>
          {visibles.length > 0 ? (
            <ul className="explorar__lista" role="list">
              {visibles.map((arbol) => (
                <li key={arbol.uid} className="explorar__item">
                  <FilaArbol
                    arbol={arbol}
                    nombreSector={nombresDeSector.get(arbol.sector) ?? null}
                  />
                </li>
              ))}
            </ul>
          ) : hayFiltros(filtrosDiferidos) ? (
            <EstadoVacio
              mensaje={TEXTOS_EXPLORAR.sinResultados}
              accion={{ texto: TEXTOS_ESTADOS.limpiarFiltros, alPulsar: limpiar }}
            />
          ) : (
            <EstadoVacio mensaje={TEXTOS_EXPLORAR.sinArboles} />
          )}
        </>
      )}
    </section>
  )
}
