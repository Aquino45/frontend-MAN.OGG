import '../estilos.css'
import { useMemo } from 'react'
import { HorizontePixel } from '@/compartido/motivos/HorizontePixel'
import { useArbolesDelCampus } from '@/compartido/useArbolesDelCampus'
import { useSectoresDelCampus } from '@/compartido/useSectoresDelCampus'
import { CANTIDAD_DESTACADOS_INICIO } from '@/config/constantes'
import { BloqueDestacados } from '../componentes/BloqueDestacados'
import { CifrasCenso } from '../componentes/CifrasCenso'
import { FranjaSectores } from '../componentes/FranjaSectores'
import { Portada } from '../componentes/Portada'
import { useMedidasDeDestacados } from '../hooks/useMedidasDeDestacados'
import { calcularCifras, conteoPorSector } from '../lib/cifras'
import { elegirDestacados } from '../lib/destacados'

// Página de Inicio: portada, franja de sectores, cifras del censo, árboles destacados.
// Cada bloque maneja su propio estado de carga y de error.
export function VistaInicio() {
  const sectores = useSectoresDelCampus()
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
  const destacados = useMemo(
    () =>
      sectoresListos && arbolesListos
        ? elegirDestacados(arbolesListos, sectoresListos, CANTIDAD_DESTACADOS_INICIO)
        : null,
    [sectoresListos, arbolesListos],
  )
  const codigosDestacados = useMemo(
    () => destacados?.map(({ arbol }) => arbol.codigo) ?? null,
    [destacados],
  )
  const medidasDe = useMedidasDeDestacados(codigosDestacados)

  // Las cifras y los destacados necesitan sectores y árboles; el primero que falle define el
  // error y su reintento.
  const estadoCampus =
    sectores.estado === 'error' || arboles.estado === 'error'
      ? 'error'
      : cifras
        ? 'listo'
        : 'cargando'
  const reintentarCampus = sectores.estado === 'error' ? sectores.reintentar : arboles.reintentar

  return (
    <div className="inicio">
      <Portada cantidadSectores={sectoresListos ? sectoresListos.length : null} />
      <HorizontePixel fondo="var(--franja-contraste-fondo)" />
      <FranjaSectores
        estado={sectores.estado}
        sectores={sectoresListos ?? []}
        conteos={conteos}
        onReintentar={sectores.reintentar}
      />
      <HorizontePixel fondo="var(--franja-cifras-fondo)" />
      <CifrasCenso estado={estadoCampus} cifras={cifras} onReintentar={reintentarCampus} />
      <HorizontePixel fondo="var(--color-fondo)" />
      <BloqueDestacados
        estado={estadoCampus}
        destacados={destacados ?? []}
        medidasDe={medidasDe}
        onReintentar={reintentarCampus}
      />
    </div>
  )
}
