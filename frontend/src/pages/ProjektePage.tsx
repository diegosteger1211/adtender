import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, ChevronRight, Users, Calendar, Loader2, X } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { Project } from '../types'

const PHASE_LABELS: Record<string, string> = {
  erstellung: 'Erstellung',
  ausschreibung: 'Ausschreibung',
  bewertung: 'Bewertung',
  entscheidung: 'Entscheidung',
}

const PHASE_COLORS: Record<string, string> = {
  erstellung: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  ausschreibung: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  bewertung: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  entscheidung: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
}

const CATEGORIES = [
  'ERP-System',
  'CRM-System',
  'HR-Software',
  'Projektmanagement',
  'Dokumentenmanagement',
  'Business Intelligence',
  'E-Commerce',
  'Cloud-Infrastruktur',
  'Sicherheitslösung',
  'Sonstige',
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

export default function ProjektePage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<NewProjectForm>({
    title: '',
    category: '',
    description: '',
    phase_start_erstellung: '',
    phase_end_erstellung: '',
    phase_start_ausschreibung: '',
    phase_end_ausschreibung: '',
    phase_start_bewertung: '',
    phase_end_bewertung: '',
    phase_start_entscheidung: '',
    phase_end_entscheidung: '',
  })

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const res = await api.get<{ projects: Project[] }>('/api/projects')
      setProjects(res.projects)
    } catch {
      setError('Projekte konnten nicht geladen werden.')
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
      setForm({ title: '', category: '', description: '', phase_start_erstellung: '', phase_end_erstellung: '', phase_start_ausschreibung: '', phase_end_ausschreibung: '', phase_start_bewertung: '', phase_end_bewertung: '', phase_start_entscheidung: '', phase_end_entscheidung: '' })
      await loadProjects()
    } catch {
      // keep modal open
    } finally {
      setCreating(false)
    }
  }

  const canCreate = user?.role === 'admin' || user?.role === 'berater'

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projekte</h1>
          <p className="text-gray-400 mt-1 text-sm">Alle Ausschreibungsprojekte im Überblick</p>
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-300 font-medium mb-2">Noch keine Projekte</h3>
          <p className="text-gray-500 text-sm mb-6">Erstellen Sie Ihr erstes Ausschreibungsprojekt.</p>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Neues Projekt anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/projekte/${p.id}`)}
              className="bg-[#141720] border border-[#1E2433] hover:border-[#2A3347] rounded-xl p-5 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-base truncate group-hover:text-brand-400 transition-colors">
                      {p.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${PHASE_COLORS[p.phase]}`}>
                      {PHASE_LABELS[p.phase]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">{p.category}</p>
                  {p.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-5 mt-3">
                    <span className="text-gray-500 text-xs flex items-center gap-1.5">
                      <Users size={12} />
                      {p.supplier_count ?? 0} Anbieter
                    </span>
                    <span className="text-gray-500 text-xs flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(p.created_at).toLocaleDateString('de-DE')}
                    </span>
                    {p.created_by_name && (
                      <span className="text-gray-500 text-xs">von {p.created_by_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    p.status === 'draft' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                    p.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create project modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold text-lg">Neues Projekt anlegen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createProject} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Projekttitel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="z.B. ERP-Ausschreibung 2026"
                  required
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kategorie *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Kategorie wählen...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Kurze Beschreibung des Projekts und Ziele..."
                  rows={3}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Phase timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Phasen-Zeitplan (optional)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { phase: 'erstellung', label: 'Erstellung' },
                    { phase: 'ausschreibung', label: 'Ausschreibung' },
                    { phase: 'bewertung', label: 'Bewertung' },
                    { phase: 'entscheidung', label: 'Entscheidung' },
                  ].map(({ phase, label }) => (
                    <div key={phase} className="bg-[#0F1117] border border-[#1E2433] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={form[`phase_start_${phase}` as keyof NewProjectForm]}
                          onChange={e => setForm(f => ({ ...f, [`phase_start_${phase}`]: e.target.value }))}
                          className="w-full bg-[#141720] border border-[#2A3040] text-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="date"
                          value={form[`phase_end_${phase}` as keyof NewProjectForm]}
                          onChange={e => setForm(f => ({ ...f, [`phase_end_${phase}`]: e.target.value }))}
                          className="w-full bg-[#141720] border border-[#2A3040] text-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
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
