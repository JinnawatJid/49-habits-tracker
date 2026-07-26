// Supabase Real-Time Multi-Device Sync Engine with Theme Support
import { supabase } from './supabaseClient';

export const fetchSupabaseData = async (syncCode) => {
  if (!syncCode) return null;
  try {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*')
      .eq('sync_code', syncCode)
      .single();

    if (error || !data) {
      console.log('Supabase fetch notice:', error?.message);
      return null;
    }

    if (data.active_habit) {
      return {
        currentLevel: data.active_habit.currentLevel || 1,
        activeCheckIns: Array.isArray(data.active_habit.activeCheckIns) ? data.active_habit.activeCheckIns : [],
        masteredLevels: Array.isArray(data.active_habit.masteredLevels) ? data.active_habit.masteredLevels : [],
        theme: data.active_habit.theme || 'light'
      };
    }
    return null;
  } catch (e) {
    console.log('Supabase fetch exception:', e);
    return null;
  }
};

export const pushSupabaseData = async (syncCode, payload) => {
  if (!syncCode) return;
  try {
    const { error } = await supabase
      .from('user_habits')
      .upsert({
        sync_code: syncCode,
        active_habit: {
          currentLevel: payload.currentLevel,
          activeCheckIns: payload.activeCheckIns,
          masteredLevels: payload.masteredLevels,
          theme: payload.theme || 'light'
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'sync_code' });

    if (error) {
      console.log('Supabase upsert notice:', error.message);
    }
  } catch (e) {
    console.log('Supabase push exception:', e);
  }
};

export const subscribeSupabaseRealtime = (syncCode, onUpdate) => {
  if (!syncCode) return () => {};

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
        if (payload.new && payload.new.active_habit) {
          onUpdate({
            currentLevel: payload.new.active_habit.currentLevel || 1,
            activeCheckIns: Array.isArray(payload.new.active_habit.activeCheckIns) ? payload.new.active_habit.activeCheckIns : [],
            masteredLevels: Array.isArray(payload.new.active_habit.masteredLevels) ? payload.new.active_habit.masteredLevels : [],
            theme: payload.new.active_habit.theme || 'light'
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
