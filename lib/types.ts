export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  maximumFractionDigits: number;
}

export interface MonthlyData {
  month: string;
  monthIndex: number;
  target: number;
  achieved: number;
  isProjected: boolean;
}

export interface QuarterData {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  months: [number, number, number];
  target: number;
  achieved: number;
  percentAchieved: number;
}

export interface TeamMember {
  name: string;
  target: number;
  achieved: number;
  isCurrentRep: boolean;
}

export interface BusinessUnitData {
  unitName: string;
  teamTarget: number;
  teamAchieved: number;
  headCount: number;
  members: TeamMember[];
}

export interface SalesRepData {
  name: string;
  title: string;
  region: string;
  avatarInitials: string;
  yearlyTarget: number;
  currentMonthIndex: number;
  monthlyData: MonthlyData[];
  quarters: QuarterData[];
  businessUnit: BusinessUnitData;
}

export interface ForecastScenario {
  label: 'Best Case' | 'Realistic' | 'Worst Case';
  projectedYearEnd: number;
  percentOfTarget: number;
  color: string;
  multiplier: number;
}

export interface ForecastResult {
  currentRunRate: number;
  monthsRemaining: number;
  achievedToDate: number;
  scenarios: ForecastScenario[];
}

// — New feature types —

export interface PipelineStage {
  stage: string;
  emoji: string;
  deals: number;
  value: number;
  conversionPct: number; // vs. previous stage
  color: string;
}

export interface ActivityMetrics {
  callsMade: number;
  callsTarget: number;
  emailsSent: number;
  emailsTarget: number;
  meetingsHeld: number;
  meetingsTarget: number;
  proposalsSent: number;
  proposalsTarget: number;
  winRate: number;
  avgDealSize: number;
  salesCycleDays: number;
}

export interface Deal {
  id: number;
  company: string;
  contact: string;
  value: number;
  status: 'won' | 'lost' | 'active';
  stage: string;
  daysAgo: number;
  industry: string;
}

export interface Project {
  name: string;
  cost: number;
}
