import { useState, useEffect } from 'react'
import { Plus, Shield, Briefcase, Building2, User, Loader2, X, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser } from '../lib/auth'
import type { User as AppUser } from '../types'

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: 'Administrator', icon: <Shield size={14} />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  berater: { label: 'Berater', icon: <Briefcase size={14} />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  kunde: { label: 'Kunde', icon: <Building2 size={14} />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  anbieter: { label: 'Anbieter', icon: <User size={14} />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
}

type CreateForm = { email: string; name: string; role: string; password: string }

export default function BenutzerPage() {
  const currentUser = getStoredUser()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<CreateForm>({ email: '', name: '', role: 'berater', password: '' })
  const [createError, setCreateError] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try {
      const res = await api.get<{ users: AppUser[] }>('/api/users')
      setUsers(res.users)
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      await api.post('/api/users', form)
      setShowModal(false)
      setForm({ email: '', name: '', role: 'berater', password: '' })
      await loadUsers()
    } catch (err) {
      setCreateError((err as Error).message || 'Fehler beim Anlegen.')
    } finally {
      setCreating(false)
    }
  }

  const isAdmin = currentUser?.role === 'admin'

  // group by role
  const grouped = ['admin', 'berater', 'kunde', 'anbieter'].reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role)
    return acc
  }, {} as Record<string, AppUser[]>)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Benutzerverwaltung</h1>
          <p className="text-gray-400 mt-1 text-sm">{users.length} Benutzer · Rollen und Zugänge verwalten</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Benutzer anlegen
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const roleUsers = grouped[role] ?? []
            if (roleUsers.length === 0) return null
            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </span>
                  <span className="text-gray-600 text-xs">{roleUsers.length}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {roleUsers.map(u => (
                    <div key={u.id} className="bg-[#141720] border border-[#1E2433] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{u.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{u.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {u.is_active !== 0 ? (
                            <CheckCircle size={14} className="text-emerald-400" />
                          ) : (
                            <XCircle size={14} className="text-gray-600" />
                          )}
                        </div>
                      </div>
                      {u.created_at && (
                        <p className="text-gray-600 text-xs mt-3">
                          Seit {new Date(u.created_at).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141720] border border-[#1E2433] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2433]">
              <h2 className="text-white font-semibold text-lg">Benutzer anlegen</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">E-Mail *</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Rolle *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500">
                  <option value="admin">Administrator</option>
                  <option value="berater">Berater</option>
                  <option value="kunde">Kunde</option>
                  <option value="anbieter">Anbieter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Initiales Passwort *</label>
                <input type="password" required minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
              </div>

              {createError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-xs">{createError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#1E2433] hover:bg-[#252D42] text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  Abbrechen
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Anlegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
