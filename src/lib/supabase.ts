import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Désactiver la persistance
    autoRefreshToken: false, // Désactiver le rafraîchissement automatique
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});
