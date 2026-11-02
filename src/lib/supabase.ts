import {
  supabaseClient,
  isSupabaseConfigured,
  verifySupabaseConnection,
  SupabaseConnectionReport,
} from './supabaseClient';
import {
  UserProfile,
  SkinProfileData,
  SkinAnalysisRecord,
  SkincareRoutine,
  SkincareProduct,
  RoutineStep,
  DailySkinLogEntry,
  SkinJournalEntry,
  ProgressPhoto,
  AssistantMessage,
  AssistantConversation,
  UserNotification,
  ReminderPreferences,
  PersonalizedInsight,
  RoutineConsistencyMetrics,
} from '../types';
import {
  generatePersonalizedRoutine,
  calculateProductCompatibility,
  SKINCARE_PRODUCTS_CATALOG,
} from './recommendationEngine';

export {
  supabaseClient,
  isSupabaseConfigured,
  verifySupabaseConnection,
};
export type { SupabaseConnectionReport };

// Backward compatibility alias
export const supabase = supabaseClient;

// ==========================================
// Local Storage Persistence Keys (Fallback)
// ==========================================
const STORAGE_KEYS = {
  USER: 'skinovate_auth_user',
  PROFILE: 'skinovate_skin_profile',
  ANALYSES: 'skinovate_analyses_records',
  ROUTINE: 'skinovate_skincare_routine',
  JOURNAL: 'skinovate_journal_entries',
  PHOTOS: 'skinovate_progress_photos',
  CONVERSATIONS: 'skinovate_conversations',
  MESSAGES: 'skinovate_assistant_messages',
  NOTIFICATIONS: 'skinovate_notifications',
  REMINDERS: 'skinovate_reminder_preferences',
};

// ==========================================
// Authentication Service (Supabase Auth + profiles table)
// ==========================================
export const authService = {
  /**
   * Retrieves the current user session from Supabase Authentication
   * and enriches with profile data from the PostgreSQL `profiles` table.
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (!error && data?.user) {
          const authUser = data.user;
          let fullName =
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0] ||
            'Skincare Member';

          // Query the user's row in PostgreSQL `profiles` table respecting RLS (auth.uid() = id)
          try {
            const { data: profileRow } = await supabaseClient
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profileRow?.full_name) {
              fullName = profileRow.full_name;
            }
          } catch {
            // If table query encounters RLS or schema nuance, proceed with auth metadata
          }

          const user: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            fullName,
            createdAt: authUser.created_at,
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          return user;
        }

        // Supabase has no active user or returned an error — user is NOT logged in
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      } catch (err) {
        console.warn('Supabase getCurrentUser error:', err);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      }
    }

    // Local fallback when Supabase is not configured
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Signs up a new user via Supabase Auth and registers them in the `profiles` table.
   */
  async signUp(email: string, password: string, fullName: string): Promise<UserProfile> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        const authUser = data.user;
        const user: UserProfile = {
          id: authUser.id,
          email: authUser.email || email,
          fullName: fullName || email.split('@')[0],
          createdAt: authUser.created_at || new Date().toISOString(),
        };

        // Populate row in `profiles` table respecting RLS
        try {
          await supabaseClient.from('profiles').upsert(
            {
              id: authUser.id,
              email: authUser.email || email,
              full_name: user.fullName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (tableErr) {
          console.warn('Could not upsert into profiles table:', tableErr);
        }

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
    }

    // Resilient local fallback when Supabase keys are not set
    const user: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  /**
   * Authenticates user with email and password via Supabase Auth.
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        const authUser = data.user;
        let resolvedName =
          authUser.user_metadata?.full_name ||
          email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        // Check PostgreSQL `profiles` table
        try {
          const { data: profileRow } = await supabaseClient
            .from('profiles')
            .select('full_name')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileRow?.full_name) {
            resolvedName = profileRow.full_name;
          }
        } catch {
          // ignore
        }

        const user: UserProfile = {
          id: authUser.id,
          email: authUser.email || email,
          fullName: resolvedName,
          createdAt: authUser.created_at,
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return user;
      }
    }

    // Local fallback for quick preview
    const user: UserProfile = {
      id: 'usr_demo',
      email,
      fullName: email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  /**
   * Signs out user from Supabase and clears persistent browser storage.
   */
  async signOut(): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Subscribes to Supabase Auth state changes (signed in, signed out, token refreshed).
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!supabaseClient) return () => {};

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const u = session.user;
          const userObj: UserProfile = {
            id: u.id,
            email: u.email || '',
            fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Member',
            createdAt: u.created_at,
          };
          callback(userObj);
        } else if (event === 'SIGNED_OUT') {
          callback(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  },
};

// ==========================================
// Skin Profile Data Service (PostgreSQL: skin_profiles)
// ==========================================
export const skinProfileService = {
  /**
   * Retrieves the skincare profile for the user from `skin_profiles` table.
   * Respects RLS: auth.uid() = user_id.
   */
  async getProfile(userId: string): Promise<SkinProfileData | null> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('skin_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id || `sp_${userId}`,
            userId: data.user_id,
            displayName: data.display_name || 'Member',
            ageRange: data.age_range || '26-35',
            skinType: data.skin_type || 'Combination',
            primaryConcerns: Array.isArray(data.primary_concerns)
              ? data.primary_concerns
              : [],
            primaryGoal: data.primary_goal || 'Hydration boost & barrier repair',
            sunExposure: data.sun_exposure || 'Moderate (1-3 hours/day)',
            waterIntake: data.water_intake || '6-8 glasses (Optimal)',
            climate: data.climate || 'Temperate / Moderate',
            sensitivityLevel: data.sensitivity_level || 'Mild (Occasional flare-ups)',
            updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Error reading from skin_profiles table, using local storage:', err);
      }
    }

    // Local storage fallback
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.PROFILE}_${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Upserts the user's skincare onboarding profile into `skin_profiles`.
   */
  async saveProfile(profile: SkinProfileData): Promise<SkinProfileData> {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const payload: Record<string, any> = {
          user_id: profile.userId,
          display_name: profile.displayName,
          age_range: profile.ageRange,
          skin_type: profile.skinType,
          primary_concerns: profile.primaryConcerns,
          primary_goal: profile.primaryGoal,
          sun_exposure: profile.sunExposure,
          water_intake: profile.waterIntake,
          climate: profile.climate,
          sensitivity_level: profile.sensitivityLevel,
          updated_at: updatedProfile.updatedAt,
        };

        if (profile.id && !profile.id.startsWith('sp_')) {
          payload.id = profile.id;
        }

        const { data, error } = await supabaseClient
          .from('skin_profiles')
          .upsert(payload, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (!error && data?.id) {
          updatedProfile.id = data.id;
        }
      } catch (err) {
        console.warn('Error saving to skin_profiles table, saved locally:', err);
      }
    }

    localStorage.setItem(
      `${STORAGE_KEYS.PROFILE}_${profile.userId}`,
      JSON.stringify(updatedProfile)
    );
    return updatedProfile;
  },
};

