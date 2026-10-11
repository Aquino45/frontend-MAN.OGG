import { useId } from 'react'
import type { SectorFeature } from '@/api/cliente'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { TEXTOS_INICIO } from '@/config/constantes'
import type { ConteoDeSector } from '../lib/cifras'
import { EnlaceMapa } from './EnlaceMapa'
import { LeyendaInicio } from './LeyendaInicio'
import { MapaInicio } from './MapaInicio'

interface PropsFranjaSectores {
  estado: 'cargando' | 'listo' | 'error'
  sectores: readonly SectorFeature[]
  // Árboles de campo y de ejemplo por sector; null si aún no se tienen
  conteos: ReadonlyMap<number, ConteoDeSector> | null
  onReintentar: () => void
}

// Franja de contraste a todo el ancho con el mapa compacto de los sectores.
export function FranjaSectores({ estado, sectores, conteos, onReintentar }: PropsFranjaSectores) {
  const idTitulo = useId()
  return (
    <section
      className="inicio-franja inicio-aparece inicio-aparece--tarde"
      aria-labelledby={idTitulo}
    >
      <div className="inicio-franja__contenido">
        <div className="inicio-franja__texto">
          <h2 id={idTitulo} className="inicio-franja__titulo">
            {TEXTOS_INICIO.tituloFranja}
          </h2>
          <p className="inicio-franja__frase">{TEXTOS_INICIO.fraseFranja}</p>
          <div className="inicio-franja__acciones">
            <EnlaceMapa variante="franja" />
          </div>
          <LeyendaInicio />
        </div>
        <div className="inicio-franja__mapa">
          {estado === 'listo' && <MapaInicio sectores={sectores} conteos={conteos} />}
          {estado === 'cargando' && (
            <EstadoCarga
              etiqueta={TEXTOS_INICIO.cargandoSectores}
              forma="bloque"
              proporcion="var(--mapa-inicio-proporcion)"
            />
          )}
          {estado === 'error' && (
            <EstadoError mensaje={TEXTOS_INICIO.errorSectores} onReintentar={onReintentar} />
          )}
        </div>
      </div>
    </section>
  )
}
