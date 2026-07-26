import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rrowrdbpqloyaptdeggd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Y43zZ4v3XNIKc6dkgmMAMA_lE9JyhKK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
  realtime: { params: { eventsPerSecond: 10 } }
});
