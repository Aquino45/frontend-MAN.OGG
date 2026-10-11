// Página «Cifras» (provisional): título y aviso. Las cifras del censo la reemplazan.
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import '../estilos.css'

export function VistaCifras() {
  return (
    <section className="pagina-provisional">
      <h1 className="pagina-provisional__titulo">{TEXTOS_CIFRAS.titulo}</h1>
      <EstadoVacio mensaje={TEXTOS_CIFRAS.proximamente} />
    </section>
  )
}
