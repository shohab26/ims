-- Adds a DB-level uniqueness guarantee on products.pcode (the product SKU/code).
-- The API already rejects duplicate codes via a pre-insert check (see
-- middleware/validation.middleware.js checkUnique), but that check has a small
-- race window under concurrent requests — this constraint closes it and is the
-- authoritative source of truth. Idempotent: re-running is safe.
--
-- NOTE: if any existing rows already share a duplicate, non-null pcode, this
-- ALTER will fail until those duplicates are resolved (e.g. by renaming or
-- blanking one of them). Empty/duplicate NULL pcodes are unaffected — Postgres
-- UNIQUE constraints allow multiple NULLs.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_pcode_unique'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_pcode_unique UNIQUE (pcode);
    END IF;
END $$;
