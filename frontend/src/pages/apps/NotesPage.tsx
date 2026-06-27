import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pin } from 'lucide-react'
import { api } from '../../lib/api'

type Note = {
  id: string
  title: string
  content: string | null
  color: string
  pinned: number
  project_id: string | null
  created_at: string
  updated_at: string
}

type Project = { id: string; title: string }

const COLOR_OPTIONS = [
  { value: 'default', className: 'bg-gray-600', label: 'Standard' },
  { value: 'yellow', className: 'bg-yellow-400', label: 'Gelb' },
  { value: 'green', className: 'bg-emerald-400', label: 'Grün' },
  { value: 'blue', className: 'bg-blue-400', label: 'Blau' },
  { value: 'red', className: 'bg-red-400', label: 'Rot' },
]

const COLOR_DOT: Record<string, string> = {
  default: 'bg-gray-600',
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-400',
  blue: 'bg-blue-400',
  red: 'bg-red-400',
}

export default function NotesPage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [filterProject, setFilterProject] = useState('')
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadNotes = useCallback(async () => {
    const qs = filterProject ? `?project_id=${filterProject}` : ''
    const r = await api.get<{ notes: Note[] }>(`/api/apps/notes${qs}`)
    setNotes(r.notes)
  }, [filterProject])

  useEffect(() => { loadNotes().catch(() => {}) }, [loadNotes])

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects').then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  const createNote = async () => {
    const r = await api.post<{ note: Note }>('/api/apps/notes', { title: 'Neue Notiz', content: '' })
    setNotes(prev => [r.note, ...prev])
    setSelectedNote(r.note)
  }

  const updateNoteField = (field: keyof Note, value: string | number | boolean) => {
    if (!selectedNote) return
    const updated = { ...selectedNote, [field]: value }
    setSelectedNote(updated)
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await api.put(`/api/apps/notes/${updated.id}`, {
        title: updated.title,
        content: updated.content,
        color: updated.color,
        project_id: updated.project_id,
        pinned: updated.pinned === 1,
      }).catch(() => {})
      setSaving(false)
    }, 500)
  }

  const deleteNote = async (id: string) => {
    await api.delete(`/api/apps/notes/${id}`)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  const togglePin = async (note: Note) => {
    const pinned = note.pinned === 1 ? 0 : 1
    await api.put(`/api/apps/notes/${note.id}`, { pinned: pinned === 1 })
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, pinned } : n).sort((a, b) => b.pinned - a.pinned))
    if (selectedNote?.id === note.id) setSelectedNote(prev => prev ? { ...prev, pinned } : prev)
  }

  const sortedNotes = [...notes].sort((a, b) => b.pinned - a.pinned)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Notizen</h1>
            <p className="text-gray-400 text-sm">Schnelle Memos zu Projekten</p>
          </div>
        </div>
        <button
          onClick={createNote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Neue Notiz
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Left sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Alle Projekte</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedNotes.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Keine Notizen</p>
            )}
            {sortedNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedNote?.id === note.id
                    ? 'border-brand-500/50 bg-[#1a1f30]'
                    : 'border-[#1E2433] bg-[#141720] hover:border-[#2A3040]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${COLOR_DOT[note.color] ?? 'bg-gray-600'}`} />
                  {note.pinned === 1 && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                  <span className="text-white text-sm font-medium truncate">{note.title}</span>
                </div>
                <p className="text-gray-500 text-xs ml-4">
                  {new Date(note.updated_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main editor */}
        {selectedNote ? (
          <div className="flex-1 bg-[#141720] border border-[#1E2433] rounded-2xl p-5 flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Color picker */}
                <div className="flex gap-1.5">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => updateNoteField('color', c.value)}
                      className={`w-5 h-5 rounded-full ${c.className} transition-transform ${
                        selectedNote.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141720] scale-110' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
                {/* Pin button */}
                <button
                  onClick={() => togglePin(selectedNote)}
                  title={selectedNote.pinned === 1 ? 'Anheftung entfernen' : 'Anheften'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedNote.pinned === 1 ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {saving && <span className="text-gray-500 text-xs">Speichern…</span>}
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <input
              value={selectedNote.title}
              onChange={e => updateNoteField('title', e.target.value)}
              className="bg-transparent text-white text-xl font-semibold focus:outline-none border-b border-[#2A3040] pb-2"
              placeholder="Titel…"
            />

            {/* Content */}
            <textarea
              value={selectedNote.content ?? ''}
              onChange={e => updateNoteField('content', e.target.value)}
              className="flex-1 bg-transparent text-gray-300 focus:outline-none resize-none text-sm leading-relaxed"
              placeholder="Notiz schreiben…"
            />
          </div>
        ) : (
          <div className="flex-1 bg-[#141720] border border-[#1E2433] rounded-2xl flex items-center justify-center text-gray-500">
            Notiz auswählen oder neue erstellen
          </div>
        )}
      </div>
    </div>
  )
}
