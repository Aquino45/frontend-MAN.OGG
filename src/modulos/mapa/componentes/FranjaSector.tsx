import { textoTotalArboles } from '../lib/textosSector'

interface PropsFranjaSector {
  nombre: string
  totalArboles: number
}

// Franja con el sector seleccionado y su total de árboles.
export function FranjaSector({ nombre, totalArboles }: PropsFranjaSector) {
  return (
    <section className="franja-sector" aria-label={nombre}>
      <h2 className="franja-sector__nombre">{nombre}</h2>
      <p className="franja-sector__total">{textoTotalArboles(totalArboles)}</p>
    </section>
  )
}
