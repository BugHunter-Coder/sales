'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Phone, Mail, Users, FileText, Trophy, Clock, Zap } from 'lucide-react';
import { ActivityMetrics, CurrencyCode } from '@/lib/types';
import { formatCompact } from '@/lib/currency';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import SectionHeader from '@/components/ui/SectionHeader';

interface Props {
  metrics: ActivityMetrics;
  currency: CurrencyCode;
}

interface ActivityRingProps {
  label: string;
  value: number;
  target: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
  inView: boolean;
}

function ActivityRing({ label, value, target, icon, color, delay, inView }: ActivityRingProps) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const exceeded = value > target;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: circumference - (pct / 100) * circumference } : {}}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">{icon}</div>
        <p className="text-xs font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">
          <AnimatedNumber value={value} format={n => String(n)} className="font-medium text-gray-700" />
          <span> / {target}</span>
        </p>
        {exceeded && (
          <span className="text-xs text-green-600 font-medium">↑ Exceeded</span>
        )}
      </div>
    </motion.div>
  );
}

export default function ActivitySection({ metrics, currency }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const activities = [
    { label: 'Calls Made',     value: metrics.callsMade,     target: metrics.callsTarget,     icon: <Phone size={12} />,     color: '#3b82f6', delay: 0.1 },
    { label: 'Emails Sent',    value: metrics.emailsSent,    target: metrics.emailsTarget,    icon: <Mail size={12} />,      color: '#22c55e', delay: 0.2 },
    { label: 'Meetings Held',  value: metrics.meetingsHeld,  target: metrics.meetingsTarget,  icon: <Users size={12} />,     color: '#8b5cf6', delay: 0.3 },
    { label: 'Proposals Sent', value: metrics.proposalsSent, target: metrics.proposalsTarget, icon: <FileText size={12} />,  color: '#f59e0b', delay: 0.4 },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <SectionHeader title="Activity Summary" subtitle="Oct 2024 · vs. monthly targets" icon={Activity} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity rings */}
        <div className="lg:col-span-1 flex justify-around items-start pt-2 flex-wrap gap-4">
          {activities.map(a => (
            <ActivityRing key={a.label} {...a} inView={inView} />
          ))}
        </div>

        {/* KPI metrics */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          {[
            {
              label: 'Win Rate',
              icon: <Trophy size={16} />,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
              border: 'border-yellow-100',
              render: () => (
                <>
                  <AnimatedNumber value={metrics.winRate} format={n => `${n}%`} className="text-3xl font-bold text-gray-900" />
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-yellow-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${metrics.winRate}%` } : {}}
                      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Industry avg: 52%</p>
                </>
              ),
            },
            {
              label: 'Avg Deal Size',
              icon: <Zap size={16} />,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              render: () => (
                <>
                  <AnimatedNumber
                    value={metrics.avgDealSize}
                    format={(n) => formatCompact(n, currency)}
                    className="text-3xl font-bold text-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-2">Per closed deal</p>
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <motion.div
                        key={i}
                        className="h-1 flex-1 rounded-full bg-blue-200"
                        initial={{ scaleX: 0 }}
                        animate={inView ? { scaleX: 1 } : {}}
                        transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                        style={{ transformOrigin: 'left' }}
                      />
                    ))}
                  </div>
                </>
              ),
            },
            {
              label: 'Sales Cycle',
              icon: <Clock size={16} />,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-100',
              render: () => (
                <>
                  <div className="flex items-end gap-1">
                    <AnimatedNumber value={metrics.salesCycleDays} format={n => String(n)} className="text-3xl font-bold text-gray-900" />
                    <span className="text-base text-gray-400 mb-0.5">days</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Avg to close</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${Math.round((metrics.salesCycleDays / 60) * 100)}%` } : {}}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-xs text-green-600 font-medium">↓ 8d faster</span>
                  </div>
                </>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
              className={`card-sm border ${item.border} ${item.bg} cursor-default`}
            >
              <div className={`flex items-center gap-2 mb-3 ${item.color}`}>
                {item.icon}
                <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
              </div>
              {item.render()}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
