-- adtender initial schema
-- Migration: 0001_initial_schema

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','berater','kunde','anbieter')),
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('draft','active','completed','cancelled')),
  phase TEXT NOT NULL DEFAULT 'erstellung' CHECK(phase IN ('erstellung','ausschreibung','bewertung','entscheidung')),
  phase_start_erstellung TEXT,
  phase_end_erstellung TEXT,
  phase_start_ausschreibung TEXT,
  phase_end_ausschreibung TEXT,
  phase_start_bewertung TEXT,
  phase_end_bewertung TEXT,
  phase_start_entscheidung TEXT,
  phase_end_entscheidung TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address_street TEXT,
  address_city TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'Deutschland',
  description TEXT,
  website TEXT,
  logo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_suppliers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  contact_email TEXT,
  invitation_token TEXT UNIQUE,
  invitation_sent_at TEXT,
  portal_opened_at TEXT,
  submitted_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','invited','portal_opened','submitted','completed','excluded')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, supplier_id)
);

-- Seed: default tenant and admin user (password: demo1234)
INSERT OR IGNORE INTO tenants (id, name, slug) VALUES
  ('tenant-adesso', 'adesso SE', 'adesso');

-- password hash for 'demo1234' using PBKDF2 placeholder (replaced by real hash on first login)
INSERT OR IGNORE INTO users (id, tenant_id, email, name, role, password_hash) VALUES
  ('user-admin', 'tenant-adesso', 'admin@adtender.de', 'Admin User', 'admin', 'demo:demo1234'),
  ('user-berater', 'tenant-adesso', 'berater@adtender.de', 'Diego Steger', 'berater', 'demo:demo1234'),
  ('user-kunde', 'tenant-adesso', 'kunde@adtender.de', 'Kunde Mustermann', 'kunde', 'demo:demo1234');
