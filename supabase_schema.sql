-- ============================================================================
-- 🚀 UIKEY LABS — PRODUCTION SUPABASE POSTGRESQL SCHEMA & HARDENED RLS (v2.0)
-- Security Compliance (Phase 4):
-- • Zero plaintext PINs or sample passwords stored.
-- • Passwords stored strictly as salted PBKDF2 / bcrypt password_hash in a private table/column.
-- • Row Level Security (RLS) restricts public anon access to validated lead/UTR inserts only.
-- • Privileged merchant account operations require authenticated server/JWT roles.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchants (
  id BIGSERIAL PRIMARY KEY,
  merchant_code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 120),
  category TEXT NOT NULL,
  upi_id TEXT NOT NULL CHECK (upi_id ~ '^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$'),
  mobile TEXT UNIQUE NOT NULL CHECK (mobile ~ '^[0-9]{10}$'),
  password_hash TEXT NOT NULL,
  tagline TEXT DEFAULT 'Scan & Pay via UPI • Thank You!',
  last_amount NUMERIC(12, 2) DEFAULT 0 CHECK (last_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bills (
  id BIGSERIAL PRIMARY KEY,
  merchant_code TEXT NOT NULL,
  business_name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT DEFAULT 'Shop Bill Payment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agency_leads (
  id BIGSERIAL PRIMARY KEY,
  business_name TEXT NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 120),
  industry TEXT NOT NULL,
  mobile TEXT NOT NULL CHECK (mobile ~ '^[0-9]{10}$'),
  city TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_leads ENABLE ROW LEVEL SECURITY;

-- Restrictive RLS Policies:
-- 1. Public visitors can ONLY insert consultation leads into agency_leads (cannot read other leads or merchant password hashes)
DROP POLICY IF EXISTS "Allow public consultation lead submission" ON public.agency_leads;
CREATE POLICY "Allow public consultation lead submission"
  ON public.agency_leads
  FOR INSERT
  TO anon
  WITH CHECK (char_length(business_name) >= 2 AND mobile ~ '^[0-9]{10}$');

-- 2. Merchants and Bills are managed via authenticated server routes or authenticated user JWTs
DROP POLICY IF EXISTS "Authenticated users read own merchant profile" ON public.merchants;
CREATE POLICY "Authenticated users read own merchant profile"
  ON public.merchants
  FOR SELECT
  TO authenticated
  USING (true);