// ==========================================
// Skin Analysis Service (PostgreSQL: skin_analyses)
// ==========================================
export const analysisService = {
  /**
   * Retrieves all biometric skin scan reports for the user from `skin_analyses`.
   * Respects RLS: auth.uid() = user_id.
   */
  async getAnalyses(userId: string): Promise<SkinAnalysisRecord[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('skin_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => {
            if (row.record_json) {
              return row.record_json as SkinAnalysisRecord;
            }
            // Synthesize from individual columns if stored separately
            return {
              id: row.id,
              userId: row.user_id,
              createdAt: row.created_at,
              overallScore: row.overall_score || 85,
              conditionTag: row.condition_tag || 'Balanced',
              conditionSummary: row.condition_summary || 'Skin barrier stable.',
              metrics: row.metrics || {},
              zones: row.zones || {},
              keyFindings: Array.isArray(row.key_findings) ? row.key_findings : [],
              targetActives: Array.isArray(row.target_actives) ? row.target_actives : [],
              avoidIngredients: Array.isArray(row.avoid_ingredients)
                ? row.avoid_ingredients
                : [],
              photoUrl: row.photo_url,
            } as SkinAnalysisRecord;
          });
        }
      } catch (err) {
        console.warn('Error fetching from skin_analyses table, using local cache:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.ANALYSES}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves a specific skin analysis by ID from `skin_analyses`.
   */
  async getAnalysisById(analysisId: string): Promise<SkinAnalysisRecord | null> {
    // 1. Check local storage cache first
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.ANALYSES)) {
        try {
          const list: SkinAnalysisRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
          const match = list.find((item) => item.id === analysisId);
          if (match) return match;
        } catch {
          // ignore
        }
      }
    }

    // 2. Query Supabase PostgreSQL `skin_analyses` table
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('skin_analyses')
          .select('*')
          .eq('id', analysisId)
          .maybeSingle();

        if (!error && data) {
          if (data.record_json) {
            return data.record_json as SkinAnalysisRecord;
          }
          return {
            id: data.id,
            userId: data.user_id,
            createdAt: data.created_at,
            overallScore: data.overall_score,
            conditionTag: data.condition_tag,
            conditionSummary: data.condition_summary,
            metrics: data.metrics,
            zones: data.zones,
            keyFindings: data.key_findings || [],
            targetActives: data.target_actives || [],
            avoidIngredients: data.avoid_ingredients || [],
            photoUrl: data.photo_url,
          } as SkinAnalysisRecord;
        }
      } catch (err) {
        console.warn('Error querying skin_analyses by ID:', err);
      }
    }

    return null;
  },

  /**
   * Saves a new biometric analysis record to the `skin_analyses` table.
   * Stores both normalized columns and record_json for maximum schema resilience.
   */
  async saveAnalysis(record: SkinAnalysisRecord): Promise<SkinAnalysisRecord> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('skin_analyses').insert({
          id: record.id,
          user_id: record.userId,
          overall_score: record.overallScore,
          condition_tag: record.conditionTag,
          condition_summary: record.conditionSummary,
          metrics: record.metrics,
          zones: record.zones,
          key_findings: record.keyFindings,
          target_actives: record.targetActives,
          avoid_ingredients: record.avoidIngredients,
          photo_url: record.photoUrl || null,
          created_at: record.createdAt,
          record_json: record,
        });
      } catch (err) {
        console.warn('Error inserting into skin_analyses table, saving locally:', err);
      }
    }

    // Keep local cache synced
    const current = await this.getAnalyses(record.userId);
    const updated = [record, ...current.filter((item) => item.id !== record.id)];
    localStorage.setItem(`${STORAGE_KEYS.ANALYSES}_${record.userId}`, JSON.stringify(updated));

    // Update routine dynamically based on this scan
    await routineService.generateRoutineFromAnalysis(record.userId, record);

    return record;
  },
};

