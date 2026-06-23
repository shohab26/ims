-- Soft delete + Trash + Restore migration
-- Adds is_deleted, deleted_at, deleted_by columns to every business table.
-- Existing rows default to is_deleted=FALSE, so no data migration is needed.
-- Idempotent: re-running is safe.

-- products
ALTER TABLE products       ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products       ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE products       ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- vendors
ALTER TABLE vendors        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE vendors        ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE vendors        ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- customers
ALTER TABLE customers      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers      ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE customers      ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- categories
ALTER TABLE categories     ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE categories     ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE categories     ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- warehouses
ALTER TABLE warehouses     ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE warehouses     ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE warehouses     ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- status (named singularly; "status" is a reserved word but valid as a table name)
ALTER TABLE status         ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE status         ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE status         ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- stocks
ALTER TABLE stocks         ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE stocks         ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE stocks         ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- order_details (orders)
ALTER TABLE order_details  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE order_details  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE order_details  ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- delivery_details (delivery)
ALTER TABLE delivery_details ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE delivery_details ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE delivery_details ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- invoices
ALTER TABLE invoices       ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE invoices       ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE invoices       ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- invoice_items (only soft-deleted as a side effect of soft-deleting the parent invoice)
ALTER TABLE invoice_items  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE invoice_items  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;
ALTER TABLE invoice_items  ADD COLUMN IF NOT EXISTS deleted_by  INT REFERENCES users(id);

-- Indexes for the trash-listing queries (WHERE is_deleted=TRUE) on the bigger tables
CREATE INDEX IF NOT EXISTS idx_products_is_deleted       ON products       (is_deleted);
CREATE INDEX IF NOT EXISTS idx_vendors_is_deleted        ON vendors        (is_deleted);
CREATE INDEX IF NOT EXISTS idx_customers_is_deleted      ON customers      (is_deleted);
CREATE INDEX IF NOT EXISTS idx_invoices_is_deleted       ON invoices       (is_deleted);
CREATE INDEX IF NOT EXISTS idx_order_details_is_deleted  ON order_details  (is_deleted);
CREATE INDEX IF NOT EXISTS idx_delivery_details_is_deleted ON delivery_details (is_deleted);
