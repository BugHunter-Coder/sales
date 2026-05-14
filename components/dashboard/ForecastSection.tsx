'use client';

import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { SalesRepData, CurrencyCode } from '@/lib/types';
import { formatCurrency, formatCompact } from '@/lib/currency';
import { computeForecast } from '@/lib/forecast';
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

export default function ForecastSection({ rep, currency }: Props) {
  const forecast = computeForecast(rep);

  const chartData = rep.monthlyData.map(m => {
    if (!m.isProjected) {
      return { name: m.month, actual: m.achieved, target: m.target, projected: null, isProjected: false };
    }
    return { name: m.month, actual: null, target: m.target, projected: forecast.currentRunRate, isProjected: true };
  });

  return (
    <div className="card">
      <SectionHeader
        title="Forecasting"
        subtitle={`Based on ${formatCompact(forecast.currentRunRate, currency)}/month run rate · ${forecast.monthsRemaining} months remaining`}
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Scenario cards */}
        <div className="lg:col-span-2 space-y-3">
          {forecast.scenarios.map(s => {
            const gap = s.projectedYearEnd - rep.yearlyTarget;
            return (
              <div
                key={s.label}
                className="card-sm flex items-start justify-between"
                style={{ borderColor: `${s.color}55` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-gray-800">{s.label}</span>
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      s.percentOfTarget >= 100 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600',
                    )}>
                      {s.percentOfTarget}% of target
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCompact(s.projectedYearEnd, currency)}</p>
                  <p className="text-xs text-gray-400 mt-1">Projected Year-End</p>
                  <p className={clsx('text-xs mt-1 font-medium', gap >= 0 ? 'text-green-600' : 'text-orange-600')}>
                    {gap >= 0 ? '+' : ''}{formatCompact(Math.abs(gap), currency)} vs target
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Multiplier</p>
                  <p className="text-sm font-medium text-gray-600">{s.multiplier}×</p>
                </div>
              </div>
            );
          })}

          <div className="card-sm bg-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">YTD Achieved</p>
            <p className="text-lg font-bold text-gray-900">{formatCompact(forecast.achievedToDate, currency)}</p>
            <p className="text-xs text-gray-500 mt-1">Monthly run rate: {formatCompact(forecast.currentRunRate, currency)}/mo</p>
          </div>
        </div>

        {/* Projection chart */}
        <div className="lg:col-span-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Actual vs Projected Performance</p>
          <ResponsiveContainer width="100%" height={310}>
            <ComposedChart data={chartData} margin={{ right: 16 }}>
              <CartesianGrid {...CHART_STYLE.cartesianGrid} />
              <XAxis dataKey="name" {...CHART_STYLE.axis} />
              <YAxis tickFormatter={v => formatCompact(v, currency)} {...CHART_STYLE.axis} />
              <Tooltip
                {...CHART_STYLE.tooltip}
                formatter={(value, name) => {
                  const n = Number(value);
                  const labels: Record<string, string> = { actual: 'Actual', projected: 'Projected (Realistic)', target: 'Target' };
                  return [isNaN(n) ? '—' : formatCurrency(n, currency), labels[String(name)] ?? String(name)];
                }}
              />
              <Legend
                formatter={(v: string) => ({ actual: 'Actual', projected: 'Projected', target: 'Target' }[v] ?? v)}
                wrapperStyle={{ fontSize: 11, color: '#6b7280' }}
              />

              <Bar dataKey="target" name="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="actual" name="actual" radius={[4, 4, 0, 0]} barSize={14}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill="#3b82f6" />
                ))}
              </Bar>
              <Bar dataKey="projected" name="projected" radius={[4, 4, 0, 0]} barSize={14} fill="#3b82f6" fillOpacity={0.35} />

              <ReferenceLine
                y={forecast.scenarios[0].projectedYearEnd / 12}
                stroke="#16a34a"
                strokeDasharray="5 3"
                label={{ value: 'Best', fill: '#16a34a', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={forecast.scenarios[1].projectedYearEnd / 12}
                stroke="#3b82f6"
                strokeDasharray="5 3"
                label={{ value: 'Realistic', fill: '#3b82f6', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={forecast.scenarios[2].projectedYearEnd / 12}
                stroke="#ea580c"
                strokeDasharray="5 3"
                label={{ value: 'Worst', fill: '#ea580c', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                x={rep.monthlyData[rep.currentMonthIndex - 1].month}
                stroke="#9ca3af"
                strokeDasharray="4 2"
                label={{ value: 'Today', fill: '#6b7280', fontSize: 10, position: 'top' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
