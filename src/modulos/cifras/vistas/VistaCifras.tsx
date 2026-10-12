// Página «Cifras del censo»: el tablero. Todo sale de los árboles y los sectores que entrega la API
// y se mueve con los filtros de arriba (sector y datos de campo o de ejemplo, que viven en la URL, y
// la especie y el sector que se eligen con un clic en la dona y en el mapa). Campo y ejemplo se
// cuentan siempre por separado y cada gráfico trae su tabla.
import '../estilos.css'
import '../co2.estilos.css'
import '../tablero.estilos.css'
import '../tarjetas.estilos.css'
import '../graficos.estilos.css'
import '../donas.estilos.css'
import '../barras.estilos.css'
import { useEffect, useMemo, useRef } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { useArbolesDelCampus } from '@/compartido/useArbolesDelCampus'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import {
  CANTIDAD_ESPECIES_CO2_CIFRAS,
  CANTIDAD_TOP_ARBOLES_CO2,
  TEXTOS_CIFRAS,
} from '@/config/constantes'
import {
  ANCHO_RANGO_DAP_CM,
  BLOQUES_ESQUELETO_TABLERO,
  CANTIDAD_ESPECIES_DONA,
  TEXTOS_TABLERO,
} from '@/config/tablero'
import { Dispersion } from '../componentes/Dispersion'
import { DonaEspecies } from '../componentes/DonaEspecies'
import { EstadoPorSector } from '../componentes/EstadoPorSector'
import { FiltrosTablero } from '../componentes/FiltrosTablero'
import { GrupoKpis } from '../componentes/GrupoKpis'
import { Histograma } from '../componentes/Histograma'
import { MapaCalor } from '../componentes/MapaCalor'
import { MediaDonaNativas } from '../componentes/MediaDonaNativas'
import { SeccionCo2 } from '../componentes/SeccionCo2'
import { useFiltrosTablero } from '../hooks/useFiltrosTablero'
import { calcularCifrasCo2 } from '../lib/cifrasCo2'
import { aplicarFiltros, FILTROS_INICIALES } from '../lib/filtrosTablero'
import {
  agruparEspecies,
  calcularKpis,
  calcularMapaCalor,
  especiesPorCantidad,
} from '../lib/tablero'
import { calcularDispersion, calcularHistogramaDap, estadoPorSector } from '../lib/tableroGraficos'

