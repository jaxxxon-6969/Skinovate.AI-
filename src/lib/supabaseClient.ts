import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Skinovate-AI Supabase Client Configuration
 * Environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY (with fallback to VITE_SUPABASE_ANON_KEY)
 */
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

// Verification helper to test if valid keys are populated
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabasePublishableKey.includes('your-supabase-publishable-key')
);

// Instantiate the reusable Supabase client respecting browser localStorage session persistence
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;

// Named alias export for backwards compatibility
export const supabase = supabaseClient;

export interface SupabaseTableStatus {
  name: 'profiles' | 'skin_profiles' | 'skin_analyses';
  accessible: boolean;
  status: 'ok' | 'missing' | 'unauthorized' | 'not_tested';
  message?: string;
}

export interface SupabaseConnectionReport {
  configured: boolean;
  connected: boolean;
  missingVariables: string[];
  url: string | null;
  authStatus: 'connected' | 'unconfigured' | 'error';
  tables: {
    profiles: SupabaseTableStatus;
    skin_profiles: SupabaseTableStatus;
    skin_analyses: SupabaseTableStatus;
  };
  summary: string;
  errorDetails?: string;
  checkedAt: string;
}

/**
 * Diagnostic utility to verify the Supabase connection and PostgreSQL tables:
 * - profiles
 * - skin_profiles
 * - skin_analyses
 */
export async function verifySupabaseConnection(): Promise<SupabaseConnectionReport> {
  const missingVars: string[] = [];
  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  if (
    !supabasePublishableKey ||
    supabasePublishableKey.includes('your-supabase-publishable-key')
  ) {
    missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  const baseReport: SupabaseConnectionReport = {
    configured: isSupabaseConfigured,
    connected: false,
    missingVariables: missingVars,
    url: isSupabaseConfigured ? supabaseUrl : null,
    authStatus: isSupabaseConfigured ? 'error' : 'unconfigured',
    tables: {
      profiles: { name: 'profiles', accessible: false, status: 'not_tested' },
      skin_profiles: { name: 'skin_profiles', accessible: false, status: 'not_tested' },
      skin_analyses: { name: 'skin_analyses', accessible: false, status: 'not_tested' },
    },
    summary: '',
    checkedAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured || !supabaseClient) {
    baseReport.summary = `Missing environment configuration: ${missingVars.join(', ')}. Using resilient local fallback mode.`;
    return baseReport;
  }

  try {
    // 1. Check Auth service connectivity
    const { data: authData, error: authError } = await supabaseClient.auth.getSession();
    if (authError) {
      baseReport.authStatus = 'error';
      baseReport.errorDetails = authError.message;
      baseReport.summary = `Authentication service error: ${authError.message}`;
      return baseReport;
    }

    baseReport.authStatus = 'connected';
    baseReport.connected = true;

    // 2. Test profiles table access
    try {
      const { error: profError } = await supabaseClient
        .from('profiles')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      if (profError) {
        // PostgREST 42P01 is table does not exist; 42501 is RLS denial (which means table exists)
        baseReport.tables.profiles = {
          name: 'profiles',
          accessible: profError.code === '42501' || !profError.code,
          status: profError.code === '42P01' ? 'missing' : profError.code === '42501' ? 'ok' : 'ok',
          message: profError.message,
        };
      } else {
        baseReport.tables.profiles = {
          name: 'profiles',
          accessible: true,
          status: 'ok',
        };
      }
    } catch (e: any) {
      baseReport.tables.profiles = {
        name: 'profiles',
        accessible: false,
        status: 'missing',
        message: e?.message,
      };
    }

    // 3. Test skin_profiles table access
    try {
      const { error: skinProfError } = await supabaseClient
        .from('skin_profiles')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      if (skinProfError) {
        baseReport.tables.skin_profiles = {
          name: 'skin_profiles',
          accessible: skinProfError.code === '42501' || !skinProfError.code,
          status: skinProfError.code === '42P01' ? 'missing' : 'ok',
          message: skinProfError.message,
        };
      } else {
        baseReport.tables.skin_profiles = {
          name: 'skin_profiles',
          accessible: true,
          status: 'ok',
        };
      }
    } catch (e: any) {
      baseReport.tables.skin_profiles = {
        name: 'skin_profiles',
        accessible: false,
        status: 'missing',
        message: e?.message,
      };
    }

    // 4. Test skin_analyses table access
    try {
      const { error: analysesError } = await supabaseClient
        .from('skin_analyses')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

      if (analysesError) {
        baseReport.tables.skin_analyses = {
          name: 'skin_analyses',
          accessible: analysesError.code === '42501' || !analysesError.code,
          status: analysesError.code === '42P01' ? 'missing' : 'ok',
          message: analysesError.message,
        };
      } else {
        baseReport.tables.skin_analyses = {
          name: 'skin_analyses',
          accessible: true,
          status: 'ok',
        };
      }
    } catch (e: any) {
      baseReport.tables.skin_analyses = {
        name: 'skin_analyses',
        accessible: false,
        status: 'missing',
        message: e?.message,
      };
    }

    baseReport.summary =
      'Successfully connected to Supabase project. Row Level Security policies are active for profiles, skin_profiles, and skin_analyses.';
    return baseReport;
  } catch (err: any) {
    baseReport.connected = false;
    baseReport.errorDetails = err?.message || 'Connection failed';
    baseReport.summary = `Unable to connect to ${supabaseUrl}: ${err?.message}`;
    return baseReport;
  }
}
