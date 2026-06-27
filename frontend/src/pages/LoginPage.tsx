import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { storeUser } from '../lib/auth'
import { api, storeToken } from '../lib/api'
import type { Role } from '../types'

const ROLE_HINTS: { email: string; role: string; color: string }[] = [
  { email: 'admin@adtender.de', role: 'Administrator', color: 'text-purple-400' },
  { email: 'berater@adtender.de', role: 'Berater', color: 'text-blue-400' },
  { email: 'kunde@adtender.de', role: 'Kunde', color: 'text-emerald-400' },
  { email: 'anbieter@adtender.de', role: 'Anbieter', color: 'text-orange-400' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name: string; role: Role; tenantId: string } }>(
        '/api/auth/login',
        { email: email.trim().toLowerCase(), password }
      )
      storeToken(res.token)
      storeUser(res.user)
      navigate('/dashboard')
    } catch (err) {
      setError('E-Mail oder Passwort ungültig.')
    }
    setLoading(false)
  }

  function quickLogin(role: Role) {
    const emails: Record<Role, string> = {
      admin: 'admin@adtender.de',
      berater: 'berater@adtender.de',
      kunde: 'kunde@adtender.de',
      anbieter: 'anbieter@adtender.de',
    }
    setEmail(emails[role])
    setPassword('demo1234')
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)',
          }}
        />
        {/* Logo */}
        <div className="relative z-10">
          <img src="/adtender-logo.png" alt="adtender" className="h-16 w-auto object-contain" />
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Ausschreibungen.<br />
            <span className="text-brand-400">Professionell.</span><br />
            Digital.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Die moderne Plattform für strukturierte Softwareauswahl — von der Anforderungserhebung bis zur Entscheidung.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {[
              'Strukturierte Anforderungskataloge',
              'Anbieter-Portal mit Finanzdaten',
              'Transparentes Bewertungs-Ranking',
              'Vollständige Dokumentation',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-600 text-sm">© 2026 adesso SE · adtender Platform</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <img src="/adtender-logo.png" alt="adtender" className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Willkommen zurück</h2>
            <p className="text-gray-400">Melden Sie sich mit Ihrem Konto an.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@unternehmen.de"
                required
                className="w-full bg-[#1A1F2E] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#1A1F2E] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Anmelden
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-8 pt-6 border-t border-[#1E2433]">
            <p className="text-xs text-gray-500 mb-3 text-center">Demo-Zugänge (Passwort: demo1234)</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_HINTS.map(h => (
                <button
                  key={h.role}
                  onClick={() => quickLogin(h.role.toLowerCase() as Role)}
                  className="bg-[#1A1F2E] hover:bg-[#222940] border border-[#2A3040] rounded-lg px-3 py-2 text-left transition-colors group"
                >
                  <span className={`text-xs font-medium ${h.color}`}>{h.role}</span>
                  <p className="text-[11px] text-gray-600 mt-0.5 truncate">{h.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
