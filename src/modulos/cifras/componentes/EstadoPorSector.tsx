// Estado de los árboles por sector: una barra al 100 % por sector, con los colores de estado de
// los tokens. Los segmentos de ejemplo llevan borde punteado (campo y ejemplo no se mezclan).
import { ESTILO_ESTADO_GENERAL, ESTILO_ESTADO_OTRO, TEXTOS_TABLERO } from '@/config/constantes'
import type { FilaEstado } from '../lib/tableroGraficos'
import { Aparece } from './Aparece'
import { TarjetaGrafico } from './TarjetaGrafico'

// Desde este porcentaje del ancho de la barra el segmento escribe su número
const PORCENTAJE_PARA_ESCRIBIR = 8
const PORCENTAJE = 100
const ORDEN_DE_ESTILOS = [...Object.values(ESTILO_ESTADO_GENERAL), ESTILO_ESTADO_OTRO]

interface PropsEstadoPorSector {
  filas: readonly FilaEstado[]
  sectorElegido: number | null
  clave: string
}

export function EstadoPorSector({ filas, sectorElegido, clave }: PropsEstadoPorSector) {
  const textos = TEXTOS_TABLERO.estado
  // Los estados que aparecen en algún sector, para la leyenda y las columnas de la tabla
  const estiloDe = new Map(filas.flatMap((fila) => fila.segmentos.map((s) => [s.estado, s.estilo])))
  // En el orden del catálogo (bueno, regular, malo) y el resto al final
  const lugarDe = (estado: string) => {
    const lugar = ORDEN_DE_ESTILOS.indexOf(estiloDe.get(estado) ?? ESTILO_ESTADO_OTRO)
    return lugar === -1 ? ORDEN_DE_ESTILOS.length : lugar
  }
  const estados = [...estiloDe.keys()].sort((a, b) => lugarDe(a) - lugarDe(b) || a.localeCompare(b))

  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={textos.descripcion}
      tabla={{
        grafico: textos.titulo,
        cabecera: [textos.columnaSector, ...estados],
        filas: filas.map((fila) => [
          fila.etiqueta,
          ...estados.map((estado) =>
            String(
              fila.segmentos
                .filter((segmento) => segmento.estado === estado)
                .reduce((suma, segmento) => suma + segmento.cantidad, 0),
            ),
          ),
        ]),
      }}
    >
      <Aparece clave={clave}>
        <ul className="tablero-estados">
          {filas.map((fila) => {
            const elegido = String(sectorElegido) === fila.clave
            return (
              <li
                key={fila.clave}
                className="tablero-estados__fila"
                data-apagada={sectorElegido !== null && !elegido ? 'si' : undefined}
              >
                <span className="tablero-estados__sector">{fila.etiqueta}</span>
                {fila.total === 0 ? (
                  <span className="tablero-estados__vacio">—</span>
                ) : (
                  <span
                    className="tablero-estados__barra"
                    role="img"
                    aria-label={fila.segmentos
                      .map((s) =>
                        textos.etiquetaBarra
                          .replace('{sector}', fila.etiqueta)
                          .replace('{estado}', s.estado)
                          .replace('{n}', String(s.cantidad)),
                      )
                      .join('; ')}
                  >
                    {fila.segmentos.map((segmento) => (
                      <span
                        key={`${segmento.estado}|${segmento.ejemplo}`}
                        className="tablero-estados__segmento"
                        data-estilo={segmento.estilo}
                        data-ejemplo={segmento.ejemplo ? 'si' : undefined}
                        style={{ flexGrow: segmento.cantidad }}
                      >
                        {(segmento.cantidad / fila.total) * PORCENTAJE >= PORCENTAJE_PARA_ESCRIBIR
                          ? segmento.cantidad
                          : null}
                      </span>
                    ))}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </Aparece>
      <p className="tablero-apoyo">
        {estados.map((estado) => (
          <span key={estado} className="tablero-apoyo__item">
            <i
              className="tablero-apoyo__muestra tablero-estados__segmento"
              data-estilo={estiloDe.get(estado) ?? ESTILO_ESTADO_OTRO}
              aria-hidden="true"
            />
            {estado}
          </span>
        ))}
        <span className="tablero-apoyo__item">
          <i
            className="tablero-apoyo__muestra tablero-estados__segmento"
            data-ejemplo="si"
            data-estilo="vacio"
            aria-hidden="true"
          />
          {textos.ejemplo}
        </span>
      </p>
    </TarjetaGrafico>
  )
}
