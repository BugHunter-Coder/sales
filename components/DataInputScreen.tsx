'use client';

import { useState } from 'react';
import {
  SalesRepData, ActivityMetrics, PipelineStage,
  MonthlyData, QuarterData, TeamMember, Project,
} from '@/lib/types';
import { pipelineStages as defaultPipeline } from '@/lib/data';

const MONTH_NAMES  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const QUARTER_NAMES = ['Q1','Q2','Q3','Q4'];
const Q_DEFS: Array<['Q1'|'Q2'|'Q3'|'Q4',[number,number,number]]> = [
  ['Q1',[0,1,2]], ['Q2',[3,4,5]], ['Q3',[6,7,8]], ['Q4',[9,10,11]],
];

type PeriodMode = 'monthly' | 'quarterly';

export interface AppData {
  repData: SalesRepData;
  activityMetrics: ActivityMetrics;
  pipelineStages: PipelineStage[];
  projects: Project[];
}

interface MemberInput {
  name: string;
  periodTargets: string[]; // 12 for monthly, 4 for quarterly
  achieved: string;
}

interface ProjectInput { name: string; cost: string }

interface FormState {
  // Step 1 — Team Target Allocation
  unitName: string;
  allocationMode: PeriodMode;
  members: MemberInput[];
  // Step 2 — Profile
  name: string;
  title: string;
  region: string;
  yearlyTarget: string;
  currentMonthIndex: number;
  // Step 3 — Performance
  performanceMode: PeriodMode;
  monthlyTargets: string[];
  monthlyAchieved: string[];
  quarterlyTargets: string[];
  quarterlyAchieved: string[];
  // Step 4 — Projects
  projects: ProjectInput[];
  // Step 5 — Activity
  callsMade: string; callsTarget: string;
  emailsSent: string; emailsTarget: string;
  meetingsHeld: string; meetingsTarget: string;
  proposalsSent: string; proposalsTarget: string;
  winRate: string; avgDealSize: string; salesCycleDays: string;
}

function blankMember(mode: PeriodMode): MemberInput {
  return { name: '', periodTargets: Array(mode === 'monthly' ? 12 : 4).fill(''), achieved: '' };
}

function makeDefault(): FormState {
  return {
    unitName: '', allocationMode: 'quarterly', members: [blankMember('quarterly')],
    name: '', title: '', region: '', yearlyTarget: '',
    currentMonthIndex: new Date().getMonth(),
    performanceMode: 'monthly',
    monthlyTargets: Array(12).fill(''), monthlyAchieved: Array(12).fill(''),
    quarterlyTargets: Array(4).fill(''), quarterlyAchieved: Array(4).fill(''),
    projects: [{ name: '', cost: '' }],
    callsMade: '', callsTarget: '',
    emailsSent: '', emailsTarget: '',
    meetingsHeld: '', meetingsTarget: '',
    proposalsSent: '', proposalsTarget: '',
    winRate: '', avgDealSize: '', salesCycleDays: '',
  };
}

// ── Shared field component ──────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
          error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Toggle button pair ──────────────────────────────────────────────────────
function ModeToggle({ value, onChange }: { value: PeriodMode; onChange: (v: PeriodMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {(['monthly', 'quarterly'] as PeriodMode[]).map(mode => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            value === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {mode === 'monthly' ? 'Monthly' : 'Quarterly'}
        </button>
      ))}
    </div>
  );
}

