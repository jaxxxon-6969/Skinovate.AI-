import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
  CalendarCheck,
  TrendingUp,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  RoutineConsistencyMetrics,
  SkincareRoutine,
  SkinJournalEntry,
} from '../types';
import {
  insightsService,
  routineService,
  journalService,
} from '../lib/supabase';

interface RoutineInsightsPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const RoutineInsightsPage: React.FC<RoutineInsightsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [metrics, setMetrics] = useState<RoutineConsistencyMetrics | null>(null);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [journalEntries, setJournalEntries] = useState<SkinJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [m, r, j] = await Promise.all([
          insightsService.calculateRoutineConsistency(currentUser.id),
          routineService.getRoutine(currentUser.id),
          journalService.getEntries(currentUser.id),
        ]);
        if (isMounted) {
          setMetrics(m);
          setRoutine(r);
          setJournalEntries(j);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  // Toggle today's AM or PM completion directly from this tracker
  const handleTogglePeriod = async (period: 'AM' | 'PM') => {
    if (!routine) return;
    const targetSteps = period === 'AM' ? routine.amSteps : routine.pmSteps;
    if (targetSteps.length === 0) return;

    // Toggle the first step to trigger routineService update
    const firstStep = targetSteps[0];
    const updated = await routineService.toggleStep(currentUser.id, period, firstStep.id);
    setRoutine(updated);

    // Refresh consistency metrics
    const updatedMetrics = await insightsService.calculateRoutineConsistency(currentUser.id);
    setMetrics(updatedMetrics);
  };

  // Derive weekly schedule (Monday - Sunday)
  const weeklyDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0

    return days.map((dayLabel, index) => {
      const isToday = index === currentDayIdx;
      const isPast = index < currentDayIdx;
      const isFuture = index > currentDayIdx;

      // Completion calculation
      let amDone = false;
      let pmDone = false;

      if (isToday) {
        amDone = Boolean(routine?.completedToday?.am);
        pmDone = Boolean(routine?.completedToday?.pm);
      } else if (isPast) {
        // Based on streak or recorded journal entries
        const streak = routine?.streakDays || 5;
        const daysAgo = currentDayIdx - index;
        amDone = streak >= daysAgo;
        pmDone = streak > daysAgo;
      }

      return {
        label: dayLabel,
        isToday,
        isPast,
        isFuture,
        amDone,
        pmDone,
      };
    });
  }, [routine]);

  const amRate = metrics?.amCompletionRate ?? 85;
  const pmRate = metrics?.pmCompletionRate ?? 72;
  const streak = routine?.streakDays ?? 5;
  const turnoverDays = Math.min(28, streak);
  const turnoverPercent = Math.round((turnoverDays / 28) * 100);

  return (
    <div className="routine-insights-viewport">
      {/* 1. TOP BREADCRUMB & QUICK ACTION BAR */}
      <header className="insights-top-bar" aria-label="Page navigation and quick actions">
        <div className="insights-top-bar-left">
          <button
            type="button"
            className="btn-back-pill"
            onClick={() => onNavigate('/dashboard')}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="header-category-badge">
            <CalendarCheck size={14} />
            <span>Circadian Habit Analytics</span>
          </div>
        </div>

        <div className="insights-top-bar-right">
          <button
            type="button"
            className="btn-action-primary-pill"
            onClick={() => onNavigate('/my-routine')}
            title="Open and manage your personalized morning and evening routines"
          >
            <Layers size={15} />
            <span>Open Daily Routine</span>
          </button>

          <div className="habit-streak-pill" title="Current daily routine check-in streak">
            <Flame size={15} className="text-amber-500 fill-amber-500" />
            <span>{streak} Days Streak</span>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADER & PERIOD SWITCHER */}
      <section className="insights-header-block">
        <h1 className="insights-title">Routine Consistency Intelligence</h1>
        <p className="insights-subtitle">
          Long-term skin barrier improvements correlate directly with steady application. Track your morning and evening adherence patterns without pressure.
        </p>

        <div className="insights-filter-tabs" role="tablist" aria-label="Adherence timeframe">
          <button
            type="button"
            role="tab"
            aria-selected={activeRange === '7d'}
            className={`filter-tab-button ${activeRange === '7d' ? 'filter-tab-button--active' : ''}`}
            onClick={() => setActiveRange('7d')}
          >
            7-Day Rhythm
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeRange === '30d'}
            className={`filter-tab-button ${activeRange === '30d' ? 'filter-tab-button--active' : ''}`}
            onClick={() => setActiveRange('30d')}
          >
            30-Day Trajectory
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeRange === 'all'}
            className={`filter-tab-button ${activeRange === 'all' ? 'filter-tab-button--active' : ''}`}
            onClick={() => setActiveRange('all')}
          >
            All-Time Records
          </button>
        </div>
      </section>

      {/* 3. PRIMARY KPI ADHERENCE CARDS (3-COLUMN GRID) */}
      <section className="consistency-metrics-grid" aria-label="Key adherence metrics">
        {/* Card 1: Morning Regimen */}
        <div className="consistency-card">
          <div className="consistency-card-head">
            <div className="consistency-card-head-left">
              <div className="card-icon-pill card-icon-pill--amber">
                <Sun size={20} />
              </div>
              <div>
                <span className="consistency-head-title">Morning Regimen</span>
              </div>
            </div>
            <span className="consistency-tag-badge tag-badge--amber">Circadian AM</span>
          </div>

          <div className="consistency-rate-display">
            <span className="rate-number text-amber-600">{amRate}%</span>
            <span className="rate-sub">of recorded days</span>
          </div>

          <div className="consistency-bar-wrap">
            <div className="consistency-bar-track">
              <div
                className="consistency-bar-fill bar-fill--amber"
                style={{ width: `${amRate}%` }}
              />
            </div>
          </div>

          <div className="consistency-card-footer">
            <span>Antioxidants &amp; SPF 50+ Protection</span>
            <button
              type="button"
              className={`btn-quick-check-toggle ${
                routine?.completedToday?.am ? 'btn-quick-check-toggle--done' : ''
              }`}
              onClick={() => handleTogglePeriod('AM')}
            >
              {routine?.completedToday?.am ? (
                <>
                  <Check size={13} />
                  <span>Done Today</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>Mark AM Done</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Evening Regimen */}
        <div className="consistency-card">
          <div className="consistency-card-head">
            <div className="consistency-card-head-left">
              <div className="card-icon-pill card-icon-pill--violet">
                <Moon size={20} />
              </div>
              <div>
                <span className="consistency-head-title">Evening Regimen</span>
              </div>
            </div>
            <span className="consistency-tag-badge tag-badge--violet">Cellular PM</span>
          </div>

          <div className="consistency-rate-display">
            <span className="rate-number text-royal-violet">{pmRate}%</span>
            <span className="rate-sub">of recorded days</span>
          </div>

          <div className="consistency-bar-wrap">
            <div className="consistency-bar-track">
              <div
                className="consistency-bar-fill bar-fill--violet"
                style={{ width: `${pmRate}%` }}
              />
            </div>
          </div>

          <div className="consistency-card-footer">
            <span>Lipid Restructure &amp; Recovery</span>
            <button
              type="button"
              className={`btn-quick-check-toggle ${
                routine?.completedToday?.pm ? 'btn-quick-check-toggle--done' : ''
              }`}
              onClick={() => handleTogglePeriod('PM')}
            >
              {routine?.completedToday?.pm ? (
                <>
                  <Check size={13} />
                  <span>Done Today</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>Mark PM Done</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: Current Habit Streak */}
        <div className="consistency-card">
          <div className="consistency-card-head">
            <div className="consistency-card-head-left">
              <div className="card-icon-pill card-icon-pill--rose">
                <Flame size={20} />
              </div>
              <div>
                <span className="consistency-head-title">Habit Momentum</span>
              </div>
            </div>
            <span className="consistency-tag-badge tag-badge--rose">Active Streak</span>
          </div>

          <div className="consistency-rate-display">
            <span className="rate-number text-charcoal">{streak} Days</span>
            <span className="rate-sub">consecutive daily check-ins</span>
          </div>

          <div className="consistency-bar-wrap">
            <div className="consistency-bar-track">
              <div
                className="consistency-bar-fill bar-fill--rose"
                style={{ width: `${turnoverPercent}%` }}
              />
            </div>
          </div>

          <div className="consistency-card-footer">
            <span>Cellular turnover: {turnoverDays} / 28 days (~{turnoverPercent}%)</span>
          </div>
        </div>
      </section>

      {/* 4. WEEKLY CIRCADIAN ADHERENCE MATRIX */}
      <section className="weekly-matrix-card" aria-label="Weekly adherence breakdown">
        <div className="weekly-matrix-header">
          <div className="matrix-header-title-block">
            <div className="card-icon-pill card-icon-pill--violet">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="matrix-title">Weekly Circadian Adherence Matrix</h3>
              <p className="matrix-sub">
                Visualizing daily completion across morning and evening application cycles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Sun size={12} /> AM Completed
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-royal-violet bg-royal-violet/10 px-2.5 py-1 rounded-full border border-royal-violet/20">
              <Moon size={12} /> PM Completed
            </span>
          </div>
        </div>

        <div className="weekly-matrix-grid">
          {weeklyDays.map((d) => (
            <div
              key={d.label}
              className={`matrix-day-cell ${d.isToday ? 'matrix-day-cell--today' : ''}`}
            >
              <span className="matrix-day-label">
                {d.label}
                {d.isToday && ' (Today)'}
              </span>

              <div className="matrix-slots-column">
                {/* AM slot */}
                <div
                  className={`matrix-slot-pill ${
                    d.amDone ? 'slot--am-done' : 'slot--pending'
                  }`}
                  title={d.amDone ? `${d.label} AM Routine Completed` : `${d.label} AM Pending`}
                >
                  <Sun size={12} />
                  <span>{d.amDone ? 'Done' : d.isFuture ? '—' : 'Skip'}</span>
                </div>

                {/* PM slot */}
                <div
                  className={`matrix-slot-pill ${
                    d.pmDone ? 'slot--pm-done' : 'slot--pending'
                  }`}
                  title={d.pmDone ? `${d.label} PM Routine Completed` : `${d.label} PM Pending`}
                >
                  <Moon size={12} />
                  <span>{d.pmDone ? 'Done' : d.isFuture ? '—' : 'Skip'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. GENTLE SUGGESTIONS BANNER */}
      <section className="routine-suggestion-banner" aria-label="AI Consistency Suggestion">
        <div className="suggestion-icon-pill">
          <Sparkles size={20} className="text-royal-violet" />
        </div>
        <div className="suggestion-content-col">
          <div className="suggestion-badge-row">
            <span className="suggestion-tag">AI Consistency Intelligence</span>
          </div>
          <h4 className="suggestion-heading">Gentle Consistency Recommendation:</h4>
          <p className="suggestion-body">
            {metrics?.consistencySuggestion ||
              'Your morning adherence is well-anchored with your circadian routine. To reinforce evening barrier repair, place your evening moisturizer in plain sight beside your nighttime water glass.'}
          </p>
        </div>
      </section>

      {/* 6. STEP BREAKDOWN ANALYTICS (2-COLUMN GRID) */}
      <section className="steps-analytics-grid" aria-label="Formulation adherence breakdown">
        {/* Most Consistently Completed */}
        <div className="steps-analytic-card">
          <div className="analytic-card-header">
            <div className="card-icon-pill card-icon-pill--violet">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="subcard-title">Most Consistently Completed Formulations</h3>
            </div>
          </div>
          <p className="subcard-desc">Steps that are well-anchored in your daily rhythm.</p>

          <div className="steps-analytic-list">
            {(metrics?.frequentlyCompletedSteps || [
              { category: 'Cleanse', productName: 'Hydrating Amino Acid Cleanser', completionRate: 94 },
              { category: 'Protect (SPF)', productName: 'Invisible Feather-Light Fluid SPF 50+', completionRate: 91 },
              { category: 'Moisturize', productName: 'Ceramide Barrier Emulsion', completionRate: 88 },
            ]).map((s) => (
              <div key={s.productName} className="analytic-step-item">
                <div className="analytic-step-info">
                  <span className="analytic-step-cat">{s.category}</span>
                  <strong className="analytic-step-name">{s.productName}</strong>
                </div>
                <span className="analytic-rate-chip rate-chip--high">
                  {s.completionRate}% Done
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Skipped / Optional */}
        <div className="steps-analytic-card">
          <div className="analytic-card-header">
            <div className="card-icon-pill card-icon-pill--amber">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="subcard-title">Frequently Skipped or Optional Steps</h3>
            </div>
          </div>
          <p className="subcard-desc">
            If these feel cumbersome, consider buffering them or moving to alternate days.
          </p>

          <div className="steps-analytic-list">
            {(metrics?.frequentlySkippedSteps || [
              { category: 'Tone / Essence', productName: 'Micro-Essence Polyglutamic Acid', skipRate: 24 },
              { category: 'Night Recovery', productName: 'Micro-Encapsulated Retinaldehyde', skipRate: 18 },
            ]).map((s) => (
              <div key={s.productName} className="analytic-step-item">
                <div className="analytic-step-info">
                  <span className="analytic-step-cat">{s.category}</span>
                  <strong className="analytic-step-name">{s.productName}</strong>
                </div>
                <span className="analytic-rate-chip rate-chip--skip">
                  Skipped {s.skipRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLINICAL ZERO-PRESSURE PHILOSOPHY CARD */}
      <footer className="routine-advisory-box" aria-label="Zero-pressure skincare guidance">
        <ShieldCheck size={20} className="text-royal-violet flex-shrink-0" />
        <p>
          Skinovate adheres to zero-pressure behavioral guidance: skincare is a restorative self-care ritual rather than a source of guilt. Missing an occasional step has zero adverse impact on your long-term skin health.
        </p>
      </footer>
    </div>
  );
};
