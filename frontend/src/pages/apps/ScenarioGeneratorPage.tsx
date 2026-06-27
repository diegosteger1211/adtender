import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CheckSquare, Square } from 'lucide-react'
import { api } from '../../lib/api'

type ScenarioTemplate = { title: string; description: string }
type EditableScenario = ScenarioTemplate & { selected: boolean }
type Project = { id: string; title: string }

const SCENARIO_TEMPLATES: Record<string, ScenarioTemplate[]> = {
  'Warehousing': [
    { title: 'Wareneingang', description: 'Anlieferung einer Bestellung, Qualitätsprüfung, Einlagerung auf optimalen Lagerplatz.' },
    { title: 'Kommissionierung', description: 'Pickliste generieren, Artikel picken, Verpacken und Versandlabel erstellen.' },
    { title: 'Inventur', description: 'Zykluszählung eines Lagerbereichs, Differenzen erfassen und korrigieren.' },
  ],
  'Manufacturing': [
    { title: 'Fertigungsauftrag anlegen', description: 'Auftrag aus ERP-System empfangen, Materialverfügbarkeit prüfen, Produktion starten.' },
    { title: 'Qualitätsprüfung', description: 'Inline-Prüfung während der Produktion, Prüfergebnisse erfassen, Freigabe oder Sperrung.' },
    { title: 'Maschinenstörung', description: 'Störungsmeldung erfassen, Wartungsauftrag erstellen, Downtime dokumentieren.' },
  ],
  'Finance': [
    { title: 'Rechnungsverarbeitung', description: 'Eingangsrechnung erfassen, mit Bestellung abgleichen, Zahlung freigeben.' },
    { title: 'Monatsabschluss', description: 'Buchungen abschließen, Abgrenzungen vornehmen, GuV und Bilanz generieren.' },
  ],
  'HR': [
    { title: 'Mitarbeiter anlegen', description: 'Stammdaten erfassen, Berechtigungen zuweisen, Onboarding-Checkliste starten.' },
    { title: 'Urlaubsantrag', description: 'Antrag stellen, Vorgesetztengenehmigung, automatische Zeitkontoverwaltung.' },
  ],
  'Sales': [
    { title: 'Lead qualifizieren', description: 'Neuer Lead aus Web-Formular, Scoring, Zuweisung an Vertriebsmitarbeiter.' },
    { title: 'Angebot erstellen', description: 'Produkte konfigurieren, Preise kalkulieren, Angebot versenden und verfolgen.' },
  ],
}

const PROCESS_AREAS = Object.keys(SCENARIO_TEMPLATES)

export default function ScenarioGeneratorPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [area, setArea] = useState(PROCESS_AREAS[0])
  const [scenarios, setScenarios] = useState<EditableScenario[]>([])
  const [adding, setAdding] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects').then(r => setProjects(r.projects)).catch(() => {})
  }, [])

  useEffect(() => {
    setScenarios((SCENARIO_TEMPLATES[area] ?? []).map(s => ({ ...s, selected: true })))
    setDone(false)
  }, [area])

  const toggleSelect = (i: number) =>
    setScenarios(prev => prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s))

  const updateField = (i: number, field: 'title' | 'description', value: string) =>
    setScenarios(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const addToProject = async () => {
    if (!projectId) return
    const selected = scenarios.filter(s => s.selected)
    if (selected.length === 0) return
    setAdding(true)
    for (const s of selected) {
      await api.post(`/api/projects/${projectId}/scenarios`, { title: s.title, description: s.description }).catch(() => {})
    }
    setAdding(false)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  const selectedCount = scenarios.filter(s => s.selected).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Szenario-Generator</h1>
          <p className="text-gray-400 text-sm">Use Cases aus Vorlagen generieren und in Projekte übernehmen</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ziel-Projekt</label>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">— Projekt wählen —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prozessbereich</label>
          <div className="flex flex-wrap gap-2">
            {PROCESS_AREAS.map(a => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  area === a ? 'bg-brand-500 text-white' : 'bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenarios list */}
      <div className="space-y-3">
        {scenarios.map((s, i) => (
          <div key={i} className="bg-[#141720] border border-[#1E2433] rounded-xl p-4 flex gap-3">
            <button onClick={() => toggleSelect(i)} className="shrink-0 mt-0.5 text-gray-400 hover:text-brand-400 transition-colors">
              {s.selected ? <CheckSquare className="w-5 h-5 text-brand-400" /> : <Square className="w-5 h-5" />}
            </button>
            <div className="flex-1 space-y-2">
              <input
                value={s.title}
                onChange={e => updateField(i, 'title', e.target.value)}
                className="w-full bg-transparent text-white font-medium focus:outline-none border-b border-transparent focus:border-[#2A3040]"
              />
              <textarea
                value={s.description}
                onChange={e => updateField(i, 'description', e.target.value)}
                rows={2}
                className="w-full bg-transparent text-gray-400 text-sm focus:outline-none resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={addToProject}
          disabled={!projectId || selectedCount === 0 || adding}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {done ? '✓ Hinzugefügt' : adding ? 'Füge hinzu…' : `${selectedCount} Szenarien hinzufügen`}
        </button>
        {!projectId && <p className="text-gray-500 text-sm">Bitte Projekt auswählen</p>}
      </div>
    </div>
  )
}
