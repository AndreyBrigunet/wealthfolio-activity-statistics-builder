import Decimal from 'decimal.js';

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export function parseDecimal(value: string | null | undefined): Decimal | null {
  if (value == null || value.trim() === '') return null;
  try {
    const decimal = new Decimal(value);
    return decimal.isFinite() ? decimal : null;
  } catch {
    return null;
  }
}

export function decimalToString(value: Decimal): string {
  return value.isZero() ? '0' : value.toFixed();
}
