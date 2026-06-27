-- Supplier access rights and shortlist flag
ALTER TABLE project_suppliers ADD COLUMN access_anforderungen INTEGER NOT NULL DEFAULT 1;
ALTER TABLE project_suppliers ADD COLUMN access_szenarien INTEGER NOT NULL DEFAULT 1;
ALTER TABLE project_suppliers ADD COLUMN access_finanzen INTEGER NOT NULL DEFAULT 1;
ALTER TABLE project_suppliers ADD COLUMN shortlisted INTEGER NOT NULL DEFAULT 0;

-- Project members (users with project-level access)
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'berater',
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
