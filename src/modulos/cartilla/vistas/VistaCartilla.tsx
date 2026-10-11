// Pantalla de la cartilla: pide el árbol, muestra sus estados y devuelve el foco al abrir.
import '../estilos.css'
import '../indicadores.estilos.css'
import '../destacado.estilos.css'
import { useEffect, useRef } from 'react'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { TEXTOS_CARTILLA } from '@/config/constantes'
import { CartillaArbol } from '../componentes/CartillaArbol'
import { useArbol } from '../hooks/useArbol'

interface PropsVistaCartilla {
  codigo: string
  nombreSector: string
  // Vuelve a la lista de árboles del sector
  onVolver: () => void
}

export function VistaCartilla({ codigo, nombreSector, onVolver }: PropsVistaCartilla) {
  const arbol = useArbol(codigo)
  const refTitulo = useRef<HTMLHeadingElement>(null)
  const listo = arbol.estado === 'listo'

  // Al abrir la cartilla, el foco va a su título.
  useEffect(() => {
    if (listo) refTitulo.current?.focus({ preventScroll: true })
  }, [listo, codigo])

  return (
    <section className="vista-cartilla">
      <button
        type="button"
        className="boton boton--secundario vista-cartilla__volver"
        onClick={onVolver}
      >
        {TEXTOS_CARTILLA.volverALista}
      </button>
      {arbol.estado === 'cargando' && (
        <EstadoCarga etiqueta={TEXTOS_CARTILLA.cargando} forma="tarjeta" />
      )}
      {arbol.estado === 'error' && (
        <EstadoError mensaje={TEXTOS_CARTILLA.error} onReintentar={arbol.reintentar} />
      )}
      {arbol.estado === 'noEncontrado' && (
        <div role="alert">
          <EstadoVacio mensaje={`${TEXTOS_CARTILLA.noEncontrado} ${codigo}`} />
        </div>
      )}
      {arbol.estado === 'listo' && (
        <CartillaArbol arbol={arbol.arbol} nombreSector={nombreSector} refTitulo={refTitulo} />
      )}
    </section>
  )
}
