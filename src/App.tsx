import React, { useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ScanFace, Sparkles, ArrowRight, User, LogIn, ArrowUpRight } from 'lucide-react';
import { useRouter } from './router';
import { UserProfile } from './types';
import { authService } from './lib/supabase';
import { NavigationRail } from './components/NavigationRail';
import { NotificationPreferencesModal } from './components/NotificationPreferencesModal';
import { SupabaseConnectionModal } from './components/SupabaseConnectionModal';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { SkinProfilePage } from './pages/SkinProfilePage';
import { SkinAnalysisPage } from './pages/SkinAnalysisPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { AnalysisHistoryPage } from './pages/AnalysisHistoryPage';
import { MyRoutinePage } from './pages/MyRoutinePage';
import { ProfilePage } from './pages/ProfilePage';
import { AiCompanionPage } from './pages/AiCompanionPage';
import { SkinJournalPage } from './pages/SkinJournalPage';
import { SkinProgressPage } from './pages/SkinProgressPage';
import { SkinInsightsPage } from './pages/SkinInsightsPage';
import { RoutineInsightsPage } from './pages/RoutineInsightsPage';

const meshPoints = [
  [42, 8], [53, 10], [64, 13], [35, 20], [47, 22], [59, 24], [70, 27],
  [31, 34], [43, 36], [55, 38], [67, 40], [77, 43], [35, 50], [47, 52],
  [59, 54], [71, 56], [43, 66], [55, 68], [66, 70], [51, 80], [62, 82],
];

