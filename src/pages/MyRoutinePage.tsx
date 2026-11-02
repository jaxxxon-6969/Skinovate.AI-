import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ShieldCheck,
  Flame,
  Layers,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  Trash2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Smile,
  X,
  Compass,
  FlaskConical,
  Award,
} from 'lucide-react';
import {
  UserProfile,
  SkincareRoutine,
  RoutineStep,
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareProduct,
  DailySkinLogEntry,
} from '../types';
import {
  routineService,
  skinProfileService,
  analysisService,
} from '../lib/supabase';
import { ProductDiscovery } from '../components/ProductDiscovery';
import { IngredientIntelligenceView } from '../components/IngredientIntelligenceView';
import { checkRoutineConflicts } from '../lib/recommendationEngine';

interface MyRoutinePageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
  initialTab?: 'routine' | 'discovery' | 'ingredients';
}

export const MyRoutinePage: React.FC<MyRoutinePageProps> = ({
  currentUser,
  onNavigate,
  initialTab = 'routine',
}) => {
  const [viewTab, setViewTab] = useState<'routine' | 'discovery' | 'ingredients'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setViewTab(initialTab);
    }
  }, [initialTab]);

  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [profile, setProfile] = useState<SkinProfileData | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<SkinAnalysisRecord | null>(null);
  const [activePeriod, setActivePeriod] = useState<'AM' | 'PM'>('AM');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Swap product mode state
  const [swapTarget, setSwapTarget] = useState<{
    stepId: string;
    period: 'AM' | 'PM';
    currentProductName: string;
  } | null>(null);

  // Add custom step modal state
  const [addStepModalOpen, setAddStepModalOpen] = useState(false);
  const [newStepCategory, setNewStepCategory] = useState<any>('Treat / Serum');
  const [newStepName, setNewStepName] = useState('');
  const [newStepActives, setNewStepActives] = useState('');
  const [newStepDirections, setNewStepDirections] = useState('');

  // Daily Skin Note state
  const [dailyNoteModalOpen, setDailyNoteModalOpen] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<DailySkinLogEntry['feeling']>('Balanced & Calm');
  const [dailyNoteText, setDailyNoteText] = useState('');

  // Toast feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [routineData, profileData, analyses] = await Promise.all([
        routineService.getRoutine(currentUser.id),
        skinProfileService.getProfile(currentUser.id),
        analysisService.getAnalyses(currentUser.id),
      ]);
      setRoutine(routineData);
      setProfile(profileData);
      if (analyses.length > 0) {
        setLatestAnalysis(analyses[0]);
      }
    }
    loadData();
  }, [currentUser.id]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleToggle = async (period: 'AM' | 'PM', stepId: string) => {
    const updated = await routineService.toggleStep(currentUser.id, period, stepId);
    setRoutine(updated);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updated = await routineService.regenerateRoutine(currentUser.id);
      setRoutine(updated);
      showNotice('Regimen freshly compounded from your latest biometric scan!');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStartSwap = (step: RoutineStep, period: 'AM' | 'PM') => {
    setSwapTarget({
      stepId: step.id,
      period,
      currentProductName: step.productName,
    });
    setViewTab('discovery');
  };

  const handleExecuteSwap = async (newProduct: SkincareProduct) => {
    if (!swapTarget) return;
    const updated = await routineService.swapStepProduct(
      currentUser.id,
      swapTarget.period,
      swapTarget.stepId,
      newProduct
    );
    setRoutine(updated);
    setSwapTarget(null);
    setViewTab('routine');
    showNotice(`Swapped step with ${newProduct.name}`);
  };

  const handleAddProductFromCatalog = async (period: 'AM' | 'PM', product: SkincareProduct) => {
    const updated = await routineService.addCustomStep(currentUser.id, period, {
      category: product.category,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      activeIngredients: product.keyActives.join(', '),
      directions: product.applicationTip,
      compatibilityScore: product.rating * 20,
    });
    setRoutine(updated);
  };

  const handleCreateCustomStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    const updated = await routineService.addCustomStep(currentUser.id, activePeriod, {
      category: newStepCategory,
      productName: newStepName.trim(),
      activeIngredients: newStepActives.trim() || 'Custom Formulation',
      directions: newStepDirections.trim() || 'Apply evenly across face and neck.',
      customAdded: true,
    });
    setRoutine(updated);
    setAddStepModalOpen(false);
    setNewStepName('');
    setNewStepActives('');
    setNewStepDirections('');
    showNotice(`Added custom step to ${activePeriod} routine!`);
  };

  const handleDeleteStep = async (period: 'AM' | 'PM', stepId: string) => {
    const updated = await routineService.removeStep(currentUser.id, period, stepId);
    setRoutine(updated);
    showNotice('Step removed from routine.');
  };

  const handleSaveDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = await routineService.logDailyEntry(currentUser.id, {
      date: todayStr,
      feeling: selectedFeeling,
      note: dailyNoteText,
      completedAm: !!routine?.completedToday.am,
      completedPm: !!routine?.completedToday.pm,
    });
    setRoutine(updated);
    setDailyNoteModalOpen(false);
    setDailyNoteText('');
    showNotice('Daily skin journal entry saved!');
  };

  const currentSteps = activePeriod === 'AM' ? routine?.amSteps || [] : routine?.pmSteps || [];
  const completedCount = currentSteps.filter((s) => s.completed).length;
  const progressPercent = currentSteps.length > 0 ? (completedCount / currentSteps.length) * 100 : 0;
  const allCompletedInActive = currentSteps.length > 0 && completedCount === currentSteps.length;

  // Real-time conflict inspection on current routine steps
  const routineConflictCheck = checkRoutineConflicts(currentSteps);

  return (
    <div className="routine-page-viewport">
      <div className="routine-container">
        {/* Top Header Navigation */}
        <div className="routine-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-daily-log-pill"
              onClick={() => setDailyNoteModalOpen(true)}
              title="Log daily skin journal entry"
            >
              <Smile size={15} className="text-royal-violet" />
              <span>Log Skin Feeling</span>
            </button>

            <div className="streak-pill">
              <Flame size={15} className="text-amber-500 fill-amber-500" />
              <span>{routine?.streakDays || 4} Day Adherence Streak</span>
            </div>
          </div>
        </div>

        {/* Workspace Title & View Switcher */}
        <div className="routine-page-header">
          <div className="page-badge">
            <Sparkles size={14} />
            <span>Phase 3: Clinical Skincare Architecture</span>
          </div>
          <h1 className="routine-title">My Personalized Skincare Regimen</h1>
          <p className="routine-subtitle">
            Evidence-based daily protocols compounded specifically for your lipid barrier, circadian repair rhythm, and active biometrics.
          </p>

          {/* Master View Navigation Tabs */}
          <div className="routine-view-tabs">
            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'routine' ? 'view-tab-btn--active' : ''}`}
              onClick={() => {
                setViewTab('routine');
                setSwapTarget(null);
              }}
            >
              <Layers size={16} />
              <span>Daily Regimen Tracker</span>
            </button>

            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'discovery' ? 'view-tab-btn--active' : ''}`}
              onClick={() => setViewTab('discovery')}
            >
              <Compass size={16} />
              <span>Product Discovery &amp; Catalog</span>
            </button>

            <button
              type="button"
              className={`view-tab-btn ${viewTab === 'ingredients' ? 'view-tab-btn--active' : ''}`}
              onClick={() => {
                setViewTab('ingredients');
                setSwapTarget(null);
              }}
            >
              <FlaskConical size={16} />
              <span>Active Synergies &amp; Guide</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DAILY ROUTINE TRACKER */}
        {viewTab === 'routine' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Condition Alert Banners from Biometric Analysis */}
            {routine?.conditionAlerts && routine.conditionAlerts.length > 0 && (
              <div className="condition-alerts-stack">
                {routine.conditionAlerts.map((alert) => (
                  <div key={alert.id} className={`condition-alert-banner condition-alert-banner--${alert.type}`}>
                    <div className="alert-content">
                      <div className="alert-header">
                        <AlertTriangle size={15} />
                        <strong>{alert.metricTrigger}:</strong>
                      </div>
                      <p>{alert.message}</p>
                      <span className="alert-action-tip">
                        <em>Recommended Adaptation:</em> {alert.suggestedAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Conflict Warning if detected */}
            {routineConflictCheck.hasConflict && (
              <div className="routine-conflict-warning">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                <div>
                  <strong>Potential Active Formulation Conflict Detected:</strong>
                  <ul className="list-disc pl-5 mt-1 text-xs text-amber-800">
                    {routineConflictCheck.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AM / PM Selector & Actions Bar */}
            <div className="routine-period-bar">
              <div className="routine-period-tabs">
                <button
                  type="button"
                  className={`period-tab-btn ${activePeriod === 'AM' ? 'period-tab-btn--active-am' : ''}`}
                  onClick={() => setActivePeriod('AM')}
                >
                  <Sun size={18} className={activePeriod === 'AM' ? 'text-amber-500' : ''} />
                  <span>Morning Regimen (AM)</span>
                  {routine?.completedToday.am && (
                    <span className="tab-done-check">
                      <CheckCircle2 size={13} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`period-tab-btn ${activePeriod === 'PM' ? 'period-tab-btn--active-pm' : ''}`}
                  onClick={() => setActivePeriod('PM')}
                >
                  <Moon size={18} className={activePeriod === 'PM' ? 'text-indigo-400' : ''} />
                  <span>Evening Regimen (PM)</span>
                  {routine?.completedToday.pm && (
                    <span className="tab-done-check">
                      <CheckCircle2 size={13} />
                    </span>
                  )}
                </button>
              </div>

              <div className="routine-actions-group">
                <button
                  type="button"
                  className="btn-add-step"
                  onClick={() => setAddStepModalOpen(true)}
                >
                  <Plus size={15} />
                  <span>Add Step</span>
                </button>

                <button
                  type="button"
                  className="btn-regenerate-routine"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  title="Re-run compounding engine based on your profile & latest scan"
                >
                  <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                  <span>{isRegenerating ? 'Calibrating...' : 'Regenerate Plan'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Adherence Status */}
            <div className="routine-status-banner">
              <div className="status-progress-info">
                <span className="status-label">
                  {activePeriod === 'AM' ? 'Morning' : 'Evening'} Steps Completed:
                </span>
                <strong>
                  {completedCount} of {currentSteps.length} ({Math.round(progressPercent)}%)
                </strong>
              </div>
              <div className="status-bar-track">
                <div
                  className="status-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {allCompletedInActive && (
                <div className="celebration-pill">
                  <Award size={14} className="text-amber-500" />
                  <span>All {activePeriod} steps fulfilled for today! Stratum corneum protected.</span>
                </div>
              )}
            </div>

            {/* Interactive Steps List */}
            <div className="routine-steps-container">
              {currentSteps.map((step) => {
                const isExpanded = expandedStepId === step.id;

                return (
                  <motion.div
                    key={step.id}
                    className={`routine-step-card ${step.completed ? 'routine-step-card--completed' : ''}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="step-card-main-row">
                      {/* Checkbox */}
                      <button
                        type="button"
                        className="step-check-button"
                        onClick={() => handleToggle(activePeriod, step.id)}
                        aria-label={step.completed ? 'Mark step incomplete' : 'Mark step complete'}
                      >
                        {step.completed ? (
                          <CheckCircle2 size={26} className="text-emerald-500 fill-emerald-100" />
                        ) : (
                          <Circle size={26} className="text-gray-300 hover:text-royal-violet transition-colors" />
                        )}
                      </button>

                      {/* Main Details */}
                      <div className="step-main-details flex-1">
                        <div className="step-tag-row">
                          <span className="step-order-badge">Step {step.order}</span>
                          <span className="step-category-badge">{step.category}</span>
                          {step.brand && <span className="step-brand-tag">{step.brand}</span>}
                          {step.compatibilityScore && (
                            <span className="step-score-mini">
                              <Sparkles size={11} />
                              {step.compatibilityScore}% Match
                            </span>
                          )}
                          {step.waitTimeMinutes ? (
                            <span className="step-wait-time">
                              <Clock size={11} /> Wait {step.waitTimeMinutes} min
                            </span>
                          ) : null}
                        </div>

                        <h3 className="step-product-name">{step.productName}</h3>
                        <p className="step-directions">{step.directions}</p>

                        <div className="step-actives-pill">
                          <strong>Active Matrix:</strong> {step.activeIngredients}
                        </div>
                      </div>

                      {/* Card Action Controls: Swap, Expand, Delete */}
                      <div className="step-right-controls">
                        <button
                          type="button"
                          className="btn-step-icon-action"
                          onClick={() => handleStartSwap(step, activePeriod)}
                          title="Swap product with alternative from catalog"
                        >
                          <ArrowRightLeft size={15} />
                          <span className="sr-only">Swap Product</span>
                        </button>

                        <button
                          type="button"
                          className="btn-step-icon-action"
                          onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          title={isExpanded ? 'Hide clinical details' : 'Show clinical details'}
                        >
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {step.customAdded && (
                          <button
                            type="button"
                            className="btn-step-icon-action btn-step-delete"
                            onClick={() => handleDeleteStep(activePeriod, step.id)}
                            title="Remove custom step"
                          >
                            <Trash2 size={14} className="text-rose-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Clinical Protocol Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="step-expanded-protocol"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="protocol-inner">
                            <div className="protocol-item">
                              <span className="protocol-label">Dermatological Technique:</span>
                              <p>{step.applicationTip || 'Apply evenly onto clean skin with light pressing motions until fully absorbed.'}</p>
                            </div>

                            {step.conflictWarning && (
                              <div className="protocol-warning">
                                <AlertTriangle size={14} className="text-amber-500" />
                                <span>{step.conflictWarning}</span>
                              </div>
                            )}

                            <div className="protocol-actions">
                              <button
                                type="button"
                                className="btn-swap-text-link"
                                onClick={() => handleStartSwap(step, activePeriod)}
                              >
                                <ArrowRightLeft size={13} />
                                <span>Find alternative for Step {step.order} ({step.category})</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Advisory Box */}
            <div className="routine-advisory-box">
              <ShieldCheck size={18} className="text-royal-violet flex-shrink-0" />
              <p>
                All formulations are compounded in synchronization with your circadian cellular turnover. Morning focuses on antioxidant defense and barrier shielding (SPF), while evening prioritizes cellular repair, gentle keratolysis, and lipid regeneration.
              </p>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: PRODUCT DISCOVERY */}
        {viewTab === 'discovery' && (
          <ProductDiscovery
            currentUser={currentUser}
            profile={profile}
            latestAnalysis={latestAnalysis}
            onAddToRoutine={handleAddProductFromCatalog}
            onSwapProduct={handleExecuteSwap}
            swapMode={swapTarget}
            onCancelSwap={() => setSwapTarget(null)}
          />
        )}

        {/* VIEW 3: INGREDIENT INTELLIGENCE */}
        {viewTab === 'ingredients' && (
          <IngredientIntelligenceView
            profile={profile}
            latestAnalysis={latestAnalysis}
          />
        )}

        {/* Add Custom Step Modal */}
        <AnimatePresence>
          {addStepModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="modal-backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddStepModalOpen(false)}
              />

              <motion.div
                className="custom-step-modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
              >
                <div className="modal-header">
                  <div>
                    <h3 className="modal-product-title">Add Custom Step to {activePeriod} Routine</h3>
                    <p className="modal-subtext">Add your own preferred product or targeted serum</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setAddStepModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomStep} className="custom-step-form">
                  <div className="form-group">
                    <label className="form-label">Step Category</label>
                    <select
                      className="styled-select w-full"
                      value={newStepCategory}
                      onChange={(e) => setNewStepCategory(e.target.value)}
                    >
                      <option value="Cleanse">Cleanse</option>
                      <option value="Tone / Essence">Tone / Essence</option>
                      <option value="Treat / Serum">Treat / Serum</option>
                      <option value="Moisturize">Moisturize</option>
                      <option value="Protect (SPF)">Protect (SPF)</option>
                      <option value="Night Recovery">Night Recovery</option>
                      <option value="Eye Care">Eye Care</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-text-input"
                      placeholder="e.g. SkinCeuticals CE Ferulic or Cerave PM"
                      value={newStepName}
                      onChange={(e) => setNewStepName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Key Actives</label>
                    <input
                      type="text"
                      className="form-text-input"
                      placeholder="e.g. 15% L-Ascorbic Acid, Vitamin E"
                      value={newStepActives}
                      onChange={(e) => setNewStepActives(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Application Directions</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Press 3 drops onto clean face, avoid eye area."
                      value={newStepDirections}
                      onChange={(e) => setNewStepDirections(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setAddStepModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Add to {activePeriod} Routine
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Daily Skin Log Modal */}
        <AnimatePresence>
          {dailyNoteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="modal-backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDailyNoteModalOpen(false)}
              />

              <motion.div
                className="custom-step-modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
              >
                <div className="modal-header">
                  <div>
                    <h3 className="modal-product-title">Daily Skin Journal</h3>
                    <p className="modal-subtext">Track how your skin feels in response to your active routine</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setDailyNoteModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveDailyLog} className="custom-step-form">
                  <div className="form-group">
                    <label className="form-label">How does your skin feel today?</label>
                    <div className="feelings-selector-grid">
                      {(['Glowing & Plump', 'Balanced & Calm', 'Mild Dryness', 'Oily Shine', 'Sensitive / Red'] as const).map(
                        (feeling) => (
                          <button
                            key={feeling}
                            type="button"
                            className={`feeling-choice-btn ${
                              selectedFeeling === feeling ? 'feeling-choice-btn--active' : ''
                            }`}
                            onClick={() => setSelectedFeeling(feeling)}
                          >
                            <span>{feeling}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes or Reactions</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="e.g. Skin felt deeply hydrated all day, slight tingling after retinoid step."
                      value={dailyNoteText}
                      onChange={(e) => setDailyNoteText(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setDailyNoteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Save Journal Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Action Toast Notification */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              className="routine-action-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
