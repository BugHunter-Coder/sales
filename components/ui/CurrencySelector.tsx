import { CurrencyCode } from '@/lib/types';
import { CURRENCY_OPTIONS } from '@/lib/currency';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as CurrencyCode)}
      className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-sm"
    >
      {CURRENCY_OPTIONS.map(opt => (
        <option key={opt.code} value={opt.code}>{opt.label}</option>
      ))}
    </select>
  );
}
