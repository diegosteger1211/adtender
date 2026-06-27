import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, MessageSquare, Euro, LogOut } from 'lucide-react'
import { portalApi, clearPortalToken } from '../../lib/portalApi'

type Capability = { id: string; name: string; type: string }

type Requirement = {
  id: string; capability_id: string; requirement_id: string | null
  requirement: string; description: string | null; priority: string | null
  weight: number; is_critical: number
  acceptance_criteria: string | null; demo_scenario: string | null; comment: string | null
  // response fields
  fulfillment: string | null; response_comment: string | null
  cost_amount: number | null; cost_currency: string | null; cost_note: string | null
}

type FinancialData = {
  currency: string
  ops_one_time: number | null; ops_license_per_month: number | null
  ops_maintenance_per_month: number | null; ops_other_per_month: number | null
  adapt_rate_pm: number | null; adapt_rate_consulting: number | null; adapt_rate_development: number | null
  impl_interfaces: number | null; impl_data_migration: number | null; impl_training: number | null
  impl_project_mgmt: number | null; impl_consulting: number | null; impl_other: number | null
}

const FULFILLMENT_OPTIONS = [
  { value: 'standard', label: 'Standard', color: 'text-emerald-400', desc: 'Im Standard enthalten — keine Kosten' },
  { value: 'konfiguration', label: 'Konfiguration / Parametrierung', color: 'text-blue-400', desc: 'Konfigurierbar ohne Programmierung' },
  { value: 'customizing', label: 'Customizing / Workflow / Scripting', color: 'text-orange-400', desc: 'Anpassung per Scripting / Workflow' },
  { value: 'programmierung', label: 'Individuelle Programmierung', color: 'text-purple-400', desc: 'Individuelle Entwicklung erforderlich' },
  { value: 'nicht_vorhanden', label: 'Nicht vorhanden', color: 'text-red-400', desc: 'Funktion nicht verfügbar' },
]

type Tab = 'finanzdaten' | 'anforderungen'

const EMPTY_FIN: FinancialData = {
  currency: 'EUR',
  ops_one_time: null, ops_license_per_month: null, ops_maintenance_per_month: null, ops_other_per_month: null,
  adapt_rate_pm: null, adapt_rate_consulting: null, adapt_rate_development: null,
  impl_interfaces: null, impl_data_migration: null, impl_training: null,
  impl_project_mgmt: null, impl_consulting: null, impl_other: null,
}

