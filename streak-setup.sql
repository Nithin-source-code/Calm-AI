-- GOOGLE SIGN IN SETUP
-- Run this in Supabase SQL Editor after setting up Google OAuth

-- No SQL needed for Google OAuth itself — it's configured in Supabase Dashboard
-- Go to: Supabase → Authentication → Providers → Google → Enable

-- But run this to add streak tracking to profiles:

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_last_active DATE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_ideas_generated INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_scripts_generated INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT now();

-- Function to update streak when user generates content
CREATE OR REPLACE FUNCTION update_streak(user_id UUID)
RETURNS void AS $$
DECLARE
  last_active DATE;
  current_streak INTEGER;
BEGIN
  SELECT streak_last_active, streak_days
  INTO last_active, current_streak
  FROM profiles WHERE id = user_id;

  IF last_active = CURRENT_DATE THEN
    -- Already active today, no change
    RETURN;
  ELSIF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day — increment streak
    UPDATE profiles
    SET streak_days = streak_days + 1, streak_last_active = CURRENT_DATE
    WHERE id = user_id;
  ELSE
    -- Streak broken — reset to 1
    UPDATE profiles
    SET streak_days = 1, streak_last_active = CURRENT_DATE
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
