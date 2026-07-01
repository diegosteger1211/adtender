import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, SlidersHorizontal, Search, Loader2, X, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { Project } from '../types'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen',
}

const PHASE_LABELS: Record<string, string> = {
  erstellung: 'Erstellung',
  ausschreibung: 'Ausschreibung',
  bewertung: 'Bewertung',
  entscheidung: 'Entscheidung',
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
  'MES-System',
  'WMS-System',
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

const EMPTY_FORM: NewProjectForm = {
  title: '', category: '', description: '',
  phase_start_erstellung: '', phase_end_erstellung: '',
  phase_start_ausschreibung: '', phase_end_ausschreibung: '',
  phase_start_bewertung: '', phase_end_bewertung: '',
  phase_start_entscheidung: '', phase_end_entscheidung: '',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'active') return <CheckCircle2 size={16} className="text-emerald-400" />
  if (status === 'completed') return <CheckCircle2 size={16} className="text-blue-400" />
  if (status === 'cancelled') return <XCircle size={16} className="text-red-400" />
  return <Clock size={16} className="text-gray-500" />
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
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPhase, setFilterPhase] = useState<string>('')

  useEffect(() => { loadProjects() }, [])

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
      setForm(EMPTY_FORM)
      await loadProjects()
    } catch {
      // keep modal open
    } finally {
      setCreating(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return projects.filter(p => {
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      const matchStatus = !filterStatus || p.status === filterStatus
      const matchPhase = !filterPhase || p.phase === filterPhase
      return matchSearch && matchStatus && matchPhase
    })
  }, [projects, search, filterStatus, filterPhase])

  const canCreate = user?.role === 'admin' || user?.role === 'berater'

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projekte | Auswahl & Anlage</h1>
          <p className="text-gray-500 mt-1 text-sm">Alle Ausschreibungsprojekte im Überblick</p>
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

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Auswahlprojekten"
            className="w-full bg-[#141720] border border-[#1E2433] text-gray-300 placeholder-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-colors ${showFilters || filterStatus || filterPhase ? 'border-brand-500 text-brand-400 bg-brand-500/10' : 'border-[#1E2433] text-gray-400 hover:text-gray-300 bg-[#141720]'}`}
        >
          <SlidersHorizontal size={15} />
          {(filterStatus || filterPhase) && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#141720] border border-[#1E2433] rounded-lg">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#0F1117] border border-[#2A3040] text-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">Alle Status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterPhase}
            onChange={e => setFilterPhase(e.target.value)}
            className="bg-[#0F1117] border border-[#2A3040] text-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">Alle Phasen</option>
            {Object.entries(PHASE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {(filterStatus || filterPhase) && (
            <button onClick={() => { setFilterStatus(''); setFilterPhase('') }} className="text-xs text-gray-500 hover:text-gray-300 ml-1">
              Zurücksetzen
            </button>
          )}
        </div>
      )}

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
        <div className="bg-[#141720] border border-[#1E2433] rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[140px_1fr_200px_80px_110px] gap-4 px-5 py-3 border-b border-[#1E2433] text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Erstellt am</span>
            <span>Titel</span>
            <span>Tags</span>
            <span>Status</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">Keine Projekte gefunden.</div>
          ) : (
            filtered.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-[140px_1fr_200px_80px_110px] gap-4 px-5 py-4 items-center hover:bg-[#1a2035] transition-colors ${i > 0 ? 'border-t border-[#1E2433]' : ''}`}
              >
                {/* Date */}
                <span className="text-gray-400 text-sm">
                  {new Date(p.created_at).toLocaleDateString('de-DE')}
                </span>

                {/* Title + description */}
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm leading-tight truncate">{p.title}</p>
                  {p.description && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{p.description}</p>
                  )}
                </div>

                {/* Tags: category + phase */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.category && (
                    <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.phase === 'erstellung' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    p.phase === 'ausschreibung' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    p.phase === 'bewertung' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {PHASE_LABELS[p.phase]}
                  </span>
                </div>

                {/* Status icon */}
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={p.status} />
                  <span className="text-xs text-gray-500 hidden xl:inline">{STATUS_LABELS[p.status]}</span>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/projekte/${p.id}`)}
                    className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Ansehen
                  </button>
                </div>
              </div>
            ))
          )}
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
