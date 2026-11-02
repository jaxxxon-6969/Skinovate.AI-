import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FlaskConical,
  BookOpen,
  Info,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  UserProfile,
  PersonalizedInsight,
  SkinProfileData,
  SkinAnalysisRecord,
} from '../types';
import {
  insightsService,
  skinProfileService,
  analysisService,
} from '../lib/supabase';

interface SkinInsightsPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const SkinInsightsPage: React.FC<SkinInsightsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [profile, setProfile] = useState<SkinProfileData | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<SkinAnalysisRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [insList, pData, aList] = await Promise.all([
          insightsService.generatePersonalizedInsights(currentUser.id),
          skinProfileService.getProfile(currentUser.id),
          analysisService.getAnalyses(currentUser.id),
        ]);
        setInsights(insList);
        setProfile(pData);
        if (aList.length > 0) setLatestAnalysis(aList[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser.id]);

  const filteredInsights = filterCategory === 'all'
    ? insights
    : insights.filter((i) => i.category === filterCategory);

  return (
    <div className="insights-page-viewport">
      <div className="insights-container">
        {/* Top Bar */}
        <div className="insights-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="insights-header-block">
          <div className="page-badge">
            <Sparkles size={14} />
            <span>Personalized Biological Insights</span>
          </div>
          <h1 className="insights-title">AI Skincare Intelligence &amp; Insights</h1>
          <p className="insights-subtitle">
            Dermatological explanations compounded exclusively from your verified profile preferences, optical biometric scans, and daily routine adherence logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="insights-filter-pills">
          {[
            { id: 'all', label: 'All Verified Insights' },
            { id: 'barrier', label: 'Lipid Barrier' },
            { id: 'routine_consistency', label: 'Consistency' },
            { id: 'hydration', label: 'Hydration Trends' },
            { id: 'ingredient_synergy', label: 'Active Synergies' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`insight-pill ${filterCategory === cat.id ? 'insight-pill--active' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Insights Cards List */}
        <div className="insights-cards-stack">
          {filteredInsights.map((insight) => (
            <motion.div
              key={insight.id}
              className="personalized-insight-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="insight-card-top">
                <span className={`insight-category-badge badge-${insight.category}`}>
                  {insight.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="insight-date">
                  {new Date(insight.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h3 className="insight-title-text">{insight.title}</h3>
              <p className="insight-explanation">{insight.explanation}</p>

              {/* Supporting Data & Action */}
              <div className="insight-supporting-box">
                <div className="supporting-data-item">
                  <span className="support-label">Supporting User Evidence:</span>
                  <p>{insight.supportingUserData}</p>
                </div>

                <div className="supporting-data-item">
                  <span className="support-label text-royal-violet">Recommended Cosmetic Action:</span>
                  <p>{insight.suggestedAction}</p>
                </div>
              </div>

              {/* Confidence / Limitation Statement */}
              <div className="insight-confidence-footer">
                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                <span><strong>Limitation &amp; Grounding:</strong> {insight.confidenceStatement}</span>
              </div>
            </motion.div>
          ))}

          {filteredInsights.length === 0 && !loading && (
            <div className="journal-empty-card">
              <Sparkles size={36} className="text-lavender mx-auto mb-2" />
              <h3>No Insights Available for this Category</h3>
              <p>Complete your daily journal entries or a new skin scan to unlock further insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
