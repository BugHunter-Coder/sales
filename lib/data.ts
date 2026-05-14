import { SalesRepData, PipelineStage, ActivityMetrics, Deal } from './types';

export const salesRepData: SalesRepData = {
  name: 'Alex Johnson',
  title: 'Sr. Account Executive',
  region: 'APAC',
  avatarInitials: 'AJ',
  yearlyTarget: 1_200_000,
  currentMonthIndex: 9,

  monthlyData: [
    { month: 'Jan', monthIndex: 0,  target: 80_000,  achieved: 72_500,  isProjected: false },
    { month: 'Feb', monthIndex: 1,  target: 85_000,  achieved: 91_200,  isProjected: false },
    { month: 'Mar', monthIndex: 2,  target: 95_000,  achieved: 88_400,  isProjected: false },
    { month: 'Apr', monthIndex: 3,  target: 90_000,  achieved: 101_500, isProjected: false },
    { month: 'May', monthIndex: 4,  target: 100_000, achieved: 97_800,  isProjected: false },
    { month: 'Jun', monthIndex: 5,  target: 110_000, achieved: 118_600, isProjected: false },
    { month: 'Jul', monthIndex: 6,  target: 105_000, achieved: 112_400, isProjected: false },
    { month: 'Aug', monthIndex: 7,  target: 110_000, achieved: 124_700, isProjected: false },
    { month: 'Sep', monthIndex: 8,  target: 115_000, achieved: 108_300, isProjected: false },
    { month: 'Oct', monthIndex: 9,  target: 115_000, achieved: 0,       isProjected: true  },
    { month: 'Nov', monthIndex: 10, target: 115_000, achieved: 0,       isProjected: true  },
    { month: 'Dec', monthIndex: 11, target: 120_000, achieved: 0,       isProjected: true  },
  ],

  quarters: [
    { quarter: 'Q1', months: [0, 1, 2], target: 260_000, achieved: 252_100, percentAchieved: Math.round((252_100 / 260_000) * 100) },
    { quarter: 'Q2', months: [3, 4, 5], target: 300_000, achieved: 317_900, percentAchieved: Math.round((317_900 / 300_000) * 100) },
    { quarter: 'Q3', months: [6, 7, 8], target: 330_000, achieved: 345_400, percentAchieved: Math.round((345_400 / 330_000) * 100) },
    { quarter: 'Q4', months: [9, 10, 11], target: 350_000, achieved: 0, percentAchieved: 0 },
  ],

  businessUnit: {
    unitName: 'APAC Enterprise',
    teamTarget:   5_800_000,
    teamAchieved: 4_420_000,
    headCount: 6,
    members: [
      { name: 'Sarah Chen',    target: 1_100_000, achieved: 921_000, isCurrentRep: false },
      { name: 'Alex Johnson',  target: 1_200_000, achieved: 915_400, isCurrentRep: true  },
      { name: 'Raj Patel',     target: 1_000_000, achieved: 887_000, isCurrentRep: false },
      { name: 'Mei Lin',       target:   900_000, achieved: 743_000, isCurrentRep: false },
      { name: "James O'Brien", target:   800_000, achieved: 612_000, isCurrentRep: false },
      { name: 'Priya Nair',    target:   800_000, achieved: 342_000, isCurrentRep: false },
    ],
  },
};

export const pipelineStages: PipelineStage[] = [
  { stage: 'Prospecting',    emoji: '🔍', deals: 24, value: 850_000, conversionPct: 100, color: '#3b82f6' },
  { stage: 'Qualification',  emoji: '✅', deals: 18, value: 620_000, conversionPct: 75,  color: '#6366f1' },
  { stage: 'Proposal Sent',  emoji: '📄', deals: 12, value: 480_000, conversionPct: 67,  color: '#8b5cf6' },
  { stage: 'Negotiation',    emoji: '🤝', deals:  7, value: 310_000, conversionPct: 58,  color: '#a855f7' },
  { stage: 'Closing',        emoji: '🏆', deals:  4, value: 185_000, conversionPct: 57,  color: '#22c55e' },
];

export const activityMetrics: ActivityMetrics = {
  callsMade:       147,
  callsTarget:     160,
  emailsSent:      312,
  emailsTarget:    300,
  meetingsHeld:     48,
  meetingsTarget:   50,
  proposalsSent:    23,
  proposalsTarget:  25,
  winRate:          68,
  avgDealSize:   42_000,
  salesCycleDays:   32,
};

export const recentDeals: Deal[] = [
  { id: 1, company: 'TechCorp Asia',       contact: 'Linda Chen',    value: 125_000, status: 'won',    stage: 'Closed Won',  daysAgo: 2,  industry: 'Technology'  },
  { id: 2, company: 'Global Finance Ltd',  contact: 'Robert Kim',    value:  89_000, status: 'won',    stage: 'Closed Won',  daysAgo: 5,  industry: 'Finance'     },
  { id: 3, company: 'Startup Hub SG',      contact: 'Maya Patel',    value:  45_000, status: 'lost',   stage: 'Closed Lost', daysAgo: 7,  industry: 'Startup'     },
  { id: 4, company: 'Meridian Banking',    contact: 'David Lim',     value: 210_000, status: 'won',    stage: 'Closed Won',  daysAgo: 12, industry: 'Banking'     },
  { id: 5, company: 'Pacific Retail',      contact: 'Sarah Wong',    value:  67_000, status: 'lost',   stage: 'Closed Lost', daysAgo: 14, industry: 'Retail'      },
  { id: 6, company: 'CloudBase Inc',       contact: 'John Park',     value: 155_000, status: 'won',    stage: 'Closed Won',  daysAgo: 18, industry: 'Cloud'       },
  { id: 7, company: 'FinTech Solutions',   contact: 'Amy Zhang',     value:  98_000, status: 'active', stage: 'Negotiation', daysAgo: 3,  industry: 'FinTech'     },
  { id: 8, company: 'DataSync Corp',       contact: 'Mark Nguyen',   value: 175_000, status: 'active', stage: 'Proposal',    daysAgo: 8,  industry: 'SaaS'        },
];