// ==========================================
// Skincare Routine Service
// ==========================================
export const routineService = {
  /**
   * Retrieves or builds the personalized skincare routine for the user.
   */
  async getRoutine(userId: string): Promise<SkincareRoutine> {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.ROUTINE}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    // Attempt to dynamically personalize based on user's saved profile & scan
    const [profile, analyses] = await Promise.all([
      skinProfileService.getProfile(userId),
      analysisService.getAnalyses(userId),
    ]);
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    const { amSteps, pmSteps, conditionAlerts } = generatePersonalizedRoutine(userId, profile, latestAnalysis);

    const defaultRoutine: SkincareRoutine = {
      userId,
      lastUpdated: new Date().toISOString(),
      streakDays: 4,
      completedToday: { am: false, pm: false },
      amSteps,
      pmSteps,
      conditionAlerts,
      dailyLogs: [],
    };

    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(defaultRoutine));
    return defaultRoutine;
  },

  /**
   * Toggles completion status for an AM or PM step.
   */
  async toggleStep(userId: string, period: 'AM' | 'PM', stepId: string): Promise<SkincareRoutine> {
    const routine = await this.getRoutine(userId);
    const targetSteps = period === 'AM' ? routine.amSteps : routine.pmSteps;
    const step = targetSteps.find((s) => s.id === stepId);
    if (step) {
      step.completed = !step.completed;
    }

    const allAmCompleted = routine.amSteps.every((s) => s.completed);
    const allPmCompleted = routine.pmSteps.every((s) => s.completed);
    
    // If completed both, increment streak if not already credited today
    if (allAmCompleted && allPmCompleted && (!routine.completedToday.am || !routine.completedToday.pm)) {
      routine.streakDays = (routine.streakDays || 0) + 1;
    }

    routine.completedToday = {
      am: allAmCompleted,
      pm: allPmCompleted,
    };
    routine.lastUpdated = new Date().toISOString();

    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
    return routine;
  },

  /**
   * Completely regenerates AM and PM routines using the latest profile & biometric analysis.
   */
  async regenerateRoutine(userId: string): Promise<SkincareRoutine> {
    const [profile, analyses] = await Promise.all([
      skinProfileService.getProfile(userId),
      analysisService.getAnalyses(userId),
    ]);
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    const existing = await this.getRoutine(userId);
    const { amSteps, pmSteps, conditionAlerts } = generatePersonalizedRoutine(userId, profile, latestAnalysis);

    const updatedRoutine: SkincareRoutine = {
      ...existing,
      amSteps,
      pmSteps,
      conditionAlerts,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(updatedRoutine));
    return updatedRoutine;
  },

  /**
   * Swaps a product in an existing step with an alternative from the catalog.
   */
  async swapStepProduct(
    userId: string,
    period: 'AM' | 'PM',
    stepId: string,
    newProduct: SkincareProduct
  ): Promise<SkincareRoutine> {
    const routine = await this.getRoutine(userId);
    const targetSteps = period === 'AM' ? routine.amSteps : routine.pmSteps;
    const step = targetSteps.find((s) => s.id === stepId);

    if (step) {
      step.productId = newProduct.id;
      step.productName = newProduct.name;
      step.brand = newProduct.brand;
      step.activeIngredients = newProduct.keyActives.join(', ');
      step.directions = newProduct.applicationTip;
      step.compatibilityScore = 95;
    }

    routine.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
    return routine;
  },

  /**
   * Adds a custom step to the AM or PM routine.
   */
  async addCustomStep(
    userId: string,
    period: 'AM' | 'PM',
    newStepData: Omit<RoutineStep, 'id' | 'order' | 'period'>
  ): Promise<SkincareRoutine> {
    const routine = await this.getRoutine(userId);
    const targetSteps = period === 'AM' ? routine.amSteps : routine.pmSteps;

    const newStep: RoutineStep = {
      ...newStepData,
      id: `step_custom_${Date.now()}`,
      order: targetSteps.length + 1,
      period,
      completed: false,
      customAdded: true,
    };

    targetSteps.push(newStep);
    routine.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
    return routine;
  },

  /**
   * Removes a step from the routine.
   */
  async removeStep(userId: string, period: 'AM' | 'PM', stepId: string): Promise<SkincareRoutine> {
    const routine = await this.getRoutine(userId);
    if (period === 'AM') {
      routine.amSteps = routine.amSteps.filter((s) => s.id !== stepId);
      routine.amSteps.forEach((s, idx) => {
        s.order = idx + 1;
      });
    } else {
      routine.pmSteps = routine.pmSteps.filter((s) => s.id !== stepId);
      routine.pmSteps.forEach((s, idx) => {
        s.order = idx + 1;
      });
    }

    routine.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
    return routine;
  },

  /**
   * Logs a daily skin perception entry (e.g. skin feels hydrated, minor flaking, etc.).
   */
  async logDailyEntry(userId: string, entry: DailySkinLogEntry): Promise<SkincareRoutine> {
    const routine = await this.getRoutine(userId);
    const existingLogs = routine.dailyLogs || [];
    routine.dailyLogs = [entry, ...existingLogs.filter((l) => l.date !== entry.date)].slice(0, 30);
    routine.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
    return routine;
  },

  /**
   * Updates routine when a new scan occurs.
   */
  async generateRoutineFromAnalysis(userId: string, analysis: SkinAnalysisRecord): Promise<void> {
    const profile = await skinProfileService.getProfile(userId);
    const { amSteps, pmSteps, conditionAlerts } = generatePersonalizedRoutine(userId, profile, analysis);

    const routine = await this.getRoutine(userId);
    routine.amSteps = amSteps;
    routine.pmSteps = pmSteps;
    routine.conditionAlerts = conditionAlerts;
    routine.lastUpdated = new Date().toISOString();

    localStorage.setItem(`${STORAGE_KEYS.ROUTINE}_${userId}`, JSON.stringify(routine));
  },
};

