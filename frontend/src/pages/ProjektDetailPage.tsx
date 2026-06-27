import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, Plus, Loader2, X, Mail, CheckCircle,
  Clock, Send, FileText, AlertCircle, ChevronRight
} from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { Project, Supplier, ProjectSupplier } from '../types'

const PHASE_ORDER = ['erstellung', 'ausschreibung', 'bewertung', 'entscheidung'] as const
const PHASE_LABELS: Record<string, string> = {
  erstellung: 'Erstellung',
  ausschreibung: 'Ausschreibung',
  bewertung: 'Bewertung',
  entscheidung: 'Entscheidung',
}

const SUPPLIER_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:      { label: 'Ausstehend',   color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',     icon: <Clock size={12} /> },
  invited:      { label: 'Eingeladen',   color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',     icon: <Send size={12} /> },
  portal_opened:{ label: 'Geöffnet',     color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <FileText size={12} /> },
  submitted:    { label: 'Eingereicht',  color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <CheckCircle size={12} /> },
  completed:    { label: 'Abgeschlossen',color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle size={12} /> },
  excluded:     { label: 'Ausgeschlossen',color: 'text-red-400 bg-red-500/10 border-red-500/20',        icon: <AlertCircle size={12} /> },
}

type Tab = 'uebersicht' | 'anbieter'

export default function ProjektDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getStoredUser()

  const [project, setProject] = useState<Project | null>(null)
  const [suppliers, setSuppliers] = useState<ProjectSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('uebersicht')


  // invite modal
  const [showInvite, setShowInvite] = useState(false)
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [inviting, setInviting] = useState(false)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  useEffect(() => { load() }, [id])

  async function load() {
    if (!id) return
    try {
      const res = await api.get<{ project: Project; suppliers: ProjectSupplier[] }>(`/api/projects/${id}`)
      setProject(res.project)
      setSuppliers(res.suppliers)
    } finally {
      setLoading(false)
    }
  }

  async function openInviteModal() {
    const res = await api.get<{ suppliers: Supplier[] }>('/api/suppliers')
    const alreadyAdded = new Set(suppliers.map(s => s.supplier_id))
    setAllSuppliers(res.suppliers.filter(s => !alreadyAdded.has(s.id)))
    setSelectedSupplier('')
    setShowInvite(true)
  }

  async function inviteSupplier(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSupplier || !id) return
    setInviting(true)
    try {
      const res = await api.post<{ success: boolean; id: string }>(
        `/api/projects/${id}/suppliers`, { supplier_id: selectedSupplier }
      )
      // Send invitation email immediately after adding
      await api.post(`/api/projects/${id}/invite/${res.id}`, {})
      setShowInvite(false)
      await load()
    } finally {
      setInviting(false)
    }
  }

  async function sendInviteEmail(projectSupplierId: string) {
    if (!id) return
    setSendingInvite(projectSupplierId)
    try {
      await api.post(`/api/projects/${id}/invite/${projectSupplierId}`, {})
      setInviteSuccess(projectSupplierId)
      setTimeout(() => setInviteSuccess(null), 3000)
      await load()
    } finally {
      setSendingInvite(null)
    }
  }

  const canEdit = user?.role === 'admin' || user?.role === 'berater'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Projekt nicht gefunden.</p>
        <button onClick={() => navigate('/projekte')} className="text-brand-400 text-sm mt-3 hover:underline">
          Zurück zur Übersicht
        </button>
      </div>
    )
  }

  const currentPhaseIndex = PHASE_ORDER.indexOf(project.phase as typeof PHASE_ORDER[number])

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/projekte')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Alle Projekte
      </button>

      {/* Header */}
      <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{project.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                project.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                project.status === 'draft'  ? 'text-gray-400 bg-gray-500/10 border-gray-500/20' :
                project.status === 'completed' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {project.status === 'active' ? 'Aktiv' : project.status === 'draft' ? 'Entwurf' : project.status === 'completed' ? 'Abgeschlossen' : 'Abgebrochen'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{project.category}{project.created_by_name ? ` · Erstellt von ${project.created_by_name}` : ''}</p>
          </div>
        </div>

        {/* Phase timeline */}
        <div className="grid grid-cols-4 gap-3">
          {PHASE_ORDER.map((phase, i) => {
            const isDone = i < currentPhaseIndex
            const isCurrent = i === currentPhaseIndex
            const start = project[`phase_start_${phase}` as keyof Project] as string | null
            const end = project[`phase_end_${phase}` as keyof Project] as string | null
            return (
              <div
                key={phase}
                className={`rounded-xl p-3 border transition-all ${
                  isCurrent ? 'border-brand-500/40 bg-brand-500/5' :
                  isDone    ? 'border-emerald-500/20 bg-emerald-500/5' :
                  'border-[#1E2433] bg-[#0F1117]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isDone ? (
                    <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-brand-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-[#2A3040] flex-shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${isCurrent ? 'text-brand-400' : isDone ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {PHASE_LABELS[phase]}
                  </span>
                </div>
                {(start || end) ? (
                  <div className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    {start && <div>{new Date(start).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>}
                    {end && <div>– {new Date(end).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-700 mt-1">Kein Datum</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick nav */}
      {canEdit && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate(`/projekte/${id}/anforderungen`)}
            className="flex items-center gap-2 bg-[#141720] border border-[#1E2433] hover:border-brand-500/40 text-gray-400 hover:text-brand-400 px-4 py-2 rounded-lg text-sm transition-all"
          >
            <FileText size={14} /> Anforderungskatalog
          </button>
          <button
            onClick={() => navigate(`/projekte/${id}/szenarien`)}
            className="flex items-center gap-2 bg-[#141720] border border-[#1E2433] hover:border-brand-500/40 text-gray-400 hover:text-brand-400 px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Send size={14} /> Szenarien
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0F1117] border border-[#1E2433] rounded-xl p-1 w-fit">
        {(['uebersicht', 'anbieter'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-[#1E2433] text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'uebersicht' ? 'Übersicht' : `Anbieter (${suppliers.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Übersicht */}
      {tab === 'uebersicht' && (
        <div className="space-y-4">
          {project.description && (
            <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Beschreibung</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Kategorie</dt>
                  <dd className="text-gray-300 text-sm">{project.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Aktuelle Phase</dt>
                  <dd className="text-gray-300 text-sm">{PHASE_LABELS[project.phase]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Anbieter</dt>
                  <dd className="text-gray-300 text-sm">{suppliers.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 text-sm">Angelegt am</dt>
                  <dd className="text-gray-300 text-sm">{new Date(project.created_at).toLocaleDateString('de-DE')}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Anbieter-Status</h3>
              {suppliers.length === 0 ? (
                <p className="text-gray-600 text-sm">Noch keine Anbieter eingeladen.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(SUPPLIER_STATUS).map(([status, cfg]) => {
                    const count = suppliers.filter(s => s.status === status).length
                    if (count === 0) return null
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                        <span className="text-gray-400 text-sm font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => setTab('anbieter')}
                className="flex items-center gap-1 text-brand-400 text-xs mt-4 hover:text-brand-300 transition-colors"
              >
                Anbieter verwalten <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Anbieter */}
      {tab === 'anbieter' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Eingeladene Anbieter</h2>
            {canEdit && (
              <button
                onClick={openInviteModal}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={14} />
                Anbieter einladen
              </button>
            )}
          </div>

          {suppliers.length === 0 ? (
            <div className="text-center py-16 bg-[#141720] border border-[#1E2433] rounded-xl">
              <Building2 size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium mb-1">Noch keine Anbieter eingeladen</p>
              <p className="text-gray-600 text-sm mb-4">Laden Sie Anbieter aus der Datenbank in dieses Projekt ein.</p>
              {canEdit && (
                <button
                  onClick={openInviteModal}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  Anbieter einladen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {suppliers.map(s => {
                const cfg = SUPPLIER_STATUS[s.status] ?? SUPPLIER_STATUS.pending
                return (
                  <div key={s.id} className="bg-[#141720] border border-[#1E2433] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-9 h-9 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{s.company_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail size={11} className="text-gray-600" />
                        <span className="text-gray-500 text-xs truncate">{s.contact_email ?? s.supplier_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {s.submitted_at && (
                        <span className="text-gray-600 text-xs hidden sm:block">
                          {new Date(s.submitted_at).toLocaleDateString('de-DE')}
                        </span>
                      )}
                      <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {canEdit && (s.status === 'pending' || s.status === 'invited') && (
                        inviteSuccess === s.id ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle size={13} /> Gesendet
                          </span>
                        ) : (
                          <button
                            onClick={() => sendInviteEmail(s.id)}
                            disabled={sendingInvite === s.id}
                            title="Einladungsmail senden"
                            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                          >
                            {sendingInvite === s.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                            Einladen
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold text-lg">Anbieter einladen</h2>
              <button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={inviteSupplier} className="p-6 space-y-4">
              {allSuppliers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-2">Alle Anbieter sind bereits eingeladen.</p>
                  <button
                    type="button"
                    onClick={() => { setShowInvite(false); navigate('/system/anbieter') }}
                    className="text-brand-400 text-sm hover:underline"
                  >
                    Neuen Anbieter anlegen →
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Anbieter auswählen</label>
                    <select
                      required
                      value={selectedSupplier}
                      onChange={e => setSelectedSupplier(e.target.value)}
                      className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    >
                      <option value="">Anbieter wählen...</option>
                      {allSuppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.company_name} — {s.contact_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowInvite(false)}
                      className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={inviting || !selectedSupplier}
                      className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      {inviting ? <Loader2 size={16} className="animate-spin" /> : 'Einladen'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
