import '../estilos.css'
import { useMemo } from 'react'
import { useSectores } from '@/modulos/mapa'
import { CifrasCenso } from '../componentes/CifrasCenso'
import { FranjaSectores } from '../componentes/FranjaSectores'
import { Portada } from '../componentes/Portada'
import { useArbolesDelCampus } from '../hooks/useArbolesDelCampus'
import { calcularCifras, conteoPorSector } from '../lib/cifras'

// Página de Inicio: portada, franja de sectores y cifras del censo.
// Cada bloque maneja su propio estado de carga y de error.
export function VistaInicio() {
  const sectores = useSectores()
  const sectoresListos = sectores.estado === 'listo' ? sectores.sectores : null
  const idsDeSectores = useMemo(
    () => sectoresListos?.map((sector) => sector.properties.id) ?? null,
    [sectoresListos],
  )
  const arboles = useArbolesDelCampus(idsDeSectores)
  const arbolesListos = arboles.estado === 'listo' ? arboles.arboles : null

  const conteos = useMemo(
    () => (arbolesListos ? conteoPorSector(arbolesListos) : null),
    [arbolesListos],
  )
  const cifras = useMemo(
    () => (sectoresListos && arbolesListos ? calcularCifras(sectoresListos, arbolesListos) : null),
    [sectoresListos, arbolesListos],
  )

  // Las cifras necesitan sectores y árboles; el primero que falle define el error y su reintento.
  const estadoCifras =
    sectores.estado === 'error' || arboles.estado === 'error'
      ? 'error'
      : cifras
        ? 'listo'
        : 'cargando'
  const reintentarCifras = sectores.estado === 'error' ? sectores.reintentar : arboles.reintentar

  return (
    <div className="inicio">
      <Portada cantidadSectores={sectoresListos ? sectoresListos.length : null} />
      <FranjaSectores
        estado={sectores.estado}
        sectores={sectoresListos ?? []}
        conteos={conteos}
        onReintentar={sectores.reintentar}
      />
      <CifrasCenso estado={estadoCifras} cifras={cifras} onReintentar={reintentarCifras} />
    </div>
  )
}
