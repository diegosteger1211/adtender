import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, ArrowRight, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  phase: string | null
  category: string | null
}

interface ProjectSelectorPageProps {
  title: string
  description: string
  targetPath: string  // e.g. "anforderungen", "szenarien", "ranking"
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktiv', draft: 'Entwurf', completed: 'Abgeschlossen', archived: 'Archiviert',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  draft: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  archived: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
}

export default function ProjectSelectorPage({ title, description, targetPath }: ProjectSelectorPageProps) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects')
      .then(r => setProjects(r.projects))
      .catch(() => setError('Projekte konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Projekte werden geladen…
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-gray-500 text-sm">Keine Projekte vorhanden. Legen Sie zuerst ein Projekt an.</div>
      )}

      {!loading && projects.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Projekt auswählen</p>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/projekte/${p.id}/${targetPath}`)}
              className="w-full flex items-center gap-4 bg-[#141720] hover:bg-[#1a2035] border border-[#1E2433] hover:border-brand-500/30 rounded-xl px-5 py-4 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <FolderOpen size={18} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.title}</p>
                {p.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{p.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[p.status] ?? STATUS_COLOR.draft}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
