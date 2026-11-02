export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export type SkinType = 'Oily' | 'Dry' | 'Combination' | 'Normal' | 'Sensitive';

export type SkinConcern =
  | 'Acne & Blemishes'
  | 'Pore Texture & Congestion'
  | 'Hyperpigmentation & Sun Spots'
  | 'Fine Lines & Wrinkles'
  | 'Sensitivity & Redness'
  | 'Dehydration & Dullness'
  | 'Loss of Elasticity'
  | 'Dark Circles & Eye Puffiness';

export type SkincareGoal =
  | 'Restore Skin Barrier'
  | 'Clear & Prevent Breakouts'
  | 'Hydrate & Plump Epidermis'
  | 'Smooth Texture & Minimize Pores'
  | 'Brighten & Even Tone'
  | 'Calm Redness & Reactivity'
  | 'Anti-Aging & Cellular Defense';

export type PriceTier = 'budget' | 'mid' | 'luxury';

export type ProductCategory =
  | 'Cleanse'
  | 'Tone / Essence'
  | 'Treat / Serum'
  | 'Moisturize'
  | 'Protect (SPF)'
  | 'Night Recovery'
  | 'Eye Care'
  | 'Mask / Exfoliant';

export interface SkinProfileData {
  id?: string;
  userId: string;
  displayName: string;
  ageRange: string;
  skinType: SkinType;
  primaryConcerns: SkinConcern[];
  primaryGoal: SkincareGoal;
  sunExposure: 'High (Outdoors)' | 'Moderate' | 'Low (Indoors)';
  waterIntake: string;
  climate: 'Dry/Arid' | 'Humid' | 'Temperate' | 'Cold';
  sensitivityLevel: 'Low' | 'Moderate' | 'High (Reactive)';
  budgetPreference?: PriceTier | 'flexible';
  productPreferences?: string[];
  knownSensitivities?: string[];
  updatedAt: string;
}

export interface MetricDimension {
  name: string;
  score: number; // 0 to 100
  status: 'Optimal' | 'Good' | 'Needs Attention' | 'Elevated';
  description: string;
  recommendation: string;
}

export interface SkinAnalysisRecord {
  id: string;
  userId: string;
  createdAt: string;
  imageUrl?: string;
  photoUrl?: string;
  overallScore: number; // 0 to 100
  skinConditionSummary?: string;
  conditionTag?: string;
  conditionSummary?: string;
  metrics: {
    hydration: MetricDimension;
    barrierHealth: MetricDimension;
    poreCongestion: MetricDimension;
    rednessSensitivity: MetricDimension;
    textureSmoothness: MetricDimension;
    pigmentEvenness: MetricDimension;
  };
  detectedZones?: {
    tZone: string;
    uZone: string;
    periorbital: string;
    cheeks: string;
  };
  zones?: {
    tZone: string;
    uZone: string;
    periorbital: string;
    cheeks: string;
  };
  keyFindings: string[];
  recommendedActives: {
    name: string;
    role: string;
    usageTime: 'AM' | 'PM' | 'Both';
  }[];
  targetActives?: {
    name: string;
    role: string;
    usageTime: 'AM' | 'PM' | 'Both';
  }[];
  ingredientsToAvoid: string[];
  avoidIngredients?: string[];
}

export interface SkincareProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  priceTier: PriceTier;
  priceUsd: number;
  volume: string;
  rating: number;
  reviewsCount: number;
  skinTypes: SkinType[];
  targetConcerns: SkinConcern[];
  keyActives: string[];
  fullIngredientsSummary: string;
  benefits: string[];
  attributes: {
    fragranceFree: boolean;
    alcoholFree: boolean;
    vegan: boolean;
    crueltyFree: boolean;
    nonComedogenic: boolean;
  };
  usageTime: 'AM' | 'PM' | 'Both';
  texture: string;
  applicationTip: string;
  clinicalRationale?: string;
}