export function VistaCifras() {
  const sectores = useSectoresDelCampus()
  const sectoresListos = sectores.estado === 'listo' ? sectores.sectores : null
  const idsDeSectores = useMemo(
    () => sectoresListos?.map((sector) => sector.properties.id) ?? null,
    [sectoresListos],
  )
  const arboles = useArbolesDelCampus(idsDeSectores)
  const arbolesListos = arboles.estado === 'listo' ? arboles.arboles : null
  const { filtros, cambiar } = useFiltrosTablero(idsDeSectores ?? [])

  const tablero = useMemo(() => {
    if (!sectoresListos || !arbolesListos) return null
    const visibles = aplicarFiltros(arbolesListos, filtros)
    // El mapa, el estado y los mini gráficos comparan sectores; la dona compara especies
    const entreSectores = aplicarFiltros(arbolesListos, filtros, { sector: false })
    const entreEspecies = aplicarFiltros(arbolesListos, filtros, { especie: false })
    const codigos = new Set(visibles.map(({ properties }) => properties.codigo))
    const orden = especiesPorCantidad(arbolesListos)
    const sectoresDelCo2 =
      filtros.sector === null
        ? sectoresListos
        : sectoresListos.filter((sector) => sector.properties.id === filtros.sector)
    return {
      visibles,
      entreSectores,
      especies: agruparEspecies(entreEspecies, CANTIDAD_ESPECIES_DONA, orden),
      mapa: calcularMapaCalor(entreSectores, sectoresListos, filtros.metrica),
      estado: estadoPorSector(entreSectores, sectoresListos),
      nativas: calcularKpis(visibles).nativas,
      dispersion: calcularDispersion(arbolesListos, codigos, CANTIDAD_ESPECIES_DONA),
      histograma: calcularHistogramaDap(arbolesListos, codigos, ANCHO_RANGO_DAP_CM),
      co2: calcularCifrasCo2(
        sectoresDelCo2,
        visibles,
        CANTIDAD_ESPECIES_CO2_CIFRAS,
        CANTIDAD_TOP_ARBOLES_CO2,
      ),
    }
  }, [sectoresListos, arbolesListos, filtros])

  const botonLimpiar = useRef<HTMLButtonElement>(null)
  const sinResultados = tablero !== null && tablero.visibles.length === 0
  // Si el clic en un gráfico dejó la página sin resultados, el elemento enfocado desaparece: el foco
  // pasa al botón que quita los filtros en lugar de perderse
  useEffect(() => {
    if (sinResultados && document.activeElement === document.body) botonLimpiar.current?.focus()
  }, [sinResultados])

  const hayError = sectores.estado === 'error' || arboles.estado === 'error'
  const reintentar = sectores.estado === 'error' ? sectores.reintentar : arboles.reintentar
  const sinArboles = arbolesListos !== null && arbolesListos.length === 0
  const opcionesSector = (sectoresListos ?? []).map(({ properties }) => ({
    id: properties.id,
    nombre: properties.nombre,
  }))

  // Lo que cambia en cada gráfico al filtrar (hace entrar los valores nuevos con un fundido)
  const claves = {
    todo: `${filtros.sector}|${filtros.datos}|${filtros.especie}|${filtros.metrica}`,
    dona: `${filtros.sector}|${filtros.datos}`,
    mapa: `${filtros.datos}|${filtros.especie}|${filtros.metrica}`,
    estado: `${filtros.datos}|${filtros.especie}`,
  }

  return (
    <section className="cifras tablero">
      <h1 className="cifras__titulo">{TEXTOS_CIFRAS.titulo}</h1>
      {hayError && <EstadoError mensaje={TEXTOS_CIFRAS.error} onReintentar={reintentar} />}
      {!hayError && tablero === null && (
        <EstadoCarga
          etiqueta={TEXTOS_CIFRAS.cargando}
          forma="lista"
          cantidad={BLOQUES_ESQUELETO_TABLERO}
        />
      )}
      {!hayError && sinArboles && <EstadoVacio mensaje={TEXTOS_CIFRAS.sinArboles} />}
      {!hayError && tablero !== null && sectoresListos && arbolesListos && !sinArboles && (
        <>
          <p className="cifras__nota">{TEXTOS_TABLERO.intro}</p>
          <FiltrosTablero sectores={opcionesSector} filtros={filtros} onCambiar={cambiar} />
          {tablero.visibles.length === 0 ? (
            <div className="tablero-sin-resultados">
              <EstadoVacio mensaje={TEXTOS_TABLERO.filtros.sinResultados} />
              <button
                ref={botonLimpiar}
                type="button"
                className="boton boton--secundario"
                onClick={() => cambiar({ ...FILTROS_INICIALES, metrica: filtros.metrica })}
              >
                {TEXTOS_TABLERO.filtros.limpiar}
              </button>
            </div>
          ) : (
            <>
              <GrupoKpis
                visibles={tablero.visibles}
                porSector={tablero.entreSectores}
                todos={arbolesListos}
                sectores={sectoresListos}
                sectorElegido={filtros.sector}
                clave={claves.todo}
              />
              <div className="tablero-fila">
                <MapaCalor
                  sectores={sectoresListos}
                  datos={tablero.mapa}
                  metrica={filtros.metrica}
                  sectorElegido={filtros.sector}
                  onMetrica={(metrica) => cambiar({ metrica })}
                  onElegirSector={(sector) => cambiar({ sector })}
                  clave={claves.mapa}
                />
                <DonaEspecies
                  filas={tablero.especies}
                  especieElegida={filtros.especie}
                  onElegir={(especie) => cambiar({ especie })}
                  clave={claves.dona}
                />
              </div>
              <div className="tablero-fila">
                <EstadoPorSector
                  filas={tablero.estado}
                  sectorElegido={filtros.sector}
                  clave={claves.estado}
                />
                <MediaDonaNativas nativas={tablero.nativas} clave={claves.todo} />
              </div>
              <div className="tablero-fila tablero-fila--desigual">
                <Dispersion dispersion={tablero.dispersion} especies={tablero.especies} />
                <Histograma histograma={tablero.histograma} />
              </div>
              <SeccionCo2 cifras={tablero.co2} />
            </>
          )}
        </>
      )}
    </section>
  )
}
