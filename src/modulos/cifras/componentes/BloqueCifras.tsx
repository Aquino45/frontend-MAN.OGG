// Un bloque de cifras: título, gráfico de barras (decorativo) y la tabla accesible que lo explica.
// Campo y ejemplo van siempre en columnas y segmentos separados.
import { useId } from 'react'
import { REGION_INTERFAZ, TEXTOS_CIFRAS } from '@/config/constantes'
import { totalDe, type FilaConteo } from '../lib/cifrasCenso'

interface PropsBloqueCifras {
  titulo: string
  // Descripción de la tabla (su caption)
  descripcion: string
  // Encabezado de la primera columna
  columna: string
  filas: readonly FilaConteo[]
}

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })
const PORCENTAJE_COMPLETO = 100

const porcentaje = (valor: number, maximo: number): string =>
  `${maximo === 0 ? 0 : (valor / maximo) * PORCENTAJE_COMPLETO}%`

export function BloqueCifras({ titulo, descripcion, columna, filas }: PropsBloqueCifras) {
  const idTitulo = useId()
  // Las barras se miden contra el renglón con más árboles
  const maximo = Math.max(0, ...filas.map(({ conteo }) => totalDe(conteo)))
  return (
    <section className="cifras-bloque" aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className="cifras-bloque__titulo">
        {titulo}
      </h2>
      <ul className="cifras-leyenda" aria-hidden="true">
        <li className="cifras-leyenda__item">
          <span className="cifras-leyenda__muestra cifras-leyenda__muestra--campo" />
          {TEXTOS_CIFRAS.campo}
        </li>
        <li className="cifras-leyenda__item">
          <span className="cifras-leyenda__muestra cifras-leyenda__muestra--ejemplo" />
          {TEXTOS_CIFRAS.ejemplo}
        </li>
      </ul>
      <ul className="cifras-grafico" aria-hidden="true">
        {filas.map(({ clave, etiqueta, conteo }) => (
          <li key={clave} className="cifras-grafico__fila">
            <span className="cifras-grafico__etiqueta">{etiqueta}</span>
            <span className="cifras-grafico__barra">
              <span
                className="cifras-grafico__campo"
                style={{ inlineSize: porcentaje(conteo.campo, maximo) }}
              />
              <span
                className="cifras-grafico__ejemplo"
                style={{ inlineSize: porcentaje(conteo.ejemplo, maximo) }}
              />
            </span>
            <span className="cifras-grafico__valores">
              {FORMATO_ENTERO.format(conteo.campo)} {TEXTOS_CIFRAS.unidadCampo} ·{' '}
              {FORMATO_ENTERO.format(conteo.ejemplo)} {TEXTOS_CIFRAS.unidadEjemplo}
            </span>
          </li>
        ))}
      </ul>
      <div
        className="cifras-tabla"
        role="region"
        tabIndex={0}
        aria-label={TEXTOS_CIFRAS.tablaConDesplazamiento}
      >
        <table className="cifras-tabla__tabla">
          <caption className="cifras-tabla__caption">{descripcion}</caption>
          <thead>
            <tr>
              <th scope="col">{columna}</th>
              <th scope="col" className="cifras-tabla__numero">
                {TEXTOS_CIFRAS.campo}
              </th>
              <th scope="col" className="cifras-tabla__numero">
                {TEXTOS_CIFRAS.ejemplo}
              </th>
              <th scope="col" className="cifras-tabla__numero">
                {TEXTOS_CIFRAS.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ clave, etiqueta, conteo }) => (
              <tr key={clave}>
                <th scope="row">{etiqueta}</th>
                <td className="cifras-tabla__numero">{FORMATO_ENTERO.format(conteo.campo)}</td>
                <td className="cifras-tabla__numero">{FORMATO_ENTERO.format(conteo.ejemplo)}</td>
                <td className="cifras-tabla__numero">{FORMATO_ENTERO.format(totalDe(conteo))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
