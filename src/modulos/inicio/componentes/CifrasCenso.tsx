import { useId } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { CANTIDAD_CIFRAS_INICIO, REGION_INTERFAZ, TEXTOS_INICIO } from '@/config/constantes'
import { useAparicion } from '../hooks/useAparicion'
import type { Cifras } from '../lib/cifras'

interface PropsCifrasCenso {
  estado: 'cargando' | 'listo' | 'error'
  cifras: Cifras | null
  onReintentar: () => void
}

const FORMATO_ENTERO = new Intl.NumberFormat(REGION_INTERFAZ, { maximumFractionDigits: 0 })

// Orden en que se muestran las cifras y el texto de cada una
const CIFRAS_EN_ORDEN = [
  'arbolesDeCampo',
  'sectores',
  'especiesIdentificadas',
  'arbolesDeEjemplo',
] as const satisfies readonly (keyof Cifras)[]

// «El censo hoy»: 4 cifras que salen de la API, con esqueleto mientras cargan y error con reintento.
export function CifrasCenso({ estado, cifras, onReintentar }: PropsCifrasCenso) {
  const idTitulo = useId()
  const [anclarAparicion, claseAparicion] = useAparicion('alEntrar')
  return (
    <section
      ref={anclarAparicion}
      className={`inicio-cifras ${claseAparicion}`}
      aria-labelledby={idTitulo}
    >
      <div className="inicio-cifras__contenido">
        <h2 id={idTitulo} className="inicio-cifras__titulo">
          {TEXTOS_INICIO.tituloCifras}
        </h2>
        {estado === 'listo' && cifras !== null && (
          <ul className="inicio-cifras__lista" role="list">
            {CIFRAS_EN_ORDEN.map((clave) => (
              <li key={clave} className="inicio-cifra">
                <span className="inicio-cifra__valor">{FORMATO_ENTERO.format(cifras[clave])}</span>
                <span className="inicio-cifra__etiqueta">
                  {TEXTOS_INICIO.cifras[clave].etiqueta}
                </span>
                <span className="inicio-cifra__nota">{TEXTOS_INICIO.cifras[clave].nota}</span>
              </li>
            ))}
          </ul>
        )}
        {estado === 'cargando' && (
          <EstadoCarga
            etiqueta={TEXTOS_INICIO.cargandoCifras}
            forma="cifras"
            cantidad={CANTIDAD_CIFRAS_INICIO}
          />
        )}
        {estado === 'error' && (
          <EstadoError mensaje={TEXTOS_INICIO.errorCifras} onReintentar={onReintentar} />
        )}
      </div>
    </section>
  )
}
