-- ============================================================================
-- UIKEY LABS (Betul, MP) — Supabase Merchant Portal Database Schema (v2)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oaflqjkflwhrkalsfjqw/sql/new
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text unique not null,
  owner_name text not null default '',
  mobile_number text not null default '',
  shop_name text not null,
  shop_address text not null default 'Betul, Madhya Pradesh',
  category text default 'Retail & Local Business',
  upi_id text not null default '9424647849@ybl',
  fixed_amount numeric(12, 2) not null default 0,
  payment_note text default '',
  city text default 'Betul, Madhya Pradesh',
  qr_code_url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Upgrade existing public.shops table if it was created with the v1 schema:
alter table public.shops add column if not exists owner_name text not null default '';
alter table public.shops add column if not exists mobile_number text not null default '';
alter table public.shops add column if not exists shop_address text not null default 'Betul, Madhya Pradesh';
alter table public.shops add column if not exists fixed_amount numeric(12, 2) not null default 0;
alter table public.shops add column if not exists payment_note text default '';

-- Enable Row Level Security (RLS)
alter table public.shops enable row level security;

-- Drop existing policies before recreating cleanly
drop policy if exists "Shop owners can view their own shop" on public.shops;
drop policy if exists "Shop owners can insert their own shop" on public.shops;
drop policy if exists "Shop owners can update their own shop" on public.shops;
drop policy if exists "Public anon portal can sync verified shops" on public.shops;

-- Allow authenticated and portal users to read/upsert their shop row by owner_email
create policy "Public anon portal can sync verified shops"
  on public.shops
  for all
  using (true)
  with check (true);

-- Seed a default demo shop record for instant testing (demo@uikeylabs.in)
insert into public.shops (
  owner_email,
  owner_name,
  mobile_number,
  shop_name,
  shop_address,
  category,
  upi_id,
  fixed_amount,
  payment_note,
  city,
  qr_code_url
)
values (
  'demo@uikeylabs.in',
  'Mahesh Kumar Uikey',
  '9424647849',
  'UikeyLabs Digital Store (Betul MP)',
  'Ganj Main Road, Near Bus Stand, Betul, MP 460001',
  'IT & Digital Marketing Agency',
  '9424647849@ybl',
  500.00,
  'UikeyLabs Merchant Payment',
  'Betul, Madhya Pradesh',
  'https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=upi%3A%2F%2Fpay%3Fpa%3D9424647849%40ybl%26pn%3DUikeyLabs%2520Digital%2520Store%26am%3D500.00%26cu%3DINR'
)
on conflict (owner_email) do update set
  owner_name = excluded.owner_name,
  mobile_number = excluded.mobile_number,
  shop_name = excluded.shop_name,
  shop_address = excluded.shop_address,
  upi_id = excluded.upi_id,
  fixed_amount = excluded.fixed_amount,
  qr_code_url = excluded.qr_code_url;
