import { useId } from 'react'
import { CANTIDAD_CIFRAS_INICIO, REGION_INTERFAZ, TEXTOS_INICIO } from '@/config/constantes'
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

const ESQUELETOS = Array.from({ length: CANTIDAD_CIFRAS_INICIO }, (_, indice) => indice)

// «El censo hoy»: 4 cifras que salen de la API, con esqueleto mientras cargan y error con reintento.
export function CifrasCenso({ estado, cifras, onReintentar }: PropsCifrasCenso) {
  const idTitulo = useId()
  return (
    <section
      className="inicio-cifras inicio-aparece inicio-aparece--tarde"
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
          <div className="inicio-cifras__lista" role="status" aria-busy="true">
            <span className="solo-lectores">{TEXTOS_INICIO.cargandoCifras}</span>
            {ESQUELETOS.map((indice) => (
              <div
                key={indice}
                className="inicio-cifra inicio-cifras__esqueleto"
                aria-hidden="true"
              >
                <span className="inicio-esqueleto-barra inicio-esqueleto-barra--cifra" />
                <span className="inicio-esqueleto-barra" />
                <span className="inicio-esqueleto-barra inicio-esqueleto-barra--corta" />
              </div>
            ))}
          </div>
        )}
        {estado === 'error' && (
          <div className="inicio-error" role="alert">
            <p className="inicio-error__mensaje">{TEXTOS_INICIO.errorCifras}</p>
            <button className="inicio-error__boton" type="button" onClick={onReintentar}>
              {TEXTOS_INICIO.reintentar}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
