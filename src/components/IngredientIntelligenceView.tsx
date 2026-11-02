import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  FlaskConical,
  Sun,
  Moon,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ACTIVE_INGREDIENTS_LIBRARY,
} from '../lib/recommendationEngine';
import { SkinProfileData, SkinAnalysisRecord, IngredientIntelligence } from '../types';

interface IngredientIntelligenceViewProps {
  profile: SkinProfileData | null;
  latestAnalysis: SkinAnalysisRecord | null;
}

export const IngredientIntelligenceView: React.FC<IngredientIntelligenceViewProps> = ({
  profile,
  latestAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<IngredientIntelligence | null>(null);

  const categories = [
    'All',
    'Antioxidant',
    'Hydrator / Humectant',
    'Barrier Lipid',
    'Cell Turnover / Retinoid',
    'Exfoliant / Acid',
    'Soothing / Anti-inflammatory',
    'Sebum Regulator',
  ];

  const filteredActives = ACTIVE_INGREDIENTS_LIBRARY.filter((act) => {
    if (selectedCategory !== 'All' && act.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = act.name.toLowerCase().includes(q);
      const matchInci = act.inciName.toLowerCase().includes(q);
      const matchRole = act.role.toLowerCase().includes(q);
      const matchConcerns = act.targetConcerns.some((c) => c.toLowerCase().includes(q));
      if (!matchName && !matchInci && !matchRole && !matchConcerns) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="ingredient-intelligence-section">
      {/* Header Banner */}
      <div className="intelligence-header">
        <div className="page-badge">
          <FlaskConical size={14} />
          <span>Biochemical Formulations</span>
        </div>
        <h2 className="intelligence-title">Ingredient Intelligence &amp; Synergies</h2>
        <p className="intelligence-subtext">
          Explore evidence-based dermatology mechanisms, synergistic active pairings, and critical contraindications to protect your stratum corneum.
        </p>
      </div>

      {/* Clinical Synergy Matrix Highlight */}
      <div className="synergy-matrix-grid">
        <div className="synergy-card synergy-card--beneficial">
          <div className="synergy-card-header">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h3>Gold-Standard Synergies</h3>
          </div>
          <p className="synergy-card-intro">
            Actives that enhance each other’s bio-availability and clinical efficacy when paired:
          </p>
          <ul className="synergy-list">
            <li>
              <strong>Vitamin C + Ferulic Acid + Vitamin E:</strong> Ferulic acid doubles photoprotection and quadruples L-Ascorbic acid chemical stability.
            </li>
            <li>
              <strong>Niacinamide + Zinc PCA:</strong> Regulates excess sebum while suppressing post-inflammatory erythema (PIE).
            </li>
            <li>
              <strong>Retinaldehyde + Ceramides (3:1:1):</strong> Ceramides cushion the skin matrix, eliminating retinoid-induced peeling and redness.
            </li>
            <li>
              <strong>Centella Asiatica + Azelaic Acid:</strong> Down-regulates kallikrein-5 and vascular flushing in rosacea-prone skin.
            </li>
          </ul>
        </div>

        <div className="synergy-card synergy-card--contraindication">
          <div className="synergy-card-header">
            <ShieldAlert size={18} className="text-amber-500" />
            <h3>Critical Contraindications</h3>
          </div>
          <p className="synergy-card-intro">
            Active pairings that should NEVER be layered in the same routine session:
          </p>
          <ul className="synergy-list">
            <li>
              <strong className="text-amber-700">Retinoids + Direct Glycolic/Salicylic Acid:</strong> Combining in the same PM step increases trans-epidermal water loss (TEWL) and barrier disruption. Alternate nights.
            </li>
            <li>
              <strong className="text-amber-700">Pure Vitamin C + Copper Peptides:</strong> Copper oxidizes ascorbic acid, causing both actives to decompose and lose antioxidant capacity.
            </li>
            <li>
              <strong className="text-amber-700">Benzoyl Peroxide + Pure L-Ascorbic Acid:</strong> Potent oxidizing agent neutralizes Vitamin C immediately upon contact.
            </li>
          </ul>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="intelligence-toolbar">
        <div className="discovery-search-wrapper flex-1">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="discovery-search-input"
            placeholder="Search active ingredient by name, INCI, or concern (e.g. Hyaluronic, Niacinamide, Redness)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="select-control-wrap">
          <select
            className="styled-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Active Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actives Cards Grid */}
      <div className="actives-directory-grid">
        {filteredActives.map((act) => (
          <motion.div
            key={act.id}
            className="active-intel-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="active-intel-top">
              <span className="active-cat-badge">{act.category}</span>
              <div className="active-timing-chip">
                {act.timeOfDay === 'AM' && <Sun size={12} className="text-amber-500" />}
                {act.timeOfDay === 'PM' && <Moon size={12} className="text-indigo-400" />}
                {act.timeOfDay === 'Both' && <Sparkles size={12} className="text-royal-violet" />}
                <span>{act.timeOfDay}</span>
              </div>
            </div>

            <h3 className="active-intel-name">{act.name}</h3>
            <span className="active-inci-name">INCI: {act.inciName}</span>

            <p className="active-intel-role">{act.role}</p>

            <div className="active-metric-specs">
              <div className="spec-item">
                <span className="spec-label">Optimal Strength:</span>
                <strong>{act.optimalConcentration}</strong>
              </div>
            </div>

            {/* Synergies */}
            <div className="active-synergies-block">
              <span className="synergy-label">
                <CheckCircle2 size={13} className="text-emerald-500 inline mr-1" />
                Proven Synergies:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {act.synergies.map((syn) => (
                  <span key={syn} className="synergy-pill synergy-pill--good">
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            {/* Avoid With */}
            {act.avoidWith.length > 0 && (
              <div className="active-avoids-block">
                <span className="synergy-label text-rose-700">
                  <XCircle size={13} className="text-rose-500 inline mr-1" />
                  Avoid Layering With:
                </span>
                <ul className="avoid-list">
                  {act.avoidWith.map((av, idx) => (
                    <li key={idx}>{av}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
