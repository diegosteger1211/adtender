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

const CATEGORIES = [
  'ERP-System', 'CRM-System', 'HR-Software', 'Projektmanagement',
  'Dokumentenmanagement', 'Business Intelligence', 'E-Commerce',
  'Cloud-Infrastruktur', 'Sicherheitslösung', 'MES-System', 'WMS-System', 'Sonstige',
]

type NewProjectForm = {
  title: string
  category: string
  description: string
  phase_start_erstellung: string
  phase_end_erstellung: string
  phase_start_ausschreibung: string
  phase_end_ausschreibung: string
  phase_start_bewertung: string
  phase_end_bewertung: string
  phase_start_entscheidung: string
  phase_end_entscheidung: string
}

const EMPTY_FORM: NewProjectForm = {
  title: '', category: '', description: '',
  phase_start_erstellung: '', phase_end_erstellung: '',
  phase_start_ausschreibung: '', phase_end_ausschreibung: '',
  phase_start_bewertung: '', phase_end_bewertung: '',
  phase_start_entscheidung: '', phase_end_entscheidung: '',
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
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-gray-900 font-semibold text-lg">Neues Projekt anlegen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createProject} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Projekttitel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="z.B. ERP-Ausschreibung 2026"
                  required
                  className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Kategorie wählen...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Kurze Beschreibung des Projekts und Ziele..."
                  rows={3}
                  className="w-full border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Phasen-Zeitplan (optional)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { phase: 'erstellung', label: 'Erstellung' },
                    { phase: 'ausschreibung', label: 'Ausschreibung' },
                    { phase: 'bewertung', label: 'Bewertung' },
                    { phase: 'entscheidung', label: 'Entscheidung' },
                  ].map(({ phase, label }) => (
                    <div key={phase} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={form[`phase_start_${phase}` as keyof NewProjectForm]}
                          onChange={e => setForm(f => ({ ...f, [`phase_start_${phase}`]: e.target.value }))}
                          className="w-full border border-gray-200 text-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="date"
                          value={form[`phase_end_${phase}` as keyof NewProjectForm]}
                          onChange={e => setForm(f => ({ ...f, [`phase_end_${phase}`]: e.target.value }))}
                          className="w-full border border-gray-200 text-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
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
