// Página «Cifras del censo»: conteos de los árboles que entrega la API, con campo y ejemplo
// siempre por separado, y las sumas de CO₂ (simulado mientras la API lo marque así). Cada bloque
// trae su gráfico y la tabla que lo explica.
import '../estilos.css'
import '../co2.estilos.css'
import { useId, useMemo } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { useArbolesDelCampus } from '@/compartido/useArbolesDelCampus'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import {
  CANTIDAD_ESPECIES_CIFRAS,
  CANTIDAD_ESPECIES_CO2_CIFRAS,
  CANTIDAD_TOP_ARBOLES_CO2,
  REGION_INTERFAZ,
  TEXTOS_CIFRAS,
} from '@/config/constantes'
import { BloqueCifras } from '../componentes/BloqueCifras'
import { SeccionCo2 } from '../componentes/SeccionCo2'
import { calcularCifrasCenso, totalDe } from '../lib/cifrasCenso'
import { calcularCifrasCo2 } from '../lib/cifrasCo2'

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })
// Bloques del esqueleto mientras cargan las cifras (solo la forma, sin números)
const BLOQUES_ESQUELETO = 4

export function VistaCifras() {
  const idResumen = useId()
  const sectores = useSectoresDelCampus()
  const sectoresListos = sectores.estado === 'listo' ? sectores.sectores : null
  const idsDeSectores = useMemo(
    () => sectoresListos?.map((sector) => sector.properties.id) ?? null,
    [sectoresListos],
  )
  const arboles = useArbolesDelCampus(idsDeSectores)
  const arbolesListos = arboles.estado === 'listo' ? arboles.arboles : null

  const cifras = useMemo(
    () =>
      sectoresListos && arbolesListos
        ? calcularCifrasCenso(sectoresListos, arbolesListos, CANTIDAD_ESPECIES_CIFRAS)
        : null,
    [sectoresListos, arbolesListos],
  )

  const cifrasCo2 = useMemo(
    () =>
      sectoresListos && arbolesListos
        ? calcularCifrasCo2(
            sectoresListos,
            arbolesListos,
            CANTIDAD_ESPECIES_CO2_CIFRAS,
            CANTIDAD_TOP_ARBOLES_CO2,
          )
        : null,
    [sectoresListos, arbolesListos],
  )

  const hayError = sectores.estado === 'error' || arboles.estado === 'error'
  const reintentar = sectores.estado === 'error' ? sectores.reintentar : arboles.reintentar

  return (
    <section className="cifras">
      <h1 className="cifras__titulo">{TEXTOS_CIFRAS.titulo}</h1>
      {hayError && <EstadoError mensaje={TEXTOS_CIFRAS.error} onReintentar={reintentar} />}
      {!hayError && cifras === null && (
        <EstadoCarga etiqueta={TEXTOS_CIFRAS.cargando} forma="lista" cantidad={BLOQUES_ESQUELETO} />
      )}
      {!hayError && cifras !== null && totalDe(cifras.total) === 0 && (
        <EstadoVacio mensaje={TEXTOS_CIFRAS.sinArboles} />
      )}
      {!hayError && cifras !== null && totalDe(cifras.total) > 0 && (
        <>
          <p className="cifras__nota">{TEXTOS_CIFRAS.notaSeparados}</p>
          <section className="cifras-resumen" aria-labelledby={idResumen}>
            <h2 id={idResumen} className="cifras-bloque__titulo">
              {TEXTOS_CIFRAS.resumen}
            </h2>
            <dl className="cifras-resumen__lista">
              <div className="cifras-resumen__cifra">
                <dt className="cifras-resumen__etiqueta">{TEXTOS_CIFRAS.arbolesDeCampo}</dt>
                <dd className="cifras-resumen__valor">
                  {FORMATO_ENTERO.format(cifras.total.campo)}
                </dd>
              </div>
              <div className="cifras-resumen__cifra">
                <dt className="cifras-resumen__etiqueta">{TEXTOS_CIFRAS.arbolesDeEjemplo}</dt>
                <dd className="cifras-resumen__valor">
                  {FORMATO_ENTERO.format(cifras.total.ejemplo)}
                </dd>
              </div>
            </dl>
          </section>
          <div className="cifras__bloques">
            <BloqueCifras
              titulo={TEXTOS_CIFRAS.porSector.titulo}
              descripcion={TEXTOS_CIFRAS.porSector.descripcion}
              columna={TEXTOS_CIFRAS.porSector.columna}
              filas={cifras.porSector}
            />
            <BloqueCifras
              titulo={TEXTOS_CIFRAS.porEstado.titulo}
              descripcion={TEXTOS_CIFRAS.porEstado.descripcion}
              columna={TEXTOS_CIFRAS.porEstado.columna}
              filas={cifras.porEstado}
            />
            <BloqueCifras
              titulo={TEXTOS_CIFRAS.porEspecie.titulo}
              descripcion={TEXTOS_CIFRAS.porEspecie.descripcion}
              columna={TEXTOS_CIFRAS.porEspecie.columna}
              filas={cifras.porEspecie}
            />
            <BloqueCifras
              titulo={TEXTOS_CIFRAS.destacados.titulo}
              descripcion={TEXTOS_CIFRAS.destacados.descripcion}
              columna={TEXTOS_CIFRAS.destacados.columna}
              filas={cifras.destacadosPorSector}
            />
          </div>
          {cifrasCo2 !== null && <SeccionCo2 cifras={cifrasCo2} />}
        </>
      )}
    </section>
  )
}
