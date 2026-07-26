-- Supabase SQL Schema for 21-Day Habit Challenge Multi-Device Sync (Idempotent)

CREATE TABLE IF NOT EXISTS public.user_habits (
  sync_code TEXT PRIMARY KEY,
  active_habit JSONB,
  mastered_habits JSONB,
  todos JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Public Access for Sync Code Pairing
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on user_habits" ON public.user_habits;
DROP POLICY IF EXISTS "Allow public insert/update on user_habits" ON public.user_habits;

CREATE POLICY "Allow public select on user_habits" 
  ON public.user_habits FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert/update on user_habits" 
  ON public.user_habits FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Safely add to Real-Time publication without duplicate errors
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_habits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_habits;
  END IF;
END $$;
