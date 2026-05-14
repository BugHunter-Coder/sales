import { CurrencyCode, CurrencyConfig } from './types';

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$',  locale: 'en-US', maximumFractionDigits: 0 },
  EUR: { code: 'EUR', symbol: '€',  locale: 'de-DE', maximumFractionDigits: 0 },
  GBP: { code: 'GBP', symbol: '£',  locale: 'en-GB', maximumFractionDigits: 0 },
  INR: { code: 'INR', symbol: '₹',  locale: 'en-IN', maximumFractionDigits: 0 },
};

const RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
};

export function convertAmount(usdAmount: number, toCurrency: CurrencyCode): number {
  return usdAmount * RATES[toCurrency];
}

export function formatCurrency(usdAmount: number, currency: CurrencyCode): string {
  const converted = convertAmount(usdAmount, currency);
  const cfg = CURRENCIES[currency];
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: cfg.maximumFractionDigits,
  }).format(converted);
}

export function formatCompact(usdAmount: number, currency: CurrencyCode): string {
  const converted = convertAmount(usdAmount, currency);
  const cfg = CURRENCIES[currency];
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(converted);
}

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' },
];
