// Pide el detalle de cada árbol destacado que se muestra, solo para leer su DAP y su altura
// (el resumen de la lista no los trae). Cada árbol tiene su propio estado: si uno falla, los demás siguen.
import { useEffect, useState } from 'react'
import { obtenerArbol } from '@/api/cliente'

export type MedidasDestacado =
  | { estado: 'cargando' }
  | { estado: 'listo'; dapCm: number | null; alturaM: number | null }
  | { estado: 'error' }

const SEPARADOR_DE_CODIGOS = ','
const CARGANDO: MedidasDestacado = { estado: 'cargando' }

// Recibe los códigos mostrados, o null mientras no hay destacados (no pide nada).
// Devuelve una función por código; un código sin respuesta aún cuenta como «cargando».
export function useMedidasDeDestacados(
  codigos: readonly string[] | null,
): (codigo: string) => MedidasDestacado {
  const clave = codigos === null ? null : codigos.join(SEPARADOR_DE_CODIGOS)
  const [medidas, setMedidas] = useState<Record<string, MedidasDestacado>>({})

  useEffect(() => {
    if (clave === null || clave === '') return
    const controlador = new AbortController()
    for (const codigo of clave.split(SEPARADOR_DE_CODIGOS)) {
      obtenerArbol(codigo, { signal: controlador.signal })
        .then((arbol) =>
          setMedidas((previas) => ({
            ...previas,
            [codigo]: { estado: 'listo', dapCm: arbol.dap_cm, alturaM: arbol.altura_total_m },
          })),
        )
        .catch(() => {
          if (controlador.signal.aborted) return
          setMedidas((previas) => ({ ...previas, [codigo]: { estado: 'error' } }))
        })
    }
    return () => controlador.abort()
  }, [clave])

  return (codigo) => medidas[codigo] ?? CARGANDO
}
