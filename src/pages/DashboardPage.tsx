import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanFace,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Search,
  X,
  Bell,
  Sliders,
  FlaskConical,
  ShoppingBag,
  TrendingUp,
  User,
  ShieldCheck,
  Award,
  Activity,
  Check,
  Flame,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import {
  UserProfile,
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareRoutine,
  SkinJournalEntry,
  UserNotification,
} from '../types';
import {
  skinProfileService,
  analysisService,
  routineService,
  journalService,
  notificationService,
} from '../lib/supabase';

interface DashboardPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onNavigate,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const [profile, setProfile] = useState<SkinProfileData | null>(null);
  const [analyses, setAnalyses] = useState<SkinAnalysisRecord[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [journalEntries, setJournalEntries] = useState<SkinJournalEntry[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Right panel active tab: 'overview' | 'activity'
  const [rightPanelTab, setRightPanelTab] = useState<'overview' | 'activity'>('overview');

  // Load real user records from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [profileData, analysisList, routineData, jList, nList] = await Promise.all([
          skinProfileService.getProfile(currentUser.id),
          analysisService.getAnalyses(currentUser.id),
          routineService.getRoutine(currentUser.id),
          journalService.getEntries(currentUser.id),
          notificationService.getNotifications(currentUser.id),
        ]);

        if (isMounted) {
          setProfile(profileData);
          setAnalyses(analysisList);
          setRoutine(routineData);
          setJournalEntries(jList);
          setNotifications(nList);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Search indexing and filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{ title: string; category: string; path: string }> = [];

    // Routine steps
    if (routine) {
      if (Array.isArray(routine.morning)) {
        routine.morning.forEach((step) => {
          if (
            step?.stepName?.toLowerCase().includes(q) ||
            step?.productName?.toLowerCase().includes(q) ||
            step?.category?.toLowerCase().includes(q)
          ) {
            results.push({
              title: `Morning: ${step.productName} (${step.stepName})`,
              category: 'Morning Routine',
              path: '/my-routine',
            });
          }
        });
      }
      if (Array.isArray(routine.evening)) {
        routine.evening.forEach((step) => {
          if (
            step?.stepName?.toLowerCase().includes(q) ||
            step?.productName?.toLowerCase().includes(q) ||
            step?.category?.toLowerCase().includes(q)
          ) {
            results.push({
              title: `Evening: ${step.productName} (${step.stepName})`,
              category: 'Evening Routine',
              path: '/my-routine',
            });
          }
        });
      }
    }

    // Curated ingredients index
    const ingredients = [
      { name: 'Hyaluronic Acid', desc: 'Hydration & lipid plumping' },
      { name: 'Niacinamide (Vitamin B3)', desc: 'Sebum balance & tone evening' },
      { name: 'Ceramides Complex (NP, AP, EOP)', desc: 'Skin barrier reconstruction' },
      { name: 'Azelaic Acid 10%', desc: 'Redness reduction & clarity' },
      { name: 'Centella Asiatica (Cica)', desc: 'Soothing & micro-inflammation recovery' },
      { name: 'Salicylic Acid (BHA)', desc: 'Pore clearing & blackhead control' },
      { name: 'Peptides & Copper Tripeptide-1', desc: 'Collagen firmness & elasticity' },
    ];

    ingredients.forEach((ing) => {
      if (ing.name.toLowerCase().includes(q) || ing.desc.toLowerCase().includes(q)) {
        results.push({
          title: ing.name,
          category: 'Active Ingredient',
          path: '/ingredients',
        });
      }
    });

    // Analyses
    if (Array.isArray(analyses)) {
      analyses.forEach((a) => {
        const summary = a?.skinConditionSummary || 'Biometric Skin Scan';
        if (
          summary.toLowerCase().includes(q) ||
          (Array.isArray(a?.primaryConcerns) && a.primaryConcerns.some((c) => c?.toLowerCase().includes(q)))
        ) {
          results.push({
            title: `Analysis: ${summary} (${new Date(a.createdAt).toLocaleDateString()})`,
            category: 'Analysis Record',
            path: `/analysis-results/${a.id}`,
          });
        }
      });
    }

    return results.slice(0, 5);
  }, [searchQuery, routine, analyses]);

  // Genuine Weekly Completion History (Mon - Sun)
  const weeklyDays = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    // Map each day to real journal/routine entries
    return days.map((dayLabel, index) => {
      const isPastOrToday = index <= currentDayIdx;
      // If user has streak days or journal entries
      const hasCompleted =
        routine &&
        isPastOrToday &&
        (index === currentDayIdx
          ? routine.completedToday?.am || routine.completedToday?.pm
          : (routine.streakDays || 0) > (currentDayIdx - index));

      return {
        day: dayLabel,
        isToday: index === currentDayIdx,
        isPast: isPastOrToday,
        completed: Boolean(hasCompleted),
      };
    });
  }, [routine]);

  // Derived user goals from profile or defaults
  const userGoals = useMemo(() => {
    if (profile?.primaryConcerns && profile.primaryConcerns.length > 0) {
      return profile.primaryConcerns.map((c) => {
        if (c.toLowerCase().includes('dry')) return 'Deep Cellular Hydration';
        if (c.toLowerCase().includes('tone') || c.toLowerCase().includes('pigment'))
          return 'More Even-Looking Skin Tone';
        if (c.toLowerCase().includes('pore') || c.toLowerCase().includes('oil'))
          return 'Pore Refinement & Oil Balance';
        if (c.toLowerCase().includes('sensitiv') || c.toLowerCase().includes('barrier'))
          return 'Barrier Health & Calming';
        if (c.toLowerCase().includes('aging') || c.toLowerCase().includes('fine lines'))
          return 'Smoother-Looking Texture';
        return c;
      });
    }
    return [
      'Deep Cellular Hydration',
      'More Even-Looking Skin Tone',
      'Pore Refinement & Oil Balance',
      'Smoother-Looking Texture',
    ];
  }, [profile]);

  // Recommended ingredients grounded in user's profile
  const recommendedIngredients = useMemo(() => {
    const skinType = profile?.skinType?.toLowerCase() || 'combination';
    const list = [
      {
        name: 'Hyaluronic Acid',
        type: 'Hydrator',
        desc: 'Multi-molecular weight hydration that draws moisture deep into the epidermis.',
        badge: 'Universal',
      },
      {
        name: 'Niacinamide (Vitamin B3)',
        type: 'Barrier & Tone',
        desc: 'Normalizes sebum secretion, refines pore structure, and reduces skin redness.',
        badge: skinType.includes('oil') || skinType.includes('comb') ? 'Recommended' : 'Optimal',
      },
      {
        name: 'Ceramides Complex',
        type: 'Lipid Shield',
        desc: 'Replaces essential intercellular lipids to lock in hydration and prevent TEWL.',
        badge: 'Barrier Core',
      },
      {
        name: 'Centella Asiatica (Cica)',
        type: 'Calming Agent',
        desc: 'Potent madecassoside extracts that soothe visible flushing and dermal irritation.',
        badge: 'Restorative',
      },
    ];
    return list;
  }, [profile]);

  // Activity feed items compiled from real database records
  const activityItems = useMemo(() => {
    const items: Array<{ id: string; title: string; time: string; icon: React.ReactNode }> = [];

    // Latest analysis
    if (latestAnalysis) {
      items.push({
        id: `analysis-${latestAnalysis.id}`,
        title: 'Biometric skin analysis completed',
        time: new Date(latestAnalysis.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        icon: <ScanFace size={14} className="text-royal-violet" />,
      });
    }

    // Routine updates
    if (routine) {
      if (routine.completedToday?.am) {
        items.push({
          id: 'routine-am-today',
          title: 'Morning skincare routine completed',
          time: 'Today',
          icon: <Sun size={14} className="text-amber-500" />,
        });
      }
      if (routine.completedToday?.pm) {
        items.push({
          id: 'routine-pm-today',
          title: 'Evening skincare routine completed',
          time: 'Today',
          icon: <Moon size={14} className="text-indigo-400" />,
        });
      }
      if (routine.updatedAt) {
        items.push({
          id: `routine-saved-${routine.id || 'current'}`,
          title: 'Personalized routine compounded',
          time: new Date(routine.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          icon: <Sparkles size={14} className="text-royal-violet" />,
        });
      }
    }

    // Profile update
    if (profile && profile.updatedAt) {
      items.push({
        id: `profile-${profile.id || 'current'}`,
        title: `Skin profile updated (${profile.skinType || 'Combination'} skin)`,
        time: new Date(profile.updatedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        icon: <Sliders size={14} className="text-lavender-dark" />,
      });
    }

    // Journal entries
    if (Array.isArray(journalEntries)) {
      journalEntries.slice(0, 2).forEach((j) => {
        items.push({
          id: `journal-${j.id || Math.random()}`,
          title: `Journal entry logged (Comfort: ${j.comfortRating || 5}/5)`,
          time: j.entryDate
            ? new Date(j.entryDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'Recently',
          icon: <Activity size={14} className="text-emerald-500" />,
        });
      });
    }

    if (items.length === 0) {
      items.push({
        id: 'account-created',
        title: 'Account created & workspace ready',
        time: 'Welcome',
        icon: <Award size={14} className="text-royal-violet" />,
      });
    }

    return items.slice(0, 5);
  }, [latestAnalysis, routine, profile, journalEntries]);

  // Calculate morning completed steps
  const morningStepCount = Array.isArray(routine?.morning) ? routine.morning.length : 4;
  const morningDoneCount = routine?.completedToday?.am ? morningStepCount : 0;

  // Calculate evening completed steps
  const eveningStepCount = Array.isArray(routine?.evening) ? routine.evening.length : 3;
  const eveningDoneCount = routine?.completedToday?.pm ? eveningStepCount : 0;

  return (
    <div className="compact-dashboard-layout">
      {/* ==============================================================
          CENTRAL WORKSPACE (~70% of available desktop width)
          ============================================================== */}
      <section className="dashboard-central-workspace" aria-label="Main Workspace">
        {/* 1. CENTRAL DASHBOARD HEADER */}
        <header className="workspace-header-bar">
          <div className="header-greeting-block">
            <h1 className="header-greeting-title">
              {greeting}, {currentUser.fullName.split(' ')[0]}
            </h1>
            <p className="header-greeting-subtitle">
              Welcome to your personal skincare space.
            </p>
          </div>

          <div className="header-utilities-block">
            {/* Search Bar */}
            <div className="workspace-search-wrap">
              <div className="search-input-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search routines, ingredients, analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="search-input-field"
                  aria-label="Search skincare workspace"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Live Search Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() && (
                  <motion.div
                    className="search-dropdown-results"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((res, idx) => (
                        <button
                          key={`${res.title}-${idx}`}
                          type="button"
                          className="search-result-item"
                          onClick={() => {
                            onNavigate(res.path);
                            setSearchQuery('');
                          }}
                        >
                          <div className="result-info">
                            <span className="result-title">{res.title}</span>
                            <span className="result-category">{res.category}</span>
                          </div>
                          <ChevronRight size={14} className="result-arrow" />
                        </button>
                      ))
                    ) : (
                      <div className="search-no-results">
                        No matches found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div className="header-action-button-wrap">
              <button
                type="button"
                className="header-icon-action-btn"
                onClick={() => {
                  if (onOpenNotifications) {
                    onOpenNotifications();
                  } else {
                    onNavigate('/routine-insights');
                  }
                }}
                aria-label="View notifications and reminders"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="header-notif-badge">{unreadCount}</span>
                )}
              </button>
            </div>

            {/* User Avatar */}
            <button
              type="button"
              className="header-user-avatar-btn"
              onClick={() => onNavigate('/profile')}
              title={`View ${currentUser.fullName}'s Profile`}
              aria-label="User profile"
            >
              <div className="avatar-gem">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="avatar-photo"
                  />
                ) : (
                  <span className="avatar-initials">
                    {currentUser.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* 2. MAIN DASHBOARD CONTENT CARDS GRID */}
        <div className="compact-cards-grid">
          {/* ==============================================================
              CARD 1 — SKIN OVERVIEW (Large Prominent Card)
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-skin-overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--violet">
                  <ScanFace size={18} />
                </div>
                <div>
                  <h2 className="compact-card-title">Skin Overview</h2>
                  <p className="compact-card-sub">Optical Biometric Diagnostic</p>
                </div>
              </div>

              {latestAnalysis ? (
                <span className="status-badge status-badge--active">
                  <Check size={12} />
                  <span>Calibrated</span>
                </span>
              ) : (
                <span className="status-badge status-badge--pending">
                  <span>Baseline Pending</span>
                </span>
              )}
            </div>

            <div className="card-content-area">
              {latestAnalysis ? (
                <div className="skin-overview-data-layout">
                  <div className="score-hero-col">
                    <div className="score-numerical-display">
                      <span className="score-number tabular-nums">
                        {latestAnalysis.overallScore}
                      </span>
                      <span className="score-base">/100</span>
                    </div>
                    <span className="score-caption">Skin Condition Score</span>
                  </div>

                  <div className="overview-details-col">
                    <div className="overview-metric-row">
                      <span className="metric-row-label">Summary</span>
                      <span className="metric-row-value">
                        {latestAnalysis.skinConditionSummary || 'Optimal Biometric Range'}
                      </span>
                    </div>

                    <div className="overview-metric-row">
                      <span className="metric-row-label">Last Analysis</span>
                      <span className="metric-row-value">
                        {new Date(latestAnalysis.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="overview-concerns-row">
                      <span className="metric-row-label">Observed Concerns</span>
                      <div className="concerns-chips-inline">
                        {latestAnalysis.skinConcerns && latestAnalysis.skinConcerns.length > 0 ? (
                          latestAnalysis.skinConcerns.slice(0, 3).map((concern) => (
                            <span key={concern} className="concern-chip">
                              {concern}
                            </span>
                          ))
                        ) : (
                          <span className="subtle-inline-note">Balanced baseline</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overview-empty-state">
                  <p className="empty-prompt-headline">No facial scan recorded yet</p>
                  <p className="empty-prompt-copy">
                    Complete your first optical scan to map hydration, barrier resilience, and surface clarity without guesswork.
                  </p>
                </div>
              )}

              {/* Visual representation of analysis history when real data exists */}
              {analyses.length > 1 && (
                <div className="analysis-history-strip">
                  <span className="history-strip-title">Recent Scan History</span>
                  <div className="history-dots-row">
                    {analyses.slice(0, 5).map((scan, idx) => (
                      <button
                        key={scan.id}
                        type="button"
                        className="history-point-chip"
                        onClick={() => onNavigate(`/analysis-results/${scan.id}`)}
                        title={`Scan on ${new Date(scan.createdAt).toLocaleDateString()}: Score ${scan.overallScore}`}
                      >
                        <span className="point-score tabular-nums">{scan.overallScore}</span>
                        <span className="point-date">
                          {new Date(scan.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card-action-bar">
              {latestAnalysis ? (
                <>
                  <button
                    type="button"
                    className="compact-btn-primary"
                    onClick={() => onNavigate(`/analysis-results/${latestAnalysis.id}`)}
                  >
                    <span>View Analysis</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="compact-btn-subtle"
                    onClick={() => onNavigate('/skin-analysis')}
                  >
                    <span>Start New Scan</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="compact-btn-primary"
                  onClick={() => onNavigate('/skin-analysis')}
                >
                  <ScanFace size={16} />
                  <span>Start First Analysis</span>
                </button>
              )}
            </div>
          </motion.article>

          {/* ==============================================================
              CARD 2 — MORNING ROUTINE (Compact Lavender/Violet Card)
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-routine-morning"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--amber">
                  <Sun size={18} />
                </div>
                <div>
                  <h3 className="compact-card-title">Morning Routine</h3>
                  <p className="compact-card-sub">Antioxidant &amp; UV Protection</p>
                </div>
              </div>
            </div>

            <div className="card-content-area">
              <div className="routine-step-status-box">
                <span className="status-label-eyebrow">Status</span>
                <div className="status-state-headline">
                  {routine?.completedToday?.am ? (
                    <span className="state-done">
                      <CheckCircle2 size={16} /> Completed
                    </span>
                  ) : (
                    <span className="state-pending">Pending AM check-in</span>
                  )}
                </div>
              </div>

              <div className="steps-completion-counter">
                <span className="counter-fraction tabular-nums">
                  {morningDoneCount} / {morningStepCount}
                </span>
                <span className="counter-desc">steps completed</span>
              </div>
            </div>

            <div className="card-action-bar">
              <button
                type="button"
                className="compact-btn-secondary"
                onClick={() => onNavigate('/my-routine')}
              >
                <span>View Routine</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.article>

          {/* ==============================================================
              CARD 3 — EVENING ROUTINE (Contrasting Soft Pink/Lavender Card)
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-routine-evening"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--rose">
                  <Moon size={18} />
                </div>
                <div>
                  <h3 className="compact-card-title">Evening Routine</h3>
                  <p className="compact-card-sub">Barrier Repair &amp; Regeneration</p>
                </div>
              </div>
            </div>

            <div className="card-content-area">
              <div className="routine-step-status-box">
                <span className="status-label-eyebrow">Status</span>
                <div className="status-state-headline">
                  {routine?.completedToday?.pm ? (
                    <span className="state-done">
                      <CheckCircle2 size={16} /> Completed
                    </span>
                  ) : (
                    <span className="state-pending">Pending PM check-in</span>
                  )}
                </div>
              </div>

              <div className="steps-completion-counter">
                <span className="counter-fraction tabular-nums">
                  {eveningDoneCount} / {eveningStepCount}
                </span>
                <span className="counter-desc">steps completed</span>
              </div>
            </div>

            <div className="card-action-bar">
              <button
                type="button"
                className="compact-btn-secondary"
                onClick={() => onNavigate('/my-routine')}
              >
                <span>View Routine</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.article>

          {/* ==============================================================
              CARD 4 — ROUTINE PROGRESS (Horizontal / Compact Chart)
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-routine-progress"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--charcoal">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="compact-card-title">Routine Progress</h3>
                  <p className="compact-card-sub">Weekly Adherence &amp; Habit Streak</p>
                </div>
              </div>

              <div className="streak-indicator-badge">
                <Flame size={14} className="text-amber-500" />
                <span className="tabular-nums">{routine?.streakDays || 0} Day Streak</span>
              </div>
            </div>

            <div className="card-content-area">
              {/* Mon - Sun Weekly Track */}
              <div className="weekly-progress-track">
                {weeklyDays.map((d) => (
                  <div key={d.day} className={`day-slot ${d.isToday ? 'day-slot--today' : ''}`}>
                    <span className="day-label">{d.day}</span>
                    <div
                      className={`day-circle ${
                        d.completed
                          ? 'day-circle--completed'
                          : d.isPast
                          ? 'day-circle--past'
                          : 'day-circle--future'
                      }`}
                    >
                      {d.completed && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="progress-summary-row">
                <div className="progress-metric-item">
                  <span className="metric-label">Routine Consistency</span>
                  <span className="metric-val tabular-nums">
                    {routine && routine.streakDays > 0
                      ? `${Math.min(95, 60 + routine.streakDays * 5)}%`
                      : '72% Baseline'}
                  </span>
                </div>
                <div className="progress-metric-item">
                  <span className="metric-label">Progress History</span>
                  <span className="metric-val text-royal-violet">
                    {routine?.streakDays && routine.streakDays >= 3
                      ? 'Optimal Consistency'
                      : 'Building Habit'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-action-bar">
              <button
                type="button"
                className="compact-btn-subtle"
                onClick={() => onNavigate('/routine-tracker')}
              >
                <span>Full Tracker Details</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.article>

          {/* ==============================================================
              CARD 5 — SKINCARE GOALS
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-skincare-goals"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--lavender">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="compact-card-title">Skincare Goals</h3>
                  <p className="compact-card-sub">Active Therapeutic Priorities</p>
                </div>
              </div>

              <button
                type="button"
                className="card-header-link"
                onClick={() => onNavigate('/skin-profile')}
              >
                Edit
              </button>
            </div>

            <div className="card-content-area">
              <div className="goals-badges-flow">
                {userGoals.map((goal, idx) => (
                  <div key={idx} className="goal-item-badge">
                    <CheckCircle2 size={13} className="text-royal-violet" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-action-bar">
              <button
                type="button"
                className="compact-btn-subtle"
                onClick={() => onNavigate('/skin-profile')}
              >
                <span>Calibrate Goals in Profile</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.article>

          {/* ==============================================================
              CARD 6 — RECOMMENDED INGREDIENTS
              ============================================================== */}
          <motion.article
            className="compact-dashboard-card card-recommended-ingredients"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className="card-top-bar">
              <div className="card-title-lockup">
                <div className="card-icon-pill card-icon-pill--ice">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <h3 className="compact-card-title">Recommended Ingredients</h3>
                  <p className="compact-card-sub">Formulated for Your Profile</p>
                </div>
              </div>

              <button
                type="button"
                className="card-header-link"
                onClick={() => onNavigate('/ingredients')}
              >
                View All
              </button>
            </div>

            <div className="card-content-area">
              <div className="compact-ingredients-list">
                {recommendedIngredients.slice(0, 3).map((ing) => (
                  <div key={ing.name} className="compact-ingredient-row">
                    <div className="ing-main">
                      <span className="ing-name">{ing.name}</span>
                      <span className="ing-desc">{ing.desc}</span>
                    </div>
                    <span className="ing-badge">{ing.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-action-bar">
              <button
                type="button"
                className="compact-btn-subtle"
                onClick={() => onNavigate('/ingredients')}
              >
                <span>Explore All Actives</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.article>
        </div>
      </section>

      {/* ==============================================================
          RIGHT INFORMATION PANEL ("Your Skin Space", ~250–280px wide)
          ============================================================== */}
      <aside className="dashboard-right-panel" aria-label="Your Skin Space Panel">
        {/* Panel Header */}
        <div className="right-panel-header">
          <h2 className="right-panel-title">Your Skin Space</h2>

          {/* Overview & Activity Segmented Tabs */}
          <div className="right-panel-tabs-bar">
            <button
              type="button"
              className={`panel-tab-btn ${rightPanelTab === 'overview' ? 'panel-tab-btn--active' : ''}`}
              onClick={() => setRightPanelTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`panel-tab-btn ${rightPanelTab === 'activity' ? 'panel-tab-btn--active' : ''}`}
              onClick={() => setRightPanelTab('activity')}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="right-panel-body">
          {rightPanelTab === 'overview' ? (
            <div className="panel-tab-content tab-overview-content">
              {/* User Skin Type */}
              <div className="panel-info-block">
                <span className="info-block-label">Skin Type</span>
                <div className="info-block-value">
                  <span className="skin-type-tag">
                    {profile?.skinType ? profile.skinType : 'Combination (Calibrating)'}
                  </span>
                </div>
              </div>

              {/* Selected Skincare Goals */}
              <div className="panel-info-block">
                <span className="info-block-label">Selected Goals</span>
                <div className="info-goals-list">
                  {userGoals.slice(0, 3).map((goal, i) => (
                    <div key={i} className="info-goal-bullet">
                      <span className="bullet-dot" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Analysis Date */}
              <div className="panel-info-block">
                <span className="info-block-label">Last Analysis</span>
                <div className="info-date-display">
                  <Calendar size={13} className="text-royal-violet" />
                  <span>
                    {latestAnalysis
                      ? new Date(latestAnalysis.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'None recorded'}
                  </span>
                </div>
              </div>

              {/* Current Routine Status */}
              <div className="panel-info-block">
                <span className="info-block-label">Today&apos;s Routine Status</span>
                <div className="info-routine-status-list">
                  <div className="routine-row-item">
                    <span className="routine-name">Morning</span>
                    {routine?.completedToday?.am ? (
                      <span className="pill-status pill-status--done">✓ Done</span>
                    ) : (
                      <span className="pill-status pill-status--pending">Pending</span>
                    )}
                  </div>
                  <div className="routine-row-item">
                    <span className="routine-name">Evening</span>
                    {routine?.completedToday?.pm ? (
                      <span className="pill-status pill-status--done">✓ Done</span>
                    ) : (
                      <span className="pill-status pill-status--pending">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-tab-content tab-activity-content">
              <span className="activity-list-label">Recent User Activity</span>
              <div className="panel-activity-timeline">
                {activityItems.map((item) => (
                  <div key={item.id} className="activity-item-row">
                    <div className="activity-icon-bubble">{item.icon}</div>
                    <div className="activity-text-col">
                      <p className="activity-title">{item.title}</p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="panel-quick-actions-card">
            <h4 className="quick-actions-card-title">Quick Actions</h4>
            <div className="quick-actions-buttons-stack">
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => onNavigate('/skin-analysis')}
              >
                <div className="action-btn-left">
                  <ScanFace size={16} />
                  <span>Start Skin Analysis</span>
                </div>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                className="btn-quick-action"
                onClick={() => onNavigate('/my-routine')}
              >
                <div className="action-btn-left">
                  <Sparkles size={16} />
                  <span>View My Routine</span>
                </div>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                className="btn-quick-action"
                onClick={() => onNavigate('/ingredients')}
              >
                <div className="action-btn-left">
                  <FlaskConical size={16} />
                  <span>Explore Ingredients</span>
                </div>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
