import '../estilos.css'
import { useMemo } from 'react'
import { useArbolesDelCampus } from '@/compartido/useArbolesDelCampus'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import { TEXTOS_ARMAZON, URL_LICENCIA_ODBL } from '@/config/constantes'
import { armarNotaDatos, clasificarSectores } from '../lib/notaDatos'

// Pie del sitio: de dónde salen los datos (calculado con la API) y el crédito obligatorio del
// contorno del campus. Mientras carga o si la API falla, no afirma nada sobre los datos.
export function Pie() {
  const sectores = useSectoresDelCampus()
  const sectoresListos = sectores.estado === 'listo' ? sectores.sectores : null
  const idsDeSectores = useMemo(
    () => sectoresListos?.map((sector) => sector.properties.id) ?? null,
    [sectoresListos],
  )
  const arboles = useArbolesDelCampus(idsDeSectores)

  const nota = useMemo(() => {
    if (sectoresListos === null || arboles.estado !== 'listo') return null
    return armarNotaDatos(clasificarSectores(sectoresListos, arboles.arboles))
  }, [sectoresListos, arboles])

  return (
    <footer className="armazon-pie">
      <div className="armazon-pie__contenido">
        {nota !== null && <p className="armazon-pie__texto">{nota}</p>}
        <p className="armazon-pie__texto">
          {TEXTOS_ARMAZON.creditoContorno} (
          <a className="armazon-pie__enlace" href={URL_LICENCIA_ODBL}>
            {TEXTOS_ARMAZON.nombreLicencia}
          </a>
          )
        </p>
      </div>
    </footer>
  )
}
