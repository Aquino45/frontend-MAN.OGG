// Bloque invertido con el CO₂ almacenado y la captura anual. Solo muestra lo que trae la API.
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { MEDIDAS, TEXTOS_CARTILLA } from '@/config/constantes'
import { formatearNumero } from '@/lib/formatear'

interface PropsBloqueCo2 {
  arbol: Arbol
}

export function BloqueCo2({ arbol }: PropsBloqueCo2) {
  const almacenado = formatearNumero(arbol.co2_almacenado_kg, 'co2AlmacenadoKg')
  const captura = formatearNumero(arbol.co2_captura_anual_kg, 'co2CapturaAnualKg')
  return (
    <div className="bloque-co2">
      <div className="bloque-co2__columna">
        <span className="bloque-co2__etiqueta">{TEXTOS_CARTILLA.co2Almacenado}</span>
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
      </div>
      <div className="bloque-co2__columna bloque-co2__columna--derecha">
        <span className="bloque-co2__etiqueta">{TEXTOS_CARTILLA.capturaAnual}</span>
        <span className="bloque-co2__captura">
          {captura === null ? <SinDato /> : `+${captura} ${MEDIDAS.co2CapturaAnualKg.unidad}`}
        </span>
      </div>
    </div>
  )
}
