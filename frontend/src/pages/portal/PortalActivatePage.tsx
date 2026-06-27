import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { portalApi, storePortalToken, storePortalPsId } from '../../lib/portalApi'

type TokenInfo = {
  valid: boolean; hasAccount: boolean
  company_name: string; contact_name: string
  contact_email: string; project_title: string
}

export default function PortalActivatePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [info, setInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    portalApi.get<TokenInfo>(`/api/portal/activate/${token}`)
      .then(res => setInfo(res))
      .catch(() => setError('Dieser Einladungslink ist ungültig oder abgelaufen.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== password2) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen lang sein.'); return }
    setError('')
    setSubmitting(true)

    try {
      const res = await portalApi.post<{ token: string; project_supplier_id: string }>(
        `/api/portal/activate/${token}`,
        { password }
      )
      storePortalToken(res.token)
      storePortalPsId(res.project_supplier_id)
      setDone(true)
      setTimeout(() => navigate(`/portal/projekte/${res.project_supplier_id}`), 1500)
    } catch (err) {
      setError((err as Error).message || 'Aktivierung fehlgeschlagen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-semibold text-xl">adtender</span>
        </div>

        <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-gray-500" size={24} />
            </div>
          ) : error && !info ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">!</span>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-white font-semibold text-lg mb-2">Konto aktiviert</h2>
              <p className="text-gray-400 text-sm">Sie werden weitergeleitet...</p>
            </div>
          ) : info ? (
            <>
              <div className="mb-6">
                <h1 className="text-white font-bold text-xl mb-1">Einladung annehmen</h1>
                <p className="text-gray-400 text-sm">Sie wurden zur folgenden Ausschreibung eingeladen:</p>
              </div>

              <div className="bg-[#0F1117] border border-[#1E2433] rounded-xl p-4 mb-6">
                <p className="text-white font-semibold text-sm">{info.project_title}</p>
                <p className="text-gray-500 text-xs mt-1">{info.company_name} · {info.contact_name}</p>
                <p className="text-gray-600 text-xs mt-0.5">{info.contact_email}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    {info.hasAccount ? 'Neues Passwort festlegen' : 'Passwort festlegen'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mindestens 8 Zeichen"
                      required
                      className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-500"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Passwort bestätigen</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="Passwort wiederholen"
                    required
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Konto aktivieren & starten'}
                </button>
              </form>
            </>
          ) : null}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Bereits ein Konto? <button onClick={() => navigate('/portal/login')} className="text-brand-400 hover:underline">Anmelden</button>
        </p>
      </div>
    </div>
  )
}