export default function PortalProjectPage() {
  const { psId } = useParams<{ psId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<{ title: string; category: string; phase: string; company_name: string } | null>(null)
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [financial, setFinancial] = useState<FinancialData>(EMPTY_FIN)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('finanzdaten')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [savingFin, setSavingFin] = useState(false)
  const [finSaved, setFinSaved] = useState(false)

  // Detail drawer
  const [detailReq, setDetailReq] = useState<Requirement | null>(null)
  const [responseForm, setResponseForm] = useState<{ fulfillment: string; comment: string; cost_amount: string; cost_note: string }>({ fulfillment: '', comment: '', cost_amount: '', cost_note: '' })
  const [savingResponse, setSavingResponse] = useState(false)

  useEffect(() => { load() }, [psId])

  async function load() {
    if (!psId) return
    try {
      const [projRes, reqRes, finRes] = await Promise.all([
        portalApi.get<{ project: { title: string; category: string; phase: string; company_name: string } }>(`/api/portal/projects/${psId}`),
        portalApi.get<{ capabilities: Capability[]; requirements: Requirement[] }>(`/api/portal/projects/${psId}/requirements`),
        portalApi.get<{ financial: FinancialData | null }>(`/api/portal/projects/${psId}/financial`),
      ])
      setProject(projRes.project)
      setCapabilities(reqRes.capabilities)
      setRequirements(reqRes.requirements)
      if (finRes.financial) setFinancial(finRes.financial)
      if (reqRes.capabilities.length > 0) setExpanded(new Set([reqRes.capabilities[0].id]))
    } catch {
      navigate('/portal/login')
    } finally {
      setLoading(false)
    }
  }

  async function saveFinancial(e: React.FormEvent) {
    e.preventDefault()
    if (!psId) return
    setSavingFin(true)
    try {
      await portalApi.put(`/api/portal/projects/${psId}/financial`, financial)
      setFinSaved(true)
      setTimeout(() => setFinSaved(false), 3000)
    } finally { setSavingFin(false) }
  }

  function openDetail(req: Requirement) {
    setDetailReq(req)
    setResponseForm({
      fulfillment: req.fulfillment || '',
      comment: req.response_comment || '',
      cost_amount: req.cost_amount?.toString() || '',
      cost_note: req.cost_note || '',
    })
  }

  async function saveResponse() {
    if (!psId || !detailReq) return
    setSavingResponse(true)
    try {
      const needsCost = responseForm.fulfillment && responseForm.fulfillment !== 'standard' && responseForm.fulfillment !== 'nicht_vorhanden'
      await portalApi.put(`/api/portal/projects/${psId}/requirements/${detailReq.id}/response`, {
        fulfillment: responseForm.fulfillment || null,
        comment: responseForm.comment || null,
        cost_amount: needsCost && responseForm.cost_amount ? parseFloat(responseForm.cost_amount) : null,
        cost_note: needsCost ? responseForm.cost_note || null : null,
      })
      // Update local state
      setRequirements(prev => prev.map(r => r.id === detailReq.id ? {
        ...r,
        fulfillment: responseForm.fulfillment || null,
        response_comment: responseForm.comment || null,
        cost_amount: needsCost && responseForm.cost_amount ? parseFloat(responseForm.cost_amount) : null,
        cost_note: needsCost ? responseForm.cost_note || null : null,
      } : r))
      setDetailReq(null)
    } finally { setSavingResponse(false) }
  }

  const needsCost = responseForm.fulfillment && !['standard', 'nicht_vorhanden', ''].includes(responseForm.fulfillment)

  const answered = requirements.filter(r => r.fulfillment).length
  const total = requirements.length

  const fin = (key: keyof FinancialData) => financial[key] as number | null

  if (loading) return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-500" size={24} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Portal header */}
      <div className="bg-[#141720] border-b border-[#1E2433] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{project?.title}</p>
            <p className="text-gray-500 text-xs">{project?.company_name} · Anbieter-Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-xs">Fortschritt Anforderungen</p>
            <p className="text-white text-sm font-semibold">{answered} / {total}</p>
          </div>
          <button onClick={() => { clearPortalToken(); navigate('/portal/login') }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors">
            <LogOut size={15} /> Abmelden
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0F1117] border border-[#1E2433] rounded-xl p-1 w-fit">
          {([['finanzdaten', <Euro size={14} />, 'Finanzdaten'], ['anforderungen', <CheckCircle size={14} />, `Anforderungen (${answered}/${total})`]] as const).map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-[#1E2433] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ── Finanzdaten ── */}
        {tab === 'finanzdaten' && (
          <form onSubmit={saveFinancial} className="space-y-6">
            <div className="bg-[#141720] border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-orange-300 text-sm">
                Bitte geben Sie erste unverbindliche Schätzungen zu Betriebs-, Anpassungs- und Implementierungskosten ein.
                Diese dienen als Grundlage für den Auswahlprozess und können im Projektverlauf angepasst werden.
              </p>
            </div>

            {/* Währung */}
            <div className="w-48">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Währung</label>
              <select value={financial.currency} onChange={e => setFinancial(f => ({ ...f, currency: e.target.value }))}
                className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                <option value="EUR">Euro (€)</option>
                <option value="CHF">Schweizer Franken (CHF)</option>
                <option value="USD">US-Dollar ($)</option>
              </select>
            </div>

            {/* Betriebskosten */}
            <Section title="Betriebskosten" desc="Laufende Kosten für den Betrieb Ihrer Softwarelösung.">
              <Field label="Einmalige Gebühren" value={fin('ops_one_time')} onChange={v => setFinancial(f => ({ ...f, ops_one_time: v }))} />
              <Field label="Lizenzgebühren (pro Monat & Lizenz)" value={fin('ops_license_per_month')} onChange={v => setFinancial(f => ({ ...f, ops_license_per_month: v }))} />
              <Field label="Wartungsgebühren (pro Monat)" value={fin('ops_maintenance_per_month')} onChange={v => setFinancial(f => ({ ...f, ops_maintenance_per_month: v }))} />
              <Field label="Andere Gebühren (pro Monat)" value={fin('ops_other_per_month')} onChange={v => setFinancial(f => ({ ...f, ops_other_per_month: v }))} />
            </Section>

            {/* Anpassungskosten */}
            <Section title="Anpassungskosten (Tagessätze)" desc="Tagessätze Ihrer Teams für Beratung und Anpassungsarbeiten.">
              <Field label="Tagessatz Projektmanagement" value={fin('adapt_rate_pm')} onChange={v => setFinancial(f => ({ ...f, adapt_rate_pm: v }))} />
              <Field label="Tagessatz Beratung" value={fin('adapt_rate_consulting')} onChange={v => setFinancial(f => ({ ...f, adapt_rate_consulting: v }))} />
              <Field label="Tagessatz Entwicklung" value={fin('adapt_rate_development')} onChange={v => setFinancial(f => ({ ...f, adapt_rate_development: v }))} />
            </Section>

            {/* Implementierungskosten */}
            <Section title="Implementierungskosten" desc="Kosten für die Systemimplementierung, Schnittstellen, Datenmigration und Schulungen.">
              <Field label="Schnittstellengebühren" value={fin('impl_interfaces')} onChange={v => setFinancial(f => ({ ...f, impl_interfaces: v }))} />
              <Field label="Datenmigration" value={fin('impl_data_migration')} onChange={v => setFinancial(f => ({ ...f, impl_data_migration: v }))} />
              <Field label="Schulungsgebühren" value={fin('impl_training')} onChange={v => setFinancial(f => ({ ...f, impl_training: v }))} />
              <Field label="Projektmanagementgebühren" value={fin('impl_project_mgmt')} onChange={v => setFinancial(f => ({ ...f, impl_project_mgmt: v }))} />
              <Field label="Beratungsgebühren" value={fin('impl_consulting')} onChange={v => setFinancial(f => ({ ...f, impl_consulting: v }))} />
              <Field label="Sonstige Implementierungskosten" value={fin('impl_other')} onChange={v => setFinancial(f => ({ ...f, impl_other: v }))} />
            </Section>

            <div className="flex items-center gap-4">
              <button type="submit" disabled={savingFin}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                {savingFin ? <Loader2 size={15} className="animate-spin" /> : 'Finanzdaten speichern'}
              </button>
              {finSaved && <span className="text-emerald-400 text-sm flex items-center gap-1.5"><CheckCircle size={14} /> Gespeichert</span>}
            </div>
          </form>
        )}

        {/* ── Anforderungen ── */}
        {tab === 'anforderungen' && (
          <div className="space-y-3">
            {capabilities.map(cap => {
              const capReqs = requirements.filter(r => r.capability_id === cap.id)
              const capAnswered = capReqs.filter(r => r.fulfillment).length
              const isExpanded = expanded.has(cap.id)

              return (
                <div key={cap.id} className="bg-[#141720] border border-[#1E2433] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#1A1F2E] transition-colors"
                    onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(cap.id) ? n.delete(cap.id) : n.add(cap.id); return n })}>
                    {isExpanded ? <ChevronDown size={15} className="text-gray-500" /> : <ChevronRight size={15} className="text-gray-500" />}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">{cap.name}</h3>
                      <p className="text-gray-500 text-xs">{capAnswered} / {capReqs.length} bewertet</p>
                    </div>
                    <div className="w-24 h-1.5 bg-[#2A3040] rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: capReqs.length ? `${(capAnswered / capReqs.length) * 100}%` : '0%' }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#1E2433]">
                      {capReqs.map((req, i) => {
                        const opt = FULFILLMENT_OPTIONS.find(o => o.value === req.fulfillment)
                        return (
                          <div key={req.id}
                            className={`flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#1A1F2E] transition-colors ${i > 0 ? 'border-t border-[#1E2433]/50' : ''}`}
                            onClick={() => openDetail(req)}>
                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                              {req.is_critical ? <span className="text-[10px] font-bold text-red-400 border border-red-500/20 px-1 rounded">K.O.</span> : null}
                              {req.priority && <span className="text-[10px] font-bold text-gray-500 w-4">{req.priority}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-200 text-sm leading-snug line-clamp-2">{req.requirement}</p>
                              {req.requirement_id && <span className="text-gray-600 text-xs">{req.requirement_id}</span>}
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {req.response_comment && <MessageSquare size={13} className="text-gray-500" />}
                              {opt ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full border border-current/20 bg-current/5 ${opt.color}`}>{opt.label}</span>
                              ) : (
                                <span className="text-xs text-gray-600 border border-gray-700 px-2 py-0.5 rounded-full">Offen</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {detailReq && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailReq(null)} />
          <div className="relative bg-[#141720] border-l border-[#1E2433] w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-[#1E2433] sticky top-0 bg-[#141720] z-10">
              <div className="flex items-center gap-2 mb-1">
                {detailReq.requirement_id && <span className="text-gray-500 text-xs">{detailReq.requirement_id}</span>}
                {detailReq.is_critical ? <span className="text-xs font-bold text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">K.O.</span> : null}
              </div>
              <p className="text-white font-semibold text-sm leading-snug">{detailReq.requirement}</p>
            </div>

            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              {/* Read-only fields */}
              {detailReq.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Beschreibung</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detailReq.description}</p>
                </div>
              )}
              {detailReq.acceptance_criteria && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Abnahmekriterium</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detailReq.acceptance_criteria}</p>
                </div>
              )}
              {detailReq.demo_scenario && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Demo-Szenario</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detailReq.demo_scenario}</p>
                </div>
              )}
              {detailReq.comment && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kommentar Auftraggeber</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detailReq.comment}</p>
                </div>
              )}

              <div className="border-t border-[#1E2433] pt-5 space-y-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ihre Bewertung</p>

                {/* Fulfillment */}
                <div className="space-y-2">
                  {FULFILLMENT_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${responseForm.fulfillment === opt.value ? 'border-brand-500/40 bg-brand-500/5' : 'border-[#1E2433] hover:border-[#2A3347]'}`}>
                      <input type="radio" name="fulfillment" value={opt.value}
                        checked={responseForm.fulfillment === opt.value}
                        onChange={e => setResponseForm(f => ({ ...f, fulfillment: e.target.value }))}
                        className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-medium ${opt.color}`}>{opt.label}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Cost — only if not standard/nicht_vorhanden */}
                {needsCost && (
                  <div className="bg-[#0F1117] border border-[#1E2433] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-medium text-gray-400">Kosten für diese Anpassung</p>
                    <div className="flex gap-3">
                      <input type="number" min="0" step="0.01" placeholder="Betrag"
                        value={responseForm.cost_amount}
                        onChange={e => setResponseForm(f => ({ ...f, cost_amount: e.target.value }))}
                        className="flex-1 bg-[#141720] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                      <span className="text-gray-500 text-sm flex items-center">{financial.currency}</span>
                    </div>
                    <input type="text" placeholder="Kostenhinweis (optional)"
                      value={responseForm.cost_note}
                      onChange={e => setResponseForm(f => ({ ...f, cost_note: e.target.value }))}
                      className="w-full bg-[#141720] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                )}

                {/* Comment */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Kommentar (optional)</label>
                  <textarea rows={3} placeholder="Anmerkungen zu dieser Anforderung..."
                    value={responseForm.comment}
                    onChange={e => setResponseForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#1E2433] flex gap-3 bg-[#141720]">
              <button onClick={() => setDetailReq(null)}
                className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                Abbrechen
              </button>
              <button onClick={saveResponse} disabled={savingResponse || !responseForm.fulfillment}
                className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                {savingResponse ? <Loader2 size={15} className="animate-spin" /> : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141720] border border-[#1E2433] rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-gray-500 text-xs mb-4">{desc}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="number" min="0" step="0.01" placeholder="0,00"
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
    </div>
  )
}
