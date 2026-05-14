'use client';

import { useState, useEffect } from 'react';
import { CurrencyCode } from '@/lib/types';
import { recentDeals } from '@/lib/data';
import Header from '@/components/dashboard/Header';
import PerformanceSummary from '@/components/dashboard/PerformanceSummary';
import BusinessUnitSection from '@/components/dashboard/BusinessUnitSection';
import IndividualTargetSection from '@/components/dashboard/IndividualTargetSection';
import MonthlyBreakdownSection from '@/components/dashboard/MonthlyBreakdownSection';
import ForecastSection from '@/components/dashboard/ForecastSection';
import PipelineSection from '@/components/dashboard/PipelineSection';
import ActivitySection from '@/components/dashboard/ActivitySection';
import RecentDealsSection from '@/components/dashboard/RecentDealsSection';
import DataInputScreen, { AppData } from '@/components/DataInputScreen';

const STORAGE_KEY = 'sales-dashboard-data';

export default function Home() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setAppData(JSON.parse(saved)); } catch { /* ignore corrupt data */ }
    }
    setHydrated(true);
  }, []);

  function handleDataSubmit(data: AppData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAppData(data);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setAppData(null);
  }

  if (!hydrated) return null;

  if (!appData) {
    return <DataInputScreen onSubmit={handleDataSubmit} />;
  }

  const { repData, activityMetrics, pipelineStages } = appData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header rep={repData} currency={currency} onCurrencyChange={setCurrency} onReset={handleReset} />

      <main className="px-6 lg:px-10 py-8 space-y-6">
        <PerformanceSummary rep={repData} currency={currency} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PipelineSection stages={pipelineStages} currency={currency} />
          <ActivitySection metrics={activityMetrics} currency={currency} />
        </div>

        <BusinessUnitSection rep={repData} currency={currency} />
        <IndividualTargetSection rep={repData} currency={currency} />
        <MonthlyBreakdownSection rep={repData} currency={currency} />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <ForecastSection rep={repData} currency={currency} />
          </div>
          <div className="xl:col-span-3">
            <RecentDealsSection deals={recentDeals} currency={currency} />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200">
        Sales Dashboard · FY 2024 · {repData.region}
      </footer>
    </div>
  );
}
