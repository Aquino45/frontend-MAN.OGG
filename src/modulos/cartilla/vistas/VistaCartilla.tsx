// Pantalla de la cartilla: pide el árbol, muestra sus estados y devuelve el foco al abrir.
import '../estilos.css'
import { useEffect, useRef } from 'react'
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
        className="boton boton--texto vista-cartilla__volver"
        onClick={onVolver}
      >
        {TEXTOS_CARTILLA.volverALista}
      </button>
      {arbol.estado === 'cargando' && (
        <p className="vista-cartilla__mensaje" role="status">
          {TEXTOS_CARTILLA.cargando}
        </p>
      )}
      {arbol.estado === 'error' && (
        <div className="vista-cartilla__mensaje" role="alert">
          <p>{TEXTOS_CARTILLA.error}</p>
          <button type="button" className="boton" onClick={arbol.reintentar}>
            {TEXTOS_CARTILLA.reintentar}
          </button>
        </div>
      )}
      {arbol.estado === 'noEncontrado' && (
        <p className="vista-cartilla__mensaje" role="alert">
          {TEXTOS_CARTILLA.noEncontrado} {codigo}
        </p>
      )}
      {arbol.estado === 'listo' && (
        <CartillaArbol arbol={arbol.arbol} nombreSector={nombreSector} refTitulo={refTitulo} />
      )}
    </section>
  )
}
