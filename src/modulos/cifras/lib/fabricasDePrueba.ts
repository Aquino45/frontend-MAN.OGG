// Árboles y sectores armados a mano para los tests del tablero: solo la forma del contrato, con
// ejemplos mínimos. Los números de cada test van escritos en el propio test.
import type { ArbolFeature, ArbolResumen, SectorFeature } from '@/api/cliente'

export function arbolDePrueba(codigo: string, cambios: Partial<ArbolResumen> = {}): ArbolFeature {
  const propiedades: ArbolResumen = {
    codigo,
    uid: `uid-${codigo}`,
    sector: Number(codigo.slice(1, 3)),
    nombre_comun: null,
    nombre_cientifico: null,
    estado_general: null,
    foto_miniatura_url: null,
    demo: false,
    destacado: false,
    motivo_destacado: null,
    co2_almacenado_kg: null,
    co2_captura_anual_kg: null,
    co2_simulado: false,
    dap_cm: null,
    altura_total_m: null,
    origen: null,
    ...cambios,
  }
  return { type: 'Feature', id: codigo, geometry: null, properties: propiedades } as ArbolFeature
}

export function sectorDePrueba(id: number): SectorFeature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-76.85 + id * 0.001, -11.99],
          [-76.849 + id * 0.001, -11.99],
          [-76.849 + id * 0.001, -11.991],
          [-76.85 + id * 0.001, -11.99],
        ],
      ],
    },
    properties: { id, nombre: `Sector ${id}`, color: null, provisional: false, total_arboles: 0 },
  } as unknown as SectorFeature
}

const CAMPOS_DEL_CONTRATO_060 = ['dap_cm', 'altura_total_m', 'origen']

// El árbol como lo entregaba la API antes del contrato 0.6.0: sin DAP, altura ni origen en el resumen
export function comoEnLaApiAnterior(arbol: ArbolFeature): ArbolFeature {
  const propiedades = Object.fromEntries(
    Object.entries(arbol.properties).filter(([campo]) => !CAMPOS_DEL_CONTRATO_060.includes(campo)),
  )
  return { ...arbol, properties: propiedades } as unknown as ArbolFeature
}
