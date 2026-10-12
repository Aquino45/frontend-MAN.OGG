// Tarjeta de un gráfico del tablero: título, descripción, el gráfico (con su apoyo) y su tabla.
import { useId, type ReactNode } from 'react'
import { TablaAccesible, type DatosDeTabla } from './TablaAccesible'

interface PropsTarjetaGrafico {
  titulo: string
  descripcion?: ReactNode
  // Controles que cambian lo que mide el gráfico (por ejemplo, la medida del mapa de calor)
  controles?: ReactNode
  tabla?: DatosDeTabla
  clase?: string
  children: ReactNode
}

export function TarjetaGrafico({
  titulo,
  descripcion,
  controles,
  tabla,
  clase,
  children,
}: PropsTarjetaGrafico) {
  const idTitulo = useId()
  return (
    <section className={`tablero-tarjeta${clase ? ` ${clase}` : ''}`} aria-labelledby={idTitulo}>
      <header className="tablero-tarjeta__cabeza">
        <h3 id={idTitulo} className="tablero-tarjeta__titulo">
          {titulo}
        </h3>
        {descripcion && <p className="tablero-tarjeta__descripcion">{descripcion}</p>}
      </header>
      {controles}
      <div className="tablero-tarjeta__cuerpo">{children}</div>
      {tabla && <TablaAccesible {...tabla} />}
    </section>
  )
}
