import { ArrowRight, Clock, CheckCircle2, AlertCircle, TrendingUp, Users, FileText, Calendar } from 'lucide-react'
import { getStoredUser } from '../lib/auth'
import { getRoleLabel } from '../lib/auth'

const STATS = [
  { label: 'Aktive Projekte', value: '3', icon: <FileText size={18} />, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Offene Aufgaben', value: '12', icon: <Clock size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Anbieter eingeladen', value: '8', icon: <Users size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Nächster Termin', value: '3 Tage', icon: <Calendar size={18} />, color: 'text-purple-500', bg: 'bg-purple-50' },
]

const PROJECTS = [
  {
    id: '1',
    name: 'MES-Auswahl Kaufland Fleisch',
    category: 'Manufacturing Execution System',
    phase: 'Anforderungen',
    phaseColor: 'bg-blue-100 text-blue-700',
    progress: 35,
    deadline: '15.08.2026',
    suppliers: 8,
    status: 'active',
  },
  {
    id: '2',
    name: 'ERP-Modernisierung HOPPE AG',
    category: 'Enterprise Resource Planning',
    phase: 'Bewertung',
    phaseColor: 'bg-purple-100 text-purple-700',
    progress: 68,
    deadline: '30.07.2026',
    suppliers: 5,
    status: 'active',
  },
  {
    id: '3',
    name: 'CRM-Einführung Mustermann GmbH',
    category: 'Customer Relationship Management',
    phase: 'Entscheidung',
    phaseColor: 'bg-emerald-100 text-emerald-700',
    progress: 90,
    deadline: '10.07.2026',
    suppliers: 3,
    status: 'active',
  },
]

const TASKS = [
  { text: 'Anforderungen für MES-Auswahl validieren', project: 'Kaufland Fleisch', due: 'Heute', urgent: true },
  { text: 'Anbieter GRÜN GQM einladen', project: 'Kaufland Fleisch', due: 'Morgen', urgent: false },
  { text: 'Bewertungsbogen für HOPPE AG ausfüllen', project: 'HOPPE AG', due: '03.07.2026', urgent: false },
  { text: 'Entscheidungsdokument finalisieren', project: 'Mustermann GmbH', due: '05.07.2026', urgent: false },
]

export default function DashboardPage() {
  const user = getStoredUser()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {getRoleLabel(user?.role ?? 'berater')} · Hier ist Ihr aktueller Überblick.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color} flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Laufende Projekte</h2>
            <button className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium">
              Alle ansehen <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {PROJECTS.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-gray-200 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${p.phaseColor}`}>
                    {p.phase}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Fortschritt</span>
                    <span className="text-xs font-medium text-gray-600">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={11} /> {p.suppliers} Anbieter</span>
                  <span className="flex items-center gap-1"><Calendar size={11} /> {p.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Aufgaben</h2>
            <button className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium">
              Alle <ArrowRight size={12} />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {TASKS.map((t, i) => (
              <div key={i} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {t.urgent
                    ? <AlertCircle size={15} className="text-amber-500" />
                    : <CheckCircle2 size={15} className="text-gray-300" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{t.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{t.project}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className={`text-[11px] font-medium ${t.urgent ? 'text-amber-500' : 'text-gray-400'}`}>{t.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="mt-4 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">Woche im Überblick</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Anforderungen erfasst</span>
                <span className="font-semibold">47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Anbieter bewertet</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Q&A beantwortet</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
