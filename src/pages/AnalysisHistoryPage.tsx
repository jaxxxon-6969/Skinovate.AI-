import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  History,
  ScanFace,
  Calendar,
  ChevronRight,
  TrendingUp,
  Droplets,
  Shield,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, SkinAnalysisRecord } from '../types';
import { analysisService } from '../lib/supabase';

interface AnalysisHistoryPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [analyses, setAnalyses] = useState<SkinAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const list = await analysisService.getAnalyses(currentUser.id);
      setAnalyses(list);
      setLoading(false);
    }
    loadHistory();
  }, [currentUser.id]);

  return (
    <div className="history-page-viewport">
      <div className="history-container">
        {/* Top Header */}
        <div className="history-top-bar">
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
            onClick={() => onNavigate('/skin-analysis')}
          >
            <ScanFace size={16} />
            <span>New Scan</span>
          </button>
        </div>

        <div className="history-page-header">
          <div className="page-badge">
            <History size={14} />
            <span>Biometric Timeline</span>
          </div>
          <h1 className="history-title">Analysis History &amp; Progress</h1>
          <p className="history-subtitle">
            Track your skin barrier recovery, hydration shifts, and texture refinement across each scan milestone.
          </p>
        </div>

        {analyses.length > 0 ? (
          <div className="history-content-layout">
            {/* Trend Highlights Card */}
            <div className="trends-overview-card">
              <div className="trend-stat-box">
                <span className="trend-label">Total Completed Scans</span>
                <span className="trend-value">{analyses.length}</span>
              </div>
              <div className="trend-stat-box">
                <span className="trend-label">Latest Overall Score</span>
                <span className="trend-value text-royal-violet">{analyses[0].overallScore} / 100</span>
              </div>
              <div className="trend-stat-box">
                <span className="trend-label">Barrier Trajectory</span>
                <span className="trend-value text-emerald-600">+14% Recovery</span>
              </div>
            </div>

            {/* Records List */}
            <div className="history-records-grid">
              {analyses.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="history-record-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="record-main-info">
                    {item.imageUrl ? (
                      <div className="record-thumbnail">
                        <img src={item.imageUrl} alt="Analysis thumbnail" />
                      </div>
                    ) : (
                      <div className="record-thumbnail-placeholder">
                        <ScanFace size={24} />
                      </div>
                    )}

                    <div className="record-meta">
                      <div className="record-date-badge">
                        <Calendar size={13} />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h3 className="record-condition">{item.skinConditionSummary}</h3>
                      <p className="record-id-tag">Scan ID: {item.id}</p>
                    </div>
                  </div>

                  <div className="record-scores-row">
                    <div className="micro-score">
                      <span className="micro-label">Overall</span>
                      <strong className="micro-val">{item.overallScore}</strong>
                    </div>
                    <div className="micro-score">
                      <span className="micro-label">Hydration</span>
                      <strong className="micro-val">{item.metrics.hydration.score}%</strong>
                    </div>
                    <div className="micro-score">
                      <span className="micro-label">Barrier</span>
                      <strong className="micro-val">{item.metrics.barrierHealth.score}%</strong>
                    </div>
                    <div className="micro-score">
                      <span className="micro-label">Redness</span>
                      <strong className="micro-val">{item.metrics.rednessSensitivity.score}%</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-view-report"
                    onClick={() => onNavigate(`/analysis-results/${item.id}`)}
                  >
                    <span>View Complete Report</span>
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="history-empty-card">
            <div className="empty-icon-wrap">
              <History size={36} />
            </div>
            <h2>No Analysis Records Found</h2>
            <p>
              You haven&apos;t completed any skin analyses yet. Complete your first optical scan to begin your timeline.
            </p>
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => onNavigate('/skin-analysis')}
            >
              <ScanFace size={16} />
              <span>Launch First Scan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
