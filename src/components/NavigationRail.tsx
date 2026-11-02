import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  LayoutDashboard,
  ScanFace,
  UserRound,
  FlaskConical,
  ShoppingBag,
  CalendarCheck,
  History,
  Settings,
  LogOut,
  Bot,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  X,
  Database,
  Bell,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface NavigationRailProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onOpenSupabaseModal?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  onOpenSettings,
  onOpenSupabaseModal,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 8 primary navigation items specified by user + secondary
  const primaryNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'skin-analysis',
      label: 'Skin Analysis',
      path: '/skin-analysis',
      icon: <ScanFace size={19} />,
    },
    {
      id: 'skin-profile',
      label: 'Skin Profile',
      path: '/skin-profile',
      icon: <UserRound size={19} />,
    },
    {
      id: 'my-routine',
      label: 'My Routine',
      path: '/my-routine',
      icon: <Sparkles size={19} />,
    },
    {
      id: 'ingredients',
      label: 'Ingredients',
      path: '/ingredients',
      icon: <FlaskConical size={19} />,
    },
    {
      id: 'products',
      label: 'Products',
      path: '/products',
      icon: <ShoppingBag size={19} />,
    },
    {
      id: 'routine-tracker',
      label: 'Routine Tracker',
      path: '/routine-tracker',
      icon: <CalendarCheck size={19} />,
    },
    {
      id: 'analysis-history',
      label: 'Analysis History',
      path: '/analysis-history',
      icon: <History size={19} />,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'ai-companion',
      label: 'AI Companion',
      path: '/ai-companion',
      icon: <Bot size={19} />,
    },
    {
      id: 'skin-journal',
      label: 'Skin Journal',
      path: '/skin-journal',
      icon: <BookOpen size={19} />,
    },
    {
      id: 'skin-progress',
      label: 'Skin Progress',
      path: '/skin-progress',
      icon: <TrendingUp size={19} />,
    },
  ];

  const checkIsActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP / TABLET VERTICAL NAVIGATION RAIL */}
      <aside className="skinovate-nav-rail" aria-label="Main Navigation Rail">
        {/* TOP: Brand Logo Icon */}
        <div className="rail-top-logo">
          <button
            type="button"
            className="rail-logo-btn"
            onClick={() => onNavigate('/dashboard')}
            aria-label="Skinovate Dashboard Home"
            title="Skinovate.AI Home"
          >
            <div className="rail-logo-symbol">
              <Sparkles size={19} />
            </div>
          </button>
        </div>

        {/* CENTER: Navigation Icons */}
        <nav className="rail-nav-list" aria-label="Application Sections">
          {primaryNavItems.map((item) => {
            const isActive = checkIsActive(item.path);
            return (
              <div
                key={item.id}
                className="rail-nav-item-wrapper"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`rail-nav-btn ${isActive ? 'rail-nav-btn--active' : ''}`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="rail-icon-container">{item.icon}</div>

                  {isActive && (
                    <motion.div
                      layoutId="railActivePill"
                      className="rail-active-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                </button>

                {/* Floating Tooltip */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      className="rail-tooltip"
                      initial={{ opacity: 0, x: -6, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span>{item.label}</span>
                      <div className="rail-tooltip-arrow" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* BOTTOM: Settings & Logout */}
        <div className="rail-bottom-actions">
          {/* Settings Icon */}
          <div
            className="rail-nav-item-wrapper"
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
              className="rail-nav-btn rail-nav-btn--subtle"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                else onNavigate('/profile');
              }}
              aria-label="Settings & Preferences"
            >
              <div className="rail-icon-container">
                <Settings size={18} />
              </div>
            </button>

            <AnimatePresence>
              {hoveredItem === 'settings' && (
                <motion.div
                  className="rail-tooltip"
                  initial={{ opacity: 0, x: -6, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <span>Settings &amp; Reminders</span>
                  <div className="rail-tooltip-arrow" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Icon */}
          <div
            className="rail-nav-item-wrapper"
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
              className="rail-nav-btn rail-nav-btn--logout"
              onClick={onLogout}
              aria-label="Log out"
            >
              <div className="rail-icon-container">
                <LogOut size={18} />
              </div>
            </button>

            <AnimatePresence>
              {hoveredItem === 'logout' && (
                <motion.div
                  className="rail-tooltip"
                  initial={{ opacity: 0, x: -6, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <span>Sign Out</span>
                  <div className="rail-tooltip-arrow" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="skinovate-mobile-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className={`mobile-nav-btn ${currentPath === '/dashboard' ? 'mobile-nav-btn--active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/skin-analysis')}
          className={`mobile-nav-btn ${currentPath.startsWith('/skin-analysis') ? 'mobile-nav-btn--active' : ''}`}
        >
          <ScanFace size={20} />
          <span>Scan</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/my-routine')}
          className={`mobile-nav-btn ${currentPath.startsWith('/my-routine') ? 'mobile-nav-btn--active' : ''}`}
        >
          <Sparkles size={20} />
          <span>Routine</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/routine-tracker')}
          className={`mobile-nav-btn ${currentPath.startsWith('/routine-tracker') ? 'mobile-nav-btn--active' : ''}`}
        >
          <CalendarCheck size={20} />
          <span>Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-nav-btn"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* MOBILE "MORE" SHEET */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              className="mobile-drawer-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer-header">
                <h3>Navigation &amp; Features</h3>
                <button
                  type="button"
                  className="btn-close-drawer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="drawer-grid">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="drawer-item-btn"
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {secondaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="drawer-item-btn"
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  className="drawer-action-btn"
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings size={18} />
                  <span>Settings &amp; Reminders</span>
                </button>

                <button
                  type="button"
                  className="drawer-action-btn drawer-action-btn--logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
