'use client';
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { SalesRepData, CurrencyCode } from '@/lib/types';
import { formatCompact } from '@/lib/currency';
import StatCard from '@/components/ui/StatCard';

interface Props {
  rep: SalesRepData;
  currency: CurrencyCode;
}

export default function PerformanceSummary({ rep, currency }: Props) {
  const achieved = rep.monthlyData
    .filter(m => !m.isProjected)
    .reduce((s, m) => s + m.achieved, 0);

  const pct = Math.round((achieved / rep.yearlyTarget) * 100);
  const remaining = Math.max(0, rep.yearlyTarget - achieved);
  const deltaType = pct >= 80 ? 'up' : pct >= 60 ? 'neutral' : 'down';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Annual Target"
        value={formatCompact(rep.yearlyTarget, currency)}
        icon={Target}
        accentColor="text-brand-600"
        delay={0}
      />
      <StatCard
        label="YTD Achieved"
        value={formatCompact(achieved, currency)}
        subValue={`${rep.currentMonthIndex} months complete`}
        icon={CheckCircle}
        accentColor="text-green-600"
        delta={`${pct}% of target`}
        deltaType={deltaType}
        delay={0.08}
      />
      <StatCard
        label="% to Target"
        value={`${pct}%`}
        subValue={pct >= 100 ? 'Target exceeded!' : `${100 - pct}% remaining`}
        icon={TrendingUp}
        accentColor={pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'}
        delta={pct >= 100 ? 'Exceeded' : pct >= 75 ? 'On Track' : 'At Risk'}
        deltaType={pct >= 100 ? 'up' : pct >= 75 ? 'neutral' : 'down'}
        highlight={pct >= 100}
        delay={0.16}
      />
      <StatCard
        label="Remaining Target"
        value={formatCompact(remaining, currency)}
        subValue={`${12 - rep.currentMonthIndex} months left`}
        icon={AlertCircle}
        accentColor={remaining === 0 ? 'text-green-600' : 'text-yellow-600'}
        delay={0.24}
      />
    </div>
  );
}
