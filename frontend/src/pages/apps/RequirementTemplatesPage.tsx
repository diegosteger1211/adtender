import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { api } from '../../lib/api'

type CapabilityDef = { name: string; requirements: string[] }
type TemplateDef = {
  id: string; name: string; category: string; description: string
  capabilities: CapabilityDef[]
}

const BUILTIN_TEMPLATES: TemplateDef[] = [
  {
    id: 'mes-core', name: 'MES – Kernfunktionen', category: 'MES',
    description: 'Grundlegende Anforderungen an Manufacturing Execution Systems',
    capabilities: [
      { name: 'Produktionsplanung & -steuerung', requirements: ['Fertigungsaufträge anlegen und verwalten', 'Kapazitätsplanung und Ressourcenzuweisung', 'Echtzeit-Maschinendatenfassung (MDE)', 'Rückmeldungen und Betriebsdatenerfassung (BDE)'] },
      { name: 'Qualitätsmanagement', requirements: ['Qualitätsprüfpläne definieren', 'SPC-Auswertungen (Statistische Prozesskontrolle)', 'Prüfmittelverwaltung und Kalibrierung'] },
      { name: 'Rückverfolgbarkeit', requirements: ['Chargenverfolgung und Serialisierung', 'Genealogie-Funktion (Vorwärts/Rückwärts)', 'GS1-/EPCIS-Konformität'] },
    ],
  },
  {
    id: 'erp-finance', name: 'ERP – Finanzwesen', category: 'ERP',
    description: 'Finanzbuchhaltung und Controlling Anforderungen',
    capabilities: [
      { name: 'Finanzbuchhaltung', requirements: ['Kreditorenbuchhaltung', 'Debitorenbuchhaltung', 'Hauptbuch und Kontenplan', 'Automatische Kontenabstimmung'] },
      { name: 'Controlling', requirements: ['Kostenstellenrechnung', 'Profit-Center-Rechnung', 'Budgetierung und Forecasting', 'IFRS/HGB-Konformität'] },
    ],
  },
  {
    id: 'wms-core', name: 'WMS – Lagerlogistik', category: 'WMS',
    description: 'Warehouse Management System Kernanforderungen',
    capabilities: [
      { name: 'Lagerverwaltung', requirements: ['Lagerplatzverwaltung und Slotting', 'Einlagerung und Auslagerung', 'Inventur und Zykluszählungen', 'Gefahrguthandling'] },
      { name: 'Versand & Empfang', requirements: ['Wareneingang und Qualitätsprüfung', 'Verpackungsmanagement', 'Carrier-Integration und Track & Trace'] },
    ],
  },
  {
    id: 'crm-core', name: 'CRM – Vertrieb & Marketing', category: 'CRM',
    description: 'Customer Relationship Management Grundfunktionen',
    capabilities: [
      { name: 'Kontakt- & Leadmanagement', requirements: ['360°-Kundensicht', 'Lead-Scoring und Qualifizierung', 'Aktivitätenverfolgung (E-Mail, Telefon, Meeting)'] },
      { name: 'Vertrieb', requirements: ['Pipeline-Management', 'Angebotserstellung und -verfolgung', 'Umsatzprognose und Reporting'] },
    ],
  },
  {
    id: 'hcm-core', name: 'HCM – Personalwesen', category: 'HCM',
    description: 'Human Capital Management Anforderungen',
    capabilities: [
      { name: 'Personalverwaltung', requirements: ['Stammdatenpflege und Organigramm', 'Zeiterfassung und Abwesenheitsmanagement', 'Lohn- und Gehaltsabrechnung'] },
      { name: 'Recruiting & Entwicklung', requirements: ['Bewerbermanagementsystem (ATS)', 'Onboarding-Workflows', 'Leistungsbeurteilung und Zielvereinbarungen'] },
    ],
  },
  {
    id: 'non-functional', name: 'Nicht-funktionale Anforderungen', category: 'Übergreifend',
    description: 'Allgemeine technische und betriebliche Anforderungen',
    capabilities: [
      { name: 'Sicherheit & Compliance', requirements: ['DSGVO-Konformität und Datenschutz', 'Rollenbasierte Zugriffskontrolle (RBAC)', 'Audit-Trail und Protokollierung', 'SSO / SAML 2.0 Integration'] },
      { name: 'Technische Architektur', requirements: ['Cloud-Deployment (SaaS/Private Cloud)', 'API-Schnittstellen (REST/GraphQL)', 'Hochverfügbarkeit und Disaster Recovery', 'Mobile-Unterstützung (iOS/Android)'] },
    ],
  },
]

type Project = { id: string; title: string }

export default function RequirementTemplatesPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<TemplateDef | null>(BUILTIN_TEMPLATES[0])
  const [projects, setProjects] = useState<Project[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importProjectId, setImportProjectId] = useState('')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects').then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  const totalReqs = (t: TemplateDef) => t.capabilities.reduce((sum, c) => sum + c.requirements.length, 0)

  const handleImport = async () => {
    if (!importProjectId || !selected) return
    setImporting(true)
    const body = selected.capabilities.flatMap(cap =>
      cap.requirements.map(req => ({ capability: cap.name, requirement: req, priority: 'B', weight: 1 }))
    )
    await api.post(`/api/projects/${importProjectId}/requirements/import`, body).catch(() => {})
    setImporting(false)
    setImportDone(true)
    setTimeout(() => { setShowImportModal(false); setImportDone(false) }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Anforderungsvorlagen</h1>
          <p className="text-gray-400 text-sm">Vorgefertigte Anforderungssets importieren</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[400px]">
        {/* Left panel */}
        <div className="w-64 shrink-0 overflow-y-auto space-y-2">
          {BUILTIN_TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selected?.id === t.id
                  ? 'border-brand-500/50 bg-[#1a1f30]'
                  : 'border-[#1E2433] bg-[#141720] hover:border-[#2A3040]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 bg-[#0F1117] border border-[#2A3040] px-2 py-0.5 rounded-full">{t.category}</span>
                <span className="text-xs text-gray-500">{totalReqs(t)} Req.</span>
              </div>
              <p className="text-white text-sm font-medium mt-1">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {selected ? (
          <div className="flex-1 bg-[#141720] border border-[#1E2433] rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{selected.description}</p>
              </div>
              <button
                onClick={() => setShowImportModal(true)}
                className="shrink-0 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium"
              >
                In Projekt importieren
              </button>
            </div>

            {selected.capabilities.map((cap, i) => (
              <div key={i}>
                <h3 className="text-brand-400 font-semibold text-sm mb-2">{cap.name}</h3>
                <ul className="space-y-1">
                  {cap.requirements.map((req, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-gray-600 shrink-0 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 bg-[#141720] border border-[#1E2433] rounded-2xl flex items-center justify-center text-gray-500">
            Vorlage auswählen
          </div>
        )}
      </div>

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">In Projekt importieren</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Vorlage <strong className="text-white">{selected?.name}</strong> ({totalReqs(selected!)} Anforderungen) importieren in:
            </p>
            <select
              value={importProjectId}
              onChange={e => setImportProjectId(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="">— Projekt wählen —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button
              onClick={handleImport}
              disabled={!importProjectId || importing}
              className="w-full py-2 rounded-lg bg-brand-500 text-white font-medium text-sm disabled:opacity-50 hover:bg-brand-600 transition-colors"
            >
              {importDone ? '✓ Importiert' : importing ? 'Importiere…' : 'Importieren'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
