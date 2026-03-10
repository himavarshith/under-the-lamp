import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://wzwzeylfwetlzscqafbx.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_WbAHu0arS-lrdQl_NtvZng_cMX7Lg9k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