export interface IngredientIntelligence {
  id: string;
  name: string;
  inciName: string;
  category: 'Antioxidant' | 'Hydrator / Humectant' | 'Barrier Lipid' | 'Cell Turnover / Retinoid' | 'Exfoliant / Acid' | 'Soothing / Anti-inflammatory' | 'Sebum Regulator';
  role: string;
  optimalConcentration: string;
  timeOfDay: 'AM' | 'PM' | 'Both';
  synergies: string[];
  avoidWith: string[];
  whyRecommended: string;
  targetConcerns: SkinConcern[];
}

export interface RoutineStep {
  id: string;
  order: number;
  period: 'AM' | 'PM';
  category: ProductCategory;
  productName: string;
  brand?: string;
  productId?: string;
  activeIngredients: string;
  directions: string;
  applicationTip?: string;
  waitTimeMinutes?: number;
  completed?: boolean;
  conflictWarning?: string;
  compatibilityScore?: number;
  customAdded?: boolean;
}

export interface RoutineConditionAlert {
  id: string;
  type: 'info' | 'warning' | 'caution';
  metricTrigger: string;
  message: string;
  suggestedAction: string;
}

export interface DailySkinLogEntry {
  date: string;
  feeling: 'Glowing & Plump' | 'Balanced & Calm' | 'Mild Dryness' | 'Oily Shine' | 'Sensitive / Red';
  note: string;
  completedAm: boolean;
  completedPm: boolean;
}

export interface SkincareRoutine {
  userId: string;
  lastUpdated: string;
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  streakDays: number;
  completedToday: {
    am: boolean;
    pm: boolean;
  };
  conditionAlerts?: RoutineConditionAlert[];
  dailyLogs?: DailySkinLogEntry[];
}

// ==========================================
// Phase 4: Skincare Companion & Progress Types
// ==========================================

export type SkinObservationType =
  | 'Skin felt hydrated'
  | 'Skin felt dry'
  | 'Skin appeared oily'
  | 'Skin felt irritated'
  | 'Visible blemishes noticed'
  | 'Texture felt rough'
  | 'Skin appeared calm & radiant'
  | 'Slight redness or flushing'
  | 'Comfortable & balanced';

export interface SkinJournalEntry {
  id: string;
  userId: string;
  entryDate: string; // YYYY-MM-DD
  observations: SkinObservationType[];
  completedAm: boolean;
  completedPm: boolean;
  productsUsed?: string[];
  ingredientsIntroduced?: string[];
  routineNotes?: string;
  generalNotes?: string;
  photoUrl?: string;
  skinComfortRating?: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  imagePath: string; // Storage path or object URL
  photoDate: string; // YYYY-MM-DD
  notes?: string;
  lightingCondition?: 'Natural Daylight' | 'Indoor Soft' | 'Direct Flash';
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  referencedActives?: string[];
  referencedMetrics?: string[];
  createdAt: string;
}

export interface AssistantConversation {
  id: string;
  userId: string;
  title: string;
  lastMessageSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: 'morning_routine' | 'evening_routine' | 'journal_prompt' | 'progress_scan' | 'system';
  readAt?: string | null;
  scheduledTime?: string;
  createdAt: string;
}

export interface ReminderPreferences {
  id?: string;
  userId: string;
  morningEnabled: boolean;
  morningTime: string; // "08:00"
  eveningEnabled: boolean;
  eveningTime: string; // "21:00"
  journalEnabled: boolean;
  journalTime: string; // "20:30"
  progressPhotoReminderEnabled: boolean;
  browserNotificationsRequested?: boolean;
  updatedAt: string;
}

export interface PersonalizedInsight {
  id: string;
  category: 'barrier' | 'hydration' | 'routine_consistency' | 'ingredient_synergy' | 'progress_milestone';
  title: string;
  explanation: string;
  supportingUserData: string;
  suggestedAction: string;
  confidenceStatement: string;
  createdAt: string;
}

export interface RoutineConsistencyMetrics {
  totalLoggedDays: number;
  streakDays: number;
  amCompletionRate: number; // percentage
  pmCompletionRate: number; // percentage
  weeklyCompletionRate: number; // percentage
  frequentlyCompletedSteps: { category: string; productName: string; completionRate: number }[];
  frequentlySkippedSteps: { category: string; productName: string; skipRate: number }[];
  consistencySuggestion: string;
}

