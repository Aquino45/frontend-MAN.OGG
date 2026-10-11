// Página «Árboles» (provisional): título y aviso. La lista con búsqueda y filtros la reemplaza.
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { TEXTOS_EXPLORAR } from '@/config/constantes'
import '../estilos.css'

export function VistaExplorar() {
  return (
    <section className="pagina-provisional">
      <h1 className="pagina-provisional__titulo">{TEXTOS_EXPLORAR.titulo}</h1>
      <EstadoVacio mensaje={TEXTOS_EXPLORAR.proximamente} />
    </section>
  )
}
