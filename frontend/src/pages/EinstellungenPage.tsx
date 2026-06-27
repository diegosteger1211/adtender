import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Save, Settings, Users, Building2, Star, StarOff,
  Trash2, Plus, X, CheckSquare, Square
} from 'lucide-react'
import { api } from '../lib/api'

type Project = {
  id: string; title: string; description: string | null; status: string; category: string
  phase: string; created_at: string
  phase_start_erstellung: string | null; phase_end_erstellung: string | null
  phase_start_ausschreibung: string | null; phase_end_ausschreibung: string | null
  phase_start_bewertung: string | null; phase_end_bewertung: string | null
  phase_start_entscheidung: string | null; phase_end_entscheidung: string | null
}

type SupplierAccess = {
  id: string; supplier_id: string; company_name: string; contact_name: string
  contact_email: string; status: string; shortlisted: number
  access_anforderungen: number; access_szenarien: number; access_finanzen: number
}

type Member = { id: string; user_id: string; name: string; email: string; role: string; added_at: string }
type UserOption = { id: string; name: string; email: string; role: string }

const PHASE_LABELS = ['Erstellung', 'Ausschreibung', 'Bewertung', 'Entscheidung'] as const
const PHASE_KEYS = ['erstellung', 'ausschreibung', 'bewertung', 'entscheidung'] as const