export default function App() {
  const { currentPath, navigate, matchRoute } = useRouter();
  const reduceMotion = useReducedMotion();
  const [scanEnabled, setScanEnabled] = useState(true);
  const [introDone, setIntroDone] = useState(false);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        // continue
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    navigate('/');
  };

  // Route guarding for post-login pages
  const isPostLoginRoute =
    currentPath === '/dashboard' ||
    currentPath === '/skin-profile' ||
    currentPath === '/skin-analysis' ||
    currentPath.startsWith('/analysis-results') ||
    currentPath === '/analysis-history' ||
    currentPath === '/my-routine' ||
    currentPath === '/ingredients' ||
    currentPath === '/products' ||
    currentPath === '/routine-tracker' ||
    currentPath === '/profile' ||
    currentPath === '/ai-companion' ||
    currentPath === '/skin-journal' ||
    currentPath === '/skin-progress' ||
    currentPath === '/skin-insights' ||
    currentPath === '/routine-insights';

  const [remindersModalOpen, setRemindersModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isPostLoginRoute && !currentUser) {
      // Strictly prevent unauthenticated access to the dashboard
      navigate('/');
      handleOpenAuth('login');
    }
  }, [authLoading, isPostLoginRoute, currentUser, navigate]);

  useEffect(() => {
    if (currentPath === '/login' || currentPath === '/signin') {
      handleOpenAuth('login');
    } else if (currentPath === '/signup' || currentPath === '/register') {
      handleOpenAuth('signup');
    }
  }, [currentPath]);

  // Check dynamic route match for /analysis-results/:id
  const resultsMatch = matchRoute('/analysis-results/:id');

  // Show clean verifying state while inspecting Supabase session
  if (authLoading) {
    return (
      <div className="auth-loading-viewport">
        <div className="auth-loading-card">
          <div className="auth-gem-icon">
            <Sparkles size={20} className="animate-spin" />
          </div>
          <span className="auth-loading-text">Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  // RENDER POST-LOGIN WORKSPACE ONLY WHEN AUTHENTICATED
  if (isPostLoginRoute && currentUser) {
    return (
      <div className="skinovate-app-viewport">
        {/* Large Rounded Dashboard Container with Ambient Shadow */}
        <div className="skinovate-dashboard-canvas">
          {/* Narrow Vertical Navigation Rail on Left (~75-85px) */}
          <NavigationRail
            currentPath={currentPath}
            onNavigate={navigate}
            onLogout={handleLogout}
            onOpenSettings={() => setRemindersModalOpen(true)}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="dashboard-content-viewport">
            {currentPath === '/dashboard' && (
              <DashboardPage
                currentUser={currentUser}
                onNavigate={navigate}
                onOpenNotifications={() => setRemindersModalOpen(true)}
                onOpenSettings={() => setRemindersModalOpen(true)}
              />
            )}

            {currentPath === '/ingredients' && (
              <MyRoutinePage
                currentUser={currentUser}
                onNavigate={navigate}
                initialTab="ingredients"
              />
            )}

            {currentPath === '/products' && (
              <MyRoutinePage
                currentUser={currentUser}
                onNavigate={navigate}
                initialTab="discovery"
              />
            )}

            {currentPath === '/routine-tracker' && (
              <RoutineInsightsPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/ai-companion' && (
              <AiCompanionPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/skin-journal' && (
              <SkinJournalPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/skin-progress' && (
              <SkinProgressPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/skin-insights' && (
              <SkinInsightsPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/routine-insights' && (
              <RoutineInsightsPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/skin-profile' && (
              <SkinProfilePage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/skin-analysis' && (
              <SkinAnalysisPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {resultsMatch && (
              <AnalysisResultsPage
                analysisId={resultsMatch.params.id}
                currentUser={currentUser}
                onNavigate={navigate}
              />
            )}

            {currentPath === '/analysis-history' && (
              <AnalysisHistoryPage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/my-routine' && (
              <MyRoutinePage currentUser={currentUser} onNavigate={navigate} />
            )}

            {currentPath === '/profile' && (
              <ProfilePage
                currentUser={currentUser}
                onNavigate={navigate}
                onLogout={handleLogout}
              />
            )}
          </main>
        </div>

        {/* Modals */}
        {remindersModalOpen && (
          <NotificationPreferencesModal
            currentUser={currentUser}
            onClose={() => setRemindersModalOpen(false)}
          />
        )}

        {supabaseModalOpen && (
          <SupabaseConnectionModal onClose={() => setSupabaseModalOpen(false)} />
        )}
      </div>
    );
  }

  // RENDER LANDING PAGE HERO
  return (
    <main className="page-stage">
      {/* Top Session Ribbon if already signed in */}
      {currentUser && (
        <div className="session-ribbon">
          <div className="session-ribbon-content">
            <User size={14} className="text-royal-violet" />
            <span>Signed in as <strong>{currentUser.fullName}</strong></span>
          </div>
          <button
            type="button"
            className="btn-ribbon-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            <span>Open Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      <motion.section
        className="hero-artboard"
        aria-label="Skinovate AI skincare landing page hero"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          className="reference-art"
          src="/skinovate-hero-reference.jpg"
          alt="Skinovate hero artwork"
        />

        {/* Original design is baked into the supplied reference artwork. These subtle effects sit above it. */}
        <div className="metric-cleanup metric-cleanup--left" aria-hidden="true" />
        <div className="metric-cleanup metric-cleanup--right" aria-hidden="true" />

        <div className="face-effects" aria-hidden="true">
          <div className={`scan-beam ${scanEnabled ? 'scan-beam--active' : ''}`} />
          {meshPoints.map(([x, y], i) => (
            <span
              className="mesh-pulse"
              key={`${x}-${y}`}
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 7) * 0.13}s` }}
            />
          ))}
        </div>

        <div className="ambient-cloud-glow" aria-hidden="true" />
        <div className="flower-breeze" aria-hidden="true" />

        {/* Accessible, functional controls layered over the matching controls in the artwork. */}
        {/* High-visibility interactive buttons with distinct icons built directly over the artwork */}
        <div className="interactive-controls">
          {/* 1. Log In Button with distinct LogIn icon */}
          <button
            type="button"
            className="hero-btn-login"
            onClick={() => {
              if (currentUser) {
                navigate('/dashboard');
              } else {
                handleOpenAuth('login');
              }
            }}
            aria-label="Log in to Skinovate"
            title="Log in to your account"
          >
            <LogIn size={14} className="hero-btn-icon" />
            <span>Log in</span>
          </button>

          {/* 2. Get Started Button with distinct Sparkles icon */}
          <button
            type="button"
            className="hero-btn-get-started"
            onClick={() => {
              if (currentUser) {
                navigate('/dashboard');
              } else {
                handleOpenAuth('signup');
              }
            }}
            aria-label="Get started with Skinovate"
            title="Create a new account"
          >
            <Sparkles size={14} className="hero-btn-icon" />
            <span>Get Started</span>
          </button>

          {/* 3. Grow Smarter Button with distinct ScanFace skin scanner icon and ArrowUpRight */}
          <button
            type="button"
            className="hero-btn-grow-smarter"
            onClick={() => {
              if (currentUser) {
                navigate('/skin-analysis');
              } else {
                handleOpenAuth('signup');
              }
            }}
            aria-label="Grow smarter - launch skin scan"
            title="Launch personalized AI skin scan"
          >
            <div className="grow-smarter-content">
              <ScanFace size={16} className="hero-btn-icon" />
              <span>Grow Smarter</span>
            </div>
            <div className="grow-smarter-arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </div>
          </button>
        </div>

        <motion.div
          className="headline-reveal"
          initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)', y: 18 }}
          animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
          transition={{ delay: 0.12, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
        <div className="brand-entrance" aria-hidden="true" />

        <button
          className="motion-toggle"
          onClick={() => setScanEnabled((value) => !value)}
          aria-label={scanEnabled ? 'Pause facial scanning animation' : 'Resume facial scanning animation'}
          title={scanEnabled ? 'Pause scan effect' : 'Resume scan effect'}
        >
          <ScanFace size={15} />
        </button>
        <span className="sr-only" aria-live="polite">
          {introDone ? 'Skinovate hero ready' : 'Skinovate hero loading'}
        </span>
      </motion.section>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
