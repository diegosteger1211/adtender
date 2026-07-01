import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Search, Loader2, X, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { Project } from '../types'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-600',
}

const PHASE_LABELS: Record<string, string> = {
  erstellung: 'Erstellung',
  ausschreibung: 'Ausschreibung',
  bewertung: 'Bewertung',
  entscheidung: 'Entscheidung',
}

const PHASE_COLORS: Record<string, string> = {
  erstellung: 'bg-blue-50 text-blue-700',
  ausschreibung: 'bg-orange-50 text-orange-700',
  bewertung: 'bg-purple-50 text-purple-700',
  entscheidung: 'bg-emerald-50 text-emerald-700',
}

const PROJEKT_TYPEN = [
  'MES / MOM', 'OT Security', 'Historian', 'APS',
  'LIMS', 'MES + OT', 'ERP', 'Sonstiges',
]

type NewProjectForm = {
  title: string
  category: string
  description: string
  ausgangssituation: string
  customer_company: string
  customer_industry: string
  customer_location: string
  customer_country: string
  contact_name: string
  contact_function: string
  contact_email: string
  contact_phone: string
  address_street: string
  address_zip: string
  address_city: string
  address_state: string
  address_country: string
  project_manager: string
  project_start: string
  project_end: string
}

const EMPTY_FORM: NewProjectForm = {
  title: '', category: '', description: '', ausgangssituation: '',
  customer_company: '', customer_industry: '', customer_location: '', customer_country: '',
  contact_name: '', contact_function: '', contact_email: '', contact_phone: '',
  address_street: '', address_zip: '', address_city: '', address_state: '', address_country: '',
  project_manager: '', project_start: '', project_end: '',
}

export default function ProjektePage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<NewProjectForm>(EMPTY_FORM)
  const [search, setSearch] = useState('')

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    setError('')
    setLoading(true)
    try {
      const res = await api.get<{ projects: Project[] }>('/api/projects')
      setProjects(res.projects)
    } catch {
      setError('Die Projekte konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.category) return
    setCreating(true)
    try {
      await api.post('/api/projects', form)
      setShowModal(false)
      setForm(EMPTY_FORM)
      await loadProjects()
    } catch {
      // keep modal open
    } finally {
      setCreating(false)
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Projekt wirklich löschen?')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {
      // silent
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return projects.filter(p =>
      !q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    )
  }, [projects, search])

  const canCreate = user?.role === 'admin' || user?.role === 'berater'

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekte | Auswahl & Anlage</h1>
          <p className="text-gray-500 mt-1 text-sm">Alle Projekte im Überblick</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Neues Projekt
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Projekt oder Kunde suchen"
          className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={loadProjects}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Erneut laden
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm mb-6">Es wurden noch keine Projekte angelegt.</p>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Neues Projekt
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Table header */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Projekt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kunde</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phase</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Letzte Änderung</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Keine Projekte gefunden.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{p.title}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {p.category || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PHASE_COLORS[p.phase] ?? 'bg-gray-100 text-gray-600'}`}>
                        {PHASE_LABELS[p.phase] ?? p.phase}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(p.updated_at ?? p.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/projekte/${p.id}`)}
                          title="Öffnen"
                          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                          <ExternalLink size={13} />
                          Öffnen
                        </button>
                        {canCreate && (
                          <>
                            <button
                              onClick={() => navigate(`/projekte/${p.id}/bearbeiten`)}
                              title="Bearbeiten"
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteProject(p.id)}
                              title="Löschen"
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create project modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-gray-900 font-semibold text-lg">Neues Projekt anlegen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createProject} className="p-6 space-y-8">

              {/* ── Projektinformationen ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Projektinformationen</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Projektname *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="z.B. MES-Ausschreibung 2026"
                      required
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Projekttyp *</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      required
                      className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Projekttyp wählen...</option>
                      {PROJEKT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Projektziel</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Was soll mit diesem Projekt erreicht werden?"
                      rows={2}
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ausgangssituation</label>
                    <textarea
                      value={form.ausgangssituation}
                      onChange={e => setForm(f => ({ ...f, ausgangssituation: e.target.value }))}
                      placeholder="Wie ist die aktuelle Situation beim Kunden?"
                      rows={2}
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* ── Kunde ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Kunde</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Unternehmen *</label>
                    <input
                      type="text"
                      value={form.customer_company}
                      onChange={e => setForm(f => ({ ...f, customer_company: e.target.value }))}
                      placeholder="Firmenname"
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Branche</label>
                    <input
                      type="text"
                      value={form.customer_industry}
                      onChange={e => setForm(f => ({ ...f, customer_industry: e.target.value }))}
                      placeholder="z.B. Automotive, Pharma, Chemie"
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Standort</label>
                      <input
                        type="text"
                        value={form.customer_location}
                        onChange={e => setForm(f => ({ ...f, customer_location: e.target.value }))}
                        placeholder="Stadt / Werk"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Land</label>
                      <input
                        type="text"
                        value={form.customer_country}
                        onChange={e => setForm(f => ({ ...f, customer_country: e.target.value }))}
                        placeholder="z.B. Deutschland"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Primärer Ansprechpartner ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Primärer Ansprechpartner</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        value={form.contact_name}
                        onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                        placeholder="Vor- und Nachname"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Funktion</label>
                      <input
                        type="text"
                        value={form.contact_function}
                        onChange={e => setForm(f => ({ ...f, contact_function: e.target.value }))}
                        placeholder="z.B. IT-Leiter, Projektleiter"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                        placeholder="name@unternehmen.de"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                      <input
                        type="tel"
                        value={form.contact_phone}
                        onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                        placeholder="+49 ..."
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Anschrift ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Anschrift</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Straße</label>
                    <input
                      type="text"
                      value={form.address_street}
                      onChange={e => setForm(f => ({ ...f, address_street: e.target.value }))}
                      placeholder="Straße und Hausnummer"
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">PLZ</label>
                      <input
                        type="text"
                        value={form.address_zip}
                        onChange={e => setForm(f => ({ ...f, address_zip: e.target.value }))}
                        placeholder="12345"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ort</label>
                      <input
                        type="text"
                        value={form.address_city}
                        onChange={e => setForm(f => ({ ...f, address_city: e.target.value }))}
                        placeholder="Stadt"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Bundesland</label>
                      <input
                        type="text"
                        value={form.address_state}
                        onChange={e => setForm(f => ({ ...f, address_state: e.target.value }))}
                        placeholder="z.B. NRW, Bayern"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Land</label>
                      <input
                        type="text"
                        value={form.address_country}
                        onChange={e => setForm(f => ({ ...f, address_country: e.target.value }))}
                        placeholder="z.B. Deutschland"
                        className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Projekt ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Projekt</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Projektleiter</label>
                    <input
                      type="text"
                      value={form.project_manager}
                      onChange={e => setForm(f => ({ ...f, project_manager: e.target.value }))}
                      placeholder="Name des verantwortlichen Projektleiters"
                      className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Geplanter Projektstart</label>
                      <input
                        type="date"
                        value={form.project_start}
                        onChange={e => setForm(f => ({ ...f, project_start: e.target.value }))}
                        className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Geplantes Projektende</label>
                      <input
                        type="date"
                        value={form.project_end}
                        onChange={e => setForm(f => ({ ...f, project_end: e.target.value }))}
                        className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Buttons ── */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.title.trim() || !form.category}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Projekt anlegen'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
