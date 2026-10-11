// Al cerrar la cartilla, devuelve el foco al punto o a la fila desde donde se abrió.
import { useCallback, useEffect, useRef } from 'react'

const CLASE_FILA = 'fila-arbol'
const CLASE_PUNTO = 'punto-arbol'

// Los puntos del mapa son elementos SVG y las filas de la lista, HTML: los dos se pueden enfocar.
type Enfocable = Element & HTMLOrSVGElement

interface Origen {
  codigo: string
  elemento: Enfocable | null
}

function esEnfocable(elemento: Element | null): elemento is Enfocable {
  return elemento !== null && 'focus' in elemento
}

function buscarDestino({ codigo, elemento }: Origen): Enfocable | null {
  if (elemento?.isConnected) return elemento
  // El panel se vuelve a dibujar al cerrar la cartilla: se busca el mismo elemento por su código.
  const clase = elemento?.classList.contains(CLASE_PUNTO) ? CLASE_PUNTO : CLASE_FILA
  const codigoEscapado = codigo.replace(/["\\]/g, '\\$&')
  const destino = document.querySelector(`.${clase}[data-codigo="${codigoEscapado}"]`)
  return esEnfocable(destino) ? destino : null
}

// Devuelve la función que se llama justo antes de abrir un árbol, para recordar el origen.
export function useRetornoDeFoco(arbolCodigo: string | null): (codigo: string) => void {
  const origen = useRef<Origen | null>(null)
  const habiaArbol = useRef(arbolCodigo !== null)

  const recordarOrigen = useCallback((codigo: string) => {
    const activo = document.activeElement
    origen.current = { codigo, elemento: esEnfocable(activo) ? activo : null }
  }, [])

  useEffect(() => {
    const seCerroUnArbol = habiaArbol.current && arbolCodigo === null
    habiaArbol.current = arbolCodigo !== null
    if (!seCerroUnArbol || origen.current === null) return
    const recordado = origen.current
    origen.current = null
    const cuadro = window.requestAnimationFrame(() => {
      buscarDestino(recordado)?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(cuadro)
  }, [arbolCodigo])

  return recordarOrigen
}
