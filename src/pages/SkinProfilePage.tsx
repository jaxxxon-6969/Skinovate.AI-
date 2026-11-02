import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  User,
  Sliders,
  Shield,
  Droplets,
  Sun,
  Heart,
  Save,
} from 'lucide-react';
import {
  UserProfile,
  SkinProfileData,
  SkinType,
  SkinConcern,
  SkincareGoal,
} from '../types';
import { skinProfileService } from '../lib/supabase';

interface SkinProfilePageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const SkinProfilePage: React.FC<SkinProfilePageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState(currentUser.fullName);
  const [ageRange, setAgeRange] = useState('25-34');
  const [skinType, setSkinType] = useState<SkinType>('Combination');
  const [primaryConcerns, setPrimaryConcerns] = useState<SkinConcern[]>([
    'Pore Texture & Congestion',
    'Dehydration & Dullness',
  ]);
  const [primaryGoal, setPrimaryGoal] = useState<SkincareGoal>('Restore Skin Barrier');
  const [sunExposure, setSunExposure] = useState<'High (Outdoors)' | 'Moderate' | 'Low (Indoors)'>('Moderate');
  const [waterIntake, setWaterIntake] = useState('6-8 glasses / day');
  const [climate, setClimate] = useState<'Dry/Arid' | 'Humid' | 'Temperate' | 'Cold'>('Temperate');
  const [sensitivityLevel, setSensitivityLevel] = useState<'Low' | 'Moderate' | 'High (Reactive)'>('Moderate');
  const [budgetPreference, setBudgetPreference] = useState<'budget' | 'mid' | 'luxury' | 'flexible'>('flexible');
  const [productPreferences, setProductPreferences] = useState<string[]>(['Fragrance-Free']);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const data = await skinProfileService.getProfile(currentUser.id);
      if (data) {
        setDisplayName(data.displayName || currentUser.fullName);
        setAgeRange(data.ageRange || '25-34');
        setSkinType(data.skinType || 'Combination');
        setPrimaryConcerns(data.primaryConcerns || []);
        setPrimaryGoal(data.primaryGoal || 'Restore Skin Barrier');
        setSunExposure(data.sunExposure || 'Moderate');
        setWaterIntake(data.waterIntake || '6-8 glasses / day');
        setClimate(data.climate || 'Temperate');
        setSensitivityLevel(data.sensitivityLevel || 'Moderate');
        if (data.budgetPreference) setBudgetPreference(data.budgetPreference);
        if (data.productPreferences) setProductPreferences(data.productPreferences);
      }
    }
    loadExisting();
  }, [currentUser]);

  const skinTypesList: { id: SkinType; label: string; desc: string }[] = [
    {
      id: 'Oily',
      label: 'Oily',
      desc: 'Excess shine across whole face, enlarged pores, prone to blackheads',
    },
    {
      id: 'Dry',
      label: 'Dry',
      desc: 'Tight feeling after cleansing, flaking, rough texture, lacks natural oils',
    },
    {
      id: 'Combination',
      label: 'Combination',
      desc: 'Oily T-zone (forehead, nose, chin) while cheeks are normal or dry',
    },
    {
      id: 'Normal',
      label: 'Normal / Balanced',
      desc: 'Even sebum balance, smooth texture, not overly oily or dry',
    },
    {
      id: 'Sensitive',
      label: 'Sensitive',
      desc: 'Easily reddened, reactive to active ingredients, stinging sensations',
    },
  ];

  const concernsList: SkinConcern[] = [
    'Acne & Blemishes',
    'Pore Texture & Congestion',
    'Hyperpigmentation & Sun Spots',
    'Fine Lines & Wrinkles',
    'Sensitivity & Redness',
    'Dehydration & Dullness',
    'Loss of Elasticity',
    'Dark Circles & Eye Puffiness',
  ];

  const goalsList: { goal: SkincareGoal; desc: string }[] = [
    {
      goal: 'Restore Skin Barrier',
      desc: 'Rebuild intercellular lipids, eliminate stinging and seal in moisture',
    },
    {
      goal: 'Clear & Prevent Breakouts',
      desc: 'Regulate sebum oxidation, clear micro-comedones and soothe swelling',
    },
    {
      goal: 'Hydrate & Plump Epidermis',
      desc: 'Replenish trans-epidermal moisture reservoirs with multi-weight humectants',
    },
    {
      goal: 'Smooth Texture & Minimize Pores',
      desc: 'Gentle cell renewal to refine skin grain and visible pore circumference',
    },
    {
      goal: 'Brighten & Even Tone',
      desc: 'Inhibit tyrosinase activity to fade post-acne marks and UV photoaging',
    },
    {
      goal: 'Calm Redness & Reactivity',
      desc: 'Strengthen micro-capillaries and reduce erythema triggers with botanicals',
    },
    {
      goal: 'Anti-Aging & Cellular Defense',
      desc: 'Stimulate collagen synthesis and defend against reactive oxygen species',
    },
  ];

  const toggleConcern = (concern: SkinConcern) => {
    if (primaryConcerns.includes(concern)) {
      setPrimaryConcerns(primaryConcerns.filter((c) => c !== concern));
    } else {
      setPrimaryConcerns([...primaryConcerns, concern]);
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    const profileData: SkinProfileData = {
      userId: currentUser.id,
      displayName: displayName.trim() || currentUser.fullName,
      ageRange,
      skinType,
      primaryConcerns,
      primaryGoal,
      sunExposure,
      waterIntake,
      climate,
      sensitivityLevel,
      budgetPreference,
      productPreferences,
      updatedAt: new Date().toISOString(),
    };

    await skinProfileService.saveProfile(profileData);
    setIsSaving(false);
    setIsSaved(true);

    setTimeout(() => {
      onNavigate('/dashboard');
    }, 800);
  };

  return (
    <div className="profile-questionnaire-viewport">
      <div className="questionnaire-container">
        {/* Top Header */}
        <div className="questionnaire-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>

          <div className="steps-progress-pill">
            <span>Step {currentStep} of 5</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Stage */}
        <div className="questionnaire-card">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="step-pane"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="step-header">
                  <div className="step-badge">
                    <User size={14} />
                    <span>Step 1: Basic Information</span>
                  </div>
                  <h1 className="step-title">Welcome, tell us about yourself</h1>
                  <p className="step-subtitle">
                    Your baseline details help us calibrate age-dependent epidermal turnover rates.
                  </p>
                </div>

                <div className="form-fields-group">
                  <div className="field-item">
                    <label className="field-label" htmlFor="dispName">
                      Your Preferred Name / Title
                    </label>
                    <input
                      id="dispName"
                      type="text"
                      className="text-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                    />
                  </div>

                  <div className="field-item">
                    <label className="field-label">Age Range</label>
                    <div className="options-selector-grid">
                      {['Under 18', '18 - 24', '25 - 34', '35 - 44', '45 - 54', '55+'].map((age) => (
                        <button
                          key={age}
                          type="button"
                          className={`option-btn ${ageRange === age ? 'option-btn--active' : ''}`}
                          onClick={() => setAgeRange(age)}
                        >
                          <span>{age}</span>
                          {ageRange === age && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Skin Type */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="step-pane"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="step-header">
                  <div className="step-badge">
                    <Droplets size={14} />
                    <span>Step 2: Skin Type</span>
                  </div>
                  <h1 className="step-title">How does your skin feel mid-day?</h1>
                  <p className="step-subtitle">
                    Select the option that best reflects your natural untreated skin physiology.
                  </p>
                </div>

                <div className="skin-types-list">
                  {skinTypesList.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`skin-type-card ${skinType === type.id ? 'skin-type-card--active' : ''}`}
                      onClick={() => setSkinType(type.id)}
                    >
                      <div className="skin-type-meta">
                        <span className="type-title">{type.label}</span>
                        <p className="type-desc">{type.desc}</p>
                      </div>
                      <div className="radio-dot">
                        {skinType === type.id && <div className="radio-dot-inner" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Skin Concerns */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="step-pane"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="step-header">
                  <div className="step-badge">
                    <Shield size={14} />
                    <span>Step 3: Primary Concerns</span>
                  </div>
                  <h1 className="step-title">What would you like to target?</h1>
                  <p className="step-subtitle">
                    Select all areas where you want targeted clinical active ingredients.
                  </p>
                </div>

                <div className="concerns-multi-grid">
                  {concernsList.map((concern) => {
                    const isSelected = primaryConcerns.includes(concern);
                    return (
                      <button
                        key={concern}
                        type="button"
                        className={`concern-toggle-card ${isSelected ? 'concern-toggle-card--selected' : ''}`}
                        onClick={() => toggleConcern(concern)}
                      >
                        <div className="concern-check-box">
                          {isSelected ? <Check size={14} /> : null}
                        </div>
                        <span className="concern-text">{concern}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Lifestyle & Climate */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                className="step-pane"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="step-header">
                  <div className="step-badge">
                    <Sun size={14} />
                    <span>Step 4: Lifestyle &amp; Environment</span>
                  </div>
                  <h1 className="step-title">Your daily surroundings</h1>
                  <p className="step-subtitle">
                    UV exposure, ambient humidity, and water intake heavily influence lipid barrier resilience.
                  </p>
                </div>

                <div className="lifestyle-grid">
                  <div className="lifestyle-block">
                    <label className="field-label">Daily Sun &amp; Outdoor Exposure</label>
                    <div className="options-selector-grid">
                      {(['High (Outdoors)', 'Moderate', 'Low (Indoors)'] as const).map((sun) => (
                        <button
                          key={sun}
                          type="button"
                          className={`option-btn ${sunExposure === sun ? 'option-btn--active' : ''}`}
                          onClick={() => setSunExposure(sun)}
                        >
                          <span>{sun}</span>
                          {sunExposure === sun && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lifestyle-block">
                    <label className="field-label">Local Climate</label>
                    <div className="options-selector-grid">
                      {(['Dry/Arid', 'Humid', 'Temperate', 'Cold'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`option-btn ${climate === c ? 'option-btn--active' : ''}`}
                          onClick={() => setClimate(c)}
                        >
                          <span>{c}</span>
                          {climate === c && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lifestyle-block">
                    <label className="field-label">Skin Sensitivity Threshold</label>
                    <div className="options-selector-grid">
                      {(['Low', 'Moderate', 'High (Reactive)'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className={`option-btn ${sensitivityLevel === lvl ? 'option-btn--active' : ''}`}
                          onClick={() => setSensitivityLevel(lvl)}
                        >
                          <span>{lvl}</span>
                          {sensitivityLevel === lvl && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Skincare Goals */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                className="step-pane"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="step-header">
                  <div className="step-badge">
                    <Heart size={14} />
                    <span>Step 5: Primary Skincare Goal</span>
                  </div>
                  <h1 className="step-title">What is your ultimate objective?</h1>
                  <p className="step-subtitle">
                    This determines the core active ingredient families in your AM/PM routine compounding.
                  </p>
                </div>

                <div className="goals-cards-list">
                  {goalsList.map((g) => (
                    <button
                      key={g.goal}
                      type="button"
                      className={`goal-card ${primaryGoal === g.goal ? 'goal-card--active' : ''}`}
                      onClick={() => setPrimaryGoal(g.goal)}
                    >
                      <div className="goal-info">
                        <span className="goal-title">{g.goal}</span>
                        <p className="goal-desc">{g.desc}</p>
                      </div>
                      <div className="goal-radio">
                        {primaryGoal === g.goal && <Check size={16} />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Formulation & Budget Preferences */}
                <div className="profile-preferences-section mt-6 pt-6 border-t border-purple-100">
                  <h3 className="text-sm font-semibold text-charcoal mb-2">Formulation &amp; Price Tier Preference</h3>
                  <p className="text-xs text-gray-500 mb-3">Customizes recommendation scores in the Product Discovery catalog.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { id: 'flexible', label: 'Flexible / All' },
                      { id: 'budget', label: '$ Budget (<$30)' },
                      { id: 'mid', label: '$$ Mid-tier ($30-$45)' },
                      { id: 'luxury', label: '$$$ Luxury ($45+)' },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        className={`option-btn ${budgetPreference === tier.id ? 'option-btn--active' : ''}`}
                        onClick={() => setBudgetPreference(tier.id as any)}
                      >
                        <span>{tier.label}</span>
                        {budgetPreference === tier.id && <Check size={13} />}
                      </button>
                    ))}
                  </div>

                  <label className="text-xs font-semibold text-charcoal block mb-2">Formulation Cleanliness Badges</label>
                  <div className="flex flex-wrap gap-2">
                    {['Fragrance-Free', 'Essential Oil-Free', 'Alcohol-Free', 'Vegan', 'Cruelty-Free'].map((pref) => {
                      const isSelected = productPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          className={`filter-active-tag ${isSelected ? 'filter-active-tag--active' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setProductPreferences(productPreferences.filter((p) => p !== pref));
                            } else {
                              setProductPreferences([...productPreferences, pref]);
                            }
                          }}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="questionnaire-nav-row">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-step-back"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              >
                <ArrowLeft size={16} />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                className="btn-step-next"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-save-profile"
                onClick={handleSaveAndContinue}
                disabled={isSaving || isSaved}
              >
                {isSaving ? (
                  <span>Saving Profile...</span>
                ) : isSaved ? (
                  <>
                    <Check size={16} />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save &amp; Return to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
