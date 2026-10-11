import { useId } from 'react'
import type { SectorFeature } from '@/api/cliente'
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
            <div className="inicio-esqueleto-mapa" role="status" aria-busy="true">
              <span className="solo-lectores">{TEXTOS_INICIO.cargandoSectores}</span>
            </div>
          )}
          {estado === 'error' && (
            <div className="inicio-error" role="alert">
              <p className="inicio-error__mensaje">{TEXTOS_INICIO.errorSectores}</p>
              <button className="inicio-error__boton" type="button" onClick={onReintentar}>
                {TEXTOS_INICIO.reintentar}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
