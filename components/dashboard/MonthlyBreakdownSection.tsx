'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { SalesRepData, CurrencyCode } from '@/lib/types';
import { formatCurrency, formatCompact } from '@/lib/currency';
import SectionHeader from '@/components/ui/SectionHeader';

interface Props {
  rep: SalesRepData;
  currency: CurrencyCode;
}

const CHART_STYLE = {
  cartesianGrid: { strokeDasharray: '3 3', stroke: '#e5e7eb' },
  axis: { tick: { fill: '#6b7280', fontSize: 11 }, axisLine: { stroke: '#d1d5db' }, tickLine: false },
  tooltip: { contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', color: '#111827' } },
};

export default function MonthlyBreakdownSection({ rep, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  let cumulative = 0;
  const chartData = rep.monthlyData.map(m => {
    if (!m.isProjected) cumulative += m.achieved;
    return {
      ...m,
      cumulative: m.isProjected ? null : cumulative,
    };
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader title="Monthly Breakdown" subtitle="Target vs Achieved — Jan to Dec 2024" icon={Calendar} />

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ right: 16 }}>
          <CartesianGrid {...CHART_STYLE.cartesianGrid} />
          <XAxis dataKey="month" {...CHART_STYLE.axis} />
          <YAxis
            yAxisId="bar"
            tickFormatter={v => formatCompact(v, currency)}
            {...CHART_STYLE.axis}
          />
          <YAxis
            yAxisId="line"
            orientation="right"
            tickFormatter={v => formatCompact(v, currency)}
            {...CHART_STYLE.axis}
          />
          <Tooltip
            {...CHART_STYLE.tooltip}
            formatter={(value, name) => {
              const n = Number(value);
              const labels: Record<string, string> = { target: 'Target', achieved: 'Achieved', cumulative: 'Cumulative YTD' };
              return [isNaN(n) ? '—' : formatCurrency(n, currency), labels[String(name)] ?? String(name)];
            }}
          />
          <Legend
            formatter={(v: string) => ({ target: 'Target', achieved: 'Achieved', cumulative: 'Cumulative YTD' }[v] ?? v)}
            wrapperStyle={{ fontSize: 11, color: '#6b7280' }}
          />
          <Bar yAxisId="bar" dataKey="target" name="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={18} />
          <Bar yAxisId="bar" dataKey="achieved" name="achieved" radius={[4, 4, 0, 0]} barSize={18}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill="#3b82f6" fillOpacity={entry.isProjected ? 0 : 1} />
            ))}
          </Bar>
          <Line
            yAxisId="line"
            type="monotone"
            dataKey="cumulative"
            name="cumulative"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {['Month', 'Target', 'Achieved', 'Achievement %', 'Variance', 'Status'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rep.monthlyData.map(m => {
              const pct = m.isProjected ? null : Math.round((m.achieved / m.target) * 100);
              const variance = m.isProjected ? null : m.achieved - m.target;

              let statusLabel = '—';
              let statusCls = 'text-gray-400';
              if (!m.isProjected && pct !== null) {
                if (pct >= 100) { statusLabel = 'Exceeded'; statusCls = 'text-green-600'; }
                else if (pct >= 85) { statusLabel = 'On Track'; statusCls = 'text-blue-600'; }
                else { statusLabel = 'Behind'; statusCls = 'text-red-500'; }
              }
              if (m.isProjected) { statusLabel = 'Upcoming'; statusCls = 'text-gray-400'; }

              return (
                <tr
                  key={m.monthIndex}
                  className={clsx(
                    'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    m.monthIndex === rep.currentMonthIndex && 'bg-blue-50/50',
                  )}
                >
                  <td className="py-2.5 px-3 font-medium text-gray-800">{m.month}</td>
                  <td className="py-2.5 px-3 text-gray-500">{formatCurrency(m.target, currency)}</td>
                  <td className="py-2.5 px-3 text-gray-800">{m.isProjected ? '—' : formatCurrency(m.achieved, currency)}</td>
                  <td className="py-2.5 px-3">
                    {pct !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: pct >= 100 ? '#16a34a' : pct >= 85 ? '#3b82f6' : '#ef4444' }}
                          />
                        </div>
                        <span className="text-gray-700">{pct}%</span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className={clsx('py-2.5 px-3', variance !== null && variance >= 0 ? 'text-green-600' : 'text-red-500')}>
                    {variance !== null ? `${variance >= 0 ? '+' : ''}${formatCurrency(variance, currency)}` : '—'}
                  </td>
                  <td className={clsx('py-2.5 px-3 text-xs font-medium', statusCls)}>{statusLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
