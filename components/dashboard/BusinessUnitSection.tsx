'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Users } from 'lucide-react';
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

export default function BusinessUnitSection({ rep, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const bu = rep.businessUnit;
  const teamPct = Math.round((bu.teamAchieved / bu.teamTarget) * 100);

  const chartData = bu.members.map(m => ({
    name: m.name.split(' ')[0],
    fullName: m.name,
    target: m.target,
    achieved: m.achieved,
    isCurrentRep: m.isCurrentRep,
  }));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader title="Business Unit — APAC Enterprise" subtitle={`${bu.headCount} team members`} icon={Users} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
          {[
            { label: 'Team Target',   value: formatCompact(bu.teamTarget,   currency) },
            { label: 'Team Achieved', value: formatCompact(bu.teamAchieved, currency) },
            { label: '% Achievement', value: `${teamPct}%` },
            { label: 'Head Count',    value: `${bu.headCount} reps` },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              className="card-sm"
            >
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{item.label}</p>
            </motion.div>
          ))}

          <div className="col-span-2 card-sm">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Team Progress</span>
              <span className="font-medium text-gray-700">{teamPct}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-brand-500"
                initial={{ width: 0 }}
                animate={inView ? { width: `${Math.min(100, teamPct)}%` } : {}}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Target vs Achieved by Rep</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid {...CHART_STYLE.cartesianGrid} horizontal={false} />
              <XAxis type="number" tickFormatter={v => formatCompact(v, currency)} {...CHART_STYLE.axis} />
              <YAxis type="category" dataKey="name" width={52} {...CHART_STYLE.axis} />
              <Tooltip
                {...CHART_STYLE.tooltip}
                formatter={(value, name) => [formatCurrency(Number(value), currency), name === 'target' ? 'Target' : 'Achieved']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
              />
              <Legend formatter={v => v === 'target' ? 'Target' : 'Achieved'} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Bar dataKey="target" name="target" fill="#e5e7eb" radius={[0, 3, 3, 0]} barSize={8} isAnimationActive animationDuration={1000} animationBegin={400} />
              <Bar dataKey="achieved" name="achieved" radius={[0, 3, 3, 0]} barSize={8} isAnimationActive animationDuration={1000} animationBegin={600}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isCurrentRep ? '#3b82f6' : '#9ca3af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
