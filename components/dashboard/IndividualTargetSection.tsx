'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { User } from 'lucide-react';
import { clsx } from 'clsx';
import { SalesRepData, CurrencyCode } from '@/lib/types';
import { formatCurrency, formatCompact } from '@/lib/currency';
import SectionHeader from '@/components/ui/SectionHeader';
import TabGroup from '@/components/ui/TabGroup';
import ProgressRing from '@/components/ui/ProgressRing';

interface Props {
  rep: SalesRepData;
  currency: CurrencyCode;
}

const TABS = ['Q1', 'Q2', 'Q3', 'Q4', 'Yearly'];

const CHART_STYLE = {
  cartesianGrid: { strokeDasharray: '3 3', stroke: '#e5e7eb' },
  axis: { tick: { fill: '#6b7280', fontSize: 11 }, axisLine: { stroke: '#d1d5db' }, tickLine: false },
  tooltip: { contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' } },
};

function statusBadge(pct: number, isCompleted: boolean) {
  if (!isCompleted && pct === 0) return { label: 'Upcoming', cls: 'bg-gray-100 text-gray-500' };
  if (pct >= 100) return { label: 'Exceeded', cls: 'bg-green-50 text-green-600' };
  if (pct >= 80)  return { label: 'On Track',  cls: 'bg-blue-50 text-blue-600' };
  if (pct >= 60)  return { label: 'At Risk',   cls: 'bg-yellow-50 text-yellow-600' };
  return { label: 'Behind', cls: 'bg-red-50 text-red-500' };
}

export default function IndividualTargetSection({ rep, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [activeTab, setActiveTab] = useState('Q1');

  const yearlyAchieved = rep.monthlyData.filter(m => !m.isProjected).reduce((s, m) => s + m.achieved, 0);
  const yearlyPct = Math.round((yearlyAchieved / rep.yearlyTarget) * 100);

  const quarterlyChartData = rep.quarters.map(q => ({
    name: q.quarter,
    target: q.target,
    achieved: q.achieved,
  }));

  const renderQuarterView = () => {
    const q = rep.quarters.find(q => q.quarter === activeTab);
    if (!q) return null;

    const isCompleted = q.months[2] < rep.currentMonthIndex;
    const isInProgress = !isCompleted && q.months[0] <= rep.currentMonthIndex;
    const badge = statusBadge(q.percentAchieved, isCompleted);

    const monthCards = q.months.map(mIdx => rep.monthlyData[mIdx]);
    const monthChartData = monthCards.map(m => ({
      name: m.month,
      target: m.target,
      achieved: m.achieved,
      isProjected: m.isProjected,
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-4">
            <ProgressRing
              percentage={q.percentAchieved}
              size={100}
              strokeWidth={10}
              color={q.percentAchieved >= 100 ? '#16a34a' : '#3b82f6'}
              label={activeTab}
            />
            <div className="space-y-2">
              <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', badge.cls)}>{badge.label}</span>
              {isInProgress && <p className="text-xs text-gray-400">In Progress</p>}
              {isCompleted && <p className="text-xs text-gray-400">Completed</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="card-sm">
              <p className="text-lg font-bold text-gray-900">{formatCompact(q.target, currency)}</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">Quarter Target</p>
            </div>
            <div className="card-sm">
              <p className="text-lg font-bold text-gray-900">
                {q.achieved > 0 ? formatCompact(q.achieved, currency) : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">Achieved</p>
            </div>
          </div>
          <div className="card-sm">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Quarter Progress</span>
              <span className="text-gray-700 font-medium">{q.percentAchieved}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, q.percentAchieved)}%`,
                  backgroundColor: q.percentAchieved >= 100 ? '#16a34a' : '#3b82f6',
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Monthly Breakdown — {activeTab}</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthChartData}>
              <CartesianGrid {...CHART_STYLE.cartesianGrid} />
              <XAxis dataKey="name" {...CHART_STYLE.axis} />
              <YAxis tickFormatter={v => formatCompact(v, currency)} {...CHART_STYLE.axis} />
              <Tooltip
                {...CHART_STYLE.tooltip}
                formatter={(v, name) => [formatCurrency(Number(v), currency), String(name) === 'target' ? 'Target' : 'Achieved']}
              />
              <Legend formatter={v => v === 'target' ? 'Target' : 'Achieved'} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Bar dataKey="target"   name="target"   fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="achieved" name="achieved" fill="#3b82f6" radius={[4, 4, 0, 0]}
                   fillOpacity={monthChartData.some(d => d.isProjected) ? 0.4 : 1} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderYearlyView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center gap-4">
          <ProgressRing
            percentage={yearlyPct}
            size={100}
            strokeWidth={10}
            color={yearlyPct >= 100 ? '#16a34a' : '#3b82f6'}
            label="YTD"
          />
          <div>
            <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', statusBadge(yearlyPct, false).cls)}>
              {statusBadge(yearlyPct, false).label}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="card-sm">
            <p className="text-lg font-bold text-gray-900">{formatCompact(rep.yearlyTarget, currency)}</p>
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">Annual Target</p>
          </div>
          <div className="card-sm">
            <p className="text-lg font-bold text-gray-900">{formatCompact(yearlyAchieved, currency)}</p>
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">YTD Achieved</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Quarterly Performance</p>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={quarterlyChartData}>
            <CartesianGrid {...CHART_STYLE.cartesianGrid} />
            <XAxis dataKey="name" {...CHART_STYLE.axis} />
            <YAxis tickFormatter={v => formatCompact(v, currency)} {...CHART_STYLE.axis} />
            <Tooltip
              {...CHART_STYLE.tooltip}
              formatter={(v, name) => [formatCurrency(Number(v), currency), String(name) === 'target' ? 'Target' : 'Achieved']}
            />
            <Legend formatter={v => v === 'target' ? 'Target' : 'Achieved'} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
            <Bar dataKey="target"   name="target"   fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="achieved" name="achieved" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader
        title="Individual Targets"
        subtitle={`${rep.name} · FY 2024`}
        icon={User}
      >
        <TabGroup tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </SectionHeader>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'Yearly' ? renderYearlyView() : renderQuarterView()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
