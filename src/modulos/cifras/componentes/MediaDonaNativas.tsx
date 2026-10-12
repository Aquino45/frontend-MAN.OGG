// Media dona de nativas y exóticas, una por origen del dato presente (campo y ejemplo no se mezclan).
import { TEXTOS_TABLERO } from '@/config/constantes'
import { MEDIA_DONA } from '../lib/medidasGraficos'
import type { Par, ProporcionNativas } from '../lib/tablero'
import { trazoArco } from '../lib/trazosSvg'
import { Aparece } from './Aparece'
import { TarjetaGrafico } from './TarjetaGrafico'

const PORCENTAJE = 100
const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

interface PropsMediaDonaNativas {
  nativas: Par<ProporcionNativas | null>
  clave: string
}

const ORIGENES = [
  { clave: 'campo', texto: TEXTOS_TABLERO.especies.columnaCampo },
  { clave: 'ejemplo', texto: TEXTOS_TABLERO.especies.columnaEjemplo },
] as const

function MediaDona({ datos, grupo }: { datos: ProporcionNativas; grupo: string }) {
  const textos = TEXTOS_TABLERO.nativas
  const proporcion = datos.nativas / datos.total
  const centroX = MEDIA_DONA.ancho / 2
  const centroY = MEDIA_DONA.alto - MEDIA_DONA.grosor / 2 - 2
  const corte = Math.PI + proporcion * Math.PI
  const porcentaje = entero.format(proporcion * PORCENTAJE)
  return (
    <div className="tablero-media" data-origen={grupo.toLowerCase()}>
      <svg
        className="tablero-media__svg"
        viewBox={`0 0 ${MEDIA_DONA.ancho} ${MEDIA_DONA.alto}`}
        role="img"
        aria-label={textos.etiquetaMedia.replace('{p}', porcentaje).replace('{grupo}', grupo)}
      >
        <path
          className="tablero-media__pista"
          d={trazoArco(centroX, centroY, MEDIA_DONA.radio, corte, 2 * Math.PI)}
        />
        <path
          className="tablero-media__valor"
          d={trazoArco(centroX, centroY, MEDIA_DONA.radio, Math.PI, corte)}
        />
        <text x={centroX} y={centroY - 6} className="tablero-dona__total">
          {porcentaje} %
        </text>
        <text x={centroX} y={centroY + 8} className="tablero-dona__sub">
          {textos.nativas.toLowerCase()}
        </text>
      </svg>
      <p className="tablero-media__titulo">{grupo}</p>
      <ul className="tablero-leyenda">
        <li className="tablero-leyenda__fila">
          <i className="tablero-leyenda__muestra" data-nativa="si" aria-hidden="true" />
          <span className="tablero-leyenda__nombre">
            <b>{textos.nativas}</b>
          </span>
          <span className="tablero-leyenda__cifra">{datos.nativas}</span>
        </li>
        <li className="tablero-leyenda__fila">
          <i className="tablero-leyenda__muestra" data-nativa="no" aria-hidden="true" />
          <span className="tablero-leyenda__nombre">
            <b>{textos.exoticas}</b>
          </span>
          <span className="tablero-leyenda__cifra">{datos.exoticas}</span>
        </li>
        {datos.sinDato > 0 && (
          <li className="tablero-leyenda__fila">
            <i className="tablero-leyenda__muestra" data-nativa="sin" aria-hidden="true" />
            <span className="tablero-leyenda__nombre">
              <b>{textos.sinDato}</b>
            </span>
            <span className="tablero-leyenda__cifra">{datos.sinDato}</span>
          </li>
        )}
      </ul>
    </div>
  )
}

export function MediaDonaNativas({ nativas, clave }: PropsMediaDonaNativas) {
  const textos = TEXTOS_TABLERO.nativas
  const presentes = ORIGENES.flatMap(({ clave: origen, texto }) => {
    const datos = nativas[origen]
    return datos ? [{ origen, texto, datos }] : []
  })
  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={textos.descripcion}
      tabla={{
        grafico: textos.titulo,
        cabecera: [textos.columnaGrupo, textos.nativas, textos.exoticas, textos.sinDato],
        filas: presentes.map(({ texto, datos }) => [
          texto,
          String(datos.nativas),
          String(datos.exoticas),
          String(datos.sinDato),
        ]),
      }}
    >
      <Aparece clave={clave}>
        <div className="tablero-medias">
          {presentes.map(({ origen, texto, datos }) => (
            <MediaDona key={origen} datos={datos} grupo={texto} />
          ))}
        </div>
      </Aparece>
    </TarjetaGrafico>
  )
}
