// Sello de los registros de ejemplo (demo: true): el dato no es del censo real.
import { TEXTOS_CARTILLA } from '@/config/constantes'

export function SelloDemo() {
  return <span className="sello-demo">{TEXTOS_CARTILLA.selloDemo}</span>
}
