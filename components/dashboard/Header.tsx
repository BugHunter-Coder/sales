import { MapPin, Briefcase, PencilLine } from 'lucide-react';
import { SalesRepData, CurrencyCode } from '@/lib/types';
import CurrencySelector from '@/components/ui/CurrencySelector';

interface HeaderProps {
  rep: SalesRepData;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onReset: () => void;
}

export default function Header({ rep, currency, onCurrencyChange, onReset }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            {rep.avatarInitials}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{rep.name}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1"><Briefcase size={11} />{rep.title}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{rep.region}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-gray-400">
            <p>Sales Dashboard</p>
            <p className="text-gray-300">FY 2024</p>
          </div>
          <CurrencySelector value={currency} onChange={onCurrencyChange} />
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
            title="Re-enter your data"
          >
            <PencilLine size={12} />
            Edit Data
          </button>
        </div>
      </div>
    </header>
  );
}
