// Dispersión DAP × altura: un punto por árbol, del color de su especie y con el tamaño que va con su
// CO₂ (simulado); los de ejemplo con borde punteado. Un clic en un punto abre su cartilla. Los
// ejes no se mueven al filtrar: lo que no cumple los filtros se apaga en su sitio.
import { useNavigate } from 'react-router'
import type { MouseEvent } from 'react'
import { SinDato } from '@/compartido/SinDato'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import { FILAS_TABLA_DISPERSION, TEXTOS_TABLERO } from '@/config/tablero'
import { useAnchoMedido } from '../hooks/useAnchoMedido'
import { escalaLineal, marcasRedondas, radioPorArea } from '../lib/escalas'
import {
  ALTO_DISPERSION_ANGOSTO_PX,
  ALTO_DISPERSION_PX,
  BAJADA_NUMEROS_EJE_X_DISPERSION_PX,
  ANCHO_ANGOSTO_PX,
  ANCHO_POR_DEFECTO_PX,
  MARCAS_EJE_X,
  MARCAS_EJE_Y,
  MARGEN_EJES,
  MARGEN_TITULO_EJE_X_DISPERSION_PX,
  MARGEN_TITULO_EJE_Y_PX,
  RADIO_PUNTO,
} from '../lib/medidasGraficos'
import type { FilaEspecie } from '../lib/tablero'
import type { Dispersion as DatosDispersion, PuntoDispersion } from '../lib/tableroGraficos'
import { formatearCo2 } from '../lib/cifrasCo2'
import { TarjetaGrafico } from './TarjetaGrafico'

const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

interface PropsDispersion {
  dispersion: DatosDispersion
  // Especies con su serie, para la leyenda de colores (las de la dona)
  especies: readonly FilaEspecie[]
}

