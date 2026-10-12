// Envuelve lo que cambia al filtrar: cuando cambia `clave`, el contenido se vuelve a montar y entra
// con un fundido corto (solo opacidad; con «reducir movimiento» o con el teclado, al instante).
import type { ReactNode } from 'react'

export function Aparece({ clave, children }: { clave: string; children: ReactNode }) {
  return (
    <div key={clave} className="tablero-aparece">
      {children}
    </div>
  )
}
