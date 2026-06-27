import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Eye, Copy } from 'lucide-react'

// Reuse the builtin templates definition (inline here to avoid cross-module import complexity)
type CapabilityDef = { name: string; requirements: string[] }
type TemplateDef = { id: string; name: string; category: string; description: string; capabilities: CapabilityDef[] }

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

const SCENARIO_AREAS = ['Warehousing', 'Manufacturing', 'Finance', 'HR', 'Sales']
const SCENARIO_COUNTS: Record<string, number> = { Warehousing: 3, Manufacturing: 3, Finance: 2, HR: 2, Sales: 2 }

const CHECKLISTS = [
  { name: 'Anbieter-Erstgespräch Checkliste', items: 8, description: 'Vorbereitung und Durchführung des ersten Anbietertermins.' },
  { name: 'Demo-Vorbereitung Checkliste', items: 10, description: 'Anforderungen an Systemdemonstrationen definieren und koordinieren.' },
  { name: 'Referenzbesuch Checkliste', items: 12, description: 'Strukturierte Gesprächsführung bei Referenzkunden.' },
  { name: 'Vertragsverhandlung Checkliste', items: 15, description: 'Schlüsselpunkte für erfolgreiche Vertragsverhandlungen.' },
]

const SCORING_MODELS = [
  { name: 'Standard-Bewertungsmodell', description: 'Ausgewogene Gewichtung der Kernkategorien.', criteria: 'Funktion 40%, Kosten 30%, Referenz 20%, Support 10%' },
  { name: 'Technologie-Fokus', description: 'Schwerpunkt auf technische Architektur und Integration.', criteria: 'Architektur 35%, Integration 25%, Security 20%, Support 20%' },
  { name: 'Kosten-Fokus', description: 'TCO-orientiertes Bewertungsmodell für budgetgetriebene Auswahlprozesse.', criteria: 'Kosten 50%, Funktion 30%, Referenz 20%' },
]

const EMAIL_TEMPLATES = [
  { name: 'Einladung zur Ausschreibung', description: 'Formelle Einladung zur Teilnahme an einem Auswahlverfahren.' },
  { name: 'Anforderung weiterer Unterlagen', description: 'Nachforderung fehlender Dokumente oder Informationen.' },
  { name: 'Ablehnung nach erster Prüfung', description: 'Freundliche Absage nach initialer Eignungsprüfung.' },
  { name: 'Einladung zur Demo-Präsentation', description: 'Einladung zur Systemvorführung im Rahmen des Evaluierungsprozesses.' },
  { name: 'Absage nach Evaluierung', description: 'Abschlussbenachrichtigung nach abgeschlossener Anbieterauswahl.' },
]

type PreviewItem = { title: string; content: string }

const TABS = ['Anforderungsvorlagen', 'Szenarien', 'Checklisten', 'Scoring-Modelle', 'E-Mail-Vorlagen'] as const
type Tab = typeof TABS[number]

export default function TemplateStorePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('Anforderungsvorlagen')
  const [preview, setPreview] = useState<PreviewItem | null>(null)
  const [copied, setCopied] = useState(false)

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Template Store</h1>
          <p className="text-gray-400 text-sm">Standardvorlagen für alle Phasen des Auswahlprozesses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1E2433] pb-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Anforderungsvorlagen */}
      {activeTab === 'Anforderungsvorlagen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILTIN_TEMPLATES.map(t => {
            const reqCount = t.capabilities.reduce((sum, c) => sum + c.requirements.length, 0)
            return (
              <div key={t.id} className="bg-[#141720] border border-[#1E2433] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-[#0F1117] border border-[#2A3040] text-gray-400 px-2 py-0.5 rounded-full">{t.category}</span>
                  <span className="text-xs text-gray-500">{reqCount} Anforderungen</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{t.description}</p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setPreview({ title: t.name, content: t.capabilities.map(c => `${c.name}:\n${c.requirements.map(r => `  • ${r}`).join('\n')}`).join('\n\n') })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F1117] border border-[#2A3040] text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Vorschau
                  </button>
                  <button
                    onClick={() => navigate('/apps/req-templates')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors"
                  >
                    Verwenden
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Szenarien */}
      {activeTab === 'Szenarien' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIO_AREAS.map(area => (
            <div key={area} className="bg-[#141720] border border-[#1E2433] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#0F1117] border border-[#2A3040] text-gray-400 px-2 py-0.5 rounded-full">Szenarien</span>
                <span className="text-xs text-gray-500">{SCENARIO_COUNTS[area]} Szenarien</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{area}</h3>
                <p className="text-gray-400 text-sm mt-1">Standard-Testszenarien für den Bereich {area}.</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => navigate('/apps/scenario-gen')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors"
                >
                  Verwenden
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklisten */}
      {activeTab === 'Checklisten' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHECKLISTS.map(c => (
            <div key={c.name} className="bg-[#141720] border border-[#1E2433] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#0F1117] border border-[#2A3040] text-gray-400 px-2 py-0.5 rounded-full">Checkliste</span>
                <span className="text-xs text-gray-500">{c.items} Punkte</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{c.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{c.description}</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setPreview({ title: c.name, content: `${c.description}\n\n(${c.items} Checklistenpunkte — vollständige Liste in der finalen Version verfügbar)` })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F1117] border border-[#2A3040] text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Vorschau
                </button>
                <button
                  onClick={() => copyText(c.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Kopiert' : 'Verwenden'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scoring-Modelle */}
      {activeTab === 'Scoring-Modelle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCORING_MODELS.map(m => (
            <div key={m.name} className="bg-[#141720] border border-[#1E2433] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs bg-[#0F1117] border border-[#2A3040] text-gray-400 px-2 py-0.5 rounded-full w-fit">Scoring-Modell</span>
              <div>
                <h3 className="text-white font-semibold">{m.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{m.description}</p>
                <p className="text-gray-500 text-xs mt-2 font-mono">{m.criteria}</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setPreview({ title: m.name, content: `${m.description}\n\nGewichtung:\n${m.criteria}` })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F1117] border border-[#2A3040] text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Vorschau
                </button>
                <button
                  onClick={() => copyText(`${m.name}: ${m.criteria}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Kopiert' : 'Verwenden'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* E-Mail-Vorlagen */}
      {activeTab === 'E-Mail-Vorlagen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMAIL_TEMPLATES.map(e => (
            <div key={e.name} className="bg-[#141720] border border-[#1E2433] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs bg-[#0F1117] border border-[#2A3040] text-gray-400 px-2 py-0.5 rounded-full w-fit">E-Mail</span>
              <div>
                <h3 className="text-white font-semibold">{e.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{e.description}</p>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setPreview({ title: e.name, content: `Betreff: ${e.name}\n\nSehr geehrte Damen und Herren,\n\n${e.description}\n\n[Vollständiger Vorlagentext in der finalen Version verfügbar]\n\nMit freundlichen Grüßen` })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0F1117] border border-[#2A3040] text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Vorschau
                </button>
                <button
                  onClick={() => copyText(`Betreff: ${e.name}\n\nSehr geehrte Damen und Herren,\n\n${e.description}\n\nMit freundlichen Grüßen`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 hover:bg-brand-500/30 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Kopiert' : 'Kopieren'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {preview.content}
            </pre>
            <button
              onClick={() => copyText(preview.content)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm hover:bg-brand-500/30 transition-colors"
            >
              <Copy className="w-4 h-4" /> {copied ? 'Kopiert' : 'In Zwischenablage kopieren'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
