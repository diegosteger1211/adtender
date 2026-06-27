import { useState, useEffect } from 'react'
import { Building2, Plus, Search, Globe, Phone, MapPin, Loader2, X } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { Supplier } from '../types'

type SupplierForm = {
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  address_street: string
  address_city: string
  address_zip: string
  address_country: string
  description: string
  website: string
}

const EMPTY_FORM: SupplierForm = {
  company_name: '', contact_name: '', contact_email: '', contact_phone: '',
  address_street: '', address_city: '', address_zip: '', address_country: 'Deutschland',
  description: '', website: '',
}

export default function AnbieterPage() {
  const user = getStoredUser()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM)

  useEffect(() => { loadSuppliers() }, [])

  async function loadSuppliers() {
    try {
      const res = await api.get<{ suppliers: Supplier[] }>('/api/suppliers')
      setSuppliers(res.suppliers)
    } finally {
      setLoading(false)
    }
  }

  async function createSupplier(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/api/suppliers', form)
      setShowModal(false)
      setForm(EMPTY_FORM)
      await loadSuppliers()
    } finally {
      setCreating(false)
    }
  }

  const canCreate = user?.role === 'admin' || user?.role === 'berater'

  const filtered = suppliers.filter(s =>
    search === '' ||
    s.company_name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Anbieter-Datenbank</h1>
          <p className="text-gray-400 mt-1 text-sm">Projektübergreifendes Anbieter-Verzeichnis · {suppliers.length} Anbieter</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Anbieter anlegen
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Anbieter suchen..."
          className="w-full bg-[#141720] border border-[#1E2433] text-white placeholder-gray-600 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-300 font-medium mb-2">
            {search ? 'Keine Ergebnisse' : 'Noch keine Anbieter'}
          </h3>
          <p className="text-gray-500 text-sm">
            {search ? `Keine Anbieter für "${search}" gefunden.` : 'Legen Sie Ihren ersten Anbieter an.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-[#141720] border border-[#1E2433] hover:border-[#2A3347] rounded-xl p-5 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-brand-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{s.company_name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{s.contact_name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <a href={`mailto:${s.contact_email}`} className="text-brand-400 text-xs hover:underline block truncate">
                  {s.contact_email}
                </a>
                {s.contact_phone && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Phone size={11} />
                    {s.contact_phone}
                  </div>
                )}
                {s.address_city && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <MapPin size={11} />
                    {s.address_zip && `${s.address_zip} `}{s.address_city}
                  </div>
                )}
                {s.website && (
                  <a href={s.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-gray-300 transition-colors">
                    <Globe size={11} />
                    <span className="truncate">{s.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              {s.description && (
                <p className="text-gray-500 text-xs mt-3 line-clamp-2 leading-relaxed">{s.description}</p>
              )}

              <div className="mt-3 pt-3 border-t border-[#1E2433] flex items-center justify-between">
                <span className="text-gray-600 text-xs">{s.project_count ?? 0} Projekte</span>
                <span className="text-gray-600 text-xs">{new Date(s.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold text-lg">Anbieter anlegen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Unternehmensname *</label>
                  <input type="text" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Ansprechpartner *</label>
                  <input type="text" required value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">E-Mail *</label>
                  <input type="email" required value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Telefon</label>
                  <input type="tel" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Website</label>
                  <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Straße</label>
                  <input type="text" value={form.address_street} onChange={e => setForm(f => ({ ...f, address_street: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">PLZ</label>
                  <input type="text" value={form.address_zip} onChange={e => setForm(f => ({ ...f, address_zip: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Stadt</label>
                  <input type="text" value={form.address_city} onChange={e => setForm(f => ({ ...f, address_city: e.target.value }))}
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Beschreibung</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Kurzbeschreibung des Anbieters..."
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  Abbrechen
                </button>
                <button type="submit" disabled={creating || !form.company_name || !form.contact_name || !form.contact_email}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Anbieter anlegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
