// Para comparar lo que se teclea contra una huella en vez de contra un texto escrito en el código.

// SHA-256 en hexadecimal; null si el navegador no ofrece `crypto.subtle` (solo en contexto seguro)
export async function huellaSha256(texto: string): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null
  const bytes = new TextEncoder().encode(texto)
  const resumen = await subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(resumen)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

// La letra que aporta una tecla (en minúscula), o null si no cuenta: espacios, números, teclas
// especiales y combinaciones con Ctrl, Alt o Meta se ignoran
export function letraDeTecla(
  evento: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'metaKey'>,
) {
  if (evento.ctrlKey || evento.altKey || evento.metaKey) return null
  return /^[a-zA-Z]$/.test(evento.key) ? evento.key.toLowerCase() : null
}
