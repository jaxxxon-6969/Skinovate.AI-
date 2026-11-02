import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  BookOpen,
  Plus,
  ArrowLeft,
  Smile,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  Trash2,
  Edit2,
  Filter,
  Camera,
  Tag,
  Sparkles,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  UserProfile,
  SkinJournalEntry,
  SkinObservationType,
  SkincareRoutine,
} from '../types';
import {
  journalService,
  routineService,
} from '../lib/supabase';

interface SkinJournalPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

const OBSERVATION_OPTIONS: SkinObservationType[] = [
  'Skin felt hydrated',
  'Skin felt dry',
  'Skin appeared oily',
  'Skin felt irritated',
  'Visible blemishes noticed',
  'Texture felt rough',
  'Skin appeared calm & radiant',
  'Slight redness or flushing',
  'Comfortable & balanced',
];

export const SkinJournalPage: React.FC<SkinJournalPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [entries, setEntries] = useState<SkinJournalEntry[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [selectedFilterDate, setSelectedFilterDate] = useState<string>('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states for creating / editing journal entries
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formObservations, setFormObservations] = useState<SkinObservationType[]>(['Skin felt hydrated', 'Comfortable & balanced']);
  const [formCompletedAm, setFormCompletedAm] = useState(true);
  const [formCompletedPm, setFormCompletedPm] = useState(true);
  const [formProductsUsed, setFormProductsUsed] = useState<string>('');
  const [formIngredientsIntroduced, setFormIngredientsIntroduced] = useState<string>('');
  const [formRoutineNotes, setFormRoutineNotes] = useState<string>('');
  const [formGeneralNotes, setFormGeneralNotes] = useState<string>('');
  const [formComfortRating, setFormComfortRating] = useState<number>(4);
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [journalList, rData] = await Promise.all([
        journalService.getEntries(currentUser.id),
        routineService.getRoutine(currentUser.id),
      ]);
      setEntries(journalList);
      setRoutine(rData);
    }
    loadData();
  }, [currentUser.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openNewEntryModal = () => {
    setEditingEntryId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormObservations(['Skin felt hydrated', 'Comfortable & balanced']);
    setFormCompletedAm(!!routine?.completedToday.am);
    setFormCompletedPm(!!routine?.completedToday.pm);
    setFormProductsUsed('');
    setFormIngredientsIntroduced('');
    setFormRoutineNotes('');
    setFormGeneralNotes('');
    setFormComfortRating(4);
    setFormPhotoUrl('');
    setEntryModalOpen(true);
  };

  const openEditEntryModal = (entry: SkinJournalEntry) => {
    setEditingEntryId(entry.id);
    setFormDate(entry.entryDate);
    setFormObservations(entry.observations);
    setFormCompletedAm(entry.completedAm);
    setFormCompletedPm(entry.completedPm);
    setFormProductsUsed(entry.productsUsed?.join(', ') || '');
    setFormIngredientsIntroduced(entry.ingredientsIntroduced?.join(', ') || '');
    setFormRoutineNotes(entry.routineNotes || '');
    setFormGeneralNotes(entry.generalNotes || '');
    setFormComfortRating(entry.skinComfortRating || 4);
    setFormPhotoUrl(entry.photoUrl || '');
    setEntryModalOpen(true);
  };

  const handleToggleObservation = (obs: SkinObservationType) => {
    if (formObservations.includes(obs)) {
      setFormObservations(formObservations.filter((o) => o !== obs));
    } else {
      setFormObservations([...formObservations, obs]);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    const entryToSave: SkinJournalEntry = {
      id: editingEntryId || `entry_${Date.now()}`,
      userId: currentUser.id,
      entryDate: formDate,
      observations: formObservations,
      completedAm: formCompletedAm,
      completedPm: formCompletedPm,
      productsUsed: formProductsUsed.split(',').map((p) => p.trim()).filter(Boolean),
      ingredientsIntroduced: formIngredientsIntroduced.split(',').map((p) => p.trim()).filter(Boolean),
      routineNotes: formRoutineNotes.trim(),
      generalNotes: formGeneralNotes.trim(),
      photoUrl: formPhotoUrl.trim() || undefined,
      skinComfortRating: formComfortRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await journalService.saveEntry(entryToSave);
    const updated = await journalService.getEntries(currentUser.id);
    setEntries(updated);
    setEntryModalOpen(false);
    showToast(editingEntryId ? 'Journal entry updated!' : 'Daily skin journal entry saved!');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      await journalService.deleteEntry(currentUser.id, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      showToast('Journal entry deleted.');
    }
  };

  const filteredEntries = selectedFilterDate
    ? entries.filter((e) => e.entryDate === selectedFilterDate)
    : entries;

  // Weekly summary statistics
  const recent7 = entries.slice(0, 7);
  const hydratedRate = recent7.length > 0
    ? Math.round((recent7.filter((e) => e.observations.includes('Skin felt hydrated') || e.observations.includes('Comfortable & balanced')).length / recent7.length) * 100)
    : 100;
  const amCompliance = recent7.length > 0
    ? Math.round((recent7.filter((e) => e.completedAm).length / recent7.length) * 100)
    : 100;
  const pmCompliance = recent7.length > 0
    ? Math.round((recent7.filter((e) => e.completedPm).length / recent7.length) * 100)
    : 100;

  return (
    <div className="journal-page-viewport">
      <div className="journal-container">
        {/* Top Header */}
        <div className="journal-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="btn-primary-action"
            onClick={openNewEntryModal}
          >
            <Plus size={16} />
            <span>Add Daily Entry</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="journal-header-block">
          <div className="page-badge">
            <BookOpen size={14} />
            <span>Self-Reported Skin Journal</span>
          </div>
          <h1 className="journal-title">My Skincare Journal</h1>
          <p className="journal-subtitle">
            Document daily skin comfort, newly introduced actives, and routine adherence to correlate lifestyle habits with barrier stability.
          </p>
        </div>

        {/* Weekly Summary Widget */}
        <div className="journal-summary-grid">
          <div className="summary-stat-card">
            <span className="stat-label">7-Day Hydration Comfort</span>
            <div className="stat-val-row">
              <span className="stat-num text-emerald-600">{hydratedRate}%</span>
              <span className="stat-sub">positive comfort reports</span>
            </div>
          </div>

          <div className="summary-stat-card">
            <span className="stat-label">Morning Adherence</span>
            <div className="stat-val-row">
              <span className="stat-num text-amber-600">{amCompliance}%</span>
              <span className="stat-sub">AM routines completed</span>
            </div>
          </div>

          <div className="summary-stat-card">
            <span className="stat-label">Evening Adherence</span>
            <div className="stat-val-row">
              <span className="stat-num text-royal-violet">{pmCompliance}%</span>
              <span className="stat-sub">PM treatments completed</span>
            </div>
          </div>
        </div>

        {/* View & Filter Toolbar */}
        <div className="journal-toolbar">
          <div className="view-switch-tabs">
            <button
              type="button"
              className={`view-btn ${viewMode === 'timeline' ? 'view-btn--active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline Entries
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'calendar' ? 'view-btn--active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar Overview
            </button>
          </div>

          <div className="filter-date-wrap">
            <label htmlFor="journal-date-filter" className="sr-only">Filter by date</label>
            <input
              id="journal-date-filter"
              type="date"
              className="styled-date-input"
              value={selectedFilterDate}
              onChange={(e) => setSelectedFilterDate(e.target.value)}
            />
            {selectedFilterDate && (
              <button
                type="button"
                className="btn-clear-date"
                onClick={() => setSelectedFilterDate('')}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="journal-entries-timeline">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                className="journal-entry-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="entry-card-header">
                  <div className="entry-date-group">
                    <Calendar size={15} className="text-royal-violet" />
                    <span className="entry-date-text">
                      {new Date(entry.entryDate + 'T00:00:00').toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="comfort-rating-pill">
                      Comfort: {entry.skinComfortRating}/5
                    </span>
                  </div>

                  <div className="entry-action-btns">
                    <button
                      type="button"
                      className="btn-entry-icon"
                      onClick={() => openEditEntryModal(entry)}
                      title="Edit journal entry"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-entry-icon text-rose-500 hover:text-rose-700"
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Delete journal entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Routine Completion Row */}
                <div className="entry-routine-status-row">
                  <span className={`adherence-tag ${entry.completedAm ? 'adherence-tag--done' : 'adherence-tag--missed'}`}>
                    <Sun size={13} />
                    <span>AM Routine {entry.completedAm ? 'Completed' : 'Skipped'}</span>
                  </span>
                  <span className={`adherence-tag ${entry.completedPm ? 'adherence-tag--done' : 'adherence-tag--missed'}`}>
                    <Moon size={13} />
                    <span>PM Routine {entry.completedPm ? 'Completed' : 'Skipped'}</span>
                  </span>
                </div>

                {/* Observations Tags */}
                <div className="entry-observations-row">
                  {entry.observations.map((obs) => (
                    <span key={obs} className="obs-pill">
                      {obs}
                    </span>
                  ))}
                </div>

                {/* Notes */}
                {entry.routineNotes && (
                  <p className="entry-note-paragraph">
                    <strong>Routine &amp; Active Notes:</strong> {entry.routineNotes}
                  </p>
                )}
                {entry.generalNotes && (
                  <p className="entry-note-paragraph text-gray-600">
                    <strong>Lifestyle &amp; Environment:</strong> {entry.generalNotes}
                  </p>
                )}

                {/* Optional Photograph */}
                {entry.photoUrl && (
                  <div className="entry-photo-preview mt-3">
                    <img src={entry.photoUrl} alt="Journal skin check" className="entry-thumb-img" />
                  </div>
                )}
              </motion.div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="journal-empty-card">
                <BookOpen size={36} className="text-lavender mx-auto mb-2" />
                <h3>No Journal Entries Found</h3>
                <p>Start documenting your skin sensations and product tolerance.</p>
                <button
                  type="button"
                  className="btn-primary-action mt-3"
                  onClick={openNewEntryModal}
                >
                  Create Today&apos;s Entry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="journal-calendar-card">
            <h3 className="calendar-header-title">Monthly Journal &amp; Adherence Overview</h3>
            <p className="calendar-subtext">Click on any logged date to filter the daily log details.</p>

            <div className="calendar-days-grid">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`calendar-day-tile ${selectedFilterDate === entry.entryDate ? 'calendar-day-tile--selected' : ''}`}
                  onClick={() => {
                    setSelectedFilterDate(entry.entryDate);
                    setViewMode('timeline');
                  }}
                >
                  <span className="cal-day-num">{entry.entryDate.slice(-2)}</span>
                  <span className="cal-day-month">{new Date(entry.entryDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' })}</span>
                  <div className="cal-dots">
                    {entry.completedAm && <span className="dot dot-am" title="AM Routine Done" />}
                    {entry.completedPm && <span className="dot dot-pm" title="PM Routine Done" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Entry Modal */}
        <AnimatePresence>
          {entryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="modal-backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEntryModalOpen(false)}
              />

              <motion.div
                className="journal-modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
              >
                <div className="modal-header">
                  <div>
                    <h3 className="modal-product-title">
                      {editingEntryId ? 'Edit Journal Entry' : 'New Daily Skin Journal Entry'}
                    </h3>
                    <p className="modal-subtext">Record observations, routine adherence, and new actives</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setEntryModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEntry} className="journal-form-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="entry-date-input">Entry Date</label>
                    <input
                      id="entry-date-input"
                      type="date"
                      className="form-text-input"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Routine Checkboxes */}
                  <div className="form-group">
                    <label className="form-label">Routine Adherence Today</label>
                    <div className="flex gap-4">
                      <label className="checkbox-toggle-label">
                        <input
                          type="checkbox"
                          checked={formCompletedAm}
                          onChange={(e) => setFormCompletedAm(e.target.checked)}
                        />
                        <span>Morning (AM) Completed</span>
                      </label>
                      <label className="checkbox-toggle-label">
                        <input
                          type="checkbox"
                          checked={formCompletedPm}
                          onChange={(e) => setFormCompletedPm(e.target.checked)}
                        />
                        <span>Evening (PM) Completed</span>
                      </label>
                    </div>
                  </div>

                  {/* Skin Observations Multi-Select */}
                  <div className="form-group">
                    <label className="form-label">Self-Reported Skin Sensations</label>
                    <div className="flex flex-wrap gap-2">
                      {OBSERVATION_OPTIONS.map((obs) => {
                        const isSelected = formObservations.includes(obs);
                        return (
                          <button
                            key={obs}
                            type="button"
                            className={`filter-active-tag ${isSelected ? 'filter-active-tag--active' : ''}`}
                            onClick={() => handleToggleObservation(obs)}
                          >
                            {obs}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skin Comfort Rating */}
                  <div className="form-group">
                    <label className="form-label">Overall Skin Comfort (1 to 5): {formComfortRating} / 5</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formComfortRating}
                      onChange={(e) => setFormComfortRating(Number(e.target.value))}
                      className="w-full accent-royal-violet"
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="routine-notes-input">Routine &amp; Active Notes</label>
                    <textarea
                      id="routine-notes-input"
                      className="form-textarea"
                      rows={2}
                      placeholder="e.g. Applied Retinal over dry skin; no redness noticed."
                      value={formRoutineNotes}
                      onChange={(e) => setFormRoutineNotes(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="lifestyle-notes-input">General Lifestyle &amp; Water Intake</label>
                    <textarea
                      id="lifestyle-notes-input"
                      className="form-textarea"
                      rows={2}
                      placeholder="e.g. Drank 2L water, spent 1 hour outdoors in windy climate."
                      value={formGeneralNotes}
                      onChange={(e) => setFormGeneralNotes(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setEntryModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary-action">
                      {editingEntryId ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="routine-action-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
