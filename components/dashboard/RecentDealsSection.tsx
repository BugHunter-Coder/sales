'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { Deal, CurrencyCode } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import SectionHeader from '@/components/ui/SectionHeader';
import { clsx } from 'clsx';

interface Props {
  deals: Deal[];
  currency: CurrencyCode;
}

type Filter = 'all' | 'won' | 'lost' | 'active';

const STATUS_CONFIG = {
  won:    { icon: <CheckCircle2 size={14} />, label: 'Won',    cls: 'text-green-600 bg-green-50 border-green-200' },
  lost:   { icon: <XCircle size={14} />,      label: 'Lost',   cls: 'text-red-500 bg-red-50 border-red-200' },
  active: { icon: <Clock size={14} />,        label: 'Active', cls: 'text-blue-600 bg-blue-50 border-blue-200' },
};

export default function RecentDealsSection({ deals, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? deals : deals.filter(d => d.status === filter);

  const totalWon  = deals.filter(d => d.status === 'won').reduce((s, d) => s + d.value, 0);
  const totalLost = deals.filter(d => d.status === 'lost').reduce((s, d) => s + d.value, 0);
  const wonCount  = deals.filter(d => d.status === 'won').length;
  const lostCount = deals.filter(d => d.status === 'lost').length;

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',    label: `All (${deals.length})` },
    { key: 'won',    label: `Won (${wonCount})` },
    { key: 'active', label: `Active (${deals.filter(d => d.status === 'active').length})` },
    { key: 'lost',   label: `Lost (${lostCount})` },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader title="Recent Deals" subtitle="Last 30 days activity" icon={ClipboardList}>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                filter === f.key ? 'bg-white text-brand-600 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </SectionHeader>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Revenue Won',  value: formatCurrency(totalWon,  currency), icon: <TrendingUp  size={14} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Revenue Lost', value: formatCurrency(totalLost, currency), icon: <TrendingDown size={14} />, color: 'text-red-500',   bg: 'bg-red-50' },
          { label: 'Win Rate (30d)', value: `${Math.round((wonCount / (wonCount + lostCount)) * 100)}%`, icon: <CheckCircle2 size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className={clsx('rounded-lg p-3 flex items-center gap-3', item.bg)}
          >
            <span className={item.color}>{item.icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deal rows */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((deal, i) => {
            const cfg = STATUS_CONFIG[deal.status];
            return (
              <motion.div
                key={deal.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                transition={{ duration: 0.35, delay: inView ? i * 0.06 : 0, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 4, backgroundColor: '#f9fafb' }}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 cursor-default"
              >
                {/* Company avatar */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-blue-600" />
                </div>

                {/* Company + contact */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.company}</p>
                  <p className="text-xs text-gray-400 truncate">{deal.contact} · {deal.industry}</p>
                </div>

                {/* Stage */}
                <div className="hidden sm:block text-xs text-gray-400 w-24 truncate text-center">
                  {deal.stage}
                </div>

                {/* Value */}
                <div className="text-sm font-bold text-gray-800 w-20 text-right shrink-0">
                  {formatCurrency(deal.value, currency)}
                </div>

                {/* Status badge */}
                <div className={clsx('flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0', cfg.cls)}>
                  {cfg.icon}
                  {cfg.label}
                </div>

                {/* Days ago */}
                <div className="text-xs text-gray-400 w-12 text-right shrink-0">
                  {deal.daysAgo}d ago
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
