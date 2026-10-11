// Estado de carga: un esqueleto con la forma real de lo que viene, sin números inventados.
import './estados.estilos.css'

type FormaEsqueleto = 'lista' | 'tarjeta' | 'bloque' | 'cifras'

interface PropsEstadoCarga {
  // Frase para lectores de pantalla (no se ve)
  etiqueta: string
  forma?: FormaEsqueleto
  // Cuántas filas o cifras dibuja (solo «lista» y «cifras»)
  cantidad?: number
  // Proporción del bloque, por ejemplo una variable de tokens (solo «bloque»)
  proporcion?: string
}

const BARRAS_POR_DEFECTO = 3

function piezas(cantidad: number): number[] {
  return Array.from({ length: cantidad }, (_, indice) => indice)
}

export function EstadoCarga({
  etiqueta,
  forma = 'bloque',
  cantidad = BARRAS_POR_DEFECTO,
  proporcion,
}: PropsEstadoCarga) {
  return (
    <div className={`estado-carga estado-carga--${forma}`} role="status" aria-busy="true">
      <span className="solo-lectores">{etiqueta}</span>
      <div className="estado-carga__piezas" aria-hidden="true">
        {forma === 'lista' &&
          piezas(cantidad).map((indice) => (
            <div key={indice} className="estado-carga__fila">
              <span className="estado-carga__miniatura" />
              <span className="estado-carga__textos">
                <span className="estado-carga__barra" />
                <span className="estado-carga__barra estado-carga__barra--corta" />
              </span>
            </div>
          ))}
        {forma === 'cifras' &&
          piezas(cantidad).map((indice) => (
            <div key={indice} className="estado-carga__cifra">
              <span className="estado-carga__barra estado-carga__barra--cifra" />
              <span className="estado-carga__barra" />
              <span className="estado-carga__barra estado-carga__barra--corta" />
            </div>
          ))}
        {forma === 'tarjeta' && (
          <>
            <span className="estado-carga__foto" />
            <span className="estado-carga__barra estado-carga__barra--titulo" />
            <span className="estado-carga__barra estado-carga__barra--corta" />
            <span className="estado-carga__barra" />
          </>
        )}
        {forma === 'bloque' && (
          <span
            className="estado-carga__bloque"
            style={proporcion ? { aspectRatio: proporcion } : undefined}
          />
        )}
      </div>
    </div>
  )
}
