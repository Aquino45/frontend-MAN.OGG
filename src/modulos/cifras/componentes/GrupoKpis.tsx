// El resumen del tablero: seis tarjetas con su mini gráfico. Cada valor de campo y de ejemplo sale
// por separado; un origen sin árboles en la selección no aparece.
import { Link } from 'react-router'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import { CANTIDAD_ESPECIES_DONA, TEXTOS_TABLERO } from '@/config/constantes'
import { formatearMedida } from '@/lib/formatear'
import { formatearCo2 } from '../lib/cifrasCo2'
import {
  agruparEspecies,
  calcularKpis,
  especiesPorCantidad,
  sumarPorSector,
  type MayorDap,
  type ProporcionNativas,
} from '../lib/tablero'
import { Aparece } from './Aparece'
import { MiniBarras, MiniColumnas, MiniProporciones, MiniPuntosDap } from './MiniGraficos'
import { TarjetaKpi, type LineaKpi, type OrigenDeLinea } from './TarjetaKpi'

interface PropsGrupoKpis {
  // Los árboles que cumplen todos los filtros
  visibles: readonly ArbolFeature[]
  // Los de todos los sectores que cumplen los demás filtros (para comparar sectores en los minis)
  porSector: readonly ArbolFeature[]
  todos: readonly ArbolFeature[]
  sectores: readonly SectorFeature[]
  sectorElegido: number | null
  // Cambia con los filtros: hace entrar los valores nuevos con un fundido
  clave: string
}

const ORIGENES: readonly OrigenDeLinea[] = ['campo', 'ejemplo']
const PORCENTAJE = 100

const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

function DetalleMayorDap({ mayor }: { mayor: MayorDap }) {
  const conTransicion = useEnlaceConTransicion()
  return (
    <>
      <Link
        to={mayor.enlace}
        onClick={conTransicion}
        aria-label={TEXTOS_TABLERO.kpis.verCartilla.replace('{codigo}', mayor.codigo)}
      >
        {mayor.codigo}
      </Link>
      {mayor.especie && <em>{mayor.especie}</em>}
    </>
  )
}

function lineasNativas(nativas: ReturnType<typeof calcularKpis>['nativas']): {
  lineas: LineaKpi[]
  filas: { valor: number; clase: string }[][]
} {
  const lineas: LineaKpi[] = []
  const filas: { valor: number; clase: string }[][] = []
  for (const origen of ORIGENES) {
    const datos: ProporcionNativas | null = nativas[origen]
    if (datos === null) continue
    lineas.push({
      origen,
      valor: `${entero.format((datos.nativas / datos.total) * PORCENTAJE)} %`,
      detalle: TEXTOS_TABLERO.kpis.nativasDe
        .replace('{n}', String(datos.nativas))
        .replace('{total}', String(datos.total)),
    })
    filas.push([
      { valor: datos.nativas, clase: 'mini-nativa' },
      { valor: datos.exoticas, clase: 'mini-exotica' },
      { valor: datos.sinDato, clase: 'mini-sin-dato' },
    ])
  }
  return { lineas, filas }
}

export function GrupoKpis({
  visibles,
  porSector,
  todos,
  sectores,
  sectorElegido,
  clave,
}: PropsGrupoKpis) {
  const textos = TEXTOS_TABLERO.kpis
  const kpis = calcularKpis(visibles)

  const lineasPorOrigen = (valorDe: (origen: OrigenDeLinea) => string): LineaKpi[] =>
    ORIGENES.filter((origen) => kpis.arboles[origen] > 0).map((origen) => ({
      origen,
      valor: valorDe(origen),
    }))

  const columnas = (medida: Parameters<typeof sumarPorSector>[2]) =>
    sumarPorSector(porSector, sectores, medida).map(({ sectorId, campo, ejemplo }) => ({
      campo,
      ejemplo,
      elegida: sectorId === sectorElegido,
    }))

  const orden = especiesPorCantidad(todos)
  const barrasEspecies = agruparEspecies(visibles, CANTIDAD_ESPECIES_DONA, orden).map((fila) => ({
    valor: fila.cantidad,
    serie: fila.serie,
  }))
  const lineasDap: LineaKpi[] = ORIGENES.flatMap((origen) => {
    const mayor = kpis.mayorDap[origen]
    if (kpis.arboles[origen] === 0) return []
    return [
      {
        origen,
        valor: mayor ? formatearMedida(mayor.dapCm, 'dapCm') : <SinDato />,
        detalle: mayor ? <DetalleMayorDap mayor={mayor} /> : undefined,
      },
    ]
  })
  const resaltados = new Set(ORIGENES.map((origen) => kpis.mayorDap[origen]?.codigo))
  const puntosDap = visibles
    .filter(({ properties }) => properties.dap_cm !== null)
    .map(({ properties }) => ({
      dapCm: properties.dap_cm ?? 0,
      ejemplo: properties.demo,
      resaltado: resaltados.has(properties.codigo),
    }))
  const nativas = lineasNativas(kpis.nativas)
  const notaEspecies =
    kpis.arboles.campo > 0 && kpis.arboles.ejemplo > 0
      ? textos.especiesDe
          .replace('{n}', String(kpis.especies.campo))
          .replace('{m}', String(kpis.especies.ejemplo))
      : undefined
  // Un origen sin ningún valor de CO₂ no dice «0»: dice que no hay dato
  const co2Valor = (kg: number, tipo: 'almacenado' | 'captura') =>
    kg > 0 ? formatearCo2(kg, tipo) : textos.sinDato

  return (
    <Aparece clave={clave}>
      <div className="tablero-kpis">
        <TarjetaKpi
          etiqueta={textos.arboles}
          lineas={lineasPorOrigen((origen) => entero.format(kpis.arboles[origen]))}
          mini={<MiniColumnas columnas={columnas(() => 1)} />}
        />
        <TarjetaKpi
          etiqueta={textos.especies}
          lineas={[{ valor: entero.format(kpis.especies.total) }]}
          nota={notaEspecies}
          mini={<MiniBarras barras={barrasEspecies} />}
        />
        <TarjetaKpi
          etiqueta={textos.co2}
          simulado={kpis.haySimulado}
          lineas={lineasPorOrigen((origen) => co2Valor(kpis.co2[origen], 'almacenado'))}
          mini={<MiniColumnas columnas={columnas((p) => p.co2_almacenado_kg)} />}
        />
        <TarjetaKpi
          etiqueta={textos.captura}
          simulado={kpis.haySimulado}
          lineas={lineasPorOrigen((origen) => co2Valor(kpis.captura[origen], 'captura'))}
          mini={<MiniColumnas columnas={columnas((p) => p.co2_captura_anual_kg)} />}
        />
        <TarjetaKpi
          etiqueta={textos.mayorDap}
          lineas={lineasDap}
          mini={<MiniPuntosDap puntos={puntosDap} />}
        />
        <TarjetaKpi
          etiqueta={textos.nativas}
          lineas={nativas.lineas}
          mini={<MiniProporciones filas={nativas.filas} />}
        />
      </div>
    </Aparece>
  )
}
