import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { api } from '../../lib/api'

type Project = { id: string; title: string }
type Capability = { id: string; name: string; type: string }
type Requirement = { id: string; capability_id: string; requirement: string; priority: string; weight: number; is_critical: number }
type Supplier = { id: string; company_name: string; status: string; project_supplier_id: string }
type Response = { requirement_id: string; project_supplier_id: string; fulfillment: string }

type FitGapData = {
  project: { title: string }
  capabilities: Capability[]
  requirements: Requirement[]
  suppliers: Supplier[]
  responses: Response[]
}

const FULFILLMENT_DISPLAY: Record<string, { label: string; className: string }> = {
  standard:        { label: 'S', className: 'bg-emerald-500/30 text-emerald-300' },
  konfiguration:   { label: 'K', className: 'bg-blue-500/30 text-blue-300' },
  customizing:     { label: 'C', className: 'bg-orange-500/30 text-orange-300' },
  programmierung:  { label: 'P', className: 'bg-purple-500/30 text-purple-300' },
  nicht_vorhanden: { label: '✗', className: 'bg-red-500/30 text-red-300' },
}

export default function FitGapPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [data, setData] = useState<FitGapData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects').then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedProjectId) { setData(null); return }
    setLoading(true)
    api.get<FitGapData>(`/api/apps/fit-gap/${selectedProjectId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [selectedProjectId])

  // Build response lookup: requirement_id -> project_supplier_id -> fulfillment
  const responseMap: Record<string, Record<string, string>> = {}
  if (data) {
    for (const r of data.responses) {
      if (!responseMap[r.requirement_id]) responseMap[r.requirement_id] = {}
      responseMap[r.requirement_id][r.project_supplier_id] = r.fulfillment
    }
  }

  const getCell = (reqId: string, psId: string) => {
    const f = responseMap[reqId]?.[psId]
    if (!f) return { label: '—', className: 'bg-gray-800 text-gray-500' }
    return FULFILLMENT_DISPLAY[f] ?? { label: f, className: 'bg-gray-700 text-gray-300' }
  }

  const getFulfillmentScore = (psId: string, reqs: Requirement[]) => {
    const fulfilled = reqs.filter(r => {
      const f = responseMap[r.id]?.[psId]
      return f === 'standard' || f === 'konfiguration'
    }).length
    return reqs.length > 0 ? Math.round((fulfilled / reqs.length) * 100) : 0
  }

  const getReqScore = (reqId: string) => {
    if (!data) return 0
    const filled = data.suppliers.filter(s => {
      const f = responseMap[reqId]?.[s.project_supplier_id]
      return f === 'standard' || f === 'konfiguration'
    }).length
    return data.suppliers.length > 0 ? Math.round((filled / data.suppliers.length) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Fit-Gap-Analyse</h1>
          <p className="text-gray-400 text-sm">Anforderungen mit Anbieter-Antworten abgleichen</p>
        </div>
      </div>

      {/* Project selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Projekt auswählen</label>
        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:border-brand-500"
        >
          <option value="">— Projekt wählen —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-400">Lade Daten…</p>}

      {data && !loading && (
        <>
          {data.suppliers.length === 0 && (
            <p className="text-gray-400">Keine Anbieter im Projekt.</p>
          )}
          {data.requirements.length === 0 && (
            <p className="text-gray-400">Keine Anforderungen im Projekt.</p>
          )}

          {data.suppliers.length > 0 && data.requirements.length > 0 && (
            <div className="overflow-auto">
              <table className="text-sm border-collapse w-full">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-400 font-medium sticky left-0 bg-[#0F1117] min-w-[240px] border-b border-[#1E2433]">
                      Anforderung
                    </th>
                    {data.suppliers.map(s => (
                      <th key={s.project_supplier_id} className="px-3 py-2 text-gray-400 font-medium text-center min-w-[100px] border-b border-[#1E2433]">
                        {s.company_name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-gray-400 font-medium text-center min-w-[80px] border-b border-[#1E2433]">
                      Erfüllt %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.capabilities.map(cap => {
                    const capReqs = data.requirements.filter(r => r.capability_id === cap.id)
                    if (capReqs.length === 0) return null
                    return [
                      // Capability header row
                      <tr key={`cap-${cap.id}`}>
                        <td
                          colSpan={data.suppliers.length + 2}
                          className="px-3 py-2 text-brand-400 font-semibold text-xs uppercase tracking-wider bg-brand-500/10 border-b border-[#1E2433]"
                        >
                          {cap.name}
                        </td>
                      </tr>,
                      // Requirement rows
                      ...capReqs.map(req => (
                        <tr key={req.id} className="border-b border-[#1E2433] hover:bg-[#141720]/50">
                          <td className="px-3 py-2 text-gray-300 sticky left-0 bg-[#0F1117]">
                            <div className="flex items-center gap-2">
                              {req.is_critical === 1 && (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" aria-label="K.O.-Kriterium" />
                              )}
                              <span>{req.requirement}</span>
                            </div>
                          </td>
                          {data.suppliers.map(s => {
                            const cell = getCell(req.id, s.project_supplier_id)
                            return (
                              <td key={s.project_supplier_id} className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${cell.className}`}>
                                  {cell.label}
                                </span>
                              </td>
                            )
                          })}
                          <td className="px-3 py-2 text-center text-gray-400 text-xs">
                            {getReqScore(req.id)}%
                          </td>
                        </tr>
                      )),
                    ]
                  })}

                  {/* Summary row */}
                  <tr className="border-t-2 border-[#2A3040]">
                    <td className="px-3 py-2 text-white font-semibold sticky left-0 bg-[#0F1117]">
                      Gesamt-Score
                    </td>
                    {data.suppliers.map(s => {
                      const score = getFulfillmentScore(s.project_supplier_id, data.requirements)
                      return (
                        <td key={s.project_supplier_id} className="px-3 py-2 text-center">
                          <span className={`text-sm font-bold ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {score}%
                          </span>
                        </td>
                      )
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="font-medium text-gray-300">Legende:</span>
            {Object.entries(FULFILLMENT_DISPLAY).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${val.className}`}>{val.label}</span>
                <span className="capitalize">{key.replace('_', ' ')}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold bg-gray-800 text-gray-500">—</span>
              <span>Keine Antwort</span>
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>K.O.-Kriterium</span>
            </span>
          </div>
        </>
      )}

      {!selectedProjectId && !loading && (
        <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-10 text-center text-gray-500">
          Bitte wählen Sie ein Projekt aus, um die Fit-Gap-Analyse anzuzeigen.
        </div>
      )}
    </div>
  )
}
