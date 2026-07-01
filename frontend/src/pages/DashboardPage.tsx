import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, FileText, Users, Building2, Loader2, ChevronRight } from 'lucide-react'
import { getStoredUser, getRoleLabel } from '../lib/auth'
import { api } from '../lib/api'
import type { Project, Supplier } from '../types'

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

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  const [projects, setProjects] = useState<Project[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<{ projects: Project[] }>('/api/projects').then(r => setProjects(r.projects)),
      api.get<{ suppliers: Supplier[] }>('/api/suppliers').then(r => setSuppliers(r.suppliers)),
    ]).finally(() => setLoading(false))
  }, [])

  const activeProjects = projects.filter(p => p.status === 'active')
  const recentProjects = projects.slice(0, 4)

  const totalSuppliers = projects.reduce((sum, p) => sum + (p.supplier_count ?? 0), 0)

  const stats = [
    { label: 'Aktive Projekte', value: activeProjects.length, icon: <FileText size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Anbieter (Datenbank)', value: suppliers.length, icon: <Building2 size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Anbieter (Projekte)', value: totalSuppliers, icon: <Users size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Projekte gesamt', value: projects.length, icon: <Clock size={18} />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {getRoleLabel(user?.role ?? 'berater')} · Hier ist Ihr aktueller Überblick.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className={`bg-[#141720] rounded-xl border p-5 flex items-center gap-4 ${s.bg}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color} bg-black/20`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent projects */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Letzte Projekte</h2>
                <button
                  onClick={() => navigate('/projekte')}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Alle ansehen <ArrowRight size={12} />
                </button>
              </div>

              {recentProjects.length === 0 ? (
                <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-8 text-center">
                  <FileText size={36} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-1">Noch keine Projekte</p>
                  <button
                    onClick={() => navigate('/projekte')}
                    className="text-brand-400 text-xs hover:underline"
                  >
                    Erstes Projekt anlegen →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projekte/${p.id}`)}
                      className="bg-[#141720] border border-[#1E2433] hover:border-[#2A3347] rounded-xl p-5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">
                              {p.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${PHASE_COLORS[p.phase]}`}>
                              {PHASE_LABELS[p.phase]}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">{p.category}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-gray-600 text-xs flex items-center gap-1">
                              <Users size={11} /> {p.supplier_count ?? 0} Anbieter
                            </span>
                            <span className="text-gray-600 text-xs">
                              {new Date(p.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Supplier DB snapshot */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Anbieter-Datenbank</h2>
                <button
                  onClick={() => navigate('/system/anbieter')}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Alle <ArrowRight size={12} />
                </button>
              </div>

              {suppliers.length === 0 ? (
                <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-6 text-center">
                  <Building2 size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm mb-2">Noch keine Anbieter</p>
                  <button
                    onClick={() => navigate('/system/anbieter')}
                    className="text-brand-400 text-xs hover:underline"
                  >
                    Anbieter anlegen →
                  </button>
                </div>
              ) : (
                <div className="bg-[#141720] border border-[#1E2433] rounded-xl divide-y divide-[#1E2433]">
                  {suppliers.slice(0, 6).map(s => (
                    <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={13} className="text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{s.company_name}</p>
                        <p className="text-gray-600 text-[11px] truncate">{s.contact_email}</p>
                      </div>
                    </div>
                  ))}
                  {suppliers.length > 6 && (
                    <div className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate('/system/anbieter')}
                        className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
                      >
                        +{suppliers.length - 6} weitere anzeigen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Phase breakdown */}
              {projects.length > 0 && (
                <div className="mt-4 bg-[#141720] border border-[#1E2433] rounded-xl p-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Projekte nach Phase</h3>
                  <div className="space-y-2">
                    {(['erstellung', 'ausschreibung', 'bewertung', 'entscheidung'] as const).map(phase => {
                      const count = projects.filter(p => p.phase === phase).length
                      if (count === 0) return null
                      return (
                        <div key={phase} className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${PHASE_COLORS[phase]}`}>
                            {PHASE_LABELS[phase]}
                          </span>
                          <span className="text-gray-400 text-sm font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
