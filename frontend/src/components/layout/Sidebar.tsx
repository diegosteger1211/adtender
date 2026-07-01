import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FolderOpen, CheckSquare, ListTodo, FileText, Film, Package,
  FileSignature, Zap, LayoutDashboard, BarChart3, MessageSquare,
  Bell, Calendar, HelpCircle, Settings, Users, Building2,
  LogOut, ChevronDown, ChevronRight, Briefcase,
} from 'lucide-react'
import { clsx } from 'clsx'
import { clearUser, getRoleLabel, getRoleColor } from '../../lib/auth'
import type { User, Role } from '../../types'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
  roles: Role[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Projekt',
    roles: ['admin', 'berater', 'kunde'],
    items: [
      { label: 'Projekte', path: '/projekte', icon: <FolderOpen size={16} /> },
      { label: 'Checkliste', path: '/checkliste', icon: <CheckSquare size={16} /> },
      { label: 'Aufgabenliste', path: '/aufgaben', icon: <ListTodo size={16} /> },
    ],
  },
  {
    label: 'Workspace',
    roles: ['admin', 'berater', 'kunde', 'anbieter'],
    items: [
      { label: 'Anforderungen', path: '/anforderungen', icon: <FileText size={16} /> },
      { label: 'Szenarien', path: '/szenarien', icon: <Briefcase size={16} /> },
      { label: 'Präsentationen', path: '/praesentationen', icon: <Film size={16} /> },
      { label: 'Angebot', path: '/angebot', icon: <Package size={16} /> },
      { label: 'Vertrag', path: '/vertrag', icon: <FileSignature size={16} /> },
      { label: 'Apps', path: '/apps', icon: <Zap size={16} /> },
    ],
  },
  {
    label: 'Auswertung',
    roles: ['admin', 'berater', 'kunde'],
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
      { label: 'Ranking', path: '/ranking', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    label: 'Kommunikation',
    roles: ['admin', 'berater', 'kunde', 'anbieter'],
    items: [
      { label: 'Q&A', path: '/qa', icon: <MessageSquare size={16} /> },
      { label: 'Nachrichten', path: '/nachrichten', icon: <Bell size={16} /> },
      { label: 'Termine', path: '/termine', icon: <Calendar size={16} /> },
    ],
  },
  {
    label: 'Hilfe',
    roles: ['admin', 'berater', 'kunde', 'anbieter'],
    items: [
      { label: 'Benutzerhandbuch', path: '/hilfe', icon: <HelpCircle size={16} /> },
    ],
  },
  {
    label: 'System',
    roles: ['admin'],
    items: [
      { label: 'Projekte verwalten', path: '/system/projekte', icon: <FolderOpen size={16} /> },
      { label: 'Einstellungen', path: '/system/einstellungen', icon: <Settings size={16} /> },
      { label: 'Benutzer anlegen', path: '/system/benutzer', icon: <Users size={16} /> },
      { label: 'Anbieter anlegen', path: '/system/anbieter', icon: <Building2 size={16} /> },
    ],
  },
]

function getVisibleGroups(role: Role): NavGroup[] {
  return NAV_GROUPS.filter(g => g.roles.includes(role)).map(g => ({
    ...g,
    items: g.items.filter(item => {
      if (role === 'anbieter') {
        const allowed = ['/anforderungen', '/angebot', '/qa', '/nachrichten', '/termine', '/hilfe', '/apps']
        return allowed.includes(item.path)
      }
      if (role === 'kunde') {
        const hidden = ['/system/projekte', '/system/einstellungen', '/system/benutzer', '/system/anbieter']
        return !hidden.includes(item.path)
      }
      return true
    }),
  })).filter(g => g.items.length > 0)
}

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const groups = getVisibleGroups(user.role)

  function toggleGroup(label: string) {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  function handleLogout() {
    clearUser()
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[#006EC7] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/20">
        <img src="/adesso-logo.png" alt="adtender" className="h-20 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map(group => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-2 py-1.5 mb-0.5 group"
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                {group.label}
              </span>
              {collapsed[group.label]
                ? <ChevronRight size={12} className="text-white/50" />
                : <ChevronDown size={12} className="text-white/50" />
              }
            </button>

            {!collapsed[group.label] && (
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100',
                        isActive
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      )
                    }
                  >
                    <span className="flex-shrink-0 opacity-75">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-white/20">
        <button
          onClick={() => navigate('/profil')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', getRoleColor(user.role))}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </button>
        <button
          onClick={handleLogout}
          title="Abmelden"
          className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-xs transition-colors"
        >
          <LogOut size={13} />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
