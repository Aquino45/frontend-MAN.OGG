// Pide la cartilla de un árbol a la API y expone su estado, con reintento.
import { useCallback, useEffect, useState } from 'react'
import { ErrorNoEncontrado, obtenerArbol, type Arbol } from '@/api/cliente'

export type EstadoArbol =
  | { estado: 'cargando' }
  | { estado: 'listo'; arbol: Arbol }
  | { estado: 'noEncontrado' }
  | { estado: 'error'; error: Error }

type Resultado =
  | { codigo: string; intento: number; estado: 'listo'; arbol: Arbol }
  | { codigo: string; intento: number; estado: 'noEncontrado' }
  | { codigo: string; intento: number; estado: 'error'; error: Error }

export function useArbol(codigo: string): EstadoArbol & { reintentar: () => void } {
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerArbol(codigo, { signal: controlador.signal })
      .then((arbol) => setResultado({ codigo, intento, estado: 'listo', arbol }))
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        if (error instanceof ErrorNoEncontrado) {
          setResultado({ codigo, intento, estado: 'noEncontrado' })
          return
        }
        setResultado({
          codigo,
          intento,
          estado: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => controlador.abort()
  }, [codigo, intento])

  const reintentar = useCallback(() => setIntento((anterior) => anterior + 1), [])

  // Un resultado de otro árbol o de un intento anterior ya no vale: se está cargando.
  if (resultado === null || resultado.codigo !== codigo || resultado.intento !== intento) {
    return { estado: 'cargando', reintentar }
  }
  return { ...resultado, reintentar }
}
