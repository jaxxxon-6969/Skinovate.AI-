import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ScanFace,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sun,
  Shield,
  Droplets,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, SkinAnalysisRecord, SkinProfileData } from '../types';
import { analysisService, skinProfileService } from '../lib/supabase';

interface SkinAnalysisPageProps {
  currentUser: UserProfile;
  onNavigate: (path: string) => void;
}

export const SkinAnalysisPage: React.FC<SkinAnalysisPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [userProfile, setUserProfile] = useState<SkinProfileData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const p = await skinProfileService.getProfile(currentUser.id);
      setUserProfile(p);
    }
    fetchProfile();
  }, [currentUser.id]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setCameraError('Camera access unavailable or declined. Please upload a photo instead.');
    }
  };

  const handleCaptureCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoUrl(dataUrl);

        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSample = () => {
    setPhotoUrl('/skinovate-hero-reference.jpg');
  };

  const scanSteps = [
    'Calibrating optical illumination & skin contrast...',
    'Mapping 3D facial landmark coordinates & contours...',
    'Quantifying epidermal hydration & trans-epidermal moisture loss...',
    'Scanning sebum oxidation & micro-pore congestion in T-zone...',
    'Evaluating erythema intensity & micro-capillary sensitivity...',
    'Compounding personalized active recommendations...',
  ];

  const handleStartAnalysis = () => {
    if (!photoUrl) return;
    setIsScanning(true);
    setScanStep(0);

    const interval = window.setInterval(() => {
      setScanStep((prev) => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        } else {
          window.clearInterval(interval);
          finishAnalysis();
          return prev;
        }
      });
    }, 900);
  };

  const finishAnalysis = async () => {
    const skinType = userProfile?.skinType || 'Combination';

    // Formulate scores based on calibrated profile
    const hydrationScore = skinType === 'Dry' ? 58 : skinType === 'Oily' ? 82 : 76;
    const barrierScore = skinType === 'Sensitive' ? 62 : 84;
    const poreScore = skinType === 'Oily' ? 64 : 86;
    const rednessScore = skinType === 'Sensitive' ? 59 : 88;
    const overallScore = Math.round(
      (hydrationScore + barrierScore + poreScore + rednessScore + 85 + 82) / 6
    );

    const recordId = 'scan_' + Math.random().toString(36).substring(2, 9);
    const newRecord: SkinAnalysisRecord = {
      id: recordId,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      imageUrl: photoUrl || undefined,
      overallScore,
      skinConditionSummary:
        overallScore >= 80
          ? 'Resilient & Well-Hydrated'
          : overallScore >= 70
          ? 'Mild Barrier Dehydration'
          : 'Sensitive Barrier Fatigue',
      metrics: {
        hydration: {
          name: 'Epidermal Hydration',
          score: hydrationScore,
          status: hydrationScore >= 75 ? 'Optimal' : 'Needs Attention',
          description:
            'Trans-epidermal water retention is well-balanced across the lower epidermis with minimal dry flaking.',
          recommendation: 'Incorporate multi-weight Hyaluronic Acid and Panthenol (Pro-Vitamin B5).',
        },
        barrierHealth: {
          name: 'Lipid Barrier Integrity',
          score: barrierScore,
          status: barrierScore >= 75 ? 'Optimal' : 'Needs Attention',
          description:
            'Intercellular lamellar lipid layers show solid cohesion against external airborne pollutants.',
          recommendation: 'Maintain barrier lipids with Ceramides NP/AP/EOP and Phytosphingosine.',
        },
        poreCongestion: {
          name: 'Pore Clarity & Sebum',
          score: poreScore,
          status: poreScore >= 75 ? 'Good' : 'Elevated',
          description:
            'Mild sebum oxidation detected around the nasolabial fold and chin zone; lateral cheeks remain clear.',
          recommendation: 'Use 2% Salicylic Acid (BHA) or 10% Niacinamide to dissolve oxidized sebum.',
        },
        rednessSensitivity: {
          name: 'Erythema & Redness',
          score: rednessScore,
          status: rednessScore >= 75 ? 'Optimal' : 'Needs Attention',
          description:
            'Minimal capillary dilation detected under normal lighting, with resilience against thermal shifts.',
          recommendation: 'Soothe with Centella Asiatica (Cica), Madecassoside, and Allantoin.',
        },
        textureSmoothness: {
          name: 'Micro-Texture Smoothness',
          score: 85,
          status: 'Optimal',
          description:
            'Keratinocyte shedding cadence is uniform with low surface roughness coefficients.',
          recommendation: 'Gentle PHA (Gluconolactone) once weekly for luminous light reflection.',
        },
        pigmentEvenness: {
          name: 'Pigment & Melanin Uniformity',
          score: 82,
          status: 'Good',
          description:
            'Even tone distribution with isolated faint UV photoaging markers along high cheekbones.',
          recommendation: 'Daily broad-spectrum SPF 50+ paired with stabilized Vitamin C or Tranexamic Acid.',
        },
      },
      detectedZones: {
        tZone: 'Moderate sebum output with clear follicular ostia',
        uZone: 'Well-hydrated with smooth stratum corneum',
        periorbital: 'Faint vascular translucency, healthy skin thickness',
        cheeks: 'Intact moisture barrier, resilient to mechanical friction',
      },
      keyFindings: [
        'Trans-epidermal water loss is low, indicating a strong outer protective envelope.',
        'Slight T-zone oiliness in mid-day periods suggests combination skin tendencies.',
        'No active inflammatory comedones detected; micro-texture is refined and calm.',
      ],
      recommendedActives: [
        {
          name: 'Ceramides Complex (3:1:1 Ratio)',
          role: 'Rebuilds intercellular cement and seals in moisture',
          usageTime: 'Both',
        },
        {
          name: 'Niacinamide (Vitamin B3 5-10%)',
          role: 'Regulates follicular sebum production and diminishes pore diameter',
          usageTime: 'AM',
        },
        {
          name: 'Centella Asiatica / Madecassoside',
          role: 'Downregulates inflammatory cytokines and prevents flare-ups',
          usageTime: 'PM',
        },
      ],
      ingredientsToAvoid: [
        'High percentage Denatured Alcohol (drying to lipid mantle)',
        'Harsh walnut shell physical scrubs (causes micro-tears)',
        'Synthetic heavy fragrances with known allergen sensitization',
      ],
    };

    await analysisService.saveAnalysis(newRecord);
    setIsScanning(false);
    onNavigate(`/analysis-results/${recordId}`);
  };

  return (
    <div className="skin-analysis-viewport">
      <div className="analysis-page-container">
        {/* Top Header */}
        <div className="analysis-top-nav">
          <button
            type="button"
            className="btn-back-link"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="analysis-step-indicator">
            <ScanFace size={16} className="text-royal-violet" />
            <span>AI Optical Skin Diagnostic</span>
          </div>
        </div>

        {/* Main Workspace Card */}
        <div className="analysis-workspace-card">
          {!photoUrl ? (
            /* Upload / Capture Stage */
            <div className="capture-selection-stage">
              <div className="stage-intro">
                <h1 className="stage-title">Capture Your Skin Analysis Photo</h1>
                <p className="stage-desc">
                  Position your face in balanced natural light without makeup for optimal optical precision.
                </p>
              </div>

              {/* Guidelines Badges */}
              <div className="guidelines-row">
                <div className="guideline-item">
                  <Sun size={15} />
                  <span>Balanced Natural Light</span>
                </div>
                <div className="guideline-item">
                  <Droplets size={15} />
                  <span>Clean, Unfiltered Skin</span>
                </div>
                <div className="guideline-item">
                  <ScanFace size={15} />
                  <span>Frontal Eye-Level Gaze</span>
                </div>
              </div>

              {/* Selector Tabs */}
              <div className="capture-mode-tabs">
                <button
                  type="button"
                  className={`mode-tab ${photoMode === 'upload' ? 'mode-tab--active' : ''}`}
                  onClick={() => setPhotoMode('upload')}
                >
                  <Upload size={16} />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  className={`mode-tab ${photoMode === 'camera' ? 'mode-tab--active' : ''}`}
                  onClick={() => {
                    setPhotoMode('camera');
                    handleStartCamera();
                  }}
                >
                  <Camera size={16} />
                  <span>Live Webcam</span>
                </button>
                <button
                  type="button"
                  className={`mode-tab ${photoMode === 'sample' ? 'mode-tab--active' : ''}`}
                  onClick={() => {
                    setPhotoMode('sample');
                    handleUseSample();
                  }}
                >
                  <Sparkles size={16} />
                  <span>Use Sample Portrait</span>
                </button>
              </div>

              {/* Mode Body */}
              <div className="mode-content-box">
                {photoMode === 'upload' && (
                  <div
                    className="dropzone-area"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden-file-input"
                      onChange={handleFileUpload}
                    />
                    <div className="dropzone-icon-circle">
                      <Upload size={28} />
                    </div>
                    <p className="dropzone-prompt">
                      <strong>Click to upload</strong> or drag and drop your photo
                    </p>
                    <span className="dropzone-sub">PNG, JPG, or WEBP (up to 10MB)</span>
                  </div>
                )}

                {photoMode === 'camera' && (
                  <div className="camera-stream-box">
                    {cameraError ? (
                      <div className="camera-error-msg">
                        <AlertCircle size={20} />
                        <p>{cameraError}</p>
                      </div>
                    ) : (
                      <div className="camera-viewfinder">
                        <video ref={videoRef} autoPlay playsInline muted className="video-stream" />
                        <div className="viewfinder-oval-guide" />
                        <button
                          type="button"
                          className="btn-capture-snapshot"
                          onClick={handleCaptureCamera}
                        >
                          <Camera size={18} />
                          <span>Snap Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Image Preview & Scan Stage */
            <div className="photo-preview-stage">
              <div className="preview-split-layout">
                {/* Visual Viewport with Scan Beam */}
                <div className="scan-viewport-wrapper">
                  <div className="scan-image-frame">
                    <img
                      src={photoUrl}
                      alt="Skin analysis target"
                      className="scan-target-image"
                    />

                    {/* Scanning Beam & Reticle overlay during active scan */}
                    {isScanning && (
                      <div className="active-scanning-layer">
                        <div className="laser-sweep-bar" />
                        <div className="biometric-hud-grid" />
                        <div className="facial-reticle-overlay" />
                      </div>
                    )}

                    {/* Facial alignment guides when idle */}
                    {!isScanning && (
                      <div className="alignment-hud-overlay">
                        <div className="hud-corner hud-corner--tl" />
                        <div className="hud-corner hud-corner--tr" />
                        <div className="hud-corner hud-corner--bl" />
                        <div className="hud-corner hud-corner--br" />
                        <span className="hud-tag">Biometric Alignment Ready</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Panel / Progress Details */}
                <div className="scan-controls-panel">
                  {!isScanning ? (
                    <div className="panel-idle-content">
                      <div className="panel-badge">
                        <Sparkles size={14} />
                        <span>Ready for Optical Evaluation</span>
                      </div>
                      <h2 className="panel-title">Initiate AI Skin Scan</h2>
                      <p className="panel-desc">
                        Our model will analyze epidermal hydration, sebum output, pore texture, and micro-capillary redness across 6 physiological dimensions.
                      </p>

                      <div className="analysis-summary-checks">
                        <div className="check-item">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span>Valid facial framing detected</span>
                        </div>
                        <div className="check-item">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span>Lighting balance verified</span>
                        </div>
                        <div className="check-item">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span>Sub-surface pore resolution optimal</span>
                        </div>
                      </div>

                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-launch-scan"
                          onClick={handleStartAnalysis}
                        >
                          <ScanFace size={18} />
                          <span>Run Complete Skin Analysis</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-retake-photo"
                          onClick={() => {
                            setPhotoUrl(null);
                            setPhotoMode('upload');
                          }}
                        >
                          <RefreshCw size={15} />
                          <span>Choose Different Photo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="panel-scanning-content">
                      <div className="scanning-pulse-badge">
                        <Activity size={15} className="animate-spin" />
                        <span>Analyzing Biometrics...</span>
                      </div>

                      <h3 className="scanning-step-title">{scanSteps[scanStep]}</h3>

                      {/* Progress Bar */}
                      <div className="scan-progress-bar">
                        <div
                          className="scan-progress-fill"
                          style={{
                            width: `${((scanStep + 1) / scanSteps.length) * 100}%`,
                          }}
                        />
                      </div>

                      <div className="steps-checklist">
                        {scanSteps.map((step, idx) => (
                          <div
                            key={step}
                            className={`checklist-item ${
                              idx < scanStep
                                ? 'checklist-item--done'
                                : idx === scanStep
                                ? 'checklist-item--active'
                                : ''
                            }`}
                          >
                            <div className="checklist-bullet">
                              {idx < scanStep ? <CheckCircle2 size={13} /> : idx + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
