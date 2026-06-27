-- Migration: 0002_requirements

CREATE TABLE IF NOT EXISTS capabilities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'functional' CHECK(type IN ('functional','non_functional')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY,
  capability_id TEXT NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  requirement_id TEXT,           -- custom ID e.g. ANL-07
  requirement_type TEXT,         -- e.g. Muss, Soll, Kann
  category1 TEXT,
  category2 TEXT,
  category3 TEXT,
  category4 TEXT,
  requirement TEXT NOT NULL,     -- title
  description TEXT,
  priority TEXT CHECK(priority IN ('A','B','C')),
  weight REAL NOT NULL DEFAULT 1.0,
  is_critical INTEGER NOT NULL DEFAULT 0,
  acceptance_criteria TEXT,
  source TEXT,
  demo_scenario TEXT,
  comment TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requirement_responses (
  id TEXT PRIMARY KEY,
  requirement_id TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  project_supplier_id TEXT NOT NULL REFERENCES project_suppliers(id) ON DELETE CASCADE,
  fulfillment TEXT CHECK(fulfillment IN ('standard','konfiguration','customizing','programmierung','nicht_vorhanden')),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(requirement_id, project_supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_capabilities_project ON capabilities(project_id);
CREATE INDEX IF NOT EXISTS idx_requirements_capability ON requirements(capability_id);
CREATE INDEX IF NOT EXISTS idx_requirements_project ON requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_req_responses_supplier ON requirement_responses(project_supplier_id);
