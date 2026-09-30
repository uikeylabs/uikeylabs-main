-- ============================================================================
-- UIKEY LABS — SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this script in your Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Create the 'shops' table for authenticated merchants
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_email TEXT UNIQUE NOT NULL,
  shop_name TEXT NOT NULL,
  category TEXT DEFAULT 'Retail & Local Business',
  upi_id TEXT DEFAULT '',
  city TEXT DEFAULT 'Betul, MP',
  qr_code_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on the 'shops' table
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Allow authenticated shop owners to SELECT only their own shop row
CREATE POLICY "Shop owners can view their own shop"
  ON public.shops
  FOR SELECT
  TO authenticated
  USING (lower(owner_email) = lower(auth.jwt() ->> 'email'));

-- 4. RLS Policy: Allow authenticated shop owners to INSERT their own shop row
CREATE POLICY "Shop owners can insert their own shop"
  ON public.shops
  FOR INSERT
  TO authenticated
  WITH CHECK (lower(owner_email) = lower(auth.jwt() ->> 'email'));

-- 5. RLS Policy: Allow authenticated shop owners to UPDATE only their own shop row
CREATE POLICY "Shop owners can update their own shop"
  ON public.shops
  FOR UPDATE
  TO authenticated
  USING (lower(owner_email) = lower(auth.jwt() ->> 'email'))
  WITH CHECK (lower(owner_email) = lower(auth.jwt() ->> 'email'));
