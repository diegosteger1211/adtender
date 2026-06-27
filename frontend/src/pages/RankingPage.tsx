import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart2, X, CheckCircle2, AlertTriangle, ExternalLink, Loader2, Save, GitCompare, SlidersHorizontal } from 'lucide-react'
import { api } from '../lib/api'

type SupplierRank = {
  psId: string
  supplierId: string
  companyName: string
  contactName: string
  description: string | null
  website: string | null
  logoUrl: string | null
  location: string
  status: string
  shortlisted: boolean
  prequalScore: number | null
  reqTotal: number
  reqFulfilled: number
  koViolations: number
  reqScore: number
}

type SortMode = 'vorauswahl' | 'anforderungen'

function CircleProgress({ value, max = 100, size = 56, color = '#6366f1', textColor = 'text-white' }: {
  value: number; max?: number; size?: number; color?: string; textColor?: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const r = (size / 2) - 5
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2433" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`absolute text-xs font-bold ${textColor}`}>{value}</span>
    </div>
  )
}

function SupplierInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2)
  return (
    <div className="w-12 h-12 rounded-lg bg-[#252D42] border border-[#2A3347] flex items-center justify-center text-gray-300 text-sm font-semibold flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  )
}

export default function RankingPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<SupplierRank[]>([])
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('vorauswahl')
  const [showRanks, setShowRanks] = useState(true)
  const [selected, setSelected] = useState<SupplierRank | null>(null)
  const [detailTab, setDetailTab] = useState<'status' | 'informationen' | 'notizen'>('status')
  const [shortlistDirty, setShortlistDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showExcluded, setShowExcluded] = useState(false)

  useEffect(() => { load() }, [projectId])

  async function load() {
    try {
      const res = await api.get<{ suppliers: SupplierRank[] }>(`/api/projects/${projectId}/ranking`)
      setSuppliers(res.suppliers)
    } finally {
      setLoading(false)
    }
  }

  const sorted = useMemo(() => {
    const list = [...suppliers]
    if (sortMode === 'vorauswahl') {
      list.sort((a, b) => (b.prequalScore ?? 0) - (a.prequalScore ?? 0))
    } else {
      list.sort((a, b) => {
        if (a.koViolations !== b.koViolations) return a.koViolations - b.koViolations
        return b.reqScore - a.reqScore
      })
    }
    return list
  }, [suppliers, sortMode])

  const included = sorted.filter(s => s.status !== 'excluded')
  const excluded = sorted.filter(s => s.status === 'excluded')

  function toggleShortlist(psId: string) {
    setSuppliers(prev => prev.map(s => s.psId === psId ? { ...s, shortlisted: !s.shortlisted } : s))
    if (selected?.psId === psId) setSelected(prev => prev ? { ...prev, shortlisted: !prev.shortlisted } : prev)
    setShortlistDirty(true)
  }

  async function saveShortlist() {
    setSaving(true)
    try {
      await api.put(`/api/projects/${projectId}/ranking/shortlist`, {
        updates: suppliers.map(s => ({ psId: s.psId, shortlisted: s.shortlisted }))
      })
      setShortlistDirty(false)
    } finally {
      setSaving(false)
    }
  }

  function openDetail(s: SupplierRank) {
    setSelected(s)
    setDetailTab('status')
  }

  const displayList = [...included, ...(showExcluded ? excluded : [])]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main panel */}
      <div className={`flex-1 min-w-0 flex flex-col overflow-hidden transition-all ${selected ? 'mr-0' : ''}`}>
        <div className="p-6 pb-0 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart2 size={20} className="text-brand-400" />
              <h1 className="text-xl font-bold text-white">Ranking</h1>
              <span className="text-gray-500 text-sm">{included.length} Anbieter</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/projekte/${projectId}/vergleich`)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <GitCompare size={15} />
                Systeme vergleichen
              </button>
              <button
                onClick={saveShortlist}
                disabled={!shortlistDirty || saving}
                className="flex items-center gap-2 border border-[#2A3347] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Shortlist speichern
              </button>
              <button
                className="border border-[#2A3347] text-gray-400 hover:text-gray-300 px-3 py-2 rounded-lg transition-colors"
                title="Filter"
              >
                <SlidersHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-[#1E2433] pb-0">
            <button
              onClick={() => setShowRanks(r => !r)}
              className="text-xs text-gray-500 hover:text-gray-300 pb-3 transition-colors"
            >
              {showRanks ? 'Reihenfolge ausblenden' : 'Reihenfolge einblenden'}
            </button>
            <div className="flex">
              {(['vorauswahl', 'anforderungen'] as SortMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                    sortMode === mode
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {mode === 'vorauswahl' ? 'Vorauswahl' : 'Anforderungen'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-2">
          {suppliers.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Noch keine Anbieter mit Antworten vorhanden.
            </div>
          ) : (
            <>
              {displayList.map((s) => {
                const rank = included.indexOf(s) + 1
                const isExcluded = s.status === 'excluded'

                return (
                  <div
                    key={s.psId}
                    onClick={() => openDetail(s)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selected?.psId === s.psId
                        ? 'border-brand-500 bg-brand-500/5'
                        : 'border-[#1E2433] bg-[#141720] hover:border-[#2A3347] hover:bg-[#1a2035]'
                    } ${isExcluded ? 'opacity-50' : ''}`}
                  >
                    {/* Rank badge */}
                    {showRanks && !isExcluded && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        s.koViolations > 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-[#1E2433] text-gray-300 border border-[#2A3347]'
                      }`}>
                        {rank}
                      </div>
                    )}

                    {/* Logo / initials */}
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.companyName} className="w-12 h-12 rounded-lg object-contain bg-white p-1 flex-shrink-0" />
                    ) : (
                      <SupplierInitials name={s.companyName} />
                    )}

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{s.companyName}</p>
                      <p className="text-gray-500 text-xs">{s.contactName}</p>
                    </div>

                    {/* Shortlist toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleShortlist(s.psId) }}
                      className={`text-xs px-2 py-1 rounded-md border transition-colors flex-shrink-0 ${
                        s.shortlisted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-[#1E2433] border-[#2A3347] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {s.shortlisted ? 'Shortlist' : '+ Shortlist'}
                    </button>

                    {/* Scores */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-gray-600 mb-1">Vorauswahl</span>
                        {s.prequalScore !== null ? (
                          <CircleProgress value={s.prequalScore} color="#6366f1" />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center text-gray-600 text-xs">—</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-gray-600 mb-1">Anforderungen</span>
                        <div className="flex flex-col items-center">
                          <CircleProgress
                            value={s.reqScore}
                            color={s.koViolations > 0 ? '#ef4444' : '#10b981'}
                          />
                          {s.koViolations > 0 && (
                            <span className="text-xs text-red-400 font-medium mt-0.5">{s.koViolations} KO</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Excluded toggle */}
              {excluded.length > 0 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowExcluded(v => !v)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors border-t border-[#1E2433] pt-2 w-full"
                  >
                    {showExcluded ? 'Ausgeschlossene ausblenden' : `Ausgeschlossene einblenden (${excluded.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 border-l border-[#1E2433] bg-[#0F1117] flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="flex items-start justify-between p-4 border-b border-[#1E2433]">
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm truncate">{selected.companyName}</p>
              <p className="text-gray-500 text-xs">{selected.contactName}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 ml-2 flex-shrink-0">
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1E2433]">
            {(['status', 'informationen', 'notizen'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`flex-1 text-xs font-medium py-2.5 border-b-2 transition-colors capitalize ${
                  detailTab === tab
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {detailTab === 'status' && (
              <div className="space-y-4">
                {/* Score grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Vorauswahl', value: selected.prequalScore, color: '#6366f1' },
                    {
                      label: 'Anforderungen',
                      value: selected.reqTotal > 0 ? selected.reqScore : null,
                      color: selected.koViolations > 0 ? '#ef4444' : '#10b981'
                    },
                    { label: 'Präsentationen', value: null, color: '#6b7280' },
                    { label: 'Experteneinschätzung', value: null, color: '#6b7280' },
                  ].map(m => (
                    <div key={m.label} className="bg-[#141720] border border-[#1E2433] rounded-lg p-3 flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-500 text-center leading-tight">{m.label}</span>
                      {m.value !== null ? (
                        <CircleProgress value={m.value} color={m.color} size={48} />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center">
                          <CircleProgress value={0} color="#374151" size={48} textColor="text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* KO alert */}
                {selected.koViolations > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-xs font-medium">{selected.koViolations} K.O.-Anforderung{selected.koViolations > 1 ? 'en' : ''} nicht erfüllt</p>
                        <p className="text-red-400/70 text-xs mt-0.5">Dieses Produkt erfüllt nicht alle kritischen Anforderungen. Diese müssen geprüft und mit dem Anbieter geklärt werden.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shortlist status */}
                <div className={`border rounded-lg p-3 ${
                  selected.shortlisted
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-[#141720] border-[#1E2433]'
                }`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className={selected.shortlisted ? 'text-emerald-400 flex-shrink-0 mt-0.5' : 'text-gray-600 flex-shrink-0 mt-0.5'} />
                    <div>
                      <p className={`text-xs font-medium ${selected.shortlisted ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {selected.shortlisted ? 'Eingeschlossen' : 'Nicht auf Shortlist'}
                      </p>
                      <p className={`text-xs mt-0.5 ${selected.shortlisted ? 'text-emerald-400/70' : 'text-gray-600'}`}>
                        {selected.shortlisted
                          ? 'Dieses System ist Teil Ihrer Shortlist. Der Anbieter hat Zugriff auf die freigegebenen Projektdaten.'
                          : 'Klicken Sie auf "+ Shortlist" in der Liste, um diesen Anbieter einzuschließen.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-[#141720] border border-[#1E2433] rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Anforderungen</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Gesamt beantwortet</span>
                    <span className="text-white">{selected.reqFulfilled} / {selected.reqTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">KO-Verletzungen</span>
                    <span className={selected.koViolations > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {selected.koViolations}
                    </span>
                  </div>
                  {selected.reqTotal > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Erfüllungsgrad</span>
                        <span className="text-white">{selected.reqScore}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1E2433] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${selected.koViolations > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${selected.reqScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {detailTab === 'informationen' && (
              <div className="space-y-4">
                {selected.description ? (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Produktbeschreibung</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{selected.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs italic">Keine Produktbeschreibung hinterlegt.</p>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Produktdetails</p>
                  <div className="space-y-2">
                    {selected.location && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Standort</span>
                        <span className="text-gray-300">{selected.location}</span>
                      </div>
                    )}
                    {selected.website && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Website</span>
                        <a
                          href={selected.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-brand-400 hover:underline flex items-center gap-1"
                        >
                          {selected.website.replace(/^https?:\/\//, '')}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className={`capitalize ${selected.status === 'submitted' ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'notizen' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Interne Notiz zu diesem Anbieter</p>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Notizen, Beobachtungen, Gesprächsnotizen..."
                  rows={8}
                  className="w-full bg-[#141720] border border-[#1E2433] text-gray-300 placeholder-gray-600 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-gray-600">Notizen werden in der Notizen-App gespeichert.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
