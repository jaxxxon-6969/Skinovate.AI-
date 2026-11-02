import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseConnectionModal } from './SupabaseConnectionModal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
  }, [initialMode, isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let user: UserProfile;
      if (mode === 'signup') {
        user = await authService.signUp(
          email.trim(),
          password,
          fullName.trim() || email.split('@')[0]
        );
      } else {
        user = await authService.signIn(email.trim(), password);
      }
      setIsLoading(false);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const demoUser = await authService.signIn('alex.vance@skinovate.ai', 'Skinovate2026!');
      setIsLoading(false);
      onSuccess(demoUser);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Demo sign in failed.');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="auth-modal-backdrop"
            className="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          >
            <motion.div
              key="auth-dialog-card"
              className="auth-dialog-card"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="auth-title"
            >
              <button
                type="button"
                className="auth-close-btn"
                onClick={onClose}
                aria-label="Close authentication dialog"
              >
                <X size={15} />
              </button>

              <div className="auth-dialog-header">
                <div className="auth-gem-icon">
                  <Sparkles size={16} />
                </div>
                <h2 id="auth-title" className="auth-dialog-title">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="auth-dialog-subtitle">
                  {mode === 'login'
                    ? 'Access your personalized skincare workspace.'
                    : 'Personalized clinical evaluations & routines.'}
                </p>
              </div>

              {/* Quick Demo Access Button & Supabase Status */}
              <div className="demo-access-strip">
                <button
                  type="button"
                  className="demo-strip-info-btn"
                  onClick={() => setSupabaseModalOpen(true)}
                  title="Supabase PostgreSQL status"
                >
                  <Database size={12} className="text-royal-violet" />
                  <span>
                    {isSupabaseConfigured ? 'Supabase Ready' : 'Supabase Config'}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn-quick-demo-login"
                  onClick={handleDemoSignIn}
                  disabled={isLoading}
                >
                  1-Click Demo
                </button>
              </div>

              {/* Mode Switch Tabs */}
              <div className="auth-mode-tabs">
                <button
                  type="button"
                  className={`auth-mode-tab ${mode === 'login' ? 'auth-mode-tab--active' : ''}`}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-mode-tab ${mode === 'signup' ? 'auth-mode-tab--active' : ''}`}
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                >
                  Sign Up
                </button>
              </div>

              {errorMsg && (
                <div className="auth-error-banner">
                  <AlertCircle size={13} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form-body">
                {mode === 'signup' && (
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="fullName">
                      Full Name
                    </label>
                    <div className="auth-input-wrap">
                      <User size={14} className="auth-input-icon" />
                      <input
                        id="fullName"
                        type="text"
                        className="auth-text-input"
                        placeholder="e.g. Maya Lin"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label className="auth-label" htmlFor="authEmail">
                    Email Address
                  </label>
                  <div className="auth-input-wrap">
                    <Mail size={14} className="auth-input-icon" />
                    <input
                      id="authEmail"
                      type="email"
                      className="auth-text-input"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="authPass">
                    Password
                  </label>
                  <div className="auth-input-wrap">
                    <Lock size={14} className="auth-input-icon" />
                    <input
                      id="authPass"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

          <div className="auth-dialog-footer">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  className="link-switch-mode"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                >
                  Sign up here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  className="link-switch-mode"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

      <SupabaseConnectionModal
        key="auth-supabase-connection-modal"
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </>
  );
};
