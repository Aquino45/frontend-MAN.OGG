import { NOMBRE_CAMPUS, TEXTOS_INICIO } from '@/config/constantes'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { EnlaceMapa } from './EnlaceMapa'

interface PropsPortada {
  // Cantidad de sectores que dice la API; null mientras carga (nunca se inventa un número)
  cantidadSectores: number | null
}

function antetitulo(cantidadSectores: number | null): string {
  const partes: string[] = [NOMBRE_CAMPUS, TEXTOS_INICIO.ciudad]
  if (cantidadSectores !== null) {
    const unidad =
      cantidadSectores === 1 ? TEXTOS_INICIO.sectorSingular : TEXTOS_INICIO.sectorPlural
    partes.push(`${cantidadSectores} ${unidad}`)
  }
  return partes.join(' · ')
}

// Portada de Inicio: el h1 único de la página, la frase, el enlace al mapa y el árbol pixel.
export function Portada({ cantidadSectores }: PropsPortada) {
  return (
    <section className="inicio-portada">
      <div className="inicio-portada__contenido">
        <div className="inicio-portada__texto inicio-aparece">
          <p className="inicio-portada__antetitulo">{antetitulo(cantidadSectores)}</p>
          <h1 className="inicio-portada__titulo">
            {TEXTOS_INICIO.tituloPortada}
            <span className="inicio-portada__acento">{TEXTOS_INICIO.tituloPortadaAcento}</span>
          </h1>
          <p className="inicio-portada__frase">{TEXTOS_INICIO.frasePortada}</p>
          <div className="inicio-portada__acciones">
            <EnlaceMapa variante="portada" />
          </div>
        </div>
        <div className="inicio-portada__arbol inicio-aparece inicio-aparece--tarde">
          <GlifoPixelArbol />
        </div>
      </div>
    </section>
  )
}
