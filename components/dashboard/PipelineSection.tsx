'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GitMerge } from 'lucide-react';
import { PipelineStage, CurrencyCode } from '@/lib/types';
import { formatCompact } from '@/lib/currency';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import SectionHeader from '@/components/ui/SectionHeader';

interface Props {
  stages: PipelineStage[];
  currency: CurrencyCode;
}

const totalDeals = (stages: PipelineStage[]) => stages[0].deals;

export default function PipelineSection({ stages, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const totalValue = stages.reduce((s, st) => s + st.value, 0);
  const maxDeals = stages[0].deals;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader
        title="Sales Pipeline"
        subtitle={`${totalDeals(stages)} active deals · ${formatCompact(totalValue, currency)} total pipeline`}
        icon={GitMerge}
      >
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-live-dot" />
          Live
        </div>
      </SectionHeader>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        {[
          { label: 'Total Pipeline', val: totalValue },
          { label: 'Closing This Quarter', val: stages[4].value },
          { label: 'Avg Deal Size', val: Math.round(totalValue / stages.map(s => s.deals).reduce((a, b) => a + b, 0)) },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <AnimatedNumber
              value={item.val}
              format={(n) => formatCompact(n, currency)}
              className="text-xl font-bold text-blue-700"
            />
            <p className="text-xs text-blue-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const widthPct = (stage.deals / maxDeals) * 100;
          return (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-base">{stage.emoji}</span>
                <span className="text-sm font-medium text-gray-700 w-32 shrink-0">{stage.stage}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${widthPct}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-lg flex items-center px-3 gap-2"
                    style={{ backgroundColor: stage.color + '22', borderLeft: `3px solid ${stage.color}` }}
                  >
                    <span className="text-xs font-bold whitespace-nowrap" style={{ color: stage.color }}>
                      {stage.deals} deals
                    </span>
                  </motion.div>
                </div>
                <div className="text-right shrink-0 w-24">
                  <AnimatedNumber
                    value={stage.value}
                    format={(n) => formatCompact(n, currency)}
                    className="text-sm font-semibold text-gray-800"
                  />
                  {i > 0 && (
                    <p className="text-xs text-gray-400">{stage.conversionPct}% conv.</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion summary */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-6 flex-wrap">
        {stages.slice(1).map((stage, i) => (
          <div key={stage.stage} className="flex items-center gap-2 text-xs text-gray-500">
            <span>{stages[i].stage}</span>
            <span className="text-gray-300">→</span>
            <span>{stage.stage}</span>
            <span className="font-semibold" style={{ color: stage.conversionPct >= 70 ? '#16a34a' : stage.conversionPct >= 55 ? '#d97706' : '#ef4444' }}>
              {stage.conversionPct}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
