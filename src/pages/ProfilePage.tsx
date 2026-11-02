import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Layers,
  LogOut,
  Bell,
  Lock,
  ChevronRight,
  Sparkles,
  Database,
} from 'lucide-react';
import { UserProfile, SkinProfileData } from '../types';
import { skinProfileService } from '../lib/supabase';
import { SupabaseConnectionModal } from '../components/SupabaseConnectionModal';

interface ProfilePageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigate,
  onLogout,
}) => {
  const [profile, setProfile] = useState<SkinProfileData | null>(null);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await skinProfileService.getProfile(currentUser.id);
      setProfile(p);
    }
    load();
  }, [currentUser.id]);

  return (
    <div className="profile-page-viewport">
      <div className="profile-container">
        {/* Top Header */}
        <div className="profile-top-bar">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="profile-header-card">
          <div className="profile-avatar-giant">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-title-col">
            <h1 className="profile-user-name">{currentUser.fullName}</h1>
            <p className="profile-user-email">{currentUser.email}</p>
            <span className="profile-member-badge">
              <Sparkles size={13} />
              <span>Skinovate AI Member</span>
            </span>
          </div>
        </div>

        <div className="profile-sections-grid">
          {/* Skin Profile Summary Card */}
          <div className="profile-subcard">
            <div className="subcard-header">
              <div className="subcard-icon">
                <Layers size={18} />
              </div>
              <h3 className="subcard-heading">Skincare Calibration</h3>
            </div>

            {profile ? (
              <div className="profile-data-list">
                <div className="data-row">
                  <span className="data-key">Skin Type:</span>
                  <span className="data-val data-val--badge">{profile.skinType}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Age Range:</span>
                  <span className="data-val">{profile.ageRange}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Core Goal:</span>
                  <span className="data-val">{profile.primaryGoal}</span>
                </div>
                <div className="data-row">
                  <span className="data-key">Sensitivity:</span>
                  <span className="data-val">{profile.sensitivityLevel}</span>
                </div>
              </div>
            ) : (
              <p className="subcard-empty-note">
                You haven&apos;t completed the onboarding questionnaire yet.
              </p>
            )}

            <button
              type="button"
              className="btn-edit-skin-profile"
              onClick={() => onNavigate('/skin-profile')}
            >
              <span>{profile ? 'Update Skincare Profile' : 'Complete Questionnaire'}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Privacy & Security Card */}
          <div className="profile-subcard">
            <div className="subcard-header">
              <div className="subcard-icon">
                <Shield size={18} />
              </div>
              <h3 className="subcard-heading">Privacy &amp; Security</h3>
            </div>

            <div className="security-items-list">
              <div className="sec-item">
                <Lock size={15} className="text-royal-violet" />
                <div>
                  <strong>Biometric Data Protection</strong>
                  <p>All landmark coordinate maps are encrypted on-device.</p>
                </div>
              </div>
              <div className="sec-item">
                <Database size={15} className="text-royal-violet" />
                <div>
                  <strong>PostgreSQL &amp; Supabase Auth</strong>
                  <p>Encrypted cloud synchronization across profiles, skin_profiles &amp; skin_analyses.</p>
                </div>
              </div>
            </div>

            <div className="profile-actions-stack">
              <button
                type="button"
                className="btn-inspect-supabase"
                onClick={() => setSupabaseModalOpen(true)}
              >
                <Database size={15} />
                <span>Supabase Connection &amp; Telemetry</span>
              </button>

              <button
                type="button"
                className="btn-profile-logout"
                onClick={onLogout}
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <SupabaseConnectionModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};
