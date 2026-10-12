// Bloque invertido con el CO₂ almacenado y la captura anual. Solo muestra lo que trae la API
// y marca como «Simulado» los valores que la API declara simulados.
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { MEDIDAS, TEXTOS_CARTILLA } from '@/config/constantes'
import { formatearNumero } from '@/lib/formatear'
import { CapsulaAyuda } from './CapsulaAyuda'

// Etiqueta «Simulado»: lo visible es la palabra corta; el lector de pantalla lee la frase completa
function EtiquetaSimulado() {
  return (
    <span className="bloque-co2__simulado">
      <span aria-hidden="true">{TEXTOS_CARTILLA.co2Simulado}</span>
      <span className="solo-lectores">{TEXTOS_CARTILLA.co2SimuladoAccesible}</span>
    </span>
  )
}

interface PropsBloqueCo2 {
  arbol: Arbol
}

export function BloqueCo2({ arbol }: PropsBloqueCo2) {
  const almacenado = formatearNumero(arbol.co2_almacenado_kg, 'co2AlmacenadoKg')
  const captura = formatearNumero(arbol.co2_captura_anual_kg, 'co2CapturaAnualKg')
  return (
    <div className="bloque-co2">
      <div className="bloque-co2__columna">
        <span className="bloque-co2__etiqueta">
          {TEXTOS_CARTILLA.co2Almacenado}
          <CapsulaAyuda campo="co2_almacenado_kg" />
        </span>
        <span className="bloque-co2__principal">
          {almacenado === null ? (
            <SinDato />
          ) : (
            <>
              {almacenado}{' '}
              <span className="bloque-co2__unidad">{MEDIDAS.co2AlmacenadoKg.unidad}</span>
            </>
          )}
        </span>
        {arbol.co2_simulado && almacenado !== null && <EtiquetaSimulado />}
      </div>
      <div className="bloque-co2__columna bloque-co2__columna--derecha">
        <span className="bloque-co2__etiqueta">
          {TEXTOS_CARTILLA.capturaAnual}
          <CapsulaAyuda campo="co2_captura_anual_kg" />
        </span>
        <span className="bloque-co2__captura">
          {captura === null ? <SinDato /> : `+${captura} ${MEDIDAS.co2CapturaAnualKg.unidad}`}
        </span>
        {arbol.co2_simulado && captura !== null && <EtiquetaSimulado />}
      </div>
    </div>
  )
}
