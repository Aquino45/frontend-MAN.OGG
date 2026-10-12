// Sección «CO₂ del campus» de Cifras: los cuatro gráficos y, solo si algún valor graficado es
// simulado, el encabezado que lo dice. Todo sale de los datos; ningún texto afirma qué es real.
import { useId, type CSSProperties } from 'react'
import { DURACION_ENTRADA_GRAFICOS_MS, TEXTOS_CIFRAS } from '@/config/constantes'
import type { CifrasCo2 } from '../lib/cifrasCo2'
import { BloqueCo2Barras } from './BloqueCo2Barras'
import { BloqueTopCo2 } from './BloqueTopCo2'

interface PropsSeccionCo2 {
  cifras: CifrasCo2
}

// La duración de la entrada de las barras sale de las constantes; el CSS la lee de esta variable
const ESTILO_ENTRADA = {
  '--cifras-co2-entrada-duracion': `${DURACION_ENTRADA_GRAFICOS_MS}ms`,
} as CSSProperties

export function SeccionCo2({ cifras }: PropsSeccionCo2) {
  const idTitulo = useId()
  const textos = TEXTOS_CIFRAS.co2
  return (
    <section className="cifras-co2" aria-labelledby={idTitulo} style={ESTILO_ENTRADA}>
      <h2 id={idTitulo} className="cifras-bloque__titulo">
        {textos.titulo}
      </h2>
      {cifras.hayCo2Simulado && <p className="cifras-co2__simulado">{textos.simulado}</p>}
      <div className="cifras__bloques">
        <BloqueCo2Barras
          titulo={textos.almacenadoPorSector.titulo}
          descripcion={textos.almacenadoPorSector.descripcion}
          columna={textos.almacenadoPorSector.columna}
          filas={cifras.almacenadoPorSector}
          tipo="almacenado"
          sinDato={cifras.sinDatoAlmacenado}
        />
        <BloqueCo2Barras
          titulo={textos.almacenadoPorEspecie.titulo}
          descripcion={textos.almacenadoPorEspecie.descripcion}
          columna={textos.almacenadoPorEspecie.columna}
          filas={cifras.almacenadoPorEspecie}
          tipo="almacenado"
          sinDato={cifras.sinDatoAlmacenado}
        />
        <BloqueCo2Barras
          titulo={textos.capturaPorSector.titulo}
          descripcion={textos.capturaPorSector.descripcion}
          columna={textos.capturaPorSector.columna}
          filas={cifras.capturaPorSector}
          tipo="captura"
          sinDato={cifras.sinDatoCaptura}
        />
        <BloqueTopCo2 filas={cifras.top} sinDato={cifras.sinDatoAlmacenado} />
      </div>
    </section>
  )
}
