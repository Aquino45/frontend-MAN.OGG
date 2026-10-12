// Si el mapa satelital se ve teñido con la paleta. Por defecto se ve en color natural. Se recuerda
// en el navegador como el tema; sin almacenamiento la página sigue andando en color natural.
import { useCallback, useState } from 'react'
import { CLAVE_SATELITE_TENIDO } from '@/config/satelite'

const VALOR_TENIDO = 'si'

function leerGuardado(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_SATELITE_TENIDO) === VALOR_TENIDO
  } catch {
    return false
  }
}

function guardar(tenido: boolean): void {
  try {
    if (tenido) window.localStorage.setItem(CLAVE_SATELITE_TENIDO, VALOR_TENIDO)
    else window.localStorage.removeItem(CLAVE_SATELITE_TENIDO)
  } catch {
    // Sin almacenamiento disponible: la preferencia dura solo mientras la página está abierta.
  }
}

export function useTenido(): [boolean, () => void] {
  const [tenido, setTenido] = useState(leerGuardado)
  const alternar = useCallback(() => {
    setTenido((actual) => {
      guardar(!actual)
      return !actual
    })
  }, [])
  return [tenido, alternar]
}
