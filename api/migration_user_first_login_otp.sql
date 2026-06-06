-- ============================================================
-- Migration: First-login password change with email OTP
-- Run in Supabase SQL Editor or psql
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS password_change_otp_hash TEXT,
    ADD COLUMN IF NOT EXISTS password_change_otp_expires_at TIMESTAMP;

UPDATE users
SET must_change_password = FALSE
WHERE must_change_password IS NULL;
