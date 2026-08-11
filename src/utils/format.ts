import Decimal from 'decimal.js';

export function formatDecimal(
  value: string,
  decimals: number,
  compact: boolean,
  currency?: string,
): string {
  const numeric = new Decimal(value).toNumber();
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
  };
  try {
    return new Intl.NumberFormat(undefined, {
      ...options,
      ...(currency ? { style: 'currency', currency, currencyDisplay: 'code' } : {}),
    }).format(numeric);
  } catch {
    return `${currency ?? ''} ${new Intl.NumberFormat(undefined, options).format(numeric)}`.trim();
  }
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character: string) => character.toUpperCase());
}