export default function EinstellungenPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierAccess[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [allUsers, setAllUsers] = useState<UserOption[]>([])

  // Project form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [phases, setPhases] = useState<Record<string, string>>({})
  const [savingProject, setSavingProject] = useState(false)
  const [projectMsg, setProjectMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Member add
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [memberRole, setMemberRole] = useState('berater')
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => { load() }, [projectId])

  async function load() {
    if (!projectId) return
    try {
      const res = await api.get<{ project: Project; suppliers: SupplierAccess[]; members: Member[]; allUsers: UserOption[] }>(
        `/api/projects/${projectId}/settings`
      )
      setProject(res.project)
      setTitle(res.project.title)
      setDescription(res.project.description ?? '')
      setStatus(res.project.status)
      setCategory(res.project.category)
      const p: Record<string, string> = {}
      PHASE_KEYS.forEach(k => {
        p[`start_${k}`] = (res.project as Record<string, string | null>)[`phase_start_${k}`]?.slice(0, 10) ?? ''
        p[`end_${k}`] = (res.project as Record<string, string | null>)[`phase_end_${k}`]?.slice(0, 10) ?? ''
      })
      setPhases(p)
      setSuppliers(res.suppliers)
      setMembers(res.members)
      setAllUsers(res.allUsers)
    } finally {
      setLoading(false)
    }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setSavingProject(true)
    setProjectMsg(null)
    try {
      const body: Record<string, string> = { title, description, status, category }
      PHASE_KEYS.forEach(k => {
        body[`phase_start_${k}`] = phases[`start_${k}`] || ''
        body[`phase_end_${k}`] = phases[`end_${k}`] || ''
      })
      await api.put(`/api/projects/${projectId}/settings`, body)
      setProjectMsg({ ok: true, text: 'Einstellungen gespeichert.' })
    } catch {
      setProjectMsg({ ok: false, text: 'Fehler beim Speichern.' })
    } finally {
      setSavingProject(false)
    }
  }

  async function toggleAccess(psId: string, field: 'access_anforderungen' | 'access_szenarien' | 'access_finanzen' | 'shortlisted') {
    const s = suppliers.find(x => x.id === psId)
    if (!s) return
    const newVal = s[field] ? 0 : 1
    setSuppliers(prev => prev.map(x => x.id === psId ? { ...x, [field]: newVal } : x))
    await api.put(`/api/projects/${projectId}/settings/suppliers/${psId}`, { [field]: newVal })
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser || !projectId) return
    setAddingMember(true)
    try {
      await api.post(`/api/projects/${projectId}/settings/members`, { user_id: selectedUser, role: memberRole })
      setShowAddMember(false)
      await load()
    } finally { setAddingMember(false) }
  }

  async function removeMember(memberId: string) {
    await api.delete(`/api/projects/${projectId}/settings/members/${memberId}`)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const availableUsers = allUsers.filter(u => !members.some(m => m.user_id === u.id))

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-gray-500" size={24} /></div>
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate(`/projekte/${projectId}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        {project?.title ?? 'Projekt'}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-[#1E2433] border border-[#2A3040] rounded-lg flex items-center justify-center">
          <Settings size={16} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Auswahleinstellungen</h1>
          <p className="text-gray-500 text-sm">Nur für Berater und Administratoren sichtbar.</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Auswahldetails + Phasen ── */}
        <form onSubmit={saveProject}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Project details */}
            <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Settings size={15} className="text-brand-400" /> Auswahldetails
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Auswahl-ID</label>
                <input value={projectId} readOnly
                  className="w-full bg-[#0F1117] border border-[#1E2433] text-gray-600 rounded-lg px-3 py-2 text-xs font-mono cursor-default" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Projekttitel *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Kategorie</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Unternehmensbeschreibung</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Beschreibung des Projekts / der Ausschreibung..."
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="draft">Entwurf</option>
                  <option value="active">Aktiv / Laufend</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="cancelled">Abgebrochen</option>
                </select>
              </div>

              <div className="text-xs text-gray-600">
                Gestartet: {project ? new Date(project.created_at).toLocaleDateString('de-DE') : '—'}
              </div>
            </div>

            {/* Right: Phases */}
            <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Auswahlphasen</h2>
              {PHASE_KEYS.map((k, i) => (
                <div key={k}>
                  <p className="text-xs font-medium text-gray-400 mb-2">{i + 1}. {PHASE_LABELS[i]}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-600 mb-1">Startdatum</label>
                      <input type="date" value={phases[`start_${k}`] ?? ''}
                        onChange={e => setPhases(p => ({ ...p, [`start_${k}`]: e.target.value }))}
                        className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600 mb-1">Enddatum</label>
                      <input type="date" value={phases[`end_${k}`] ?? ''}
                        onChange={e => setPhases(p => ({ ...p, [`end_${k}`]: e.target.value }))}
                        className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save bar */}
          <div className="mt-4 flex items-center gap-4">
            <button type="submit" disabled={savingProject}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {savingProject ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Speichern
            </button>
            {projectMsg && (
              <span className={`text-sm ${projectMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{projectMsg.text}</span>
            )}
          </div>
        </form>

        {/* ── Anbieter-Zugriffsrechte ── */}
        <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Building2 size={15} className="text-brand-400" /> Auswahl-Ranking & Zugriffsrechte
          </h2>
          <p className="text-gray-500 text-xs mb-5">Zugriffsrechte pro Anbieter steuern und Shortlist verwalten.</p>

          {suppliers.length === 0 ? (
            <p className="text-gray-600 text-sm">Noch keine Anbieter eingeladen.</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-4 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Anbieter</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600 text-center w-20">Anforderungen</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600 text-center w-16">Szenarien</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600 text-center w-14">Finanzen</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600 text-center w-16">Shortlist</span>
                <span className="w-8" />
              </div>

              {suppliers.map(s => (
                <div key={s.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 bg-[#0F1117] border border-[#1E2433] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{s.company_name}</p>
                    <p className="text-gray-500 text-xs">{s.contact_email}</p>
                  </div>

                  {/* Anforderungen */}
                  <div className="flex justify-center w-20">
                    <button onClick={() => toggleAccess(s.id, 'access_anforderungen')}
                      className={`transition-colors ${s.access_anforderungen ? 'text-brand-400' : 'text-gray-600 hover:text-gray-400'}`}>
                      {s.access_anforderungen ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </div>

                  {/* Szenarien */}
                  <div className="flex justify-center w-16">
                    <button onClick={() => toggleAccess(s.id, 'access_szenarien')}
                      className={`transition-colors ${s.access_szenarien ? 'text-brand-400' : 'text-gray-600 hover:text-gray-400'}`}>
                      {s.access_szenarien ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </div>

                  {/* Finanzen */}
                  <div className="flex justify-center w-14">
                    <button onClick={() => toggleAccess(s.id, 'access_finanzen')}
                      className={`transition-colors ${s.access_finanzen ? 'text-brand-400' : 'text-gray-600 hover:text-gray-400'}`}>
                      {s.access_finanzen ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </div>

                  {/* Shortlist */}
                  <div className="flex justify-center w-16">
                    <button onClick={() => toggleAccess(s.id, 'shortlisted')}
                      className={`transition-colors ${s.shortlisted ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'}`}>
                      {s.shortlisted ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                    </button>
                  </div>

                  <div className="w-8">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      s.status === 'invited' ? 'text-blue-400 bg-blue-500/10' :
                      s.status === 'submitted' ? 'text-purple-400 bg-purple-500/10' :
                      'text-gray-500 bg-gray-500/10'
                    }`}>
                      {s.status === 'pending' ? 'Neu' : s.status === 'invited' ? 'Eingeladen' : s.status === 'submitted' ? 'Eingereicht' : s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Benutzer in der Auswahl ── */}
        <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Users size={15} className="text-brand-400" /> Benutzer in der Auswahl
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {members.length === 0 ? 'Noch keine Benutzer zugewiesen.' : `${members.length} Benutzer beteiligt.`}
              </p>
            </div>
            <button onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} /> Hinzufügen
            </button>
          </div>

          {members.length > 0 && (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_80px] gap-4 px-4 pb-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Benutzer</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-600">Teilnehmerrolle</span>
                <span />
              </div>
              {members.map(m => (
                <div key={m.id} className="grid grid-cols-[1fr_120px_80px] items-center gap-4 bg-[#0F1117] border border-[#1E2433] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 w-fit capitalize">
                    {m.role}
                  </span>
                  <button onClick={() => removeMember(m.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1 text-xs">
                    <Trash2 size={13} /> Entfernen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add member modal ── */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold">Benutzer hinzufügen</h2>
              <button onClick={() => setShowAddMember(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={addMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Benutzer</label>
                <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="">Benutzer wählen...</option>
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Rolle</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500">
                  <option value="admin">Admin</option>
                  <option value="berater">Berater</option>
                  <option value="kunde">Kunde</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  Abbrechen
                </button>
                <button type="submit" disabled={addingMember || !selectedUser}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {addingMember ? <Loader2 size={14} className="animate-spin" /> : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
