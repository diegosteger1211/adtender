CREATE TABLE supplier_documents (
  id TEXT PRIMARY KEY,
  project_supplier_id TEXT NOT NULL REFERENCES project_suppliers(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK(doc_type IN ('presentation','offer','contract')),
  filename TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_supplier_documents_ps ON supplier_documents(project_supplier_id, doc_type);
