-- Migration: 0003_portal

-- Activation token on project_suppliers (one-time link to activate account + join project)
ALTER TABLE project_suppliers ADD COLUMN activation_token TEXT;
ALTER TABLE project_suppliers ADD COLUMN activation_token_expires_at TEXT;
ALTER TABLE project_suppliers ADD COLUMN portal_user_id TEXT REFERENCES users(id);

-- Cost field on requirement_responses
ALTER TABLE requirement_responses ADD COLUMN cost_amount REAL;
ALTER TABLE requirement_responses ADD COLUMN cost_currency TEXT DEFAULT 'EUR';
ALTER TABLE requirement_responses ADD COLUMN cost_note TEXT;

-- Financial data per supplier per project
CREATE TABLE IF NOT EXISTS financial_data (
  id TEXT PRIMARY KEY,
  project_supplier_id TEXT NOT NULL REFERENCES project_suppliers(id) ON DELETE CASCADE UNIQUE,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Betriebskosten
  ops_one_time REAL,
  ops_license_per_month REAL,
  ops_maintenance_per_month REAL,
  ops_other_per_month REAL,

  -- Anpassungskosten (Tagessätze)
  adapt_rate_pm REAL,
  adapt_rate_consulting REAL,
  adapt_rate_development REAL,

  -- Implementierungskosten
  impl_interfaces REAL,
  impl_data_migration REAL,
  impl_training REAL,
  impl_project_mgmt REAL,
  impl_consulting REAL,
  impl_other REAL,

  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ps_activation_token ON project_suppliers(activation_token);
CREATE INDEX IF NOT EXISTS idx_financial_ps ON financial_data(project_supplier_id);
