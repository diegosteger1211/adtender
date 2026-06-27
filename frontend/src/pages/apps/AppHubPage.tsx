import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, StickyNote, FileText, Zap, Users, Library,
  Brain, Database, AlertTriangle, FileSignature, Globe, Sliders, Plug,
  Lock,
} from 'lucide-react'

type AppMode = 'native' | 'embedded' | 'template' | 'external-link' | 'planned'

type AppDef = {
  id: string
  name: string
  description: string
  category: string
  mode: AppMode
  icon: React.ComponentType<{ className?: string }>
  path?: string
  badge?: string
}

const APPS: AppDef[] = [
  // Native
  { id: 'fit-gap', name: 'Fit-Gap-Analyse', description: 'Anforderungen mit Anbieter-Antworten visuell abgleichen', category: 'Auswertung', mode: 'native', icon: BarChart2, path: '/apps/fit-gap' },
  { id: 'notes', name: 'Notizen', description: 'Schnelle Notizen und Memos zu Projekten', category: 'Produktivität', mode: 'native', icon: StickyNote, path: '/apps/notes' },
  { id: 'req-templates', name: 'Anforderungsvorlagen', description: 'Vorgefertigte Anforderungssets importieren', category: 'Vorlagen', mode: 'native', icon: FileText, path: '/apps/req-templates' },
  { id: 'scenario-gen', name: 'Szenario-Generator', description: 'Use Cases aus Vorlagen generieren und in Projekte übernehmen', category: 'Produktivität', mode: 'native', icon: Zap, path: '/apps/scenario-gen' },
  { id: 'prequalification', name: 'Anbieter-Vorqualifizierung', description: 'Anbieter anhand standardisierter Kriterien vorqualifizieren', category: 'Anbieter', mode: 'native', icon: Users, path: '/apps/prequalification' },
  // Template
  { id: 'template-store', name: 'Template Store', description: 'Standardvorlagen für Anforderungen, Checklisten, Bewertungsmodelle und mehr', category: 'Bibliothek', mode: 'template', icon: Library, path: '/apps/template-store' },
  // Planned
  { id: 'ai-req', name: 'KI-Anforderungsassistent', description: 'KI-gestützte Formulierung und Prüfung von Anforderungen', category: 'KI', mode: 'planned', icon: Brain },
  { id: 'benchmarks', name: 'Benchmark-Datenbank', description: 'Branchenbenchmarks für Bewertungsprozesse', category: 'Auswertung', mode: 'planned', icon: Database },
  { id: 'risk-matrix', name: 'Risikoanalyse', description: 'Risikobewertung und -matrix für Anbieterauswahl', category: 'Auswertung', mode: 'planned', icon: AlertTriangle },
  { id: 'contract-builder', name: 'Vertrags-Builder', description: 'Vertragsvorlagen und Klauselbausteine', category: 'Vertrag', mode: 'planned', icon: FileSignature },
  { id: 'market-intel', name: 'Marktintelligenz', description: 'Anbieter-Marktdaten und Benchmarks', category: 'Anbieter', mode: 'planned', icon: Globe },
  { id: 'scoring-engine', name: 'Bewertungsmotor', description: 'Gewichtete Mehrkriterien-Entscheidungsanalyse', category: 'Auswertung', mode: 'planned', icon: Sliders },
  { id: 'integration-hub', name: 'Integration Hub', description: 'Anbindung an ERP, CRM und andere Systeme', category: 'Plattform', mode: 'planned', icon: Plug },
]

const CATEGORIES = ['Alle', 'Auswertung', 'Vorlagen', 'Produktivität', 'Anbieter', 'KI', 'Bibliothek', 'Plattform', 'Vertrag']

const MODE_BADGE: Record<AppMode, { label: string; className: string }> = {
  native: { label: 'Verfügbar', className: 'bg-emerald-500/20 text-emerald-400' },
  template: { label: 'Vorlage', className: 'bg-blue-500/20 text-blue-400' },
  embedded: { label: 'Eingebettet', className: 'bg-violet-500/20 text-violet-400' },
  'external-link': { label: 'Extern', className: 'bg-gray-500/20 text-gray-400' },
  planned: { label: 'Geplant', className: 'bg-gray-500/20 text-gray-400' },
}

const ICON_BG: Record<string, string> = {
  Auswertung: 'bg-blue-500/20 text-blue-400',
  Vorlagen: 'bg-amber-500/20 text-amber-400',
  Produktivität: 'bg-emerald-500/20 text-emerald-400',
  Anbieter: 'bg-violet-500/20 text-violet-400',
  KI: 'bg-brand-500/20 text-brand-400',
  Bibliothek: 'bg-cyan-500/20 text-cyan-400',
  Plattform: 'bg-orange-500/20 text-orange-400',
  Vertrag: 'bg-rose-500/20 text-rose-400',
}

export default function AppHubPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Alle')

  const filtered = activeCategory === 'Alle' ? APPS : APPS.filter(a => a.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">App-Hub</h1>
        <p className="text-gray-400 mt-1">Erweiterungen und Tools für Ihre Auswahlprozesse</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-brand-500 text-white'
                : 'bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(app => {
          const Icon = app.icon
          const isPlanned = app.mode === 'planned'
          const modeBadge = MODE_BADGE[app.mode]
          const iconBg = ICON_BG[app.category] || 'bg-gray-500/20 text-gray-400'

          return (
            <div
              key={app.id}
              onClick={() => !isPlanned && app.path && navigate(app.path)}
              className={`bg-[#141720] border border-[#1E2433] rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                isPlanned
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:border-brand-500/50 hover:bg-[#1a1f30]'
              }`}
            >
              {/* Icon + mode badge */}
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {isPlanned && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${modeBadge.className}`}>
                    {modeBadge.label}
                  </span>
                </div>
              </div>

              {/* Name + description */}
              <div>
                <h3 className="text-white font-semibold">{app.name}</h3>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{app.description}</p>
              </div>

              {/* Category badge */}
              <div className="mt-auto">
                <span className="text-xs text-gray-500 bg-[#0F1117] border border-[#2A3040] px-2 py-0.5 rounded-full">
                  {app.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
