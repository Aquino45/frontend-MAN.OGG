import type { MouseEvent } from 'react'
import { ID_TITULO_DESTACADOS, NOMBRE_CAMPUS, TEXTOS_INICIO } from '@/config/constantes'
import { useAparicion } from '../hooks/useAparicion'
import { ArbolAnimado } from './ArbolAnimado'
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

// Lleva el foco al título del bloque de destacados (sin anillo: no es interactivo) y baja hasta él.
function irADestacados(evento: MouseEvent<HTMLAnchorElement>) {
  const titulo = document.getElementById(ID_TITULO_DESTACADOS)
  if (titulo === null) return
  evento.preventDefault()
  titulo.focus()
}

// Portada de Inicio: el h1 único de la página, la frase, el enlace al mapa y el árbol pixel.
export function Portada({ cantidadSectores }: PropsPortada) {
  const [anclarAparicion, claseAparicion] = useAparicion('inmediata')
  return (
    <section className="inicio-portada">
      <div className="inicio-portada__contenido">
        <div ref={anclarAparicion} className={`inicio-portada__texto ${claseAparicion}`}>
          <p className="inicio-portada__antetitulo">{antetitulo(cantidadSectores)}</p>
          <h1 className="inicio-portada__titulo">
            {TEXTOS_INICIO.tituloPortada}
            <span className="inicio-portada__acento">{TEXTOS_INICIO.tituloPortadaAcento}</span>
          </h1>
          <p className="inicio-portada__frase">{TEXTOS_INICIO.frasePortada}</p>
          <div className="inicio-portada__acciones">
            <EnlaceMapa variante="portada" />
            <a
              className="boton boton--secundario"
              href={`#${ID_TITULO_DESTACADOS}`}
              onClick={irADestacados}
            >
              {TEXTOS_INICIO.verDestacados}
            </a>
          </div>
        </div>
        <div className="inicio-portada__arbol">
          <ArbolAnimado />
        </div>
      </div>
    </section>
  )
}
