CREATE TABLE project_checklists (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER,
  r2_key TEXT NOT NULL UNIQUE,
  uploaded_by TEXT REFERENCES users(id),
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE checklist_sheet_classifications (
  id TEXT PRIMARY KEY,
  checklist_id TEXT NOT NULL REFERENCES project_checklists(id) ON DELETE CASCADE,
  sheet_name TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'Sonstiges',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(checklist_id, sheet_name)
);
