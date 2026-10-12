// Si el mapa satelital se ve en color natural o teñido con la paleta. Se recuerda en el navegador
// como el tema; sin almacenamiento la página sigue andando con el teñido.
import { useCallback, useState } from 'react'
import { CLAVE_SATELITE_COLOR_NATURAL } from '@/config/satelite'

const VALOR_NATURAL = 'si'

function leerGuardado(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_SATELITE_COLOR_NATURAL) === VALOR_NATURAL
  } catch {
    return false
  }
}

function guardar(natural: boolean): void {
  try {
    if (natural) window.localStorage.setItem(CLAVE_SATELITE_COLOR_NATURAL, VALOR_NATURAL)
    else window.localStorage.removeItem(CLAVE_SATELITE_COLOR_NATURAL)
  } catch {
    // Sin almacenamiento disponible: la preferencia dura solo mientras la página está abierta.
  }
}

export function useColorNatural(): [boolean, () => void] {
  const [natural, setNatural] = useState(leerGuardado)
  const alternar = useCallback(() => {
    setNatural((actual) => {
      guardar(!actual)
      return !actual
    })
  }, [])
  return [natural, alternar]
}
