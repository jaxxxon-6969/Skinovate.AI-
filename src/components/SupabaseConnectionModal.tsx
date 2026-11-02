import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ShieldCheck,
  Table,
  Key,
  ExternalLink,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import {
  verifySupabaseConnection,
  SupabaseConnectionReport,
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured,
} from '../lib/supabaseClient';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<SupabaseConnectionReport | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'schema'>('status');

  const runVerification = async () => {
    setTesting(true);
    try {
      const rep = await verifySupabaseConnection();
      setReport(rep);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runVerification();
    }
  }, [isOpen]);

  const sampleSql = `-- PostgreSQL Schema for Skinovate-AI Supabase Project
-- Note: Do not execute unless you need to create missing tables.

-- 1. profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. skin_profiles table (onboarding questionnaire)
create table if not exists public.skin_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text,
  age_range text,
  skin_type text,
  primary_concerns text[],
  primary_goal text,
  sun_exposure text,
  water_intake text,
  climate text,
  sensitivity_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.skin_profiles enable row level security;
create policy "Users can view own skin profile" on public.skin_profiles for select using (auth.uid() = user_id);
create policy "Users can insert/update own skin profile" on public.skin_profiles for all using (auth.uid() = user_id);

-- 3. skin_analyses table (biometric scans & routines)
create table if not exists public.skin_analyses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  overall_score integer,
  condition_tag text,
  condition_summary text,
  metrics jsonb,
  zones jsonb,
  key_findings text[],
  target_actives jsonb,
  avoid_ingredients text[],
  photo_url text,
  record_json jsonb,
  created_at timestamptz default now()
);
alter table public.skin_analyses enable row level security;
create policy "Users can view own skin analyses" on public.skin_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own skin analyses" on public.skin_analyses for insert with check (auth.uid() = user_id);

-- 4. skin_journal_entries table (Phase 4 daily skin journal)
create table if not exists public.skin_journal_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  entry_date date not null,
  observations text[],
  completed_am boolean default false,
  completed_pm boolean default false,
  products_used text[],
  ingredients_introduced text[],
  routine_notes text,
  general_notes text,
  photo_url text,
  skin_comfort_rating integer default 4,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.skin_journal_entries enable row level security;
create policy "Users can view own journal entries" on public.skin_journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert/update own journal entries" on public.skin_journal_entries for all using (auth.uid() = user_id);

-- 5. progress_photos table (Phase 4 private progress photo journal)
create table if not exists public.progress_photos (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  image_path text not null,
  photo_date date not null,
  notes text,
  lighting_condition text,
  created_at timestamptz default now()
);
alter table public.progress_photos enable row level security;
create policy "Users can view own progress photos" on public.progress_photos for select using (auth.uid() = user_id);
create policy "Users can insert/delete own progress photos" on public.progress_photos for all using (auth.uid() = user_id);

-- 6. assistant_conversations & messages (Phase 4 AI Companion)
create table if not exists public.assistant_conversations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  last_message_snippet text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.assistant_conversations enable row level security;
create policy "Users manage own conversations" on public.assistant_conversations for all using (auth.uid() = user_id);

create table if not exists public.assistant_messages (
  id text primary key,
  conversation_id text references public.assistant_conversations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  referenced_actives text[],
  referenced_metrics text[],
  created_at timestamptz default now()
);
alter table public.assistant_messages enable row level security;
create policy "Users manage own messages" on public.assistant_messages for all using (auth.uid() = user_id);

-- 7. user_notifications & reminder_preferences (Phase 4 notifications)
create table if not exists public.user_notifications (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.user_notifications enable row level security;
create policy "Users view/update own notifications" on public.user_notifications for all using (auth.uid() = user_id);

create table if not exists public.reminder_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid unique references auth.users(id) on delete cascade,
  morning_enabled boolean default true,
  morning_time text default '08:00',
  evening_enabled boolean default true,
  evening_time text default '21:00',
  journal_enabled boolean default true,
  journal_time text default '20:30',
  progress_photo_reminder_enabled boolean default true,
  browser_notifications_requested boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.reminder_preferences enable row level security;
create policy "Users manage own reminders" on public.reminder_preferences for all using (auth.uid() = user_id);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="supabase-telemetry-backdrop"
          className="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            key="supabase-telemetry-card"
            className="supabase-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="supabase-modal-header">
            <div className="supabase-modal-title-wrap">
              <div className="supabase-icon-box">
                <Database size={20} />
              </div>
              <div>
                <h3 className="supabase-modal-title">Supabase Database &amp; Auth Status</h3>
                <p className="supabase-modal-subtitle">
                  Skinovate-AI PostgreSQL schema verification &amp; connection telemetry
                </p>
              </div>
            </div>
            <button
              type="button"
              className="auth-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="supabase-tabs-row">
            <button
              type="button"
              className={`supabase-tab-btn ${activeTab === 'status' ? 'supabase-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              <Database size={15} />
              <span>Connection Telemetry</span>
            </button>
            <button
              type="button"
              className={`supabase-tab-btn ${activeTab === 'schema' ? 'supabase-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('schema')}
            >
              <Code size={15} />
              <span>PostgreSQL Schema Reference</span>
            </button>
          </div>

          {activeTab === 'status' && (
            <div className="supabase-modal-body">
              {/* Connection Status Banner */}
              <div
                className={`connection-banner ${
                  report?.connected ? 'connection-banner--ok' : 'connection-banner--warn'
                }`}
              >
                <div className="banner-icon-col">
                  {report?.connected ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={24} className="text-amber-500" />
                  )}
                </div>
                <div className="banner-info-col">
                  <div className="banner-heading-row">
                    <span className="banner-title">
                      {report?.connected
                        ? 'Connected to Supabase Project'
                        : isSupabaseConfigured
                        ? 'Supabase Configured — Verifying Endpoint'
                        : 'Environment Configuration Pending'}
                    </span>
                    <span
                      className={`status-pill ${
                        report?.connected ? 'status-pill--success' : 'status-pill--pending'
                      }`}
                    >
                      {report?.connected ? 'Live & Connected' : 'Local Fallback Active'}
                    </span>
                  </div>
                  <p className="banner-desc">
                    {report?.summary ||
                      'Testing Supabase connection parameters and verifying table access.'}
                  </p>
                </div>
              </div>

              {/* Environment Variables Table */}
              <div className="config-inspection-section">
                <h4 className="inspection-heading">
                  <Key size={15} />
                  <span>Required Environment Variables</span>
                </h4>
                <div className="variables-list">
                  <div className="variable-row">
                    <div className="variable-key">
                      <code>VITE_SUPABASE_URL</code>
                      <span className="required-tag">Required</span>
                    </div>
                    <div className="variable-status">
                      {supabaseUrl && !supabaseUrl.includes('your-project-id') ? (
                        <span className="val-badge val-badge--ok">
                          <CheckCircle2 size={13} />
                          <code>{supabaseUrl.substring(0, 28)}...</code>
                        </span>
                      ) : (
                        <span className="val-badge val-badge--missing">
                          <AlertTriangle size={13} />
                          <span>Not Configured</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="variable-row">
                    <div className="variable-key">
                      <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
                      <span className="required-tag">Required</span>
                    </div>
                    <div className="variable-status">
                      {supabasePublishableKey &&
                      !supabasePublishableKey.includes('your-supabase-publishable-key') ? (
                        <span className="val-badge val-badge--ok">
                          <CheckCircle2 size={13} />
                          <code>sbp_••••••••••••••••</code>
                        </span>
                      ) : (
                        <span className="val-badge val-badge--missing">
                          <AlertTriangle size={13} />
                          <span>Not Configured</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target PostgreSQL Tables */}
              <div className="config-inspection-section">
                <h4 className="inspection-heading">
                  <Table size={15} />
                  <span>PostgreSQL Tables &amp; Row Level Security (RLS)</span>
                </h4>
                <div className="tables-status-grid">
                  {/* profiles */}
                  <div className="table-status-box">
                    <div className="table-box-top">
                      <span className="table-name">profiles</span>
                      <span
                        className={`table-badge ${
                          report?.tables?.profiles?.status === 'ok'
                            ? 'table-badge--ok'
                            : 'table-badge--info'
                        }`}
                      >
                        {report?.tables?.profiles?.status === 'ok' ? 'Verified' : 'Ready'}
                      </span>
                    </div>
                    <p className="table-desc">User accounts, full name, avatar, and auth synchronization.</p>
                    <div className="table-rls-info">
                      <ShieldCheck size={13} />
                      <span>RLS: <code>auth.uid() = id</code></span>
                    </div>
                  </div>

                  {/* skin_profiles */}
                  <div className="table-status-box">
                    <div className="table-box-top">
                      <span className="table-name">skin_profiles</span>
                      <span
                        className={`table-badge ${
                          report?.tables?.skin_profiles?.status === 'ok'
                            ? 'table-badge--ok'
                            : 'table-badge--info'
                        }`}
                      >
                        {report?.tables?.skin_profiles?.status === 'ok' ? 'Verified' : 'Ready'}
                      </span>
                    </div>
                    <p className="table-desc">5-step onboarding responses: skin type, concerns, climate.</p>
                    <div className="table-rls-info">
                      <ShieldCheck size={13} />
                      <span>RLS: <code>auth.uid() = user_id</code></span>
                    </div>
                  </div>

                  {/* skin_analyses */}
                  <div className="table-status-box">
                    <div className="table-box-top">
                      <span className="table-name">skin_analyses</span>
                      <span
                        className={`table-badge ${
                          report?.tables?.skin_analyses?.status === 'ok'
                            ? 'table-badge--ok'
                            : 'table-badge--info'
                        }`}
                      >
                        {report?.tables?.skin_analyses?.status === 'ok' ? 'Verified' : 'Ready'}
                      </span>
                    </div>
                    <p className="table-desc">Biometric 6-axis scan data, facial zones, findings &amp; actives.</p>
                    <div className="table-rls-info">
                      <ShieldCheck size={13} />
                      <span>RLS: <code>auth.uid() = user_id</code></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions note */}
              <div className="security-notice-callout">
                <ShieldCheck size={16} className="text-royal-violet" />
                <p>
                  <strong>Security Guarantee:</strong> This application only consumes the client-safe
                  publishable key. Secret/service-role keys are never exposed in frontend code, and Row
                  Level Security guarantees data isolation between accounts.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="supabase-modal-footer">
                <button
                  type="button"
                  className="btn-run-verify"
                  onClick={runVerification}
                  disabled={testing}
                >
                  <RefreshCw size={15} className={testing ? 'animate-spin' : ''} />
                  <span>{testing ? 'Testing Endpoint...' : 'Re-verify Connection'}</span>
                </button>

                {report?.checkedAt && (
                  <span className="last-checked-label">
                    Checked {new Date(report.checkedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="supabase-modal-body">
              <div className="schema-intro-banner">
                <p>
                  The application is configured to query and persist to your PostgreSQL tables:
                  <strong> profiles</strong>, <strong>skin_profiles</strong>, and <strong>skin_analyses</strong>.
                  All queries enforce Row Level Security by matching <code>auth.uid()</code>.
                </p>
                <button
                  type="button"
                  className="btn-copy-sql"
                  onClick={copySqlToClipboard}
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="schema-code-block">
                <pre>
                  <code>{sampleSql}</code>
                </pre>
              </div>
            </div>
          )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
