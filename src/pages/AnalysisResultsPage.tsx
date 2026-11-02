import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplets,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight,
  RefreshCw,
  Printer,
  Sliders,
  Calendar,
} from 'lucide-react';
import { UserProfile, SkinAnalysisRecord } from '../types';
import { analysisService } from '../lib/supabase';

interface AnalysisResultsPageProps {
  analysisId: string;
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const AnalysisResultsPage: React.FC<AnalysisResultsPageProps> = ({
  analysisId,
  currentUser,
  onNavigate,
}) => {
  const [record, setRecord] = useState<SkinAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecord() {
      const data = await analysisService.getAnalysisById(analysisId);
      setRecord(data);
      setLoading(false);
    }
    loadRecord();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="results-loading-state">
        <Sparkles size={32} className="animate-pulse text-royal-violet" />
        <p>Loading biometric diagnostic report...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="results-not-found-state">
        <AlertTriangle size={36} className="text-amber-500" />
        <h2>Analysis Report Not Found</h2>
        <p>We could not locate this analysis record in your profile.</p>
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => onNavigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const metricList = Object.values(record.metrics);

  return (
    <div className="analysis-results-viewport">
      <div className="results-container">
        {/* Top Header */}
        <div className="results-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="results-meta-pill">
            <Calendar size={14} />
            <span>
              {new Date(record.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="results-action-btns">
            <button
              type="button"
              className="btn-outline-print"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Export Report</span>
            </button>
            <button
              type="button"
              className="btn-new-scan-top"
              onClick={() => onNavigate('/skin-analysis')}
            >
              <RefreshCw size={15} />
              <span>Retake Scan</span>
            </button>
          </div>
        </div>

        {/* Hero Score Banner */}
        <section className="results-hero-banner">
          <div className="hero-banner-main">
            <div className="score-dial-wrap">
              <div className="score-circle">
                <span className="score-number">{record.overallScore}</span>
                <span className="score-unit">/ 100</span>
              </div>
            </div>

            <div className="score-meta-col">
              <div className="banner-tag">
                <Sparkles size={14} />
                <span>AI Optical Biometric Evaluation</span>
              </div>
              <h1 className="banner-condition-heading">{record.skinConditionSummary}</h1>
              <p className="banner-condition-desc">
                Your skin demonstrates solid epidermal cohesion with balanced sebum distribution across the T-zone and healthy micro-circulation.
              </p>
            </div>
          </div>

          {record.imageUrl && (
            <div className="banner-portrait-thumb">
              <img src={record.imageUrl} alt="Analysis scan portrait" />
              <div className="thumb-reticle-badge">
                <ScanFace size={13} />
                <span>Verified Scan</span>
              </div>
            </div>
          )}
        </section>

        {/* 6-Axis Biometric Metrics Grid */}
        <section className="results-section">
          <div className="section-title-wrap">
            <h2 className="section-heading">6-Axis Biometric Breakdown</h2>
            <p className="section-subtext">
              Measured against standardized dermatological reference metrics.
            </p>
          </div>

          <div className="metrics-cards-grid">
            {metricList.map((metric) => (
              <div key={metric.name} className="metric-score-card">
                <div className="metric-card-top">
                  <span className="metric-name">{metric.name}</span>
                  <span
                    className={`metric-status-badge ${
                      metric.status === 'Optimal'
                        ? 'metric-status-badge--optimal'
                        : metric.status === 'Good'
                        ? 'metric-status-badge--good'
                        : 'metric-status-badge--attention'
                    }`}
                  >
                    {metric.status}
                  </span>
                </div>

                <div className="metric-score-bar-wrap">
                  <div className="score-fill-line">
                    <div
                      className="score-fill-inner"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <span className="metric-score-text">{metric.score}%</span>
                </div>

                <p className="metric-description">{metric.description}</p>

                <div className="metric-recommendation-box">
                  <span className="rec-label">Clinical Action:</span>
                  <p className="rec-text">{metric.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Facial Zones & Key Findings */}
        <section className="results-section">
          <div className="two-column-layout">
            {/* Left: Zones Breakdown */}
            <div className="zones-breakdown-card">
              <h3 className="subcard-title">Zone-by-Zone Diagnostic</h3>
              <div className="zones-list">
                <div className="zone-item">
                  <span className="zone-name">T-Zone (Forehead &amp; Nose)</span>
                  <p className="zone-desc">{record.detectedZones.tZone}</p>
                </div>
                <div className="zone-item">
                  <span className="zone-name">U-Zone (Cheeks &amp; Jaw)</span>
                  <p className="zone-desc">{record.detectedZones.uZone}</p>
                </div>
                <div className="zone-item">
                  <span className="zone-name">Periorbital Region (Eye Contour)</span>
                  <p className="zone-desc">{record.detectedZones.periorbital}</p>
                </div>
                <div className="zone-item">
                  <span className="zone-name">Lateral Cheeks</span>
                  <p className="zone-desc">{record.detectedZones.cheeks}</p>
                </div>
              </div>
            </div>

            {/* Right: Key Findings */}
            <div className="findings-card">
              <h3 className="subcard-title">Key Clinical Findings</h3>
              <div className="findings-checklist">
                {record.keyFindings.map((finding, idx) => (
                  <div key={idx} className="finding-item">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>

              <div className="ingredients-avoid-box">
                <span className="avoid-label">Ingredients to Avoid:</span>
                <ul className="avoid-list">
                  {record.ingredientsToAvoid.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Active Ingredients */}
        <section className="results-section">
          <div className="section-title-wrap">
            <h2 className="section-heading">Formulated Active Recommendations</h2>
            <p className="section-subtext">
              Active ingredient synergies compounded for your skin’s current cellular turnover rhythm.
            </p>
          </div>

          <div className="actives-cards-grid">
            {record.recommendedActives.map((act) => (
              <div key={act.name} className="active-card">
                <div className="active-timing-pill">
                  {act.usageTime === 'AM' && <Sun size={13} className="text-amber-500" />}
                  {act.usageTime === 'PM' && <Moon size={13} className="text-indigo-400" />}
                  {act.usageTime === 'Both' && <Sparkles size={13} className="text-royal-violet" />}
                  <span>{act.usageTime} Routine</span>
                </div>
                <h4 className="active-name">{act.name}</h4>
                <p className="active-role">{act.role}</p>
              </div>
            ))}
          </div>

          <div className="results-cta-banner">
            <div>
              <h3 className="cta-banner-heading">Ready to compound this into your routine?</h3>
              <p className="cta-banner-text">
                Your personalized AM &amp; PM checklists have been populated with these recommended formulations.
              </p>
            </div>
            <button
              type="button"
              className="btn-open-routine"
              onClick={() => onNavigate('/my-routine')}
            >
              <span>View My AM/PM Routine</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
