import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, ChevronDown, ChevronRight, Upload, Loader2, X,
  AlertTriangle, Pencil, Trash2, Download
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'

type Capability = {
  id: string; name: string; type: 'functional' | 'non_functional'
  sort_order: number; requirement_count: number; total_weight: number
}

type Requirement = {
  id: string; capability_id: string; requirement_id: string | null
  requirement_type: string | null; category1: string | null; category2: string | null
  category3: string | null; category4: string | null; requirement: string
  description: string | null; priority: 'A' | 'B' | 'C' | null
  weight: number; is_critical: number; acceptance_criteria: string | null
  source: string | null; demo_scenario: string | null; comment: string | null
  capability_name?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  A: 'text-red-400 bg-red-500/10 border-red-500/30',
  B: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  C: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
}

const EMPTY_REQ: Partial<Requirement> = {
  requirement: '', requirement_id: '', requirement_type: 'Muss',
  category1: '', category2: '', category3: '', category4: '',
  description: '', priority: 'B', weight: 1.0, is_critical: 0,
  acceptance_criteria: '', source: '', demo_scenario: '', comment: '',
}

export default function AnforderungenPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getStoredUser()
  const canEdit = user?.role === 'admin' || user?.role === 'berater'

  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // capability modal
  const [showCapModal, setShowCapModal] = useState(false)
  const [capForm, setCapForm] = useState({ name: '', type: 'functional' as 'functional' | 'non_functional' })
  const [savingCap, setSavingCap] = useState(false)

  // requirement modal
  const [showReqModal, setShowReqModal] = useState(false)
  const [reqForm, setReqForm] = useState<Partial<Requirement> & { capability_id?: string }>(EMPTY_REQ)
  const [savingReq, setSavingReq] = useState(false)
  const [editingReqId, setEditingReqId] = useState<string | null>(null)

  // requirement detail drawer
  const [detailReq, setDetailReq] = useState<Requirement | null>(null)

  // import
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (projectId) load() }, [projectId])

  async function load() {
    setLoading(true)
    try {
      const [capRes, reqRes] = await Promise.all([
        api.get<{ capabilities: Capability[] }>(`/api/projects/${projectId}/capabilities`),
        api.get<{ requirements: Requirement[] }>(`/api/projects/${projectId}/requirements`),
      ])
      setCapabilities(capRes.capabilities)
      setRequirements(reqRes.requirements)
      if (capRes.capabilities.length > 0 && expanded.size === 0) {
        setExpanded(new Set([capRes.capabilities[0].id]))
      }
    } finally {
      setLoading(false)
    }
  }

  async function saveCap(e: React.FormEvent) {
    e.preventDefault()
    setSavingCap(true)
    try {
      await api.post(`/api/projects/${projectId}/capabilities`, capForm)
      setShowCapModal(false)
      setCapForm({ name: '', type: 'functional' })
      await load()
    } finally { setSavingCap(false) }
  }

  async function deleteCap(capId: string) {
    if (!confirm('Capability und alle Anforderungen löschen?')) return
    await api.delete(`/api/projects/${projectId}/capabilities/${capId}`)
    await load()
  }

  function openNewReq(capId: string) {
    setReqForm({ ...EMPTY_REQ, capability_id: capId })
    setEditingReqId(null)
    setShowReqModal(true)
  }

  function openEditReq(req: Requirement) {
    setReqForm({ ...req, capability_id: req.capability_id })
    setEditingReqId(req.id)
    setShowReqModal(true)
  }

  async function saveReq(e: React.FormEvent) {
    e.preventDefault()
    if (!reqForm.requirement?.trim() || !reqForm.capability_id) return
    setSavingReq(true)
    try {
      if (editingReqId) {
        await api.put(`/api/projects/${projectId}/requirements/${editingReqId}`, reqForm)
      } else {
        await api.post(`/api/projects/${projectId}/requirements`, reqForm)
      }
      setShowReqModal(false)
      await load()
    } finally { setSavingReq(false) }
  }

  async function deleteReq(reqId: string) {
    if (!confirm('Anforderung löschen?')) return
    await api.delete(`/api/projects/${projectId}/requirements/${reqId}`)
    await load()
  }

  function toggleExpanded(capId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(capId) ? next.delete(capId) : next.add(capId)
      return next
    })
  }

  // ── Excel import ──
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult('')

    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      const mapped = rows.map(row => ({
        capability_name: String(row['capability_name'] || row['category1'] || 'Allgemein'),
        requirement_id: row['requirementId'] ? String(row['requirementId']) : null,
        requirement_type: row['requirementType'] ? String(row['requirementType']) : null,
        category1: row['category1'] ? String(row['category1']) : null,
        category2: row['category2'] ? String(row['category2']) : null,
        category3: row['category3'] ? String(row['category3']) : null,
        category4: row['category4'] ? String(row['category4']) : null,
        requirement: String(row['requirement'] || ''),
        description: row['description'] ? String(row['description']) : null,
        priority: row['priority'] ? String(row['priority']) : null,
        weight: row['weight'] ? Number(row['weight']) : 1.0,
        is_critical: row['isCritical'] ? 1 : 0,
        acceptance_criteria: row['acceptanceCriteria'] ? String(row['acceptanceCriteria']) : null,
        source: row['source'] ? String(row['source']) : null,
        demo_scenario: row['demoScenario'] ? String(row['demoScenario']) : null,
        comment: row['comment'] ? String(row['comment']) : null,
      })).filter(r => r.requirement.trim())

      const res = await api.post<{ imported: number; capabilities_created: number }>(
        `/api/projects/${projectId}/requirements/import`,
        { rows: mapped }
      )
      setImportResult(`✓ ${res.imported} Anforderungen importiert, ${res.capabilities_created} Capabilities angelegt.`)
      await load()
    } catch (err) {
      setImportResult(`Fehler beim Import: ${(err as Error).message}`)
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function downloadTemplate() {
    const template = [
      {
        capability_name: 'MES Grundlagen', requirementId: 'ANL-01', requirementType: 'Muss',
        category1: 'MES Grundlagen', category2: '', category3: '', category4: '',
        requirement: 'Beispielanforderung', description: 'Detailbeschreibung',
        priority: 'A', weight: 1.0, isCritical: 0,
        acceptanceCriteria: '', source: '', demoScenario: '', comment: '',
      }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Anforderungen')
    XLSX.writeFile(wb, 'adtender_anforderungen_vorlage.xlsx')
  }

  const reqs = (capId: string) => requirements.filter(r => r.capability_id === capId)

  const totalWeight = capabilities.reduce((sum, c) => sum + (c.total_weight || 0), 0)

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate(`/projekte/${projectId}`)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-3 transition-colors">
            <ArrowLeft size={15} /> Zum Projekt
          </button>
          <h1 className="text-2xl font-bold text-white">Anforderungskatalog</h1>
          <p className="text-gray-500 text-sm mt-1">
            {capabilities.length} Capabilities · {requirements.length} Anforderungen
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors">
              <Download size={14} /> Vorlage
            </button>
            <label className={`flex items-center gap-2 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${importing ? 'opacity-60' : ''}`}>
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Excel importieren
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileImport} disabled={importing} />
            </label>
            <button onClick={() => setShowCapModal(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} /> Capability
            </button>
          </div>
        )}
      </div>

      {importResult && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${importResult.startsWith('✓') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {importResult}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : capabilities.length === 0 ? (
        <div className="text-center py-24 bg-[#141720] border border-[#1E2433] rounded-2xl">
          <p className="text-gray-400 mb-2 font-medium">Noch keine Capabilities angelegt</p>
          <p className="text-gray-600 text-sm mb-6">Legen Sie zuerst Capabilities an oder importieren Sie per Excel.</p>
          {canEdit && (
            <button onClick={() => setShowCapModal(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} /> Erste Capability anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {capabilities.map(cap => {
            const capReqs = reqs(cap.id)
            const isExpanded = expanded.has(cap.id)
            const capWeight = totalWeight > 0 ? Math.round((cap.total_weight / totalWeight) * 100) : 0

            return (
              <div key={cap.id} className="bg-[#141720] border border-[#1E2433] rounded-xl overflow-hidden">
                {/* Capability header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#1A1F2E] transition-colors"
                  onClick={() => toggleExpanded(cap.id)}
                >
                  {isExpanded ? <ChevronDown size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-semibold text-sm">{cap.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cap.type === 'functional' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                        {cap.type === 'functional' ? 'Funktional' : 'Nicht-funktional'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{cap.requirement_count} Anforderungen · Gewicht: {capWeight}%</p>
                  </div>
                  {/* Weight bar */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 h-1.5 bg-[#2A3040] rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${capWeight}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs w-8 text-right">{capWeight}%</span>
                    {canEdit && (
                      <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openNewReq(cap.id)}
                          className="p-1.5 hover:bg-[#252D42] rounded text-gray-500 hover:text-gray-300 transition-colors">
                          <Plus size={13} />
                        </button>
                        <button onClick={() => deleteCap(cap.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements list */}
                {isExpanded && (
                  <div className="border-t border-[#1E2433]">
                    {capReqs.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-gray-600 text-sm">Noch keine Anforderungen.</p>
                        {canEdit && (
                          <button onClick={() => openNewReq(cap.id)}
                            className="text-brand-400 text-xs mt-1 hover:underline">
                            Anforderung hinzufügen →
                          </button>
                        )}
                      </div>
                    ) : (
                      capReqs.map((req, i) => (
                        <div
                          key={req.id}
                          className={`flex items-start gap-4 px-5 py-3.5 hover:bg-[#1A1F2E] transition-colors cursor-pointer group ${i > 0 ? 'border-t border-[#1E2433]/50' : ''}`}
                          onClick={() => setDetailReq(req)}
                        >
                          {/* Priority + KO */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                            {req.priority && (
                              <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded border ${PRIORITY_COLORS[req.priority]}`}>
                                {req.priority}
                              </span>
                            )}
                            {req.is_critical ? (
                              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1 py-0.5 rounded">K.O.</span>
                            ) : null}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              {req.requirement_id && (
                                <span className="text-gray-600 text-xs flex-shrink-0 mt-0.5">{req.requirement_id}</span>
                              )}
                              <p className="text-gray-200 text-sm leading-snug">{req.requirement}</p>
                            </div>
                            {req.description && (
                              <p className="text-gray-500 text-xs mt-1 line-clamp-1">{req.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              {req.category2 && <span className="text-gray-600 text-xs">{req.category2}</span>}
                              <span className="text-gray-700 text-xs">Gewicht: {req.weight}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {canEdit && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={e => e.stopPropagation()}>
                              <button onClick={() => openEditReq(req)}
                                className="p-1.5 hover:bg-[#252D42] rounded text-gray-500 hover:text-gray-300 transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => deleteReq(req.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {canEdit && capReqs.length > 0 && (
                      <div className="px-5 py-2 border-t border-[#1E2433]/50">
                        <button onClick={() => openNewReq(cap.id)}
                          className="flex items-center gap-1.5 text-gray-600 hover:text-brand-400 text-xs transition-colors">
                          <Plus size={12} /> Anforderung hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Capability modal ── */}
      {showCapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCapModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold">Capability anlegen</h2>
              <button onClick={() => setShowCapModal(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={saveCap} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name *</label>
                <input type="text" required value={capForm.name} onChange={e => setCapForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. MES Grundlagen"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Typ</label>
                <select value={capForm.type} onChange={e => setCapForm(f => ({ ...f, type: e.target.value as 'functional' | 'non_functional' }))}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                  <option value="functional">Funktional</option>
                  <option value="non_functional">Nicht-funktional</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCapModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">Abbrechen</button>
                <button type="submit" disabled={savingCap}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {savingCap ? <Loader2 size={15} className="animate-spin" /> : 'Anlegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Requirement modal ── */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReqModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433] sticky top-0 bg-[#141720] z-10">
              <h2 className="text-white font-semibold">{editingReqId ? 'Anforderung bearbeiten' : 'Neue Anforderung'}</h2>
              <button onClick={() => setShowReqModal(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <form onSubmit={saveReq} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Capability */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Capability *</label>
                  <select value={reqForm.capability_id || ''} onChange={e => setReqForm(f => ({ ...f, capability_id: e.target.value }))} required
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                    {capabilities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Anforderung (Titel) *</label>
                  <textarea required rows={2} value={reqForm.requirement || ''} onChange={e => setReqForm(f => ({ ...f, requirement: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>

                {/* ID + Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Anforderungs-ID</label>
                  <input type="text" value={reqForm.requirement_id || ''} onChange={e => setReqForm(f => ({ ...f, requirement_id: e.target.value }))}
                    placeholder="z.B. ANL-07"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Typ</label>
                  <select value={reqForm.requirement_type || 'Muss'} onChange={e => setReqForm(f => ({ ...f, requirement_type: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                    <option>Muss</option><option>Soll</option><option>Kann</option>
                  </select>
                </div>

                {/* Categories */}
                {(['category1','category2','category3','category4'] as const).map((cat, i) => (
                  <div key={cat}>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Kategorie {i + 1}</label>
                    <input type="text" value={(reqForm as Record<string, unknown>)[cat] as string || ''} onChange={e => setReqForm(f => ({ ...f, [cat]: e.target.value }))}
                      className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                ))}

                {/* Priority + Weight + KO */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Priorität</label>
                  <select value={reqForm.priority || 'B'} onChange={e => setReqForm(f => ({ ...f, priority: e.target.value as 'A'|'B'|'C' }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                    <option value="A">A — Hoch</option><option value="B">B — Mittel</option><option value="C">C — Niedrig</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Gewichtung</label>
                  <input type="number" min="0" step="0.1" value={reqForm.weight ?? 1.0} onChange={e => setReqForm(f => ({ ...f, weight: parseFloat(e.target.value) }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>

                {/* KO */}
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="is_critical" checked={!!reqForm.is_critical}
                    onChange={e => setReqForm(f => ({ ...f, is_critical: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 rounded border-gray-600 bg-[#0F1117] text-brand-500" />
                  <label htmlFor="is_critical" className="text-sm text-gray-300 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" /> K.O.-Kriterium
                  </label>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Beschreibung</label>
                  <textarea rows={2} value={reqForm.description || ''} onChange={e => setReqForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>

                {/* Acceptance criteria */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Abnahmekriterium / Nachweis</label>
                  <textarea rows={2} value={reqForm.acceptance_criteria || ''} onChange={e => setReqForm(f => ({ ...f, acceptance_criteria: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>

                {/* Source + Demo */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Herkunft</label>
                  <input type="text" value={reqForm.source || ''} onChange={e => setReqForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Demo-Szenario</label>
                  <input type="text" value={reqForm.demo_scenario || ''} onChange={e => setReqForm(f => ({ ...f, demo_scenario: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>

                {/* Comment */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Kommentar Auftraggeber</label>
                  <textarea rows={2} value={reqForm.comment || ''} onChange={e => setReqForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-5">
                <button type="button" onClick={() => setShowReqModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">Abbrechen</button>
                <button type="submit" disabled={savingReq}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {savingReq ? <Loader2 size={15} className="animate-spin" /> : (editingReqId ? 'Speichern' : 'Anlegen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail drawer ── */}
      {detailReq && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailReq(null)} />
          <div className="relative bg-[#141720] border-l border-[#1E2433] w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433] sticky top-0 bg-[#141720]">
              <div className="flex items-center gap-2">
                {detailReq.requirement_id && <span className="text-gray-500 text-sm">{detailReq.requirement_id}</span>}
                {detailReq.is_critical ? <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">K.O.</span> : null}
              </div>
              <button onClick={() => setDetailReq(null)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <h2 className="text-white font-semibold text-base leading-snug">{detailReq.requirement}</h2>

              <div className="flex items-center gap-2">
                {detailReq.priority && (
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${PRIORITY_COLORS[detailReq.priority]}`}>
                    Priorität {detailReq.priority}
                  </span>
                )}
                {detailReq.requirement_type && (
                  <span className="text-xs px-2 py-1 rounded border text-gray-400 bg-gray-500/10 border-gray-500/20">
                    {detailReq.requirement_type}
                  </span>
                )}
                <span className="text-xs text-gray-500">Gewicht: {detailReq.weight}</span>
              </div>

              {[
                { label: 'Beschreibung', value: detailReq.description },
                { label: 'Kategorie', value: [detailReq.category1, detailReq.category2, detailReq.category3, detailReq.category4].filter(Boolean).join(' › ') },
                { label: 'Abnahmekriterium', value: detailReq.acceptance_criteria },
                { label: 'Herkunft', value: detailReq.source },
                { label: 'Demo-Szenario', value: detailReq.demo_scenario },
                { label: 'Kommentar', value: detailReq.comment },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{value}</p>
                </div>
              ) : null)}

              {canEdit && (
                <div className="pt-4 border-t border-[#1E2433] flex gap-2">
                  <button onClick={() => { setDetailReq(null); openEditReq(detailReq) }}
                    className="flex items-center gap-2 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                    <Pencil size={13} /> Bearbeiten
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
