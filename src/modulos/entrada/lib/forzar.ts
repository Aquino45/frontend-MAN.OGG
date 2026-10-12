// Forzar la variante alterna a mano: un clic en el árbol abre una ventana, y si en ella se teclea la
// clave, se avisa. La clave no está escrita en ninguna parte: se compara la huella SHA-256 de las
// últimas letras tecleadas. Se carga recién con el primer clic en el árbol, así no pesa al abrir el sitio.
import { FORZAR_ENTRADA as F } from '@/config/constantes'
import { huellaSha256, letraDeTecla } from './huella'

export interface Forzado {
  // Abre (o reabre) la ventana: se empieza de cero
  abrir: () => void
  // Deja de escuchar
  cerrar: () => void
}

export function crearForzado(alForzar: () => void, huella: string = F.huella): Forzado {
  let ventana: { hasta: number; letras: string } | null = null

  const alTeclear = (evento: KeyboardEvent) => {
    const abierta = ventana
    if (!abierta || performance.now() > abierta.hasta) return
    const letra = letraDeTecla(evento)
    if (!letra) return
    abierta.letras = (abierta.letras + letra).slice(-F.largoClave)
    if (abierta.letras.length < F.largoClave) return
    void huellaSha256(abierta.letras).then((resultado) => {
      if (resultado !== huella || ventana !== abierta) return
      ventana = null
      alForzar()
    })
  }
  window.addEventListener('keydown', alTeclear)

  return {
    abrir: () => {
      ventana = { hasta: performance.now() + F.ventanaMs, letras: '' }
    },
    cerrar: () => {
      ventana = null
      window.removeEventListener('keydown', alTeclear)
    },
  }
}
