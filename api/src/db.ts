// D1 database helper — typed row access

export type TenantRow = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export type UserRow = {
  id: string
  tenant_id: string
  email: string
  name: string
  role: 'admin' | 'berater' | 'kunde' | 'anbieter'
  password_hash: string
  is_active: number
  created_at: string
  updated_at: string
}

export type ProjectRow = {
  id: string
  tenant_id: string
  title: string
  category: string
  description: string | null
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  phase: 'erstellung' | 'ausschreibung' | 'bewertung' | 'entscheidung'
  phase_start_erstellung: string | null
  phase_end_erstellung: string | null
  phase_start_ausschreibung: string | null
  phase_end_ausschreibung: string | null
  phase_start_bewertung: string | null
  phase_end_bewertung: string | null
  phase_start_entscheidung: string | null
  phase_end_entscheidung: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type SupplierRow = {
  id: string
  tenant_id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  address_street: string | null
  address_city: string | null
  address_zip: string | null
  address_country: string | null
  description: string | null
  website: string | null
  logo_url: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export type ProjectSupplierRow = {
  id: string
  project_id: string
  supplier_id: string
  contact_email: string | null
  invitation_token: string | null
  invitation_sent_at: string | null
  portal_opened_at: string | null
  submitted_at: string | null
  status: 'pending' | 'invited' | 'portal_opened' | 'submitted' | 'completed' | 'excluded'
  is_active: number
  created_at: string
}
