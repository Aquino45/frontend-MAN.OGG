import { useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router'
import type { SectorFeature } from '@/api/cliente'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import { useVisibleUnaVez } from '@/compartido/useVisibleUnaVez'
import {
  MAPA_INICIO_INTERLINEA_EM,
  MAPA_INICIO_SUBIDA_POR_LINEA_EM,
  PARAMETROS_URL,
  RUTAS,
  TEXTOS_MAPA,
  TEXTOS_INICIO,
} from '@/config/constantes'
import { nombreAccesibleSector, proyectarSectores, textoTotalArboles } from '@/modulos/mapa'
import type { ConteoDeSector } from '../lib/cifras'

interface PropsMapaInicio {
  sectores: readonly SectorFeature[]
  // Árboles de campo y de ejemplo por sector; null si aún no se tienen (se usa total_arboles)
  conteos: ReadonlyMap<number, ConteoDeSector> | null
}

const SIN_ARBOLES: ConteoDeSector = { deCampo: 0, deEjemplo: 0 }

function enlaceDelSector(sectorId: number): string {
  const consulta = new URLSearchParams({ [PARAMETROS_URL.sector]: String(sectorId) })
  return `${RUTAS.mapa}?${consulta.toString()}`
}

// Líneas de conteo debajo del nombre del sector. Sin conteos se usa el total que dice la API.
function lineasDeConteo(sector: SectorFeature, conteo: ConteoDeSector | undefined): string[] {
  if (conteo === undefined) return [textoTotalArboles(sector.properties.total_arboles)]
  const lineas: string[] = []
  if (conteo.deCampo > 0) lineas.push(`${conteo.deCampo} ${TEXTOS_INICIO.conteoDeCampo}`)
  if (conteo.deEjemplo > 0) lineas.push(`${conteo.deEjemplo} ${TEXTOS_INICIO.conteoDeEjemplo}`)
  return lineas.length > 0 ? lineas : [TEXTOS_INICIO.sinArbolesAun]
}

// Datos de pintura de un sector: su conteo, si es de campo y las líneas de texto.
function describirSector(sector: SectorFeature, conteos: PropsMapaInicio['conteos']) {
  const { properties } = sector
  // Sin conteos todavía no se sabe de qué datos es: se pinta como ejemplo (neutro).
  const conteo = conteos === null ? undefined : (conteos.get(properties.id) ?? SIN_ARBOLES)
  const tipo = conteo !== undefined && conteo.deCampo > 0 ? 'campo' : 'ejemplo'
  return { tipo, lineas: lineasDeConteo(sector, conteo) }
}

// Mapa compacto de los sectores: cada uno es un enlace a /mapa?sector=<id>.
// Las formas van primero y los textos encima de todas, para que ningún sector tape un rótulo.
export function MapaInicio({ sectores, conteos }: PropsMapaInicio) {
  const conTransicion = useEnlaceConTransicion()
  const [anclar, dibujado] = useVisibleUnaVez<SVGSVGElement>()
  const proyeccion = useMemo(() => proyectarSectores(sectores), [sectores])
  const descripciones = useMemo(
    () => sectores.map((sector) => describirSector(sector, conteos)),
    [sectores, conteos],
  )

  return (
    <svg
      ref={anclar}
      className="inicio-mapa"
      data-dibujado={dibujado}
      viewBox={`0 0 ${proyeccion.ancho} ${proyeccion.alto}`}
      style={{ aspectRatio: `${proyeccion.ancho} / ${proyeccion.alto}` }}
      role="group"
      aria-label={TEXTOS_MAPA.tituloRegion}
    >
      {proyeccion.sectores.map((proyectado, indice) => {
        const { properties } = sectores[indice]
        const clases = [
          'inicio-sector',
          `inicio-sector--${descripciones[indice].tipo}`,
          properties.provisional && 'inicio-sector--provisional',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <Link
            key={proyectado.id}
            className={clases}
            to={enlaceDelSector(proyectado.id)}
            onClick={conTransicion}
            aria-label={nombreAccesibleSector(properties)}
            style={{ '--indice': indice } as CSSProperties}
          >
            <path className="inicio-sector__forma" d={proyectado.trazado} />
          </Link>
        )
      })}
      <g className="inicio-mapa__textos" aria-hidden="true">
        {proyeccion.sectores.map((proyectado, indice) => {
          const { lineas, tipo } = descripciones[indice]
          return (
            <text
              key={proyectado.id}
              className={`inicio-sector__texto inicio-sector__texto--${tipo}`}
              x={proyectado.etiqueta.x}
              y={proyectado.etiqueta.y}
            >
              <tspan
                className="inicio-sector__nombre"
                dy={`${-MAPA_INICIO_SUBIDA_POR_LINEA_EM * lineas.length}em`}
              >
                {sectores[indice].properties.nombre}
              </tspan>
              {lineas.map((linea) => (
                <tspan
                  key={linea}
                  className="inicio-sector__conteo"
                  x={proyectado.etiqueta.x}
                  dy={`${MAPA_INICIO_INTERLINEA_EM}em`}
                >
                  {linea}
                </tspan>
              ))}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
