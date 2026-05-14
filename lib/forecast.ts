import { SalesRepData, ForecastResult, ForecastScenario } from './types';

export function computeForecast(data: SalesRepData): ForecastResult {
  const monthsElapsed = data.currentMonthIndex; // Jan–Sep = 9
  const achievedToDate = data.monthlyData
    .filter(m => !m.isProjected)
    .reduce((sum, m) => sum + m.achieved, 0);

  const monthlyRunRate = achievedToDate / monthsElapsed;
  const monthsRemaining = 12 - monthsElapsed;

  const scenarioDefs: { label: ForecastScenario['label']; multiplier: number; color: string }[] = [
    { label: 'Best Case',   multiplier: 1.25, color: '#22c55e' },
    { label: 'Realistic',   multiplier: 1.00, color: '#3b82f6' },
    { label: 'Worst Case',  multiplier: 0.75, color: '#f97316' },
  ];

  const scenarios: ForecastScenario[] = scenarioDefs.map(s => {
    const projectedYearEnd = achievedToDate + (monthlyRunRate * s.multiplier * monthsRemaining);
    return {
      ...s,
      projectedYearEnd,
      percentOfTarget: Math.round((projectedYearEnd / data.yearlyTarget) * 100),
    };
  });

  return { currentRunRate: monthlyRunRate, monthsRemaining, achievedToDate, scenarios };
}
