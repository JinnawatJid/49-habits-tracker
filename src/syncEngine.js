// Supabase Real-Time Multi-Device Sync Engine
import { supabase } from './supabaseClient';

// Fetch latest habit data for a Sync Code from Supabase
export const fetchSupabaseData = async (syncCode) => {
  try {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('sync_code', syncCode)
      .single();

    if (error) {
      console.log('Supabase fetch notice:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.log('Supabase fetch exception:', e);
    return null;
  }
};

// Push / Upsert habit data to Supabase by Sync Code
export const pushSupabaseData = async (syncCode, payload) => {
  try {
    const { error } = await supabase
      .from('user_habits')
      .upsert({
        sync_code: syncCode,
        active_habit: payload.activeHabit,
        mastered_habits: payload.masteredHabits,
        todos: payload.todos,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sync_code' });

    if (error) {
      console.log('Supabase upsert notice:', error.message);
    }
  } catch (e) {
    console.log('Supabase push exception:', e);
  }
};

// Subscribe to Real-Time Supabase Changes for a Sync Code
export const subscribeSupabaseRealtime = (syncCode, onUpdate) => {
  const channel = supabase
    .channel(`realtime:user_habits:${syncCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_habits',
        filter: `sync_code=eq.${syncCode}`
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
