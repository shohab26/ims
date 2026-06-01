-- Run this file in psql: \i schema.sql
-- Or: psql -U <user> -d <database> -f schema.sql

CREATE TABLE IF NOT EXISTS book (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price NUMERIC(10,2),
    dept_id INT
);

CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    wname VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    cname VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    pcode VARCHAR(100),
    pname VARCHAR(255),
    pcate INT,
    price NUMERIC(10,2),
    createdate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    address TEXT,
    cell VARCHAR(50),
    contact_person VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    address TEXT,
    phone VARCHAR(50),
    customer_name VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    quantity NUMERIC(10,2),
    productid INT,
    warehouseid INT,
    updatedate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    quantity NUMERIC(10,2),
    productid INT,
    unit_price NUMERIC(10,2),
    statusid INT,
    total_price NUMERIC(10,2),
    vendorid INT,
    createdate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_details (
    id SERIAL PRIMARY KEY,
    quantity NUMERIC(10,2),
    productid INT,
    customerid INT,
    deliverydate DATE,
    unit_price NUMERIC(10,2),
    total_price NUMERIC(10,2),
    statusid INT,
    createdate TIMESTAMP
);