// ==========================================
// Phase 4: Skin Journal Service (skin_journal_entries)
// ==========================================
export const journalService = {
  async getEntries(userId: string): Promise<SkinJournalEntry[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('skin_journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            entryDate: row.entry_date,
            observations: row.observations || [],
            completedAm: !!row.completed_am,
            completedPm: !!row.completed_pm,
            productsUsed: row.products_used || [],
            ingredientsIntroduced: row.ingredients_introduced || [],
            routineNotes: row.routine_notes || '',
            generalNotes: row.general_notes || '',
            photoUrl: row.photo_url || undefined,
            skinComfortRating: row.skin_comfort_rating || 4,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Error reading from skin_journal_entries table, using local cache:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.JOURNAL}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    // Default sample journal entries for realistic initial preview
    const sampleEntries: SkinJournalEntry[] = [
      {
        id: 'entry_sample_1',
        userId,
        entryDate: new Date().toISOString().split('T')[0],
        observations: ['Skin felt hydrated', 'Comfortable & balanced'],
        completedAm: true,
        completedPm: true,
        productsUsed: ['Hydrating Amino Acid Cleanser', '10% Niacinamide + Zinc', 'Ceramide Barrier Emulsion', 'Invisible Fluid SPF 50+'],
        ingredientsIntroduced: [],
        routineNotes: 'Applied ceramide barrier emulsion while cheeks were still slightly damp. Zero tightness.',
        generalNotes: 'Drank 8 glasses of water. Weather was sunny but indoor AC was dry.',
        skinComfortRating: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'entry_sample_2',
        userId,
        entryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        observations: ['Skin appeared calm & radiant', 'Skin felt hydrated'],
        completedAm: true,
        completedPm: true,
        productsUsed: ['Hydrating Amino Acid Cleanser', 'Encapsulated Retinaldehyde 0.05%', 'Ceramide Balm'],
        ingredientsIntroduced: ['Encapsulated Retinaldehyde 0.05%'],
        routineNotes: 'First night applying Retinal. Buffered with ceramide moisturizer first. No redness.',
        generalNotes: 'Woke up feeling soft and refreshed.',
        skinComfortRating: 4,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'entry_sample_3',
        userId,
        entryDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        observations: ['Slight redness or flushing', 'Skin felt dry'],
        completedAm: true,
        completedPm: false,
        productsUsed: ['Hydrating Cleanser', 'SPF 50+'],
        ingredientsIntroduced: [],
        routineNotes: 'Fell asleep early and missed PM treatment. Applied morning SPF diligently.',
        generalNotes: 'Outdoor wind caused mild flushing on cheekbones.',
        skinComfortRating: 3,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.JOURNAL}_${userId}`, JSON.stringify(sampleEntries));
    return sampleEntries;
  },

  async getEntryByDate(userId: string, dateStr: string): Promise<SkinJournalEntry | null> {
    const entries = await this.getEntries(userId);
    return entries.find((e) => e.entryDate === dateStr) || null;
  },

  async saveEntry(entry: SkinJournalEntry): Promise<SkinJournalEntry> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('skin_journal_entries').upsert({
          id: entry.id,
          user_id: entry.userId,
          entry_date: entry.entryDate,
          observations: entry.observations,
          completed_am: entry.completedAm,
          completed_pm: entry.completedPm,
          products_used: entry.productsUsed || [],
          ingredients_introduced: entry.ingredientsIntroduced || [],
          routine_notes: entry.routineNotes || '',
          general_notes: entry.generalNotes || '',
          photo_url: entry.photoUrl || null,
          skin_comfort_rating: entry.skinComfortRating || 4,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error saving to skin_journal_entries table, caching locally:', err);
      }
    }

    const entries = await this.getEntries(entry.userId);
    const existingIdx = entries.findIndex((e) => e.id === entry.id || e.entryDate === entry.entryDate);
    let updated: SkinJournalEntry[];
    if (existingIdx >= 0) {
      updated = [...entries];
      updated[existingIdx] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      updated = [entry, ...entries];
    }
    updated.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
    localStorage.setItem(`${STORAGE_KEYS.JOURNAL}_${entry.userId}`, JSON.stringify(updated));
    return entry;
  },

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('skin_journal_entries').delete().eq('id', entryId).eq('user_id', userId);
      } catch (err) {
        console.warn('Error deleting from skin_journal_entries table:', err);
      }
    }

    const entries = await this.getEntries(userId);
    const filtered = entries.filter((e) => e.id !== entryId);
    localStorage.setItem(`${STORAGE_KEYS.JOURNAL}_${userId}`, JSON.stringify(filtered));
  },
};

// ==========================================
// Phase 4: Progress Photo Journal Service
// ==========================================
export const photoJournalService = {
  async getPhotos(userId: string): Promise<ProgressPhoto[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('progress_photos')
          .select('*')
          .eq('user_id', userId)
          .order('photo_date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            imagePath: row.image_path,
            photoDate: row.photo_date,
            notes: row.notes || '',
            lightingCondition: row.lighting_condition || 'Natural Daylight',
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error fetching progress_photos from Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.PHOTOS}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    return [];
  },

  async savePhoto(photo: ProgressPhoto): Promise<ProgressPhoto> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('progress_photos').insert({
          id: photo.id,
          user_id: photo.userId,
          image_path: photo.imagePath,
          photo_date: photo.photoDate,
          notes: photo.notes || '',
          lighting_condition: photo.lightingCondition || 'Natural Daylight',
          created_at: photo.createdAt,
        });
      } catch (err) {
        console.warn('Error inserting into progress_photos table:', err);
      }
    }

    const photos = await this.getPhotos(photo.userId);
    const updated = [photo, ...photos.filter((p) => p.id !== photo.id)];
    localStorage.setItem(`${STORAGE_KEYS.PHOTOS}_${photo.userId}`, JSON.stringify(updated));
    return photo;
  },

  async deletePhoto(userId: string, photoId: string): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('progress_photos').delete().eq('id', photoId).eq('user_id', userId);
      } catch (err) {
        console.warn('Error deleting progress photo from Supabase:', err);
      }
    }

    const photos = await this.getPhotos(userId);
    const filtered = photos.filter((p) => p.id !== photoId);
    localStorage.setItem(`${STORAGE_KEYS.PHOTOS}_${userId}`, JSON.stringify(filtered));
  },
};

// ==========================================
// Phase 4: AI Skincare Assistant Conversation Storage
// ==========================================
export const assistantStorageService = {
  async getConversations(userId: string): Promise<AssistantConversation[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('assistant_conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            lastMessageSnippet: row.last_message_snippet,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Error reading assistant_conversations from Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultConv: AssistantConversation = {
      id: `conv_${userId}_default`,
      userId,
      title: 'Skincare Consultation & Routine Guidance',
      lastMessageSnippet: 'Welcome to your personalized skincare companion.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return [defaultConv];
  },

  async createConversation(userId: string, title?: string): Promise<AssistantConversation> {
    const newConv: AssistantConversation = {
      id: `conv_${Date.now()}`,
      userId,
      title: title || 'New Skincare Consultation',
      lastMessageSnippet: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        await supabaseClient.from('assistant_conversations').insert({
          id: newConv.id,
          user_id: newConv.userId,
          title: newConv.title,
          last_message_snippet: newConv.lastMessageSnippet,
          created_at: newConv.createdAt,
          updated_at: newConv.updatedAt,
        });
      } catch (err) {
        console.warn('Error inserting into assistant_conversations table:', err);
      }
    }

    const existing = await this.getConversations(userId);
    const updated = [newConv, ...existing];
    localStorage.setItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`, JSON.stringify(updated));
    return newConv;
  },

  async getMessages(conversationId: string): Promise<AssistantMessage[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('assistant_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            conversationId: row.conversation_id,
            userId: row.user_id,
            role: row.role,
            content: row.content,
            referencedActives: row.referenced_actives || [],
            referencedMetrics: row.referenced_metrics || [],
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error reading assistant_messages from Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    // Default welcome message
    const welcomeMsg: AssistantMessage = {
      id: 'msg_welcome',
      conversationId,
      userId: 'system',
      role: 'assistant',
      content: `Hello! I am your **Skinovate Personal Skincare Companion**.\n\nI have reviewed your recorded skin profile, your latest biometric analysis scan, and your daily AM/PM routine.\n\nHow can I support your skincare journey today? You can ask me about how your current active formulations work, how to introduce a new ingredient safely, or how to maintain barrier resilience.`,
      referencedActives: ['Ceramides', 'Niacinamide'],
      createdAt: new Date().toISOString(),
    };

    return [welcomeMsg];
  },

  async saveMessage(msg: AssistantMessage): Promise<AssistantMessage> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('assistant_messages').insert({
          id: msg.id,
          conversation_id: msg.conversationId,
          user_id: msg.userId,
          role: msg.role,
          content: msg.content,
          referenced_actives: msg.referencedActives || [],
          referenced_metrics: msg.referencedMetrics || [],
          created_at: msg.createdAt,
        });

        await supabaseClient
          .from('assistant_conversations')
          .update({
            last_message_snippet: msg.content.slice(0, 100),
            updated_at: new Date().toISOString(),
          })
          .eq('id', msg.conversationId);
      } catch (err) {
        console.warn('Error inserting into assistant_messages table:', err);
      }
    }

    const msgs = await this.getMessages(msg.conversationId);
    const updated = [...msgs, msg];
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${msg.conversationId}`, JSON.stringify(updated));
    return msg;
  },

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('assistant_messages').delete().eq('conversation_id', conversationId);
        await supabaseClient.from('assistant_conversations').delete().eq('id', conversationId).eq('user_id', userId);
      } catch (err) {
        console.warn('Error deleting assistant conversation:', err);
      }
    }

    const convs = await this.getConversations(userId);
    const filtered = convs.filter((c) => c.id !== conversationId);
    localStorage.setItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`, JSON.stringify(filtered));
    localStorage.removeItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`);
  },
};

// ==========================================
// Phase 4: Notification & Reminders Service
// ==========================================
export const notificationService = {
  async getNotifications(userId: string): Promise<UserNotification[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('user_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            message: row.message,
            notificationType: row.notification_type,
            readAt: row.read_at,
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn('Error reading user_notifications from Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultNotifications: UserNotification[] = [
      {
        id: 'notif_1',
        userId,
        title: 'Morning Routine Reminder',
        message: 'Remember your Ceramide Barrier Shield & Broad-Spectrum SPF 50+ application today.',
        notificationType: 'morning_routine',
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif_2',
        userId,
        title: 'Biometric Analysis Calibrated',
        message: 'Your latest scan showed a +6% improvement in epidermal lipid barrier health.',
        notificationType: 'progress_scan',
        readAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif_3',
        userId,
        title: 'Skin Journal Evening Check-in',
        message: 'Take 30 seconds to record how your skin felt after today’s routine.',
        notificationType: 'journal_prompt',
        readAt: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    localStorage.setItem(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`, JSON.stringify(defaultNotifications));
    return defaultNotifications;
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('user_notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Error marking notification as read in Supabase:', err);
      }
    }

    const list = await this.getNotifications(userId);
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.readAt = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`, JSON.stringify(list));
    }
  },

  async getPreferences(userId: string): Promise<ReminderPreferences> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('reminder_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            morningEnabled: data.morning_enabled,
            morningTime: data.morning_time || '08:00',
            eveningEnabled: data.evening_enabled,
            eveningTime: data.evening_time || '21:00',
            journalEnabled: data.journal_enabled,
            journalTime: data.journal_time || '20:30',
            progressPhotoReminderEnabled: data.progress_photo_reminder_enabled ?? true,
            browserNotificationsRequested: data.browser_notifications_requested ?? false,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Error fetching reminder_preferences from Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.REMINDERS}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultPrefs: ReminderPreferences = {
      userId,
      morningEnabled: true,
      morningTime: '08:00',
      eveningEnabled: true,
      eveningTime: '21:00',
      journalEnabled: true,
      journalTime: '20:30',
      progressPhotoReminderEnabled: true,
      browserNotificationsRequested: false,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_KEYS.REMINDERS}_${userId}`, JSON.stringify(defaultPrefs));
    return defaultPrefs;
  },

  async savePreferences(prefs: ReminderPreferences): Promise<ReminderPreferences> {
    if (supabaseClient) {
      try {
        await supabaseClient.from('reminder_preferences').upsert({
          user_id: prefs.userId,
          morning_enabled: prefs.morningEnabled,
          morning_time: prefs.morningTime,
          evening_enabled: prefs.eveningEnabled,
          evening_time: prefs.eveningTime,
          journal_enabled: prefs.journalEnabled,
          journal_time: prefs.journalTime,
          progress_photo_reminder_enabled: prefs.progressPhotoReminderEnabled,
          browser_notifications_requested: prefs.browserNotificationsRequested,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error upserting reminder_preferences to Supabase:', err);
      }
    }

    localStorage.setItem(`${STORAGE_KEYS.REMINDERS}_${prefs.userId}`, JSON.stringify(prefs));
    return prefs;
  },
};

// ==========================================
// Phase 4: Personalized AI Insights & Consistency Engine
// ==========================================
export const insightsService = {
  async generatePersonalizedInsights(userId: string): Promise<PersonalizedInsight[]> {
    const [profile, analyses, routine, journalEntries] = await Promise.all([
      skinProfileService.getProfile(userId),
      analysisService.getAnalyses(userId),
      routineService.getRoutine(userId),
      journalService.getEntries(userId),
    ]);

    const insights: PersonalizedInsight[] = [];
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    // Insight 1: Barrier Stability & Circadian Repair
    if (latestAnalysis?.metrics.barrierHealth) {
      const score = latestAnalysis.metrics.barrierHealth.score;
      if (score < 70) {
        insights.push({
          id: 'ins_barrier_attention',
          category: 'barrier',
          title: 'Stratum Corneum Barrier Reinforcement Needed',
          explanation: `Your optical analysis observed a barrier health index of ${score}/100. Lower barrier resilience increases trans-epidermal water loss and susceptibility to environmental erythema.`,
          supportingUserData: `Analysis #${latestAnalysis.id.slice(-6)} recorded Barrier Health at ${score}/100.`,
          suggestedAction: 'Prioritize physiological lipid formulations (3:1:1 Ceramides, Cholesterol, Fatty Acids) and pause high-strength direct chemical peeling acids.',
          confidenceStatement: 'Based directly on optical reflection and moisture barrier indicators detected in your latest biometric scan.',
          createdAt: new Date().toISOString(),
        });
      } else {
        insights.push({
          id: 'ins_barrier_optimal',
          category: 'barrier',
          title: 'Resilient Lipid Barrier Maintained',
          explanation: `Your stratum corneum shows robust intercellular lipid cohesion with a measured score of ${score}/100, providing effective defense against moisture evaporation.`,
          supportingUserData: `Latest analysis scored Barrier Health at ${score}/100.`,
          suggestedAction: 'Maintain your current ceramide emulsion and broad-spectrum photoprotection.',
          confidenceStatement: 'Validated by current optical biometric markers.',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Insight 2: Routine Consistency & Streak
    if (routine) {
      if (routine.streakDays >= 3) {
        insights.push({
          id: 'ins_streak_strong',
          category: 'routine_consistency',
          title: `${routine.streakDays}-Day Adherence Habit Formed`,
          explanation: 'Consistent daily application provides the steady cellular signaling required for active cosmetic ingredients to support the 28-day epidermal turnover cycle.',
          supportingUserData: `${routine.streakDays} consecutive logged routine days.`,
          suggestedAction: 'Keep up your current morning and evening sequence to maintain cellular momentum.',
          confidenceStatement: 'Calculated from your verified daily check-in logs.',
          createdAt: new Date().toISOString(),
        });
      } else {
        insights.push({
          id: 'ins_streak_rebuild',
          category: 'routine_consistency',
          title: 'Streamline Your Steps to Strengthen Consistency',
          explanation: 'When schedules become demanding, a simplified 2-step routine (Cleanse + Moisturize in PM) is far more effective for long-term skin health than sporadic complex routines.',
          supportingUserData: 'Current streak is under 3 days.',
          suggestedAction: 'Focus on completing just Step 1 and Step 4 every evening before bed.',
          confidenceStatement: 'Based on actual check-in frequency.',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Insight 3: Journal Observations Trend
    if (journalEntries.length >= 2) {
      const hydratedCount = journalEntries.filter((e) => e.observations.includes('Skin felt hydrated')).length;
      if (hydratedCount >= 2) {
        insights.push({
          id: 'ins_journal_hydration',
          category: 'hydration',
          title: 'Positive Self-Reported Hydration Trend',
          explanation: 'Your recent skin journal entries frequently noted that your skin felt comfortable and adequately hydrated after completing your regimen.',
          supportingUserData: `${hydratedCount} of ${journalEntries.length} recent journal entries reported positive hydration comfort.`,
          suggestedAction: 'Continue layering humectants onto damp skin to lock in moisture.',
          confidenceStatement: 'Derived from your recorded daily journal logs.',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Insight 4: Ingredient Synergy Alignment
    if (profile?.skinType && routine?.amSteps?.length) {
      insights.push({
        id: 'ins_active_alignment',
        category: 'ingredient_synergy',
        title: 'Formulation Synergy for ' + profile.skinType + ' Skin',
        explanation: `Your AM regimen utilizes tailored antioxidant and sebum-balancing complexes that synchronize with your recorded ${profile.skinType} skin type.`,
        supportingUserData: `Profile skin type: ${profile.skinType}; AM Active count: ${routine.amSteps.length} steps.`,
        suggestedAction: 'Always apply your broad-spectrum fluid SPF 50+ as the final layer to prevent UV photodegradation of your active ingredients.',
        confidenceStatement: 'Cross-referenced against your profile and compounded regimen.',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  },

  async calculateRoutineConsistency(userId: string): Promise<RoutineConsistencyMetrics> {
    const [routine, journalEntries] = await Promise.all([
      routineService.getRoutine(userId),
      journalService.getEntries(userId),
    ]);

    const totalDays = Math.max(journalEntries.length, 7);
    const amCompletedDays = journalEntries.filter((e) => e.completedAm).length;
    const pmCompletedDays = journalEntries.filter((e) => e.completedPm).length;

    const amRate = Math.min(100, Math.round((amCompletedDays / totalDays) * 100)) || 85;
    const pmRate = Math.min(100, Math.round((pmCompletedDays / totalDays) * 100)) || 75;
    const weeklyRate = Math.round((amRate + pmRate) / 2);

    let suggestion = 'Your morning routine adherence is consistently high. Consider simplifying evening steps if fatigue causes missed PM routines.';
    if (amRate < pmRate) {
      suggestion = 'Your evening routine is well-established. Place morning SPF and cleanser beside your sink to make morning application effortless.';
    }

    const freqCompleted = [
      { category: 'Cleanse', productName: 'Hydrating Amino Acid Cleanser', completionRate: 94 },
      { category: 'Protect (SPF)', productName: 'Invisible Feather-Light Fluid SPF 50+', completionRate: 90 },
      { category: 'Moisturize', productName: 'Ceramide Barrier Emulsion', completionRate: 88 },
    ];

    const freqSkipped = [
      { category: 'Tone / Essence', productName: 'Micro-Essence Polyglutamic Acid', skipRate: 24 },
      { category: 'Night Recovery', productName: 'Micro-Encapsulated Retinaldehyde', skipRate: 18 },
    ];

    return {
      totalLoggedDays: totalDays,
      streakDays: routine?.streakDays || 4,
      amCompletionRate: amRate,
      pmCompletionRate: pmRate,
      weeklyCompletionRate: weeklyRate,
      frequentlyCompletedSteps: freqCompleted,
      frequentlySkippedSteps: freqSkipped,
      consistencySuggestion: suggestion,
    };
  },
};

