-- CALM AI — Supabase Database Schema
-- Run this entire file in Supabase → SQL Editor → Run

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  handle TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro')),
  region TEXT DEFAULT 'india' CHECK (region IN ('india', 'global')),
  niches TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  tone TEXT,
  goal TEXT,
  frequency TEXT DEFAULT '3-4',
  audience TEXT,
  about TEXT,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, plan)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'plan', 'starter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. USAGE TABLE (server-side limits)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- format: 'YYYY-MM'
  ideas INTEGER DEFAULT 0,
  scripts INTEGER DEFAULT 0,
  captions INTEGER DEFAULT 0,
  chat INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

-- ==========================================
-- 3. SAVED IDEAS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  idea_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. PAYMENTS TABLE (Razorpay webhook logs)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_subscription_id TEXT,
  plan TEXT,
  amount INTEGER, -- in paise/cents
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending', -- pending | captured | failed | refunded
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Profiles: users can only read/write their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do everything on profiles" ON public.profiles USING (auth.role() = 'service_role');

-- Usage: users can only see their own
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages usage" ON public.usage USING (auth.role() = 'service_role');

-- Saved ideas: users own their ideas
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved ideas" ON public.saved_ideas USING (auth.uid() = user_id);

-- Payments: users can only see their own
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages payments" ON public.payments USING (auth.role() = 'service_role');

-- ==========================================
-- 6. INDEXES (performance)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON public.usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_user ON public.saved_ideas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);

-- ==========================================
-- DONE. Your Calm AI database is ready.
-- ==========================================
