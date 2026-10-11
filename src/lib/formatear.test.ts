import { describe, expect, it } from 'vitest'
import { SEPARADOR_MILES } from '@/config/constantes'
import { formatearMedida, formatearNumero } from './formatear'

const miles = (...grupos: string[]) => grupos.join(SEPARADOR_MILES)

describe('formatearNumero', () => {
  it('devuelve null si no hay dato', () => {
    expect(formatearNumero(null, 'alturaM')).toBeNull()
    expect(formatearNumero(Number.NaN, 'alturaM')).toBeNull()
  })

  it('respeta los decimales de la magnitud, también con cero', () => {
    expect(formatearNumero(0, 'alturaM')).toBe('0.0')
    expect(formatearNumero(9.4, 'alturaM')).toBe('9.4')
    expect(formatearNumero(12, 'alturaM')).toBe('12.0')
  })

  it('agrupa los miles con espacio fino desde 4 dígitos', () => {
    expect(formatearNumero(999, 'co2AlmacenadoKg')).toBe('999')
    expect(formatearNumero(3751.3, 'co2CapturaAnualKg')).toBe(`${miles('3', '751')}.3`)
    expect(formatearNumero(125042, 'co2AlmacenadoKg')).toBe(miles('125', '042'))
    expect(formatearNumero(8673505, 'utmM')).toBe(miles('8', '673', '505'))
  })

  it('redondea sin decimales y recorta el .0 del DAP', () => {
    expect(formatearNumero(75185.3, 'co2AlmacenadoKg')).toBe(miles('75', '185'))
    expect(formatearNumero(310, 'dapCm')).toBe('310')
    expect(formatearNumero(310.5, 'dapCm')).toBe('310.5')
  })

  it('mantiene los 6 decimales de las coordenadas y el signo', () => {
    expect(formatearNumero(-11.993413, 'grados')).toBe('-11.993413')
    expect(formatearNumero(-76.8, 'grados')).toBe('-76.800000')
  })
})

describe('formatearMedida', () => {
  it('agrega la unidad de la magnitud', () => {
    expect(formatearMedida(9.4, 'alturaM')).toBe('9.4 m')
    expect(formatearMedida(310, 'dapCm')).toBe('310 cm')
    expect(formatearMedida(75185.3, 'co2AlmacenadoKg')).toBe(`${miles('75', '185')} kg CO₂e`)
    expect(formatearMedida(1503.7, 'co2CapturaAnualKg')).toBe(`${miles('1', '503')}.7 kg/año`)
  })

  it('no agrega espacio si la magnitud no tiene unidad', () => {
    expect(formatearMedida(299501, 'utmM')).toBe(miles('299', '501'))
  })

  it('devuelve null si no hay dato', () => {
    expect(formatearMedida(null, 'dapCm')).toBeNull()
  })
})