// ── Tiny table input ────────────────────────────────────────────────────────
function TInput({ value, onChange, error, width = 'w-full' }: {
  value: string; onChange: (v: string) => void; error?: boolean; width?: string;
}) {
  return (
    <input
      type="number" value={value} placeholder="0"
      onChange={e => onChange(e.target.value)}
      className={`${width} px-1.5 py-1 rounded border text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
      }`}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function DataInputScreen({ onSubmit }: { onSubmit: (data: AppData) => void }) {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState<FormState>(makeDefault());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (p: Partial<FormState>) => setForm(prev => ({ ...prev, ...p }));

  // ── member helpers ──────────────────────────────────────────────────────
  const setMemberName = (mi: number, v: string) =>
    setForm(prev => { const m = [...prev.members]; m[mi] = { ...m[mi], name: v }; return { ...prev, members: m }; });

  const setMemberAchieved = (mi: number, v: string) =>
    setForm(prev => { const m = [...prev.members]; m[mi] = { ...m[mi], achieved: v }; return { ...prev, members: m }; });

  const setMemberPeriod = (mi: number, pi: number, v: string) =>
    setForm(prev => {
      const m = [...prev.members];
      const pts = [...m[mi].periodTargets]; pts[pi] = v;
      m[mi] = { ...m[mi], periodTargets: pts };
      return { ...prev, members: m };
    });

  const switchAllocationMode = (mode: PeriodMode) =>
    setForm(prev => ({
      ...prev, allocationMode: mode,
      members: prev.members.map(m => ({ ...m, periodTargets: Array(mode === 'monthly' ? 12 : 4).fill('') })),
    }));

  // ── performance helpers ──────────────────────────────────────────────────
  const setMT = (i: number, v: string) =>
    setForm(prev => { const t = [...prev.monthlyTargets]; t[i] = v; return { ...prev, monthlyTargets: t }; });
  const setMA = (i: number, v: string) =>
    setForm(prev => { const a = [...prev.monthlyAchieved]; a[i] = v; return { ...prev, monthlyAchieved: a }; });
  const setQT = (i: number, v: string) =>
    setForm(prev => { const t = [...prev.quarterlyTargets]; t[i] = v; return { ...prev, quarterlyTargets: t }; });
  const setQA = (i: number, v: string) =>
    setForm(prev => { const a = [...prev.quarterlyAchieved]; a[i] = v; return { ...prev, quarterlyAchieved: a }; });

  // ── project helpers ──────────────────────────────────────────────────────
  const setProjName = (i: number, v: string) =>
    setForm(prev => { const p = [...prev.projects]; p[i] = { ...p[i], name: v }; return { ...prev, projects: p }; });
  const setProjCost = (i: number, v: string) =>
    setForm(prev => { const p = [...prev.projects]; p[i] = { ...p[i], cost: v }; return { ...prev, projects: p }; });

  // ── validation ───────────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.unitName.trim()) e.unitName = 'Required';
    if (!form.members.some(m => m.name.trim())) e.members = 'Add at least one team member';
    setErrors(e); return !Object.keys(e).length;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name   = 'Required';
    if (!form.title.trim())  e.title  = 'Required';
    if (!form.region.trim()) e.region = 'Required';
    const yt = parseFloat(form.yearlyTarget);
    if (!form.yearlyTarget || isNaN(yt) || yt <= 0) e.yearlyTarget = 'Enter a valid amount';
    setErrors(e); return !Object.keys(e).length;
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    const cm = form.currentMonthIndex;
    const cq = Math.floor(cm / 3);
    if (form.performanceMode === 'monthly') {
      form.monthlyTargets.forEach((t, i) => { if (!t || isNaN(parseFloat(t))) e[`mt${i}`] = 'req'; });
      for (let i = 0; i < cm; i++) {
        if (form.monthlyAchieved[i] === '' || isNaN(parseFloat(form.monthlyAchieved[i]))) e[`ma${i}`] = 'req';
      }
    } else {
      form.quarterlyTargets.forEach((t, i) => { if (!t || isNaN(parseFloat(t))) e[`qt${i}`] = 'req'; });
      for (let i = 0; i < cq; i++) {
        if (form.quarterlyAchieved[i] === '' || isNaN(parseFloat(form.quarterlyAchieved[i]))) e[`qa${i}`] = 'req';
      }
    }
    setErrors(e); return !Object.keys(e).length;
  }

  function validateStep4(): boolean {
    const e: Record<string, string> = {};
    form.projects.forEach((p, i) => {
      if (p.name.trim() && (!p.cost || isNaN(parseFloat(p.cost)))) e[`pc${i}`] = 'Enter a cost';
    });
    setErrors(e); return !Object.keys(e).length;
  }

  function validateStep5(): boolean {
    const e: Record<string, string> = {};
    const keys: (keyof FormState)[] = [
      'callsMade','callsTarget','emailsSent','emailsTarget',
      'meetingsHeld','meetingsTarget','proposalsSent','proposalsTarget',
      'winRate','avgDealSize','salesCycleDays',
    ];
    keys.forEach(k => { const v = form[k] as string; if (!v || isNaN(parseFloat(v))) e[k] = 'Required'; });
    setErrors(e); return !Object.keys(e).length;
  }

  function handleNext() {
    const validators = [null, validateStep1, validateStep2, validateStep4];
    const ok = validators[step]?.();
    if (ok) { setErrors({}); setStep(s => s + 1); }
  }
  function handleBack() { setErrors({}); setStep(s => s - 1); }

  // ── build & submit ───────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validateStep5()) return;

    const cm = form.currentMonthIndex;

    const monthlyTarget = (parseFloat(form.yearlyTarget) || 0) / 12;
    const monthlyData: MonthlyData[] = MONTH_NAMES.map((month, i) => ({
      month, monthIndex: i,
      target: monthlyTarget,
      achieved: 0,
      isProjected: i >= cm,
    }));

    const quarters: QuarterData[] = Q_DEFS.map(([q, months]) => {
      const target   = months.reduce((s, mi) => s + monthlyData[mi].target, 0);
      const achieved = months.reduce((s, mi) => s + monthlyData[mi].achieved, 0);
      return { quarter: q, months, target, achieved, percentAchieved: target > 0 ? Math.round((achieved / target) * 100) : 0 };
    });

    const members: TeamMember[] = form.members.filter(m => m.name.trim()).map(m => ({
      name: m.name,
      target:   m.periodTargets.reduce((s, t) => s + (parseFloat(t) || 0), 0),
      achieved: parseFloat(m.achieved) || 0,
      isCurrentRep: m.name.trim().toLowerCase() === form.name.trim().toLowerCase(),
    }));

    const initials = form.name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);

    const repData: SalesRepData = {
      name: form.name, title: form.title, region: form.region,
      avatarInitials: initials,
      yearlyTarget: parseFloat(form.yearlyTarget) || 0,
      currentMonthIndex: cm, monthlyData, quarters,
      businessUnit: {
        unitName: form.unitName,
        teamTarget:   members.reduce((s, m) => s + m.target, 0),
        teamAchieved: members.reduce((s, m) => s + m.achieved, 0),
        headCount: members.length, members,
      },
    };

    const activityMetrics: ActivityMetrics = {
      callsMade:       parseInt(form.callsMade)       || 0,
      callsTarget:     parseInt(form.callsTarget)     || 0,
      emailsSent:      parseInt(form.emailsSent)      || 0,
      emailsTarget:    parseInt(form.emailsTarget)    || 0,
      meetingsHeld:    parseInt(form.meetingsHeld)    || 0,
      meetingsTarget:  parseInt(form.meetingsTarget)  || 0,
      proposalsSent:   parseInt(form.proposalsSent)   || 0,
      proposalsTarget: parseInt(form.proposalsTarget) || 0,
      winRate:         parseFloat(form.winRate)        || 0,
      avgDealSize:     parseFloat(form.avgDealSize)    || 0,
      salesCycleDays:  parseInt(form.salesCycleDays)   || 0,
    };

    const projects: Project[] = form.projects
      .filter(p => p.name.trim())
      .map(p => ({ name: p.name, cost: parseFloat(p.cost) || 0 }));

    onSubmit({ repData, activityMetrics, pipelineStages: defaultPipeline, projects });
  }

  // ── step indicator ───────────────────────────────────────────────────────
  const STEP_LABELS = ['Team Targets','Your Profile','Projects','Activity'];
  const TOTAL = STEP_LABELS.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-13 h-13 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard Setup</h1>
          <p className="text-sm text-gray-500 mt-1">All fields are required — enter your data to get started</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-start justify-center mb-7">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center" style={{ width: 72 }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i + 1 < step  ? 'bg-blue-600 text-white'
                  : i + 1 === step ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                  {i + 1 < step
                    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : i + 1}
                </div>
                <span className={`mt-1 text-center leading-tight text-[10px] font-medium hidden sm:block ${
                  i + 1 === step ? 'text-blue-600' : i + 1 < step ? 'text-blue-400' : 'text-gray-400'
                }`}>{label}</span>
              </div>
              {i < TOTAL - 1 && (
                <div className={`h-0.5 mb-4 transition-colors ${i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'}`}
                  style={{ width: 20 }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-8 pt-7 pb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
              Step {step} of {TOTAL} — {STEP_LABELS[step - 1]}
            </p>

            {/* ── Step 1: Team Target Allocation ── */}
            {step === 1 && (
              <div className="space-y-5">
                <Field label="Business Unit / Team Name" value={form.unitName}
                  onChange={v => patch({ unitName: v })} placeholder="e.g. APAC Enterprise" error={errors.unitName} />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Allocation Period</p>
                    <p className="text-xs text-gray-400 mt-0.5">Set targets per member per month or per quarter</p>
                  </div>
                  <ModeToggle value={form.allocationMode} onChange={switchAllocationMode} />
                </div>

                {errors.members && <p className="text-xs text-red-600">{errors.members}</p>}

                {/* Member matrix table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="sticky left-0 z-10 bg-gray-50 text-left px-3 py-2.5 font-semibold text-gray-500 min-w-[130px] border-r border-gray-200">
                          Member Name
                        </th>
                        {form.allocationMode === 'monthly'
                          ? MONTH_NAMES.map(m => (
                              <th key={m} className="px-1.5 py-2.5 font-semibold text-gray-500 text-center min-w-[58px]">{m}</th>
                            ))
                          : QUARTER_NAMES.map(q => (
                              <th key={q} className="px-2 py-2.5 font-semibold text-gray-500 text-center min-w-[80px]">{q} Target</th>
                            ))
                        }
                        <th className="px-2 py-2.5 font-semibold text-gray-500 text-center min-w-[90px] border-l border-gray-100">YTD Achieved</th>
                        <th className="px-2 py-2.5 font-semibold text-gray-500 text-center min-w-[80px]">Annual Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.members.map((member, mi) => {
                        const annual = member.periodTargets.reduce((s, t) => s + (parseFloat(t) || 0), 0);
                        return (
                          <tr key={mi} className="border-b border-gray-100 last:border-0">
                            <td className="sticky left-0 z-10 bg-white px-3 py-2 border-r border-gray-100">
                              <input
                                type="text" value={member.name} placeholder="Full name"
                                onChange={e => setMemberName(mi, e.target.value)}
                                className="w-full px-2 py-1 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                              />
                            </td>
                            {member.periodTargets.map((t, pi) => (
                              <td key={pi} className="px-1.5 py-2">
                                <TInput value={t} onChange={v => setMemberPeriod(mi, pi, v)} />
                              </td>
                            ))}
                            <td className="px-2 py-2 border-l border-gray-100">
                              <TInput value={member.achieved} onChange={v => setMemberAchieved(mi, v)} />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-semibold ${annual > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                {annual > 0
                                  ? annual >= 1_000_000 ? `$${(annual/1_000_000).toFixed(1)}M`
                                    : annual >= 1000 ? `$${(annual/1000).toFixed(0)}k`
                                    : `$${annual.toFixed(0)}`
                                  : '—'}
                              </span>
                            </td>
                            <td className="px-1 py-2 text-right">
                              {form.members.length > 1 && (
                                <button
                                  onClick={() => setForm(prev => ({ ...prev, members: prev.members.filter((_, idx) => idx !== mi) }))}
                                  className="text-gray-300 hover:text-red-400 transition-colors p-1"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => setForm(prev => ({ ...prev, members: [...prev.members, blankMember(prev.allocationMode)] }))}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add team member
                </button>
              </div>
            )}

            {/* ── Step 2: Profile ── */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Full Name" value={form.name} onChange={v => patch({ name: v })}
                    placeholder="e.g. Alex Johnson" error={errors.name} />
                </div>
                <Field label="Job Title" value={form.title} onChange={v => patch({ title: v })}
                  placeholder="e.g. Sr. Account Executive" error={errors.title} />
                <Field label="Region / Territory" value={form.region} onChange={v => patch({ region: v })}
                  placeholder="e.g. APAC" error={errors.region} />
                <Field label="Annual Target (USD)" value={form.yearlyTarget} onChange={v => patch({ yearlyTarget: v })}
                  type="number" placeholder="e.g. 1200000" error={errors.yearlyTarget} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Month</label>
                  <select
                    value={form.currentMonthIndex}
                    onChange={e => patch({ currentMonthIndex: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 3: Projects ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Add the projects you are working on with their cost. You can add as many as needed — this step is optional.
                </p>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Project Name</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 w-48">Project Cost (USD)</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.projects.map((proj, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2">
                            <input
                              type="text" value={proj.name} placeholder="e.g. CRM Rollout — Q4"
                              onChange={e => setProjName(i, e.target.value)}
                              className="w-full px-2 py-1 rounded border border-gray-200 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number" value={proj.cost} placeholder="0"
                              onChange={e => setProjCost(i, e.target.value)}
                              className={`w-full px-2 py-1 rounded border text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 ${
                                errors[`pc${i}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            />
                            {errors[`pc${i}`] && <p className="text-[10px] text-red-500 mt-0.5">{errors[`pc${i}`]}</p>}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {form.projects.length > 1 && (
                              <button
                                onClick={() => setForm(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))}
                                className="text-gray-300 hover:text-red-400 transition-colors p-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => setForm(prev => ({ ...prev, projects: [...prev.projects, { name: '', cost: '' }] }))}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add project
                </button>
              </div>
            )}

            {/* ── Step 4: Activity ── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Monthly Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Calls Made"       value={form.callsMade}       onChange={v => patch({ callsMade: v })}       type="number" placeholder="0" error={errors.callsMade} />
                    <Field label="Calls Target"     value={form.callsTarget}     onChange={v => patch({ callsTarget: v })}     type="number" placeholder="0" error={errors.callsTarget} />
                    <Field label="Emails Sent"      value={form.emailsSent}      onChange={v => patch({ emailsSent: v })}      type="number" placeholder="0" error={errors.emailsSent} />
                    <Field label="Emails Target"    value={form.emailsTarget}    onChange={v => patch({ emailsTarget: v })}    type="number" placeholder="0" error={errors.emailsTarget} />
                    <Field label="Meetings Held"    value={form.meetingsHeld}    onChange={v => patch({ meetingsHeld: v })}    type="number" placeholder="0" error={errors.meetingsHeld} />
                    <Field label="Meetings Target"  value={form.meetingsTarget}  onChange={v => patch({ meetingsTarget: v })}  type="number" placeholder="0" error={errors.meetingsTarget} />
                    <Field label="Proposals Sent"   value={form.proposalsSent}   onChange={v => patch({ proposalsSent: v })}   type="number" placeholder="0" error={errors.proposalsSent} />
                    <Field label="Proposals Target" value={form.proposalsTarget} onChange={v => patch({ proposalsTarget: v })} type="number" placeholder="0" error={errors.proposalsTarget} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Performance KPIs</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Win Rate (%)"        value={form.winRate}        onChange={v => patch({ winRate: v })}        type="number" placeholder="0"  error={errors.winRate} />
                    <Field label="Avg Deal Size (USD)" value={form.avgDealSize}    onChange={v => patch({ avgDealSize: v })}    type="number" placeholder="0"  error={errors.avgDealSize} />
                    <Field label="Sales Cycle (days)"  value={form.salesCycleDays} onChange={v => patch({ salesCycleDays: v })} type="number" placeholder="0"  error={errors.salesCycleDays} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`px-8 py-5 border-t border-gray-100 flex ${step > 1 ? 'justify-between' : 'justify-end'} items-center`}>
            {step > 1 && (
              <button onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            {step < TOTAL ? (
              <button onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm flex items-center gap-1.5">
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm flex items-center gap-1.5">
                View Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Data is stored locally in your browser and never sent anywhere.
        </p>
      </div>
    </div>
  );
}