export function Dispersion({ dispersion, especies }: PropsDispersion) {
  const textos = TEXTOS_TABLERO.dispersion
  const navegar = useNavigate()
  const conTransicion = useEnlaceConTransicion()
  const [referencia, ancho] = useAnchoMedido<HTMLDivElement>(ANCHO_POR_DEFECTO_PX)
  const alto = ancho < ANCHO_ANGOSTO_PX ? ALTO_DISPERSION_ANGOSTO_PX : ALTO_DISPERSION_PX
  const { dominio, puntos } = dispersion
  const ejeX = marcasRedondas(dominio.dapMaximo, MARCAS_EJE_X)
  const ejeY = marcasRedondas(dominio.alturaMaxima, MARCAS_EJE_Y)
  const x = escalaLineal(0, ejeX.tope, MARGEN_EJES.izquierda, ancho - MARGEN_EJES.derecha)
  const y = escalaLineal(0, ejeY.tope, alto - MARGEN_EJES.abajo, MARGEN_EJES.arriba)

  const alAbrir = (evento: MouseEvent<HTMLAnchorElement>, enlace: string) => {
    conTransicion(evento)
    if (evento.defaultPrevented || evento.button !== 0) return
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
    evento.preventDefault()
    navegar(enlace)
  }

  const etiquetaDe = (punto: PuntoDispersion) =>
    textos.etiquetaPunto
      .replace('{codigo}', punto.codigo)
      .replace('{especie}', punto.especie ?? TEXTOS_TABLERO.sinDato)
      .replace('{dap}', String(punto.dapCm))
      .replace('{altura}', String(punto.alturaM))

  const visibles = puntos.filter((punto) => punto.visible)
  const sinMedidasTexto =
    dispersion.sinMedidas === 0
      ? null
      : dispersion.sinMedidas === 1
        ? textos.sinMedidasUno
        : textos.sinMedidas.replace('{n}', String(dispersion.sinMedidas))

  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={textos.descripcion}
      clase="tablero-tarjeta--ancha"
      tabla={{
        grafico: textos.titulo,
        cabecera: [
          textos.columnaCodigo,
          textos.columnaEspecie,
          textos.columnaDap,
          textos.columnaAltura,
          textos.columnaCo2,
          textos.columnaDatos,
        ],
        filas: [...visibles]
          .sort((a, b) => (b.co2Kg ?? 0) - (a.co2Kg ?? 0))
          .slice(0, FILAS_TABLA_DISPERSION)
          .map((punto) => [
            punto.codigo,
            punto.especie ?? TEXTOS_TABLERO.sinDato,
            String(punto.dapCm),
            String(punto.alturaM),
            punto.co2Kg === null ? TEXTOS_TABLERO.sinDato : formatearCo2(punto.co2Kg, 'almacenado'),
            punto.ejemplo ? textos.ejemplo : textos.campo,
          ]),
      }}
    >
      <div ref={referencia} className="tablero-grafico">
        <svg
          className="tablero-dispersion"
          viewBox={`0 0 ${ancho} ${alto}`}
          width={ancho}
          height={alto}
          role="group"
          aria-label={textos.titulo}
        >
          <g aria-hidden="true">
            {ejeY.marcas.map((marca) => (
              <g key={`y${marca}`}>
                <line
                  className="tablero-rejilla"
                  x1={MARGEN_EJES.izquierda}
                  x2={ancho - MARGEN_EJES.derecha}
                  y1={y(marca)}
                  y2={y(marca)}
                />
                <text
                  className="tablero-eje tablero-eje--fin"
                  x={MARGEN_EJES.izquierda - 8}
                  y={y(marca) + 4}
                >
                  {entero.format(marca)}
                </text>
              </g>
            ))}
            {ejeX.marcas.map((marca) => (
              <text
                key={`x${marca}`}
                className="tablero-eje tablero-eje--medio"
                x={x(marca)}
                y={alto - MARGEN_EJES.abajo + BAJADA_NUMEROS_EJE_X_DISPERSION_PX}
              >
                {entero.format(marca)}
              </text>
            ))}
            <text
              className="tablero-eje tablero-eje--medio"
              x={(MARGEN_EJES.izquierda + ancho - MARGEN_EJES.derecha) / 2}
              y={alto - MARGEN_TITULO_EJE_X_DISPERSION_PX}
            >
              {textos.ejeX}
            </text>
            <text
              className="tablero-eje tablero-eje--medio"
              transform={`translate(${MARGEN_TITULO_EJE_Y_PX} ${(MARGEN_EJES.arriba + alto - MARGEN_EJES.abajo) / 2}) rotate(-90)`}
            >
              {textos.ejeY}
            </text>
          </g>
          {puntos.map((punto) => (
            <a
              key={punto.codigo}
              href={punto.enlace}
              className="tablero-punto"
              data-serie={punto.serie}
              data-ejemplo={punto.ejemplo ? 'si' : undefined}
              data-apagado={punto.visible ? undefined : 'si'}
              aria-label={etiquetaDe(punto)}
              tabIndex={punto.visible ? 0 : -1}
              aria-hidden={punto.visible ? undefined : true}
              onClick={(evento) => alAbrir(evento, punto.enlace)}
            >
              <circle
                cx={x(punto.dapCm)}
                cy={y(punto.alturaM)}
                r={radioPorArea(
                  punto.co2Kg,
                  dominio.co2Maximo,
                  RADIO_PUNTO.minimo,
                  RADIO_PUNTO.maximo,
                )}
              />
            </a>
          ))}
        </svg>
      </div>
      <ul className="tablero-apoyo">
        {especies.map((fila) => (
          <li key={fila.clave ?? fila.etiqueta} className="tablero-apoyo__item">
            <i className="tablero-leyenda__muestra" data-serie={fila.serie} aria-hidden="true" />
            {fila.comun ?? fila.etiqueta}
          </li>
        ))}
        <li className="tablero-apoyo__item">
          <i className="tablero-punto-muestra" aria-hidden="true" />
          {textos.campo}
        </li>
        <li className="tablero-apoyo__item">
          <i className="tablero-punto-muestra" data-ejemplo="si" aria-hidden="true" />
          {textos.ejemplo}
        </li>
        <li className="tablero-apoyo__item">
          {textos.tamano} {formatearCo2(dominio.co2Maximo, 'almacenado') || <SinDato />}
        </li>
      </ul>
      {sinMedidasTexto && <p className="tablero-nota">{sinMedidasTexto}</p>}
    </TarjetaGrafico>
  )
}
