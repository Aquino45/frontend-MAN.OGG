import type { CSSProperties } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { useVisibleUnaVez } from '@/compartido/useVisibleUnaVez'
import {
  DESTACADOS_PASOS_ESCALONADO,
  ID_TITULO_DESTACADOS,
  TEXTOS_INICIO,
} from '@/config/constantes'
import type { MedidasDestacado } from '../hooks/useMedidasDeDestacados'
import type { Destacado } from '../lib/destacados'
import { TarjetaDestacado } from './TarjetaDestacado'

interface PropsBloqueDestacados {
  estado: 'cargando' | 'listo' | 'error'
  destacados: readonly Destacado[]
  medidasDe: (codigo: string) => MedidasDestacado
  onReintentar: () => void
}

// «Árboles destacados»: tarjetas de los árboles que la administración del censo destacó.
// El título está siempre, también con carga, error o vacío: a él apunta «Ver destacados».
export function BloqueDestacados({
  estado,
  destacados,
  medidasDe,
  onReintentar,
}: PropsBloqueDestacados) {
  const [anclarLista, listaVisible] = useVisibleUnaVez<HTMLUListElement>()
  return (
    <section className="inicio-destacados" aria-labelledby={ID_TITULO_DESTACADOS}>
      <div className="inicio-destacados__contenido">
        <h2 id={ID_TITULO_DESTACADOS} className="inicio-destacados__titulo" tabIndex={-1}>
          {TEXTOS_INICIO.tituloDestacados}
        </h2>
        {estado === 'cargando' && (
          <EstadoCarga etiqueta={TEXTOS_INICIO.cargandoDestacados} forma="tarjeta" />
        )}
        {estado === 'error' && (
          <EstadoError mensaje={TEXTOS_INICIO.errorDestacados} onReintentar={onReintentar} />
        )}
        {estado === 'listo' && destacados.length === 0 && (
          <EstadoVacio mensaje={TEXTOS_INICIO.sinDestacados} />
        )}
        {estado === 'listo' && destacados.length > 0 && (
          <ul
            ref={anclarLista}
            className="inicio-destacados__lista"
            role="list"
            data-visible={listaVisible}
          >
            {destacados.map((destacado, indice) => (
              <li
                key={destacado.arbol.codigo}
                className="inicio-destacados__item"
                style={
                  { '--indice': Math.min(indice, DESTACADOS_PASOS_ESCALONADO) } as CSSProperties
                }
              >
                <TarjetaDestacado
                  destacado={destacado}
                  medidas={medidasDe(destacado.arbol.codigo)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
