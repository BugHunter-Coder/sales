'use client';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  accentColor?: string;
  highlight?: boolean;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  subValue,
  delta,
  deltaType = 'neutral',
  icon: Icon,
  accentColor = 'text-brand-600',
  highlight = false,
  delay = 0,
}: StatCardProps) {
  const DeltaIcon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      className={clsx(
        'card flex flex-col gap-3 cursor-default transition-shadow',
        highlight && 'animate-pulse-glow border-green-200',
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={clsx('p-2 rounded-lg bg-gray-100', accentColor)}>
            <Icon size={16} />
          </div>
        )}
        {delta && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            deltaType === 'up'      && 'bg-green-50 text-green-600',
            deltaType === 'down'    && 'bg-red-50 text-red-500',
            deltaType === 'neutral' && 'bg-gray-100 text-gray-500',
          )}>
            <DeltaIcon size={11} />
            {delta}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-0.5">{subValue}</p>}
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
      </div>
    </motion.div>
  );
}
