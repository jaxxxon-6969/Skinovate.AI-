import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowRightLeft,
  Camera,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  X,
  ChevronRight,
  Sliders,
  Maximize2,
} from 'lucide-react';
import {
  UserProfile,
  SkinAnalysisRecord,
  ProgressPhoto,
  MetricDimension,
} from '../types';
import {
  analysisService,
  photoJournalService,
} from '../lib/supabase';

interface SkinProgressPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const SkinProgressPage: React.FC<SkinProgressPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'comparison' | 'photos'>('timeline');
  const [analyses, setAnalyses] = useState<SkinAnalysisRecord[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  // Comparison selection
  const [firstAnalysisId, setFirstAnalysisId] = useState<string>('');
  const [secondAnalysisId, setSecondAnalysisId] = useState<string>('');

  // Add Photo Modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [newPhotoDate, setNewPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoNotes, setNewPhotoNotes] = useState<string>('');
  const [newPhotoLighting, setNewPhotoLighting] = useState<'Natural Daylight' | 'Indoor Soft' | 'Direct Flash'>('Natural Daylight');
  const [consentChecked, setConsentChecked] = useState(false);

  // Photo compare selection
  const [selectedPhotosForCompare, setSelectedPhotosForCompare] = useState<string[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [aList, pList] = await Promise.all([
        analysisService.getAnalyses(currentUser.id),
        photoJournalService.getPhotos(currentUser.id),
      ]);
      setAnalyses(aList);
      setPhotos(pList);

      if (aList.length >= 2) {
        setFirstAnalysisId(aList[aList.length - 1].id); // oldest as baseline
        setSecondAnalysisId(aList[0].id); // newest as comparison
      } else if (aList.length === 1) {
        setFirstAnalysisId(aList[0].id);
        setSecondAnalysisId(aList[0].id);
      }
    }
    loadData();
  }, [currentUser.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !consentChecked) return;

    const photo: ProgressPhoto = {
      id: `photo_${Date.now()}`,
      userId: currentUser.id,
      imagePath: newPhotoUrl.trim(),
      photoDate: newPhotoDate,
      notes: newPhotoNotes.trim(),
      lightingCondition: newPhotoLighting,
      createdAt: new Date().toISOString(),
    };

    await photoJournalService.savePhoto(photo);
    const updated = await photoJournalService.getPhotos(currentUser.id);
    setPhotos(updated);
    setPhotoModalOpen(false);
    setNewPhotoUrl('');
    setNewPhotoNotes('');
    setConsentChecked(false);
    showToast('Progress photograph added to private journal.');
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Delete this progress photograph from your private storage?')) {
      await photoJournalService.deletePhoto(currentUser.id, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhotosForCompare((prev) => prev.filter((id) => id !== photoId));
      showToast('Photo deleted.');
    }
  };

  const togglePhotoSelectForCompare = (photoId: string) => {
    if (selectedPhotosForCompare.includes(photoId)) {
      setSelectedPhotosForCompare(selectedPhotosForCompare.filter((id) => id !== photoId));
    } else {
      if (selectedPhotosForCompare.length >= 2) {
        setSelectedPhotosForCompare([selectedPhotosForCompare[1], photoId]);
      } else {
        setSelectedPhotosForCompare([...selectedPhotosForCompare, photoId]);
      }
    }
  };

  const firstAnalysis = analyses.find((a) => a.id === firstAnalysisId);
  const secondAnalysis = analyses.find((a) => a.id === secondAnalysisId);

  return (
    <div className="progress-page-viewport">
      <div className="progress-container">
        {/* Top Header */}
        <div className="progress-top-bar">
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
            className="btn-secondary-action"
            onClick={() => onNavigate('/skin-analysis')}
          >
            <Sparkles size={15} />
            <span>Take New Scan</span>
          </button>
        </div>

        {/* Page Hero Header */}
        <div className="progress-header-block">
          <div className="page-badge">
            <TrendingUp size={14} />
            <span>Longitudinal Skin Intelligence</span>
          </div>
          <h1 className="progress-title">Skin Progress &amp; Analysis History</h1>
          <p className="progress-subtitle">
            Observe biometric trends over time, compare historical optical scans side-by-side, and track voluntary private progress photos.
          </p>

          {/* Master Progress Navigation Tabs */}
          <div className="progress-view-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'timeline' ? 'view-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Layers size={16} />
              <span>Analysis Timeline</span>
            </button>

            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'comparison' ? 'view-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              <ArrowRightLeft size={16} />
              <span>Side-by-Side Comparison</span>
            </button>

            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'photos' ? 'view-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              <Camera size={16} />
              <span>Progress Photo Journal ({photos.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ANALYSIS TIMELINE & OBSERVATIONS */}
        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Reliability Disclosure */}
            <div className="progress-disclaimer-box">
              <Info size={16} className="text-royal-violet flex-shrink-0" />
              <p>
                <strong>Observation Calibration Notice:</strong> Facial appearance in photographs naturally varies based on lighting color temperature, ambient humidity, time of day, and hydration levels. Skinovate tracks verified optical observations without treating slight shifts as definitive clinical changes.
              </p>
            </div>

            {/* Analysis Chronological Records List */}
            <div className="analysis-history-stack">
              {analyses.map((rec, idx) => (
                <div key={rec.id} className="progress-record-card">
                  <div className="record-card-top-row">
                    <div className="record-date-block">
                      <Calendar size={16} className="text-royal-violet" />
                      <span className="record-date-str">
                        {new Date(rec.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {idx === 0 && <span className="latest-scan-badge">Latest Analysis</span>}
                    </div>

                    <div className="record-score-pill">
                      <span>Health Index:</span>
                      <strong>{rec.overallScore} / 100</strong>
                    </div>
                  </div>

                  {/* Summary & Tag */}
                  <div className="record-summary-line">
                    <span className="summary-condition-tag">
                      {rec.conditionTag || rec.skinConditionSummary || 'Optimal Biometric Calibration'}
                    </span>
                    <span className="model-spec-tag">Calibration: Optical Bio-Mesh v2.4</span>
                  </div>

                  {/* 6 Biometric Dimensions Grid */}
                  <div className="record-metrics-row">
                    {Object.entries(rec.metrics).map(([key, dim]: [string, MetricDimension]) => (
                      <div key={key} className="metric-chip">
                        <span className="metric-chip-name">{dim.name}</span>
                        <div className="metric-chip-val-wrap">
                          <strong className="metric-chip-score">{dim.score}</strong>
                          <span className="metric-chip-status">{dim.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Observations & Findings */}
                  {rec.keyFindings && rec.keyFindings.length > 0 && (
                    <div className="record-findings-block">
                      <span className="findings-header">Recorded Observations:</span>
                      <ul className="findings-bullet-list">
                        {rec.keyFindings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action link */}
                  <div className="record-footer-action">
                    <button
                      type="button"
                      className="btn-text-link"
                      onClick={() => onNavigate(`/analysis-results/${rec.id}`)}
                    >
                      <span>View Full Analytical Report</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {analyses.length === 0 && (
                <div className="journal-empty-card">
                  <Sparkles size={36} className="text-lavender mx-auto mb-2" />
                  <h3>No Completed Analyses Yet</h3>
                  <p>Complete your first optical scan to establish your biometric baseline.</p>
                  <button
                    type="button"
                    className="btn-primary-action mt-3"
                    onClick={() => onNavigate('/skin-analysis')}
                  >
                    Start Baseline Analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SIDE-BY-SIDE ANALYSIS COMPARISON */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Selector Bar */}
            <div className="comparison-selectors-card">
              <div className="selector-col">
                <label className="selector-label" htmlFor="first-scan-select">Select Baseline Scan (A):</label>
                <select
                  id="first-scan-select"
                  className="styled-select w-full"
                  value={firstAnalysisId}
                  onChange={(e) => setFirstAnalysisId(e.target.value)}
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.createdAt).toLocaleDateString()} — Score: {a.overallScore}/100 (#{a.id.slice(-6)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="comparison-vs-gem">
                <ArrowRightLeft size={18} className="text-royal-violet" />
              </div>

              <div className="selector-col">
                <label className="selector-label" htmlFor="second-scan-select">Select Comparison Scan (B):</label>
                <select
                  id="second-scan-select"
                  className="styled-select w-full"
                  value={secondAnalysisId}
                  onChange={(e) => setSecondAnalysisId(e.target.value)}
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.createdAt).toLocaleDateString()} — Score: {a.overallScore}/100 (#{a.id.slice(-6)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Side-by-Side Display */}
            {firstAnalysis && secondAnalysis ? (
              <div className="comparison-display-grid">
                {/* Column A */}
                <div className="compare-card">
                  <div className="compare-card-head">
                    <span className="compare-tag">Scan A (Baseline)</span>
                    <h3 className="compare-date">
                      {new Date(firstAnalysis.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>
                    <div className="compare-score-circle">
                      <strong>{firstAnalysis.overallScore}</strong>
                      <span>Health Index</span>
                    </div>
                  </div>

                  <div className="compare-metrics-list">
                    {Object.entries(firstAnalysis.metrics).map(([key, dim]: [string, MetricDimension]) => (
                      <div key={key} className="compare-metric-row">
                        <span className="compare-metric-name">{dim.name}</span>
                        <span className="compare-metric-score">{dim.score}/100</span>
                      </div>
                    ))}
                  </div>

                  <div className="compare-findings-box">
                    <h4>Recorded Findings:</h4>
                    <ul>
                      {firstAnalysis.keyFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Column B with Deltas */}
                <div className="compare-card compare-card--comparison">
                  <div className="compare-card-head">
                    <span className="compare-tag compare-tag--b">Scan B (Follow-up)</span>
                    <h3 className="compare-date">
                      {new Date(secondAnalysis.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>
                    <div className="compare-score-circle">
                      <strong>{secondAnalysis.overallScore}</strong>
                      <span>Health Index</span>
                    </div>
                  </div>

                  <div className="compare-metrics-list">
                    {Object.entries(secondAnalysis.metrics).map(([key, dimB]: [string, MetricDimension]) => {
                      const dimA = (firstAnalysis.metrics as any)[key] as MetricDimension | undefined;
                      const delta = dimA ? dimB.score - dimA.score : 0;

                      return (
                        <div key={key} className="compare-metric-row">
                          <span className="compare-metric-name">{dimB.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="compare-metric-score">{dimB.score}/100</span>
                            {delta !== 0 && (
                              <span
                                className={`delta-chip ${
                                  delta > 0 ? 'delta-chip--positive' : 'delta-chip--negative'
                                }`}
                              >
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="compare-findings-box">
                    <h4>Follow-up Observations:</h4>
                    <ul>
                      {secondAnalysis.keyFindings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Select two analyses above to compare.</p>
            )}

            {/* Scientific Reliability Notice */}
            <div className="progress-disclaimer-box mt-6">
              <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-900">
                <strong>Measurement Sensitivity Factors:</strong> Variations in ambient room lighting, focal distance, camera exposure, and post-cleansing timing between sessions can account for score differences of ±5 points. Consistency in measurement conditions provides the highest accuracy.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PROGRESS PHOTO JOURNAL */}
        {activeTab === 'photos' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="photo-journal-top-row">
              <div>
                <h3 className="photo-section-title">Private Progress Photograph Journal</h3>
                <p className="photo-section-sub">
                  Voluntary visual logs stored strictly in your authenticated private storage. Select any 2 photos to compare.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setPhotoModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add Progress Photo</span>
              </button>
            </div>

            {/* Selected Photo Comparison Side-by-Side if 2 selected */}
            {selectedPhotosForCompare.length === 2 && (
              <div className="photo-compare-banner">
                <div className="photo-compare-head">
                  <h4>Side-by-Side Photo Comparison</h4>
                  <button
                    type="button"
                    className="btn-clear-date"
                    onClick={() => setSelectedPhotosForCompare([])}
                  >
                    Close Comparison
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {selectedPhotosForCompare.map((id) => {
                    const photo = photos.find((p) => p.id === id);
                    if (!photo) return null;
                    return (
                      <div key={photo.id} className="compare-photo-frame">
                        <img src={photo.imagePath} alt="Progress comparison" className="compare-photo-img" />
                        <div className="compare-photo-meta">
                          <span>{photo.photoDate} &bull; {photo.lightingCondition}</span>
                          <p>{photo.notes || 'No notes logged.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Photos Grid */}
            <div className="photos-grid">
              {photos.map((photo) => {
                const isSelected = selectedPhotosForCompare.includes(photo.id);

                return (
                  <div key={photo.id} className="photo-card">
                    <div className="photo-frame">
                      <img src={photo.imagePath} alt={`Skin progress on ${photo.photoDate}`} className="photo-img" />
                      <button
                        type="button"
                        className={`btn-select-compare ${isSelected ? 'btn-select-compare--active' : ''}`}
                        onClick={() => togglePhotoSelectForCompare(photo.id)}
                        title={isSelected ? 'Remove from comparison' : 'Select for comparison'}
                      >
                        {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        <span>{isSelected ? 'Selected' : 'Compare'}</span>
                      </button>
                    </div>

                    <div className="photo-card-body">
                      <div className="photo-meta-row">
                        <span className="photo-date-badge">{photo.photoDate}</span>
                        <span className="photo-lighting-badge">{photo.lightingCondition}</span>
                      </div>
                      {photo.notes && <p className="photo-notes-text">{photo.notes}</p>}

                      <button
                        type="button"
                        className="btn-delete-photo"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2 size={13} />
                        <span>Delete Photo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {photos.length === 0 && (
              <div className="journal-empty-card">
                <Camera size={36} className="text-lavender mx-auto mb-2" />
                <h3>No Progress Photographs Logged</h3>
                <p>Upload voluntary selfies in natural daylight to observe changes over time.</p>
                <button
                  type="button"
                  className="btn-primary-action mt-3"
                  onClick={() => setPhotoModalOpen(true)}
                >
                  Add First Progress Photo
                </button>
              </div>
            )}

            {/* Add Photo Modal */}
            <AnimatePresence>
              {photoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    className="modal-backdrop-blur"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setPhotoModalOpen(false)}
                  />

                  <motion.div
                    className="journal-modal-card"
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  >
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-product-title">Add Voluntary Progress Photo</h3>
                        <p className="modal-subtext">Stored in your private, authenticated storage</p>
                      </div>
                      <button
                        type="button"
                        className="modal-close-btn"
                        onClick={() => setPhotoModalOpen(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSavePhoto} className="journal-form-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="photo-date-input">Photo Date</label>
                        <input
                          id="photo-date-input"
                          type="date"
                          className="form-text-input"
                          value={newPhotoDate}
                          onChange={(e) => setNewPhotoDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="photo-url-input">Photo Image URL or Data</label>
                        <input
                          id="photo-url-input"
                          type="text"
                          className="form-text-input"
                          placeholder="Paste image URL or data URI"
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="photo-lighting-select">Lighting Condition</label>
                        <select
                          id="photo-lighting-select"
                          className="styled-select w-full"
                          value={newPhotoLighting}
                          onChange={(e) => setNewPhotoLighting(e.target.value as any)}
                        >
                          <option value="Natural Daylight">Natural Daylight (Recommended)</option>
                          <option value="Indoor Soft">Indoor Soft Lighting</option>
                          <option value="Direct Flash">Direct Flash</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="photo-notes-input">Notes or Observational Context</label>
                        <textarea
                          id="photo-notes-input"
                          className="form-textarea"
                          rows={2}
                          placeholder="e.g. Taken 30 minutes after morning wash. Natural window light."
                          value={newPhotoNotes}
                          onChange={(e) => setNewPhotoNotes(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="checkbox-toggle-label text-xs">
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            required
                          />
                          <span>
                            I confirm voluntary consent to upload this photograph for private progress comparison. This photograph will never be shared publicly or used for unauthorized purposes.
                          </span>
                        </label>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setPhotoModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary-action"
                          disabled={!consentChecked || !newPhotoUrl.trim()}
                        >
                          Save Photo
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Global Toast */}
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
