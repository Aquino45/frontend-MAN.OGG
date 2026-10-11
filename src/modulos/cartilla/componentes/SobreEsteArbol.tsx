// «Sobre este árbol»: su estado explicado, el motivo si es destacado y la ficha de su especie.
// Todo el texto sale de la API. Si no hay nada que decir, la sección no se dibuja.
import '../sobre.estilos.css'
import { useId } from 'react'
import type { Arbol } from '@/api/cliente'
import { SelloDemo } from '@/compartido/SelloDemo'
import { MARCADOR_FUENTE, TEXTOS_SOBRE_ARBOL } from '@/config/constantes'
import { explicacionesDelEstado, llenarPlantilla } from '../lib/capsulas'
import { CapsulaAyuda } from './CapsulaAyuda'

interface PropsSobreEsteArbol {
  arbol: Arbol
}

export function SobreEsteArbol({ arbol }: PropsSobreEsteArbol) {
  const idTitulo = useId()
  const explicaciones = explicacionesDelEstado(arbol.capsulas)
  const motivo = arbol.destacado ? arbol.motivo_destacado : null
  const ficha = arbol.ficha_especie

  // La nota de ejemplo sola no hace aparecer la sección
  if (explicaciones.length === 0 && !motivo && !ficha) return null

  return (
    <section className="sobre-arbol" aria-labelledby={idTitulo}>
      {arbol.demo && (
        <p className="sobre-arbol__demo">
          <SelloDemo />
          <CapsulaAyuda campo="demo" />
        </p>
      )}
      <h3 id={idTitulo} className="sobre-arbol__titulo">
        {TEXTOS_SOBRE_ARBOL.titulo}
      </h3>
      {explicaciones.length > 0 && (
        <ul className="sobre-arbol__lista">
          {explicaciones.map((capsula) => (
            <li key={capsula.campo} className="sobre-arbol__item">
              <strong className="sobre-arbol__dato">{capsula.titulo}</strong>{' '}
              {capsula.en_este_arbol}
            </li>
          ))}
        </ul>
      )}
      {motivo && (
        <div className="sobre-arbol__bloque">
          <h4 className="sobre-arbol__subtitulo">{TEXTOS_SOBRE_ARBOL.motivo}</h4>
          <p className="sobre-arbol__texto">{motivo}</p>
        </div>
      )}
      {ficha && (
        <>
          {ficha.beneficios.length > 0 && (
            <div className="sobre-arbol__bloque">
              <h4 className="sobre-arbol__subtitulo">{TEXTOS_SOBRE_ARBOL.beneficios}</h4>
              <ul className="sobre-arbol__lista sobre-arbol__lista--puntos">
                {ficha.beneficios.map((beneficio) => (
                  <li key={beneficio} className="sobre-arbol__item">
                    {beneficio}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ficha.dato_curioso && (
            <div className="sobre-arbol__bloque">
              <h4 className="sobre-arbol__subtitulo">{TEXTOS_SOBRE_ARBOL.datoCurioso}</h4>
              <p className="sobre-arbol__texto">{ficha.dato_curioso}</p>
            </div>
          )}
          {ficha.cuidados && (
            <div className="sobre-arbol__bloque">
              <h4 className="sobre-arbol__subtitulo">{TEXTOS_SOBRE_ARBOL.cuidados}</h4>
              <p className="sobre-arbol__texto">{ficha.cuidados}</p>
            </div>
          )}
          <p className="sobre-arbol__fuente">
            {llenarPlantilla(TEXTOS_SOBRE_ARBOL.fuente, { [MARCADOR_FUENTE]: ficha.fuente })}
          </p>
        </>
      )}
    </section>
  )
}
