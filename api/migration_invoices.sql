-- Invoice / Billing System Migration
-- Run: psql -U <user> -d <database> -f migration_invoices.sql

CREATE TABLE IF NOT EXISTS invoices (
    id              SERIAL PRIMARY KEY,
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    customerid      INT NOT NULL REFERENCES customers(id),
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_percent     NUMERIC(5,2)  NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    status          VARCHAR(30)   NOT NULL DEFAULT 'draft',   -- draft | sent | paid | overdue | cancelled
    notes           TEXT,
    createdate      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id          SERIAL PRIMARY KEY,
    invoiceid   INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    productid   INT NOT NULL REFERENCES products(id),
    description VARCHAR(255),
    quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
    total       NUMERIC(12,2) NOT NULL DEFAULT 0
);
