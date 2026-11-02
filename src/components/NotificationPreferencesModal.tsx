import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Sun,
  Moon,
  BookOpen,
  Camera,
  X,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { ReminderPreferences } from '../types';
import { notificationService } from '../lib/supabase';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  userId,
  onClose,
  onSaved,
}) => {
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    userId,
    morningEnabled: true,
    morningTime: '08:00',
    eveningEnabled: true,
    eveningTime: '21:00',
    journalEnabled: true,
    journalTime: '20:30',
    progressPhotoReminderEnabled: true,
    browserNotificationsRequested: false,
    updatedAt: new Date().toISOString(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [browserNoticeGranted, setBrowserNoticeGranted] = useState(false);

  useEffect(() => {
    async function load() {
      if (userId) {
        const p = await notificationService.getPreferences(userId);
        setPreferences(p);
      }
    }
    if (isOpen) {
      load();
    }
  }, [isOpen, userId]);

  const handleRequestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setBrowserNoticeGranted(true);
        setPreferences((prev) => ({ ...prev, browserNotificationsRequested: true }));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await notificationService.savePreferences({
        ...preferences,
        updatedAt: new Date().toISOString(),
      });
      if (onSaved) onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="modal-backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="journal-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
      >
        <div className="modal-header">
          <div>
            <div className="page-badge mb-1">
              <Bell size={13} />
              <span>Reminders &amp; Adherence</span>
            </div>
            <h3 className="modal-product-title">Notification &amp; Reminder Preferences</h3>
            <p className="modal-subtext">Gentle in-app reminders to support daily routine consistency</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close preferences"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="journal-form-body">
          {/* Morning Reminder */}
          <div className="reminder-setting-row">
            <div className="flex items-center gap-3">
              <div className="card-icon-bubble card-icon-bubble--amber">
                <Sun size={17} />
              </div>
              <div>
                <strong className="block text-sm text-charcoal">Morning Regimen Reminder</strong>
                <span className="text-xs text-gray-500">Alert for cleanser, antioxidant serum &amp; SPF 50+</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                className="styled-time-input"
                value={preferences.morningTime}
                onChange={(e) => setPreferences({ ...preferences, morningTime: e.target.value })}
                disabled={!preferences.morningEnabled}
              />
              <input
                type="checkbox"
                checked={preferences.morningEnabled}
                onChange={(e) => setPreferences({ ...preferences, morningEnabled: e.target.checked })}
                className="h-4 w-4 accent-royal-violet"
              />
            </div>
          </div>

          {/* Evening Reminder */}
          <div className="reminder-setting-row">
            <div className="flex items-center gap-3">
              <div className="card-icon-bubble card-icon-bubble--violet">
                <Moon size={17} />
              </div>
              <div>
                <strong className="block text-sm text-charcoal">Evening Regimen Reminder</strong>
                <span className="text-xs text-gray-500">Alert for double cleanse, active retinoids &amp; night balm</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                className="styled-time-input"
                value={preferences.eveningTime}
                onChange={(e) => setPreferences({ ...preferences, eveningTime: e.target.value })}
                disabled={!preferences.eveningEnabled}
              />
              <input
                type="checkbox"
                checked={preferences.eveningEnabled}
                onChange={(e) => setPreferences({ ...preferences, eveningEnabled: e.target.checked })}
                className="h-4 w-4 accent-royal-violet"
              />
            </div>
          </div>

          {/* Skin Journal Reminder */}
          <div className="reminder-setting-row">
            <div className="flex items-center gap-3">
              <div className="card-icon-bubble card-icon-bubble--lavender">
                <BookOpen size={17} />
              </div>
              <div>
                <strong className="block text-sm text-charcoal">Skin Journal Prompt</strong>
                <span className="text-xs text-gray-500">Quick check-in to log skin feelings and comfort</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                className="styled-time-input"
                value={preferences.journalTime}
                onChange={(e) => setPreferences({ ...preferences, journalTime: e.target.value })}
                disabled={!preferences.journalEnabled}
              />
              <input
                type="checkbox"
                checked={preferences.journalEnabled}
                onChange={(e) => setPreferences({ ...preferences, journalEnabled: e.target.checked })}
                className="h-4 w-4 accent-royal-violet"
              />
            </div>
          </div>

          {/* Browser Notifications Consent */}
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-xs font-semibold text-charcoal block">Optional Browser Notifications</strong>
                <span className="text-xs text-gray-500">Deliver gentle reminders even when tab is idle</span>
              </div>
              <button
                type="button"
                className="btn-card-secondary text-xs py-1.5 px-3"
                onClick={handleRequestBrowserPermission}
              >
                {browserNoticeGranted || preferences.browserNotificationsRequested ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <span>Request Permission</span>
                )}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
