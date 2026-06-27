import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../../lib/api'

type Supplier = { id: string; company_name: string }
type CriterionScore = { id: string; score: number; note: string }
type Evaluation = {
  id: string
  company_name: string
  total_score: number
  recommendation: string
  evaluated_at: string
}

const CRITERIA = [
  { id: 'financial', name: 'Finanzielle Stabilität', description: 'Bonität, Umsatz, Eigenkapitalquote', weight: 20 },
  { id: 'references', name: 'Referenzen & Erfahrung', description: 'Anzahl und Qualität vergleichbarer Projekte', weight: 25 },
  { id: 'certifications', name: 'Zertifizierungen', description: 'ISO 9001, ISO 27001, branchenspezifische Zertifikate', weight: 15 },
  { id: 'team', name: 'Team & Ressourcen', description: 'Beraterkapazitäten, Implementierungsteam', weight: 20 },
  { id: 'support', name: 'Support & Wartung', description: 'SLA-Angebote, Support-Modell, Reaktionszeiten', weight: 10 },
  { id: 'roadmap', name: 'Produkt-Roadmap', description: 'Entwicklungsperspektive und Innovationsfähigkeit', weight: 10 },
]

const defaultScores = (): CriterionScore[] =>
  CRITERIA.map(c => ({ id: c.id, score: 3, note: '' }))

const RECOMMENDATION_CONFIG = {
  qualified: { label: 'Qualifiziert', className: 'bg-emerald-500/20 text-emerald-400' },
  conditional: { label: 'Bedingt qualifiziert', className: 'bg-yellow-500/20 text-yellow-400' },
  disqualified: { label: 'Nicht qualifiziert', className: 'bg-red-500/20 text-red-400' },
}

function getRecommendation(total: number): 'qualified' | 'conditional' | 'disqualified' {
  if (total >= 70) return 'qualified'
  if (total >= 50) return 'conditional'
  return 'disqualified'
}

function calcTotal(scores: CriterionScore[]): number {
  let total = 0
  for (const s of scores) {
    const crit = CRITERIA.find(c => c.id === s.id)
    if (!crit) continue
    // score 1-5, weight in %, weighted contribution = (score/5 * weight)
    total += (s.score / 5) * crit.weight
  }
  return Math.round(total)
}

function sliderColor(score: number) {
  if (score <= 2) return 'text-red-400'
  if (score === 3) return 'text-yellow-400'
  return 'text-emerald-400'
}

export default function PreQualPage() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [scores, setScores] = useState<CriterionScore[]>(defaultScores())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<{ suppliers: Supplier[] }>('/api/apps/prequalifications/suppliers').then(r => setSuppliers(r.suppliers)).catch(() => {})
    loadEvaluations()
  }, [])

  const loadEvaluations = () => {
    api.get<{ prequalifications: Evaluation[] }>('/api/apps/prequalifications').then(r => setEvaluations(r.prequalifications)).catch(() => {})
  }

  const updateScore = (id: string, score: number) =>
    setScores(prev => prev.map(s => s.id === id ? { ...s, score } : s))

  const updateNote = (id: string, note: string) =>
    setScores(prev => prev.map(s => s.id === id ? { ...s, note } : s))

  const total = calcTotal(scores)
  const recommendation = getRecommendation(total)

  const handleSave = async () => {
    if (!supplierId) return
    setSaving(true)
    const payload = {
      supplier_id: supplierId,
      scores: scores.map(s => ({
        criterion: s.id,
        weight: CRITERIA.find(c => c.id === s.id)?.weight ?? 0,
        score: s.score,
        note: s.note,
      })),
      total_score: total,
      recommendation,
      notes,
    }
    await api.post('/api/apps/prequalifications', payload).catch(() => {})
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadEvaluations()
    setSupplierId('')
    setScores(defaultScores())
    setNotes('')
  }

  const recConfig = RECOMMENDATION_CONFIG[recommendation]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/apps')} className="p-2 rounded-lg bg-[#141720] border border-[#1E2433] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Anbieter-Vorqualifizierung</h1>
          <p className="text-gray-400 text-sm">Anbieter anhand standardisierter Kriterien bewerten</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: past evaluations */}
        <div className="w-64 shrink-0 space-y-3">
          <h3 className="text-white font-semibold text-sm">Bisherige Bewertungen</h3>
          {evaluations.length === 0 && <p className="text-gray-500 text-sm">Noch keine Bewertungen</p>}
          {evaluations.map(ev => {
            const rec = RECOMMENDATION_CONFIG[ev.recommendation as keyof typeof RECOMMENDATION_CONFIG]
            return (
              <div key={ev.id} className="bg-[#141720] border border-[#1E2433] rounded-xl p-3 space-y-1">
                <p className="text-white text-sm font-medium">{ev.company_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{Math.round(ev.total_score)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${rec?.className ?? 'bg-gray-500/20 text-gray-400'}`}>
                    {rec?.label ?? ev.recommendation}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {new Date(ev.evaluated_at).toLocaleDateString('de-DE')}
                </p>
              </div>
            )
          })}
        </div>

        {/* Right: evaluation form */}
        <div className="flex-1 bg-[#141720] border border-[#1E2433] rounded-2xl p-5 space-y-5">
          {/* Supplier selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Anbieter</label>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 w-full max-w-sm"
            >
              <option value="">— Anbieter wählen —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
            </select>
          </div>

          {/* Criteria */}
          <div className="space-y-4">
            {CRITERIA.map(crit => {
              const s = scores.find(sc => sc.id === crit.id)!
              return (
                <div key={crit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white text-sm font-medium">{crit.name}</span>
                      <span className="text-gray-500 text-xs ml-2">({crit.weight}%)</span>
                    </div>
                    <span className={`text-sm font-bold ${sliderColor(s.score)}`}>{s.score}/5</span>
                  </div>
                  <p className="text-gray-500 text-xs">{crit.description}</p>
                  <input
                    type="range"
                    min={1} max={5} step={1}
                    value={s.score}
                    onChange={e => updateScore(crit.id, Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <textarea
                    value={s.note}
                    onChange={e => updateNote(crit.id, e.target.value)}
                    placeholder="Anmerkungen…"
                    rows={1}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
              )
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Allgemeine Anmerkungen</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#0F1117] border border-[#2A3040] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Total score + recommendation */}
          <div className="flex items-center gap-4 pt-2 border-t border-[#1E2433]">
            <div>
              <p className="text-gray-400 text-xs">Gesamtpunktzahl</p>
              <p className="text-white text-3xl font-bold">{total}<span className="text-gray-500 text-base">/100</span></p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${recConfig.className}`}>
              {recConfig.label}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={!supplierId || saving}
            className="px-5 py-2 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Gespeichert' : saving ? 'Speichere…' : 'Bewertung speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
