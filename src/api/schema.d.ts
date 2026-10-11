// Archivo generado con `npm run contrato:tipos` desde el contrato del back. No se edita a mano.

export interface paths {
  '/salud': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Estado de la API y de la base de datos */
    get: operations['obtenerSalud']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/sectores': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Los sectores del campus como GeoJSON (polígonos en WGS84) */
    get: operations['listarSectores']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/sectores/{sector_id}/arboles': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Los árboles de un sector como GeoJSON (puntos en WGS84)
     * @description Trae todos los árboles del sector, ordenados por `codigo`. Un árbol sin coordenadas viene con `geometry: null`: aparece en la lista, pero no en el mapa. La v0 no pagina; un sector tiene cientos de árboles, no miles.
     */
    get: operations['listarArbolesDeSector']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/arboles/{codigo}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** La cartilla completa de un árbol */
    get: operations['obtenerArbol']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    Salud: {
      /** @enum {string} */
      estado: 'ok' | 'error'
      /** @description `ok` o una explicación corta del problema. */
      base_de_datos: string
      /** @description Versión de PostGIS que responde la BD. Solo viene cuando `estado` es `ok`. */
      postgis?: string
    }
    Error: {
      /** @description Mensaje en español. Es el formato de error de Django REST Framework. */
      detail: string
    }
    /**
     * @description Código del árbol, por ejemplo `S01-A001` (sector 01, árbol 001). Es el mismo que va en la nota de la foto NoteCam.
     * @example S01-A001
     */
    CodigoArbol: string
    /** @description [longitud, latitud] en grados WGS84. */
    Posicion: [number, number]
    Poligono: {
      /** @constant */
      type: 'Polygon'
      coordinates: components['schemas']['Posicion'][][]
    }
    Punto: {
      /** @constant */
      type: 'Point'
      coordinates: components['schemas']['Posicion']
    }
    SectorPropiedades: {
      id: number
      /** @example Sector 1 */
      nombre: string
      /** @description Nombre de un token de `src/styles/tokens.css` del front (sin `--`), por ejemplo `copa-carmin`. Si es `null`, el front usa el color de reposo de los sectores. */
      color: string | null
      /** @description `true` si el límite es una propuesta todavía no confirmada en campo. */
      provisional: boolean
      /** @description Árboles registrados en el sector, reales y demo juntos. */
      total_arboles: number
    }
    SectorFeature: {
      /** @constant */
      type: 'Feature'
      id: number
      geometry: components['schemas']['Poligono']
      properties: components['schemas']['SectorPropiedades']
    }
    SectorColeccion: {
      /** @constant */
      type: 'FeatureCollection'
      features: components['schemas']['SectorFeature'][]
    }
    /** @description Lo mínimo para listar el árbol y dibujarlo como punto. La cartilla completa sale de `/arboles/{codigo}`. */
    ArbolResumen: {
      codigo: components['schemas']['CodigoArbol']
      sector: number
      nombre_comun: string | null
      nombre_cientifico: string | null
      /** @description Valor del catálogo de la planilla (Bueno */
      estado_general: string | null
      /** Format: uri */
      foto_miniatura_url: string | null
      demo: boolean
    }
    ArbolResumenFeature: {
      /** @constant */
      type: 'Feature'
      id: components['schemas']['CodigoArbol']
      geometry: components['schemas']['Punto'] | null
      properties: components['schemas']['ArbolResumen']
    }
    ArbolResumenColeccion: {
      /** @constant */
      type: 'FeatureCollection'
      features: components['schemas']['ArbolResumenFeature'][]
    }
    /** @description La cartilla del árbol. Los 19 campos de la visión del stakeholder, más su contexto de campo y su trazabilidad. Los textos de estado son los del catálogo de la planilla de la brigada. */
    Arbol: {
      codigo: components['schemas']['CodigoArbol']
      sector: number
      nombre_comun: string | null
      /** @description En cursiva en la UI. */
      nombre_cientifico: string | null
      /** @description Estado de la identificación según la planilla de la brigada (por ejemplo Identificada o Especie por verificar). */
      identificacion: string | null
      /** @description Valor del catálogo de la planilla de la brigada (por ejemplo Nativa o Introducida / exótica). */
      origen: string | null
      /** @description Según DS 043-2006-AG; la llena el stakeholder. */
      condicion_conservacion: string | null
      /** @description Grados WGS84 con 6 decimales. */
      lat: number | null
      /** @description Grados WGS84 con 6 decimales. */
      lon: number | null
      /** @description Metros este en UTM 18S (EPSG:32718), leídos de la ubicación tal como está guardada, sin transformar; con 2 decimales. Es null si el árbol no tiene ubicación. */
      utm_este_m: number | null
      /** @description Metros norte en UTM 18S (EPSG:32718), leídos de la ubicación tal como está guardada, sin transformar; con 2 decimales. Es null si el árbol no tiene ubicación. */
      utm_norte_m: number | null
      altura_total_m: number | null
      /** @description Diámetro a la altura del pecho (1.30 m). */
      dap_cm: number | null
      /** @description Diámetro de copa norte-sur. */
      copa_ns_m: number | null
      /** @description Diámetro de copa este-oeste. */
      copa_eo_m: number | null
      estado_general: string | null
      estado_copa: string | null
      tronco_danos: string | null
      raices_base: string | null
      interferencia_entorno: string | null
      /** @description Texto de campo de la planilla de la brigada, junto con las notas de la importación (por ejemplo un DAP no numérico). */
      observaciones: string | null
      /** Format: uri */
      foto_url: string | null
      /** Format: uri */
      foto_miniatura_url: string | null
      /** @description kg de CO₂ equivalente; lo calcula el stakeholder. */
      co2_almacenado_kg: number | null
      /** @description kg de CO₂ por año; lo calcula el stakeholder. */
      co2_captura_anual_kg: number | null
      /** @description De dónde sale el registro (planilla */
      fuente: string
      /** Format: date */
      fecha_registro: string | null
      demo: boolean
    }
  }
  responses: {
    /** @description No existe un recurso con ese identificador. */
    NoEncontrado: {
      headers: {
        [name: string]: unknown
      }
      content: {
        /**
         * @example {
         *       "detail": "No encontrado."
         *     }
         */
        'application/json': components['schemas']['Error']
      }
    }
  }
  parameters: {
    /** @description El `id` del sector (1, 2, 3…). No hay un máximo fijo; agregar sectores no cambia el contrato. */
    SectorId: number
  }
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
  obtenerSalud: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description La API y la BD responden. */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "estado": "ok",
           *       "base_de_datos": "ok",
           *       "postgis": "3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1"
           *     }
           */
          'application/json': components['schemas']['Salud']
        }
      }
      /** @description La API responde, pero la BD no. */
      503: {
        headers: {
          [name: string]: unknown
        }
        content: {
          /**
           * @example {
           *       "estado": "error",
           *       "base_de_datos": "sin conexión"
           *     }
           */
          'application/json': components['schemas']['Salud']
        }
      }
    }
  }
  listarSectores: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Todos los sectores, ordenados por `id`. */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SectorColeccion']
        }
      }
    }
  }
  listarArbolesDeSector: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description El `id` del sector (1, 2, 3…). No hay un máximo fijo; agregar sectores no cambia el contrato. */
        sector_id: components['parameters']['SectorId']
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Árboles del sector (puede ser una colección vacía). */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['ArbolResumenColeccion']
        }
      }
      404: components['responses']['NoEncontrado']
    }
  }
  obtenerArbol: {
    parameters: {
      query?: never
      header?: never
      path: {
        codigo: components['schemas']['CodigoArbol']
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description La cartilla con los 19 campos de la visión, más su contexto de campo y su trazabilidad. */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['Arbol']
        }
      }
      404: components['responses']['NoEncontrado']
    }
  }
}
