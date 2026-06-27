import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, ChevronRight, AlertTriangle, Settings2, X, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

type CapScore = { score: number; koViolations: number; reqCount: number; costAmount: number }
type FinancialData = {
  submitted: boolean
  ops_one_time: number; ops_license_per_month: number
  ops_maintenance_per_month: number; ops_other_per_month: number
  adapt_rate_pm: number; adapt_rate_consulting: number; adapt_rate_development: number
  impl_interfaces: number; impl_data_migration: number; impl_training: number
  impl_project_mgmt: number; impl_consulting: number; impl_other: number
}
type SupplierData = {
  psId: string; companyName: string; contactName: string; logoUrl: string | null
  status: string; shortlisted: boolean
  reqTotal: number; reqFulfilled: number; koViolations: number; reqScore: number
  capScores: Record<string, CapScore>
  financial: FinancialData | null
}
type Capability = { id: string; name: string; sort_order: number }

type Tab = 'uebersicht' | 'anforderungen' | 'praesentationen' | 'experteneinschaetzung' | 'kosten'

// Kosten calculation settings
type KostenSettings = {
  lizenzen: number
  years: number
  pm_factor: number
  consulting_factor: number
}

function CircleScore({ value, size = 44, color = '#6366f1', showEmpty = false }: {
  value: number | null; size?: number; color?: string; showEmpty?: boolean
}) {
  if (value === null || showEmpty) {
    const r = (size / 2) - 4
      return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2433" strokeWidth="3" />
        </svg>
        <span className="absolute text-xs text-gray-600">?</span>
      </div>
    )
  }
  const pct = Math.min(100, value)
  const r = (size / 2) - 4
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2433" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{value}</span>
    </div>
  )
}

function SupplierLogo({ s }: { s: SupplierData }) {
  const initials = s.companyName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  if (s.logoUrl) {
    return <img src={s.logoUrl} alt={s.companyName} className="w-10 h-10 object-contain rounded bg-white p-0.5" />
  }
  return (
    <div className="w-10 h-10 rounded bg-[#1E2433] border border-[#2A3347] flex items-center justify-center text-gray-400 text-xs font-semibold">
      {initials}
    </div>
  )
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'
}

function calcBetrieb(s: SupplierData, st: KostenSettings) {
  if (!s.financial) return null
  const f = s.financial
  return f.ops_one_time
    + (f.ops_license_per_month * st.lizenzen + f.ops_maintenance_per_month + f.ops_other_per_month) * 12 * st.years
}
function calcImpl(s: SupplierData) {
  if (!s.financial) return null
  const f = s.financial
  return f.impl_project_mgmt + f.impl_consulting + f.impl_data_migration + f.impl_interfaces + f.impl_training + f.impl_other
}
function calcAnpassung(s: SupplierData, st: KostenSettings, caps: Capability[]) {
  if (!s.financial) return null
  const f = s.financial
  return caps.reduce((sum, cap) => {
    const cost = s.capScores[cap.id]?.costAmount ?? 0
    return sum + cost * (1 + f.adapt_rate_pm * st.pm_factor + f.adapt_rate_consulting * st.consulting_factor)
  }, 0)
}

const SUPPLIER_COL_W = 160

