-- Supabase SQL Schema for 21-Day Habit Challenge Multi-Device Sync

CREATE TABLE IF NOT EXISTS public.user_habits (
  sync_code TEXT PRIMARY KEY,
  active_habit JSONB,
  mastered_habits JSONB,
  todos JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Public Access for Sync Code Pairing
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on user_habits" 
  ON public.user_habits FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert/update on user_habits" 
  ON public.user_habits FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Enable Real-Time Listener on user_habits table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_habits;
