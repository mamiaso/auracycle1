import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SymptomLog {
  id: string;
  user_id: string;
  symptoms: string[];
  pain_level: number;
  cycle_day: number | null;
  created_at: string;
}
