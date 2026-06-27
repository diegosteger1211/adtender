import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Loader2, X, Pencil, Trash2, GripVertical, FileText
} from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'

type Scenario = {
  id: string
  title: string
  description: string | null
  sort_order: number
  created_by_name: string | null
  created_at: string
}

export default function SzenarienPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getStoredUser()
  const canEdit = user?.role === 'admin' || user?.role === 'berater'

  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [projectTitle, setProjectTitle] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Scenario | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Detail view
  const [selected, setSelected] = useState<Scenario | null>(null)

  useEffect(() => { load() }, [projectId])

  async function load() {
    if (!projectId) return
    try {
      const [projRes, scenRes] = await Promise.all([
        api.get<{ project: { title: string } }>(`/api/projects/${projectId}`),
        api.get<{ scenarios: Scenario[] }>(`/api/projects/${projectId}/scenarios`),
      ])
      setProjectTitle(projRes.project.title)
      setScenarios(scenRes.scenarios)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setTitle('')
    setDescription('')
    setShowModal(true)
  }

  function openEdit(s: Scenario) {
    setEditing(s)
    setTitle(s.title)
    setDescription(s.description ?? '')
    setShowModal(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId || !title.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/api/projects/${projectId}/scenarios/${editing.id}`, {
          title: title.trim(),
          description: description.trim() || null,
        })
      } else {
        await api.post(`/api/projects/${projectId}/scenarios`, {
          title: title.trim(),
          description: description.trim() || null,
          sort_order: scenarios.length,
        })
      }
      setShowModal(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(s: Scenario) {
    if (!projectId) return
    if (!confirm(`Szenario "${s.title}" wirklich löschen?`)) return
    await api.delete(`/api/projects/${projectId}/scenarios/${s.id}`)
    if (selected?.id === s.id) setSelected(null)
    await load()
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-gray-500" size={24} /></div>
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Back */}
      <button onClick={() => navigate(`/projekte/${projectId}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        {projectTitle || 'Projekt'}
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Szenarien</h1>
          <p className="text-gray-500 text-sm mt-0.5">Use Cases und Vorführungsszenarien für die Softwareauswahl</p>
        </div>
        {canEdit && (
          <button onClick={openNew}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={14} />
            Neues Szenario
          </button>
        )}
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-20 bg-[#141720] border border-[#1E2433] rounded-2xl">
          <FileText size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium mb-1">Noch keine Szenarien definiert</p>
          <p className="text-gray-600 text-sm mb-5">Szenarien beschreiben Use Cases, die der Anbieter im Portal einsehen und kommentieren kann.</p>
          {canEdit && (
            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} />
              Erstes Szenario anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-80 flex-shrink-0 space-y-2">
            {scenarios.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className={`bg-[#141720] border rounded-xl p-4 cursor-pointer transition-all group ${
                  selected?.id === s.id
                    ? 'border-brand-500/40 bg-brand-500/5'
                    : 'border-[#1E2433] hover:border-[#2A3040]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <GripVertical size={14} className="text-gray-700" />
                    <span className="text-xs font-bold text-gray-600 w-5 text-center">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                    {s.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); openEdit(s) }}
                        className="p-1 text-gray-500 hover:text-brand-400 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); remove(s) }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="flex-1">
            {selected ? (
              <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <span className="text-xs text-gray-600 uppercase tracking-wider">
                      Szenario {scenarios.findIndex(s => s.id === selected.id) + 1}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{selected.title}</h2>
                  </div>
                  {canEdit && (
                    <button onClick={() => openEdit(selected)}
                      className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 rounded-lg transition-colors">
                      <Pencil size={12} /> Bearbeiten
                    </button>
                  )}
                </div>

                {selected.description ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.description}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm italic">Keine Beschreibung vorhanden.</p>
                )}

                <div className="mt-6 pt-5 border-t border-[#1E2433] flex items-center justify-between">
                  <p className="text-gray-600 text-xs">
                    Erstellt von {selected.created_by_name ?? '—'} · {new Date(selected.created_at).toLocaleDateString('de-DE')}
                  </p>
                  <span className="text-xs text-gray-600 bg-[#0F1117] border border-[#1E2433] px-2.5 py-1 rounded-full">
                    Für Anbieter sichtbar
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-[#141720] border border-[#1E2433] rounded-2xl">
                <p className="text-gray-600 text-sm">Szenario auswählen</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold">{editing ? 'Szenario bearbeiten' : 'Neues Szenario'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Szenario-Titel *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="z. B. Wareneingang mit Qualitätsprüfung"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Beschreibung / Use Case</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={7}
                  placeholder="Beschreiben Sie den Use Case detailliert: Ausgangssituation, Ablauf, beteiligte Rollen, erwartetes Ergebnis ..."
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  Abbrechen
                </button>
                <button type="submit" disabled={saving || !title.trim()}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
