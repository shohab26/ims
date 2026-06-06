-- ============================================================
-- Migration: Granular Permissions Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    module_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    module_id INT REFERENCES modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    UNIQUE(role_id, module_id)
);

-- Insert base modules if they don't exist
INSERT INTO modules (module_name, display_name) VALUES
    ('products', 'Products'),
    ('stocks', 'Stocks'),
    ('categories', 'Categories'),
    ('warehouse', 'Warehouses'),
    ('orders', 'Purchase Orders'),
    ('delivery', 'Deliveries'),
    ('vendors', 'Vendors'),
    ('customers', 'Customers'),
    ('status', 'Status')
ON CONFLICT (module_name) DO NOTHING;
