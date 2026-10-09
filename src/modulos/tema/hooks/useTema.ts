// Estado del tema: lo lee del navegador, lo aplica en <html> y recuerda la elección manual.
import { useCallback, useEffect, useState } from 'react'
import { ATRIBUTO_TEMA, CLAVE_TEMA_GUARDADO, CONSULTA_TEMA_CLARO } from '@/config/constantes'
import { esTema, resolverTema, temaOpuesto, type Tema } from '../lib/tema'

function leerTemaGuardado(): Tema | null {
  try {
    const guardado = window.localStorage.getItem(CLAVE_TEMA_GUARDADO)
    return esTema(guardado) ? guardado : null
  } catch {
    return null
  }
}

function guardarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CLAVE_TEMA_GUARDADO, tema)
  } catch {
    // Sin almacenamiento disponible: el tema vale para esta visita y nada más.
  }
}

function consultaTemaClaro(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(CONSULTA_TEMA_CLARO) : null
}

function aplicarTema(tema: Tema): void {
  document.documentElement.setAttribute(ATRIBUTO_TEMA, tema)
}

function temaActual(): Tema {
  return resolverTema(leerTemaGuardado(), consultaTemaClaro()?.matches ?? false)
}

// Se llama antes del primer render para que la página no parpadee con el tema equivocado.
export function aplicarTemaInicial(): void {
  aplicarTema(temaActual())
}

export function useTema(): { tema: Tema; alternar: () => void } {
  const [tema, setTema] = useState<Tema>(temaActual)

  useEffect(() => aplicarTema(tema), [tema])

  // Mientras no haya una elección manual, el tema sigue los cambios del sistema.
  useEffect(() => {
    const consulta = consultaTemaClaro()
    if (!consulta) return
    const alCambiarSistema = () => {
      if (leerTemaGuardado() === null) setTema(temaActual())
    }
    consulta.addEventListener('change', alCambiarSistema)
    return () => consulta.removeEventListener('change', alCambiarSistema)
  }, [])

  const alternar = useCallback(() => {
    setTema((anterior) => {
      const siguiente = temaOpuesto(anterior)
      guardarTema(siguiente)
      return siguiente
    })
  }, [])

  return { tema, alternar }
}
