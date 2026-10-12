// Gráfico de barras de CO₂ (por sector o por especie) con su tabla accesible debajo.
// Campo y ejemplo van siempre en segmentos y columnas separados.
import { useId } from 'react'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import {
  formatearCo2,
  textoSinDatoCo2,
  totalCo2De,
  type FilaCo2,
  type TipoCo2,
} from '../lib/cifrasCo2'
import { LeyendaCampoEjemplo } from './LeyendaCampoEjemplo'

interface PropsBloqueCo2Barras {
  titulo: string
  // Descripción de la tabla (su caption)
  descripcion: string
  // Encabezado de la primera columna
  columna: string
  filas: readonly FilaCo2[]
  tipo: TipoCo2
  // Árboles que no entran por no tener dato de esta magnitud
  sinDato: number
}

const PORCENTAJE_COMPLETO = 100

const porcentaje = (valor: number, maximo: number): string =>
  `${maximo === 0 ? 0 : (valor / maximo) * PORCENTAJE_COMPLETO}%`

export function BloqueCo2Barras({
  titulo,
  descripcion,
  columna,
  filas,
  tipo,
  sinDato,
}: PropsBloqueCo2Barras) {
  const idTitulo = useId()
  const textoSinDato = textoSinDatoCo2(sinDato)
  // Las barras se miden contra el renglón con más CO₂
  const maximo = Math.max(0, ...filas.map(({ valor }) => totalCo2De(valor)))
  const textos = TEXTOS_CIFRAS.co2
  return (
    <section className="cifras-bloque" aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="cifras-bloque__titulo">
        {titulo}
      </h3>
      <LeyendaCampoEjemplo />
      <ul className="cifras-grafico cifras-co2__grafico" aria-hidden="true">
        {filas.map(({ clave, etiqueta, valor }) => (
          <li key={clave} className="cifras-grafico__fila">
            <span className="cifras-grafico__etiqueta">{etiqueta}</span>
            <span className="cifras-grafico__barra">
              <span
                className="cifras-grafico__campo"
                style={{ inlineSize: porcentaje(valor.campo, maximo) }}
              />
              <span
                className="cifras-grafico__ejemplo"
                style={{ inlineSize: porcentaje(valor.ejemplo, maximo) }}
              />
            </span>
            <span className="cifras-grafico__valores">
              {formatearCo2(valor.campo, tipo)} {TEXTOS_CIFRAS.unidadCampo} ·{' '}
              {formatearCo2(valor.ejemplo, tipo)} {TEXTOS_CIFRAS.unidadEjemplo}
            </span>
          </li>
        ))}
      </ul>
      {textoSinDato !== null && <p className="cifras-co2__sin-dato">{textoSinDato}</p>}
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
                {textos.campo}
              </th>
              <th scope="col" className="cifras-tabla__numero">
                {textos.ejemplo}
              </th>
              <th scope="col" className="cifras-tabla__numero">
                {textos.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ clave, etiqueta, valor }) => (
              <tr key={clave}>
                <th scope="row">{etiqueta}</th>
                <td className="cifras-tabla__numero">{formatearCo2(valor.campo, tipo)}</td>
                <td className="cifras-tabla__numero">{formatearCo2(valor.ejemplo, tipo)}</td>
                <td className="cifras-tabla__numero">{formatearCo2(totalCo2De(valor), tipo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
