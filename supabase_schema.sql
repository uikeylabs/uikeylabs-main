-- ============================================================================
-- UIKEY LABS (uikeylabs.com) — OFFICIAL SUPABASE POSTGRESQL DATABASE SCHEMA
-- Copy this entire file and paste it into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Click "RUN"
-- ============================================================================

-- 1. MERCHANTS TABLE (For Free Shop / School / Cafe / Clinic QR Sign Up & Sign In)
CREATE TABLE IF NOT EXISTS public.merchants (
    id BIGSERIAL PRIMARY KEY,
    merchant_code TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '🛒 VERIFIED RETAIL & KIRANA STORE',
    upi_id TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    password_hash TEXT NOT NULL DEFAULT '1234',
    tagline TEXT DEFAULT 'Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!',
    last_amount NUMERIC(12,2) DEFAULT 250.00,
    total_bills INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BILLS TABLE (Stores Quick-Bill Counter Transactions for Each Merchant)
CREATE TABLE IF NOT EXISTS public.bills (
    id BIGSERIAL PRIMARY KEY,
    merchant_code TEXT NOT NULL,
    business_name TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    note TEXT DEFAULT 'Counter Bill Payment',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENCY LEADS TABLE (Stores Website Inquiries & Speed Audit Leads for UIKEY LABS)
CREATE TABLE IF NOT EXISTS public.agency_leads (
    id BIGSERIAL PRIMARY KEY,
    business_name TEXT NOT NULL,
    category TEXT DEFAULT '',
    mobile TEXT DEFAULT '',
    city TEXT DEFAULT '',
    source TEXT DEFAULT 'Website Inquiry',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC API POLICIES FOR FRONTEND ACCESS
-- ============================================================================
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_leads ENABLE ROW LEVEL SECURITY;

-- Allow frontend via Anon Key to Read, Insert (Sign Up), and Update Merchants
DROP POLICY IF EXISTS "Allow public read merchants" ON public.merchants;
CREATE POLICY "Allow public read merchants" ON public.merchants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert merchants" ON public.merchants;
CREATE POLICY "Allow public insert merchants" ON public.merchants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update merchants" ON public.merchants;
CREATE POLICY "Allow public update merchants" ON public.merchants FOR UPDATE USING (true);

-- Allow frontend via Anon Key to Read and Insert Bills
DROP POLICY IF EXISTS "Allow public read bills" ON public.bills;
CREATE POLICY "Allow public read bills" ON public.bills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert bills" ON public.bills;
CREATE POLICY "Allow public insert bills" ON public.bills FOR INSERT WITH CHECK (true);

-- Allow frontend via Anon Key to Insert and Read Agency Leads
DROP POLICY IF EXISTS "Allow public insert leads" ON public.agency_leads;
CREATE POLICY "Allow public insert leads" ON public.agency_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read leads" ON public.agency_leads;
CREATE POLICY "Allow public read leads" ON public.agency_leads FOR SELECT USING (true);

-- ============================================================================
-- SEED DEFAULT ACCOUNTS (UIKEY LABS + SAMPLE MERCHANTS)
-- ============================================================================
INSERT INTO public.merchants (merchant_code, business_name, category, upi_id, mobile, email, password_hash, tagline, last_amount, total_bills)
VALUES
  ('UL-100', 'UIKEY LABS', '🏢 REAL ESTATE & CORPORATE OFFICE', 'uikeylabs@ybl', '8770912734', 'contact@uikeylabs.com', '1234', 'Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!', 500, 12),
  ('UL-101', 'SHARMA SUPERMART & KIRANA', '🛒 VERIFIED RETAIL & KIRANA STORE', '9876543210@ybl', '9876543210', 'sharma@supermart.in', '1234', 'Scan & Pay via GPay, PhonePe, Paytm • Thank You, Visit Again!', 250, 8),
  ('UL-102', 'URBAN ROAST CAFE & BAKERY', '☕ ARTISAN CAFE, RESTAURANT & BAKERY', 'urbancafe@okaxis', '9811122334', 'hello@urbancafe.in', '1234', 'Fresh Coffee & Woodfire Pizza • Instant UPI Counter', 320, 15),
  ('UL-103', 'APEX GLOBAL SCHOOL FEE DESK', '🎓 SCHOOL, COLLEGE & COACHING FEE DESK', 'apexschool@sbi', '9755588990', 'accounts@apexschool.edu.in', '1234', 'Official Admission & Monthly Tuition Fee Counter', 1500, 24)
ON CONFLICT (mobile) DO NOTHING;
