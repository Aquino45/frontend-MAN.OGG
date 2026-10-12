// La tabla de un gráfico: sus mismos datos en texto, plegada bajo el gráfico. Se desplaza hacia los
// lados en pantallas angostas (y se puede enfocar para hacerlo con el teclado).
import { TEXTOS_TABLERO } from '@/config/constantes'

export interface DatosDeTabla {
  // Nombre del gráfico, para «Ver <gráfico> como tabla»
  grafico: string
  cabecera: readonly string[]
  filas: readonly (readonly string[])[]
}

export function TablaAccesible({ grafico, cabecera, filas }: DatosDeTabla) {
  return (
    <details className="tablero-tabla">
      <summary>{TEXTOS_TABLERO.tabla.ver.replace('{grafico}', grafico.toLowerCase())}</summary>
      <div
        className="tablero-tabla__desplazable"
        tabIndex={0}
        role="region"
        aria-label={TEXTOS_TABLERO.tabla.regionDe.replace('{grafico}', grafico.toLowerCase())}
      >
        <table>
          <thead>
            <tr>
              {cabecera.map((columna) => (
                <th key={columna} scope="col">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila[0]}>
                {fila.map((celda, indice) =>
                  indice === 0 ? (
                    <th key={indice} scope="row">
                      {celda}
                    </th>
                  ) : (
                    <td key={indice}>{celda}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
