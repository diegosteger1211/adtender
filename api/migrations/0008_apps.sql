CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  project_id TEXT REFERENCES projects(id),
  title TEXT NOT NULL DEFAULT 'Neue Notiz',
  content TEXT,
  color TEXT DEFAULT 'default',
  pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_notes_tenant ON notes(tenant_id, user_id);

CREATE TABLE custom_templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- 'requirements', 'checklist', 'scenarios', 'scoring', 'email'
  category TEXT,
  name TEXT NOT NULL,
  description TEXT,
  data TEXT NOT NULL, -- JSON
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE supplier_prequalifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  evaluator_id TEXT NOT NULL REFERENCES users(id),
  template_name TEXT NOT NULL DEFAULT 'Standard',
  scores TEXT NOT NULL, -- JSON: [{criterion, weight, score, note}]
  total_score REAL,
  recommendation TEXT, -- 'qualified', 'conditional', 'disqualified'
  notes TEXT,
  evaluated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_preq_tenant ON supplier_prequalifications(tenant_id, supplier_id);
