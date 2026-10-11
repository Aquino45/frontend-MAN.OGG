// Foto del árbol, la protagonista de la cartilla. Carga primero la miniatura y la foto completa
// la reemplaza al llegar; sin foto, muestra un árbol pixelado y «Foto pendiente».
import { useState } from 'react'
import type { Arbol } from '@/api/cliente'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { SelloDemo } from '@/compartido/SelloDemo'
import { TEXTOS_CARTILLA } from '@/config/constantes'
import { ChipEstado } from './ChipEstado'

interface PropsFotoArbol {
  arbol: Arbol
}

export function FotoArbol({ arbol }: PropsFotoArbol) {
  const [fotoCompletaLista, setFotoCompletaLista] = useState(false)
  const textoAlternativo = `${TEXTOS_CARTILLA.fotoDelArbol} ${arbol.codigo}${
    arbol.nombre_comun ? ` (${arbol.nombre_comun})` : ''
  }`
  const fotoPrincipal = arbol.foto_url ?? arbol.foto_miniatura_url
  const hayFoto = fotoPrincipal !== null

  return (
    <div className="foto-arbol">
      {hayFoto ? (
        <>
          {arbol.foto_miniatura_url && arbol.foto_url && (
            <img
              className="foto-arbol__imagen"
              src={arbol.foto_miniatura_url}
              alt={textoAlternativo}
            />
          )}
          <img
            className={`foto-arbol__imagen foto-arbol__imagen--completa${
              arbol.foto_miniatura_url && arbol.foto_url && !fotoCompletaLista
                ? ' foto-arbol__imagen--pendiente'
                : ''
            }`}
            src={fotoPrincipal}
            alt={textoAlternativo}
            onLoad={() => setFotoCompletaLista(true)}
          />
        </>
      ) : (
        <div className="foto-arbol__pendiente">
          <GlifoPixelArbol />
          <span className="foto-arbol__pendiente-texto">{TEXTOS_CARTILLA.fotoPendiente}</span>
        </div>
      )}
      {arbol.demo && (
        <span className="foto-arbol__sello">
          <SelloDemo />
        </span>
      )}
      <span className="foto-arbol__estado">
        <ChipEstado estadoGeneral={arbol.estado_general} />
      </span>
    </div>
  )
}
