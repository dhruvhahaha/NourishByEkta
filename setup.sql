-- ================================================
-- NourishByEkta — Supabase Security Setup
-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard → SQL Editor
-- ================================================

-- ============================================
-- STEP 1: Create the content table
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    data        JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_content (id, data)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Enable Row Level Security (RLS)
-- This is what PROTECTS your data!
-- ============================================
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop any old policies
DROP POLICY IF EXISTS "Public write" ON site_content;
DROP POLICY IF EXISTS "Public read"  ON site_content;
DROP POLICY IF EXISTS "Authenticated write" ON site_content;
DROP POLICY IF EXISTS "Admin write" ON site_content;

-- POLICY 1: Anyone can READ (visitors need this to load site content)
CREATE POLICY "Public read"
    ON site_content FOR SELECT
    TO public
    USING (true);

-- POLICY 2: Only the specific admin email can write (nourishbyekta@gmail.com)
CREATE POLICY "Admin write"
    ON site_content FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'nourishbyekta@gmail.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'nourishbyekta@gmail.com');

-- ============================================
-- STEP 3: Create your admin user
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- Email: your-email@example.com
-- Password: (choose a strong password)
--
-- This email+password is what you'll use to login to the admin panel.
-- It is NOT stored in your code — it lives securely in Supabase Auth.
-- ============================================
