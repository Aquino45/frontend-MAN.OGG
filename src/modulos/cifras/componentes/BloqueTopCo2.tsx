// Los árboles con más CO₂ almacenado: una sola lista ordenada por valor (campo y ejemplo juntos,
// cada fila de ejemplo con su sello), cada fila enlaza a su cartilla, y la tabla accesible debajo.
import { useId } from 'react'
import { Link } from 'react-router'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import { formatearCo2, textoSinDatoCo2, type FilaTopCo2 } from '../lib/cifrasCo2'

interface PropsBloqueTopCo2 {
  // Ya vienen ordenadas de mayor a menor CO₂
  filas: readonly FilaTopCo2[]
  // Árboles que no entran por no tener dato de CO₂ almacenado
  sinDato: number
}

const PORCENTAJE_COMPLETO = 100

export function BloqueTopCo2({ filas, sinDato }: PropsBloqueTopCo2) {
  const idTitulo = useId()
  const conTransicion = useEnlaceConTransicion()
  const textos = TEXTOS_CIFRAS.co2
  const textoSinDato = textoSinDatoCo2(sinDato)
  const maximo = Math.max(0, ...filas.map((fila) => fila.co2_almacenado_kg))
  return (
    <section className="cifras-bloque" aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="cifras-bloque__titulo">
        {textos.top.titulo}
      </h3>
      <ol className="cifras-top" aria-label={textos.top.descripcion}>
        {filas.map((fila) => (
          <li key={fila.codigo} className="cifras-top__fila">
            <span className="cifras-top__cabeza">
              <Link
                to={fila.enlace}
                onClick={conTransicion}
                className="cifras-top__codigo"
                aria-label={textos.verEnMapa.replace('{codigo}', fila.codigo)}
              >
                {fila.codigo}
              </Link>
              {fila.demo && <SelloDemo />}
            </span>
            <span className="cifras-top__detalle">
              {fila.especie ?? <SinDato />} · {fila.sector}
            </span>
            <span className="cifras-top__valor">
              {formatearCo2(fila.co2_almacenado_kg, 'almacenado')}
            </span>
            <span className="cifras-grafico__barra cifras-top__barra" aria-hidden="true">
              <span
                className={fila.demo ? 'cifras-grafico__ejemplo' : 'cifras-grafico__campo'}
                style={{
                  inlineSize: `${maximo === 0 ? 0 : (fila.co2_almacenado_kg / maximo) * PORCENTAJE_COMPLETO}%`,
                }}
              />
            </span>
          </li>
        ))}
      </ol>
      {textoSinDato !== null && <p className="cifras-co2__sin-dato">{textoSinDato}</p>}
      <div
        className="cifras-tabla"
        role="region"
        tabIndex={0}
        aria-label={TEXTOS_CIFRAS.tablaConDesplazamiento}
      >
        <table className="cifras-tabla__tabla">
          <caption className="cifras-tabla__caption">{textos.top.descripcion}</caption>
          <thead>
            <tr>
              <th scope="col">{textos.arbol}</th>
              <th scope="col">{textos.especie}</th>
              <th scope="col">{textos.sector}</th>
              <th scope="col" className="cifras-tabla__numero">
                {textos.valor}
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.codigo}>
                <th scope="row">
                  {fila.codigo} {fila.demo && <SelloDemo />}
                </th>
                <td>{fila.especie ?? <SinDato />}</td>
                <td>{fila.sector}</td>
                <td className="cifras-tabla__numero">
                  {formatearCo2(fila.co2_almacenado_kg, 'almacenado')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
