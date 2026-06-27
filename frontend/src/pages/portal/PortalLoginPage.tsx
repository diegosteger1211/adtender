import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { portalApi, storePortalToken, storePortalPsId } from '../../lib/portalApi'

export default function PortalLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await portalApi.post<{
        token: string
        user: { id: string; email: string; name: string }
        projects: { project_supplier_id: string }[]
      }>('/api/portal/login', { email: email.trim().toLowerCase(), password })

      storePortalToken(res.token)
      // Navigate to first project or dashboard
      if (res.projects.length === 1) {
        storePortalPsId(res.projects[0].project_supplier_id)
        navigate(`/portal/projekte/${res.projects[0].project_supplier_id}`)
      } else {
        navigate('/portal/dashboard')
      }
    } catch {
      setError('E-Mail oder Passwort ungültig.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-semibold text-xl">adtender</span>
        </div>

        <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-white font-bold text-xl mb-1">Anbieter-Portal</h1>
            <p className="text-gray-400 text-sm">Melden Sie sich mit Ihrem Anbieter-Konto an.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">E-Mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@unternehmen.de"
                className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Passwort</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-500" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