export default function VergleichPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<{ projectTitle: string; suppliers: SupplierData[]; capabilities: Capability[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('uebersicht')

  // Collapse state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    anforderungen: true, praesentationen: true, experteneinschaetzung: true, kosten: true,
    betrieb: true, impl: true, anpassung: true,
  })

  // Kosten settings
  const [settings, setSettings] = useState<KostenSettings>({ lizenzen: 1, years: 2, pm_factor: 0, consulting_factor: 0 })
  const [settingsPanel, setSettingsPanel] = useState<'betrieb' | 'anpassung' | null>(null)

  useEffect(() => {
    api.get<{ projectTitle: string; suppliers: SupplierData[]; capabilities: Capability[] }>(
      `/api/projects/${projectId}/comparison`
    ).then(setData).finally(() => setLoading(false))
  }, [projectId])

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const suppliers = data?.suppliers ?? []
  const caps = data?.capabilities ?? []

  const TABS: { key: Tab; label: string }[] = [
    { key: 'uebersicht', label: 'Übersicht' },
    { key: 'anforderungen', label: 'Anforderungen' },
    { key: 'praesentationen', label: 'Präsentationen' },
    { key: 'experteneinschaetzung', label: 'Experteneinschätzung' },
    { key: 'kosten', label: 'Kosten' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-gray-500" size={24} />
    </div>
  )

  const LABEL_W = 240

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2433] flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Vergleich</h1>
        <button
          onClick={() => navigate(`/projekte/${projectId}/ranking`)}
          className="flex items-center gap-2 border border-[#2A3347] text-gray-300 hover:text-white hover:border-brand-500 px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <ChevronLeft size={14} />
          Ranking
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E2433] px-6 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content area — scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Sticky supplier header */}
        <div className="sticky top-0 z-20 bg-[#0F1117] border-b border-[#1E2433]">
          <div className="flex">
            {/* Label column */}
            <div className="flex-shrink-0 bg-[#0F1117]" style={{ width: LABEL_W }} />
            {/* Supplier cards */}
            {suppliers.map(s => (
              <div
                key={s.psId}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-2 py-3 border-l border-[#1E2433]"
                style={{ width: SUPPLIER_COL_W }}
              >
                <SupplierLogo s={s} />
                <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2">{s.companyName}</p>
                <p className="text-gray-500 text-[10px] text-center truncate w-full">{s.contactName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'uebersicht' && (
          <OverviewTab suppliers={suppliers} caps={caps} settings={settings}
            openSections={openSections} toggleSection={toggleSection}
            labelW={LABEL_W} colW={SUPPLIER_COL_W} />
        )}
        {tab === 'anforderungen' && (
          <AnforderungenTab suppliers={suppliers} caps={caps}
            labelW={LABEL_W} colW={SUPPLIER_COL_W} />
        )}
        {tab === 'praesentationen' && (
          <PlaceholderTab label="Präsentationen" labelW={LABEL_W} colW={SUPPLIER_COL_W} count={suppliers.length} />
        )}
        {tab === 'experteneinschaetzung' && (
          <PlaceholderTab label="Experteneinschätzung" labelW={LABEL_W} colW={SUPPLIER_COL_W} count={suppliers.length} />
        )}
        {tab === 'kosten' && (
          <KostenTab suppliers={suppliers} caps={caps} settings={settings}
            openSections={openSections} toggleSection={toggleSection}
            labelW={LABEL_W} colW={SUPPLIER_COL_W}
            onOpenSettings={setSettingsPanel} />
        )}
      </div>

      {/* Settings panels */}
      {settingsPanel === 'betrieb' && (
        <SettingsPopup title="Einstellungen für Betriebskosten" onClose={() => setSettingsPanel(null)}>
          <SliderField label="Anzahl der Lizenzen" min={1} max={1000} value={settings.lizenzen}
            onChange={v => setSettings(s => ({ ...s, lizenzen: v }))} />
          <div className="mt-4">
            <label className="text-xs text-gray-400 mb-2 block">Kostenzeitraum</label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={20} value={settings.years}
                onChange={e => setSettings(s => ({ ...s, years: +e.target.value || 1 }))}
                className="w-20 bg-[#0F1117] border border-[#2A3040] text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-brand-500" />
              <span className="text-gray-400 text-sm">Jahre</span>
            </div>
          </div>
        </SettingsPopup>
      )}
      {settingsPanel === 'anpassung' && (
        <SettingsPopup title="Einstellungen für Anpassungskosten" onClose={() => setSettingsPanel(null)}>
          <SliderField label="Projektmanagement-Faktor" min={0} max={2} step={0.1} value={settings.pm_factor}
            onChange={v => setSettings(s => ({ ...s, pm_factor: v }))} />
          <div className="mt-4">
            <SliderField label="Beratungsfaktor" min={0} max={2} step={0.1} value={settings.consulting_factor}
              onChange={v => setSettings(s => ({ ...s, consulting_factor: v }))} />
          </div>
        </SettingsPopup>
      )}
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ suppliers, caps, settings, openSections, toggleSection, labelW, colW }: {
  suppliers: SupplierData[]; caps: Capability[]; settings: KostenSettings
  openSections: Record<string, boolean>; toggleSection: (k: string) => void
  labelW: number; colW: number
}) {
  const rows = [
    {
      key: 'anforderungen', label: 'Anforderungen',
      render: (s: SupplierData) => (
        <div className="flex items-center justify-center gap-2">
          {s.koViolations > 0 && (
            <span className="text-[10px] text-red-400 font-bold">{s.koViolations}</span>
          )}
          <CircleScore value={s.reqScore} color={s.koViolations > 0 ? '#ef4444' : '#6366f1'} />
        </div>
      )
    },
    {
      key: 'praesentationen', label: 'Präsentationen',
      render: () => <span className="text-gray-600 text-sm">—</span>
    },
    {
      key: 'experteneinschaetzung', label: 'Experteneinschätzung',
      render: () => <CircleScore value={null} showEmpty />
    },
    {
      key: 'kosten', label: 'Kosten',
      render: (s: SupplierData) => {
        const b = calcBetrieb(s, settings)
        const i = calcImpl(s)
        const a = calcAnpassung(s, settings, caps)
        if (b === null && i === null) return <CircleScore value={null} showEmpty />
        const total = (b ?? 0) + (i ?? 0) + (a ?? 0)
        return <span className="text-sm text-white font-medium">{fmt(total)}</span>
      }
    },
  ]

  return (
    <div>
      {rows.map(row => (
        <div key={row.key} className="border-b border-[#1E2433]">
          <div
            className="flex items-center cursor-pointer hover:bg-[#141720] transition-colors"
            onClick={() => toggleSection(row.key)}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ width: labelW }}>
              {openSections[row.key] ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
              <span className="text-sm font-medium text-gray-300">{row.label}</span>
            </div>
            {suppliers.map(s => (
              <div key={s.psId} className="flex items-center justify-center border-l border-[#1E2433] py-3"
                style={{ width: colW, flexShrink: 0 }}>
                {row.render(s)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Anforderungen Tab ───────────────────────────────────────────────────────
function AnforderungenTab({ suppliers, caps, labelW, colW }: {
  suppliers: SupplierData[]; caps: Capability[]; labelW: number; colW: number
}) {
  return (
    <div>
      {/* Summary row */}
      <SectionHeader label="Anforderungen" labelW={labelW} colW={colW} suppliers={suppliers}
        renderCell={s => (
          <div className="flex items-center justify-center gap-1.5">
            {s.koViolations > 0 && <span className="text-[10px] text-red-400 font-bold">{s.koViolations}</span>}
            <CircleScore value={s.reqScore} color={s.koViolations > 0 ? '#ef4444' : '#6366f1'} />
          </div>
        )} />
      {/* Per capability */}
      {caps.map(cap => (
        <div key={cap.id} className="flex border-b border-[#1E2433] hover:bg-[#141720] transition-colors">
          <div className="px-6 py-3 text-sm text-gray-400" style={{ width: labelW, flexShrink: 0 }}>
            {cap.name}
          </div>
          {suppliers.map(s => {
            const cs = s.capScores[cap.id]
            return (
              <div key={s.psId} className="flex items-center justify-center border-l border-[#1E2433] py-3"
                style={{ width: colW, flexShrink: 0 }}>
                {cs && cs.reqCount > 0 ? (
                  <div className="flex flex-col items-center">
                    <CircleScore value={cs.score} color={cs.koViolations > 0 ? '#ef4444' : '#6366f1'} />
                    {cs.koViolations > 0 && (
                      <span className="text-[10px] text-red-400 mt-0.5">{cs.koViolations} KO</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-600 text-xs">—</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Kosten Tab ──────────────────────────────────────────────────────────────
function KostenTab({ suppliers, caps, settings, openSections, toggleSection, labelW, colW, onOpenSettings }: {
  suppliers: SupplierData[]; caps: Capability[]; settings: KostenSettings
  openSections: Record<string, boolean>; toggleSection: (k: string) => void
  labelW: number; colW: number; onOpenSettings: (p: 'betrieb' | 'anpassung') => void
}) {
  // Total per supplier
  const totals = suppliers.map(s => {
    const b = calcBetrieb(s, settings) ?? 0
    const i = calcImpl(s) ?? 0
    const a = calcAnpassung(s, settings, caps) ?? 0
    return b + i + a
  })

  const betriebRows = [
    { label: 'Einmalige Gebühren', get: (s: SupplierData) => s.financial?.ops_one_time ?? null },
    { label: 'Lizenzen', get: (s: SupplierData) => s.financial ? s.financial.ops_license_per_month * settings.lizenzen * 12 * settings.years : null },
    { label: 'Wartung', get: (s: SupplierData) => s.financial ? s.financial.ops_maintenance_per_month * 12 * settings.years : null },
    { label: 'Andere wiederkehrende Gebühren', get: (s: SupplierData) => s.financial ? s.financial.ops_other_per_month * 12 * settings.years : null },
  ]

  const implRows = [
    { label: 'Projektmanagement', get: (s: SupplierData) => s.financial?.impl_project_mgmt ?? null },
    { label: 'Beratung', get: (s: SupplierData) => s.financial?.impl_consulting ?? null },
    { label: 'Datenmigration', get: (s: SupplierData) => s.financial?.impl_data_migration ?? null },
    { label: 'Schnittstellen', get: (s: SupplierData) => s.financial?.impl_interfaces ?? null },
    { label: 'Schulung', get: (s: SupplierData) => s.financial?.impl_training ?? null },
    { label: 'Sonstige Implementierungskosten', get: (s: SupplierData) => s.financial?.impl_other ?? null },
  ]

  function WarningCell({ s }: { s: SupplierData }) {
    if (!s.financial || !s.financial.submitted) return <AlertTriangle size={12} className="text-amber-500/60" />
    return null
  }

  function CostCell({ value, s }: { value: number | null; s: SupplierData }) {
    if (!s.financial) return <span className="text-gray-600 text-xs">—</span>
    return <span className="text-sm text-gray-300">{fmt(value ?? 0)}</span>
  }

  return (
    <div>
      {/* Total row */}
      <div className="flex border-b border-[#1E2433] bg-[#141720]">
        <div className="px-4 py-3 text-sm font-medium text-gray-300" style={{ width: labelW, flexShrink: 0 }} />
        {suppliers.map((s, i) => (
          <div key={s.psId} className="flex flex-col items-center justify-center border-l border-[#1E2433] py-3"
            style={{ width: colW, flexShrink: 0 }}>
            <span className="text-sm font-semibold text-white">{fmt(totals[i])}</span>
          </div>
        ))}
      </div>

      {/* Betriebskosten */}
      <CollapsibleSection
        label="Gesamte Betriebskosten" labelW={labelW} colW={colW}
        isOpen={openSections.betrieb} toggle={() => toggleSection('betrieb')}
        settingsIcon={<button onClick={e => { e.stopPropagation(); onOpenSettings('betrieb') }}
          className="text-gray-500 hover:text-brand-400 transition-colors"><Settings2 size={13} /></button>}
        suppliers={suppliers}
        renderTotal={s => (
          <div className="flex flex-col items-center gap-0.5">
            <WarningCell s={s} />
            <span className="text-sm text-gray-300">{s.financial ? fmt(calcBetrieb(s, settings) ?? 0) : '—'}</span>
          </div>
        )}
      >
        {betriebRows.map(row => (
          <SubRow key={row.label} label={row.label} labelW={labelW} colW={colW} suppliers={suppliers}
            renderCell={s => <CostCell value={row.get(s)} s={s} />} />
        ))}
      </CollapsibleSection>

      {/* Implementierungskosten */}
      <CollapsibleSection
        label="Gesamte Implementierungskosten" labelW={labelW} colW={colW}
        isOpen={openSections.impl} toggle={() => toggleSection('impl')}
        suppliers={suppliers}
        renderTotal={s => (
          <div className="flex flex-col items-center gap-0.5">
            <WarningCell s={s} />
            <span className="text-sm text-gray-300">{s.financial ? fmt(calcImpl(s) ?? 0) : '—'}</span>
          </div>
        )}
      >
        {implRows.map(row => (
          <SubRow key={row.label} label={row.label} labelW={labelW} colW={colW} suppliers={suppliers}
            renderCell={s => <CostCell value={row.get(s)} s={s} />} />
        ))}
      </CollapsibleSection>

      {/* Anpassungskosten */}
      <CollapsibleSection
        label="Gesamte Anpassungskosten" labelW={labelW} colW={colW}
        isOpen={openSections.anpassung} toggle={() => toggleSection('anpassung')}
        settingsIcon={<button onClick={e => { e.stopPropagation(); onOpenSettings('anpassung') }}
          className="text-gray-500 hover:text-brand-400 transition-colors"><Settings2 size={13} /></button>}
        suppliers={suppliers}
        renderTotal={s => (
          <div className="flex flex-col items-center gap-0.5">
            <WarningCell s={s} />
            <span className="text-sm text-gray-300">{s.financial ? fmt(calcAnpassung(s, settings, caps) ?? 0) : '—'}</span>
          </div>
        )}
      >
        {caps.map(cap => (
          <SubRow key={cap.id} label={cap.name} labelW={labelW} colW={colW} suppliers={suppliers}
            renderCell={s => (
              <CostCell value={s.capScores[cap.id]?.costAmount ?? 0} s={s} />
            )} />
        ))}
      </CollapsibleSection>
    </div>
  )
}

// ─── Placeholder Tab ─────────────────────────────────────────────────────────
function PlaceholderTab({ label, labelW, colW, count }: { label: string; labelW: number; colW: number; count: number }) {
  return (
    <div className="flex border-b border-[#1E2433]">
      <div className="px-4 py-4 text-sm text-gray-500" style={{ width: labelW, flexShrink: 0 }}>{label}</div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-center border-l border-[#1E2433] py-4"
          style={{ width: colW, flexShrink: 0 }}>
          <span className="text-gray-600 text-sm">—</span>
        </div>
      ))}
    </div>
  )
}

// ─── Shared components ───────────────────────────────────────────────────────
function SectionHeader({ label, labelW, colW, suppliers, renderCell, settingsIcon }: {
  label: string; labelW: number; colW: number; suppliers: SupplierData[]
  renderCell: (s: SupplierData) => React.ReactNode
  settingsIcon?: React.ReactNode
}) {
  return (
    <div className="flex border-b border-[#1E2433] bg-[#141720]">
      <div className="flex items-center gap-2 px-4 py-3" style={{ width: labelW, flexShrink: 0 }}>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {settingsIcon}
      </div>
      {suppliers.map(s => (
        <div key={s.psId} className="flex items-center justify-center border-l border-[#1E2433] py-3"
          style={{ width: colW, flexShrink: 0 }}>
          {renderCell(s)}
        </div>
      ))}
    </div>
  )
}

function CollapsibleSection({ label, labelW, colW, isOpen, toggle, settingsIcon, suppliers, renderTotal, children }: {
  label: string; labelW: number; colW: number
  isOpen: boolean; toggle: () => void
  settingsIcon?: React.ReactNode
  suppliers: SupplierData[]
  renderTotal: (s: SupplierData) => React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-[#1E2433]">
      <div className="flex cursor-pointer hover:bg-[#141720] transition-colors" onClick={toggle}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ width: labelW, flexShrink: 0 }}>
          {isOpen ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
          <span className="text-sm font-semibold text-gray-200">{label}</span>
          {settingsIcon}
        </div>
        {suppliers.map(s => (
          <div key={s.psId} className="flex items-center justify-center border-l border-[#1E2433] py-3"
            style={{ width: colW, flexShrink: 0 }}>
            {renderTotal(s)}
          </div>
        ))}
      </div>
      {isOpen && children}
    </div>
  )
}

function SubRow({ label, labelW, colW, suppliers, renderCell }: {
  label: string; labelW: number; colW: number
  suppliers: SupplierData[]; renderCell: (s: SupplierData) => React.ReactNode
}) {
  return (
    <div className="flex border-t border-[#1E2433] hover:bg-[#141720] transition-colors">
      <div className="px-8 py-2.5 text-xs text-gray-500" style={{ width: labelW, flexShrink: 0 }}>{label}</div>
      {suppliers.map(s => (
        <div key={s.psId} className="flex items-center justify-center border-l border-[#1E2433] py-2.5"
          style={{ width: colW, flexShrink: 0 }}>
          {renderCell(s)}
        </div>
      ))}
    </div>
  )
}

function SettingsPopup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute right-6 bottom-6 z-30 bg-[#141720] border border-[#2A3347] rounded-xl shadow-2xl w-80 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={15} /></button>
      </div>
      {children}
    </div>
  )
}

function SliderField({ label, min, max, step = 1, value, onChange }: {
  label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-brand-500"
        />
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || min)}
          className="w-16 bg-[#0F1117] border border-[#2A3040] text-white rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>{min}</span>
        {max > 10 && <span>{Math.round(max / 2)}</span>}
        <span>{max}</span>
      </div>
    </div>
  )
}
