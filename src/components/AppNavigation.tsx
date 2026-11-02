import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  LayoutDashboard,
  ScanFace,
  Sparkle,
  History,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Layers,
  ShieldCheck,
  CheckCircle,
  Database,
  Bot,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Sliders,
  Settings,
} from 'lucide-react';
import { UserProfile, UserNotification } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { SupabaseConnectionModal } from './SupabaseConnectionModal';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';
import { notificationService } from '../lib/supabase';

interface AppNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  currentPath,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (currentUser?.id) {
        const list = await notificationService.getNotifications(currentUser.id);
        setNotifications(list);
      }
    }
    loadNotifications();
  }, [currentUser?.id]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'AI Companion', path: '/ai-companion', icon: <Bot size={16} /> },
    { label: 'Skin Journal', path: '/skin-journal', icon: <BookOpen size={16} /> },
    { label: 'Skin Progress', path: '/skin-progress', icon: <TrendingUp size={16} /> },
    { label: 'My Routine', path: '/my-routine', icon: <Sparkle size={16} /> },
    { label: 'Skin Insights', path: '/skin-insights', icon: <Lightbulb size={16} /> },
    { label: 'Routine Insights', path: '/routine-insights', icon: <Sliders size={16} /> },
    { label: 'Analysis', path: '/skin-analysis', icon: <ScanFace size={16} /> },
    { label: 'History', path: '/analysis-history', icon: <History size={16} /> },
    { label: 'Profile', path: '/profile', icon: <User size={16} /> },
  ];

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(currentUser.id, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  return (
    <header className="app-nav-header">
      <div className="app-nav-inner">
        {/* Brand */}
        <div className="app-nav-brand">
          <button
            type="button"
            className="brand-logo-btn"
            onClick={() => onNavigate('/dashboard')}
            aria-label="Skinovate Dashboard"
          >
            <div className="brand-logo-gem">
              <Sparkles size={16} />
            </div>
            <span className="brand-title">
              Skinovate<span className="brand-ai-suffix">.AI</span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="app-nav-menu" aria-label="Skincare workspace navigation">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`nav-tab-btn ${isActive ? 'nav-tab-btn--active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="active-tab-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Notifications & User Avatar */}
        <div className="app-nav-actions">
          {/* Supabase Connection Telemetry Button */}
          <button
            type="button"
            className={`supabase-nav-indicator ${
              isSupabaseConfigured
                ? 'supabase-nav-indicator--connected'
                : 'supabase-nav-indicator--pending'
            }`}
            onClick={() => setSupabaseModalOpen(true)}
            title="Inspect Supabase PostgreSQL Tables & Auth Connection"
          >
            <Database size={14} />
            <span className="supabase-indicator-text">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Status'}
            </span>
            <span
              className={`indicator-dot ${
                isSupabaseConfigured ? 'indicator-dot--active' : 'indicator-dot--pending'
              }`}
            />
          </button>

          {/* Notifications Dropdown */}
          <div className="dropdown-wrapper">
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              aria-label="View notifications"
              title="Notifications"
            >
              {unreadCount > 0 && <span className="notification-ping" />}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  key="notifications-dropdown-menu"
                  className="dropdown-menu-card notifications-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="dropdown-header">
                    <h4>In-App Notifications</h4>
                    {unreadCount > 0 ? (
                      <span className="notification-badge">{unreadCount} New</span>
                    ) : (
                      <span className="text-xs text-gray-400">All read</span>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.readAt ? 'opacity-65' : ''}`}
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <div className={`notification-dot ${n.readAt ? 'bg-gray-300' : 'bg-royal-violet'}`} />
                        <div className="notification-content flex-1">
                          <p className="notification-title">{n.title}</p>
                          <p className="notification-desc">{n.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="notification-time">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!n.readAt && (
                              <span className="text-[10px] text-royal-violet font-semibold">Mark read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-gray-500 p-3 text-center">No notifications yet.</p>
                    )}
                  </div>

                  <div className="p-2 border-t border-purple-100 bg-purple-50/50 flex justify-center">
                    <button
                      type="button"
                      className="text-xs font-semibold text-royal-violet hover:underline flex items-center gap-1.5"
                      onClick={() => {
                        setNotificationsOpen(false);
                        setRemindersModalOpen(true);
                      }}
                    >
                      <Settings size={12} />
                      <span>Configure Reminder Preferences</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Account Menu */}
          <div className="dropdown-wrapper">
            <button
              type="button"
              className="user-account-btn"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotificationsOpen(false);
              }}
              aria-label="User account menu"
            >
              <div className="user-avatar-circle">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-label">{currentUser.fullName}</span>
              <ChevronDown size={14} className={`chevron-icon ${userDropdownOpen ? 'rotate' : ''}`} />
            </button>

            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  key="user-account-dropdown-menu"
                  className="dropdown-menu-card user-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="user-menu-header">
                    <p className="menu-user-name">{currentUser.fullName}</p>
                    <p className="menu-user-email">{currentUser.email}</p>
                  </div>

                  <div className="user-menu-divider" />

                  <button
                    type="button"
                    className="menu-action-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('/profile');
                    }}
                  >
                    <User size={15} />
                    <span>Account Profile</span>
                  </button>

                  <button
                    type="button"
                    className="menu-action-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('/skin-profile');
                    }}
                  >
                    <Layers size={15} />
                    <span>Skincare Questionnaire</span>
                  </button>

                  <button
                    type="button"
                    className="menu-action-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setSupabaseModalOpen(true);
                    }}
                  >
                    <Database size={15} />
                    <span>Supabase Status</span>
                  </button>

                  <button
                    type="button"
                    className="menu-action-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('/');
                    }}
                  >
                    <Sparkles size={15} />
                    <span>View Landing Page</span>
                  </button>

                  <div className="user-menu-divider" />

                  <button
                    type="button"
                    className="menu-action-item menu-action-item--danger"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-drawer-content"
            className="mobile-nav-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mobile-nav-inner">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(item.path);
                  }}
                  className={`mobile-tab-btn ${currentPath === item.path ? 'mobile-tab-btn--active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              <button
                type="button"
                className="mobile-tab-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSupabaseModalOpen(true);
                }}
              >
                <Database size={17} />
                <span>Supabase Telemetry</span>
              </button>

              <div className="mobile-drawer-bottom">
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supabase Connection Telemetry Modal */}
      <SupabaseConnectionModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      {/* Reminder Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={remindersModalOpen}
        userId={currentUser.id}
        onClose={() => setRemindersModalOpen(false)}
      />
    </header>
  );
};
