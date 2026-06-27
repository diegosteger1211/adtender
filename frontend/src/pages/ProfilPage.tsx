import { useState, useEffect } from 'react'
import { Loader2, Save, KeyRound, Building2, User } from 'lucide-react'
import { api } from '../lib/api'
import { getStoredUser, storeUser } from '../lib/auth'

type ProfileData = {
  email: string; name: string
  first_name: string | null; last_name: string | null; phone: string | null
}
type OrgData = {
  name: string; address: string | null; city: string | null
  postal_code: string | null; country: string | null; org_phone: string | null; org_email: string | null
}

export default function ProfilPage() {
  const currentUser = getStoredUser()
  const isAdmin = currentUser?.role === 'admin'

  const [loading, setLoading] = useState(true)

  // Profile form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Org form
  const [orgName, setOrgName] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgCity, setOrgCity] = useState('')
  const [orgPostal, setOrgPostal] = useState('')
  const [orgCountry, setOrgCountry] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [savingOrg, setSavingOrg] = useState(false)
  const [orgMsg, setOrgMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    api.get<{ user: ProfileData; organisation: OrgData }>('/api/profile/me').then(res => {
      setFirstName(res.user.first_name ?? '')
      setLastName(res.user.last_name ?? '')
      setPhone(res.user.phone ?? '')
      setEmail(res.user.email)

      if (res.organisation) {
        setOrgName(res.organisation.name ?? '')
        setOrgAddress(res.organisation.address ?? '')
        setOrgCity(res.organisation.city ?? '')
        setOrgPostal(res.organisation.postal_code ?? '')
        setOrgCountry(res.organisation.country ?? '')
        setOrgPhone(res.organisation.org_phone ?? '')
        setOrgEmail(res.organisation.org_email ?? '')
      }
    }).finally(() => setLoading(false))
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      await api.put('/api/profile/me', { first_name: firstName, last_name: lastName, phone, email })
      setProfileMsg({ ok: true, text: 'Profil gespeichert.' })
      // Update stored user name
      if (currentUser) {
        const name = [firstName, lastName].filter(Boolean).join(' ') || currentUser.name
        storeUser({ ...currentUser, name, email })
      }
    } catch (err) {
      setProfileMsg({ ok: false, text: (err as Error).message || 'Fehler beim Speichern.' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: 'Passwörter stimmen nicht überein.' }); return }
    if (newPw.length < 8) { setPwMsg({ ok: false, text: 'Mindestens 8 Zeichen erforderlich.' }); return }
    setSavingPw(true)
    setPwMsg(null)
    try {
      await api.put('/api/profile/me/password', { current_password: currentPw, new_password: newPw })
      setPwMsg({ ok: true, text: 'Passwort wurde geändert.' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message || 'Fehler beim Ändern.' })
    } finally {
      setSavingPw(false)
    }
  }

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    setSavingOrg(true)
    setOrgMsg(null)
    try {
      await api.put('/api/profile/organisation', {
        name: orgName, address: orgAddress, city: orgCity,
        postal_code: orgPostal, country: orgCountry, org_phone: orgPhone, org_email: orgEmail,
      })
      setOrgMsg({ ok: true, text: 'Organisation gespeichert.' })
    } catch (err) {
      setOrgMsg({ ok: false, text: (err as Error).message || 'Fehler beim Speichern.' })
    } finally {
      setSavingOrg(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-gray-500" size={24} /></div>
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mein Profil</h1>
        <p className="text-gray-500 text-sm">Persönliche Daten und Einstellungen verwalten.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">

          {/* Account section */}
          <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={16} className="text-brand-400" />
              <h2 className="text-white font-semibold">Ihr Konto</h2>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Vorname</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Hier eingeben ..."
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Nachname</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Hier eingeben ..."
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Hier eingeben ..."
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {profileMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg border ${profileMsg.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {profileMsg.text}
                </p>
              )}

              <button type="submit" disabled={savingProfile}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Bearbeiten
              </button>
            </form>
          </div>

          {/* Password section */}
          <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound size={16} className="text-brand-400" />
              <h2 className="text-white font-semibold">Passwort zurücksetzen</h2>
            </div>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Bestehendes Passwort</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Hier eingeben ..."
                  required
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Neues Passwort</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  required
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Neues Passwort bestätigen</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Hier eingeben ..."
                  required
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {pwMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg border ${pwMsg.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {pwMsg.text}
                </p>
              )}

              <button type="submit" disabled={savingPw}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Bearbeiten
              </button>
            </form>
          </div>
        </div>

        {/* Right column — Organisation */}
        <div>
          <div className="bg-[#141720] border border-[#1E2433] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-brand-400" />
              <h2 className="text-white font-semibold">Ihre Organisation</h2>
            </div>
            {!isAdmin && (
              <p className="text-gray-600 text-xs mb-5">Nur Administratoren können Organisationsdaten bearbeiten.</p>
            )}
            {isAdmin && <div className="mb-5" />}
            <form onSubmit={saveOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Firmenname</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={e => setOrgAddress(e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Straße"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={orgCity}
                    onChange={e => setOrgCity(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Stadt"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={orgPostal}
                    onChange={e => setOrgPostal(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Postleitzahl"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  value={orgCountry}
                  onChange={e => setOrgCountry(e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Land"
                  className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="pt-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Kontakt</label>
                <div className="space-y-3">
                  <input
                    type="tel"
                    value={orgPhone}
                    onChange={e => setOrgPhone(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Telefon"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="email"
                    value={orgEmail}
                    onChange={e => setOrgEmail(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="E-Mail"
                    className="w-full bg-[#0F1117] border border-[#2A3040] text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {orgMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg border ${orgMsg.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {orgMsg.text}
                </p>
              )}

              {isAdmin && (
                <button type="submit" disabled={savingOrg}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {savingOrg ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Bearbeiten
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
